'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { calcAge, initials, formatDate } from '@/lib/utils'

interface Patient {
  id: string
  nombre: string
  sexo: string | null
  fecha_nacimiento: string | null
  fecha_consulta: string | null
  dx: string[] | null
  ciudad: string | null
}

const STORAGE_KEY = 'quiron_pacientes_ocultos'

export function PatientList({
  patients,
  countMap,
  showFecha,
  emptyMessage,
}: {
  patients: Patient[] | null
  countMap: Record<string, number>
  showFecha: boolean
  emptyMessage: string
}) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(localStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  function toggle() {
    const next = !hidden
    setHidden(next)
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-center gap-2 bg-teal-light text-navy text-sm font-semibold py-2.5 rounded-xl mb-3 hover:bg-border transition-colors"
      >
        {hidden ? '👁 Mostrar expedientes' : '🙈 Ocultar expedientes'}
      </button>

      {hidden ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted text-sm">
          Expedientes ocultos por privacidad. Pulsa &quot;Mostrar expedientes&quot; para verlos de nuevo.
        </div>
      ) : !patients || patients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map(p => {
            const isFemale = p.sexo === 'F'
            return (
              <Link
                key={p.id}
                href={`/pacientes/${p.id}`}
                className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3 hover:border-teal transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0 ${isFemale ? 'bg-accent' : 'bg-teal'}`}
                >
                  {initials(p.nombre)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy text-sm truncate">{p.nombre}</div>
                  <div className="text-xs text-muted">
                    {isFemale ? 'F' : p.sexo === 'M' ? 'M' : '—'} · {calcAge(p.fecha_nacimiento)}
                    {p.ciudad ? ` · ${p.ciudad}` : ''}
                    {p.dx?.[0] ? ` · ${p.dx[0]}` : ''}
                    {showFecha && p.fecha_consulta ? ` · ${formatDate(p.fecha_consulta)}` : ''}
                  </div>
                </div>
                <span className="text-xs bg-teal-light text-navy px-2.5 py-1 rounded-full flex-shrink-0">
                  {countMap[p.id] ?? 0} adj.
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
