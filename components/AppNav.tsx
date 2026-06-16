'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/login/actions'
import InstallButton from './InstallButton'
import { DOCTOR } from '@/lib/doctor'

const BASE_NAV = [
  { href: '/pacientes', label: 'Pacientes'     },
  { href: '/subir',     label: 'Subir estudio' },
  { href: '/tablero',   label: 'Tablero'       },
]

const EXTRA_NAV = [
  { href: '/cierre',   label: 'Cierre del día' },
  { href: '/exportar', label: 'Exportar'       },
]

const NAV_ITEMS = [
  ...BASE_NAV,
  ...(DOCTOR.procedimiento.mostrar
    ? [{ href: DOCTOR.procedimiento.href, label: DOCTOR.procedimiento.label }]
    : []),
  ...EXTRA_NAV,
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <>
      <header className="bg-navy text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-10">
        <span className="font-extrabold text-lg tracking-tight">{DOCTOR.appName}</span>
        <span className="ml-auto text-xs opacity-80">{DOCTOR.nombreCorto}</span>
        <InstallButton />
        <form action={logoutAction} className="ml-3">
          <button
            type="submit"
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Salir
          </button>
        </form>
      </header>

      <nav className="bg-card border-b border-border px-2 py-1.5 flex gap-1 sticky top-[52px] z-10 overflow-x-auto">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex-none px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-teal text-white'
                  : 'text-muted hover:bg-teal-light hover:text-navy'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
