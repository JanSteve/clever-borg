/**
 * Auto Sitemap & Search Engine Indexing Engine
 * Generates sitemap.xml with 349+ movie deep links and keywords for Google, Bing, Yahoo, Yandex.
 */

const fs = require('fs');
const path = require('path');
const catalog = require('../public/js/movies-data.js');

const BASE_URL = 'https://cinexa-films.vercel.app';
const currentDate = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
`;

if (Array.isArray(catalog)) {
  catalog.forEach(film => {
    const slug = film.slug || film.id || film.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeTitle = (film.title || 'Movie').replace(/&/g, '&amp;');
    const poster = (film.posterUrl || film.poster || '').replace(/&/g, '&amp;');
    const synopsis = (film.synopsis || film.tagline || 'Stream in 4K UHD').replace(/&/g, '&amp;').slice(0, 200);

    xml += `  <url>
    <loc>${BASE_URL}/?play=${encodeURIComponent(slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    ${poster ? `
    <image:image>
      <image:loc>${poster}</image:loc>
      <image:title>${safeTitle}</image:title>
      <image:caption>${synopsis}</image:caption>
    </image:image>` : ''}
  </url>
`;
  });
}

xml += `</urlset>\n`;

const targetPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(targetPath, xml, 'utf8');
console.log(`✅ Successfully generated sitemap.xml with ${catalog.length} movie entries at: ${targetPath}`);
