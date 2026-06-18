'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { importPatients, type PatientDraft } from './actions'

interface ExtractedPatient extends PatientDraft {
  _id: string
  _selected: boolean
}

function fieldLabel(key: string): string {
  const map: Record<string, string> = {
    fecha_nacimiento: 'Nacimiento',
    sexo: 'Sexo',
    telefono: 'Teléfono',
    ciudad: 'Ciudad',
    ocupacion: 'Ocupación',
    cronicos: 'Crónicos',
    quirurgicos: 'Quirúrgicos',
    alergicos: 'Alergias',
    medicamentos: 'Medicamentos',
    padecimiento: 'Padecimiento',
    dx_texto: 'Diagnóstico',
    tx_texto: 'Tratamiento',
  }
  return map[key] ?? key
}

const SHOW_KEYS: (keyof PatientDraft)[] = [
  'fecha_nacimiento', 'sexo', 'telefono', 'ciudad', 'ocupacion',
  'cronicos', 'alergicos', 'padecimiento', 'dx_texto', 'tx_texto',
]

export default function ImportClient() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [patients, setPatients] = useState<ExtractedPatient[]>([])
  const [processing, setProcessing] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [saving, startSave] = useTransition()
  const [saveResult, setSaveResult] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  async function handleFile(file: File) {
    setFileName(file.name)
    setProcessError(null)
    setPatients([])
    setSaveResult(null)
    setProcessing(true)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/import', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.error) { setProcessError(json.error); return }
      if (!json.patients?.length) { setProcessError('No se encontraron pacientes en el archivo.'); return }

      setPatients(json.patients.map((p: PatientDraft, i: number) => ({
        ...p,
        _id: String(i),
        _selected: true,
      })))
    } catch (e) {
      setProcessError(`Error de red: ${String(e)}`)
    } finally {
      setProcessing(false)
    }
  }

  function toggle(id: string) {
    setPatients(prev => prev.map(p => p._id === id ? { ...p, _selected: !p._selected } : p))
  }

  function remove(id: string) {
    setPatients(prev => prev.filter(p => p._id !== id))
  }

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSave() {
    const selected = patients.filter(p => p._selected)
    if (!selected.length) return
    startSave(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clean = selected.map(({ _id, _selected, ...rest }) => rest)
      const result = await importPatients(clean)
      if (result.error) {
        setSaveResult(`Error: ${result.error}`)
      } else {
        setSaveResult(`✓ ${result.saved} paciente${result.saved === 1 ? '' : 's'} importado${result.saved === 1 ? '' : 's'} correctamente`)
        setPatients([])
        setTimeout(() => router.push('/pacientes'), 1500)
      }
    })
  }

  const selected = patients.filter(p => p._selected)

  return (
    <div className="space-y-4 pb-10">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-teal transition-colors bg-card"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files[0]
          if (f) handleFile(f)
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <div className="text-3xl mb-2">📄</div>
        <p className="font-semibold text-navy text-sm">
          {processing ? 'Procesando…' : 'Arrastra un archivo o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-muted mt-1">Soporta PDF, Word (.docx) y Google Docs (.doc)</p>
        {fileName && !processing && (
          <p className="text-xs text-teal mt-2 font-medium">{fileName}</p>
        )}
      </div>

      {processing && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="animate-spin">⏳</span>
          Extrayendo información con IA…
        </div>
      )}

      {processError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {processError}
        </div>
      )}

      {patients.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} encontrado{patients.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted">Revisa y selecciona los que quieras guardar</p>
          </div>

          <div className="space-y-2">
            {patients.map(p => {
              const isOpen = expanded.has(p._id)
              const details = SHOW_KEYS.filter(k => p[k])
              return (
                <div
                  key={p._id}
                  className={`bg-card border rounded-xl overflow-hidden transition-colors ${p._selected ? 'border-teal' : 'border-border opacity-50'}`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={p._selected}
                      onChange={() => toggle(p._id)}
                      className="w-4 h-4 accent-teal flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">{p.nombre}</p>
                      <p className="text-xs text-muted">
                        {[p.sexo, p.fecha_nacimiento, p.ciudad].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {details.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(p._id)}
                          className="text-xs text-teal hover:underline px-2"
                        >
                          {isOpen ? 'Menos' : `+${details.length} campos`}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(p._id)}
                        className="text-xs text-red-400 hover:text-red-600 px-1"
                        title="Quitar de la lista"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {isOpen && details.length > 0 && (
                    <div className="px-4 pb-3 border-t border-border pt-2 space-y-1">
                      {details.map(k => (
                        <div key={k} className="text-xs">
                          <span className="text-muted font-medium">{fieldLabel(k)}: </span>
                          <span className="text-navy">{String(p[k]).slice(0, 200)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className="w-full bg-navy text-white font-semibold text-sm py-3 rounded-xl hover:bg-teal transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando…' : `Guardar ${selected.length} paciente${selected.length !== 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {saveResult && (
        <div className={`text-sm rounded-lg px-4 py-3 ${saveResult.startsWith('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveResult}
        </div>
      )}
    </div>
  )
}
