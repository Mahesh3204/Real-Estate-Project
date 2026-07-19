# Research: Milestone 1 (Foundation)

This document outlines the architectural research, options considered, and design decisions for Milestone 1 (Foundation) of the Real Estate Platform.

---

## 1. Dynamic Role & Permission-Based Access Control (RBAC) in .NET

### Background
We need a production-ready authorization system supporting:
- Predefined Roles (Admin, Agent, Buyer, Seller)
- Dynamic permissions (e.g., `role.read`, `country.create`)
- Resource-level permission check for protected endpoints.

### Options Considered
- **Option A: Built-in ASP.NET Core Role-based Authorization**: Simple, but doesn't easily support dynamic permissions mapped to claims without creating custom policies for each permission.
- **Option B: Custom Authorization Policy Provider (`IAuthorizationPolicyProvider`) and Requirement Handler**: Dynamically maps endpoint permissions to custom authorization requirements. Evaluates user permissions using database records.
- **Option C: Custom MediatR Pipeline Behavior**: Handles permission checks inside Application command/query handlers. Keeps security out of the API layer but duplicates checking code.

### Decision
**Option B (Custom Policy Provider and Requirement Handler)**. We will implement:
1. An `[AuthorizePermission("permission-name")]` attribute or equivalent custom policy.
2. A custom `PermissionAuthorizationHandler` that extracts the user's role and retrieves its permissions from the database.
3. Integrate with standard ASP.NET Identity to retain user identity context.

### Rationale
Enforcing permissions via custom authorization policies is native to ASP.NET Core, keeps API routing declarations clean, and separates controller logic from authorization evaluation.

---

## 2. Location Hierarchy (Country -> State -> City -> Area) CRUD Validation

### Background
The location hierarchy is Country $\rightarrow$ State $\rightarrow$ City $\rightarrow$ Area.
Deleting a parent record must be prevented if any children exist. When creating or updating a child, its parent must belong to the correct ancestor.

### Options Considered
- **Option A: Database-Level Foreign Key Constraints**: Use EF Core to configure non-cascade foreign keys (`DeleteBehavior.Restrict`). Attempting to delete a parent with children will throw a database exception.
- **Option B: Domain Service Check**: Query the database in Application handlers to verify if dependent children exist before deleting a parent, throwing a custom validation error.
- **Option C: Hybrid (Database Constraints + Validation Check)**: Use domain validation checks to return user-friendly errors, backed by database constraints for absolute integrity.

### Decision
**Option C (Hybrid)**. We will configure `DeleteBehavior.Restrict` in EF Core to enforce referential integrity at the database layer. In Application validators/handlers, we will perform explicit query checks to verify dependencies and return a clean standard validation error before reaching the database.

---

## 3. Shared File Upload Service (Module 10)

### Background
Need a reusable upload service supporting:
- Image uploads (avatars, categories)
- Icon uploads (amenities)
- File validation (MIME types, max size 5MB)
- Storage: Local filesystem (user decision)

### Options Considered
- **Option A: Direct controller-based file processing**: Quick to write, but not reusable across multiple MediatR handlers.
- **Option B: Reusable `IFileUploadService` interface and Local implementation**: Injected into Application layer. Processes files, stores them in `wwwroot/uploads/`, and returns a relative public URL.
- **Option C: MediatR Command for Uploads**: An upload endpoint that returns a File ID/URL. Other entities just receive the string URL.

### Decision
**Option B (Reusable `IFileUploadService`)**. We will declare:
```csharp
public interface IFileUploadService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string subFolder);
    void DeleteFile(string fileUrl);
}
```
This will be registered in Infrastructure and injected into MediatR Handlers.

---

## 4. Automatic Audit Logging (Module 11)

### Background
Administrative actions (creates, updates, deletes on locations, categories, types, conditions, and roles) must be logged automatically, tracking User, Action, Resource, Resource ID, Old/New Values, Timestamp, IP Address, and User Agent.

### Options Considered
- **Option A: EF Core DbContext Interceptor (`SaveChangesInterceptor`) or overriding `SaveChangesAsync`**: Automatically intercepts all entity writes. Using EF Core Change Tracker, it serialized modified fields and writes them to an `AuditLogs` table.
- **Option B: Explicit logging in MediatR handlers**: Developers must manually write logging code in every command handler.
- **Option C: MediatR Pipeline Behavior**: Intercepts requests, but doesn't easily capture the precise database-level old/new values.

### Decision
**Option A (EF Core Change Tracking inside DbContext)**. We will override `SaveChangesAsync` in `ApplicationDbContext`. We will inspect the ChangeTracker for entities implementing an `IAuditable` marker interface, serialize modified fields into JSON, and insert `AuditLog` records. We will inject an `ICurrentUserService` and `IHttpContextProvider` (or similar) to capture IP, User Agent, and User ID.
