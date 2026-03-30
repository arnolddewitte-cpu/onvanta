import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ongeldig emailadres' }, { status: 400 })
    }

    const supabase = supabaseAdmin

    // 1. Check of email bestaat in User tabel
    const { data: user } = await supabase
      .from('User')
      .select('id, email, role')
      .eq('email', email.toLowerCase().trim())
      .single()

    // Altijd success teruggeven (geen info lekken of email bestaat)
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // 2. Genereer token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minuten

    // 3. Sla token op in database
    await supabase.from('MagicLinkToken').insert({
      token,
      userId: user.id,
      expires,
      used: false,
    })

    // 4. Stuur email via Resend
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`

    await resend.emails.send({
      from: 'Onvanta <noreply@onvanta.io>',
      to: email,
      subject: 'Jouw inloglink voor Onvanta',
      html: `
        <p>Hallo,</p>
        <p>Klik op de onderstaande link om in te loggen. De link is 15 minuten geldig.</p>
        <br/>
        <a href="${verifyUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
          Inloggen bij Onvanta
        </a>
        <br/><br/>
        <p style="color:#888;font-size:12px;">Als je dit niet hebt aangevraagd, kun je deze email negeren.</p>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Magic link error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}