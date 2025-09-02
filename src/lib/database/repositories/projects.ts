import { supabase, handleSupabaseError } from '../client';
import { Project, ProjectFilters, PaginatedResponse, ProjectWithJoins, LocationResponse, StatusResponse } from '../types';
import { milestonesRepository, Milestone } from './milestones';

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

            // Start with a query that joins with status table to get status names
            let query = supabase
                .from('dim_project')
                .select(`
                    *,
                    dim_status:status_id (
                        status_name
                    ),
                    dim_contractor:contractor_id (
                        company_name
                    ),
                    dim_location:location_id (
                        region,
                        province,
                        city,
                        barangay
                    )
                `, { count: 'exact' });

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


            // Fetch images for all projects in parallel
            const { factProjectImagesRepository } = await import('./fact-project-images');
            const projects: (Project & { images: import("@/models/fact-models/fact-project-images").FactProjectImages[] })[] = await Promise.all(
                (data || []).map(async (item: ProjectWithJoins) => {
                    const images = await factProjectImagesRepository.getImagesByProjectId(item.project_id);
                    return {
                        project_id: item.project_id,
                        title: item.title,
                        description: item.description,
                        budget: item.amount,
                        start_date: item.start_date,
                        end_date: item.end_date,
                        status_id: item.status_id,
                        location_id: item.location_id,
                        contractor_id: item.contractor_id,
                        progress_percentage: item.progress,
                        expected_outcome: item.expected_outcome,
                        reason: item.reason,
                        created_by: item.created_by,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        // Extract status name from joined data
                        status_name: item.dim_status?.status_name,
                        // Extract contractor name from joined data
                        contractor_name: item.dim_contractor?.company_name,
                        // Extract location data from joined data
                        region: item.dim_location?.region,
                        province: item.dim_location?.province,
                        city: item.dim_location?.city,
                        barangay: item.dim_location?.barangay,
                        // Attach images
                        images
                    };
                })
            );

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
    async getProjectById(project_id: string): Promise<Project | null> {
        try {
            console.log(`📍 Fetching project with ID: ${project_id}`);

            const { data, error } = await supabase
                .from('dim_project')
                .select(`
                    *,
                    dim_status:status_id (
                            status_name
                        ),
                    dim_contractor:contractor_id (
                        company_name
                    ),
                    dim_location:location_id (
                        region,
                        province,
                        city,
                        barangay
                    )
                `)
                .eq('project_id', project_id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`ℹ️ Project with ID ${project_id} not found`);
                    return null;
                }
                throw error;
            }

            if (!data) {
                return null;
            }

            // Fetch milestones for this project
            const milestones = await milestonesRepository.getMilestonesByProjectId(project_id);

            // Fetch images for this project
            const { factProjectImagesRepository } = await import('./fact-project-images');
            const images = await factProjectImagesRepository.getImagesByProjectId(project_id);

            // Fetch personnel for this project
            const { data: personnelData, error: personnelError } = await supabase
                .from('fact_project_personnel')
                .select(`
                    personnel_id,
                    user_id,
                    users:user_id (
                        username
                    )
                `)
                .eq('project_id', project_id);

            if (personnelError) {
                console.warn(`⚠️ Error fetching personnel for project ${project_id}:`, personnelError);
            }

            const personnel = (personnelData || []).map((p: any) => ({
                personnel_id: p.personnel_id,
                user_id: p.user_id,
                username: p.users?.username || `User ${p.user_id}`
            }));

            // Transform the data to match our Project interface
            const project: Project & { 
                images: import("@/models/fact-models/fact-project-images").FactProjectImages[];
                personnel_list?: import("@/models/dim-models/dim-project").ProjectPersonnel[];
            } = {
                project_id: data.project_id,
                title: data.title,
                description: data.description,
                budget: data.amount,
                start_date: data.start_date,
                end_date: data.end_date,
                status_id: data.status_id,
                location_id: data.location_id,
                contractor_id: data.contractor_id,
                progress_percentage: data.progress,
                expected_outcome: data.expected_outcome,
                reason: data.reason,
                created_by: data.created_by,
                created_at: data.created_at,
                updated_at: data.updated_at,
                // Extract status name
                status_name: data.dim_status?.status_name,
                // Extract contractor name
                contractor_name: data.dim_contractor?.company_name,
                // Extract location data
                region: data.dim_location?.region,
                province: data.dim_location?.province,
                city: data.dim_location?.city,
                barangay: data.dim_location?.barangay,
                // Include milestones
                milestones: milestones.map(m => ({
                    milestone_id: m.milestone_id,
                    title: m.title,
                    target_date: m.target_date,
                    is_completed: m.is_completed,
                    completed_at: m.completed_at
                })),
                // Attach images
                images,
                // Attach personnel
                personnel_list: personnel
            };

            console.log(`✅ Successfully fetched project: ${project.title} with ${milestones.length} milestones`);
            return project;

        } catch (error) {
            console.error(`❌ Error fetching project ${project_id}:`, error);
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
