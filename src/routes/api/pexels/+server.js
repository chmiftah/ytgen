import { json } from '@sveltejs/kit';
import { STOCK_COLLECTION } from '$lib/services/stockLibrary.js';

export async function POST({ request }) {
	try {
		const { query, apiKey, page = 1 } = await request.json();
		const cleanQuery = (query || 'nature cinematic 4k').trim();

		// If user provided a Pexels API Key, make actual request to Pexels API
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
						const mappedVideos = data.videos.map((vid) => {
							// Find best 1080p or 720p landscape file
							const files = vid.video_files || [];
							const hdFile = files.find(f => f.quality === 'hd' && f.width >= 1280) 
								|| files.find(f => f.quality === 'sd') 
								|| files[0];

							return {
								id: `pexels-${vid.id}`,
								title: `Pexels: ${cleanQuery} (${vid.duration}s)`,
								thumbnail: vid.image,
								videoUrl: hdFile ? hdFile.link : '',
								duration: vid.duration || 15,
								width: vid.width,
								height: vid.height,
								author: vid.user ? vid.user.name : 'Pexels Creator',
								source: 'pexels'
							};
						}).filter(v => Boolean(v.videoUrl));

						if (mappedVideos.length > 0) {
							return json({ success: true, videos: mappedVideos, source: 'pexels' });
						}
					}
				}
			} catch (err) {
				console.warn('Pexels API fetch failed, falling back to curated stock:', err);
			}
		}

		// Fallback to internal curated stock library
		const qLower = cleanQuery.toLowerCase();
		const words = qLower.split(/\s+/).filter(w => w.length > 2);

		const scoredClips = STOCK_COLLECTION.map(item => {
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
			videos: scoredClips,
			source: 'curated-stock',
			message: apiKey ? 'Pexels API fallback used' : 'Using curated stock library'
		});
	} catch (error) {
		console.error('Error in /api/pexels:', error);
		return json({ success: false, error: error.message, videos: STOCK_COLLECTION });
	}
}
