using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectTracker.API.Authentication;
using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Dtos.Auth;

namespace ProjectTracker.API.Controllers;

/// <summary>
/// Authentication endpoints for user registration, login, and token management
/// This follows the standard ASP.NET Core controller pattern - familiar to .NET Framework developers
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    /// <summary>
    /// Constructor with dependency injection
    /// Same pattern as .NET Framework WebAPI with Unity/Ninject
    /// </summary>
    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user account
    /// POST: api/auth/register
    /// </summary>
    /// <param name="request">Registration details (email, password, first name, last name)</param>
    /// <returns>Created user information</returns>
    /// <response code="201">User successfully registered</response>
    /// <response code="400">Invalid request or user already exists</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Register([FromBody] RegisterRequest request)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);
        
        var result = await _authService.RegisterAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Registration failed for email: {Email}. Reason: {Error}", 
                request.Email, result.ErrorMessage);
            
            return BadRequest(ApiResponse<UserResponse>.Fail(
                result.ErrorMessage ?? "Registration failed"));
        }

        _logger.LogInformation("User registered successfully: {Email}", request.Email);

        // Return 201 Created with location header pointing to user info endpoint
        return CreatedAtAction(
            nameof(GetCurrentUser),
            ApiResponse<UserResponse>.Ok(result.Data));
    }

    /// <summary>
    /// User login - authenticates credentials and returns JWT tokens
    /// POST: api/auth/login
    /// </summary>
    /// <param name="request">Login credentials (email and password)</param>
    /// <returns>Access token and refresh token for authenticated sessions</returns>
    /// <response code="200">Login successful, returns tokens</response>
    /// <response code="400">Invalid credentials or account inactive</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> Login([FromBody] LoginRequest request)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);
        
        var result = await _authService.LoginAsync(request);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
            return BadRequest(ApiResponse<TokenResponse>.Fail(
                result.ErrorMessage ?? "Login failed"));
        }

        _logger.LogInformation("User logged in successfully: {Email}", request.Email);
        return Ok(ApiResponse<TokenResponse>.Ok(result.Data));
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// POST: api/auth/refresh
    /// </summary>
    /// <param name="request">Valid refresh token</param>
    /// <returns>New access token and refresh token</returns>
    /// <response code="200">Token refreshed successfully</response>
    /// <response code="400">Invalid or expired refresh token</response>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> RefreshToken(
        [FromBody] RefreshTokenRequest request)
    {
        _logger.LogInformation("Token refresh attempt");
        
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Token refresh failed");
            return BadRequest(ApiResponse<TokenResponse>.Fail(
                result.ErrorMessage ?? "Token refresh failed"));
        }

        _logger.LogInformation("Token refreshed successfully");
        return Ok(ApiResponse<TokenResponse>.Ok(result.Data));
    }

    /// <summary>
    /// Logout current user - revokes all refresh tokens
    /// POST: api/auth/logout
    /// Requires valid JWT token in Authorization header
    /// </summary>
    /// <returns>Success status</returns>
    /// <response code="200">Logout successful</response>
    /// <response code="401">Not authenticated or invalid token</response>
    [HttpPost("logout")]
    [Authorize]  // Same as .NET Framework - requires authentication
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<bool>>> Logout()
    {
        // Extract user ID from JWT claims
        // User.FindFirst is the same as ClaimsPrincipal.Current in .NET Framework
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Logout attempt with invalid user ID claim");
            return Unauthorized();
        }

        _logger.LogInformation("Logout attempt for user ID: {UserId}", userId);
        
        var result = await _authService.LogoutAsync(userId);

        if (!result.IsSuccess)
        {
            _logger.LogError("Logout failed for user ID: {UserId}", userId);
            return BadRequest(ApiResponse<bool>.Fail(
                result.ErrorMessage ?? "Logout failed"));
        }

        _logger.LogInformation("User logged out successfully: {UserId}", userId);
        return Ok(ApiResponse<bool>.Ok(true, "Logged out successfully"));
    }

    /// <summary>
    /// Get current authenticated user information
    /// GET: api/auth/me
    /// Requires valid JWT token in Authorization header
    /// </summary>
    /// <returns>Current user details</returns>
    /// <response code="200">User information retrieved</response>
    /// <response code="401">Not authenticated or invalid token</response>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> GetCurrentUser()
    {
        var currentUser = await _authService.GetCurrentUserAsync(User);
        if (currentUser is null)
        {
            _logger.LogWarning("GetCurrentUser called but user not found");
            return Unauthorized();
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

        return Ok(ApiResponse<UserResponse>.Ok(userResponse));
    }
}
