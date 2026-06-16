'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
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

function fmtShort(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y.slice(2)}`
}

function fmtLong(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(day)}/${months[parseInt(m)-1]}/${y}`
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

export default function ColonoscopyClient({ patientId, patientName, patientPhone, doctorNombre, cedulaProf, cedulaEsp, emergencias, logoUrl, firmaUrl }: Props) {
  const [fecha,   setFecha]   = useState('')
  const [hora,    setHora]    = useState('09:00')
  const [ready,   setReady]   = useState(false)
  const [nombre,  setNombre]  = useState('')

  const displayName = patientName ?? nombre

  const prev = fecha ? prevDay(fecha) : ''

  // Morning prep: start 6hrs before, finish 4hrs before procedure
  const horaInicio2 = addHours(hora, -6)
  const horaFin2    = addHours(hora, -4)

  const phone = (() => {
    const d = (patientPhone ?? '').replace(/\D/g, '')
    return d.length === 10 ? `52${d}` : d.length >= 12 ? d : null
  })()

  const waDetallado = encodeURIComponent(
`Estimado/a ${displayName}, instrucciones de preparación para su colonoscopía el ${fmtFull(fecha)} a las ${hora}hrs.

─ DÍA ANTERIOR (${fmtFull(prev)}) ─
Desayuno y comida: dieta blanda (sin semillas ni vegetales, sin leguminosas ni cereales integrales).
Cena: dieta líquida.
🌙 De 20:00 a 22:00hrs – PRIMERA MITAD: disuelva 2 sobres de Nulytely en 2 litros de líquido frío (agua, Electrolyte, Powerade o Gatorade). Consuma frío. Un vaso (250ml) cada 15-20 min.

─ DÍA DEL ESTUDIO (${fmtFull(fecha)}) ─
☀️ De ${horaInicio2} a ${horaFin2}hrs – SEGUNDA MITAD: disuelva los 2 sobres restantes igual que la noche anterior. Consuma frío. Un vaso cada 15-20 min.

🎯 OBJETIVO: Evacuaciones 100% líquidas, coloración transparente/amarillo claro.

AYUNO EL DÍA DE SU PROCEDIMIENTO.

Acudir 20 minutos antes. Presentarse en área de endoscopía en compañía de un adulto mayor de edad.

Dudas por WhatsApp: ${emergencias ?? ''}`
  )

  const waUrl = phone
    ? `https://wa.me/${phone}?text=${waDetallado}`
    : `https://wa.me/?text=${waDetallado}`

  return (
    <div className="space-y-4 pb-10">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, nav { display: none !important; }
          @page { margin: 8mm; size: A4; }
          body { padding: 0 !important; }
          .colon-card { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
          .colon-header { padding: 0.6rem 1.2rem !important; }
          .colon-content { padding: 0.6rem 1.2rem !important; }
          .colon-sec { margin-bottom: 7px !important; }
          .colon-sec-title { padding: 2px 8px !important; font-size: 11px !important; }
          .colon-sec-body { padding: 5px 10px !important; font-size: 11.5px !important; }
          .colon-box { padding: 4px 10px !important; margin-top: 4px !important; }
          .colon-firma { padding: 0 1.2rem 0.6rem !important; }
          .colon-card, .colon-card * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {patientId && (
        <div className="no-print flex items-center gap-2">
          <Link href={`/pacientes/${patientId}`} className="text-teal text-sm font-semibold hover:underline">
            ← {patientName}
          </Link>
        </div>
      )}
      <h2 className="no-print text-lg font-extrabold text-navy">Preparación — Colonoscopía</h2>

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
            <label className="block text-xs text-muted mb-1">Fecha del procedimiento</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Hora del procedimiento</label>
            <input type="time" value={hora} onChange={e => setHora(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white" />
          </div>
          <button disabled={!fecha || !displayName} onClick={() => setReady(true)}
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

      {/* ── INSTRUCCIONES ── */}
      {ready && (
        <div className="colon-card" style={{
          maxWidth: 680, background: 'white', borderRadius: 12, overflow: 'hidden',
          fontFamily: 'Arial, sans-serif', boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        }}>
          {/* Header */}
          <div className="colon-header" style={{ background: 'linear-gradient(135deg,#e0f2f2,#b2d8d8)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#2e75b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instrucciones de preparación</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#16335c' }}>Colonoscopía</div>
              <div style={{ fontSize: 13, color: '#1f2a37', marginTop: 2 }}>{displayName}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Procedimiento: {fmtFull(fecha)} · {hora}hrs</div>
            </div>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain', mixBlendMode: 'multiply' }} />
            )}
          </div>
          <div style={{ height: 3, background: 'linear-gradient(90deg,#2e75b6,#16335c)' }} />

          <div className="colon-content" style={{ padding: '1.25rem 1.5rem', fontSize: 13, lineHeight: 1.6 }}>
            <Sec title={`Día anterior (${fmtFull(prev)})`}>
              <b>Desayuno y comida:</b> Dieta blanda — evite verduras y frutas crudas con semilla, leguminosas, cereales integrales, maíz y nueces.<br />
              <b>Cena:</b> Dieta líquida.
              <Box>
                <b>🌙 De las 20:00 a 22:00hrs — PRIMERA MITAD de la preparación</b><br />
                Disuelva 2 sobres de Nulytely en 2 litros de líquido frío
                (agua, Electrolyte, Powerade o Gatorade). <b>Consuma frío.</b><br />
                Tome un vaso (250ml) cada 15-20 minutos. Manténgase cerca del baño.
              </Box>
            </Sec>
            <Sec title={`Día del estudio (${fmtFull(fecha)})`}>
              <Box>
                <b>☀️ De las {horaInicio2} a {horaFin2}hrs — SEGUNDA MITAD de la preparación</b><br />
                Disuelva los 2 sobres restantes en 2 litros de líquido frío
                (agua, Electrolyte, Powerade o Gatorade). <b>Consuma frío.</b><br />
                Un vaso (250ml) cada 15-20 minutos hasta terminar.<br />
                <b>Objetivo:</b> evacuaciones 100% líquidas, coloración transparente/amarillo claro.
              </Box>
            </Sec>
            <Sec title="AYUNO EL DÍA DE SU PROCEDIMIENTO">
              AYUNO EL DÍA DE SU PROCEDIMIENTO.
            </Sec>
            <Sec title="El día del procedimiento">
              Acudir <b>20 minutos antes</b> de su procedimiento ({hora}hrs).<br />
              Presentarse en el <b>área de endoscopía</b> en compañía de un <b>adulto mayor de edad</b>.
            </Sec>
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534', marginTop: 8 }}>
              <b>Dudas por WhatsApp:</b> {emergencias}
            </div>
          </div>

          {/* Firma */}
          <div className="colon-firma" style={{ textAlign: 'center', padding: '0 1.5rem 1rem' }}>
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
    <div className="colon-sec" style={{ marginBottom: 14 }}>
      <div className="colon-sec-title" style={{ background: '#16335c', color: 'white', fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: '6px 6px 0 0' }}>{title}</div>
      <div className="colon-sec-body" style={{ border: '1px solid #16335c', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '8px 12px' }}>{children}</div>
    </div>
  )
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="colon-box" style={{ background: '#e0f2f2', border: '1.5px solid #2e75b6', borderRadius: 8, padding: '7px 12px', marginTop: 8 }}>{children}</div>
  )
}
