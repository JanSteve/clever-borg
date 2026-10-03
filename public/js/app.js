/**
 * CINEXA: Google Stitch Master Controller & Architecture
 * Complete implementation of Stitch Navigation, Discover Filter Matrix,
 * Trending Snap Carousels, Resilient States, 5★ Rating Dialog, and 4K Player.
 */

// Global State
let currentScreen = 'discover';
let currentActiveMovie = null;
let watchlistSet = new Set(['15859', 'dune-part-two', 'past-lives', 'perfect-days']);
let toastTimer = null;
let currentSelectedRating = 5;

// =========================================================================
// 1. NAVIGATION & SCREEN CONTROLLER
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

  // Ambient backdrop switcher
  const ambientImg = document.getElementById('hero-ambient-img');
  if (ambientImg) {
    if (screenName === 'home' || screenName === 'details') {
      ambientImg.src = '/images/moment-to-remember-backdrop.jpg';
    } else {
      ambientImg.src = '/images/dune-desert-backdrop.jpg';
    }
  }

  // Render dynamic catalog grids when entering screen
  if (screenName === 'discover') {
    renderDiscoverCatalog();
  }

  // Smooth scroll
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================================
// 2. DISCOVER FILTER MATRIX & MOVEMENTS CONTROLLER
// =========================================================================

function switchState(state) {
  const gridView = document.getElementById('view-filtered-grid');
  const genreView = document.getElementById('view-genre-tiles');
  const btnGrid = document.getElementById('btn-state-grid');
  const btnGenres = document.getElementById('btn-state-genres');
  const pillGrid = document.getElementById('toggle-grid-pill');
  const pillGenre = document.getElementById('toggle-genre-pill');

  if (state === 'grid' || state === 'standard') {
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
    filtered = catalog.filter(m => (m.genres && m.genres.some(g => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('action'))) || m.title.toLowerCase().includes('dune') || m.title.toLowerCase().includes('interstellar'));
  } else if (movementKey === 'korean') {
    filtered = catalog.filter(m => m.country === 'South Korea' || (m.genres && m.genres.some(g => g.toLowerCase().includes('romance') || g.toLowerCase().includes('melodrama'))));
  } else if (movementKey === 'french') {
    filtered = catalog.filter(m => m.country === 'France' || m.title.toLowerCase().includes('anatomy') || m.title.toLowerCase().includes('breathless'));
  } else if (movementKey === 'thriller') {
    filtered = catalog.filter(m => m.genres && m.genres.some(g => g.toLowerCase().includes('thriller') || g.toLowerCase().includes('horror') || g.toLowerCase().includes('mystery')));
  } else if (movementKey === 'japanese') {
    filtered = catalog.filter(m => m.country === 'Japan' || m.title.toLowerCase().includes('drive my car') || m.title.toLowerCase().includes('monster') || m.title.toLowerCase().includes('perfect days'));
  } else if (movementKey === 'poetic') {
    filtered = catalog.filter(m => m.country === 'France' || m.year < 1980 || m.title.toLowerCase().includes('mirror') || m.title.toLowerCase().includes('cleo'));
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

function handleDiscoverSearch(query) {
  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  const q = (query || '').toLowerCase().trim();
  let matches = catalog;
  if (q.length > 0) {
    matches = catalog.filter(m => 
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q)) ||
      (m.country && m.country.toLowerCase().includes(q)) ||
      (m.genres && m.genres.some(g => g.toLowerCase().includes(q)))
    );
  }
  renderDiscoverCatalog(matches);
}

// =========================================================================
// 3. TRENDING ROW CAROUSEL CONTROLS
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
  }
  btn.classList.add('bg-primary', 'text-on-primary', 'font-semibold');
  btn.classList.remove('text-on-surface-variant', 'border', 'border-outline-variant/40');
  btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  if (category === 'all') {
    showToast('Showing all curated releases');
  } else {
    showToast(`Filtering category: ${category.toUpperCase()}`);
  }
}

// =========================================================================
// 4. SPECS & RESILIENT STATES CONTROLLER
// =========================================================================

function switchSpecTab(mode) {
  const panelGuide = document.getElementById('spec-panel-guide');
  const panel404 = document.getElementById('spec-panel-404');
  const panelOffline = document.getElementById('spec-panel-offline');

  const tabGuide = document.getElementById('spec-tab-guide');
  const tab404 = document.getElementById('spec-tab-404');
  const tabOffline = document.getElementById('spec-tab-offline');

  const inactiveClass = 'px-4 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer';
  const activeClass = 'px-4 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider bg-primary text-on-primary font-bold shadow-sm transition-all cursor-pointer';

  if (tabGuide) tabGuide.className = inactiveClass;
  if (tab404) tab404.className = inactiveClass;
  if (tabOffline) tabOffline.className = inactiveClass;

  if (panelGuide) panelGuide.classList.add('hidden');
  if (panel404) panel404.classList.add('hidden');
  if (panelOffline) panelOffline.classList.add('hidden');

  if (mode === 'guide') {
    if (panelGuide) panelGuide.classList.remove('hidden');
    if (tabGuide) tabGuide.className = activeClass;
  } else if (mode === '404') {
    if (panel404) panel404.classList.remove('hidden');
    if (tab404) tab404.className = activeClass;
  } else if (mode === 'offline') {
    if (panelOffline) panelOffline.classList.remove('hidden');
    if (tabOffline) tabOffline.className = activeClass;
  }
}

function simulateReconnect() {
  const text = document.getElementById('retry-btn-text');
  if (!text) return;

  text.innerText = 'Pinging Registry Node...';
  setTimeout(() => {
    text.innerText = 'Signal Established (24ms)';
    showToast('Reconnected to Central Cinematheque Archive.');
    setTimeout(() => {
      text.innerText = 'Test Network Connection';
    }, 2500);
  }, 1200);
}

// =========================================================================
// 5. GLOBAL COMMAND SEARCH MODAL (⌘K)
// =========================================================================

function openModal(state = 'results') {
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

function handleModalSearch(val) {
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

  container.innerHTML = matches.slice(0, 10).map(m => `
    <div class="p-4 hover:bg-surface-hover flex items-center justify-between gap-4 cursor-pointer group transition-colors" onclick="closeModal(); openFilmDetails('${m.slug || m.id}')">
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-10 h-[60px] rounded-md overflow-hidden bg-petrol-base flex-shrink-0 border border-border-hairline">
          <img src="${m.poster || m.backdrop || '/images/moment-to-remember-backdrop.jpg'}" alt="${m.title}" class="w-full h-full object-cover">
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
  `).join('');
}

function setSearchPill(cat) {
  const input = document.getElementById('modal-search-input');
  if (input) {
    input.value = cat;
    handleModalSearch(cat);
  }
}

// =========================================================================
// 6. 5-STAR RATING & LOGBOOK DIALOG
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
// 7. FILM DETAILS & CINEMA 4K PLAYER INTEGRATION
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

  const posterSrc = movie.poster || movie.backdrop || '/images/moment-to-remember-backdrop.jpg';
  if (heroImg) heroImg.style.backgroundImage = `url('${posterSrc}')`;
  if (posterImg) posterImg.src = posterSrc;
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
  if (trailerPoster) trailerPoster.style.backgroundImage = `url('${posterSrc}')`;

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

function playCurrentFilmInPlayer(server) {
  const film = currentActiveMovie || {
    id: '15859',
    slug: 'a-moment-to-remember',
    title: 'A Moment to Remember',
    year: '2004'
  };

  if (typeof CinexaPlayer !== 'undefined') {
    CinexaPlayer.openPlayer(film, server || 'local');
    return;
  }

  const modal = document.getElementById('player-modal');
  const videoEl = document.getElementById('custom-video-player');
  const iframeEl = document.getElementById('video-iframe');

  if (film.slug === 'a-moment-to-remember' || film.id === '15859' || (film.title && film.title.includes('Moment to Remember'))) {
    if (iframeEl) iframeEl.style.display = 'none';
    if (videoEl) {
      videoEl.style.display = 'block';
      videoEl.src = '/subtitles/0918 (1).mp4';
      videoEl.play().catch(e => console.log('Autoplay handled:', e));
    }
  } else {
    if (videoEl) videoEl.style.display = 'none';
    if (iframeEl) {
      iframeEl.style.display = 'block';
      iframeEl.src = `https://vidsrc.to/embed/movie/${film.id || '15859'}`;
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
// 8. TOAST NOTIFICATIONS & CATALOG RENDERING
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

function renderDiscoverCatalog(customList) {
  const grid = document.getElementById('catalogGrid');
  const counter = document.getElementById('discover-counter');
  if (!grid) return;

  const catalog = customList || ((typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : []);
  if (counter) counter.innerText = `${catalog.length} ARCHIVED WORKS`;

  grid.innerHTML = catalog.map(m => {
    const poster = m.poster || m.backdrop || '/images/moment-to-remember-backdrop.jpg';
    const rating = m.rating || 'R';
    const score = m.imdbRating || '8.1';
    const format = m.resolution ? m.resolution.toUpperCase() : '35MM';

    return `
      <article class="group relative flex flex-col bg-surface-container rounded-2xl overflow-hidden shadow-warm-diffuse transition-all duration-300 hover:-translate-y-1 hover:bg-surface-container-high cursor-pointer border border-border-hairline/60" onclick="openFilmDetails('${m.slug || m.id}')">
        <div class="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-lowest">
          <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${poster}" alt="${m.title}" loading="lazy"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-60"></div>
          <div class="absolute top-2.5 left-2.5">
            <span class="font-label-sm text-xs px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface">${rating}</span>
          </div>
          <button class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer" onclick="event.stopPropagation(); showToast('Saved ${m.title} to watchlist.');">
            <span class="material-symbols-outlined text-base">bookmark_border</span>
          </button>
          <div class="absolute bottom-2.5 left-2.5">
            <span class="font-label-sm text-[10px] px-2 py-0.5 rounded bg-primary-container/20 text-primary font-medium">${format}</span>
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
            <p class="font-body-sm text-xs text-on-surface-variant truncate">${m.director || 'Curated Master'}</p>
          </div>
          <div class="pt-2 border-t border-surface-container-highest flex items-center justify-between">
            <span class="font-label-sm text-xs text-tertiary font-semibold">${m.studio || 'CINEXA 4K'}</span>
            <span class="material-symbols-outlined text-outline text-sm group-hover:text-primary">play_circle</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// =========================================================================
// 9. FROSTED NAVBAR SCROLL TRIGGER & SHORTCUTS
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

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    applyFrostedNav(true);
  } else {
    applyFrostedNav(false);
  }
});

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openModal('results');
  }
  if (e.key === 'Escape') {
    closeModal();
    closeRatingDialogModal();
    closePlayerModal();
    toggleMobileSheet(false);
  }
});

// Toast Undo
document.addEventListener('DOMContentLoaded', () => {
  renderDiscoverCatalog();
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
