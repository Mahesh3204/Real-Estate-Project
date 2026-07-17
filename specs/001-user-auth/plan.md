# Implementation Plan: User Authentication & Profile Management

**Branch**: `001-user-auth` | **Date**: 2026-07-17 | **Spec**: [spec.md](file:///d:/Projects/E-commerce/specs/001-user-auth/spec.md)

**Input**: Feature specification from [spec.md](file:///d:/Projects/E-commerce/specs/001-user-auth/spec.md)

## Summary
Implement a secure, role-based User Authentication and Profile Management module. The back-end will be built with ASP.NET Core Web API adhering to CQRS principles. The front-end will be a React single-page application. The system will support registration/login via email/password and Google OAuth, OTP email verification, and session management using JWT with HTTP-only cookies. It will also track user favorites, recently viewed properties, inquiries, and property comparisons.

## Technical Context

**Language/Version**: C# 12 / .NET 8 (Back-end), TypeScript / React 18 (Front-end)

**Primary Dependencies**: ASP.NET Core Identity, MediatR, FluentValidation, EF Core, Dapper, Microsoft.AspNetCore.Authentication.JwtBearer (Back-end); React, Zustand, React Router, Axios, Google Maps/Identity SDK (Front-end)

**Storage**: PostgreSQL (Primary Relational DB), Redis (Session cache & Recently Viewed list caching)

**Testing**: xUnit, Moq, FluentAssertions (Back-end); Vitest, React Testing Library (Front-end)

**Target Platform**: Modern web browsers, Docker containers for deployment

**Project Type**: Web Application (React SPA + ASP.NET Core Web API)

**Performance Goals**: JWT token validation overhead < 20ms, inquiry submission < 200ms, favorites/recently viewed retrieval < 500ms

**Constraints**: Compliant with Project Constitution (CQRS strictness, no sensitive credentials in source code, robust validation middleware)

**Scale/Scope**: Supports Admin, Agent, Buyer, and Seller roles with distinct dashboards. Supports up to 4 concurrent property comparisons.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (CQRS Segregation)**: ✅ Pass. Backend logic will use MediatR Commands for writing data (e.g. register, change password, save favorite) and Queries for reading data (e.g. login, inquiry history, favorites). Controllers only dispatch requests.
- **Principle II (React UI Aesthetics)**: ✅ Pass. Front-end will be structured into component-driven React elements with clean layouts.
- **Principle III (Security & Compliance)**: ✅ Pass. Passwords hashed using ASP.NET Core Identity, JWTs issued securely, and transaction history auditable.
- **Principle IV (Async Integration)**: ✅ Pass. OTP emails and notifications will be sent asynchronously via background channels.
- **Principle V (Testing & Observability)**: ✅ Pass. FluentValidation pipeline validation is integrated. Unit tests will cover all MediatR Handlers.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # This file
├── research.md          # Technical choices and rationales
├── data-model.md        # Database schema, entities, and state transitions
├── quickstart.md        # Runnable end-to-end validation scenarios
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── contracts/
    ├── auth-contracts.md # Login, registration, and session API endpoints
    └── user-contracts.md # Profile, favorites, and inquiry API endpoints
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Domain/          # Aggregates, Entities, Value Objects, Domain Events
│   ├── Application/     # CQRS Commands & Queries, MediatR Handlers, Validation
│   ├── Infrastructure/  # Entity Framework Core, Dapper, Identity, Mail, Caching
│   └── API/             # Controllers, Middlewares, Configuration
└── tests/
    ├── Domain.UnitTests/
    ├── Application.UnitTests/
    └── API.IntegrationTests/

frontend/
├── src/
│   ├── components/      # Reusable UI components (buttons, input, cards)
│   ├── pages/           # Pages (Login, Register, Profile, Compare)
│   ├── services/        # HTTP API client services
│   ├── store/           # Global state (auth session, compare list)
│   ├── index.css        # Base styling rules
│   └── App.tsx          # Application router and entry point
└── tests/
```

**Structure Decision**: Option 2: Web application (decoupled frontend and backend directories) is chosen to isolate the React UI layer from the .NET Web API and facilitate parallel development.

## Complexity Tracking

*No current violations of the Project Constitution.*
