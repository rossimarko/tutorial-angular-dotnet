import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, TokenResponse } from '../../../../core/services/auth.service';
import { ApiResponse } from '../../../../core/services/auth.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loginForm: FormGroup;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isLoading = computed(() => this.loading());

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  protected onSubmit() {
    if (this.loginForm.invalid) {
      this.error.set('Please enter valid email and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.loginForm.disable();

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: ApiResponse<TokenResponse>) => {
        if (response.success && response.data) {
          console.log('LoginComponent: Login successful, storing token');
          this.authService.setToken(response.data.accessToken, response.data.refreshToken);
          console.log('LoginComponent: Token stored, checking localStorage...');
          console.log('LoginComponent: accessToken in localStorage:', localStorage.getItem('accessToken')?.substring(0, 50) + '...');
          console.log('LoginComponent: refreshToken in localStorage:', localStorage.getItem('refreshToken')?.substring(0, 50) + '...');
          this.router.navigate(['/projects']);
        } else {
          this.error.set(response.message || 'Login failed');
          this.loginForm.enable();
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.error.set(err.error?.message || 'Login failed. Please try again.');
        this.loginForm.enable();
        this.loading.set(false);
      }
    });
  }

  protected getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.hasError('required')) {
      return `${fieldName} is required`;
    }

    if (field.hasError('email')) {
      return 'Please enter a valid email';
    }

    if (field.hasError('minlength')) {
      return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }

    return null;
  }
}
