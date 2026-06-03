"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Building, Users } from "lucide-react"

export function DepartmentsManagement() {
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: users } = await supabase.from("profiles").select("department, is_active").eq("is_active", true)

    if (users) {
      const deptMap = new Map()

      users.forEach((user: any) => {
        if (!deptMap.has(user.department)) {
          deptMap.set(user.department, { name: user.department, count: 0 })
        }
        deptMap.set(user.department, {
          ...deptMap.get(user.department),
          count: deptMap.get(user.department).count + 1,
        })
      })

      setDepartments(Array.from(deptMap.values()))
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка отделов...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Управление отделами
          </CardTitle>
          <CardDescription>{departments.length} активных подразделений</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card key={dept.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900">{dept.name}</h4>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{dept.count} сотрудников</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
