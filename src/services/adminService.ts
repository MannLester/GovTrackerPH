import { User } from "@/models/dim-models/dim-user"
import { Project } from "@/models/dim-models/dim-project"
import { Comment } from "@/models/dim-models/dim-comment"
import { supabase } from "@/services/supabaseClient"

export class AdminService {
  // User Management
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  static async updateUserStatus(userId: string, statusId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ statusId })
        .eq('userId', userId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user status:', error)
      return false
    }
  }

  static async updateUserRole(userId: string, userRole: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ userRole })
        .eq('userId', userId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user role:', error)
      return false
    }
  }

  // Project Management
  static async getProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  }

  static async updateProjectStatus(projectId: string, statusId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ statusId })
        .eq('projectId', projectId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating project status:', error)
      return false
    }
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('projectId', projectId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    }
  }

  // Comment Management
  static async getComments(): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('commentId', commentId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  // Analytics
  static async getAnalytics() {
    try {
      const [usersResult, projectsResult, commentsResult] = await Promise.all([
        supabase.from('users').select('userId, userRole, statusId, createdAt'),
        supabase.from('projects').select('projectId, statusId, amount, createdAt'),
        supabase.from('comments').select('commentId, createdAt')
      ])

      const users = usersResult.data || []
      const projects = projectsResult.data || []
      const comments = commentsResult.data || []

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.statusId === 'active').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.statusId === 'ongoing').length,
        totalComments: comments.length,
        totalBudget: projects.reduce((sum, p) => sum + (p.amount || 0), 0),
        newUsersThisMonth: users.filter(u => 
          new Date(u.createdAt).getMonth() === new Date().getMonth()
        ).length,
        newProjectsThisMonth: projects.filter(p => 
          new Date(p.createdAt).getMonth() === new Date().getMonth()
        ).length
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        activeProjects: 0,
        totalComments: 0,
        totalBudget: 0,
        newUsersThisMonth: 0,
        newProjectsThisMonth: 0
      }
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
      }
    } catch (error) {
      console.error('Error fetching reported content:', error)
      return {
        reportedProjects: [],
        reportedComments: [],
        reportedUsers: []
      }
    }
  }
}
