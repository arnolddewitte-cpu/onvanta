export interface CompanyBranding {
  companyName: string
  logoUrl?: string | null
  senderName?: string | null
  welcomeMessage?: string | null
  brandColor?: string | null
}

const DEFAULT_COLOR = '#2563eb'
const DEFAULT_SENDER = 'Onvanta'

export function resolveColor(branding: CompanyBranding): string {
  return branding.brandColor?.trim() || DEFAULT_COLOR
}

export function resolveSender(branding: CompanyBranding): string {
  return branding.senderName?.trim() || DEFAULT_SENDER
}

export function buildEmailHeader(branding: CompanyBranding): string {
  const color = resolveColor(branding)
  const sender = resolveSender(branding)

  if (branding.logoUrl) {
    return `
    <tr>
      <td style="background:${color};padding:24px 40px;">
        <img src="${branding.logoUrl}" alt="${branding.companyName}" style="max-height:48px;max-width:200px;object-fit:contain;display:block;" />
      </td>
    </tr>`
  }

  return `
  <tr>
    <td style="background:${color};padding:28px 40px;">
      <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${sender}</p>
    </td>
  </tr>`
}

export function buildWelcomeBlock(branding: CompanyBranding): string {
  if (!branding.welcomeMessage?.trim()) return ''
  return `
  <tr>
    <td style="padding:0 40px;">
      <div style="background:#f8f9fa;border-left:4px solid ${resolveColor(branding)};border-radius:4px;padding:16px 20px;margin-bottom:8px;">
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;font-style:italic;">${branding.welcomeMessage.trim()}</p>
      </div>
    </td>
  </tr>`
}

export function buildCtaButton(label: string, url: string, color: string): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr>
      <td style="background:${color};border-radius:10px;">
        <a href="${url}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`
}
