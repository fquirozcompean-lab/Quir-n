'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: '#16335c',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '0.5rem 1.25rem',
        fontSize: '0.82rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      Imprimir / Guardar PDF
    </button>
  )
}
