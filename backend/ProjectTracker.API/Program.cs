using Microsoft.OpenApi.Models;
using ProjectTracker.API.Authentication;
using ProjectTracker.API.Configuration;
using Serilog;

// ============================================
// 1. LOGGING CONFIGURATION
// ============================================
// Configure structured logging with Serilog for console and rolling file output.
// This ensures all application events are properly tracked with timestamps and severity levels.
var builder = WebApplication.CreateBuilder(args);

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
// 2. SERVICE REGISTRATION
// ============================================
// Register all application services using extension methods for better organization.
// Each extension method handles a specific domain of service registration.

builder.Services.AddApiControllers();
builder.Services.AddApiDocumentation();
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddHealthChecks();
builder.Services.ConfigureJwtAuthentication(builder.Configuration);
builder.Services.AddAuthenticationServices();
builder.Services.AddDataAccess();

// ============================================
// 3. BUILD THE APPLICATION
// ============================================
var app = builder.Build();

// ============================================
// 4. MIDDLEWARE PIPELINE CONFIGURATION
// ============================================
// Configure the HTTP request pipeline with proper middleware ordering and environment-specific settings.
app.UseApplicationMiddleware();

// ============================================
// 5. DATABASE MIGRATIONS
// ============================================
// Run pending database migrations before starting the application.
// This ensures the database schema is up-to-date with the current application version.
await app.RunDatabaseMigrationsAsync();

// ============================================
// 6. START THE APPLICATION
// ============================================
app.Run();
