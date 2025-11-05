namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Represents a supported culture/language in the system
/// </summary>
public class Culture
{
    /// <summary>
    /// Culture code (e.g., 'en-US', 'it-IT')
    /// </summary>
    public required string Code { get; set; }

    /// <summary>
    /// Display name of the culture (e.g., 'English', 'Italiano')
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Indicates if this is the default culture
    /// </summary>
    public bool IsDefault { get; set; }
}
