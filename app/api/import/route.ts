import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const SYSTEM = `Eres un asistente que extrae información de expedientes clínicos en español.
Devuelve SOLO un array JSON con los pacientes encontrados. Cada objeto puede tener estos campos (omite los que no estén en el documento):
nombre (requerido), fecha_nacimiento (YYYY-MM-DD), sexo ("M" o "F"), telefono, ciudad, lugar_nacimiento,
ocupacion, estado_civil, religion, hemotipo, cronicos, quirurgicos, alergicos, medicamentos,
tabaquismo, alcohol, drogas, padecimiento, exploracion, dx_texto, tx_texto.
Responde SOLO con el array JSON, sin explicaciones ni markdown.`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

  let text = ''
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  try {
    if (name.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = (await import('pdf-parse')) as any
      const fn = pdfParse.default ?? pdfParse
      const data = await fn(buffer)
      text = data.text as string
    } else if (name.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (name.endsWith('.doc')) {
      // Intenta mammoth primero (Google Docs a veces exporta .doc como OOXML)
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } catch {
        // Fallback: extraer cadenas legibles del binario .doc
        const raw = buffer.toString('latin1')
        const chunks = raw.match(/[\x20-\x7E\xC0-\xFF\n\r\t]{5,}/g) ?? []
        text = chunks.join('\n')
      }
    } else {
      return NextResponse.json({ error: 'Formato no soportado. Use PDF, Word (.docx) o Word antiguo (.doc)' }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ error: `Error al leer el archivo: ${String(e)}` }, { status: 500 })
  }

  if (!text.trim()) {
    return NextResponse.json({
      error: 'No se encontró texto. Si es un PDF escaneado, asegúrese de que tenga OCR.',
    }, { status: 400 })
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM,
      messages: [{ role: 'user', content: text.slice(0, 12000) }],
    })

    const block = msg.content[0]
    if (block.type !== 'text') return NextResponse.json({ patients: [] })

    const match = block.text.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ patients: [] })

    const patients = JSON.parse(match[0])
    return NextResponse.json({ patients: Array.isArray(patients) ? patients : [] })
  } catch (e) {
    return NextResponse.json({ error: `Error de IA: ${String(e)}` }, { status: 500 })
  }
}
