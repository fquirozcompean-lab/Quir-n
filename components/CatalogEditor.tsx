'use client'

import { useState } from 'react'

export function CatalogEditor({ name, initial, placeholder }: { name: string; initial: string[]; placeholder: string }) {
  const [items, setItems] = useState<string[]>(initial)
  const [draft, setDraft] = useState('')

  function add() {
    const val = draft.trim()
    if (!val || items.includes(val)) return
    setItems([...items, val])
    setDraft('')
  }
  function remove(item: string) {
    setItems(items.filter(i => i !== item))
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map(item => (
          <span key={item} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal text-white">
            {item}
            <button type="button" onClick={() => remove(item)} className="hover:opacity-70">×</button>
          </span>
        ))}
        {items.length === 0 && <p className="text-xs text-muted italic">Aún no agregas ninguno.</p>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white"
        />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-teal text-white text-sm font-semibold rounded-lg hover:opacity-90">
          + Agregar
        </button>
      </div>
    </div>
  )
}
