import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { searchClipsWithFallback } from '$lib/services/giphyService.js';
import { generateSyntheticWordTimings } from '$lib/services/subtitleService.js';

const DEFAULT_GIPHY_KEY = env.GIPHY_API_KEY || '';
const DEFAULT_PEXELS_KEY = env.PEXELS_API_KEY || '';

function sliceAudioSegment(inputPath, outputPath, startTime, endTime) {
	return new Promise((resolve, reject) => {
		const duration = Math.max(0.5, endTime - startTime);
		const args = [
			'-y',
			'-ss', startTime.toFixed(3),
			'-t', duration.toFixed(3),
			'-i', inputPath,
			'-c:a', 'libmp3lame',
			'-b:a', '192k',
			outputPath
		];

		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', (code) => {
			if (code === 0) {
				resolve(Number(duration.toFixed(2)));
			} else {
				reject(new Error(`FFmpeg slice error (code ${code}): ${stderr.slice(-300)}`));
			}
		});
		proc.on('error', (err) => reject(err));
	});
}

function prepareWhisperAudio(inputPath, outputPath) {
	return new Promise((resolve, reject) => {
		const args = [
			'-y',
			'-i', inputPath,
			'-ar', '16000',
			'-ac', '1',
			'-c:a', 'libmp3lame',
			'-b:a', '64k',
			outputPath
		];
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg audio prep error: ${stderr.slice(-200)}`));
		});
		proc.on('error', reject);
	});
}

/**
 * Group whisper speech segments into optimal Shorts scene lengths (target: 2.8s - 5.5s)
 */
function groupSegmentsIntoScenes(segments, allWords = [], minSec = 2.8, maxSec = 5.5) {
	if (!segments || segments.length === 0) return [];

	const scenes = [];
	let currentScene = {
		start: segments[0].start,
		end: segments[0].end,
		textParts: [segments[0].text.trim()]
	};

	for (let i = 1; i < segments.length; i++) {
		const seg = segments[i];
		const segText = seg.text.trim();
		const currentDuration = currentScene.end - currentScene.start;
		const potentialDuration = seg.end - currentScene.start;
		const silenceGap = seg.start - currentScene.end;

		const prevText = currentScene.textParts[currentScene.textParts.length - 1] || '';
		const endsWithPunct = /[.!?]$/.test(prevText);

		// If current duration already meets minSec AND (sentence ended OR pause > 0.6s OR potential duration exceeds maxSec)
		if (
			(currentDuration >= minSec && (endsWithPunct || silenceGap > 0.6)) ||
			potentialDuration > maxSec
		) {
			scenes.push({
				start: Number(currentScene.start.toFixed(2)),
				end: Number(currentScene.end.toFixed(2)),
				narration: currentScene.textParts.join(' ').replace(/\s+/g, ' ').trim()
			});

			currentScene = {
				start: seg.start,
				end: seg.end,
				textParts: [segText]
			};
		} else {
			currentScene.end = seg.end;
			currentScene.textParts.push(segText);
		}
	}

	if (currentScene.textParts.length > 0) {
		scenes.push({
			start: Number(currentScene.start.toFixed(2)),
			end: Number(currentScene.end.toFixed(2)),
			narration: currentScene.textParts.join(' ').replace(/\s+/g, ' ').trim()
		});
	}

	return scenes.map((sc) => {
		const scWords = allWords.filter(
			(w) => w.start >= sc.start - 0.05 && w.end <= sc.end + 0.15
		);

		let wordTimings = [];
		if (scWords.length > 0) {
			wordTimings = scWords.map((w) => ({
				word: (w.word || '').trim(),
				start: Math.max(0, Number((w.start - sc.start).toFixed(2))),
				end: Math.max(0.05, Number((w.end - sc.start).toFixed(2)))
			}));
		} else {
			const words = sc.narration.split(/\s+/).filter(Boolean);
			const duration = Math.max(1, sc.end - sc.start);
			wordTimings = generateSyntheticWordTimings(words, duration);
		}

		return {
			...sc,
			duration: Number((sc.end - sc.start).toFixed(2)),
			wordTimings
		};
	});
}

export async function POST({ request }) {
	const groqKey = (env.GROQ_API_KEY || process.env.GROQ_API_KEY || '').trim();
	if (!groqKey) {
		return json(
			{
				success: false,
				error: 'GROQ_API_KEY tidak ditemukan di .env. Pastikan GROQ_API_KEY sudah diset.'
			},
			{ status: 400 }
		);
	}

	let tempAudioPath = '';
	let whisperAudioPath = '';

	try {
		const formData = await request.formData();
		const audioFile = formData.get('audio');
		const theme = formData.get('theme') || 'dark-psychology';
		const pacing = formData.get('pacing') || 'balanced'; // 'fast' | 'balanced' | 'relaxed'
		const footageSource = formData.get('footageSource') || 'auto';
		const userGiphyKey = (formData.get('giphyApiKey') || '').trim();
		const effectiveGiphyKey = userGiphyKey.length > 10 ? userGiphyKey : DEFAULT_GIPHY_KEY;

		if (!audioFile || typeof audioFile === 'string') {
			return json({ success: false, error: 'File audio tidak ditemukan.' }, { status: 400 });
		}

		const cacheDir = path.resolve('./static/renders/audio-cache');
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}

		const sessionId = crypto.randomBytes(6).toString('hex');
		const originalExt = path.extname(audioFile.name || 'audio.mp3') || '.mp3';
		tempAudioPath = path.join(cacheDir, `shorts_upload_${sessionId}${originalExt}`);

		// Write uploaded file
		const arrayBuf = await audioFile.arrayBuffer();
		fs.writeFileSync(tempAudioPath, Buffer.from(arrayBuf));

		// 1. Prepare ultra-compact 16kHz mono audio for Groq Whisper (<2MB)
		whisperAudioPath = path.join(cacheDir, `shorts_whisper_prep_${sessionId}.mp3`);
		try {
			await prepareWhisperAudio(tempAudioPath, whisperAudioPath);
		} catch (prepErr) {
			console.warn('[Shorts Whisper Prep] Using raw audio directly:', prepErr.message);
		}

		const fileToUpload = fs.existsSync(whisperAudioPath) ? whisperAudioPath : tempAudioPath;
		const fileBuf = fs.readFileSync(fileToUpload);
		const fileBlob = new Blob([fileBuf], { type: 'audio/mpeg' });

		// 2. Transcribe with Groq Whisper
		let whisperData = null;
		const modelsToTry = ['whisper-large-v3-turbo', 'whisper-large-v3'];
		let lastError = null;

		for (const modelId of modelsToTry) {
			try {
				const whisperForm = new FormData();
				whisperForm.append('file', fileBlob, `audio_${sessionId}.mp3`);
				whisperForm.append('model', modelId);
				whisperForm.append('response_format', 'verbose_json');
				whisperForm.append('timestamp_granularities[]', 'segment');
				whisperForm.append('timestamp_granularities[]', 'word');

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 90000);

				const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${groqKey}`
					},
					body: whisperForm,
					signal: controller.signal
				});

				clearTimeout(timeoutId);

				if (whisperRes.ok) {
					whisperData = await whisperRes.json();
					console.log(`[Shorts Whisper] Success using ${modelId}! Segments: ${whisperData.segments?.length || 0}`);
					break;
				} else {
					const errText = await whisperRes.text();
					lastError = new Error(`Groq Whisper ${modelId} error (${whisperRes.status}): ${errText}`);
					console.warn(`[Shorts Whisper ${modelId} failed]:`, errText);
				}
			} catch (fetchErr) {
				const cause = fetchErr.cause ? (fetchErr.cause.message || fetchErr.cause.code || JSON.stringify(fetchErr.cause)) : '';
				lastError = new Error(`Groq Whisper ${modelId} fetch failed: ${fetchErr.message}${cause ? ` (${cause})` : ''}`);
				console.warn(`[Shorts Whisper fetch attempt failed]:`, lastError.message);
			}
		}

		// Clean up prep file
		if (fs.existsSync(whisperAudioPath)) {
			try { fs.unlinkSync(whisperAudioPath); } catch {}
		}

		if (!whisperData) {
			try { fs.unlinkSync(tempAudioPath); } catch {}
			return json(
				{
					success: false,
					error: lastError ? lastError.message : 'Gagal menghubungi Groq Whisper API.'
				},
				{ status: 500 }
			);
		}

		const rawSegments = whisperData.segments || [];
		const rawWords = whisperData.words || [];

		if (rawSegments.length === 0 && !whisperData.text) {
			try { fs.unlinkSync(tempAudioPath); } catch {}
			return json(
				{ success: false, error: 'Groq Whisper tidak mendeteksi suara ucapan dalam audio ini.' },
				{ status: 400 }
			);
		}

		// Pacing configuration
		let minSec = 2.8;
		let maxSec = 5.2;
		if (pacing === 'fast') {
			minSec = 2.2;
			maxSec = 4.2;
		} else if (pacing === 'relaxed') {
			minSec = 4.0;
			maxSec = 7.0;
		}

		// Group speech segments into scenes
		const sceneGroups = groupSegmentsIntoScenes(rawSegments, rawWords, minSec, maxSec);

		// 3. AI Scene & Visual Analysis (DeepSeek / Groq Llama)
		const deepseekKey = (env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim();
		let aiTitle = (whisperData.text || '').slice(0, 50).trim();
		let aiScenePlan = {};

		const scenesPayload = sceneGroups.map((sc, idx) => ({
			id: idx + 1,
			narration: sc.narration
		}));

		const systemPrompt = `You are a world-class YouTube Shorts & TikTok Creative Director.
You are given the full transcription and segmented scenes of a user's voiceover.

Your mission:
1. "title": A viral, curiosity-piquing YouTube Shorts title (max 50 chars, Indonesian or English matching the voice).
2. For each scene:
   - "spokenText": Accurate, cleaned up version of the narration for this scene.
   - "visualDescription": Brief visual concept for this scene.
   - "giphyQuery": 1 to 2 punchy ENGLISH search words for finding the BEST animated GIF or video clip on GIPHY.
     CRITICAL: 1 OR 2 WORDS ONLY! Never use sentences or long phrases.
     Examples: "mind blown", "shocked", "dark smile", "money rain", "panicking", "whisper", "running", "brain glow", "coffee break", "evil plan", "detective".
     Every scene MUST use a DIFFERENT query to ensure visual variety.

Return ONLY valid JSON:
{
  "title": "Judul Viral Singkat",
  "scenes": [
    {
      "id": 1,
      "spokenText": "...",
      "visualDescription": "...",
      "giphyQuery": "..."
    }
  ]
}`;

		const userPrompt = `THEME: ${theme}\nFULL TRANSCRIPT:\n${whisperData.text}\n\nSCENES:\n${JSON.stringify(scenesPayload)}`;

		let aiSuccess = false;

		// Try DeepSeek first
		if (deepseekKey) {
			try {
				const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${deepseekKey}`
					},
					body: JSON.stringify({
						model: 'deepseek-chat',
						messages: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: userPrompt }
						],
						response_format: { type: 'json_object' },
						temperature: 0.4
					})
				});

				if (dsRes.ok) {
					const dsData = await dsRes.json();
					const parsed = JSON.parse(dsData.choices?.[0]?.message?.content || '{}');
					if (parsed.title) aiTitle = parsed.title;
					if (Array.isArray(parsed.scenes)) {
						for (const sc of parsed.scenes) {
							aiScenePlan[sc.id] = sc;
						}
						aiSuccess = true;
						console.log(`[Shorts AI Analysis] DeepSeek analyzed ${parsed.scenes.length} scenes.`);
					}
				}
			} catch (dsErr) {
				console.warn('[Shorts AI Analysis] DeepSeek failed:', dsErr.message);
			}
		}

		// Fallback to Groq Llama if DeepSeek was unavailable or failed
		if (!aiSuccess && groqKey) {
			try {
				const groqAiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${groqKey}`
					},
					body: JSON.stringify({
						model: 'llama-3.3-70b-versatile',
						messages: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: userPrompt }
						],
						response_format: { type: 'json_object' },
						temperature: 0.4
					})
				});

				if (groqAiRes.ok) {
					const gData = await groqAiRes.json();
					const parsed = JSON.parse(gData.choices?.[0]?.message?.content || '{}');
					if (parsed.title) aiTitle = parsed.title;
					if (Array.isArray(parsed.scenes)) {
						for (const sc of parsed.scenes) {
							aiScenePlan[sc.id] = sc;
						}
						aiSuccess = true;
						console.log(`[Shorts AI Analysis] Groq Llama analyzed ${parsed.scenes.length} scenes.`);
					}
				}
			} catch (gErr) {
				console.warn('[Shorts AI Analysis] Groq Llama fallback failed:', gErr.message);
			}
		}

		// 4. Slice Audio per Scene + Fetch Footage from GIPHY
		const finalScenes = [];

		for (let i = 0; i < sceneGroups.length; i++) {
			const grp = sceneGroups[i];
			const sceneIdx = i + 1;
			const sceneId = `sc_${sessionId}_${sceneIdx}`;
			const outFileName = `shorts_voice_${sceneId}.mp3`;
			const outFilePath = path.join(cacheDir, outFileName);

			// FFmpeg slice
			let exactDuration = grp.duration;
			try {
				exactDuration = await sliceAudioSegment(tempAudioPath, outFilePath, grp.start, grp.end);
			} catch (err) {
				console.warn(`[Shorts Audio Slice] Failed slicing scene ${sceneIdx}:`, err.message);
			}

			const aiScene = aiScenePlan[sceneIdx] || {};
			const spokenText = aiScene.spokenText || grp.narration;
			const visualDescription = aiScene.visualDescription || `Visual untuk adegan ${sceneIdx}`;
			let giphyQuery = (aiScene.giphyQuery || '').trim();

			// Fallback giphyQuery if missing
			if (!giphyQuery) {
				const words = spokenText.split(/\s+/).filter((w) => w.length > 2);
				giphyQuery = words.slice(0, 2).join(' ') || 'reaction';
			}

			// Clean query: limit to max 2 words
			const queryParts = giphyQuery.split(/\s+/).filter(Boolean);
			if (queryParts.length > 2) {
				giphyQuery = queryParts.slice(0, 2).join(' ');
			}

			// Auto search GIPHY / Pexels footage
			let clips = [];
			let selectedClip = null;
			try {
				const clipRes = await searchClipsWithFallback({
					query: giphyQuery,
					theme,
					giphyKey: effectiveGiphyKey,
					pexelsKey: DEFAULT_PEXELS_KEY,
					limit: 6,
					sceneIndex: i,
					sourcePreference: footageSource
				});

				if (clipRes && clipRes.clips && clipRes.clips.length > 0) {
					clips = clipRes.clips;
					selectedClip = clipRes.clips[0];
				}
			} catch (clipErr) {
				console.warn(`[Shorts Clip Search] Error for scene ${sceneIdx}:`, clipErr.message);
			}

			finalScenes.push({
				id: sceneIdx,
				duration: exactDuration,
				audioDuration: exactDuration,
				spokenText,
				visualDescription,
				giphyQuery,
				voiceAudioUrl: `/renders/audio-cache/${outFileName}`,
				audioPath: outFilePath,
				wordTimings: grp.wordTimings,
				selectedClip,
				clips
			});
		}

		// Clean up original uploaded file
		try { fs.unlinkSync(tempAudioPath); } catch {}

		const totalEstDuration = finalScenes.reduce((acc, sc) => acc + sc.duration, 0);

		return json({
			success: true,
			title: aiTitle || 'Shorts Video',
			fullTranscript: whisperData.text,
			totalDuration: Number(totalEstDuration.toFixed(1)),
			language: whisperData.language || 'id',
			scenes: finalScenes
		});
	} catch (err) {
		console.error('[Shorts Audio Whisper Error]', err);
		if (tempAudioPath && fs.existsSync(tempAudioPath)) {
			try { fs.unlinkSync(tempAudioPath); } catch {}
		}
		if (whisperAudioPath && fs.existsSync(whisperAudioPath)) {
			try { fs.unlinkSync(whisperAudioPath); } catch {}
		}
		return json(
			{
				success: false,
				error: err.message || 'Terjadi kesalahan saat memproses voice audio untuk Shorts.'
			},
			{ status: 500 }
		);
	}
}
