import { createClient } from 'contentful'
import type { EntryFieldTypes } from 'contentful'

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
})

export interface BlogPostFields {
  title: EntryFieldTypes.Text
  slug: EntryFieldTypes.Text
  description: EntryFieldTypes.Text
  body: EntryFieldTypes.RichText
  date: EntryFieldTypes.Date
  tags: EntryFieldTypes.Array<EntryFieldTypes.Symbol>
}

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
  return locale === 'en' ? 'en-US' : 'nl-NL'
}

export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  try {
    const res = await client.getEntries({
      content_type: 'blogPost',
      locale: cfLocale(locale),
      order: ['-fields.date'],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.items.map((item: any) => ({
      id: item.sys.id,
      title: item.fields.title ?? '',
      slug: item.fields.slug ?? '',
      description: item.fields.description ?? '',
      body: item.fields.body ?? null,
      date: item.fields.date ?? '',
      tags: item.fields.tags ?? [],
    }))
  } catch {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = res.items[0] as any
    return {
      id: item.sys.id,
      title: item.fields.title ?? '',
      slug: item.fields.slug ?? '',
      description: item.fields.description ?? '',
      body: item.fields.body ?? null,
      date: item.fields.date ?? '',
      tags: item.fields.tags ?? [],
    }
  } catch {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.items.map((item: any) => item.fields.slug ?? '').filter(Boolean)
  } catch {
    return []
  }
}
