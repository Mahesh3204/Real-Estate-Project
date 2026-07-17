# Feature Specification: User Authentication & Profile Management

**Feature Branch**: `001-user-auth`

**Created**: 2026-07-17

**Status**: Draft

**Input**: User description: "Create a User Authentication module with email/password login, Google OAuth, OTP verification, JWT authentication, role-based access (Admin, Agent, Buyer, Seller), profile management, password reset, favorites, recently viewed properties, property comparison, and inquiry history."

## Clarifications

### Session 2026-07-17

- Q: What are the security policies for user password complexity and the session token (JWT) lifetime? → A: Standard Security: Minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character; JWT session token lasts 1 hour with a long-lived refresh token.
- Q: What are the valid states and lifecycle transitions for a property inquiry (PropertyInquiry status)? → A: Fully Managed: Status transitions through Submitted, Read, Responded, and Closed/Archived.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration & Core Authentication (Priority: P1)

**Why this priority**: Registering and logging in users securely is the entry point for all other platform features. Without a secure session, role-based controls cannot exist.

**Independent Test**: A new user can register an account, authenticate via their credentials, and receive an active, role-specific session.

**Acceptance Scenarios**:

1. **Given** a guest user on the registration page, **When** they fill in valid details (email, password, name) and select a role (Buyer/Seller/Agent), **Then** their account is created and they receive a verification code.
2. **Given** a registered user, **When** they log in with the correct email and password, **Then** they are granted access to the platform corresponding to their assigned role.
3. **Given** a guest user, **When** they authenticate using their Google account, **Then** they are logged in, and a new account is automatically provisioned for them if they do not already have one.

---

### User Story 2 - Account Verification & Recovery (Priority: P2)

**Why this priority**: Email verification using One-Time Passwords (OTP) and self-service password recovery are essential for security and account maintenance.

**Independent Test**: A user can verify their new registration and recover access to a locked account without administrator intervention.

**Acceptance Scenarios**:

1. **Given** a newly registered unverified account, **When** the user enters the correct OTP sent to their email, **Then** their account status is updated to verified and they can access post-auth features.
2. **Given** a registered user who forgot their password, **When** they request a password reset and click the secure reset link received in their email, **Then** they can define a new password and log in successfully.

---

### User Story 3 - User Profiles & Inquiry History (Priority: P3)

**Why this priority**: Users need to maintain their personal details and track their interactions with listings, owners, and agents over time.

**Independent Test**: A logged-in user can update their profile information and view all their submitted property inquiries in chronological order.

**Acceptance Scenarios**:

1. **Given** a logged-in user on their profile page, **When** they modify their contact information and save, **Then** the updated profile is saved and reflected across the app.
2. **Given** a buyer who has previously inquired about multiple properties, **When** they view their inquiry history dashboard, **Then** they see a list of their past inquiries, status updates, and contact history.

---

### User Story 4 - Favorites, History & Property Comparison (Priority: P4)

**Why this priority**: Provides utility tools that enhance the buyer and seller shopping experience, enabling engagement and returning visits.

**Independent Test**: A buyer can save favorites, view their browsing history, and add multiple properties to a comparison matrix.

**Acceptance Scenarios**:

1. **Given** a logged-in buyer viewing a property listing, **When** they select the option to save the property, **Then** it is added to their favorites list.
2. **Given** a logged-in buyer, **When** they navigate to their dashboard, **Then** they see a chronological history of the properties they recently viewed.
3. **Given** a buyer on the platform, **When** they select up to 4 properties and click compare, **Then** they see a side-by-side comparison of specifications, pricing, amenities, and location details.

### Edge Cases

- **Duplicate Registration**: A guest tries to register using an email address that is already registered. The system must prevent duplicate account creation and return a user-friendly message.
- **Expired/Invalid OTP**: A user inputs an OTP that has expired or is incorrect. The system must show a validation error, track retry attempts, and allow requesting a new code.
- **Agent Registration Approval**: Agents can register and access their portal immediately. They are allowed to create draft property listings, but these listings will remain in a "Pending Review" status and cannot be published or seen by the public until an administrator verifies the agent's profile.
- **Deleted Properties in Favorites/Comparison**: A user views a saved property or comparison list, but one of the properties has been deleted by its seller. The system must gracefully handle the missing listing by indicating it is no longer available.
- **Inquiry Scope Constraints**: Inquiry messages are primarily private between the buyer and the listing owner/agent, but they are logged and auditable by platform administrators to monitor compliance, resolve disputes, and prevent fraudulent listings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support registering users with an email address, name, password (minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character), and designated role (Admin, Agent, Buyer, Seller).
- **FR-002**: The system MUST generate and send a temporary One-Time Password (OTP) to the user's email for registration verification and password recovery.
- **FR-003**: The system MUST support authentication using email and password credentials.
- **FR-004**: The system MUST support single sign-on (SSO) using Google Accounts.
- **FR-005**: The system MUST issue secure session tokens (JWT) to authenticated clients to authorize role-based actions. The JWT token lifetime MUST be 1 hour, supported by a long-lived refresh token.
- **FR-006**: The system MUST enforce role-based access control (RBAC), restricting agent and admin features to authorized users.
- **FR-006a**: The system MUST restrict listing publication for unverified agents, keeping listings in 'Pending Review' status until the agent profile verification is completed by an Admin.
- **FR-006b**: Administrators MUST be able to view and audit all buyer-agent property inquiries.
- **FR-007**: Logged-in users MUST be able to view, edit, and update their profile details (name, contact number, profile picture).
- **FR-008**: Logged-in users MUST be able to save property listings to a favorites/wishlist.
- **FR-009**: The system MUST log recently viewed properties for logged-in users and display them in chronological order.
- **FR-010**: The system MUST track and display a user's property inquiry history, supporting status transitions (Submitted, Read, Responded, Closed, Archived) and filtering by status.
- **FR-011**: The system MUST support selecting and comparing specs of up to 4 properties concurrently.

### Key Entities *(include if feature involves data)*

- **User**: Represents a platform user. Attributes include Name, Email, PasswordHash, Phone, ProfilePicture, Role, VerificationStatus, CreatedDate.
- **Role**: Represents authorization level (Admin, Agent, Buyer, Seller).
- **PropertyFavorite**: Represents a user's saved property listing. References User ID and Property ID.
- **PropertyInquiry**: Represents a communication inquiry submitted by a buyer/user regarding a property. References User ID, Property ID, Message, Status (Submitted, Read, Responded, Closed, Archived), Timestamp.
- **RecentlyViewed**: Logs a user's view action on a property. References User ID, Property ID, Timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can register and log in to the platform in under 30 seconds.
- **SC-002**: The user's secure session token is validated on every restricted API call with less than 20ms of processing overhead.
- **SC-003**: Retrieving favorites, recently viewed history, and property comparison metrics completes in under 1 second.
- **SC-004**: Self-service password recovery requests complete within a 3-step wizard in under 2 minutes.

## Assumptions

- The platform relies on an external mail service provider to deliver OTP and password reset emails.
- Standard JWT expiration policies apply, requiring token refreshes for continuous sessions.
- Property details shown in favorites and comparison are managed by a separate Property Module.
