'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Send, Inbox, Trash2, Archive } from "lucide-react"

// Mock email data
const mockEmails = [
  {
    id: "1",
    from: "juan@example.com",
    subject: "Question about project approval",
    preview: "I would like to know more about the approval process...",
    timestamp: new Date("2024-03-15T10:30:00"),
    status: "unread",
    priority: "normal"
  },
  {
    id: "2",
    from: "maria@example.com", 
    subject: "Bug report - Dashboard loading issue",
    preview: "The dashboard is not loading properly when I try to...",
    timestamp: new Date("2024-03-15T09:15:00"),
    status: "read",
    priority: "high"
  },
  {
    id: "3",
    from: "admin@govtracker.ph",
    subject: "Weekly system report",
    preview: "This week's system performance summary...",
    timestamp: new Date("2024-03-14T16:00:00"),
    status: "read",
    priority: "low"
  }
]

export function AdminMailTab() {
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [composeMode, setComposeMode] = useState(false)

  const getStatusColor = (status: string) => {
    return status === 'unread' ? 'font-bold' : 'font-normal'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (composeMode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Compose Email</CardTitle>
              <Button variant="outline" onClick={() => setComposeMode(false)}>
                Back to Inbox
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">To</label>
              <Input placeholder="recipient@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Email subject" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                placeholder="Type your message here..."
                className="min-h-[200px]"
              />
            </div>
            <div className="flex space-x-2">
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline">Save Draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Mail</CardTitle>
              <CardDescription>
                Manage admin communications and support emails
              </CardDescription>
            </div>
            <Button onClick={() => setComposeMode(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Email Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Inbox className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-lg font-semibold">24</div>
                <p className="text-sm text-gray-500">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-lg font-semibold">156</div>
                <p className="text-sm text-gray-500">Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-lg font-semibold">1,247</div>
                <p className="text-sm text-gray-500">Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-lg font-semibold">89</div>
                <p className="text-sm text-gray-500">Deleted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmails.map((email) => (
                <TableRow key={email.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className={getStatusColor(email.status)}>
                    {email.from}
                  </TableCell>
                  <TableCell>
                    <div className={getStatusColor(email.status)}>
                      <div>{email.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {email.preview}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(email.priority)}>
                      {email.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {email.timestamp.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4" />
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
