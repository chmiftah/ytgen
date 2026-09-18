import { json } from '@sveltejs/kit';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { EDGE_TTS_VOICES, DEFAULT_EDGE_VOICE_ID } from '$lib/services/voiceService.js';
import { generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
import { getAudioEffectById } from '$lib/services/audioEffectService.js';
import { 
	generateVoiceoverPipeline, 
	DEFAULT_EDGE_VOICE, 
	VOICE_RATES, 
	synthesizeChunkWithRetry, 
	getOrCreateSilence 
} from '$lib/services/edgeTtsPipeline.js';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET() {
	return json({
		success: true,
		voices: EDGE_TTS_VOICES
	});
}

// Enhance punctuation & breathing pauses for more human-like rhythm
function enhanceTextCadence(rawText) {
	if (!rawText) return '';
	let t = rawText.trim();
	t = t.replace(/\s*--\s*/g, ' ... ');
	t = t.replace(/\s*—\s*/g, ' ... ');
	t = t.replace(/([?!])\s+/g, '$1 ... ');
	t = t.replace(/\.{4,}/g, '...');
	return t;
}

// Synthesize a single piece of text and extract word boundary timestamps
async function synthesizeStream(text, voiceId, effectiveRate, effectivePitch) {
	const cleanText = enhanceTextCadence(text);
	const words = cleanText.split(/\s+/).filter(Boolean);

	const tts = new MsEdgeTTS();
	await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
		wordBoundaryEnabled: true
	});

	const { audioStream, metadataStream } = tts.toStream(cleanText, {
		rate: effectiveRate,
		pitch: effectivePitch
	});

	const audioChunks = [];
	const rawBoundaries = [];

	audioStream.on('data', (chunk) => audioChunks.push(chunk));
	metadataStream.on('data', (data) => {
		try {
			const parsed = JSON.parse(data.toString());
			if (parsed.Metadata && Array.isArray(parsed.Metadata)) {
				for (const item of parsed.Metadata) {
					if (item.Type === 'WordBoundary' && item.Data && item.Data.text) {
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

	try {
		tts.close();
	} catch (_) {}

	const audioBuffer = Buffer.concat(audioChunks);
	if (audioBuffer.length === 0) {
		throw new Error('Edge TTS audio stream is empty');
	}

	let wordTimings = rawBoundaries.map((b) => {
		const start = Number((b.Offset / 10000000).toFixed(3));
		const dur = Number((b.Duration / 10000000).toFixed(3));
		return {
			word: b.text?.Text || '',
			start,
			end: Number((start + dur).toFixed(3))
		};
	}).filter((w) => w.word.trim().length > 0);

	const estimatedDuration = Math.max(2.0, Number((words.length * 0.45).toFixed(2)));
	if (wordTimings.length === 0) {
		wordTimings = generateSyntheticWordTimings(words, estimatedDuration);
	}

	const exactDuration = await getAudioDurationFromBuffer(audioBuffer);
	const lastWordEnd = wordTimings.length > 0 ? wordTimings[wordTimings.length - 1].end : 0;
	const duration = exactDuration || (lastWordEnd ? Number((lastWordEnd + 0.35).toFixed(2)) : estimatedDuration);

	return { audioBuffer, wordTimings, duration };
}

// Measure exact duration from file or buffer via FFmpeg
function getAudioDurationFromFile(filePath) {
	return new Promise((resolve) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', ['-i', filePath]);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', () => {
			const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
			if (match) {
				const sec = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
				resolve(Number(sec.toFixed(2)));
			} else {
				resolve(null);
			}
		});
		proc.on('error', () => resolve(null));
	});
}

function getAudioDurationFromBuffer(buf) {
	return new Promise(async (resolve) => {
		const tempId = `dur-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.mp3`;
		const dir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(dir, { recursive: true });
		const tempPath = path.join(dir, tempId);
		try {
			await fs.promises.writeFile(tempPath, buf);
			const dur = await getAudioDurationFromFile(tempPath);
			await fs.promises.unlink(tempPath).catch(() => {});
			resolve(dur);
		} catch (_) {
			resolve(null);
		}
	});
}

// Concat intro + silence gap + narration via FFmpeg
function concatWithSilence(buf1, pauseSec, buf2, outroSec = 0) {
	return new Promise(async (resolve, reject) => {
		const tempId = `pause-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const dir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(dir, { recursive: true });

		const path1 = path.join(dir, `${tempId}-1.mp3`);
		const path2 = path.join(dir, `${tempId}-2.mp3`);
		const pathOut = path.join(dir, `${tempId}-out.mp3`);

		await fs.promises.writeFile(path1, buf1);
		await fs.promises.writeFile(path2, buf2);

		const filterParts = [
			`[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0]`,
			`[1:a]atrim=0:${pauseSec},aformat=sample_rates=44100:channel_layouts=stereo[a1]`,
			`[2:a]aformat=sample_rates=44100:channel_layouts=stereo[a2]`
		];
		let concatCount = 3;
		let extraInputs = [];

		if (outroSec > 0) {
			filterParts.push(`[3:a]atrim=0:${outroSec},aformat=sample_rates=44100:channel_layouts=stereo[a3]`);
			concatCount = 4;
			extraInputs = ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo'];
		}

		const filterStr = `${filterParts.join(';')};${Array.from({ length: concatCount }, (_, i) => `[a${i}]`).join('')}concat=n=${concatCount}:v=0:a=1[outa]`;

		const args = [
			'-i', path1,
			'-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
			'-i', path2,
			...extraInputs,
			'-filter_complex', filterStr,
			'-map', '[outa]',
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-y', pathOut
		];

		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		proc.on('close', async (code) => {
			if (code === 0) {
				try {
					const outBuf = await fs.promises.readFile(pathOut);
					const exactDur = await getAudioDurationFromFile(pathOut);
					await Promise.all([
						fs.promises.unlink(path1).catch(() => {}),
						fs.promises.unlink(path2).catch(() => {}),
						fs.promises.unlink(pathOut).catch(() => {})
					]);
					resolve({ audioBuffer: outBuf, exactDuration: exactDur });
				} catch (e) {
					reject(e);
				}
			} else {
				reject(new Error(`FFmpeg concat failed with code ${code}`));
			}
		});
		proc.on('error', reject);
	});
}

// Append silence to end of audio buffer via FFmpeg
function appendSilence(buf, outroSec) {
	return new Promise(async (resolve, reject) => {
		const tempId = `outro-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const dir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(dir, { recursive: true });

		const pathIn = path.join(dir, `${tempId}-in.mp3`);
		const pathOut = path.join(dir, `${tempId}-out.mp3`);

		await fs.promises.writeFile(pathIn, buf);

		const args = [
			'-i', pathIn,
			'-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
			'-filter_complex', `[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];[1:a]atrim=0:${outroSec},aformat=sample_rates=44100:channel_layouts=stereo[a1];[a0][a1]concat=n=2:v=0:a=1[outa]`,
			'-map', '[outa]',
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-y', pathOut
		];

		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		proc.on('close', async (code) => {
			if (code === 0) {
				try {
					const outBuf = await fs.promises.readFile(pathOut);
					const exactDur = await getAudioDurationFromFile(pathOut);
					await Promise.all([
						fs.promises.unlink(pathIn).catch(() => {}),
						fs.promises.unlink(pathOut).catch(() => {})
					]);
					resolve({ audioBuffer: outBuf, exactDuration: exactDur });
				} catch (e) {
					reject(e);
				}
			} else {
				reject(new Error(`FFmpeg appendSilence failed with code ${code}`));
			}
		});
		proc.on('error', reject);
	});
}

// Apply Studio Mastering DSP filter (Broadcast EQ, Dynamic Compression, Warm Tube & Presence)
function applyAudioPostProcessing(inputBuffer, filterString) {
	return new Promise(async (resolve) => {
		if (!filterString || !filterString.trim()) {
			resolve(inputBuffer);
			return;
		}
		const tempId = `dsp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const dir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(dir, { recursive: true });

		const pathIn = path.join(dir, `${tempId}-in.mp3`);
		const pathOut = path.join(dir, `${tempId}-out.mp3`);

		await fs.promises.writeFile(pathIn, inputBuffer);

		const args = [
			'-i', pathIn,
			'-af', filterString,
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-ar', '44100',
			'-y', pathOut
		];

		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', async (code) => {
			if (code === 0) {
				try {
					const outBuf = await fs.promises.readFile(pathOut);
					await Promise.all([
						fs.promises.unlink(pathIn).catch(() => {}),
						fs.promises.unlink(pathOut).catch(() => {})
					]);
					resolve(outBuf);
				} catch (err) {
					console.warn('Error reading DSP audio:', err);
					resolve(inputBuffer);
				}
			} else {
				console.warn('FFmpeg DSP warning, using raw audio:', stderr);
				await fs.promises.unlink(pathIn).catch(() => {});
				await fs.promises.unlink(pathOut).catch(() => {});
				resolve(inputBuffer);
			}
		});
		proc.on('error', (err) => {
			console.warn('FFmpeg DSP process error:', err);
			resolve(inputBuffer);
		});
	});
}

export async function POST({ request }) {
	try {
		const { 
			text, 
			chapterIntro = '', 
			chapterPause = 0, 
			outroPause = 0, 
			voiceId = DEFAULT_EDGE_VOICE_ID, 
			rate, 
			pitch, 
			audioEffect = 'studio_podcast',
			humanize = true
		} = await request.json();

		if ((!text || !text.trim()) && (!chapterIntro || !chapterIntro.trim())) {
			return json({ success: false, error: 'Teks voiceover wajib diisi' }, { status: 400 });
		}

		const effectPreset = getAudioEffectById(audioEffect);
		const effectivePitch = pitch !== undefined && pitch !== null ? pitch : (effectPreset?.edgePitch || '0Hz');
		const cleanNarration = (text || '').trim();
		const cleanIntro = (chapterIntro || '').trim();
		const pauseSec = Number(chapterPause || 0);
		const outroSec = Number(outroPause || 0);
		const targetVoiceId = voiceId || DEFAULT_EDGE_VOICE_ID || DEFAULT_EDGE_VOICE;

		let finalBuffer = null;
		let finalWordTimings = [];
		let finalDuration = 0;
		let finalAudioPath = null;
		let chunksInfo = [];
		let cacheStats = { total: 0, hits: 0, misses: 0 };

		if (cleanIntro && pauseSec > 0 && cleanNarration) {
			// 1. Synthesize chapter intro as a distinct announcement chunk
			const introChunk = {
				index: 0,
				text: cleanIntro,
				normalizedText: cleanIntro,
				style: 'emphasis',
				rate: VOICE_RATES.emphasis || '-6%',
				pitch: effectivePitch,
				pause_after: Math.round(pauseSec * 1000),
				audio_path: null,
				audio_hash: `intro-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
				status: 'pending'
			};
			await synthesizeChunkWithRetry(introChunk, { voiceId: targetVoiceId });

			// 2. Synthesize narration through the upgraded long-form voiceover pipeline
			const narrResult = await generateVoiceoverPipeline(cleanNarration, {
				voiceId: targetVoiceId,
				pitch: effectivePitch,
				humanize: humanize !== false,
				includeOutroSilence: outroSec > 0
			});

			// Shift narration word timings by: (introChunk.duration + pauseSec)
			const shiftAmount = Number((introChunk.duration + pauseSec).toFixed(3));
			const shiftedNarrTimings = narrResult.wordTimings.map((w) => ({
				word: w.word,
				start: Number((w.start + shiftAmount).toFixed(3)),
				end: Number((w.end + shiftAmount).toFixed(3))
			}));

			finalWordTimings = [...(introChunk.wordTimings || []), ...shiftedNarrTimings];

			// Concat intro + pause + narr via concatWithSilence
			const introBuf = await fs.promises.readFile(introChunk.audio_path);
			const narrBuf = await fs.promises.readFile(narrResult.audioPath);
			const concatRes = await concatWithSilence(introBuf, pauseSec, narrBuf, outroSec);
			finalBuffer = concatRes.audioBuffer;
			finalDuration = concatRes.exactDuration || Number((shiftAmount + narrResult.duration + outroSec).toFixed(2));
			chunksInfo = [introChunk, ...narrResult.chunks];
			cacheStats = narrResult.cacheStats;
		} else {
			// Single stream or standard scene: full pipeline with smart chunking, voice direction, and caching
			const fullText = cleanIntro ? `${cleanIntro} ... ${cleanNarration}` : cleanNarration;
			const pipelineResult = await generateVoiceoverPipeline(fullText, {
				voiceId: targetVoiceId,
				pitch: effectivePitch,
				humanize: humanize !== false,
				includeOutroSilence: outroSec > 0
			});

			finalAudioPath = pipelineResult.audioPath;
			finalBuffer = await fs.promises.readFile(pipelineResult.audioPath);
			finalWordTimings = pipelineResult.wordTimings;
			finalDuration = pipelineResult.duration;
			chunksInfo = pipelineResult.chunks;
			cacheStats = pipelineResult.cacheStats;
		}

		// Apply Studio Mastering DSP filter if requested and not raw
		if (effectPreset?.ffmpegFilter && effectPreset.id !== 'natural') {
			finalBuffer = await applyAudioPostProcessing(finalBuffer, effectPreset.ffmpegFilter);
			const masteredDur = await getAudioDurationFromBuffer(finalBuffer);
			if (masteredDur) finalDuration = masteredDur;
		}

		const audioBase64 = finalBuffer.toString('base64');

		// Save a copy to static audio-cache for direct static serving
		const finalDir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(finalDir, { recursive: true });
		const fileKey = `edge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.mp3`;
		const persistentPath = path.join(finalDir, fileKey);
		await fs.promises.writeFile(persistentPath, finalBuffer);

		return json({
			success: true,
			audioUrl: `data:audio/mp3;base64,${audioBase64}`,
			serverAudioPath: persistentPath,
			audioFileKey: fileKey,
			staticAudioUrl: `/renders/audio-cache/${fileKey}`,
			wordTimings: finalWordTimings,
			duration: finalDuration,
			isRealVoice: true,
			provider: 'edge_tts',
			voiceId: targetVoiceId,
			audioEffect: effectPreset?.id || 'natural',
			chunks: chunksInfo,
			cacheStats
		});
	} catch (error) {
		console.error('Edge TTS generation error:', error);
		return json({
			success: false,
			error: `Edge TTS error: ${error.message || 'Gagal menghasilkan suara'}`
		}, { status: 500 });
	}
}
