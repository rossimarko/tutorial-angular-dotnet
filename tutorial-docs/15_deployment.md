# Module 14: Production Deployment & DevOps# Module 14: Containerization & Deployment



## 🎯 Objectives## 🎯 Objectives



By the end of this module, you will:- ✅ Docker container building

- ✅ Optimize Docker images for production- ✅ Docker Compose orchestration

- ✅ Configure environment-specific settings- ✅ Deployment strategies

- ✅ Set up Docker Compose for orchestration- ✅ Environment configuration

- ✅ Implement health checks and monitoring- ✅ Production considerations

- ✅ Configure CI/CD with GitHub Actions

- ✅ Deploy to Azure App Service## 📌 Status: Framework Ready

- ✅ Implement secret management

- ✅ Set up SSL/TLS certificatesDocker setup already in place from Module 1:

- ✅ Configure production logging

- ✅ Create deployment scripts### Verify & Complete:

- [ ] Dockerfile.api optimized

## 📋 What is DevOps & Deployment?- [ ] Dockerfile.frontend optimized

- [ ] docker-compose.yml configured

**DevOps** is the practice of combining development and operations to:- [ ] Environment variables set

- Automate software delivery- [ ] Health checks configured

- Improve deployment frequency- [ ] Logging to external service

- Achieve faster time to market

- Ensure reliable releases### Deployment Options:

- Enable continuous feedback- [ ] Local Docker testing

- [ ] Azure App Service

**Deployment** encompasses:- [ ] Docker Hub Registry

- **Containerization**: Package apps with dependencies- [ ] Kubernetes basics

- **Orchestration**: Manage multi-container apps

- **CI/CD**: Automate build, test, deploy### Production Checklist:

- **Monitoring**: Track app health and performance- [ ] Environment-specific configs

- **Scaling**: Handle increased load- [ ] SSL/TLS certificates

- [ ] Secret management

---- [ ] Database backups

- [ ] Monitoring setup

## 🐳 Step 1: Optimized Production Dockerfile (Backend)- [ ] CI/CD pipeline (GitHub Actions)



Update file: `docker/Dockerfile.api`---



```dockerfile## 🐳 Quick Start with Docker

# Multi-stage build for .NET API

# Stage 1: Build```powershell

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS buildcd d:\Formazione\tutorial-angular-dotnet\docker

WORKDIR /src

# Start all services

# Copy solution and project filesdocker-compose up -d

COPY backend/ProjectTracker.API/ProjectTracker.API.csproj ./ProjectTracker.API/

COPY backend/backend.sln ./# Check status

docker-compose ps

# Restore dependencies (cached layer)

RUN dotnet restore ProjectTracker.API/ProjectTracker.API.csproj# View logs

docker-compose logs -f

# Copy source code

COPY backend/ProjectTracker.API/ ./ProjectTracker.API/# Stop services

docker-compose down

# Build application```

WORKDIR /src/ProjectTracker.API

RUN dotnet build ProjectTracker.API.csproj -c Release -o /app/build---



# Stage 2: Publish**Course Complete! 🎉**

FROM build AS publish

RUN dotnet publish ProjectTracker.API.csproj \You now have a fully functional Angular + .NET full-stack application!

    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Create non-root user for security
RUN adduser --disabled-password --gecos '' dotnetuser && \
    chown -R dotnetuser /app

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Copy published output
COPY --from=publish /app/publish .

# Set user
USER dotnetuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set environment
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Entry point
ENTRYPOINT ["dotnet", "ProjectTracker.API.dll"]
```

---

## 🎨 Step 2: Optimized Production Dockerfile (Frontend)

Update file: `docker/Dockerfile.frontend`

```dockerfile
# Multi-stage build for Angular frontend
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY frontend/project-tracker/package*.json ./

# Install dependencies (cached layer)
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY frontend/project-tracker/ ./

# Build for production
RUN npm run build -- --configuration=production

# Stage 2: Runtime with Nginx
FROM nginx:alpine AS final

# Remove default nginx config
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/dist/project-tracker/browser /usr/share/nginx/html

# Add non-root user
RUN adduser -D -H -u 1000 -s /sbin/nologin nginxuser && \
    chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/log/nginx && \
    chmod -R 755 /usr/share/nginx/html

# Create nginx pid directory
RUN mkdir -p /var/run/nginx && \
    chown -R nginxuser:nginxuser /var/run/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Run as non-root user
USER nginxuser

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

Create file: `docker/nginx.conf`

```nginx
user nginxuser;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    include /etc/nginx/conf.d/*.conf;
}
```

Create file: `docker/default.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Enable caching for static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Angular routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional, if same domain needed)
    location /api/ {
        proxy_pass http://api:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## 🔧 Step 3: Production Docker Compose

Update file: `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  # SQL Server Database
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: projecttracker-db
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${DB_SA_PASSWORD:-YourStrong@Passw0rd}
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    networks:
      - projecttracker-network
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost", "-U", "sa", "-P", "${DB_SA_PASSWORD:-YourStrong@Passw0rd}", "-Q", "SELECT 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  # .NET API
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    container_name: projecttracker-api
    environment:
      - ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-Production}
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=ProjectTracker;User Id=sa;Password=${DB_SA_PASSWORD:-YourStrong@Passw0rd};TrustServerCertificate=True;
      - JwtSettings__SecretKey=${JWT_SECRET_KEY:-your-very-secure-secret-key-change-in-production}
      - JwtSettings__Issuer=ProjectTrackerAPI
      - JwtSettings__Audience=ProjectTrackerClient
      - JwtSettings__AccessTokenExpirationMinutes=60
      - JwtSettings__RefreshTokenExpirationDays=7
      - ASPNETCORE_URLS=http://+:8080
    ports:
      - "5000:8080"
    depends_on:
      sqlserver:
        condition: service_healthy
    networks:
      - projecttracker-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    restart: unless-stopped
    volumes:
      - api_logs:/app/logs

  # Angular Frontend
  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.frontend
    container_name: projecttracker-frontend
    ports:
      - "4200:80"
    depends_on:
      - api
    networks:
      - projecttracker-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    restart: unless-stopped
    environment:
      - API_URL=http://api:8080

networks:
  projecttracker-network:
    driver: bridge

volumes:
  sqlserver_data:
    driver: local
  api_logs:
    driver: local
```

Create file: `docker/.env.example`

```env
# Database Configuration
DB_SA_PASSWORD=YourStrong@Passw0rd

# API Configuration
ASPNETCORE_ENVIRONMENT=Production
JWT_SECRET_KEY=your-very-secure-secret-key-change-in-production-minimum-32-characters

# Frontend Configuration
API_URL=http://localhost:5000

# Optional: External Services
# SENTRY_DSN=
# APP_INSIGHTS_KEY=
```

---

## 🔐 Step 4: Environment Configuration

Create file: `backend/ProjectTracker.API/appsettings.Production.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "JwtSettings": {
    "SecretKey": "",
    "Issuer": "ProjectTrackerAPI",
    "Audience": "ProjectTrackerClient",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Cors": {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ]
  }
}
```

Create file: `frontend/project-tracker/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  appVersion: '1.0.0',
  enableDebug: false,
  logLevel: 'error',
  cacheTimeout: 300000, // 5 minutes
};
```

---

## 🚀 Step 5: CI/CD with GitHub Actions

Create file: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master ]

env:
  DOTNET_VERSION: '9.0.x'
  NODE_VERSION: '20.x'

jobs:
  # Backend Tests
  backend-test:
    name: Backend Build & Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore backend/ProjectTracker.API/ProjectTracker.API.csproj

      - name: Build
        run: dotnet build backend/ProjectTracker.API/ProjectTracker.API.csproj --configuration Release --no-restore

      - name: Run tests
        run: dotnet test backend/ProjectTracker.API.Tests/ProjectTracker.API.Tests.csproj --no-restore --verbosity normal

  # Frontend Tests
  frontend-test:
    name: Frontend Build & Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/project-tracker/package-lock.json

      - name: Install dependencies
        working-directory: frontend/project-tracker
        run: npm ci

      - name: Lint
        working-directory: frontend/project-tracker
        run: npm run lint

      - name: Build
        working-directory: frontend/project-tracker
        run: npm run build -- --configuration=production

      - name: Run tests
        working-directory: frontend/project-tracker
        run: npm run test -- --watch=false --browsers=ChromeHeadless

  # Docker Build
  docker-build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/Dockerfile.api
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/projecttracker-api:latest
            ${{ secrets.DOCKER_USERNAME }}/projecttracker-api:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/projecttracker-api:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/projecttracker-api:buildcache,mode=max

      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/Dockerfile.frontend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/projecttracker-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/projecttracker-frontend:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/projecttracker-frontend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/projecttracker-frontend:buildcache,mode=max

  # Deploy to Azure (Optional)
  deploy-azure:
    name: Deploy to Azure
    runs-on: ubuntu-latest
    needs: docker-build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy API to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: projecttracker-api
          images: ${{ secrets.DOCKER_USERNAME }}/projecttracker-api:${{ github.sha }}

      - name: Deploy Frontend to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: projecttracker-frontend
          images: ${{ secrets.DOCKER_USERNAME }}/projecttracker-frontend:${{ github.sha }}
```

---

## 📜 Step 6: Deployment Scripts

Create file: `scripts/deploy-local.ps1`

```powershell
# Local deployment script for Windows
param(
    [switch]$Clean,
    [switch]$Build,
    [switch]$Up
)

$ErrorActionPreference = "Stop"

Write-Host "ProjectTracker - Local Deployment" -ForegroundColor Cyan

# Navigate to docker directory
Set-Location "$PSScriptRoot\..\docker"

# Clean containers and volumes
if ($Clean) {
    Write-Host "Cleaning up containers and volumes..." -ForegroundColor Yellow
    docker-compose down -v
    docker system prune -f
}

# Build images
if ($Build) {
    Write-Host "Building Docker images..." -ForegroundColor Yellow
    docker-compose build --no-cache
}

# Start services
if ($Up) {
    Write-Host "Starting services..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Check service status
    docker-compose ps
    
    Write-Host "`nApplication URLs:" -ForegroundColor Green
    Write-Host "  Frontend: http://localhost:4200" -ForegroundColor White
    Write-Host "  API:      http://localhost:5000" -ForegroundColor White
    Write-Host "  API Docs: http://localhost:5000/swagger" -ForegroundColor White
    Write-Host "  Database: localhost:1433" -ForegroundColor White
}

if (-not $Clean -and -not $Build -and -not $Up) {
    Write-Host "Usage: .\deploy-local.ps1 [-Clean] [-Build] [-Up]" -ForegroundColor Yellow
    Write-Host "  -Clean: Remove all containers and volumes"
    Write-Host "  -Build: Build Docker images"
    Write-Host "  -Up:    Start all services"
}
```

Create file: `scripts/deploy-local.sh`

```bash
#!/bin/bash

# Local deployment script for Linux/Mac
set -e

echo "ProjectTracker - Local Deployment"

# Navigate to docker directory
cd "$(dirname "$0")/../docker"

# Parse arguments
CLEAN=false
BUILD=false
UP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean) CLEAN=true; shift ;;
        --build) BUILD=true; shift ;;
        --up) UP=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Clean containers and volumes
if [ "$CLEAN" = true ]; then
    echo "Cleaning up containers and volumes..."
    docker-compose down -v
    docker system prune -f
fi

# Build images
if [ "$BUILD" = true ]; then
    echo "Building Docker images..."
    docker-compose build --no-cache
fi

# Start services
if [ "$UP" = true ]; then
    echo "Starting services..."
    docker-compose up -d
    
    echo "Waiting for services to be healthy..."
    sleep 10
    
    # Check service status
    docker-compose ps
    
    echo ""
    echo "Application URLs:"
    echo "  Frontend: http://localhost:4200"
    echo "  API:      http://localhost:5000"
    echo "  API Docs: http://localhost:5000/swagger"
    echo "  Database: localhost:1433"
fi

if [ "$CLEAN" = false ] && [ "$BUILD" = false ] && [ "$UP" = false ]; then
    echo "Usage: ./deploy-local.sh [--clean] [--build] [--up]"
    echo "  --clean: Remove all containers and volumes"
    echo "  --build: Build Docker images"
    echo "  --up:    Start all services"
fi
```

Make script executable:

```bash
chmod +x scripts/deploy-local.sh
```

---

## 🔍 Step 7: Health Checks

Update file: `backend/ProjectTracker.API/Controllers/HealthController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace ProjectTracker.API.Controllers;

/// <summary>
/// Health check controller
/// </summary>
[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<HealthController> _logger;

    public HealthController(IConfiguration configuration, ILogger<HealthController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Basic health check
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
        });
    }

    /// <summary>
    /// Detailed health check including dependencies
    /// </summary>
    [HttpGet("detailed")]
    public async Task<IActionResult> GetDetailed()
    {
        var health = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            checks = new
            {
                database = await CheckDatabaseAsync(),
                memory = CheckMemory(),
                uptime = GetUptime()
            }
        };

        return Ok(health);
    }

    private async Task<object> CheckDatabaseAsync()
    {
        try
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            return new { status = "Healthy", message = "Database connection successful" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return new { status = "Unhealthy", message = ex.Message };
        }
    }

    private object CheckMemory()
    {
        var workingSet = Environment.WorkingSet / 1024 / 1024; // MB
        return new
        {
            status = workingSet < 500 ? "Healthy" : "Warning",
            workingSetMB = workingSet,
            gcTotalMemoryMB = GC.GetTotalMemory(false) / 1024 / 1024
        };
    }

    private object GetUptime()
    {
        var uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime();
        return new
        {
            days = uptime.Days,
            hours = uptime.Hours,
            minutes = uptime.Minutes
        };
    }
}
```

---

## 📊 Step 8: Production Checklist

Create file: `DEPLOYMENT_CHECKLIST.md`

```markdown
# Production Deployment Checklist

## Pre-Deployment

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT secret key (minimum 32 characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domains only
- [ ] Review and minimize exposed ports
- [ ] Enable SQL Server authentication
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Review security headers

### Configuration
- [ ] Update appsettings.Production.json
- [ ] Set environment variables in hosting platform
- [ ] Configure production database connection
- [ ] Set up environment.prod.ts with production API URL
- [ ] Configure logging levels (reduce verbosity)
- [ ] Set up external logging service (Application Insights, Sentry)
- [ ] Configure email service (if applicable)
- [ ] Set up CDN for static assets

### Database
- [ ] Run database migrations
- [ ] Set up automated backups
- [ ] Configure backup retention policy
- [ ] Test database restore procedure
- [ ] Set up database monitoring
- [ ] Configure database connection pooling
- [ ] Review and optimize indexes

### Performance
- [ ] Enable response compression (gzip/brotli)
- [ ] Configure response caching
- [ ] Set up CDN
- [ ] Optimize Docker images (multi-stage builds)
- [ ] Enable HTTP/2
- [ ] Minify and bundle assets
- [ ] Configure browser caching headers

### Monitoring
- [ ] Set up application monitoring (Azure Monitor, New Relic)
- [ ] Configure error tracking (Sentry, Raygun)
- [ ] Set up log aggregation (ELK, Azure Monitor Logs)
- [ ] Configure uptime monitoring (Pingdom, UptimeRobot)
- [ ] Set up alerts for critical errors
- [ ] Configure performance monitoring
- [ ] Set up SSL certificate expiration alerts

### Testing
- [ ] Run full integration tests
- [ ] Perform load testing
- [ ] Security scan (OWASP ZAP, SonarQube)
- [ ] Vulnerability scan
- [ ] Test backup and restore
- [ ] Verify health checks
- [ ] Test rollback procedure

## Deployment

- [ ] Tag release in Git
- [ ] Build Docker images
- [ ] Push images to registry
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify all services are running
- [ ] Check health endpoints
- [ ] Monitor logs for errors
- [ ] Verify SSL certificate

## Post-Deployment

- [ ] Monitor application performance
- [ ] Check error rates
- [ ] Verify database connections
- [ ] Test critical user flows
- [ ] Monitor resource usage (CPU, memory, disk)
- [ ] Check response times
- [ ] Verify backup jobs
- [ ] Update documentation
- [ ] Notify stakeholders

## Rollback Plan

- [ ] Document rollback procedure
- [ ] Keep previous Docker images tagged
- [ ] Test rollback in staging
- [ ] Define rollback triggers
- [ ] Assign rollback decision maker
```

---

## ✅ Summary

### **What We Built:**

1. ✅ **Optimized Docker Images**
   - Multi-stage builds for minimal image size
   - Non-root user execution for security
   - Health checks for container orchestration
   - Layer caching for faster builds

2. ✅ **Production Configuration**
   - Environment-specific settings
   - Secret management with environment variables
   - CORS configuration
   - Production logging levels

3. ✅ **Nginx Configuration**
   - Gzip compression
   - Security headers
   - Static asset caching
   - Angular routing support
   - API reverse proxy

4. ✅ **Docker Compose Orchestration**
   - Multi-service setup (DB, API, Frontend)
   - Health check dependencies
   - Network isolation
   - Volume persistence
   - Auto-restart policies

5. ✅ **CI/CD Pipeline**
   - Automated testing (backend & frontend)
   - Docker image building
   - Docker Hub publishing
   - Azure deployment
   - Versioning with Git SHA

6. ✅ **Deployment Scripts**
   - PowerShell for Windows
   - Bash for Linux/Mac
   - Clean, build, and deploy options
   - Service status checking

7. ✅ **Health Monitoring**
   - Basic health endpoint
   - Detailed health with dependencies
   - Database connectivity check
   - Memory usage monitoring
   - Uptime tracking

### **Production Best Practices:**
- ✅ Multi-stage Docker builds (70% smaller images)
- ✅ Non-root container users
- ✅ Health checks for orchestration
- ✅ Secret management via environment
- ✅ Nginx for static file serving
- ✅ Gzip compression enabled
- ✅ Security headers configured
- ✅ Automated CI/CD pipeline
- ✅ Comprehensive deployment checklist

### **Deployment Options:**

**Local Development:**
```powershell
.\scripts\deploy-local.ps1 -Clean -Build -Up
```

**Docker Compose:**
```bash
cd docker
docker-compose up -d
```

**GitHub Actions:**
- Automatic on push to main/master
- Build, test, deploy workflow

**Azure App Service:**
- Container-based deployment
- Auto-scaling support
- Integrated monitoring

### **Next Steps:**
1. Set up monitoring (Application Insights, Sentry)
2. Configure CDN for static assets
3. Implement blue-green deployment
4. Set up Kubernetes for advanced orchestration
5. Configure auto-scaling policies
6. Implement disaster recovery plan

---

## 🎉 Course Complete!

Congratulations! You've built a production-ready full-stack application with:
- ✅ Angular 20 frontend with modern patterns
- ✅ .NET 9 backend API
- ✅ SQL Server database
- ✅ JWT authentication
- ✅ Internationalization
- ✅ Responsive UI with Bootstrap 5
- ✅ Dark mode support
- ✅ Pagination and filtering
- ✅ CRUD operations
- ✅ Error handling and logging
- ✅ Performance optimization
- ✅ Docker containerization
- ✅ CI/CD pipeline

**You're now ready to deploy to production!** 🚀
