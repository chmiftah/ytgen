import fs from 'fs';
import path from 'path';

/**
 * Stickman Service
 * Scans static/stickman directory and matches images to script visual queries.
 */
export function getStickmanAssets() {
	if (typeof window !== 'undefined') return [];
	try {
		const dir = path.resolve('./static/stickman');
		if (!fs.existsSync(dir)) return [];
		const files = fs.readdirSync(dir);
		return files
			.filter(f => /\.(jpeg|jpg|png|webp)$/i.test(f))
			.map((file, idx) => {
				let keywordRaw = '';
				const m = file.match(/_Stickman_(.+?)_\d{14}\./i);
				if (m) keywordRaw = m[1];
				else {
					keywordRaw = file.replace(/^\d+_.*?_Stickman_/i, '').replace(/_\d{14}\.[^.]+$/, '');
				}
				const cleanName = keywordRaw.replace(/[_-]+/g, ' ').toLowerCase().trim();
				const slug = keywordRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
				const keywords = cleanName.split(/\s+/).filter(w => w.length > 2);
				return {
					id: `stickman-${idx}`,
					fileName: file,
					url: `/stickman/${file}`,
					title: cleanName || `Illustration ${idx + 1}`,
					slug: slug || `asset-${idx}`,
					keywords,
					layoutSide: idx % 2 === 0 ? 'left' : 'right'
				};
			});
	} catch (err) {
		console.warn('Failed to scan static/stickman:', err);
		return [];
	}
}

/**
 * Find best matching stickman asset for a visual query
 */
export function findMatchingStickman(query) {
	const assets = getStickmanAssets();
	if (assets.length === 0) return { url: '', title: 'Default', layoutSide: 'left' };

	const qWords = (query || '').toLowerCase().split(/\s+/);
	
	let bestMatch = assets[0];
	let highestScore = -1;

	for (const asset of assets) {
		let score = 0;
		for (const kw of asset.keywords) {
			if (qWords.some(qw => qw.includes(kw) || kw.includes(qw))) {
				score += 2;
			}
		}
		if (score > highestScore) {
			highestScore = score;
			bestMatch = asset;
		}
	}

	return bestMatch;
}
