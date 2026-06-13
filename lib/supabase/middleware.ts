import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1. Маршруты, доступные без входа (логин, регистрация)
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/error"]
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))

  // 2. Страницы политик — доступны всем (и без входа, и с входом)
  const policyRoutes = ["/privacy-policy", "/cookies-policy"]
  const isPolicyRoute = policyRoutes.some((route) => path.startsWith(route))

  // Если пользователь НЕ авторизован, и путь — НЕ публичный, и НЕ политика (и не корень) -> на вход
  if (!user && !isPublicRoute && !isPolicyRoute && path !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Если пользователь авторизован и пытается зайти на логин/регистрацию -> на дашборд
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // ✅ Авторизованные пользователи могут спокойно заходить на страницы политик (ничего не делаем)
  return supabaseResponse
}