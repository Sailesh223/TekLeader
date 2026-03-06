# Product Requirements Document (PRD)
# Lattice Utilization Leaderboard

**Version:** 1.0  
**Date:** March 6, 2026  
**Project Owner:** Sri  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Objectives & Goals](#objectives--goals)
4. [Target Users](#target-users)
5. [Functional Requirements](#functional-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Data Models](#data-models)
8. [Scoring & Classification Logic](#scoring--classification-logic)
9. [Badge System](#badge-system)
10. [API Specifications](#api-specifications)
11. [UI/UX Requirements](#uiux-requirements)
12. [Security & Authentication](#security--authentication)
13. [Performance Requirements](#performance-requirements)
14. [Deployment & DevOps](#deployment--devops)
15. [Success Metrics](#success-metrics)
16. [Timeline & Milestones](#timeline--milestones)
17. [Appendix](#appendix)

---

## 1. Executive Summary

The **Lattice Utilization Leaderboard** is a gamified, data-intensive dashboard designed to track, visualize, and incentivize manager performance based on 1:1 meeting utilization metrics. The platform features two distinct dashboards:

- **Admin Dashboard**: Full control over data imports, formula customization, leaderboard management, and analytics
- **User Dashboard**: Immersive, engaging leaderboard view with animations and gamification elements

The system automatically processes monthly Excel reports, calculates utilization scores using a weighted formula, assigns classification bands (Gold/Silver/Bronze/Ignition Zone), awards recognition badges, and maintains historical trends—all without manual recalculation.

---

## 2. Project Overview

### 2.1 Background

Managers are evaluated on their 1:1 meeting utilization with team members. Historical data shows varying performance across teams of different sizes and functional heads. To drive engagement and improvement, a gamified leaderboard system is needed that:

- Rewards consistent high performers
- Recognizes improvement
- Accounts for team size complexity
- Provides transparency and motivation

### 2.2 Problem Statement

Current challenges:
- Manual calculation of utilization scores is time-consuming
- No visibility into month-over-month trends
- Lack of recognition for consistent performers or improvers
- No differentiation for team size complexity
- Limited engagement with utilization metrics

### 2.3 Solution

A full-stack web application that:
- Automates monthly data ingestion from Excel reports
- Calculates multi-dimensional scores (utilization, team size, consistency)
- Assigns classification bands and recognition badges
- Provides interactive, animated dashboards
- Enables trend analysis and historical tracking
- Offers admin flexibility to customize formulas and views

---

## 3. Objectives & Goals

### 3.1 Primary Objectives

1. **Automate Score Calculation**: Eliminate manual computation with scalable monthly append model
2. **Gamify Performance**: Drive engagement through badges, bands, and visual recognition
3. **Enable Trend Analysis**: Track month-over-month performance and consistency
4. **Provide Transparency**: Give all users visibility into rankings and criteria
5. **Support Customization**: Allow admins to adjust formulas and display preferences

### 3.2 Success Criteria

- ✅ 100% automated score calculation upon Excel upload
- ✅ Sub-2-second leaderboard load time for 150+ managers
- ✅ Zero manual intervention required for monthly updates
- ✅ Admin can modify scoring formula without code changes
- ✅ Engaging UI with smooth animations and professional design
- ✅ Support for 6+ months of historical data with trend visualization

---

## 4. Target Users

### 4.1 User Personas

#### Persona 1: Admin User (HR/Analytics Team)
- **Role**: Upload monthly data, configure system, analyze trends
- **Needs**: 
  - Easy Excel upload with validation
  - Formula customization interface
  - Comprehensive analytics and reporting
  - Error handling and data quality checks
- **Technical Proficiency**: Medium to High

#### Persona 2: Manager (Leaderboard Viewer)
- **Role**: View own performance and compare with peers
- **Needs**:
  - Clear, engaging leaderboard visualization
  - Personal performance trends
  - Badge achievements and recognition
  - Understanding of scoring criteria
- **Technical Proficiency**: Low to Medium

#### Persona 3: Functional Head (Leadership)
- **Role**: Monitor team performance across managers
- **Needs**:
  - Filtered views by functional area
  - Team-level analytics
  - Identification of top performers and improvement opportunities
- **Technical Proficiency**: Medium

---

## 5. Functional Requirements

### 5.1 Admin Dashboard Features

#### 5.1.1 Data Import Module

**FR-A1: Excel Upload Interface**
- **Description**: Upload monthly Excel files containing manager utilization data
- **Inputs**:
  - Excel file (`.xlsx` format)
  - Month selection (YYYY-MM format, dropdown or date picker)
  - Upload mode: `Overwrite` or `Skip` existing data
- **Validations**:
  - File must contain "People Manager Pivot Summary" tab
  - Required columns must be present (exact header match)
  - Month must be valid and not in future
- **Outputs**:
  - Import summary (records processed, created, updated, skipped)
  - Row-level error report with line numbers
  - Success/failure status
- **Acceptance Criteria**:
  - ✅ Supports files up to 10MB
  - ✅ Validates all required columns before processing
  - ✅ Shows real-time upload progress
  - ✅ Displays detailed error messages for invalid data
  - ✅ Allows download of error report as CSV

**FR-A2: Data Filtering**
- **Description**: Filter imported data by Functional Head before processing
- **Filters**:
  - Kunal Bhattacharya
  - Teza Mukkavilli
  - Option to add/remove functional heads dynamically
- **Acceptance Criteria**:
  - ✅ Only selected functional heads are processed
  - ✅ Filter selection persists across sessions
  - ✅ Clear indication of active filters

**FR-A3: Data Validation & Normalization**
- **Manager Name**: Trim whitespace, collapse multiple spaces, case-insensitive uniqueness
- **Utilization %**: Accept formats: `85%`, `85`, `0.85` → normalize to 0-100 range
- **Headcount**: Non-negative integer
- **1:1s Participated**: Non-negative integer
- **Total users not utilizing**: Non-negative integer
- **Error Handling**: Return row number, column name, invalid value, and expected format

**FR-A4: Upload History & Audit Log**
- Track all uploads with timestamp, user, month, records count, status
- Ability to view/download previous upload results
- Rollback capability for last upload (optional)

#### 5.1.2 Formula Customization Module

**FR-A5: Dynamic Formula Builder**
- **Description**: Visual interface to customize scoring formula without code changes
- **Components**:
  - Weight sliders for each component (Utilization, Team Size, Consistency)
  - Weights must sum to 1.0 (100%)
  - Real-time preview of formula impact on sample data
- **Default Formula**:
  ```
  FinalScore = 0.7 × Utilization + 0.2 × TeamSizeScore + 0.1 × ConsistencyScore
  ```
- **Customizable Elements**:
  - Component weights (0.0 - 1.0)
  - Team size bonus thresholds and values
  - Classification band thresholds
  - Consistency penalty multiplier
- **Acceptance Criteria**:
  - ✅ Changes apply to future calculations only (historical data unchanged)
  - ✅ Formula version tracking
  - ✅ Preview shows before/after rankings for sample dataset
  - ✅ Validation prevents invalid configurations
  - ✅ Ability to reset to default formula

**FR-A6: Column Selection for Display**
- **Description**: Choose which columns appear in leaderboard table
- **Available Columns**:
  - Manager Name (always visible)
  - Functional Head
  - Headcount
  - 1:1s Participated
  - Total Users Not Utilizing
  - Utilization %
  - Team Size Score
  - Consistency Score
  - Final Score
  - Classification Band
  - Badges
  - Rank
  - Month-over-Month Change
- **Acceptance Criteria**:
  - ✅ Drag-and-drop column reordering
  - ✅ Toggle visibility per column
  - ✅ Settings persist per user
  - ✅ Export settings as template

#### 5.1.3 Leaderboard Management

**FR-A7: View All Leaderboards**
- **Description**: Access leaderboards for any historical month
- **Features**:
  - Month selector (dropdown or timeline)
  - All filters available (functional head, classification band)
  - Pagination (25/50/100 records per page)
  - Search by manager name
  - Sort by any column
- **Acceptance Criteria**:
  - ✅ Load time < 2 seconds for 150 managers
  - ✅ Smooth transitions between months
  - ✅ Highlight changes from previous month

**FR-A8: Manager Detail View**
- **Description**: Deep dive into individual manager performance
- **Features**:
  - Monthly trend charts (line/bar graphs)
  - Classification band history
  - Badge timeline
  - Comparison with functional head average
  - Downloadable performance report (PDF)
- **Acceptance Criteria**:
  - ✅ Interactive charts with tooltips
  - ✅ Zoom/pan capabilities
  - ✅ Export chart as image

**FR-A9: Analytics Dashboard**
- **Description**: High-level insights and trends
- **Metrics**:
  - Distribution across classification bands (pie chart)
  - Average utilization by functional head (bar chart)
  - Month-over-month trend (line chart)
  - Badge distribution (bar chart)
  - Top 10 performers (table)
  - Bottom 10 performers (table)
  - Most improved managers (table)
- **Filters**: Month range, functional head, team size range
- **Acceptance Criteria**:
  - ✅ Real-time updates after data import
  - ✅ Export all charts as PNG/PDF
  - ✅ Drill-down from charts to manager details

#### 5.1.4 Badge Management

**FR-A10: Badge Configuration**
- **Description**: Manage badge definitions and rules
- **Features**:
  - View all badge definitions
  - Edit badge name, description, icon
  - Enable/disable badges
  - View badge award history
- **Acceptance Criteria**:
  - ✅ Changes apply to future badge calculations
  - ✅ Cannot delete badges with existing awards
  - ✅ Icon library with 50+ options

#### 5.1.5 System Configuration

**FR-A11: General Settings**
- Functional head management (add/remove/edit)
- Classification band threshold customization
- Email notification settings (future)
- Data retention policy
- Export/import system configuration

### 5.2 User Dashboard Features

#### 5.2.1 Leaderboard View

**FR-U1: Interactive Leaderboard**
- **Description**: Engaging, animated leaderboard display
- **Features**:
  - Rank with medal icons (🥇🥈🥉 for top 3)
  - Manager name with avatar/initials
  - Classification band badge (Gold/Silver/Bronze/Ignition)
  - Final score with progress bar
  - Top 3 badges displayed as icons
  - Smooth animations on load and filter changes
  - Highlight current user's row
  - Expand row for quick stats
- **Animations**:
  - Fade-in on page load
  - Slide-in for each row (staggered)
  - Pulse effect for rank changes
  - Confetti animation for Gold band achievers
  - Smooth transitions on sorting/filtering
- **Acceptance Criteria**:
  - ✅ 60 FPS animation performance
  - ✅ Responsive design (mobile, tablet, desktop)
  - ✅ Accessible (WCAG 2.1 AA compliant)
  - ✅ Dark mode support

**FR-U2: Filtering & Search**
- Month selector (prominent, easy to use)
- Functional head filter
- Classification band filter
- Search by manager name (autocomplete)
- Clear all filters button

**FR-U3: Personal Performance Card**
- **Description**: Highlighted card showing current user's stats
- **Content**:
  - Current rank and classification band
  - Final score with breakdown
  - Badges earned this month
  - Month-over-month change indicator
  - Quick link to detailed view
- **Position**: Sticky at top or sidebar
- **Acceptance Criteria**:
  - ✅ Always visible while scrolling
  - ✅ Animated score counter
  - ✅ Visual indicators for improvement/decline

#### 5.2.2 Manager Detail Page

**FR-U4: Performance Trends**
- **Description**: Visual representation of historical performance
- **Charts**:
  - Utilization trend (line chart, 6+ months)
  - Final score trend (area chart)
  - Classification band history (timeline)
  - Component breakdown (stacked bar chart)
- **Acceptance Criteria**:
  - ✅ Interactive tooltips with exact values
  - ✅ Responsive and mobile-friendly
  - ✅ Smooth animations on load

**FR-U5: Badge Showcase**
- **Description**: Display all earned badges with details
- **Layout**: Grid or carousel of badge cards
- **Badge Card Content**:
  - Badge icon (large, colorful)
  - Badge name
  - Description
  - Month earned
  - Rarity indicator (% of managers who earned it)
- **Acceptance Criteria**:
  - ✅ Badges sorted by recency
  - ✅ Hover effects and animations
  - ✅ Share badge achievement (future: social media)

#### 5.2.3 Authentication

**FR-U6: SSO Login**
- **Description**: Simple single sign-on authentication
- **Flow**:
  1. Landing page with "Login with SSO" button
  2. Click redirects to SSO provider (mock for now)
  3. Auto-login without password
  4. Redirect to dashboard
- **No Authentication Required**: For MVP, just simulate SSO with name selection
- **Acceptance Criteria**:
  - ✅ One-click login
  - ✅ Session persists across browser refresh
  - ✅ Logout option available
  - ✅ Graceful handling of session expiry

---

## 6. Technical Architecture

### 6.1 Technology Stack

#### Backend
- **Framework**: Spring Boot 3.x (Java 17+)
- **Build Tool**: Maven
- **Database**: PostgreSQL 15+
- **ORM**: Spring Data JPA (Hibernate)
- **Migrations**: Flyway
- **Excel Parsing**: Apache POI 5.x
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: JUnit 5, Mockito, TestContainers
- **Logging**: SLF4J + Logback

#### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Library**: Material-UI (MUI) or Ant Design
- **Charts**: Recharts or Chart.js
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS + CSS Modules
- **Icons**: React Icons or Heroicons

#### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (local), Kubernetes (production)
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

### 6.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Admin Dash   │  │ User Dash    │  │ Manager      │      │
│  │              │  │              │  │ Detail       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Controllers                        │  │
│  │  Upload │ Leaderboard │ Manager │ Badge │ Config     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Service Layer                       │  │
│  │  ImportService │ ScoringService │ ClassificationSvc  │  │
│  │  BadgeService  │ LeaderboardService │ FormulaService │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Repository Layer (JPA)                   │  │
│  │  ManagerRepo │ MetricsRepo │ BadgeRepo │ ConfigRepo  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  managers │ monthly_metrics │ badge_definitions │           │
│  badge_awards │ formula_config │ upload_history              │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Service Layer Architecture

#### ImportService
- Parse Excel file using Apache POI
- Validate data structure and content
- Normalize manager names and values
- Filter by functional heads
- Handle overwrite/skip logic
- Trigger scoring and badge calculation
- Generate import summary and error report

#### ScoringService
- Calculate TeamSizeScore based on headcount
- Calculate ConsistencyScore using previous month data
- Compute FinalScore using weighted formula
- Apply formula configuration from database
- Handle tie-breaking logic for ranking

#### ClassificationService
- Assign classification band based on FinalScore
- Apply configurable thresholds
- Track band changes month-over-month

#### BadgeService
- Evaluate badge rules for each manager-month
- Award badges based on criteria
- Store badge metadata (delta, streak length)
- Handle uniqueness constraints
- Calculate badge rarity statistics

#### LeaderboardService
- Fetch and rank managers for given month
- Apply filters (functional head, band, search)
- Paginate results
- Calculate rank changes from previous month
- Aggregate statistics for analytics

#### FormulaService
- Manage formula configuration (CRUD)
- Validate formula changes
- Version formula configurations
- Preview formula impact on sample data

---

## 7. Data Models

### 7.1 Database Schema

#### Table: `managers`
```sql
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
```

**Fields**:
- `id`: Auto-increment primary key
- `display_name`: Manager's display name (as appears in Excel)
- `canonical_name`: Normalized, unique identifier (lowercase, trimmed)
- `email`: Manager's email (optional, for future notifications)
- `avatar_url`: Profile picture URL (optional)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

#### Table: `monthly_metrics`
```sql
CREATE TABLE monthly_metrics (
    id BIGSERIAL PRIMARY KEY,
    manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
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
    rank_change INTEGER, -- Change from previous month
    formula_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_manager_month UNIQUE (manager_id, month)
);

CREATE INDEX idx_monthly_metrics_month ON monthly_metrics(month);
CREATE INDEX idx_monthly_metrics_month_score ON monthly_metrics(month, final_score DESC);
CREATE INDEX idx_monthly_metrics_functional_head_month ON monthly_metrics(functional_head, month);
CREATE INDEX idx_monthly_metrics_manager_month ON monthly_metrics(manager_id, month);
```

**Fields**:
- `id`: Auto-increment primary key
- `manager_id`: Foreign key to managers table
- `month`: Month in YYYY-MM format (e.g., "2026-01")
- `functional_head`: Functional head name (Kunal Bhattacharya, Teza Mukkavilli)
- `headcount`: Team size
- `one_on_ones`: Number of 1:1s participated
- `not_utilising`: Number of users not utilizing Lattice
- `utilization`: Utilization percentage (0-100)
- `team_size_score`: Calculated team size score (0-100)
- `consistency_score`: Calculated consistency score (0-100)
- `final_score`: Weighted final score (0-100)
- `classification_band`: Gold/Silver/Bronze/Ignition Zone
- `rank`: Manager's rank for that month
- `rank_change`: Change in rank from previous month (+/- or null)
- `formula_version`: Version of formula used for calculation
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

#### Table: `badge_definitions`
```sql
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
```

**Fields**:
- `id`: Auto-increment primary key
- `code`: Unique badge code (e.g., "ONE_ON_ONE_CHAMPION")
- `name`: Display name (e.g., "1:1 Champion")
- `description`: Badge description
- `icon_key`: Icon identifier for frontend
- `color`: Badge color (hex code)
- `active`: Whether badge is currently active
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Seed Data**:
```sql
INSERT INTO badge_definitions (code, name, description, icon_key, color) VALUES
('ONE_ON_ONE_CHAMPION', '1:1 Champion', '100% utilization in the previous month', 'trophy', '#FFD700'),
('STREAK_STAR', 'Streak Star', '2+ consecutive months with >80% utilization', 'star', '#FF6B6B'),
('MOST_IMPROVED', 'Most Improved', 'Highest month-on-month improvement', 'trending-up', '#4ECDC4'),
('HEAVY_LIFTER', 'Heavy Lifter', 'Team size ≥7 with >80% utilization', 'dumbbell', '#95E1D3');
```

#### Table: `badge_awards`
```sql
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
```

**Fields**:
- `id`: Auto-increment primary key
- `manager_id`: Foreign key to managers table
- `badge_definition_id`: Foreign key to badge_definitions table
- `month`: Month badge was earned (YYYY-MM)
- `awarded_at`: Timestamp when badge was awarded
- `metadata`: JSON object with badge-specific data
  - For Most Improved: `{"delta": 15.5, "previousUtilization": 70.0, "currentUtilization": 85.5}`
  - For Streak Star: `{"streakLength": 3, "months": ["2026-01", "2026-02", "2026-03"]}`
  - For 1:1 Champion: `{"previousMonthUtilization": 100.0}`
  - For Heavy Lifter: `{"headcount": 8, "utilization": 85.0}`

#### Table: `formula_config`
```sql
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
        utilization_weight + team_size_weight + consistency_weight = 1.0
    )
);

CREATE INDEX idx_formula_config_active ON formula_config(active);
CREATE INDEX idx_formula_config_version ON formula_config(version);
```

**Fields**:
- `id`: Auto-increment primary key
- `version`: Formula version number (incremental)
- `utilization_weight`: Weight for utilization component (default: 0.7)
- `team_size_weight`: Weight for team size component (default: 0.2)
- `consistency_weight`: Weight for consistency component (default: 0.1)
- `team_size_mapping`: JSON mapping of headcount ranges to scores
  ```json
  {
    "1-3": 25,
    "4-6": 50,
    "7-10": 75,
    "10+": 100
  }
  ```
- `classification_thresholds`: JSON mapping of bands to score ranges
  ```json
  {
    "Gold": {"min": 90, "max": 100},
    "Silver": {"min": 60, "max": 89},
    "Bronze": {"min": 30, "max": 59},
    "Ignition Zone": {"min": 0, "max": 29}
  }
  ```
- `consistency_penalty_multiplier`: Multiplier for consistency calculation (default: 2.0)
- `active`: Whether this is the active formula version
- `created_at`: Record creation timestamp
- `created_by`: User who created this version

**Seed Data**:
```sql
INSERT INTO formula_config (
    version,
    utilization_weight,
    team_size_weight,
    consistency_weight,
    team_size_mapping,
    classification_thresholds,
    active
) VALUES (
    1,
    0.7,
    0.2,
    0.1,
    '{"1-3": 25, "4-6": 50, "7-10": 75, "10+": 100}'::jsonb,
    '{"Gold": {"min": 90, "max": 100}, "Silver": {"min": 60, "max": 89}, "Bronze": {"min": 30, "max": 59}, "Ignition Zone": {"min": 0, "max": 29}}'::jsonb,
    TRUE
);
```

#### Table: `upload_history`
```sql
CREATE TABLE upload_history (
    id BIGSERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    upload_mode VARCHAR(20) NOT NULL, -- OVERWRITE or SKIP
    records_processed INTEGER NOT NULL,
    records_created INTEGER NOT NULL,
    records_updated INTEGER NOT NULL,
    records_skipped INTEGER NOT NULL,
    records_failed INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- SUCCESS, PARTIAL, FAILED
    error_report TEXT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms BIGINT
);

CREATE INDEX idx_upload_history_month ON upload_history(month);
CREATE INDEX idx_upload_history_uploaded_at ON upload_history(uploaded_at DESC);
```

**Fields**:
- `id`: Auto-increment primary key
- `month`: Month of data uploaded (YYYY-MM)
- `filename`: Original filename
- `upload_mode`: OVERWRITE or SKIP
- `records_processed`: Total records in file
- `records_created`: New records created
- `records_updated`: Existing records updated
- `records_skipped`: Records skipped (in SKIP mode)
- `records_failed`: Records that failed validation
- `status`: Overall upload status
- `error_report`: JSON array of errors with row numbers
- `uploaded_by`: User who uploaded (from SSO)
- `uploaded_at`: Upload timestamp
- `processing_time_ms`: Processing duration in milliseconds

### 7.2 Entity Relationships

```
managers (1) ──────< (N) monthly_metrics
managers (1) ──────< (N) badge_awards
badge_definitions (1) ──────< (N) badge_awards
formula_config (1) ──────< (N) monthly_metrics (via formula_version)
```

---

## 8. Scoring & Classification Logic

### 8.1 Scoring Components

#### 8.1.1 Team Size Score (0-100)

**Purpose**: Reward managers handling larger teams (higher complexity)

**Calculation**:
```java
public double calculateTeamSizeScore(int headcount) {
    if (headcount >= 1 && headcount <= 3) return 25.0;
    if (headcount >= 4 && headcount <= 6) return 50.0;
    if (headcount >= 7 && headcount <= 10) return 75.0;
    if (headcount > 10) return 100.0;
    return 0.0; // Invalid headcount
}
```

**Rationale**: Managing larger teams requires more effort to maintain high utilization

#### 8.1.2 Consistency Score (0-100)

**Purpose**: Reward stable performance, penalize volatility

**Calculation**:
```java
public double calculateConsistencyScore(
    double currentUtilization,
    Double previousUtilization,
    double penaltyMultiplier
) {
    if (previousUtilization == null) {
        return 50.0; // Neutral score for first month
    }

    double delta = Math.abs(currentUtilization - previousUtilization);
    double rawScore = 100.0 - (penaltyMultiplier * delta);

    return Math.max(0.0, Math.min(100.0, rawScore)); // Clamp to [0, 100]
}
```

**Examples**:
- Current: 85%, Previous: 85% → Consistency = 100 - 2×0 = **100**
- Current: 90%, Previous: 80% → Consistency = 100 - 2×10 = **80**
- Current: 70%, Previous: 90% → Consistency = 100 - 2×20 = **60**
- Current: 50%, Previous: 100% → Consistency = 100 - 2×50 = **0** (clamped)

**Rationale**: Encourages steady performance over erratic swings

#### 8.1.3 Final Score (0-100)

**Formula**:
```
FinalScore = (w₁ × Utilization) + (w₂ × TeamSizeScore) + (w₃ × ConsistencyScore)

Where:
  w₁ = utilization_weight (default: 0.7)
  w₂ = team_size_weight (default: 0.2)
  w₃ = consistency_weight (default: 0.1)
  w₁ + w₂ + w₃ = 1.0
```

**Example Calculation**:
```
Manager: John Doe
Month: 2026-02
Headcount: 8
Utilization: 85%
Previous Utilization: 80%

Step 1: TeamSizeScore
  Headcount = 8 → TeamSizeScore = 75

Step 2: ConsistencyScore
  Delta = |85 - 80| = 5
  ConsistencyScore = 100 - 2×5 = 90

Step 3: FinalScore
  FinalScore = 0.7×85 + 0.2×75 + 0.1×90
             = 59.5 + 15 + 9
             = 83.5
```

### 8.2 Ranking Logic

**Primary Sort**: `final_score DESC`

**Tie-Breakers** (in order):
1. Higher `utilization`
2. Lower `not_utilising`
3. Alphabetical `manager_name` (ASC)

**Implementation**:
```java
public List<MonthlyMetric> rankManagers(String month) {
    return monthlyMetricsRepository
        .findByMonth(month)
        .stream()
        .sorted(Comparator
            .comparing(MonthlyMetric::getFinalScore).reversed()
            .thenComparing(MonthlyMetric::getUtilization).reversed()
            .thenComparing(MonthlyMetric::getNotUtilising)
            .thenComparing(m -> m.getManager().getCanonicalName())
        )
        .collect(Collectors.toList());
}
```

### 8.3 Classification Bands

**Band Assignment**:
```java
public String classifyManager(double finalScore) {
    if (finalScore >= 90) return "Gold";
    if (finalScore >= 60) return "Silver";
    if (finalScore >= 30) return "Bronze";
    return "Ignition Zone";
}
```

**Band Characteristics**:

| Band | Score Range | Color | Icon | Description |
|------|-------------|-------|------|-------------|
| **Gold** | 90-100 | `#FFD700` | 🏆 | Top performers, exemplary utilization |
| **Silver** | 60-89 | `#C0C0C0` | 🥈 | Strong performers, above average |
| **Bronze** | 30-59 | `#CD7F32` | 🥉 | Moderate performers, room for improvement |
| **Ignition Zone** | 0-29 | `#FF6B6B` | 🔥 | Needs immediate attention and support |

---

## 9. Badge System

### 9.1 Badge Definitions

#### Badge 1: 1:1 Champion 🏆

**Criteria**: Utilization was **100%** in the **previous month**

**Award Timing**: Awarded in month `t` if `utilization(t-1) == 100`

**Logic**:
```java
public boolean qualifiesFor1on1Champion(String currentMonth, Long managerId) {
    String previousMonth = getPreviousMonth(currentMonth);
    MonthlyMetric prevMetric = findByManagerAndMonth(managerId, previousMonth);

    return prevMetric != null && prevMetric.getUtilization() == 100.0;
}
```

**Metadata**:
```json
{
  "previousMonthUtilization": 100.0,
  "previousMonth": "2026-01"
}
```

#### Badge 2: Streak Star ⭐

**Criteria**: **2+ consecutive months** with utilization **> 80%**

**Award Timing**: Awarded when streak reaches 2 months, continues each month streak is maintained

**Logic**:
```java
public boolean qualifiesForStreakStar(String currentMonth, Long managerId) {
    List<MonthlyMetric> recentMetrics = getConsecutiveMonthsBackward(managerId, currentMonth, 2);

    if (recentMetrics.size() < 2) return false;

    return recentMetrics.stream()
        .allMatch(m -> m.getUtilization() > 80.0);
}

public int calculateStreakLength(String currentMonth, Long managerId) {
    int streak = 0;
    String month = currentMonth;

    while (true) {
        MonthlyMetric metric = findByManagerAndMonth(managerId, month);
        if (metric == null || metric.getUtilization() <= 80.0) break;

        streak++;
        month = getPreviousMonth(month);
    }

    return streak;
}
```

**Metadata**:
```json
{
  "streakLength": 3,
  "months": ["2026-01", "2026-02", "2026-03"],
  "currentStreak": true
}
```

#### Badge 3: Most Improved 📈

**Criteria**: **Highest month-on-month utilization improvement** in month `t`

**Award Timing**: Awarded to **1 manager** per month (competitive badge)

**Logic**:
```java
public Long findMostImprovedManager(String currentMonth) {
    List<MonthlyMetric> currentMetrics = findByMonth(currentMonth);
    String previousMonth = getPreviousMonth(currentMonth);

    return currentMetrics.stream()
        .map(current -> {
            MonthlyMetric prev = findByManagerAndMonth(current.getManagerId(), previousMonth);
            if (prev == null) return null;

            double delta = current.getUtilization() - prev.getUtilization();
            return new ImprovementRecord(current.getManagerId(), delta, current.getUtilization());
        })
        .filter(Objects::nonNull)
        .max(Comparator
            .comparing(ImprovementRecord::getDelta)
            .thenComparing(ImprovementRecord::getCurrentUtilization)
            .thenComparing(r -> getManager(r.getManagerId()).getCanonicalName())
        )
        .map(ImprovementRecord::getManagerId)
        .orElse(null);
}
```

**Tie-Breakers**:
1. Higher delta
2. Higher current utilization
3. Alphabetical manager name

**Metadata**:
```json
{
  "delta": 15.5,
  "previousUtilization": 70.0,
  "currentUtilization": 85.5,
  "previousMonth": "2026-01"
}
```

#### Badge 4: Heavy Lifter 💪

**Criteria**: Headcount **≥ 7** AND Utilization **> 80%** in current month

**Award Timing**: Awarded each month criteria are met

**Logic**:
```java
public boolean qualifiesForHeavyLifter(MonthlyMetric metric) {
    return metric.getHeadcount() >= 7 && metric.getUtilization() > 80.0;
}
```

**Metadata**:
```json
{
  "headcount": 8,
  "utilization": 85.0
}
```

### 9.2 Badge Award Process

**Workflow**:
1. After monthly metrics are calculated and saved
2. `BadgeService.awardBadgesForMonth(month)` is triggered
3. For each manager in that month:
   - Evaluate all badge criteria
   - Create `BadgeAward` records for qualified badges
   - Handle uniqueness constraint (manager + badge + month)
4. For competitive badges (Most Improved):
   - Find single winner
   - Award only to that manager
5. Store metadata for each award
6. Update badge statistics (rarity, total awards)

**Idempotency**: Re-running badge awards for same month should not create duplicates (UPSERT logic)

---

## 10. API Specifications

### 10.1 Upload API

#### POST `/api/uploads/monthly`

**Description**: Upload monthly Excel file and process data

**Request**:
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `month` (required): `YYYY-MM` format (e.g., "2026-02")
  - `mode` (required): `overwrite` or `skip`
- **Body**:
  - `file`: Excel file (`.xlsx`)

**Response** (Success - 200 OK):
```json
{
  "status": "SUCCESS",
  "month": "2026-02",
  "uploadMode": "overwrite",
  "summary": {
    "recordsProcessed": 45,
    "recordsCreated": 10,
    "recordsUpdated": 35,
    "recordsSkipped": 0,
    "recordsFailed": 0
  },
  "processingTimeMs": 1234,
  "uploadId": 123,
  "errors": []
}
```

**Response** (Partial Success - 200 OK):
```json
{
  "status": "PARTIAL",
  "month": "2026-02",
  "uploadMode": "skip",
  "summary": {
    "recordsProcessed": 45,
    "recordsCreated": 5,
    "recordsUpdated": 0,
    "recordsSkipped": 38,
    "recordsFailed": 2
  },
  "processingTimeMs": 1100,
  "uploadId": 124,
  "errors": [
    {
      "row": 15,
      "column": "Utilization %",
      "value": "invalid",
      "message": "Invalid utilization format. Expected number or percentage."
    },
    {
      "row": 23,
      "column": "Headcount",
      "value": "-5",
      "message": "Headcount must be non-negative."
    }
  ]
}
```

**Response** (Failure - 400 Bad Request):
```json
{
  "status": "FAILED",
  "message": "Tab 'People Manager Pivot Summary' not found in Excel file",
  "errors": []
}
```

**Validation Rules**:
- File size ≤ 10MB
- File extension must be `.xlsx`
- Month must be valid YYYY-MM format
- Month cannot be in the future
- Required tab must exist
- Required columns must be present

---

### 10.2 Leaderboard API

#### GET `/api/leaderboard`

**Description**: Fetch leaderboard for a specific month with filters

**Request**:
- **Method**: `GET`
- **Query Parameters**:
  - `month` (required): `YYYY-MM` format
  - `functionalHead` (optional): Filter by functional head (default: "all")
    - Options: `Kunal Bhattacharya`, `Teza Mukkavilli`, `all`
  - `band` (optional): Filter by classification band (default: "all")
    - Options: `Gold`, `Silver`, `Bronze`, `Ignition Zone`, `all`
  - `search` (optional): Search by manager name (case-insensitive)
  - `page` (optional): Page number (0-indexed, default: 0)
  - `size` (optional): Page size (default: 25, max: 100)
  - `sort` (optional): Sort field (default: `rank`)
    - Options: `rank`, `finalScore`, `utilization`, `managerName`

**Response** (200 OK):
```json
{
  "month": "2026-02",
  "totalManagers": 45,
  "filteredManagers": 45,
  "page": 0,
  "size": 25,
  "totalPages": 2,
  "managers": [
    {
      "rank": 1,
      "rankChange": 2,
      "manager": {
        "id": 123,
        "displayName": "John Doe",
        "email": "john.doe@example.com",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "functionalHead": "Kunal Bhattacharya",
      "headcount": 8,
      "oneOnOnes": 32,
      "notUtilising": 0,
      "utilization": 95.5,
      "teamSizeScore": 75.0,
      "consistencyScore": 90.0,
      "finalScore": 91.35,
      "classificationBand": "Gold",
      "badges": [
        {
          "id": 1,
          "code": "HEAVY_LIFTER",
          "name": "Heavy Lifter",
          "iconKey": "dumbbell",
          "color": "#95E1D3"
        },
        {
          "id": 2,
          "code": "STREAK_STAR",
          "name": "Streak Star",
          "iconKey": "star",
          "color": "#FF6B6B"
        }
      ],
      "badgeCount": 2
    }
    // ... more managers
  ],
  "statistics": {
    "averageFinalScore": 72.5,
    "averageUtilization": 78.3,
    "bandDistribution": {
      "Gold": 5,
      "Silver": 20,
      "Bronze": 15,
      "Ignition Zone": 5
    }
  }
}
```

---

### 10.3 Manager Detail API

#### GET `/api/managers/{id}`

**Description**: Get detailed information for a specific manager

**Request**:
- **Method**: `GET`
- **Path Parameters**:
  - `id` (required): Manager ID
- **Query Parameters**:
  - `months` (optional): Number of months to include in trends (default: 6)

**Response** (200 OK):
```json
{
  "manager": {
    "id": 123,
    "displayName": "John Doe",
    "canonicalName": "john doe",
    "email": "john.doe@example.com",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "currentMonth": {
    "month": "2026-02",
    "rank": 1,
    "rankChange": 2,
    "functionalHead": "Kunal Bhattacharya",
    "headcount": 8,
    "oneOnOnes": 32,
    "notUtilising": 0,
    "utilization": 95.5,
    "teamSizeScore": 75.0,
    "consistencyScore": 90.0,
    "finalScore": 91.35,
    "classificationBand": "Gold"
  },
  "trends": [
    {
      "month": "2025-09",
      "utilization": 75.0,
      "finalScore": 70.5,
      "classificationBand": "Silver",
      "rank": 15
    },
    {
      "month": "2025-10",
      "utilization": 80.0,
      "finalScore": 75.0,
      "classificationBand": "Silver",
      "rank": 12
    }
    // ... up to 6 months
  ],
  "badges": [
    {
      "badge": {
        "id": 1,
        "code": "HEAVY_LIFTER",
        "name": "Heavy Lifter",
        "description": "Team size ≥7 with >80% utilization",
        "iconKey": "dumbbell",
        "color": "#95E1D3"
      },
      "month": "2026-02",
      "awardedAt": "2026-03-01T10:30:00Z",
      "metadata": {
        "headcount": 8,
        "utilization": 95.5
      }
    }
    // ... all badges
  ],
  "statistics": {
    "totalBadges": 5,
    "averageUtilization": 82.5,
    "averageFinalScore": 78.3,
    "bestRank": 1,
    "currentStreak": 3,
    "longestStreak": 4
  }
}
```

---

### 10.4 Months API

#### GET `/api/months`

**Description**: Get list of all available months with data

**Response** (200 OK):
```json
{
  "months": [
    {
      "month": "2026-02",
      "managerCount": 45,
      "uploadDate": "2026-03-01T09:00:00Z",
      "formulaVersion": 1
    },
    {
      "month": "2026-01",
      "managerCount": 43,
      "uploadDate": "2026-02-01T09:15:00Z",
      "formulaVersion": 1
    }
    // ... more months
  ],
  "latestMonth": "2026-02"
}
```

---

### 10.5 Badge API

#### GET `/api/badges`

**Description**: Get all badge definitions

**Response** (200 OK):
```json
{
  "badges": [
    {
      "id": 1,
      "code": "ONE_ON_ONE_CHAMPION",
      "name": "1:1 Champion",
      "description": "100% utilization in the previous month",
      "iconKey": "trophy",
      "color": "#FFD700",
      "active": true,
      "statistics": {
        "totalAwarded": 15,
        "uniqueRecipients": 8,
        "rarity": 17.8
      }
    }
    // ... more badges
  ]
}
```

---

### 10.6 Formula API

#### GET `/api/formula/current`

**Description**: Get current active formula configuration

**Response** (200 OK):
```json
{
  "version": 1,
  "utilizationWeight": 0.7,
  "teamSizeWeight": 0.2,
  "consistencyWeight": 0.1,
  "teamSizeMapping": {
    "1-3": 25,
    "4-6": 50,
    "7-10": 75,
    "10+": 100
  },
  "classificationThresholds": {
    "Gold": {"min": 90, "max": 100},
    "Silver": {"min": 60, "max": 89},
    "Bronze": {"min": 30, "max": 59},
    "Ignition Zone": {"min": 0, "max": 29}
  },
  "consistencyPenaltyMultiplier": 2.0,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

#### POST `/api/formula` (Admin Only)

**Description**: Create new formula version

**Request**:
```json
{
  "utilizationWeight": 0.6,
  "teamSizeWeight": 0.3,
  "consistencyWeight": 0.1,
  "teamSizeMapping": {
    "1-3": 20,
    "4-6": 40,
    "7-10": 70,
    "10+": 100
  },
  "classificationThresholds": {
    "Gold": {"min": 85, "max": 100},
    "Silver": {"min": 55, "max": 84},
    "Bronze": {"min": 25, "max": 54},
    "Ignition Zone": {"min": 0, "max": 24}
  },
  "consistencyPenaltyMultiplier": 2.5
}
```

**Response** (201 Created):
```json
{
  "version": 2,
  "message": "Formula version 2 created successfully. It will apply to future uploads.",
  "previewAvailable": true
}
```

#### POST `/api/formula/{version}/preview`

**Description**: Preview impact of formula version on sample data

**Request**:
```json
{
  "month": "2026-02"
}
```

**Response** (200 OK):
```json
{
  "currentFormula": {
    "version": 1,
    "averageFinalScore": 72.5,
    "bandDistribution": {
      "Gold": 5,
      "Silver": 20,
      "Bronze": 15,
      "Ignition Zone": 5
    }
  },
  "newFormula": {
    "version": 2,
    "averageFinalScore": 68.3,
    "bandDistribution": {
      "Gold": 3,
      "Silver": 18,
      "Bronze": 18,
      "Ignition Zone": 6
    }
  },
  "sampleChanges": [
    {
      "managerName": "John Doe",
      "currentScore": 91.35,
      "newScore": 87.20,
      "currentBand": "Gold",
      "newBand": "Silver",
      "currentRank": 1,
      "newRank": 3
    }
    // ... top 10 affected managers
  ]
}
```

---

### 10.7 Analytics API

#### GET `/api/analytics/overview`

**Description**: Get high-level analytics for a month

**Request**:
- **Query Parameters**:
  - `month` (required): `YYYY-MM` format
  - `functionalHead` (optional): Filter by functional head

**Response** (200 OK):
```json
{
  "month": "2026-02",
  "totalManagers": 45,
  "metrics": {
    "averageUtilization": 78.3,
    "averageFinalScore": 72.5,
    "averageHeadcount": 5.2,
    "totalOneOnOnes": 1234
  },
  "bandDistribution": {
    "Gold": {"count": 5, "percentage": 11.1},
    "Silver": {"count": 20, "percentage": 44.4},
    "Bronze": {"count": 15, "percentage": 33.3},
    "Ignition Zone": {"count": 5, "percentage": 11.1}
  },
  "functionalHeadComparison": [
    {
      "functionalHead": "Kunal Bhattacharya",
      "managerCount": 25,
      "averageUtilization": 80.5,
      "averageFinalScore": 75.2
    },
    {
      "functionalHead": "Teza Mukkavilli",
      "managerCount": 20,
      "averageUtilization": 75.8,
      "averageFinalScore": 69.3
    }
  ],
  "topPerformers": [
    {
      "rank": 1,
      "managerName": "John Doe",
      "finalScore": 91.35,
      "classificationBand": "Gold"
    }
    // ... top 10
  ],
  "mostImproved": [
    {
      "managerName": "Jane Smith",
      "delta": 15.5,
      "previousUtilization": 70.0,
      "currentUtilization": 85.5
    }
    // ... top 10
  ]
}
```

---

## 11. UI/UX Requirements

### 11.1 Design System

#### 11.1.1 Color Palette (Teal Tekion Theme)

**Primary Colors**:
- **Primary Teal**: `#00BFA5` (buttons, links, accents)
- **Dark Teal**: `#00897B` (hover states, headers)
- **Light Teal**: `#B2DFDB` (backgrounds, highlights)

**Classification Band Colors**:
- **Gold**: `#FFD700` (gradient: `#FFD700` → `#FFA500`)
- **Silver**: `#C0C0C0` (gradient: `#C0C0C0` → `#A8A8A8`)
- **Bronze**: `#CD7F32` (gradient: `#CD7F32` → `#B8860B`)
- **Ignition Zone**: `#FF6B6B` (gradient: `#FF6B6B` → `#FF4757`)

**Neutral Colors**:
- **Background**: `#F5F7FA` (light mode), `#1A1D23` (dark mode)
- **Surface**: `#FFFFFF` (light mode), `#252A31` (dark mode)
- **Text Primary**: `#2C3E50` (light mode), `#E8EAED` (dark mode)
- **Text Secondary**: `#7F8C8D` (light mode), `#9AA0A6` (dark mode)
- **Border**: `#E0E0E0` (light mode), `#3C4043` (dark mode)

**Semantic Colors**:
- **Success**: `#4CAF50`
- **Warning**: `#FF9800`
- **Error**: `#F44336`
- **Info**: `#2196F3`

#### 11.1.2 Typography

**Font Family**:
- Primary: `'Inter', 'Segoe UI', 'Roboto', sans-serif`
- Monospace: `'Fira Code', 'Courier New', monospace`

**Font Sizes**:
- **H1**: 32px / 2rem (bold)
- **H2**: 24px / 1.5rem (semi-bold)
- **H3**: 20px / 1.25rem (semi-bold)
- **H4**: 18px / 1.125rem (medium)
- **Body**: 16px / 1rem (regular)
- **Small**: 14px / 0.875rem (regular)
- **Tiny**: 12px / 0.75rem (regular)

**Line Heights**:
- Headings: 1.2
- Body: 1.5
- Compact: 1.3

#### 11.1.3 Spacing System

**Base Unit**: 8px

**Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Component Padding**:
- Cards: 24px
- Buttons: 12px 24px
- Inputs: 12px 16px
- Modals: 32px

#### 11.1.4 Elevation (Shadows)

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

#### 11.1.5 Border Radius

- **Small**: 4px (inputs, tags)
- **Medium**: 8px (cards, buttons)
- **Large**: 12px (modals, panels)
- **Round**: 50% (avatars, badges)

### 11.2 Admin Dashboard UI

#### 11.2.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo, User Menu, Notifications)                    │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│  Sidebar    │           Main Content Area                   │
│  Navigation │                                               │
│             │                                               │
│  - Upload   │                                               │
│  - Board    │                                               │
│  - Analytics│                                               │
│  - Formula  │                                               │
│  - Badges   │                                               │
│  - Settings │                                               │
│             │                                               │
└─────────────┴───────────────────────────────────────────────┘
```

**Sidebar**:
- Width: 240px (expanded), 64px (collapsed)
- Collapsible with toggle button
- Active state highlighting
- Icons + labels
- Sticky positioning

**Header**:
- Height: 64px
- Logo on left
- User avatar + name on right
- Notification bell icon
- Dark/light mode toggle

#### 11.2.2 Upload Page

**Components**:

1. **Month Selector**
   - Prominent date picker (month/year only)
   - Validation: cannot select future months
   - Shows months with existing data (badge indicator)

2. **Upload Mode Toggle**
   - Radio buttons: Overwrite / Skip
   - Clear explanation of each mode
   - Warning for overwrite mode

3. **File Upload Zone**
   - Drag-and-drop area (dashed border, teal accent on hover)
   - "Browse files" button
   - File type indicator (.xlsx only)
   - File size limit display (10MB max)
   - Preview of selected file (name, size)

4. **Functional Head Filter**
   - Multi-select checkboxes
   - "Select All" / "Deselect All" options
   - Active filter count badge

5. **Upload Button**
   - Large, prominent, teal background
   - Disabled until file + month selected
   - Loading spinner during upload

6. **Progress Indicator**
   - Linear progress bar
   - Percentage display
   - Current step indicator (Uploading → Parsing → Validating → Processing → Complete)

7. **Results Panel**
   - Success/Partial/Failure status with icon
   - Summary statistics (cards with icons)
     - Records Processed
     - Records Created
     - Records Updated
     - Records Skipped
     - Records Failed
   - Error table (if any)
     - Columns: Row, Column, Value, Error Message
     - Sortable and filterable
     - Export errors as CSV button
   - Action buttons:
     - View Leaderboard
     - Upload Another File
     - Download Error Report

**Animations**:
- Fade-in for upload zone
- Pulse effect on drag-over
- Smooth progress bar animation
- Success confetti animation
- Error shake animation

#### 11.2.3 Leaderboard Page (Admin View)

**Components**:

1. **Control Bar**
   - Month selector (dropdown with calendar icon)
   - Functional head filter (dropdown)
   - Classification band filter (chip buttons with colors)
   - Search bar (with autocomplete)
   - Clear filters button
   - Export button (CSV/PDF)
   - Column selector (dropdown checklist)

2. **Statistics Cards** (above table)
   - Total Managers
   - Average Utilization (with trend arrow)
   - Average Final Score (with trend arrow)
   - Band Distribution (mini pie chart)

3. **Leaderboard Table**
   - Sticky header
   - Alternating row colors
   - Hover effect (subtle elevation)
   - Columns (customizable):
     - **Rank**: Medal icons for top 3, number for others
     - **Manager**: Avatar + name
     - **Functional Head**: Text with color tag
     - **Headcount**: Number with team icon
     - **1:1s Participated**: Number
     - **Not Utilizing**: Number (red if > 0)
     - **Utilization %**: Progress bar + percentage
     - **Team Size Score**: Chip with score
     - **Consistency Score**: Chip with score
     - **Final Score**: Large, bold number with color gradient
     - **Classification Band**: Badge with icon and color
     - **Badges**: Icon row (max 3 visible, +N indicator)
     - **Rank Change**: Arrow icon (↑↓) with number
   - Click row to expand inline details
   - Click manager name to navigate to detail page

4. **Pagination**
   - Page size selector (25/50/100)
   - Page number buttons
   - Previous/Next buttons
   - "Go to page" input
   - Total count display

**Animations**:
- Staggered fade-in for rows (50ms delay each)
- Smooth sort transitions
- Expand/collapse animation for row details
- Shimmer loading skeleton

#### 11.2.4 Analytics Page

**Layout**: Dashboard grid (2-3 columns, responsive)

**Widgets**:

1. **Band Distribution** (Pie Chart)
   - Interactive segments (click to filter)
   - Percentage labels
   - Legend with counts
   - Smooth animations on load

2. **Utilization Trend** (Line Chart)
   - Multi-line (by functional head)
   - Tooltips with exact values
   - Zoom/pan controls
   - Date range selector

3. **Top Performers** (Table)
   - Top 10 managers by final score
   - Mini leaderboard format
   - Click to view details

4. **Bottom Performers** (Table)
   - Bottom 10 managers (Ignition Zone focus)
   - Highlight for intervention
   - Action button: "Send Reminder"

5. **Most Improved** (Table)
   - Top 10 by delta
   - Show previous vs current
   - Celebration icon

6. **Badge Distribution** (Bar Chart)
   - Horizontal bars
   - Badge icons on left
   - Count on right
   - Rarity percentage

7. **Functional Head Comparison** (Grouped Bar Chart)
   - Average utilization by functional head
   - Month-over-month comparison
   - Color-coded bars

8. **Consistency Heatmap** (Calendar Heatmap)
   - Manager consistency over time
   - Color intensity = consistency score
   - Hover for details

**Filters** (apply to all widgets):
- Month range slider
- Functional head multi-select
- Team size range slider

**Export Options**:
- Export all charts as PNG
- Export dashboard as PDF report
- Schedule email reports (future)

#### 11.2.5 Formula Builder Page

**Components**:

1. **Current Formula Display**
   - Large, visual representation
   - Component breakdown (pie chart)
   - Version number and date
   - "Edit Formula" button

2. **Formula Editor** (Modal or Side Panel)
   - **Weight Sliders**:
     - Utilization Weight (0.0 - 1.0)
     - Team Size Weight (0.0 - 1.0)
     - Consistency Weight (0.0 - 1.0)
     - Real-time sum validation (must = 1.0)
     - Visual indicator when sum ≠ 1.0
   - **Team Size Mapping**:
     - Editable table
     - Columns: Headcount Range, Score
     - Add/remove rows
     - Validation: scores 0-100
   - **Classification Thresholds**:
     - Editable table
     - Columns: Band, Min Score, Max Score
     - Color preview
     - Validation: no gaps/overlaps
   - **Consistency Penalty Multiplier**:
     - Number input (0.0 - 10.0)
     - Explanation tooltip
   - **Preview Button**:
     - Opens preview modal
     - Shows before/after comparison
     - Sample data table with changes
   - **Save Button**:
     - Creates new formula version
     - Confirmation dialog
     - Success notification

3. **Formula History**
   - Timeline of formula versions
   - Click to view details
   - Compare versions (diff view)
   - Revert to previous version (with confirmation)

4. **Impact Preview** (Modal)
   - Side-by-side comparison
   - Statistics: avg score, band distribution
   - Top 10 affected managers table
   - Visual diff (color-coded changes)
   - "Apply Changes" / "Cancel" buttons

**Animations**:
- Smooth slider transitions
- Real-time preview updates
- Success animation on save
- Diff highlighting (green/red)

#### 11.2.6 Badge Management Page

**Components**:

1. **Badge Grid**
   - Card layout (3-4 per row)
   - Each card shows:
     - Large badge icon
     - Badge name
     - Description
     - Active/Inactive toggle
     - Total awarded count
     - Rarity percentage
     - Edit button
   - Hover effect: elevation + glow

2. **Badge Editor** (Modal)
   - Name input
   - Description textarea
   - Icon selector (grid of icons)
   - Color picker
   - Active toggle
   - Save/Cancel buttons

3. **Badge Award History**
   - Filterable table
   - Columns: Manager, Badge, Month, Metadata
   - Export to CSV
   - Search by manager name

**Animations**:
- Card flip on hover
- Icon pulse effect
- Smooth toggle transitions

### 11.3 User Dashboard UI

#### 11.3.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo, Month Selector, User Profile)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Personal Performance Card (Sticky)                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Rank: #1 🥇  |  Band: Gold 🏆  |  Score: 91.35     │    │
│  │ Badges: ⭐💪📈  |  Change: ↑2                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Filters (Functional Head, Band, Search)                    │
│                                                              │
│  Leaderboard Table                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Rank | Manager | Score | Band | Badges             │    │
│  │  🥇  | John    | 91.35 | Gold | ⭐💪📈             │    │
│  │  🥈  | Jane    | 88.20 | Silver | ⭐📈             │    │
│  │  🥉  | Bob     | 85.50 | Silver | 💪               │    │
│  │  ...                                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Pagination                                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 11.3.2 Personal Performance Card

**Design**:
- Prominent position (sticky at top)
- Gradient background (based on classification band)
- Large, bold typography
- Icons and visual indicators
- Animated score counter
- Pulse effect for rank changes

**Content**:
- Current rank with medal/number
- Classification band badge
- Final score (large, animated)
- Top 3 badges (icons)
- Month-over-month change (arrow + number)
- "View My Details" button

**Responsive**:
- Desktop: Full width, horizontal layout
- Tablet: Stacked layout
- Mobile: Compact, essential info only

#### 11.3.3 Leaderboard Table (User View)

**Simplified Columns**:
- Rank (with medals for top 3)
- Manager (avatar + name)
- Functional Head (optional, can hide)
- Final Score (progress bar + number)
- Classification Band (badge)
- Badges (icon row, max 3 + count)
- Rank Change (arrow icon)

**Highlighting**:
- Current user's row: highlighted background, subtle glow
- Top 3: gold/silver/bronze gradient backgrounds
- Hover: elevation + scale effect

**Interactions**:
- Click row to view manager details
- Click badge icon to see badge description (tooltip)
- Click rank to scroll to top

**Animations**:
- **On Load**:
  - Fade-in for entire table
  - Staggered slide-in for rows (top to bottom, 30ms delay)
  - Confetti animation for Gold band achievers (top 3)
- **On Filter Change**:
  - Fade-out old rows
  - Fade-in new rows
  - Smooth reordering
- **On Sort**:
  - Smooth position transitions
  - Highlight sorted column
- **Rank Change Indicators**:
  - Pulse animation for improved ranks
  - Subtle shake for declined ranks

#### 11.3.4 Manager Detail Page (User View)

**Layout**: Single column, scrollable

**Sections**:

1. **Header**
   - Large avatar
   - Manager name
   - Current rank and band
   - "Back to Leaderboard" button

2. **Current Month Summary**
   - Cards with key metrics:
     - Utilization (circular progress)
     - Final Score (gauge chart)
     - Team Size (icon + number)
     - Consistency Score (icon + number)
   - Classification band badge (large)

3. **Performance Trends**
   - **Utilization Trend** (Line Chart)
     - 6 months of data
     - Smooth curve
     - Tooltips with exact values
     - Threshold line at 80%
   - **Final Score Trend** (Area Chart)
     - Gradient fill
     - Classification band zones (background colors)
   - **Rank History** (Line Chart)
     - Inverted Y-axis (lower is better)
     - Highlight best rank

4. **Badge Showcase**
   - Grid of earned badges
   - Each badge card:
     - Large icon with glow effect
     - Badge name
     - Month earned
     - Description (on hover)
     - Rarity indicator (% of managers)
   - Empty state: "No badges yet. Keep improving!"
   - Animations:
     - Fade-in on scroll
     - Hover: scale + glow
     - Click: modal with full details

5. **Statistics Summary**
   - Cards with lifetime stats:
     - Total Badges Earned
     - Average Utilization
     - Best Rank Achieved
     - Current Streak
     - Longest Streak
   - Visual icons and colors

**Animations**:
- Scroll-triggered animations (fade-in, slide-up)
- Chart animations on load
- Badge card hover effects
- Smooth transitions between sections

### 11.4 Responsive Design

**Breakpoints**:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

**Mobile Adaptations**:
- Hamburger menu for navigation
- Stacked layouts
- Simplified tables (card view)
- Touch-friendly buttons (min 44px)
- Swipe gestures for navigation

**Tablet Adaptations**:
- Collapsible sidebar
- 2-column layouts
- Responsive charts
- Optimized touch targets

### 11.5 Accessibility (WCAG 2.1 AA)

**Requirements**:
- ✅ Keyboard navigation (tab order, focus indicators)
- ✅ Screen reader support (ARIA labels, roles, live regions)
- ✅ Color contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (UI components)
- ✅ Focus visible on all interactive elements
- ✅ Alt text for all images/icons
- ✅ Form labels and error messages
- ✅ Skip navigation links
- ✅ Resizable text (up to 200%)
- ✅ No flashing content (seizure risk)

### 11.6 Animation Library (Framer Motion)

**Common Animations**:

```jsx
// Fade In
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

// Slide Up
const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4 }
};

// Stagger Children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

// Scale on Hover
const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

// Confetti (for Gold achievers)
import confetti from 'canvas-confetti';
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

**Performance**:
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Reduce motion for users with `prefers-reduced-motion`

---

## 12. Security & Authentication

### 12.1 Authentication (MVP - Mock SSO)

**Flow**:
1. User lands on login page
2. Clicks "Login with SSO" button
3. Mock SSO: Select name from dropdown (simulates SSO provider)
4. Session created with JWT token (stored in localStorage)
5. Redirect to dashboard

**Session Management**:
- JWT token with 24-hour expiry
- Refresh token mechanism (future)
- Auto-logout on expiry
- "Remember me" option (extends to 7 days)

**Future (Real SSO)**:
- OAuth 2.0 / OIDC integration
- SAML support
- Multi-factor authentication (MFA)
- Single logout (SLO)

### 12.2 Authorization

**Roles**:
- **Admin**: Full access (upload, formula, badges, all leaderboards)
- **User**: Read-only access (view leaderboards, own details)

**Role Assignment** (MVP):
- Hardcoded in mock SSO
- Future: Managed in admin panel or synced from SSO

**Access Control**:
- Backend: Role-based access control (RBAC) on API endpoints
- Frontend: Conditional rendering based on role
- API returns 403 Forbidden for unauthorized requests

### 12.3 Data Security

**In Transit**:
- HTTPS/TLS 1.3 for all communications
- Secure WebSocket connections (WSS) if needed

**At Rest**:
- Database encryption (PostgreSQL native encryption)
- Encrypted backups
- Secure credential storage (environment variables, secrets manager)

**Input Validation**:
- Server-side validation for all inputs
- Sanitize Excel data to prevent injection attacks
- File upload restrictions (type, size, content validation)

**CORS**:
- Whitelist allowed origins
- Credentials included in requests

**Rate Limiting**:
- API rate limits (100 requests/minute per user)
- Upload rate limits (5 uploads/hour per user)

---

## 13. Performance Requirements

### 13.1 Backend Performance

**API Response Times** (95th percentile):
- GET `/api/leaderboard`: < 500ms (150 managers)
- GET `/api/managers/{id}`: < 300ms
- POST `/api/uploads/monthly`: < 5s (45 managers)
- GET `/api/analytics/overview`: < 1s

**Database Optimization**:
- Indexed queries on frequently accessed columns
- Query result caching (Redis, future)
- Connection pooling (HikariCP)
- Pagination for large result sets

**Scalability**:
- Support 500+ managers per month
- Handle 100+ concurrent users
- Process uploads up to 10MB in < 10s

### 13.2 Frontend Performance

**Load Times**:
- Initial page load: < 2s (3G network)
- Time to interactive (TTI): < 3s
- First contentful paint (FCP): < 1s

**Optimization Techniques**:
- Code splitting (lazy loading routes)
- Tree shaking (remove unused code)
- Image optimization (WebP, lazy loading)
- Bundle size < 500KB (gzipped)
- Service worker for offline support (future)

**Animation Performance**:
- 60 FPS for all animations
- Use `requestAnimationFrame`
- Debounce/throttle expensive operations

### 13.3 Monitoring & Logging

**Metrics to Track**:
- API response times (per endpoint)
- Error rates (4xx, 5xx)
- Database query performance
- Upload success/failure rates
- User session duration
- Page load times

**Tools**:
- Backend: Prometheus + Grafana
- Frontend: Google Analytics, Sentry
- Logging: ELK Stack (Elasticsearch, Logstack, Kibana)
- APM: New Relic or Datadog (future)

---

## 14. Deployment & DevOps

### 14.1 Environment Setup

**Environments**:
1. **Development**: Local developer machines
2. **Staging**: Pre-production testing
3. **Production**: Live system

**Configuration Management**:
- Environment variables for secrets
- Separate config files per environment
- Version-controlled (except secrets)

### 14.2 Containerization

**Docker Setup**:
- **Backend**: Java 17 + Spring Boot in Alpine Linux
- **Frontend**: Node.js build → Nginx static server
- **Database**: PostgreSQL 15 official image
- **Docker Compose**: Local development orchestration

**Example `docker-compose.yml`**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: leaderboard
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/leaderboard
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: secret
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 14.3 CI/CD Pipeline

**GitHub Actions Workflow**:
1. **On Push to `main`**:
   - Run backend tests (JUnit, integration tests)
   - Run frontend tests (Jest, React Testing Library)
   - Build Docker images
   - Push to container registry
   - Deploy to staging
2. **On Tag (e.g., `v1.0.0`)**:
   - Run full test suite
   - Build production images
   - Deploy to production
   - Create GitHub release

**Deployment Strategy**:
- Blue-green deployment (zero downtime)
- Automated rollback on failure
- Health checks before traffic switch

### 14.4 Database Migrations

**Flyway Setup**:
- Migration scripts in `src/main/resources/db/migration/`
- Naming: `V1__initial_schema.sql`, `V2__add_formula_config.sql`
- Auto-run on application startup
- Version tracking in `flyway_schema_history` table

**Best Practices**:
- Never modify existing migrations
- Always create new migration for changes
- Test migrations on staging first
- Backup database before production migration

---

## 15. Success Metrics

### 15.1 Product Metrics

**Engagement**:
- Daily active users (DAU)
- Weekly active users (WAU)
- Average session duration
- Pages per session
- Return user rate

**Utilization Improvement**:
- Average utilization increase month-over-month
- % of managers moving to higher classification bands
- Reduction in "Ignition Zone" managers

**Badge Engagement**:
- % of managers earning at least 1 badge
- Average badges per manager
- Badge diversity (all badges earned by someone)

### 15.2 Technical Metrics

**Performance**:
- API response time (p50, p95, p99)
- Page load time (p50, p95)
- Error rate (< 1%)
- Uptime (> 99.5%)

**Data Quality**:
- Upload success rate (> 95%)
- Data validation error rate (< 5%)
- Duplicate record rate (< 1%)

### 15.3 Business Metrics

**Adoption**:
- % of managers viewing leaderboard monthly (target: > 80%)
- % of functional heads using analytics (target: > 90%)
- Admin engagement (uploads, formula changes)

**Impact**:
- Correlation between leaderboard rank and actual 1:1 quality
- Manager satisfaction scores
- Time saved vs manual reporting (target: > 10 hours/month)

---

## 16. Timeline & Milestones

### Phase 1: Foundation (Weeks 1-2)
- ✅ Set up project structure (backend + frontend)
- ✅ Database schema design and Flyway migrations
- ✅ Basic Spring Boot API scaffolding
- ✅ React app setup with Vite
- ✅ Docker Compose for local development
- ✅ CI/CD pipeline setup

### Phase 2: Core Backend (Weeks 3-4)
- ✅ Excel parsing service (Apache POI)
- ✅ Data validation and normalization
- ✅ Scoring service (all components)
- ✅ Classification service
- ✅ Badge service (all 4 badges)
- ✅ Leaderboard service
- ✅ Unit tests (> 80% coverage)

### Phase 3: Admin Dashboard (Weeks 5-6)
- ✅ Upload page (UI + integration)
- ✅ Leaderboard page (admin view)
- ✅ Analytics page
- ✅ Formula builder
- ✅ Badge management
- ✅ Responsive design

### Phase 4: User Dashboard (Week 7)
- ✅ Leaderboard page (user view)
- ✅ Manager detail page
- ✅ Personal performance card
- ✅ Animations and interactions
- ✅ Mobile responsiveness

### Phase 5: Polish & Testing (Week 8)
- ✅ Integration testing (TestContainers)
- ✅ E2E testing (Playwright/Cypress)
- ✅ Performance optimization
- ✅ Accessibility audit
- ✅ Bug fixes and refinements
- ✅ Documentation (README, API docs)

### Phase 6: Deployment (Week 9)
- ✅ Staging deployment
- ✅ User acceptance testing (UAT)
- ✅ Production deployment
- ✅ Monitoring setup
- ✅ Training materials

### Phase 7: Post-Launch (Week 10+)
- ✅ Gather user feedback
- ✅ Iterate on features
- ✅ Performance tuning
- ✅ Feature enhancements

---

## 17. Appendix

### 17.1 Sample Excel Template

**Tab Name**: `People Manager Pivot Summary`

**Required Columns** (exact headers):

| Manager Name | Headcount | Sum of 1:1s Participated with Manager Final | Total users not utilising lattice | Utilization % | Functional Head |
|--------------|-----------|---------------------------------------------|-----------------------------------|---------------|-----------------|
| John Doe     | 8         | 32                                          | 0                                 | 95.5%         | Kunal Bhattacharya |
| Jane Smith   | 5         | 18                                          | 2                                 | 78.3          | Teza Mukkavilli |
| Bob Johnson  | 12        | 45                                          | 1                                 | 0.92          | Kunal Bhattacharya |

**Notes**:
- Utilization % can be in formats: `85%`, `85`, `0.85`
- All numeric fields must be non-negative
- Manager Name will be normalized (trimmed, case-insensitive)

### 17.2 Seed Data Generator

**Purpose**: Generate realistic test data for 150+ managers across 6 months

**Features**:
- Random but realistic utilization values (normal distribution)
- Varied team sizes (1-15 members)
- Month-over-month trends (some improving, some declining)
- Ensures badge criteria are met for some managers
- Assigns functional heads (60% Kunal, 40% Teza)

**Usage**:
```bash
mvn exec:java -Dexec.mainClass="com.leaderboard.util.SeedDataGenerator" -Dexec.args="--months=6 --managers=150"
```

### 17.3 API Postman Collection

**Included Requests**:
- Upload monthly data
- Get leaderboard (with filters)
- Get manager details
- Get badge definitions
- Get formula configuration
- Create new formula version
- Get analytics overview

**Export**: Available in `docs/postman_collection.json`

### 17.4 Database ER Diagram

```
┌─────────────────┐
│    managers     │
├─────────────────┤
│ id (PK)         │
│ display_name    │
│ canonical_name  │◄──────┐
│ email           │       │
│ avatar_url      │       │
└─────────────────┘       │
                          │
                          │ (1:N)
                          │
┌─────────────────────────┼───────────────────────┐
│    monthly_metrics      │                       │
├─────────────────────────┼───────────────────────┤
│ id (PK)                 │                       │
│ manager_id (FK) ────────┘                       │
│ month                                           │
│ functional_head                                 │
│ headcount                                       │
│ one_on_ones                                     │
│ not_utilising                                   │
│ utilization                                     │
│ team_size_score                                 │
│ consistency_score                               │
│ final_score                                     │
│ classification_band                             │
│ rank                                            │
│ rank_change                                     │
│ formula_version (FK) ───────┐                   │
└─────────────────────────────┼───────────────────┘
                              │
                              │ (N:1)
                              │
                    ┌─────────▼──────────┐
                    │  formula_config    │
                    ├────────────────────┤
                    │ id (PK)            │
                    │ version            │
                    │ utilization_weight │
                    │ team_size_weight   │
                    │ consistency_weight │
                    │ team_size_mapping  │
                    │ classification_... │
                    │ active             │
                    └────────────────────┘

┌─────────────────┐
│ badge_awards    │
├─────────────────┤
│ id (PK)         │
│ manager_id (FK) ├──────► managers.id
│ badge_def_id(FK)├──────┐
│ month           │      │
│ awarded_at      │      │
│ metadata        │      │
└─────────────────┘      │
                         │ (N:1)
                         │
              ┌──────────▼──────────┐
              │ badge_definitions   │
              ├─────────────────────┤
              │ id (PK)             │
              │ code                │
              │ name                │
              │ description         │
              │ icon_key            │
              │ color               │
              │ active              │
              └─────────────────────┘
```

### 17.5 Glossary

- **Utilization**: Percentage of team members participating in 1:1 meetings
- **Final Score**: Weighted score combining utilization, team size, and consistency
- **Classification Band**: Category (Gold/Silver/Bronze/Ignition) based on final score
- **Badge**: Achievement award for meeting specific criteria
- **Consistency Score**: Measure of performance stability month-over-month
- **Team Size Score**: Bonus points for managing larger teams
- **Functional Head**: Senior leader overseeing a group of managers
- **Canonical Name**: Normalized, unique identifier for a manager
- **Upload Mode**: Overwrite (replace existing data) or Skip (ignore duplicates)

---

## 18. Future Enhancements

### 18.1 Phase 2 Features (Post-MVP)

1. **Email Notifications**
   - Monthly leaderboard summary
   - Badge achievement alerts
   - Rank change notifications
   - Ignition Zone intervention reminders

2. **Social Features**
   - Share badge achievements on Slack/Teams
   - Kudos/reactions to top performers
   - Team challenges and competitions

3. **Advanced Analytics**
   - Predictive analytics (forecast next month's performance)
   - Correlation analysis (utilization vs team satisfaction)
   - Manager cohort analysis
   - Custom report builder

4. **Gamification Enhancements**
   - More badges (e.g., "Comeback Kid", "Consistency King")
   - Leaderboard seasons (quarterly, annual)
   - Team-based competitions
   - Achievement milestones (100 1:1s, 6-month streak)

5. **Integration**
   - Lattice API integration (auto-fetch data)
   - HRIS integration (sync manager data)
   - Calendar integration (schedule 1:1s)
   - Slack/Teams bot for quick stats

6. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Offline mode
   - Quick stats widget

7. **AI/ML Features**
   - Personalized improvement recommendations
   - Anomaly detection (sudden drops in utilization)
   - Natural language queries ("Show me top performers in Q1")
   - Chatbot for leaderboard questions

### 18.2 Technical Debt & Improvements

- Implement Redis caching for frequently accessed data
- Add GraphQL API for flexible data fetching
- Implement real-time updates with WebSockets
- Add comprehensive audit logging
- Implement data export to BI tools (Tableau, Power BI)
- Add multi-tenancy support (multiple organizations)
- Implement advanced security (MFA, IP whitelisting)

---

## 19. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Excel format changes | High | Medium | Flexible parsing, clear error messages, version detection |
| Data quality issues | High | High | Robust validation, detailed error reports, manual review option |
| Performance degradation with scale | Medium | Medium | Indexing, caching, pagination, load testing |
| User adoption low | High | Medium | Engaging UI, training, stakeholder buy-in, feedback loops |
| Formula disputes | Medium | Low | Transparent criteria, admin flexibility, version history |
| Badge criteria ambiguity | Low | Medium | Clear documentation, examples, admin override option |
| Security vulnerabilities | High | Low | Regular audits, dependency updates, penetration testing |
| Database corruption | High | Low | Automated backups, replication, disaster recovery plan |

---

## 20. Conclusion

The **Lattice Utilization Leaderboard** is a comprehensive, data-driven platform designed to gamify and incentivize manager performance in 1:1 meeting utilization. With a robust backend, engaging frontend, and scalable architecture, the system will:

- **Automate** monthly score calculations and badge awards
- **Engage** users through immersive, animated dashboards
- **Empower** admins with flexible formula customization
- **Inspire** improvement through recognition and transparency
- **Scale** seamlessly as the organization grows

By following this PRD, the development team will deliver a professional, high-quality product that meets all stakeholder requirements and sets the foundation for future enhancements.

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-06 | Sri | Initial PRD creation |

---

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | Sri | _________ | ______ |
| Tech Lead | _________ | _________ | ______ |
| Design Lead | _________ | _________ | ______ |

---

**End of Document**

