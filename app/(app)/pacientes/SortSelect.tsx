'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: 'nombre_asc', label: 'Nombre (A-Z)' },
  { value: 'nombre_desc', label: 'Nombre (Z-A)' },
  { value: 'fecha_desc', label: 'Consulta más reciente' },
  { value: 'fecha_asc', label: 'Consulta más antigua' },
] as const

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const sp = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(sp.toString())
    if (value === 'nombre_asc') params.delete('sort')
    else params.set('sort', value)
    router.push(`/pacientes?${params.toString()}`)
  }

  return (
    <select
      value={defaultValue}
      onChange={e => handleChange(e.target.value)}
      className="text-sm px-3 py-2 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
