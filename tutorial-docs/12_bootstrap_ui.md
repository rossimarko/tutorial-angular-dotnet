# Module 12: Bootstrap UI & Advanced Styling

## 🎯 Objectives

By the end of this module, you will:
- ✅ Customize Bootstrap using SCSS variables (proper Bootstrap workflow)
- ✅ Implement dark mode using Bootstrap's built-in color modes
- ✅ Build a theme toggle component
- ✅ Create a reusable card component
- ✅ Extract and enhance the navigation bar
- ✅ Add accessibility directives
- ✅ Apply best practices for responsive design

---

## 📋 Prerequisites

Before starting this module, ensure you have completed:

- ✅ **Module 11**: CRUD Operations (ToastContainer, ConfirmDialog, NotificationService)
- ✅ **Module 10**: Pagination & Export
- ✅ **Module 7**: Internationalization (Language Selector)
- ✅ **Module 6**: Angular Setup (Bootstrap 5 & Font Awesome installed)

### Verify Existing Components

Run these checks to ensure you're ready:

```bash
# Check that these files exist:
ls frontend/project-tracker/src/app/shared/services/notification.service.ts
ls frontend/project-tracker/src/app/shared/components/toast-container/
ls frontend/project-tracker/src/app/shared/components/confirm-dialog/
ls frontend/project-tracker/src/app/shared/components/pagination/
ls frontend/project-tracker/src/app/shared/components/language-selector/

# Check Bootstrap and Font Awesome are in package.json
grep -E "(bootstrap|fontawesome)" frontend/project-tracker/package.json
```

If any of these are missing, please complete the prerequisite modules first.

---

## 📌 What We'll Build in This Module

In this module, we'll **add** the following new features to your existing application:

### New Components & Services:
1. **ThemeService** - Manage light/dark mode with localStorage persistence
2. **ThemeToggleComponent** - UI for switching themes
3. **CardComponent** - Reusable card wrapper
4. **NavbarComponent** - Extract navbar from app.html into separate component

### What We'll Customize:
5. **Bootstrap SCSS Variables** - Customize colors, spacing, fonts using Bootstrap's native system
6. **Dark Mode Support** - Use Bootstrap 5.3's built-in `data-bs-theme` attribute
7. **Accessibility Directives** - FocusTrap and SkipLink

### What We'll Modify:
- Convert `styles.css` to `styles.scss`
- Customize Bootstrap variables before importing
- Extract inline navbar from `app.html` into `NavbarComponent`
- Integrate theme toggle into navigation

---

## 📋 Why Bootstrap SCSS Customization?

Instead of creating custom CSS files, we'll use **Bootstrap's recommended approach**:

✅ **Customize Bootstrap variables** (colors, spacing, fonts, etc.)
✅ **Import Bootstrap SCSS** (not pre-compiled CSS)
✅ **Let Bootstrap compile** with your custom values
✅ **Use Bootstrap's native dark mode** (no custom theme files needed)

This approach:
- Keeps your styles maintainable
- Uses Bootstrap's design system properly
- Avoids CSS conflicts and specificity issues
- Makes upgrades easier

---

## 🎨 Step 1: Setup SCSS and Bootstrap Source

### 1.1 Install Bootstrap SCSS (if using source)

```bash
cd frontend/project-tracker
# Bootstrap is already installed, but ensure we have the SCSS source
npm list bootstrap
```

### 1.2 Rename styles.css to styles.scss

```bash
# Rename the main styles file
mv src/styles.css src/styles.scss
```

### 1.3 Update angular.json

Update file: `frontend/project-tracker/angular.json`

Find the `styles` array in both `build` and `test` sections and update:

**Before:**
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "src/styles.css"
]
```

**After:**
```json
"styles": [
  "src/styles.scss"
]
```

We'll import Bootstrap SCSS and Font Awesome directly in our `styles.scss` file.

---

## 🎨 Step 2: Customize Bootstrap Variables

Create file: `frontend/project-tracker/src/_custom-bootstrap.scss`

This file will contain your Bootstrap variable overrides:

```scss
// ====================================
// Custom Bootstrap Variable Overrides
// ====================================
// Place this BEFORE importing Bootstrap

// -------------------------------------
// Color System
// -------------------------------------
$primary: #0d6efd;
$secondary: #6c757d;
$success: #198754;
$info: #0dcaf0;
$warning: #ffc107;
$danger: #dc3545;
$light: #f8f9fa;
$dark: #212529;

// -------------------------------------
// Spacing
// -------------------------------------
$spacer: 1rem;
$spacers: (
  0: 0,
  1: $spacer * .25,
  2: $spacer * .5,
  3: $spacer,
  4: $spacer * 1.5,
  5: $spacer * 3,
  6: $spacer * 4,
  7: $spacer * 5
);

// -------------------------------------
// Typography
// -------------------------------------
$font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
$font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

$font-size-base: 1rem;
$font-size-sm: $font-size-base * .875;
$font-size-lg: $font-size-base * 1.25;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

$line-height-base: 1.5;

// -------------------------------------
// Border Radius
// -------------------------------------
$border-radius: .375rem;
$border-radius-sm: .25rem;
$border-radius-lg: .5rem;
$border-radius-xl: 1rem;

// -------------------------------------
// Shadows
// -------------------------------------
$box-shadow-sm: 0 .125rem .25rem rgba(0, 0, 0, .075);
$box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15);
$box-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, .175);

// -------------------------------------
// Components
// -------------------------------------
$border-width: 1px;
$border-color: #dee2e6;

$component-active-bg: $primary;
$component-active-color: #fff;

// -------------------------------------
// Navbar
// -------------------------------------
$navbar-dark-color: rgba(255, 255, 255, .75);
$navbar-dark-hover-color: rgba(255, 255, 255, .9);
$navbar-dark-active-color: #fff;

// -------------------------------------
// Cards
// -------------------------------------
$card-border-radius: $border-radius;
$card-border-color: rgba(0, 0, 0, .125);
$card-cap-bg: rgba(0, 0, 0, .03);

// -------------------------------------
// Transitions
// -------------------------------------
$transition-base: all .3s ease-in-out;
$transition-fade: opacity .15s linear;
$transition-collapse: height .35s ease;

// -------------------------------------
// Enable/Disable Features
// -------------------------------------
$enable-shadows: false;
$enable-gradients: false;
$enable-transitions: true;
$enable-reduced-motion: true;
$enable-smooth-scroll: true;
$enable-grid-classes: true;
$enable-container-classes: true;
$enable-negative-margins: true;
$enable-dark-mode: true; // Enable Bootstrap's native dark mode
```

---

## 📱 Step 3: Update Main Styles File

Update file: `frontend/project-tracker/src/styles.scss`

```scss
// ====================================
// Main Styles - Project Tracker
// ====================================

// -------------------------------------
// 1. Import Custom Bootstrap Variables
// -------------------------------------
@import 'custom-bootstrap';

// -------------------------------------
// 2. Import Bootstrap SCSS
// -------------------------------------
// Import Bootstrap's source SCSS files
// This will use our custom variables from above
@import 'bootstrap/scss/bootstrap';

// -------------------------------------
// 3. Import Font Awesome
// -------------------------------------
@import '@fortawesome/fontawesome-free/css/all.min.css';

// ====================================
// 4. Global Styles
// ====================================

* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

// -------------------------------------
// Smooth Scroll
// -------------------------------------
html {
  scroll-behavior: smooth;
}

// -------------------------------------
// Focus Styles for Accessibility
// -------------------------------------
*:focus-visible {
  outline: 2px solid $primary;
  outline-offset: 2px;
  border-radius: $border-radius-sm;
}

// -------------------------------------
// Skip to Content Link (Accessibility)
// -------------------------------------
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: $primary;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 10000;

  &:focus {
    top: 0;
  }
}

// -------------------------------------
// Selection Color
// -------------------------------------
::selection {
  background-color: rgba($primary, 0.3);
  color: $dark;
}

// ====================================
// 5. Custom Utility Classes
// ====================================
// Only add utilities that Bootstrap doesn't provide

// Text utilities
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

// Hover effects
.hover-lift {
  transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $box-shadow-lg;
  }
}

.hover-scale {
  transition: transform 0.15s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
}

// Loading skeleton
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bs-gray-200) 25%,
    var(--bs-gray-300) 50%,
    var(--bs-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: $border-radius;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ====================================
// 6. Dark Mode Customizations
// ====================================
// Bootstrap handles most dark mode via data-bs-theme="dark"
// Add only specific customizations here if needed

[data-bs-theme="dark"] {
  .skip-link {
    background: var(--bs-primary);
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      var(--bs-gray-800) 25%,
      var(--bs-gray-700) 50%,
      var(--bs-gray-800) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
}

// ====================================
// 7. Print Styles
// ====================================
@media print {
  .no-print {
    display: none !important;
  }

  body {
    color: #000;
    background: #fff;
  }

  a[href]:after {
    content: " (" attr(href) ")";
  }
}
```

---

## 🌓 Step 4: Dark Mode Service

Bootstrap 5.3+ has built-in dark mode support via the `data-bs-theme` attribute. Our ThemeService will toggle this attribute.

Create file: `frontend/project-tracker/src/app/shared/services/theme.service.ts`

```typescript
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
```

---

## 🔘 Step 5: Theme Toggle Component

Create file: `frontend/project-tracker/src/app/shared/components/theme-toggle/theme-toggle.component.ts`

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Theme toggle button component
/// Allows users to switch between light, dark, and auto themes
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
  /// Get Font Awesome icon for theme
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
  /// Get translation key for theme label
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
      [attr.aria-pressed]="currentTheme() === theme"
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
  box-shadow: var(--bs-box-shadow-sm);
}

.btn {
  transition: all 0.15s ease-in-out;
}

.btn:focus-visible {
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
}
```

---

## 🎴 Step 6: Reusable Card Component

Create file: `frontend/project-tracker/src/app/shared/components/card/card.component.ts`

```typescript
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/// <summary>
/// Reusable card component wrapper
/// Uses Bootstrap's card classes with customizable slots
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
        <small class="text-body-secondary">{{ subtitle() }}</small>
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
  transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bs-box-shadow) !important;
}
```

---

## 🧭 Step 7: Enhanced Navigation Bar Component

### First, create the layouts directory:

```bash
mkdir -p frontend/project-tracker/src/app/layouts/navbar
```

Create file: `frontend/project-tracker/src/app/layouts/navbar/navbar.component.ts`

```typescript
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/// <summary>
/// Main navigation bar component
/// Responsive navbar with theme toggle and language selector
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

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.currentUser;
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
<nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
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
              routerLink="/projects"
              routerLinkActive="active"
              (click)="closeMenu()">
              <i class="fas fa-folder me-1"></i>
              {{ 'nav.projects' | translate }}
            </a>
          </li>
        </ul>

        <!-- Right Side Tools -->
        <div class="d-flex align-items-center gap-3">
          <!-- Theme Toggle -->
          <app-theme-toggle></app-theme-toggle>

          <!-- Language Selector -->
          <app-language-selector></app-language-selector>

          <!-- User Dropdown -->
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
                  <small class="text-body-secondary">{{ 'nav.signedInAs' | translate }}</small><br>
                  <strong>{{ currentUser()?.username }}</strong>
                </span>
              </li>
              <li><hr class="dropdown-divider"></li>
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
        <ul class="navbar-nav ms-auto gap-2">
          <li class="nav-item">
            <a class="nav-link" routerLink="/auth/login" (click)="closeMenu()">
              <i class="fas fa-sign-in-alt me-1"></i>
              {{ 'nav.login' | translate }}
            </a>
          </li>
          <li class="nav-item">
            <a class="btn btn-outline-light btn-sm" routerLink="/auth/register" (click)="closeMenu()">
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
  box-shadow: var(--bs-box-shadow-sm);
}

.navbar-brand {
  font-size: 1.25rem;
  transition: transform 0.15s ease-in-out;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.nav-link {
  transition: all 0.15s ease-in-out;
  border-radius: var(--bs-border-radius-sm);
  margin: 0 0.25rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

.dropdown-menu {
  border: none;
  box-shadow: var(--bs-box-shadow-lg);
  margin-top: 0.5rem;
}

.dropdown-item {
  transition: all 0.15s ease-in-out;
}

@media (max-width: 991.98px) {
  .navbar-collapse {
    margin-top: 1rem;
  }

  .d-flex.gap-3 {
    margin-top: 1rem;
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem !important;
  }
}
```

---

## 🔄 Step 8: Update App Component

### Update file: `frontend/project-tracker/src/app/app.ts`

Add the import at the top:

```typescript
import { NavbarComponent } from './layouts/navbar/navbar.component';
```

Update the `@Component` decorator imports array:

```typescript
@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,  // Add this
    ToastContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
```

### Update file: `frontend/project-tracker/src/app/app.html`

Replace the inline navbar with the component:

```html
<!-- Skip to content link for accessibility -->
<a href="#main-content" class="skip-link">
  {{ 'common.skipToContent' | translate }}
</a>

<!-- Use new NavbarComponent -->
<app-navbar></app-navbar>

<!-- Main content -->
<main id="main-content" class="container-fluid py-3" tabindex="-1">
  <router-outlet></router-outlet>
</main>

<!-- Toast notifications (already implemented in Module 11) -->
<app-toast-container></app-toast-container>
```

---

## 🎯 Step 9: Accessibility Directives

### Create directives directory:

```bash
mkdir -p frontend/project-tracker/src/app/shared/directives
```

Create file: `frontend/project-tracker/src/app/shared/directives/focus-trap.directive.ts`

```typescript
import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';

/// <summary>
/// Directive to trap focus within an element (useful for modals)
/// Implements WCAG 2.1 keyboard navigation guidelines
/// </summary>
@Directive({
  selector: '[appFocusTrap]',
  standalone: true
})
export class FocusTrapDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private boundHandleKeyDown: (event: KeyboardEvent) => void;

  constructor() {
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
  }

  ngOnInit(): void {
    this.setupFocusTrap();
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('keydown', this.boundHandleKeyDown);
  }

  private setupFocusTrap(): void {
    const focusableElements = this.el.nativeElement.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      this.firstFocusableElement = focusableElements[0] as HTMLElement;
      this.lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      this.el.nativeElement.addEventListener('keydown', this.boundHandleKeyDown);

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
/// Allows keyboard users to bypass navigation
/// </summary>
@Directive({
  selector: '[appSkipLink]',
  standalone: true
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
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
```

### Update app.html to use skip link directive

Update the skip link in `app.html`:

```html
<a href="#main-content" class="skip-link" appSkipLink>
  {{ 'common.skipToContent' | translate }}
</a>
```

And update `app.ts` to import the directive:

```typescript
import { SkipLinkDirective } from './shared/directives/skip-link.directive';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    ToastContainerComponent,
    SkipLinkDirective  // Add this
  ],
  // ...
})
```

---

## 🧪 Step 10: Add Translation Keys

Add these translation keys to your translation files:

### Update: `frontend/project-tracker/src/assets/i18n/en.json`

Add these keys (merge with existing JSON):

```json
{
  "theme": {
    "light": "Light",
    "dark": "Dark",
    "auto": "Auto"
  },
  "nav": {
    "projects": "Projects",
    "signedInAs": "Signed in as",
    "logout": "Logout",
    "login": "Login",
    "register": "Register"
  },
  "common": {
    "skipToContent": "Skip to main content"
  }
}
```

### Update: `frontend/project-tracker/src/assets/i18n/it.json`

Add these keys (merge with existing JSON):

```json
{
  "theme": {
    "light": "Chiaro",
    "dark": "Scuro",
    "auto": "Automatico"
  },
  "nav": {
    "projects": "Progetti",
    "signedInAs": "Connesso come",
    "logout": "Esci",
    "login": "Accedi",
    "register": "Registrati"
  },
  "common": {
    "skipToContent": "Vai al contenuto principale"
  }
}
```

---

## ✅ Testing Your Implementation

### 1. Build and Serve

```bash
cd frontend/project-tracker
npm start
```

The SCSS will be compiled automatically by Angular.

### 2. Visual Tests

**Test Dark Mode:**
- Click the theme toggle buttons in the navbar
- Switch between Light, Dark, and Auto
- Reload the page - theme should persist
- Change system theme (OS settings) with Auto selected
- Verify Bootstrap components change color appropriately

**Test Responsive Design:**
- Resize browser window to mobile size (< 992px)
- Verify navbar collapses correctly
- Test theme toggle works on mobile
- Check all dropdowns work properly

**Test Navigation:**
- Click all navigation links
- Verify active link highlighting
- Test logout functionality
- Verify all Bootstrap components use theme colors

### 3. Accessibility Tests

**Keyboard Navigation:**
- Press Tab key repeatedly
- Verify focus moves through all interactive elements
- Check visible focus indicators (should have outline)
- Press Tab on page load to test skip-to-content link
- Verify skip link appears and works

**Screen Reader (Optional):**
- Use NVDA or JAWS (Windows) or VoiceOver (Mac)
- Verify ARIA labels are announced
- Test theme toggle button descriptions
- Verify landmark regions (nav, main)

### 4. Functional Tests

**Verify Existing Features Still Work:**
- Toast notifications (from Module 11)
- Confirm dialogs (from Module 11)
- Project list and pagination (from Module 10)
- Language switching (from Module 7)
- All Bootstrap components (cards, buttons, forms)

### 5. Bootstrap Variable Verification

Open browser DevTools and check computed styles:
- Verify custom colors are applied
- Check spacing values match your SCSS variables
- Confirm border radius is using your values
- Verify dark mode uses Bootstrap's CSS variables

---

## ✅ Summary

### **What We Built:**

1. ✅ **Bootstrap SCSS Customization**
   - Custom Bootstrap variables in `_custom-bootstrap.scss`
   - Proper Bootstrap SCSS import workflow
   - No custom theme files - using Bootstrap's native system

2. ✅ **Dark Mode with Bootstrap 5.3**
   - ThemeService using `data-bs-theme` attribute
   - localStorage persistence
   - Auto-detect system preference
   - Watch for system theme changes
   - Light/Dark/Auto modes

3. ✅ **Enhanced Navigation**
   - Responsive navbar component
   - Theme toggle integration
   - Language selector integration (existing)
   - User profile dropdown
   - Active link highlighting
   - Mobile-friendly collapsible menu

4. ✅ **Reusable Components**
   - CardComponent using Bootstrap classes
   - ThemeToggleComponent

5. ✅ **Accessibility Features**
   - Focus trap directive for modals
   - Skip-to-content link with directive
   - Keyboard navigation support
   - ARIA labels throughout
   - Bootstrap's built-in accessibility

6. ✅ **Proper SCSS Structure**
   - Single `styles.scss` file
   - Bootstrap variable overrides
   - Custom utilities only when needed
   - No duplicate CSS files

### **Best Practices Applied:**

- ✅ Using Bootstrap SCSS source (not compiled CSS)
- ✅ Customizing via SCSS variables (Bootstrap's recommended way)
- ✅ Using Bootstrap's native dark mode system
- ✅ Mobile-first responsive design
- ✅ Accessibility (WCAG 2.1 Level AA)
- ✅ Signal-based state management
- ✅ System preference detection
- ✅ Semantic HTML and Bootstrap classes

### **Why This Approach is Better:**

1. **Maintainability**: All Bootstrap customization in one place
2. **Upgradability**: Easy to update Bootstrap versions
3. **Consistency**: Using Bootstrap's design system properly
4. **Performance**: Single compiled CSS file
5. **No Conflicts**: Bootstrap handles specificity and cascading
6. **Dark Mode**: Bootstrap's native implementation is robust

---

## 🐛 Troubleshooting

### Issue: SCSS compilation errors

**Solution**: Ensure Bootstrap is installed and check import paths:
```bash
npm list bootstrap
npm install --save bootstrap@latest
```

### Issue: Theme doesn't persist on reload

**Solution**: Check browser localStorage - it should contain `app-theme` key. Check browser console for errors.

### Issue: Dropdown menus don't work

**Solution**: Verify Bootstrap JavaScript is loaded in `angular.json`:
```json
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

### Issue: Dark mode colors look wrong

**Solution**:
- Verify `data-bs-theme` attribute is set on `<html>` element using browser DevTools
- Check that you're using Bootstrap CSS variables (`var(--bs-primary)`) not hardcoded colors

### Issue: Custom variables not applying

**Solution**:
- Ensure `_custom-bootstrap.scss` is imported BEFORE Bootstrap
- Clear browser cache and rebuild: `npm start`
- Check SCSS syntax for errors

### Issue: AuthService methods not found

**Solution**: Check your AuthService implementation. Adjust the navbar component:
- Change `isAuthenticated` to match your actual signal/method name
- Change `currentUser` to match your actual signal/method name

---

## 📚 Additional Resources

- [Bootstrap 5.3 Documentation](https://getbootstrap.com/docs/5.3/)
- [Bootstrap SCSS Customization](https://getbootstrap.com/docs/5.3/customize/sass/)
- [Bootstrap Color Modes (Dark Mode)](https://getbootstrap.com/docs/5.3/customize/color-modes/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Next: [Module 13: Logging & Performance](./13_logging_performance.md)**
