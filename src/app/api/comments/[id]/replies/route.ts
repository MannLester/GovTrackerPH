import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { optionalAuth } from '@/lib/auth/config';



export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await optionalAuth(request);

        const repliesQuery = `
            SELECT 
                c.*,
                u.first_name || ' ' || u.last_name as author_name,
                u.profile_picture as author_avatar,
                COALESCE(like_count.count, 0) as like_count,
                CASE 
                    WHEN cl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_liked_by_user
            FROM dim_comment c
            LEFT JOIN dim_user u ON c.user_id = u.user_id
            LEFT JOIN (
                SELECT comment_id, COUNT(*) as count
                FROM fact_comment_likes 
                GROUP BY comment_id
            ) like_count ON c.comment_id = like_count.comment_id
            LEFT JOIN fact_comment_likes cl ON c.comment_id = cl.comment_id 
                ${auth.user ? `AND cl.user_id = $2` : 'AND cl.user_id IS NULL'}
            WHERE c.parent_comment_id = $1 AND c.is_deleted = FALSE
            ORDER BY c.created_at ASC
        `;

        const queryParams = [id];
        if (auth.user) {
            queryParams.push(auth.user.user_id);
        }

        const result = await query(repliesQuery, queryParams);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching replies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch replies' },
            { status: 500 }
        );
    }
}
