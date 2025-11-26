import { Component, inject, signal, ChangeDetectionStrategy, isDevMode } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoggerService } from '../../shared/services/logger.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { environment } from '../../../environments/environment';

/// <summary>
/// Main navigation bar component
/// Responsive navbar with theme toggle and language selector
/// </summary>
@Component({
  selector: 'app-navbar',
  imports: [RouterModule, ThemeToggleComponent, LanguageSelectorComponent, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);

  protected readonly isAuthenticated = this.authService.isAuthenticated$();
  protected readonly currentUser = this.authService.currentUser;
  protected readonly isCollapsed = signal(true);
  protected readonly isDevelopment = isDevMode();
  
  // Derive profiler URL from API base URL (remove /api or /api/ suffix and add /profiler path)
  protected readonly profilerUrl = this.getProfilerUrl();

  /**
   * Constructs the profiler URL robustly, handling various API URL formats.
   * Removes trailing '/api' or '/api/' if present, otherwise uses the base URL as-is.
   * Logs a warning in development mode if the API URL does not end with '/api' or '/api/'.
   */
  private getProfilerUrl(): string
  {
    let apiUrl = environment.apiUrl;
    // Remove trailing '/api' or '/api/' if present
    const apiPattern = /(\/api\/?$)/;
    if (apiPattern.test(apiUrl))
    {
      apiUrl = apiUrl.replace(apiPattern, '');
    }
    else if (isDevMode())
    {
      // Warn in development if the API URL does not match the expected pattern
      this.logger.warning('[NavbarComponent] environment.apiUrl does not end with /api or /api/', environment.apiUrl);
    }
    // Ensure no trailing slash before appending
    if (apiUrl.endsWith('/'))
    {
      apiUrl = apiUrl.slice(0, -1);
    }
    return `${apiUrl}/profiler/results-index`;
  }
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