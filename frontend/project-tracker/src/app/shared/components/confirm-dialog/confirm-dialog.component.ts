import { Component, output, input, ChangeDetectionStrategy } from '@angular/core';


/// <summary>
/// Reusable confirmation dialog component
/// Uses signal inputs/outputs for flexible composition
/// </summary>
@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
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
