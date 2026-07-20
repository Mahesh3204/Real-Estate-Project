# Quickstart Validation Guide: Property Discovery

This guide describes how to run and manually validate the Property Discovery & Buyer Experience features end-to-end, showing expected outcomes for core user flows.

## Prerequisites

1. **Backend**: .NET 8/9 SDK installed, PostgreSQL running with migrations applied.
2. **Frontend**: Node.js (v18+) and npm installed.
3. **Environment**: Existing authentication/user setup complete (a buyer account and an agent account created).

## Running the Application Locally

1. **Start Backend**:
   ```bash
   cd backend/src/API
   dotnet run
   ```
   *Expected API base URL*: `http://localhost:5000` or `https://localhost:5001`.

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Expected UI local server*: `http://localhost:5173`.

---

## E2E Validation Scenarios

### Scenario 1: Property Search & Combinable Filters

* **Action**:
  1. Open `http://localhost:5173` (Home Page) in a browser.
  2. Enter a search keyword (e.g., "Miami") in the Hero search input, and click search.
  3. On the Property Listing page, open the Filter panel (or Drawer if on mobile).
  4. Apply combinations: Category (Residential), Bedrooms (3), Min Price ($200,000), and Max Price ($550,000). Click apply.
  5. Click the "Reset Filters" button.
* **Expected Outcome**:
  * Step 2 redirects to the listing page with `searchQuery=Miami` in the address bar.
  * Step 4 filters listings dynamically, and the UI updates (using skeletons during fetching) to display only matching properties.
  * Step 5 clears all active filters and inputs, returning the full listing collection.
  * Verified APIs: `GET /api/v1/properties` (refer to [api.md](file:///d:/Projects/Real-Estate-Project/specs/005-property-discovery/contracts/api.md)).

### Scenario 2: Favorites Management & Guest Restriction

* **Action**:
  1. Clear browser cookies/auth tokens (or open incognito).
  2. Navigate to a property card and click the "Favorite" (Heart) icon.
  3. Log in with a buyer account, navigate back, and click the "Favorite" icon on the same card.
  4. Go to the "My Favorites" navigation page. Remove the favorite property from there.
* **Expected Outcome**:
  * Step 2 redirects the guest user to the `/login` page.
  * Step 3 toggles the Heart icon to a filled active state, and increments the navbar favorite count.
  * Step 4 displays the property card under the favorites list. Clicking remove removes it immediately with a toast notification.
  * Verified APIs: `POST /api/v1/favorites`, `DELETE /api/v1/favorites/{id}`, and `GET /api/v1/favorites`.

### Scenario 3: Property Comparison & Limits

* **Action**:
  1. Select 4 different properties across listings by clicking the "Compare" button on each card.
  2. Attempt to select a 5th property for comparison.
  3. Click "Compare Now" to navigate to the comparison dashboard.
* **Expected Outcome**:
  * Step 1 adds properties to the comparison drawer, showing active count `4`.
  * Step 2 blocks selection, displaying a warning toast: "Maximum comparison limit of 4 properties reached."
  * Step 3 renders a responsive comparison table comparing prices, areas, rooms, bathrooms, amenities, conditions, and locations side-by-side.
  * Verified API: `GET /api/v1/properties` filtering by a list of comma-separated IDs.

### Scenario 4: Recently Viewed Property Tracking

* **Action**:
  1. Visit three different property details pages.
  2. Navigate to the "Recently Viewed" history dashboard.
  3. Click the "Clear History" button.
* **Expected Outcome**:
  * Visiting details logs views (for guests, via Local Storage; for logged-in users, via PostgreSQL database sync).
  * History list displays the properties in reverse-chronological order.
  * Clicking "Clear" removes all entries, displaying a clean "Empty State" component.
  * Verified APIs: `GET /api/v1/recently-viewed` and `DELETE /api/v1/recently-viewed`.

### Scenario 5: Saved Searches

* **Action**:
  1. Apply filters (e.g., Min Price: $300,000, 2 Baths) on the listing page.
  2. Click "Save Search", enter the name "Budget 2 Bath Properties", and save.
  3. Go to profile, view the Saved Searches list, and click "Run Search".
* **Expected Outcome**:
  * Search configuration (filter JSON) is persisted to the database.
  * Clicking "Run" executes the search with the exact filters and sorting restored automatically.
  * Verified APIs: `POST /api/v1/saved-searches` and `GET /api/v1/saved-searches`.

### Scenario 6: Public Agent/Seller Profiles

* **Action**:
  1. Open a property details page and click on the Agent's profile image.
  2. Review the public profile page fields and active listings.
* **Expected Outcome**:
  * Displays the agent's photo, name, company, bio, contact details, joined date, and social links.
  * Shows a paginated list of their active published properties only (draft listings are hidden).
  * Verified API: `GET /api/v1/profiles/public/{userId}`.
