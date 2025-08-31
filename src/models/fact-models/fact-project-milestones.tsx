import { StringToBoolean } from "class-variance-authority/types";

export interface FactProjectMilestones{
    milestone_id: string;
    project_id: string;
    title: string;
    description: string;
    target_date: Date;
    completion_date: Date;
    is_completed: boolean;
    created_at: Date;
    updated_at: Date;
}