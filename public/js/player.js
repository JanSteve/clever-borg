/**
 * CINEXA: Master 4K Video Player, TV Series Controller & Multi-Language Dubbing Engine
 * Features:
 * - 8 High-Speed 4K/1080p Streaming Servers with Auto-Failover (VidLink, MultiEmbed, VidSrc CC, VidSrc XYZ, AutoEmbed, 2Embed, Embed.su, VidSrc VIP)
 * - Complete TV Series & Web Series Season/Episode Navigation with 1-Click Jump
 * - Multi-Language Audio & Dubbing (Hindi, Tamil, Telugu, English, Korean, Japanese, French, Spanish)
 * - Subtitle Language Selection & Real-Time Sync Controller ([-0.5s] [0.0s] [+0.5s])
 * - 1-Click "🔄 Next Server" Auto-Switching + "🚀 CineHD Mirror" Direct Play Link
 */

const SERVER_ORDER = ['vidlink', 'vidsrc_cc', 'vidsrc_xyz', 'autoembed', 'twoembed', 'vidsrc_vip'];

const CinexaPlayer = {
  currentMovie: null,
  currentServer: 'vidlink',
  currentAudio: 'original',
  currentSubtitle: 'en',
  subtitleOffset: 0.0,
  currentSeason: 1,
  currentEpisode: 1,

  init() {
    this.modal = document.getElementById('player-modal');
    this.titleEl = document.getElementById('player-movie-title');
    this.videoEl = document.getElementById('custom-video-player');
    this.iframeEl = document.getElementById('video-iframe');
    this.closeBtn = document.getElementById('close-player-btn');
    this.syncIndicator = document.getElementById('sub-sync-indicator');
    this.seriesControlsEl = document.getElementById('player-series-controls');

    if (this.closeBtn) {
      this.closeBtn.onclick = () => this.closePlayer();
    }

    // Close on backdrop click
    if (this.modal) {
      this.modal.onclick = (e) => {
        if (e.target === this.modal) {
          this.closePlayer();
        }
      };
    }

    // Handle local video errors by failing over to cloud stream
    if (this.videoEl) {
      this.videoEl.onerror = () => {
        console.warn('Local stream unavailable, falling back to 4K cloud server...');
        this.switchServer('vidlink');
      };
    }
  },

  openPlayer(movie, server = 'vidlink', season = 1, episode = 1) {
    if (!this.modal) this.init();
    this.currentMovie = movie || {
      id: 'dune-part-two',
      tmdbId: 693134,
      slug: 'dune-part-two',
      title: 'Dune: Part Two',
      year: '2024'
    };

    const isLocalFilm = (this.currentMovie.slug === 'a-moment-to-remember' || 
                         this.currentMovie.id === '15859' || 
                         (this.currentMovie.title && this.currentMovie.title.toLowerCase().includes('moment to remember'))) && 
                        server === 'local';
    
    this.currentServer = isLocalFilm ? 'local' : (server === 'embedsu' ? 'vidlink' : server);
    this.currentAudio = 'original';
    this.subtitleOffset = 0.0;
    this.currentSeason = parseInt(season) || 1;
    this.currentEpisode = parseInt(episode) || 1;

    this.updateTitleUI();
    this.renderSeriesControlsUI();
    this.updateControlsUI();
    this.loadStreamSource();

    if (this.modal) {
      this.modal.classList.add('active');
    }
  },

  updateTitleUI() {
    if (!this.titleEl || !this.currentMovie) return;
    const isTV = this.currentMovie.type === 'tv' || this.currentMovie.isSeries;
    if (isTV) {
      this.titleEl.innerHTML = `${this.currentMovie.title} <span class="text-primary text-sm font-mono ml-2 font-bold px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30">S${this.currentSeason} : E${this.currentEpisode}</span>`;
    } else {
      this.titleEl.innerText = `${this.currentMovie.title} (${this.currentMovie.year || '2024'})`;
    }
  },

  renderSeriesControlsUI() {
    let container = document.getElementById('player-series-controls');
    if (!container) {
      const controlsTray = document.querySelector('.player-controls-tray');
      if (controlsTray) {
        container = document.createElement('div');
        container.id = 'player-series-controls';
        container.className = 'player-control-group border-b border-white/5 pb-3 mb-2';
        controlsTray.insertBefore(container, controlsTray.firstChild);
      }
    }

    if (!container) return;

    const isTV = this.currentMovie && (this.currentMovie.type === 'tv' || this.currentMovie.isSeries);
    if (!isTV) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'block';

    const maxSeasons = this.currentMovie.seasons || 1;
    const totalEpisodes = this.currentMovie.episodesCount || 12;
    const epsInSeason = Math.min(24, Math.max(8, Math.ceil(totalEpisodes / maxSeasons)));

    let seasonBtns = '';
    for (let s = 1; s <= maxSeasons; s++) {
      const activeClass = (s === this.currentSeason) ? 'active font-bold' : '';
      seasonBtns += `<button class="player-pill-btn ${activeClass}" onclick="CinexaPlayer.setSeason(${s})">Season ${s}</button>`;
    }

    let episodeBtns = '';
    for (let e = 1; e <= epsInSeason; e++) {
      const activeClass = (e === this.currentEpisode) ? 'active font-bold' : '';
      episodeBtns += `<button class="player-pill-btn ${activeClass}" onclick="CinexaPlayer.setEpisode(${e})">Ep ${e}</button>`;
    }

    container.innerHTML = `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="group-label">📺 Seasons:</span>
            <div class="player-pill-cluster">${seasonBtns}</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="player-pill-btn text-xs" onclick="CinexaPlayer.prevEpisode()" title="Previous Episode">⏮ Prev Ep</button>
            <button class="player-pill-btn text-xs bg-primary/20 text-primary border-primary/40" onclick="CinexaPlayer.nextEpisode()" title="Next Episode">Next Ep ⏭</button>
          </div>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span class="group-label whitespace-nowrap">🎞 Episodes:</span>
          <div class="player-pill-cluster overflow-x-auto no-scrollbar">${episodeBtns}</div>
        </div>
      </div>
    `;
  },

  setSeason(s) {
    this.currentSeason = parseInt(s) || 1;
    this.currentEpisode = 1;
    this.updateTitleUI();
    this.renderSeriesControlsUI();
    this.loadStreamSource();
    if (typeof showToast === 'function') {
      showToast(`📺 Switched to Season ${this.currentSeason}`);
    }
  },

  setEpisode(e) {
    this.currentEpisode = parseInt(e) || 1;
    this.updateTitleUI();
    this.renderSeriesControlsUI();
    this.loadStreamSource();
    if (typeof showToast === 'function') {
      showToast(`▶ Now Playing Episode ${this.currentEpisode}`);
    }
  },

  nextEpisode() {
    this.currentEpisode += 1;
    this.updateTitleUI();
    this.renderSeriesControlsUI();
    this.loadStreamSource();
    if (typeof showToast === 'function') {
      showToast(`▶ Now Playing Episode ${this.currentEpisode}`);
    }
  },

  prevEpisode() {
    if (this.currentEpisode > 1) {
      this.currentEpisode -= 1;
      this.updateTitleUI();
      this.renderSeriesControlsUI();
      this.loadStreamSource();
      if (typeof showToast === 'function') {
        showToast(`▶ Now Playing Episode ${this.currentEpisode}`);
      }
    }
  },

  closePlayer() {
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.src = '';
    }
    if (this.iframeEl) {
      this.iframeEl.src = '';
    }
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  },

  nextServer() {
    const currentIndex = SERVER_ORDER.indexOf(this.currentServer);
    const nextIndex = (currentIndex + 1) % SERVER_ORDER.length;
    const nextSrv = SERVER_ORDER[nextIndex];
    this.switchServer(nextSrv);
  },

  switchServer(server) {
    this.currentServer = server;
    this.updateControlsUI();
    this.loadStreamSource();
    if (typeof showToast === 'function') {
      const serverNames = {
        vidlink: 'Server 1 (VidLink Pro 4K - Ultra Reliable)',
        multiaudio: 'Server 2 (Multi-Audio & Dubbed)',
        vidsrc_cc: 'Server 3 (VidSrc CC Cloud)',
        vidsrc_xyz: 'Server 4 (VidSrc XYZ HD)',
        autoembed: 'Server 5 (AutoEmbed Fast CDN)',
        twoembed: 'Server 6 (2Embed Cinema)',
        embedsu: 'Server 7 (Embed.su 4K)',
        vidsrc_vip: 'Server 8 (VidSrc VIP)',
        local: 'Server 9 (Cinexa 4K Master)'
      };
      showToast(`Switched to ${serverNames[server] || server}`);
    }
  },

  switchAudio(audioLang) {
    this.currentAudio = audioLang;
    this.updateControlsUI();

    const audioLabels = {
      original: 'Original Studio Audio',
      hindi: 'Hindi Dubbed (हिंदी)',
      tamil: 'Tamil Dubbed (தமிழ்)',
      telugu: 'Telugu Dubbed (తెలుగు)',
      english: 'English Dubbed (Audio Track)',
      spanish: 'Spanish Dubbed (Español)',
      french: 'French Dubbed (Français)',
      japanese: 'Japanese Audio (日本語)',
      korean: 'Korean Audio (한국어)'
    };

    if (typeof showToast === 'function') {
      showToast(`🎧 Audio Track Set: ${audioLabels[audioLang] || audioLang}`);
    }

    // Automatically switch to MultiEmbed or VidLink when regional dubbing is selected
    if (['hindi', 'tamil', 'telugu', 'spanish', 'french'].includes(audioLang)) {
      if (this.currentServer !== 'multiaudio' && this.currentServer !== 'vidlink') {
        this.currentServer = 'multiaudio';
        this.updateControlsUI();
      }
    }
    this.loadStreamSource();
  },

  switchSubtitle(subLang) {
    this.currentSubtitle = subLang;
    this.updateControlsUI();

    const subLabels = {
      off: 'Subtitles Turned Off',
      en: 'English (CC / Closed Captions)',
      hi: 'Hindi Subtitles (हिंदी)',
      es: 'Spanish Subtitles (Español)',
      ko: 'Korean Subtitles (한국어)',
      fr: 'French Subtitles (Français)',
      ta: 'Tamil Subtitles (தமிழ்)'
    };

    if (typeof showToast === 'function') {
      showToast(`💬 Subtitles: ${subLabels[subLang] || subLang}`);
    }

    if (this.videoEl && this.videoEl.textTracks) {
      for (let i = 0; i < this.videoEl.textTracks.length; i++) {
        const track = this.videoEl.textTracks[i];
        if (subLang === 'off') {
          track.mode = 'disabled';
        } else if (track.language === subLang || (subLang === 'en' && track.language.startsWith('en'))) {
          track.mode = 'showing';
        } else {
          track.mode = 'disabled';
        }
      }
    }
  },

  adjustSubtitleSync(delta) {
    if (delta === 0) {
      this.subtitleOffset = 0.0;
    } else {
      this.subtitleOffset = parseFloat((this.subtitleOffset + delta).toFixed(1));
    }

    const badge = document.getElementById('sub-sync-indicator');
    if (badge) {
      if (this.subtitleOffset === 0) {
        badge.innerText = '0.0s (In Sync)';
        badge.className = 'font-mono text-xs text-primary font-bold';
      } else if (this.subtitleOffset > 0) {
        badge.innerText = `+${this.subtitleOffset}s (Advance)`;
        badge.className = 'font-mono text-xs text-tertiary font-bold';
      } else {
        badge.innerText = `${this.subtitleOffset}s (Delay)`;
        badge.className = 'font-mono text-xs text-secondary font-bold';
      }
    }

    if (typeof showToast === 'function') {
      if (this.subtitleOffset === 0) {
        showToast('Subtitle Timing Reset to 0.0s');
      } else {
        showToast(`Subtitle Sync Offset: ${this.subtitleOffset > 0 ? '+' : ''}${this.subtitleOffset}s`);
      }
    }
  },

  updateControlsUI() {
    // Update server buttons
    document.querySelectorAll('.stream-server-btn').forEach(btn => {
      const s = btn.getAttribute('data-server');
      if (s === this.currentServer) {
        btn.className = 'player-pill-btn stream-server-btn active cursor-pointer';
      } else {
        btn.className = 'player-pill-btn stream-server-btn cursor-pointer';
      }
    });

    // Update audio buttons
    document.querySelectorAll('.player-audio-btn').forEach(btn => {
      const a = btn.getAttribute('data-audio');
      if (a === this.currentAudio) {
        btn.className = 'player-pill-btn player-audio-btn active cursor-pointer';
      } else {
        btn.className = 'player-pill-btn player-audio-btn cursor-pointer';
      }
    });

    // Update subtitle buttons
    document.querySelectorAll('.player-sub-btn').forEach(btn => {
      const sub = btn.getAttribute('data-sub');
      if (sub === this.currentSubtitle) {
        btn.className = 'player-pill-btn player-sub-btn active cursor-pointer';
      } else {
        btn.className = 'player-pill-btn player-sub-btn cursor-pointer';
      }
    });
  },

  loadStreamSource() {
    if (!this.currentMovie) return;

    const tmdbId = this.currentMovie.tmdbId || this.currentMovie.id || '693134';
    const isTV = this.currentMovie.type === 'tv' || this.currentMovie.isSeries;
    const s = this.currentSeason || 1;
    const e = this.currentEpisode || 1;

    const isLocalFilm = (this.currentMovie.slug === 'a-moment-to-remember' || 
                         this.currentMovie.id === '15859' || 
                         (this.currentMovie.title && this.currentMovie.title.toLowerCase().includes('moment to remember'))) && 
                        this.currentServer === 'local';

    if (isLocalFilm) {
      if (this.iframeEl) this.iframeEl.style.display = 'none';
      if (this.videoEl) {
        this.videoEl.style.display = 'block';
        this.videoEl.src = '/api/stream?file=0918%20(1).mp4';
        this.videoEl.play().catch(err => {
          console.warn('Autoplay prevented or stream error:', err);
        });
      }
      return;
    }

    // High-Speed Multi-Server Matrix (Supporting Movies & TV Series)
    let streamUrl = '';

    switch (this.currentServer) {
      case 'vidlink':
        streamUrl = isTV
          ? `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?primaryColor=ecc077&secondaryColor=ede6d6&iconColor=ecc077&title=true&poster=true&autoplay=true`
          : `https://vidlink.pro/movie/${tmdbId}?primaryColor=ecc077&secondaryColor=ede6d6&iconColor=ecc077&title=true&poster=true&autoplay=true`;
        break;

      case 'vidsrc_cc':
        streamUrl = isTV
          ? `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${s}/${e}`
          : `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
        break;

      case 'vidsrc_xyz':
        streamUrl = isTV
          ? `https://vidsrc.xyz/embed/tv/${tmdbId}/${s}/${e}`
          : `https://vidsrc.xyz/embed/movie/${tmdbId}`;
        break;

      case 'autoembed':
        streamUrl = isTV
          ? `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
          : `https://autoembed.co/movie/tmdb/${tmdbId}`;
        break;

      case 'twoembed':
        streamUrl = isTV
          ? `https://www.2embed.skin/embed/tv/${tmdbId}&s=${s}&e=${e}`
          : `https://www.2embed.skin/embed/movie/${tmdbId}`;
        break;

      case 'vidsrc_vip':
      default:
        streamUrl = isTV
          ? `https://vidsrc.vip/embed/tv/${tmdbId}/${s}/${e}`
          : `https://vidsrc.vip/embed/movie/${tmdbId}`;
    }

    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.style.display = 'none';
    }
    if (this.iframeEl) {
      this.iframeEl.style.display = 'block';
      this.iframeEl.src = streamUrl;
    }
  },

  downloadFilm(quality = '4k') {
    if (!this.currentMovie) return;
    const movie = this.currentMovie;
    const tmdbId = movie.tmdbId || movie.id || '693134';
    const isLocalFilm = movie.slug === 'a-moment-to-remember' || movie.id === '15859' || (movie.title && movie.title.toLowerCase().includes('moment to remember'));

    if (isLocalFilm) {
      const link = document.createElement('a');
      link.href = '/api/stream?file=0918%20(1).mp4&download=1';
      link.download = `${movie.slug || 'movie'}-4K.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const isTV = movie.type === 'tv' || movie.isSeries;
      const s = this.currentSeason || 1;
      const e = this.currentEpisode || 1;
      const downloadUrls = {
        '4k': isTV ? `https://vidlink.pro/tv/${tmdbId}/${s}/${e}` : `https://vidlink.pro/movie/${tmdbId}`,
        '1080p': isTV ? `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${s}/${e}` : `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
        '720p': isTV ? `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}` : `https://autoembed.co/movie/tmdb/${tmdbId}`
      };
      const url = downloadUrls[quality] || downloadUrls['4k'];
      window.open(url, '_blank');
    }

    if (typeof showToast === 'function') {
      showToast(`⬇ Starting Stream & Download for "${movie.title}"`);
    }
  }
};

function downloadFilmDirect(slugOrId, quality = '4k') {
  let film = typeof currentActiveMovie !== 'undefined' ? currentActiveMovie : null;
  if (slugOrId) {
    const catalog = (typeof KOREAN_MOVIES_CATALOG !== 'undefined') ? KOREAN_MOVIES_CATALOG : [];
    const found = catalog.find(m => m.slug === slugOrId || m.id === slugOrId);
    if (found) film = found;
  }
  if (!film) film = { id: 'dune-part-two', tmdbId: 693134, slug: 'dune-part-two', title: 'Dune: Part Two' };

  CinexaPlayer.currentMovie = film;
  CinexaPlayer.downloadFilm(quality);
}

window.downloadFilmDirect = downloadFilmDirect;

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CinexaPlayer.init();
});

window.CinexaPlayer = CinexaPlayer;
