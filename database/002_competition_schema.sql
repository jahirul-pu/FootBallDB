BEGIN;

CREATE TYPE age_level AS ENUM ('Senior', 'U23', 'U21', 'U20', 'U19', 'U17', 'U15');
CREATE TYPE stage_type AS ENUM ('Group', 'Knockout', 'League', 'Swiss', 'Qualification');
CREATE TYPE tie_breaker_rule_type AS ENUM ('GoalDifference', 'HeadToHead', 'GoalsScored', 'AwayGoals', 'FairPlay', 'Playoff', 'DrawingOfLots');
CREATE TYPE standing_status AS ENUM ('Active', 'Promoted', 'Relegated', 'Qualified', 'Eliminated', 'Champion');

CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(150) NOT NULL,
    short_name VARCHAR(50),
    competition_gender gender NOT NULL DEFAULT 'Men',
    age_category age_level NOT NULL DEFAULT 'Senior',
    tier SMALLINT,
    governing_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    founded_year SMALLINT NOT NULL,
    abolished_year SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_competition_founded_year CHECK (founded_year > 1800)
);

CREATE INDEX idx_competition_org ON competitions(governing_organization_id);
CREATE INDEX idx_competition_deleted_at ON competitions(deleted_at);

CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(50) NOT NULL,
    start_year SMALLINT NOT NULL,
    end_year SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_season_years CHECK (end_year >= start_year)
);

CREATE INDEX idx_season_years ON seasons(start_year, end_year);
CREATE INDEX idx_season_deleted_at ON seasons(deleted_at);

CREATE TABLE editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(200) NOT NULL,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE RESTRICT,
    host_geopolitical_id UUID REFERENCES geopolitical_entities(id) ON DELETE RESTRICT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_edition_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_edition_competition ON editions(competition_id);
CREATE INDEX idx_edition_season ON editions(season_id);
CREATE INDEX idx_edition_host ON editions(host_geopolitical_id);
CREATE INDEX idx_edition_deleted_at ON editions(deleted_at);

CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    primary_name VARCHAR(150) NOT NULL,
    format stage_type NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_stage_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_stage_edition ON stages(edition_id);
CREATE INDEX idx_stage_deleted_at ON stages(deleted_at);

CREATE TABLE tie_breaker_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    rule_type tie_breaker_rule_type NOT NULL,
    execution_order SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT unique_stage_execution_order UNIQUE (stage_id, execution_order),
    CONSTRAINT check_execution_order CHECK (execution_order > 0)
);

CREATE INDEX idx_tiebreaker_stage ON tie_breaker_rules(stage_id);
CREATE INDEX idx_tiebreaker_deleted_at ON tie_breaker_rules(deleted_at);

CREATE TABLE standing_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    matchweek SMALLINT,
    snapshot_date DATE NOT NULL,
    position SMALLINT NOT NULL,
    played SMALLINT NOT NULL DEFAULT 0,
    won SMALLINT NOT NULL DEFAULT 0,
    drawn SMALLINT NOT NULL DEFAULT 0,
    lost SMALLINT NOT NULL DEFAULT 0,
    goals_for SMALLINT NOT NULL DEFAULT 0,
    goals_against SMALLINT NOT NULL DEFAULT 0,
    points SMALLINT NOT NULL DEFAULT 0,
    points_deducted SMALLINT NOT NULL DEFAULT 0,
    deduction_reason VARCHAR(255),
    status standing_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_standing_position CHECK (position > 0),
    CONSTRAINT check_standing_matches CHECK (played = (won + drawn + lost)),
    CONSTRAINT check_standing_points_deducted CHECK (points_deducted >= 0)
);

CREATE INDEX idx_standing_stage ON standing_tables(stage_id);
CREATE INDEX idx_standing_team ON standing_tables(team_id);
CREATE INDEX idx_standing_snapshot ON standing_tables(snapshot_date);
CREATE INDEX idx_standing_deleted_at ON standing_tables(deleted_at);
CREATE UNIQUE INDEX idx_unique_standing_snapshot ON standing_tables(stage_id, team_id, matchweek, snapshot_date) WHERE deleted_at IS NULL;

COMMIT;
