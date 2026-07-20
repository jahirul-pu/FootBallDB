-- ============================================================
-- FootballDB Database Functions, Triggers & Procedures
-- Migration: 009_functions.sql
-- Depends on: 001 through 008
-- ============================================================

BEGIN;

-- ============================================================
-- PREREQUISITES: Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Trigram index support for full-text similarity search
CREATE INDEX IF NOT EXISTS idx_trgm_person_name
    ON persons USING gin(primary_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_team_name
    ON teams USING gin(primary_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_competition_name
    ON competitions USING gin(primary_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_venue_name
    ON venues USING gin(primary_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_org_name
    ON organizations USING gin(primary_name gin_trgm_ops);

-- ============================================================
-- SECTION 1: TIMESTAMP & VERSION MANAGEMENT
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_set_updated_at
-- Reusable trigger function: sets updated_at = NOW() on UPDATE.
-- Only fires when at least one column actually changed.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN
        NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;
COMMENT ON FUNCTION fn_set_updated_at IS
'Reusable trigger function. Sets updated_at to NOW() only when the row has actually changed.';

-- ─────────────────────────────────────────────────────────────
-- fn_increment_version
-- Reusable trigger function: increments version on UPDATE.
-- Only increments when row actually changed.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_increment_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN
        NEW.version := OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$;
COMMENT ON FUNCTION fn_increment_version IS
'Reusable trigger function. Increments version counter only when the row has actually changed.';

-- ─────────────────────────────────────────────────────────────
-- Macro: attach updated_at + version triggers to every table
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'geopolitical_entities','organizations','venues','teams','persons',
        'aliases','localized_texts','competitions','seasons','editions',
        'stages','tie_breaker_rules','standing_tables','rosters',
        'fixture_events','matches','match_appearances',
        'match_official_assignments','match_events',
        'career_associations','person_relationships','team_relationships',
        'institutional_lineage_nodes','source_documents','fact_assertions',
        'staged_records','conflict_resolution_tasks','media_assets',
        'awards','award_recipients','records','record_holders'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP

        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
             CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();',
            tbl, tbl, tbl, tbl
        );

        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_version ON %I;
             CREATE TRIGGER trg_%s_version
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_increment_version();',
            tbl, tbl, tbl, tbl
        );

    END LOOP;
END;
$$;

-- ============================================================
-- SECTION 2: SOFT DELETE HELPERS
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_soft_delete(table_name, record_id)
-- Sets deleted_at = NOW() for the target row.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_soft_delete(
    p_table TEXT,
    p_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    EXECUTE format(
        'UPDATE %I SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
        p_table
    ) USING p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Record % in table % not found or already deleted.', p_id, p_table;
    END IF;
END;
$$;
COMMENT ON FUNCTION fn_soft_delete IS
'Soft-deletes a record by setting deleted_at. Raises an exception if not found or already deleted.';

-- ─────────────────────────────────────────────────────────────
-- fn_restore(table_name, record_id)
-- Clears deleted_at, restoring a soft-deleted row.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_restore(
    p_table TEXT,
    p_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    EXECUTE format(
        'UPDATE %I SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
        p_table
    ) USING p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Record % in table % not found or not soft-deleted.', p_id, p_table;
    END IF;
END;
$$;
COMMENT ON FUNCTION fn_restore IS
'Restores a previously soft-deleted record by clearing deleted_at.';

-- ─────────────────────────────────────────────────────────────
-- fn_hard_delete(table_name, record_id)
-- Physically deletes a row. Admin-only. Requires explicit confirmation token.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_hard_delete(
    p_table TEXT,
    p_id UUID,
    p_confirm TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    IF p_confirm != 'CONFIRM_HARD_DELETE' THEN
        RAISE EXCEPTION 'Hard delete requires confirmation token CONFIRM_HARD_DELETE.';
    END IF;

    EXECUTE format('DELETE FROM %I WHERE id = $1', p_table) USING p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Record % in table % not found.', p_id, p_table;
    END IF;
END;
$$;
COMMENT ON FUNCTION fn_hard_delete IS
'Physically deletes a record. Requires explicit confirmation token. Admin use only.';

-- ============================================================
-- SECTION 3: SEARCH HELPERS
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_search_persons(query, limit)
-- Ranked person search using unaccent + trigram similarity.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_search_persons(
    p_query TEXT,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    person_id UUID,
    primary_name TEXT,
    birth_year SMALLINT,
    similarity REAL
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        p.id,
        p.primary_name,
        p.birth_year,
        similarity(unaccent(p.primary_name), unaccent(p_query)) AS sim
    FROM persons p
    WHERE p.deleted_at IS NULL
      AND (
          unaccent(p.primary_name) ILIKE '%' || unaccent(p_query) || '%'
          OR similarity(unaccent(p.primary_name), unaccent(p_query)) > 0.15
      )
    ORDER BY sim DESC
    LIMIT p_limit;
$$;
COMMENT ON FUNCTION fn_search_persons IS
'Ranked person search using unaccent normalization and trigram similarity.';

-- ─────────────────────────────────────────────────────────────
-- fn_search_teams(query, limit)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_search_teams(
    p_query TEXT,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    team_id UUID,
    primary_name TEXT,
    team_category team_type,
    team_gender gender,
    similarity REAL
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        t.id,
        t.primary_name,
        t.team_category,
        t.team_gender,
        similarity(unaccent(t.primary_name), unaccent(p_query)) AS sim
    FROM teams t
    WHERE t.deleted_at IS NULL
      AND (
          unaccent(t.primary_name) ILIKE '%' || unaccent(p_query) || '%'
          OR similarity(unaccent(t.primary_name), unaccent(p_query)) > 0.15
      )
    ORDER BY sim DESC
    LIMIT p_limit;
$$;
COMMENT ON FUNCTION fn_search_teams IS
'Ranked team search using unaccent and trigram similarity.';

-- ─────────────────────────────────────────────────────────────
-- fn_search_competitions(query, limit)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_search_competitions(
    p_query TEXT,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    competition_id UUID,
    primary_name TEXT,
    competition_gender gender,
    age_category age_level,
    similarity REAL
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        c.id,
        c.primary_name,
        c.competition_gender,
        c.age_category,
        similarity(unaccent(c.primary_name), unaccent(p_query)) AS sim
    FROM competitions c
    WHERE c.deleted_at IS NULL
      AND (
          unaccent(c.primary_name) ILIKE '%' || unaccent(p_query) || '%'
          OR similarity(unaccent(c.primary_name), unaccent(p_query)) > 0.15
      )
    ORDER BY sim DESC
    LIMIT p_limit;
$$;
COMMENT ON FUNCTION fn_search_competitions IS
'Ranked competition search using unaccent and trigram similarity.';

-- ─────────────────────────────────────────────────────────────
-- fn_search_venues(query, limit)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_search_venues(
    p_query TEXT,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    venue_id UUID,
    primary_name TEXT,
    city TEXT,
    similarity REAL
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        v.id,
        v.primary_name,
        v.city,
        similarity(unaccent(v.primary_name), unaccent(p_query)) AS sim
    FROM venues v
    WHERE v.deleted_at IS NULL
      AND (
          unaccent(v.primary_name) ILIKE '%' || unaccent(p_query) || '%'
          OR similarity(unaccent(v.primary_name), unaccent(p_query)) > 0.15
      )
    ORDER BY sim DESC
    LIMIT p_limit;
$$;
COMMENT ON FUNCTION fn_search_venues IS
'Ranked venue search using unaccent and trigram similarity.';

-- ─────────────────────────────────────────────────────────────
-- fn_search_organizations(query, limit)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_search_organizations(
    p_query TEXT,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    organization_id UUID,
    primary_name TEXT,
    abbreviation TEXT,
    similarity REAL
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        o.id,
        o.primary_name,
        o.abbreviation,
        similarity(unaccent(o.primary_name), unaccent(p_query)) AS sim
    FROM organizations o
    WHERE o.deleted_at IS NULL
      AND (
          unaccent(o.primary_name) ILIKE '%' || unaccent(p_query) || '%'
          OR unaccent(o.abbreviation) ILIKE '%' || unaccent(p_query) || '%'
          OR similarity(unaccent(o.primary_name), unaccent(p_query)) > 0.15
      )
    ORDER BY sim DESC
    LIMIT p_limit;
$$;
COMMENT ON FUNCTION fn_search_organizations IS
'Ranked organization search supporting abbreviation lookup.';

-- ============================================================
-- SECTION 4: SLUG FUNCTIONS
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_generate_slug(text)
-- Converts any string into a URL-safe lowercase slug.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_generate_slug(p_text TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT lower(
        regexp_replace(
            regexp_replace(
                unaccent(trim(p_text)),
                '[^a-zA-Z0-9\s\-]', '', 'g'
            ),
            '[\s\-]+', '-', 'g'
        )
    );
$$;
COMMENT ON FUNCTION fn_generate_slug IS
'Generates a URL-safe lowercase slug from any text. Strips accents and special characters.';

-- ─────────────────────────────────────────────────────────────
-- fn_unique_slug(base_slug, table_name, slug_column, exclude_id)
-- Ensures slug uniqueness by appending -2, -3 etc. if needed.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_unique_slug(
    p_base_slug TEXT,
    p_table TEXT,
    p_slug_col TEXT,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_slug TEXT := p_base_slug;
    v_count INT;
    v_suffix INT := 2;
BEGIN
    LOOP
        EXECUTE format(
            'SELECT COUNT(*) FROM %I WHERE %I = $1 AND ($2 IS NULL OR id != $2)',
            p_table, p_slug_col
        ) INTO v_count USING v_slug, p_exclude_id;

        EXIT WHEN v_count = 0;

        v_slug := p_base_slug || '-' || v_suffix;
        v_suffix := v_suffix + 1;

        IF v_suffix > 9999 THEN
            RAISE EXCEPTION 'Could not generate unique slug for base: %', p_base_slug;
        END IF;
    END LOOP;

    RETURN v_slug;
END;
$$;
COMMENT ON FUNCTION fn_unique_slug IS
'Guarantees slug uniqueness within a table by appending numeric suffixes when collisions occur.';

-- ============================================================
-- SECTION 5: VALIDATION FUNCTIONS
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_validate_date_range(start_year, end_year)
-- Returns TRUE if the year range is logically valid.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_validate_date_range(
    p_start_year SMALLINT,
    p_end_year SMALLINT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT p_end_year IS NULL OR p_end_year >= p_start_year;
$$;
COMMENT ON FUNCTION fn_validate_date_range IS
'Returns TRUE when end_year is NULL or >= start_year.';

-- ─────────────────────────────────────────────────────────────
-- fn_check_career_overlap(person_id, team_id, start_year, end_year, exclude_id)
-- Returns the number of overlapping career associations.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_check_career_overlap(
    p_person_id UUID,
    p_team_id UUID,
    p_start_year SMALLINT,
    p_end_year SMALLINT,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS INT
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT COUNT(*)::INT
    FROM career_associations ca
    WHERE ca.person_id = p_person_id
      AND ca.team_id = p_team_id
      AND ca.deleted_at IS NULL
      AND (p_exclude_id IS NULL OR ca.id != p_exclude_id)
      AND (
          -- new range overlaps existing
          p_start_year <= COALESCE(ca.end_year, 9999)
          AND COALESCE(p_end_year, 9999) >= ca.start_year
      );
$$;
COMMENT ON FUNCTION fn_check_career_overlap IS
'Returns the count of career associations that overlap the given period for a person+team pair.';

-- ─────────────────────────────────────────────────────────────
-- fn_validate_season_consistency(edition_id)
-- Ensures edition dates fall within its declared season years.
-- Returns TRUE if consistent.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_validate_season_consistency(p_edition_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        e.start_date IS NULL
        OR (
            EXTRACT(YEAR FROM e.start_date) BETWEEN s.start_year AND s.end_year
        )
    FROM editions e
    JOIN seasons s ON s.id = e.season_id
    WHERE e.id = p_edition_id;
$$;
COMMENT ON FUNCTION fn_validate_season_consistency IS
'Returns TRUE when an edition start_date falls within its associated season year range.';

-- ─────────────────────────────────────────────────────────────
-- fn_detect_duplicate_person(name, birth_year)
-- Returns potential duplicate persons (similarity > 0.7).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_detect_duplicate_person(
    p_name TEXT,
    p_birth_year SMALLINT
)
RETURNS TABLE(
    person_id UUID,
    primary_name TEXT,
    birth_year SMALLINT,
    similarity REAL
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        p.id,
        p.primary_name,
        p.birth_year,
        similarity(unaccent(p.primary_name), unaccent(p_name)) AS sim
    FROM persons p
    WHERE p.deleted_at IS NULL
      AND p.birth_year BETWEEN p_birth_year - 1 AND p_birth_year + 1
      AND similarity(unaccent(p.primary_name), unaccent(p_name)) > 0.70
    ORDER BY sim DESC;
$$;
COMMENT ON FUNCTION fn_detect_duplicate_person IS
'Returns persons with similar name and birth_year for duplicate detection during import.';

-- ─────────────────────────────────────────────────────────────
-- fn_detect_duplicate_match(home_team_id, away_team_id, kickoff_time)
-- Returns matches that may be duplicates of the given fixture.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_detect_duplicate_match(
    p_home_team_id UUID,
    p_away_team_id UUID,
    p_kickoff_time TIMESTAMPTZ
)
RETURNS TABLE(match_id UUID, kickoff_time TIMESTAMPTZ)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT m.id, m.kickoff_time
    FROM matches m
    WHERE m.deleted_at IS NULL
      AND m.home_team_id = p_home_team_id
      AND m.away_team_id = p_away_team_id
      AND m.kickoff_time BETWEEN p_kickoff_time - INTERVAL '4 hours'
                              AND p_kickoff_time + INTERVAL '4 hours';
$$;
COMMENT ON FUNCTION fn_detect_duplicate_match IS
'Returns matches within 4 hours of the given kickoff for the same fixture pairing.';

-- ============================================================
-- SECTION 6: UTILITY FUNCTIONS
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_is_valid_uuid(text)
-- Safe UUID validation without raising an exception.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_is_valid_uuid(p_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
IMMUTABLE
AS $$
BEGIN
    PERFORM p_text::UUID;
    RETURN TRUE;
EXCEPTION WHEN invalid_text_representation THEN
    RETURN FALSE;
END;
$$;
COMMENT ON FUNCTION fn_is_valid_uuid IS
'Returns TRUE if the text is a valid UUID, FALSE otherwise.';

-- ─────────────────────────────────────────────────────────────
-- fn_safe_cast_int(text)
-- Returns NULL instead of raising an error on bad integer cast.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_safe_cast_int(p_text TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
IMMUTABLE
AS $$
BEGIN
    RETURN p_text::INTEGER;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;
COMMENT ON FUNCTION fn_safe_cast_int IS
'Safely casts text to INTEGER. Returns NULL on failure.';

-- ─────────────────────────────────────────────────────────────
-- fn_date_overlap(s1, e1, s2, e2)
-- Returns TRUE if two date ranges overlap.
-- NULL end date = open-ended (current).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_date_overlap(
    p_start1 DATE, p_end1 DATE,
    p_start2 DATE, p_end2 DATE
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT p_start1 <= COALESCE(p_end2, 'infinity'::DATE)
       AND p_start2 <= COALESCE(p_end1, 'infinity'::DATE);
$$;
COMMENT ON FUNCTION fn_date_overlap IS
'Returns TRUE when two date ranges overlap. NULL end date treated as open-ended.';

-- ─────────────────────────────────────────────────────────────
-- fn_year_overlap(s1, e1, s2, e2)
-- Year-granularity overlap check (for career associations).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_year_overlap(
    p_start1 SMALLINT, p_end1 SMALLINT,
    p_start2 SMALLINT, p_end2 SMALLINT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT p_start1 <= COALESCE(p_end2, 9999)
       AND p_start2 <= COALESCE(p_end1, 9999);
$$;
COMMENT ON FUNCTION fn_year_overlap IS
'Year-granularity range overlap. NULL end treated as open-ended (9999).';

-- ─────────────────────────────────────────────────────────────
-- fn_calculate_age(birth_year, birth_month, birth_day, at_date)
-- Returns approximate age in years at a given date.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_calculate_age(
    p_birth_year SMALLINT,
    p_birth_month SMALLINT,
    p_birth_day SMALLINT,
    p_at_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT
        EXTRACT(YEAR FROM age(
            p_at_date,
            make_date(
                p_birth_year::INT,
                COALESCE(p_birth_month, 1)::INT,
                COALESCE(p_birth_day, 1)::INT
            )
        ))::INTEGER;
$$;
COMMENT ON FUNCTION fn_calculate_age IS
'Calculates age in years at a given reference date. Defaults to today.';

-- ─────────────────────────────────────────────────────────────
-- fn_career_duration_years(start_year, end_year)
-- Returns duration in years for a career association.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_career_duration_years(
    p_start_year SMALLINT,
    p_end_year SMALLINT
)
RETURNS SMALLINT
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT (COALESCE(p_end_year, EXTRACT(YEAR FROM CURRENT_DATE)::SMALLINT) - p_start_year)::SMALLINT;
$$;
COMMENT ON FUNCTION fn_career_duration_years IS
'Returns career duration in years. Uses current year if no end year set.';

-- ─────────────────────────────────────────────────────────────
-- fn_season_from_date(date)
-- Returns the season label (e.g. '2023/24') for a given date.
-- Assumes European season structure (Aug–May).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_season_from_date(p_date DATE)
RETURNS TEXT
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT
        CASE
            WHEN EXTRACT(MONTH FROM p_date) >= 8
            THEN EXTRACT(YEAR FROM p_date)::TEXT || '/' ||
                 LPAD((EXTRACT(YEAR FROM p_date + INTERVAL '1 year')::INT % 100)::TEXT, 2, '0')
            ELSE (EXTRACT(YEAR FROM p_date) - 1)::TEXT || '/' ||
                 LPAD((EXTRACT(YEAR FROM p_date)::INT % 100)::TEXT, 2, '0')
        END;
$$;
COMMENT ON FUNCTION fn_season_from_date IS
'Returns European-style season label (e.g. 2023/24) for a given date. Season starts August.';

-- ─────────────────────────────────────────────────────────────
-- fn_json_diff(old_row JSONB, new_row JSONB)
-- Returns a JSONB object with only the changed key-value pairs.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_json_diff(
    p_old JSONB,
    p_new JSONB
)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
AS $$
    SELECT jsonb_object_agg(key, value)
    FROM jsonb_each(p_new)
    WHERE p_new->key IS DISTINCT FROM p_old->key;
$$;
COMMENT ON FUNCTION fn_json_diff IS
'Returns a JSONB containing only the keys whose values changed between old and new rows.';

-- ============================================================
-- SECTION 7: AUDIT TRIGGER
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_audit_log_trigger
-- Generic trigger function for change logging.
-- Expects an audit_log table to exist (created below).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,          -- INSERT / UPDATE / DELETE
    changed_by UUID,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_data JSONB,
    new_data JSONB,
    diff JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation);

CREATE OR REPLACE FUNCTION fn_audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_old JSONB;
    v_new JSONB;
    v_diff JSONB;
BEGIN
    v_old := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
    v_new := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;

    IF TG_OP = 'UPDATE' THEN
        v_diff := fn_json_diff(v_old, v_new);
        -- Skip audit if nothing changed
        IF v_diff = '{}'::JSONB THEN
            RETURN NEW;
        END IF;
    END IF;

    INSERT INTO audit_log(table_name, record_id, operation, old_data, new_data, diff)
    VALUES (
        TG_TABLE_NAME,
        COALESCE((v_new->>'id')::UUID, (v_old->>'id')::UUID),
        TG_OP,
        v_old,
        v_new,
        v_diff
    );

    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;
COMMENT ON FUNCTION fn_audit_log_trigger IS
'Generic audit trigger. Logs INSERT/UPDATE/DELETE with JSON diff for changed rows.';

-- ============================================================
-- SECTION 8: IMPORT HELPERS
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- pr_process_staged_record(staged_record_id)
-- Validates a single staged record and advances its status.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE pr_process_staged_record(p_staged_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rec staged_records%ROWTYPE;
    v_errors JSONB := '[]'::JSONB;
    v_has_payload BOOLEAN;
BEGIN
    SELECT * INTO v_rec FROM staged_records WHERE id = p_staged_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'StagedRecord % not found.', p_staged_id;
    END IF;

    IF v_rec.processing_status NOT IN ('Pending', 'Error') THEN
        RAISE EXCEPTION 'StagedRecord % is already in status %. Only Pending or Error records can be re-processed.', p_staged_id, v_rec.processing_status;
    END IF;

    -- Basic validation: payload must not be empty object
    v_has_payload := (v_rec.raw_payload IS NOT NULL AND v_rec.raw_payload != '{}'::JSONB);

    IF NOT v_has_payload THEN
        v_errors := v_errors || '["raw_payload is empty or null"]'::JSONB;
    END IF;

    IF jsonb_array_length(v_errors) > 0 THEN
        UPDATE staged_records
        SET processing_status = 'Error', validation_errors = v_errors
        WHERE id = p_staged_id;
    ELSE
        UPDATE staged_records
        SET processing_status = 'Validated', validation_errors = NULL
        WHERE id = p_staged_id;
    END IF;
END;
$$;
COMMENT ON PROCEDURE pr_process_staged_record IS
'Validates a single staged record and advances it to Validated or Error status.';

-- ─────────────────────────────────────────────────────────────
-- pr_mark_staged_merged(staged_record_id)
-- Marks a staged record as successfully merged into the core domain.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE pr_mark_staged_merged(p_staged_id UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE staged_records
    SET processing_status = 'Merged'
    WHERE id = p_staged_id
      AND processing_status = 'Validated';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'StagedRecord % not found or not in Validated status.', p_staged_id;
    END IF;
END;
$$;
COMMENT ON PROCEDURE pr_mark_staged_merged IS
'Transitions a Validated staged record to Merged status after successful domain insertion.';

-- ─────────────────────────────────────────────────────────────
-- fn_duplicate_staged_payload(import_batch_id)
-- Returns staged records with identical raw_payload within the same batch.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_duplicate_staged_payload(p_batch_id UUID)
RETURNS TABLE(
    record_id UUID,
    payload_hash TEXT,
    duplicate_count BIGINT
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
    SELECT
        id AS record_id,
        md5(raw_payload::TEXT) AS payload_hash,
        COUNT(*) OVER (PARTITION BY md5(raw_payload::TEXT)) AS duplicate_count
    FROM staged_records
    WHERE import_batch_id = p_batch_id
      AND deleted_at IS NULL
    ORDER BY payload_hash;
$$;
COMMENT ON FUNCTION fn_duplicate_staged_payload IS
'Returns staged records grouped by payload hash to identify duplicates within an import batch.';

-- ─────────────────────────────────────────────────────────────
-- pr_process_staged_batch(import_batch_id)
-- Processes all Pending records in a batch.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE pr_process_staged_batch(p_batch_id UUID)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rec staged_records%ROWTYPE;
BEGIN
    FOR v_rec IN
        SELECT * FROM staged_records
        WHERE import_batch_id = p_batch_id
          AND processing_status = 'Pending'
          AND deleted_at IS NULL
    LOOP
        CALL pr_process_staged_record(v_rec.id);
    END LOOP;
END;
$$;
COMMENT ON PROCEDURE pr_process_staged_batch IS
'Iterates all Pending staged records in a batch and processes each sequentially.';

-- ============================================================
-- SECTION 9: MATERIALIZED VIEW REFRESH PROCEDURES
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- pr_refresh_all_materialized_views
-- Refreshes all materialized views concurrently.
-- Safe to call after bulk imports.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE pr_refresh_all_materialized_views()
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_league_table;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_player_stats;
END;
$$;
COMMENT ON PROCEDURE pr_refresh_all_materialized_views IS
'Refreshes all FootballDB materialized views concurrently. Call after each import batch.';

-- ─────────────────────────────────────────────────────────────
-- pr_refresh_player_views
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE pr_refresh_player_views()
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_player_stats;
END;
$$;
COMMENT ON PROCEDURE pr_refresh_player_views IS
'Refreshes only the player statistics materialized view.';

-- ─────────────────────────────────────────────────────────────
-- pr_refresh_club_views
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE pr_refresh_club_views()
LANGUAGE plpgsql
AS $$
BEGIN
    -- vw_club_profile is a standard view (auto-fresh).
    -- Refresh league table which drives club standing pages.
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_league_table;
END;
$$;
COMMENT ON PROCEDURE pr_refresh_club_views IS
'Refreshes club-related materialized views (currently league table).';

-- ─────────────────────────────────────────────────────────────
-- pr_refresh_competition_views
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE pr_refresh_competition_views()
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_league_table;
END;
$$;
COMMENT ON PROCEDURE pr_refresh_competition_views IS
'Refreshes competition-related materialized views.';

-- ============================================================
-- SECTION 10: GUARD TRIGGER — PREVENT HARD DELETE ON HISTORY
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- fn_prevent_hard_delete
-- Prevents accidental DELETE on historical tables without soft delete.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_prevent_hard_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RAISE EXCEPTION
        'Hard DELETE on table "%" is not permitted. Use fn_soft_delete() instead. '
        'To force a hard delete, use fn_hard_delete() with the confirmation token.',
        TG_TABLE_NAME;
    RETURN NULL;
END;
$$;
COMMENT ON FUNCTION fn_prevent_hard_delete IS
'Blocks any raw DELETE statement on protected historical tables. Soft delete must be used.';

-- Apply hard-delete guard to the most sensitive historical tables
DO $$
DECLARE
    tbl TEXT;
    sensitive_tables TEXT[] := ARRAY[
        'match_events','match_appearances','fact_assertions',
        'career_associations','award_recipients','record_holders',
        'institutional_lineage_nodes','source_documents'
    ];
BEGIN
    FOREACH tbl IN ARRAY sensitive_tables LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_prevent_delete ON %I;
             CREATE TRIGGER trg_%s_prevent_delete
             BEFORE DELETE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_prevent_hard_delete();',
            tbl, tbl, tbl, tbl
        );
    END LOOP;
END;
$$;

COMMIT;
