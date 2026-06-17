import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(true);

  constructor() {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      this.setLight(false);
    } else if (stored === 'dark') {
      this.setDark(false);
    } else {
      this.applyTheme();
    }
  }

  toggle(): void {
    if (this.isDark()) {
      this.setLight();
    } else {
      this.setDark();
    }
  }

  private setDark(persist = true): void {
    this.isDark.set(true);
    this.applyTheme();
    if (persist) {
      localStorage.setItem('theme', 'dark');
    }
  }

  private setLight(persist = true): void {
    this.isDark.set(false);
    this.applyTheme();
    if (persist) {
      localStorage.setItem('theme', 'light');
    }
  }

  private applyTheme(): void {
    const root = document.documentElement;
    root.classList.toggle('dark', this.isDark());
    root.classList.toggle('light', !this.isDark());
  }
}
