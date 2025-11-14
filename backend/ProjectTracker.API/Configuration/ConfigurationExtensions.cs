using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Swashbuckle.AspNetCore.SwaggerGen;
using ProjectTracker.API.Authentication;
using ProjectTracker.API.Data;
using ProjectTracker.API.Data.Repositories;

namespace ProjectTracker.API.Configuration;

/// <summary>
/// Extension methods for service configuration and middleware setup.
/// These methods organize the service registration and pipeline configuration for better maintainability.
/// </summary>
public static class ConfigurationExtensions
{
    /// <summary>
    /// Configure controllers and JSON serialization options for camelCase property naming.
    /// Also registers FluentValidation for automatic model validation on API requests.
    /// </summary>
    public static IServiceCollection AddApiControllers(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.WriteIndented = true;
                options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
            })
            .AddFluentValidation(config =>
            {
                // Register all validators from the assembly containing the Program class
                config.RegisterValidatorsFromAssembly(typeof(Program).Assembly);
                
                // Automatically validate request models and return validation errors
                config.AutomaticValidationEnabled = true;
            });

        return services;
    }

    /// <summary>
    /// Configure Swagger/OpenAPI documentation.
    /// Swagger provides an interactive UI for testing API endpoints.
    /// </summary>
    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new()
            {
                Title = "Project Tracker API",
                Version = "v1",
                Description = "REST API for Project Tracker application with Angular frontend"
            });


        });

        return services;
    }

    /// <summary>
    /// Configure CORS policy to allow Angular development server and localhost variants.
    /// </summary>
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAngularApp", policy =>
            {
                policy.WithOrigins(
                    "http://localhost:4200",
                    "https://localhost:4200",
                    "http://localhost:3000"  // Alternative port for ng serve
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
            });
        });

        return services;
    }

    /// <summary>
    /// Configure JWT authentication with token validation and error handling.
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

    /// <summary>
    /// Register authentication services including password hashing, JWT token generation, and auth business logic.
    /// </summary>
    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenProvider, JwtTokenProvider>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }

    /// <summary>
    /// Register database connection and repository services for data access.
    /// </summary>
    public static IServiceCollection AddDataAccess(this IServiceCollection services)
    {
        services.AddSingleton<DbConnection>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<ITranslationRepository, TranslationRepository>();

        return services;
    }

    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        // Add response caching
        services.AddResponseCaching(options =>
        {
            options.MaximumBodySize = 1024; // 1KB max cache size per entry
            options.SizeLimit = 100 * 1024 * 1024; // 100MB total cache size
        });

        // Add memory cache for application-level caching
        services.AddMemoryCache();

        return services;
    }
}
