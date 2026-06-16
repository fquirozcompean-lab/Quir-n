'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallButton() {
  const [isStandalone, setIsStandalone] = useState(true)
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)
    if (standalone) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsStandalone(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone) return null

  return (
    <>
      <button
        onClick={async () => {
          if (prompt) {
            await prompt.prompt()
            const { outcome } = await prompt.userChoice
            if (outcome === 'accepted') setIsStandalone(true)
          } else {
            setShowGuide(true)
          }
        }}
        className="flex items-center gap-1.5 bg-teal text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v13M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20h16" strokeLinecap="round"/>
        </svg>
        Instalar app
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-white rounded-t-2xl p-6 w-full space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-extrabold text-navy text-lg">Instalar Quirón como app</h3>
            <p className="text-sm text-muted">Sigue estos pasos en Chrome:</p>
            <ol className="space-y-3 text-sm text-navy">
              <li className="flex gap-3">
                <span className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                <span>Si ya tienes un icono de Quirón en la pantalla de inicio, <strong>mantenlo presionado y elimínalo</strong> primero.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                <span>Toca los <strong>tres puntos ⋮</strong> en la esquina superior derecha de Chrome.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                <span>Toca <strong>"Agregar a la pantalla de inicio"</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">4</span>
                <span>Toca <strong>"Agregar"</strong> en el diálogo que aparece.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">5</span>
                <span>Abre la app recién instalada y verifica que el ícono <strong>no tiene el logo de Chrome</strong> encima — eso confirma que se instaló correctamente.</span>
              </li>
            </ol>
            <p className="text-xs text-muted bg-gray-50 rounded-lg p-3">
              Una vez instalada correctamente, Quirón aparecerá en el menú de compartir junto a WhatsApp, Gmail, etc.
            </p>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full bg-navy text-white font-semibold py-3 rounded-xl text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
