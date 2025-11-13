using System.Security.Claims;
using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Dtos.Auth;
using ProjectTracker.API.Models.Common;

// Alias to avoid ambiguity with Microsoft.AspNetCore.Identity.Data.LoginRequest
using DtoLoginRequest = ProjectTracker.API.Models.Dtos.Auth.LoginRequest;
using DtoRegisterRequest = ProjectTracker.API.Models.Dtos.Auth.RegisterRequest;

namespace ProjectTracker.API.Authentication;

public interface IAuthService
{
    Task<AuthResult<UserResponse>> RegisterAsync(DtoRegisterRequest request);
    Task<AuthResult<TokenResponse>> LoginAsync(DtoLoginRequest request);
    Task<AuthResult<TokenResponse>> RefreshTokenAsync(string refreshToken);
    Task<AuthResult<bool>> LogoutAsync(int userId);
    Task<User?> GetCurrentUserAsync(ClaimsPrincipal principal);
}
