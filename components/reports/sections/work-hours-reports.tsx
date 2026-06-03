"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/auth/roles"
import { Clock, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { exportToCSV, exportToJSON, exportToExcel } from "@/lib/utils/export"

interface WorkHoursReportsProps {
  profile: UserProfile
}

export function WorkHoursReports({ profile }: WorkHoursReportsProps) {
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    department: profile.role === "admin" ? "all" : profile.department,
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

      const { data: workHours } = await supabase
        .from("work_hours")
        .select("*")
        .gte("date", filters.startDate)
        .lte("date", filters.endDate)
        .in(
          "user_id",
          employees.map((e) => e.id),
        )

      const report = employees.map((employee) => {
        const empHours = workHours?.filter((h) => h.user_id === employee.id) || []

        const regularHours = empHours.reduce((sum, h) => sum + (h.regular_hours || 0), 0)
        const overtimeHours = empHours.reduce((sum, h) => sum + (h.overtime_hours || 0), 0)
        const totalHours = empHours.reduce((sum, h) => sum + (h.total_hours || 0), 0)

        return {
          ...employee,
          regularHours: regularHours.toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          totalHours: totalHours.toFixed(2),
          workDays: empHours.length,
        }
      })

      setReportData(report)
    } catch (error) {
      console.error("[v0] Error generating report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!reportData) return
    const data = reportData.map((row: any) => ({
      ФИО: row.full_name,
      Должность: row.position,
      Отдел: row.department,
      "Рабочих дней": row.workDays,
      "Обычные часы": row.regularHours,
      Переработка: row.overtimeHours,
      "Всего часов": row.totalHours,
    }))
    exportToCSV(data, `отчет_рабочие_часы_${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const handleExportExcel = () => {
    if (!reportData) return
    const data = reportData.map((row: any) => ({
      ФИО: row.full_name,
      Должность: row.position,
      Отдел: row.department,
      "Рабочих дней": row.workDays,
      "Обычные часы": row.regularHours,
      Переработка: row.overtimeHours,
      "Всего часов": row.totalHours,
    }))
    exportToExcel(data, `отчет_рабочие_часы_${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const handleExportJSON = () => {
    if (!reportData) return
    exportToJSON(reportData, `отчет_рабочие_часы_${format(new Date(), "yyyy-MM-dd")}.json`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Отчет по рабочим часам
          </CardTitle>
          <CardDescription>Формирование отчета об отработанном времени сотрудников</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Результаты отчета</CardTitle>
                <CardDescription>
                  Период: {format(new Date(filters.startDate), "d MMM yyyy", { locale: ru })} -{" "}
                  {format(new Date(filters.endDate), "d MMM yyyy", { locale: ru })}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={handleExportJSON} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="p-3 text-left font-semibold">ФИО</th>
                    <th className="p-3 text-left font-semibold">Должность</th>
                    <th className="p-3 text-left font-semibold">Отдел</th>
                    <th className="p-3 text-center font-semibold">Рабочих дней</th>
                    <th className="p-3 text-center font-semibold">Обычные часы</th>
                    <th className="p-3 text-center font-semibold">Переработка</th>
                    <th className="p-3 text-center font-semibold">Всего часов</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row: any) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{row.full_name}</td>
                      <td className="p-3 text-muted-foreground">{row.position}</td>
                      <td className="p-3 text-muted-foreground">{row.department}</td>
                      <td className="p-3 text-center font-medium">{row.workDays}</td>
                      <td className="p-3 text-center font-medium text-blue-600">{row.regularHours}</td>
                      <td className="p-3 text-center font-medium text-orange-600">{row.overtimeHours}</td>
                      <td className="p-3 text-center font-medium text-green-600">{row.totalHours}</td>
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
