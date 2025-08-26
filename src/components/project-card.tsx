import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Flag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProjectWithDetails } from "@/models/dim-models/dim-project"
import { getStatusColor, getStatusText } from "@/components/status-legend"

interface ProjectCardProps {
  project: ProjectWithDetails
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Debug log for images
  console.log('[ProjectCard] Images for project', project.title, project.images);
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative">
        <Image
          src={project.images && project.images.length > 0 ? project.images[0].imageUrl : "/placeholder.svg"}
          alt={project.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        {/* Show caption overlay if available */}
        {project.images && project.images.length > 0 && project.images[0].caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
            {project.images[0].caption}
          </div>
        )}
        <Badge className={`absolute top-3 right-3 ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg leading-tight text-gray-900 font-[family-name:var(--font-space-grotesk)]">
            {project.title}
          </h3>
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          {project.location}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow flex flex-col">
        <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget:</span>
            <span className="font-semibold text-gray-900">{project.amountFormatted || `₱${project.amount.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Contractor:</span>
            <span className="text-gray-900 text-right text-xs">{project.contractor}</span>
          </div>
        </div>

        {(getStatusText(project.status).toLowerCase().includes("progress") || 
          getStatusText(project.status).toLowerCase().includes("ongoing") ||
          getStatusText(project.status).toLowerCase().includes("active")) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress:</span>
              <span className="font-semibold text-gray-900">{project.progress}%</span>
            </div>
            <Progress value={parseFloat(project.progress) || 0} className="h-2" />
          </div>
        )}

        <div className="pt-2 border-t border-border space-y-3 mt-auto">
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-green-600 hover:text-green-700"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs">{project.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-red-600 hover:text-red-700">
              <ThumbsDown className="w-4 h-4" />
              <span className="text-xs">{project.dislikes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{project.comments}</span>
            </Button>
          </div>
          <div className="flex gap-2">
            <Link href={`/project/${project.id || project.projectId}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                View Details
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300 bg-transparent"
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
