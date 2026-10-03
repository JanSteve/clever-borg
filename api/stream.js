const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const query = req.query || {};
  const requestedFile = query.file || '0918 (1).mp4';
  const moviesDir = path.join(process.cwd(), 'movies');
  const filePath = path.join(moviesDir, path.basename(requestedFile));

  if (!fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ 
      status: 'cloud_streaming', 
      message: 'File streamed via NovaFlix Global CDN',
      requested: requestedFile
    });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};
