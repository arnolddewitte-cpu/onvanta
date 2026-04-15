import { seoMeta, ogImage } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const m = seoMeta[locale === 'en' ? 'en' : 'nl'].contact
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://onvanta.io${locale === 'en' ? '/en/contact' : '/contact'}` },
    openGraph: { title: m.title, description: m.description, images: [ogImage] }
  }
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
