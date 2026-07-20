# FootballDB — Backend Architecture & Engineering Handbook
**Version:** 1.0 | **Status:** Official | **Date:** 2026-07-20
**Stack:** NestJS · TypeScript · PostgreSQL 16 · Prisma · Redis · BullMQ

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Dependency Rules](#4-dependency-rules)
5. [Module Design](#5-module-design)
6. [Repository Pattern](#6-repository-pattern)
7. [Service Layer](#7-service-layer)
8. [DTO Strategy](#8-dto-strategy)
9. [Validation Strategy](#9-validation-strategy)
10. [Authentication & RBAC](#10-authentication--rbac)
11. [Import Module Architecture](#11-import-module-architecture)
12. [Media Module Architecture](#12-media-module-architecture)
13. [Search Module Architecture](#13-search-module-architecture)
14. [Caching Strategy](#14-caching-strategy)
15. [API Design Standards](#15-api-design-standards)
16. [Error Handling](#16-error-handling)
17. [Logging Strategy](#17-logging-strategy)
18. [Background Jobs](#18-background-jobs)
19. [Configuration Management](#19-configuration-management)
20. [Security](#20-security)
21. [Testing Strategy](#21-testing-strategy)
22. [Performance](#22-performance)
23. [Deployment](#23-deployment)
24. [Coding Standards](#24-coding-standards)
25. [Development Workflow](#25-development-workflow)

---

## 1. Architecture Overview

FootballDB backend follows Clean Architecture principles with Domain-Driven Design (DDD) influences. The system is organized into clearly bounded feature modules. No layer communicates directly with the database except through the Repository abstraction.

### Architectural Layers (inner to outer)

```
┌─────────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER                                                   │
│  Entities · Domain Events · Business Rules · Interfaces         │
├─────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                              │
│  Services · Commands · Queries · DTOs · Use Cases               │
├─────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                                           │
│  Repositories · Prisma · Redis · BullMQ · S3 · Email            │
├─────────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                             │
│  Controllers · Guards · Interceptors · Filters · Pipes          │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

- **Feature-first modules.** Every feature is a self-contained NestJS module. No shared god-services.
- **Dependency inversion.** Services depend on repository interfaces, not Prisma directly.
- **CQRS-ready.** Read and write paths are separated at the service level. Queryservice/CommandService pairs are encouraged for complex features.
- **Event-driven where appropriate.** Domain events are emitted for cross-module side effects. Modules never call each other's services directly.
- **Immutable historical data.** The database enforces this. The backend must not expose any endpoint that enables raw UPDATE or DELETE on historical tables.

---

## 2. Technology Stack

| Concern | Technology | Version |
|---|---|---|
| Runtime | Node.js | LTS (22.x) |
| Framework | NestJS | 10.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 5.x |
| Cache | Redis | 7.x |
| Queue | BullMQ | 5.x |
| Object Storage | S3-compatible (MinIO / AWS S3) | — |
| Auth | JWT + Refresh Tokens | — |
| Validation | class-validator + class-transformer | — |
| API Docs | @nestjs/swagger (OpenAPI 3.1) | — |
| Logging | Pino | — |
| Testing | Jest + Supertest | — |
| Config | @nestjs/config + Joi schema | — |
| HTTP | Fastify adapter (preferred over Express) | — |
| Process manager | PM2 (production) | — |
| Containerisation | Docker + Docker Compose | — |

---

## 3. Project Folder Structure

Every folder is listed with its purpose. This structure is canonical and must not be reorganized without an Architecture Decision Record (ADR).

```
footballdb-backend/
│
├── src/
│   │
│   ├── main.ts                         # Bootstrap entry point
│   ├── app.module.ts                   # Root NestJS module
│   ├── app.controller.ts               # Root health/meta endpoints
│   │
│   ├── config/                         # Configuration layer
│   │   ├── app.config.ts               # App-level config factory
│   │   ├── database.config.ts          # Prisma / PostgreSQL config
│   │   ├── redis.config.ts             # Redis connection config
│   │   ├── bullmq.config.ts            # BullMQ config
│   │   ├── jwt.config.ts               # JWT secret + expiry config
│   │   ├── s3.config.ts                # S3 storage config
│   │   ├── config.validation.ts        # Joi validation schema for env vars
│   │   └── index.ts                    # Re-export all config factories
│   │
│   ├── common/                         # Cross-cutting shared utilities
│   │   │
│   │   ├── constants/
│   │   │   ├── roles.constants.ts      # Role enum values
│   │   │   ├── permissions.constants.ts
│   │   │   ├── cache-keys.constants.ts # All Redis key templates
│   │   │   ├── queue-names.constants.ts
│   │   │   └── error-codes.constants.ts
│   │   │
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts     # Mark route as public (skip JWT)
│   │   │   ├── roles.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── api-paginated.decorator.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts       # Base pagination query params
│   │   │   ├── filter-base.dto.ts      # Base filter fields
│   │   │   ├── sort.dto.ts             # Sortable fields base
│   │   │   └── id-param.dto.ts         # UUID param validation
│   │   │
│   │   ├── enums/
│   │   │   ├── sort-direction.enum.ts
│   │   │   └── response-status.enum.ts
│   │   │
│   │   ├── exceptions/
│   │   │   ├── app-exception.ts        # Base application exception
│   │   │   ├── not-found.exception.ts
│   │   │   ├── conflict.exception.ts
│   │   │   ├── forbidden.exception.ts
│   │   │   ├── validation.exception.ts
│   │   │   └── business-rule.exception.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── global-exception.filter.ts   # Maps all errors to RFC 7807
│   │   │   └── prisma-exception.filter.ts   # Converts Prisma errors
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── refresh-token.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── permissions.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts       # Request/response logging
│   │   │   ├── transform.interceptor.ts     # Wrap all responses in envelope
│   │   │   ├── cache.interceptor.ts         # Redis cache layer
│   │   │   ├── timeout.interceptor.ts       # Request timeout enforcement
│   │   │   └── correlation-id.interceptor.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── request-id.middleware.ts     # Assign UUID to every request
│   │   │   └── rate-limit.middleware.ts
│   │   │
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts           # Global class-validator pipe
│   │   │   ├── parse-uuid.pipe.ts
│   │   │   └── trim-strings.pipe.ts
│   │   │
│   │   └── utils/
│   │       ├── date.utils.ts
│   │       ├── string.utils.ts
│   │       ├── slug.utils.ts
│   │       ├── pagination.utils.ts
│   │       ├── uuid.utils.ts
│   │       └── confidence.utils.ts
│   │
│   ├── database/                        # Database infrastructure
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts            # PrismaClient singleton + lifecycle
│   │   ├── prisma.health.ts             # Terminus health indicator
│   │   └── base.repository.ts          # Abstract generic base repository
│   │
│   ├── redis/                           # Redis infrastructure
│   │   ├── redis.module.ts
│   │   ├── redis.service.ts             # ioredis client wrapper
│   │   └── redis.health.ts
│   │
│   ├── storage/                         # Object storage abstraction
│   │   ├── storage.module.ts
│   │   ├── storage.service.ts           # IStorageService interface implementation
│   │   ├── providers/
│   │   │   ├── s3.provider.ts
│   │   │   └── local.provider.ts        # For local development
│   │   └── dto/
│   │       ├── upload-file.dto.ts
│   │       └── file-metadata.dto.ts
│   │
│   ├── modules/                         # Feature modules
│   │   │
│   │   ├── auth/                        # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── token.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh-token.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   └── auth-response.dto.ts
│   │   │   └── interfaces/
│   │   │       └── jwt-payload.interface.ts
│   │   │
│   │   ├── users/                       # User management module
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── user-response.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts       # App user (NOT Person/footballer)
│   │   │
│   │   ├── persons/                     # Person (player/manager) module
│   │   │   ├── persons.module.ts
│   │   │   ├── persons.controller.ts
│   │   │   ├── persons.query-service.ts
│   │   │   ├── persons.command-service.ts
│   │   │   ├── persons.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-person.dto.ts
│   │   │   │   ├── update-person.dto.ts
│   │   │   │   ├── person-response.dto.ts
│   │   │   │   ├── person-filter.dto.ts
│   │   │   │   └── person-search.dto.ts
│   │   │   └── interfaces/
│   │   │       └── person-repository.interface.ts
│   │   │
│   │   ├── teams/
│   │   │   ├── teams.module.ts
│   │   │   ├── teams.controller.ts
│   │   │   ├── teams.query-service.ts
│   │   │   ├── teams.command-service.ts
│   │   │   ├── teams.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-team.dto.ts
│   │   │   │   ├── update-team.dto.ts
│   │   │   │   ├── team-response.dto.ts
│   │   │   │   └── team-filter.dto.ts
│   │   │   └── interfaces/
│   │   │       └── team-repository.interface.ts
│   │   │
│   │   ├── organizations/
│   │   │   ├── organizations.module.ts
│   │   │   ├── organizations.controller.ts
│   │   │   ├── organizations.service.ts
│   │   │   ├── organizations.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-organization.dto.ts
│   │   │       ├── update-organization.dto.ts
│   │   │       └── organization-response.dto.ts
│   │   │
│   │   ├── geopolitical/
│   │   │   ├── geopolitical.module.ts
│   │   │   ├── geopolitical.controller.ts
│   │   │   ├── geopolitical.service.ts
│   │   │   ├── geopolitical.repository.ts
│   │   │   └── dto/
│   │   │       └── geopolitical-response.dto.ts
│   │   │
│   │   ├── venues/
│   │   │   ├── venues.module.ts
│   │   │   ├── venues.controller.ts
│   │   │   ├── venues.service.ts
│   │   │   ├── venues.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-venue.dto.ts
│   │   │       ├── update-venue.dto.ts
│   │   │       └── venue-response.dto.ts
│   │   │
│   │   ├── competitions/
│   │   │   ├── competitions.module.ts
│   │   │   ├── competitions.controller.ts
│   │   │   ├── competitions.query-service.ts
│   │   │   ├── competitions.command-service.ts
│   │   │   ├── competitions.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-competition.dto.ts
│   │   │       ├── update-competition.dto.ts
│   │   │       └── competition-response.dto.ts
│   │   │
│   │   ├── seasons/
│   │   │   ├── seasons.module.ts
│   │   │   ├── seasons.controller.ts
│   │   │   ├── seasons.service.ts
│   │   │   ├── seasons.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-season.dto.ts
│   │   │       └── season-response.dto.ts
│   │   │
│   │   ├── editions/
│   │   │   ├── editions.module.ts
│   │   │   ├── editions.controller.ts
│   │   │   ├── editions.service.ts
│   │   │   ├── editions.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-edition.dto.ts
│   │   │       └── edition-response.dto.ts
│   │   │
│   │   ├── stages/
│   │   │   ├── stages.module.ts
│   │   │   ├── stages.controller.ts
│   │   │   ├── stages.service.ts
│   │   │   ├── stages.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-stage.dto.ts
│   │   │       └── stage-response.dto.ts
│   │   │
│   │   ├── matches/
│   │   │   ├── matches.module.ts
│   │   │   ├── matches.controller.ts
│   │   │   ├── matches.query-service.ts
│   │   │   ├── matches.command-service.ts
│   │   │   ├── matches.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-match.dto.ts
│   │   │   │   ├── match-response.dto.ts
│   │   │   │   ├── match-filter.dto.ts
│   │   │   │   └── match-summary.dto.ts   # Maps vw_match_summary
│   │   │   └── interfaces/
│   │   │       └── match-repository.interface.ts
│   │   │
│   │   ├── match-events/
│   │   │   ├── match-events.module.ts
│   │   │   ├── match-events.controller.ts
│   │   │   ├── match-events.service.ts
│   │   │   ├── match-events.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-match-event.dto.ts
│   │   │       └── match-event-response.dto.ts
│   │   │
│   │   ├── match-appearances/
│   │   │   ├── match-appearances.module.ts
│   │   │   ├── match-appearances.controller.ts
│   │   │   ├── match-appearances.service.ts
│   │   │   ├── match-appearances.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-match-appearance.dto.ts
│   │   │       └── match-appearance-response.dto.ts
│   │   │
│   │   ├── careers/
│   │   │   ├── careers.module.ts
│   │   │   ├── careers.controller.ts
│   │   │   ├── careers.query-service.ts
│   │   │   ├── careers.command-service.ts
│   │   │   ├── careers.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-career.dto.ts
│   │   │       ├── career-response.dto.ts
│   │   │       └── career-summary.dto.ts   # Maps vw_career_summary
│   │   │
│   │   ├── awards/
│   │   │   ├── awards.module.ts
│   │   │   ├── awards.controller.ts
│   │   │   ├── awards.service.ts
│   │   │   ├── awards.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-award.dto.ts
│   │   │       ├── create-award-recipient.dto.ts
│   │   │       └── award-history-response.dto.ts
│   │   │
│   │   ├── records/
│   │   │   ├── records.module.ts
│   │   │   ├── records.controller.ts
│   │   │   ├── records.service.ts
│   │   │   ├── records.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-record.dto.ts
│   │   │       ├── create-record-holder.dto.ts
│   │   │       └── record-history-response.dto.ts
│   │   │
│   │   ├── media/                       # Media upload and management
│   │   │   ├── media.module.ts
│   │   │   ├── media.controller.ts
│   │   │   ├── media.service.ts
│   │   │   ├── media.repository.ts
│   │   │   ├── media.processor.ts       # BullMQ worker for image processing
│   │   │   ├── dto/
│   │   │   │   ├── upload-media.dto.ts
│   │   │   │   ├── media-response.dto.ts
│   │   │   │   └── media-filter.dto.ts
│   │   │   └── interfaces/
│   │   │       └── storage.interface.ts
│   │   │
│   │   ├── import/                      # Data import module
│   │   │   ├── import.module.ts
│   │   │   ├── import.controller.ts
│   │   │   ├── batch.service.ts
│   │   │   ├── staged-record.service.ts
│   │   │   ├── conflict.service.ts
│   │   │   ├── batch.repository.ts
│   │   │   ├── staged-record.repository.ts
│   │   │   ├── conflict.repository.ts
│   │   │   │
│   │   │   ├── parsers/
│   │   │   │   ├── parser.registry.ts
│   │   │   │   ├── base.parser.ts
│   │   │   │   ├── csv.parser.ts
│   │   │   │   ├── xlsx.parser.ts
│   │   │   │   ├── json.parser.ts
│   │   │   │   ├── xml.parser.ts
│   │   │   │   ├── rsssf.parser.ts
│   │   │   │   └── pdf.parser.ts
│   │   │   │
│   │   │   ├── normalizers/
│   │   │   │   ├── name.normalizer.ts
│   │   │   │   ├── date.normalizer.ts
│   │   │   │   └── entity.resolver.ts
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   ├── schema.validator.ts
│   │   │   │   ├── domain.validator.ts
│   │   │   │   ├── referential.validator.ts
│   │   │   │   └── business-rule.validator.ts
│   │   │   │
│   │   │   ├── pipeline/
│   │   │   │   ├── pipeline.orchestrator.ts
│   │   │   │   ├── duplicate.detector.ts
│   │   │   │   ├── conflict.detector.ts
│   │   │   │   ├── merge.service.ts
│   │   │   │   └── assertion.writer.ts
│   │   │   │
│   │   │   ├── workers/
│   │   │   │   ├── parse.worker.ts
│   │   │   │   ├── normalize.worker.ts
│   │   │   │   ├── validate.worker.ts
│   │   │   │   ├── duplicate.worker.ts
│   │   │   │   ├── conflict.worker.ts
│   │   │   │   └── merge.worker.ts
│   │   │   │
│   │   │   ├── schedulers/
│   │   │   │   └── import.scheduler.ts
│   │   │   │
│   │   │   └── dto/
│   │   │       ├── create-batch.dto.ts
│   │   │       ├── batch-response.dto.ts
│   │   │       ├── staged-record-response.dto.ts
│   │   │       └── conflict-response.dto.ts
│   │   │
│   │   ├── search/                      # Search module
│   │   │   ├── search.module.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   ├── providers/
│   │   │   │   ├── postgres-search.provider.ts
│   │   │   │   └── elasticsearch.provider.ts  # Future
│   │   │   └── dto/
│   │   │       ├── search-query.dto.ts
│   │   │       └── search-result.dto.ts
│   │   │
│   │   ├── standings/
│   │   │   ├── standings.module.ts
│   │   │   ├── standings.controller.ts
│   │   │   ├── standings.service.ts
│   │   │   └── dto/
│   │   │       └── standing-response.dto.ts   # Maps mv_league_table
│   │   │
│   │   ├── provenance/
│   │   │   ├── provenance.module.ts
│   │   │   ├── provenance.controller.ts
│   │   │   ├── provenance.service.ts
│   │   │   ├── provenance.repository.ts
│   │   │   └── dto/
│   │   │       ├── source-document.dto.ts
│   │   │       └── fact-assertion.dto.ts
│   │   │
│   │   ├── lineage/
│   │   │   ├── lineage.module.ts
│   │   │   ├── lineage.controller.ts
│   │   │   ├── lineage.service.ts
│   │   │   └── dto/
│   │   │       └── lineage-response.dto.ts    # Maps vw_club_lineage
│   │   │
│   │   └── health/
│   │       ├── health.module.ts
│   │       ├── health.controller.ts
│   │       └── indicators/
│   │           ├── database.indicator.ts
│   │           ├── redis.indicator.ts
│   │           └── storage.indicator.ts
│   │
│   ├── events/                          # Domain events (cross-module)
│   │   ├── events.module.ts
│   │   ├── person-created.event.ts
│   │   ├── match-imported.event.ts
│   │   ├── import-batch-completed.event.ts
│   │   └── conflict-resolved.event.ts
│   │
│   └── queues/                          # BullMQ queue definitions
│       ├── import.queue.ts
│       ├── media.queue.ts
│       └── refresh.queue.ts
│
├── prisma/
│   ├── schema.prisma                    # Generated by database team
│   ├── migrations/                      # Prisma migration history
│   │   └── (auto-generated)
│   └── seed/
│       ├── seed.ts                      # Main seed entry point
│       ├── fixtures/
│       │   ├── geopolitical.ts
│       │   ├── organizations.ts
│       │   └── reference-data.ts
│       └── test-fixtures/
│           └── (test data generators)
│
├── test/
│   ├── unit/                            # Pure unit tests (no DB)
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   ├── integration/                     # Tests against real DB (test container)
│   │   ├── modules/
│   │   └── repositories/
│   ├── e2e/                             # API end-to-end tests
│   │   └── *.e2e-spec.ts
│   ├── helpers/
│   │   ├── test-app.helper.ts
│   │   ├── db.helper.ts
│   │   └── mock-factory.ts
│   └── jest.config.ts
│
├── scripts/
│   ├── migrate.sh                       # Run prisma migrate deploy
│   ├── seed.sh
│   ├── generate-client.sh               # prisma generate
│   └── refresh-views.sh                 # Call pr_refresh_all_materialized_views
│
├── docs/
│   ├── adr/                             # Architecture Decision Records
│   │   ├── 001-use-prisma.md
│   │   ├── 002-use-bullmq.md
│   │   └── 003-feature-first-modules.md
│   └── api/                             # Auto-generated OpenAPI specs
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── .env.example
├── .env.test
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.ts
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## 4. Dependency Rules

These rules are absolute. Violations are blocked by code review.

### Allowed Dependencies

```
Controller     → Service (Query or Command)
Service        → Repository Interface
Service        → Other Service (same module only, via module injection)
Service        → Domain Events (emit only)
Repository     → PrismaService
Repository     → Repository Interface (implements)
Guard          → Auth Service
Interceptor    → Redis Service
Worker         → Service (injected)
```

### Forbidden Dependencies

```
Controller     → Repository (never directly)
Controller     → PrismaService (never)
Service        → PrismaService (never — always through repository)
Module A       → Module B's Service (use events or shared interfaces)
Repository     → Service (never)
Repository     → Another Repository (no cross-repo calls)
```

### Module Communication Rules

Modules communicate exclusively through:
1. **Injected DTOs via NestJS module imports** — only for shared contracts (common DTOs)
2. **Domain Events** — for cross-module side effects (e.g., PersonCreated triggers search index update)
3. **REST API calls** — never internal; modules never call each other over HTTP internally

If Module A needs data from Module B, the correct pattern is:
- Module B exports a `QueryService`
- Module A imports Module B and injects `QueryService`
- Module A calls only query methods (never command methods of another module)

---

## 5. Module Design

### Standard Module Structure

Every feature module follows this structure:

```
module-name/
├── module-name.module.ts          # DI wiring
├── module-name.controller.ts      # HTTP layer only
├── module-name.query-service.ts   # Read-side business logic
├── module-name.command-service.ts # Write-side business logic
├── module-name.repository.ts      # Data access implementation
├── dto/
│   ├── create-module-name.dto.ts
│   ├── update-module-name.dto.ts
│   ├── module-name-response.dto.ts
│   ├── module-name-filter.dto.ts
│   └── module-name-search.dto.ts
└── interfaces/
    └── module-name-repository.interface.ts
```

### Module: Persons

**Responsibilities:** CRUD for Person entities. Expose player/manager profile data. Aggregate stats from views.

**Public API:**
- `GET /v1/persons` — paginated, filterable list
- `GET /v1/persons/:id` — full profile (joins vw_player_profile)
- `GET /v1/persons/:id/career` — career history (vw_career_summary)
- `GET /v1/persons/:id/stats` — aggregated stats (mv_player_stats)
- `GET /v1/persons/:id/awards` — award history
- `GET /v1/persons/search?q=` — fuzzy search
- `POST /v1/persons` — create (Editor+)
- `PATCH /v1/persons/:id` — update (Editor+)
- `DELETE /v1/persons/:id` — soft delete (Admin only)

**Business Rules:**
- Birth year must be between 1800 and current year
- A person cannot be created if a duplicate (same name + birth year) exists (call fn_detect_duplicate_person)
- Soft delete only — checks for active career associations first

### Module: Teams

**Responsibilities:** Club and national team data. Squad management. Honors. Lineage.

**Public API:**
- `GET /v1/teams` — paginated, filterable
- `GET /v1/teams/:id` — club profile (vw_club_profile)
- `GET /v1/teams/:id/squad` — current squad (active career associations)
- `GET /v1/teams/:id/lineage` — historical lineage (vw_club_lineage)
- `GET /v1/teams/:id/awards` — honors
- `GET /v1/teams/search?q=`
- `POST /v1/teams` — create (Editor+)
- `PATCH /v1/teams/:id` — update (Editor+)

### Module: Matches

**Responsibilities:** Match data. Events. Appearances. Officials.

**Public API:**
- `GET /v1/matches` — filterable by team, competition, season, date range
- `GET /v1/matches/:id` — full match detail (vw_match_summary + events)
- `GET /v1/matches/:id/events` — timeline of match events
- `GET /v1/matches/:id/appearances` — lineups
- `GET /v1/matches/:id/officials` — referee assignments
- `POST /v1/matches` — create (Editor+)
- `POST /v1/matches/:id/events` — add event (Editor+)
- `POST /v1/matches/:id/appearances` — add player appearance (Editor+)

**Business Rules:**
- Match teams must be distinct
- Match events cannot be added if match status is Abandoned (unless correcting)
- Duplicate match detection runs before creation (`fn_detect_duplicate_match`)

### Module: Import

Covered in detail in Section 11.

### Module: Search

Covered in detail in Section 13.

### Module: Health

**Responsibilities:** System health check for load balancers and monitoring.

**Public API:**
- `GET /health` — aggregated health status (DB, Redis, Storage)
- `GET /health/db` — database connectivity
- `GET /health/redis` — Redis connectivity
- `GET /health/storage` — S3 storage connectivity

---

## 6. Repository Pattern

### IBaseRepository Interface

Every repository implements a typed interface:

```typescript
interface IBaseRepository<T, CreateDto, UpdateDto, FilterDto> {
  findById(id: string): Promise<T | null>;
  findAll(filter: FilterDto, pagination: PaginationDto): Promise<PaginatedResult<T>>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
}
```

### BaseRepository Abstract Class

An abstract `BaseRepository<T>` class provides default implementations of `findById`, `existsById`, and soft delete. Feature repositories extend this and override as needed.

### Repository Implementation Rules

- Repositories accept and return **domain objects**, never raw Prisma types directly
- All Prisma queries live **inside repository methods only**
- Repositories expose **named, intention-revealing methods** (`findActiveCareersByPersonId`, not `find({ where: ... })`)
- No raw SQL in repositories unless calling a PostgreSQL function (via `prisma.$queryRaw`)
- PostgreSQL views (prefixed `vw_`) are accessed exclusively through dedicated repository methods that call `prisma.$queryRawUnsafe` with parameterized inputs

### Transaction Management

Transactions are managed at the service layer, not the repository layer:

```
CommandService creates a Prisma transaction object
CommandService passes the transaction client to multiple repository calls
Repositories accept an optional `tx` parameter (PrismaClient | Prisma.TransactionClient)
```

The signature pattern for transactional repository methods:

```typescript
async create(data: CreateDto, tx?: PrismaTransactionClient): Promise<T>
```

### Pagination

All list queries use a standard `PaginationDto`:

```typescript
class PaginationDto {
  page: number   // default: 1
  limit: number  // default: 20, max: 100
}
```

Repositories return `PaginatedResult<T>`:

```typescript
interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Filtering

Each repository defines a typed `FilterDto`. Filters are applied via Prisma `where` clause composition. Filters support:
- Exact match (`teamId: UUID`)
- Range (`startYear: number, endYear: number`)
- Enum match (`role: CareerRole`)
- Soft-delete exclusion (always applied by default, override with `includeSoftDeleted: boolean`)

---

## 7. Service Layer

### Responsibilities by Layer

| Layer | Responsibilities | Must NOT |
|---|---|---|
| Controller | Parse request, call service, return response | Contain business logic, call repositories |
| QueryService | Read operations, view queries, aggregations | Mutate data, start transactions |
| CommandService | Write operations, business rules, validation, transactions | Serve read-only queries |
| Repository | Data access, query construction | Contain business logic |

### CommandService Pattern

```
1. Validate inputs (call domain validators)
2. Check business rules (call fn_* database functions if needed)
3. Open transaction if multiple repositories involved
4. Call repositories to persist data
5. Emit domain events
6. Return response DTO
```

### QueryService Pattern

```
1. Validate filter inputs
2. Check Redis cache (if applicable)
3. Call repository to fetch data
4. Map to response DTO
5. Store in Redis cache (if applicable)
6. Return response DTO
```

### Prohibited Patterns

- **Never place Prisma calls in controllers**
- **Never place business logic in repositories**
- **Never catch-and-swallow exceptions in services** — let them propagate to the global filter
- **Never use `any` type** in service signatures

---

## 8. DTO Strategy

### DTO Types and Their Purposes

| DTO Type | Suffix | Direction | Purpose |
|---|---|---|---|
| Create DTO | `CreateXxxDto` | Inbound | Validates creation request body |
| Update DTO | `UpdateXxxDto` | Inbound | Validates partial update (extends PartialType of Create) |
| Response DTO | `XxxResponseDto` | Outbound | Controls which fields are exposed in API responses |
| Filter DTO | `XxxFilterDto` | Inbound (query) | Validates GET query parameters |
| Search DTO | `XxxSearchDto` | Inbound (query) | Validates search parameters |
| Pagination DTO | `PaginationDto` | Inbound (query) | Shared page/limit parameters |
| Import DTO | `XxxImportDto` | Internal | Used by import pipeline only |
| Summary DTO | `XxxSummaryDto` | Outbound | Maps database view results |

### Rules

- Response DTOs use `@Exclude()` by default; fields are explicitly included with `@Expose()`
- Update DTOs always use `PartialType(CreateXxxDto)` from `@nestjs/mapped-types` — no duplicated validation rules
- Sensitive fields (`deleted_at`, `created_by`) are never exposed in public response DTOs
- Internal IDs are always exposed as UUID strings, never as sequential integers

### Shared Envelope

All API responses are wrapped in a standard envelope by the global `TransformInterceptor`:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "requestId": "uuid", "timestamp": "ISO8601" }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 1000, "page": 2, "limit": 20, "totalPages": 50 },
  "meta": { "requestId": "uuid", "timestamp": "ISO8601" }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PERSON_NOT_FOUND",
    "message": "Person with id abc123 not found",
    "details": []
  },
  "meta": { "requestId": "uuid", "timestamp": "ISO8601" }
}
```

---

## 9. Validation Strategy

### Layer 1: DTO Validation (class-validator)

Applied globally via `ValidationPipe`. Validates request shape before the controller method executes. `whitelist: true` strips unknown properties. `forbidNonWhitelisted: true` rejects requests with extra properties.

### Layer 2: Business Validation (Service layer)

Business rules that require database lookups. Examples:
- Person duplicate check before creation
- Career overlap check before creating a career association
- Season consistency check before creating an edition

Business validation failures throw `BusinessRuleException`, which is caught by the global filter and returned as HTTP 422 Unprocessable Entity.

### Layer 3: Database Validation (CHECK constraints)

PostgreSQL CHECK constraints serve as the last line of defense. If a constraint violation reaches the application, the Prisma exception filter maps it to HTTP 409 Conflict with a meaningful message.

### Layer 4: Import Validation

Described in Section 11. Import validation runs in a separate pipeline and does not use the HTTP request lifecycle.

---

## 10. Authentication & RBAC

### JWT Strategy

- **Access Token:** 15-minute expiry. Signed with RS256 (asymmetric). Contains: `sub` (user ID), `roles`, `permissions`.
- **Refresh Token:** 30-day expiry. Stored as a hashed value in the database (not in Redis — must survive restarts). Single-use rotation: each refresh issues a new refresh token and invalidates the old one.
- **Token Rotation:** Detected reuse of a revoked refresh token invalidates ALL tokens for that user (breach response).

### Role Hierarchy

```
Admin
  └── Editor
        └── Reviewer
              └── Importer
                    └── Viewer
                          └── Public (no auth)
```

Roles are additive. A higher role inherits all permissions of lower roles.

### Permissions Matrix

| Permission | Admin | Editor | Reviewer | Importer | Viewer | Public |
|---|---|---|---|---|---|---|
| Read all entities | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/Update entities | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Soft delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hard delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Resolve conflicts | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Trigger imports | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Rollback batches | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Guard Stack (applied in order)

1. `JwtAuthGuard` — validates access token signature and expiry
2. `RolesGuard` — validates role membership from JWT payload
3. `PermissionsGuard` — validates fine-grained permission flags

Routes decorated with `@Public()` bypass the JWT guard entirely.

---

## 11. Import Module Architecture

The import module runs entirely outside the HTTP request lifecycle. All heavy processing is handled by BullMQ workers.

### Request Flow

```
HTTP POST /v1/import/upload
  → Upload raw file to S3
  → Create SourceDocument record
  → Create ImportBatch record (status=Pending)
  → Enqueue job on import.ingestion queue
  → Return 202 Accepted with batch_id
```

### Queue Chain

```
import.ingestion  → parser-worker     (parse file, write StagedRecords)
import.parse      → normalize-worker  (entity resolution, date normalization)
import.normalize  → validate-worker   (schema + domain + referential + business)
import.validate   → duplicate-worker  (intra + cross batch detection)
import.duplicate  → conflict-worker   (conflict detection, task creation)
import.conflict   → merge-worker      (write to production, create FactAssertions)
import.merge      → refresh-worker    (REFRESH MATERIALIZED VIEW CONCURRENTLY)
```

### Worker Design

Each worker:
- Reads one job from its queue
- Updates batch checkpoint on each record
- On success: enqueues next-stage job
- On transient failure: relies on BullMQ retry with exponential backoff (3 attempts)
- On exhausted retries: moves job to `import.dlq`
- Emits structured log at every step

### Import API

Described fully in Section 21 of the import architecture document (`10-import-architecture.md`).

### Conflict Resolution Service

The `ConflictService` exposes:
- `findOpenConflicts(filter, pagination)` — for admin dashboard
- `acceptIncoming(conflictId, curatorId, comment)` — promote incoming assertion
- `rejectIncoming(conflictId, curatorId, comment)` — discard incoming
- `escalate(conflictId, curatorId)` — move to senior review

All conflict resolution actions are transactional and write to `audit_log`.

---

## 12. Media Module Architecture

### Upload Flow

```
Client POST /v1/media/upload (multipart/form-data)
  → MediaController validates file (type, size)
  → File uploaded to S3 at temp path
  → MediaAsset record created (status metadata stored)
  → Job enqueued on media.process queue
  → Return 202 with media_asset_id

media-processor (BullMQ worker):
  → Generate thumbnail (Thumbnail variant)
  → Generate medium size (Medium variant)
  → Store retina if source is ≥ 2x display density
  → Extract EXIF metadata (date taken, GPS if available)
  → Update MediaAsset record with all paths and metadata
  → Move file from temp to permanent S3 path
```

### Storage Abstraction

`IStorageService` interface is implemented by:
- `S3StorageProvider` — for production
- `LocalStorageProvider` — for local development

The application never references AWS SDK directly; it always calls `StorageService`.

### Image Processing

- Sharp library for server-side image processing
- Thumbnail: max 150×150 px
- Medium: max 800×800 px
- Original: stored as-is after validation
- Retina: 2× of Medium (1600×1600 px)
- All variants stored at separate S3 paths, all recorded on the `MediaAsset` row

### Validation

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `application/pdf`, `video/mp4`
- Max file size: 100 MB (configurable per media type)
- Magic byte validation (extension spoofing prevention)
- Virus scanning hook (pluggable — ClamAV recommended)

---

## 13. Search Module Architecture

### Phase 1: PostgreSQL Full Text Search

`SearchService` delegates to `PostgresSearchProvider` which calls the database functions:
- `fn_search_persons(query, limit)`
- `fn_search_teams(query, limit)`
- `fn_search_competitions(query, limit)`
- `fn_search_venues(query, limit)`
- `fn_search_organizations(query, limit)`

**Global search:** `GET /v1/search?q=&type=persons|teams|competitions|all&limit=20`

Results are returned as a unified `SearchResultDto` with `type` discriminator.

### Autocomplete

Autocomplete uses the same search functions with `limit=10` and returns only `id + primary_name`. Results are cached in Redis with key `search:autocomplete:{type}:{unaccent(q)}` and TTL 60 seconds.

### Phase 2: Elasticsearch Integration

`SearchService` is designed to swap providers without changing the controller or any external interface. When Elasticsearch is ready:
1. Implement `ElasticsearchSearchProvider` (same `ISearchProvider` interface)
2. Update `SearchModule` configuration to inject the new provider
3. No controller or service changes required

---

## 14. Caching Strategy

### Cache Layer

Redis 7.x via `ioredis`. Cache is managed by `CacheInterceptor` for read endpoints and manually invalidated in `CommandService` after writes.

### Cache Key Conventions

All keys follow the pattern: `{module}:{operation}:{identifier}`

```
person:profile:{id}          TTL: 5 minutes
person:stats:{id}            TTL: 10 minutes
team:profile:{id}            TTL: 5 minutes
team:squad:{id}              TTL: 2 minutes
competition:summary:{id}     TTL: 10 minutes
match:summary:{id}           TTL: 60 minutes  (historical data = immutable)
standings:{stage_id}         TTL: 30 seconds  (live data)
search:autocomplete:{type}:{q}  TTL: 60 seconds
```

All cache key templates are defined in `cache-keys.constants.ts`. Never hardcode cache key strings in services.

### Cache Invalidation

On write operations (CommandService):
- Invalidate the specific resource key: `redis.del(cacheKey(person:profile, id))`
- Invalidate related list keys using pattern: `redis.del(pattern('person:list:*'))`
- For materialized view-backed data: invalidation is triggered by `pr_refresh_all_materialized_views` completion event

### Non-Cacheable Endpoints

The following are never cached:
- Any endpoint requiring real-time accuracy (standings during live match)
- Import pipeline endpoints
- Conflict resolution endpoints
- Audit log endpoints
- Any authenticated write operation

---

## 15. API Design Standards

### URL Conventions

```
/v1/{resource}                         Collection
/v1/{resource}/:id                     Single resource
/v1/{resource}/:id/{sub-resource}      Sub-resource
/v1/{resource}/search                  Search (GET with ?q=)
/v1/{resource}/:id/{action}            Custom action (POST verb)
```

### HTTP Methods

| Operation | Method | Status |
|---|---|---|
| List | GET | 200 |
| Get one | GET | 200 |
| Create | POST | 201 |
| Update | PATCH | 200 |
| Replace | PUT | 200 |
| Delete (soft) | DELETE | 204 |
| Custom action | POST | 200 |
| Async trigger | POST | 202 |

### Pagination Query Parameters

```
?page=1&limit=20&sortBy=primary_name&sortDir=asc
```

### Filter Query Parameters

```
?teamId=uuid&role=Player&startYear=2010&endYear=2020&isCurrent=true
```

### Error Response Format

All errors follow RFC 7807 (Problem Details for HTTP APIs):

```json
{
  "type": "https://footballdb.io/errors/PERSON_NOT_FOUND",
  "title": "Person Not Found",
  "status": 404,
  "detail": "Person with id abc123 was not found.",
  "instance": "/v1/persons/abc123",
  "requestId": "uuid"
}
```

### HTTP Status Code Usage

| Code | Usage |
|---|---|
| 200 | Successful GET / PATCH |
| 201 | Successful POST (created) |
| 202 | Accepted (async job triggered) |
| 204 | Successful DELETE (no body) |
| 400 | Validation error (bad request shape) |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but unauthorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, constraint violation) |
| 422 | Business rule violation |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

### API Versioning

URI versioning: `/v1/`. Version is declared in `main.ts` as a global prefix. When a breaking change is needed, `/v2/` is introduced. V1 endpoints remain operational for 12 months after V2 release.

### Rate Limiting

Applied globally via `@nestjs/throttler`:
- Public endpoints: 100 requests/minute per IP
- Authenticated endpoints: 500 requests/minute per user
- Import upload: 10 requests/minute per user
- Search/autocomplete: 200 requests/minute per IP

---

## 16. Error Handling

### Global Exception Filter

`GlobalExceptionFilter` intercepts all unhandled exceptions and maps them to the RFC 7807 format. Registered globally in `main.ts`.

### Exception Hierarchy

```
AppException (base)
├── NotFoundException (404)
├── ConflictException (409)
├── ForbiddenException (403)
├── ValidationException (400)
├── BusinessRuleException (422)
└── UnauthorizedException (401)
```

### Prisma Error Mapping

`PrismaExceptionFilter` translates Prisma error codes:
- `P2002` (unique constraint violation) → ConflictException
- `P2025` (record not found on update) → NotFoundException
- `P2003` (foreign key constraint) → ConflictException with FK context
- `P2000` (value too long) → ValidationException

### Service Error Rules

- Services always throw typed exceptions, never return `null` to signal errors
- `null` is a valid return value only for `findById` (record not found = `null`, caller decides)
- All repository errors bubble up; never caught silently

---

## 17. Logging Strategy

### Logger

Pino via `nestjs-pino`. All logs are structured JSON. Human-readable format in development via `pino-pretty`.

### Correlation IDs

Every HTTP request receives a `X-Request-ID` header (generated if not present). The request ID is propagated through the `AsyncLocalStorage` context and included in every log line emitted during that request's lifecycle.

### Log Levels

| Level | Usage |
|---|---|
| `trace` | Internal repository query details (dev only) |
| `debug` | Service-level operation details |
| `info` | Normal operations (request received, job completed) |
| `warn` | Recoverable issues (cache miss, retry attempt) |
| `error` | Unexpected errors, exceptions |
| `fatal` | Application crash or unrecoverable state |

### Standard Log Fields

Every log entry contains:

```json
{
  "timestamp": "2026-07-20T12:00:00.000Z",
  "level": "info",
  "service": "footballdb-backend",
  "version": "1.0.0",
  "requestId": "uuid",
  "userId": "uuid|anonymous",
  "module": "persons",
  "operation": "findById",
  "durationMs": 12,
  "message": "Person retrieved successfully"
}
```

### Import Pipeline Logging

Import jobs emit structured logs with additional fields:
```json
{
  "batchId": "uuid",
  "stagedRecordId": "uuid",
  "stage": "validate",
  "sourceType": "RSSSF",
  "result": "validated|error|duplicate"
}
```

---

## 18. Background Jobs

### Queue Architecture

Three BullMQ queues, all backed by Redis:

```
import   — Import pipeline stages (8 sub-queues)
media    — Media processing (thumbnail, resize, OCR)
refresh  — Materialized view refresh jobs
```

### Job Definition Convention

Every job is typed with a discriminated union:

```typescript
type ImportJob =
  | { type: 'parse'; batchId: string; stagedRecordIds: string[] }
  | { type: 'validate'; stagedRecordId: string }
  | { type: 'merge'; stagedRecordId: string }
```

### Retry Policy

Default BullMQ retry policy:
- Max attempts: 3
- Backoff: exponential, base delay 5 seconds
- On exhausted retries: move to DLQ queue

Custom policies:
- Parser jobs: no retry (deterministic output, retry only after code fix)
- Scraper jobs: 5 retries, linear 30-second backoff
- MV refresh jobs: 2 retries, no backoff

### Dead Letter Queue (DLQ)

Failed jobs are moved to `import.dlq` queue. The admin dashboard polls the DLQ count and displays alerts when > 0. Operators can:
- Inspect the failed job payload and error
- Manually requeue with `queue.add('retry', job.data)`
- Mark as intentionally abandoned

### Scheduling

`@nestjs/schedule` handles recurring cron jobs. Each scheduler lives in its module's `schedulers/` folder:

```
Import scheduler: daily pulls from FBref, Transfermarkt, Wikipedia
Refresh scheduler: every 5 minutes during match window (configurable)
Cleanup scheduler: daily soft-delete cleanup of old staged records (> 90 days, merged/duplicate status)
```

---

## 19. Configuration Management

### Environment Files

```
.env.development     # Local development overrides
.env.test            # CI/test environment
.env.staging         # Staging environment
.env.production      # Never committed to git
.env.example         # Committed: documents all required variables (no secrets)
```

### Required Environment Variables

```
# Application
NODE_ENV=development|test|staging|production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/footballdb
DATABASE_POOL_SIZE=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=                     # RS256 private key path or inline
JWT_PUBLIC_KEY=                 # RS256 public key path or inline
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# S3
S3_ENDPOINT=
S3_BUCKET=footballdb-media
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=

# Throttle
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Import
IMPORT_BATCH_SIZE=1000
IMPORT_MAX_FILE_SIZE_MB=100

# Logging
LOG_LEVEL=info
LOG_PRETTY=false
```

### Config Validation

`config/config.validation.ts` uses Joi to validate all environment variables at startup. Missing or invalid variables cause a startup crash with a clear error message. The application never starts in an invalid configuration state.

---

## 20. Security

### OWASP Top 10 Mitigations

| Threat | Mitigation |
|---|---|
| Injection | Prisma parameterized queries; `$queryRaw` uses tagged template literals |
| Broken Auth | RS256 JWT, short-lived access tokens, refresh token rotation |
| Broken Access Control | Roles + permissions guard on every protected route |
| Security Misconfiguration | Helmet.js, env validation at startup, no defaults for secrets |
| Cryptographic Failures | JWT RS256, bcrypt for passwords, no MD5 for anything sensitive |
| Insecure Design | Repository pattern prevents raw SQL; all writes go through validated services |
| SSRF | Scraper URLs whitelisted to known source domains |
| File Upload | Magic byte validation, size limits, virus scanning hook |

### Security Headers

`@fastify/helmet` applied globally with recommended defaults + custom CSP.

### CORS

Configured in `main.ts` with explicit origin allowlist (not `*`). Origins configurable per environment via `CORS_ORIGINS` env var.

### SQL Injection

Prisma's query builder prevents injection by default. The only raw SQL calls are `prisma.$queryRaw` (tagged template — safely parameterized) and calls to named PostgreSQL functions (parameterized via `$queryRaw`). No `$queryRawUnsafe` with user-supplied strings.

### File Upload Security

1. MIME type check from HTTP header
2. Magic byte validation (libmagic-compatible)
3. File size enforcement before reading bytes
4. Upload to isolated S3 prefix (`/temp/`) before validation
5. Move to `/media/` prefix only after validation passes

---

## 21. Testing Strategy

### Test Types

| Type | Location | Database | Focus |
|---|---|---|---|
| Unit | `test/unit/` | None (mocked) | Services, validators, utils |
| Integration | `test/integration/` | Test DB (real) | Repositories, DB functions |
| E2E | `test/e2e/` | Test DB (real) | HTTP API contracts |

### Unit Testing

- All service methods have unit tests
- Repositories are mocked using `jest.fn()` or a `MockRepository` factory
- No real database connection in unit tests
- Coverage goal: **85% minimum** for service files

### Integration Testing

- Uses `@testcontainers/postgresql` to spin up a real PostgreSQL instance per test suite
- Prisma migrations applied before each suite
- Seed data inserted before each test (within a transaction, rolled back after)
- Repository methods tested against real SQL

### E2E Testing

- Uses `supertest` against a full running NestJS app
- Real PostgreSQL and Redis connections (Docker Compose test stack)
- Tests HTTP status codes, response shapes, and error formats
- Auth tokens generated via test helper factory

### Mocking Strategy

```
Services mock repositories (interface-based, jest.fn())
Controllers mock services (jest.fn())
External HTTP calls mocked via nock
S3 interactions mocked via aws-sdk-client-mock
Redis interactions use ioredis-mock in unit tests
```

### Test Data

- `test/helpers/mock-factory.ts` generates valid typed test objects using `faker.js`
- Factory functions produce DTOs, repository return values, and Prisma model types
- No hardcoded UUIDs in tests — always use `faker.string.uuid()`

### Coverage Goals

| Layer | Minimum Coverage |
|---|---|
| Services | 85% |
| Controllers | 75% |
| Repositories | 80% |
| Utils | 90% |
| Validators | 95% |
| Guards/Filters | 80% |

---

## 22. Performance

### Connection Pooling

- PgBouncer in transaction mode between application and PostgreSQL
- Application pool: 10 connections per process (configurable)
- BullMQ workers use a separate pool (5 connections each)

### N+1 Prevention

- Prisma `include` is used deliberately, never in loops
- For complex aggregation queries, use database views (`vw_*`) or materialized views (`mv_*`) via `$queryRaw`
- List endpoints never join more than 2 levels deep; additional data requires separate requests

### Streaming

- File upload endpoints use streaming (no full file buffering in memory)
- Large CSV export endpoints stream NDJSON responses
- Prisma cursor-based pagination for internal batch processing (not page-based)

### Batch Processing

- Import workers process records in configurable batches (default: 1,000)
- Bulk Prisma operations use `createMany` and `updateMany` where applicable
- Materialized view refreshes are scheduled post-batch, not per-record

### Indexes

All indexes are defined in SQL migrations (001–009). The backend must not create indexes programmatically. Index additions require a new migration file.

---

## 23. Deployment

### Docker

**`Dockerfile`** — Multi-stage build:
1. `deps` stage: install `node_modules`
2. `build` stage: compile TypeScript
3. `production` stage: copy compiled output, install prod dependencies only

**`docker-compose.yml`** — Local development:
```
services: app, postgres, redis, minio, pgbouncer
```

### CI/CD Pipeline

```
Trigger: Pull Request → main

Steps:
1. Lint (ESLint)
2. Type check (tsc --noEmit)
3. Unit tests (Jest)
4. Integration tests (Testcontainers)
5. Build Docker image
6. Push to registry (on merge to main)
7. Deploy to staging (automated)
8. E2E tests against staging
9. Manual approval gate
10. Deploy to production
```

### Database Migrations

- All migrations are in `prisma/migrations/`
- Migration is applied by `prisma migrate deploy` (idempotent, safe for CI)
- Never use `prisma migrate dev` in staging or production
- Migration is the first step of every deployment, before the app starts
- Backward-compatible migrations only: no column drops without deprecation window

### Health Checks

`GET /health` returns:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "storage": { "status": "up" }
  }
}
```

Load balancer uses `/health` as the liveness and readiness probe.

### Graceful Shutdown

On `SIGTERM`:
1. Stop accepting new HTTP requests
2. Wait for in-flight requests to complete (max 30 seconds)
3. Drain BullMQ workers (complete current job, do not pick up new ones)
4. Close Prisma connection
5. Close Redis connection
6. Exit 0

---

## 24. Coding Standards

### File Naming

All files use `kebab-case`:
```
persons.service.ts
create-person.dto.ts
person-repository.interface.ts
jwt-auth.guard.ts
```

### Class Naming

Pascal case:
```
PersonsService
CreatePersonDto
PersonResponseDto
JwtAuthGuard
PersonsRepository
```

### Suffixes by Type

| Type | Suffix |
|---|---|
| Module | `XxxModule` |
| Controller | `XxxController` |
| Query Service | `XxxQueryService` |
| Command Service | `XxxCommandService` |
| Service (simple) | `XxxService` |
| Repository | `XxxRepository` |
| Interface | `IXxxRepository`, `IXxxService` |
| Guard | `XxxGuard` |
| Filter | `XxxFilter` |
| Interceptor | `XxxInterceptor` |
| Pipe | `XxxPipe` |
| DTO | `CreateXxxDto`, `XxxResponseDto`, `XxxFilterDto` |
| Entity | `XxxEntity` |
| Event | `XxxCreatedEvent`, `XxxUpdatedEvent` |
| Worker | `XxxWorker` |
| Strategy | `XxxStrategy` |

### Enum Naming

PascalCase enum name, SCREAMING_SNAKE_CASE values:
```typescript
enum CareerRole {
  PLAYER = 'Player',
  MANAGER = 'Manager',
}
```

### Constant Naming

SCREAMING_SNAKE_CASE for module-level constants:
```typescript
const MAX_IMPORT_BATCH_SIZE = 5000;
const CACHE_KEY_PERSON_PROFILE = (id: string) => `person:profile:${id}`;
```

### Environment Variable Naming

SCREAMING_SNAKE_CASE with module prefix:
```
JWT_SECRET
DATABASE_POOL_SIZE
S3_BUCKET
IMPORT_BATCH_SIZE
```

### TypeScript Rules

- `strict: true` in `tsconfig.json`
- No `any` — use `unknown` and type narrowing
- No `as` type assertions except in test helpers
- No `!` non-null assertions on values that could genuinely be null
- No `enum` in database-mapped types — use `const` + type union (Prisma generates its own enums)
- All functions must have explicit return types
- Prefer `readonly` for DTO properties
- Prefer `interface` over `type` for object shapes

---

## 25. Development Workflow

### Branch Strategy

```
main        — Production-ready code only. Protected.
staging     — Pre-production. Deployed to staging automatically.
develop     — Integration branch. All features merge here first.
feat/xxx    — Feature branches. Branch from develop.
fix/xxx     — Bugfix branches. Branch from develop (or main for hotfixes).
chore/xxx   — Non-feature work (deps, docs, refactors).
```

### Feature Development Process

```
1. Create feature branch: git checkout -b feat/add-player-stats develop
2. Implement feature (module, service, repository, DTO, tests)
3. Write unit and integration tests
4. Run full test suite locally: npm run test
5. Run linter: npm run lint
6. Commit using Conventional Commits format
7. Open Pull Request against develop
8. CI pipeline runs automatically
9. Code review by at least one team member
10. Merge on approval + green CI
```

### Conventional Commit Format

```
feat(persons): add player career summary endpoint
fix(import): handle empty raw_payload in staged record validator
chore(deps): upgrade prisma to 5.x
docs(readme): add environment setup instructions
test(careers): add integration test for career overlap validation
refactor(auth): extract token rotation logic into TokenService
```

### Pull Request Checklist

```
[ ] All tests pass locally
[ ] Coverage does not decrease
[ ] No TypeScript errors (tsc --noEmit)
[ ] Linter passes (no warnings)
[ ] New env variables documented in .env.example
[ ] Database changes have a migration file
[ ] Breaking API changes documented in CHANGELOG.md
[ ] Swagger docs updated (decorators added to controller)
[ ] ADR created if architectural decision was made
```

### Migration Workflow

```
1. Make schema changes in schema.prisma (or add raw SQL to migrations folder)
2. Run: prisma migrate dev --name describe-the-change
3. Verify generated migration SQL in prisma/migrations/
4. Run integration tests against migrated schema
5. Commit migration files alongside application code changes
6. Never squash or modify committed migration files
```

### Release Workflow

```
1. Merge develop → staging
2. Staging deployment runs automatically
3. E2E tests run against staging
4. Product owner sign-off
5. Create GitHub Release with tag (v1.2.0)
6. Merge staging → main
7. Production deployment runs automatically
8. Monitor error rates and health checks for 30 minutes post-deploy
9. Rollback procedure: git revert + deploy previous Docker image tag
```

### Code Review Standards

- Review within 24 hours of PR opening
- Focus on: business logic correctness, security, test coverage, adherence to this handbook
- Do not approve if: no tests, uses `any`, bypasses repository pattern, modifies audit history, hardcodes secrets
- Constructive comments only — suggest the correct approach

---

*This document is the single source of truth for FootballDB backend engineering.*
*All developers and AI agents building this system must adhere to this handbook.*
*Changes to this document require an Architecture Decision Record (ADR) and team consensus.*
