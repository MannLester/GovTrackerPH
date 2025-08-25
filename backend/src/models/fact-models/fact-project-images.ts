export interface ProjectImage {
    image_id: string;
    project_id: string;
    image_url: string;
    caption?: string;
    is_primary: boolean;
    uploaded_by: string;
    created_at?: Date;
}

// CRUD Interfaces
export interface CreateProjectImageRequest {
    project_id: string;
    image_url: string;
    caption?: string;
    is_primary?: boolean;
    uploaded_by: string;
}

export interface UpdateProjectImageRequest {
    image_url?: string;
    caption?: string;
    is_primary?: boolean;
}

export interface DeleteProjectImageRequest {
    image_id: string;
}

export interface GetProjectImageRequest {
    image_id: string;
}

export const ProjectImageSchema = {
    image_id: String,
    project_id: String,
    image_url: String,
    caption: String,
    is_primary: Boolean,
    uploaded_by: String,
    created_at: Date
}
