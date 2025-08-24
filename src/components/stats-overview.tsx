import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock, CheckCircle, MapPin } from "lucide-react"

export function StatsOverview() {
  const stats = [
    {
      title: "Total Projects",
      value: "1,247",
      icon: Building2,
      description: "Across all regions",
    },
    {
      title: "In Progress",
      value: "342",
      icon: Clock,
      description: "Currently being built",
    },
    {
      title: "Completed",
      value: "905",
      icon: CheckCircle,
      description: "Successfully finished",
    },
    {
      title: "Provinces",
      value: "81",
      icon: MapPin,
      description: "With active projects",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
              {stat.value}
            </div>
            <p className="text-xs text-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
