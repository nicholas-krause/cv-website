import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'projects/:slug',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
  },
  {
    path: 'legacy',
    loadComponent: () => import('./pages/legacy/legacy.component').then((m) => m.LegacyComponent),
  },
  {
    path: 'genetic-algorithm',
    loadComponent: () =>
      import('./pages/dino-neat/dino-neat.component').then((m) => m.DinoNeatComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
