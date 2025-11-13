import { Component, input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Reusable text input component with Bootstrap 5.3 styling
/// Supports: text, email, password, URL
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-text-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextInput),
    multi: true
  }]
})
export class TextInput implements ControlValueAccessor, OnInit {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {


    // Watch for control status changes and trigger change detection
    effect((onCleanup) => {
      const ctrl = this.control();
      if (ctrl) {
        // Update error state immediately
        this.updateErrorState();

        // Subscribe to status changes (valid/invalid state)
        const statusSub = ctrl.statusChanges.subscribe(() => {
          this.updateErrorState();
        });
        // Subscribe to value changes (triggers validation)
        const valueSub = ctrl.valueChanges.subscribe(() => {
          this.updateErrorState();
        });

        // Clean up subscriptions when effect re-runs or component destroys
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

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
  }

  // Common inputs
  readonly label = input<string>('');  // For input-group: the addon text/icon; For standard/floating: field label
  readonly controlName = input.required<string>();
  readonly visualizationType = input<'floating' | 'input-group' | 'standard'>('standard');
  readonly required = input<boolean>(false);
  readonly parentForm = input.required<FormGroup>();
  readonly placeholder = input<string | undefined>(undefined);
  readonly helpText = input<string | undefined>(undefined);

  // Input-group specific
  readonly inputGroupPosition = input<'prefix' | 'suffix'>('prefix');  // Position of label in input-group
  readonly fieldLabel = input<string | undefined>(undefined);  // Optional label above input-group

  // Specific inputs
  readonly type = input<'text' | 'email' | 'password' | 'url'>('text');
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);
  readonly pattern = input<string | undefined>(undefined);

  // Internal state
  protected readonly value = signal<string>('');
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
    if (errors['email']) {
      return this.translationService.translate('validation.invalidEmail');
    }
    if (errors['pattern']) {
      return this.translationService.translate('validation.invalidPattern');
    }

    return this.translationService.translate('validation.invalidValue');
  });

  protected inputId!: string;

  protected readonly isLabelIcon = computed(() => {
    return this.label().startsWith('fas ') || this.label().startsWith('fa ') ||
           this.label().startsWith('fab ') || this.label().startsWith('far ');
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
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
