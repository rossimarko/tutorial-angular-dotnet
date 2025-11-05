import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { TranslationParams } from '../models/translation.model';
import { effect } from '@angular/core';

/// <summary>
/// Pipe for translating text in templates
/// Usage: {{ 'common.save' | translate }}
/// With params: {{ 'validation.minLength' | translate:{ min: 5 } }}
/// </summary>
@Pipe({
  name: 'translate',
  pure: false // Re-evaluate when language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly effectRef;

  constructor() {
    // Track language changes and trigger change detection
    this.effectRef = effect(() => {
      // Access current language to create dependency
      this.translationService.currentLanguage();
      // Mark for check when language changes
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.effectRef.destroy();
  }

  transform(key: string, params?: TranslationParams): string {
    return this.translationService.translate(key, params);
  }
}