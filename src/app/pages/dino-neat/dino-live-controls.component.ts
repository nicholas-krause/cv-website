import { Component, inject } from '@angular/core';
import { DinoSimService } from '../../services/dino-sim.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-dino-live-controls',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <section
      class="rounded-2xl border border-border bg-surface/60 p-5 light:border-border-light light:bg-white"
    >
      <header class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Live Playback</h2>
        <span class="font-mono text-[10px] tracking-wider text-muted uppercase">render-only</span>
      </header>
      <p class="mt-1 text-xs text-muted">
        Adjustments here take effect immediately and do not change the simulation
        configuration.
      </p>

      <div class="mt-5 flex flex-col gap-5">
        <div>
          <div class="flex items-baseline justify-between">
            <label class="font-mono text-xs text-muted uppercase" for="live-speed">
              Speed (steps per frame)
            </label>
            <span class="font-mono text-sm">{{ service.stepsPerFrame() }}x</span>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <input
              id="live-speed"
              type="range"
              min="1"
              max="32"
              step="1"
              class="flex-1 accent-accent-cyan"
              [value]="service.stepsPerFrame()"
              (input)="onSpeedInput($event)"
            />
            <input
              type="number"
              min="1"
              max="64"
              step="1"
              class="w-20 rounded-md border border-border bg-base/40 px-2 py-1 text-sm light:border-border-light light:bg-surface-light"
              [value]="service.stepsPerFrame()"
              (input)="onSpeedInput($event)"
            />
          </div>
          <p class="mt-1 text-[11px] text-muted">
            Higher values fast-forward early generations. Only the last simulated frame
            of each batch is rendered.
          </p>
        </div>

        <label class="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            class="h-4 w-4 accent-accent-cyan"
            [checked]="service.visionLinesEnabled()"
            (change)="onVisionToggle($event)"
          />
          <span>Vision lines</span>
        </label>
        <p class="-mt-3 text-[11px] text-muted">
          Draws lines from the lead dino to the nearest cactus and bird, illustrating
          the inputs the network sees.
        </p>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-[11px] text-muted">
            Advance the run to the next generation without watching it play out.
          </p>
          <app-button
            variant="secondary"
            [buttonType]="'button'"
            [fullWidth]="false"
            (clicked)="stepGeneration()"
          >
            Step Generation
          </app-button>
        </div>
      </div>
    </section>
  `,
})
export class DinoLiveControlsComponent {
  readonly service = inject(DinoSimService);

  onSpeedInput(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(value)) this.service.setStepsPerFrame(value);
  }

  onVisionToggle(event: Event): void {
    this.service.setVisionLinesEnabled((event.target as HTMLInputElement).checked);
  }

  async stepGeneration(): Promise<void> {
    await this.service.stepGeneration();
  }
}
