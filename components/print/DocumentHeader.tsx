import type { DoctorProfile } from '@/lib/types'

export default function DocumentHeader({
  profile,
  patientName,
  subtitle,
}: {
  profile: Pick<DoctorProfile, 'nombre' | 'cedula_prof' | 'cedula_esp' | 'logo_url' | 'emergencias' | 'email'> | null
  patientName: string
  subtitle: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b-2 border-navy">
      <div>
        <h1 className="text-lg font-extrabold text-navy">{patientName}</h1>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {profile?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logo_url} alt={profile?.nombre ?? ''} className="max-h-16 max-w-[220px] object-contain ml-auto mb-1" style={{ mixBlendMode: 'multiply' }} />
        )}
        <p className="text-sm font-bold text-navy">{profile?.nombre}</p>
        <p className="text-xs text-gray-500">
          Cédula Prof. {profile?.cedula_prof}
          {profile?.cedula_esp ? ` · Cédula Esp. ${profile.cedula_esp}` : ''}
        </p>
      </div>
    </div>
  )
}
