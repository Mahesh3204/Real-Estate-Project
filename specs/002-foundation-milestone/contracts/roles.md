# Role Management API Contracts

All endpoints are prefixed with `/api/v1`.

---

## 1. List Roles
* **HTTP Method**: `GET`
* **Path**: `/api/v1/admin/roles`
* **Authentication**: Required (JWT), Admin role.
* **Query Parameters**:
  - `pageNumber`: integer (default: 1)
  - `pageSize`: integer (default: 10)
  - `searchTerm`: string (optional, searches name)
  - `sortBy`: string (default: "name")
  - `sortOrder`: string ("asc" | "desc", default: "asc")
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Roles retrieved successfully.",
    "data": [
      {
        "id": "e2ba9c94-d2db-424a-89a1-cd4bc373111f",
        "name": "Agent",
        "permissions": ["property-type.read", "property-type.create"]
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

## 2. Get Role
* **HTTP Method**: `GET`
* **Path**: `/api/v1/admin/roles/{id}`
* **Authentication**: Required (JWT), Admin role.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Role retrieved successfully.",
    "data": {
      "id": "e2ba9c94-d2db-424a-89a1-cd4bc373111f",
      "name": "Agent",
      "permissions": [
        {
          "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          "name": "property-type.read",
          "description": "Read property types"
        }
      ]
    },
    "meta": {}
  }
  ```

---

## 3. Create Role
* **HTTP Method**: `POST`
* **Path**: `/api/v1/admin/roles`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "name": "Agent"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Role created successfully.",
    "data": {
      "id": "e2ba9c94-d2db-424a-89a1-cd4bc373111f",
      "name": "Agent"
    },
    "meta": {}
  }
  ```
* **Response (400 Bad Request - Validation Error)**:
  ```json
  {
    "success": false,
    "message": "Validation failed.",
    "errors": [
      {
        "field": "Name",
        "message": "Role name must be unique."
      }
    ]
  }
  ```

---

## 4. Update Role
* **HTTP Method**: `PUT`
* **Path**: `/api/v1/admin/roles/{id}`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "name": "Senior Agent"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Role updated successfully.",
    "data": {
      "id": "e2ba9c94-d2db-424a-89a1-cd4bc373111f",
      "name": "Senior Agent"
    },
    "meta": {}
  }
  ```

---

## 5. Delete Role
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/admin/roles/{id}`
* **Authentication**: Required (JWT), Admin role.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Role deleted successfully.",
    "data": {},
    "meta": {}
  }
  ```
* **Response (400 Bad Request - Constraint Violation)**:
  ```json
  {
    "success": false,
    "message": "Cannot delete role assigned to users.",
    "errors": []
  }
  ```

---

## 6. Assign Permissions to Role
* **HTTP Method**: `POST`
* **Path**: `/api/v1/admin/roles/{id}/permissions`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "permissionNames": [
      "country.read",
      "state.read"
    ]
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Permissions assigned to role successfully.",
    "data": {},
    "meta": {}
  }
  ```

---

## 7. Remove Permissions from Role
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/admin/roles/{id}/permissions`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "permissionNames": [
      "country.read"
    ]
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Permissions removed from role successfully.",
    "data": {},
    "meta": {}
  }
  ```
