# Audit Log API Contracts

All endpoints are prefixed with `/api/v1`.

---

## 1. List Audit Logs (Admin Only)
* **HTTP Method**: `GET`
* **Path**: `/api/v1/admin/audit-logs`
* **Authentication**: Required (JWT), Admin role with `audit-log.read` permission.
* **Query Parameters**:
  - `pageNumber`: integer (default: 1)
  - `pageSize`: integer (default: 20)
  - `searchTerm`: string (optional, searches resource, user, or action)
  - `resource`: string (optional, filter by specific resource e.g. "Country")
  - `action`: string (optional, filter by specific action e.g. "Create", "Update", "Delete")
  - `startDate`: string (ISO 8601 date, optional)
  - `endDate`: string (ISO 8601 date, optional)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Audit logs retrieved successfully.",
    "data": [
      {
        "id": "e5ba9c94-d2db-424a-89a1-cd4bc373111f",
        "userId": "c3ba9c94-d2db-424a-89a1-cd4bc373111f",
        "userEmail": "admin@example.com",
        "action": "Update",
        "resource": "Country",
        "resourceId": "f5ba9c94-d2db-424a-89a1-cd4bc373222a",
        "oldValues": "{\"Name\":\"United State\"}",
        "newValues": "{\"Name\":\"United States\"}",
        "timestamp": "2026-07-19T09:20:00Z",
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
      }
    ],
    "meta": {
      "pageNumber": 1,
      "pageSize": 20,
      "totalRecords": 1,
      "totalPages": 1
    }
  }
  ```
