import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/config';
import { authenticateUser } from '@/lib/auth/config';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Get total like/dislike counts (public, no auth required)
    const { data: allVotes, error: countError } = await supabase
      .from('fact_project_likes')
      .select('like_type')
      .eq('project_id', id);

    if (countError) {
      throw countError;
    }

    const likes = allVotes?.filter(v => v.like_type === 'like').length || 0;
    const dislikes = allVotes?.filter(v => v.like_type === 'dislike').length || 0;

    // Try to get user-specific vote status (optional, only if authenticated)
    let userVote: 'like' | 'dislike' | null = null;
    
    try {
      const auth = await authenticateUser(request);
      
      if (auth.user && !auth.error) {
        const userId = auth.user.user_id;
        
        // Get current user's vote
        const { data: userVoteData, error: voteError } = await supabase
          .from('fact_project_likes')
          .select('like_type')
          .eq('project_id', id)
          .eq('user_id', userId)
          .single();

        if (!voteError || voteError.code === 'PGRST116') {
          userVote = userVoteData?.like_type || null;
        }
      }
    } catch (authError) {
      // Authentication failed, but we still return public counts
      console.log('No authentication provided, returning public counts only');
    }

    return NextResponse.json({
      success: true,
      data: {
        likes,
        dislikes,
        userVote
      }
    });

  } catch (error) {
    console.error('Error fetching vote status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote status' },
      { status: 500 }
    );
  }
}

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
    const likeType: 'like' | 'dislike' = body.voteType || 'like';

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

    let action: string;
    let userVote: 'like' | 'dislike' | null = null;

    if (existingReaction) {
      if (existingReaction.like_type === likeType) {
        // Same reaction → remove it
        const { error: deleteError } = await supabase
          .from('fact_project_likes')
          .delete()
          .eq('project_id', id)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        action = 'removed';
        userVote = null;
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

        action = 'updated';
        userVote = likeType;
      }
    } else {
      // No previous reaction → insert
      const { error: insertError } = await supabase
        .from('fact_project_likes')
        .insert({
          project_id: id,
          user_id: userId,
          like_type: likeType
        });

      if (insertError) throw insertError;

      action = 'added';
      userVote = likeType;
    }

    // Get updated like/dislike counts
    const { data: allVotes, error: countError } = await supabase
      .from('fact_project_likes')
      .select('like_type')
      .eq('project_id', id);

    if (countError) throw countError;

    const likes = allVotes?.filter(v => v.like_type === 'like').length || 0;
    const dislikes = allVotes?.filter(v => v.like_type === 'dislike').length || 0;

    return NextResponse.json({
      success: true,
      action,
      data: {
        likes,
        dislikes,
        userVote
      },
      message: `Project ${action}`,
    });
  } catch (error) {
    console.error('❌ Error handling project reaction:', error);
    return NextResponse.json(
      { error: 'Failed to handle reaction' },
      { status: 500 }
    );
  }
}
