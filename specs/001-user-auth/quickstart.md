# Quickstart Validation Guide: User Authentication & Profile Management

This guide documents the procedures to validate the User Authentication and Profile Management features end-to-end.

## Prerequisites
- **Back-end**: .NET 8 SDK, PostgreSQL running instance
- **Front-end**: Node.js v18+, NPM v10+

---

## Validation Environment Setup

### 1. Database Setup
Ensure PostgreSQL has a database named `RealEstateDb`. Connect and apply database migrations (implemented during setup phase):
```bash
cd backend/src/API
dotnet ef database update
```

### 2. Run Applications
Start the back-end API server:
```bash
cd backend/src/API
dotnet run
```
Verify Swagger UI is running at `http://localhost:5000/swagger`.

Start the front-end React development server:
```bash
cd frontend
npm install
npm run dev
```
Verify the SPA is running at `http://localhost:5173`.

---

## Validation Scenarios

### Scenario 1: New User Registration & Verification
1. Open frontend at `http://localhost:5173/register`.
2. Input credentials:
   - **Email**: `testuser@realestate.com`
   - **Password**: `P@ssword123!` (Standard security complexity)
   - **Role**: Select `Buyer`
3. Click "Register".
4. *Expected Outcome*: An email is simulated (logged in console or captured in test mailbox), and the UI presents an OTP input page.
5. In the OTP prompt, enter the code `123456` (or code fetched from backend log).
6. *Expected Outcome*: Account changes state from `Unverified` to `Verified` (see [Verification State transitions](file:///d:/Projects/E-commerce/specs/001-user-auth/data-model.md#L66)).

---

### Scenario 2: User Login and Access Control
1. Navigate to `http://localhost:5173/login`.
2. Enter the registered email `testuser@realestate.com` and password `P@ssword123!`.
3. Click "Login".
4. *Expected Outcome*:
   - Backend issues JWT token and cookies.
   - Client is redirected to the `/dashboard`.
   - Restricting API endpoints verified by calling `/api/user/profile` via JWT headers (see [Profile Contracts](file:///d:/Projects/E-commerce/specs/001-user-auth/contracts/user-contracts.md#L10)).

---

### Scenario 3: Favorites and Recently Viewed properties
1. As a logged-in buyer, navigate to a property details page (e.g. `/property/8fa25d64-1217-4362-b2fc-2c963f66bbb9`).
2. Verify that viewing this page triggers the recently viewed logging.
3. Refresh dashboard and verify the property listing appears in the "Recently Viewed" horizontal slider.
4. Click the "Save to Favorites" button.
5. Navigate to `/favorites` and verify the property listing is saved (see [Favorite API Contract](file:///d:/Projects/E-commerce/specs/001-user-auth/contracts/user-contracts.md#L39)).

---

## Automated Verification Tests
Run backend xUnit test suite (implemented in task phase) to verify core logic:
```bash
cd backend/tests/Application.UnitTests
dotnet test
```
Run frontend component tests:
```bash
cd frontend
npm run test
```
