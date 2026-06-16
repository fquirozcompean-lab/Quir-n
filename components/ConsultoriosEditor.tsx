'use client'

import { useState } from 'react'
import type { Consultorio } from '@/lib/types'

const EMPTY: Consultorio = { hospital: '', consultorio: '', telefono: '', ciudad: '', estado: '' }

export function ConsultoriosEditor({ name, initial }: { name: string; initial: Record<string, Consultorio> }) {
  const [items, setItems] = useState<Record<string, Consultorio>>(initial)
  const [key, setKey] = useState('')
  const [draft, setDraft] = useState<Consultorio>(EMPTY)

  function add() {
    const k = key.trim()
    if (!k || !draft.hospital.trim()) return
    setItems({ ...items, [k]: draft })
    setKey('')
    setDraft(EMPTY)
  }
  function remove(k: string) {
    const rest = { ...items }
    delete rest[k]
    setItems(rest)
  }

  const cls = 'text-sm px-2.5 py-1.5 border border-border rounded-lg bg-white'

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="space-y-2 mb-3">
        {Object.entries(items).map(([k, c]) => (
          <div key={k} className="flex items-start justify-between gap-2 bg-teal-light rounded-lg px-3 py-2">
            <div className="text-sm">
              <p className="font-semibold text-navy">{k} — {c.hospital}</p>
              <p className="text-xs text-muted">{c.consultorio} · {c.telefono} · {c.ciudad}, {c.estado}</p>
            </div>
            <button type="button" onClick={() => remove(k)} className="text-muted hover:text-red-600 flex-shrink-0">×</button>
          </div>
        ))}
        {Object.keys(items).length === 0 && <p className="text-xs text-muted italic">Aún no agregas ningún consultorio.</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input value={key} onChange={e => setKey(e.target.value)} placeholder="Nombre corto (ej. Principal)" className={`${cls} col-span-2 sm:col-span-1`} />
        <input value={draft.hospital} onChange={e => setDraft({ ...draft, hospital: e.target.value })} placeholder="Hospital / Clínica" className={cls} />
        <input value={draft.consultorio} onChange={e => setDraft({ ...draft, consultorio: e.target.value })} placeholder="Consultorio / Torre" className={cls} />
        <input value={draft.telefono} onChange={e => setDraft({ ...draft, telefono: e.target.value })} placeholder="Teléfono" className={cls} />
        <input value={draft.ciudad} onChange={e => setDraft({ ...draft, ciudad: e.target.value })} placeholder="Ciudad" className={cls} />
        <input value={draft.estado} onChange={e => setDraft({ ...draft, estado: e.target.value })} placeholder="Estado" className={cls} />
      </div>
      <button type="button" onClick={add} className="mt-2 px-3 py-1.5 bg-teal text-white text-sm font-semibold rounded-lg hover:opacity-90">
        + Agregar consultorio
      </button>
    </div>
  )
}
