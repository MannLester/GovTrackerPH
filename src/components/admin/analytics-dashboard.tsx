import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  activeProjects: number
  totalComments: number
  totalBudget: number
  newUsersThisMonth: number
  newProjectsThisMonth: number
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const userActivationRate = data.totalUsers > 0 ? (data.activeUsers / data.totalUsers) * 100 : 0
  const projectCompletionRate = data.totalProjects > 0 ? (data.activeProjects / data.totalProjects) * 100 : 0

  const stats = [
    {
      title: "Total Users",
      value: data.totalUsers,
      change: `+${data.newUsersThisMonth} this month`,
      changeType: "positive",
      color: "text-blue-600"
    },
    {
      title: "Active Projects", 
      value: data.activeProjects,
      change: `+${data.newProjectsThisMonth} this month`,
      changeType: "positive",
      color: "text-green-600"
    },
    {
      title: "Total Budget",
      value: `₱${data.totalBudget.toLocaleString()}`,
      change: "Across all projects",
      changeType: "neutral",
      color: "text-purple-600"
    },
    {
      title: "Comments",
      value: data.totalComments,
      change: "User engagement",
      changeType: "neutral",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className={`text-xs mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activation Rate</CardTitle>
            <CardDescription>
              Percentage of users who are currently active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Users</span>
                <span>{data.activeUsers} / {data.totalUsers}</span>
              </div>
              <Progress value={userActivationRate} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {userActivationRate.toFixed(1)}% of users are active
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Activity</CardTitle>
            <CardDescription>
              Current project execution status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Projects</span>
                <span>{data.activeProjects} / {data.totalProjects}</span>
              </div>
              <Progress value={projectCompletionRate} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {projectCompletionRate.toFixed(1)}% of projects are active
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Health</CardTitle>
          <CardDescription>
            Overview of platform activity and health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.activeUsers}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.activeProjects}</p>
              <p className="text-sm text-muted-foreground">Running Projects</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.totalComments}</p>
              <p className="text-sm text-muted-foreground">Total Comments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
