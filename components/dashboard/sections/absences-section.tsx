"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface AbsencesSectionProps {
  userId: string
}

export function AbsencesSection({ userId }: AbsencesSectionProps) {
  const [absences, setAbsences] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadAbsences()
  }, [userId])

  const loadAbsences = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from("absences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setAbsences(data || [])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Мои заявки на отпуск и больничные</CardTitle>
              <CardDescription>Подавайте заявки и отслеживайте их статус</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Новая заявка
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Подать заявку на отсутствие</DialogTitle>
                  <DialogDescription>Заполните форму для подачи заявки на отпуск или больничный</DialogDescription>
                </DialogHeader>
                <AbsenceForm
                  userId={userId}
                  onSuccess={() => {
                    setIsDialogOpen(false)
                    loadAbsences()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">У вас пока нет заявок</p>
            </div>
          ) : (
            <div className="space-y-3">
              {absences.map((absence) => (
                <AbsenceCard key={absence.id} absence={absence} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AbsenceCard({ absence }: { absence: any }) {
  const typeLabels: Record<string, string> = {
    vacation: "Отпуск",
    sick_leave: "Больничный",
    business_trip: "Командировка",
    unpaid_leave: "Отпуск без сохранения",
    other: "Другое",
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "На рассмотрении", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    approved: { label: "Одобрено", color: "bg-green-100 text-green-800", icon: CheckCircle },
    rejected: { label: "Отклонено", color: "bg-red-100 text-red-800", icon: XCircle },
    cancelled: { label: "Отменено", color: "bg-slate-100 text-slate-800", icon: XCircle },
  }

  const status = statusConfig[absence.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-slate-900">{typeLabels[absence.type]}</h4>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>
          <div className="mt-2 flex gap-6 text-sm text-slate-600">
            <span>С {format(new Date(absence.start_date), "d MMM", { locale: ru })}</span>
            <span>По {format(new Date(absence.end_date), "d MMM", { locale: ru })}</span>
            <span className="font-medium">
              {absence.days_count} {absence.days_count === 1 ? "день" : "дней"}
            </span>
          </div>
          {absence.reason && <p className="mt-2 text-sm text-slate-600">{absence.reason}</p>}
        </div>
      </div>
    </div>
  )
}

function AbsenceForm({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: "vacation",
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("absences").insert({
        user_id: userId,
        type: formData.type,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        status: "pending",
      })

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error("[v0] Error submitting absence:", error)
      setError("Ошибка при подаче заявки")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="type">Тип отсутствия</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacation">Отпуск</SelectItem>
            <SelectItem value="sick_leave">Больничный</SelectItem>
            <SelectItem value="business_trip">Командировка</SelectItem>
            <SelectItem value="unpaid_leave">Отпуск без сохранения зарплаты</SelectItem>
            <SelectItem value="other">Другое</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="startDate">Дата начала</Label>
          <Input
            id="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">Дата окончания</Label>
          <Input
            id="endDate"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reason">Причина (необязательно)</Label>
        <Textarea
          id="reason"
          placeholder="Укажите причину отсутствия..."
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={3}
        />
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Отправка..." : "Подать заявку"}
        </Button>
      </div>
    </form>
  )
}
