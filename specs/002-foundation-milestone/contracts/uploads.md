# Shared File Upload API Contracts

All endpoints are prefixed with `/api/v1`.

---

## 1. Upload File
* **HTTP Method**: `POST`
* **Path**: `/api/v1/files/upload`
* **Authentication**: Required (JWT).
* **Request Content-Type**: `multipart/form-data`
* **Form Parameters**:
  - `file`: Binary file data (Required. Checked for: JPEG, PNG, WEBP, SVG. Max size: 5MB)
  - `folder`: string (Optional. The sub-folder to store files, e.g., "avatars", "categories", "amenities")
* **Response (200 OK - Success)**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully.",
    "data": {
      "id": "f9ba9c94-d2db-424a-89a1-cd4bc3739999",
      "fileName": "avatar_129381.png",
      "mimeType": "image/png",
      "sizeBytes": 1048576,
      "url": "http://localhost:5000/uploads/avatars/avatar_129381.png"
    },
    "meta": {}
  }
  ```
* **Response (400 Bad Request - Large File)**:
  ```json
  {
    "success": false,
    "message": "File size exceeds 5MB limit.",
    "errors": []
  }
  ```
* **Response (400 Bad Request - Invalid MIME Type)**:
  ```json
  {
    "success": false,
    "message": "Invalid file type. Only JPEG, PNG, WEBP, and SVG are allowed.",
    "errors": []
  }
  ```

---

## 2. Delete File
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/files/{id}`
* **Authentication**: Required (JWT).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "File deleted successfully.",
    "data": {},
    "meta": {}
  }
  ```
