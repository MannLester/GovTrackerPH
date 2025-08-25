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
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    role?: 'citizen' | 'admin' | 'personnel' | 'super-admin';
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    role?: 'citizen' | 'admin' | 'personnel' | 'super-admin';
    is_active?: boolean;
}

export interface DeleteUserRequest {
    user_id: string;
}

export interface GetUserRequest {
    user_id: string;
}

export const UserSchema = {
    user_id: String,
    username: String,
    email: String,
    password_hash: String,
    first_name: String,
    last_name: String,
    profile_picture: String,
    role: String,
    is_active: Boolean,
    status_id: String,
    created_at: Date,
    updated_at: Date
}