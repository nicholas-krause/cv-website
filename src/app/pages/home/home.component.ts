import { Component } from '@angular/core';
import { AboutComponent } from '../../sections/about/about.component';
import { ContactComponent } from '../../sections/contact/contact.component';
import { HeroComponent } from '../../sections/hero/hero.component';
import { InterestsComponent } from '../../sections/interests/interests.component';
import { ProjectsComponent } from '../../sections/projects/projects.component';
import { RecentProjectsComponent } from '../../sections/recent-projects/recent-projects.component';
import { ResumeComponent } from '../../sections/resume/resume.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    AboutComponent,
    ResumeComponent,
    InterestsComponent,
    RecentProjectsComponent,
    ProjectsComponent,
    ContactComponent,
  ],
  template: `
    <main>
      <app-hero />
      <app-about />
      <app-resume />
      <app-interests />
      <app-recent-projects />
      <app-projects />
      <app-contact />
    </main>
  `,
})
export class HomeComponent {}
