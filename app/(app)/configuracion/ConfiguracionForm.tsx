'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateDoctorProfileAction } from './actions'
import { CatalogEditor } from '@/components/CatalogEditor'
import { PosologiaEditor } from '@/components/PosologiaEditor'
import { ConsultoriosEditor } from '@/components/ConsultoriosEditor'
import { SeccionesEditor } from '@/components/SeccionesEditor'
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
          <Field label="Link para reseñas en Google Business">
            <input name="review_url" className={cls} defaultValue={profile.review_url ?? ''} placeholder="Link para reseñas en Google Business" />
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

      <SectionCard title="Preparación pre-procedimiento (opcional)">
        <p className="text-xs text-muted mb-3">
          Instrucciones que se entregan antes de un procedimiento (ej. colonoscopía, cistoscopía). Cada sección genera una tarjeta en el PDF y el mensaje de WhatsApp.
        </p>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" id="procedimiento_mostrar" name="procedimiento_mostrar" defaultChecked={profile.procedimiento.mostrar} />
          <label htmlFor="procedimiento_mostrar" className="text-sm text-navy font-semibold">Activar preparación pre-procedimiento</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Field label="Nombre del procedimiento">
            <input name="procedimiento_label" className={cls} defaultValue={profile.procedimiento.label} placeholder="Colonoscopía" />
          </Field>
          <Field label="Ruta (no cambiar)">
            <input name="procedimiento_href" className={cls} defaultValue={profile.procedimiento.href} />
          </Field>
          <Field label="Horas inicio preparación (ej. -6)">
            <input name="pre_prep_inicio" type="number" className={cls} defaultValue={profile.procedimiento.pre_prep_inicio ?? -6} />
          </Field>
          <Field label="Horas fin preparación (ej. -4)">
            <input name="pre_prep_fin" type="number" className={cls} defaultValue={profile.procedimiento.pre_prep_fin ?? -4} />
          </Field>
        </div>
        <SeccionesEditor name="pre_secciones" initial={profile.procedimiento.pre_secciones ?? []} />
      </SectionCard>

      <SectionCard title="Instrucciones postquirúrgicas (opcional)">
        <p className="text-xs text-muted mb-3">
          Instrucciones para entregar al paciente después de una cirugía o procedimiento.
        </p>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" id="postquirurgico_mostrar" name="postquirurgico_mostrar" defaultChecked={profile.procedimiento.postquirurgico_mostrar ?? false} />
          <label htmlFor="postquirurgico_mostrar" className="text-sm text-navy font-semibold">Activar instrucciones postquirúrgicas</label>
        </div>
        <div className="mb-3">
          <Field label="Nombre del botón">
            <input name="postquirurgico_label" className={cls} defaultValue={profile.procedimiento.postquirurgico_label ?? 'Instrucciones postquirúrgicas'} />
          </Field>
        </div>
        <SeccionesEditor name="postquirurgico_secciones" initial={profile.procedimiento.postquirurgico_secciones ?? []} />
      </SectionCard>

      <SectionCard title="Cuidados post (opcional)">
        <p className="text-xs text-muted mb-3">
          Instrucciones de cuidados y seguimiento tras un procedimiento o consulta.
        </p>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" id="postcuidados_mostrar" name="postcuidados_mostrar" defaultChecked={profile.procedimiento.postcuidados_mostrar ?? false} />
          <label htmlFor="postcuidados_mostrar" className="text-sm text-navy font-semibold">Activar cuidados post</label>
        </div>
        <div className="mb-3">
          <Field label="Nombre del botón">
            <input name="postcuidados_label" className={cls} defaultValue={profile.procedimiento.postcuidados_label ?? 'Cuidados post'} />
          </Field>
        </div>
        <SeccionesEditor name="postcuidados_secciones" initial={profile.procedimiento.postcuidados_secciones ?? []} />
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
      {state?.success && !showOnboarding && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">Configuración guardada.</p>
      )}
      {state?.success && showOnboarding && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 space-y-2">
          <p className="text-sm font-semibold text-green-800">¡Perfil guardado!</p>
          <p className="text-sm text-green-700">
            ¿Ya tienes pacientes en un archivo Word o PDF? Puedes importarlos automáticamente con IA.
          </p>
          <div className="flex gap-3 pt-1">
            <Link
              href="/importar"
              className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal transition-colors"
            >
              Importar pacientes
            </Link>
            <Link
              href="/pacientes"
              className="text-sm text-muted hover:text-navy px-4 py-2 rounded-lg border border-border hover:border-navy transition-colors"
            >
              Empezar sin importar
            </Link>
          </div>
        </div>
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
