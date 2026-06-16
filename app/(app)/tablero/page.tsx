import { createClient } from '@/lib/supabase/server'
import { ConsultorioFilter } from './ConsultorioFilter'

// ── Helpers ──────────────────────────────────────────────────────────────────

function norm(v: string) {
  return v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function catTabaquismo(val: string | null): 'Negativo' | 'Ex-fumador' | 'Activo' | 'Sin dato' {
  if (!val?.trim()) return 'Sin dato'
  const v = norm(val)
  if (/^neg|niega|no fuma|\bno\b|nunca|ausente/.test(v)) return 'Negativo'
  if (/ex.?fumador|exfumador|ex.?tabaq|dejo de fumar|suspendio el|dejo el cigarro/.test(v)) return 'Ex-fumador'
  return 'Activo'
}

function catAlcohol(val: string | null): 'Negativo' | 'Positivo' | 'Ex-consumidor' | 'Sin dato' {
  if (!val?.trim()) return 'Sin dato'
  const v = norm(val)
  if (/^neg|niega|\bno\b|nunca|ausente/.test(v)) return 'Negativo'
  if (/ex.?alcohol|exalcohol|ex.?etilismo|suspendio|dejo de tomar|dejo de beber|ex.?bebedor/.test(v)) return 'Ex-consumidor'
  return 'Positivo'
}

function mapDxText(raw: string): string {
  const v = norm(raw.trim())
  if (!v || v.length < 3) return ''
  if (/sii|intestino irritable|colon irritable/.test(v)) return 'Síndrome de intestino irritable (SII)'
  if (/\bdispepsia\b/.test(v)) return 'Dispepsia'
  if (/erge|reflujo|pirosis|gerd|gastroesofag/.test(v)) return 'ERGE / Reflujo / Pirosis'
  if (/\bsibo\b|sobrecrecimiento bacteriano/.test(v)) return 'SIBO'
  if (/estrenimiento|constipac/.test(v)) return 'Estreñimiento'
  if (/biliar|vesicula|\bcole\b|coledoc|calculo biliar|colelit/.test(v)) return 'Patología biliar'
  if (/gastritis|h\.?pylori|helicobacter/.test(v)) return 'Gastritis / H. pylori'
  if (/hepat|\bhigado\b|hepatico|cirrosis|grasa hep|nash|nafld|fibrosis hepat/.test(v)) return 'Enfermedad hepática'
  if (/dolor abdom|colico abdom/.test(v)) return 'Dolor abdominal'
  if (raw.trim().length > 100) return ''
  return raw.trim()
}

function parseEstudiosFromTx(txText: string | null): string[] {
  if (!txText) return []
  const v = norm(txText)
  const found: string[] = []
  if (/laboratorio|biometria|quimica sanguinea|examen general de orina|examen de orina/.test(v)) found.push('Laboratorios')
  if (/endoscop/.test(v)) found.push('Endoscopia')
  if (/colonoscop/.test(v)) found.push('Colonoscopia')
  if (/\btac\b|tomograf/.test(v)) found.push('TAC')
  if (/fibroscan/.test(v)) found.push('Fibroscan')
  if (/ultrasonido|us abdominal|ecografi/.test(v)) found.push('US abdominal')
  return found
}

const COMORBILIDADES = [
  { key: 'Hipertensión (HAS)',   re: /hipertens|has\b/ },
  { key: 'Diabetes (DM)',        re: /diabet|\bdm\b|\bdm2\b|\bdm1\b/ },
  { key: 'Oncológico',           re: /cancer|neoplasia|carcinoma|linfoma|oncolog|tumor maligno/ },
  { key: 'Tiroides',             re: /tiroides|tiroid|hipotiroi|hipertiroi/ },
  { key: 'Dislipidemia',         re: /dislipid|hiperlipid|hipercolesterol|hipertriglicerid/ },
  { key: 'Cardiopatía',          re: /cardiopat|insuficiencia cardiaca|fibrilacion auricular|arritmia/ },
  { key: 'Obesidad',             re: /\bobesidad\b|\bobes\b/ },
  { key: 'Artritis / Reuma',     re: /artritis reumat|lupus|fibromialgia/ },
]

function catRefiere(val: string | null): string {
  if (!val?.trim()) return 'Sin dato'
  const v = norm(val.trim())
  if (['-', 'n/a', 'na', 'ninguno', 'nadie'].includes(v)) return 'Sin dato'
  if (/internet|redes|facebook|instagram|google|youtube|tiktok|twitter|whatsapp/.test(v)) return 'Internet / Redes'
  if (/\bmedico\b|doctor|\bdr\.?\b|\bdra\.?\b|especialista|cardiol|gastr|nutriol|internista|cirujano|ginecol|urologo|dermatol|otorrino|psiquia|neurolog|oftalmo|ortopedist|traumatol|hemato|reumato|nefrol|endocrin|oncolog|hepatol|proctol|pulmonol/.test(v)) return 'Médico'
  if (/familiar|esposo|esposa|\bhijo\b|\bhija\b|\bhijos\b|\bmadre\b|\bpapa\b|\bpadre\b|\bhermano|\bhermana/.test(v)) return 'Familiar'
  if (/amigo|conocido|companero|vecino|recomend/.test(v)) return 'Recomendación'
  if (/hospital|clinica|\bimss\b|\bissste\b|seguro social|institucion/.test(v)) return 'Institución'
  return 'Otro'
}

// ── UI components ─────────────────────────────────────────────────────────────

function KPI({ value, label, sub, accent }: { value: string | number; label: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-card rounded-xl border-t-4 ${accent ? 'border-accent' : 'border-teal'} border border-border p-4 shadow-sm`}>
      <div className="text-2xl font-extrabold text-navy">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
      {sub && <div className={`text-xs font-semibold mt-1 ${accent ? 'text-accent' : 'text-teal'}`}>{sub}</div>}
    </div>
  )
}

function BarChart({ rows, color = 'bg-teal', total }: {
  rows: [string, number][]
  color?: string
  total?: number
}) {
  const max = Math.max(...rows.map(r => r[1]), 1)
  return (
    <div className="space-y-2">
      {rows.map(([label, count]) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-navy font-medium truncate pr-2">{label}</span>
            <span className="text-muted font-semibold flex-shrink-0">
              {count}{total ? ` (${Math.round(count / total * 100)}%)` : ''}
            </span>
          </div>
          <div className="h-2 bg-teal-light rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function RiskBreakdown({ rows, total }: { rows: [string, number][]; total: number }) {
  const COLORS: Record<string, string> = {
    'Negativo': 'bg-green', 'Sin dato': 'bg-border',
    'Ex-fumador': 'bg-teal', 'Ex-consumidor': 'bg-teal',
    'Activo': 'bg-accent', 'Positivo': 'bg-accent',
  }
  return (
    <div className="space-y-2">
      {rows.map(([label, count]) => {
        const pct = total > 0 ? Math.round(count / total * 100) : 0
        return (
          <div key={label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-navy font-medium">{label}</span>
              <span className="text-muted font-semibold">{count} ({pct}%)</span>
            </div>
            <div className="h-2 bg-teal-light rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${COLORS[label] ?? 'bg-teal'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default async function TablerPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>
}) {
  const { c: consultorio = '' } = await searchParams
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase.from('patients').select(
    'sexo, dx, dx_texto, tx, tx_texto, estudios_solicitados, refiere, fuente, fecha_nacimiento, fecha_consulta, created_at, consultorio, tabaquismo, alcohol, cronicos'
  )
  if (consultorio) q = q.eq('consultorio', consultorio)
  const { data: patients } = await q

  const total = patients?.length ?? 0

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalM = patients?.filter((p: any) => p.sexo === 'M').length ?? 0
  const totalF = patients?.filter((p: any) => p.sexo === 'F').length ?? 0

  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonth = patients?.filter((p: any) => {
    const d = p.fecha_consulta
    return d?.slice(0, 7) === thisMonthKey
  }).length ?? 0

  // ── Crecimiento: por año (histórico) + meses del año actual ─────────────
  const yearCount: Record<number, number> = {}
  const currentYearMonths: { key: string; label: string; count: number }[] = []
  for (let m = 0; m < 12; m++) {
    currentYearMonths.push({
      key: `${now.getFullYear()}-${String(m + 1).padStart(2, '0')}`,
      label: MESES[m],
      count: 0,
    })
  }

  patients?.forEach((p: any) => {
    const dateStr = p.fecha_consulta
    if (!dateStr) return
    const year = parseInt(dateStr.slice(0, 4))
    if (isNaN(year) || year < 2000 || year > 2100) return
    yearCount[year] = (yearCount[year] ?? 0) + 1
    // Also track months of the current year
    const key = dateStr.slice(0, 7)
    const cm = currentYearMonths.find(x => x.key === key)
    if (cm) cm.count++
  })

  const years = Object.entries(yearCount)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([y, c]) => [y, c] as [string, number])

  const maxYear = Math.max(...years.map(r => r[1] as number), 1)
  const maxCurMonth = Math.max(...currentYearMonths.map(m => m.count), 1)
  const hasDates = years.length > 0

  // ── Diagnósticos (chips + texto libre migrado) ────────────────────────────
  const dxCount: Record<string, number> = {}
  patients?.forEach((p: any) => {
    ;(p.dx ?? []).forEach((d: string) => { dxCount[d] = (dxCount[d] ?? 0) + 1 })
    if (p.dx_texto) {
      p.dx_texto.split(/[\n,]/).forEach((line: string) => {
        const mapped = mapDxText(line)
        if (mapped) dxCount[mapped] = (dxCount[mapped] ?? 0) + 1
      })
    }
  })
  const topDx = Object.entries(dxCount).sort((a, b) => b[1] - a[1]).slice(0, 10)

  // ── Tratamientos (chips + texto libre migrado) ────────────────────────────
  const txCount: Record<string, number> = {}
  patients?.forEach((p: any) => {
    ;(p.tx ?? []).forEach((t: string) => { txCount[t] = (txCount[t] ?? 0) + 1 })
    if (p.tx_texto) {
      p.tx_texto.split('\n').forEach((line: string) => {
        const l = line.trim()
        if (l.length >= 4 && l.length <= 80) txCount[l] = (txCount[l] ?? 0) + 1
      })
    }
  })
  const topTx = Object.entries(txCount).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // ── Estudios solicitados (array + extraídos del texto) ────────────────────
  const estCount: Record<string, number> = {}
  patients?.forEach((p: any) => {
    ;(p.estudios_solicitados ?? []).forEach((e: string) => { estCount[e] = (estCount[e] ?? 0) + 1 })
    parseEstudiosFromTx(p.tx_texto).forEach(e => { estCount[e] = (estCount[e] ?? 0) + 1 })
  })
  const topEstudios = Object.entries(estCount).sort((a, b) => b[1] - a[1])

  // ── Edades ────────────────────────────────────────────────────────────────
  const ages: number[] = []
  patients?.forEach((p: any) => {
    if (!p.fecha_nacimiento) return
    const age = now.getFullYear() - new Date(p.fecha_nacimiento).getFullYear()
    if (age > 0 && age < 120) ages.push(age)
  })

  const ageBuckets: [string, number][] = [
    ['< 18', 0], ['18–29', 0], ['30–39', 0], ['40–49', 0],
    ['50–59', 0], ['60–69', 0], ['70+', 0],
  ]
  ages.forEach(age => {
    if (age < 18)      ageBuckets[0][1]++
    else if (age < 30) ageBuckets[1][1]++
    else if (age < 40) ageBuckets[2][1]++
    else if (age < 50) ageBuckets[3][1]++
    else if (age < 60) ageBuckets[4][1]++
    else if (age < 70) ageBuckets[5][1]++
    else               ageBuckets[6][1]++
  })

  const meanAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0
  const sorted = [...ages].sort((a, b) => a - b)
  const medianAge = ages.length > 0
    ? (ages.length % 2 === 0
      ? Math.round((sorted[ages.length / 2 - 1] + sorted[ages.length / 2]) / 2)
      : sorted[Math.floor(ages.length / 2)])
    : 0

  // ── Tabaquismo ────────────────────────────────────────────────────────────
  const tabaquismoStats: [string, number][] = [
    ['Negativo', 0], ['Ex-fumador', 0], ['Activo', 0], ['Sin dato', 0],
  ]
  patients?.forEach((p: any) => {
    const cat = catTabaquismo(p.tabaquismo)
    const entry = tabaquismoStats.find(e => e[0] === cat)
    if (entry) entry[1]++
  })

  // ── Etilismo ──────────────────────────────────────────────────────────────
  const alcoholStats: [string, number][] = [
    ['Negativo', 0], ['Ex-consumidor', 0], ['Positivo', 0], ['Sin dato', 0],
  ]
  patients?.forEach((p: any) => {
    const cat = catAlcohol(p.alcohol)
    const entry = alcoholStats.find(e => e[0] === cat)
    if (entry) entry[1]++
  })

  // ── Comorbilidades ────────────────────────────────────────────────────────
  const comorbCount: Record<string, number> = {}
  COMORBILIDADES.forEach(c => { comorbCount[c.key] = 0 })
  patients?.forEach((p: any) => {
    if (!p.cronicos) return
    const v = norm(p.cronicos)
    COMORBILIDADES.forEach(c => { if (c.re.test(v)) comorbCount[c.key]++ })
  })
  const topComorbilidades = Object.entries(comorbCount)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])

  // ── Quién refiere (categorizado) ──────────────────────────────────────────
  const refCatCount: Record<string, number> = {}
  patients?.forEach((p: any) => {
    const cat = catRefiere(p.fuente || p.refiere)
    refCatCount[cat] = (refCatCount[cat] ?? 0) + 1
  })
  const topRef = Object.entries(refCatCount)
    .filter(([k]) => k !== 'Sin dato')
    .sort((a, b) => b[1] - a[1]) as [string, number][]

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 pb-10">

      {/* Header + filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-extrabold text-navy">Tablero estadístico</h2>
        <ConsultorioFilter current={consultorio} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI value={total} label="Pacientes totales" />
        <KPI value={thisMonth} label="Este mes" accent />
        <KPI
          value={totalF}
          label="Mujeres"
          sub={total > 0 ? `${Math.round(totalF / total * 100)}%` : undefined}
        />
        <KPI
          value={totalM}
          label="Hombres"
          sub={total > 0 ? `${Math.round(totalM / total * 100)}%` : undefined}
        />
      </div>

      {/* Crecimiento histórico por año */}
      {hasDates && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-4">Consultas por año</h3>
          <div className="space-y-1.5">
            {years.map(([year, count]) => (
              <div key={year} className="flex items-center gap-2">
                <span className="text-xs text-muted w-10 flex-shrink-0">{year}</span>
                <div className="flex-1 h-5 bg-teal-light rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${Number(year) === now.getFullYear() ? 'bg-accent' : 'bg-teal'}`}
                    style={{ width: `${((count as number) / maxYear) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-navy w-8 text-right flex-shrink-0">{count as number}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Año actual en naranja</p>
        </div>
      )}

      {/* Meses del año actual */}
      {hasDates && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-4">Meses — {now.getFullYear()}</h3>
          <div className="space-y-1.5">
            {currentYearMonths.map(m => (
              <div key={m.key} className="flex items-center gap-2">
                <span className="text-xs text-muted w-8 flex-shrink-0">{m.label}</span>
                <div className="flex-1 h-5 bg-teal-light rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${m.key === thisMonthKey ? 'bg-accent' : 'bg-teal'}`}
                    style={{ width: `${(m.count / maxCurMonth) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-navy w-6 text-right flex-shrink-0">{m.count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Mes actual en naranja</p>
        </div>
      )}

      {!hasDates && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-2">Consultas por año</h3>
          <p className="text-xs text-muted">Sin fechas registradas aún. Las nuevas consultas aparecerán aquí.</p>
        </div>
      )}

      {/* Diagnósticos + Tratamientos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topDx.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-teal text-sm font-semibold mb-3">Diagnósticos principales</h3>
            <BarChart rows={topDx} color="bg-teal" total={total} />
          </div>
        )}
        {topTx.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-teal text-sm font-semibold mb-3">Tratamientos más empleados</h3>
            <BarChart rows={topTx} color="bg-green" total={total} />
          </div>
        )}
      </div>

      {/* Estudios solicitados */}
      {topEstudios.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-3">Estudios y solicitudes</h3>
          <BarChart rows={topEstudios as [string, number][]} color="bg-accent" total={total} />
        </div>
      )}

      {/* Distribución de edades */}
      {ages.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="text-teal text-sm font-semibold">Distribución de edades</h3>
            <div className="flex gap-4 text-xs text-muted">
              <span>Media: <strong className="text-navy">{meanAge} años</strong></span>
              <span>Mediana: <strong className="text-navy">{medianAge} años</strong></span>
            </div>
          </div>
          <BarChart rows={ageBuckets} color="bg-accent" total={ages.length} />
        </div>
      )}

      {/* Factores de riesgo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-3">Tabaquismo</h3>
          <RiskBreakdown rows={tabaquismoStats} total={total} />
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-3">Etilismo</h3>
          <RiskBreakdown rows={alcoholStats} total={total} />
        </div>
      </div>

      {/* Comorbilidades */}
      {topComorbilidades.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-3">Comorbilidades</h3>
          <BarChart rows={topComorbilidades as [string, number][]} color="bg-teal" total={total} />
        </div>
      )}

      {/* Cómo llegó el paciente */}
      {topRef.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-teal text-sm font-semibold mb-3">¿Cómo llegó el paciente?</h3>
          <BarChart rows={topRef} color="bg-teal" total={total} />
        </div>
      )}

      {total === 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted">
          Sin datos para mostrar.
        </div>
      )}
    </div>
  )
}
