BEGIN;

CREATE TYPE career_role AS ENUM (
    'Player',
    'Manager',
    'AssistantManager',
    'Coach',
    'GoalkeepingCoach',
    'SportingDirector',
    'Executive',
    'President',
    'Chairman',
    'Owner'
);

CREATE TYPE employment_status AS ENUM (
    'Permanent',
    'Loan',
    'Caretaker',
    'Interim',
    'Amateur',
    'YouthAcademy',
    'Honorary'
);

CREATE TYPE person_relationship_type AS ENUM (
    'Father',
    'Son',
    'Brother',
    'Cousin',
    'Uncle',
    'Nephew',
    'Mentor',
    'Teacher',
    'Other'
);

CREATE TYPE team_relationship_type AS ENUM (
    'ParentClub',
    'ReserveTeam',
    'AffiliateClub',
    'FarmTeam',
    'MultiClubOwnership',
    'Partnership'
);

CREATE TYPE lineage_change_type AS ENUM (
    'Merger',
    'Split',
    'Relocation',
    'Rename',
    'SuccessorClub',
    'PhoenixClub',
    'Dissolution'
);

-- Career Association (Person <-> Team, temporal, immutable history)
CREATE TABLE career_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    role career_role NOT NULL,
    employment_status employment_status NOT NULL DEFAULT 'Permanent',
    start_year SMALLINT NOT NULL,
    start_month SMALLINT,
    start_day SMALLINT,
    end_year SMALLINT,
    end_month SMALLINT,
    end_day SMALLINT,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_career_start_month CHECK (start_month IS NULL OR (start_month >= 1 AND start_month <= 12)),
    CONSTRAINT check_career_start_day CHECK (start_day IS NULL OR (start_day >= 1 AND start_day <= 31)),
    CONSTRAINT check_career_start_day_requires_month CHECK (start_day IS NULL OR start_month IS NOT NULL),
    CONSTRAINT check_career_end_month CHECK (end_month IS NULL OR (end_month >= 1 AND end_month <= 12)),
    CONSTRAINT check_career_end_day CHECK (end_day IS NULL OR (end_day >= 1 AND end_day <= 31)),
    CONSTRAINT check_career_end_day_requires_month CHECK (end_day IS NULL OR end_month IS NOT NULL),
    CONSTRAINT check_career_current_requires_no_end CHECK (
        is_current = FALSE OR end_year IS NULL
    )
);

CREATE INDEX idx_career_person ON career_associations(person_id);
CREATE INDEX idx_career_team ON career_associations(team_id);
CREATE INDEX idx_career_role ON career_associations(role);
CREATE INDEX idx_career_is_current ON career_associations(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_career_start ON career_associations(start_year, start_month);
CREATE INDEX idx_career_end ON career_associations(end_year, end_month);
CREATE INDEX idx_career_person_role ON career_associations(person_id, role);
CREATE INDEX idx_career_team_role ON career_associations(team_id, role);
CREATE INDEX idx_career_deleted_at ON career_associations(deleted_at);

-- Person Relationship (Person <-> Person, family and personal)
CREATE TABLE person_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    related_person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    relationship_type person_relationship_type NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_person_relationship_no_self_ref CHECK (person_id != related_person_id),
    CONSTRAINT unique_person_relationship UNIQUE (person_id, related_person_id, relationship_type)
);

CREATE INDEX idx_person_rel_person ON person_relationships(person_id);
CREATE INDEX idx_person_rel_related ON person_relationships(related_person_id);
CREATE INDEX idx_person_rel_type ON person_relationships(relationship_type);
CREATE INDEX idx_person_rel_deleted_at ON person_relationships(deleted_at);

-- Team Relationship (Team <-> Team, structural affiliations)
CREATE TABLE team_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    related_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    relationship_type team_relationship_type NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_team_rel_no_self_ref CHECK (team_id != related_team_id),
    CONSTRAINT check_team_rel_valid_time CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX idx_team_rel_team ON team_relationships(team_id);
CREATE INDEX idx_team_rel_related ON team_relationships(related_team_id);
CREATE INDEX idx_team_rel_type ON team_relationships(relationship_type);
CREATE INDEX idx_team_rel_validity ON team_relationships(valid_from, valid_to);
CREATE INDEX idx_team_rel_deleted_at ON team_relationships(deleted_at);

-- Institutional Lineage Node (historical DAG of club structural changes)
CREATE TABLE institutional_lineage_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    predecessor_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    change_type lineage_change_type NOT NULL,
    change_year SMALLINT NOT NULL,
    change_month SMALLINT,
    change_day SMALLINT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_lineage_no_self_ref CHECK (team_id != predecessor_team_id),
    CONSTRAINT check_lineage_change_month CHECK (change_month IS NULL OR (change_month >= 1 AND change_month <= 12)),
    CONSTRAINT check_lineage_change_day CHECK (change_day IS NULL OR (change_day >= 1 AND change_day <= 31)),
    CONSTRAINT check_lineage_change_day_requires_month CHECK (change_day IS NULL OR change_month IS NOT NULL)
);

CREATE INDEX idx_lineage_team ON institutional_lineage_nodes(team_id);
CREATE INDEX idx_lineage_predecessor ON institutional_lineage_nodes(predecessor_team_id);
CREATE INDEX idx_lineage_change_type ON institutional_lineage_nodes(change_type);
CREATE INDEX idx_lineage_change_year ON institutional_lineage_nodes(change_year);
CREATE INDEX idx_lineage_deleted_at ON institutional_lineage_nodes(deleted_at);

COMMIT;
