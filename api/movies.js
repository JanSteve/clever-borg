const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const moviesDir = path.join(process.cwd(), 'movies');
    let files = [];
    if (fs.existsSync(moviesDir)) {
      files = fs.readdirSync(moviesDir)
        .filter(f => /\.(mp4|webm|mkv|mov|m4v)$/i.test(f))
        .map(f => ({
          filename: f,
          isDemo: f.toLowerCase().includes('sample') || f.toLowerCase().includes('demo'),
          streamUrl: `/api/stream?file=${encodeURIComponent(f)}`
        }));
    }
    res.status(200).json({ count: files.length, movies: files });
  } catch (err) {
    res.status(200).json({ count: 0, movies: [] });
  }
};
