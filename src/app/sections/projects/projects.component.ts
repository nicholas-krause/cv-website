import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONTENT } from '../../data/site-content';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionComponent } from '../../ui/section/section.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [SectionComponent, RouterLink, RevealDirective],
  template: `
    <app-section
      id="projects"
      kicker="04 / Projects"
      heading="University Projects"
      description="Selected coursework and capstone projects from the University of Canterbury. Click any project for the full write-up."
    >
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        @for (project of content.projects; track project.slug) {
          <a
            [routerLink]="['/projects', project.slug]"
            appReveal
            class="group flex flex-col rounded-2xl border border-border bg-surface/80 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-accent-cyan/40 hover:shadow-accent-cyan/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan light:border-border-light light:bg-white"
          >
            <div
              class="relative mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-base/50 font-mono text-2xl text-accent-cyan/30 light:bg-surface-light"
            >
              @if (project.images.length) {
                <img
                  [src]="project.images[0]"
                  [alt]="project.title + ' thumbnail'"
                  loading="lazy"
                  class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  (error)="onImageError($event)"
                />
              }
              <span>{{ project.title.split(' ')[0] }}</span>
            </div>
            <h3 class="text-lg font-semibold">{{ project.title }}</h3>
            <p class="mt-1 font-mono text-xs text-accent-cyan">
              {{ project.institution }} · {{ project.languages.join(', ') }}
            </p>
            <p class="mt-3 flex-1 text-sm leading-relaxed text-muted">{{ project.summary }}</p>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              @for (tag of project.tags; track tag) {
                <span
                  class="rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted light:border-border-light"
                >
                  {{ tag }}
                </span>
              }
            </div>
            <span
              class="mt-4 inline-flex items-center gap-1 font-mono text-xs text-accent-cyan opacity-0 transition group-hover:opacity-100"
            >
              View details
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            </span>
          </a>
        }
      </div>
      <a
        routerLink="/genetic-algorithm"
        appReveal
        class="mt-6 block rounded-2xl border border-accent-cyan/40 bg-surface/80 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:shadow-accent-cyan/10 light:bg-white"
      >
        <p class="font-mono text-xs tracking-widest text-accent-cyan uppercase">Interactive Demo</p>
        <h3 class="mt-2 text-xl font-semibold">Dino NEAT Genetic Algorithm</h3>
        <p class="mt-2 text-sm text-muted">
          Run the Python simulation directly in-browser and watch generations evolve in real time.
        </p>
        <span class="mt-4 inline-flex items-center gap-1 font-mono text-xs text-accent-cyan">
          Open showcase
        </span>
      </a>
    </app-section>
  `,
})
export class ProjectsComponent {
  readonly content = SITE_CONTENT;

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
