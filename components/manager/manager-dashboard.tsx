"use client"

import type { UserProfile } from "@/lib/auth/roles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TeamOverview } from "./sections/team-overview"
import { AbsenceApprovals } from "./sections/absence-approvals"
import { AttendanceMonitoring } from "./sections/attendance-monitoring"
import { TeamStatistics } from "./sections/team-statistics"

interface ManagerDashboardProps {
  profile: UserProfile
}

export function ManagerDashboard({ profile }: ManagerDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Рабочее место руководителя</h1>
          <p className="mt-2 text-slate-600">Управление сотрудниками отдела: {profile.department}</p>
        </div>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="team">Команда</TabsTrigger>
            <TabsTrigger value="approvals">Заявки</TabsTrigger>
            <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
            <TabsTrigger value="statistics">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <TeamOverview department={profile.department} managerId={profile.id} />
          </TabsContent>

          <TabsContent value="approvals">
            <AbsenceApprovals department={profile.department} managerId={profile.id} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceMonitoring department={profile.department} />
          </TabsContent>

          <TabsContent value="statistics">
            <TeamStatistics department={profile.department} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
