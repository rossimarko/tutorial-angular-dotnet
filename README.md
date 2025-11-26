# Full-Stack Tutorial: Angular 20 + .NET 9 CRUD Application

Welcome to a comprehensive tutorial on building modern web applications! This course guides you through creating a production-ready CRUD application with **Angular 20** (frontend) and **.NET 9** (backend API), complete with authentication, multi-language support, and advanced data handling.

## 📚 Course Overview

This tutorial is designed for **ASP.NET Framework 4.8 developers** transitioning to modern cloud-native architecture. You'll learn how to leverage the latest technologies while understanding the "why" behind each decision.

### 🎯 What You'll Build

A complete **Project Tracker** application with:
- ✅ User authentication with JWT tokens
- ✅ Multi-language support (Italian & English)
- ✅ Advanced list views with search and filtering
- ✅ **Dual pagination**: Legacy (page-based) and Modern (infinite scroll)
- ✅ Data export to Excel/CSV
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Responsive design with Bootstrap 5
- ✅ Docker containerization from the start
- ✅ SQL Server database with Dapper ORM

## 📁 Project Structure

```
tutorial-angular-dotnet/
├── backend/
│   └── ProjectTracker.API/          # ASP.NET Core 9 Web API
│       ├── Controllers/
│       ├── Services/
│       ├── Data/
│       ├── Models/
│       └── Program.cs
├── frontend/
│   └── project-tracker/              # Angular 20 Application
│       ├── src/
│       │   ├── app/
│       │   ├── assets/
│       │   └── styles/
│       └── angular.json
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   └── Dockerfile.frontend
├── tutorial-docs/                    # Lesson documentation
│   ├── 01_environment_setup.md
│   ├── 02_architecture_overview.md
│   ├── ...
│   └── 14_deployment.md
└── README.md (this file)
```

## 🚀 Quick Start

### Prerequisites
- **Visual Studio 2026** (Community, Professional, or Enterprise)
- **.NET 10 SDK** installed
- **Node.js 20+** and **npm**
- **Docker Desktop** running
- **Git** for version control

### 1. Clone and Setup

```powershell
# Navigate to the project directory
cd d:\Formazione\tutorial-angular-dotnet

# Start Docker containers
docker-compose -f docker/docker-compose.yml up -d
```

### 2. Backend Setup

```powershell
cd backend/ProjectTracker.API
dotnet restore
dotnet ef database update
dotnet run
```

API will be available at: `https://localhost:5001`

### 3. Frontend Setup

```powershell
cd frontend/project-tracker
npm install
ng serve
```

Frontend will be available at: `http://localhost:4200`

## 📖 Course Modules

### Phase 1: Foundation & Setup
- **Module 1**: Environment Setup & Project Scaffolding
- **Module 2**: Project Architecture Overview

### Phase 2: Backend Foundation (.NET 10)
- **Module 3**: ASP.NET Core 10 API Project Setup
- **Module 4**: SQL Server with Dapper Data Access
- **Module 5**: Authentication & Authorization - JWT Tokens

### Phase 3: Frontend Foundation (Angular 21)
- **Module 6**: Angular 21 Project Setup with Modern Patterns
- **Module 7**: Internationalization (i18n) - Italian & English
- **Module 8**: Authentication UI & Guards

### Phase 4: Core CRUD Features
- **Module 9**: List View with Search & Filtering
- **Module 10**: Pagination & Data Export (both types!)
- **Module 11**: Add, Edit & Delete Operations

### Phase 5: Advanced Features
- **Module 12**: UI/UX with Bootstrap 5
- **Module 13**: Logging, Error Handling & Performance

### Phase 6: Deployment & DevOps
- **Module 14**: Containerization & Deployment

## 🛠 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Angular | 21+ |
| **State Management** | Signals | Built-in |
| **Styling** | Bootstrap | 5+ |
| **Backend** | ASP.NET Core | 10 |
| **API Pattern** | Minimal APIs | - |
| **Data Access** | Dapper ORM | Latest |
| **Database** | SQL Server | 2025+ |
| **Container** | Docker Compose | Latest |
| **Authentication** | JWT Bearer | RFC 7519 |
| **Localization** | Angular i18n | 21+ |

## 🎓 Key Learning Outcomes

By completing this tutorial, you'll understand:

### Backend (.NET 10)
- Modern ASP.NET Core architecture
- Minimal APIs vs. traditional Controllers
- Dapper ORM for data access
- JWT-based authentication
- Dependency injection and middleware
- RESTful API design principles
- Database migrations and seeding
- Structured logging and error handling

### Frontend (Angular 21)
- Standalone components (no NgModules)
- Angular Signals for reactive state
- Modern control flow syntax (@if, @for)
- OnPush change detection strategy
- Dependency injection and services
- Reactive Forms for validation
- HTTP interceptors for authentication
- Internationalization implementation
- Advanced list UI patterns

### Full-Stack
- Authentication flows and security
- API-frontend integration
- Multi-language application design
- Docker containerization
- Development workflow best practices
- Performance optimization strategies

## 🔐 Security Considerations

This tutorial emphasizes security best practices:
- Password hashing with bcrypt
- JWT token validation
- CORS configuration
- HTTPS enforced in production
- Input validation and sanitization
- SQL injection prevention (Dapper + parameterized queries)

## 📚 Resources

### Official Documentation
- [Angular 21 Essentials](https://angular.dev/essentials)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [ASP.NET Core 10 Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- [Dapper Documentation](https://github.com/DapperLib/Dapper)
- [JWT.io](https://jwt.io/)

### Best Practice Guidelines
- `/docs/angular.instructions.md` - Angular coding standards
- `/docs/csharp.instructions.md` - C# coding standards
- `/docs/aspnet-rest-apis.instructions.md` - REST API best practices

## 🐳 Docker

For dev purpose create docker image for sql server and then run the projects!

```powershell
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 --name tutorial-angular -d microsoft/mssql-server:2025-latest
```

The project includes full Docker support from the beginning:

```powershell
# Start all services (SQL Server, API, Frontend)
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

**Services**:
- **SQL Server 2025**: Port 1433
- **API Backend**: Port 5001 (HTTPS)
- **Frontend App**: Port 4200

## 📝 Lesson Structure

Each lesson includes:
1. **Concepts**: Theoretical foundation
2. **Step-by-step Guide**: Implementation walkthrough
3. **Code Examples**: Complete, working code
4. **Best Practices**: How to write maintainable code
5. **Challenges**: Optional exercises
6. **Common Mistakes**: What to avoid

## 🚦 Getting Started

**Start with Module 1**: [Environment Setup & Project Scaffolding](./tutorial-docs/01_environment_setup.md)

Follow each module sequentially. Each builds upon the previous one, so don't skip ahead!

## 💡 Tips for Success

1. **Type along**: Don't copy-paste. Typing reinforces learning.
2. **Experiment**: Modify code and see what breaks.
3. **Read errors**: Error messages teach you how the framework works.
4. **Test everything**: Write tests as you go.
5. **Ask questions**: Use the code as reference and understand "why."

## 🐛 Troubleshooting

### Common Issues

**Q: Docker SQL Server won't start**
- Ensure Docker Desktop is running
- Check available disk space
- Try: `docker-compose down -v` and rebuild

**Q: API connection refused**
- Verify backend is running: `dotnet run` in backend directory
- Check CORS configuration
- Ensure port 5001 is not in use

**Q: Angular build fails**
- Clear node_modules: `rm -r node_modules && npm install`
- Ensure Node.js 20+ installed: `node --version`

**Q: Database migration errors**
- Verify SQL Server is running: `docker ps`
- Check connection string in appsettings.json
- Review migration files in `Data/Migrations`

## 📞 Support

For issues or questions:
1. Check the troubleshooting section in each module
2. Review official documentation links
3. Examine the code examples provided

## 📄 License

This tutorial is provided as educational material.

## 🎉 Ready to Start?

Let's build something amazing! Head to [Module 1: Environment Setup](./tutorial-docs/01_environment_setup.md)

---

**Happy coding! 🚀**

*Last updated: October 2025*
*Technologies: Angular 20, .NET 9, Docker, SQL Server*
