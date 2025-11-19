import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

/**
 * Reusable date input component with HTML5 date input
 * Supports min and max date validation
 * Implements ControlValueAccessor for reactive forms integration
 */
@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.html',
  styleUrl: './date-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
    // Must be in ngOnInit because @Input() properties are not available in constructor
    this.inputId = `${this.controlName}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Common inputs
  @Input() label: string = '';
  @Input() controlName!: string;
  @Input() visualizationType: 'floating' | 'standard' = 'standard';
  @Input() required: boolean = false;
  @Input() parentForm!: FormGroup;
  @Input() placeholder?: string;
  @Input() helpText?: string;

  // Specific inputs
  @Input() minDate?: string; // ISO format YYYY-MM-DD
  @Input() maxDate?: string; // ISO format YYYY-MM-DD

  // Internal state
  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);
  protected readonly hasError = signal<boolean>(false);

  // Computed properties
  protected readonly control = computed(() => {
    return this.parentForm?.get(this.controlName);
  });

  protected readonly errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;

    if (errors['required']) {
      return this.translationService.translate('validation.required');
    }
    if (errors['min']) {
      return this.translationService.translate('validation.minDate', {
        min: this.formatDate(this.minDate || '')
      });
    }
    if (errors['max']) {
      return this.translationService.translate('validation.maxDate', {
        max: this.formatDate(this.maxDate || '')
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

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (!value) {
      this.value.set('');
      this.cdr.markForCheck();
      return;
    }
    
    // Extract just the date part (YYYY-MM-DD) from ISO datetime string
    // Handles both "2024-01-15" and "2024-01-15T00:00:00" formats
    const dateOnly = value.split('T')[0];
    this.value.set(dateOnly);
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
    this.value.set(input.value);
    this.onChange(input.value);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
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
}
