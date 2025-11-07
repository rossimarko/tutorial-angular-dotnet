import { Routes } from '@angular/router';
import { ProjectListComponent } from './features/projects/components/project-list/project-list.component';
import { ProjectFormComponent } from './features/projects/components/project-form/project-form.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { LanguageSelectorComponent } from './shared/components/language-selector/language-selector.component';
import { authGuard } from './core/guards/auth.guard';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  // Public auth routes
  {
    path: 'auth',
    children: authRoutes
  },
  
  // Protected project routes (require authentication)
  {
    path: 'projects',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ProjectListComponent
      },
      {
        path: 'create',
        component: ProjectFormComponent
      },
      {
        path: ':id/edit',
        component: ProjectFormComponent
      }
    ]
  },
  
  // Default redirect
  {
    path: '',
    redirectTo: '/projects',
    pathMatch: 'full'
  },
  
  // 404 redirect
  {
    path: '**',
    redirectTo: '/projects'
  }
];