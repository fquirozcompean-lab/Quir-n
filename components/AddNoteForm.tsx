'use client'

import { useActionState } from 'react'
import { addEvolutionNote } from '@/app/(app)/pacientes/actions'

type ActionState = { error: string } | undefined

export default function AddNoteForm({ patientId }: { patientId: string }) {
  const [state, formAction, pending] = useActionState(addEvolutionNote, undefined)

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="patient_id" value={patientId} />
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2">
        <input
          name="fecha"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal w-full sm:w-36"
        />
        <textarea
          name="nota"
          placeholder="Nota de seguimiento…"
          required
          rows={2}
          className="text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal w-full resize-none"
        />
      </div>
      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-teal text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {pending ? 'Guardando…' : '+ Agregar nota'}
      </button>
    </form>
  )
}
