import { json } from '@sveltejs/kit';
import { getLocalCatalog, searchLocalFootage, registerLocalFootage } from '$lib/services/localFootageService.js';

export async function GET({ url }) {
	try {
		const query = url.searchParams.get('query');
		if (query && query.trim()) {
			const results = await searchLocalFootage(query.trim());
			return json({ success: true, videos: results, total: results.length });
		}

		const catalog = await getLocalCatalog();
		return json({ success: true, videos: catalog, total: catalog.length });
	} catch (err) {
		console.error('Error fetching local footage:', err);
		return json({ success: false, error: err.message, videos: [] }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { fileName, query, title, duration } = body;

		if (!fileName) {
			return json({ success: false, error: 'fileName is required' }, { status: 400 });
		}

		const entry = await registerLocalFootage({ fileName, query, title, duration });
		return json({ success: true, video: entry });
	} catch (err) {
		console.error('Error registering local footage:', err);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}
