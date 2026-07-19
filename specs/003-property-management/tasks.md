# Tasks: Property Management Portal

**Input**: Design documents from `/specs/003-property-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic directory setup

- [x] T001 Initialize domain and application folder structures for Properties under `backend/src/Domain/Entities/` and `backend/src/Application/Properties/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema tables and core structural models configuration

**⚠️ CRITICAL**: Foundational tasks must be completed before any User Story implementation can begin.

- [x] T002 [P] Create shared property status and listing type enums in `backend/src/Domain/Enums/PropertyEnums.cs`
- [x] T003 [P] Create database entities for `Property`, `PropertyMedia`, `PropertyDocument`, `PropertyFloorPlan`, and `PropertyAuditLog` in `backend/src/Domain/Entities/`
- [x] T004 Register DB entities and define cascading relationships in application DB context mapping at `backend/src/Infrastructure/Data/ApplicationDbContext.cs`
- [x] T005 Create database schema migrations for new property tables in `backend/src/Infrastructure/Data/Migrations` and apply them to local database

**Checkpoint**: Core foundation schema applied successfully.

---

## Phase 3: User Story 1 - Seller / Agent Property Workspace (Priority: P1) 🎯 MVP

**Goal**: Allow sellers and agents to list, search, filter, paginate, and carry out bulk status modifications.

**Independent Test**: Verify that listing tables render correctly, search updates in <1 second, and bulk archive triggers successfully.

### Implementation for User Story 1

- [x] T006 [US1] Implement `GetPropertyListQuery` and handler returning paginated, filtered property results in `backend/src/Application/Properties/Queries/GetPropertyList/`
- [x] T007 [US1] Implement `BulkPropertyActionCommand` and handler (updating status of multiple IDs) in `backend/src/Application/Properties/Commands/BulkPropertyAction/`
- [x] T008 [P] [US1] Implement controller endpoints for property listing queries and bulk updates in `backend/src/API/Controllers/PropertiesController.cs`
- [x] T009 [US1] Setup Redux store actions, states, and reducers in `frontend/src/store/propertySlice.ts`
- [x] T010 [P] [US1] Implement property API fetch methods in `frontend/src/services/propertyApi.ts`
- [x] T011 [US1] Create Property Management portal workspace UI at `frontend/src/pages/Property/PropertyListPage.tsx` supporting table/grid toggle, search, paginated paging, and status filters

**Checkpoint**: User Story 1 is functional; lists and search filters work.

---

## Phase 4: User Story 2 - Property Creation Wizard (Priority: P1)

**Goal**: Build a 9-step wizard interface with database-backed autosave and file managers.

**Independent Test**: Walk through all steps, upload mock media, and verify that partial draft inputs persist correctly in DB.

### Implementation for User Story 2

- [x] T012 [US2] Implement `CreatePropertyDraftCommand` (initializes base DB listing entry) in `backend/src/Application/Properties/Commands/CreatePropertyDraft/`
- [x] T013 [US2] Implement `UpdatePropertyDraftCommand` (saves active step details) in `backend/src/Application/Properties/Commands/UpdatePropertyDraft/`
- [x] T014 [US2] Implement validation schema checks using FluentValidation in `backend/src/Application/Properties/Commands/UpdatePropertyDraft/UpdatePropertyDraftCommandValidator.cs`
- [x] T015 [P] [US2] Add upload media endpoint supporting size check limits and file compression in `backend/src/API/Controllers/PropertiesController.cs`
- [x] T016 [P] [US2] Add upload document endpoint supporting public/private toggles in `backend/src/API/Controllers/PropertiesController.cs`
- [x] T017 [P] [US2] Add upload floor plan image endpoint in `backend/src/API/Controllers/PropertiesController.cs`
- [x] T018 [US2] Build Wizard shell layout and routing navigation footer at `frontend/src/pages/Property/PropertyWizardPage.tsx`
- [x] T019 [US2] Build Wizard Step 1 (Basic Info), Step 2 (Location with Country/State/City selectors), Step 3 (Specs), and Step 4 (Amenities checklist) in `frontend/src/components/Property/WizardSteps/`
- [x] T020 [US2] Build Wizard Step 5 (Media Manager with drag-and-drop upload queue, sorting, and featured toggle) in `frontend/src/components/Property/WizardSteps/MediaStep.tsx`
- [x] T021 [US2] Build Wizard Step 6 (Document Manager list with public visibility checkbox) in `frontend/src/components/Property/WizardSteps/DocumentStep.tsx`
- [x] T022 [US2] Build Wizard Step 7 (Floor Plan upload step) in `frontend/src/components/Property/WizardSteps/FloorPlanStep.tsx`
- [x] T023 [US2] Build Wizard Step 8 (SEO slug fields) and Step 9 (Review and Submit summary dashboard) in `frontend/src/components/Property/WizardSteps/ReviewStep.tsx`
- [x] T024 [US2] Implement Wizard debounced autosave hook in `frontend/src/components/Property/WizardSteps/useWizardAutosave.ts` triggering database-backed updates in background

**Checkpoint**: The wizard allows creation, upload queues progress, and autosaves successfully.

---

## Phase 5: User Story 3 - Property Details and Interactive Media Viewer (Priority: P2)

**Goal**: Display published properties to public searchers, hide unapproved listing detail routes, and protect private documents.

**Independent Test**: Guest checks a published detail route (map, gallery, public download link) and verifies unapproved links return 404.

### Implementation for User Story 3

- [x] T025 [US3] Implement `GetPropertyDetailsQuery` retrieving full listing details and associated assets in `backend/src/Application/Properties/Queries/GetPropertyDetails/`
- [x] T026 [P] [US3] Add secured file download endpoint with claims validation (returning 403 on private files request by non-owner guest) in `backend/src/API/Controllers/PropertiesController.cs`
- [x] T027 [US3] Create public Property Details page layout at `frontend/src/pages/Property/PropertyDetailsPage.tsx` displaying gallery sliders, Leaflet mapping markers, details grid, and downloadable attachments

**Checkpoint**: Details views render, and private files download permissions are checked.

---

## Phase 6: User Story 4 - Admin Moderation and Approval Panel (Priority: P2)

**Goal**: Moderation dashboard for admins to approve/reject listings and review audit trail logs.

**Independent Test**: Log in as admin, approve/reject property and confirm status updates and audit logs tables.

### Implementation for User Story 4

- [x] T028 [US4] Implement `AdminApprovePropertyCommand` (updates status and logs audit entry) in `backend/src/Application/Properties/Commands/AdminApproveProperty/`
- [x] T029 [US4] Implement `AdminRejectPropertyCommand` (records rejection comments and logs audit entry) in `backend/src/Application/Properties/Commands/AdminRejectProperty/`
- [x] T030 [P] [US4] Create Admin properties console endpoints in `backend/src/API/Controllers/AdminPropertiesController.cs`
- [x] T031 [US4] Create Admin property moderation interface console at `frontend/src/pages/Admin/AdminPropertiesPage.tsx` allowing filters (Pending, Approved, Rejected) and logs expansion views

**Checkpoint**: Admin approval flows and listing rejection comments work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end flow checks, performance optimization, and final compilation validation.

- [x] T032 Verify full end-to-end integration flows using [quickstart.md](quickstart.md) instructions
- [x] T033 Execute backend and frontend compile checks to verify zero warnings and errors build outputs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 Setup. Blocks all User Stories.
- **User Stories (Phases 3 to 6)**: All depend on Phase 2 completion.
  - Phase 3 (US1) and Phase 4 (US2) can progress in parallel.
  - Phase 5 (US3) depends on wizard creation (US2) datasets.
  - Phase 6 (US4) depends on property listings submit workflows (US2).
- **Polish (Phase 7)**: Depends on all User Story phases completion.

---

## Parallel Example: User Story 2

```bash
# Developer A implements media, doc, and floor plan endpoints:
Task T015: "Add upload media endpoint supporting size check limits and file compression..."
Task T016: "Add upload document endpoint supporting public/private toggles..."
Task T017: "Add upload floor plan image endpoint..."

# Developer B builds step-specific UI layout panels:
Task T019: "Build Wizard Step 1 (Basic Info), Step 2 (Location)..."
Task T020: "Build Wizard Step 5 (Media Manager)..."
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)
1. Complete Setup and Foundational migration setup.
2. Build User Story 1 (Workspace list tables) and User Story 2 (9-step wizard with database autosaves).
3. Validate local mock property creation.

### Incremental Delivery
1. Foundation database tables added.
2. Property creation wizard added $\rightarrow$ Verify draft records insertion.
3. Property public detail routing added $\rightarrow$ Verify public/private downloads validation.
4. Property moderation panel added $\rightarrow$ Verify admin approval toggles.
