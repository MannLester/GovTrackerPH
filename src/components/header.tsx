import { Button } from "@/components/ui/button"
import { Search, User, Bell } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-lg">₱</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background"></div>
              </div>
              <div>
                <span className="font-bold text-xl text-foreground">GovTracker PH</span>
                <p className="text-xs text-muted-foreground -mt-1">Transparency para sa Bayan</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search projects, barangay, city, province..." className="pl-10 border-primary" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button asChild>
                <Link href="/auth" className="flex-1">
                    Sign In
                </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
