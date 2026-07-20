BEGIN;

CREATE TYPE media_entity_type AS ENUM (
    'Person',
    'Team',
    'Organization',
    'Competition',
    'Edition',
    'Stage',
    'Match',
    'Venue',
    'SourceDocument'
);

CREATE TYPE media_asset_type AS ENUM (
    'Image',
    'Video',
    'Audio',
    'PDF',
    'Document',
    'SVG',
    'ExternalLink'
);

CREATE TYPE storage_provider AS ENUM (
    'Local',
    'S3',
    'CloudStorage',
    'CDN'
);

CREATE TYPE media_visibility AS ENUM (
    'Public',
    'Internal',
    'Restricted',
    'Private'
);

CREATE TYPE ocr_status AS ENUM (
    'NotApplicable',
    'Pending',
    'Completed',
    'Failed'
);

CREATE TYPE image_variant AS ENUM (
    'Thumbnail',
    'Medium',
    'Original',
    'Retina'
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Polymorphic association
    entity_type media_entity_type NOT NULL,
    entity_id UUID NOT NULL,

    -- Asset classification
    asset_type media_asset_type NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- File metadata
    file_name VARCHAR(500) NOT NULL,
    original_file_name VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    checksum VARCHAR(128),

    -- Storage
    storage_provider storage_provider NOT NULL DEFAULT 'S3',
    storage_path VARCHAR(2000) NOT NULL,
    cdn_url VARCHAR(2000),
    external_url VARCHAR(2000),

    -- Image dimensions
    width_px INTEGER,
    height_px INTEGER,
    image_variant image_variant,

    -- Image crop metadata (JSON: {x, y, width, height})
    crop_info JSONB,

    -- Video metadata
    duration_seconds DECIMAL(12,3),
    resolution_label VARCHAR(20),
    frame_rate DECIMAL(6,3),
    codec VARCHAR(50),
    video_thumbnail_path VARCHAR(2000),

    -- Document metadata
    page_count SMALLINT,
    ocr_status ocr_status NOT NULL DEFAULT 'NotApplicable',
    is_searchable BOOLEAN NOT NULL DEFAULT FALSE,

    -- Descriptive metadata
    alt_text VARCHAR(500),
    caption TEXT,
    description TEXT,
    language VARCHAR(10) DEFAULT 'en',

    -- Attribution
    photographer VARCHAR(200),
    copyright VARCHAR(500),
    copyright_owner VARCHAR(200),
    license VARCHAR(200),

    -- Valid time (when the photo was physically taken or the video was recorded)
    valid_from DATE,
    valid_to DATE,

    -- Display
    visibility media_visibility NOT NULL DEFAULT 'Public',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    display_order SMALLINT NOT NULL DEFAULT 0,

    -- Upload tracking
    upload_source VARCHAR(200),
    uploaded_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,

    CONSTRAINT check_media_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
    CONSTRAINT check_media_dimensions CHECK (
        (width_px IS NULL AND height_px IS NULL) OR
        (width_px IS NOT NULL AND height_px IS NOT NULL)
    ),
    CONSTRAINT check_media_width CHECK (width_px IS NULL OR width_px > 0),
    CONSTRAINT check_media_height CHECK (height_px IS NULL OR height_px > 0),
    CONSTRAINT check_media_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT check_media_page_count CHECK (page_count IS NULL OR page_count > 0),
    CONSTRAINT check_media_valid_time CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from),
    CONSTRAINT check_media_display_order CHECK (display_order >= 0),
    CONSTRAINT check_external_link_has_url CHECK (
        asset_type != 'ExternalLink' OR external_url IS NOT NULL
    )
);

-- Polymorphic lookup (the primary query pattern for every page)
CREATE INDEX idx_media_entity ON media_assets(entity_type, entity_id);

-- Primary image per entity (Player profile, Club page, Competition page)
CREATE INDEX idx_media_primary ON media_assets(entity_type, entity_id, is_primary)
    WHERE is_primary = TRUE AND deleted_at IS NULL;

-- Display-ordered gallery per entity
CREATE INDEX idx_media_display_order ON media_assets(entity_type, entity_id, display_order)
    WHERE deleted_at IS NULL;

-- Media type filtering
CREATE INDEX idx_media_asset_type ON media_assets(asset_type);
CREATE INDEX idx_media_mime_type ON media_assets(mime_type);

-- Storage management
CREATE INDEX idx_media_storage_provider ON media_assets(storage_provider);
CREATE INDEX idx_media_storage_path ON media_assets(storage_path);

-- Duplicate detection via checksum
CREATE INDEX idx_media_checksum ON media_assets(checksum) WHERE checksum IS NOT NULL;

-- Upload audit trail
CREATE INDEX idx_media_upload_source ON media_assets(upload_source) WHERE upload_source IS NOT NULL;
CREATE INDEX idx_media_uploaded_by ON media_assets(uploaded_by) WHERE uploaded_by IS NOT NULL;

-- Temporal / historical archive browsing
CREATE INDEX idx_media_valid_from ON media_assets(valid_from) WHERE valid_from IS NOT NULL;

-- Soft delete
CREATE INDEX idx_media_deleted_at ON media_assets(deleted_at);

COMMIT;
