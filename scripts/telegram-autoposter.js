/**
 * Cinexa Telegram Channel Viral Auto-Poster & Growth Engine
 * Automatically posts trending 2024-2026 films & series with 4K posters,
 * high-ranking SEO hashtags, deep-links, and viral share triggers every hour.
 */

const https = require('https');
const catalog = require('../public/js/movies-data.js');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // e.g. "@cinexafilms" or "-100123456789"
const BASE_URL = 'https://cinexa-films.vercel.app';

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('⚠️ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID environment variables.');
  console.log('Ensure these secrets are set in GitHub Repository Settings -> Secrets -> Actions.');
  process.exit(1);
}

// Telegram Channel Public Username / Link for viral referrals
const cleanChannelHandle = CHANNEL_ID.startsWith('@') 
  ? CHANNEL_ID.replace('@', '') 
  : '';
const channelJoinUrl = cleanChannelHandle 
  ? `https://t.me/${cleanChannelHandle}` 
  : BASE_URL;

function sendTelegramPhoto(photoUrl, caption, inlineKeyboard) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: CHANNEL_ID,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard
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

    req.on('error', err => reject(err));
    req.write(payload);
    req.end();
  });
}

function sendTelegramMessage(text, inlineKeyboard) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: CHANNEL_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
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

    req.on('error', err => reject(err));
    req.write(payload);
    req.end();
  });
}

function generateViralHashtags(film) {
  const sanitize = tag => tag.replace(/[^a-zA-Z0-9]/g, '');
  const titleTag = '#' + sanitize(film.title);
  const yearTag = film.year ? `#Year${film.year}` : '#2025';
  
  const genreTags = Array.isArray(film.genres) 
    ? film.genres.slice(0, 3).map(g => '#' + sanitize(g)).join(' ')
    : '#Action #SciFi';

  const baseTrendingTags = '#Trending #MovieHub #WatchOnline #4KMovies #HindiDubbed #EnglishMovies #OTTReleases';
  return `${titleTag} ${yearTag} ${genreTags} ${baseTrendingTags}`;
}

async function postFeaturedFilm() {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    console.error('Catalog is empty.');
    process.exit(1);
  }

  // 1. Hourly category rotation to keep posts varied and appealing to different audiences
  const currentHour = new Date().getUTCHours();
  let candidatePool = [];

  if (currentHour % 4 === 0) {
    // Hollywood 4K Blockbusters
    candidatePool = catalog.filter(m => (m.category === 'hollywood' || !m.isSeries) && parseInt(m.year) >= 2024);
  } else if (currentHour % 4 === 1) {
    // Bollywood & South Cinema
    candidatePool = catalog.filter(m => (m.category === 'bollywood' || m.category === 'south' || (m.audio && m.audio.includes('Hindi'))) && parseInt(m.year) >= 2024);
  } else if (currentHour % 4 === 2) {
    // Anime & Global Hits
    candidatePool = catalog.filter(m => m.category === 'anime' || (m.genres && m.genres.includes('Animation')));
  } else {
    // Hot OTT & Web Series
    candidatePool = catalog.filter(m => m.type === 'tv' || m.isSeries || m.category === 'series');
  }

  // Fallback to full recent catalog if category pool is empty
  if (candidatePool.length === 0) {
    candidatePool = catalog.filter(m => parseInt(m.year) >= 2024);
  }
  if (candidatePool.length === 0) {
    candidatePool = catalog;
  }

  const film = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  const isSeries = film.type === 'tv' || film.isSeries;
  const typeTag = isSeries ? '📺 Web Series / OTT Original' : '🎬 4K Cinema Release';
  const audioInfo = film.audio || 'Multi-Audio (Hindi / English / Tamil / Telugu)';
  const genreList = Array.isArray(film.genres) ? film.genres.join(' • ') : 'Action • Sci-Fi';
  const hashtags = generateViralHashtags(film);

  const watchUrl = `${BASE_URL}?q=${encodeURIComponent(film.title)}`;
  const shareText = `🔥 Watch "${film.title}" in 4K Ultra HD for free on Cinexa! Join our Telegram for hourly 4K releases: ${channelJoinUrl}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(watchUrl)}&text=${encodeURIComponent(shareText)}`;

  const caption = 
`🍿 <b>NOW STREAMING ON CINEXA</b> 🍿

🎬 <b>${film.title} (${film.year || '2025'})</b>
🏷 <i>${typeTag}</i>

⭐ <b>IMDb:</b> ${film.imdbRating || '8.4'}/10  |  ⏱ <b>Duration:</b> ${film.duration || '2h 15m'}
🎭 <b>Genres:</b> ${genreList}
🔊 <b>Audio:</b> ${audioInfo}
⚡ <b>Stream Quality:</b> Ultra HD 4K • Dolby 5.1 • 8 High-Speed CDN Servers

📝 <i>"${(film.synopsis || film.tagline || 'Experience cinema master in ultra high-definition with zero buffering.').slice(0, 300)}..."</i>

━━━━━━━━━━━━━━━━━━━━
${hashtags}
━━━━━━━━━━━━━━━━━━━━
👇 <b>Tap below to watch or share with friends:</b>`;

  const inlineKeyboard = [
    [
      { text: '▶ Watch in 4K Ultra HD', url: watchUrl },
      { text: '⚡ Switch Server', url: watchUrl }
    ],
    [
      { text: '👥 Share with Friends (Viral)', url: telegramShareUrl },
      { text: '🔔 Join Channel for Hourly 4K', url: channelJoinUrl }
    ]
  ];

  const poster = film.posterUrl || film.poster || film.backdropUrl || 'https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg';

  console.log(`📡 Sending "${film.title}" (${film.year}) to Telegram Channel: ${CHANNEL_ID}...`);

  try {
    const response = await sendTelegramPhoto(poster, caption, inlineKeyboard);
    if (response.ok) {
      console.log('✅ Successfully posted photo & details to Telegram Channel!');
    } else {
      console.warn('⚠️ sendPhoto failed, attempting fallback text message...', response);
      // Fallback if image fails to load
      const fallbackResponse = await sendTelegramMessage(caption, inlineKeyboard);
      if (fallbackResponse.ok) {
        console.log('✅ Fallback text message successfully sent to channel!');
      } else {
        console.error('❌ Failed to send fallback message:', fallbackResponse);
      }
    }
  } catch (err) {
    console.error('❌ Network / Request Error:', err.message);
  }
}

postFeaturedFilm();
