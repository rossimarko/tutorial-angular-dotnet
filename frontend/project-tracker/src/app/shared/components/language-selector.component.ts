import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';

/// <summary>
/// Component for selecting application language
/// Displays dropdown with available cultures
/// </summary>
@Component({
  selector: 'app-language-selector',
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorComponent {
  protected readonly translationService = inject(TranslationService);
  
  // Expose signals for template
  protected readonly cultures = this.translationService.cultures;
  protected readonly currentCulture = this.translationService.currentCultureInfo;
  protected readonly loading = this.translationService.loading;

  /// <summary>
  /// Change the application language
  /// </summary>
  protected async onLanguageChange(cultureCode: string): Promise<void> {
    console.log('onLanguageChange called with:', cultureCode);
    try {
      await this.translationService.setLanguage(cultureCode);
      console.log('Language changed successfully to:', cultureCode);
      
      // Close the dropdown
      const dropdownButton = document.getElementById('languageDropdown');
      if (dropdownButton) {
        const dropdown = (window as any).bootstrap?.Dropdown?.getInstance(dropdownButton);
        if (dropdown) {
          dropdown.hide();
        }
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }
}