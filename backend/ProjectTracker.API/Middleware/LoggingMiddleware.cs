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