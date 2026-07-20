# FootballDB — Data Import Architecture
**Version:** 1.0 | **Status:** Implementation-Ready | **Date:** 2026-07-20

---

## Table of Contents

1. [Overview](#1-overview)
2. [Import Pipeline](#2-import-pipeline)
3. [Supported Sources](#3-supported-sources)
4. [Parser Architecture](#4-parser-architecture)
5. [Normalization Layer](#5-normalization-layer)
6. [Validation Pipeline](#6-validation-pipeline)
7. [Import State Machine](#7-import-state-machine)
8. [Staging & Duplicate Detection](#8-staging--duplicate-detection)
9. [Conflict Resolution](#9-conflict-resolution)
10. [Confidence Score System](#10-confidence-score-system)
11. [Fact Assertion Model](#11-fact-assertion-model)
12. [Merge Strategy](#12-merge-strategy)
13. [Historical Corrections](#13-historical-corrections)
14. [Error Handling & Recovery](#14-error-handling--recovery)
15. [Queue & Worker Architecture](#15-queue--worker-architecture)
16. [Batch Scheduling](#16-batch-scheduling)
17. [Audit & Logging](#17-audit--logging)
18. [Performance Optimization](#18-performance-optimization)
19. [Folder Structure](#19-folder-structure)
20. [Import Service Architecture](#20-import-service-architecture)
21. [API Endpoints](#21-api-endpoints)
22. [Admin UI](#22-admin-ui)
23. [Idempotency Design](#23-idempotency-design)
24. [Rollback Strategy](#24-rollback-strategy)

---

## 1. Overview

FootballDB's import architecture is designed around three immutable principles:

- **Never overwrite history.** Every imported fact is stored as an assertion against a source. Historical corrections append new assertions; they do not mutate existing ones.
- **Source isolation.** Raw data never directly touches production tables. All ingestion flows through a staged quarantine zone where it is validated, normalized, deduplicated, and adjudicated before promotion.
- **Auditability.** Every row in production can be traced back through the full import lineage: batch → staged record → fact assertion → source document.

---

## 2. Import Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SOURCES                             │
│   CSV · Excel · JSON · XML · RSSSF · Transfermarkt · FBref ·       │
│   Wikipedia · Federation sites · Books · Scanned PDFs · Manual     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INGESTION LAYER                                                     │
│  • File upload / API pull / manual entry form                       │
│  • SourceDocument record created (idempotent, checksum-gated)       │
│  • Import Batch record created                                       │
│  • Raw file stored in object storage (S3/equivalent)                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PARSER LAYER                                                        │
│  • Format detection (MIME type + extension + sniffing)              │
│  • Source-specific parser selected                                  │
│  • Parsed into canonical raw JSONB records                          │
│  • Each record written as a StagedRecord (status = Pending)         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NORMALIZATION LAYER                                                 │
│  • Name normalization (unaccent, transliteration, known aliases)    │
│  • Date normalization (FuzzyDate resolution)                        │
│  • Entity resolution (match to existing Person/Team/Venue IDs)      │
│  • Code normalization (FIFA codes, ISO country codes)               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  VALIDATION LAYER                                                    │
│  • Schema validation (required fields, type checks)                 │
│  • Domain validation (valid roles, event types, date ranges)        │
│  • Referential validation (does referenced team/person exist?)      │
│  • Business rule validation (can't score in same minute twice etc.) │
│  • StagedRecord status → Validated or Error                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DUPLICATE DETECTION LAYER                                           │
│  • Intra-batch: identical payload hash detection                    │
│  • Cross-batch: similarity match against existing production rows   │
│  • Duplicate StagedRecords marked status = Duplicate                │
│  • Suspicious near-duplicates flagged for manual review             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CONFLICT DETECTION LAYER                                            │
│  • Compares incoming assertion against existing FactAssertions      │
│  • No conflict: auto-promote                                        │
│  • Minor conflict: flag with confidence score < 85                  │
│  • Major conflict: ConflictResolutionTask created (status=Pending)  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FACT ASSERTION LAYER                                                │
│  • FactAssertion record created linking SourceDocument → domain     │
│  • Confidence score assigned                                        │
│  • StagedRecord status → Merged                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PRODUCTION TABLES                                                   │
│  • Domain entities created or updated (RESTRICT enforced)           │
│  • Materialized views refreshed after batch completes               │
│  • Audit log entry written                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Supported Sources

### Source Classification Matrix

| Source | Format | Reliability | Parser Type | Auto-Promote |
|---|---|---|---|---|
| Official FIFA Documents | PDF / XML / JSON | Primary | Structured | Yes (confidence ≥ 95) |
| Official UEFA Documents | PDF / XML | Primary | Structured | Yes (confidence ≥ 95) |
| National Federation Sites | HTML / JSON | Primary | Scraper | Yes (confidence ≥ 90) |
| RSSSF | TXT / HTML | Secondary | RSSSF Parser | Review (confidence 80) |
| FBref | HTML / CSV | Secondary | Scraper | Review (confidence 85) |
| Transfermarkt | HTML | Secondary | Scraper | Review (confidence 80) |
| Wikipedia | HTML / Wikitext | Tertiary | Wiki Parser | Review (confidence 65) |
| WorldFootball | HTML | Tertiary | Scraper | Review (confidence 70) |
| Historical Books | Scanned PDF | Research | OCR + Manual | Manual only |
| CSV / Excel | File upload | Variable | CSV / XLSX | Depends on source |
| Manual Entry | API / Form | Curator | N/A | Review required |

### Source Trust Levels

- **Level 1 (Primary):** Official governing body publications. Auto-promoted after validation with high confidence scores.
- **Level 2 (Secondary):** Well-established reference databases (RSSSF, FBref, Transfermarkt). Auto-staged; require no active conflict to auto-promote.
- **Level 3 (Tertiary):** Community-maintained sources (Wikipedia). Always require human review.
- **Level 4 (Research):** Books, scanned documents. Always require manual curation.

---

## 4. Parser Architecture

### Design Principle
Each parser is a standalone, stateless module that accepts raw input bytes and emits a list of canonical raw JSON records. Parsers have no knowledge of the database schema.

### Parser Interface

Every parser implements a common contract:

```
Input:
  - raw_bytes: bytes
  - source_metadata: { source_type, url, filename, encoding }

Output:
  - records: List<RawRecord>
  - parse_errors: List<ParseError>
  - parser_version: string
  - record_count: int
```

### Parser Registry

A central registry maps `source_document_type` → `parser_class`. New parsers are registered without modifying core pipeline code.

### Implemented Parsers

**CSVParser**
- Handles BOM, multiple encodings (UTF-8, Latin-1, Windows-1252)
- Auto-detects delimiter (comma, semicolon, tab)
- First-row header detection
- Null value normalization (empty string, `N/A`, `?`, `-`)

**XLSXParser**
- Reads multiple sheets
- Resolves merged cells
- Handles numeric date formats (Excel serial dates)
- Extracts named ranges if present

**JSONParser**
- Handles both arrays and objects at root level
- Supports JSON Lines (NDJSON) format
- Nested object flattening with configurable depth

**XMLParser**
- Schema-agnostic — configurable XPath extraction mappings
- Handles namespaced XML
- Streaming parse for large files (> 50 MB)

**RSSFParser**
- Specialized parser for RSSSF plaintext format
- Regex-based score extraction
- Player name tokenization (handles mixed-language texts)
- Lineup and goal-scorer extraction

**HTMLScrapeParser**
- CSS selector-based extraction
- Site-specific scraping profiles (FBref, Transfermarkt, Wikipedia)
- Rate limiting enforced at parser level
- Respects robots.txt

**PDFParser**
- Uses OCR pipeline for scanned documents
- Uses text extraction for digitally born PDFs
- Outputs raw text blocks for manual curation queue

**ManualEntryParser**
- Accepts validated API JSON (admin endpoints)
- Passes through with source_type = PersonalResearch
- Always routes to manual review queue

### Format Sniffing

When format is ambiguous:
1. Check Content-Type header (if available)
2. Check file extension
3. Attempt magic byte detection
4. Attempt UTF-8 decode and JSON parse
5. Fall back to CSV sniffing
6. If all fail: route to ManualEntryParser

---

## 5. Normalization Layer

The normalizer transforms parsed raw records into a consistent canonical form before database interaction begins.

### Name Normalization

1. **Unicode normalization:** NFC normalization applied to all text fields.
2. **Unaccent:** Diacritics stripped for comparison purposes (stored in `aliases` table with valid time).
3. **Known alias resolution:** Name matched against `aliases` table using trigram similarity (threshold > 0.80).
4. **Transliteration:** Cyrillic, Arabic, and CJK names resolved via transliteration table.
5. **Name order:** `Firstname Lastname` and `Lastname, Firstname` formats resolved to standard form.

### Date Normalization

FootballDB uses a `FuzzyDate` concept throughout:
- If full date known → store `year + month + day`
- If only year + month known → store `year + month`, leave `day = NULL`
- If only year known → store `year`, leave `month = NULL, day = NULL`

Date formats handled: ISO 8601, DD/MM/YYYY, MM/DD/YYYY, YYYY, `circa YYYY`, `before YYYY`, `after YYYY`, Roman numerals (some historical sources).

Ambiguous dates (e.g., `06/07/1970`) are flagged for review based on source locale settings.

### Entity Resolution

Entity resolution maps raw strings to known database UUIDs before staging:

1. **Exact match:** `lower(unaccent(name))` lookup in known entities.
2. **Alias match:** Lookup in `aliases` table (valid time aware).
3. **Fuzzy match:** Trigram similarity > 0.80 against primary names and aliases.
4. **FIFA/ISO code match:** For teams and geopolitical entities.
5. **Unresolved:** Record staged with `entity_ref = NULL` and `resolution_status = Unresolved`. Routes to manual review.

Resolution is cached per batch run to avoid repeated lookups.

### Code Normalization

- FIFA team codes mapped to `teams.id` via the `aliases` table with `entity_type = Team`.
- ISO 3166-1 alpha-3 codes mapped to `geopolitical_entities.iso_code`.
- Confederation codes (UEFA, CONMEBOL, AFC, CAF, CONCACAF, OFC) mapped to `organizations.abbreviation`.

---

## 6. Validation Pipeline

Validation runs in layers, fail-fast per record.

### Layer 1: Schema Validation
- Required fields present
- Correct data types (no numeric strings where integers expected)
- String length limits respected
- Enum values are valid members of the declared enum

### Layer 2: Domain Validation
- `birth_year` between 1800 and current year
- `career_start_year >= birth_year + 12`
- `career_end_year >= career_start_year`
- Match scores `>= 0`
- Match minute `>= 0 AND <= 150`
- Confidence scores `between 0 and 100`
- `valid_from <= valid_to` on all temporal entities

### Layer 3: Referential Validation
- Referenced `team_id` exists in `teams` table
- Referenced `person_id` exists in `persons` table
- Referenced `venue_id` exists in `venues` table
- Referenced `edition_id` exists in `editions` table
- Unresolved references downgrade confidence score

### Layer 4: Business Rule Validation
- A player cannot appear in two simultaneous matches at the same kickoff time
- A match cannot have goals scored in minutes that exceed the recorded match duration
- A career association start date cannot precede a person's birth year by less than 12 years
- A team cannot play two home matches at exactly the same kickoff time

### Validation Result

Each staged record receives a `validation_errors` JSONB array with structured error objects:

```json
[
  {
    "layer": "domain",
    "field": "birth_year",
    "rule": "birth_year_range",
    "value": 1750,
    "message": "birth_year 1750 is below minimum allowed value of 1800"
  }
]
```

Records with any Layer 1 or Layer 2 error → `status = Error`
Records with only Layer 3 or 4 warnings → `status = Validated` with lowered confidence score

---

## 7. Import State Machine

Each `StagedRecord` progresses through a formal state machine:

```
                    ┌─────────┐
                    │  PENDING │  ← Created after parsing
                    └────┬────┘
                         │ process
                   ┌─────▼──────┐
             ┌─────│  VALIDATED  │─────┐
             │     └─────┬──────┘     │
             │           │            │
             │           │ duplicate  │ conflict
             │           ▼            ▼
             │     ┌──────────┐  ┌──────────┐
             │     │DUPLICATE │  │ CONFLICT │  ← ConflictResolutionTask created
             │     └──────────┘  └────┬─────┘
             │                        │ resolved
             │                        ▼
             │                   ┌─────────┐
             │                   │RESOLVED │
             │                   └────┬────┘
             │                        │
             └──────────┬─────────────┘
                        │ merge
                        ▼
                   ┌─────────┐
                   │  MERGED  │  ← Written to production
                   └─────────┘
             error │
                   ▼
               ┌───────┐
               │ ERROR  │  ← Stored with validation_errors
               └───────┘
```

### ConflictResolutionTask State Machine

```
PENDING → ACCEPTED (curator accepts incoming assertion)
        → REJECTED (curator rejects incoming assertion)
        → NEEDS_REVIEW (escalated for senior curator)
        → DUPLICATE (marked as known duplicate)
        → ESCALATED (requires data governance decision)
```

---

## 8. Staging & Duplicate Detection

### Intra-Batch Duplicate Detection

Before batch processing begins, `fn_duplicate_staged_payload` runs across all records in the batch:
- Groups by `md5(raw_payload::TEXT)`
- Any group with count > 1 → all but the first record in the group are marked `status = Duplicate`

### Cross-Batch Duplicate Detection

After normalization and entity resolution, each record is compared to existing production data:

**For Persons:**
- Match by `(unaccent(primary_name), birth_year)` exact match
- If no exact match: fuzzy match using `fn_detect_duplicate_person`
- Similarity threshold: > 0.70 with same birth decade

**For Matches:**
- Match by `(home_team_id, away_team_id, kickoff_time ± 4 hours)`
- Use `fn_detect_duplicate_match`

**For Match Events:**
- Match by `(match_id, event_type, minute, actor_person_id)`
- Same event from the same match within ±1 minute considered duplicate

**For Career Associations:**
- Match by `(person_id, team_id, role, start_year)` exact match
- Overlap detection via `fn_check_career_overlap`

### Duplicate Scoring

Records with high duplicate probability (score > 0.90) are auto-marked `Duplicate`.
Records with medium probability (0.70–0.90) are flagged for human review.
Records with low probability (< 0.70) proceed as new records.

---

## 9. Conflict Resolution

### Conflict Definition

A conflict exists when an incoming assertion makes a claim that *contradicts* an existing accepted fact in the database.

Examples:
- Incoming says Pelé scored in minute 17; existing record says minute 14 for the same match
- Incoming says a player was born on 15 Feb 1940; existing record says 18 Feb 1940
- Two sources disagree on final score of the same match

### Conflict Severity Levels

**Minor Conflict (auto-promoted with note):**
- Difference in non-critical metadata (stadium capacity by 5%)
- Trivial name spelling difference (accents only)
- Score agrees but goal minutes differ

**Moderate Conflict (flagged for review):**
- Scorer attribution different
- Attendance figures differ by > 20%
- Career dates differ by more than one year

**Major Conflict (blocked until resolved):**
- Match result/score disagreement
- Player nationality disagreement
- Birth year disagreement

### Conflict Auto-Resolution Rules

| Condition | Resolution |
|---|---|
| Incoming source has higher trust level than existing | Accept incoming, downgrade existing |
| Both Level 1 (official) sources — same result | Merge, keep both assertions |
| Both Level 1 sources — different results | Block, create ConflictResolutionTask (priority = Critical) |
| Incoming confirms existing | Add corroborating FactAssertion, raise confidence score |
| Incoming contradicts Level 3 source | Accept incoming, demote existing to Conflicting |

---

## 10. Confidence Score System

Every `FactAssertion` carries a `confidence_score` (0–100).

### Initial Score Calculation

```
base_score = source_trust_score[source_type]

Source Trust Scores:
  FIFADocument        = 97
  UEFADocument        = 96
  OfficialFederation  = 93
  RSSSF               = 82
  FBref               = 84
  Transfermarkt       = 80
  WorldFootball       = 72
  Wikipedia           = 65
  Archive             = 75
  Newspaper           = 68
  Book                = 70
  PersonalResearch    = 50
```

### Modifier Rules

```
+5   if corroborated by a second independent Level 1 source
+3   if corroborated by a second independent Level 2 source
+2   if corroborated by any additional Level 3+ source
-10  if any field in the record has unresolved entity references
-15  if the record was OCR-extracted (PDF scanned)
-5   if date is FuzzyDate with day unknown
-10  if date is FuzzyDate with month unknown
-20  if a competing assertion exists from a Level 1 source
-5   if the record passed only after a manual curator review decision
```

### Score Interpretation

| Score Range | Meaning | Display |
|---|---|---|
| 95–100 | Verified Primary Source | ✅ Verified |
| 85–94 | High Confidence | ✅ Reliable |
| 70–84 | Moderate Confidence | ⚠️ Likely accurate |
| 50–69 | Low Confidence | ⚠️ Uncertain |
| 0–49 | Disputed / Research only | ❌ Disputed |

---

## 11. Fact Assertion Model

A `FactAssertion` links exactly one `SourceDocument` to one domain fact (currently: `MatchEvent`).

### Assertion Types

- **Primary:** The main source making the claim
- **Secondary:** A second source making the same claim
- **Corroborating:** A third+ source confirming
- **Conflicting:** A source making an opposing claim (stored, never deleted)
- **Retracted:** A source that has since corrected itself

### Fact Assertion Creation Flow

1. Validated, non-duplicate staged record is ready to promote.
2. System checks if `MatchEvent` (or other domain entity) already exists.
3. If exists and claim agrees → create `Corroborating` FactAssertion. Raise confidence.
4. If exists and claim conflicts → create `Conflicting` FactAssertion. Create ConflictResolutionTask.
5. If new → create `Primary` FactAssertion. Create domain entity. Set confidence.

---

## 12. Merge Strategy

### Entity Merge

When an incoming record resolves to an existing entity (person, team, venue):
- No duplicate entity is created
- Missing fields on existing entity are populated if they carry valid data
- Existing fields are NOT overwritten — a FactAssertion is created with the differing claim

### Event Merge

When an incoming match event matches an existing one (same match, same minute, same actor, same type):
- If it is an identical claim → `Corroborating` assertion only
- If it differs in any way → ConflictResolutionTask created

### Merge Atomicity

All merges within a single staged record processing run inside a database transaction. If any step fails, the entire record rolls back to `status = Pending` with a structured error log.

---

## 13. Historical Corrections

Historical corrections in FootballDB are handled **exclusively through new assertions**, never through direct updates.

### Process

1. Curator identifies an error in production data.
2. Curator locates or registers the authoritative source for the correction.
3. A new `StagedRecord` is created manually with `source_type = OfficialFederation` or higher.
4. Import pipeline runs normally.
5. On conflict detection, the new record is flagged.
6. Curator resolves the conflict, accepting the corrected claim.
7. The original `FactAssertion` has its `assertion_type` changed to `Retracted`.
8. The corrected value is applied to the domain entity.
9. Audit log records the full change history.

### What Gets Updated

Only the following fields can be updated on production domain entities through corrections:
- Name fields (via Alias entries, not overwriting primary_name)
- Fuzzy date fields (birth date corrections, known historical ambiguity)
- Career date ranges (contract extensions, historical research)
- Venue capacity (official capacity changes)

**MatchEvent records are never mutated.** A corrected match event is modeled as a compensating event (the original is retracted, a new event is appended).

---

## 14. Error Handling & Recovery

### Error Categories

| Category | Behavior |
|---|---|
| Parse error | Record written as StagedRecord with status=Error, validation_errors populated |
| Validation error | Same as parse error |
| DB transient error | Automatic retry with exponential backoff (3 attempts) |
| Duplicate detected | status=Duplicate, no further processing |
| Conflict detected | status=Conflict, ConflictResolutionTask created |
| Worker crash | Batch checkpoint recovered on restart |

### Retry Strategy

- Transient database errors: retry up to 3 times with 5s, 15s, 30s backoff
- Parser failures: no automatic retry (requires code fix or parser profile update)
- Scraper timeouts: retry up to 5 times with 10s, 30s, 60s, 120s, 300s backoff
- After exhausted retries: record enters Dead Letter Queue

### Dead Letter Queue (DLQ)

Records that exhaust all retries are written to the DLQ with:
- Full error stack trace
- Last attempted state
- Retry count
- Source batch reference

DLQ records appear in the admin dashboard for manual triage.

### Rollback Strategy

Each batch processing operation is transactional at the staged-record level. If a batch-level failure occurs:
- All promoted records in the current transaction are rolled back
- StagedRecords are reset to `Pending`
- Batch status is set to `Failed` with error metadata
- Operator is notified
- Re-running the batch is idempotent (see Section 23)

---

## 15. Queue & Worker Architecture

### Queue Technology

Recommended: **PostgreSQL-backed job queue** (e.g., `pg-boss` or `BullMQ with Redis`). A PostgreSQL-native queue is preferred in Phase 1 to minimize infrastructure dependencies.

### Queue Structure

```
import.ingestion        ← File upload / API trigger jobs
import.parse            ← Parser dispatch jobs
import.normalize        ← Normalization jobs
import.validate         ← Validation jobs
import.duplicate        ← Duplicate detection jobs
import.conflict         ← Conflict detection jobs
import.merge            ← Production merge jobs
import.mv_refresh       ← Materialized view refresh jobs
import.dlq              ← Dead letter queue
```

### Worker Pools

| Worker Pool | Concurrency | Responsibility |
|---|---|---|
| ingestion-worker | 2 | Download/upload raw files, create SourceDocument + ImportBatch |
| parser-worker | 4 | Run source-specific parsers, write StagedRecords |
| normalize-worker | 8 | Entity resolution, name normalization, date normalization |
| validate-worker | 8 | Run all validation layers |
| duplicate-worker | 4 | Intra- and cross-batch duplicate detection |
| conflict-worker | 4 | Conflict detection, auto-resolution, ConflictResolutionTask creation |
| merge-worker | 4 | Write to production tables, create FactAssertions |
| refresh-worker | 1 | Materialized view refresh (must be single-threaded) |

### Worker Isolation

Each worker pool processes its queue independently. Workers are stateless — all state lives in the database. Workers can be horizontally scaled by increasing concurrency.

---

## 16. Batch Scheduling

### Import Batch Structure

```
ImportBatch {
  id: UUID
  source_document_id: UUID
  status: Pending | Running | Paused | Completed | Failed | Cancelled
  total_records: INT
  processed_records: INT
  validated_records: INT
  error_records: INT
  duplicate_records: INT
  merged_records: INT
  started_at: TIMESTAMPTZ
  completed_at: TIMESTAMPTZ
  checkpoint_record_id: UUID     ← Last successfully processed record
  parser_version: TEXT
  created_by: UUID
}
```

### Checkpoint Recovery

Each batch records the last successfully processed `staged_record_id` as a checkpoint. On crash/restart:
1. Query all batches with `status = Running`
2. Restart from `checkpoint_record_id + 1`
3. Skip already-Merged and already-Duplicate records (idempotent)

### Scheduled Imports

| Source | Schedule | Trigger |
|---|---|---|
| Official FIFA data drops | On release | Manual trigger + webhook |
| RSSSF | Weekly | Cron: Sunday 02:00 UTC |
| FBref | Daily | Cron: 03:00 UTC |
| Transfermarkt | Daily | Cron: 04:00 UTC |
| Wikipedia (target articles) | Weekly | Cron: Monday 05:00 UTC |
| Manual uploads | On upload | Event-driven |

---

## 17. Audit & Logging

### Import Audit Trail

Every import batch produces a full audit record:

```
import_batch_audit {
  batch_id
  event_type: BatchStarted | RecordParsed | RecordValidated | RecordMerged |
              ConflictDetected | DuplicateDetected | BatchCompleted | BatchFailed
  event_time
  record_id
  details: JSONB
}
```

### Database Audit

The `audit_log` table (created in `009_functions.sql`) captures all INSERT/UPDATE operations on production tables with:
- Old row state (JSONB)
- New row state (JSONB)
- Diff (only changed keys)
- Operator identity
- Timestamp

### Application Logging

Structured JSON logs emitted at every pipeline stage:

```json
{
  "timestamp": "2026-07-20T12:00:00Z",
  "level": "info",
  "service": "import-pipeline",
  "stage": "validate",
  "batch_id": "uuid",
  "record_id": "uuid",
  "result": "validated",
  "duration_ms": 12
}
```

Log levels: `debug | info | warn | error | fatal`

### Retention

- Structured logs: 90 days in log aggregation system
- `audit_log` table: permanent (never deleted)
- StagedRecords: permanent (soft-delete only)
- Import batch metadata: permanent

---

## 18. Performance Optimization

### Database-Level

- All FK columns indexed (enforced in migrations 001–007)
- GIN index on `staged_records.raw_payload` for JSONB containment queries
- Trigram indexes on all name columns for similarity search
- Partial indexes on `status = 'Pending'` for queue worker queries
- Materialized views pre-aggregate heavy statistics
- `UNLOGGED` tables considered for high-volume intermediate staging (Phase 2)

### Pipeline-Level

- Parsers stream large files (> 50 MB) rather than loading into memory
- Normalization results cached per batch run (entity UUID lookups)
- Duplicate detection runs as a single bulk SQL operation per batch before individual record processing
- Validation pipeline exits on first hard error (fail-fast)

### Batch Sizing

- Recommended batch size: 1,000–5,000 records per processing unit
- Large source files (> 100,000 records) are chunked into sub-batches automatically
- Each sub-batch is independently checkpointed

### Parallel Processing

- Normalize, validate, and duplicate stages can process records in parallel (within a batch)
- Merge stage is serialized within a batch to prevent race conditions on entity creation
- Cross-batch parallelism: multiple batches from different sources can run concurrently

### Connection Pooling

- PgBouncer in transaction pooling mode recommended
- Import workers use a dedicated connection pool (max 20 connections)
- Merge workers use a separate pool (max 10 connections, longer timeout)

---

## 19. Folder Structure

```
services/
└── import/
    ├── src/
    │   ├── parsers/
    │   │   ├── base.parser.ts            # Abstract parser interface
    │   │   ├── csv.parser.ts
    │   │   ├── xlsx.parser.ts
    │   │   ├── json.parser.ts
    │   │   ├── xml.parser.ts
    │   │   ├── rsssf.parser.ts
    │   │   ├── pdf.parser.ts
    │   │   ├── html/
    │   │   │   ├── fbref.parser.ts
    │   │   │   ├── transfermarkt.parser.ts
    │   │   │   ├── wikipedia.parser.ts
    │   │   │   └── base.scraper.ts
    │   │   └── registry.ts               # Parser → source_type mapping
    │   │
    │   ├── normalizers/
    │   │   ├── name.normalizer.ts
    │   │   ├── date.normalizer.ts
    │   │   ├── entity.resolver.ts
    │   │   └── code.normalizer.ts
    │   │
    │   ├── validators/
    │   │   ├── schema.validator.ts
    │   │   ├── domain.validator.ts
    │   │   ├── referential.validator.ts
    │   │   └── business.validator.ts
    │   │
    │   ├── duplicate/
    │   │   ├── intra-batch.detector.ts
    │   │   ├── cross-batch.detector.ts
    │   │   └── scoring.ts
    │   │
    │   ├── conflict/
    │   │   ├── detector.ts
    │   │   ├── auto-resolver.ts
    │   │   └── task.creator.ts
    │   │
    │   ├── merge/
    │   │   ├── entity.merger.ts
    │   │   ├── event.merger.ts
    │   │   └── assertion.writer.ts
    │   │
    │   ├── workers/
    │   │   ├── ingestion.worker.ts
    │   │   ├── parse.worker.ts
    │   │   ├── normalize.worker.ts
    │   │   ├── validate.worker.ts
    │   │   ├── duplicate.worker.ts
    │   │   ├── conflict.worker.ts
    │   │   ├── merge.worker.ts
    │   │   └── refresh.worker.ts
    │   │
    │   ├── scheduler/
    │   │   ├── cron.scheduler.ts
    │   │   └── batch.manager.ts
    │   │
    │   ├── confidence/
    │   │   └── score.calculator.ts
    │   │
    │   └── api/
    │       ├── import.controller.ts
    │       ├── batch.controller.ts
    │       └── conflict.controller.ts
    │
    ├── profiles/                         # Source-specific scraping configs (YAML)
    │   ├── fbref.yaml
    │   ├── transfermarkt.yaml
    │   └── wikipedia.yaml
    │
    └── tests/
        ├── parsers/
        ├── normalizers/
        ├── validators/
        └── fixtures/                     # Sample raw source files for unit tests
```

---

## 20. Import Service Architecture

### Services

```
┌───────────────────┐   ┌────────────────────┐   ┌──────────────────────┐
│  Import API       │   │  Import Engine     │   │  Admin Dashboard     │
│  (REST)           │──▶│  (Worker pools)    │──▶│  (Conflict review)   │
│  /api/import/...  │   │  Queue-driven      │   │  /admin/imports/...  │
└───────────────────┘   └────────┬───────────┘   └──────────────────────┘
                                 │
                    ┌────────────▼───────────┐
                    │  PostgreSQL            │
                    │  staged_records        │
                    │  conflict_tasks        │
                    │  audit_log             │
                    │  production tables     │
                    └────────────────────────┘
```

### Import Engine Responsibilities

- Reads from job queue
- Dispatches to appropriate parser
- Chains normalize → validate → duplicate → conflict → merge stages
- Writes checkpoints after each record
- Emits structured logs
- Updates batch progress counters atomically

---

## 21. API Endpoints

### Import Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/import/upload` | Upload a raw file (CSV, XLSX, JSON, XML, PDF) |
| POST | `/api/import/batch` | Create a new import batch from URL |
| GET | `/api/import/batches` | List all import batches |
| GET | `/api/import/batches/:id` | Get batch status and progress |
| POST | `/api/import/batches/:id/pause` | Pause a running batch |
| POST | `/api/import/batches/:id/resume` | Resume a paused batch |
| POST | `/api/import/batches/:id/cancel` | Cancel a batch |
| DELETE | `/api/import/batches/:id/records` | Clear all staged records for a batch |

### Staged Record Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/import/staged` | List staged records (filterable by status, batch) |
| GET | `/api/import/staged/:id` | Get a single staged record |
| POST | `/api/import/staged/:id/reprocess` | Requeue a failed staged record |
| POST | `/api/import/staged/:id/skip` | Mark a record as intentionally skipped |

### Conflict Resolution Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/import/conflicts` | List open conflicts (with filters) |
| GET | `/api/import/conflicts/:id` | Get conflict detail with both versions |
| POST | `/api/import/conflicts/:id/accept` | Accept incoming assertion |
| POST | `/api/import/conflicts/:id/reject` | Reject incoming assertion |
| POST | `/api/import/conflicts/:id/escalate` | Escalate to senior curator |
| POST | `/api/import/conflicts/:id/duplicate` | Mark as known duplicate |

### Manual Entry Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/import/manual/person` | Manually enter a person record |
| POST | `/api/import/manual/match` | Manually enter a match record |
| POST | `/api/import/manual/career` | Manually enter a career association |
| POST | `/api/import/manual/event` | Manually enter a match event |

---

## 22. Admin UI

### Dashboard Views

**Batch Monitor**
- Live progress bar per batch
- Records/sec throughput
- Error rate
- Estimated completion time
- Pause / Resume / Cancel controls

**Staged Records Browser**
- Filter by: batch, status, source_type, entity_type, date range
- Sortable by: confidence, created_at, error count
- Inline raw payload viewer (JSON tree view)
- Bulk actions: reprocess, skip, mark duplicate

**Conflict Resolution Queue**
- Prioritized list (Critical → High → Normal → Low)
- Side-by-side diff view: Existing fact vs. Incoming claim
- Source credibility badges
- One-click Accept / Reject / Escalate
- Comment field for curator notes
- Assignment to specific curator

**Dead Letter Queue**
- Records that exhausted all retries
- Full error trace
- Manual requeue button
- Delete (with confirmation)

**Import Statistics**
- Records imported per day/week/month (chart)
- Success rate by source type
- Average time per stage
- Conflict rate by source
- Top curators by resolved conflicts

**Audit Trail**
- Searchable log of all production changes
- Filter by: table, operation, operator, date range
- Row diff viewer
- Rollback request button (creates correction task)

---

## 23. Idempotency Design

The entire pipeline is designed to be safely re-runnable:

- **SourceDocument:** Created with checksum gating. If checksum matches an existing document, no duplicate is created. The existing document's batch is referenced.
- **StagedRecord:** Created with `import_batch_id + md5(raw_payload)` uniqueness. Re-running the same file does not create new staged records.
- **FactAssertion:** Created only if `(source_document_id, match_event_id, assertion_type)` does not already exist as a non-retracted assertion.
- **Domain Entities:** Entity resolution prevents duplicate Person/Team/Venue creation. New fields are only added if NULL on existing entity.
- **Batch Re-run:** Re-running a completed batch is a no-op (all records are already in terminal states: Merged, Duplicate, Error, or Skipped).

---

## 24. Rollback Strategy

### Record-Level Rollback

Individual staged records can be rolled back by a curator:
1. Find the FactAssertion(s) created during merge
2. Set their `assertion_type` to `Retracted`
3. Restore the domain entity to its pre-merge state (if field was updated)
4. Reset staged record to `Pending` for re-evaluation

### Batch-Level Rollback

Full batch rollback (admin action):
1. Find all StagedRecords for the batch with `status = Merged`
2. For each: execute record-level rollback
3. For each created FactAssertion: mark Retracted
4. For each newly created domain entity (no prior assertions): soft delete
5. Reset batch status to `Cancelled`
6. Audit log records the rollback event with operator identity

### Rollback Safeguards

- Rollback blocked if any record in the batch has been cited by a newer FactAssertion from a different batch
- Rollback blocked if related match events have been used in confirmed awards or records
- Rollback of historical corrections requires senior curator approval
- All rollbacks are logged to the `audit_log` table

---

*This document is implementation-ready. All referenced database tables, columns, functions, and procedures exist in migrations 001–009.*

*Next steps: implement the import service skeleton, write parser unit tests, and scaffold the admin conflict resolution UI.*
