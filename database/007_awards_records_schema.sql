BEGIN;

CREATE TYPE award_category AS ENUM (
    'Individual',
    'Team',
    'Competition',
    'FairPlay',
    'Coaching',
    'Special'
);

CREATE TYPE award_subject_type AS ENUM (
    'Person',
    'Team',
    'Organization',
    'Competition',
    'Match'
);

CREATE TYPE award_recipient_type AS ENUM (
    'Person',
    'Team',
    'Organization'
);

CREATE TYPE record_category AS ENUM (
    'Individual',
    'Team',
    'Competition',
    'Match',
    'Venue',
    'Historical'
);

CREATE TYPE record_measurement_type AS ENUM (
    'Count',
    'Duration',
    'Distance',
    'Age',
    'Score',
    'Percentage',
    'Currency',
    'Other'
);

CREATE TYPE record_verification_status AS ENUM (
    'Unverified',
    'Pending',
    'Verified',
    'Disputed',
    'Retracted'
);

CREATE TYPE record_holder_type AS ENUM (
    'Person',
    'Team',
    'Organization'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Award (concept / reference entity)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50),
    category award_category NOT NULL,
    subject_type award_subject_type NOT NULL,
    governing_organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT,
    competition_id UUID REFERENCES competitions(id) ON DELETE RESTRICT,
    description TEXT,
    founded_year SMALLINT,
    abolished_year SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_award_years CHECK (
        abolished_year IS NULL OR founded_year IS NULL OR abolished_year >= founded_year
    )
);

CREATE INDEX idx_award_category ON awards(category);
CREATE INDEX idx_award_subject_type ON awards(subject_type);
CREATE INDEX idx_award_org ON awards(governing_organization_id);
CREATE INDEX idx_award_competition ON awards(competition_id);
CREATE INDEX idx_award_deleted_at ON awards(deleted_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- AwardRecipient (historical event of receiving an award)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE award_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_id UUID NOT NULL REFERENCES awards(id) ON DELETE RESTRICT,
    recipient_type award_recipient_type NOT NULL,
    recipient_id UUID NOT NULL,
    edition_id UUID REFERENCES editions(id) ON DELETE RESTRICT,
    season_id UUID REFERENCES seasons(id) ON DELETE RESTRICT,
    match_id UUID REFERENCES matches(id) ON DELETE RESTRICT,
    award_year SMALLINT,
    placement SMALLINT,
    is_winner BOOLEAN NOT NULL DEFAULT TRUE,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    citation TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_award_recipient_placement CHECK (placement IS NULL OR placement > 0)
);

CREATE INDEX idx_award_recipient_award ON award_recipients(award_id);
CREATE INDEX idx_award_recipient_entity ON award_recipients(recipient_type, recipient_id);
CREATE INDEX idx_award_recipient_edition ON award_recipients(edition_id);
CREATE INDEX idx_award_recipient_season ON award_recipients(season_id);
CREATE INDEX idx_award_recipient_match ON award_recipients(match_id);
CREATE INDEX idx_award_recipient_year ON award_recipients(award_year);
CREATE INDEX idx_award_recipient_winner ON award_recipients(award_id, is_winner) WHERE is_winner = TRUE;
CREATE INDEX idx_award_recipient_deleted_at ON award_recipients(deleted_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Record (concept / reference entity — the record itself)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(300) NOT NULL,
    category record_category NOT NULL,
    measurement_type record_measurement_type NOT NULL,
    unit VARCHAR(50),
    record_value DECIMAL(20, 6),
    description TEXT,
    governing_organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT,
    competition_id UUID REFERENCES competitions(id) ON DELETE RESTRICT,
    effective_from DATE,
    effective_to DATE,
    verification_status record_verification_status NOT NULL DEFAULT 'Unverified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_record_effective CHECK (
        effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from
    )
);

CREATE INDEX idx_record_category ON records(category);
CREATE INDEX idx_record_measurement ON records(measurement_type);
CREATE INDEX idx_record_org ON records(governing_organization_id);
CREATE INDEX idx_record_competition ON records(competition_id);
CREATE INDEX idx_record_verification ON records(verification_status);
CREATE INDEX idx_record_effective ON records(effective_from, effective_to);
CREATE INDEX idx_record_deleted_at ON records(deleted_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- RecordHolder (historical event of holding a record)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE record_holders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    holder_type record_holder_type NOT NULL,
    holder_id UUID NOT NULL,
    start_year SMALLINT,
    start_month SMALLINT,
    start_day SMALLINT,
    end_year SMALLINT,
    end_month SMALLINT,
    end_day SMALLINT,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    edition_id UUID REFERENCES editions(id) ON DELETE RESTRICT,
    match_id UUID REFERENCES matches(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_holder_start_month CHECK (start_month IS NULL OR (start_month >= 1 AND start_month <= 12)),
    CONSTRAINT check_holder_start_day CHECK (start_day IS NULL OR (start_day >= 1 AND start_day <= 31)),
    CONSTRAINT check_holder_start_day_requires_month CHECK (start_day IS NULL OR start_month IS NOT NULL),
    CONSTRAINT check_holder_end_month CHECK (end_month IS NULL OR (end_month >= 1 AND end_month <= 12)),
    CONSTRAINT check_holder_end_day CHECK (end_day IS NULL OR (end_day >= 1 AND end_day <= 31)),
    CONSTRAINT check_holder_end_day_requires_month CHECK (end_day IS NULL OR end_month IS NOT NULL),
    CONSTRAINT check_holder_current_requires_no_end CHECK (
        is_current = FALSE OR end_year IS NULL
    )
);

CREATE INDEX idx_record_holder_record ON record_holders(record_id);
CREATE INDEX idx_record_holder_entity ON record_holders(holder_type, holder_id);
CREATE INDEX idx_record_holder_current ON record_holders(record_id, is_current) WHERE is_current = TRUE;
CREATE INDEX idx_record_holder_edition ON record_holders(edition_id);
CREATE INDEX idx_record_holder_match ON record_holders(match_id);
CREATE INDEX idx_record_holder_start ON record_holders(start_year, start_month);
CREATE INDEX idx_record_holder_deleted_at ON record_holders(deleted_at);

COMMIT;
