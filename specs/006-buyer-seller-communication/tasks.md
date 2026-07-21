# Tasks: Buyer & Seller Communication Platform

**Input**: Design documents from `/specs/006-buyer-seller-communication/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests are included in the task list to comply with backend MediatR and frontend test validation policies.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` (Clean Architecture folders: Domain, Application, Infrastructure, API)
- **Frontend**: `frontend/src/` (Vite React application folders: components, pages, services, store)
- **Tests**: `backend/tests/Application.UnitTests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Register entities in DbContext in backend/src/Infrastructure/Persistence/ApplicationDbContext.cs
- [ ] T002 Create database migrations in backend/src/Infrastructure/Persistence/Migrations/
- [ ] T003 Setup backend SignalR configuration in backend/src/API/Program.cs
- [ ] T004 Create SignalR client hooks and hubs state slices in frontend/src/store/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Setup basic SignalR hubs in backend/src/API/Hubs/
- [ ] T006 [P] Define common DTOs and mappings in backend/src/Application/Common/Mappings/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Inquiry Management (Priority: P1) 🎯 MVP

**Goal**: Allow buyers to submit inquiries, and sellers/agents to view, reply, change status, and soft-delete inquiry history.

**Independent Test**: Submitting an inquiry creates a record in database, replies update state, and soft deletes hide items from API.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create Inquiry Domain Entity in backend/src/Domain/Entities/Inquiry.cs
- [ ] T008 [US1] Write unit tests for Inquiry commands in backend/tests/Application.UnitTests/
- [ ] T009 [US1] Implement CreateInquiryCommand and validator in backend/src/Application/Features/Inquiries/Commands/CreateInquiryCommand.cs
- [ ] T010 [US1] Implement GetInquiriesQuery for seller/admin in backend/src/Application/Features/Inquiries/Queries/GetInquiriesQuery.cs
- [ ] T011 [US1] Implement ReplyToInquiryCommand and validator in backend/src/Application/Features/Inquiries/Commands/ReplyToInquiryCommand.cs
- [ ] T012 [US1] Implement SoftDeleteInquiryCommand in backend/src/Application/Features/Inquiries/Commands/SoftDeleteInquiryCommand.cs
- [ ] T013 [US1] Register Inquiry controller endpoints in backend/src/API/Controllers/InquiriesController.cs
- [ ] T014 [US1] Implement Inquiry Form Modal component in frontend/src/components/Communication/InquiryModal.tsx
- [ ] T015 [US1] Implement Inquiry Detail Page and Reply interface in frontend/src/pages/Communication/InquiryInboxPage.tsx
- [ ] T016 [US1] Connect Inquiry routes and verify E2E in frontend/src/App.tsx

**Checkpoint**: Inquiry management is fully functional and testable independently.

---

## Phase 4: User Story 2 - Property Visit Appointment (Priority: P1)

**Goal**: Schedule property visits (date, time, visitors), approve, reject, reschedule, or cancel bookings.

**Independent Test**: Buyer requests a viewing, which seller reviews in calendar and accepts, updating the state to Approved.

### Implementation for User Story 2

- [ ] T017 [P] [US2] Create Appointment Domain Entity in backend/src/Domain/Entities/Appointment.cs
- [ ] T018 [US2] Write unit tests for Appointment commands in backend/tests/Application.UnitTests/
- [ ] T019 [US2] Implement BookAppointmentCommand and validator in backend/src/Application/Features/Appointments/Commands/BookAppointmentCommand.cs
- [ ] T020 [US2] Implement UpdateAppointmentStatusCommand in backend/src/Application/Features/Appointments/Commands/UpdateAppointmentStatusCommand.cs
- [ ] T021 [US2] Implement GetAppointmentsQuery for Calendar & List views in backend/src/Application/Features/Appointments/Queries/GetAppointmentsQuery.cs
- [ ] T022 [US2] Register Appointment controller endpoints in backend/src/API/Controllers/AppointmentsController.cs
- [ ] T023 [US2] Implement Visit Booking Modal in frontend/src/components/Communication/BookingModal.tsx
- [ ] T024 [US2] Implement Appointment Calendar and List views in frontend/src/pages/Communication/AppointmentsPage.tsx
- [ ] T025 [US2] Connect Appointment routes and verify E2E in frontend/src/App.tsx

**Checkpoint**: Appointment booking is fully operational.

---

## Phase 5: User Story 3 - Real-Time Chat (Priority: P1)

**Goal**: Direct property-based messenger, online presence, typing indicators, and read receipts.

**Independent Test**: Sending a message appears immediately on receiver's thread, showing delivery/read markers.

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create Conversation and Message Domain Entities in backend/src/Domain/Entities/
- [ ] T027 [US3] Write unit tests for Chat commands in backend/tests/Application.UnitTests/
- [ ] T028 [US3] Implement ChatHub SignalR methods for SendMessage, MarkAsRead, and SendTypingState in backend/src/API/Hubs/ChatHub.cs
- [ ] T029 [US3] Implement GetConversationsQuery with search and unread counts in backend/src/Application/Features/Chat/Queries/GetConversationsQuery.cs
- [ ] T030 [US3] Implement GetMessagesQuery with pagination in backend/src/Application/Features/Chat/Queries/GetMessagesQuery.cs
- [ ] T031 [US3] Register Chat controller endpoints in backend/src/API/Controllers/ChatController.cs
- [ ] T032 [US3] Implement Messenger Page layout in frontend/src/pages/Communication/MessengerPage.tsx
- [ ] T033 [US3] Implement Chat window, Composer, and Typing indicator in frontend/src/components/Communication/ChatWindow.tsx
- [ ] T034 [US3] Connect Chat routes and verify E2E in frontend/src/App.tsx

**Checkpoint**: Real-time chat works dynamically.

---

## Phase 6: User Story 4 - Offers & Negotiation (Priority: P2)

**Goal**: Place financial bids, accept, reject, counter, view comparative negotiation timelines, and auto-inject interactive cards into chat threads.

**Independent Test**: Placing a counter-offer inserts a summary card in the chat timeline, and accepting updates the negotiation state.

### Implementation for User Story 4

- [ ] T035 [P] [US4] Create Offer Domain Entity in backend/src/Domain/Entities/Offer.cs
- [ ] T036 [US4] Write unit tests for Offer commands in backend/tests/Application.UnitTests/
- [ ] T037 [US4] Implement CreateOfferCommand and validator in backend/src/Application/Features/Offers/Commands/CreateOfferCommand.cs
- [ ] T038 [US4] Implement CounterOfferCommand in backend/src/Application/Features/Offers/Commands/CounterOfferCommand.cs
- [ ] T039 [US4] Implement UpdateOfferStatusCommand in backend/src/Application/Features/Offers/Commands/UpdateOfferStatusCommand.cs
- [ ] T040 [US4] Implement GetOfferNegotiationTimelineQuery in backend/src/Application/Features/Offers/Queries/GetOfferNegotiationTimelineQuery.cs
- [ ] T041 [US4] Add handler to inject interactive Offer card messages into ChatHub thread on offer update in backend/src/Application/Features/Offers/EventHandlers/
- [ ] T042 [US4] Register Offer controller endpoints in backend/src/API/Controllers/OffersController.cs
- [ ] T043 [US4] Implement Offer Submission and Counter dialog modals in frontend/src/components/Communication/OfferModal.tsx
- [ ] T044 [US4] Implement Negotiation Timeline page in frontend/src/pages/Communication/NegotiationPage.tsx
- [ ] T045 [US4] Implement Interactive Offer Card inside ChatWindow in frontend/src/components/Communication/OfferChatCard.tsx
- [ ] T046 [US4] Connect Offer routes and verify E2E in frontend/src/App.tsx

**Checkpoint**: Negotiation flows run in dashboard and chat thread.

---

## Phase 7: User Story 5 - In-App Notifications (Priority: P2)

**Goal**: Live notification alerts, unread counts badge, mark as read, delete history.

**Independent Test**: Workflow actions (inquiries, appointments, chat) instantly update target user's notification list.

### Implementation for User Story 5

- [ ] T047 [P] [US5] Create Notification Domain Entity in backend/src/Domain/Entities/Notification.cs
- [ ] T048 [US5] Write unit tests for Notification commands/events in backend/tests/Application.UnitTests/
- [ ] T049 [US5] Implement NotificationHub SignalR client broadcast service in backend/src/API/Hubs/NotificationHub.cs
- [ ] T050 [US5] Implement GetNotificationsQuery with unread counts in backend/src/Application/Features/Notifications/Queries/GetNotificationsQuery.cs
- [ ] T051 [US5] Implement MarkNotificationAsReadCommands in backend/src/Application/Features/Notifications/Commands/MarkNotificationAsReadCommand.cs
- [ ] T052 [US5] Implement MediatR Domain Event Handlers to auto-generate and push notifications in backend/src/Application/Features/Notifications/EventHandlers/
- [ ] T053 [US5] Register Notification controller endpoints in backend/src/API/Controllers/NotificationsController.cs
- [ ] T054 [US5] Implement Notification Dropdown Navigation component in frontend/src/components/Layout/NotificationDropdown.tsx
- [ ] T055 [US5] Implement Notification Center page in frontend/src/pages/Communication/NotificationsPage.tsx
- [ ] T056 [US5] Connect Notification routes and verify E2E in frontend/src/App.tsx

**Checkpoint**: In-app notifications deliver in real-time.

---

## Phase 8: User Story 6 - Reviews and Ratings (Priority: P2)

**Goal**: Gated post-visit/purchase feedback (1-5 stars, images), replies, and administrative moderation.

**Independent Test**: Non-eligible buyers are blocked; eligible ratings update seller profile statistics instantly.

### Implementation for User Story 6

- [ ] T057 [P] [US6] Create Review Domain Entity in backend/src/Domain/Entities/Review.cs
- [ ] T058 [US6] Write unit tests for Review commands in backend/tests/Application.UnitTests/
- [ ] T059 [US6] Implement SubmitReviewCommand with completion validation in backend/src/Application/Features/Reviews/Commands/SubmitReviewCommand.cs
- [ ] T060 [US6] Implement ReplyToReviewCommand and ReportReviewCommand in backend/src/Application/Features/Reviews/Commands/
- [ ] T061 [US6] Implement GetReviewsQuery with average ratings and distribution in backend/src/Application/Features/Reviews/Queries/GetReviewsQuery.cs
- [ ] T062 [US6] Register Review controller endpoints in backend/src/API/Controllers/ReviewsController.cs
- [ ] T063 [US6] Implement Review Form Modal and Rating stars selection in frontend/src/components/Communication/ReviewModal.tsx
- [ ] T064 [US6] Implement Review Card list, Seller Reply panel, and Rating Summary widget in frontend/src/components/Communication/ReviewSection.tsx
- [ ] T065 [US6] Connect Review components on Property & Seller pages and verify E2E in frontend/src/pages/Profile/PublicProfilePage.tsx

**Checkpoint**: Review platform functions securely.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: System optimization, cleanup, and E2E validation

- [ ] T066 [P] Update backend database configuration for soft-delete query filters in backend/src/Infrastructure/Persistence/Configurations/
- [ ] T067 Code cleanup, styling linting, and formatting checks in backend and frontend
- [ ] T068 Run quickstart.md validation scripts and verify all APIs return valid payloads in specs/006-buyer-seller-communication/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phases 3+)**: All depend on Foundational completion.
- **Polish (Phase 9)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (Inquiries)**, **User Story 2 (Appointments)**, and **User Story 3 (Real-Time Chat)** can run in parallel after Phase 2 is completed.
- **User Story 4 (Offers)** depends on Chat (US3) components to render offer message cards.
- **User Story 5 (Notifications)** depends on US1, US2, US3, and US4 endpoints to trigger alerts.
- **User Story 6 (Reviews)** depends on completed appointments (US2) to validate review eligibility.

### Parallel Opportunities

- Tasks marked with `[P]` (entities, unit test folders, hubs configurations) can run in parallel.
- Frontend component layouts and mock styles can be built in parallel with backend MediatR feature logic.

---

## Parallel Example: User Story 1

```bash
# Developer A: Create database models and tests:
Task: "Create Inquiry Domain Entity in backend/src/Domain/Entities/Inquiry.cs"
Task: "Write unit tests for Inquiry commands in backend/tests/Application.UnitTests/"

# Developer B: Draft frontend interfaces:
Task: "Implement Inquiry Form Modal component in frontend/src/components/Communication/InquiryModal.tsx"
Task: "Implement Inquiry Detail Page and Reply interface in frontend/src/pages/Communication/InquiryInboxPage.tsx"
```

---

## Implementation Strategy

### MVP First (Inquiries + Appointments + Chat)

1.  Complete Phase 1 (Setup) and Phase 2 (Foundational).
2.  Complete Phase 3 (US1 - Inquiries) and Phase 4 (US2 - Appointments).
3.  Complete Phase 5 (US3 - Chat).
4.  **STOP and VALIDATE**: Verify communication channels function.

### Incremental Delivery
1.  Setup & Foundation → Baseline ready.
2.  Add Inquiries & Appointments → Verify.
3.  Add Real-Time Chat → Verify.
4.  Add Offers & Negotiations → Verify integration.
5.  Add Notifications & Reviews → Complete milestone.
