module.exports = (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /movies/
Disallow: /api/stream

Sitemap: https://novaflix.vercel.app/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.status(200).send(robots);
};
