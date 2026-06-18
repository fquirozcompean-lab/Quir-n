'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ProcedimientoSeccion } from '@/lib/types'

interface Props {
  tipo: 'pre' | 'post'
  procedimientoLabel: string
  tituloHoja: string
  secciones: ProcedimientoSeccion[]
  prepInicioOffset?: number
  prepFinOffset?: number
  patientId: string | null
  patientName: string | null
  patientPhone: string | null
  doctorNombre: string
  cedulaProf: string
  cedulaEsp: string | null
  emergencias: string | null
  logoUrl: string | null
  firmaUrl: string | null
}

function prevDay(d: string) {
  const dt = new Date(d + 'T12:00:00')
  dt.setDate(dt.getDate() - 1)
  return dt.toISOString().slice(0, 10)
}

function fmtFull(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(day)} de ${months[parseInt(m)-1]} de ${y}`
}

function addHours(timeStr: string, hours: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + hours * 60
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function applyPlaceholders(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), text)
}

export default function ProcedimientoClient({
  tipo, procedimientoLabel, tituloHoja, secciones,
  prepInicioOffset = -6, prepFinOffset = -4,
  patientId, patientName, patientPhone,
  doctorNombre, cedulaProf, cedulaEsp, emergencias, logoUrl, firmaUrl,
}: Props) {
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('09:00')
  const [ready, setReady] = useState(false)
  const [nombre, setNombre] = useState('')

  const displayName = patientName ?? nombre
  const prev = fecha ? prevDay(fecha) : ''

  const vars: Record<string, string> = {
    nombre: displayName,
    fecha: fmtFull(fecha),
    hora,
    fecha_anterior: fmtFull(prev),
    hora_prep_inicio: fecha && hora ? addHours(hora, prepInicioOffset) : '',
    hora_prep_fin: fecha && hora ? addHours(hora, prepFinOffset) : '',
  }

  const phone = (() => {
    const d = (patientPhone ?? '').replace(/\D/g, '')
    return d.length === 10 ? `52${d}` : d.length >= 12 ? d : null
  })()

  const waText = [
    `Instrucciones — ${tituloHoja}`,
    displayName && `Paciente: ${displayName}`,
    fecha && tipo === 'pre' && `Fecha del procedimiento: ${fmtFull(fecha)} · ${hora}hrs`,
    fecha && tipo === 'post' && `Fecha: ${fmtFull(fecha)}`,
    '',
    ...secciones.map(s => `— ${applyPlaceholders(s.titulo, vars)} —\n${applyPlaceholders(s.contenido, vars)}`),
    emergencias && `\nDudas por WhatsApp: ${emergencias}`,
  ].filter(Boolean).join('\n')

  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(waText)}`
    : `https://wa.me/?text=${encodeURIComponent(waText)}`

  const canGenerate = tipo === 'pre' ? (!!fecha && !!displayName) : !!displayName

  if (secciones.length === 0) {
    return (
      <div className="space-y-4 pb-10">
        {patientId && (
          <Link href={`/pacientes/${patientId}`} className="text-teal text-sm font-semibold hover:underline">
            ← {patientName}
          </Link>
        )}
        <h2 className="text-lg font-extrabold text-navy">{tituloHoja}</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-sm text-amber-800">
          No hay secciones configuradas todavía.{' '}
          <Link href="/configuracion" className="font-semibold underline">Ir a Configuración</Link>{' '}
          para agregar las instrucciones.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-10">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, nav { display: none !important; }
          @page { margin: 8mm; size: A4; }
          body { padding: 0 !important; }
          .proc-card { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
          .proc-header { padding: 0.6rem 1.2rem !important; }
          .proc-content { padding: 0.6rem 1.2rem !important; }
          .proc-sec { margin-bottom: 7px !important; }
          .proc-sec-title { padding: 2px 8px !important; font-size: 11px !important; }
          .proc-sec-body { padding: 5px 10px !important; font-size: 11.5px !important; }
          .proc-firma { padding: 0 1.2rem 0.6rem !important; }
          .proc-card, .proc-card * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {patientId && (
        <div className="no-print flex items-center gap-2">
          <Link href={`/pacientes/${patientId}`} className="text-teal text-sm font-semibold hover:underline">
            ← {patientName}
          </Link>
        </div>
      )}
      <h2 className="no-print text-lg font-extrabold text-navy">{tituloHoja}</h2>

      {/* Controles */}
      {!ready ? (
        <div className="no-print bg-card border border-border rounded-xl p-4 space-y-4 max-w-sm">
          {!patientName && (
            <div>
              <label className="block text-xs text-muted mb-1">Nombre del paciente</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Nombre completo"
                className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white" />
            </div>
          )}
          <div>
            <label className="block text-xs text-muted mb-1">
              {tipo === 'pre' ? 'Fecha del procedimiento' : 'Fecha'}
            </label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white" />
          </div>
          {tipo === 'pre' && (
            <div>
              <label className="block text-xs text-muted mb-1">Hora del procedimiento</label>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white" />
            </div>
          )}
          <button disabled={!canGenerate} onClick={() => setReady(true)}
            className="w-full bg-teal text-white font-semibold text-sm py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40">
            Generar instrucciones
          </button>
        </div>
      ) : (
        <div className="no-print flex gap-2 flex-wrap">
          <button onClick={() => window.print()}
            className="text-sm font-semibold bg-navy text-white px-4 py-2 rounded-lg hover:opacity-90">
            Imprimir / PDF
          </button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90"
            style={{ background: '#25d366' }}>
            Enviar por WhatsApp
          </a>
          <button onClick={() => setReady(false)}
            className="text-sm text-muted hover:underline px-2">
            Cambiar
          </button>
        </div>
      )}

      {/* Hoja de instrucciones */}
      {ready && (
        <div className="proc-card" style={{
          maxWidth: 680, background: 'white', borderRadius: 12, overflow: 'hidden',
          fontFamily: 'Arial, sans-serif', boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        }}>
          {/* Header */}
          <div className="proc-header" style={{ background: 'linear-gradient(135deg,#e0f2f2,#b2d8d8)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#2e75b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {procedimientoLabel}
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#16335c' }}>{tituloHoja}</div>
              <div style={{ fontSize: 13, color: '#1f2a37', marginTop: 2 }}>{displayName}</div>
              {fecha && (
                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {tipo === 'pre' ? `Procedimiento: ${fmtFull(fecha)} · ${hora}hrs` : fmtFull(fecha)}
                </div>
              )}
            </div>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain', mixBlendMode: 'multiply' }} />
            )}
          </div>
          <div style={{ height: 3, background: 'linear-gradient(90deg,#2e75b6,#16335c)' }} />

          <div className="proc-content" style={{ padding: '1.25rem 1.5rem', fontSize: 13, lineHeight: 1.6 }}>
            {secciones.map((sec, i) => (
              <Sec key={i} title={applyPlaceholders(sec.titulo, vars)}>
                <span style={{ whiteSpace: 'pre-wrap' }}>{applyPlaceholders(sec.contenido, vars)}</span>
              </Sec>
            ))}
            {emergencias && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534', marginTop: 8 }}>
                <b>Dudas por WhatsApp:</b> {emergencias}
              </div>
            )}
          </div>

          {/* Firma */}
          <div className="proc-firma" style={{ textAlign: 'center', padding: '0 1.5rem 1rem' }}>
            {firmaUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={firmaUrl} alt="" style={{ height: 90, objectFit: 'contain', mixBlendMode: 'multiply', display: 'block', margin: '0 auto' }} />
            )}
            <p style={{ fontSize: 14, color: '#16335c', fontWeight: 600, marginTop: 4 }}>{doctorNombre}</p>
            <p style={{ fontSize: 11, color: '#6b7280' }}>Cédula Prof. {cedulaProf}{cedulaEsp ? ` · Esp. ${cedulaEsp}` : ''}</p>
          </div>

          <div style={{ background: '#16335c', height: 10 }} />
        </div>
      )}
    </div>
  )
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="proc-sec" style={{ marginBottom: 14 }}>
      <div className="proc-sec-title" style={{ background: '#16335c', color: 'white', fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: '6px 6px 0 0' }}>{title}</div>
      <div className="proc-sec-body" style={{ border: '1px solid #16335c', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '8px 12px' }}>{children}</div>
    </div>
  )
}
