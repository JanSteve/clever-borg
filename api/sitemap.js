const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  try {
    const dataFilePath = path.join(process.cwd(), 'public/js/movies-data.js');
    let code = fs.readFileSync(dataFilePath, 'utf8');
    code = code.replace('const KOREAN_MOVIES_CATALOG', 'global._SITEMAP_CATALOG');
    eval(code);
    const catalog = global._SITEMAP_CATALOG || [];

    const baseUrl = 'https://novaflix.vercel.app';
    const today = new Date().toISOString().split('T')[0];

    const urls = [
      `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`
    ];

    catalog
      .filter(m => !m.hidden && m.id !== '15859' && m.slug !== 'a-moment-to-remember')
      .forEach(m => {
        const slug = m.slug || m.id;
        urls.push(`  <url>\n    <loc>${baseUrl}/#movie/${encodeURIComponent(slug)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
      });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.status(200).send(sitemap);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
};
