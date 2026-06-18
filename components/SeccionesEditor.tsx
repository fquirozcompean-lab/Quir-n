'use client'

import { useState } from 'react'
import type { ProcedimientoSeccion } from '@/lib/types'

const cls = 'w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-white'

export function SeccionesEditor({ name, initial }: { name: string; initial: ProcedimientoSeccion[] }) {
  const [secciones, setSecciones] = useState<ProcedimientoSeccion[]>(initial)

  function add() {
    setSecciones(s => [...s, { titulo: '', contenido: '' }])
  }

  function remove(i: number) {
    setSecciones(s => s.filter((_, j) => j !== i))
  }

  function update(i: number, field: keyof ProcedimientoSeccion, value: string) {
    setSecciones(s => s.map((sec, j) => j === i ? { ...sec, [field]: value } : sec))
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(secciones)} />
      <p className="text-xs text-muted">
        Usa <code className="bg-gray-100 px-1 rounded">{'{nombre}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{fecha}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{hora}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{fecha_anterior}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{hora_prep_inicio}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{hora_prep_fin}'}</code> como variables dinámicas.
      </p>
      {secciones.map((sec, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-white">
          <div className="flex items-center gap-2">
            <input
              value={sec.titulo}
              onChange={e => update(i, 'titulo', e.target.value)}
              placeholder="Título de la sección"
              className={cls}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
              title="Eliminar sección"
            >
              ×
            </button>
          </div>
          <textarea
            value={sec.contenido}
            onChange={e => update(i, 'contenido', e.target.value)}
            placeholder="Contenido de la sección…"
            rows={4}
            className={cls + ' resize-y'}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-teal font-semibold hover:underline"
      >
        + Agregar sección
      </button>
    </div>
  )
}
