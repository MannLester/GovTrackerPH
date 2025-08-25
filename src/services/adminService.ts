import { User } from "@/models/dim-models/dim-user"
import { Project } from "@/models/dim-models/dim-project"
import { Comment } from "@/models/dim-models/dim-comment"

export class AdminService {
  // User Management
  static async getUsers(params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<{ users: User[]; pagination: { currentPage: number; totalPages: number; totalCount: number; limit: number } }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.role) searchParams.set('role', params.role);
      if (params?.search) searchParams.set('search', params.search);

      const response = await fetch(`/api/admin/users?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], pagination: { currentPage: 1, totalPages: 0, totalCount: 0, limit: 20 } };
    }
  }

  static async updateUserStatus(userId: string, statusId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ statusId })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  static async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ role })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  // Project Management
  static async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const result = await response.json();
      return result.projects || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  static async updateProjectStatus(projectId: string, statusId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status_id: statusId })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating project status:', error);
      return false;
    }
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Comment Management
  static async getComments(): Promise<Comment[]> {
    try {
      const response = await fetch('/api/comments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const result = await response.json();
      return result.data?.comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  // Analytics
  static async getAnalytics() {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        overview: {
          totalUsers: 0,
          totalProjects: 0,
          totalComments: 0,
          totalLikes: 0
        },
        projectsByStatus: [],
        projectsByRegion: [],
        recentActivity: {
          projects: [],
          comments: []
        },
        budget: {
          total_projects: 0,
          total_budget: 0,
          average_budget: 0,
          min_budget: 0,
          max_budget: 0
        }
      };
    }
  }

  // Report Management
  static async getReportedContent() {
    try {
      // This would typically come from a reports table
      // For now, we'll simulate reported content
      return {
        reportedProjects: [],
        reportedComments: [],
        reportedUsers: []
      };
    } catch (error) {
      console.error('Error fetching reported content:', error);
      return {
        reportedProjects: [],
        reportedComments: [],
        reportedUsers: []
      };
    }
  }

  // Get pending projects
  static async getPendingProjects(): Promise<Project[]> {
    try {
      const response = await fetch('/api/admin/projects/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending projects');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching pending projects:', error);
      return [];
    }
  }
}
