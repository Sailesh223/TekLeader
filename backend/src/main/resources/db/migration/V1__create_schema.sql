-- Create managers table
CREATE TABLE managers (
    id BIGSERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    canonical_name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_managers_canonical_name ON managers(canonical_name);

-- Create monthly_metrics table
CREATE TABLE monthly_metrics (
    id BIGSERIAL PRIMARY KEY,
    manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,
    functional_head VARCHAR(255) NOT NULL,
    headcount INTEGER NOT NULL CHECK (headcount >= 0),
    one_on_ones INTEGER NOT NULL CHECK (one_on_ones >= 0),
    not_utilising INTEGER NOT NULL CHECK (not_utilising >= 0),
    utilization DECIMAL(5,2) NOT NULL CHECK (utilization >= 0 AND utilization <= 100),
    team_size_score DECIMAL(5,2) NOT NULL CHECK (team_size_score >= 0 AND team_size_score <= 100),
    consistency_score DECIMAL(5,2) NOT NULL CHECK (consistency_score >= 0 AND consistency_score <= 100),
    final_score DECIMAL(5,2) NOT NULL CHECK (final_score >= 0 AND final_score <= 100),
    classification_band VARCHAR(50) NOT NULL,
    rank INTEGER,
    rank_change INTEGER,
    formula_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_manager_month UNIQUE (manager_id, month)
);

CREATE INDEX idx_monthly_metrics_month ON monthly_metrics(month);
CREATE INDEX idx_monthly_metrics_month_score ON monthly_metrics(month, final_score DESC);
CREATE INDEX idx_monthly_metrics_functional_head_month ON monthly_metrics(functional_head, month);
CREATE INDEX idx_monthly_metrics_manager_month ON monthly_metrics(manager_id, month);

-- Create badge_definitions table
CREATE TABLE badge_definitions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_key VARCHAR(100),
    color VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badge_definitions_code ON badge_definitions(code);
CREATE INDEX idx_badge_definitions_active ON badge_definitions(active);

-- Create badge_awards table
CREATE TABLE badge_awards (
    id BIGSERIAL PRIMARY KEY,
    manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
    badge_definition_id BIGINT NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    CONSTRAINT unique_manager_badge_month UNIQUE (manager_id, badge_definition_id, month)
);

CREATE INDEX idx_badge_awards_manager ON badge_awards(manager_id);
CREATE INDEX idx_badge_awards_month ON badge_awards(month);
CREATE INDEX idx_badge_awards_badge ON badge_awards(badge_definition_id);

-- Create formula_config table
CREATE TABLE formula_config (
    id BIGSERIAL PRIMARY KEY,
    version INTEGER NOT NULL UNIQUE,
    utilization_weight DECIMAL(3,2) NOT NULL CHECK (utilization_weight >= 0 AND utilization_weight <= 1),
    team_size_weight DECIMAL(3,2) NOT NULL CHECK (team_size_weight >= 0 AND team_size_weight <= 1),
    consistency_weight DECIMAL(3,2) NOT NULL CHECK (consistency_weight >= 0 AND consistency_weight <= 1),
    team_size_mapping JSONB NOT NULL,
    classification_thresholds JSONB NOT NULL,
    consistency_penalty_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.0,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    CONSTRAINT weights_sum_to_one CHECK (
        ABS((utilization_weight + team_size_weight + consistency_weight) - 1.0) < 0.01
    )
);

CREATE INDEX idx_formula_config_active ON formula_config(active);
CREATE INDEX idx_formula_config_version ON formula_config(version);

-- Create upload_history table
CREATE TABLE upload_history (
    id BIGSERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    upload_mode VARCHAR(20) NOT NULL,
    records_processed INTEGER NOT NULL,
    records_created INTEGER NOT NULL,
    records_updated INTEGER NOT NULL,
    records_skipped INTEGER NOT NULL,
    records_failed INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_report TEXT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms BIGINT
);

CREATE INDEX idx_upload_history_month ON upload_history(month);
CREATE INDEX idx_upload_history_uploaded_at ON upload_history(uploaded_at DESC);

