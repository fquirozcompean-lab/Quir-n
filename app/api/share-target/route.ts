import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.redirect(new URL('/subir', request.url))

  const ext = file.name.split('.').pop() ?? 'bin'
  const pendingPath = `${user.id}/pending/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('estudios')
    .upload(pendingPath, bytes, { contentType: file.type, upsert: true })

  if (error) return NextResponse.redirect(new URL('/subir', request.url))

  const params = new URLSearchParams({
    pending: pendingPath,
    name: file.name,
    mime: file.type,
  })
  return NextResponse.redirect(new URL(`/subir?${params}`, request.url), 303)
}
