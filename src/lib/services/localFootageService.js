import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const FOOTAGE_DIR = path.resolve('./static/footage');
const CATALOG_PATH = path.join(FOOTAGE_DIR, 'catalog.json');
const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

/**
 * Ensure static/footage directory exists
 */
export async function ensureFootageDir() {
	await fs.promises.mkdir(FOOTAGE_DIR, { recursive: true });
}

/**
 * Clean text into URL and file-safe slug
 */
export function slugify(text) {
	if (!text) return 'footage';
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.slice(0, 50);
}

/**
 * Generate a descriptive, general filename (e.g. technology-artificial-intelligence-1.mp4)
 */
export function generateGeneralFileName(query, existingFileNames = []) {
	const baseSlug = slugify(query) || 'cinematic-clip';
	let counter = 1;
	let candidate = `${baseSlug}-${counter}.mp4`;

	while (existingFileNames.includes(candidate)) {
		counter++;
		candidate = `${baseSlug}-${counter}.mp4`;
	}

	return candidate;
}

/**
 * Extract a thumbnail frame from video using FFmpeg
 */
export function extractThumbnail(videoPath, thumbPath) {
	return new Promise((resolve) => {
		const proc = spawn(ffmpegPath, [
			'-ss', '00:00:01',
			'-i', videoPath,
			'-vframes', '1',
			'-vf', 'scale=640:-1',
			'-q:v', '3',
			'-y', thumbPath
		]);
		proc.on('close', (code) => {
			resolve(code === 0);
		});
		proc.on('error', () => resolve(false));
	});
}

/**
 * Read the local footage catalog
 */
export async function getLocalCatalog() {
	await ensureFootageDir();
	if (fs.existsSync(CATALOG_PATH)) {
		try {
			const data = await fs.promises.readFile(CATALOG_PATH, 'utf-8');
			return JSON.parse(data);
		} catch (err) {
			console.warn('Failed to parse catalog.json, recreating:', err.message);
		}
	}

	// Auto-discover any .mp4 files already in static/footage
	try {
		const files = await fs.promises.readdir(FOOTAGE_DIR);
		const mp4Files = files.filter((f) => f.endsWith('.mp4'));
		const discovered = [];

		for (const file of mp4Files) {
			const baseName = file.replace(/\.mp4$/, '');
			const words = baseName.split('-').filter(Boolean);
			const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
			const thumbName = `${baseName}.jpg`;
			const hasThumb = fs.existsSync(path.join(FOOTAGE_DIR, thumbName));

			discovered.push({
				id: `local-${baseName}`,
				title: title,
				fileName: file,
				videoUrl: `/footage/${file}`,
				thumbnail: hasThumb ? `/footage/${thumbName}` : '',
				query: words.join(' '),
				tags: words,
				duration: 15,
				source: 'local'
			});
		}

		await fs.promises.writeFile(CATALOG_PATH, JSON.stringify(discovered, null, 2));
		return discovered;
	} catch (err) {
		console.warn('Error reading footage dir:', err);
		return [];
	}
}

/**
 * Save updated catalog to disk
 */
export async function saveLocalCatalog(items) {
	await ensureFootageDir();
	await fs.promises.writeFile(CATALOG_PATH, JSON.stringify(items, null, 2));
}

/**
 * Search local footage catalog by query
 * Scores based on exact words, category, and tag matching
 */
export async function searchLocalFootage(query, limit = 12) {
	const catalog = await getLocalCatalog();
	if (!catalog || catalog.length === 0) return [];
	if (!query || !query.trim()) return catalog.slice(0, limit);

	const qLower = query.toLowerCase().trim();
	const queryWords = qLower.split(/\s+/).filter((w) => w.length > 2);

	const scored = catalog.map((item) => {
		let score = 0;
		const titleLower = (item.title || '').toLowerCase();
		const queryLower = (item.query || '').toLowerCase();
		const tags = (item.tags || []).map((t) => t.toLowerCase());

		for (const word of queryWords) {
			if (titleLower.includes(word)) score += 6;
			if (queryLower.includes(word)) score += 5;
			for (const tag of tags) {
				if (tag === word) score += 5;
				else if (tag.includes(word) || word.includes(tag)) score += 3;
			}
		}

		return { ...item, score };
	});

	// Only return clips with positive score or fallback to newest local clips
	const matching = scored
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score);

	return matching.slice(0, limit);
}

/**
 * Register a newly saved video into the local catalog
 */
export async function registerLocalFootage({ fileName, query, title, duration = 15 }) {
	const catalog = await getLocalCatalog();
	const baseName = fileName.replace(/\.mp4$/, '');
	const videoPath = path.join(FOOTAGE_DIR, fileName);
	const thumbFileName = `${baseName}.jpg`;
	const thumbPath = path.join(FOOTAGE_DIR, thumbFileName);

	// Generate thumbnail if missing
	if (!fs.existsSync(thumbPath) && fs.existsSync(videoPath)) {
		await extractThumbnail(videoPath, thumbPath);
	}

	const hasThumb = fs.existsSync(thumbPath);
	const cleanWords = (query || title || baseName).toLowerCase().split(/[\s-]+/).filter(Boolean);

	const newEntry = {
		id: `local-${baseName}`,
		title: title || cleanWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
		fileName: fileName,
		videoUrl: `/footage/${fileName}`,
		thumbnail: hasThumb ? `/footage/${thumbFileName}` : '',
		query: query || cleanWords.join(' '),
		tags: Array.from(new Set(cleanWords)),
		duration: Number(duration) || 15,
		source: 'local',
		createdAt: new Date().toISOString()
	};

	// Remove existing entry if re-registering
	const filtered = catalog.filter((c) => c.fileName !== fileName);
	filtered.unshift(newEntry);

	await saveLocalCatalog(filtered);
	return newEntry;
}
