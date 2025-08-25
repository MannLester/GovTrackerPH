-- GovTracker PH Database Seed Data
-- Sample data for testing and development

-- ============================================================================
-- SEED DATA - DIMENSION TABLES
-- ============================================================================

-- Status seed data
INSERT INTO dim_status (status_name, description) VALUES
('Planning', 'Project is in planning phase'),
('In Progress', 'Project is currently being executed'),
('Completed', 'Project has been successfully completed'),
('On Hold', 'Project is temporarily suspended'),
('Cancelled', 'Project has been cancelled'),
('Under Review', 'Project is under review or evaluation'),
('Active', 'General active status'),
('Inactive', 'General inactive status');

-- Location seed data (Philippine locations)
INSERT INTO dim_location (region, province, city, barangay, address_details, latitude, longitude) VALUES
('National Capital Region', 'Metro Manila', 'Manila', 'Ermita', 'Rizal Park Area', 14.5995, 120.9842),
('National Capital Region', 'Metro Manila', 'Quezon City', 'Diliman', 'UP Campus Area', 14.6507, 121.1029),
('National Capital Region', 'Metro Manila', 'Makati', 'Poblacion', 'Ayala Avenue', 14.5547, 121.0244),
('Calabarzon', 'Laguna', 'Los Baños', 'Poblacion', 'UPLB Campus', 14.1650, 121.2449),
('Central Luzon', 'Pampanga', 'Angeles', 'Malabanas', 'Clark Special Economic Zone', 15.1450, 120.5898),
('Ilocos Region', 'Ilocos Norte', 'Laoag', 'Nangalisan', 'Laoag City Center', 18.1984, 120.5928),
('Cagayan Valley', 'Cagayan', 'Tuguegarao', 'Centro', 'City Center', 17.6132, 121.7270),
('Central Visayas', 'Cebu', 'Cebu City', 'Lahug', 'IT Park Area', 10.3157, 123.8854);

-- Contractor seed data
INSERT INTO dim_contractor (company_name, contact_person, email, phone, address, license_number) VALUES
('Philippine Infrastructure Corp', 'Juan dela Cruz', 'contact@philinfra.ph', '+63-2-8123-4567', '123 EDSA, Makati City', 'PIC-2024-001'),
('Metro Construction Inc', 'Maria Santos', 'info@metroconst.ph', '+63-2-8234-5678', '456 Ortigas Ave, Pasig City', 'MCI-2024-002'),
('Visayas Development Group', 'Pedro Gonzales', 'contracts@visdev.ph', '+63-32-234-5678', '789 Colon St, Cebu City', 'VDG-2024-003'),
('Mindanao Works Ltd', 'Ana Rodriguez', 'projects@mindworks.ph', '+63-82-345-6789', '321 Roxas Ave, Davao City', 'MWL-2024-004'),
('Northern Luzon Builders', 'Carlos Villanueva', 'build@nlbuilders.ph', '+63-77-456-7890', '654 Session Rd, Baguio City', 'NLB-2024-005');

-- User seed data (Admin and sample users)
INSERT INTO dim_user (username, email, password_hash, first_name, last_name, role, status_id) 
SELECT 
    'admin', 
    'admin@govtracker.ph', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeF8fI1.0oWMMUHNe', -- 'password123'
    'System', 
    'Administrator', 
    'super-admin',
    status_id 
FROM dim_status WHERE status_name = 'Active';

INSERT INTO dim_user (username, email, password_hash, first_name, last_name, role, status_id) 
SELECT 
    'jdcruz', 
    'juan.delacruz@gov.ph', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeF8fI1.0oWMMUHNe', 
    'Juan', 
    'Dela Cruz', 
    'admin',
    status_id 
FROM dim_status WHERE status_name = 'Active';

INSERT INTO dim_user (username, email, password_hash, first_name, last_name, role, status_id) 
SELECT 
    'msantos', 
    'maria.santos@gov.ph', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeF8fI1.0oWMMUHNe', 
    'Maria', 
    'Santos', 
    'personnel',
    status_id 
FROM dim_status WHERE status_name = 'Active';

INSERT INTO dim_user (username, email, password_hash, first_name, last_name, role, status_id) 
SELECT 
    'citizen1', 
    'citizen@email.com', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeF8fI1.0oWMMUHNe', 
    'Pedro', 
    'Rodriguez', 
    'citizen',
    status_id 
FROM dim_status WHERE status_name = 'Active';

-- ============================================================================
-- SEED DATA - PROJECTS
-- ============================================================================

-- Sample projects
INSERT INTO dim_project (title, description, budget, start_date, end_date, status_id, location_id, contractor_id, progress_percentage, expected_outcome, reason, created_by)
SELECT 
    'Manila Bay Rehabilitation Phase 2',
    'Continuation of the Manila Bay cleanup and rehabilitation project to restore the bay''s natural ecosystem and improve water quality.',
    15000000000.00,
    '2024-01-15',
    '2025-12-31',
    s.status_id,
    l.location_id,
    c.contractor_id,
    35,
    'Clean and swimmable Manila Bay with restored marine ecosystem',
    'Environmental restoration and public health improvement',
    u.user_id
FROM dim_status s, dim_location l, dim_contractor c, dim_user u
WHERE s.status_name = 'In Progress' 
    AND l.city = 'Manila' 
    AND c.company_name = 'Philippine Infrastructure Corp'
    AND u.username = 'admin';

INSERT INTO dim_project (title, description, budget, start_date, end_date, status_id, location_id, contractor_id, progress_percentage, expected_outcome, reason, created_by)
SELECT 
    'Quezon City Smart Traffic System',
    'Implementation of AI-powered traffic management system to reduce congestion and improve traffic flow in major QC intersections.',
    2500000000.00,
    '2024-03-01',
    '2024-11-30',
    s.status_id,
    l.location_id,
    c.contractor_id,
    60,
    'Reduced traffic congestion by 40% and improved commute times',
    'Urban mobility and economic efficiency improvement',
    u.user_id
FROM dim_status s, dim_location l, dim_contractor c, dim_user u
WHERE s.status_name = 'In Progress' 
    AND l.city = 'Quezon City' 
    AND c.company_name = 'Metro Construction Inc'
    AND u.username = 'jdcruz';

INSERT INTO dim_project (title, description, budget, start_date, end_date, status_id, location_id, contractor_id, progress_percentage, expected_outcome, reason, created_by)
SELECT 
    'Cebu IT Park Expansion',
    'Expansion of Cebu IT Park to accommodate more technology companies and create additional employment opportunities.',
    5000000000.00,
    '2024-02-01',
    '2025-08-31',
    s.status_id,
    l.location_id,
    c.contractor_id,
    25,
    'Additional 50,000 job opportunities in IT sector',
    'Economic development and job creation in Visayas region',
    u.user_id
FROM dim_status s, dim_location l, dim_contractor c, dim_user u
WHERE s.status_name = 'In Progress' 
    AND l.city = 'Cebu City' 
    AND c.company_name = 'Visayas Development Group'
    AND u.username = 'msantos';

INSERT INTO dim_project (title, description, budget, start_date, status_id, location_id, contractor_id, progress_percentage, expected_outcome, reason, created_by)
SELECT 
    'Clark Green City Development',
    'Development of sustainable urban center with green infrastructure, renewable energy, and smart city technologies.',
    25000000000.00,
    '2024-01-01',
    s.status_id,
    l.location_id,
    c.contractor_id,
    15,
    'Model sustainable city for the Philippines',
    'Sustainable development and climate change mitigation',
    u.user_id
FROM dim_status s, dim_location l, dim_contractor c, dim_user u
WHERE s.status_name = 'Planning' 
    AND l.city = 'Angeles' 
    AND c.company_name = 'Northern Luzon Builders'
    AND u.username = 'admin';

-- ============================================================================
-- SEED DATA - PROJECT INTERACTIONS
-- ============================================================================

-- Sample comments
INSERT INTO dim_comment (user_id, project_id, content)
SELECT 
    u.user_id,
    p.project_id,
    'Great progress on this project! Looking forward to seeing the results.'
FROM dim_user u, dim_project p
WHERE u.username = 'citizen1' AND p.title = 'Manila Bay Rehabilitation Phase 2';

INSERT INTO dim_comment (user_id, project_id, content)
SELECT 
    u.user_id,
    p.project_id,
    'When will the traffic improvements be noticeable in EDSA?'
FROM dim_user u, dim_project p
WHERE u.username = 'citizen1' AND p.title = 'Quezon City Smart Traffic System';

-- Sample project likes
INSERT INTO fact_project_likes (project_id, user_id)
SELECT 
    p.project_id,
    u.user_id
FROM dim_project p, dim_user u
WHERE p.title = 'Manila Bay Rehabilitation Phase 2' AND u.username = 'citizen1';

INSERT INTO fact_project_likes (project_id, user_id)
SELECT 
    p.project_id,
    u.user_id
FROM dim_project p, dim_user u
WHERE p.title = 'Quezon City Smart Traffic System' AND u.username = 'citizen1';

-- Sample project milestones
INSERT INTO fact_project_milestones (project_id, title, description, target_date, is_completed)
SELECT 
    p.project_id,
    'Environmental Impact Assessment',
    'Complete comprehensive environmental impact study',
    '2024-03-31',
    true
FROM dim_project p
WHERE p.title = 'Manila Bay Rehabilitation Phase 2';

INSERT INTO fact_project_milestones (project_id, title, description, target_date, is_completed)
SELECT 
    p.project_id,
    'Water Quality Testing Phase 1',
    'Complete initial water quality baseline testing',
    '2024-06-30',
    true
FROM dim_project p
WHERE p.title = 'Manila Bay Rehabilitation Phase 2';

INSERT INTO fact_project_milestones (project_id, title, description, target_date, is_completed)
SELECT 
    p.project_id,
    'Dredging Operations',
    'Complete 50% of planned dredging operations',
    '2024-12-31',
    false
FROM dim_project p
WHERE p.title = 'Manila Bay Rehabilitation Phase 2';
