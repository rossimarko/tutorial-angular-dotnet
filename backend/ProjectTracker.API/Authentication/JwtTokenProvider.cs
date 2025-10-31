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
