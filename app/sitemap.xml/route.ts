import { NextResponse } from 'next/server'
import projectsData from '@/app/data/projects.json'
import { ProjectItem } from '@/lib/types'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const projects = projectsData as ProjectItem[]

  const staticRoutes = [
    '',
    '/news',
    '/jobs',
    '/events',
    '/projects',
    '/contribute',
    '/about',
  ]

  const projectRoutes = projects.map(project => `/projects/${project.slug}`)

  const allRoutes = [...staticRoutes, ...projectRoutes]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '' ? '1.0' : route.includes('/projects/') ? '0.7' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}