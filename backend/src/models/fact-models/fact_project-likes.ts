export interface ProjectLike {
    like_id: string;
    project_id: string;
    user_id: string;
    created_at?: Date;
}

// CRUD Interfaces
export interface CreateProjectLikeRequest {
    project_id: string;
    user_id: string;
}

export interface DeleteProjectLikeRequest {
    like_id: string;
}

export interface GetProjectLikeRequest {
    like_id: string;
}

export const ProjectLikeSchema = {
    like_id: String,
    project_id: String,
    user_id: String,
    created_at: Date
}