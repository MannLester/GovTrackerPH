'use client'

import { useAuth } from '@/context/AuthContext'
import { Shield, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-900">Verifying access...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we check your permissions</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Developer Dashboard Blocked!</h2>
            <p className="text-lg text-red-600 mb-4">You are not logged in!</p>
            <p className="text-sm text-gray-600 mb-6">
              Please log in with your admin account first before accessing the developer dashboard.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                1. Go to the login page
              </p>
              <p className="text-xs text-gray-500">
                2. Sign in with your admin/super-admin account
              </p>
              <p className="text-xs text-gray-500">
                3. Return to /admin URL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is not admin or super-admin
  if (user.role !== 'admin' && user.role !== 'super-admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Developer Dashboard Blocked!</h2>
            <p className="text-lg text-red-600 mb-4">You are not a valid admin for this page!</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Current User:</strong> {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Role:</strong> <span className="capitalize">{user.role}</span>
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Only users with <strong>admin</strong> or <strong>super-admin</strong> roles can access this dashboard.
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Contact your system administrator for access</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated and has admin role - render the admin dashboard
  return <>{children}</>
}
