-- GovTracker PH Database Schema
-- PostgreSQL/Supabase Table Creation Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DIMENSION TABLES
-- ============================================================================

-- Status Dimension Table
CREATE TABLE dim_status (
    status_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location Dimension Table
CREATE TABLE dim_location (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    barangay VARCHAR(100),
    address_details TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractor Dimension Table
CREATE TABLE dim_contractor (
    contractor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    license_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Dimension Table
CREATE TABLE dim_user (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    profile_picture TEXT,
    role VARCHAR(20) CHECK (role IN ('citizen', 'admin', 'personnel', 'super-admin')) DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT TRUE,
    status_id UUID REFERENCES dim_status(status_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Dimension Table
CREATE TABLE dim_project (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status_id UUID NOT NULL REFERENCES dim_status(status_id),
    location_id UUID NOT NULL REFERENCES dim_location(location_id),
    contractor_id UUID REFERENCES dim_contractor(contractor_id),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    expected_outcome TEXT,
    reason TEXT,
    created_by UUID NOT NULL REFERENCES dim_user(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment Dimension Table
CREATE TABLE dim_comment (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES dim_user(user_id),
    project_id UUID NOT NULL REFERENCES dim_project(project_id),
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES dim_comment(comment_id),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats Dimension Table
CREATE TABLE dim_stats (
    stats_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES dim_project(project_id),
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FACT TABLES
-- ============================================================================

-- Project Likes Fact Table
CREATE TABLE fact_project_likes (
    like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES dim_project(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES dim_user(user_id) ON DELETE CASCADE,
    like_type VARCHAR(10) CHECK (like_type IN ('like', 'dislike')) DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id) -- Prevent duplicate likes from same user
);

-- Comment Likes Fact Table
CREATE TABLE fact_comment_likes (
    like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES dim_comment(comment_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES dim_user(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id) -- Prevent duplicate likes from same user
);

-- Project Images Fact Table
CREATE TABLE fact_project_images (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES dim_project(project_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by UUID NOT NULL REFERENCES dim_user(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Milestones Fact Table
CREATE TABLE fact_project_milestones (
    milestone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES dim_project(project_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    completion_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Personnel Fact Table
CREATE TABLE fact_project_personnel (
    personnel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES dim_project(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES dim_user(user_id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('project_manager', 'engineer', 'supervisor', 'worker')) NOT NULL,
    assigned_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id, role) -- Prevent duplicate role assignments
);
