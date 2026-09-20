export const SUBTITLE_STYLES = {
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
		fontFamily: "'Inter', sans-serif",
		fontSize: 30,
		fontWeight: 600,
		textTransform: 'none',
		primaryColor: '#F8FAFC',
		highlightColor: '#38BDF8',
		highlightGlow: 'none',
		textStroke: 'none',
		shadow: '0 2px 6px rgba(0, 0, 0, 0.7)',
		backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
	'bottom-center': { id: 'bottom-center', name: 'Bawah Tengah', assAlignment: 2, assMarginV: 90, css: 'bottom:10%;left:0;right:0;justify-content:center;' },
	center: { id: 'center', name: 'Tengah (Quote)', assAlignment: 5, assMarginV: 0, css: 'top:0;bottom:0;left:0;right:0;justify-content:center;align-items:center;' },
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

export function getActiveSubtitleWindow(wordTimings, sceneCurrentTime, chunkSize = 4, karaokeEnabled = true) {
	if (!wordTimings || wordTimings.length === 0) return { words: [], activeIndex: -1 };
	if (sceneCurrentTime < wordTimings[0].start) {
		const endIdx = Math.min(chunkSize, wordTimings.length);
		return { words: wordTimings.slice(0, endIdx).map((w) => ({ ...w, isHighlighted: false })), activeIndex: -1 };
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
	const windowWords = wordTimings.slice(startIdx, endIdx).map((w, idx) => ({ ...w, isHighlighted: karaokeEnabled ? isInsideWord && startIdx + idx === activeIndex : false }));
	return { words: windowWords, activeIndex: karaokeEnabled && isInsideWord ? activeIndex - startIdx : -1 };
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
Style: Highlight,${fontName},${Math.round(assFontSize * 1.06)},&H00${highlightBgr},&H000000FF,${outlineColor},${backColor},${boldFlag},0,0,0,105,105,0,0,1,${Math.max(outlinePx, 2)},${Math.max(shadowPx, 2)},${alignment},40,40,${marginV},1
Style: ChapterTag,Outfit,28,&H0010B981,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,2,0,1,3,2,5,0,0,0,1
Style: ChapterTitle,Outfit,56,&H00FFFFFF,&H000000FF,&H00000000,&H90000000,-1,0,0,0,100,100,1,0,1,4,3,5,0,0,0,1
Style: ChapterSub,Outfit,26,&H00D1D5DB,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
	let cumulativeTime = 0;
	const formatASSTime = (sec) => {
		const pad = (n, z = 2) => String(Math.floor(n)).padStart(z, '0');
		const cs = String(Math.floor((sec % 1) * 100)).padStart(2, '0');
		const s = sec % 60;
		const m = (sec / 60) % 60;
		const h = sec / 3600;
		return `${pad(h)}:${pad(m)}:${pad(s)}.${cs}`;
	};
	for (const scene of scenes) {
		const sceneDuration = scene.audioDuration || scene.estimatedDuration || 5;
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
		const chunkSize = style.chunkSize || 4;
		for (let i = 0; i < timings.length; i += chunkSize) {
			const chunk = timings.slice(i, i + chunkSize);
			if (karaokeEnabled) {
				for (let w = 0; w < chunk.length; w++) {
					const activeWord = chunk[w];
					const start = cumulativeTime + activeWord.start;
					const end = cumulativeTime + activeWord.end;
					let prefix = '';
					let suffix = '';
					if (isQuote && w === 0) prefix = `{\\c&H808080&\\fs${Math.round(assFontSize * 0.9)}}“{\\c&H00${primaryBgr}&\\fs${assFontSize}} `;
					if (isQuote && w === chunk.length - 1) suffix = ` {\\c&H808080&\\fs${Math.round(assFontSize * 0.9)}}”`;
					if (isSide && w === 0) prefix = `{\\c&H00${highlightBgr}&\\b1}▌{\\c&H00${primaryBgr}&\\b0} `;
					const formattedText = chunk.map((c, cIdx) => {
						let wordStr = c.word;
						if (style.textTransform === 'uppercase') wordStr = wordStr.toUpperCase();
						if (cIdx === w) return `{\\c&H00${highlightBgr}&\\b1}${wordStr}{\\c&H00${primaryBgr}&\\b0}`;
						return wordStr;
					}).join(' ');
					ass += `Dialogue: 0,${formatASSTime(start)},${formatASSTime(end)},Default,,0,0,0,,${prefix}${formattedText}${suffix}\n`;
				}
			} else {
				const chunkStart = cumulativeTime + chunk[0].start;
				const chunkEnd = cumulativeTime + chunk[chunk.length - 1].end;
				let fullPhrase = chunk.map((c) => (style.textTransform === 'uppercase' ? c.word.toUpperCase() : c.word)).join(' ');
				if (isQuote) fullPhrase = `“ ${fullPhrase} ”`;
				if (isSide) fullPhrase = `▌ ${fullPhrase}`;
				ass += `Dialogue: 0,${formatASSTime(chunkStart)},${formatASSTime(chunkEnd)},Default,,0,0,0,,${fullPhrase}\n`;
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
