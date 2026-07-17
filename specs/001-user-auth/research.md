# Research Notes: User Authentication & Profile Management

## Decision 1: Authentication Framework and Identity Management

- **Decision**: ASP.NET Core Identity with custom MediatR CQRS Command/Query layer for JWT generation and verification.
- **Rationale**: 
  - ASP.NET Core Identity provides built-in, secure implementations for password hashing (PBKDF2 with SHA-256), token generation, user lockouts, and multi-factor structure.
  - Wrapping authentication flows inside MediatR handlers keeps the logic decoupled from ASP.NET controllers, complying with the project's CQRS constraint.
- **Alternatives considered**:
  - *Custom Auth Logic (from scratch)*: Rejected due to security risks associated with building password hashing, salting, and session management manually.
  - *Third-party Auth Providers (e.g., Auth0, Firebase)*: Rejected to avoid external dependency overhead, cost, and vendor lock-in, and because the user requested JWT/OTP integration locally.

---

## Decision 2: Database Layer for Commands vs. Queries

- **Decision**: Entity Framework Core (EF Core) for CQRS Commands (writes) and Dapper for CQRS Queries (reads).
- **Rationale**: 
  - EF Core is ideal for commands because it tracks aggregate state changes, handles migrations, and ensures database constraints and business validations are met inside a Transaction Unit of Work.
  - Dapper is a micro-ORM that runs SQL queries directly, mapping them to DTOs with minimum overhead. This provides the best performance for reading listing histories, favorites, and comparisons without EF Core tracking overhead, satisfying performance goals.
- **Alternatives considered**:
  - *EF Core for both Reads and Writes*: Rejected because tracking entities in large queries for browsing history and search filters degrades performance.
  - *Dapper for both Reads and Writes*: Rejected due to the high developer complexity of writing raw SQL insert/update statements for complex entities and mapping relations manually.

---

## Decision 3: Recently Viewed and Favorite Caching Strategy

- **Decision**: In-memory Redis cache for Recently Viewed histories, backed by PostgreSQL persistence.
- **Rationale**: 
  - Recently viewed lists change frequently and require extremely fast writes and reads. Caching these lists in Redis (using sorted sets) reduces database load.
  - When the user views their history, the system fetches directly from Redis. If the cache is empty, it falls back to PostgreSQL.
- **Alternatives considered**:
  - *Direct PostgreSQL querying*: Rejected due to high write frequency to DB on every property click, which scales poorly.
  - *Local In-Memory Cache (MemoryCache)*: Rejected because the system cannot scale horizontally with multiple API instances.

---

## Decision 4: Google OAuth 2.0 Integration

- **Decision**: Direct client-side React authentication using Google Identity Services SDK, forwarding the id_token to the ASP.NET Core backend for verification.
- **Rationale**: 
  - The client obtains the token from Google and sends it to the `.NET` endpoint.
  - The backend validates the token using the `Google.Apis.Auth` library, checks if the user exists (or registers them), and issues a platform-native JWT. This minimizes backend state and redirects.
- **Alternatives considered**:
  - *Backend Server-to-Server OAuth redirect flow*: Rejected because it is more complex to manage in a decoupled SPA + API architecture.
