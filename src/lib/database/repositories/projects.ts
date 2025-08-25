import { supabase, handleSupabaseError } from '../client';
import { Project, ProjectFilters, PaginatedResponse, ProjectWithJoins, LocationResponse, StatusResponse } from '../types';

export class ProjectsRepository {
    
    // Get projects with pagination and filters
    async getProjects(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                sort = 'created_at',
                order = 'DESC'
            } = filters;

            console.log('📍 Fetching projects with filters:', filters);

            // Start with a simple query first to test the structure
            let query = supabase
                .from('dim_project')
                .select('*', { count: 'exact' });

            // Apply simple filters for now
            if (search) {
                query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }

            // Apply sorting
            query = query.order(sort, { ascending: order === 'ASC' });

            // Apply pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                throw error;
            }

            // Transform the data to match our Project interface
            const projects: Project[] = (data || []).map((item: ProjectWithJoins) => ({
                project_id: item.project_id,
                title: item.title,
                description: item.description,
                budget: item.amount,
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
                updated_at: item.updated_at
            }));

            const totalCount = count || 0;
            const totalPages = Math.ceil(totalCount / limit);

            console.log(`✅ Successfully fetched ${projects.length} projects (${totalCount} total)`);

            return {
                data: projects,
                totalCount,
                page,
                limit,
                totalPages
            };

        } catch (error) {
            console.error('❌ Error in getProjects:', error);
            const errorDetails = handleSupabaseError(error, 'getProjects');
            throw new Error(errorDetails.error);
        }
    }

    // Get a single project by ID
    async getProjectById(projectId: string): Promise<Project | null> {
        try {
            console.log(`📍 Fetching project with ID: ${projectId}`);

            const { data, error } = await supabase
                .from('dim_project')
                .select('*')
                .eq('project_id', projectId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`ℹ️ Project with ID ${projectId} not found`);
                    return null;
                }
                throw error;
            }

            if (!data) {
                return null;
            }

            // Transform the data to match our Project interface
            const project: Project = {
                project_id: data.project_id,
                title: data.title,
                description: data.description,
                budget: data.budget,
                start_date: data.start_date,
                end_date: data.end_date,
                status_id: data.status_id,
                location_id: data.location_id,
                contractor_id: data.contractor_id,
                progress_percentage: data.progress_percentage,
                expected_outcome: data.expected_outcome,
                reason: data.reason,
                created_by: data.created_by,
                created_at: data.created_at,
                updated_at: data.updated_at
            };

            console.log(`✅ Successfully fetched project: ${project.title}`);
            return project;

        } catch (error) {
            console.error(`❌ Error fetching project ${projectId}:`, error);
            const errorDetails = handleSupabaseError(error, 'getProjectById');
            throw new Error(errorDetails.error);
        }
    }

    // Get unique regions for filtering
    async getRegions(): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('dim_location')
                .select('region')
                .order('region');

            if (error) {
                throw error;
            }

            const regions = [...new Set((data || []).map((item: LocationResponse) => item.region))];
            console.log(`✅ Successfully fetched ${regions.length} unique regions`);
            return regions;

        } catch (error) {
            console.error('❌ Error fetching regions:', error);
            const errorDetails = handleSupabaseError(error, 'getRegions');
            throw new Error(errorDetails.error);
        }
    }

    // Get unique statuses for filtering
    async getStatuses(): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('dim_status')
                .select('status_name')
                .order('status_name');

            if (error) {
                throw error;
            }

            const statuses = (data || []).map((item: StatusResponse) => item.status_name);
            console.log(`✅ Successfully fetched ${statuses.length} statuses`);
            return statuses;

        } catch (error) {
            console.error('❌ Error fetching statuses:', error);
            const errorDetails = handleSupabaseError(error, 'getStatuses');
            throw new Error(errorDetails.error);
        }
    }
}

// Export a singleton instance
export const projectsRepository = new ProjectsRepository();
