import type { APIRoute } from 'astro';

export const prerender = true;

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/book', priority: '0.8', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = ({ site }) => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map(
      (p) =>
        `  <url><loc>${new URL(p.path, site)}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    )
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
