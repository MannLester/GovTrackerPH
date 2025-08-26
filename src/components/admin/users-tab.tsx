'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, UserX, UserCheck, Mail, Crown, Shield, Filter, AlertTriangle } from "lucide-react"
import { User } from "@/models/dim-models/dim-user"

export function UsersTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [suspendedFilter, setSuspendedFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole] = useState<string>('admin') // This should come from auth context
  const [actionType, setActionType] = useState<'role' | 'status' | 'message' | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [newStatus, setNewStatus] = useState<string>('')
  const [messageContent, setMessageContent] = useState('')

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        const result = await response.json()
        
        if (result.success) {
          setUsers(result.data.users)
        } else {
          console.error('Failed to fetch users:', result.error)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getStatusName = (user: User) => {
    return user.dim_status?.status_name || user.status_name || user.status_id;
  }

  const filteredUsers = users.filter(user => {
    const displayName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch = displayName.includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.role.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  // Get banned/suspended users
  const bannedUsers = users.filter(user => {
    const statusName = getStatusName(user).toLowerCase();
    return statusName === 'banned' || statusName === 'suspended';
  })
  
  // Filter banned users for display
  const filteredBannedUsers = bannedUsers.filter(user => {
    if (suspendedFilter === "all") return true;
    const statusName = getStatusName(user).toLowerCase();
    return statusName === suspendedFilter;
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'super-admin': return 'bg-purple-100 text-purple-800'
      case 'personnel': return 'bg-blue-100 text-blue-800'
      case 'citizen': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (statusName: string) => {
    const lowerStatus = statusName.toLowerCase();
    switch (lowerStatus) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'banned': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvailableRoles = (userCurrentRole: string) => {
    const roles = []
    
    if (currentUserRole === 'super-admin') {
      if (userCurrentRole === 'citizen') {
        roles.push({ value: 'personnel', label: 'Personnel' })
        roles.push({ value: 'admin', label: 'Admin' })
      } else if (userCurrentRole === 'personnel') {
        roles.push({ value: 'citizen', label: 'Citizen' })
        roles.push({ value: 'admin', label: 'Admin' })
      } else if (userCurrentRole === 'admin') {
        roles.push({ value: 'citizen', label: 'Citizen' })
        roles.push({ value: 'personnel', label: 'Personnel' })
      }
    } else if (currentUserRole === 'admin') {
      if (userCurrentRole === 'citizen') {
        roles.push({ value: 'personnel', label: 'Personnel' })
      } else if (userCurrentRole === 'personnel') {
        roles.push({ value: 'citizen', label: 'Citizen' })
      }
    }
    
    return roles
  }

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setUsers(users.map(user => 
          user.user_id === selectedUser.user_id 
            ? { ...user, role: newRole as "citizen" | "admin" | "personnel" | "super-admin" }
            : user
        ))
        setActionType(null)
        setSelectedUser(null)
        setNewRole('')
      } else {
        console.error('Failed to update role:', result.error)
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedUser || !newStatus) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setUsers(users.map(user => 
          user.user_id === selectedUser.user_id 
            ? { ...user, status_id: newStatus }
            : user
        ))
        setActionType(null)
        setSelectedUser(null)
        setNewStatus('')
      } else {
        console.error('Failed to update status:', result.error)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setActionType(null)
        setSelectedUser(null)
        setMessageContent('')
        // Show success message
      } else {
        console.error('Failed to send message:', result.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const openActionDialog = (user: User, action: 'role' | 'status' | 'message') => {
    setSelectedUser(user)
    setActionType(action)
    if (action === 'status') {
      const currentStatus = getStatusName(user).toLowerCase();
      setNewStatus(currentStatus === 'active' ? 'banned' : 'active')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading users...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>User Management</span>
                {currentUserRole === 'super-admin' && (
                  <Crown className="h-5 w-5 text-purple-500" />
                )}
                {currentUserRole === 'admin' && (
                  <Shield className="h-5 w-5 text-blue-500" />
                )}
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
                {currentUserRole === 'super-admin' ? ' (Super Admin Access)' : ' (Admin Access)'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {users.length} Total Users
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="citizen">Citizens</SelectItem>
                  <SelectItem value="personnel">Personnel</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="super-admin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const displayName = `${user.first_name} ${user.last_name}`
                return (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(getStatusName(user))}>
                      {getStatusName(user)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex items-center space-x-1">
                        {/* Role Change Button */}
                        {getAvailableRoles(user.role).length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openActionDialog(user, 'role')}
                              >
                                <Shield className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Change user role</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {/* Status Change Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openActionDialog(user, 'status')}
                            >
                              {getStatusName(user).toLowerCase() === 'active' ? (
                                <UserX className="h-3 w-3" />
                              ) : (
                                <UserCheck className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getStatusName(user).toLowerCase() === 'active' ? 'Ban user' : 'Unban user'}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Message Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openActionDialog(user, 'message')}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Send message to user</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionType !== null} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'role' && 'Change User Role'}
              {actionType === 'status' && 'Change User Status'}
              {actionType === 'message' && 'Send Message to User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && `Managing ${selectedUser.first_name} ${selectedUser.last_name} (${selectedUser.email})`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === 'role' && selectedUser && (
              <div>
                <label className="text-sm font-medium">New Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRoles(selectedUser.role).map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {actionType === 'status' && selectedUser && (
              <div>
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {actionType === 'message' && (
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setActionType(null)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (actionType === 'role') handleRoleChange()
                else if (actionType === 'status') handleStatusChange()
                else if (actionType === 'message') handleSendMessage()
              }}
              disabled={
                (actionType === 'role' && !newRole) ||
                (actionType === 'status' && !newStatus) ||
                (actionType === 'message' && !messageContent)
              }
            >
              {actionType === 'role' && 'Change Role'}
              {actionType === 'status' && 'Change Status'}
              {actionType === 'message' && 'Send Message'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banned/Suspended Users Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Banned & Suspended Users</span>
              </CardTitle>
              <CardDescription>
                Manage users who have been banned or suspended
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={suspendedFilter} onValueChange={setSuspendedFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-red-600">
                {filteredBannedUsers.length} Users
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBannedUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium">No banned users</p>
              <p className="text-sm">All users are currently active</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Banned Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBannedUsers.map((user) => {
                  const displayName = `${user.first_name} ${user.last_name}`
                  return (
                  <TableRow key={`banned-${user.user_id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{displayName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(getStatusName(user))}>
                        {getStatusName(user)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex items-center space-x-1">
                          {/* Unban Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openActionDialog(user, 'status')}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <UserCheck className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restore user access</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Message Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openActionDialog(user, 'message')}
                              >
                                <Mail className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Send message to user</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
