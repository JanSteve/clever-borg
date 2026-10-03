/**
 * CINEXA: Unified Google Stitch Screen Controller & Architecture
 * Complete implementation of all 6 Google Stitch Screens:
 * 1. Home / Trending with 5-Slide Hero Rotator & Ranked Carousels
 * 2. Discover & Movements (Film Matrix + Browse by Movement & Discipline)
 * 3. My Library (2x2 Bento, High-Density Rows & 3D Curated Folios)
 * 4. Film Dossier Details (35mm Dossier, Where to Watch, Theatrical Preview, Cast)
 * 5. Global Command Search Palette (⌘K) matching 159+ films
 * 6. 5★ Archival Logbook Rating Dialog
 * + Guaranteed Local Playback for "A Moment to Remember" Prank Movie
 */

// Global Application State
let currentScreen = 'home';
let currentActiveMovie = null;
let currentHeroIndex = 0;
let heroInterval = null;
let watchlistSet = new Set(['15859', 'dune-part-two', 'past-lives', 'perfect-days']);
let seenSet = new Set(['oppenheimer', 'drive-my-car']);
let toastTimer = null;
let currentSelectedRating = 5;

// Hero Spotlight Dataset matching Stitch exactly
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
    synopsis: 'Su-jin, a delicate fashion designer reeling from heartbreak, crosses paths with Chul-soo, an austere construction foreman harboring literary aspirations. What blossoms from an accidental encounter outside a convenience store evolves into one of Korean cinema\'s most heartbreaking portraits of vulnerability. As early-onset Alzheimer\'s begins erasing their cherished domestic memories, the two construct an enduring sanctuary of love against inevitable erasure.'
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
// 1. MAIN SCREEN CONTROLLER (Single-Page View Router)
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

  // Update Top Stitch screen selector pills
  document.querySelectorAll('#stitch-screens-bar .screen-pill').forEach(pill => {
    const targetScreen = pill.getAttribute('data-screen');
    if (targetScreen === screenName) {
      pill.className = 'font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-primary text-[#1A1408] font-bold shadow-sm transition-all cursor-pointer screen-pill active';
    } else if (targetScreen) {
      pill.className = 'font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-bright border border-outline-variant/40 transition-all cursor-pointer screen-pill';
    }
  });

  // Update Desktop Nav Links
  document.querySelectorAll('#desktop-nav-links .nav-link').forEach(link => {
    const nav = link.getAttribute('data-nav');
    if (nav === screenName) {
      link.classList.add('active', 'text-on-surface');
      link.classList.remove('text-on-surface-variant');
    } else if (nav) {
      link.classList.remove('active', 'text-on-surface');
      link.classList.add('text-on-surface-variant');
    }
  });

  // Update Bottom Navigation Tab State
  document.querySelectorAll('#main-bottom-nav .tab-item').forEach(tab => {
    const path = tab.getAttribute('data-path');
    const indicator = tab.querySelector('.tab-indicator');
    if (path === screenName) {
      tab.classList.remove('text-on-surface-variant');
      tab.classList.add('text-primary');
      if (indicator) {
        indicator.classList.remove('opacity-0');
        indicator.classList.add('opacity-100');
      }
    } else {
      tab.classList.remove('text-primary');
      tab.classList.add('text-on-surface-variant');
      if (indicator) {
        indicator.classList.remove('opacity-100');
        indicator.classList.add('opacity-0');
      }
    }
  });

  // Render dynamic catalog grids when entering screen
  if (screenName === 'discover') {
    renderDiscoverCatalog();
  } else if (screenName === 'home') {
    renderHomeCatalog();
  }

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================================
// 2. DISCOVER SCREEN SUB-VIEW SWITCHER
// =========================================================================

function switchDiscoverSubView(subView) {
  const matrixView = document.getElementById('discover-subview-matrix');
  const movementsView = document.getElementById('discover-subview-movements');
  const matrixBtn = document.getElementById('discover-tab-matrix-btn');
  const movementsBtn = document.getElementById('discover-tab-movements-btn');

  if (subView === 'matrix') {
    if (matrixView) matrixView.classList.remove('hidden');
    if (movementsView) movementsView.classList.add('hidden');
    if (matrixBtn) matrixBtn.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full bg-primary text-[#1A1408] font-bold shadow-sm transition-all cursor-pointer';
    if (movementsBtn) movementsBtn.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all cursor-pointer';
    renderDiscoverCatalog();
  } else {
    if (matrixView) matrixView.classList.add('hidden');
    if (movementsView) movementsView.classList.remove('hidden');
    if (matrixBtn) matrixBtn.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all cursor-pointer';
    if (movementsBtn) movementsBtn.className = 'font-body-sm text-body-sm px-4 py-1.5 rounded-full bg-primary text-[#1A1408] font-bold shadow-sm transition-all cursor-pointer';
  }
}

function openMovementsTab() {
  switchMainScreen('discover');
  switchDiscoverSubView('movements');
}

function filterCatalogByMovement(movementKey) {
  switchDiscoverSubView('matrix');
  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  let filtered = catalog;

  if (movementKey === 'sci-fi') {
    filtered = catalog.filter(m => (m.genres && m.genres.some(g => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('action'))) || m.title.toLowerCase().includes('dune') || m.title.toLowerCase().includes('interstellar') || m.title.toLowerCase().includes('matrix'));
  } else if (movementKey === 'korean') {
    filtered = catalog.filter(m => m.country === 'South Korea' || (m.genres && m.genres.some(g => g.toLowerCase().includes('romance') || g.toLowerCase().includes('melodrama'))));
  } else if (movementKey === 'french') {
    filtered = catalog.filter(m => m.country === 'France' || m.title.toLowerCase().includes('anatomy') || m.title.toLowerCase().includes('breathless'));
  } else if (movementKey === 'thriller') {
    filtered = catalog.filter(m => m.genres && m.genres.some(g => g.toLowerCase().includes('thriller') || g.toLowerCase().includes('horror') || g.toLowerCase().includes('mystery')));
  } else if (movementKey === 'japanese') {
    filtered = catalog.filter(m => m.country === 'Japan' || m.title.toLowerCase().includes('drive my car') || m.title.toLowerCase().includes('monster') || m.title.toLowerCase().includes('perfect days'));
  }

  renderDiscoverCatalog(filtered);
  showToast(`Filtered: ${filtered.length} films in ${movementKey.toUpperCase()} movement`);
}

function resetDiscoverFilters() {
  renderDiscoverCatalog();
  showToast('Reset all curatorial filters.');
}

// =========================================================================
// 3. MY LIBRARY SUB-VIEW SWITCHER
// =========================================================================

function switchLibrarySubView(view) {
  const libraryContent = document.getElementById('view-library-content');
  const searchContent = document.getElementById('view-search');
  const emptyContent = document.getElementById('view-empty');

  const btnLib = document.getElementById('view-library-btn');
  const btnSearch = document.getElementById('view-search-btn');
  const btnEmpty = document.getElementById('view-empty-btn');

  // Reset classes
  [btnLib, btnSearch, btnEmpty].forEach(btn => {
    if (btn) {
      btn.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 text-on-surface-variant hover:text-on-surface cursor-pointer';
    }
  });

  if (view === 'library') {
    if (libraryContent) libraryContent.classList.remove('hidden');
    if (searchContent) searchContent.classList.add('hidden');
    if (emptyContent) emptyContent.classList.add('hidden');
    if (btnLib) btnLib.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 bg-primary text-[#1A1408] font-bold shadow-sm cursor-pointer';
  } else if (view === 'search') {
    if (libraryContent) libraryContent.classList.add('hidden');
    if (searchContent) searchContent.classList.remove('hidden');
    if (emptyContent) emptyContent.classList.add('hidden');
    if (btnSearch) btnSearch.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 bg-primary text-[#1A1408] font-bold shadow-sm cursor-pointer';
    
    // Auto-focus and populate search results
    const input = document.getElementById('overlay-search-input');
    if (input) {
      input.focus();
      handleOverlaySearch(input.value || '');
    }
  } else if (view === 'empty') {
    if (libraryContent) libraryContent.classList.add('hidden');
    if (searchContent) searchContent.classList.add('hidden');
    if (emptyContent) emptyContent.classList.remove('hidden');
    if (btnEmpty) btnEmpty.className = 'px-3.5 py-1.5 rounded-full text-label-sm font-label-sm uppercase transition-all duration-200 bg-primary text-[#1A1408] font-bold shadow-sm cursor-pointer';
  }
}

function toggleLayout(mode) {
  const container = document.getElementById('library-film-rows');
  const btnList = document.getElementById('toggle-list-btn');
  const btnGrid = document.getElementById('toggle-grid-btn');

  if (mode === 'grid') {
    if (container) {
      container.classList.remove('flex', 'flex-col');
      container.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
    }
    if (btnGrid) {
      btnGrid.classList.add('bg-surface-container-high', 'text-primary');
      btnGrid.classList.remove('text-on-surface-variant');
    }
    if (btnList) {
      btnList.classList.remove('bg-surface-container-high', 'text-primary');
      btnList.classList.add('text-on-surface-variant');
    }
  } else {
    if (container) {
      container.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3');
      container.classList.add('flex', 'flex-col');
    }
    if (btnList) {
      btnList.classList.add('bg-surface-container-high', 'text-primary');
      btnList.classList.remove('text-on-surface-variant');
    }
    if (btnGrid) {
      btnGrid.classList.remove('bg-surface-container-high', 'text-primary');
      btnGrid.classList.add('text-on-surface-variant');
    }
  }
}

// =========================================================================
// 4. GLOBAL COMMAND SEARCH MODAL (⌘K)
// =========================================================================

function openGlobalSearchModal() {
  const overlay = document.getElementById('command-modal-overlay');
  const input = document.getElementById('modal-search-input');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }
  if (input) {
    input.value = '';
    input.focus();
    handleGlobalModalSearch('');
  }
}

function closeGlobalSearchModal() {
  const overlay = document.getElementById('command-modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function handleGlobalModalSearch(query) {
  const container = document.getElementById('modal-content-area');
  if (!container) return;

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  const q = (query || '').toLowerCase().trim();

  let matches = catalog;
  if (q.length > 0) {
    matches = catalog.filter(m => 
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q)) ||
      (m.country && m.country.toLowerCase().includes(q)) ||
      (m.genres && m.genres.some(g => g.toLowerCase().includes(q))) ||
      (m.cast && m.cast.some(c => c.toLowerCase().includes(q)))
    );
  }

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="py-12 px-6 text-center">
        <span class="material-symbols-outlined text-outline text-3xl mb-2">search_off</span>
        <h4 class="font-serif text-lg text-on-surface font-medium mb-1">No matches found for "${query}"</h4>
        <p class="font-sans text-xs text-outline max-w-xs mx-auto">
          Verify spelling or browse our 159+ titles by movement and genre.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.slice(0, 12).map(m => `
    <div class="p-3.5 hover:bg-surface-bright flex items-center justify-between gap-4 cursor-pointer group transition-colors" onclick="closeGlobalSearchModal(); openFilmDetails('${m.slug || m.id}')">
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-10 h-15 rounded-md overflow-hidden bg-surface-container flex-shrink-0 border border-surface-container-highest">
          <img src="${m.poster || m.backdrop || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSTC5wSXrmEcdSE9fVYj4_TU4OiMIF3m-L5zQ-nT0cxgtaApyVrVdN0spo2DJcPcMO-YHdo3TUMXD9NvINA5x56F0pe_62Kx0eEk8WgbYq6BFAfc3wcC-h1fur5XKM77SCeMtYWiUG2gRiSXRC-QeXFmUmf0VGMYyOISTqpWapKgCeMuD3Qi1_A4UGXwpg_klkORXxfqwoZe6SYTn1mcEbvLsMeVeLZlPIizgsHYAVuy2Up2AcT_0gNw'}" alt="${m.title}" class="w-full h-full object-cover">
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <h4 class="font-serif font-medium text-[15px] text-on-surface group-hover:text-primary transition-colors truncate">${m.title}</h4>
            <span class="font-mono text-[11px] text-outline shrink-0">${m.year || '2024'}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-[10px] uppercase tracking-wider text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded">${m.studio || 'CINEXA 4K'}</span>
            <span class="font-sans text-xs text-on-surface-variant truncate">${m.director || 'Curated Master'}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span class="font-mono text-xs text-primary font-semibold">★ ${m.imdbRating || '8.0'}</span>
        <button class="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-[#1A1408] transition-colors">
          <span class="material-symbols-outlined text-[16px]">play_arrow</span>
        </button>
      </div>
    </div>
  `).join('');
}

function setSearchPill(category) {
  const input = document.getElementById('modal-search-input');
  if (input) {
    input.value = category;
    handleGlobalModalSearch(category);
  }
}

function handleOverlaySearch(query) {
  const container = document.getElementById('overlay-results-grid');
  if (!container) return;

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  const q = (query || '').toLowerCase().trim();

  let matches = catalog;
  if (q.length > 0) {
    matches = catalog.filter(m => 
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q)) ||
      (m.genres && m.genres.some(g => g.toLowerCase().includes(q)))
    );
  }

  container.innerHTML = matches.slice(0, 12).map(m => `
    <div class="flex flex-col gap-1.5 group cursor-pointer" onclick="openFilmDetails('${m.slug || m.id}')">
      <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-container shadow-md group-hover:shadow-xl transition-all">
        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${m.poster || m.backdrop}" alt="${m.title}"/>
        <div class="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent"></div>
        <span class="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-label-sm">${m.rating || 'R'}</span>
        <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-on-surface font-label-sm text-label-sm">
          <span class="text-tertiary">35mm</span>
          <span class="text-primary font-semibold">${m.imdbRating || '8.0'}</span>
        </div>
      </div>
      <span class="font-body-sm text-body-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">${m.title}</span>
    </div>
  `).join('');
}

// =========================================================================
// 5. 5-STAR RATING & LOGBOOK DIALOG
// =========================================================================

function openRatingDialogModal(movieSlugOrId) {
  const overlay = document.getElementById('rating-modal-overlay');
  const titleEl = document.getElementById('rating-modal-film-title');
  
  let film = currentActiveMovie || HERO_SLIDES[1];
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
          s.classList.add('text-primary');
          s.classList.remove('text-outline');
        } else {
          s.style.fontVariationSettings = "'FILL' 0";
          s.classList.remove('text-primary');
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
// 6. HERO SPOTLIGHT ROTATOR
// =========================================================================

function setHeroSlide(index) {
  if (index < 0 || index >= HERO_SLIDES.length) return;
  currentHeroIndex = index;
  const slide = HERO_SLIDES[index];

  const backdrop = document.getElementById('hero-backdrop');
  const eyebrow = document.getElementById('hero-eyebrow');
  const title = document.getElementById('hero-title');
  const score = document.getElementById('hero-score');
  const year = document.getElementById('hero-year');
  const runtime = document.getElementById('hero-runtime');
  const age = document.getElementById('hero-age');
  const format = document.getElementById('hero-format');
  const badge = document.getElementById('hero-badge');

  if (backdrop) backdrop.style.backgroundImage = `url('${slide.backdrop}')`;
  if (eyebrow) eyebrow.innerText = slide.eyebrow;
  if (title) title.innerText = slide.title;
  if (score) score.innerText = slide.score;
  if (year) year.innerText = slide.year;
  if (runtime) runtime.innerText = slide.runtime;
  if (age) age.innerText = slide.age;
  if (format) format.innerText = slide.format;
  if (badge) badge.innerText = slide.badge;

  // Update dots
  const dotsContainer = document.getElementById('hero-dots');
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('span');
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.className = 'w-6 h-1.5 rounded-full bg-primary transition-all duration-300 cursor-pointer';
      } else {
        dot.className = 'w-1.5 h-1.5 rounded-full bg-surface-container-highest transition-all duration-300 cursor-pointer';
      }
    });
  }

  // Update hero button actions
  const watchBtn = document.getElementById('btn-hero-watch');
  const bookBtn = document.getElementById('btn-hero-bookmark');
  const infoBtn = document.getElementById('btn-hero-info');

  if (watchBtn) {
    watchBtn.onclick = () => {
      currentActiveMovie = slide;
      playCurrentFilmInPlayer();
    };
  }
  if (bookBtn) {
    bookBtn.onclick = () => {
      showToast(`Added "${slide.title}" to your Watchlist.`);
    };
  }
  if (infoBtn) {
    infoBtn.onclick = () => {
      openFilmDetails(slide);
    };
  }
}

function startHeroAutoRotate() {
  if (heroInterval) clearInterval(heroInterval);
  heroInterval = setInterval(() => {
    const nextIndex = (currentHeroIndex + 1) % HERO_SLIDES.length;
    setHeroSlide(nextIndex);
  }, 7500);
}

// =========================================================================
// 7. FILM DETAILS & DOSSIER POPULATION
// =========================================================================

function openFilmDetails(movieOrSlug) {
  let movie = movieOrSlug;
  if (typeof movieOrSlug === 'string') {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    movie = catalog.find(m => m.slug === movieOrSlug || m.id === movieOrSlug) || HERO_SLIDES[1];
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

  if (heroImg) heroImg.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;
  if (posterImg) posterImg.src = movie.poster || movie.backdrop;
  if (title) title.innerText = movie.title;
  if (koreanTitle) {
    if (movie.koreanTitle) {
      koreanTitle.innerHTML = `${movie.koreanTitle} <span class="font-label-sm text-label-sm text-outline not-italic ml-1">(${movie.year || '2004'})</span>`;
      koreanTitle.classList.remove('hidden');
    } else {
      koreanTitle.classList.add('hidden');
    }
  }
  if (tagline) tagline.innerText = movie.tagline ? `“${movie.tagline.replace(/^["“”]|["“”]$/g, '')}”` : '';
  if (score) score.innerText = movie.imdbRating || movie.score || '8.1';
  if (duration) duration.innerText = movie.duration || movie.runtime || '2h 24m';
  if (age) age.innerText = movie.rating || movie.age || '18+';
  if (synopsis) synopsis.innerText = movie.synopsis || movie.overview || 'Restored in 4K from the original 35mm negative under curatorial supervision.';
  if (trailerPoster) trailerPoster.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;

  switchMainScreen('details');
}

function openFilmBySlug(slug) {
  openFilmDetails(slug);
}

function toggleProvidersAccordion() {
  const content = document.getElementById('providers-content');
  const arrow = document.getElementById('providers-accordion-arrow');
  if (content && arrow) {
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      arrow.style.transform = 'rotate(0deg)';
    } else {
      content.classList.add('hidden');
      arrow.style.transform = 'rotate(-90deg)';
    }
  }
}

function toggleDetailsWatchlist() {
  const btn = document.getElementById('details-watchlist-btn');
  const text = document.getElementById('details-watchlist-text');
  const title = currentActiveMovie ? currentActiveMovie.title : 'Film';

  if (btn && text) {
    if (text.innerText.includes('Add')) {
      text.innerText = 'In Watchlist';
      btn.classList.add('bg-primary/20', 'text-primary');
      showToast(`Added "${title}" to your Watchlist.`);
    } else {
      text.innerText = 'Add to Watchlist';
      btn.classList.remove('bg-primary/20', 'text-primary');
      showToast(`Removed "${title}" from Watchlist.`);
    }
  }
}

function toggleDetailsSeen() {
  const btn = document.getElementById('details-seen-text');
  const title = currentActiveMovie ? currentActiveMovie.title : 'Film';
  showToast(`Marked "${title}" as Seen in your 2024 Archival Journal.`);
}

// =========================================================================
// 8. CINEMA 4K PLAYER INTEGRATION (Guaranteed Prank Stream Playback)
// =========================================================================

function playCurrentFilmInPlayer(server) {
  const film = currentActiveMovie || HERO_SLIDES[1];
  
  if (typeof CinexaPlayer !== 'undefined') {
    CinexaPlayer.openPlayer(film, server || 'local');
    return;
  }

  // Fallback direct modal opening
  const modal = document.getElementById('player-modal');
  const titleEl = document.getElementById('player-movie-title');
  const videoEl = document.getElementById('custom-video-player');
  const iframeEl = document.getElementById('video-iframe');

  if (titleEl) titleEl.innerText = `${film.title} (${film.year || '2004'})`;

  if (film.slug === 'a-moment-to-remember' || film.id === '15859' || film.title.includes('Moment to Remember')) {
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
// 9. EDITORIAL & TOAST MODALS
// =========================================================================

function openEditorialModal() {
  const modal = document.getElementById('editorialModalOverlay');
  if (modal) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
  }
}

function closeEditorialModal() {
  const modal = document.getElementById('editorialModalOverlay');
  if (modal) {
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
  }
}

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

// =========================================================================
// 10. CATALOG GRID RENDERING (Home & Discover)
// =========================================================================

function renderHomeCatalog() {
  const grid = document.getElementById('home-catalog-grid');
  if (!grid) return;

  const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
  grid.innerHTML = catalog.slice(0, 20).map(m => createFilmCardHtml(m)).join('');
}

function renderDiscoverCatalog(customList) {
  const grid = document.getElementById('catalogGrid');
  const counter = document.getElementById('discover-counter');
  if (!grid) return;

  const catalog = customList || ((typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : []);
  if (counter) counter.innerText = `${catalog.length} Films`;

  grid.innerHTML = catalog.map(m => createFilmCardHtml(m)).join('');
}

function createFilmCardHtml(m) {
  const poster = m.poster || m.backdrop || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSTC5wSXrmEcdSE9fVYj4_TU4OiMIF3m-L5zQ-nT0cxgtaApyVrVdN0spo2DJcPcMO-YHdo3TUMXD9NvINA5x56F0pe_62Kx0eEk8WgbYq6BFAfc3wcC-h1fur5XKM77SCeMtYWiUG2gRiSXRC-QeXFmUmf0VGMYyOISTqpWapKgCeMuD3Qi1_A4UGXwpg_klkORXxfqwoZe6SYTn1mcEbvLsMeVeLZlPIizgsHYAVuy2Up2AcT_0gNw';
  const rating = m.rating || 'R';
  const score = m.imdbRating || '8.1';
  const format = m.resolution ? m.resolution.toUpperCase() : '35MM';

  return `
    <article class="group relative flex flex-col bg-surface-container rounded-2xl overflow-hidden shadow-warm-diffuse transition-all duration-300 hover:-translate-y-1 hover:bg-surface-container-high cursor-pointer" onclick="openFilmDetails('${m.slug || m.id}')">
      <div class="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-lowest">
        <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${poster}" alt="${m.title}" loading="lazy"/>
        <div class="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-60"></div>
        <div class="absolute top-2.5 left-2.5">
          <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface">${rating}</span>
        </div>
        <button class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer" onclick="event.stopPropagation(); showToast('Saved ${m.title} to watchlist.');">
          <span class="material-symbols-outlined text-base">bookmark_border</span>
        </button>
        <div class="absolute bottom-2.5 left-2.5">
          <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary-container/20 text-primary font-medium">${format}</span>
        </div>
      </div>
      <div class="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="font-label-sm text-label-sm text-outline">${m.year || '2024'} • ${m.duration || '2h'}</span>
            <span class="font-label-sm text-label-sm text-primary font-medium flex items-center gap-0.5">
              <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">star</span> ${score}
            </span>
          </div>
          <h3 class="font-headline-sm text-[16px] text-on-surface group-hover:text-primary transition-colors truncate font-semibold">
            ${m.title}
          </h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${m.director || 'Curated Master'}</p>
        </div>
        <div class="pt-2 border-t border-surface-container-highest flex items-center justify-between">
          <span class="font-label-sm text-label-sm text-tertiary font-semibold">${m.studio || 'CINEXA 4K'}</span>
          <span class="material-symbols-outlined text-outline text-sm group-hover:text-primary">play_circle</span>
        </div>
      </div>
    </article>
  `;
}

// =========================================================================
// 11. KEYBOARD SHORTCUTS & EVENT LISTENERS
// =========================================================================

document.addEventListener('keydown', (e) => {
  // ⌘K or Ctrl+K for Global Command Search
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openGlobalSearchModal();
  }
  // Escape key closes modals
  if (e.key === 'Escape') {
    closeGlobalSearchModal();
    closeRatingDialogModal();
    closeEditorialModal();
    closePlayerModal();
  }
});

// Category chip filtering on Home
document.addEventListener('DOMContentLoaded', () => {
  setHeroSlide(0);
  startHeroAutoRotate();
  renderHomeCatalog();

  // Attach Home category filter chips
  document.querySelectorAll('#home-category-strip .cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#home-category-strip .cat-chip').forEach(c => {
        c.className = 'shrink-0 h-9 px-4 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-all active:scale-95 cat-chip';
      });
      chip.className = 'shrink-0 h-9 px-4 rounded-full bg-primary text-on-primary font-body-sm text-body-sm font-semibold shadow-sm transition-transform active:scale-95 cat-chip';
      
      const cat = chip.getAttribute('data-cat');
      const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
      if (cat === 'all') {
        renderHomeCatalog();
      } else {
        const filtered = catalog.filter(m => m.category === cat || (m.genres && m.genres.some(g => g.toLowerCase().includes(cat))));
        const grid = document.getElementById('home-catalog-grid');
        if (grid) grid.innerHTML = (filtered.length > 0 ? filtered : catalog.slice(0, 10)).map(m => createFilmCardHtml(m)).join('');
      }
    });
  });

  // Attach mobile filter drawer trigger
  const openFilterBtn = document.getElementById('openFilterBtn');
  const closeFilterSheetBtn = document.getElementById('closeFilterSheetBtn');
  const filterDrawerOverlay = document.getElementById('filterDrawerOverlay');
  const filterDrawerContent = document.getElementById('filterDrawerContent');

  if (openFilterBtn && filterDrawerOverlay && filterDrawerContent) {
    openFilterBtn.addEventListener('click', () => {
      filterDrawerOverlay.classList.remove('opacity-0', 'pointer-events-none');
      filterDrawerOverlay.classList.add('opacity-100', 'pointer-events-auto');
      filterDrawerContent.classList.remove('translate-y-full');
      filterDrawerContent.classList.add('translate-y-0');
    });

    const closeDrawer = () => {
      filterDrawerOverlay.classList.remove('opacity-100', 'pointer-events-auto');
      filterDrawerOverlay.classList.add('opacity-0', 'pointer-events-none');
      filterDrawerContent.classList.remove('translate-y-0');
      filterDrawerContent.classList.add('translate-y-full');
    };

    if (closeFilterSheetBtn) closeFilterSheetBtn.addEventListener('click', closeDrawer);
    filterDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === filterDrawerOverlay) closeDrawer();
    });
  }

  // Toast undo action
  const toastUndo = document.getElementById('toast-undo');
  if (toastUndo) {
    toastUndo.addEventListener('click', () => {
      const toast = document.getElementById('watchlist-toast');
      if (toast) {
        toast.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
        toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-12');
      }
    });
  }
});
