import { Badge } from "@/components/ui/badge"

interface StatusInfo {
  name: string
  color: string
  description: string
}

const statusTypes: StatusInfo[] = [
  {
    name: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Project has been finished successfully"
  },
  {
    name: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Project is currently being implemented"
  },
  {
    name: "Upcoming",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Project is planned but not yet started"
  },
  {
    name: "Delayed",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Project is behind schedule"
  },
  {
    name: "On Hold",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Project has been temporarily suspended"
  },
  {
    name: "Under Review",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Project is being evaluated or reviewed"
  },
  {
    name: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "Project has been terminated"
  }
]

interface StatusLegendProps {
  showDescriptions?: boolean
  compact?: boolean
}

export function StatusLegend({ showDescriptions = true, compact = false }: StatusLegendProps) {
  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      <h3 className="text-sm font-medium text-gray-900">Project Status Legend</h3>
      <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-4 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-3'}`}>
        {statusTypes.map((status) => (
          <div key={status.name} className="flex items-start space-x-2">
            <Badge className={`${status.color} text-xs px-2 py-1 flex-shrink-0`}>
              {status.name}
            </Badge>
            {showDescriptions && !compact && (
              <span className="text-xs text-gray-600 leading-tight">
                {status.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Export the status utility functions for use in other components
export function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case "completed":
    case "finished":
    case "done":
      return "bg-green-100 text-green-800 border-green-200"
    
    case "in progress":
    case "in-progress":
    case "ongoing":
    case "active":
      return "bg-blue-100 text-blue-800 border-blue-200"
    
    case "planned":
    case "upcoming":
    case "pending":
    case "scheduled":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    
    case "delayed":
    case "behind schedule":
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200"
    
    case "on hold":
    case "paused":
    case "suspended":
      return "bg-orange-100 text-orange-800 border-orange-200"
    
    case "cancelled":
    case "terminated":
      return "bg-gray-100 text-gray-800 border-gray-200"
    
    case "under review":
    case "review":
      return "bg-purple-100 text-purple-800 border-purple-200"
      
    default:
      return "bg-slate-100 text-slate-800 border-slate-200"
  }
}

export function getStatusText(status: string): string {
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case "completed":
    case "finished":
    case "done":
      return "Completed"
    
    case "in progress":
    case "in-progress":
    case "ongoing":
    case "active":
      return "In Progress"
    
    case "planned":
    case "upcoming":
    case "pending":
    case "scheduled":
      return "Upcoming"
    
    case "delayed":
    case "behind schedule":
    case "overdue":
      return "Delayed"
    
    case "on hold":
    case "paused":
    case "suspended":
      return "On Hold"
    
    case "cancelled":
    case "terminated":
      return "Cancelled"
    
    case "under review":
    case "review":
      return "Under Review"
      
    default:
      // Capitalize first letter of each word for unknown statuses
      return status.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
  }
}
