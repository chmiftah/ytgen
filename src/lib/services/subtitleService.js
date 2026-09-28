export const CONNECTOR_WORDS = new Set([
	'dan', 'di', 'ke', 'dari', 'pada', 'untuk', 'yang', 'ini', 'itu', 'saat', 'kita', 'anda', 'bisa', 'ada',
	'tapi', 'namun', 'oleh', 'jika', 'agar', 'atau', 'jadi', 'kini', 'akan', 'juga', 'pun', 'tak', 'bukan', 'bagi',
	'and', 'the', 'to', 'in', 'of', 'for', 'with', 'on', 'at', 'by', 'as', 'is', 'it', 'a', 'an', 'but', 'how', 'why', 'what', 'so'
]);

export function isConnectorWord(word) {
	if (!word) return false;
	const clean = String(word).toLowerCase().replace(/[^a-z0-9]/g, '');
	return CONNECTOR_WORDS.has(clean) || clean.length <= 3;
}

/**
 * Dynamically resolves which word index in a chunk gets the secondary font (e.g. Playfair Display italic gold).
 * Checks for connector words anywhere in the chunk (line 1, 2, 3), and if none exist,
 * dynamically rotates across lines 1, 2, and 3.
 */
export function getSecondaryWordIndex(words, chunkIndex = 0) {
	if (!words || words.length === 0) return -1;
	const connectorIndices = [];
	for (let i = 0; i < words.length; i++) {
		const raw = typeof words[i] === 'string' ? words[i] : (words[i].word || '');
		if (isConnectorWord(raw)) {
			connectorIndices.push(i);
		}
	}
	if (connectorIndices.length > 0) {
		return connectorIndices[chunkIndex % connectorIndices.length];
	}
	const maxIndex = Math.min(words.length, 3);
	return chunkIndex % maxIndex;
}

/**
 * Groups words into lines based on wordsPerLine setting (1, 2, 3, or 'dynamic').
 * Supports connector word awareness where connector words can sit on their own line.
 */
export function groupWordsIntoLines(words, wordsPerLine = 2, connectorScale = false) {
	if (!words || words.length === 0) return [];

	if (wordsPerLine === 1 || wordsPerLine === '1') {
		return words.map((w, idx) => ({
			lineIndex: idx,
			startIdx: idx,
			words: [w]
		}));
	}

	if (wordsPerLine === 'dynamic') {
		const lines = [];
		let curLine = [];
		let startIdx = 0;
		for (let i = 0; i < words.length; i++) {
			const item = words[i];
			const rawText = typeof item === 'string' ? item : (item.word || '');
			const isConn = item.isConnector || (connectorScale && isConnectorWord(rawText));

			// If connector word in dual-font mode, let it be solitary if line already has content,
			// or start its own line
			if (connectorScale && isConn) {
				if (curLine.length > 0) {
					lines.push({ lineIndex: lines.length, startIdx, words: curLine });
					startIdx = i;
					curLine = [];
				}
				lines.push({ lineIndex: lines.length, startIdx: i, words: [item] });
				startIdx = i + 1;
				continue;
			}

			curLine.push(item);
			if (curLine.length >= 2) {
				lines.push({ lineIndex: lines.length, startIdx, words: curLine });
				startIdx = i + 1;
				curLine = [];
			}
		}
		if (curLine.length > 0) {
			lines.push({ lineIndex: lines.length, startIdx, words: curLine });
		}
		return lines;
	}

	const maxCount = Math.max(1, Math.min(4, Number(wordsPerLine) || 2));
	const lines = [];
	for (let i = 0; i < words.length; i += maxCount) {
		lines.push({
			lineIndex: lines.length,
			startIdx: i,
			words: words.slice(i, i + maxCount)
		});
	}
	return lines;
}

export function applyAutoRhythm(scenes) {
	if (!scenes || !Array.isArray(scenes)) return scenes;
	return scenes.map((scene, idx) => {
		const isBlackout = Boolean(scene.isBlackout || scene.quoteMode || (scene.footage?.videoUrl || '').includes('color=c=black'));
		if (isBlackout) {
			return {
				...scene,
				showSubtitle: true,
				subtitlePos: 'center'
			};
		}
		const rhythmStep = idx % 4;
		if (rhythmStep === 2) {
			// Breathing scene: clean footage, no subtitle
			return {
				...scene,
				showSubtitle: false,
				subtitlePos: (idx % 2 === 0) ? 'wolf-left' : 'wolf-right'
			};
		}
		const pos = (idx % 2 === 0) ? 'wolf-left' : 'wolf-right';
		return {
			...scene,
			showSubtitle: true,
			subtitlePos: pos
		};
	});
}

export const SUBTITLE_STYLES = {
	wolf_stack: {
		id: 'wolf_stack',
		name: '🐺 Wolf Stack Dual-Font (Belfort)',
		fontFamily: "'Outfit', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Arial Black', sans-serif",
		fontFamilySecondary: "'Playfair Display', Georgia, serif",
		fontSize: 54,
		fontWeight: 900,
		textTransform: 'lowercase',
		primaryColor: '#FFFFFF',
		secondaryColor: '#F59E0B',
		highlightColor: '#FBBF24',
		highlightGlow: '0 4px 20px rgba(0, 0, 0, 0.95), 0 0 25px rgba(245, 158, 11, 0.6)',
		textStroke: 'none',
		shadow: '0 4px 18px rgba(0, 0, 0, 0.95), 0 2px 4px rgba(0, 0, 0, 0.9)',
		backgroundColor: 'transparent',
		letterSpacing: '-0.05em',
		lineHeight: 0.88,
		stackWords: true,
		maxWordsPerLine: 1,
		connectorScale: true,
		chunkSize: 4,
		wordByWord: true
	},
	cinema_essay: {
		id: 'cinema_essay',
		name: 'Cinema Essay (Good Will)',
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		fontSize: 34,
		fontWeight: 700,
		textTransform: 'lowercase',
		primaryColor: '#FFFFFF',
		highlightColor: '#FFFFFF',
		highlightGlow: '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 25px rgba(0, 0, 0, 0.75)',
		textStroke: 'none',
		shadow: '0 2px 12px rgba(0, 0, 0, 0.95), 0 4px 20px rgba(0, 0, 0, 0.8)',
		backgroundColor: 'transparent',
		letterSpacing: '-0.025em',
		lineHeight: 1.18,
		maxWordsPerLine: 2,
		chunkSize: 4,
		wordByWord: true
	},
	hormozi: {
		id: 'hormozi',
		name: 'Hormozi / Viral Pop',
		fontFamily: "'Outfit', 'Montserrat', sans-serif",
		fontSize: 38,
		fontWeight: 900,
		textTransform: 'uppercase',
		primaryColor: '#FFFFFF',
		highlightColor: '#FACC15',
		highlightGlow: '0 0 25px rgba(250, 204, 21, 0.8)',
		textStroke: '3px #000000',
		shadow: '0 4px 12px rgba(0, 0, 0, 0.9)',
		backgroundColor: 'transparent',
		chunkSize: 4
	},
	cinematic: {
		id: 'cinematic',
		name: 'Cinematic Documentary',
		fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
		fontSize: 28,
		fontWeight: 500,
		textTransform: 'none',
		primaryColor: '#F8FAFC',
		highlightColor: '#F59E0B',
		highlightGlow: '0 2px 14px rgba(245, 158, 11, 0.4)',
		textStroke: 'none',
		shadow: '0 4px 18px rgba(0, 0, 0, 0.95)',
		backgroundColor: 'transparent',
		chunkSize: 6
	},
	cyberpunk: {
		id: 'cyberpunk',
		name: 'Neon Cyberpunk',
		fontFamily: "'Montserrat', sans-serif",
		fontSize: 34,
		fontWeight: 800,
		textTransform: 'uppercase',
		primaryColor: '#E2E8F0',
		highlightColor: '#06B6D4',
		highlightGlow: '0 0 20px rgba(6, 182, 212, 0.9)',
		textStroke: '2px #0f172a',
		shadow: '0 0 15px rgba(6, 182, 212, 0.4)',
		backgroundColor: 'rgba(15, 23, 42, 0.6)',
		chunkSize: 4
	},
	minimal: {
		id: 'minimal',
		name: 'Clean Minimal',
		fontFamily: "'Inter', sans-serif",
		fontSize: 28,
		fontWeight: 500,
		textTransform: 'none',
		primaryColor: '#FFFFFF',
		highlightColor: '#4ADE80',
		highlightGlow: 'none',
		textStroke: 'none',
		shadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
		backgroundColor: 'transparent',
		chunkSize: 6
	}
};

export const SUBTITLE_POSITIONS = {
	'smart-flow': { id: 'smart-flow', name: '🎲 Smart Flow (Otomatis Kiri, Kanan & Hening)', assAlignment: 7, assMarginV: 330, assMarginL: 150, css: 'top:30%;' },
	'wolf-left': { id: 'wolf-left', name: '🐺 Wolf Mid-Left (Samping Karakter)', assAlignment: 7, assMarginV: 330, assMarginL: 150, css: 'top:30%;left:8%;right:auto;justify-content:flex-start;' },
	'wolf-right': { id: 'wolf-right', name: '🐺 Wolf Mid-Right (Samping Karakter)', assAlignment: 9, assMarginV: 330, assMarginR: 150, css: 'top:30%;right:8%;left:auto;justify-content:flex-end;' },
	'wolf-split': { id: 'wolf-split', name: '🐺 Wolf 2 Sisi (Kiri-Kanan Mid)', assAlignment: 7, assMarginV: 330, assMarginL: 150, assMarginR: 150, css: 'top:30%;' },
	'bottom-center': { id: 'bottom-center', name: 'Bawah Tengah', assAlignment: 2, assMarginV: 90, css: 'bottom:10%;left:0;right:0;justify-content:center;' },
	'cinema-split': { id: 'cinema-split', name: '🎬 Cinema 2 Sisi (Kiri-Kanan)', assAlignment: 1, assMarginV: 180, assMarginL: 140, assMarginR: 140, css: 'bottom:22%;' },
	'cinema-left': { id: 'cinema-left', name: 'Kiri Cinema (Mid-Left)', assAlignment: 1, assMarginV: 180, assMarginL: 140, css: 'bottom:22%;left:10%;right:auto;justify-content:flex-start;' },
	'cinema-right': { id: 'cinema-right', name: 'Kanan Cinema (Mid-Right)', assAlignment: 3, assMarginV: 180, assMarginR: 140, css: 'bottom:22%;right:10%;left:auto;justify-content:flex-end;' },
	'top-center': { id: 'top-center', name: 'Atas Tengah', assAlignment: 8, assMarginV: 40, css: 'top:8%;left:0;right:0;justify-content:center;' },
	'bottom-left': { id: 'bottom-left', name: 'Kiri Bawah', assAlignment: 1, assMarginV: 90, css: 'bottom:10%;left:5%;right:auto;justify-content:flex-start;' },
	'bottom-right': { id: 'bottom-right', name: 'Kanan Bawah', assAlignment: 3, assMarginV: 90, css: 'bottom:10%;right:5%;left:auto;justify-content:flex-end;' }
};

export const SUBTITLE_DECORS = {
	none: { id: 'none', name: 'Polos', cssClass: '' },
	quote: { id: 'quote', name: 'Quote Tengah “ ”', cssClass: 'decor-quote' },
	side: { id: 'side', name: 'Side Accent │', cssClass: 'decor-side' }
};

export const QUOTE_DECORATIONS = SUBTITLE_DECORS;

export function calculateAudioSyncedWordTimings(words, totalDuration, options = {}) {
	if (!words || words.length === 0) return [];
	const isChapterScene = Boolean(options.isChapterScene);
	const chapterPause = Number(options.chapterPause ?? 5);
	const timingOffset = Number(options.timingOffset) || 0;
	let startBound = typeof options.speechStart === 'number' ? Math.max(0, options.speechStart) : isChapterScene ? 2.6 + chapterPause : 0.12;
	let endBound = typeof options.speechEnd === 'number' ? Math.min(totalDuration, options.speechEnd) : Math.max(startBound + 0.5, totalDuration - 0.15);
	startBound = Math.max(0, startBound + timingOffset);
	endBound = Math.max(startBound + 0.4, Math.min(totalDuration, endBound + timingOffset));
	const speechSpan = Math.max(0.4, endBound - startBound);
	const weights = words.map((w) => {
		const clean = w.replace(/[^a-zA-Z0-9]/g, '');
		let wt = Math.max(2, clean.length);
		if (/[.,!?;:]$/.test(w)) wt += 2.8;
		return wt;
	});
	const totalWeight = weights.reduce((sum, val) => sum + val, 0);
	let currentCursor = startBound;
	return words.map((word, idx) => {
		const wordDuration = (weights[idx] / totalWeight) * speechSpan;
		const start = Number(currentCursor.toFixed(2));
		const end = Number((currentCursor + wordDuration).toFixed(2));
		currentCursor += wordDuration;
		return { word, start, end };
	});
}

export function generateSyntheticWordTimings(words, totalDuration, isChapterScene = false, chapterPause = 5) {
	return calculateAudioSyncedWordTimings(words, totalDuration, { isChapterScene, chapterPause });
}

export function applyTimingOffsetToWords(wordTimings, offsetSec, maxDuration = 9999) {
	if (!wordTimings || wordTimings.length === 0) return [];
	const offset = Number(offsetSec) || 0;
	return wordTimings.map((wt) => {
		const start = Math.max(0, Number((wt.start + offset).toFixed(2)));
		const end = Math.min(maxDuration, Math.max(start + 0.1, Number((wt.end + offset).toFixed(2))));
		return { ...wt, start, end };
	});
}

export function alignElevenLabsTimestamps(text, alignment) {
	if (!alignment || !alignment.characters || !alignment.character_start_times_seconds) {
		const words = text.split(/\s+/).filter(Boolean);
		return generateSyntheticWordTimings(words, 5);
	}
	const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
	const words = [];
	let currentWord = '';
	let wordStart = null;
	let wordEnd = null;
	for (let i = 0; i < characters.length; i++) {
		const char = characters[i];
		const start = character_start_times_seconds[i];
		const end = character_end_times_seconds[i];
		if (/\s/.test(char)) {
			if (currentWord.length > 0) {
				words.push({ word: currentWord, start: Number(wordStart.toFixed(2)), end: Number((wordEnd || end).toFixed(2)) });
				currentWord = '';
				wordStart = null;
				wordEnd = null;
			}
		} else {
			if (wordStart === null) wordStart = start;
			wordEnd = end;
			currentWord += char;
		}
	}
	if (currentWord.length > 0) {
		words.push({ word: currentWord, start: Number((wordStart ?? 0).toFixed(2)), end: Number((wordEnd ?? 0).toFixed(2)) });
	}
	return words;
}

/**
 * Natural phrase chunker for cinematic subtitles (approx 5-6 words per line, breaking at natural punctuation)
 */
export function chunkIntoCinematicLines(wordTimings, maxWords = 6) {
	if (!wordTimings || wordTimings.length === 0) return [];
	const lines = [];
	let currentLine = [];
	
	for (let i = 0; i < wordTimings.length; i++) {
		const item = wordTimings[i];
		currentLine.push(item);
		const wordText = item.word ? item.word.trim() : '';
		const hasPunctuation = /[,.!?;:—"]$/.test(wordText);
		const remaining = wordTimings.length - (i + 1);

		if (
			currentLine.length >= maxWords ||
			(hasPunctuation && currentLine.length >= 3 && remaining >= 2) ||
			remaining === 0
		) {
			lines.push({
				index: lines.length,
				words: [...currentLine],
				text: currentLine.map((w) => w.word).join(' '),
				start: currentLine[0].start,
				end: currentLine[currentLine.length - 1].end
			});
			currentLine = [];
		}
	}
	if (currentLine.length > 0) {
		if (lines.length > 0 && currentLine.length <= 2) {
			const last = lines[lines.length - 1];
			last.words.push(...currentLine);
			last.text = last.words.map((w) => w.word).join(' ');
			last.end = currentLine[currentLine.length - 1].end;
		} else {
			lines.push({
				index: lines.length,
				words: [...currentLine],
				text: currentLine.map((w) => w.word).join(' '),
				start: currentLine[0].start,
				end: currentLine[currentLine.length - 1].end
			});
		}
	}
	if (lines.length > 0) {
		lines[0].isFirst = true;
		lines[lines.length - 1].isLast = true;
	}
	return lines;
}

export function getActiveSubtitleWindow(wordTimings, sceneCurrentTime, chunkSize = 4, karaokeEnabled = true, options = {}) {
	if (typeof chunkSize === 'object' && chunkSize !== null) {
		options = chunkSize;
		chunkSize = options.chunkSize || 4;
		karaokeEnabled = options.karaokeEnabled !== undefined ? options.karaokeEnabled : true;
	}
	if (!wordTimings || wordTimings.length === 0) return { words: [], lines: [], activeIndex: -1, chunkIndex: 0, isRevealed: false, isLeft: true };

	const animation = options.animation || options.subtitleAnimation || (options.wordByWord ? 'word_by_word' : (karaokeEnabled ? 'word_by_word' : 'static'));
	const isWordByWord = animation === 'word_by_word' || options.wordByWord === true;

	if (sceneCurrentTime < wordTimings[0].start) {
		// When previewing or paused at the beginning, render the first chunk with styling so preview is never blank
		if (options.previewAtStart || options.isPlaying === false || sceneCurrentTime <= 0.05) {
			const endIdx = Math.min(chunkSize, wordTimings.length);
			const chunkWords = wordTimings.slice(0, endIdx);
			const secondaryIdx = getSecondaryWordIndex(chunkWords, 0);
			const windowWords = chunkWords.map((w, idx) => ({
				...w,
				isHighlighted: idx === 0,
				isRevealed: true,
				isLatest: idx === 0,
				isConnector: idx === secondaryIdx
			}));
			const wordsPerLineSetting = options.wordsPerLine !== undefined
				? options.wordsPerLine
				: (options.maxWordsPerLine !== undefined ? options.maxWordsPerLine : 2);
			const connectorScale = options.connectorScale !== undefined ? options.connectorScale : true;
			const lines = groupWordsIntoLines(windowWords, wordsPerLineSetting, connectorScale);
			return {
				words: windowWords,
				lines,
				activeIndex: 0,
				chunkIndex: 0,
				isRevealed: true,
				isLeft: true
			};
		}

		if (isWordByWord) {
			return { words: [], lines: [], activeIndex: -1, chunkIndex: 0, isRevealed: false, isLeft: true };
		}
		const endIdx = Math.min(chunkSize, wordTimings.length);
		const chunkWords = wordTimings.slice(0, endIdx);
		const secondaryIdx = getSecondaryWordIndex(chunkWords, 0);
		const windowWords = chunkWords.map((w, idx) => ({
			...w,
			isHighlighted: false,
			isRevealed: true,
			isLatest: false,
			isConnector: idx === secondaryIdx
		}));
		const wordsPerLineSetting = options.wordsPerLine !== undefined
			? options.wordsPerLine
			: (options.maxWordsPerLine !== undefined ? options.maxWordsPerLine : 2);
		const connectorScale = options.connectorScale !== undefined ? options.connectorScale : true;
		const lines = groupWordsIntoLines(windowWords, wordsPerLineSetting, connectorScale);
		return {
			words: windowWords,
			lines,
			activeIndex: -1,
			chunkIndex: 0,
			isRevealed: false,
			isLeft: true
		};
	}

	let activeIndex = wordTimings.findIndex((w) => sceneCurrentTime >= w.start && sceneCurrentTime <= w.end);
	let isInsideWord = activeIndex !== -1;
	if (activeIndex === -1) {
		for (let i = wordTimings.length - 1; i >= 0; i--) {
			if (sceneCurrentTime >= wordTimings[i].start) { activeIndex = i; break; }
		}
		if (activeIndex === -1) activeIndex = 0;
	}

	const chunkIndex = Math.floor(activeIndex / chunkSize);
	const startIdx = chunkIndex * chunkSize;
	const endIdx = Math.min(startIdx + chunkSize, wordTimings.length);
	const activeInChunk = activeIndex - startIdx;
	const chunkWords = wordTimings.slice(startIdx, endIdx);

	const lastWord = chunkWords[chunkWords.length - 1];
	const nextWord = wordTimings[endIdx];
	const chunkHoldEnd = nextWord ? nextWord.start : (lastWord ? lastWord.end + 0.45 : sceneCurrentTime + 1);

	if (sceneCurrentTime > chunkHoldEnd && nextWord && (nextWord.start - lastWord.end) > 0.6) {
		return { words: [], lines: [], activeIndex: -1, chunkIndex, isRevealed: false, isLeft: chunkIndex % 2 === 0 };
	}

	const secondaryIdx = getSecondaryWordIndex(chunkWords, chunkIndex);
	let windowWords;
	if (isWordByWord) {
		// Progressive reveal word by word: only show words up to activeInChunk!
		windowWords = chunkWords.slice(0, activeInChunk + 1).map((w, idx) => ({
			...w,
			isHighlighted: idx === activeInChunk,
			isRevealed: true,
			isLatest: idx === activeInChunk,
			isConnector: idx === secondaryIdx
		}));
	} else if (animation === 'karaoke') {
		windowWords = chunkWords.map((w, idx) => ({
			...w,
			isHighlighted: isInsideWord && idx === activeInChunk,
			isRevealed: true,
			isLatest: idx === activeInChunk,
			isConnector: idx === secondaryIdx
		}));
	} else {
		windowWords = chunkWords.map((w, idx) => ({
			...w,
			isHighlighted: false,
			isRevealed: true,
			isLatest: false,
			isConnector: idx === secondaryIdx
		}));
	}

	const wordsPerLineSetting = options.wordsPerLine !== undefined
		? options.wordsPerLine
		: (options.maxWordsPerLine !== undefined ? options.maxWordsPerLine : 2);
	const connectorScale = options.connectorScale !== undefined ? options.connectorScale : true;
	const lines = groupWordsIntoLines(windowWords, wordsPerLineSetting, connectorScale);

	return {
		words: windowWords,
		lines,
		activeIndex: activeInChunk,
		chunkIndex,
		isLeft: chunkIndex % 2 === 0
	};
}

function formatSRTTime(seconds) {
	const pad = (n, z = 2) => String(Math.floor(n)).padStart(z, '0');
	const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
	const s = seconds % 60;
	const m = (seconds / 60) % 60;
	const h = seconds / 3600;
	return `${pad(h)}:${pad(m)}:${pad(s)},${ms}`;
}

function formatVTTTime(seconds) {
	return formatSRTTime(seconds).replace(',', '.');
}

export function exportToSRT(scenes) {
	let srt = '';
	let counter = 1;
	let cumulativeTime = 0;
	for (const scene of scenes) {
		const timings = scene.wordTimings && scene.wordTimings.length > 0 ? scene.wordTimings : generateSyntheticWordTimings(scene.words, scene.audioDuration || scene.estimatedDuration);
		const chunkSize = 5;
		for (let i = 0; i < timings.length; i += chunkSize) {
			const chunk = timings.slice(i, i + chunkSize);
			const chunkStart = cumulativeTime + chunk[0].start;
			const chunkEnd = cumulativeTime + chunk[chunk.length - 1].end;
			const text = chunk.map((c) => c.word).join(' ');
			srt += `${counter}\n`;
			srt += `${formatSRTTime(chunkStart)} --> ${formatSRTTime(chunkEnd)}\n`;
			srt += `${text}\n\n`;
			counter++;
		}
		cumulativeTime += scene.audioDuration || scene.estimatedDuration || 5;
	}
	return srt.trim();
}

export function exportToVTT(scenes) {
	const srt = exportToSRT(scenes);
	return `WEBVTT - Generated by YouTube Long Studio\n\n` + srt.replace(/,/g, '.');
}

export function exportToASS(scenes, styleKey = 'hormozi', options = {}) {
	const style = SUBTITLE_STYLES[styleKey] || SUBTITLE_STYLES.hormozi;
	const karaokeEnabled = options.karaokeEnabled !== false;
	const customFontSize = options.fontSize || style.fontSize || 34;
	const assFontSize = Math.round(customFontSize * 1.85);
	const positionKey = options.position || options.subtitlePosition || 'bottom-center';
	const decorKey = options.decor || options.quoteDecoration || 'none';
	const pos = SUBTITLE_POSITIONS[positionKey] || SUBTITLE_POSITIONS['bottom-center'];
	const decor = SUBTITLE_DECORS[decorKey] || SUBTITLE_DECORS.none;
	const isQuote = decor.id === 'quote';
	const isSide = decor.id === 'side';
	const animation = options.subtitleAnimation || options.animation || (style.wordByWord ? 'word_by_word' : (karaokeEnabled ? 'karaoke' : 'static'));
	const isWordByWord = animation === 'word_by_word';
	const isCinemaSplit = positionKey === 'cinema-split';

	let alignment = pos.assAlignment;
	let marginV = pos.assMarginV;
	if (isQuote) { alignment = 5; marginV = 0; }
	function hexToAssBgr(hex) {
		if (!hex || hex === 'transparent') return 'FFFFFF';
		const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
		if (!m) return 'FFFFFF';
		const h = m[1];
		return h.slice(4, 6) + h.slice(2, 4) + h.slice(0, 2);
	}
	function assColor(hex, alpha = '00') {
		return `&H${alpha}${hexToAssBgr(hex)}`;
	}
	function parseOutlinePx(s) {
		if (!s || s === 'none') return 0;
		const m = s.match(/([\d.]+)px/);
		return m ? Math.round(Number(m[1])) : 0;
	}
	const primaryBgr = hexToAssBgr(style.primaryColor);
	const highlightBgr = hexToAssBgr(style.highlightColor);
	const outlineColor = (() => {
		const m = style.textStroke && style.textStroke.match(/#[0-9a-fA-F]{6}/);
		return m ? assColor(m[0]) : '&H00000000';
	})();
	const backColor = (() => {
		if (!style.backgroundColor || style.backgroundColor === 'transparent') return '&H00000000';
		const rgba = style.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
		if (rgba) {
			const alpha = Math.round((1 - Number(rgba[4])) * 255).toString(16).padStart(2, '0').toUpperCase();
			const bgr = Number(rgba[3]).toString(16).padStart(2, '0') + Number(rgba[2]).toString(16).padStart(2, '0') + Number(rgba[1]).toString(16).padStart(2, '0');
			return `&H${alpha}${bgr}`.toUpperCase();
		}
		const hex = style.backgroundColor.match(/#[0-9a-fA-F]{6}/);
		if (hex) return assColor(hex[0], '90');
		return '&H90000000';
	})();
	const outlinePx = parseOutlinePx(style.textStroke) || (style.textStroke === 'none' ? 0 : 2);
	const shadowPx = !style.shadow || style.shadow === 'none' ? 0 : 2;
	const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || 'Outfit';
	const boldFlag = style.fontWeight >= 700 ? -1 : 0;
	let ass = `[Script Info]
Title: YouTube Long Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${assFontSize},&H00${primaryBgr},&H000000FF,${outlineColor},${backColor},${boldFlag},0,0,0,100,100,0,0,1,${outlinePx},${shadowPx},${alignment},40,40,${marginV},1
Style: DefaultLeft,${fontName},${assFontSize},&H00${primaryBgr},&H000000FF,${outlineColor},${backColor},${boldFlag},0,0,0,100,100,0,0,1,${outlinePx},${shadowPx},1,160,40,${pos.assMarginV || 180},1
Style: DefaultRight,${fontName},${assFontSize},&H00${primaryBgr},&H000000FF,${outlineColor},${backColor},${boldFlag},0,0,0,100,100,0,0,1,${outlinePx},${shadowPx},3,40,160,${pos.assMarginV || 180},1
Style: DefaultTopLeft,${fontName},${assFontSize},&H00${primaryBgr},&H000000FF,${outlineColor},${backColor},${boldFlag},0,0,0,100,100,0,0,1,${outlinePx},${shadowPx},7,160,40,${pos.assMarginV || 330},1
Style: DefaultTopRight,${fontName},${assFontSize},&H00${primaryBgr},&H000000FF,${outlineColor},${backColor},${boldFlag},0,0,0,100,100,0,0,1,${outlinePx},${shadowPx},9,40,160,${pos.assMarginV || 330},1
Style: CenterQuote,Playfair Display,36,&H00F8FAFC,&H000000FF,&H00000000,&H90000000,0,1,0,0,100,100,1,0,1,2,2,5,160,160,0,1
Style: Highlight,${fontName},${Math.round(assFontSize * 1.06)},&H00${highlightBgr},&H000000FF,${outlineColor},${backColor},${boldFlag},0,0,0,105,105,0,0,1,${Math.max(outlinePx, 2)},${Math.max(shadowPx, 2)},${alignment},40,40,${marginV},1
Style: ChapterTag,Outfit,28,&H0010B981,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,2,0,1,3,2,5,0,0,0,1
Style: ChapterTitle,Outfit,56,&H00FFFFFF,&H000000FF,&H00000000,&H90000000,-1,0,0,0,100,100,1,0,1,4,3,5,0,0,0,1
Style: ChapterSub,Outfit,26,&H00D1D5DB,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
	let cumulativeTime = 0;
	let globalChunkCounter = 0;
	const formatASSTime = (sec) => {
		const pad = (n, z = 2) => String(Math.floor(n)).padStart(z, '0');
		const cs = String(Math.floor((sec % 1) * 100)).padStart(2, '0');
		const s = sec % 60;
		const m = (sec / 60) % 60;
		const h = sec / 3600;
		return `${pad(h)}:${pad(m)}:${pad(s)}.${cs}`;
	};
	for (let sceneIdx = 0; sceneIdx < scenes.length; sceneIdx++) {
		const scene = scenes[sceneIdx];
		const sceneDuration = scene.audioDuration || scene.estimatedDuration || 5;
		const isSceneBlackout = Boolean(scene.isBlackout || scene.quoteMode || (scene.footage?.videoUrl || '').includes('color=c=black'));

		// Subtitle explicitly turned OFF for this scene
		if (scene.showSubtitle === false) {
			cumulativeTime += sceneDuration;
			continue;
		}

		// Smart Flow automated dynamic breathing scene (skip subtitle if user hasn't explicitly set showSubtitle: true)
		if (positionKey === 'smart-flow' && scene.showSubtitle === undefined && (sceneIdx % 5 === 2) && !isSceneBlackout && !scene.chapter) {
			cumulativeTime += sceneDuration;
			continue;
		}

		const isRealChapter = Boolean(scene.chapter && !scene.chapter.isHook && scene.chapter.tag !== 'HOOK');
		let chapterCardDuration = 0;
		if (isRealChapter) {
			const pause = Number(scene.chapter.pauseDuration ?? 5);
			chapterCardDuration = 2.6 + pause;
			const chStart = cumulativeTime;
			const chEnd = cumulativeTime + Math.min(chapterCardDuration, sceneDuration);
			const rawTag = scene.chapter.tag !== undefined && scene.chapter.tag !== null ? String(scene.chapter.tag).trim() : '';
			const chTitle = (scene.chapter.title || '').toUpperCase();
			const chSub = scene.chapter.subtitle || '';
			if (rawTag) {
				ass += `Dialogue: 1,${formatASSTime(chStart)},${formatASSTime(chEnd)},ChapterTag,,0,0,0,,{\\fad(350,350)\\an5\\pos(960,450)}${rawTag}\n`;
				ass += `Dialogue: 1,${formatASSTime(chStart)},${formatASSTime(chEnd)},ChapterTitle,,0,0,0,,{\\fad(350,350)\\an5\\pos(960,520)}${chTitle}\n`;
			} else {
				ass += `Dialogue: 1,${formatASSTime(chStart)},${formatASSTime(chEnd)},ChapterTitle,,0,0,0,,{\\fad(350,350)\\an5\\pos(960,490)}${chTitle}\n`;
			}
			if (chSub) ass += `Dialogue: 1,${formatASSTime(chStart)},${formatASSTime(chEnd)},ChapterSub,,0,0,0,,{\\fad(350,350)\\an5\\pos(960,570)}${chSub}\n`;
		}


		const rawTimings = scene.wordTimings && scene.wordTimings.length > 0 ? scene.wordTimings : generateSyntheticWordTimings(scene.words, sceneDuration, isRealChapter, scene.chapter?.pauseDuration ?? 5);
		const timings = isRealChapter ? rawTimings.filter((t) => t.start >= chapterCardDuration - 0.3) : rawTimings;

		// Blank Quote scene: Render line-by-line timed cinematic dialogues with elegant serif typography
		if (isSceneBlackout) {
			const cinematicLines = chunkIntoCinematicLines(timings, 6);
			for (let li = 0; li < cinematicLines.length; li++) {
				const line = cinematicLines[li];
				const nextLine = cinematicLines[li + 1];
				const lineStart = cumulativeTime + line.start;
				const lineEnd = nextLine ? cumulativeTime + nextLine.start : cumulativeTime + line.end + 0.55;
				let lineText = line.text;
				if (line.isFirst) lineText = `“ ${lineText}`;
				if (line.isLast) lineText = `${lineText} ”`;
				ass += `Dialogue: 0,${formatASSTime(lineStart)},${formatASSTime(lineEnd)},CenterQuote,,0,0,0,,{\\fad(250,200)}${lineText}\n`;
			}
			cumulativeTime += sceneDuration;
			continue;
		}

		const chunkSize = style.chunkSize || 4;

		// Resolve effective position for this scene
		let effectiveScenePos = scene.subtitlePos || positionKey;
		if (positionKey === 'smart-flow' && !scene.subtitlePos) {
			if (isSceneBlackout) {
				effectiveScenePos = 'center';
			} else {
				effectiveScenePos = (sceneIdx % 2 === 0) ? 'wolf-left' : 'wolf-right';
			}
		}

		const formatWord = (w) => {
			if (style.textTransform === 'uppercase') return w.toUpperCase();
			if (style.textTransform === 'lowercase') return w.toLowerCase();
			return w;
		};

		const wordsPerLineConfig = options.wordsPerLine !== undefined
			? options.wordsPerLine
			: (options.maxWordsPerLine !== undefined ? options.maxWordsPerLine : (style.wordsPerLine || style.maxWordsPerLine || 2));

		const wrapTwoLines = (wordsArr, targetSecondaryIdx = -1) => {
			if (isSceneBlackout) {
				// Blank Quote: normal horizontal subtitle wrapping, never stacked 1 word per line!
				const maxWords = 8;
				if (wordsArr.length > maxWords) {
					const l1 = wordsArr.slice(0, maxWords).join(' ');
					const l2 = wordsArr.slice(maxWords).join(' ');
					return `${l1}\\N${l2}`;
				}
				return wordsArr.join(' ');
			}
			const formattedWords = wordsArr.map((w, idx) => {
				const isTagStr = typeof w === 'string' && w.includes('{\\');
				const rawClean = isTagStr ? w.replace(/\{[^}]+\}/g, '') : w;
				const formatted = isTagStr ? w : formatWord(w);
				const isSecondary = style.connectorScale && (idx === targetSecondaryIdx || (targetSecondaryIdx === -1 && isConnectorWord(rawClean)));
				if (isSecondary) {
					const secBgr = hexToAssBgr(style.secondaryColor || '#F59E0B');
					const fontSecondary = (style.fontFamilySecondary || 'Playfair Display').split(',')[0].replace(/['"]/g, '').trim();
					return `{\\fn${fontSecondary}\\i1\\c&H00${secBgr}&\\fs${Math.round(assFontSize * 0.58)}}${formatted}{\\fn${fontName}\\i0\\c&H00${primaryBgr}&\\fs${assFontSize}}`;
				}
				return formatted;
			});

			if (style.stackWords || style.maxWordsPerLine || wordsPerLineConfig) {
				const grouped = groupWordsIntoLines(
					formattedWords.map((fw, idx) => ({ word: fw, isConnector: idx === targetSecondaryIdx })),
					wordsPerLineConfig,
					style.connectorScale
				);
				return grouped.map((line) => line.words.map((w) => w.word).join(' ')).join('\\N');
			}
			if (style.maxWordsPerLine && wordsArr.length > style.maxWordsPerLine) {
				const line1 = wordsArr.slice(0, style.maxWordsPerLine).map(formatWord).join(' ');
				const line2 = wordsArr.slice(style.maxWordsPerLine).map(formatWord).join(' ');
				return `${line1}\\N${line2}`;
			}
			return formattedWords.join(' ');
		};

		for (let i = 0; i < timings.length; i += chunkSize) {
			const chunk = timings.slice(i, i + chunkSize);
			const secondaryIdxInChunk = getSecondaryWordIndex(chunk, globalChunkCounter);
			const isLeftChunk = globalChunkCounter % 2 === 0;
			let chunkAssStyle = 'Default';
			if (isSceneBlackout || effectiveScenePos === 'center') {
				chunkAssStyle = 'CenterQuote';
			} else if (effectiveScenePos === 'wolf-split') {
				chunkAssStyle = isLeftChunk ? 'DefaultTopLeft' : 'DefaultTopRight';
			} else if (effectiveScenePos === 'cinema-split') {
				chunkAssStyle = isLeftChunk ? 'DefaultLeft' : 'DefaultRight';
			} else if (effectiveScenePos === 'wolf-left') {
				chunkAssStyle = 'DefaultTopLeft';
			} else if (effectiveScenePos === 'wolf-right') {
				chunkAssStyle = 'DefaultTopRight';
			} else if (effectiveScenePos === 'cinema-left') {
				chunkAssStyle = 'DefaultLeft';
			} else if (effectiveScenePos === 'cinema-right') {
				chunkAssStyle = 'DefaultRight';
			} else if (effectiveScenePos === 'bottom-center') {
				chunkAssStyle = 'Default';
			}
			globalChunkCounter++;

			if (isSceneBlackout) {
				// Blank Quote: tampil panjang mengalir normal layaknya subtitle film, bukan word by word
				const chunkStart = cumulativeTime + chunk[0].start;
				const chunkEnd = cumulativeTime + chunk[chunk.length - 1].end + 0.35;
				let fullPhrase = wrapTwoLines(chunk.map((c) => c.word), secondaryIdxInChunk);
				fullPhrase = `“ ${fullPhrase} ”`;
				ass += `Dialogue: 0,${formatASSTime(chunkStart)},${formatASSTime(chunkEnd)},CenterQuote,,0,0,0,,${fullPhrase}\n`;
			} else if (isWordByWord) {
				for (let w = 0; w < chunk.length; w++) {
					const activeWord = chunk[w];
					const start = cumulativeTime + activeWord.start;
					const nextWord = chunk[w + 1];
					const nextChunkFirstWord = timings[i + chunkSize];
					let end;
					if (nextWord) {
						end = cumulativeTime + nextWord.start;
					} else if (nextChunkFirstWord) {
						end = Math.min(cumulativeTime + activeWord.end + 0.35, cumulativeTime + nextChunkFirstWord.start);
					} else {
						end = cumulativeTime + activeWord.end + 0.45;
					}
					if (end <= start) end = start + 0.2;

					const wordsSoFar = chunk.slice(0, w + 1).map(c => c.word);
					let formattedText = wrapTwoLines(wordsSoFar, secondaryIdxInChunk);

					if ((isQuote || isSceneBlackout) && w === 0) formattedText = `“ ${formattedText}`;
					if ((isQuote || isSceneBlackout) && w === chunk.length - 1) formattedText = `${formattedText} ”`;
					if (isSide) formattedText = `▌ ${formattedText}`;

					ass += `Dialogue: 0,${formatASSTime(start)},${formatASSTime(end)},${chunkAssStyle},,0,0,0,,${formattedText}\n`;
				}
			} else if (animation === 'karaoke') {
				for (let w = 0; w < chunk.length; w++) {
					const activeWord = chunk[w];
					const start = cumulativeTime + activeWord.start;
					const end = cumulativeTime + activeWord.end;
					let prefix = '';
					let suffix = '';
					if ((isQuote || isSceneBlackout) && w === 0) prefix = `{\\c&H808080&\\fs${Math.round(assFontSize * 0.9)}}“{\\c&H00${primaryBgr}&\\fs${assFontSize}} `;
					if ((isQuote || isSceneBlackout) && w === chunk.length - 1) suffix = ` {\\c&H808080&\\fs${Math.round(assFontSize * 0.9)}}”`;
					if (isSide && w === 0) prefix = `{\\c&H00${highlightBgr}&\\b1}▌{\\c&H00${primaryBgr}&\\b0} `;
					const wordsFormatted = chunk.map((c, cIdx) => {
						const wordStr = formatWord(c.word);
						if (cIdx === w) return `{\\c&H00${highlightBgr}&\\b1}${wordStr}{\\c&H00${primaryBgr}&\\b0}`;
						return wordStr;
					});
					let formattedText = wrapTwoLines(wordsFormatted, secondaryIdxInChunk);
					ass += `Dialogue: 0,${formatASSTime(start)},${formatASSTime(end)},${chunkAssStyle},,0,0,0,,${prefix}${formattedText}${suffix}\n`;
				}
			} else {
				const chunkStart = cumulativeTime + chunk[0].start;
				const chunkEnd = cumulativeTime + chunk[chunk.length - 1].end + 0.3;
				let fullPhrase = wrapTwoLines(chunk.map((c) => c.word), secondaryIdxInChunk);
				if (isQuote || isSceneBlackout) fullPhrase = `“ ${fullPhrase} ”`;
				if (isSide) fullPhrase = `▌ ${fullPhrase}`;
				ass += `Dialogue: 0,${formatASSTime(chunkStart)},${formatASSTime(chunkEnd)},${chunkAssStyle},,0,0,0,,${fullPhrase}\n`;
			}
		}
		cumulativeTime += sceneDuration;
	}
	return ass;
}

export function generateYouTubeTimestamps(scenes) {
	if (!scenes || scenes.length === 0) return '';
	const timestamps = [];
	let cumulativeTime = 0;
	for (let i = 0; i < scenes.length; i++) {
		const scene = scenes[i];
		if (scene.chapter || i === 0) {
			const totalSec = Math.floor(cumulativeTime);
			const minutes = Math.floor(totalSec / 60);
			const seconds = totalSec % 60;
			const timecode = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			let label = 'Bab 1: Pendahuluan';
			if (scene.chapter) label = `${scene.chapter.tag || 'Bab'}: ${scene.chapter.title}`;
			timestamps.push(`${timecode} - ${label}`);
		}
		cumulativeTime += scene.audioDuration || scene.estimatedDuration || 5;
	}
	return timestamps.join('\n');
}
