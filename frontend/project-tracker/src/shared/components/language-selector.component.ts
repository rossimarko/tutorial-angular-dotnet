import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

/// <summary>
/// Component for selecting application language
/// Displays dropdown with available cultures
/// </summary>
@Component({
  selector: 'app-language-selector',
  imports: [CommonModule, TranslatePipe],
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
    await this.translationService.setLanguage(cultureCode);
  }
}