import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { calcAge, initials, formatDate } from '@/lib/utils'
import { SearchBar } from './SearchBar'
import { SortSelect } from './SortSelect'
import QuickUploadFab from './QuickUploadFab'

const SORTS = {
  nombre_asc:  { column: 'nombre',         ascending: true  },
  nombre_desc: { column: 'nombre',         ascending: false },
  fecha_desc:  { column: 'fecha_consulta', ascending: false },
  fecha_asc:   { column: 'fecha_consulta', ascending: true  },
} as const

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>
}) {
  const { q, sort } = await searchParams
  const sortKey = (sort && sort in SORTS ? sort : 'nombre_asc') as keyof typeof SORTS
  const { column, ascending } = SORTS[sortKey]
  const supabase = await createClient()

  let query = supabase
    .from('patients')
    .select('id, nombre, sexo, fecha_nacimiento, fecha_consulta, dx, ciudad')
    .eq('archived', false)

  if (q?.trim()) {
    query = query.ilike('nombre', `%${q.trim()}%`)
  }
  query = query.order(column, { ascending, nullsFirst: false })

  const [{ data: patients }, { data: attachRows }] = await Promise.all([
    query,
    supabase.from('attachments').select('patient_id'),
  ])

  const countMap = (attachRows ?? []).reduce<Record<string, number>>((acc, { patient_id }) => {
    acc[patient_id] = (acc[patient_id] ?? 0) + 1
    return acc
  }, {})

  const showFecha = sortKey === 'fecha_desc' || sortKey === 'fecha_asc'

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-navy">
          Pacientes{patients ? ` (${patients.length})` : ''}
        </h2>
        <div className="flex gap-2">
          <Link
            href="/pacientes/archivados"
            className="bg-teal-light text-navy text-sm font-semibold px-3 py-2 rounded-lg hover:bg-border transition-colors"
          >
            🗄 Archivados
          </Link>
          <Link
            href="/importar"
            className="bg-teal-light text-navy text-sm font-semibold px-3 py-2 rounded-lg hover:bg-border transition-colors"
          >
            ↑ Importar
          </Link>
          <Link
            href="/pacientes/nuevo"
            className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal transition-colors"
          >
            + Nuevo
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SearchBar defaultValue={q ?? ''} />
        </div>
        <SortSelect defaultValue={sortKey} />
      </div>
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
                    {showFecha && p.fecha_consulta ? ` · ${formatDate(p.fecha_consulta)}` : ''}
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
