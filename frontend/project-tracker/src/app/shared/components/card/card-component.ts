import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/// <summary>
/// Reusable card component wrapper
/// Uses Bootstrap's card classes with customizable slots
/// </summary>
@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly headerClass = input<string>('');
  readonly bodyClass = input<string>('');
  readonly shadow = input<boolean>(true);
  readonly border = input<boolean>(true);
}