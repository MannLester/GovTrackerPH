import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { optionalAuth, authenticateUser, requireAdmin } from '@/lib/auth/config';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const auth = await optionalAuth(request);

        const projectQuery = `
            SELECT 
                p.*,
                s.status_name,
                l.region,
                l.province,
                l.city,
                l.barangay,
                c.name as contractor_name,
                COALESCE(likes.likes, 0) as likes,
                COALESCE(dislikes.dislikes, 0) as dislikes,
                COALESCE(comments.comments, 0) as comments,
                CASE 
                    WHEN pl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_liked_by_user
            FROM dim_project p
            LEFT JOIN dim_status s ON p.status_id = s.status_id
            LEFT JOIN dim_location l ON p.location_id = l.location_id
            LEFT JOIN dim_contractor c ON p.contractor_id = c.contractor_id
            LEFT JOIN (
                SELECT project_id, COUNT(*) as likes 
                FROM fact_project_likes 
                WHERE like_type = 'like' 
                GROUP BY project_id
            ) likes ON p.project_id = likes.project_id
            LEFT JOIN (
                SELECT project_id, COUNT(*) as dislikes 
                FROM fact_project_likes 
                WHERE like_type = 'dislike' 
                GROUP BY project_id
            ) dislikes ON p.project_id = dislikes.project_id
            LEFT JOIN (
                SELECT project_id, COUNT(*) as comments 
                FROM dim_comment 
                GROUP BY project_id
            ) comments ON p.project_id = comments.project_id
            LEFT JOIN fact_project_likes pl ON p.project_id = pl.project_id 
                ${auth.user ? `AND pl.user_id = $2` : 'AND pl.user_id IS NULL'}
            WHERE p.project_id = $1
        `;

        const queryParams = [id];
        if (auth.user) {
            queryParams.push(auth.user.user_id);
        }

        const result = await query(projectQuery, queryParams);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
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

        // Increment view count (optional - you might want to track this differently)
        try {
            await query(`
                INSERT INTO dim_stats (project_id, total_views, total_likes, total_comments)
                VALUES ($1, 1, 0, 0)
                ON CONFLICT (project_id) 
                DO UPDATE SET 
                    total_views = dim_stats.total_views + 1,
                    last_calculated = NOW()
            `, [id]);
        } catch (error) {
            console.log('View count update failed:', error);
        }

        const project = {
            ...result.rows[0],
            milestones: milestones.rows,
            images: images.rows
        };

        return NextResponse.json({
            project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params;
        const body = await request.json();
        const {
            title,
            description,
            budget,
            start_date,
            end_date,
            status_id,
            location_id,
            contractor_id,
            progress_percentage,
            expected_outcome,
            reason
        } = body;

        // Check if project exists
        const existingProject = await query(
            'SELECT project_id FROM dim_project WHERE project_id = $1',
            [id]
        );

        if (existingProject.rows.length === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Validate required fields
        if (!title || !description || !budget || !start_date || !status_id || !location_id) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description, budget, start_date, status_id, location_id' },
                { status: 400 }
            );
        }

        const result = await query(`
            UPDATE dim_project 
            SET 
                title = $2,
                description = $3,
                budget = $4,
                start_date = $5,
                end_date = $6,
                status_id = $7,
                location_id = $8,
                contractor_id = $9,
                progress_percentage = $10,
                expected_outcome = $11,
                reason = $12,
                updated_at = CURRENT_TIMESTAMP
            WHERE project_id = $1
            RETURNING *
        `, [
            id, title, description, budget, start_date, end_date,
            status_id, location_id, contractor_id, progress_percentage,
            expected_outcome, reason
        ]);

        return NextResponse.json({
            success: true,
            project: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}
