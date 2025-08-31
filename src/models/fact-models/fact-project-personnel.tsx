export interface FactProjectPersonnel{
    personnel_id: string;
    project_id: string;
    user_id: string;
    role: string;
    assigned_date: Date;
    end_date: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}