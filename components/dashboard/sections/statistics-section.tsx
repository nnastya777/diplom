"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, Clock, TrendingUp, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { ru } from "date-fns/locale"

interface StatisticsSectionProps {
  userId: string
}

export function StatisticsSection({ userId }: StatisticsSectionProps) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const now = new Date()
    const startDate = format(startOfMonth(now), "yyyy-MM-dd")
    const endDate = format(endOfMonth(now), "yyyy-MM-dd")

    try {
      const { data, error } = await supabase
        .rpc("get_employee_stats", {
          p_user_id: userId,
          p_start_date: startDate,
          p_end_date: endDate,
        })

      if (error) throw error

      // ✅ Важно: data — это объект, а не массив
      setStats(data)
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка статистики...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Нет данных за текущий месяц</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Статистика за {format(new Date(), "LLLL yyyy", { locale: ru })}
          </CardTitle>
          <CardDescription>Ваша рабочая активность за текущий месяц</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Calendar className="h-4 w-4" />
              Рабочих дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.present_days}</div>
            <p className="mt-1 text-xs text-slate-500">из {stats.total_days} дней месяца</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="h-4 w-4" />
              Отработано часов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.total_hours.toFixed(1)}</div>
            <p className="mt-1 text-xs text-slate-500">переработка: {stats.overtime_hours.toFixed(1)} ч</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <TrendingUp className="h-4 w-4" />
              Опозданий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.late_days}</div>
            <p className="mt-1 text-xs text-slate-500">{stats.late_days === 0 ? "Отлично!" : "За месяц"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Calendar className="h-4 w-4" />
              Отпуск/Больничный
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.vacation_days + stats.sick_days}</div>
            <p className="mt-1 text-xs text-slate-500">
              отпуск: {stats.vacation_days}, б/л: {stats.sick_days}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Процент посещаемости</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Присутствие</span>
                <span className="font-medium text-slate-900">
                  {((stats.present_days / stats.total_days) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${(stats.present_days / stats.total_days) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}