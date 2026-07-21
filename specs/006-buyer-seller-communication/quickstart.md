# Quickstart Validation Guide: Buyer & Seller Communication Platform

This guide outlines the commands and manual verification flows required to prove the communication platform functions correctly end-to-end.

---

## 1. Prerequisites and Setup

### A. Environment Check
*   Ensure a local database (SQL Server/PostgreSQL) is running.
*   The backend must have migrations applied:
    ```bash
    cd backend/src/API
    dotnet ef database update
    ```
*   Launch the backend server:
    ```bash
    dotnet run
    ```
*   Verify the frontend development server starts successfully:
    ```bash
    cd ../../../frontend
    npm install
    npm run dev
    ```

### B. Seed Data
Ensure the database has:
1.  **Buyer User** (JWT Token for User role: `Buyer`)
2.  **Seller User** (JWT Token for User role: `Seller`)
3.  **Property listing** (Owned by the Seller)

---

## 2. Validation Scenarios

Refer to [contracts/api.md](file:///d:/Projects/Real-Estate-Project/specs/006-buyer-seller-communication/contracts/api.md) for request body shapes.

### Scenario A: Inquiry Flow
1.  **Submit Inquiry**:
    Use the Buyer token to post an inquiry:
    ```bash
    curl -X POST http://localhost:5000/api/inquiries \
      -H "Authorization: Bearer <BUYER_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"propertyId":"<PROPERTY_ID>","subject":"Parking details","message":"Is there guest parking?","phone":"+1234567890","email":"buyer@example.com","preferredContactMethod":1,"preferredContactTime":"Mornings"}'
    ```
    *Expected Outcome*: Return `201 Created` with inquiry ID.
2.  **Reply to Inquiry**:
    Use the Seller token to reply:
    ```bash
    curl -X POST http://localhost:5000/api/inquiries/<INQUIRY_ID>/reply \
      -H "Authorization: Bearer <SELLER_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"message":"Yes, guest parking is available."}'
    ```
    *Expected Outcome*: Return `200 OK` and update status to `Replied`.

---

### Scenario B: Appointment Booking
1.  **Book Appointment**:
    Buyer requests a property visit:
    ```bash
    curl -X POST http://localhost:5000/api/appointments \
      -H "Authorization: Bearer <BUYER_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"propertyId":"<PROPERTY_ID>","date":"2026-08-15","time":"10:00:00","message":"Initial tour request.","visitorCount":2}'
    ```
    *Expected Outcome*: Return `201 Created`, status set to `Pending`.
2.  **Approve Appointment**:
    Seller approves the visit:
    ```bash
    curl -X PUT http://localhost:5000/api/appointments/<APPOINTMENT_ID>/status \
      -H "Authorization: Bearer <SELLER_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"status":1}'
    ```
    *Expected Outcome*: Return `204 No Content`, status set to `Approved`.

---

### Scenario C: Chat & Notifications (SignalR)
1.  **Establish WebSocket Client**:
    Open the browser console or use a socket testing client (e.g. Postman Websocket) to connect:
    `ws://localhost:5000/hubs/chat?access_token=<BUYER_TOKEN>`
2.  **Verify Event Receipt**:
    When a new message or offer is created, verify that the `ReceiveMessage` or `ReceiveNotification` event is broadcasted in under 1.5 seconds.

---

### Scenario D: Negotiation Flow
1.  **Submit Offer**:
    Buyer places a positive price bid:
    ```bash
    curl -X POST http://localhost:5000/api/offers \
      -H "Authorization: Bearer <BUYER_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"propertyId":"<PROPERTY_ID>","offerAmount":350000.00,"message":"Base offer.","expirationDate":"2026-07-30T23:59:59Z"}'
    ```
    *Expected Outcome*: Return `201 Created`.
2.  **Check Chat Card Injection**:
    Inspect the related conversation messages thread to verify a message of type `OfferCard` is created containing the offer amount and a reference link.

---

### Scenario E: Review Validation
1.  **Verify Non-Eligible Buyer Rejection**:
    Buyer attempts to submit a review without a completed appointment:
    ```bash
    curl -X POST http://localhost:5000/api/reviews \
      -H "Authorization: Bearer <BUYER_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{"propertyId":"<PROPERTY_ID>","rating":4,"title":"Nice listing","comment":"Looks good but did not visit."}'
    ```
    *Expected Outcome*: Return `400 Bad Request` citing eligibility check failure.

---

## 3. Automated Test Execution

Run the backend unit and integration test suite to verify MediatR handlers:
```bash
cd backend
dotnet test tests/Application.UnitTests
```

Run frontend linting checks:
```bash
cd frontend
npm run lint
```
