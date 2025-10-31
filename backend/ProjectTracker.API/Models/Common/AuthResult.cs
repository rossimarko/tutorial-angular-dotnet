namespace ProjectTracker.API.Models.Common;

public class AuthResult<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> Errors { get; set; } = new();

    public static AuthResult<T> Success(T data) => new()
    {
        IsSuccess = true,
        Data = data
    };

    public static AuthResult<T> Failure(string errorMessage) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage,
        Errors = [errorMessage]
    };

    public static AuthResult<T> Failure(List<string> errors) => new()
    {
        IsSuccess = false,
        Errors = errors,
        ErrorMessage = string.Join(", ", errors)
    };
}
