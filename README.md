# FootballDB Backend

FootballDB is an enterprise-grade backend system designed to model, ingest, and serve historical and contemporary football (soccer) data.

## Features
- **Clean Architecture:** Feature-first modules with strict dependency inversion.
- **High Performance:** Fastify, Redis caching, and PostgreSQL optimizations.
- **Robust Imports:** Distributed BullMQ workers for data ingestion and conflict resolution.

## Tech Stack
- NestJS (Fastify)
- TypeScript
- PostgreSQL 16
- Prisma ORM
- Redis & BullMQ

## Quick Start
1. `npm install`
2. `npm run docker:dev`
3. `npm run migrate:dev`
4. `npm run start:dev`
