# Tasks: Milestone 3 - Property Discovery & Buyer Experience

**Input**: Design documents from `/specs/005-property-discovery/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project database migration initialization and basic services setup

- [x] T001 Create SavedSearch database migrations in backend/src/API/Migrations
- [x] T002 Configure frontend services in frontend/src/services/api.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create SavedSearch entity in backend/src/Domain/Entities/SavedSearch.cs
- [x] T004 [P] Register SavedSearch entity DbSet in backend/src/Application/Common/Interfaces/IApplicationDbContext.cs
- [x] T005 [P] Implement EF DbContext configuration mapping for SavedSearch entity in backend/src/Infrastructure/Data/ApplicationDbContext.cs
- [x] T006 Implement ClearHistoryAsync in IRecentlyViewedService and RecentlyViewedService in backend/src/Application/Common/Interfaces/IRecentlyViewedService.cs and backend/src/Infrastructure/Services/RecentlyViewedService.cs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browsing, Searching, and Filtering (Priority: P1) 🎯 MVP

**Goal**: Enable buyers to search and filter properties using a rich selection of combinable inputs.

**Independent Test**: Perform a search on the home page and listing page with price, category, and bedroom filters; verify that only matching listings appear.

### Implementation for User Story 1

- [x] T007 [P] [US1] Extend GetPropertyListQuery with minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, cityId, areaId, furnishedStatus, parking, yearBuilt, amenityIds in backend/src/Application/Properties/Queries/GetPropertiesQueries.cs
- [x] T008 [US1] Update query handler logic to filter on the new fields in backend/src/Application/Properties/Queries/GetPropertiesQueries.cs
- [x] T009 [P] [US1] Create FilterPanel component with combinable filter inputs in frontend/src/components/Property/FilterPanel.tsx
- [x] T010 [US1] Update PropertyListPage with search bar, list/grid toggle, and pagination in frontend/src/pages/Property/PublicPropertyListPage.tsx
- [x] T011 [US1] Implement PopularCities and PopularPropertyTypes sections in frontend/src/pages/Home/HomePage.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Property Details & Recently Viewed Tracking (Priority: P1) 🎯 MVP

**Goal**: Enable buyers to view all details of a property and track their viewing history.

**Independent Test**: Click a property card to open the details view; check image slider and related items; navigate to "Recently Viewed" to check history and click clear.

### Implementation for User Story 2

- [x] T012 [P] [US2] Implement GetRelatedPropertiesQuery for simple category recommendation in backend/src/Application/Properties/Queries/GetRelatedPropertiesQuery.cs
- [x] T013 [US2] Create LogRecentlyViewedCommand to record view events in backend/src/Application/History/Commands/AddRecentlyViewed/AddRecentlyViewedCommand.cs
- [x] T014 [US2] Create ClearRecentlyViewedCommand to empty history in backend/src/Application/History/Commands/ClearRecentlyViewed/ClearRecentlyViewedCommand.cs
- [x] T015 [US2] Create GetRecentlyViewedQuery to retrieve history in backend/src/Application/History/Queries/GetRecentlyViewed/GetRecentlyViewedPropertiesQuery.cs
- [x] T016 [US2] Implement RecentlyViewedController endpoints for log, retrieve, and clear in backend/src/API/Controllers/RecentlyViewedController.cs
- [x] T017 [US2] Register routing and related property endpoints in backend/src/API/Controllers/PropertiesController.cs
- [x] T018 [P] [US2] Create ImageCarousel component for image galleries in frontend/src/pages/Property/PropertyDetailsPage.tsx
- [x] T019 [US2] Implement PropertyDetailsPage with gallery, description, details, floor plans, and documents in frontend/src/pages/Property/PropertyDetailsPage.tsx
- [x] T020 [US2] Implement RecentlyViewed history page with local storage sync for guests in frontend/src/pages/Profile/RecentlyViewed.tsx

**Checkpoint**: User Stories 1 and 2 are fully functional and integrated.

---

## Phase 5: User Story 3 - Favorites (Priority: P2)

**Goal**: Enable authenticated buyers to save/remove properties to/from their favorites list.

**Independent Test**: Log in, click the favorite heart icon on a listing card, and confirm it appears in the active state and increments favorite count in navbar.

### Implementation for User Story 3

- [x] T021 [P] [US3] Create AddFavoriteCommand with duplicate checks in backend/src/Application/Favorites/Commands/AddToFavorites/AddToFavoritesCommand.cs
- [x] T022 [P] [US3] Create RemoveFavoriteCommand in backend/src/Application/Favorites/Commands/RemoveFromFavorites/RemoveFromFavoritesCommand.cs
- [x] T023 [P] [US3] Create GetUserFavoritesQuery in backend/src/Application/Favorites/Queries/GetFavorites/GetFavoritesPropertiesQuery.cs
- [x] T024 [P] [US3] Create GetFavoriteCountQuery in backend/src/API/Controllers/FavoritesController.cs
- [x] T025 [US3] Create FavoritesController endpoints in backend/src/API/Controllers/FavoritesController.cs
- [x] T026 [US3] Integrate favorite toggle action on PropertyCard components in frontend/src/components/Property/PropertyCard.tsx
- [x] T027 [US3] Implement Favorites list page with login redirection for guest users in frontend/src/pages/Profile/FavoritesPage.tsx

**Checkpoint**: Favorites are fully functional and integrated with listing pages.

---

## Phase 6: User Story 4 - Property Comparison (Priority: P2)

**Goal**: Enable users to compare up to 4 properties side-by-side.

**Independent Test**: Select 4 properties for comparison, verify that selecting a 5th property is blocked, and view compare dashboard.

### Implementation for User Story 4

- [x] T028 [US4] Update GetPropertyListQuery to support fetching a list of properties by comma-separated Guid IDs in backend/src/Application/Properties/Queries/GetPropertiesQueries.cs
- [x] T029 [P] [US4] Create CompareDrawer component to manage selected compare IDs in frontend/src/components/Property/CompareDrawer.tsx
- [x] T030 [US4] Implement ComparePage side-by-side layout in frontend/src/pages/Compare/ComparePage.tsx

**Checkpoint**: Property comparison works end-to-end.

---

## Phase 7: User Story 5 - Saved Searches (Priority: P3)

**Goal**: Allow authenticated buyers to save search queries and run them later.

**Independent Test**: Save a filtered search, check the profile settings panel, run the saved search, and verify it updates the filters.

### Implementation for User Story 5

- [x] T031 [P] [US5] Create CreateSavedSearchCommand in backend/src/Application/SavedSearches/Commands/CreateSavedSearchCommand.cs
- [x] T032 [P] [US5] Create DeleteSavedSearchCommand in backend/src/Application/SavedSearches/Commands/DeleteSavedSearchCommand.cs
- [x] T033 [P] [US5] Create GetSavedSearchesQuery in backend/src/Application/SavedSearches/Queries/GetSavedSearchesQuery.cs
- [x] T034 [US5] Create SavedSearchesController in backend/src/API/Controllers/SavedSearchesController.cs
- [x] T035 [US5] Create SavedSearches panel inside Profile page in frontend/src/pages/Profile/ProfilePage.tsx

**Checkpoint**: Saved searches are functional.

---

## Phase 8: User Story 6 - Public Seller & Agent Profiles (Priority: P3)

**Goal**: Display public information and active listings for Agents and Sellers.

**Independent Test**: Click an agent's name on details page, check listings count, verify email/phone details, check active listings.

### Implementation for User Story 6

- [x] T036 [US6] Create GetPublicProfileQuery fetching user and their active listings in backend/src/Application/Users/Queries/GetPublicProfile/GetPublicProfileQuery.cs
- [x] T037 [US6] Create ProfilesController in backend/src/API/Controllers/ProfilesController.cs
- [x] T038 [US6] Implement PublicProfilePage in frontend/src/pages/Profile/PublicProfilePage.tsx

**Checkpoint**: Public profiles are integrated.

---

## Phase 9: User Story 7 - Share Property (Priority: P3)

**Goal**: Generate canonical URLs and allow sharing via WhatsApp, Facebook, LinkedIn, Twitter, Email.

**Independent Test**: Click share button on a card or details page, select copy link, verify URL format is canonical.

### Implementation for User Story 7

- [x] T039 [P] [US7] Create ShareModal component with copy to clipboard and social sharing links in frontend/src/pages/Property/PublicPropertyListPage.tsx
- [x] T040 [US7] Connect Share button on PropertyCard and Details page to open ShareModal in frontend/src/components/Property/PropertyCard.tsx and frontend/src/pages/Property/PropertyDetailsPage.tsx

**Checkpoint**: Share links work.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Performance checks, responsiveness fixes, validation tests

- [x] T041 Ensure mobile responsiveness for Compare table and listing filters in frontend/src/index.css
- [x] T042 Run E2E scenarios in specs/005-property-discovery/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 Setup. Blocks all User Stories.
- **User Stories (Phases 3 to 9)**: All depend on Foundational (Phase 2).
  - Can be developed in parallel once Phase 2 is complete.
- **Polish (Phase 10)**: Depends on all User Stories.

### Parallel Opportunities

- Setup tasks `T001` and `T002` can be initialized in parallel.
- Foundational database configuration tasks `T004` and `T005` can run in parallel.
- Search filter expansion `T007` and filter panel UI `T009` can run in parallel.
- Related properties query `T012` and image carousel `T018` can run in parallel.
- Favorites command tasks `T021` to `T024` can run in parallel.
- Saved searches command tasks `T031` to `T033` can run in parallel.

---

## Parallel Example: User Story 3

```bash
# Launch models, commands and queries for favorites together:
Task: "Create AddFavoriteCommand in backend/src/Application/Favorites/Commands/AddFavoriteCommand.cs"
Task: "Create RemoveFavoriteCommand in backend/src/Application/Favorites/Commands/RemoveFavoriteCommand.cs"
Task: "Create GetUserFavoritesQuery in backend/src/Application/Favorites/Queries/GetUserFavoritesQuery.cs"
Task: "Create GetFavoriteCountQuery in backend/src/Application/Favorites/Queries/GetFavoriteCountQuery.cs"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Browsing/Searching/Filtering)
4. Complete Phase 4: User Story 2 (Details/History)
5. **STOP and VALIDATE**: Verify listings, details, search, filtering, and history.

### Incremental Delivery

1. Foundation ready
2. Add Browsing/Details (MVP)
3. Add Favorites (US3)
4. Add Compare (US4)
5. Add Saved Searches (US5)
6. Add Profiles (US6) & Share (US7)
