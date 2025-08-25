import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { authenticateUser, requireAdmin } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        if (!requireAdmin(auth.user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

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

        return NextResponse.json({
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
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
