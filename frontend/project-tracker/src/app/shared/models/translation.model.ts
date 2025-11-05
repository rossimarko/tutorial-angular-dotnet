/// <summary>
/// Represents an available culture/language
/// </summary>
export interface Culture {
  code: string;
  name: string;
  isDefault: boolean;
}

/// <summary>
/// Response from translations API
/// </summary>
export interface TranslationsResponse {
  culture: string;
  translations: Record<string, any>;
}

/// <summary>
/// Translation interpolation parameters
/// Example: translate('validation.minLength', { min: 5 })
/// </summary>
export type TranslationParams = Record<string, string | number>;