# Module 3: ASP.NET Core 9 API Project Setup

## 🎯 Objectives

By the end of this module, you will have:
- ✅ A fully configured ASP.NET Core 9 Web API project
- ✅ Minimal APIs endpoints structure
- ✅ Dependency injection properly configured
- ✅ CORS configuration for Angular frontend
- ✅ Logging with Serilog
- ✅ Health checks and Swagger documentation
- ✅ Environment-specific configuration

## 📦 Project Setup Recap

From Module 1, you should have created:

```powershell
cd d:\Formazione\tutorial-angular-dotnet\backend\ProjectTracker.API

# Verify the project was created
dir /s

# Should see:
# - Program.cs
# - appsettings.json
# - ProjectTracker.API.csproj
# - Properties/launchSettings.json
```

## 📝 Program.cs Configuration

The `Program.cs` file is the entry point and where we configure all services. Let's build it step by step:

### Step 1: Basic Setup

Open `Program.cs` and replace its contents with:

```csharp
using Serilog;
using ProjectTracker.API.Configuration;
using ProjectTracker.API.Authentication;
using ProjectTracker.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// 1. LOGGING CONFIGURATION
// ============================================
builder.Host.UseSerilog((context, config) =>
{
    config
        .MinimumLevel.Debug()
        .WriteTo.Console()
        .WriteTo.File("logs/app-.txt", 
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}");
});

// ============================================
// 2. SERVICES CONFIGURATION
// ============================================

// Add controllers (alternative to Minimal APIs, we'll use both)
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Project Tracker API", 
        Version = "v1",
        Description = "REST API for Project Tracker application with Angular frontend"
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        Type = "ApiKey",
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = "header",
        Name = "Authorization",
        Description = "Enter 'Bearer' followed by your token"
    });
    
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = "ApiKey", Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "http://localhost:3000"  // for ng serve alternative ports
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add Health Checks
builder.Services.AddHealthChecks();

// Add Authentication (JWT)
builder.Services.ConfigureJwtAuthentication(builder.Configuration);

// ============================================
// 3. APPLICATION SERVICES (We'll add these in next modules)
// ============================================

// Uncomment as we create services:
// builder.Services.AddScoped<IProjectService, ProjectService>();
// builder.Services.AddScoped<IProjectRepository, ProjectRepository>();

// ============================================
// 4. BUILD THE APP
// ============================================
var app = builder.Build();

// ============================================
// 5. MIDDLEWARE PIPELINE
// ============================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Project Tracker API v1");
    });
}

// Custom middleware
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseMiddleware<LoggingMiddleware>();

// HTTPS redirection (disabled in development for easier testing)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Enable CORS
app.UseCors("AllowAngularApp");

// Enable Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

// Health checks endpoint
app.MapHealthChecks("/health");

// ============================================
// 6. MAP ENDPOINTS
// ============================================

// Map controllers (if using controller-based APIs)
app.MapControllers();

// Map Minimal API endpoints (we'll add these in later modules)
// AuthEndpoints.MapAuthEndpoints(app);
// ProjectEndpoints.MapProjectEndpoints(app);

// ============================================
// 7. RUN THE APP
// ============================================
app.Run();
```

## 📋 Configuration Files

### Step 1: appsettings.json

Update the `appsettings.json` file:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ProjectTrackerDb;User Id=sa;Password=YourPassword123!@#;TrustServerCertificate=true;"
  },
  "Jwt": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256!!!!",
    "Issuer": "ProjectTrackerAPI",
    "Audience": "ProjectTrackerClient",
    "ExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.EntityFrameworkCore": "Debug"
    }
  },
  "Serilog": {
    "MinimumLevel": "Debug"
  }
}
```

### Step 2: appsettings.Production.json

Create `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=sqlserver;Database=ProjectTrackerDb;User Id=sa;Password=YourPassword123!@#;TrustServerCertificate=true;"
  },
  "Jwt": {
    "SecretKey": "ReplaceThisWithYourProductionSecretKey!!!VeryLongAndSecure!!!",
    "Issuer": "ProjectTrackerAPI",
    "Audience": "ProjectTrackerClient",
    "ExpirationMinutes": 30,
    "RefreshTokenExpirationDays": 30
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning"
    }
  },
  "Serilog": {
    "MinimumLevel": "Warning"
  }
}
```

## 🔑 JWT Configuration Classes

Create folder: `backend/ProjectTracker.API/Configuration`

### Step 1: JwtOptions.cs

```csharp
namespace ProjectTracker.API.Configuration;

/// <summary>
/// JWT configuration options from appsettings.json
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";
    
    public required string SecretKey { get; set; }
    public required string Issuer { get; set; }
    public required string Audience { get; set; }
    public int ExpirationMinutes { get; set; } = 15;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
```

### Step 2: ConfigurationExtensions.cs

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ProjectTracker.API.Configuration;

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
```

## 🛡 Middleware Implementation

Create folder: `backend/ProjectTracker.API/Middleware`

### Step 1: ErrorHandlingMiddleware.cs

```csharp
using System.Net;
using System.Text.Json;
using ProjectTracker.API.Models.Common;

namespace ProjectTracker.API.Middleware;

/// <summary>
/// Global exception handling middleware
/// Catches all unhandled exceptions and returns consistent error responses
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse();

        switch (exception)
        {
            case ArgumentNullException or ArgumentException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Invalid request data";
                response.Errors = new[] { new ErrorDetail { Message = exception.Message } };
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response.Message = "Unauthorized access";
                break;

            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = "Resource not found";
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "An error occurred while processing your request";
                break;
        }

        return context.Response.WriteAsJsonAsync(response);
    }
}

/// <summary>
/// Error detail in response
/// </summary>
public class ErrorDetail
{
    public string? Field { get; set; }
    public required string Message { get; set; }
}
```

### Step 2: LoggingMiddleware.cs

```csharp
using System.Diagnostics;

namespace ProjectTracker.API.Middleware;

/// <summary>
/// Middleware to log HTTP requests and responses
/// </summary>
public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        var originalBodyStream = context.Response.Body;

        using (var responseBody = new MemoryStream())
        {
            context.Response.Body = responseBody;

            try
            {
                await _next(context);

                stopwatch.Stop();

                _logger.LogInformation(
                    "HTTP {Method} {Path} returned {StatusCode} in {ElapsedMilliseconds}ms",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds);

                await responseBody.CopyToAsync(originalBodyStream);
            }
            finally
            {
                context.Response.Body = originalBodyStream;
            }
        }
    }
}
```

## 📊 Common Models

Create folder: `backend/ProjectTracker.API/Models/Common`

### Step 1: ApiResponse.cs

```csharp
namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Standard API response wrapper for all successful responses
/// </summary>
public class ApiResponse<T>
{
    /// <summary>
    /// Whether the operation was successful
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// The actual response data
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Success message
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Any validation or business errors
    /// </summary>
    public ErrorDetail[]? Errors { get; set; }

    /// <summary>
    /// Create a successful response
    /// </summary>
    public static ApiResponse<T> Ok(T? data = default, string? message = null)
        => new() { Success = true, Data = data, Message = message };

    /// <summary>
    /// Create a failed response
    /// </summary>
    public static ApiResponse<T> Fail(string message, ErrorDetail[]? errors = null)
        => new() { Success = false, Message = message, Errors = errors };
}

/// <summary>
/// Standard API error response
/// </summary>
public class ApiErrorResponse
{
    public bool Success { get; set; } = false;
    public object? Data { get; set; }
    public required string Message { get; set; }
    public ErrorDetail[]? Errors { get; set; }
}

/// <summary>
/// Individual error detail
/// </summary>
public class ErrorDetail
{
    /// <summary>
    /// Field that caused the error (optional)
    /// </summary>
    public string? Field { get; set; }

    /// <summary>
    /// Error message
    /// </summary>
    public required string Message { get; set; }
}
```

### Step 2: PaginationModels.cs

```csharp
namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Pagination request parameters
/// </summary>
public class PaginationRequest
{
    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 10;

    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Items per page
    /// </summary>
    private int _pageSize = DefaultPageSize;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? DefaultPageSize : value;
    }

    /// <summary>
    /// Search term
    /// </summary>
    public string? SearchTerm { get; set; }

    /// <summary>
    /// Sort column name
    /// </summary>
    public string? SortBy { get; set; }

    /// <summary>
    /// Sort direction (asc or desc)
    /// </summary>
    public string SortDirection { get; set; } = "asc";
}

/// <summary>
/// Paginated response
/// </summary>
public class PaginatedResponse<T>
{
    /// <summary>
    /// Current page number
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Page size
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of items
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (TotalCount + PageSize - 1) / PageSize;

    /// <summary>
    /// Whether there are more pages
    /// </summary>
    public bool HasNextPage => PageNumber < TotalPages;

    /// <summary>
    /// Whether there are previous pages
    /// </summary>
    public bool HasPreviousPage => PageNumber > 1;

    /// <summary>
    /// The items in this page
    /// </summary>
    public required List<T> Items { get; set; }

    /// <summary>
    /// Create a paginated response
    /// </summary>
    public static PaginatedResponse<T> Create(
        int pageNumber,
        int pageSize,
        int totalCount,
        List<T> items)
    {
        return new()
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            Items = items
        };
    }
}

/// <summary>
/// Response for infinite scroll pagination
/// </summary>
public class InfiniteScrollResponse<T>
{
    /// <summary>
    /// Items returned
    /// </summary>
    public required List<T> Items { get; set; }

    /// <summary>
    /// Whether there are more items to load
    /// </summary>
    public bool HasMore { get; set; }

    /// <summary>
    /// Total count of all items
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Create an infinite scroll response
    /// </summary>
    public static InfiniteScrollResponse<T> Create(
        List<T> items,
        int totalCount,
        int pageSize)
    {
        return new()
        {
            Items = items,
            TotalCount = totalCount,
            HasMore = items.Count < totalCount
        };
    }
}
```

## 🧪 Test the Setup

### Step 1: Build the project

```powershell
cd d:\Formazione\tutorial-angular-dotnet\backend\ProjectTracker.API

# Build and restore
dotnet build

# You should see: Build succeeded!
```

### Step 2: Run the application

```powershell
# Run the API
dotnet run

# You should see:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: https://localhost:5001
#       Now listening on: http://localhost:5000
```

### Step 3: Test endpoints

Open browser and navigate to:

```
http://localhost:5000/swagger
```

or

```
https://localhost:5001/swagger
```

You should see the Swagger UI with the `/health` endpoint listed.

Click the **GET /health** endpoint and click **Try it out** → **Execute**

Expected response:
```json
{
  "status": "Healthy"
}
```

## 📚 Project Structure Summary

Your backend now has:

```
ProjectTracker.API/
├── Program.cs                     # ✅ Configured with all services
├── appsettings.json              # ✅ Connection strings & JWT config
├── appsettings.Production.json   # ✅ Production settings
│
├── Configuration/
│   ├── JwtOptions.cs             # ✅ JWT settings class
│   └── ConfigurationExtensions.cs # ✅ Service extension methods
│
├── Middleware/
│   ├── ErrorHandlingMiddleware.cs # ✅ Global error handling
│   └── LoggingMiddleware.cs      # ✅ Request/response logging
│
├── Models/
│   └── Common/
│       ├── ApiResponse.cs        # ✅ Response wrapper
│       ├── PaginationModels.cs   # ✅ Pagination helpers
│       └── (more models will go here)
│
├── Controllers/                  # Will add later
├── Services/                     # Will add later
└── Data/                         # Will add later
```

## 🔒 Security Notes

⚠️ **Important**: The JWT secret key in `appsettings.json` is for development only!

For production:
```powershell
# Use User Secrets to store the real key
dotnet user-secrets init
dotnet user-secrets set "Jwt:SecretKey" "YourProductionSecretKeyHere"
```

## ✅ Checkpoint

You should now have:
- ✅ Configured Program.cs with all services
- ✅ Logging with Serilog
- ✅ CORS configured for Angular frontend
- ✅ JWT authentication setup
- ✅ Health checks endpoint
- ✅ Swagger documentation
- ✅ Error handling middleware
- ✅ Logging middleware
- ✅ Common models and DTOs

## 🚀 Next Steps

The API foundation is now ready! Next module covers:

1. **Module 4**: SQL Server with Dapper data access
2. Creating database models and migrations
3. Implementing the repository pattern
4. Writing efficient queries with Dapper

Ready to dive into database setup?

---

**Next: [Module 4: SQL Server with Dapper Data Access](./04_sql_server_dapper.md)**
