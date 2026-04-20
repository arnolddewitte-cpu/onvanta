import Link from 'next/link'
import { ogImage } from '@/lib/seo'
import { getBlogPosts } from '@/lib/contentful'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  const title = 'Blog'
  const description = isEn
    ? 'Insights on onboarding, team growth and HR — from the Onvanta team.'
    : 'Inzichten over onboarding, teamgroei en HR — van het Onvanta team.'
  return {
    title,
    description,
    alternates: { canonical: `https://onvanta.io${isEn ? '/en/blog' : '/blog'}` },
    openGraph: { title, description, images: [ogImage] },
  }
}

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-GB' : 'nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  const posts = await getBlogPosts(locale)

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .blog-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .blog-grid { grid-template-columns: 1fr; }
          .blog-hero { padding: 48px 20px 40px !important; }
          .blog-body { padding: 0 20px 80px !important; }
        }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <section className="blog-hero" style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          Blog
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: '#0f0f0e', marginBottom: 16 }}>
          {isEn ? 'Insights on onboarding' : 'Inzichten over onboarding'}
        </h1>
        <p style={{ fontSize: 17, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
          {isEn
            ? 'Practical articles on onboarding, team growth and HR — from the Onvanta team.'
            : 'Praktische artikelen over onboarding, teamgroei en HR — van het Onvanta team.'}
        </p>
      </section>

      {/* Posts grid */}
      <section className="blog-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 100px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1.5px dashed #e8e7e2', borderRadius: 16 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✍️</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#0f0f0e', marginBottom: 8 }}>
              {isEn ? 'No posts yet' : 'Nog geen artikelen'}
            </h2>
            <p style={{ fontSize: 15, color: '#7a7a78', lineHeight: 1.7 }}>
              {isEn
                ? 'We\'re working on our first articles. Check back soon.'
                : 'We werken aan onze eerste artikelen. Kom snel terug.'}
            </p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article style={{
                  background: '#fff',
                  border: '1px solid #e8e7e2',
                  borderRadius: 16,
                  padding: '28px 28px 24px',
                  height: '100%',
                  transition: 'box-shadow .15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.07)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {post.tags?.length > 0 && (
                    <div style={{ marginBottom: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {post.tags.map((tag: string) => (
                        <span key={tag} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase', background: '#e8f0fc', color: '#1a5fd4', padding: '3px 9px', borderRadius: 20 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: '#0f0f0e', lineHeight: 1.3, marginBottom: 10 }}>
                    {post.title}
                  </h2>
                  {post.description && (
                    <p style={{ fontSize: 14, color: '#5a5a58', lineHeight: 1.7, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontSize: 13, color: '#7a7a78' }}>{formatDate(post.date, locale)}</span>
                    <span style={{ fontSize: 13, color: '#1a5fd4', fontWeight: 500 }}>
                      {isEn ? 'Read more →' : 'Lees meer →'}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
