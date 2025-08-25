export interface User{
    user_id: string;
    display_name: string;
    email: string;
    profile_pic: string;
    user_role: "citizen" | "admin" | "personnel" | "super-admin";
    created_at: Date;
    status_id: string;
}

export const UserSchema = {
    user_id: String,
    display_name: String,
    email: String,
    profile_pic: String,
    user_role: String,
    created_at: Date,
    status_id: String,
}