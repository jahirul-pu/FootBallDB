# Domain Architecture

> [!IMPORTANT]
> **Architecture Status:** Frozen  
> **Version:** 1.0  
> **Date:** 2026-07-20  
> *From this point on, every change must happen through a formal design decision recorded in CHANGELOG.md.*

## Architecture Decisions (To Resolve During Implementation)

### Polymorphic Associations
Decide between:
- EntityType + EntityId
- Separate junction tables

### Soft Delete Policy
Prefer soft delete/archive over physical cascade deletes for historical data.

---

Provenance & Source Entities
Entity Name: SourceDocument

Description: A distinct physical or digital origin of historical data.

Purpose: To trace every fact back to its original source (e.g., FIFA 1950 Match Report PDF, Newspaper Archive, RSSSF).

Parent Entity (if any): None

Child Entities: FactAssertion

Related Entities: MediaAsset

Aggregate Root: Yes

Is Temporal?: No

Is Immutable?: Yes (The existence of the source document is immutable; metadata may be appended)

Lifecycle: Created during data ingestion. Never deleted.

Ownership: Provenance & Curation Context

Notes: The absolute foundation of the encyclopedia's credibility.

Entity Name: FactAssertion

Description: A specific claim made by a SourceDocument.

Purpose: To record that a specific source claims an event happened, allowing for dispute resolution (e.g., "Source X claims Pelé scored in the 14th minute").

Parent Entity (if any): SourceDocument

Child Entities: None

Related Entities: MatchEvent, StagedRecord

Aggregate Root: No

Is Temporal?: Yes (Includes AssertionTime denoting when the source published the claim)

Is Immutable?: Yes

Lifecycle: Appended when parsing a source. Never modified.

Ownership: Provenance & Curation Context

Notes: Multiple conflicting FactAssertions can exist for a single real-world event.

Identity & Reference Entities
Entity Name: GeopoliticalEntity

Description: A nation, territory, or administrative region.

Purpose: Tracks countries and territories over time, handling the birth and death of nations (e.g., USSR, Yugoslavia).

Parent Entity (if any): None

Child Entities: None

Related Entities: Person, Team, Venue

Aggregate Root: Yes

Is Temporal?: Yes (Has ValidFrom and ValidTo boundary dates)

Is Immutable?: No

Lifecycle: Created to represent a state. Ends when the nation dissolves or splits.

Ownership: Catalog / Geopolitics Context

Notes: Vital for accurately displaying a player's nationality or a team's country at the specific time a match occurred.

Entity Name: Venue

Description: The physical stadium or location where a match occurs.

Purpose: Tracks the location and naming rights of a stadium throughout history.

Parent Entity (if any): None

Child Entities: None

Related Entities: Match, GeopoliticalEntity

Aggregate Root: Yes

Is Temporal?: Yes (Stadium names and capacities change frequently)

Is Immutable?: No

Lifecycle: Created when a stadium opens, updated during renovations, marked closed upon demolition.

Ownership: Catalog / Geopolitics Context

Notes: Addresses the "Emirates vs. Highbury" temporal trap. Allows matches in 1999 to correctly display "Highbury".

Organization Entities
Entity Name: Team

Description: A footballing organization (Club or National Team).

Purpose: Represents the sporting entity that competes in matches and employs people.

Parent Entity (if any): None

Child Entities: InstitutionalLineageNode, TeamRelationship

Related Entities: CareerAssociation, Match, Roster, GeopoliticalEntity

Aggregate Root: Yes

Is Temporal?: Yes (Utilizes Temporal Value Objects for names and badges)

Is Immutable?: No

Lifecycle: Created upon foundation. May be marked dissolved or merged.

Ownership: Identity & Lineage Context

Notes: A Team is a continuous sporting identity, but its legal name and location can change.

Entity Name: InstitutionalLineageNode

Description: A node in a Directed Acyclic Graph (DAG) representing a team's legal/historical continuity.

Purpose: Handles complex organizational splits, mergers, and franchise relocations (e.g., Steaua București vs. FCSB).

Parent Entity (if any): Team

Child Entities: None

Related Entities: Team

Aggregate Root: No

Is Temporal?: Yes

Is Immutable?: Yes

Lifecycle: Appended strictly when a major structural legal change occurs to a Team entity.

Ownership: Identity & Lineage Context

Notes: Ensures historical statistics are attributed to the legally and historically correct entity over decades.

Entity Name: TeamRelationship

Description: Defines a connection between two Team entities.

Purpose: Tracks affiliate clubs, reserve teams, youth teams, and multi-club ownership networks.

Parent Entity (if any): Team

Child Entities: None

Related Entities: Team

Aggregate Root: No

Is Temporal?: Yes (Partnerships and affiliations begin and end)

Is Immutable?: No

Lifecycle: Created when a partnership starts, closed when it ends.

Ownership: Identity & Lineage Context

Notes: Prevents the system from treating "Barcelona B" as an entirely unrelated entity to "Barcelona".

People Entities
Entity Name: Person

Description: A biological human being.

Purpose: The singular root identifier for anyone involved in football, regardless of their role.

Parent Entity (if any): None

Child Entities: PersonRelationship

Related Entities: CareerAssociation, MatchAppearance, MatchOfficialAssignment, GeopoliticalEntity

Aggregate Root: Yes

Is Temporal?: No (The biological identity is fixed)

Is Immutable?: No (CRUD updates for correcting historical data like birthplaces or multi-lingual aliases)

Lifecycle: Created upon first historical appearance. Persists indefinitely.

Ownership: Identity & Lineage Context

Notes: Solves the "Player vs. Manager" entity trap. One human, one ID.

Entity Name: PersonRelationship

Description: A familial or significant connection between two Persons.

Purpose: To capture dynasties and family ties (e.g., brothers, father/son) which are highly requested historical facts.

Parent Entity (if any): Person

Child Entities: None

Related Entities: Person

Aggregate Root: No

Is Temporal?: No

Is Immutable?: Yes

Lifecycle: Created upon discovery of the relationship.

Ownership: Identity & Lineage Context

Notes: Heavily utilized by the Graph database layer for complex relationship querying.

Entity Name: CareerAssociation

Description: A formal connection between a Person and a Team for a specific duration.

Purpose: Records contracts, transfers, loans, and roles (Player, Manager, Director).

Parent Entity (if any): None

Child Entities: None

Related Entities: Person, Team

Aggregate Root: Yes

Is Temporal?: Yes (ValidFrom, ValidTo dates)

Is Immutable?: No (Contracts get extended, changing the ValidTo date)

Lifecycle: Created upon transfer/signing. Updated on renewal. Closed upon departure or retirement.

Ownership: Career & Association Context

Notes: Encompasses the entire transfer market history, including loan conditions and historical transfer fees.

Competition Entities
Entity Name: Competition

Description: The abstract concept of a tournament or league (e.g., "FIFA World Cup").

Purpose: Groups all historical instances of a tournament under one conceptual umbrella.

Parent Entity (if any): None

Child Entities: None

Related Entities: Edition, Season, GeopoliticalEntity

Aggregate Root: Yes

Is Temporal?: No

Is Immutable?: No

Lifecycle: Created when a new tournament concept is invented.

Ownership: Competition Context

Notes: Contains categorical dimensions (Gender, Age Level, Tier) to support Women's and Youth football natively.

Entity Name: Season

Description: A designated span of time during which football is played.

Purpose: Provides a temporal container that cross-cuts competitions (e.g., "2023/2024").

Parent Entity (if any): None

Child Entities: None

Related Entities: Edition, CareerAssociation

Aggregate Root: Yes

Is Temporal?: Yes

Is Immutable?: Yes (The definition of a season is fixed once established)

Lifecycle: Created annually based on regional calendar or cross-calendar systems.

Ownership: Competition Context

Notes: Crucial distinction from Edition. Teams operate across a Season; domestic cups operate as Editions within that Season.

Entity Name: Edition

Description: A specific, temporal instance of a Competition.

Purpose: Binds a Competition to a specific Season or year (e.g., "2022 FIFA World Cup").

Parent Entity (if any): Competition

Child Entities: Stage, Roster

Related Entities: Season, Team

Aggregate Root: Yes

Is Temporal?: Yes

Is Immutable?: No

Lifecycle: Created before the tournament begins. Closed after the final match.

Ownership: Competition Context

Notes: Tracks host nations and overarching edition-specific rules.

Entity Name: Stage

Description: A distinct phase within an Edition (e.g., "Group Stage", "League Phase").

Purpose: Defines the format and rules for a subset of matches within an Edition.

Parent Entity (if any): Edition

Child Entities: TieBreakerRule, StandingTable

Related Entities: FixtureEvent, Team

Aggregate Root: No

Is Temporal?: No

Is Immutable?: No

Lifecycle: Created when configuring an Edition's format.

Ownership: Competition Context

Notes: Polymorphic design supports extreme historical formats without schema changes (e.g., Swiss Systems vs. Round Robins).

Entity Name: TieBreakerRule

Description: A specific rule used to separate teams on equal points.

Purpose: Tracks historical rules (Away Goals, Goal Difference, Head-to-Head) applied to a specific Stage.

Parent Entity (if any): Stage

Child Entities: None

Related Entities: None

Aggregate Root: No

Is Temporal?: No (It is tied intrinsically to a historical Stage configuration)

Is Immutable?: Yes

Lifecycle: Configured simultaneously with Stage creation.

Ownership: Competition Context

Notes: Managed as an ordered list to dictate the exact historical sequence of tie-breaking calculations.

Statistics & Historical Entities
Entity Name: StandingTable
Description: A snapshot of team rankings, points, and derived metrics for a specific Stage.
Purpose: Preserves historical league tables and captures arbitrary points deductions that cannot be derived from match events (e.g., Calciopoli).
Parent Entity (if any): Stage
Child Entities: None
Related Entities: Team
Aggregate Root: No
Is Temporal?: Yes (Snapshots can be taken per matchweek)
Is Immutable?: Yes (A published historical snapshot is immutable)
Lifecycle: Generated periodically or at the end of a stage.
Ownership: Competition Context
Notes: While statistics are largely derived, explicit administrative points deductions require this to be a persisted historical entity.
Match Entities
Entity Name: FixtureEvent

Description: A generic planned event for a football game, independent of competition constraints.

Purpose: Allows scheduling and historical recording of matches that lack a strict Edition/Stage hierarchy (e.g., International Friendlies).

Parent Entity (if any): None

Child Entities: None

Related Entities: Stage, Match

Aggregate Root: Yes

Is Temporal?: Yes

Is Immutable?: No

Lifecycle: Created when a game is scheduled.

Ownership: Match Operations Context

Notes: A Match is the physical fulfillment of a FixtureEvent.

Entity Name: Match

Description: The actual atomic unit of gameplay that occurred.

Purpose: The central hub for all pitch-level historical facts, lineups, and events.

Parent Entity (if any): None

Child Entities: MatchAppearance, MatchEvent, MatchOfficialAssignment

Related Entities: FixtureEvent, Venue, Team

Aggregate Root: Yes

Is Temporal?: Yes

Is Immutable?: No (Post-match tribunal investigations can alter match status or award forfeit wins)

Lifecycle: Instantiated at kickoff. Marked completed upon final whistle.

Ownership: Match Operations Context

Notes: Employs a specialized FuzzyDate value object to handle 19th-century matches where the exact kickoff timezone is lost to history.

Entity Name: Roster

Description: The official squad of Persons registered by a Team for a specific Edition.

Purpose: Separates tournament squad registration (e.g., the 26-man World Cup squad) from match-day lineups.

Parent Entity (if any): Edition

Child Entities: None

Related Entities: Team, Person

Aggregate Root: No

Is Temporal?: No

Is Immutable?: No (Injury replacements can alter it before strict deadlines)

Lifecycle: Created prior to Edition start, finalized by competition registration deadlines.

Ownership: Competition Context

Notes: Crucial for determining who technically "won" a tournament medal even if they played 0 match minutes.

Entity Name: MatchAppearance

Description: The presence of a Person on the pitch or bench for a specific Match.

Purpose: Records the starting XI, substitutes, and manager for a single game.

Parent Entity (if any): Match

Child Entities: None

Related Entities: Person, Team

Aggregate Root: No

Is Temporal?: No

Is Immutable?: Yes (Once a match is historical, appearances are fixed facts)

Lifecycle: Recorded before kickoff (Starting XI) and during the match (Substitutes).

Ownership: Match Operations Context

Notes: Contains JerseyNumber, Position, and IsStarter flags.

Entity Name: MatchOfficialAssignment

Description: The assignment of a Referee, Linesman, or VAR to a Match.

Purpose: Tracks who officiated a match separately from the teams competing.

Parent Entity (if any): Match

Child Entities: None

Related Entities: Person

Aggregate Root: No

Is Temporal?: No

Is Immutable?: Yes

Lifecycle: Assigned prior to match, locked after completion.

Ownership: Match Operations Context

Notes: Ensures officials are tracked correctly without conflating them with team roster roles.

Event Entities
Entity Name: MatchEvent
Description: An atomic occurrence during a match (Goal, Card, Substitution, VAR Decision).
Purpose: The fundamental building block of all statistics. Implements a Bi-Temporal Ledger.
Parent Entity (if any): Match
Child Entities: None
Related Entities: Person (Actor), FactAssertion (Provenance)
Aggregate Root: No
Is Temporal?: Yes (Records EventTime via MatchMinute AND AssertionTime)
Is Immutable?: Yes
Lifecycle: Appended strictly. Never updated or deleted in place. Historical corrections require appending a compensating event.
Ownership: Match Operations Context
Notes: Uses MatchMinute (e.g., '45+2') to ensure accurate temporal sequencing decoupled entirely from literal wall-clock time.
Import & Curation Entities
Entity Name: StagedRecord

Description: Unverified raw data ingested from external sources.

Purpose: Acts as a holding area for historical data before it is merged into the Core Domain.

Parent Entity (if any): None

Child Entities: None

Related Entities: SourceDocument, FactAssertion

Aggregate Root: Yes

Is Temporal?: Yes

Is Immutable?: No

Lifecycle: Created during automated ETL ingestion. Destroyed or archived after consensus is reached.

Ownership: Provenance & Curation Context

Notes: A firewall that prevents dirty or contradictory data from polluting the encyclopedia's source of truth.

Entity Name: ConflictResolutionTask

Description: A generated task when imported data conflicts with existing facts.

Purpose: Requires a human curator or consensus algorithm to decide which conflicting historical fact is true.

Parent Entity (if any): None

Child Entities: None

Related Entities: StagedRecord, MatchEvent

Aggregate Root: Yes

Is Temporal?: No

Is Immutable?: No

Lifecycle: Created upon conflict detection. Closed when successfully resolved.

Ownership: Provenance & Curation Context

Notes: Crucial workflow entity for dealing with 100 years of contradictory historical records across different national federations.

Media Entities
Entity Name: MediaAsset
Description: A photo, video, or digital document.
Purpose: Manages rich media associated with historical records, handling copyright and licensing.
Parent Entity (if any): None
Child Entities: None
Related Entities: Person, Match, Edition, SourceDocument
Aggregate Root: Yes
Is Temporal?: Yes (Has a ValidTime denoting when the photo was physically taken)
Is Immutable?: No (Metadata can be updated)
Lifecycle: Uploaded, tagged, and persisted indefinitely.
Ownership: Media & Asset Context
Notes: The temporal nature ensures that an Edition page for the 1958 World Cup shows 1958 photos of Pelé, preventing the anachronism of displaying a modern photo of the retired player.