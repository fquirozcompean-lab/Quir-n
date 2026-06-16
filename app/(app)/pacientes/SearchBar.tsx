'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(sp.toString())
        if (value.trim()) params.set('q', value.trim())
        else params.delete('q')
        router.push(`/pacientes?${params.toString()}`)
      })
    }, 300)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className="relative mb-4">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Buscar paciente por nombre…"
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}
