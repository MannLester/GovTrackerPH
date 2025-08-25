export interface Status {
    status_id: string;
    status_name: string;
    description: string;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateStatusRequest {
    status_name: string;
    description: string;
}

export interface UpdateStatusRequest {
    status_name?: string;
    description?: string;
}

export interface DeleteStatusRequest {
    status_id: string;
}

export interface GetStatusRequest {
    status_id: string;
}

export const StatusSchema = {
    status_id: String,
    status_name: String,
    description: String,
    created_at: Date,
    updated_at: Date
}