'use client'

import { useState } from 'react'

/* ── shared styles ──────────────────────────────────────────────────────────── */
const COLOR = '#003087'
const COLOR_LIGHT = '#b0c4e0'

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
  background: '#dde6f5',
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

function DateFields({ dia, mes, anio }: { dia?: string; mes?: string; anio?: string }) {
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

/* ── Monterrey header ───────────────────────────────────────────────────────── */
function MonterreyHeader({ page }: { page: string }) {
  return (
    <tr>
      <td colSpan={6} style={{ ...cellStyle, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 12px', verticalAlign: 'middle', width: '50%' }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: COLOR, letterSpacing: 1 }}>NEW YORK LIFE</div>
                <div style={{ fontWeight: 700, fontSize: 11, color: COLOR }}>SEGUROS MONTERREY</div>
              </td>
              <td style={{ padding: '6px 12px', verticalAlign: 'middle', textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 700 }}>{page}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

/* ── Monterrey logo footer row ──────────────────────────────────────────────── */
function MonterreyLogoRow() {
  return (
    <tr>
      <td colSpan={6} style={{ ...cellStyle, padding: '4px 10px', textAlign: 'right' }}>
        <span style={{ fontWeight: 900, fontSize: 10, color: COLOR, letterSpacing: 0.5 }}>NEW YORK LIFE · SEGUROS MONTERREY</span>
      </td>
    </tr>
  )
}

/* ── Monterrey footer ────────────────────────────────────────────────────────── */
function MonterreyFooter({ page }: { page: string }) {
  return (
    <tr>
      <td colSpan={6} style={{ border: `1px solid ${COLOR}`, padding: '3px 8px', fontSize: 8, color: '#555' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: 8, color: '#555' }}>
                Seguros Monterrey New York Life, S.A. de C.V. &nbsp;·&nbsp; Blvd. Manuel Ávila Camacho No. 36, Lomas de Chapultepec, CDMX
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 9, color: COLOR }}>{page}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

/* ── Checkbox row helper ──────────────────────────────────────────────────────── */
function AntRow({ label, checked, detail }: { label: string; checked?: boolean; detail?: string }) {
  return (
    <tr>
      <td style={{ padding: '1px 6px', fontSize: 11, verticalAlign: 'middle', whiteSpace: 'nowrap', width: 1 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" defaultChecked={checked} /> {label}
        </label>
      </td>
      <td style={{ padding: '1px 6px', fontSize: 11 }}>
        <input style={inp} defaultValue={detail ?? ''} />
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export default function MonterreyForm({ data, doctor }: Props) {
  const [d] = useState<PatientData>({ ...data })
  const cons = d.consultorio
  const tel = cons?.telefono ?? doctor.consultorios?.Muguerza?.telefono ?? ''

  const dxArr = [...(d.dx ?? []), d.dx_texto].filter(Boolean).slice(0, 3)
  while (dxArr.length < 3) dxArr.push('')

  const [fDia, fMes, fAnio] = fmtDate(d.fecha_consulta).split('/')

  const cl = (d.cronicos ?? '').toLowerCase()
  const ql = (d.quirurgicos ?? '').toLowerCase()

  const checkCardiaco   = cl.includes('card') || cl.includes('coron') || cl.includes('arritmia')
  const checkHta        = cl.includes('hiperten') || cl.includes('hta') || cl.includes('presión alta')
  const checkDm         = cl.includes('diabet') || cl.includes('dm')
  const checkCancer     = cl.includes('cancer') || cl.includes('cáncer') || cl.includes('neoplasia') || cl.includes('tumor')
  const checkHepatico   = cl.includes('hepat') || cl.includes('cirrosis') || cl.includes('hígado')
  const checkConvulsivo = cl.includes('convuls') || cl.includes('epileps')
  const checkCirugia    = ql.trim().length > 3

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
            <MonterreyHeader page="1 / 4" />

            {/* ── TÍTULO ───────────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '8px 12px' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: COLOR, textAlign: 'center' }}>Formato de Informe Médico</div>
              </td>
            </tr>

            {/* ── INDICACIONES ─────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 10px', fontSize: 10, color: '#222', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Indicaciones:</div>
                <div>1. Este formato deberá ser llenado a una sola tinta, con letra legible y deberá tener firma autógrafa del médico tratante.</div>
                <div>2. Es necesario llenar el formato en su totalidad y proporcionar información completa y detallada. No será válido con tachaduras,
                  enmendaduras y de lo declarado no se aceptan cambios posteriores.</div>
                <div>3. Por el hecho de proporcionar este formato, Seguros Monterrey New York Life, S.A. de C.V., no queda obligada a admitir la validez
                  de la reclamación ni a renunciar a los derechos que se reserva conforme a la póliza.</div>
              </td>
            </tr>

            {/* ── DATOS DEL ASEGURADO ───────────────────────────────── */}
            <TH>Datos del asegurado (persona que recibe la atención médica)</TH>
            <tr>
              <Field label="Apellido Paterno" colSpan={2}>
                <input style={inp} defaultValue={d.ap1} />
              </Field>
              <Field label="Apellido Materno">
                <input style={inp} defaultValue={d.ap2} />
              </Field>
              <Field label="Nombre(s)" colSpan={2}>
                <input style={inp} defaultValue={d.noms} />
              </Field>
              <td style={cellStyle}>
                <div style={subhdr}>Sexo / Edad</div>
                <div style={{ padding: '3px 6px', fontSize: 11 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-sexo" defaultChecked={d.sexo === 'M'} /> M
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-sexo" defaultChecked={d.sexo === 'F'} /> H (F)
                  </label>
                  <div style={{ marginTop: 2 }}>
                    Edad: <input style={{ ...inp, width: 40, display: 'inline-block' }} defaultValue={d.edad} />
                  </div>
                </div>
              </td>
            </tr>

            {/* ── TIPO DE EVENTO ────────────────────────────────────── */}
            <TH>Tipo de evento</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ display: 'flex', gap: 20, fontSize: 11 }}>
                  {['Accidente', 'Enfermedad', 'Embarazo'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="checkbox" defaultChecked={t === 'Enfermedad'} /> {t}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* ── HISTORIA CLÍNICA ─────────────────────────────────── */}
            <TH>Historia clínica</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '3px 8px', fontSize: 10, color: '#333', fontStyle: 'italic' }}>
                Detalle todas las patologías, fecha de inicio y/o tiempo de evolución; tratamientos y en caso de cirugías, la fecha de realización.
              </td>
            </tr>
            <tr>
              {/* Ant. patológicos */}
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes personales patológicos</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <AntRow label="Cardíacos:" checked={checkCardiaco} />
                    <AntRow label="Hipertensivos:" checked={checkHta} />
                    <AntRow label="Diabetes Mellitus:" checked={checkDm} />
                    <AntRow label="VIH/SIDA:" />
                    <AntRow label="Cáncer:" checked={checkCancer} />
                    <AntRow label="Hepáticos:" checked={checkHepatico} />
                    <AntRow label="Convulsivos:" checked={checkConvulsivo} />
                    <AntRow label="Cirugía(s):" checked={checkCirugia} detail={d.quirurgicos} />
                    <AntRow label="Otros:" detail={d.cronicos && !checkCardiaco && !checkHta && !checkDm && !checkCancer && !checkHepatico && !checkConvulsivo ? d.cronicos : ''} />
                  </tbody>
                </table>
              </td>
              {/* Ant. no patológicos */}
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>Antecedentes personales no patológicos</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <AntRow
                      label="¿Fuma? (cantidad):"
                      checked={!!d.tabaquismo && d.tabaquismo.toLowerCase() !== 'no' && d.tabaquismo.trim() !== ''}
                      detail={d.tabaquismo || ''}
                    />
                    <AntRow
                      label="¿Consume bebidas alcohólicas? (tipo y cantidad):"
                      checked={!!d.alcohol && d.alcohol.toLowerCase() !== 'no' && d.alcohol.trim() !== ''}
                      detail={d.alcohol || ''}
                    />
                    <AntRow label="¿Consume o ha consumido drogas? (tipo y cantidad):" />
                    <AntRow label="¿Pérdida no intencional de peso? (cantidad):" />
                    <AntRow label="Perinatales (en caso necesario):" />
                    <AntRow
                      label="Gineco-obstétricos (cuando aplique):"
                      detail={d.sexo === 'F' ? [d.gesta ? `Gesta: ${d.gesta}` : '', d.menarca ? `Menarca: ${d.menarca}` : '', d.ritmo ? `Ritmo: ${d.ritmo}` : ''].filter(Boolean).join(' ') : ''}
                    />
                    <AntRow label="Otros:" detail={d.alergicos ? `Alergias: ${d.alergicos}` : ''} />
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── PADECIMIENTO ACTUAL ──────────────────────────────── */}
            <TH>Padecimiento actual</TH>
            <tr>
              <td colSpan={4} style={cellStyle}>
                <div style={subhdr}>Especifique los detalles de la evolución y estado actual del padecimiento</div>
                <textarea style={{ ...ta, minHeight: 80 }} rows={5} defaultValue={d.padecimiento} />
              </td>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>Fechas</div>
                <div style={{ padding: '4px 6px', fontSize: 10 }}>
                  <div style={{ marginBottom: 2 }}>Fecha de primeros síntomas del padecimiento:</div>
                  <DateFields />
                  <div style={{ marginTop: 4, marginBottom: 2 }}>Fecha de primera consulta por este padecimiento:</div>
                  <DateFields />
                  <div style={{ marginTop: 4, marginBottom: 2 }}>Fecha de diagnóstico de este padecimiento:</div>
                  <DateFields dia={fDia} mes={fMes} anio={fAnio} />
                </div>
              </td>
            </tr>

            {/* ── DIAGNÓSTICOS ─────────────────────────────────────── */}
            <TH>Diagnóstico(s)</TH>
            <tr>
              <td colSpan={6} style={cellStyle}>
                {dxArr.map((dx, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '2px 8px', gap: 6, fontSize: 11 }}>
                    <span style={{ fontWeight: 700, width: 16 }}>{i + 1}.</span>
                    <input style={inp} defaultValue={dx} />
                  </div>
                ))}
              </td>
            </tr>

            {/* ── TIPO DE PADECIMIENTO ──────────────────────────────── */}
            <TH>Tipo de padecimiento</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px' }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, flexWrap: 'wrap', marginBottom: 4 }}>
                  {['Congénito', 'Agudo', 'Adquirido', 'Crónico'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="radio" name="mty-tipo" /> {t}
                    </label>
                  ))}
                  <span style={{ fontSize: 11 }}>
                    ¿Cuánto tiempo? <input style={{ ...inp, width: 80, display: 'inline-block' }} />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span>¿Tiene relación con otro padecimiento?</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-rel" /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-rel" defaultChecked /> No
                  </label>
                  <span>¿Cuál? <input style={{ ...inp, width: 120, display: 'inline-block' }} /></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span>¿El padecimiento ocasionó discapacidad?</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-discap" /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-discap" defaultChecked /> No
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-discap" /> Parcial
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-discap" /> Total
                  </label>
                  <span style={{ fontSize: 10 }}>
                    Desde: <input style={{ ...inp, width: 70, display: 'inline-block' }} />
                    &nbsp; Hasta: <input style={{ ...inp, width: 70, display: 'inline-block' }} />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, flexWrap: 'wrap' }}>
                  <span>¿Continuará recibiendo tratamiento en el futuro?</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-cont" defaultChecked /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-cont" /> No
                  </label>
                  <span>Favor de especificar: <input style={{ ...inp, width: 160, display: 'inline-block' }} /></span>
                </div>
              </td>
            </tr>

            {/* ── FIRMA PÁG 1 ──────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ height: 50, borderBottom: `1px solid ${COLOR}`, maxWidth: 300, margin: '0 auto' }} />
                <div style={{ marginTop: 4, fontSize: 10 }}>Nombre y firma del médico tratante</div>
              </td>
            </tr>

            <MonterreyLogoRow />
            <MonterreyFooter page="1 / 4" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINA 2
      ══════════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <MonterreyHeader page="2 / 4" />

            {/* ── EXPLORACIÓN FÍSICA ────────────────────────────────── */}
            <TH>Exploración física y resultados de estudios relevantes realizados</TH>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '3px 8px', fontSize: 10, color: '#333', fontStyle: 'italic' }}>
                Favor de anexar interpretaciones que confirmen diagnóstico.
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <textarea style={{ ...ta, minHeight: 80 }} rows={5} defaultValue={d.exploracion} />
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                Talla: <input style={{ ...inp, width: 60, display: 'inline-block' }} /> cm
                &nbsp;&nbsp; Peso: <input style={{ ...inp, width: 60, display: 'inline-block' }} /> kg
              </td>
              <td colSpan={3} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                T/A: <input style={{ ...inp, width: 70, display: 'inline-block' }} defaultValue={d.signos_vitales?.ta} />
                &nbsp;&nbsp; FC: <input style={{ ...inp, width: 50, display: 'inline-block' }} defaultValue={d.signos_vitales?.fc} />
              </td>
            </tr>

            {/* ── TRATAMIENTO ───────────────────────────────────────── */}
            <TH>Tratamiento</TH>
            <tr>
              <td colSpan={3} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                <div style={{ fontWeight: 700, marginBottom: 3, fontSize: 10 }}>Indicar:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" /> Tratamiento quirúrgico (especificar procedimiento)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" defaultChecked /> Tratamiento médico (describir tratamiento, dosificación y fecha de inicio)
                  </label>
                </div>
              </td>
              <td colSpan={3} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                <div style={{ fontWeight: 700, marginBottom: 3, fontSize: 10 }}>Indicar:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" /> Programación de tratamiento
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" defaultChecked /> Descripción de tratamiento ya realizado
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Descripción:</div>
                <textarea style={{ ...ta, minHeight: 60 }} rows={4} defaultValue={d.tx_texto} />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={cellStyle}>
                <div style={subhdr}>¿Hubo complicaciones?</div>
                <div style={{ display: 'flex', gap: 12, padding: '3px 6px', fontSize: 11 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-comp" /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-comp" defaultChecked /> No
                  </label>
                </div>
              </td>
              <td colSpan={4} style={cellStyle}>
                <div style={subhdr}>Especificar complicaciones</div>
                <div style={{ padding: '2px 4px' }}><input style={inp} /></div>
              </td>
            </tr>

            {/* ── DATOS DEL HOSPITAL ──────────────────────────────── */}
            <tr>
              <Field label="Nombre del hospital" colSpan={3}>
                <input style={inp} defaultValue={d.hospital} />
              </Field>
              <Field label="Ciudad" colSpan={2}>
                <input style={inp} defaultValue={d.hospital_ciudad} />
              </Field>
              <td style={cellStyle}>
                <div style={subhdr}>Fecha de ingreso</div>
                <DateFields />
                <div style={subhdr}>Fecha de egreso</div>
                <DateFields />
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>Tipo de estancia</div>
                <div style={{ display: 'flex', gap: 16, padding: '4px 8px', fontSize: 11 }}>
                  {['Urgencia', 'Hospitalización', 'Corta estancia / Ambulatoria'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input type="radio" name="mty-estancia" /> {t}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* ── CIRUGÍA TRAUMATOLOGÍA ─────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px', fontSize: 10, color: '#333', fontStyle: 'italic' }}>
                Para solicitudes de cirugía de traumatología, ortopedia y neurocirugía, deberá llenar adicionalmente la siguiente sección:
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>1. Técnica quirúrgica planeada:</div>
                <textarea style={{ ...ta, minHeight: 36 }} rows={2} />
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={cellStyle}>
                <div style={subhdr}>2. Solicitud de materiales o rentas de equipos médicos</div>
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                <strong>1. Nombre del proveedor:</strong> <input style={{ ...inp, width: '50%', display: 'inline-block' }} />
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px', fontSize: 11 }}>
                <strong>Nombre del representante del proveedor:</strong>
              </td>
            </tr>
            <tr>
              <Field label="Apellido Paterno" colSpan={2}><input style={inp} /></Field>
              <Field label="Apellido Materno" colSpan={2}><input style={inp} /></Field>
              <Field label="Nombre(s)" colSpan={2}><input style={inp} /></Field>
            </tr>
            <tr>
              <Field label="Tel. contacto" colSpan={3}><input style={inp} /></Field>
              <Field label="Correo electrónico" colSpan={3}><input style={inp} /></Field>
            </tr>

            {/* Tabla de materiales */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: '#dde6f5' }}>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', width: '5%' }}>#</th>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', width: '15%' }}>Cantidad</th>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px' }}>Material</th>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', width: '20%' }}>Marca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map(n => (
                      <tr key={n}>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', textAlign: 'center' }}>{n}</td>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}><input style={inp} /></td>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}><input style={inp} /></td>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}><input style={inp} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Tabla de biológicos */}
            <tr>
              <td colSpan={6} style={cellStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: '#dde6f5' }}>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', width: '5%' }}>#</th>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', width: '15%' }}>Cantidad</th>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px' }}>Biológicos y/o injertos</th>
                      <th style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', width: '20%' }}>Marca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map(n => (
                      <tr key={n}>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: '2px 4px', textAlign: 'center' }}>{n}</td>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}><input style={inp} /></td>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}><input style={inp} /></td>
                        <td style={{ border: `1px solid ${COLOR_LIGHT}`, padding: 0 }}><input style={inp} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            <MonterreyLogoRow />
            <MonterreyFooter page="2 / 4" />
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PÁGINAS 3-4 → DATOS DEL MÉDICO (una sola página)
      ══════════════════════════════════════════════════════════ */}
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <MonterreyHeader page="3 / 4" />

            {/* ── DATOS GENERALES DEL MÉDICO TRATANTE ──────────────── */}
            <TH>Datos generales del médico tratante</TH>
            <tr>
              <Field label="Apellido Paterno" colSpan={2}><input style={inp} defaultValue={doctor.apellido1} /></Field>
              <Field label="Apellido Materno" colSpan={2}><input style={inp} defaultValue={doctor.apellido2} /></Field>
              <Field label="Nombre(s)"><input style={inp} defaultValue={doctor.nombres} /></Field>
              <Field label="N° de proveedor"><input style={inp} /></Field>
            </tr>
            <tr>
              <Field label="RFC" colSpan={2}><input style={inp} defaultValue={doctor.rfc} /></Field>
              <Field label="Especialidad" colSpan={2}><input style={inp} defaultValue={doctor.especialidad} /></Field>
              <Field label="Cédula profesional"><input style={inp} defaultValue={doctor.cedula_prof} /></Field>
              <Field label="Cédula de especialidad / Certificación"><input style={inp} defaultValue={doctor.cedula_esp} /></Field>
            </tr>
            <tr>
              <Field label="Correo electrónico" colSpan={3}>
                <input style={inp} defaultValue={doctor.email_seguros} />
              </Field>
              <Field label="Teléfonos del consultorio (incluir LADA)" colSpan={2}>
                <input style={inp} defaultValue={tel} />
              </Field>
              <Field label="Tel. móvil">
                <input style={inp} defaultValue={doctor.celular} />
              </Field>
            </tr>

            {/* Médicos participantes */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '4px 8px', fontSize: 10, color: '#333' }}>
                En caso de programar un tratamiento, indicar nombre(s) y especialidad del(los) médico(s) que participa(n) y su presupuesto de honorarios:
              </td>
            </tr>
            <tr>
              <Field label="Anestesiólogo" colSpan={3}><input style={inp} /></Field>
              <Field label="Primer ayudante" colSpan={3}><input style={inp} /></Field>
            </tr>
            <tr>
              <Field label="Segundo ayudante" colSpan={3}><input style={inp} /></Field>
              <Field label="Otro(s) médico(s)" colSpan={3}><input style={inp} /></Field>
            </tr>

            {/* ── TEXTOS LEGALES ────────────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '6px 10px', fontSize: 9, color: '#333', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 5px' }}>
                  Como médico tratante, declaro bajo protesta de decir verdad que la información asentada en este documento es verídica y
                  proporcionada conforme a la evaluación médica y los datos contenidos en el expediente clínico del paciente. En caso contrario,
                  me hago responsable de las consecuencias legales que conlleve, reservándose Seguros Monterrey New York Life, S.A. de C.V.
                  el derecho a reclamar los gastos realizados.
                </p>
                <p style={{ margin: '0 0 5px' }}>
                  Reconozco que previo a proporcionar los datos personales contenidos en este documento, tuve acceso al Aviso de Privacidad
                  disponible en www.segurosmonterrey.com.mx, en el que se describen las finalidades del tratamiento de los datos personales
                  que proporciono, así como los mecanismos para ejercer los derechos ARCO (Acceso, Rectificación, Cancelación y Oposición).
                </p>
                <p style={{ margin: '0 0 5px' }}>
                  Así mismo, como médico tratante, autorizo a los hospitales donde fue atendido el paciente a proporcionar información médica
                  a Seguros Monterrey New York Life, S.A. de C.V., en términos de lo dispuesto por el artículo 36-B de la Ley General de
                  Instituciones y Sociedades Mutualistas de Seguros y demás disposiciones aplicables.
                </p>
              </td>
            </tr>

            {/* ¿Pertenece a prestadores en convenio? */}
            <tr>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>¿Pertenece a los prestadores de servicios médicos en convenio con Seguros Monterrey New York Life, S.A. de C.V.?</div>
                <div style={{ display: 'flex', gap: 12, padding: '3px 6px', fontSize: 11 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-conv" /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-conv" defaultChecked /> No
                  </label>
                </div>
              </td>
              <td colSpan={3} style={cellStyle}>
                <div style={subhdr}>(En caso de no pertenecer) ¿Acepta el tabulador de esta para el pago de honorarios?</div>
                <div style={{ display: 'flex', gap: 12, padding: '3px 6px', fontSize: 11 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-tab" /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input type="radio" name="mty-tab" defaultChecked /> No
                  </label>
                </div>
              </td>
            </tr>

            {/* ── FIRMA ────────────────────────────────────────────── */}
            <tr>
              <td colSpan={3} style={{ ...cellStyle, padding: '8px 12px', textAlign: 'center', fontSize: 11 }}>
                <div style={{ marginBottom: 3, fontSize: 10 }}>Fecha:</div>
                <DateFields dia={fDia} mes={fMes} anio={fAnio} />
              </td>
              <td colSpan={3} style={{ ...cellStyle, padding: '8px 12px', textAlign: 'center', fontSize: 11 }}>
                <div style={{ height: 55, borderBottom: `1px solid ${COLOR}` }} />
                <div style={{ marginTop: 4, fontSize: 10 }}>Nombre y firma del médico tratante</div>
              </td>
            </tr>

            {/* ── TEXTO FINAL ART. 202 ──────────────────────────────── */}
            <tr>
              <td colSpan={6} style={{ ...cellStyle, padding: '5px 10px', fontSize: 8.5, color: '#444', lineHeight: 1.5, fontStyle: 'italic' }}>
                En cumplimiento a lo dispuesto en el artículo 202 de la Ley de Instituciones de Seguros y de Fianzas, se hace saber que toda persona
                que con el propósito de obtener para sí o para un tercero el pago o reembolso de una reclamación de seguros, presente documentos o
                informes falsos a la institución de seguros, o realice cualquier acto tendente a simular hechos o actos jurídicos de cualquier
                naturaleza, podrá ser sancionado conforme a las disposiciones aplicables de la legislación penal.
              </td>
            </tr>

            <MonterreyLogoRow />
            <MonterreyFooter page="3-4 / 4" />
          </tbody>
        </table>
      </div>
    </div>
  )
}
