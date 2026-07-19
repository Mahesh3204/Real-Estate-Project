# Quickstart Validation Guide: Multi-Role User Management

This guide documents runnable validation scenarios to prove the multi-role and role upgrade features work end-to-end.

## Prerequisites
- Backend API running locally at `http://localhost:5242` (or verified via `dotnet watch`).
- Database migrations successfully applied.
- User accounts created:
  - **Buyer User**: A standard registered account.
  - **Admin User**: An account with the `Admin` role.

---

## Scenario 1: Default Role on Registration
1. **Action**: Register a new user using the registration API or frontend register page.
2. **Verification Command**:
   - Send `POST /api/v1/auth/register` (or check database records for the newly created user).
3. **Expected Outcome**:
   - The user record is created successfully.
   - The database contains a mapping in `AspNetUserRoles` associating the user with the `Buyer` role.
   - The user's `ActiveRoleId` in the database matches the `Buyer` role ID.

---

## Scenario 2: Switch Active Role
1. **Action**: Authenticate as a user with both `Buyer` and `Seller` roles, then toggle active role to `Seller`.
2. **Verification Request**:
   - Send `POST /api/v1/roles/switch-active` with body `{"roleName": "Seller"}` (see [contracts/api.md](file:///d:/Projects/Real-Estate-Project/specs/004-multi-role-management/contracts/api.md) for specs).
3. **Expected Outcome**:
   - The API returns `200 OK` indicating the active role is now `Seller`.
   - The user's `ActiveRoleId` is updated in the database.
   - On the frontend dashboard, the navigation layout shifts to the Seller workspace.
   - The user can still successfully call query endpoints that require Buyer role permissions (permissions union check).

---

## Scenario 3: Submit and Approve Upgrade Request (Manual Review Flow)
1. **Action**: 
   - Ensure the system setting `AutoApproveRoleRequests` is set to `false`.
   - Log in as the Buyer user and submit an upgrade request to become a `Seller`.
   - Log in as the Admin user and approve the pending request.
2. **Verification Requests**:
   - User: `POST /api/v1/roles/requests` with `{"requestedRoleName": "Seller", "reason": "Test upgrade"}`.
   - Admin: `POST /api/v1/roles/requests/{id}/approve` with `{"notes": "Approved for testing"}`.
3. **Expected Outcome**:
   - The user request returns `201 Created` with a `Pending` status.
   - The Admin approval returns `200 OK`.
   - The user is assigned the `Seller` role.
   - An audit trail event `RoleApproved` is generated, and the request history records the status transition from `Pending` to `Approved`.
