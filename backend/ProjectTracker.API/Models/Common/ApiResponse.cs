namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Standard API response wrapper for all successful responses
/// </summary>
public class ApiResponse<T>
{
    /// <summary>
    /// Whether the operation was successful
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// The actual response data
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Success message
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Any validation or business errors
    /// </summary>
    public ErrorDetail[]? Errors { get; set; }

    /// <summary>
    /// Create a successful response
    /// </summary>
    public static ApiResponse<T> Ok(T? data = default, string? message = null)
        => new() { Success = true, Data = data, Message = message };

    /// <summary>
    /// Create a failed response
    /// </summary>
    public static ApiResponse<T> Fail(string message, ErrorDetail[]? errors = null)
        => new() { Success = false, Message = message, Errors = errors };
}

/// <summary>
/// Standard API error response
/// </summary>
public class ApiErrorResponse
{
    public bool Success { get; set; } = false;
    public object? Data { get; set; }
    public string Message { get; set; } = String.Empty;
    public ErrorDetail[]? Errors { get; set; }
}

/// <summary>
/// Individual error detail
/// </summary>
public class ErrorDetail
{
    /// <summary>
    /// Field that caused the error (optional)
    /// </summary>
    public string? Field { get; set; }

    /// <summary>
    /// Error message
    /// </summary>
    public required string Message { get; set; }
}