import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { authenticateUser } from '@/lib/auth/config';



export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            );
        }

        // Check if user owns the comment
        const ownershipCheck = await query(
            'SELECT user_id FROM dim_comment WHERE comment_id = $1',
            [id]
        );

        if (ownershipCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        if (ownershipCheck.rows[0].user_id !== auth.user.user_id) {
            return NextResponse.json(
                { error: 'You can only edit your own comments' },
                { status: 403 }
            );
        }

        const result = await query(`
            UPDATE dim_comment 
            SET content = $1, updated_at = NOW()
            WHERE comment_id = $2
            RETURNING *
        `, [content.trim(), id]);

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json(
            { error: 'Failed to update comment' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

    const { id } = params;

        // Check if user owns the comment or is admin
        const comment = await query(
            'SELECT user_id FROM dim_comment WHERE comment_id = $1',
            [id]
        );

        if (comment.rows.length === 0) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        const isOwner = comment.rows[0].user_id === auth.user.user_id;
        const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'You can only delete your own comments' },
                { status: 403 }
            );
        }

        // Soft delete
        await query(`
            UPDATE dim_comment 
            SET is_deleted = TRUE, updated_at = NOW()
            WHERE comment_id = $1
        `, [id]);

        return NextResponse.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
