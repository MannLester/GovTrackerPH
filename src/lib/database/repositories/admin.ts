import { supabase, handleSupabaseError } from '../client';
import { Project, User, PaginatedResponse, ProjectWithStatus } from '../types';

export interface AdminStats {
    totalProjects: number;
    totalUsers: number;
    totalComments: number;
    pendingProjects: number;
    activeProjects: number;
    completedProjects: number;
}

export class AdminRepository {
    
    // Get dashboard statistics
    async getStats(): Promise<AdminStats> {
        try {
            console.log('📍 Fetching admin dashboard stats');

            // Get projects count by status
            const { data: projects, error: projectsError } = await supabase
                .from('dim_project')
                .select('status_id, dim_status!inner(status_name)', { count: 'exact' });

            if (projectsError) {
                throw projectsError;
            }

            // Get total users count
            const { count: usersCount, error: usersError } = await supabase
                .from('dim_user')
                .select('*', { count: 'exact', head: true });

            if (usersError) {
                throw usersError;
            }

            // Get total comments count
            const { count: commentsCount, error: commentsError } = await supabase
                .from('fact_comment')
                .select('*', { count: 'exact', head: true });

            if (commentsError) {
                throw commentsError;
            }

            // Process project counts by status
            const totalProjects = projects?.length || 0;
            const projectsWithStatus = projects as unknown as { dim_status?: { status_name: string } }[];
            const pendingProjects = projectsWithStatus?.filter(p => p.dim_status?.status_name === 'Pending').length || 0;
            const activeProjects = projectsWithStatus?.filter(p => p.dim_status?.status_name === 'Active').length || 0;
            const completedProjects = projectsWithStatus?.filter(p => p.dim_status?.status_name === 'Completed').length || 0;

            const stats: AdminStats = {
                totalProjects,
                totalUsers: usersCount || 0,
                totalComments: commentsCount || 0,
                pendingProjects,
                activeProjects,
                completedProjects
            };

            console.log('✅ Successfully fetched admin stats:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error in getStats:', error);
            const errorDetails = handleSupabaseError(error, 'getStats');
            throw new Error(errorDetails.error);
        }
    }

    // Get all users with pagination
    async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
        try {
            console.log(`📍 Fetching users (page ${page}, limit ${limit})`);

            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('dim_user')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                throw error;
            }

            const users: User[] = (data || []) as User[];
            const totalCount = count || 0;
            const totalPages = Math.ceil(totalCount / limit);

            console.log(`✅ Successfully fetched ${users.length} users (${totalCount} total)`);

            return {
                data: users,
                totalCount,
                page,
                limit,
                totalPages
            };

        } catch (error) {
            console.error('❌ Error in getUsers:', error);
            const errorDetails = handleSupabaseError(error, 'getUsers');
            throw new Error(errorDetails.error);
        }
    }

    // Update user role
    async updateUserRole(userId: string, role: string): Promise<User> {
        try {
            console.log(`📍 Updating user ${userId} role to ${role}`);

            const { data, error } = await supabase
                .from('dim_user')
                .update({ role })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log(`✅ Successfully updated user role: ${userId}`);
            return data as User;

        } catch (error) {
            console.error(`❌ Error updating user role ${userId}:`, error);
            const errorDetails = handleSupabaseError(error, 'updateUserRole');
            throw new Error(errorDetails.error);
        }
    }

    // Get pending projects
    async getPendingProjects(page = 1, limit = 10): Promise<PaginatedResponse<Project>> {
        try {
            console.log(`📍 Fetching pending projects (page ${page}, limit ${limit})`);

            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('dim_project')
                .select(`
                    *,
                    dim_status!inner(status_name)
                `, { count: 'exact' })
                .eq('dim_status.status_name', 'Pending')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                throw error;
            }

            // Transform the data to match our Project interface
            const projects: Project[] = (data || []).map((item: ProjectWithStatus) => ({
                project_id: item.project_id,
                title: item.title,
                description: item.description,
                budget: item.budget,
                start_date: item.start_date,
                end_date: item.end_date,
                status_id: item.status_id,
                location_id: item.location_id,
                contractor_id: item.contractor_id,
                progress_percentage: item.progress_percentage,
                expected_outcome: item.expected_outcome,
                reason: item.reason,
                created_by: item.created_by,
                created_at: item.created_at,
                updated_at: item.updated_at,
                status_name: item.dim_status?.status_name
            }));

            const totalCount = count || 0;
            const totalPages = Math.ceil(totalCount / limit);

            console.log(`✅ Successfully fetched ${projects.length} pending projects (${totalCount} total)`);

            return {
                data: projects,
                totalCount,
                page,
                limit,
                totalPages
            };

        } catch (error) {
            console.error('❌ Error in getPendingProjects:', error);
            const errorDetails = handleSupabaseError(error, 'getPendingProjects');
            throw new Error(errorDetails.error);
        }
    }
}

// Export a singleton instance
export const adminRepository = new AdminRepository();
