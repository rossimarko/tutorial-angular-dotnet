import { Pipe, PipeTransform, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslationService } from '../services/translation.service';

/// <summary>
/// Pipe for formatting numbers according to current locale
/// Usage: {{ value | localizedNumber:'1.2-2' }}
/// </summary>
@Pipe({
  name: 'localizedNumber',
  pure: false
})
export class LocalizedNumberPipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(value: any, digitsInfo?: string): string | null {
    const locale = this.translationService.currentLanguage();
    const decimalPipe = new DecimalPipe(locale);
    return decimalPipe.transform(value, digitsInfo);
  }
}