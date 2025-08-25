import { supabase, handleSupabaseError } from '../client';

export interface Milestone {
    milestone_id: string;
    project_id: string;
    title: string;
    target_date: string;
    is_completed: boolean;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export class MilestonesRepository {
    
    // Get milestones for a specific project
    async getMilestonesByProjectId(projectId: string): Promise<Milestone[]> {
        try {
            console.log(`📍 Fetching milestones for project: ${projectId}`);

            const { data, error } = await supabase
                .from('fact_project_milestones')
                .select('*')
                .eq('project_id', projectId)
                .order('target_date', { ascending: true });

            if (error) {
                throw error;
            }

            const milestones = data || [];
            console.log(`✅ Successfully fetched ${milestones.length} milestones for project ${projectId}`);
            return milestones;

        } catch (error) {
            console.error(`❌ Error fetching milestones for project ${projectId}:`, error);
            const errorDetails = handleSupabaseError(error, 'getMilestonesByProjectId');
            throw new Error(errorDetails.error);
        }
    }

    // Get a single milestone by ID
    async getMilestoneById(milestoneId: string): Promise<Milestone | null> {
        try {
            console.log(`📍 Fetching milestone with ID: ${milestoneId}`);

            const { data, error } = await supabase
                .from('fact_project_milestones')
                .select('*')
                .eq('milestone_id', milestoneId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`ℹ️ Milestone with ID ${milestoneId} not found`);
                    return null;
                }
                throw error;
            }

            console.log(`✅ Successfully fetched milestone: ${data?.title}`);
            return data;

        } catch (error) {
            console.error(`❌ Error fetching milestone ${milestoneId}:`, error);
            const errorDetails = handleSupabaseError(error, 'getMilestoneById');
            throw new Error(errorDetails.error);
        }
    }

    // Create a new milestone
    async createMilestone(milestone: Omit<Milestone, 'milestone_id' | 'created_at' | 'updated_at'>): Promise<Milestone> {
        try {
            console.log(`📍 Creating new milestone: ${milestone.title}`);

            const { data, error } = await supabase
                .from('fact_project_milestones')
                .insert(milestone)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully created milestone: ${data.title}`);
            return data;

        } catch (error) {
            console.error('❌ Error creating milestone:', error);
            const errorDetails = handleSupabaseError(error, 'createMilestone');
            throw new Error(errorDetails.error);
        }
    }

    // Update a milestone
    async updateMilestone(milestoneId: string, updates: Partial<Omit<Milestone, 'milestone_id' | 'created_at' | 'updated_at'>>): Promise<Milestone> {
        try {
            console.log(`📍 Updating milestone: ${milestoneId}`);

            const { data, error } = await supabase
                .from('fact_project_milestones')
                .update(updates)
                .eq('milestone_id', milestoneId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully updated milestone: ${data.title}`);
            return data;

        } catch (error) {
            console.error(`❌ Error updating milestone ${milestoneId}:`, error);
            const errorDetails = handleSupabaseError(error, 'updateMilestone');
            throw new Error(errorDetails.error);
        }
    }

    // Delete a milestone
    async deleteMilestone(milestoneId: string): Promise<void> {
        try {
            console.log(`📍 Deleting milestone: ${milestoneId}`);

            const { error } = await supabase
                .from('fact_project_milestones')
                .delete()
                .eq('milestone_id', milestoneId);

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully deleted milestone: ${milestoneId}`);

        } catch (error) {
            console.error(`❌ Error deleting milestone ${milestoneId}:`, error);
            const errorDetails = handleSupabaseError(error, 'deleteMilestone');
            throw new Error(errorDetails.error);
        }
    }
}

// Export a singleton instance
export const milestonesRepository = new MilestonesRepository();
