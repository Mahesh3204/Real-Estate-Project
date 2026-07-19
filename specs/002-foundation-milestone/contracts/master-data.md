# Property Taxonomy Master Data API Contracts

All endpoints are prefixed with `/api/v1`.

---

## 1. Property Categories

### List Categories (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/categories`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Categories retrieved successfully.",
    "data": [
      {
        "id": "b1ba9c94-d2db-424a-89a1-cd4bc3731111",
        "name": "Residential",
        "slug": "residential",
        "description": "Residential properties",
        "imageUrl": "http://localhost:5000/uploads/categories/residential.jpg",
        "displayOrder": 1,
        "isActive": true
      }
    ],
    "meta": {}
  }
  ```

### Create Category (Admin)
* **HTTP Method**: `POST`
* **Path**: `/api/v1/admin/categories`
* **Authentication**: Required (JWT), Admin role.
* **Request Body**:
  ```json
  {
    "name": "Residential",
    "description": "Residential properties for living",
    "imageUrl": "http://localhost:5000/uploads/categories/residential.jpg",
    "displayOrder": 1
  }
  ```
* **Response (201 Created)**: Standard JSON with created entity.

---

## 2. Property Types (Belongs to Category)

### List Property Types (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/property-types`
* **Query Parameters**:
  - `categoryId`: Guid (optional)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Property types retrieved successfully.",
    "data": [
      {
        "id": "b2ba9c94-d2db-424a-89a1-cd4bc3732222",
        "categoryId": "b1ba9c94-d2db-424a-89a1-cd4bc3731111",
        "name": "Apartment",
        "slug": "apartment",
        "description": "Multi-family apartment",
        "displayOrder": 1,
        "isActive": true
      }
    ]
  }
  ```

### Create Property Type (Admin)
* **HTTP Method**: `POST`
* **Path**: `/api/v1/admin/property-types`
* **Request Body**:
  ```json
  {
    "categoryId": "b1ba9c94-d2db-424a-89a1-cd4bc3731111",
    "name": "Apartment",
    "description": "Apartments",
    "displayOrder": 1
  }
  ```
* **Response (201 Created)**: Standard JSON response.

---

## 3. Property Statuses

### List Property Statuses (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/property-statuses`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Property statuses retrieved successfully.",
    "data": [
      {
        "id": "b3ba9c94-d2db-424a-89a1-cd4bc3733333",
        "name": "For Sale",
        "isActive": true,
        "displayOrder": 1
      }
    ]
  }
  ```

---

## 4. Property Conditions

### List Property Conditions (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/property-conditions`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Property conditions retrieved successfully.",
    "data": [
      {
        "id": "b4ba9c94-d2db-424a-89a1-cd4bc3734444",
        "name": "Ready To Move"
      }
    ]
  }
  ```

---

## 5. Amenities

### List Amenities (Public)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/amenities`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Amenities retrieved successfully.",
    "data": [
      {
        "id": "b5ba9c94-d2db-424a-89a1-cd4bc3735555",
        "name": "Swimming Pool",
        "slug": "swimming-pool",
        "iconUrl": "http://localhost:5000/uploads/amenities/pool.svg",
        "category": "Outdoor",
        "description": "Community swimming pool",
        "displayOrder": 1,
        "isActive": true
      }
    ]
  }
  ```
