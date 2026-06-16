'use client'

import { useState } from 'react'

const AXA_BLUE = '#003087'
const AXA_RED  = '#cc0000'

const hdr: React.CSSProperties = {
  background: AXA_BLUE, color: 'white', fontWeight: 700,
  fontSize: '10px', padding: '3px 6px', textTransform: 'uppercase', letterSpacing: 0.5,
}
const subhdr: React.CSSProperties = {
  background: '#d0dcf0', color: AXA_BLUE, fontWeight: 700,
  fontSize: '10px', padding: '2px 6px',
}
const cellStyle: React.CSSProperties = { border: `1px solid ${AXA_BLUE}`, padding: 0, verticalAlign: 'top' }
const labelStyle: React.CSSProperties = { fontSize: '9px', color: '#444', padding: '1px 4px', display: 'block', marginTop: 1 }
const PAGE = (n: number, total: number): React.CSSProperties => ({
  pageBreakAfter: n < total ? 'always' : 'auto',
  breakAfter: n < total ? 'page' : 'auto',
})

function Cell({ label, children, span, noBorder }: { label?: string; children: React.ReactNode; span?: number; noBorder?: boolean }) {
  return (
    <td colSpan={span} style={noBorder ? { padding: 0, verticalAlign: 'top' } : cellStyle}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={{ padding: '2px 4px', minHeight: 18 }}>{children}</div>
    </td>
  )
}

function HDR({ label, span = 12 }: { label: string; span?: number }) {
  return (
    <tr>
      <td colSpan={span} style={{ padding: 0 }}>
        <div style={hdr}>{label}</div>
      </td>
    </tr>
  )
}

function SubHDR({ label, span = 12 }: { label: string; span?: number }) {
  return (
    <tr>
      <td colSpan={span} style={{ padding: 0 }}>
        <div style={subhdr}>{label}</div>
      </td>
    </tr>
  )
}

function Chk({ label, name, checked }: { label: string; name?: string; checked?: boolean }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, marginRight: 12 }}>
      <input type="checkbox" defaultChecked={checked} name={name} style={{ accentColor: AXA_BLUE }} /> {label}
    </label>
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

function AxaHeader() {
  return (
    <tr>
      <td colSpan={12} style={{ padding: '4px 8px', borderBottom: `2px solid ${AXA_BLUE}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              {/* AXA Logo */}
              <td style={{ width: 100, verticalAlign: 'middle' }}>
                <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 28, color: AXA_BLUE, letterSpacing: -1, lineHeight: 1 }}>
                  <span style={{ color: AXA_BLUE }}>A</span>
                  <span style={{ color: AXA_RED, fontSize: 34 }}>X</span>
                  <span style={{ color: AXA_BLUE }}>A</span>
                </div>
              </td>
              <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: AXA_BLUE, fontWeight: 700 }}>Gastos Médicos Mayores</div>
                <div style={{ fontSize: 16, color: AXA_RED, fontWeight: 900, letterSpacing: 1 }}>INFORME MÉDICO</div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function AxaFooter({ page, total }: { page: number; total: number }) {
  return (
    <tr>
      <td colSpan={12} style={{ borderTop: `1px solid ${AXA_BLUE}`, padding: '2px 6px', fontSize: '8px', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
        <span>AXA Seguros, S.A. de C.V. · Félix Cuevas 366, piso 3, Col. Tlacoquemécatl, alcaldía Benito Juárez, 03200, CDMX · Tels. 55 5169 1000 · 800 900 1292 · axa.mx</span>
        <span style={{ float: 'right', fontWeight: 700 }}>{page}/{total}</span>
      </td>
    </tr>
  )
}

export default function AxaForm({ data: initialData, doctor }: Props) {
  const [d] = useState({ ...initialData })
  const fmtDate = (s: string) => s ? s.split('-').reverse().join('/') : ''
  const cons = d.consultorio
  const tel = cons?.telefono ?? doctor.consultorios.Muguerza.telefono
  const fnBirth = fmtDate(d.fecha_nacimiento)
  const [dayB, monB, yrB] = fnBirth ? fnBirth.split('/') : ['', '', '']
  const fnConsult = fmtDate(d.fecha_consulta)
  const [dayC, monC, yrC] = fnConsult ? fnConsult.split('/') : ['', '', '']
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
        .axa-ta { width: 100%; border: 0; border-bottom: 1px solid #aaa; outline: none; background: transparent; font-size: 11px; padding: 2px 4px; resize: vertical; font-family: Arial, sans-serif; }
        .axa-inp { width: 100%; border: 0; border-bottom: 1px solid #aaa; outline: none; background: transparent; font-size: 11px; padding: 2px 4px; font-family: Arial, sans-serif; box-sizing: border-box; }
        .axa-sm { width: 100%; border: 0; border-bottom: 1px solid #aaa; outline: none; background: transparent; font-size: 11px; padding: 1px 2px; font-family: Arial, sans-serif; box-sizing: border-box; }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
        <button
          onClick={() => window.print()}
          style={{ background: AXA_RED, color: 'white', border: 'none', borderRadius: 6, padding: '6px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
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
            <AxaHeader />

            {/* Footer address stripe */}
            <tr>
              <td colSpan={12} style={{ background: '#f0f4fb', borderBottom: `1px solid ${AXA_BLUE}`, padding: '2px 6px', fontSize: '8px', color: '#444' }}>
                AXA Seguros, S.A. de C.V. · Félix Cuevas 366, piso 3, Col. Tlacoquemécatl, alcaldía Benito Juárez, 03200, CDMX, México · Tels. 55 5169 1000 · 800 900 1292 · axa.mx
              </td>
            </tr>

            {/* Instrucciones */}
            <tr>
              <td colSpan={12} style={{ padding: '6px 8px', fontSize: '10px', lineHeight: 1.5 }}>
                <strong>Instrucciones:</strong>
                <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li>Es necesario llenar el presente formato en su totalidad con letra legible y sin abreviaturas.</li>
                  <li>El documento será inválido si presenta tachaduras, enmendaduras o datos ilegibles.</li>
                  <li>La inexacta o falsa declaración de los datos contenidos en este formato podría dar lugar a la negativa de la reclamación.</li>
                  <li>Se debe actualizar cada 6 meses en caso de tratamiento continuo.</li>
                  <li>Cada médico tratante e interconsultantes deberán llenar su propio formato.</li>
                </ol>
              </td>
            </tr>

            {/* Lugar y Fecha */}
            <tr>
              <td colSpan={8} style={cellStyle}>
                <div style={labelStyle}>Lugar:</div>
                <div style={{ padding: '2px 4px' }}>
                  <input className="axa-inp" defaultValue="León, Guanajuato" />
                </div>
              </td>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Fecha:</div>
                <div style={{ padding: '2px 4px' }}>
                  <input className="axa-inp" defaultValue={fnConsult} />
                </div>
              </td>
            </tr>

            {/* ── Información general ── */}
            <HDR label="Información general" />

            {/* Datos del Asegurado */}
            <SubHDR label="Datos del Asegurado afectado (paciente)" />
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Apellido paterno</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={d.ap1} /></div>
              </td>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Apellido materno</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={d.ap2} /></div>
              </td>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Nombre(s)</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={d.noms} /></div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={cellStyle}>
                <div style={labelStyle}>Edad</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={d.edad} /></div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={labelStyle}>Fecha de nacimiento</div>
                <div style={{ padding: '2px 4px', display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
                  <input className="axa-sm" defaultValue={dayB} placeholder="DD" style={{ width: 32 }} />
                  <span>/</span>
                  <input className="axa-sm" defaultValue={monB} placeholder="MM" style={{ width: 32 }} />
                  <span>/</span>
                  <input className="axa-sm" defaultValue={yrB} placeholder="AAAA" style={{ width: 46 }} />
                </div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={labelStyle}>Sexo</div>
                <div style={{ padding: '3px 4px' }}>
                  <Chk label="Masculino" name="sexo" checked={d.sexo === 'M'} />
                  <Chk label="Femenino" name="sexo" checked={d.sexo === 'F'} />
                </div>
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={labelStyle}>Talla (cm)</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
              <td colSpan={1} style={cellStyle}>
                <div style={labelStyle}>Peso (kg)</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
              <td colSpan={1} style={cellStyle}>
                <div style={labelStyle}>T.A.</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={d.signos_vitales?.ta ?? ''} /></div>
              </td>
            </tr>

            {/* Motivo de atención */}
            <HDR label="Motivo de la atención médica" />
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '5px 8px' }}>
                <Chk label="Enfermedad" />
                <Chk label="Accidente" />
                <Chk label="Maternidad" />
                <Chk label="Segunda opinión médica" />
              </td>
            </tr>

            {/* Tipo de estancia */}
            <HDR label="Tipo de estancia" />
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '5px 8px' }}>
                <Chk label="Urgencia" />
                <Chk label="Hospitalización" />
                <Chk label="Corta estancia / ambulatoria" />
                <Chk label="Consultorio" checked />
              </td>
            </tr>

            {/* Antecedentes médicos */}
            <HDR label="Antecedentes médicos" />
            <SubHDR label="Antecedentes patológicos" />
            <tr>
              <td colSpan={12} style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e8eef8' }}>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9, width: 30 }}>No.</th>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9 }}>Diagnóstico</th>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9, width: 130 }}>Fecha de diagnóstico (dd/mm/aaaa)</th>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9 }}>Tratamiento recibido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }, (_, i) => (
                      <tr key={i}>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: '1px 4px', fontSize: 10, textAlign: 'center', color: '#666' }}>{i + 1}</td>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: 0 }}>
                          <input className="axa-inp" defaultValue={i === 0 ? d.cronicos : ''} />
                        </td>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: 0 }}>
                          <input className="axa-inp" />
                        </td>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: 0 }}>
                          <input className="axa-inp" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Antecedentes no patológicos */}
            <SubHDR label="Antecedentes no patológicos" />
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span><Chk label="¿Fuma?" /><input className="axa-sm" defaultValue={d.tabaquismo} style={{ width: 100 }} /></span>
                  <span><Chk label="¿Consume bebidas alcohólicas?" /><input className="axa-sm" defaultValue={d.alcohol} style={{ width: 80 }} /></span>
                  <span><Chk label="¿Consume o ha consumido algún tipo de drogas?" /><input className="axa-sm" style={{ width: 80 }} /></span>
                  <span><Chk label="Otros:" /><input className="axa-sm" style={{ width: 120 }} /></span>
                </div>
              </td>
            </tr>

            {/* Ginecobstétricos / Perinatales */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Antecedentes ginecobstétricos</div>
                <div style={{ padding: '4px 6px', fontSize: 11 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span>Gestación: <input className="axa-sm" defaultValue={d.gesta ? d.gesta.match(/G\s*(\d+)/i)?.[1] ?? '' : ''} style={{ width: 36 }} /></span>
                    <span>Partos: <input className="axa-sm" style={{ width: 36 }} /></span>
                    <span>Abortos: <input className="axa-sm" style={{ width: 36 }} /></span>
                    <span>Cesáreas: <input className="axa-sm" style={{ width: 36 }} /></span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4, fontSize: 10 }}>
                    Fecha de última menstruación:&nbsp;
                    <input className="axa-sm" placeholder="DD" style={{ width: 30 }} />/
                    <input className="axa-sm" placeholder="MM" style={{ width: 30 }} />/
                    <input className="axa-sm" placeholder="AAAA" style={{ width: 44 }} />
                  </div>
                  <div style={{ marginBottom: 4 }}>Especificar si recibió tratamiento para infertilidad: <input className="axa-sm" style={{ width: 160 }} /></div>
                  <div>Tiempo de evolución: <input className="axa-sm" style={{ width: 100 }} /></div>
                </div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Antecedentes perinatales</div>
                <div style={{ padding: '4px 6px', fontSize: 11 }}>
                  <div style={{ marginBottom: 4 }}>Tiempo de evolución: <input className="axa-sm" style={{ width: 120 }} /></div>
                  <div style={{ marginBottom: 4 }}>Menarca: <input className="axa-sm" defaultValue={d.menarca} style={{ width: 80 }} /></div>
                  <div style={{ marginBottom: 4 }}>Ritmo: <input className="axa-sm" defaultValue={d.ritmo} style={{ width: 80 }} /></div>
                  <div style={{ marginBottom: 4 }}>Otras observaciones: <input className="axa-sm" style={{ width: 160 }} /></div>
                </div>
              </td>
            </tr>

            {/* Referido */}
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Referido por otro médico o unidad?&nbsp;
                <Chk label="Sí" name="referido" />
                <Chk label="No" name="referido" />
                &nbsp;&nbsp;¿Cuál?&nbsp;<input className="axa-inp" style={{ width: 220, display: 'inline-block' }} />
              </td>
            </tr>

            <AxaFooter page={1} total={TOTAL} />
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 2
      ════════════════════════════════════════════════════════════ */}
      <div style={PAGE(2, TOTAL)}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <AxaHeader />

            {/* Diagnósticos */}
            <HDR label="Diagnóstico(s)" />
            <SubHDR label="Padecimiento actual" />
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '3px 6px', fontSize: 11 }}>
                <textarea className="axa-ta" rows={4} defaultValue={d.padecimiento} />
              </td>
            </tr>

            {/* Fechas padecimiento */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Fecha de padecimiento</div>
                <div style={{ padding: '2px 4px', display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
                  <input className="axa-sm" placeholder="DD" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="MM" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="AAAA" style={{ width: 44 }} />
                </div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Fecha de diagnóstico</div>
                <div style={{ padding: '2px 4px', display: 'flex', gap: 4, alignItems: 'center', fontSize: 10 }}>
                  <input className="axa-sm" defaultValue={dayC} placeholder="DD" style={{ width: 30 }} />/
                  <input className="axa-sm" defaultValue={monC} placeholder="MM" style={{ width: 30 }} />/
                  <input className="axa-sm" defaultValue={yrC} placeholder="AAAA" style={{ width: 44 }} />
                </div>
              </td>
            </tr>

            {/* Tipo de padecimiento */}
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                <strong style={{ fontSize: 10 }}>Tipo de padecimiento:</strong>&nbsp;
                <Chk label="Congénito" />
                <Chk label="Adquirido" />
                <Chk label="Agudo" />
                <Chk label="Crónico" />
                &nbsp;Tiempo de evolución: <input className="axa-inp" style={{ width: 140, display: 'inline-block' }} />
              </td>
            </tr>

            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Causa o etiología del padecimiento:</div>
                <textarea className="axa-ta" rows={2} />
              </td>
            </tr>

            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Tiene relación con otro padecimiento?&nbsp;
                <Chk label="Sí" name="relacion" />
                <Chk label="No" name="relacion" />
                &nbsp;¿Cuál?&nbsp;<input className="axa-inp" style={{ width: 200, display: 'inline-block' }} />
              </td>
            </tr>

            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿El padecimiento ocasionó incapacidad?&nbsp;
                <Chk label="Sí" name="incap" />
                <Chk label="No" name="incap" />
                &nbsp;Desde: <input className="axa-inp" style={{ width: 100, display: 'inline-block' }} />
                &nbsp;Hasta: <input className="axa-inp" style={{ width: 100, display: 'inline-block' }} />
                &nbsp;<Chk label="Parcial" name="incapTipo" /><Chk label="Total" name="incapTipo" />
              </td>
            </tr>

            {/* Diagnóstico */}
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Diagnóstico (indicando si es unilateral o bilateral):</div>
                <textarea className="axa-ta" rows={3} defaultValue={dxFull} />
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Código ICD:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
              <td colSpan={4} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Es cáncer?&nbsp;<Chk label="Sí" name="cancer" /><Chk label="No" name="cancer" />
              </td>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Estadificación TNM:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Exploración física */}
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Señale los datos relevantes de exploración física:</div>
                <textarea className="axa-ta" rows={3} defaultValue={d.exploracion} />
              </td>
            </tr>

            {/* Estudios */}
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Describa los estudios de laboratorio y/o gabinete:</div>
                <textarea className="axa-ta" rows={2} defaultValue={d.estudios.join(', ')} />
              </td>
            </tr>

            {/* Tratamiento */}
            <HDR label="Tratamiento" />
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Tratamiento propuesto (quirúrgico, no quirúrgico):</div>
                <textarea className="axa-ta" rows={3} defaultValue={d.tx_texto} />
              </td>
            </tr>

            {/* Fechas cirugía/hospitalización/alta */}
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Fecha de cirugía</div>
                <div style={{ padding: '2px 4px', display: 'flex', gap: 4, fontSize: 10 }}>
                  <input className="axa-sm" placeholder="DD" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="MM" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="AAAA" style={{ width: 44 }} />
                </div>
              </td>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Fecha de hospitalización</div>
                <div style={{ padding: '2px 4px', display: 'flex', gap: 4, fontSize: 10 }}>
                  <input className="axa-sm" placeholder="DD" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="MM" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="AAAA" style={{ width: 44 }} />
                </div>
              </td>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Fecha de alta</div>
                <div style={{ padding: '2px 4px', display: 'flex', gap: 4, fontSize: 10 }}>
                  <input className="axa-sm" placeholder="DD" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="MM" style={{ width: 30 }} />/
                  <input className="axa-sm" placeholder="AAAA" style={{ width: 44 }} />
                </div>
              </td>
            </tr>

            <AxaFooter page={2} total={TOTAL} />
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 3
      ════════════════════════════════════════════════════════════ */}
      <div style={PAGE(3, TOTAL)}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <AxaHeader />

            {/* Complicaciones */}
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Se presentaron complicaciones?&nbsp;
                <Chk label="Sí" name="complic" />
                <Chk label="No" name="complic" />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Describa:</div>
                <textarea className="axa-ta" rows={2} />
              </td>
            </tr>

            {/* Tratamiento futuro */}
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Continuará recibiendo tratamiento en el futuro?&nbsp;
                <Chk label="Sí" name="futuro" />
                <Chk label="No" name="futuro" />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Describa el tratamiento:</div>
                <textarea className="axa-ta" rows={2} />
              </td>
            </tr>

            {/* Medicamentos / quimio / radio */}
            <HDR label="Programación de sesiones de quimioterapia o radioterapia" />
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '2px 6px', fontSize: '9px', color: '#555', fontStyle: 'italic' }}>
                (En caso de ser más de 10 medicamentos, favor de llenar otro formato)
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e8eef8' }}>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9, width: 24 }}>#</th>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9 }}>Nombre y presentación del medicamento</th>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9, width: 60 }}>Cantidad</th>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9, width: 80 }}>Cada cuánto</th>
                      <th style={{ border: `1px solid ${AXA_BLUE}`, padding: '2px 4px', fontSize: 9, width: 120 }}>Durante cuánto tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }, (_, i) => (
                      <tr key={i}>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: '1px 4px', fontSize: 10, textAlign: 'center', color: '#666' }}>{i + 1}</td>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: 0 }}><input className="axa-inp" /></td>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: 0 }}><input className="axa-inp" /></td>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: 0 }}><input className="axa-inp" /></td>
                        <td style={{ border: `1px solid ${AXA_BLUE}`, padding: 0 }}><input className="axa-inp" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Días atención / Sitio */}
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={labelStyle}>Días que se brindó atención médica:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
              <td colSpan={8} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                Sitio del procedimiento:&nbsp;
                <Chk label="Consultorio" name="sitio" />
                <Chk label="Hospital" name="sitio" />
                <Chk label="Gabinete" name="sitio" />
                <Chk label="Otro" name="sitio" />
                &nbsp;Especifique: <input className="axa-inp" style={{ width: 120, display: 'inline-block' }} />
              </td>
            </tr>

            {/* Hospital */}
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>En caso de Hospital — Nombre del hospital:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={d.hospital} /></div>
              </td>
            </tr>

            {/* Estudio histopatológico */}
            <tr>
              <td colSpan={12} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Se realizó estudio histopatológico?&nbsp;
                <Chk label="Sí" name="histo" />
                <Chk label="No" name="histo" />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Describa resultado:</div>
                <textarea className="axa-ta" rows={2} />
              </td>
            </tr>

            {/* Observaciones */}
            <HDR label="Observaciones" />
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Si tiene alguna observación adicional:</div>
                <textarea className="axa-ta" rows={3} />
              </td>
            </tr>

            <AxaFooter page={3} total={TOTAL} />
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PÁGINA 4 — Datos del médico / Firma
      ════════════════════════════════════════════════════════════ */}
      <div style={PAGE(4, TOTAL)}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <AxaHeader />

            <HDR label="Datos del médico" />

            {/* Dos columnas: médico / anestesiólogo */}
            <tr>
              <td colSpan={6} style={{ padding: 0 }}>
                <div style={{ ...subhdr, textAlign: 'center' }}>Médico o especialista</div>
              </td>
              <td colSpan={6} style={{ padding: 0 }}>
                <div style={{ ...subhdr, textAlign: 'center' }}>Médico o especialista (anestesiólogo)</div>
              </td>
            </tr>

            {/* ¿Ajusta Tabulador? */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Se ajusta a Tabulador médico?&nbsp;
                <Chk label="Sí" name="tab1" />
                <Chk label="No" name="tab1" />
              </td>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                ¿Se ajusta a Tabulador médico?&nbsp;
                <Chk label="Sí" name="tab2" />
                <Chk label="No" name="tab2" />
              </td>
            </tr>

            {/* Tipo de participación */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Tipo de participación:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue="Cirujano principal" /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Tipo de participación:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue="Anestesiólogo" /></div>
              </td>
            </tr>

            {/* Nombre */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Nombre:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue="Fernando Quiroz Compeán" /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Nombre:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Especialidad */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Especialidad:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue="Gastroenterología" /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Especialidad:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Cédula profesional */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Cédula profesional:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={doctor.cedula_prof} /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Cédula profesional:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Cédula especialidad */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Cédula de especialidad:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={doctor.cedula_esp} /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Cédula de especialidad:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* RFC */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>RFC a facturar:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={doctor.rfc} /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>RFC a facturar:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Domicilio */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Domicilio:</div>
                <div style={{ padding: '2px 4px' }}>
                  <input className="axa-inp" defaultValue={cons ? `${cons.hospital}, ${cons.consultorio ?? ''}, ${cons.ciudad}, ${cons.estado}` : ''} />
                </div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Domicilio:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Teléfono */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Teléfono:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" defaultValue={tel} /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Teléfono:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Ayudantes */}
            <SubHDR label="Ayudantes" />
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Ayudante 1 — Nombre:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
              <td colSpan={6} style={cellStyle}>
                <div style={labelStyle}>Ayudante 2 — Nombre:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Otros médicos */}
            <tr>
              <td colSpan={12} style={cellStyle}>
                <div style={labelStyle}>Otros médicos:</div>
                <div style={{ padding: '2px 4px' }}><input className="axa-inp" /></div>
              </td>
            </tr>

            {/* Firma */}
            <tr>
              <td colSpan={6} style={{ border: `1px solid ${AXA_BLUE}`, padding: '8px 12px', textAlign: 'center', fontSize: 11, minHeight: 80 }}>
                <div style={{ height: 70, borderBottom: `1px solid #999`, marginBottom: 4 }} />
                <strong>Firma del médico</strong>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Fernando Quiroz Compeán · Gastroenterología</div>
              </td>
              <td colSpan={6} style={{ border: `1px solid ${AXA_BLUE}`, padding: '8px 12px', textAlign: 'center', fontSize: 11, minHeight: 80 }}>
                <div style={{ height: 40, marginBottom: 4 }} />
                <div style={{ borderBottom: '1px solid #999', marginBottom: 4 }} />
                <strong>Lugar y fecha</strong>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
                  <input className="axa-inp" defaultValue={`León, Guanajuato · ${fnConsult}`} />
                </div>
              </td>
            </tr>

            {/* Texto legal */}
            <tr>
              <td colSpan={12} style={{ border: `1px solid ${AXA_BLUE}`, padding: '6px 8px', fontSize: '9px', color: '#444', lineHeight: 1.4 }}>
                El médico que suscribe el presente documento declara que la información contenida es verídica y exacta, siendo responsable de la misma.
                Asimismo, declara estar al tanto de que la falsedad u omisión de datos puede dar lugar al no pago o reintegro de las sumas pagadas, sin
                perjuicio de las acciones legales a que hubiere lugar. Autorizo a AXA Seguros, S.A. de C.V. a verificar la información aquí declarada
                con las instituciones médicas o de salud que estime pertinentes.
              </td>
            </tr>

            <AxaFooter page={4} total={TOTAL} />
          </tbody>
        </table>
      </div>
    </div>
  )
}
