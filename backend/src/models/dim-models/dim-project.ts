export interface Project {
    project_id: string;
    title: string;
    description: string;
    budget: number;
    start_date: Date;
    end_date?: Date;
    status_id: string;
    location_id: string;
    contractor_id?: string;
    progress_percentage: number;
    expected_outcome: string;
    reason: string;
    created_by: string;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateProjectRequest {
    title: string;
    description: string;
    budget: number;
    start_date: Date;
    end_date?: Date;
    status_id: string;
    location_id: string;
    contractor_id?: string;
    progress_percentage?: number;
    expected_outcome: string;
    reason: string;
    created_by: string;
}

export interface UpdateProjectRequest {
    title?: string;
    description?: string;
    budget?: number;
    start_date?: Date;
    end_date?: Date;
    status_id?: string;
    location_id?: string;
    contractor_id?: string;
    progress_percentage?: number;
    expected_outcome?: string;
    reason?: string;
}

export interface DeleteProjectRequest {
    project_id: string;
}

export interface GetProjectRequest {
    project_id: string;
}

export const ProjectSchema = {
    project_id: String,
    title: String,
    description: String,
    budget: Number,
    start_date: Date,
    end_date: Date,
    status_id: String,
    location_id: String,
    contractor_id: String,
    progress_percentage: Number,
    expected_outcome: String,
    reason: String,
    created_by: String,
    created_at: Date,
    updated_at: Date
}