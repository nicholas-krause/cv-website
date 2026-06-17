import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonType = 'button' | 'link' | 'anchor' | 'router';
type ButtonIcon = 'download' | 'folder' | 'external' | 'eye' | 'arrow' | 'none';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @if (type === 'link') {
      <a
        [href]="href!"
        [attr.target]="external ? '_blank' : null"
        [attr.rel]="external ? 'noopener noreferrer' : null"
        [attr.download]="download || null"
        [class]="classes"
      >
        <ng-container [ngTemplateOutlet]="iconTpl" />
        <ng-content />
      </a>
    } @else if (type === 'anchor') {
      <a [href]="href!" [class]="classes">
        <ng-container [ngTemplateOutlet]="iconTpl" />
        <ng-content />
      </a>
    } @else if (type === 'router') {
      <a [routerLink]="routerLink!" [class]="classes">
        <ng-container [ngTemplateOutlet]="iconTpl" />
        <ng-content />
      </a>
    } @else {
      <button [type]="buttonType" [class]="classes" (click)="clicked.emit($event)">
        <ng-container [ngTemplateOutlet]="iconTpl" />
        <ng-content />
      </button>
    }

    <ng-template #iconTpl>
      @switch (icon) {
        @case ('download') {
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
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
            />
          </svg>
        }
        @case ('folder') {
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
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
          </svg>
        }
        @case ('external') {
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
              d="M14 5h5v5M19 5l-7 7M11 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"
            />
          </svg>
        }
        @case ('eye') {
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
              d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"
            />
            <circle cx="12" cy="12" r="3" stroke-width="2" />
          </svg>
        }
        @case ('arrow') {
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
              d="M5 12h14M13 6l6 6-6 6"
            />
          </svg>
        }
      }
    </ng-template>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: ButtonType = 'button';
  @Input() icon: ButtonIcon = 'none';
  @Input() href?: string;
  @Input() routerLink?: string | string[];
  @Input() external = false;
  @Input() download?: string;
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<Event>();

  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan';
    const width = this.fullWidth ? 'w-full' : '';

    const variants: Record<ButtonVariant, string> = {
      primary: 'gradient-bg text-base hover:opacity-90 shadow-lg shadow-accent-blue/20',
      secondary:
        'border border-accent-cyan/40 bg-transparent text-accent-cyan hover:bg-accent-cyan/10',
      ghost:
        'border border-border bg-transparent text-muted hover:border-accent-cyan/30 hover:text-text',
    };

    return `${base} ${width} ${variants[this.variant]}`;
  }
}
