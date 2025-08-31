"use client"

import { ProjectCard } from "@/components/project-card"
import { ProjectWithDetails } from "@/models/dim-models/dim-project"
import { ProjectsService } from "@/services/projectsService"
import { useEffect, useState } from "react"

export function ProjectGrid() {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await ProjectsService.getProjects({
          limit: 12, // Get more projects for the grid
          page: 1
        })
        setProjects(response.projects)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
            Government Projects
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-40 sm:h-48 rounded-t-lg"></div>
              <div className="p-3 sm:p-4 bg-white rounded-b-lg border">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
            Government Projects
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading projects: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
          Government Projects
        </h2>
        <div className="text-sm text-muted-foreground">
          {/* Change the total to the database next */}
          Showing {projects.length} of 4 projects  
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.project_id || `project-${index}`} project={project} />
        ))}
      </div>
    </div>
  )
}
  