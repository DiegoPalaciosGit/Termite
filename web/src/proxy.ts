import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const WORKER_BLOCKED = ['/costos', '/clientes', '/usuarios']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = path === '/login' || path === '/' || path === '/set-password'
  const role = (user?.user_metadata?.role as string) ?? 'worker'

  // Sin sesión → login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Con sesión en página pública → redirect según rol
  if (user && isPublic) {
    const dest = role === 'client' ? '/portal' : '/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Cliente solo puede acceder a /portal/*
  if (user && role === 'client' && !path.startsWith('/portal')) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // Worker bloqueado de rutas admin
  if (user && role === 'worker' && WORKER_BLOCKED.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
