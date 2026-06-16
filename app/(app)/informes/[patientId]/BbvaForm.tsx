'use client'

import { useState } from 'react'

/* ── palette ────────────────────────────────────────────────────────────────── */
const COLOR = '#003087'
const COLOR_LIGHT = '#dce8f8'

/* ── shared styles ──────────────────────────────────────────────────────────── */
const cellStyle: React.CSSProperties = {
  border: `1px solid ${COLOR}`,
  padding: 0,
  verticalAlign: 'top',
}
const hdr: React.CSSProperties = {
  background: COLOR,
  color: 'white',
  fontWeight: 700,
  fontSize: 11,
  padding: '3px 7px',
  textTransform: 'uppercase' as const,
  letterSpacing: 0.3,
}
const subhdr: React.CSSProperties = {
  background: COLOR_LIGHT,
  color: COLOR,
  fontWeight: 600,
  fontSize: 10,
  padding: '2px 5px',
}
const inp: React.CSSProperties = {
  border: 'none',
  borderBottom: `1px solid #aaa`,
  outline: 'none',
  background: 'transparent',
  width: '100%',
  fontSize: 11,
  padding: '1px 3px',
  fontFamily: 'Arial, sans-serif',
}
const ta: React.CSSProperties = {
  ...inp,
  borderBottom: 'none',
  display: 'block',
  resize: 'vertical' as const,
  padding: '2px 4px',
  lineHeight: 1.4,
}
const radRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '3px 12px',
  padding: '2px 4px',
  fontSize: 11,
}

/* ── types ──────────────────────────────────────────────────────────────────── */
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

/* ── helpers ────────────────────────────────────────────────────────────────── */
function fmtDate(s: string) {
  return s ? s.split('-').reverse().join('/') : ''
}

/* ── sub-components ─────────────────────────────────────────────────────────── */
function TH({ children, colSpan, note }: { children: React.ReactNode; colSpan?: number; note?: string }) {
  return (
    <tr>
      <td colSpan={colSpan ?? 6} style={{ ...cellStyle, padding: 0 }}>
        <div style={hdr}>
          {children}
          {note && <span style={{ fontSize: 9, fontWeight: 400, marginLeft: 8, opacity: 0.9 }}>{note}</span>}
        </div>
      </td>
    </tr>
  )
}

function Field({
  label, children, colSpan, width,
}: { label: string; children: React.ReactNode; colSpan?: number; width?: string }) {
  return (
    <td colSpan={colSpan} style={{ ...cellStyle, width }}>
      <div style={subhdr}>{label}</div>
      <div style={{ padding: '2px 4px', minHeight: 20 }}>{children}</div>
    </td>
  )
}

function Radios({ name, options, defaultValue }: { name: string; options: string[]; defaultValue?: string }) {
  return (
    <div style={radRow}>
      {options.map(o => (
        <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="radio" name={name} defaultChecked={o === defaultValue} /> {o}
        </label>
      ))}
    </div>
  )
}

/* ── BBVA Header ────────────────────────────────────────────────────────────── */
function BBVAHeader() {
  return (
    <tr>
      <td colSpan={6} style={{ ...cellStyle, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              {/* Logo */}
              <td style={{ width: '28%', padding: '6px 12px', verticalAlign: 'middle', borderRight: `2px solid ${COLOR}` }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: COLOR, letterSpacing: 1 }}>BBVA</div>
                <div style={{ fontWeight: 700, fontSize: 11, color: COLOR }}>Seguros Salud</div>
              </td>
              {/* Title */}
              <td style={{ padding: '6px 12px', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: 900, fontSize: 17, color: COLOR }}>INFORME MÉDICO</div>
                <div style={{ fontSize: 10, color: '#555' }}>BBVA Seguros Salud México S.A. de C.V., Grupo Financiero BBVA México</div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
function BBVAFooter({ page }: { page: string }) {
  return (
    <tr>
      <td colSpan={6} style={{ border: `1px solid ${COLOR}`, padding: '3px 8px', fontSize: 9, color: '#555' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: 9, color: '#555' }}>Rev.04</td>
              <td style={{ textAlign: 'center', fontSize: 9, color: '#555' }}>{page}</td>
              <td style={{ textAlign: 'right', fontSize: 9, color: '#555' }}>FDGL-141</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export default function BbvaForm({ data, doctor }: Props) {
  const [d] = useState<PatientData>({ ...data })
  const [fDia, fMes, fAnio] = fmtDate(d.fecha_consulta).split('/')
  const dxTexto = [...(d.dx ?? []), d.dx_texto].filter(Boolean).join('\n')

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 840, margin: '0 auto', background: 'white' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 8mm; size: A4; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => window.print()}
          style={{ background: COLOR, color: 'white', border: 'none', borderRadius: 6, padding: '7px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
        >
          Imprimir / PDF
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 1
      ══════════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <BBVAHeader />

            {/* ── Texto introductorio ──────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 10px', fontSize: 10 }}>
                <div style={{ fontSize: 10, marginBottom: 3 }}>
                  <strong>BBVA Seguros Salud México S.A. de C.V., Grupo Financiero BBVA México</strong>
                </div>
                <div style={{ fontSize: 10, marginBottom: 5, color: '#555' }}>
                  a quien en lo sucesivo se le denominará <em>"LA ASEGURADORA"</em>
                </div>
                <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 3 }}>Indicaciones:</div>
                <ol style={{ margin: '0 0 0 16px', padding: 0, fontSize: 10, lineHeight: 1.6, color: '#333' }}>
                  <li>El informe debe ser llenado en su totalidad. En caso de no aplicar algún punto, indicar "No aplica".</li>
                  <li>Este documento no será válido con tachaduras o enmendaduras.</li>
                  <li>Al firmar la información proporcionada en este informe el médico se hace responsable de la misma.</li>
                  <li>El informe médico tiene una vigencia de 6 meses a partir de la fecha de elaboración.</li>
                </ol>
              </td>
            </tr>

            {/* ── DATOS DEL PACIENTE ───────────────────────────────── */}
            <TH>Datos del paciente</TH>
            <tr>
              <Field label="Nombre(s)" colSpan={2}><input style={inp} defaultValue={d.noms} /></Field>
              <Field label="Apellido Paterno" colSpan={2}><input style={inp} defaultValue={d.ap1} /></Field>
              <Field label="Apellido Materno" colSpan={2}><input style={inp} defaultValue={d.ap2} /></Field>
            </tr>
            <tr>
              <Field label="Edad"><input style={inp} defaultValue={d.edad} /></Field>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Sexo</div>
                <Radios name="bbva-sexo" options={['Masculino', 'Femenino']} defaultValue={d.sexo === 'F' ? 'Femenino' : 'Masculino'} />
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Causa de Atención</div>
                <Radios name="bbva-causa" options={['Embarazo', 'Enfermedad', 'Accidente']} defaultValue="Enfermedad" />
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Referido por otro Médico o Unidad</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px' }}>
                  <Radios name="bbva-ref" options={['Si', 'No']} defaultValue="No" />
                  <span style={{ fontSize: 10 }}>¿Cuál?</span>
                  <input style={{ ...inp, flex: 1 }} />
                </div>
              </td>
              <Field label="No. de Póliza" colSpan={3}><input style={inp} /></Field>
            </tr>

            {/* ── HISTORIA CLÍNICA ─────────────────────────────────── */}
            <TH>Historia Clínica —especificar tiempo de evolución—</TH>
            <tr>
              {/* Antecedentes patológicos */}
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes Personales Patológicos —incluir fechas—</div>
                <div style={{ padding: '3px 6px', fontSize: 10 }}>
                  <div style={{ fontSize: 10, marginBottom: 4, color: '#444', fontStyle: 'italic' }}>
                    Describa Diagnósticos y Tratamientos Médico-Quirúrgicos recibidos. Aún cuando no tengan relación al padecimiento actual.
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', marginBottom: 5 }}>
                    {['Cardiacos', 'Hipertensivos', 'Diabetes Mellitus', 'Cáncer', 'Enf. Infectocontagiosas', 'Hepáticos', 'Neurológicos', 'Cirugías', 'Otros', 'Paciente niega antecedentes'].map(c => (
                      <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }}>
                        <input type="checkbox" defaultChecked={
                          (c !== 'Paciente niega antecedentes') &&
                          (d.cronicos?.toLowerCase().includes(c.split(' ')[0].toLowerCase()) ||
                            (c === 'Cirugías' && !!d.quirurgicos))
                        } /> {c}
                      </label>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>Especifica tiempo de evolución</div>
                  <textarea style={{ ...ta, minHeight: 65 }} defaultValue={[d.cronicos, d.quirurgicos].filter(Boolean).join('\n')} rows={4} />
                </div>
              </td>

              {/* Antecedentes ginecoobstétricos */}
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes Ginecoobstétricos</div>
                <div style={{ padding: '3px 6px', fontSize: 10 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Menarca (fecha)', d.menarca ?? ''],
                        ['FUM (fecha de última menstruación)', ''],
                        ['Embarazos (Cantidad)', d.gesta ?? ''],
                        ['Cesárea (Cantidad)', ''],
                        ['Partos (Cantidad)', ''],
                        ['Abortos (Cantidad)', ''],
                        ['Otros', ''],
                      ].map(([lbl, val]) => (
                        <tr key={lbl as string}>
                          <td style={{ fontSize: 10, paddingRight: 4, paddingTop: 2, whiteSpace: 'nowrap', verticalAlign: 'middle', width: '55%' }}>{lbl}:</td>
                          <td><input style={inp} defaultValue={val as string} /></td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={2} style={{ paddingTop: 3 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }}>
                            <input type="checkbox" /> Paciente niega antecedentes
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Antecedentes Perinatales.</div>
                    <textarea style={{ ...ta, minHeight: 35 }} rows={2} />
                  </div>
                </div>
              </td>
            </tr>

            {/* Antecedentes no patológicos */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Antecedentes Personales No Patológicos</div>
                <div style={{ padding: '4px 8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '50%', padding: '2px 4px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', fontSize: 10 }}>
                            <input type="checkbox" style={{ marginTop: 2 }} />
                            <div style={{ flex: 1 }}>
                              <div>¿Consume bebidas alcohólicas? <em style={{ fontSize: 9 }}>-especificar tipo y cantidad-</em></div>
                              <input style={inp} defaultValue={d.alcohol ?? ''} />
                            </div>
                          </div>
                        </td>
                        <td style={{ width: '50%', padding: '2px 4px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', fontSize: 10 }}>
                            <input type="checkbox" style={{ marginTop: 2 }} />
                            <div style={{ flex: 1 }}>
                              <div>¿Consume o ha consumido algún tipo de Droga? <em style={{ fontSize: 9 }}>-especificar tipo y cantidad-</em></div>
                              <input style={inp} defaultValue="No" />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', fontSize: 10 }}>
                            <input type="checkbox" style={{ marginTop: 2 }} />
                            <div style={{ flex: 1 }}>
                              <div>Otros</div>
                              <input style={inp} defaultValue={d.tabaquismo ? `Tabaquismo: ${d.tabaquismo}` : ''} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '2px 4px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', fontSize: 10 }}>
                            <input type="checkbox" style={{ marginTop: 2 }} />
                            <div style={{ flex: 1 }}>
                              <div>¿Ha sufrido pérdida intencional de peso? <em style={{ fontSize: 9 }}>-Describir qué tipo de dieta, medicamento, cirugía y fecha.-</em></div>
                              <input style={inp} defaultValue="No" />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ padding: '2px 8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                            <input type="checkbox" /> Paciente niega antecedentes
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>

            {/* ── PADECIMIENTO ACTUAL ──────────────────────────────── */}
            <TH>Descripción de la evolución del padecimiento actual y síntomas.</TH>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <textarea style={{ ...ta, minHeight: 80 }} defaultValue={d.padecimiento} rows={4} />
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fecha de inicio de síntomas</div>
                <div style={{ padding: '4px 6px', fontSize: 11 }}>
                  <div>dd <input style={{ ...inp, width: '100%' }} /></div>
                  <div style={{ marginTop: 3 }}>mes <input style={{ ...inp, width: '100%' }} /></div>
                  <div style={{ marginTop: 3 }}>año <input style={{ ...inp, width: '100%' }} /></div>
                </div>
              </td>
            </tr>

            {/* ── EXPLORACIÓN Y ESTUDIOS ──────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>
                  Resultado de la exploración física y de los estudios realizados, debe anexar interpretaciones que confirmen el diagnóstico.
                </div>
                <textarea style={{ ...ta, minHeight: 70 }} defaultValue={[d.exploracion, (d.estudios ?? []).join(', ')].filter(Boolean).join('\n')} rows={4} />
              </td>
            </tr>

            <BBVAFooter page="1 de 3" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 2
      ══════════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <BBVAHeader />

            {/* ── DIAGNÓSTICO ──────────────────────────────────────── */}
            <TH>Descripción del Diagnóstico definitivo</TH>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <textarea style={{ ...ta, minHeight: 60 }} defaultValue={dxTexto} rows={3} />
                <div style={{ display: 'flex', gap: 12, padding: '3px 6px', fontSize: 11 }}>
                  <span style={{ fontWeight: 600 }}>Diagnóstico:</span>
                  <Radios name="bbva-dxtipo" options={['Inicial', 'Subsecuente']} defaultValue="Inicial" />
                </div>
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fecha de diagnóstico</div>
                <div style={{ padding: '4px 6px', fontSize: 11 }}>
                  <div>dd <input style={{ ...inp, width: '100%' }} defaultValue={fDia} /></div>
                  <div style={{ marginTop: 3 }}>mes <input style={{ ...inp, width: '100%' }} defaultValue={fMes} /></div>
                  <div style={{ marginTop: 3 }}>año <input style={{ ...inp, width: '100%' }} defaultValue={fAnio} /></div>
                </div>
              </td>
            </tr>

            {/* ── ETIOLOGÍA ───────────────────────────────────────── */}
            <TH>Etiología</TH>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <textarea style={{ ...ta, minHeight: 45 }} rows={2} />
              </td>
            </tr>

            {/* ── TIPO DE PADECIMIENTO ─────────────────────────────── */}
            <TH>Tipo de Padecimiento</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', marginBottom: 5, fontSize: 11 }}>
                  {['Congénito', 'Adquirido', 'Agudo', 'Crónico'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="checkbox" /> {t}
                    </label>
                  ))}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                    Tiempo de evolución: <input style={{ ...inp, width: 100 }} />
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '50%', padding: '2px 4px', fontSize: 10, verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>¿Tiene relación con otro padecimiento?</span>
                          <Radios name="bbva-rel" options={['Sí', 'No']} defaultValue="No" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <span>¿Cuál?</span><input style={{ ...inp, flex: 1 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <span>Fecha de inicio de padecimiento:</span><input style={{ ...inp, flex: 1 }} />
                        </div>
                      </td>
                      <td style={{ width: '50%', padding: '2px 4px', fontSize: 10, verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>¿El padecimiento ocasionó discapacidad?</span>
                          <Radios name="bbva-disc" options={['Sí', 'No']} defaultValue="No" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <Radios name="bbva-disctype" options={['Parcial', 'Total']} />
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 10 }}>
                          <span>Desde: <input style={{ ...inp, width: 70 }} /></span>
                          <span>Hasta: <input style={{ ...inp, width: 70 }} /></span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: '3px 4px', fontSize: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>¿Continuará recibiendo tratamiento en el futuro?</span>
                          <Radios name="bbva-cont" options={['Sí', 'No']} defaultValue="Sí" />
                          <span>Favor de especificar:</span><input style={{ ...inp, flex: 1 }} />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── TRATAMIENTO ─────────────────────────────────────── */}
            <TH>Tratamiento</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 3 }}>Favor de indicar:</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 3, fontSize: 11 }}>
                  <label style={{ display: 'flex', gap: 3 }}><input type="radio" name="bbva-txtipo" /> Tratamiento quirúrgico (favor de especificar el procedimiento)</label>
                  <label style={{ display: 'flex', gap: 3 }}><input type="radio" name="bbva-txtipo" defaultChecked /> Tratamiento médico (favor de describir tratamiento, dosificación y fecha de inicio)</label>
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 3 }}>Indicar:</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 4, fontSize: 11 }}>
                  <label style={{ display: 'flex', gap: 3 }}><input type="radio" name="bbva-txmodalidad" /> Programación de tratamiento</label>
                  <label style={{ display: 'flex', gap: 3 }}><input type="radio" name="bbva-txmodalidad" defaultChecked /> Descripción de tratamiento ya realizado</label>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={subhdr}>Descripción</div>
                <textarea style={{ ...ta, minHeight: 70 }} defaultValue={d.tx_texto} rows={4} />
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>¿Hubo Complicaciones?</div>
                <div style={{ padding: '3px 6px' }}>
                  <Radios name="bbva-comp" options={['Sí', 'No']} defaultValue="No" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 10 }}>
                    <span>Especificar:</span><input style={{ ...inp, flex: 1 }} />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <Field label="Hospital" colSpan={3}><input style={inp} defaultValue={d.hospital} /></Field>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Tipo de estancia</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '2px 4px', fontSize: 10 }}>
                  <label><input type="radio" name="bbva-estancia" /> Hospitalaria</label>
                  <label><input type="radio" name="bbva-estancia" defaultChecked /> Corta estancia</label>
                  <label><input type="radio" name="bbva-estancia" /> Urgencia</label>
                </div>
              </td>
              <td style={cellStyle}>
                <div style={subhdr}>Fecha de ingreso</div>
                <div style={{ padding: '3px 5px', fontSize: 10 }}>
                  <div>dd <input style={{ ...inp }} defaultValue={fDia} /></div>
                  <div>mes <input style={{ ...inp }} defaultValue={fMes} /></div>
                  <div>año <input style={{ ...inp }} defaultValue={fAnio} /></div>
                </div>
              </td>
            </tr>
            <tr>
              <Field label="Estado / Ciudad" colSpan={3}>
                <input style={inp} defaultValue={[d.hospital_ciudad, d.hospital_estado].filter(Boolean).join(', ')} />
              </Field>
              <Field label="Fecha de egreso" colSpan={3}>
                <div style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 11 }}>
                  <span>dd <input style={{ ...inp, width: 35 }} /></span>
                  <span>mes <input style={{ ...inp, width: 35 }} /></span>
                  <span>año <input style={{ ...inp, width: 50 }} /></span>
                </div>
              </Field>
            </tr>

            <BBVAFooter page="2 de 3" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 3
      ══════════════════════════════════════════════════════════ */}
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <BBVAHeader />

            {/* ── DATOS MÉDICO TRATANTE ─────────────────────────────── */}
            <TH note="el llenado de todos los campos son obligatorios">Datos del médico tratante</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '3px 8px' }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                  <Radios name="bbva-rol" options={['Tratante', 'Interconsultante']} defaultValue="Tratante" />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                    En caso de ser Interconsultante — Motivo: <input style={{ ...inp, width: 150 }} />
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <Field label="Nombre(s)" colSpan={2}><input style={inp} defaultValue={doctor.nombres} /></Field>
              <Field label="Apellido Paterno" colSpan={2}><input style={inp} defaultValue={doctor.apellido1} /></Field>
              <Field label="Apellido Materno" colSpan={2}><input style={inp} defaultValue={doctor.apellido2} /></Field>
            </tr>
            <tr>
              <Field label="Especialidad" colSpan={2}><input style={inp} defaultValue={doctor.especialidad} /></Field>
              <Field label="Cédula Profesional" colSpan={2}><input style={inp} defaultValue={doctor.cedula_prof} /></Field>
              <Field label="Cédula de Especialidad o Certificación" colSpan={2}><input style={inp} defaultValue={doctor.cedula_esp} /></Field>
            </tr>
            <tr>
              <Field label="RFC" colSpan={2}><input style={inp} defaultValue={doctor.rfc} /></Field>
              <Field label="Teléfono" colSpan={2}><input style={inp} defaultValue={doctor.celular} /></Field>
              <Field label="Correo electrónico" colSpan={2}><input style={inp} defaultValue={doctor.email_seguros} /></Field>
            </tr>
            <tr>
              <Field label="Celular" colSpan={3}><input style={inp} defaultValue={doctor.celular} /></Field>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Acepto tabulador y autorizo pago directo por BBVA</div>
                <Radios name="bbva-tab" options={['Sí', 'No']} defaultValue="Sí" />
              </td>
            </tr>

            {/* ── PRESUPUESTO ─────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '3px 8px', fontSize: 10, color: '#444' }}>
                Favor de indicar su presupuesto, independientemente si se acepta o no el tabulador.
              </td>
            </tr>
            <tr>
              <Field label="Honorarios por procedimiento" colSpan={2}><input style={inp} /></Field>
              <Field label="Honorarios por consulta" colSpan={2}><input style={inp} /></Field>
              <Field label="No. de visitas hospitalarias" colSpan={2}><input style={inp} /></Field>
            </tr>

            {/* ── Box informativo ─────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ border: `2px solid ${COLOR}`, padding: '6px 10px', background: '#edf3fc' }}>
                <div style={{ fontSize: 10, color: COLOR, lineHeight: 1.6 }}>
                  <strong>En caso de ser médico de red, no es necesario responder el siguiente registro.</strong>
                </div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 3 }}>
                  Al aceptar el pago directo por BBVA Seguros Salud me comprometo a realizar mi registro en un plazo no mayor
                  a 30 días después de la intervención.
                </div>
              </td>
            </tr>

            {/* ── Médicos participantes ─────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px', fontSize: 10, color: '#444' }}>
                En caso de programar un tratamiento favor de indicar nombre(s), celular de contacto y especialidad del(los) médico(s) que participa(n).
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, marginBottom: 6 }}>
                  <Radios name="bbva-fact" options={['Global', 'Individual']} defaultValue="Global" />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0, width: '40%' }}>
                        <div style={{ ...subhdr, fontSize: 10 }}>Anestesiólogo</div>
                        <div style={{ padding: '1px 4px' }}><input style={inp} /></div>
                      </td>
                      <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0, width: '20%' }}>
                        <div style={{ ...subhdr, fontSize: 10 }}>Celular</div>
                        <div style={{ padding: '1px 4px' }}><input style={inp} /></div>
                      </td>
                      <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0, width: '40%' }}>
                        <div style={{ ...subhdr, fontSize: 10 }}>Ayudante 1</div>
                        <div style={{ padding: '1px 4px' }}><input style={inp} /></div>
                      </td>
                      <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0, width: '20%' }}>
                        <div style={{ ...subhdr, fontSize: 10 }}>Celular</div>
                        <div style={{ padding: '1px 4px' }}><input style={inp} /></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Texto legal ─────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '6px 10px', fontSize: 9, color: '#444', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  El suscrito, bajo protesta de decir verdad, manifiesta que la información contenida en el presente informe médico
                  es verídica y se hace responsable de la misma.
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  El médico tratante al firmar este documento, acepta que la información proporcionada puede ser verificada por
                  BBVA Seguros Salud México S.A. de C.V. y que en caso de encontrarse información falsa o incompleta,
                  se reserva el derecho de reclamar los gastos realizados.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Aviso de Privacidad:</strong> Los datos personales que proporcione serán tratados conforme al aviso de privacidad
                  disponible en bbvaseguros.com.mx, para las finalidades de gestión de siniestros y servicios médicos contratados.
                  Puede ejercer sus derechos ARCO en privacidad@bbva.com.
                </p>
              </td>
            </tr>

            {/* ── FIRMAS ──────────────────────────────────────────── */}
            <tr>
              <td colSpan={4} style={{ ...cellStyle, padding: '8px 12px', textAlign: 'center', fontSize: 11, minHeight: 80 }}>
                <div style={{ height: 60, borderBottom: `1px solid ${COLOR}`, marginBottom: 4 }} />
                <strong>Fernando Quiroz Compeán</strong>
                <div style={{ fontSize: 10, color: '#555' }}>Nombre y firma del Médico Tratante</div>
              </td>
              <td colSpan={2} style={{ ...cellStyle, padding: '8px 12px', textAlign: 'center', fontSize: 11, minHeight: 80 }}>
                <div style={{ height: 60, borderBottom: `1px solid ${COLOR}`, marginBottom: 4 }} />
                <div>León, Guanajuato, {fmtDate(d.fecha_consulta)}</div>
                <div style={{ fontSize: 10, color: '#555' }}>Lugar y fecha</div>
              </td>
            </tr>

            {/* ── Footer ──────────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ border: `1px solid ${COLOR}`, padding: '3px 8px', fontSize: 9, color: '#555' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: 9, color: '#555' }}>BBVA Seguros Salud México S.A. de C.V., Grupo Financiero BBVA México</td>
                      <td style={{ textAlign: 'center', fontSize: 9 }}>Rev.04</td>
                      <td style={{ textAlign: 'center', fontSize: 9 }}>3 de 3</td>
                      <td style={{ textAlign: 'right', fontSize: 9 }}>FDGL-141</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
