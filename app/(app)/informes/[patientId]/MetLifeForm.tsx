'use client'

import { useState } from 'react'

const ML_BLUE  = '#003087'
const ML_GRAY  = '#6d6e71'
const ML_LIGHT = '#e8edf5'

const hdr: React.CSSProperties = {
  background: ML_BLUE, color: 'white', fontWeight: 700,
  fontSize: '10px', padding: '3px 8px', textTransform: 'uppercase', letterSpacing: 0.4,
}
const secHdr: React.CSSProperties = {
  background: ML_LIGHT, color: '#111', fontWeight: 700,
  fontSize: '11px', padding: '4px 8px', borderBottom: `1px solid ${ML_BLUE}`,
}
const cellBorder: React.CSSProperties = { border: `1px solid ${ML_BLUE}`, padding: 0, verticalAlign: 'top' }
const labelStyle: React.CSSProperties = { fontSize: '9px', color: '#555', padding: '1px 4px', display: 'block', marginTop: 1 }
const subhdr: React.CSSProperties = {
  background: ML_LIGHT, color: '#111', fontWeight: 700,
  fontSize: '10px', padding: '3px 8px', borderBottom: `1px solid ${ML_BLUE}`,
}

const PAGE = (n: number, total: number): React.CSSProperties => ({
  pageBreakAfter: n < total ? 'always' : 'auto',
  breakAfter: n < total ? 'page' : 'auto',
})

function SHdr({ n, label, span = 12, note }: { n: string; label: string; span?: number; note?: string }) {
  return (
    <tr>
      <td colSpan={span} style={{ padding: 0 }}>
        <div style={secHdr}>
          <span style={{ color: ML_BLUE, marginRight: 4 }}>{n}.</span>{label}
          {note && <span style={{ fontWeight: 400, fontSize: 10, color: ML_GRAY, marginLeft: 8 }}>{note}</span>}
        </div>
      </td>
    </tr>
  )
}

function Cell({ label, children, span }: { label?: string; children: React.ReactNode; span?: number }) {
  return (
    <td colSpan={span} style={cellBorder}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={{ padding: '2px 4px', minHeight: 18 }}>{children}</div>
    </td>
  )
}

function Chk({ label, name, checked }: { label: string; name?: string; checked?: boolean }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, marginRight: 10 }}>
      <input type="checkbox" defaultChecked={checked} name={name} style={{ accentColor: ML_BLUE }} /> {label}
    </label>
  )
}

function DateField({ label, value }: { label?: string; value?: string }) {
  const parts = value ? value.split('/') : ['', '', '']
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10 }}>
      {label && <span style={{ marginRight: 3 }}>{label}:</span>}
      <input className="ml-sm" defaultValue={parts[0]} placeholder="DD" style={{ width: 28 }} />
      <span>/</span>
      <input className="ml-sm" defaultValue={parts[1]} placeholder="MM" style={{ width: 28 }} />
      <span>/</span>
      <input className="ml-sm" defaultValue={parts[2]} placeholder="AAAA" style={{ width: 42 }} />
    </div>
  )
}

interface PatientData {
  ap1: string; ap2: string; noms: string; nombre: string
  sexo: string; edad: string; fecha_nacimiento: string; fecha_consulta: string
  cronicos: string; quirurgicos: string; alergicos: string; medicamentos: string
  tabaquismo: string; alcohol: string; gesta: string; menarca: string; ritmo: string
  padecimiento: string; exploracion: string
  dx: string[]; dx_texto: string; tx_texto: string; estudios: string[]
  consultorio: any; hospital: string; hospital_ciudad: string; hospital_estado: string
  signos_vitales?: { ta?: string; fc?: string; fr?: string; temp?: string; spo2?: string }
}

interface Props { data: PatientData; doctor: any }

function MetLifeHeader() {
  return (
    <tr>
      <td colSpan={12} style={{ padding: '6px 10px', borderBottom: `2px solid ${ML_BLUE}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'middle' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: ML_BLUE, fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: -0.5 }}>
                  MetLife
                  <span style={{ fontSize: 10, fontWeight: 400, color: ML_GRAY, marginLeft: 6 }}>México</span>
                </div>
              </td>
              <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: ML_BLUE }}>Informe médico</div>
                <div style={{ fontSize: 9, color: ML_GRAY }}>CC-1-020 VER. 7</div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function MetLifeFooter({ page, total }: { page: number; total: number }) {
  return (
    <tr>
      <td colSpan={12} style={{ borderTop: `1px solid ${ML_BLUE}`, padding: '2px 8px', fontSize: '8px', color: '#555' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: '8px', color: '#555' }}>MetLife México, S.A. de C.V. · Blvd. Manuel Ávila Camacho 32, piso 16, Col. Lomas de Chapultepec, 11000, CDMX · metlife.com.mx</td>
              <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '9px' }}>{page} de {total}</td>
              <td style={{ textAlign: 'right', fontSize: '8px', color: '#555' }}>CC-1-020 VER. 7</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

export default function MetLifeForm({ data: initialData, doctor }: Props) {
  const [d] = useState({ ...initialData })
  const fmtDate = (s: string) => s ? s.split('-').reverse().join('/') : ''
  const cons = d.consultorio
  const tel = cons?.telefono ?? doctor.consultorios.Muguerza.telefono
  const fnConsult = fmtDate(d.fecha_consulta)
  const [dayC, monC, yrC] = fnConsult ? fnConsult.split('/') : ['', '', '']
  const fnBirth = fmtDate(d.fecha_nacimiento)
  const dxFull = [...d.dx, d.dx_texto].filter(Boolean).join('\n')

  const TOTAL = 4

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, maxWidth: 860, margin: '0 auto', background: 'white', color: '#111' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 8mm; size: A4; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .ml-ta { width: 100%; border: 0; border-bottom: 1px solid #aaa; outline: none; background: transparent; font-size: 11px; padding: 2px 4px; resize: vertical; font-family: Arial, sans-serif; }
        .ml-inp { width: 100%; border: 0; border-bottom: 1px solid #aaa; outline: none; background: transparent; font-size: 11px; padding: 2px 4px; font-family: Arial, sans-serif; box-sizing: border-box; }
        .ml-sm { border: 0; border-bottom: 1px solid #aaa; outline: none; background: transparent; font-size: 11px; padding: 1px 2px; font-family: Arial, sans-serif; box-sizing: border-box; }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => window.print()}
          style={{ background: ML_BLUE, color: 'white', border: 'none', borderRadius: 6, padding: '6px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
        >
          Imprimir / PDF
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 1
      ════════════════════════════════════════════════════════════ */}
      <div style={PAGE(1, TOTAL)}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <MetLifeHeader />

            {/* Instrucciones */}
            <tr>
              <td colSpan={12} style={{ padding: '6px 10px', fontSize: '10px', lineHeight: 1.5, borderBottom: `1px solid ${ML_BLUE}` }}>
                <p style={{ margin: '0 0 4px' }}>
                  El presente formato debe ser llenado en su totalidad por el médico tratante con letra legible y sin abreviaturas. Todos los campos son obligatorios salvo que se especifique lo contrario.
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  Los documentos con tachaduras o enmendaduras serán inválidos. En caso de error, utilice un nuevo formato.
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  La inexacta o falsa declaración de los datos contenidos en este documento puede dar lugar a la negativa del pago de la reclamación.
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  En caso de tratamiento continuo, el formato debe ser actualizado cada 6 meses.
                </p>
                <p style={{ margin: 0 }}>
                  Cada médico tratante e interconsultante deberá llenar su propio formato de informe médico.
                </p>
              </td>
            </tr>

            {/* Lugar y fecha */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                Lugar y fecha:&nbsp;
                <input className="ml-inp" defaultValue="León, Guanajuato" style={{ width: 160, display: 'inline-block' }} />
                &nbsp;&nbsp;
                <DateField value={fnConsult} />
              </td>
            </tr>

            {/* 1. Datos del paciente */}
            <SHdr n="1" label="Datos del paciente" />

            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}>Nombre completo del paciente:</div>
                <div style={{ padding: '2px 4px' }}>
                  <input className="ml-inp" defaultValue={d.nombre} />
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan={6} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <span style={{ fontWeight: 700, fontSize: 10 }}>Sexo:</span>&nbsp;
                <Chk label="Masculino" name="sexo" checked={d.sexo === 'M'} />
                <Chk label="Femenino" name="sexo" checked={d.sexo === 'F'} />
                <Chk label="Otro" name="sexo" />
              </td>
              <td colSpan={6} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <span style={{ fontWeight: 700, fontSize: 10 }}>Causa de reclamación:</span>&nbsp;
                <Chk label="Accidente" name="causa" />
                <Chk label="Enfermedad" name="causa" checked />
                <Chk label="Embarazo" name="causa" />
                <Chk label="Segunda valoración" name="causa" />
                <Chk label="Otro" name="causa" />
              </td>
            </tr>

            <tr>
              <td colSpan={2} style={cellBorder}>
                <div style={labelStyle}>Edad:</div>
                <div style={{ padding: '2px 4px' }}><input className="ml-inp" defaultValue={d.edad} /></div>
              </td>
              <td colSpan={2} style={cellBorder}>
                <div style={labelStyle}>Peso (kg):</div>
                <div style={{ padding: '2px 4px' }}><input className="ml-inp" /></div>
              </td>
              <td colSpan={2} style={cellBorder}>
                <div style={labelStyle}>Talla (cm):</div>
                <div style={{ padding: '2px 4px' }}><input className="ml-inp" /></div>
              </td>
              <td colSpan={6} style={cellBorder}>
                <div style={labelStyle}>Fecha en que atendió por primera vez al paciente por motivo de esta enfermedad / accidente / embarazo:</div>
                <div style={{ padding: '2px 4px' }}>
                  <DateField value={fnConsult} />
                </div>
              </td>
            </tr>

            {/* 2. Antecedentes clínicos */}
            <SHdr n="2" label="Antecedentes clínicos de importancia" />

            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}>Historia clínica breve:</div>
                <textarea className="ml-ta" rows={3} defaultValue={d.padecimiento.slice(0, 300)} />
              </td>
            </tr>

            <tr>
              <td colSpan={6} style={cellBorder}>
                <div style={labelStyle}>Antecedentes personales patológicos:</div>
                <textarea className="ml-ta" rows={2} defaultValue={d.cronicos} />
              </td>
              <td colSpan={6} style={cellBorder}>
                <div style={labelStyle}>Antecedentes quirúrgicos:</div>
                <textarea className="ml-ta" rows={2} defaultValue={d.quirurgicos} />
              </td>
            </tr>

            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4 }}>Antecedentes gineco-obstétricos (especificar si ha recibido tratamiento para infertilidad):</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>G <input className="ml-sm" defaultValue={d.gesta ? d.gesta.match(/G\s*(\d+)/i)?.[1] ?? '' : ''} style={{ width: 28 }} /></span>
                  <span>P <input className="ml-sm" style={{ width: 28 }} /></span>
                  <span>A <input className="ml-sm" style={{ width: 28 }} /></span>
                  <span>C <input className="ml-sm" style={{ width: 28 }} /></span>
                  <span style={{ marginLeft: 16 }}>Menarca: <input className="ml-sm" defaultValue={d.menarca} style={{ width: 60 }} /></span>
                  <span>Ritmo: <input className="ml-sm" defaultValue={d.ritmo} style={{ width: 60 }} /></span>
                  <span>Tratamiento infertilidad: <input className="ml-sm" style={{ width: 120 }} /></span>
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}>Mencione las afecciones más importantes que padezca el paciente aunque no tengan relación con la presente reclamación:</div>
                <textarea className="ml-ta" rows={2} />
              </td>
            </tr>

            <MetLifeFooter page={1} total={TOTAL} />
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 2
      ════════════════════════════════════════════════════════════ */}
      <div style={PAGE(2, TOTAL)}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <MetLifeHeader />

            {/* 3. Padecimiento actual */}
            <SHdr n="3" label="Padecimiento actual" />

            {/* a) */}
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}><strong>a)</strong> Principales signos, síntomas y detalle de la evolución:</div>
                <textarea className="ml-ta" rows={4} defaultValue={d.padecimiento} />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '3px 8px', fontSize: 11 }}>
                Fecha de inicio de principales signos y síntomas:&nbsp;
                <DateField />
              </td>
            </tr>

            {/* b) */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <strong>b) Tipo de padecimiento:</strong>&nbsp;
                <Chk label="Congénito" />
                <Chk label="Adquirido" />
                <Chk label="Agudo" />
                <Chk label="Crónico" />
                &nbsp;Tiempo de evolución: <input className="ml-inp" style={{ width: 130, display: 'inline-block' }} />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}><strong>Causa / etiología del padecimiento</strong> (en caso de accidente, describa tiempo, modo y lugar donde ocurrió la lesión):</div>
                <textarea className="ml-ta" rows={2} />
              </td>
            </tr>

            {/* c) */}
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}><strong>c) Exploración física, estudios de laboratorio y gabinete practicados.</strong> Detallar resultados de exploración física, estudios de laboratorio y/o gabinete que demuestren el diagnóstico referido:</div>
                <textarea className="ml-ta" rows={3} defaultValue={d.exploracion} />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}>Estudios de laboratorio y/o gabinete:</div>
                <textarea className="ml-ta" rows={2} defaultValue={d.estudios.join(', ')} />
              </td>
            </tr>

            {/* d) */}
            <tr>
              <td colSpan={9} style={cellBorder}>
                <div style={labelStyle}><strong>d) Diagnóstico etiológico definitivo:</strong></div>
                <textarea className="ml-ta" rows={2} defaultValue={dxFull} />
              </td>
              <td colSpan={3} style={cellBorder}>
                <div style={labelStyle}>Código CIE:</div>
                <div style={{ padding: '2px 4px' }}><input className="ml-inp" /></div>
              </td>
            </tr>

            {/* e) f) */}
            <tr>
              <td colSpan={6} style={{ ...cellBorder, padding: '3px 8px', fontSize: 11 }}>
                <strong>e) Fecha de diagnóstico:</strong>&nbsp;
                <DateField value={fnConsult} />
              </td>
              <td colSpan={6} style={{ ...cellBorder, padding: '3px 8px', fontSize: 11 }}>
                <strong>f) Fecha de inicio de tratamiento:</strong>&nbsp;
                <DateField />
              </td>
            </tr>

            {/* g) */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <strong>g)</strong> ¿Se ha relacionado con algún otro padecimiento, enfermedad o accidente?&nbsp;
                <Chk label="Sí" name="gRelac" />
                <Chk label="No" name="gRelac" />
                &nbsp;¿Cuál? <input className="ml-inp" style={{ width: 200, display: 'inline-block' }} />
              </td>
            </tr>

            {/* h) */}
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}><strong>h)</strong> Indicar el tratamiento y/o intervención quirúrgica (especificar CPT, sólo como referencia):</div>
                <textarea className="ml-ta" rows={2} defaultValue={d.tx_texto} />
              </td>
            </tr>

            {/* i) */}
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}><strong>i)</strong> Descripción de la técnica:</div>
                <textarea className="ml-ta" rows={2} />
              </td>
            </tr>

            {/* j) k) */}
            <tr>
              <td colSpan={6} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <strong>j)</strong> ¿Utilizó equipo especial para el procedimiento?&nbsp;
                <Chk label="Sí" name="equipo" />
                <Chk label="No" name="equipo" />
                <div style={{ marginTop: 3 }}>Detallar: <input className="ml-inp" /></div>
              </td>
              <td colSpan={6} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <strong>k)</strong> ¿Utilizó insumos y/o materiales para el procedimiento?&nbsp;
                <Chk label="Sí" name="insumos" />
                <Chk label="No" name="insumos" />
                <div style={{ marginTop: 3 }}>Detallar: <input className="ml-inp" /></div>
              </td>
            </tr>

            {/* l) */}
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}><strong>l)</strong> En caso de presentarse complicaciones, indicar cuáles fueron:</div>
                <textarea className="ml-ta" rows={2} />
              </td>
            </tr>

            {/* m) */}
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}><strong>m)</strong> Estado actual del paciente:</div>
                <textarea className="ml-ta" rows={2} />
              </td>
            </tr>

            {/* n) */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <strong>n)</strong> ¿El paciente seguirá recibiendo tratamiento?&nbsp;
                <Chk label="Sí" name="tratFuturo" />
                <Chk label="No" name="tratFuturo" />
                <div style={{ marginTop: 3 }}>Describir tratamiento y duración: <input className="ml-inp" /></div>
              </td>
            </tr>

            {/* o) */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '3px 8px', fontSize: 11 }}>
                <strong>o) Fecha probable de alta o prealta:</strong>&nbsp;
                <DateField />
              </td>
            </tr>

            {/* 4. Hospitalización */}
            <SHdr n="4" label="En caso de hospitalización" />

            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}>Nombre del hospital:</div>
                <div style={{ padding: '2px 4px' }}><input className="ml-inp" defaultValue={d.hospital} /></div>
              </td>
            </tr>

            <tr>
              <td colSpan={6} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <strong>Tipo de ingreso:</strong>&nbsp;
                <Chk label="Urgencia" name="ingreso" />
                <Chk label="Ingreso hospitalario" name="ingreso" />
                <Chk label="Corta estancia / ambulatoria" name="ingreso" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: '3px 6px', fontSize: 11 }}>
                Fecha de ingreso:<br /><DateField />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: '3px 6px', fontSize: 11 }}>
                Fecha de intervención:<br /><DateField />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: '3px 6px', fontSize: 11 }}>
                Fecha de egreso:<br /><DateField />
              </td>
            </tr>

            {/* 5. Observaciones */}
            <SHdr n="5" label="Observaciones adicionales" />
            <tr>
              <td colSpan={12} style={cellBorder}>
                <div style={labelStyle}>En caso de tener observaciones o comentarios adicionales, agregarlos:</div>
                <textarea className="ml-ta" rows={3} />
              </td>
            </tr>

            <MetLifeFooter page={2} total={TOTAL} />
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 3 — Equipo quirúrgico + Datos del médico
      ════════════════════════════════════════════════════════════ */}
      <div style={PAGE(3, TOTAL)}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <MetLifeHeader />

            {/* 6. Equipo quirúrgico */}
            <SHdr n="6" label="Equipo quirúrgico" note="(campos obligatorios con datos correctos, en caso de que aplique)" />
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '3px 8px', fontSize: '10px', color: ML_GRAY, fontStyle: 'italic' }}>
                En caso de procedimiento que requiera participación de otros profesionales de la salud, detallar.
              </td>
            </tr>

            {/* Tabla encabezados equipo */}
            <tr>
              <td style={{ ...cellBorder, padding: 0 }}>
                <div style={hdr}>Participación</div>
              </td>
              <td colSpan={3} style={{ ...cellBorder, padding: 0 }}>
                <div style={hdr}>Nombre completo</div>
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <div style={hdr}>Cédula prof. especialidad</div>
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <div style={hdr}>Número celular</div>
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <div style={hdr}>RFC</div>
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <div style={hdr}>Correo electrónico</div>
              </td>
            </tr>

            {/* a) Anestesiólogo */}
            <tr>
              <td style={{ ...cellBorder, padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#f5f7fb' }}>
                a) Anestesiólogo
              </td>
              <td colSpan={3} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
            </tr>

            {/* b) Primer ayudante */}
            <tr>
              <td style={{ ...cellBorder, padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#f5f7fb' }}>
                b) Primer ayudante
              </td>
              <td colSpan={3} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
            </tr>

            {/* c) Otro */}
            <tr>
              <td style={{ ...cellBorder, padding: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, padding: '2px 4px', background: '#f5f7fb' }}>c) Otro</div>
                <input className="ml-inp" placeholder="Tipo de participación" />
                <input className="ml-inp" placeholder="Especialidad" />
              </td>
              <td colSpan={3} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
            </tr>

            {/* d) Otro 2 */}
            <tr>
              <td style={{ ...cellBorder, padding: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, padding: '2px 4px', background: '#f5f7fb' }}>d) Otro</div>
                <input className="ml-inp" placeholder="Tipo de participación" />
                <input className="ml-inp" placeholder="Especialidad" />
              </td>
              <td colSpan={3} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
              <td colSpan={2} style={{ ...cellBorder, padding: 0 }}>
                <input className="ml-inp" />
              </td>
            </tr>

            {/* 7. Datos del médico */}
            <SHdr n="7" label="Datos del médico" />

            {/* Tipo de atención */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                <strong style={{ fontSize: 10 }}>Especificar tipo de atención al paciente:</strong>&nbsp;
                <Chk label="Médico tratante" name="tipoAten" />
                <Chk label="Cirujano principal" name="tipoAten" checked />
                <Chk label="Interconsultante" name="tipoAten" />
                <Chk label="Equipo quirúrgico" name="tipoAten" />
                <Chk label="Segunda valoración" name="tipoAten" />
              </td>
            </tr>

            {/* Nombre / Especialidad */}
            <tr>
              <Cell label="Nombre completo:" span={7}>
                <input className="ml-inp" defaultValue="Fernando Quiroz Compeán" />
              </Cell>
              <Cell label="Especialidad:" span={5}>
                <input className="ml-inp" defaultValue="Gastroenterología" />
              </Cell>
            </tr>

            {/* Domicilio / Teléfono */}
            <tr>
              <Cell label="Domicilio consultorio:" span={8}>
                <input className="ml-inp" defaultValue={cons ? `${cons.hospital}, ${cons.consultorio ?? ''}, ${cons.ciudad}, ${cons.estado}` : ''} />
              </Cell>
              <Cell label="Teléfono del consultorio:" span={4}>
                <input className="ml-inp" defaultValue={tel} />
              </Cell>
            </tr>

            {/* Cédulas / celular / RFC */}
            <tr>
              <Cell label="Cédula profesional especialidad:" span={3}>
                <input className="ml-inp" defaultValue={doctor.cedula_esp} />
              </Cell>
              <Cell label="Número celular:" span={3}>
                <input className="ml-inp" defaultValue={doctor.celular} />
              </Cell>
              <Cell label="RFC:" span={3}>
                <input className="ml-inp" defaultValue={doctor.rfc} />
              </Cell>
              <Cell label="Correo electrónico:" span={3}>
                <input className="ml-inp" defaultValue={doctor.email_seguros} />
              </Cell>
            </tr>

            {/* Aviso de contacto */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: '10px', color: '#333', fontStyle: 'italic' }}>
                Acepto que ante cualquier duda o requerimiento de información sobre este paciente me sea contactado inclusive por medios digitales.
              </td>
            </tr>

            {/* Convenio */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                Tiene convenio con la aseguradora:&nbsp;
                <Chk label="Sí" name="convenio" />
                <Chk label="No" name="convenio" checked />
              </td>
            </tr>

            {/* Nota tabuladores */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: '10px', color: '#333' }}>
                Los honorarios médicos de los profesionales que pertenezcan al Grupo Médico Asociado de MetLife se facturarán conforme a los
                tabuladores de pago directo de MetLife México, S.A. de C.V.
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: '4px 8px', fontSize: 11 }}>
                Acepto los tabuladores de pago directo de MetLife:&nbsp;
                <Chk label="Sí" name="tabulador" />
                <Chk label="No" name="tabulador" />
              </td>
            </tr>

            {/* Presupuesto honorarios */}
            <tr>
              <td colSpan={12} style={{ ...cellBorder, padding: 0 }}>
                <div style={subhdr as React.CSSProperties}>Presupuesto de honorarios (MXN):</div>
                <div style={{ padding: '4px 8px', display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11 }}>
                  <span>Cirujano: <input className="ml-sm" style={{ width: 80 }} /></span>
                  <span>Anestesiólogo: <input className="ml-sm" style={{ width: 80 }} /></span>
                  <span>Primer ayudante: <input className="ml-sm" style={{ width: 80 }} /></span>
                  <span>Otro: <input className="ml-sm" style={{ width: 80 }} /></span>
                  <span>Otro: <input className="ml-sm" style={{ width: 80 }} /></span>
                </div>
              </td>
            </tr>

            <MetLifeFooter page={3} total={TOTAL} />
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 4 — Firma + Aviso de privacidad
      ════════════════════════════════════════════════════════════ */}
      <div style={PAGE(4, TOTAL)}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <MetLifeHeader />

            {/* Texto legal */}
            <tr>
              <td colSpan={12} style={{ padding: '8px 10px', fontSize: '10px', lineHeight: 1.6, borderBottom: `1px solid ${ML_BLUE}` }}>
                <p style={{ margin: '0 0 6px' }}>
                  El médico que suscribe manifiesta bajo protesta de decir verdad que la información asentada en el presente formato es cierta y exacta,
                  siendo responsable de la veracidad de los datos declarados.
                </p>
                <p style={{ margin: '0 0 6px' }}>
                  Asimismo, declara conocer y aceptar que la inexacta o falsa declaración de los datos contenidos en este documento puede dar lugar
                  a la negativa del pago de la reclamación o al reintegro de las sumas pagadas, sin perjuicio de las acciones legales que pudieran derivarse.
                </p>
                <p style={{ margin: 0 }}>
                  El médico autoriza a MetLife México, S.A. de C.V. a verificar la información aquí declarada con las instituciones médicas,
                  de salud o cualquier otra que estime pertinente para la correcta evaluación de la reclamación.
                </p>
              </td>
            </tr>

            {/* Firma */}
            <tr>
              <td colSpan={12} style={{ border: `1px solid ${ML_BLUE}`, padding: '12px 16px', textAlign: 'center', fontSize: 11 }}>
                <div style={{ height: 80, borderBottom: `1px solid #999`, marginBottom: 8 }} />
                <strong>Nombre completo y firma autógrafa del médico tratante</strong>
                <div style={{ fontSize: 10, color: ML_GRAY, marginTop: 4 }}>
                  Fernando Quiroz Compeán · Gastroenterología · Céd. Esp. {doctor.cedula_esp}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ marginRight: 16 }}>Lugar y fecha: <input className="ml-sm" defaultValue={`León, Guanajuato · ${fnConsult}`} style={{ width: 220 }} /></span>
                </div>
              </td>
            </tr>

            {/* 8. Aviso de privacidad */}
            <SHdr n="8" label="Aviso de privacidad de MetLife México, S.A. de C.V." />

            <tr>
              <td colSpan={12} style={{ padding: '6px 10px', fontSize: '9px', lineHeight: 1.6, color: '#333', border: `1px solid ${ML_BLUE}` }}>
                <p style={{ margin: '0 0 5px' }}>
                  <strong>Responsable del tratamiento de sus datos personales.</strong> MetLife México, S.A. de C.V. (en lo sucesivo "MetLife"), con domicilio en
                  Blvd. Manuel Ávila Camacho 32, piso 16, Col. Lomas de Chapultepec, Alcaldía Miguel Hidalgo, C.P. 11000, Ciudad de México,
                  es responsable del tratamiento de sus datos personales.
                </p>
                <p style={{ margin: '0 0 5px' }}>
                  <strong>Datos personales que recabamos.</strong> Para las finalidades descritas en el presente aviso de privacidad, MetLife podrá recabar
                  sus datos personales directamente de usted, así como de terceras personas o fuentes de acceso público. Los datos personales que
                  MetLife recaba de usted son: datos de identificación, datos de contacto, datos laborales, datos patrimoniales y/o financieros, y
                  en caso de ser necesario, datos personales sensibles relacionados con su estado de salud y/o condición médica.
                </p>
                <p style={{ margin: '0 0 5px' }}>
                  <strong>Finalidades del tratamiento.</strong> Sus datos personales serán utilizados para las siguientes finalidades: (i) evaluación, suscripción
                  y administración de seguros y/o fianzas; (ii) atención de siniestros, reclamaciones y pagos derivados de los mismos; (iii) cumplimiento
                  de obligaciones contractuales y legales; (iv) realización de estudios estadísticos y actuariales; (v) prevención y detección de fraudes;
                  (vi) envío de comunicaciones de servicios relacionados con los productos contratados.
                </p>
                <p style={{ margin: '0 0 5px' }}>
                  <strong>Transferencia de datos.</strong> MetLife podrá transferir sus datos personales, sin requerir su consentimiento, a: autoridades competentes
                  en términos de la legislación aplicable; empresas subsidiarias, afiliadas o relacionadas del Grupo MetLife; prestadores de servicios
                  que actúen como encargados; y reaseguradoras.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Derechos ARCO.</strong> Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición (ARCO) al tratamiento de
                  sus datos personales, así como revocar su consentimiento y limitar el uso o divulgación de sus datos, enviando una solicitud al correo
                  electrónico: privacidad@metlife.com.mx. Para mayor información sobre el tratamiento de sus datos personales y el aviso de privacidad
                  integral, visite: <span style={{ color: ML_BLUE }}>www.metlife.com.mx</span>.
                </p>
              </td>
            </tr>

            <MetLifeFooter page={4} total={TOTAL} />
          </tbody>
        </table>
      </div>
    </div>
  )
}
