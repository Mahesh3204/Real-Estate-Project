# API Contracts: Milestone 3 - Property Discovery

This document details the REST API endpoints and contracts introduced or modified in the Property Discovery milestone. All requests use `application/json` content-types.

## 1. Property Discovery, Searching, and Recommendations

### GET `/api/v1/properties`

Retrieves a paginated, sorted, and filtered list of property listings.

* **Authorization**: Optional (Anonymous allowed). Non-published properties are excluded unless requester is Admin or Owner.
* **Query Parameters**:
  * `pageNumber` (int, default: 1)
  * `pageSize` (int, default: 10)
  * `searchQuery` (string, optional): Searches title, description, address.
  * `categoryId` (Guid, optional): Filter by property category (e.g., Residential, Commercial).
  * `propertyTypeId` (Guid, optional): Filter by property type (e.g., Apartment, Villa).
  * `statusId` (Guid, optional): Filter by status (e.g., Active, Sold).
  * `conditionId` (Guid, optional): Filter by condition (e.g., New, Refurbished).
  * `minPrice` (decimal, optional)
  * `maxPrice` (decimal, optional)
  * `bedrooms` (int, optional)
  * `bathrooms` (int, optional)
  * `minArea` (decimal, optional)
  * `maxArea` (decimal, optional)
  * `cityId` (Guid, optional)
  * `areaId` (Guid, optional)
  * `furnishedStatus` (string, optional): e.g., "Furnished", "Unfurnished".
  * `parking` (int, optional): Minimum parking spaces.
  * `yearBuilt` (int, optional): Minimum year built.
  * `listingType` (string, optional): "Sale" or "Rent".
  * `sortBy` (string, default: "newest"): Options: `newest`, `oldest`, `price_asc`, `price_desc`, `area_asc`, `area_desc`, `updated`.
  * `amenityIds` (Guid[], optional): Filter listings containing all selected amenities.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "title": "Modern 3 Bed Apartment",
          "slug": "modern-3-bed-apartment",
          "price": 350000.00,
          "listingType": "Sale",
          "categoryName": "Residential",
          "propertyTypeName": "Apartment",
          "statusName": "Active",
          "bedrooms": 3,
          "bathrooms": 2,
          "area": 120.0,
          "cityName": "Miami",
          "featuredImageUrl": "/uploads/properties/img1.jpg",
          "ownerName": "John Doe",
          "createdDate": "2026-07-20T12:00:00Z"
        }
      ],
      "pageNumber": 1,
      "totalPages": 5,
      "totalCount": 48,
      "hasPreviousPage": false,
      "hasNextPage": true
    }
  }
  ```

### GET `/api/v1/properties/{id}/related`

Retrieves up to 5 properties related to the specified listing (based on sharing the same CategoryId).

* **Authorization**: Optional. Only returns published properties.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "7ca85f64-5717-4562-b3fc-2c963f66afa7",
        "title": "Cozy 2 Bed Apartment",
        "price": 280000.00,
        "featuredImageUrl": "/uploads/properties/img2.jpg"
      }
    ]
  }
  ```

### GET `/api/v1/properties/popular-cities`

Retrieves a list of cities with the count of active, published listings.

* **Authorization**: Optional.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "cityId": "4fa85f64-5717-4562-b3fc-2c963f66afa1",
        "cityName": "Miami",
        "propertyCount": 24,
        "imageUrl": "/uploads/cities/miami.jpg"
      }
    ]
  }
  ```

---

## 2. Favorites System

### GET `/api/v1/favorites`

Retrieves the authenticated user's favorited property listings.

* **Authorization**: Required (Bearer Token).
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "title": "Modern 3 Bed Apartment",
          "price": 350000.00,
          "cityName": "Miami"
        }
      ]
    }
  }
  ```

### POST `/api/v1/favorites`

Saves a property to the user's favorites list.

* **Authorization**: Required.
* **Request Body**:
  ```json
  {
    "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
* **Response (HTTP 200 OK / HTTP 400 Bad Request if duplicate)**:
  ```json
  {
    "success": true,
    "message": "Property added to favorites."
  }
  ```

### DELETE `/api/v1/favorites/{propertyId}`

Removes a property from the user's favorites list.

* **Authorization**: Required.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Property removed from favorites."
  }
  ```

---

## 3. Saved Searches

### GET `/api/v1/saved-searches`

Retrieves saved searches for the authenticated user.

* **Authorization**: Required.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "8fa85f64-5717-4562-b3fc-2c963f66afb2",
        "name": "3 Bed Apartments in Miami",
        "queryParameters": "{\"searchQuery\":\"Miami\",\"bedrooms\":3}",
        "createdDate": "2026-07-20T10:00:00Z"
      }
    ]
  }
  ```

### POST `/api/v1/saved-searches`

Saves a search configuration.

* **Authorization**: Required.
* **Request Body**:
  ```json
  {
    "name": "3 Bed Apartments in Miami",
    "queryParameters": "{\"searchQuery\":\"Miami\",\"bedrooms\":3}"
  }
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "8fa85f64-5717-4562-b3fc-2c963f66afb2"
    }
  }
  ```

### DELETE `/api/v1/saved-searches/{id}`

Deletes a saved search configuration.

* **Authorization**: Required.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Saved search deleted successfully."
  }
  ```

---

## 4. Recently Viewed Property History

### GET `/api/v1/recently-viewed`

Retrieves the authenticated user's viewed history (max 20).

* **Authorization**: Required.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "title": "Modern 3 Bed Apartment",
        "viewedAt": "2026-07-20T14:30:00Z"
      }
    ]
  }
  ```

### POST `/api/v1/recently-viewed`

Logs that the user has viewed a property details page.

* **Authorization**: Required.
* **Request Body**:
  ```json
  {
    "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true
  }
  ```

### DELETE `/api/v1/recently-viewed`

Clears the viewing history for the authenticated user.

* **Authorization**: Required.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Recently viewed history cleared."
  }
  ```

---

## 5. Public Profiles

### GET `/api/v1/profiles/public/{userId}`

Retrieves public information and listings of an Agent or Seller.

* **Authorization**: Optional. Only public information and published properties are returned.
* **Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "userId": "9fa85f64-5717-4562-b3fc-2c963f66afa2",
      "firstName": "John",
      "lastName": "Smith",
      "company": "Premier Real Estate",
      "bio": "Expert realtor with 10+ years of experience in the Miami metro area.",
      "phoneNumber": "+13055551234",
      "email": "john.smith@premier.com",
      "profileImageUrl": "/uploads/users/avatar.jpg",
      "joinedDate": "2024-01-15T00:00:00Z",
      "totalListings": 12,
      "socialLinks": {
        "facebook": "https://facebook.com/john",
        "linkedin": "https://linkedin.com/in/john"
      },
      "publishedProperties": [
        {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "title": "Modern 3 Bed Apartment",
          "price": 350000.00
        }
      ]
    }
  }
  ```
