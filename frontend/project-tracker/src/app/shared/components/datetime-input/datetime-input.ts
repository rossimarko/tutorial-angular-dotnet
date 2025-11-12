import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbInputDatepicker, NgbTimepicker, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../services/translation.service';

/// <summary>
/// Reusable datetime input component with ng-bootstrap datepicker and timepicker
/// Combines date and time selection with ISO datetime string output
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-datetime-input',
  templateUrl: './datetime-input.html',
  styleUrl: './datetime-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbInputDatepicker, NgbTimepicker],
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
    // Must be in ngOnInit because @Input() properties are not available in constructor
    this.inputId = `${this.controlName}-${Math.random().toString(36).substr(2, 9)}`;
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
  protected readonly dateValue = signal<NgbDateStruct | null>(null);
  protected readonly timeValue = signal<NgbTimeStruct | null>(null);
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);
  protected readonly hasError = signal<boolean>(false);

  // Computed properties
  protected readonly control = computed(() => {
    return this.parentForm?.get(this.controlName);
  });

  protected readonly minDateStruct = computed(() => {
    return this.minDateTime ? this.stringToDateStruct(this.minDateTime) : null;
  });

  protected readonly maxDateStruct = computed(() => {
    return this.maxDateTime ? this.stringToDateStruct(this.maxDateTime) : null;
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

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (value) {
      const dateTime = this.stringToDateTime(value);
      this.dateValue.set(dateTime.date);
      this.timeValue.set(dateTime.time);
    } else {
      this.dateValue.set(null);
      this.timeValue.set(null);
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
    this.dateValue.set(date);
    this.emitDateTime();
  }

  onTimeChange(time: NgbTimeStruct | null): void {
    this.timeValue.set(time);
    this.emitDateTime();
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  private emitDateTime(): void {
    const date = this.dateValue();
    const time = this.timeValue();

    if (date && time) {
      const isoString = this.dateTimeToString(date, time);
      this.onChange(isoString);
    } else if (date) {
      // If only date is set, use midnight
      const isoString = this.dateTimeToString(date, { hour: 0, minute: 0, second: 0 });
      this.onChange(isoString);
    } else {
      this.onChange('');
    }
  }

  // Conversion methods
  private stringToDateTime(dateTimeString: string): { date: NgbDateStruct | null, time: NgbTimeStruct | null } {
    if (!dateTimeString) return { date: null, time: null };

    try {
      const date = new Date(dateTimeString);
      return {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        time: {
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds()
        }
      };
    } catch {
      return { date: null, time: null };
    }
  }

  private stringToDateStruct(dateTimeString: string): NgbDateStruct | null {
    if (!dateTimeString) return null;
    try {
      const date = new Date(dateTimeString);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    } catch {
      return null;
    }
  }

  private dateTimeToString(date: NgbDateStruct, time: NgbTimeStruct): string {
    if (!date) return '';

    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');

    const hour = (time?.hour || 0).toString().padStart(2, '0');
    const minute = (time?.minute || 0).toString().padStart(2, '0');
    const second = (time?.second || 0).toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
  }
}
