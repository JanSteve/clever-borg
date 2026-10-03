/**
 * CINEXA: Art-House Editorial Cinematic Application
 * Complete Multi-Screen Implementation (Google Stitch Design System)
 * - Screen 1: Home / Trending & Curated Reels
 * - Screen 2: Discover & Archival Filter Directory
 * - Screen 3: My Library & Archival Vault Bento
 * - Screen 4: Dedicated Film Details & Principals Dossier
 * - Screen 5: Global Command Search Palette (⌘K)
 * - 4K Master Video Player & Guaranteed Local Master Failover
 * - 4K Master Offline Download Hub
 * - Cinematheque Editorial Article Reader
 * - Floating Watchlist Toast Notification System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentView = 'home';
  let activeFilm = null;
  let activeCategory = 'all';
  let searchQuery = '';
  let heroCurrentIndex = 0;
  let heroTimer = null;
  let watchlist = new Set(['15859', 'dune-part-two', 'past-lives', 'perfect-days']);
  let seenList = new Set(['oppenheimer', 'poor-things', 'anatomy-of-a-fall']);
  let activeStreamingServer = 'local';
  let activeSort = 'curator';
  let discoverLayout = 'grid';
  let libraryLayout = 'list';
  let activeFilters = new Set(['Korean Melodrama', '1990s–2000s', 'Stream Only']);

  // Hero Spotlight Rotator Dataset
  const HERO_DATASET = [
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
      tagline: 'Long live the fighters.',
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
      tagline: 'The world changes forever.',
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
      tagline: 'She\'s like nothing you\'ve ever seen.',
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
      tagline: 'What if we never let go?',
      koreanTitle: '패스트 라이브즈',
      synopsis: 'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora\'s family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week as they confront notions of destiny and love.'
    }
  ];

  // DOM Elements
  const header = document.getElementById('global-navbar');
  const viewHome = document.getElementById('view-home');
  const viewDiscover = document.getElementById('view-discover');
  const viewLibrary = document.getElementById('view-library');
  const viewDetails = document.getElementById('preview-page-view');
  const searchModal = document.getElementById('search-modal');
  const filterDrawer = document.getElementById('filterDrawerOverlay');
  const editorialModal = document.getElementById('editorial-modal');
  const downloadModal = document.getElementById('download-hub-modal');
  const playerModal = document.getElementById('player-modal');
  const watchlistToast = document.getElementById('watchlist-toast');

  // =========================================================================
  // 1. NAVIGATION & MULTI-VIEW SYSTEM
  // =========================================================================

  function navigateTo(viewName, movieObj = null) {
    currentView = viewName;

    // Hide all views
    [viewHome, viewDiscover, viewLibrary, viewDetails].forEach(el => {
      if (el) el.classList.remove('active-view');
    });

    // Update active view
    if (viewName === 'home') {
      viewHome.classList.add('active-view');
    } else if (viewName === 'discover') {
      viewDiscover.classList.add('active-view');
      renderDiscoverGrid();
    } else if (viewName === 'library') {
      viewLibrary.classList.add('active-view');
      renderLibraryView();
    } else if (viewName === 'details') {
      viewDetails.classList.add('active-view');
      if (movieObj) {
        populateFilmDetails(movieObj);
      }
    }

    // Update Desktop Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
      const target = link.getAttribute('data-navigate');
      if (target === viewName) {
        link.classList.add('active');
      } else if (target) {
        link.classList.remove('active');
      }
    });

    // Update Mobile Bottom Nav
    document.querySelectorAll('.nav-tab-item').forEach(tab => {
      const target = tab.getAttribute('data-navigate');
      if (target === viewName) {
        tab.classList.add('active');
      } else if (target) {
        tab.classList.remove('active');
      }
    });

    // Smooth Scroll to Top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL hash without reload
    window.location.hash = '#' + viewName;
  }

  // Handle click on all elements with data-navigate
  document.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-navigate]');
    if (navEl) {
      e.preventDefault();
      const target = navEl.getAttribute('data-navigate');
      navigateTo(target);
    }
  });

  // Handle Browser Back / Forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (['home', 'discover', 'library', 'details'].includes(hash) && hash !== currentView) {
      navigateTo(hash);
    }
  });

  // Header Scroll Tint
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // =========================================================================
  // 2. HERO LIVE ROTATOR ENGINE
  // =========================================================================

  function renderHeroItem(index) {
    heroCurrentIndex = index;
    const hero = HERO_DATASET[index];
    if (!hero) return;

    const bgImg = document.getElementById('hero-bg-img');
    const badgeText = document.getElementById('hero-badge-text');
    const eyebrowText = document.getElementById('hero-eyebrow-text');
    const displayTitle = document.getElementById('hero-display-title');
    const scoreVal = document.getElementById('hero-score-val');
    const yearVal = document.getElementById('hero-year-val');
    const runtimeVal = document.getElementById('hero-runtime-val');
    const ageVal = document.getElementById('hero-age-val');
    const formatVal = document.getElementById('hero-format-val');
    const bookmarkIcon = document.getElementById('hero-bookmark-icon');

    if (bgImg) bgImg.src = hero.backdrop;
    if (badgeText) badgeText.textContent = hero.badge;
    if (eyebrowText) eyebrowText.textContent = hero.eyebrow;
    if (displayTitle) displayTitle.textContent = hero.title;
    if (scoreVal) scoreVal.textContent = hero.score;
    if (yearVal) yearVal.textContent = hero.year;
    if (runtimeVal) runtimeVal.textContent = hero.runtime;
    if (ageVal) ageVal.textContent = hero.age;
    if (formatVal) formatVal.textContent = hero.format;

    // Update bookmark icon state
    if (bookmarkIcon) {
      const isSaved = watchlist.has(hero.id) || watchlist.has(hero.slug);
      bookmarkIcon.textContent = isSaved ? 'bookmark_added' : 'bookmark_add';
      bookmarkIcon.style.color = isSaved ? 'var(--primary)' : 'inherit';
    }

    // Update dots
    document.querySelectorAll('.hero-dot').forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      const nextIndex = (heroCurrentIndex + 1) % HERO_DATASET.length;
      renderHeroItem(nextIndex);
    }, 7500);
  }

  // Hero Dots Click
  document.querySelectorAll('.hero-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'), 10);
      renderHeroItem(index);
      startHeroTimer();
    });
  });

  // Hero Play Action
  const btnHeroPlay = document.getElementById('btn-hero-play-action');
  if (btnHeroPlay) {
    btnHeroPlay.addEventListener('click', () => {
      const currentHero = HERO_DATASET[heroCurrentIndex];
      launchPlayerModal(currentHero);
    });
  }

  // Hero Bookmark Action
  const btnHeroWatchlist = document.getElementById('btn-hero-watchlist-action');
  if (btnHeroWatchlist) {
    btnHeroWatchlist.addEventListener('click', () => {
      const currentHero = HERO_DATASET[heroCurrentIndex];
      toggleWatchlist(currentHero);
      renderHeroItem(heroCurrentIndex);
    });
  }

  // Hero Info Action
  const btnHeroInfo = document.getElementById('btn-hero-info-action');
  if (btnHeroInfo) {
    btnHeroInfo.addEventListener('click', () => {
      const currentHero = HERO_DATASET[heroCurrentIndex];
      navigateTo('details', currentHero);
    });
  }

  // =========================================================================
  // 3. CATALOG RENDERING & STICKY FILTER STRIP
  // =========================================================================

  function renderMainCatalog() {
    const container = document.getElementById('catalog-container');
    if (!container) return;

    container.innerHTML = '';
    const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];

    let filtered = [...catalog];

    // Filter out hidden/prank titles during normal browsing
    if (!searchQuery) {
      filtered = filtered.filter(m => !m.hidden && m.id !== '15859');
    }

    if (activeCategory !== 'all') {
      if (activeCategory === 'blockbusters') {
        filtered = filtered.filter(m => m.category === 'blockbusters' || m.category === 'trending');
      } else if (activeCategory === 'world') {
        filtered = filtered.filter(m => m.category === 'world' || m.country !== 'South Korea');
      } else if (activeCategory === 'auteur') {
        filtered = filtered.filter(m => m.category === 'romance' || (m.genres && m.genres.includes('Drama')));
      } else if (activeCategory === 'scifi') {
        filtered = filtered.filter(m => m.category === 'thriller' || (m.genres && (m.genres.includes('Sci-Fi') || m.genres.includes('Action'))));
      } else if (activeCategory === 'restorations' || activeCategory === '4k') {
        filtered = filtered.filter(m => m.resolution && m.resolution.includes('4K'));
      }
    }

    // Grid container
    const grid = document.createElement('div');
    grid.className = 'discover-catalog-grid';

    filtered.slice(0, 36).forEach(movie => {
      grid.appendChild(createFilmPosterCard(movie));
    });

    container.appendChild(grid);
  }

  // Sticky Tab Chips Click
  document.querySelectorAll('.tab-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tab-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-tab') || 'all';
      renderMainCatalog();
    });
  });

  // Create Standard Film Poster Card
  function createFilmPosterCard(movie) {
    const card = document.createElement('div');
    card.className = 'reel-card';
    card.style.width = '100%';

    const isSaved = watchlist.has(movie.id) || watchlist.has(movie.slug);
    const badgeTag = movie.resolution?.includes('4K') ? '4K' : (movie.year >= 2024 ? 'NEW' : '35MM');

    card.innerHTML = `
      <div class="poster-frame">
        <img class="poster-img" src="${movie.poster || 'https://via.placeholder.com/300x450'}" alt="${movie.title}" loading="lazy">
        <div class="poster-overlay-gradient"></div>
        <span class="poster-tag-top-left">${badgeTag}</span>
        <button class="poster-btn-bookmark" aria-label="Save film">
          <span class="material-symbols-outlined" style="font-size: 16px; color: ${isSaved ? 'var(--primary)' : 'inherit'};">
            ${isSaved ? 'bookmark_added' : 'bookmark_add'}
          </span>
        </button>
        <div class="poster-bottom-bar">
          <span class="poster-accolade">${movie.category || 'Cinema'}</span>
          <span class="poster-rating">★ ${movie.imdbRating || '8.0'}</span>
        </div>
      </div>
      <div class="card-title-line">${movie.title}</div>
      <div class="card-sub-line">${movie.year || '2024'} • ${movie.director || 'Director'}</div>
    `;

    // Card click opens Film Details
    card.addEventListener('click', (e) => {
      if (e.target.closest('.poster-btn-bookmark')) {
        e.stopPropagation();
        toggleWatchlist(movie);
        const icon = card.querySelector('.poster-btn-bookmark span');
        const nowSaved = watchlist.has(movie.id) || watchlist.has(movie.slug);
        icon.textContent = nowSaved ? 'bookmark_added' : 'bookmark_add';
        icon.style.color = nowSaved ? 'var(--primary)' : 'inherit';
        return;
      }
      navigateTo('details', movie);
    });

    return card;
  }

  // =========================================================================
  // 4. DISCOVER VIEW & FILTER DRAWER
  // =========================================================================

  function renderDiscoverGrid() {
    const grid = document.getElementById('discover-catalog-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];

    // Filter based on active filters
    let films = [...catalog];
    if (activeFilters.has('Korean Melodrama')) {
      films = films.filter(m => m.country === 'South Korea' || m.category === 'romance');
    }

    films.slice(0, 48).forEach(movie => {
      grid.appendChild(createFilmPosterCard(movie));
    });

    const countLabel = document.getElementById('discover-film-count-label');
    if (countLabel) {
      countLabel.textContent = `${films.length} Films`;
    }
  }

  // State Switcher Buttons (Filtered Grid vs Genre Tiles vs Drawer)
  const btnStateGrid = document.getElementById('btn-state-grid');
  const btnStateGenres = document.getElementById('btn-state-genres');
  const btnStateDrawer = document.getElementById('btn-state-drawer');
  const discoverGrid = document.getElementById('discover-catalog-grid');
  const genreTiles = document.getElementById('discover-genre-tiles');

  if (btnStateGrid && btnStateGenres) {
    btnStateGrid.addEventListener('click', () => {
      btnStateGrid.classList.add('active');
      btnStateGenres.classList.remove('active');
      if (discoverGrid) discoverGrid.style.display = 'grid';
      if (genreTiles) genreTiles.style.display = 'none';
    });

    btnStateGenres.addEventListener('click', () => {
      btnStateGenres.classList.add('active');
      btnStateGrid.classList.remove('active');
      if (discoverGrid) discoverGrid.style.display = 'none';
      if (genreTiles) genreTiles.style.display = 'grid';
    });
  }

  // Filter Drawer Open / Close
  const openFilterBtn = document.getElementById('openFilterBtn');
  const btnApplyFilters = document.getElementById('btn-apply-drawer-filters');
  const resetFiltersInDrawer = document.getElementById('resetFiltersInDrawer');

  if (openFilterBtn) {
    openFilterBtn.addEventListener('click', () => {
      if (filterDrawer) filterDrawer.classList.add('active');
    });
  }

  if (btnStateDrawer) {
    btnStateDrawer.addEventListener('click', () => {
      if (filterDrawer) filterDrawer.classList.add('active');
    });
  }

  if (filterDrawer) {
    filterDrawer.addEventListener('click', (e) => {
      if (e.target === filterDrawer) {
        filterDrawer.classList.remove('active');
      }
    });
  }

  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', () => {
      if (filterDrawer) filterDrawer.classList.remove('active');
      renderDiscoverGrid();
      showWatchlistToast('Filters applied successfully');
    });
  }

  // Selectable Filter Pills
  document.querySelectorAll('.select-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
    });
  });

  // Genre Tile Cards Click
  document.querySelectorAll('.genre-tile-card').forEach(tile => {
    tile.addEventListener('click', () => {
      const genre = tile.getAttribute('data-genre-select');
      btnStateGrid.click();
      showWatchlistToast(`Filtered: ${genre}`);
    });
  });

  // Back to Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 5. MY LIBRARY & ARCHIVAL VAULT
  // =========================================================================

  function renderLibraryView() {
    const listContainer = document.getElementById('library-list-container');
    if (!listContainer) return;

    // Check if empty
    if (watchlist.size === 0 && seenList.size === 0) {
      switchLibrarySubView('empty');
      return;
    }

    switchLibrarySubView('main');
  }

  window.switchLibrarySubView = function(mode) {
    const mainView = document.getElementById('lib-subview-main');
    const emptyView = document.getElementById('lib-subview-empty');
    const btnMain = document.getElementById('lib-switch-main');
    const btnEmpty = document.getElementById('lib-switch-empty');

    if (mode === 'empty') {
      if (mainView) mainView.style.display = 'none';
      if (emptyView) emptyView.style.display = 'flex';
      if (btnMain) btnMain.classList.remove('active');
      if (btnEmpty) btnEmpty.classList.add('active');
    } else {
      if (mainView) mainView.style.display = 'block';
      if (emptyView) emptyView.style.display = 'none';
      if (btnMain) btnMain.classList.add('active');
      if (btnEmpty) btnEmpty.classList.remove('active');
    }
  };

  // Wire library list rows to open Details
  document.querySelectorAll('.archival-list-row').forEach(row => {
    row.addEventListener('click', () => {
      const slug = row.getAttribute('data-slug');
      const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];
      const match = catalog.find(m => m.slug === slug || m.id === slug) || HERO_DATASET.find(h => h.id === slug || h.slug === slug);
      if (match) {
        navigateTo('details', match);
      }
    });
  });

  // =========================================================================
  // 6. FILM DETAILS & PRINCIPALS DOSSIER
  // =========================================================================

  function populateFilmDetails(movie) {
    activeFilm = movie;

    const bgBackdrop = document.getElementById('preview-backdrop');
    const posterImg = document.getElementById('preview-poster-img');
    const titleEl = document.getElementById('preview-main-title');
    const koreanEl = document.getElementById('preview-korean-eyebrow');
    const taglineEl = document.getElementById('preview-tagline');
    const starScore = document.getElementById('preview-star-score');
    const matchEl = document.getElementById('preview-match');
    const durationEl = document.getElementById('preview-meta-duration');
    const ageEl = document.getElementById('preview-meta-age');
    const storylineEl = document.getElementById('preview-storyline-text');
    const bookmarkIcon = document.getElementById('details-bookmark-icon');
    const bookmarkText = document.getElementById('details-bookmark-text');

    if (bgBackdrop) bgBackdrop.src = movie.backdrop || movie.poster || 'https://via.placeholder.com/1280x720';
    if (posterImg) posterImg.src = movie.poster || 'https://via.placeholder.com/300x450';
    if (titleEl) titleEl.textContent = movie.title || 'Untitled Masterpiece';
    if (koreanEl) koreanEl.textContent = `${movie.koreanTitle || movie.title} (${movie.year || '2024'})`;
    if (taglineEl) taglineEl.textContent = movie.tagline || '“Cinema is the preservation of time.”';
    if (starScore) starScore.textContent = `★ ${movie.imdbRating || '8.2'}`;
    if (matchEl) matchEl.textContent = movie.matchScore || '98% MATCH';
    if (durationEl) durationEl.textContent = movie.duration || '2h 15m';
    if (ageEl) ageEl.textContent = movie.rating || (movie.is18Plus ? '18+' : 'PG-13');
    if (storylineEl) storylineEl.textContent = movie.synopsis || movie.storyline || 'Curatorial notes currently archiving.';

    const isSaved = watchlist.has(movie.id) || watchlist.has(movie.slug);
    if (bookmarkIcon) bookmarkIcon.textContent = isSaved ? 'check' : 'add';
    if (bookmarkText) bookmarkText.textContent = isSaved ? 'In Watchlist' : 'Watchlist';
  }

  // Details Action Buttons
  const btnBackDetails = document.getElementById('btn-back-details');
  if (btnBackDetails) {
    btnBackDetails.addEventListener('click', () => {
      navigateTo('home');
    });
  }

  const btnPreviewPlay = document.getElementById('btn-preview-play');
  if (btnPreviewPlay) {
    btnPreviewPlay.addEventListener('click', () => {
      launchPlayerModal(activeFilm || HERO_DATASET[1]);
    });
  }

  const btnPreviewTrailer = document.getElementById('btn-preview-trailer');
  if (btnPreviewTrailer) {
    btnPreviewTrailer.addEventListener('click', () => {
      launchPlayerModal(activeFilm || HERO_DATASET[1], 'trailer');
    });
  }

  const btnPreviewWatchlist = document.getElementById('btn-preview-watchlist');
  if (btnPreviewWatchlist) {
    btnPreviewWatchlist.addEventListener('click', () => {
      if (!activeFilm) return;
      toggleWatchlist(activeFilm);
      populateFilmDetails(activeFilm);
    });
  }

  const btnPreviewSeen = document.getElementById('btn-preview-seen');
  if (btnPreviewSeen) {
    btnPreviewSeen.addEventListener('click', () => {
      if (!activeFilm) return;
      const id = activeFilm.id || activeFilm.slug;
      if (seenList.has(id)) {
        seenList.delete(id);
        showWatchlistToast(`Removed from Logged Films: ${activeFilm.title}`);
      } else {
        seenList.add(id);
        showWatchlistToast(`Marked as Seen: ${activeFilm.title}`);
      }
    });
  }

  const btnPreviewRate = document.getElementById('btn-preview-rate');
  if (btnPreviewRate) {
    btnPreviewRate.addEventListener('click', () => {
      showWatchlistToast(`Rated ★ 5.0 — Added to Curator Ledger`);
    });
  }

  const btnPreviewJournal = document.getElementById('btn-preview-journal');
  if (btnPreviewJournal) {
    btnPreviewJournal.addEventListener('click', () => {
      const note = prompt(`Enter journal note for ${activeFilm?.title || 'Film'}:`);
      if (note) {
        showWatchlistToast(`Note saved to Viewing Journal: "${note.slice(0, 24)}..."`);
      }
    });
  }

  // Where to Watch Accordion Toggle
  const accordionHeader = document.getElementById('providersAccordionHeader');
  const providersList = document.getElementById('providersList');
  const accordionIcon = document.getElementById('providersAccordionIcon');
  if (accordionHeader && providersList) {
    accordionHeader.addEventListener('click', () => {
      const isOpen = providersList.style.display !== 'none';
      providersList.style.display = isOpen ? 'none' : 'flex';
      if (accordionIcon) accordionIcon.textContent = isOpen ? 'expand_more' : 'expand_less';
    });
  }

  window.playCurrentActiveFilm = function(server) {
    launchPlayerModal(activeFilm || HERO_DATASET[1], server);
  };

  // =========================================================================
  // 7. GLOBAL COMMAND SEARCH PALETTE (⌘K)
  // =========================================================================

  function openSearchPalette() {
    if (searchModal) {
      searchModal.classList.add('active');
      const input = document.getElementById('global-search-input');
      if (input) {
        input.focus();
        renderPaletteResults(input.value);
      }
    }
  }

  function closeSearchPalette() {
    if (searchModal) searchModal.classList.remove('active');
  }

  // ⌘K Keyboard Shortcut
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearchPalette();
    }
    if (e.key === 'Escape') {
      closeSearchPalette();
      if (filterDrawer) filterDrawer.classList.remove('active');
      if (editorialModal) editorialModal.classList.remove('active');
      if (downloadModal) downloadModal.classList.remove('active');
    }
  });

  const headerSearchBtn = document.getElementById('header-search-btn');
  if (headerSearchBtn) headerSearchBtn.addEventListener('click', openSearchPalette);

  const mobileSearchBtn = document.getElementById('mobile-search-trigger');
  if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', openSearchPalette);

  const btnClosePalette = document.getElementById('btn-close-palette');
  if (btnClosePalette) btnClosePalette.addEventListener('click', closeSearchPalette);

  const btnClearSearch = document.getElementById('btn-clear-global-search');
  const searchInputField = document.getElementById('global-search-input');

  if (searchInputField) {
    searchInputField.addEventListener('input', (e) => {
      renderPaletteResults(e.target.value);
    });
  }

  if (btnClearSearch && searchInputField) {
    btnClearSearch.addEventListener('click', () => {
      searchInputField.value = '';
      renderPaletteResults('');
    });
  }

  window.executePaletteSearch = function(query) {
    if (searchInputField) {
      searchInputField.value = query;
      renderPaletteResults(query);
    }
  };

  function renderPaletteResults(query) {
    const grid = document.getElementById('palette-results-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];
    const q = (query || '').toLowerCase().trim();

    let matches = catalog.filter(m => {
      // Hidden prank title matching logic
      if (m.id === '15859' || m.slug === 'a-moment-to-remember') {
        return q.includes('moment') || q.includes('remember') || q.includes('지우개') || q.includes('son ye') || q.includes('jung woo');
      }
      if (!q) return true;
      return (m.title && m.title.toLowerCase().includes(q)) ||
             (m.director && m.director.toLowerCase().includes(q)) ||
             (m.year && String(m.year).includes(q)) ||
             (m.category && m.category.toLowerCase().includes(q));
    });

    matches.slice(0, 15).forEach(movie => {
      const item = document.createElement('div');
      item.style.cssText = 'display: flex; flex-direction: column; gap: 6px; cursor: pointer;';
      item.innerHTML = `
        <div style="position: relative; width: 100%; aspect-ratio: 2/3; border-radius: 8px; overflow: hidden; background: var(--bg-surface-lowest); border: 1px solid var(--border-hairline);">
          <img src="${movie.poster || 'https://via.placeholder.com/200x300'}" alt="${movie.title}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; top: 4px; right: 4px; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,0.8); font-family: var(--font-mono); font-size: 9px; color: var(--primary);">★ ${movie.imdbRating || '8.0'}</span>
        </div>
        <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${movie.title}</div>
        <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-secondary);">${movie.year || '2024'} • ${movie.country || 'World'}</div>
      `;

      item.addEventListener('click', () => {
        closeSearchPalette();
        navigateTo('details', movie);
      });

      grid.appendChild(item);
    });
  }

  // =========================================================================
  // 8. 4K CINEMA PLAYER MODAL & PRANK STREAM LOGIC
  // =========================================================================

  function launchPlayerModal(movie, preferredServer = 'local') {
    if (!playerModal) return;

    activeFilm = movie;
    const playerTitle = document.getElementById('player-movie-title');
    if (playerTitle) playerTitle.textContent = `${movie.title} (${movie.year || '2024'})`;

    const iframe = document.getElementById('video-iframe');
    const customVideo = document.getElementById('custom-video-player');

    // PRANK LOGIC & LOCAL MASTER STREAM:
    // If it's "A Moment to Remember" or has local prank video, load directly!
    const isPrankFilm = movie.id === '15859' || movie.slug === 'a-moment-to-remember' || movie.title?.toLowerCase().includes('moment to remember');

    if (isPrankFilm && preferredServer !== 'trailer') {
      if (iframe) iframe.style.display = 'none';
      if (customVideo) {
        customVideo.style.display = 'block';
        customVideo.src = '/subtitles/0918 (1).mp4';
        customVideo.play().catch(e => console.log('Autoplay handled:', e));
      }
    } else if (preferredServer === 'trailer' && movie.trailerUrl) {
      if (customVideo) customVideo.style.display = 'none';
      if (iframe) {
        iframe.style.display = 'block';
        iframe.src = movie.trailerUrl;
      }
    } else {
      // Streambert fast multi-source streaming embed
      if (customVideo) customVideo.style.display = 'none';
      if (iframe) {
        iframe.style.display = 'block';
        iframe.src = `https://vidsrc.to/embed/movie/${movie.id || '15859'}`;
      }
    }

    playerModal.classList.add('active');
  }

  const closePlayerBtn = document.getElementById('close-player-btn');
  if (closePlayerBtn) {
    closePlayerBtn.addEventListener('click', () => {
      if (playerModal) playerModal.classList.remove('active');
      const customVideo = document.getElementById('custom-video-player');
      const iframe = document.getElementById('video-iframe');
      if (customVideo) {
        customVideo.pause();
        customVideo.src = '';
      }
      if (iframe) iframe.src = '';
    });
  }

  // Server Switcher in Player
  document.querySelectorAll('.server-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const server = btn.getAttribute('data-server');
      launchPlayerModal(activeFilm || HERO_DATASET[1], server);
    });
  });

  // =========================================================================
  // 9. WATCHLIST TOAST NOTIFICATION
  // =========================================================================

  let toastTimer = null;

  function showWatchlistToast(msg) {
    if (!watchlistToast) return;

    const toastMsg = document.getElementById('toast-message');
    if (toastMsg) toastMsg.innerHTML = msg;

    const toastCard = watchlistToast.querySelector('.toast-pill-card');
    if (toastCard) toastCard.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toastCard) toastCard.classList.remove('show');
    }, 4500);
  }

  function toggleWatchlist(movie) {
    const id = movie.id || movie.slug;
    if (watchlist.has(id)) {
      watchlist.delete(id);
      showWatchlistToast(`Removed from Watchlist: <span style="color: var(--primary); font-weight: 600;">${movie.title}</span>`);
    } else {
      watchlist.add(id);
      showWatchlistToast(`Added to Watchlist • <span style="color: var(--primary); font-weight: 600;">${movie.title}</span>`);
    }
  }

  const toastUndo = document.getElementById('toast-undo');
  if (toastUndo) {
    toastUndo.addEventListener('click', () => {
      const toastCard = watchlistToast?.querySelector('.toast-pill-card');
      if (toastCard) toastCard.classList.remove('show');
    });
  }

  // =========================================================================
  // 10. EDITORIAL & DOWNLOAD MODALS
  // =========================================================================

  const btnReadEditorial = document.getElementById('btn-read-editorial');
  const btnCloseEditorial = document.getElementById('btn-close-editorial-modal');
  const footerEditorialLink = document.getElementById('footer-editorial-link');

  if (btnReadEditorial) {
    btnReadEditorial.addEventListener('click', () => {
      if (editorialModal) editorialModal.classList.add('active');
    });
  }

  if (footerEditorialLink) {
    footerEditorialLink.addEventListener('click', () => {
      if (editorialModal) editorialModal.classList.add('active');
    });
  }

  if (btnCloseEditorial) {
    btnCloseEditorial.addEventListener('click', () => {
      if (editorialModal) editorialModal.classList.remove('active');
    });
  }

  const btnCloseDownload = document.getElementById('btn-close-download-modal');
  if (btnCloseDownload) {
    btnCloseDownload.addEventListener('click', () => {
      if (downloadModal) downloadModal.classList.remove('active');
    });
  }

  const btnStartDownload = document.getElementById('btn-start-download-simulation');
  if (btnStartDownload) {
    btnStartDownload.addEventListener('click', () => {
      btnStartDownload.textContent = 'Allocating 4K Stream Buffer... 48 MB/s';
      setTimeout(() => {
        btnStartDownload.textContent = 'Direct Master Download Started!';
        showWatchlistToast('4K IMAX Master file queued for download.');
        setTimeout(() => {
          if (downloadModal) downloadModal.classList.remove('active');
          btnStartDownload.textContent = 'Start Direct Download';
        }, 1200);
      }, 1000);
    });
  }

  // =========================================================================
  // 11. INITIALIZATION
  // =========================================================================

  // Reel Card Clicks in Home Section
  document.querySelectorAll('.reel-card, .ranked-card').forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.getAttribute('data-slug');
      const catalog = typeof KOREAN_MOVIES_CATALOG !== 'undefined' ? KOREAN_MOVIES_CATALOG : [];
      const match = catalog.find(m => m.slug === slug || m.id === slug) || HERO_DATASET.find(h => h.id === slug || h.slug === slug);
      if (match) {
        navigateTo('details', match);
      }
    });
  });

  // Initialize view from hash or default to home
  const initialHash = window.location.hash.replace('#', '') || 'home';
  renderHeroItem(0);
  startHeroTimer();
  renderMainCatalog();
  navigateTo(['home', 'discover', 'library', 'details'].includes(initialHash) ? initialHash : 'home');

  console.log('[Cinexa] Art-House Editorial Design System initialized with 5 complete Stitch screens.');
});
