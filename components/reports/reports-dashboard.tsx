"use client"

import type { UserProfile } from "@/lib/auth/roles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AttendanceReports } from "./sections/attendance-reports"
import { WorkHoursReports } from "./sections/work-hours-reports"
import { AbsencesReports } from "./sections/absences-reports"
import { PayrollReports } from "./sections/payroll-reports"

interface ReportsDashboardProps {
  profile: UserProfile
}

export function ReportsDashboard({ profile }: ReportsDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Система отчетности</h1>
          <p className="mt-2 text-slate-600">Формирование и экспорт отчетов по рабочему времени</p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
            <TabsTrigger value="hours">Рабочие часы</TabsTrigger>
            <TabsTrigger value="absences">Отпуска</TabsTrigger>
            <TabsTrigger value="payroll">Расчет ЗП</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceReports profile={profile} />
          </TabsContent>

          <TabsContent value="hours">
            <WorkHoursReports profile={profile} />
          </TabsContent>

          <TabsContent value="absences">
            <AbsencesReports profile={profile} />
          </TabsContent>

          <TabsContent value="payroll">
            <PayrollReports profile={profile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
