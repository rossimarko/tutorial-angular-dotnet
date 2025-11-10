import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Radio option model for radio button groups
/// </summary>
export interface RadioOption {
  value: any;
  label: string;
}

/// <summary>
/// Reusable radio button group component with Bootstrap 5.3 styling
/// Uses input type="radio" for single selection from multiple options
/// Supports inline (horizontal) and stacked (vertical) layouts
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-radio-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radio-input.html',
  styleUrl: './radio-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RadioInput),
    multi: true
  }]
})
export class RadioInput implements ControlValueAccessor {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

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

  // Common inputs
  @Input() label: string = '';
  @Input() controlName!: string;
  @Input() required: boolean = false;
  @Input() parentForm!: FormGroup;
  @Input() helpText?: string;

  // Specific inputs
  @Input() options: RadioOption[] = [];
  @Input() inline: boolean = false; // Horizontal vs vertical layout

  // Internal state
  protected readonly value = signal<any>(null);
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

    return this.translationService.translate('validation.invalidValue');
  });

  protected readonly groupId = computed(() => `${this.controlName}-${Math.random().toString(36).substr(2, 9)}`);

  // Generate unique ID for each option
  protected getOptionId(index: number): string {
    return `${this.groupId()}-option-${index}`;
  }

  // Check if option is selected
  protected isChecked(optionValue: any): boolean {
    return this.value() === optionValue;
  }

  // ControlValueAccessor implementation
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // Event handlers
  onChange_internal(optionValue: any): void {
    this.value.set(optionValue);
    this.onChange(optionValue);
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
