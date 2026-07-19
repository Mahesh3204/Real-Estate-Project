# Implementation Plan: Milestone 1 (Foundation)

**Branch**: `002-foundation-milestone` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-foundation-milestone/spec.md`

## Summary

Build and establish the core database schema, Clean Architecture infrastructure, dynamic Role-Based Access Control (RBAC) authorization system, and the corresponding React frontend administration panels. This milestone defines the foundation entities and provides administrative UIs for managing Roles, Permissions, Location Hierarchy, Master Taxonomies, and Audit Logs, alongside an editable User Profile form with avatar file uploading.

## Technical Context

**Language/Version**: C# / .NET 8 or 9

**Primary Dependencies**: MediatR, FluentValidation, Microsoft.AspNetCore.Identity.EntityFrameworkCore, Microsoft.EntityFrameworkCore, coverlet.collector

**Storage**: PostgreSQL or SQL Server (configured via connection string), local server filesystem for uploads

**Testing**: xUnit, FluentAssertions, Moq

**Target Platform**: Linux / Windows Server (ASP.NET Core Web API host)

**Project Type**: web-service

**Performance Goals**: Public location list query latency < 200ms under normal load; file upload process completion < 1.5 seconds.

**Constraints**: Maximum file upload size capped at 5MB, strict validation of image MIME types, non-cascade deletions on location hierarchy.

**Scale/Scope**: 15 database tables, 4 user roles, dynamic controller routing authorization policy.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **CQRS Strictness**: Web APIs must only send Commands/Queries via MediatR. Writes must run through Commands enforcing invariants; read queries can use `.AsNoTracking()` on DbContext. (Passed)
- **Validation Pipeline**: FluentValidation rules are evaluated automatically in the MediatR pipeline. If validation fails, return standard error payload. (Passed)
- **Dynamic RBAC Policies**: Protected endpoints must specify individual permission codes using custom authorization requirements. (Passed)
- **File Upload Verification**: Dedicated file upload controller checks MIME types and limits before writing files locally. (Passed)

## Project Structure

### Documentation (this feature)

```text
specs/002-foundation-milestone/
├── plan.md              # This file
├── research.md          # Architectural decisions and rationale
├── data-model.md        # Database schema definitions and attributes
├── quickstart.md        # Validation scenarios and testing guides
└── contracts/           # API request and response JSON payloads
    ├── audit-logs.md
    ├── locations.md
    ├── master-data.md
    ├── permissions.md
    ├── profiles.md
    ├── roles.md
    └── uploads.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── API/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Migrations/
│   │   └── Program.cs
│   ├── Application/
│   │   ├── Common/
│   │   │   └── Interfaces/
│   │   ├── Locations/
│   │   ├── MasterData/
│   │   ├── Profiles/
│   │   ├── Roles/
│   │   └── Users/
│   ├── Domain/
│   │   └── Entities/
│   └── Infrastructure/
│       ├── Data/
│       ├── Security/
│       └── Services/
└── tests/
    └── Application.UnitTests/

frontend/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   └── AdminSidebar.tsx
│   │   └── Common/
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── AdminRolesPage.tsx
│   │   │   ├── AdminPermissionsPage.tsx
│   │   │   ├── AdminLocationsPage.tsx
│   │   │   ├── AdminMasterDataPage.tsx
│   │   │   └── AdminAuditLogsPage.tsx
│   │   ├── Profile/
│   │   │   └── ProfilePage.tsx
│   │   └── Login/
│   ├── services/
│   │   └── adminApi.ts
│   └── App.tsx
```

**Structure Decision**: Monorepo layout containing both backend (Clean Architecture multi-project C# solution) and frontend (React + Vite + TypeScript web application). This keeps administrative APIs and client-side administrative views synchronized.

## Complexity Tracking

No violations of the core principles defined in the Constitution are present. All requirements adhere strictly to Clean Architecture, CQRS, automated validation, and dynamic authorization.
