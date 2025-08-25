export interface ProjectPersonnel {
    personnel_id: string;
    project_id: string;
    user_id: string;
    role: 'project_manager' | 'engineer' | 'supervisor' | 'worker';
    assigned_date: Date;
    end_date?: Date;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateProjectPersonnelRequest {
    project_id: string;
    user_id: string;
    role: 'project_manager' | 'engineer' | 'supervisor' | 'worker';
    assigned_date: Date;
    end_date?: Date;
}

export interface UpdateProjectPersonnelRequest {
    role?: 'project_manager' | 'engineer' | 'supervisor' | 'worker';
    assigned_date?: Date;
    end_date?: Date;
    is_active?: boolean;
}

export interface DeleteProjectPersonnelRequest {
    personnel_id: string;
}

export interface GetProjectPersonnelRequest {
    personnel_id: string;
}

export const ProjectPersonnelSchema = {
    personnel_id: String,
    project_id: String,
    user_id: String,
    role: String,
    assigned_date: Date,
    end_date: Date,
    is_active: Boolean,
    created_at: Date,
    updated_at: Date
}
