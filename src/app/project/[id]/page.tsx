import { ProjectDetail } from "@/components/project-detail"
import { Header } from "@/components/header"

// Mock data - in real app this would come from your database
const mockProject = {
  id: "1",
  title: "Metro Manila Subway Project - Phase 1",
  description:
    "Construction of the first phase of the Metro Manila Subway system connecting Quezon City to Pasay City. This ambitious infrastructure project aims to provide a fast, reliable, and modern transportation system for Metro Manila residents.",
  amount: "₱357,000,000,000",
  contractor: "Tokyo Metro Co. Ltd. & DMCI Holdings",
  location: "Metro Manila",
  status: "in-progress",
  progress: 65,
  likes: 1247,
  dislikes: 89,
  comments: 234,
  images: ["/subway-construction-site-philippines.png", "/subway-tunnel-boring-machine-philippines.png", "/subway-station-construction-philippines.png"],
  expectedOutcome:
    "Reduce travel time by 50% and ease traffic congestion in Metro Manila. Expected to serve 370,000 passengers daily.",
  personnel:
    "Secretary Arthur Tugade (DOTr), Project Manager Juan Santos (DMCI), Chief Engineer Hiroshi Tanaka (Tokyo Metro)",
  reason: "Address severe traffic congestion in Metro Manila and provide sustainable public transportation",
  startDate: "2019-02-27",
  expectedCompletion: "2025-12-31",
  milestones: [
    { title: "Ground Breaking", date: "2019-02-27", completed: true },
    { title: "Tunnel Boring Completion", date: "2023-06-15", completed: true },
    { title: "Station Construction", date: "2024-03-30", completed: false },
    { title: "Systems Installation", date: "2024-09-15", completed: false },
    { title: "Testing & Commissioning", date: "2025-06-30", completed: false },
    { title: "Commercial Operations", date: "2025-12-31", completed: false },
  ],
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProjectDetail project={mockProject} />
      </main>
    </div>
  )
}
