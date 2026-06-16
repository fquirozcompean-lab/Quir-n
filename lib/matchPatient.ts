export interface PatientStub {
  id: string
  nombre: string
}

export interface MatchResult {
  patient: PatientStub | null
  score: number
}

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Score: fraction of patient name tokens found in the text
function scoreText(text: string, patient: PatientStub): number {
  const tokens = normalize(patient.nombre)
    .split(' ')
    .filter(t => t.length > 2)
  if (tokens.length === 0) return 0
  const hits = tokens.filter(t => text.includes(t)).length
  return hits / tokens.length
}

// Score: similarity between two name strings (handles APELLIDO, Nombre vs APELLIDO Nombre)
function scoreName(candidate: string, patient: PatientStub): number {
  const a = normalize(candidate)
  const b = normalize(patient.nombre)
  const tokensA = a.split(' ').filter(t => t.length > 2)
  const tokensB = b.split(' ').filter(t => t.length > 2)
  if (tokensA.length === 0 || tokensB.length === 0) return 0
  const hitsAinB = tokensA.filter(t => tokensB.includes(t)).length
  const hitsBinA = tokensB.filter(t => tokensA.includes(t)).length
  return Math.max(hitsAinB / tokensA.length, hitsBinA / tokensB.length)
}

// Extract candidate patient names from hospital document text using common label patterns
function extractCandidateNames(text: string): string[] {
  const patterns = [
    // "Paciente : MORENO SANCHEZ, MIRIAM"
    /paciente\s*:?\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s,\.]{4,60}?)(?:\s{2,}|\n|fecha|domicilio|edad|sexo|no\.|num|cta)/gi,
    // "Nombre: GARCIA LOPEZ JUAN"
    /nombre\s+(?:del\s+paciente\s*)?:?\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s,\.]{4,60}?)(?:\s{2,}|\n|fecha|domicilio|edad|sexo)/gi,
    // "Sr. / Sra. APELLIDO NOMBRE"
    /sr[a]?\.?\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s,\.]{4,50}?)(?:\s{2,}|\n)/gi,
  ]

  const candidates: string[] = []
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const raw = m[1].trim().replace(/\s+/g, ' ')
      // Filter out obvious non-names (numbers, dates, short strings)
      if (raw.length >= 5 && raw.length <= 60 && !/\d{4}/.test(raw)) {
        candidates.push(raw)
      }
    }
  }
  return [...new Set(candidates)]
}

export function matchPatient(filename: string, patients: PatientStub[]): MatchResult {
  const clean = normalize(filename)
    .replace(/\.(pdf|jpg|jpeg|png)$/i, '')
    .replace(/[_\-]/g, ' ')

  let best: PatientStub | null = null
  let bestScore = 0

  for (const p of patients) {
    const score = scoreText(clean, p)
    if (score > bestScore) { bestScore = score; best = p }
  }

  return { patient: bestScore >= 0.5 ? best : null, score: bestScore }
}

export function matchPatientFromText(text: string, patients: PatientStub[]): MatchResult {
  const normalizedText = normalize(text)

  // Phase 1: try to find the name via "Paciente:", "Nombre:" etc. labels
  const candidates = extractCandidateNames(text)

  if (candidates.length > 0) {
    let best: PatientStub | null = null
    let bestScore = 0

    for (const candidate of candidates) {
      for (const p of patients) {
        const score = scoreName(candidate, p)
        if (score > bestScore) { bestScore = score; best = p }
      }
    }

    // High-confidence label match
    if (best && bestScore >= 0.6) {
      return { patient: best, score: bestScore }
    }
  }

  // Phase 2: fallback — search all patient name tokens across full text
  let best: PatientStub | null = null
  let bestScore = 0

  for (const p of patients) {
    const score = scoreText(normalizedText, p)
    if (score > bestScore) { bestScore = score; best = p }
  }

  return { patient: bestScore >= 0.6 ? best : null, score: bestScore }
}
