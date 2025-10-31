# Module 6: Angular 20 Project Setup with Modern Patterns

## 🎯 Objectives

- ✅ Understand standalone Angular components
- ✅ Learn Angular signals for state management
- ✅ Setup HTTP client for API calls
- ✅ Configure dependency injection
- ✅ Organize project folder structure
- ✅ Create reusable services

## 📌 Status: Framework Ready

This module covers:
- Creating Angular 20 with standalone components
- Signals for reactive state management
- HTTP client configuration
- Service architecture
- Environment setup

---

## 🎓 Beginner's Guide to Angular 20 Fundamentals

### What is Angular?
Angular is a **framework** for building web applications. Think of it as a set of pre-built tools and rules that help you organize your code and create interactive user interfaces that respond to user actions.

### What are Standalone Components?
In Angular 20, **standalone components** are the modern way to build applications. They don't require `NgModules`, making them simpler and easier to understand for beginners.

### What are Signals?
**Signals** are a new way to manage state (data) in Angular. Instead of complex reactive programming, signals provide a simple way to track changes and automatically update your UI when data changes.

---

## 🚀 Understanding Key Concepts

### 1️⃣ Standalone Components

A **component** is a piece of your UI with its own logic and styling. A standalone component can work independently without modules.

#### Basic Component Structure

Each component consists of **3 files**:

| File | Purpose |
|------|---------|
| `name.component.ts` | Logic (TypeScript) |
| `name.component.html` | Template (HTML) |
| `name.component.css` | Styling (CSS) |

#### Simple Component Example

Let's create a simple counter component:

**`counter.component.ts`** (Logic with inline template using Bootstrap):
```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div class="d-flex flex-column align-items-center gap-3 p-4 border rounded">
      <h2>Counter: {{ count() }}</h2>
      <button class="btn btn-primary" (click)="increment()">Increment</button>
      <button class="btn btn-danger" (click)="decrement()">Decrement</button>
    </div>
  `
})
export class CounterComponent {
  // Create a signal to store the count
  protected readonly count = signal(0);

  increment() {
    this.count.update(current => current + 1);
  }

  decrement() {
    this.count.update(current => current - 1);
  }
}
```

📝 **Note**: For simple components with Bootstrap styling, we use inline `template` instead of separate files. Bootstrap utility classes handle all styling, so no CSS file is needed!

#### How It Works:
- `signal(0)` creates a **signal** with initial value `0`
- `count()` **reads** the signal value in the template
- `count.update()` **updates** the signal value
- When the signal updates, Angular automatically updates the view

---

### 2️⃣ Signals - State Management

Signals are the new way to manage state in Angular 20.

#### Signal Operations

**Creating a Signal:**
```typescript
// Import signal from @angular/core
import { signal } from '@angular/core';

// Create a signal with an initial value
protected readonly name = signal('John');
protected readonly age = signal(25);
protected readonly isActive = signal(true);
```

**Reading a Signal:**
```html
<!-- In templates, call the signal like a function -->
<p>Name: {{ name() }}</p>
<p>Age: {{ age() }}</p>
```

**Updating a Signal:**
```typescript
// Option 1: Set to a new value
this.name.set('Jane');

// Option 2: Update based on current value
this.age.update(current => current + 1);
```

**Computed Signals (Derived State):**
```typescript
import { computed, signal } from '@angular/core';

export class UserComponent {
  protected readonly firstName = signal('John');
  protected readonly lastName = signal('Doe');
  
  // Computed signals automatically update when their dependencies change
  protected readonly fullName = computed(() => 
    `${this.firstName()} ${this.lastName()}`
  );
}
```

In template:
```html
<p>Full Name: {{ fullName() }}</p>
```

#### Signal Effects (Side Effects)

Effects let you run code when a signal changes:

```typescript
import { effect, signal } from '@angular/core';

export class LoggerComponent {
  protected readonly count = signal(0);

  constructor() {
    // This effect runs every time count changes
    effect(() => {
      console.log(`Count changed to: ${this.count()}`);
    });
  }
}
```

---

### 3️⃣ HTTP Client Setup

The HTTP Client allows your Angular app to communicate with your backend API.

#### Step 1: Import HTTP Client in Configuration

**`app.config.ts`** (Configure your app):
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/platform-browser/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()  // ← Add HTTP client
  ]
};
```

#### Step 2: Create a Data Service

Create a service to fetch data from your API:

**`services/project.service.ts`**:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

// Define the shape of your data
interface Project {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'  // Make this service available everywhere
})
export class ProjectService {
  // Store projects in a signal
  protected readonly projects = signal<Project[]>([]);

  constructor(private http: HttpClient) {}

  // Fetch all projects from API
  loadProjects() {
    this.http
      .get<Project[]>('http://localhost:5001/api/projects')
      .subscribe(data => {
        this.projects.set(data);
      });
  }

  // Get projects as signal (read-only)
  getProjects() {
    return this.projects.asReadonly();
  }
}
```

#### Step 3: Use the Service in a Component

**`components/project-list.component.ts`**:
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../services/project.service';

interface Project {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-project-list',
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  projects$ = this.projectService.getProjects();

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    // Load projects when component initializes
    this.projectService.loadProjects();
  }
}
```

**`components/project-list.component.html`**:
```html
<div class="projects-container">
  <h2>Projects</h2>
  
  @if ((projects$()) && (projects$().length > 0)) {
    <ul>
      @for (project of projects$(); track project.id) {
        <li>
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
        </li>
      }
    </ul>
  } @else {
    <p>No projects found.</p>
  }
</div>
```

---

### 4️⃣ Dependency Injection

Dependency Injection (DI) is how Angular provides services to components.

#### The `inject()` Function (Recommended for Beginners)

Instead of constructor injection, use the `inject()` function:

```typescript
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-example',
  template: `<p>Using injected service</p>`
})
export class ExampleComponent {
  // Inject the service
  private projectService = inject(ProjectService);

  loadData() {
    this.projectService.loadProjects();
  }
}
```

#### Creating Singleton Services

Services should be created only once and shared across your app:

```typescript
@Injectable({
  providedIn: 'root'  // ← Makes it a singleton available everywhere
})
export class MyService {
  // Service code here
}
```

---

### 5️⃣ Project Folder Structure

Organize your Angular project like this:

```
src/
├── app/
│   ├── app.ts                    # Root component
│   ├── app.config.ts             # App configuration
│   ├── app.routes.ts             # Routes definition
│   ├── app.html                  # Root template
│   ├── app.css                   # Root styles
│   │
│   ├── features/                 # Feature modules (organized by feature)
│   │   ├── projects/             # Projects feature
│   │   │   ├── components/
│   │   │   │   ├── project-list.component.ts
│   │   │   │   ├── project-list.component.html
│   │   │   │   ├── project-list.component.css
│   │   │   │   ├── project-detail.component.ts
│   │   │   │   ├── project-detail.component.html
│   │   │   │   └── project-detail.component.css
│   │   │   ├── services/
│   │   │   │   └── project.service.ts
│   │   │   └── routes.ts
│   │   │
│   │   └── auth/                 # Auth feature
│   │       ├── components/
│   │       │   ├── login.component.ts
│   │       │   ├── login.component.html
│   │       │   └── login.component.css
│   │       ├── services/
│   │       │   └── auth.service.ts
│   │       └── routes.ts
│   │
│   ├── shared/                   # Shared code (used everywhere)
│   │   ├── components/
│   │   │   ├── navbar.component.ts
│   │   │   ├── navbar.component.html
│   │   │   └── navbar.component.css
│   │   ├── services/
│   │   │   └── http.service.ts
│   │   ├── models/
│   │   │   └── api.models.ts
│   │   └── pipes/
│   │       └── format-date.pipe.ts
│   │
│   └── layouts/                  # Layout components
│       ├── main-layout.component.ts
│       ├── main-layout.component.html
│       └── main-layout.component.css
│
├── styles.css                    # Global styles
├── main.ts                       # Application entry point
└── environments/                 # Environment configurations
    ├── environment.ts
    └── environment.prod.ts
```

---

## 💡 Practical Example: Building a Simple Project Tracker

Let's create a complete example that uses all these concepts:

### Step 1: Define Your Models

**`shared/models/project.model.ts`**:
```typescript
export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdDate: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}
```

### Step 2: Create the Project Service

**`features/projects/services/project.service.ts`**:
```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project, CreateProjectRequest } from '../../../shared/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = 'http://localhost:5001/api/projects';
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  // Expose as readonly signals
  readonly projects$ = this.projects.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  constructor(private http: HttpClient) {}

  // Load all projects
  loadProjects() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Project[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
        console.error('Error loading projects:', err);
      }
    });
  }

  // Create a new project
  createProject(request: CreateProjectRequest) {
    return this.http.post<Project>(this.apiUrl, request);
  }

  // Get a single project
  getProject(id: number) {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // Delete a project
  deleteProject(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

### Step 3: Create a List Component

**`features/projects/components/project-list.component.ts`**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="mb-4">My Projects</h2>

      @if (loading()) {
        <div class="alert alert-info" role="alert">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Loading projects...
        </div>
      } @else if (error()) {
        <div class="alert alert-danger" role="alert">
          {{ error() }}
        </div>
      } @else {
        @if ((projects() && projects().length > 0)) {
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (project of projects(); track project.id) {
                  <tr>
                    <td class="fw-bold">{{ project.name }}</td>
                    <td>{{ project.description }}</td>
                    <td>
                      <span 
                        class="badge"
                        [ngClass]="{
                          'bg-success': project.status === 'Active',
                          'bg-info': project.status === 'Completed',
                          'bg-warning': project.status === 'On Hold'
                        }">
                        {{ project.status }}
                      </span>
                    </td>
                    <td>{{ project.createdDate | date: 'short' }}</td>
                    <td>
                      <button 
                        (click)="deleteProject(project.id)" 
                        class="btn btn-sm btn-outline-danger">
                        <i class="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="alert alert-secondary" role="alert">
            <i class="fas fa-info-circle me-2"></i>
            No projects yet. Create one to get started!
          </div>
        }
      }
    </div>
  `
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);

  // Expose signals from service
  protected readonly projects = this.projectService.projects$;
  protected readonly loading = this.projectService.loading$;
  protected readonly error = this.projectService.error$;

  ngOnInit() {
    this.projectService.loadProjects();
  }

  deleteProject(id: number) {
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        // Reload projects after deletion
        this.projectService.loadProjects();
      },
      error: (err) => {
        console.error('Error deleting project:', err);
      }
    });
  }
}
```

📝 **Note**: We use inline `template` with Bootstrap classes. No separate CSS file needed!



---

## 🛠️ Step-by-Step Setup Instructions

### Prerequisites
- Node.js installed (download from [nodejs.org](https://nodejs.org))
- VS Code or your favorite code editor
- Angular CLI installed: `npm install -g @angular/cli@latest`

### Setup Steps

1. **Navigate to the frontend folder**
   ```bash
   cd frontend/project-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will be available at: `http://localhost:4200`

4. **Create your first component** (in VS Code terminal)
   ```bash
   ng generate component features/projects/components/project-list
   ```

5. **Add the component to your app routes** in `app.routes.ts`:
   ```typescript
   import { Routes } from '@angular/router';
   import { ProjectListComponent } from './features/projects/components/project-list/project-list.component';

   export const routes: Routes = [
     {
       path: 'projects',
       component: ProjectListComponent
     },
     {
       path: '',
       redirectTo: 'projects',
       pathMatch: 'full'
     }
   ];
   ```

---

## ✅ Checklist: What You Should Know

- [ ] I understand what standalone components are
- [ ] I know how to create signals and update them
- [ ] I can create computed signals for derived state
- [ ] I understand how to import and use HTTP Client
- [ ] I can create a service to fetch data from an API
- [ ] I know how to use `inject()` for dependency injection
- [ ] I understand the project folder structure
- [ ] I can use `@if`, `@for` in templates instead of `*ngIf`, `*ngFor`
- [ ] I can run the Angular development server
- [ ] I understand the difference between components, services, and models

---

## 📚 Key Learning Points

| Concept | Purpose | When to Use |
|---------|---------|------------|
| **Signal** | Store state (data) | When you need data to change and update the UI |
| **Computed Signal** | Derive state from other signals | When data depends on other signals |
| **Effect** | Run code when signals change | For side effects like logging or API calls |
| **Service** | Share logic across components | For API calls, authentication, shared data |
| **Component** | UI with logic | For displaying and interacting with UI |
| **HTTP Client** | Make API calls | To communicate with your backend |

---

**Ready to build? Move to [Module 7: Internationalization](./07_angular_i18n.md)**
