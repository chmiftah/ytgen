/**
 * Dynamic Dan Koe Mental Model & Minimalist Glyph Engine
 * Modularized Architecture supporting 10 Themes x 10 High-Quality Wireframe Items (100 total)
 * + Dual-Synthesis Special Diagram (mind_body)
 */

import { DIAGRAM_THEMES, SPECIAL_DIAGRAMS, DIAGRAM_REGISTRY, THEME_COLORS } from './diagramThemes.js';

export { DIAGRAM_THEMES, SPECIAL_DIAGRAMS, DIAGRAM_REGISTRY, THEME_COLORS };

const STOP_WORDS = new Set([
	'adalah', 'karena', 'mereka', 'dengan', 'untuk', 'yang', 'akan', 'atau',
	'dalam', 'tanpa', 'jika', 'kamu', 'orang', 'bukan', 'paling', 'kurang',
	'lebih', 'sudah', 'selalu', 'bisa', 'saat', 'kita', 'dan', 'di', 'ke',
	'dari', 'pada', 'hanya', 'saja', 'sebuah', 'ini', 'itu', 'agar', 'oleh',
	'the', 'and', 'for', 'you', 'your', 'with', 'from', 'that', 'this', 'are'
]);

function sanitize(str) {
	return String(str || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.slice(0, 48);
}

/**
 * Extract context-aware mental model or Dan Koe artifact glyph directly from the narration sentence
 */
export function analyzeNarrationToDiagram(narration, accentColor = '#F59E0B') {
	const text = (narration || '').trim();
	const low = text.toLowerCase();
	const words = text.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9-]/g, '')).filter(Boolean);

	let matchedItem = null;

	// 1. First Priority: Check Special Synthesis (e.g. mind_body)
	for (const spec of SPECIAL_DIAGRAMS) {
		if (spec.regex && spec.regex.test(low)) {
			matchedItem = spec;
			break;
		}
	}

	// 2. Second Priority: Loop through thematic categories to find the best match
	if (!matchedItem) {
		for (const theme of DIAGRAM_THEMES) {
			for (const item of theme.items) {
				if (item.regex && item.regex.test(low)) {
					matchedItem = item;
					break;
				}
			}
			if (matchedItem) break;
		}
	}

	// 3. Fallback: Polyhedron (Mindset / Architecture of thought)
	if (!matchedItem) {
		matchedItem = DIAGRAM_REGISTRY['polyhedron'] || {
			id: 'polyhedron',
			name: 'Dan Koe Polyhedron',
			title: 'ARCHITECT OF REALITY',
			tag: '[ MENTAL GEOMETRY ]',
			nodes: ['01. PERSPECTIVE', '02. FRAMEWORK', '03. CONVERGENCE', '04. ASCENT'],
			renderSVG: (acc, title) => `
  <polygon points="350,90 480,180 430,310 270,310 220,180" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="205" r="40" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />
  <circle cx="350" cy="205" r="6" fill="${acc}" />
  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		};
	}

	// Extract meaningful keywords from the actual text (filtering out fillers)
	const contentWords = words.filter(w => !STOP_WORDS.has(w.toLowerCase()) && w.length >= 3);
	const highlightCandidates = contentWords.filter(w => w.length >= 4);
	const highlightWord = highlightCandidates[0] || words[0] || 'Focus';

	const type = matchedItem.id;
	const title = matchedItem.title;
	const tag = matchedItem.tag;
	const nodes = matchedItem.nodes || ['01. FOUNDATION', '02. SYSTEM', '03. LEVERAGE', '04. MASTERY'];
	const themeColor = matchedItem.themeColor || '#F59E0B';
	const finalAccent = (accentColor === 'auto' || !accentColor) ? themeColor : accentColor;

	// Generate complete SVG representation
	const svg = generateDanKoeSVG({ type, title, tag, nodes, highlightWord, themeColor }, finalAccent, 700, 440);

	return {
		type,
		title,
		tag,
		nodes,
		highlightWord,
		themeColor,
		svg
	};
}

/**
 * Generate full SVG string from diagram specification
 */
export function generateDanKoeSVG(diagramData, accentColor = '#F59E0B', width = 700, height = 440) {
	const type = diagramData?.type || 'polyhedron';
	const title = sanitize(diagramData?.title || 'MINIMALIST GLYPH');
	const nodes = diagramData?.nodes || [];
	const registered = DIAGRAM_REGISTRY[type];
	const acc = (accentColor === 'auto' || !accentColor) ? (diagramData?.themeColor || registered?.themeColor || '#F59E0B') : accentColor;

	let svgBody = '';

	if (registered && typeof registered.renderSVG === 'function') {
		svgBody = registered.renderSVG(acc, title, nodes);
	} else {
		// Generic Safe Fallback
		svgBody = `
  <polygon points="350,90 480,180 430,310 270,310 220,180" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="205" r="40" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />
  <circle cx="350" cy="205" r="6" fill="${acc}" />
  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`;
	}

	return `<svg width="${width}" height="${height}" viewBox="0 0 700 440" xmlns="http://www.w3.org/2000/svg">
${svgBody}
</svg>`;
}

/**
 * Split sentence into clean, consistent 1-line beats (max ~30-34 chars)
 * Ensures consistent font sizes across all scenes without shrinking or clipping.
 */
export function splitSentenceIntoConsistentBeats(text, maxChars = 44) {
	if (!text) return [];
	const clean = text.trim().replace(/^["'\s]+|["'\s]+$/g, '');
	if (clean.length <= maxChars) return [clean];

	// 1. Try splitting by punctuation marks: comma, semicolon, dash, ellipsis
	const punctParts = clean.split(/(?<=[,;—–]|\.\.\.)\s+/).filter(Boolean);
	if (punctParts.length > 1) {
		const result = [];
		for (const p of punctParts) {
			result.push(...splitSentenceIntoConsistentBeats(p, maxChars));
		}
		return result;
	}

	// 2. Try splitting by natural conjunctions (dan, serta, tetapi, namun, karena, dll)
	const conjRegex = /\s+(dan|serta|tetapi|namun|karena|jika|agar|sehingga|saat|tanpa|untuk|dengan|yang|and|but|with|from|that|this)\s+/i;
	const matchConj = clean.match(conjRegex);
	if (matchConj && matchConj.index >= 12 && (clean.length - matchConj.index) >= 12) {
		const part1 = clean.slice(0, matchConj.index).trim();
		const part2 = clean.slice(matchConj.index).trim();
		return [
			...splitSentenceIntoConsistentBeats(part1, maxChars),
			...splitSentenceIntoConsistentBeats(part2, maxChars)
		];
	}

	// 3. Fallback: chunk by words with balanced length so no orphan single words
	const words = clean.split(/\s+/).filter(Boolean);
	if (words.length <= 1) return [clean];

	const numChunks = Math.ceil(clean.length / maxChars);
	const targetWordsPerChunk = Math.ceil(words.length / numChunks);
	const chunks = [];
	let currWords = [];

	for (let i = 0; i < words.length; i++) {
		const w = words[i];
		const testStr = [...currWords, w].join(' ');
		const remainingWords = words.length - i;
		const remainingChunks = numChunks - chunks.length;

		if (currWords.length > 0 && (testStr.length > maxChars || (currWords.length >= targetWordsPerChunk && remainingWords >= remainingChunks))) {
			chunks.push(currWords.join(' '));
			currWords = [w];
		} else {
			currWords.push(w);
		}
	}
	if (currWords.length > 0) chunks.push(currWords.join(' '));
	return chunks;
}

/**
 * Split narrative script into punchy Dan Koe sentences/beats
 * Automatically ensures every beat fits on 1 single line with consistent font size!
 */
export function splitTextIntoDanKoeBeats(text, maxChars = 44) {
	if (!text) return [];
	const rawSentences = text
		.split(/(?<=[.!?])\s+|\n+/)
		.map(s => s.trim().replace(/^["'\s]+|["'\s]+$/g, ''))
		.filter(s => s.length > 1);

	const beats = [];
	for (const sent of rawSentences) {
		const subBeats = splitSentenceIntoConsistentBeats(sent, maxChars);
		beats.push(...subBeats);
	}
	return beats.filter(b => b.trim().length > 0);
}

/**
 * Analyze multi-phase vector transitions within a single sentence
 * (e.g. "Olahraga membangun tubuh... dan disiplin pikiran" -> barbell then brain)
 */
export function analyzeSentencePhases(sentence, accentColor = '#F59E0B') {
	const text = (sentence || '').trim();
	const words = text.split(/\s+/).filter(Boolean);
	if (words.length <= 4) {
		const diag = analyzeNarrationToDiagram(text, accentColor);
		return [{
			text,
			startWord: 0,
			endWord: words.length,
			diagramData: diag,
			svg: diag.svg,
			type: diag.type
		}];
	}

	const matchComma = text.match(/^(.*?)[,;]\s*(.*)$/);
	const matchDan = text.match(/^(.*?)\s+(?:dan|tetapi|namun|sementara|sedangkan|while|and|but)\s+(.*)$/i);

	let part1 = '';
	let part2 = '';
	let splitIdx = Math.floor(words.length / 2);

	if (matchComma && matchComma[1].split(/\s+/).length >= 2 && matchComma[2].split(/\s+/).length >= 2) {
		part1 = matchComma[1].trim();
		part2 = matchComma[2].trim();
		splitIdx = part1.split(/\s+/).length;
	} else if (matchDan && matchDan[1].split(/\s+/).length >= 2 && matchDan[2].split(/\s+/).length >= 2) {
		part1 = matchDan[1].trim();
		part2 = matchDan[2].trim();
		splitIdx = part1.split(/\s+/).length;
	} else {
		part1 = words.slice(0, splitIdx).join(' ');
		part2 = words.slice(splitIdx).join(' ');
	}

	const diag1 = analyzeNarrationToDiagram(part1, accentColor);
	const diag2 = analyzeNarrationToDiagram(part2, accentColor);

	return [
		{
			text: part1,
			startWord: 0,
			endWord: splitIdx,
			diagramData: diag1,
			svg: diag1.svg,
			type: diag1.type
		},
		{
			text: part2,
			startWord: splitIdx,
			endWord: words.length,
			diagramData: diag2,
			svg: diag2.svg,
			type: diag2.type
		}
	];
}

