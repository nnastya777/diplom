"use client"

import type { UserProfile } from "@/lib/auth/roles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UsersManagement } from "./sections/users-management"
import { SystemOverview } from "./sections/system-overview"
import { DepartmentsManagement } from "./sections/departments-management"
import { SystemSettings } from "./sections/system-settings"

interface AdminDashboardProps {
  profile: UserProfile
}

export function AdminDashboard({ profile }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Административная панель</h1>
          <p className="mt-2 text-slate-600">Полный контроль над системой учета рабочего времени</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="departments">Отделы</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentsManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
