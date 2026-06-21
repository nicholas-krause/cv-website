import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionComponent } from '../../ui/section/section.component';

@Component({
  selector: 'app-recent-projects',
  standalone: true,
  imports: [SectionComponent, RouterLink, RevealDirective],
  template: `
    <app-section
      id="recent"
      kicker="04 / Recent Projects"
      heading="Recent Projects"
      description="Personal projects and interactive demos built outside of coursework."
    >
      <a
        routerLink="/genetic-algorithm"
        appReveal
        class="block rounded-2xl border border-accent-cyan/40 bg-surface/80 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:shadow-accent-cyan/10 light:bg-white"
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
export class RecentProjectsComponent {}
