using System.Net;
using ProjectTracker.API.Models.Common;
using System.Security.AccessControl;
using System.Text.Json;

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

