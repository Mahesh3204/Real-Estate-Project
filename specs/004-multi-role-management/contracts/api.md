# API Endpoints Contract: User Roles & Upgrades

## Endpoints

### 1. Submit Role Upgrade Request
* **Route**: `POST /api/v1/roles/requests`
* **Auth**: Bearer Token (Authenticated Users)
* **Request Body**:
  ```json
  {
    "requestedRoleName": "Seller", 
    "reason": "I want to list my apartment on the portal."
  }
  ```
* **Response**:
  * `201 Created` (If manual review required)
    ```json
    {
      "success": true,
      "data": {
        "requestId": "a67e2030-cf22-482a-a957-efb170c0c66a",
        "status": "Pending",
        "message": "Your request has been submitted for approval."
      }
    }
    ```
  * `200 OK` (If auto-approved)
    ```json
    {
      "success": true,
      "data": {
        "requestId": "a67e2030-cf22-482a-a957-efb170c0c66a",
        "status": "Approved",
        "message": "Role upgraded successfully."
      }
    }
    ```

---

### 2. Switch Active Session Role
* **Route**: `POST /api/v1/roles/switch-active`
* **Auth**: Bearer Token (Authenticated Users)
* **Request Body**:
  ```json
  {
    "roleName": "Seller"
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "activeRole": "Seller"
    }
  }
  ```

---

### 3. Cancel Pending Request (Self)
* **Route**: `POST /api/v1/roles/requests/{id}/cancel`
* **Auth**: Bearer Token (Submitting User only)
* **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Request cancelled successfully."
  }
  ```

---

### 4. Admin Review Role Requests
* **Route**: `GET /api/v1/roles/requests`
* **Auth**: Admin Role
* **Query Parameters**:
  * `pageNumber` (int, default 1)
  * `pageSize` (int, default 10)
  * `status` (int, optional: 0=Pending, 1=Approved, etc.)
  * `searchQuery` (string, optional)
* **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "a67e2030-cf22-482a-a957-efb170c0c66a",
          "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "userName": "Jane Doe",
          "requestedRole": "Seller",
          "status": "Pending",
          "reason": "I want to list properties.",
          "submittedAt": "2026-07-19T12:00:00Z"
        }
      ],
      "pageNumber": 1,
      "totalPages": 1,
      "totalRecords": 1
    }
  }
  ```

---

### 5. Approve Request
* **Route**: `POST /api/v1/roles/requests/{id}/approve`
* **Auth**: Admin Role
* **Request Body**:
  ```json
  {
    "notes": "Verified agent certification and approved."
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Upgrade request approved successfully."
  }
  ```

---

### 6. Reject Request
* **Route**: `POST /api/v1/roles/requests/{id}/reject`
* **Auth**: Admin Role
* **Request Body**:
  ```json
  {
    "notes": "Missing description notes or invalid documentation."
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Upgrade request rejected."
  }
  ```

---

### 7. Admin Manage User Roles
* **Route**: `POST /api/v1/admin/users/{userId}/roles`
* **Auth**: Admin Role
* **Request Body**:
  ```json
  {
    "roles": ["Buyer", "Seller"]
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "User roles updated successfully."
  }
  ```
