import { createClient } from '@/lib/supabase/server'
import UploadClient from './UploadClient'

export default async function SubirPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string; name?: string; mime?: string; quick?: string; patient_id?: string }>
}) {
  const { pending, name, mime, quick, patient_id } = await searchParams
  const supabase = await createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, nombre')
    .order('nombre', { ascending: true })

  let sharedFileUrl: string | null = null
  if (pending) {
    const { data } = await supabase.storage.from('estudios').createSignedUrl(pending, 300)
    sharedFileUrl = data?.signedUrl ?? null
  }

  return (
    <>
      <h2 className="text-lg font-extrabold text-navy mb-1">Subir estudio</h2>
      <p className="text-xs text-muted mb-4">
        Elige un archivo PDF/imagen, o usa <strong>Escanear</strong> para tomar foto directamente con la cámara.
        Escribe el nombre del paciente para buscarlo automáticamente.
      </p>
      {!patients || patients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted">
          Primero registra al menos un paciente para poder adjuntar estudios.
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-4">
          <UploadClient
            patients={patients}
            sharedFileUrl={sharedFileUrl}
            sharedFileName={name ?? null}
            sharedFileMime={mime ?? null}
            pendingPath={pending ?? null}
            quickUpload={quick === '1'}
            preselectedPatientId={patient_id ?? null}
          />
        </div>
      )}
    </>
  )
}
