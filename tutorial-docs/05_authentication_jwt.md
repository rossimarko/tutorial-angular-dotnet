# Module 5: Authentication & Authorization - JWT Tokens

## 🎯 Objectives

By the end of this module, you will:
- ✅ Implement user registration with password hashing
- ✅ Create a secure login endpoint
- ✅ Generate and validate JWT tokens
- ✅ Implement refresh token mechanism
- ✅ Create authorization guards
- ✅ Understand OAuth 2.0 concepts
- ✅ Implement role-based access control (RBAC)

## 📌 Status: Module Framework Ready

This module contains the complete framework for JWT authentication implementation. Follow the patterns established in Modules 3-4 to build:

### Key Components to Implement:

1. **Authentication Service**
   - User registration with validation
   - Password hashing with bcrypt
   - Login verification
   - Token generation

2. **JWT Token Provider**
   - Access token generation (short-lived)
   - Refresh token generation (long-lived)
   - Token validation
   - Claims management

3. **Authorization Endpoints**
   - POST /api/auth/register - Register new user
   - POST /api/auth/login - User login
   - POST /api/auth/refresh - Refresh tokens
   - POST /api/auth/logout - Logout
   - GET /api/auth/me - Get current user

4. **Authorization Guards**
   - Require authentication
   - Check specific roles
   - Policy-based authorization

### File Structure:
```
backend/ProjectTracker.API/
├── Authentication/
│   ├── IAuthService.cs          # Service interface
│   ├── AuthService.cs           # Implementation
│   ├── JwtTokenProvider.cs      # Token generation
│   ├── PasswordHasher.cs        # Bcrypt hashing
│   └── JwtSettings.cs           # Configuration
├── Models/
│   ├── Requests/
│   │   ├── RegisterRequest.cs
│   │   ├── LoginRequest.cs
│   │   └── RefreshTokenRequest.cs
│   └── Responses/
│       ├── AuthTokenResponse.cs
│       └── UserResponse.cs
└── Endpoints/
    └── AuthEndpoints.cs         # Authentication endpoints
```

---

## 🚀 Implementation Guide Outline

### Step 1: Password Hashing
- Create `PasswordHasher.cs` with bcrypt integration
- Methods: HashPassword(), VerifyPassword()

### Step 2: JWT Token Provider
- Create `JwtTokenProvider.cs`
- Generate access and refresh tokens
- Include user claims in token

### Step 3: Authentication Service
- Create `IAuthService.cs` interface
- Create `AuthService.cs` with:
  - RegisterAsync()
  - LoginAsync()
  - RefreshTokenAsync()
  - RevokeTokenAsync()

### Step 4: Auth Endpoints
- Create minimal API endpoints
- Register route group `/api/auth`
- Map all authentication endpoints

### Step 5: Authorization
- Add [Authorize] attributes to protected endpoints
- Implement policy-based authorization
- Create custom authorization requirements

---

## 📚 Security Best Practices

✅ **Never store passwords**: Hash them with bcrypt
✅ **Short-lived access tokens**: 15 minutes expiry
✅ **Longer-lived refresh tokens**: 7 days expiry
✅ **HTTPS only**: All auth endpoints require HTTPS
✅ **Secure token storage**: Frontend should use secure httpOnly cookies or secure storage
✅ **CORS validation**: Restrict token access to specific origins
✅ **Rate limiting**: Prevent brute force attacks on login
✅ **Token revocation**: Support logout by revoking refresh tokens

---

## 📊 Token Flow Diagram

```
1. User Registration
   Client → POST /api/auth/register → Backend
   Backend → Validate, Hash Password → Database
   Backend ← User created ← Database
   Client ← Registration success

2. User Login
   Client → POST /api/auth/login → Backend
   Backend → Find user, Verify password ← Database
   Backend → Generate tokens → JWT Provider
   Client ← Access token + Refresh token

3. Subsequent Requests
   Client → GET /api/projects (+ Auth header) → Backend
   Backend → Validate token ← JWT Provider
   Client ← Response if valid, 401 if invalid

4. Token Refresh
   Client → POST /api/auth/refresh → Backend
   Backend → Validate refresh token ← Database
   Backend → Generate new access token → JWT Provider
   Client ← New access token

5. Logout
   Client → POST /api/auth/logout → Backend
   Backend → Revoke refresh token ← Database
   Client ← Logout success
```

---

## 🔑 Key Methods to Implement

```csharp
// PasswordHasher
public string HashPassword(string password)
public bool VerifyPassword(string password, string hash)

// JwtTokenProvider
public TokenResponse GenerateTokens(User user)
public ClaimsPrincipal GetClaimsFromToken(string token)
public bool ValidateToken(string token)

// AuthService
public async Task<UserResponse> RegisterAsync(RegisterRequest request)
public async Task<AuthTokenResponse> LoginAsync(LoginRequest request)
public async Task<AuthTokenResponse> RefreshTokenAsync(string refreshToken)
public async Task LogoutAsync(int userId)

// Endpoints
public static void MapAuthEndpoints(WebApplication app)
{
    var group = app.MapGroup("/api/auth");
    group.MapPost("/register", Register);
    group.MapPost("/login", Login);
    group.MapPost("/refresh", Refresh);
    group.MapPost("/logout", Logout).RequireAuthorization();
}
```

---

## ✅ Implementation Checklist

Before moving to Phase 3 (Frontend):

- [ ] PasswordHasher implemented with bcrypt
- [ ] JwtTokenProvider generates tokens correctly
- [ ] AuthService handles registration and login
- [ ] Auth endpoints tested with Swagger
- [ ] Token validation works correctly
- [ ] Refresh token mechanism implemented
- [ ] Logout revokes tokens
- [ ] Protected endpoints require authorization
- [ ] Role-based access control working
- [ ] Error responses consistent

---

## 📝 Next Steps

After implementing this module:

1. **Test** all auth endpoints with Swagger
2. **Verify** tokens are properly validated
3. **Check** refresh token flow works
4. **Move to Module 6** when ready for Frontend

---

## 📚 Related Modules

- **Module 3**: API setup with JWT configuration ✅
- **Module 4**: Database with user storage ✅
- **Module 5**: This module - Authentication ⬅️
- **Module 8**: Frontend authentication UI (coming next)

---

**Full implementation details**: Complete the checklist above following the patterns from Module 4 (Repository pattern) and Module 3 (service registration)

**Next: [Module 6: Angular 20 Setup](./06_angular_setup.md)**
