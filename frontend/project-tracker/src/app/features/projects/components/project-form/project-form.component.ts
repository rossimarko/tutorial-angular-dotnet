import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { CreateProjectRequest, UpdateProjectRequest } from '../../../../shared/models/project.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  TextInput,
  TextareaInput,
  DropdownInput,
  IntegerInput,
  DateInput
} from '../../../../shared/components';

/// <summary>
/// Form component for creating and editing projects
/// Uses same component for both create and edit modes
/// </summary>
@Component({
  selector: 'app-project-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    TextInput,
    TextareaInput,
    DropdownInput,
    IntegerInput,
    DateInput
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals for component state
  protected readonly isEditMode = signal(false);
  protected readonly loading = signal(false);
  protected readonly projectId = signal<number | null>(null);

  // Form
  protected readonly form: FormGroup;

  // Status options
  protected readonly statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Completed', label: 'Completed' },
    { value: 'OnHold', label: 'On Hold' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];
  protected readonly descriptionMaxLength = 1000;

  constructor() {
    // Initialize form with validators
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
    this.projectService.getProject(id).subscribe({
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
          this.translationService.translate('common.error'),
          this.translationService.translate('projects.loadError')
        );
        this.loading.set(false);
        this.router.navigate(['/projects']);
      }
    });
  }

  /// <summary>
  /// Format date for HTML input (YYYY-MM-DD)
  /// </summary>
  private formatDateForInput(date: Date | string | null | undefined): string | null {
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
        this.translationService.translate('validation.error'),
        this.translationService.translate('validation.fixErrors')
      );
      return;
    }

    this.loading.set(true);
    const formValue = this.form.value;

    // Convert date strings to Date objects if needed
    const projectData = {
      title: formValue.title,
      description: formValue.description || null,
      status: formValue.status,
      priority: formValue.priority,
      startDate: formValue.startDate ? new Date(formValue.startDate) : null,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : null
    };

    if (this.isEditMode()) {
      this.projectService.updateProject(this.projectId()!, projectData as UpdateProjectRequest).subscribe({
        next: () => {
          this.notificationService.success(
            this.translationService.translate('common.success'),
            this.translationService.translate('projects.updateSuccess')
          );
          this.loading.set(false);
          this.router.navigate(['/projects']);
        },
        error: (error: any) => {
          console.error('Error updating project:', error);
          this.notificationService.error(
            this.translationService.translate('common.error'),
            this.translationService.translate('projects.updateError')
          );
          this.loading.set(false);
        }
      });
    } else {
      this.projectService.createProject(projectData as CreateProjectRequest).subscribe({
        next: () => {
          this.notificationService.success(
            this.translationService.translate('common.success'),
            this.translationService.translate('projects.createSuccess')
          );
          this.loading.set(false);
          this.router.navigate(['/projects']);
        },
        error: (error: any) => {
          console.error('Error creating project:', error);
          this.notificationService.error(
            this.translationService.translate('common.error'),
            this.translationService.translate('projects.createError')
          );
          this.loading.set(false);
        }
      });
    }
  }

  /// <summary>
  /// Cancel and go back
  /// </summary>
  cancel(): void {
    if (this.form.dirty) {
      if (confirm(this.translationService.translate('projects.unsavedChanges'))) {
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

    return this.translationService.translate('validation.invalidValue');
  }
}
