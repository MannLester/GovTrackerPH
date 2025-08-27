import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { authenticateUser } from '@/lib/auth/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const auth = await authenticateUser(request);

    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = auth.user.user_id;
    const body = await request.json();
    const likeType: 'like' | 'dislike' = body.type || 'like';

    if (!['like', 'dislike'].includes(likeType)) {
      return NextResponse.json(
        { error: 'Invalid like type. Must be "like" or "dislike"' },
        { status: 400 }
      );
    }

    // Check if user already has a reaction
    const existingReaction = await query(
      'SELECT * FROM fact_project_likes WHERE project_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingReaction.rows.length > 0) {
      const currentReaction = existingReaction.rows[0];

      if (currentReaction.like_type === likeType) {
        // Same reaction → remove it
        await query(
          'DELETE FROM fact_project_likes WHERE project_id = $1 AND user_id = $2',
          [id, userId]
        );

        return NextResponse.json({
          success: true,
          action: 'removed',
          message: `${likeType} removed`,
        });
      } else {
        // Different reaction → update it
        await query(
          'UPDATE fact_project_likes SET like_type = $1, created_at = NOW() WHERE project_id = $2 AND user_id = $3',
          [likeType, id, userId]
        );

        return NextResponse.json({
          success: true,
          action: 'updated',
          message: `Changed to ${likeType}`,
        });
      }
    }

    // No previous reaction → insert
    await query(
      'INSERT INTO fact_project_likes (project_id, user_id, like_type) VALUES ($1, $2, $3)',
      [id, userId, likeType]
    );

    return NextResponse.json({
      success: true,
      action: 'added',
      message: `Project ${likeType}d`,
    });
  } catch (error) {
    console.error('❌ Error handling project reaction:', error);
    return NextResponse.json(
      { error: 'Failed to handle reaction' },
      { status: 500 }
    );
  }
}
