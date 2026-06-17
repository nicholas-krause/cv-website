import { Component } from '@angular/core';
import { SITE_CONTENT } from '../../data/site-content';
import { RevealDirective } from '../../directives/reveal.directive';
import { CardComponent } from '../../ui/card/card.component';
import { SectionComponent } from '../../ui/section/section.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionComponent, CardComponent, RevealDirective],
  template: `
    <app-section id="about" kicker="01 / About" heading="About Me">
      <div class="grid gap-8 lg:grid-cols-2">
        <div appReveal class="space-y-4 text-muted leading-relaxed">
          @for (paragraph of content.aboutParagraphs; track paragraph) {
            <p>{{ paragraph }}</p>
          }
        </div>

        <app-card appReveal extraClass="h-fit">
          <h3 class="text-lg font-semibold">Quick Facts</h3>
          <dl class="mt-4 space-y-3">
            @for (fact of content.quickFacts; track fact.label) {
              <div
                class="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-0 light:border-border-light/80"
              >
                <dt class="font-mono text-xs tracking-wide text-accent-cyan uppercase">
                  {{ fact.label }}
                </dt>
                <dd class="text-sm">{{ fact.value }}</dd>
              </div>
            }
          </dl>
        </app-card>
      </div>
    </app-section>
  `,
})
export class AboutComponent {
  readonly content = SITE_CONTENT;
}
