import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Footer } from '@/components/footer' // ✅ импорт футера
import { CookieBanner } from '@/components/cookie-banner' // ✅ импорт cookie-баннера
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Система учета рабочего времени',
  description: 'Учет рабочего времени сотрудников школы г. Вологды',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`${geist.className} font-sans antialiased min-h-screen flex flex-col`}>
        <main className="flex-1">
          {children}
        </main>
        <Footer /> {/* ✅ футер внизу страницы */}
        <CookieBanner /> {/* ✅ баннер появляется при необходимости */}
        <Analytics />
      </body>
    </html>
  )
}