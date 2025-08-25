"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, ThumbsDown, MapPin, Calendar, User, Building, Target, Clock, CheckCircle } from "lucide-react"
import Image from "next/image"
import { CommentSection } from "@/components/comment-section"
import { useState } from "react"

import type { Project as ProjectModel } from "@/models/dim-models/dim-project"

interface Project extends Omit<ProjectModel, "image" | "milestones"> {
  images: string[]
  milestones: Array<{
    title: string
    date: Date
    completed: boolean
  }>
}

interface ProjectDetailProps {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null)
  const [currentLikes, setCurrentLikes] = useState(project.likes)
  const [currentDislikes, setCurrentDislikes] = useState(project.dislikes)

  const handleVote = (voteType: "like" | "dislike") => {
    if (userVote === voteType) {
      // Remove vote
      if (voteType === "like") {
        setCurrentLikes((prev) => prev - 1)
      } else {
        setCurrentDislikes((prev) => prev - 1)
      }
      setUserVote(null)
    } else {
      // Change or add vote
      if (userVote === "like") {
        setCurrentLikes((prev) => prev - 1)
        setCurrentDislikes((prev) => prev + 1)
      } else if (userVote === "dislike") {
        setCurrentDislikes((prev) => prev - 1)
        setCurrentLikes((prev) => prev + 1)
      } else {
        if (voteType === "like") {
          setCurrentLikes((prev) => prev + 1)
        } else {
          setCurrentDislikes((prev) => prev + 1)
        }
      }
      setUserVote(voteType)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "delayed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("-", " ")}
          </Badge>
          <div className="flex items-center space-x-2">
            <Button
              variant={userVote === "like" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("like")}
              className={
                userVote === "like" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:text-green-600"
              }
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {currentLikes}
            </Button>
            <Button
              variant={userVote === "dislike" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("dislike")}
              className={userVote === "dislike" ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50 hover:text-red-600"}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              {currentDislikes}
            </Button>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
          {project.title}
        </h1>

        <div className="flex items-center space-x-6 text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {project.location}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Started: {project.startDate instanceof Date ? project.startDate.toLocaleDateString() : new Date(project.startDate).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Expected: {project.expectedCompletionDate instanceof Date ? project.expectedCompletionDate.toLocaleDateString() : new Date(project.expectedCompletionDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {project.images.map((image, index) => (
          <div key={index} className="relative aspect-video">
            <Image
              src={image || "/placeholder.svg"}
              alt={`${project.title} - Image ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>

          {/* Project Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center font-[family-name:var(--font-space-grotesk)]">
                <Target className="w-5 h-5 mr-2" />
                Why This Project?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{project.reason}</p>
            </CardContent>
          </Card>

          {/* Expected Outcome */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center font-[family-name:var(--font-space-grotesk)]">
                <CheckCircle className="w-5 h-5 mr-2" />
                Expected Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{project.expectedOutcome}</p>
            </CardContent>
          </Card>

          {/* Project Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${milestone.completed ? "bg-green-500" : "bg-gray-300"}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${milestone.completed ? "text-foreground" : "text-gray-600"}`}>
                          {milestone.title}
                        </span>
                        <span className="text-sm text-gray-500">{milestone.date instanceof Date ? milestone.date.toLocaleDateString() : new Date(milestone.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSection projectId={project.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Progress */}
          {project.status === "in-progress" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Building className="w-4 h-4 mr-1" />
                  Budget
                </div>
                <p className="font-semibold text-lg text-foreground">{project.amount}</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Building className="w-4 h-4 mr-1" />
                  Contractor
                </div>
                <p className="font-medium text-foreground">{project.contractor}</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <User className="w-4 h-4 mr-1" />
                  Key Personnel
                </div>
                <p className="text-sm text-foreground leading-relaxed">{project.personnel}</p>
              </div>
            </CardContent>
          </Card>

          {/* Community Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Community Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Votes</span>
                  <span className="font-semibold">{currentLikes + currentDislikes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support Rate</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((currentLikes / (currentLikes + currentDislikes)) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="font-semibold">{project.comments}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
