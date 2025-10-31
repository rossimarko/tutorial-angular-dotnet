# Module 8: Authentication UI & Guards# Module 8: Authentication UI & Guards



## 🎯 Objectives## 🎯 Objectives



By the end of this module, you will:- ✅ Login component

- ✅ Build login component with reactive forms- ✅ Registration component

- ✅ Create registration component with validation- ✅ Auth guards for routes

- ✅ Implement auth service with token management- ✅ Token storage

- ✅ Create auth guards for route protection- ✅ Session management

- ✅ Build HTTP interceptor for automatic token injection

- ✅ Handle authentication state with signals## 📌 Status: Framework Ready

- ✅ Implement "remember me" functionality

- ✅ Add password visibility toggleImplement:

- [ ] Login component with reactive forms

## 📋 What is Authentication?- [ ] Registration component

- [ ] Auth guard for protected routes

**Authentication** is the process of verifying who a user is. In our app:- [ ] Token storage service

- Users provide credentials (email + password)- [ ] Auth state management

- Backend validates and returns JWT tokens

- Tokens are stored and sent with each API request---

- Protected routes require valid authentication

**Next: [Module 9: List, Search, Filtering](./09_list_search_filtering.md)**

### Our Authentication Flow:
```
1. User enters credentials → Login Component
2. Submit to API → Auth Service
3. Receive JWT tokens → Token Storage
4. Navigate to protected route → Auth Guard checks token
5. API requests → Interceptor adds token header
6. Token expires → Refresh or redirect to login
```

---

## 🔐 Step 1: Auth Service (Token Management)

Create folder: `frontend/project-tracker/src/app/core/services`

Create file: `frontend/project-tracker/src/app/core/services/auth.service.ts`

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/// <summary>
/// User data from token
/// </summary>
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

/// <summary>
/// Login request
/// </summary>
export interface LoginRequest {
  email: string;
  password: string;
}

/// <summary>
/// Register request
/// </summary>
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/// <summary>
/// Token response from API
/// </summary>
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/// <summary>
/// API response wrapper
/// </summary>
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/// <summary>
/// Authentication service for managing user authentication state
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // Authentication state signals
  private readonly currentUser = signal<User | null>(null);
  private readonly isAuthenticated = signal(false);
  private readonly isLoading = signal(false);
  
  // Storage keys
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly REMEMBER_ME_KEY = 'remember_me';

  constructor() {
    this.initializeAuth();
  }

  /// <summary>
  /// Initialize auth state from storage
  /// </summary>
  private initializeAuth(): void {
    const token = this.getAccessToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  /// <summary>
  /// Login user with credentials
  /// </summary>
  login(request: LoginRequest, rememberMe = false): Observable<ApiResponse<TokenResponse>> {
    this.isLoading.set(true);
    
    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data, rememberMe);
          }
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  /// <summary>
  /// Register new user
  /// </summary>
  register(request: RegisterRequest): Observable<ApiResponse<User>> {
    this.isLoading.set(true);
    
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(() => this.isLoading.set(false)),
        catchError(error => {
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  /// <summary>
  /// Logout current user
  /// </summary>
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {})
      .subscribe({
        next: () => this.handleLogout(),
        error: () => this.handleLogout() // Logout locally even if API fails
      });
  }

  /// <summary>
  /// Refresh access token
  /// </summary>
  refreshToken(): Observable<ApiResponse<TokenResponse>> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.handleLogout();
      return of({ success: false, data: {} as TokenResponse });
    }

    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(response.data.accessToken, response.data.refreshToken);
        } else {
          this.handleLogout();
        }
      }),
      catchError(() => {
        this.handleLogout();
        return of({ success: false, data: {} as TokenResponse });
      })
    );
  }

  /// <summary>
  /// Get current user info from API
  /// </summary>
  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.currentUser.set(response.data);
            this.storeUser(response.data);
          }
        })
      );
  }

  /// <summary>
  /// Handle successful authentication
  /// </summary>
  private handleAuthSuccess(tokenResponse: TokenResponse, rememberMe: boolean): void {
    this.setTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
    localStorage.setItem(this.REMEMBER_ME_KEY, rememberMe.toString());
    
    // Fetch user data
    this.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success) {
          this.isAuthenticated.set(true);
          this.router.navigate(['/projects']);
        }
      },
      error: () => {
        this.handleLogout();
      }
    });
  }

  /// <summary>
  /// Handle logout
  /// </summary>
  private handleLogout(): void {
    this.clearStorage();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  /// <summary>
  /// Store tokens
  /// </summary>
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /// <summary>
  /// Store user data
  /// </summary>
  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /// <summary>
  /// Get stored user data
  /// </summary>
  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /// <summary>
  /// Clear all auth storage
  /// </summary>
  private clearStorage(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
  }

  /// <summary>
  /// Get access token
  /// </summary>
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /// <summary>
  /// Get refresh token
  /// </summary>
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /// <summary>
  /// Check if user is authenticated
  /// </summary>
  isAuthenticatedSignal() {
    return this.isAuthenticated.asReadonly();
  }

  /// <summary>
  /// Get current user signal
  /// </summary>
  getCurrentUserSignal() {
    return this.currentUser.asReadonly();
  }

  /// <summary>
  /// Get loading state
  /// </summary>
  getLoadingSignal() {
    return this.isLoading.asReadonly();
  }

  /// <summary>
  /// Computed: User display name
  /// </summary>
  userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? user.fullName || user.email : '';
  });
}
```

---

## 🔒 Step 2: Auth Guard (Route Protection)

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

## 📨 Step 3: Auth Interceptor (Auto Token Injection)

Create file: `frontend/project-tracker/src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

/// <summary>
/// HTTP interceptor to automatically add authentication token to requests
/// Also handles 401 errors by attempting token refresh
/// </summary>
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Clone request and add Authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      // Handle 401 Unauthorized - try to refresh token
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the request with new token
            const newToken = authService.getAccessToken();
            if (newToken) {
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
            }
            return next(req);
          }),
          catchError(refreshError => {
            // Refresh failed, logout user
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
```

---

## 🖥️ Step 4: Login Component

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

## 📝 Step 5: Register Component

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

Due to length, I'll continue with the remaining files in the next response. The module includes:
- Register component HTML & CSS
- Routes configuration
- App configuration with interceptor
- Usage examples

**Should I continue with the remaining Module 8 files?**