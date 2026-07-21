# Feature Specification: Buyer & Seller Communication Platform

**Feature Branch**: `006-buyer-seller-communication`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "Implement the complete communication layer of the Real Estate platform. This milestone enables buyers and sellers to communicate, schedule property visits, negotiate offers, exchange messages, receive notifications, and leave reviews."

## Clarifications

### Session 2026-07-21

- Q: Should offer negotiations be integrated directly into the real-time chat conversation interface as interactive messages, or managed in a separate negotiation/offer dashboard? → A: Hybrid Approach: Offers are created/managed via a dedicated flow/dashboard, but automatically inject live summary cards in the chat conversation thread.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inquiry Management (Priority: P1)

As an authenticated buyer, I want to submit inquiries on a property page so that I can ask the owner or agent specific questions. As a seller or agent, I want to view my received inquiries, change their status, post replies, and soft-delete inquiry history.

**Why this priority**: Inquiries are the initial contact point between prospective buyers and sellers. Enabling this forms the baseline interaction.

**Independent Test**: An authenticated buyer navigates to a property detail page, fills out the inquiry form, and submits it. The seller logs in, views the inquiry in their inbox, marks it as "Read" or "In Progress", replies to the buyer, and soft-deletes it if desired.

**Acceptance Scenarios**:

1. **Given** an authenticated buyer is on a property listing page, **When** they submit an inquiry with valid fields (Subject, Message, Phone, Email, Preferred Contact Method, Preferred Contact Time), **Then** the inquiry is successfully recorded with status "New" and a notification is sent to the property owner/agent.
2. **Given** a guest user is on a property listing page, **When** they try to open the inquiry form, **Then** they are redirected to the login page.
3. **Given** a seller views their inquiry inbox, **When** they open a "New" inquiry, **Then** the status automatically changes to "Read".
4. **Given** an inquiry is open, **When** the seller submits a reply, **Then** the status updates to "Replied" and the buyer is notified.
5. **Given** a seller wants to clean up their dashboard, **When** they choose to delete an inquiry, **Then** the inquiry is soft-deleted (hidden from the seller's lists but retained in database).

---

### User Story 2 - Property Visit Appointment (Priority: P1)

As a buyer, I want to schedule a property visit by specifying a date, time, message, and visitor count. As a seller or agent, I want to manage these bookings by accepting, rejecting, countering with another time, or completing the visits.

**Why this priority**: Property viewings are a crucial step in the real-estate transaction funnel. Real-time calendar coordination prevents double bookings and aligns schedules.

**Independent Test**: A buyer requests a viewing. The seller receives the appointment request, reviews it in their calendar, and approves or reschedules it.

**Acceptance Scenarios**:

1. **Given** an authenticated buyer on a property page, **When** they book an appointment specifying a future Date, Time, Message, and Visitor Count, **Then** the appointment is created with status "Pending" and the seller is notified.
2. **Given** a buyer has an active pending appointment on a property, **When** they attempt to book another appointment on the same property, **Then** the system blocks the request and displays a duplicate pending warning.
3. **Given** a seller receives an appointment request, **When** they approve the appointment, **Then** the status changes to "Approved" and the buyer is notified.
4. **Given** a seller cannot make the requested time, **When** they suggest another time, **Then** the appointment status becomes "Rescheduled" and the buyer is prompted to accept or reject the proposal.
5. **Given** a visit has taken place, **When** the seller marks the appointment as complete, **Then** the status changes to "Completed" and the buyer becomes eligible to leave a review.

---

### User Story 3 - Real-Time Chat (Priority: P1)

As a buyer or seller, I want to exchange real-time messages (including text, images, files, and emojis) inside a dedicated messenger interface, seeing online status, typing indicators, and read receipts.

**Why this priority**: Instant communication increases trust and speeds up negotiation. Property-specific threads keep conversations organized.

**Independent Test**: A buyer clicks "Chat" on a property detail page, which opens a conversation window. The buyer and seller send and receive messages instantly, showing read badges and typing indicators.

**Acceptance Scenarios**:

1. **Given** an authenticated buyer clicks "Chat with Owner" on a property page, **When** they send their first message, **Then** a unique conversation is created for this buyer-property combination, and the seller is notified.
2. **Given** a buyer and seller are actively chatting, **When** one is typing, **Then** the other sees a typing indicator in real-time.
3. **Given** a user opens a conversation, **When** they view new messages, **Then** read receipts are sent to the sender, updating message status to "Read".
4. **Given** a user has active chat histories, **When** they choose to archive or soft-delete a conversation, **Then** it disappears from their chat list but remains accessible to the other participant.

---

### User Story 4 - Offers & Negotiation (Priority: P2)

As a buyer, I want to submit a formal price offer with a message and expiration date. As a seller, I want to accept, reject, or submit counter-offers, tracking the entire history on a visual negotiation timeline.

**Why this priority**: Price negotiation is the financial core of real estate. Providing structured offer workflows prevents off-platform communication leaks and keeps records clean.

**Independent Test**: A buyer makes an offer. The seller rejects it and counters. The buyer accepts the counter-offer, concluding the negotiation.

**Acceptance Scenarios**:

1. **Given** a buyer wants to negotiate a property, **When** they submit an offer with a positive Amount, Message, and future Expiration Date, **Then** the offer is created with status "Pending" and the seller is notified.
2. **Given** a seller has a pending offer, **When** they submit a counter-offer, **Then** the original offer status updates to "Countered" and the buyer is notified of the new amount.
3. **Given** a negotiation is active, **When** either party views the offer page, **Then** they see a comparative negotiation timeline showing all historical counter-offers.
4. **Given** an offer's expiration date has passed, **When** the system runs a check, **Then** the status automatically changes to "Expired".
5. **Given** an offer or counter-offer is created or updated in the negotiation dashboard, **When** the transaction occurs, **Then** the system automatically posts an interactive summary card containing the offer details into the buyer-seller chat conversation in real-time.

---

### User Story 5 - In-App Notifications (Priority: P2)

As any user, I want to receive real-time, in-app notifications for critical events (new messages, appointment updates, inquiries, offers, reviews) and easily manage them (unread count, mark as read, delete).

**Why this priority**: Keeps users engaged and active on the platform by alerting them immediately when actions are required.

**Independent Test**: Triggering any event (e.g. sending a message or approving an appointment) immediately sends a notification to the counterparty, updating their unread notification badge.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** a notification-triggering action occurs (e.g. New Message, Offer Received), **Then** a real-time notification is delivered, and the unread notification badge count increments immediately.
2. **Given** a user clicks on the notification dropdown or page, **When** they select a notification, **Then** the notification status is marked as read and the badge count decreases.
3. **Given** a list of notifications, **When** the user clicks "Mark all as read", **Then** all unread notifications are updated and the badge count goes to zero.

---

### User Story 6 - Reviews and Ratings (Priority: P2)

As a buyer who has successfully completed an appointment or purchase workflow for a property, I want to rate the seller/agent (1 to 5 stars), write a title and comment, and optionally upload images. As a seller, I want to reply or report reviews. As an admin, I want to moderate reviews.

**Why this priority**: Peer feedback builds system integrity, improves agent accountability, and helps buyers make informed decisions.

**Independent Test**: A verified buyer reviews a seller. The review is published on the seller's profile, updating their average rating and count.

**Acceptance Scenarios**:

1. **Given** a buyer has a "Completed" appointment with a seller, **When** they submit a review with a 1-5 rating, title, and comment, **Then** the review is recorded, and the seller's overall profile metrics (average rating, count, star distribution) are updated.
2. **Given** a buyer has no completed visits or transactions with a seller, **When** they attempt to submit a review, **Then** the system rejects the submission with an eligibility warning.
3. **Given** a seller receives a review, **When** they reply to it, **Then** the reply is displayed directly underneath the original review on their public profile.
4. **Given** an inappropriate review is reported, **When** an admin decides to hide or delete it, **Then** it is immediately removed from the public profile, and the seller's average rating is recalculated.

### Edge Cases

- **Date and Time Boundaries**: Booking appointment dates in the past, or entering negative/zero offer amounts. The system must validate input at the entry points and API boundaries.
- **Concurrency Conflicts**: Two buyers submitting offers or booking appointments at the exact same instant, or trying to schedule overlapping visits. The system must handle concurrency and block overlapping pending bookings on a single property.
- **Cross-User Actions**: A user attempting to access, reply to, or delete notifications, messages, or inquiries that do not belong to them. Strict authentication and resource-ownership validation must be enforced.
- **Interrupted Connectivity**: Users sending chat messages or negotiating offers during a brief network outage. The UI must show clear offline/sending states and attempt retries.
- **Soft-Deleted Data Access**: Ensuring soft-deleted items (inquiries, chat threads) are excluded from standard API queries while remaining visible to admins and stored in database backups.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Authentication Gate**: Guests attempting to write inquiries, book visits, initiate chat, create offers, or post reviews MUST be redirected to the login flow.
- **FR-002**: **Self-Interaction Block**: Buyers MUST NOT be allowed to create inquiries, book appointments, start chats, or make offers on their own listings.
- **FR-003**: **Conversation Uniqueness**: The system MUST enforce a single active chat conversation per buyer-property pair, reusing the existing channel if it already exists.
- **FR-004**: **Appointment Date Validation**: Appointment date and time inputs MUST be set in the future.
- **FR-005**: **Duplicate Request Restraints**: System MUST block the creation of duplicate pending appointments or duplicate pending offers by the same buyer on a single property.
- **FR-006**: **Role-Based Access Control (RBAC)**: Only authorized agents/sellers can approve/reschedule appointments, manage their own inquiries, or reply to chats/reviews. Admins have global override rights to view, hide, or delete any content.
- **FR-007**: **Soft-Deletion Support**: Deletion requests for inquiries and chats MUST perform soft-deletes, removing them from user views while preserving raw records for compliance.
- **FR-008**: **Real-Time Communication**: Chat messages, typing indicators, read receipts, and online status updates MUST be distributed using real-time communication events.
- **FR-009**: **Review Eligibility**: The system MUST restrict review creation to buyers who have a "Completed" appointment or purchase history linked to that seller/property.
- **FR-010**: **Data Validation Enforcements**: Offers MUST have strictly positive amounts, and reviews MUST have ratings between 1 and 5 stars.
- **FR-011**: **API Pagination**: Conversations, notifications, and reviews MUST be paginated on retrieval to maintain application performance under scale.
- **FR-012**: **In-App Notification Triggers**: In-app notifications MUST be automatically generated for all key workflow events (new inquiries, inquiry replies, appointment changes, chat messages, offers, and reviews) with live unread count updates.
- **FR-013**: **Offer Chat Integration**: Offers and counter-offers MUST be created and managed via a dedicated negotiation flow/dashboard, but the system MUST automatically inject a live interactive summary card of the offer update directly into the related chat conversation thread in real-time.

### Key Entities *(include if feature involves data)*

- **Inquiry**: Represents a buyer request for info.
  - *Attributes*: `Id`, `PropertyId`, `BuyerId`, `Subject`, `Message`, `Phone`, `Email`, `PreferredContactMethod`, `PreferredContactTime`, `Status` (New, Read, Replied, In Progress, Closed, Cancelled), `CreatedAt`, `IsDeleted`.
- **Appointment**: Represents a scheduled property visit.
  - *Attributes*: `Id`, `PropertyId`, `BuyerId`, `Date`, `Time`, `Message`, `VisitorCount`, `Status` (Pending, Approved, Rejected, Rescheduled, Completed, Cancelled), `CreatedAt`, `UpdatedAt`.
- **Conversation**: Represents a chat channel between buyer and seller for a listing.
  - *Attributes*: `Id`, `PropertyId`, `BuyerId`, `SellerId`, `CreatedAt`, `LastMessageAt`, `IsDeletedByBuyer`, `IsDeletedBySeller`.
- **Message**: Represents an individual text or file exchange.
  - *Attributes*: `Id`, `ConversationId`, `SenderId`, `Content`, `ContentType` (Text, Image, File), `IsDelivered`, `IsRead`, `CreatedAt`.
- **Notification**: Represents an in-app alert for user actions.
  - *Attributes*: `Id`, `RecipientId`, `Type` (Inquiry, Appointment, Message, Offer, Review), `Content`, `IsRead`, `CreatedAt`.
- **Offer**: Represents a financial negotiation.
  - *Attributes*: `Id`, `PropertyId`, `BuyerId`, `OfferAmount`, `Message`, `ExpirationDate`, `Status` (Pending, Accepted, Rejected, Countered, Expired, Cancelled), `CreatedAt`.
- **Review**: Represents post-visit feedback.
  - *Attributes*: `Id`, `PropertyId`, `BuyerId`, `Rating` (1-5), `Title`, `Comment`, `Images`, `ReplyContent`, `IsReported`, `IsHidden`, `CreatedAt`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can submit inquiries, book appointments, or create offers in under 15 seconds from the UI trigger.
- **SC-002**: Chat messages and typing indicators propagate to counterparties in under 1.5 seconds.
- **SC-003**: 100% of invalid inputs (past appointment dates, negative offer values, out-of-range ratings) are caught and rejected with descriptive error messages.
- **SC-004**: Recalculation of review ratings and distribution counts occurs within 1 second of a review being submitted or moderated.

## Assumptions

- User profiles, property listings, and user role claims (Buyer, Seller, Agent, Admin) are fully accessible via existing modules.
- Media upload features (images/documents) are provided by the existing Upload Service.
- Users have consistent network connectivity to support real-time WebSocket connection state updates.
