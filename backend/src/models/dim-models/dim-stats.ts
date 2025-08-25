export interface Stats {
    stats_id: string;
    project_id: string;
    total_likes: number;
    total_comments: number;
    total_views: number;
    last_calculated: Date;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateStatsRequest {
    project_id: string;
    total_likes?: number;
    total_comments?: number;
    total_views?: number;
}

export interface UpdateStatsRequest {
    total_likes?: number;
    total_comments?: number;
    total_views?: number;
    last_calculated?: Date;
}

export interface DeleteStatsRequest {
    stats_id: string;
}

export interface GetStatsRequest {
    stats_id: string;
}

export const StatsSchema = {
    stats_id: String,
    project_id: String,
    total_likes: Number,
    total_comments: Number,
    total_views: Number,
    last_calculated: Date,
    created_at: Date,
    updated_at: Date
}