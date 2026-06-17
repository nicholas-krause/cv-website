import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div
      [class]="
        'rounded-2xl border border-border bg-surface/80 p-6 shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-accent-cyan/30 hover:shadow-accent-cyan/10 light:border-border-light light:bg-white light:shadow-black/5 ' +
        extraClass
      "
    >
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() extraClass = '';
}
