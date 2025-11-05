namespace ProjectTracker.API.Models.Responses;

/// <summary>
/// Response model for culture information
/// </summary>
public class CultureResponse
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public bool IsDefault { get; set; }
}

/// <summary>
/// Response model containing all translations for a specific culture
/// </summary>
public class TranslationsResponse
{
    /// <summary>
    /// Culture code (e.g., 'en-US')
    /// </summary>
    public required string Culture { get; set; }

    /// <summary>
    /// Dictionary of translation key paths to values
    /// Organized as nested objects: { "common": { "save": "Save" } }
    /// </summary>
    public required Dictionary<string, object> Translations { get; set; }
}
