# Module 2: Project Architecture Overview

## 🎯 Objectives

By the end of this module, you will understand:
- ✅ The complete application architecture
- ✅ How frontend and backend communicate
- ✅ Folder organization and naming conventions
- ✅ Data flow through the application
- ✅ Security architecture
- ✅ Scalability considerations

## 🏗 Architecture Overview

This is a **modern three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT TIER (Browser)                        │
│                     Angular 20 Application                      │
│                   (Standalone Components)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTPS/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    API TIER (.NET 9)                            │
│            ASP.NET Core Minimal APIs + Controllers              │
│              (Authentication, Validation, Business Logic)       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                         SQL Queries
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    DATA TIER (SQL Server)                       │
│                  Database + Dapper ORM                          │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architecture Principles

1. **Separation of Concerns**: Each layer has specific responsibilities
2. **Stateless API**: Backend doesn't store session state
3. **Token-based Auth**: JWT tokens for stateless authentication
4. **Reactive Frontend**: Angular signals for responsive UX
5. **Async-first**: All I/O operations use async/await
6. **RESTful Design**: Standard HTTP methods for CRUD operations

## 📂 Backend Folder Structure

```
backend/ProjectTracker.API/
├── Program.cs                          # Application entry point, DI setup
├── appsettings.json                    # Configuration (dev)
├── appsettings.Production.json         # Configuration (prod)
├── ProjectTracker.API.csproj           # Project file
│
├── Controllers/                        # HTTP endpoints (Alternative to Minimal APIs)
│   ├── ProjectsController.cs
│   ├── UsersController.cs
│   ├── AuthController.cs
│   └── ...
│
├── Endpoints/                          # Minimal API endpoints (Preferred)
│   ├── ProjectEndpoints.cs
│   ├── UserEndpoints.cs
│   ├── AuthEndpoints.cs
│   └── ...
│
├── Services/                           # Business logic layer
│   ├── IProjectService.cs              # Interface (abstraction)
│   ├── ProjectService.cs               # Implementation
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IUserService.cs
│   ├── UserService.cs
│   └── ...
│
├── Data/                               # Data access layer
│   ├── IProjectRepository.cs           # Interface
│   ├── ProjectRepository.cs            # Dapper implementation
│   ├── IUserRepository.cs
│   ├── UserRepository.cs
│   ├── DbConnection.cs                 # SQL connection helper
│   └── Migrations/                     # Database migrations
│       ├── 001_InitialCreate.sql
│       ├── 002_AddAuthentication.sql
│       └── ...
│
├── Models/                             # Data models
│   ├── Requests/                       # DTOs for incoming requests
│   │   ├── CreateProjectRequest.cs
│   │   ├── UpdateProjectRequest.cs
│   │   ├── LoginRequest.cs
│   │   └── ...
│   │
│   ├── Responses/                      # DTOs for outgoing responses
│   │   ├── ProjectResponse.cs
│   │   ├── UserResponse.cs
│   │   ├── AuthTokenResponse.cs
│   │   └── ...
│   │
│   ├── Entities/                       # Database entities (internal only)
│   │   ├── Project.cs
│   │   ├── User.cs
│   │   └── ...
│   │
│   └── Common/                         # Shared models
│       ├── PaginationRequest.cs
│       ├── PaginationResponse.cs
│       ├── ApiResponse.cs
│       └── ErrorResponse.cs
│
├── Middleware/                         # Custom middleware
│   ├── ErrorHandlingMiddleware.cs      # Global error handling
│   ├── LoggingMiddleware.cs            # Request/response logging
│   └── AuthenticationMiddleware.cs     # JWT validation
│
├── Authentication/                     # Auth-related services
│   ├── JwtTokenProvider.cs             # JWT token generation
│   ├── PasswordHasher.cs               # Password hashing (bcrypt)
│   └── JwtSettings.cs                  # JWT configuration
│
├── Utils/                              # Utility functions
│   ├── ValidationExtensions.cs
│   ├── MappingExtensions.cs
│   └── StringExtensions.cs
│
├── Configuration/                      # Configuration classes
│   ├── DatabaseOptions.cs
│   ├── JwtOptions.cs
│   ├── CorsOptions.cs
│   └── ...
│
├── Exceptions/                         # Custom exceptions
│   ├── NotFoundException.cs
│   ├── UnauthorizedException.cs
│   ├── ValidationException.cs
│   └── ...
│
├── Logging/                            # Logging configuration
│   ├── LoggerConfiguration.cs
│   └── LoggingExtensions.cs
│
└── bin/ & obj/                         # Build output (gitignored)
```

### Backend Architecture Layers

#### 1. **Controllers / Endpoints Layer**
- Entry points for HTTP requests
- Route mapping and parameter binding
- Request validation decorators
- Response serialization

```csharp
// Example Minimal API endpoint
app.MapPost("/api/projects", CreateProject)
    .WithName("CreateProject")
    .WithOpenApi()
    .RequireAuthorization();

async Task<IResult> CreateProject(CreateProjectRequest request, IProjectService service)
{
    var result = await service.CreateAsync(request);
    return Results.Created($"/api/projects/{result.Id}", result);
}
```

#### 2. **Services Layer**
- Business logic implementation
- Validation and error handling
- Service-to-service coordination
- Application rules enforcement

```csharp
public interface IProjectService
{
    Task<ProjectResponse> CreateAsync(CreateProjectRequest request);
    Task<ProjectResponse> GetByIdAsync(int id);
    Task<PaginatedResponse<ProjectResponse>> GetPagedAsync(PaginationRequest request);
    Task UpdateAsync(int id, UpdateProjectRequest request);
    Task DeleteAsync(int id);
}
```

#### 3. **Repository/Data Access Layer**
- Database operations
- Dapper query execution
- Connection management
- Query optimization

```csharp
public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(int id);
    Task<IEnumerable<Project>> GetAllAsync();
    Task<(IEnumerable<Project> items, int total)> GetPagedAsync(int pageNumber, int pageSize);
    Task<int> CreateAsync(Project project);
    Task UpdateAsync(Project project);
    Task DeleteAsync(int id);
}
```

#### 4. **Models/DTOs**
- **Request DTOs**: Define incoming API data structure
- **Response DTOs**: Define outgoing API data structure
- **Entity Models**: Represent database records
- **Common Models**: Shared structures (pagination, errors)

## 📂 Frontend Folder Structure

```
frontend/project-tracker/src/
│
├── app/
│   ├── app.component.ts                # Root component
│   ├── app.component.html
│   ├── app.component.css
│   ├── app.routes.ts                   # Route definitions
│   │
│   ├── core/                           # Core functionality (singleton services)
│   │   ├── services/
│   │   │   ├── auth.service.ts         # Authentication service
│   │   │   ├── api.service.ts          # HTTP wrapper
│   │   │   ├── storage.service.ts      # Local storage
│   │   │   └── logger.service.ts       # Logging
│   │   │
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Route protection
│   │   │   └── unsaved-changes.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts     # Add JWT token
│   │   │   ├── error.interceptor.ts    # Handle errors
│   │   │   └── loading.interceptor.ts  # Loading states
│   │   │
│   │   └── models/
│   │       ├── api-response.model.ts
│   │       ├── pagination.model.ts
│   │       ├── user.model.ts
│   │       └── ...
│   │
│   ├── shared/                         # Shared components & pipes
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   ├── footer/
│   │   │   ├── loading-spinner/
│   │   │   ├── confirmation-dialog/
│   │   │   └── ...
│   │   │
│   │   ├── pipes/
│   │   │   ├── translate.pipe.ts       # Custom translation pipe
│   │   │   ├── date-format.pipe.ts
│   │   │   └── ...
│   │   │
│   │   ├── directives/
│   │   │   ├── highlight.directive.ts
│   │   │   └── ...
│   │   │
│   │   └── utils/
│   │       ├── validators.ts           # Form validators
│   │       ├── helpers.ts              # Utility functions
│   │       └── constants.ts            # Shared constants
│   │
│   ├── features/                       # Feature modules (lazy-loaded)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   ├── register/
│   │   │   │   ├── register.component.ts
│   │   │   │   ├── register.component.html
│   │   │   │   └── register.component.css
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── project-list/
│   │   │   │   ├── project-list.component.ts
│   │   │   │   ├── project-list.component.html
│   │   │   │   └── project-list.component.css
│   │   │   ├── project-detail/
│   │   │   ├── project-form/
│   │   │   ├── project-filters/
│   │   │   ├── services/
│   │   │   │   └── project.service.ts
│   │   │   └── projects.routes.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.component.html
│   │   │   └── dashboard.component.css
│   │   │
│   │   ├── settings/
│   │   │   ├── language-selector/
│   │   │   ├── profile/
│   │   │   └── settings.routes.ts
│   │   │
│   │   └── admin/ (if applicable)
│   │
│   └── state/                          # Global state with signals
│       ├── auth.state.ts               # Authentication state
│       ├── app.state.ts                # App-wide state
│       ├── notification.state.ts       # Notifications/toasts
│       └── language.state.ts           # Current language
│
├── assets/
│   ├── i18n/                           # Translation files
│   │   ├── en.json
│   │   ├── it.json
│   │   └── ...
│   │
│   ├── images/
│   │   ├── logo.png
│   │   ├── icons/
│   │   └── ...
│   │
│   └── styles/
│       ├── fonts/
│       └── icons/
│
├── styles/
│   ├── global.css                      # Global styles
│   ├── variables.css                   # CSS variables (colors, sizes)
│   ├── responsive.css                  # Responsive breakpoints
│   └── bootstrap-overrides.css         # Bootstrap customizations
│
├── environments/
│   ├── environment.ts                  # Development config
│   └── environment.prod.ts             # Production config
│
├── main.ts                             # Application bootstrap
├── index.html                          # HTML template
├── styles.css                          # Global application styles
│
├── angular.json                        # Angular CLI config
├── tsconfig.json                       # TypeScript config
├── tsconfig.app.json                   # App-specific TS config
└── package.json                        # Dependencies
```

### Frontend Architecture Layers

#### 1. **Components**
- Presentation logic
- User interaction handling
- Input/output signals
- OnPush change detection

```typescript
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent {
  projects = signal<Project[]>([]);
  isLoading = signal(false);
  
  constructor(private projectService: ProjectService) {}
}
```

#### 2. **Services**
- HTTP communication
- State management
- Business logic
- Data transformation

```typescript
@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}
  
  getProjects(filters: ProjectFilters): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/api/projects', { params: filters });
  }
}
```

#### 3. **Guards & Interceptors**
- Route protection
- Request/response transformation
- Authentication handling
- Error management

#### 4. **State Management**
- Global application state using signals
- Local component state
- State transformations with computed()

## 🔄 Data Flow: A Complete Example

Let's trace a request through the system:

### Scenario: User creates a new project

```
1. Frontend - User Action
   └─→ User fills form and clicks "Create"

2. Frontend - Component
   └─→ ProjectFormComponent collects form data
   └─→ Validates input
   └─→ Calls ProjectService.createProject()

3. Frontend - Service
   └─→ ProjectService.createProject()
   └─→ Calls ApiService.post('/api/projects', data)
   └─→ AuthInterceptor adds JWT token
   └─→ Sends HTTP POST request

4. Network
   └─→ HTTPS request to backend API

5. Backend - Middleware
   └─→ AuthenticationMiddleware validates JWT
   └─→ LoggingMiddleware logs request
   └─→ CORS middleware validates origin

6. Backend - Controller/Endpoint
   └─→ CreateProjectEndpoint receives request
   └─→ Deserializes CreateProjectRequest
   └─→ Validates model

7. Backend - Service Layer
   └─→ ProjectService.CreateAsync()
   └─→ Applies business rules
   └─→ Calls ProjectRepository.CreateAsync()

8. Backend - Repository Layer
   └─→ ProjectRepository.CreateAsync()
   └─→ Executes SQL INSERT via Dapper
   └─→ Returns new project ID

9. Backend - Response
   └─→ Service maps Project entity to ProjectResponse DTO
   └─→ Endpoint returns Created (201) result
   └─→ Response includes project data and location header

10. Network
    └─→ HTTPS response to frontend

11. Frontend - Interceptor
    └─→ ErrorInterceptor checks status code
    └─→ LoadingInterceptor updates loading state

12. Frontend - Service
    └─→ Observable emits response data
    └─→ Component receives new project

13. Frontend - Component
    └─→ Updates projects signal
    └─→ Computed signals update derived state
    └─→ Change detection triggers (OnPush)
    └─→ Template updates automatically
    └─→ Success notification shown

14. User
    └─→ Sees new project in list
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User enters credentials
   └─→ Frontend: POST /api/auth/login

2. Backend validation
   └─→ Find user by email
   └─→ Hash password and compare
   └─→ If valid: Generate JWT token

3. Token response
   └─→ Access token (15 min expiry)
   └─→ Refresh token (7 days expiry)
   └─→ Store in localStorage (frontend)

4. Subsequent requests
   └─→ Include Authorization: Bearer <token>
   └─→ AuthInterceptor adds automatically
   └─→ Backend validates token signature
   └─→ Extract user claims

5. Token refresh
   └─→ When access token expires
   └─→ Send refresh token
   └─→ Backend validates refresh token
   └─→ Issue new access token
```

### Data Protection

- **Passwords**: Hashed with bcrypt (not reversible)
- **Tokens**: Signed with secret key (tamper-proof)
- **CORS**: Restrict cross-origin requests
- **HTTPS**: Encrypt data in transit
- **SQL Injection Prevention**: Parameterized queries via Dapper

## 🗄 Database Design (Simplified)

```sql
-- Users table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE()
);

-- Projects table
CREATE TABLE Projects (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Status NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Refresh tokens table
CREATE TABLE RefreshTokens (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Token NVARCHAR(MAX) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

## 🚀 Scalability Considerations

### Performance Optimizations

1. **Backend**
   - Connection pooling for database
   - Query caching with Redis (optional)
   - Pagination to reduce data transfer
   - Async I/O to handle concurrent requests

2. **Frontend**
   - Lazy loading of feature routes
   - Virtual scrolling for large lists
   - OnPush change detection
   - Signals for efficient reactivity

3. **Database**
   - Proper indexing on foreign keys
   - Partitioning for large tables
   - Query optimization
   - Regular maintenance

### Deployment Scaling

- **Horizontal**: Multiple API instances behind load balancer
- **Vertical**: Increase server resources
- **Caching**: Redis for session data and frequently accessed data
- **CDN**: Serve static assets globally

## 📋 Communication Contracts (API)

All API endpoints follow REST conventions:

```
GET    /api/projects              → List all projects
GET    /api/projects/{id}         → Get specific project
POST   /api/projects              → Create new project
PUT    /api/projects/{id}         → Update project
DELETE /api/projects/{id}         → Delete project

GET    /api/projects/search       → Search with filters
GET    /api/projects/export       → Export data

POST   /api/auth/login            → User login
POST   /api/auth/register         → User registration
POST   /api/auth/refresh          → Refresh JWT token
POST   /api/auth/logout           → Logout
```

### Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation completed",
  "errors": null
}
```

Error Response:

```json
{
  "success": false,
  "data": null,
  "message": "Operation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🎯 Key Takeaways

1. **Clear Separation**: Each layer has specific responsibilities
2. **Stateless**: Backend doesn't maintain session state
3. **Token-Based Auth**: Scalable authentication mechanism
4. **Type Safety**: Strong typing on both frontend and backend
5. **Performance**: OnPush detection, lazy loading, pagination
6. **Security**: Encryption, hashing, validation at every layer

## ✅ Checkpoint

You should understand:
- ✅ Three-tier architecture (Client, API, Database)
- ✅ Backend folder organization
- ✅ Frontend folder organization
- ✅ Data flow through the system
- ✅ Security architecture
- ✅ API communication contracts

## 🚀 Next Steps

Now that you understand the architecture:

1. Review the folder structure we've created
2. Move to **Module 3: ASP.NET Core 9 API Project Setup**

This module covers the detailed backend setup with all necessary configurations.

---

**Next: [Module 3: ASP.NET Core 9 API Project Setup](./03_aspnet_api_setup.md)**
