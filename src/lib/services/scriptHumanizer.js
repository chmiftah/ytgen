/**
 * Script Humanizer & Text Normalizer (Browser & Server Safe)
 *
 * Pure JavaScript text processing without Node.js native dependencies (fs, child_process, ffmpeg).
 * Safe for use in both frontend Svelte components and backend server endpoints.
 */

import { applyEnglishPhonetics } from './phoneticEnglishNormalizer.js';

const getEnv = (key, fallback) => {
	try {
		if (typeof process !== 'undefined' && process && process.env && process.env[key]) {
			return process.env[key];
		}
	} catch (_) {}
	return fallback;
};

// ============================================================================
// CONFIGURATION & VOICE RATES
// ============================================================================

export const DEFAULT_EDGE_VOICE = getEnv('EDGE_TTS_VOICE', 'id-ID-ArdiNeural');

export const VOICE_RATES = {
	normal: getEnv('VOICE_RATE_NORMAL', '-3%'),
	emphasis: getEnv('VOICE_RATE_EMPHASIS', '-6%'),
	question: getEnv('VOICE_RATE_QUESTION', '-2%'),
	dramatic: getEnv('VOICE_RATE_DRAMATIC', '-7%'),
	fast: getEnv('VOICE_RATE_FAST', '0%')
};

export const PAUSE_RANGES = {
	normal: { min: 100, max: 180 },     // ~140ms natural breath (was 250-400ms)
	question: { min: 140, max: 220 },   // ~180ms (was 350-500ms)
	emphasis: { min: 160, max: 260 },   // ~210ms (was 450-650ms)
	dramatic: { min: 250, max: 400 },   // ~325ms (was 700-1200ms)
	fast: { min: 50, max: 100 }         // ~75ms (was 180-280ms)
};

// ============================================================================
// 1. TEXT NORMALIZATION FOR TTS (normalize_for_tts)
// ============================================================================

const INDO_DIGITS = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

/**
 * Convert integer to Indonesian spoken words (0 up to trillions)
 */
export function integerToIndonesianWords(num) {
	if (num === 0) return 'nol';
	if (num < 0) return 'minus ' + integerToIndonesianWords(Math.abs(num));

	let words = '';

	if (num >= 1000000000000) {
		const trillions = Math.floor(num / 1000000000000);
		words += integerToIndonesianWords(trillions) + ' triliun ';
		num %= 1000000000000;
	}
	if (num >= 1000000000) {
		const billions = Math.floor(num / 1000000000);
		words += integerToIndonesianWords(billions) + ' miliar ';
		num %= 1000000000;
	}
	if (num >= 1000000) {
		const millions = Math.floor(num / 1000000);
		words += integerToIndonesianWords(millions) + ' juta ';
		num %= 1000000;
	}
	if (num >= 1000) {
		const thousands = Math.floor(num / 1000);
		if (thousands === 1) {
			words += 'seribu ';
		} else {
			words += integerToIndonesianWords(thousands) + ' ribu ';
		}
		num %= 1000;
	}
	if (num >= 100) {
		const hundreds = Math.floor(num / 100);
		if (hundreds === 1) {
			words += 'seratus ';
		} else {
			words += INDO_DIGITS[hundreds] + ' ratus ';
		}
		num %= 100;
	}
	if (num >= 20) {
		const tens = Math.floor(num / 10);
		words += INDO_DIGITS[tens] + ' puluh ';
		num %= 10;
	} else if (num >= 11) {
		const unit = num - 10;
		if (unit === 1) words += 'sebelas ';
		else words += INDO_DIGITS[unit] + ' belas ';
		num = 0;
	} else if (num === 10) {
		words += 'sepuluh ';
		num = 0;
	}
	if (num > 0 && num < 10) {
		words += INDO_DIGITS[num] + ' ';
	}

	return words.trim();
}

/**
 * Preprocess text for Indonesian Edge TTS without altering names or context
 */
export function normalize_for_tts(text, voiceId = DEFAULT_EDGE_VOICE) {
	if (!text || typeof text !== 'string') return '';

	let t = text;

	// 1. Remove Markdown syntax (bold, italic, headers, backticks)
	t = t.replace(/#{1,6}\s+/g, '');
	t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
	t = t.replace(/\*([^*]+)\*/g, '$1');
	t = t.replace(/__([^_]+)__/g, '$1');
	t = t.replace(/_([^_]+)_/g, '$1');
	t = t.replace(/`([^`]+)`/g, '$1');

	// 2. Normalize dashes and multiple dots
	t = t.replace(/\s*--\s*/g, ' ... ');
	t = t.replace(/\s*—\s*/g, ' ... ');
	t = t.replace(/\.{4,}/g, '...');

	// 3. Currency: Rupiah (Rp 50.000, Rp50000, Rp 1,5 juta)
	t = t.replace(/Rp\s*([\d.]+)(?:\s*(juta|miliar|triliun))?/gi, (match, numStr, scale) => {
		const cleanNum = numStr.replace(/\./g, '');
		const n = parseInt(cleanNum, 10);
		if (isNaN(n)) return match;
		const spoken = integerToIndonesianWords(n);
		if (scale) return `${spoken} ${scale.toLowerCase()} rupiah`;
		return `${spoken} rupiah`;
	});

	// Currency: Dollar ($100, $ 2.5 juta)
	t = t.replace(/\$\s*([\d.]+)(?:\s*(juta|miliar|triliun|billion|million))?/gi, (match, numStr, scale) => {
		const cleanNum = numStr.replace(/\./g, '');
		const n = parseInt(cleanNum, 10);
		if (isNaN(n)) return match;
		const spoken = integerToIndonesianWords(n);
		if (scale) {
			const scaleWord = scale.toLowerCase() === 'million' ? 'juta' : (scale.toLowerCase() === 'billion' ? 'miliar' : scale.toLowerCase());
			return `${spoken} ${scaleWord} dolar`;
		}
		return `${spoken} dolar`;
	});

	// Currency: Euro & Pound
	t = t.replace(/€\s*([\d.]+)/g, (m, n) => `${integerToIndonesianWords(parseInt(n.replace(/\./g, ''), 10) || 0)} euro`);
	t = t.replace(/£\s*([\d.]+)/g, (m, n) => `${integerToIndonesianWords(parseInt(n.replace(/\./g, ''), 10) || 0)} pound`);

	// 4. Percentages: 10%, 2,5%, 0.5%
	t = t.replace(/(\d+)(?:[.,](\d+))?\s*%/g, (match, whole, dec) => {
		const wholeWords = integerToIndonesianWords(parseInt(whole, 10) || 0);
		if (dec) {
			const decWords = dec.split('').map((d) => INDO_DIGITS[parseInt(d, 10)] || 'nol').join(' ');
			return `${wholeWords} koma ${decWords} persen`;
		}
		return `${wholeWords} persen`;
	});

	// 5. Units of Measurement: km, m, kg, cm, GB, MB, jam, menit, detik
	const unitMap = [
		{ re: /\b(\d+)\s*km\b/gi, unit: 'kilometer' },
		{ re: /\b(\d+)\s*m\b(?!\w)/gi, unit: 'meter' },
		{ re: /\b(\d+)\s*cm\b/gi, unit: 'sentimeter' },
		{ re: /\b(\d+)\s*mm\b/gi, unit: 'milimeter' },
		{ re: /\b(\d+)\s*kg\b/gi, unit: 'kilogram' },
		{ re: /\b(\d+)\s*gb\b/gi, unit: 'gigabita' },
		{ re: /\b(\d+)\s*mb\b/gi, unit: 'megabita' },
		{ re: /\b(\d+)\s*jam\b/gi, unit: 'jam' },
		{ re: /\b(\d+)\s*(?:menit|mnt)\b/gi, unit: 'menit' },
		{ re: /\b(\d+)\s*(?:detik|dtk)\b/gi, unit: 'detik' }
	];

	for (const { re, unit } of unitMap) {
		t = t.replace(re, (match, numStr) => {
			const n = parseInt(numStr, 10);
			if (isNaN(n)) return match;
			return `${integerToIndonesianWords(n)} ${unit}`;
		});
	}

	// 6. Year patterns (e.g. "tahun 1945", "pada 2024") or standalone 4-digit years 1900-2099
	t = t.replace(/\b(19\d{2}|20\d{2})\b/g, (match) => {
		const yr = parseInt(match, 10);
		return integerToIndonesianWords(yr);
	});

	// 7. General Numbers formatted with dots as thousands (e.g. 1.500, 20.000, 1.000.000)
	t = t.replace(/\b(\d{1,3}(?:\.\d{3})+)\b/g, (match) => {
		const cleanNum = match.replace(/\./g, '');
		const n = parseInt(cleanNum, 10);
		if (isNaN(n)) return match;
		return integerToIndonesianWords(n);
	});

	// 8. General Decimals (e.g. 2,5 or 3.5)
	t = t.replace(/\b(\d+)[,.](\d+)\b/g, (match, whole, dec) => {
		if (match.split('.').length > 2) return match;
		const wholeWords = integerToIndonesianWords(parseInt(whole, 10) || 0);
		const decWords = dec.split('').map((d) => INDO_DIGITS[parseInt(d, 10)] || 'nol').join(' ');
		return `${wholeWords} koma ${decWords}`;
	});

	// 9. Plain remaining integers (e.g. 1 to 999)
	t = t.replace(/\b(\d+)\b/g, (match) => {
		const n = parseInt(match, 10);
		if (isNaN(n)) return match;
		return integerToIndonesianWords(n);
	});

	// 10. Smart English phonetic normalizer for Indonesian voices (mindset -> main-set, overthinking -> ouvertinking)
	t = applyEnglishPhonetics(t, voiceId);

	// Clean up spacing
	t = t.replace(/[ \t]+/g, ' ').trim();

	return t;
}

// ============================================================================
// 2. HUMANIZE SCRIPT (Conversational spoken Indonesian)
// ============================================================================

/**
 * Humanize AI-generated Indonesian script into dynamic YouTube narration:
 * - Natural conversational rhythm (1-3 sentences per paragraph unit)
 * - Removes stiff formal essay/paper cliches
 * - Retains 100% of facts, entities, numbers, and chronology
 * - Selective "..." only for dramatic turns (no spamming)
 * - Strictly NO markdown, NO headings, NO bullets, NO emojis, NO bracketed TTS instructions
 */
/**
 * Humanize script by removing rigid cliches, adapting pacing,
 * injecting subtle dramatic pauses, and preserving chapter markers.
 */
export function humanizeScript(rawScript, options = {}) {
	if (!rawScript || typeof rawScript !== 'string') return '';

	// Support stickman script chapter preservation if chapters exist ([Bab ...], [Chapter ...], [Hook ...], etc.)
	const chapterHeaderRegex = /\[(Bab|Hook|Adegan|Scene|Chapter|Part|Section)[^\]]+\]/i;
	if (chapterHeaderRegex.test(rawScript)) {
		const parts = rawScript.split(/(?=\[(?:Bab|Hook|Adegan|Scene|Chapter|Part|Section)[^\]]+\])/i);
		return parts
			.map((part) => {
				const match = part.match(/^(\[(?:Bab|Hook|Adegan|Scene|Chapter|Part|Section)[^\]]+\])\s*([\s\S]*)$/i);
				if (match) {
					const header = match[1].trim();
					const body = match[2].trim();
					const humanizedBody = humanizeTextChunk(body, options);
					return header + (humanizedBody ? '\n' + humanizedBody : '');
				}
				return humanizeTextChunk(part, options);
			})
			.filter(Boolean)
			.join('\n\n')
			.trim();
	}

	return humanizeTextChunk(rawScript, options);
}

export function humanizeTextChunk(rawScript, options = {}) {
	if (!rawScript || typeof rawScript !== 'string') return '';

	// 1. Strip any markdown headers, bullets, emojis, and TTS brackets
	let clean = rawScript;
	clean = clean.replace(/#{1,6}\s+[^\n]+/g, '');
	clean = clean.replace(/^\s*[-*•]\s+/gm, '');
	clean = clean.replace(/\[(?:DRAMATIC|PAUSE|EMPHASIS|FAST|NORMAL)[^\]]*\]/gi, '');
	clean = clean.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

	// 2. Replace stiff formal cliches with natural conversational phrases
	const isFormal = options.persona === 'formal';
	const pronoun = isFormal ? 'Anda' : (options.pronoun || 'lo');

	const clicheReplacements = [
		{
			re: /(?:pada\s+kesempatan\s+kali\s+ini|di\s+video\s+kali\s+ini)\s*(?:kita\s+akan\s+membahas|kami\s+akan\s+membahas|akan\s+dibahas)\s*(?:mengenai|tentang)?\s*/gi,
			rep: 'Kali ini, kita akan melihat '
		},
		{
			re: /pada\s+kesempatan\s+kali\s+ini/gi,
			rep: 'Kali ini'
		},
		{
			re: /seperti\s+yang\s+kita\s+ketahui\s*(?:bersama)?\s*(?:bahwa)?/gi,
			rep: 'Kalau kita perhatikan,'
		},
		{
			re: /berdasarkan\s+penjelasan\s+tersebut/gi,
			rep: 'Dari sini kita bisa melihat'
		},
		{
			re: /adapun\s+mengenai/gi,
			rep: 'Soal'
		},
		{
			re: /\badapun\b/gi,
			rep: 'Selain itu,'
		},
		{
			re: /kendati\s+demikian/gi,
			rep: 'Meski begitu,'
		},
		{
			re: /pada\s+hakikatnya/gi,
			rep: 'Sebenarnya,'
		},
		{
			re: /sebagaimana\s+mestinya/gi,
			rep: 'Seharusnya,'
		},
		{
			re: /merupakan\s+sebuah\b/gi,
			rep: 'adalah'
		},
		{
			re: /terdapat\s+berbagai\s+macam/gi,
			rep: 'ada banyak'
		},
		{
			re: /dalam\s+rangka\s+untuk/gi,
			rep: 'untuk'
		},
		{
			re: /jangan\s+lupa\s+(?:untuk\s+)?(?:like|subscribe|komen|comment|share)[^.!?\n]*[.!?]?/gi,
			rep: ''
		},
		// Conversational YouTube / Gen Z natural phrasing
		{ re: /(?:apakah\s+anda\s+tahu|tahukah\s+anda)\b/gi, rep: 'lo pernah sadar nggak' },
		{ re: /bayangkan\s+jika\s+anda\b/gi, rep: `coba bayangin kalau ${pronoun}` },
		{ re: /(?:ketika|saat)\s+anda\b/gi, rep: `pas ${pronoun}` },
		{ re: /jika\s+anda\b/gi, rep: `kalau ${pronoun}` },
		{ re: /bagi\s+anda\s+yang\b/gi, rep: `buat ${pronoun} yang` },
		...(isFormal
			? []
			: [
					{ re: /\bAnda\b/g, rep: pronoun },
					{ re: /\banda\b/g, rep: pronoun }
			  ]),
		{ re: /\boleh\s+karena\s+itu,?\b/gi, rep: 'Makanya,' },
		{ re: /\boleh\s+sebab\s+itu,?\b/gi, rep: 'Makanya,' },
		{ re: /\bnamun\s+demikian,?\b/gi, rep: 'Tapi,' },
		{ re: /\bsebagaimana\s+kita\s+ketahui\b/gi, rep: 'Seperti yang kita tahu,' },
		{ re: /\btidak\s+dapat\s+dipungkiri\s*(?:bahwa)?\b/gi, rep: 'Jelas banget,' },
		{ re: /\bsangatlah\s+penting\b/gi, rep: 'penting banget' },
		{ re: /dalam\s+kehidupan\s+sehari-hari\b/gi, rep: 'sehari-hari' }
	];

	for (const { re, rep } of clicheReplacements) {
		clean = clean.replace(re, rep);
	}
	clean = clean.replace(/,\s*,/g, ',');

	// 3. Sentence segmentation & paragraph pacing (1-3 sentences per paragraph)
	const rawSentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
	const sentences = rawSentences
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	const paragraphs = [];
	let currentParagraph = [];

	for (let i = 0; i < sentences.length; i++) {
		let sent = sentences[i];

		sent = sent.charAt(0).toUpperCase() + sent.slice(1);

		const dramaticTriggers = [
			{ re: /^(Tapi\s+ternyata)\s+/i, rep: 'Tapi ternyata, ' },
			{ re: /^(Dan\s+yang\s+paling\s+aneh)\s+/i, rep: 'Dan yang paling aneh, ' },
			{ re: /^(Sampai\s+akhirnya)\s+/i, rep: 'Sampai akhirnya, ' },
			{ re: /^(Tapi\s+sebenarnya)\s+/i, rep: 'Tapi sebenarnya, ' },
			{ re: /^(Tanpa\s+disadari)\s+/i, rep: 'Tanpa disadari, ' }
		];

		for (const { re, rep } of dramaticTriggers) {
			if (re.test(sent) && !sent.includes('...')) {
				sent = sent.replace(re, rep);
				break;
			}
		}

		currentParagraph.push(sent);

		const wordCountInPara = currentParagraph.join(' ').split(/\s+/).length;
		if (currentParagraph.length >= 3 || (currentParagraph.length >= 2 && wordCountInPara >= 30) || (currentParagraph.length === 1 && sent.length < 35 && sent.endsWith('?'))) {
			paragraphs.push(currentParagraph.join(' '));
			currentParagraph = [];
		}
	}

	if (currentParagraph.length > 0) {
		paragraphs.push(currentParagraph.join(' '));
	}

	let result = paragraphs.join('\n\n').trim();
	result = result.replace(/\n{3,}/g, '\n\n');
	result = result.replace(/[ \t]+/g, ' ');

	return result;
}

// ============================================================================
// 3. VOICE DIRECTION (detect_voice_style)
// ============================================================================

export function detect_voice_style(text) {
	if (!text || typeof text !== 'string') return 'normal';
	const trimmed = text.trim();

	// 1. Question
	if (trimmed.endsWith('?') || /\?\s*$/.test(trimmed)) {
		return 'question';
	}

	// 2. Dramatic: contains '...' with reveal/suspense cues
	if (trimmed.includes('...')) {
		const dramaticKeywords = [
			'ternyata', 'aneh', 'rahasia', 'tiba-tiba', 'sampai akhirnya',
			'tapi sebenarnya', 'hilang', 'panik', 'kaget', 'mengejutkan',
			'mustahil', 'terlambat', 'ancaman', 'gelap', 'misteri'
		];
		const lower = trimmed.toLowerCase();
		const hasDramaticKeyword = dramaticKeywords.some((kw) => lower.includes(kw));
		if (hasDramaticKeyword || trimmed.endsWith('...')) {
			return 'dramatic';
		}
	}

	// 3. Fast: quick transitional phrases
	const fastTransitions = [
		/^(sementara itu|di sisi lain|selanjutnya|lalu,|setelah itu,)/i
	];
	if (fastTransitions.some((r) => r.test(trimmed))) {
		return 'fast';
	}

	// 4. Emphasis: short punchy sentence (< 10 words) with high conviction
	const words = trimmed.split(/\s+/).filter(Boolean);
	if (words.length <= 9 && (trimmed.endsWith('!') || /\b(jelas|pasti|mutlak|kuncinya|sama sekali|jangan pernah)\b/i.test(trimmed))) {
		return 'emphasis';
	}

	return 'normal';
}

export function calculatePauseAfter(style, seedStr = '') {
	const range = PAUSE_RANGES[style] || PAUSE_RANGES.normal;
	let hashVal = 0;
	for (let i = 0; i < seedStr.length; i++) {
		hashVal = (hashVal * 31 + seedStr.charCodeAt(i)) & 0xffffffff;
	}
	const ratio = Math.abs(hashVal % 1000) / 1000;
	const pause = Math.round(range.min + ratio * (range.max - range.min));
	return pause;
}

// Simple deterministic hash for browser-side chunks
function simpleHash(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash) + str.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash).toString(16);
}

// ============================================================================
// 4. SMART CHUNKING (smartChunk)
// ============================================================================

export function smartChunk(script, options = {}) {
	const minWords = options.minWords || 20;
	const maxWords = options.maxWords || 60;
	const targetSentences = options.targetSentences || 3;

	const clean = (script || '').trim().replace(/\r\n/g, '\n');
	if (!clean) return [];

	const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
	const allSentences = [];

	for (const para of paragraphs) {
		const sentencesInPara = para.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [para];
		for (const rawS of sentencesInPara) {
			const s = rawS.trim();
			if (s) allSentences.push(s);
		}
	}

	const chunks = [];
	let currentSentences = [];
	let currentWordCount = 0;

	for (const sent of allSentences) {
		const words = sent.split(/\s+/).filter(Boolean);
		const sentWordCount = words.length;

		if (
			currentWordCount === 0 ||
			(currentWordCount + sentWordCount <= maxWords && currentSentences.length < targetSentences) ||
			currentWordCount < minWords
		) {
			currentSentences.push(sent);
			currentWordCount += sentWordCount;
		} else {
			const chunkText = currentSentences.join(' ');
			chunks.push(createChunkObject(chunks.length + 1, chunkText, options));
			currentSentences = [sent];
			currentWordCount = sentWordCount;
		}
	}

	if (currentSentences.length > 0) {
		const chunkText = currentSentences.join(' ');
		chunks.push(createChunkObject(chunks.length + 1, chunkText, options));
	}

	return chunks;
}

function createChunkObject(index, text, options = {}) {
	const style = options.styleOverride || detect_voice_style(text);
	const baseRate = VOICE_RATES[style] || VOICE_RATES.normal;
	const rate = options.rate || baseRate;
	const pitch = options.pitch || '0Hz';
	const pause_after = calculatePauseAfter(style, `${index}-${text}`);
	const voiceId = options.voiceId || DEFAULT_EDGE_VOICE;
	const normalizedText = normalize_for_tts(text, voiceId);
	const hashInput = `${normalizedText}::${voiceId}::${rate}::${pitch}`;
	const audio_hash = options.hashFunction ? options.hashFunction(hashInput) : simpleHash(hashInput);

	return {
		index,
		text,
		normalizedText,
		style,
		rate,
		pitch,
		pause_after,
		audio_path: null,
		audio_hash,
		status: 'pending'
	};
}
