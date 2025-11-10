import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Reusable decimal input component with Bootstrap 5.3 styling
/// Uses input type="number" with configurable step for decimal values
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-decimal-input',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './decimal-input.html',
  styleUrl: './decimal-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DecimalInput),
    multi: true
  }]
})
export class DecimalInput implements ControlValueAccessor {
  private readonly translationService = inject(TranslationService);

  // Common inputs
  @Input() label: string = '';  // For input-group: the addon text/icon; For standard/floating: field label
  @Input() controlName!: string;
  @Input() visualizationType: 'floating' | 'input-group' | 'standard' = 'standard';
  @Input() required: boolean = false;
  @Input() parentForm!: FormGroup;
  @Input() placeholder?: string;
  @Input() helpText?: string;

  // Input-group specific
  @Input() inputGroupPosition: 'prefix' | 'suffix' = 'prefix';  // Position of label in input-group
  @Input() fieldLabel?: string;  // Optional label above input-group

  // Specific inputs
  @Input() min?: number;
  @Input() max?: number;
  @Input() step: number = 0.01;
  @Input() decimalPlaces?: number; // For validation

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
        min: this.min ?? 0
      });
    }
    if (errors['max']) {
      return this.translationService.translate('validation.max', {
        max: this.max ?? 0
      });
    }

    return this.translationService.translate('validation.invalidValue');
  });

  protected readonly inputId = computed(() => `${this.controlName}-${Math.random().toString(36).substr(2, 9)}`);

  protected readonly isLabelIcon = computed(() => {
    return this.label.startsWith('fas ') || this.label.startsWith('fa ') ||
           this.label.startsWith('fab ') || this.label.startsWith('far ');
  });

  // ControlValueAccessor implementation
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value.set(value);
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
    const newValue = target.value === '' ? null : parseFloat(target.value);
    this.value.set(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
