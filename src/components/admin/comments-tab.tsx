'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MessageSquare, Trash2, CheckCircle } from "lucide-react"

// Mock comments data
const mockComments = [
  {
    id: "1",
    content: "This project looks promising for our community!",
    author: "Juan Dela Cruz",
    project: "Manila Bay Rehabilitation",
    createdAt: new Date("2024-03-15"),
    status: "approved",
    reports: 0
  },
  {
    id: "2",
    content: "I think this budget allocation is too high.",
    author: "Maria Santos", 
    project: "Cebu IT Park Expansion",
    createdAt: new Date("2024-03-10"),
    status: "flagged",
    reports: 3
  },
  {
    id: "3",
    content: "When will construction start?",
    author: "Pedro Garcia",
    project: "Davao Bridge Construction", 
    createdAt: new Date("2024-03-05"),
    status: "approved",
    reports: 0
  }
]

export function CommentsTab() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredComments = mockComments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.project.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'flagged': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comments Management</CardTitle>
          <CardDescription>
            Moderate user comments and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search comments by content, author, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comment</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate text-sm">{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {comment.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{comment.author}</TableCell>
                  <TableCell>{comment.project}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(comment.status)}>
                      {comment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {comment.reports > 0 ? (
                      <Badge variant="destructive">{comment.reports}</Badge>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
