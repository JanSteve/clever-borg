/**
 * K-FLIX Custom Cinematic Video Player Controller
 * Implements:
 * - HTML5 Range-based Video Playback
 * - -10s / +10s Skip with ripple cues
 * - Interactive Scrubbing Timeline with Hover Preview Tooltip & Buffered progress
 * - Dynamic Runtime Bar (Elapsed / Duration / Remaining)
 * - Settings Menu: Subtitles, Playback Speeds, Quality simulation, Custom Subtitle loader
 * - Auto-hiding Controls on Idle
 * - Fullscreen & Picture-in-Picture
 * - Keyboard Shortcuts (Space, Left/Right Arrows, F, M, C)
 */

class KFlixPlayer {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.idleTimer = null;
    this.isDraggingTimeline = false;
    this.currentMovie = null;
    this.lastVolume = 1;
    this.subtitlesActive = true;
  }

  initElements() {
    // Containers
    this.playerView = document.getElementById('player-view');
    this.playerOverlay = document.getElementById('player-overlay');
    this.video = document.getElementById('main-video');
    this.embedFrame = document.getElementById('embed-stream-frame');

    // Headers & Labels
    this.movieTitle = document.getElementById('player-movie-name') || document.getElementById('player-movie-title');
    this.movieKorean = document.getElementById('player-movie-korean');
    this.qualityBadge = document.getElementById('player-quality-badge');
    this.ageBadge = document.getElementById('player-age-badge');
    this.backBtn = document.getElementById('player-back-btn');

    // 18+ Content Advisory Toast
    this.advisoryToast = document.getElementById('player-advisory-toast');
    this.advisoryMessage = document.getElementById('player-advisory-message');
    this.advisoryClose = document.getElementById('player-advisory-close');
    this.advisoryTimer = null;

    // Center Feedback & Ripples
    this.centerFeedback = document.getElementById('center-feedback');
    this.centerFeedbackIcon = document.getElementById('center-feedback-icon');
    this.skipLeft = document.getElementById('skip-ripple-left');
    this.skipRight = document.getElementById('skip-ripple-right');

    // Timeline Scrubber
    this.timelineContainer = document.getElementById('timeline-container');
    this.timelineTrack = document.getElementById('timeline-track');
    this.timelineProgress = document.getElementById('timeline-progress');
    this.timelineBuffered = document.getElementById('timeline-buffered');
    this.timelineTooltip = document.getElementById('timeline-tooltip');

    // Controls
    this.playPauseBtn = document.getElementById('btn-play-pause');
    this.playIcon = document.getElementById('icon-play');
    this.pauseIcon = document.getElementById('icon-pause');
    this.skipBackBtn = document.getElementById('btn-skip-back');
    this.skipForwardBtn = document.getElementById('btn-skip-forward');
    this.timeDisplay = document.getElementById('player-time-display');

    // Audio & Volume
    this.muteBtn = document.getElementById('btn-mute');
    this.iconVolumeHigh = document.getElementById('icon-volume-high');
    this.iconVolumeMuted = document.getElementById('icon-volume-muted');
    this.volumeSlider = document.getElementById('volume-slider');

    // Subtitles & Settings
    this.subtitlesBtn = document.getElementById('btn-subtitles');
    this.settingsBtn = document.getElementById('btn-settings');
    this.settingsModal = document.getElementById('player-settings-modal');
    this.customSubInput = document.getElementById('custom-sub-input');
    this.btnUploadSub = document.getElementById('btn-upload-vtt');

    // Screen
    this.pipBtn = document.getElementById('btn-pip');
    this.fullscreenBtn = document.getElementById('btn-fullscreen');
  }

  bindEvents() {
    // Playback state
    this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('play', () => this.onPlayStateChange());
    this.video.addEventListener('pause', () => this.onPlayStateChange());

    // Time & Timeline
    this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.video.addEventListener('progress', () => this.onProgressUpdate());
    this.video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
    this.video.addEventListener('ended', () => this.onEnded());

    // ±10 Seconds Skip
    this.skipBackBtn.addEventListener('click', () => this.skipSeconds(-10));
    this.skipForwardBtn.addEventListener('click', () => this.skipSeconds(10));

    // Double-click skip zones
    this.video.addEventListener('dblclick', (e) => {
      const rect = this.video.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) {
        this.skipSeconds(-10);
      } else {
        this.skipSeconds(10);
      }
    });

    // Timeline Scrubbing & Tooltip
    this.timelineContainer.addEventListener('mousemove', (e) => this.onTimelineHover(e));
    this.timelineContainer.addEventListener('mousedown', (e) => this.onTimelineMouseDown(e));
    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingTimeline) this.onTimelineDrag(e);
    });
    window.addEventListener('mouseup', () => {
      if (this.isDraggingTimeline) this.isDraggingTimeline = false;
    });

    // Volume
    this.volumeSlider.addEventListener('input', (e) => this.onVolumeChange(e.target.value));
    this.muteBtn.addEventListener('click', () => this.toggleMute());

    // Settings & Subtitles
    this.subtitlesBtn.addEventListener('click', () => this.toggleSubtitles());
    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSettingsModal();
    });
    document.addEventListener('click', (e) => {
      if (!this.settingsModal.contains(e.target) && e.target !== this.settingsBtn) {
        this.settingsModal.classList.remove('show');
      }
    });

    // Settings pills (Speed & Quality)
    document.querySelectorAll('.speed-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.speed-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.setPlaybackSpeed(parseFloat(e.target.dataset.speed));
      });
    });

    document.querySelectorAll('.quality-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.quality-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.setQuality(e.target.dataset.quality);
      });
    });

    document.querySelectorAll('.sub-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.sub-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.selectSubtitleTrack(e.target.dataset.sub);
      });
    });

    // Custom Subtitle Upload
    if (this.btnUploadSub && this.customSubInput) {
      this.btnUploadSub.addEventListener('click', () => this.customSubInput.click());
      this.customSubInput.addEventListener('change', (e) => this.onCustomSubtitleSelected(e));
    }

    // Screen controls
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    if (this.pipBtn && document.pictureInPictureEnabled) {
      this.pipBtn.addEventListener('click', () => this.togglePictureInPicture());
    } else if (this.pipBtn) {
      this.pipBtn.style.display = 'none';
    }

    // Exit Player
    this.backBtn.addEventListener('click', () => this.close());

    // Advisory Toast Close
    if (this.advisoryClose) {
      this.advisoryClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideAdvisoryToast();
      });
    }

    // Mouse idle auto-hide controls
    this.playerView.addEventListener('mousemove', () => this.resetIdleTimer());
    this.playerView.addEventListener('mouseenter', () => this.resetIdleTimer());
    this.playerView.addEventListener('click', () => this.resetIdleTimer());

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  showAdvisoryToast(message) {
    if (!this.advisoryToast) return;
    if (this.advisoryMessage && message) {
      this.advisoryMessage.textContent = message;
    }
    clearTimeout(this.advisoryTimer);
    this.advisoryToast.classList.add('visible');

    // Auto-fade after 6.5 seconds
    this.advisoryTimer = setTimeout(() => {
      this.hideAdvisoryToast();
    }, 6500);
  }

  hideAdvisoryToast() {
    if (!this.advisoryToast) return;
    clearTimeout(this.advisoryTimer);
    this.advisoryToast.classList.remove('visible');
  }

  open(movie, serverMode = 'auto') {
    this.currentMovie = movie;
    this.movieTitle.textContent = movie.title || movie.filename || 'Hosted Cinema Film';
    this.movieKorean.textContent = movie.koreanTitle || movie.originalTitle || '';

    // 18+ Content Advisory Warning Configuration
    const isAdult = movie.is18Plus || (movie.rating && movie.rating.includes('18')) || (movie.contentWarning && movie.contentWarning.length > 0);

    if (this.ageBadge) {
      this.ageBadge.textContent = movie.rating || (isAdult ? '18+' : '15+');
      if (isAdult) {
        this.ageBadge.style.background = '#e50914';
        this.ageBadge.style.borderColor = '#e50914';
        this.ageBadge.style.color = '#fff';
      } else {
        this.ageBadge.style.background = 'rgba(255, 255, 255, 0.12)';
        this.ageBadge.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        this.ageBadge.style.color = '#e2e8f0';
      }
    }

    if (isAdult) {
      const msg = movie.contentWarning 
        ? movie.contentWarning.replace('⚠️', '').trim() 
        : 'Rated 18+ for Mature Themes, Emotional Trauma, and Adult Situations';
      this.showAdvisoryToast(msg);
    } else {
      this.hideAdvisoryToast();
    }

    const isPrank = movie.slug === 'a-moment-to-remember' || movie.id === '15859' || movie.id === 15859;

    if (isPrank) {
      // 100% Guaranteed Local Playback for Prank Movie (0918 (1).mp4)
      if (this.embedFrame) {
        this.embedFrame.style.display = 'none';
        this.embedFrame.src = '';
      }
      this.video.style.display = 'block';
      const streamUrl = movie.streamUrl || `/api/stream?file=0918%20(1).mp4`;
      const fullExpectedSrc = streamUrl.startsWith('http') ? streamUrl : (window.location.origin + streamUrl);

      if (this.video.src !== fullExpectedSrc) {
        this.video.src = streamUrl;
        this.loadDefaultSubtitles();
      }

      this.video.play().catch(err => {
        console.log('Autoplay waiting for user gesture:', err);
      });
    } else if (serverMode === 'trailer' && movie.trailerUrl) {
      // Stream official YouTube trailer in embed player
      this.video.pause();
      this.video.style.display = 'none';
      if (this.embedFrame) {
        this.embedFrame.style.display = 'block';
        this.embedFrame.src = movie.trailerUrl;
      }
    } else if (movie.tmdbId || movie.isTmdb) {
      // Multi-Source Streaming Embed for TMDB Movies
      const tmdbId = movie.tmdbId || String(movie.id).replace(/^tmdb-/, '');
      let embedUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;
      if (serverMode === 'vidlink') {
        embedUrl = `https://vidlink.pro/movie/${tmdbId}`;
      } else if (serverMode === 'superembed') {
        embedUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      } else if (serverMode === 'trailer' && movie.trailerUrl) {
        embedUrl = movie.trailerUrl;
      }

      this.video.pause();
      this.video.style.display = 'none';
      if (this.embedFrame) {
        this.embedFrame.style.display = 'block';
        this.embedFrame.src = embedUrl;
      }
    } else {
      // Local hosted or demo fallback
      if (this.embedFrame) {
        this.embedFrame.style.display = 'none';
        this.embedFrame.src = '';
      }
      this.video.style.display = 'block';
      const streamUrl = movie.streamUrl || `/api/stream?file=${encodeURIComponent(movie.filename || 'sample-demo.mp4')}`;
      const isExternal = streamUrl.startsWith('http://') || streamUrl.startsWith('https://');
      const fullExpectedSrc = isExternal ? streamUrl : (window.location.origin + streamUrl);

      if (this.video.src !== fullExpectedSrc) {
        this.video.src = streamUrl;
        this.loadDefaultSubtitles();
      }

      this.video.play().catch(err => {
        console.log('Autoplay waiting for user gesture:', err);
      });
    }

    this.playerView.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Restore last position if saved
    const savedTime = localStorage.getItem(`kflix_pos_${movie.id || movie.filename}`);
    if (savedTime && parseFloat(savedTime) > 0 && !isPrank) {
      this.video.currentTime = parseFloat(savedTime);
    }

    this.resetIdleTimer();
  }

  close() {
    this.hideAdvisoryToast();

    if (this.embedFrame) {
      this.embedFrame.src = '';
      this.embedFrame.style.display = 'none';
    }

    // Save current playback position
    if (this.currentMovie && this.video.currentTime > 0) {
      localStorage.setItem(`kflix_pos_${this.currentMovie.id || this.currentMovie.filename}`, this.video.currentTime);
    }

    this.video.pause();
    this.video.style.display = 'block';
    this.playerView.classList.remove('active');
    this.settingsModal.classList.remove('show');
    document.body.style.overflow = '';

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  togglePlay() {
    if (this.video.paused || this.video.ended) {
      this.video.play();
      this.showCenterFeedback('play');
    } else {
      this.video.pause();
      this.showCenterFeedback('pause');
    }
  }

  onPlayStateChange() {
    if (this.video.paused) {
      this.playIcon.style.display = 'block';
      this.pauseIcon.style.display = 'none';
      this.showControls();
    } else {
      this.playIcon.style.display = 'none';
      this.pauseIcon.style.display = 'block';
      this.resetIdleTimer();
    }
  }

  skipSeconds(seconds) {
    if (isNaN(this.video.duration)) return;
    const newTime = Math.max(0, Math.min(this.video.currentTime + seconds, this.video.duration));
    this.video.currentTime = newTime;

    if (seconds > 0) {
      this.showSkipRipple(this.skipRight);
    } else {
      this.showSkipRipple(this.skipLeft);
    }
    this.resetIdleTimer();
  }

  showSkipRipple(element) {
    element.classList.add('show');
    clearTimeout(element.timer);
    element.timer = setTimeout(() => {
      element.classList.remove('show');
    }, 600);
  }

  showCenterFeedback(type) {
    if (type === 'play') {
      this.centerFeedbackIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>`;
    } else {
      this.centerFeedbackIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>`;
    }
    this.centerFeedback.classList.add('pulse');
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.centerFeedback.classList.remove('pulse');
    }, 450);
  }

  onTimeUpdate() {
    if (isNaN(this.video.duration) || this.isDraggingTimeline) return;

    const current = this.video.currentTime;
    const total = this.video.duration;
    const percent = (current / total) * 100;

    this.timelineProgress.style.width = `${percent}%`;
    this.updateTimeDisplay(current, total);

    // Save position periodically
    if (this.currentMovie && Math.floor(current) % 5 === 0) {
      localStorage.setItem(`kflix_pos_${this.currentMovie.id || this.currentMovie.filename}`, current);
    }
  }

  onProgressUpdate() {
    if (isNaN(this.video.duration)) return;
    const buffered = this.video.buffered;
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const total = this.video.duration;
      this.timelineBuffered.style.width = `${(bufferedEnd / total) * 100}%`;
    }
  }

  onLoadedMetadata() {
    this.updateTimeDisplay(this.video.currentTime, this.video.duration);
    this.onProgressUpdate();
  }

  onEnded() {
    this.playIcon.style.display = 'block';
    this.pauseIcon.style.display = 'none';
    this.showControls();
    if (this.currentMovie) {
      localStorage.removeItem(`kflix_pos_${this.currentMovie.id || this.currentMovie.filename}`);
    }
  }

  updateTimeDisplay(current, total) {
    if (isNaN(total)) {
      this.timeDisplay.textContent = '00:00 / 00:00';
      return;
    }
    this.timeDisplay.textContent = `${this.formatTime(current)} / ${this.formatTime(total)}`;
  }

  formatTime(seconds) {
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  // Timeline Interactions
  onTimelineHover(e) {
    const rect = this.timelineTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = pos / rect.width;
    const time = percent * (this.video.duration || 0);

    this.timelineTooltip.style.left = `${pos}px`;
    this.timelineTooltip.textContent = this.formatTime(time);
  }

  onTimelineMouseDown(e) {
    this.isDraggingTimeline = true;
    this.onTimelineDrag(e);
  }

  onTimelineDrag(e) {
    const rect = this.timelineTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = pos / rect.width;

    this.timelineProgress.style.width = `${percent * 100}%`;
    if (!isNaN(this.video.duration)) {
      this.video.currentTime = percent * this.video.duration;
    }
  }

  // Volume
  onVolumeChange(value) {
    const val = parseFloat(value);
    this.video.volume = val;
    this.video.muted = (val === 0);
    this.updateVolumeUI();
  }

  toggleMute() {
    if (this.video.muted || this.video.volume === 0) {
      this.video.muted = false;
      this.video.volume = this.lastVolume > 0 ? this.lastVolume : 0.8;
      this.volumeSlider.value = this.video.volume;
    } else {
      this.lastVolume = this.video.volume;
      this.video.muted = true;
      this.video.volume = 0;
      this.volumeSlider.value = 0;
    }
    this.updateVolumeUI();
  }

  updateVolumeUI() {
    if (this.video.muted || this.video.volume === 0) {
      this.iconVolumeHigh.style.display = 'none';
      this.iconVolumeMuted.style.display = 'block';
    } else {
      this.iconVolumeHigh.style.display = 'block';
      this.iconVolumeMuted.style.display = 'none';
    }
  }

  // Subtitles
  loadDefaultSubtitles() {
    // Remove existing tracks
    const existingTracks = this.video.querySelectorAll('track');
    existingTracks.forEach(t => t.remove());

    // Add English track
    const trackEn = document.createElement('track');
    trackEn.kind = 'subtitles';
    trackEn.label = 'English';
    trackEn.srclang = 'en';
    trackEn.src = '/subtitles/sample-en.vtt';
    trackEn.default = true;
    this.video.appendChild(trackEn);

    // Add Korean track
    const trackKo = document.createElement('track');
    trackKo.kind = 'subtitles';
    trackKo.label = '한국어';
    trackKo.srclang = 'ko';
    trackKo.src = '/subtitles/sample-ko.vtt';
    this.video.appendChild(trackKo);

    this.selectSubtitleTrack('en');
  }

  selectSubtitleTrack(lang) {
    for (let i = 0; i < this.video.textTracks.length; i++) {
      const track = this.video.textTracks[i];
      if (lang === 'off') {
        track.mode = 'hidden';
      } else if (track.language === lang || (lang === 'custom' && track.label === 'Custom')) {
        track.mode = 'showing';
      } else {
        track.mode = 'hidden';
      }
    }

    if (lang === 'off') {
      this.subtitlesBtn.classList.remove('active');
    } else {
      this.subtitlesBtn.classList.add('active');
    }
  }

  toggleSubtitles() {
    let hasActive = false;
    for (let i = 0; i < this.video.textTracks.length; i++) {
      if (this.video.textTracks[i].mode === 'showing') {
        hasActive = true;
        this.video.textTracks[i].mode = 'hidden';
      }
    }

    if (hasActive) {
      this.subtitlesBtn.classList.remove('active');
      this.updateSubPill('off');
    } else {
      if (this.video.textTracks.length > 0) {
        this.video.textTracks[0].mode = 'showing';
        this.subtitlesBtn.classList.add('active');
        this.updateSubPill(this.video.textTracks[0].language || 'en');
      }
    }
  }

  updateSubPill(lang) {
    document.querySelectorAll('.sub-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.sub === lang);
    });
  }

  onCustomSubtitleSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = `Custom (${file.name})`;
    track.srclang = 'custom';
    track.src = URL.createObjectURL(file);
    track.default = true;

    this.video.appendChild(track);

    setTimeout(() => {
      this.selectSubtitleTrack('custom');
      alert(`Loaded custom subtitle: ${file.name}`);
    }, 100);
  }

  // Playback Speed & Quality
  setPlaybackSpeed(speed) {
    this.video.playbackRate = speed;
  }

  setQuality(quality) {
    this.qualityBadge.textContent = quality.toUpperCase();
  }

  toggleSettingsModal() {
    this.settingsModal.classList.toggle('show');
  }

  // Fullscreen & PiP
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.playerView.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  togglePictureInPicture() {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (document.pictureInPictureEnabled) {
      this.video.requestPictureInPicture().catch(() => {});
    }
  }

  // Idle Timer
  resetIdleTimer() {
    this.showControls();
    clearTimeout(this.idleTimer);

    if (!this.video.paused) {
      this.idleTimer = setTimeout(() => {
        if (!this.settingsModal.classList.contains('show') && !this.isDraggingTimeline) {
          this.hideControls();
        }
      }, 2600);
    }
  }

  showControls() {
    this.playerOverlay.classList.remove('controls-hidden');
  }

  hideControls() {
    this.playerOverlay.classList.add('controls-hidden');
  }

  // Keyboard Shortcuts
  onKeyDown(e) {
    if (!this.playerView.classList.contains('active')) return;

    // Ignore if input is focused
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
      case 'j':
      case 'J':
        e.preventDefault();
        this.skipSeconds(-10);
        break;
      case 'ArrowRight':
      case 'l':
      case 'L':
        e.preventDefault();
        this.skipSeconds(10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.onVolumeChange(Math.min(1, this.video.volume + 0.1));
        this.volumeSlider.value = this.video.volume;
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.onVolumeChange(Math.max(0, this.video.volume - 0.1));
        this.volumeSlider.value = this.video.volume;
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        this.toggleFullscreen();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        this.toggleMute();
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        this.toggleSubtitles();
        break;
      case 'Escape':
        if (!document.fullscreenElement) {
          this.close();
        }
        break;
    }
  }
}

// Global player instance
window.kflixPlayer = new KFlixPlayer();
