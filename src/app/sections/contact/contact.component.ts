import { Component } from '@angular/core';
import { SITE_CONTENT } from '../../data/site-content';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionComponent } from '../../ui/section/section.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionComponent, RevealDirective],
  template: `
    <app-section id="contact" kicker="06 / Contact" heading="Get in touch">
      <div appReveal class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (link of content.contactLinks; track link.label) {
          <a
            [href]="link.href"
            [attr.target]="link.icon !== 'email' ? '_blank' : null"
            [attr.rel]="link.icon !== 'email' ? 'noopener noreferrer' : null"
            class="group flex items-center gap-4 rounded-2xl border border-border bg-surface/80 p-5 transition hover:border-accent-cyan/40 hover:shadow-lg hover:shadow-accent-cyan/10 light:border-border-light light:bg-white"
          >
            <span
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan transition group-hover:scale-105"
            >
              @switch (link.icon) {
                @case ('email') {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
                @case ('phone') {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M3 5a2 2 0 012-2h2.2a1 1 0 01.97.757l.92 3.68a1 1 0 01-.27.96l-1.5 1.5a14 14 0 006.06 6.06l1.5-1.5a1 1 0 01.96-.27l3.68.92a1 1 0 01.757.97V19a2 2 0 01-2 2h-1C8.61 21 3 15.39 3 8V5z"
                    />
                  </svg>
                }
                @case ('github') {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.395-.135-.345-.72-1.395-1.23-1.665-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                    />
                  </svg>
                }
                @case ('linkedin') {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.062 2.062 0 01-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                    />
                  </svg>
                }
              }
            </span>
            <span>
              <span class="block text-sm font-semibold">{{ link.label }}</span>
              <span class="block text-xs text-muted">{{ link.value }}</span>
            </span>
          </a>
        }
      </div>
    </app-section>
  `,
})
export class ContactComponent {
  readonly content = SITE_CONTENT;
}
