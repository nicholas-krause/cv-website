import { Injectable, signal } from '@angular/core';

type DinoFrameState = {
  generation: number;
  alive: number;
  score: number;
  done: boolean;
  nearest_cactus_index: number | null;
  nearest_bird_index: number | null;
  base: { left: number; right: number; y: number };
  dinos: Array<{ x: number; y: number; width: number; height: number }>;
  cacti: Array<{ x: number; y: number; width: number; height: number }>;
  birds: Array<{ x: number; y: number; width: number; height: number }>;
  history: Array<{ generation: number; best_fitness: number; avg_fitness: number }>;
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

  private pyodide: PyodideApi | null = null;
  private rafId: number | null = null;
  private readonly pyFiles = ['background.py', 'bird.py', 'cactus.py', 'dino.py', 'simulation.py'];
  private readonly pyRoot = '/tmp';
  private readonly fps = 60;

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
      await this.bootstrapSimulation();
      this.ready.set(true);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to initialize simulation');
    } finally {
      this.loading.set(false);
    }
  }

  async restart(): Promise<void> {
    if (!this.pyodide) return;
    await this.bootstrapSimulation();
    this.frame.set(this.readFrame());
  }

  start(): void {
    if (!this.pyodide || this.running()) return;
    this.running.set(true);
    let lastTick = 0;
    const tick = (time: number) => {
      if (!this.running()) return;
      if (time - lastTick >= 1000 / this.fps) {
        lastTick = time;
        this.frame.set(this.readFrame());
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

  private async bootstrapSimulation(): Promise<void> {
    if (!this.pyodide) return;
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
params = SimulationParams(max_generations=20, seed=42)
sim = Simulation(config, params)
    `);
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
