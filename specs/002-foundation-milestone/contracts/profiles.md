# User Profile API Contracts

All endpoints are prefixed with `/api/v1`.

---

## 1. Get Profile (Current User)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/user/profile`
* **Authentication**: Required (JWT). Any role.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully.",
    "data": {
      "id": "c3ba9c94-d2db-424a-89a1-cd4bc373111f",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": "http://localhost:5000/uploads/avatars/john_doe.png",
      "phone": "+1234567890",
      "gender": "Male",
      "dateOfBirth": "1990-01-01",
      "country": {
        "id": "f5ba9c94-d2db-424a-89a1-cd4bc373222a",
        "name": "United States"
      },
      "state": {
        "id": "e4ba9c94-d2db-424a-89a1-cd4bc373222b",
        "name": "California"
      },
      "city": {
        "id": "d3ba9c94-d2db-424a-89a1-cd4bc373222c",
        "name": "Los Angeles"
      },
      "area": "Downtown LA",
      "zipCode": "90001",
      "language": "en",
      "timezone": "America/Los_Angeles"
    },
    "meta": {}
  }
  ```

---

## 2. Update Profile
* **HTTP Method**: `PUT`
* **Path**: `/api/v1/user/profile`
* **Authentication**: Required (JWT). Users can only update their own profile.
* **Request Body**:
  ```json
  {
    "firstName": "Jonathan",
    "lastName": "Doe",
    "phone": "+1987654321",
    "gender": "Male",
    "dateOfBirth": "1990-01-01",
    "countryId": "f5ba9c94-d2db-424a-89a1-cd4bc373222a",
    "stateId": "e4ba9c94-d2db-424a-89a1-cd4bc373222b",
    "cityId": "d3ba9c94-d2db-424a-89a1-cd4bc373222c",
    "area": "Westwood",
    "zipCode": "90024",
    "language": "en",
    "timezone": "America/Los_Angeles"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully.",
    "data": {
      "id": "c3ba9c94-d2db-424a-89a1-cd4bc373111f",
      "firstName": "Jonathan",
      "lastName": "Doe",
      "phone": "+1987654321",
      "gender": "Male",
      "dateOfBirth": "1990-01-01",
      "countryId": "f5ba9c94-d2db-424a-89a1-cd4bc373222a",
      "stateId": "e4ba9c94-d2db-424a-89a1-cd4bc373222b",
      "cityId": "d3ba9c94-d2db-424a-89a1-cd4bc373222c",
      "area": "Westwood",
      "zipCode": "90024",
      "language": "en",
      "timezone": "America/Los_Angeles"
    },
    "meta": {}
  }
  ```

---

## 3. Upload Avatar
* **HTTP Method**: `POST`
* **Path**: `/api/v1/user/profile/avatar`
* **Authentication**: Required (JWT).
* **Request Content-Type**: `multipart/form-data`
* **Form Parameters**:
  - `file`: File binary (JPEG/PNG/WEBP, max 5MB)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Avatar uploaded successfully.",
    "data": {
      "avatarUrl": "http://localhost:5000/uploads/avatars/unique_file_name.png"
    },
    "meta": {}
  }
  ```

---

## 4. Remove Avatar
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/user/profile/avatar`
* **Authentication**: Required (JWT).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Avatar removed successfully.",
    "data": {},
    "meta": {}
  }
  ```

---

## 5. Get Profile By ID (Admin Only)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/admin/profiles/{id}`
* **Authentication**: Required (JWT), Admin role.
* **Response (200 OK)**: Same structure as Get Profile.
