'use client'

const H: React.CSSProperties = { background: '#cc0000', color: 'white', fontWeight: 700, fontSize: '11px', padding: '4px 8px', textAlign: 'center' }
const SH: React.CSSProperties = { background: '#f5f5f5', color: '#333', fontWeight: 700, fontSize: '10px', padding: '2px 6px', borderBottom: '1px solid #ccc' }
const cell: React.CSSProperties = { border: '1px solid #999', padding: 0, verticalAlign: 'top' }
const inp = 'border-0 border-b border-gray-300 outline-none bg-transparent w-full text-xs px-1 py-0.5'

function F({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <td colSpan={span} style={cell}>
      <div style={SH}>{label}</div>
      <div style={{ padding: '2px 4px', minHeight: 22 }}>{children}</div>
    </td>
  )
}

interface PatientData {
  ap1: string; ap2: string; noms: string; nombre: string
  sexo: string; edad: string; fecha_nacimiento: string; fecha_consulta: string
  cronicos: string; quirurgicos: string; alergicos: string
  tabaquismo: string; alcohol: string; gesta: string; menarca: string; ritmo: string
  padecimiento: string; exploracion: string
  dx: string[]; dx_texto: string; tx_texto: string; estudios: string[]
  consultorio: any; hospital: string; hospital_ciudad: string; hospital_estado: string
}

interface Props { data: PatientData; doctor: any }

export default function MapfreForm({ data: d, doctor }: Props) {
  const fmt = (s: string) => s ? s.split('-').reverse().join('/') : ''
  const [dd, mm, yy] = (fmt(d.fecha_consulta) || '//').split('/')
  const cons = d.consultorio

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 820, margin: '0 auto', background: 'white', fontSize: 11 }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => window.print()} style={{ background: '#cc0000', color: 'white', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
          Imprimir / PDF
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td colSpan={6} style={{ background: '#cc0000', color: 'white', padding: '6px 12px' }}>
              <div style={{ fontWeight: 900, fontSize: 14 }}>MAPFRE México S.A. — INFORME MÉDICO</div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>Av. Revolución No.507, Col. San Pedro de los Pinos, CDMX · Tel: 5230-7000</div>
            </td>
          </tr>

          {/* Trámite */}
          <tr>
            <td colSpan={6} style={cell}>
              <div style={{ display: 'flex', gap: 20, padding: '4px 8px', fontSize: 11 }}>
                {['Programación de Cirugía', 'Tratamiento Médico', 'Reembolso'].map(t => (
                  <label key={t}><input type="checkbox" /> {t}</label>
                ))}
              </div>
            </td>
          </tr>

          {/* Ficha identificación */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>FICHA DE IDENTIFICACIÓN</div></td>
          </tr>
          <tr>
            <F label="Apellido paterno, materno y nombre del paciente" span={4}>
              <input className={inp} defaultValue={`${d.ap1} ${d.ap2} ${d.noms}`} />
            </F>
            <F label="No. Póliza"><input className={inp} /></F>
            <F label="Edad / Sexo">
              <input className={inp} defaultValue={d.edad} style={{ width: 40 }} />
              <label style={{ marginLeft: 6 }}><input type="radio" name="sexo" defaultChecked={d.sexo === 'F'} /> F</label>
              <label style={{ marginLeft: 6 }}><input type="radio" name="sexo" defaultChecked={d.sexo === 'M'} /> M</label>
            </F>
          </tr>

          {/* Info médica */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>INFORMACIÓN MÉDICA</div></td>
          </tr>
          <tr>
            <td colSpan={3} style={cell}>
              <div style={SH}>Causa de atención</div>
              <div style={{ padding: '3px 6px', fontSize: 11 }}>
                <label><input type="checkbox" /> Embarazo</label>
                <label style={{ marginLeft: 8 }}><input type="checkbox" defaultChecked /> Enfermedad</label>
                <label style={{ marginLeft: 8 }}><input type="checkbox" /> Accidente</label>
              </div>
            </td>
            <td colSpan={3} style={cell}>
              <div style={SH}>Referido por otro médico o unidad</div>
              <div style={{ padding: '3px 6px', fontSize: 11 }}>
                <label><input type="radio" name="ref" /> Sí</label>
                <label style={{ marginLeft: 8 }}><input type="radio" name="ref" defaultChecked /> No</label>
                &nbsp; ¿Cuál? <input className={inp} style={{ width: 120 }} />
              </div>
            </td>
          </tr>

          {/* Historia clínica */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>HISTORIA CLÍNICA (ESPECIFICAR TIEMPO DE EVOLUCIÓN)</div></td>
          </tr>
          <tr>
            <td colSpan={3} style={cell}>
              <div style={SH}>Antecedentes personales patológicos</div>
              <textarea className={inp} rows={4} defaultValue={[d.cronicos, d.quirurgicos].filter(Boolean).join('\n')} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
            <td colSpan={3} style={cell}>
              <div style={SH}>Antecedentes personales no patológicos</div>
              <textarea className={inp} rows={4} defaultValue={[d.tabaquismo && `Tabaquismo: ${d.tabaquismo}`, d.alcohol && `Alcohol: ${d.alcohol}`, d.alergicos && `Alergias: ${d.alergicos}`].filter(Boolean).join('\n')} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={cell}>
              <div style={SH}>Antecedentes gineco-obstétricos</div>
              <textarea className={inp} rows={3} defaultValue={d.sexo === 'F' ? `Menarca: ${d.menarca}\nRitmo: ${d.ritmo}\n${d.gesta}` : 'No aplica'} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
            <td colSpan={3} style={cell}>
              <div style={SH}>Antecedentes perinatales</div>
              <textarea className={inp} rows={3} defaultValue="No aplica" style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
          </tr>

          {/* Padecimiento actual */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>PADECIMIENTO ACTUAL</div></td>
          </tr>
          <tr>
            <td colSpan={4} style={cell}>
              <div style={SH}>Principales signos y síntomas</div>
              <textarea className={inp} rows={3} defaultValue={d.padecimiento} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
            <td colSpan={2} style={cell}>
              <div style={SH}>Fecha de inicio</div>
              <div style={{ display: 'flex', gap: 4, padding: '4px 6px' }}>
                <div>Día <input className={inp} style={{ width: 28 }} /></div>
                <div>Mes <input className={inp} style={{ width: 28 }} /></div>
                <div>Año <input className={inp} style={{ width: 40 }} /></div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={cell}>
              <div style={SH}>Describir diagnóstico (indicar si es unilateral, bilateral, zona afectada)</div>
              <textarea className={inp} rows={3} defaultValue={[...d.dx, d.dx_texto].filter(Boolean).join('\n')} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
            <td colSpan={2} style={cell}>
              <div style={SH}>Fecha de inicio diagnóstico</div>
              <div style={{ display: 'flex', gap: 4, padding: '4px 6px' }}>
                <div>Día <input className={inp} defaultValue={dd} style={{ width: 28 }} /></div>
                <div>Mes <input className={inp} defaultValue={mm} style={{ width: 28 }} /></div>
                <div>Año <input className={inp} defaultValue={yy} style={{ width: 40 }} /></div>
              </div>
            </td>
          </tr>

          {/* Diagnóstico final */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>DIAGNÓSTICO FINAL</div></td>
          </tr>
          <tr>
            <td colSpan={3} style={cell}>
              <div style={SH}>Especificar evolución del diagnóstico</div>
              <textarea className={inp} rows={2} defaultValue={[...d.dx, d.dx_texto].filter(Boolean).join('\n')} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
            <F label="Código CIE-10"><input className={inp} /></F>
            <td colSpan={2} style={cell}>
              <div style={SH}>Fecha de diagnóstico</div>
              <div style={{ display: 'flex', gap: 4, padding: '4px 6px' }}>
                <div>Día <input className={inp} defaultValue={dd} style={{ width: 28 }} /></div>
                <div>Mes <input className={inp} defaultValue={mm} style={{ width: 28 }} /></div>
                <div>Año <input className={inp} defaultValue={yy} style={{ width: 40 }} /></div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={6} style={cell}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', padding: '4px 8px', fontSize: 11 }}>
                <strong>Tipo de padecimiento:</strong>
                {['Congénito','Adquirido','Agudo','Crónico'].map(t => (
                  <label key={t}><input type="checkbox" /> {t}</label>
                ))}
              </div>
            </td>
          </tr>

          {/* Resultado exploración */}
          <tr>
            <td colSpan={6} style={cell}>
              <div style={SH}>Resultado de exploración y estudios realizados</div>
              <div style={{ display: 'flex', gap: 8, padding: '2px 6px', fontSize: 10 }}>
                Peso: <input className={inp} style={{ width: 60 }} />
                Talla: <input className={inp} style={{ width: 60 }} />
                T/A: <input className={inp} style={{ width: 80 }} />
              </div>
              <textarea className={inp} rows={3} defaultValue={d.exploracion} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
          </tr>

          {/* Tratamiento realizado */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>TRATAMIENTO REALIZADO</div></td>
          </tr>
          <tr>
            <td colSpan={4} style={cell}>
              <div style={SH}>Descripción del tratamiento (médico y/o quirúrgico)</div>
              <textarea className={inp} rows={3} defaultValue={d.tx_texto} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
            <F label="Código CPT-4" span={2}><input className={inp} /></F>
          </tr>
          <tr>
            <td colSpan={2} style={cell}>
              <div style={SH}>¿Hubo complicaciones?</div>
              <div style={{ padding: '3px 6px', fontSize: 11 }}>
                <label><input type="radio" name="comp" /> Sí</label>
                <label style={{ marginLeft: 8 }}><input type="radio" name="comp" defaultChecked /> No</label>
              </div>
            </td>
            <td colSpan={4} style={cell}>
              <div style={SH}>Descripción de complicaciones</div>
              <input className={inp} style={{ padding: '2px 4px' }} />
            </td>
          </tr>

          {/* Tratamiento a programar */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>TRATAMIENTO A PROGRAMAR</div></td>
          </tr>
          <tr>
            <td colSpan={4} style={cell}>
              <div style={SH}>Descripción del tratamiento a realizar</div>
              <textarea className={inp} rows={2} style={{ display: 'block', padding: '2px 4px', resize: 'vertical' }} />
            </td>
            <td colSpan={2} style={cell}>
              <div style={SH}>Tipo de estancia</div>
              <div style={{ padding: '3px 6px', fontSize: 11 }}>
                {['Urgencia','Hospitalaria','Corta estancia/ambulatoria'].map(t => (
                  <div key={t}><label><input type="radio" name="est" /> {t}</label></div>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <F label="Nombre del hospital" span={3}><input className={inp} defaultValue={d.hospital} /></F>
            <F label="Ciudad" span={2}><input className={inp} defaultValue={d.hospital_ciudad} /></F>
            <td style={cell}>
              <div style={SH}>Fechas</div>
              <div style={{ padding: '2px 4px', fontSize: 10 }}>
                Ingreso: <input className={inp} style={{ width: 70 }} /><br />
                Egreso: <input className={inp} style={{ width: 70 }} />
              </div>
            </td>
          </tr>

          {/* Datos generales del médico */}
          <tr>
            <td colSpan={6} style={{ padding: 0 }}><div style={H}>DATOS GENERALES DEL MÉDICO (OBLIGATORIOS)</div></td>
          </tr>
          <tr>
            <td colSpan={6} style={cell}>
              <div style={{ padding: '3px 8px' }}>
                <div style={{ marginBottom: 4 }}>
                  Nombre: <input className={inp} defaultValue={`${doctor.apellido1} ${doctor.apellido2} ${doctor.nombres}`} style={{ width: '60%' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                  <div>Especialidad: <input className={inp} defaultValue={doctor.especialidad} /></div>
                  <div>RFC: <input className={inp} defaultValue={doctor.rfc} /></div>
                  <div>Teléfono: <input className={inp} defaultValue={cons?.telefono ?? doctor.consultorios.Muguerza.telefono} /></div>
                  <div>Cédula Prof.: <input className={inp} defaultValue={doctor.cedula_prof} /></div>
                  <div>Correo: <input className={inp} defaultValue={doctor.email_seguros} /></div>
                  <div>Celular: <input className={inp} defaultValue={doctor.celular} /></div>
                  <div style={{ gridColumn: '1/-1' }}>Cédula especialidad: <input className={inp} defaultValue={doctor.cedula_esp} style={{ width: '80%' }} /></div>
                </div>
              </div>
            </td>
          </tr>

          {/* Firma */}
          <tr>
            <td colSpan={3} style={{ ...cell, padding: '8px', textAlign: 'center', fontSize: 11 }}>
              <div style={{ height: 55 }} />
              <strong>Fernando Quiroz Compeán</strong><br />Firma del médico tratante
            </td>
            <td colSpan={3} style={{ ...cell, padding: '8px', textAlign: 'center', fontSize: 11 }}>
              <div style={{ height: 55 }} />
              León, Guanajuato {fmt(d.fecha_consulta)}<br />Lugar y fecha
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
