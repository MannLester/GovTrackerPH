export interface User {
    user_id: string;
    username: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
    role: "citizen" | "admin" | "personnel" | "super-admin";
    is_active: boolean;
    status_id: string;
    status_name?: string; // Optional for when joined with dim_status
    created_at: string;
    updated_at: string;
    dim_status?: {
        status_name: string;
    };
}
