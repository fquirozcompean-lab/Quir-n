import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'no file' })

  const buffer = await file.arrayBuffer()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse = (await import('pdf-parse')) as any
  const fn = pdfParse.default ?? pdfParse
  try {
    const data = await fn(Buffer.from(buffer))
    const text = data.text as string
    return NextResponse.json({
      length: text.length,
      first500: text.slice(0, 500),
      first2000: text.slice(0, 2000),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) })
  }
}
