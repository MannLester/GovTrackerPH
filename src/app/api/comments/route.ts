import { NextRequest, NextResponse } from 'next/server';
import { commentsRepository, query } from '@/lib/database/config';
import { optionalAuth, authenticateUser } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const auth = await optionalAuth(request);

        const commentsQuery = `
            SELECT 
                c.*,
                u.first_name || ' ' || u.last_name as author_name,
                u.profile_picture as author_avatar,
                COALESCE(like_count.count, 0) as like_count,
                CASE 
                    WHEN cl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_liked_by_user,
                reply_count.count as reply_count
            FROM dim_comment c
            LEFT JOIN dim_user u ON c.user_id = u.user_id
            LEFT JOIN (
                SELECT comment_id, COUNT(*) as count
                FROM fact_comment_likes 
                GROUP BY comment_id
            ) like_count ON c.comment_id = like_count.comment_id
            LEFT JOIN fact_comment_likes cl ON c.comment_id = cl.comment_id 
                ${auth.user ? `AND cl.user_id = $4` : 'AND cl.user_id IS NULL'}
            LEFT JOIN (
                SELECT parent_comment_id, COUNT(*) as count
                FROM dim_comment 
                WHERE parent_comment_id IS NOT NULL AND is_deleted = FALSE
                GROUP BY parent_comment_id
            ) reply_count ON c.comment_id = reply_count.parent_comment_id
            WHERE c.project_id = $1 
                AND c.parent_comment_id IS NULL 
                AND c.is_deleted = FALSE
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const queryParams = [projectId, limit, offset];
        if (auth.user) {
            queryParams.push(auth.user.user_id);
        }

        const result = await query(commentsQuery, queryParams);

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*) 
            FROM dim_comment 
            WHERE project_id = $1 AND parent_comment_id IS NULL AND is_deleted = FALSE
        `, [projectId]);

        const totalCount = parseInt(countResult.rows[0].count);

        return NextResponse.json({
            success: true,
            data: {
                comments: result.rows,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: limit
                }
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { projectId, content, parent_comment_id } = body;

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            );
        }

        const result = await query(`
            INSERT INTO dim_comment (user_id, project_id, content, parent_comment_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [auth.user.user_id, projectId, content.trim(), parent_comment_id || null]);

        // Get the created comment with user info
        const commentWithUser = await query(`
            SELECT 
                c.*,
                u.first_name || ' ' || u.last_name as author_name,
                u.profile_picture as author_avatar,
                0 as like_count,
                false as is_liked_by_user
            FROM dim_comment c
            LEFT JOIN dim_user u ON c.user_id = u.user_id
            WHERE c.comment_id = $1
        `, [result.rows[0].comment_id]);

        return NextResponse.json({
            success: true,
            data: commentWithUser.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}
