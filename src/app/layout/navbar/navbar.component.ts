import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_SECTIONS, SITE_CONTENT } from '../../data/site-content';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header
      class="sticky top-0 z-50 border-b border-border/80 bg-base/90 backdrop-blur-md light:border-border-light light:bg-surface-light/90"
    >
      <nav
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <a routerLink="/" class="flex items-center gap-3 font-semibold">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-cyan/40 bg-surface font-mono text-sm text-accent-cyan"
          >
            {{ content.monogram }}
          </span>
          <span class="hidden sm:inline">{{ content.name }}</span>
        </a>

        <div class="hidden items-center gap-6 md:flex">
          @for (section of sections; track section.id) {
            <a
              [routerLink]="['/']"
              [fragment]="section.id"
              class="text-sm text-muted transition hover:text-accent-cyan"
            >
              {{ section.label }}
            </a>
          }
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            (click)="theme.toggle()"
            class="rounded-xl border border-border p-2.5 text-muted transition hover:border-accent-cyan/40 hover:text-accent-cyan light:border-border-light"
            [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (theme.isDark()) {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314 1.414 1.414m9.9 9.9 1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                />
              </svg>
            }
          </button>

          <button
            type="button"
            class="rounded-xl border border-border p-2.5 text-muted transition hover:border-accent-cyan/40 hover:text-accent-cyan md:hidden light:border-border-light"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              @if (menuOpen()) {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              } @else {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              }
            </svg>
          </button>
        </div>
      </nav>

      @if (menuOpen()) {
        <div
          id="mobile-menu"
          class="border-t border-border px-4 py-4 md:hidden light:border-border-light"
        >
          <div class="flex flex-col gap-3">
            @for (section of sections; track section.id) {
              <a
                [routerLink]="['/']"
                [fragment]="section.id"
                class="rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-accent-cyan"
                (click)="menuOpen.set(false)"
              >
                {{ section.label }}
              </a>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  readonly content = SITE_CONTENT;
  readonly sections = NAV_SECTIONS;
  readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);
}
