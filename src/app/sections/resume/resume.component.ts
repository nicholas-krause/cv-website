import { Component } from '@angular/core';
import { SITE_CONTENT } from '../../data/site-content';
import { RevealDirective } from '../../directives/reveal.directive';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';
import { SectionComponent } from '../../ui/section/section.component';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [SectionComponent, CardComponent, ButtonComponent, RevealDirective],
  template: `
    <app-section id="resume" kicker="02 / Resume" heading="Resume / CV">
      <app-card appReveal>
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h3 class="flex-1 text-left text-xl font-semibold">
            CV / Resume (Last Updated: June 2026)
          </h3>

          <div class="flex flex-col gap-3 sm:flex-row">
            <app-button
              variant="secondary"
              type="link"
              icon="eye"
              [href]="content.cv.path"
              [external]="true"
              >View CV</app-button
            >
            <app-button
              variant="primary"
              type="link"
              icon="download"
              [href]="content.cv.path"
              [download]="content.cv.filename"
            >
              Download CV
            </app-button>
          </div>
        </div>
      </app-card>
    </app-section>
  `,
})
export class ResumeComponent {
  readonly content = SITE_CONTENT;
}
