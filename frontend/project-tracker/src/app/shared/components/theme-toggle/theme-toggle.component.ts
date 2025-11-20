import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { ThemeService, Theme } from '../../services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Theme toggle button component
/// Allows users to switch between light, dark, and auto themes
/// </summary>
@Component({
  selector: 'app-theme-toggle',
  imports: [TranslatePipe],
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