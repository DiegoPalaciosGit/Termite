'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/portal', label: 'Mis pedidos', exact: true },
  { href: '/portal/notificaciones', label: 'Notificaciones', exact: false },
  { href: '/portal/compras', label: 'Mis compras', exact: false },
]

export default function PortalNav({ notifCount }: { notifCount: number }) {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-warm px-4 sticky top-[53px] z-10">
      <div className="max-w-2xl mx-auto flex gap-1 overflow-x-auto">
        {TABS.map(tab => {
          const active = tab.exact
            ? pathname === tab.href || pathname.startsWith('/portal/catalogo')
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative shrink-0 px-3 py-2.5 text-xs uppercase tracking-widest border-b-2 transition-colors ${
                active
                  ? 'border-terra text-terra font-medium'
                  : 'border-transparent text-dust hover:text-bark'
              }`}
            >
              {tab.label}
              {tab.href === '/portal/notificaciones' && notifCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center bg-terra text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
