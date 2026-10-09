import { json } from '@sveltejs/kit';
import { GEMINI_TTS_VOICES, DEFAULT_GEMINI_VOICE_ID } from '$lib/services/voiceService.js';
import { generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
import { getAudioEffectById } from '$lib/services/audioEffectService.js';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let cachedTtsModels = null;
let lastKnownWorkingModel = null;

async function fetchWithRetry(url, options, maxRetries = 2) {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const res = await fetch(url, options);
		if (res.status === 429 && attempt < maxRetries) {
			const delayMs = attempt === 0 ? 3000 : 5500;
			console.warn(`[Gemini TTS] Rate limit 429. Waiting ${delayMs}ms before retry ${attempt + 1}/${maxRetries}...`);
			await new Promise((r) => setTimeout(r, delayMs));
			continue;
		}
		return res;
	}
}

export async function GET({ url }) {
	const apiKey = (url.searchParams.get('apiKey') || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

	let keyValid = null;
	if (apiKey && apiKey.length > 15) {
		try {
			// Quick lightweight check on Gemini API models
			const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
			keyValid = testRes.ok;
		} catch {
			keyValid = false;
		}
	}

	return json({
		success: true,
		voices: GEMINI_TTS_VOICES,
		defaultVoiceId: DEFAULT_GEMINI_VOICE_ID,
		keyValid
	});
}

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

function convertAudioToMp3(inputBuffer, filterString = '') {
	return new Promise(async (resolve, reject) => {
		const tempId = `gemini-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const dir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(dir, { recursive: true });

		const isRiff = inputBuffer.length >= 4 && inputBuffer.toString('ascii', 0, 4) === 'RIFF';
		const isMp3 = inputBuffer.length >= 3 && (inputBuffer.toString('ascii', 0, 3) === 'ID3' || (inputBuffer[0] === 0xFF && (inputBuffer[1] & 0xE0) === 0xE0));
		const isRawPcm = !isRiff && !isMp3;

		const inExt = isRiff ? 'wav' : (isMp3 ? 'mp3' : 'pcm');
		const pathIn = path.join(dir, `${tempId}-in.${inExt}`);
		const pathOut = path.join(dir, `${tempId}-out.mp3`);

		await fs.promises.writeFile(pathIn, inputBuffer);

		const silenceFilter = 'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-38dB,areverse,silenceremove=start_periods=1:start_duration=0.03:start_threshold=-38dB,areverse';
		const effectiveFilter = filterString && filterString.trim() ? `${filterString},${silenceFilter}` : silenceFilter;

		const inputArgs = isRawPcm 
			? ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pathIn]
			: ['-i', pathIn];

		const args = [
			...inputArgs,
			'-af', effectiveFilter,
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			'-ar', '44100',
			'-y', pathOut
		];

		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });

		proc.on('close', async (code) => {
			if (code === 0 && fs.existsSync(pathOut)) {
				try {
					const outBuf = await fs.promises.readFile(pathOut);
					const dur = await getAudioDurationFromFile(pathOut);
					await Promise.all([
						fs.promises.unlink(pathIn).catch(() => {}),
						fs.promises.unlink(pathOut).catch(() => {})
					]);
					resolve({ audioBuffer: outBuf, duration: dur });
				} catch (err) {
					reject(err);
				}
			} else {
				console.warn('FFmpeg convert with filter warning, retrying plain conversion:', stderr);
				const fallbackProc = spawn(ffmpegPath || 'ffmpeg', [
					...inputArgs,
					'-c:a', 'libmp3lame',
					'-b:a', '192k',
					'-ar', '44100',
					'-y', pathOut
				]);
				fallbackProc.on('close', async (fallbackCode) => {
					if (fallbackCode === 0 && fs.existsSync(pathOut)) {
						try {
							const outBuf = await fs.promises.readFile(pathOut);
							const dur = await getAudioDurationFromFile(pathOut);
							await Promise.all([
								fs.promises.unlink(pathIn).catch(() => {}),
								fs.promises.unlink(pathOut).catch(() => {})
							]);
							resolve({ audioBuffer: outBuf, duration: dur });
						} catch (e) {
							reject(e);
						}
					} else {
						await fs.promises.unlink(pathIn).catch(() => {});
						await fs.promises.unlink(pathOut).catch(() => {});
						reject(new Error(`FFmpeg audio conversion failed: ${stderr.slice(-200)}`));
					}
				});
				fallbackProc.on('error', (err) => {
					fs.promises.unlink(pathIn).catch(() => {});
					fs.promises.unlink(pathOut).catch(() => {});
					reject(err);
				});
			}
		});

		proc.on('error', (err) => {
			fs.promises.unlink(pathIn).catch(() => {});
			fs.promises.unlink(pathOut).catch(() => {});
			reject(err);
		});
	});
}

export async function POST({ request }) {
	try {
		const {
			text,
			voiceId = 'gemini-Puck',
			voiceName,
			apiKey,
			audioEffect = 'studio_podcast',
			model = 'gemini-3.8-flash'
		} = await request.json();

		if (!text || !text.trim()) {
			return json({ success: false, error: 'Teks voiceover wajib diisi' }, { status: 400 });
		}

		const cleanText = text.trim();
		const effectiveApiKey = (apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

		if (!effectiveApiKey || effectiveApiKey.length < 15) {
			return json({
				success: false,
				error: 'Gemini API Key belum dimasukkan. Dapatkan API Key gratis di https://aistudio.google.com lalu masukkan pada kolom Gemini API.'
			}, { status: 400 });
		}

		// Normalize voice name (e.g. 'gemini-Puck' -> 'Puck')
		let targetVoiceName = (voiceName || voiceId || 'Puck').replace(/^gemini-/, '').trim();
		const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Zephyr', 'Orus'];
		if (!validVoices.some((v) => v.toLowerCase() === targetVoiceName.toLowerCase())) {
			targetVoiceName = 'Puck';
		} else {
			// Ensure proper casing (e.g. puck -> Puck)
			const found = validVoices.find((v) => v.toLowerCase() === targetVoiceName.toLowerCase());
			if (found) targetVoiceName = found;
		}

		// 0. Disk Cache Check (Zero-cost repeat generation)
		const effectPreset = getAudioEffectById(audioEffect);
		const effectId = effectPreset?.id || 'natural';

		const textHash = crypto
			.createHash('md5')
			.update(`${cleanText}:::${targetVoiceName}:::${effectId}`)
			.digest('hex');

		const cacheDir = path.resolve('./static/renders/audio-cache');
		await fs.promises.mkdir(cacheDir, { recursive: true });

		const cacheMetaPath = path.join(cacheDir, `gemini-meta-${textHash}.json`);
		const cacheAudioPath = path.join(cacheDir, `gemini-audio-${textHash}.mp3`);

		if (fs.existsSync(cacheMetaPath) && fs.existsSync(cacheAudioPath)) {
			try {
				const meta = JSON.parse(await fs.promises.readFile(cacheMetaPath, 'utf-8'));
				const audioBuf = await fs.promises.readFile(cacheAudioPath);
				console.log(`[Gemini TTS] Disk Cache HIT (${textHash}) for: "${cleanText.slice(0, 30)}..."`);
				return json({
					success: true,
					audioUrl: `data:audio/mp3;base64,${audioBuf.toString('base64')}`,
					staticAudioUrl: `/renders/audio-cache/gemini-audio-${textHash}.mp3`,
					serverAudioPath: cacheAudioPath,
					audioFileKey: `gemini-audio-${textHash}.mp3`,
					duration: meta.duration,
					wordTimings: meta.wordTimings || [],
					voiceId: `gemini-${targetVoiceName}`,
					voiceName: targetVoiceName,
					provider: 'gemini_tts',
					audioEffect: effectId,
					isRealVoice: true,
					fromCache: true
				});
			} catch (_) {}
		}

		// For TTS models, send verbatim text so the model speaks the exact words
		const payload = {
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: cleanText
						}
					]
				}
			],
			generationConfig: {
				responseModalities: ['AUDIO'],
				speechConfig: {
					voiceConfig: {
						prebuiltVoiceConfig: {
							voiceName: targetVoiceName
						}
					}
				}
			}
		};

		// 1. Check which models are available for this specific API key (cached in-memory)
		if (!cachedTtsModels) {
			try {
				const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveApiKey}`);
				if (listRes.ok) {
					const listData = await listRes.json();
					const mList = listData.models || [];
					cachedTtsModels = mList
						.map((m) => m.name.replace(/^models\//, ''))
						.filter((m) => m.includes('tts') || m.includes('speech'));
					console.log('[Gemini TTS] Discovered TTS models for key:', cachedTtsModels);
				}
			} catch (err) {
				console.warn('[Gemini TTS] Could not list models:', err.message);
			}
		}

		// Candidate models in strict priority order (last known working first, then TTS models)
		const candidateModels = [
			lastKnownWorkingModel,
			...(cachedTtsModels || []),
			'gemini-3.8-flash-tts',
			'gemini-3.8-flash-lite-tts',
			'gemini-2.5-flash-tts',
			'gemini-2.5-flash',
			model,
			'gemini-3.8-flash'
		].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

		let geminiRes = null;
		let audioPart = null;
		let lastErrorMsg = '';

		for (const currentModel of candidateModels) {
			const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${effectiveApiKey}`;
			try {
				const res = await fetchWithRetry(apiUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}, 2);

				if (res.ok) {
					const data = await res.json();
					const candidate = data.candidates?.[0];
					const parts = candidate?.content?.parts || [];

					// Check if audio part exists in response
					const foundAudio = parts.find(
						(p) => p.inlineData?.data || p.inline_data?.data || p.audio?.data
					);

					if (foundAudio) {
						geminiRes = res;
						audioPart = foundAudio;
						lastKnownWorkingModel = currentModel;
						console.log(`[Gemini TTS] Success with model: ${currentModel}`);
						break;
					} else {
						const textResp = parts.map((p) => p.text).filter(Boolean).join(' ');
						console.warn(
							`[Gemini TTS] Model ${currentModel} returned 200 OK but text only: "${textResp.slice(0, 100)}". Trying next model...`
						);
						lastErrorMsg = textResp || 'Model tidak mengembalikan audio';
					}
				} else {
					const errBody = await res.json().catch(() => ({}));
					const msg = errBody?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
					lastErrorMsg = msg;

					// If invalid API key, stop trying models
					if (res.status === 400 && msg.toLowerCase().includes('api key')) {
						geminiRes = res;
						break;
					}

					console.warn(`[Gemini TTS] Model ${currentModel} error: ${msg}. Trying next fallback...`);
				}
			} catch (fetchErr) {
				lastErrorMsg = fetchErr.message;
				console.warn(`[Gemini TTS] Fetch error for ${currentModel}:`, fetchErr.message);
			}
		}

		if (!audioPart) {
			console.error('Gemini TTS failed to get audio part. Last error:', lastErrorMsg);

			if (lastErrorMsg.toLowerCase().includes('quota') || lastErrorMsg.includes('429')) {
				return json({
					success: false,
					error: 'Batas kuota Gemini tercapai (Rate Limit 429). Tunggu beberapa detik lalu coba lagi.'
				}, { status: 429 });
			}

			if (lastErrorMsg.toLowerCase().includes('api key')) {
				return json({
					success: false,
					error: 'Gemini API Key tidak valid. Mohon periksa kembali API Key Anda dari Google AI Studio.'
				}, { status: 400 });
			}

			return json({
				success: false,
				error: `Gemini TTS: ${lastErrorMsg || 'Model tidak mengembalikan data audio untuk teks ini. Silakan coba kembali atau gunakan Edge TTS (Gratis).'}`
			}, { status: 500 });
		}

		const rawAudioBase64 = audioPart.inlineData?.data || audioPart.inline_data?.data || audioPart.audio?.data;
		const rawBuffer = Buffer.from(rawAudioBase64, 'base64');

		// Apply DSP filter if selected
		const activeFfmpegFilter = (effectPreset?.id !== 'natural' ? effectPreset?.ffmpegFilter : '') || '';

		const { audioBuffer: finalBuffer, duration: measuredDuration } = await convertAudioToMp3(
			rawBuffer,
			activeFfmpegFilter
		);

		const words = cleanText.split(/\s+/).filter(Boolean);
		const finalDuration = measuredDuration || Math.max(2.5, Number((words.length * 0.42).toFixed(2)));
		const wordTimings = generateSyntheticWordTimings(words, finalDuration);

		// Cache to static dir with unique hash and persistent access
		const fileKey = `gemini-audio-${textHash}.mp3`;
		const persistentPath = path.join(cacheDir, fileKey);
		await fs.promises.writeFile(persistentPath, finalBuffer);

		// Save meta for instant cache retrieval
		await fs.promises.writeFile(
			cacheMetaPath,
			JSON.stringify({
				duration: finalDuration,
				wordTimings,
				voiceName: targetVoiceName,
				created: Date.now()
			})
		);

		const finalBase64 = finalBuffer.toString('base64');

		return json({
			success: true,
			audioUrl: `data:audio/mp3;base64,${finalBase64}`,
			staticAudioUrl: `/renders/audio-cache/${fileKey}`,
			serverAudioPath: persistentPath,
			audioFileKey: fileKey,
			duration: finalDuration,
			wordTimings,
			voiceId: `gemini-${targetVoiceName}`,
			voiceName: targetVoiceName,
			provider: 'gemini_tts',
			audioEffect: effectPreset?.id || 'natural',
			isRealVoice: true
		});
	} catch (error) {
		console.error('Gemini TTS processing error:', error);
		return json({
			success: false,
			error: `Gagal memproses Gemini Voice: ${error.message || 'Terjadi kesalahan internal'}`
		}, { status: 500 });
	}
}
