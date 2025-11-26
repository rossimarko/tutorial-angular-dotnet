import { Component, input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef, OnInit } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Reusable decimal input component with Bootstrap 5.3 styling
/// Uses input type="number" with configurable step for decimal values
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-decimal-input',
  imports: [ReactiveFormsModule],
  templateUrl: './decimal-input.html',
  styleUrl: './decimal-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DecimalInput),
    multi: true
  }]
})
export class DecimalInput implements ControlValueAccessor, OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Common inputs
  readonly label = input<string>('');  // For input-group: the addon text/icon; For standard/floating: field label
  readonly controlName = input.required<string>();
  readonly visualizationType = input<'floating' | 'input-group' | 'standard'>('standard');
  readonly required = input<boolean>(false);
  readonly parentForm = input.required<FormGroup>();
  readonly placeholder = input<string>();
  readonly helpText = input<string>();

  // Input-group specific
  readonly inputGroupPosition = input<'prefix' | 'suffix'>('prefix');  // Position of label in input-group
  readonly fieldLabel = input<string>();  // Optional label above input-group

  // Specific inputs
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input<number>(0.01);
  readonly decimalPlaces = input<number>(); // For validation

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
    this.inputId = `${this.controlName()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Internal state
  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);
  protected readonly hasError = signal<boolean>(false);

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
    if (errors['min']) {
      return this.translationService.translate('validation.min', {
        min: this.min() ?? 0
      });
    }
    if (errors['max']) {
      return this.translationService.translate('validation.max', {
        max: this.max() ?? 0
      });
    }

    return this.translationService.translate('validation.invalidValue');
  });

  protected inputId!: string;

  protected readonly isLabelIcon = computed(() => {
    const labelVal = this.label();
    return labelVal.startsWith('fas ') || labelVal.startsWith('fa ') ||
           labelVal.startsWith('fab ') || labelVal.startsWith('far ');
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

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
  }
}
