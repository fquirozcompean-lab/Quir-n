import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function InformesPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>
  searchParams: Promise<{ aseguradora?: string }>
}) {
  const { patientId } = await params
  const { aseguradora = 'gnp' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patient } = await supabase
    .from('patients')
    .select('nombre')
    .eq('id', patientId)
    .eq('user_id', user!.id)
    .single()

  if (!patient) notFound()

  const aseguradoras = [
    { key: 'gnp',       label: 'GNP' },
    { key: 'metlife',   label: 'MetLife' },
    { key: 'axa',       label: 'AXA' },
    { key: 'bbva',      label: 'BBVA' },
    { key: 'mapfre',    label: 'MAPFRE' },
    { key: 'atlas',     label: 'Atlas' },
    { key: 'monterrey', label: 'Monterrey' },
  ]

  const pdfUrl = `/api/forms/${patientId}/${aseguradora}`

  return (
    <div className="space-y-3 pb-4">
      <Link href={`/pacientes/${patientId}`} className="text-teal text-sm font-semibold hover:underline">
        ← {patient.nombre}
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-extrabold text-navy">Informe médico</h2>
        <div className="flex gap-1 flex-wrap">
          {aseguradoras.map(a => (
            <Link
              key={a.key}
              href={`/informes/${patientId}?aseguradora=${a.key}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                aseguradora === a.key
                  ? 'bg-navy text-white'
                  : 'bg-teal-light text-navy hover:bg-border'
              }`}
            >
              {a.label}
            </Link>
          ))}
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold bg-teal text-white px-4 py-1.5 rounded-lg hover:opacity-90 ml-auto"
        >
          Abrir / Imprimir ↗
        </a>
      </div>

      <iframe
        src={pdfUrl}
        className="w-full rounded-xl border border-border"
        style={{ height: 'calc(100vh - 160px)', minHeight: 600 }}
        title={`Formato ${aseguradora}`}
      />
    </div>
  )
}
