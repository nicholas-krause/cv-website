import { Component } from '@angular/core';
import { SITE_CONTENT } from '../../data/site-content';
import { RevealDirective } from '../../directives/reveal.directive';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-author',
  standalone: true,
  imports: [ButtonComponent, RevealDirective],
  template: `
    <section id="author" class="relative overflow-hidden py-12 md:py-16">
      <div class="pcb-bg author-pcb-fade absolute inset-0 opacity-30"></div>
      <div
        class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8"
      >
        <div appReveal>
          <p class="font-mono text-sm tracking-[0.2em] text-accent-cyan uppercase">
            {{ content.role }}
          </p>
          <h1 class="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {{ content.name }}
          </h1>
          <p class="mt-4 text-lg font-medium text-text light:text-text-dark">
            {{ content.tagline }}
          </p>
          <p class="mt-2 text-sm text-muted">{{ content.subtitle }}</p>
          <p class="mt-6 max-w-xl text-muted">{{ content.valueStatement }}</p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <app-button
              variant="primary"
              type="link"
              icon="download"
              [href]="content.cv.path"
              [download]="content.cv.filename"
            >
              Download CV
            </app-button>
            <app-button variant="secondary" type="anchor" icon="folder" href="#projects"
              >View Projects</app-button
            >
          </div>
        </div>

        <div appReveal class="flex justify-center lg:justify-end">
          <div class="relative flex items-center justify-center overflow-visible">
            <div
              class="absolute h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-accent-cyan/25 to-accent-blue/25 blur-3xl sm:h-[32rem] sm:w-[32rem]"
            ></div>
            <div
              class="author-disc absolute h-[22rem] w-[22rem] rounded-full sm:h-[34rem] sm:w-[34rem]"
              aria-hidden="true"
            ></div>
            <img
              src="assets/img/author-circuit.png"
              alt=""
              aria-hidden="true"
              class="author-emblem relative w-[24rem] max-w-full select-none sm:w-[38rem]"
            />
            <img
              src="assets/img/headshot.jpg?v=1"
              [alt]="content.name"
              class="pointer-events-none absolute h-40 w-40 select-none rounded-full border-2 border-accent-cyan/40 object-cover shadow-xl shadow-accent-cyan/20 sm:h-52 sm:w-52"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .author-emblem {
        animation: author-pulse 6s ease-in-out infinite;
      }

      /* Fade the PCB-grid overlay out near the bottom of the section so the */
      /* transition into the next section is seamless instead of a hard seam. */
      .author-pcb-fade {
        -webkit-mask-image: linear-gradient(to bottom, black 65%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
      }

      .author-disc {
        background: radial-gradient(closest-side, var(--color-base) 55%, transparent 100%);
      }

      :host-context(.light) .author-disc {
        background: radial-gradient(
          closest-side,
          var(--color-surface-light) 55%,
          transparent 100%
        );
      }

      @keyframes author-pulse {
        0%,
        100% {
          filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.25));
        }
        50% {
          filter: drop-shadow(0 0 28px rgba(34, 211, 238, 0.5));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .author-emblem {
          animation: none;
        }
      }
    `,
  ],
})
export class AuthorComponent {
  readonly content = SITE_CONTENT;
}
