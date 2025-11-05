import { Routes } from '@angular/router';
import { ProjectListComponent } from './features/projects/components/project-list/project-list.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { LanguageSelectorComponent } from './shared/components/language-selector.component';
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
    loadComponent: () => import('./features/projects/components/project-list/project-list.component')
      .then(m => m.ProjectListComponent)
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