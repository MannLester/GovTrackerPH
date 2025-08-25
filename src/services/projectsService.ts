import { ProjectWithDetails } from '@/models/dim-models/dim-project';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ProjectsResponse {
  projects: ProjectWithDetails[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProjectsFilters {
  page?: number;
  limit?: number;
  status?: string;
  region?: string;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

interface ApiProjectResponse {
  project_id: string;
  title: string;
  description: string;
  budget?: number; // This comes from the API (mapped from amount)
  status_id: string;
  contractor_id: string;
  location_id: string;
  progress?: string;
  expected_outcome?: string;
  expectedOurcome?: string;
  personnel?: string;
  reason?: string;
  start_date: string;
  expected_completion_date: string;
  created_at: string;
  status_name?: string;
  contractor_name?: string;
  location_name?: string;
  city?: string;
  region?: string;
  likes?: number;
  dislikes?: number;
  comments?: number;
  primary_image?: string;
  images?: string[];
  milestones?: Array<{
    title: string;
    date: string;
    completed: boolean;
  }>;
}

interface ApiProjectsResponse {
  projects: ApiProjectResponse[];
  total: number;
  page: number;
  totalPages: number;
}

interface ApiSingleProjectResponse {
  project: ApiProjectResponse;
}

export class ProjectsService {
  private static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getProjects(filters: ProjectsFilters = {}): Promise<ProjectsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/projects${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<ApiProjectsResponse>(url);
    
    // Transform the response to match our frontend interface
    const transformedProjects: ProjectWithDetails[] = response.projects.map((project: ApiProjectResponse) => ({
      id: project.project_id,
      projectId: project.project_id,
      title: project.title,
      description: project.description,
      amount: project.budget || 0,
      amountFormatted: `₱${(project.budget || 0).toLocaleString()}`,
      statusId: project.status_id,
      contractorId: project.contractor_id,
      locationId: project.location_id,
      status: project.status_name || project.status_id,
      contractor: project.contractor_name || project.contractor_id,
      location: project.location_name || `${project.city}, ${project.region}` || project.location_id,
      progress: project.progress || "0",
      progressNumber: parseFloat(project.progress || "0"),
      expectedOutcome: project.expected_outcome || project.expectedOurcome || "",
      expectedOurcome: project.expected_outcome || "",
      personnel: project.personnel || "",
      reason: project.reason || "",
      startDate: new Date(project.start_date),
      expectedCompletionDate: new Date(project.expected_completion_date),
      createdAt: new Date(project.created_at),
      likes: project.likes || 0,
      dislikes: project.dislikes || 0,
      comments: project.comments || 0,
      image: project.primary_image,
      images: project.images || [],
      milestones: project.milestones?.map(m => ({
        title: m.title,
        date: new Date(m.date),
        completed: m.completed
      })) || [],
    }));

    return {
      projects: transformedProjects,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  }

  static async getProject(id: string): Promise<ProjectWithDetails> {
    const response = await this.request<ApiSingleProjectResponse>(`/projects/${id}`);
    
    // Transform single project response
    const project = response.project;
    return {
      id: project.project_id,
      projectId: project.project_id,
      title: project.title,
      description: project.description,
      amount: project.budget || 0,
      amountFormatted: `₱${(project.budget || 0).toLocaleString()}`,
      statusId: project.status_id,
      contractorId: project.contractor_id,
      locationId: project.location_id,
      status: project.status_name || project.status_id,
      contractor: project.contractor_name || project.contractor_id,
      location: project.location_name || `${project.city}, ${project.region}` || project.location_id,
      progress: project.progress || "0",
      progressNumber: parseFloat(project.progress || "0"),
      expectedOutcome: project.expected_outcome || project.expectedOurcome || "",
      expectedOurcome: project.expected_outcome || "",
      personnel: project.personnel || "",
      reason: project.reason || "",
      startDate: new Date(project.start_date),
      expectedCompletionDate: new Date(project.expected_completion_date),
      createdAt: new Date(project.created_at),
      likes: project.likes || 0,
      dislikes: project.dislikes || 0,
      comments: project.comments || 0,
      image: project.primary_image,
      images: project.images || [],
      milestones: project.milestones?.map(m => ({
        title: m.title,
        date: new Date(m.date),
        completed: m.completed
      })) || [],
    };
  }

  static async likeProject(id: string): Promise<void> {
    await this.request(`/projects/${id}/like`, {
      method: 'POST',
    });
  }

  static async unlikeProject(id: string): Promise<void> {
    await this.request(`/projects/${id}/like`, {
      method: 'POST',
    });
  }
}
