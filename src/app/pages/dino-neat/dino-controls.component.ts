import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  DEFAULT_DINO_KNOBS,
  DinoKnobs,
  DinoSimService,
} from '../../services/dino-sim.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-dino-controls',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <section
      class="rounded-2xl border border-border bg-surface/60 p-5 light:border-border-light light:bg-white"
    >
      <header class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">NEAT Controls</h2>
        @if (pending()) {
          <span
            class="rounded-full border border-accent-cyan/40 px-2 py-0.5 font-mono text-[10px] uppercase text-accent-cyan"
          >
            Unsaved
          </span>
        } @else if (staged()) {
          <span
            class="rounded-full border border-accent-amber/40 px-2 py-0.5 font-mono text-[10px] uppercase text-accent-amber"
          >
            Restart to use
          </span>
        }
      </header>
      <p class="mt-1 text-xs text-muted">
        Apply saves the preset. The running simulation keeps its current values
        until you click Restart.
      </p>

      <div class="mt-5 flex flex-col gap-5">
        <div>
          <div class="flex items-baseline justify-between">
            <label class="font-mono text-xs text-muted uppercase" for="knob-pop">
              Population size
            </label>
            <span class="font-mono text-sm">{{ populationSize() }}</span>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <input
              id="knob-pop"
              type="range"
              min="10"
              max="300"
              step="10"
              class="flex-1 accent-accent-cyan"
              [value]="populationSize()"
              (input)="onIntSlider($event, populationSize.set)"
            />
            <input
              type="number"
              min="10"
              max="300"
              step="10"
              class="w-20 rounded-md border border-border bg-base/40 px-2 py-1 text-sm light:border-border-light light:bg-surface-light"
              [value]="populationSize()"
              (input)="onIntInput($event, populationSize.set)"
            />
          </div>
        </div>

        <div>
          <div class="flex items-baseline justify-between">
            <label class="font-mono text-xs text-muted uppercase" for="knob-wmut">
              Weight mutation rate
            </label>
            <span class="font-mono text-sm">{{ weightMutateRate().toFixed(2) }}</span>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <input
              id="knob-wmut"
              type="range"
              min="0"
              max="1"
              step="0.05"
              class="flex-1 accent-accent-cyan"
              [value]="weightMutateRate()"
              (input)="onFloatSlider($event, weightMutateRate.set)"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              class="w-20 rounded-md border border-border bg-base/40 px-2 py-1 text-sm light:border-border-light light:bg-surface-light"
              [value]="weightMutateRate()"
              (input)="onFloatInput($event, weightMutateRate.set)"
            />
          </div>
        </div>

        <div>
          <div class="flex items-baseline justify-between">
            <label class="font-mono text-xs text-muted uppercase" for="knob-conn">
              Add-connection probability
            </label>
            <span class="font-mono text-sm">{{ connAddProb().toFixed(2) }}</span>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <input
              id="knob-conn"
              type="range"
              min="0"
              max="1"
              step="0.05"
              class="flex-1 accent-accent-cyan"
              [value]="connAddProb()"
              (input)="onFloatSlider($event, connAddProb.set)"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              class="w-20 rounded-md border border-border bg-base/40 px-2 py-1 text-sm light:border-border-light light:bg-surface-light"
              [value]="connAddProb()"
              (input)="onFloatInput($event, connAddProb.set)"
            />
          </div>
        </div>

        <div>
          <div class="flex items-baseline justify-between">
            <label class="font-mono text-xs text-muted uppercase" for="knob-spec">
              Speciation threshold
            </label>
            <span class="font-mono text-sm">{{ speciationThreshold().toFixed(1) }}</span>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <input
              id="knob-spec"
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              class="flex-1 accent-accent-cyan"
              [value]="speciationThreshold()"
              (input)="onFloatSlider($event, speciationThreshold.set)"
            />
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              class="w-20 rounded-md border border-border bg-base/40 px-2 py-1 text-sm light:border-border-light light:bg-surface-light"
              [value]="speciationThreshold()"
              (input)="onFloatInput($event, speciationThreshold.set)"
            />
          </div>
        </div>

        <div>
          <div class="flex items-baseline justify-between">
            <label class="font-mono text-xs text-muted uppercase" for="knob-elit">Elitism</label>
            <span class="font-mono text-sm">{{ elitism() }}</span>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <input
              id="knob-elit"
              type="range"
              min="0"
              max="10"
              step="1"
              class="flex-1 accent-accent-cyan"
              [value]="elitism()"
              (input)="onIntSlider($event, elitism.set)"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="1"
              class="w-20 rounded-md border border-border bg-base/40 px-2 py-1 text-sm light:border-border-light light:bg-surface-light"
              [value]="elitism()"
              (input)="onIntInput($event, elitism.set)"
            />
          </div>
        </div>

        <div>
          <div class="flex items-baseline justify-between">
            <label class="font-mono text-xs text-muted uppercase" for="knob-seed">
              Random seed
            </label>
            <button
              type="button"
              class="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-muted uppercase transition hover:border-accent-cyan/40 hover:text-accent-cyan light:border-border-light"
              (click)="rollSeed()"
            >
              New seed
            </button>
          </div>
          <input
            id="knob-seed"
            type="number"
            min="0"
            step="1"
            class="mt-2 w-full rounded-md border border-border bg-base/40 px-2 py-1 text-sm light:border-border-light light:bg-surface-light"
            [value]="seed()"
            (input)="onIntInput($event, seed.set)"
          />
        </div>

        <label class="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            class="h-4 w-4 accent-accent-cyan"
            [checked]="birdsEnabled()"
            (change)="onBoolInput($event, birdsEnabled.set)"
          />
          <span>Birds enabled</span>
        </label>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="font-mono text-xs text-muted uppercase underline-offset-2 transition hover:text-accent-cyan hover:underline"
          (click)="resetToDefaults()"
        >
          Reset to defaults
        </button>
        <app-button
          variant="primary"
          [buttonType]="'button'"
          [fullWidth]="false"
          (clicked)="apply()"
        >
          Apply
        </app-button>
      </div>
    </section>
  `,
})
export class DinoControlsComponent {
  readonly service = inject(DinoSimService);

  readonly populationSize = signal(this.service.appliedKnobs().populationSize);
  readonly weightMutateRate = signal(this.service.appliedKnobs().weightMutateRate);
  readonly connAddProb = signal(this.service.appliedKnobs().connAddProb);
  readonly speciationThreshold = signal(this.service.appliedKnobs().speciationThreshold);
  readonly elitism = signal(this.service.appliedKnobs().elitism);
  readonly seed = signal(this.service.appliedKnobs().seed);
  readonly birdsEnabled = signal(this.service.appliedKnobs().birdsEnabled);

  readonly current = computed<DinoKnobs>(() => ({
    populationSize: this.populationSize(),
    weightMutateRate: this.weightMutateRate(),
    connAddProb: this.connAddProb(),
    speciationThreshold: this.speciationThreshold(),
    elitism: this.elitism(),
    seed: this.seed(),
    birdsEnabled: this.birdsEnabled(),
  }));

  // Form has unsaved edits relative to the persisted preset.
  readonly pending = computed(() => !knobsEqual(this.current(), this.service.appliedKnobs()));

  // Persisted preset differs from what the running simulation was built with -
  // a Restart will pick up the new values.
  readonly staged = computed(() => {
    const running = this.service.runningKnobs();
    if (!running) return false;
    return !knobsEqual(this.service.appliedKnobs(), running);
  });

  constructor() {
    // If the service's applied knobs change from elsewhere (e.g. another tab,
    // future preset URL), keep the form in sync as long as the user has no
    // pending edits.
    effect(() => {
      const applied = this.service.appliedKnobs();
      if (!this.pending()) {
        this.populationSize.set(applied.populationSize);
        this.weightMutateRate.set(applied.weightMutateRate);
        this.connAddProb.set(applied.connAddProb);
        this.speciationThreshold.set(applied.speciationThreshold);
        this.elitism.set(applied.elitism);
        this.seed.set(applied.seed);
        this.birdsEnabled.set(applied.birdsEnabled);
      }
    });
  }

  apply(): void {
    this.service.applyKnobs(this.current());
  }

  resetToDefaults(): void {
    this.populationSize.set(DEFAULT_DINO_KNOBS.populationSize);
    this.weightMutateRate.set(DEFAULT_DINO_KNOBS.weightMutateRate);
    this.connAddProb.set(DEFAULT_DINO_KNOBS.connAddProb);
    this.speciationThreshold.set(DEFAULT_DINO_KNOBS.speciationThreshold);
    this.elitism.set(DEFAULT_DINO_KNOBS.elitism);
    this.seed.set(DEFAULT_DINO_KNOBS.seed);
    this.birdsEnabled.set(DEFAULT_DINO_KNOBS.birdsEnabled);
  }

  rollSeed(): void {
    this.seed.set(Math.floor(Math.random() * 1_000_000));
  }

  onIntSlider(event: Event, setter: (v: number) => void): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(value)) setter(Math.round(value));
  }

  onIntInput(event: Event, setter: (v: number) => void): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(value)) setter(Math.round(value));
  }

  onFloatSlider(event: Event, setter: (v: number) => void): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(value)) setter(value);
  }

  onFloatInput(event: Event, setter: (v: number) => void): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(value)) setter(value);
  }

  onBoolInput(event: Event, setter: (v: boolean) => void): void {
    setter((event.target as HTMLInputElement).checked);
  }
}

function knobsEqual(a: DinoKnobs, b: DinoKnobs): boolean {
  return (
    a.populationSize === b.populationSize &&
    a.weightMutateRate === b.weightMutateRate &&
    a.connAddProb === b.connAddProb &&
    a.speciationThreshold === b.speciationThreshold &&
    a.elitism === b.elitism &&
    a.seed === b.seed &&
    a.birdsEnabled === b.birdsEnabled
  );
}
