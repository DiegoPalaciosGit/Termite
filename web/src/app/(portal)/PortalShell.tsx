'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'

const LINKS = [
  {
    href: '/portal',
    label: 'Mis pedidos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    href: '/portal/notificaciones',
    label: 'Notificaciones',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    href: '/portal/compras',
    label: 'Mis compras',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
]

export default function PortalShell({
  notifCount,
  children,
}: {
  notifCount: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-linen">

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-bark/40 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-60 bg-white border-r border-warm z-50 flex flex-col transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menú lateral"
      >
        <div className="flex items-center px-4 py-4 gap-3 border-b border-warm">
          <button
            onClick={() => setOpen(false)}
            className="text-umber hover:text-bark transition-colors p-1 -ml-1 shrink-0"
            aria-label="Cerrar menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/termita.svg" alt="Termite" width={44} height={44} />
          <span className="font-bold text-xl text-bark tracking-tight">termite</span>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {LINKS.map(({ href, label, icon }) => {
            const active = href === '/portal'
              ? pathname === '/portal' || pathname.startsWith('/portal/catalogo')
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 text-base font-medium transition-colors border-l-2 ${
                  active
                    ? 'border-terra text-bark bg-terra-light/50'
                    : 'border-transparent text-umber hover:text-bark hover:bg-linen'
                }`}
              >
                {icon}
                {label}
                {href === '/portal/notificaciones' && notifCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center bg-terra text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-warm">
          <form action={logout}>
            <button
              type="submit"
              className="text-lg font-bold text-dust hover:text-bark transition-colors uppercase tracking-widest"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Header */}
      <header className="bg-white border-b border-warm px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="text-umber hover:text-bark transition-colors p-1 -ml-1"
            aria-label="Abrir menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/termita.svg" alt="Termite" width={44} height={44} />
          <span className="font-bold text-xl text-bark tracking-tight">termite</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xl font-bold text-dust hover:text-bark transition-colors uppercase tracking-widest"
          >
            Salir
          </button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
