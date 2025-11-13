namespace ProjectTracker.API.Models.Dtos.Translations;

/// <summary>
/// Response model for culture information
/// </summary>
public class CultureResponse
{
    /// <summary>
    /// Culture code (e.g., 'en-US')
    /// </summary>
    public required string Code { get; set; }

    /// <summary>
    /// Culture display name
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Indicates if this is the default culture
    /// </summary>
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
