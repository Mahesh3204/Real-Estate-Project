# API Contracts: Property Management Portal

## Endpoints

### 1. Create Property Draft (Start Wizard)
- **Method**: `POST`
- **Path**: `/api/properties/draft`
- **Request Body**:
  ```json
  {
    "title": "Luxury Mansion in Beverly Hills",
    "listingType": "Sale",
    "price": 2500000.00
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "5f1bc334-722a-4318-97cc-4cb0a4c52a3c",
    "title": "Luxury Mansion in Beverly Hills",
    "publishStatus": "Draft"
  }
  ```

### 2. Update Property Draft Step
- **Method**: `PUT`
- **Path**: `/api/properties/draft/{id}`
- **Request Body**:
  ```json
  {
    "title": "Luxury Mansion in Beverly Hills",
    "description": "Exquisite 5 bedroom home...",
    "price": 2490000.00,
    "categoryId": "2c90e0c0-6d4f-4d9d-8d48-8df0c67efbe5",
    "propertyTypeId": "4a08fbc8-bd4a-4d22-b5e1-88480392305a",
    "bedrooms": 5,
    "bathrooms": 6,
    "area": 5500.00,
    "areaUnit": "sqft",
    "countryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "stateId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    "cityId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    "areaText": "Beverly Crest",
    "address": "123 Sunset Blvd",
    "zipCode": "90210",
    "amenityIds": [
      "1d6b8fbd-3e4b-4a57-8df0-c8f0c67e1a3c",
      "2c9bc0c0-6f4f-4d9d-8d48-8df0c67efbe9"
    ],
    "metaTitle": "Luxury Mansion Beverly Hills",
    "metaDescription": "Luxury 5 bed mansion on Sunset Blvd"
  }
  ```
- **Response**: `200 OK`

### 3. Upload Media Asset
- **Method**: `POST`
- **Path**: `/api/properties/{id}/media`
- **Request Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Media File (Image/Video)
  - `isFeatured`: boolean
- **Response**: `200 OK`
  ```json
  {
    "id": "7c13a0c0-6f4f-4d9d-8d48-8df0c67efbe7",
    "filePath": "/uploads/7c13a0c0.jpg",
    "fileType": "Image",
    "isFeatured": true,
    "displayOrder": 0
  }
  ```

### 4. Update Media Sorting Order
- **Method**: `PUT`
- **Path**: `/api/properties/{id}/media/order`
- **Request Body**:
  ```json
  {
    "orderedMediaIds": [
      "7c13a0c0-6f4f-4d9d-8d48-8df0c67efbe7",
      "9d1bc334-722a-4318-97cc-4cb0a4c52a3b"
    ]
  }
  ```
- **Response**: `200 OK`

### 5. Upload Document File
- **Method**: `POST`
- **Path**: `/api/properties/{id}/documents`
- **Request Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: PDF/Word File
  - `displayName`: string
  - `isPublic`: boolean
- **Response**: `200 OK`
  ```json
  {
    "id": "a91bc334-722a-4318-97cc-4cb0a4c52a3f",
    "displayName": "Property Deed.pdf",
    "filePath": "/uploads/deeds/a91bc334.pdf",
    "isPublic": true
  }
  ```

### 6. Create Floor Plan
- **Method**: `POST`
- **Path**: `/api/properties/{id}/floor-plans`
- **Request Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Plan image file
  - `name`: string ("First Floor")
  - `dimensions`: string ("40 x 50 ft")
- **Response**: `200 OK`
  ```json
  {
    "id": "e31bc334-722a-4318-97cc-4cb0a4c52a3c",
    "name": "First Floor",
    "dimensions": "40 x 50 ft",
    "filePath": "/uploads/plans/e31bc334.jpg"
  }
  ```

### 7. Submit Property for Approval
- **Method**: `POST`
- **Path**: `/api/properties/{id}/submit`
- **Response**: `200 OK`

### 8. Admin Approve Listing
- **Method**: `POST`
- **Path**: `/api/admin/properties/{id}/approve`
- **Response**: `200 OK`

### 9. Admin Reject Listing
- **Method**: `POST`
- **Path**: `/api/admin/properties/{id}/reject`
- **Request Body**:
  ```json
  {
    "reason": "Missing clear featured image."
  }
  ```
- **Response**: `200 OK`
