"use client"

import { ProjectDetail } from "@/components/project-detail"
import { Header } from "@/components/header"
import { ProjectsService } from "@/services/projectsService"
import { ProjectWithDetails } from "@/models/dim-models/dim-project"
import { FactProjectImages } from "@/models/fact-models/fact-project-images"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface Project extends Omit<ProjectWithDetails, "image" | "milestones"> {
  images: FactProjectImages[]
  milestones: Array<{
    title: string
    date: Date
    completed: boolean
  }>
  personnel_list?: import("@/models/dim-models/dim-project").ProjectPersonnel[]
}

export default function ProjectPage() {
  const params = useParams()
  const projectId = params?.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return
      
      try {
        setLoading(true)
        const projectData = await ProjectsService.getProject(projectId)
        
        // Transform the project data to match the ProjectDetail component expectations
        const transformedProject: Project = {
          ...projectData,
          images: projectData.images && projectData.images.length > 0
            ? projectData.images
            : [{
                image_id: "placeholder",
                project_id: projectData.project_id || "",
                image_url: projectData.image || "/placeholder.svg",
                caption: "",
                created_at: new Date(),
                is_primary: true,
                uploaded_by: "",
                }
              ],
          milestones: projectData.milestones || [],
          personnel_list: projectData.personnel_list || []
        }
        
        setProject(transformedProject)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project')
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || "The project you're looking for doesn't exist."}
            </p>
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ProjectDetail project={project} />
      </div>
    </main>
  )
}
