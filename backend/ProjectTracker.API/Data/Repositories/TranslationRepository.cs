using System.Text.Json;
using ProjectTracker.API.Models.Common;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Repository for translation data access from JSON files
/// </summary>
public class TranslationRepository(IWebHostEnvironment environment, ILogger<TranslationRepository> logger)
    : ITranslationRepository
{
    private readonly IWebHostEnvironment _environment = environment;
    private readonly ILogger<TranslationRepository> _logger = logger;
    private readonly string _translationsPath = Path.Combine(
        environment.ContentRootPath,
        "Resources",
        "Translations");

    /// <summary>
    /// Get all supported cultures from cultures.json
    /// </summary>
    public async Task<IEnumerable<Culture>> GetCulturesAsync()
    {
        try
        {
            var culturesFilePath = Path.Combine(_translationsPath, "cultures.json");

            if (!File.Exists(culturesFilePath))
            {
                _logger.LogWarning("Cultures file not found at {Path}", culturesFilePath);
                return Enumerable.Empty<Culture>();
            }

            var json = await File.ReadAllTextAsync(culturesFilePath);
            var cultures = JsonSerializer.Deserialize<List<Culture>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return cultures ?? Enumerable.Empty<Culture>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading cultures file");
            throw;
        }
    }

    /// <summary>
    /// Get all translations for a specific culture from {culture}.json file
    /// Returns the full translation object structure
    /// </summary>
    public async Task<Dictionary<string, object>> GetTranslationsAsync(string cultureCode)
    {
        try
        {
            var translationFilePath = Path.Combine(_translationsPath, $"{cultureCode}.json");

            if (!File.Exists(translationFilePath))
            {
                _logger.LogWarning("Translation file not found for culture {Culture} at {Path}",
                    cultureCode, translationFilePath);
                return new Dictionary<string, object>();
            }

            var json = await File.ReadAllTextAsync(translationFilePath);
            var translations = JsonSerializer.Deserialize<Dictionary<string, object>>(json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            return translations ?? new Dictionary<string, object>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading translation file for culture {Culture}", cultureCode);
            throw;
        }
    }

    /// <summary>
    /// Get translations for a specific category (e.g., 'common', 'auth')
    /// Useful for lazy loading translations by feature
    /// </summary>
    public async Task<Dictionary<string, object>> GetTranslationsByCategoryAsync(
        string cultureCode,
        string category)
    {
        try
        {
            var allTranslations = await GetTranslationsAsync(cultureCode);

            // Extract the specific category from the translations
            if (allTranslations.TryGetValue(category, out var categoryTranslations))
            {
                // If it's a JsonElement, convert it to Dictionary
                if (categoryTranslations is JsonElement jsonElement)
                {
                    var categoryDict = JsonSerializer.Deserialize<Dictionary<string, object>>(
                        jsonElement.GetRawText(),
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                    return new Dictionary<string, object>
                    {
                        { category, categoryDict ?? new Dictionary<string, object>() }
                    };
                }

                return new Dictionary<string, object>
                {
                    { category, categoryTranslations }
                };
            }

            _logger.LogWarning("Category {Category} not found for culture {Culture}",
                category, cultureCode);
            return new Dictionary<string, object>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading category {Category} for culture {Culture}",
                category, cultureCode);
            throw;
        }
    }
}
