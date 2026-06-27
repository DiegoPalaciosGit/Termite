'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/hojas', label: 'Hojas Viajeras' },
  { href: '/materiales', label: 'Materiales' },
  { href: '/costos', label: 'Costos' },
]

export default function AppNav() {
  const pathname = usePathname()
  return (
    <nav className="bg-white border-b border-gray-100 px-4 overflow-x-auto">
      <div className="flex min-w-max">
        {links.map(({ href, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
