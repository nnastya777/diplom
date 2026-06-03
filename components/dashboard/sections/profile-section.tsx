import type { UserProfile } from "@/lib/auth/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, Building, Calendar, Shield } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface ProfileSectionProps {
  profile: UserProfile
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabels: Record<string, string> = {
    employee: "Сотрудник",
    manager: "Руководитель",
    admin: "Администратор",
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Профиль сотрудника</CardTitle>
          <CardDescription>Ваша личная информация и контактные данные</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.photo_url || "/placeholder.svg"} />
              <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{profile.full_name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {roleLabels[profile.role]}
                  </Badge>
                  {profile.is_active && (
                    <Badge variant="default" className="bg-green-600">
                      Активен
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="mt-1 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Email</p>
                    <p className="text-slate-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="mt-1 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Должность</p>
                    <p className="text-slate-900">{profile.position}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="mt-1 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Отдел</p>
                    <p className="text-slate-900">{profile.department}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Дата приема</p>
                    <p className="text-slate-900">
                      {format(new Date(profile.hire_date), "d MMMM yyyy", { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
