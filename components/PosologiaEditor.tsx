'use client'

import { useState } from 'react'

export function PosologiaEditor({ name, initial }: { name: string; initial: Record<string, string> }) {
  const [entries, setEntries] = useState<[string, string][]>(Object.entries(initial))
  const [medicamento, setMedicamento] = useState('')
  const [posologia, setPosologia] = useState('')

  function add() {
    const k = medicamento.trim()
    const v = posologia.trim()
    if (!k || !v) return
    setEntries([...entries.filter(([ek]) => ek !== k), [k, v]])
    setMedicamento('')
    setPosologia('')
  }
  function remove(key: string) {
    setEntries(entries.filter(([k]) => k !== key))
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(Object.fromEntries(entries))} />
      <div className="space-y-1.5 mb-2">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-sm bg-teal-light rounded-lg px-3 py-1.5">
            <span className="font-semibold text-navy flex-shrink-0">{k}:</span>
            <span className="text-gray-700 flex-1 truncate">{v}</span>
            <button type="button" onClick={() => remove(k)} className="text-muted hover:text-red-600 flex-shrink-0">×</button>
          </div>
        ))}
        {entries.length === 0 && <p className="text-xs text-muted italic">Sin posología predeterminada.</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={medicamento}
          onChange={e => setMedicamento(e.target.value)}
          placeholder="Medicamento"
          className="text-sm px-3 py-2 border border-border rounded-lg bg-white"
        />
        <div className="flex gap-2">
          <input
            value={posologia}
            onChange={e => setPosologia(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="Posología predeterminada"
            className="flex-1 text-sm px-3 py-2 border border-border rounded-lg bg-white"
          />
          <button type="button" onClick={add} className="px-3 py-1.5 bg-teal text-white text-sm font-semibold rounded-lg hover:opacity-90">
            + Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
