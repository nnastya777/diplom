"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем, дал ли пользователь согласие
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="mx-auto max-w-3xl shadow-lg">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            Мы используем файлы cookie для улучшения работы сайта. Продолжая использовать сайт, вы соглашаетесь с{" "}
            <Link href="/cookies-policy" className="underline">Политикой cookie</Link> и{" "}
            <Link href="/privacy-policy" className="underline">Политикой ПДн</Link>.
          </p>
          <Button onClick={handleAccept} size="sm">
            Принять
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}