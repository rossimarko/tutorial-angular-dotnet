namespace ProjectTracker.API.Models.Responses;

public class TokenResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }
}
