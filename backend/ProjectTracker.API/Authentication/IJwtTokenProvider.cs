using System.Security.Claims;
using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Dtos.Auth;

namespace ProjectTracker.API.Authentication;

public interface IJwtTokenProvider
{
    TokenResponse GenerateTokens(User user);
    ClaimsPrincipal? GetClaimsFromToken(string token);
    bool ValidateToken(string token);
    string GenerateRefreshToken();
}
