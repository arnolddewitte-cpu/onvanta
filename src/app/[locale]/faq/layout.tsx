import { seoMeta, ogImage } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const m = seoMeta[locale === 'en' ? 'en' : 'nl'].faq
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://onvanta.io${locale === 'en' ? '/en/faq' : '/faq'}` },
    openGraph: { title: m.title, description: m.description, images: [ogImage] }
  }
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
