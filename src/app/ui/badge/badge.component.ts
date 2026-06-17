import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center rounded-full border border-accent-cyan/30 bg-surface/60 px-4 py-2 font-mono text-xs text-accent-cyan transition hover:border-accent-cyan hover:bg-accent-cyan/10 light:bg-white light:text-accent-blue light:border-accent-blue/30"
    >
      {{ label }}
    </span>
  `,
})
export class BadgeComponent {
  @Input({ required: true }) label!: string;
}
