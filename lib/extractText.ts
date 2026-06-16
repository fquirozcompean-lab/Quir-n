// Server-only: extract readable text from a PDF (first 2 pages)
export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse = (await import('pdf-parse')) as any
  const fn = pdfParse.default ?? pdfParse
  try {
    const data = await fn(Buffer.from(buffer), { max: 2 })
    // Keep first 4000 chars — enough to cover the header on any hospital document
    return (data.text as string).slice(0, 4000)
  } catch {
    return ''
  }
}
