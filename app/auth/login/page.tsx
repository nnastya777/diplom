"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // 1. Получаем профиль пользователя
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Ошибка получения профиля:", profileError)
      }

      // 2. Если профиля нет — создаём его с ролью по умолчанию
      if (!profile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.email?.split("@")[0] || "Сотрудник",
          role: "employee",
          department: "Не указан",
          position: "Сотрудник",
          hire_date: new Date().toISOString().split("T")[0],
        })
      }

      // 3. Перенаправляем в зависимости от роли
      const role = profile?.role || "employee"
      
      if (role === "admin") {
        router.push("/admin")
      } else if (role === "manager") {
        router.push("/manager")
      } else {
        router.push("/dashboard")
      }
      
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Система учета рабочего времени</h1>
          <p className="mt-2 text-slate-600">Школа г. Вологды</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Вход в систему</CardTitle>
            <CardDescription>Введите ваши учетные данные для входа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ivanov@school.vologda.ru"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-600">
                Нет учетной записи?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline"
                >
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}