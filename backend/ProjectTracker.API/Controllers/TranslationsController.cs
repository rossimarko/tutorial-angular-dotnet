using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectTracker.API.Data.Repositories;
using ProjectTracker.API.Models.Responses;

namespace ProjectTracker.API.Controllers;

/// <summary>
/// API controller for managing translations and cultures
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class TranslationsController(
    ITranslationRepository translationRepository,
    ILogger<TranslationsController> logger) : ControllerBase
{
    private readonly ITranslationRepository _translationRepository = translationRepository;
    private readonly ILogger<TranslationsController> _logger = logger;

    /// <summary>
    /// Get all available cultures/languages
    /// </summary>
    /// <returns>List of available cultures</returns>
    [HttpGet("cultures")]
    [ProducesResponseType(typeof(IEnumerable<CultureResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CultureResponse>>> GetCultures()
    {
        _logger.LogInformation("Fetching all available cultures");

        var cultures = await _translationRepository.GetCulturesAsync();

        var response = cultures.Select(c => new CultureResponse
        {
            Code = c.Code,
            Name = c.Name,
            IsDefault = c.IsDefault
        });

        return Ok(response);
    }

    /// <summary>
    /// Get all translations for a specific culture
    /// Returns translations organized in nested objects by category
    /// </summary>
    /// <param name="culture">Culture code (e.g., 'en-US', 'it-IT')</param>
    /// <returns>All translations for the specified culture</returns>
    [HttpGet("{culture}")]
    [ProducesResponseType(typeof(TranslationsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ResponseCache(Duration = 60)]
    public async Task<ActionResult<TranslationsResponse>> GetTranslations(string culture)
    {
        _logger.LogInformation("Fetching translations for culture: {Culture}", culture);

        var translations = await _translationRepository.GetTranslationsAsync(culture);

        if (translations.Count == 0)
        {
            _logger.LogWarning("No translations found for culture: {Culture}", culture);
            return NotFound(new { message = $"No translations found for culture: {culture}" });
        }

        var response = new TranslationsResponse
        {
            Culture = culture,
            Translations = translations
        };

        return Ok(response);
    }

    /// <summary>
    /// Get translations for a specific category (lazy loading support)
    /// </summary>
    /// <param name="culture">Culture code</param>
    /// <param name="category">Category name (e.g., 'common', 'auth', 'projects')</param>
    /// <returns>Translations for the specified category</returns>
    [HttpGet("{culture}/category/{category}")]
    [ProducesResponseType(typeof(Dictionary<string, object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Dictionary<string, object>>> GetTranslationsByCategory(
        string culture,
        string category)
    {
        _logger.LogInformation(
            "Fetching {Category} translations for culture: {Culture}",
            category,
            culture);

        var translations = await _translationRepository.GetTranslationsByCategoryAsync(
            culture,
            category);

        if (translations.Count == 0)
        {
            _logger.LogWarning(
                "No {Category} translations found for culture: {Culture}",
                category,
                culture);
            return NotFound(new
            {
                message = $"No translations found for category '{category}' in culture: {culture}"
            });
        }

        return Ok(translations);
    }
}
