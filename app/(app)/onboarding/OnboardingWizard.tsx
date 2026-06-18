'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveWizardProfile, saveWizardConsultorio, completeOnboarding } from './actions'
import type { DoctorProfile } from '@/lib/types'

const STEPS = ['Bienvenida', 'Tu perfil', 'Consultorio', 'Herramientas', 'Todo listo']

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i < current ? 'bg-teal border-teal text-white' :
              i === current ? 'border-teal text-teal bg-white' :
              'border-border text-muted bg-white'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-navy' : 'text-muted'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-border rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-teal rounded-full transition-all duration-500"
          style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-3 bg-white border border-border rounded-xl">
      <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy mb-1">{title}</p>
        <div className="text-xs text-muted leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  )
}

export default function OnboardingWizard({ profile, isTutorial = false }: { profile: DoctorProfile; isTutorial?: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState(isTutorial ? 3 : 0)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Perfil fields
  const [nombre, setNombre] = useState(profile.nombre || '')
  const [nombreCorto, setNombreCorto] = useState(profile.nombre_corto || '')
  const [especialidad, setEspecialidad] = useState(profile.especialidad || '')
  const [especialidades, setEspecialidades] = useState(profile.especialidades || '')
  const [cedulaProf, setCedulaProf] = useState(profile.cedula_prof || '')
  const [cedulaEsp, setCedulaEsp] = useState(profile.cedula_esp || '')
  const [celular, setCelular] = useState(profile.celular || '')

  // Consultorio fields
  const [hospital, setHospital] = useState('')
  const [ciudad, setCiudad] = useState(profile.ciudad || '')
  const [telefono, setTelefono] = useState('')

  const cls = 'w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-white'

  function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
    return (
      <div>
        <label className="block text-xs font-medium text-muted mb-1">{label}</label>
        {children}
        {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      </div>
    )
  }

  function handleSaveProfile() {
    if (!nombre.trim()) { setError('El nombre completo es requerido.'); return }
    setError(null)
    startSave(async () => {
      const result = await saveWizardProfile({
        nombre: nombre.trim(),
        nombre_corto: nombreCorto.trim() || nombre.trim().split(' ').slice(0, 2).join(' '),
        especialidad: especialidad.trim(),
        especialidades: especialidades.trim(),
        cedula_prof: cedulaProf.trim(),
        cedula_esp: cedulaEsp.trim(),
        celular: celular.trim(),
      })
      if (result?.error) { setError(result.error); return }
      setStep(2)
    })
  }

  function handleSaveConsultorio() {
    if (!hospital.trim()) { setError('Ingresa el nombre del hospital o clínica.'); return }
    setError(null)
    startSave(async () => {
      const result = await saveWizardConsultorio({
        hospital: hospital.trim(),
        ciudad: ciudad.trim(),
        telefono: telefono.trim(),
      })
      if (result?.error) { setError(result.error); return }
      setStep(3)
    })
  }

  function handleFinish(goImport: boolean) {
    startSave(async () => {
      await completeOnboarding()
      router.push(goImport ? '/importar' : '/pacientes')
    })
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-navy">Quirón</h1>
        <p className="text-sm text-muted mt-1">Expedientes clínicos para tu consultorio</p>
      </div>

      <ProgressBar current={step} />

      {/* Step 0: Bienvenida */}
      {step === 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-navy">¡Bienvenido a Quirón!</h2>
            <p className="text-sm text-muted mt-1">
              En 2 minutos tendrás tu consultorio digital listo. Solo necesitamos algunos datos básicos.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: '🗂️', text: 'Expedientes de pacientes organizados y seguros' },
              { icon: '📄', text: 'Recetas y formatos de aseguradoras pre-llenados' },
              { icon: '📋', text: 'Hojas de instrucciones para tus procedimientos' },
              { icon: '📁', text: 'Importa expedientes desde Word o PDF con IA' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-navy">
                <span className="text-lg">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full bg-navy text-white font-semibold py-3 rounded-xl hover:bg-teal transition-colors"
          >
            Comenzar configuración →
          </button>
        </div>
      )}

      {/* Step 1: Perfil */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Tu perfil</h2>
            <p className="text-xs text-muted mt-1">Esta información aparece en tus recetas y formatos.</p>
          </div>

          <Field label="Nombre completo (con título) *">
            <input
              className={cls}
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Dr. Juan Pérez García"
            />
          </Field>

          <Field label="Nombre corto (aparece en el menú)" hint="Si lo dejas vacío usamos las primeras dos palabras del nombre.">
            <input
              className={cls}
              value={nombreCorto}
              onChange={e => setNombreCorto(e.target.value)}
              placeholder="Dr. Pérez"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Especialidad">
              <input
                className={cls}
                value={especialidad}
                onChange={e => setEspecialidad(e.target.value)}
                placeholder="Gastroenterología"
              />
            </Field>
            <Field label="Cédula profesional">
              <input
                className={cls}
                value={cedulaProf}
                onChange={e => setCedulaProf(e.target.value)}
                placeholder="12345678"
              />
            </Field>
            <Field label="Cédula de especialidad">
              <input
                className={cls}
                value={cedulaEsp}
                onChange={e => setCedulaEsp(e.target.value)}
                placeholder="87654321"
              />
            </Field>
            <Field label="Celular">
              <input
                className={cls}
                value={celular}
                onChange={e => setCelular(e.target.value)}
                placeholder="477 000 0000"
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-navy text-white font-semibold py-3 rounded-xl hover:bg-teal transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Siguiente →'}
          </button>
        </div>
      )}

      {/* Step 2: Consultorio */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Tu consultorio</h2>
            <p className="text-xs text-muted mt-1">
              Aparece en tus recetas. Puedes agregar más consultorios después en Configuración.
            </p>
          </div>

          <Field label="Hospital o clínica *">
            <input
              className={cls}
              value={hospital}
              onChange={e => setHospital(e.target.value)}
              placeholder="Hospital General / Consultorio particular"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad">
              <input
                className={cls}
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                placeholder="León, GTO"
              />
            </Field>
            <Field label="Teléfono">
              <input
                className={cls}
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="477 000 0000"
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSaveConsultorio}
              disabled={saving}
              className="flex-1 bg-navy text-white font-semibold py-3 rounded-xl hover:bg-teal transition-colors disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Siguiente →'}
            </button>
            <button
              onClick={() => { setError(null); setStep(3) }}
              disabled={saving}
              className="px-4 py-3 rounded-xl border border-border text-muted text-sm hover:border-navy hover:text-navy transition-colors disabled:opacity-60"
            >
              Omitir
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Herramientas */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Personaliza tu flujo de trabajo</h2>
            <p className="text-xs text-muted mt-1">
              Estas herramientas se configuran una sola vez en{' '}
              <span className="font-semibold text-navy">Configuración</span> y te ahorran tiempo en cada consulta.
            </p>
          </div>

          <div className="space-y-3">
            <InfoCard icon="🏷️" title="Diagnósticos frecuentes">
              <p>
                Agrega los diagnósticos que usas más en tu práctica (ej. "ERGE", "Colitis", "Gastritis crónica").
              </p>
              <p>
                Al crear una consulta aparecen como chips seleccionables — un clic y queda registrado, sin escribir.
              </p>
            </InfoCard>

            <InfoCard icon="💊" title="Tratamientos y posología">
              <p>
                Define tus medicamentos con su dosis habitual (ej. "Omeprazol → 20 mg cada 24 h por 30 días").
              </p>
              <p>
                Cuando seleccionas un tratamiento en la consulta, la posología se auto-completa con lo que configuraste.
                Puedes editarla por paciente si necesitas ajustar la dosis.
              </p>
            </InfoCard>

            <InfoCard icon="📋" title="Documentos editables">
              <p>
                Si realizas procedimientos (colonoscopia, cirugías, etc.), puedes crear hojas de instrucciones
                personalizadas: preparación previa, cuidados post-quirúrgicos, recuperación.
              </p>
              <p>
                Cada hoja se genera con el nombre del paciente y las fechas correctas, lista para imprimir o
                enviar por WhatsApp directamente desde el expediente.
              </p>
              <p className="font-medium text-navy">
                Actívalas en Configuración → sección "Procedimiento especial".
              </p>
            </InfoCard>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full bg-navy text-white font-semibold py-3 rounded-xl hover:bg-teal transition-colors"
          >
            Entendido →
          </button>
        </div>
      )}

      {/* Step 4: Listo */}
      {step === 4 && !isTutorial && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 text-center">
          <div className="text-5xl">🎉</div>
          <div>
            <h2 className="text-lg font-bold text-navy">¡Todo listo!</h2>
            <p className="text-sm text-muted mt-1">
              Tu perfil está configurado. Completa tu logo, firma, catálogos y documentos cuando quieras desde{' '}
              <span className="font-medium text-navy">Configuración</span>.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">¿Cómo quieres empezar?</p>

            <button
              onClick={() => handleFinish(true)}
              disabled={saving}
              className="w-full flex items-center gap-3 border border-border rounded-xl px-4 py-3 hover:border-teal hover:bg-teal-light transition-colors text-left disabled:opacity-60"
            >
              <span className="text-2xl">📁</span>
              <div>
                <p className="text-sm font-semibold text-navy">Importar pacientes existentes</p>
                <p className="text-xs text-muted">Sube un Word o PDF y la IA extrae los datos</p>
              </div>
            </button>

            <button
              onClick={() => handleFinish(false)}
              disabled={saving}
              className="w-full flex items-center gap-3 border border-border rounded-xl px-4 py-3 hover:border-teal hover:bg-teal-light transition-colors text-left disabled:opacity-60"
            >
              <span className="text-2xl">✏️</span>
              <div>
                <p className="text-sm font-semibold text-navy">Empezar desde cero</p>
                <p className="text-xs text-muted">Agregar pacientes uno por uno</p>
              </div>
            </button>
          </div>

          {saving && <p className="text-xs text-muted">Preparando tu cuenta…</p>}
        </div>
      )}

      {step === 4 && isTutorial && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-center">
          <div className="text-4xl">👍</div>
          <div>
            <h2 className="text-lg font-bold text-navy">¡Listo!</h2>
            <p className="text-sm text-muted mt-1">
              Recuerda que puedes configurar catálogos y documentos desde{' '}
              <span className="font-medium text-navy">Configuración</span> en el menú.
            </p>
          </div>
          <button
            onClick={() => router.push('/pacientes')}
            className="w-full bg-navy text-white font-semibold py-3 rounded-xl hover:bg-teal transition-colors"
          >
            Volver a mis pacientes
          </button>
        </div>
      )}
    </div>
  )
}
