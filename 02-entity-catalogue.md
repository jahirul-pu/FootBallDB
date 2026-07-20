Viewed project-vision.md:105-151
Edited project-vision.md

# GeopoliticalEntity

## Purpose
Tracks countries, territories, and administrative regions over time to accurately reflect historical borders and names.

## Description
A nation, territory, or administrative region.

## Category
Reference

## Aggregate Root
Yes

## Lifecycle
Reference Data

## Ownership
Catalog / Geopolitics Context

## Dependencies
None

## Child Entities
None

## Related Entities
Person, Team, Venue, Organization, Competition

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Vital for correctly attributing nationalities and team locations based on when a match occurred (e.g., USSR vs. Russia).

---

# Venue

## Purpose
Tracks physical locations where matches are played, including name changes and capacity updates.

## Description
The physical stadium or location where a match occurs.

## Category
Reference

## Aggregate Root
Yes

## Lifecycle
Reference Data

## Ownership
Catalog / Geopolitics Context

## Dependencies
GeopoliticalEntity

## Child Entities
None

## Related Entities
Match, Team

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Important

## Notes
Addresses the "Emirates vs. Highbury" temporal trap. Allows matches in 1999 to correctly display "Highbury".

---

# Organization

## Purpose
Represents administrative bodies that govern football, organize competitions, and dictate rules.

## Description
A governing body or administrative organization (e.g., FIFA, UEFA, The FA).

## Category
Organization

## Aggregate Root
Yes

## Lifecycle
Reference Data

## Ownership
Identity & Lineage Context

## Dependencies
GeopoliticalEntity

## Child Entities
None

## Related Entities
Team, Competition

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Important

## Notes
Governs the sport and organizes competitions, distinct from Teams that compete.

---

# Team

## Purpose
Represents the sporting entity that competes in matches and employs personnel.

## Description
A footballing organization (Club or National Team).

## Category
Organization

## Aggregate Root
Yes

## Lifecycle
Reference Data

## Ownership
Identity & Lineage Context

## Dependencies
Organization, GeopoliticalEntity

## Child Entities
InstitutionalLineageNode, TeamRelationship

## Related Entities
CareerAssociation, Match, Roster

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Critical

## Notes
A Team is a continuous sporting identity. Its legal name and location may change over time, tracked via temporal value objects.

---

# InstitutionalLineageNode

## Purpose
Handles complex organizational splits, mergers, and franchise relocations to ensure historical continuity.

## Description
A node in a Directed Acyclic Graph (DAG) representing a team's legal/historical continuity.

## Category
Organization

## Aggregate Root
No

Parent: Team

## Lifecycle
Generated

## Ownership
Identity & Lineage Context

## Dependencies
Team

## Child Entities
None

## Related Entities
Team

## Temporal
Valid Time

## Mutability
Immutable

## Historical Importance
Important

## Notes
Ensures historical statistics are attributed to the legally and historically correct entity over decades (e.g., Steaua vs. FCSB).

---

# TeamRelationship

## Purpose
Tracks affiliate clubs, reserve teams, youth teams, and multi-club ownership networks.

## Description
Defines a connection between two Team entities.

## Category
Organization

## Aggregate Root
No

Parent: Team

## Lifecycle
Reference Data

## Ownership
Identity & Lineage Context

## Dependencies
Team

## Child Entities
None

## Related Entities
Team

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Supporting

## Notes
Prevents the system from treating affiliate teams (like Barcelona B) as entirely unrelated entities.

---

# Person

## Purpose
Provides a singular root identifier for anyone involved in football, regardless of their role.

## Description
A biological human being.

## Category
Identity

## Aggregate Root
Yes

## Lifecycle
Reference Data

## Ownership
Identity & Lineage Context

## Dependencies
GeopoliticalEntity

## Child Entities
PersonRelationship

## Related Entities
CareerAssociation, MatchAppearance, MatchOfficialAssignment, Award, Record

## Temporal
None

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Solves the "Player vs. Manager" trap. A single Person acts in multiple roles over their lifetime.

---

# PersonRelationship

## Purpose
Captures family ties and dynasties which are highly requested historical facts.

## Description
A familial or significant connection between two Persons.

## Category
Identity

## Aggregate Root
No

Parent: Person

## Lifecycle
Reference Data

## Ownership
Identity & Lineage Context

## Dependencies
Person

## Child Entities
None

## Related Entities
Person

## Temporal
None

## Mutability
Immutable

## Historical Importance
Supporting

## Notes
Heavily utilized by the graph database layer for complex queries (e.g., brothers playing together).

---

# CareerAssociation

## Purpose
Records contracts, transfers, loans, and roles (Player, Manager, Director).

## Description
A formal connection between a Person and a Team for a specific duration.

## Category
Career

## Aggregate Root
Yes

## Lifecycle
Historical Data

## Ownership
Career & Association Context

## Dependencies
Person, Team

## Child Entities
None

## Related Entities
None

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Encompasses the entire transfer market history, handling loan conditions and historical transfer fees.

---

# Competition

## Purpose
Groups all historical instances of a tournament under one conceptual umbrella.

## Description
The abstract concept of a tournament or league (e.g., "FIFA World Cup").

## Category
Competition

## Aggregate Root
Yes

## Lifecycle
Reference Data

## Ownership
Competition Context

## Dependencies
Organization, GeopoliticalEntity

## Child Entities
None

## Related Entities
Edition, Season, Award

## Temporal
None

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Contains categorical dimensions (Gender, Age Level, Tier) to support Women's and Youth football natively.

---

# Season

## Purpose
Provides a temporal container that cross-cuts competitions (e.g., "2023/2024").

## Description
A designated span of time during which football is played.

## Category
Competition

## Aggregate Root
Yes

## Lifecycle
Reference Data

## Ownership
Competition Context

## Dependencies
None

## Child Entities
None

## Related Entities
Edition, CareerAssociation

## Temporal
Valid Time

## Mutability
Immutable

## Historical Importance
Critical

## Notes
Crucial distinction from Edition. Teams operate across a Season; domestic cups operate as Editions within that Season.

---

# Edition

## Purpose
Binds a Competition to a specific Season or year, managing rules for a specific occurrence.

## Description
A specific, temporal instance of a Competition.

## Category
Competition

## Aggregate Root
Yes

## Lifecycle
Created Per Edition

## Ownership
Competition Context

## Dependencies
Competition, Season, GeopoliticalEntity

## Child Entities
Stage, Roster

## Related Entities
Team

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Tracks host nations and overarching edition-specific rules.

---

# Stage

## Purpose
Defines the format and rules for a subset of matches within an Edition.

## Description
A distinct phase within an Edition (e.g., "Group Stage", "League Phase").

## Category
Competition

## Aggregate Root
No

Parent: Edition

## Lifecycle
Created Per Edition

## Ownership
Competition Context

## Dependencies
Edition

## Child Entities
TieBreakerRule, StandingTable

## Related Entities
FixtureEvent, Team

## Temporal
None

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Polymorphic design supports extreme historical formats without schema changes.

---

# TieBreakerRule

## Purpose
Tracks historical rules applied to a specific Stage to resolve equal points.

## Description
A specific rule used to separate teams on equal points.

## Category
Competition

## Aggregate Root
No

Parent: Stage

## Lifecycle
Created Per Edition

## Ownership
Competition Context

## Dependencies
Stage

## Child Entities
None

## Related Entities
None

## Temporal
None

## Mutability
Immutable

## Historical Importance
Important

## Notes
Managed as an ordered list to dictate the exact historical sequence of tie-breaking calculations.

---

# StandingTable

## Purpose
Preserves historical league tables and captures arbitrary administrative points deductions.

## Description
A snapshot of team rankings, points, and derived metrics for a specific Stage.

## Category
Statistics

## Aggregate Root
No

Parent: Stage

## Lifecycle
Generated

## Ownership
Competition Context

## Dependencies
Stage, Team

## Child Entities
None

## Related Entities
None

## Temporal
Valid Time

## Mutability
Immutable

## Historical Importance
Important

## Notes
While mostly derivable from MatchEvents, explicit deductions require this to be a persisted historical snapshot.

---

# FixtureEvent

## Purpose
Allows scheduling and recording of matches that lack a strict Edition/Stage hierarchy.

## Description
A generic planned event for a football game, independent of competition constraints.

## Category
Match

## Aggregate Root
Yes

## Lifecycle
Created Per Match

## Ownership
Match Operations Context

## Dependencies
Team, Venue

## Child Entities
None

## Related Entities
Stage, Match

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Supporting

## Notes
A Match is the physical fulfillment of a FixtureEvent.

---

# Match

## Purpose
The central hub for all pitch-level historical facts, lineups, and events.

## Description
The actual atomic unit of gameplay that occurred.

## Category
Match

## Aggregate Root
Yes

## Lifecycle
Created Per Match

## Ownership
Match Operations Context

## Dependencies
FixtureEvent, Venue, Team

## Child Entities
MatchAppearance, MatchEvent, MatchOfficialAssignment

## Related Entities
Record

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Employs a specialized temporal value object to handle ambiguous historical kickoff times.

---

# Roster

## Purpose
Separates tournament squad registration from match-day lineups.

## Description
The official squad of Persons registered by a Team for a specific Edition.

## Category
Match

## Aggregate Root
No

Parent: Edition

## Lifecycle
Created Per Edition

## Ownership
Competition Context

## Dependencies
Edition, Team, Person

## Child Entities
None

## Related Entities
None

## Temporal
None

## Mutability
Mutable

## Historical Importance
Important

## Notes
Crucial for determining tournament medal winners for players who recorded zero match appearances.

---

# MatchAppearance

## Purpose
Records the starting XI, substitutes, and manager for a single game.

## Description
The presence of a Person on the pitch or bench for a specific Match.

## Category
Match

## Aggregate Root
No

Parent: Match

## Lifecycle
Created Per Match

## Ownership
Match Operations Context

## Dependencies
Match, Person, Team

## Child Entities
None

## Related Entities
None

## Temporal
None

## Mutability
Immutable

## Historical Importance
Critical

## Notes
Contains JerseyNumber, Position, and IsStarter flags.

---

# MatchOfficialAssignment

## Purpose
Tracks who officiated a match separately from the teams competing.

## Description
The assignment of a Referee, Linesman, or VAR to a Match.

## Category
Match

## Aggregate Root
No

Parent: Match

## Lifecycle
Created Per Match

## Ownership
Match Operations Context

## Dependencies
Match, Person

## Child Entities
None

## Related Entities
None

## Temporal
None

## Mutability
Immutable

## Historical Importance
Important

## Notes
Ensures officials are not conflated with team roster roles.

---

# MatchEvent

## Purpose
The fundamental building block of all pitch statistics.

## Description
An atomic occurrence during a match (Goal, Card, Substitution, VAR Decision).

## Category
Event

## Aggregate Root
No

Parent: Match

## Lifecycle
Created Per Match

## Ownership
Match Operations Context

## Dependencies
Match, Person

## Child Entities
None

## Related Entities
FactAssertion

## Temporal
Bi-Temporal

## Mutability
Append Only

## Historical Importance
Critical

## Notes
Uses MatchMinute (e.g., '45+2') for timing. Immutable and bi-temporal to handle historical retroactive corrections without losing audit trails.

---

# Award

## Purpose
Tracks formal honors given to players, managers, or teams.

## Description
An official accolade or prize (e.g., Golden Boot, Ballon d'Or, Team of the Tournament).

## Category
Historical

## Aggregate Root
Yes

## Lifecycle
Created Once

## Ownership
Honors & Records Context

## Dependencies
None

## Child Entities
None

## Related Entities
Person, Team, Competition, Edition

## Temporal
None

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Represents the award category itself. The historical assignment of the award to a Person or Team is managed via domain relationships linking the Award to an Edition and a Person/Team.

---

# Record

## Purpose
Preserves significant historical milestones distinct from standard derivable statistics.

## Description
A notable historical achievement (e.g., Fastest goal, Youngest captain, Most appearances).

## Category
Historical

## Aggregate Root
Yes

## Lifecycle
Generated

## Ownership
Honors & Records Context

## Dependencies
None

## Child Entities
None

## Related Entities
Person, Team, Match, Competition, Edition

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Important

## Notes
Records are historical artifacts with a temporal validity. When a record is broken, the Valid Time of the previous holder is closed, and a new record holding period begins.

---

---

# AwardRecipient

## Purpose
Records the historical fact of an award being given to a specific Person or Team.

## Description
The instance of a formal honor being bestowed.

## Category
Historical

## Aggregate Root
Yes

## Lifecycle
Historical Data

## Ownership
Honors & Records Context

## Dependencies
Award, Person, Team, Edition

## Child Entities
None

## Related Entities
None

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Critical

## Notes
Separates the concept of the Award (Reference Data) from the actual historical event of winning it.

---

# RecordHolder

## Purpose
Records the period of time during which a specific Person or Team held a historical record.

## Description
The instance of a milestone being held.

## Category
Historical

## Aggregate Root
Yes

## Lifecycle
Historical Data

## Ownership
Honors & Records Context

## Dependencies
Record, Person, Team, Match

## Child Entities
None

## Related Entities
None

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Important

## Notes
Records are broken. This entity maps the temporal boundaries of when a specific person/team held the record.

---

# SourceDocument

## Purpose
Traces every fact back to its original physical or digital source.

## Description
A distinct physical or digital origin of historical data.

## Category
Provenance

## Aggregate Root
Yes

## Lifecycle
Imported

## Ownership
Provenance & Curation Context

## Dependencies
None

## Child Entities
FactAssertion

## Related Entities
MediaAsset

## Temporal
None

## Mutability
Immutable

## Historical Importance
Important

## Notes
The absolute foundation of the encyclopedia's data credibility.

---

# FactAssertion

## Purpose
Records that a specific source claims an event happened, enabling dispute resolution.

## Description
A specific claim made by a SourceDocument.

## Category
Provenance

## Aggregate Root
No

Parent: SourceDocument

## Lifecycle
Imported

## Ownership
Provenance & Curation Context

## Dependencies
SourceDocument

## Child Entities
None

## Related Entities
MatchEvent, StagedRecord

## Temporal
Bi-Temporal

## Mutability
Immutable

## Historical Importance
Supporting

## Notes
Multiple conflicting FactAssertions can exist for a single real-world event.

---

# StagedRecord

## Purpose
Acts as a holding area for historical data before it is merged into the Core Domain.

## Description
Unverified raw data ingested from external sources.

## Category
Import

## Aggregate Root
Yes

## Lifecycle
Temporary

## Ownership
Provenance & Curation Context

## Dependencies
SourceDocument

## Child Entities
None

## Related Entities
FactAssertion

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Administrative

## Notes
A firewall that prevents dirty or contradictory data from polluting the single source of truth.

---

# ConflictResolutionTask

## Purpose
Requires a human curator or consensus algorithm to decide which conflicting historical fact is true.

## Description
A generated task when imported data conflicts with existing facts.

## Category
Import

## Aggregate Root
Yes

## Lifecycle
Temporary

## Ownership
Provenance & Curation Context

## Dependencies
StagedRecord

## Child Entities
None

## Related Entities
MatchEvent

## Temporal
None

## Mutability
Mutable

## Historical Importance
Administrative

## Notes
Workflow entity for dealing with contradictory historical records.

---

# MediaAsset

## Purpose
Manages rich media associated with historical records, handling copyright and licensing.

## Description
A photo, video, or digital document.

## Category
Media

## Aggregate Root
Yes

## Lifecycle
Imported

## Ownership
Media & Asset Context

## Dependencies
None

## Child Entities
None

## Related Entities
Person, Match, Edition, SourceDocument

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Supporting

## Notes
The temporal nature prevents anachronisms, such as displaying a modern photo of a retired player on a 1958 World Cup page.

---

# Alias

## Purpose
Allows searching, indexing, and displaying entities under their culturally common names.

## Description
An alternate name, nickname, or abbreviation for a core entity.

## Category
Reference

## Aggregate Root
No

Parent: Polymorphic Parent Entity

## Lifecycle
Reference Data

## Ownership
Catalog / Geopolitics Context

## Dependencies
Parent Entity

## Child Entities
None

## Related Entities
None

## Temporal
Valid Time

## Mutability
Mutable

## Historical Importance
Supporting

## Notes
Essential for search engine functionality and user experience, separating legal names from colloquial names.

---

# LocalizedText

## Purpose
Supports a globally accessible encyclopedia where names and titles exist in multiple alphabets and languages.

## Description
A translation or transliteration of a specific string into a target language, script, or locale.

## Category
Reference

## Aggregate Root
No

Parent: Polymorphic Parent Entity

## Lifecycle
Reference Data

## Ownership
Catalog / Geopolitics Context

## Dependencies
Parent Entity

## Child Entities
None

## Related Entities
None

## Temporal
None

## Mutability
Mutable

## Historical Importance
Supporting

## Notes
Extends primitive string fields into multi-dimensional localized records.

---

# Entity Hierarchy

### Reference & Identity
- GeopoliticalEntity
- Venue
- Person
- PersonRelationship
- Alias
- LocalizedText

### Organization
- Organization
- Team
- InstitutionalLineageNode
- TeamRelationship

### Competition
- Competition
- Season
- Edition
- Stage
- TieBreakerRule

### Career
- CareerAssociation

### Match & Event
- FixtureEvent
- Match
- Roster
- MatchAppearance
- MatchOfficialAssignment
- MatchEvent

### Historical & Honors
- Award
- Record
- AwardRecipient
- RecordHolder

### Statistics
- StandingTable

### Provenance & Import
- SourceDocument
- FactAssertion
- StagedRecord
- ConflictResolutionTask

### Media
- MediaAsset

---

# Aggregate Root Summary

- GeopoliticalEntity
- Venue
- Organization
- Team
- Person
- CareerAssociation
- Competition
- Season
- Edition
- FixtureEvent
- Match
- Award
- Record
- AwardRecipient
- RecordHolder
- SourceDocument
- StagedRecord
- ConflictResolutionTask
- MediaAsset

---

# Entity Dependency Graph

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

---

# Entity Lifecycle Summary

### Reference Data
- GeopoliticalEntity
- Venue
- Organization
- Team
- Person
- PersonRelationship
- TeamRelationship
- Competition
- Season
- Award
- Alias
- LocalizedText

### Historical Data
- CareerAssociation
- Edition
- Stage
- TieBreakerRule
- FixtureEvent
- Match
- Roster
- MatchAppearance
- MatchOfficialAssignment
- MatchEvent
- AwardRecipient
- RecordHolder

### Transactional Data
- SourceDocument
- FactAssertion
- MediaAsset

### Generated Data
- InstitutionalLineageNode
- StandingTable
- Record

### Temporary Data
- StagedRecord
- ConflictResolutionTask

---

# Design Validation

### Duplicated Responsibilities
- None detected. `FixtureEvent` and `Match` strictly decouple scheduling intent from actual gameplay. The separation of `Award` and `Record` accurately differentiates between subjective/formal honors and objective historical milestones.

### Single Responsibility Violations
- None detected. Enforcing Bounded Context ownership ensures that entities like `Person` remain purely organizational identities, whereas match-specific mechanics are handled entirely by `Match` and its children. 

### Possible Future Risks
- **Polymorphic Complexity:** `Alias` and `LocalizedText` attach polymorphically to multiple entities. Over time, queries joining across these boundaries could degrade read performance.
- **Bi-Temporal Overhead:** `MatchEvent` and `FactAssertion` use bi-temporal modeling. Managing Valid Time and Transaction Time concurrently is complex for developers and requires highly specialized database query patterns.

### Recommended Improvements
- Ensure that the Read Data Store (Elasticsearch/Redis) aggressively flattens `LocalizedText` and `Alias` entities into the primary document views (e.g., Player Profile Document) to mitigate polymorphic join costs during end-user search.
- Implement strict CQRS snapshotting for `StandingTable` and `Record` so the system never attempts to rebuild entire leagues or all-time historical records dynamically from 100 years of raw bi-temporal `MatchEvent` streams.