import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { searchGiphyWithFallback } from '$lib/services/giphyService.js';

const DEFAULT_GIPHY_KEY = env.GIPHY_API_KEY || '';

export async function POST({ request }) {
	try {
		const { query, theme = 'custom', limit = 8, offset = 0, apiKey } = await request.json();

		if (!query || !query.trim()) {
			return json({ success: false, error: 'Query tidak boleh kosong.' }, { status: 400 });
		}

		const effectiveKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : DEFAULT_GIPHY_KEY;
		if (!effectiveKey) {
			return json(
				{ success: false, error: 'GIPHY API Key belum diatur. Tambahkan GIPHY_API_KEY di file .env atau Settings.' },
				{ status: 400 }
			);
		}

		const result = await searchGiphyWithFallback(query.trim(), theme, effectiveKey, Number(limit));

		return json(result);
	} catch (err) {
		console.error('[giphy-search] Error:', err);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}
