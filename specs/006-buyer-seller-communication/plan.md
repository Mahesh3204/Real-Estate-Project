# Implementation Plan: Buyer & Seller Communication Platform

**Branch**: `006-buyer-seller-communication` | **Date**: 2026-07-21 | **Spec**: [spec.md](file:///d:/Projects/Real-Estate-Project/specs/006-buyer-seller-communication/spec.md)

**Input**: Feature specification from `/specs/006-buyer-seller-communication/spec.md`

## Summary

Implement the complete communication and negotiation layer of the Real Estate platform. This includes inquiry management, property visit appointments (calendar + list views), real-time chat with SignalR, in-app notifications, structured price negotiations (offers and counter-offers), and verification-gated reviews. The backend is built using ASP.NET Core Web API with MediatR CQRS and Clean Architecture, while the frontend is built using React with Tailwind CSS and React Icons.

## Technical Context

**Language/Version**: C# (.NET 8/9), TypeScript 5.x

**Primary Dependencies**: 
- Backend: MediatR, FluentValidation, EF Core (SQL Server / PostgreSQL), SignalR (for real-time events)
- Frontend: React 18, Tailwind CSS, React Icons, SignalR JS Client

**Storage**: EF Core (SQL Server/PostgreSQL) with SQL migrations. Redis for cache optimization of counts/dashboard stats (optional, as needed).

**Testing**: xUnit, FluentAssertions, NSubstitute (for backend Application unit tests)

**Target Platform**: Web (Desktop, Tablet, Mobile responsive)

**Project Type**: Web Application (React SPA + ASP.NET Core REST API & WebSockets)

**Performance Goals**:
- Chat message propagation and notification receipt in under 1.5 seconds.
- Review recalculation and dashboard statistics response times under 200ms (p95).

**Constraints**:
- Must adhere strictly to Clean Architecture and CQRS separation in the backend.
- All write requests must go through MediatR Commands.
- All read requests must go through MediatR Queries.
- Frontend components must follow the existing Tailwind CSS styles in index.css.

**Scale/Scope**: Support 10k active users, handle up to 50 concurrent active chat connections per seller/agent, paginate all list responses.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Compliance Plan | Status |
|---|---|---|
| **Core Principle I: CQRS Backend** | All communication/negotiation logic will reside in MediatR Commands (e.g. `CreateInquiryCommand`) and Queries (e.g. `GetInquiriesQuery`). Database modifications are strictly restricted to Commands. | ✅ Compliant |
| **Core Principle II: Component-Driven Frontend** | Create reusable components under `frontend/src/components/Common` or `Communication` folder, reusing existing modals and styling tokens. | ✅ Compliant |
| **Core Principle III: Security & Privacy** | Protect communication APIs with standard JWT authorization middleware. Implement resource ownership checks (e.g. users can only access their own inquiries/chats/offers). | ✅ Compliant |
| **Core Principle IV: Real-Time & Asynchronous Integration** | Chat message delivery and in-app notifications will run over SignalR hubs asynchronously. In-app notifications will be created via event handlers triggered by MediatR Domain Events. | ✅ Compliant |
| **Core Principle V: Automated Testing & Validation** | Include FluentValidation rules for all CQRS command payloads. Implement unit tests for all commands and queries under `tests/Application.UnitTests`. | ✅ Compliant |

## Project Structure

### Documentation (this feature)

```text
specs/006-buyer-seller-communication/
├── spec.md              # Feature specification
├── plan.md              # This file (Technical plan & gates)
├── research.md          # Phase 0 output (Technical choices & state lifecycles)
├── data-model.md        # Phase 1 output (Entity mapping & DB schemas)
├── quickstart.md        # Phase 1 output (E2E run/verification guide)
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── API/
│   │   ├── Controllers/          # REST Endpoints for Inquiries, Appointments, Offers, Reviews
│   │   └── Hubs/                 # SignalR ChatHub and NotificationHub
│   ├── Application/
│   │   ├── Common/               # Behaviors, Interfaces, Mapping
│   │   └── Features/             # CQRS Commands, Queries, Validators, and Event Handlers
│   ├── Domain/
│   │   └── Entities/             # Inquiry, Appointment, Conversation, Message, Notification, Offer, Review
│   └── Infrastructure/           # DB Context, EF Configurations, SignalR Services
└── tests/
    └── Application.UnitTests/    # CQRS unit tests

frontend/
├── src/
│   ├── components/
│   │   ├── Common/               # Reusable ConfirmationModal, Toast, Loader
│   │   └── Communication/        # ChatBox, AppointmentCalendar, OfferForm, ReviewCards
│   ├── pages/
│   │   └── Communication/        # InboxPage, NotificationsPage, OfferTimelinePage
│   ├── services/                 # API client services (SignalR hooks, Axios calls)
│   └── store/                    # Zustand/Redux slices for chat and notification states
```

**Structure Decision**: Web application layout containing segregated backend and frontend folders. Backend utilizes Clean Architecture projects (`Domain`, `Application`, `Infrastructure`, `API`) and frontend utilizes standard React components/pages layout.

## Complexity Tracking

> *No current constitutional violations or deviations are proposed. All development will strictly conform to the established CQRS and Clean Architecture principles.*
