import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }

    await Promise.all([
      // 1. Notificatie naar hello@onvanta.io
      resend.emails.send({
        from: 'Onvanta Contact <noreply@onvanta.io>',
        to: 'hello@onvanta.io',
        subject: `Nieuw contactbericht van ${name}`,
        html: `
          <p><strong>Naam:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Bedrijf:</strong> ${company || '—'}</p>
          <hr />
          <p><strong>Bericht:</strong></p>
          <p style="white-space:pre-line">${message}</p>
        `.trim(),
      }),

      // 2. Bevestigingsmail naar de afzender
      resend.emails.send({
        from: 'Onvanta <noreply@onvanta.io>',
        to: email,
        subject: 'We received your message',
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:DM Sans,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e8e7e2;overflow:hidden;">
        <tr><td style="background:#1a5fd4;padding:28px 36px;">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:600;">Onvanta</p>
        </td></tr>
        <tr><td style="padding:36px;">
          <p style="margin:0 0 16px;font-size:16px;color:#0f0f0e;">Hi ${name},</p>
          <p style="margin:0 0 16px;font-size:15px;color:#3a3a38;line-height:1.6;">
            Thanks for reaching out! We received your message and will get back to you within one business day.
          </p>
          <div style="background:#f2f1ed;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#7a7a78;text-transform:uppercase;letter-spacing:.6px;">Your message</p>
            <p style="margin:0;font-size:14px;color:#3a3a38;line-height:1.6;white-space:pre-line">${message}</p>
          </div>
          <p style="margin:0;font-size:14px;color:#7a7a78;">
            In the meantime, feel free to reply to this email if you have any questions.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 36px;border-top:1px solid #e8e7e2;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Onvanta · hello@onvanta.io</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
        `.trim(),
      }),
    ])

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
