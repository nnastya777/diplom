"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/auth/roles"
import { DollarSign, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface PayrollReportsProps {
  profile: UserProfile
}

export function PayrollReports({ profile }: PayrollReportsProps) {
  const [filters, setFilters] = useState({
    month: format(new Date(), "yyyy-MM"),
    department: profile.role === "admin" ? "all" : profile.department,
    hourlyRate: "500",
    overtimeRate: "750",
  })
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateReport = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const startDate = `${filters.month}-01`
      const endDate =
        format(new Date(filters.month + "-01"), "yyyy-MM-") +
        new Date(
          new Date(filters.month + "-01").getFullYear(),
          new Date(filters.month + "-01").getMonth() + 1,
          0,
        ).getDate()

      let query = supabase.from("profiles").select("id, full_name, department, position")

      if (filters.department !== "all") {
        query = query.eq("department", filters.department)
      }

      const { data: employees } = await query

      if (!employees) return

      const { data: workHours } = await supabase
        .from("work_hours")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .in(
          "user_id",
          employees.map((e) => e.id),
        )

      const hourlyRate = Number.parseFloat(filters.hourlyRate)
      const overtimeRate = Number.parseFloat(filters.overtimeRate)

      const report = employees.map((employee) => {
        const empHours = workHours?.filter((h) => h.user_id === employee.id) || []

        const regularHours = empHours.reduce((sum, h) => sum + (h.regular_hours || 0), 0)
        const overtimeHours = empHours.reduce((sum, h) => sum + (h.overtime_hours || 0), 0)

        const regularPay = regularHours * hourlyRate
        const overtimePay = overtimeHours * overtimeRate
        const totalPay = regularPay + overtimePay

        return {
          ...employee,
          regularHours: regularHours.toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          regularPay: regularPay.toFixed(2),
          overtimePay: overtimePay.toFixed(2),
          totalPay: totalPay.toFixed(2),
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

    const headers = [
      "ФИО",
      "Должность",
      "Отдел",
      "Обычные часы",
      "Переработка",
      "Оплата (обычная)",
      "Оплата (переработка)",
      "Итого",
    ]
    const rows = reportData.map((row: any) => [
      row.full_name,
      row.position,
      row.department,
      row.regularHours,
      row.overtimeHours,
      row.regularPay,
      row.overtimePay,
      row.totalPay,
    ])

    const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `отчет_расчет_зп_${filters.month}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Расчет заработной платы
          </CardTitle>
          <CardDescription>Формирование отчета для расчета ЗП на основе отработанных часов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Месяц</Label>
                <Input
                  id="month"
                  type="month"
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: e.target.value })}
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
                <Label htmlFor="hourlyRate">Ставка/час (₽)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={filters.hourlyRate}
                  onChange={(e) => setFilters({ ...filters, hourlyRate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="overtimeRate">Переработка/час (₽)</Label>
                <Input
                  id="overtimeRate"
                  type="number"
                  value={filters.overtimeRate}
                  onChange={(e) => setFilters({ ...filters, overtimeRate: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={generateReport} disabled={isLoading} className="gap-2">
              <Filter className="h-4 w-4" />
              {isLoading ? "Расчет..." : "Рассчитать заработную плату"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Результаты расчета</CardTitle>
                <CardDescription>
                  Месяц: {format(new Date(filters.month + "-01"), "LLLL yyyy", { locale: ru })}
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
                    <th className="p-3 text-center font-semibold text-slate-900">Часы</th>
                    <th className="p-3 text-center font-semibold text-slate-900">Переработка</th>
                    <th className="p-3 text-right font-semibold text-slate-900">Оплата</th>
                    <th className="p-3 text-right font-semibold text-slate-900">Доп. оплата</th>
                    <th className="p-3 text-right font-semibold text-slate-900">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row: any) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="p-3 text-slate-900">{row.full_name}</td>
                      <td className="p-3 text-slate-600">{row.position}</td>
                      <td className="p-3 text-slate-600">{row.department}</td>
                      <td className="p-3 text-center font-medium text-blue-600">{row.regularHours}</td>
                      <td className="p-3 text-center font-medium text-orange-600">{row.overtimeHours}</td>
                      <td className="p-3 text-right font-medium text-slate-900">{row.regularPay} ₽</td>
                      <td className="p-3 text-right font-medium text-slate-900">{row.overtimePay} ₽</td>
                      <td className="p-3 text-right font-bold text-green-600">{row.totalPay} ₽</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={5} className="p-3 text-right font-semibold text-slate-900">
                      ИТОГО:
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {reportData
                        .reduce((sum: number, row: any) => sum + Number.parseFloat(row.regularPay), 0)
                        .toFixed(2)}{" "}
                      ₽
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {reportData
                        .reduce((sum: number, row: any) => sum + Number.parseFloat(row.overtimePay), 0)
                        .toFixed(2)}{" "}
                      ₽
                    </td>
                    <td className="p-3 text-right font-bold text-green-600">
                      {reportData
                        .reduce((sum: number, row: any) => sum + Number.parseFloat(row.totalPay), 0)
                        .toFixed(2)}{" "}
                      ₽
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
