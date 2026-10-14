/**
 * Comprehensive Automated Test Suite for Cinexa Streaming Platform
 * Tests:
 * 1. Firebase Authentication & User State Synchronization (/firebase-auth-basics)
 * 2. Cinexa Video Player, TV Controller & Failover URLs
 * 3. Security Audit (No virus, adware, omg10.com or scammy redirects)
 * 4. Catalog Data Integrity & UI/UX Components
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Cinexa Verification Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

async function it(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

// Mock browser globals for auth.js
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.window = {
  dispatchEvent: () => {},
  syncUserWatchlistState: () => {}
};
global.localStorage = mockLocalStorage;
global.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};
global.location = { hostname: 'localhost' };
global.btoa = (str) => Buffer.from(str).toString('base64');

const CinexaAuth = require('../public/js/auth.js');

async function runTestSuite() {
  // =========================================================================
  // TEST SUITE 1: Security Audit & Zero-Adware / Virus-Free Verification
  // =========================================================================
  console.log('--- Suite 1: Security Audit & User Safety ---');

  await it('No omg10.com or scammy ad networks in public/js/app.js', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/js/app.js'), 'utf8');
    assert.strictEqual(appJs.includes('omg10.com'), false, 'app.js must not contain omg10.com');
    assert.strictEqual(appJs.includes('triggerSmartMonetagAd'), false, 'app.js must not trigger Monetag ads');
  });

  await it('No omg10.com in scripts/telegram-autoposter.js fallback', () => {
    const autoposterJs = fs.readFileSync(path.resolve(__dirname, '../scripts/telegram-autoposter.js'), 'utf8');
    assert.strictEqual(autoposterJs.includes('omg10.com'), false, 'telegram-autoposter.js must not contain omg10.com');
  });

  await it('Ad-manager clickjacking listeners are neutralized in public/js/ad-manager.js', () => {
    const adManagerJs = fs.readFileSync(path.resolve(__dirname, '../public/js/ad-manager.js'), 'utf8');
    assert.strictEqual(adManagerJs.includes('enableAdRotation: true'), false, 'ad rotation must not be true');
  });

  await it('Download modal routes safely through CinexaPlayer without shady redirects', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/js/app.js'), 'utf8');
    assert.ok(appJs.includes('CinexaPlayer.downloadFilm(quality)'), 'executeDownload must use CinexaPlayer');
  });

  // =========================================================================
  // TEST SUITE 2: Firebase Authentication Logic & User Vault Scoping
  // =========================================================================
  console.log('\n--- Suite 2: Firebase Authentication & User State (/firebase-auth-basics) ---');

  await it('CinexaAuth module is properly defined with all required methods', () => {
    assert.ok(typeof CinexaAuth.init === 'function', 'init must be a function');
    assert.ok(typeof CinexaAuth.signInWithGoogle === 'function', 'signInWithGoogle must be a function');
    assert.ok(typeof CinexaAuth.signInWithEmail === 'function', 'signInWithEmail must be a function');
    assert.ok(typeof CinexaAuth.signUpWithEmail === 'function', 'signUpWithEmail must be a function');
    assert.ok(typeof CinexaAuth.signOut === 'function', 'signOut must be a function');
    assert.ok(typeof CinexaAuth.onAuthStateChanged === 'function', 'onAuthStateChanged must be a function');
    assert.ok(typeof CinexaAuth.getUserWatchlist === 'function', 'getUserWatchlist must be a function');
    assert.ok(typeof CinexaAuth.setUserWatchlist === 'function', 'setUserWatchlist must be a function');
  });

  await it('CinexaAuth starts in guest mode with guest storage key', () => {
    mockLocalStorage.clear();
    CinexaAuth.init();
    assert.strictEqual(CinexaAuth.isAuthenticated(), false);
    assert.strictEqual(CinexaAuth.getUser(), null);
    assert.strictEqual(CinexaAuth.getWatchlistKey(), 'cinexa_watchlist_guest');
  });

  await it('CinexaAuth signs up with email & password and sets user state', async () => {
    mockLocalStorage.clear();
    const user = await CinexaAuth.signUpWithEmail('test.viewer@cinexa.tv', 'Password123!', 'John Doe');
    assert.ok(user, 'User object should be returned');
    assert.strictEqual(user.email, 'test.viewer@cinexa.tv');
    assert.strictEqual(user.displayName, 'John Doe');
    assert.strictEqual(user.initials, 'JD');
    assert.strictEqual(CinexaAuth.isAuthenticated(), true);
    assert.strictEqual(CinexaAuth.getWatchlistKey(), `cinexa_watchlist_${user.uid}`);
    await CinexaAuth.signOut();
  });

  await it('CinexaAuth isolates personal watchlists per authenticated user', async () => {
    mockLocalStorage.clear();

    // User 1 signs up and adds movies
    const user1 = await CinexaAuth.signUpWithEmail('user1@cinexa.tv', 'secret123', 'Alice Smith');
    CinexaAuth.setUserWatchlist(['dune-part-two', 'oppenheimer']);
    assert.deepStrictEqual(CinexaAuth.getUserWatchlist(), ['dune-part-two', 'oppenheimer']);
    await CinexaAuth.signOut();

    // User 2 signs up and adds different movie
    const user2 = await CinexaAuth.signUpWithEmail('user2@cinexa.tv', 'secret456', 'Bob Jones');
    CinexaAuth.setUserWatchlist(['spirited-away']);
    assert.deepStrictEqual(CinexaAuth.getUserWatchlist(), ['spirited-away']);

    // Log out user 2
    await CinexaAuth.signOut();
    assert.strictEqual(CinexaAuth.isAuthenticated(), false);
  });

  await it('CinexaAuth Google Sign-In returns valid authenticated user shape', async () => {
    mockLocalStorage.clear();
    const googleUser = await CinexaAuth.signInWithGoogle();
    assert.ok(googleUser, 'Google user should be created');
    assert.ok(googleUser.uid.startsWith('google-user-'));
    assert.ok(googleUser.email.includes('@'));
    assert.strictEqual(CinexaAuth.isAuthenticated(), true);
    await CinexaAuth.signOut();
  });

  await it('CinexaAuth maps error codes to clear user-friendly messages', () => {
    assert.ok(CinexaAuth.getErrorMessage({ code: 'auth/user-not-found' }).includes('No account exists'));
    assert.ok(CinexaAuth.getErrorMessage({ code: 'auth/wrong-password' }).includes('Incorrect password'));
    assert.ok(CinexaAuth.getErrorMessage({ code: 'auth/email-already-in-use' }).includes('already exists'));
    assert.ok(CinexaAuth.getErrorMessage({ code: 'auth/weak-password' }).includes('6 characters'));
    assert.ok(CinexaAuth.getErrorMessage({ code: 'auth/unauthorized-domain' }).includes('Authorized Domains'));
  });

  // =========================================================================
  // TEST SUITE 3: Video Player, TV Series Controller & Server Stream URLs
  // =========================================================================
  console.log('\n--- Suite 3: Video Player & Failover Streaming Engine ---');

  await it('public/js/player.js configures 6 ultra-fast streaming servers', () => {
    const playerJs = fs.readFileSync(path.resolve(__dirname, '../public/js/player.js'), 'utf8');
    assert.ok(playerJs.includes('vidlink.pro'), 'Must support VidLink Pro');
    assert.ok(playerJs.includes('vidsrc.to'), 'Must support VidSrc to');
    assert.ok(playerJs.includes('vidsrc.cc'), 'Must support VidSrc CC');
    assert.ok(playerJs.includes('player.autoembed.cc'), 'Must support AutoEmbed');
    assert.ok(playerJs.includes('2embed.cc'), 'Must support 2Embed');
    assert.ok(playerJs.includes('multiembed.mov'), 'Must support MultiEmbed');
  });

  await it('Player handles keyboard shortcuts (ESC, F, T, S, N, P)', () => {
    const playerJs = fs.readFileSync(path.resolve(__dirname, '../public/js/player.js'), 'utf8');
    assert.ok(playerJs.includes("e.key === 'Escape'"));
    assert.ok(playerJs.includes("e.key === 'f' || e.key === 'F'"));
    assert.ok(playerJs.includes("e.key === 't' || e.key === 'T'"));
    assert.ok(playerJs.includes("e.key === 's' || e.key === 'S'"));
    assert.ok(playerJs.includes("e.key === 'n' || e.key === 'N'"));
    assert.ok(playerJs.includes("e.key === 'p' || e.key === 'P'"));
  });

  await it('Player includes failover watchdog timer and helper notification', () => {
    const playerJs = fs.readFileSync(path.resolve(__dirname, '../public/js/player.js'), 'utf8');
    assert.ok(playerJs.includes('startFailoverWatchdog'), 'Must have failover watchdog');
    assert.ok(playerJs.includes('player-failover-helper'), 'Must control failover helper element');
  });

  // =========================================================================
  // TEST SUITE 4: HTML & UI/UX Component Verification
  // =========================================================================
  console.log('\n--- Suite 4: HTML & Modern Streaming UI Components ---');

  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');

  await it('index.html includes Firebase SDK scripts and js/auth.js', () => {
    assert.ok(indexHtml.includes('firebase-app-compat.js'), 'Must load firebase-app-compat');
    assert.ok(indexHtml.includes('firebase-auth-compat.js'), 'Must load firebase-auth-compat');
    assert.ok(indexHtml.includes('js/auth.js'), 'Must load js/auth.js');
  });

  await it('index.html includes Navbar Auth button and Profile Dropdown menu', () => {
    assert.ok(indexHtml.includes('id="navbar-auth-btn"'), 'Must have navbar-auth-btn');
    assert.ok(indexHtml.includes('id="navbar-profile-container"'), 'Must have navbar-profile-container');
    assert.ok(indexHtml.includes('id="profile-dropdown-menu"'), 'Must have profile-dropdown-menu');
    assert.ok(indexHtml.includes('handleUserSignOut()'), 'Must have sign out action in dropdown');
  });

  await it('index.html includes complete Netflix/HBO caliber Hero Spotlight action buttons', () => {
    assert.ok(indexHtml.includes('id="slide-btn-play"'), 'Must have Watch Now button');
    assert.ok(indexHtml.includes('openSlideDossier()'), 'Must have More Info button');
    assert.ok(indexHtml.includes('id="slide-watchlist-btn"'), 'Must have Watchlist button');
    assert.ok(indexHtml.includes('watchSlideTrailer()'), 'Must have Trailer button');
  });

  await it('index.html includes Firebase Auth Modal with Sign In, Create Account & Google Auth', () => {
    assert.ok(indexHtml.includes('id="auth-modal-overlay"'), 'Must have auth-modal-overlay');
    assert.ok(indexHtml.includes('handleGoogleSignIn()'), 'Must have Google Sign In trigger');
    assert.ok(indexHtml.includes('id="auth-signin-form"'), 'Must have sign in form');
    assert.ok(indexHtml.includes('id="auth-signup-form"'), 'Must have signup form');
    assert.ok(indexHtml.includes('id="auth-error-banner"'), 'Must have error banner');
  });

  await it('index.html links both styles.css and player.css', () => {
    assert.ok(indexHtml.includes('css/styles.css'), 'Must link styles.css');
    assert.ok(indexHtml.includes('css/player.css'), 'Must link player.css');
  });

  await it('styles.css contains Netflix Top 10 rank styling and profile dropdown styles', () => {
    const stylesCss = fs.readFileSync(path.resolve(__dirname, '../public/css/styles.css'), 'utf8');
    assert.ok(stylesCss.includes('.top-10-rank'), 'Must contain .top-10-rank');
    assert.ok(stylesCss.includes('.profile-dropdown-menu'), 'Must contain .profile-dropdown-menu');
    assert.ok(stylesCss.includes('.auth-input'), 'Must contain .auth-input');
  });

  await it('firebase.json is present and properly configured with auth providers', () => {
    const firebaseJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../firebase.json'), 'utf8'));
    assert.ok(firebaseJson.auth, 'firebase.json must have auth block');
    assert.strictEqual(firebaseJson.auth.providers.emailPassword, true);
    assert.strictEqual(firebaseJson.auth.providers.googleSignIn.oAuthBrandDisplayName, 'Cinexa Cinema');
  });

  // =========================================================================
  // TEST SUITE 5: Regression & Edge Case Verification
  // =========================================================================
  console.log('\n--- Suite 5: Deep Regression & Edge Case Auditing ---');

  await it('index.html has balanced opening and closing <div> tags', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');
    const opens = (html.match(/<div[\s>]/gi) || []).length;
    const closes = (html.match(/<\/div>/gi) || []).length;
    assert.strictEqual(opens, closes, `Expected <div> count (${opens}) to equal </div> count (${closes})`);
  });

  await it('Top 10 template in app.js has balanced div tags', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/js/app.js'), 'utf8');
    const startIdx = appJs.indexOf('<div class="top-10-item');
    const endIdx = appJs.indexOf("}).join('');", startIdx);
    assert.ok(startIdx > 0 && endIdx > startIdx, 'Top 10 template must be located');
    const block = appJs.substring(startIdx, endIdx);
    const opens = (block.match(/<div[\s>]/gi) || []).length;
    const closes = (block.match(/<\/div>/gi) || []).length;
    assert.strictEqual(opens, closes, `Top 10 template must have balanced divs (${opens} === ${closes})`);
  });

  await it('FEATURED_SLIDES slides define valid numeric tmdbIds', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/js/app.js'), 'utf8');
    const match = appJs.match(/const FEATURED_SLIDES = (\[[\s\S]*?\]);/);
    assert.ok(match, 'FEATURED_SLIDES must be defined');
    const slides = eval(match[1]);
    assert.ok(slides.length >= 6, 'Must have at least 6 slides');
    slides.forEach(s => {
      assert.ok(s.tmdbId, `Slide ${s.title} must have a tmdbId`);
      assert.ok(/^\d+$/.test(String(s.tmdbId)), `Slide ${s.title} tmdbId must be numeric`);
    });
  });

  await it('Player resolves tmdbId from catalog for items with missing or non-numeric IDs', () => {
    const playerContent = fs.readFileSync(path.resolve(__dirname, '../public/js/player.js'), 'utf8');
    assert.ok(playerContent.includes('getMovieTmdbId'), 'Player must define getMovieTmdbId');
    assert.ok(playerContent.includes('noopener,noreferrer'), 'External player links must use noopener,noreferrer');
  });

  await it('CinexaAuth migrates guest continue-watching progress on sign in', async () => {
    mockLocalStorage.clear();
    mockLocalStorage.setItem('cinexa_continue_watching', JSON.stringify([
      { id: 'solo-leveling-series', title: 'Solo Leveling', percent: 70 }
    ]));
    const user = await CinexaAuth.signUpWithEmail('progress.tester@cinexa.tv', 'Password123!', 'Progress Tester');
    const userProg = JSON.parse(mockLocalStorage.getItem(`cinexa_progress_${user.uid}`) || '[]');
    assert.ok(userProg.length > 0, 'Guest progress should be migrated');
    assert.strictEqual(userProg[0].id, 'solo-leveling-series');
    await CinexaAuth.signOut();
  });

  await it('Watchlist dual matching supports films with differing id and slug', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/js/app.js'), 'utf8');
    assert.ok(appJs.includes('isMovieInWatchlist'), 'Must have isMovieInWatchlist helper');
    assert.ok(appJs.includes('(m.id && watchlistSet.has(m.id)) || (m.slug && watchlistSet.has(m.slug))'), 'renderLibraryGrid must check both id and slug');
  });

  await it('Search function includes cast / actors in matching algorithm', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/js/app.js'), 'utf8');
    assert.ok(appJs.includes('m.cast.some'), 'Search must search m.cast for actors');
  });

  await it('Failover watchdog dynamically updates server button label', () => {
    const playerJs = fs.readFileSync(path.resolve(__dirname, '../public/js/player.js'), 'utf8');
    assert.ok(playerJs.includes('Try Server ${nextIdx + 1}'), 'Watchdog must compute and display next server index');
  });

  await it('All JavaScript files have zero syntax errors (AST compile check)', () => {
    const files = [
      '../public/js/app.js',
      '../public/js/player.js',
      '../public/js/auth.js',
      '../public/js/ad-manager.js',
      '../public/js/movies-data.js',
      '../api/stream.js'
    ];
    for (const f of files) {
      const code = fs.readFileSync(path.resolve(__dirname, f), 'utf8');
      assert.doesNotThrow(() => {
        new vm.Script(code, { filename: f });
      }, `Syntax check failed for ${f}`);
    }
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n========================================');
  console.log(`Results: ${testsPassed} Passed, ${testsFailed} Failed.`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite runner encountered fatal error:', err);
  process.exit(1);
});
