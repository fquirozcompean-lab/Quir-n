import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { calcAge, initials, formatDate } from '@/lib/utils'
import { SharePrescription } from './SharePrescription'
import { DOCTOR } from '@/lib/doctor'

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm py-0.5">
      <span className="font-semibold text-navy min-w-[10rem] flex-shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border px-4 py-4">
      <h3 className="text-teal text-sm font-semibold uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full">
      {label}
    </span>
  )
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: patient }, { data: attachments }, { data: consultations }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('attachments').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
    supabase.from('consultations').select('*').eq('patient_id', id).eq('user_id', user!.id).order('fecha', { ascending: false }),
  ])

  if (!patient) notFound()

  const attachmentsWithUrls = await Promise.all(
    (attachments ?? []).map(async (att) => {
      const { data } = await supabase.storage.from('estudios').createSignedUrl(att.storage_path, 3600)
      return { ...att, url: data?.signedUrl ?? null }
    })
  )

  const isFemale = patient.sexo === 'F'

  // WhatsApp seguimiento
  const waPhone = (() => {
    const digits = (patient.telefono ?? '').replace(/\D/g, '')
    if (digits.length === 10) return `52${digits}`
    if (digits.length >= 12 && digits.startsWith('52')) return digits
    return null
  })()
  const waMsg = encodeURIComponent(
    `Estimado/a ${patient.nombre}, fue un placer atenderle en consulta. Si cuenta con un momento, le agradecería mucho compartir su experiencia con una reseña: ${DOCTOR.reviewUrl}`
  )
  const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${waMsg}` : `https://wa.me/?text=${waMsg}`

  return (
    <div className="space-y-3 pb-10">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/pacientes" className="text-teal text-sm font-semibold hover:underline">
          ← Pacientes
        </Link>
      </div>

      {/* ── Encabezado ── */}
      <div className="bg-card rounded-xl border border-border px-4 py-4 flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-white flex-shrink-0 text-base ${isFemale ? 'bg-accent' : 'bg-teal'}`}
        >
          {initials(patient.nombre)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-extrabold text-navy leading-tight">{patient.nombre}</h2>
            {patient.expediente_num && (
              <span className="text-xs font-mono bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
                Exp. #{String(patient.expediente_num).padStart(4, '0')}
              </span>
            )}
          </div>
          <p className="text-sm text-muted">
            {isFemale ? 'Femenino' : patient.sexo === 'M' ? 'Masculino' : ''}{patient.sexo ? ' · ' : ''}{calcAge(patient.fecha_nacimiento)}
            {patient.ciudad ? ` · ${patient.ciudad}` : ''}
            {patient.ocupacion ? ` · ${patient.ocupacion}` : ''}
          </p>
          {patient.telefono && (
            <p className="text-xs text-muted mt-0.5">Tel: {patient.telefono}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
          {DOCTOR.procedimiento.mostrar && (
            <Link
              href={`/pacientes/${id}${DOCTOR.procedimiento.href}`}
              className="text-xs bg-teal text-white font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              {DOCTOR.procedimiento.label}
            </Link>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: '#25d366' }}
          >
            ★ Reseña
          </a>
          <Link
            href={`/informes/${id}`}
            className="text-xs bg-accent text-white font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Aseguradora
          </Link>
          <Link
            href={`/pacientes/${id}/editar`}
            className="text-xs bg-teal-light text-navy font-semibold px-3 py-1.5 rounded-lg hover:bg-border transition-colors"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* ── Datos generales ── */}
      <SectionBlock title="Datos generales">
        <div className="space-y-0.5">
          <Row label="Fecha de consulta" value={formatDate(patient.fecha_consulta)} />
          <Row label="Fecha de nacimiento" value={formatDate(patient.fecha_nacimiento)} />
          <Row label="Lugar de nacimiento" value={patient.lugar_nacimiento} />
          <Row label="Lugar de residencia" value={patient.ciudad} />
          <Row label="Escolaridad" value={patient.escolaridad} />
          <Row label="Estado civil" value={patient.estado_civil} />
          <Row label="Religión" value={patient.religion} />
          <Row label="Hemotipo" value={patient.hemotipo} />
          <Row label="Quién refiere" value={patient.refiere} />
        </div>
      </SectionBlock>

      {/* ── Antecedentes heredofamiliares ── */}
      {(patient.ahf_abuelo_materno || patient.ahf_abuela_materna || patient.ahf_abuelo_paterno ||
        patient.ahf_abuela_paterna || patient.ahf_padre || patient.ahf_madre ||
        patient.ahf_hermanos || patient.ahf_hijos || patient.ahf_otros) && (
        <SectionBlock title="Antecedentes heredofamiliares">
          <div className="space-y-0.5">
            <Row label="Abuelo materno" value={patient.ahf_abuelo_materno} />
            <Row label="Abuela materna" value={patient.ahf_abuela_materna} />
            <Row label="Abuelo paterno" value={patient.ahf_abuelo_paterno} />
            <Row label="Abuela paterna" value={patient.ahf_abuela_paterna} />
            <Row label="Padre" value={patient.ahf_padre} />
            <Row label="Madre" value={patient.ahf_madre} />
            <Row label="Hermanos" value={patient.ahf_hermanos} />
            <Row label="Hijos" value={patient.ahf_hijos} />
            <Row label="Otros" value={patient.ahf_otros} />
          </div>
        </SectionBlock>
      )}

      {/* ── Antecedentes personales no patológicos ── */}
      {patient.otros_np && (
        <SectionBlock title="Antecedentes personales no patológicos">
          <p className="text-sm text-gray-700">{patient.otros_np}</p>
        </SectionBlock>
      )}

      {/* ── Antecedentes personales patológicos ── */}
      {(patient.cronicos || patient.quirurgicos || patient.alergicos || patient.medicamentos ||
        patient.transfusiones || patient.tabaquismo || patient.alcohol || patient.drogas) && (
        <SectionBlock title="Antecedentes personales patológicos">
          <div className="space-y-0.5">
            <Row label="Crónicos" value={patient.cronicos} />
            <Row label="Quirúrgicos" value={patient.quirurgicos} />
            <Row label="Alérgicos" value={patient.alergicos} />
            <Row label="Medicamentos de uso crónico" value={patient.medicamentos} />
            <Row label="Transfusiones" value={patient.transfusiones} />
            <Row label="Tabaquismo" value={patient.tabaquismo} />
            <Row label="Etilismo" value={patient.alcohol} />
            <Row label="Drogas" value={patient.drogas} />
          </div>
        </SectionBlock>
      )}

      {/* ── Ginecológicos ── */}
      {isFemale && (patient.gesta || patient.menarca || patient.ritmo || patient.fur || patient.anticonceptivos) && (
        <SectionBlock title="Antecedentes ginecológicos">
          <div className="space-y-0.5">
            <Row label="Embarazos" value={patient.gesta} />
            <Row label="Menarca" value={patient.menarca} />
            <Row label="Ritmo" value={patient.ritmo} />
            <Row label="Fecha de última regla" value={patient.fur} />
            <Row label="Anticonceptivos" value={patient.anticonceptivos} />
          </div>
        </SectionBlock>
      )}

      {/* ── Padecimiento actual ── */}
      {(patient.padecimiento || patient.exploracion) && (
        <SectionBlock title="Padecimiento actual">
          {patient.padecimiento && <p className="text-sm text-gray-700 mb-2">{patient.padecimiento}</p>}
          {patient.exploracion && (
            <>
              <p className="text-xs text-muted font-semibold mb-1 mt-2">Exploración física</p>
              <p className="text-sm text-gray-700">{patient.exploracion}</p>
            </>
          )}
        </SectionBlock>
      )}

      {/* ── Signos vitales (historia clínica inicial) ── */}
      {patient.signos_vitales && (
        <SectionBlock title="Signos vitales">
          <div className="flex flex-wrap gap-2 mb-2">
            {patient.signos_vitales.ta   && <span className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-mono">T/A {patient.signos_vitales.ta} mmHg</span>}
            {patient.signos_vitales.fc   && <span className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-mono">FC {patient.signos_vitales.fc} lpm</span>}
            {patient.signos_vitales.fr   && <span className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-mono">FR {patient.signos_vitales.fr} rpm</span>}
            {patient.signos_vitales.temp && <span className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-mono">T {patient.signos_vitales.temp}°C</span>}
            {patient.signos_vitales.spo2 && <span className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-mono">SpO₂ {patient.signos_vitales.spo2}%</span>}
          </div>
          {patient.pronostico && (
            <span className={`inline-flex text-sm px-3 py-1 rounded-full font-semibold ${
              patient.pronostico === 'Favorable'   ? 'bg-green-100 text-green-700' :
              patient.pronostico === 'Reservado'   ? 'bg-yellow-100 text-yellow-700' :
              patient.pronostico === 'Malo'        ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>Pronóstico: {patient.pronostico}</span>
          )}
        </SectionBlock>
      )}

      {/* ── Diagnóstico ── */}
      {(patient.dx?.length > 0 || patient.dx_texto) && (
        <SectionBlock title="Diagnóstico">
          {patient.dx?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {patient.dx.map((d: string) => <Chip key={d} label={d} />)}
            </div>
          )}
          {patient.dx_texto && <p className="text-sm text-gray-700">{patient.dx_texto}</p>}
        </SectionBlock>
      )}

      {/* ── Tratamiento y solicitudes ── */}
      <div className="bg-card rounded-xl border border-border px-4 py-4">
        <h3 className="text-teal text-sm font-semibold uppercase tracking-wide mb-3">Tratamiento y solicitudes</h3>
        {patient.tx?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {patient.tx.map((t: string) => <Chip key={t} label={t} />)}
          </div>
        )}
        {patient.tx_texto && <p className="text-sm text-gray-700 mb-2">{patient.tx_texto}</p>}
        {patient.estudios_solicitados?.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted font-semibold mb-1">Estudios solicitados</p>
            <div className="flex flex-wrap gap-1.5">
              {patient.estudios_solicitados.map((e: string) => (
                <span key={e} className="text-xs bg-teal-light text-navy px-2.5 py-1 rounded-full border border-border">{e}</span>
              ))}
            </div>
          </div>
        )}
        {!patient.tx?.length && !patient.tx_texto && !patient.estudios_solicitados?.length && (
          <p className="text-sm text-muted mb-1">Sin tratamiento registrado.</p>
        )}
        <SharePrescription patientId={id} />
      </div>

      {/* ── Consultas de seguimiento ── */}
      <div className="bg-card rounded-xl border border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-teal text-sm font-semibold">
            Consultas de seguimiento ({consultations?.length ?? 0})
          </h3>
          <Link
            href={`/pacientes/${id}/nueva-consulta`}
            className="text-xs bg-teal text-white font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            + Nueva consulta
          </Link>
        </div>
        {consultations && consultations.length > 0 ? (
          <div className="space-y-3">
            {consultations.map((c: any) => (
              <div key={c.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy">{formatDate(c.fecha)}</span>
                    <Link href={`/pacientes/${id}/consulta/${c.id}/editar`} className="text-xs text-muted hover:text-teal hover:underline">Editar</Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.pronostico && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        c.pronostico === 'Favorable'     ? 'bg-green-100 text-green-700' :
                        c.pronostico === 'Reservado'     ? 'bg-yellow-100 text-yellow-700' :
                        c.pronostico === 'Malo'          ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{c.pronostico}</span>
                    )}
                    {c.consultorio && (
                      <span className="text-xs bg-teal-light text-teal px-2 py-0.5 rounded-full font-semibold">{c.consultorio}</span>
                    )}
                  </div>
                </div>
                {c.motivo && <p className="text-xs text-muted mb-1">{c.motivo}</p>}
                {c.signos_vitales && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {c.signos_vitales.ta   && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">T/A {c.signos_vitales.ta}</span>}
                    {c.signos_vitales.fc   && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">FC {c.signos_vitales.fc}</span>}
                    {c.signos_vitales.fr   && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">FR {c.signos_vitales.fr}</span>}
                    {c.signos_vitales.temp && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">T {c.signos_vitales.temp}°C</span>}
                    {c.signos_vitales.spo2 && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">SpO₂ {c.signos_vitales.spo2}%</span>}
                  </div>
                )}
                {c.dx?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {c.dx.map((d: string) => <Chip key={d} label={d} />)}
                  </div>
                )}
                {c.dx_texto && <p className="text-xs text-gray-600 mb-1">{c.dx_texto}</p>}
                {c.tx_texto && (
                  <p className="text-xs text-gray-700 bg-teal-light rounded px-2 py-1 mt-1 whitespace-pre-line">{c.tx_texto}</p>
                )}
                {c.estudios_solicitados?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.estudios_solicitados.map((e: string) => (
                      <span key={e} className="text-xs bg-border text-navy px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Sin consultas de seguimiento.{' '}
            <Link href={`/pacientes/${id}/nueva-consulta`} className="text-teal hover:underline">Agregar primera</Link>.
          </p>
        )}
      </div>

      {/* ── Estudios adjuntos ── */}
      <div className="bg-card rounded-xl border border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-teal text-sm font-semibold">
            Estudios adjuntos ({attachmentsWithUrls.length})
          </h3>
          <Link href={`/subir?patient_id=${id}`} className="text-xs text-teal font-semibold hover:underline">
            + Subir
          </Link>
        </div>
        {attachmentsWithUrls.length === 0 ? (
          <p className="text-sm text-muted">Sin estudios adjuntos. <Link href={`/subir?patient_id=${id}`} className="text-teal hover:underline">Subir uno</Link>.</p>
        ) : (
          <div className="space-y-2">
            {attachmentsWithUrls.map(att => (
              <div key={att.id} className="flex items-center gap-3 text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="w-8 h-8 rounded-md bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {att.tipo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy truncate">{att.nombre_archivo}</p>
                  <p className="text-xs text-muted">{formatDate(att.fecha)}</p>
                </div>
                {att.url && (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal font-semibold hover:underline flex-shrink-0"
                  >
                    Abrir
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
