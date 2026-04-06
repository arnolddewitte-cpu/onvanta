import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['company_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Geen bestand' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Alleen JPG, PNG, WebP of SVG toegestaan' }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Bestand mag maximaal 2 MB zijn' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `${session.companyId}/logo.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: uploadError } = await supabaseAdmin.storage
    .from('logos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('Logo upload error:', uploadError)
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('logos')
    .getPublicUrl(path)

  // Cache-busting query param
  const logoUrl = `${publicUrl}?t=${Date.now()}`

  await supabaseAdmin
    .from('Company')
    .update({ logoUrl })
    .eq('id', session.companyId)

  return NextResponse.json({ logoUrl })
}
