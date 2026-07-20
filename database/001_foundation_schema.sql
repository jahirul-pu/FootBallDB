BEGIN;

CREATE TYPE geopolitical_type AS ENUM ('IndependentNation', 'Territory', 'HistoricalState', 'AdministrativeRegion');
CREATE TYPE organization_type AS ENUM ('Global', 'Confederation', 'NationalFederation');
CREATE TYPE team_type AS ENUM ('Club', 'National');
CREATE TYPE gender AS ENUM ('Men', 'Women', 'Mixed');
CREATE TYPE surface_type AS ENUM ('Grass', 'Artificial', 'Hybrid');
CREATE TYPE foot_preference AS ENUM ('Left', 'Right', 'Both');
CREATE TYPE entity_type_enum AS ENUM ('GeopoliticalEntity', 'Organization', 'Venue', 'Team', 'Person', 'Competition', 'Edition', 'Match');

CREATE TABLE geopolitical_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code geopolitical_type NOT NULL,
    primary_name VARCHAR(100) NOT NULL,
    iso_code VARCHAR(3),
    fifa_code VARCHAR(3),
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_geopolitical_valid_time CHECK (valid_to IS NULL OR valid_to >= valid_from),
    CONSTRAINT check_iso_length CHECK (iso_code IS NULL OR length(iso_code) = 3),
    CONSTRAINT check_fifa_length CHECK (fifa_code IS NULL OR length(fifa_code) = 3)
);

CREATE INDEX idx_geopolitical_iso ON geopolitical_entities(iso_code);
CREATE INDEX idx_geopolitical_fifa ON geopolitical_entities(fifa_code);
CREATE INDEX idx_geopolitical_validity ON geopolitical_entities(valid_from, valid_to);
CREATE INDEX idx_geopolitical_deleted_at ON geopolitical_entities(deleted_at);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(200) NOT NULL,
    abbreviation VARCHAR(20) NOT NULL,
    org_type organization_type NOT NULL,
    geopolitical_id UUID REFERENCES geopolitical_entities(id) ON DELETE RESTRICT,
    foundation_year SMALLINT NOT NULL,
    foundation_month SMALLINT,
    foundation_day SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_org_foundation_month CHECK (foundation_month IS NULL OR (foundation_month >= 1 AND foundation_month <= 12)),
    CONSTRAINT check_org_foundation_day CHECK (foundation_day IS NULL OR (foundation_day >= 1 AND foundation_day <= 31)),
    CONSTRAINT check_org_foundation_day_requires_month CHECK (foundation_day IS NULL OR foundation_month IS NOT NULL)
);

CREATE INDEX idx_org_geopolitical ON organizations(geopolitical_id);
CREATE INDEX idx_org_deleted_at ON organizations(deleted_at);

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(150) NOT NULL,
    geopolitical_id UUID REFERENCES geopolitical_entities(id) ON DELETE RESTRICT,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    capacity INTEGER,
    surface surface_type NOT NULL DEFAULT 'Grass',
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_venue_valid_time CHECK (valid_to IS NULL OR valid_to >= valid_from),
    CONSTRAINT check_venue_capacity CHECK (capacity IS NULL OR capacity > 0),
    CONSTRAINT check_venue_lat CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    CONSTRAINT check_venue_lon CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
    CONSTRAINT check_venue_lat_lon CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL))
);

CREATE INDEX idx_venue_geopolitical ON venues(geopolitical_id);
CREATE INDEX idx_venue_validity ON venues(valid_from, valid_to);
CREATE INDEX idx_venue_deleted_at ON venues(deleted_at);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(150) NOT NULL,
    short_name VARCHAR(3),
    team_category team_type NOT NULL,
    team_gender gender NOT NULL DEFAULT 'Men',
    governing_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    geopolitical_id UUID NOT NULL REFERENCES geopolitical_entities(id) ON DELETE RESTRICT,
    foundation_year SMALLINT NOT NULL,
    foundation_month SMALLINT,
    foundation_day SMALLINT,
    dissolution_year SMALLINT,
    dissolution_month SMALLINT,
    dissolution_day SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_team_foundation_month CHECK (foundation_month IS NULL OR (foundation_month >= 1 AND foundation_month <= 12)),
    CONSTRAINT check_team_foundation_day CHECK (foundation_day IS NULL OR (foundation_day >= 1 AND foundation_day <= 31)),
    CONSTRAINT check_team_foundation_day_requires_month CHECK (foundation_day IS NULL OR foundation_month IS NOT NULL),
    CONSTRAINT check_team_dissolution_month CHECK (dissolution_month IS NULL OR (dissolution_month >= 1 AND dissolution_month <= 12)),
    CONSTRAINT check_team_dissolution_day CHECK (dissolution_day IS NULL OR (dissolution_day >= 1 AND dissolution_day <= 31)),
    CONSTRAINT check_team_dissolution_day_requires_month CHECK (dissolution_day IS NULL OR dissolution_month IS NOT NULL)
);

CREATE INDEX idx_team_org ON teams(governing_organization_id);
CREATE INDEX idx_team_geopolitical ON teams(geopolitical_id);
CREATE INDEX idx_team_deleted_at ON teams(deleted_at);

CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(200) NOT NULL,
    birth_year SMALLINT NOT NULL,
    birth_month SMALLINT,
    birth_day SMALLINT,
    birth_geopolitical_id UUID REFERENCES geopolitical_entities(id) ON DELETE RESTRICT,
    birth_city VARCHAR(100),
    death_year SMALLINT,
    death_month SMALLINT,
    death_day SMALLINT,
    height_cm SMALLINT,
    preferred_foot foot_preference,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_person_birth_month CHECK (birth_month IS NULL OR (birth_month >= 1 AND birth_month <= 12)),
    CONSTRAINT check_person_birth_day CHECK (birth_day IS NULL OR (birth_day >= 1 AND birth_day <= 31)),
    CONSTRAINT check_person_birth_day_requires_month CHECK (birth_day IS NULL OR birth_month IS NOT NULL),
    CONSTRAINT check_person_death_month CHECK (death_month IS NULL OR (death_month >= 1 AND death_month <= 12)),
    CONSTRAINT check_person_death_day CHECK (death_day IS NULL OR (death_day >= 1 AND death_day <= 31)),
    CONSTRAINT check_person_death_day_requires_month CHECK (death_day IS NULL OR death_month IS NOT NULL),
    CONSTRAINT check_person_height CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250))
);

CREATE INDEX idx_person_birth_geo ON persons(birth_geopolitical_id);
CREATE INDEX idx_person_deleted_at ON persons(deleted_at);

CREATE TABLE aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type entity_type_enum NOT NULL,
    entity_id UUID NOT NULL,
    alias_value VARCHAR(100) NOT NULL,
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_alias_valid_time CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

CREATE INDEX idx_alias_entity ON aliases(entity_type, entity_id);
CREATE INDEX idx_alias_value ON aliases(alias_value);
CREATE INDEX idx_alias_deleted_at ON aliases(deleted_at);

CREATE TABLE localized_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type entity_type_enum NOT NULL,
    entity_id UUID NOT NULL,
    language_tag VARCHAR(20) NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    translated_string VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT unique_localization UNIQUE (entity_type, entity_id, language_tag, field_name)
);

CREATE INDEX idx_localized_text_entity ON localized_texts(entity_type, entity_id);
CREATE INDEX idx_localized_text_lang ON localized_texts(language_tag);
CREATE INDEX idx_localized_text_deleted_at ON localized_texts(deleted_at);

COMMIT;
