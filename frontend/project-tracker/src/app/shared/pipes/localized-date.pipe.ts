import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslationService } from '../services/translation.service';

/// <summary>
/// Pipe for formatting dates according to current locale
/// Usage: {{ date | localizedDate:'short' }}
/// </summary>
@Pipe({
  name: 'localizedDate',
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(value: any, format: string = 'mediumDate'): string | null {
    const locale = this.translationService.currentLanguage();
    
    // Create new DatePipe with current locale
    const localizedPipe = new DatePipe(locale);
    return localizedPipe.transform(value, format);
  }
}