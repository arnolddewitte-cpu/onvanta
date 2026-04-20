import { createClient } from 'contentful'

export type BlogPost = {
  id: string
  title: string
  slug: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
  date: string
  tags: string[]
}

function cfLocale(locale: string): string {
  return locale === 'en' ? 'en-US' : 'nl'
}

function getClient() {
  const space = process.env.CONTENTFUL_SPACE_ID
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
  if (!space || !accessToken) {
    console.warn('[Contentful] Missing env vars — CONTENTFUL_SPACE_ID:', !!space, 'CONTENTFUL_ACCESS_TOKEN:', !!accessToken)
    return null
  }
  return createClient({ space, accessToken })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(item: any): BlogPost {
  return {
    id: item.sys.id,
    title: item.fields.title ?? '',
    slug: item.fields.slug ?? '',
    description: item.fields.description ?? '',
    body: item.fields.body ?? null,
    date: item.fields.date ?? '',
    tags: item.fields.tags ?? [],
  }
}

export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  console.log('[Contentful] getBlogPosts — locale:', locale, '→', cfLocale(locale))
  const client = getClient()
  if (!client) return []
  try {
    const res = await client.getEntries({
      content_type: 'blogPost',
      locale: cfLocale(locale),
      order: ['-fields.date' as 'fields.date'],
    })
    console.log('[Contentful] getBlogPosts — total:', res.total, 'items:', res.items.length)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.items.map((item: any) => mapPost(item))
  } catch (err) {
    console.error('[Contentful] getBlogPosts error:', err)
    return []
  }
}

export async function getBlogPost(slug: string, locale: string): Promise<BlogPost | null> {
  console.log('[Contentful] getBlogPost — slug:', slug, 'locale:', cfLocale(locale))
  const client = getClient()
  if (!client) return null
  try {
    const res = await client.getEntries({
      content_type: 'blogPost',
      locale: cfLocale(locale),
      'fields.slug': slug,
      limit: 1,
    })
    if (!res.items.length) {
      console.log('[Contentful] getBlogPost — not found:', slug)
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapPost(res.items[0] as any)
  } catch (err) {
    console.error('[Contentful] getBlogPost error:', err)
    return null
  }
}

export async function getAllBlogSlugs(locale: string): Promise<string[]> {
  const client = getClient()
  if (!client) return []
  try {
    const res = await client.getEntries({
      content_type: 'blogPost',
      locale: cfLocale(locale),
      select: ['fields.slug'],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.items.map((item: any) => item.fields.slug ?? '').filter(Boolean)
  } catch (err) {
    console.error('[Contentful] getAllBlogSlugs error:', err)
    return []
  }
}
