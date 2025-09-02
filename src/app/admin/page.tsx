'use client'

import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersTab } from "@/components/admin/users-tab"
import { ProjectsTab } from "@/components/admin/projects-tab"
import { DatabaseTab } from "@/components/admin/database-tab"
import { HealthCheckTab } from "@/components/admin/health-check-tab"
import { AdminMailTab } from "@/components/admin/admin-mail-tab"
import { AdminGuard } from "@/components/admin/admin-guard"
//Here
export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage users, projects, database, and system health
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="health-check">Health Check</TabsTrigger>
            <TabsTrigger value="system-mail">System Mail</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseTab />
          </TabsContent>

          <TabsContent value="health-check">
            <HealthCheckTab />
          </TabsContent>

          <TabsContent value="system-mail">
            <AdminMailTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </AdminGuard>
  )
}
