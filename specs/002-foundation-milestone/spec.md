# Feature Specification: Milestone 1 (Foundation)

**Feature Branch**: `002-foundation-milestone`

**Created**: 2026-07-19

**Status**: Approved

**Input**: User description: "Build Milestone 1 (Foundation) for a production-ready Real Estate Platform. This milestone should establish the core architecture and master data that every future feature depends on..."

## Clarifications

### Session 2026-07-19

- Q: How should soft-deleted records (Locations, Categories, Types) be handled by administrative endpoints? → A: Excluded by default, but Admins can retrieve them via a query parameter (e.g., `?includeDeleted=true`) and restore them.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrative Access Control (RBAC) Setup (Priority: P1)

An administrator sets up and manages the authorization system, creating roles (e.g., Seller, Buyer, Agent) and permissions (e.g., country.read, country.create), assigning permissions to roles, and making sure other users are bound by these rules.

**Why this priority**: Forms the essential authorization basis for the entire platform. Without it, secure administrative controls and tenant roles cannot exist.

**Independent Test**: Can be fully tested by creating a role and permissions, assigning them to a user, and verifying that API requests with that user's token are authorized according to the permissions, while requests lacking the permissions are denied with a standard 403 Forbidden response.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator, **When** they create a new role "Agent" and assign "property-type.create" and "property-type.read" permissions to it, **Then** the role is successfully saved and the permissions are linked.
2. **Given** a user with the role "Buyer", **When** they attempt to create a new Property Category, **Then** the request is rejected with a 403 Forbidden error because the "Buyer" role lacks the "category.create" permission.

---

### User Story 2 - User Profile Setup and Personal Details Management (Priority: P2)

An authenticated user sets up their profile, fills in their location (selecting Country, State, City, Area) and personal details (First Name, Last Name, Phone, Gender, Date of Birth, Language, Timezone), and uploads/removes their avatar image.

**Why this priority**: Establishes user identity and localization details necessary for customized property listings, agents contact, and personalized queries.

**Independent Test**: Can be fully tested by updating a user profile with valid attributes and verifying that retrieving the profile returns the updated fields.

**Acceptance Scenarios**:

1. **Given** an authenticated buyer, **When** they update their profile with valid names, phone numbers, and location details, **Then** the profile updates successfully and returning the profile displays these updated values.
2. **Given** an authenticated buyer, **When** they upload a profile avatar image (PNG/JPEG under 5MB), **Then** the file upload service generates a unique name, uploads the image, and returns the public URL, updating the user's profile.

---

### User Story 3 - Real Estate Master Data Management (Priority: P3)

An administrator creates and manages master data catalogs (Property Categories, Property Types, Property Statuses, Property Conditions, Amenities with icons, and Location hierarchy) to construct the structure of future property listings.

**Why this priority**: Establishes the taxonomies, conditions, statuses, amenities, and locations that property listings must reference.

**Independent Test**: Can be fully tested by executing CRUD operations for property categories and verifying that they are correctly stored, indexed, and available via public query endpoints.

**Acceptance Scenarios**:

1. **Given** an administrator, **When** they create a Property Category "Apartment" and then create a Property Type "Studio" belonging to "Apartment", **Then** both records are successfully stored with a valid slug and hierarchy.
2. **Given** a public user, **When** they query the public listing endpoints for Property Categories, **Then** they receive a paginated, sorted list of active categories.

---

### Edge Cases

- **Deleting Assigned Roles**: Attempting to delete a role that has active users assigned to it must be blocked to prevent user accounts from ending up in an unauthorized state.
- **Cross-User Profile Modification**: Attempting to update another user's profile by altering the target user identifier must be forbidden unless the authenticated user is an administrator.
- **Location Hierarchy Integrity**: Attempting to delete a location record (such as a State) when there are dependent records linked (such as Cities in that State) must be blocked to prevent orphaned records.
- **MIME and Size Violations**: Uploading files that exceed 5MB or have non-whitelisted MIME types (e.g., executable scripts instead of JPEG/PNG images) must be rejected before any processing.
- **Dependent Deletion for Master Data**: Attempting to delete a Property Category that has dependent Property Types linked must be blocked.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Role CRUD Operations: System MUST allow Admins to create, read, update, and delete roles. Role names must be unique.
- **FR-002**: Role Deletion Guard: System MUST prevent deleting a role that is assigned to one or more users.
- **FR-003**: Permission CRUD Operations: System MUST allow Admins to manage permissions (create, read, update, delete). Permission names must be unique.
- **FR-004**: Permission Assignment: System MUST allow Admins to assign or remove permissions to/from roles.
- **FR-005**: User Profile Management: System MUST allow users to view and update their own profiles (First Name, Last Name, Phone, Gender, DOB, Language, Timezone, Country, State, City, Area, Zip Code).
- **FR-006**: Profile Access Control: Users MUST only be able to view and edit their own profiles. Admins MUST be allowed to view any profile.
- **FR-007**: Profile-Location Reference: User profiles MUST link Country, State, and City fields using foreign key references to the Location Management tables, while the Area field remains a free-text field (Hybrid approach).
- **FR-008**: Location Hierarchy Management: System MUST support a strict administrative location hierarchy: Country -> State -> City -> Area. Admins can perform CRUD operations on each level.
- **FR-009**: Location Relationship Validation: When creating/updating location records, State MUST belong to Country, City MUST belong to State, and Area MUST belong to City.
- **FR-010**: Location Deletion Guard: System MUST prevent deleting a location record if dependent records exist.
- **FR-011**: Location Active Status & Soft Delete: Location records MUST support active/inactive status and soft deletion. Soft-deleted records are excluded from list endpoints by default, but Admins can include them via a query parameter (e.g., `?includeDeleted=true`) and restore them.
- **FR-012**: Public Location APIs: System MUST expose public read endpoints for Countries, States, Cities, and Areas supporting pagination, searching, filtering, and sorting.
- **FR-013**: Property Categories: System MUST support Admin CRUD operations for Property Categories (Name, Slug, Description, Image, Display Order, Status, Soft Delete). Slugs must be unique. Soft-deleted records are excluded from default lists but are retrievable and restorable by Admins via query parameter.
- **FR-014**: Property Types: System MUST support Admin CRUD operations for Property Types, which belong to a Category. Slugs must be unique, and Category must exist.
- **FR-015**: Property Statuses: System MUST support Admin CRUD for Property Status master records (e.g., Sale, Rent, Lease, Sold, Rented) with unique Name, Status, and Display Order.
- **FR-016**: Property Conditions: System MUST support Admin CRUD for Property Condition master records (e.g., New, Resale, Under Construction, Ready to Move).
- **FR-017**: Amenities Management: System MUST support Admin CRUD for Amenities (Name, Slug, Icon, Category, Description, Display Order, Status, Soft Delete) with icon upload support.
- **FR-018**: Shared File Upload Service: System MUST provide a reusable file upload service that validates MIME types and maximum file size, assigns unique filenames, deletes files, and exposes public URLs.
- **FR-019**: File Upload Storage Strategy: System MUST store uploaded files locally on the server's filesystem in a designated public assets directory.
- **FR-020**: Audit Logging: System MUST automatically record administrative actions, tracking User, Action, Resource, Resource ID, Old Values, New Values, Timestamp, IP Address, and User Agent.
- **FR-021**: Audit Log Inspection APIs: System MUST provide Admin-only APIs to list, filter, and search audit logs.
- **FR-022**: Standard API Response Format: All APIs MUST use standard success and error response envelopes with pagination and versioning (/api/v1/...).
- **FR-023**: Database Migrations & Seeders: Database schema MUST be fully normalized with proper indexes for foreign keys, and seeders MUST initialize default roles, permissions, and sample location data.
- **FR-024**: Administrative Console Layout: System MUST provide an Admin Dashboard shell containing sidebar navigation links for Roles, Permissions, Locations, Property Taxonomy, and Audit Logs.
- **FR-025**: Role & Permission UI: System MUST provide interfaces for Admins to view, create, edit, and delete roles, view permissions, and assign or remove permissions to/from roles.
- **FR-026**: User Profile Editor: User profile UI MUST allow editing First Name, Last Name, Phone, Gender, DOB, Language, Timezone, Zip Code, location selection (Country -> State -> City cascading dropdowns), and uploading/removing an avatar image with live preview.
- **FR-027**: Location Hierarchy Manager UI: System MUST provide UI for Admins to manage countries, states, cities, and areas, supporting soft-deletion, restoration, and active status toggling.
- **FR-028**: Master Data Manager UI: System MUST support administrative forms and lists for Property Categories, Types, Statuses, Conditions, and Amenities, including file upload for Category Images and Amenity Icons.
- **FR-029**: Audit Log Viewer: System MUST provide an Admin UI to view and search audit logs, complete with filters for User, Action, Resource, Date Range, and showing details of value changes.


### Key Entities *(include if feature involves data)*

- **Role**: Represents user authorization roles (e.g., Admin, Seller, Buyer, Agent) with a unique name.
- **Permission**: Represents specific system permissions (e.g., role.read, category.create).
- **Profile**: Contains extended information for a User, including name, phone, gender, dob, language, timezone, and avatar file reference, linking to Location entities.
- **Country / State / City / Area**: Represents the hierarchical geographic database. Each record points to its parent and holds status and soft delete attributes.
- **PropertyCategory**: High-level category (e.g., Residential, Commercial) with unique slug, display order, and status.
- **PropertyType**: Specific property classification (e.g., Apartment, Villa, Office) belonging to a Category.
- **PropertyStatus**: Master listing status options (e.g., For Sale, For Rent).
- **PropertyCondition**: Master listing conditions (e.g., Under Construction, Ready to Move).
- **Amenity**: Feature/facility checklist item (e.g., Pool, Gym) with associated category and icon file reference.
- **File**: Tracks uploaded files, storage paths/URLs, MIME types, and sizes.
- **AuditLog**: Stores records of CRUD operations and security events.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can update their user profiles and upload an avatar in under 1.5 seconds under normal network conditions.
- **SC-002**: Database queries for public locations (list countries/states/cities/areas) return results in under 500 milliseconds for up to 10,000 records.
- **SC-003**: Unauthorized users are blocked from administrative endpoints (e.g. role or master data modification) with 100% accuracy.
- **SC-004**: Administrative actions (creates, updates, deletes) are written to the audit log with 100% reliability, creating a traceable historical trail.

## Assumptions

- **A-001**: Existing user authentication system (JWT, password resets, registration) is fully functional and can be integrated with the profile and authorization system.
- **A-002**: Allowed upload file formats are limited to standard images (JPEG, PNG, WEBP) for avatars/categories and icons (SVG, PNG) for amenities.
- **A-003**: The maximum file upload size is capped at 5MB.
- **A-004**: Administrators are trusted users; administrative actions are logged but cannot be altered or deleted.
- **A-005**: All APIs will follow JSON API standards and REST principles.
