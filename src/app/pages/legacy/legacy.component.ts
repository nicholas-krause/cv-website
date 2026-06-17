import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SITE_CONTENT } from '../../data/site-content';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-legacy',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="flex min-h-[calc(100vh-4rem)] flex-col">
      @if (useBundled()) {
        <iframe
          [src]="bundledUrl"
          title="Legacy website"
          class="min-h-[calc(100vh-4rem)] w-full flex-1 border-0 bg-white"
        ></iframe>
      } @else {
        <div
          class="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center"
        >
          <p class="font-mono text-sm text-accent-cyan uppercase">Legacy site</p>
          <h1 class="mt-3 text-2xl font-bold">Bundled legacy site not available</h1>
          <p class="mt-4 text-muted">
            The previous version of this website can be viewed at the live URL below.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <app-button variant="primary" type="link" [href]="fallbackUrl" [external]="true">
              Open Legacy Site
            </app-button>
            <app-button variant="secondary" type="router" routerLink="/">Back to Home</app-button>
          </div>
        </div>
      }
    </div>
  `,
})
export class LegacyComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly content = SITE_CONTENT;
  readonly fallbackUrl = this.content.legacy.fallbackUrl;
  readonly useBundled = signal(false);
  bundledUrl: SafeResourceUrl = '';

  ngOnInit(): void {
    const path = this.content.legacy.bundledPath;
    fetch(path, { method: 'HEAD' })
      .then((response) => {
        if (response.ok) {
          this.bundledUrl = this.sanitizer.bypassSecurityTrustResourceUrl(path);
          this.useBundled.set(true);
        }
      })
      .catch(() => this.useBundled.set(false));
  }
}
