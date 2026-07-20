# FootballDB — Backend Implementation Roadmap
**Version:** 1.0 | **Status:** Official | **Date:** 2026-07-20
**Stack:** NestJS · TypeScript · Prisma · PostgreSQL 16 · Redis · BullMQ

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Module Dependency Graph](#2-module-dependency-graph)
3. [Milestones](#3-milestones)
4. [Phase 1: Project Bootstrap](#4-phase-1-project-bootstrap)
5. [Phase 2: Authentication & RBAC](#5-phase-2-authentication--rbac)
6. [Phase 3: Common Infrastructure](#6-phase-3-common-infrastructure)
7. [Phase 4: Core Domain Modules](#7-phase-4-core-domain-modules)
8. [Phase 5: Match Domain](#8-phase-5-match-domain)
9. [Phase 6: Career Domain](#9-phase-6-career-domain)
10. [Phase 7: Awards, Records & Media](#10-phase-7-awards-records--media)
11. [Phase 8: Search](#11-phase-8-search)
12. [Phase 9: Import Engine](#12-phase-9-import-engine)
13. [Phase 10: Admin System](#13-phase-10-admin-system)
14. [Phase 11: Public API Completion](#14-phase-11-public-api-completion)
15. [Phase 12: Production Readiness](#15-phase-12-production-readiness)
16. [Development Workflows](#16-development-workflows)
17. [Prioritized Implementation Checklist](#17-prioritized-implementation-checklist)

---

## 1. Executive Summary

This document defines the exact order in which the FootballDB backend must be implemented. It is designed to minimize inter-team dependencies, maximize incremental progress, and allow parallel development safely. Following this roadmap ensures the backend is built cleanly atop the established PostgreSQL schema and adheres strictly to the Backend Architecture Guide.

---

## 2. Module Dependency Graph

*Arrows indicate dependency direction (A → B means A depends on B being complete).*

```text
Project Bootstrap (Ph 1)
│
├── Common Infrastructure (Ph 3)
│   │
│   ├── Authentication & RBAC (Ph 2)
│   │   └── Admin System (Ph 10)
│   │
│   └── Core Domain (Ph 4: Persons, Teams, Organizations, Venues)
│       │
│       ├── Competitions (Ph 4: Comps, Seasons, Stages)
│       │   │
│       │   ├── Match Domain (Ph 5: Matches, Events, Rosters)
│       │   │   ├── Awards & Records (Ph 7)
│       │   │   └── Import Engine (Ph 9)
│       │   │
│       │   └── Career Domain (Ph 6: Associations, Lineage)
│       │
│       ├── Media Domain (Ph 7)
│       │
│       └── Search Engine (Ph 8)
│           └── Public API Completion (Ph 11)
│               └── Production Readiness (Ph 12)
```

---

## 3. Milestones

| Milestone | Focus | Deliverables |
|---|---|---|
| **M1: Foundation** | Phases 1–3 | Bootstrap, Auth, RBAC, Base Repositories, Pagination, Global Exception Handling |
| **M2: Core Domain** | Phase 4 | Full CRUD for Persons, Teams, Venues, Competitions, Seasons, Stages |
| **M3: Match & Career** | Phases 5–6 | Matches, Events, Lineups, Career Associations, Lineage views exposed |
| **M4: Import Engine** | Phase 9 | The core value proposition: ingestion pipeline, validation, conflict resolution |
| **M5: Admin & Rich Data** | Phases 7, 8, 10 | Media, Awards, Records, Search, and the Admin UI endpoints |
| **M6: Production** | Phases 11–12 | Caching, Rate limiting, Performance tuning, CI/CD, Documentation |

---

## 4. Phase 1: Project Bootstrap

**Purpose:** Establish the foundational codebase, tooling, and developer environments. *(Note: This phase is considered largely complete as of the initial scaffolding commit, but must be fully verified).*
**Deliverables:** NestJS initialization, Docker dev/prod environments, Prisma configuration, Swagger setup, Pino logging, CI lint/test pipelines.
**Dependencies:** None.
**Estimated Complexity:** Low.
**Risks:** Environment mismatch across developer machines.
**Testing:** Ensure `npm run build` and `npm run test` pass in CI.
**Definition of Done:** Project runs locally via `docker-compose.dev.yml` and Swagger UI is accessible at `/api/docs`.

### Required Implementation
- **Modules:** `AppModule`, `ConfigModule`, `DatabaseModule`, `RedisModule`, `HealthModule`
- **Controllers:** `AppController` (Health checks)

---

## 5. Phase 2: Authentication & RBAC

**Purpose:** Secure the API early so all subsequent endpoints can be properly guarded.
**Deliverables:** JWT authentication, Refresh Token rotation, User management, RBAC decorators.
**Dependencies:** Phase 1.
**Estimated Complexity:** Medium.
**Risks:** Token leakage, improper guard precedence.
**Testing:** Unit tests for JWT strategy; E2E tests for guarded routes; token expiration tests.
**Definition of Done:** `@Roles()` and `@Permissions()` decorators successfully block unauthorized access.

### Required Implementation
- **Modules:** `AuthModule`, `UsersModule`
- **Repositories:** `UsersRepository`
- **Services:** `AuthService`, `TokenService`, `UsersService`
- **Controllers:** `AuthController`, `UsersController`
- **Guards:** `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`

---

## 6. Phase 3: Common Infrastructure

**Purpose:** Build the reusable abstractions that all feature modules will rely upon.
**Deliverables:** `BaseRepository`, pagination utilities, dynamic filtering wrappers, standard DTOs.
**Dependencies:** Phase 1.
**Estimated Complexity:** High (Architectural impact is massive).
**Risks:** Leaky abstractions, over-engineering.
**Testing:** 100% unit test coverage on common utilities.
**Definition of Done:** A mock feature module can be created using only standard DTOs and `BaseRepository` methods.

### Required Implementation
- **DTOs:** `PaginationDto`, `FilterBaseDto`, `SortDto`
- **Classes:** `BaseRepository<T>`, `PaginatedResult<T>`
- **Interceptors:** `TransformInterceptor`, `CacheInterceptor`
- **Pipes:** `ValidationPipe` (configured), `ParseUuidPipe`

---

## 7. Phase 4: Core Domain Modules

**Purpose:** Expose the primary non-temporal entities (Persons, Teams) and the competition hierarchy.
**Deliverables:** API endpoints for `persons`, `teams`, `organizations`, `venues`, `competitions`, `seasons`, `editions`, `stages`.
**Dependencies:** Phase 2, Phase 3.
**Estimated Complexity:** Medium (Largely standard CRUD).
**Risks:** Incorrect mapping of the complex polymorphic alias structures.
**Testing:** Integration tests for repository layers using testcontainers.
**Definition of Done:** All core domain entities can be created, updated, and retrieved with pagination via API.

### Required Implementation
- **Modules:** `PersonsModule`, `TeamsModule`, `CompetitionsModule`, etc.
- **Repositories:** Standard Prisma wrappers extending `BaseRepository`
- **Services:** Read/Write split (e.g., `PersonsQueryService`, `PersonsCommandService`)
- **Controllers:** REST controllers mapping to standard API conventions

---

## 8. Phase 5: Match Domain

**Purpose:** Implement the highest volume and most complex data structures: matches and events.
**Deliverables:** Match creation, event timelines, roster assignments, official assignments, match summaries.
**Dependencies:** Phase 4.
**Estimated Complexity:** High.
**Risks:** N+1 query problems when fetching matches + events + rosters + persons.
**Testing:** E2E tests for adding events to a match; business validation rule tests (e.g., no overlapping minutes).
**Definition of Done:** A full match (teams, venue, score, 20+ events, 22+ appearances) can be accurately retrieved in a single optimized payload.

### Required Implementation
- **Modules:** `MatchesModule`, `MatchEventsModule`, `MatchAppearancesModule`
- **Repositories:** Heavy use of database views (`vw_match_summary`) for read operations.
- **Services:** `MatchCommandService` with strict validation rules.

---

## 9. Phase 6: Career Domain

**Purpose:** Map the historical associations between persons and teams over time.
**Deliverables:** Career histories, contract start/end dates, squad lists by date, club lineage traversal.
**Dependencies:** Phase 4.
**Estimated Complexity:** Medium.
**Risks:** Incorrect fuzzy date comparison logic in overlap validation.
**Testing:** Unit tests verifying `fn_check_career_overlap` edge cases.
**Definition of Done:** A player's entire 15-year career can be retrieved, sorted chronologically, accounting for fuzzy dates.

### Required Implementation
- **Modules:** `CareersModule`, `LineageModule`
- **Services:** `CareersCommandService` (validates overlaps)
- **DTOs:** `CareerSummaryDto`

---

## 10. Phase 7: Awards, Records & Media

**Purpose:** Add rich metadata, honors, and multimedia assets to core entities.
**Deliverables:** Award allocations, polymorphic record holders, S3-backed media upload pipeline.
**Dependencies:** Phase 4, Phase 5.
**Estimated Complexity:** Medium.
**Risks:** S3 credential management, large file handling memory leaks.
**Testing:** Mocked S3 uploads, image resizing worker tests.
**Definition of Done:** An image can be uploaded, automatically resized via BullMQ, and linked to a `Person`.

### Required Implementation
- **Modules:** `AwardsModule`, `RecordsModule`, `MediaModule`
- **Services:** `StorageService` (S3 provider), `MediaProcessorWorker` (BullMQ)
- **Controllers:** `MediaController` (multipart/form-data support)

---

## 11. Phase 8: Search

**Purpose:** Implement high-performance, fuzzy text search across millions of records.
**Deliverables:** `/search` global endpoint, `/search/autocomplete` for fast type-ahead.
**Dependencies:** Phase 4.
**Estimated Complexity:** Medium.
**Risks:** Slow trigram index usage if query optimization is flawed.
**Testing:** Integration tests against realistic seeded dataset (>100k rows).
**Definition of Done:** Global search responds in < 100ms with ranked results spanning multiple entity types.

### Required Implementation
- **Modules:** `SearchModule`
- **Providers:** `PostgresSearchProvider` (leveraging `fn_search_*` database functions)
- **Cache:** Redis-backed autocomplete caching

---

## 12. Phase 9: Import Engine

**Purpose:** The ingestion pipeline that fuels FootballDB.
**Deliverables:** S3 raw file staging, parsing framework, normalization rules, validation, deduplication, conflict resolution.
**Dependencies:** Phases 1–8.
**Estimated Complexity:** Extremely High.
**Risks:** Race conditions during parallel duplicate detection; worker memory exhaustion.
**Testing:** Extensive unit testing of parsers with real-world anomalous source files.
**Definition of Done:** A 10,000-row CSV can be uploaded and processed into production facts automatically, with conflicts appropriately flagged.

### Required Implementation
- **Modules:** `ImportModule`
- **Workers:** 6 distinct BullMQ workers (`parser`, `normalizer`, `validator`, `duplicate`, `conflict`, `merge`)
- **Controllers:** Import trigger endpoints.
- **Parsers:** Base interfaces and implementations for CSV, JSON, and RSSSF formats.

---

## 13. Phase 10: Admin System

**Purpose:** Provide the APIs required for human curators to manage conflicts and data quality.
**Deliverables:** Conflict resolution APIs, audit log viewers, Dead Letter Queue (DLQ) management.
**Dependencies:** Phase 2, Phase 9.
**Estimated Complexity:** Medium.
**Risks:** Accidentally exposing admin endpoints to Viewer roles.
**Testing:** Strict RBAC E2E tests for all endpoints.
**Definition of Done:** A curator can resolve a `Major Conflict` via API, updating the production entity and maintaining audit trail.

### Required Implementation
- **Controllers:** `ConflictController`, `AuditController`, `BatchController`
- **Services:** `ConflictResolutionService`, `AuditService`

---

## 14. Phase 11: Public API Completion

**Purpose:** Prepare the read-heavy endpoints for massive scale.
**Deliverables:** Redis caching layer optimization, materialized view refresh schedulers, rate limiting, OpenAPI (Swagger) finalization.
**Dependencies:** All previous phases.
**Estimated Complexity:** Medium.
**Risks:** Stale cache invalidation bugs.
**Testing:** Load testing (e.g., using Artillery or k6) targeting 1000+ Req/Sec.
**Definition of Done:** Swagger documentation is 100% complete and accurate; cache hit rates are >80% on read-heavy routes.

### Required Implementation
- **Interceptors:** `CacheInterceptor` fine-tuning.
- **Workers:** `RefreshMaterializedViewsWorker` (cron scheduled).
- **Decorators:** `@ApiTags`, `@ApiResponse`, etc., fully populated.

---

## 15. Phase 12: Production Readiness

**Purpose:** Hardening for deployment.
**Deliverables:** CI/CD pipelines, PM2/Docker configuration, Health probe optimization, Log aggregation setup.
**Dependencies:** Phase 11.
**Estimated Complexity:** Medium.
**Risks:** Secrets misconfiguration in production environments.
**Testing:** Disaster recovery testing (DB restore, container failover).
**Definition of Done:** System runs stably in a production-like staging environment with monitoring active.

---

## 16. Development Workflows

### Git Branching Strategy (GitFlow Lite)
- `main` — Production. Stable, tagged releases only.
- `staging` — Pre-production. Automatically deployed to staging environment.
- `develop` — Integration branch. Default target for all pull requests.
- `feat/{module}-{issue}` — Feature branches (e.g., `feat/persons-crud`).
- `fix/{issue}` — Bug fixes.
- `chore/{task}` — Non-functional updates.

### Commit Conventions (Conventional Commits)
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (Prettier/ESLint)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Performance improvement
- `test:` Adding missing tests
- `chore:` Maintenance tasks

### Pull Request Workflow
1. Branch from `develop`.
2. Ensure `npm run lint` and `npm run test` pass.
3. Open PR against `develop`.
4. Required: 1 Approval + Passing CI.
5. Merge strategy: `Squash and merge` to keep `develop` history clean.

### Release Strategy
1. Open Release PR: `develop` → `staging`.
2. QA / UAT testing in staging environment.
3. Create GitHub Release with Semantic Versioning tag (e.g., `v1.2.0`).
4. Merge `staging` → `main`.
5. Automated deployment to production cluster.

---

## 17. Prioritized Implementation Checklist

This checklist must be executed top-to-bottom. Do not skip phases or begin Phase 5 before Phase 4 is complete.

- [x] **M1: FOUNDATION**
  - [x] P1.1: Project Bootstrap (Scaffolding complete)
  - [x] P2.1: Implement `UsersModule` (CRUD for internal users)
  - [x] P2.2: Implement `AuthModule` (JWT generation/validation)
  - [x] P2.3: Implement Global Guards (`JwtAuthGuard`, `RolesGuard`)
  - [x] P3.1: Implement `BaseRepository` abstract class
  - [x] P3.2: Implement standard Pagination, Filtering, and Sorting DTOs/Utils

- [ ] **M2: CORE DOMAIN**
  - [x] P4.1: `GeopoliticalModule` & `OrganizationsModule`
  - [ ] P4.2: `VenuesModule`
  - [x] P4.3: `PersonsModule` (Read endpoints using `vw_player_profile`)
  - [ ] P4.4: `TeamsModule` (Read endpoints using `vw_club_profile`)
  - [ ] P4.5: `CompetitionsModule` & `SeasonsModule`
  - [ ] P4.6: `StagesModule`

- [ ] **M3: MATCH & CAREER**
  - [ ] P5.1: `MatchesModule` (CRUD & `vw_match_summary`)
  - [ ] P5.2: `MatchAppearancesModule` & `MatchEventsModule`
  - [ ] P6.1: `CareersModule` (Career associations with validation)
  - [ ] P6.2: `LineageModule` (Institutional lineage traversal)

- [ ] **M4: IMPORT ENGINE**
  - [ ] P9.1: Import Service scaffolding & S3 upload integration
  - [ ] P9.2: Implement BullMQ queues (`import.parse`, `import.validate`, etc.)
  - [ ] P9.3: Build Base Parser Interface & CSV implementation
  - [ ] P9.4: Build Normalizer & Validator Workers
  - [ ] P9.5: Build Duplicate & Conflict Detection Workers
  - [ ] P9.6: Build Merge Worker (Production writes & Fact Assertions)

- [ ] **M5: ADMIN & RICH DATA**
  - [ ] P10.1: `ConflictResolutionModule` (Admin APIs)
  - [ ] P10.2: `ProvenanceModule` & `AuditModule` (Review APIs)
  - [ ] P7.1: `MediaModule` (Image processing worker)
  - [ ] P7.2: `AwardsModule` & `RecordsModule`
  - [ ] P8.1: `SearchModule` (Trigram database search integration)

- [ ] **M6: PRODUCTION**
  - [ ] P11.1: Redis Cache Interceptor integration on all public reads
  - [ ] P11.2: Rate Limiting & Helmet review
  - [ ] P11.3: Swagger annotation audit
  - [ ] P12.1: Implement DB backup & log shipping strategy
  - [ ] P12.2: Final Load Testing & CI/CD pipeline lockdown
