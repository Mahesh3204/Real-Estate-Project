# Data Model Design: Milestone 1 (Foundation)

This document describes the schema definition, fields, relationships, indexes, and validation rules for Milestone 1 (Foundation).

---

## Entity Schema Definitions

### 1. Role (`roles`)
Maps to ASP.NET Identity roles.
- `Id`: Guid (Primary Key)
- `Name`: string (Unique, MaxLength: 256)
- `NormalizedName`: string (Unique, MaxLength: 256)
- **Relationships**:
  - Many-to-Many with `Permission` via `RolePermission`
- **Validation**:
  - Role Name must be unique.
  - Cannot be deleted if assigned to any user.

### 2. Permission (`permissions`)
- `Id`: Guid (Primary Key)
- `Name`: string (Unique, MaxLength: 100, e.g., `country.create`)
- `Description`: string (MaxLength: 250)
- **Relationships**:
  - Many-to-Many with `Role` via `RolePermission`
- **Validation**:
  - Permission Name must be unique.

### 3. RolePermission (`role_permissions`)
Join table for roles and permissions.
- `RoleId`: Guid (Foreign Key, Part of Composite PK)
- `PermissionId`: Guid (Foreign Key, Part of Composite PK)
- **Indexes**:
  - Index on `RoleId`
  - Index on `PermissionId`

### 4. Profile (`profiles`)
Extended details for users (One-to-One mapping with standard Identity `User`).
- `Id`: Guid (Primary Key, Foreign Key to `AspNetUsers.Id`)
- `FirstName`: string (MaxLength: 50, Required)
- `LastName`: string (MaxLength: 50, Required)
- `AvatarUrl`: string? (MaxLength: 500)
- `Phone`: string? (MaxLength: 20)
- `Gender`: string? (MaxLength: 10)
- `DateOfBirth`: DateTime?
- `CountryId`: Guid? (Foreign Key to `countries`)
- `StateId`: Guid? (Foreign Key to `states`)
- `CityId`: Guid? (Foreign Key to `cities`)
- `Area`: string? (MaxLength: 100) — *Free-text field (Hybrid choice)*
- `ZipCode`: string? (MaxLength: 20)
- `Language`: string? (MaxLength: 10, default: `en`)
- `Timezone`: string? (MaxLength: 50, default: `UTC`)
- **Relationships**:
  - `User` (One-to-One, Cascade delete)
  - `Country` (Many-to-One, Restrict delete)
  - `State` (Many-to-One, Restrict delete)
  - `City` (Many-to-One, Restrict delete)

---

## Location Management Entities

### 5. Country (`countries`)
- `Id`: Guid (Primary Key)
- `Name`: string (Unique, MaxLength: 100, Required)
- `Code`: string (Unique, MaxLength: 3, Required, e.g. `USA`, `IND`)
- `IsActive`: bool (Default: `true`)
- `IsDeleted`: bool (Default: `false`, Soft Delete)
- **Validation**:
  - Unique Name and Code.
  - Cannot delete if it contains dependent States.

### 6. State (`states`)
- `Id`: Guid (Primary Key)
- `CountryId`: Guid (Foreign Key, Required)
- `Name`: string (MaxLength: 100, Required)
- `IsActive`: bool (Default: `true`)
- `IsDeleted`: bool (Default: `false`, Soft Delete)
- **Relationships**:
  - `Country` (Many-to-One, Restrict delete)
- **Validation**:
  - Name must be unique within the same Country.
  - Cannot delete if it contains dependent Cities.

### 7. City (`cities`)
- `Id`: Guid (Primary Key)
- `StateId`: Guid (Foreign Key, Required)
- `Name`: string (MaxLength: 100, Required)
- `IsActive`: bool (Default: `true`)
- `IsDeleted`: bool (Default: `false`, Soft Delete)
- **Relationships**:
  - `State` (Many-to-One, Restrict delete)
- **Validation**:
  - Name must be unique within the same State.
  - Cannot delete if it contains dependent Areas.

### 8. Area (`areas`)
- `Id`: Guid (Primary Key)
- `CityId`: Guid (Foreign Key, Required)
- `Name`: string (MaxLength: 100, Required)
- `IsActive`: bool (Default: `true`)
- `IsDeleted`: bool (Default: `false`, Soft Delete)
- **Relationships**:
  - `City` (Many-to-One, Restrict delete)
- **Validation**:
  - Name must be unique within the same City.

---

## Property Taxonomy & Master Data Entities

### 9. PropertyCategory (`property_categories`)
- `Id`: Guid (Primary Key)
- `Name`: string (Unique, MaxLength: 100, Required)
- `Slug`: string (Unique, MaxLength: 100, Required)
- `Description`: string? (MaxLength: 500)
- `ImageUrl`: string? (MaxLength: 500)
- `DisplayOrder`: int (Default: `0`)
- `IsActive`: bool (Default: `true`)
- `IsDeleted`: bool (Default: `false`, Soft Delete)
- **Validation**:
  - Unique Name and Slug.
  - Cannot delete if it contains dependent Property Types.

### 10. PropertyType (`property_types`)
- `Id`: Guid (Primary Key)
- `CategoryId`: Guid (Foreign Key, Required)
- `Name`: string (MaxLength: 100, Required)
- `Slug`: string (Unique, MaxLength: 100, Required)
- `Description`: string? (MaxLength: 500)
- `DisplayOrder`: int (Default: `0`)
- `IsActive`: bool (Default: `true`)
- **Relationships**:
  - `PropertyCategory` (Many-to-One, Restrict delete)
- **Validation**:
  - Unique Slug.
  - Category must exist.

### 11. PropertyStatus (`property_statuses`)
- `Id`: Guid (Primary Key)
- `Name`: string (Unique, MaxLength: 50, Required, e.g., `Sale`, `Rent`, `Lease`)
- `IsActive`: bool (Default: `true`)
- `DisplayOrder`: int (Default: `0`)
- **Validation**:
  - Unique Name.

### 12. PropertyCondition (`property_conditions`)
- `Id`: Guid (Primary Key)
- `Name`: string (Unique, MaxLength: 50, Required, e.g., `New`, `Resale`, `Under Construction`)
- **Validation**:
  - Unique Name.

### 13. Amenity (`amenities`)
- `Id`: Guid (Primary Key)
- `Name`: string (MaxLength: 100, Required)
- `Slug`: string (Unique, MaxLength: 100, Required)
- `IconUrl`: string? (MaxLength: 500)
- `Category`: string (MaxLength: 50, Required, e.g., `Indoor`, `Outdoor`, `Community`)
- `Description`: string? (MaxLength: 500)
- `DisplayOrder`: int (Default: `0`)
- `IsActive`: bool (Default: `true`)
- `IsDeleted`: bool (Default: `false`, Soft Delete)
- **Validation**:
  - Unique Slug.

---

## Utility & Log Entities

### 14. File (`files`)
Tracks metadata for uploaded media files.
- `Id`: Guid (Primary Key)
- `FileName`: string (MaxLength: 256, Required)
- `FilePath`: string (MaxLength: 500, Required)
- `Url`: string (MaxLength: 500, Required)
- `MimeType`: string (MaxLength: 100, Required)
- `SizeBytes`: long (Required)
- `UploadedAt`: DateTime (Default: `DateTime.UtcNow`)

### 15. AuditLog (`audit_logs`)
Automatically records administrative edits.
- `Id`: Guid (Primary Key)
- `UserId`: Guid? (Nullable for anonymous/system operations)
- `Action`: string (MaxLength: 50, Required, e.g., `Create`, `Update`, `Delete`)
- `Resource`: string (MaxLength: 100, Required, e.g., `Country`, `PropertyCategory`)
- `ResourceId`: string (MaxLength: 100, Required)
- `OldValues`: string? (JSON format, stores modified properties before write)
- `NewValues`: string? (JSON format, stores modified properties after write)
- `Timestamp`: DateTime (Default: `DateTime.UtcNow`)
- `IpAddress`: string? (MaxLength: 45)
- `UserAgent`: string? (MaxLength: 500)

---

## Indexes & Constraints
1. **Foreign Key Indexes**: Every foreign key in `profiles`, `states`, `cities`, `areas`, and `property_types` must have an explicit index defined in EF Core to ensure query efficiency.
2. **Soft Delete Filter**: A global query filter (`IsDeleted == false`) must be applied in EF Core to `Country`, `State`, `City`, `Area`, `PropertyCategory`, and `Amenity`.
