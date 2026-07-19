# Technical Research: Multi-Role User Management

## Decisions & Architecture

### 1. Multi-Role Identity & Active Role Persistence
- **Decision**: Extend the ASP.NET Core Identity model to support a many-to-many relationship via `ApplicationUserRole`. Store the user's active role in the database (`Users` table) as `ActiveRoleId` to persist it across sessions and devices.
- **Rationale**: If active role is session-only (e.g., local storage), the user's dashboard view would revert on another browser or device. Saving it in the database ensures consistency.
- **Alternatives Considered**: Session-only (rejected because it leads to disjointed user experiences across devices).

### 2. Permissions Aggregation (Union of Roles)
- **Decision**: Map all permissions assigned to any of the user's roles to claims. The authorization middleware will aggregate these claims to determine access.
- **Rationale**: Complies with FR-003, ensuring that changing the active role on the frontend does not revoke security clearance on the API.
- **Alternatives Considered**: Restricting backend access to the active role (rejected because the specification explicitly forbids removing permissions granted by other roles when switching active roles).

### 3. Upgrade Approval Configuration
- **Decision**: Introduce a database-backed `SystemSettings` key-value table. We will register `AutoApproveRoleRequests` as a Boolean setting.
- **Rationale**: Allows administrators to toggle role auto-approval dynamically without restarting the application or rebuilding.
- **Alternatives Considered**: Using `appsettings.json` (rejected because it requires server redeployment or configuration file writes to toggle settings).

### 4. Domain Events & Auditing
- **Decision**: Emit domain events via the Entity Framework `DbContext` save pipeline and MediatR notifications. Write records to the `PropertyAuditLogs` database table (extending the schema or target names).
- **Rationale**: Adheres to Clean Architecture core principles (Principle V) and provides a clear mechanism for downstream modules to react to role changes.
- **Alternatives Considered**: In-line logging inside controllers (rejected; violates separation of concerns and CQRS rules).
