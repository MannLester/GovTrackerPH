import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Flag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { AuthService } from "@/lib/auth/supabase-auth"
import { ProjectWithDetails } from "@/models/dim-models/dim-project"
import { getStatusColor, getStatusText } from "@/components/status-legend"

interface ProjectCardProps {
  project: ProjectWithDetails
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null)
  const [currentLikes, setCurrentLikes] = useState<number>(project.likes)
  const [currentDislikes, setCurrentDislikes] = useState<number>(project.dislikes)
  const [isVoting, setIsVoting] = useState(false)
  
  const { user, signInWithGoogle } = useAuth()

  // Debug log for images
  console.log('[ProjectCard] Images for project', project.title, project.images);

  // Fetch current vote status and latest counts on component mount
  useEffect(() => {
    const fetchCurrentVoteStatus = async () => {
      if (!user) return;

      try {
        const token = await AuthService.getIdToken()
        if (!token) return;

        // Fetch current user's vote status and latest counts
        const response = await fetch(`/api/projects/${project.id || project.projectId}/like`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCurrentLikes(data.data.likes)
            setCurrentDislikes(data.data.dislikes)
            setUserVote(data.data.userVote)
          }
        }
      } catch (error) {
        console.error('Error fetching vote status:', error)
      }
    }

    fetchCurrentVoteStatus()
  }, [user, project.id, project.projectId])

  const handleVote = async (voteType: "like" | "dislike", e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking like/dislike
    e.stopPropagation()

    if (!user) {
      try {
        await signInWithGoogle()
        return
      } catch (error) {
        console.error('Sign in error:', error)
        return
      }
    }

    if (isVoting) return

    try {
      setIsVoting(true)

      const token = await AuthService.getIdToken()
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const response = await fetch(`/api/projects/${project.id || project.projectId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          voteType: voteType
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      if (data.success && data.data) {
        // Use actual database counts from API response
        setCurrentLikes(data.data.likes)
        setCurrentDislikes(data.data.dislikes)
        setUserVote(data.data.userVote)
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

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
              onClick={(e) => handleVote("like", e)}
              disabled={isVoting}
              className={`flex items-center space-x-1 ${
                userVote === "like" 
                  ? "text-green-700 bg-green-50" 
                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs">{currentLikes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => handleVote("dislike", e)}
              disabled={isVoting}
              className={`flex items-center space-x-1 ${
                userVote === "dislike" 
                  ? "text-red-700 bg-red-50" 
                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-xs">{currentDislikes}</span>
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
