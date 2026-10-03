/**
 * CINEXA: Master 4K Video Player & Stream Engine
 * Guaranteed local video playback for "A Moment to Remember" prank stream (/subtitles/0918 (1).mp4)
 * Multi-server failover for world cinema catalog:
 * - Server 1: Cinexa 4K Master (Direct Photochemical Scan)
 * - Server 2: FastCDN Global Edge
 * - Server 3: VidLink HD
 * - Server 4: VidSrc Cloud
 */

const CinexaPlayer = {
  currentMovie: null,
  currentServer: 'local',

  init() {
    this.modal = document.getElementById('player-modal');
    this.titleEl = document.getElementById('player-movie-title');
    this.videoEl = document.getElementById('custom-video-player');
    this.iframeEl = document.getElementById('video-iframe');
    this.closeBtn = document.getElementById('close-player-btn');
    this.serverBtns = document.querySelectorAll('.stream-servers-bar .server-btn');

    if (this.closeBtn) {
      this.closeBtn.onclick = () => this.closePlayer();
    }

    if (this.serverBtns) {
      this.serverBtns.forEach(btn => {
        btn.onclick = () => {
          const s = btn.getAttribute('data-server');
          this.switchServer(s);
        };
      });
    }

    // Close on backdrop click
    if (this.modal) {
      this.modal.onclick = (e) => {
        if (e.target === this.modal) {
          this.closePlayer();
        }
      };
    }
  },

  openPlayer(movie, server = 'local') {
    if (!this.modal) this.init();
    this.currentMovie = movie || {
      id: '15859',
      slug: 'a-moment-to-remember',
      title: 'A Moment to Remember',
      year: '2004'
    };
    this.currentServer = server;

    if (this.titleEl) {
      this.titleEl.innerText = `${this.currentMovie.title} (${this.currentMovie.year || '2004'})`;
    }

    this.updateServerUI();
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

  switchServer(server) {
    this.currentServer = server;
    this.updateServerUI();
    this.loadStreamSource();
  },

  updateServerUI() {
    if (!this.serverBtns) return;
    this.serverBtns.forEach(btn => {
      if (btn.getAttribute('data-server') === this.currentServer) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  loadStreamSource() {
    if (!this.currentMovie) return;
    const isPrankFilm = this.currentMovie.slug === 'a-moment-to-remember' || 
                        this.currentMovie.id === '15859' || 
                        (this.currentMovie.title && this.currentMovie.title.toLowerCase().includes('moment to remember'));

    if (isPrankFilm) {
      // Guaranteed Local Video Playback
      if (this.iframeEl) this.iframeEl.style.display = 'none';
      if (this.videoEl) {
        this.videoEl.style.display = 'block';
        this.videoEl.src = '/subtitles/0918 (1).mp4';
        this.videoEl.play().catch(err => console.log('Autoplay handled:', err));
      }
      return;
    }

    // Other films: Multi-Server Failover with correct TMDB numeric ID
    const tmdbId = this.currentMovie.tmdbId || this.currentMovie.id || '15859';
    let streamUrl = '';

    switch (this.currentServer) {
      case 'local':
      case 'fastcdn':
        streamUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;
        break;
      case 'vidlink':
        streamUrl = `https://vidlink.pro/movie/${tmdbId}`;
        break;
      case 'vidsrc':
        streamUrl = `https://vidsrc.xyz/embed/movie/${tmdbId}`;
        break;
      default:
        streamUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;
    }

    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.style.display = 'none';
    }
    if (this.iframeEl) {
      this.iframeEl.style.display = 'block';
      this.iframeEl.src = streamUrl;
    }
  }
};

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CinexaPlayer.init();
});

window.CinexaPlayer = CinexaPlayer;
