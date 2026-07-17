<!--
SYNC IMPACT REPORT
==================
Version Change: 0.0.0 (Template) -> 1.0.0
Modified Principles:
  - [PRINCIPLE_1_NAME] -> Core Principle I: CQRS & Clean Architecture Segregation (Back-End)
  - [PRINCIPLE_2_NAME] -> Core Principle II: Component-Driven Frontend & Premium User Experience (Front-End)
  - [PRINCIPLE_3_NAME] -> Core Principle III: Security, Privacy & Financial Compliance (Non-Negotiable)
  - [PRINCIPLE_4_NAME] -> Core Principle IV: Real-Time & Asynchronous Integration
  - [PRINCIPLE_5_NAME] -> Core Principle V: Automated Testing, Observability & Validation (Non-Negotiable)
Added Sections:
  - Technical Stack Constraints
  - Development and Verification Workflow
Removed Sections:
  - None
Templates Requiring Updates:
  - .specify/templates/checklist-template.md (✅ updated)
  - .specify/templates/constitution-template.md (✅ updated)
  - .specify/templates/plan-template.md (✅ updated)
  - .specify/templates/spec-template.md (✅ updated)
  - .specify/templates/tasks-template.md (✅ updated)
Follow-up TODOs:
  - None
-->

# Real Estate Platform Constitution

## Core Principles

### Core Principle I: CQRS & Clean Architecture Segregation (Back-End)
The back-end must be structured using Clean Architecture and the CQRS (Command Query Responsibility Segregation) pattern with MediatR. Command (write/update) handling must be strictly separated from Query (read-only) handlers. Queries can query the database directly or use thin data layers (e.g., Dapper) for maximum performance, while Commands must enforce all domain business invariants (e.g., using Entity Framework Core and Domain-Driven Design aggregates).
*Rationale:* Ensures the system remains maintainable as the complexity of real estate listings, agent scheduling, booking, payments, and notifications scale. Separating reads from writes improves query optimization and database scalability.

### Core Principle II: Component-Driven Frontend & Premium User Experience (Front-End)
The front-end must be built as a highly responsive React application with reusable, modular components. It must follow strict UX guidelines: rich animations, dark/light theme options, zero layout shifts, optimized image/video loading (crucial for property listings, virtual tours, and floor plans), and premium design aesthetics. All maps (Google Maps) and widgets (EMI calculator, calendar) must be interactive and decoupled.
*Rationale:* Property search is highly visual and interactive. A premium look-and-feel drives user engagement, while component-driven development ensures UI consistency across agent portal, admin panel, and buyer flows.

### Core Principle III: Security, Privacy & Financial Compliance (Non-Negotiable)
User credentials, OTP tokens, and personal data (such as chat histories, visited properties, inquiries, and ratings) must be secured. Authentication must support JWT with secure HTTP-only cookies, OAuth 2.0 (Google), and multi-factor/OTP verification. Payment integration (booking token, payment history, invoices) must handle financial transactions securely via robust payment gateways (e.g., Stripe/Adyen) without storing raw PCI data.
*Rationale:* Building trust is critical for high-value real estate transactions. Robust authentication protects user profiles, agent portals, and sensitive communication logs.

### Core Principle IV: Real-Time & Asynchronous Communication Integration
All notifications (booking confirmations, price drops, alerts), messaging (chat with owner, video consultations), and third-party API integrations (SMS, WhatsApp, email) must be handled asynchronously using background tasks, message queues, or event-driven patterns. Real-time updates (chat messages, push alerts) must use WebSockets/SignalR without blocking user UI threads.
*Rationale:* Real-time buyer-seller chat and instant SMS/WhatsApp/push alerts are core features. Offloading these and heavy integration tasks (like payment webhooks or video consultation setup) prevents performance bottlenecks.

### Core Principle V: Automated Testing, Observability & Validation (Non-Negotiable)
All CQRS commands and queries must have comprehensive automated unit tests verifying behaviors and logic. API request validation must be automated using fluent validation middleware before reaching CQRS handlers. Client-side state transitions, calculations (EMI, search filtering), and critical API clients must have unit/integration tests. Structured logging must record audit logs of listings, booking changes, and payment attempts.
*Rationale:* With 13 core modules (from booking to payments to reviews), a regression in one module could break others. Comprehensive testing and validation ensure the system behaves predictably.

## Technical Stack Constraints
- **Frontend**: React (with Vite or Next.js, state management e.g. Redux Toolkit/Zustand, Tailwind CSS or Vanilla CSS, Leaflet/Google Maps API, Socket.io/SignalR client).
- **Backend**: .NET 8/9 Web API, MediatR (for CQRS), FluentValidation, EF Core (SQL Server/PostgreSQL) for Commands, Dapper or EF Core with `.AsNoTracking()` for Queries, Redis (for caching property search results), SignalR (for real-time chat/notifications), Hangfire/Quartz.net (for background email/SMS tasks).
- **Security & Payments**: JWT Authentication, ASP.NET Core Identity, Stripe API or Razorpay API, SendGrid/Twilio integrations.

## Development and Verification Workflow
1. **Pre-commit Checks**: Run linting (`npm run lint` / `dotnet format`) and local tests before submitting changes.
2. **CQRS Strictness**: Any database modification MUST go through a MediatR Command. Any database read MUST go through a MediatR Query. Controllers must only forward requests to MediatR commands/queries.
3. **Property Listing Lifecycle**: All property addition or modification commands must trigger verification logic or agent review status before publishing.
4. **Validation Pipeline**: FluentValidation rules are evaluated automatically in the MediatR pipeline. If validation fails, return a standard validation error RFC 7807 problem details response.

## Governance
This constitution defines the engineering standards for the Real Estate Platform. All technical planning (`plan.md`) and task breakdown (`tasks.md`) MUST conform to these principles. Changes to these principles require updating this file, incrementing the version, and propagating updates to all templates.
- **Major Bump:** Removal or weakening of principles (e.g. relaxing the CQRS rule).
- **Minor Bump:** Addition of new design guidelines, technologies, or governance criteria.
- **Patch Bump:** Formatting, fixing typos, and wording clarifications.
- All PRs/reviews must verify compliance. Complexity must be justified. Use `README.md` for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-07-17 | **Last Amended**: 2026-07-17
