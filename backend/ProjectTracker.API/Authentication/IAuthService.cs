using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Requests;
using ProjectTracker.API.Models.Responses;
using ProjectTracker.API.Models.Common;
using System.Security.Claims;

namespace ProjectTracker.API.Authentication;

public interface IAuthService
{
    Task<AuthResult<UserResponse>> RegisterAsync(ProjectTracker.API.Models.Requests.RegisterRequest request);
    Task<AuthResult<TokenResponse>> LoginAsync(Microsoft.AspNetCore.Identity.Data.LoginRequest request);
    Task<AuthResult<TokenResponse>> RefreshTokenAsync(string refreshToken);
    Task<AuthResult<bool>> LogoutAsync(int userId);
    Task<User?> GetCurrentUserAsync(ClaimsPrincipal principal);
}
