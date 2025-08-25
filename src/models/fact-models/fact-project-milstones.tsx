export interface FactProjectMilestones{
    milestoneId: string;
    projectId: string;
    title: string;
    targetDate: Date;
    completed: boolean;
    completedAt: Date;
}