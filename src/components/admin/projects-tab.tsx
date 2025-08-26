'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, FolderOpen, Trash2, Eye, MoreHorizontal } from "lucide-react"

// Mock projects data
const mockProjects = [
  {
    id: "1",
    title: "Manila Bay Rehabilitation",
    status: "ongoing",
    budget: 2500000,
    location: "Manila",
    createdAt: new Date("2024-01-10"),
    creator: "Maria Santos"
  },
  {
    id: "2", 
    title: "Cebu IT Park Expansion",
    status: "completed",
    budget: 1800000,
    location: "Cebu",
    createdAt: new Date("2024-02-15"),
    creator: "Juan Dela Cruz"
  },
  {
    id: "3",
    title: "Davao Bridge Construction",
    status: "planning",
    budget: 3200000,
    location: "Davao",
    createdAt: new Date("2024-03-20"),
    creator: "Pedro Garcia"
  }
]

export function ProjectsTab() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
          <CardDescription>
            Monitor and manage government projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search projects by title, location, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-gray-500">by {project.creator}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ₱{project.budget.toLocaleString()}
                  </TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>
                    {project.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Project Actions</DialogTitle>
                          <DialogDescription>
                            Manage {project.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <Button variant="outline" className="flex items-center space-x-2">
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </Button>
                            <Button variant="outline" className="flex items-center space-x-2">
                              <FolderOpen className="h-4 w-4" />
                              <span>Edit</span>
                            </Button>
                            <Button variant="destructive" className="flex items-center space-x-2">
                              <Trash2 className="h-4 w-4" />
                              <span>Remove</span>
                            </Button>
                          </div>
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Changes</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
