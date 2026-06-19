import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { calcAge, initials } from '@/lib/utils'
import UnarchiveButton from './UnarchiveButton'

export const metadata = { title: 'Expedientes archivados — Quirón' }

export default async function ArchivadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, nombre, sexo, fecha_nacimiento, dx, ciudad')
    .eq('archived', true)
    .order('nombre', { ascending: true })

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-navy">
          Expedientes archivados{patients ? ` (${patients.length})` : ''}
        </h2>
        <Link
          href="/pacientes"
          className="text-teal text-sm font-semibold hover:underline"
        >
          ← Volver a pacientes
        </Link>
      </div>

      <p className="text-xs text-muted mb-4">
        Estos expedientes no aparecen en la lista de pacientes activos. Los datos se conservan
        en cumplimiento con la NOM-004-SSA3. Puedes restaurarlos cuando quieras.
      </p>

      {!patients || patients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted text-sm">
          No hay expedientes archivados.
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map(p => {
            const isFemale = p.sexo === 'F'
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0 opacity-60 ${isFemale ? 'bg-accent' : 'bg-teal'}`}
                >
                  {initials(p.nombre)}
                </div>
                <Link href={`/pacientes/${p.id}`} className="flex-1 min-w-0 hover:opacity-80">
                  <div className="font-semibold text-navy text-sm truncate">{p.nombre}</div>
                  <div className="text-xs text-muted">
                    {isFemale ? 'F' : p.sexo === 'M' ? 'M' : '—'} · {calcAge(p.fecha_nacimiento)}
                    {p.ciudad ? ` · ${p.ciudad}` : ''}
                    {p.dx?.[0] ? ` · ${p.dx[0]}` : ''}
                  </div>
                </Link>
                <UnarchiveButton patientId={p.id} email={user!.email!} />
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
