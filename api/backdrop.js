const { getMovie, generateBackdropSvg } = require('../poster-generator.js');

module.exports = (req, res) => {
  const id = req.query.id || 'default';
  const movie = getMovie(id);
  const svg = generateBackdropSvg(movie);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(svg);
};
