'use client'

export default function PrintButton({ label = 'Imprimir / Guardar PDF' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-navy text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-teal transition-colors"
    >
      {label}
    </button>
  )
}
