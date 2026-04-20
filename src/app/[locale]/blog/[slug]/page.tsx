export const revalidate = 60

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { ogImage } from '@/lib/seo'
import { getBlogPost, getAllBlogSlugs } from '@/lib/contentful'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export async function generateStaticParams() {
  const [nlSlugs, enSlugs] = await Promise.all([
    getAllBlogSlugs('nl'),
    getAllBlogSlugs('en'),
  ])
  return [
    ...nlSlugs.map(slug => ({ locale: 'nl', slug })),
    ...enSlugs.map(slug => ({ locale: 'en', slug })),
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const post = await getBlogPost(slug, locale)
  if (!post) return {}
  const isEn = locale === 'en'
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://onvanta.io${isEn ? `/en/blog/${slug}` : `/blog/${slug}`}` },
    openGraph: { title: post.title, description: post.description, images: [ogImage] },
  }
}

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-GB' : 'nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function estimateReadTime(body: unknown): number {
  if (!body) return 1
  const text = JSON.stringify(body)
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

const richTextOptions = {
  renderNode: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.PARAGRAPH]: (_: unknown, children: any) => (
      <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.85, fontWeight: 300, marginBottom: 20 }}>{children}</p>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.HEADING_1]: (_: unknown, children: any) => (
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#0f0f0e', lineHeight: 1.2, marginBottom: 20, marginTop: 40 }}>{children}</h1>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.HEADING_2]: (_: unknown, children: any) => (
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: '#0f0f0e', lineHeight: 1.3, marginBottom: 16, marginTop: 36 }}>{children}</h2>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.HEADING_3]: (_: unknown, children: any) => (
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: '#0f0f0e', lineHeight: 1.3, marginBottom: 12, marginTop: 28 }}>{children}</h3>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.UL_LIST]: (_: unknown, children: any) => (
      <ul style={{ paddingLeft: 24, marginBottom: 20 }}>{children}</ul>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.OL_LIST]: (_: unknown, children: any) => (
      <ol style={{ paddingLeft: 24, marginBottom: 20 }}>{children}</ol>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.LIST_ITEM]: (_: unknown, children: any) => (
      <li style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.8, fontWeight: 300, marginBottom: 4 }}>{children}</li>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.QUOTE]: (_: unknown, children: any) => (
      <blockquote style={{ borderLeft: '3px solid #1a5fd4', paddingLeft: 20, margin: '28px 0', fontStyle: 'italic', color: '#5a5a58' }}>{children}</blockquote>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [BLOCKS.HR]: () => (
      <hr style={{ border: 'none', borderTop: '1px solid #e8e7e2', margin: '36px 0' }} />
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [INLINES.HYPERLINK]: (node: any, children: any) => (
      <a href={node.data.uri} style={{ color: '#1a5fd4', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{children}</a>
    ),
  },
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const isEn = locale === 'en'
  const post = await getBlogPost(slug, locale)

  if (!post) notFound()

  const readTime = estimateReadTime(post.body)

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 600px) {
          .post-body { padding: 0 20px 80px !important; }
          .post-hero { padding: 48px 20px 36px !important; }
        }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <section className="post-hero" style={{ maxWidth: 760, margin: '0 auto', padding: '64px 40px 40px' }}>
        <Link
          href="/blog"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#1a5fd4', textDecoration: 'none', marginBottom: 32, fontWeight: 500 }}
        >
          ← {isEn ? 'Back to blog' : 'Terug naar blog'}
        </Link>

        {post.tags?.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {post.tags.map((tag: string) => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase', background: '#e8f0fc', color: '#1a5fd4', padding: '3px 9px', borderRadius: 20 }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 400, lineHeight: 1.15, color: '#0f0f0e', marginBottom: 20 }}>
          {post.title}
        </h1>

        {post.description && (
          <p style={{ fontSize: 18, fontWeight: 300, color: '#5a5a58', lineHeight: 1.7, marginBottom: 20 }}>
            {post.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#7a7a78', paddingBottom: 32, borderBottom: '1px solid #e8e7e2' }}>
          <span>{formatDate(post.date, locale)}</span>
          <span>·</span>
          <span>{readTime} {isEn ? 'min read' : 'min leestijd'}</span>
        </div>
      </section>

      {/* Body */}
      <article className="post-body" style={{ maxWidth: 760, margin: '0 auto', padding: '36px 40px 100px' }}>
        {post.body ? documentToReactComponents(post.body, richTextOptions) : null}
      </article>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
