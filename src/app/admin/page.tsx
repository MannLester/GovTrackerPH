'use client'

import { Header } from "@/components/header"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { User } from "@/models/dim-models/dim-user"
import { Project } from "@/models/dim-models/dim-project"
import { Comment } from "@/models/dim-models/dim-comment"

// Mock data for demonstration
const mockUsers: User[] = [
  {
    userId: "1",
    displayName: "Juan Dela Cruz",
    email: "juan@example.com",
    profilePic: "",
    userRole: "citizen",
    createdAt: new Date("2024-01-15"),
    statusId: "active"
  },
  {
    userId: "2",
    displayName: "Maria Santos",
    email: "maria@gov.ph",
    profilePic: "",
    userRole: "personnel",
    createdAt: new Date("2024-02-20"),
    statusId: "active"
  },
  {
    userId: "3",
    displayName: "Pedro Garcia",
    email: "pedro@example.com",
    profilePic: "",
    userRole: "citizen",
    createdAt: new Date("2024-03-10"),
    statusId: "suspended"
  }
]

const mockProjects: Project[] = [
  {
    projectId: "1",
    title: "Manila Bay Rehabilitation",
    description: "Environmental restoration of Manila Bay",
    amount: 5000000,
    statusId: "ongoing",
    contractorId: "ABC Construction",
    locationId: "Manila",
    progress: "65%",
    expectedOurcome: "Clean and sustainable bay area",
    reason: "Environmental protection",
    startDate: new Date("2024-01-01"),
    expectedCompletionDate: new Date("2024-12-31"),
    createdAt: new Date("2023-12-01")
  },
  {
    projectId: "2", 
    title: "Cebu Bridge Construction",
    description: "New bridge connecting Cebu mainland to Mactan",
    amount: 12000000,
    statusId: "planning",
    contractorId: "XYZ Engineering",
    locationId: "Cebu",
    progress: "15%",
    expectedOurcome: "Improved transportation",
    reason: "Infrastructure development",
    startDate: new Date("2024-06-01"),
    expectedCompletionDate: new Date("2026-05-31"),
    createdAt: new Date("2024-01-15")
  }
]

const mockComments: Comment[] = [
  {
    commentId: "1",
    userId: "1",
    projectId: "1",
    content: "This project looks great! Looking forward to seeing the results.",
    createdAt: new Date("2024-08-20"),
    parentCommentId: ""
  },
  {
    commentId: "2",
    userId: "3",
    projectId: "1", 
    content: "Waste of taxpayer money! This is corruption!",
    createdAt: new Date("2024-08-21"),
    parentCommentId: ""
  }
]

// --- USERS MANAGEMENT ---
function UsersList() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userRole.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserAction = (userId: string, action: string) => {
    setUsers(prev => prev.map(user => 
      user.userId === userId 
        ? { ...user, statusId: action === 'suspend' ? 'suspended' : 'active' }
        : user
    ))
    setDialogOpen(false)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary text-primary-foreground'
      case 'super-admin': return 'bg-destructive text-destructive-foreground'
      case 'personnel': return 'bg-secondary text-secondary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-primary">Users Management</CardTitle>
        <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
        <Input
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePic} />
                    <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.userRole)}>
                    {user.userRole}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(user.statusId)}>
                    {user.statusId}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user)
                      setDialogOpen(true)
                    }}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage User: {selectedUser?.displayName}</DialogTitle>
              <DialogDescription>
                Choose an action for this user account
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={selectedUser?.statusId === 'suspended' ? 'default' : 'destructive'}
                  onClick={() => handleUserAction(selectedUser?.userId || '', selectedUser?.statusId === 'suspended' ? 'activate' : 'suspend')}
                >
                  {selectedUser?.statusId === 'suspended' ? 'Activate' : 'Suspend'} User
                </Button>
                <Button variant="outline">
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

// --- PROJECTS MANAGEMENT ---
function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.locationId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleProjectAction = (projectId: string, action: string) => {
    if (action === 'remove') {
      setProjects(prev => prev.filter(p => p.projectId !== projectId))
    } else {
      setProjects(prev => prev.map(project => 
        project.projectId === projectId 
          ? { ...project, statusId: action }
          : project
      ))
    }
    setDialogOpen(false)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-primary">Projects Management</CardTitle>
        <CardDescription>Oversee all government projects and their status</CardDescription>
        <Input
          placeholder="Search projects by title, location, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.projectId}>
                <TableCell>
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.locationId}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(project.statusId)}>
                    {project.statusId}
                  </Badge>
                </TableCell>
                <TableCell>{project.progress}</TableCell>
                <TableCell>₱{project.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProject(project)
                      setDialogOpen(true)
                    }}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Project: {selectedProject?.title}</DialogTitle>
              <DialogDescription>
                Choose an action for this project
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handleProjectAction(selectedProject?.projectId || '', 'suspended')}>
                  Suspend
                </Button>
                <Button variant="outline">
                  Edit Details
                </Button>
                <Button variant="destructive" onClick={() => handleProjectAction(selectedProject?.projectId || '', 'remove')}>
                  Remove
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function ReportedProjects() {
  const reportedProjects = mockProjects.filter(p => p.statusId === 'suspended')
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-destructive">Reported Projects</CardTitle>
        <CardDescription>Projects that have been flagged or reported by users</CardDescription>
      </CardHeader>
      <CardContent>
        {reportedProjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No reported projects</p>
        ) : (
          <div className="space-y-4">
            {reportedProjects.map((project) => (
              <div key={project.projectId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-muted-foreground">Reported for suspicious activity</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm" variant="destructive">Take Down</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- COMMENTS MANAGEMENT ---
function CommentsList() {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredComments = comments.filter(comment => 
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRemoveComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.commentId !== commentId))
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-primary">Comments Management</CardTitle>
        <CardDescription>Monitor and moderate user comments</CardDescription>
        <Input
          placeholder="Search comments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div key={comment.commentId} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">User ID: {comment.userId}</p>
                  <p className="text-sm text-muted-foreground mb-2">Project ID: {comment.projectId}</p>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{comment.createdAt.toLocaleString()}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleRemoveComment(comment.commentId)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ReportedComments() {
  const reportedComments = mockComments.filter(c => c.content.toLowerCase().includes('waste') || c.content.toLowerCase().includes('corruption'))
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-destructive">Reported Comments</CardTitle>
        <CardDescription>Comments flagged by users or automated systems</CardDescription>
      </CardHeader>
      <CardContent>
        {reportedComments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No reported comments</p>
        ) : (
          <div className="space-y-4">
            {reportedComments.map((comment) => (
              <div key={comment.commentId} className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">User ID: {comment.userId}</p>
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{comment.createdAt.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Approve</Button>
                    <Button size="sm" variant="destructive">Remove</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Dashboard Stats
function DashboardStats() {
  const stats = [
    { title: "Total Users", value: mockUsers.length, color: "text-blue-600" },
    { title: "Active Projects", value: mockProjects.filter(p => p.statusId === 'ongoing').length, color: "text-green-600" },
    { title: "Total Comments", value: mockComments.length, color: "text-purple-600" },
    { title: "Reported Items", value: 2, color: "text-red-600" }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AdminPage() {
    return (
        <>
            <Header />
            <div className="container mx-auto py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage users, projects, and content across the platform</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">Super Admin</Badge>
                </div>

                <Separator />

                <DashboardStats />

                <div className="space-y-6">
                    <UsersList />
                    <ProjectsList />
                    <ReportedProjects />
                    <CommentsList />
                    <ReportedComments />
                </div>
            </div>
        </>
    )
}