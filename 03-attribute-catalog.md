# Common Metadata

All operational entities automatically inherit the following metadata fields. These are omitted from individual entity listings for brevity, but exist on every aggregate root and mutable entity.

## CreatedAt
### Description
The timestamp when the record was initially created in the system.
### Data Type (Conceptual only)
DateTime
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
CurrentTime
### Mutable
Immutable
### Derived
No
### Validation Rules
Must be a valid UTC Timestamp.
### Example
`2026-07-20T10:15:30Z`

## UpdatedAt
### Description
The timestamp when the record was last modified.
### Data Type (Conceptual only)
DateTime
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
CurrentTime
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be >= CreatedAt.
### Example
`2026-07-21T08:00:00Z`

## Version
### Description
Optimistic concurrency control version number.
### Data Type (Conceptual only)
Integer
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
1
### Mutable
Mutable
### Derived
No
### Validation Rules
Must increment monotonically on each update.
### Example
`5`

## CreatedBy
### Description
The identifier of the user or system process that created the record.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
SystemUser
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference a valid User ID.
### Example
`usr-12345`

---

# GeopoliticalEntity

## Id
### Description
Unique identifier for the geopolitical entity.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID format
### Example
`123e4567-e89b-12d3-a456-426614174000`

## PrimaryName
### Description
The standard English name for the entity.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 100
### Example
`Soviet Union`

## ISOCode
### Description
Standard 3-letter ISO country code.
### Data Type (Conceptual only)
String
### Required
No
### Unique
Yes
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Exact length 3
### Example
`URS`

## FIFACode
### Description
Standard 3-letter FIFA trigram.
### Data Type (Conceptual only)
String
### Required
No
### Unique
Yes
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Exact length 3
### Example
`URS`

## TypeCode
### Description
Distinguishes between independent nations, territories, and historical entities.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must belong to GeopoliticalType enum
### Example
`HistoricalState`

## ValidTime
### Description
The historical period during which this entity existed.
### Data Type (Conceptual only)
Value Object (TimeRange)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
ValidTo must be greater than ValidFrom
### Example
`1922-12-30 to 1991-12-26`

# Venue

## Id
### Description
Unique identifier for the venue.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174001`

## PrimaryName
### Description
The common historical name of the stadium.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 150
### Example
`Highbury`

## GeopoliticalId
### Description
The country or territory where the venue is located.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference GeopoliticalEntity
### Example
`geo-england`

## City
### Description
The city where the stadium is physically located.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 100
### Example
`London`

## LocationCoordinate
### Description
Geographical coordinates of the stadium.
### Data Type (Conceptual only)
Value Object (Coordinate)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Valid Latitude/Longitude
### Example
`51.5549° N, 0.1084° W`

## Capacity
### Description
The official spectator capacity during its operational period.
### Data Type (Conceptual only)
Integer
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Positive integer
### Example
`38419`

## SurfaceType
### Description
The primary type of pitch surface.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
Grass
### Mutable
Mutable
### Derived
No
### Validation Rules
Grass, Artificial, Hybrid
### Example
`Grass`

## ValidTime
### Description
The period the venue was operational.
### Data Type (Conceptual only)
Value Object (TimeRange)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Valid timeline
### Example
`1913-09-06 to 2006-05-07`

# Organization

## Id
### Description
Unique identifier for the organization.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174002`

## PrimaryName
### Description
The official name of the organization.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 200
### Example
`Fédération Internationale de Football Association`

## Abbreviation
### Description
The common acronym for the organization.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 20
### Example
`FIFA`

## OrganizationType
### Description
The classification of the governing body.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be Federation, Confederation, or Global
### Example
`Global`

## GeopoliticalId
### Description
The host nation or region of the organization.
### Data Type (Conceptual only)
Reference
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference GeopoliticalEntity
### Example
`geo-switzerland`

## FoundationDate
### Description
When the organization was established.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be in the past
### Example
`1904-05-21`

# Team

## Id
### Description
Unique identifier for the sporting entity.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174003`

## PrimaryName
### Description
The common historical name of the team.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 150
### Example
`Manchester United`

## ShortName
### Description
The abbreviated name often used in broadcast.
### Data Type (Conceptual only)
String
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 3
### Example
`MUN`

## TeamType
### Description
Whether the team is a club or national team.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Club or National
### Example
`Club`

## Gender
### Description
The gender classification of the team.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
Men
### Mutable
Immutable
### Derived
No
### Validation Rules
Men, Women, Mixed
### Example
`Men`

## GoverningOrganizationId
### Description
The FA or federation the team belongs to.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Organization
### Example
`org-the-fa`

## GeopoliticalId
### Description
The country this team represents or resides in.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference GeopoliticalEntity
### Example
`geo-england`

## FoundationDate
### Description
When the team was originally formed.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Past date
### Example
`1878-01-01`

## DissolutionDate
### Description
When the team ceased to exist.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be after FoundationDate
### Example
`None`

# InstitutionalLineageNode

## Id
### Description
Unique identifier for the lineage event.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174004`

## OriginalTeamId
### Description
The team before the structural change.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-id-wimbledon`

## SuccessorTeamId
### Description
The team after the structural change.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-id-mkdons`

## ChangeType
### Description
The nature of the institutional change.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Merger, Split, FranchiseRelocation
### Example
`FranchiseRelocation`

## ChangeDate
### Description
The official legal date of the structural change.
### Data Type (Conceptual only)
Date
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid past date
### Example
`2004-06-21`

# TeamRelationship

## Id
### Description
Unique identifier for the relationship.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174005`

## ParentTeamId
### Description
The primary team in the relationship.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-barcelona`

## ChildTeamId
### Description
The affiliate or reserve team.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-barcelona-b`

## RelationshipType
### Description
Nature of the connection.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Reserve, Affiliate, MultiClub
### Example
`Reserve`

## ValidTime
### Description
The duration this relationship existed.
### Data Type (Conceptual only)
Value Object (TimeRange)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Start must be before End
### Example
`1970-01-01 to Present`

# Person

## Id
### Description
Unique identifier for the human.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174006`

## PrimaryName
### Description
The standard display name in the primary script.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 200
### Example
`Lionel Andrés Messi`

## BirthDate
### Description
The date the person was born.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be in the past
### Example
`1987-06-24`

## BirthGeopoliticalId
### Description
The country/territory of birth at the time of birth.
### Data Type (Conceptual only)
Reference
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must align with Geopolitical entity valid time
### Example
`geo-argentina`

## BirthCity
### Description
The specific city of birth.
### Data Type (Conceptual only)
String
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 100
### Example
`Rosario`

## DeathDate
### Description
The date the person died.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be after BirthDate
### Example
`2020-11-25`

## HeightCm
### Description
The maximum recorded height in centimeters.
### Data Type (Conceptual only)
Integer
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Between 100 and 250
### Example
`170`

## FootPreference
### Description
The natural strong foot of the person.
### Data Type (Conceptual only)
Enumeration
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Left, Right, Both
### Example
`Left`

# PersonRelationship

## Id
### Description
Unique identifier for the familial tie.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174007`

## PersonAId
### Description
First person in the relationship.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person
### Example
`person-id-1`

## PersonBId
### Description
Second person in the relationship.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person
### Example
`person-id-2`

## FamilyRole
### Description
The nature of the tie.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Brother, Father, Cousin
### Example
`Brother`

# CareerAssociation

## Id
### Description
Unique identifier for the career stint.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174008`

## PersonId
### Description
The person employed.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person
### Example
`person-id`

## TeamId
### Description
The employing team.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-id`

## RoleContext
### Description
The job title or capacity.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Player, Manager, Director
### Example
`Player`

## AssociationDuration
### Description
The time period of the association.
### Data Type (Conceptual only)
Value Object (TimeRange)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Start must be before End
### Example
`2004-07-01 to 2021-08-10`

## TransferFee
### Description
The amount paid to acquire the person.
### Data Type (Conceptual only)
Value Object (Money)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be positive amount
### Example
`105000000 EUR`

## IsLoan
### Description
Whether this association was temporary.
### Data Type (Conceptual only)
Boolean
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
False
### Mutable
Mutable
### Derived
No
### Validation Rules
True/False
### Example
`False`

# Competition

## Id
### Description
Unique identifier for the competition concept.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174009`

## PrimaryName
### Description
The official name of the competition.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 150
### Example
`FIFA World Cup`

## GoverningOrganizationId
### Description
The organization that runs this competition.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Organization
### Example
`org-id-fifa`

## TierLevel
### Description
The level of the competition in the pyramid.
### Data Type (Conceptual only)
Integer
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Positive integer (1 for top flight)
### Example
`1`

## GenderCategory
### Description
Gender restriction for the competition.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Men, Women, Mixed
### Example
`Men`

## AgeLevel
### Description
Age restriction category.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
Senior
### Mutable
Mutable
### Derived
No
### Validation Rules
Senior, U21, U20, U17
### Example
`Senior`

## CompetitionType
### Description
Classification of the tournament structure.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
DomesticLeague, DomesticCup, InternationalCup
### Example
`InternationalCup`

# Season

## Id
### Description
Unique identifier for the season.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174010`

## Designator
### Description
The human-readable label.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must follow format YYYY or YYYY/YY
### Example
`2023/2024`

## TemporalBounds
### Description
The actual start and end dates.
### Data Type (Conceptual only)
Value Object (TimeRange)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid timeline
### Example
`2023-07-01 to 2024-06-30`

# Edition

## Id
### Description
Unique identifier for the specific tournament instance.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174011`

## CompetitionId
### Description
The parent competition.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Competition
### Example
`comp-id`

## SeasonId
### Description
The season during which this edition takes place.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Season
### Example
`season-id`

## HostGeopoliticalIds
### Description
The country/countries hosting the edition.
### Data Type (Conceptual only)
Collection (Reference)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
Empty
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference GeopoliticalEntity
### Example
`geo-id-qatar`

# Stage

## Id
### Description
Unique identifier for the phase.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174012`

## EditionId
### Description
The parent edition.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Edition
### Example
`edition-id`

## PrimaryName
### Description
The display name of the phase.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 100
### Example
`Group Stage`

## FormatType
### Description
The structural rules for this stage.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Knockout, RoundRobin, Swiss
### Example
`RoundRobin`

## SequenceOrder
### Description
The chronological order within the edition.
### Data Type (Conceptual only)
Integer
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Positive integer
### Example
`1`

# TieBreakerRule

## Id
### Description
Unique identifier for the rule application.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174013`

## StageId
### Description
The stage this rule applies to.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Stage
### Example
`stage-id`

## Criteria
### Description
The specific tie-breaking logic.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
GoalDifference, HeadToHead, AwayGoals
### Example
`GoalDifference`

## ExecutionOrder
### Description
The priority in which the rule is evaluated.
### Data Type (Conceptual only)
Integer
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must be positive integer
### Example
`1`

# StandingTable

## Id
### Description
Unique identifier for the snapshot.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174014`

## StageId
### Description
The stage this table belongs to.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Stage
### Example
`stage-id`

## SnapshotTime
### Description
When this exact table state was captured.
### Data Type (Conceptual only)
DateTime
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid past datetime
### Example
`2024-05-19T18:00:00Z`

## TableRows
### Description
The list of team standings.
### Data Type (Conceptual only)
Collection (Value Object)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
Yes (Derived from events/deductions)
### Validation Rules
Array of StandingRow objects
### Example
`[{TeamId: 1, Rank: 1, Points: 90}]`

# FixtureEvent

## Id
### Description
Unique identifier for the planned match.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174015`

## StageId
### Description
The competition stage if applicable.
### Data Type (Conceptual only)
Reference
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Stage
### Example
`stage-id`

## ScheduledTime
### Description
When the match is formally planned to occur.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Valid date format
### Example
`2022-12-18T15:00:00Z`

## HomeTeamId
### Description
The designated home team.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-id-arg`

## AwayTeamId
### Description
The designated away team.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-id-fra`

## VenueId
### Description
The intended venue.
### Data Type (Conceptual only)
Reference
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Venue
### Example
`venue-id`

# Match

## Id
### Description
Unique identifier for the actual game.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174016`

## FixtureEventId
### Description
The fixture this match fulfills.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference FixtureEvent
### Example
`fixture-id`

## ActualKickoff
### Description
The exact historical time the game started.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Cannot be in the future
### Example
`2022-12-18T15:00:12Z`

## MatchStatus
### Description
The current or final state of the game.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
Scheduled
### Mutable
Mutable
### Derived
No
### Validation Rules
Completed, Abandoned, Forfeit
### Example
`Completed`

## VenueId
### Description
The actual venue played in (if different from fixture).
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Venue
### Example
`venue-id`

## FinalScore
### Description
The verified final score.
### Data Type (Conceptual only)
Value Object (Score)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
Yes (Can be derived, but historically fixed)
### Validation Rules
Matches MatchEvents tally
### Example
`3-3 (4-2 PEN)`

# Roster

## Id
### Description
Unique identifier for the squad registration.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174017`

## EditionId
### Description
The tournament this roster is for.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Edition
### Example
`edition-id`

## TeamId
### Description
The team submitting the squad.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-id`

## RegistrationDate
### Description
When the squad list was officially submitted.
### Data Type (Conceptual only)
Date
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Before edition start
### Example
`2022-11-10`

## RegisteredPersons
### Description
The list of personnel in the squad.
### Data Type (Conceptual only)
Collection (Reference)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
Empty
### Mutable
Mutable
### Derived
No
### Validation Rules
Must be valid Person IDs
### Example
`[person-id-1, person-id-2]`

# MatchAppearance

## Id
### Description
Unique identifier for the person's participation.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174018`

## MatchId
### Description
The match in question.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Match
### Example
`match-id`

## PersonId
### Description
The person participating.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person
### Example
`person-id-messi`

## TeamId
### Description
The team the person represents.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Team
### Example
`team-id`

## RoleContext
### Description
Whether they are a Player or Manager.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Player, Manager
### Example
`Player`

## StartingStatus
### Description
Whether the person was on the pitch at kickoff.
### Data Type (Conceptual only)
Boolean
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
False
### Mutable
Immutable
### Derived
No
### Validation Rules
True/False
### Example
`True`

## ShirtNumber
### Description
The jersey number worn during this specific match.
### Data Type (Conceptual only)
Value Object (JerseyNumber)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Between 1 and 99
### Example
`10`

## Position
### Description
The primary tactical position played.
### Data Type (Conceptual only)
Enumeration
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Goalkeeper, Defender, Midfielder, Forward
### Example
`Forward`

# MatchOfficialAssignment

## Id
### Description
Unique identifier for the official's role.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174019`

## MatchId
### Description
The match being officiated.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Match
### Example
`match-id`

## PersonId
### Description
The official.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person
### Example
`person-id-ref`

## OfficialRole
### Description
The specific duty performed by the official.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Referee, AssistantReferee, FourthOfficial, VAR
### Example
`Referee`

# MatchEvent

## Id
### Description
Unique identifier for the historical occurrence.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174020`

## MatchId
### Description
The match where the event happened.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Match
### Example
`match-id`

## EventType
### Description
The categorization of the match action.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Goal, Card, Substitution
### Example
`Goal`

## Timing
### Description
The logical match time the event occurred.
### Data Type (Conceptual only)
Value Object (MatchMinute)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid match period
### Example
`45+2'`

## ActorId
### Description
The primary person involved.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person
### Example
`person-id-scorer`

## SecondaryActorId
### Description
The secondary person (e.g. Assister, Player subbed out).
### Data Type (Conceptual only)
Reference
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person
### Example
`person-id-assister`

## SystemAssertionTime
### Description
When the system recorded this fact (Bi-temporal).
### Data Type (Conceptual only)
DateTime
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
CurrentTime
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid Timestamp
### Example
`2026-07-20T10:00:00Z`

# Award

## Id
### Description
Unique identifier for the honor concept.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174021`

## PrimaryName
### Description
The formal name of the award.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 150
### Example
`Golden Boot`

## AwardingBodyId
### Description
The entity giving the award.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Must reference Organization
### Example
`org-id-fifa`

## Category
### Description
The type of achievement the award recognizes.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
BestPlayer, TopScorer, FairPlay
### Example
`TopScorer`

# AwardRecipient

## Id
### Description
Unique identifier for the instance of receiving the award.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174030`

## AwardId
### Description
The award that was given.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Award
### Example
`award-id`

## RecipientId
### Description
The person or team that won the award.
### Data Type (Conceptual only)
Reference (Polymorphic)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person or Team
### Example
`person-id-mbappe`

## EditionId
### Description
The specific tournament edition this was awarded for.
### Data Type (Conceptual only)
Reference
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Edition
### Example
`edition-id-2022`

## AwardDate
### Description
When the award was formally handed out.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Past date
### Example
`2022-12-18`

# Record

## Id
### Description
Unique identifier for the milestone concept.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174022`

## PrimaryName
### Description
The human readable title of the record.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 150
### Example
`Most Goals in a Single World Cup`

## RecordType
### Description
The classification of the milestone.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
YoungestPlayer, FastestGoal
### Example
`MostGoals`

# RecordHolder

## Id
### Description
Unique identifier for the holding period.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174031`

## RecordId
### Description
The record being held.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Record
### Example
`record-id`

## HolderId
### Description
The entity that achieved it.
### Data Type (Conceptual only)
Reference (Polymorphic)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference Person or Team
### Example
`person-id-fontaine`

## AchievementValue
### Description
The objective measurement of the milestone.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Matches record format
### Example
`13 goals`

## ValidTime
### Description
The period they held the record.
### Data Type (Conceptual only)
Value Object (TimeRange)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Valid timeline
### Example
`1958-06-28 to Present`

# SourceDocument

## Id
### Description
Unique identifier for the data origin.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174023`

## Title
### Description
The title of the document or archive.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 250
### Example
`FIFA 1930 Official Report`

## PublicationDate
### Description
When the source material was published.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Cannot be in future
### Example
`1950-07-17`

## PublisherName
### Description
The organization that produced it.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max 200 chars
### Example
`FIFA`

# FactAssertion

## Id
### Description
Unique identifier for the claim.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174024`

## SourceId
### Description
The document making the claim.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference SourceDocument
### Example
`source-id`

## TargetEventId
### Description
The core event being asserted.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference MatchEvent
### Example
`event-id`

## ConfidenceScore
### Description
An algorithmic or human trust metric.
### Data Type (Conceptual only)
Decimal
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
1.0
### Mutable
Mutable
### Derived
No
### Validation Rules
Between 0.0 and 1.0
### Example
`0.95`

# StagedRecord

## Id
### Description
Unique identifier for the unverified data.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174025`

## RawPayload
### Description
The original unparsed data format ingested from the source.
### Data Type (Conceptual only)
Binary
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid JSON or text
### Example
`{"player": "Pele", "minute": 14}`

## ImportTimestamp
### Description
When the data hit the staging area.
### Data Type (Conceptual only)
DateTime
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
CurrentTime
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid Timestamp
### Example
`2026-07-20T11:00:00Z`

# ConflictResolutionTask

## Id
### Description
Unique identifier for the manual review job.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174026`

## StagedRecordId
### Description
The data requiring review.
### Data Type (Conceptual only)
Reference
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must reference StagedRecord
### Example
`staged-id`

## ResolutionStatus
### Description
The workflow state of the manual review job.
### Data Type (Conceptual only)
Enumeration
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
Pending
### Mutable
Mutable
### Derived
No
### Validation Rules
Pending, Resolved, Rejected
### Example
`Pending`

# MediaAsset

## Id
### Description
Unique identifier for the file.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174027`

## AssetUrl
### Description
The remote storage location.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid URI
### Example
`https://cdn...`

## MimeType
### Description
The file format of the media.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Valid MIME type
### Example
`image/jpeg`

## CaptureTime
### Description
When the photo/video was historically taken.
### Data Type (Conceptual only)
Value Object (FuzzyDate)
### Required
No
### Unique
No
### Nullable
Yes
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Past date
### Example
`1958-06-29`

# Alias

## Id
### Description
Unique identifier for the nickname.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174028`

## TargetEntityId
### Description
The entity receiving the alias.
### Data Type (Conceptual only)
Reference (Polymorphic)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must exist
### Example
`person-id-pele`

## AliasValue
### Description
The actual nickname, abbreviation, or alternate string.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 100
### Example
`Pelé`

# LocalizedText

## Id
### Description
Unique identifier for the translation.
### Data Type (Conceptual only)
UUID
### Required
Yes
### Unique
Yes
### Nullable
No
### Default Value
Auto-generated
### Mutable
Immutable
### Derived
No
### Validation Rules
Standard UUID
### Example
`123e4567-e89b-12d3-a456-426614174029`

## TargetEntityId
### Description
The entity being localized.
### Data Type (Conceptual only)
Reference (Polymorphic)
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Immutable
### Derived
No
### Validation Rules
Must exist
### Example
`comp-id`

## LanguageTag
### Description
The target locale or alphabet constraint.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
BCP 47 language tag
### Example
`es-ES`

## TranslatedString
### Description
The localized text value.
### Data Type (Conceptual only)
String
### Required
Yes
### Unique
No
### Nullable
No
### Default Value
None
### Mutable
Mutable
### Derived
No
### Validation Rules
Max length 255
### Example
`Copa del Mundo`


# Common Value Objects

## MatchMinute
### Purpose
Accurately represents football time dynamically rather than relying on linear wall-clock time.
### Fields
- RegularMinute (Integer)
- StoppageMinute (Integer)
- Period (Enumeration)
### Validation
RegularMinute must be a positive integer. Period must match known halves (FirstHalf, SecondHalf, ExtraTimeFirstHalf).
### Reuse
Used exclusively in `MatchEvent`.

## Score
### Purpose
Represents the goal tally of a match.
### Fields
- HomeGoals (Integer)
- AwayGoals (Integer)
- HomePenalties (Integer, Nullable)
- AwayPenalties (Integer, Nullable)
### Validation
Goals cannot be negative integers.
### Reuse
Used in `Match` outcomes and `StandingTable`.

## FuzzyDate
### Purpose
Handles deep historical dates where exact days or times are unknown (e.g., 19th-century matches).
### Fields
- Year (Integer)
- Month (Integer, Nullable)
- Day (Integer, Nullable)
- ExactTime (DateTime, Nullable)
### Validation
Year is always required. Month is required if Day is provided.
### Reuse
Used universally across historical entities (`Match`, `Person`, `Team`).

## TimeRange
### Purpose
Represents a continuous duration with a start and end boundary.
### Fields
- StartDate (FuzzyDate)
- EndDate (FuzzyDate, Nullable)
### Validation
StartDate must be prior to or equal to EndDate.
### Reuse
Used in `CareerAssociation`, `RecordHolder`, and temporal validity fields.

## Coordinate
### Purpose
Physical GPS mapping for venue locations.
### Fields
- Latitude (Decimal)
- Longitude (Decimal)
### Validation
Latitude between -90 and 90. Longitude between -180 and 180.
### Reuse
Used exclusively in `Venue`.

## JerseyNumber
### Purpose
The physical shirt identifier for a player on a match day.
### Fields
- Number (Integer)
### Validation
Typically restricted between 1 and 99.
### Reuse
Used exclusively in `MatchAppearance`.

## Money
### Purpose
Represents financial amounts accurately, avoiding floating point issues.
### Fields
- Amount (Decimal)
- CurrencyCode (String)
### Validation
CurrencyCode must be a valid 3-letter ISO 4217 code.
### Reuse
Used in `CareerAssociation` for transfer fees.

---

# Common Enumerations

- **Match Status**: Scheduled, InProgress, Completed, Abandoned, Postponed, Forfeit
- **Competition Tier**: 1 (Top Flight), 2 (Second Tier), 3, 4, etc.
- **Gender**: Men, Women, Mixed
- **Role Context**: Player, Manager, Coach, Executive
- **Event Type**: Goal, OwnGoal, YellowCard, RedCard, SubstitutionIn, SubstitutionOut, PenaltyAwarded, PenaltyMissed, VARDecision
- **Geopolitical Type**: IndependentNation, Territory, HistoricalState, AdministrativeRegion
- **Lineage Change Type**: Merger, Split, FranchiseRelocation, Dissolution
- **Stage Format**: RoundRobin, Knockout, SwissSystem, Hybrid
- **Official Role**: Referee, AssistantReferee, FourthOfficial, VAR, AVAR
- **TieBreaker Criteria**: Points, GoalDifference, GoalsScored, HeadToHeadPoints, HeadToHeadAwayGoals, AwayGoals, FairPlayPoints
- **Team Type**: Club, National
- **Organization Type**: Global, Confederation, NationalFederation

---

# Derived Attributes

The following attributes must NEVER be stored directly as physical state. They must always be generated dynamically via query projections.

- **Goals Scored (Player)**: Generated by counting all `MatchEvent` entities of type `Goal` where the `ActorId` matches the player.
- **Goals Conceded (Goalkeeper/Team)**: Generated by querying all opposing team `Goal` events while the player/team was on the pitch.
- **Appearances (Player)**: Generated by counting all `MatchAppearance` entities linked to a specific player.
- **Win Percentage (Manager/Team)**: Generated by evaluating the final `Score` of all `Match` entities associated with the Manager's `CareerAssociation` timeline.
- **Goal Difference (Team)**: Generated within a `StandingTable` context by summing goals for minus goals against in a specified `Stage`.
- **Points Per Game (Team/Manager)**: Generated by dividing accumulated table points by the count of completed matches.
- **Age at Match (Player)**: Generated by calculating the exact duration between `Person.BirthDate` and `Match.ActualKickoff`.
- **Minutes Played (Player)**: Generated by diffing the `MatchMinute` of the player's `SubstitutionIn` and `SubstitutionOut` events (or full match duration).
