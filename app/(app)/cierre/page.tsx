import { createClient } from '@/lib/supabase/server'
import CierreClient from './CierreClient'

export default async function CierrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Today in Mexico City time (UTC-6)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })

  // Follow-up consultations today
  const { data: consults } = await supabase
    .from('consultations')
    .select('patient_id')
    .eq('user_id', user!.id)
    .eq('fecha', today)

  // First-visit patients today (fecha_consulta from migration or manual entry)
  const { data: newPatients } = await supabase
    .from('patients')
    .select('id, nombre, telefono')
    .eq('user_id', user!.id)
    .eq('fecha_consulta', today)

  // Resolve patient ids from consultations
  const consultIds = [...new Set((consults ?? []).map(c => c.patient_id))]

  const { data: consultPatients } = consultIds.length > 0
    ? await supabase
        .from('patients')
        .select('id, nombre, telefono')
        .in('id', consultIds)
    : { data: [] }

  // Merge + deduplicate
  const map = new Map<string, { id: string; nombre: string; telefono: string | null }>()
  for (const p of [...(newPatients ?? []), ...(consultPatients ?? [])]) {
    map.set(p.id, p)
  }
  const patients = [...map.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))

  const todayLabel = new Date().toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="space-y-4 pb-10">
      <div>
        <h2 className="text-xl font-extrabold text-navy">Cierre del día</h2>
        <p className="text-sm text-muted capitalize">
          {todayLabel} · {patients.length} paciente{patients.length !== 1 ? 's' : ''}
        </p>
      </div>
      <CierreClient patients={patients} today={today} />
    </div>
  )
}
