using Microsoft.OpenApi.Models;
using ProjectTracker.API.Authentication;
using ProjectTracker.API.Configuration;
using ProjectTracker.API.Data;
using ProjectTracker.API.Data.Repositories;
using ProjectTracker.API.Middleware;
using Serilog;

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

// Add controllers for API endpoints
// This is the standard approach, familiar to .NET Framework developers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
    });


// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{    
    c.SwaggerDoc("v1", new OpenApiInfo()
    { 
        Title = "Project Tracker API", 
        Version = "v1",
        Description = "REST API for Project Tracker application with Angular frontend"
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Description = "Enter 'Bearer' followed by your token"
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
// 3. AUTHENTICATION SERVICES
// ============================================

// Register authentication services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenProvider, JwtTokenProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ============================================
// 4. DATABASE SERVICES
// ============================================

// Database connection and repositories
builder.Services.AddSingleton<DbConnection>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();

// ============================================
// 5. BUILD THE APP
// ============================================
var app = builder.Build();

// ============================================
// 6. MIDDLEWARE PIPELINE
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

// Run database migrations
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<MigrationRunner>>();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var connectionString = config.GetConnectionString("DefaultConnection");

    try
    {
        logger.LogInformation("Starting database migrations...");
        var migrationRunner = new MigrationRunner(connectionString!, logger);
        await migrationRunner.RunMigrationsAsync();
        logger.LogInformation("Database migrations completed successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database migration failed: {Message}", ex.Message);
        throw;
    }
}


// ============================================
// 7. MAP ENDPOINTS
// ============================================

// Map all controller routes
// This automatically discovers all [ApiController] classes and their [HttpGet/Post/etc] methods
// Similar to RouteConfig.MapHttpAttributeRoutes() in .NET Framework
app.MapControllers();

// ============================================
// 8. RUN THE APP
// ============================================
app.Run();
