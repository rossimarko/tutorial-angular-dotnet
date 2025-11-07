import { Injectable, signal, effect } from '@angular/core';

/// <summary>
/// Theme types supported by Bootstrap 5.3+
/// </summary>
export type Theme = 'light' | 'dark' | 'auto';

/// <summary>
/// Service for managing application theme using Bootstrap's native dark mode
/// Sets data-bs-theme attribute on <html> element
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Apply theme whenever it changes
    effect(() => {
      this.applyTheme(this.theme());
    });

    // Listen for system theme changes
    this.watchSystemTheme();
  }

  /// <summary>
  /// Get current theme as readonly signal
  /// </summary>
  getTheme() {
    return this.theme.asReadonly();
  }

  /// <summary>
  /// Set theme and persist to localStorage
  /// </summary>
  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /// <summary>
  /// Toggle between light and dark
  /// </summary>
  toggleTheme(): void {
    const current = this.theme();
    const next: Theme = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  /// <summary>
  /// Get initial theme from localStorage or default to auto
  /// </summary>
  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored;
    }
    return 'auto';
  }

  /// <summary>
  /// Apply theme to document using Bootstrap's data-bs-theme attribute
  /// </summary>
  private applyTheme(theme: Theme): void {
    let actualTheme: 'light' | 'dark';

    if (theme === 'auto') {
      // Use system preference
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      actualTheme = theme;
    }

    // Set Bootstrap's data-bs-theme attribute
    document.documentElement.setAttribute('data-bs-theme', actualTheme);
  }

  /// <summary>
  /// Watch for system theme changes when in auto mode
  /// </summary>
  private watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', () => {
      if (this.theme() === 'auto') {
        this.applyTheme('auto');
      }
    });
  }
}