import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Ошибка аутентификации</CardTitle>
            <CardDescription>Произошла ошибка при попытке входа в систему</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-sm text-slate-600">
              Пожалуйста, попробуйте войти снова или обратитесь к администратору системы.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Вернуться к входу</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
