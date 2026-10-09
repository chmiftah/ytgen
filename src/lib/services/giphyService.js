/**
 * Giphy Service – High Resilience Clip & Stock Video Search for Shorts Studio
 *
 * Features:
 * - Smart query candidate simplification (e.g. "detective thinking mystery" → "detective thinking", "detective")
 * - In-memory cache to prevent redundant API calls and protect rate limits
 * - Pexels 9:16 portrait video fallback when Giphy returns 0 results or is rate-limited (HTTP 429)
 * - Scene-indexed fallback rotation and offset so scenes NEVER get identical clips
 * - Support for user-preferred footage source ('auto', 'giphy', 'pexels')
 */

export const DEFAULT_GIPHY_KEY = '';

// ------------------------------------------------------------------
// In-Memory Search Cache (15 min TTL)
// ------------------------------------------------------------------
const searchCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key) {
	const entry = searchCache.get(key);
	if (!entry) return null;
	if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
		searchCache.delete(key);
		return null;
	}
	return entry.data;
}

function setCache(key, data) {
	if (searchCache.size > 200) {
		const firstKey = searchCache.keys().next().value;
		searchCache.delete(firstKey);
	}
	searchCache.set(key, { data, timestamp: Date.now() });
}

// Circuit breaker for Giphy 429 rate limit
let giphyRateLimitedUntil = 0;

// ------------------------------------------------------------------
// Theme Fallback Queries (Punchy 1-2 words that reliably exist on Giphy)
// ------------------------------------------------------------------
export const THEME_FALLBACK_QUERIES = {
	'dark-psychology': ['dark', 'smirk', 'shadow', 'conspiracy', 'hypnosis', 'manipulation', 'secret'],
	'fakta-unik': ['mind blown', 'shocked', 'science', 'space', 'discovery', 'eureka', 'galaxy'],
	'psikologi': ['thinking', 'brain', 'emotions', 'confused', 'meditation', 'stress', 'mind'],
	'stoikisme': ['calm', 'statue', 'meditation', 'philosophy', 'peace', 'warrior', 'stoic'],
	'misteri': ['mystery', 'detective', 'secret', 'investigation', 'noir', 'clue', 'shadow'],
	custom: ['shocked', 'thinking', 'wow', 'interesting', 'reaction', 'epic']
};

// ------------------------------------------------------------------
// Resolve best MP4 URL from Giphy images object
// ------------------------------------------------------------------
export function resolveMp4Url(images) {
	if (!images) return null;

	const candidates = [
		images?.original?.mp4,
		images?.looping?.mp4,
		images?.downsized_medium?.mp4,
		images?.downsized_small?.mp4,
		images?.preview?.mp4,
		images?.fixed_height?.mp4,
		images?.fixed_width?.mp4,
		images?.preview_gif?.url
	];

	return candidates.find((u) => u && u.trim().length > 0) || null;
}

// ------------------------------------------------------------------
// Resolve best preview thumbnail
// ------------------------------------------------------------------
export function resolvePreviewUrl(images) {
	if (!images) return null;
	return (
		images?.downsized_small?.mp4 ||
		images?.preview_gif?.url ||
		images?.fixed_height_small?.url ||
		images?.fixed_width_small?.url ||
		images?.original?.url ||
		null
	);
}

// ------------------------------------------------------------------
// Generate Query Candidates
// Multi-word AI queries (e.g. "dark psychology manipulation secret")
// are simplified to 1-2 core keywords that Giphy's tag search can match.
// ------------------------------------------------------------------
export function buildQueryCandidates(rawQuery) {
	if (!rawQuery || typeof rawQuery !== 'string') return ['reaction'];
	const clean = rawQuery.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
	if (!clean) return ['reaction'];

	const words = clean.split(' ').filter((w) => w.length > 1);
	if (words.length <= 1) return [clean];

	const stopWords = new Set([
		'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
		'is', 'are', 'was', 'were', 'and', 'or', 'so', 'it', 'reaction',
		'clip', 'video', 'footage', 'scene', 'face', 'background', 'aesthetic'
	]);
	const meaningful = words.filter((w) => !stopWords.has(w));
	const candidates = new Set();

	if (words.length === 2) {
		candidates.add(clean);
	} else if (words.length > 2) {
		if (meaningful.length >= 2) {
			candidates.add(meaningful.slice(0, 2).join(' '));
		}
		candidates.add(words.slice(0, 2).join(' '));
	}

	for (const w of meaningful) {
		candidates.add(w);
	}

	for (const w of words) {
		candidates.add(w);
	}

	return Array.from(candidates).slice(0, 4);
}

// ------------------------------------------------------------------
// Direct Giphy Search
// ------------------------------------------------------------------
export async function searchGiphy(query, apiKey, limit = 8, offset = 0) {
	const key = apiKey || DEFAULT_GIPHY_KEY;
	if (!key) {
		return { success: false, error: 'GIPHY_API_KEY tidak tersedia.', clips: [] };
	}

	if (Date.now() < giphyRateLimitedUntil) {
		return { success: false, error: 'Giphy API rate limit reached (429). Using alternative sources.', clips: [], rateLimited: true };
	}

	const cleanQuery = (query || 'reaction').trim().toLowerCase();
	const cacheKey = `giphy:${key.slice(-6)}:${cleanQuery}:${limit}:${offset}`;
	const cached = getCached(cacheKey);
	if (cached) return cached;

	const url = new URL('https://api.giphy.com/v1/gifs/search');
	url.searchParams.set('api_key', key);
	url.searchParams.set('q', cleanQuery);
	url.searchParams.set('limit', String(limit));
	url.searchParams.set('offset', String(offset));
	url.searchParams.set('rating', 'pg-13');
	url.searchParams.set('lang', 'en');

	try {
		const res = await fetch(url.toString());
		if (res.status === 429) {
			giphyRateLimitedUntil = Date.now() + 60_000;
			return { success: false, error: 'Giphy API rate limit reached (429).', clips: [], rateLimited: true };
		}
		if (!res.ok) {
			const errText = await res.text();
			return { success: false, error: `Giphy API error ${res.status}: ${errText.slice(0, 200)}`, clips: [] };
		}

		const data = await res.json();
		const gifs = data?.data || [];

		const clips = gifs
			.map((g) => {
				const mp4 = resolveMp4Url(g.images);
				if (!mp4) return null;
				return {
					id: g.id,
					title: g.title || cleanQuery,
					mp4Url: mp4,
					previewUrl: resolvePreviewUrl(g.images),
					thumbnailUrl: g.images?.fixed_height?.url || g.images?.downsized?.url || '',
					width: parseInt(g.images?.original?.width || '480'),
					height: parseInt(g.images?.original?.height || '270'),
					duration: parseFloat(g.images?.original?.mp4_size || '0') > 0 ? 3 : 3,
					source: 'giphy',
					giphyUrl: g.url
				};
			})
			.filter(Boolean);

		const result = {
			success: true,
			clips,
			total: data?.pagination?.total_count || clips.length,
			query: cleanQuery
		};

		if (clips.length > 0) {
			setCache(cacheKey, result);
		}

		return result;
	} catch (err) {
		return { success: false, error: err.message, clips: [] };
	}
}

// ------------------------------------------------------------------
// Pexels Portrait Video Search
// ------------------------------------------------------------------
export async function searchPexelsClips(query, pexelsKey, limit = 8, offset = 0) {
	if (!pexelsKey) return { success: false, clips: [] };

	const cleanQuery = (query || 'cinematic').trim();
	const page = Math.floor(offset / limit) + 1;
	const cacheKey = `pexels:${cleanQuery}:${limit}:${page}`;
	const cached = getCached(cacheKey);
	if (cached) return cached;

	try {
		const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(cleanQuery)}&orientation=portrait&per_page=${limit}&page=${page}`;
		const res = await fetch(url, {
			headers: { Authorization: pexelsKey.trim() }
		});

		if (!res.ok) {
			return { success: false, clips: [], error: `Pexels error ${res.status}` };
		}

		const data = await res.json();
		const videos = data.videos || [];

		const clips = videos
			.map((vid) => {
				const files = vid.video_files || [];
				// Prioritize portrait 9:16 files with HD/SD quality
				const portraitFile =
					files.find((f) => f.width < f.height && (f.quality === 'hd' || f.quality === 'sd')) ||
					files.find((f) => f.width < f.height) ||
					files.find((f) => f.quality === 'hd') ||
					files[0];

				if (!portraitFile?.link) return null;

				return {
					id: `pexels-${vid.id}`,
					title: `Pexels: ${cleanQuery} (${vid.duration}s)`,
					mp4Url: portraitFile.link,
					previewUrl: vid.image,
					thumbnailUrl: vid.image,
					width: vid.width,
					height: vid.height,
					duration: vid.duration || 5,
					source: 'pexels',
					pexelsUrl: vid.url
				};
			})
			.filter(Boolean);

		const result = {
			success: true,
			clips,
			total: data.total_results || clips.length,
			query: cleanQuery
		};

		if (clips.length > 0) {
			setCache(cacheKey, result);
		}

		return result;
	} catch (err) {
		return { success: false, clips: [], error: err.message };
	}
}

// ------------------------------------------------------------------
// High Resilience Universal Clip Search
// ------------------------------------------------------------------
export async function searchClipsWithFallback({
	query,
	theme = 'custom',
	giphyKey = '',
	pexelsKey = '',
	limit = 8,
	sceneIndex = 0,
	sourcePreference = 'auto' // 'auto' | 'giphy' | 'pexels'
}) {
	const candidates = buildQueryCandidates(query);
	const offset = (Math.max(0, sceneIndex) * 2) % 12;

	// 1. If user explicitly requests Pexels video
	if (sourcePreference === 'pexels' && pexelsKey) {
		for (const cand of candidates) {
			const res = await searchPexelsClips(cand, pexelsKey, limit, offset);
			if (res.success && res.clips.length > 0) {
				return { ...res, source: 'pexels', usedQuery: cand, originalQuery: query };
			}
		}
	}

	// 2. Search Giphy (if preferred or auto, and not currently rate limited)
	if ((sourcePreference === 'giphy' || sourcePreference === 'auto') && giphyKey && Date.now() >= giphyRateLimitedUntil) {
		for (const cand of candidates) {
			const res = await searchGiphy(cand, giphyKey, limit, offset);
			if (res.success && res.clips.length >= 2) {
				return { ...res, source: 'giphy', usedQuery: cand, originalQuery: query };
			}
			if (res.rateLimited) break; // Don't try other candidates if 429 triggered
		}
	}

	// 3. Fallback to Pexels video if Giphy failed / had 0 clips / was rate-limited
	if (pexelsKey) {
		for (const cand of candidates) {
			const res = await searchPexelsClips(cand, pexelsKey, limit, offset);
			if (res.success && res.clips.length > 0) {
				return {
					...res,
					source: 'pexels',
					usedQuery: cand,
					originalQuery: query,
					usedPexelsFallback: true
				};
			}
		}
	}

	// 4. Fallback to Theme Fallback Queries (Giphy or Pexels)
	// Rotate fallback list by sceneIndex so adjacent scenes get DIFFERENT queries!
	const rawFallbacks = THEME_FALLBACK_QUERIES[theme] || THEME_FALLBACK_QUERIES['custom'];
	const rotatedFallbacks = [
		...rawFallbacks.slice(sceneIndex % rawFallbacks.length),
		...rawFallbacks.slice(0, sceneIndex % rawFallbacks.length)
	];

	for (const fbQuery of rotatedFallbacks) {
		// Try Giphy if not rate-limited
		if (giphyKey && Date.now() >= giphyRateLimitedUntil) {
			const res = await searchGiphy(fbQuery, giphyKey, limit, offset);
			if (res.success && res.clips.length >= 1) {
				return { ...res, source: 'giphy', usedFallback: true, usedQuery: fbQuery, originalQuery: query };
			}
		}
		// Try Pexels
		if (pexelsKey) {
			const res = await searchPexelsClips(fbQuery, pexelsKey, limit, offset);
			if (res.success && res.clips.length >= 1) {
				return { ...res, source: 'pexels', usedFallback: true, usedQuery: fbQuery, originalQuery: query };
			}
		}
	}

	// 5. Ultimate fallback: popular reaction
	const ultimateFallbacks = ['mind blown', 'shocked', 'curiosity', 'dramatic'];
	const fallbackTerm = ultimateFallbacks[sceneIndex % ultimateFallbacks.length];
	if (pexelsKey) {
		const res = await searchPexelsClips(fallbackTerm, pexelsKey, limit, offset);
		if (res.success && res.clips.length > 0) {
			return { ...res, source: 'pexels', usedFallback: true, usedQuery: fallbackTerm, originalQuery: query };
		}
	}
	if (giphyKey) {
		const res = await searchGiphy(fallbackTerm, giphyKey, limit, offset);
		return { ...res, source: 'giphy', usedFallback: true, usedQuery: fallbackTerm, originalQuery: query };
	}

	return { success: false, clips: [], error: 'Tidak dapat menemukan klip yang cocok.', query };
}

// ------------------------------------------------------------------
// Backward Compatibility: searchGiphyWithFallback
// ------------------------------------------------------------------
export async function searchGiphyWithFallback(query, theme, apiKey, limit = 8, sceneIndex = 0) {
	return searchClipsWithFallback({
		query,
		theme,
		giphyKey: apiKey,
		limit,
		sceneIndex,
		sourcePreference: 'auto'
	});
}

// ------------------------------------------------------------------
// Auto-search for all scenes in a script
// ------------------------------------------------------------------
export async function resolveSceneFootage(scenes, theme, apiKey, pexelsKey = '') {
	const resolved = [];

	for (let i = 0; i < scenes.length; i++) {
		const scene = scenes[i];
		const giphyQuery = scene.giphyQuery || scene.visual_concept || 'reaction';
		const result = await searchClipsWithFallback({
			query: giphyQuery,
			theme,
			giphyKey: apiKey,
			pexelsKey,
			limit: 6,
			sceneIndex: i,
			sourcePreference: 'auto'
		});

		// Pick diverse clip per scene
		const pickIdx = result.clips.length > 0 ? i % result.clips.length : 0;
		resolved.push({
			...scene,
			giphyResults: result.clips,
			selectedClip: result.clips[pickIdx] || null,
			searchSuccess: result.success && result.clips.length > 0
		});
	}

	return resolved;
}
