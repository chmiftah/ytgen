import fs from 'fs';
import path from 'path';

const CATEGORY_MAP = [
	{
		id: 'finance',
		label: '💰 Finansial & Uang',
		en: ['coin', 'coins', 'money', 'crypto', 'gold', 'wealth', 'cash', 'shoveling', 'dollar', 'rich', 'chart', 'investment', 'stuck_coin'],
		id_tags: ['uang', 'koin', 'emas', 'finansial', 'kaya', 'cuan', 'gaji', 'investasi', 'modal', 'bisnis', 'saham', 'rupiah', 'dana', 'tabungan']
	},
	{
		id: 'work',
		label: '💼 Kerja & Produktivitas',
		en: ['computer', 'desk', 'typing', 'office', 'work', 'microchip', 'usb', 'cables', 'deadline', 'laptop', 'task', 'assembling', 'book', 'reading', 'study'],
		id_tags: ['kerja', 'komputer', 'laptop', 'meja', 'lembur', 'kantor', 'tugas', 'produktif', 'ngetik', 'karir', 'fokus', 'pekerjaan', 'buku', 'baca', 'belajar']
	},
	{
		id: 'sad',
		label: '😔 Sedih & Gagal',
		en: ['crying', 'tissue', 'tears', 'sad', 'alone', 'loss', 'grief', 'depressed', 'down'],
		id_tags: ['sedih', 'menangis', 'nangis', 'air mata', 'gagal', 'kecewa', 'hancur', 'patah', 'rugi', 'terluka', 'putus asa', 'menyesal']
	},
	{
		id: 'confused',
		label: '😵 Bingung & Pilihan',
		en: ['confusion', 'shrugging', 'question', 'puzzle', 'paths', 'stuck', 'wondering', 'choosing', 'invisible'],
		id_tags: ['bingung', 'ragu', 'pilihan', 'bimbang', 'tersesat', 'arah', 'dilema', 'heran', 'tanya', 'jalan', 'tidak tahu']
	},
	{
		id: 'tired',
		label: '😴 Lelah & Tidur',
		en: ['sleeping', 'yawning', 'zzz', 'bed', 'tossing', 'exhausted', 'resting', 'stool', 'nap'],
		id_tags: ['lelah', 'capek', 'tidur', 'ngantuk', 'rebahan', 'kasur', 'begadang', 'istirahat', 'menguap', 'lemas']
	},
	{
		id: 'idea',
		label: '💡 Ide & Solusi',
		en: ['light', 'pointing', 'idea', 'glowing', 'bulb', 'brain', 'unlocking', 'door', 'discovery', 'mind', 'book', 'reading', 'study'],
		id_tags: ['ide', 'solusi', 'otak', 'pikiran', 'paham', 'rahasia', 'terbuka', 'bohlam', 'terang', 'wawasan', 'cerdas', 'tahu', 'buku', 'baca', 'belajar']
	},
	{
		id: 'stress',
		label: '🌋 Stres & Tekanan',
		en: ['boulder', 'overwhelmed', 'heavy', 'tangled', 'black_hole', 'carrying', 'struggling', 'pressure', 'burden'],
		id_tags: ['beban', 'stres', 'berat', 'tekanan', 'masalah', 'pusing', 'gelisah', 'panik', 'takut', 'terjebak', 'cemas']
	},
	{
		id: 'sport',
		label: '🏃 Olahraga & Gerak',
		en: ['push_up', 'running', 'stretching', 'exercise', 'water_bottle', 'walking', 'stepping', 'climbing', 'mountain'],
		id_tags: ['olahraga', 'lari', 'push up', 'sehat', 'jalan', 'gerak', 'fisik', 'stretching', 'latihan', 'air minum', 'alam']
	},
	{
		id: 'success',
		label: '🎯 Sukses & Hebat',
		en: ['thumbs', 'thumbs-up', 'celebrating', 'cheering', 'jumping', 'proud', 'smiling', 'winning', 'guitar', 'admiring'],
		id_tags: ['sukses', 'menang', 'hebat', 'juara', 'jempol', 'bangga', 'berhasil', 'gembira', 'senyum', 'semangat', 'bahagia']
	}
];

export function getStickmanCategories() {
	return CATEGORY_MAP;
}

/**
 * Stickman Service
 * Scans static/stickman directory and enriches assets with bilingual keywords & categories.
 */
export function getStickmanAssets() {
	if (typeof window !== 'undefined') return [];
	try {
		const dir = path.resolve('./static/stickman');
		if (!fs.existsSync(dir)) return [];

		// Optional custom metadata JSON file (if user wants to customize tags/titles explicitly)
		const metaFile = path.join(dir, 'metadata.json');
		let customMeta = {};
		if (fs.existsSync(metaFile)) {
			try {
				customMeta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
			} catch (e) {
				console.warn('Failed to parse static/stickman/metadata.json:', e.message);
			}
		}

		const files = fs.readdirSync(dir);
		return files
			.filter(f => /\.(jpeg|jpg|png|webp)$/i.test(f))
			.map((file, idx) => {
				const userDefined = customMeta[file] || customMeta[path.basename(file)] || null;

				const ext = path.extname(file);
				let rawName = path.basename(file, ext);

				// Extract action name if formatted like _Stickman_..._\d{14}
				const m = file.match(/_Stickman_(.+?)(?:_\d{14})?\./i);
				if (m) {
					rawName = m[1];
				} else {
					// Clean generic prefixes and timestamps
					rawName = rawName
						.replace(/^\d+_.*?_Stickman_/i, '')
						.replace(/^stickman[-_]/i, '')
						.replace(/_\d{10,14}$/, '')
						.replace(/[-_]\d+$/, '');
				}

				const cleanName = (userDefined?.title || rawName.replace(/[_-]+/g, ' ')).toLowerCase().trim();
				const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
				const nameWords = cleanName.split(/\s+/).filter(w => w.length > 2);

				// Detect categories & assign Indonesian tags
				const assignedCategories = new Set(userDefined?.categories || []);
				const idKeywords = new Set(userDefined?.tags || []);

				// Match cleanName against CATEGORY_MAP (supports both English and Indonesian words!)
				for (const cat of CATEGORY_MAP) {
					const hasEnMatch = cat.en.some(k => cleanName.includes(k) || nameWords.some(w => w.includes(k)));
					const hasIdMatch = cat.id_tags.some(k => cleanName.includes(k) || nameWords.some(w => w.includes(k)));

					if (hasEnMatch || hasIdMatch) {
						assignedCategories.add(cat.id);
						for (const tag of cat.id_tags) idKeywords.add(tag);
					}
				}

				if (assignedCategories.size === 0) assignedCategories.add('general');

				return {
					id: `stickman-${idx}`,
					fileName: file,
					url: `/stickman/${file}`,
					title: cleanName || `Illustration ${idx + 1}`,
					slug: slug || `asset-${idx}`,
					keywords: nameWords,
					tagsId: Array.from(idKeywords),
					categories: Array.from(assignedCategories),
					primaryCategory: Array.from(assignedCategories)[0] || 'general',
					layoutSide: idx % 2 === 0 ? 'left' : 'right'
				};
			});
	} catch (err) {
		console.warn('Failed to scan static/stickman:', err);
		return [];
	}
}

/**
 * Find best matching stickman asset for a visual query or narration text
 */
export function findMatchingStickman(query = '', narration = '') {
	const assets = getStickmanAssets();
	if (assets.length === 0) return { url: '', title: 'Default', layoutSide: 'left' };

	const qWords = (query || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
	const nWords = (narration || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);

	let bestMatch = assets[0];
	let highestScore = -1;

	for (const asset of assets) {
		let score = 0;

		// 1. Direct match with stickman query words (English)
		for (const qw of qWords) {
			if (asset.title.includes(qw)) score += 6;
			else if (asset.keywords.some(kw => kw.includes(qw) || qw.includes(kw))) score += 4;
		}

		// 2. Direct match with Indonesian narration words
		for (const nw of nWords) {
			if (asset.tagsId?.some(tag => tag.includes(nw) || nw.includes(tag))) {
				score += 3;
			}
		}

		if (score > highestScore) {
			highestScore = score;
			bestMatch = asset;
		}
	}

	return bestMatch;
}
