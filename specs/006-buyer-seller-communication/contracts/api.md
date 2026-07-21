# API and WebSocket Contracts: Buyer & Seller Communication Platform

This document outlines the contracts for REST API controllers and SignalR Hub events.

---

## 1. REST API Controllers

All requests require a valid JWT header: `Authorization: Bearer <token>`. 
Errors conform to RFC 7807 Problem Details.

### A. Inquiry Management (`InquiriesController`)

*   **`POST /api/inquiries`** (Buyer only)
    *   *Request Body*:
        ```json
        {
          "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "subject": "Questions about parking space",
          "message": "Hi, is there a designated parking space for visitors?",
          "phone": "+1234567890",
          "email": "buyer@example.com",
          "preferredContactMethod": 1,
          "preferredContactTime": "Weekends 10 AM to 4 PM"
        }
        ```
    *   *Response (201 Created)*: Inquiry entity payload.
*   **`GET /api/inquiries`** (Sellers, Agents, Admins)
    *   *Parameters*: `pageNumber` (int), `pageSize` (int), `status` (int, optional).
    *   *Response (200 OK)*: Paginated list of Inquiries.
*   **`GET /api/inquiries/{id}`** (Authorized Owner/Agent or Admin)
    *   *Response (200 OK)*: Inquiry details.
*   **`POST /api/inquiries/{id}/reply`** (Seller or Agent)
    *   *Request Body*:
        ```json
        {
          "message": "Yes, we have 3 designated parking spots for visitors."
        }
        ```
    *   *Response (200 OK)*: Updated inquiry status/payload.
*   **`PUT /api/inquiries/{id}/status`** (Seller, Agent, or Admin)
    *   *Request Body*: `{"status": 3}` (Enum: In Progress)
    *   *Response (204 No Content)*.
*   **`DELETE /api/inquiries/{id}`** (Soft Delete)
    *   *Response (204 No Content)*.

---

### B. Appointments Management (`AppointmentsController`)

*   **`POST /api/appointments`** (Buyer only)
    *   *Request Body*:
        ```json
        {
          "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "date": "2026-08-01",
          "time": "14:30:00",
          "message": "Looking to review structural integrity.",
          "visitorCount": 2
        }
        ```
    *   *Response (201 Created)*: Appointment entity payload.
*   **`GET /api/appointments`** (Associated Buyer, Seller, Agent, or Admin)
    *   *Parameters*: `pageNumber` (int), `pageSize` (int), `viewType` (string: "upcoming" or "past").
    *   *Response (200 OK)*: Paginated appointments.
*   **`PUT /api/appointments/{id}/status`** (Seller or Agent)
    *   *Request Body*:
        ```json
        {
          "status": 1,
          "suggestedDate": null,
          "suggestedTime": null
        }
        ```
        *(Status Enum: Approved = 1, Rejected = 2, Rescheduled = 3, Completed = 4, Cancelled = 5)*
    *   *Response (204 No Content)*.

---

### C. Offers & Negotiations (`OffersController`)

*   **`POST /api/offers`** (Buyer only)
    *   *Request Body*:
        ```json
        {
          "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "offerAmount": 450000.00,
          "message": "Original offer based on recent inspections.",
          "expirationDate": "2026-07-28T23:59:59Z"
        }
        ```
    *   *Response (201 Created)*: Offer payload.
*   **`POST /api/offers/{id}/counter`** (Seller or Agent)
    *   *Request Body*:
        ```json
        {
          "offerAmount": 475000.00,
          "message": "Counter-offer minimum price.",
          "expirationDate": "2026-07-29T23:59:59Z"
        }
        ```
    *   *Response (201 Created)*: Newly created offer (parent-linked) with Status = Countered.
*   **`PUT /api/offers/{id}/status`** (Authorized Party)
    *   *Request Body*: `{"status": 1}` *(Accepted = 1, Rejected = 2, Cancelled = 5)*
    *   *Response (204 No Content)*.
*   **`GET /api/offers/property/{propertyId}/negotiation`** (Buyer or Listing Owner)
    *   *Response (200 OK)*: Comparative negotiation timeline containing full offer/counter-offer history.

---

### D. Chat Messages (`ChatController`)

*   **`GET /api/chat/conversations`** (Authenticated User)
    *   *Parameters*: `pageNumber` (int), `pageSize` (int), `searchTerm` (string, optional).
    *   *Response (200 OK)*: Paginated list of conversations with unread counts and latest message.
*   **`GET /api/chat/conversations/{id}/messages`** (Conversation Participants)
    *   *Parameters*: `pageNumber` (int), `pageSize` (int).
    *   *Response (200 OK)*: Paginated list of messages (newest first).

---

### E. Notifications (`NotificationsController`)

*   **`GET /api/notifications`** (Authenticated User)
    *   *Parameters*: `pageNumber` (int), `pageSize` (int).
    *   *Response (200 OK)*: Paginated alerts list.
*   **`PUT /api/notifications/{id}/read`**
    *   *Response (204 No Content)*.
*   **`PUT /api/notifications/read-all`**
    *   *Response (204 No Content)*.
*   **`DELETE /api/notifications/{id}`**
    *   *Response (204 No Content)*.

---

### F. Reviews (`ReviewsController`)

*   **`POST /api/reviews`** (Verified Buyer only)
    *   *Request Body*:
        ```json
        {
          "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "rating": 5,
          "title": "Professional and helpful agent",
          "comment": "Had a fantastic property viewing. Very clean and well explained.",
          "images": ["https://storage.example.com/reviews/img1.jpg"]
        }
        ```
    *   *Response (201 Created)*: Review payload.
*   **`POST /api/reviews/{id}/reply`** (Seller or Agent)
    *   *Request Body*: `{"replyContent": "Thank you for the wonderful feedback!"}`
    *   *Response (200 OK)*.
*   **`POST /api/reviews/{id}/report`** (Seller or Agent)
    *   *Response (204 No Content)*.
*   **`PUT /api/reviews/{id}/visibility`** (Admin only)
    *   *Request Body*: `{"isHidden": true}`
    *   *Response (204 No Content)*.

---

## 2. SignalR Hub Events

Clients establish connections passing JWT tokens in query parameters: `ws://domain/hubs/chat?access_token=<jwt_token>`.

### A. Chat Hub (`ChatHub`)

#### Client-to-Hub Actions
*   **`JoinConversation(Guid conversationId)`**
    *   Join the connection to a specific conversation room.
*   **`SendMessage(Guid conversationId, string content, int contentType)`**
    *   Dispatches a message (Text, Image, File, or OfferCard metadata) to the conversation.
*   **`SendTypingState(Guid conversationId, bool isTyping)`**
    *   Notifies participants of typing status.
*   **`MarkAsRead(Guid conversationId)`**
    *   Marks all messages in the conversation as read.

#### Hub-to-Client Broadcast Events
*   **`ReceiveMessage(MessageDto message)`**
    *   Triggered when a new message is posted in the conversation.
*   **`UserTypingState(Guid conversationId, Guid userId, bool isTyping)`**
    *   Notifies the client that a specific user is typing.
*   **`MessageReadStatus(Guid conversationId, Guid readByUserId, DateTimeOffset readTime)`**
    *   Notifies the client that messages have been read.

---

### B. Notification Hub (`NotificationHub`)

#### Hub-to-Client Broadcast Events
*   **`ReceiveNotification(NotificationDto notification)`**
    *   Pushes dynamic, real-time alert updates to the active user connection, incrementing unread counts.
