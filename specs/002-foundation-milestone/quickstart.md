# Quickstart & Verification Guide: Milestone 1 (Foundation)

This guide documents the procedures to set up, run, and verify the components implemented in Milestone 1 (Foundation) of the Real Estate Platform.

---

## 1. Prerequisites & Setup

### Database Setup
1. Apply EF Core database migrations:
   ```bash
   dotnet ef database update --project src/Infrastructure --startup-project src/API
   ```
2. Run database seeders (this should happen automatically on application startup or via a setup command):
   - Verify that default roles (`Admin`, `Agent`, `Buyer`, `Seller`) and initial permissions (e.g. `role.read`, `country.create`) are populated.
   - Verify that sample locations (Countries, States, Cities) are populated.

### Run Web API
Start the backend web api server:
```bash
cd backend/src/API
dotnet run
```
The API is available at `http://localhost:5000` or `https://localhost:5001`.

---

## 2. API Verification Flows

Use an API client (like Postman or curl) to execute these verification scenarios. Ensure you login first to obtain the JWT token for the `Authorization: Bearer <token>` header.

### Scenario A: Role & Permission Assignment (Module 1 & 2)
1. **List Permissions**: Retrieve all available permissions from `/api/v1/admin/permissions`.
2. **Assign Permission to Role**:
   - Send `POST /api/v1/admin/roles/{roleId}/permissions` with payload:
     ```json
     {
       "permissionNames": ["country.create"]
     }
     ```
3. **Verify Authorization Guard**:
   - Request `POST /api/v1/admin/locations/countries` using a token that has the `Agent` role (which lacks `country.create`).
   - Expected Outcome: `403 Forbidden` response.
   - Request using an `Admin` token.
   - Expected Outcome: `201 Created` response.

### Scenario B: Location Management (Module 4)
1. **Create Country**: `POST /api/v1/admin/locations/countries` $\rightarrow$ returns ID `country_uuid`.
2. **Create State**: `POST /api/v1/admin/locations/states` specifying `countryId: country_uuid` $\rightarrow$ returns ID `state_uuid`.
3. **Delete Country**: Send `DELETE /api/v1/admin/locations/countries/{country_uuid}`.
   - Expected Outcome: `400 Bad Request` with message "Cannot delete Country because dependent States exist."
4. **List Locations (Public)**: Send `GET /api/v1/locations/states?countryId={country_uuid}`.
   - Expected Outcome: A list containing California or the seeded state.

### Scenario C: File Upload Service (Module 10)
1. **Upload Avatar**: Send `POST /api/v1/files/upload` as `multipart/form-data` with a PNG image under `file`.
   - Expected Outcome: Returns `200 OK` with a valid public URL and File ID.
2. **Upload Invalid File**: Attempt to upload a `.txt` or `.exe` file.
   - Expected Outcome: `400 Bad Request` validation error.

### Scenario D: Audit Logging Inspection (Module 11)
1. **Perform Admin Action**: Create a property category or update a country.
2. **Query Audit Logs**: Send `GET /api/v1/admin/audit-logs?resource=Country`.
   - Expected Outcome: Logs showing your action, old and new values in JSON format, IP address, and browser User Agent.

---

## 3. Automated Tests
Run the entire suite of unit and integration tests to verify code coverage (minimum target: 80%):
```bash
dotnet test backend/tests/Application.UnitTests
```
To run coverage report:
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura
```
