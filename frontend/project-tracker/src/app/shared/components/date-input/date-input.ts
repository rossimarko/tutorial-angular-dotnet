import { Component, input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef, OnInit } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Reusable date input component with custom date picker
 * Uses text input for manual entry with locale-specific formatting
 * Includes calendar button for visual date selection
 * Supports min and max date validation
 * Implements ControlValueAccessor for reactive forms integration
 */
@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.html',
  styleUrl: './date-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, TranslatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true
    }
  ]
})
export class DateInputComponent implements ControlValueAccessor, OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly currentLocale = computed(() => {
    const culture = this.translationService.currentCultureInfo();
    return culture?.code || 'en-US';
  });

  // Common inputs
  readonly label = input<string>('');
  readonly controlName = input.required<string>();
  readonly visualizationType = input<'floating' | 'standard'>('standard');
  readonly required = input<boolean>(false);
  readonly parentForm = input.required<FormGroup>();
  readonly placeholder = input<string>();
  readonly helpText = input<string>();

  // Specific inputs
  readonly minDate = input<string>(); // ISO format YYYY-MM-DD
  readonly maxDate = input<string>(); // ISO format YYYY-MM-DD

  constructor() {
    // Watch for control status changes and trigger change detection
    effect((onCleanup) => {
      const ctrl = this.control();
      if (ctrl) {
        this.updateErrorState();

        // Only subscribe to statusChanges as it captures validation state changes
        const statusSub = ctrl.statusChanges.subscribe(() => {
          this.updateErrorState();
          this.cdr.markForCheck();
        });

        onCleanup(() => {
          statusSub.unsubscribe();
        });
      }
    });

    // Watch for language changes and trigger change detection
    effect(() => {
      // Read the current locale to track changes
      this.currentLocale();
      // Mark for check to re-render with new locale
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Generate a stable, unique input ID once per component instance
    this.inputId = `${this.controlName()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Internal state
  protected readonly internalValue = signal<string>(''); // ISO date string YYYY-MM-DD
  protected readonly displayValue = signal<string>(''); // Formatted date for display
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);
  protected readonly hasError = signal<boolean>(false);
  protected readonly showPicker = signal<boolean>(false);
  
  // Calendar state
  protected readonly currentMonth = signal<number>(new Date().getMonth());
  protected readonly currentYear = signal<number>(new Date().getFullYear());
  
  // Computed calendar properties
  protected readonly calendarDays = computed(() => {
    const month = this.currentMonth();
    const year = this.currentYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();
    
    const days: { day: number; date: string; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }[] = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        day: prevMonthDay.getDate(),
        date: this.dateToISOString(prevMonthDay),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true
      });
    }
    
    // Add days of the current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = this.internalValue();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.dateToISOString(date);
      const isToday = date.getTime() === today.getTime();
      const isSelected = dateStr === selectedDate;
      const isDisabled = this.isDateDisabled(dateStr);
      
      days.push({
        day,
        date: dateStr,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled
      });
    }
    
    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        day: i,
        date: this.dateToISOString(nextMonthDay),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true
      });
    }
    
    return days;
  });

  protected readonly monthNames = computed(() => {
    const locale = this.currentLocale();
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2000, i, 1);
      months.push(date.toLocaleDateString(locale, { month: 'long' }));
    }
    return months;
  });

  protected readonly weekDayNames = computed(() => {
    const locale = this.currentLocale();
    const days: string[] = [];
    // Start from Sunday (0)
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, i); // Jan 2024 starts on Monday, so day 0 is Sunday
      days.push(date.toLocaleDateString(locale, { weekday: 'short' }));
    }
    return days;
  });

  protected readonly currentMonthName = computed(() => {
    return this.monthNames()[this.currentMonth()];
  });

  // Computed properties
  protected readonly control = computed(() => {
    return this.parentForm()?.get(this.controlName());
  });

  protected readonly errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;

    if (errors['required']) {
      return this.translationService.translate('validation.required');
    }
    if (errors['invalidFormat']) {
      const format = this.localizedPlaceholder();
      return this.translationService.translate('validation.invalidDateFormat', { format }) || 
             `Invalid date format. Use: ${format}`;
    }
    if (errors['min']) {
      return this.translationService.translate('validation.minDate', {
        min: this.formatDate(this.minDate() || '')
      });
    }
    if (errors['max']) {
      return this.translationService.translate('validation.maxDate', {
        max: this.formatDate(this.maxDate() || '')
      });
    }

    return this.translationService.translate('validation.invalidValue');
  });

  protected inputId!: string;

  protected readonly localizedPlaceholder = computed(() => {
    const locale = this.currentLocale();
    
    // Use Intl.DateTimeFormat to get the format parts
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    // Get the format parts to determine the order and separators
    const parts = formatter.formatToParts(new Date(2020, 0, 15));
    let pattern = '';
    
    for (const part of parts) {
      switch (part.type) {
        case 'year':
          pattern += 'yyyy';
          break;
        case 'month':
          pattern += 'mm';
          break;
        case 'day':
          pattern += 'dd';
          break;
        case 'literal':
          pattern += part.value;
          break;
      }
    }
    
    return pattern;
  });

  // Helper method - must be defined before being used in computed properties
  private isDateDisabled(dateStr: string): boolean {
    if (!dateStr) return true;
    
    const minDateVal = this.minDate();
    if (minDateVal) {
      const minDateObj = new Date(minDateVal);
      const dateObj = new Date(dateStr);
      if (dateObj < minDateObj) return true;
    }
    
    const maxDateVal = this.maxDate();
    if (maxDateVal) {
      const maxDateObj = new Date(maxDateVal);
      const dateObj = new Date(dateStr);
      if (dateObj > maxDateObj) return true;
    }
    
    return false;
  }

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (!value) {
      this.internalValue.set('');
      this.displayValue.set('');
      this.cdr.markForCheck();
      return;
    }
    
    // Extract just the date part (YYYY-MM-DD) from ISO datetime string
    // Handles both "2024-01-15" and "2024-01-15T00:00:00" formats
    const dateOnly = value.split('T')[0];
    this.internalValue.set(dateOnly);
    this.displayValue.set(this.formatDateForDisplay(dateOnly));
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // Event handlers
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    this.displayValue.set(inputValue);
    
    // Validate format matches placeholder
    const formatPattern = this.getFormatPattern();
    const isValidFormat = this.validateFormat(inputValue, formatPattern);
    
    // Try to parse the input as a date
    const parsedDate = this.parseUserInput(inputValue);
    if (parsedDate && isValidFormat) {
      this.internalValue.set(parsedDate);
      this.onChange(parsedDate);
      // Clear custom validation error
      this.setCustomError(null);
    } else if (inputValue === '') {
      // Allow clearing the date
      this.internalValue.set('');
      this.onChange('');
      this.setCustomError(null);
    } else if (inputValue.length >= formatPattern.length && !isValidFormat) {
      // Show format error if user has typed enough characters
      this.setCustomError('invalidFormat');
    }
    // Don't update if invalid - let user continue typing
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
    
    // Reformat the display value on blur if we have a valid date
    const current = this.internalValue();
    if (current) {
      this.displayValue.set(this.formatDateForDisplay(current));
    }
  }

  togglePicker(): void {
    if (!this.disabled()) {
      const newState = !this.showPicker();
      this.showPicker.set(newState);
      
      // Reset calendar to current value or today's date
      if (newState) {
        const current = this.internalValue();
        if (current) {
          const [year, month] = current.split('-').map(Number);
          this.currentYear.set(year);
          this.currentMonth.set(month - 1);
        } else {
          const today = new Date();
          this.currentYear.set(today.getFullYear());
          this.currentMonth.set(today.getMonth());
        }
      }
    }
  }

  selectDate(date: string): void {
    if (!this.isDateDisabled(date)) {
      this.internalValue.set(date);
      this.displayValue.set(this.formatDateForDisplay(date));
      this.onChange(date);
      this.showPicker.set(false);
      this.cdr.markForCheck();
    }
  }

  selectToday(): void {
    const today = new Date();
    const todayStr = this.dateToISOString(today);
    this.selectDate(todayStr);
  }

  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  previousYear(): void {
    this.currentYear.update(y => y - 1);
  }

  nextYear(): void {
    this.currentYear.update(y => y + 1);
  }

  closePicker(): void {
    this.showPicker.set(false);
  }

  // Formatting and parsing methods
  private formatDateForDisplay(isoDate: string): string {
    if (!isoDate) return '';
    try {
      // Parse ISO date string and format for display
      const [year, month, day] = isoDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(this.currentLocale());
    } catch {
      return isoDate;
    }
  }

  private parseUserInput(input: string): string | null {
    if (!input || input.trim() === '') return null;
    
    try {
      // Try to parse various date formats based on locale
      const locale = this.currentLocale();
      
      // First, try native date parsing
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        return this.dateToISOString(date);
      }

      // Try parsing with locale-specific format
      // This is a simplified parser - you can enhance it based on your needs
      const parts = input.split(/[\/\-\.\s]/);
      if (parts.length === 3) {
        // Determine order based on locale
        const formatter = new Intl.DateTimeFormat(locale);
        const formatParts = formatter.formatToParts(new Date(2020, 0, 15));
        
        let year = 0, month = 0, day = 0;
        let yearIndex = -1, monthIndex = -1, dayIndex = -1;
        
        formatParts.forEach((part, index) => {
          if (part.type === 'year') yearIndex = Math.floor(index / 2);
          if (part.type === 'month') monthIndex = Math.floor(index / 2);
          if (part.type === 'day') dayIndex = Math.floor(index / 2);
        });

        if (yearIndex >= 0 && monthIndex >= 0 && dayIndex >= 0) {
          year = parseInt(parts[yearIndex], 10);
          month = parseInt(parts[monthIndex], 10);
          day = parseInt(parts[dayIndex], 10);

          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }

          if (year > 1900 && year < 2200 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const parsedDate = new Date(year, month - 1, day);
            if (!isNaN(parsedDate.getTime())) {
              return this.dateToISOString(parsedDate);
            }
          }
        }
      }
    } catch {
      // Invalid input
    }
    
    return null;
  }

  private dateToISOString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Formatting method
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T12:00:00'); // Parse as local time at noon
      return date.toLocaleDateString(this.currentLocale());
    } catch {
      return dateString;
    }
  }

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
  }

  // Validation methods
  private getFormatPattern(): string {
    return this.localizedPlaceholder().toLowerCase();
  }

  private validateFormat(input: string, pattern: string): boolean {
    if (!input || input.trim() === '') return true; // Empty is valid (let required validator handle it)
    
    // Build a regex from the pattern
    // Pattern is like "dd/mm/yyyy" or "mm/dd/yyyy" or "yyyy-mm-dd"
    const separatorMatch = pattern.match(/[\/\-\.]/);
    const separator = separatorMatch ? separatorMatch[0] : '/';
    const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Count the parts
    const parts = pattern.split(separator);
    if (parts.length !== 3) return true; // Can't validate unknown format
    
    // Build regex pattern
    const regexParts = parts.map(part => {
      const length = part.length;
      return `\\d{1,${length}}`;
    });
    
    const regexPattern = `^${regexParts.join(escapedSeparator)}$`;
    const regex = new RegExp(regexPattern);
    
    return regex.test(input);
  }

  private setCustomError(errorKey: string | null): void {
    const ctrl = this.control();
    if (ctrl) {
      if (errorKey) {
        ctrl.setErrors({ ...ctrl.errors, [errorKey]: true });
      } else if (ctrl.errors) {
        const { invalidFormat, ...rest } = ctrl.errors;
        const hasOtherErrors = Object.keys(rest).length > 0;
        ctrl.setErrors(hasOtherErrors ? rest : null);
      }
    }
  }
}
