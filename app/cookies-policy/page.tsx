import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Политика использования файлов cookie",
}

export default function CookiesPolicyPage() {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Политика использования файлов cookie</h1>
      <div className="space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          <strong>Типы cookie на сайте:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Функциональные (обязательные):</strong> Обеспечивают работу системы (аутентификация, сохранение сессии).
          </li>
          <li>
            <strong>Аналитические (необязательные):</strong> Яндекс.Метрика / Google Analytics (для сбора статистики посещаемости).
          </li>
        </ul>
        <p>
          Вы можете отказаться от необязательных cookie в настройках браузера или через специальный баннер.
        </p>
      </div>

      {/* Кнопка возврата в кабинет */}
      <div className="mt-8">
        <Link href="/dashboard">
          <Button variant="outline">← Вернуться в личный кабинет</Button>
        </Link>
      </div>
    </div>
  )
}