import { Component } from '@angular/core';
import { SITE_CONTENT } from '../../data/site-content';
import { RevealDirective } from '../../directives/reveal.directive';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { SectionComponent } from '../../ui/section/section.component';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [SectionComponent, BadgeComponent, RevealDirective],
  template: `
    <app-section id="interests" kicker="03 / Interests" heading="Fields of Interest">
      <div appReveal class="flex flex-wrap gap-3">
        @for (interest of content.interests; track interest) {
          <app-badge [label]="interest" />
        }
      </div>
    </app-section>
  `,
})
export class InterestsComponent {
  readonly content = SITE_CONTENT;
}
