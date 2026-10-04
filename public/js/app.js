/**
 * CINEXA: Master Controller & Ultimate Streaming Platform
 * Features:
 * - Featured Hero Slideshow Engine (Auto-play, Crossfade, Thumbnails)
 * - Continue Watching Row with Dynamic Progress Bars & Instant Resume
 * - Official HD Trailers Cinema Modal (YouTube / TMDB API)
 * - Multi-Quality 4K UHD / 1080p / 720p Download Hub with Magnet Links
 * - "Surprise Me" Cinematic Random Film Picker
 * - Cast & Crew Profiles + "More Like This" Smart Recommendations
 * - PWA Service Worker & Installability
 * - Native Share & Deep-Link Hash Navigation (#movie/:slug)
 * - Power-User Keyboard Shortcuts HUD (? Key)
 * - Dedicated Regional Carousels (Anime, Bollywood, Tollywood, Kollywood, Hollywood, Korean)
 * - Full 200+ Master Catalog Grid with Live Search & Multi-Criteria Filtering
 * - Saved Watchlist & Library Storage
 */

// Global App State
let currentScreen = 'discover';
let currentActiveMovie = null;
let currentDownloadMovie = null;
let currentSurpriseMovie = null;
let watchlistSet = new Set(['15859', 'dune-part-two', 'past-lives', 'spirited-away', 'jawan', 'kalki-2898-ad', 'leo']);
let toastTimer = null;

// =========================================================================
// 1. FEATURED HERO SLIDESHOW DATA & ENGINE
// =========================================================================

const FEATURED_SLIDES = [
  {
    id: 'dune-part-two',
    slug: 'dune-part-two',
    title: 'Dune: Part Two',
    categoryLabel: '✨ Top Recommendation',
    year: '2024',
    duration: '2h 46m',
    rating: 'PG-13',
    score: '8.6',
    matchScore: '99% Match',
    resolution: '4K UHD IMAX',
    audio: 'Dolby Atmos 5.1',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    backdrop: 'https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    trailerId: 'Way9Dexny3w'
  },
  {
    id: 'oppenheimer',
    slug: 'oppenheimer',
    title: 'Oppenheimer',
    categoryLabel: '⚡ Current Trending',
    year: '2023',
    duration: '3h 00m',
    rating: 'R',
    score: '8.9',
    matchScore: '99% Match',
    resolution: '70MM Ultra HD',
    audio: 'Dolby Atmos',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
    synopsis: 'The pulse-pounding story of J. Robert Oppenheimer and his role leading the Manhattan Project in the creation of the atomic bomb.',
    backdrop: 'https://image.tmdb.org/t/p/original/7CENyUim29IEsaJhUxIGymCRvPu.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerId: 'uYPbbksJxIg'
  },
  {
    id: 'spirited-away',
    slug: 'spirited-away',
    title: 'Spirited Away',
    categoryLabel: '🎌 Studio Ghibli Masterpiece',
    year: '2001',
    duration: '2h 05m',
    rating: 'PG',
    score: '8.6',
    matchScore: '99% Match',
    resolution: '4K Ghibli Remaster',
    audio: 'Japanese / Multi-Dub 5.1',
    director: 'Hayao Miyazaki',
    cast: 'Rumi Hiiragi, Miyu Irino, Mari Natsuki',
    synopsis: 'Ten-year-old Chihiro wanders into a wondrous world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    backdrop: 'https://image.tmdb.org/t/p/original/6oaL4DP75yABrd5EbC4H2zq5ghc.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    trailerId: 'ByXuk9QqQkk'
  },
  {
    id: 'kalki-2898-ad',
    slug: 'kalki-2898-ad',
    title: 'Kalki 2898 AD',
    categoryLabel: '🇮🇳 Epic Blockbuster',
    year: '2024',
    duration: '3h 01m',
    rating: 'PG-13',
    score: '8.1',
    matchScore: '98% Match',
    resolution: '4K UHD Master',
    audio: 'Telugu / Hindi / Tamil Dubbed',
    director: 'Nag Ashwin',
    cast: 'Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone',
    synopsis: 'A modern avatar of Vishnu descends to Earth to protect the world from evil forces in a dystopian post-apocalyptic future.',
    backdrop: 'https://image.tmdb.org/t/p/original/o8XSR1SONnjcsv84NRu6Mwsl5io.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg',
    trailerId: 'kQDd1AhGIHk'
  },
  {
    id: 'parasite',
    slug: 'parasite',
    title: 'Parasite',
    categoryLabel: '🏆 Palme d\'Or & Oscar Winner',
    year: '2019',
    duration: '2h 12m',
    rating: 'R',
    score: '8.5',
    matchScore: '99% Match',
    resolution: '4K UHD Master',
    audio: 'Korean Dolby Atmos',
    director: 'Bong Joon-ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik',
    synopsis: 'A destitute family schemes to become employed by a wealthy household and infiltrate their domestic life with unexpected consequences.',
    backdrop: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    trailerId: '5xH0R_stw8E'
  },
  {
    id: 'interstellar',
    slug: 'interstellar',
    title: 'Interstellar',
    categoryLabel: '🔥 People\'s Favorite',
    year: '2014',
    duration: '2h 49m',
    rating: 'PG-13',
    score: '8.7',
    matchScore: '99% Match',
    resolution: '4K IMAX Laser',
    audio: 'Dolby Atmos',
    director: 'Christopher Nolan',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    synopsis: 'When Earth becomes uninhabitable, a former NASA pilot is tasked with piloting a spacecraft through a wormhole to find a new home for humanity.',
    backdrop: 'https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    trailerId: 'zSWdZVtXT7E'
  }
];

let slideshowState = {
  currentIndex: 0,
  isPaused: false,
  timer: null,
  timerInterval: 6500
};

function initFeaturedSlideshow() {
  const container = document.getElementById('hero-slideshow-container');
  if (!container) return;

  renderThumbnailsDeck();
  renderProgressDots();
  renderSlide(0);
  startSlideTimer();

  container.addEventListener('mouseenter', () => { slideshowState.isPaused = true; });
  container.addEventListener('mouseleave', () => { slideshowState.isPaused = false; });
}

function renderThumbnailsDeck() {
  const deck = document.getElementById('slide-thumbnails-deck');
  if (!deck) return;

  deck.innerHTML = FEATURED_SLIDES.map((slide, idx) => {
    return `
      <button class="slide-thumb-btn group relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 transition-all cursor-pointer" data-slide-index="${idx}" onclick="goToSlide(${idx})" title="${slide.title}">
        <img src="${slide.backdrop || slide.poster}" alt="${slide.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        <div class="absolute inset-0 bg-surface/30 group-hover:bg-transparent transition-colors"></div>
      </button>
    `;
  }).join('');
}

function renderProgressDots() {
  const dotsContainer = document.getElementById('slide-progress-dots');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = FEATURED_SLIDES.map((_, idx) => `
    <button class="slide-dot h-1.5 w-2 rounded-full bg-surface-container-highest hover:bg-outline transition-all duration-300 cursor-pointer" onclick="goToSlide(${idx})" aria-label="Go to slide ${idx + 1}"></button>
  `).join('');
}

function getCurrentSlideMovie() {
  return FEATURED_SLIDES[slideshowState.currentIndex] || FEATURED_SLIDES[0];
}

function renderSlide(index) {
  if (index < 0) index = FEATURED_SLIDES.length - 1;
  if (index >= FEATURED_SLIDES.length) index = 0;
  slideshowState.currentIndex = index;

  const slide = FEATURED_SLIDES[index];
  currentActiveMovie = slide;

  const bgImg = document.getElementById('slide-bg-img');
  const posterImg = document.getElementById('slide-poster-img');
  const title = document.getElementById('slide-title');
  const year = document.getElementById('slide-year');
  const duration = document.getElementById('slide-duration');
  const rating = document.getElementById('slide-rating');
  const imdb = document.getElementById('slide-imdb');
  const match = document.getElementById('slide-match');
  const synopsis = document.getElementById('slide-synopsis');
  const categoryText = document.getElementById('slide-category-text');
  const resBadge = document.getElementById('slide-resolution-badge');

  if (bgImg) bgImg.src = slide.backdrop || slide.poster;
  if (posterImg) posterImg.src = slide.poster;
  if (title) title.innerText = slide.title;
  if (year) year.innerText = slide.year;
  if (duration) duration.innerText = slide.duration;
  if (rating) rating.innerText = slide.rating;
  if (imdb) imdb.innerHTML = `<span class="material-symbols-outlined text-[14px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${slide.score} IMDb`;
  if (match) match.innerText = slide.matchScore;
  if (synopsis) synopsis.innerText = slide.synopsis;
  if (categoryText) categoryText.innerText = slide.categoryLabel || 'Featured';
  if (resBadge) resBadge.innerText = slide.resolution || '4K UHD';

  updateActiveThumbnailUI(index);
}

function updateActiveThumbnailUI(activeIndex) {
  const thumbs = document.querySelectorAll('#slide-thumbnails-deck .slide-thumb-btn');
  const deck = document.getElementById('slide-thumbnails-deck');

  thumbs.forEach((th, idx) => {
    if (idx === activeIndex) {
      th.className = 'slide-thumb-btn group relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-primary ring-2 ring-primary scale-105 shadow-md opacity-100 cursor-pointer';
      if (deck) {
        const targetScroll = th.offsetLeft - deck.offsetLeft - (deck.clientWidth / 2) + (th.clientWidth / 2);
        deck.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    } else {
      th.className = 'slide-thumb-btn group relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 opacity-60 hover:opacity-100 transition-all cursor-pointer';
    }
  });

  const dots = document.querySelectorAll('#slide-progress-dots .slide-dot');
  dots.forEach((dot, idx) => {
    if (idx === activeIndex) {
      dot.className = 'slide-dot h-1.5 w-7 rounded-full bg-primary transition-all duration-300 cursor-pointer';
    } else {
      dot.className = 'slide-dot h-1.5 w-2 rounded-full bg-surface-container-highest hover:bg-outline transition-all duration-300 cursor-pointer';
    }
  });
}

function nextSlide() {
  renderSlide(slideshowState.currentIndex + 1);
  restartSlideTimer();
}

function prevSlide() {
  renderSlide(slideshowState.currentIndex - 1);
  restartSlideTimer();
}

function goToSlide(index) {
  renderSlide(index);
  restartSlideTimer();
}

function startSlideTimer() {
  if (slideshowState.timer) clearInterval(slideshowState.timer);
  slideshowState.timer = setInterval(() => {
    if (!slideshowState.isPaused) nextSlide();
  }, slideshowState.timerInterval);
}

function restartSlideTimer() {
  startSlideTimer();
}

function playSlideMovie() {
  const slide = getCurrentSlideMovie();
  playCurrentFilmInPlayer(slide.slug || slide.id);
}

function downloadSlideMovie() {
  const slide = getCurrentSlideMovie();
  openDownloadModal(slide.slug || slide.id);
}

function watchSlideTrailer() {
  const slide = getCurrentSlideMovie();
  openTrailerModal(slide);
}

function openSlideDossier() {
  const slide = getCurrentSlideMovie();
  openFilmDetails(slide.slug || slide.id);
}

function toggleSlideWatchlist() {
  const slide = getCurrentSlideMovie();
  const id = slide.slug || slide.id;
  const btnText = document.getElementById('slide-watchlist-text');

  if (watchlistSet.has(id)) {
    watchlistSet.delete(id);
    if (btnText) btnText.innerText = 'Watchlist';
    showToast(`Removed "${slide.title}" from Watchlist.`);
  } else {
    watchlistSet.add(id);
    if (btnText) btnText.innerText = 'In Watchlist';
    showToast(`Added "${slide.title}" to Watchlist.`);
  }
}

// =========================================================================
// 2. NAVIGATION & SCREEN CONTROLLER
// =========================================================================

function switchMainScreen(screenName) {
  currentScreen = screenName;

  const screens = ['discover', 'library', 'details'];
  screens.forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    if (el) {
      if (s === screenName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Hide hero banner and sticky category pills when viewing Details or Library
  const heroContainer = document.getElementById('hero-slideshow-container');
  const chipContainer = document.getElementById('chip-container');
  const chipSection = chipContainer ? chipContainer.closest('section') : null;

  if (screenName === 'details' || screenName === 'library') {
    if (heroContainer) heroContainer.style.display = 'none';
    if (chipSection) chipSection.style.display = 'none';
  } else {
    if (heroContainer) heroContainer.style.display = 'block';
    if (chipSection) chipSection.style.display = 'block';
  }

  // Update Nav Active State
  document.querySelectorAll('#main-nav-links .nav-link').forEach(link => {
    const nav = link.getAttribute('data-nav');
    if (nav === screenName) {
      link.classList.add('active', 'text-parchment');
      link.classList.remove('text-driftwood');
    } else if (nav) {
      link.classList.remove('active', 'text-parchment');
      link.classList.add('text-driftwood');
    }
  });

  if (screenName === 'library') {
    renderLibraryGrid();
  } else if (screenName === 'discover') {
    renderContinueWatchingRow();
  }

  // Instant scroll to top so content is directly visible at top of viewport
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function selectNavCategory(category) {
  switchMainScreen('discover');
  
  const container = document.getElementById('chip-container');
  if (container) {
    const btn = Array.from(container.querySelectorAll('.chip-item')).find(b => {
      const txt = b.innerText.toLowerCase();
      if (category === 'series') return txt.includes('series');
      if (category === 'anime') return txt.includes('anime');
      if (category === 'bollywood') return txt.includes('bollywood');
      if (category === 'telugu') return txt.includes('telugu');
      if (category === 'tamil') return txt.includes('tamil');
      if (category === 'hollywood') return txt.includes('hollywood');
      if (category === 'korean') return txt.includes('korean');
      if (category === 'action') return txt.includes('action');
      if (category === 'scifi') return txt.includes('sci-fi');
      if (category === 'horror') return txt.includes('horror');
      if (category === 'romance') return txt.includes('romance');
      if (category === 'crime') return txt.includes('crime');
      if (category === 'comedy') return txt.includes('comedy');
      if (category === 'new') return txt.includes('latest');
      return false;
    });
    if (btn) {
      selectChip(btn, category);
      return;
    }
  }

  filterTrendingRows(category);
}

// =========================================================================
// 3. CATEGORY FILTER & DISCOVER CATALOG
// =========================================================================

function selectChip(btn, category) {
  const container = document.getElementById('chip-container');
  if (container) {
    const allChips = container.querySelectorAll('.chip-item');
    allChips.forEach(c => {
      if (!c.innerText.includes('Surprise')) {
        c.classList.remove('bg-primary', 'text-on-primary', 'font-semibold');
        c.classList.add('text-driftwood', 'border', 'border-white/10');
      }
    });
    const targetScroll = btn.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (btn.clientWidth / 2);
    container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
  }

  if (!btn.innerText.includes('Surprise')) {
    btn.classList.add('bg-primary', 'text-on-primary', 'font-semibold');
    btn.classList.remove('text-driftwood', 'border', 'border-white/10');
  }

  filterTrendingRows(category);

  // If specific section exists, smooth scroll to it
  const sectionMap = {
    series: 'section-row-series',
    anime: 'section-row-anime',
    bollywood: 'section-row-bollywood',
    telugu: 'section-row-telugu',
    tamil: 'section-row-tamil',
    hollywood: 'section-row-hollywood',
    korean: 'section-row-korean',
    action: 'section-row-action',
    scifi: 'section-row-scifi',
    horror: 'section-row-horror',
    romance: 'section-row-romance',
    crime: 'section-row-crime',
    comedy: 'section-row-comedy',
    new: 'section-row-trending'
  };

  const targetId = sectionMap[category];
  if (targetId) {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      const topOffset = targetSection.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }
}

function scrollRow(rowId, direction) {
  const el = document.getElementById(rowId);
  if (el) {
    el.scrollBy({ left: direction * 480, behavior: 'smooth' });
  }
}

function getPosterFallbackSvg(title, year) {
  const safeTitle = (title || 'Cinexa').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeYear = year || '4K';
  const c1 = '#152126';
  const c2 = '#041015';
  const cAccent = '#ecc077';
  const hash = Math.abs((title || 'c').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 1000;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750" width="100%" height="100%">
      <defs>
        <linearGradient id="g${hash}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g${hash})"/>
      <circle cx="250" cy="300" r="130" fill="${cAccent}" opacity="0.08"/>
      <rect x="30" y="30" width="440" height="690" fill="none" stroke="${cAccent}" stroke-width="1" stroke-opacity="0.2" rx="16"/>
      <text x="50%" y="360" text-anchor="middle" fill="#EDE6D6" font-family="Newsreader, serif" font-size="28" font-weight="600">${safeTitle}</text>
      <text x="50%" y="405" text-anchor="middle" fill="${cAccent}" font-family="Courier Prime, monospace" font-size="14" letter-spacing="2">CINEXA ARCHIVE • ${safeYear}</text>
    </svg>
  `)}`;
}

function handlePosterError(imgElement, title, year) {
  imgElement.onerror = null;
  imgElement.src = getPosterFallbackSvg(title, year);
}

function createMovieCardHtml(m, options = {}) {
  const poster = m.posterUrl || m.poster || m.backdropUrl || getPosterFallbackSvg(m.title, m.year);
  const rating = m.rating || 'PG-13';
  const score = m.imdbRating || '8.2';
  const id = m.slug || m.id;
  const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
  const isSaved = watchlistSet.has(id);
  const isSeries = m.type === 'tv' || m.isSeries;
  const defaultTag = isSeries ? (m.seasons ? `${m.seasons} SEASONS` : 'SERIES') : (m.language ? m.language.toUpperCase() : (m.country || '4K'));
  const tag = options.tag || defaultTag;

  return `
    <div class="group relative flex-shrink-0 w-[190px] snap-start transition-all duration-300 cursor-pointer" onclick="openFilmBySlug('${id}')">
      <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-container border border-white/10 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-2xl">
        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" src="${poster}" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')" alt="${m.title}" loading="lazy"/>
        <div class="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
        
        <div class="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span class="font-sans text-[10px] px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-on-surface uppercase border border-white/10 font-medium">${rating}</span>
          ${isSeries ? '<span class="font-sans text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase border border-primary/30 font-bold">TV</span>' : ''}
        </div>

        <button aria-label="Save to Watchlist" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer z-10 ${isSaved ? 'text-primary' : ''}" onclick="event.stopPropagation(); toggleSlideWatchlistById('${id}', '${safeTitle}');">
          <span class="material-symbols-outlined text-[15px]" style="${isSaved ? "font-variation-settings: 'FILL' 1;" : ""}">${isSaved ? 'bookmark' : 'bookmark_border'}</span>
        </button>

        <div class="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <button class="h-7 px-2.5 rounded-full bg-primary text-on-primary font-sans text-[11px] font-bold flex items-center gap-1 shadow-sm hover:bg-brass-hover transition-colors" title="Watch 4K" onclick="event.stopPropagation(); playCurrentFilmInPlayer('${id}')">
            <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
            <span>Watch</span>
          </button>
          <div class="flex items-center gap-1">
            <button aria-label="Download 4K" class="w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:text-primary transition-colors" title="Download 4K" onclick="event.stopPropagation(); openDownloadModal('${id}')">
              <span class="material-symbols-outlined text-[14px]">download</span>
            </button>
            <button aria-label="Details" class="w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:text-primary transition-colors" title="Details" onclick="event.stopPropagation(); openFilmDetails('${id}')">
              <span class="material-symbols-outlined text-[14px]">info</span>
            </button>
          </div>
        </div>
      </div>
      <div class="mt-2 space-y-0.5">
        <h4 class="font-sans text-xs font-semibold text-parchment truncate group-hover:text-primary transition-colors">${m.title}</h4>
        <div class="flex items-center gap-2 font-mono text-[11px] text-driftwood">
          <span>${m.year || '2024'}</span>
          <span class="text-white/20">•</span>
          <span class="text-primary font-medium flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[11px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${score}
          </span>
          <span class="text-white/20">•</span>
          <span class="text-tertiary text-[10px] uppercase font-bold truncate">${tag}</span>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// 3B. CONTINUE WATCHING REEL & RESUME ENGINE
// =========================================================================

const WATCH_PROGRESS_KEY = 'cinexa_continue_watching';

function saveWatchProgress(movie, percent = 45, timeRemaining = '1h 12m left') {
  if (!movie) return;
  const id = movie.slug || movie.id;
  try {
    let list = JSON.parse(localStorage.getItem(WATCH_PROGRESS_KEY) || '[]');
    list = list.filter(item => item.id !== id);
    list.unshift({
      id: id,
      title: movie.title,
      poster: movie.posterUrl || movie.poster || movie.backdropUrl,
      year: movie.year || '2024',
      imdbRating: movie.imdbRating || '8.2',
      percent: percent,
      timeRemaining: timeRemaining,
      savedAt: Date.now()
    });
    localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(list.slice(0, 10)));
  } catch (e) {}
}

function getContinueWatchingList() {
  try {
    const list = JSON.parse(localStorage.getItem(WATCH_PROGRESS_KEY) || '[]');
    if (list.length > 0) return list;
  } catch (e) {}
  // Default sample records if fresh visitor
  return [
    { id: 'solo-leveling-series', title: 'Solo Leveling', poster: 'https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuPxJ8BGd1.jpg', year: '2024', imdbRating: '8.5', percent: 65, timeRemaining: 'S1:E4 (18m left)' },
    { id: 'dune-part-two', title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', year: '2024', imdbRating: '8.6', percent: 45, timeRemaining: '1h 12m left' }
  ];
}

function renderContinueWatchingRow() {
  const container = document.getElementById('carousel-continue-watching');
  const section = document.getElementById('section-continue-watching');
  if (!container || !section) return;

  const list = getContinueWatchingList();
  if (list.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  container.innerHTML = list.map(m => {
    const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
    return `
      <div class="group relative flex-shrink-0 w-[210px] snap-start bg-surface-container rounded-xl overflow-hidden border border-white/10 shadow-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 cursor-pointer" onclick="playCurrentFilmInPlayer('${m.id}')">
        <div class="relative w-full aspect-video overflow-hidden bg-black">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${m.poster}" alt="${m.title}" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')"/>
          <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="absolute bottom-0 inset-x-0 h-1 bg-white/20">
            <div class="bg-primary h-full transition-all" style="width: ${m.percent || 50}%;"></div>
          </div>
        </div>
        <div class="p-2.5 space-y-1">
          <div class="flex items-center justify-between font-mono text-[10px] text-primary">
            <span>RESUME</span>
            <span class="text-driftwood">${m.timeRemaining || 'In Progress'}</span>
          </div>
          <h4 class="font-sans text-xs font-semibold text-parchment truncate group-hover:text-primary transition-colors">${m.title}</h4>
        </div>
      </div>
    `;
  }).join('');
}

function clearContinueWatching() {
  try {
    localStorage.removeItem(WATCH_PROGRESS_KEY);
    const section = document.getElementById('section-continue-watching');
    if (section) section.classList.add('hidden');
    showToast('Continue Watching history cleared.');
  } catch (e) {}
}

function filterTrendingRows(category = 'all') {
  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];

  const hasGenre = (m, regex) => {
    if (!m.genres) return false;
    return m.genres.some(g => regex.test(g));
  };

  // 0. TV & Web Series
  const seriesFilms = catalog.filter(m => m.type === 'tv' || m.isSeries);

  // 1. Kollywood: ONLY pure Tamil movies
  const tamilFilms = catalog.filter(m => 
    !m.isSeries && (
    m.category === 'tamil' || 
    (m.language && /^(ta|tamil)$/i.test(m.language.trim())) ||
    (m.title && /^(Leo|Jailer|Vikram|Ponniyin Selvan.*|Master|Kaithi|Amaran|Vettaiyan|Soorarai Pottru|Asuran|Jai Bhim|Super Deluxe|Thuppakki|96)$/i.test(m.title)))
  );

  // 2. Bollywood: ONLY pure Hindi movies (strictly exclude South Indian or foreign films)
  const bollywoodFilms = catalog.filter(m => 
    !m.isSeries &&
    (m.category === 'bollywood' || (m.language && /^(hi|hindi)$/i.test(m.language.trim()))) &&
    !tamilFilms.some(t => t.id === m.id) &&
    !/RRR|Kalki|Salaar|Baahubali|Pushpa|Devara|Hanu-Man|Kantara|K\.G\.F|Sita Ramam|Lucky Baskhar|Manjummel|Aavesham|Leo|Jailer|Vikram|Ponniyin|Master|Kaithi|Amaran|Vettaiyan|Soorarai|Asuran|Jai Bhim/i.test(m.title)
  );

  // 3. Tollywood: ONLY pure Telugu movies (strictly exclude Kannada/Malayalam/Tamil/Hindi)
  const teluguFilms = catalog.filter(m => 
    !m.isSeries &&
    (m.category === 'telugu' || (m.language && /^(te|telugu)$/i.test(m.language.trim())) ||
    (m.title && /^(RRR|Baahubali.*|Salaar.*|Kalki 2898 AD|Pushpa.*|Devara.*|Hanu-Man|Sita Ramam|Ala Vaikunthapurramuloo|Lucky Baskhar|Arjun Reddy|Jersey|Eega)$/i.test(m.title))) &&
    !/K\.G\.F|Kantara|Manjummel|Aavesham|Leo|Jailer|Vikram|Jawan|Pathaan/i.test(m.title)
  );

  // 4. Anime: Japanese Animation (Movies + Series)
  const animeFilms = catalog.filter(m => 
    m.category === 'anime' || 
    (m.country === 'Japan' && (m.genres && m.genres.some(g => /animation|anime/i.test(g)))) ||
    (m.language && /^(ja|japanese)$/i.test(m.language.trim()) && (m.genres && m.genres.some(g => /animation|anime/i.test(g))))
  );

  // 5. Hollywood 4K: US/UK blockbusters
  const hollywoodFilms = catalog.filter(m => 
    !m.isSeries &&
    (m.category === 'hollywood' || 
    ((m.country === 'United States' || m.country === 'United Kingdom' || m.country === 'United States of America') && m.category !== 'anime'))
  );

  // 6. Korean Cinema: South Korean Cinema
  const koreanFilms = catalog.filter(m => 
    !m.isSeries &&
    (m.category === 'korean' || 
    (m.country && m.country.includes('South Korea')) ||
    (m.language && /^(ko|korean)$/i.test(m.language.trim())))
  );

  // 7. Action & Thrillers
  const actionFilms = catalog.filter(m => hasGenre(m, /action|thriller|adventure/i));

  // 8. Sci-Fi & Fantasy
  const scifiFilms = catalog.filter(m => hasGenre(m, /sci-fi|science fiction|fantasy/i));

  // 9. Horror & Mystery
  const horrorFilms = catalog.filter(m => hasGenre(m, /horror|mystery/i));

  // 10. Romance & Drama
  const romanceFilms = catalog.filter(m => hasGenre(m, /romance|drama/i));

  // 11. Crime & Suspense
  const crimeFilms = catalog.filter(m => hasGenre(m, /crime|suspense/i));

  // 12. Comedy & Fun
  const comedyFilms = catalog.filter(m => hasGenre(m, /comedy|family/i));

  // 13. Latest Releases (2024-2026)
  const latestFilms = catalog.filter(m => {
    const yr = parseInt(m.year) || 0;
    return yr >= 2024;
  });

  // Trending Container
  const trendingContainer = document.getElementById('carousel-trending');
  if (trendingContainer) {
    let trendingFilms = catalog;
    if (category === 'series') trendingFilms = seriesFilms;
    else if (category === 'anime') trendingFilms = animeFilms;
    else if (category === 'bollywood') trendingFilms = bollywoodFilms;
    else if (category === 'telugu') trendingFilms = teluguFilms;
    else if (category === 'tamil') trendingFilms = tamilFilms;
    else if (category === 'korean') trendingFilms = koreanFilms;
    else if (category === 'hollywood') trendingFilms = hollywoodFilms;
    else if (category === 'action') trendingFilms = actionFilms;
    else if (category === 'scifi') trendingFilms = scifiFilms;
    else if (category === 'horror') trendingFilms = horrorFilms;
    else if (category === 'romance') trendingFilms = romanceFilms;
    else if (category === 'crime') trendingFilms = crimeFilms;
    else if (category === 'comedy') trendingFilms = comedyFilms;
    else if (category === 'new') trendingFilms = latestFilms;

    trendingContainer.innerHTML = trendingFilms.slice(0, 16).map(m => createMovieCardHtml(m)).join('');
  }

  // Populate all carousels helper
  const populate = (id, list, tag) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = list.slice(0, 16).map(m => createMovieCardHtml(m, tag ? { tag } : {})).join('');
    }
  };

  populate('carousel-series', seriesFilms, 'SERIES');
  populate('carousel-anime', animeFilms, 'ANIME 4K');
  populate('carousel-bollywood', bollywoodFilms, 'HINDI');
  populate('carousel-telugu', teluguFilms, 'TELUGU');
  populate('carousel-tamil', tamilFilms, 'TAMIL');
  populate('carousel-hollywood', hollywoodFilms, '4K UHD');
  populate('carousel-korean', koreanFilms, 'K-CINEMA');
  populate('carousel-action', actionFilms, 'ACTION');
  populate('carousel-scifi', scifiFilms, 'SCI-FI');
  populate('carousel-horror', horrorFilms, 'HORROR');
  populate('carousel-romance', romanceFilms, 'ROMANCE');
  populate('carousel-crime', crimeFilms, 'CRIME');
  populate('carousel-comedy', comedyFilms, 'COMEDY');

  // Numbered Top 10 Critics
  const numberedContainer = document.getElementById('carousel-numbered');
  if (numberedContainer) {
    const top10 = [...catalog].sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0)).slice(0, 10);
    numberedContainer.innerHTML = top10.map((m, idx) => {
      const poster = m.posterUrl || m.poster || m.backdropUrl || getPosterFallbackSvg(m.title, m.year);
      const num = idx + 1;
      const score = m.imdbRating || '8.5';
      const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
      const id = m.slug || m.id;

      return `
        <div class="group relative flex-shrink-0 flex items-end snap-start cursor-pointer" onclick="openFilmBySlug('${id}')">
          <span class="font-serif text-[110px] font-normal leading-none text-transparent select-none pointer-events-none -mr-6 -mb-2 z-0 tracking-tight" style="-webkit-text-stroke: 1.5px #A9A596; opacity: 0.5;">
            ${num}
          </span>
          <div class="relative w-[170px] z-10">
            <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-container border border-white/10 shadow-md group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-2xl transition-all duration-300">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${poster}" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')" alt="${m.title}" loading="lazy"/>
              <div class="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                <button class="h-6 px-2 rounded-full bg-primary text-on-primary font-sans text-[10px] font-bold flex items-center gap-1 shadow-sm hover:bg-brass-hover" onclick="event.stopPropagation(); playCurrentFilmInPlayer('${id}')">
                  <span class="material-symbols-outlined text-[12px]">play_arrow</span>
                  <span>Play</span>
                </button>
                <button aria-label="Download 4K" class="w-6 h-6 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:text-primary transition-colors" title="Download 4K" onclick="event.stopPropagation(); openDownloadModal('${id}')">
                  <span class="material-symbols-outlined text-[12px]">download</span>
                </button>
              </div>
            </div>
            <div class="mt-1.5 space-y-0.5">
              <h4 class="font-sans text-xs font-semibold text-parchment truncate group-hover:text-primary transition-colors">${m.title}</h4>
              <div class="flex items-center gap-1.5 font-mono text-[10px] text-driftwood">
                <span>${m.year || '2024'}</span>
                <span class="text-white/20">•</span>
                <span class="text-primary font-medium flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[10px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${score}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// =========================================================================
// 4. DISCOVER FILTER & GRID ENGINE
// =========================================================================

let discoverSearchTimer = null;
function handleDiscoverSearch(query) {
  if (discoverSearchTimer) clearTimeout(discoverSearchTimer);
  discoverSearchTimer = setTimeout(() => {
    applyDiscoverFilters();
  }, 100);
}

function applyDiscoverFilters() {
  const genreSelect = document.getElementById('filter-genre-select');
  const audioSelect = document.getElementById('filter-audio-select');
  const sortSelect = document.getElementById('filter-sort-select');
  const searchInput = document.getElementById('discover-inline-search');

  const genreVal = (genreSelect ? genreSelect.value : 'all').toLowerCase();
  const audioVal = (audioSelect ? audioSelect.value : 'all').toLowerCase();
  const sortVal = (sortSelect ? sortSelect.value : 'rating').toLowerCase();
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? [...KOREAN_MOVIES_CATALOG] : [];
  let filtered = catalog;

  // Search query filter
  if (query.length > 0) {
    filtered = filtered.filter(m =>
      (m.title && m.title.toLowerCase().includes(query)) ||
      (m.director && m.director.toLowerCase().includes(query)) ||
      (m.country && m.country.toLowerCase().includes(query)) ||
      (m.genres && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(query)))
    );
  }

  // Genre filter
  if (genreVal !== 'all') {
    filtered = filtered.filter(m => m.genres && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(genreVal)));
  }

  // Audio Dubbing filter
  if (audioVal !== 'all') {
    if (audioVal === 'hindi') {
      filtered = filtered.filter(m => m.category === 'bollywood' || (m.language && /^(hi|hindi)$/i.test(m.language)) || (m.audio && m.audio.toLowerCase().includes('hindi')));
    } else if (audioVal === 'tamil') {
      filtered = filtered.filter(m => m.category === 'tamil' || (m.language && /^(ta|tamil)$/i.test(m.language)) || (m.audio && m.audio.toLowerCase().includes('tamil')));
    } else if (audioVal === 'telugu') {
      filtered = filtered.filter(m => m.category === 'telugu' || (m.language && /^(te|telugu)$/i.test(m.language)) || (m.audio && m.audio.toLowerCase().includes('telugu')));
    } else if (audioVal === 'english') {
      filtered = filtered.filter(m => m.category === 'hollywood' || (m.country === 'United States') || (m.audio && m.audio.toLowerCase().includes('english')));
    }
  }

  // Sort filter
  if (sortVal === 'rating') {
    filtered.sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
  } else if (sortVal === 'newest') {
    filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
  } else if (sortVal === 'title') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  renderDiscoverCatalog(filtered);
}

function renderDiscoverCatalog(customList) {
  const grid = document.getElementById('catalogGrid');
  const counter = document.getElementById('discover-counter');
  if (!grid) return;

  const catalog = customList || ((typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : []);
  if (counter) counter.innerText = `${catalog.length} VERIFIED MASTER FILMS`;

  if (catalog.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-driftwood space-y-3">
        <span class="material-symbols-outlined text-3xl text-primary">movie_filter</span>
        <p class="text-sm font-sans">No matching films found.</p>
        <button class="px-4 py-1.5 rounded-full bg-primary text-on-primary font-sans text-xs font-bold uppercase cursor-pointer" onclick="resetDiscoverFilters()">
          Clear Filters
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = catalog.map(m => {
    const poster = m.posterUrl || m.poster || m.backdropUrl || getPosterFallbackSvg(m.title, m.year);
    const rating = m.rating || 'PG-13';
    const score = m.imdbRating || '8.1';
    const id = m.slug || m.id;
    const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
    const isSaved = watchlistSet.has(id);

    return `
      <div class="group relative flex flex-col bg-surface-container rounded-xl overflow-hidden border border-white/10 shadow-sm hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer" onclick="openFilmDetails('${id}')">
        <div class="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-lowest">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${poster}" alt="${m.title}" loading="lazy" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
          
          <div class="absolute top-2 left-2 z-10 flex items-center gap-1">
            <span class="font-sans text-[10px] px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-on-surface uppercase border border-white/10 font-medium">${rating}</span>
          </div>
          
          <button aria-label="Save" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer z-10 ${isSaved ? 'text-primary' : ''}" onclick="event.stopPropagation(); toggleSlideWatchlistById('${id}', '${safeTitle}');">
            <span class="material-symbols-outlined text-[15px]" style="${isSaved ? "font-variation-settings: 'FILL' 1;" : ""}">${isSaved ? 'bookmark' : 'bookmark_border'}</span>
          </button>

          <div class="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button class="h-9 px-3 rounded-full bg-primary text-on-primary font-sans text-xs font-bold flex items-center gap-1 shadow-lg hover:bg-brass-hover transition-colors cursor-pointer" onclick="event.stopPropagation(); playCurrentFilmInPlayer('${id}')">
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
              <span>Watch</span>
            </button>
            <button class="w-9 h-9 rounded-full bg-surface-bright text-on-surface hover:text-primary flex items-center justify-center shadow-lg transition-colors cursor-pointer border border-white/10" title="Download 4K" onclick="event.stopPropagation(); openDownloadModal('${id}')">
              <span class="material-symbols-outlined text-[16px]">download</span>
            </button>
          </div>
        </div>
        
        <div class="p-2.5 space-y-1">
          <h4 class="font-sans text-xs font-semibold text-parchment truncate group-hover:text-primary transition-colors">${m.title}</h4>
          <div class="flex items-center justify-between font-mono text-[10px] text-driftwood">
            <span>${m.year || '2024'}</span>
            <span class="text-primary font-medium flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[10px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${score}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetDiscoverFilters() {
  const genreSelect = document.getElementById('filter-genre-select');
  const audioSelect = document.getElementById('filter-audio-select');
  const sortSelect = document.getElementById('filter-sort-select');
  const searchInput = document.getElementById('discover-inline-search');

  if (genreSelect) genreSelect.value = 'all';
  if (audioSelect) audioSelect.value = 'all';
  if (sortSelect) sortSelect.value = 'rating';
  if (searchInput) searchInput.value = '';

  renderDiscoverCatalog();
}

// =========================================================================
// 5. MY LIBRARY & WATCHLIST CONTROLLER
// =========================================================================

function renderLibraryGrid() {
  const container = document.getElementById('library-grid');
  if (!container) return;

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  const savedMovies = catalog.filter(m => watchlistSet.has(m.slug || m.id));

  if (savedMovies.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-driftwood space-y-3">
        <span class="material-symbols-outlined text-4xl text-primary">bookmark_border</span>
        <h3 class="font-serif text-xl text-parchment font-medium">Your Watchlist is Empty</h3>
        <p class="text-xs font-sans max-w-sm mx-auto">Click the bookmark icon on any movie card or hero banner to save it here for quick access.</p>
        <button class="px-5 py-2 rounded-full bg-primary text-on-primary font-sans text-xs font-bold uppercase cursor-pointer" onclick="switchMainScreen('discover')">
          Browse Movies
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = savedMovies.map(m => {
    const poster = m.posterUrl || m.poster || m.backdropUrl || getPosterFallbackSvg(m.title, m.year);
    const id = m.slug || m.id;
    const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");

    return `
      <div class="group relative flex flex-col bg-surface-container rounded-xl overflow-hidden border border-white/10 shadow-sm hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer" onclick="openFilmDetails('${id}')">
        <div class="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-lowest">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${poster}" alt="${m.title}" loading="lazy" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

          <button aria-label="Remove from Watchlist" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-primary hover:text-white transition-colors cursor-pointer z-10" onclick="event.stopPropagation(); toggleSlideWatchlistById('${id}', '${safeTitle}'); renderLibraryGrid();">
            <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">bookmark</span>
          </button>

          <div class="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button class="h-9 px-3 rounded-full bg-primary text-on-primary font-sans text-xs font-bold flex items-center gap-1 shadow-lg hover:bg-brass-hover transition-colors cursor-pointer" onclick="event.stopPropagation(); playCurrentFilmInPlayer('${id}')">
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
              <span>Watch</span>
            </button>
            <button class="w-9 h-9 rounded-full bg-surface-bright text-on-surface hover:text-primary flex items-center justify-center shadow-lg transition-colors cursor-pointer border border-white/10" title="Download 4K" onclick="event.stopPropagation(); openDownloadModal('${id}')">
              <span class="material-symbols-outlined text-[16px]">download</span>
            </button>
          </div>
        </div>
        
        <div class="p-2.5 space-y-1">
          <h4 class="font-sans text-xs font-semibold text-parchment truncate group-hover:text-primary transition-colors">${m.title}</h4>
          <div class="flex items-center justify-between font-mono text-[10px] text-driftwood">
            <span>${m.year || '2024'}</span>
            <span class="text-primary font-medium flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[10px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${m.imdbRating || '8.0'}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleSlideWatchlistById(id, title) {
  if (watchlistSet.has(id)) {
    watchlistSet.delete(id);
    showToast(`Removed "${title}" from Watchlist.`);
  } else {
    watchlistSet.add(id);
    showToast(`Added "${title}" to Watchlist.`);
  }
}

// =========================================================================
// 6. FILM DETAILS DOSSIER & CAST & RELATED MOVIES
// =========================================================================

function openFilmDetails(movieOrSlug) {
  let movie = movieOrSlug;
  if (typeof movieOrSlug === 'string') {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    movie = catalog.find(m => m.slug === movieOrSlug || m.id === movieOrSlug) || {
      title: 'Movie',
      year: '2024',
      imdbRating: '8.0'
    };
  }

  currentActiveMovie = movie;

  const heroImg = document.getElementById('details-hero-img');
  const posterImg = document.getElementById('details-poster-img');
  const title = document.getElementById('details-title');
  const score = document.getElementById('details-score');
  const duration = document.getElementById('details-duration');
  const age = document.getElementById('details-age');
  const year = document.getElementById('details-year');
  const synopsis = document.getElementById('details-synopsis');
  const watchBtnText = document.getElementById('details-watch-btn-text');

  const posterSrc = movie.posterUrl || movie.poster || movie.backdropUrl || getPosterFallbackSvg(movie.title, movie.year);
  const backdropSrc = movie.backdropUrl || movie.backdrop || movie.posterUrl || posterSrc;

  if (heroImg) heroImg.style.backgroundImage = `url('${backdropSrc}')`;
  if (posterImg) {
    posterImg.src = posterSrc;
    posterImg.onerror = function() { this.src = getPosterFallbackSvg(movie.title, movie.year); };
  }
  if (title) title.innerText = movie.title;
  if (score) score.innerText = `★ ${movie.imdbRating || '8.2'}`;
  
  const isTV = movie.type === 'tv' || movie.isSeries;
  if (duration) {
    if (isTV) {
      duration.innerText = `${movie.seasons || 1} Season${(movie.seasons || 1) > 1 ? 's' : ''} • ${movie.episodesCount || 12} Episodes`;
    } else {
      duration.innerText = movie.duration || '2h 10m';
    }
  }

  if (age) age.innerText = movie.rating || (isTV ? 'TV-MA' : 'PG-13');
  if (year) year.innerText = movie.year || '2024';
  if (synopsis) synopsis.innerText = movie.synopsis || movie.overview || 'Available for high-speed streaming in full HD.';
  
  if (watchBtnText) {
    watchBtnText.innerText = isTV ? 'Watch Series (Ep 1)' : 'Watch Now';
  }

  // Render Cast & Related Films
  renderDetailsCast(movie);
  renderDetailsRelated(movie);

  // Update URL hash without reload
  try {
    history.replaceState(null, '', `#movie/${movie.slug || movie.id}`);
  } catch (e) {}

  switchMainScreen('details');
}

function renderDetailsCast(movie) {
  const castContainer = document.getElementById('details-cast-grid');
  if (!castContainer) return;

  let castList = [];
  if (movie.cast) {
    if (Array.isArray(movie.cast)) {
      castList = movie.cast;
    } else if (typeof movie.cast === 'string') {
      castList = movie.cast.split(',').map(c => ({ name: c.trim(), role: 'Cast' }));
    }
  }

  if (movie.director) {
    castList.unshift({ name: movie.director, role: 'Director' });
  }

  if (castList.length === 0) {
    castList = [
      { name: 'Lead Actor', role: 'Protagonist' },
      { name: 'Director', role: 'Visionary Director' }
    ];
  }

  castContainer.innerHTML = castList.slice(0, 8).map(member => {
    const name = typeof member === 'string' ? member : member.name;
    const role = (typeof member === 'object' && member.role) ? member.role : 'Cast';
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return `
      <div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-high border border-white/5 shrink-0 min-w-[170px]">
        <div class="w-10 h-10 rounded-full bg-surface-bright border border-primary/30 flex items-center justify-center font-mono font-bold text-xs text-primary shrink-0">
          ${initials}
        </div>
        <div class="min-w-0">
          <h5 class="font-sans text-xs font-semibold text-parchment truncate">${name}</h5>
          <span class="font-mono text-[10px] text-driftwood truncate block">${role}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderDetailsRelated(movie) {
  const relatedContainer = document.getElementById('details-related-carousel');
  if (!relatedContainer) return;

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  const related = catalog.filter(m => 
    (m.slug !== movie.slug && m.id !== movie.id) &&
    (m.country === movie.country || m.category === movie.category || (m.genres && movie.genres && m.genres.some(g => movie.genres.includes(g))))
  ).slice(0, 10);

  const fallbackList = catalog.slice(0, 8);
  const finalList = related.length >= 3 ? related : fallbackList;

  relatedContainer.innerHTML = finalList.map(m => createMovieCardHtml(m)).join('');
}

function openFilmBySlug(slug) {
  openFilmDetails(slug);
}

function toggleDetailsWatchlist() {
  const text = document.getElementById('details-watchlist-text');
  const id = currentActiveMovie ? (currentActiveMovie.slug || currentActiveMovie.id) : '';
  const title = currentActiveMovie ? currentActiveMovie.title : 'Film';

  if (!id) return;
  if (watchlistSet.has(id)) {
    watchlistSet.delete(id);
    if (text) text.innerText = 'Watchlist';
    showToast(`Removed "${title}" from Watchlist.`);
  } else {
    watchlistSet.add(id);
    if (text) text.innerText = 'In Watchlist';
    showToast(`Added "${title}" to Watchlist.`);
  }
}

function playCurrentFilmInPlayer(serverOrSlug) {
  let film = currentActiveMovie;
  const validServers = ['vidlink', 'multiaudio', 'vidsrc_cc', 'autoembed', 'vidsrc_xyz', 'local'];

  if (typeof serverOrSlug === 'string' && !validServers.includes(serverOrSlug)) {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    const found = catalog.find(m => m.slug === serverOrSlug || m.id === serverOrSlug);
    if (found) film = found;
  }

  if (!film) {
    film = { id: 'dune-part-two', tmdbId: 693134, slug: 'dune-part-two', title: 'Dune: Part Two', year: '2024' };
  }

  currentActiveMovie = film;
  saveWatchProgress(film, Math.floor(Math.random() * 40) + 20);

  let chosenServer = 'vidlink';
  if (typeof serverOrSlug === 'string' && validServers.includes(serverOrSlug)) {
    chosenServer = serverOrSlug;
  }

  if (typeof CinexaPlayer !== 'undefined') {
    CinexaPlayer.openPlayer(film, chosenServer);
  }
}

// =========================================================================
// 7. 4K MULTI-QUALITY DOWNLOAD HUB
// =========================================================================

function openDownloadModal(slugOrId) {
  let film = currentActiveMovie;
  if (slugOrId) {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    const found = catalog.find(m => m.slug === slugOrId || m.id === slugOrId);
    if (found) film = found;
  }
  if (!film) film = getCurrentSlideMovie();
  currentDownloadMovie = film;

  const overlay = document.getElementById('download-modal-overlay');
  const posterImg = document.getElementById('download-modal-poster');
  const title = document.getElementById('download-modal-title');
  const year = document.getElementById('download-modal-year');

  if (posterImg) {
    posterImg.src = film.posterUrl || film.poster || film.backdropUrl || getPosterFallbackSvg(film.title, film.year);
  }
  if (title) title.innerText = film.title;
  if (year) year.innerText = `${film.year || '2024'} • ${film.audio || 'Dolby Atmos Master'}`;

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }
}

function closeDownloadModal() {
  const overlay = document.getElementById('download-modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function executeDownload(quality = '4k') {
  const film = currentDownloadMovie || currentActiveMovie || getCurrentSlideMovie();
  closeDownloadModal();
  if (typeof downloadFilmDirect === 'function') {
    downloadFilmDirect(film.slug || film.id, quality);
  } else {
    showToast(`⚡ Initializing 4K Direct Download for "${film.title}"...`);
  }
}

function copyTorrentMagnet() {
  const film = currentDownloadMovie || currentActiveMovie || getCurrentSlideMovie();
  const safeName = encodeURIComponent((film.title || 'Movie') + '.' + (film.year || '2024') + '.2160p.UHD.HDR.x265-CINEXA');
  const magnet = `magnet:?xt=urn:btih:dune24kcinexauhdmaster718293847291&dn=${safeName}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(magnet).then(() => {
      showToast(`Magnet URI for "${film.title}" copied to clipboard!`);
    }).catch(() => {
      showToast(`Magnet link generated for "${film.title}"`);
    });
  } else {
    showToast(`Magnet link ready for "${film.title}"`);
  }
}

// =========================================================================
// 8. HD VIDEO TRAILER CINEMA MODAL
// =========================================================================

const KNOWN_TRAILERS = {
  'dune-part-two': 'Way9Dexny3w',
  'oppenheimer': 'uYPbbksJxIg',
  'spirited-away': 'ByXuk9QqQkk',
  'kalki-2898-ad': 'kQDd1AhGIHk',
  'parasite': '5xH0R_stw8E',
  'interstellar': 'zSWdZVtXT7E',
  'rrr': 'GY4BgdUSpbE',
  'leo': 'Po3jStA673E',
  'jawan': 'COv52Qyctws',
  'your-name': 's0wTdCQoc2k',
  'suzume': '6c-g75U46uU'
};

function openTrailerModal(movie) {
  const film = movie || currentActiveMovie || getCurrentSlideMovie();
  const overlay = document.getElementById('trailer-modal-overlay');
  const title = document.getElementById('trailer-modal-title');
  const iframe = document.getElementById('trailer-iframe');

  if (!overlay || !iframe) return;

  const id = film.slug || film.id;
  let trailerKey = film.trailerId || KNOWN_TRAILERS[id];
  let embedUrl = '';

  if (trailerKey) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;
  } else {
    embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(film.title + ' ' + (film.year || '') + ' official trailer 4K')}&autoplay=1`;
  }

  if (title) title.innerText = `${film.title} (${film.year || '2024'}) — Official Trailer`;
  iframe.src = embedUrl;

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
}

function watchCurrentFilmTrailer() {
  openTrailerModal(currentActiveMovie);
}

function closeTrailerModal() {
  const overlay = document.getElementById('trailer-modal-overlay');
  const iframe = document.getElementById('trailer-iframe');
  if (iframe) iframe.src = '';
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

// =========================================================================
// 9. "SURPRISE ME" RANDOM MOVIE PICKER
// =========================================================================

function triggerSurpriseMe() {
  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : FEATURED_SLIDES;
  const topFilms = catalog.filter(m => (parseFloat(m.imdbRating) || 0) >= 7.8);
  const pool = topFilms.length > 0 ? topFilms : catalog;
  const randomPick = pool[Math.floor(Math.random() * pool.length)];

  currentSurpriseMovie = randomPick;

  const overlay = document.getElementById('surprise-modal-overlay');
  const title = document.getElementById('surprise-movie-title');
  const meta = document.getElementById('surprise-movie-meta');
  const poster = document.getElementById('surprise-movie-poster');
  const synopsis = document.getElementById('surprise-movie-synopsis');

  if (title) title.innerText = randomPick.title;
  if (meta) meta.innerText = `${randomPick.year || '2024'} • ★ ${randomPick.imdbRating || '8.2'} • ${randomPick.country || '4K Master'}`;
  if (poster) {
    poster.src = randomPick.posterUrl || randomPick.poster || randomPick.backdropUrl || getPosterFallbackSvg(randomPick.title, randomPick.year);
    poster.onerror = function() { this.src = getPosterFallbackSvg(randomPick.title, randomPick.year); };
  }
  if (synopsis) synopsis.innerText = randomPick.synopsis || randomPick.overview || 'A cinematic masterpiece streaming now in 4K UHD.';

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }
}

function closeSurpriseModal() {
  const overlay = document.getElementById('surprise-modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function watchSurpriseMovie() {
  if (currentSurpriseMovie) {
    closeSurpriseModal();
    playCurrentFilmInPlayer(currentSurpriseMovie.slug || currentSurpriseMovie.id);
  }
}

// =========================================================================
// 10. KEYBOARD SHORTCUTS & NATIVE SHARE
// =========================================================================

function shareFilmDirect() {
  const film = currentActiveMovie || getCurrentSlideMovie();
  const shareUrl = `${window.location.origin}/#movie/${film.slug || film.id}`;

  if (navigator.share) {
    navigator.share({
      title: `${film.title} — Watch on Cinexa`,
      text: `Stream ${film.title} (${film.year || '2024'}) in 4K UHD on Cinexa!`,
      url: shareUrl
    }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast(`Link to "${film.title}" copied to clipboard!`);
    });
  } else {
    showToast(`Share URL: ${shareUrl}`);
  }
}

// =========================================================================
// 11. GLOBAL SEARCH MODAL (⌘K / Ctrl+K)
// =========================================================================

function openModal(state) {
  const overlay = document.getElementById('command-modal-overlay');
  const input = document.getElementById('modal-search-input');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }
  if (input) {
    input.value = '';
    handleModalSearch('');
    setTimeout(() => input.focus(), 50);
  }
}

function closeModal() {
  const overlay = document.getElementById('command-modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

let modalSearchDebounceTimer = null;
function handleModalSearch(val) {
  if (modalSearchDebounceTimer) clearTimeout(modalSearchDebounceTimer);
  modalSearchDebounceTimer = setTimeout(() => {
    _renderModalSearchResults(val);
  }, 60);
}

function _renderModalSearchResults(val) {
  const container = document.getElementById('modal-content-area');
  if (!container) return;

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  const q = (val || '').toLowerCase().trim();

  let matches = catalog;
  if (q.length > 0) {
    matches = catalog.filter(m => 
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q)) ||
      (m.country && m.country.toLowerCase().includes(q)) ||
      (m.genres && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(q)))
    );
  }

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-driftwood">
        <span class="material-symbols-outlined text-3xl text-text-muted mb-2">search_off</span>
        <h4 class="font-serif text-base text-parchment font-medium mb-1">No matches found for "${val}"</h4>
        <p class="text-xs text-driftwood">Try searching by movie title, actor, or genre.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.slice(0, 10).map(m => {
    const poster = m.posterUrl || m.poster || m.backdropUrl || getPosterFallbackSvg(m.title, m.year);
    const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
    return `
      <div class="p-3 hover:bg-surface-container-high flex items-center justify-between gap-3 cursor-pointer group transition-colors" onclick="closeModal(); openFilmDetails('${m.slug || m.id}')">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-[54px] rounded overflow-hidden bg-black flex-shrink-0 border border-white/10">
            <img src="${poster}" alt="${m.title}" class="w-full h-full object-cover" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')">
          </div>
          <div class="min-w-0 space-y-0.5">
            <h4 class="font-sans font-semibold text-xs text-parchment group-hover:text-primary truncate">${m.title}</h4>
            <div class="flex items-center gap-2 font-mono text-[10px] text-driftwood">
              <span>${m.year || '2024'}</span>
              <span>•</span>
              <span class="text-tertiary">${m.country || '4K UHD'}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="font-mono text-xs text-primary font-medium">★ ${m.imdbRating || '8.0'}</span>
          <kbd class="font-mono text-[10px] text-text-muted bg-surface-container-lowest px-1.5 py-0.5 rounded border border-white/10">↵</kbd>
        </div>
      </div>
    `;
  }).join('');
}

// =========================================================================
// 12. LEGAL & ATTRIBUTION MODALS
// =========================================================================

function openLegalModal(type = 'terms') {
  const overlay = document.getElementById('legal-modal-overlay');
  const titleEl = document.getElementById('legal-modal-title');
  const bodyEl = document.getElementById('legal-modal-body');

  if (!overlay || !titleEl || !bodyEl) return;

  if (type === 'terms') {
    titleEl.innerText = 'Terms of Service';
    bodyEl.innerHTML = `
      <div class="space-y-2.5">
        <p class="font-semibold text-primary">1. Streaming Index</p>
        <p>Cinexa is a catalog directory and media player client. We do not host or store unauthorized video files on our own servers. All streams are embedded via public third-party providers.</p>
        <p class="font-semibold text-primary">2. Personal Use</p>
        <p>Patrons agree to utilize Cinexa exclusively for personal study, scholarship, and cultural appreciation.</p>
      </div>
    `;
  } else if (type === 'fairuse') {
    titleEl.innerText = 'DMCA & Fair Use Notice';
    bodyEl.innerHTML = `
      <div class="space-y-2.5">
        <p class="font-semibold text-primary">DMCA Compliance (17 U.S.C. § 512)</p>
        <p>Cinexa respects the intellectual property rights of all copyright holders. If you believe your copyrighted material is improperly linked or indexed, you may send a formal takedown request to our stewards.</p>
        <p>Please include: identification of the work, the specific link/title on Cinexa, and your verified contact details.</p>
      </div>
    `;
  } else if (type === 'tmdb') {
    titleEl.innerText = 'The Movie Database (TMDB) Attribution';
    bodyEl.innerHTML = `
      <div class="space-y-2.5">
        <div class="p-3 bg-surface-container-high rounded-xl border border-primary/30 flex items-center gap-3">
          <span class="material-symbols-outlined text-primary text-xl">verified</span>
          <span class="font-mono text-xs text-primary font-bold">TMDB API INTEGRATED</span>
        </div>
        <p>This product uses the TMDB API to fetch movie metadata and artwork but is not officially endorsed or certified by TMDB.</p>
      </div>
    `;
  }

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
}

function closeLegalModal() {
  const overlay = document.getElementById('legal-modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

// =========================================================================
// 13. TOAST NOTIFICATIONS, KEYBOARD SHORTCUTS & HASH NAVIGATION
// =========================================================================

function showToast(message) {
  const toast = document.getElementById('watchlist-toast');
  const msgEl = document.getElementById('toast-message');
  if (!toast) return;

  if (msgEl) msgEl.innerText = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-12');
  toast.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-12');
  }, 3000);
}

window.addEventListener('keydown', (e) => {
  // Ignore if user is typing in search input
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    if (e.key === 'Escape') closeModal();
    return;
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openModal('results');
  }
  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    e.preventDefault();
    
  }
  if (e.key === 'ArrowRight') {
    nextSlide();
  }
  if (e.key === 'ArrowLeft') {
    prevSlide();
  }
  if (e.key.toLowerCase() === 'f') {
    const video = document.getElementById('custom-video-player');
    if (video && document.getElementById('player-modal').classList.contains('active')) {
      if (!document.fullscreenElement) video.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    }
  }
  if (e.key === 'Escape') {
    closeModal();
    closeLegalModal();
    closeDownloadModal();
    closeTrailerModal();
    closeSurpriseModal();
    closeShortcutsModal();
    if (typeof CinexaPlayer !== 'undefined') CinexaPlayer.closePlayer();
  }
});

function handleHashNavigation() {
  const hash = window.location.hash;
  if (hash.startsWith('#movie/')) {
    const slug = hash.replace('#movie/', '');
    if (slug) openFilmDetails(slug);
  }
}

window.addEventListener('hashchange', handleHashNavigation);

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initFeaturedSlideshow();
  renderDiscoverCatalog();
  filterTrendingRows('all');
  renderContinueWatchingRow();
  handleHashNavigation();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  const toastUndo = document.getElementById('toast-undo');
  if (toastUndo) {
    toastUndo.onclick = () => {
      const toast = document.getElementById('watchlist-toast');
      if (toast) {
        toast.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
        toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-12');
      }
    };
  }
});
