# Tasks: Milestone 1 (Foundation)

**Input**: Design documents from `/specs/002-foundation-milestone/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included below as unit tests are non-negotiable per the project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Solution setup and infrastructure layout

- [x] T001 Verify project structure matches Clean Architecture layout (Domain, Application, Infrastructure, API projects) in backend/src/
- [x] T002 Update NuGet dependencies to include MediatR, FluentValidation, EF Core, and Coverlet in backend/src/API/RealEstate.API.csproj
- [x] T003 [P] Configure code formatting and style guidelines in backend/src/API/Program.cs and root config files
- [x] T004 Configure React Router paths for the new Admin panels and sidebar layout in frontend/src/App.tsx


---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure blocking user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create base marker interface IAuditable for audit logs in backend/src/Domain/Common/IAuditable.cs
- [x] T006 Setup ApplicationDbContext to declare DbSets for new tables (Roles, Permissions, RolePermissions, Profiles, Countries, States, Cities, Areas, PropertyCategories, PropertyTypes, PropertyStatuses, PropertyConditions, Amenities, Files, AuditLogs) in backend/src/Infrastructure/Data/ApplicationDbContext.cs
- [x] T007 Configure EF Core EntityTypeConfiguration mappings (indexing, composite keys, soft delete query filters, delete restrict) in backend/src/Infrastructure/Data/Configurations/
- [x] T008 Override SaveChangesAsync in ApplicationDbContext to auto log auditable entity writes in backend/src/Infrastructure/Data/ApplicationDbContext.cs
- [x] T009 Implement local file upload service IFileUploadService interface and write FileUploadService in backend/src/Infrastructure/Services/FileUploadService.cs
- [x] T010 [P] Implement custom API authorization attribute AuthorizePermissionAttribute and PermissionAuthorizationHandler in backend/src/API/Middleware/PermissionAuthorizationHandler.cs
- [x] T011 Create validation behavior pipe returning RFC 7807 problem details responses in backend/src/API/Middleware/ValidationMiddleware.cs
- [x] T012 Implement base Axios API client methods and request interceptor for JWT auth token injection in frontend/src/services/api.ts


**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Administrative Access Control (RBAC) Setup (Priority: P1) 🎯 MVP

**Goal**: Establish system Roles, Permissions, and dynamic permissions checks on APIs, with front-end administration.

**Independent Test**: Perform CRUD for roles/permissions, assign permissions, and verify that authorization guards block unauthorized users with 403 Forbidden. Verify the admin views list and modify role-permissions.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create Role entity extending IdentityRole<Guid> in backend/src/Domain/Entities/Role.cs
- [x] T014 [P] [US1] Create Permission and RolePermission join entities in backend/src/Domain/Entities/Permission.cs and backend/src/Domain/Entities/RolePermission.cs
- [x] T015 [US1] Implement MediatR Commands/Queries for Role CRUD (List, Get, Create, Update, Delete) in backend/src/Application/Roles/
- [x] T016 [US1] Implement FluentValidation rules for Role name uniqueness and deletion check in backend/src/Application/Roles/Validators/
- [x] T017 [US1] Implement MediatR Commands/Queries for Permission CRUD in backend/src/Application/Permissions/
- [x] T018 [US1] Implement MediatR Commands to assign and remove permissions to/from roles in backend/src/Application/Roles/Commands/
- [x] T019 [US1] Implement RoleController and PermissionController exposing endpoints in backend/src/API/Controllers/RoleController.cs and backend/src/API/Controllers/PermissionController.cs
- [x] T020 [P] [US1] Write unit tests verifying MediatR Handlers and validators for Roles/Permissions in backend/tests/Application.UnitTests/Roles/
- [x] T021 [US1] Implement frontend API service calls for role/permission retrieval and modifications in frontend/src/services/adminApi.ts
- [x] T022 [US1] Create Admin Roles Page and Role details permissions modifier view in frontend/src/pages/Admin/AdminRolesPage.tsx
- [x] T023 [P] [US1] Create Admin Permissions Page displaying system permissions list in frontend/src/pages/Admin/AdminPermissionsPage.tsx


**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - User Profile Setup and Personal Details Management (Priority: P2)

**Goal**: Authenticated users manage profile details, locations, and avatars, with frontend validation.

**Independent Test**: Get/Update profile details, upload PNG/JPEG avatars < 5MB, verify locations references and avatar preview works.

### Implementation for User Story 2

- [x] T024 [P] [US2] Create Profile entity mapped to profiles database table in backend/src/Domain/Entities/Profile.cs
- [x] T025 [US2] Implement MediatR Commands/Queries for User Profile (Get, Update) in backend/src/Application/Profiles/
- [x] T026 [US2] Implement profile validators and owner authorization constraint check in backend/src/Application/Profiles/Validators/
- [x] T027 [US2] Implement ProfileController and UploadController exposing profile endpoints and avatar uploads in backend/src/API/Controllers/ProfileController.cs and backend/src/API/Controllers/UploadController.cs
- [x] T028 [P] [US2] Write unit tests verifying profile operations and file limits checks in backend/tests/Application.UnitTests/Profiles/
- [x] T029 [US2] Redesign User Profile Page to display First/Last Name, Phone, Gender, DOB, Language, Timezone, Zip Code, and Location cascading selectors in frontend/src/pages/Profile/ProfilePage.tsx
- [x] T030 [US2] Implement avatar file upload handler with preview and deletion action in frontend/src/pages/Profile/ProfilePage.tsx


**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Real Estate Master Data Management (Priority: P3)

**Goal**: Manage locations (Country -> State -> City -> Area) and property master taxonomies, and view audit history.

**Independent Test**: CRUD for locations and master data, verify soft-deletion query filters exclude items by default but retrieve/restore them via query parameter. Check that the admin audit view displays JSON diffs correctly.

### Implementation for User Story 3

- [x] T031 [P] [US3] Create location entities Country, State, City, and Area in backend/src/Domain/Entities/Location.cs
- [x] T032 [P] [US3] Create master entities PropertyCategory, PropertyType, PropertyStatus, PropertyCondition, and Amenity in backend/src/Domain/Entities/PropertyTaxonomy.cs
- [x] T033 [US3] Implement MediatR commands/queries for administrative Location CRUD operations in backend/src/Application/Locations/
- [x] T034 [US3] Implement Location validation rules preventing deletion of parent nodes and validating child dependencies in backend/src/Application/Locations/Validators/
- [x] T035 [US3] Implement public listing queries for locations with pagination/searching/sorting in backend/src/Application/Locations/Queries/
- [x] T036 [US3] Implement MediatR CRUD handlers for Property Category and Property Type in backend/src/Application/MasterData/Categories/ and backend/src/Application/MasterData/Types/
- [x] T037 [US3] Implement MediatR CRUD handlers for Property Status, Condition, and Amenity in backend/src/Application/MasterData/Statuses/, backend/src/Application/MasterData/Conditions/, and backend/src/Application/MasterData/Amenities/
- [x] T038 [US3] Implement LocationController and MasterDataController exposing endpoints in backend/src/API/Controllers/LocationController.cs and backend/src/API/Controllers/MasterDataController.cs
- [x] T039 [P] [US3] Write unit tests for Location and Master Data handlers and queries logic in backend/tests/Application.UnitTests/MasterData/
- [x] T040 [US3] Create Admin sidebar layout component containing links to admin views in frontend/src/components/Admin/AdminSidebar.tsx
- [x] T041 [US3] Implement Location Hierarchy Manager page for Country -> State -> City -> Area CRUD operations in frontend/src/pages/Admin/AdminLocationsPage.tsx
- [x] T042 [US3] Implement Property Master Data page with tabs managing Categories, Types, Statuses, Conditions, and Amenities in frontend/src/pages/Admin/AdminMasterDataPage.tsx
- [x] T043 [US3] Implement Audit Logs inspect table displaying user actions, resource types, timestamps, and expandable value diff view in frontend/src/pages/Admin/AdminAuditLogsPage.tsx


**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Database seeding, global logging middleware, and swagger setup.

- [x] T044 Create EF Core initial migration for all 15 tables and database seeder for roles/permissions/locations in backend/src/Infrastructure/Data/Migrations/ and backend/src/Infrastructure/Data/Seeders/
- [x] T045 Setup global ExceptionHandlingMiddleware in backend/src/API/Middleware/ExceptionHandlingMiddleware.cs to log authentication/authorization/validation errors
- [x] T046 Configure OpenAPI Swagger documentation configuration with authorization support in backend/src/API/Program.cs
- [x] T047 Run quickstart.md validation scenarios to verify end-to-end functionality


---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all user stories being complete

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All models/entities marked [P] within stories can run in parallel
- Unit test tasks marked [P] can run in parallel with implementation tasks
