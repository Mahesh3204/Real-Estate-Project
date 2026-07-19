# Feature Specification: Multi-Role User Management and Role Upgrade Workflow

**Feature Branch**: `004-multi-role-management`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "Implement a flexible multi-role user system that allows a single user account to have one or more roles. Every newly registered user must automatically receive the **Buyer** role. Users can later become a **Seller** or **Agent** without creating a new account. The system must support assigning multiple roles to a single user while enforcing permissions through the existing RBAC system."

## Clarifications

### Session 2026-07-19

- Q: Who is authorized to transition a pending role request to the Cancelled status? → A: Only the user who submitted the request can cancel it (while it is still in the Pending state).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Default Role Assignment on Registration (Priority: P1)

When a new user signs up on the platform, they are automatically assigned the **Buyer** role, giving them immediate access to search and view property listings without needing admin intervention.

**Why this priority**: P1, it defines the default entry behavior for all users and establishes the baseline identity.

**Independent Test**: Register a new user account, then verify that the user's role list contains "Buyer" and that they can browse listings and dashboards.

**Acceptance Scenarios**:

1. **Given** an unregistered visitor, **When** they complete registration, **Then** they are registered successfully and automatically associated with the "Buyer" role.
2. **Given** a user with only the "Buyer" role, **When** they try to remove the "Buyer" role, **Then** the system rejects the operation to prevent users from having zero roles.

---

### User Story 2 - Role Upgrade Request and Workflow (Priority: P1)

A user with the Buyer role can request to become a Seller or an Agent. Depending on platform configuration, this request is either auto-approved or routed to a pending queue for admin review.

**Why this priority**: P1, it provides the core mechanism for users to expand their capabilities (selling properties, managing client listings) under a single account.

**Independent Test**: A Buyer requests to upgrade to Seller/Agent. Verify role request creation and the conditional approval based on the platform's auto-approve configuration.

**Acceptance Scenarios**:

1. **Given** a Buyer user and the platform configured for "Manual Approval Required", **When** they submit a request to become a Seller with a reason, **Then** a Role Request is created in "Pending" status and the user sees a "Your request has been submitted for approval" notification.
2. **Given** a Buyer user and the platform configured for "Auto Approve Role Requests", **When** they request to become a Seller, **Then** the "Seller" role is immediately assigned to their account.

---

### User Story 3 - Admin Role Request Moderation (Priority: P2)

Administrators can view pending role upgrade requests, filter/search through them, and either approve or reject them with review notes.

**Why this priority**: P2, required to support the manual review workflow for platform security and compliance.

**Independent Test**: Log in as an Admin, view the pending requests list, select a request, enter notes, and click Approve or Reject. Verify the database updates the request status and user roles.

**Acceptance Scenarios**:

1. **Given** an Admin on the Admin Role Requests page, **When** they approve a user's pending request to become an Agent, **Then** the request status changes to "Approved", the "Agent" role is added to the user's account, and a "RoleApproved" event is emitted.
2. **Given** an Admin on the Admin Role Requests page, **When** they reject a pending request and provide review notes, **Then** the request status changes to "Rejected", the role is not added to the user's account, and the user can see the rejection reason in their status page.

---

### User Story 4 - Session Active Role Switching (Priority: P2)

A user who possesses multiple roles (e.g. Buyer and Seller) can choose an active role for their current session to adjust their primary UI view, dashboard statistics, and default navigation flows.

**Why this priority**: P2, allows users to separate their activity contexts (e.g., buying vs. listing properties) without needing multiple accounts, whilst retaining aggregate permissions.

**Independent Test**: A user with Buyer and Seller roles toggles their active role to Seller. Verify that the frontend updates to the Seller dashboard layout, while the backend API still permits accessing buyer bookmarks.

**Acceptance Scenarios**:

1. **Given** a user with "Buyer" and "Seller" roles, **When** they switch their active role to "Seller", **Then** their dashboard navigation and defaults switch to the Seller layout.
2. **Given** a user who switched their active role to "Seller", **When** they request a buyer-specific resource (e.g. Saved Bookmarks API), **Then** the request succeeds because permissions are aggregated and not restricted by the active role setting.

---

### User Story 5 - Admin User Management Controls (Priority: P3)

Administrators can view any user's profile to inspect their assigned roles, active role, and change histories, as well as manually assign, remove, enable, or disable roles.

**Why this priority**: P3, administrative management tools that build on top of core workflows for platform maintenance.

**Independent Test**: Admin views a user profile, manually adds the "Agent" role, and saves. Verify the user is granted the role immediately.

**Acceptance Scenarios**:

1. **Given** an Admin on the User Management details view, **When** they manually add the "Agent" role to a user account, **Then** the role is directly associated, and a "RoleAssigned" event is logged.
2. **Given** an Admin, **When** they try to remove the "Admin" role from their own logged-in account, **Then** the operation is blocked to prevent accidental administrative lockout.

---

### Edge Cases

- **Multiple Pending Requests**: If a user already has a pending request for a role (e.g., Seller), the system must block them from submitting another request for the same role until the first is resolved (Approved, Rejected, or Cancelled).
- **Self-Lockout Protection**: The system must enforce that administrators cannot remove the Admin role from themselves.
- **Config Transition**: If the system switches from "Manual Approval" to "Auto Approve", any historical pending requests must remain pending and still require admin action, while new requests are auto-approved.
- **Active Role Invariant**: If an Admin removes a role from a user that was currently set as their active role, the user's active role must automatically fallback to their remaining primary role (e.g., Buyer).
- **Request Cancellation**: Only the user who submitted a role request is authorized to transition it to "Cancelled" status, and this operation is only permitted while the request's status is "Pending".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Newly registered users MUST automatically be assigned the **Buyer** role during the registration transaction.
- **FR-002**: The system MUST support associating multiple roles (e.g. Buyer, Seller, Agent, Admin) to a single user account.
- **FR-003**: The security context for any user request MUST represent the union of all permissions granted by all roles associated with the user account.
- **FR-004**: Users with multiple roles MUST be able to toggle an "active role" property that defines the default navigation dashboard, workspace, and theme defaults for their current session.
- **FR-005**: Switching the active role MUST NOT strip the user of permissions granted by their other assigned roles.
- **FR-006**: Users with the Buyer role MUST be able to submit upgrade requests for "Seller" or "Agent" roles from their profile page.
- **FR-007**: System administrators MUST be able to configure the platform role request processing behavior: "Auto Approve Role Requests" or "Manual Approval Required".
- **FR-008**: When configuration is set to "Auto Approve", requested roles MUST be assigned immediately upon submission.
- **FR-009**: When configuration is set to "Manual Approval Required", requested roles MUST create a `RoleRequest` record in a "Pending" status and alert the user.
- **FR-010**: Administrators MUST be able to search, filter, approve, and reject user role requests.
- **FR-011**: Administrators MUST be able to directly assign, remove, enable, or disable roles for any user.
- **FR-012**: The system MUST validate that a user's active role is one of the roles assigned to them.
- **FR-013**: The system MUST emit domain events on role events: `RoleRequested`, `RoleApproved`, `RoleRejected`, `RoleAssigned`, `RoleRemoved`, and `ActiveRoleChanged`.
- **FR-014**: All role transitions, changes, request submissions, and administrative reviews MUST be logged to the audit system.

### Key Entities

- **User**: Represents a registered user. Expanded to support multiple associated roles and an active role identifier.
- **Role**: Represents a role in the system (Buyer, Seller, Agent, Admin) with its set of permission tags.
- **UserRole**: Junction record representing the many-to-many relationship mapping users to roles.
- **RoleRequest**: Represents a user's request for a role upgrade. Attributes: `UserId`, `RequestedRoleId`, `Status` (Pending, Approved, Rejected, Cancelled), `Reason`, `SubmittedAt`, `ReviewedBy`, `ReviewedAt`, and `ReviewNotes`.
- **RoleRequestHistory**: Record of audit states tracking transitions of role requests.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of newly registered users are assigned the "Buyer" role at the database transaction level on registration.
- **SC-002**: Switching active roles updates the user session metadata and client dashboard layout in less than 1.0 seconds.
- **SC-003**: 100% of role requests, assignments, and removals are audit-logged and trigger domain events.
- **SC-004**: Users are prevented from submitting duplicate role requests or roles they already hold.

## Assumptions

- We assume the system will leverage the existing ASP.NET Core Identity tables and backend authentication infrastructure.
- We assume that the platform configuration for role requests auto-approval is stored in the application database settings table.
- Email or push notification systems are out of scope; notifications will be handled via in-app feeds and future milestone event consumers.
- Identity verification, KYC check documents, or licensing uploads are excluded from this scope.
