import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Reusable datetime input component with HTML5 datetime-local input
/// Combines date and time selection with ISO datetime string output
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-datetime-input',
  templateUrl: './datetime-input.html',
  styleUrl: './datetime-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatetimeInput),
    multi: true
  }]
})
export class DatetimeInput implements ControlValueAccessor, OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

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
  @Input() minDateTime?: string; // ISO format
  @Input() maxDateTime?: string; // ISO format

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
      return this.translationService.translate('validation.minDateTime');
    }
    if (errors['max']) {
      return this.translationService.translate('validation.maxDateTime');
    }

    return this.translationService.translate('validation.invalidValue');
  });

  protected inputId!: string;

  // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
  protected readonly datetimeLocalValue = computed(() => {
    const val = this.value();
    if (!val || val.length < 16) return '';
    // Convert from ISO format (with seconds) to datetime-local format (without seconds)
    return val.substring(0, 16);
  });

  protected readonly minDateTimeLocal = computed(() => {
    const min = this.minDateTime;
    if (!min || min.length < 16) return undefined;
    return min.substring(0, 16);
  });

  protected readonly maxDateTimeLocal = computed(() => {
    const max = this.maxDateTime;
    if (!max || max.length < 16) return undefined;
    return max.substring(0, 16);
  });

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
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
    // Convert from datetime-local format to ISO format with seconds
    const isoValue = input.value ? input.value + ':00' : '';
    this.value.set(isoValue);
    this.onChange(isoValue);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
  }
}
