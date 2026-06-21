import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section',
  standalone: true,
  template: `
    <section [id]="id" class="py-10 md:py-14">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p class="font-mono text-sm tracking-widest text-accent-cyan uppercase">{{ kicker }}</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{{ heading }}</h2>
        @if (description) {
          <p class="mt-3 max-w-2xl text-muted">{{ description }}</p>
        }
        <div class="mt-10">
          <ng-content />
        </div>
      </div>
    </section>
  `,
})
export class SectionComponent {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) kicker!: string;
  @Input({ required: true }) heading!: string;
  @Input() description = '';
}
