import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Политика обработки персональных данных</h1>
      <div className="space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          <strong>Оператор:</strong> МБОУ «Средняя общеобразовательная школа №1» г. Вологды.<br />
          <strong>Адрес:</strong> г. Вологда, ул. Ленина, д. 10.<br />
          <strong>Контактные данные:</strong> +7 (8172) ... , school@vologda.ru
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">1. Перечень обрабатываемых данных</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Фамилия, Имя, Отчество;</li>
          <li>Должность, табельный номер, дата приема на работу;</li>
          <li>Адрес электронной почты, номер телефона;</li>
          <li>Данные об отметках прихода/ухода (время, дата, статус);</li>
          <li>Данные об отсутствиях (отпуска, больничные, командировки);</li>
          <li>IP-адрес, данные cookie (для обеспечения работы и аналитики);</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6">2. Цели и основания обработки</h2>
        <p>
          Обработка осуществляется на основании Трудового кодекса РФ, ФЗ № 152-ФЗ «О персональных данных» и ФЗ № 273-ФЗ «Об образовании». 
          Цели: учет рабочего времени, кадровый учет, расчет заработной платы, обеспечение безопасности и контроля доступа.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">3. Трансграничная передача данных</h2>
        <p>
          Система использует облачную инфраструктуру Supabase (хостинг: США/ЕС). Передача данных за пределы РФ осуществляется с использованием стандартных договорных положений (SCC).
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">4. Срок хранения и отзыв согласия</h2>
        <p>
          Данные хранятся в течение всего периода трудовых отношений + 5 лет после увольнения. Вы вправе отозвать согласие, направив заявление на почту school@vologda.ru. 
          Отзыв может повлечь невозможность использования системы.
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