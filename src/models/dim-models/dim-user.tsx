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
    created_at: string;
    updated_at: string;
}
