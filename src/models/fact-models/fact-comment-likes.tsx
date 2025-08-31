export interface FactCommentLikes {
    like_id: string;
    user_id: string;
    comment_id: string;
    like_type: 'like' | 'dislike';
    created_at: Date;
}