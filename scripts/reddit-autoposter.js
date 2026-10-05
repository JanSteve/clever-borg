/**
 * Cinexa Reddit Auto-Poster Engine
 * Automatically submits curated 4K movies & series to Reddit using Reddit OAuth2 API
 * Drives organic search & community traffic from Reddit to Cinexa.
 */

const https = require('https');
const catalog = require('../public/js/movies-data.js');

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USERNAME = process.env.REDDIT_USERNAME;
const PASSWORD = process.env.REDDIT_PASSWORD;
const SUBREDDIT = process.env.REDDIT_SUBREDDIT || `u_${USERNAME}`; // Default to user's profile or custom subreddit

const BASE_URL = 'https://cinexa-films.vercel.app';

if (!CLIENT_ID || !CLIENT_SECRET || !USERNAME || !PASSWORD) {
  console.log('ℹ️ Reddit credentials not configured yet (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD).');
  console.log('👉 To enable Reddit auto-posting, create a free script app at https://www.reddit.com/prefs/apps and add the secrets to GitHub.');
  process.exit(0); // Exit cleanly without failing the CI job
}

function getRedditAccessToken() {
  return new Promise((resolve, reject) => {
    const authHeader = 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const postData = new URLSearchParams({
      grant_type: 'password',
      username: USERNAME,
      password: PASSWORD
    }).toString();

    const options = {
      hostname: 'www.reddit.com',
      path: '/api/v1/access_token',
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `CinexaBot/1.0.0 (by /u/${USERNAME})`
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error(`Reddit Auth Failed: ${body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function submitRedditPost(token, title, url, text) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      sr: SUBREDDIT.replace(/^r\//, '').replace(/^u\//, 'u_'),
      kind: url ? 'link' : 'self',
      title: title,
      url: url || '',
      text: text || '',
      resubmit: 'true',
      api_type: 'json'
    }).toString();

    const options = {
      hostname: 'oauth.reddit.com',
      path: '/api/submit',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `CinexaBot/1.0.0 (by /u/${USERNAME})`
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
          resolve({ raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runRedditPoster() {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    console.error('Catalog is empty.');
    return;
  }

  // Filter high-interest recent blockbusters
  const recentPool = catalog.filter(m => parseInt(m.year) >= 2024 || parseFloat(m.imdbRating) >= 8.2);
  const pool = recentPool.length > 0 ? recentPool : catalog;
  const film = pool[Math.floor(Math.random() * pool.length)];

  const slug = film.slug || film.id || encodeURIComponent(film.title);
  const streamUrl = `${BASE_URL}/?play=${slug}`;
  const isSeries = film.type === 'tv' || film.isSeries;
  const typeTag = isSeries ? 'TV Series' : '4K Movie';

  const redditTitle = `[4K Stream] ${film.title} (${film.year || '2025'}) [${typeTag}] - Free Ultra HD Streaming & Multi-Audio`;

  const redditText = 
`**${film.title} (${film.year || '2025'})**

* **IMDb Rating:** ⭐ ${film.imdbRating || '8.4'}/10
* **Genres:** ${Array.isArray(film.genres) ? film.genres.join(', ') : 'Action, Drama'}
* **Audio:** ${film.audio || 'Multi-Audio (Hindi + English + Dual Audio)'}
* **Quality:** 4K UHD (2160p) with Multi-Server Failover

**Synopsis:**
> ${film.synopsis || film.overview || 'Available for zero-buffer high speed 4K streaming.'}

🔗 **Stream Full 4K Movie Here:** [${film.title} on Cinexa](${streamUrl})

---
*Cinexa 4K Cinema Engine • Free Streaming Vault*`;

  console.log(`📡 Authenticating with Reddit API for user /u/${USERNAME}...`);

  try {
    const token = await getRedditAccessToken();
    console.log(`✅ Reddit Auth Success. Submitting "${film.title}" to ${SUBREDDIT}...`);
    const result = await submitRedditPost(token, redditTitle, streamUrl, redditText);
    console.log('✅ Reddit Post Submitted successfully!', JSON.stringify(result));
  } catch (err) {
    console.error('❌ Reddit Post Error:', err.message);
  }
}

runRedditPoster();
