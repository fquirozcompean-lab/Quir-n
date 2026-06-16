import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') ?? 'json'
  const ids    = searchParams.get('ids') ?? 'all'

  let patientsQuery = supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .order('nombre')

  if (ids !== 'all') {
    patientsQuery = patientsQuery.in('id', ids.split(','))
  }

  const { data: patients } = await patientsQuery
  if (!patients) return new NextResponse('Error', { status: 500 })

  const patientIds = patients.map(p => p.id)

  const { data: consultations } = await supabase
    .from('consultations')
    .select('*')
    .eq('user_id', user.id)
    .in('patient_id', patientIds)
    .order('fecha', { ascending: false })

  if (format === 'json') {
    const payload = patients.map(p => ({
      ...p,
      consultations: consultations?.filter(c => c.patient_id === p.id) ?? [],
    }))
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="quiron-expedientes-${new Date().toISOString().slice(0,10)}.json"`,
      },
    })
  }

  if (format === 'csv') {
    const cols = [
      'nombre','sexo','fecha_nacimiento','ciudad','telefono','ocupacion',
      'cronicos','quirurgicos','alergicos','medicamentos',
      'tabaquismo','alcohol','padecimiento','dx_texto','tx_texto',
      'pronostico','fecha_consulta','consultorio',
    ]
    const header = cols.join(',')
    const rows = patients.map(p =>
      cols.map(k => {
        const v = (p as Record<string,unknown>)[k]
        if (v == null) return ''
        const s = Array.isArray(v) ? v.join('; ') : String(v)
        return `"${s.replace(/"/g, '""')}"`
      }).join(',')
    )
    const csv = [header, ...rows].join('\r\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="quiron-expedientes-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    })
  }

  return new NextResponse('Formato no soportado', { status: 400 })
}
