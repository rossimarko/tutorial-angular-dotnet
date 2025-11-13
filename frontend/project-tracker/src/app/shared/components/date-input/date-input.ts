import { Component, input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbInputDatepicker, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Custom date formatter for ng-bootstrap datepicker
/// Formats dates according to the current locale
/// </summary>
class LocaleDateFormatter extends NgbDateParserFormatter {
  constructor(private translationService: TranslationService) {
    super();
  }

  parse(value: string): NgbDateStruct | null {
    if (!value) return null;
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return null;
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    } catch {
      return null;
    }
  }

  format(date: NgbDateStruct | null): string {
    if (!date) return '';
    try {
      const isoString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      const dateObj = new Date(isoString);
      const culture = this.translationService.currentCultureInfo();
      const locale = culture?.code || 'en-US';
      return dateObj.toLocaleDateString(locale);
    } catch {
      return '';
    }
  }
}

/// <summary>
/// Reusable date input component with ng-bootstrap datepicker
/// Supports min and max date validation
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.html',
  styleUrl: './date-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbInputDatepicker],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInput),
      multi: true
    },
    {
      provide: NgbDateParserFormatter,
      useClass: LocaleDateFormatter,
      deps: [TranslationService]
    }
  ]
})
export class DateInput implements ControlValueAccessor, OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly currentLocale = computed(() => {
    const culture = this.translationService.currentCultureInfo();
    return culture?.code || 'en-US';
  });

  constructor() {
    // Watch for control status changes and trigger change detection
    effect((onCleanup) => {
      const ctrl = this.control();
      if (ctrl) {
        this.updateErrorState();

        const statusSub = ctrl.statusChanges.subscribe(() => {
          this.updateErrorState();
        });
        const valueSub = ctrl.valueChanges.subscribe(() => {
          this.updateErrorState();
        });

        onCleanup(() => {
          statusSub.unsubscribe();
          valueSub.unsubscribe();
        });
      }
    });
  }

  ngOnInit(): void {
    // Generate a stable, unique input ID once per component instance
    // Must be in ngOnInit because input() properties are not available in constructor
    this.inputId = `${this.controlName()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Common inputs
  readonly label = input<string>('');
  readonly controlName = input.required<string>();
  readonly visualizationType = input<'floating' | 'standard'>('standard');
  readonly required = input<boolean>(false);
  readonly parentForm = input.required<FormGroup>();
  readonly placeholder = input<string | undefined>(undefined);
  readonly helpText = input<string | undefined>(undefined);

  // Specific inputs
  readonly minDate = input<string | undefined>(undefined); // ISO format YYYY-MM-DD
  readonly maxDate = input<string | undefined>(undefined); // ISO format YYYY-MM-DD

  // Internal state
  protected readonly value = signal<NgbDateStruct | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);
  protected readonly hasError = signal<boolean>(false);

  // Computed properties
  protected readonly control = computed(() => {
    return this.parentForm()?.get(this.controlName());
  });

  protected readonly minDateStruct = computed(() => {
    return this.minDate() ? this.stringToDateStruct(this.minDate()!) : null;
  });

  protected readonly maxDateStruct = computed(() => {
    return this.maxDate() ? this.stringToDateStruct(this.maxDate()!) : null;
  });

  protected readonly errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;

    if (errors['required']) {
      return this.translationService.translate('validation.required');
    }
    if (errors['ngbDate']) {
      if (errors['ngbDate'].minDate) {
        return this.translationService.translate('validation.minDate', {
          min: this.formatDateStruct(errors['ngbDate'].minDate)
        });
      }
      if (errors['ngbDate'].maxDate) {
        return this.translationService.translate('validation.maxDate', {
          max: this.formatDateStruct(errors['ngbDate'].maxDate)
        });
      }
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

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (value) {
      this.value.set(this.stringToDateStruct(value));
    } else {
      this.value.set(null);
    }
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
  onDateSelect(date: NgbDateStruct | null): void {
    this.value.set(date);
    const isoString = date ? this.dateStructToString(date) : '';
    this.onChange(isoString);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  // Conversion methods
  private stringToDateStruct(dateString: string): NgbDateStruct | null {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    } catch {
      return null;
    }
  }

  private dateStructToString(date: NgbDateStruct): string {
    if (!date) return '';
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateStruct(date: NgbDateStruct): string {
    if (!date) return '';
    const isoString = this.dateStructToString(date);
    try {
      const dateObj = new Date(isoString);
      return dateObj.toLocaleDateString(this.currentLocale());
    } catch {
      return isoString;
    }
  }

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
  }
}
