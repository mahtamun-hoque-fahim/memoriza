// app/robots.ts
import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/api/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
