"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/auth/roles"
import { Calendar, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface AbsencesReportsProps {
  profile: UserProfile
}

export function AbsencesReports({ profile }: AbsencesReportsProps) {
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    department: profile.role === "admin" ? "all" : profile.department,
    type: "all",
  })
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateReport = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      let query = supabase.from("profiles").select("id, full_name, department, position")

      if (filters.department !== "all") {
        query = query.eq("department", filters.department)
      }

      const { data: employees } = await query

      if (!employees) return

      let absencesQuery = supabase
        .from("absences")
        .select("*")
        .gte("start_date", filters.startDate)
        .lte("end_date", filters.endDate)
        .in(
          "user_id",
          employees.map((e) => e.id),
        )
        .eq("status", "approved")

      if (filters.type !== "all") {
        absencesQuery = absencesQuery.eq("type", filters.type)
      }

      const { data: absences } = await absencesQuery

      const report = employees.map((employee) => {
        const empAbsences = absences?.filter((a) => a.user_id === employee.id) || []

        return {
          ...employee,
          totalAbsences: empAbsences.length,
          totalDays: empAbsences.reduce((sum, a) => sum + a.days_count, 0),
          vacationDays: empAbsences.filter((a) => a.type === "vacation").reduce((sum, a) => sum + a.days_count, 0),
          sickDays: empAbsences.filter((a) => a.type === "sick_leave").reduce((sum, a) => sum + a.days_count, 0),
          businessTrips: empAbsences
            .filter((a) => a.type === "business_trip")
            .reduce((sum, a) => sum + a.days_count, 0),
        }
      })

      setReportData(report)
    } catch (error) {
      console.error("[v0] Error generating report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    const headers = ["ФИО", "Должность", "Отдел", "Всего заявок", "Всего дней", "Отпуск", "Больничный", "Командировки"]
    const rows = reportData.map((row: any) => [
      row.full_name,
      row.position,
      row.department,
      row.totalAbsences,
      row.totalDays,
      row.vacationDays,
      row.sickDays,
      row.businessTrips,
    ])

    const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `отчет_отпуска_${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Отчет по отпускам и больничным
          </CardTitle>
          <CardDescription>Формирование отчета об отсутствии сотрудников</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Отдел</Label>
                <Select
                  value={filters.department}
                  onValueChange={(value) => setFilters({ ...filters, department: value })}
                  disabled={profile.role !== "admin"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все отделы</SelectItem>
                    <SelectItem value="Администрация">Администрация</SelectItem>
                    <SelectItem value="Начальная школа">Начальная школа</SelectItem>
                    <SelectItem value="Математика">Математика</SelectItem>
                    <SelectItem value="Русский язык">Русский язык</SelectItem>
                    <SelectItem value="Иностранные языки">Иностранные языки</SelectItem>
                    <SelectItem value="Естественные науки">Естественные науки</SelectItem>
                    <SelectItem value="Физкультура">Физкультура</SelectItem>
                    <SelectItem value="Искусство">Искусство</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Тип отсутствия</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="vacation">Отпуск</SelectItem>
                    <SelectItem value="sick_leave">Больничный</SelectItem>
                    <SelectItem value="business_trip">Командировка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateReport} disabled={isLoading} className="gap-2">
              <Filter className="h-4 w-4" />
              {isLoading ? "Формирование..." : "Сформировать отчет"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Результаты отчета</CardTitle>
                <CardDescription>
                  Период: {format(new Date(filters.startDate), "d MMM yyyy", { locale: ru })} -{" "}
                  {format(new Date(filters.endDate), "d MMM yyyy", { locale: ru })}
                </CardDescription>
              </div>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Экспорт CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="p-3 text-left font-semibold text-slate-900">ФИО</th>
                    <th className="p-3 text-left font-semibold text-slate-900">Должность</th>
                    <th className="p-3 text-left font-semibold text-slate-900">Отдел</th>
                    <th className="p-3 text-center font-semibold text-slate-900">Заявок</th>
                    <th className="p-3 text-center font-semibold text-slate-900">Всего дней</th>
                    <th className="p-3 text-center font-semibold text-slate-900">Отпуск</th>
                    <th className="p-3 text-center font-semibold text-slate-900">Больничный</th>
                    <th className="p-3 text-center font-semibold text-slate-900">Командировки</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row: any) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="p-3 text-slate-900">{row.full_name}</td>
                      <td className="p-3 text-slate-600">{row.position}</td>
                      <td className="p-3 text-slate-600">{row.department}</td>
                      <td className="p-3 text-center font-medium text-slate-900">{row.totalAbsences}</td>
                      <td className="p-3 text-center font-medium text-blue-600">{row.totalDays}</td>
                      <td className="p-3 text-center font-medium text-green-600">{row.vacationDays}</td>
                      <td className="p-3 text-center font-medium text-orange-600">{row.sickDays}</td>
                      <td className="p-3 text-center font-medium text-purple-600">{row.businessTrips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
