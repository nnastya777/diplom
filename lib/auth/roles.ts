import { createClient } from "@/lib/supabase/server"

export type UserRole = "employee" | "manager" | "admin"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  position: string
  department: string
  role: UserRole
  photo_url?: string
  is_active: boolean
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    return null
  }

  return profile as UserProfile
}

export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    return false
  }

  return allowedRoles.includes(profile.role)
}

export async function requireRole(allowedRoles: UserRole[]) {
  const hasRole = await checkRole(allowedRoles)

  if (!hasRole) {
    throw new Error("Недостаточно прав доступа")
  }
}
