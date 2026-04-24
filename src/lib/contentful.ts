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

const SPACE_ID = 'm4r8wwe9iedp'
const ACCESS_TOKEN = 'lq7X8P2KiITTliBLHhIgKVRlXe9m63p8eKSic4JmaUE'

const client = createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN })

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
  try {
    const res = await client.getEntries({
      content_type: 'blogPost',
      locale: cfLocale(locale),
      order: ['-fields.date' as 'fields.date'],
    })
    return res.items.map((item: any) => mapPost(item)) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (err) {
    console.error('[Contentful] getBlogPosts error:', err)
    return []
  }
}

export async function getBlogPost(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const res = await client.getEntries({
      content_type: 'blogPost',
      locale: cfLocale(locale),
      'fields.slug': slug,
      limit: 1,
    })
    if (!res.items.length) return null
    return mapPost(res.items[0] as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (err) {
    console.error('[Contentful] getBlogPost error:', err)
    return null
  }
}

export async function getAllBlogSlugs(locale: string): Promise<string[]> {
  try {
    const res = await client.getEntries({
      content_type: 'blogPost',
      locale: cfLocale(locale),
      select: ['fields.slug'],
    })
    return res.items.map((item: any) => item.fields.slug ?? '').filter(Boolean) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (err) {
    console.error('[Contentful] getAllBlogSlugs error:', err)
    return []
  }
}
