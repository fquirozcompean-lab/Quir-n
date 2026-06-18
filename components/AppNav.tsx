'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/login/actions'
import InstallButton from './InstallButton'
import type { Procedimiento } from '@/lib/types'

const BASE_NAV = [
  { href: '/pacientes', label: 'Pacientes'     },
  { href: '/subir',     label: 'Subir estudio' },
  { href: '/tablero',   label: 'Tablero'       },
]

const EXTRA_NAV = [
  { href: '/cierre',        label: 'Cierre del día'  },
  { href: '/exportar',      label: 'Exportar'        },
  { href: '/importar',      label: 'Importar'        },
  { href: '/configuracion', label: 'Configuración'   },
]

export default function AppNav({
  nombreCorto,
  procedimiento,
}: {
  nombreCorto: string
  procedimiento: Procedimiento | null
}) {
  const pathname = usePathname()

  const NAV_ITEMS = [
    ...BASE_NAV,
    ...(procedimiento?.mostrar
      ? [{ href: procedimiento.href, label: procedimiento.label }]
      : []),
    ...(procedimiento?.postquirurgico_mostrar
      ? [{ href: '/postoperatorio', label: procedimiento.postquirurgico_label ?? 'Postquirúrgico' }]
      : []),
    ...(procedimiento?.postcuidados_mostrar
      ? [{ href: '/postcuidados', label: procedimiento.postcuidados_label ?? 'Cuidados post' }]
      : []),
    ...EXTRA_NAV,
  ]

  return (
    <>
      <header className="bg-navy text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-10">
        <span className="font-extrabold text-lg tracking-tight">Quirón</span>
        <span className="ml-auto text-xs opacity-80">{nombreCorto}</span>
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
