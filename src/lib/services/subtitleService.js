/**
 * Subtitle and Caption Service
 * Handles word timing calculation, real-time live player sync,
 * and exporting to SRT, VTT, and ASS for FFmpeg rendering.
 */

export const SUBTITLE_STYLES = {
	hormozi: {
		id: 'hormozi',
		name: 'Hormozi / Viral Pop',
		fontFamily: "'Outfit', 'Montserrat', sans-serif",
		fontSize: 38,
		fontWeight: 900,
		textTransform: 'uppercase',
		primaryColor: '#FFFFFF',
		highlightColor: '#FACC15', // Bright yellow
		highlightGlow: '0 0 25px rgba(250, 204, 21, 0.8)',
		textStroke: '3px #000000',
		shadow: '0 4px 12px rgba(0, 0, 0, 0.9)',
		backgroundColor: 'transparent',
		position: 'bottom-center',
		chunkSize: 4 // Words visible at one time
	},
	cinematic: {
		id: 'cinematic',
		name: 'Cinematic Documentary',
		fontFamily: "'Inter', sans-serif",
		fontSize: 30,
		fontWeight: 600,
		textTransform: 'none',
		primaryColor: '#F8FAFC',
		highlightColor: '#38BDF8', // Soft Sky Blue
		highlightGlow: 'none',
		textStroke: 'none',
		shadow: '0 2px 6px rgba(0, 0, 0, 0.7)',
		backgroundColor: 'rgba(0, 0, 0, 0.65)',
		position: 'bottom-center',
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
		highlightColor: '#06B6D4', // Vibrant Cyan
		highlightGlow: '0 0 20px rgba(6, 182, 212, 0.9)',
		textStroke: '2px #0f172a',
		shadow: '0 0 15px rgba(6, 182, 212, 0.4)',
		backgroundColor: 'rgba(15, 23, 42, 0.6)',
		position: 'bottom-center',
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
		highlightColor: '#4ADE80', // Mint green
		highlightGlow: 'none',
		textStroke: 'none',
		shadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
		backgroundColor: 'transparent',
		position: 'bottom-center',
		chunkSize: 6
	}
};

/**
 * Calculate precise word timings synchronized to an audio recording
 * Uses character-weighting and punctuation pauses so words naturally align with human speech tempo
 */
export function calculateAudioSyncedWordTimings(words, totalDuration, options = {}) {
	if (!words || words.length === 0) return [];

	const isChapterScene = Boolean(options.isChapterScene);
	const timingOffset = Number(options.timingOffset) || 0;

	// Determine speech boundaries
	let startBound = typeof options.speechStart === 'number'
		? Math.max(0, options.speechStart)
		: (isChapterScene ? 3.5 : 0.12);

	let endBound = typeof options.speechEnd === 'number'
		? Math.min(totalDuration, options.speechEnd)
		: Math.max(startBound + 0.5, totalDuration - 0.15);

	// Apply manual timing offset
	startBound = Math.max(0, startBound + timingOffset);
	endBound = Math.max(startBound + 0.4, Math.min(totalDuration, endBound + timingOffset));

	const speechSpan = Math.max(0.4, endBound - startBound);

	// Calculate word weights based on character length + punctuation breath pauses
	const weights = words.map((w) => {
		const clean = w.replace(/[^a-zA-Z0-9]/g, '');
		let wt = Math.max(2, clean.length);
		// Add breath pause weight for punctuation
		if (/[.,!?;:]$/.test(w)) {
			wt += 2.8;
		}
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

/**
 * Generate synthetic word timings if ElevenLabs timestamps are not available
 */
export function generateSyntheticWordTimings(words, totalDuration, isChapterScene = false) {
	return calculateAudioSyncedWordTimings(words, totalDuration, { isChapterScene });
}

/**
 * Apply a manual nudge offset (in seconds) to existing word timings
 */
export function applyTimingOffsetToWords(wordTimings, offsetSec, maxDuration = 9999) {
	if (!wordTimings || wordTimings.length === 0) return [];
	const offset = Number(offsetSec) || 0;
	return wordTimings.map((wt) => {
		const start = Math.max(0, Number((wt.start + offset).toFixed(2)));
		const end = Math.min(maxDuration, Math.max(start + 0.1, Number((wt.end + offset).toFixed(2))));
		return { ...wt, start, end };
	});
}


/**
 * Align ElevenLabs character timestamps to words
 */
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
				words.push({
					word: currentWord,
					start: Number(wordStart.toFixed(2)),
					end: Number((wordEnd || end).toFixed(2))
				});
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
		words.push({
			word: currentWord,
			start: Number((wordStart ?? 0).toFixed(2)),
			end: Number((wordEnd ?? 0).toFixed(2))
		});
	}

	return words;
}

/**
 * Get active words window and highlight for player
 */
export function getActiveSubtitleWindow(wordTimings, sceneCurrentTime, chunkSize = 4, karaokeEnabled = true) {
	if (!wordTimings || wordTimings.length === 0) return { words: [], activeIndex: -1 };

	// Find active word
	let activeIndex = wordTimings.findIndex(
		(w) => sceneCurrentTime >= w.start && sceneCurrentTime <= w.end
	);

	if (activeIndex === -1) {
		if (sceneCurrentTime < wordTimings[0].start) {
			activeIndex = 0;
		} else {
			activeIndex = wordTimings.length - 1;
		}
	}

	// Calculate chunk window around active word
	const chunkIndex = Math.floor(activeIndex / chunkSize);
	const startIdx = chunkIndex * chunkSize;
	const endIdx = Math.min(startIdx + chunkSize, wordTimings.length);

	const windowWords = wordTimings.slice(startIdx, endIdx).map((w, idx) => ({
		...w,
		isHighlighted: karaokeEnabled ? (startIdx + idx === activeIndex) : false
	}));

	return {
		words: windowWords,
		activeIndex: karaokeEnabled ? (activeIndex - startIdx) : -1
	};
}

/**
 * Format seconds to SRT timecode: 00:01:23,456
 */
function formatSRTTime(seconds) {
	const pad = (n, z = 2) => String(Math.floor(n)).padStart(z, '0');
	const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
	const s = seconds % 60;
	const m = (seconds / 60) % 60;
	const h = seconds / 3600;
	return `${pad(h)}:${pad(m)}:${pad(s)},${ms}`;
}

/**
 * Format seconds to VTT timecode: 00:01:23.456
 */
function formatVTTTime(seconds) {
	return formatSRTTime(seconds).replace(',', '.');
}

/**
 * Export scenes to standard SRT string
 */
export function exportToSRT(scenes) {
	let srt = '';
	let counter = 1;
	let cumulativeTime = 0;

	for (const scene of scenes) {
		const timings = scene.wordTimings && scene.wordTimings.length > 0 
			? scene.wordTimings 
			: generateSyntheticWordTimings(scene.words, scene.audioDuration || scene.estimatedDuration);

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

		cumulativeTime += (scene.audioDuration || scene.estimatedDuration);
	}

	return srt.trim();
}

/**
 * Export scenes to WebVTT string
 */
export function exportToVTT(scenes) {
	const srt = exportToSRT(scenes);
	return `WEBVTT - Generated by YouTube Long Studio\n\n` + srt.replace(/,/g, '.');
}

/**
 * Generate ASS subtitle file for FFmpeg burn-in
 */
export function exportToASS(scenes, styleKey = 'hormozi', options = {}) {
	const style = SUBTITLE_STYLES[styleKey] || SUBTITLE_STYLES.hormozi;
	const karaokeEnabled = options.karaokeEnabled !== false;
	const customFontSize = options.fontSize || style.fontSize || 34;
	const assFontSize = Math.round(customFontSize * 1.85); // Scaled for 1080p canvas

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
Style: Default,Outfit,${assFontSize},&H00FFFFFF,&H000000FF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,1,4,2,2,40,40,90,1
Style: Highlight,Outfit,${Math.round(assFontSize * 1.06)},&H0015CCFA,&H000000FF,&H00000000,&H90000000,-1,0,0,0,105,105,0,0,1,5,3,2,40,40,90,1
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

		// Burn-in Chapter Title Card if present (display for first ~3.5 seconds of scene)
		if (scene.chapter) {
			const chStart = cumulativeTime;
			const chEnd = cumulativeTime + Math.min(3.5, sceneDuration);
			const chTag = scene.chapter.tag || `BAB ${String(scene.chapter.number || 1).padStart(2, '0')}`;
			const chTitle = (scene.chapter.title || '').toUpperCase();
			const chSub = scene.chapter.subtitle || '';

			ass += `Dialogue: 1,${formatASSTime(chStart)},${formatASSTime(chEnd)},ChapterTag,,0,0,0,,{\\fad(350,350)\\an5\\pos(960,450)}${chTag}\n`;
			ass += `Dialogue: 1,${formatASSTime(chStart)},${formatASSTime(chEnd)},ChapterTitle,,0,0,0,,{\\fad(350,350)\\an5\\pos(960,520)}${chTitle}\n`;
			if (chSub) {
				ass += `Dialogue: 1,${formatASSTime(chStart)},${formatASSTime(chEnd)},ChapterSub,,0,0,0,,{\\fad(350,350)\\an5\\pos(960,580)}${chSub}\n`;
			}
		}

		const rawTimings = scene.wordTimings && scene.wordTimings.length > 0 
			? scene.wordTimings 
			: generateSyntheticWordTimings(scene.words, sceneDuration, !!scene.chapter);

		// If scene has a chapter card, filter out any word timings that occur during the
		// chapter intro display (first ~3.2s) so they aren't rendered as duplicate bottom subtitles
		const timings = scene.chapter 
			? rawTimings.filter((t) => t.start >= 3.2)
			: rawTimings;

		const chunkSize = style.chunkSize || 4;
		for (let i = 0; i < timings.length; i += chunkSize) {
			const chunk = timings.slice(i, i + chunkSize);

			if (karaokeEnabled) {
				// Word-by-word karaoke highlight
				for (let w = 0; w < chunk.length; w++) {
					const activeWord = chunk[w];
					const start = cumulativeTime + activeWord.start;
					const end = cumulativeTime + activeWord.end;

					const formattedText = chunk.map((c, cIdx) => {
						let wordStr = c.word;
						if (style.textTransform === 'uppercase') wordStr = wordStr.toUpperCase();
						if (cIdx === w) {
							return `{\\c&H15CCFA&\\b1}${wordStr}{\\c&HFFFFFF&\\b0}`;
						}
						return wordStr;
					}).join(' ');

					ass += `Dialogue: 0,${formatASSTime(start)},${formatASSTime(end)},Default,,0,0,0,,${formattedText}\n`;
				}
			} else {
				// Standard static phrase subtitle without per-word karaoke jump
				const chunkStart = cumulativeTime + chunk[0].start;
				const chunkEnd = cumulativeTime + chunk[chunk.length - 1].end;
				const fullPhrase = chunk.map((c) => {
					let wordStr = c.word;
					return style.textTransform === 'uppercase' ? wordStr.toUpperCase() : wordStr;
				}).join(' ');

				ass += `Dialogue: 0,${formatASSTime(chunkStart)},${formatASSTime(chunkEnd)},Default,,0,0,0,,${fullPhrase}\n`;
			}
		}

		cumulativeTime += sceneDuration;
	}

	return ass;
}

/**
 * Generate formatted YouTube chapter timestamps for video description
 */
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
			if (scene.chapter) {
				label = `${scene.chapter.tag || 'Bab'}: ${scene.chapter.title}`;
			}
			timestamps.push(`${timecode} - ${label}`);
		}
		cumulativeTime += (scene.audioDuration || scene.estimatedDuration || 5);
	}

	return timestamps.join('\n');
}
