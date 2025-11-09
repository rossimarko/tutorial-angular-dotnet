import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Reusable integer input component with Bootstrap 5.3 styling
/// Supports min, max, and step validation
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-integer-input',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './integer-input.html',
  styleUrl: './integer-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IntegerInput),
    multi: true
  }]
})
export class IntegerInput implements ControlValueAccessor {
  private readonly translationService = inject(TranslationService);

  // Common inputs
  @Input() label: string = '';
  @Input() controlName!: string;
  @Input() visualizationType: 'floating' | 'input-group' | 'standard' = 'standard';
  @Input() required: boolean = false;
  @Input() parentForm!: FormGroup;
  @Input() placeholder?: string;
  @Input() helpText?: string;

  // Specific inputs
  @Input() min?: number;
  @Input() max?: number;
  @Input() step: number = 1;
  @Input() prefixIcon?: string;  // For input-group type
  @Input() suffixIcon?: string;  // For input-group type
  @Input() prefixText?: string;  // For input-group type
  @Input() suffixText?: string;  // For input-group type

  // Internal state
  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);

  // Computed properties
  protected readonly control = computed(() => {
    return this.parentForm?.get(this.controlName);
  });

  protected readonly hasError = computed(() => {
    const ctrl = this.control();
    return ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched());
  });

  protected readonly errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;

    if (errors['required']) {
      return this.translationService.translate('validation.required');
    }
    if (errors['min']) {
      return this.translationService.translate('validation.min', {
        min: errors['min'].min
      });
    }
    if (errors['max']) {
      return this.translationService.translate('validation.max', {
        max: errors['max'].max
      });
    }
    if (errors['pattern']) {
      return this.translationService.translate('validation.invalidInteger');
    }

    return this.translationService.translate('validation.invalidValue');
  });

  protected readonly inputId = computed(() => `${this.controlName}-${Math.random().toString(36).substr(2, 9)}`);

  // ControlValueAccessor implementation
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
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
    const target = event.target as HTMLInputElement;
    const newValue = target.value === '' ? null : parseInt(target.value, 10);
    this.value.set(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
