'use client'

import { useActionState } from 'react'
import { updateDoctorProfileAction } from './actions'
import { CatalogEditor } from '@/components/CatalogEditor'
import { PosologiaEditor } from '@/components/PosologiaEditor'
import { ConsultoriosEditor } from '@/components/ConsultoriosEditor'
import type { DoctorProfile } from '@/lib/types'

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

export default function ConfiguracionForm({ profile, showOnboarding }: { profile: DoctorProfile; showOnboarding: boolean }) {
  const [state, formAction, pending] = useActionState(updateDoctorProfileAction, undefined)

  return (
    <form action={formAction} className="space-y-3 pb-10">
      {showOnboarding && (
        <div className="bg-teal-light border border-teal rounded-xl px-4 py-3 text-sm text-navy">
          👋 Completa tu perfil para empezar a usar Quirón con tu información.
        </div>
      )}

      <SectionCard title="Identidad">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Field label="Nombre completo (con título) *">
              <input name="nombre" className={cls} defaultValue={profile.nombre} placeholder="Dr. Juan Pérez García" required />
            </Field>
          </div>
          <Field label="Nombre corto (aparece en el menú)">
            <input name="nombre_corto" className={cls} defaultValue={profile.nombre_corto} placeholder="Dr. Pérez" />
          </Field>
          <Field label="Especialidad">
            <input name="especialidad" className={cls} defaultValue={profile.especialidad} placeholder="UROLOGÍA" />
          </Field>
          <Field label="Apellido paterno">
            <input name="apellido1" className={cls} defaultValue={profile.apellido1} />
          </Field>
          <Field label="Apellido materno">
            <input name="apellido2" className={cls} defaultValue={profile.apellido2} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Nombre(s)">
              <input name="nombres" className={cls} defaultValue={profile.nombres} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Especialidades (texto largo, para encabezados)">
              <input name="especialidades" className={cls} defaultValue={profile.especialidades} placeholder="Urología · Endourología" />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Cédulas y contacto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Cédula profesional *">
            <input name="cedula_prof" className={cls} defaultValue={profile.cedula_prof} required />
          </Field>
          <Field label="Cédula de especialidad">
            <input name="cedula_esp" className={cls} defaultValue={profile.cedula_esp ?? ''} />
          </Field>
          <Field label="Cédula de subespecialidad">
            <input name="cedula_esp2" className={cls} defaultValue={profile.cedula_esp2 ?? ''} />
          </Field>
          <Field label="RFC">
            <input name="rfc" className={cls} defaultValue={profile.rfc ?? ''} />
          </Field>
          <Field label="Correo electrónico">
            <input name="email" type="email" className={cls} defaultValue={profile.email ?? ''} />
          </Field>
          <Field label="Correo para aseguradoras">
            <input name="email_seguros" type="email" className={cls} defaultValue={profile.email_seguros ?? ''} />
          </Field>
          <Field label="Celular">
            <input name="celular" className={cls} defaultValue={profile.celular ?? ''} />
          </Field>
          <Field label="Teléfono de emergencias">
            <input name="emergencias" className={cls} defaultValue={profile.emergencias ?? ''} />
          </Field>
          <Field label="Ciudad">
            <input name="ciudad" className={cls} defaultValue={profile.ciudad ?? ''} />
          </Field>
          <Field label="Link de reseña de Google (botón WhatsApp)">
            <input name="review_url" className={cls} defaultValue={profile.review_url ?? ''} placeholder="https://g.page/r/..." />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Logo y firma">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Logo (aparece en recetas y formatos)">
            {profile.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt="Logo actual" className="h-12 object-contain mb-1.5" />
            )}
            <input type="file" name="logo" accept="image/*" className="text-sm" />
          </Field>
          <Field label="Firma">
            {profile.firma_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.firma_url} alt="Firma actual" className="h-12 object-contain mb-1.5" />
            )}
            <input type="file" name="firma" accept="image/*" className="text-sm" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Consultorios">
        <ConsultoriosEditor name="consultorios" initial={profile.consultorios} />
      </SectionCard>

      <SectionCard title="Procedimiento especial (opcional)">
        <p className="text-xs text-muted mb-2">
          Activa esto solo si quieres un botón de preparación para un procedimiento específico en el expediente del paciente.
        </p>
        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" id="procedimiento_mostrar" name="procedimiento_mostrar" defaultChecked={profile.procedimiento.mostrar} />
          <label htmlFor="procedimiento_mostrar" className="text-sm text-navy">Mostrar botón de procedimiento</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nombre del procedimiento">
            <input name="procedimiento_label" className={cls} defaultValue={profile.procedimiento.label} placeholder="Cistoscopía" />
          </Field>
          <Field label="Ruta (avanzado, no cambiar si no sabes)">
            <input name="procedimiento_href" className={cls} defaultValue={profile.procedimiento.href} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Diagnósticos frecuentes">
        <CatalogEditor name="cat_dx" initial={profile.cat_dx} placeholder="Agregar diagnóstico…" />
      </SectionCard>

      <SectionCard title="Tratamientos frecuentes">
        <CatalogEditor name="cat_tx" initial={profile.cat_tx} placeholder="Agregar tratamiento/medicamento…" />
      </SectionCard>

      <SectionCard title="Estudios frecuentes">
        <CatalogEditor name="cat_est" initial={profile.cat_est} placeholder="Agregar estudio…" />
      </SectionCard>

      <SectionCard title="Posología predeterminada">
        <p className="text-xs text-muted mb-2">
          Cuando selecciones uno de estos medicamentos en una consulta, se autocompletará esta indicación.
        </p>
        <PosologiaEditor name="cat_posologia" initial={profile.cat_posologia} />
      </SectionCard>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">Configuración guardada.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-green text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {pending ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </form>
  )
}
