"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Clock, LogIn, LogOut, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import ClientTime from "@/components/ClientTime"

interface AttendanceSectionProps {
  userId: string
}

export function AttendanceSection({ userId }: AttendanceSectionProps) {
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTodayAttendance()
  }, [userId])

  const loadTodayAttendance = async () => {
    const supabase = createClient()
    const today = format(new Date(), "yyyy-MM-dd")

    // ✅ Используем maybeSingle(), чтобы не падать, если записи нет
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle()

    setTodayAttendance(data)
  }

  const handleCheckIn = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const today = format(new Date(), "yyyy-MM-dd")
    const now = new Date().toISOString()

    try {
      // ✅ Сначала проверяем, есть ли уже запись
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle()

      if (existing) {
        // Обновляем существующую запись
        const { error } = await supabase
          .from("attendance")
          .update({ check_in: now, status: "present" })
          .eq("id", existing.id)
        if (error) throw error
      } else {
        // Создаём новую
        const { error } = await supabase.from("attendance").insert({
          user_id: userId,
          date: today,
          check_in: now,
          status: "present",
        })
        if (error) throw error
      }

      await loadTodayAttendance()
    } catch (error) {
      console.error("[v0] Error checking in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayAttendance) return
    setIsLoading(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    try {
      const { error } = await supabase
        .from("attendance")
        .update({ check_out: now })
        .eq("id", todayAttendance.id)

      if (error) throw error
      await loadTodayAttendance()
    } catch (error) {
      console.error("[v0] Error checking out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasCheckedIn = todayAttendance?.check_in
  const hasCheckedOut = todayAttendance?.check_out

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Текущее время
          </CardTitle>
          <CardDescription>
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: ru })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900">
              <ClientTime />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-green-600" />
              Отметить приход
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasCheckedIn ? (
              <div className="text-center">
                <p className="mb-2 text-sm text-slate-600">Вы отметили приход в:</p>
                <p className="text-2xl font-bold text-green-600">
                  {format(new Date(todayAttendance.check_in), "HH:mm")}
                </p>
              </div>
            ) : (
              <Button onClick={handleCheckIn} disabled={isLoading} className="w-full" size="lg">
                Отметить приход
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-600" />
              Отметить уход
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasCheckedOut ? (
              <div className="text-center">
                <p className="mb-2 text-sm text-slate-600">Вы отметили уход в:</p>
                <p className="text-2xl font-bold text-red-600">
                  {format(new Date(todayAttendance.check_out), "HH:mm")}
                </p>
              </div>
            ) : (
              <Button
                onClick={handleCheckOut}
                disabled={isLoading || !hasCheckedIn}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                {!hasCheckedIn ? "Сначала отметьте приход" : "Отметить уход"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            История посещений (последние 7 дней)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceHistory userId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}

function AttendanceHistory({ userId }: { userId: string }) {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    loadHistory()
  }, [userId])

  const loadHistory = async () => {
    const supabase = createClient()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .gte("date", format(sevenDaysAgo, "yyyy-MM-dd"))
      .order("date", { ascending: false })

    setHistory(data || [])
  }

  if (history.length === 0) {
    return <p className="text-center text-sm text-slate-500">Нет данных за последние 7 дней</p>
  }

  return (
    <div className="space-y-2">
      {history.map((record) => (
        <div key={record.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <div>
            <p className="font-medium text-slate-900">
              {format(new Date(record.date), "d MMMM yyyy, EEEE", { locale: ru })}
            </p>
            <div className="mt-1 flex gap-4 text-sm text-slate-600">
              <span>Приход: {record.check_in ? format(new Date(record.check_in), "HH:mm") : "—"}</span>
              <span>Уход: {record.check_out ? format(new Date(record.check_out), "HH:mm") : "—"}</span>
            </div>
          </div>
          <div>
            {record.status === "present" && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Присутствовал
              </span>
            )}
            {record.status === "late" && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Опоздание
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}