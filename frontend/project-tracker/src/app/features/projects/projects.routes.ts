import { Routes } from '@angular/router';

export const projectRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/project-list/project-list.component')
      .then(m => m.ProjectListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/project-form/project-form.component')
      .then(m => m.ProjectFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/project-form/project-form.component')
      .then(m => m.ProjectFormComponent)
  }
];