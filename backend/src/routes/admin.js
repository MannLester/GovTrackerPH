import express from 'express';
import { query } from '../config/database.js';
import { authenticateFirebaseUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateFirebaseUser);
router.use(requireAdmin);

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get overall statistics
        const totalProjects = await query('SELECT COUNT(*) as count FROM dim_project');
        const totalUsers = await query('SELECT COUNT(*) as count FROM dim_user WHERE role = $1', ['citizen']);
        const totalComments = await query('SELECT COUNT(*) as count FROM dim_comment WHERE is_deleted = FALSE');
        const totalLikes = await query('SELECT COUNT(*) as count FROM fact_project_likes');

        // Get projects by status
        const projectsByStatus = await query(`
            SELECT s.status_name, COUNT(p.project_id) as count
            FROM dim_status s
            LEFT JOIN dim_project p ON s.status_id = p.status_id
            GROUP BY s.status_name, s.status_id
            ORDER BY count DESC
        `);

        // Get projects by region
        const projectsByRegion = await query(`
            SELECT l.region, COUNT(p.project_id) as count
            FROM dim_location l
            LEFT JOIN dim_project p ON l.location_id = p.location_id
            GROUP BY l.region
            HAVING COUNT(p.project_id) > 0
            ORDER BY count DESC
        `);

        // Get recent activities (latest projects, comments)
        const recentProjects = await query(`
            SELECT 
                p.project_id,
                p.title,
                p.created_at,
                s.status_name,
                u.first_name || ' ' || u.last_name as created_by
            FROM dim_project p
            LEFT JOIN dim_status s ON p.status_id = s.status_id
            LEFT JOIN dim_user u ON p.created_by = u.user_id
            ORDER BY p.created_at DESC
            LIMIT 10
        `);

        const recentComments = await query(`
            SELECT 
                c.comment_id,
                c.content,
                c.created_at,
                u.first_name || ' ' || u.last_name as author,
                p.title as project_title
            FROM dim_comment c
            LEFT JOIN dim_user u ON c.user_id = u.user_id
            LEFT JOIN dim_project p ON c.project_id = p.project_id
            WHERE c.is_deleted = FALSE
            ORDER BY c.created_at DESC
            LIMIT 10
        `);

        // Budget analytics
        const budgetStats = await query(`
            SELECT 
                COUNT(*) as total_projects,
                SUM(budget) as total_budget,
                AVG(budget) as average_budget,
                MIN(budget) as min_budget,
                MAX(budget) as max_budget
            FROM dim_project
        `);

        res.json({
            success: true,
            data: {
                overview: {
                    totalProjects: parseInt(totalProjects.rows[0].count),
                    totalUsers: parseInt(totalUsers.rows[0].count),
                    totalComments: parseInt(totalComments.rows[0].count),
                    totalLikes: parseInt(totalLikes.rows[0].count)
                },
                projectsByStatus: projectsByStatus.rows,
                projectsByRegion: projectsByRegion.rows,
                recentActivity: {
                    projects: recentProjects.rows,
                    comments: recentComments.rows
                },
                budget: budgetStats.rows[0]
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// GET /api/admin/users - Get all users with pagination
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE u.user_id IS NOT NULL';
        const queryParams = [];
        let paramCount = 0;

        if (role) {
            paramCount++;
            whereClause += ` AND u.role = $${paramCount}`;
            queryParams.push(role);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }

        paramCount++;
        const limitParam = paramCount;
        paramCount++;
        const offsetParam = paramCount;
        queryParams.push(parseInt(limit), parseInt(offset));

        const usersQuery = `
            SELECT 
                u.*,
                s.status_name,
                COUNT(DISTINCT p.project_id) as projects_created,
                COUNT(DISTINCT c.comment_id) as comments_made,
                COUNT(DISTINCT pl.like_id) as projects_liked
            FROM dim_user u
            LEFT JOIN dim_status s ON u.status_id = s.status_id
            LEFT JOIN dim_project p ON u.user_id = p.created_by
            LEFT JOIN dim_comment c ON u.user_id = c.user_id AND c.is_deleted = FALSE
            LEFT JOIN fact_project_likes pl ON u.user_id = pl.user_id
            ${whereClause}
            GROUP BY u.user_id, s.status_name
            ORDER BY u.created_at DESC
            LIMIT $${limitParam} OFFSET $${offsetParam}
        `;

        const result = await query(usersQuery, queryParams);

        // Get total count
        const countQuery = `
            SELECT COUNT(*) 
            FROM dim_user u
            ${whereClause}
        `;
        const countResult = await query(countQuery, queryParams.slice(0, -2));
        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            data: {
                users: result.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['citizen', 'admin', 'personnel', 'super-admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role'
            });
        }

        const result = await query(`
            UPDATE dim_user 
            SET role = $1, updated_at = NOW()
            WHERE user_id = $2
            RETURNING *
        `, [role, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user role'
        });
    }
});

// GET /api/admin/projects/pending - Get projects pending approval
router.get('/projects/pending', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                p.*,
                s.status_name,
                l.region,
                l.city,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM dim_project p
            LEFT JOIN dim_status s ON p.status_id = s.status_id
            LEFT JOIN dim_location l ON p.location_id = l.location_id
            LEFT JOIN dim_user u ON p.created_by = u.user_id
            WHERE s.status_name = 'Under Review'
            ORDER BY p.created_at ASC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching pending projects:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pending projects'
        });
    }
});

export default router;
