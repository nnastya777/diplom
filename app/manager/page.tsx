import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile, checkRole } from "@/lib/auth/roles"
import { ManagerDashboard } from "@/components/manager/manager-dashboard"

export default async function ManagerPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  const isManager = await checkRole(["manager", "admin"])

  if (!isManager) {
    redirect("/dashboard")
  }

  return <ManagerDashboard profile={profile} />
}
