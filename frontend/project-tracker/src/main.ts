import '@angular/localize/init';
import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeIt from '@angular/common/locales/it';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { TranslationService } from './app/shared/services/translation.service';

// Register locale data for formatting
registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeIt, 'it-IT');

// Initialize the app
(async () => {
  try {
    // Create the injector by bootstrapping without rendering yet
    const appRef = await bootstrapApplication(App, appConfig);
    
    // Get the translation service from the injector
    const translationService = appRef.injector.get(TranslationService);
    
    // Initialize translations
    await translationService.initialize();
  } catch (err) {
    console.error('Failed to initialize app:', err);
  }
})();
