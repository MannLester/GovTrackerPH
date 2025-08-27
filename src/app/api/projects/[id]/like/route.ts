import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/config';
import { authenticateUser } from '@/lib/auth/config';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {

    const auth = await authenticateUser(request);

    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      ); 
    }
    //Here
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
    const { data: existingReaction, error: selectError } = await supabase
      .from('fact_project_likes')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingReaction) {
      if (existingReaction.like_type === likeType) {
        // Same reaction → remove it
        const { error: deleteError } = await supabase
          .from('fact_project_likes')
          .delete()
          .eq('project_id', id)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        return NextResponse.json({
          success: true,
          action: 'removed',
          message: `${likeType} removed`,
        });
      } else {
        // Different reaction → update it
        const { error: updateError } = await supabase
          .from('fact_project_likes')
          .update({ 
            like_type: likeType,
            created_at: new Date().toISOString()
          })
          .eq('project_id', id)
          .eq('user_id', userId);

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          action: 'updated',
          message: `Changed to ${likeType}`,
        });
      }
    }

    // No previous reaction → insert
    const { error: insertError } = await supabase
      .from('fact_project_likes')
      .insert({
        project_id: id,
        user_id: userId,
        like_type: likeType
      });

    if (insertError) throw insertError;

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
