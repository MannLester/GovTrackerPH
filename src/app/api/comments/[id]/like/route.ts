import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/config';
import { authenticateUser } from '@/lib/auth/config';



export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = await params;
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
            .from('fact_comment_likes')
            .select('*')
            .eq('comment_id', id)
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
                    .from('fact_comment_likes')
                    .delete()
                    .eq('comment_id', id)
                    .eq('user_id', userId);

                if (deleteError) throw deleteError;
                
                action = 'removed';
                userVote = null;
            } else {
                // Different reaction → update it
                const { error: updateError } = await supabase
                    .from('fact_comment_likes')
                    .update({ 
                        like_type: likeType,
                        created_at: new Date().toISOString()
                    })
                    .eq('comment_id', id)
                    .eq('user_id', userId);

                if (updateError) throw updateError;
                
                action = 'updated';
                userVote = likeType;
            }
        } else {
            // No previous reaction → insert
            const { error: insertError } = await supabase
                .from('fact_comment_likes')
                .insert({
                    comment_id: id,
                    user_id: userId,
                    like_type: likeType
                });

            if (insertError) throw insertError;
            
            action = 'added';
            userVote = likeType;
        }

        // Get updated like/dislike counts
        const { data: likeCounts, error: countError } = await supabase
            .from('fact_comment_likes')
            .select('like_type')
            .eq('comment_id', id);

        if (countError) throw countError;

        const likes = likeCounts?.filter(l => l.like_type === 'like').length || 0;
        const dislikes = likeCounts?.filter(l => l.like_type === 'dislike').length || 0;
        
        return NextResponse.json({
            success: true,
            action,
            data: { 
                likes, 
                dislikes, 
                userVote,
                message: `Comment ${action}` 
            }
        });
    } catch (error) {
        console.error('Error toggling comment like:', error);
        return NextResponse.json(
            { error: 'Failed to toggle like' },
            { status: 500 }
        );
    }
}
