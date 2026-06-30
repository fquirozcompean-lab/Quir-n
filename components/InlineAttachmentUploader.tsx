'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { registerAttachmentAction } from '@/app/(app)/subir/actions'

export interface AttachmentItem {
  id: string
  nombre_archivo: string
  tipo: string
  url: string
}

export default function InlineAttachmentUploader({
  patientId,
  initialAttachments = [],
}: {
  patientId: string
  initialAttachments?: AttachmentItem[]
}) {
  const [list, setList] = useState<AttachmentItem[]>(initialAttachments)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sesión expirada. Recarga la página.')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop() ?? 'bin'
    const storagePath = `${user.id}/${patientId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('estudios').upload(storagePath, file)
    if (uploadError) {
      setError(`Error de almacenamiento: ${uploadError.message}`)
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    const result = await registerAttachmentAction({
      patientId,
      filename: file.name,
      tipo: file.type.includes('pdf') ? 'PDF' : 'IMG',
      storagePath,
    })

    if (result?.error) {
      setError(result.error)
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    const { data: urlData } = await supabase.storage.from('estudios').createSignedUrl(storagePath, 3600)

    setList(prev => [{
      id: storagePath,
      nombre_archivo: file.name,
      tipo: file.type.includes('pdf') ? 'PDF' : 'IMG',
      url: urlData?.signedUrl ?? '',
    }, ...prev])

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-teal text-sm font-semibold uppercase tracking-wide">
          Documentos adjuntos
        </h3>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs font-semibold text-teal hover:underline disabled:opacity-50"
        >
          {uploading ? 'Subiendo…' : '+ Subir documento'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFile}
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-muted">Sin documentos adjuntos.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((att, i) => (
            <li key={att.id ?? i}>
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-teal hover:underline"
              >
                <span>{att.tipo === 'PDF' ? '📄' : '🖼️'}</span>
                {att.nombre_archivo}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
