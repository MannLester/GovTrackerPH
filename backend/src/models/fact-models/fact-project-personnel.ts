export interface FactProjectPersonnel{
    project_personnel_id: string;
    project_id: string;
    user_id: string;
    role: string;
    created_at: Date;
}

export const FactProjectPersonnelSchema = {
    project_personnel_id: String,
    project_id: String,
    user_id: String,
    role: String,
    created_at: Date,
}
