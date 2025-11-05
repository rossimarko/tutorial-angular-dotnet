import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

/// <summary>
/// Auth guard to protect routes from unauthorized access
/// Usage in routes: canActivate: [authGuard]
/// </summary>
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated$()()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};

/// <summary>
/// Guest guard to prevent authenticated users from accessing auth pages
/// Usage: Redirect logged-in users away from login/register
/// </summary>
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated$()()) {
    router.navigate(['/projects']);
    return false;
  }

  return true;
};