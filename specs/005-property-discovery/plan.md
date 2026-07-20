# Implementation Plan: Milestone 3 - Property Discovery & Buyer Experience

**Branch**: `005-property-discovery` | **Date**: 2026-07-20 | **Spec**: [spec.md](file:///d:/Projects/Real-Estate-Project/specs/005-property-discovery/spec.md)

**Input**: Feature specification from [spec.md](file:///d:/Projects/Real-Estate-Project/specs/005-property-discovery/spec.md)

## Summary

Implement the public marketplace discovery features, including browsing, searching, filtering, and comparing properties, managing saved searches, favoriting properties, public user profiles, recently viewed tracking, and URL-based property sharing. The backend will be built as CQRS queries and commands inside ASP.NET Core Clean Architecture (with MediatR and EF Core). The frontend is a React + TypeScript + Vite + Tailwind CSS application using a unified, reusable UI components library.

## Technical Context

**Language/Version**: C# (.NET 8/9), TypeScript (React 18+, Vite)

**Primary Dependencies**: MediatR, Entity Framework Core, FluentValidation, StackExchange.Redis, React Icons, Tailwind CSS, Lucide React (for icons)

**Storage**: PostgreSQL (source of truth for properties, users, favorites, recently viewed, saved searches), Redis (caching recently viewed lists and popular listings)

**Testing**: xUnit, FluentAssertions, React Testing Library, Vitest

**Target Platform**: ASP.NET Core Web API, Modern Web Browsers (Mobile/Desktop responsive)

**Project Type**: Web Application (separate frontend and backend)

**Performance Goals**: <200ms API response times (p95), zero layout shifts on page render, no N+1 database queries.

**Constraints**: Max 4 properties in comparison, guests redirected to login on favoriting, only published properties visible to anonymous users.

**Scale/Scope**: 10,000+ active property listings, 50,000+ active users.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **CQRS Compliance**: All read operations (search, related, list, details, profile, popular) are implemented as MediatR Queries. Writes (favorites, saved searches, recently viewed logs) are implemented as MediatR Commands.
- **Component-Driven UI**: Reusable, modular UI components (Modal, Drawer, Toast, EmptyState, LoadingSpinner, Skeleton, ImageCarousel) are shared across all pages.
- **Security & Privacy**: Favorites and Saved Searches are protected by JWT authentication headers. Non-published listings are excluded from public search queries.
- **Testing & Validation**: Validation of searches and commands is handled by FluentValidation pipelines. Unit tests verify logic in queries/commands.

## Project Structure

### Documentation (this feature)

```text
specs/005-property-discovery/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Domain/Entities/
│   │   └── SavedSearch.cs            # [NEW] SavedSearch Entity
│   ├── Application/
│   │   ├── Common/Interfaces/
│   │   │   ├── IApplicationDbContext.cs # [MODIFY] Add SavedSearches DbSet
│   │   │   └── IRecentlyViewedService.cs # [MODIFY] Add ClearHistoryAsync method
│   │   ├── Properties/
│   │   │   └── Queries/
│   │   │       ├── GetPropertiesQueries.cs # [MODIFY] Add advanced filters to GetPropertyListQuery
│   │   │       ├── GetRelatedPropertiesQuery.cs # [NEW] Simple recommendation based on CategoryId
│   │   │       └── GetPopularCitiesQuery.cs     # [NEW] Return cities with active listing counts
│   │   ├── Favorites/
│   │   │   ├── Commands/
│   │   │   │   ├── AddFavoriteCommand.cs        # [NEW] Add to favorites list
│   │   │   │   └── RemoveFavoriteCommand.cs     # [NEW] Remove from favorites list
│   │   │   └── Queries/
│   │   │       ├── GetUserFavoritesQuery.cs     # [NEW] Get paginated user favorites
│   │   │       └── GetFavoriteCountQuery.cs     # [NEW] Get active user favorite count
│   │   ├── SavedSearches/
│   │   │   ├── Commands/
│   │   │   │   ├── CreateSavedSearchCommand.cs  # [NEW] Save search filter configuration
│   │   │   │   └── DeleteSavedSearchCommand.cs  # [NEW] Delete search configuration
│   │   │   └── Queries/
│   │   │       └── GetSavedSearchesQuery.cs     # [NEW] List saved searches for user
│   │   └── RecentlyViewed/
│   │       ├── Commands/
│   │       │   ├── LogRecentlyViewedCommand.cs  # [NEW] Track property view
│   │       │   └── ClearRecentlyViewedCommand.cs # [NEW] Clear user view history
│   │       └── Queries/
│   │           └── GetRecentlyViewedQuery.cs     # [NEW] Retrieve user history listings
│   ├── Infrastructure/
│   │   ├── Data/
│   │   │   └── ApplicationDbContext.cs           # [MODIFY] Register SavedSearches and Entity configurations
│   │   └── Services/
│   │       └── RecentlyViewedService.cs          # [MODIFY] Implement ClearHistoryAsync method
│   └── API/Controllers/
│       ├── PropertiesController.cs              # [MODIFY] Add related, popular-cities, newest endpoints
│       ├── FavoritesController.cs               # [NEW] Manage user favorite listings
│       ├── SavedSearchesController.cs           # [NEW] Create/Get/Delete saved searches
│       ├── RecentlyViewedController.cs          # [NEW] Retrieve and clear recently viewed listings
│       └── ProfilesController.cs                # [NEW] Public seller & agent profile views
```

**Structure Decision**: Web application option (Option 2) matches the existing Clean Architecture backend and Vite/React frontend. Real directory mappings exist under `/backend` and `/frontend`.

## Complexity Tracking

No constitution gate violations are requested. The CQRS, validation, and architecture constraints are respected.
