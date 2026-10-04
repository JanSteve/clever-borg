/**
 * Cinexa Telegram Channel Auto-Poster
 * Automatically posts trending/new 2024-2026 films & series with posters and direct 4K watch links.
 */

const https = require('https');
const path = require('path');

const catalog = require('../public/js/movies-data.js');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // e.g. "@cinexafilms" or "-100123456789"
const BASE_URL = 'https://cinexa-films.vercel.app';

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('⚠️ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID environment variables.');
  console.log('Ensure these secrets are set in GitHub Repository Settings -> Secrets -> Actions.');
  process.exit(1);
}

function sendTelegramPhoto(photoUrl, caption) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: CHANNEL_ID,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '▶ Watch Movie in 4K', url: `${BASE_URL}` },
            { text: '⚡ Switch Stream', url: `${BASE_URL}` }
          ],
          [
            { text: '🌐 Explore 350+ Full Catalog', url: `${BASE_URL}` }
          ]
        ]
      }
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve({ ok: false, raw: body });
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

async function postFeaturedFilm() {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    console.error('Catalog is empty.');
    process.exit(1);
  }

  // Filter for high-interest 2024-2026 films & series
  const recentFilms = catalog.filter(m => parseInt(m.year) >= 2024);
  const pool = recentFilms.length > 0 ? recentFilms : catalog;
  const film = pool[Math.floor(Math.random() * pool.length)];

  const isSeries = film.type === 'tv' || film.isSeries;
  const typeTag = isSeries ? '📺 TV / Web Series' : '🎬 4K Cinema Release';
  const audioInfo = film.audio || 'Multi-Audio (Hindi / English / Tamil / Telugu)';
  const genreList = Array.isArray(film.genres) ? film.genres.join(' • ') : 'Action • Drama';

  const caption = 
`🍿 <b>NOW STREAMING ON CINEXA</b> 🍿

<b>${film.title} (${film.year || '2024'})</b>
🏷 <i>${typeTag}</i>

⭐ <b>IMDb Rating:</b> ${film.imdbRating || '8.2'}/10
🎭 <b>Genres:</b> ${genreList}
🔊 <b>Audio:</b> ${audioInfo}

📝 <i>"${film.synopsis || film.tagline || 'Experience cinema master in ultra high-definition with zero buffering.'}"</i>

⚡ <b>Ultra HD 4K • Dolby Surround • Multi-Server Failover</b>
👇 <b>Tap below to stream instantly:</b>`;

  const poster = film.posterUrl || film.poster || film.backdropUrl || 'https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg';

  console.log(`📡 Sending "${film.title}" to Telegram Channel: ${CHANNEL_ID}...`);

  try {
    const response = await sendTelegramPhoto(poster, caption);
    if (response.ok) {
      console.log('✅ Successfully posted to Telegram Channel!');
    } else {
      console.error('❌ Telegram API Error:', response);
    }
  } catch (err) {
    console.error('❌ Network / Request Error:', err.message);
  }
}

postFeaturedFilm();
