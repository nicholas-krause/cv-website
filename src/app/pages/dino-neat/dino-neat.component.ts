import { Component, DestroyRef, ElementRef, ViewChild, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DinoSimService } from '../../services/dino-sim.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-dino-neat',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <a
        routerLink="/"
        fragment="projects"
        class="inline-flex items-center gap-2 font-mono text-sm text-accent-cyan transition hover:opacity-80"
      >
        Back to Projects
      </a>

      <div class="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p class="font-mono text-sm text-accent-cyan uppercase">Genetic Algorithm Showcase</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Dino NEAT (Pyodide)</h1>
          <p class="mt-3 max-w-2xl text-muted">
            This runs the Python NEAT simulation in-browser and renders frame data on a canvas.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
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

      @if (service.error(); as err) {
        <div class="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {{ err }}
        </div>
      }

      <section class="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div class="overflow-hidden rounded-2xl border border-border bg-surface/60 p-3 light:border-border-light light:bg-white">
          <canvas #canvas width="1500" height="400" class="h-auto w-full rounded-xl bg-[#f7f7f7]"></canvas>
        </div>

        <aside class="rounded-2xl border border-border bg-surface/60 p-5 light:border-border-light light:bg-white">
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
                  <dt class="font-mono text-xs text-muted uppercase">Score</dt>
                  <dd class="mt-1 text-xl font-bold">{{ frame.score }}</dd>
                </div>
                <div class="rounded-lg border border-border p-3 light:border-border-light">
                  <dt class="font-mono text-xs text-muted uppercase">Status</dt>
                  <dd class="mt-1 text-xl font-bold">{{ frame.done ? 'Done' : 'Running' }}</dd>
                </div>
              </dl>
            } @else {
              <p class="mt-3 text-sm text-muted">Initializing simulation...</p>
            }
          }
        </aside>
      </section>
    </main>
  `,
})
export class DinoNeatComponent {
  @ViewChild('canvas', { static: true }) private readonly canvasRef!: ElementRef<HTMLCanvasElement>;
  readonly service = inject(DinoSimService);
  private readonly destroyRef = inject(DestroyRef);
  private wasRunningBeforeHidden = false;
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
    this.bootstrap();
    const stopEffect = effect(() => this.draw(this.service.frame()));
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

  private draw(frame: ReturnType<DinoSimService['frame']>): void {
    if (!frame) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#d8d8d8';
    ctx.fillRect(0, frame.base.y, canvas.width, 6);

    ctx.fillStyle = '#4fd1c5';
    for (const dino of frame.dinos) {
      ctx.fillRect(dino.x, dino.y - dino.height, dino.width, dino.height);
    }

    ctx.fillStyle = '#3f3f46';
    for (const cactus of frame.cacti) {
      ctx.fillRect(cactus.x, cactus.y - cactus.height, cactus.width, cactus.height);
    }

    ctx.fillStyle = '#2563eb';
    for (const bird of frame.birds) {
      ctx.fillRect(bird.x, bird.y - bird.height, bird.width, bird.height);
    }
  }
}
