'use client'

import { useState } from 'react'

/* ── shared styles ─────────────────────────────────────────────────────────── */
const COLOR = '#1a3a6e'
const COLOR_LIGHT = '#c8d8f0'

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
  padding: '3px 6px',
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
const radRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '4px 14px',
  padding: '2px 4px',
  fontSize: 11,
}

/* ── types ─────────────────────────────────────────────────────────────────── */
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

/* ── helpers ───────────────────────────────────────────────────────────────── */
function fmtDate(s: string) {
  return s ? s.split('-').reverse().join('/') : ''
}

/* ── sub-components ────────────────────────────────────────────────────────── */
function TH({ children, colSpan, extraStyle }: { children: React.ReactNode; colSpan?: number; extraStyle?: React.CSSProperties }) {
  return (
    <tr>
      <td colSpan={colSpan ?? 6} style={{ ...cellStyle, padding: 0 }}>
        <div style={{ ...hdr, ...extraStyle }}>{children}</div>
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

/* ── GNP header (repeats on each page) ─────────────────────────────────────── */
function GNPHeader() {
  return (
    <tr>
      <td colSpan={6} style={{ ...cellStyle, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              {/* Logo GNP */}
              <td style={{ width: '30%', padding: '6px 10px', verticalAlign: 'middle', borderRight: `2px solid ${COLOR}` }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: COLOR, letterSpacing: 2 }}>GNP</div>
                <div style={{ fontWeight: 700, fontSize: 11, color: COLOR, letterSpacing: 1 }}>SEGUROS</div>
              </td>
              {/* Title */}
              <td style={{ padding: '4px 10px', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: COLOR }}>Informe médico</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: COLOR }}>Gastos Médicos</div>
              </td>
              {/* Address */}
              <td style={{ padding: '4px 10px', verticalAlign: 'middle', fontSize: 9, color: '#555', textAlign: 'right' }}>
                <div>Grupo Nacional Provincial, S.A.B.</div>
                <div>Av. Cerro de las Torres No. 395 Col. Campestre</div>
                <div>Churubusco C.P. 04200, CDMX</div>
                <div>R.F.C. GNP9211244P0</div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
function GNPFooter({ page }: { page: string }) {
  return (
    <tr>
      <td colSpan={6} style={{ border: `1px solid ${COLOR}`, padding: '3px 8px', fontSize: 9, color: '#555' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: 9, color: '#555' }}>
                En caso de requerir mayor información contáctenos a Línea GNP al 55 5227 9000 o visite gnp.com.mx
              </td>
              <td style={{ textAlign: 'right', fontSize: 9, color: '#555', whiteSpace: 'nowrap' }}>{page}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

/* ── Radio helper ────────────────────────────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export default function GNPForm({ data, doctor }: Props) {
  const [d] = useState<PatientData>({ ...data })
  const sv = d.signos_vitales ?? {}
  const cons = d.consultorio
  const tel = cons?.telefono ?? doctor.consultorios?.Muguerza?.telefono ?? ''

  const dxTexto = [...(d.dx ?? []), d.dx_texto].filter(Boolean).join('\n')
  const [fDia, fMes, fAnio] = fmtDate(d.fecha_consulta).split('/')

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
            <GNPHeader />

            {/* ── TRÁMITE ─────────────────────────────────────────── */}
            <TH>Seleccione el trámite que el Asegurado solicita</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 11 }}>
                  {['Reembolso', 'Programación de cirugía', 'Programación de medicamentos', 'Programación de servicios', 'Indemnización', 'Reporte hospitalario'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="checkbox" /> {t}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* ── FICHA DE IDENTIFICACIÓN ─────────────────────────── */}
            <TH>Ficha de identificación — Asegurado Afectado</TH>
            <tr>
              <Field label="Número de Póliza"><input style={inp} /></Field>
              <Field label="Primer apellido"><input style={inp} defaultValue={d.ap1} /></Field>
              <Field label="Segundo apellido"><input style={inp} defaultValue={d.ap2} /></Field>
              <Field label="Nombre(s)" colSpan={2}><input style={inp} defaultValue={d.noms} /></Field>
              <td style={{ ...cellStyle }}>
                <div style={subhdr}>Sexo</div>
                <Radios name="gnp-sexo" options={['F', 'M']} defaultValue={d.sexo} />
              </td>
            </tr>
            <tr>
              <Field label="Edad"><input style={inp} defaultValue={d.edad} /></Field>
              <td colSpan={5} style={cellStyle}>
                <div style={subhdr}>Causa de atención</div>
                <Radios name="gnp-causa" options={['Accidente', 'Enfermedad', 'Embarazo']} defaultValue="Enfermedad" />
              </td>
            </tr>

            {/* ── HISTORIA CLÍNICA ─────────────────────────────────── */}
            <TH>Historia Clínica (especificar tiempo de evolución)</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '3px 6px', fontSize: 10, color: '#333', fontStyle: 'italic' }}>
                IMPORTANTE: Deberán ingresarse aunque no estén relacionados con el diagnóstico e incluir fechas de inicio del diagnóstico y del tratamiento (dd/mm/aa)
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes personales patológicos</div>
                <textarea style={{ ...ta, minHeight: 60 }} defaultValue={d.cronicos} rows={3} />
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes personales no patológicos</div>
                <textarea style={{ ...ta, minHeight: 60 }} defaultValue={[
                  d.tabaquismo ? `Tabaquismo: ${d.tabaquismo}` : '',
                  d.alcohol ? `Alcohol: ${d.alcohol}` : '',
                ].filter(Boolean).join('\n')} rows={3} />
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes gineco-obstétricos (descripción anatómica)</div>
                <textarea style={{ ...ta, minHeight: 50 }} defaultValue={
                  [d.menarca ? `Menarca: ${d.menarca}` : '', d.ritmo ? `Ritmo: ${d.ritmo}` : '', d.gesta ? `Gestas: ${d.gesta}` : ''].filter(Boolean).join('  ')
                } rows={2} />
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes perinatales</div>
                <textarea style={{ ...ta, minHeight: 50 }} rows={2} />
              </td>
            </tr>

            {/* ── PADECIMIENTO ACTUAL ──────────────────────────────── */}
            <TH extraStyle={{ fontWeight: 900 }}>Padecimiento actual</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '3px 6px', fontSize: 10, color: '#333', fontStyle: 'italic' }}>
                De acuerdo a la historia clínica y evolución natural de la enfermedad, indispensable la fecha de inicio
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <textarea style={{ ...ta, minHeight: 80 }} defaultValue={d.padecimiento} rows={4} />
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fecha de inicio</div>
                <div style={{ display: 'flex', gap: 4, padding: '3px 5px', fontSize: 11 }}>
                  <div style={{ flex: 1 }}>dd<br /><input style={{ ...inp, width: '100%' }} /></div>
                  <div style={{ flex: 1 }}>mm<br /><input style={{ ...inp, width: '100%' }} /></div>
                  <div style={{ flex: 2 }}>aa<br /><input style={{ ...inp, width: '100%' }} /></div>
                </div>
              </td>
            </tr>

            {/* ── DIAGNÓSTICO ──────────────────────────────────────── */}
            <TH extraStyle={{ fontWeight: 900 }}>Diagnóstico(s) definitivo(s)</TH>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <textarea style={{ ...ta, minHeight: 60 }} defaultValue={dxTexto} rows={3} />
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fecha de diagnóstico</div>
                <div style={{ display: 'flex', gap: 4, padding: '3px 5px', fontSize: 11 }}>
                  <div style={{ flex: 1 }}>dd<br /><input style={{ ...inp, width: '100%' }} defaultValue={fDia} /></div>
                  <div style={{ flex: 1 }}>mm<br /><input style={{ ...inp, width: '100%' }} defaultValue={fMes} /></div>
                  <div style={{ flex: 2 }}>aa<br /><input style={{ ...inp, width: '100%' }} defaultValue={fAnio} /></div>
                </div>
              </td>
            </tr>

            {/* ── TIPO DE PADECIMIENTO ─────────────────────────────── */}
            <TH extraStyle={{ fontWeight: 900 }}>Tipo de padecimiento</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ fontSize: 10, marginBottom: 3 }}>Seleccione una opción:</div>
                <Radios name="gnp-tipo" options={['Congénito', 'Adquirido', 'Agudo', 'Crónico']} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 11 }}>
                  <span>¿Se ha relacionado con algún otro padecimiento?</span>
                  <Radios name="gnp-rel" options={['Sí', 'No']} defaultValue="No" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11 }}>
                  <span>Especifique cuál padecimiento: (Si no existe padecimiento, indicar ninguno)</span>
                  <input style={{ ...inp, flex: 1 }} />
                </div>
              </td>
            </tr>

            <GNPFooter page="1/3" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 2
      ══════════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <GNPHeader />

            <TH>Historia Clínica (continuación)</TH>

            {/* ── SIGNOS VITALES ───────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Signos vitales y medidas antropométricas del paciente</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      {[
                        ['Pulso (x minuto)', sv.fc ?? ''],
                        ['Respiración (x minuto)', sv.fr ?? ''],
                        ['Temperatura (°C)', sv.temp ?? ''],
                        ['Presión arterial (mm Hg)', sv.ta ?? ''],
                        ['Peso (kg)', ''],
                        ['Altura (m)', ''],
                      ].map(([lbl, val]) => (
                        <td key={lbl as string} style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0, width: '16.6%' }}>
                          <div style={{ ...subhdr, fontSize: 9 }}>{lbl}</div>
                          <div style={{ padding: '2px 4px' }}>
                            <input style={inp} defaultValue={val as string} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── EXPLORACIÓN FÍSICA ──────────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Resultados de exploración física realizada el día del diagnóstico</div>
                <textarea style={{ ...ta, minHeight: 70 }} defaultValue={d.exploracion} rows={4} />
              </td>
            </tr>

            {/* ── ESTUDIOS ────────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Estudios realizados (anexar interpretaciones que confirmen diagnóstico)</div>
                <div style={{ fontSize: 10, padding: '2px 5px', color: '#444', fontStyle: 'italic' }}>
                  (Indique los estudios y en caso de que no se llevaron a cabo, especificar que no se realizaron)
                </div>
                <textarea style={{ ...ta, minHeight: 55 }} defaultValue={(d.estudios ?? []).join(', ')} rows={3} />
              </td>
            </tr>

            {/* ── COMPLICACIONES ──────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Complicaciones</div>
                <div style={{ padding: '3px 6px' }}>
                  <div style={{ fontSize: 10, marginBottom: 2 }}>Indique y describa si se presentaron complicaciones</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, flexWrap: 'wrap' }}>
                    <Radios name="gnp-comp" options={['Sí', 'No']} defaultValue="No" />
                    <span style={{ fontSize: 10 }}>Fecha de inicio:</span>
                    <span style={{ fontSize: 10 }}>dd <input style={{ ...inp, width: 28 }} /></span>
                    <span style={{ fontSize: 10 }}>mm <input style={{ ...inp, width: 28 }} /></span>
                    <span style={{ fontSize: 10 }}>aa <input style={{ ...inp, width: 38 }} /></span>
                  </div>
                  <textarea style={{ ...ta, minHeight: 40 }} rows={2} />
                </div>
              </td>
            </tr>

            {/* ── TRATAMIENTO ─────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Tratamiento</div>
                <div style={{ fontSize: 10, padding: '2px 5px', color: '#444', fontStyle: 'italic' }}>
                  Detallar los tratamientos, procedimientos y técnica quirúrgica especificando las fechas (dd/mm/aa). En caso de medicamentos mencionar posología completa
                </div>
                <div style={{ display: 'flex', gap: 0 }}>
                  <div style={{ flex: 1 }}>
                    <textarea style={{ ...ta, minHeight: 70 }} defaultValue={d.tx_texto} rows={4} />
                  </div>
                  <div style={{ width: 160, borderLeft: `1px solid ${COLOR}`, padding: '3px 5px', fontSize: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>Fecha de inicio</div>
                    <div>dd <input style={{ ...inp, width: 30 }} /></div>
                    <div>mm <input style={{ ...inp, width: 30 }} /></div>
                    <div>aa <input style={{ ...inp, width: 45 }} /></div>
                  </div>
                </div>
              </td>
            </tr>

            {/* ── INTERVENCIÓN QUIRÚRGICA ──────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>En caso de intervención quirúrgica, ¿qué equipo específico se utilizará?</div>
                <textarea style={{ ...ta, minHeight: 45 }} rows={2} />
              </td>
            </tr>

            {/* ── INFORMACIÓN ADICIONAL ────────────────────────────── */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Información adicional</div>
                <textarea style={{ ...ta, minHeight: 45 }} rows={2} />
              </td>
            </tr>

            {/* ── DATOS HOSPITAL ───────────────────────────────────── */}
            <TH>Datos de hospital o clínica donde se tratará el paciente</TH>
            <tr>
              <Field label="Nombre del hospital" colSpan={3}><input style={inp} defaultValue={d.hospital} /></Field>
              <Field label="Ciudad"><input style={inp} defaultValue={d.hospital_ciudad} /></Field>
              <Field label="Estado" colSpan={2}><input style={inp} defaultValue={d.hospital_estado} /></Field>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Tipo de estancia</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '3px 6px', fontSize: 11, flexWrap: 'wrap' }}>
                  <Radios name="gnp-estancia" options={['Urgencia', 'Hospitalaria', 'Corta estancia / ambulatoria']} defaultValue="Hospitalaria" />
                  <span style={{ fontSize: 10 }}>Fecha de ingreso:</span>
                  <span style={{ fontSize: 10 }}>dd <input style={{ ...inp, width: 28 }} /></span>
                  <span style={{ fontSize: 10 }}>mm <input style={{ ...inp, width: 28 }} /></span>
                  <span style={{ fontSize: 10 }}>aa <input style={{ ...inp, width: 38 }} /></span>
                </div>
              </td>
            </tr>

            <GNPFooter page="2/3" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 3
      ══════════════════════════════════════════════════════════ */}
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <GNPHeader />

            {/* ── DATOS MÉDICO TRATANTE ─────────────────────────────── */}
            <TH>Datos del médico tratante</TH>
            <tr>
              <Field label="Primer apellido"><input style={inp} defaultValue={doctor.apellido1} /></Field>
              <Field label="Segundo apellido"><input style={inp} defaultValue={doctor.apellido2} /></Field>
              <Field label="Nombre(s)" colSpan={2}><input style={inp} defaultValue={doctor.nombres} /></Field>
              <Field label="Especialidad" colSpan={2}><input style={inp} defaultValue={doctor.especialidad} /></Field>
            </tr>
            <tr>
              <Field label="Cédula profesional" colSpan={2}><input style={inp} defaultValue={doctor.cedula_prof} /></Field>
              <Field label="Cédula de especialidad" colSpan={2}><input style={inp} defaultValue={doctor.cedula_esp} /></Field>
              <Field label="¿Está en convenio con GNP?">
                <Radios name="gnp-conv" options={['Sí', 'No']} defaultValue="No" />
              </Field>
              <Field label="¿Se ajusta al tabulador?">
                <Radios name="gnp-tab" options={['Sí', 'No']} defaultValue="Sí" />
              </Field>
            </tr>
            <tr>
              <Field label="Ppto. de honorarios" colSpan={2}><input style={inp} /></Field>
              <Field label="Teléfono consultorio"><input style={inp} defaultValue={tel} /></Field>
              <Field label="Celular"><input style={inp} defaultValue={doctor.celular} /></Field>
              <Field label="Correo electrónico" colSpan={2}><input style={inp} defaultValue={doctor.email_seguros} /></Field>
            </tr>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Tipo de participación</div>
                <Radios name="gnp-part" options={['Tratante', 'Cirujano', 'Otra']} defaultValue="Tratante" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px', fontSize: 11 }}>
                  <span>¿Cuál?</span><input style={{ ...inp, flex: 1 }} />
                </div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>¿Hubo interconsulta?</div>
                <Radios name="gnp-interconsulta" options={['Sí', 'No']} defaultValue="No" />
              </td>
            </tr>

            {/* ── DATOS MÉDICOS INTERCONSULTANTES ─────────────────── */}
            <TH>Datos de médicos interconsultantes o participantes en la intervención</TH>

            {[1, 2, 3].map(n => (
              <tr key={n}>
                <td colSpan={6} style={{ ...cellStyle, padding: '4px 6px' }}>
                  <div style={{ ...subhdr, marginBottom: 4 }}>Médico {n} — Tipo de participación:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: 11, marginBottom: 4 }}>
                    {['Interconsultante', 'Cirujano', 'Anestesiólogo', 'Ayudantía', 'Otra'].map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <input type="checkbox" /> {t}
                      </label>
                    ))}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }}>
                      ¿Cuál? <input style={{ ...inp, width: 80 }} />
                    </span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        {[['Primer apellido', ''], ['Segundo apellido', ''], ['Nombre(s)', ''], ['Especialidad', '']].map(([lbl]) => (
                          <td key={lbl as string} style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0, width: '25%' }}>
                            <div style={{ ...subhdr, fontSize: 9 }}>{lbl}</div>
                            <div style={{ padding: '1px 3px' }}><input style={inp} /></div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}>
                          <div style={{ ...subhdr, fontSize: 9 }}>Cédula profesional</div>
                          <div style={{ padding: '1px 3px' }}><input style={inp} /></div>
                        </td>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}>
                          <div style={{ ...subhdr, fontSize: 9 }}>Cédula de especialidad</div>
                          <div style={{ padding: '1px 3px' }}><input style={inp} /></div>
                        </td>
                        <td colSpan={2} style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}>
                          <div style={{ ...subhdr, fontSize: 9 }}>Presupuesto de honorarios</div>
                          <div style={{ padding: '1px 3px' }}><input style={inp} /></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            ))}

            {/* ── TEXTO LEGAL ─────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 8px', fontSize: 9, color: '#444', lineHeight: 1.5 }}>
                Declaro bajo protesta de decir verdad que la información asentada en este documento es verídica y que en caso contrario
                me hago responsable de las consecuencias legales que conlleve, reservándose GNP el derecho a reclamar los gastos realizados.
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 8px', fontSize: 9, color: '#444', lineHeight: 1.5 }}>
                <strong>Aviso de Privacidad / Datos Personales:</strong> Reconozco que previo a proporcionar los datos personales contenidos en este documento,
                tuve acceso al Aviso de Privacidad disponible en gnp.com.mx, en el que se describen las finalidades del tratamiento de los datos personales
                que proporciono, así como los mecanismos para ejercer los derechos ARCO.
              </td>
            </tr>

            {/* ── FIRMAS ──────────────────────────────────────────── */}
            <tr>
              <td colSpan={3} style={{ ...cellStyle, padding: '6px 10px', textAlign: 'center', fontSize: 11, minHeight: 70 }}>
                <div style={{ height: 55, borderBottom: `1px solid ${COLOR}` }} />
                <div style={{ marginTop: 3 }}>Lugar y fecha</div>
              </td>
              <td colSpan={3} style={{ ...cellStyle, padding: '6px 10px', textAlign: 'center', fontSize: 11, minHeight: 70 }}>
                <div style={{ height: 55, borderBottom: `1px solid ${COLOR}` }} />
                <div style={{ marginTop: 3 }}>Nombre y firma del médico tratante</div>
              </td>
            </tr>

            <GNPFooter page="3/3" />
          </tbody>
        </table>
      </div>
    </div>
  )
}
