import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { SkipLinkDirective } from './shared/directives/skip-link.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, ToastContainerComponent, NavbarComponent, SkipLinkDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
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
