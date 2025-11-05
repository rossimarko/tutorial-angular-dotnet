import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authHttpInterceptor } from '../shared/services/auth.http-interceptor';
import { TranslationService } from '../shared/services/translation.service';

console.debug('App Config: Initializing application config...');

/// <summary>
/// Factory function to initialize translations before app starts
/// </summary>
function initializeTranslations(translationService: TranslationService) {
  return () => translationService.initialize();
}

/// <summary>
/// Factory function to provide current locale dynamically
/// </summary>
function localeIdFactory(translationService: TranslationService) {
  return () => translationService.currentLanguage();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptor]))
  ]
};

console.debug('App Config: HTTP interceptor configured with withInterceptors');
