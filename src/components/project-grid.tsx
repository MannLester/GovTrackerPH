import { ProjectCard } from "@/components/project-card"

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    title: "Metro Manila Subway Project - Phase 1",
    description:
      "Construction of the first phase of the Metro Manila Subway system connecting Quezon City to Pasay City.",
    amount: "₱357,000,000,000",
    contractor: "Tokyo Metro Co. Ltd. & DMCI Holdings",
    location: "Metro Manila",
    status: "in-progress",
    progress: 65,
    likes: 1247,
    dislikes: 89,
    comments: 234,
    image: "/subway-construction-site-philippines.png",
    expectedOutcome: "Reduce travel time by 50% and ease traffic congestion",
    personnel: "Secretary Arthur Tugade, Project Manager Juan Santos",
    reason: "Address severe traffic congestion in Metro Manila",
  },
  {
    id: "2",
    title: "Cebu-Cordova Link Expressway",
    description: "An 8.9-kilometer toll bridge connecting Cebu City and Cordova town in Mactan Island.",
    amount: "₱30,000,000,000",
    contractor: "Cebu Cordova Link Expressway Corporation",
    location: "Cebu",
    status: "completed",
    progress: 100,
    likes: 892,
    dislikes: 45,
    comments: 156,
    image: "/modern-bridge-philippines-cebu.png",
    expectedOutcome: "Improve connectivity and boost economic growth",
    personnel: "Governor Gwendolyn Garcia, Engineer Maria Cruz",
    reason: "Enhance transportation between Cebu City and Mactan Island",
  },
  {
    id: "3",
    title: "New Clark City Government Center",
    description: "Construction of a modern government center in New Clark City, Tarlac.",
    amount: "₱9,500,000,000",
    contractor: "Megawide Construction Corporation",
    location: "Tarlac",
    status: "upcoming",
    progress: 0,
    likes: 567,
    dislikes: 123,
    comments: 89,
    image: "/modern-government-building-philippines.png",
    expectedOutcome: "Decentralize government operations and create jobs",
    personnel: "BCDA President Vince Dizon, Architect Anna Reyes",
    reason: "Support the development of New Clark City as a smart city",
  },
  {
    id: "4",
    title: "Mindanao Railway Project - Phase 1",
    description: "Railway system connecting Tagum, Davao City, and Digos City in Mindanao.",
    amount: "₱35,000,000,000",
    contractor: "China Railway Group Limited",
    location: "Davao",
    status: "in-progress",
    progress: 25,
    likes: 734,
    dislikes: 167,
    comments: 201,
    image: "/railway-construction-philippines-mindanao.png",
    expectedOutcome: "Improve transportation and economic development in Mindanao",
    personnel: "DOTr Undersecretary Timothy Batan, Engineer Roberto Silva",
    reason: "Enhance connectivity in Southern Philippines",
  },
  {
    id: "5",
    title: "Iloilo Flood Control Project",
    description: "Comprehensive flood control system for Iloilo City including pumping stations and drainage.",
    amount: "₱12,800,000,000",
    contractor: "EEI Corporation & Sumitomo Mitsui",
    location: "Iloilo",
    status: "in-progress",
    progress: 78,
    likes: 445,
    dislikes: 34,
    comments: 67,
    image: "/flood-control-drainage-system-philippines.png",
    expectedOutcome: "Protect 500,000 residents from flooding",
    personnel: "Mayor Jerry Treñas, Engineer Lisa Fernandez",
    reason: "Address recurring flood problems during typhoon season",
  },
  {
    id: "6",
    title: "Bohol-Panglao International Airport Terminal",
    description: "New international airport terminal to boost tourism in Bohol province.",
    amount: "₱8,900,000,000",
    contractor: "Megawide Construction Corporation",
    location: "Bohol",
    status: "completed",
    progress: 100,
    likes: 1156,
    dislikes: 23,
    comments: 298,
    image: "/modern-airport-terminal-philippines-bohol.png",
    expectedOutcome: "Increase tourist arrivals by 300%",
    personnel: "Governor Arthur Yap, Airport Manager Carlos Mendoza",
    reason: "Support tourism growth and economic development",
  },
]

export function ProjectGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
          Government Projects
        </h2>
        <div className="text-sm text-muted-foreground">Showing {mockProjects.length} of 1,247 projects</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
