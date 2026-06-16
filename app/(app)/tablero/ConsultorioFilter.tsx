'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const OPTS = [
  { v: '', label: 'Todos' },
  { v: 'Angeles', label: 'Ángeles' },
  { v: 'Muguerza', label: 'Muguerza' },
]

export function ConsultorioFilter({ current }: { current: string }) {
  const router = useRouter()
  const [, start] = useTransition()

  return (
    <div className="flex gap-2 flex-wrap">
      {OPTS.map(o => (
        <button
          key={o.v}
          onClick={() => start(() => router.push(o.v ? `/tablero?c=${o.v}` : '/tablero'))}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            current === o.v ? 'bg-navy text-white' : 'bg-teal-light text-navy hover:bg-border'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
