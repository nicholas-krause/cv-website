import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SITE_CONTENT, UniversityProject } from '../../data/site-content';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (project(); as p) {
      <main class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <a
          routerLink="/"
          fragment="projects"
          class="inline-flex items-center gap-2 font-mono text-sm text-accent-cyan transition hover:opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 12H5M11 18l-6-6 6-6"
            />
          </svg>
          Back to Projects
        </a>

        <p class="mt-8 font-mono text-sm tracking-widest text-accent-cyan uppercase">
          {{ p.institution }}
        </p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{{ p.title }}</h1>

        <div class="mt-4 flex flex-wrap gap-2">
          @for (lang of p.languages; track lang) {
            <span
              class="rounded-full border border-accent-cyan/40 px-3 py-1 font-mono text-xs text-accent-cyan"
            >
              {{ lang }}
            </span>
          }
        </div>

        <div class="mt-8 space-y-5 leading-relaxed text-muted">
          @for (paragraph of p.detail; track paragraph) {
            <p>{{ paragraph }}</p>
          }
        </div>

        @if (p.images.length) {
          <div class="mt-10 space-y-6">
            @for (img of p.images; track img) {
              <figure
                class="overflow-hidden rounded-2xl border border-border bg-surface/60 p-2 light:border-border-light light:bg-white"
              >
                <img
                  [src]="img"
                  [alt]="p.title + ' figure'"
                  loading="lazy"
                  class="mx-auto h-auto w-full rounded-xl"
                />
              </figure>
            }
          </div>
        }

        <div
          class="mt-12 flex flex-wrap gap-2 border-t border-border pt-8 light:border-border-light"
        >
          @for (tag of p.tags; track tag) {
            <span
              class="rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted light:border-border-light"
            >
              {{ tag }}
            </span>
          }
        </div>

        <nav
          class="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-8 light:border-border-light"
          aria-label="Project navigation"
        >
          @if (prevProject(); as prev) {
            <a
              [routerLink]="['/projects', prev.slug]"
              class="group flex flex-1 items-center gap-3 rounded-2xl border border-border bg-surface/60 p-4 transition hover:border-accent-cyan/40 hover:bg-surface light:border-border-light light:bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 shrink-0 text-accent-cyan transition group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 12H5M11 18l-6-6 6-6"
                />
              </svg>
              <span class="min-w-0">
                <span class="block font-mono text-[10px] uppercase tracking-widest text-muted"
                  >Previous</span
                >
                <span class="block truncate text-sm font-semibold">{{ prev.title }}</span>
              </span>
            </a>
          }
          @if (nextProject(); as next) {
            <a
              [routerLink]="['/projects', next.slug]"
              class="group flex flex-1 items-center justify-end gap-3 rounded-2xl border border-border bg-surface/60 p-4 text-right transition hover:border-accent-cyan/40 hover:bg-surface light:border-border-light light:bg-white"
            >
              <span class="min-w-0">
                <span class="block font-mono text-[10px] uppercase tracking-widest text-muted"
                  >Next</span
                >
                <span class="block truncate text-sm font-semibold">{{ next.title }}</span>
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 shrink-0 text-accent-cyan transition group-hover:translate-x-1"
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
            </a>
          }
        </nav>
      </main>
    }
  `,
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly project = signal<UniversityProject | undefined>(undefined);
  readonly prevProject = signal<UniversityProject | undefined>(undefined);
  readonly nextProject = signal<UniversityProject | undefined>(undefined);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      const projects = SITE_CONTENT.projects;
      const i = projects.findIndex((p) => p.slug === slug);
      if (i === -1) {
        this.router.navigate(['/'], { fragment: 'projects' });
        return;
      }
      const len = projects.length;
      this.project.set(projects[i]);
      this.prevProject.set(projects[(i - 1 + len) % len]);
      this.nextProject.set(projects[(i + 1) % len]);
      document.title = `${projects[i].title} | ${SITE_CONTENT.name}`;
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }
}
