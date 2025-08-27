'use client'

import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersTab } from "@/components/admin/users-tab"
import { ProjectsTab } from "@/components/admin/projects-tab"
import { CommentsTab } from "@/components/admin/comments-tab"
import { BulkOpsTab } from "@/components/admin/bulk-ops-tab"
import { MetricsTab } from "@/components/admin/metrics-tab"
import { SecurityTab } from "@/components/admin/security-tab"
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
            <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage users, projects, and system administration
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="bulk-ops">Bulk Ops</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="admin-mail">Admin Mail</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsTab />
          </TabsContent>

          <TabsContent value="bulk-ops">
            <BulkOpsTab />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsTab />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="admin-mail">
            <AdminMailTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </AdminGuard>
  )
}
