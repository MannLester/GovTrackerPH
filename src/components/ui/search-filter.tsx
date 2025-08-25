import * as React from "react"
import { cn } from "@/lib/utils"

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filters?: {
    label: string
    value: string
    options: { label: string; value: string }[]
    onChange: (value: string) => void
  }[]
  className?: string
}

export function SearchFilter({ 
  searchTerm, 
  onSearchChange, 
  filters = [], 
  className 
}: SearchFilterProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 mb-4", className)}>
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
      {filters.map((filter, index) => (
        <div key={index} className="min-w-[150px]">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
