# Module 5: Authentication & Authorization - JWT Tokens

## 🎯 Objectives

By the end of this module, you will:
- ✅ Implement user registration with password hashing
- ✅ Create a secure login endpoint
- ✅ Generate and validate JWT tokens
- ✅ Implement refresh token mechanism
- ✅ Create authorization guards
- ✅ Understand OAuth 2.0 concepts
- ✅ Implement role-based access control (RBAC)

## 📌 Status: Module Framework Ready

This module contains the complete framework for JWT authentication implementation. Follow the patterns established in Modules 3-4 to build:

### Key Components to Implement:

1. **Authentication Service**
   - User registration with validation
   - Password hashing with bcrypt
   - Login verification
   - Token generation

2. **JWT Token Provider**
   - Access token generation (short-lived)
   - Refresh token generation (long-lived)
   - Token validation
   - Claims management

3. **Authorization Endpoints**
   - POST /api/auth/register - Register new user
   - POST /api/auth/login - User login
   - POST /api/auth/refresh - Refresh tokens
   - POST /api/auth/logout - Logout
   - GET /api/auth/me - Get current user

4. **Authorization Guards**
   - Require authentication
   - Check specific roles
   - Policy-based authorization

### File Structure:
```
backend/ProjectTracker.API/
├── Authentication/
│   ├── IAuthService.cs          # Service interface
│   ├── AuthService.cs           # Implementation
│   ├── IJwtTokenProvider.cs     # Token provider interface
│   ├── JwtTokenProvider.cs      # Token generation
│   ├── IPasswordHasher.cs       # Password hasher interface
│   └── PasswordHasher.cs        # Bcrypt hashing
├── Controllers/
│   └── AuthController.cs        # Authentication endpoints (Controller-based API)
├── Models/
│   ├── Requests/
│   │   ├── RegisterRequest.cs
│   │   ├── LoginRequest.cs
│   │   └── RefreshTokenRequest.cs
│   └── Responses/
│       ├── TokenResponse.cs
│       └── UserResponse.cs
└── Configuration/
    └── JwtOptions.cs            # JWT configuration
```

---

## 🚀 Implementation Guide Outline

### Step 1: Password Hashing
- Create `PasswordHasher.cs` with bcrypt integration
- Methods: HashPassword(), VerifyPassword()

### Step 2: JWT Token Provider
- Create `JwtTokenProvider.cs`
- Generate access and refresh tokens
- Include user claims in token

### Step 3: Authentication Service
- Create `IAuthService.cs` interface
- Create `AuthService.cs` with:
  - RegisterAsync()
  - LoginAsync()
  - RefreshTokenAsync()
  - RevokeTokenAsync()

### Step 4: Auth Endpoints
- Create minimal API endpoints
- Register route group `/api/auth`
- Map all authentication endpoints

### Step 5: Authorization
- Add [Authorize] attributes to protected endpoints
- Implement policy-based authorization
- Create custom authorization requirements

---

## 📚 Security Best Practices

✅ **Never store passwords**: Hash them with bcrypt
✅ **Short-lived access tokens**: 15 minutes expiry
✅ **Longer-lived refresh tokens**: 7 days expiry
✅ **HTTPS only**: All auth endpoints require HTTPS
✅ **Secure token storage**: Frontend should use secure httpOnly cookies or secure storage
✅ **CORS validation**: Restrict token access to specific origins
✅ **Rate limiting**: Prevent brute force attacks on login
✅ **Token revocation**: Support logout by revoking refresh tokens

---

## 🔐 Complete API Usage Examples

### Example 1: User Registration

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2025-10-30T12:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Example 2: User Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MTcwMzAwMzYwMH0.xyz...",
    "refreshToken": "rO3vQs+vL8kK2pN5mJ9wE1xR4yT6uI0fG3hJ7bM8cD",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Example 3: Accessing Protected Resource

**Request:**
```http
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MTcwMzAwMzYwMH0.xyz...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Project A",
      "description": "First project"
    }
  ]
}
```

**Error Response (401 - Invalid Token):**
```json
{
  "message": "Authorization token is missing or invalid"
}
```

### Example 4: Refresh Token

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "rO3vQs+vL8kK2pN5mJ9wE1xR4yT6uI0fG3hJ7bM8cD"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MTcwMzAwNDUwMH0.abc...",
    "refreshToken": "aB9eXs+mK7nL3oR6pQ0vS2xT5yU8zV1wJ4cN7dE",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

### Example 5: Get Current User

**Request:**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MTcwMzAwMzYwMH0.xyz...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2025-10-30T12:00:00Z"
  }
}
```

### Example 6: Logout

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MTcwMzAwMzYwMH0.xyz...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": "Logged out successfully"
}
```

---

## 🔑 JWT Token Anatomy

**Example JWT Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MTcwMzAwMzYwMH0.xyz...
```

Decoded into three parts:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**
```json
{
  "sub": "1",
  "email": "john.doe@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "jti": "12345678-1234-1234-1234-123456789012",
  "iat": 1703000000,
  "exp": 1703003600,
  "userId": "1",
  "isActive": "true",
  "iss": "ProjectTrackerAPI",
  "aud": "ProjectTrackerClient"
}
```

**Signature:**
```
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secretKey)
```

```
1. User Registration
   Client → POST /api/auth/register → Backend
   Backend → Validate, Hash Password → Database
   Backend ← User created ← Database
   Client ← Registration success

2. User Login
   Client → POST /api/auth/login → Backend
   Backend → Find user, Verify password ← Database
   Backend → Generate tokens → JWT Provider
   Client ← Access token + Refresh token

3. Subsequent Requests
   Client → GET /api/projects (+ Auth header) → Backend
   Backend → Validate token ← JWT Provider
   Client ← Response if valid, 401 if invalid

4. Token Refresh
   Client → POST /api/auth/refresh → Backend
   Backend → Validate refresh token ← Database
   Backend → Generate new access token → JWT Provider
   Client ← New access token

5. Logout
   Client → POST /api/auth/logout → Backend
   Backend → Revoke refresh token ← Database
   Client ← Logout success
```

---

## 🔑 Implementation Details with Code Examples

### 1. Password Hashing Service

```csharp
// Authentication/IPasswordHasher.cs
namespace ProjectTracker.API.Authentication;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

// Authentication/PasswordHasher.cs
using BC = BCrypt.Net.BCrypt;

namespace ProjectTracker.API.Authentication;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BC.HashPassword(password, BC.GenerateSalt(12));
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BC.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }
}
```

### 2. JWT Token Provider

```csharp
// Authentication/IJwtTokenProvider.cs
using System.Security.Claims;
using ProjectTracker.API.Models.Entities;

namespace ProjectTracker.API.Authentication;

public interface IJwtTokenProvider
{
    TokenResponse GenerateTokens(User user);
    ClaimsPrincipal? GetClaimsFromToken(string token);
    bool ValidateToken(string token);
    string GenerateRefreshToken();
}

// Authentication/JwtTokenProvider.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ProjectTracker.API.Configuration;
using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Responses;

namespace ProjectTracker.API.Authentication;

public class JwtTokenProvider : IJwtTokenProvider
{
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<JwtTokenProvider> _logger;

    public JwtTokenProvider(JwtOptions jwtOptions, ILogger<JwtTokenProvider> logger)
    {
        _jwtOptions = jwtOptions;
        _logger = logger;
    }

    public TokenResponse GenerateTokens(User user)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = _jwtOptions.ExpirationMinutes * 60, // seconds
            TokenType = "Bearer"
        };
    }

    private string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName ?? ""),
            new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, 
                new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                ClaimValueTypes.Integer64),
            new Claim("userId", user.Id.ToString()),
            new Claim("isActive", user.IsActive.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtOptions.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public ClaimsPrincipal? GetClaimsFromToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtOptions.SecretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtOptions.Audience,
                ValidateLifetime = false, // We check this separately
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to validate token");
            return null;
        }
    }

    public bool ValidateToken(string token)
    {
        var claims = GetClaimsFromToken(token);
        return claims is not null;
    }
}
```

### 3. Authentication Service

```csharp
// Authentication/IAuthService.cs
using System.Security.Claims;
using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Requests;
using ProjectTracker.API.Models.Responses;

namespace ProjectTracker.API.Authentication;

public interface IAuthService
{
    Task<AuthResult<UserResponse>> RegisterAsync(RegisterRequest request);
    Task<AuthResult<TokenResponse>> LoginAsync(LoginRequest request);
    Task<AuthResult<TokenResponse>> RefreshTokenAsync(string refreshToken);
    Task<AuthResult<bool>> LogoutAsync(int userId);
    Task<User?> GetCurrentUserAsync(ClaimsPrincipal principal);
}

// Authentication/AuthService.cs
using System.Security.Claims;
using ProjectTracker.API.Data.Repositories;
using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Requests;
using ProjectTracker.API.Models.Responses;

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

    public async Task<AuthResult<UserResponse>> RegisterAsync(RegisterRequest request)
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

            var createdUser = await _userRepository.CreateAsync(user);
            
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

    public async Task<AuthResult<TokenResponse>> LoginAsync(LoginRequest request)
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
```

### 4. Request/Response Models

```csharp
// Models/Requests/RegisterRequest.cs
using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Requests;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

    [Required]
    public required string FirstName { get; set; }

    [Required]
    public required string LastName { get; set; }
}

// Models/Requests/LoginRequest.cs
using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Requests;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
}

// Models/Requests/RefreshTokenRequest.cs
using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Requests;

public class RefreshTokenRequest
{
    [Required]
    public required string RefreshToken { get; set; }
}

// Models/Responses/TokenResponse.cs
namespace ProjectTracker.API.Models.Responses;

public class TokenResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }
}

// Models/Responses/UserResponse.cs
namespace ProjectTracker.API.Models.Responses;

public class UserResponse
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Models/Common/AuthResult.cs
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
```

### 5. Authentication Controller

Now let's create the controller-based API. This will be familiar if you've used .NET Framework WebAPI.

Create folder: `backend/ProjectTracker.API/Controllers`

**File: Controllers/AuthController.cs**

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectTracker.API.Authentication;
using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Requests;
using ProjectTracker.API.Models.Responses;

namespace ProjectTracker.API.Controllers;

/// <summary>
/// Authentication endpoints for user registration, login, and token management
/// This is similar to WebAPI 2 controllers in .NET Framework 4.8
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    // Constructor injection - same as .NET Framework with Unity/Ninject
    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user account
    /// POST: api/auth/register
    /// </summary>
    /// <param name="request">Registration details (email, password, name)</param>
    /// <returns>Created user information</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Register([FromBody] RegisterRequest request)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);
        
        var result = await _authService.RegisterAsync(request);

        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<UserResponse>.Fail(
                result.ErrorMessage ?? "Registration failed"));
        }

        // Return 201 Created with location header pointing to user info endpoint
        return CreatedAtAction(
            nameof(GetCurrentUser),
            ApiResponse<UserResponse>.Ok(result.Data));
    }

    /// <summary>
    /// User login - authenticates and returns JWT tokens
    /// POST: api/auth/login
    /// </summary>
    /// <param name="request">Login credentials (email and password)</param>
    /// <returns>Access and refresh tokens</returns>
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

        return Ok(ApiResponse<TokenResponse>.Ok(result.Data));
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// POST: api/auth/refresh
    /// </summary>
    /// <param name="request">Refresh token</param>
    /// <returns>New access and refresh tokens</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> RefreshToken(
        [FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);

        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<TokenResponse>.Fail(
                result.ErrorMessage ?? "Token refresh failed"));
        }

        return Ok(ApiResponse<TokenResponse>.Ok(result.Data));
    }

    /// <summary>
    /// Logout current user - revokes all refresh tokens
    /// POST: api/auth/logout
    /// </summary>
    /// <returns>Success status</returns>
    [HttpPost("logout")]
    [Authorize]  // Requires valid JWT token - same as .NET Framework [Authorize]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<bool>>> Logout()
    {
        // Extract user ID from JWT claims
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        _logger.LogInformation("Logout for user ID: {UserId}", userId);
        
        var result = await _authService.LogoutAsync(userId);

        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<bool>.Fail(
                result.ErrorMessage ?? "Logout failed"));
        }

        return Ok(ApiResponse<bool>.Ok(true, "Logged out successfully"));
    }

    /// <summary>
    /// Get current authenticated user information
    /// GET: api/auth/me
    /// </summary>
    /// <returns>Current user details</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> GetCurrentUser()
    {
        var currentUser = await _authService.GetCurrentUserAsync(User);
        if (currentUser is null)
        {
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
```

### 🔄 Understanding Controller Attributes (.NET Framework Developers)

| Attribute | Purpose | .NET Framework 4.8 WebAPI Equivalent |
|-----------|---------|--------------------------------------|
| `[ApiController]` | Enables automatic model validation and API-specific behaviors | Same in WebAPI 2 |
| `[Route("api/[controller]")]` | Base route template (becomes "api/auth") | `[RoutePrefix("api/auth")]` |
| `[HttpPost("login")]` | POST endpoint at api/auth/login | `[HttpPost]` + `[Route("login")]` |
| `[Authorize]` | Requires JWT authentication | Same |
| `[FromBody]` | Deserialize from request body | Same |
| `[ProducesResponseType]` | Documents response types (for Swagger) | New - better API docs |
| `ActionResult<T>` | Strongly-typed action result | New - adds type safety |

**What's Better in .NET Core:**
- ✅ Attribute routing is cleaner and built-in
- ✅ `ActionResult<T>` provides better IntelliSense
- ✅ Better integration with Swagger/OpenAPI
- ✅ Automatic model validation with `[ApiController]`

### 6. Service Registration in Program.cs

Add these lines in `Program.cs` in the services section:

```csharp
// ============================================
// 3. AUTHENTICATION SERVICES
// ============================================

// Register authentication services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenProvider, JwtTokenProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();
```

**Note:** You don't need to map endpoints manually - `app.MapControllers()` automatically discovers and maps all controller routes!

---

## 🧪 Testing with Swagger/OpenAPI

Once you implement and register the services, you can test all endpoints directly from Swagger:

1. **Navigate to Swagger UI**: `https://localhost:5000/swagger/index.html`

2. **Test Registration**:
   - Click "POST /api/auth/register"
   - Enter credentials and click "Try it out"

3. **Test Login**:
   - Click "POST /api/auth/login"
   - Use the same credentials from registration
   - Copy the `accessToken` from response

4. **Test Protected Endpoints**:
   - Click the "Authorize" button (top right)
   - Paste: `Bearer <your_access_token>`
   - Now try accessing protected endpoints like GET /api/auth/me

5. **Test Token Refresh**:
   - Click "POST /api/auth/refresh"
   - Paste the `refreshToken` from login response
   - Get new access token

---

## 🛡️ Security Implementation Details

### Password Security
- **Bcrypt Hashing**: Uses cost factor 12 (2^12 iterations)
- **Never Plain Text**: Passwords are hashed immediately and never stored
- **Verification Only**: VerifyPassword safely compares hashes

```csharp
// Example: Password hashing process
string password = "SecurePassword123!";
string hash = _passwordHasher.HashPassword(password);
// hash = "$2a$12$..." (bcrypt format with salt)

// Verification
bool isValid = _passwordHasher.VerifyPassword(password, hash); // true
bool isInvalid = _passwordHasher.VerifyPassword("wrongPassword", hash); // false
```

### Token Security
- **Access Token**: 15 minutes (short-lived)
- **Refresh Token**: 7 days (longer-lived)
- **Token Signing**: HMAC-SHA256 with secret key
- **Token Claims**: User info embedded in token (stateless)

### Refresh Token Rotation
```csharp
// OLD METHOD - Revoke old token on refresh
await _userRepository.RevokeRefreshTokenAsync(oldRefreshToken);

// NEW METHOD - Create new refresh token
var newRefreshToken = new RefreshToken
{
    UserId = user.Id,
    Token = tokenResponse.RefreshToken,
    ExpiresAt = DateTime.UtcNow.AddDays(7),
    CreatedAt = DateTime.UtcNow
};
await _userRepository.SaveRefreshTokenAsync(newRefreshToken);
```

### Claims Structure
The JWT contains these standard claims:
- **sub** (Subject): User ID
- **email**: User email address
- **given_name**: First name
- **family_name**: Last name
- **jti** (JWT ID): Unique token identifier
- **iat** (Issued At): Token creation time
- **exp** (Expiration): Token expiration time
- **iss** (Issuer): "ProjectTrackerAPI"
- **aud** (Audience): "ProjectTrackerClient"

Custom claims:
- **userId**: User database ID
- **isActive**: Account status

---

## 🚀 Frontend Integration (Angular)

Example Angular service for authentication:

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = new BehaviorSubject(null);
  private accessToken = '';

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<any> {
    return this.http.post('/api/auth/register', {
      email, password, firstName, lastName
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login', { email, password });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post('/api/auth/refresh', { refreshToken });
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}).subscribe(() => {
      this.accessToken = '';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private loadToken(): void {
    this.accessToken = localStorage.getItem('accessToken') || '';
  }
}

// Example: Using in component
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  login(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.authService.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
```

---

## ✅ Implementation Checklist

Before moving to Phase 3 (Frontend):

- [ ] PasswordHasher implemented with bcrypt
- [ ] JwtTokenProvider generates tokens correctly
- [ ] AuthService handles registration and login
- [ ] Auth endpoints tested with Swagger
- [ ] Token validation works correctly
- [ ] Refresh token mechanism implemented
- [ ] Logout revokes tokens
- [ ] Protected endpoints require authorization
- [ ] Role-based access control working
- [ ] Error responses consistent

---

## 📝 Next Steps

After implementing this module:

1. **Test** all auth endpoints with Swagger
2. **Verify** tokens are properly validated
3. **Check** refresh token flow works
4. **Move to Module 6** when ready for Frontend

---

## 📚 Related Modules

- **Module 3**: API setup with JWT configuration ✅
- **Module 4**: Database with user storage ✅
- **Module 5**: This module - Authentication ⬅️
- **Module 8**: Frontend authentication UI (coming next)

---

**Full implementation details**: Complete the checklist above following the patterns from Module 4 (Repository pattern) and Module 3 (service registration)

**Next: [Module 6: Angular 20 Setup](./06_angular_setup.md)**
