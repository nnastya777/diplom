"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Users, Mail, Phone, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface TeamOverviewProps {
  department: string
  managerId: string
}

export function TeamOverview({ department, managerId }: TeamOverviewProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEmployees()
  }, [department])

  const loadEmployees = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("department", department)
      .neq("id", managerId)
      .eq("is_active", true)
      .order("full_name")

    if (!error && data) {
      setEmployees(data)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка сотрудников...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Сотрудники отдела
              </CardTitle>
              <CardDescription>
                {employees.length} {employees.length === 1 ? "сотрудник" : "сотрудников"} в вашем отделе
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">В вашем отделе пока нет сотрудников</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EmployeeCard({ employee }: { employee: any }) {
  const initials = employee.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={employee.photo_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-100 text-lg text-blue-600">{initials}</AvatarFallback>
          </Avatar>

          <h3 className="mt-4 font-semibold text-slate-900">{employee.full_name}</h3>
          <p className="text-sm text-slate-600">{employee.position}</p>

          <Badge variant="secondary" className="mt-2">
            {employee.role === "employee" ? "Сотрудник" : employee.role}
          </Badge>

          <div className="mt-4 w-full space-y-2 text-left text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-4 w-4" />
              <span className="truncate">{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4" />
                <span>{employee.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>С {format(new Date(employee.hire_date), "d MMM yyyy", { locale: ru })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
