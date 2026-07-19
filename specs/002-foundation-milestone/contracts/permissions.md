# Permission Management API Contracts

All endpoints are prefixed with `/api/v1`.

---

## 1. List Permissions
* **HTTP Method**: `GET`
* **Path**: `/api/v1/admin/permissions`
* **Authentication**: Required (JWT), Admin role.
* **Query Parameters**:
  - `pageNumber`: integer (default: 1)
  - `pageSize`: integer (default: 10)
  - `searchTerm`: string (optional, searches name/description)
  - `sortBy`: string (default: "name")
  - `sortOrder`: string ("asc" | "desc", default: "asc")
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Permissions retrieved successfully.",
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "name": "country.create",
        "description": "Create geographic countries"
      }
    ],
    "meta": {
      "pageNumber": 1,
      "pageSize": 10,
      "totalRecords": 1,
      "totalPages": 1
    }
  }
  ```

---

## 2. Create Permission
* **HTTP Method**: `POST`
* **Path**: `/api/v1/admin/permissions`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "name": "country.create",
    "description": "Create geographic countries"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Permission created successfully.",
    "data": {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "country.create",
      "description": "Create geographic countries"
    },
    "meta": {}
  }
  ```

---

## 3. Update Permission
* **HTTP Method**: `PUT`
* **Path**: `/api/v1/admin/permissions/{id}`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "name": "country.create",
    "description": "Allows creation of geographic countries"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Permission updated successfully.",
    "data": {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "country.create",
      "description": "Allows creation of geographic countries"
    },
    "meta": {}
  }
  ```

---

## 4. Delete Permission
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/admin/permissions/{id}`
* **Authentication**: Required (JWT), Admin role.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Permission deleted successfully.",
    "data": {},
    "meta": {}
  }
  ```
