export interface FactProjectLikes{
    like_id: string;
    user_id: string;
    project_id: string;
    like_type: 'like' | 'dislike';
    created_at: Date;
}