"use client"

import type { UserProfile } from "@/lib/auth/roles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceSection } from "./sections/attendance-section"
import { StatisticsSection } from "./sections/statistics-section"
import { AbsencesSection } from "./sections/absences-section"
import { ProfileSection } from "./sections/profile-section"
import { DashboardHeader } from "./dashboard-header"

interface EmployeeDashboardProps {
  profile: UserProfile
}

export function EmployeeDashboard({ profile }: EmployeeDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Добро пожаловать, {profile.full_name}</h1>
          <p className="mt-2 text-slate-600">
            {profile.position} • {profile.department}
          </p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="attendance">Учет времени</TabsTrigger>
            <TabsTrigger value="statistics">Статистика</TabsTrigger>
            <TabsTrigger value="absences">Отпуска</TabsTrigger>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceSection userId={profile.id} />
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsSection userId={profile.id} />
          </TabsContent>

          <TabsContent value="absences">
            <AbsencesSection userId={profile.id} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSection profile={profile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
