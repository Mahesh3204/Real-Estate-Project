# Location Management API Contracts

All endpoints are prefixed with `/api/v1`.

---

## Public APIs

### 1. List Countries (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/locations/countries`
* **Query Parameters**:
  - `pageNumber`: integer (default: 1)
  - `pageSize`: integer (default: 10)
  - `searchTerm`: string (optional, searches country name or code)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Countries retrieved successfully.",
    "data": [
      {
        "id": "f5ba9c94-d2db-424a-89a1-cd4bc373222a",
        "name": "United States",
        "code": "USA",
        "isActive": true
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

### 2. List States (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/locations/states`
* **Query Parameters**:
  - `countryId`: Guid (optional, filters by country)
  - `pageNumber`: integer (default: 1)
  - `pageSize`: integer (default: 10)
  - `searchTerm`: string (optional)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "States retrieved successfully.",
    "data": [
      {
        "id": "e4ba9c94-d2db-424a-89a1-cd4bc373222b",
        "countryId": "f5ba9c94-d2db-424a-89a1-cd4bc373222a",
        "name": "California",
        "isActive": true
      }
    ],
    "meta": {}
  }
  ```

### 3. List Cities (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/locations/cities`
* **Query Parameters**:
  - `stateId`: Guid (optional, filters by state)
  - `pageNumber`: integer
  - `pageSize`: integer
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cities retrieved successfully.",
    "data": [
      {
        "id": "d3ba9c94-d2db-424a-89a1-cd4bc373222c",
        "stateId": "e4ba9c94-d2db-424a-89a1-cd4bc373222b",
        "name": "Los Angeles",
        "isActive": true
      }
    ]
  }
  ```

---

## Admin CRUD APIs

### 4. Create Country
* **HTTP Method**: `POST`
* **Path**: `/api/v1/admin/locations/countries`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "name": "Canada",
    "code": "CAN"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Country created successfully.",
    "data": {
      "id": "c1ba9c94-d2db-424a-89a1-cd4bc373222d",
      "name": "Canada",
      "code": "CAN",
      "isActive": true
    }
  }
  ```

### 5. Update Country
* **HTTP Method**: `PUT`
* **Path**: `/api/v1/admin/locations/countries/{id}`
* **Request Body**:
  ```json
  {
    "name": "Canada Update",
    "code": "CAN",
    "isActive": false
  }
  ```
* **Response (200 OK)**: Standard response structure.

### 6. Delete Country (Soft Delete)
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/admin/locations/countries/{id}`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Country soft-deleted successfully.",
    "data": {}
  }
  ```
* **Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Cannot delete Country because dependent States exist.",
    "errors": []
  }
  ```

### 7. Restore Country
* **HTTP Method**: `POST`
* **Path**: `/api/v1/admin/locations/countries/{id}/restore`
* **Response (200 OK)**: Restores the soft-deleted country.
