export interface FactProjectLikes{
    userId: string;
    projectId: string;
    likeType: 'like' | 'dislike';
    createdAt: Date;
}