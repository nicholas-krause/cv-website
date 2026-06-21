import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, ViewChild, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DinoBirdState,
  DinoCactusState,
  DinoFrameState,
  DinoSimService,
  DinoState,
} from '../../services/dino-sim.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { DinoControlsComponent } from './dino-controls.component';
import { DinoLiveControlsComponent } from './dino-live-controls.component';

type SpriteKey =
  | 'dinoRun01'
  | 'dinoRun02'
  | 'dinoDuck01'
  | 'dinoDuck02'
  | 'dinoIdle'
  | 'bird01'
  | 'bird02'
  | 'ground'
  | 'cactusSmallSingle'
  | 'cactusSmallDouble'
  | 'cactusSmallTriple'
  | 'cactusLargeSingle'
  | 'cactusLargeDouble'
  | 'cactusLargeTriple';

const SPRITE_SOURCES: Record<SpriteKey, string> = {
  dinoRun01: 'assets/dino/sprites/Dino_Run01.png',
  dinoRun02: 'assets/dino/sprites/Dino_Run02.png',
  dinoDuck01: 'assets/dino/sprites/Dino_Duck01.png',
  dinoDuck02: 'assets/dino/sprites/Dino_Duck02.png',
  dinoIdle: 'assets/dino/sprites/Dino_Idle.png',
  bird01: 'assets/dino/sprites/Bird_01.png',
  bird02: 'assets/dino/sprites/Bird_02.png',
  ground: 'assets/dino/sprites/Ground.png',
  cactusSmallSingle: 'assets/dino/sprites/Cactus_Small_Single.png',
  cactusSmallDouble: 'assets/dino/sprites/Cactus_Small_Double.png',
  cactusSmallTriple: 'assets/dino/sprites/Cactus_Small_Triple.png',
  cactusLargeSingle: 'assets/dino/sprites/Cactus_Large_Single.png',
  cactusLargeDouble: 'assets/dino/sprites/Cactus_Large_Double.png',
  cactusLargeTriple: 'assets/dino/sprites/Cactus_Large_Triple.png',
};

// Cadence for animation frames (lower = faster cycling).
const DINO_FRAME_INTERVAL_MS = 90;
const BIRD_FRAME_INTERVAL_MS = 180;

// Per-sprite intrinsic drawing sizes (px). Anchored at bottom-center for dino/bird,
// bottom-left for cacti so they line up with the simulation's AABB anchor.
const DINO_RUN_SIZE = { w: 88, h: 94 };
const DINO_DUCK_SIZE = { w: 118, h: 60 };
const BIRD_SIZE = { w: 92, h: 60 };
const GROUND_TILE = { w: 2400, h: 96 };

// Vertical offset (within the Ground.png texture) of the visible horizontal ground
// line. Measured from the actual sprite pixels - the line lives at rows 80-81 of
// the 96px-tall texture, not at the top. We shift the texture upward by this much
// so the line lands exactly on the entity baseline.
const GROUND_LINE_OFFSET_IN_TEXTURE = 80;

// Mirrors `GROUND` in cv-website/src/assets/dino/py/simulation.py: the fixed y where
// dinos land and cacti sit. The renderer must NOT track a moving dino y for this,
// or the ground line bounces during jumps/ducks.
const DINO_GROUND_Y = 365;

// Render-only vertical shift applied to every drawn y. Kept as a knob so the scene
// can be nudged up/down in the canvas without touching the sim contract. With the
// ground-line texture alignment fixed, 0 keeps the action at the sim's natural
// baseline (ground near the bottom of the 400px canvas, birds fully in frame).
const RENDER_Y_OFFSET = 0;

// HUD styling (Google/Chrome-dino style: pixelly mono text in top-right).
const HUD_FONT = '600 28px "JetBrains Mono", "Courier New", monospace';
const HUD_SUB_FONT = '600 16px "JetBrains Mono", "Courier New", monospace';
const HUD_COLOR = '#535353';
const HUD_PADDING_X = 28;
const HUD_PADDING_Y = 36;

// Vision-line render colors. Pulled from the Tailwind theme accents so dark/light
// readability stays consistent with the rest of the page.
const VISION_LINE_CACTUS_COLOR = 'rgba(34, 211, 238, 0.85)';
const VISION_LINE_BIRD_COLOR = 'rgba(245, 158, 11, 0.85)';

@Component({
  selector: 'app-dino-neat',
  standalone: true,
  imports: [
    RouterLink,
    ButtonComponent,
    DecimalPipe,
    DinoControlsComponent,
    DinoLiveControlsComponent,
  ],
  template: `
    <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <a
        routerLink="/"
        fragment="recent"
        class="inline-flex items-center gap-2 font-mono text-sm text-accent-cyan transition hover:opacity-80"
      >
        Back to Projects
      </a>

      <div class="mt-6">
        <p class="font-mono text-sm text-accent-cyan uppercase">Genetic Algorithm Showcase</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Dino NEAT (Pyodide)</h1>
        <p class="mt-3 max-w-2xl text-muted">
          This runs the Python NEAT simulation in-browser and renders frame data on a canvas.
          <a
            href="#details"
            (click)="scrollToSection($event, details)"
            class="font-mono text-sm text-accent-cyan transition hover:underline"
            >More details below</a
          >.
        </p>
      </div>

      @if (service.error(); as err) {
        <div
          class="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {{ err }}
        </div>
      }

      <section class="mt-6 flex flex-col gap-6">
        <div
          class="overflow-hidden rounded-2xl border border-border bg-surface/60 p-3 light:border-border-light light:bg-white"
        >
          <canvas
            #canvas
            width="1500"
            height="400"
            class="h-auto w-full rounded-xl bg-[#f7f7f7]"
          ></canvas>
          <div
            class="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-3 light:border-border-light"
          >
            <app-button
              variant="secondary"
              [buttonType]="'button'"
              (clicked)="service.restart()"
              [fullWidth]="false"
            >
              Restart
            </app-button>
            <app-button
              variant="primary"
              [buttonType]="'button'"
              (clicked)="toggleRun()"
              [fullWidth]="false"
            >
              {{ service.running() ? 'Pause' : 'Run' }}
            </app-button>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <app-dino-controls />

          <div class="flex flex-col gap-6">
            <app-dino-live-controls />

            <aside
              class="rounded-2xl border border-border bg-surface/60 p-5 light:border-border-light light:bg-white"
            >
              <h2 class="text-lg font-semibold">Live Stats</h2>
              @if (service.loading()) {
                <p class="mt-3 text-sm text-muted">Loading Pyodide + neat-python...</p>
              } @else {
                @if (service.frame(); as frame) {
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div class="rounded-lg border border-border p-3 light:border-border-light">
                      <dt class="font-mono text-xs text-muted uppercase">Generation</dt>
                      <dd class="mt-1 text-xl font-bold">{{ frame.generation }}</dd>
                    </div>
                    <div class="rounded-lg border border-border p-3 light:border-border-light">
                      <dt class="font-mono text-xs text-muted uppercase">Alive</dt>
                      <dd class="mt-1 text-xl font-bold">{{ frame.alive }}</dd>
                    </div>
                    <div class="rounded-lg border border-border p-3 light:border-border-light">
                      <dt class="font-mono text-xs text-muted uppercase">Status</dt>
                      <dd class="mt-1 text-xl font-bold">
                        {{ frame.done ? 'Done' : 'Running' }}
                      </dd>
                    </div>
                  </dl>
                  <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div class="rounded-lg border border-border p-3 light:border-border-light">
                      <dt class="font-mono text-xs text-muted uppercase">
                        Best Fitness (Last Gen)
                      </dt>
                      <dd class="mt-1 text-xl font-bold">
                        {{
                          frame.latest_history
                            ? (frame.latest_history.best_fitness | number: '1.0-2')
                            : '—'
                        }}
                      </dd>
                    </div>
                    <div class="rounded-lg border border-border p-3 light:border-border-light">
                      <dt class="font-mono text-xs text-muted uppercase">
                        Average Fitness (Last Gen)
                      </dt>
                      <dd class="mt-1 text-xl font-bold">
                        {{
                          frame.latest_history
                            ? (frame.latest_history.avg_fitness | number: '1.0-2')
                            : '—'
                        }}
                      </dd>
                    </div>
                  </dl>
                  <p class="mt-2 text-[11px] text-muted">Updates when a generation finishes.</p>
                } @else {
                  <p class="mt-3 text-sm text-muted">Initializing simulation...</p>
                }
              }
            </aside>
          </div>
        </div>
      </section>

      <section
        #details
        id="details"
        class="mt-12 scroll-mt-24 rounded-2xl border border-border bg-surface/60 p-6 light:border-border-light light:bg-white sm:p-8"
      >
        <p class="font-mono text-xs tracking-widest text-accent-cyan uppercase">About this demo</p>
        <h2 class="mt-2 text-2xl font-bold tracking-tight">How NEAT learns to play</h2>
        <div class="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            This page runs the entire training loop in your browser. CPython (compiled to
            WebAssembly) is loaded via Pyodide, then the same Python NEAT implementation that
            normally runs on the desktop is driven one frame at a time by the page's render
            loop.
          </p>
          <p>
            NEAT (NeuroEvolution of Augmenting Topologies) evolves both the
            <em>weights</em> and the <em>structure</em> of a neural network. Every dino is
            controlled by its own tiny network whose three outputs choose between jump, stand,
            and duck. Dinos that survive longer earn higher fitness; the next generation is
            bred from the best of them.
          </p>
        </div>

        <h3 class="mt-8 text-lg font-semibold">Controls explained</h3>
        <dl
          class="mt-4 grid gap-x-8 gap-y-5 text-sm leading-relaxed md:grid-cols-2"
        >
          <div>
            <dt class="font-mono text-xs tracking-wider text-accent-cyan uppercase">
              Population size
            </dt>
            <dd class="mt-1 text-muted">
              How many dinos run in parallel each generation. Larger populations explore
              more variations at once, but every frame has to step them all forward.
            </dd>
          </div>
          <div>
            <dt class="font-mono text-xs tracking-wider text-accent-cyan uppercase">
              Weight mutation rate
            </dt>
            <dd class="mt-1 text-muted">
              Probability that each connection weight is perturbed when a child is bred.
              Higher = more exploration; lower = the population sticks closer to whatever
              already works.
            </dd>
          </div>
          <div>
            <dt class="font-mono text-xs tracking-wider text-accent-cyan uppercase">
              Add-connection probability
            </dt>
            <dd class="mt-1 text-muted">
              Probability of adding a brand-new connection between existing nodes during
              mutation. This is what drives topology growth - the core idea that makes NEAT
              different from fixed-shape neural-net training.
            </dd>
          </div>
          <div>
            <dt class="font-mono text-xs tracking-wider text-accent-cyan uppercase">
              Speciation threshold
            </dt>
            <dd class="mt-1 text-muted">
              Genome-distance cutoff for grouping individuals into species. Lower values
              mean more, smaller species (innovations get more protection); higher values
              collapse everyone into a few large groups.
            </dd>
          </div>
          <div>
            <dt class="font-mono text-xs tracking-wider text-accent-cyan uppercase">Elitism</dt>
            <dd class="mt-1 text-muted">
              How many of each species' top genomes carry over to the next generation
              unchanged. Higher values preserve good solutions but slow exploration.
            </dd>
          </div>
          <div>
            <dt class="font-mono text-xs tracking-wider text-accent-cyan uppercase">
              Random seed
            </dt>
            <dd class="mt-1 text-muted">
              Seeds Python's random module before the run starts so the same seed produces
              the same evolution. Hit "New seed" to roll a fresh one.
            </dd>
          </div>
          <div>
            <dt class="font-mono text-xs tracking-wider text-accent-cyan uppercase">
              Birds enabled
            </dt>
            <dd class="mt-1 text-muted">
              Toggles flying obstacles. With birds off, the population only needs to learn
              jumping; with birds on, it also has to learn when to duck.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  `,
})
export class DinoNeatComponent {
  @ViewChild('canvas', { static: true }) private readonly canvasRef!: ElementRef<HTMLCanvasElement>;
  readonly service = inject(DinoSimService);
  private readonly destroyRef = inject(DestroyRef);
  private wasRunningBeforeHidden = false;
  private readonly sprites: Partial<Record<SpriteKey, HTMLImageElement>> = {};
  private spritesReady = false;

  private readonly handleVisibilityChange = () => {
    if (document.hidden) {
      this.wasRunningBeforeHidden = this.service.running();
      this.service.stop();
      return;
    }
    if (this.wasRunningBeforeHidden) {
      this.service.start();
      this.wasRunningBeforeHidden = false;
    }
  };

  constructor() {
    this.preloadSprites();
    this.bootstrap();
    const stopEffect = effect(() => {
      // Read visionLinesEnabled too so toggling it repaints immediately,
      // even when the simulation is paused.
      this.service.visionLinesEnabled();
      this.draw(this.service.frame());
    });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.destroyRef.onDestroy(() => {
      stopEffect.destroy();
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.service.stop();
    });
  }

  async bootstrap(): Promise<void> {
    await this.service.init();
    this.service.start();
  }

  toggleRun(): void {
    if (this.service.running()) {
      this.service.stop();
    } else {
      this.service.start();
    }
  }

  scrollToSection(event: Event, target: HTMLElement): void {
    // Bypass the global <base href="/">, which would otherwise resolve
    // a bare `#details` href to `/#details` (root, wrong page).
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private preloadSprites(): void {
    const entries = Object.entries(SPRITE_SOURCES) as [SpriteKey, string][];
    let remaining = entries.length;
    if (remaining === 0) {
      this.spritesReady = true;
      return;
    }
    const markDone = () => {
      remaining -= 1;
      if (remaining === 0) {
        this.spritesReady = true;
        this.draw(this.service.frame());
      }
    };
    for (const [key, src] of entries) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.sprites[key] = img;
        markDone();
      };
      img.onerror = () => {
        markDone();
      };
      img.src = src;
    }
  }

  private draw(frame: DinoFrameState | null): void {
    if (!frame) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawGround(ctx, canvas, frame);

    for (const cactus of frame.cacti) {
      this.drawCactus(ctx, cactus);
    }
    for (const bird of frame.birds) {
      this.drawBird(ctx, bird);
    }
    for (const dino of frame.dinos) {
      this.drawDino(ctx, dino);
    }

    if (this.service.visionLinesEnabled()) {
      this.drawVisionLines(ctx, frame);
    }

    this.drawHud(ctx, canvas, frame);
  }

  private drawHud(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    frame: DinoFrameState,
  ): void {
    const score = String(frame.score).padStart(5, '0');
    const sub = `GEN ${frame.generation}  ALIVE ${frame.alive}`;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = HUD_COLOR;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';

    ctx.font = HUD_FONT;
    ctx.fillText(score, canvas.width - HUD_PADDING_X, HUD_PADDING_Y);

    ctx.font = HUD_SUB_FONT;
    ctx.fillText(sub, canvas.width - HUD_PADDING_X, HUD_PADDING_Y + 36);
    ctx.restore();
  }

  private drawVisionLines(ctx: CanvasRenderingContext2D, frame: DinoFrameState): void {
    const lead = frame.dinos[0];
    if (!lead) return;
    const originX = Math.round(lead.x + lead.width / 2);
    const originY = Math.round(lead.y - RENDER_Y_OFFSET - lead.height / 2);

    ctx.save();
    ctx.lineWidth = 2;

    const cactusIdx = frame.nearest_cactus_index;
    if (cactusIdx !== null && cactusIdx !== undefined && frame.cacti[cactusIdx]) {
      const c = frame.cacti[cactusIdx];
      ctx.strokeStyle = VISION_LINE_CACTUS_COLOR;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(Math.round(c.x + c.width / 2), Math.round(c.y - RENDER_Y_OFFSET - c.height / 2));
      ctx.stroke();
    }

    const birdIdx = frame.nearest_bird_index;
    if (birdIdx !== null && birdIdx !== undefined && frame.birds[birdIdx]) {
      const b = frame.birds[birdIdx];
      ctx.strokeStyle = VISION_LINE_BIRD_COLOR;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(Math.round(b.x + b.width / 2), Math.round(b.y - RENDER_Y_OFFSET - b.height / 2));
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawGround(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    frame: DinoFrameState,
  ): void {
    const baselineY = DINO_GROUND_Y - RENDER_Y_OFFSET;
    const ground = this.sprites.ground;
    if (!ground) {
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(0, baselineY, canvas.width, 2);
      return;
    }

    const tileW = GROUND_TILE.w;
    const tileH = GROUND_TILE.h;
    const textureTop = baselineY - GROUND_LINE_OFFSET_IN_TEXTURE;
    const drawH = Math.min(tileH, canvas.height - textureTop);
    if (drawH <= 0) return;

    const wrappedLeft = ((frame.base.left % tileW) + tileW) % tileW - tileW;
    for (let x = wrappedLeft; x < canvas.width; x += tileW) {
      ctx.drawImage(
        ground,
        0,
        0,
        tileW,
        drawH,
        Math.round(x),
        Math.round(textureTop),
        tileW,
        drawH,
      );
    }
  }

  private drawDino(ctx: CanvasRenderingContext2D, dino: DinoState): void {
    const ducking = dino.ducking && !dino.jumping;
    const size = ducking ? DINO_DUCK_SIZE : DINO_RUN_SIZE;
    const drawX = Math.round(dino.x - (size.w - dino.width) / 2);
    const drawY = Math.round(dino.y - RENDER_Y_OFFSET - size.h);

    let key: SpriteKey;
    if (dino.jumping) {
      key = 'dinoIdle';
    } else if (ducking) {
      key = this.pickFrame(DINO_FRAME_INTERVAL_MS) === 0 ? 'dinoDuck01' : 'dinoDuck02';
    } else {
      key = this.pickFrame(DINO_FRAME_INTERVAL_MS) === 0 ? 'dinoRun01' : 'dinoRun02';
    }

    const img = this.sprites[key];
    if (img) {
      ctx.drawImage(img, drawX, drawY, size.w, size.h);
      return;
    }
    this.drawFallbackBox(
      ctx,
      dino.x,
      dino.y - RENDER_Y_OFFSET,
      dino.width,
      dino.height,
      '#4fd1c5',
    );
  }

  private drawBird(ctx: CanvasRenderingContext2D, bird: DinoBirdState): void {
    const key: SpriteKey = this.pickFrame(BIRD_FRAME_INTERVAL_MS) === 0 ? 'bird01' : 'bird02';
    const img = this.sprites[key];
    const size = BIRD_SIZE;
    const drawX = Math.round(bird.x - (size.w - bird.width) / 2);
    const drawY = Math.round(bird.y - RENDER_Y_OFFSET - size.h);

    if (img) {
      ctx.drawImage(img, drawX, drawY, size.w, size.h);
      return;
    }
    this.drawFallbackBox(
      ctx,
      bird.x,
      bird.y - RENDER_Y_OFFSET,
      bird.width,
      bird.height,
      '#2563eb',
    );
  }

  private drawCactus(ctx: CanvasRenderingContext2D, cactus: DinoCactusState): void {
    const key = this.cactusSpriteKey(cactus);
    const img = this.sprites[key];
    if (img) {
      const drawX = Math.round(cactus.x);
      const drawY = Math.round(cactus.y - RENDER_Y_OFFSET - img.naturalHeight);
      ctx.drawImage(img, drawX, drawY, img.naturalWidth, img.naturalHeight);
      return;
    }
    this.drawFallbackBox(
      ctx,
      cactus.x,
      cactus.y - RENDER_Y_OFFSET,
      cactus.width,
      cactus.height,
      '#3f3f46',
    );
  }

  private cactusSpriteKey(cactus: DinoCactusState): SpriteKey {
    const sizePart = cactus.size === 'small' ? 'Small' : 'Large';
    const variantPart = cactus.variant === 0 ? 'Single' : cactus.variant === 1 ? 'Double' : 'Triple';
    return ('cactus' + sizePart + variantPart) as SpriteKey;
  }

  private drawFallbackBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ): void {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y - height), Math.round(width), Math.round(height));
  }

  private pickFrame(intervalMs: number): 0 | 1 {
    return Math.floor(performance.now() / intervalMs) % 2 === 0 ? 0 : 1;
  }
}
