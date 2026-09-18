/**
 * NovaFlix Application Logic
 * Worldwide Free Movie & Series Streaming Platform
 * - TMDB Global Live Movie Search & Discovery (1,000,000+ Movies)
 * - Multi-Source Streaming Server Switcher (VidSrc, VidLink, SuperEmbed, Trailer)
 * - Custom Player with Guaranteed Local 4K Streaming for "A Moment to Remember" (0918 (1).mp4)
 * - Google Ads & Responsive Monetization Slots
 * - Zero-Black-Screen Vector Art & Instant Preview Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentCategory = 'all';
  let searchQuery = '';
  let serverMovies = [];
  let userPastedMovie = null;
  let activePreviewMovie = null;
  let activeStreamingServer = 'vidsrc';
  let tmdbSearchResults = [];
  let searchDebounceTimer = null;

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

  // Preview Page Elements
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

  // 3. Fetch Local Server Uploads & Movies
  async function fetchServerMovies() {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        serverMovies = data.movies || [];
        userPastedMovie = serverMovies.find(m => !m.isDemo);
      }
    } catch (err) {
      console.log('[NovaFlix] Local movie sync in progress:', err);
    }
  }

  // 4. In-Feed Native Ad Card Generator
  function createInFeedAdCard() {
    const adCard = document.createElement('div');
    adCard.className = 'in-feed-ad-card';
    adCard.innerHTML = `
      <span class="in-feed-ad-badge">SPONSORED</span>
      <div style="font-size: 32px; margin: 15px 0 10px 0;">⚡</div>
      <h3 style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">NovaFlix 4K Ultra Pass</h3>
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; margin-bottom: 16px;">
        Zero buffering, instant downloads, and uncompressed Dolby Atmos on all your screens.
      </p>
      <a href="https://nordvpn.com" target="_blank" rel="noopener noreferrer" class="ad-cta-btn" style="width: 100%; text-align: center;">
        Claim Free Trial
      </a>
    `;
    return adCard;
  }

  // 5. Render Catalog Rows & Cards
  function renderCatalog() {
    catalogContainer.innerHTML = '';

    let filtered = [...KOREAN_MOVIES_CATALOG];

    // Prank perfection: Hide "A Moment to Remember" from main screen browsing rows & category tabs
    // so it is only surfaced when explicitly searching for it!
    if (searchQuery.trim() === '') {
      filtered = filtered.filter(m => !m.hidden && m.id !== '15859' && m.slug !== 'a-moment-to-remember');
    }

    if (currentCategory !== 'all') {
      filtered = filtered.filter(m => m.category === currentCategory || (m.genres && m.genres.some(g => g.toLowerCase().includes(currentCategory))));
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
        return (m.title && m.title.toLowerCase().includes(q)) ||
          (m.koreanTitle && m.koreanTitle.toLowerCase().includes(q)) ||
          (m.genres && m.genres.some(g => g.toLowerCase().includes(q))) ||
          (m.cast && m.cast.some(c => c.toLowerCase().includes(q))) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          (m.id && String(m.id).includes(q)) ||
          (m.slug && m.slug.includes(q));
      });

      // Merge TMDB search results
      if (tmdbSearchResults.length > 0) {
        const localSlugs = new Set(filtered.map(m => (m.title || '').toLowerCase()));
        tmdbSearchResults.forEach(tmdbMovie => {
          if (!localSlugs.has((tmdbMovie.title || '').toLowerCase())) {
            filtered.push(tmdbMovie);
          }
        });
      }
    }

    if (filtered.length === 0) {
      catalogContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: #06b6d4;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="color: #fff; font-size: 18px; margin-bottom: 6px;">Searching Global Movie Database...</h3>
          <p>Type any movie title to discover millions of titles worldwide.</p>
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

      sections.forEach((sec, idx) => {
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
          
          moviesInSec.forEach((movie, mIdx) => {
            gridEl.appendChild(createMovieCard(movie));
            // Seamlessly inject in-feed ad card every 8 items
            if (mIdx === 5) {
              gridEl.appendChild(createInFeedAdCard());
            }
          });
        }
      });
    } else {
      const rowEl = document.createElement('div');
      rowEl.className = 'movie-row';
      const isTmdbHit = tmdbSearchResults.length > 0;
      rowEl.innerHTML = `
        <div class="row-header">
          <h2 class="row-title">Search &amp; Category Results (${filtered.length})</h2>
          ${isTmdbHit ? '<span class="tmdb-live-indicator">● TMDB Live Global Database Connected</span>' : ''}
        </div>
        <div class="movie-grid" id="grid-filtered"></div>
      `;
      catalogContainer.appendChild(rowEl);
      const gridEl = rowEl.querySelector('#grid-filtered');
      filtered.forEach((movie, idx) => {
        gridEl.appendChild(createMovieCard(movie));
        if (idx === 6) {
          gridEl.appendChild(createInFeedAdCard());
        }
      });
    }
  }

  function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const fallbackSvg = getPosterSvgFallback(
      movie.title,
      movie.koreanTitle || movie.title,
      movie.year,
      movie.rating,
      movie.genres ? movie.genres[0] : 'Drama',
      movie.fallbackColor || '#1a1e29'
    );

    const posterSrc = movie.posterUrl || movie.poster || fallbackSvg;
    const isAdult = movie.is18Plus || (movie.rating && movie.rating.includes('18'));

    card.innerHTML = `
      <div class="card-poster-wrapper">
        <img class="card-poster-img" src="${posterSrc}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackSvg}';">
        <div class="card-top-badges">
          <span class="catalog-pill">${movie.isTmdb ? 'TMDB 4K' : '4K HD'}</span>
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
        <div class="card-korean-title">${movie.koreanTitle || movie.originalTitle || ''}</div>
        <div class="card-title" title="${movie.title}">${movie.title}</div>
        <div class="card-meta-row">
          <span class="card-match">${movie.matchScore || '98% Match'}</span>
          <span>${movie.year || '2024'}</span>
          <span class="meta-badge ${isAdult ? 'badge-18' : ''}">${movie.rating || '15+'}</span>
          <span class="meta-badge uhd">${movie.resolution || '4K UHD'}</span>
        </div>
        <div class="card-genres">${movie.genres ? movie.genres.slice(0, 3).join(' • ') : 'Global Cinema'}</div>
      </div>
    `;

    card.addEventListener('click', () => openCinebyPreviewPage(movie));
    return card;
  }

  // 6. Dedicated Movie Preview Page
  async function openCinebyPreviewPage(movie) {
    activePreviewMovie = movie;

    const fallbackSvg = getPosterSvgFallback(
      movie.title,
      movie.koreanTitle || movie.title,
      movie.year,
      movie.rating,
      movie.genres ? movie.genres[0] : 'Drama',
      movie.fallbackColor || '#1a1e29'
    );

    const isAdult = movie.is18Plus || (movie.rating && movie.rating.includes('18')) || (movie.contentWarning && movie.contentWarning.length > 0);

    // Backdrop
    if (previewBackdrop) {
      const backdropSrc = movie.backdropUrl || movie.backdrop || `/api/backdrop/${encodeURIComponent(movie.slug || movie.id)}`;
      previewBackdrop.style.backgroundImage = `linear-gradient(180deg, rgba(11, 12, 16, 0.4) 0%, rgba(11, 12, 16, 0.98) 100%), url('${backdropSrc}')`;
    }

    // Breadcrumbs
    bcCategory.textContent = movie.genres ? movie.genres[0] : 'Movies';
    bcTitle.textContent = `${movie.title} (${movie.year || '2024'})`;

    // Poster
    previewPosterImg.src = movie.posterUrl || movie.poster || fallbackSvg;
    previewPosterImg.onerror = function() {
      this.onerror = null;
      this.src = fallbackSvg;
    };

    previewPosterUhd.textContent = movie.resolution || '4K REMASTERED';
    previewPosterRating.textContent = movie.rating || (isAdult ? '18+' : '15+');
    previewPosterRating.className = `catalog-pill ${isAdult ? 'pill-18' : ''}`;

    // Specs
    specRating.textContent = `★ ${movie.imdbRating || '8.2'} (IMDb)`;
    specRelease.textContent = movie.releaseDate || movie.year || '2024';
    specRuntime.textContent = movie.duration || '2h 10m';
    specCountry.textContent = movie.country || 'Global Cinema';
    specAudio.textContent = movie.audio || 'Dolby Atmos / 5.1';
    specStudio.textContent = movie.studio || 'NovaFlix Studios';

    // Titles
    previewKoreanEyebrow.textContent = movie.koreanTitle || movie.originalTitle || '';
    previewMainTitle.textContent = movie.title;
    previewTagline.textContent = movie.tagline ? `"${movie.tagline}"` : `Now Streaming on NovaFlix Worldwide • ${movie.year || '2024'}`;

    // Meta stats
    previewStarScore.textContent = movie.imdbRating || '8.2';
    previewMatch.textContent = movie.matchScore || '98% Match';
    previewMetaYear.textContent = movie.year || '2024';
    previewMetaAge.textContent = movie.rating || (isAdult ? '18+' : '15+');
    previewMetaAge.className = `meta-badge ${isAdult ? 'badge-18' : ''}`;
    previewMetaDuration.textContent = movie.duration || '2h 10m';

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
    (movie.genres || ['Blockbuster', 'Entertainment']).forEach(g => {
      const pill = document.createElement('span');
      pill.className = 'genre-pill';
      pill.textContent = g;
      previewGenrePills.appendChild(pill);
    });

    // Overview & Storyline
    previewStorylineText.textContent = movie.storyline || movie.synopsis || 'Experience this cinematic masterpiece in 4K streaming only on NovaFlix.';

    // Top Cast Carousel
    renderCast(movie.castDetails || (movie.cast ? movie.cast.map(c => ({ name: c, character: 'Leading Cast' })) : []));

    // Similar Movies Grid
    renderSimilarMovies(movie);

    // Switch View
    homeView.style.display = 'none';
    previewView.classList.add('active');
    window.location.hash = `movie/${movie.slug || movie.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If TMDB movie and detailed cast not yet loaded, asynchronously fetch
    if (movie.isTmdb && (!movie.castDetails || movie.castDetails.length === 0) && window.TMDBService) {
      try {
        const details = await window.TMDBService.getMovieDetails(movie.tmdbId);
        if (details && activePreviewMovie && activePreviewMovie.id === movie.id) {
          activePreviewMovie = Object.assign(movie, details);
          if (details.castDetails && details.castDetails.length > 0) {
            renderCast(details.castDetails);
          }
          if (details.trailerUrl) {
            btnPreviewTrailer.style.display = 'inline-flex';
          }
        }
      } catch (e) {
        console.warn('Could not fetch extended TMDB details:', e);
      }
    }
  }

  function renderCast(castList) {
    previewCastCarousel.innerHTML = '';
    castList.slice(0, 10).forEach(actor => {
      const castCard = document.createElement('div');
      castCard.className = 'cast-card';
      const initials = actor.name ? actor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AC';
      
      let avatarHtml = `<div class="cast-avatar-circle">${initials}</div>`;
      if (actor.avatar) {
        avatarHtml = `<img src="${actor.avatar}" alt="${actor.name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; border: 2px solid rgba(6, 182, 212, 0.4);" onerror="this.outerHTML='<div class=\\'cast-avatar-circle\\'>${initials}</div>';">`;
      }

      castCard.innerHTML = `
        ${avatarHtml}
        <div class="cast-name">${actor.name}</div>
        <div class="cast-character">${actor.character || 'Cast'}</div>
      `;
      previewCastCarousel.appendChild(castCard);
    });
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
      const btn = e.target.closest('.server-pill');
      if (btn) {
        btn.classList.add('active');
        activeStreamingServer = btn.dataset.server || 'vidsrc';
      }
    });
  });

  // 7. Play Movie Trigger (Guaranteed stream of 0918 (1).mp4 for A Moment to Remember!)
  function launchMoviePlayback(movie, serverOption) {
    const isTargetMovie = movie.id === '15859' || movie.slug === 'a-moment-to-remember';
    const server = serverOption || activeStreamingServer;

    let targetFilename = isTargetMovie ? '0918 (1).mp4' : 'sample-demo.mp4';
    if (isTargetMovie && userPastedMovie) {
      targetFilename = userPastedMovie.filename;
    }

    const streamUrl = `/api/stream?file=${encodeURIComponent(targetFilename)}`;

    window.kflixPlayer.open({
      id: movie.id,
      tmdbId: movie.tmdbId,
      isTmdb: movie.isTmdb,
      title: movie.title || 'A Moment to Remember',
      koreanTitle: `${movie.koreanTitle || movie.originalTitle || ''} • 4K Ultra HD`,
      filename: targetFilename,
      streamUrl: streamUrl,
      trailerUrl: movie.trailerUrl,
      streamingSources: movie.streamingSources,
      rating: movie.rating || '18+',
      is18Plus: isTargetMovie ? true : (movie.is18Plus !== undefined ? movie.is18Plus : false),
      contentWarning: movie.contentWarning,
      advisoryTags: movie.advisoryTags
    }, server);
  }

  btnPreviewPlay.addEventListener('click', () => {
    if (activePreviewMovie) {
      launchMoviePlayback(activePreviewMovie);
    } else {
      launchMoviePlayback(KOREAN_MOVIES_CATALOG[0]);
    }
  });

  btnPreviewTrailer.addEventListener('click', () => {
    if (activePreviewMovie) {
      launchMoviePlayback(activePreviewMovie, 'trailer');
    }
  });

  btnHeroPlay.addEventListener('click', () => {
    const heroMovie = KOREAN_MOVIES_CATALOG.find(m => m.id === 'dune-part-two') || KOREAN_MOVIES_CATALOG[1];
    launchMoviePlayback(heroMovie);
  });

  btnHeroPreview.addEventListener('click', () => {
    const heroMovie = KOREAN_MOVIES_CATALOG.find(m => m.id === 'dune-part-two') || KOREAN_MOVIES_CATALOG[1];
    openCinebyPreviewPage(heroMovie);
  });

  btnHeroWatchlist.addEventListener('click', () => {
    alert('Dune: Part Two added to your watchlist!');
  });

  btnPreviewWatchlist.addEventListener('click', () => {
    btnPreviewWatchlist.classList.toggle('active');
    alert('Saved to your Watchlist!');
  });

  btnPreviewShare.addEventListener('click', () => {
    if (window.NovaFlixAds && typeof window.NovaFlixAds.openShareModal === 'function' && activePreviewMovie) {
      window.NovaFlixAds.openShareModal(activePreviewMovie);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Movie link copied to clipboard!');
    }
  });

  // 8. Live Instant Search Dropdown with TMDB Global Lookup
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchQuery = query;

    if (query.length > 0) {
      searchClearBtn.style.display = 'block';
      renderSearchPopup(query);

      // Debounced TMDB query for any movie worldwide
      clearTimeout(searchDebounceTimer);
      if (query.length >= 2 && window.TMDBService) {
        searchDebounceTimer = setTimeout(async () => {
          try {
            const results = await window.TMDBService.searchTmdb(query);
            if (searchQuery === query) {
              tmdbSearchResults = results;
              renderSearchPopup(query);
              renderCatalog();
            }
          } catch (err) {
            console.warn('TMDB search error:', err);
          }
        }, 300);
      }
    } else {
      searchClearBtn.style.display = 'none';
      searchResultsPopup.classList.remove('active');
      tmdbSearchResults = [];
      renderCatalog();
    }
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    tmdbSearchResults = [];
    searchClearBtn.style.display = 'none';
    searchResultsPopup.classList.remove('active');
    renderCatalog();
  });

  function renderSearchPopup(query) {
    const q = query.toLowerCase();
    let matches = KOREAN_MOVIES_CATALOG.filter(m => {
      if (m.id === '15859' || m.slug === 'a-moment-to-remember' || m.hidden) {
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
      return (m.title && m.title.toLowerCase().includes(q)) ||
        (m.koreanTitle && m.koreanTitle.toLowerCase().includes(q)) ||
        (m.genres && m.genres.some(g => g.toLowerCase().includes(q))) ||
        (m.cast && m.cast.some(c => c.toLowerCase().includes(q))) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        (m.id && String(m.id).includes(q)) ||
        (m.slug && m.slug.includes(q));
    });

    // Add TMDB results to popup matches
    if (tmdbSearchResults.length > 0) {
      const existingTitles = new Set(matches.map(m => m.title.toLowerCase()));
      tmdbSearchResults.forEach(tm => {
        if (!existingTitles.has(tm.title.toLowerCase())) {
          matches.push(tm);
        }
      });
    }

    if (matches.length === 0) {
      searchResultsPopup.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          Searching global movie database for "${query}"...
        </div>
      `;
      searchResultsPopup.classList.add('active');
      return;
    }

    searchResultsPopup.innerHTML = '';
    matches.slice(0, 6).forEach(m => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      const isAdult = m.is18Plus || (m.rating && m.rating.includes('18'));

      const fallbackSvg = getPosterSvgFallback(
        m.title,
        m.koreanTitle || m.title,
        m.year,
        m.rating,
        m.genres ? m.genres[0] : 'Drama',
        m.fallbackColor || '#1a1e29'
      );

      const posterSrc = m.posterUrl || m.poster || fallbackSvg;

      item.innerHTML = `
        <img class="search-result-thumb" src="${posterSrc}" alt="${m.title}" onerror="this.onerror=null; this.src='${fallbackSvg}';">
        <div class="search-result-info">
          <div class="search-result-korean">${m.koreanTitle || m.originalTitle || ''}</div>
          <div class="search-result-title">${m.title}</div>
          <div class="search-result-meta">
            <span style="color:#f59e0b; font-weight:700;">★ ${m.imdbRating || '8.2'}</span>
            <span>${m.year || '2024'}</span>
            <span class="meta-badge ${isAdult ? 'badge-18' : ''}" style="padding: 1px 6px; font-size: 10px;">${m.rating || '15+'}</span>
            <span>${m.genres ? m.genres[0] : 'Cinema'}</span>
            ${m.isTmdb ? '<span style="color:#06b6d4; font-size:10px; font-weight:800;">TMDB</span>' : ''}
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

  // 9. Sticky Ad Dismissal
  const stickyCloseBtn = document.getElementById('ad-sticky-close');
  const stickyFooter = document.getElementById('ad-sticky-footer');
  if (stickyCloseBtn && stickyFooter) {
    stickyCloseBtn.addEventListener('click', () => {
      stickyFooter.classList.add('hidden');
    });
  }

  // 10. Category Tab Switcher
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      const btn = e.target.closest('.tab-btn');
      if (btn) {
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        if (previewView.classList.contains('active')) {
          backToBrowse();
        }
        renderCatalog();
      }
    });
  });

  // 11. Handle URL Hash Route
  async function handleHashRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#movie/')) {
      const id = hash.replace('#movie/', '');
      const match = KOREAN_MOVIES_CATALOG.find(m => m.id === id || m.slug === id);
      if (match) {
        openCinebyPreviewPage(match);
      } else if (id.startsWith('tmdb-') && window.TMDBService) {
        const cleanId = id.replace('tmdb-', '');
        const details = await window.TMDBService.getMovieDetails(cleanId);
        if (details) {
          openCinebyPreviewPage(details);
        }
      }
    }
  }

  window.addEventListener('hashchange', handleHashRoute);

  // Initial Boot
  fetchServerMovies();
  renderCatalog();
  handleHashRoute();
});
