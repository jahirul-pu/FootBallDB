# Changelog

All notable changes to the architecture and domain model of FootballDB will be documented in this file.

The architecture is formally **Frozen** as of Version 1.0 (2026-07-20). Any deviation, schema alteration, or new entity creation must be accompanied by a recorded design decision here.

## [1.0.0] - 2026-07-20
### Added
- Architecture Status: Frozen.
- Baseline `00-project-vision.md` established.
- Baseline `01-domain-architecture.md` established.
- Exhaustive `02-entity-catalogue.md` produced.
- Exhaustive `03-attribute-catalog.md` produced.
- Exhaustive `04-relationship-matrix.md` produced.

### Pending Architecture Decisions
- **Polymorphic Associations**: Will need to choose between EntityType/EntityId patterns vs distinct junction tables during physical implementation.
- **Soft Delete Policy**: Standardizing soft deletes/archives over cascading physical deletes to preserve deep historical integrity.
