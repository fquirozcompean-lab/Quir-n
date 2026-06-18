import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFForm } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { getDoctorProfile } from '@/lib/doctor-profile'
import { calcAge } from '@/lib/utils'

// ── helpers ──────────────────────────────────────────────────────────────────

function set(form: PDFForm, name: string, value: string | null | undefined, fontSize = 9) {
  try {
    const f = form.getTextField(name)
    f.setFontSize(fontSize)
    f.setText(value || '')
  } catch {}
}
function check(form: PDFForm, name: string, yes: boolean) {
  try { yes ? form.getCheckBox(name).check() : form.getCheckBox(name).uncheck() } catch {}
}
function radio(form: PDFForm, name: string, value: string) {
  try { form.getRadioGroup(name).select(value) } catch {}
}

/** Split ISO date (YYYY-MM-DD) → { d, m, y2 } — two-digit year */
function split(iso: string) {
  const [y = '', m = '', d = ''] = (iso ?? '').split('-')
  return { d, m, y2: y.slice(2) }
}
/** Format date as DD/MM/YYYY */
function fmt(iso: string) {
  if (!iso) return ''
  const { d, m } = split(iso)
  const y = (iso ?? '').split('-')[0] ?? ''
  return `${d}/${m}/${y}`
}
/** Today's date as ISO */
function today() { return new Date().toISOString().slice(0, 10) }

// ── route ────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string; aseguradora: string }> },
) {
  const { patientId, aseguradora } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const [{ data: patient }, { data: consult }, profile] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).eq('user_id', user.id).single(),
    supabase.from('consultations').select('*')
      .eq('patient_id', patientId).eq('user_id', user.id)
      .order('fecha', { ascending: false }).limit(1).maybeSingle(),
    getDoctorProfile(),
  ])
  if (!patient || !profile) return new NextResponse('Not found', { status: 404 })

  const src = consult ?? patient

  // ── build patient data object ──────────────────────────────────────────────
  const words = (patient.nombre ?? '').trim().split(/\s+/)
  const ap1  = (words[0] ?? '').toUpperCase()
  const ap2  = (words[1] ?? '').toUpperCase()
  const noms = words.slice(2).join(' ').toUpperCase()
  const nombre = patient.nombre?.toUpperCase() ?? ''
  const edad   = String(calcAge(patient.fecha_nacimiento) ?? '')
  const sexo   = (patient.sexo ?? '').toUpperCase()
  const fnac   = patient.fecha_nacimiento ?? ''
  const fcons  = (consult?.fecha ?? patient.fecha_consulta ?? today())

  const cronicos    = (patient.cronicos     ?? '').toUpperCase()
  const quirurgicos = (patient.quirurgicos  ?? '').toUpperCase()
  const medicamentos= (patient.medicamentos ?? '').toUpperCase()
  const tabaquismo  = (patient.tabaquismo   ?? '').toUpperCase()
  const alcohol_val = (patient.alcohol      ?? '').toUpperCase()
  const alergicos   = (patient.alergicos    ?? '').toUpperCase()
  const gesta       = patient.gesta ?? ''
  const menarca     = patient.menarca ?? ''
  const ritmo       = patient.ritmo ?? ''
  const gineco      = [
    gesta  ? `G${gesta}`        : '',
    menarca? `Menarca ${menarca}`: '',
    ritmo  ? `Ritmo ${ritmo}`   : '',
  ].filter(Boolean).join(', ') || 'NO APLICA'

  const padecimiento = (src.padecimiento ?? patient.padecimiento ?? '').toUpperCase()
  const exploracion  = (src.exploracion  ?? patient.exploracion  ?? '').toUpperCase()
  const dx_texto     = (src.dx_texto     ?? patient.dx_texto     ?? '').toUpperCase()
  const tx_texto     = (src.tx_texto     ?? patient.tx_texto     ?? '').toUpperCase()

  const dxArr: string[] = Array.isArray(src.dx ?? patient.dx) ? (src.dx ?? patient.dx) : []
  const dx1 = (dxArr[0] ?? dx_texto ?? '').toUpperCase()
  const dx2 = (dxArr[1] ?? '').toUpperCase()
  const dx3 = (dxArr[2] ?? '').toUpperCase()

  const estudiosArr: string[] = Array.isArray(src.estudios_solicitados ?? patient.estudios_solicitados)
    ? (src.estudios_solicitados ?? patient.estudios_solicitados) : []
  const estudios = estudiosArr.join(', ').toUpperCase()

  const sv = (src.signos_vitales ?? {}) as Record<string, string>
  const ta   = sv.ta   ?? ''
  const fc   = sv.fc   ?? ''
  const fr   = sv.fr   ?? ''
  const temp = sv.temp ?? ''

  const cons = patient.consultorio ? profile.consultorios[patient.consultorio] ?? null : null
  const hospital  = (cons?.hospital     ?? '').toUpperCase()
  const ciudad    = (cons?.ciudad       ?? profile.ciudad ?? '').toUpperCase()
  const estado    = (cons?.estado       ?? '').toUpperCase()
  const tel_cons  = cons?.telefono ?? ''
  const lugarFecha = `${ciudad}, ${estado} ${fmt(fcons)}`

  // Doctor shorthand
  const D = profile
  const docNombre = `${D.apellido1} ${D.apellido2} ${D.nombres}`
  const docNombreInv = `${D.nombres} ${D.apellido1} ${D.apellido2}`

  // ── load PDF ───────────────────────────────────────────────────────────────
  const pdfPath = path.join(process.cwd(), 'public', 'forms', `${aseguradora}.pdf`)
  if (!fs.existsSync(pdfPath)) return new NextResponse('PDF not found', { status: 404 })

  const raw = fs.readFileSync(pdfPath)

  let doc: PDFDocument
  try {
    doc = await PDFDocument.load(raw, { ignoreEncryption: true })
  } catch {
    return new NextResponse(raw, { headers: { 'Content-Type': 'application/pdf' } })
  }

  const form = doc.getForm()

  // Clear all fields and fix font size
  for (const f of form.getFields()) {
    try {
      if (f.constructor.name === 'PDFTextField') {
        ;(f as any).setFontSize(9)
        ;(f as any).setText('')
      }
      if (f.constructor.name === 'PDFCheckBox') (f as any).uncheck()
    } catch {}
  }

  // ── per-insurance fill ────────────────────────────────────────────────────

  if (aseguradora === 'gnp') {
    // Patient — page 1
    set(form, 'P1_8',  ap1)
    set(form, 'P1_9',  ap2)
    set(form, 'P1_10', noms)
    check(form, 'P1_11', sexo === 'F')   // Femenino
    check(form, 'P1_12', sexo === 'M')   // Masculino
    set(form, 'P1_13', edad)
    check(form, 'P1_14', true)           // Enfermedad (default)
    // date of first symptoms ≈ consultation date
    const fc1 = split(fcons)
    set(form, 'P1_21',   fc1.d)
    set(form, 'P1_21_1', fc1.m)
    set(form, 'P1_21_2', fc1.y2)
    // diagnosis date ≈ same as consultation
    set(form, 'P1_23',   fc1.d)
    set(form, 'P1_23_1', fc1.m)
    set(form, 'P1_23_2', fc1.y2)

    set(form, 'P1_17', cronicos || 'INTERROGADOS Y NEGADOS')
    set(form, 'P1_18', tabaquismo && alcohol_val ? `TABAQUISMO: ${tabaquismo}. ALCOHOL: ${alcohol_val}` : 'INTERROGADOS Y NEGADOS')
    set(form, 'P1_19', gineco)
    set(form, 'P1_20', 'NO APLICA')
    set(form, 'P1_22', padecimiento)
    set(form, 'P1_24', dx1 || dx_texto)
    check(form, 'P1_27', true)   // crónico (default checked same as sample)

    // Vitals — page 2
    set(form, 'P2_1', fc)
    set(form, 'P2_2', fr)
    set(form, 'P2_3', temp)
    set(form, 'P2_4', ta)
    set(form, 'P2_7', exploracion)
    set(form, 'P2_8', estudios || exploracion)
    check(form, 'P2_11', true)  // tratamiento médico
    // treatment date
    set(form, 'P2_13',   fc1.d)
    set(form, 'P2_13_1', fc1.m)
    set(form, 'P2_13_2', fc1.y2)
    set(form, 'P2_14', tx_texto)
    set(form, 'P2_17', hospital)
    set(form, 'P2_18', ciudad)
    set(form, 'P2_19', estado)
    check(form, 'P2_21', true)  // hospitalización

    // Doctor — page 3
    set(form, 'P3_1', D.apellido1)
    set(form, 'P3_2', D.apellido2)
    set(form, 'P3_3', D.nombres)
    set(form, 'P3_4', D.especialidad)
    set(form, 'P3_5', D.cedula_prof)
    set(form, 'P3_6', D.cedula_esp)
    check(form, 'P3_8', true)   // médico tratante
    check(form, 'P3_9', true)
    set(form, 'P3_12', tel_cons || D.celular)
    set(form, 'P3_13', D.celular)
    set(form, 'P3_14', D.email_seguros)
    check(form, 'P3_15', true)
    set(form, 'P3_57', lugarFecha)
    set(form, 'P3_58', docNombreInv)
  }

  else if (aseguradora === 'metlife') {
    const fc1 = split(fcons)
    set(form, 'Lugar y fecha', lugarFecha)
    set(form, 'D1', fc1.d); set(form, 'M1', fc1.m); set(form, 'A1', fc1.y2)
    set(form, '1 Datos del paciente', nombre)
    set(form, 'EDAD', edad)
    check(form, 'F',  sexo === 'F')
    check(form, 'MS', sexo === 'M')
    check(form, 'E', true)  // Enfermedad
    set(form, 'Peso',  sv.peso  ?? '')
    set(form, 'Talla', sv.talla ?? '')
    set(form, 'D2', fc1.d); set(form, 'M2', fc1.m); set(form, 'A2', fc1.y2)
    set(form, '2 Antecedentes clínicos de importancia', cronicos)
    set(form, 'Antecedentes personales patológicos 1', cronicos || 'INTERROGADOS Y NEGADOS')
    set(form, 'Antecedentes quirúrgicos 1', quirurgicos || 'INTERROGADOS Y NEGADOS')
    set(form, 'G', gesta || '0')
    set(form, 'Antecedentes ginecoobstétricos especificar si ha recibido tratamiento para infertilidad 1', gineco)
    set(form, 'a Principales signos síntomas y detalle de la evolución 1', padecimiento)
    set(form, 'D2F', fc1.d); set(form, 'M2F', fc1.m); set(form, 'A2F', fc1.y2)
    set(form, 'Detallar resultados de exploración física estudios de laboratorio yo gabinete que demuestren el diagnóstico referido 1', exploracion)
    set(form, 'Detallar resultados de exploración física estudios de laboratorio yo gabinete que demuestren el diagnóstico referido 2', estudios)
    set(form, 'd Diagnóstico etiológico definitivo', dx1)
    set(form, 'D3', fc1.d); set(form, 'M3', fc1.m); set(form, 'A3', fc1.y2)
    set(form, 'h Indicar el tratamiento yo intervención quirúrgica especificar CPT sólo como referencia 1', tx_texto)
    set(form, 'Nombre completo_4', `${D.nombres} ${D.apellido1} ${D.apellido2}`)
    set(form, 'Especialidad_3', D.especialidad)
    set(form, 'Domiclio consultorio', cons ? `${cons.consultorio}, ${hospital}` : hospital)
    set(form, 'Teléfono del consultorio', tel_cons || D.celular)
    set(form, 'Cédula profesional especialidad_5', `${D.cedula_prof} / ${D.cedula_esp ?? ''}`)
    set(form, 'Número celular_5', D.celular)
    set(form, 'Registro Federal de Contribuyentes_5', D.rfc)
    set(form, 'Correo electrónico_5', D.email_seguros)
    check(form, 'MEDTRAT', true)
  }

  else if (aseguradora === 'bbva') {
    // Patient name split: field 1=primer nombre, 2=ap paterno, 3=ap materno
    set(form, '1', noms)
    set(form, '2', ap1)
    set(form, '3', ap2)
    set(form, '4', edad)
    radio(form, 'Sexo', sexo === 'F' ? 'femenino' : 'masculino')
    radio(form, 'Causa', 'Enfermedad')
    radio(form, 'Referido', 'No')
    set(form, '5', cronicos || 'INTERROGADOS Y NEGADOS')
    set(form, '6', quirurgicos || 'INTERROGADOS Y NEGADOS')
    set(form, '7', gineco)
    set(form, '8', medicamentos || 'NINGUNO')
    set(form, '9', alergicos   || 'NINGUNO')
    set(form, '10', tabaquismo ? `TABAQUISMO: ${tabaquismo}` : 'NEGADO')
    set(form, '11', alcohol_val ? `ALCOHOL: ${alcohol_val}` : 'NEGADO')
    set(form, '19', fmt(fcons))  // fecha inicio
    set(form, '20', padecimiento)
    set(form, '21', exploracion)
    set(form, '22', fmt(fcons))  // fecha diagnóstico
    set(form, '23', dx1)
    radio(form, 'diagnostico', 'inicial')
    radio(form, 'Padecimiento1', 'crónico')
    radio(form, 'Padecimiento2', 'no')
    radio(form, 'continuara', 'si')
    radio(form, 'tratamiento', 't1')  // médico
    set(form, '24', tx_texto)
    set(form, '33', hospital)
    set(form, '34', `${ciudad}, ${estado}`)
    radio(form, 'estancia', 'e1')  // ambulatoria
    radio(form, 'medico', 'm1')    // médico tratante
    set(form, '38', D.nombres)
    set(form, '39', D.apellido1)
    set(form, '40', D.apellido2)
    set(form, '41', D.especialidad)
    set(form, '42', D.cedula_prof)
    set(form, '43', D.cedula_esp)
    set(form, '44', D.rfc)
    set(form, '45', D.celular)
    set(form, '46', D.email_seguros)
    set(form, '47', D.celular)
    radio(form, 'tabulador', 'tabsi')
    set(form, '55', docNombreInv)
    set(form, '56', lugarFecha)
  }

  else if (aseguradora === 'mapfre') {
    check(form, 'untitled1', true)  // informe médico checkbox
    set(form, 'untitled4', nombre)
    set(form, 'untitled6', edad)
    radio(form, 'untitled7', sexo === 'F' ? 'Yes' : 'No')
    check(form, 'untitled9', true)   // enfermedad
    set(form, 'untitled14', quirurgicos || 'INTERROGADOS Y NEGADOS')
    set(form, 'untitled15', tabaquismo && alcohol_val
      ? `TABAQUISMO: ${tabaquismo}. ALCOHOL: ${alcohol_val}`
      : 'INTERROGADOS Y NEGADOS')
    set(form, 'untitled16', gineco)
    set(form, 'untitled17', medicamentos || 'NINGUNO')
    set(form, 'untitled18', padecimiento)
    // date fields (individual digits for DD/MM/YY)
    const fc1 = split(fcons)
    set(form, 'untitled19', fc1.d.charAt(0))
    set(form, 'untitled20', fc1.d.charAt(1))
    set(form, 'untitled21', fc1.m.charAt(0))
    set(form, 'untitled22', fc1.m.charAt(1))
    set(form, 'untitled23', '2')
    set(form, 'untitled24', fc1.y2.charAt(1))
    // diagnosis date
    set(form, 'untitled26', fc1.d.charAt(0))
    set(form, 'untitled27', fc1.d.charAt(1))
    set(form, 'untitled28', fc1.m.charAt(0))
    set(form, 'untitled29', fc1.m.charAt(1))
    set(form, 'untitled30', '2')
    set(form, 'untitled31', fc1.y2.charAt(1))
    set(form, 'untitled25', dx1 || dx_texto)
    // treatment date
    set(form, 'untitled33', fc1.d.charAt(0))
    set(form, 'untitled34', fc1.d.charAt(1))
    set(form, 'untitled35', fc1.m.charAt(0))
    set(form, 'untitled36', fc1.m.charAt(1))
    set(form, 'untitled37', '2')
    set(form, 'untitled38', fc1.y2.charAt(1))
    set(form, 'untitled47', exploracion)
    set(form, 'untitled52', estudios)
    set(form, 'untitled56', tx_texto)
    check(form, 'untitled59', !!hospital)
    set(form, 'untitled60', hospital)
    set(form, 'untitled61', ciudad)
    // Doctor
    set(form, 'untitled97', docNombre)
    set(form, 'untitled98', D.especialidad)
    set(form, 'untitled99', D.rfc)
    set(form, 'untitled100', D.celular)
    set(form, 'untitled101', D.cedula_prof)
    set(form, 'untitled104', D.cedula_esp)
    set(form, 'untitled139', `${ciudad}, ${estado}`)
  }

  else if (aseguradora === 'monterrey') {
    set(form, 'nombre 1',    noms)
    set(form, 'apellido 1',  ap1)
    set(form, 'apellido pa1',ap2)
    set(form, 'edad1', edad)
    // Detect conditions in cronicos text
    const c = cronicos.toLowerCase()
    check(form, 'Check Box4',  c.includes('cardiac'))
    check(form, 'Check Box5',  c.includes('hiperten'))
    check(form, 'Check Box6',  c.includes('diabet'))
    check(form, 'Check Box7',  c.includes('vih') || c.includes('sida'))
    check(form, 'Check Box8',  c.includes('cáncer') || c.includes('cancer') || c.includes('tumor') || c.includes('oncol'))
    check(form, 'Check Box9',  c.includes('hepát') || c.includes('hepat') || c.includes('cirrosis'))
    check(form, 'Check Box10', c.includes('convul') || c.includes('epilep'))
    const q = quirurgicos.toLowerCase()
    check(form, 'Check Box11', q.length > 2)
    set(form, 'cardiacos',    c.includes('cardiac')  ? cronicos : '')
    set(form, 'hipertenso',   c.includes('hiperten') ? cronicos : '')
    set(form, 'diabetes',     c.includes('diabet')   ? cronicos : '')
    set(form, 'cancer',       (c.includes('cáncer') || c.includes('cancer')) ? cronicos : '')
    set(form, 'hepáticos',    c.includes('hepat')    ? cronicos : '')
    set(form, 'convulsiones', c.includes('convul')   ? cronicos : '')
    set(form, 'cirugía',      quirurgicos)
    set(form, 'otros',        cronicos)
    // Non-pathological
    check(form, 'Check Box13', tabaquismo.length > 1)
    check(form, 'Check Box14', alcohol_val.length > 1)
    set(form, 'fuma',    tabaquismo)
    set(form, 'alcohol', alcohol_val)
    set(form, 'ginco',   gineco)
    // Dates
    set(form, 'FECHA P1a', fmt(fcons))
    set(form, 'FECHA P1b', fmt(fcons))
    set(form, 'FECHA P1c', fmt(fcons))
    // Diagnoses
    set(form, 'diagnostico 1', dx1)
    set(form, 'diagnos2',      dx2)
    set(form, 'diagnos3',      dx3)
    set(form, 'detalles de evolucionp1', padecimiento)
    set(form, 'detalles de evolucionp2', padecimiento)
    set(form, 'especificar p1', cronicos)
    // Page 2
    set(form, 'exploracion fisica p2', exploracion)
    set(form, 'descripción p2',        tx_texto)
    set(form, 'hospital p2',           hospital)
    set(form, 'ciudad p2',             ciudad)
    set(form, 'FECHA ingreso p2',      fmt(fcons))
    // Doctor page 2
    set(form, 'nombre proveedor p2',   D.nombres)
    set(form, 'apellido pat p2',       D.apellido1)
    set(form, 'apellido materno 2',    D.apellido2)
    set(form, 'nombres p2 sd',         D.especialidad)
    set(form, 'tel contacto2212',      D.celular)
    set(form, 'correo elec2',          D.email_seguros)
    // Signature
    set(form, 'firmisima p1', docNombreInv)
    set(form, 'firma final',  docNombreInv)
  }

  try {
    const filled = await doc.save()
    return new NextResponse(Buffer.from(filled), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${aseguradora}-${nombre}.pdf"`,
      },
    })
  } catch {
    return new NextResponse(Buffer.from(raw), { headers: { 'Content-Type': 'application/pdf' } })
  }
}
