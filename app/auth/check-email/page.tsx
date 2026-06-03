import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Проверьте вашу почту</CardTitle>
            <CardDescription>Мы отправили письмо с подтверждением на ваш email адрес</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-sm text-slate-600">
              Пожалуйста, перейдите по ссылке в письме для активации учетной записи. После подтверждения вы сможете
              войти в систему.
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
