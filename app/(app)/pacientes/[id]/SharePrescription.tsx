'use client'

import { useState } from 'react'
import { createPrescriptionAction } from './prescriptionActions'

interface Props {
  patientId: string
}

export function SharePrescription({ patientId }: Props) {
  const [url, setUrl]         = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    const result = await createPrescriptionAction(patientId)
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

  return (
    <div className="border-t border-border pt-3 mt-1">
      {!url ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto bg-teal text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {loading ? 'Generando…' : '🔗 Compartir receta digital'}
        </button>
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
              href={`https://wa.me/?text=${encodeURIComponent(`Tu receta digital del Dr. Quiroz: ${url}`)}`}
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
          <button
            onClick={() => { setUrl(null); setError(null) }}
            className="text-xs text-muted hover:text-navy underline"
          >
            Generar nuevo link
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
