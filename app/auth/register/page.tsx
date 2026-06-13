"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox" // ✅ Добавляем импорт
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    position: "",
    department: "",
    hireDate: "",
  })
  const [consent, setConsent] = useState(false) // ✅ Новое состояние для чекбокса
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    // ✅ Проверка согласия
    if (!consent) {
      setError("Вы должны дать согласие на обработку персональных данных")
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            position: formData.position,
            department: formData.department,
            hire_date: formData.hireDate,
            role: "employee",
          },
        },
      })

      if (error) throw error

      router.push("/auth/check-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Произошла ошибка при регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Система учета рабочего времени</h1>
          <p className="mt-2 text-slate-600">Школа г. Вологды</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Регистрация сотрудника</CardTitle>
            <CardDescription>Заполните форму для создания учетной записи</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">ФИО</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Иванов Иван Иванович"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ivanov@school.vologda.ru"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* ... остальные поля без изменений (должность, отдел, дата приема, пароли) ... */}

                {/* ✅ НОВЫЙ БЛОК С ЧЕКБОКСОМ */}
                <div className="flex items-start space-x-3 rounded-md border p-4">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    disabled={isLoading}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="consent" className="text-sm font-medium">
                      Я даю согласие на обработку моих персональных данных в соответствии с{" "}
                      <Link href="/privacy-policy" className="underline text-blue-600 hover:text-blue-500">
                        Политикой обработки персональных данных
                      </Link>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Согласие необходимо для создания учетной записи и учета рабочего времени.
                    </p>
                  </div>
                </div>

                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

                <Button type="submit" className="w-full" disabled={isLoading || !consent}>
                  {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-600">
                Уже есть учетная запись?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline"
                >
                  Войти
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}