import type { UserProfile } from "@/lib/auth/roles"
import { LogoutButton } from "@/components/auth/logout-button"
import { Bell, Menu, LayoutDashboard, Users, Settings, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface DashboardHeaderProps {
  profile: UserProfile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const isManager = profile.role === "manager" || profile.role === "admin"
  const isAdmin = profile.role === "admin"

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="hidden font-semibold text-slate-900 sm:inline-block">Учет времени</span>
          </div>

          <nav className="hidden items-center gap-1 lg:flex ml-6">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Мой кабинет
              </Link>
            </Button>
            {isManager && (
              <>
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/manager">
                    <Users className="h-4 w-4" />
                    Управление
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href="/reports">
                    <FileText className="h-4 w-4" />
                    Отчеты
                  </Link>
                </Button>
              </>
            )}
            {isAdmin && (
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/admin">
                  <Settings className="h-4 w-4" />
                  Администрирование
                </Link>
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.photo_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-100 text-blue-600">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col text-sm lg:flex">
              <span className="font-medium text-slate-900">{profile.full_name}</span>
              <span className="text-xs text-slate-500">{profile.position}</span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
