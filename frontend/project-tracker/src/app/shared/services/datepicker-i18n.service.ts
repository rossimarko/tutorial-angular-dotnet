import { Injectable, inject } from '@angular/core';
import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from './translation.service';

/**
 * Custom NgbDatepickerI18n implementation that uses the TranslationService
 * to provide localized month and weekday names based on the user's language preference
 */
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  private readonly translationService = inject(TranslationService);

  override getWeekdayLabel(weekday: number, width?: 'short' | 'narrow' | 'long'): string {
    const locale = this.getLocale();
    const date = new Date(2024, 0, weekday); // January 2024 starts on Monday
    const formatter = new Intl.DateTimeFormat(locale, { weekday: width || 'short' });
    return formatter.format(date);
  }

  override getWeekLabel(): string {
    return $localize`:@@ngb.datepicker.week:Week`;
  }

  override getMonthShortName(month: number): string {
    const locale = this.getLocale();
    const date = new Date(2000, month - 1, 1);
    const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
    return formatter.format(date);
  }

  override getMonthFullName(month: number): string {
    const locale = this.getLocale();
    const date = new Date(2000, month - 1, 1);
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    return formatter.format(date);
  }

  override getDayAriaLabel(date: NgbDateStruct): string {
    const locale = this.getLocale();
    const jsDate = new Date(date.year, date.month - 1, date.day);
    const formatter = new Intl.DateTimeFormat(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return formatter.format(jsDate);
  }

  private getLocale(): string {
    const culture = this.translationService.currentCultureInfo();
    return culture?.code || 'en-US';
  }
}
