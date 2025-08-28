import { Header } from "@/components/header"
import { ProjectFilters } from "@/components/project-filters"
import { ProjectGrid } from "@/components/project-grid"
import { StatsOverview } from "@/components/stats-overview"
import { MockDataModal } from "@/components/mock-data-modal"

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-2">Philippine Government Project Tracker</h1>
              <p className="text-lg text-accent font-medium mb-4">&quot;Ang Pagbabago ay Nagsisimula sa Proyektong Nagagamit ng Tama&quot;</p>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto">
                Track government projects across the Philippines. See what&apos;s being built in your barangay, city, or
                province. Vote on projects, share your thoughts, and engage with fellow Filipinos about public
                infrastructure and services that matter to our communities.
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
              </div>
            </div>
          </div>

          <StatsOverview />
          <ProjectFilters />
          <ProjectGrid />
        </main>
      </div>
      <MockDataModal />
    </>
  )
}
