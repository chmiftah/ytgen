/**
 * Edge TTS Long-Form Voiceover Pipeline (Indonesian)
 *
 * Implements a complete modular voiceover architecture:
 * SCRIPT
 *   → HUMANIZE (conversational spoken Indonesian, rhythm, selective dramatic pause)
 *   → TEXT NORMALIZATION FOR TTS (numbers, years, currency, percentages, units)
 *   → VOICE DIRECTION (style: normal, emphasis, question, dramatic, fast)
 *   → SMART CHUNKING (20–60 words, 2–4 sentences, no mid-sentence cuts)
 *   → EDGE TTS (msedge-tts, word boundaries)
 *   → AUDIO CACHE (hash of text+voice+rate+pitch, resume & idempotency)
 *   → ERROR HANDLING (3x retries with exponential backoff)
 *   → NATURAL PAUSE ENGINE (silence gaps per style with deterministic jitter)
 *   → AUDIO STITCHING (FFmpeg concat with word timing alignment)
 *   → NORMALIZATION (-16 LUFS YouTube standard stereo)
 *   → FINAL VOICEOVER
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import {
	DEFAULT_EDGE_VOICE,
	VOICE_RATES,
	PAUSE_RANGES,
	integerToIndonesianWords,
	normalize_for_tts,
	humanizeScript,
	detect_voice_style,
	calculatePauseAfter,
	smartChunk as baseSmartChunk
} from './scriptHumanizer.js';

export {
	DEFAULT_EDGE_VOICE,
	VOICE_RATES,
	PAUSE_RANGES,
	integerToIndonesianWords,
	normalize_for_tts,
	humanizeScript,
	detect_voice_style,
	calculatePauseAfter
};

export function smartChunk(script, options = {}) {
	return baseSmartChunk(script, {
		...options,
		hashFunction: (str) => crypto.createHash('sha256').update(str).digest('hex').slice(0, 24)
	});
}

const CACHE_DIR = path.resolve('./static/renders/tts-cache');
const SILENCE_CACHE_DIR = path.resolve('./static/renders/tts-cache/silence');

// Ensure cache directories exist
export async function ensureCacheDirs() {
	await fs.promises.mkdir(CACHE_DIR, { recursive: true });
	await fs.promises.mkdir(SILENCE_CACHE_DIR, { recursive: true });
}

// ============================================================================
// 5. EDGE TTS SYNTHESIS WITH CACHE & RETRY
// ============================================================================

/**
 * Synthesizes a single chunk using MsEdgeTTS with cache and retry mechanism
 */
export async function synthesizeChunkWithRetry(chunk, options = {}, retries = 3) {
	await ensureCacheDirs();

	const cacheFilePath = path.join(CACHE_DIR, `${chunk.audio_hash}.mp3`);
	const metaFilePath = path.join(CACHE_DIR, `${chunk.audio_hash}.json`);

	// 1. Check Audio Cache
	if (fs.existsSync(cacheFilePath) && fs.existsSync(metaFilePath)) {
		try {
			const stat = await fs.promises.stat(cacheFilePath);
			if (stat.size > 500) {
				const meta = JSON.parse(await fs.promises.readFile(metaFilePath, 'utf-8'));
				chunk.audio_path = cacheFilePath;
				chunk.duration = meta.duration;
				chunk.wordTimings = meta.wordTimings || [];
				chunk.status = 'completed';
				chunk.cacheHit = true;
				return chunk;
			}
		} catch (_) {}
	}

	chunk.cacheHit = false;
	chunk.status = 'processing';

	const voiceId = options.voiceId || DEFAULT_EDGE_VOICE;
	const textToRead = chunk.normalizedText || chunk.text;

	// 2. Retry loop with exponential backoff
	let lastError = null;
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const tts = new MsEdgeTTS();
			await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
				wordBoundaryEnabled: true
			});

			const { audioStream, metadataStream } = tts.toStream(textToRead, {
				rate: chunk.rate,
				pitch: chunk.pitch
			});

			const audioBuffers = [];
			const rawBoundaries = [];

			audioStream.on('data', (d) => audioBuffers.push(d));
			metadataStream.on('data', (d) => {
				try {
					const parsed = JSON.parse(d.toString());
					if (parsed.Metadata && Array.isArray(parsed.Metadata)) {
						for (const item of parsed.Metadata) {
							if (item.Type === 'WordBoundary' && item.Data?.text) {
								rawBoundaries.push(item.Data);
							}
						}
					}
				} catch (_) {}
			});

			await new Promise((resolve, reject) => {
				audioStream.on('end', resolve);
				audioStream.on('error', reject);
				metadataStream.on('error', reject);
			});

			try { tts.close(); } catch (_) {}

			const buffer = Buffer.concat(audioBuffers);
			if (buffer.length < 500) {
				throw new Error('TTS buffer output too small or empty');
			}

			// Parse word timings
			let wordTimings = rawBoundaries.map((b) => {
				const start = Number((b.Offset / 10000000).toFixed(3));
				const dur = Number((b.Duration / 10000000).toFixed(3));
				return {
					word: b.text?.Text || '',
					start,
					end: Number((start + dur).toFixed(3))
				};
			}).filter((w) => w.word.trim().length > 0);

			// Map word timings back to original chunk words so subtitles keep original English spelling
			const originalWords = (chunk.text || '').trim().split(/\s+/).filter(Boolean);
			if (wordTimings.length === originalWords.length && originalWords.length > 0) {
				wordTimings = wordTimings.map((wt, idx) => ({
					...wt,
					word: originalWords[idx]
				}));
			}

			// Write to cache atomically
			const tempCache = `${cacheFilePath}.tmp-${Date.now()}`;
			await fs.promises.writeFile(tempCache, buffer);
			await fs.promises.rename(tempCache, cacheFilePath);

			const duration = await getAudioDurationFromFile(cacheFilePath);

			// Fallback synthetic word timings if boundary missing
			if (wordTimings.length === 0) {
				const words = (chunk.text || textToRead).split(/\s+/).filter(Boolean);
				const step = duration / Math.max(1, words.length);
				wordTimings = words.map((w, idx) => ({
					word: w,
					start: Number((idx * step).toFixed(3)),
					end: Number(((idx + 1) * step).toFixed(3))
				}));
			}

			// Save metadata
			await fs.promises.writeFile(
				metaFilePath,
				JSON.stringify({ duration, wordTimings, text: chunk.text, style: chunk.style }),
				'utf-8'
			);

			chunk.audio_path = cacheFilePath;
			chunk.duration = duration;
			chunk.wordTimings = wordTimings;
			chunk.status = 'completed';
			return chunk;
		} catch (err) {
			lastError = err;
			if (attempt < retries) {
				const backoffMs = 1000 * Math.pow(2, attempt - 1);
				await new Promise((r) => setTimeout(r, backoffMs));
			}
		}
	}

	chunk.status = 'failed';
	chunk.error = lastError?.message || 'Unknown TTS error';
	throw new Error(`Failed to generate TTS chunk ${String(chunk.index).padStart(3, '0')}: ${chunk.error}`);
}

// ============================================================================
// 6. NATURAL PAUSE & SILENCE GENERATOR
// ============================================================================

/**
 * Generate silence audio file of exact duration in milliseconds
 */
export async function getOrCreateSilence(durationMs) {
	await ensureCacheDirs();
	const durationSec = (durationMs / 1000).toFixed(3);
	const silencePath = path.join(SILENCE_CACHE_DIR, `silence_${durationMs}ms.mp3`);

	if (fs.existsSync(silencePath)) {
		return silencePath;
	}

	await new Promise((resolve, reject) => {
		const args = [
			'-f', 'lavfi',
			'-i', 'anullsrc=r=44100:cl=stereo',
			'-t', durationSec,
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-ar', '44100',
			'-y', silencePath
		];
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg silence generation failed (${code})`));
		});
		proc.on('error', reject);
	});

	return silencePath;
}

// ============================================================================
// 7. AUDIO STITCHING & -16 LUFS NORMALIZATION
// ============================================================================

/**
 * Measure duration via FFmpeg
 */
export function getAudioDurationFromFile(filePath) {
	return new Promise((resolve) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', ['-i', filePath]);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', () => {
			const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
			if (match) {
				const sec = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
				resolve(Number(sec.toFixed(3)));
			} else {
				resolve(0);
			}
		});
		proc.on('error', () => resolve(0));
	});
}

/**
 * Stitch audio chunks with natural pause gaps and normalize loudness to -16 LUFS
 */
export async function stitchAndNormalizeChunks(chunks, outputPath, options = {}) {
	const tempDir = path.resolve(`./static/renders/temp-voice-${Date.now()}`);
	await fs.promises.mkdir(tempDir, { recursive: true });

	const concatListPath = path.join(tempDir, 'concat_list.txt');
	const rawStitchedPath = path.join(tempDir, 'stitched_raw.mp3');

	const lines = [];
	let cumulativeTime = 0;
	const unifiedWordTimings = [];

	for (let i = 0; i < chunks.length; i++) {
		const ch = chunks[i];
		lines.push(`file '${ch.audio_path}'`);

		// Shift word timings
		if (Array.isArray(ch.wordTimings)) {
			for (const wt of ch.wordTimings) {
				unifiedWordTimings.push({
					word: wt.word,
					start: Number((wt.start + cumulativeTime).toFixed(3)),
					end: Number((wt.end + cumulativeTime).toFixed(3))
				});
			}
		}

		cumulativeTime += Number(ch.duration || 0);

		// Append silence pause after chunk (except after last chunk, unless specified)
		const isLast = (i === chunks.length - 1);
		const pauseMs = ch.pause_after || 300;

		if (!isLast || options.includeOutroSilence) {
			const silenceFile = await getOrCreateSilence(pauseMs);
			lines.push(`file '${silenceFile}'`);
			cumulativeTime += Number((pauseMs / 1000).toFixed(3));
		}
	}

	await fs.promises.writeFile(concatListPath, lines.join('\n'), 'utf-8');

	// 1. Fast concatenation via FFmpeg concat demuxer
	await new Promise((resolve, reject) => {
		const args = [
			'-f', 'concat',
			'-safe', '0',
			'-i', concatListPath,
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-ar', '44100',
			'-ac', '2',
			'-y', rawStitchedPath
		];
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let errOutput = '';
		proc.stderr.on('data', (d) => { errOutput += d.toString(); });
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg concat failed (${code}): ${errOutput.slice(-300)}`));
		});
		proc.on('error', reject);
	});

	// 2. Broadcast Loudness Normalization (-16 LUFS YouTube Standard)
	// Apply integrated loudnorm + gentle limiter to prevent clipping
	const loudnormFilter = 'loudnorm=I=-16:TP=-1.5:LRA=11,aformat=sample_rates=44100:channel_layouts=stereo';

	await new Promise((resolve, reject) => {
		const args = [
			'-i', rawStitchedPath,
			'-af', loudnormFilter,
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-ar', '44100',
			'-ac', '2',
			'-y', outputPath
		];
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let errOutput = '';
		proc.stderr.on('data', (d) => { errOutput += d.toString(); });
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg normalization failed (${code}): ${errOutput.slice(-300)}`));
		});
		proc.on('error', reject);
	});

	const finalDuration = await getAudioDurationFromFile(outputPath);

	// Clean up temporary workspace directory
	await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});

	return {
		duration: finalDuration || Number(cumulativeTime.toFixed(3)),
		wordTimings: unifiedWordTimings
	};
}

// ============================================================================
// 8. MASTER PIPELINE ORCHESTRATOR
// ============================================================================

/**
 * Execute full upgraded voiceover pipeline:
 * SCRIPT -> HUMANIZE -> VOICE DIRECTION -> SMART CHUNKING -> EDGE TTS -> PAUSE -> STITCH -> NORMALIZE
 */
export async function generateVoiceoverPipeline(rawScript, options = {}, onProgress = null) {
	const startTime = Date.now();
	const voiceId = options.voiceId || DEFAULT_EDGE_VOICE;

	// 1. Humanize script (unless explicitly disabled)
	const shouldHumanize = options.humanize !== false;
	const humanizedText = shouldHumanize ? humanizeScript(rawScript) : rawScript;

	// 2. Smart chunking & voice direction
	const chunks = smartChunk(humanizedText, {
		voiceId,
		pitch: options.pitch || '0Hz',
		minWords: options.minWords || 20,
		maxWords: options.maxWords || 60
	});

	if (chunks.length === 0) {
		throw new Error('Script did not produce any valid speech chunks');
	}

	let cacheHits = 0;
	let cacheMisses = 0;

	// 3. Process Chunks (with caching, retry, idempotency)
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const chunkNum = i + 1;
		const total = chunks.length;
		const pct = Number(((chunkNum / total) * 100).toFixed(1));

		const logHeader = `[VOICE] Processing ${chunkNum}/${total} (${pct}%)`;
		const styleInfo = `Style: ${chunk.style} | Rate: ${chunk.rate}`;

		if (onProgress) {
			onProgress({
				type: 'chunk_start',
				current: chunkNum,
				total,
				percent: pct,
				style: chunk.style,
				rate: chunk.rate,
				textSnippet: chunk.text.slice(0, 45) + '...'
			});
		}

		console.log(`${logHeader} - ${styleInfo}`);

		await synthesizeChunkWithRetry(chunk, { voiceId });

		if (chunk.cacheHit) {
			cacheHits++;
			console.log(`[VOICE] Chunk ${chunkNum}/${total} Cache: HIT`);
		} else {
			cacheMisses++;
			console.log(`[VOICE] Chunk ${chunkNum}/${total} Cache: MISS (TTS completed)`);
		}

		if (onProgress) {
			onProgress({
				type: 'chunk_complete',
				current: chunkNum,
				total,
				percent: pct,
				cacheHit: chunk.cacheHit,
				duration: chunk.duration
			});
		}
	}

	// 4. Stitch & Normalize
	const finalAudioDir = path.resolve('./static/renders/audio-cache');
	await fs.promises.mkdir(finalAudioDir, { recursive: true });

	const scriptHash = crypto.createHash('md5').update(humanizedText + voiceId).digest('hex').slice(0, 12);
	const finalAudioName = `voiceover-${scriptHash}-${Date.now()}.mp3`;
	const finalAudioPath = path.join(finalAudioDir, finalAudioName);

	console.log(`[VOICE] Stitching ${chunks.length} chunks with natural pauses & normalizing to -16 LUFS...`);

	const stitchResult = await stitchAndNormalizeChunks(chunks, finalAudioPath, options);

	const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
	console.log(`[VOICE] ✓ Voiceover generated: ${stitchResult.duration}s in ${totalSec}s (Cache: ${cacheHits} HIT, ${cacheMisses} MISS)`);

	return {
		success: true,
		audioPath: finalAudioPath,
		audioUrl: `/renders/audio-cache/${finalAudioName}`,
		duration: stitchResult.duration,
		wordTimings: stitchResult.wordTimings,
		chunks,
		cacheStats: {
			total: chunks.length,
			hits: cacheHits,
			misses: cacheMisses
		},
		humanizedScript: humanizedText
	};
}
