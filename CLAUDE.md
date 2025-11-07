# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack tutorial project demonstrating modern web development with **Angular 20** (frontend) and **.NET 9** (backend API). It's designed to help .NET 4.8 WebForms developers transition to modern cloud-native architecture. The application is a Project Tracker with JWT authentication, multi-language support (Italian/English), and comprehensive CRUD operations.

## Architecture

Three-tier architecture with clear separation:
- **Frontend**: Angular 20 standalone components with signals, located in `frontend/project-tracker/`
- **Backend**: ASP.NET Core 9 with minimal APIs and controllers, located in `backend/ProjectTracker.API/`
- **Database**: SQL Server 2022 with Dapper ORM

**Key Architectural Principles**:
- Stateless API with JWT token-based authentication
- Repository pattern for data access
- Service layer for business logic
- Request/Response DTOs separate from database entities
- All I/O operations use async/await

## Common Commands

### Backend (.NET 9)

```powershell
# Navigate to backend
cd backend/ProjectTracker.API

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the API (development)
dotnet run

# Run with watch (auto-reload)
dotnet watch run

# Run database migrations (executed automatically on startup)
# Migrations are in Data/Migrations/*.sql
```

API runs at `https://localhost:5001` (development)

### Frontend (Angular 20)

```powershell
# Navigate to frontend
cd frontend/project-tracker

# Install dependencies
npm install

# Run development server
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Run tests
npm test
# or
ng test

# Build with watch mode
npm run watch
```

Frontend runs at `http://localhost:4200` (development)

### Docker

```powershell
# Start all services (SQL Server, API, Frontend)
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

**Services**:
- SQL Server 2022: Port 1433
- API Backend: Port 5001 (HTTPS)
- Frontend App: Port 4200

## Backend Structure

### Folder Organization

- **Controllers/**: HTTP endpoints using traditional controller pattern
- **Authentication/**: JWT token provider, password hasher, auth service
- **Data/Repositories/**: Dapper-based repositories (IProjectRepository, IUserRepository, ITranslationRepository)
- **Data/Migrations/**: SQL migration scripts executed on startup
- **Models/Entities/**: Database entities (Project, User, RefreshToken)
- **Models/Requests/**: Incoming DTOs (CreateProjectRequest, UpdateProjectRequest, LoginRequest, RegisterRequest)
- **Models/Responses/**: Outgoing DTOs (ProjectResponse, UserResponse, TokenResponse, TranslationResponse)
- **Models/Common/**: Shared models (ApiResponse, PaginationModel, AuthResult, Culture)
- **Middleware/**: Custom middleware (ErrorHandlingMiddleware, LoggingMiddleware)
- **Configuration/**: Service registration extensions and configuration classes

### Key Backend Patterns

**Service Registration**: Services are registered via extension methods in `Configuration/ConfigurationExtensions.cs` and `MiddlewareExtensions.cs`:
- `AddApiControllers()`: Registers controllers and FluentValidation
- `AddApiDocumentation()`: Configures Swagger/OpenAPI
- `AddCorsPolicy()`: Configures CORS
- `ConfigureJwtAuthentication()`: Sets up JWT bearer authentication
- `AddAuthenticationServices()`: Registers auth services and password hasher
- `AddDataAccess()`: Registers repositories and database connection

**Database Migrations**: SQL migrations in `Data/Migrations/` are run automatically on startup via `RunDatabaseMigrationsAsync()` in Program.cs. Add new migrations as numbered SQL files (001_*.sql, 002_*.sql).

**Authentication**: JWT tokens with 15-minute expiry, refresh tokens with 7-day expiry. Password hashing uses BCrypt.

**Logging**: Serilog configured for console and rolling file output in `logs/` directory.

## Frontend Structure

### Folder Organization

- **core/**: Singleton services, guards, interceptors, and core models
  - `services/`: AuthService, TranslationService, NotificationService, ExportService, ThemeService
  - `guards/`: AuthGuard for route protection
  - `interceptors/`: AuthHttpInterceptor adds JWT to requests
- **shared/**: Reusable components, pipes, directives
  - `components/`: Card, ConfirmDialog, LanguageSelector, Pagination, ThemeToggle, ToastContainer
  - `pipes/`: TranslatePipe, LocalizedDatePipe, LocalizedNumberPipe, LocalizedCurrencyPipe
  - `directives/`: FocusTrap, SkipLink
  - `models/`: Project, Translation models
- **features/**: Feature modules organized by domain
  - `auth/`: Login, Register components
  - `projects/`: ProjectList, ProjectForm components and ProjectService
- **layouts/**: Layout components like Navbar
- **app.routes.ts**: Route definitions
- **app.config.ts**: Application configuration (providers, interceptors)

### Key Frontend Patterns

**Standalone Components**: All components use Angular 20 standalone architecture (no NgModules).

**Signals**: Use Angular signals for reactive state management instead of observables where appropriate.

**Change Detection**: Components use `ChangeDetectionStrategy.OnPush` for performance.

**Internationalization**: Custom translation service with `TranslatePipe`. Translation files stored in `backend/ProjectTracker.API/Resources/Translations/` (en-US.json, it-IT.json) served via API.

**Styling**: Bootstrap 5.3 classes only - do not create custom styles.

**Forms**: Reactive forms with validation.

## Database

**Connection String**: Configured in `appsettings.json` (`appsettings.Development.json`, `appsettings.Production.json`)

**Default**: `Server=localhost;Database=ProjectTrackerDb;User Id=sa;Password=YourPassword123!@#;TrustServerCertificate=true;`

**Migrations**: Located in `backend/ProjectTracker.API/Data/Migrations/`. Run automatically on app startup via `MigrationRunner.cs`.

**Tables**:
- Users (Id, Email, PasswordHash, FirstName, LastName, CreatedAt, UpdatedAt)
- Projects (Id, UserId, Title, Description, Status, CreatedAt, UpdatedAt)
- RefreshTokens (Id, UserId, Token, ExpiresAt, CreatedAt)

## Important Guidelines

### Coding Standards

Reference these instruction files for best practices:
- `.github/instructions/csharp.instructions.md`: C# backend best practices
- `.github/instructions/aspnet-rest-apis.instructions.md`: ASP.NET Web API best practices
- `.github/instructions/angular.instructions.md`: Angular best practices

### General Rules

1. **Styling**: Use only Bootstrap 5.3 classes - no custom CSS
2. **Documentation**: Don't create recap or diff markdown files when making changes
3. **Explain First**: Briefly explain planned changes before implementing
4. **Data Access**: Use Dapper with parameterized queries (prevent SQL injection)
5. **Security**: JWT tokens in Authorization header, passwords hashed with BCrypt
6. **API Responses**: Use consistent ApiResponse wrapper with success/data/message/errors structure
7. **Validation**: FluentValidation on backend, reactive forms validation on frontend
8. **Error Handling**: Global error handling via ErrorHandlingMiddleware

## Tutorial Documentation

Step-by-step tutorial modules are in `tutorial-docs/`:
- 00_INDEX.md: Course overview
- 01-14: Individual modules covering environment setup through deployment

Each module includes concepts, implementation, code examples, best practices, and common mistakes.

## Testing

**Backend**: Tests not yet implemented (tutorial project)

**Frontend**:
- Unit tests: `ng test` (Jasmine/Karma)
- Test files: `*.spec.ts` alongside components

## Configuration Files

**Backend**:
- `appsettings.json`: Default configuration
- `appsettings.Development.json`: Development overrides
- `appsettings.Production.json`: Production overrides

**Frontend**:
- `angular.json`: Angular CLI configuration
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies and scripts

## Technology Stack

- **Frontend**: Angular 20, TypeScript, Bootstrap 5.3, RxJS, Signals
- **Backend**: .NET 9, C#, ASP.NET Core
- **Data Access**: Dapper 2.1, SQL Server 2022
- **Authentication**: JWT Bearer tokens, BCrypt password hashing
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker, Docker Compose
- **Validation**: FluentValidation (backend), Reactive Forms (frontend)

## Key Dependencies

**Backend NuGet Packages**:
- BCrypt.Net-Next: Password hashing
- Dapper, Dapper.Contrib: ORM
- Microsoft.AspNetCore.Authentication.JwtBearer: JWT auth
- FluentValidation: Input validation
- Serilog.AspNetCore: Structured logging
- Swashbuckle.AspNetCore: Swagger/OpenAPI

**Frontend npm Packages**:
- @angular/core, @angular/common, @angular/forms, @angular/router: Angular framework
- bootstrap: UI framework
- @fortawesome/fontawesome-free: Icons
- jwt-decode: JWT token parsing
- ngx-pagination: Pagination component
- file-saver: File export functionality
