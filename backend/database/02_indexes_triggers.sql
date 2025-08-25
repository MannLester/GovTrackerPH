-- GovTracker PH Database Indexes and Triggers
-- Performance and Automation Script

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User table indexes
CREATE INDEX idx_user_email ON dim_user(email);
CREATE INDEX idx_user_username ON dim_user(username);
CREATE INDEX idx_user_role ON dim_user(role);
CREATE INDEX idx_user_active ON dim_user(is_active);

-- Project table indexes
CREATE INDEX idx_project_status ON dim_project(status_id);
CREATE INDEX idx_project_location ON dim_project(location_id);
CREATE INDEX idx_project_contractor ON dim_project(contractor_id);
CREATE INDEX idx_project_created_by ON dim_project(created_by);
CREATE INDEX idx_project_start_date ON dim_project(start_date);
CREATE INDEX idx_project_progress ON dim_project(progress_percentage);

-- Comment table indexes
CREATE INDEX idx_comment_project ON dim_comment(project_id);
CREATE INDEX idx_comment_user ON dim_comment(user_id);
CREATE INDEX idx_comment_parent ON dim_comment(parent_comment_id);
CREATE INDEX idx_comment_deleted ON dim_comment(is_deleted);

-- Fact table indexes
CREATE INDEX idx_project_likes_project ON fact_project_likes(project_id);
CREATE INDEX idx_project_likes_user ON fact_project_likes(user_id);
CREATE INDEX idx_comment_likes_comment ON fact_comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON fact_comment_likes(user_id);
CREATE INDEX idx_project_images_project ON fact_project_images(project_id);
CREATE INDEX idx_project_images_primary ON fact_project_images(is_primary);
CREATE INDEX idx_project_milestones_project ON fact_project_milestones(project_id);
CREATE INDEX idx_project_milestones_completed ON fact_project_milestones(is_completed);
CREATE INDEX idx_project_personnel_project ON fact_project_personnel(project_id);
CREATE INDEX idx_project_personnel_user ON fact_project_personnel(user_id);
CREATE INDEX idx_project_personnel_active ON fact_project_personnel(is_active);

-- Location geographic indexes
CREATE INDEX idx_location_region ON dim_location(region);
CREATE INDEX idx_location_province ON dim_location(province);
CREATE INDEX idx_location_city ON dim_location(city);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT COLUMNS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns
CREATE TRIGGER update_dim_status_updated_at 
    BEFORE UPDATE ON dim_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_location_updated_at 
    BEFORE UPDATE ON dim_location 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_contractor_updated_at 
    BEFORE UPDATE ON dim_contractor 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_user_updated_at 
    BEFORE UPDATE ON dim_user 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_project_updated_at 
    BEFORE UPDATE ON dim_project 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_comment_updated_at 
    BEFORE UPDATE ON dim_comment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_stats_updated_at 
    BEFORE UPDATE ON dim_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fact_project_milestones_updated_at 
    BEFORE UPDATE ON fact_project_milestones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fact_project_personnel_updated_at 
    BEFORE UPDATE ON fact_project_personnel 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STATS UPDATE FUNCTIONS
-- ============================================================================

-- Function to update project stats when likes change
CREATE OR REPLACE FUNCTION update_project_stats_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE dim_stats 
        SET total_likes = total_likes + 1, 
            last_calculated = NOW()
        WHERE project_id = NEW.project_id;
        
        -- If no stats record exists, create one
        INSERT INTO dim_stats (project_id, total_likes, total_comments, total_views)
        SELECT NEW.project_id, 1, 0, 0
        WHERE NOT EXISTS (SELECT 1 FROM dim_stats WHERE project_id = NEW.project_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE dim_stats 
        SET total_likes = GREATEST(total_likes - 1, 0), 
            last_calculated = NOW()
        WHERE project_id = OLD.project_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update project stats when comments change
CREATE OR REPLACE FUNCTION update_project_stats_comments()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE dim_stats 
        SET total_comments = total_comments + 1, 
            last_calculated = NOW()
        WHERE project_id = NEW.project_id;
        
        -- If no stats record exists, create one
        INSERT INTO dim_stats (project_id, total_likes, total_comments, total_views)
        SELECT NEW.project_id, 0, 1, 0
        WHERE NOT EXISTS (SELECT 1 FROM dim_stats WHERE project_id = NEW.project_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE dim_stats 
        SET total_comments = GREATEST(total_comments - 1, 0), 
            last_calculated = NOW()
        WHERE project_id = OLD.project_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply stats triggers
CREATE TRIGGER trigger_update_project_stats_likes
    AFTER INSERT OR DELETE ON fact_project_likes
    FOR EACH ROW EXECUTE FUNCTION update_project_stats_likes();

CREATE TRIGGER trigger_update_project_stats_comments
    AFTER INSERT OR DELETE ON dim_comment
    FOR EACH ROW EXECUTE FUNCTION update_project_stats_comments();
