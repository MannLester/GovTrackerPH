import { supabase, handleSupabaseError } from '../client';
import { Comment, PaginatedResponse } from '../types';

export interface CommentFilters {
    project_id?: string;
    user_id?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
}

// Database response type for comments
interface CommentResponse {
    comment_id: number;
    project_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export class CommentsRepository {
    
    // Get comments with pagination and filters
    async getComments(filters: CommentFilters = {}): Promise<PaginatedResponse<Comment>> {
        try {
            const {
                project_id,
                user_id,
                page = 1,
                limit = 10,
                sort = 'created_at',
                order = 'DESC'
            } = filters;

            console.log('📍 Fetching comments with filters:', filters);

            // Start building the query
            let query = supabase
                .from('fact_comment')
                .select('*', { count: 'exact' });

            // Apply filters
            if (project_id) {
                query = query.eq('project_id', project_id);
            }

            if (user_id) {
                query = query.eq('user_id', user_id);
            }

            // Apply sorting
            query = query.order(sort, { ascending: order === 'ASC' });

            // Apply pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                throw error;
            }

            const comments: Comment[] = (data || []).map((item: CommentResponse) => ({
                comment_id: item.comment_id,
                project_id: item.project_id,
                user_id: item.user_id,
                content: item.content,
                created_at: item.created_at,
                updated_at: item.updated_at
            }));

            const totalCount = count || 0;
            const totalPages = Math.ceil(totalCount / limit);

            console.log(`✅ Successfully fetched ${comments.length} comments (${totalCount} total)`);

            return {
                data: comments,
                totalCount,
                page,
                limit,
                totalPages
            };

        } catch (error) {
            console.error('❌ Error in getComments:', error);
            const errorDetails = handleSupabaseError(error, 'getComments');
            throw new Error(errorDetails.error);
        }
    }

    // Get a single comment by ID
    async getCommentById(commentId: number): Promise<Comment | null> {
        try {
            console.log(`📍 Fetching comment with ID: ${commentId}`);

            const { data, error } = await supabase
                .from('fact_comment')
                .select('*')
                .eq('comment_id', commentId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`ℹ️ Comment with ID ${commentId} not found`);
                    return null;
                }
                throw error;
            }

            if (!data) {
                return null;
            }

            const comment: Comment = {
                comment_id: data.comment_id,
                project_id: data.project_id,
                user_id: data.user_id,
                content: data.content,
                created_at: data.created_at,
                updated_at: data.updated_at
            };

            console.log(`✅ Successfully fetched comment: ${comment.comment_id}`);
            return comment;

        } catch (error) {
            console.error(`❌ Error fetching comment ${commentId}:`, error);
            const errorDetails = handleSupabaseError(error, 'getCommentById');
            throw new Error(errorDetails.error);
        }
    }

    // Create a new comment
    async createComment(projectId: string, userId: string, content: string): Promise<Comment> {
        try {
            console.log(`📍 Creating comment for project ${projectId} by user ${userId}`);

            const { data, error } = await supabase
                .from('fact_comment')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    content: content
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully created comment: ${data.comment_id}`);
            return data as Comment;

        } catch (error) {
            console.error('❌ Error creating comment:', error);
            const errorDetails = handleSupabaseError(error, 'createComment');
            throw new Error(errorDetails.error);
        }
    }

    // Update a comment
    async updateComment(commentId: number, content: string): Promise<Comment> {
        try {
            console.log(`📍 Updating comment ${commentId}`);

            const { data, error } = await supabase
                .from('fact_comment')
                .update({ content })
                .eq('comment_id', commentId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully updated comment: ${commentId}`);
            return data as Comment;

        } catch (error) {
            console.error(`❌ Error updating comment ${commentId}:`, error);
            const errorDetails = handleSupabaseError(error, 'updateComment');
            throw new Error(errorDetails.error);
        }
    }

    // Delete a comment
    async deleteComment(commentId: number): Promise<void> {
        try {
            console.log(`📍 Deleting comment ${commentId}`);

            const { error } = await supabase
                .from('fact_comment')
                .delete()
                .eq('comment_id', commentId);

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully deleted comment: ${commentId}`);

        } catch (error) {
            console.error(`❌ Error deleting comment ${commentId}:`, error);
            const errorDetails = handleSupabaseError(error, 'deleteComment');
            throw new Error(errorDetails.error);
        }
    }

    // Like/Unlike a comment
    async toggleCommentLike(commentId: number, userId: string): Promise<{ liked: boolean }> {
        try {
            console.log(`📍 Toggling like for comment ${commentId} by user ${userId}`);

            // Check if already liked
            const { data: existingLike, error: checkError } = await supabase
                .from('fact_comment_likes')
                .select('*')
                .eq('comment_id', commentId)
                .eq('user_id', userId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingLike) {
                // Unlike - remove the like
                const { error: deleteError } = await supabase
                    .from('fact_comment_likes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('user_id', userId);

                if (deleteError) {
                    throw deleteError;
                }

                console.log(`✅ Successfully unliked comment: ${commentId}`);
                return { liked: false };
            } else {
                // Like - add the like
                const { error: insertError } = await supabase
                    .from('fact_comment_likes')
                    .insert({
                        comment_id: commentId,
                        user_id: userId
                    });

                if (insertError) {
                    throw insertError;
                }

                console.log(`✅ Successfully liked comment: ${commentId}`);
                return { liked: true };
            }

        } catch (error) {
            console.error(`❌ Error toggling comment like ${commentId}:`, error);
            const errorDetails = handleSupabaseError(error, 'toggleCommentLike');
            throw new Error(errorDetails.error);
        }
    }
}

// Export a singleton instance
export const commentsRepository = new CommentsRepository();
