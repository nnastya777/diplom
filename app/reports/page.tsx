import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile, checkRole } from "@/lib/auth/roles"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"

export default async function ReportsPage() {
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

  const hasAccess = await checkRole(["manager", "admin"])

  if (!hasAccess) {
    redirect("/dashboard")
  }

  return <ReportsDashboard profile={profile} />
}
