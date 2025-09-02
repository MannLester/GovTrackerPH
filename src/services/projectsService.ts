// Type for possible snake_case image object from backend
type SnakeCaseImage = {
  image_id?: string;
  project_id?: string;
  image_url?: string;
  caption?: string;
  uploaded_at?: string;
  is_primary?: boolean;
  uploaded_by?: string;
  created_at?: string | Date;
};
import { ProjectWithDetails, ProjectPersonnel } from '@/models/dim-models/dim-project';
import { FactProjectImages } from '@/models/fact-models/fact-project-images';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Utility function to safely parse dates
const safeDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
};

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
  progress_percentage?: number; // This comes from the API (mapped from database progress)
  expected_outcome?: string;
  expectedOurcome?: string;
  personnel?: string;
  reason?: string;
  start_date: string;
  end_date: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
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
    milestone_id: string;
    title: string;
    target_date: string;
    is_completed: boolean;
    completed_at?: string;
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
    const transformedProjects: ProjectWithDetails[] = response.projects.map((project: ApiProjectResponse) => {
      // Transform images: handle string, array of strings, or array of objects
      let images: FactProjectImages[] = [];
      if (typeof project.images === 'string' && project.images) {
        images = (project.images as string)
          ? (project.images as string).split(',').map((url: string, idx: number): FactProjectImages => ({
              image_id: `${project.project_id}_${idx}`,
              project_id: project.project_id,
              image_url: url.trim(),
              caption: '',
              is_primary: true,
              uploaded_by: '',
              created_at: new Date(),
            }))
          : [];
      } else if (Array.isArray(project.images)) {
        images = project.images.map((img: string | SnakeCaseImage, idx: number): FactProjectImages => {
          if (typeof img === 'string') {
            return {
              image_id: `${project.project_id}_${idx}`,
              project_id: project.project_id,
              image_url: img,
              caption: '',
              is_primary: true,
              uploaded_by: '',
              created_at: new Date()
            };
          } else {
            return {
              image_id: img.image_id || `${project.project_id}_${idx}`,
              project_id: img.project_id ||  project.project_id,
              image_url: img.image_url || '',
              caption: img.caption || '',
              is_primary: typeof img.is_primary === 'boolean' ? img.is_primary : true,
              uploaded_by: img.uploaded_by || '',
              created_at: img.created_at ? new Date(img.created_at) : (img.uploaded_at ? new Date(img.uploaded_at) : (img.uploaded_at ? new Date(img.uploaded_at) : new Date()))
            };
          }
        });
      }
      return {
        id: project.project_id,
        project_id: project.project_id,
        title: project.title,
        description: project.description,
        amount: project.budget || 0,
        amount_formatted: `₱${(project.budget || 0).toLocaleString()}`,
        status_id: project.status_id,
        contractor_id: project.contractor_id,
        location_id: project.location_id,
        status: project.status_name || project.status_id,
        contractor: project.contractor_name || project.contractor_id,
        location: project.location_name || `${project.city}, ${project.region}` || project.location_id,
        progress: project.progress_percentage || 0,
        progress_number: project.progress_percentage || 0,
        expected_outcome: project.expected_outcome || "",
        personnel: project.personnel || "",
        personnel_list: (project as any).personnel_list || [],
        reason: project.reason || "",
        start_date: safeDate(project.start_date),
        end_date: safeDate(project.end_date),
        created_at: safeDate(project.created_at),
        updated_at: safeDate(project.updated_at) || new Date(), // ✅ added
        created_by: project.created_by || "", // ✅ added
        likes: project.likes || 0,
        dislikes: project.dislikes || 0,
        comments: project.comments || 0,
        image: project.primary_image,
        images,
        milestones: project.milestones?.map(m => ({
          title: m.title,
          date: safeDate(m.target_date),
          completed: m.is_completed
        })) || [],
      };
    });

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
    // Transform images: handle string, array of strings, or array of objects
    let images: FactProjectImages[] = [];
    if (typeof project.images === 'string' && project.images) {
      images = (project.images as string)
        ? (project.images as string).split(',').map((url: string, idx: number): FactProjectImages => ({
            image_id: `${project.project_id}_${idx}`,
            project_id: project.project_id,
            image_url: url.trim(),
            caption: '',
            is_primary: true,
            uploaded_by: '',
            created_at: new Date()
          }))
        : [];
    } else if (Array.isArray(project.images)) {
      images = project.images.map((img: string | SnakeCaseImage, idx: number): FactProjectImages => {
        if (typeof img === 'string') {
          return {
            image_id: `${project.project_id}_${idx}`,
            project_id: project.project_id,
            image_url: img,
            caption: '',
            is_primary: true,
            uploaded_by: '',
            created_at: new Date()
          };
        } else {
          return {
            image_id: img.image_id || `${project.project_id}_${idx}`,
            project_id: img.project_id || project.project_id,
            image_url: img.image_url || '',
            caption: img.caption || '',
            is_primary: typeof img.is_primary === 'boolean' ? img.is_primary : true,
            uploaded_by: img.uploaded_by || '',
            created_at: img.created_at ? new Date(img.created_at) : (img.uploaded_at ? new Date(img.uploaded_at) : (img.uploaded_at ? new Date(img.uploaded_at) : new Date()))
          };
        }
      });
    }
    return {
      project_id: project.project_id,
      title: project.title,
      description: project.description,
      amount: project.budget || 0,
      amount_formatted: `₱${(project.budget || 0).toLocaleString()}`,
      status_id: project.status_id,
      contractor_id: project.contractor_id,
      location_id: project.location_id,
      status: project.status_name || project.status_id,
      contractor: project.contractor_name || project.contractor_id,
      location: project.location_name || `${project.city}, ${project.region}` || project.location_id,
      progress: (project.progress_percentage || 0),
      progress_number: project.progress_percentage || 0,
      expected_outcome: project.expected_outcome || "",
      personnel: project.personnel || "",
      personnel_list: (project as any).personnel_list || [],
      reason: project.reason || "",
      start_date: safeDate(project.start_date),
      end_date: safeDate(project.end_date),
      created_at: safeDate(project.created_at),
      likes: project.likes || 0,
      dislikes: project.dislikes || 0,
      comments: project.comments || 0,
      created_by: project.created_by || "",
      updated_at: safeDate(project.updated_at),
      image: project.primary_image,
      images,
      milestones: project.milestones?.map(m => ({
        title: m.title,
        date: safeDate(m.target_date),
        completed: m.is_completed
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
