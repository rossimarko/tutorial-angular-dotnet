import { Routes } from '@angular/router';
import { ProjectListComponent } from '../features/projects/components/project-list/project-list.component';
import { LoginComponent } from '../features/auth/components/login/login.component';
import { LanguageSelectorComponent } from '../shared/components/language-selector.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'projects',
    component: ProjectListComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];