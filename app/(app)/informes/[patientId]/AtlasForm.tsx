'use client'

import { useState } from 'react'

/* ── shared styles ──────────────────────────────────────────────────────────── */
const COLOR = '#1a4f7a'
const COLOR_LIGHT = '#c8daea'

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
  padding: '3px 8px',
}
const subhdr: React.CSSProperties = {
  background: '#dde8f3',
  color: COLOR,
  fontWeight: 700,
  fontSize: 10,
  padding: '2px 6px',
  borderBottom: `1px solid ${COLOR_LIGHT}`,
}
const inp: React.CSSProperties = {
  border: 'none',
  borderBottom: '1px solid #aaa',
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
function TH({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan ?? 6} style={{ ...cellStyle, padding: 0 }}>
        <div style={hdr}>{children}</div>
      </td>
    </tr>
  )
}

function Field({ label, children, colSpan }: { label: string; children: React.ReactNode; colSpan?: number }) {
  return (
    <td colSpan={colSpan} style={cellStyle}>
      <div style={subhdr}>{label}</div>
      <div style={{ padding: '2px 4px', minHeight: 20 }}>{children}</div>
    </td>
  )
}

function DateFields({ prefix, dia, mes, anio }: { prefix: string; dia?: string; mes?: string; anio?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 5px', fontSize: 11 }}>
      <span style={{ fontSize: 10 }}>Día</span>
      <input style={{ ...inp, width: 28 }} defaultValue={dia} />
      <span style={{ fontSize: 10 }}>Mes</span>
      <input style={{ ...inp, width: 28 }} defaultValue={mes} />
      <span style={{ fontSize: 10 }}>Año</span>
      <input style={{ ...inp, width: 42 }} defaultValue={anio} />
    </div>
  )
}

/* ── Atlas header (repeated on each page) ────────────────────────────────────── */
function AtlasHeader() {
  return (
    <tr>
      <td colSpan={6} style={{ ...cellStyle, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 12px', verticalAlign: 'middle', width: '50%' }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: COLOR, letterSpacing: 1 }}>INFORME MÉDICO</div>
              </td>
              <td style={{ padding: '6px 12px', verticalAlign: 'middle', textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: COLOR }}>Seguros Atlas<sup style={{ fontSize: 9 }}>®</sup></div>
                <div style={{ fontSize: 10, color: '#555', fontStyle: 'italic' }}>La empresa a mi medida</div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

/* ── Atlas footer ─────────────────────────────────────────────────────────────── */
function AtlasFooter({ page }: { page: string }) {
  return (
    <tr>
      <td colSpan={6} style={{ border: `1px solid ${COLOR}`, padding: '3px 8px', fontSize: 8, color: '#555' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: 8, color: '#555' }}>
                FF-284-AV-PDF/01-2022 &nbsp;|&nbsp; Seguros Atlas, S.A. &nbsp;Paseo de los Tamarindos No. 60, Bosques de las Lomas, Cuajimalpa de Morelos, C.P. 05120, CDMX. &nbsp;RFC: ASE-660222-RX3
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 9, color: COLOR }}>{page}</td>
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
export default function AtlasForm({ data, doctor }: Props) {
  const [d] = useState<PatientData>({ ...data })
  const cons = d.consultorio
  const tel = cons?.telefono ?? doctor.consultorios?.Muguerza?.telefono ?? ''

  const dxTexto = [...(d.dx ?? []), d.dx_texto].filter(Boolean).join('\n')
  const [fDia, fMes, fAnio] = fmtDate(d.fecha_consulta).split('/')
  const [nDia, nMes, nAnio] = fmtDate(d.fecha_nacimiento).split('/')

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
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
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
            <AtlasHeader />

            {/* ── TIPO DE TRÁMITE ───────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ display: 'flex', gap: 20, fontSize: 11 }}>
                  {['Programación de cirugía', 'Tratamiento médico', 'Reembolso'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="checkbox" /> {t}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* ── AVISO MUY IMPORTANTE ──────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 8px', fontSize: 10, color: '#222', lineHeight: 1.5 }}>
                <strong>Muy importante: </strong>
                Por el hecho de proporcionar este formulario o investigar la reclamación, Seguros Atlas, S.A. no queda obligada a admitir
                validez de ninguna reclamación ni el monto de ella, ni a renunciar a los derechos que le correspondan conforme a la ley
                y al clausulado de la póliza.
              </td>
            </tr>

            {/* ── INSTRUCCIONES ────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 8px', fontSize: 10, color: '#222', lineHeight: 1.6, border: `1px solid ${COLOR}` }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Instrucciones:</div>
                <div>1.- Este formato debe ser llenado y firmado por el médico tratante con letra de molde.</div>
                <div>2.- Le suplicamos no dejar preguntas ni espacios sin contestar.</div>
                <div>3.- Este documento no se acepta con tachaduras, ni enmendaduras, de lo declarado, no se aceptan cambios posteriores.</div>
                <div>4.- Se le informa al médico que la inexacta o falsa declaración en el presente informe médico puede invalidar toda
                  responsabilidad de la compañía con el asegurado.</div>
              </td>
            </tr>

            {/* ── FICHA DE IDENTIFICACIÓN ───────────────────────────── */}
            <TH>Ficha de identificación</TH>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={subhdr}>Nombre del paciente</div>
                <div style={{ padding: '2px 4px' }}>
                  <input style={inp} defaultValue={d.nombre} />
                </div>
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fecha de nacimiento &nbsp; Sexo</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 5px', fontSize: 11 }}>
                  <span style={{ fontSize: 10 }}>Día</span>
                  <input style={{ ...inp, width: 28 }} defaultValue={nDia} />
                  <span style={{ fontSize: 10 }}>Mes</span>
                  <input style={{ ...inp, width: 28 }} defaultValue={nMes} />
                  <span style={{ fontSize: 10 }}>Año</span>
                  <input style={{ ...inp, width: 42 }} defaultValue={nAnio} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 6, fontSize: 11 }}>
                    <input type="radio" name="atlas-sexo" defaultChecked={d.sexo === 'F'} /> F
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
                    <input type="radio" name="atlas-sexo" defaultChecked={d.sexo === 'M'} /> M
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Causa de atención</div>
                <div style={{ display: 'flex', gap: 10, padding: '3px 6px', fontSize: 11, flexWrap: 'wrap' }}>
                  {['Prevención', 'Embarazo', 'Enfermedad', 'Accidente'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="checkbox" defaultChecked={t === 'Enfermedad'} /> {t}
                    </label>
                  ))}
                </div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Referido por otro médico o unidad médica</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 6px', fontSize: 11 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}><input type="radio" name="atlas-ref" /> Sí</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}><input type="radio" name="atlas-ref" defaultChecked /> No</label>
                  <span>¿Cuál? <input style={{ ...inp, width: 100, display: 'inline-block' }} /></span>
                </div>
              </td>
            </tr>

            {/* ── HISTORIA CLÍNICA ───────────────────────────────────── */}
            <TH>Historia Clínica</TH>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes personales patológicos</div>
                <textarea style={{ ...ta, minHeight: 60 }} rows={4}
                  defaultValue={[d.cronicos, d.quirurgicos].filter(Boolean).join('\n')} />
                <div style={{ padding: '2px 6px', fontSize: 10 }}>
                  Tiempo de evolución: <input style={{ ...inp, width: 110, display: 'inline-block' }} />
                </div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes personales no patológicos</div>
                <textarea style={{ ...ta, minHeight: 60 }} rows={4}
                  defaultValue={[
                    d.tabaquismo ? `Tabaquismo: ${d.tabaquismo}` : '',
                    d.alcohol ? `Alcohol: ${d.alcohol}` : '',
                    d.alergicos ? `Alergias: ${d.alergicos}` : '',
                  ].filter(Boolean).join('\n')} />
                <div style={{ padding: '2px 6px', fontSize: 10 }}>
                  Tiempo de evolución: <input style={{ ...inp, width: 110, display: 'inline-block' }} />
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes gineco-obstétricos</div>
                <div style={{ padding: '3px 6px', fontSize: 11 }}>
                  G <input style={{ ...inp, width: 25, display: 'inline-block' }} /> /
                  P <input style={{ ...inp, width: 25, display: 'inline-block' }} /> /
                  A <input style={{ ...inp, width: 25, display: 'inline-block' }} /> /
                  C <input style={{ ...inp, width: 25, display: 'inline-block' }} />
                </div>
                <div style={{ padding: '2px 6px', fontSize: 10 }}>
                  Especificar si recibió tratamiento para infertilidad: <input style={{ ...inp, width: '100%' }} />
                </div>
                <div style={{ padding: '2px 6px', fontSize: 10 }}>
                  Tiempo de evolución: <input style={{ ...inp, width: 110, display: 'inline-block' }} />
                </div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes perinatales (si es necesario)</div>
                <textarea style={{ ...ta, minHeight: 48 }} rows={3}
                  defaultValue="No aplica" />
                <div style={{ padding: '2px 6px', fontSize: 10 }}>
                  Tiempo de evolución: <input style={{ ...inp, width: 110, display: 'inline-block' }} />
                </div>
              </td>
            </tr>

            {/* ── PADECIMIENTO ACTUAL ────────────────────────────────── */}
            <TH>Padecimiento actual</TH>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={subhdr}>Principales signos y síntomas</div>
                <textarea style={{ ...ta, minHeight: 60 }} rows={3} defaultValue={d.padecimiento} />
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fecha de inicio</div>
                <DateFields prefix="inicio" />
              </td>
            </tr>
            <tr>
              <td colSpan={1} style={cellStyle}>
                <div style={subhdr}>Código CIE-10</div>
                <div style={{ padding: '2px 4px' }}><input style={inp} /></div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Descripción del diagnóstico</div>
                <textarea style={{ ...ta, minHeight: 36 }} rows={2} defaultValue={dxTexto} />
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fecha de diagnóstico</div>
                <DateFields prefix="dx" dia={fDia} mes={fMes} anio={fAnio} />
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11 }}>
                  <strong>Tipo de padecimiento:</strong>
                  {['Congénito', 'Adquirido', 'Agudo', 'Crónico'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="checkbox" /> {t}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            <AtlasFooter page="1 / 3" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 2
      ══════════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <AtlasHeader />

            {/* ── HISTORIA CLÍNICA (continuación) ──────────────────── */}
            <TH>Historia clínica</TH>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Tipo de padecimiento</div>
                <div style={{ display: 'flex', gap: 12, padding: '3px 6px', fontSize: 11, flexWrap: 'wrap' }}>
                  {['Congénito', 'Adquirido'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="checkbox" /> {t}
                    </label>
                  ))}
                </div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Descripción del tratamiento</div>
                <textarea style={{ ...ta, minHeight: 36 }} rows={2} defaultValue={d.tx_texto} />
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Fecha de inicio del tratamiento</div>
                <DateFields prefix="tx" dia={fDia} mes={fMes} anio={fAnio} />
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>¿Hubo complicaciones?</div>
                <div style={{ display: 'flex', gap: 12, padding: '3px 6px', fontSize: 11 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="atlas-comp" /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="atlas-comp" defaultChecked /> No
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Describa complicaciones</div>
                <textarea style={{ ...ta, minHeight: 36 }} rows={2} />
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Observaciones</div>
                <textarea style={{ ...ta, minHeight: 36 }} rows={2} />
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Resultado de exploración física y de los estudios realizados. Anexar interpretaciones que confirmen el diagnóstico</div>
                <textarea style={{ ...ta, minHeight: 60 }} rows={4} defaultValue={d.exploracion} />
              </td>
            </tr>

            {/* ── DATOS DEL HOSPITAL ──────────────────────────────── */}
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Nombre del hospital</div>
                <div style={{ padding: '2px 4px' }}><input style={inp} defaultValue={d.hospital} /></div>
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Tipo de estancia</div>
                <div style={{ padding: '3px 6px', fontSize: 11 }}>
                  {['Urgencia', 'Hospitalaria', 'Corta estancia / Ambulatoria'].map(t => (
                    <div key={t}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <input type="radio" name="atlas-estancia" /> {t}
                      </label>
                    </div>
                  ))}
                </div>
              </td>
              <td colSpan={1} style={cellStyle}>
                <div style={subhdr}>Fecha de ingreso</div>
                <DateFields prefix="ing" />
                <div style={subhdr}>Fecha de egreso</div>
                <DateFields prefix="egr" />
              </td>
            </tr>

            {/* ── DATOS DEL MÉDICO TRATANTE ─────────────────────────── */}
            <TH>Datos del médico tratante</TH>
            <tr>
              <Field label="Nombre del médico" colSpan={4}>
                <input style={inp} defaultValue="Fernando Quiroz Compeán" />
              </Field>
              <Field label="Médico de red" colSpan={2}>
                <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="atlas-red" /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="atlas-red" defaultChecked /> No
                  </label>
                </div>
              </Field>
            </tr>
            <tr>
              <Field label="Especialidad" colSpan={2}>
                <input style={inp} defaultValue="Gastroenterología" />
              </Field>
              <Field label="Cédula especialidad o certificación" colSpan={2}>
                <input style={inp} defaultValue="13511062" />
              </Field>
              <Field label="Cédula profesional" colSpan={2}>
                <input style={inp} defaultValue="10566242" />
              </Field>
            </tr>
            <tr>
              <Field label="Presupuesto" colSpan={6}>
                <textarea style={{ ...ta, minHeight: 30 }} rows={2} />
              </Field>
            </tr>
            <tr>
              <Field label="Domicilio" colSpan={3}>
                <input style={inp} defaultValue={`${d.hospital}, ${d.hospital_ciudad}, ${d.hospital_estado}`} />
              </Field>
              <Field label="Teléfono(s)" colSpan={3}>
                <input style={inp} defaultValue={tel} />
              </Field>
            </tr>
            <tr>
              <Field label="Nombre de ayudante" colSpan={3}>
                <input style={inp} />
              </Field>
              <Field label="Nombre de anestesiólogo" colSpan={3}>
                <input style={inp} />
              </Field>
            </tr>

            {/* ── NOTAS LEGALES ─────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 8px', fontSize: 9, color: '#333', lineHeight: 1.5 }}>
                <strong>NOTA: </strong>Como médico tratante, autorizo a los hospitales donde fue atendido el paciente, a proporcionar
                información médica a Seguros Atlas, S.A. Se reconoce que el presente informe se rinde en términos de lo dispuesto por el
                artículo 36-B de la Ley General de Instituciones y Sociedades Mutualistas de Seguros y demás disposiciones aplicables.
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 8px', fontSize: 9, color: '#333', lineHeight: 1.5 }}>
                La información asentada en este documento es proporcionada conforme a la evaluación médica y los datos
                contenidos en el expediente clínico del paciente. El médico suscrito declara bajo protesta de decir verdad que la
                información asentada es verídica y que en caso contrario se hace responsable de las consecuencias legales que conlleve.
              </td>
            </tr>

            <AtlasFooter page="2 / 3" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 3
      ══════════════════════════════════════════════════════════ */}
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <AtlasHeader />

            {/* ── FIRMAS ────────────────────────────────────────────── */}
            <tr>
              <td colSpan={2} style={{ ...cellStyle, padding: '8px 12px', textAlign: 'center', fontSize: 11 }}>
                <div style={{ height: 60, borderBottom: `1px solid ${COLOR}` }} />
                <div style={{ marginTop: 4, fontSize: 10 }}>Lugar y fecha</div>
              </td>
              <td colSpan={2} style={{ ...cellStyle, padding: '8px 12px', textAlign: 'center', fontSize: 11 }}>
                <div style={{ height: 60, borderBottom: `1px solid ${COLOR}` }} />
                <div style={{ marginTop: 4, fontSize: 10 }}>Firma del médico tratante</div>
              </td>
              <td colSpan={2} style={{ ...cellStyle, padding: '8px 12px', textAlign: 'center', fontSize: 11 }}>
                <div style={{ height: 60, borderBottom: `1px solid ${COLOR}` }} />
                <div style={{ marginTop: 4, fontSize: 10 }}>Nombre y firma del paciente</div>
              </td>
            </tr>

            {/* ── AVISO DE PRIVACIDAD ───────────────────────────────── */}
            <TH>AVISO DE PRIVACIDAD SIMPLIFICADO PARA CLIENTES</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '6px 10px', fontSize: 9, color: '#333', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 5px' }}>
                  En términos de lo dispuesto en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares
                  (LFPDPPP), Seguros Atlas, S.A. (en lo sucesivo la "Compañía"), con domicilio en Paseo de los Tamarindos No. 60,
                  Bosques de las Lomas, Cuajimalpa de Morelos, C.P. 05120, Ciudad de México, hace de su conocimiento que los datos
                  personales que sean recabados a través de este documento serán tratados única y exclusivamente para la gestión,
                  administración y resolución de las reclamaciones derivadas de los contratos de seguros, así como para el cumplimiento
                  de las obligaciones legales y contractuales que correspondan.
                </p>
                <p style={{ margin: '0 0 5px', fontWeight: 700 }}>CONSENTIMIENTO</p>
                <p style={{ margin: '0 0 5px' }}>
                  Mediante la firma del presente formulario, el asegurado y el médico tratante manifiestan su consentimiento para que
                  Seguros Atlas, S.A. realice el tratamiento de sus datos personales en los términos descritos en el Aviso de Privacidad
                  Integral disponible en www.segurosatlas.com.mx.
                </p>
                <p style={{ margin: '0 0 5px', fontWeight: 700 }}>Nota importante para el Asegurado titular</p>
                <p style={{ margin: '0 0 5px' }}>
                  Le informamos que usted, como titular de los datos personales, tiene derecho a ejercer los derechos de Acceso,
                  Rectificación, Cancelación y Oposición (derechos ARCO) respecto al tratamiento de sus datos personales, así como el
                  derecho a revocar el consentimiento otorgado para dicho tratamiento. Para ejercer estos derechos podrá dirigir su
                  solicitud al correo: datospersonales@segurosatlas.com.mx o acudir directamente a las oficinas de la Compañía.
                </p>
                <p style={{ margin: '0 0 5px', fontWeight: 700 }}>Aplicación Atlas Conmigo</p>
                <p style={{ margin: '0 0 5px' }}>
                  Le informamos que la Compañía cuenta con la aplicación "Atlas Conmigo" disponible para dispositivos iOS y Android,
                  a través de la cual podrá consultar los servicios y beneficios de su póliza, reportar siniestros y dar seguimiento
                  a sus trámites.
                </p>
                <p style={{ margin: '0 0 5px', fontWeight: 700 }}>Nota Importante para el Médico</p>
                <p style={{ margin: '0 0 5px' }}>
                  En términos del artículo 36-B de la Ley General de Instituciones y Sociedades Mutualistas de Seguros, los médicos
                  tratantes están obligados a proporcionar la información y documentación clínica del asegurado que les sea solicitada
                  por la Compañía de Seguros, en relación con la atención médica proporcionada, sin que ello implique violación al
                  secreto profesional.
                </p>
                <p style={{ margin: '0 0 5px', fontStyle: 'italic', fontSize: 8 }}>
                  En cumplimiento a lo dispuesto en el artículo 202 de la Ley de Instituciones de Seguros y de Fianzas, se hace saber
                  que toda persona que con el propósito de obtener para sí o para un tercero el pago o reembolso de una reclamación
                  de seguros, presente documentos o informes falsos a la institución de seguros, o realice cualquier acto tendente
                  a simular hechos o actos jurídicos de cualquier naturaleza, podrá ser sancionado conforme a las disposiciones
                  aplicables de la legislación penal.
                </p>
              </td>
            </tr>

            <AtlasFooter page="3 / 3" />
          </tbody>
        </table>
      </div>
    </div>
  )
}
