/**
 * CINEXA: Google Stitch Master Controller & Architecture
 * Complete implementation of Stitch Navigation, Featured Hero Slideshow,
 * Discover Filter Matrix, Trending Snap Carousels, 5★ Rating Dialog, and 4K Player.
 */

// Global State
let currentScreen = 'discover';
let currentActiveMovie = null;
let watchlistSet = new Set(['15859', 'dune-part-two', 'past-lives', 'perfect-days']);
let toastTimer = null;
let currentSelectedRating = 5;

// =========================================================================
// 1. FEATURED HERO SLIDESHOW DATA & ENGINE
// =========================================================================

const FEATURED_SLIDES = [
  {
    id: 'dune-part-two',
    slug: 'dune-part-two',
    title: 'Dune: Part Two',
    category: 'top-recommendation',
    categoryLabel: '✨ Top Recommendation',
    year: '2024',
    duration: '2h 46m',
    rating: 'PG-13',
    score: '8.6',
    matchScore: '99% Match',
    resolution: '4K IMAX Enhanced',
    audio: 'Dolby Atmos 5.1',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, wrestling with ominous visions of a holy war consuming the universe.',
    quote: '“A visual and sonic triumph of contemporary sci-fi filmmaking.” — Sight & Sound',
    backdrop: 'https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    accentColor: '#ecc077'
  },
  {
    id: 'oppenheimer',
    slug: 'oppenheimer',
    title: 'Oppenheimer',
    category: 'current-trending',
    categoryLabel: '⚡ Current Trending',
    year: '2023',
    duration: '3h 00m',
    rating: 'R',
    score: '8.9',
    matchScore: '99% Match',
    resolution: '70MM Ultra Panavision',
    audio: 'Dolby Atmos',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
    synopsis: 'The pulse-pounding chronicle of J. Robert Oppenheimer and his role leading the secret Los Alamos laboratory in the creation of the atomic bomb.',
    quote: '“Nolan’s magnum opus: terrifying, monumental, and visually breathtaking.” — Cahiers du Cinéma',
    backdrop: 'https://image.tmdb.org/t/p/original/7CENyUim29IEsaJhUxIGymCRvPu.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    accentColor: '#ffb5a1'
  },
  {
    id: 'past-lives',
    slug: 'past-lives',
    title: 'Past Lives',
    category: 'peoples-favorite',
    categoryLabel: '🔥 People’s Favorite',
    year: '2023',
    duration: '1h 45m',
    rating: 'PG-13',
    score: '8.4',
    matchScore: '98% Match',
    resolution: '35MM Restored',
    audio: 'Korean/English Stereo',
    director: 'Celine Song',
    cast: 'Greta Lee, Teo Yoo, John Magaro',
    synopsis: 'Nora and Hae Sung, two deeply connected childhood friends, are separated when her family emigrates from South Korea. Two decades later, they are reunited for one fateful week in New York.',
    quote: '“A heartbreakingly delicate exploration of In-Yun (destiny) and enduring love.” — The New Yorker',
    backdrop: 'https://image.tmdb.org/t/p/original/7HR38hMBl23lf38MAN63y4pKsHz.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg',
    accentColor: '#b1cdbb'
  },
  {
    id: 'spirited-away',
    slug: 'spirited-away',
    title: 'Spirited Away',
    category: 'top-recommendation',
    categoryLabel: '✨ Top Recommendation',
    year: '2001',
    duration: '2h 05m',
    rating: 'PG',
    score: '8.6',
    matchScore: '99% Match',
    resolution: '4K Studio Ghibli Master',
    audio: 'Japanese 5.1 / Atmos',
    director: 'Hayao Miyazaki',
    cast: 'Rumi Hiiragi, Miyu Irino, Mari Natsuki',
    synopsis: 'Ten-year-old Chihiro wanders into a wondrous world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    quote: '“One of the greatest achievements in hand-drawn animation in human history.” — Roger Ebert',
    backdrop: 'https://image.tmdb.org/t/p/original/6oaL4DP75yABrd5EbC4H2zq5ghc.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    accentColor: '#c9a05b'
  },
  {
    id: 'parasite',
    slug: 'parasite',
    title: 'Parasite',
    category: 'award-winners',
    categoryLabel: '🏆 Criterion Laureate',
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
    quote: '“A masterclass in razor-sharp social satire, pacing, and tension.” — Criterion Collection',
    backdrop: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    accentColor: '#ecc077'
  },
  {
    id: 'interstellar',
    slug: 'interstellar',
    title: 'Interstellar',
    category: 'peoples-favorite',
    categoryLabel: '🔥 People’s Favorite',
    year: '2014',
    duration: '2h 49m',
    rating: 'PG-13',
    score: '8.7',
    matchScore: '99% Match',
    resolution: '4K IMAX Laser',
    audio: 'Dolby Atmos',
    director: 'Christopher Nolan',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft through a wormhole to find a new planet for humanity.',
    quote: '“An emotional, cosmic adventure that transcends space and time.” — Empire Magazine',
    backdrop: 'https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    accentColor: '#8DA897'
  },
  {
    id: '15859',
    slug: 'a-moment-to-remember',
    title: 'A Moment to Remember',
    category: 'top-recommendation',
    categoryLabel: '✨ Top Recommendation',
    year: '2004',
    duration: '2h 24m',
    rating: '18+',
    score: '8.1',
    matchScore: '99% Match',
    resolution: '4K Remastered',
    audio: 'Korean Dolby 5.1',
    director: 'John H. Lee (Lee Jae-han)',
    cast: 'Son Ye-jin, Jung Woo-sung, Baek Jong-hak',
    synopsis: 'A tender romance between Su-jin and Chul-soo faces the ultimate test when early-onset Alzheimer’s threatens to erase the memories of their love.',
    quote: '“A timeless masterpiece of Korean melodrama that captures the pure essence of devotion.” — Cine21',
    backdrop: '/images/moment-to-remember-backdrop.jpg',
    poster: '/images/moment-to-remember-backdrop.jpg',
    accentColor: '#C0705A'
  }
];

let slideshowState = {
  activeCategory: 'all',
  filteredSlides: [...FEATURED_SLIDES],
  currentIndex: 0,
  timer: null,
  timerInterval: 5000,
  isPaused: false
};

function initFeaturedSlideshow() {
  renderSlideThumbnails();
  renderSlideProgressDots();
  renderSlide(0);
  startSlideTimer();

  // Pause on hover or touch
  const container = document.getElementById('hero-slideshow-container');
  if (container) {
    container.onmouseenter = () => { slideshowState.isPaused = true; };
    container.onmouseleave = () => { slideshowState.isPaused = false; };
    
    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    container.ontouchstart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      slideshowState.isPaused = true;
    };
    container.ontouchend = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      slideshowState.isPaused = false;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    };
  }
}

function filterSlideshowCategory(cat) {
  slideshowState.activeCategory = cat;
  
  // Update Tab Button Styles
  const tabBtns = document.querySelectorAll('#slideshow-category-tabs .slide-cat-btn');
  tabBtns.forEach(btn => {
    const btnCat = btn.getAttribute('data-cat');
    if (btnCat === cat) {
      btn.className = 'slide-cat-btn px-4 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider bg-primary text-on-primary font-semibold shadow-sm transition-all duration-200 cursor-pointer';
    } else {
      btn.className = 'slide-cat-btn px-4 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-200 border border-border-hairline/60 cursor-pointer';
    }
  });

  if (cat === 'all') {
    slideshowState.filteredSlides = [...FEATURED_SLIDES];
  } else {
    slideshowState.filteredSlides = FEATURED_SLIDES.filter(s => s.category === cat);
    if (slideshowState.filteredSlides.length === 0) {
      slideshowState.filteredSlides = [...FEATURED_SLIDES];
    }
  }

  slideshowState.currentIndex = 0;
  renderSlideThumbnails();
  renderSlideProgressDots();
  renderSlide(0);
  restartSlideTimer();
}

function renderSlide(index) {
  const slides = slideshowState.filteredSlides;
  if (!slides || slides.length === 0) return;

  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  slideshowState.currentIndex = index;

  const slide = slides[index];

    // Update Backdrop Image
    const bgImg = document.getElementById('slide-bg-img');
    if (bgImg) {
      bgImg.style.opacity = '0.1';
      setTimeout(() => {
        bgImg.src = slide.backdrop || slide.poster || getPosterFallbackSvg(slide.title, slide.year);
        bgImg.onerror = function() { handlePosterError(this, slide.title, slide.year); };
        bgImg.style.opacity = '0.35';
      }, 150);
    }

    // Update Texts
    const titleEl = document.getElementById('slide-title');
    const quoteEl = document.getElementById('slide-quote');
    const catTextEl = document.getElementById('slide-category-text');
    const resBadge = document.getElementById('slide-resolution-badge');
    const audioBadge = document.getElementById('slide-audio-badge');
    const yearEl = document.getElementById('slide-year');
    const durationEl = document.getElementById('slide-duration');
    const ratingEl = document.getElementById('slide-rating');
    const imdbEl = document.getElementById('slide-imdb');
    const matchEl = document.getElementById('slide-match');
    const directorEl = document.getElementById('slide-director');
    const synopsisEl = document.getElementById('slide-synopsis');
    const castEl = document.getElementById('slide-cast');
    const posterImg = document.getElementById('slide-poster-img');
    const counterText = document.getElementById('slide-counter-text');
    const watchlistText = document.getElementById('slide-watchlist-text');

    if (titleEl) titleEl.innerText = slide.title;
    if (quoteEl) quoteEl.innerText = slide.quote || '';
    if (catTextEl) catTextEl.innerText = slide.categoryLabel || '✨ Curated Feature';
    if (resBadge) resBadge.innerText = slide.resolution || '4K Ultra HD';
    if (audioBadge) audioBadge.innerText = slide.audio || 'Dolby Atmos';
    if (yearEl) yearEl.innerText = slide.year || '2024';
    if (durationEl) durationEl.innerText = slide.duration || '2h';
    if (ratingEl) ratingEl.innerText = slide.rating || 'PG-13';
    if (imdbEl) imdbEl.innerHTML = `<span class="material-symbols-outlined text-[14px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${slide.score || '8.5'} IMDb`;
    if (matchEl) matchEl.innerText = slide.matchScore || '99% Match';
    if (directorEl) directorEl.innerText = `Dir. ${slide.director || 'Curated Master'}`;
    if (synopsisEl) synopsisEl.innerText = slide.synopsis || '';
    if (castEl) castEl.innerText = slide.cast || '';
    
    if (posterImg) {
      posterImg.src = slide.poster || slide.backdrop || getPosterFallbackSvg(slide.title, slide.year);
      posterImg.onerror = function() { handlePosterError(this, slide.title, slide.year); };
    }

    if (counterText) {
      counterText.innerText = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }

    if (watchlistText) {
      const isSaved = watchlistSet.has(slide.id) || watchlistSet.has(slide.slug);
      watchlistText.innerText = isSaved ? 'In Watchlist' : 'Watchlist';
    }

    // Update Active Thumbnail & Progress Dots
    updateActiveThumbnailUI(index);
  }

  function renderSlideThumbnails() {
    const deck = document.getElementById('slide-thumbnails-deck');
    if (!deck) return;

    const slides = slideshowState.filteredSlides;
    deck.innerHTML = slides.map((s, idx) => {
      const poster = s.poster || s.backdrop || getPosterFallbackSvg(s.title, s.year);
      const safeTitle = (s.title || 'Film').replace(/'/g, "\\'");
      return `
        <button class="slide-thumb-btn group relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-border-hairline/60 transition-all duration-300 hover:border-primary cursor-pointer ${idx === slideshowState.currentIndex ? 'ring-2 ring-primary border-primary scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}" data-index="${idx}" onclick="goToSlide(${idx})">
          <img src="${poster}" alt="${s.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onerror="handlePosterError(this, '${safeTitle}', '${s.year || '4K'}')"/>
          <div class="absolute inset-0 bg-surface/30 group-hover:bg-transparent transition-colors"></div>
        </button>
      `;
    }).join('');
  }

function renderSlideProgressDots() {
  const dotsContainer = document.getElementById('slide-progress-dots');
  if (!dotsContainer) return;

  const slides = slideshowState.filteredSlides;
  dotsContainer.innerHTML = slides.map((_, idx) => `
    <button class="slide-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === slideshowState.currentIndex ? 'w-8 bg-primary shadow-[0_0_8px_rgba(201,160,91,0.5)]' : 'w-2 bg-surface-container-highest hover:bg-outline'}" onclick="goToSlide(${idx})" aria-label="Go to slide ${idx + 1}"></button>
  `).join('');
}

function getPosterFallbackSvg(title, year) {
  const safeTitle = (title || 'Film').replace(/[<>&"]/g, '');
  const safeYear = (year || '4K').replace(/[<>&"]/g, '');
  const gradients = [
    ['#152126', '#09151a', '#ecc077'],
    ['#1e1424', '#0d0714', '#f472b6'],
    ['#0e1e18', '#050f0c', '#b1cdbb'],
    ['#261515', '#120505', '#ffb5a1'],
    ['#181c26', '#080c14', '#93c5fd']
  ];
  let hash = 0;
  for (let i = 0; i < safeTitle.length; i++) hash = (hash + safeTitle.charCodeAt(i)) % gradients.length;
  const [c1, c2, cAccent] = gradients[hash];

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

function updateActiveThumbnailUI(activeIndex) {
  // Update thumbnails
  const thumbs = document.querySelectorAll('#slide-thumbnails-deck .slide-thumb-btn');
  const deck = document.getElementById('slide-thumbnails-deck');

  thumbs.forEach((th, idx) => {
    if (idx === activeIndex) {
      th.className = 'slide-thumb-btn group relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-primary ring-2 ring-primary scale-105 shadow-md opacity-100 cursor-pointer';
      // ONLY scroll the deck container horizontally; NEVER call window/page scrollIntoView
      if (deck) {
        const targetScroll = th.offsetLeft - deck.offsetLeft - (deck.clientWidth / 2) + (th.clientWidth / 2);
        deck.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    } else {
      th.className = 'slide-thumb-btn group relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-border-hairline/60 opacity-60 hover:opacity-100 transition-all cursor-pointer';
    }
  });

  // Update dots
  const dots = document.querySelectorAll('#slide-progress-dots .slide-dot');
  dots.forEach((dot, idx) => {
    if (idx === activeIndex) {
      dot.className = 'slide-dot h-1.5 w-8 rounded-full bg-primary shadow-[0_0_8px_rgba(201,160,91,0.5)] transition-all duration-300 cursor-pointer';
    } else {
      dot.className = 'slide-dot h-1.5 w-2 rounded-full bg-surface-container-highest hover:bg-outline transition-all duration-300 cursor-pointer';
    }
  });
}

function nextSlide() {
  const nextIdx = slideshowState.currentIndex + 1;
  renderSlide(nextIdx);
  restartSlideTimer();
}

function prevSlide() {
  const prevIdx = slideshowState.currentIndex - 1;
  renderSlide(prevIdx);
  restartSlideTimer();
}

function goToSlide(index) {
  renderSlide(index);
  restartSlideTimer();
}

function startSlideTimer() {
  if (slideshowState.timer) clearInterval(slideshowState.timer);
  slideshowState.timer = setInterval(() => {
    if (!slideshowState.isPaused) {
      nextSlide();
    }
  }, slideshowState.timerInterval);
}

function stopSlideTimer() {
  if (slideshowState.timer) clearInterval(slideshowState.timer);
}

function restartSlideTimer() {
  stopSlideTimer();
  startSlideTimer();
}

function getCurrentSlideMovie() {
  const slides = slideshowState.filteredSlides;
  return slides[slideshowState.currentIndex] || FEATURED_SLIDES[0];
}

function playSlideMovie() {
  const slide = getCurrentSlideMovie();
  playCurrentFilmInPlayer(slide.slug || slide.id);
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
    showToast(`Removed "${slide.title}" from your Watchlist.`);
  } else {
    watchlistSet.add(id);
    if (btnText) btnText.innerText = 'In Watchlist';
    showToast(`Added "${slide.title}" to your Watchlist.`);
  }
}

function openSlideRating() {
  const slide = getCurrentSlideMovie();
  openRatingDialogModal(slide.slug || slide.id);
}

// =========================================================================
// 2. NAVIGATION & SCREEN CONTROLLER
// =========================================================================

function switchMainScreen(screenName) {
  currentScreen = screenName;

  const screens = ['discover', 'home', 'library', 'details', 'specs'];
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

  // Update Nav Links
  document.querySelectorAll('#main-nav-links .nav-link').forEach(link => {
    const nav = link.getAttribute('data-nav');
    if (nav === screenName || (screenName === 'home' && nav === 'trending')) {
      link.classList.add('active', 'text-parchment');
      link.classList.remove('text-driftwood');
    } else if (nav) {
      link.classList.remove('active', 'text-parchment');
      link.classList.add('text-driftwood');
    }
  });

  // Render dynamic catalog grids when entering screen
  if (screenName === 'discover') {
    renderDiscoverCatalog();
  }

  // Smooth scroll
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================================
// 3. DISCOVER FILTER MATRIX & MOVEMENTS CONTROLLER
// =========================================================================

function switchState(state) {
  // Discover page views
  const gridView = document.getElementById('view-filtered-grid');
  const genreView = document.getElementById('view-genre-tiles');
  const btnGrid = document.getElementById('btn-state-grid');
  const btnGenres = document.getElementById('btn-state-genres');
  const pillGrid = document.getElementById('toggle-grid-pill');
  const pillGenre = document.getElementById('toggle-genre-pill');

  // Home / Trending view state buttons
  const btnStd = document.getElementById('btn-view-standard');
  const btnHov = document.getElementById('btn-view-hover');
  const btnSkel = document.getElementById('btn-view-skeleton');

  if (state === 'grid') {
    if (gridView) gridView.classList.remove('hidden');
    if (genreView) genreView.classList.add('hidden');

    if (btnGrid) btnGrid.className = 'font-label-sm text-label-sm uppercase px-4 py-2 rounded-full transition-all duration-200 bg-primary-container text-on-primary font-semibold cursor-pointer';
    if (btnGenres) btnGenres.className = 'font-label-sm text-label-sm uppercase px-4 py-2 rounded-full transition-all duration-200 bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer';

    if (pillGrid) pillGrid.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-medium transition-all cursor-pointer';
    if (pillGenre) pillGenre.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all cursor-pointer';
  } else if (state === 'genres') {
    if (gridView) gridView.classList.add('hidden');
    if (genreView) genreView.classList.remove('hidden');

    if (btnGrid) btnGrid.className = 'font-label-sm text-label-sm uppercase px-4 py-2 rounded-full transition-all duration-200 bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer';
    if (btnGenres) btnGenres.className = 'font-label-sm text-label-sm uppercase px-4 py-2 rounded-full transition-all duration-200 bg-primary-container text-on-primary font-semibold cursor-pointer';

    if (pillGrid) pillGrid.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all cursor-pointer';
    if (pillGenre) pillGenre.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-medium transition-all cursor-pointer';
  } else if (state === 'standard') {
    if (btnStd) btnStd.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-primary text-on-primary font-semibold transition-all duration-200 shadow-sm cursor-pointer';
    if (btnHov) btnHov.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all duration-200 border border-outline-variant/40 cursor-pointer';
    if (btnSkel) btnSkel.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all duration-200 border border-outline-variant/40 cursor-pointer';
    filterTrendingRows('all');
    showToast('Display State: Standard Archival View');
  } else if (state === 'hover-showcase') {
    if (btnStd) btnStd.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all duration-200 border border-outline-variant/40 cursor-pointer';
    if (btnHov) btnHov.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-primary text-on-primary font-semibold transition-all duration-200 shadow-sm cursor-pointer';
    if (btnSkel) btnSkel.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all duration-200 border border-outline-variant/40 cursor-pointer';
    showToast('Inspect State: Interactive Card Hover Dynamics Active');
  } else if (state === 'skeletons-only') {
    if (btnStd) btnStd.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all duration-200 border border-outline-variant/40 cursor-pointer';
    if (btnHov) btnHov.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all duration-200 border border-outline-variant/40 cursor-pointer';
    if (btnSkel) btnSkel.className = 'px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-[0.08em] bg-primary text-on-primary font-semibold transition-all duration-200 shadow-sm cursor-pointer';
    showToast('Loading State: Simulating Curatorial Shimmer...');
    setTimeout(() => {
      switchState('standard');
    }, 1200);
  }
}

function openMovementsTab() {
  switchMainScreen('discover');
  switchState('genres');
}

function filterCatalogByMovement(movementKey) {
  switchState('grid');
  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  let filtered = catalog;

  if (movementKey === 'sci-fi') {
    filtered = catalog.filter(m => (m.genres && m.genres.some(g => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('action'))) || (m.title && (m.title.toLowerCase().includes('dune') || m.title.toLowerCase().includes('interstellar'))));
  } else if (movementKey === 'korean') {
    filtered = catalog.filter(m => m.country === 'South Korea' || (m.genres && m.genres.some(g => g.toLowerCase().includes('romance') || g.toLowerCase().includes('melodrama'))));
  } else if (movementKey === 'french') {
    filtered = catalog.filter(m => m.country === 'France' || (m.title && (m.title.toLowerCase().includes('anatomy') || m.title.toLowerCase().includes('breathless'))));
  } else if (movementKey === 'thriller') {
    filtered = catalog.filter(m => m.genres && m.genres.some(g => g.toLowerCase().includes('thriller') || g.toLowerCase().includes('horror') || g.toLowerCase().includes('mystery')));
  } else if (movementKey === 'japanese') {
    filtered = catalog.filter(m => m.country === 'Japan' || (m.title && (m.title.toLowerCase().includes('drive my car') || m.title.toLowerCase().includes('monster') || m.title.toLowerCase().includes('perfect days'))));
  } else if (movementKey === 'poetic') {
    filtered = catalog.filter(m => m.country === 'France' || m.year < 1980 || (m.title && (m.title.toLowerCase().includes('mirror') || m.title.toLowerCase().includes('cleo'))));
  }

  renderDiscoverCatalog(filtered);
  showToast(`Filtered: ${filtered.length} films in ${movementKey.toUpperCase()} movement`);
}

function resetFilters() {
  renderDiscoverCatalog();
  showToast('Reset all curatorial filters.');
}

function toggleMobileSheet(show) {
  const sheet = document.getElementById('mobile-filter-modal');
  if (!sheet) return;
  if (show) {
    sheet.classList.remove('hidden');
    sheet.classList.add('flex');
  } else {
    sheet.classList.add('hidden');
    sheet.classList.remove('flex');
  }
}

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
  const regionSelect = document.getElementById('filter-region-select');
  const sortSelect = document.getElementById('filter-sort-select');
  const searchInput = document.getElementById('discover-inline-search');

  const genreVal = (genreSelect ? genreSelect.value : 'all').toLowerCase();
  const audioVal = (audioSelect ? audioSelect.value : 'all').toLowerCase();
  const regionVal = (regionSelect ? regionSelect.value : 'all').toLowerCase();
  const sortVal = (sortSelect ? sortSelect.value : 'rating').toLowerCase();
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? [...KOREAN_MOVIES_CATALOG] : [];
  let filtered = catalog;

  // Search filter
  if (query.length > 0) {
    filtered = filtered.filter(m =>
      (m.title && m.title.toLowerCase().includes(query)) ||
      (m.director && m.director.toLowerCase().includes(query)) ||
      (m.country && m.country.toLowerCase().includes(query)) ||
      (m.genres && m.genres.some(g => g.toLowerCase().includes(query)))
    );
  }

  // Genre filter
  if (genreVal !== 'all') {
    filtered = filtered.filter(m => m.genres && m.genres.some(g => g.toLowerCase().includes(genreVal)));
  }

  // Audio Dubbing filter
  if (audioVal !== 'all') {
    if (audioVal === 'hindi') {
      filtered = filtered.filter(m => m.country === 'India' || (m.audio && m.audio.toLowerCase().includes('hindi')) || ['dune-part-two', 'oppenheimer', 'interstellar', 'avatar-the-way-of-water', 'avengers-endgame', 'parasite', 'spirited-away', '15859'].includes(m.slug || m.id));
    } else if (audioVal === 'tamil') {
      filtered = filtered.filter(m => m.country === 'India' || (m.audio && m.audio.toLowerCase().includes('tamil')) || ['dune-part-two', 'oppenheimer', 'interstellar', 'avengers-endgame'].includes(m.slug || m.id));
    } else if (audioVal === 'telugu') {
      filtered = filtered.filter(m => m.country === 'India' || (m.audio && m.audio.toLowerCase().includes('telugu')) || ['dune-part-two', 'interstellar', 'avengers-endgame'].includes(m.slug || m.id));
    } else if (audioVal === 'english') {
      filtered = filtered.filter(m => m.country === 'United States' || m.country === 'United Kingdom' || (m.audio && m.audio.toLowerCase().includes('english')));
    } else if (audioVal === 'korean') {
      filtered = filtered.filter(m => m.country === 'South Korea' || (m.audio && m.audio.toLowerCase().includes('korean')));
    } else if (audioVal === 'japanese') {
      filtered = filtered.filter(m => m.country === 'Japan' || (m.audio && m.audio.toLowerCase().includes('japanese')));
    }
  }

  // Region filter
  if (regionVal !== 'all') {
    filtered = filtered.filter(m => m.country && m.country.toLowerCase().includes(regionVal));
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

// =========================================================================
// 4. TRENDING ROW CAROUSEL CONTROLS & FILTERING
// =========================================================================

function scrollRow(rowId, direction) {
  const el = document.getElementById(rowId);
  if (el) {
    el.scrollBy({ left: direction * 460, behavior: 'smooth' });
  }
}

function selectChip(btn, category) {
  const container = document.getElementById('chip-container');
  if (container) {
    const allChips = container.querySelectorAll('.chip-item');
    allChips.forEach(c => {
      c.classList.remove('bg-primary', 'text-on-primary', 'font-semibold');
      c.classList.add('text-on-surface-variant', 'border', 'border-outline-variant/40');
    });
    // ONLY scroll the horizontal container; NEVER call window.scrollTo or element.scrollIntoView
    const targetScroll = btn.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (btn.clientWidth / 2);
    container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
  }
  btn.classList.add('bg-primary', 'text-on-primary', 'font-semibold');
  btn.classList.remove('text-on-surface-variant', 'border', 'border-outline-variant/40');

  filterTrendingRows(category);

  if (category === 'all') {
    showToast('Showing all curated releases');
  } else {
    showToast(`Filtering category: ${category.toUpperCase()}`);
  }
}

function filterTrendingRows(category) {
  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  let filtered = catalog;

  if (category === 'blockbuster') {
    filtered = catalog.filter(m => (m.imdbRating && parseFloat(m.imdbRating) >= 8.4) || m.country === 'United States' || m.slug === 'dune-part-two' || m.slug === 'oppenheimer' || m.slug === 'interstellar');
  } else if (category === 'indian') {
    filtered = catalog.filter(m => m.country === 'India' || (m.genres && m.genres.some(g => g.toLowerCase().includes('action') || g.toLowerCase().includes('drama'))));
  } else if (category === 'anime') {
    filtered = catalog.filter(m => m.country === 'Japan' || (m.genres && m.genres.some(g => g.toLowerCase().includes('animation') || g.toLowerCase().includes('anime'))));
  } else if (category === 'world') {
    filtered = catalog.filter(m => m.country !== 'United States');
  } else if (category === 'romance') {
    filtered = catalog.filter(m => m.genres && m.genres.some(g => g.toLowerCase().includes('romance') || g.toLowerCase().includes('melodrama')));
  } else if (category === 'action') {
    filtered = catalog.filter(m => m.genres && m.genres.some(g => g.toLowerCase().includes('action') || g.toLowerCase().includes('thriller') || g.toLowerCase().includes('sci-fi')));
  }

  // Render trending row (12 items)
  const trendingContainer = document.getElementById('carousel-trending');
  if (trendingContainer) {
    trendingContainer.innerHTML = filtered.slice(0, 14).map(m => {
      const poster = m.posterUrl || m.poster || m.backdropUrl || getPosterFallbackSvg(m.title, m.year);
      const rating = m.rating || 'PG-13';
      const score = m.imdbRating || '8.2';
      const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
      return `
        <div class="group relative flex-shrink-0 w-[200px] snap-start transition-all duration-300 cursor-pointer" onclick="openFilmBySlug('${m.slug || m.id}')">
          <div class="relative w-full aspect-[2/3] rounded-[14px] overflow-hidden bg-surface-container border border-outline-variant/30 shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_36px_rgba(5,12,15,0.6),0_0_16px_rgba(201,160,91,0.12)]">
            <img class="w-full h-full object-cover grayscale contrast-[1.15] brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out" src="${poster}" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')" alt="${m.title}"/>
            <div class="absolute inset-0 ring-1 ring-inset ring-parchment/10 rounded-[14px] pointer-events-none"></div>
            <div class="absolute top-2.5 left-2.5 z-10">
              <span class="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant uppercase border border-outline-variant/30">${rating}</span>
            </div>
            <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="h-7 px-3 rounded-full bg-primary text-on-primary font-body-sm text-[11px] font-semibold flex items-center gap-1.5 shadow-sm" onclick="event.stopPropagation(); playCurrentFilmInPlayer('${m.slug || m.id}')">
                <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                <span>Play 4K</span>
              </button>
              <button aria-label="View details" class="w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:text-primary transition-colors">
                <span class="material-symbols-outlined text-[14px]">info</span>
              </button>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <h4 class="font-body-md text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">${m.title}</h4>
            <div class="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
              <span>${m.year || '2024'}</span>
              <span class="text-outline-variant">•</span>
              <span class="text-primary font-medium flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[13px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${score}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Top 10 Numbered Row
  const numberedContainer = document.getElementById('carousel-numbered');
  if (numberedContainer) {
    // Sort by rating for true top 10
    const top10 = [...filtered].sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0)).slice(0, 10);
    numberedContainer.innerHTML = top10.map((m, idx) => {
      const poster = m.posterUrl || m.poster || m.backdropUrl || getPosterFallbackSvg(m.title, m.year);
      const num = idx + 1;
      const score = m.imdbRating || '8.5';
      const tag = m.country || '4K';
      const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
      return `
        <div class="group relative flex-shrink-0 flex items-end snap-start cursor-pointer" onclick="openFilmBySlug('${m.slug || m.id}')">
          <span class="font-serif text-[128px] font-normal leading-none text-transparent select-none pointer-events-none -mr-7 -mb-2 z-0 tracking-tight" style="-webkit-text-stroke: 1.5px #A9A596; opacity: 0.6;">
            ${num}
          </span>
          <div class="relative w-[190px] z-10">
            <div class="relative w-full aspect-[2/3] rounded-[14px] overflow-hidden bg-surface-container border border-outline-variant/30 shadow-md group-hover:-translate-y-1.5 group-hover:border-primary/40 group-hover:shadow-[0_18px_36px_rgba(5,12,15,0.6),0_0_16px_rgba(201,160,91,0.12)] transition-all duration-300">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${poster}" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')" alt="${m.title}"/>
              <div class="absolute inset-0 ring-1 ring-inset ring-parchment/10 rounded-[14px]"></div>
              <div class="absolute top-2.5 left-2.5">
                <span class="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant uppercase border border-outline-variant/30">${tag}</span>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <h4 class="font-body-md text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">${m.title}</h4>
              <div class="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                <span>${m.year || '2024'}</span>
                <span class="text-outline-variant">•</span>
                <span class="text-primary font-medium flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[13px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span> ${score}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Continue Exploring (Wide 16:9 Carousel)
  const wideContainer = document.getElementById('carousel-wide');
  if (wideContainer) {
    const wideFilms = filtered.slice(4, 12);
    wideContainer.innerHTML = wideFilms.map(m => {
      const backdrop = m.backdropUrl || m.backdrop || m.posterUrl || getPosterFallbackSvg(m.title, m.year);
      const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
      return `
        <div class="group relative flex-shrink-0 w-[320px] snap-start cursor-pointer" onclick="playCurrentFilmInPlayer('${m.slug || m.id}')">
          <div class="relative w-full aspect-video rounded-[14px] overflow-hidden bg-surface-container border border-outline-variant/30 shadow-md group-hover:border-primary/40 group-hover:shadow-[0_18px_36px_rgba(5,12,15,0.6)] transition-all duration-300">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${backdrop}" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')" alt="${m.title}"/>
            <div class="absolute inset-0 bg-surface-container-lowest/30 group-hover:bg-surface-container-lowest/10 transition-colors"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-12 rounded-full bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/40 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shadow-md">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
              </div>
            </div>
          </div>
          <div class="mt-3 flex items-start justify-between gap-4">
            <div class="space-y-1 min-w-0">
              <h4 class="font-body-md text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">${m.title}</h4>
              <p class="font-label-sm text-label-sm text-on-surface-variant truncate">${m.director || m.studio || 'Curated Master'}</p>
            </div>
            <button class="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 hover:border-primary/50 text-on-surface hover:text-primary font-label-sm text-label-sm uppercase transition-colors" onclick="event.stopPropagation(); playCurrentFilmInPlayer('${m.slug || m.id}')">
              Play 4K
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// =========================================================================
// 5. LIBRARY SUB-VIEWS & FAST SEARCH
// =========================================================================

function switchLibrarySubView(view) {
  const mainView = document.getElementById('library-subview-main');
  const searchView = document.getElementById('library-subview-search');
  const emptyView = document.getElementById('library-subview-empty');

  const btnLib = document.getElementById('view-library-btn');
  const btnSearch = document.getElementById('view-search-btn');
  const btnEmpty = document.getElementById('view-empty-btn');

  const allBtns = [btnLib, btnSearch, btnEmpty];
  allBtns.forEach(b => {
    if (b) {
      b.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 text-on-surface-variant hover:text-on-surface cursor-pointer';
    }
  });

  if (mainView) mainView.classList.add('hidden');
  if (searchView) searchView.classList.add('hidden');
  if (emptyView) emptyView.classList.add('hidden');

  if (view === 'library') {
    if (mainView) mainView.classList.remove('hidden');
    if (btnLib) btnLib.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 bg-primary text-on-primary font-bold shadow-sm cursor-pointer';
  } else if (view === 'search') {
    if (searchView) searchView.classList.remove('hidden');
    if (btnSearch) btnSearch.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 bg-primary text-on-primary font-bold shadow-sm cursor-pointer';
    const input = document.getElementById('library-search-input');
    if (input) {
      input.focus();
      handleLibrarySearch(input.value || '');
    }
  } else if (view === 'empty') {
    if (emptyView) emptyView.classList.remove('hidden');
    if (btnEmpty) btnEmpty.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 bg-primary text-on-primary font-bold shadow-sm cursor-pointer';
  }
}

let librarySearchTimer = null;
function handleLibrarySearch(query) {
  if (librarySearchTimer) clearTimeout(librarySearchTimer);
  librarySearchTimer = setTimeout(() => {
    const resultsContainer = document.getElementById('library-search-results');
    if (!resultsContainer) return;

    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    const q = (query || '').toLowerCase().trim();

    let matches = catalog.slice(0, 16);
    if (q.length > 0) {
      matches = catalog.filter(m =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        (m.genres && m.genres.some(g => g.toLowerCase().includes(q)))
      );
    }

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div class="col-span-full py-12 text-center text-on-surface-variant font-body-sm">
          No matching films found in your personal library for "${query}".
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = matches.map(m => {
      const poster = m.posterUrl || m.poster || m.backdropUrl || '/images/moment-to-remember-backdrop.jpg';
      return `
        <div class="group relative rounded-xl overflow-hidden bg-surface-container border border-border-hairline hover:border-primary/50 transition-all cursor-pointer" onclick="openFilmBySlug('${m.slug || m.id}')">
          <div class="aspect-[2/3] w-full overflow-hidden bg-surface-container-lowest">
            <img src="${poster}" alt="${m.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.onerror=null; this.src='/images/moment-to-remember-backdrop.jpg'">
          </div>
          <div class="p-2.5">
            <h4 class="font-serif text-sm font-medium text-on-surface group-hover:text-primary truncate">${m.title}</h4>
            <div class="flex items-center justify-between text-[11px] font-mono text-outline mt-1">
              <span>${m.year || '2024'}</span>
              <span class="text-primary">★ ${m.imdbRating || '8.0'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }, 100);
}

function filterLibraryCollection(type) {
  const input = document.getElementById('library-search-input');
  if (type === 'all') {
    if (input) input.value = '';
    handleLibrarySearch('');
  } else if (type === 'restorations') {
    if (input) input.value = '35mm';
    handleLibrarySearch('35mm');
  } else if (type === 'imax') {
    if (input) input.value = '4K';
    handleLibrarySearch('4K');
  } else if (type === 'masterpiece') {
    if (input) input.value = 'Masterpiece';
    handleLibrarySearch('drama');
  }
}

// =========================================================================
// 5. SPECS & RESILIENT STATES CONTROLLER
// =========================================================================

function switchSpecTab(mode) {
  const panelGuide = document.getElementById('spec-panel-guide');
  const panel404 = document.getElementById('spec-panel-404');
  const panelOffline = document.getElementById('spec-panel-offline');

  const tabGuide = document.getElementById('spec-tab-guide');
  const tab404 = document.getElementById('spec-tab-404');
  const tabOffline = document.getElementById('spec-tab-offline');

  if (panelGuide) panelGuide.classList.add('hidden');
  if (panel404) panel404.classList.add('hidden');
  if (panelOffline) panelOffline.classList.add('hidden');

  [tabGuide, tab404, tabOffline].forEach(t => {
    if (t) {
      t.className = 'px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider bg-surface-container text-on-surface-variant hover:text-on-surface transition-all duration-200 cursor-pointer border border-border-hairline/60';
    }
  });

  if (mode === 'guide' && panelGuide && tabGuide) {
    panelGuide.classList.remove('hidden');
    tabGuide.className = 'px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider bg-primary text-on-primary font-bold shadow-sm transition-all duration-200 cursor-pointer';
  } else if (mode === '404' && panel404 && tab404) {
    panel404.classList.remove('hidden');
    tab404.className = 'px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider bg-primary text-on-primary font-bold shadow-sm transition-all duration-200 cursor-pointer';
  } else if (mode === 'offline' && panelOffline && tabOffline) {
    panelOffline.classList.remove('hidden');
    tabOffline.className = 'px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider bg-primary text-on-primary font-bold shadow-sm transition-all duration-200 cursor-pointer';
  }
}

function simulateReconnect() {
  const btn = document.getElementById('offline-ping-btn');
  const status = document.getElementById('offline-status-text');
  if (btn) {
    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Verifying Vault...';
    btn.disabled = true;
  }
  setTimeout(() => {
    if (btn) {
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">check_circle</span> Archive Synchronized!';
      btn.className = 'h-10 px-5 rounded-full bg-tertiary text-on-tertiary font-mono text-xs uppercase tracking-wider font-bold transition-all';
    }
    if (status) {
      status.innerText = 'ONLINE • Local Vault Connected • 0ms Latency';
      status.className = 'font-mono text-xs text-tertiary font-medium';
    }
    showToast('Vault Synchronized! 159 Master Films Available Locally.');
  }, 1000);
}

// =========================================================================
// 6. GLOBAL COMMAND PALETTE (⌘K SEARCH MODAL)
// =========================================================================

function openModal(state) {
  const overlay = document.getElementById('command-modal-overlay');
  const input = document.getElementById('modal-search-input');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }
  if (input) {
    if (state === 'results') {
      input.value = '';
      handleModalSearch('');
    } else {
      input.value = 'Unlisted Indie 1999';
      handleModalSearch('Unlisted Indie 1999');
    }
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
      (m.genres && m.genres.some(g => g.toLowerCase().includes(q)))
    );
  }

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="py-14 px-6 text-center">
        <div class="w-10 h-10 rounded-full border border-border-hairline flex items-center justify-center mx-auto mb-3 bg-petrol-base text-driftwood">
          <svg class="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h4 class="font-serif text-lg text-parchment font-medium mb-1">Nothing found for "${val}"</h4>
        <p class="font-sans text-xs text-driftwood mb-5 max-w-xs mx-auto">
          No matches found in Cinexa archive. Verify spelling or explore curated collections.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.slice(0, 10).map(m => {
    const poster = m.posterUrl || m.poster || m.backdropUrl || '/images/moment-to-remember-backdrop.jpg';
    return `
      <div class="p-4 hover:bg-surface-hover flex items-center justify-between gap-4 cursor-pointer group transition-colors" onclick="closeModal(); openFilmDetails('${m.slug || m.id}')">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-10 h-[60px] rounded-md overflow-hidden bg-petrol-base flex-shrink-0 border border-border-hairline">
            <img src="${poster}" alt="${m.title}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/images/moment-to-remember-backdrop.jpg'">
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-serif font-medium text-base text-parchment group-hover:text-brass truncate">${m.title}</h4>
              <span class="font-mono text-[11px] text-text-muted shrink-0">${m.year || '2024'}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-[11px] uppercase tracking-wider text-sage bg-sage/10 px-1.5 py-0.5 rounded border border-sage/20">${m.studio || 'CINEXA 4K'}</span>
              <span class="font-sans text-xs text-driftwood truncate">${m.director || 'Curated Master'}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="font-mono text-xs text-brass font-medium">★ ${m.imdbRating || '8.0'}</span>
          <kbd class="font-mono text-[11px] text-text-muted bg-petrol-base px-1.5 py-0.5 rounded border border-border-hairline/40">↵</kbd>
        </div>
      </div>
    `;
  }).join('');
}

function setSearchPill(cat) {
  const input = document.getElementById('modal-search-input');
  if (input) {
    input.value = cat;
    handleModalSearch(cat);
  }
}

// =========================================================================
// 7. 5-STAR RATING & LOGBOOK DIALOG
// =========================================================================

function openRatingDialogModal(movieSlugOrId) {
  const overlay = document.getElementById('rating-modal-overlay');
  const titleEl = document.getElementById('rating-modal-film-title');
  
  let film = currentActiveMovie || { title: 'A Moment to Remember', year: '2004' };
  if (movieSlugOrId) {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    const found = catalog.find(m => m.slug === movieSlugOrId || m.id === movieSlugOrId);
    if (found) film = found;
  }

  if (titleEl) {
    titleEl.innerText = `${film.title} (${film.year || '2004'})`;
  }

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }

  initStarRatingCluster();
}

function closeRatingDialogModal() {
  const overlay = document.getElementById('rating-modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function initStarRatingCluster() {
  const stars = document.querySelectorAll('#star-rating-cluster .star-rate');
  const scoreText = document.getElementById('star-score-text');

  stars.forEach(star => {
    star.onclick = () => {
      const val = parseInt(star.getAttribute('data-value'), 10);
      currentSelectedRating = val;
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'), 10);
        if (sVal <= val) {
          s.style.fontVariationSettings = "'FILL' 1";
          s.classList.add('text-brass');
          s.classList.remove('text-outline');
        } else {
          s.style.fontVariationSettings = "'FILL' 0";
          s.classList.remove('text-brass');
          s.classList.add('text-outline');
        }
      });
      if (scoreText) {
        scoreText.innerText = `${val}.0 / 5.0 ★ ${val === 5 ? 'Masterpiece' : val >= 4 ? 'Exceptional' : 'Recommended'}`;
      }
    };
  });
}

function saveRatingToJournal() {
  closeRatingDialogModal();
  showToast(`Saved ★ ${currentSelectedRating}.0 rating to your Archival Film Journal!`);
}

// =========================================================================
// 8. FILM DETAILS & CINEMA 4K PLAYER INTEGRATION
// =========================================================================

function openFilmDetails(movieOrSlug) {
  let movie = movieOrSlug;
  if (typeof movieOrSlug === 'string') {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    movie = catalog.find(m => m.slug === movieOrSlug || m.id === movieOrSlug) || {
      title: 'A Moment to Remember',
      year: '2004',
      imdbRating: '8.1',
      poster: '/images/moment-to-remember-backdrop.jpg',
      backdrop: '/images/moment-to-remember-backdrop.jpg'
    };
  }

  currentActiveMovie = movie;

  const heroImg = document.getElementById('details-hero-img');
  const posterImg = document.getElementById('details-poster-img');
  const title = document.getElementById('details-title');
  const koreanTitle = document.getElementById('details-korean-title');
  const tagline = document.getElementById('details-tagline');
  const score = document.getElementById('details-score');
  const duration = document.getElementById('details-duration');
  const age = document.getElementById('details-age');
  const synopsis = document.getElementById('details-synopsis');
  const trailerPoster = document.getElementById('details-trailer-poster');

  const posterSrc = movie.posterUrl || movie.poster || movie.backdropUrl || '/images/moment-to-remember-backdrop.jpg';
  const backdropSrc = movie.backdropUrl || movie.backdrop || movie.posterUrl || '/images/moment-to-remember-backdrop.jpg';

  if (heroImg) heroImg.style.backgroundImage = `url('${backdropSrc}')`;
  if (posterImg) {
    posterImg.src = posterSrc;
    posterImg.onerror = function() { this.src = '/images/moment-to-remember-backdrop.jpg'; };
  }
  if (title) title.innerText = movie.title;
  if (koreanTitle) {
    if (movie.koreanTitle) {
      koreanTitle.innerHTML = `${movie.koreanTitle} <span class="font-label-sm text-outline not-italic ml-1">(${movie.year || '2004'})</span>`;
      koreanTitle.classList.remove('hidden');
    } else {
      koreanTitle.classList.add('hidden');
    }
  }
  if (tagline) tagline.innerText = movie.tagline ? `“${movie.tagline.replace(/^["“”]|["“”]$/g, '')}”` : '';
  if (score) score.innerText = `★ ${movie.imdbRating || '8.1'}`;
  if (duration) duration.innerText = movie.duration || '2h 24m';
  if (age) age.innerText = movie.rating || '18+';
  if (synopsis) synopsis.innerText = movie.synopsis || movie.overview || 'Restored in 4K from the original 35mm negative under curatorial supervision.';
  if (trailerPoster) trailerPoster.style.backgroundImage = `url('${backdropSrc}')`;

  switchMainScreen('details');
}

function openFilmBySlug(slug) {
  openFilmDetails(slug);
}

function toggleDetailsWatchlist() {
  const text = document.getElementById('details-watchlist-text');
  const title = currentActiveMovie ? currentActiveMovie.title : 'Film';
  if (text) {
    if (text.innerText.includes('Add')) {
      text.innerText = 'In Watchlist';
      showToast(`Added "${title}" to your Watchlist.`);
    } else {
      text.innerText = 'Add to Watchlist';
      showToast(`Removed "${title}" from Watchlist.`);
    }
  }
}

function playCurrentFilmInPlayer(serverOrSlug) {
  let film = currentActiveMovie;
  const validServers = ['vidlink', 'multiaudio', 'vidsrc_cc', 'autoembed', 'vidsrc_xyz', 'local', 'fastcdn', 'vidsrc'];

  if (typeof serverOrSlug === 'string' && !validServers.includes(serverOrSlug)) {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    const found = catalog.find(m => m.slug === serverOrSlug || m.id === serverOrSlug);
    if (found) film = found;
  }

  if (!film) {
    film = {
      id: '15859',
      tmdbId: 15859,
      slug: 'a-moment-to-remember',
      title: 'A Moment to Remember',
      year: '2004'
    };
  }

  currentActiveMovie = film;

  const isLocalFilm = film.slug === 'a-moment-to-remember' || film.id === '15859' || (film.title && film.title.toLowerCase().includes('moment to remember'));
  let chosenServer = 'vidlink';

  if (typeof serverOrSlug === 'string' && validServers.includes(serverOrSlug)) {
    chosenServer = serverOrSlug;
  } else if (isLocalFilm) {
    chosenServer = 'local';
  }

  if (typeof CinexaPlayer !== 'undefined') {
    CinexaPlayer.openPlayer(film, chosenServer);
    return;
  }

  const modal = document.getElementById('player-modal');
  const videoEl = document.getElementById('custom-video-player');
  const iframeEl = document.getElementById('video-iframe');

  if (isLocalFilm && chosenServer === 'local') {
    if (iframeEl) iframeEl.style.display = 'none';
    if (videoEl) {
      videoEl.style.display = 'block';
      videoEl.src = '/api/stream?file=0918%20(1).mp4';
      videoEl.play().catch(e => console.log('Autoplay handled:', e));
    }
  } else {
    if (videoEl) videoEl.style.display = 'none';
    if (iframeEl) {
      iframeEl.style.display = 'block';
      iframeEl.src = `https://vidlink.pro/movie/${film.tmdbId || film.id || '15859'}?primaryColor=ecc077&secondaryColor=ede6d6&iconColor=ecc077&title=true&poster=true&autoplay=true`;
    }
  }

  if (modal) modal.classList.add('active');
}

function closePlayerModal() {
  if (typeof CinexaPlayer !== 'undefined') {
    CinexaPlayer.closePlayer();
    return;
  }
  const modal = document.getElementById('player-modal');
  const videoEl = document.getElementById('custom-video-player');
  if (videoEl) videoEl.pause();
  if (modal) modal.classList.remove('active');
}

// =========================================================================
// 9. TOAST NOTIFICATIONS & CATALOG RENDERING
// =========================================================================

function showToast(message) {
  const toast = document.getElementById('watchlist-toast');
  const text = document.getElementById('toast-text');
  if (!toast) return;

  if (text) text.innerHTML = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-12');
  toast.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-12');
  }, 4000);
}

function toggleSlideWatchlistById(id, title) {
  if (watchlistSet.has(id)) {
    watchlistSet.delete(id);
    showToast(`Removed "${title}" from your Watchlist.`);
  } else {
    watchlistSet.add(id);
    showToast(`Added "${title}" to your Watchlist.`);
  }
}

function renderDiscoverCatalog(customList) {
  const grid = document.getElementById('catalogGrid');
  const counter = document.getElementById('discover-counter');
  if (!grid) return;

  const catalog = customList || ((typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : []);
  if (counter) counter.innerText = `${catalog.length} ARCHIVED WORKS`;

  if (catalog.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-on-surface-variant font-body-md space-y-3">
        <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-outline">
          <span class="material-symbols-outlined text-2xl">movie_filter</span>
        </div>
        <p class="text-base text-on-surface font-serif">No matching films found for current criteria.</p>
        <button class="px-4 py-2 rounded-full bg-primary text-on-primary font-mono text-xs uppercase font-bold cursor-pointer" onclick="resetFilters()">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = catalog.map(m => {
    const poster = m.posterUrl || m.poster || m.backdropUrl || '/images/moment-to-remember-backdrop.jpg';
    const rating = m.rating || 'PG-13';
    const score = m.imdbRating || '8.1';
    const format = m.resolution ? m.resolution.toUpperCase() : '4K UHD';
    const id = m.slug || m.id;
    const safeTitle = (m.title || 'Film').replace(/'/g, "\\'");
    const isSaved = watchlistSet.has(id);
    const hasMultiAudio = m.country === 'India' || (m.audio && (m.audio.toLowerCase().includes('hindi') || m.audio.toLowerCase().includes('tamil') || m.audio.toLowerCase().includes('english') || m.audio.toLowerCase().includes('korean')));

    return `
      <article class="group relative flex flex-col bg-surface-container rounded-2xl overflow-hidden shadow-warm-diffuse transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(5,12,15,0.6),0_0_16px_rgba(201,160,91,0.12)] cursor-pointer border border-border-hairline/60" onclick="openFilmDetails('${id}')">
        <div class="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-lowest">
          <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${poster}" alt="${m.title}" loading="lazy" onerror="handlePosterError(this, '${safeTitle}', '${m.year || '4K'}')"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-60"></div>
          
          <div class="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
            <span class="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant uppercase border border-outline-variant/30">${rating}</span>
          </div>
          
          <button aria-label="Save to Watchlist" class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer z-10 ${isSaved ? 'text-primary' : ''}" onclick="event.stopPropagation(); toggleSlideWatchlistById('${id}', '${safeTitle}');">
            <span class="material-symbols-outlined text-[16px]" style="${isSaved ? "font-variation-settings: 'FILL' 1;" : ""}">${isSaved ? 'bookmark' : 'bookmark_border'}</span>
          </button>
          
          <div class="absolute bottom-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5">
            <span class="font-label-sm text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold">${format}</span>
            ${hasMultiAudio ? '<span class="font-label-sm text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-semibold">MULTI-DUB</span>' : ''}
          </div>

          <div class="absolute inset-0 bg-surface-container-lowest/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button class="h-10 px-4 rounded-full bg-primary text-on-primary font-body-sm text-xs font-bold flex items-center gap-1.5 shadow-xl transform scale-95 group-hover:scale-100 transition-transform cursor-pointer" onclick="event.stopPropagation(); playCurrentFilmInPlayer('${id}')">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
              <span>Watch 4K</span>
            </button>
          </div>
        </div>
        
        <div class="p-3.5 flex flex-col flex-1 justify-between gap-2">
          <div>
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="font-label-sm text-xs text-outline">${m.year || '2024'} • ${m.duration || '2h'}</span>
              <span class="font-label-sm text-xs text-primary font-medium flex items-center gap-0.5">
                <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">star</span> ${score}
              </span>
            </div>
            <h3 class="font-headline-sm text-base text-on-surface group-hover:text-primary transition-colors truncate font-serif font-semibold">
              ${m.title}
            </h3>
            <p class="font-body-sm text-xs text-on-surface-variant truncate">${m.director || m.studio || 'Curated Master'}</p>
          </div>
          <div class="pt-2 border-t border-surface-container-highest flex items-center justify-between">
            <span class="font-label-sm text-[11px] text-tertiary font-semibold uppercase">${m.country || 'CINEXA 4K'}</span>
            <span class="font-label-sm text-xs text-primary font-medium flex items-center gap-1 group-hover:underline">
              <span>Details</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// =========================================================================
// 10. FROSTED NAVBAR SCROLL TRIGGER & SHORTCUTS
// =========================================================================

function applyFrostedNav(isFrosted) {
  const navbar = document.getElementById('global-navbar');
  if (!navbar) return;
  if (isFrosted) {
    navbar.classList.add('bg-[#0E1A1F]/90', 'backdrop-blur-[16px]', 'border-[#2C444D]');
    navbar.classList.remove('bg-transparent', 'border-transparent');
  } else {
    navbar.classList.remove('bg-[#0E1A1F]/90', 'backdrop-blur-[16px]', 'border-[#2C444D]');
    navbar.classList.add('bg-transparent', 'border-transparent');
  }
}

function toggleScrollState(scrolled) {
  applyFrostedNav(scrolled);
  if (scrolled) {
    window.scrollTo({ top: 120, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      if (window.scrollY > 40) {
        applyFrostedNav(true);
      } else {
        applyFrostedNav(false);
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// Pause slideshow when tab is hidden to preserve battery & CPU
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    slideshowState.isPaused = true;
  } else {
    slideshowState.isPaused = false;
  }
});

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openModal('results');
  }
  if (e.key === 'ArrowRight') {
    nextSlide();
  }
  if (e.key === 'ArrowLeft') {
    prevSlide();
  }
  if (e.key === 'Escape') {
    closeModal();
    closeRatingDialogModal();
    closePlayerModal();
    toggleMobileSheet(false);
  }
});

// Toast Undo & DOM Init
document.addEventListener('DOMContentLoaded', () => {
  initFeaturedSlideshow();
  renderDiscoverCatalog();
  filterTrendingRows('all');

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
