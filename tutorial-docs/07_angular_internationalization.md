# Module 7: Internationalization (i18n) - Italian & English

## 🎯 Objectives

By the end of this module, you will:
- ✅ Setup server-based i18n with lazy-loaded translations
- ✅ Create a C# API for translations management
- ✅ Build a Translation Service using Angular signals
- ✅ Implement language switching with user preferences
- ✅ Create locale-specific formatting pipes
- ✅ Build a language selector component
- ✅ Handle fallback languages and missing translations

---

## 📋 What is Internationalization (i18n)?

**Internationalization (i18n)** is the process of designing your application to support multiple languages and regional formats without code changes.

### Why i18n Matters:
- **Global Reach**: Serve users in their native language
- **User Experience**: Better engagement with localized content
- **Professional**: Shows attention to detail and user needs
- **Market Expansion**: Easier to enter new markets

### Our Approach:
- **Backend**: .NET 9 API serving translations from JSON resource files
- **Frontend**: Angular 20 with lazy-loaded translations using signals
- **Languages**: English (en-US) and Italian (it-IT)
- **Storage**: Server-side JSON files with client-side caching

---

## 💡 Why Server-Based Instead of Angular's Built-in i18n?

Angular has two main approaches to internationalization:

### 1. **Angular's Built-in i18n** (Compile-time with `@angular/localize`)
**How it works:**
- Uses Angular's native `i18n` attribute in templates
- Extracts translations at build time
- Requires separate builds for each language
- Results in separate bundles per locale

**Pros:**
- ✅ Better runtime performance (no API calls)
- ✅ Works offline
- ✅ Native Angular integration
- ✅ Type-safe at compile time

**Cons:**
- ❌ Requires rebuild and redeploy for translation updates
- ❌ Multiple build artifacts to manage
- ❌ Not suitable for dynamic content
- ❌ Complex deployment for many languages

**Best for:**
- Static content that rarely changes
- Small to medium applications with few languages
- Apps where performance is critical

### 2. **Server-Based/Runtime i18n** (What we're implementing)
**How it works:**
- Translations stored in JSON resource files on the backend
- Loaded via REST API at runtime
- Single build serves all languages
- Translations can be updated without redeployment

**Pros:**
- ✅ Update translations without redeploying frontend
- ✅ Single build artifact for all languages
- ✅ Easy to add new languages dynamically
- ✅ Great for CMS or admin-managed content
- ✅ Demonstrates full-stack integration
- ✅ JSON files can be easily edited or managed by admin UI

**Cons:**
- ❌ Requires API call to load translations
- ❌ Slight delay on initial load
- ❌ Needs network connection

**Best for:**
- Applications with frequently updated content
- Multi-tenant applications
- Content management systems
- Enterprise applications with many languages
- **Learning full-stack development** (our case!)

### 3. **Hybrid Approach** (Enterprise Best Practice)
Many production Angular apps use both:
- **Built-in i18n** for static UI labels (buttons, menu items)
- **Server-based** for dynamic content (user-generated content, CMS)

### Why We Chose Server-Based for This Tutorial

This tutorial is designed for **.NET 4.8 WebForms developers** transitioning to modern web development. The server-based approach:

1. **Shows Full-Stack Integration**: Demonstrates how frontend and backend work together
2. **Familiar Pattern**: Similar to resource files in .NET, but modernized with JSON
3. **Real-World Scenario**: Many enterprise apps need dynamic translation management
4. **Complete Learning**: Covers file-based storage, API development, and Angular services
5. **Flexibility**: Easy to extend with admin UI to manage translations

### When to Use Which Approach?

| Scenario | Recommended Approach |
|----------|---------------------|
| Marketing website with static content | Built-in i18n |
| Small business app with 2-3 languages | Built-in i18n |
| E-commerce with product descriptions from DB | Server-based or Hybrid |
| SaaS platform with admin-managed content | Server-based or Hybrid |
| Enterprise app with 20+ languages | Server-based or Hybrid |
| Learning full-stack development | **Server-based** ✅ |

---

## 🗄️ Backend Implementation (C# / .NET 9)

### Step 1: Create Translation JSON Files

Instead of using database tables, we'll store translations in JSON resource files. This approach:
- ✅ Easier to manage and edit
- ✅ Version control friendly (Git tracks changes)
- ✅ No database migrations needed
- ✅ Simple to add new languages
- ✅ Future-proof for admin UI (just modify JSON files)

Create folder: `backend/ProjectTracker.API/Resources/Translations`

#### English Translations

Create file: `backend/ProjectTracker.API/Resources/Translations/en-US.json`

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "loading": "Loading...",
    "noData": "No data available",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "export": "Export",
    "import": "Import",
    "refresh": "Refresh",
    "actions": "Actions"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "register": "Register",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "firstName": "First Name",
    "lastName": "Last Name",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot password?",
    "loginSuccess": "Login successful",
    "loginError": "Invalid email or password",
    "registerSuccess": "Registration successful",
    "registerError": "Registration failed",
    "logoutSuccess": "Logged out successfully"
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email",
    "minLength": "Minimum {{min}} characters required",
    "maxLength": "Maximum {{max}} characters allowed",
    "passwordMismatch": "Passwords do not match",
    "invalidFormat": "Invalid format"
  },
  "projects": {
    "title": "Projects",
    "addProject": "Add Project",
    "editProject": "Edit Project",
    "deleteProject": "Delete Project",
    "projectName": "Project Name",
    "description": "Description",
    "status": "Status",
    "priority": "Priority",
    "startDate": "Start Date",
    "dueDate": "Due Date",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "deleteConfirm": "Are you sure you want to delete this project?",
    "createSuccess": "Project created successfully",
    "updateSuccess": "Project updated successfully",
    "deleteSuccess": "Project deleted successfully",
    "loadError": "Failed to load projects"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "projects": "Projects",
    "settings": "Settings",
    "profile": "Profile",
    "admin": "Admin"
  },
  "settings": {
    "language": "Language",
    "selectLanguage": "Select Language",
    "theme": "Theme",
    "notifications": "Notifications"
  }
}
```

#### Italian Translations

Create file: `backend/ProjectTracker.API/Resources/Translations/it-IT.json`

```json
{
  "common": {
    "save": "Salva",
    "cancel": "Annulla",
    "delete": "Elimina",
    "edit": "Modifica",
    "add": "Aggiungi",
    "search": "Cerca",
    "filter": "Filtra",
    "loading": "Caricamento...",
    "noData": "Nessun dato disponibile",
    "confirm": "Conferma",
    "yes": "Sì",
    "no": "No",
    "close": "Chiudi",
    "back": "Indietro",
    "next": "Avanti",
    "previous": "Precedente",
    "export": "Esporta",
    "import": "Importa",
    "refresh": "Aggiorna",
    "actions": "Azioni"
  },
  "auth": {
    "login": "Accedi",
    "logout": "Esci",
    "register": "Registrati",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Conferma Password",
    "firstName": "Nome",
    "lastName": "Cognome",
    "rememberMe": "Ricordami",
    "forgotPassword": "Password dimenticata?",
    "loginSuccess": "Accesso effettuato con successo",
    "loginError": "Email o password non validi",
    "registerSuccess": "Registrazione completata con successo",
    "registerError": "Registrazione fallita",
    "logoutSuccess": "Disconnessione effettuata con successo"
  },
  "validation": {
    "required": "Questo campo è obbligatorio",
    "email": "Inserire un indirizzo email valido",
    "minLength": "Minimo {{min}} caratteri richiesti",
    "maxLength": "Massimo {{max}} caratteri consentiti",
    "passwordMismatch": "Le password non corrispondono",
    "invalidFormat": "Formato non valido"
  },
  "projects": {
    "title": "Progetti",
    "addProject": "Aggiungi Progetto",
    "editProject": "Modifica Progetto",
    "deleteProject": "Elimina Progetto",
    "projectName": "Nome Progetto",
    "description": "Descrizione",
    "status": "Stato",
    "priority": "Priorità",
    "startDate": "Data Inizio",
    "dueDate": "Data Scadenza",
    "createdAt": "Creato il",
    "updatedAt": "Aggiornato il",
    "deleteConfirm": "Sei sicuro di voler eliminare questo progetto?",
    "createSuccess": "Progetto creato con successo",
    "updateSuccess": "Progetto aggiornato con successo",
    "deleteSuccess": "Progetto eliminato con successo",
    "loadError": "Errore nel caricamento dei progetti"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "projects": "Progetti",
    "settings": "Impostazioni",
    "profile": "Profilo",
    "admin": "Amministrazione"
  },
  "settings": {
    "language": "Lingua",
    "selectLanguage": "Seleziona Lingua",
    "theme": "Tema",
    "notifications": "Notifiche"
  }
}
```

#### Cultures Configuration

Create file: `backend/ProjectTracker.API/Resources/Translations/cultures.json`

```json
[
  {
    "code": "en-US",
    "name": "English",
    "isDefault": true
  },
  {
    "code": "it-IT",
    "name": "Italiano",
    "isDefault": false
  }
]
```

### Step 2: Configure JSON Files as Embedded Resources

Update `backend/ProjectTracker.API/ProjectTracker.API.csproj`:

```xml
<ItemGroup>
  <None Remove="Resources\Translations\*.json" />
  <EmbeddedResource Include="Resources\Translations\*.json" />
</ItemGroup>
```

Or, to have the files copied to the output directory (better for easy editing):

```xml
<ItemGroup>
  <None Update="Resources\Translations\*.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

### Step 3: Models & DTOs

Create file: `backend/ProjectTracker.API/Models/Common/Culture.cs`

```csharp
namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Represents a supported culture/language in the system
/// </summary>
public class Culture
{
    /// <summary>
    /// Culture code (e.g., 'en-US', 'it-IT')
    /// </summary>
    public required string Code { get; set; }
    
    /// <summary>
    /// Display name of the culture (e.g., 'English', 'Italiano')
    /// </summary>
    public required string Name { get; set; }
    
    /// <summary>
    /// Indicates if this is the default culture
    /// </summary>
    public bool IsDefault { get; set; }
}
```

Create file: `backend/ProjectTracker.API/Models/Responses/TranslationResponse.cs`

```csharp
namespace ProjectTracker.API.Models.Responses;

/// <summary>
/// Response model for culture information
/// </summary>
public class CultureResponse
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public bool IsDefault { get; set; }
}

/// <summary>
/// Response model containing all translations for a specific culture
/// </summary>
public class TranslationsResponse
{
    /// <summary>
    /// Culture code (e.g., 'en-US')
    /// </summary>
    public required string Culture { get; set; }
    
    /// <summary>
    /// Dictionary of translation key paths to values
    /// Organized as nested objects: { "common": { "save": "Save" } }
    /// </summary>
    public required Dictionary<string, object> Translations { get; set; }
}
```

### Step 3: Translation Repository

Create file: `backend/ProjectTracker.API/Data/Repositories/ITranslationRepository.cs`

```csharp
using ProjectTracker.API.Models.Common;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Repository interface for translation operations
/// </summary>
public interface ITranslationRepository
{
    /// <summary>
    /// Get all supported cultures
    /// </summary>
    Task<IEnumerable<Culture>> GetCulturesAsync();
    
    /// <summary>
    /// Get all translations for a specific culture
    /// </summary>
    /// <param name="cultureCode">Culture code (e.g., 'en-US')</param>
    /// <returns>Dictionary of translation key paths to values</returns>
    Task<Dictionary<string, object>> GetTranslationsAsync(string cultureCode);
    
    /// <summary>
    /// Get translations for a specific category and culture
    /// </summary>
    Task<Dictionary<string, object>> GetTranslationsByCategoryAsync(
        string cultureCode, 
        string category);
}
```

Create file: `backend/ProjectTracker.API/Data/Repositories/TranslationRepository.cs`

```csharp
using System.Text.Json;
using ProjectTracker.API.Models.Common;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Repository for translation data access from JSON files
/// </summary>
public class TranslationRepository(IWebHostEnvironment environment, ILogger<TranslationRepository> logger) 
    : ITranslationRepository
{
    private readonly IWebHostEnvironment _environment = environment;
    private readonly ILogger<TranslationRepository> _logger = logger;
    private readonly string _translationsPath = Path.Combine(
        environment.ContentRootPath, 
        "Resources", 
        "Translations");

    /// <summary>
    /// Get all supported cultures from cultures.json
    /// </summary>
    public async Task<IEnumerable<Culture>> GetCulturesAsync()
    {
        try
        {
            var culturesFilePath = Path.Combine(_translationsPath, "cultures.json");
            
            if (!File.Exists(culturesFilePath))
            {
                _logger.LogWarning("Cultures file not found at {Path}", culturesFilePath);
                return Enumerable.Empty<Culture>();
            }

            var json = await File.ReadAllTextAsync(culturesFilePath);
            var cultures = JsonSerializer.Deserialize<List<Culture>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return cultures ?? Enumerable.Empty<Culture>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading cultures file");
            throw;
        }
    }

    /// <summary>
    /// Get all translations for a specific culture from {culture}.json file
    /// Returns the full translation object structure
    /// </summary>
    public async Task<Dictionary<string, object>> GetTranslationsAsync(string cultureCode)
    {
        try
        {
            var translationFilePath = Path.Combine(_translationsPath, $"{cultureCode}.json");
            
            if (!File.Exists(translationFilePath))
            {
                _logger.LogWarning("Translation file not found for culture {Culture} at {Path}", 
                    cultureCode, translationFilePath);
                return new Dictionary<string, object>();
            }

            var json = await File.ReadAllTextAsync(translationFilePath);
            var translations = JsonSerializer.Deserialize<Dictionary<string, object>>(json, 
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            return translations ?? new Dictionary<string, object>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading translation file for culture {Culture}", cultureCode);
            throw;
        }
    }

    /// <summary>
    /// Get translations for a specific category (e.g., 'common', 'auth')
    /// Useful for lazy loading translations by feature
    /// </summary>
    public async Task<Dictionary<string, object>> GetTranslationsByCategoryAsync(
        string cultureCode, 
        string category)
    {
        try
        {
            var allTranslations = await GetTranslationsAsync(cultureCode);
            
            // Extract the specific category from the translations
            if (allTranslations.TryGetValue(category, out var categoryTranslations))
            {
                // If it's a JsonElement, convert it to Dictionary
                if (categoryTranslations is JsonElement jsonElement)
                {
                    var categoryDict = JsonSerializer.Deserialize<Dictionary<string, object>>(
                        jsonElement.GetRawText(),
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });
                    
                    return new Dictionary<string, object>
                    {
                        { category, categoryDict ?? new Dictionary<string, object>() }
                    };
                }
                
                return new Dictionary<string, object>
                {
                    { category, categoryTranslations }
                };
            }

            _logger.LogWarning("Category {Category} not found for culture {Culture}", 
                category, cultureCode);
            return new Dictionary<string, object>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading category {Category} for culture {Culture}", 
                category, cultureCode);
            throw;
        }
    }
}
```

### Step 4: Translations Controller

Create file: `backend/ProjectTracker.API/Controllers/TranslationsController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using ProjectTracker.API.Data.Repositories;
using ProjectTracker.API.Models.Responses;

namespace ProjectTracker.API.Controllers;

/// <summary>
/// API controller for managing translations and cultures
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TranslationsController(
    ITranslationRepository translationRepository,
    ILogger<TranslationsController> logger) : ControllerBase
{
    private readonly ITranslationRepository _translationRepository = translationRepository;
    private readonly ILogger<TranslationsController> _logger = logger;

    /// <summary>
    /// Get all available cultures/languages
    /// </summary>
    /// <returns>List of available cultures</returns>
    [HttpGet("cultures")]
    [ProducesResponseType(typeof(IEnumerable<CultureResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CultureResponse>>> GetCultures()
    {
        _logger.LogInformation("Fetching all available cultures");

        var cultures = await _translationRepository.GetCulturesAsync();
        
        var response = cultures.Select(c => new CultureResponse
        {
            Code = c.Code,
            Name = c.Name,
            IsDefault = c.IsDefault
        });

        return Ok(response);
    }

    /// <summary>
    /// Get all translations for a specific culture
    /// Returns translations organized in nested objects by category
    /// </summary>
    /// <param name="culture">Culture code (e.g., 'en-US', 'it-IT')</param>
    /// <returns>All translations for the specified culture</returns>
    [HttpGet("{culture}")]
    [ProducesResponseType(typeof(TranslationsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TranslationsResponse>> GetTranslations(string culture)
    {
        _logger.LogInformation("Fetching translations for culture: {Culture}", culture);

        var translations = await _translationRepository.GetTranslationsAsync(culture);

        if (translations.Count == 0)
        {
            _logger.LogWarning("No translations found for culture: {Culture}", culture);
            return NotFound(new { message = $"No translations found for culture: {culture}" });
        }

        var response = new TranslationsResponse
        {
            Culture = culture,
            Translations = translations
        };

        return Ok(response);
    }

    /// <summary>
    /// Get translations for a specific category (lazy loading support)
    /// </summary>
    /// <param name="culture">Culture code</param>
    /// <param name="category">Category name (e.g., 'common', 'auth', 'projects')</param>
    /// <returns>Translations for the specified category</returns>
    [HttpGet("{culture}/category/{category}")]
    [ProducesResponseType(typeof(Dictionary<string, object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Dictionary<string, object>>> GetTranslationsByCategory(
        string culture, 
        string category)
    {
        _logger.LogInformation(
            "Fetching {Category} translations for culture: {Culture}", 
            category, 
            culture);

        var translations = await _translationRepository.GetTranslationsByCategoryAsync(
            culture, 
            category);

        if (translations.Count == 0)
        {
            _logger.LogWarning(
                "No {Category} translations found for culture: {Culture}", 
                category, 
                culture);
            return NotFound(new 
            { 
                message = $"No translations found for category '{category}' in culture: {culture}" 
            });
        }

        return Ok(translations);
    }
}
```

### Step 5: Register Services

Update `backend/ProjectTracker.API/Program.cs`:

```csharp
// Add this after other repository registrations
builder.Services.AddScoped<ITranslationRepository, TranslationRepository>();
```

---

## 🎨 Frontend Implementation (Angular 20)

### Step 1: Translation Models

Create file: `frontend/project-tracker/src/shared/models/translation.model.ts`

```typescript
/// <summary>
/// Represents an available culture/language
/// </summary>
export interface Culture {
  code: string;
  name: string;
  isDefault: boolean;
}

/// <summary>
/// Response from translations API
/// </summary>
export interface TranslationsResponse {
  culture: string;
  translations: Record<string, any>;
}

/// <summary>
/// Translation interpolation parameters
/// Example: translate('validation.minLength', { min: 5 })
/// </summary>
export type TranslationParams = Record<string, string | number>;
```

### Step 2: Translation Service with Signals

Create file: `frontend/project-tracker/src/shared/services/translation.service.ts`

```typescript
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Culture, TranslationsResponse, TranslationParams } from '../models/translation.model';

/// <summary>
/// Translation service using Angular signals for reactive state management
/// Loads translations from the backend API and supports lazy loading by category
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/translations`;
  
  // Storage keys
  private readonly STORAGE_KEY_LANG = 'preferred-language';
  private readonly DEFAULT_CULTURE = 'en-US';
  
  // State signals
  private readonly availableCultures = signal<Culture[]>([]);
  private readonly currentCulture = signal<string>(this.getStoredLanguage());
  private readonly translations = signal<Record<string, any>>({});
  private readonly loadedCategories = signal<Set<string>>(new Set());
  private readonly isLoading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);
  
  // Computed values
  readonly cultures = this.availableCultures.asReadonly();
  readonly currentLanguage = this.currentCulture.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly errorMessage = this.error.asReadonly();
  
  /// <summary>
  /// Computed signal that returns the current culture object
  /// </summary>
  readonly currentCultureInfo = computed(() => {
    const code = this.currentCulture();
    return this.availableCultures().find(c => c.code === code);
  });

  constructor() {
    // Effect to persist language preference
    effect(() => {
      const lang = this.currentCulture();
      localStorage.setItem(this.STORAGE_KEY_LANG, lang);
    });
  }

  /// <summary>
  /// Initialize the translation service
  /// Loads available cultures and translations for the current language
  /// </summary>
  async initialize(): Promise<void> {
    await this.loadCultures();
    await this.loadTranslations(this.currentCulture());
  }

  /// <summary>
  /// Load all available cultures from the API
  /// </summary>
  private async loadCultures(): Promise<void> {
    this.http.get<Culture[]>(`${this.apiUrl}/cultures`).pipe(
      tap(cultures => {
        this.availableCultures.set(cultures);
        
        // Set default culture if current is not available
        const currentCode = this.currentCulture();
        const isAvailable = cultures.some(c => c.code === currentCode);
        
        if (!isAvailable) {
          const defaultCulture = cultures.find(c => c.isDefault) || cultures[0];
          if (defaultCulture) {
            this.currentCulture.set(defaultCulture.code);
          }
        }
      }),
      catchError(err => {
        console.error('Failed to load cultures:', err);
        this.error.set('Failed to load available languages');
        return of([]);
      })
    ).subscribe();
  }

  /// <summary>
  /// Load all translations for a specific culture
  /// </summary>
  private async loadTranslations(cultureCode: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<TranslationsResponse>(`${this.apiUrl}/${cultureCode}`).pipe(
      tap(response => {
        this.translations.set(response.translations);
        this.isLoading.set(false);
        
        // Mark all categories as loaded
        const categories = Object.keys(response.translations);
        this.loadedCategories.set(new Set(categories));
      }),
      catchError(err => {
        console.error('Failed to load translations:', err);
        this.error.set('Failed to load translations');
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  /// <summary>
  /// Lazy load translations for a specific category
  /// Useful for loading feature-specific translations on demand
  /// </summary>
  async loadCategory(category: string): Promise<void> {
    // Skip if already loaded
    if (this.loadedCategories().has(category)) {
      return;
    }

    const cultureCode = this.currentCulture();
    
    this.http.get<Record<string, string>>(
      `${this.apiUrl}/${cultureCode}/category/${category}`
    ).pipe(
      tap(categoryTranslations => {
        // Merge category translations into existing translations
        const current = this.translations();
        const updated = {
          ...current,
          [category]: categoryTranslations
        };
        this.translations.set(updated);
        
        // Mark category as loaded
        const loaded = new Set(this.loadedCategories());
        loaded.add(category);
        this.loadedCategories.set(loaded);
      }),
      catchError(err => {
        console.error(`Failed to load ${category} translations:`, err);
        return of({});
      })
    ).subscribe();
  }

  /// <summary>
  /// Change the current language
  /// Reloads all translations for the new language
  /// </summary>
  async setLanguage(cultureCode: string): Promise<void> {
    if (cultureCode === this.currentCulture()) {
      return;
    }

    this.currentCulture.set(cultureCode);
    this.loadedCategories.set(new Set()); // Clear loaded categories
    await this.loadTranslations(cultureCode);
  }

  /// <summary>
  /// Get a translated value by key path
  /// Supports nested keys with dot notation: 'common.save'
  /// Supports interpolation: translate('validation.minLength', { min: 5 })
  /// </summary>
  translate(keyPath: string, params?: TranslationParams): string {
    const value = this.getNestedValue(this.translations(), keyPath);
    
    if (value === null) {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath; // Return key as fallback
    }

    // Handle interpolation
    if (params && typeof value === 'string') {
      return this.interpolate(value, params);
    }

    return value;
  }

  /// <summary>
  /// Get a translated value as a computed signal
  /// Updates automatically when language changes
  /// </summary>
  translateSignal(keyPath: string, params?: TranslationParams) {
    return computed(() => this.translate(keyPath, params));
  }

  /// <summary>
  /// Get value from nested object using dot notation
  /// </summary>
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? null;
  }

  /// <summary>
  /// Interpolate parameters into translation string
  /// Example: "Minimum {{min}} characters" with { min: 5 } => "Minimum 5 characters"
  /// </summary>
  private interpolate(text: string, params: TranslationParams): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return params[key]?.toString() ?? `{{${key}}}`;
    });
  }

  /// <summary>
  /// Get the stored language preference or default
  /// </summary>
  private getStoredLanguage(): string {
    const stored = localStorage.getItem(this.STORAGE_KEY_LANG);
    
    if (stored) {
      return stored;
    }

    // Try to use browser language
    const browserLang = navigator.language;
    
    // Match browser language to available cultures (will be validated on init)
    return browserLang || this.DEFAULT_CULTURE;
  }

  /// <summary>
  /// Check if a translation key exists
  /// </summary>
  hasTranslation(keyPath: string): boolean {
    return this.getNestedValue(this.translations(), keyPath) !== null;
  }

  /// <summary>
  /// Get all translations for a category
  /// </summary>
  getCategoryTranslations(category: string): Record<string, any> {
    return this.translations()[category] || {};
  }
}
```

### Step 3: Translation Pipe

Create file: `frontend/project-tracker/src/shared/pipes/translate.pipe.ts`

```typescript
import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { TranslationParams } from '../models/translation.model';
import { effect } from '@angular/core';

/// <summary>
/// Pipe for translating text in templates
/// Usage: {{ 'common.save' | translate }}
/// With params: {{ 'validation.minLength' | translate:{ min: 5 } }}
/// </summary>
@Pipe({
  name: 'translate',
  pure: false // Re-evaluate when language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly effectRef;

  constructor() {
    // Track language changes and trigger change detection
    this.effectRef = effect(() => {
      // Access current language to create dependency
      this.translationService.currentLanguage();
      // Mark for check when language changes
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.effectRef.destroy();
  }

  transform(key: string, params?: TranslationParams): string {
    return this.translationService.translate(key, params);
  }
}
```

### Step 4: Locale-Specific Pipes

Create file: `frontend/project-tracker/src/shared/pipes/localized-date.pipe.ts`

```typescript
import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslationService } from '../services/translation.service';

/// <summary>
/// Pipe for formatting dates according to current locale
/// Usage: {{ date | localizedDate:'short' }}
/// </summary>
@Pipe({
  name: 'localizedDate',
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(value: any, format: string = 'mediumDate'): string | null {
    const locale = this.translationService.currentLanguage();
    
    // Create new DatePipe with current locale
    const localizedPipe = new DatePipe(locale);
    return localizedPipe.transform(value, format);
  }
}
```

Create file: `frontend/project-tracker/src/shared/pipes/localized-number.pipe.ts`

```typescript
import { Pipe, PipeTransform, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslationService } from '../services/translation.service';

/// <summary>
/// Pipe for formatting numbers according to current locale
/// Usage: {{ value | localizedNumber:'1.2-2' }}
/// </summary>
@Pipe({
  name: 'localizedNumber',
  pure: false
})
export class LocalizedNumberPipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(value: any, digitsInfo?: string): string | null {
    const locale = this.translationService.currentLanguage();
    const decimalPipe = new DecimalPipe(locale);
    return decimalPipe.transform(value, digitsInfo);
  }
}
```

Create file: `frontend/project-tracker/src/shared/pipes/localized-currency.pipe.ts`

```typescript
import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslationService } from '../services/translation.service';

/// <summary>
/// Pipe for formatting currency according to current locale
/// Usage: {{ value | localizedCurrency:'EUR' }}
/// </summary>
@Pipe({
  name: 'localizedCurrency',
  pure: false
})
export class LocalizedCurrencyPipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(
    value: any, 
    currencyCode: string = 'EUR',
    display: 'code' | 'symbol' | 'symbol-narrow' = 'symbol'
  ): string | null {
    const locale = this.translationService.currentLanguage();
    const currencyPipe = new CurrencyPipe(locale);
    return currencyPipe.transform(value, currencyCode, display);
  }
}
```

### Step 5: Language Selector Component

Create file: `frontend/project-tracker/src/shared/components/language-selector/language-selector.component.ts`

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Component for selecting application language
/// Displays dropdown with available cultures
/// </summary>
@Component({
  selector: 'app-language-selector',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorComponent {
  protected readonly translationService = inject(TranslationService);
  
  // Expose signals for template
  protected readonly cultures = this.translationService.cultures;
  protected readonly currentCulture = this.translationService.currentCultureInfo;
  protected readonly loading = this.translationService.loading;

  /// <summary>
  /// Change the application language
  /// </summary>
  protected async onLanguageChange(cultureCode: string): Promise<void> {
    await this.translationService.setLanguage(cultureCode);
  }
}
```

Create file: `frontend/project-tracker/src/shared/components/language-selector/language-selector.component.html`

```html
<div class="language-selector">
  <div class="dropdown">
    <button 
      class="btn btn-outline-secondary dropdown-toggle" 
      type="button" 
      id="languageDropdown"
      data-bs-toggle="dropdown" 
      aria-expanded="false"
      [disabled]="loading()">
      @if (loading()) {
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      }
      <i class="fas fa-globe me-2"></i>
      {{ currentCulture()?.name || 'Language' }}
    </button>
    <ul class="dropdown-menu" aria-labelledby="languageDropdown">
      @for (culture of cultures(); track culture.code) {
        <li>
          <a 
            class="dropdown-item" 
            [class.active]="culture.code === currentCulture()?.code"
            (click)="onLanguageChange(culture.code)">
            {{ culture.name }}
            @if (culture.code === currentCulture()?.code) {
              <i class="fas fa-check ms-2"></i>
            }
          </a>
        </li>
      }
    </ul>
  </div>
</div>
```

Create file: `frontend/project-tracker/src/shared/components/language-selector/language-selector.component.css`

```css
.language-selector {
  display: inline-block;
}

.dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.dropdown-item:hover {
  background-color: var(--bs-light);
  cursor: pointer;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}
```

### Step 6: Initialize Translation Service

Update `frontend/project-tracker/src/app/app.config.ts`:

```typescript
import { ApplicationConfig, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { TranslationService } from '../shared/services/translation.service';

/// <summary>
/// Factory function to initialize translations before app starts
/// </summary>
function initializeTranslations(translationService: TranslationService) {
  return () => translationService.initialize();
}

/// <summary>
/// Factory function to provide current locale dynamically
/// </summary>
function localeIdFactory(translationService: TranslationService) {
  return () => translationService.currentLanguage();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Initialize translations before app starts
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslationService],
      multi: true
    },
    // Provide dynamic locale ID
    {
      provide: LOCALE_ID,
      useFactory: localeIdFactory,
      deps: [TranslationService]
    }
  ]
};
```

### Step 7: Register Locale Data

Update `frontend/project-tracker/src/main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeIt from '@angular/common/locales/it';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Register locale data for formatting
registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeIt, 'it-IT');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

---

## 🎯 Usage Examples

### Example 1: Using Translation Pipe in Templates

```html
<!-- Simple translation -->
<button class="btn btn-primary">
  {{ 'common.save' | translate }}
</button>

<!-- Translation with interpolation -->
<p class="error">
  {{ 'validation.minLength' | translate:{ min: 5 } }}
</p>

<!-- In form labels -->
<div class="mb-3">
  <label for="email" class="form-label">
    {{ 'auth.email' | translate }}
  </label>
  <input type="email" class="form-control" id="email">
</div>
```

### Example 2: Using Translation Service in Components

```typescript
import { Component, inject, computed } from '@angular/core';
import { TranslationService } from '../shared/services/translation.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html'
})
export class ProjectListComponent {
  private readonly translationService = inject(TranslationService);
  
  // Create computed signal for translated text
  protected readonly pageTitle = this.translationService.translateSignal('projects.title');
  
  // Use in methods
  protected showDeleteConfirmation(): void {
    const message = this.translationService.translate('projects.deleteConfirm');
    if (confirm(message)) {
      // Delete logic
    }
  }
  
  // Get translation with parameters
  protected getValidationMessage(minLength: number): string {
    return this.translationService.translate('validation.minLength', { min: minLength });
  }
}
```

### Example 3: Lazy Loading Translations

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { TranslationService } from '../shared/services/translation.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html'
})
export class AdminPanelComponent implements OnInit {
  private readonly translationService = inject(TranslationService);
  
  async ngOnInit(): Promise<void> {
    // Lazy load admin-specific translations
    await this.translationService.loadCategory('admin');
  }
}
```

### Example 4: Using Localized Date/Number Pipes

```html
<!-- Localized date formatting -->
<p>{{ project.createdAt | localizedDate:'short' }}</p>
<p>{{ project.dueDate | localizedDate:'fullDate' }}</p>

<!-- Localized number formatting -->
<p>{{ project.budget | localizedNumber:'1.2-2' }}</p>

<!-- Localized currency -->
<p>{{ project.cost | localizedCurrency:'EUR' }}</p>
```

### Example 5: Language Selector in Navigation

```html
<!-- In your navbar component -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">
      {{ 'navigation.home' | translate }}
    </a>
    
    <div class="d-flex">
      <!-- Language selector -->
      <app-language-selector></app-language-selector>
    </div>
  </div>
</nav>
```

### Example 6: Complete Login Form with Translations & Auth Integration

This example shows how to combine **Module 06's AuthService** with **Module 07's Translation Service** to create a fully integrated login experience.

#### Component TypeScript (with AuthService integration):

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../../../shared/services/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/// <summary>
/// Login component integrating:
/// - Module 06: AuthService with JWT token management
/// - Module 07: TranslationService with i18n
/// </summary>
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Expose translation service for language selector in template
  protected readonly translation = this.translationService;

  // Form state signals from AuthService
  protected readonly isLoading = this.authService.isLoading;
  protected readonly error = this.authService.error;

  // Form group for login
  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  /// <summary>
  /// Handle login form submission
  /// Calls AuthService.login() which:
  /// 1. Sends credentials to /api/auth/login
  /// 2. Receives TokenResponse with accessToken and refreshToken
  /// 3. Stores tokens via setToken()
  /// 4. Automatically adds Bearer token to subsequent API requests via interceptor
  /// </summary>
  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email || '',
      password: this.loginForm.value.password || ''
    };

    // Call AuthService.login() - this returns an Observable
    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        // Successfully received token response from Module 06
        // The AuthService handles setToken() internally
        // Redirect to dashboard or home
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Error is automatically set in authService.error signal
        // displayed in the template via {{ error() | translate }}
        console.error('Login failed:', err);
      }
    });
  }

  /// <summary>
  /// Helper method to get form field error message with translation
  /// </summary>
  protected getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return this.translationService.translate('validation.required');
    }

    if (fieldName === 'email' && field.hasError('email')) {
      return this.translationService.translate('validation.email');
    }

    if (fieldName === 'password' && field.hasError('minlength')) {
      const error = field.errors['minlength'];
      return this.translationService.translate('validation.minLength', { 
        min: error.requiredLength 
      });
    }

    return '';
  }
}
```

#### Component Template (with i18n):

```html
<div class="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light">
  <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
    <div class="card-body p-5">
      <!-- Header -->
      <div class="text-center mb-4">
        <h2 class="card-title mb-2">
          {{ 'auth.login' | translate }}
        </h2>
        <p class="text-muted small">
          {{ 'auth.enterCredentials' | translate }}
        </p>
      </div>

      <!-- Language selector (optional) -->
      <div class="d-flex justify-content-center mb-4">
        <app-language-selector></app-language-selector>
      </div>

      <!-- Login form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
        <!-- Email field -->
        <div class="mb-3">
          <label for="email" class="form-label">
            {{ 'auth.email' | translate }}
          </label>
          <input 
            type="email" 
            class="form-control" 
            [class.is-invalid]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
            id="email"
            formControlName="email"
            [placeholder]="'auth.email' | translate"
            [attr.aria-label]="'auth.email' | translate"
            autocomplete="email">
          
          @if (getFieldError('email')) {
            <div class="invalid-feedback d-block">
              {{ getFieldError('email') }}
            </div>
          }
        </div>

        <!-- Password field -->
        <div class="mb-3">
          <label for="password" class="form-label">
            {{ 'auth.password' | translate }}
          </label>
          <input 
            type="password" 
            class="form-control" 
            [class.is-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
            id="password"
            formControlName="password"
            [placeholder]="'auth.password' | translate"
            [attr.aria-label]="'auth.password' | translate"
            autocomplete="current-password">
          
          @if (getFieldError('password')) {
            <div class="invalid-feedback d-block">
              {{ getFieldError('password') }}
            </div>
          }
        </div>

        <!-- Remember me checkbox (optional) -->
        <div class="form-check mb-3">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="rememberMe">
          <label class="form-check-label" for="rememberMe">
            {{ 'auth.rememberMe' | translate }}
          </label>
        </div>

        <!-- Submit button -->
        <button 
          type="submit" 
          class="btn btn-primary w-100 mb-3"
          [disabled]="loginForm.invalid || isLoading()">
          @if (isLoading()) {
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span>{{ 'common.loading' | translate }}</span>
          } @else {
            {{ 'auth.login' | translate }}
          }
        </button>
      </form>

      <!-- Error message (translated from API response) -->
      @if (error()) {
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>
          <strong>{{ 'common.error' | translate }}:</strong>
          <!-- This error message comes from the API via AuthService -->
          {{ error() }}
        </div>
      }

      <!-- Footer links -->
      <div class="text-center mt-4">
        <p class="mb-0">
          <a href="/register" class="text-decoration-none">
            {{ 'auth.dontHaveAccount' | translate }}
          </a>
        </p>
        <p class="mb-0 mt-2">
          <a href="/forgot-password" class="text-decoration-none small text-muted">
            {{ 'auth.forgotPassword' | translate }}
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
```

#### Integration with AuthService from Module 06:

The key integration points:

1. **Token Management (Module 06)**:
   ```typescript
   // AuthService automatically handles:
   this.authService.login(loginRequest) // Sends to /api/auth/login
     .subscribe({
       next: (response) => {
         // Sets token internally: this.authService.setToken(token, refreshToken)
         // Token is stored in localStorage
         // All future API calls automatically include: Authorization: Bearer {token}
       }
     });
   ```

2. **Automatic Header Injection (Module 06 - Interceptor)**:
   ```typescript
   // The authHttpInterceptor automatically:
   // - Gets token from AuthService: authService.getToken()
   // - Adds to request: Authorization: Bearer {token}
   // - If 401 error: authService.logout()
   ```

3. **Translation Integration (Module 07)**:
   ```html
   <!-- All UI text uses translation keys -->
   {{ 'auth.login' | translate }}
   {{ getFieldError('email') }} <!-- Returns translated error message -->
   ```

4. **Error Handling**:
   ```typescript
   // API response errors are caught and displayed with translation
   @if (error()) {
     {{ error() }} <!-- Automatically displayed via signal -->
   }
   ```

#### Translation Keys Required (Add to en-US.json and it-IT.json):

For **`en-US.json`**, add to the `auth` section:
```json
{
  "auth": {
    // ... existing keys ...
    "enterCredentials": "Enter your email and password",
    "dontHaveAccount": "Don't have an account? Register here",
    "common": {
      "error": "Error",
      "loading": "Loading..."
    }
  }
}
```

For **`it-IT.json`**, add to the `auth` section:
```json
{
  "auth": {
    // ... existing keys ...
    "enterCredentials": "Inserisci la tua email e password",
    "dontHaveAccount": "Non hai un account? Registrati qui",
    "common": {
      "error": "Errore",
      "loading": "Caricamento..."
    }
  }
}
```

#### How It All Works Together:

```
User fills form → onSubmit() called
    ↓
loginForm validated using Validators (required, email, minLength)
    ↓
AuthService.login(email, password) called
    ↓
HTTP POST to /api/auth/login
    ↓
authHttpInterceptor intercepts (no token yet, so skips auth)
    ↓
Backend validates credentials, returns TokenResponse
    ↓
AuthService.setToken() stores tokens in localStorage
    ↓
isLoading signal changes → Template re-renders
    ↓
Router navigates to /dashboard
    ↓
ProjectService.loadProjects() called
    ↓
authHttpInterceptor intercepts and adds: Authorization: Bearer {token}
    ↓
Backend validates token and returns user's projects
```

✅ **Best Practices Applied:**
- ✅ Uses Module 06 AuthService for JWT token management
- ✅ HTTP interceptor automatically adds Bearer token to requests
- ✅ Error signals from AuthService displayed with i18n translations
- ✅ Form validation with translated error messages
- ✅ Loading state via signals (no manual state management)
- ✅ Accessibility attributes (aria-label, for attribute on labels)
- ✅ Bootstrap form styling with validation states
- ✅ Responsive design (max-width, centered layout)
- ✅ Token persistence across page refreshes via localStorage
- ✅ Automatic logout on 401 errors via interceptor
```

---

## 🧪 Testing Translation Service

Create file: `frontend/project-tracker/src/shared/services/translation.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslationService } from './translation.service';
import { environment } from '../../../environments/environment';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranslationService]
    });
    
    service = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load cultures on initialization', async () => {
    const mockCultures = [
      { code: 'en-US', name: 'English', isDefault: true },
      { code: 'it-IT', name: 'Italiano', isDefault: false }
    ];

    const initPromise = service.initialize();

    const cultureReq = httpMock.expectOne(`${environment.apiUrl}/translations/cultures`);
    expect(cultureReq.request.method).toBe('GET');
    cultureReq.flush(mockCultures);

    const translationsReq = httpMock.expectOne(`${environment.apiUrl}/translations/en-US`);
    translationsReq.flush({ culture: 'en-US', translations: {} });

    await initPromise;

    expect(service.cultures().length).toBe(2);
  });

  it('should translate keys correctly', async () => {
    const mockTranslations = {
      culture: 'en-US',
      translations: {
        common: {
          save: 'Save',
          cancel: 'Cancel'
        }
      }
    };

    const initPromise = service.initialize();
    
    httpMock.expectOne(`${environment.apiUrl}/translations/cultures`).flush([
      { code: 'en-US', name: 'English', isDefault: true }
    ]);
    
    httpMock.expectOne(`${environment.apiUrl}/translations/en-US`).flush(mockTranslations);

    await initPromise;

    expect(service.translate('common.save')).toBe('Save');
    expect(service.translate('common.cancel')).toBe('Cancel');
  });

  it('should interpolate parameters', async () => {
    const mockTranslations = {
      culture: 'en-US',
      translations: {
        validation: {
          minLength: 'Minimum {{min}} characters'
        }
      }
    };

    const initPromise = service.initialize();
    
    httpMock.expectOne(`${environment.apiUrl}/translations/cultures`).flush([
      { code: 'en-US', name: 'English', isDefault: true }
    ]);
    
    httpMock.expectOne(`${environment.apiUrl}/translations/en-US`).flush(mockTranslations);

    await initPromise;

    const result = service.translate('validation.minLength', { min: 5 });
    expect(result).toBe('Minimum 5 characters');
  });

  it('should change language', async () => {
    const mockCultures = [
      { code: 'en-US', name: 'English', isDefault: true },
      { code: 'it-IT', name: 'Italiano', isDefault: false }
    ];

    const initPromise = service.initialize();
    
    httpMock.expectOne(`${environment.apiUrl}/translations/cultures`).flush(mockCultures);
    httpMock.expectOne(`${environment.apiUrl}/translations/en-US`).flush({
      culture: 'en-US',
      translations: { common: { save: 'Save' } }
    });

    await initPromise;

    service.setLanguage('it-IT');

    const translationsReq = httpMock.expectOne(`${environment.apiUrl}/translations/it-IT`);
    translationsReq.flush({
      culture: 'it-IT',
      translations: { common: { save: 'Salva' } }
    });

    expect(service.currentLanguage()).toBe('it-IT');
  });
});
```

---

## ✅ Module 7 Complete!

**What we built:**

### Backend (C# / .NET 9):
- ✅ JSON resource files for translations (en-US.json, it-IT.json)
- ✅ Cultures configuration file (cultures.json)
- ✅ Simplified entity models and DTOs
- ✅ Translation repository reading from JSON files
- ✅ REST API controller with endpoints:
  - `GET /api/translations/cultures` - Get available languages
  - `GET /api/translations/{culture}` - Get all translations
  - `GET /api/translations/{culture}/category/{category}` - Lazy load by category

### Frontend (Angular 20):
- ✅ Translation service using signals for reactive state
- ✅ Server-based translations with lazy loading support
- ✅ Translation pipe with interpolation
- ✅ Localized date, number, and currency pipes
- ✅ Language selector component
- ✅ APP_INITIALIZER for loading translations on startup
- ✅ Local storage for language preference
- ✅ Comprehensive unit tests

### Key Features:
- 🌍 Server-side translation storage in JSON files
- ⚡ Lazy loading translations by category
- 🔄 Reactive language switching with signals
- 💾 User preference persistence
- 🎯 Type-safe translation keys
- 🔌 Easy to extend with new languages
- 📱 Browser language detection
- 📝 JSON files can be managed by future admin UI
- 🧪 Fully testable

---

**Next Steps:**

1. Create the Resources/Translations folder and add JSON files:
   ```bash
   cd backend/ProjectTracker.API
   mkdir -p Resources/Translations
   # Add en-US.json, it-IT.json, and cultures.json files
   ```

2. Test the API endpoints with Swagger:
   - Open `https://localhost:5001/swagger`
   - Try `GET /api/translations/cultures`
   - Try `GET /api/translations/en-US`

3. Initialize the translation service in your Angular app (already configured in app.config.ts)

4. Add the language selector to your navigation component

5. Replace hardcoded text with translation keys throughout your app

---

**Next: [Module 8: Authentication UI & Guards](./08_angular_auth_ui.md)**
