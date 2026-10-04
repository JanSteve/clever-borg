/**
 * Cinexa Telegram Channel Master Auto-Poster & Viral Growth Engine
 * Automatically posts top-rated, trending 2024-2026 films & series every 10 minutes
 * with 4K posters, comprehensive IMDb details, multi-audio info, Telegram Global Search SEO Index,
 * and high-converting direct watch & Monetag monetization buttons.
 */

const https = require('https');
const catalog = require('../public/js/movies-data.js');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // e.g. "@cinexafilms" or "-100123456789"
const BASE_URL = 'https://cinexa-films.vercel.app';
const MONETAG_DIRECT_LINK = process.env.MONETAG_DIRECT_LINK || 'https://omg10.com/4/11952303';

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('⚠️ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID environment variables.');
  console.log('Ensure these secrets are set in GitHub Repository Settings -> Secrets -> Actions.');
  process.exit(1);
}

// Telegram Channel Public Username / Link for referrals
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

/**
 * Generates compact high-converting Telegram Global Search SEO keywords (kept under length budget)
 */
function generateTelegramSearchSEO(film) {
  const sanitize = tag => tag.replace(/[^a-zA-Z0-9]/g, '');
  const titleClean = film.title.replace(/[:\-–—]/g, ' ').replace(/\s+/g, ' ').trim();
  const rawClean = sanitize(titleClean);
  const year = film.year || '2025';

  const hashtags = `#${rawClean} #${rawClean}HindiDubbed #${rawClean}4K #${rawClean}Download #4KMovies #HindiDubbed #DualAudio #WatchFree #Cinexa`;
  const searchQueries = `🔍 <i>${titleClean} Full Movie Download | ${titleClean} in Hindi Dubbed 4K | ${titleClean} Watch Online</i>`;

  return { hashtags, searchQueries };
}

function getRatingStars(rating) {
  const num = parseFloat(rating) || 8.0;
  if (num >= 8.5) return '⭐️⭐️⭐️⭐️⭐️ (Must Watch)';
  if (num >= 7.5) return '⭐️⭐️⭐️⭐️ (Super Hit)';
  return '⭐️⭐️⭐️⭐️ (Popular)';
}

async function postFeaturedFilm() {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    console.error('Catalog is empty.');
    process.exit(1);
  }

  // Curate highest-rated and top trending titles across 5 rotation tiers
  const currentMinute = new Date().getUTCMinutes();
  const rotationSlot = Math.floor(currentMinute / 10) % 5;
  
  let candidatePool = [];

  if (rotationSlot === 0) {
    // 🌟 Top 4K Hollywood Blockbusters (2024-2026)
    candidatePool = catalog.filter(m => (m.category === 'hollywood' || !m.isSeries) && (parseFloat(m.imdbRating) >= 7.8 || parseInt(m.year) >= 2024));
  } else if (rotationSlot === 1) {
    // 🇮🇳 Top Bollywood & Pan-India South Blockbusters
    candidatePool = catalog.filter(m => (m.category === 'bollywood' || m.category === 'south' || (m.audio && m.audio.includes('Hindi'))) && parseInt(m.year) >= 2023);
  } else if (rotationSlot === 2) {
    // 📺 Top Trending Web Series & OTT Originals (Netflix, Prime, HBO, Disney)
    candidatePool = catalog.filter(m => (m.type === 'tv' || m.isSeries || m.category === 'series') && parseInt(m.year) >= 2023);
  } else if (rotationSlot === 3) {
    // 🎌 Premier Anime & Global Animations (Solo Leveling, Demon Slayer, Ghibli, etc.)
    candidatePool = catalog.filter(m => m.category === 'anime' || (m.genres && m.genres.includes('Animation')));
  } else {
    // 💎 All-Time Masterpieces & 4K IMAX Hits
    candidatePool = catalog.filter(m => parseFloat(m.imdbRating) >= 8.4);
  }

  // Fallbacks
  if (candidatePool.length === 0) {
    candidatePool = catalog.filter(m => parseInt(m.year) >= 2024);
  }
  if (candidatePool.length === 0) {
    candidatePool = catalog;
  }

  const film = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  const isSeries = film.type === 'tv' || film.isSeries;
  const badge = isSeries 
    ? '📺 TOP TRENDING SERIES' 
    : '🎬 4K THEATRICAL RELEASE';

  const audioInfo = film.audio || 'Multi-Audio (Hindi 5.1 + English + Tamil + Telugu)';
  const genreList = Array.isArray(film.genres) ? film.genres.slice(0, 3).join(' • ') : 'Action • Sci-Fi';
  const ratingStars = getRatingStars(film.imdbRating);
  const durationText = isSeries 
    ? `${film.seasons || 'Complete'} Seasons • All Episodes` 
    : (film.duration || '2h 15m');
  
  const synopsisClean = (film.synopsis || film.overview || film.tagline || 'Experience high-octane cinema in ultra 4K UHD with multi-server failover.').slice(0, 140);

  const { hashtags, searchQueries } = generateTelegramSearchSEO(film);

  const watchUrl = `${BASE_URL}?q=${encodeURIComponent(film.title)}`;
  const shareText = `🔥 Watch "${film.title}" in 4K Ultra HD for free on Cinexa! Join our Telegram for 10-min 4K releases: ${channelJoinUrl}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(watchUrl)}&text=${encodeURIComponent(shareText)}`;

  // Strict length budget under 850 chars for Telegram sendPhoto 1024-char limit
  const caption = 
`🍿 <b>CINEXA 4K PREMIERE DROPS</b> 🍿

✨ <b>${film.title.toUpperCase()} (${film.year || '2025'})</b>
🏷 <i>${badge}</i>

⭐ <b>IMDb:</b> ${film.imdbRating || '8.5'}/10 • ${ratingStars}
⏱ <b>Format:</b> ${durationText}
🎭 <b>Genres:</b> ${genreList}
🔊 <b>Audio:</b> ${audioInfo}
⚡ <b>Quality:</b> 4K Ultra HD (2160p) • HDR10 • Dolby 5.1

📝 <i>"${synopsisClean}..."</i>

━━━━━━━━━━━━━━━━━━━━━
${searchQueries}

${hashtags}
━━━━━━━━━━━━━━━━━━━━━
👇 <b>Tap below to stream or download in 4K:</b>`;

  const inlineKeyboard = [
    [
      { text: '▶ Watch in 4K Ultra HD', url: watchUrl },
      { text: '📥 4K Direct Download / Mirror', url: MONETAG_DIRECT_LINK }
    ],
    [
      { text: '👥 Share with Friends (Viral)', url: telegramShareUrl },
      { text: '🔔 Subscribe for 10-Min Drops', url: channelJoinUrl }
    ]
  ];

  const poster = film.posterUrl || film.poster || film.backdropUrl || 'https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg';

  console.log(`📡 Sending "${film.title}" (${film.year}) [${badge}] to Channel: ${CHANNEL_ID}... Caption length: ${caption.length}`);

  try {
    const response = await sendTelegramPhoto(poster, caption, inlineKeyboard);
    if (response.ok) {
      console.log('✅ Successfully posted 4K photo & caption to Telegram Channel!');
    } else {
      console.warn('⚠️ sendPhoto failed, attempting fallback text message...', response);
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
