import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { LanguageSelectorComponent } from './shared/components/language-selector.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslatePipe, LanguageSelectorComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly title = signal('project-tracker');
  protected readonly isAuthenticated = this.authService.isAuthenticated$();

  /// <summary>
  /// Handle logout action
  /// </summary>
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
