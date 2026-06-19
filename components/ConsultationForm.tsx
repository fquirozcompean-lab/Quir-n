'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ChipSelector } from './ChipSelector'
import type { Consultorio } from '@/lib/types'

type ActionState = { error: string } | undefined
type ConsultAction = (prev: ActionState, formData: FormData) => Promise<ActionState>

interface InitialData {
  fecha?: string; hora?: string; consultorio?: string; motivo?: string
  padecimiento?: string; exploracion?: string; analisis?: string
  dx?: string[]; dx_texto?: string
  tx?: string[]; tx_texto?: string
  estudios_solicitados?: string[]; pronostico?: string
  signos_vitales?: { ta?: string; fc?: string; fr?: string; temp?: string; spo2?: string }
}

interface Props {
  patientId: string
  patientName: string
  defaultConsultorio?: string
  action: ConsultAction
  initialData?: InitialData
  isEdit?: boolean
  catDx: string[]
  catTx: string[]
  catEst: string[]
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

function VitalField({ name, label, defaultValue: dv, unit }: { name: string; label: string; defaultValue: string; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <label className="text-xs font-semibold text-muted mb-1">{label}</label>
      <input
        name={name}
        className="w-full text-sm px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-white text-center"
        defaultValue={dv}
      />
      <span className="text-xs text-muted mt-0.5">{unit}</span>
    </div>
  )
}

const EXP_F = 'A la exploración física se encuentra paciente alerta, orientada, cooperadora, adecuado estado de hidratación y coloración de tegumentos, cardiopulmonar sin alteraciones, abdomen globoso a expensas de panículo adiposo, blando, depresible, no doloroso a la palpación, sin datos de irritación peritoneal, extremidades integras sin alteraciones.'
const EXP_M = 'A la exploración física se encuentra paciente alerta, orientado, cooperador, adecuado estado de hidratación y coloración de tegumentos, cardiopulmonar sin alteraciones, abdomen globoso a expensas de panículo adiposo, blando, depresible, no doloroso a la palpación, sin datos de irritación peritoneal, extremidades integras sin alteraciones.'

export default function ConsultationForm({ patientId, patientName, defaultConsultorio, action, initialData, isEdit, catDx, catTx, catEst, consultorios }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const [dx, setDx]             = useState<string[]>(initialData?.dx ?? [])
  const [tx, setTx]             = useState<string[]>(initialData?.tx ?? [])
  const [estudios, setEstudios] = useState<string[]>(initialData?.estudios_solicitados ?? [])
  const [exploracion, setExploracion] = useState(initialData?.exploracion ?? EXP_M)
  const [customDx, setCustomDx] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const now = new Date()
  const nowHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const catalogDx = dx.filter(d => catDx.includes(d))
  const extraDx   = dx.filter(d => !catDx.includes(d))

  function addCustomDx() {
    const val = customDx.trim()
    if (!val || dx.includes(val)) return
    setDx([...dx, val])
    setCustomDx('')
  }

  return (
    <form action={formAction} className="space-y-3 pb-10">
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="dx" value={JSON.stringify(dx)} />
      <input type="hidden" name="tx" value={JSON.stringify(tx)} />
      <input type="hidden" name="estudios_solicitados" value={JSON.stringify(estudios)} />

      <SectionCard title="Datos de la consulta">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Fecha *">
            <input name="fecha" type="date" className={cls} defaultValue={initialData?.fecha ?? today} required />
          </Field>
          <Field label="Hora de inicio">
            <input name="hora" type="time" className={cls} defaultValue={initialData?.hora ?? nowHM} />
          </Field>
          <Field label="Consultorio">
            <select name="consultorio" className={cls} defaultValue={initialData?.consultorio ?? defaultConsultorio ?? ''}>
              <option value="">— Sin especificar —</option>
              {Object.keys(consultorios).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Motivo de consulta">
              <input name="motivo" className={cls} defaultValue={initialData?.motivo ?? ''} placeholder="Seguimiento, control, nuevo síntoma…" />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Signos vitales">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <VitalField name="sv_ta"   label="T/A"   defaultValue={initialData?.signos_vitales?.ta   ?? "120/80"} unit="mmHg" />
          <VitalField name="sv_fc"   label="FC"    defaultValue={initialData?.signos_vitales?.fc   ?? "72"}     unit="lpm"  />
          <VitalField name="sv_fr"   label="FR"    defaultValue={initialData?.signos_vitales?.fr   ?? "16"}     unit="rpm"  />
          <VitalField name="sv_temp" label="Temp." defaultValue={initialData?.signos_vitales?.temp ?? "36.5"}   unit="°C"   />
          <VitalField name="sv_spo2" label="SpO₂"  defaultValue={initialData?.signos_vitales?.spo2 ?? "98"}     unit="%"    />
        </div>
      </SectionCard>

      <SectionCard title="Padecimiento actual">
        <Field label="">
          <textarea name="padecimiento" className={cls} rows={4} defaultValue={initialData?.padecimiento ?? ''} placeholder="Evolución del paciente desde la última consulta…" />
        </Field>
        <div className="mt-3">
          <Field label="Exploración física">
            <textarea
              name="exploracion"
              className={cls}
              rows={3}
              value={exploracion}
              onChange={e => setExploracion(e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Análisis">
        <Field label="">
          <textarea name="analisis" className={cls} rows={3} defaultValue={initialData?.analisis ?? ''} placeholder="Integración diagnóstica, razonamiento clínico…" />
        </Field>
      </SectionCard>

      <SectionCard title="Diagnóstico">
        <ChipSelector catalog={catDx} selected={catalogDx} onChange={sel => setDx([...sel, ...extraDx])} />
        {extraDx.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {extraDx.map(d => (
              <span key={d} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal text-white border border-teal">
                {d}
                <button type="button" onClick={() => setDx(dx.filter(x => x !== d))} className="ml-0.5 hover:opacity-70">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customDx}
            onChange={e => setCustomDx(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomDx())}
            placeholder="Otro diagnóstico…"
            className={cls + ' flex-1'}
          />
          <button type="button" onClick={addCustomDx} className="px-3 py-1.5 bg-teal text-white text-sm font-semibold rounded-lg hover:opacity-90">
            + Agregar
          </button>
        </div>
        <div className="mt-2">
          <Field label="Notas">
            <textarea name="dx_texto" className={cls} rows={2} defaultValue={initialData?.dx_texto ?? ''} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Tratamiento y solicitudes">
        <ChipSelector catalog={catTx} selected={tx} onChange={setTx} />
        <div className="mt-2">
          <Field label="Indicaciones">
            <textarea name="tx_texto" className={cls} rows={3} defaultValue={initialData?.tx_texto ?? ''} />
          </Field>
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

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={pending}
          className="bg-green text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar consulta'}
        </button>
        <Link
          href={`/pacientes/${patientId}`}
          className="bg-teal-light text-navy font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-border transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
