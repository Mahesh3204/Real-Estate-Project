# Feature Specification: Property Management Portal

**Feature Branch**: `003-property-management`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "User Interface Requirements: Implement the complete frontend together with the backend. Every backend capability must have a corresponding UI. Seller / Agent Interface, Property Creation Wizard, Property Details Screen, Property Media Manager, Property Document Manager, Floor Plan Manager, Admin Interface, Public Interface, UX Requirements."

## Clarifications

### Session 2026-07-19

- Q: Where are intermediate wizard steps saved during the autosave? → A: Database-backed drafts (autosaves are written to partial database records with nullable fields).


---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seller / Agent Property Workspace (Priority: P1)

As a Seller or Agent, I want a unified property dashboard so that I can list, search, filter, publish, archive, and manage all my property listings from a single screen.

**Why this priority**: Highly critical as this dashboard forms the primary workflow entry point for users acting as sellers or agents to maintain their property portfolio.

**Independent Test**: Can be fully verified by listing property drafts, publishing a property, checking status flags (e.g. Published, Archived, Draft), and filtering the list by category and status.

**Acceptance Scenarios**:

1. **Given** a Seller is logged in and has created three draft properties and one archived property, **When** they view their Property List, **Then** they see all four listings with their correct statuses in either a Grid or Table view.
2. **Given** a list of properties, **When** the Agent inputs a query in the search bar or filters by Category, **Then** the list updates dynamically in under 1 second showing only matching items.
3. **Given** multiple properties are selected, **When** the Seller chooses "Archive" or "Publish" from the bulk actions menu, **Then** all selected items transition to the new status simultaneously.

---

### User Story 2 - Property Creation Wizard (Priority: P1)

As a Seller, I want a step-by-step wizard to guide me through inputting basic information, geolocations, detailed specifications, amenities, media files, documents, floor plans, and SEO tags, so that I can create structured listings.

**Why this priority**: Crucial because real estate listings contain multi-dimensional data models, and a wizard breaks down input fatigue into manageable steps while verifying values progressively.

**Independent Test**: Can be tested by filling out all 9 wizard steps and successfully submitting a property as a "Draft" or sending it to "Pending Review" status.

**Acceptance Scenarios**:

1. **Given** the Seller starts the wizard, **When** they fill out Step 1 (Basic Details) with title and description, and click Next, **Then** step validation passes and they proceed to Step 2 (Location mapping).
2. **Given** the Seller is in Step 5 (Media Manager), **When** they drag and drop images, reorder them, and select one as the Featured Image, **Then** the UI shows progress bars and preserves the custom ordering.
3. **Given** the Seller reaches Step 9 (Review), **When** they click "Save Draft" or "Submit", **Then** a preview is displayed, and the property is persisted to the backend.

---

### User Story 3 - Property Details and Interactive Media Viewer (Priority: P2)

As a buyer or seller, I want a rich property details screen displaying image galleries, geolocation maps, amenities lists, downloadable documents, and floor plan images, so that I can make informed decisions.

**Why this priority**: High value for buyers to evaluate a property visually and legally prior to booking or submitting inquiries.

**Independent Test**: Verify that all uploaded media files, maps, amenities, and floor plans are displayed on a public property details screen, and that downloading public documents works correctly.

**Acceptance Scenarios**:

1. **Given** a published property with a floor plan, public documents, and a featured gallery, **When** a guest user accesses the link, **Then** the system loads the images, the map marker, and renders the documents available for download.
2. **Given** a property with private documents, **When** a non-owner buyer views the listing, **Then** private documents are hidden from their view.

---

### User Story 4 - Admin Moderation and Approval Panel (Priority: P2)

As an Administrator, I want a management console to inspect pending listings, review their change logs, approve, reject, or archive listings, so that I can maintain platform quality.

**Why this priority**: Essential to verify that listed properties comply with platform guidelines before being made public.

**Independent Test**: Can be tested by logging in as Admin, reviewing a pending property, rejecting it with a reason, and verifying that the status transitions to "Rejected".

**Acceptance Scenarios**:

1. **Given** a property is in "Pending Approval" status, **When** the Admin clicks "Approve", **Then** the property transitions to "Published" status and becomes visible to public searches.
2. **Given** a property is rejected by an Admin, **When** the owner agent views their Property List, **Then** the status shows "Rejected" alongside the admin's moderation notes.

---

### Edge Cases

- **Session Interruption during Wizard**: If the browser crashes or the user logs out mid-wizard, the system must recover their progress using the autosaved draft.
- **Large File and Document Uploads**: If the network drops during a large image or document upload, the UI should show a clean error message and offer a retry button.
- **Location Mapping Cascading Errors**: If a Seller specifies a Country that has no registered States or Cities, the system should allow them to request locations or gracefully fall back to a direct address field.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Property Creation Wizard MUST support exactly 9 sequential steps: Basic Info, Location, Property Details, Amenities, Media, Documents, Floor Plans, SEO, and Review.
- **FR-002**: Location validation MUST reference active Country, State, and City records in the location database, while Area remains a free-text field.
- **FR-003**: The Media Manager MUST support drag-and-drop file upload, size limits validation (maximum 10MB per image, 50MB per video), featured image selection, and display order rearrangement.
- **FR-004**: The Document Manager MUST allow uploading PDFs, DOCX, and images (maximum 20MB per document), and support toggle options for "Public" vs "Private" visibility.
- **FR-005**: All forms in the Property Creation Wizard MUST support client-side schema validation (e.g. required fields, valid email/numeric limits) and display server-side errors in real-time using toaster notifications.
- **FR-006**: The Wizard MUST automatically save draft changes in the background (autosave) every 30 seconds to partial database records with nullable fields to prevent data loss.
- **FR-007**: When a user attempts to navigate away from the wizard with unsaved changes, the system MUST prompt a confirmation warning dialog.
- **FR-008**: Properties MUST have status flows: `Draft` $\rightarrow$ `Pending Approval` $\rightarrow$ `Published` / `Rejected`, and `Archived` / `Deleted`.
- **FR-009**: Only properties in the `Published` status MUST be accessible publicly. Any attempt to request non-published properties by public users must return a NotFound error.
- **FR-010**: Administrative users MUST have access to an Admin Property Console displaying all platform listings categorized by publishing state, with actions to approve, reject (with review text logs), archive, restore, or permanently force delete.

### Key Entities

- **Property**: Represents a real estate listing. Includes title, category reference, property type reference, status, condition, listing type (Sale/Rent), price, owner/agent identifier, description, and status flag (Draft, Pending, Published, Rejected, Archived).
- **PropertyMedia**: Media assets (images, videos) associated with a property. Attributes: file path, display order index, is-featured flag.
- **PropertyDocument**: Supplementary files associated with a listing. Attributes: file path, display name, public visibility flag.
- **PropertyFloorPlan**: Floor plans showing internal arrangements. Attributes: file path, plan title, dimensions.
- **PropertyAuditLog**: Audit history of all status changes. Attributes: modifier user identifier, action performed (Approve, Reject, Draft), comments/notes, and timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete the entire 9-step property creation wizard and submit it for review in under 5 minutes.
- **SC-002**: All file uploads (media, documents, floor plans) show visual progress bars, and failed uploads can be retried with a single click.
- **SC-003**: Filtering, sorting, and pagination on a list of 10,000 properties update the screen in under 1 second.
- **SC-004**: 100% of property status modifications (e.g. approve, reject, archive) by admins or owners are logged in the audit trail database.

---

## Assumptions

- **Existing Location Infrastructure**: The Country, State, and City fields will resolve options from the existing location tables populated during Milestone 2.
- **Local Asset Storage**: All uploaded media assets, floor plans, and documents will be saved to the local server's asset directory (`wwwroot/uploads`) as structured in Milestone 2.
- **Search Scope**: Creating the advanced public property search bar or the homepage is out of scope for this milestone; focus is strictly on public detail displays and dashboard list filters.
- **Authentication**: Existing authentication and user roles (`Admin`, `Agent`, `Buyer`, `Seller`) will be leveraged to restrict view accesses and console controls.
