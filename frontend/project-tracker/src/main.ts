import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeIt from '@angular/common/locales/it';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Register locale data for formatting
registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeIt, 'it-IT');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
