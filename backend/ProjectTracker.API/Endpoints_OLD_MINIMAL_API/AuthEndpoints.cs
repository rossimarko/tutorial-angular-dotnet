using Microsoft.AspNetCore.Authorization;
using ProjectTracker.API.Authentication;
using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Requests;
using ProjectTracker.API.Models.Responses;
using System.Security.Claims;

namespace ProjectTracker.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var authGroup = app.MapGroup("/api/auth")
            .WithTags("Authentication")
            .WithOpenApi();

        authGroup.MapPost("/register", Register)
            .WithSummary("Register a new user")
            .WithDescription("Creates a new user account with email and password");

        authGroup.MapPost("/login", Login)
            .WithSummary("User login")
            .WithDescription("Authenticates user and returns JWT tokens");

        authGroup.MapPost("/refresh", RefreshToken)
            .WithSummary("Refresh access token")
            .WithDescription("Generates new access token using refresh token");

        authGroup.MapPost("/logout", Logout)
            .RequireAuthorization()
            .WithSummary("User logout")
            .WithDescription("Revokes all refresh tokens for the user");

        authGroup.MapGet("/me", GetCurrentUser)
            .RequireAuthorization()
            .WithSummary("Get current user")
            .WithDescription("Returns current authenticated user information");
    }

    private static async Task<IResult> Register(
        RegisterRequest request,
        IAuthService authService)
    {
        var result = await authService.RegisterAsync(request);

        return result.IsSuccess
            ? Results.Created("/api/auth/me", ApiResponse<UserResponse>.Ok(result.Data))
            : Results.BadRequest(ApiResponse<UserResponse>.Fail(result.ErrorMessage ?? "Registration failed"));
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        IAuthService authService)
    {
        // Convert custom LoginRequest to Microsoft.AspNetCore.Identity.Data.LoginRequest
        var identityLoginRequest = new Microsoft.AspNetCore.Identity.Data.LoginRequest
        {
            Email = request.Email,
            Password = request.Password
        };
        
        var result = await authService.LoginAsync(identityLoginRequest);

        return result.IsSuccess
            ? Results.Ok(ApiResponse<TokenResponse>.Ok(result.Data))
            : Results.BadRequest(ApiResponse<TokenResponse>.Fail(result.ErrorMessage ?? "Login failed"));
    }

    private static async Task<IResult> RefreshToken(
        RefreshTokenRequest request,
        IAuthService authService)
    {
        var result = await authService.RefreshTokenAsync(request.RefreshToken);

        return result.IsSuccess
            ? Results.Ok(ApiResponse<TokenResponse>.Ok(result.Data))
            : Results.BadRequest(ApiResponse<TokenResponse>.Fail(result.ErrorMessage ?? "Token refresh failed"));
    }

    private static async Task<IResult> Logout(
        ClaimsPrincipal user,
        IAuthService authService)
    {
        var userIdClaim = user.FindFirst("userId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var result = await authService.LogoutAsync(userId);

        return result.IsSuccess
            ? Results.Ok(ApiResponse<bool>.Ok(true, "Logged out successfully"))
            : Results.BadRequest(ApiResponse<bool>.Fail(result.ErrorMessage ?? "Logout failed"));
    }

    private static async Task<IResult> GetCurrentUser(
        ClaimsPrincipal user,
        IAuthService authService)
    {
        var currentUser = await authService.GetCurrentUserAsync(user);
        if (currentUser is null)
        {
            return Results.Unauthorized();
        }

        var userResponse = new UserResponse
        {
            Id = currentUser.Id,
            Email = currentUser.Email,
            FirstName = currentUser.FirstName,
            LastName = currentUser.LastName,
            FullName = currentUser.FullName,
            IsActive = currentUser.IsActive,
            CreatedAt = currentUser.CreatedAt
        };

        return Results.Ok(ApiResponse<UserResponse>.Ok(userResponse));
    }
}
