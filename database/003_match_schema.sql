BEGIN;

CREATE TYPE fixture_status AS ENUM ('Scheduled', 'Postponed', 'Cancelled', 'Completed');
CREATE TYPE match_status AS ENUM ('InProgress', 'Completed', 'Abandoned', 'Awarded');
CREATE TYPE official_role AS ENUM ('Referee', 'AssistantReferee', 'FourthOfficial', 'VAR', 'AVAR');
CREATE TYPE match_event_type AS ENUM ('Goal', 'OwnGoal', 'PenaltyGoal', 'PenaltyMiss', 'YellowCard', 'SecondYellow', 'RedCard', 'SubstitutionIn', 'SubstitutionOut', 'VARDecision', 'Kickoff', 'HalfTime', 'FullTime', 'ExtraTimeStart', 'ExtraTimeEnd', 'PenaltyShootoutStart', 'PenaltyKick', 'PenaltyShootoutEnd');
CREATE TYPE roster_role AS ENUM ('Player', 'Manager', 'Coach', 'Staff');
CREATE TYPE player_position AS ENUM ('GK', 'DEF', 'MID', 'FWD');

CREATE TABLE rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    shirt_number SMALLINT,
    role roster_role NOT NULL DEFAULT 'Player',
    position player_position,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT unique_roster_member UNIQUE (edition_id, team_id, person_id)
);

CREATE INDEX idx_roster_edition ON rosters(edition_id);
CREATE INDEX idx_roster_team ON rosters(team_id);
CREATE INDEX idx_roster_person ON rosters(person_id);
CREATE INDEX idx_roster_deleted_at ON rosters(deleted_at);

CREATE TABLE fixture_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES stages(id) ON DELETE RESTRICT,
    home_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    away_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    venue_id UUID REFERENCES venues(id) ON DELETE RESTRICT,
    scheduled_time TIMESTAMPTZ,
    status fixture_status NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_fixture_teams CHECK (home_team_id != away_team_id)
);

CREATE INDEX idx_fixture_stage ON fixture_events(stage_id);
CREATE INDEX idx_fixture_home ON fixture_events(home_team_id);
CREATE INDEX idx_fixture_away ON fixture_events(away_team_id);
CREATE INDEX idx_fixture_time ON fixture_events(scheduled_time);
CREATE INDEX idx_fixture_deleted_at ON fixture_events(deleted_at);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_event_id UUID UNIQUE REFERENCES fixture_events(id) ON DELETE RESTRICT,
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    venue_id UUID REFERENCES venues(id) ON DELETE RESTRICT,
    kickoff_time TIMESTAMPTZ,
    home_score SMALLINT,
    away_score SMALLINT,
    home_penalty_score SMALLINT,
    away_penalty_score SMALLINT,
    attendance INTEGER,
    status match_status NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_match_teams CHECK (home_team_id != away_team_id),
    CONSTRAINT check_match_score CHECK (home_score IS NULL OR home_score >= 0),
    CONSTRAINT check_match_score_away CHECK (away_score IS NULL OR away_score >= 0)
);

CREATE INDEX idx_match_fixture ON matches(fixture_event_id);
CREATE INDEX idx_match_home ON matches(home_team_id);
CREATE INDEX idx_match_away ON matches(away_team_id);
CREATE INDEX idx_match_time ON matches(kickoff_time);
CREATE INDEX idx_match_deleted_at ON matches(deleted_at);

CREATE TABLE match_appearances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    is_starter BOOLEAN NOT NULL DEFAULT FALSE,
    is_captain BOOLEAN NOT NULL DEFAULT FALSE,
    shirt_number SMALLINT,
    position player_position,
    minutes_played SMALLINT,
    entry_minute SMALLINT,
    exit_minute SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT unique_match_appearance UNIQUE (match_id, person_id)
);

CREATE INDEX idx_match_appearance_match ON match_appearances(match_id);
CREATE INDEX idx_match_appearance_team ON match_appearances(team_id);
CREATE INDEX idx_match_appearance_person ON match_appearances(person_id);
CREATE INDEX idx_match_appearance_deleted_at ON match_appearances(deleted_at);

CREATE TABLE match_official_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    role official_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT unique_match_official UNIQUE (match_id, person_id, role)
);

CREATE INDEX idx_match_official_match ON match_official_assignments(match_id);
CREATE INDEX idx_match_official_person ON match_official_assignments(person_id);
CREATE INDEX idx_match_official_deleted_at ON match_official_assignments(deleted_at);

CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    event_type match_event_type NOT NULL,
    minute SMALLINT,
    injury_minute SMALLINT,
    team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    actor_person_id UUID REFERENCES persons(id) ON DELETE RESTRICT,
    related_person_id UUID REFERENCES persons(id) ON DELETE RESTRICT,
    detail_text VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID
);

CREATE INDEX idx_match_event_match ON match_events(match_id);
CREATE INDEX idx_match_event_team ON match_events(team_id);
CREATE INDEX idx_match_event_actor ON match_events(actor_person_id);
CREATE INDEX idx_match_event_chronology ON match_events(match_id, minute, injury_minute);
CREATE INDEX idx_match_event_deleted_at ON match_events(deleted_at);

COMMIT;
