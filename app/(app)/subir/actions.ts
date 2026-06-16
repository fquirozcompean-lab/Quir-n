'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { extractTextFromPdf } from '@/lib/extractText'

export async function createPatientAndAttach(
  formData: FormData,
): Promise<{ error?: string; patientId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string)?.trim()
  const file = formData.get('file') as File
  if (!nombre) return { error: 'Ingresa el nombre del paciente.' }
  if (!file)   return { error: 'Archivo no encontrado.' }

  const { data: newPatient, error: patientError } = await supabase
    .from('patients')
    .insert({ nombre, user_id: user.id })
    .select('id')
    .single()
  if (patientError || !newPatient) return { error: 'No se pudo crear el expediente.' }

  const tipo = file.type.includes('pdf') ? 'PDF' : 'IMG'
  const ext  = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${user.id}/${newPatient.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('estudios')
    .upload(storagePath, file)
  if (uploadError) return { error: 'Expediente creado pero no se pudo subir el archivo.' }

  await supabase.from('attachments').insert({
    patient_id:     newPatient.id,
    user_id:        user.id,
    nombre_archivo: file.name,
    tipo,
    storage_path:   storagePath,
    fecha:          new Date().toISOString().slice(0, 10),
  })

  return { patientId: newPatient.id }
}

// Lightweight action — only inserts DB record; file is already in Supabase Storage
// (uploaded directly from browser to bypass Vercel's 1MB body limit on server actions)
export async function registerAttachmentAction(opts: {
  patientId:   string
  filename:    string
  tipo:        string
  storagePath: string
  pendingPath?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesión expirada.' }

  const { error } = await supabase.from('attachments').insert({
    patient_id:     opts.patientId,
    user_id:        user.id,
    nombre_archivo: opts.filename,
    tipo:           opts.tipo,
    storage_path:   opts.storagePath,
    fecha:          new Date().toISOString().slice(0, 10),
  })

  if (error) return { error: 'Archivo subido pero no se pudo registrar.' }

  if (opts.pendingPath) {
    await supabase.storage.from('estudios').remove([opts.pendingPath])
  }

  return {}
}

export async function extractTextAction(formData: FormData): Promise<{ text: string }> {
  const file = formData.get('file') as File
  if (!file || file.type !== 'application/pdf') return { text: '' }
  const buffer = await file.arrayBuffer()
  const text = await extractTextFromPdf(buffer)
  return { text }
}

export async function attachFileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const file = formData.get('file') as File
  const patientId = formData.get('patient_id') as string
  const pendingPath = (formData.get('pending_path') as string) || null

  if (!file || !patientId) return { error: 'Archivo o paciente no especificado.' }

  const tipo = file.type.includes('pdf') ? 'PDF' : 'IMG'
  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${user.id}/${patientId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('estudios')
    .upload(storagePath, file)

  if (uploadError) return { error: 'Error al subir el archivo. Intenta de nuevo.' }

  const { error: dbError } = await supabase.from('attachments').insert({
    patient_id: patientId,
    user_id: user.id,
    nombre_archivo: file.name,
    tipo,
    storage_path: storagePath,
    fecha: new Date().toISOString().slice(0, 10),
  })

  if (dbError) return { error: 'El archivo se subió pero no se pudo registrar. Contacta soporte.' }

  if (pendingPath) {
    await supabase.storage.from('estudios').remove([pendingPath])
  }

  return { success: true, patientId }
}
