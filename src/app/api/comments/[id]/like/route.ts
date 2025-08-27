import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { authenticateUser } from '@/lib/auth/config';



export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = params;
        const userId = auth.user.user_id;

        // Check if already liked
        const existingLike = await query(
            'SELECT * FROM fact_comment_likes WHERE comment_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingLike.rows.length > 0) {
            // Unlike
            await query(
                'DELETE FROM fact_comment_likes WHERE comment_id = $1 AND user_id = $2',
                [id, userId]
            );
            
            return NextResponse.json({
                success: true,
                data: { liked: false, message: 'Comment unliked' }
            });
        } else {
            // Like
            await query(
                'INSERT INTO fact_comment_likes (comment_id, user_id) VALUES ($1, $2)',
                [id, userId]
            );
            
            return NextResponse.json({
                success: true,
                data: { liked: true, message: 'Comment liked' }
            });
        }
    } catch (error) {
        console.error('Error toggling comment like:', error);
        return NextResponse.json(
            { error: 'Failed to toggle like' },
            { status: 500 }
        );
    }
}
