export interface FactProjectLikes{
    user_id: string;
    project_id: string;
    is_like: boolean;
    created_at: Date;
}

export const FactProjectLikesSchema = {
    user_id: String,
    project_id: String,
    is_like: Boolean,
    created_at: Date,
}