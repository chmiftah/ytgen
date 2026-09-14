/**
 * Script Analyzer Service
 * Breaks down raw YouTube script into structured cinematic scenes,
 * generates optimal stock footage search queries, and provides presets.
 */

export const SCRIPT_PRESETS = [
	{
		id: 'ai-future',
		title: 'Masa Depan AI & AGI (Tech Explainer)',
		category: 'Teknologi',
		text: `[Bab 1: Fajar Kecerdasan Baru | Ledakan teknologi yang tak terbendung]
Kecerdasan Buatan berkembang jauh lebih cepat dari yang pernah kita bayangkan sebelumnya. Para ilmuwan di seluruh dunia kini berlomba-lomba menciptakan Artificial General Intelligence.

[Bab 2: Era Keemasan atau Ancaman? | Dilema terbesar peradaban manusia]
Apakah teknologi ini akan membawa peradaban manusia ke era keemasan, atau justru mengubah tatanan dunia selamanya? Mari kita bedah rahasia di balik revolusi digital paling masif abad ini.`
	},
	{
		id: 'psychology-money',
		title: 'Psikologi Uang: Mengapa Orang Pintar Buat Kesalahan Finansial',
		category: 'Keuangan & Mindset',
		text: `[Bab 1: Ilusi Angka | Mengapa kepintaran bukan penentu kekayaan]
Banyak orang mengira kesuksesan finansial bergantung pada seberapa pintar Anda berhitung. Namun kenyataannya, keberhasilan mengelola uang lebih banyak ditentukan oleh perilaku dan emosi Anda.

[Bab 2: Perangkap Keserakahan | Rahasia bertahan di tengah badai pasar]
Pasar saham terus bergerak naik dan turun tanpa henti, menguji kesabaran jutaan investor setiap hari. Disiplin jangka panjang adalah kunci utama yang membedakan mereka yang bertahan dan mereka yang tumbang.`
	},
	{
		id: 'james-webb',
		title: 'Misteri Alam Semesta & Teleskop James Webb',
		category: 'Sains & Luar Angkasa',
		text: `[Bab 1: Menembus Kegelapan | Mahakarya sains manusia di batas kosmos]
Jutaan kilometer di luar angkasa yang gelap gulita, sebuah mahakarya sains manusia sedang mengintip awal mula alam semesta. Teleskop James Webb menangkap cahaya galaksi-galaksi purba yang lahir sesaat setelah Big Bang.

[Bab 2: Asal Usul Keberadaan | Pesan kuno dari miliaran tahun lalu]
Setiap bintang dan nebula menyimpan teka-teki tak terhingga tentang asal usul keberadaan kita. Perjalanan eksplorasi kosmos baru saja dimulai.`
	},
	{
		id: 'morning-routine',
		title: 'Rutinitas Pagi 10 Menit yang Mengubah Fokus Anda',
		category: 'Produktivitas',
		text: `[Bab 1: Perangkap Dopamin Pagi | Kesalahan terbesar 60 menit pertama]
Cara Anda memulai 60 menit pertama di pagi hari menentukan kualitas seluruh hari Anda. Kebanyakan orang langsung meraih ponsel mereka dan membanjiri otak dengan dopamin murah.

[Bab 2: Protokol Kejernihan Mental | Tiga langkah sederhana melipatgandakan fokus]
Gantilah kebiasaan itu dengan sinar matahari alami, hidrasi instan, dan 5 menit keheningan mendalam. Rasakan bagaimana kejernihan mental dan produktivitas Anda melonjak secara dramatis.`
	}
];

// Mapping thematic words to cinematic stock queries
const THEME_MAPPINGS = [
	{
		match: ['ai', 'kecerdasan', 'buatan', 'robot', 'teknologi', 'digital', 'algoritma', 'coding', 'komputer', 'agi'],
		query: 'futuristic artificial intelligence neural network cyber technology data'
	},
	{
		match: ['uang', 'finansial', 'saham', 'investor', 'investasi', 'bisnis', 'ekonomi', 'pasar', 'kaya', 'wealth'],
		query: 'stock market financial growth trading chart city skyscraper wall street'
	},
	{
		match: ['angkasa', 'bintang', 'galaksi', 'alam semesta', 'teleskop', 'james webb', 'planet', 'nebula', 'kosmos', 'space'],
		query: 'deep cosmic universe nebula galaxy stars space exploration aerial'
	},
	{
		match: ['pagi', 'fokus', 'produktivitas', 'otak', 'kebiasaan', 'pikiran', 'mental', 'disiplin', 'meditasi', 'jam'],
		query: 'morning sunrise mountain focus meditation nature sunlight peaceful'
	},
	{
		match: ['bumi', 'laut', 'ombak', 'alam', 'hutan', 'gunung', 'langit', 'lingkungan'],
		query: 'cinematic ocean waves golden hour sunrise nature landscape drone'
	},
	{
		match: ['kota', 'manusia', 'dunia', 'gedung', 'malam', 'jalan', 'ramai'],
		query: 'modern city traffic night skyline futuristic drone timelapse'
	}
];

/**
 * Extract best search query for a scene based on its narration
 */
export function extractVisualQuery(narrationText) {
	const lower = narrationText.toLowerCase();
	
	for (const item of THEME_MAPPINGS) {
		for (const keyword of item.match) {
			if (lower.includes(keyword)) {
				return item.query;
			}
		}
	}
	
	// Default fallback query
	return 'cinematic cinematic 4k landscape aesthetic documentary';
}

/**
 * Break down raw script into scenes (12 to 24 words per scene)
 * and detect or assign chapter title cards.
 */
export function analyzeScript(rawScript) {
	if (!rawScript || typeof rawScript !== 'string') return [];

	// Check if script has explicit chapter blocks: e.g. [Bab 1: Title | Subtitle] or Bab 1: Title
	const rawLines = rawScript.split(/\r?\n/);
	const chapterHeaderRegex = /^(?:\[(?:bab|chapter)\s*(\d+)[:\s-]*([^\]|]+)(?:\|([^\]]+))?\]|(?:bab|chapter)\s*(\d+)[:\s-]*([^\n]+))/i;

	const scenes = [];
	let currentChunk = '';
	let currentWordCount = 0;
	let pendingChapter = null;
	let chapterCounter = 1;

	// Helper to push a scene
	const pushScene = (text) => {
		if (!text.trim()) return;
		const isFirstScene = scenes.length === 0;
		let chapterForScene = pendingChapter;
		
		// If no explicit chapter, auto-assign chapter 1 to first scene
		if (!chapterForScene && isFirstScene) {
			chapterForScene = {
				number: 1,
				tag: 'BAB 01',
				title: 'PENDAHULUAN',
				subtitle: 'Pengantar dan latar belakang cerita',
				style: 'center'
			};
			chapterCounter = 2;
		}

		scenes.push(createSceneObject(scenes.length + 1, text, chapterForScene));
		pendingChapter = null;
	};

	for (const rawLine of rawLines) {
		const line = rawLine.trim();
		if (!line) continue;

		// Check for chapter header
		const chMatch = line.match(chapterHeaderRegex);
		if (chMatch) {
			// Flush current scene before starting new chapter
			if (currentChunk) {
				pushScene(currentChunk);
				currentChunk = '';
				currentWordCount = 0;
			}
			const num = parseInt(chMatch[1] || chMatch[4] || chapterCounter, 10);
			const title = (chMatch[2] || chMatch[5] || `Bab ${num}`).trim();
			const subtitle = (chMatch[3] || 'Eksplorasi mendalam segmen ini').trim();

			pendingChapter = {
				number: num,
				tag: `BAB ${String(num).padStart(2, '0')}`,
				title,
				subtitle,
				style: 'center'
			};
			chapterCounter = num + 1;
			continue;
		}

		// Split line into sentences
		const sentences = line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line];
		for (const rawSentence of sentences) {
			const sentence = rawSentence.trim();
			if (!sentence) continue;

			const words = sentence.split(/\s+/).filter(Boolean);

			if (currentWordCount === 0 || (currentWordCount + words.length <= 26 && currentWordCount < 14)) {
				currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
				currentWordCount += words.length;
			} else {
				if (currentChunk) {
					pushScene(currentChunk);
				}
				currentChunk = sentence;
				currentWordCount = words.length;
			}
		}
	}

	// Flush remaining text
	if (currentChunk) {
		pushScene(currentChunk);
	}

	// If script had no explicit chapters and is long (e.g. 4+ scenes), auto-place Chapter 2 & 3
	if (scenes.length >= 4 && scenes.filter(s => s.chapter).length === 1) {
		const midIdx = Math.floor(scenes.length / 2);
		scenes[midIdx].chapter = {
			number: 2,
			tag: 'BAB 02',
			title: 'PEMBAHASAN UTAMA',
			subtitle: 'Mengupas akar masalah dan fakta kunci',
			style: 'center'
		};
		scenes[midIdx].estimatedDuration = Number((scenes[midIdx].estimatedDuration + 3.8).toFixed(1));
		scenes[midIdx].audioDuration = scenes[midIdx].estimatedDuration;

		if (scenes.length >= 6) {
			const endIdx = scenes.length - 1;
			scenes[endIdx].chapter = {
				number: 3,
				tag: 'BAB 03',
				title: 'KESIMPULAN & REFLEKSI',
				subtitle: 'Pelajaran berharga untuk masa depan',
				style: 'center'
			};
			scenes[endIdx].estimatedDuration = Number((scenes[endIdx].estimatedDuration + 3.8).toFixed(1));
			scenes[endIdx].audioDuration = scenes[endIdx].estimatedDuration;
		}
	}

	return scenes;
}

/**
 * Format spoken text for voiceover narration, prepending the chapter announcement
 * with natural pauses if the scene represents the start of a chapter.
 */
export function getSpokenVoiceoverText(scene) {
	if (!scene) return '';
	if (!scene.chapter) {
		return scene.narration || '';
	}

	const num = scene.chapter.number || 1;
	// Convert 'BAB 01' or 'BAB 1' to clean spoken 'Bab 1'
	const spokenTag = scene.chapter.tag 
		? scene.chapter.tag.replace(/^BAB\s*0?(\d+)/i, 'Bab $1') 
		: `Bab ${num}`;
	const title = (scene.chapter.title || '').trim();
	const titlePunct = /[.!?]$/.test(title) ? '' : '.';

	// Format: "... Bab 1, Fajar Kecerdasan Baru. ...\n\nNarasi..."
	// Leading ellipses provide breathing room ("jeda"), trailing ellipses and linebreaks
	// produce the transition pause before narration begins.
	if (title) {
		return `... ${spokenTag}, ${title}${titlePunct} ...\n\n${scene.narration || ''}`;
	}
	return `... ${spokenTag}. ...\n\n${scene.narration || ''}`;
}

export function createSceneObject(index, text, chapter = null) {
	const words = text.split(/\s+/).filter(Boolean);
	// Approx speech rate: ~140 words per minute => ~2.3 words per second => ~0.43s per word
	// If this scene introduces a chapter, add ~3.8s for the chapter title announcement & pause
	const chapterOffset = chapter ? 3.8 : 0;
	const estimatedDuration = Math.max(3.5, Number(((words.length * 0.45) + chapterOffset).toFixed(1)));
	const visualQuery = extractVisualQuery(text);

	return {
		id: `scene-${index}-${Date.now()}`,
		index,
		narration: text,
		words,
		visualQuery,
		estimatedDuration,
		footage: null, // Will be populated by Pexels or StockLibrary
		voiceAudioUrl: null, // Will be populated by ElevenLabs or fallback
		audioDuration: estimatedDuration,
		wordTimings: [], // [ { word: "Kecerdasan", start: 0, end: 0.45 }, ... ]
		chapter: chapter ? {
			number: chapter.number || 1,
			tag: chapter.tag || `BAB ${String(chapter.number || 1).padStart(2, '0')}`,
			title: chapter.title || 'Awal Mula Cerita',
			subtitle: chapter.subtitle || 'Pengenalan dan latar belakang cerita',
			style: chapter.style || 'center'
		} : null
	};
}
