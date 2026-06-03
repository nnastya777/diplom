"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Users, AlertCircle, Clock, RefreshCw } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { ru } from "date-fns/locale"

interface AttendanceMonitoringProps {
  department: string
}

export function AttendanceMonitoring({ department }: AttendanceMonitoringProps) {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")

  useEffect(() => {
    loadData()
  }, [department])

  const loadData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: employeesData } = await supabase
      .from("profiles")
      .select("*")
      .eq("department", department)
      .eq("is_active", true)
      .order("full_name")

    if (employeesData) {
      setEmployees(employeesData)

      const today = new Date()
      const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
      const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")

      const employeeIds = employeesData.map((e) => e.id)

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .in("user_id", employeeIds)
        .gte("date", weekStart)
        .lte("date", weekEnd)
        .order("date", { ascending: false })

      if (attendanceData) {
        setAttendanceData(attendanceData)
      }
    }

    setIsLoading(false)
  }

  const viewAttendanceDetails = (employee: any, date: string) => {
    const attendance = attendanceData.find((a: any) => a.user_id === employee.id && a.date === date)
    if (attendance && attendance.check_in) {
      setSelectedEmployee({ ...employee, attendance })
      setSelectedDate(date)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка данных о посещаемости...</p>
      </div>
    )
  }

  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd")
  const todayAttendance = attendanceData.filter((a) => a.date === todayStr)

  const presentToday = todayAttendance.filter((a) => a.check_in).length
  const lateToday = todayAttendance.filter((a) => a.status === "late").length
  const absentToday = employees.length - presentToday

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Мониторинг посещаемости</h2>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Обновить
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Users className="h-4 w-4" />
              Присутствуют сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{presentToday}</div>
            <p className="mt-1 text-xs text-slate-500">из {employees.length} сотрудников</p>
            <div className="mt-2 text-xs text-slate-600">
              {((presentToday / employees.length) * 100).toFixed(0)}% явка
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <AlertCircle className="h-4 w-4" />
              Опоздания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{lateToday}</div>
            <p className="mt-1 text-xs text-slate-500">сотрудников опоздали</p>
            <div className="mt-2 text-xs text-slate-600">
              {presentToday > 0 ? ((lateToday / presentToday) * 100).toFixed(0) : 0}% от присутствующих
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Calendar className="h-4 w-4" />
              Отсутствуют
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{absentToday}</div>
            <p className="mt-1 text-xs text-slate-500">сотрудников отсутствуют</p>
            <div className="mt-2 text-xs text-slate-600">
              {((absentToday / employees.length) * 100).toFixed(0)}% отсутствие
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Сегодняшние отметки
          </CardTitle>
          <CardDescription>Время прихода и ухода сотрудников за сегодня</CardDescription>
        </CardHeader>
        <CardContent>
          {todayAttendance.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Пока нет отметок за сегодня</p>
          ) : (
            <div className="space-y-2">
              {todayAttendance
                .filter((a) => a.check_in)
                .map((attendance) => {
                  const employee = employees.find((e) => e.id === attendance.user_id)
                  if (!employee) return null

                  const checkInTime = attendance.check_in
                  const checkOutTime = attendance.check_out
                  const isLate = attendance.status === "late"
                  const isEarlyDeparture = attendance.status === "early_departure"

                  return (
                    <div
                      key={attendance.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        isLate ? "border-yellow-200 bg-yellow-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${isLate ? "bg-yellow-500" : "bg-green-500"}`} />
                        <div>
                          <div className="font-medium text-slate-900">{employee.full_name}</div>
                          <div className="text-xs text-slate-500">{employee.position}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">
                            Приход: <span className={isLate ? "text-yellow-700" : "text-green-700"}>{checkInTime}</span>
                          </div>
                          {checkOutTime && (
                            <div className="text-sm text-slate-600">
                              Уход:{" "}
                              <span className={isEarlyDeparture ? "text-red-700" : "text-slate-700"}>
                                {checkOutTime}
                              </span>
                            </div>
                          )}
                        </div>
                        {isLate && <Badge variant="secondary">Опоздание</Badge>}
                        {isEarlyDeparture && <Badge variant="destructive">Ранний уход</Badge>}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Посещаемость за неделю
          </CardTitle>
          <CardDescription>Отметки сотрудников за текущую неделю (нажмите на ячейку для деталей)</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyAttendanceTable
            employees={employees}
            attendanceData={attendanceData}
            onCellClick={viewAttendanceDetails}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Детали посещаемости</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 font-semibold text-slate-900">Сотрудник</h4>
                <p className="text-slate-700">{selectedEmployee.full_name}</p>
                <p className="text-sm text-slate-600">{selectedEmployee.position}</p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-2 font-semibold text-slate-900">Дата</h4>
                <p className="text-slate-700">{format(new Date(selectedDate), "d MMMM yyyy, EEEE", { locale: ru })}</p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-3 font-semibold text-slate-900">Время</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Приход:</span>
                    <span className="font-medium text-slate-900">{selectedEmployee.attendance.check_in}</span>
                  </div>
                  {selectedEmployee.attendance.check_out && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Уход:</span>
                      <span className="font-medium text-slate-900">{selectedEmployee.attendance.check_out}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-600">Статус:</span>
                    <span className="font-medium text-slate-900">
                      {selectedEmployee.attendance.status === "on_time" && "Вовремя"}
                      {selectedEmployee.attendance.status === "late" && "Опоздание"}
                      {selectedEmployee.attendance.status === "early_departure" && "Ранний уход"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEmployee.attendance.notes && (
                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="mb-2 font-semibold text-slate-900">Заметки</h4>
                  <p className="text-sm text-slate-700">{selectedEmployee.attendance.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WeeklyAttendanceTable({ employees, attendanceData, onCellClick }: any) {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="p-3 text-left font-medium text-slate-900">Сотрудник</th>
            {weekDays.map((day) => (
              <th key={day.toISOString()} className="p-3 text-center font-medium text-slate-900">
                <div>{format(day, "EEE", { locale: ru })}</div>
                <div className="text-xs font-normal text-slate-500">{format(day, "d MMM")}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee: any) => (
            <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-3">
                <div className="font-medium text-slate-900">{employee.full_name}</div>
                <div className="text-xs text-slate-500">{employee.position}</div>
              </td>
              {weekDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd")
                const attendance = attendanceData.find((a: any) => a.user_id === employee.id && a.date === dayStr)
                const isFuture = day > today

                return (
                  <td
                    key={day.toISOString()}
                    className="p-3 text-center"
                    onClick={() => attendance?.check_in && onCellClick(employee, dayStr)}
                  >
                    {isFuture ? (
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
                        <span className="text-xs font-medium text-slate-300">—</span>
                      </div>
                    ) : attendance ? (
                      attendance.check_in ? (
                        <button
                          className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110 ${
                            attendance.status === "late"
                              ? "bg-yellow-100 hover:bg-yellow-200"
                              : "bg-green-100 hover:bg-green-200"
                          }`}
                          title={`${attendance.check_in}${attendance.check_out ? ` - ${attendance.check_out}` : ""}`}
                        >
                          <span
                            className={`text-xs font-medium ${
                              attendance.status === "late" ? "text-yellow-800" : "text-green-800"
                            }`}
                          >
                            {attendance.status === "late" ? "⏰" : "✓"}
                          </span>
                        </button>
                      ) : (
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                          <span className="text-xs font-medium text-red-800">✗</span>
                        </div>
                      )
                    ) : (
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <span className="text-xs font-medium text-slate-400">—</span>
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
