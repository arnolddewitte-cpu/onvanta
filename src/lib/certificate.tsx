import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'

Font.register({
  family: 'Georgia',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/tinos/v24/buE4poGnedXvwgX8dGVh8TI.ttf' }, // Tinos Regular ≈ Georgia
    { src: 'https://fonts.gstatic.com/s/tinos/v24/buE2poGnedXvwjX-fmFD9CI-4NU.ttf', fontStyle: 'italic' },
  ],
})

export interface CertificateData {
  employeeName: string
  templateName: string
  companyName: string
  logoUrl: string | null
  brandColor: string
  completedAt: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function makeStyles(brandColor: string) {
  return StyleSheet.create({
    page: {
      backgroundColor: '#ffffff',
      paddingHorizontal: 60,
      paddingVertical: 56,
      fontFamily: 'Helvetica',
    },
    // Top accent bar
    accentBar: {
      height: 6,
      backgroundColor: brandColor,
      borderRadius: 3,
      marginBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 48,
    },
    logo: {
      width: 100,
      height: 40,
      objectFit: 'contain',
    },
    companyName: {
      fontSize: 13,
      color: '#6b7280',
      textAlign: 'right',
    },
    // Centre content
    centre: {
      alignItems: 'center',
      marginBottom: 40,
    },
    badgeCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: brandColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    badgeMark: {
      color: '#ffffff',
      fontSize: 28,
    },
    certLabel: {
      fontSize: 10,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      color: '#9ca3af',
      marginBottom: 16,
    },
    certTitle: {
      fontFamily: 'Georgia',
      fontStyle: 'italic',
      fontSize: 32,
      color: '#111827',
      marginBottom: 24,
      textAlign: 'center',
    },
    certBody: {
      fontSize: 13,
      color: '#374151',
      textAlign: 'center',
      lineHeight: 1.7,
      marginBottom: 6,
    },
    employeeName: {
      fontFamily: 'Georgia',
      fontSize: 26,
      color: brandColor,
      textAlign: 'center',
      marginBottom: 14,
    },
    templateName: {
      fontFamily: 'Georgia',
      fontStyle: 'italic',
      fontSize: 18,
      color: '#111827',
      textAlign: 'center',
      marginBottom: 32,
    },
    // Divider
    divider: {
      width: 80,
      height: 1.5,
      backgroundColor: brandColor,
      marginBottom: 32,
    },
    dateRow: {
      fontSize: 11,
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: 4,
    },
    // Footer
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 60,
      right: 60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    footerLeft: {
      flex: 1,
    },
    signatureLabel: {
      fontSize: 9,
      color: '#9ca3af',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    signatureLine: {
      height: 1,
      width: 120,
      backgroundColor: '#d1d5db',
    },
    footerRight: {
      alignItems: 'flex-end',
    },
    onvantaLabel: {
      fontSize: 9,
      color: '#d1d5db',
    },
  })
}

function CertificateDocument({ data }: { data: CertificateData }) {
  const styles = makeStyles(data.brandColor)
  const date = formatDate(data.completedAt)

  return (
    <Document
      title={`Certificaat — ${data.employeeName}`}
      author={data.companyName}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.accentBar} />

        {/* Header: logo links, bedrijfsnaam rechts */}
        <View style={styles.header}>
          {data.logoUrl ? (
            <Image src={data.logoUrl} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#111827' }}>
              {data.companyName}
            </Text>
          )}
          {data.logoUrl && (
            <Text style={styles.companyName}>{data.companyName}</Text>
          )}
        </View>

        {/* Centre content */}
        <View style={styles.centre}>
          <View style={styles.badgeCircle}>
            <Text style={styles.badgeMark}>✓</Text>
          </View>

          <Text style={styles.certLabel}>Certificaat van voltooiing</Text>

          <Text style={styles.certTitle}>Onboarding Certificaat</Text>

          <Text style={styles.certBody}>Hierbij wordt bevestigd dat</Text>

          <Text style={styles.employeeName}>{data.employeeName}</Text>

          <Text style={styles.certBody}>de onboarding</Text>

          <Text style={styles.templateName}>{data.templateName}</Text>

          <View style={styles.divider} />

          <Text style={styles.certBody}>succesvol heeft afgerond</Text>
          <Text style={styles.dateRow}>{date}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.signatureLabel}>Handtekening</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.onvantaLabel}>Gegenereerd via Onvanta</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export async function renderCertificate(data: CertificateData): Promise<ArrayBuffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(CertificateDocument, { data }) as any
  const buffer = await renderToBuffer(doc)
  const uint8 = new Uint8Array(buffer)
  return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength)
}
