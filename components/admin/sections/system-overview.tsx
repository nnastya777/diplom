"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Users, UserCheck, Clock, AlertCircle, Calendar, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export function SystemOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    presentToday: 0,
    pendingAbsences: 0,
    totalDepartments: 0,
    avgAttendance: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: users } = await supabase.from("profiles").select("id, is_active")
    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", format(new Date(), "yyyy-MM-dd"))
    const { data: absences } = await supabase.from("absences").select("id").eq("status", "pending")

    const totalUsers = users?.length || 0
    const activeUsers = users?.filter((u) => u.is_active).length || 0
    const presentToday = attendance?.filter((a) => a.check_in).length || 0
    const pendingAbsences = absences?.length || 0

    const departments = new Set(users?.map((u: any) => u.department))
    const totalDepartments = departments.size

    const avgAttendance = activeUsers > 0 ? (presentToday / activeUsers) * 100 : 0

    setStats({
      totalUsers,
      activeUsers,
      presentToday,
      pendingAbsences,
      totalDepartments,
      avgAttendance,
    })

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка статистики системы...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Обзор системы</CardTitle>
          <CardDescription>Общая статистика на {format(new Date(), "d MMMM yyyy", { locale: ru })}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Users className="h-4 w-4" />
              Всего пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
            <p className="mt-1 text-xs text-slate-500">активных: {stats.activeUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <UserCheck className="h-4 w-4" />
              Присутствуют сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.presentToday}</div>
            <p className="mt-1 text-xs text-slate-500">из {stats.activeUsers} активных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <AlertCircle className="h-4 w-4" />
              Заявки на рассмотрении
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingAbsences}</div>
            <p className="mt-1 text-xs text-slate-500">требуют одобрения</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Calendar className="h-4 w-4" />
              Отделов в системе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalDepartments}</div>
            <p className="mt-1 text-xs text-slate-500">активных подразделений</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <TrendingUp className="h-4 w-4" />
              Процент посещаемости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.avgAttendance.toFixed(0)}%</div>
            <p className="mt-1 text-xs text-slate-500">в среднем сегодня</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="h-4 w-4" />
              Системное время
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{format(new Date(), "HH:mm")}</div>
            <p className="mt-1 text-xs text-slate-500">{format(new Date(), "EEEE", { locale: ru })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>Основные административные функции</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button className="flex flex-col items-start gap-2 rounded-lg border-2 border-slate-200 p-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
              <h4 className="font-semibold text-slate-900">Добавить сотрудника</h4>
              <p className="text-sm text-slate-600">Регистрация нового пользователя</p>
            </button>

            <button className="flex flex-col items-start gap-2 rounded-lg border-2 border-slate-200 p-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-50">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h4 className="font-semibold text-slate-900">Управление отделами</h4>
              <p className="text-sm text-slate-600">Создание и редактирование</p>
            </button>

            <button className="flex flex-col items-start gap-2 rounded-lg border-2 border-slate-200 p-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-50">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h4 className="font-semibold text-slate-900">Отчеты</h4>
              <p className="text-sm text-slate-600">Формирование и экспорт данных</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
