import { Metadata } from "next"
import Link from "next/link"

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
        <p className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">← Вернуться на главную</Link>
        </p>
      </div>
    </div>
  )
}