"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, Clock, Calendar, Award } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { ru } from "date-fns/locale"

interface TeamStatisticsProps {
  department: string
}

export function TeamStatistics({ department }: TeamStatisticsProps) {
  const [statistics, setStatistics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [department])

  const loadStatistics = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: employees } = await supabase
      .from("profiles")
      .select("id, full_name, position")
      .eq("department", department)
      .eq("is_active", true)

    if (!employees) {
      setIsLoading(false)
      return
    }

    const now = new Date()
    const startDate = format(startOfMonth(now), "yyyy-MM-dd")
    const endDate = format(endOfMonth(now), "yyyy-MM-dd")

    const statsPromises = employees.map(async (employee) => {
      const { data } = await supabase.rpc("get_employee_stats", {
        p_user_id: employee.id,
        p_start_date: startDate,
        p_end_date: endDate,
      })

      return {
        ...employee,
        stats: data && data.length > 0 ? data[0] : null,
      }
    })

    const results = await Promise.all(statsPromises)
    setStatistics(results.filter((r) => r.stats))
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка статистики команды...</p>
      </div>
    )
  }

  const totalHours = statistics.reduce((sum, s) => sum + (s.stats?.total_hours || 0), 0)
  const avgAttendance =
    statistics.length > 0 ? statistics.reduce((sum, s) => sum + (s.stats?.present_days || 0), 0) / statistics.length : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="h-4 w-4" />
              Всего часов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalHours.toFixed(0)}</div>
            <p className="mt-1 text-xs text-slate-500">отработано командой</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <TrendingUp className="h-4 w-4" />
              Средняя посещаемость
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{avgAttendance.toFixed(1)}</div>
            <p className="mt-1 text-xs text-slate-500">дней на сотрудника</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Calendar className="h-4 w-4" />
              Активных сотрудников
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{statistics.length}</div>
            <p className="mt-1 text-xs text-slate-500">в отделе</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Award className="h-4 w-4" />
              Процент присутствия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {statistics.length > 0 ? ((avgAttendance / (statistics[0]?.stats?.total_days || 1)) * 100).toFixed(0) : 0}
              %
            </div>
            <p className="mt-1 text-xs text-slate-500">в среднем по команде</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Рейтинг сотрудников</CardTitle>
          <CardDescription>Статистика за {format(new Date(), "LLLL yyyy", { locale: ru })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics
              .sort((a, b) => (b.stats?.present_days || 0) - (a.stats?.present_days || 0))
              .map((employee, index) => (
                <div key={employee.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{employee.full_name}</h4>
                    <p className="text-sm text-slate-600">{employee.position}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">{employee.stats?.present_days || 0} дней</div>
                    <div className="text-sm text-slate-600">{employee.stats?.total_hours?.toFixed(1) || 0} часов</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
