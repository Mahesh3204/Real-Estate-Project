# Implementation Plan: Property Management Portal

**Branch**: `003-property-management` | **Date**: 2026-07-19 | **Spec**: [/specs/003-property-management/spec.md](spec.md)

**Input**: Feature specification from `/specs/003-property-management/spec.md`

## Summary

The Property Management Portal enables sellers/agents to list and manage properties via a comprehensive 9-step Property Creation Wizard and a responsive management dashboard. It also provides an Admin console for listing moderation (approval/rejection audit logs) and public detail screens for published properties. We will use clean architecture CQRS MediatR commands/queries for backend business rules, and a component-driven React + Tailwind CSS layout for the frontend.

## Technical Context

**Language/Version**: C# 12 / .NET 9 (Backend), TypeScript 5.x / React (Frontend)

**Primary Dependencies**: MediatR, EF Core, FluentValidation (Backend), React Router, Redux Toolkit, Tailwind CSS, React Icons (Frontend)

**Storage**: PostgreSQL / SQL Server database, local server static file storage (`wwwroot/uploads`) for media, documents, and floor plans.

**Testing**: xUnit, FluentValidation testing helpers, and integration API client tests.

**Target Platform**: Linux/Windows Container Environment, modern web browsers (Desktop/Mobile responsive viewport stack).

**Project Type**: Web Application (Backend Web API + Frontend Single Page App)

**Performance Goals**: UI updates and paginated grid listings with filtering/sorting return results in <1 second.

**Constraints**: CQRS segregation of write operations from read queries; RFC 7807 validation middleware handles request payloads.

**Scale/Scope**: Supports listing creation wizard (9 steps with autosave), documents/media assets upload managers, and a dedicated admin approval dashboard.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate I (CQRS Segregation)**: All property modifications (create, edit, update status, upload media) MUST execute via distinct MediatR commands. All list reads, metrics stats, and public details MUST execute via MediatR queries.
- **Gate II (Component-Driven Frontend)**: Implement custom step components for the Wizard, a drag-and-drop media panel, and Tailwind utility styling. Ensure responsiveness via vertical stacked breakpoints.
- **Gate III (Security and Privacy)**: Private documents are hidden from public queries; only the listing owner and system Administrators can view/download private files.
- **Gate V (Validation & Verification)**: FluentValidation rules check basic information and SEO parameters before handlers execute; unit tests cover all status transitions.

## Project Structure

### Documentation (this feature)

```text
specs/003-property-management/
├── spec.md              # Feature specification
├── plan.md              # This file (Implementation Plan)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Domain/
│   │   └── Entities/        # Property, PropertyMedia, PropertyDocument, PropertyFloorPlan
│   ├── Application/
│   │   ├── Common/
│   │   └── Properties/      # CQRS Commands & Queries (Create, Edit, Approve, List, GetDetails)
│   ├── Infrastructure/
│   │   └── Data/            # DB Context migrations and model configs
│   └── API/
│       └── Controllers/     # PropertiesController, AdminPropertiesController
└── tests/
    └── Application.UnitTests/

frontend/
├── src/
│   ├── components/
│   │   ├── Property/        # Wizard steps, MediaManager, DocumentManager, FloorPlanManager
│   │   └── Layout/
│   ├── pages/
│   │   ├── Property/        # PropertyListPage, WizardPage, PropertyDetailsPage
│   │   └── Admin/           # AdminPropertiesPage
│   ├── services/
│   │   └── propertyApi.ts
│   └── store/
```

**Structure Decision**: Web Application structure. We will implement Backend MediatR controllers/handlers in `backend/src/Application/Properties` and React components in `frontend/src/components/Property` and `frontend/src/pages/Property`.
