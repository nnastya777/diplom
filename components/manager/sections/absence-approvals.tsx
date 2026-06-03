"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { FileText, CheckCircle, XCircle, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface AbsenceApprovalsProps {
  department: string
  managerId: string
}

export function AbsenceApprovals({ department, managerId }: AbsenceApprovalsProps) {
  const [absences, setAbsences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAbsence, setSelectedAbsence] = useState<any>(null)

  useEffect(() => {
    loadAbsences()
  }, [department])

  const loadAbsences = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id")
      .eq("department", department)
      .neq("id", managerId)

    if (!profilesData) {
      setIsLoading(false)
      return
    }

    const employeeIds = profilesData.map((p) => p.id)

    const { data, error } = await supabase
      .from("absences")
      .select(`
        *,
        profiles:user_id (
          full_name,
          position,
          email
        )
      `)
      .in("user_id", employeeIds)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAbsences(data)
    }

    setIsLoading(false)
  }

  const handleApprove = async (absenceId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("absences")
      .update({
        status: "approved",
        approved_by: managerId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", absenceId)

    if (!error) {
      await loadAbsences()
      setSelectedAbsence(null)
    }
  }

  const handleReject = async (absenceId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("absences")
      .update({
        status: "rejected",
        approved_by: managerId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", absenceId)

    if (!error) {
      await loadAbsences()
      setSelectedAbsence(null)
    }
  }

  const pendingAbsences = absences.filter((a) => a.status === "pending")
  const processedAbsences = absences.filter((a) => a.status !== "pending")

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка заявок...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Заявки на рассмотрении
          </CardTitle>
          <CardDescription>
            {pendingAbsences.length} {pendingAbsences.length === 1 ? "заявка требует" : "заявок требуют"} вашего
            внимания
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">Нет заявок на рассмотрении</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAbsences.map((absence) => (
                <AbsenceRequestCard
                  key={absence.id}
                  absence={absence}
                  onApprove={() => handleApprove(absence.id)}
                  onReject={() => handleReject(absence.id)}
                  onView={() => setSelectedAbsence(absence)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            История заявок
          </CardTitle>
          <CardDescription>Обработанные заявки за последнее время</CardDescription>
        </CardHeader>
        <CardContent>
          {processedAbsences.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">Нет обработанных заявок</p>
          ) : (
            <div className="space-y-3">
              {processedAbsences.slice(0, 10).map((absence) => (
                <AbsenceHistoryCard key={absence.id} absence={absence} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAbsence} onOpenChange={() => setSelectedAbsence(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Детали заявки</DialogTitle>
            <DialogDescription>Подробная информация о заявке на отсутствие</DialogDescription>
          </DialogHeader>
          {selectedAbsence && (
            <AbsenceDetails
              absence={selectedAbsence}
              onApprove={() => handleApprove(selectedAbsence.id)}
              onReject={() => handleReject(selectedAbsence.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AbsenceRequestCard({ absence, onApprove, onReject, onView }: any) {
  const typeLabels: Record<string, string> = {
    vacation: "Отпуск",
    sick_leave: "Больничный",
    business_trip: "Командировка",
    unpaid_leave: "Отпуск без сохранения",
    other: "Другое",
  }

  return (
    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-slate-600" />
            <div>
              <h4 className="font-semibold text-slate-900">{absence.profiles?.full_name}</h4>
              <p className="text-sm text-slate-600">{absence.profiles?.position}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{typeLabels[absence.type]}</Badge>
            <Badge variant="outline">
              {format(new Date(absence.start_date), "d MMM", { locale: ru })} -{" "}
              {format(new Date(absence.end_date), "d MMM", { locale: ru })}
            </Badge>
            <Badge variant="outline">{absence.days_count} дней</Badge>
          </div>

          {absence.reason && <p className="mt-3 text-sm text-slate-700">Причина: {absence.reason}</p>}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={onApprove} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4" />
          Одобрить
        </Button>
        <Button onClick={onReject} size="sm" variant="destructive" className="gap-2">
          <XCircle className="h-4 w-4" />
          Отклонить
        </Button>
        <Button onClick={onView} size="sm" variant="outline">
          Подробнее
        </Button>
      </div>
    </div>
  )
}

function AbsenceHistoryCard({ absence }: any) {
  const typeLabels: Record<string, string> = {
    vacation: "Отпуск",
    sick_leave: "Больничный",
    business_trip: "Командировка",
    unpaid_leave: "Отпуск без сохранения",
    other: "Другое",
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    approved: { label: "Одобрено", color: "bg-green-100 text-green-800", icon: CheckCircle },
    rejected: { label: "Отклонено", color: "bg-red-100 text-red-800", icon: XCircle },
    cancelled: { label: "Отменено", color: "bg-slate-100 text-slate-800", icon: XCircle },
  }

  const status = statusConfig[absence.status] || statusConfig.approved
  const StatusIcon = status.icon

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-slate-900">{absence.profiles?.full_name}</h4>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="text-slate-600">{typeLabels[absence.type]}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              {format(new Date(absence.start_date), "d MMM", { locale: ru })} -{" "}
              {format(new Date(absence.end_date), "d MMM", { locale: ru })}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{absence.days_count} дней</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AbsenceDetails({ absence, onApprove, onReject }: any) {
  const typeLabels: Record<string, string> = {
    vacation: "Отпуск",
    sick_leave: "Больничный",
    business_trip: "Командировка",
    unpaid_leave: "Отпуск без сохранения",
    other: "Другое",
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 p-4">
        <h4 className="mb-2 font-semibold text-slate-900">Сотрудник</h4>
        <p className="text-slate-700">{absence.profiles?.full_name}</p>
        <p className="text-sm text-slate-600">{absence.profiles?.position}</p>
        <p className="text-sm text-slate-600">{absence.profiles?.email}</p>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h4 className="mb-2 font-semibold text-slate-900">Детали заявки</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Тип:</span>
            <span className="font-medium text-slate-900">{typeLabels[absence.type]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Период:</span>
            <span className="font-medium text-slate-900">
              {format(new Date(absence.start_date), "d MMM", { locale: ru })} -{" "}
              {format(new Date(absence.end_date), "d MMM", { locale: ru })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Количество дней:</span>
            <span className="font-medium text-slate-900">{absence.days_count}</span>
          </div>
        </div>
      </div>

      {absence.reason && (
        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="mb-2 font-semibold text-slate-900">Причина</h4>
          <p className="text-sm text-slate-700">{absence.reason}</p>
        </div>
      )}

      {absence.status === "pending" && (
        <div className="flex gap-3">
          <Button onClick={onApprove} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4" />
            Одобрить заявку
          </Button>
          <Button onClick={onReject} className="flex-1 gap-2" variant="destructive">
            <XCircle className="h-4 w-4" />
            Отклонить заявку
          </Button>
        </div>
      )}
    </div>
  )
}
