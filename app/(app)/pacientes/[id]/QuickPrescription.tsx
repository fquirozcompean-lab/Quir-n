'use client'

import { useState } from 'react'
import { ChipSelector } from '@/components/ChipSelector'
import { createQuickPrescriptionAction } from './prescriptionActions'

interface Props {
  patientId: string
  catEst: string[]
}

export function QuickPrescription({ patientId, catEst }: Props) {
  const [estudios, setEstudios] = useState<string[]>([])
  const [texto, setTexto] = useState('')
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    const result = await createQuickPrescriptionAction(patientId, estudios, texto)
    if ('error' in result && result.error) {
      setError(result.error)
    } else if ('token' in result && result.token) {
      setUrl(`${window.location.origin}/receta/${result.token}`)
    }
    setLoading(false)
  }

  async function handleCopy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function reset() {
    setUrl(null)
    setError(null)
    setEstudios([])
    setTexto('')
  }

  return (
    <div className="bg-card rounded-xl border border-border px-4 py-4">
      <h3 className="text-teal text-sm font-semibold uppercase tracking-wide mb-1">Generar receta</h3>
      <p className="text-xs text-muted mb-3">
        Para compartir una solicitud o indicaciones rápidas sin registrar una consulta completa.
      </p>

      {!url ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted font-semibold mb-1">Estudios solicitados</p>
            <ChipSelector catalog={catEst} selected={estudios} onChange={setEstudios} />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Indicaciones / solicitud</label>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={3}
              placeholder="Ej. Solicito biometría hemática, química sanguínea y EGO."
              className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto bg-teal text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? 'Generando…' : '🔗 Generar y compartir'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted font-medium">Link generado — válido 60 días:</p>
          <div className="flex gap-2 flex-wrap items-center">
            <input
              readOnly
              value={url}
              className="flex-1 min-w-0 text-xs px-3 py-2 border border-border rounded-lg bg-teal-light text-navy font-mono"
            />
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                copied ? 'bg-green text-white' : 'bg-navy text-white hover:bg-teal'
              }`}
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Aquí está tu solicitud: ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-green text-white hover:opacity-90 transition-opacity"
            >
              WhatsApp
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-teal-light text-navy hover:bg-border transition-colors"
            >
              Ver →
            </a>
          </div>
          <button onClick={reset} className="text-xs text-muted hover:text-navy underline">
            Generar otra
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
