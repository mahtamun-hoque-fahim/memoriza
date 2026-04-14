// app/sitemap.ts
import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/sign-in`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
