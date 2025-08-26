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

// Database response type for comments with user info
interface CommentWithUserResponse {
    comment_id: string;
    project_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    parent_comment_id: string | null;
    is_deleted: boolean;
    // User info from join
    username: string;
    profile_picture: string | null;
    like_count: number;
    // Nested user data structure
    dim_user?: {
        username: string;
        first_name: string;
        last_name: string;
        profile_picture: string | null;
    } | null;
}

// Raw database response type that can handle both array and single object for dim_user
interface SupabaseCommentResponse {
    comment_id: string;
    project_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    parent_comment_id: string | null;
    is_deleted: boolean;
    dim_user?: {
        username: string;
        first_name: string;
        last_name: string;
        profile_picture: string | null;
    } | {
        username: string;
        first_name: string;
        last_name: string;
        profile_picture: string | null;
    }[] | null;
}

// Raw database response type
interface RawCommentResponse {
    comment_id: string;
    project_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    parent_comment_id: string | null;
    is_deleted: boolean;
    dim_user: {
        username: string;
        first_name: string;
        last_name: string;
        profile_picture: string | null;
    }[];
}

export class CommentsRepository {
    
    // Get comments with user information and pagination
    async getComments(filters: CommentFilters = {}): Promise<PaginatedResponse<CommentWithUserResponse>> {
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

            // Calculate pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            // Build query with joins for user information
            console.log('🔍 Building Supabase query...');
            let query = supabase
                .from('dim_comment')
                .select(`
                    comment_id,
                    project_id,
                    user_id,
                    content,
                    created_at,
                    updated_at,
                    parent_comment_id,
                    is_deleted,
                    dim_user (
                        username,
                        first_name,
                        last_name,
                        profile_picture
                    )
                `, { count: 'exact' })
                .eq('is_deleted', false);
            
            console.log('🔍 Query built, applying filters...');

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
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                console.error('❌ Supabase query error:', error);
                throw error;
            }

            console.log('🔍 Raw Supabase response data:', JSON.stringify(data, null, 2));
            console.log('📊 Number of records returned:', data?.length || 0);

            // Transform the data to include user info
            const comments: CommentWithUserResponse[] = (data || []).map((item: SupabaseCommentResponse) => {
                console.log('📋 Raw comment data from Supabase:', JSON.stringify(item, null, 2));
                
                // Handle both array and single object responses for dim_user
                let user = null;
                if (item.dim_user) {
                    if (Array.isArray(item.dim_user)) {
                        user = item.dim_user[0]; // Get first user from array
                    } else {
                        user = item.dim_user; // Single user object
                    }
                }
                
                console.log('👤 Extracted user data:', JSON.stringify(user, null, 2));
                console.log('🔑 User ID from comment:', item.user_id);
                
                return {
                    comment_id: item.comment_id,
                    project_id: item.project_id,
                    user_id: item.user_id,
                    content: item.content,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    parent_comment_id: item.parent_comment_id,
                    is_deleted: item.is_deleted,
                    // Keep flattened fields for backward compatibility
                    username: user ? user.username || `${user.first_name} ${user.last_name}` : 'Unknown User',
                    profile_picture: user ? user.profile_picture : null,
                    like_count: 0, // TODO: Add likes count logic
                    // Add nested user data structure
                    dim_user: user ? {
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        profile_picture: user.profile_picture
                    } : null
                };
            });

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
    async createComment(projectId: string, userId: string, content: string, parentCommentId?: string): Promise<CommentWithUserResponse> {
        try {
            console.log(`📍 Creating comment for project ${projectId} by user ${userId}`);

            // Insert the comment
            const { data, error } = await supabase
                .from('dim_comment')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    content: content,
                    parent_comment_id: parentCommentId || null,
                    is_deleted: false
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            // Get the comment with user info
            const { data: commentWithUser, error: joinError } = await supabase
                .from('dim_comment')
                .select(`
                    comment_id,
                    project_id,
                    user_id,
                    content,
                    created_at,
                    updated_at,
                    parent_comment_id,
                    is_deleted,
                    dim_user!inner (
                        first_name,
                        last_name,
                        profile_picture
                    )
                `)
                .eq('comment_id', data.comment_id)
                .eq('is_deleted', false)
                .single();

            if (joinError) {
                throw joinError;
            }

            // Transform to expected format
            const rawComment = commentWithUser as RawCommentResponse;
            const user = rawComment.dim_user[0];
            const result: CommentWithUserResponse = {
                comment_id: rawComment.comment_id,
                project_id: rawComment.project_id,
                user_id: rawComment.user_id,
                content: rawComment.content,
                created_at: rawComment.created_at,
                updated_at: rawComment.updated_at,
                parent_comment_id: rawComment.parent_comment_id,
                is_deleted: rawComment.is_deleted,
                username: user ? `${user.first_name} ${user.last_name}` : 'Unknown User',
                profile_picture: user ? user.profile_picture : null,
                like_count: 0
            };

            console.log(`✅ Successfully created comment: ${result.comment_id}`);
            return result;

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
