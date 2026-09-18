// NovaFlix TMDB Movie Database & Live Discovery Service
// Powers searching across 1,000,000+ movies worldwide
// Inspired by Optimized-Brain/Cinecanvas & kweephyo-pmt/WeFlix_v2

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TMDBService = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TMDB_API_KEYS = [
    '4e44d9029b1270a757cddc766a1bcb63',
    'b0f24430e36873f6dd079450a80436d4',
    '2dca580c2a14b55200e784d157207b4d',
    '844dba0bfd8f3a4f3799f6130ef9e335'
  ];

  let currentKeyIndex = 0;
  const CACHE = new Map();
  const TMDB_IMAGE_BASE_POSTER = 'https://image.tmdb.org/t/p/w500';
  const TMDB_IMAGE_BASE_BACKDROP = 'https://image.tmdb.org/t/p/original';

  function getApiKey() {
    return TMDB_API_KEYS[currentKeyIndex % TMDB_API_KEYS.length];
  }

  function rotateApiKey() {
    currentKeyIndex = (currentKeyIndex + 1) % TMDB_API_KEYS.length;
    return getApiKey();
  }

  const GENRE_MAP = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };

  function normalizeTmdbMovie(item) {
    if (!item) return null;

    const id = String(item.id || '');
    const title = item.title || item.original_title || 'Untitled';
    const releaseYear = (item.release_date || '').split('-')[0] || '2024';
    const ratingScore = item.vote_average ? Number(item.vote_average).toFixed(1) : '8.2';
    const genres = (item.genre_ids && Array.isArray(item.genre_ids))
      ? item.genre_ids.map(gid => GENRE_MAP[gid]).filter(Boolean)
      : (item.genres ? item.genres.map(g => g.name || g) : ['Cinema']);

    const posterUrl = item.poster_path
      ? `${TMDB_IMAGE_BASE_POSTER}${item.poster_path}`
      : `/api/poster/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}.svg`;

    const backdropUrl = item.backdrop_path
      ? `${TMDB_IMAGE_BASE_BACKDROP}${item.backdrop_path}`
      : `/api/backdrop/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}.svg`;

    return {
      id: `tmdb-${id}`,
      tmdbId: id,
      slug: (title || 'movie').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: title,
      koreanTitle: item.original_title !== title ? item.original_title : title,
      originalTitle: item.original_title || title,
      year: releaseYear,
      releaseDate: item.release_date || releaseYear,
      rating: item.adult ? '18+' : (ratingScore >= 7.5 ? '15+' : '12+'),
      is18Plus: Boolean(item.adult),
      imdbRating: ratingScore,
      matchScore: `${Math.min(99, Math.round(Number(ratingScore) * 10 + 12))}% Match`,
      duration: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : '2h 10m',
      country: (item.origin_country && item.origin_country[0]) || (item.production_countries && item.production_countries[0]?.name) || 'Global Cinema',
      studio: (item.production_companies && item.production_companies[0]?.name) || 'NovaFlix Studios',
      resolution: '4K Ultra HD',
      audio: 'Dolby Atmos / 5.1 Surround',
      category: (genres[0] || 'Blockbusters').toLowerCase(),
      genres: genres.length > 0 ? genres : ['Blockbuster', 'Entertainment'],
      director: item.director || 'Acclaimed Director',
      cast: item.cast || ['All-Star Global Cast'],
      synopsis: item.overview || 'Experience this cinematic masterpiece in 4K streaming only on NovaFlix.',
      tagline: item.tagline || 'Now streaming exclusively on NovaFlix in 4K HDR.',
      posterUrl: posterUrl,
      backdropUrl: backdropUrl,
      isTmdb: true,
      streamingSources: {
        vidsrc: `https://vidsrc.to/embed/movie/${id}`,
        vidlink: `https://vidlink.pro/movie/${id}`,
        superembed: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
        twoembed: `https://www.2embed.cc/embed/${id}`
      }
    };
  }

  async function searchTmdb(query) {
    if (!query || query.trim() === '') return [];
    const cleanQuery = query.trim();
    const cacheKey = `search:${cleanQuery.toLowerCase()}`;
    if (CACHE.has(cacheKey)) {
      return CACHE.get(cacheKey);
    }

    let attempts = 0;
    while (attempts < TMDB_API_KEYS.length) {
      const key = getApiKey();
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${encodeURIComponent(cleanQuery)}&page=1&include_adult=false`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`TMDB error status: ${res.status}`);
        }
        const data = await res.json();
        const results = (data.results || []).map(normalizeTmdbMovie).filter(Boolean);
        CACHE.set(cacheKey, results);
        return results;
      } catch (err) {
        attempts++;
        rotateApiKey();
        console.warn(`[TMDBService] Search attempt ${attempts} failed for query "${cleanQuery}". Rotating key.`);
      }
    }

    return [];
  }

  async function getMovieDetails(tmdbId) {
    if (!tmdbId) return null;
    const cleanId = String(tmdbId).replace(/^tmdb-/, '');
    const cacheKey = `details:${cleanId}`;
    if (CACHE.has(cacheKey)) {
      return CACHE.get(cacheKey);
    }

    let attempts = 0;
    while (attempts < TMDB_API_KEYS.length) {
      const key = getApiKey();
      const url = `https://api.themoviedb.org/3/movie/${cleanId}?api_key=${key}&append_to_response=videos,credits`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`TMDB error status: ${res.status}`);
        const data = await res.json();

        const cast = (data.credits && data.credits.cast)
          ? data.credits.cast.slice(0, 8).map(c => c.name)
          : [];
        const castDetails = (data.credits && data.credits.cast)
          ? data.credits.cast.slice(0, 8).map(c => ({
              name: c.name,
              character: c.character || 'Supporting Role',
              avatar: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
            }))
          : [];

        const directorObj = data.credits && data.credits.crew
          ? data.credits.crew.find(c => c.job === 'Director')
          : null;

        const trailerObj = data.videos && data.videos.results
          ? data.videos.results.find(v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube')
          : null;

        const normalized = normalizeTmdbMovie(data);
        if (normalized) {
          normalized.cast = cast.length > 0 ? cast : normalized.cast;
          normalized.castDetails = castDetails;
          normalized.director = directorObj ? directorObj.name : normalized.director;
          if (trailerObj) {
            normalized.trailerKey = trailerObj.key;
            normalized.trailerUrl = `https://www.youtube.com/embed/${trailerObj.key}?autoplay=1&rel=0`;
          }
        }

        CACHE.set(cacheKey, normalized);
        return normalized;
      } catch (err) {
        attempts++;
        rotateApiKey();
      }
    }

    return null;
  }

  return {
    searchTmdb,
    getMovieDetails,
    normalizeTmdbMovie,
    TMDB_IMAGE_BASE_POSTER,
    TMDB_IMAGE_BASE_BACKDROP
  };
}));
