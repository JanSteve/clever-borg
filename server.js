const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { getMovie, generatePosterSvg, generateBackdropSvg } = require('./poster-generator.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MOVIES_DIR = path.join(__dirname, 'movies');

// Ensure movies directory exists
if (!fs.existsSync(MOVIES_DIR)) {
  fs.mkdirSync(MOVIES_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.vtt': 'text/vtt; charset=UTF-8',
  '.srt': 'text/plain; charset=UTF-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v'
};

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mkv', '.mov', '.m4v']);

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Get list of movies currently inside movies/
function getMovieList() {
  try {
    if (!fs.existsSync(MOVIES_DIR)) return [];
    const files = fs.readdirSync(MOVIES_DIR);
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return VIDEO_EXTENSIONS.has(ext);
      })
      .map(file => {
        const filePath = path.join(MOVIES_DIR, file);
        const stats = fs.statSync(filePath);
        const isDemo = file.toLowerCase().includes('sample') || file.toLowerCase().includes('demo');
        return {
          filename: file,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          mtime: stats.mtime,
          isDemo,
          streamUrl: `/api/stream?file=${encodeURIComponent(file)}`
        };
      })
      .sort((a, b) => {
        // Prioritize user's uploaded non-demo movies first
        if (a.isDemo && !b.isDemo) return 1;
        if (!a.isDemo && b.isDemo) return -1;
        return b.mtime - a.mtime;
      });
  } catch (err) {
    console.error('Error reading movies directory:', err);
    return [];
  }
}

// Stream video with HTTP 206 Partial Content (Range request)
function handleStreamRequest(req, res, query) {
  const movies = getMovieList();
  let targetFile = query.file;

  // Find user's movie (non-demo) if available
  const userMovie = movies.find(m => !m.isDemo);

  // If no file specified, or file doesn't exist on disk, use user's movie (or first available)
  if (!targetFile || !fs.existsSync(path.join(MOVIES_DIR, path.basename(targetFile)))) {
    if (userMovie) {
      targetFile = userMovie.filename;
    } else if (movies.length > 0) {
      targetFile = movies[0].filename;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No video files available in movies directory.' }));
    }
  }

  // Prevent directory traversal attacks
  const safeFilename = path.basename(targetFile);
  const filePath = path.join(MOVIES_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    // Fallback to first available file
    if (movies.length > 0) {
      targetFile = movies[0].filename;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: `File not found: ${safeFilename}` }));
    }
  }

  const resolvedPath = path.join(MOVIES_DIR, path.basename(targetFile));
  const stat = fs.statSync(resolvedPath);
  const fileSize = stat.size;
  const ext = path.extname(safeFilename).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'video/mp4';

  const range = req.headers.range;

  if (range) {
    // Range header format: "bytes=start-end"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`,
        'Content-Type': 'text/plain'
      });
      return res.end('Requested range not satisfiable');
    }

    const chunkSize = (end - start) + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    stream.pipe(res);
    stream.on('error', err => {
      console.error('Stream read error:', err);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end();
      }
    });
  } else {
    // Normal initial request (full file header or range-capable probe)
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

// Handle video file upload via direct stream (supports drag-and-drop / file upload)
function handleUploadRequest(req, res) {
  let filename = req.headers['x-filename'];
  if (!filename) {
    // Fallback: derive from timestamp
    filename = `user-movie-${Date.now()}.mp4`;
  }
  const safeFilename = path.basename(decodeURIComponent(filename));
  const targetPath = path.join(MOVIES_DIR, safeFilename);

  console.log(`[Upload] Receiving file: ${safeFilename}...`);
  const writeStream = fs.createWriteStream(targetPath);

  req.pipe(writeStream);

  req.on('error', err => {
    console.error('Upload stream error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to upload file' }));
  });

  writeStream.on('finish', () => {
    const stats = fs.statSync(targetPath);
    console.log(`[Upload] Saved ${safeFilename} (${formatBytes(stats.size)})`);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      success: true,
      filename: safeFilename,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      message: 'Movie uploaded and ready to stream!'
    }));
  });

  writeStream.on('error', err => {
    console.error('Upload write error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to write file on server' }));
  });
}

// Main HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, X-Filename');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API: Get movie list
  if (pathname === '/api/movies' && req.method === 'GET') {
    const movies = getMovieList();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      storagePath: MOVIES_DIR,
      movies: movies
    }));
  }

  // API: Video streaming
  if (pathname === '/api/stream' && req.method === 'GET') {
    return handleStreamRequest(req, res, parsedUrl.query);
  }

  // API: Video upload
  if (pathname === '/api/upload' && req.method === 'POST') {
    return handleUploadRequest(req, res);
  }

  // API: TMDB Global Search Proxy
  if (pathname === '/api/tmdb/search' && req.method === 'GET') {
    const q = (parsedUrl.query.q || '').trim();
    if (!q) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ results: [] }));
    }
    const TMDBService = require('./public/js/tmdb-service.js');
    TMDBService.searchTmdb(q).then(results => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results }));
    }).catch(err => {
      console.error('TMDB search error:', err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results: [] }));
    });
    return;
  }

  // API: TMDB Movie Details Proxy
  if (pathname.startsWith('/api/tmdb/movie/') && req.method === 'GET') {
    const tmdbId = pathname.replace('/api/tmdb/movie/', '');
    const TMDBService = require('./public/js/tmdb-service.js');
    TMDBService.getMovieDetails(tmdbId).then(movie => {
      if (!movie) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Movie not found' }));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ movie }));
    }).catch(err => {
      console.error('TMDB details error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch movie details' }));
    });
    return;
  }

  // API: Dynamic Cinema Poster SVG (0ms, 100% reliable, zero external network dependency)
  if (pathname.startsWith('/api/poster/')) {
    const id = pathname.replace('/api/poster/', '').replace(/\.svg$/, '');
    const movie = getMovie(id);
    const svg = generatePosterSvg(movie);
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(svg);
  }

  // API: Dynamic Cinema Backdrop SVG (16:9 widescreen)
  if (pathname.startsWith('/api/backdrop/')) {
    const id = pathname.replace('/api/backdrop/', '').replace(/\.svg$/, '');
    const movie = getMovie(id);
    const svg = generateBackdropSvg(movie);
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(svg);
  }

  // SEO: Dynamic Robots.txt
  if (pathname === '/robots.txt' && req.method === 'GET') {
    const robots = `User-agent: *\nAllow: /\nSitemap: http://${req.headers.host || 'localhost:3001'}/sitemap.xml\n`;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end(robots);
  }

  // SEO: Dynamic XML Sitemap for Google & Bing indexing
  if (pathname === '/sitemap.xml' && req.method === 'GET') {
    const host = req.headers.host || 'localhost:3001';
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${proto}://${host}`;
    const { MOVIES_CATALOG } = require('./public/js/movies-data.js');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    (MOVIES_CATALOG || []).forEach(m => {
      if (!m.hidden && m.slug !== 'a-moment-to-remember' && m.id !== '15859') {
        xml += `  <url><loc>${baseUrl}/#movie/${m.slug || m.id}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
      }
    });

    xml += `</urlset>`;
    res.writeHead(200, { 'Content-Type': 'application/xml; charset=UTF-8' });
    return res.end(xml);
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA if not found
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

let currentPort = parseInt(process.env.PORT || '3000', 10);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${currentPort} is in use. Trying port ${currentPort + 1}...`);
    currentPort += 1;
    server.listen(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(currentPort, () => {
  console.log(`====================================================`);
  console.log(`🎬 NovaFlix Worldwide Movie Platform is Running!`);
  console.log(`📡 URL: http://localhost:${currentPort}`);
  console.log(`📂 Movie Storage Directory: ${MOVIES_DIR}`);
  console.log(`====================================================`);
});
