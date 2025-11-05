using ProjectTracker.API.Models.Common;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Repository interface for translation operations
/// </summary>
public interface ITranslationRepository
{
    /// <summary>
    /// Get all supported cultures
    /// </summary>
    Task<IEnumerable<Culture>> GetCulturesAsync();

    /// <summary>
    /// Get all translations for a specific culture
    /// </summary>
    /// <param name="cultureCode">Culture code (e.g., 'en-US')</param>
    /// <returns>Dictionary of translation key paths to values</returns>
    Task<Dictionary<string, object>> GetTranslationsAsync(string cultureCode);

    /// <summary>
    /// Get translations for a specific category and culture
    /// </summary>
    Task<Dictionary<string, object>> GetTranslationsByCategoryAsync(
        string cultureCode,
        string category);
}
