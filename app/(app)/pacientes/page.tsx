import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { normalizeText } from '@/lib/utils'
import { SearchBar } from './SearchBar'
import { SortSelect } from './SortSelect'
import { PatientList } from './PatientList'
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

  const query = supabase
    .from('patients')
    .select('id, nombre, sexo, fecha_nacimiento, fecha_consulta, dx, ciudad')
    .eq('archived', false)
    .order(column, { ascending, nullsFirst: false })

  const [{ data: allPatients }, { data: attachRows }] = await Promise.all([
    query,
    supabase.from('attachments').select('patient_id'),
  ])

  const qNorm = q?.trim() ? normalizeText(q.trim()) : ''
  const patients = qNorm
    ? (allPatients ?? []).filter(p => normalizeText(p.nombre).includes(qNorm))
    : allPatients

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

      <PatientList
        patients={patients}
        countMap={countMap}
        showFecha={showFecha}
        emptyMessage={q ? `Sin resultados para "${q}".` : 'Aún no hay pacientes. Crea el primero con el botón de arriba.'}
      />
    </>
  )
}
