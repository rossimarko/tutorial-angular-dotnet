# Module 1: Environment Setup & Project Scaffolding

## 🎯 Objectives

By the end of this module, you will:
- ✅ Verify and install all required tools
- ✅ Create the project structure
- ✅ Initialize Git repository
- ✅ Set up Docker for local development
- ✅ Configure connection strings and environment variables
- ✅ Run a basic health check

## 📋 Prerequisites Check

Before we begin, ensure you have these installed:

### 1. .NET 9 SDK

```powershell
# Check if .NET 9 is installed
dotnet --version

# You should see: 9.x.x

# If not installed, download from:
# https://dotnet.microsoft.com/en-us/download/dotnet/9.0
```

### 2. Visual Studio 2022

Ensure you have the following workloads installed:
- ASP.NET and web development
- Azure development (optional but recommended)
- .NET desktop development

```powershell
# Verify Visual Studio path
"C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv.exe" -v
```

### 3. Node.js 20+ and npm

```powershell
# Check Node.js version (should be 20 or higher)
node --version

# Check npm version
npm --version

# If not installed, download from:
# https://nodejs.org/ (choose LTS version)
```

### 4. Docker Desktop

```powershell
# Check Docker
docker --version

# Should output: Docker version 20.x.x or higher

# Download from: https://www.docker.com/products/docker-desktop

# Start Docker Desktop (on Windows, it should auto-start or use the app)
```

### 5. Angular CLI

```powershell
# Install Angular CLI globally (version 20+)
npm install -g @angular/cli@latest

# Verify installation
ng version

# Should show Angular CLI 20.x.x or higher
```

### 6. Git

```powershell
# Check if Git is installed
git --version

# Download from: https://git-scm.com/download/win if needed
```

## 📁 Project Structure Setup

We've already created the base structure. Here's what we have:

```
tutorial-angular-dotnet/
├── backend/
│   └── ProjectTracker.API/       # Will contain .NET 9 API
├── frontend/
│   └── project-tracker/          # Will contain Angular 20 app
├── docker/
│   ├── docker-compose.yml        # Orchestrates all services
│   ├── Dockerfile.api            # Backend container
│   ├── Dockerfile.frontend       # Frontend container
│   └── .dockerignore
├── tutorial-docs/                # Lesson documentation
│   └── (modules 1-14)
└── README.md                     # Main project README
```

## 🔧 Backend Project Creation

### Step 1: Create the ASP.NET Core 9 Web API Project

Navigate to the backend directory and create the API project:

```powershell
cd backend\ProjectTracker.API

# Create a new Web API project
dotnet new webapi --name ProjectTracker.API --framework net9.0 --use-minimal-apis

# Or if you prefer, use Visual Studio:
# File > New > Project > ASP.NET Core Web API
# - Name: ProjectTracker.API
# - Location: backend\ProjectTracker.API
# - Framework: .NET 9.0
# - Use controllers: No (we'll use Minimal APIs)
```

### Step 2: Verify the Backend Builds

```powershell
cd backend\ProjectTracker.API

# Restore NuGet packages
dotnet restore

# Build the project
dotnet build

# You should see: Build succeeded!
```

### Step 3: Add Required NuGet Packages

```powershell
cd backend\ProjectTracker.API

# Add Dapper for data access
dotnet add package Dapper

# Add SQL Server connection
dotnet add package Microsoft.Data.SqlClient

# Add Entity Framework for migrations
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools

# Add JWT authentication
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package Microsoft.IdentityModel.Tokens

# Add password hashing
dotnet add package BCrypt.Net-Next

# Add configuration for appsettings
dotnet add package Microsoft.Extensions.Configuration.UserSecrets

# Logging (Serilog)
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File

# CORS support (built-in but ensuring it's available)
# Already included in ASP.NET Core 9

# Validation
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions

# LINQ support for Dapper
dotnet add package Dapper.Contrib
```

## 🎨 Frontend Project Creation

### Step 1: Create the Angular 20 Project

```powershell
cd frontend

# Create a new Angular project with strict mode and routing
ng new project-tracker --strict --routing --style=css --package-manager=npm --skip-git

# When prompted:
# - Would you like to add routing? YES (y)
# - Which stylesheet format would you like to use? CSS
```

### Step 2: Verify the Frontend Builds

```powershell
cd frontend\project-tracker

# Install dependencies
npm install

# Verify build
ng build

# You should see: ✔ Built successfully.
```

### Step 3: Add Required Angular Packages

```powershell
cd frontend\project-tracker

# Add Bootstrap CSS framework
npm install bootstrap

# Add FontAwesome for icons
npm install @fortawesome/fontawesome-free

# Add moment/date library (optional, for date formatting)
npm install moment

# Add file-saver for export functionality
npm install file-saver
npm install --save-dev @types/file-saver

# Add ng-excel for advanced Excel export
npm install ng-excel

# Add ngx-pagination if needed (though we'll build our own)
npm install ngx-pagination

# Add HttpClient (already included in Angular 20)
# Add Signals (already included in Angular 20)
# Add Reactive Forms (already included in Angular 20)
```

### Step 4: Update Angular Configuration

Update `angular.json` to include Bootstrap CSS:

In `angular.json`, locate the `"styles"` array and add Bootstrap:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "src/styles.css"
]
```

### Step 5: Configure Environment Variables

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001/api'
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.projecttracker.com/api'
};
```

## 🐳 Docker Setup

### Step 1: Verify Docker is Running

```powershell
# Start Docker Desktop and verify it's running
docker ps

# If Docker isn't running, start Docker Desktop from your applications menu
```

### Step 2: Test Docker Compose Configuration

```powershell
cd docker

# Verify the docker-compose.yml syntax
docker-compose config

# You should see the complete configuration without errors
```

### Step 3: Create .env File for Secrets

Create `docker/.env`:

```env
# SQL Server Configuration
SA_PASSWORD=YourPassword123!@#
ACCEPT_EULA=Y

# API Configuration
ASPNETCORE_ENVIRONMENT=Development
API_PORT=5001

# Frontend Configuration
FRONTEND_PORT=4200

# Database Configuration
SQL_PORT=1433
SQL_DATABASE=ProjectTrackerDb
```

⚠️ **Security Note**: Never commit `.env` to version control. Add it to `.gitignore`.

## 📊 Database Connection String

The Docker setup automatically configures the connection string for the database:

**Server**: `sqlserver` (from Docker network)
**Port**: `1433`
**Database**: `ProjectTrackerDb`
**Username**: `sa`
**Password**: `YourPassword123!@#` (from docker-compose.yml)

This will be configured in the backend's `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=sqlserver,1433;Database=ProjectTrackerDb;User Id=sa;Password=YourPassword123!@#;TrustServerCertificate=true;"
}
```

## 📝 Git Repository Setup

Initialize and configure Git for the entire project:

```powershell
# Navigate to project root
cd d:\Formazione\tutorial-angular-dotnet

# Initialize git (if not already done)
git init

# Create .gitignore file
# (See next section)

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial project setup: Angular 20 + .NET 9 + Docker"
```

### Create .gitignore

Create `.gitignore` in the project root:

```
# Backend
bin/
obj/
.vs/
.vscode/
*.user
*.suo
appsettings.local.json

# Frontend
node_modules/
dist/
.angular/
coverage/

# General
.DS_Store
.env
*.log
*.tmp
.idea/
*.swp

# Docker
.dockerignore
docker-compose.override.yml

# IDE
.vscode/
.idea/
*.code-workspace

# OS
Thumbs.db
.DS_Store
```

## ✅ Health Check: Verify Everything Works

### Step 1: Start Backend Only

```powershell
cd backend\ProjectTracker.API

# Run the backend
dotnet run

# You should see:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: https://localhost:5001
# info: Microsoft.Hosting.Lifetime[0]
#       Application started. Press Ctrl+C to stop.
```

Open browser: `https://localhost:5001/swagger` (once Swagger is configured)

Press `Ctrl+C` to stop.

### Step 2: Start Frontend Only

```powershell
cd frontend\project-tracker

# Run the frontend
ng serve

# You should see:
# ✔ Compiled successfully. / Failed to compile.
# ⠙ Building...
# ✔ Open http://localhost:4200/
```

Open browser: `http://localhost:4200`

Press `Ctrl+C` to stop.

### Step 3: Start with Docker (Optional)

If you want to verify Docker setup:

```powershell
cd docker

# Start all services (this may take a few minutes on first run)
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# Verify SQL Server is healthy
docker exec projecttracker_sqlserver sqlcmd -S localhost -U sa -P "YourPassword123!@#" -Q "SELECT @@VERSION"

# Stop services
docker-compose down
```

## 🎯 Checkpoint

You should now have:

- ✅ .NET 9 SDK installed
- ✅ Visual Studio 2022 configured
- ✅ Node.js 20+ and npm installed
- ✅ Docker Desktop running
- ✅ Angular CLI installed
- ✅ Git configured
- ✅ Project folder structure created
- ✅ Backend project scaffolded
- ✅ Frontend project scaffolded
- ✅ Docker configuration in place
- ✅ NuGet and npm packages installed
- ✅ Environment files created

## 🚀 Next Steps

Once you've completed this module:

1. Verify all tools work by running a quick test
2. Familiarize yourself with the project structure
3. Move to **Module 2: Project Architecture Overview**

This module covers the overall architecture decisions and folder organization.

## 📚 Additional Resources

- [.NET 9 Download](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- [Visual Studio 2022 Download](https://visualstudio.microsoft.com/downloads/)
- [Angular 20 CLI Documentation](https://angular.dev/cli)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

## 🆘 Troubleshooting

### Issue: .NET SDK not found
```powershell
# Verify installation
dotnet --list-sdks

# If not showing 9.x.x, reinstall from: https://dotnet.microsoft.com/en-us/download/dotnet/9.0
```

### Issue: Angular CLI not found
```powershell
# Reinstall globally
npm install -g @angular/cli@latest

# Verify
ng version
```

### Issue: Docker won't start
- Ensure Docker Desktop is installed
- Enable virtualization in BIOS (for Windows)
- Run Docker Desktop from Applications menu

### Issue: Port already in use
```powershell
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process
taskkill /PID <PID> /F
```

---

## ✨ You're All Set!

Your development environment is ready. Let's move to the next module to understand the architecture!

**Next: [Module 2: Project Architecture Overview](./02_architecture_overview.md)**
