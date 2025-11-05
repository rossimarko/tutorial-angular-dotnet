import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslationService } from '../services/translation.service';

/// <summary>
/// Pipe for formatting currency according to current locale
/// Usage: {{ value | localizedCurrency:'EUR' }}
/// </summary>
@Pipe({
  name: 'localizedCurrency',
  pure: false
})
export class LocalizedCurrencyPipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(
    value: any, 
    currencyCode: string = 'EUR',
    display: 'code' | 'symbol' | 'symbol-narrow' = 'symbol'
  ): string | null {
    const locale = this.translationService.currentLanguage();
    const currencyPipe = new CurrencyPipe(locale);
    return currencyPipe.transform(value, currencyCode, display);
  }
}