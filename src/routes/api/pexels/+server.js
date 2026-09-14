import { json } from '@sveltejs/kit';
import { STOCK_COLLECTION } from '$lib/services/stockLibrary.js';
import { searchLocalFootage, getLocalCatalog } from '$lib/services/localFootageService.js';

export async function POST({ request }) {
	try {
		const { query, apiKey, page = 1, preferLocal = true } = await request.json();
		const cleanQuery = (query || 'nature cinematic 4k').trim();

		// 1. FIRST: Check local footage library (Offline First)
		let localMatches = [];
		try {
			localMatches = await searchLocalFootage(cleanQuery, 12);
		} catch (locErr) {
			console.warn('Local footage search error:', locErr.message);
		}

		// If user only wants local, or if good local matches are found and no API key
		if (localMatches.length >= 2 && !apiKey) {
			return json({
				success: true,
				videos: localMatches,
				source: 'local',
				message: `Ditemukan ${localMatches.length} video dari koleksi lokal Anda.`
			});
		}

		// 2. Fetch Pexels API if API Key provided
		let pexelsVideos = [];
		if (apiKey && apiKey.trim().length > 10) {
			try {
				const pexelsRes = await fetch(
					`https://api.pexels.com/videos/search?query=${encodeURIComponent(cleanQuery)}&orientation=landscape&per_page=12&page=${page}`,
					{
						headers: {
							Authorization: apiKey.trim()
						}
					}
				);

				if (pexelsRes.ok) {
					const data = await pexelsRes.json();
					if (data.videos && data.videos.length > 0) {
						pexelsVideos = data.videos
							.map((vid) => {
								const files = vid.video_files || [];
								const hdFile =
									files.find((f) => f.quality === 'hd' && f.width >= 1280) ||
									files.find((f) => f.quality === 'sd') ||
									files[0];

								return {
									id: `pexels-${vid.id}`,
									title: `Pexels: ${cleanQuery} (${vid.duration}s)`,
									thumbnail: vid.image,
									videoUrl: hdFile ? hdFile.link : '',
									duration: vid.duration || 15,
									width: vid.width,
									height: vid.height,
									author: vid.user ? vid.user.name : 'Pexels Creator',
									source: 'pexels',
									queryHint: cleanQuery
								};
							})
							.filter((v) => Boolean(v.videoUrl));
					}
				}
			} catch (err) {
				console.warn('Pexels API fetch failed, falling back to local/curated stock:', err);
			}
		}

		// Combine results: Local matches first, then Pexels videos
		const combined = [...localMatches, ...pexelsVideos];
		if (combined.length > 0) {
			return json({
				success: true,
				videos: combined,
				source: localMatches.length > 0 ? 'mixed' : 'pexels'
			});
		}

		// 3. Fallback to internal curated stock library
		const qLower = cleanQuery.toLowerCase();
		const words = qLower.split(/\s+/).filter((w) => w.length > 2);

		const scoredClips = STOCK_COLLECTION.map((item) => {
			let score = 0;
			for (const word of words) {
				if (item.category.includes(word)) score += 5;
				for (const tag of item.tags) {
					if (tag.includes(word) || word.includes(tag)) score += 3;
				}
				if (item.title.toLowerCase().includes(word)) score += 2;
			}
			return { ...item, score };
		}).sort((a, b) => b.score - a.score);

		return json({
			success: true,
			videos: [...localMatches, ...scoredClips],
			source: 'curated-stock',
			message: apiKey ? 'Pexels API fallback used' : 'Using curated stock library'
		});
	} catch (error) {
		console.error('Error in /api/pexels:', error);
		return json({ success: false, error: error.message, videos: STOCK_COLLECTION });
	}
}

