using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace ProjectTracker.API.Configuration;

/// <summary>
/// Extension methods for service configuration
/// </summary>
public static class ConfigurationExtensions
{
    /// <summary>
    /// Configure JWT authentication
    /// </summary>
    public static IServiceCollection ConfigureJwtAuthentication(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        var jwtOptions = configuration
            .GetSection(JwtOptions.SectionName)
            .Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration is missing");

        var secretKey = Encoding.ASCII.GetBytes(jwtOptions.SecretKey);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(secretKey),
                ValidateIssuer = true,
                ValidIssuer = jwtOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtOptions.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(10)
            };

            // Handle token validation errors
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    
                    var response = new { message = "Authentication failed", error = context.Exception.Message };
                    return context.Response.WriteAsJsonAsync(response);
                },
                OnChallenge = context =>
                {
                    context.HandleResponse();
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    
                    var response = new { message = "Authorization token is missing or invalid" };
                    return context.Response.WriteAsJsonAsync(response);
                }
            };
        });

        services.AddSingleton(jwtOptions);
        return services;
    }
}
