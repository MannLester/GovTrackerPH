'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock, CheckCircle, MapPin, TrendingUp, Users, FileText, Target } from "lucide-react"
import { Stats } from "@/models/dim-models/dim-stats"

// Icon mapping for different stat types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'building2': Building2,
  'clock': Clock,
  'check-circle': CheckCircle,
  'map-pin': MapPin,
  'trending-up': TrendingUp,
  'users': Users,
  'file-text': FileText,
  'target': Target,
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()
        
        if (result.success) {
          setStats(result.data)
        } else {
          setError('Failed to fetch statistics')
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <p className="text-red-500 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const IconComponent = iconMap[stat.icon] || Building2
        return (
          <Card key={stat.stats_id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
