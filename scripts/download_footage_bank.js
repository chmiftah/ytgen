import fs from 'fs';
import path from 'path';
import { spawn, execFile } from 'child_process';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = util.promisify(execFile);
const FOOTAGE_DIR = path.resolve('./static/footage');
const CATALOG_PATH = path.join(FOOTAGE_DIR, 'catalog.json');

// Ensure static/footage exists
if (!fs.existsSync(FOOTAGE_DIR)) {
	fs.mkdirSync(FOOTAGE_DIR, { recursive: true });
}

// Read API key from args, env, or .env file
function getPexelsApiKey() {
	// From CLI args: --key=...
	const argKey = process.argv.find((a) => a.startsWith('--key='));
	if (argKey) return argKey.split('=')[1].replace(/['"\s]/g, '').trim();

	// From process.env
	if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY.replace(/['"\s]/g, '').trim();
	if (process.env.PEXELS_KEY) return process.env.PEXELS_KEY.replace(/['"\s]/g, '').trim();

	// From .env file
	const envPath = path.resolve('./.env');
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, 'utf-8');
		// Look for any line with pexels key
		for (const line of envContent.split('\n')) {
			const trimmed = line.trim();
			if (trimmed.startsWith('#')) continue;
			if (/pexels/i.test(trimmed) && trimmed.includes('=')) {
				const val = trimmed.split('=')[1].replace(/['"\s]/g, '').trim();
				if (val && val.length > 8 && !val.startsWith('your_')) {
					return val;
				}
			}
		}
	}

	return '';
}

function slugify(text) {
	if (!text) return 'clip';
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.slice(0, 40);
}


// Parse CLI category filter (--category=ai or --category=finance)
function getCategoryFilter() {
	const catArg = process.argv.find((a) => a.startsWith('--category='));
	if (catArg) return catArg.split('=')[1].trim().toLowerCase();
	return 'all';
}

// Parse limit per keyword (--limit=3)
function getLimitPerKeyword() {
	const limitArg = process.argv.find((a) => a.startsWith('--limit='));
	if (limitArg) return parseInt(limitArg.split('=')[1], 10) || 3;
	return 2;
}

// 4 Core Niches with curated keywords and tags
const TARGET_NICHES = [
	{
		id: 'ai-tech',
		category: 'Teknologi & AI',
		slugPrefix: 'technology',
		keywords: [
			{ query: 'artificial intelligence neural network', tags: ['ai', 'neural', 'technology', 'future', 'cyber', 'data'] },
			{ query: 'cyberpunk futuristic city neon', tags: ['cyberpunk', 'neon', 'city', 'night', 'matrix', 'future'] },
			{ query: 'server room datacenter technology', tags: ['server', 'datacenter', 'cloud', 'infrastructure', 'tech'] },
			{ query: 'robotics innovation future tech', tags: ['robot', 'automation', 'innovation', 'hardware', 'future'] },
			{ query: 'coding computer screen programming', tags: ['coding', 'programming', 'software', 'developer', 'screen'] }
		]
	},
	{
		id: 'business-finance',
		category: 'Bisnis & Finansial',
		slugPrefix: 'business',
		keywords: [
			{ query: 'stock market candlestick trading chart', tags: ['stock', 'market', 'trading', 'chart', 'investment', 'finance'] },
			{ query: 'crypto bitcoin blockchain technology', tags: ['crypto', 'bitcoin', 'blockchain', 'digital currency', 'finance'] },
			{ query: 'finance money currency banking wealth', tags: ['money', 'wealth', 'currency', 'cash', 'banking', 'rich'] },
			{ query: 'corporate office meeting business team', tags: ['office', 'meeting', 'team', 'corporate', 'work', 'success'] },
			{ query: 'modern high rise metropolis skyline', tags: ['city', 'skyline', 'metropolis', 'skyscrapers', 'urban'] }
		]
	},
	{
		id: 'science-space',
		category: 'Sains & Kosmos',
		slugPrefix: 'space',
		keywords: [
			{ query: 'galaxy nebula stars deep space universe', tags: ['galaxy', 'nebula', 'space', 'universe', 'stars', 'cosmos'] },
			{ query: 'planet earth from space orbit astronomy', tags: ['earth', 'space', 'planet', 'orbit', 'astronomy', 'globe'] },
			{ query: 'night sky milky way time lapse', tags: ['milky way', 'stars', 'night sky', 'astronomy', 'time lapse'] },
			{ query: 'quantum particles physics energy atom', tags: ['quantum', 'physics', 'energy', 'science', 'atom', 'particles'] }
		]
	},
	{
		id: 'mindset-psychology',
		category: 'Psikologi & Mindset',
		slugPrefix: 'mindset',
		keywords: [
			{ query: 'deep focus reading hourglass time passing', tags: ['focus', 'time', 'hourglass', 'reading', 'habits', 'books'] },
			{ query: 'human brain thinking neural synapses', tags: ['brain', 'psychology', 'mind', 'thinking', 'neuroscience'] },
			{ query: 'calm meditation peaceful sunrise morning', tags: ['meditation', 'calm', 'peace', 'sunrise', 'morning', 'mindset'] },
			{ query: 'chess strategy planning game logic', tags: ['chess', 'strategy', 'planning', 'logic', 'tactics', 'focus'] }
		]
	}
];

// Helper to download a file with timeout
async function downloadFile(url, destPath) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const arrayBuffer = await res.arrayBuffer();
	await fs.promises.writeFile(destPath, Buffer.from(arrayBuffer));
}

// Helper to extract thumbnail using ffmpeg
function extractThumbnail(videoPath, thumbPath) {
	return new Promise((resolve) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', [
			'-ss', '00:00:01',
			'-i', videoPath,
			'-vframes', '1',
			'-vf', 'scale=640:-1',
			'-q:v', '3',
			'-y', thumbPath
		]);
		proc.on('close', (code) => resolve(code === 0));
		proc.on('error', () => resolve(false));
	});
}

// Read or create catalog
function loadCatalog() {
	if (fs.existsSync(CATALOG_PATH)) {
		try {
			return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
		} catch (e) {
			return [];
		}
	}
	return [];
}

function saveCatalog(catalog) {
	fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
}

// Generate general filename
function getNextFileName(baseSlug, catalog) {
	const existingNames = new Set(catalog.map((c) => c.fileName));
	let counter = 1;
	let candidate = `${baseSlug}-${counter}.mp4`;
	while (existingNames.has(candidate) || fs.existsSync(path.join(FOOTAGE_DIR, candidate))) {
		counter++;
		candidate = `${baseSlug}-${counter}.mp4`;
	}
	return candidate;
}

// Curated direct HD links that require no API key
const CURATED_DIRECT_CLIPS = [
	{
		niche: 'ai-tech',
		slugPrefix: 'technology',
		title: 'Technology Microchip Hardware Innovation',
		query: 'microchip processor technology hardware',
		tags: ['microchip', 'technology', 'processor', 'hardware', 'innovation', 'ai'],
		duration: 60,
		url: 'https://videos.pexels.com/video-files/3141207/3141207-uhd_2560_1440_25fps.mp4'
	},
	{
		niche: 'science-space',
		slugPrefix: 'nature',
		title: 'Nature Mountain Sunrise Drone Landscape',
		query: 'nature mountain sunrise drone landscape',
		tags: ['nature', 'mountain', 'sunrise', 'drone', 'landscape', 'sky'],
		duration: 60,
		url: 'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4'
	}
];

// Main execution
async function main() {
	console.log('\n======================================================');
	console.log('🎬  YOUTUBE LONG: BATCH FOOTAGE DOWNLOADER');
	console.log('    Membangun Bank Koleksi Footage Lokal (Offline-First)');
	console.log('======================================================\n');

	const apiKey = getPexelsApiKey();
	const catFilter = getCategoryFilter();
	const limitPerKw = getLimitPerKeyword();

	let catalog = loadCatalog();
	console.log(`📁 Lokasi Bank Footage: ${FOOTAGE_DIR}`);
	console.log(`📊 Total koleksi lokal saat ini: ${catalog.length} klip\n`);

	if (!apiKey) {
		console.log('ℹ️  Pexels API Key tidak ditemukan.');
		console.log('   Dapatkan API Key gratis di: https://www.pexels.com/api/');
		console.log('   Lalu jalankan pencarian bebas:');
		console.log('   npm run download:footage -- --key=YOUR_PEXELS_API_KEY\n');
		console.log('   (Atau simpan di .env: PEXELS_API_KEY=YOUR_KEY)\n');
		console.log('📦 Mengunduh koleksi kurasi HD langsung (tanpa API key)...');

		let dlCount = 0;
		for (const clip of CURATED_DIRECT_CLIPS) {
			const existing = catalog.find((c) => c.sourceUrl === clip.url);
			if (existing) {
				console.log(`   ⏭️  Sudah ada: ${existing.fileName}`);
				continue;
			}

			const fileName = getNextFileName(clip.slugPrefix + '-' + slugify(clip.title), catalog);
			const destVideo = path.join(FOOTAGE_DIR, fileName);
			const thumbName = fileName.replace(/\.mp4$/, '.jpg');
			const destThumb = path.join(FOOTAGE_DIR, thumbName);

			console.log(`   ⬇️  Mengunduh: ${fileName}...`);
			try {
				await downloadFile(clip.url, destVideo);
				await extractThumbnail(destVideo, destThumb);
				catalog.unshift({
					id: `local-${fileName.replace('.mp4', '')}`,
					title: clip.title,
					fileName: fileName,
					videoUrl: `/footage/${fileName}`,
					thumbnail: `/footage/${thumbName}`,
					query: clip.query,
					tags: clip.tags,
					duration: clip.duration,
					sourceUrl: clip.url,
					source: 'local',
					createdAt: new Date().toISOString()
				});
				saveCatalog(catalog);
				dlCount++;
				console.log(`   ✅ Tersimpan di ${fileName}`);
			} catch (e) {
				console.warn(`   ❌ Gagal: ${e.message}`);
			}
		}

		console.log(`\n🎉 Selesai! Ditambahkan ${dlCount} klip kurasi.`);
		return;
	}

	console.log(`🔑 API Key Pexels terdeteksi: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`);
	console.log(`⚙️  Kategori: ${catFilter} | Limit: ${limitPerKw} video per keyword\n`);


	let downloadedCount = 0;
	let skippedCount = 0;

	// Filter niches if user specified --category=...
	const activeNiches = TARGET_NICHES.filter((n) => {
		if (catFilter === 'all') return true;
		if (catFilter === 'ai' || catFilter === 'tech') return n.id === 'ai-tech';
		if (catFilter === 'business' || catFilter === 'finance') return n.id === 'business-finance';
		if (catFilter === 'space' || catFilter === 'science') return n.id === 'science-space';
		if (catFilter === 'mindset' || catFilter === 'psychology') return n.id === 'mindset-psychology';
		return true;
	});

	for (const niche of activeNiches) {
		console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
		console.log(`📦 Niche: ${niche.category} (${niche.keywords.length} sub-topik)`);
		console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

		for (const kw of niche.keywords) {
			console.log(`\n🔍 Mencari: "${kw.query}"...`);

			try {
				const searchUrl = `https://api.pexels.com/videos/search?query=${encodeURIComponent(kw.query)}&orientation=landscape&per_page=${limitPerKw}&size=medium`;
				const res = await fetch(searchUrl, {
					headers: { Authorization: apiKey }
				});

				if (!res.ok) {
					console.warn(`   ❌ Pexels API Error HTTP ${res.status}`);
					continue;
				}

				const data = await res.json();
				const videos = data.videos || [];
				console.log(`   Ditemukan ${videos.length} video di Pexels.`);

				for (const vid of videos) {
					// Check if already in catalog by sourceUrl
					const existing = catalog.find((c) => c.sourceUrl && c.sourceUrl.includes(String(vid.id)));
					if (existing) {
						console.log(`   ⏭️  Lewati (sudah ada): ${existing.fileName}`);
						skippedCount++;
						continue;
					}

					// Find HD 1080p or 720p file
					const files = vid.video_files || [];
					const targetFile =
						files.find((f) => f.quality === 'hd' && f.width >= 1280) ||
						files.find((f) => f.quality === 'sd') ||
						files[0];

					if (!targetFile || !targetFile.link) continue;

					// Generate general slug based on query
					const cleanSlug = kw.query
						.toLowerCase()
						.replace(/[^a-z0-9\s]/g, '')
						.trim()
						.split(/\s+/)
						.slice(0, 3)
						.join('-');
					const baseName = `${niche.slugPrefix}-${cleanSlug}`;
					const fileName = getNextFileName(baseName, catalog);
					const destVideoPath = path.join(FOOTAGE_DIR, fileName);
					const thumbFileName = fileName.replace(/\.mp4$/, '.jpg');
					const destThumbPath = path.join(FOOTAGE_DIR, thumbFileName);

					console.log(`   ⬇️  Mengunduh: ${fileName} (${vid.duration}s)...`);
					try {
						await downloadFile(targetFile.link, destVideoPath);

						// Extract thumbnail
						await extractThumbnail(destVideoPath, destThumbPath);

						// Format readable title
						const words = fileName.replace(/\.mp4$/, '').split('-');
						const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

						const newEntry = {
							id: `local-${fileName.replace('.mp4', '')}`,
							title: title,
							fileName: fileName,
							videoUrl: `/footage/${fileName}`,
							thumbnail: fs.existsSync(destThumbPath) ? `/footage/${thumbFileName}` : (vid.image || ''),
							query: kw.query,
							tags: Array.from(new Set([...kw.tags, ...words])),
							duration: vid.duration || 15,
							sourceUrl: `https://www.pexels.com/video/${vid.id}/`,
							source: 'local',
							createdAt: new Date().toISOString()
						};

						catalog.unshift(newEntry);
						saveCatalog(catalog);
						downloadedCount++;
						console.log(`   ✅ Berhasil disimpan & diindeks ke katalog!`);
					} catch (dlErr) {
						console.warn(`   ❌ Gagal mengunduh: ${dlErr.message}`);
					}
				}
			} catch (err) {
				console.warn(`   ❌ Error pencarian: ${err.message}`);
			}
		}
	}

	console.log('\n======================================================');
	console.log(`🎉  SELESAI!`);
	console.log(`    - Berhasil diunduh: ${downloadedCount} klip video baru`);
	console.log(`    - Dilewati (sudah ada): ${skippedCount} klip`);
	console.log(`    - Total koleksi Bank Footage Lokal: ${catalog.length} klip`);
	console.log('======================================================\n');
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
