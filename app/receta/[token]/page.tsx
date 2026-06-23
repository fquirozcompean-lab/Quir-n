import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Consultorio } from '@/lib/types'
import PrintButton from './PrintButton'

interface PrescriptionView {
  fecha: string
  paciente_nombre: string
  consultorio: string | null
  dx: string[] | null
  dx_texto: string | null
  tx: string[] | null
  tx_texto: string | null
  estudios: string[] | null
  doc_nombre: string
  doc_cedula_prof: string
  doc_cedula_esp: string | null
  doc_emergencias: string | null
  doc_email: string | null
  doc_logo_url: string | null
  doc_firma_url: string | null
  doc_consultorios: Record<string, Consultorio> | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .rpc('get_prescription_by_token', { p_token: token })
    .maybeSingle()
  const rx = data as PrescriptionView | null
  return {
    title: rx?.paciente_nombre
      ? `Receta — ${rx.paciente_nombre}`
      : 'Receta Digital',
  }
}

function formatDate(d: string | null) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(day)} de ${months[parseInt(m) - 1]} de ${y}`
}

export default async function RecetaPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: rxRaw } = await supabase
    .rpc('get_prescription_by_token', { p_token: token })
    .maybeSingle()

  const rx = rxRaw as PrescriptionView | null
  if (!rx) notFound()

  const consultorios = (rx.doc_consultorios ?? {}) as Record<string, Consultorio>
  const consultorio = rx.consultorio && consultorios[rx.consultorio]
    ? consultorios[rx.consultorio]
    : null

  const hasDx = ((rx.dx?.length ?? 0) > 0) || !!rx.dx_texto
  const hasTx = !!rx.tx_texto || ((rx.tx?.length ?? 0) > 0)
  const hasEstudios = (rx.estudios?.length ?? 0) > 0

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .rx-page { box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#e0f2f2 0%,#b2d8d8 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem' }}>

        {/* Print button */}
        <div className="no-print" style={{ width: '100%', maxWidth: '780px', display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <PrintButton />
        </div>

        {/* Prescription card */}
        <div className="rx-page" style={{
          width: '100%', maxWidth: '780px',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>

          {/* ── Header ── */}
          <div style={{
            background: 'linear-gradient(135deg,#e0f2f2 0%,#b2d8d8 100%)',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            {/* Left: patient info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#2e75b6', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Paciente</span>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#16335c' }}>{rx.paciente_nombre}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#2e75b6', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Fecha</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>{formatDate(rx.fecha)}</p>
              </div>
            </div>

            {/* Right: doctor logo */}
            {rx.doc_logo_url && (
              <div style={{ flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rx.doc_logo_url}
                  alt={rx.doc_nombre}
                  style={{ maxWidth: 260, maxHeight: 130, objectFit: 'contain', mixBlendMode: 'multiply' }}
                />
              </div>
            )}
          </div>

          {/* ── Divider line ── */}
          <div style={{ height: 3, background: 'linear-gradient(90deg,#2e75b6,#16335c)' }} />

          {/* ── Body ── */}
          <div style={{ padding: '1.75rem 2rem', minHeight: 340 }}>

            {/* Diagnóstico */}
            {hasDx && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Diagnóstico</p>
                {(rx.dx?.length ?? 0) > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: rx.dx_texto ? '0.5rem' : 0 }}>
                    {rx.dx!.map((d: string) => (
                      <span key={d} style={{ fontSize: '0.8rem', background: '#eef4fb', color: '#16335c', fontWeight: 600, padding: '0.2rem 0.75rem', borderRadius: 999, border: '1px solid #b2d8d8', fontFamily: 'Inter, sans-serif' }}>{d}</span>
                    ))}
                  </div>
                )}
                {rx.dx_texto && <p style={{ margin: 0, fontSize: '0.9rem', color: '#1f2a37', lineHeight: 1.6 }}>{rx.dx_texto}</p>}
              </div>
            )}

            {/* Rx medications */}
            {hasTx && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16335c', lineHeight: 1, fontFamily: 'Georgia, serif' }}>℞</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Tratamiento</span>
                </div>
                {rx.tx_texto ? (
                  <div style={{ paddingLeft: '0.5rem', borderLeft: '3px solid #2e75b6' }}>
                    {rx.tx_texto.split('\n').filter(Boolean).map((line: string, i: number) => (
                      <p key={i} style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#1f2a37', lineHeight: 1.6 }}>{line}</p>
                    ))}
                  </div>
                ) : (rx.tx?.length ?? 0) > 0 ? (
                  <div style={{ paddingLeft: '0.5rem', borderLeft: '3px solid #2e75b6' }}>
                    {rx.tx!.map((t: string) => (
                      <p key={t} style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', color: '#1f2a37', fontWeight: 600 }}>{t}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Estudios solicitados */}
            {hasEstudios && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Estudios solicitados</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {rx.estudios!.map((e: string) => (
                    <li key={e} style={{ fontSize: '0.9rem', color: '#1f2a37', marginBottom: '0.25rem' }}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {!hasDx && !hasTx && !hasEstudios && (
              <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.9rem' }}>Sin indicaciones registradas.</p>
            )}

            {/* Signature area */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'center', minWidth: 220 }}>
                {rx.doc_firma_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rx.doc_firma_url}
                    alt="Firma"
                    style={{ height: 90, objectFit: 'contain', mixBlendMode: 'multiply', display: 'block', margin: '0 auto' }}
                  />
                )}
                <div style={{ borderTop: '1.5px solid #374151', paddingTop: '0.4rem' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#16335c', fontFamily: 'Inter, sans-serif' }}>{rx.doc_nombre}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                    Cédula Prof. {rx.doc_cedula_prof}
                    {rx.doc_cedula_esp && <><br />Cédula Esp. {rx.doc_cedula_esp}</>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ background: '#16335c', color: 'white', padding: '1rem 2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {consultorio && (
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, fontFamily: 'Inter, sans-serif' }}>{consultorio.hospital}</p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>{consultorio.consultorio} · {consultorio.telefono}</p>
                </div>
              )}
              <div style={{ textAlign: 'right' }}>
                {rx.doc_emergencias && <p style={{ margin: 0, fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', opacity: 0.9 }}>Emergencias: {rx.doc_emergencias}</p>}
                {rx.doc_email && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', opacity: 0.7 }}>{rx.doc_email}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Expiry note */}
        <p className="no-print" style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
          Este link es válido por 60 días desde su generación.
        </p>
      </div>
    </>
  )
}
