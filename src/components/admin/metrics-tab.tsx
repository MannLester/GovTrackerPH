'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

// Mock metrics data
const userGrowthData = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1350 },
  { month: 'Mar', users: 1500 },
  { month: 'Apr', users: 1680 },
  { month: 'May', users: 1820 },
  { month: 'Jun', users: 2000 }
]

const projectStatusData = [
  { status: 'Completed', count: 45 },
  { status: 'Ongoing', count: 23 }, 
  { status: 'Planning', count: 12 },
  { status: 'Suspended', count: 3 }
]

export function MetricsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Metrics</CardTitle>
          <CardDescription>
            Detailed insights and performance metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">2,547</div>
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">83</div>
            <p className="text-xs text-gray-500">Active Projects</p>
            <p className="text-xs text-green-600">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">1,246</div>
            <p className="text-xs text-gray-500">Comments Today</p>
            <p className="text-xs text-red-600">-3% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">97.2%</div>
            <p className="text-xs text-gray-500">System Uptime</p>
            <p className="text-xs text-green-600">+0.1% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
