/**
 * CINEXA: 1:1 Google Stitch Screen Controller & Architecture
 * Implements exact interaction logic for:
 * - Home Tab with 5-Film Hero Rotator & Ranked Carousels
 * - Discover Tab with Filter Drawer & Dynamic Catalog
 * - My Library Tab with 2x2 Bento, Sub-views & Stacked Folios
 * - Film Details Screen with 35mm Dossier & Principals
 * - Full Cinema 4K Player with Guaranteed Local Prank Video Playback
 */

// Global State
let currentScreen = 'home';
let currentActiveMovie = null;
let currentHeroIndex = 0;
let heroInterval = null;
let watchlistSet = new Set(['15859', 'dune-part-two', 'past-lives', 'perfect-days']);
let toastTimer = null;

// Hero Dataset matching Google Stitch exactly
const HERO_SLIDES = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    eyebrow: 'Featured Tonight • 35mm Restoration',
    badge: 'Cannes 2024 Selection',
    score: '8.6',
    year: '2024',
    runtime: '2h 46m',
    age: 'PG-13',
    format: '4K IMAX',
    backdrop: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-MC-h5lk7YkD5MNIiSZ-1aG4s_CyLuC6rBB6Jt-5lk6-gnpF51DoOlYkcvQfQcMYnxTd7Zvks3VbvFCalX-rVrZ8WeMmNb7jTyEI3iJl1Yt1uhpVf8HS36J7_pye-7LOqeRW7AfPb6eoB8E2svbB_77hO4iX9Zqwq_ucz9x6HqUXFjXl413chiVyIIAzdeRI11RY--zmV8OnL5roAXHlQESvssuTDwSo3DdWpgiu6QS-HMML58BEflA',
    poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyku_D-ZrJrNumdCokiq_uLKcsmGH-qr8IkklJ0eqy3PQIbC4OhPKq-Lb4IfhsC0a3rsDuKUjYXYoyEHuJMXSqtU4xtvKXjwzHClvVMs5ong8YhNs8mSPSBPfIwS7kjH9XR8639FQNPNz3m0K6NlDhPmwLR8-dJsfRVr1w9qib8e7SWqXgc1VkTdwRD3dcA9ys2phsYcwPjAzGR_CewROJs3iOSbYQNBr2LmmcXXxNSzuYTbrF8TdeiA',
    director: 'Denis Villeneuve',
    tagline: '“Long live the fighters.”',
    koreanTitle: '듄: 파트 2',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.'
  },
  {
    id: '15859',
    slug: 'a-moment-to-remember',
    title: 'A Moment to Remember',
    eyebrow: 'Korean New Wave • 35mm Master Print',
    badge: 'KOFA National Archive',
    score: '8.1',
    year: '2004',
    runtime: '2h 24m',
    age: '18+',
    format: '35MM RESTORED',
    backdrop: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVb0KYX5d4CFr--DTJjgsBQNx5cyqB99o5HOupL3VX5H3lPUVNjRSY8JRhtx5zsMCZp7m2E1tlNUHCJJhow-jzRq8hT3Kd1vt4htcfL_7hNY83EZSLkpLReebgYx-z3eIQ3FGWfHihM-lJjwufxJE9yeVxzRSmIcQtUzMgs0raPr66ypks9kW6lPAEot92yipm9wIBjAgvvLfC9VPOggNkvvGyde9EEl5xa2Km0ULkxq0fSFx6FR0_Gg',
    poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSTC5wSXrmEcdSE9fVYj4_TU4OiMIF3m-L5zQ-nT0cxgtaApyVrVdN0spo2DJcPcMO-YHdo3TUMXD9NvINA5x56F0pe_62Kx0eEk8WgbYq6BFAfc3wcC-h1fur5XKM77SCeMtYWiUG2gRiSXRC-QeXFmUmf0VGMYyOISTqpWapKgCeMuD3Qi1_A4UGXwpg_klkORXxfqwoZe6SYTn1mcEbvLsMeVeLZlPIizgsHYAVuy2Up2AcT_0gNw',
    director: 'John H. Lee',
    tagline: '“If my memory disappears, what will become of our love?”',
    koreanTitle: '내 머리 속의 지우개',
    synopsis: 'Su-jin and Chul-soo build a tender, passionate life together despite family resistance. But when early-onset Alzheimer\'s strikes Su-jin in the prime of her youth, their unbreakable devotion faces the ultimate test of human memory and love.'
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    eyebrow: 'Large Format 70mm • Director\'s Cut',
    badge: 'Academy Award Winner',
    score: '8.9',
    year: '2023',
    runtime: '3h 00m',
    age: 'R',
    format: '70MM MASTER',
    backdrop: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrLgSh8vjZHKsJoO4C3Cl3HHcOdEClpnnlHawcpeKIBaoJVCEzy1FMGx1zoGgGpK78lKFgFHV500d-zmbZBgb__imUgq60FL1rx83PlrksjhlPPdumThAJ67Plg5d92tPVLEhIP-GO7VLuQCAvG5ay-RhqMF7H2xeDnDqp7MvMck0MPflekPT_F6w03FyUshYMg2lr3Rbs-j6JTuIkFKCdqLGFb4h8vOyG7G8RR_eNanFrIeBtCL4ejQ',
    poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEkMv40JZ4AesNv90iHIKZok5fd242hTID6RcvhHG71fOu_9Hz4n8iCOfK4DXKmVNLchc51kwjB8Xd6mynQ74tMa-3XxwpoWzePizsmfuJwQs4QTv1FMefwIIwbdTjTFldwRKRWBorldnAhbpanskCfxppRmoIbbshdUIyJ713CgkA9Y82jpqSoTClU-h35YHwCfGMMUogPG7fxjRXE_o9V8brO3svkHPbCnXS5a076XWytkIcRQKP9g',
    director: 'Christopher Nolan',
    tagline: '“The world changes forever.”',
    koreanTitle: '오펜하이머',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, examining the moral weight and devastating geopolitical fallout of scientific invention.'
  },
  {
    id: 'poor-things',
    title: 'Poor Things',
    eyebrow: 'Surrealist Gothic • 35mm Ektachrome',
    badge: 'Venice Golden Lion',
    score: '8.2',
    year: '2023',
    runtime: '2h 21m',
    age: 'R',
    format: '35MM VIVID',
    backdrop: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsV6AknYsRaJ0IxxbnYrmeEqsLhuo-rAiBJPq8h43ZQOsh6XNBiCKkdgT0tHI1Yr1GBHKR3m3qBlE9yBTEhieeRlLYbt1B-cBwxAd1qg-0iUnkVGedR4x1tcQ4Rtl_jyYWFQKLzGJgcTJdpqQYFYNg0VXoOkq8vdUO28-YQV-8asdWDW7HCFVtlR9XG4u4gktUdyhscQ4DsZBsxcJ8jUx07OYUSUHhw_XT2VqOfn9WlpwIJLkMSyY6KQ',
    poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsV6AknYsRaJ0IxxbnYrmeEqsLhuo-rAiBJPq8h43ZQOsh6XNBiCKkdgT0tHI1Yr1GBHKR3m3qBlE9yBTEhieeRlLYbt1B-cBwxAd1qg-0iUnkVGedR4x1tcQ4Rtl_jyYWFQKLzGJgcTJdpqQYFYNg0VXoOkq8vdUO28-YQV-8asdWDW7HCFVtlR9XG4u4gktUdyhscQ4DsZBsxcJ8jUx07OYUSUHhw_XT2VqOfn9WlpwIJLkMSyY6KQ',
    director: 'Yorgos Lanthimos',
    tagline: '“She\'s like nothing you\'ve ever seen.”',
    koreanTitle: '가여운 것들',
    synopsis: 'Brought back to life by an unorthodox scientist, a young woman embarks on a whirlwind adventure across continents, experiencing liberation and existential discovery free from the prejudices of her time.'
  },
  {
    id: 'past-lives',
    title: 'Past Lives',
    eyebrow: 'Intimate Romance • 35mm Photochemical',
    badge: 'Berlin Film Festival',
    score: '8.4',
    year: '2023',
    runtime: '1h 46m',
    age: 'PG-13',
    format: 'A24 ARCHIVE',
    backdrop: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8KbkCHDehCMOk6Imf6VokPlpl0MSeb4orkJCDybSAyC-0BDFxM6MsFfU3cZqfwW8-bcTxianyWQUvGMO6yUbZJ3SjRKKq2iJPlyoEWKGYriu8sP1zOsJ4QgmnZm7p4yhExGalCHDmgTdxakuBL0znrEfRvtuGtF3-5zB6XI5MKjv1ewib5_5STVWIUh3P5wVijloY1kg7tpajrlD9x50q41DdfWeZr7rrz8dXsxKn0Q7moj1wpGEz8A',
    poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0hOrXNS3hE1AAGc5W2NsG-k_BFSKm9Z4XIJgM1GnZgpS6SCfDGqTYGJUQ8DxHWbqoTNsjhd_YC27k0dcVJ5WQiYrXdqq4BKffs0qJ0kdrKsXewYsZY2QrWFPPIASrn16A43uI_aylwOWKqFLl0BwsV88AzC56ULuESI2qqqQg2wjn5Rl9d6xWhgCEou1lHd47b4O7riW-3PctKzBPDEz9u8WUc08dFC9LBCIGdU0MP-0US4htGGYZUw',
    director: 'Celine Song',
    tagline: '“What if we never let go?”',
    koreanTitle: '패스트 라이브즈',
    synopsis: 'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora\'s family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week as they confront notions of destiny and love.'
  }
];

// =========================================================================
// 1. MAIN SCREEN SWITCHER
// =========================================================================

function switchMainScreen(screenName) {
  currentScreen = screenName;

  const screens = ['home', 'discover', 'library', 'details'];
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

  // Update Bottom Navigation Tab State
  document.querySelectorAll('#main-bottom-nav .tab-item').forEach(tab => {
    const path = tab.getAttribute('data-path');
    const indicator = tab.querySelector('.tab-indicator');
    if (path === screenName) {
      tab.classList.remove('text-on-surface-variant');
      tab.classList.add('text-primary');
      if (indicator) indicator.classList.remove('opacity-0');
      if (indicator) indicator.classList.add('opacity-100');
    } else {
      tab.classList.remove('text-primary');
      tab.classList.add('text-on-surface-variant');
      if (indicator) indicator.classList.remove('opacity-100');
      if (indicator) indicator.classList.add('opacity-0');
    }
  });

  // Render content if needed
  if (screenName === 'discover') {
    renderDiscoverCatalog();
  } else if (screenName === 'home') {
    renderHomeCatalog();
  }

  // Scroll to Top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================================
// 2. HERO SLIDER LOGIC
// =========================================================================

function setHeroSlide(index) {
  currentHeroIndex = index;
  const slide = HERO_SLIDES[index];
  if (!slide) return;

  const bg = document.getElementById('hero-backdrop');
  const badge = document.getElementById('hero-badge');
  const eyebrow = document.getElementById('hero-eyebrow');
  const title = document.getElementById('hero-title');
  const score = document.getElementById('hero-score');
  const year = document.getElementById('hero-year');
  const runtime = document.getElementById('hero-runtime');
  const age = document.getElementById('hero-age');
  const format = document.getElementById('hero-format');

  if (bg) bg.style.backgroundImage = `url('${slide.backdrop}')`;
  if (badge) badge.textContent = slide.badge;
  if (eyebrow) eyebrow.textContent = slide.eyebrow;
  if (title) title.textContent = slide.title;
  if (score) score.textContent = slide.score;
  if (year) year.textContent = slide.year;
  if (runtime) runtime.textContent = slide.runtime;
  if (age) age.textContent = slide.age;
  if (format) format.textContent = slide.format;

  // Update dots
  const dotsContainer = document.getElementById('hero-dots');
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('span');
    dots.forEach((d, i) => {
      if (i === index) {
        d.className = 'w-6 h-1.5 rounded-full bg-primary transition-all duration-300 cursor-pointer';
      } else {
        d.className = 'w-1.5 h-1.5 rounded-full bg-surface-container-highest transition-all duration-300 cursor-pointer';
      }
    });
  }

  currentActiveMovie = slide;
}

function initHeroSlider() {
  setHeroSlide(0);
  clearInterval(heroInterval);
  heroInterval = setInterval(() => {
    const nextIdx = (currentHeroIndex + 1) % HERO_SLIDES.length;
    setHeroSlide(nextIdx);
  }, 7000);

  const btnWatch = document.getElementById('btn-hero-watch');
  if (btnWatch) {
    btnWatch.addEventListener('click', () => {
      playCurrentFilmInPlayer();
    });
  }

  const btnBookmark = document.getElementById('btn-hero-bookmark');
  if (btnBookmark) {
    btnBookmark.addEventListener('click', () => {
      const slide = HERO_SLIDES[currentHeroIndex];
      toggleWatchlist(slide);
    });
  }

  const btnInfo = document.getElementById('btn-hero-info');
  if (btnInfo) {
    btnInfo.addEventListener('click', () => {
      const slide = HERO_SLIDES[currentHeroIndex];
      openFilmDetails(slide);
    });
  }
}

// =========================================================================
// 3. CATALOG RENDERING (Home & Discover)
// =========================================================================

function createFilmCard(movie) {
  const card = document.createElement('div');
  card.className = 'film-card group relative flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-md cursor-pointer';

  const badgeText = movie.resolution?.includes('4K') ? '4K' : (movie.year >= 2024 ? 'NEW' : '35MM');

  card.innerHTML = `
    <div class="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-high">
      <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${movie.poster || 'https://via.placeholder.com/300x450'}" alt="${movie.title}" loading="lazy"/>
      <div class="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-80"></div>
      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm">
        <span class="font-label-sm text-label-sm text-secondary">${badgeText}</span>
      </div>
      <button class="bookmark-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform">
        <span class="material-symbols-outlined text-[16px]">bookmark_border</span>
      </button>
      <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-on-surface">
        <span class="font-label-sm text-label-sm text-tertiary bg-on-tertiary-container/40 px-1.5 py-0.5 rounded">Stream</span>
        <div class="flex items-center gap-1 bg-surface-container-lowest/70 px-1.5 py-0.5 rounded">
          <span class="material-symbols-outlined text-primary text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
          <span class="font-label-sm text-label-sm text-primary">${movie.imdbRating || '8.0'}</span>
        </div>
      </div>
    </div>
    <div class="p-3 flex flex-col gap-1">
      <h2 class="font-headline-sm text-[16px] leading-5 text-on-surface font-semibold line-clamp-1">${movie.title}</h2>
      <div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
        <span>${movie.year || '2024'}</span>
        <span class="truncate max-w-[100px]">${movie.director || 'Director'}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.closest('.bookmark-btn')) {
      e.stopPropagation();
      toggleWatchlist(movie);
      return;
    }
    openFilmDetails(movie);
  });

  return card;
}

function renderDiscoverCatalog() {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];
  catalog.slice(0, 36).forEach(m => {
    grid.appendChild(createFilmCard(m));
  });
}

function renderHomeCatalog() {
  const grid = document.getElementById('home-catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];
  catalog.filter(m => !m.hidden && m.id !== '15859').slice(0, 16).forEach(m => {
    grid.appendChild(createFilmCard(m));
  });
}

// =========================================================================
// 4. FILM DETAILS OPENER & POPULATION
// =========================================================================

function openFilmBySlug(slug) {
  const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];
  const match = catalog.find(m => m.slug === slug || m.id === slug) || HERO_SLIDES.find(h => h.id === slug || h.slug === slug);
  if (match) {
    openFilmDetails(match);
  }
}

function openFilmDetails(movie) {
  currentActiveMovie = movie;

  const bg = document.getElementById('details-hero-img');
  const poster = document.getElementById('details-poster-img');
  const title = document.getElementById('details-title');
  const korean = document.getElementById('details-korean-title');
  const tagline = document.getElementById('details-tagline');
  const score = document.getElementById('details-score');
  const matchEl = document.getElementById('details-match');
  const duration = document.getElementById('details-duration');
  const age = document.getElementById('details-age');
  const synopsis = document.getElementById('details-synopsis');

  if (bg) bg.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;
  if (poster) poster.src = movie.poster || 'https://via.placeholder.com/300x450';
  if (title) title.textContent = movie.title;
  if (korean) korean.innerHTML = `${movie.koreanTitle || movie.title} <span class="font-label-sm text-label-sm text-outline not-italic ml-1">(${movie.year || '2024'})</span>`;
  if (tagline) tagline.textContent = movie.tagline || '“If my memory disappears, what will become of our love?”';
  if (score) score.textContent = movie.imdbRating || movie.score || '8.2';
  if (matchEl) matchEl.textContent = movie.matchScore || '98% MATCH';
  if (duration) duration.textContent = movie.duration || movie.runtime || '2h 15m';
  if (age) age.textContent = movie.rating || movie.age || '18+';
  if (synopsis) synopsis.textContent = movie.synopsis || 'Curated overview currently archiving.';

  switchMainScreen('details');
}

// =========================================================================
// 5. CINEMA 4K PLAYER & PRANK VIDEO STREAM LOGIC
// =========================================================================

function playCurrentFilmInPlayer(serverType = 'local') {
  const playerModal = document.getElementById('player-modal');
  if (!playerModal) return;

  const movie = currentActiveMovie || HERO_SLIDES[1];
  const title = document.getElementById('player-movie-title');
  if (title) title.textContent = `${movie.title} (${movie.year || '2024'})`;

  const customVideo = document.getElementById('custom-video-player');
  const iframe = document.getElementById('video-iframe');

  // PRANK CHECK: If "A Moment to Remember", stream local prank video file!
  const isPrank = movie.id === '15859' || movie.slug === 'a-moment-to-remember' || movie.title?.toLowerCase().includes('moment to remember');

  if (isPrank && serverType === 'local') {
    if (iframe) iframe.style.display = 'none';
    if (customVideo) {
      customVideo.style.display = 'block';
      customVideo.src = '/subtitles/0918 (1).mp4';
      customVideo.play().catch(e => console.log('Playback:', e));
    }
  } else {
    if (customVideo) customVideo.style.display = 'none';
    if (iframe) {
      iframe.style.display = 'block';
      iframe.src = `https://vidsrc.to/embed/movie/${movie.id || '15859'}`;
    }
  }

  playerModal.classList.add('active');
}

// Player close
const closePlayerBtn = document.getElementById('close-player-btn');
if (closePlayerBtn) {
  closePlayerBtn.addEventListener('click', () => {
    const playerModal = document.getElementById('player-modal');
    if (playerModal) playerModal.classList.remove('active');
    const customVideo = document.getElementById('custom-video-player');
    if (customVideo) {
      customVideo.pause();
      customVideo.src = '';
    }
    const iframe = document.getElementById('video-iframe');
    if (iframe) iframe.src = '';
  });
}

// Player Server Buttons
document.querySelectorAll('.server-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sType = btn.getAttribute('data-server');
    playCurrentFilmInPlayer(sType);
  });
});

// =========================================================================
// 6. LIBRARY SUB-VIEWS & CONTROLS
// =========================================================================

function switchLibrarySubView(view) {
  switchMainScreen('library');

  const libView = document.getElementById('view-library-content');
  const searchView = document.getElementById('view-search');
  const emptyView = document.getElementById('view-empty');

  const libBtn = document.getElementById('view-library-btn');
  const searchBtn = document.getElementById('view-search-btn');
  const emptyBtn = document.getElementById('view-empty-btn');

  // Reset
  if (libView) libView.classList.add('hidden');
  if (searchView) searchView.classList.add('hidden');
  if (emptyView) emptyView.classList.add('hidden');

  [libBtn, searchBtn, emptyBtn].forEach(b => {
    if (b) b.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 text-on-surface-variant hover:text-on-surface cursor-pointer';
  });

  const activeClasses = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 bg-primary text-on-primary font-bold shadow-sm cursor-pointer';

  if (view === 'library') {
    if (libView) libView.classList.remove('hidden');
    if (libBtn) libBtn.className = activeClasses;
  } else if (view === 'search') {
    if (searchView) searchView.classList.remove('hidden');
    if (searchBtn) searchBtn.className = activeClasses;
    renderSearchOverlayResults();
  } else if (view === 'empty') {
    if (emptyView) emptyView.classList.remove('hidden');
    if (emptyBtn) emptyBtn.className = activeClasses;
  }
}

function renderSearchOverlayResults() {
  const grid = document.getElementById('overlay-results-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];
  catalog.slice(0, 18).forEach(m => {
    const item = document.createElement('div');
    item.className = 'flex flex-col group cursor-pointer';
    item.innerHTML = `
      <div class="w-full aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-lowest shadow relative mb-1.5">
        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${m.poster || 'https://via.placeholder.com/200x300'}" alt="${m.title}"/>
        <div class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur text-primary font-label-sm text-[10px] font-bold">
          ★ ${m.imdbRating || '8.0'}
        </div>
      </div>
      <span class="font-headline-sm text-[13px] text-on-surface font-semibold truncate leading-tight">${m.title}</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${m.year || '2024'} • ${m.country || 'World'}</span>
    `;
    item.addEventListener('click', () => {
      openFilmDetails(m);
    });
    grid.appendChild(item);
  });
}

function toggleLayout(type) {
  const listBtn = document.getElementById('toggle-list-btn');
  const gridBtn = document.getElementById('toggle-grid-btn');
  const rows = document.getElementById('library-film-rows');

  if (type === 'list') {
    if (listBtn) listBtn.className = 'w-9 h-9 flex items-center justify-center rounded bg-surface-container-high text-primary shadow-sm transition-all';
    if (gridBtn) gridBtn.className = 'w-9 h-9 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface transition-all';
    if (rows) rows.className = 'px-5 flex flex-col gap-2.5 mb-7';
  } else {
    if (gridBtn) gridBtn.className = 'w-9 h-9 flex items-center justify-center rounded bg-surface-container-high text-primary shadow-sm transition-all';
    if (listBtn) listBtn.className = 'w-9 h-9 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface transition-all';
    if (rows) rows.className = 'px-5 grid grid-cols-2 gap-3 mb-7';
  }
}

// =========================================================================
// 7. TOAST NOTIFICATIONS & WATCHLIST
// =========================================================================

function showToast(msg) {
  const toast = document.getElementById('watchlist-toast');
  const textEl = document.getElementById('toast-text');
  if (!toast) return;

  if (textEl) textEl.innerHTML = msg;

  toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 4000);
}

function toggleWatchlist(movie) {
  const id = movie.id || movie.slug;
  if (watchlistSet.has(id)) {
    watchlistSet.delete(id);
    showToast(`Removed from Watchlist: <span class="text-primary font-medium">${movie.title}</span>`);
  } else {
    watchlistSet.add(id);
    showToast(`Added to Watchlist • <span class="text-primary font-medium">${movie.title}</span>`);
  }
}

// =========================================================================
// 8. MODALS & ACCORDIONS
// =========================================================================

function openEditorialModal() {
  const modal = document.getElementById('editorialModalOverlay');
  if (modal) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
  }
}

function closeEditorialModal() {
  const modal = document.getElementById('editorialModalOverlay');
  if (modal) {
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0', 'pointer-events-none');
  }
}

function openDownloadHubModal() {
  showToast('4K IMAX Master file queued for download.');
}

// =========================================================================
// 9. INITIALIZATION
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  renderHomeCatalog();
  renderDiscoverCatalog();

  // Accordion Where to Watch
  const accBtn = document.getElementById('providers-accordion-trigger');
  const accContent = document.getElementById('providers-content');
  const accArrow = document.getElementById('providers-accordion-arrow');
  if (accBtn && accContent) {
    accBtn.addEventListener('click', () => {
      const isHidden = accContent.classList.contains('hidden');
      if (isHidden) {
        accContent.classList.remove('hidden');
        if (accArrow) accArrow.classList.add('rotate-180');
      } else {
        accContent.classList.add('hidden');
        if (accArrow) accArrow.classList.remove('rotate-180');
      }
    });
  }

  // Filter Drawer
  const openFilter = document.getElementById('openFilterBtn');
  const drawerOverlay = document.getElementById('filterDrawerOverlay');
  const drawerContent = document.getElementById('filterDrawerContent');
  const closeFilter = document.getElementById('closeFilterSheetBtn');

  if (openFilter && drawerOverlay && drawerContent) {
    openFilter.addEventListener('click', () => {
      drawerOverlay.classList.remove('opacity-0', 'pointer-events-none');
      drawerOverlay.classList.add('opacity-100');
      drawerContent.classList.remove('translate-y-full');
      drawerContent.classList.add('translate-y-0');
    });

    closeFilter?.addEventListener('click', () => {
      drawerOverlay.classList.remove('opacity-100');
      drawerOverlay.classList.add('opacity-0', 'pointer-events-none');
      drawerContent.classList.remove('translate-y-0');
      drawerContent.classList.add('translate-y-full');
      showToast('3 Curatorial Filters Applied');
    });

    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) {
        drawerOverlay.classList.remove('opacity-100');
        drawerOverlay.classList.add('opacity-0', 'pointer-events-none');
        drawerContent.classList.remove('translate-y-0');
        drawerContent.classList.add('translate-y-full');
      }
    });
  }

  console.log('[Cinexa] 1:1 Google Stitch screens initialized.');
});
