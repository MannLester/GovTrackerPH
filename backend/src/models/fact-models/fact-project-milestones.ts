export interface FactProjectMilestones{
    milestone_id: string;
    project_id: string;
    title: string;
    target_date: Date;
    completed: boolean;
    completed_at: Date;
}

export const FactProjectMilestonesSchema = {
    milestone_id: String,
    project_id: String,
    title: String,
    target_date: Date,
    completed: Boolean,
    completed_at: Date,
}