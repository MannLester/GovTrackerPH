export interface ProjectMilestone {
    milestone_id: string;
    project_id: string;
    title: string;
    description: string;
    target_date: Date;
    completion_date?: Date;
    is_completed: boolean;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateProjectMilestoneRequest {
    project_id: string;
    title: string;
    description: string;
    target_date: Date;
}

export interface UpdateProjectMilestoneRequest {
    title?: string;
    description?: string;
    target_date?: Date;
    completion_date?: Date;
    is_completed?: boolean;
}

export interface DeleteProjectMilestoneRequest {
    milestone_id: string;
}

export interface GetProjectMilestoneRequest {
    milestone_id: string;
}

export const ProjectMilestoneSchema = {
    milestone_id: String,
    project_id: String,
    title: String,
    description: String,
    target_date: Date,
    completion_date: Date,
    is_completed: Boolean,
    created_at: Date,
    updated_at: Date
}