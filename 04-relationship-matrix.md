# Relationship Matrix

# GeopoliticalEntity → Venue

## Relationship Type
One-to-Many

## Parent Entity
GeopoliticalEntity

## Child Entity
Venue

## Cardinality
GeopoliticalEntity (1)
↓
Venue (0..*)

## Ownership
Venue (Aggregate Root)

## Lifecycle Dependency
Venue requires location.

## Delete Behavior
Restrict

Why: Destroys venue history.

## Historical Impact
Destroys venue history.

## Temporal Behavior
Valid Time

## Navigation
Child → Parent

## Notes
A venue always exists in a geopolitical entity.

---

# GeopoliticalEntity → Organization

## Relationship Type
One-to-Many

## Parent Entity
GeopoliticalEntity

## Child Entity
Organization

## Cardinality
GeopoliticalEntity (1)
↓
Organization (0..*)

## Ownership
Organization (Aggregate Root)

## Lifecycle Dependency
Organization requires jurisdiction.

## Delete Behavior
Restrict

Why: Destroys organization history.

## Historical Impact
Destroys organization history.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
Organizations act within regions.

---

# GeopoliticalEntity → Person (Birth)

## Relationship Type
One-to-Many

## Parent Entity
GeopoliticalEntity

## Child Entity
Person (Birth)

## Cardinality
GeopoliticalEntity (1)
↓
Person (0..*)

## Ownership
Person (Aggregate Root)

## Lifecycle Dependency
Person exists independently.

## Delete Behavior
Restrict

Why: Loses historical birthplace.

## Historical Impact
Loses historical birthplace.

## Temporal Behavior
Valid Time

## Navigation
Child → Parent

## Notes
A person is born in a state that existed at their birth time.

---

# GeopoliticalEntity → Team

## Relationship Type
One-to-Many

## Parent Entity
GeopoliticalEntity

## Child Entity
Team

## Cardinality
GeopoliticalEntity (1)
↓
Team (0..*)

## Ownership
Team (Aggregate Root)

## Lifecycle Dependency
Team needs a country.

## Delete Behavior
Restrict

Why: Destroys national affiliation.

## Historical Impact
Destroys national affiliation.

## Temporal Behavior
Valid Time

## Navigation
Child → Parent

## Notes
Crucial for determining team nation.

---

# Organization → Competition

## Relationship Type
One-to-Many

## Parent Entity
Organization

## Child Entity
Competition

## Cardinality
Organization (1)
↓
Competition (0..*)

## Ownership
Competition (Aggregate Root)

## Lifecycle Dependency
Competition requires governing body.

## Delete Behavior
Restrict

Why: Loses competition ownership.

## Historical Impact
Loses competition ownership.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
FIFA owns World Cup.

---

# Organization → Team

## Relationship Type
One-to-Many

## Parent Entity
Organization

## Child Entity
Team

## Cardinality
Organization (1)
↓
Team (0..*)

## Ownership
Team (Aggregate Root)

## Lifecycle Dependency
Team requires FA affiliation.

## Delete Behavior
Restrict

Why: Loses team governance.

## Historical Impact
Loses team governance.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
Clubs belong to FAs.

---

# Organization → Award

## Relationship Type
One-to-Many

## Parent Entity
Organization

## Child Entity
Award

## Cardinality
Organization (1)
↓
Award (0..*)

## Ownership
Award (Aggregate Root)

## Lifecycle Dependency
Award needs awarding body.

## Delete Behavior
Restrict

Why: Loses award history.

## Historical Impact
Loses award history.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
FIFA awards Golden Boot.

---

# Team → TeamRelationship

## Relationship Type
Self-Referencing

## Parent Entity
Team

## Child Entity
TeamRelationship

## Cardinality
Team (1)
↓
TeamRelationship (0..*)

## Ownership
Team (Aggregate Root)

## Lifecycle Dependency
Relationship requires both teams.

## Delete Behavior
Cascade

Why: Destroys relationship history.

## Historical Impact
Destroys relationship history.

## Temporal Behavior
Valid Time

## Navigation
Both

## Notes
Parent/Child affiliate clubs.

---

# Team → InstitutionalLineageNode

## Relationship Type
One-to-Many

## Parent Entity
Team

## Child Entity
InstitutionalLineageNode

## Cardinality
Team (1)
↓
InstitutionalLineageNode (0..*)

## Ownership
Team (Aggregate Root)

## Lifecycle Dependency
Lineage requires team.

## Delete Behavior
Cascade

Why: Destroys structural history.

## Historical Impact
Destroys structural history.

## Temporal Behavior
None

## Navigation
Both

## Notes
Mergers and franchise splits.

---

# Team → CareerAssociation

## Relationship Type
One-to-Many

## Parent Entity
Team

## Child Entity
CareerAssociation

## Cardinality
Team (1)
↓
CareerAssociation (0..*)

## Ownership
CareerAssociation (Aggregate Root)

## Lifecycle Dependency
Association requires team.

## Delete Behavior
Restrict

Why: Destroys transfer history.

## Historical Impact
Destroys transfer history.

## Temporal Behavior
Valid Time

## Navigation
Both

## Notes
A player's contract with a club.

---

# Team → Roster

## Relationship Type
One-to-Many

## Parent Entity
Team

## Child Entity
Roster

## Cardinality
Team (1)
↓
Roster (0..*)

## Ownership
Edition (Aggregate Root)

## Lifecycle Dependency
Roster requires team.

## Delete Behavior
Restrict

Why: Destroys tournament squads.

## Historical Impact
Destroys tournament squads.

## Temporal Behavior
None

## Navigation
Both

## Notes
Squad for a specific Edition.

---

# Person → PersonRelationship

## Relationship Type
Self-Referencing

## Parent Entity
Person

## Child Entity
PersonRelationship

## Cardinality
Person (1)
↓
PersonRelationship (0..*)

## Ownership
Person (Aggregate Root)

## Lifecycle Dependency
Requires both persons.

## Delete Behavior
Cascade

Why: Loses family ties.

## Historical Impact
Loses family ties.

## Temporal Behavior
None

## Navigation
Both

## Notes
Brothers, Fathers, etc.

---

# Person → CareerAssociation

## Relationship Type
One-to-Many

## Parent Entity
Person

## Child Entity
CareerAssociation

## Cardinality
Person (1)
↓
CareerAssociation (0..*)

## Ownership
CareerAssociation (Aggregate Root)

## Lifecycle Dependency
Association requires person.

## Delete Behavior
Restrict

Why: Destroys career history.

## Historical Impact
Destroys career history.

## Temporal Behavior
Valid Time

## Navigation
Both

## Notes
Player/Manager contracts.

---

# Person → MatchAppearance

## Relationship Type
One-to-Many

## Parent Entity
Person

## Child Entity
MatchAppearance

## Cardinality
Person (1)
↓
MatchAppearance (0..*)

## Ownership
Match (Aggregate Root)

## Lifecycle Dependency
Appearance requires person.

## Delete Behavior
Restrict

Why: Destroys match lineups.

## Historical Impact
Destroys match lineups.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
Player on the pitch.

---

# Person → MatchOfficialAssignment

## Relationship Type
One-to-Many

## Parent Entity
Person

## Child Entity
MatchOfficialAssignment

## Cardinality
Person (1)
↓
MatchOfficialAssignment (0..*)

## Ownership
Match (Aggregate Root)

## Lifecycle Dependency
Assignment requires person.

## Delete Behavior
Restrict

Why: Destroys referee history.

## Historical Impact
Destroys referee history.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
Referee assignments.

---

# Competition → Edition

## Relationship Type
One-to-Many

## Parent Entity
Competition

## Child Entity
Edition

## Cardinality
Competition (1)
↓
Edition (0..*)

## Ownership
Edition (Aggregate Root)

## Lifecycle Dependency
Edition requires Competition.

## Delete Behavior
Restrict

Why: Destroys all tournament history.

## Historical Impact
Destroys all tournament history.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
World Cup -> 2022 World Cup.

---

# Season → Edition

## Relationship Type
One-to-Many

## Parent Entity
Season

## Child Entity
Edition

## Cardinality
Season (1)
↓
Edition (0..*)

## Ownership
Edition (Aggregate Root)

## Lifecycle Dependency
Edition requires Season context.

## Delete Behavior
Restrict

Why: Destroys temporal grouping.

## Historical Impact
Destroys temporal grouping.

## Temporal Behavior
None

## Navigation
Both

## Notes
2023/2024 -> UCL Edition.

---

# Edition → Stage

## Relationship Type
One-to-Many

## Parent Entity
Edition

## Child Entity
Stage

## Cardinality
Edition (1)
↓
Stage (1..*)

## Ownership
Edition (Aggregate Root)

## Lifecycle Dependency
Stage cannot exist without Edition.

## Delete Behavior
Cascade

Why: Destroys tournament structure.

## Historical Impact
Destroys tournament structure.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
Group Stage, Knockout Stage.

---

# Edition → Roster

## Relationship Type
One-to-Many

## Parent Entity
Edition

## Child Entity
Roster

## Cardinality
Edition (1)
↓
Roster (0..*)

## Ownership
Edition (Aggregate Root)

## Lifecycle Dependency
Roster cannot exist without Edition.

## Delete Behavior
Cascade

Why: Destroys squad history.

## Historical Impact
Destroys squad history.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
Tournament squads.

---

# Stage → TieBreakerRule

## Relationship Type
One-to-Many

## Parent Entity
Stage

## Child Entity
TieBreakerRule

## Cardinality
Stage (1)
↓
TieBreakerRule (1..*)

## Ownership
Edition (Aggregate Root)

## Lifecycle Dependency
Rule cannot exist without Stage.

## Delete Behavior
Cascade

Why: Destroys point logic.

## Historical Impact
Destroys point logic.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
Goal diff, H2H.

---

# Stage → StandingTable

## Relationship Type
One-to-Many

## Parent Entity
Stage

## Child Entity
StandingTable

## Cardinality
Stage (1)
↓
StandingTable (1..*)

## Ownership
Edition (Aggregate Root)

## Lifecycle Dependency
Table requires Stage.

## Delete Behavior
Cascade

Why: Destroys historic league tables.

## Historical Impact
Destroys historic league tables.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
League standings.

---

# Stage → FixtureEvent

## Relationship Type
One-to-Many

## Parent Entity
Stage

## Child Entity
FixtureEvent

## Cardinality
Stage (1)
↓
FixtureEvent (0..*)

## Ownership
Match (Aggregate Root)

## Lifecycle Dependency
Fixture needs Stage context.

## Delete Behavior
Restrict

Why: Loses match context.

## Historical Impact
Loses match context.

## Temporal Behavior
None

## Navigation
Both

## Notes
Scheduled group matches.

---

# FixtureEvent → Match

## Relationship Type
One-to-One

## Parent Entity
FixtureEvent

## Child Entity
Match

## Cardinality
FixtureEvent (1)
↓
Match (0..1)

## Ownership
Match (Aggregate Root)

## Lifecycle Dependency
Match requires Fixture intent.

## Delete Behavior
Restrict

Why: Destroys match reality.

## Historical Impact
Destroys match reality.

## Temporal Behavior
None

## Navigation
Both

## Notes
The plan vs the execution.

---

# Match → MatchAppearance

## Relationship Type
One-to-Many

## Parent Entity
Match

## Child Entity
MatchAppearance

## Cardinality
Match (1)
↓
MatchAppearance (11..*)

## Ownership
Match (Aggregate Root)

## Lifecycle Dependency
Appearance requires Match.

## Delete Behavior
Cascade

Why: Destroys lineups.

## Historical Impact
Destroys lineups.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
The players involved.

---

# Match → MatchOfficialAssignment

## Relationship Type
One-to-Many

## Parent Entity
Match

## Child Entity
MatchOfficialAssignment

## Cardinality
Match (1)
↓
MatchOfficialAssignment (1..*)

## Ownership
Match (Aggregate Root)

## Lifecycle Dependency
Official requires Match.

## Delete Behavior
Cascade

Why: Destroys referee records.

## Historical Impact
Destroys referee records.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
The referees involved.

---

# Match → MatchEvent

## Relationship Type
One-to-Many

## Parent Entity
Match

## Child Entity
MatchEvent

## Cardinality
Match (1)
↓
MatchEvent (0..*)

## Ownership
Match (Aggregate Root)

## Lifecycle Dependency
Event requires Match.

## Delete Behavior
Cascade

Why: Destroys pitch statistics.

## Historical Impact
Destroys pitch statistics.

## Temporal Behavior
Bi-Temporal

## Navigation
Parent → Child

## Notes
Goals, cards, subs.

---

# MatchEvent → FactAssertion

## Relationship Type
One-to-Many

## Parent Entity
MatchEvent

## Child Entity
FactAssertion

## Cardinality
MatchEvent (1)
↓
FactAssertion (1..*)

## Ownership
Provenance Context

## Lifecycle Dependency
Assertion validates Event.

## Delete Behavior
Cascade

Why: Destroys provenance.

## Historical Impact
Destroys provenance.

## Temporal Behavior
Bi-Temporal

## Navigation
Child → Parent

## Notes
Citation for the goal.

---

# SourceDocument → FactAssertion

## Relationship Type
One-to-Many

## Parent Entity
SourceDocument

## Child Entity
FactAssertion

## Cardinality
SourceDocument (1)
↓
FactAssertion (0..*)

## Ownership
Provenance Context

## Lifecycle Dependency
Fact requires Source.

## Delete Behavior
Restrict

Why: Destroys citation integrity.

## Historical Impact
Destroys citation integrity.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
The book claiming the goal.

---

# StagedRecord → ConflictResolutionTask

## Relationship Type
One-to-One

## Parent Entity
StagedRecord

## Child Entity
ConflictResolutionTask

## Cardinality
StagedRecord (1)
↓
ConflictResolutionTask (0..1)

## Ownership
Provenance Context

## Lifecycle Dependency
Task requires Staged data.

## Delete Behavior
Cascade

Why: Loses workflow state.

## Historical Impact
Loses workflow state.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
Manual review of bad data.

---

# Award → AwardRecipient

## Relationship Type
One-to-Many

## Parent Entity
Award

## Child Entity
AwardRecipient

## Cardinality
Award (1)
↓
AwardRecipient (0..*)

## Ownership
AwardRecipient (Aggregate Root)

## Lifecycle Dependency
Recipient needs Award.

## Delete Behavior
Restrict

Why: Destroys honors history.

## Historical Impact
Destroys honors history.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
Golden Boot -> Mbappe.

---

# Record → RecordHolder

## Relationship Type
One-to-Many

## Parent Entity
Record

## Child Entity
RecordHolder

## Cardinality
Record (1)
↓
RecordHolder (0..*)

## Ownership
RecordHolder (Aggregate Root)

## Lifecycle Dependency
Holder needs Record.

## Delete Behavior
Restrict

Why: Destroys milestone history.

## Historical Impact
Destroys milestone history.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
Most Goals -> Fontaine.

---

# Polymorphic → Alias

## Relationship Type
Polymorphic

## Parent Entity
Polymorphic

## Child Entity
Alias

## Cardinality
Entity (1)
↓
Alias (0..*)

## Ownership
Parent Entity

## Lifecycle Dependency
Alias needs parent.

## Delete Behavior
Cascade

Why: Minor impact.

## Historical Impact
Minor impact.

## Temporal Behavior
Valid Time

## Navigation
Parent → Child

## Notes
Nicknames for teams/persons.

---

# Polymorphic → LocalizedText

## Relationship Type
Polymorphic

## Parent Entity
Polymorphic

## Child Entity
LocalizedText

## Cardinality
Entity (1)
↓
LocalizedText (1..*)

## Ownership
Parent Entity

## Lifecycle Dependency
Text needs parent.

## Delete Behavior
Cascade

Why: Breaks translations.

## Historical Impact
Breaks translations.

## Temporal Behavior
None

## Navigation
Parent → Child

## Notes
Translated names.

---

# Polymorphic → MediaAsset

## Relationship Type
Polymorphic

## Parent Entity
Polymorphic

## Child Entity
MediaAsset

## Cardinality
Entity (1)
↓
MediaAsset (0..*)

## Ownership
MediaAsset (Aggregate Root)

## Lifecycle Dependency
Asset can be detached.

## Delete Behavior
Detach

Why: Loses photos.

## Historical Impact
Loses photos.

## Temporal Behavior
Valid Time

## Navigation
Both

## Notes
Photos of players/matches.

---

# Polymorphic → AwardRecipient

## Relationship Type
Polymorphic

## Parent Entity
Polymorphic

## Child Entity
AwardRecipient

## Cardinality
Entity (1)
↓
AwardRecipient (0..*)

## Ownership
AwardRecipient (Aggregate Root)

## Lifecycle Dependency
Recipient requires Person/Team.

## Delete Behavior
Restrict

Why: Destroys historical honor.

## Historical Impact
Destroys historical honor.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
Award won by Team or Person.

---

# Polymorphic → RecordHolder

## Relationship Type
Polymorphic

## Parent Entity
Polymorphic

## Child Entity
RecordHolder

## Cardinality
Entity (1)
↓
RecordHolder (0..*)

## Ownership
RecordHolder (Aggregate Root)

## Lifecycle Dependency
Holder requires Person/Team.

## Delete Behavior
Restrict

Why: Destroys historical record.

## Historical Impact
Destroys historical record.

## Temporal Behavior
None

## Navigation
Child → Parent

## Notes
Record held by Team or Person.

---

# Aggregate Ownership Tree

GeopoliticalEntity
 ├── (none directly owned; referenced heavily)

Organization
 ├── (none directly owned)

Venue
 ├── (none directly owned)

Team
 ├── InstitutionalLineageNode
 ├── TeamRelationship

Person
 ├── PersonRelationship

Competition
 ├── (none directly owned)

Season
 ├── (none directly owned)

Edition
 ├── Stage
 │     ├── TieBreakerRule
 │     ├── StandingTable
 ├── Roster

Match
 ├── FixtureEvent (conceptually mapped)
 ├── MatchAppearance
 ├── MatchOfficialAssignment
 ├── MatchEvent

CareerAssociation
 ├── (none directly owned)

Award
 ├── (none directly owned)

AwardRecipient
 ├── (none directly owned)

Record
 ├── (none directly owned)

RecordHolder
 ├── (none directly owned)

SourceDocument
 ├── FactAssertion

StagedRecord
 ├── ConflictResolutionTask

MediaAsset
 ├── (none directly owned)

---

# Many-to-Many Relationships

- **Person ↔ Team (Career):** Resolved via `CareerAssociation` (Aggregate Root). We need to track salaries, roles, and temporal validity (contract duration), requiring a dedicated historical aggregate.
- **Match ↔ Person (Appearance):** Resolved via `MatchAppearance` (Child Entity). A person can play many matches; a match has many people. This join entity holds specific match-day data like `ShirtNumber` and `Position`.
- **Match ↔ Person (Official):** Resolved via `MatchOfficialAssignment` (Child Entity). 
- **Edition ↔ Person (Squad):** Resolved via `Roster`. Squad registration is separate from match appearances.

---

# Self-Referencing Relationships

### Team → TeamRelationship
**Prevention of Cycles:** Implemented at the application layer via a Directed Acyclic Graph (DAG) validation check during insertion. A team cannot be a parent of itself, nor can an affiliate be a parent of its own parent.

### Person → PersonRelationship
**Prevention of Cycles:** Enforced at the application layer. Symmetrical relationships (e.g., Brother) are modeled consistently to avoid infinite recursion. A person cannot relate to themselves.

### Team → InstitutionalLineageNode
**Prevention of Cycles:** Forms a strict DAG. ValidTime rules ensure that a successor team's foundation date must be >= the predecessor's dissolution or change date.

---

# Polymorphic Relationships

### Alias
Attaches to `Person`, `Team`, `Venue`, `Competition`. Polymorphism is appropriate because the structure of a string alias is identical across all domain entities, preventing four identical `TeamAlias`, `PersonAlias` tables.

### LocalizedText
Attaches globally. Creating a localized mapping table for every single string column on every single entity would result in database explosion. A polymorphic ledger solves this cleanly.

### MediaAsset
Attaches to `Person` (headshots), `Match` (highlights), `Venue` (stadium photos). The asset management context doesn't care what domain entity it represents.

### AwardRecipient & RecordHolder
Attaches to `Person` or `Team`. A Golden Boot goes to a Person. A Fair Play award goes to a Team. Creating separate `PersonAward` and `TeamAward` entities violates DRY principles when the historical fact structure is identical.

---

# Referential Integrity Rules

- **Child Entities (e.g., MatchEvent, MatchAppearance, Stage, TieBreakerRule):** Cannot exist without their Aggregate Root. Deleting the parent cascades to the children.
- **Transactional/Historical Records (Match, CareerAssociation, AwardRecipient):** Required parents (e.g., Person, Team, Venue). Cannot exist without them. If a Team is referenced by a historical record, the Team CANNOT be deleted (Restrict).
- **Optional Parents:** `Venue.LocationCoordinate` (GeopoliticalId), `Person.BirthGeopoliticalId` (often unknown for obscure historical players).

---

# Dependency Graph

To seed an empty environment, the following creation order is optimal:

GeopoliticalEntity
↓
Organization
↓
Venue
↓
Team
↓
Person
↓
Competition
↓
Season
↓
Edition
↓
Stage
↓
FixtureEvent
↓
Match
↓
MatchEvent

**Parallel Tracks:**
- `Award` and `Record` can be created anytime after `Organization`.
- `SourceDocument` must exist before `FactAssertion`.

---

# Circular Dependency Check

**Identified Circular Risks:**
1. **Match ↔ FixtureEvent:** A Match fulfills a FixtureEvent, but a FixtureEvent might explicitly reference the Match it resulted in for quick lookup.
   *Resolution:* Enforce uni-directional dependency. `Match` points to `FixtureEvent`. `FixtureEvent` does not know about the `Match`.
2. **Team ↔ InstitutionalLineageNode:** Node references original and successor Teams, and Teams might want to list their nodes.
   *Resolution:* Uni-directional. The Node relies on the Team IDs. Queries derive the lineage.

---

# Design Validation

- **Orphan Risks:** Addressed by aggressive use of `Cascade` on Aggregate Root children (e.g., `MatchEvent`).
- **Ownership Violations:** Minimized by decoupling `Award` (Concept) from `AwardRecipient` (Event).
- **Aggregate Leaks:** Bounded Context boundaries are preserved. `CareerAssociation` acts as its own root rather than bloating the `Person` aggregate.
- **Excessive Coupling:** Addressed by keeping Bounded Contexts isolated. References across boundaries are strictly by ID (e.g., `GeopoliticalId`), never direct object nesting.
- **Normalization Issues:** The model is in 3NF. Historical facts are immutable, preventing update anomalies.

*No architectural redesigns required. The relationship graph is robust and strictly adheres to DDD principles.*
