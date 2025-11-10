import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Reusable textarea input component with Bootstrap 5.3 styling
/// Supports character count and multiple visualization types
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-textarea-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './textarea-input.html',
  styleUrl: './textarea-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextareaInput),
    multi: true
  }]
})
export class TextareaInput implements ControlValueAccessor {
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

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
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
  @Input() rows: number = 3;
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() showCharacterCount: boolean = false;

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
    if (errors['minlength']) {
      return this.translationService.translate('validation.minLength', {
        min: errors['minlength'].requiredLength
      });
    }
    if (errors['maxlength']) {
      return this.translationService.translate('validation.maxLength', {
        max: errors['maxlength'].requiredLength
      });
    }

    return this.translationService.translate('validation.invalidValue');
  });

  protected readonly inputId = computed(() => `${this.controlName}-${Math.random().toString(36).substr(2, 9)}`);

  protected readonly characterCount = computed(() => {
    return this.value().length;
  });

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
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
    const target = event.target as HTMLTextAreaElement;
    const newValue = target.value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
