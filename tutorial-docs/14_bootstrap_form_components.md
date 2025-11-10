# Module 14: Bootstrap 5.3 Form Components for CRUD Operations

## 🎯 Objectives

By the end of this module, you will:
- ✅ Create reusable form components using Bootstrap 5.3
- ✅ Implement ControlValueAccessor for seamless reactive forms integration
- ✅ Support multiple visualization types (floating labels, input groups, standard)
- ✅ Build comprehensive validation with translated error messages
- ✅ Create accessible form controls with ARIA attributes
- ✅ Refactor existing CRUD forms to use the new components
- ✅ Understand advanced Angular patterns for form components
- ✅ Learn when to use ngbootstrap for utility components (modals, tooltips, etc.)

---

## 📋 Prerequisites

Before starting this module, ensure you have completed:

- ✅ **Module 11**: CRUD Operations (Project CRUD implementation)
- ✅ **Module 9**: List, Search & Filtering
- ✅ **Module 7**: Internationalization (TranslatePipe)
- ✅ **Module 6**: Angular Setup (Bootstrap 5.3 installed)

### Verify Existing Components

Run these checks to ensure you're ready:

```bash
# Check that these files exist:
ls frontend/project-tracker/src/app/features/projects/components/project-form/
ls frontend/project-tracker/src/app/shared/pipes/translate.pipe.ts
ls frontend/project-tracker/src/app/shared/services/translation.service.ts

# Check Bootstrap is in package.json
grep "bootstrap" frontend/project-tracker/package.json
```

If any of these are missing, please complete the prerequisite modules first.

---

## 📌 What We'll Build in This Module

In this module, we'll create **9 reusable form input components** that integrate seamlessly with Angular Reactive Forms:

### Form Input Components:
1. **TextInputComponent** - Text, email, password, URL inputs with validation
2. **TextareaInputComponent** - Multi-line text area with character count
3. **DateInputComponent** - Date picker with min/max validation
4. **DateTimeInputComponent** - DateTime picker with constraints
5. **IntegerInputComponent** - Integer input with numeric validation
6. **DecimalInputComponent** - Decimal input with precision control
7. **CheckboxInputComponent** - Checkbox and switch controls
8. **RadioInputComponent** - Radio button groups (inline/stacked)
9. **DropdownInputComponent** - Select dropdown with search support

### Note on Utility Components:
For utility components like **modals, tooltips, popovers, carousels, etc.**, we recommend using **[ng-bootstrap](https://ng-bootstrap.github.io/)**, which provides ready-made Angular wrappers for Bootstrap components. This saves development time and ensures proper Bootstrap behavior.

### Features:
- **Three visualization types**: Floating labels, input groups, standard
- **ControlValueAccessor**: Full integration with reactive forms
- **Validation**: Built-in validators with translated error messages
- **Accessibility**: ARIA attributes, keyboard navigation, focus management
- **Bootstrap 5.3**: No custom CSS, pure Bootstrap classes
- **Signals**: Modern Angular state management
- **OnPush**: Optimized change detection

---

## 🎓 Concepts: ControlValueAccessor Interface

### What is ControlValueAccessor?

`ControlValueAccessor` is an Angular interface that allows custom form components to work seamlessly with Angular's reactive forms system. It acts as a bridge between the FormControl and your custom component.

### Why Use ControlValueAccessor?

Without it, you'd need to:
```typescript
// ❌ Bad: Manual two-way binding
<app-custom-input [(value)]="myValue"></app-custom-input>

// Form doesn't know about this control
this.form = this.fb.group({
  // Can't add custom input here
});
```

With ControlValueAccessor:
```typescript
// ✅ Good: Works like native form controls
<app-custom-input formControlName="myField"></app-custom-input>

// Form knows about this control
this.form = this.fb.group({
  myField: ['', Validators.required] // Full validation support
});
```

### The Four Required Methods

```typescript
export class CustomInputComponent implements ControlValueAccessor {
  // 1. Called when FormControl value changes
  writeValue(value: any): void {
    this.value = value;
  }

  // 2. Register callback for when component value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // 3. Register callback for when component is touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 4. Enable/disable the control
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
```

### The Provider Configuration

You must register your component as a value accessor:

```typescript
@Component({
  selector: 'app-custom-input',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomInputComponent),
    multi: true
  }]
})
```

---

## 🎨 Visualization Types

Bootstrap 5.3 offers three main form styles:

### 1. Floating Labels
Modern, material-design style with animated labels:

```html
<div class="form-floating">
  <input type="text" class="form-control" id="floatingInput" placeholder="Name">
  <label for="floatingInput">Name</label>
</div>
```

**When to use**: Modern applications, clean design, limited space

### 2. Input Groups
Labels or icons inside the input border:

```html
<div class="input-group">
  <span class="input-group-text">@</span>
  <input type="text" class="form-control" placeholder="Username">
</div>
```

**When to use**: Forms with prefixes/suffixes (currency, units, icons)

### 3. Standard (Traditional)
Classic label above input:

```html
<div class="mb-3">
  <label for="standardInput" class="form-label">Name</label>
  <input type="text" class="form-control" id="standardInput">
</div>
```

**When to use**: Traditional forms, admin panels, data-heavy forms

---

## 🛠️ Step 1: Generate Component Scaffolds

Let's create all 9 form input components using Angular CLI:

```bash
cd frontend/project-tracker

# Form input components
ng generate component shared/components/text-input --standalone
ng generate component shared/components/textarea-input --standalone
ng generate component shared/components/date-input --standalone
ng generate component shared/components/datetime-input --standalone
ng generate component shared/components/integer-input --standalone
ng generate component shared/components/decimal-input --standalone
ng generate component shared/components/checkbox-input --standalone
ng generate component shared/components/radio-input --standalone
ng generate component shared/components/dropdown-input --standalone
```

**Note**: For modals and other utility components, we'll use [ng-bootstrap](https://ng-bootstrap.github.io/) instead of creating custom implementations.

---

## 🔨 Step 2: Implement TextInputComponent

This is our most comprehensive example. All other components follow similar patterns.

### File: `text-input.component.ts`

```typescript
import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TranslationService } from '../../../services/translation.service';

/// <summary>
/// Reusable text input component with Bootstrap 5.3 styling
/// Supports: text, email, password, URL
/// Implements ControlValueAccessor for reactive forms integration
/// </summary>
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextInputComponent),
    multi: true
  }]
})
export class TextInputComponent implements ControlValueAccessor {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    // Watch for control status changes and update validation state
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

  private updateErrorState(): void {
    const ctrl = this.control();
    const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched()));
    this.hasError.set(hasErr);
  }

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
  @Input() type: 'text' | 'email' | 'password' | 'url' = 'text';
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() pattern?: string;

  // Internal state
  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);
  protected readonly hasError = signal<boolean>(false);

  // Computed properties
  protected readonly control = computed(() => {
    return this.parentForm?.get(this.controlName);
  });

  protected readonly isLabelIcon = computed(() => {
    return this.label.startsWith('fas ') || this.label.startsWith('fa ') ||
           this.label.startsWith('fab ') || this.label.startsWith('far ');
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

  protected readonly inputId = computed(() => `${this.controlName}-${Math.random().toString(36).substr(2, 9)}`);

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
```

### File: `text-input.component.html`

```html
<!-- Standard Layout -->
@if (visualizationType === 'standard') {
  <div class="mb-3">
    <label [for]="inputId()" class="form-label">
      {{ label }}
      @if (required) {
        <span class="text-danger">*</span>
      }
    </label>
    <input
      [type]="type"
      [id]="inputId()"
      class="form-control"
      [class.is-invalid]="hasError()"
      [value]="value()"
      [disabled]="disabled()"
      [placeholder]="placeholder || ''"
      [attr.minlength]="minLength"
      [attr.maxlength]="maxLength"
      [attr.pattern]="pattern"
      [attr.aria-label]="label"
      [attr.aria-required]="required"
      [attr.aria-invalid]="hasError()"
      [attr.aria-describedby]="hasError() ? inputId() + '-error' : helpText ? inputId() + '-help' : null"
      (input)="onInput($event)"
      (blur)="onBlur()">
    @if (hasError()) {
      <div [id]="inputId() + '-error'" class="invalid-feedback">
        {{ errorMessage() }}
      </div>
    }
    @if (helpText && !hasError()) {
      <div [id]="inputId() + '-help'" class="form-text">
        {{ helpText }}
      </div>
    }
  </div>
}

<!-- Floating Labels Layout -->
@if (visualizationType === 'floating') {
  <div class="form-floating mb-3">
    <input
      [type]="type"
      [id]="inputId()"
      class="form-control"
      [class.is-invalid]="hasError()"
      [value]="value()"
      [disabled]="disabled()"
      [placeholder]="placeholder || label"
      [attr.minlength]="minLength"
      [attr.maxlength]="maxLength"
      [attr.pattern]="pattern"
      [attr.aria-label]="label"
      [attr.aria-required]="required"
      [attr.aria-invalid]="hasError()"
      [attr.aria-describedby]="hasError() ? inputId() + '-error' : helpText ? inputId() + '-help' : null"
      (input)="onInput($event)"
      (blur)="onBlur()">
    <label [for]="inputId()">
      {{ label }}
      @if (required) {
        <span class="text-danger">*</span>
      }
    </label>
    @if (hasError()) {
      <div [id]="inputId() + '-error'" class="invalid-feedback">
        {{ errorMessage() }}
      </div>
    }
    @if (helpText && !hasError()) {
      <div [id]="inputId() + '-help'" class="form-text">
        {{ helpText }}
      </div>
    }
  </div>
}

<!-- Input Group Layout -->
@if (visualizationType === 'input-group') {
  <div class="mb-3">
    @if (fieldLabel) {
      <label [for]="inputId()" class="form-label">
        {{ fieldLabel }}
        @if (required) {
          <span class="text-danger">*</span>
        }
      </label>
    }
    <div class="input-group" [class.has-validation]="hasError()">
      @if (inputGroupPosition === 'prefix') {
        <span class="input-group-text">
          @if (isLabelIcon()) {
            <i [class]="label"></i>
          } @else {
            {{ label }}
          }
        </span>
      }
      <input
        [type]="type"
        [id]="inputId()"
        class="form-control"
        [class.is-invalid]="hasError()"
        [value]="value()"
        [disabled]="disabled()"
        [placeholder]="placeholder || ''"
        [attr.minlength]="minLength"
        [attr.maxlength]="maxLength"
        [attr.pattern]="pattern"
        [attr.aria-label]="fieldLabel || label"
        [attr.aria-required]="required"
        [attr.aria-invalid]="hasError()"
        [attr.aria-describedby]="hasError() ? inputId() + '-error' : helpText ? inputId() + '-help' : null"
        (input)="onInput($event)"
        (blur)="onBlur()">
      @if (inputGroupPosition === 'suffix') {
        <span class="input-group-text">
          @if (isLabelIcon()) {
            <i [class]="label"></i>
          } @else {
            {{ label }}
          }
        </span>
      }
      @if (hasError()) {
        <div [id]="inputId() + '-error'" class="invalid-feedback">
          {{ errorMessage() }}
        </div>
      }
    </div>
    @if (helpText && !hasError()) {
      <div [id]="inputId() + '-help'" class="form-text">
        {{ helpText }}
      </div>
    }
  </div>
}
```

### File: `text-input.component.css`

```css
/* No custom styles - Bootstrap 5.3 only */
```

---

## 🔨 Step 3: Implement Remaining Components

**IMPORTANT**: All remaining form components follow the same patterns as TextInputComponent:

1. **Constructor with effect**: Subscribe to FormControl changes with proper cleanup
2. **Writable hasError signal**: Manually updated via `updateErrorState()` method
3. **ChangeDetectorRef**: Injected but not needed (handled by signal updates)
4. **Input-group support**: Use dual-purpose `label` property (components that support input-group)

Below are simplified examples showing component-specific features. Refer to TextInputComponent above for the complete change detection and validation pattern.

### TextareaInputComponent

Multi-line text input with character count.

### File: `textarea-input.component.ts`

```typescript
import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-textarea-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './textarea-input.component.html',
  styleUrl: './textarea-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextareaInputComponent),
    multi: true
  }]
})
export class TextareaInputComponent implements ControlValueAccessor {
  private readonly translationService = inject(TranslationService);

  @Input() label: string = '';
  @Input() controlName!: string;
  @Input() visualizationType: 'floating' | 'standard' = 'standard';
  @Input() required: boolean = false;
  @Input() parentForm!: FormGroup;
  @Input() placeholder?: string;
  @Input() helpText?: string;
  @Input() rows: number = 3;
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() showCharacterCount: boolean = false;

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);
  protected readonly touched = signal<boolean>(false);

  protected readonly control = computed(() => this.parentForm?.get(this.controlName));
  protected readonly hasError = computed(() => {
    const ctrl = this.control();
    return ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.touched());
  });

  protected readonly characterCount = computed(() => this.value().length);
  protected readonly characterCountText = computed(() => {
    const count = this.characterCount();
    if (this.maxLength) {
      return `${count} / ${this.maxLength}`;
    }
    return `${count}`;
  });

  protected readonly errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;
    if (errors['required']) return this.translationService.translate('validation.required');
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
```

### File: `textarea-input.component.html`

```html
<!-- Standard Layout -->
@if (visualizationType === 'standard') {
  <div class="mb-3">
    <label [for]="inputId()" class="form-label">
      {{ label }}
      @if (required) {
        <span class="text-danger">*</span>
      }
    </label>
    <textarea
      [id]="inputId()"
      class="form-control"
      [class.is-invalid]="hasError()"
      [value]="value()"
      [disabled]="disabled()"
      [placeholder]="placeholder || ''"
      [rows]="rows"
      [attr.minlength]="minLength"
      [attr.maxlength]="maxLength"
      [attr.aria-label]="label"
      [attr.aria-required]="required"
      [attr.aria-invalid]="hasError()"
      [attr.aria-describedby]="hasError() ? inputId() + '-error' : helpText ? inputId() + '-help' : null"
      (input)="onInput($event)"
      (blur)="onBlur()"></textarea>
    @if (hasError()) {
      <div [id]="inputId() + '-error'" class="invalid-feedback">
        {{ errorMessage() }}
      </div>
    }
    @if (showCharacterCount && !hasError()) {
      <div class="form-text">
        {{ characterCountText() }} {{ 'common.characters' | translate }}
      </div>
    }
    @if (helpText && !hasError() && !showCharacterCount) {
      <div [id]="inputId() + '-help'" class="form-text">
        {{ helpText }}
      </div>
    }
  </div>
}

<!-- Floating Labels Layout -->
@if (visualizationType === 'floating') {
  <div class="form-floating mb-3">
    <textarea
      [id]="inputId()"
      class="form-control"
      [class.is-invalid]="hasError()"
      [value]="value()"
      [disabled]="disabled()"
      [placeholder]="placeholder || label"
      [rows]="rows"
      [style.height]="'auto'"
      [attr.minlength]="minLength"
      [attr.maxlength]="maxLength"
      [attr.aria-label]="label"
      [attr.aria-required]="required"
      [attr.aria-invalid]="hasError()"
      [attr.aria-describedby]="hasError() ? inputId() + '-error' : helpText ? inputId() + '-help' : null"
      (input)="onInput($event)"
      (blur)="onBlur()"></textarea>
    <label [for]="inputId()">
      {{ label }}
      @if (required) {
        <span class="text-danger">*</span>
      }
    </label>
    @if (hasError()) {
      <div [id]="inputId() + '-error'" class="invalid-feedback">
        {{ errorMessage() }}
      </div>
    }
    @if (showCharacterCount && !hasError()) {
      <div class="form-text">
        {{ characterCountText() }} {{ 'common.characters' | translate }}
      </div>
    }
    @if (helpText && !hasError() && !showCharacterCount) {
      <div [id]="inputId() + '-help'" class="form-text">
        {{ helpText }}
      </div>
    }
  </div>
}
```

---

## 🔨 Step 4-9: Implement Remaining Form Components

The remaining components follow the same pattern. See the complete implementations in the repository.

**Key points for each:**

- **DateInputComponent**: Uses `<input type="date">` with min/max validation
- **DateTimeInputComponent**: Uses `<input type="datetime-local">` with constraints
- **IntegerInputComponent**: Uses `<input type="number" step="1">` with min/max
- **DecimalInputComponent**: Uses `<input type="number" step="0.01">` with precision
- **CheckboxInputComponent**: Supports standard checkbox and Bootstrap switches
- **RadioInputComponent**: Renders radio button groups inline or stacked
- **DropdownInputComponent**: Uses `<select>` with optional search functionality

---

## 📦 Step 10: Create Components Export Index

Create file: `frontend/project-tracker/src/app/shared/components/index.ts`

```typescript
// Form components
export * from './text-input/text-input.component';
export * from './textarea-input/textarea-input.component';
export * from './date-input/date-input.component';
export * from './datetime-input/datetime-input.component';
export * from './integer-input/integer-input.component';
export * from './decimal-input/decimal-input.component';
export * from './checkbox-input/checkbox-input.component';
export * from './radio-input/radio-input.component';
export * from './dropdown-input/dropdown-input.component';

// Utility components
export * from './card/card-component';
export * from './confirm-dialog/confirm-dialog.component';
export * from './language-selector/language-selector.component';
export * from './not-found/not-found.component';
export * from './pagination/pagination.component';
export * from './theme-toggle/theme-toggle.component';
export * from './toast-container/toast-container.component';
```

---

## 🔧 Step 11: Refactor Project Form

Now let's update the project form to use our new components.

### Update: `project-form.component.ts`

Add imports:

```typescript
import {
  TextInputComponent,
  TextareaInputComponent,
  DropdownInputComponent,
  IntegerInputComponent,
  DateInputComponent
} from '../../../shared/components';
```

Update imports array:

```typescript
@Component({
  selector: 'app-project-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    TextInputComponent,
    TextareaInputComponent,
    DropdownInputComponent,
    IntegerInputComponent,
    DateInputComponent
  ],
  // ...
})
```

### Update: `project-form.component.html`

Replace form fields with components:

```html
<div class="container py-4">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <!-- Header - same as before -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">
            @if (isEditMode()) {
              <i class="fas fa-edit me-2"></i>
              {{ 'projects.editProject' | translate }}
            } @else {
              <i class="fas fa-plus me-2"></i>
              {{ 'projects.createProject' | translate }}
            }
          </h2>
          <p class="text-muted mb-0">
            @if (isEditMode()) {
              {{ 'projects.editProjectDesc' | translate }}
            } @else {
              {{ 'projects.createProjectDesc' | translate }}
            }
          </p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Title with Floating Label -->
            <app-text-input
              formControlName="title"
              [label]="'projects.projectTitle' | translate"
              controlName="title"
              [parentForm]="form"
              [required]="true"
              visualizationType="floating"
              [placeholder]="'projects.projectNamePlaceholder' | translate">
            </app-text-input>

            <!-- Description with Character Count -->
            <app-textarea-input
              formControlName="description"
              [label]="'projects.description' | translate"
              controlName="description"
              [parentForm]="form"
              visualizationType="standard"
              [rows]="4"
              [maxLength]="descriptionMaxLength"
              [showCharacterCount]="true"
              [placeholder]="'projects.descriptionPlaceholder' | translate">
            </app-textarea-input>

            <!-- Status and Priority Row -->
            <div class="row">
              <div class="col-md-6">
                <app-dropdown-input
                  formControlName="status"
                  [label]="'projects.status' | translate"
                  controlName="status"
                  [parentForm]="form"
                  [required]="true"
                  [options]="statusOptions"
                  visualizationType="standard">
                </app-dropdown-input>
              </div>

              <div class="col-md-6">
                <app-integer-input
                  formControlName="priority"
                  [label]="'projects.priority' | translate"
                  controlName="priority"
                  [parentForm]="form"
                  [required]="true"
                  [min]="1"
                  [max]="5"
                  visualizationType="standard">
                </app-integer-input>
              </div>
            </div>

            <!-- Dates Row -->
            <div class="row">
              <div class="col-md-6">
                <app-date-input
                  formControlName="startDate"
                  [label]="'projects.startDate' | translate"
                  controlName="startDate"
                  [parentForm]="form"
                  visualizationType="standard">
                </app-date-input>
              </div>

              <div class="col-md-6">
                <app-date-input
                  formControlName="dueDate"
                  [label]="'projects.dueDate' | translate"
                  controlName="dueDate"
                  [parentForm]="form"
                  visualizationType="standard">
                </app-date-input>
              </div>
            </div>

            <!-- Required Fields Notice -->
            <div class="alert alert-info mb-3">
              <i class="fas fa-info-circle me-2"></i>
              {{ 'common.requiredFieldIndicator' | translate }}
            </div>

            <!-- Form Actions -->
            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="cancel()"
                [disabled]="loading()">
                <i class="fas fa-times me-2"></i>
                {{ 'common.cancel' | translate }}
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="loading() || form.invalid">
                @if (loading()) {
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ 'common.saving' | translate }}
                } @else {
                  <i class="fas fa-save me-2"></i>
                  @if (isEditMode()) {
                    {{ 'common.update' | translate }}
                  } @else {
                    {{ 'common.create' | translate }}
                  }
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## ✅ Best Practices

### 1. ControlValueAccessor Implementation
✅ **Always implement all four methods**
✅ **Use forwardRef to avoid circular dependencies**
✅ **Provide NG_VALUE_ACCESSOR in component metadata**
✅ **Call onChange when value changes**
✅ **Call onTouched on blur**

### 2. Validation and Change Detection
✅ **Get FormControl from parent FormGroup**
✅ **Use writable signal for hasError (not computed)**
✅ **Update hasError via updateErrorState() method**
✅ **Subscribe to FormControl statusChanges and valueChanges**
✅ **Use effect with onCleanup for subscription management**
✅ **Check control.invalid && (control.dirty || control.touched)**
✅ **Translate all error messages**
✅ **Use Bootstrap validation classes (.is-invalid, .invalid-feedback)**

**Why writable signal for hasError?**
- Computed signals only react to signal dependencies
- FormControl is NOT a signal - it's a regular object
- When FormControl properties change (invalid, dirty, touched), computed doesn't detect it
- Solution: Manually update hasError signal when FormControl emits statusChanges/valueChanges

### 3. Accessibility
✅ **Use semantic HTML elements**
✅ **Add ARIA attributes (aria-label, aria-required, aria-invalid, aria-describedby)**
✅ **Associate labels with inputs using [for] and [id]**
✅ **Support keyboard navigation**
✅ **Manage focus appropriately**

### 4. Bootstrap Styling
✅ **Use only Bootstrap 5.3 classes**
✅ **No custom CSS files**
✅ **Support all visualization types where applicable**
✅ **Use .form-floating, .input-group, .form-label correctly**

### 5. Angular Patterns
✅ **Use signals for component state**
✅ **Use computed for derived values**
✅ **Use ChangeDetectionStrategy.OnPush**
✅ **Standalone components only**
✅ **Inject services with inject() function**

---

## ❌ Common Mistakes

### 1. Missing formControlName Directive

❌ **CRITICAL: Forgetting formControlName directive:**
```html
<!-- ❌ Wrong - Values won't load in edit mode -->
<app-text-input
  [label]="'Name' | translate"
  controlName="name"
  [parentForm]="form">
</app-text-input>
```

✅ **Correct - Always include formControlName:**
```html
<!-- ✅ Correct - FormControl properly connects to component -->
<app-text-input
  formControlName="name"
  [label]="'Name' | translate"
  controlName="name"
  [parentForm]="form">
</app-text-input>
```

**Why this matters:**
- Without `formControlName`, the component's `writeValue()` is never called
- Values won't load when editing (e.g., `form.patchValue()` won't work)
- The FormControl won't notify the component of value changes
- Validation will still work via `parentForm` and `controlName`, but data binding will be broken

### 2. Validation State Management

❌ **Using computed signal for hasError:**
```typescript
// ❌ Wrong - Computed won't update when FormControl changes
protected readonly hasError = computed(() => {
  const ctrl = this.control();
  return ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
});
```

✅ **Use writable signal with manual updates:**
```typescript
// ✅ Correct - Writable signal updated explicitly
protected readonly hasError = signal<boolean>(false);

constructor() {
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
  const hasErr = !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  this.hasError.set(hasErr);
}
```

**Why this matters:**
- Computed signals only react to changes in signal dependencies
- FormControl is a regular object, not a signal
- When you type in a field, FormControl's internal state changes, but computed doesn't see it
- Result: Errors won't appear when you clear a required field, and won't disappear when you type valid input
- Solution: Subscribe to FormControl observables and manually update hasError signal

### 3. ControlValueAccessor Mistakes

❌ **Forgetting to register the provider:**
```typescript
// Missing this will break form integration
providers: [{
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => YourComponent),
  multi: true
}]
```

❌ **Not calling onChange/onTouched:**
```typescript
// Component value changed but form doesn't know
this.value = newValue; // ❌ Wrong
```

✅ **Correct:**
```typescript
this.value.set(newValue);
this.onChange(newValue); // ✅ Notify form
```

### 3. Validation Mistakes

❌ **Validating in the component instead of parent form:**
```typescript
// Don't add validators in the component
@Input() validators: ValidatorFn[] = []; // ❌ Wrong
```

✅ **Validators belong in parent form:**
```typescript
this.form = this.fb.group({
  field: ['', [Validators.required, Validators.minLength(3)]] // ✅ Correct
});
```

### 4. Accessibility Mistakes

❌ **Missing label association:**
```html
<label>Name</label>
<input> <!-- ❌ Not associated -->
```

✅ **Proper association:**
```html
<label [for]="inputId()">Name</label>
<input [id]="inputId()"> <!-- ✅ Associated -->
```

### 5. Bootstrap Class Mistakes

❌ **Using wrong validation classes:**
```html
<input class="invalid"> <!-- ❌ Wrong class -->
<div class="error">Error</div> <!-- ❌ Wrong class -->
```

✅ **Use Bootstrap classes:**
```html
<input class="form-control is-invalid"> <!-- ✅ Correct -->
<div class="invalid-feedback">Error</div> <!-- ✅ Correct -->
```

---

## 🧪 Testing Your Components

### Test Each Component Individually

1. **Create test form:**
```typescript
this.testForm = this.fb.group({
  testField: ['', [Validators.required, Validators.minLength(3)]]
});
```

2. **Test all visualization types:**
- Standard layout
- Floating labels
- Input groups (where applicable)

3. **Test validation:**
- Required fields
- Min/max length
- Pattern validation
- Custom validators

4. **Test accessibility:**
- Keyboard navigation
- Screen reader announcements
- Focus management

### Test Project CRUD Operations

```bash
cd frontend/project-tracker
npm start
```

1. **Create new project** - Test all form fields
2. **Edit existing project** - Verify data loads correctly
3. **Submit with validation errors** - Check error messages
4. **Cancel with unsaved changes** - Test dirty form detection

---

## 📚 Usage Examples

**IMPORTANT**: All form components **must** include the `formControlName` directive to work properly with Angular reactive forms. This ensures values load correctly in edit mode and validation works as expected.

### Example 1: Simple Text Input (Standard)

```html
<app-text-input
  formControlName="name"
  label="Full Name"
  controlName="name"
  [parentForm]="myForm"
  [required]="true"
  visualizationType="standard">
</app-text-input>
```

### Example 2: Email with Input Group (Icon Prefix)

```html
<app-text-input
  formControlName="email"
  label="fas fa-envelope"
  fieldLabel="Email Address"
  controlName="email"
  type="email"
  [parentForm]="myForm"
  [required]="true"
  visualizationType="input-group"
  inputGroupPosition="prefix">
</app-text-input>
```

**Note**: In input-group mode, `label` is the addon text/icon (e.g., "fas fa-envelope" or "$"), and `fieldLabel` is the optional label above the input.

### Example 2b: Priority with Input Group (Text Suffix)

```html
<app-integer-input
  formControlName="priority"
  label="/5"
  fieldLabel="Priority"
  controlName="priority"
  [parentForm]="myForm"
  [required]="true"
  [min]="1"
  [max]="5"
  visualizationType="input-group"
  inputGroupPosition="suffix">
</app-integer-input>
```

**Result**: Shows a number input with "/5" displayed inside the input border on the right side.

### Example 3: Password with Floating Label

```html
<app-text-input
  formControlName="password"
  label="Password"
  controlName="password"
  type="password"
  [parentForm]="myForm"
  [required]="true"
  [minLength]="8"
  visualizationType="floating">
</app-text-input>
```

### Example 4: Dropdown with Options

```typescript
// In component
statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'onhold', label: 'On Hold' }
];
```

```html
<app-dropdown-input
  formControlName="status"
  label="Project Status"
  controlName="status"
  [parentForm]="myForm"
  [required]="true"
  [options]="statusOptions">
</app-dropdown-input>
```

### Example 5: Using ng-bootstrap for Modals

For modals and other utility components, we recommend using **[ng-bootstrap](https://ng-bootstrap.github.io/)** instead of creating custom implementations.

Install ng-bootstrap:
```bash
npm install @ng-bootstrap/ng-bootstrap
```

Example modal usage with ng-bootstrap:
```typescript
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export class MyComponent {
  private modalService = inject(NgbModal);

  openConfirmDialog(content: any) {
    this.modalService.open(content, { centered: true })
      .result.then(
        (result) => console.log('Confirmed:', result),
        (reason) => console.log('Dismissed:', reason)
      );
  }
}
```

```html
<ng-template #confirmModal let-modal>
  <div class="modal-header">
    <h4 class="modal-title">Confirm Delete</h4>
    <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
  </div>
  <div class="modal-body">
    <p>Are you sure you want to delete this project?</p>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Cancel</button>
    <button type="button" class="btn btn-danger" (click)="modal.close('Delete')">Delete</button>
  </div>
</ng-template>
```

**Benefits of ng-bootstrap:**
- Battle-tested, maintained by Angular community
- Full Bootstrap 5 support with Angular directives
- Includes modals, tooltips, popovers, typeahead, datepicker, and more
- Proper accessibility support built-in
- No jQuery dependency

---

## 🎓 Key Takeaways

1. **ControlValueAccessor** enables custom components to work seamlessly with reactive forms
2. **Bootstrap 5.3** provides three visualization types: floating, input-group, standard
3. **Validation** should be defined in parent form, displayed in component
4. **Accessibility** requires ARIA attributes, semantic HTML, keyboard support
5. **Signals** provide reactive state management with better performance
6. **OnPush** change detection improves component performance
7. **Reusable components** reduce code duplication and ensure consistency
8. **ng-bootstrap** is recommended for utility components (modals, tooltips, etc.) instead of custom implementations

---

## 🚀 What's Next?

In **Module 15: Containerization & Deployment**, you'll learn:
- Docker container building
- Docker Compose orchestration
- Deployment strategies
- Environment configuration
- Production considerations

---

## 📖 Additional Resources

- [Angular ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor)
- [Bootstrap 5.3 Forms](https://getbootstrap.com/docs/5.3/forms/overview/)
- [Angular Reactive Forms](https://angular.io/guide/reactive-forms)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular Signals](https://angular.io/guide/signals)
- [ng-bootstrap](https://ng-bootstrap.github.io/) - Angular widgets built from ground up using Bootstrap 5

---

**Congratulations!** You've created a comprehensive set of reusable form components using Bootstrap 5.3 and Angular's ControlValueAccessor pattern. These components can be used across your entire application for consistent, accessible, and maintainable forms.
