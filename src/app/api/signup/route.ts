import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, size } = await req.json()

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'Vul alle verplichte velden in' }, { status: 400 })
    }

    // 1. Check of email al bestaat
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Dit emailadres is al in gebruik' }, { status: 400 })
    }

    // 2. Maak bedrijf aan
    const slug = company
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Maak Stripe customer aan
    const stripeCustomer = await stripe.customers.create({
      name: company,
      email: email.toLowerCase().trim(),
      metadata: { slug: `${slug}-${Date.now()}` },
    })

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    const { data: newCompany, error: companyError } = await supabaseAdmin
      .from('Company')
      .insert({
        name: company,
        slug: `${slug}-${Date.now()}`,
        status: 'trial',
        plan: 'pro',
        stripeCustomerId: stripeCustomer.id,
        trialEndsAt,
      })
      .select()
      .single()

    if (companyError || !newCompany) {
      console.error('Company error:', companyError)
      return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
    }

    // 3. Maak admin user aan
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('User')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        role: 'company_admin',
        companyId: newCompany.id,
      })
      .select()
      .single()

    if (userError || !newUser) {
      console.error('User error:', userError)
      return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
    }

    // 4. Genereer magic link token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 uur geldig

    await supabaseAdmin.from('MagicLinkToken').insert({
      token,
      userId: newUser.id,
      expires,
      used: false,
    })

    // 5. Stuur welkomstmail met magic link
    const baseUrl = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://onvanta.io')
  const loginUrl = `${baseUrl}/api/auth/verify?token=${token}`

    await resend.emails.send({
      from: 'Onvanta <hello@onvanta.io>',
      to: email,
      subject: 'Welkom bij Onvanta — log hier in',
      html: `
        <div style="font-family: DM Sans, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
          <div style="margin-bottom: 32px;">
            <div style="width: 36px; height: 36px; background: #1a5fd4; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 18px; font-style: italic; font-family: Georgia, serif;">O</span>
            </div>
            <h1 style="font-family: Georgia, serif; font-size: 28px; font-weight: 400; color: #0f0f0e; margin: 0 0 8px;">Welkom bij Onvanta, ${name}!</h1>
            <p style="font-size: 15px; color: #3a3a38; line-height: 1.6; margin: 0;">Je 14-daagse Pro trial is actief. Klik op de knop hieronder om in te loggen en je eerste onboarding te starten.</p>
          </div>

          <a href="${loginUrl}" style="display: inline-block; background: #1a5fd4; color: white; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 500; text-decoration: none; margin-bottom: 24px;">
            Inloggen bij Onvanta →
          </a>

          <p style="font-size: 13px; color: #7a7a78; line-height: 1.6;">Deze link is 1 uur geldig. Als je dit niet hebt aangevraagd, kun je deze email negeren.</p>

          <hr style="border: none; border-top: 1px solid #e8e7e2; margin: 32px 0;" />

          <div style="font-size: 13px; color: #7a7a78;">
            <strong style="color: #3a3a38;">Wat nu?</strong><br/>
            1. Log in via de knop hierboven<br/>
            2. Maak je eerste onboarding template<br/>
            3. Nodig je eerste medewerker uit
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}