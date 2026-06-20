'use client'

import { useState } from 'react'

export interface HistoriaClinicaData {
  edad?: string
  sexo?: string | null
  ciudad?: string | null
  cronicos?: string | null
  quirurgicos?: string | null
  alergicos?: string | null
  medicamentos?: string | null
  padecimiento?: string | null
  exploracion?: string | null
  analisis?: string | null
  dx?: string[] | null
  dx_texto?: string | null
  tx?: string[] | null
  tx_texto?: string | null
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs font-bold text-muted uppercase tracking-wide">{label}: </span>
      <span className="text-sm text-gray-800 whitespace-pre-wrap">{value}</span>
    </div>
  )
}

export default function HistoriaClinicaPanel({ patientId, data }: { patientId: string; data: HistoriaClinicaData }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-teal-light/50 border border-teal rounded-xl overflow-hidden">
      <div className="w-full flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-semibold text-navy"
        >
          <span>{open ? '▲' : '▼'}</span>
          📋 Ver historia clínica del paciente
        </button>
        <a
          href={`/pacientes/${patientId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-teal font-semibold hover:underline flex-shrink-0"
        >
          Expediente completo ↗
        </a>
      </div>
      {open && (
        <div className="px-4 pb-3 pt-2 space-y-1.5 bg-white border-t border-teal/30">
          <Row label="Edad" value={data.edad} />
          <Row label="Sexo" value={data.sexo === 'F' ? 'Femenino' : data.sexo === 'M' ? 'Masculino' : null} />
          <Row label="Ciudad" value={data.ciudad} />
          <Row label="Crónicos" value={data.cronicos} />
          <Row label="Quirúrgicos" value={data.quirurgicos} />
          <Row label="Alérgicos" value={data.alergicos} />
          <Row label="Medicamentos de uso crónico" value={data.medicamentos} />
          <Row label="Padecimiento actual" value={data.padecimiento} />
          <Row label="Exploración física" value={data.exploracion} />
          <Row label="Análisis" value={data.analisis} />
          <Row label="Diagnóstico" value={[...(data.dx ?? []), data.dx_texto].filter(Boolean).join(' · ')} />
          <Row label="Tratamiento" value={data.tx_texto || data.tx?.join(', ')} />
          {!data.padecimiento && !data.exploracion && !data.dx?.length && !data.dx_texto && (
            <p className="text-xs text-muted italic">Sin historia clínica registrada todavía.</p>
          )}
        </div>
      )}
    </div>
  )
}
