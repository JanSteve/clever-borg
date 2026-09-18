/**
 * NovaFlix Monetization, Ad Rotation & Viral Traffic Growth Engine
 * Inspired by Cineby (https://cineby.my/) and Modern Streaming Monetization
 * Features:
 * - Smart Ad Network Rotator (Monetag, Adsterra, Google Ads, Affiliate)
 * - Anti-Intrusion Cooldown (First-click friendly, 15s interval)
 * - Push Notification Opt-in Prompt (Drives recurring traffic)
 * - Viral Social Share Generator (WhatsApp, Telegram, Twitter/X, Reddit)
 * - TikTok / Instagram Reels Viral Clip Hook Generator
 */

(function () {
  'use strict';

  // 1. Configurable Monetization Settings
  const AD_CONFIG = {
    // Set to true to enable background ad rotation (like cineby.my)
    enableAdRotation: true,
    cooldownMs: 15000, // 15 seconds between pop/network actions
    firstClickArmed: false, // First click is safe for user
    lastFiredTime: 0,
    currentNetworkIndex: 0,
    
    // Configurable Ad Network Scripts / Fallbacks
    networks: [
      {
        name: 'Adsterra Native / Direct',
        type: 'banner',
        action: function() {
          console.log('[AdManager] Adsterra direct impression armed');
        }
      },
      {
        name: 'Monetag Smart Zone',
        type: 'smart',
        action: function() {
          console.log('[AdManager] Monetag smart impression armed');
        }
      },
      {
        name: 'VPN Affiliate High-CPM',
        type: 'affiliate',
        action: function() {
          console.log('[AdManager] Affiliate impression recorded');
        }
      }
    ]
  };

  // 2. Smart Click Rotation (Cineby style with cooldown)
  let hasFirstClicked = false;
  document.addEventListener('click', (e) => {
    // Do not trigger ads on player back button or critical navigation
    if (e.target.closest('#player-back-btn') || e.target.closest('.search-box') || e.target.closest('#ad-sticky-close')) {
      return;
    }

    if (!hasFirstClicked) {
      hasFirstClicked = true;
      console.log('[NovaFlix Ads] First click passed. Monetization system armed.');
      return;
    }

    const now = Date.now();
    if (now - AD_CONFIG.lastFiredTime < AD_CONFIG.cooldownMs) {
      return;
    }

    AD_CONFIG.lastFiredTime = now;
    const currentNet = AD_CONFIG.networks[AD_CONFIG.currentNetworkIndex];
    if (currentNet && typeof currentNet.action === 'function') {
      currentNet.action();
    }
    AD_CONFIG.currentNetworkIndex = (AD_CONFIG.currentNetworkIndex + 1) % AD_CONFIG.networks.length;
  });

  // 3. Push Notification Opt-in Banner (Huge recurring traffic driver for streaming sites)
  function initPushOptIn() {
    const isDismissed = localStorage.getItem('novaflix_push_dismissed');
    if (isDismissed) return;

    setTimeout(() => {
      if (document.getElementById('novaflix-push-modal')) return;

      const pushModal = document.createElement('div');
      pushModal.id = 'novaflix-push-modal';
      pushModal.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 360px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(6, 182, 212, 0.4);
        border-radius: 12px;
        padding: 16px 20px;
        z-index: 99999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(6, 182, 212, 0.2);
        animation: slideInRight 0.4s ease;
      `;

      pushModal.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="font-size: 24px; background: rgba(6, 182, 212, 0.15); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.3);">🔔</div>
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 4px;">Get New 4K Movie Releases</div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">Receive instant alerts when new Hollywood blockbusters, Anime, and 4K movies drop on NovaFlix.</div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button id="btn-push-allow" style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 800; cursor: pointer;">Enable Alerts</button>
              <button id="btn-push-later" style="background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">Later</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(pushModal);

      document.getElementById('btn-push-allow').addEventListener('click', () => {
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            console.log('[NovaFlix] Notification permission:', permission);
          });
        }
        pushModal.remove();
        localStorage.setItem('novaflix_push_dismissed', 'true');
      });

      document.getElementById('btn-push-later').addEventListener('click', () => {
        pushModal.remove();
        localStorage.setItem('novaflix_push_dismissed', 'true');
      });
    }, 4000);
  }

  // 4. Viral Social Share Modal
  function openShareModal(movie) {
    if (!movie) return;
    const title = encodeURIComponent(movie.title || 'Movie');
    const pageUrl = encodeURIComponent(window.location.origin + '/#movie/' + (movie.slug || movie.id));
    const shareText = encodeURIComponent(`🍿 Watch "${movie.title}" in 4K Ultra HD for free on NovaFlix! No sign-up required:`);

    let modal = document.getElementById('novaflix-share-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'novaflix-share-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: #11141f; border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 16px; padding: 24px; max-width: 440px; width: 90%; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="color: #fff; font-size: 18px; font-weight: 800;">Share &bull; ${movie.title}</h3>
          <button id="btn-close-share" style="background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Share this title with your friends to stream instantly in 4K with Dolby Atmos audio.</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          <a href="https://api.whatsapp.com/send?text=${shareText}%20${pageUrl}" target="_blank" rel="noopener noreferrer" style="background: #25D366; color: #fff; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 12px; font-weight: 700;">WhatsApp</a>
          <a href="https://t.me/share/url?url=${pageUrl}&text=${shareText}" target="_blank" rel="noopener noreferrer" style="background: #0088cc; color: #fff; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 12px; font-weight: 700;">Telegram</a>
          <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}" target="_blank" rel="noopener noreferrer" style="background: #1DA1F2; color: #fff; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 12px; font-weight: 700;">Twitter/X</a>
          <a href="https://www.reddit.com/submit?url=${pageUrl}&title=${shareText}" target="_blank" rel="noopener noreferrer" style="background: #FF4500; color: #fff; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 12px; font-weight: 700;">Reddit</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" rel="noopener noreferrer" style="background: #1877F2; color: #fff; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 12px; font-weight: 700;">Facebook</a>
          <button id="btn-copy-direct-link" style="background: #334155; color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700;">Copy Link</button>
        </div>

        <!-- Viral TikTok / Reels Hook Tool -->
        <div style="background: rgba(6, 182, 212, 0.08); border: 1px dashed rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 12px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: #06b6d4; margin-bottom: 4px;">🎬 TIKTOK / REELS VIRAL MARKETING CAPTION:</div>
          <div style="font-size: 12px; color: #e2e8f0; font-family: monospace; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 6px; user-select: all;" id="viral-caption-box">
"If you loved ${movie.title}, you need to watch this scene 😱 Full movie streaming free in 4K on NovaFlix (Link in bio)! 🍿 #movies #${movie.title.toLowerCase().replace(/[^a-z0-9]/g, '')} #freetowatch #movierecommendation"
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('btn-close-share').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    document.getElementById('btn-copy-direct-link').addEventListener('click', (e) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(decodeURIComponent(pageUrl));
        e.target.textContent = 'Copied!';
        setTimeout(() => e.target.textContent = 'Copy Link', 2000);
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Expose globally
  window.NovaFlixAds = {
    initPushOptIn,
    openShareModal
  };

  // Auto initialize push after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPushOptIn);
  } else {
    initPushOptIn();
  }
})();
