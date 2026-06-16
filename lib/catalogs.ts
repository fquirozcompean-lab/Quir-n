export const CAT_DX = [
  'Síndrome de intestino irritable (SII)',
  'Dispepsia',
  'ERGE / Reflujo / Pirosis',
  'SIBO',
  'Estreñimiento',
  'Patología biliar',
  'Gastritis / H. pylori',
  'Enfermedad hepática',
  'Dolor abdominal',
  'Otro',
] as const

export const CAT_TX = [
  'Arluy Duo',
  'Medibutin (trimebutina)',
  'Abcito',
  'Metamucil',
  'Flonorm / Rifaximina',
  'Floratil',
  'IBP (esomeprazol/dexlanso)',
  'Otro',
] as const

export const CAT_EST = [
  'Laboratorios',
  'Endoscopia',
  'Colonoscopia',
  'TAC',
  'Fibroscan',
  'US abdominal',
] as const

export const CAT_FUENTE = [
  'Internet / Redes',
  'Recomendación',
  'Otro médico',
  'Familiar',
  'Institución',
] as const

export const CAT_TABACO = ['Negativo', 'Activo', 'Ex-fumador'] as const
export const CAT_ALCOHOL = ['Negativo', 'Positivo', 'Ex-consumidor'] as const

// Posología predeterminada por medicamento (auto-rellena el campo de indicaciones)
export const CAT_POSOLOGIA: Record<string, string> = {
  'Arluy Duo':                  'Arluy Duo 1 tab VO c/8h AC × 30 días',
  'Medibutin (trimebutina)':    'Medibutin 300 mg VO c/8h AC × 30 días',
  'Abcito':                     'Abcito 1 tab VO c/8h × 14 días',
  'Metamucil':                  'Metamucil 1 sobre en 200 ml agua VO c/24h × 30 días',
  'Flonorm / Rifaximina':       'Rifaximina 400 mg VO c/8h × 10 días',
  'Floratil':                   'Floratil 1 sobre VO c/12h × 14 días',
  'IBP (esomeprazol/dexlanso)': 'Esomeprazol 40 mg VO c/24h AC × 8 semanas',
}
