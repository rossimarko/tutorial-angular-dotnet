import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authHttpInterceptor } from './core/interceptors/auth.http-interceptor';
import { TranslationService } from './shared/services/translation.service';

console.debug('App Config: Initializing application config...');

/// <summary>
/// Factory function to initialize translations before app starts
/// </summary>
function initializeTranslations(translationService: TranslationService) {
  return () => translationService.initialize();
}

/// <summary>
/// Factory function to provide current locale dynamically for date/number formatting
/// </summary>
function localeIdFactory(translationService: TranslationService): string {
  return translationService.currentLanguage();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslationService],
      multi: true
    },
    {
      provide: LOCALE_ID,
      useFactory: localeIdFactory,
      deps: [TranslationService]
    }
  ]
};

console.debug('App Config: HTTP interceptor configured with withInterceptors');
