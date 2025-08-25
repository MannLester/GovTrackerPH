export interface CommentLike {
    like_id: string;
    comment_id: string;
    user_id: string;
    created_at?: Date;
}

// CRUD Interfaces
export interface CreateCommentLikeRequest {
    comment_id: string;
    user_id: string;
}

export interface DeleteCommentLikeRequest {
    like_id: string;
}

export interface GetCommentLikeRequest {
    like_id: string;
}

export const CommentLikeSchema = {
    like_id: String,
    comment_id: String,
    user_id: String,
    created_at: Date
}