# API Contracts: Authentication

## Endpoints

### 1. User Registration
Creates a new user profile.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword1!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "role": "Buyer"
}
```
- **Success Response (200 OK)**:
```json
{
  "message": "Registration successful. Please enter the OTP sent to your email.",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```
- **Error Response (400 Bad Request)**:
```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": ["Email is already registered."],
    "Password": ["Password must contain at least 1 uppercase letter and 1 special character."]
  }
}
```

---

### 2. Verify Registration OTP
Verifies the newly created account.

- **URL**: `/api/auth/verify`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "otpCode": "123456"
}
```
- **Success Response (200 OK)**:
```json
{
  "message": "Account verified successfully. You can now login."
}
```
- **Error Response (400 Bad Request)**:
```json
{
  "message": "Invalid or expired OTP code."
}
```

---

### 3. User Login
Authenticates the user and sets JWT credentials.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword1!"
}
```
- **Success Response (200 OK)**:
  - *Cookies*: Sets HTTP-only secure cookie `refreshToken`.
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresInSeconds": 3600,
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "role": "Buyer",
    "isVerified": true
  }
}
```

---

### 4. Google Single Sign-On
Verifies a Google credentials token and signs the user in.

- **URL**: `/api/auth/google`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "idToken": "google_credential_jwt_string",
  "role": "Buyer" 
}
```
- **Success Response (200 OK)**:
  - *Cookies*: Sets HTTP-only secure cookie `refreshToken`.
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresInSeconds": 3600,
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "role": "Buyer"
  }
}
```

---

### 5. Forgot Password Request
Generates and sends a reset password OTP token.

- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "email": "user@example.com"
}
```
- **Success Response (200 OK)**:
```json
{
  "message": "If the email is registered, a password reset link has been sent."
}
```

---

### 6. Reset Password Confirmation
Resets the password with the valid token.

- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "resetToken": "token_from_email",
  "newPassword": "NewSecurePassword2!"
}
```
- **Success Response (200 OK)**:
```json
{
  "message": "Password has been reset successfully."
}
```
