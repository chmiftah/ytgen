import { json } from '@sveltejs/kit';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { EDGE_TTS_VOICES, DEFAULT_EDGE_VOICE_ID } from '$lib/services/voiceService.js';
import { generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
import { getAudioEffectById } from '$lib/services/audioEffectService.js';
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

// Synthesize a single piece of text and extract word boundary timestamps
async function synthesizeStream(text, voiceId, effectiveRate, effectivePitch) {
	const cleanText = text.trim();
	const words = cleanText.split(/\s+/).filter(Boolean);

	const tts = new MsEdgeTTS();
	await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {
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
			audioEffect = 'studio_podcast' 
		} = await request.json();

		if ((!text || !text.trim()) && (!chapterIntro || !chapterIntro.trim())) {
			return json({ success: false, error: 'Teks voiceover wajib diisi' }, { status: 400 });
		}

		const effectPreset = getAudioEffectById(audioEffect);
		const effectivePitch = pitch !== undefined && pitch !== null ? pitch : (effectPreset?.edgePitch || '0Hz');
		const effectiveRate = rate !== undefined && rate !== null ? rate : (effectPreset?.edgeRate || '0%');

		const cleanNarration = (text || '').trim();
		const cleanIntro = (chapterIntro || '').trim();
		const pauseSec = Number(chapterPause || 0);
		const outroSec = Number(outroPause || 0);
		// Always maintain at least 0.6s of natural breathing space at the end of each scene
		const sceneOutro = Math.max(0.6, outroSec);

		let finalBuffer = null;
		let finalWordTimings = [];
		let finalDuration = 0;

		if (cleanIntro && pauseSec > 0 && cleanNarration) {
			// 1. Synthesize chapter intro
			const introResult = await synthesizeStream(cleanIntro, voiceId, effectiveRate, effectivePitch);
			// 2. Synthesize narration
			const narrResult = await synthesizeStream(cleanNarration, voiceId, effectiveRate, effectivePitch);

			// Shift narration timings by: (introResult.duration + pauseSec)
			const shiftAmount = Number((introResult.duration + pauseSec).toFixed(3));
			const shiftedNarrTimings = narrResult.wordTimings.map((w) => ({
				word: w.word,
				start: Number((w.start + shiftAmount).toFixed(3)),
				end: Number((w.end + shiftAmount).toFixed(3))
			}));

			finalWordTimings = [...introResult.wordTimings, ...shiftedNarrTimings];

			// Concatenate with silence using FFmpeg
			const concatRes = await concatWithSilence(introResult.audioBuffer, pauseSec, narrResult.audioBuffer, sceneOutro);
			finalBuffer = concatRes.audioBuffer;
			finalDuration = concatRes.exactDuration || Number((shiftAmount + narrResult.duration + sceneOutro).toFixed(2));
		} else {
			// Single speech stream (regular scene or chapter without extra pause)
			const fullText = cleanIntro ? `${cleanIntro} ... ${cleanNarration}` : cleanNarration;
			const singleResult = await synthesizeStream(fullText, voiceId, effectiveRate, effectivePitch);

			finalWordTimings = singleResult.wordTimings;

			// Append natural breathing room (0.6s) to end of scene audio
			const appendRes = await appendSilence(singleResult.audioBuffer, sceneOutro);
			finalBuffer = appendRes.audioBuffer;
			finalDuration = appendRes.exactDuration || Number((singleResult.duration + sceneOutro).toFixed(2));
		}

		const audioBase64 = finalBuffer.toString('base64');

		return json({
			success: true,
			audioUrl: `data:audio/mp3;base64,${audioBase64}`,
			wordTimings: finalWordTimings,
			duration: finalDuration,
			isRealVoice: true,
			provider: 'edge_tts',
			voiceId,
			audioEffect: effectPreset?.id || 'natural'
		});
	} catch (error) {
		console.error('Edge TTS generation error:', error);
		return json({
			success: false,
			error: `Edge TTS error: ${error.message || 'Gagal menghasilkan suara'}`
		}, { status: 500 });
	}
}
