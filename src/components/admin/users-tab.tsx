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
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

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
    return statusName === suspendedFilter.toLowerCase();
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
    
    setIsUpdating(true)
    setUpdateMessage(null)
    
    try {
      console.log(`🔄 Changing role for ${selectedUser.email} from ${selectedUser.role} to ${newRole}`)
      
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state with the new role
        const updatedUsers = users.map(user => 
          user.user_id === selectedUser.user_id 
            ? { ...user, role: newRole as "citizen" | "admin" | "personnel" | "super-admin" }
            : user
        )
        setUsers(updatedUsers)
        
        // Show success message
        setUpdateMessage({
          type: 'success', 
          text: `Successfully updated ${selectedUser.first_name} ${selectedUser.last_name}'s role to ${newRole}`
        })
        
        console.log(`✅ Successfully updated role for ${selectedUser.email} to ${newRole}`)
        
        // Close dialog after a short delay
        setTimeout(() => {
          setActionType(null)
          setSelectedUser(null)
          setNewRole('')
          setUpdateMessage(null)
        }, 2000)
        
      } else {
        setUpdateMessage({
          type: 'error',
          text: result.error || 'Failed to update user role'
        })
        console.error('❌ Failed to update role:', result.error)
      }
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Network error occurred while updating role'
      })
      console.error('❌ Error updating role:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedUser || !newStatus) return
    
    setIsUpdating(true)
    setUpdateMessage(null)
    
    try {
      const currentStatus = getStatusName(selectedUser).toLowerCase()
      console.log(`🔄 Changing status for ${selectedUser.email} from ${currentStatus} to ${newStatus}`)
      console.log(`📤 Request payload:`, { status: newStatus })
      console.log(`📤 Request URL:`, `/api/admin/users/${selectedUser.user_id}/status`)
      
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      console.log(`📥 Response status:`, response.status)
      console.log(`📥 Response ok:`, response.ok)
      
      const result = await response.json()
      
      console.log(`📊 Status update response:`, result)
      
      if (result.success) {
        // Update local state with the new status
        const updatedUsers = users.map(user => 
          user.user_id === selectedUser.user_id 
            ? { 
                ...user, 
                status_id: result.data.user.status_id, // Use the UUID from the response
                // Update the joined status name if it exists
                dim_status: user.dim_status ? { ...user.dim_status, status_name: result.data.status_name } : { status_name: result.data.status_name }
              }
            : user
        )
        setUsers(updatedUsers)
        
        // Show success message
        const statusAction = newStatus === 'Active' ? 'restored' : newStatus === 'Banned' ? 'banned' : 'suspended'
        setUpdateMessage({
          type: 'success', 
          text: `Successfully ${statusAction} ${selectedUser.first_name} ${selectedUser.last_name}`
        })
        
        console.log(`✅ Successfully updated status for ${selectedUser.email} to ${newStatus}`)
        
        // Close dialog after a short delay
        setTimeout(() => {
          setActionType(null)
          setSelectedUser(null)
          setNewStatus('')
          setUpdateMessage(null)
        }, 2000)
        
      } else {
        setUpdateMessage({
          type: 'error',
          text: result.error || 'Failed to update user status'
        })
        console.error('❌ Failed to update status:', result.error)
      }
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Network error occurred while updating status'
      })
      console.error('❌ Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent) return
    
    setIsUpdating(true)
    setUpdateMessage(null)
    
    try {
      console.log(`📧 Sending message to ${selectedUser.email}`)
      
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Show success message
        setUpdateMessage({
          type: 'success', 
          text: `Message sent successfully to ${selectedUser.first_name} ${selectedUser.last_name}`
        })
        
        console.log(`✅ Successfully sent message to ${selectedUser.email}`)
        
        // Close dialog after a short delay
        setTimeout(() => {
          setActionType(null)
          setSelectedUser(null)
          setMessageContent('')
          setUpdateMessage(null)
        }, 2000)
        
      } else {
        setUpdateMessage({
          type: 'error',
          text: result.error || 'Failed to send message'
        })
        console.error('❌ Failed to send message:', result.error)
      }
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Network error occurred while sending message'
      })
      console.error('❌ Error sending message:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const openActionDialog = (user: User, action: 'role' | 'status' | 'message') => {
    setSelectedUser(user)
    setActionType(action)
    if (action === 'status') {
      const currentStatus = getStatusName(user).toLowerCase();
      setNewStatus(currentStatus === 'active' ? 'Banned' : 'Active')
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
              <Filter className="h-4 w-4" />
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
      <Dialog open={actionType !== null} onOpenChange={(open) => {
        if (!open && !isUpdating) {
          setActionType(null)
          setUpdateMessage(null)
        }
      }}>
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
          
          {/* Success/Error Message */}
          {updateMessage && (
            <div className={`p-3 rounded-md ${updateMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{updateMessage.text}</p>
            </div>
          )}
          
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
                <label className="text-sm font-medium">Change User Status</label>
                <div className="text-xs text-gray-500 mb-2">
                  Current status: <span className="font-medium capitalize">{getStatusName(selectedUser)}</span>
                </div>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStatusName(selectedUser).toLowerCase() !== 'active' && (
                      <SelectItem value="Active">
                        <div className="flex flex-col">
                          <span className="font-medium">Active</span>
                          <span className="text-xs text-gray-500">User can access the platform normally</span>
                        </div>
                      </SelectItem>
                    )}
                    {getStatusName(selectedUser).toLowerCase() !== 'suspended' && (
                      <SelectItem value="Suspended">
                        <div className="flex flex-col">
                          <span className="font-medium">Suspended</span>
                          <span className="text-xs text-gray-500">Temporary restriction - can be restored</span>
                        </div>
                      </SelectItem>
                    )}
                    {getStatusName(selectedUser).toLowerCase() !== 'banned' && (
                      <SelectItem value="Banned">
                        <div className="flex flex-col">
                          <span className="font-medium">Banned</span>
                          <span className="text-xs text-gray-500">Permanent restriction - account blocked</span>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {newStatus && newStatus !== getStatusName(selectedUser).toLowerCase() && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This will change {selectedUser.first_name} {selectedUser.last_name}&apos;s status from{' '}
                      <span className="font-medium capitalize">{getStatusName(selectedUser)}</span> to{' '}
                      <span className="font-medium capitalize">{newStatus}</span>
                    </p>
                  </div>
                )}
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
              onClick={() => {
                setActionType(null)
                setUpdateMessage(null)
              }}
              disabled={isUpdating}
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
                isUpdating ||
                (actionType === 'role' && !newRole) ||
                (actionType === 'status' && !newStatus) ||
                (actionType === 'message' && !messageContent)
              }
            >
              {isUpdating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {actionType === 'role' && (isUpdating ? 'Changing Role...' : 'Change Role')}
              {actionType === 'status' && (isUpdating ? 'Changing Status...' : 'Change Status')}
              {actionType === 'message' && (isUpdating ? 'Sending...' : 'Send Message')}
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
                  <SelectItem value="Banned">Banned</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
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
