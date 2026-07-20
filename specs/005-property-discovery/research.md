# Research and Decisions: Milestone 3 - Property Discovery

This document details the architectural decisions, rationales, and alternatives considered for implementing the property discovery, favorites, compare, and recently viewed history systems.

## 1. Advanced Property Filtering & Query Performance

* **Decision**: Extend `GetPropertyListQuery` to support price, area, bedroom, bathroom, amenities, location (city/area), year built, parking, and furnished status filters. Ensure that all filters are evaluated dynamically in a single query execution. All relationships (Media, Taxonomy, Locations, Owner) will be eager loaded via `.Include()` statements, and the query will execute with `.AsNoTracking()` to optimize read throughput.
* **Rationale**: Eliminates the risk of N+1 database queries when rendering property cards. Eager loading brings all required media and metadata in one roundtrip, while `.AsNoTracking()` prevents EF Core from caching entities in memory, improving execution times.
* **Alternatives Considered**: 
  * **Lazy Loading**: Rejected because accessing nested entities (such as media URLs) on each property card in a paginated list results in a new database query per item (N+1 queries), degrading system responsiveness.
  * **GraphQL/OData**: Rejected because standard REST endpoints are already established in the codebase, and MediatR handles REST queries cleanly.

## 2. Saved Searches Storage Format

* **Decision**: Store saved searches using a new `SavedSearch` table linked to the `User`. The query configuration will be stored as a serialized JSON string containing all active filter keys, values, and sorting parameters.
* **Rationale**: Offers high flexibility. If new filter parameters are added to the platform in the future, the database schema remains unchanged. Serialization/deserialization is fast and does not require complex relational mapping.
* **Alternatives Considered**: 
  * **Relational Schema (Column-per-filter)**: Rejected because adding new filters requires database migrations and table schema updates, leading to code rigidity.

## 3. Recently Viewed Property Cache Strategy

* **Decision**: Persist viewing history in the PostgreSQL database using a `RecentlyViewed` table for persistent tracking. In addition, store user history in a Redis Sorted Set (`user:recently-viewed:{userId}`) with ticks as scores, capped at a maximum of 20 items. For guest users, save history in client Local Storage (also capped at 20 items), and merge with the database upon successful authentication.
* **Rationale**: Keeps database queries low by checking the Redis cache first. Merging guest local history upon login ensures a seamless, continuous user experience. Capping the entries prevents unbounded growth of cache keys and database records.
* **Alternatives Considered**:
  * **Database-only tracking**: Rejected because pulling the recently viewed property list on every page visit would increase database query load.
  * **Redis-only tracking**: Rejected because viewing history would be lost when the cache expires or is evicted, resulting in poor user experience.

## 4. Unified Frontend UI Component Library

* **Decision**: Leverage functional React components using Tailwind CSS and standard icons (from Lucide React / React Icons). Implement a common design system under `frontend/src/components/Common` containing reusable components for modals, toasts, skeletons, spinners, and search/filter inputs.
* **Rationale**: Satisfies the strict UX requirements for visual consistency across pages, prevents code duplication, and reduces the layout bundle size.
* **Alternatives Considered**:
  * **Ad-hoc page styling**: Rejected because it results in inconsistent button variants, mismatched modal styles, and poor responsiveness.
