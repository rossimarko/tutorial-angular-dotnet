# Module 8: Authentication UI & Guards

## 🎯 Objectives

By the end of this module, you will:
- ✅ Implement authentication guards for route protection
- ✅ Build login component with reactive forms
- ✅ Create registration component with validation
- ✅ Add "remember me" functionality
- ✅ Implement password visibility toggle
- ✅ Understand the complete authentication flow

## 📌 Status: Building on Module 6

**Important**: This module builds on the authentication foundation from **Module 6**, which already provides:
- ✅ AuthService with token management
- ✅ HTTP interceptor for automatic token injection
- ✅ Token storage and refresh logic
- ✅ Authentication state management with signals

**This module adds**:
- ✅ Auth Guards for route protection
- ✅ Login & Register UI Components
- ✅ Reactive form validation
- ✅ User-friendly authentication flows

---

## 📋 Prerequisites: Module 6 Setup

Before starting this module, ensure you have completed **Module 6: Angular Setup**, which includes:

1. **AuthService** at `src/app/shared/services/auth.service.ts` with:
   - Token storage and retrieval
   - Login and register methods
   - Token refresh logic
   - User state management with signals

2. **Auth HTTP Interceptor** at `src/app/shared/services/auth.http-interceptor.ts` with:
   - Automatic Bearer token injection
   - 401 error handling
   - Token refresh on expiration

3. **HTTP Client** configured in `app.config.ts` with the interceptor

If you haven't completed Module 6, please do so first as it's the foundation for this module.

---

## 🔐 Authentication Flow

```
1. User enters credentials → Login Component
2. Submit to API → AuthService (from Module 6)
3. Receive JWT tokens → Token Storage (Module 6)
4. Navigate to protected route → Auth Guard (this module)
5. API requests → Interceptor adds token (Module 6)
6. Token expires → Refresh or redirect to login (Module 6)
```

---

## Step 1: Create Auth Guards for Route Protection

> **Note**: The `AuthService` and `authHttpInterceptor` referenced here are created in **Module 6**. Refer to that module if you haven't implemented them yet.

Create folder: `frontend/project-tracker/src/app/core/guards`

Create file: `frontend/project-tracker/src/app/core/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/// <summary>
/// Auth guard to protect routes from unauthorized access
/// Usage in routes: canActivate: [authGuard]
/// </summary>
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticatedSignal()()) {
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

  if (authService.isAuthenticatedSignal()()) {
    router.navigate(['/projects']);
    return false;
  }

  return true;
};
```

---

## Step 2: Create Login Component

> **Note**: The HTTP interceptor for automatic token injection is already configured in **Module 6**. It automatically adds the JWT token to all API requests (except `/auth/` endpoints) and handles 401 errors with token refresh.

Create folder: `frontend/project-tracker/src/app/features/auth/login`

Create file: `frontend/project-tracker/src/app/features/auth/login/login.component.ts`

```typescript
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/// <summary>
/// Login component with reactive form validation
/// </summary>
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loginForm: FormGroup;
  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = this.authService.getLoadingSignal();
  protected readonly showPassword = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  /// <summary>
  /// Handle form submission
  /// </summary>
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.errorMessage.set('');
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }, rememberMe).subscribe({
      next: (response) => {
        if (response.success) {
          // Navigation handled by authService
        } else {
          this.errorMessage.set(response.message || 'Login failed');
        }
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Invalid email or password'
        );
      }
    });
  }

  /// <summary>
  /// Toggle password visibility
  /// </summary>
  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  /// <summary>
  /// Mark all form fields as touched to show validation errors
  /// </summary>
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /// <summary>
  /// Check if field has error and is touched
  /// </summary>
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }
}
```

Create file: `frontend/project-tracker/src/app/features/auth/login/login.component.html`

```html
<div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
  <div class="row w-100">
    <div class="col-12 col-md-6 col-lg-4 mx-auto">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <!-- Header -->
          <div class="text-center mb-4">
            <h2 class="fw-bold">{{ 'auth.login' | translate }}</h2>
            <p class="text-muted">{{ 'auth.loginWelcome' | translate }}</p>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>
              {{ errorMessage() }}
              <button 
                type="button" 
                class="btn-close" 
                (click)="errorMessage.set('')"
                aria-label="Close"></button>
            </div>
          }

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email Field -->
            <div class="mb-3">
              <label for="email" class="form-label">
                {{ 'auth.email' | translate }}
                <span class="text-danger">*</span>
              </label>
              <input
                type="email"
                id="email"
                class="form-control"
                [class.is-invalid]="hasError('email', 'required') || hasError('email', 'email')"
                formControlName="email"
                [placeholder]="'auth.email' | translate"
                autocomplete="email">
              
              @if (hasError('email', 'required')) {
                <div class="invalid-feedback">
                  {{ 'validation.required' | translate }}
                </div>
              }
              @if (hasError('email', 'email')) {
                <div class="invalid-feedback">
                  {{ 'validation.email' | translate }}
                </div>
              }
            </div>

            <!-- Password Field -->
            <div class="mb-3">
              <label for="password" class="form-label">
                {{ 'auth.password' | translate }}
                <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  id="password"
                  class="form-control"
                  [class.is-invalid]="hasError('password', 'required') || hasError('password', 'minlength')"
                  formControlName="password"
                  [placeholder]="'auth.password' | translate"
                  autocomplete="current-password">
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  (click)="togglePasswordVisibility()">
                  <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              
              @if (hasError('password', 'required')) {
                <div class="invalid-feedback d-block">
                  {{ 'validation.required' | translate }}
                </div>
              }
              @if (hasError('password', 'minlength')) {
                <div class="invalid-feedback d-block">
                  {{ 'validation.minLength' | translate:{'min': 6} }}
                </div>
              }
            </div>

            <!-- Remember Me Checkbox -->
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="rememberMe"
                formControlName="rememberMe">
              <label class="form-check-label" for="rememberMe">
                {{ 'auth.rememberMe' | translate }}
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary w-100 mb-3"
              [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ 'common.loading' | translate }}
              } @else {
                {{ 'auth.login' | translate }}
              }
            </button>

            <!-- Register Link -->
            <div class="text-center">
              <p class="text-muted mb-0">
                {{ 'auth.noAccount' | translate }}
                <a routerLink="/auth/register" class="text-primary text-decoration-none">
                  {{ 'auth.register' | translate }}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
```

Create file: `frontend/project-tracker/src/app/features/auth/login/login.component.css`

```css
.card {
  border-radius: 12px;
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  padding: 0.75rem;
  font-weight: 500;
}

.input-group .btn {
  border-left: 0;
}

.input-group .form-control:focus + .btn {
  border-color: var(--bs-primary);
}
```

---

## Step 3: Create Register Component

Create folder: `frontend/project-tracker/src/app/features/auth/register`

Create file: `frontend/project-tracker/src/app/features/auth/register/register.component.ts`

```typescript
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/// <summary>
/// Registration component with password confirmation validation
/// </summary>
@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly registerForm: FormGroup;
  protected readonly errorMessage = signal<string>('');
  protected readonly successMessage = signal<string>('');
  protected readonly isLoading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /// <summary>
  /// Custom validator to check if passwords match
  /// </summary>
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /// <summary>
  /// Handle form submission
  /// </summary>
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { firstName, lastName, email, password } = this.registerForm.value;

    this.authService.register({ firstName, lastName, email, password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.successMessage.set('Registration successful! Redirecting to login...');
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.errorMessage.set(response.message || 'Registration failed');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Registration failed. Please try again.'
        );
      }
    });
  }

  /// <summary>
  /// Toggle password visibility
  /// </summary>
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.update(show => !show);
    } else {
      this.showConfirmPassword.update(show => !show);
    }
  }

  /// <summary>
  /// Mark all form fields as touched
  /// </summary>
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  /// <summary>
  /// Check if field has error and is touched
  /// </summary>
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  /// <summary>
  /// Check if form has password mismatch error
  /// </summary>
  hasPasswordMismatch(): boolean {
    return !!(
      this.registerForm.hasError('passwordMismatch') &&
      this.registerForm.get('confirmPassword')?.touched
    );
  }
}
```

---

## Step 4: Configure Routes

Create or update file: `frontend/project-tracker/src/app/features/auth/auth.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

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
```

---

## Step 5: Configure App Routes with Guards

Update file: `frontend/project-tracker/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
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
```

---

## Step 6: Configure App Config with Guards

Update file: `frontend/project-tracker/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authHttpInterceptor } from './shared/services/auth.http-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // HTTP client with auth interceptor (configured in Module 6)
    provideHttpClient(withInterceptors([authHttpInterceptor]))
  ]
};
```

---

## 🔄 Complete Authentication Flow Example

### 1. User Logs In

```typescript
// In login component
this.authService.login({ email, password }, rememberMe).subscribe({
  next: (response) => {
    if (response.success) {
      // AuthService handles navigation automatically
      // User is redirected to /projects
    }
  },
  error: (error) => {
    this.errorMessage.set(error.error?.message || 'Login failed');
  }
});
```

### 2. User Navigates to Protected Route

```typescript
// authGuard checks authentication status
if (authService.isAuthenticatedSignal()()) {
  return true; // Allow access
} else {
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false; // Deny access
}
```

### 3. API Request with Auto-Token Injection

```typescript
// Component makes API call
this.projectService.loadProjects(); // Observable call

// Behind the scenes in authHttpInterceptor:
// - Gets token: authService.getAccessToken()
// - Adds header: Authorization: Bearer {token}
// - Sends request to /api/projects
```

### 4. Token Refresh on 401

```typescript
// If server returns 401 (token expired):
// 1. Interceptor catches the error
// 2. Calls authService.refreshToken()
// 3. If successful: retries original request with new token
// 4. If failed: logs user out and redirects to login
```

---

## ✅ Implementation Checklist

- [ ] AuthService created in Module 6
- [ ] Auth HTTP Interceptor created in Module 6
- [ ] Auth guards implemented (`authGuard`, `guestGuard`)
- [ ] Login component created with reactive form
- [ ] Register component created with validation
- [ ] Auth routes configured
- [ ] App routes configured with guards
- [ ] App config includes HTTP interceptor
- [ ] Test login flow end-to-end

---

## 🧪 Testing the Authentication Flow

### Test Login

1. Start the development server: `npm start`
2. Navigate to `http://localhost:4200/auth/login`
3. Enter test credentials
4. Click login
5. Should be redirected to `/projects`

### Test Route Protection

1. Try to navigate to `http://localhost:4200/projects` without logging in
2. Should be redirected to `/auth/login`

### Test Logout

1. Login successfully
2. Click logout button (in navbar)
3. Should be redirected to `/auth/login`

### Test Guest Guard

1. Login successfully
2. Try to navigate to `http://localhost:4200/auth/login`
3. Should be redirected to `/projects`

---

## 📚 Key Concepts Recap

| Concept | Purpose | Module |
|---------|---------|--------|
| **AuthService** | Manages tokens, login, register, logout | Module 6 |
| **Auth Interceptor** | Auto-injects tokens, handles 401 errors | Module 6 |
| **Auth Guard** | Protects routes from unauthorized access | This Module |
| **Guest Guard** | Redirects logged-in users from auth pages | This Module |
| **Login Component** | UI for user authentication | This Module |
| **Register Component** | UI for user registration | This Module |

---

## 🔗 Integration with Other Modules

This module integrates with:
- **Module 6**: Provides AuthService and HTTP Interceptor foundation
- **Module 9**: List & Search (uses protected routes with authGuard)
- **Module 11**: CRUD Operations (uses protected routes with authGuard)

---

**✅ Module Complete! Next: [Module 9: List, Search, Filtering](./09_list_search_filtering.md)**

Congratulations! You now have:
- ✅ Authentication UI (Login & Register)
- ✅ Route protection with guards
- ✅ Automatic token management and injection
- ✅ User-friendly error handling
- ✅ Responsive authentication flow