const fs = require('fs');
const path = require('path');

let moviesCache = null;

function getMovies() {
  if (moviesCache) return moviesCache;
  try {
    const dataFilePath = path.join(__dirname, 'public/js/movies-data.js');
    let code = fs.readFileSync(dataFilePath, 'utf8');
    code = code.replace('const KOREAN_MOVIES_CATALOG', 'global._CINEBY_CATALOG');
    eval(code);
    moviesCache = global._CINEBY_CATALOG || [];
    return moviesCache;
  } catch (err) {
    console.error('Error loading movies in poster-generator:', err);
    return [];
  }
}

function getMovie(id) {
  const movies = getMovies();
  const cleanId = String(id).toLowerCase().trim();
  return movies.find(m => m.id.toLowerCase() === cleanId || (m.slug && m.slug.toLowerCase() === cleanId)) || {
    id: cleanId,
    title: cleanId.replace(/-/g, ' ').toUpperCase(),
    koreanTitle: '한국 영화',
    year: '2024',
    rating: '15+',
    genres: ['Korean Cinema'],
    cast: ['Korean Cast'],
    director: 'Korean Cinema',
    fallbackColor: '#1a1e29'
  };
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generatePosterSvg(movie) {
  const safeTitle = escapeXml(movie.title || 'KOREAN FILM');
  const safeKorean = escapeXml(movie.koreanTitle || '한국 영화');
  const safeYear = escapeXml(movie.year || '2024');
  const safeRating = escapeXml(movie.rating || '15+');
  const isAdult = movie.is18Plus || safeRating.includes('18');
  const safeGenre = escapeXml((movie.genres && movie.genres[0]) || movie.category || 'Cinema').toUpperCase();
  const safeDirector = escapeXml(movie.director || 'Korean Director');
  const castList = movie.cast ? movie.cast.slice(0, 3).join(' • ') : 'Starring All-Star Cast';
  const safeCast = escapeXml(castList);
  const safeImdb = escapeXml(movie.imdbRating || '8.0');
  const safeMatch = escapeXml(movie.matchScore || '98% Match');
  const bgColor = movie.fallbackColor || '#18121f';

  // Festival Award Text based on movie
  let laurelAward = '★ OFFICIAL SELECTION • BUSAN INT\'L FILM FESTIVAL ★';
  if (movie.id === 'parasite') {
    laurelAward = '★ CANNES PALME D\'OR & 4X ACADEMY AWARD WINNER ★';
  } else if (movie.id === '15859') {
    laurelAward = '★ GRAND BELL AWARDS & BLUE DRAGON NOMINEE ★';
  } else if (movie.id === 'oldboy') {
    laurelAward = '★ CANNES FILM FESTIVAL GRAND PRIX WINNER ★';
  } else if (movie.id === 'decision-to-leave') {
    laurelAward = '★ CANNES FILM FESTIVAL BEST DIRECTOR WINNER ★';
  } else if (movie.id === 'the-handmaiden') {
    laurelAward = '★ BAFTA AWARDS BEST FILM NOT IN ENGLISH LANGUAGE ★';
  } else if (movie.id === 'train-to-busan') {
    laurelAward = '★ BLUE DRAGON FILM AWARDS BOX OFFICE HIT ★';
  } else if (movie.id === '12-12-the-day' || movie.id === 'exhuma') {
    laurelAward = '★ #1 BOX OFFICE SENSATION • BAEKSANG ARTS AWARDS ★';
  }

  // Genre-themed lighting
  let primaryGlow = '#e11d48';
  let accentColor = '#f43f5e';
  let gradStops = `
    <stop offset="0%" stop-color="${bgColor}"/>
    <stop offset="40%" stop-color="#120c18"/>
    <stop offset="100%" stop-color="#070509"/>
  `;

  if (safeGenre.includes('ROMANCE')) {
    primaryGlow = '#e11d48';
    accentColor = '#fb7185';
    gradStops = `
      <stop offset="0%" stop-color="${bgColor}"/>
      <stop offset="45%" stop-color="#1f0c18"/>
      <stop offset="100%" stop-color="#0a0509"/>
    `;
  } else if (safeGenre.includes('THRILLER') || safeGenre.includes('ACTION')) {
    primaryGlow = '#0284c7';
    accentColor = '#38bdf8';
    gradStops = `
      <stop offset="0%" stop-color="${bgColor}"/>
      <stop offset="45%" stop-color="#091829"/>
      <stop offset="100%" stop-color="#040911"/>
    `;
  } else if (safeGenre.includes('HORROR') || safeGenre.includes('MYSTERY')) {
    primaryGlow = '#b91c1c';
    accentColor = '#ef4444';
    gradStops = `
      <stop offset="0%" stop-color="${bgColor}"/>
      <stop offset="45%" stop-color="#1f0808"/>
      <stop offset="100%" stop-color="#090202"/>
    `;
  } else if (safeGenre.includes('COMEDY') || safeGenre.includes('DISASTER')) {
    primaryGlow = '#d97706';
    accentColor = '#f59e0b';
    gradStops = `
      <stop offset="0%" stop-color="${bgColor}"/>
      <stop offset="45%" stop-color="#1a1408"/>
      <stop offset="100%" stop-color="#090703"/>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750" width="500" height="750" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      ${gradStops}
    </linearGradient>
    <radialGradient id="stageSpotlight" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.32"/>
      <stop offset="60%" stop-color="${accentColor}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Base & Dramatic Spotlight -->
  <rect width="500" height="750" fill="url(#bgGrad)"/>
  <rect width="500" height="750" fill="url(#stageSpotlight)"/>

  <!-- Film Strip Decorative Border Frames -->
  <rect x="14" y="14" width="472" height="722" rx="10" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
  <rect x="20" y="20" width="460" height="710" rx="6" fill="none" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Perforated Film Sprocket Accents (Top & Bottom) -->
  <g fill="rgba(255,255,255,0.15)">
    <rect x="30" y="26" width="10" height="6" rx="1"/>
    <rect x="52" y="26" width="10" height="6" rx="1"/>
    <rect x="438" y="26" width="10" height="6" rx="1"/>
    <rect x="460" y="26" width="10" height="6" rx="1"/>
    <rect x="30" y="718" width="10" height="6" rx="1"/>
    <rect x="52" y="718" width="10" height="6" rx="1"/>
    <rect x="438" y="718" width="10" height="6" rx="1"/>
    <rect x="460" y="718" width="10" height="6" rx="1"/>
  </g>

  <!-- Top Streaming Header: CINEBY Brand • Age Rating • Quality -->
  <g transform="translate(32, 46)">
    <!-- Brand Box -->
    <rect x="0" y="0" width="76" height="24" rx="4" fill="#e50914"/>
    <text x="38" y="16" fill="#ffffff" font-size="11" font-weight="900" font-family="'Inter', -apple-system, sans-serif" text-anchor="middle" letter-spacing="1.2">CINEBY</text>
    
    <!-- Age Rating Pill -->
    <rect x="84" y="0" width="${isAdult ? 66 : 56}" height="24" rx="4" fill="${isAdult ? '#dc2626' : 'rgba(255,255,255,0.12)'}" stroke="${isAdult ? '#ef4444' : 'rgba(255,255,255,0.2)'}" stroke-width="1"/>
    <text x="${isAdult ? 117 : 112}" y="16" fill="#ffffff" font-size="11" font-weight="900" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="0.5">${safeRating}</text>

    <!-- 4K UHD Badge -->
    <rect x="${isAdult ? 158 : 148}" y="0" width="80" height="24" rx="4" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.5)" stroke-width="1"/>
    <text x="${isAdult ? 198 : 188}" y="16" fill="#fbbf24" font-size="10.5" font-weight="800" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="0.5">4K ULTRA</text>

    <!-- Match Score -->
    <text x="436" y="16" fill="#46d369" font-size="11.5" font-weight="800" font-family="'Inter', sans-serif" text-anchor="end">${safeMatch}</text>
  </g>

  <!-- Center Graphic Motif: Optical Cinema Rings -->
  <g transform="translate(250, 275)">
    <circle cx="0" cy="0" r="135" fill="none" stroke="${accentColor}" stroke-opacity="0.14" stroke-width="2"/>
    <circle cx="0" cy="0" r="105" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="6,4"/>
    <circle cx="0" cy="0" r="75" fill="none" stroke="${accentColor}" stroke-opacity="0.22" stroke-width="1.5"/>

    <!-- Film Projector Aperture Geometry -->
    <polygon points="0,-42 36,21 -36,21" fill="none" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5"/>
    <polygon points="0,42 -36,-21 36,-21" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <circle cx="0" cy="0" r="14" fill="${accentColor}" fill-opacity="0.6" filter="url(#softGlow)"/>
  </g>

  <!-- Award Laurel Header -->
  <g transform="translate(250, 420)">
    <text x="0" y="0" fill="url(#goldGradient)" font-size="10.5" font-weight="800" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="2.5">${laurelAward}</text>
  </g>

  <!-- Hangul Korean Original Title (Massive Impact) -->
  <g transform="translate(250, 485)">
    <text x="0" y="0" fill="${accentColor}" font-size="${safeKorean.length > 8 ? 32 : 40}" font-weight="900" font-family="'Noto Sans KR', sans-serif" text-anchor="middle" letter-spacing="4" filter="url(#softGlow)">${safeKorean}</text>
  </g>

  <!-- English Title -->
  <g transform="translate(250, 536)">
    <text x="0" y="0" fill="#ffffff" font-size="${safeTitle.length > 20 ? 22 : 27}" font-weight="900" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="-0.5">${safeTitle}</text>
  </g>

  <!-- Meta Strip: Year • Genre • IMDb Score -->
  <g transform="translate(250, 574)">
    <text x="0" y="0" fill="#cbd5e1" font-size="13" font-weight="700" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="1.5">
      ${safeYear} &bull; ${safeGenre} &bull; <tspan fill="#f59e0b">★ ${safeImdb}</tspan>
    </text>
  </g>

  <!-- Divider Line -->
  <rect x="175" y="596" width="150" height="2" rx="1" fill="#e50914" opacity="0.8"/>

  <!-- Director & Cast Credits Block -->
  <g transform="translate(250, 630)">
    <text x="0" y="0" fill="#94a3b8" font-size="10.5" font-weight="600" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="1">
      DIRECTED BY <tspan fill="#e2e8f0" font-weight="700">${safeDirector}</tspan>
    </text>
    <text x="0" y="18" fill="#64748b" font-size="10" font-weight="600" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="0.8">
      STARRING: <tspan fill="#cbd5e1" font-weight="600">${safeCast}</tspan>
    </text>
  </g>

  <!-- Bottom Technical Badges: Dolby Atmos / Sound -->
  <g transform="translate(250, 690)">
    <text x="0" y="0" fill="rgba(255,255,255,0.4)" font-size="9.5" font-weight="700" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="2.5">DOLBY ATMOS &bull; ORIGINAL KOREAN AUDIO</text>
    <text x="0" y="16" fill="rgba(255,255,255,0.25)" font-size="8.5" font-weight="600" font-family="'Inter', sans-serif" text-anchor="middle" letter-spacing="2">EXCLUSIVE CINEBY THEATRICAL PRESENTATION</text>
  </g>
</svg>`;
}

function generateBackdropSvg(movie) {
  const safeTitle = escapeXml(movie.title || 'KOREAN FILM');
  const safeKorean = escapeXml(movie.koreanTitle || '한국 영화');
  const safeYear = escapeXml(movie.year || '2024');
  const safeRating = escapeXml(movie.rating || '15+');
  const bgColor = movie.fallbackColor || '#141722';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}"/>
      <stop offset="50%" stop-color="#0b0d14"/>
      <stop offset="100%" stop-color="#040508"/>
    </linearGradient>
    <radialGradient id="bdSpotlight" cx="65%" cy="40%" r="75%">
      <stop offset="0%" stop-color="rgba(225,29,72,0.3)"/>
      <stop offset="50%" stop-color="rgba(225,29,72,0.06)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.95)"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bdGrad)"/>
  <rect width="1920" height="1080" fill="url(#bdSpotlight)"/>

  <!-- Cinematic Background Typography Silhouette -->
  <g opacity="0.08" transform="translate(960, 560)">
    <text x="0" y="0" fill="#ffffff" font-size="240" font-weight="900" font-family="'Noto Sans KR', sans-serif" text-anchor="middle">${safeKorean}</text>
  </g>

  <!-- Large Stage Light Cone -->
  <polygon points="1200,0 1600,1080 800,1080" fill="rgba(255,255,255,0.02)"/>

  <!-- Bottom Left Watermark / Presentation Info -->
  <g transform="translate(100, 960)">
    <text x="0" y="0" fill="rgba(255,255,255,0.4)" font-size="16" font-weight="700" font-family="'Inter', sans-serif" letter-spacing="3">CINEBY ULTRA HD &bull; 4K REMASTERED</text>
    <text x="0" y="26" fill="rgba(255,255,255,0.2)" font-size="13" font-family="'Inter', sans-serif" letter-spacing="2">${safeTitle} &bull; ${safeYear} &bull; ${safeRating}</text>
  </g>
</svg>`;
}

module.exports = {
  getMovie,
  generatePosterSvg,
  generateBackdropSvg
};
