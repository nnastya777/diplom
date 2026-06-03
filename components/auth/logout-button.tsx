"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()

    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading} className="gap-2">
      <LogOut className="h-4 w-4" />
      {isLoading ? "Выход..." : "Выйти"}
    </Button>
  )
}
