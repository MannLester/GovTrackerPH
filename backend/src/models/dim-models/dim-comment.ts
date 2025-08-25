export interface Comment {
    comment_id: string;
    user_id: string;
    project_id: string;
    content: string;
    parent_comment_id?: string;
    is_deleted: boolean;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateCommentRequest {
    user_id: string;
    project_id: string;
    content: string;
    parent_comment_id?: string;
}

export interface UpdateCommentRequest {
    content?: string;
}

export interface DeleteCommentRequest {
    comment_id: string;
}

export interface GetCommentRequest {
    comment_id: string;
}

export const CommentSchema = {
    comment_id: String,
    user_id: String,
    project_id: String,
    content: String,
    parent_comment_id: String,
    is_deleted: Boolean,
    created_at: Date,
    updated_at: Date
}