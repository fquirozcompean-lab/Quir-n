'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Patient {
  id: string
  nombre: string
  telefono: string | null
}

const REVIEW_LINK = 'https://g.page/r/CUczEWK5B3LOEBM/review'

function buildWaUrl(p: Patient): string {
  const digits = (p.telefono ?? '').replace(/\D/g, '')
  const phone = digits.length === 10 ? `52${digits}` : digits.length >= 12 ? digits : null
  const msg = encodeURIComponent(
    `Estimado/a ${p.nombre}, fue un placer atenderle en consulta. Si cuenta con un momento, le agradecería mucho compartir su experiencia con una reseña: ${REVIEW_LINK}`
  )
  return phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`
}

export default function CierreClient({ patients, today }: { patients: Patient[]; today: string }) {
  const storageKey = `cierre_sent_${today}`
  const [sent, setSent] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]
    setSent(new Set(stored))
  }, [storageKey])

  function markSent(id: string) {
    setSent(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(storageKey, JSON.stringify([...next]))
      return next
    })
  }

  const withPhone    = patients.filter(p => p.telefono)
  const withoutPhone = patients.filter(p => !p.telefono)
  const sentCount    = withPhone.filter(p => sent.has(p.id)).length
  const allDone      = withPhone.length > 0 && sentCount === withPhone.length

  if (patients.length === 0) {
    return (
      <div className="text-center py-16 text-muted text-sm">
        No hay consultas registradas para hoy.
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Progress bar */}
      {withPhone.length > 0 && (
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-navy">
              {sentCount} de {withPhone.length} enviados
            </span>
            {allDone && (
              <span className="text-xs font-bold text-green-600">¡Listo por hoy!</span>
            )}
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(sentCount / withPhone.length) * 100}%`,
                background: allDone ? '#16a34a' : '#25d366',
              }}
            />
          </div>
        </div>
      )}

      {/* Patients with phone */}
      <div className="space-y-2">
        {withPhone.map(p => {
          const isSent = sent.has(p.id)
          return (
            <div
              key={p.id}
              className={`bg-card border rounded-xl px-4 py-3 flex items-center gap-3 transition-opacity ${isSent ? 'opacity-40' : 'border-border'}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{p.nombre}</p>
                <p className="text-xs text-muted">{p.telefono}</p>
              </div>
              {isSent ? (
                <span className="text-sm font-bold text-green-600 flex-shrink-0">✓ Enviado</span>
              ) : (
                <a
                  href={buildWaUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTimeout(() => markSent(p.id), 800)}
                  className="flex-shrink-0 text-sm font-bold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: '#25d366' }}
                >
                  Enviar
                </a>
              )}
            </div>
          )
        })}
      </div>

      {/* Patients without phone */}
      {withoutPhone.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted font-semibold px-1 mt-4">Sin teléfono — no se puede enviar</p>
          {withoutPhone.map(p => (
            <div key={p.id} className="bg-card border border-dashed border-border rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
              <p className="flex-1 text-sm font-semibold text-navy truncate">{p.nombre}</p>
              <Link href={`/pacientes/${p.id}/editar`} className="flex-shrink-0 text-xs text-teal hover:underline">
                Agregar tel.
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
