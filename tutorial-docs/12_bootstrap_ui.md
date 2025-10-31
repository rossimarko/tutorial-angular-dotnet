# Module 12: Bootstrap UI & Advanced Styling# Module 12: UI/UX with Bootstrap 5



## 🎯 Objectives## 🎯 Objectives



By the end of this module, you will:- ✅ Bootstrap integration

- ✅ Master Bootstrap 5 responsive grid system- ✅ Responsive layouts

- ✅ Create custom CSS variables for theming- ✅ Form styling

- ✅ Implement dark mode toggle- ✅ Modal dialogs

- ✅ Build accessible UI components- ✅ Accessibility

- ✅ Use Bootstrap utilities effectively

- ✅ Create responsive navigation## 📌 Status: Framework Ready

- ✅ Implement modals, tooltips, and popovers

- ✅ Optimize CSS for productionImplement:

- [ ] Bootstrap responsive grid

## 📋 What is Bootstrap?- [ ] Navigation bar styling

- [ ] Form component styling

**Bootstrap** is the world's most popular CSS framework for building responsive, mobile-first websites. It provides:- [ ] Modal dialogs

- **Grid System**: 12-column responsive layout- [ ] Toast notifications

- **Components**: Pre-built UI elements (buttons, cards, modals)- [ ] Accessibility attributes

- **Utilities**: Spacing, colors, display, flex helpers- [ ] Dark mode support (optional)

- **JavaScript**: Interactive components (dropdowns, modals, tooltips)

---

### Why Bootstrap 5?

- ✅ No jQuery dependency (pure JavaScript)**Next: [Module 13: Logging & Performance](./13_logging_performance.md)**

- ✅ Improved grid with CSS Grid support
- ✅ Custom CSS properties (variables)
- ✅ Reduced file size
- ✅ Enhanced accessibility

---

## 🎨 Step 1: Custom Theme with CSS Variables

Create file: `frontend/project-tracker/src/styles/theme.css`

```css
/**
 * Custom theme using CSS variables
 * Extends Bootstrap 5 with custom colors and spacing
 */

:root {
  /* Primary Color Palette */
  --color-primary: #0d6efd;
  --color-primary-dark: #0b5ed7;
  --color-primary-light: #6ea8fe;
  --color-primary-rgb: 13, 110, 253;

  /* Secondary Colors */
  --color-secondary: #6c757d;
  --color-success: #198754;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #0dcaf0;

  /* Neutral Colors */
  --color-light: #f8f9fa;
  --color-dark: #212529;
  --color-white: #ffffff;
  --color-black: #000000;

  /* Background Colors */
  --bg-body: #ffffff;
  --bg-surface: #f8f9fa;
  --bg-overlay: rgba(0, 0, 0, 0.5);

  /* Text Colors */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #6c757d;
  --text-disabled: #adb5bd;

  /* Border */
  --border-color: #dee2e6;
  --border-radius: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-sm: 0.25rem;

  /* Shadows */
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --font-size-base: 1rem;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.25rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Transitions */
  --transition-base: all 0.3s ease-in-out;
  --transition-fast: all 0.15s ease-in-out;
}

/* Dark Mode Theme */
[data-bs-theme="dark"] {
  --bg-body: #212529;
  --bg-surface: #343a40;
  --bg-overlay: rgba(0, 0, 0, 0.7);

  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --text-muted: #6c757d;
  --text-disabled: #495057;

  --border-color: #495057;

  --color-primary: #0d6efd;
  --color-primary-dark: #0a58ca;
  --color-primary-light: #6ea8fe;
}

/* Apply theme variables to body */
body {
  background-color: var(--bg-body);
  color: var(--text-primary);
  font-family: var(--font-family-base);
  transition: var(--transition-base);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-surface);
}

::-webkit-scrollbar-thumb {
  background: var(--color-secondary);
  border-radius: var(--border-radius);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
```

---

## 🌓 Step 2: Dark Mode Service

Create file: `frontend/project-tracker/src/app/shared/services/theme.service.ts`

```typescript
import { Injectable, signal, effect } from '@angular/core';

/// <summary>
/// Theme types supported
/// </summary>
export type Theme = 'light' | 'dark' | 'auto';

/// <summary>
/// Service for managing application theme (light/dark mode)
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
  /// Set theme
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
  /// Get initial theme from localStorage or system preference
  /// </summary>
  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored;
    }
    return 'auto';
  }

  /// <summary>
  /// Apply theme to document
  /// </summary>
  private applyTheme(theme: Theme): void {
    let actualTheme: 'light' | 'dark';

    if (theme === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      actualTheme = theme;
    }

    document.documentElement.setAttribute('data-bs-theme', actualTheme);
  }

  /// <summary>
  /// Watch for system theme changes when in auto mode
  /// </summary>
  private watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (this.theme() === 'auto') {
        this.applyTheme('auto');
      }
    });
  }
}
```

---

## 🔘 Step 3: Theme Toggle Component

Create file: `frontend/project-tracker/src/app/shared/components/theme-toggle/theme-toggle.component.ts`

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Theme toggle button component
/// </summary>
@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  
  protected readonly currentTheme = this.themeService.getTheme();
  protected readonly themeOptions: Theme[] = ['light', 'dark', 'auto'];

  /// <summary>
  /// Set theme
  /// </summary>
  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  /// <summary>
  /// Get icon for theme
  /// </summary>
  getThemeIcon(theme: Theme): string {
    const icons: Record<Theme, string> = {
      light: 'fas fa-sun',
      dark: 'fas fa-moon',
      auto: 'fas fa-circle-half-stroke'
    };
    return icons[theme];
  }

  /// <summary>
  /// Get label for theme
  /// </summary>
  getThemeLabel(theme: Theme): string {
    return `theme.${theme}`;
  }
}
```

Create file: `frontend/project-tracker/src/app/shared/components/theme-toggle/theme-toggle.component.html`

```html
<div class="btn-group" role="group" aria-label="Theme selector">
  @for (theme of themeOptions; track theme) {
    <button
      type="button"
      class="btn btn-sm"
      [class.btn-primary]="currentTheme() === theme"
      [class.btn-outline-secondary]="currentTheme() !== theme"
      (click)="setTheme(theme)"
      [attr.aria-label]="getThemeLabel(theme) | translate"
      [title]="getThemeLabel(theme) | translate">
      <i [class]="getThemeIcon(theme)"></i>
      <span class="d-none d-md-inline ms-2">
        {{ getThemeLabel(theme) | translate }}
      </span>
    </button>
  }
</div>
```

Create file: `frontend/project-tracker/src/app/shared/components/theme-toggle/theme-toggle.component.css`

```css
.btn-group {
  box-shadow: var(--shadow-sm);
}

.btn {
  transition: var(--transition-fast);
}

.btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(var(--color-primary-rgb), 0.25);
}
```

---

## 🧭 Step 4: Enhanced Navigation Bar

Create file: `frontend/project-tracker/src/app/layouts/navbar/navbar.component.ts`

```typescript
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/// <summary>
/// Main navigation bar component
/// </summary>
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, ThemeToggleComponent, LanguageSelectorComponent, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  
  protected readonly isAuthenticated = this.authService.isAuthenticatedSignal();
  protected readonly currentUser = this.authService.getCurrentUserSignal();
  protected readonly isCollapsed = signal(true);

  /// <summary>
  /// Toggle mobile menu
  /// </summary>
  toggleMenu(): void {
    this.isCollapsed.update(collapsed => !collapsed);
  }

  /// <summary>
  /// Close menu (after navigation on mobile)
  /// </summary>
  closeMenu(): void {
    this.isCollapsed.set(true);
  }

  /// <summary>
  /// Logout user
  /// </summary>
  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}
```

Create file: `frontend/project-tracker/src/app/layouts/navbar/navbar.component.html`

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
  <div class="container-fluid">
    <!-- Brand -->
    <a class="navbar-brand d-flex align-items-center" routerLink="/">
      <i class="fas fa-project-diagram me-2"></i>
      <span class="fw-bold">{{ 'app.title' | translate }}</span>
    </a>

    <!-- Mobile Toggle -->
    <button
      class="navbar-toggler"
      type="button"
      (click)="toggleMenu()"
      [attr.aria-expanded]="!isCollapsed()"
      aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Navbar Content -->
    <div class="collapse navbar-collapse" [class.show]="!isCollapsed()">
      @if (isAuthenticated()) {
        <!-- Authenticated Menu -->
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a
              class="nav-link"
              routerLink="/dashboard"
              routerLinkActive="active"
              (click)="closeMenu()">
              <i class="fas fa-home me-1"></i>
              {{ 'nav.dashboard' | translate }}
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              routerLink="/projects"
              routerLinkActive="active"
              (click)="closeMenu()">
              <i class="fas fa-folder me-1"></i>
              {{ 'nav.projects' | translate }}
            </a>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="fas fa-cog me-1"></i>
              {{ 'nav.settings' | translate }}
            </a>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" routerLink="/profile" (click)="closeMenu()">
                  <i class="fas fa-user me-2"></i>
                  {{ 'nav.profile' | translate }}
                </a>
              </li>
              <li>
                <a class="dropdown-item" routerLink="/settings" (click)="closeMenu()">
                  <i class="fas fa-sliders-h me-2"></i>
                  {{ 'nav.preferences' | translate }}
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item text-danger" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  {{ 'nav.logout' | translate }}
                </button>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Right Side Tools -->
        <div class="d-flex align-items-center gap-3">
          <!-- Theme Toggle -->
          <app-theme-toggle></app-theme-toggle>

          <!-- Language Selector -->
          <app-language-selector></app-language-selector>

          <!-- User Info -->
          <div class="dropdown">
            <button
              class="btn btn-outline-light btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="fas fa-user-circle me-1"></i>
              <span class="d-none d-lg-inline">{{ currentUser()?.username || 'User' }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <span class="dropdown-item-text">
                  <small class="text-muted">{{ 'nav.signedInAs' | translate }}</small><br>
                  <strong>{{ currentUser()?.username }}</strong>
                </span>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" routerLink="/profile">
                  <i class="fas fa-user me-2"></i>
                  {{ 'nav.myProfile' | translate }}
                </a>
              </li>
              <li>
                <button class="dropdown-item text-danger" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  {{ 'nav.logout' | translate }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      } @else {
        <!-- Guest Menu -->
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" routerLink="/auth/login" (click)="closeMenu()">
              <i class="fas fa-sign-in-alt me-1"></i>
              {{ 'nav.login' | translate }}
            </a>
          </li>
          <li class="nav-item">
            <a class="btn btn-outline-light btn-sm ms-2" routerLink="/auth/register" (click)="closeMenu()">
              <i class="fas fa-user-plus me-1"></i>
              {{ 'nav.register' | translate }}
            </a>
          </li>
        </ul>
      }
    </div>
  </div>
</nav>
```

Create file: `frontend/project-tracker/src/app/layouts/navbar/navbar.component.css`

```css
.navbar {
  transition: var(--transition-base);
}

.navbar-brand {
  font-size: 1.25rem;
  transition: var(--transition-fast);
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.nav-link {
  transition: var(--transition-fast);
  border-radius: var(--border-radius-sm);
  margin: 0 0.25rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: var(--font-weight-medium);
}

.dropdown-menu {
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: none;
  margin-top: 0.5rem;
}

.dropdown-item {
  transition: var(--transition-fast);
  border-radius: var(--border-radius-sm);
  margin: 0.25rem 0.5rem;
}

.dropdown-item:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.dropdown-divider {
  margin: 0.5rem 0;
}

@media (max-width: 991.98px) {
  .navbar-collapse {
    margin-top: 1rem;
  }

  .navbar-nav {
    gap: 0.5rem;
  }

  .d-flex.gap-3 {
    margin-top: 1rem;
    flex-wrap: wrap;
  }
}
```

---

## 🎴 Step 5: Reusable Card Component

Create file: `frontend/project-tracker/src/app/shared/components/card/card.component.ts`

```typescript
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/// <summary>
/// Reusable card component with header, body, and footer slots
/// </summary>
@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly headerClass = input<string>('');
  readonly bodyClass = input<string>('');
  readonly footerClass = input<string>('');
  readonly shadow = input<boolean>(true);
  readonly border = input<boolean>(true);
}
```

Create file: `frontend/project-tracker/src/app/shared/components/card/card.component.html`

```html
<div
  class="card"
  [class.shadow-sm]="shadow()"
  [class.border-0]="!border()">
  
  <!-- Header (optional) -->
  @if (title()) {
    <div class="card-header" [class]="headerClass()">
      <h5 class="card-title mb-0">{{ title() }}</h5>
      @if (subtitle()) {
        <small class="text-muted">{{ subtitle() }}</small>
      }
      <ng-content select="[cardHeaderActions]"></ng-content>
    </div>
  }

  <!-- Body -->
  <div class="card-body" [class]="bodyClass()">
    <ng-content></ng-content>
  </div>

  <!-- Footer (optional) -->
  <ng-content select="[cardFooter]"></ng-content>
</div>
```

Create file: `frontend/project-tracker/src/app/shared/components/card/card.component.css`

```css
.card {
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md) !important;
}

.card-header {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.25rem;
}

.card-title {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.card-body {
  padding: 1.25rem;
}
```

---

## 🎯 Step 6: Accessibility Utilities

Create file: `frontend/project-tracker/src/app/shared/directives/focus-trap.directive.ts`

```typescript
import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';

/// <summary>
/// Directive to trap focus within an element (useful for modals)
/// </summary>
@Directive({
  selector: '[appFocusTrap]'
})
export class FocusTrapDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  ngOnInit(): void {
    this.setupFocusTrap();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private setupFocusTrap(): void {
    const focusableElements = this.el.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      this.firstFocusableElement = focusableElements[0] as HTMLElement;
      this.lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      this.el.nativeElement.addEventListener('keydown', this.handleKeyDown.bind(this));
      
      // Focus first element
      setTimeout(() => this.firstFocusableElement?.focus(), 100);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  }
}
```

Create file: `frontend/project-tracker/src/app/shared/directives/skip-link.directive.ts`

```typescript
import { Directive, HostListener, ElementRef, inject } from '@angular/core';

/// <summary>
/// Directive for skip-to-content links (accessibility)
/// </summary>
@Directive({
  selector: '[appSkipLink]'
})
export class SkipLinkDirective {
  private readonly el = inject(ElementRef);

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    const targetId = this.el.nativeElement.getAttribute('href')?.substring(1);
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
```

---

## 📱 Step 7: Responsive Utility Classes

Create file: `frontend/project-tracker/src/styles/utilities.css`

```css
/**
 * Custom utility classes
 * Extends Bootstrap utilities
 */

/* Spacing Utilities */
.gap-xs { gap: var(--spacing-xs) !important; }
.gap-sm { gap: var(--spacing-sm) !important; }
.gap-md { gap: var(--spacing-md) !important; }
.gap-lg { gap: var--spacing-lg) !important; }
.gap-xl { gap: var(--spacing-xl) !important; }

/* Text Utilities */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Background Utilities */
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
}

.bg-gradient-success {
  background: linear-gradient(135deg, var(--color-success) 0%, #145c3a 100%);
}

.bg-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Animation Utilities */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-left {
  animation: slideInLeft 0.3s ease-in-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Hover Effects */
.hover-lift {
  transition: var(--transition-fast);
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.hover-scale {
  transition: var(--transition-fast);
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* Focus Visible (Accessibility) */
.focus-ring:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}

/* Skeleton Loader */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--border-color) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--border-radius);
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive Utilities */
@media (max-width: 575.98px) {
  .hide-on-mobile {
    display: none !important;
  }
}

@media (min-width: 576px) and (max-width: 991.98px) {
  .hide-on-tablet {
    display: none !important;
  }
}

@media (min-width: 992px) {
  .hide-on-desktop {
    display: none !important;
  }
}

/* Print Utilities */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    color: #000;
    background: #fff;
  }
}
```

---

## 📚 Step 8: Import Styles in Main CSS

Update file: `frontend/project-tracker/src/styles.css`

```css
/* Import Bootstrap */
@import 'bootstrap/dist/css/bootstrap.min.css';
@import '@fortawesome/fontawesome-free/css/all.min.css';

/* Import Custom Styles */
@import './styles/theme.css';
@import './styles/utilities.css';

/* Global Styles */
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Focus visible for keyboard navigation */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip to content link (accessibility) */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 10000;
}

.skip-link:focus {
  top: 0;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Selection color */
::selection {
  background-color: rgba(var(--color-primary-rgb), 0.3);
  color: var(--text-primary);
}
```

---

## ✅ Summary

### **What We Built:**

1. ✅ **Custom Theme System**
   - CSS variables for colors, spacing, typography
   - Dark mode support with data-bs-theme attribute
   - Smooth transitions between themes
   - Custom scrollbar styling

2. ✅ **Dark Mode Service**
   - ThemeService with signal-based state
   - localStorage persistence
   - Auto-detect system preference
   - Watch for system theme changes
   - Light/Dark/Auto modes

3. ✅ **Enhanced Navigation**
   - Responsive navbar with mobile toggle
   - Dropdown menus
   - Theme toggle integration
   - Language selector integration
   - User profile dropdown
   - Active link highlighting

4. ✅ **Reusable Components**
   - CardComponent with slots
   - ThemeToggleComponent
   - Hover effects and animations

5. ✅ **Accessibility Features**
   - Focus trap directive for modals
   - Skip-to-content links
   - Keyboard navigation support
   - ARIA labels throughout
   - Focus-visible styles

6. ✅ **Custom Utilities**
   - Text ellipsis and line clamp
   - Animation classes (fade-in, slide-in)
   - Hover effects (lift, scale)
   - Skeleton loaders
   - Responsive helpers
   - Print styles

### **Best Practices Applied:**
- ✅ CSS custom properties for theming
- ✅ Bootstrap 5 utilities extended
- ✅ Mobile-first responsive design
- ✅ Accessibility (WCAG 2.1 Level AA)
- ✅ Signal-based theme management
- ✅ System preference detection
- ✅ Smooth transitions and animations
- ✅ Print-friendly styles
- ✅ Keyboard navigation support

### **Production Tips:**
- Use PurgeCSS to remove unused Bootstrap classes
- Lazy load Font Awesome icons
- Implement CSS-in-JS for component-specific styles
- Use CSS Grid for complex layouts
- Add prefers-reduced-motion media query
- Test with screen readers (NVDA, JAWS)

---

**Next: [Module 13: Logging & Performance](./13_logging_performance.md)**
