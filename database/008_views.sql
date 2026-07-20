-- ============================================================
-- FootballDB Database Views
-- Migration: 008_views.sql
-- Depends on: 001 through 007
-- ============================================================

BEGIN;

-- ============================================================
-- 1. PLAYER PROFILE VIEW
-- vw_player_profile
-- One row per person. Aggregates career, stats, awards.
-- ============================================================

CREATE VIEW vw_player_profile AS
SELECT
    p.id                                            AS person_id,
    p.primary_name,
    p.birth_year,
    p.birth_month,
    p.birth_day,
    p.birth_city,
    p.height_cm,
    p.preferred_foot,
    p.deleted_at                                    AS person_deleted_at,

    -- Birthplace geopolitical
    geo.primary_name                                AS birth_country,
    geo.iso_code                                    AS birth_country_iso,
    geo.fifa_code                                   AS birth_country_fifa,

    -- Current club (most recent active career association as Player)
    cur_ca.team_id                                  AS current_club_id,
    cur_team.primary_name                           AS current_club_name,
    cur_ca.role                                     AS current_role,
    cur_ca.employment_status                        AS current_employment_status,
    cur_ca.start_year                               AS current_club_start_year,

    -- Career appearance count (distinct matches started or on bench)
    (
        SELECT COUNT(*)
        FROM match_appearances ma
        WHERE ma.person_id = p.id
          AND ma.deleted_at IS NULL
    )                                               AS total_appearances,

    -- Goals (match events of type Goal or PenaltyGoal where actor = person)
    (
        SELECT COUNT(*)
        FROM match_events me
        WHERE me.actor_person_id = p.id
          AND me.event_type IN ('Goal', 'PenaltyGoal', 'OwnGoal')
          AND me.deleted_at IS NULL
    )                                               AS total_goals,

    -- Yellow cards
    (
        SELECT COUNT(*)
        FROM match_events me
        WHERE me.actor_person_id = p.id
          AND me.event_type = 'YellowCard'
          AND me.deleted_at IS NULL
    )                                               AS total_yellow_cards,

    -- Red cards (direct red + second yellow)
    (
        SELECT COUNT(*)
        FROM match_events me
        WHERE me.actor_person_id = p.id
          AND me.event_type IN ('RedCard', 'SecondYellow')
          AND me.deleted_at IS NULL
    )                                               AS total_red_cards,

    -- Award count
    (
        SELECT COUNT(*)
        FROM award_recipients ar
        WHERE ar.recipient_type = 'Person'
          AND ar.recipient_id = p.id
          AND ar.is_winner = TRUE
          AND ar.deleted_at IS NULL
    )                                               AS total_awards_won,

    -- Primary photo
    (
        SELECT ma.cdn_url
        FROM media_assets ma
        WHERE ma.entity_type = 'Person'
          AND ma.entity_id = p.id
          AND ma.asset_type = 'Image'
          AND ma.is_primary = TRUE
          AND ma.deleted_at IS NULL
        LIMIT 1
    )                                               AS primary_photo_url

FROM persons p
LEFT JOIN geopolitical_entities geo
    ON geo.id = p.birth_geopolitical_id
    AND geo.deleted_at IS NULL
LEFT JOIN LATERAL (
    SELECT ca.*
    FROM career_associations ca
    WHERE ca.person_id = p.id
      AND ca.is_current = TRUE
      AND ca.deleted_at IS NULL
    ORDER BY ca.start_year DESC, ca.start_month DESC NULLS LAST
    LIMIT 1
) cur_ca ON TRUE
LEFT JOIN teams cur_team
    ON cur_team.id = cur_ca.team_id
    AND cur_team.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

-- ============================================================
-- 2. CLUB PROFILE VIEW
-- vw_club_profile
-- One row per team.
-- ============================================================

CREATE VIEW vw_club_profile AS
SELECT
    t.id                                            AS team_id,
    t.primary_name,
    t.short_name,
    t.team_category,
    t.team_gender,
    t.foundation_year,
    t.dissolution_year,
    t.deleted_at                                    AS team_deleted_at,

    -- Governing organization
    org.id                                          AS governing_org_id,
    org.primary_name                                AS governing_org_name,
    org.abbreviation                                AS governing_org_abbreviation,

    -- Country
    geo.primary_name                                AS country_name,
    geo.iso_code                                    AS country_iso,
    geo.fifa_code                                   AS country_fifa,

    -- Current squad size (Players with active career association)
    (
        SELECT COUNT(*)
        FROM career_associations ca
        WHERE ca.team_id = t.id
          AND ca.role = 'Player'
          AND ca.is_current = TRUE
          AND ca.deleted_at IS NULL
    )                                               AS current_squad_size,

    -- Current manager
    (
        SELECT p.primary_name
        FROM career_associations ca
        JOIN persons p ON p.id = ca.person_id AND p.deleted_at IS NULL
        WHERE ca.team_id = t.id
          AND ca.role IN ('Manager', 'AssistantManager')
          AND ca.is_current = TRUE
          AND ca.deleted_at IS NULL
        ORDER BY ca.role ASC
        LIMIT 1
    )                                               AS current_manager_name,

    -- Total honors (awards won as a team)
    (
        SELECT COUNT(*)
        FROM award_recipients ar
        WHERE ar.recipient_type = 'Team'
          AND ar.recipient_id = t.id
          AND ar.is_winner = TRUE
          AND ar.deleted_at IS NULL
    )                                               AS total_honors,

    -- Primary logo
    (
        SELECT ma.cdn_url
        FROM media_assets ma
        WHERE ma.entity_type = 'Team'
          AND ma.entity_id = t.id
          AND ma.asset_type = 'Image'
          AND ma.is_primary = TRUE
          AND ma.deleted_at IS NULL
        LIMIT 1
    )                                               AS primary_logo_url

FROM teams t
LEFT JOIN organizations org
    ON org.id = t.governing_organization_id
    AND org.deleted_at IS NULL
LEFT JOIN geopolitical_entities geo
    ON geo.id = t.geopolitical_id
    AND geo.deleted_at IS NULL
WHERE t.deleted_at IS NULL;

-- ============================================================
-- 3. COMPETITION SUMMARY VIEW
-- vw_competition_summary
-- ============================================================

CREATE VIEW vw_competition_summary AS
SELECT
    c.id                                            AS competition_id,
    c.primary_name                                  AS competition_name,
    c.short_name,
    c.competition_gender,
    c.age_category,
    c.tier,
    c.founded_year,
    c.abolished_year,

    -- Governing body
    org.primary_name                                AS governing_body,
    org.abbreviation                                AS governing_body_abbreviation,

    -- Total editions
    (
        SELECT COUNT(*)
        FROM editions e
        WHERE e.competition_id = c.id
          AND e.deleted_at IS NULL
    )                                               AS total_editions,

    -- Latest edition
    (
        SELECT e.primary_name
        FROM editions e
        WHERE e.competition_id = c.id
          AND e.deleted_at IS NULL
        ORDER BY e.start_date DESC NULLS LAST
        LIMIT 1
    )                                               AS latest_edition_name,

    -- Primary logo
    (
        SELECT ma.cdn_url
        FROM media_assets ma
        WHERE ma.entity_type = 'Competition'
          AND ma.entity_id = c.id
          AND ma.asset_type = 'Image'
          AND ma.is_primary = TRUE
          AND ma.deleted_at IS NULL
        LIMIT 1
    )                                               AS primary_logo_url

FROM competitions c
LEFT JOIN organizations org
    ON org.id = c.governing_organization_id
    AND org.deleted_at IS NULL
WHERE c.deleted_at IS NULL;

-- ============================================================
-- 4. SEASON SUMMARY VIEW
-- vw_season_summary
-- One row per edition (competition x season).
-- ============================================================

CREATE VIEW vw_season_summary AS
SELECT
    e.id                                            AS edition_id,
    e.primary_name                                  AS edition_name,
    e.start_date,
    e.end_date,

    c.id                                            AS competition_id,
    c.primary_name                                  AS competition_name,

    s.id                                            AS season_id,
    s.primary_name                                  AS season_name,
    s.start_year,
    s.end_year,

    -- Host country
    geo.primary_name                                AS host_country,

    -- Total matches in this edition
    (
        SELECT COUNT(DISTINCT m.id)
        FROM stages st
        JOIN fixture_events fe ON fe.stage_id = st.id AND fe.deleted_at IS NULL
        JOIN matches m ON m.fixture_event_id = fe.id AND m.deleted_at IS NULL
        WHERE st.edition_id = e.id
          AND st.deleted_at IS NULL
    )                                               AS total_matches,

    -- Total goals in this edition
    (
        SELECT COUNT(me.id)
        FROM stages st
        JOIN fixture_events fe ON fe.stage_id = st.id AND fe.deleted_at IS NULL
        JOIN matches m ON m.fixture_event_id = fe.id AND m.deleted_at IS NULL
        JOIN match_events me
            ON me.match_id = m.id
           AND me.event_type IN ('Goal', 'PenaltyGoal', 'OwnGoal')
           AND me.deleted_at IS NULL
        WHERE st.edition_id = e.id
          AND st.deleted_at IS NULL
    )                                               AS total_goals,

    -- Champion (winner of the edition)
    (
        SELECT p.primary_name
        FROM award_recipients ar
        JOIN awards aw ON aw.id = ar.award_id AND aw.deleted_at IS NULL
        JOIN persons p ON p.id = ar.recipient_id AND p.deleted_at IS NULL
        WHERE ar.edition_id = e.id
          AND ar.is_winner = TRUE
          AND ar.placement = 1
          AND ar.recipient_type = 'Person'
          AND ar.deleted_at IS NULL
        LIMIT 1
    )                                               AS top_individual_award_winner

FROM editions e
JOIN competitions c ON c.id = e.competition_id AND c.deleted_at IS NULL
JOIN seasons s ON s.id = e.season_id AND s.deleted_at IS NULL
LEFT JOIN geopolitical_entities geo
    ON geo.id = e.host_geopolitical_id
    AND geo.deleted_at IS NULL
WHERE e.deleted_at IS NULL;

-- ============================================================
-- 5. MATCH SUMMARY VIEW
-- vw_match_summary
-- One row per match.
-- ============================================================

CREATE VIEW vw_match_summary AS
SELECT
    m.id                                            AS match_id,
    m.kickoff_time,
    m.home_score,
    m.away_score,
    m.home_penalty_score,
    m.away_penalty_score,
    m.attendance,
    m.status                                        AS match_status,

    -- Home team
    ht.id                                           AS home_team_id,
    ht.primary_name                                 AS home_team_name,

    -- Away team
    at2.id                                          AS away_team_id,
    at2.primary_name                                AS away_team_name,

    -- Result
    CASE
        WHEN m.home_score IS NULL OR m.away_score IS NULL THEN NULL
        WHEN m.home_score > m.away_score  THEN 'HomeWin'
        WHEN m.away_score > m.home_score  THEN 'AwayWin'
        ELSE 'Draw'
    END                                             AS result,

    -- Venue
    v.id                                            AS venue_id,
    v.primary_name                                  AS venue_name,
    v.city                                          AS venue_city,

    -- Competition and stage context (via fixture_event -> stage -> edition)
    fe.stage_id,
    st.primary_name                                 AS stage_name,
    st.edition_id,
    ed.primary_name                                 AS edition_name,
    ed.competition_id,
    comp.primary_name                               AS competition_name,
    ed.season_id,
    sn.primary_name                                 AS season_name,

    -- Referee
    (
        SELECT p.primary_name
        FROM match_official_assignments moa
        JOIN persons p ON p.id = moa.person_id AND p.deleted_at IS NULL
        WHERE moa.match_id = m.id
          AND moa.role = 'Referee'
          AND moa.deleted_at IS NULL
        LIMIT 1
    )                                               AS referee_name,

    -- VAR
    (
        SELECT p.primary_name
        FROM match_official_assignments moa
        JOIN persons p ON p.id = moa.person_id AND p.deleted_at IS NULL
        WHERE moa.match_id = m.id
          AND moa.role = 'VAR'
          AND moa.deleted_at IS NULL
        LIMIT 1
    )                                               AS var_official_name,

    -- Penalty shootout flag
    (m.home_penalty_score IS NOT NULL OR m.away_penalty_score IS NOT NULL)
                                                    AS had_penalty_shootout

FROM matches m
JOIN teams ht  ON ht.id  = m.home_team_id  AND ht.deleted_at IS NULL
JOIN teams at2 ON at2.id = m.away_team_id  AND at2.deleted_at IS NULL
LEFT JOIN venues v ON v.id = m.venue_id AND v.deleted_at IS NULL
LEFT JOIN fixture_events fe ON fe.id = m.fixture_event_id AND fe.deleted_at IS NULL
LEFT JOIN stages st ON st.id = fe.stage_id AND st.deleted_at IS NULL
LEFT JOIN editions ed ON ed.id = st.edition_id AND ed.deleted_at IS NULL
LEFT JOIN competitions comp ON comp.id = ed.competition_id AND comp.deleted_at IS NULL
LEFT JOIN seasons sn ON sn.id = ed.season_id AND sn.deleted_at IS NULL
WHERE m.deleted_at IS NULL;

-- ============================================================
-- 6. CAREER SUMMARY VIEW
-- vw_career_summary
-- One row per career association.
-- ============================================================

CREATE VIEW vw_career_summary AS
SELECT
    ca.id                                           AS career_association_id,
    p.id                                            AS person_id,
    p.primary_name                                  AS person_name,
    t.id                                            AS team_id,
    t.primary_name                                  AS team_name,
    t.team_category,
    ca.role,
    ca.employment_status,
    ca.start_year,
    ca.start_month,
    ca.start_day,
    ca.end_year,
    ca.end_month,
    ca.end_day,
    ca.is_current,
    ca.notes,
    -- Approximate duration in years (nullable if open-ended)
    CASE
        WHEN ca.end_year IS NOT NULL
        THEN ca.end_year - ca.start_year
        ELSE NULL
    END                                             AS duration_years
FROM career_associations ca
JOIN persons p ON p.id = ca.person_id AND p.deleted_at IS NULL
JOIN teams t   ON t.id = ca.team_id   AND t.deleted_at IS NULL
WHERE ca.deleted_at IS NULL
ORDER BY ca.start_year, ca.start_month NULLS LAST;

-- ============================================================
-- 7. CLUB LINEAGE VIEW (RECURSIVE)
-- vw_club_lineage
-- Traverses InstitutionalLineageNode DAG.
-- ============================================================

CREATE VIEW vw_club_lineage AS
WITH RECURSIVE lineage AS (
    -- Base: root nodes (no predecessor)
    SELECT
        iln.id                                      AS node_id,
        iln.team_id,
        iln.predecessor_team_id,
        iln.change_type,
        iln.change_year,
        iln.change_month,
        iln.change_day,
        iln.description,
        iln.team_id                                 AS root_team_id,
        0                                           AS depth,
        ARRAY[iln.team_id]                          AS path
    FROM institutional_lineage_nodes iln
    WHERE iln.predecessor_team_id IS NULL
      AND iln.deleted_at IS NULL

    UNION ALL

    -- Recursive: follow successors
    SELECT
        iln.id,
        iln.team_id,
        iln.predecessor_team_id,
        iln.change_type,
        iln.change_year,
        iln.change_month,
        iln.change_day,
        iln.description,
        lin.root_team_id,
        lin.depth + 1,
        lin.path || iln.team_id
    FROM institutional_lineage_nodes iln
    JOIN lineage lin
        ON lin.team_id = iln.predecessor_team_id
    WHERE iln.deleted_at IS NULL
      AND NOT (iln.team_id = ANY(lin.path))   -- cycle guard
)
SELECT
    lin.node_id,
    lin.root_team_id,
    rt.primary_name                                 AS root_team_name,
    lin.team_id,
    t.primary_name                                  AS team_name,
    lin.predecessor_team_id,
    pt.primary_name                                 AS predecessor_team_name,
    lin.change_type,
    lin.change_year,
    lin.change_month,
    lin.change_day,
    lin.description,
    lin.depth
FROM lineage lin
JOIN teams t   ON t.id  = lin.team_id          AND t.deleted_at IS NULL
JOIN teams rt  ON rt.id = lin.root_team_id     AND rt.deleted_at IS NULL
LEFT JOIN teams pt ON pt.id = lin.predecessor_team_id AND pt.deleted_at IS NULL;

-- ============================================================
-- 8. AWARD HISTORY VIEW
-- vw_award_history
-- Flattens Award -> AwardRecipient.
-- ============================================================

CREATE VIEW vw_award_history AS
SELECT
    a.id                                            AS award_id,
    a.primary_name                                  AS award_name,
    a.category                                      AS award_category,
    a.subject_type,
    org.primary_name                                AS governing_body,

    ar.id                                           AS recipient_id,
    ar.recipient_type,
    ar.recipient_id                                 AS recipient_entity_id,
    ar.award_year,
    ar.placement,
    ar.is_winner,
    ar.is_shared,
    ar.citation,
    ar.notes                                        AS recipient_notes,

    -- Edition context
    ed.primary_name                                 AS edition_name,
    sn.primary_name                                 AS season_name,

    -- Resolved recipient name (person or team)
    COALESCE(
        (SELECT p.primary_name FROM persons p WHERE p.id = ar.recipient_id AND p.deleted_at IS NULL),
        (SELECT t.primary_name FROM teams t   WHERE t.id = ar.recipient_id AND t.deleted_at IS NULL)
    )                                               AS recipient_name

FROM awards a
LEFT JOIN organizations org ON org.id = a.governing_organization_id AND org.deleted_at IS NULL
JOIN award_recipients ar ON ar.award_id = a.id AND ar.deleted_at IS NULL
LEFT JOIN editions ed ON ed.id = ar.edition_id AND ed.deleted_at IS NULL
LEFT JOIN seasons sn ON sn.id = ar.season_id AND sn.deleted_at IS NULL
WHERE a.deleted_at IS NULL
ORDER BY ar.award_year DESC NULLS LAST;

-- ============================================================
-- 9. RECORD HISTORY VIEW
-- vw_record_history
-- Flattens Record -> RecordHolder.
-- ============================================================

CREATE VIEW vw_record_history AS
SELECT
    r.id                                            AS record_id,
    r.primary_name                                  AS record_name,
    r.category                                      AS record_category,
    r.measurement_type,
    r.unit,
    r.record_value,
    r.verification_status,
    r.effective_from,
    r.effective_to,
    org.primary_name                                AS governing_body,

    rh.id                                           AS holder_entry_id,
    rh.holder_type,
    rh.holder_id                                    AS holder_entity_id,
    rh.start_year,
    rh.start_month,
    rh.start_day,
    rh.end_year,
    rh.end_month,
    rh.end_day,
    rh.is_current,
    rh.is_shared,
    rh.notes                                        AS holder_notes,

    -- Resolved holder name
    COALESCE(
        (SELECT p.primary_name FROM persons p WHERE p.id = rh.holder_id AND p.deleted_at IS NULL),
        (SELECT t.primary_name FROM teams t   WHERE t.id = rh.holder_id AND t.deleted_at IS NULL)
    )                                               AS holder_name

FROM records r
LEFT JOIN organizations org ON org.id = r.governing_organization_id AND org.deleted_at IS NULL
JOIN record_holders rh ON rh.record_id = r.id AND rh.deleted_at IS NULL
WHERE r.deleted_at IS NULL
ORDER BY rh.is_current DESC, rh.start_year DESC NULLS LAST;

-- ============================================================
-- 10. LEAGUE TABLE VIEW
-- mv_league_table (MATERIALIZED — computed snapshot)
-- Refreshed explicitly after match events are committed.
-- ============================================================

CREATE MATERIALIZED VIEW mv_league_table AS
SELECT
    st.id                                           AS stage_id,
    st.edition_id,
    ed.competition_id,
    sn.id                                           AS season_id,
    snt.team_id,
    t.primary_name                                  AS team_name,
    snt.matchweek,
    snt.snapshot_date,
    snt.position,
    snt.played,
    snt.won,
    snt.drawn,
    snt.lost,
    snt.goals_for,
    snt.goals_against,
    snt.goals_for - snt.goals_against               AS goal_difference,
    snt.points,
    snt.points_deducted,
    snt.points - snt.points_deducted                AS effective_points,
    snt.deduction_reason,
    snt.status,
    ed.primary_name                                 AS edition_name,
    comp.primary_name                               AS competition_name,
    sn.primary_name                                 AS season_name
FROM standing_tables snt
JOIN stages st   ON st.id   = snt.stage_id         AND st.deleted_at IS NULL
JOIN editions ed ON ed.id   = st.edition_id         AND ed.deleted_at IS NULL
JOIN seasons sn  ON sn.id   = ed.season_id
JOIN competitions comp ON comp.id = ed.competition_id AND comp.deleted_at IS NULL
JOIN teams t     ON t.id    = snt.team_id            AND t.deleted_at IS NULL
WHERE snt.deleted_at IS NULL
ORDER BY snt.stage_id, snt.matchweek NULLS LAST, snt.position;

CREATE UNIQUE INDEX mv_league_table_pk
    ON mv_league_table(stage_id, team_id, matchweek, snapshot_date);
CREATE INDEX mv_league_table_edition
    ON mv_league_table(edition_id, position);
CREATE INDEX mv_league_table_competition
    ON mv_league_table(competition_id, season_id, position);
CREATE INDEX mv_league_table_team
    ON mv_league_table(team_id);

-- ============================================================
-- 11. PLAYER STATS MATERIALIZED VIEW
-- mv_player_stats
-- Pre-aggregated per player. Refresh after match import.
-- ============================================================

CREATE MATERIALIZED VIEW mv_player_stats AS
SELECT
    p.id                                            AS person_id,
    p.primary_name,
    COUNT(DISTINCT ma.match_id)                     AS total_appearances,
    COUNT(DISTINCT CASE WHEN ma.is_starter THEN ma.match_id END)
                                                    AS starts,
    COUNT(DISTINCT CASE WHEN NOT ma.is_starter THEN ma.match_id END)
                                                    AS substitute_appearances,
    COALESCE(SUM(ma.minutes_played), 0)             AS total_minutes,
    COUNT(DISTINCT CASE WHEN me_goal.id IS NOT NULL THEN me_goal.match_id END)
                                                    AS matches_scored_in,
    COALESCE(COUNT(me_goal.id), 0)                  AS total_goals,
    COALESCE(COUNT(me_yc.id), 0)                    AS yellow_cards,
    COALESCE(COUNT(me_rc.id), 0)                    AS red_cards
FROM persons p
LEFT JOIN match_appearances ma
    ON ma.person_id = p.id AND ma.deleted_at IS NULL
LEFT JOIN match_events me_goal
    ON me_goal.actor_person_id = p.id
   AND me_goal.event_type IN ('Goal', 'PenaltyGoal')
   AND me_goal.deleted_at IS NULL
LEFT JOIN match_events me_yc
    ON me_yc.actor_person_id = p.id
   AND me_yc.event_type = 'YellowCard'
   AND me_yc.deleted_at IS NULL
LEFT JOIN match_events me_rc
    ON me_rc.actor_person_id = p.id
   AND me_rc.event_type IN ('RedCard', 'SecondYellow')
   AND me_rc.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.primary_name;

CREATE UNIQUE INDEX mv_player_stats_pk
    ON mv_player_stats(person_id);
CREATE INDEX mv_player_stats_goals
    ON mv_player_stats(total_goals DESC);
CREATE INDEX mv_player_stats_appearances
    ON mv_player_stats(total_appearances DESC);

COMMIT;
