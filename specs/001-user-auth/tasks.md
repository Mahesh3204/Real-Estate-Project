# Tasks: User Authentication & Profile Management

**Input**: Design documents from `/specs/001-user-auth/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests are required per Project Constitution Principle V.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and base structural configuration.

- [x] T001 Initialize backend projects structure at `backend/src/Domain/`, `backend/src/Application/`, `backend/src/Infrastructure/`, and `backend/src/API/`.
- [x] T002 [P] Initialize React frontend project with TypeScript at `frontend/` using Vite.
- [x] T003 Configure EF Core DbContext connection settings in `backend/src/Infrastructure/Data/ApplicationDbContext.cs`.
- [x] T004 Set up MediatR pipeline and FluentValidation behavior in `backend/src/Application/DependencyInjection.cs`.
- [x] T005 [P] Configure global Axios API client instance and route mapping in `frontend/src/services/apiClient.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core security middleware, identity stores, and shared global state management.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Configure ASP.NET Core Identity authentication and JWT middleware rules in `backend/src/API/Program.cs` and `backend/src/Infrastructure/Security/JwtTokenGenerator.cs`.
- [x] T007 [P] Implement global Exception Handling middleware in `backend/src/API/Middleware/ExceptionHandlingMiddleware.cs`.
- [x] T008 Implement user auth state management store in `frontend/src/store/authStore.ts` to persist session JWT credentials.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - User Registration & Core Authentication (Priority: P1) 🎯 MVP

**Goal**: Establish registration, credential-based login, Google Single Sign-on, and role-based permissions.

**Independent Test**: Register a new user, log in, retrieve JWT, verify Google OAuth token, and view role-restricted dashboards.

### Tests for User Story 1
- [x] T009 [P] [US1] Write unit tests for user registration command in `backend/tests/Application.UnitTests/Users/Commands/RegisterUserTests.cs`.
- [x] T010 [P] [US1] Write unit tests for credentials login query in `backend/tests/Application.UnitTests/Users/Commands/LoginUserTests.cs`.
- [x] T011 [P] [US1] Write unit tests for Google login token validation in `backend/tests/Application.UnitTests/Users/Commands/GoogleLoginTests.cs`.

### Implementation for User Story 1
- [x] T012 [US1] Implement User model properties and Role mappings in `backend/src/Domain/Entities/User.cs`.
- [x] T013 [US1] Implement RegisterUserCommand, validator, and API controller endpoint `POST /api/auth/register` in `backend/src/Application/Users/Commands/RegisterUser/RegisterUserCommand.cs` and `backend/src/API/Controllers/AuthController.cs`.
- [x] T014 [US1] Implement LoginUserCommand, credentials validator, and controller endpoint `POST /api/auth/login` in `backend/src/Application/Users/Commands/LoginUser/LoginUserCommand.cs` and `backend/src/API/Controllers/AuthController.cs`.
- [x] T015 [US1] Implement GoogleLoginCommand and Google payload token verification handler in `backend/src/Application/Users/Commands/GoogleLogin/GoogleLoginCommand.cs` and endpoint `POST /api/auth/google`.
- [x] T016 [US1] Create registration and login form UI layouts in `frontend/src/pages/Register/RegisterPage.tsx` and `frontend/src/pages/Login/LoginPage.tsx`.
- [x] T017 [US1] Create Google login button integration in `frontend/src/components/Auth/GoogleLoginButton.tsx` and verify user redirecting to role-based portals.

**Checkpoint**: Core authentication (P1) is fully functional and testable.

---

## Phase 4: User Story 2 - Account Verification & Recovery (Priority: P2)

**Goal**: Support verifying profile via email One-Time Passwords (OTP) and requesting self-service password resets.

**Independent Test**: Enter OTP to switch account to verified state, trigger reset email, and submit new credentials.

### Tests for User Story 2
- [x] T018 [P] [US2] Write unit tests for OTP verification in `backend/tests/Application.UnitTests/Users/Commands/VerifyOtpTests.cs`.
- [x] T019 [P] [US2] Write unit tests for forgot/reset password workflows in `backend/tests/Application.UnitTests/Users/Commands/ResetPasswordTests.cs`.

### Implementation for User Story 2
- [x] T020 [US2] Implement temporary email message delivery service in `backend/src/Infrastructure/Mail/EmailSender.cs`.
- [x] T021 [US2] Implement VerifyOtpCommand and controller endpoint `POST /api/auth/verify` in `backend/src/Application/Users/Commands/VerifyOtp/VerifyOtpCommand.cs` and `backend/src/API/Controllers/AuthController.cs`.
- [x] T022 [US2] Implement ForgotPasswordCommand, ResetPasswordCommand, and controller endpoints `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` in `backend/src/Application/Users/Commands/ResetPassword/` and `backend/src/API/Controllers/AuthController.cs`.
- [x] T023 [US2] Create verification prompt wizard interface in `frontend/src/pages/Register/VerifyPage.tsx`.
- [x] T024 [US2] Create password recovery request forms in `frontend/src/pages/Login/ResetPasswordPage.tsx`.

**Checkpoint**: User account lifecycle verification and security recovery (P2) is complete.

---

## Phase 5: User Story 3 - User Profiles & Inquiry History (Priority: P3)

**Goal**: Enable editing user profile details and viewing submitted property inquiry tracking history.

**Independent Test**: Update name and phone number on profile, send inquiries to agents, and check inquiry states.

### Tests for User Story 3
- [x] T025 [P] [US3] Write unit tests for updating user profiles in `backend/tests/Application.UnitTests/Users/Commands/UpdateProfileTests.cs`.
- [x] T026 [P] [US3] Write unit tests for submitting and retrieving inquiries in `backend/tests/Application.UnitTests/Inquiries/InquiryTests.cs`.

### Implementation for User Story 3
- [x] T027 [US3] Create PropertyInquiry schema and status model in `backend/src/Domain/Entities/PropertyInquiry.cs`.
- [x] T028 [US3] Implement GetUserProfileQuery, UpdateUserProfileCommand, and controller endpoints `GET/PUT /api/user/profile` in `backend/src/Application/Users/` and `backend/src/API/Controllers/UserController.cs`.
- [x] T029 [US3] Implement CreateInquiryCommand, GetInquiryHistoryQuery, and endpoints `GET/POST /api/user/inquiries` in `backend/src/Application/Inquiries/` and `backend/src/API/Controllers/InquiryController.cs`.
- [x] T030 [US3] Implement UpdateInquiryStatusCommand and endpoint `PATCH /api/user/inquiries/{inquiryId}/status` in `backend/src/Application/Inquiries/Commands/` and `backend/src/API/Controllers/InquiryController.cs`.
- [x] T031 [US3] Create profile page forms and historical inquiry timeline in `frontend/src/pages/Profile/ProfilePage.tsx` and `frontend/src/pages/Profile/InquiryHistoryPage.tsx`.

**Checkpoint**: Profiles and inquiry logging modules (P3) are complete.

---

## Phase 6: User Story 4 - Favorites, History & Property Comparison (Priority: P4)

**Goal**: Bookmark properties, trace recently viewed pages, and compare specifications side-by-side.

**Independent Test**: Toggle property favorites bookmarks, view recently browsed listings, and select up to 4 listings for comparison matrix.

### Tests for User Story 4
- [x] T032 [P] [US4] Write unit tests for property favorites bookmarks in `backend/tests/Application.UnitTests/Favorites/FavoritesTests.cs`.
- [x] T033 [P] [US4] Write unit tests for recently viewed cache tracking in `backend/tests/Application.UnitTests/History/RecentlyViewedTests.cs`.

### Implementation for User Story 4
- [x] T034 [US4] Create PropertyFavorite and RecentlyViewed schemas in `backend/src/Domain/Entities/`.
- [x] T035 [US4] Implement AddToFavoritesCommand, RemoveFromFavoritesCommand, GetFavoritesQuery, and endpoints `GET/POST/DELETE` under `/api/user/favorites` in `backend/src/Application/Favorites/` and `backend/src/API/Controllers/UserController.cs`.
- [x] T036 [US4] Implement GetRecentlyViewedQuery, AddRecentlyViewedCommand, and endpoints `/api/user/recently-viewed` using Redis storage in `backend/src/Application/History/` and `backend/src/API/Controllers/UserController.cs`.
- [x] T037 [US4] Create favorites dashboard list in `frontend/src/pages/Profile/FavoritesPage.tsx`.
- [x] T038 [US4] Create property comparison matrix page in `frontend/src/pages/Compare/ComparePage.tsx`.

**Checkpoint**: Favorites bookmarks, view tracking, and comparison (P4) are complete.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Style code cleaning, accessibility tags checking, and final API integrations testing.

- [x] T039 [P] Run linter and formatting checks on frontend code (`npm run lint` and `npm run format`).
- [x] T040 [P] Run code formatting checks on .NET backend (`dotnet format`).
- [x] T041 Validate all end-to-end user scenarios outlined in `quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phases 3-6)**: Depends on Foundational completion.
  - Can proceed in parallel or sequentially: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4).
- **Polish (Phase N)**: Depends on all user stories completion.

---

## Parallel Opportunities

- All Setup and Foundational tasks marked `[P]` can run in parallel.
- All testing tasks marked `[P]` within each user story phase can run in parallel with each other.
- Once Foundational phase is complete, US1 (P1), US2 (P2), US3 (P3), and US4 (P4) can be developed in parallel by separate developers.
- Frontend views (`T016`, `T023`, `T031`, `T037`) and backend APIs (`T013`, `T021`, `T029`, `T035`) can be developed in parallel once domain model definitions are ready.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup (Phase 1).
2. Complete Foundational (Phase 2).
3. Complete User Story 1 (Phase 3).
4. Run manual verification of Scenario 2 (Login and Access Control) in `quickstart.md` to establish MVP.
