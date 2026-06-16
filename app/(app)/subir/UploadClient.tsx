'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { matchPatient, matchPatientFromText, type PatientStub, type MatchResult } from '@/lib/matchPatient'
import { createPatientAndAttach, registerAttachmentAction } from './actions'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import ScannerModal from '@/components/ScannerModal'

async function extractPdfText(file: File): Promise<{ text: string; preview: string }> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const bytes = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
    const maxPages = Math.min(2, pdf.numPages)
    let allText = ''

    for (let p = 1; p <= maxPages; p++) {
      const page = await pdf.getPage(p)
      const content = await page.getTextContent()
      type TItem = { str: string; transform: number[] }
      const items = content.items as TItem[]
      items.sort((a, b) => {
        const dy = b.transform[5] - a.transform[5]
        if (Math.abs(dy) > 5) return dy
        return a.transform[4] - b.transform[4]
      })
      allText += items.map(i => i.str).join(' ') + '\n'
    }

    const text = allText.trim().slice(0, 5000)
    return { text, preview: text.slice(0, 400) }
  } catch (e) {
    return { text: '', preview: `Error al leer PDF: ${e}` }
  }
}

interface UploadClientProps {
  patients:            PatientStub[]
  sharedFileUrl?:      string | null
  sharedFileName?:     string | null
  sharedFileMime?:     string | null
  pendingPath?:        string | null
  quickUpload?:        boolean
  preselectedPatientId?: string | null
}

export default function UploadClient({
  patients,
  sharedFileUrl,
  sharedFileName,
  sharedFileMime,
  pendingPath,
  quickUpload,
  preselectedPatientId,
}: UploadClientProps) {
  const [dragOver, setDragOver]           = useState(false)
  const [file, setFile]                   = useState<File | null>(null)
  const [preview, setPreview]             = useState<string | null>(null)
  const [match, setMatch]                 = useState<MatchResult | null>(null)
  const [selectedId, setSelectedId]       = useState<string>(preselectedPatientId ?? '')
  const [patientSearch, setPatientSearch] = useState('')
  const [patientPicked, setPatientPicked] = useState<PatientStub | null>(
    preselectedPatientId ? (patients.find(p => p.id === preselectedPatientId) ?? null) : null
  )
  const [customName, setCustomName]       = useState('')
  const [creatingNew, setCreatingNew]     = useState(false)
  const [newPatientName, setNewPatientName] = useState('')
  const [ocrStatus, setOcrStatus]         = useState<'idle' | 'reading' | 'done'>('idle')
  const [extractedPreview, setExtractedPreview] = useState<string>('')
  const [status, setStatus]               = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage]             = useState('')
  const [donePatientId, setDonePatientId] = useState<string | null>(null)
  const [showScanner, setShowScanner]     = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const filteredPatients = patientSearch.length >= 1
    ? patients.filter(p => p.nombre.toLowerCase().includes(patientSearch.toLowerCase())).slice(0, 8)
    : []

  // Pre-selected patient from patient page
  useEffect(() => {
    if (!preselectedPatientId) return
    const found = patients.find(p => p.id === preselectedPatientId)
    if (found) {
      setPatientPicked(found)
      setSelectedId(found.id)
      setMatch({ patient: found, score: 1 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedPatientId])

  // Load file shared via Web Share Target
  useEffect(() => {
    if (!sharedFileUrl || !sharedFileName) return
    fetch(sharedFileUrl)
      .then(r => r.blob())
      .then(blob => handleFile(new File([blob], sharedFileName, { type: sharedFileMime ?? blob.type })))
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedFileUrl])

  // Load file from sessionStorage (FAB / ScannerModal)
  useEffect(() => {
    if (!quickUpload) return
    const raw = sessionStorage.getItem('quickUpload')
    if (!raw) return
    sessionStorage.removeItem('quickUpload')
    try {
      const { name, type, objectUrl, ocrText } = JSON.parse(raw)
      fetch(objectUrl)
        .then(r => r.blob())
        .then(blob => {
          URL.revokeObjectURL(objectUrl)
          const f = new File([blob], name, { type })
          if (ocrText) {
            applyOcrText(f, ocrText)
          } else {
            handleFile(f)
          }
        })
        .catch(() => {})
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickUpload])

  function applyOcrText(f: File, ocrText: string) {
    setFile(f)
    setStatus('idle'); setMessage(''); setDonePatientId(null)
    setCustomName(''); setCreatingNew(false); setNewPatientName('')
    setPatientSearch(''); setPreview(null)
    setExtractedPreview(ocrText.slice(0, 400))
    const textResult = matchPatientFromText(ocrText, patients)
    // Don't override a pre-selected patient
    if (!preselectedPatientId) {
      setMatch(textResult)
      setSelectedId(textResult.patient?.id ?? '')
      setPatientPicked(null)
    }
    setOcrStatus('done')
  }

  async function handleFile(f: File) {
    setFile(f)
    setStatus('idle'); setMessage(''); setDonePatientId(null)
    setCustomName(''); setCreatingNew(false); setNewPatientName('')
    setOcrStatus('idle'); setExtractedPreview('')
    setPatientSearch('')

    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }

    if (!preselectedPatientId) {
      setPatientPicked(null)
      const filenameResult = matchPatient(f.name, patients)
      setMatch(filenameResult)
      setSelectedId(filenameResult.patient?.id ?? '')

      if (f.type === 'application/pdf') {
        setOcrStatus('reading')
        try {
          const { text, preview } = await extractPdfText(f)
          setExtractedPreview(preview)
          if (text) {
            const textResult = matchPatientFromText(text, patients)
            if (textResult.patient && textResult.score >= (filenameResult.score ?? 0)) {
              setMatch(textResult)
              setSelectedId(textResult.patient.id)
            }
          }
        } catch { /* ignore */ }
        setOcrStatus('done')
        return
      }

      if (f.type.startsWith('image/')) {
        setOcrStatus('reading')
        try {
          const text = await runImageOcr(f)
          setExtractedPreview(text.slice(0, 400))
          if (text) {
            const textResult = matchPatientFromText(text, patients)
            const filenameScore = filenameResult.score ?? 0
            if (textResult.patient && textResult.score >= filenameScore) {
              setMatch(textResult)
              setSelectedId(textResult.patient.id)
            }
          }
        } catch { /* ignore */ }
        setOcrStatus('done')
      }
    }
  }

  async function runImageOcr(f: File): Promise<string> {
    const { createWorker } = await import('tesseract.js')
    const img = new window.Image()
    const url = URL.createObjectURL(f)
    await new Promise<void>(res => { img.onload = () => res(); img.src = url })
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
    canvas.getContext('2d')!.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    const worker = await createWorker('spa', 1, { logger: () => {} })
    const { data: { text } } = await worker.recognize(canvas)
    await worker.terminate()
    return text.trim().slice(0, 5000)
  }

  function handleScanDone(scannedFile: File, ocrText: string) {
    setShowScanner(false)
    applyOcrText(scannedFile, ocrText)
  }

  function handleCustomNameChange(val: string) {
    setCustomName(val)
    if (!preselectedPatientId) {
      const result = matchPatient(val, patients)
      setMatch(result)
      setSelectedId(result.patient?.id ?? '')
    }
  }

  // ── Upload: browser → Supabase Storage directly (no Vercel body limit) ──
  async function handleAttach(patientId: string) {
    if (!file) return
    setStatus('uploading')

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setStatus('error'); setMessage('Sesión expirada. Recarga la página.'); return }

    const ext  = file.name.split('.').pop() ?? 'bin'
    const finalName = customName.trim()
      ? `${customName.trim()}.${ext}`
      : file.name
    const finalFile = customName.trim()
      ? new File([file], finalName, { type: file.type })
      : file

    const storagePath = `${user.id}/${patientId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('estudios')
      .upload(storagePath, finalFile)

    if (uploadError) {
      setStatus('error')
      setMessage('Error al subir el archivo. Intenta de nuevo.')
      return
    }

    const result = await registerAttachmentAction({
      patientId,
      filename:    finalName,
      tipo:        file.type.includes('pdf') ? 'PDF' : 'IMG',
      storagePath,
      pendingPath: pendingPath ?? undefined,
    })

    if (result?.error) {
      setStatus('error')
      setMessage(result.error)
    } else {
      setStatus('done')
      setDonePatientId(patientId)
      setMessage('¡Listo! Archivo anexado correctamente.')
      setFile(null); setPreview(null); setMatch(null)
    }
  }

  async function handleCreateAndAttach() {
    if (!file || !newPatientName.trim()) return
    setStatus('uploading')
    const fd = new FormData()
    fd.append('nombre', newPatientName.trim())
    fd.append('file', file)
    const result = await createPatientAndAttach(fd)
    if (result?.error) {
      setStatus('error')
      setMessage(result.error)
    } else {
      setStatus('done')
      setDonePatientId(result?.patientId ?? null)
      setMessage('¡Expediente creado y estudio anexado!')
      setFile(null); setPreview(null); setMatch(null); setCreatingNew(false)
    }
  }

  const preselectedPatient = preselectedPatientId
    ? patients.find(p => p.id === preselectedPatientId)
    : null

  return (
    <div className="space-y-4">
      {showScanner && (
        <ScannerModal onDone={handleScanDone} onCancel={() => setShowScanner(false)} />
      )}

      {/* Botones de entrada */}
      {!sharedFileUrl && (
        <div className="flex gap-3 flex-wrap">
          <div
            role="button" tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className={`flex-1 min-w-[140px] border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-teal bg-teal-light' : 'border-teal bg-blue-50/30 hover:bg-teal-light/50'
            }`}
          >
            <p className="text-muted text-sm">📄 Archivo / PDF</p>
            <p className="text-xs text-muted mt-1">Arrastra o toca</p>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex-1 min-w-[140px] border-2 border-dashed border-teal rounded-xl p-6 text-center cursor-pointer bg-blue-50/30 hover:bg-teal-light/50 transition-colors"
          >
            <p className="text-muted text-sm">📷 Escanear</p>
            <p className="text-xs text-muted mt-1">Cámara + filtros</p>
          </button>
        </div>
      )}

      {sharedFileUrl && !file && (
        <p className="text-sm text-teal animate-pulse">Cargando archivo compartido…</p>
      )}

      {/* Banner de paciente pre-seleccionado */}
      {preselectedPatient && !file && (
        <div className="bg-teal-light border border-teal rounded-xl px-4 py-3 text-sm text-navy font-semibold">
          Paciente: {preselectedPatient.nombre}
        </div>
      )}

      {ocrStatus === 'reading' && (
        <p className="text-xs text-teal animate-pulse">
          {file?.type === 'application/pdf' ? 'Leyendo contenido del PDF…' : 'Reconociendo texto de la imagen…'}
        </p>
      )}

      {ocrStatus === 'done' && extractedPreview && (
        <details className="text-xs">
          <summary className="text-muted cursor-pointer hover:text-navy">Ver texto extraído</summary>
          <pre className="mt-1 whitespace-pre-wrap text-xs bg-gray-50 border border-border rounded-lg p-2 max-h-32 overflow-y-auto leading-relaxed">
            {extractedPreview}
          </pre>
        </details>
      )}

      {/* Match result */}
      {file && match && (
        <div className={`rounded-xl border p-4 space-y-3 ${match.patient ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          {preview && (
            <div className="w-full max-h-48 overflow-hidden rounded-lg border border-border">
              <Image src={preview} alt="Vista previa" width={600} height={300} className="w-full object-contain max-h-48" unoptimized />
            </div>
          )}

          <div>
            <label className="text-xs text-muted mb-1 block">
              Nombre del documento <span className="text-muted">(opcional)</span>
            </label>
            <input type="text" value={customName} onChange={e => handleCustomNameChange(e.target.value)}
              placeholder={file.name}
              className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal" />
          </div>

          {match.patient ? (
            <>
              <p className="text-sm font-semibold text-navy">
                ✓ Paciente: <span className="text-green">{match.patient.nombre}</span>
                {!preselectedPatientId && (
                  <span className="ml-2 text-xs text-muted font-normal">({Math.round(match.score * 100)}% coincidencia)</span>
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button disabled={status === 'uploading'} onClick={() => handleAttach(match.patient!.id)}
                  className="bg-green text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {status === 'uploading' ? 'Subiendo…' : `Anexar a ${match.patient.nombre.split(' ')[0]}`}
                </button>
                {!preselectedPatientId && (
                  <button onClick={() => { setMatch({ ...match, patient: null }); setSelectedId(''); setPatientPicked(null) }}
                    className="bg-teal-light text-navy text-sm font-semibold px-4 py-2 rounded-lg hover:bg-border transition-colors">
                    Es otro paciente
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-navy">Busca el paciente:</p>
          )}

          {/* Selección manual */}
          {!match.patient && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap items-start">
                <div className="flex-1 min-w-[200px] relative">
                  {patientPicked ? (
                    <div className="flex items-center gap-2 px-3 py-2 border border-teal rounded-lg bg-white text-sm">
                      <span className="flex-1 font-semibold text-navy">{patientPicked.nombre}</span>
                      <button type="button" onClick={() => { setPatientPicked(null); setSelectedId(''); setPatientSearch('') }}
                        className="text-muted hover:text-red-500 text-xs">✕</button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text" value={patientSearch}
                        onChange={e => setPatientSearch(e.target.value)}
                        placeholder="Escribe el nombre del paciente…"
                        className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                        autoFocus
                      />
                      {filteredPatients.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
                          {filteredPatients.map(p => (
                            <button key={p.id} type="button"
                              onClick={() => { setSelectedId(p.id); setPatientPicked(p); setPatientSearch('') }}
                              className="w-full text-left text-sm px-3 py-2.5 hover:bg-teal-light transition-colors border-b border-border last:border-0">
                              {p.nombre}
                            </button>
                          ))}
                        </div>
                      )}
                      {patientSearch.length >= 1 && filteredPatients.length === 0 && (
                        <p className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg text-sm text-muted px-3 py-2">
                          Sin resultados
                        </p>
                      )}
                    </>
                  )}
                </div>
                <button disabled={!selectedId || status === 'uploading'} onClick={() => handleAttach(selectedId)}
                  className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal disabled:opacity-40 transition-colors">
                  {status === 'uploading' ? 'Subiendo…' : 'Anexar'}
                </button>
              </div>

              <div className="border-t border-amber-200 pt-3">
                {!creatingNew ? (
                  <button type="button" onClick={() => {
                    const suggested = customName.trim() || file.name.replace(/\.[^.]+$/, '').replace(/[_\-]/g, ' ').trim()
                    setNewPatientName(suggested)
                    setCreatingNew(true)
                  }} className="text-sm font-semibold text-teal hover:underline">
                    + Crear expediente nuevo y anexar
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-navy">Nombre del nuevo paciente:</p>
                    <input value={newPatientName} onChange={e => setNewPatientName(e.target.value)}
                      placeholder="APELLIDO1 APELLIDO2 Nombre(s)"
                      className="w-full text-sm px-3 py-2 border border-teal rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                      autoFocus />
                    <div className="flex gap-2">
                      <button disabled={!newPatientName.trim() || status === 'uploading'} onClick={handleCreateAndAttach}
                        className="bg-teal text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity">
                        {status === 'uploading' ? 'Creando…' : 'Crear expediente y anexar'}
                      </button>
                      <button type="button" onClick={() => setCreatingNew(false)} className="text-sm text-muted hover:underline px-2">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'done' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-green">{message}</p>
          {donePatientId && (
            <a href={`/pacientes/${donePatientId}`} className="text-teal text-xs font-semibold mt-2 inline-block hover:underline">
              Ver expediente del paciente →
            </a>
          )}
        </div>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 px-4 py-3">{message}</p>
      )}
    </div>
  )
}
