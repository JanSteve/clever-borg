/**
 * CINEBY / K-FLIX Application Logic
 * Commercial Streaming Website Experience
 * - Instant Live Search Dropdown Popup
 * - Dedicated Cineby Preview Page for "A Moment to Remember" (15859) & All Titles
 * - Streaming Server Selector (Simulated high-speed CDNs)
 * - Automatic Stream of User-Pasted Video File from movies/
 * - VIP Profile Menu
 * - Guaranteed Zero-Black-Screen Poster Fallbacks
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let serverMovies = [];
  let userPastedMovie = null;
  let activePreviewMovie = null;

  // Views
  const homeView = document.getElementById('home-view');
  const previewView = document.getElementById('preview-page-view');

  // DOM Elements - Navigation & Header
  const header = document.querySelector('.site-header');
  const navLogo = document.getElementById('nav-logo');
  const navHomeLink = document.getElementById('nav-home-link');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchResultsPopup = document.getElementById('search-results-popup');
  const profileTrigger = document.getElementById('profile-trigger');
  const profileDropdown = document.getElementById('profile-dropdown');

  // Hero Billboard Elements
  const heroBanner = document.getElementById('hero-banner');
  const heroEyebrow = document.getElementById('hero-eyebrow');
  const heroKoreanTitle = document.getElementById('hero-korean-title');
  const heroTitle = document.getElementById('hero-title');
  const heroMeta = document.getElementById('hero-meta');
  const heroSynopsis = document.getElementById('hero-synopsis');
  const btnHeroPlay = document.getElementById('btn-hero-play');
  const btnHeroPreview = document.getElementById('btn-hero-preview');
  const btnHeroWatchlist = document.getElementById('btn-hero-watchlist');

  // Catalog Section
  const categoryTabs = document.querySelectorAll('.tab-btn');
  const catalogContainer = document.getElementById('catalog-container');

  // Cineby Preview Page Elements
  const bcHome = document.getElementById('bc-home');
  const bcCategory = document.getElementById('bc-category');
  const bcTitle = document.getElementById('bc-title');
  const btnBackBrowse = document.getElementById('btn-back-browse');
  const previewBackdrop = document.getElementById('preview-backdrop');
  const previewPosterImg = document.getElementById('preview-poster-img');
  const previewPosterUhd = document.getElementById('preview-poster-uhd');
  const previewPosterRating = document.getElementById('preview-poster-rating');
  const specRating = document.getElementById('spec-rating');
  const specRelease = document.getElementById('spec-release');
  const specRuntime = document.getElementById('spec-runtime');
  const specCountry = document.getElementById('spec-country');
  const specAudio = document.getElementById('spec-audio');
  const specStudio = document.getElementById('spec-studio');
  const previewKoreanEyebrow = document.getElementById('preview-korean-eyebrow');
  const previewMainTitle = document.getElementById('preview-main-title');
  const previewTagline = document.getElementById('preview-tagline');
  const previewStarScore = document.getElementById('preview-star-score');
  const previewMatch = document.getElementById('preview-match');
  const previewMetaYear = document.getElementById('preview-meta-year');
  const previewMetaAge = document.getElementById('preview-meta-age');
  const previewMetaDuration = document.getElementById('preview-meta-duration');
  const previewGenrePills = document.getElementById('preview-genre-pills');
  const btnPreviewPlay = document.getElementById('btn-preview-play');
  const btnPreviewTrailer = document.getElementById('btn-preview-trailer');
  const btnPreviewWatchlist = document.getElementById('btn-preview-watchlist');
  const btnPreviewShare = document.getElementById('btn-preview-share');
  const previewStorylineText = document.getElementById('preview-storyline-text');
  const previewCastCarousel = document.getElementById('preview-cast-carousel');
  const previewSimilarGrid = document.getElementById('preview-similar-grid');
  const previewAdvisoryBox = document.getElementById('preview-advisory-box');
  const previewAdvisoryText = document.getElementById('preview-advisory-text');
  const previewAdvisoryTags = document.getElementById('preview-advisory-tags');

  // 1. Header scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. VIP Profile Dropdown Toggle
  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
        profileDropdown.classList.remove('active');
      }
    });
  }

  // 3. Fetch server movie list (detects user's pasted movie)
  async function fetchServerMovies() {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        serverMovies = data.movies || [];
        // Detect if user pasted any non-demo movie into movies/
        userPastedMovie = serverMovies.find(m => !m.isDemo) || null;
      }
    } catch (err) {
      console.warn('Server movie fetch:', err);
    }
  }

  // 4. Render Catalog Rows & Cards
  function renderCatalog() {
    catalogContainer.innerHTML = '';

    let filtered = KOREAN_MOVIES_CATALOG;

    // Prank perfection: Hide "A Moment to Remember" from main screen browsing rows & category tabs
    // so the friend only discovers it when explicitly searching for it!
    if (searchQuery.trim() === '') {
      filtered = filtered.filter(m => !m.hidden && m.id !== '15859' && m.slug !== 'a-moment-to-remember');
    }

    if (currentCategory !== 'all') {
      filtered = filtered.filter(m => m.category === currentCategory || m.genres.some(g => g.toLowerCase().includes(currentCategory)));
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        if (m.id === '15859' || m.slug === 'a-moment-to-remember' || m.hidden) {
          // Prank logic: ONLY match A Moment to Remember if the query explicitly targets it!
          return q.includes('moment') ||
                 q.includes('remember') ||
                 q.includes('지우개') ||
                 q.includes('15859') ||
                 q.includes('son ye') ||
                 q.includes('ye-jin') ||
                 q.includes('jung woo') ||
                 q.includes('woo-sung');
        }
        return m.title.toLowerCase().includes(q) ||
          m.koreanTitle.toLowerCase().includes(q) ||
          m.genres.some(g => g.toLowerCase().includes(q)) ||
          m.cast.some(c => c.toLowerCase().includes(q)) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          (m.id && m.id.includes(q)) ||
          (m.slug && m.slug.includes(q));
      });
    }

    if (filtered.length === 0) {
      catalogContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="color: #fff; font-size: 18px; margin-bottom: 6px;">No movies found</h3>
          <p>Try searching for "Parasite", "The Classic", or Korean cinema favorites.</p>
        </div>
      `;
      return;
    }

    if (currentCategory === 'all' && searchQuery.trim() === '') {
      const sections = [
        { key: 'blockbusters', title: '🌍 Global Trending & Hollywood Blockbusters', korean: '글로벌 블록버스터 톱 10' },
        { key: 'anime', title: '⛩️ Anime Masterpieces & Animation', korean: '극장판 애니메이션 명작' },
        { key: 'romance', title: '💖 Romance & Melodrama Worldwide', korean: '세계적인 감성 로맨스 명작' },
        { key: 'world', title: '🔥 Top Rated World Cinema', korean: '월드 시네마 명작 컬렉션' },
        { key: 'thriller', title: '⚡ Action, Sci-Fi & Dark Thrillers', korean: '스릴러 & 액션 대작' }
      ];

      sections.forEach(sec => {
        // Use filtered to guarantee A Moment to Remember is never displayed in browse rows
        const moviesInSec = filtered.filter(m => m.category === sec.key);
        if (moviesInSec.length > 0) {
          const rowEl = document.createElement('div');
          rowEl.className = 'movie-row';
          rowEl.innerHTML = `
            <div class="row-header">
              <h2 class="row-title">${sec.title}</h2>
              <span class="row-korean-subtitle">${sec.korean}</span>
            </div>
            <div class="movie-grid" id="grid-${sec.key}"></div>
          `;
          catalogContainer.appendChild(rowEl);
          const gridEl = rowEl.querySelector(`#grid-${sec.key}`);
          moviesInSec.forEach(movie => {
            gridEl.appendChild(createMovieCard(movie));
          });
        }
      });
    } else {
      const rowEl = document.createElement('div');
      rowEl.className = 'movie-row';
      rowEl.innerHTML = `
        <div class="row-header">
          <h2 class="row-title">Search & Category Results (${filtered.length})</h2>
        </div>
        <div class="movie-grid" id="grid-filtered"></div>
      `;
      catalogContainer.appendChild(rowEl);
      const gridEl = rowEl.querySelector('#grid-filtered');
      filtered.forEach(movie => {
        gridEl.appendChild(createMovieCard(movie));
      });
    }
  }

  function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const fallbackSvg = getPosterSvgFallback(
      movie.title,
      movie.koreanTitle,
      movie.year,
      movie.rating,
      movie.genres ? movie.genres[0] : 'Drama',
      movie.fallbackColor || '#1a1e29'
    );

    const isAdult = movie.is18Plus || (movie.rating && movie.rating.includes('18'));

    card.innerHTML = `
      <div class="card-poster-wrapper">
        <img class="card-poster-img" src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackSvg}';">
        <div class="card-top-badges">
          <span class="catalog-pill">4K HD</span>
          ${isAdult ? '<span class="catalog-pill pill-18">18+</span>' : ''}
        </div>
        <div class="card-play-overlay">
          <div class="card-info-btn" title="View Movie Details & Preview">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="card-details">
        <div class="card-korean-title">${movie.koreanTitle}</div>
        <div class="card-title" title="${movie.title}">${movie.title}</div>
        <div class="card-meta-row">
          <span class="card-match">${movie.matchScore || '98% Match'}</span>
          <span>${movie.year}</span>
          <span class="meta-badge ${isAdult ? 'badge-18' : ''}">${movie.rating || '15+'}</span>
          <span class="meta-badge uhd">${movie.resolution || '4K UHD'}</span>
        </div>
        <div class="card-genres">${movie.genres ? movie.genres.join(' • ') : 'Korean Cinema'}</div>
      </div>
    `;

    card.addEventListener('click', () => openCinebyPreviewPage(movie));
    return card;
  }

  // 5. Cineby Dedicated Preview Page
  function openCinebyPreviewPage(movie) {
    activePreviewMovie = movie;

    const fallbackSvg = getPosterSvgFallback(
      movie.title,
      movie.koreanTitle,
      movie.year,
      movie.rating,
      movie.genres ? movie.genres[0] : 'Drama',
      movie.fallbackColor || '#1a1e29'
    );

    // Switch View
    homeView.style.display = 'none';
    previewView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL hash
    window.location.hash = `movie/${movie.id || movie.slug || '15859'}`;

    // Breadcrumbs
    bcCategory.textContent = movie.genres ? movie.genres[0] : 'Movies';
    bcTitle.textContent = `${movie.title} (${movie.year || '2004'})`;

    // Backdrop & Poster
    const backdropUrl = movie.backdrop || `/api/backdrop/${movie.id || 'parasite'}`;
    previewBackdrop.style.backgroundImage = `url('${backdropUrl}'), url('${fallbackSvg}')`;
    previewPosterImg.src = movie.poster || fallbackSvg;
    previewPosterImg.onerror = function() {
      this.onerror = null;
      this.src = fallbackSvg;
    };

    const isAdult = movie.is18Plus || (movie.rating && movie.rating.includes('18')) || (movie.contentWarning && movie.contentWarning.length > 0);

    previewPosterUhd.textContent = movie.resolution || '4K REMASTERED';
    previewPosterRating.textContent = movie.rating || (isAdult ? '18+' : '15+');
    previewPosterRating.className = `catalog-pill ${isAdult ? 'pill-18' : ''}`;

    // Specs
    specRating.textContent = `★ ${movie.imdbRating || '8.1'} (IMDb)`;
    specRelease.textContent = movie.releaseDate || movie.year || '2004';
    specRuntime.textContent = movie.duration || '2h 24m';
    specCountry.textContent = movie.country || 'South Korea';
    specAudio.textContent = movie.audio || 'Korean (Dolby 5.1)';
    specStudio.textContent = movie.studio || 'CJ Entertainment';

    // Titles
    previewKoreanEyebrow.textContent = movie.koreanTitle || '내 머리 속의 지우개';
    previewMainTitle.textContent = movie.title;
    previewTagline.textContent = movie.tagline ? `"${movie.tagline}"` : `Official Cineby Release • ${movie.year || '2004'}`;

    // Meta stats
    previewStarScore.textContent = movie.imdbRating || '8.1';
    previewMatch.textContent = movie.matchScore || '98% Match';
    previewMetaYear.textContent = movie.year || '2004';
    previewMetaAge.textContent = movie.rating || (isAdult ? '18+' : '15+');
    previewMetaAge.className = `meta-badge ${isAdult ? 'badge-18' : ''}`;
    previewMetaDuration.textContent = movie.duration || '2h 24m';

    // 18+ Content & Viewer Advisory Card
    if (previewAdvisoryBox) {
      if (isAdult) {
        previewAdvisoryBox.style.display = 'flex';
        if (previewAdvisoryText) {
          previewAdvisoryText.textContent = movie.contentWarning || '⚠️ Rated 18+ for mature themes, intense emotional heartbreak, adult situations, and romantic intimacy. Viewer discretion is strongly advised.';
        }
        if (previewAdvisoryTags) {
          const tags = movie.advisoryTags || ['18+ Restricted', 'Mature Themes', 'Adult Situations'];
          previewAdvisoryTags.innerHTML = tags.map(t => `<span class="advisory-tag">${t}</span>`).join('');
        }
      } else {
        previewAdvisoryBox.style.display = 'none';
      }
    }

    // Genres pills
    previewGenrePills.innerHTML = '';
    (movie.genres || ['Romance', 'Melodrama', 'Drama']).forEach(g => {
      const pill = document.createElement('span');
      pill.className = 'genre-pill';
      pill.textContent = g;
      previewGenrePills.appendChild(pill);
    });

    // Overview & Storyline
    previewStorylineText.textContent = movie.storyline || movie.synopsis || 'A deeply moving story of love, memory, and devotion.';

    // Top Cast Carousel
    previewCastCarousel.innerHTML = '';
    const castList = movie.castDetails || (movie.cast ? movie.cast.map(c => ({ name: c, character: 'Cast', role: 'Leading' })) : []);
    
    castList.forEach(actor => {
      const castCard = document.createElement('div');
      castCard.className = 'cast-card';
      const initials = actor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      castCard.innerHTML = `
        <div class="cast-avatar-circle">${initials}</div>
        <div class="cast-name">${actor.name}</div>
        <div class="cast-character">${actor.character}</div>
      `;
      previewCastCarousel.appendChild(castCard);
    });

    // Similar Movies Grid
    renderSimilarMovies(movie);

    // Hide search popup if open
    searchResultsPopup.classList.remove('active');
  }

  function renderSimilarMovies(currentMovie) {
    previewSimilarGrid.innerHTML = '';
    // Prank logic: Never show A Moment to Remember in recommendation sections!
    const similars = KOREAN_MOVIES_CATALOG
      .filter(m => m.id !== currentMovie.id && m.id !== '15859' && m.slug !== 'a-moment-to-remember')
      .slice(0, 6);

    similars.forEach(sim => {
      previewSimilarGrid.appendChild(createMovieCard(sim));
    });
  }

  function backToBrowse() {
    previewView.classList.remove('active');
    homeView.style.display = 'block';
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnBackBrowse.addEventListener('click', backToBrowse);
  bcHome.addEventListener('click', backToBrowse);
  navHomeLink.addEventListener('click', (e) => {
    e.preventDefault();
    backToBrowse();
  });
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    backToBrowse();
  });

  // Server Pills interaction
  document.querySelectorAll('.server-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.server-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // 6. Play Movie Trigger (Streams 0918 (1).mp4 for A Moment to Remember!)
  function launchMoviePlayback(movie) {
    const isTargetMovie = movie.id === '15859' || movie.slug === 'a-moment-to-remember';
    
    // For A Moment to Remember: Play the real downloaded movie (0918 (1).mp4)
    // For other browse titles: Play sample demo trailer
    let targetFilename = isTargetMovie ? '0918 (1).mp4' : 'sample-demo.mp4';
    if (isTargetMovie && userPastedMovie) {
      targetFilename = userPastedMovie.filename;
    }

    const streamUrl = `/api/stream?file=${encodeURIComponent(targetFilename)}`;

    window.kflixPlayer.open({
      id: movie.id,
      title: movie.title || 'A Moment to Remember',
      koreanTitle: `${movie.koreanTitle || '내 머리 속의 지우개'} • 4K Ultra HD`,
      filename: targetFilename,
      streamUrl: streamUrl,
      rating: movie.rating || '18+',
      is18Plus: isTargetMovie ? true : (movie.is18Plus !== undefined ? movie.is18Plus : false),
      contentWarning: movie.contentWarning,
      advisoryTags: movie.advisoryTags
    });
  }

  btnPreviewPlay.addEventListener('click', () => {
    if (activePreviewMovie) {
      launchMoviePlayback(activePreviewMovie);
    } else {
      launchMoviePlayback(KOREAN_MOVIES_CATALOG[0]);
    }
  });

  const heroMovie = KOREAN_MOVIES_CATALOG.find(m => m.id === 'dune-part-two') || KOREAN_MOVIES_CATALOG[1];

  btnHeroPlay.addEventListener('click', () => {
    launchMoviePlayback(heroMovie);
  });

  btnHeroPreview.addEventListener('click', () => {
    openCinebyPreviewPage(heroMovie);
  });

  btnHeroWatchlist.addEventListener('click', () => {
    btnHeroWatchlist.classList.toggle('active');
    alert(`Added "${heroMovie.title}" to your Watchlist!`);
  });

  btnPreviewTrailer.addEventListener('click', () => {
    const movie = activePreviewMovie || KOREAN_MOVIES_CATALOG[0];
    window.kflixPlayer.open({
      title: `${movie.title} - Official Trailer`,
      koreanTitle: `${movie.koreanTitle} 공식 예고편`,
      filename: 'sample-demo.mp4',
      streamUrl: '/api/stream'
    });
  });

  btnPreviewWatchlist.addEventListener('click', () => {
    btnPreviewWatchlist.classList.toggle('active');
    alert('Saved to your Watchlist!');
  });

  btnPreviewShare.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Movie link copied to clipboard!');
    }
  });

  // 7. Live Instant Search Dropdown
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchQuery = query;

    if (query.length > 0) {
      searchClearBtn.style.display = 'block';
      renderSearchPopup(query);
    } else {
      searchClearBtn.style.display = 'none';
      searchResultsPopup.classList.remove('active');
    }

    renderCatalog();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.style.display = 'none';
    searchResultsPopup.classList.remove('active');
    renderCatalog();
  });

  function renderSearchPopup(query) {
    const q = query.toLowerCase();
    const matches = KOREAN_MOVIES_CATALOG.filter(m => {
      if (m.id === '15859' || m.slug === 'a-moment-to-remember') {
        // Prank stealth logic: NEVER show A Moment to Remember in search suggestions
        // unless the user specifically typed a query targeting this movie!
        return q.includes('moment') ||
               q.includes('remember') ||
               q.includes('지우개') ||
               q.includes('15859') ||
               q.includes('son ye') ||
               q.includes('ye-jin') ||
               q.includes('jung woo') ||
               q.includes('woo-sung');
      }
      return m.title.toLowerCase().includes(q) ||
        m.koreanTitle.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.cast.some(c => c.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        (m.id && m.id.includes(q)) ||
        (m.slug && m.slug.includes(q));
    });

    if (matches.length === 0) {
      searchResultsPopup.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No movies found for "${query}"
        </div>
      `;
      searchResultsPopup.classList.add('active');
      return;
    }

    searchResultsPopup.innerHTML = '';
    matches.slice(0, 5).forEach(m => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      const isAdult = m.is18Plus || (m.rating && m.rating.includes('18'));

      const fallbackSvg = getPosterSvgFallback(
        m.title,
        m.koreanTitle,
        m.year,
        m.rating,
        m.genres[0] || 'Drama',
        m.fallbackColor || '#1a1e29'
      );

      item.innerHTML = `
        <img class="search-result-thumb" src="${m.poster}" alt="${m.title}" onerror="this.onerror=null; this.src='${fallbackSvg}';">
        <div class="search-result-info">
          <div class="search-result-korean">${m.koreanTitle}</div>
          <div class="search-result-title">${m.title}</div>
          <div class="search-result-meta">
            <span style="color:#f59e0b; font-weight:700;">★ ${m.imdbRating || '8.1'}</span>
            <span>${m.year}</span>
            <span class="meta-badge ${isAdult ? 'badge-18' : ''}" style="padding: 1px 6px; font-size: 10px;">${m.rating || '15+'}</span>
            <span>${m.genres[0]}</span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        searchResultsPopup.classList.remove('active');
        openCinebyPreviewPage(m);
      });

      searchResultsPopup.appendChild(item);
    });

    searchResultsPopup.classList.add('active');
  }

  // Close search popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResultsPopup.contains(e.target)) {
      searchResultsPopup.classList.remove('active');
    }
  });

  // 8. Category Tab Switcher
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      if (previewView.classList.contains('active')) {
        backToBrowse();
      }
      renderCatalog();
    });
  });

  // 9. Handle URL Hash Route (e.g. #movie/15859 or #movie/a-moment-to-remember)
  function handleHashRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#movie/')) {
      const id = hash.replace('#movie/', '');
      const match = KOREAN_MOVIES_CATALOG.find(m => m.id === id || m.slug === id);
      if (match) {
        openCinebyPreviewPage(match);
      }
    }
  }

  window.addEventListener('hashchange', handleHashRoute);

  // Initial Boot
  fetchServerMovies();
  renderCatalog();
  handleHashRoute();
});
