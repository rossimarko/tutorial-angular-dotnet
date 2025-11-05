import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Culture, TranslationsResponse, TranslationParams } from '../models/translation.model';

/// <summary>
/// Translation service using Angular signals for reactive state management
/// Loads translations from the backend API and supports lazy loading by category
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/translations`;
  
  // Storage keys
  private readonly STORAGE_KEY_LANG = 'preferred-language';
  private readonly DEFAULT_CULTURE = 'en-US';
  
  // State signals
  private readonly availableCultures = signal<Culture[]>([]);
  private readonly currentCulture = signal<string>(this.getStoredLanguage());
  private readonly translations = signal<Record<string, any>>({});
  private readonly loadedCategories = signal<Set<string>>(new Set());
  private readonly isLoading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);
  
  // Computed values
  readonly cultures = this.availableCultures.asReadonly();
  readonly currentLanguage = this.currentCulture.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly errorMessage = this.error.asReadonly();
  
  /// <summary>
  /// Computed signal that returns the current culture object
  /// </summary>
  readonly currentCultureInfo = computed(() => {
    const code = this.currentCulture();
    return this.availableCultures().find(c => c.code === code);
  });

  constructor() {
    // Effect to persist language preference
    effect(() => {
      const lang = this.currentCulture();
      localStorage.setItem(this.STORAGE_KEY_LANG, lang);
    });
  }

  /// <summary>
  /// Initialize the translation service
  /// Loads available cultures and translations for the current language
  /// </summary>
  async initialize(): Promise<void> {
    await this.loadCultures();
    await this.loadTranslations(this.currentCulture());
  }

  /// <summary>
  /// Load all available cultures from the API
  /// </summary>
  private async loadCultures(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Culture[]>(`${this.apiUrl}/cultures`).pipe(
        tap(cultures => {
          this.availableCultures.set(cultures);
          
          // Set default culture if current is not available
          const currentCode = this.currentCulture();
          const isAvailable = cultures.some(c => c.code === currentCode);
          
          if (!isAvailable) {
            const defaultCulture = cultures.find(c => c.isDefault) || cultures[0];
            if (defaultCulture) {
              this.currentCulture.set(defaultCulture.code);
            }
          }
          resolve();
        }),
        catchError(err => {
          console.error('Failed to load cultures:', err);
          this.error.set('Failed to load available languages');
          reject(err);
          return of([]);
        })
      ).subscribe();
    });
  }

  /// <summary>
  /// Load all translations for a specific culture
  /// </summary>
  private async loadTranslations(cultureCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isLoading.set(true);
      this.error.set(null);

      this.http.get<TranslationsResponse>(`${this.apiUrl}/${cultureCode}`).pipe(
        tap(response => {
          this.translations.set(response.translations);
          this.isLoading.set(false);
          
          // Mark all categories as loaded
          const categories = Object.keys(response.translations);
          this.loadedCategories.set(new Set(categories));
          resolve();
        }),
        catchError(err => {
          console.error('Failed to load translations:', err);
          this.error.set('Failed to load translations');
          this.isLoading.set(false);
          reject(err);
          return of(null);
        })
      ).subscribe();
    });
  }

  /// <summary>
  /// Lazy load translations for a specific category
  /// Useful for loading feature-specific translations on demand
  /// </summary>
  async loadCategory(category: string): Promise<void> {
    // Skip if already loaded
    if (this.loadedCategories().has(category)) {
      return;
    }

    const cultureCode = this.currentCulture();
    
    this.http.get<Record<string, string>>(
      `${this.apiUrl}/${cultureCode}/category/${category}`
    ).pipe(
      tap(categoryTranslations => {
        // Merge category translations into existing translations
        const current = this.translations();
        const updated = {
          ...current,
          [category]: categoryTranslations
        };
        this.translations.set(updated);
        
        // Mark category as loaded
        const loaded = new Set(this.loadedCategories());
        loaded.add(category);
        this.loadedCategories.set(loaded);
      }),
      catchError(err => {
        console.error(`Failed to load ${category} translations:`, err);
        return of({});
      })
    ).subscribe();
  }

  /// <summary>
  /// Change the current language
  /// Reloads all translations for the new language
  /// </summary>
  async setLanguage(cultureCode: string): Promise<void> {
    if (cultureCode === this.currentCulture()) {
      return;
    }

    this.currentCulture.set(cultureCode);
    this.loadedCategories.set(new Set()); // Clear loaded categories
    await this.loadTranslations(cultureCode);
  }

  /// <summary>
  /// Get a translated value by key path
  /// Supports nested keys with dot notation: 'common.save'
  /// Supports interpolation: translate('validation.minLength', { min: 5 })
  /// </summary>
  translate(keyPath: string, params?: TranslationParams): string {
    const value = this.getNestedValue(this.translations(), keyPath);
    
    if (value === null) {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath; // Return key as fallback
    }

    // Handle interpolation
    if (params && typeof value === 'string') {
      return this.interpolate(value, params);
    }

    return value;
  }

  /// <summary>
  /// Get a translated value as a computed signal
  /// Updates automatically when language changes
  /// </summary>
  translateSignal(keyPath: string, params?: TranslationParams) {
    return computed(() => this.translate(keyPath, params));
  }

  /// <summary>
  /// Get value from nested object using dot notation
  /// </summary>
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? null;
  }

  /// <summary>
  /// Interpolate parameters into translation string
  /// Example: "Minimum {{min}} characters" with { min: 5 } => "Minimum 5 characters"
  /// </summary>
  private interpolate(text: string, params: TranslationParams): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return params[key]?.toString() ?? `{{${key}}}`;
    });
  }

  /// <summary>
  /// Get the stored language preference or default
  /// </summary>
  private getStoredLanguage(): string {
    const stored = localStorage.getItem(this.STORAGE_KEY_LANG);
    
    if (stored) {
      return stored;
    }

    // Try to use browser language
    const browserLang = navigator.language;
    
    // Match browser language to available cultures (will be validated on init)
    return browserLang || this.DEFAULT_CULTURE;
  }

  /// <summary>
  /// Check if a translation key exists
  /// </summary>
  hasTranslation(keyPath: string): boolean {
    return this.getNestedValue(this.translations(), keyPath) !== null;
  }

  /// <summary>
  /// Get all translations for a category
  /// </summary>
  getCategoryTranslations(category: string): Record<string, any> {
    return this.translations()[category] || {};
  }
}