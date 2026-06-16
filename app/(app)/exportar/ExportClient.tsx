'use client'

import { useState } from 'react'

interface Patient { id: string; nombre: string; fecha_consulta: string | null }

export default function ExportClient({ patients }: { patients: Patient[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState<'json' | 'csv' | null>(null)

  const allSelected = selected.size === patients.length

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(patients.map(p => p.id)))
  }

  function toggle(id: string) {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  async function download(format: 'json' | 'csv') {
    setDownloading(format)
    const ids = selected.size === 0 || selected.size === patients.length
      ? 'all'
      : [...selected].join(',')
    const url = `/api/export?format=${format}&ids=${ids}`
    const a = document.createElement('a')
    a.href = url
    a.click()
    setTimeout(() => setDownloading(null), 1500)
  }

  const count = selected.size === 0 ? patients.length : selected.size

  return (
    <div className="space-y-4">
      {/* Acciones */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-teal text-sm font-semibold uppercase tracking-wide">Descargar expedientes</h3>
        <p className="text-xs text-muted">
          {selected.size === 0
            ? `Se exportarán todos los expedientes (${patients.length}).`
            : `Se exportarán ${count} expediente${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}.`}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => download('json')}
            disabled={!!downloading}
            className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal disabled:opacity-50 transition-colors"
          >
            {downloading === 'json' ? 'Descargando…' : '⬇ JSON (completo)'}
          </button>
          <button
            onClick={() => download('csv')}
            disabled={!!downloading}
            className="bg-teal text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {downloading === 'csv' ? 'Descargando…' : '⬇ CSV (Excel)'}
          </button>
        </div>
        <p className="text-xs text-muted">El JSON incluye consultas de seguimiento. El CSV incluye los datos principales del expediente.</p>
      </div>

      {/* Lista de pacientes */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-teal-light">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 accent-teal cursor-pointer"
          />
          <span className="text-xs font-semibold text-navy">
            {allSelected ? 'Quitar selección' : 'Seleccionar todos'}
          </span>
          <span className="ml-auto text-xs text-muted">{patients.length} pacientes</span>
        </div>
        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {patients.map(p => (
            <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-teal-light/50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                className="w-4 h-4 accent-teal cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-navy flex-1">{p.nombre}</span>
              {p.fecha_consulta && (
                <span className="text-xs text-muted flex-shrink-0">{p.fecha_consulta}</span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
