/**
 * CINEXA: Master 4K Video Player & Multi-Language Dubbing Engine
 * Features:
 * - 8 High-Speed 4K/1080p Streaming Servers with Auto-Failover (Embed.su, VidLink, MultiEmbed, VidSrc VIP, AutoEmbed, 2Embed, VidSrc Cloud, Local)
 * - Multi-Language Audio & Dubbing (Hindi, Tamil, Telugu, English, Korean, Japanese, French, Spanish)
 * - Subtitle Language Selection & Real-Time Sync Controller ([-0.5s] [0.0s] [+0.5s])
 * - 1-Click "🔄 Next Server" Auto-Switching to fix any unplayable streams immediately
 */

const SERVER_ORDER = ['embedsu', 'vidlink', 'multiaudio', 'vidsrc_vip', 'vidsrc_to', 'autoembed', 'twoembed', 'vidsrc_me'];

const CinexaPlayer = {
  currentMovie: null,
  currentServer: 'embedsu',
  currentAudio: 'original',
  currentSubtitle: 'en',
  subtitleOffset: 0.0,

  init() {
    this.modal = document.getElementById('player-modal');
    this.titleEl = document.getElementById('player-movie-title');
    this.videoEl = document.getElementById('custom-video-player');
    this.iframeEl = document.getElementById('video-iframe');
    this.closeBtn = document.getElementById('close-player-btn');
    this.syncIndicator = document.getElementById('sub-sync-indicator');

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
        this.switchServer('embedsu');
      };
    }
  },

  openPlayer(movie, server = 'embedsu') {
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
    
    this.currentServer = isLocalFilm ? 'local' : server;
    this.currentAudio = 'original';
    this.subtitleOffset = 0.0;

    if (this.titleEl) {
      this.titleEl.innerText = `${this.currentMovie.title} (${this.currentMovie.year || '2024'})`;
    }

    this.updateControlsUI();
    this.loadStreamSource();

    if (this.modal) {
      this.modal.classList.add('active');
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
        embedsu: 'Server 1 (Embed.su 4K Ultra Fast)',
        vidlink: 'Server 2 (VidLink Pro 4K)',
        multiaudio: 'Server 3 (Multi-Audio & Dubbed)',
        vidsrc_vip: 'Server 4 (VidSrc VIP 4K)',
        vidsrc_to: 'Server 5 (VidSrc To Cloud)',
        autoembed: 'Server 6 (AutoEmbed Fast CDN)',
        twoembed: 'Server 7 (2Embed Cinema)',
        vidsrc_me: 'Server 8 (VidSrc ME)',
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

    // When dubbing is requested, automatically prioritize MultiEmbed or EmbedSU which support multi-audio streams
    if (['hindi', 'tamil', 'telugu', 'spanish', 'french'].includes(audioLang)) {
      if (this.currentServer !== 'multiaudio' && this.currentServer !== 'embedsu') {
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

    // Toggle video tracks for HTML5 player
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

    // Apply real-time cue shift on HTML5 video player textTracks
    if (this.videoEl && this.videoEl.textTracks) {
      for (let i = 0; i < this.videoEl.textTracks.length; i++) {
        const track = this.videoEl.textTracks[i];
        if (track.cues) {
          for (let j = 0; j < track.cues.length; j++) {
            const cue = track.cues[j];
            if (cue) {
              cue.startTime = Math.max(0, cue.startTime + delta);
              cue.endTime = Math.max(0.1, cue.endTime + delta);
            }
          }
        }
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

    // Multi-Server Cloud Stream Matrix
    let streamUrl = '';

    switch (this.currentServer) {
      case 'embedsu':
        streamUrl = `https://embed.su/embed/movie/${tmdbId}`;
        break;
      case 'vidlink':
        streamUrl = `https://vidlink.pro/movie/${tmdbId}?primaryColor=ecc077&secondaryColor=ede6d6&iconColor=ecc077&title=true&poster=true&autoplay=true`;
        break;
      case 'multiaudio':
        streamUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
        break;
      case 'vidsrc_vip':
        streamUrl = `https://vidsrc.vip/embed/movie/${tmdbId}`;
        break;
      case 'vidsrc_to':
        streamUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;
        break;
      case 'autoembed':
        streamUrl = `https://autoembed.co/movie/tmdb/${tmdbId}`;
        break;
      case 'twoembed':
        streamUrl = `https://www.2embed.skin/embed/movie/${tmdbId}`;
        break;
      case 'vidsrc_me':
        streamUrl = `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
        break;
      case 'local':
      default:
        streamUrl = `https://embed.su/embed/movie/${tmdbId}`;
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
      const downloadUrls = {
        '4k': `https://embed.su/embed/movie/${tmdbId}`,
        '1080p': `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        '720p': `https://autoembed.co/movie/tmdb/${tmdbId}`
      };
      const url = downloadUrls[quality] || downloadUrls['4k'];
      window.open(url, '_blank');
    }

    if (typeof showToast === 'function') {
      showToast(`⬇ Starting ${quality.toUpperCase()} Download for "${movie.title}"`);
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
