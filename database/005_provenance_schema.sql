BEGIN;

CREATE TYPE source_document_type AS ENUM (
    'Book',
    'Newspaper',
    'Magazine',
    'Website',
    'OfficialFederation',
    'FIFADocument',
    'UEFADocument',
    'RSSSF',
    'WorldFootball',
    'Transfermarkt',
    'Archive',
    'PersonalResearch'
);

CREATE TYPE assertion_type AS ENUM (
    'Primary',
    'Secondary',
    'Corroborating',
    'Conflicting',
    'Retracted'
);

CREATE TYPE staged_record_status AS ENUM (
    'Pending',
    'Validated',
    'Rejected',
    'Merged',
    'Duplicate',
    'Error'
);

CREATE TYPE conflict_resolution_status AS ENUM (
    'Pending',
    'Accepted',
    'Rejected',
    'NeedsReview',
    'Duplicate',
    'Escalated'
);

CREATE TYPE conflict_priority AS ENUM (
    'Low',
    'Normal',
    'High',
    'Critical'
);

CREATE TABLE source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type source_document_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(300),
    publisher VARCHAR(300),
    publication_year SMALLINT,
    publication_month SMALLINT,
    publication_day SMALLINT,
    edition VARCHAR(50),
    isbn VARCHAR(20),
    url VARCHAR(2000),
    archive_reference VARCHAR(500),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    citation_format TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_source_pub_month CHECK (publication_month IS NULL OR (publication_month >= 1 AND publication_month <= 12)),
    CONSTRAINT check_source_pub_day CHECK (publication_day IS NULL OR (publication_day >= 1 AND publication_day <= 31)),
    CONSTRAINT check_source_pub_day_requires_month CHECK (publication_day IS NULL OR publication_month IS NOT NULL),
    CONSTRAINT check_source_isbn_length CHECK (isbn IS NULL OR length(trim(isbn)) >= 10)
);

CREATE INDEX idx_source_doc_type ON source_documents(doc_type);
CREATE INDEX idx_source_title ON source_documents(title);
CREATE INDEX idx_source_author ON source_documents(author);
CREATE INDEX idx_source_isbn ON source_documents(isbn) WHERE isbn IS NOT NULL;
CREATE INDEX idx_source_url ON source_documents(url) WHERE url IS NOT NULL;
CREATE INDEX idx_source_pub_year ON source_documents(publication_year);
CREATE INDEX idx_source_deleted_at ON source_documents(deleted_at);

CREATE TABLE fact_assertions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE RESTRICT,
    match_event_id UUID REFERENCES match_events(id) ON DELETE RESTRICT,
    assertion_type assertion_type NOT NULL DEFAULT 'Primary',
    confidence_score SMALLINT NOT NULL DEFAULT 100,
    assertion_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewer_id UUID,
    verification_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_confidence_range CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

CREATE INDEX idx_fact_source ON fact_assertions(source_document_id);
CREATE INDEX idx_fact_match_event ON fact_assertions(match_event_id);
CREATE INDEX idx_fact_assertion_type ON fact_assertions(assertion_type);
CREATE INDEX idx_fact_confidence ON fact_assertions(confidence_score);
CREATE INDEX idx_fact_reviewer ON fact_assertions(reviewer_id);
CREATE INDEX idx_fact_verification ON fact_assertions(verification_date);
CREATE INDEX idx_fact_deleted_at ON fact_assertions(deleted_at);

CREATE TABLE staged_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_batch_id UUID NOT NULL,
    source_document_id UUID REFERENCES source_documents(id) ON DELETE RESTRICT,
    source_file VARCHAR(1000),
    raw_payload JSONB NOT NULL,
    processing_status staged_record_status NOT NULL DEFAULT 'Pending',
    validation_errors JSONB,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parser_version VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID
);

CREATE INDEX idx_staged_batch ON staged_records(import_batch_id);
CREATE INDEX idx_staged_source ON staged_records(source_document_id);
CREATE INDEX idx_staged_status ON staged_records(processing_status);
CREATE INDEX idx_staged_status_pending ON staged_records(processing_status) WHERE processing_status = 'Pending';
CREATE INDEX idx_staged_imported ON staged_records(imported_at);
CREATE INDEX idx_staged_deleted_at ON staged_records(deleted_at);
CREATE INDEX idx_staged_payload ON staged_records USING gin(raw_payload);

CREATE TABLE conflict_resolution_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staged_record_id UUID NOT NULL REFERENCES staged_records(id) ON DELETE RESTRICT,
    status conflict_resolution_status NOT NULL DEFAULT 'Pending',
    priority conflict_priority NOT NULL DEFAULT 'Normal',
    reviewer_id UUID,
    resolution_timestamp TIMESTAMPTZ,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    CONSTRAINT check_resolution_timestamp CHECK (
        resolution_timestamp IS NULL OR status NOT IN ('Pending', 'NeedsReview')
    ),
    CONSTRAINT unique_conflict_per_staged UNIQUE (staged_record_id)
);

CREATE INDEX idx_conflict_staged ON conflict_resolution_tasks(staged_record_id);
CREATE INDEX idx_conflict_status ON conflict_resolution_tasks(status);
CREATE INDEX idx_conflict_status_pending ON conflict_resolution_tasks(status) WHERE status IN ('Pending', 'NeedsReview', 'Escalated');
CREATE INDEX idx_conflict_priority ON conflict_resolution_tasks(priority);
CREATE INDEX idx_conflict_reviewer ON conflict_resolution_tasks(reviewer_id);
CREATE INDEX idx_conflict_resolution_time ON conflict_resolution_tasks(resolution_timestamp);
CREATE INDEX idx_conflict_deleted_at ON conflict_resolution_tasks(deleted_at);

COMMIT;
