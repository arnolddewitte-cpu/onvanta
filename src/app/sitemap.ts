import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://onvanta.io'
  const lastModified = new Date()

  return [
    // Nederlands (default, geen prefix)
    { url: `${baseUrl}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },

    // Engels (/en prefix)
    { url: `${baseUrl}/en`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/en/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/en/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/en/contact`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/en/faq`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/en/signup`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/en/login`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/en/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/en/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
