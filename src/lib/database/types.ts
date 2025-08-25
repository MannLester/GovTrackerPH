// Database types and interfaces for type safety

export interface Project {
    project_id: string; // UUID
    title: string; // Actual column name is 'title', not 'project_name'
    description: string;
    budget: number; // This will be mapped from the 'amount' column
    start_date: string;
    end_date: string;
    status_id: string; // UUID
    location_id: string; // UUID
    contractor_id: string; // UUID
    progress_percentage: number;
    expected_outcome: string;
    reason: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    
    // Joined data
    status_name?: string;
    region?: string;
    province?: string;
    city?: string;
    barangay?: string;
    contractor_name?: string;
    
    // Milestones
    milestones?: Array<{
        milestone_id: string;
        title: string;
        target_date: string;
        is_completed: boolean;
        completed_at?: string;
    }>;
}

// Database response types
export interface ProjectWithJoins {
    project_id: string;
    title: string;
    description: string;
    amount: number; // Database column name
    start_date: string;
    end_date: string;
    status_id: string;
    location_id: string;
    contractor_id: string;
    progress_percentage: number;
    progress: number; // New progress column in database
    expected_outcome: string;
    reason: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    dim_status?: { status_name: string };
    dim_location?: { region: string; province: string; city: string; barangay: string };
    dim_contractor?: { company_name: string };
}

export interface LocationResponse {
    region: string;
}

export interface StatusResponse {
    status_name: string;
}

// Database response types for admin queries
export interface ProjectWithStatus {
    project_id: string;
    title: string;
    description: string;
    budget: number;
    start_date: string;
    end_date: string;
    status_id: string;
    location_id: string;
    contractor_id: string;
    progress_percentage: number;
    expected_outcome: string;
    reason: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    dim_status: { status_name: string };
}

export interface ProjectFilters {
    status?: string;
    region?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Comment {
    comment_id: number;
    project_id: string; // UUID string, not number
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    
    // Joined data
    user_name?: string;
    user_avatar?: string;
}

export interface User {
    user_id: string;
    username: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    role: 'citizen' | 'admin' | 'personnel' | 'super-admin';
    is_active: boolean;
    status_id: string;
    created_at: string;
    updated_at: string;
}

export interface Status {
    status_id: number;
    status_name: string;
    description: string;
}

export interface Location {
    location_id: number;
    region: string;
    province: string;
    city: string;
    barangay: string;
}

export interface Contractor {
    contractor_id: number;
    contractor_name: string;
    contact_info: string;
    address: string;
}
