using System.Security.Claims;
using Microsoft.AspNetCore.Identity.Data;
using ProjectTracker.API.Configuration;
using ProjectTracker.API.Data.Repositories;
using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Dtos.Auth;

// Alias to avoid ambiguity with Microsoft.AspNetCore.Identity.Data.LoginRequest
using DtoLoginRequest = ProjectTracker.API.Models.Dtos.Auth.LoginRequest;
using DtoRegisterRequest = ProjectTracker.API.Models.Dtos.Auth.RegisterRequest;

namespace ProjectTracker.API.Authentication;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenProvider _tokenProvider;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenProvider tokenProvider,
        JwtOptions jwtOptions,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
        _jwtOptions = jwtOptions;
        _logger = logger;
    }

    public async Task<AuthResult<UserResponse>> RegisterAsync(DtoRegisterRequest request)
    {
        try
        {
            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser is not null)
            {
                return AuthResult<UserResponse>.Failure("User with this email already exists");
            }

            // Create new user
            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var userId = await _userRepository.CreateAsync(user);
            
            // Retrieve the created user
            var createdUser = await _userRepository.GetByIdAsync(userId);
            if (createdUser is null)
            {
                return AuthResult<UserResponse>.Failure("Failed to retrieve created user");
            }

            var userResponse = new UserResponse
            {
                Id = createdUser.Id,
                Email = createdUser.Email,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName,
                FullName = createdUser.FullName,
                IsActive = createdUser.IsActive,
                CreatedAt = createdUser.CreatedAt
            };

            _logger.LogInformation("User registered successfully: {Email}", request.Email);
            return AuthResult<UserResponse>.Success(userResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration for email: {Email}", request.Email);
            return AuthResult<UserResponse>.Failure("Registration failed");
        }
    }

    public async Task<AuthResult<TokenResponse>> LoginAsync(DtoLoginRequest request)
    {
        try
        {
            // Find user by email
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user is null)
            {
                return AuthResult<TokenResponse>.Failure("Invalid email or password");
            }

            // Verify password
            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return AuthResult<TokenResponse>.Failure("Invalid email or password");
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return AuthResult<TokenResponse>.Failure("Account is deactivated");
            }

            // Generate tokens
            var tokenResponse = _tokenProvider.GenerateTokens(user);

            // Store refresh token in database
            var refreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = tokenResponse.RefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays),
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.SaveRefreshTokenAsync(refreshToken);

            _logger.LogInformation("User logged in successfully: {Email}", request.Email);
            return AuthResult<TokenResponse>.Success(tokenResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return AuthResult<TokenResponse>.Failure("Login failed");
        }
    }

    public async Task<AuthResult<TokenResponse>> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            // Find refresh token in database
            var storedToken = await _userRepository.GetRefreshTokenAsync(refreshToken);
            if (storedToken is null || !storedToken.IsValid)
            {
                return AuthResult<TokenResponse>.Failure("Invalid refresh token");
            }

            // Get user
            var user = await _userRepository.GetByIdAsync(storedToken.UserId);
            if (user is null || !user.IsActive)
            {
                return AuthResult<TokenResponse>.Failure("User not found or inactive");
            }

            // Generate new tokens
            var newTokenResponse = _tokenProvider.GenerateTokens(user);

            // Revoke old refresh token and create new one
            await _userRepository.RevokeRefreshTokenAsync(refreshToken);

            var newRefreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = newTokenResponse.RefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays),
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.SaveRefreshTokenAsync(newRefreshToken);

            _logger.LogInformation("Token refreshed for user: {UserId}", user.Id);
            return AuthResult<TokenResponse>.Success(newTokenResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return AuthResult<TokenResponse>.Failure("Token refresh failed");
        }
    }

    public async Task<AuthResult<bool>> LogoutAsync(int userId)
    {
        try
        {
            await _userRepository.RevokeAllRefreshTokensAsync(userId);
            _logger.LogInformation("User logged out: {UserId}", userId);
            return AuthResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout for user: {UserId}", userId);
            return AuthResult<bool>.Failure("Logout failed");
        }
    }

    public async Task<User?> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst("userId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return await _userRepository.GetByIdAsync(userId);
    }
}
