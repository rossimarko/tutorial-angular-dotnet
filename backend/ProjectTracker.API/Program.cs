using ProjectTracker.API.Authentication;
using ProjectTracker.API.Configuration;
using Serilog;
using Serilog.Events;

// ============================================
// 1. LOGGING CONFIGURATION
// ============================================
// Configure structured logging with Serilog for console and rolling file output.
// This ensures all application events are properly tracked with timestamps and severity levels.
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) =>
{
    config
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithEnvironmentName()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .WriteTo.Console(
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{SourceContext}] {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.File(
            path: "logs/app-.txt",
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{SourceContext}] {Message:lj} {Properties:j}{NewLine}{Exception}",
            retainedFileCountLimit: 30,
            fileSizeLimitBytes: 10_000_000);
});

// ============================================
// 2. SERVICE REGISTRATION
// ============================================
// Register all application services using extension methods for better organization.
// Each extension method handles a specific domain of service registration.

builder.Services.AddApiControllers();
builder.Services.AddApiDocumentation();
builder.Services.AddApiServices();
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddHealthChecks();
builder.Services.ConfigureJwtAuthentication(builder.Configuration);
builder.Services.AddAuthenticationServices();
builder.Services.AddDataAccess();

// Add MiniProfiler for API and SQL profiling (Development only)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddMiniProfilerServices();
}

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
