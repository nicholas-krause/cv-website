import { Injectable, signal } from '@angular/core';

export interface DinoKnobs {
  populationSize: number;
  weightMutateRate: number;
  connAddProb: number;
  speciationThreshold: number;
  elitism: number;
  seed: number;
  birdsEnabled: boolean;
}

export const DEFAULT_DINO_KNOBS: DinoKnobs = {
  populationSize: 100,
  weightMutateRate: 0.8,
  connAddProb: 0.5,
  speciationThreshold: 3.0,
  elitism: 2,
  seed: 42,
  birdsEnabled: true,
};

const KNOBS_STORAGE_KEY = 'dino-neat-knobs:v1';

export type DinoCactusSize = 'small' | 'large';

export type DinoCactusState = {
  x: number;
  y: number;
  width: number;
  height: number;
  size: DinoCactusSize;
  variant: number;
};

export type DinoState = {
  x: number;
  y: number;
  width: number;
  height: number;
  jumping: boolean;
  ducking: boolean;
};

export type DinoBirdState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DinoHistoryEntry = {
  generation: number;
  best_fitness: number;
  avg_fitness: number;
  species_count?: number;
  score?: number;
};

export type DinoFrameState = {
  generation: number;
  alive: number;
  score: number;
  done: boolean;
  nearest_cactus_index: number | null;
  nearest_bird_index: number | null;
  base: { left: number; right: number; y: number };
  dinos: DinoState[];
  cacti: DinoCactusState[];
  birds: DinoBirdState[];
  latest_history: DinoHistoryEntry | null;
  history: DinoHistoryEntry[];
};

type PyodideApi = {
  runPython(code: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
  loadPackage(name: string): Promise<void>;
  FS: { writeFile(path: string, data: string): void };
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideApi>;
  }
}

@Injectable({ providedIn: 'root' })
export class DinoSimService {
  readonly loading = signal(false);
  readonly ready = signal(false);
  readonly running = signal(false);
  readonly error = signal<string | null>(null);
  readonly frame = signal<DinoFrameState | null>(null);
  // Knobs persisted from the form. Take effect on the next restart() / init();
  // the in-flight simulation keeps using whatever was committed last.
  readonly appliedKnobs = signal<DinoKnobs>(loadKnobs());
  // Snapshot of the knobs the currently-running simulation was built with. Updated
  // inside bootstrapSimulation() so the UI can tell when `appliedKnobs` has been
  // saved but not yet picked up by the sim (a restart is needed).
  readonly runningKnobs = signal<DinoKnobs | null>(null);
  // Live (render-loop) controls. These are NOT persisted as knobs - they only
  // affect playback, not the underlying NEAT/sim contract.
  readonly stepsPerFrame = signal<number>(1);
  readonly visionLinesEnabled = signal<boolean>(false);

  private pyodide: PyodideApi | null = null;
  private rafId: number | null = null;
  private readonly pyFiles = ['background.py', 'bird.py', 'cactus.py', 'dino.py', 'simulation.py'];
  private readonly pyRoot = '/tmp';
  private readonly fps = 60;
  // Hard cap to keep stepGeneration() from running away in pathological states.
  private readonly stepGenerationFrameCap = 50_000;

  async init(): Promise<void> {
    if (this.ready() || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.ensurePyodideScript();
      this.pyodide = await window.loadPyodide!({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
      });
      await this.pyodide.loadPackage('micropip');
      await this.pyodide.runPythonAsync(`
import micropip
await micropip.install("neat-python")
      `);
      await this.loadPythonAssets();
      await this.bootstrapSimulation(this.appliedKnobs());
      this.ready.set(true);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to initialize simulation');
    } finally {
      this.loading.set(false);
    }
  }

  async restart(): Promise<void> {
    if (!this.pyodide) return;
    this.stop();
    await this.bootstrapSimulation(this.appliedKnobs());
    this.frame.set(this.readFrame());
    this.start();
  }

  /**
   * Persist the new knob values as the next-restart preset. Does NOT touch the
   * in-flight simulation: the user must click Restart for the new values to
   * take effect.
   */
  applyKnobs(knobs: DinoKnobs): void {
    const normalized = normalizeKnobs(knobs);
    saveKnobs(normalized);
    this.appliedKnobs.set(normalized);
  }

  start(): void {
    if (!this.pyodide || this.running()) return;
    this.running.set(true);
    let lastTick = 0;
    const tick = (time: number) => {
      if (!this.running()) return;
      if (time - lastTick >= 1000 / this.fps) {
        lastTick = time;
        // Batch N sim steps per animation frame for fast-forward. We only push
        // the LAST stepped frame to the UI so renders don't pile up.
        const batch = Math.max(1, Math.floor(this.stepsPerFrame()));
        let last: DinoFrameState | null = null;
        for (let i = 0; i < batch; i++) {
          last = this.readFrame();
          if (last.done) break;
        }
        if (last) this.frame.set(last);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running.set(false);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setStepsPerFrame(value: number): void {
    const n = Number.isFinite(value) ? Math.round(value) : 1;
    this.stepsPerFrame.set(Math.min(64, Math.max(1, n)));
  }

  setVisionLinesEnabled(value: boolean): void {
    this.visionLinesEnabled.set(Boolean(value));
  }

  /**
   * Advance the simulation until the generation counter increments (or the run
   * ends), then leave playback paused. Useful when the user wants to inspect a
   * single generation transition without watching it play out.
   */
  async stepGeneration(): Promise<void> {
    if (!this.pyodide) return;
    this.stop();
    const startGen = this.frame()?.generation ?? null;
    let last: DinoFrameState | null = null;
    for (let i = 0; i < this.stepGenerationFrameCap; i++) {
      last = this.readFrame();
      if (last.done) break;
      if (startGen === null || last.generation !== startGen) break;
    }
    if (last) this.frame.set(last);
  }

  private readFrame(): DinoFrameState {
    if (!this.pyodide) throw new Error('Pyodide not ready');
    const raw = this.pyodide.runPython(`
import json
json.dumps(sim.step())
    `);
    return JSON.parse(String(raw)) as DinoFrameState;
  }

  private async loadPythonAssets(): Promise<void> {
    if (!this.pyodide) return;
    for (const name of this.pyFiles) {
      const text = await fetch(`/assets/dino/py/${name}`).then((r) => r.text());
      this.pyodide.FS.writeFile(`${this.pyRoot}/${name}`, text);
    }
    const configText = await fetch('/assets/dino/py/configuration_FF.txt').then((r) => r.text());
    this.pyodide.FS.writeFile(`${this.pyRoot}/configuration_FF.txt`, configText);
  }

  private async bootstrapSimulation(knobs: DinoKnobs): Promise<void> {
    if (!this.pyodide) return;
    const birdsPy = knobs.birdsEnabled ? 'True' : 'False';
    await this.pyodide.runPythonAsync(`
import sys
import neat
sys.path.insert(0, "${this.pyRoot}")
from simulation import Simulation, SimulationParams

config = neat.config.Config(
    neat.DefaultGenome,
    neat.DefaultReproduction,
    neat.DefaultSpeciesSet,
    neat.DefaultStagnation,
    "${this.pyRoot}/configuration_FF.txt"
)
config.pop_size = ${knobs.populationSize}
config.genome_config.weight_mutate_rate = ${knobs.weightMutateRate}
config.genome_config.conn_add_prob = ${knobs.connAddProb}
config.species_set_config.compatibility_threshold = ${knobs.speciationThreshold}
config.reproduction_config.elitism = ${knobs.elitism}
params = SimulationParams(
    max_generations=20,
    start_velocity=9.5,
    accel_per_second=0.38,
    max_velocity=21.5,
    bird_spawn_interval=280,
    birds_enabled=${birdsPy},
    seed=${knobs.seed},
)
sim = Simulation(config, params)
    `);
    this.runningKnobs.set(knobs);
  }

  private ensurePyodideScript(): Promise<void> {
    if (window.loadPyodide) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide script')), {
          once: true,
        });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
      script.async = true;
      script.dataset['pyodide'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Pyodide script'));
      document.head.appendChild(script);
    });
  }
}

function loadKnobs(): DinoKnobs {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_DINO_KNOBS };
  }
  try {
    const raw = window.localStorage.getItem(KNOBS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DINO_KNOBS };
    const parsed = JSON.parse(raw) as Partial<DinoKnobs>;
    return normalizeKnobs({ ...DEFAULT_DINO_KNOBS, ...parsed });
  } catch {
    return { ...DEFAULT_DINO_KNOBS };
  }
}

function saveKnobs(knobs: DinoKnobs): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(KNOBS_STORAGE_KEY, JSON.stringify(knobs));
  } catch {
    // Storage may be full or disabled; persistence is best-effort.
  }
}

function normalizeKnobs(knobs: DinoKnobs): DinoKnobs {
  return {
    populationSize: clampInt(knobs.populationSize, 10, 300, DEFAULT_DINO_KNOBS.populationSize),
    weightMutateRate: clampFloat(knobs.weightMutateRate, 0, 1, DEFAULT_DINO_KNOBS.weightMutateRate),
    connAddProb: clampFloat(knobs.connAddProb, 0, 1, DEFAULT_DINO_KNOBS.connAddProb),
    speciationThreshold: clampFloat(
      knobs.speciationThreshold,
      0.5,
      10,
      DEFAULT_DINO_KNOBS.speciationThreshold,
    ),
    elitism: clampInt(knobs.elitism, 0, 10, DEFAULT_DINO_KNOBS.elitism),
    seed: clampInt(knobs.seed, 0, 2_147_483_647, DEFAULT_DINO_KNOBS.seed),
    birdsEnabled: typeof knobs.birdsEnabled === 'boolean' ? knobs.birdsEnabled : DEFAULT_DINO_KNOBS.birdsEnabled,
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

function clampFloat(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
}
