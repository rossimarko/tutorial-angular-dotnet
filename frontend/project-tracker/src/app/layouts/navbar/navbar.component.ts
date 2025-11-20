import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';

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
  imports: [RouterModule, ThemeToggleComponent, LanguageSelectorComponent, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  protected readonly isAuthenticated = this.authService.isAuthenticated$();
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