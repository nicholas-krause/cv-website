import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './layout/footer/footer.component';
import { NavbarComponent } from './layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="flex min-h-screen flex-col">
      <app-navbar />
      <div class="flex-1">
        <router-outlet />
      </div>
      <app-footer />
    </div>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {}
