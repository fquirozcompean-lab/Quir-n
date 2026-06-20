'use client'

import { useActionState, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChipSelector } from './ChipSelector'
import { calcAge } from '@/lib/utils'
import { findSimilarPatients } from '@/app/(app)/pacientes/actions'
import type { Patient, Consultorio } from '@/lib/types'

type ActionState = { error: string } | undefined
type PatientAction = (prev: ActionState, formData: FormData) => Promise<ActionState>

interface PatientFormProps {
  initialData?: Patient
  action: PatientAction
  cancelHref?: string
  catDx: string[]
  catTx: string[]
  catEst: string[]
  catPosologia: Record<string, string>
  consultorios: Record<string, Consultorio>
}

const cls = 'w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      {children}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
      <h3 className="text-teal text-sm font-semibold uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

const EXP_F = 'A la exploración física se encuentra paciente alerta, orientada, cooperadora, adecuado estado de hidratación y coloración de tegumentos, cardiopulmonar sin alteraciones, abdomen globoso a expensas de panículo adiposo, blando, depresible, no doloroso a la palpación, sin datos de irritación peritoneal, extremidades integras sin alteraciones.'
const EXP_M = 'A la exploración física se encuentra paciente alerta, orientado, cooperador, adecuado estado de hidratación y coloración de tegumentos, cardiopulmonar sin alteraciones, abdomen globoso a expensas de panículo adiposo, blando, depresible, no doloroso a la palpación, sin datos de irritación peritoneal, extremidades integras sin alteraciones.'

function defaultExp(sexo: string) {
  if (sexo === 'F') return EXP_F
  if (sexo === 'M') return EXP_M
  return ''
}

export default function PatientForm({ initialData, action, cancelHref = '/pacientes', catDx, catTx, catEst, catPosologia, consultorios }: PatientFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const [sexo, setSexo] = useState(initialData?.sexo ?? '')
  const [fnac, setFnac] = useState(initialData?.fecha_nacimiento ?? '')
  const [dx, setDx] = useState<string[]>(initialData?.dx ?? [])
  const [tx, setTx] = useState<string[]>(initialData?.tx ?? [])
  const [estudios, setEstudios] = useState<string[]>(initialData?.estudios_solicitados ?? [])
  const [exploracion, setExploracion] = useState(initialData?.exploracion ?? '')
  const [txTexto, setTxTexto] = useState(initialData?.tx_texto ?? '')
  const [txTextoManual, setTxTextoManual] = useState(!!initialData?.tx_texto)

  const isEdit = !!initialData
  const today = new Date().toISOString().slice(0, 10)
  const now = new Date()
  const nowHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const [nombre, setNombre] = useState(initialData?.nombre ?? '')
  const [duplicates, setDuplicates] = useState<{ id: string; nombre: string; archived: boolean }[]>([])

  useEffect(() => {
    if (isEdit) return
    const t = setTimeout(async () => {
      const matches = await findSimilarPatients(nombre)
      setDuplicates(matches)
    }, 400)
    return () => clearTimeout(t)
  }, [nombre, isEdit])

  function handleSexoChange(val: string) {
    setSexo(val)
    if (!exploracion || exploracion === EXP_F || exploracion === EXP_M) {
      setExploracion(defaultExp(val))
    }
  }

  function handleTxChange(newTx: string[]) {
    setTx(newTx)
    if (txTextoManual) return
    const lines = newTx
      .map(t => catPosologia[t])
      .filter(Boolean)
      .join('\n')
    setTxTexto(lines)
  }

  return (
    <form action={formAction} className="space-y-3 pb-10">
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="dx" value={JSON.stringify(dx)} />
      <input type="hidden" name="tx" value={JSON.stringify(tx)} />
      <input type="hidden" name="estudios_solicitados" value={JSON.stringify(estudios)} />

      {/* ── Datos generales ── */}
      <SectionCard title="Datos generales">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Field label="Nombre *">
              <input
                name="nombre"
                className={cls}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Apellido Apellido Nombre"
                required
              />
            </Field>
            {!isEdit && duplicates.length > 0 && (
              <div className="mt-2 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2 space-y-1.5">
                <p className="text-xs font-semibold text-yellow-800">
                  ⚠ Ya existe{duplicates.length > 1 ? 'n' : ''} {duplicates.length > 1 ? 'pacientes con nombres' : 'un paciente con nombre'} similar — revisa si no es el mismo:
                </p>
                {duplicates.map(d => (
                  <Link
                    key={d.id}
                    href={`/pacientes/${d.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-teal font-semibold hover:underline"
                  >
                    {d.nombre}{d.archived ? ' (archivado)' : ''} →
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <Field label="Consultorio">
              <select name="consultorio" className={cls} defaultValue={initialData?.consultorio ?? ''}>
                <option value="">— Sin especificar —</option>
                {Object.keys(consultorios).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Sexo">
            <select name="sexo" className={cls} value={sexo} onChange={e => handleSexoChange(e.target.value)}>
              <option value="">—</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </select>
          </Field>
          <Field label="Fecha de nacimiento">
            <input name="fecha_nacimiento" type="date" className={cls} value={fnac} onChange={e => setFnac(e.target.value)} />
          </Field>
          <Field label="Edad">
            <div className="py-2 px-1 text-sm font-bold text-navy">{calcAge(fnac)}</div>
          </Field>
          <Field label="Lugar de nacimiento">
            <input name="lugar_nacimiento" className={cls} defaultValue={initialData?.lugar_nacimiento ?? ''} />
          </Field>
          <Field label="Lugar de residencia">
            <input name="ciudad" className={cls} defaultValue={initialData?.ciudad ?? ''} />
          </Field>
          <Field label="Escolaridad">
            <input name="escolaridad" className={cls} defaultValue={initialData?.escolaridad ?? ''} />
          </Field>
          <Field label="Ocupación">
            <input name="ocupacion" className={cls} defaultValue={initialData?.ocupacion ?? ''} />
          </Field>
          <Field label="Estado civil">
            <input name="estado_civil" className={cls} defaultValue={initialData?.estado_civil ?? ''} />
          </Field>
          <Field label="Religión">
            <input name="religion" className={cls} defaultValue={initialData?.religion ?? ''} />
          </Field>
          <Field label="Hemotipo">
            <input name="hemotipo" className={cls} defaultValue={initialData?.hemotipo ?? ''} />
          </Field>
          <Field label="Teléfono">
            <input name="telefono" className={cls} defaultValue={initialData?.telefono ?? ''} />
          </Field>
          <Field label="Fecha de consulta">
            <input name="fecha_consulta" type="date" className={cls} defaultValue={initialData?.fecha_consulta ?? today} />
          </Field>
          <Field label="Hora de inicio">
            <input name="hora_consulta" type="time" className={cls} defaultValue={initialData?.hora_consulta ?? nowHM} />
          </Field>
          <Field label="Quién refiere">
            <input name="refiere" className={cls} defaultValue={initialData?.refiere ?? ''} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Antecedentes heredofamiliares ── */}
      <SectionCard title="Antecedentes heredofamiliares">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Abuelo materno">
            <input name="ahf_abuelo_materno" className={cls} defaultValue={initialData?.ahf_abuelo_materno ?? ''} />
          </Field>
          <Field label="Abuela materna">
            <input name="ahf_abuela_materna" className={cls} defaultValue={initialData?.ahf_abuela_materna ?? ''} />
          </Field>
          <Field label="Abuelo paterno">
            <input name="ahf_abuelo_paterno" className={cls} defaultValue={initialData?.ahf_abuelo_paterno ?? ''} />
          </Field>
          <Field label="Abuela paterna">
            <input name="ahf_abuela_paterna" className={cls} defaultValue={initialData?.ahf_abuela_paterna ?? ''} />
          </Field>
          <Field label="Padre">
            <input name="ahf_padre" className={cls} defaultValue={initialData?.ahf_padre ?? ''} />
          </Field>
          <Field label="Madre">
            <input name="ahf_madre" className={cls} defaultValue={initialData?.ahf_madre ?? ''} />
          </Field>
          <Field label="Hermanos">
            <input name="ahf_hermanos" className={cls} defaultValue={initialData?.ahf_hermanos ?? ''} />
          </Field>
          <Field label="Hijos">
            <input name="ahf_hijos" className={cls} defaultValue={initialData?.ahf_hijos ?? ''} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Otros">
              <input name="ahf_otros" className={cls} defaultValue={initialData?.ahf_otros ?? ''} />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── Antecedentes personales no patológicos ── */}
      <SectionCard title="Antecedentes personales no patológicos">
        <Field label="">
          <textarea
            name="otros_np"
            className={cls}
            rows={2}
            defaultValue={initialData?.otros_np ?? 'NO APLICA'}
          />
        </Field>
      </SectionCard>

      {/* ── Antecedentes personales patológicos ── */}
      <SectionCard title="Antecedentes personales patológicos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Field label="Crónicos">
              <textarea name="cronicos" className={cls} rows={3} defaultValue={initialData?.cronicos ?? ''} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Quirúrgicos">
              <textarea name="quirurgicos" className={cls} rows={3} defaultValue={initialData?.quirurgicos ?? ''} />
            </Field>
          </div>
          <Field label="Alérgicos">
            <input name="alergicos" className={cls} defaultValue={initialData?.alergicos ?? ''} />
          </Field>
          <Field label="Medicamentos de uso crónico">
            <input name="medicamentos" className={cls} defaultValue={initialData?.medicamentos ?? ''} />
          </Field>
          <Field label="Transfusiones">
            <input name="transfusiones" className={cls} defaultValue={initialData?.transfusiones ?? ''} />
          </Field>
          <Field label="Tabaquismo">
            <input name="tabaquismo" className={cls} defaultValue={initialData?.tabaquismo ?? ''} placeholder="Negativo / ex-fumador / 10 cig/día…" />
          </Field>
          <Field label="Etilismo">
            <input name="alcohol" className={cls} defaultValue={initialData?.alcohol ?? ''} placeholder="Negativo / ocasional / frecuente…" />
          </Field>
          <Field label="Drogas">
            <input name="drogas" className={cls} defaultValue={initialData?.drogas ?? ''} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Ginecológicos (condicional) ── */}
      {sexo === 'F' && (
        <SectionCard title="Antecedentes ginecológicos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Embarazos">
              <input name="gesta" className={cls} defaultValue={initialData?.gesta ?? ''} placeholder="G P A C" />
            </Field>
            <Field label="Menarca">
              <input name="menarca" className={cls} defaultValue={initialData?.menarca ?? ''} />
            </Field>
            <Field label="Ritmo">
              <input name="ritmo" className={cls} defaultValue={initialData?.ritmo ?? ''} />
            </Field>
            <Field label="Fecha de última regla">
              <input name="fur" className={cls} defaultValue={initialData?.fur ?? ''} placeholder="dd/mm/aaaa" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Anticonceptivos">
                <input name="anticonceptivos" className={cls} defaultValue={initialData?.anticonceptivos ?? ''} />
              </Field>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Padecimiento actual ── */}
      <SectionCard title="Padecimiento actual">
        <Field label="">
          <textarea name="padecimiento" className={cls} rows={4} defaultValue={initialData?.padecimiento ?? ''} />
        </Field>
        <div className="mt-3">
          <Field label="Exploración física">
            <textarea
              name="exploracion"
              className={cls}
              rows={4}
              value={exploracion}
              onChange={e => setExploracion(e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Signos vitales ── */}
      <SectionCard title="Signos vitales">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {([
            { name: 'sv_ta',   label: 'T/A',   unit: 'mmHg', def: '120/80' },
            { name: 'sv_fc',   label: 'FC',    unit: 'lpm',  def: '72'     },
            { name: 'sv_fr',   label: 'FR',    unit: 'rpm',  def: '16'     },
            { name: 'sv_temp', label: 'Temp.', unit: '°C',   def: '36.5'   },
            { name: 'sv_spo2', label: 'SpO₂',  unit: '%',    def: '98'     },
          ] as const).map(f => (
            <div key={f.name} className="flex flex-col items-center">
              <label className="text-xs font-semibold text-muted mb-1">{f.label}</label>
              <input
                name={f.name}
                className="w-full text-sm px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white text-center"
                defaultValue={(initialData?.signos_vitales as Record<string,string> | undefined)?.[f.name.replace('sv_', '')] ?? f.def}
              />
              <span className="text-xs text-muted mt-0.5">{f.unit}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Análisis ── */}
      <SectionCard title="Análisis">
        <Field label="">
          <textarea name="analisis" className={cls} rows={3} defaultValue={initialData?.analisis ?? ''} placeholder="Integración diagnóstica, razonamiento clínico…" />
        </Field>
      </SectionCard>

      {/* ── Diagnóstico ── */}
      <SectionCard title="Diagnóstico">
        <ChipSelector catalog={catDx} selected={dx} onChange={setDx} />
        <div className="mt-2">
          <Field label="Notas">
            <textarea name="dx_texto" className={cls} rows={2} defaultValue={initialData?.dx_texto ?? ''} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Tratamiento y solicitudes ── */}
      <SectionCard title="Tratamiento y solicitudes">
        <ChipSelector catalog={catTx} selected={tx} onChange={handleTxChange} />
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted">Indicaciones / Posología</label>
            {txTextoManual && (
              <button
                type="button"
                onClick={() => { setTxTextoManual(false); handleTxChange(tx) }}
                className="text-xs text-teal hover:underline"
              >
                ↺ Regenerar posología
              </button>
            )}
          </div>
          <textarea
            name="tx_texto"
            className={cls}
            rows={3}
            value={txTexto}
            onChange={e => { setTxTexto(e.target.value); setTxTextoManual(true) }}
          />
        </div>
        <div className="mt-3">
          <Field label="Pronóstico">
            <select name="pronostico" className={cls} defaultValue={initialData?.pronostico ?? ''}>
              <option value="">— Sin especificar —</option>
              <option value="Favorable">Favorable</option>
              <option value="Reservado">Reservado</option>
              <option value="Malo">Malo</option>
              <option value="En seguimiento">En seguimiento</option>
            </select>
          </Field>
        </div>
        <p className="text-xs text-muted font-semibold mt-4 mb-1">Estudios solicitados</p>
        <ChipSelector catalog={catEst} selected={estudios} onChange={setEstudios} />
      </SectionCard>

      {/* ── Acciones ── */}
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={pending}
          className="bg-green text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {pending ? 'Guardando…' : isEdit ? 'Actualizar expediente' : 'Guardar expediente'}
        </button>
        <Link
          href={cancelHref}
          className="bg-teal-light text-navy font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-border transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
