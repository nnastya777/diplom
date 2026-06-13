import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          <p>© {new Date().getFullYear()} МБОУ «СОШ №1» г. Вологды</p>
          <p>Адрес: г. Вологда, ул. Ленина, д. 10</p>
          <p>Контактный телефон: +7 (8172) ...</p>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/privacy-policy" className="font-medium underline underline-offset-4 hover:text-primary">
            Политика ПДн
          </Link>
          <Link href="/cookies-policy" className="font-medium underline underline-offset-4 hover:text-primary">
            Политика Cookie
          </Link>
        </nav>
      </div>
    </footer>
  )
}