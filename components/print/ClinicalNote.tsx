import { formatDate } from '@/lib/utils'

export interface ClinicalNoteData {
  fecha: string | null
  hora?: string | null
  motivo?: string | null
  consultorioLabel?: string | null
  padecimiento?: string | null
  exploracion?: string | null
  analisis?: string | null
  dx?: string[] | null
  dx_texto?: string | null
  tx?: string[] | null
  tx_texto?: string | null
  estudios_solicitados?: string[] | null
  pronostico?: string | null
  signos_vitales?: { ta?: string; fc?: string; fr?: string; temp?: string; spo2?: string } | null
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-500 mb-0.5">{label}</p>
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  )
}

export default function ClinicalNote({ title, note }: { title: string; note: ClinicalNoteData }) {
  const sv = note.signos_vitales
  const hasSv = sv && (sv.ta || sv.fc || sv.fr || sv.temp || sv.spo2)
  const hasDx = (note.dx?.length ?? 0) > 0 || !!note.dx_texto
  const hasTx = (note.tx?.length ?? 0) > 0 || !!note.tx_texto
  const hasEst = (note.estudios_solicitados?.length ?? 0) > 0

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 break-inside-avoid">
      <div className="flex items-baseline justify-between gap-3 mb-2 pb-2 border-b border-gray-200">
        <h3 className="text-sm font-bold text-navy">{title}</h3>
        <p className="text-xs text-gray-500 flex-shrink-0">
          {formatDate(note.fecha)}{note.hora ? ` · ${note.hora}` : ''}
          {note.consultorioLabel ? ` · ${note.consultorioLabel}` : ''}
        </p>
      </div>

      {note.motivo && <Block label="Motivo">{note.motivo}</Block>}

      {hasSv && (
        <Block label="Signos vitales">
          {[
            sv?.ta ? `T/A ${sv.ta} mmHg` : null,
            sv?.fc ? `FC ${sv.fc} lpm` : null,
            sv?.fr ? `FR ${sv.fr} rpm` : null,
            sv?.temp ? `Temp. ${sv.temp} °C` : null,
            sv?.spo2 ? `SpO₂ ${sv.spo2}%` : null,
          ].filter(Boolean).join('  ·  ')}
        </Block>
      )}

      {note.padecimiento && <Block label="Padecimiento actual">{note.padecimiento}</Block>}
      {note.exploracion && <Block label="Exploración física">{note.exploracion}</Block>}
      {note.analisis && <Block label="Análisis">{note.analisis}</Block>}

      {hasDx && (
        <Block label="Diagnóstico">
          {note.dx && note.dx.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {note.dx.map(d => (
                <span key={d} className="text-xs bg-teal-light text-navy font-semibold px-2 py-0.5 rounded-full">{d}</span>
              ))}
            </div>
          )}
          {note.dx_texto}
        </Block>
      )}

      {hasTx && (
        <Block label="Tratamiento">
          {note.tx_texto || note.tx?.join(', ')}
        </Block>
      )}

      {hasEst && (
        <Block label="Estudios solicitados">
          {note.estudios_solicitados!.join(', ')}
        </Block>
      )}

      {note.pronostico && <Block label="Pronóstico">{note.pronostico}</Block>}
    </div>
  )
}
