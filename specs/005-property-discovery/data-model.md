# Data Model: Milestone 3 - Property Discovery

This document details the database schema and validation constraints for the entities introduced or modified in the Property Discovery milestone.

## New Entities

### 1. SavedSearch

Represents a saved search configuration that authenticated users can re-run.

* **Schema**:
  * `Id` (`Guid`): Primary key.
  * `UserId` (`Guid`): Foreign key to the User table.
  * `Name` (`string`, max length 100): The user-defined label for the search (e.g., "3 Bed Apartments in Miami").
  * `QueryParameters` (`string`, text): A JSON-serialized string representing the active search queries, filters, and sort options (e.g., `{"searchQuery":"Miami","categoryId":"...","minPrice":200000,"maxPrice":500000,"bedrooms":3,"sortBy":"price_asc"}`).
  * `CreatedDate` (`DateTime`): Timestamp when the search was saved.
* **Relationships**:
  * `User` (1-to-many): A user can have multiple saved searches.
* **Validation Rules**:
  * `Name` is required and must not exceed 100 characters.
  * `QueryParameters` is required and must be valid JSON content.
  * Unique constraint on `(UserId, Name)` to prevent duplicate names per user.

---

## Existing Entities (Refined & Integrated)

### 2. RecentlyViewed

Tracks user property interactions for historical display.

* **Schema**:
  * `Id` (`Guid`): Primary key.
  * `UserId` (`Guid`): Foreign key to the User table.
  * `PropertyId` (`Guid`): Foreign key to the Property table.
  * `ViewedAt` (`DateTime`): Timestamp when the user viewed the details page.
* **Relationships**:
  * `User` (1-to-many): User can have multiple historical views.
  * `Property` (1-to-many): History links to properties.
* **Validation Rules**:
  * `UserId` and `PropertyId` are required.
  * A background maintenance task caps database entries to 20 records per user (deleting the oldest when a new record is added).

### 3. PropertyFavorite

Links a user to a favorited property listing.

* **Schema**:
  * `Id` (`Guid`): Primary key.
  * `UserId` (`Guid`): Foreign key to the User table.
  * `PropertyId` (`Guid`): Foreign key to the Property table.
  * `CreatedAt` (`DateTime`): Timestamp when favorited.
* **Relationships**:
  * `User` (1-to-many): User can favorite many properties.
  * `Property` (1-to-many): Properties can be favorited by many users.
* **Validation / Database Constraints**:
  * Unique composite index on `(UserId, PropertyId)` to prevent duplicate favorites.
  * Cascade delete: when a property is deleted, all associated favorite records must be deleted automatically.

---

## Validation & Business Invariants

1. **Comparison Limits**:
   * The client must restrict comparing properties to a maximum of 4 IDs.
   * If the API receives more than 4 IDs in a compare request, it must return a validation error (HTTP 400 Bad Request).
2. **Public Listing Guard**:
   * Queries fetching listings, popular cities, newest listings, related properties, and details must filter out entries where `PublishStatus != PublishStatus.Published` unless the requester is an Admin or the Owner of the listing.
