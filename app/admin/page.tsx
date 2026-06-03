import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/roles"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const profile = await getCurrentUserProfile()

  // Если профиля нет — это ошибка, но мы редиректим на главную
  if (!profile) {
    redirect("/dashboard")
  }

  // Проверяем, что пользователь — администратор
  if (profile.role !== "admin") {
    redirect("/dashboard")
  }

  return <AdminDashboard profile={profile} />
}