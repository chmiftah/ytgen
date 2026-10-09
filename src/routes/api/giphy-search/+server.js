import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { searchClipsWithFallback } from '$lib/services/giphyService.js';

const DEFAULT_GIPHY_KEY = env.GIPHY_API_KEY || '';
const DEFAULT_PEXELS_KEY = env.PEXELS_API_KEY || '';

export async function POST({ request }) {
	try {
		const {
			query,
			theme = 'custom',
			limit = 8,
			offset = 0,
			apiKey,
			sceneIndex = 0,
			footageSource = 'auto',
			orientation = 'portrait',
			aspectRatio = '9:16'
		} = await request.json();

		if (!query || !query.trim()) {
			return json({ success: false, error: 'Query tidak boleh kosong.' }, { status: 400 });
		}

		const effectiveGiphyKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : DEFAULT_GIPHY_KEY;

		if (!effectiveGiphyKey && !DEFAULT_PEXELS_KEY) {
			return json(
				{ success: false, error: 'GIPHY_API_KEY atau PEXELS_API_KEY belum diatur di file .env.' },
				{ status: 400 }
			);
		}

		const result = await searchClipsWithFallback({
			query: query.trim(),
			theme,
			giphyKey: effectiveGiphyKey,
			pexelsKey: DEFAULT_PEXELS_KEY,
			limit: Number(limit) || 8,
			sceneIndex: Number(sceneIndex) || 0,
			sourcePreference: footageSource,
			orientation: orientation || (aspectRatio === '16:9' ? 'landscape' : (aspectRatio === '1:1' ? 'square' : 'portrait')),
			aspectRatio
		});

		return json(result);
	} catch (err) {
		console.error('[giphy-search] Error:', err);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}
