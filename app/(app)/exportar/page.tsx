import { createClient } from '@/lib/supabase/server'
import ExportClient from './ExportClient'

export default async function ExportarPage() {
  const supabase = await createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, nombre, fecha_consulta')
    .order('nombre')

  return (
    <>
      <h2 className="text-lg font-extrabold text-navy mb-1">Exportar expedientes</h2>
      <p className="text-xs text-muted mb-4">
        Selecciona los expedientes que deseas descargar, o deja todo sin marcar para exportar todos.
      </p>
      <ExportClient patients={patients ?? []} />
    </>
  )
}
