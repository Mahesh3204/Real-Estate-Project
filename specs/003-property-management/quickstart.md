# Quickstart Verification Guide: Property Management

This guide documents the verification scenarios to prove that the Property Management Portal works end-to-end from creation wizard to admin approval.

## Prerequisites

- Backend API running locally.
- Active database populated via `DbSeeder` with default locations (Countries, States, Cities) and user accounts.
- Active Admin account: `admin@realestate.com`
- Active Agent account: `agent@realestate.com`

---

## Scenario 1: Step-by-Step Property Wizard Listing (Agent Workflow)

### Setup & Login
1. Open the web interface.
2. Sign in as `agent@realestate.com` with password.
3. Verify that you are redirected to the Dashboard `/dashboard`.

### Wizard Draft Initialization
1. Navigate to the Property Management section `/properties` (Seller/Agent list panel).
2. Click **Create Property** button. This opens Step 1 of the multi-step Property Wizard.
3. Input the basic details:
   - **Title**: `Modern Waterfront Villa`
   - **Description**: `Stunning 4 bedroom waterfront property with private dock.`
   - **Price**: `1850000`
   - **Listing Type**: `Sale`
4. Click **Next**. Verify that Step 1 fields validate successfully and the draft is created in the database.
5. In Step 2 (Location), choose cascading dropdown values:
   - **Country**: Choose Country from list
   - **State**: Choose State from list
   - **City**: Choose City from list
   - **Area**: `Ocean Heights` (Free-text)
   - **Address**: `14 Marina Road`
6. Click **Next** to save location draft.
7. Proceed through Step 3 (Property Details), Step 4 (Amenities), Step 5 (Media Drag & Drop Uploads), Step 6 (Documents upload), Step 7 (Floor Plans upload), and Step 8 (SEO slug and tags).
8. In Step 9 (Review), preview all input details, verify that everything looks correct, and click **Submit for Approval**.
9. Verify that the property transitions to `Pending Approval` status on the dashboard property list.

---

## Scenario 2: Admin Moderation Console (Admin Workflow)

### Moderation Review
1. Log out and sign in as `admin@realestate.com`.
2. Navigate to the Admin Console's Property Moderation list.
3. Locate the `Modern Waterfront Villa` in the **Pending Approval** tab.
4. Click **View Listing** to inspect all uploaded details, documents, and map geolocations.
5. Click **Approve**.
6. Verify that the property transitions to `Published` status.
7. Click **Reject** on another pending property, fill in the reason: `Missing high-resolution featured image`, and verify that the status transitions to `Rejected`.

---

## Scenario 3: Public Property Detail Access

### Public Verification
1. Access the public details page: `/properties/modern-waterfront-villa` as an anonymous/guest user.
2. Verify that the image gallery, amenities list, floor plans, and public documents are fully accessible.
3. Try to access a draft or rejected property slug url (e.g. `/properties/unapproved-draft-villa`) as a guest.
4. Verify that the system displays a `404 Not Found` error page.
