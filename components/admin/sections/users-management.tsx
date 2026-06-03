"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Users, Plus, Search, Edit, Shield } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export function UsersManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, filterRole])

  const loadUsers = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.from("profiles").select("*").order("full_name")

    if (!error && data) {
      setUsers(data)
    }

    setIsLoading(false)
  }

  const filterUsers = () => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.position.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole)
    }

    setFilteredUsers(filtered)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Загрузка пользователей...</p>
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
                Управление пользователями
              </CardTitle>
              <CardDescription>{users.length} пользователей в системе</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить пользователя
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Создать нового пользователя</DialogTitle>
                  <DialogDescription>Заполните форму для регистрации нового сотрудника</DialogDescription>
                </DialogHeader>
                <AddUserForm
                  onSuccess={() => {
                    setIsDialogOpen(false)
                    loadUsers()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск по имени, email или должности..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Фильтр по роли" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="employee">Сотрудник</SelectItem>
                <SelectItem value="manager">Руководитель</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} onUpdate={loadUsers} />
            ))}
            {filteredUsers.length === 0 && (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-500">Пользователи не найдены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserCard({ user, onUpdate }: any) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const supabase = createClient()

  const initials = user.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabels: Record<string, string> = {
    employee: "Сотрудник",
    manager: "Руководитель",
    admin: "Администратор",
  }

  const handleToggleActive = async () => {
    const { error } = await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id)

    if (!error) {
      onUpdate()
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.photo_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-100 text-blue-600">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900">{user.full_name}</h4>
              <Badge variant={user.is_active ? "default" : "secondary"}>
                {user.is_active ? "Активен" : "Неактивен"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                {roleLabels[user.role]}
              </Badge>
            </div>

            <div className="mt-1 space-y-1 text-sm text-slate-600">
              <p>
                {user.position} • {user.department}
              </p>
              <p>{user.email}</p>
              <p>Принят: {format(new Date(user.hire_date), "d MMMM yyyy", { locale: ru })}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Изменить
          </Button>
          <Button variant={user.is_active ? "outline" : "default"} size="sm" onClick={handleToggleActive}>
            {user.is_active ? "Деактивировать" : "Активировать"}
          </Button>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>Изменение данных сотрудника</DialogDescription>
          </DialogHeader>
          <EditUserForm
            user={user}
            onSuccess={() => {
              setIsEditOpen(false)
              onUpdate()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddUserForm({ onSuccess }: any) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    position: "",
    department: "",
    hireDate: "",
    role: "employee",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Здесь нужно использовать Admin API для создания пользователя
    // Временное решение через регистрацию
    const tempPassword = Math.random().toString(36).slice(-8)

    try {
      const supabase = createClient()

      // В продакшене нужно использовать server-side admin функцию
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: formData.fullName,
            position: formData.position,
            department: formData.department,
            hire_date: formData.hireDate,
            role: formData.role,
          },
        },
      })

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error("[v0] Error creating user:", error)
      setError("Ошибка при создании пользователя")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="fullName">ФИО</Label>
          <Input
            id="fullName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="position">Должность</Label>
          <Input
            id="position"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="department">Отдел</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите отдел" />
            </SelectTrigger>
            <SelectContent>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="hireDate">Дата приема</Label>
          <Input
            id="hireDate"
            type="date"
            required
            value={formData.hireDate}
            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Роль</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Сотрудник</SelectItem>
              <SelectItem value="manager">Руководитель</SelectItem>
              <SelectItem value="admin">Администратор</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Создание..." : "Создать пользователя"}
        </Button>
      </div>
    </form>
  )
}

function EditUserForm({ user, onSuccess }: any) {
  const [formData, setFormData] = useState({
    fullName: user.full_name,
    position: user.position,
    department: user.department,
    role: user.role,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          position: formData.position,
          department: formData.department,
          role: formData.role,
        })
        .eq("id", user.id)

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      setError("Ошибка при обновлении данных")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="fullName">ФИО</Label>
          <Input
            id="fullName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="position">Должность</Label>
          <Input
            id="position"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="department">Отдел</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          <Label htmlFor="role">Роль</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Сотрудник</SelectItem>
              <SelectItem value="manager">Руководитель</SelectItem>
              <SelectItem value="admin">Администратор</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>
    </form>
  )
}
