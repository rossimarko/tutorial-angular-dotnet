import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // State management - initialize with null, will be set in constructor
  private readonly accessToken = signal<string | null>(null);
  private readonly isAuthenticated = computed(() => this.accessToken() !== null);
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    // Initialize from localStorage
    const storedToken = this.getStoredToken();
    console.log('AuthService: Constructor called, initializing from localStorage:', { hasToken: !!storedToken });
    this.accessToken.set(storedToken);
    this.tokenSubject.next(storedToken);
  }

  /**
   * Login with email and password
   */
  login(request: LoginRequest) {
    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/login`, request);
  }

  /**
   * Register a new user
   */
  register(request: any) {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, request);
  }

  /**
   * Store token after successful login
   */
  setToken(token: string, refreshToken: string) {
    console.debug('AuthService: Setting tokens', { token: token.substring(0, 20) + '...', refreshToken: refreshToken.substring(0, 20) + '...' });
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    this.accessToken.set(token);
    this.tokenSubject.next(token);
    console.debug('AuthService: Tokens stored, isAuthenticated:', this.isAuthenticated());
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    const token = this.accessToken();
    console.log('AuthService.getToken(): Called', { 
      hasToken: !!token, 
      tokenLength: token ? token.length : 0 
    });
    return token;
  }

  /**
   * Get token as observable (for backward compatibility)
   */
  getToken$() {
    return this.tokenSubject.asObservable();
  }

  /**
   * Get authentication state as readonly signal
   */
  isAuthenticated$() {
    return this.isAuthenticated;
  }

  /**
   * Logout and clear tokens
   */
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken.set(null);
    this.tokenSubject.next(null);
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }
}
