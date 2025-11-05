import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard] // Redirect logged-in users away from login
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard] // Redirect logged-in users away from register
  }
];