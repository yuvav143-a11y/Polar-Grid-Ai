-- POLAR-GRID AI - PostgreSQL Database Schema
-- Intelligent Grid Energy Management & AI Analytics

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    selected_station_id VARCHAR(50) DEFAULT 'station-alpha',
    role VARCHAR(50) DEFAULT 'GRID_OPERATOR',
    account_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS research_stations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    coordinates VARCHAR(100) NOT NULL,
    grid_capacity_mw NUMERIC(10, 2) NOT NULL,
    connected_sources TEXT[] NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    ambient_temp_c NUMERIC(5, 2) DEFAULT -28.5,
    wind_chill_c NUMERIC(5, 2) DEFAULT -42.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stations (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, station_id)
);

CREATE TABLE IF NOT EXISTS grid_nodes (
    id VARCHAR(50) PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    substation_type VARCHAR(100) NOT NULL,
    rated_voltage_kv NUMERIC(8, 2) NOT NULL,
    max_load_mw NUMERIC(8, 2) NOT NULL,
    current_status VARCHAR(50) DEFAULT 'NORMAL',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grid_readings (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    node_id VARCHAR(50) REFERENCES grid_nodes(id) ON DELETE CASCADE,
    voltage_kv NUMERIC(8, 2) NOT NULL,
    frequency_hz NUMERIC(6, 3) NOT NULL,
    load_mw NUMERIC(8, 2) NOT NULL,
    generation_mw NUMERIC(8, 2) NOT NULL,
    consumption_mw NUMERIC(8, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grid_readings_station_time ON grid_readings(station_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS energy_sources (
    id VARCHAR(50) PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- SOLAR, WIND, HYDRO, DIESEL, BATTERY
    name VARCHAR(100) NOT NULL,
    capacity_mw NUMERIC(8, 2) NOT NULL,
    current_output_mw NUMERIC(8, 2) NOT NULL,
    availability_pct NUMERIC(5, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    prediction_horizon VARCHAR(50) NOT NULL, -- 1H, 6H, 24H
    predicted_load_mw NUMERIC(8, 2) NOT NULL,
    predicted_renewable_mw NUMERIC(8, 2) NOT NULL,
    confidence_pct NUMERIC(5, 2) NOT NULL,
    trend VARCHAR(50) NOT NULL,
    peak_period_window VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- NORMAL, WARNING, CRITICAL
    location VARCHAR(150) NOT NULL,
    node_id VARCHAR(50),
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(50) PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    priority VARCHAR(50) NOT NULL, -- HIGH, MEDIUM, LOW
    reason TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    affected_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES research_stations(id) ON DELETE CASCADE,
    report_title VARCHAR(200) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_generation_mwh NUMERIC(12, 2) NOT NULL,
    total_consumption_mwh NUMERIC(12, 2) NOT NULL,
    renewable_percentage NUMERIC(5, 2) NOT NULL,
    average_efficiency NUMERIC(5, 2) NOT NULL,
    grid_health_score NUMERIC(5, 2) NOT NULL,
    anomalies_detected INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    alert_notifications_enabled BOOLEAN DEFAULT TRUE,
    high_load_threshold_pct NUMERIC(5, 2) DEFAULT 88.0,
    voltage_variance_tolerance_pct NUMERIC(5, 2) DEFAULT 4.5,
    theme VARCHAR(20) DEFAULT 'dark',
    auto_acknowledge_minor_alerts BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
