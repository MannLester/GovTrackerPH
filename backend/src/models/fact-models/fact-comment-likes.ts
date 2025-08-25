export interface FactCommentLikes {
    user_id: string;
    comment_id: string;
    is_like: boolean;
    created_at: Date;
}

export const FactCommentLikesSchema = {
    user_id: String,
    comment_id: String,
    is_like: Boolean,
    created_at: Date,
}