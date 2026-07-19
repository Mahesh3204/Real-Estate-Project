# Implementation Plan: Multi-Role User Management and Role Upgrade Workflow

**Branch**: `004-multi-role-management` | **Date**: 2026-07-19 | **Spec**: [spec.md](file:///d:/Projects/Real-Estate-Project/specs/004-multi-role-management/spec.md)

**Input**: Feature specification from `/specs/004-multi-role-management/spec.md`

## Summary

Implement a flexible, multi-role user assignment system and upgrade workflow. Every new user receives the **Buyer** role by default. Users can request additional roles (**Seller** or **Agent**) from their profiles. Role requests are processed based on the platform config (either "Auto Approve" or "Manual Approval Required"). A user with multiple roles can switch their active role in the current session (influencing dashboards and navigation), while their security clearance combines all assigned permissions (union of permissions). Administrators can manage user roles directly and review pending role upgrade requests.

## Technical Context

**Language/Version**: C# (.NET 9), TypeScript (React 19)

**Primary Dependencies**: MediatR, FluentValidation, Entity Framework Core, Redux Toolkit, React Icons

**Storage**: PostgreSQL (via Entity Framework Core database mapping)

**Testing**: xUnit, FluentAssertions, Moq for backend; Vitest/React Testing Library for frontend

**Target Platform**: ASP.NET Core Web API, Vite SPA (React)

**Project Type**: Web Service + Web Application

**Performance Goals**: Active role switching updates user profile context and default navigation in <1.0 seconds.

**Constraints**: Enforce RBAC validation on all endpoints; prevent self-lockout of Admin roles.

**Scale/Scope**: System-wide role requests audit logging, profile settings upgrades, and admin review boards.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **CQRS Segregation**: All backend changes must proceed through MediatR Commands (e.g. `CreateRoleRequestCommand`, `ApproveRoleRequestCommand`, `SwitchActiveRoleCommand`), and read-only actions must run through MediatR Queries.
- **Tech Stack Compliance**: All implementation layers must comply with .NET API architecture (Controllers -> Application -> Domain -> Infrastructure) and React SPA architecture.
- **Observability**: Transitions must emit domain events and be recorded in the platform audit log.
- **Automated Validation**: FluentValidation rules must run in the pipeline to assert command inputs.
- **Automated Testing**: CQRS Command and Query handlers must have unit tests.

## Project Structure

### Documentation (this feature)

```text
specs/004-multi-role-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/
    └── api.md           # Phase 1 contract definition
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Domain/
│   │   ├── Entities/          # Add UserRole, RoleRequest, RoleRequestHistory
│   │   └── Events/            # Add RoleRequested, RoleApproved, RoleRejected, RoleAssigned, RoleRemoved, ActiveRoleChanged
│   ├── Application/
│   │   ├── Roles/             # Commands and Queries for Role Management
│   │   └── Common/            # Database context updates
│   └── API/
│       ├── Controllers/       # UserRolesController.cs
│       └── Migrations/        # EF Core migrations
└── tests/

frontend/
├── src/
│   ├── components/
│   │   └── Common/            # ConfirmationModal.tsx
│   ├── pages/
│   │   ├── Admin/             # AdminRoleRequestsPage.tsx, UserManagementPage updates
│   │   └── Profile/           # ProfilePage.tsx role upgrades & active switching
│   └── services/
│       ├── roleApi.ts         # Role upgrade HTTP requests
│       └── authSlice.ts       # Active role updates in store
└── tests/
```

**Structure Decision**: Option 2 (Web application - backend API and frontend React SPA).

## Complexity Tracking

*No violations identified. Direct mapping is used.*
