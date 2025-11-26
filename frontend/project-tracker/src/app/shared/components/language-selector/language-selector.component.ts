import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { TranslationService } from '../../services/translation.service';
import { LoggerService } from '../../services/logger.service';

/// <summary>
/// Component for selecting application language
/// Displays dropdown with available cultures
/// </summary>
@Component({
  selector: 'app-language-selector',
  imports: [],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorComponent {
  protected readonly translationService = inject(TranslationService);
  private readonly logger = inject(LoggerService);
  
  // Expose signals for template
  protected readonly cultures = this.translationService.cultures;
  protected readonly currentCulture = this.translationService.currentCultureInfo;
  protected readonly loading = this.translationService.loading;

  /// <summary>
  /// Change the application language
  /// </summary>
  protected async onLanguageChange(cultureCode: string): Promise<void> {
    this.logger.debug('onLanguageChange called with:', cultureCode);
    try {
      await this.translationService.setLanguage(cultureCode);
      this.logger.debug('Language changed successfully to:', cultureCode);
      
      // Close the dropdown
      const dropdownButton = document.getElementById('languageDropdown');
      if (dropdownButton) {
        const dropdown = (window as any).bootstrap?.Dropdown?.getInstance(dropdownButton);
        if (dropdown) {
          dropdown.hide();
        }
      }
    } catch (error) {
      this.logger.error('Error changing language:', error);
    }
  }
}