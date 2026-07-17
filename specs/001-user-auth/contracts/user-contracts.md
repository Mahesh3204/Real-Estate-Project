# API Contracts: User Profile & Activities

## Security
All requests in this contract require an `Authorization` header containing a valid JWT Bearer token:
`Authorization: Bearer <accessToken>`

---

## Endpoints

### 1. Get User Profile
Retrieves detailed profile info for the logged-in user.

- **URL**: `/api/user/profile`
- **Method**: `GET`
- **Success Response (200 OK)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "profilePictureUrl": "https://example.com/profiles/john.jpg",
  "role": "Buyer",
  "isVerified": true
}
```

---

### 2. Update User Profile
Updates contact information or profile picture.

- **URL**: `/api/user/profile`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phoneNumber": "0987654321",
  "profilePictureUrl": "https://example.com/profiles/john_new.jpg"
}
```
- **Success Response (200 OK)**:
```json
{
  "message": "Profile updated successfully.",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "firstName": "Jonathan",
    "lastName": "Doe",
    "phoneNumber": "0987654321"
  }
}
```

---

### 3. Add Property to Favorites
Bookmarks a property listing for the user.

- **URL**: `/api/user/favorites`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "propertyId": "8fa25d64-1217-4362-b2fc-2c963f66bbb9"
}
```
- **Success Response (200 OK)**:
```json
{
  "message": "Property added to favorites."
}
```

---

### 4. Remove Property from Favorites
Deletes a saved bookmark.

- **URL**: `/api/user/favorites/{propertyId}`
- **Method**: `DELETE`
- **Success Response (200 OK)**:
```json
{
  "message": "Property removed from favorites."
}
```

---

### 5. Get Favorites List
Retrieves bookmarked property IDs.

- **URL**: `/api/user/favorites`
- **Method**: `GET`
- **Success Response (200 OK)**:
```json
{
  "favorites": [
    {
      "propertyId": "8fa25d64-1217-4362-b2fc-2c963f66bbb9",
      "savedAt": "2026-07-17T12:00:00Z"
    }
  ]
}
```

---

### 6. Get Recently Viewed properties
Retrieves the logged-in user's viewing history.

- **URL**: `/api/user/recently-viewed`
- **Method**: `GET`
- **Success Response (200 OK)**:
```json
{
  "recentlyViewed": [
    {
      "propertyId": "8fa25d64-1217-4362-b2fc-2c963f66bbb9",
      "viewedAt": "2026-07-17T12:15:00Z"
    }
  ]
}
```

---

### 7. Get Inquiry History
Retrieves inquiries sent by this user.

- **URL**: `/api/user/inquiries`
- **Method**: `GET`
- **Success Response (200 OK)**:
```json
{
  "inquiries": [
    {
      "id": "eec85f64-5717-4562-b3fc-2c963f66ddd3",
      "propertyId": "8fa25d64-1217-4362-b2fc-2c963f66bbb9",
      "message": "Is this property available for visit this weekend?",
      "status": "Submitted",
      "createdAt": "2026-07-17T11:00:00Z"
    }
  ]
}
```

---

### 8. Update Inquiry Status (Admin / Agent Only)
Updates the state of an active inquiry.

- **URL**: `/api/user/inquiries/{inquiryId}/status`
- **Method**: `PATCH`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "status": "Responded"
}
```
- **Success Response (200 OK)**:
```json
{
  "message": "Inquiry status updated successfully.",
  "inquiryId": "eec85f64-5717-4562-b3fc-2c963f66ddd3",
  "status": "Responded"
}
```
