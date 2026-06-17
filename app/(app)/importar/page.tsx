import ImportClient from './ImportClient'

export const metadata = { title: 'Importar expedientes — Quirón' }

export default function ImportarPage() {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-navy">Importar expedientes</h2>
        <p className="text-xs text-muted mt-0.5">
          Sube un archivo Word o PDF con expedientes de pacientes. La IA extrae los datos automáticamente.
        </p>
      </div>
      <ImportClient />
    </>
  )
}
