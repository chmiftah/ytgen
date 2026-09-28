/**
 * Giphy Service – Giphy API Integration for YouTube Shorts Generator
 *
 * Features:
 * - Search GIF clips by query, returns direct MP4 URLs
 * - Theme-based fallback queries
 * - Multiple resolution prioritization for performance
 * - Clips API support (Giphy Clips for native video)
 */

// Default public Giphy API key (free tier, limited)
export const DEFAULT_GIPHY_KEY = '';

// ------------------------------------------------------------------
// Theme Fallback Queries
// ------------------------------------------------------------------
export const THEME_FALLBACK_QUERIES = {
	'dark-psychology': ['dark thinking', 'evil smirk', 'mind manipulation', 'psychological thriller'],
	'fakta-unik': ['mind blown', 'wow amazing fact', 'scientist discovery', 'shocked reaction'],
	'psikologi': ['thinking brain', 'emotions feelings', 'human behavior', 'anxiety stress'],
	'stoikisme': ['calm meditation', 'thinking philosophy', 'inner peace', 'stoic wisdom'],
	'misteri': ['mystery detective', 'unsolved mystery', 'conspiracy thinking', 'detective magnify'],
	custom: ['reaction wow', 'thinking person', 'interesting fact', 'eye opening']
};

// ------------------------------------------------------------------
// Resolve best MP4 URL from Giphy images object
// ------------------------------------------------------------------
export function resolveMp4Url(images) {
	if (!images) return null;

	// Priority chain: highest quality → smallest acceptable
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
// Main: Search Giphy GIFs by query
// ------------------------------------------------------------------
export async function searchGiphy(query, apiKey, limit = 8, offset = 0) {
	const key = apiKey || DEFAULT_GIPHY_KEY;
	if (!key) {
		return { success: false, error: 'GIPHY_API_KEY tidak tersedia.', clips: [] };
	}

	const cleanQuery = (query || 'reaction').trim().toLowerCase();
	const url = new URL('https://api.giphy.com/v1/gifs/search');
	url.searchParams.set('api_key', key);
	url.searchParams.set('q', cleanQuery);
	url.searchParams.set('limit', String(limit));
	url.searchParams.set('offset', String(offset));
	url.searchParams.set('rating', 'pg-13');
	url.searchParams.set('lang', 'en');

	try {
		const res = await fetch(url.toString());
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

		return {
			success: true,
			clips,
			total: data?.pagination?.total_count || clips.length,
			query: cleanQuery
		};
	} catch (err) {
		return { success: false, error: err.message, clips: [] };
	}
}

// ------------------------------------------------------------------
// Search with automatic fallback to theme default queries
// ------------------------------------------------------------------
export async function searchGiphyWithFallback(query, theme, apiKey, limit = 8) {
	// Try primary query first
	const result = await searchGiphy(query, apiKey, limit);
	if (result.success && result.clips.length >= 2) return result;

	// Fallback to theme-based queries
	const fallbacks = THEME_FALLBACK_QUERIES[theme] || THEME_FALLBACK_QUERIES['custom'];
	for (const fallbackQuery of fallbacks) {
		const fallbackResult = await searchGiphy(fallbackQuery, apiKey, limit);
		if (fallbackResult.success && fallbackResult.clips.length >= 1) {
			return { ...fallbackResult, usedFallback: true, originalQuery: query };
		}
	}

	// Last resort: generic reactions
	const last = await searchGiphy('wow reaction', apiKey, limit);
	return { ...last, usedFallback: true, originalQuery: query };
}

// ------------------------------------------------------------------
// Auto-search for all scenes in a script
// ------------------------------------------------------------------
export async function resolveSceneFootage(scenes, theme, apiKey) {
	const resolved = [];

	for (const scene of scenes) {
		const giphyQuery = scene.giphyQuery || scene.visual_concept || 'reaction';
		const result = await searchGiphyWithFallback(giphyQuery, theme, apiKey, 6);

		resolved.push({
			...scene,
			giphyResults: result.clips,
			selectedClip: result.clips[0] || null,
			searchSuccess: result.success && result.clips.length > 0
		});
	}

	return resolved;
}
