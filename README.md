# FootballDB

FootballDB is a comprehensive, enterprise-grade database and backend system designed to model, ingest, and serve historical and contemporary football (soccer) data.

## Features

- **Domain-Driven Design:** Models the complex reality of global football, including geopolitics, organizations, competitions, clubs, players, matches, careers, awards, and records.
- **Immutable Historical Architecture:** Prioritizes historical integrity. Fact assertions are appended, conflicts are managed, and records are soft-deleted, ensuring history is never accidentally overwritten.
- **Robust Import Pipeline:** A robust, queued architecture for importing data from dozens of disparate sources, parsing, normalizing, duplicate-checking, and resolving conflicts automatically or manually.
- **Enterprise-Ready Backend:** Built on Node.js, NestJS, and TypeScript. Implements Clean Architecture, CQRS readiness, strong RBAC, and background job processing with BullMQ.
- **Performance First:** PostgreSQL 16 foundation with materialized views, optimized indexes, and Redis caching.

## Architecture

Please see the `docs/` directory and root architecture documents for in-depth system designs:
- `01-domain-architecture.md`
- `10-import-architecture.md`
- `11-backend-architecture.md`

## Stack

- **Database:** PostgreSQL 16
- **Backend:** NestJS, TypeScript
- **ORM:** Prisma
- **Cache:** Redis
- **Queues:** BullMQ
- **Search:** pg_trgm (Phase 1) / Elasticsearch (Phase 2)
- **Object Storage:** S3-compatible

## License

MIT License. See `LICENSE` for details.
