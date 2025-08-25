import express from 'express';
import { query } from '../config/database.js';
import { authenticateFirebaseUser, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/projects - Get all projects with optional filtering
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            region,
            search,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        
        let whereClause = "WHERE p.project_id IS NOT NULL";
        const queryParams = [];
        let paramCount = 0;

        // Add filters
        if (status) {
            paramCount++;
            whereClause += ` AND s.status_name = $${paramCount}`;
            queryParams.push(status);
        }

        if (region) {
            paramCount++;
            whereClause += ` AND l.region = $${paramCount}`;
            queryParams.push(region);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }

        // Add pagination
        paramCount++;
        const limitParam = paramCount;
        paramCount++;
        const offsetParam = paramCount;
        queryParams.push(parseInt(limit), parseInt(offset));

        const projectsQuery = `
            SELECT 
                p.*,
                s.status_name,
                l.region,
                l.province,
                l.city,
                l.barangay,
                c.company_name as contractor_name,
                u.first_name || ' ' || u.last_name as created_by_name,
                COALESCE(stats.total_likes, 0) as total_likes,
                COALESCE(stats.total_comments, 0) as total_comments,
                COALESCE(stats.total_views, 0) as total_views,
                CASE 
                    WHEN pl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_liked_by_user
            FROM dim_project p
            LEFT JOIN dim_status s ON p.status_id = s.status_id
            LEFT JOIN dim_location l ON p.location_id = l.location_id
            LEFT JOIN dim_contractor c ON p.contractor_id = c.contractor_id
            LEFT JOIN dim_user u ON p.created_by = u.user_id
            LEFT JOIN dim_stats stats ON p.project_id = stats.project_id
            LEFT JOIN fact_project_likes pl ON p.project_id = pl.project_id 
                ${req.user ? `AND pl.user_id = '${req.user.user_id}'` : 'AND pl.user_id IS NULL'}
            ${whereClause}
            ORDER BY p.${sort} ${order}
            LIMIT $${limitParam} OFFSET $${offsetParam}
        `;

        const result = await query(projectsQuery, queryParams);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) 
            FROM dim_project p
            LEFT JOIN dim_status s ON p.status_id = s.status_id
            LEFT JOIN dim_location l ON p.location_id = l.location_id
            ${whereClause}
        `;
        
        const countResult = await query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            data: {
                projects: result.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch projects'
        });
    }
});

// GET /api/projects/:id - Get single project with details
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const projectQuery = `
            SELECT 
                p.*,
                s.status_name,
                l.region,
                l.province,
                l.city,
                l.barangay,
                l.address_details,
                l.latitude,
                l.longitude,
                c.company_name as contractor_name,
                c.contact_person as contractor_contact,
                c.email as contractor_email,
                c.phone as contractor_phone,
                u.first_name || ' ' || u.last_name as created_by_name,
                COALESCE(stats.total_likes, 0) as total_likes,
                COALESCE(stats.total_comments, 0) as total_comments,
                COALESCE(stats.total_views, 0) as total_views,
                CASE 
                    WHEN pl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_liked_by_user
            FROM dim_project p
            LEFT JOIN dim_status s ON p.status_id = s.status_id
            LEFT JOIN dim_location l ON p.location_id = l.location_id
            LEFT JOIN dim_contractor c ON p.contractor_id = c.contractor_id
            LEFT JOIN dim_user u ON p.created_by = u.user_id
            LEFT JOIN dim_stats stats ON p.project_id = stats.project_id
            LEFT JOIN fact_project_likes pl ON p.project_id = pl.project_id 
                ${req.user ? `AND pl.user_id = $2` : 'AND pl.user_id IS NULL'}
            WHERE p.project_id = $1
        `;

        const queryParams = [id];
        if (req.user) {
            queryParams.push(req.user.user_id);
        }

        const result = await query(projectQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Get project milestones
        const milestonesQuery = `
            SELECT * FROM fact_project_milestones 
            WHERE project_id = $1 
            ORDER BY target_date ASC
        `;
        const milestones = await query(milestonesQuery, [id]);

        // Get project images
        const imagesQuery = `
            SELECT * FROM fact_project_images 
            WHERE project_id = $1 
            ORDER BY is_primary DESC, created_at DESC
        `;
        const images = await query(imagesQuery, [id]);

        // Increment view count
        await query(`
            UPDATE dim_stats 
            SET total_views = total_views + 1, last_calculated = NOW()
            WHERE project_id = $1
        `, [id]);

        const project = {
            ...result.rows[0],
            milestones: milestones.rows,
            images: images.rows
        };

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project'
        });
    }
});

// POST /api/projects - Create new project (admin only)
router.post('/', authenticateFirebaseUser, requireAdmin, async (req, res) => {
    try {
        const {
            title,
            description,
            budget,
            start_date,
            end_date,
            status_id,
            location_id,
            contractor_id,
            progress_percentage = 0,
            expected_outcome,
            reason
        } = req.body;

        const result = await query(`
            INSERT INTO dim_project (
                title, description, budget, start_date, end_date,
                status_id, location_id, contractor_id, progress_percentage,
                expected_outcome, reason, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            title, description, budget, start_date, end_date,
            status_id, location_id, contractor_id, progress_percentage,
            expected_outcome, reason, req.user.user_id
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create project'
        });
    }
});

// PUT /api/projects/:id - Update project (admin only)
router.put('/:id', authenticateFirebaseUser, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Build dynamic update query
        const setClause = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');
        
        const values = [id, ...Object.values(updates)];

        const result = await query(`
            UPDATE dim_project 
            SET ${setClause}, updated_at = NOW()
            WHERE project_id = $1
            RETURNING *
        `, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update project'
        });
    }
});

// POST /api/projects/:id/like - Like/unlike project
router.post('/:id/like', authenticateFirebaseUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        // Check if already liked
        const existingLike = await query(
            'SELECT * FROM fact_project_likes WHERE project_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingLike.rows.length > 0) {
            // Unlike
            await query(
                'DELETE FROM fact_project_likes WHERE project_id = $1 AND user_id = $2',
                [id, userId]
            );
            
            res.json({
                success: true,
                data: { liked: false, message: 'Project unliked' }
            });
        } else {
            // Like
            await query(
                'INSERT INTO fact_project_likes (project_id, user_id) VALUES ($1, $2)',
                [id, userId]
            );
            
            res.json({
                success: true,
                data: { liked: true, message: 'Project liked' }
            });
        }
    } catch (error) {
        console.error('Error toggling project like:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle like'
        });
    }
});

export default router;
