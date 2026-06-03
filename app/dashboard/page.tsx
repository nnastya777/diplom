import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/roles"
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  let profile = await getCurrentUserProfile()

  // Если профиля нет, создаём его
  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.email?.split("@")[0] || "Сотрудник",
      role: "employee", // По умолчанию
      department: "Не указан",
      position: "Сотрудник",
      hire_date: new Date().toISOString().split("T")[0],
    })
    profile = await getCurrentUserProfile()
  }

  // Если администратор зашёл на /dashboard — отправляем его на /admin
  if (profile.role === "admin") {
    redirect("/admin")
  }

  // Если менеджер зашёл на /dashboard — отправляем его на /manager
  if (profile.role === "manager") {
    redirect("/manager")
  }

  return <EmployeeDashboard profile={profile} />
}