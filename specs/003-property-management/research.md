# Research & Architecture Decisions: Property Management

## Decision 1: Draft Autosave Persistence Strategy
- **Decision**: Backend Database-backed Drafts.
- **Rationale**: When a user begins step 1 of the wizard, a MediatR `CreatePropertyDraftCommand` is dispatched. It inserts a `Property` record in the database with `PublishStatus = PublishStatus.Draft` and nullable columns. Subsequent steps trigger an `UpdatePropertyDraftCommand` at regular intervals (autosave) or on clicking "Next".
- **Alternatives considered**: Local Storage (rejected because progress cannot be resumed on other devices).

## Decision 2: Media Asset Drag & Drop Ordering
- **Decision**: DisplayOrder field on `PropertyMedia`.
- **Rationale**: The database entity `PropertyMedia` will contain a `DisplayOrder` integer column. When the user rearranges images in the Media Manager, the frontend dispatches an `UpdatePropertyMediaOrderCommand` with a payload of `{ propertyId, orderedMediaIds: string[] }`, which maps new sequential integers to the media records.
- **Alternatives considered**: Positional indexing in JSON columns (rejected to maintain strong relational consistency).

## Decision 3: Document Visibility Security Constraints
- **Decision**: Endpoint-level Claims Validation.
- **Rationale**: `PropertyDocument` has a boolean `IsPublic` flag. Backend queries for downloading documents check: if `IsPublic` is false, verify that the logged-in user's ID matches the property's `OwnerId` or that the user has the `Admin` role. If not authorized, return `403 Forbidden`.
- **Alternatives considered**: Role-based access only (rejected because properties must have private owner-only papers).

## Decision 4: Audit Trails Log Architecture
- **Decision**: Relational Audit Trail Table `PropertyAuditLogs`.
- **Rationale**: To track moderations (Approve, Reject, Archive), we will create a `PropertyAuditLog` entity. Every MediatR command changing a property status will insert an audit record containing `PropertyId`, `UserId`, `OldStatus`, `NewStatus`, `ModeratorNotes`, and `Timestamp`.
- **Alternatives considered**: JSON-serialized change history logs (rejected because structured columns allow simpler query metrics).
