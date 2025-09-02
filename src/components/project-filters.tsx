import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Filter, X, Search } from "lucide-react"

export function ProjectFilters() {
  const activeFilters = ["Metro Manila", "In Progress", "Infrastructure"]

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
          Filter Projects
        </h2>
        <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 bg-transparent">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search projects, barangay, city, province..." 
            className="pl-10 border-primary" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {activeFilters.map((filter, index) => (
          <Badge key={index} className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 px-3 py-1">
            {filter}
            <X className="w-3 h-3 cursor-pointer hover:bg-blue-700 rounded-full p-0.5" />
          </Badge>
        ))}
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 text-sm">
          Clear all
        </Button>
      </div>
    </div>
  )
}
