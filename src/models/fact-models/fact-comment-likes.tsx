export interface FactCommentLikes {
    userId: string;
    commentId: string;
    likeType: 'like' | 'dislike';
    createdAt: Date;
}