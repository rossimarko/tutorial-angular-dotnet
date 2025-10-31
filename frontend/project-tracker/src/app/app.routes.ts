import { Routes } from '@angular/router';
import { ProjectListComponent } from '../features/projects/components/project-list/project-list.component';

export const routes: Routes = [
  {
    path: 'projects',
    component: ProjectListComponent
  },
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full'
  }
];