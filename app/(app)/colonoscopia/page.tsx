import { DOCTOR } from '@/lib/doctor'
import ColonoscopyClient from '@/app/(app)/pacientes/[id]/colonoscopia/ColonoscopyClient'

export default function ColonoscopyStandalonePage() {
  return (
    <ColonoscopyClient
      patientId={null}
      patientName={null}
      patientPhone={null}
      doctor={DOCTOR}
    />
  )
}
