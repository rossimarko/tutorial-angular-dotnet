# Module 11: CRUD Operations - Create, Update & Delete# Module 11: Add, Edit & Delete Operations



## 🎯 Objectives## 🎯 Objectives



By the end of this module, you will:- ✅ Create form component

- ✅ Build reactive forms with validation- ✅ Update form component

- ✅ Create and edit projects with the same component- ✅ Delete confirmation

- ✅ Implement client-side and server-side validation- ✅ Validation (client & server)

- ✅ Add async validators for unique fields- ✅ Error handling

- ✅ Create delete confirmation modals- ✅ Success notifications

- ✅ Build a toast notification service

- ✅ Handle form errors gracefully## 📌 Status: Framework Ready

- ✅ Manage form state (pristine, dirty, touched)

Implement:

## 📋 What is CRUD?- [ ] Project form (create/edit)

- [ ] Reactive form validation

**CRUD** stands for the four basic database operations:- [ ] Async validation

- **C**reate: Add new records- [ ] Delete confirmation modal

- **R**ead: Retrieve/display records (covered in Modules 9-10)- [ ] Success/error toast notifications

- **U**pdate: Modify existing records- [ ] Form state management

- **D**elete: Remove records

---

### Form Best Practices:

- **Reactive Forms**: Type-safe, testable, composable**Next: [Module 12: Bootstrap UI](./12_bootstrap_ui.md)**

- **Validation**: Prevent invalid data at submission
- **User Feedback**: Clear error messages, success notifications
- **Confirmation**: Ask before destructive actions (delete)
- **Loading States**: Disable form during API calls

---

## 📝 Step 1: Toast Notification Service

First, let's create a service to show success/error notifications.

Create file: `frontend/project-tracker/src/app/shared/services/notification.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';

/// <summary>
/// Toast notification type
/// </summary>
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/// <summary>
/// Toast notification model
/// </summary>
export interface Toast {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
}

/// <summary>
/// Service for displaying toast notifications
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  /// <summary>
  /// Get current toasts as readonly signal
  /// </summary>
  getToasts() {
    return this.toasts.asReadonly();
  }

  /// <summary>
  /// Show success notification
  /// </summary>
  success(title: string, message: string, duration: number = 3000): void {
    this.show('success', title, message, duration);
  }

  /// <summary>
  /// Show error notification
  /// </summary>
  error(title: string, message: string, duration: number = 5000): void {
    this.show('error', title, message, duration);
  }

  /// <summary>
  /// Show warning notification
  /// </summary>
  warning(title: string, message: string, duration: number = 4000): void {
    this.show('warning', title, message, duration);
  }

  /// <summary>
  /// Show info notification
  /// </summary>
  info(title: string, message: string, duration: number = 3000): void {
    this.show('info', title, message, duration);
  }

  /// <summary>
  /// Show notification
  /// </summary>
  private show(type: NotificationType, title: string, message: string, duration: number): void {
    const toast: Toast = {
      id: this.nextId++,
      type,
      title,
      message,
      duration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  /// <summary>
  /// Remove notification by ID
  /// </summary>
  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /// <summary>
  /// Clear all notifications
  /// </summary>
  clear(): void {
    this.toasts.set([]);
  }
}
```

Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.ts`

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../../services/notification.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Container component for displaying toast notifications
/// </summary>
@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  private readonly notificationService = inject(NotificationService);
  
  protected readonly toasts = this.notificationService.getToasts();

  /// <summary>
  /// Get Bootstrap class for toast type
  /// </summary>
  getToastClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-white'
    };
    return classes[type];
  }

  /// <summary>
  /// Get icon for toast type
  /// </summary>
  getToastIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type];
  }

  /// <summary>
  /// Close toast
  /// </summary>
  close(id: number): void {
    this.notificationService.remove(id);
  }
}
```

Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.html`

```html
<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
  @for (toast of toasts(); track toast.id) {
    <div
      class="toast show mb-2"
      [class]="getToastClass(toast.type)"
      role="alert"
      aria-live="assertive"
      aria-atomic="true">
      <div class="toast-header" [class]="getToastClass(toast.type)">
        <i [class]="getToastIcon(toast.type) + ' me-2'"></i>
        <strong class="me-auto">{{ toast.title }}</strong>
        <button
          type="button"
          class="btn-close btn-close-white"
          (click)="close(toast.id)"
          [attr.aria-label]="'common.close' | translate">
        </button>
      </div>
      <div class="toast-body">
        {{ toast.message }}
      </div>
    </div>
  }
</div>
```

Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.css`

```css
.toast {
  min-width: 300px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.toast-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}
```

Add ToastContainer to your main app component template:

```html
<!-- In app.component.html -->
<app-toast-container></app-toast-container>
<router-outlet></router-outlet>
```

---

## 📋 Step 2: Project Form Component

Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.ts`

```typescript
import { Component, inject, signal, OnInit, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Project, ProjectStatus } from '../../../../shared/models/project.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

/// <summary>
/// Form component for creating and editing projects
/// Uses same component for both create and edit modes
/// </summary>
@Component({
  selector: 'app-project-form',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals for component state
  protected readonly isEditMode = signal(false);
  protected readonly loading = signal(false);
  protected readonly projectId = signal<number | null>(null);

  // Form
  protected readonly form: FormGroup;

  // Status options
  protected readonly statusOptions: ProjectStatus[] = ['Active', 'Completed', 'OnHold', 'Cancelled'];
  protected readonly priorityOptions = [1, 2, 3, 4, 5];

  constructor() {
    // Initialize form
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      status: ['Active', [Validators.required]],
      priority: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      startDate: [null],
      dueDate: [null]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.projectId.set(parseInt(id, 10));
      this.loadProject(parseInt(id, 10));
    }
  }

  /// <summary>
  /// Load project data for editing
  /// </summary>
  private loadProject(id: number): void {
    this.loading.set(true);
    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.form.patchValue({
          title: project.title,
          description: project.description,
          status: project.status,
          priority: project.priority,
          startDate: this.formatDateForInput(project.startDate),
          dueDate: this.formatDateForInput(project.dueDate)
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.notificationService.error(
          'Error',
          'Failed to load project data'
        );
        this.loading.set(false);
        this.router.navigate(['/projects']);
      }
    });
  }

  /// <summary>
  /// Format date for HTML input (YYYY-MM-DD)
  /// </summary>
  private formatDateForInput(date: Date | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /// <summary>
  /// Submit form
  /// </summary>
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.warning(
        'Validation Error',
        'Please fix the errors in the form'
      );
      return;
    }

    this.loading.set(true);
    const formValue = this.form.value;

    // Convert date strings to Date objects
    const projectData: Partial<Project> = {
      title: formValue.title,
      description: formValue.description || null,
      status: formValue.status,
      priority: formValue.priority,
      startDate: formValue.startDate ? new Date(formValue.startDate) : null,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : null
    };

    const operation$ = this.isEditMode()
      ? this.projectService.updateProject(this.projectId()!, projectData)
      : this.projectService.createProject(projectData);

    operation$.subscribe({
      next: () => {
        this.notificationService.success(
          'Success',
          this.isEditMode() ? 'Project updated successfully' : 'Project created successfully'
        );
        this.loading.set(false);
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        console.error('Error saving project:', error);
        this.notificationService.error(
          'Error',
          'Failed to save project. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  /// <summary>
  /// Cancel and go back
  /// </summary>
  cancel(): void {
    if (this.form.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/projects']);
      }
    } else {
      this.router.navigate(['/projects']);
    }
  }

  /// <summary>
  /// Check if field has error
  /// </summary>
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.form.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /// <summary>
  /// Get error message for field
  /// </summary>
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      return 'This field is required';
    }
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `Minimum value is ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Maximum value is ${errors['max'].max}`;
    }

    return 'Invalid value';
  }
}
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.html`

```html
<div class="container py-4">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <!-- Header -->
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
            {{ isEditMode() ? ('projects.editProjectDesc' | translate) : ('projects.createProjectDesc' | translate) }}
          </p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Title -->
            <div class="mb-3">
              <label for="title" class="form-label">
                {{ 'projects.projectName' | translate }}
                <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                id="title"
                class="form-control"
                formControlName="title"
                [class.is-invalid]="hasError('title')"
                [placeholder]="'projects.projectNamePlaceholder' | translate">
              @if (hasError('title')) {
                <div class="invalid-feedback">
                  {{ getErrorMessage('title') }}
                </div>
              }
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label for="description" class="form-label">
                {{ 'projects.description' | translate }}
              </label>
              <textarea
                id="description"
                class="form-control"
                formControlName="description"
                rows="4"
                [class.is-invalid]="hasError('description')"
                [placeholder]="'projects.descriptionPlaceholder' | translate">
              </textarea>
              @if (hasError('description')) {
                <div class="invalid-feedback">
                  {{ getErrorMessage('description') }}
                </div>
              }
              <div class="form-text">
                {{ form.get('description')?.value?.length || 0 }} / 1000 {{ 'common.characters' | translate }}
              </div>
            </div>

            <!-- Status and Priority Row -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="status" class="form-label">
                  {{ 'projects.status' | translate }}
                  <span class="text-danger">*</span>
                </label>
                <select
                  id="status"
                  class="form-select"
                  formControlName="status"
                  [class.is-invalid]="hasError('status')">
                  @for (status of statusOptions; track status) {
                    <option [value]="status">
                      {{ 'projects.status_' + status | translate }}
                    </option>
                  }
                </select>
                @if (hasError('status')) {
                  <div class="invalid-feedback">
                    {{ getErrorMessage('status') }}
                  </div>
                }
              </div>

              <div class="col-md-6 mb-3">
                <label for="priority" class="form-label">
                  {{ 'projects.priority' | translate }}
                  <span class="text-danger">*</span>
                </label>
                <select
                  id="priority"
                  class="form-select"
                  formControlName="priority"
                  [class.is-invalid]="hasError('priority')">
                  @for (priority of priorityOptions; track priority) {
                    <option [value]="priority">
                      {{ priority }} - {{ 'projects.priority_' + priority | translate }}
                    </option>
                  }
                </select>
                @if (hasError('priority')) {
                  <div class="invalid-feedback">
                    {{ getErrorMessage('priority') }}
                  </div>
                }
              </div>
            </div>

            <!-- Dates Row -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="startDate" class="form-label">
                  {{ 'projects.startDate' | translate }}
                </label>
                <input
                  type="date"
                  id="startDate"
                  class="form-control"
                  formControlName="startDate"
                  [class.is-invalid]="hasError('startDate')">
                @if (hasError('startDate')) {
                  <div class="invalid-feedback">
                    {{ getErrorMessage('startDate') }}
                  </div>
                }
              </div>

              <div class="col-md-6 mb-3">
                <label for="dueDate" class="form-label">
                  {{ 'projects.dueDate' | translate }}
                </label>
                <input
                  type="date"
                  id="dueDate"
                  class="form-control"
                  formControlName="dueDate"
                  [class.is-invalid]="hasError('dueDate')">
                @if (hasError('dueDate')) {
                  <div class="invalid-feedback">
                    {{ getErrorMessage('dueDate') }}
                  </div>
                }
              </div>
            </div>

            <!-- Required Fields Notice -->
            <div class="alert alert-info mb-3">
              <i class="fas fa-info-circle me-2"></i>
              <span class="text-danger">*</span> {{ 'common.requiredFields' | translate }}
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
                  {{ isEditMode() ? ('common.update' | translate) : ('common.create' | translate) }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Form Debug (Development Only) -->
      @if (false) {
        <div class="card mt-3">
          <div class="card-body">
            <h6>Form Debug</h6>
            <pre>{{ form.value | json }}</pre>
            <p>Valid: {{ form.valid }}</p>
            <p>Dirty: {{ form.dirty }}</p>
            <p>Touched: {{ form.touched }}</p>
          </div>
        </div>
      }
    </div>
  </div>
</div>
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.css`

```css
.card {
  border-radius: 8px;
}

.form-label {
  font-weight: 500;
  color: var(--bs-secondary);
  margin-bottom: 0.5rem;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}

.btn {
  min-width: 100px;
}

h2 {
  font-weight: 600;
  color: var(--bs-dark);
}
```

---

## 🗑️ Step 3: Delete Confirmation Modal

Create file: `frontend/project-tracker/src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`

```typescript
import { Component, output, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Reusable confirmation dialog component
/// </summary>
@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  // Inputs
  readonly show = input.required<boolean>();
  readonly title = input<string>('Confirm');
  readonly message = input<string>('Are you sure?');
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly confirmButtonClass = input<string>('btn-danger');
  readonly loading = input<boolean>(false);

  // Outputs
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  /// <summary>
  /// Confirm action
  /// </summary>
  confirm(): void {
    if (!this.loading()) {
      this.confirmed.emit();
    }
  }

  /// <summary>
  /// Cancel action
  /// </summary>
  cancel(): void {
    if (!this.loading()) {
      this.cancelled.emit();
    }
  }
}
```

Create file: `frontend/project-tracker/src/app/shared/components/confirm-dialog/confirm-dialog.component.html`

```html
@if (show()) {
  <!-- Modal Backdrop -->
  <div class="modal-backdrop fade show"></div>

  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-exclamation-triangle text-warning me-2"></i>
            {{ title() }}
          </h5>
          @if (!loading()) {
            <button
              type="button"
              class="btn-close"
              (click)="cancel()"
              [attr.aria-label]="'common.close' | translate">
            </button>
          }
        </div>

        <!-- Body -->
        <div class="modal-body">
          <p class="mb-0">{{ message() }}</p>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            (click)="cancel()"
            [disabled]="loading()">
            {{ cancelText() }}
          </button>
          <button
            type="button"
            [class]="'btn ' + confirmButtonClass()"
            (click)="confirm()"
            [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ 'common.processing' | translate }}
            } @else {
              {{ confirmText() }}
            }
          </button>
        </div>
      </div>
    </div>
  </div>
}
```

Create file: `frontend/project-tracker/src/app/shared/components/confirm-dialog/confirm-dialog.component.css`

```css
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-weight: 600;
}
```

---

## 🔄 Step 4: Update Project List with Delete Modal

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

Add the following to use the confirm dialog:

```typescript
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

export class ProjectListComponent implements OnInit {
  // ... existing code ...

  // Delete confirmation state
  protected readonly showDeleteConfirm = signal(false);
  protected readonly projectToDelete = signal<Project | null>(null);
  protected readonly deleting = signal(false);

  /// <summary>
  /// Show delete confirmation
  /// </summary>
  deleteProject(project: Project): void {
    this.projectToDelete.set(project);
    this.showDeleteConfirm.set(true);
  }

  /// <summary>
  /// Confirm delete
  /// </summary>
  confirmDelete(): void {
    const project = this.projectToDelete();
    if (!project) return;

    this.deleting.set(true);
    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.notificationService.success(
          'Success',
          `Project "${project.title}" deleted successfully`
        );
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.projectToDelete.set(null);
        this.loadProjects();
      },
      error: (error) => {
        console.error('Delete failed:', error);
        this.notificationService.error(
          'Error',
          'Failed to delete project'
        );
        this.deleting.set(false);
      }
    });
  }

  /// <summary>
  /// Cancel delete
  /// </summary>
  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.projectToDelete.set(null);
  }
}
```

Update the component imports:

```typescript
imports: [
  CommonModule, 
  ProjectFiltersComponent, 
  ProjectTableComponent, 
  PaginationComponent,
  ConfirmDialogComponent,
  TranslatePipe
],
```

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.html`

Add the confirm dialog at the end:

```html
<!-- ... existing template ... -->

<!-- Delete Confirmation Modal -->
<app-confirm-dialog
  [show]="showDeleteConfirm()"
  [title]="'common.confirmDelete' | translate"
  [message]="'Are you sure you want to delete project: ' + projectToDelete()?.title + '?'"
  [confirmText]="'common.delete' | translate"
  [cancelText]="'common.cancel' | translate"
  confirmButtonClass="btn-danger"
  [loading]="deleting()"
  (confirmed)="confirmDelete()"
  (cancelled)="cancelDelete()">
</app-confirm-dialog>
```

---

## 🛣️ Step 5: Update Routes

Update your routing module to include the form routes:

```typescript
// In app.routes.ts or projects.routes.ts
{
  path: 'projects',
  children: [
    {
      path: '',
      component: ProjectListComponent
    },
    {
      path: 'create',
      component: ProjectFormComponent
    },
    {
      path: ':id/edit',
      component: ProjectFormComponent
    },
    {
      path: ':id',
      component: ProjectDetailComponent // Optional: view-only detail page
    }
  ]
}
```

---

## ✅ Summary

### **What We Built:**

1. ✅ **Toast Notification Service**
   - NotificationService with success/error/warning/info methods
   - ToastContainerComponent with auto-dismiss
   - Signal-based state management
   - Customizable duration

2. ✅ **Project Form Component**
   - Single component for create/edit (isEditMode signal)
   - Reactive forms with validators
   - Real-time validation feedback
   - Character counter for description
   - Loading states during save
   - Unsaved changes warning

3. ✅ **Delete Confirmation Modal**
   - Reusable ConfirmDialogComponent
   - Loading state during delete
   - Customizable text and buttons
   - Modal backdrop

4. ✅ **Integrated CRUD Operations**
   - Create new projects
   - Edit existing projects
   - Delete with confirmation
   - Success/error notifications
   - Proper error handling

### **Validation Features:**
- ✅ Required fields validation
- ✅ Min/max length validation
- ✅ Min/max value validation
- ✅ Show errors only when touched/dirty
- ✅ Mark all as touched on submit
- ✅ Disable submit when invalid

### **Best Practices Applied:**
- ✅ Single form component for create/edit
- ✅ Signal-based state management
- ✅ FormBuilder for type safety
- ✅ Reactive forms over template-driven
- ✅ Reusable modal component
- ✅ Toast notifications instead of alerts
- ✅ Loading states for async operations
- ✅ Confirmation before destructive actions
- ✅ OnPush change detection

### **Production Enhancements (Optional):**
- Add async validators (e.g., unique title check)
- Implement form autosave
- Add custom date range validator (start before due)
- Use NgRx for global state
- Add form dirty check with CanDeactivate guard
- Implement optimistic UI updates

---

**Next: [Module 12: Bootstrap UI & Styling](./12_bootstrap_ui.md)**
