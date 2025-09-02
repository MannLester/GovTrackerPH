'use client'

import { Button } from "@/components/ui/button"
import { Moon, Sun, User, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in failed:', error)
      // You could add a toast notification here
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
      // You could add a toast notification here
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - responsive sizing */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-sm sm:text-lg">₱</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-accent rounded-full border-2 border-background"></div>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg sm:text-xl text-foreground">GovTracker PH</span>
                <p className="text-xs text-muted-foreground -mt-1">Transparency para sa Bayan</p>
              </div>
            </Link>
          </div>


          {/* Actions - responsive layout */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon">
              <Sun className="w-5 h-5" />
            </Button>

            {/* Notifications - only show for authenticated users */}
            {user && (
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            )}

            {/* Authentication Section */}
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              /* Authenticated User */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={user.profile_picture || undefined} alt={user.username} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Not Authenticated */
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="icon" onClick={handleSignIn}>
                  <User className="w-5 h-5" />
                </Button>
                <Button onClick={handleSignIn} className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
