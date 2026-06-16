'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ScannerModal from '@/components/ScannerModal'

export default function QuickUploadFab() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen]         = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const router = useRouter()

  function navigateWithFile(file: File, ocrText = '') {
    const objectUrl = URL.createObjectURL(file)
    sessionStorage.setItem('quickUpload', JSON.stringify({
      name: file.name,
      type: file.type,
      objectUrl,
      ocrText,
    }))
    router.push('/subir?quick=1')
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) navigateWithFile(file)
    setOpen(false)
  }

  function handleScanDone(file: File, ocrText: string) {
    setShowScanner(false)
    navigateWithFile(file, ocrText)
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />

      {showScanner && (
        <ScannerModal onDone={handleScanDone} onCancel={() => setShowScanner(false)} />
      )}

      {/* Backdrop to close menu */}
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

      <div className="fixed bottom-6 right-5 z-20 flex flex-col items-end gap-2">
        {open && (
          <div className="flex flex-col items-end gap-2 mb-1">
            <button
              onClick={() => { setOpen(false); setShowScanner(true) }}
              className="flex items-center gap-2 bg-white border border-border rounded-full shadow-md px-4 py-2.5 text-sm font-semibold text-navy hover:bg-teal-light transition-colors whitespace-nowrap"
            >
              <span>📷</span> Escanear con cámara
            </button>
            <button
              onClick={() => { fileRef.current?.click(); setOpen(false) }}
              className="flex items-center gap-2 bg-white border border-border rounded-full shadow-md px-4 py-2.5 text-sm font-semibold text-navy hover:bg-teal-light transition-colors whitespace-nowrap"
            >
              <span>📄</span> Subir archivo
            </button>
          </div>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="bg-teal text-white rounded-full shadow-lg flex items-center gap-2 px-5 py-3.5 font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
          aria-label="Subir estudio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20h16" strokeLinecap="round"/>
          </svg>
          Subir estudio
        </button>
      </div>
    </>
  )
}
