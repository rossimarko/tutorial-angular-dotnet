import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { LoggerService } from '../../shared/services/logger.service';

export interface User {
  name: string;
  email: string;
  role: string;
}

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
  private readonly logger = inject(LoggerService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // State management - initialize with null, will be set in constructor
  private readonly accessToken = signal<string | null>(null);
  private readonly isAuthenticated = computed(() => this.accessToken() !== null);
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  readonly currentUser = signal<User | null>(null);

  constructor() {
    // Initialize from localStorage
    const storedToken = this.getStoredToken();
    this.logger.debug('AuthService: Constructor called, initializing from localStorage', { hasToken: !!storedToken });
    this.accessToken.set(storedToken);
    this.tokenSubject.next(storedToken);
    if (storedToken) {
      this.decodeAndSetUser(storedToken);
    }
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
    this.logger.debug('AuthService: Setting tokens', { token: token.substring(0, 20) + '...', refreshToken: refreshToken.substring(0, 20) + '...' });
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    this.accessToken.set(token);
    this.tokenSubject.next(token);
    this.decodeAndSetUser(token);
    this.logger.debug('AuthService: Tokens stored, isAuthenticated:', { isAuthenticated: this.isAuthenticated() });
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    // Always check localStorage as a fallback (in case signal wasn't initialized properly)
    let token = this.accessToken();
    if (!token) {
      token = this.getStoredToken();
      if (token) {
        this.logger.warning('AuthService.getToken(): Token found in localStorage but not in signal, re-initializing');
        this.accessToken.set(token);
        this.tokenSubject.next(token);
        this.decodeAndSetUser(token);
      }
    }
    this.logger.debug('AuthService.getToken(): Called', { 
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
    this.currentUser.set(null);
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

  /**
   * Decode token and set user signal
   */
  private decodeAndSetUser(token: string) {
    try {
      const decodedToken: any = jwtDecode(token);
      // JWT token uses given_name and family_name, combine them for display
      const firstName = decodedToken.given_name || '';
      const lastName = decodedToken.family_name || '';
      const name = `${firstName} ${lastName}`.trim() || decodedToken.email || 'User';

      this.currentUser.set({
        name: name,
        email: decodedToken.email,
        role: decodedToken.role || 'User'
      });
      this.logger.debug('AuthService: User decoded and set', this.currentUser());
    } catch (error) {
      this.logger.error('AuthService: Failed to decode token', error);
      this.currentUser.set(null);
    }
  }
}
