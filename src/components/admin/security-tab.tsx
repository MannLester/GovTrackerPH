'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Bug, Server, Shield, RefreshCw } from "lucide-react"

// Mock security data
const securityAlerts = [
  {
    id: "1",
    type: "security",
    title: "Suspicious login attempt",
    description: "Multiple failed login attempts from IP 192.168.1.100",
    severity: "high",
    timestamp: new Date("2024-03-15T10:30:00")
  },
  {
    id: "2", 
    type: "bug",
    title: "Database connection timeout",
    description: "Intermittent database timeouts reported by users",
    severity: "medium",
    timestamp: new Date("2024-03-15T09:15:00")
  },
  {
    id: "3",
    type: "downtime",
    title: "API endpoint slow response",
    description: "Projects API responding slower than usual",
    severity: "low",
    timestamp: new Date("2024-03-15T08:45:00")
  }
]

export function SecurityTab() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />
      case 'bug': return <Bug className="h-4 w-4" />
      case 'downtime': return <Server className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security & System Health</CardTitle>
          <CardDescription>
            Monitor system security, bugs, and downtime reports
          </CardDescription>
        </CardHeader>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-lg font-semibold">Secure</div>
                <p className="text-sm text-gray-500">No active threats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-lg font-semibold">97.8%</div>
                <p className="text-sm text-gray-500">Uptime this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bug className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-lg font-semibold">3</div>
                <p className="text-sm text-gray-500">Open bug reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getTypeIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium">{alert.title}</h3>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {alert.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button variant="outline" size="sm">
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline">View Logs</Button>
            <Button variant="outline">Security Scan</Button>
            <Button variant="outline">Backup Data</Button>
            <Button variant="destructive">Emergency Mode</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
