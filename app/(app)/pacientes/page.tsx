import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { calcAge, initials } from '@/lib/utils'
import { SearchBar } from './SearchBar'
import QuickUploadFab from './QuickUploadFab'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('patients')
    .select('id, nombre, sexo, fecha_nacimiento, dx, ciudad')

  if (q?.trim()) {
    query = query.ilike('nombre', `%${q.trim()}%`).order('nombre', { ascending: true })
  } else {
    query = query.order('nombre', { ascending: true })
  }

  const [{ data: patients }, { data: attachRows }] = await Promise.all([
    query,
    supabase.from('attachments').select('patient_id'),
  ])

  const countMap = (attachRows ?? []).reduce<Record<string, number>>((acc, { patient_id }) => {
    acc[patient_id] = (acc[patient_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-navy">
          Pacientes{patients ? ` (${patients.length})` : ''}
        </h2>
        <Link
          href="/pacientes/nuevo"
          className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal transition-colors"
        >
          + Nuevo
        </Link>
      </div>

      <SearchBar defaultValue={q ?? ''} />
      <QuickUploadFab />

      {!patients || patients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted text-sm">
          {q ? `Sin resultados para "${q}".` : 'Aún no hay pacientes. Crea el primero con el botón de arriba.'}
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map(p => {
            const isFemale = p.sexo === 'F'
            return (
              <Link
                key={p.id}
                href={`/pacientes/${p.id}`}
                className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3 hover:border-teal transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0 ${isFemale ? 'bg-accent' : 'bg-teal'}`}
                >
                  {initials(p.nombre)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy text-sm truncate">{p.nombre}</div>
                  <div className="text-xs text-muted">
                    {isFemale ? 'F' : p.sexo === 'M' ? 'M' : '—'} · {calcAge(p.fecha_nacimiento)}
                    {p.ciudad ? ` · ${p.ciudad}` : ''}
                    {p.dx?.[0] ? ` · ${p.dx[0]}` : ''}
                  </div>
                </div>
                <span className="text-xs bg-teal-light text-navy px-2.5 py-1 rounded-full flex-shrink-0">
                  {countMap[p.id] ?? 0} adj.
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
