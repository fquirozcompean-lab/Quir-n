import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFForm, PDFPage, PDFFont, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { getDoctorProfile } from '@/lib/doctor-profile'
import { calcAge } from '@/lib/utils'

// ── helpers ──────────────────────────────────────────────────────────────────

// NOTA: PDFTextField.setFontSize() lanza una excepción silenciosa ("No /DA entry
// found for field") en campos que no tienen su propio /DA (lo heredan del AcroForm
// global, que en estos formatos suele ser tamaño 0 = auto). Como queda envuelto en
// try/catch, el tamaño nunca se aplicaba y pdf-lib autoescalaba el texto al alto
// completo de la casilla → "letras gigantes". Fix: forzar el /DA del campo
// directamente con setDefaultAppearance, que sí crea la entrada si no existe.
function set(form: PDFForm, name: string, value: string | null | undefined, fontSize = 9) {
  try {
    const f = form.getTextField(name)
    try { f.acroField.setDefaultAppearance(`/Helv ${fontSize} Tf 0 g`) } catch {}
    f.setText(value || '')
  } catch {}
}
function check(form: PDFForm, name: string, yes: boolean) {
  try { yes ? form.getCheckBox(name).check() : form.getCheckBox(name).uncheck() } catch {}
}
function radio(form: PDFForm, name: string, value: string) {
  try { form.getRadioGroup(name).select(value) } catch {}
}

// ── overlay helpers (para PDFs sin AcroForm, ej. AXA y Atlas) ────────────────
// Coordenadas en sistema "Y desde arriba" (como PyMuPDF), se convierten a la
// convención de pdf-lib (Y desde abajo) usando la altura de la página.

function ov(page: PDFPage, pageHeight: number, font: PDFFont, text: string | null | undefined, x: number, yTop: number, size = 8) {
  if (!text) return
  try { page.drawText(String(text), { x, y: pageHeight - yTop, size, font }) } catch {}
}

function ovWrap(
  page: PDFPage, pageHeight: number, font: PDFFont, text: string | null | undefined,
  x: number, yTop: number, maxWidth: number, size = 8, lineGap = 10, maxLines = 5,
) {
  if (!text) return
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (line && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line)
      if (lines.length >= maxLines) { line = ''; break }
      line = w
    } else {
      line = test
    }
  }
  if (line && lines.length < maxLines) lines.push(line)
  lines.forEach((l, i) => {
    try { page.drawText(l, { x, y: pageHeight - yTop - i * lineGap, size, font }) } catch {}
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ovImage(page: PDFPage, pageHeight: number, img: any, x: number, yTop: number, maxW: number, maxH: number) {
  if (!img) return
  try {
    const scale = Math.min(maxW / img.width, maxH / img.height)
    const w = img.width * scale
    const h = img.height * scale
    page.drawImage(img, { x, y: pageHeight - yTop - h, width: w, height: h })
  } catch {}
}

function ovCheck(page: PDFPage, pageHeight: number, font: PDFFont, x0: number, y0: number, x1: number, y1: number, size = 8) {
  const cx = (x0 + x1) / 2 - size * 0.32
  const yBaseline = (y0 + y1) / 2 + size * 0.32
  try { page.drawText('X', { x: cx, y: pageHeight - yBaseline, size, font }) } catch {}
}

// ── firma del doctor ──────────────────────────────────────────────────────
// firma_url (Storage de Supabase) nunca se incrustaba como imagen en los
// formatos de aseguradora — solo se escribía el nombre del médico en el
// campo de texto bajo la línea de firma. Esto la dibuja arriba de ese campo.

// Si firma_url apunta a una imagen corrupta, doc.embedPng/embedJpg puede quedarse
// colgado indefinidamente en vez de lanzar error (visto en pruebas) — se agrega
// un timeout para no tumbar la generación de todo el PDF por una firma dañada.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

async function embedFirma(doc: PDFDocument, url: string | null | undefined) {
  if (!url) return null
  try {
    const res = await withTimeout(fetch(url), 5000)
    if (!res.ok) return null
    const bytes = new Uint8Array(await res.arrayBuffer())
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50
    return await withTimeout(isPng ? doc.embedPng(bytes) : doc.embedJpg(bytes), 5000)
  } catch { return null }
}

function drawFirmaAboveField(
  doc: PDFDocument, form: PDFForm, fieldName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  img: any, maxW = 130, maxH = 28,
) {
  if (!img) return
  try {
    const field = form.getTextField(fieldName)
    const widget = field.acroField.getWidgets()[0]
    const rect = widget.getRectangle()
    let page: PDFPage | null = null
    for (const p of doc.getPages()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const annots = (p as any).node.Annots()
      if (!annots) continue
      for (let j = 0; j < annots.size(); j++) {
        if (doc.context.lookup(annots.get(j)) === widget.dict) { page = p; break }
      }
      if (page) break
    }
    if (!page) return
    const scale = Math.min(maxW / img.width, maxH / img.height)
    const w = img.width * scale
    const h = img.height * scale
    page.drawImage(img, { x: rect.x, y: rect.y + rect.height + 3, width: w, height: h })
  } catch {}
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
  const firmaImg = await embedFirma(doc, D.firma_url)

  // Clear all fields and fix font size
  for (const f of form.getFields()) {
    try {
      if (f.constructor.name === 'PDFTextField') {
        try { ;(f as any).acroField.setDefaultAppearance('/Helv 9 Tf 0 g') } catch {}
        ;(f as any).setText('')
      }
      if (f.constructor.name === 'PDFCheckBox') (f as any).uncheck()
    } catch {}
  }

  // ── per-insurance fill ────────────────────────────────────────────────────

  if (aseguradora === 'gnp') {
    // Plantilla GNP actualizada (jun-2026) — la numeración de campos cambió por
    // completo respecto a la versión anterior: las fechas dejaron de estar
    // divididas en día/mes/año por separado (ahora un solo campo "dd/mm/aa"),
    // y varios checkboxes se recorrieron de posición. Mapeo verificado contra
    // las coordenadas reales de cada widget en el PDF nuevo.
    const fc1 = split(fcons)
    const fechaCorta = `${fc1.d}/${fc1.m}/${fc1.y2}`

    // Trámite
    check(form, 'P1_1', true)   // Reembolso (default)

    // Ficha de identificación — page 1
    set(form, 'P1_8',  ap1)
    set(form, 'P1_9',  ap2)
    set(form, 'P1_10', noms)
    check(form, 'P1_11', sexo === 'F')   // Femenino
    check(form, 'P1_12', sexo === 'M')   // Masculino
    set(form, 'P1_13', edad)
    check(form, 'P1_15', true)           // Causa de atención: Enfermedad (default)

    set(form, 'P1_17', cronicos || 'INTERROGADOS Y NEGADOS')
    set(form, 'P1_18', tabaquismo && alcohol_val ? `TABAQUISMO: ${tabaquismo}. ALCOHOL: ${alcohol_val}` : 'INTERROGADOS Y NEGADOS')
    set(form, 'P1_19', gineco)
    set(form, 'P1_20', 'NO APLICA')
    set(form, 'P1_21', fechaCorta)        // Fecha de inicio (padecimiento)
    set(form, 'P1_22', padecimiento)
    set(form, 'P1_23', fechaCorta)        // Fecha de diagnóstico
    set(form, 'P1_24', dx1 || dx_texto)
    check(form, 'P1_28', true)            // Tipo de padecimiento: Crónico (default)
    check(form, 'P1_30', true)            // ¿Relación con otro padecimiento? No

    // Historia clínica continuación — page 2
    set(form, 'P2_1', fc)    // Pulso
    set(form, 'P2_2', fr)    // Respiración
    set(form, 'P2_3', temp)  // Temperatura
    set(form, 'P2_4', ta)    // Presión arterial
    set(form, 'P2_7', exploracion)
    set(form, 'P2_8', estudios || exploracion)
    check(form, 'P2_11', true)   // Complicaciones: No
    set(form, 'P2_13', fechaCorta)   // Fecha de inicio (tratamiento)
    set(form, 'P2_14', tx_texto)
    set(form, 'P2_17', hospital)
    set(form, 'P2_18', ciudad)
    set(form, 'P2_19', estado)
    check(form, 'P2_21', true)   // Tipo de estancia: Hospitalaria
    set(form, 'P2_23', fechaCorta)   // Fecha de ingreso

    // Datos del médico tratante — page 3
    set(form, 'P3_1', D.apellido1)
    set(form, 'P3_2', D.apellido2)
    set(form, 'P3_3', D.nombres)
    set(form, 'P3_4', D.especialidad)
    set(form, 'P3_5', D.cedula_prof)
    set(form, 'P3_6', D.cedula_esp)
    set(form, 'P3_12', tel_cons || D.celular)
    set(form, 'P3_13', D.celular)
    set(form, 'P3_14', D.email_seguros)
    check(form, 'P3_15', true)   // Tipo de participación: Tratante
    check(form, 'P3_19', true)  // ¿Hubo interconsulta? No
    set(form, 'P3_57', lugarFecha)
    set(form, 'P3_58', docNombreInv)
    drawFirmaAboveField(doc, form, 'P3_58', firmaImg)
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
    // "Nombre completo y firma autógrafa del médico tratante" — nunca se llenaba
    set(form, 'FIRMA', docNombreInv)
    drawFirmaAboveField(doc, form, 'FIRMA', firmaImg)
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
    drawFirmaAboveField(doc, form, '55', firmaImg)
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
    drawFirmaAboveField(doc, form, 'untitled97', firmaImg)
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
    drawFirmaAboveField(doc, form, 'firmisima p1', firmaImg)
    drawFirmaAboveField(doc, form, 'firma final', firmaImg)
  }

  // AXA y Atlas son PDFs planos sin AcroForm (0 campos) — se escribe el texto
  // directamente sobre la página en coordenadas fijas, medidas con PyMuPDF
  // contra el layout real del formato.
  else if (aseguradora === 'axa') {
    const helv = await doc.embedFont(StandardFonts.Helvetica)
    const pages = doc.getPages()
    const fc1 = split(fcons)

    // ── Página 1: información general ──
    const p1 = pages[0]
    const h1 = p1.getHeight()
    ov(p1, h1, helv, ap1,  112, 251.5)
    ov(p1, h1, helv, ap2,  298, 251.5)
    ov(p1, h1, helv, noms, 454, 251.5)
    ov(p1, h1, helv, edad, 62,  277.0)
    if (sexo === 'M') ovCheck(p1, h1, helv, 274.2, 278.5, 283.0, 287.2)
    if (sexo === 'F') ovCheck(p1, h1, helv, 333.8, 278.5, 342.6, 287.2)
    ovCheck(p1, h1, helv, 32.8, 310.8, 41.6, 319.5)   // Causa de atención: Enfermedad
    // Antecedentes patológicos (primer renglón de la tabla)
    ov(p1, h1, helv, '1', 44, 419)
    ovWrap(p1, h1, helv, dx1 || dx_texto, 120, 419, 140, 8, 9, 2)
    ov(p1, h1, helv, fmt(fcons), 300, 419)
    ovWrap(p1, h1, helv, tx_texto, 445, 419, 95, 7, 8, 2)
    // Antecedentes no patológicos (preguntas con línea en blanco)
    ov(p1, h1, helv, tabaquismo || 'NEGADO',   85,  584.8, 7)
    ov(p1, h1, helv, alcohol_val || 'NEGADO',  195, 598.9, 7)
    ovWrap(p1, h1, helv, patient.drogas ? String(patient.drogas).toUpperCase() : 'NEGADO', 272, 613.1, 260, 7, 8, 1)
    ovWrap(p1, h1, helv, alergicos, 82, 627.1, 220, 7, 8, 1)
    // Referido por otro médico
    if (patient.refiere) {
      ovCheck(p1, h1, helv, 209.6, 744.1, 218.4, 752.9)
      ovWrap(p1, h1, helv, String(patient.refiere).toUpperCase(), 426, 756.3, 145, 7, 8, 1)
    } else {
      ovCheck(p1, h1, helv, 241.9, 744.1, 250.7, 752.9)
    }

    // ── Página 2: diagnóstico ──
    const p2 = pages[1]
    const h2 = p2.getHeight()
    ovWrap(p2, h2, helv, padecimiento, 35, 150, 540, 8, 10, 4)
    ov(p2, h2, helv, fc1.d,  172, 230, 8); ov(p2, h2, helv, fc1.m,  200, 230, 8); ov(p2, h2, helv, fc1.y2, 248, 230, 8)
    ov(p2, h2, helv, fc1.d,  445, 230, 8); ov(p2, h2, helv, fc1.m,  475, 230, 8); ov(p2, h2, helv, fc1.y2, 518, 230, 8)
    ovCheck(p2, h2, helv, 292.2, 252.6, 300.9, 261.3)  // Tipo de padecimiento: Crónico
    ovCheck(p2, h2, helv, 254.4, 341.5, 263.1, 350.2)  // ¿Relación con otro padecimiento? No
    ovCheck(p2, h2, helv, 101.8, 385.7, 110.6, 394.5)  // ¿Ocasionó incapacidad? No
    ovWrap(p2, h2, helv, [dx1, dx_texto].filter(Boolean).join(' — '), 35, 428, 540, 8, 10, 4)
    ovCheck(p2, h2, helv, 395.2, 482.8, 404.0, 491.5)  // ¿Es cáncer? No
    ovWrap(p2, h2, helv, exploracion, 35, 538, 540, 8, 10, 4)
    ovWrap(p2, h2, helv, estudios, 35, 618, 540, 8, 10, 4)
    ovWrap(p2, h2, helv, tx_texto, 35, 712, 540, 8, 10, 2)

    // ── Página 5: datos del médico ──
    const p5 = pages[4]
    const h5 = p5.getHeight()
    ov(p5, h5, helv, 'Médico tratante', 131, 452.5, 7)
    ovWrap(p5, h5, helv, docNombre, 75, 467.7, 230, 8, 9, 1)
    ov(p5, h5, helv, D.especialidad, 96, 483.0)
    ov(p5, h5, helv, D.cedula_prof, 123, 498.3)
    ov(p5, h5, helv, D.cedula_esp, 141, 514.8)
    ov(p5, h5, helv, D.rfc, 105, 531.4)
    ovWrap(p5, h5, helv, hospital, 80, 546.6, 190, 8, 9, 1)
    ov(p5, h5, helv, tel_cons || D.celular, 78, 561.9)
    ovWrap(p5, h5, helv, lugarFecha, 455, 730, 110, 7, 8, 2)
    ovImage(p5, h5, firmaImg, 170, 735, 140, 32)
  }

  else if (aseguradora === 'atlas') {
    const helv = await doc.embedFont(StandardFonts.Helvetica)
    const pages = doc.getPages()

    // ── Página 1: ficha de identificación + historia clínica + padecimiento ──
    const p1 = pages[0]
    const h1 = p1.getHeight()
    ovWrap(p1, h1, helv, nombre, 137, 277.9, 290, 8, 9, 1)
    ov(p1, h1, helv, fmt(fnac), 436, 293, 7)
    if (sexo === 'F') ovCheck(p1, h1, helv, 542.5, 280.6, 552.6, 290.6)
    if (sexo === 'M') ovCheck(p1, h1, helv, 564.2, 280.6, 574.3, 290.6)
    ovCheck(p1, h1, helv, 173.7, 309.8, 183.7, 319.8)  // Causa de atención: Enfermedad
    if (patient.refiere) {
      ovCheck(p1, h1, helv, 333.4, 309.8, 343.4, 319.8)
      ovWrap(p1, h1, helv, String(patient.refiere).toUpperCase(), 426, 320.6, 150, 7, 8, 1)
    } else {
      ovCheck(p1, h1, helv, 368.0, 309.8, 378.0, 319.8)
    }
    ovWrap(p1, h1, helv, cronicos, 35, 378, 270, 8, 9, 5)
    ovWrap(p1, h1, helv, tabaquismo && alcohol_val ? `TABAQUISMO: ${tabaquismo}. ALCOHOL: ${alcohol_val}` : 'INTERROGADOS Y NEGADOS', 350, 378, 230, 8, 9, 5)
    ovWrap(p1, h1, helv, padecimiento, 33, 635, 540, 7, 8, 1)
    ov(p1, h1, helv, fmt(fcons), 487, 666, 7)
    ovWrap(p1, h1, helv, [dx1, dx_texto].filter(Boolean).join(' — '), 78, 695, 420, 8, 9, 4)
    ov(p1, h1, helv, fmt(fcons), 487, 705, 6)
    ovCheck(p1, h1, helv, 462.1, 710.8, 474.8, 723.6)  // Tipo de padecimiento: Crónico

    // ── Página 2: tratamiento + exploración + médico tratante ──
    const p2 = pages[1]
    const h2 = p2.getHeight()
    ovCheck(p2, h2, helv, 104.6, 135.1, 114.6, 145.1)  // Tipo de padecimiento: Adquirido
    ovWrap(p2, h2, helv, tx_texto, 175, 152, 300, 7, 8, 1)
    ov(p2, h2, helv, fmt(fcons), 487, 152, 7)
    ovCheck(p2, h2, helv, 88.7, 182.1, 98.7, 192.1)    // ¿Hubo complicaciones? No
    ovWrap(p2, h2, helv, [exploracion, estudios].filter(Boolean).join(' — '), 33, 300, 540, 8, 10, 4)
    ovWrap(p2, h2, helv, hospital, 135, 344.4, 100, 7, 8, 2)
    ovWrap(p2, h2, helv, docNombre, 132, 436.2, 260, 8, 9, 1)
    ov(p2, h2, helv, D.especialidad, 99, 465.6, 7)
    ov(p2, h2, helv, D.cedula_prof, 387, 465.8, 7)
    ov(p2, h2, helv, D.cedula_esp, 395, 482, 7)
    ovWrap(p2, h2, helv, hospital, 85, 557.6, 450, 8, 9, 1)
    ov(p2, h2, helv, tel_cons || D.celular, 95, 578.0)

    // ── Página 3: lugar y fecha / firma del médico tratante ──
    // (línea de firma justo arriba de las leyendas "Lugar y fecha" / "Firma del médico tratante")
    const p3 = pages[2]
    const h3 = p3.getHeight()
    ovWrap(p3, h3, helv, lugarFecha, 123, 618, 260, 7, 8, 1)
    ovImage(p3, h3, firmaImg, 400, 603, 130, 14)
    ovWrap(p3, h3, helv, docNombre, 395, 619, 180, 6, 7, 1)
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
