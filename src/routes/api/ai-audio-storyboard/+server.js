import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { robustJsonParse } from '$lib/utils/jsonParser.js';

/**
 * Prepares compact 16kHz mono audio for Groq Whisper
 */
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
 * Measure exact audio duration via FFmpeg
 */
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
				resolve(0);
			}
		});
		proc.on('error', () => resolve(0));
	});
}

/**
 * Group whisper segments into coherent visual scene blocks based on pacing,
 * and tile them continuously from 0.0s to totalAudioDuration so visual length matches audio length 100%.
 */
function groupSegmentsIntoScenes(segments, pacing = 'balanced', totalAudioDuration = 0) {
	if (!segments || segments.length === 0) return [];

	let minSec = 4.0;
	let maxSec = 6.5;

	if (pacing === 'fast') {
		minSec = 2.8;
		maxSec = 4.5;
	} else if (pacing === 'relaxed') {
		minSec = 5.5;
		maxSec = 8.5;
	}

	const rawGroups = [];
	let currentGroup = {
		start: segments[0].start,
		end: segments[0].end,
		textParts: [segments[0].text.trim()]
	};

	for (let i = 1; i < segments.length; i++) {
		const seg = segments[i];
		const segText = seg.text.trim();
		const currentDuration = currentGroup.end - currentGroup.start;
		const potentialDuration = seg.end - currentGroup.start;
		const silenceGap = seg.start - currentGroup.end;

		const prevText = currentGroup.textParts[currentGroup.textParts.length - 1] || '';
		const endsWithPunct = /[.!?]$/.test(prevText);

		if (
			(currentDuration >= minSec && (endsWithPunct || silenceGap > 0.6)) ||
			potentialDuration > maxSec
		) {
			rawGroups.push({
				start: Number(currentGroup.start.toFixed(2)),
				end: Number(currentGroup.end.toFixed(2)),
				narration: currentGroup.textParts.join(' ').replace(/\s+/g, ' ').trim()
			});

			currentGroup = {
				start: seg.start,
				end: seg.end,
				textParts: [segText]
			};
		} else {
			currentGroup.end = seg.end;
			currentGroup.textParts.push(segText);
		}
	}

	if (currentGroup.textParts.length > 0) {
		rawGroups.push({
			start: Number(currentGroup.start.toFixed(2)),
			end: Number(currentGroup.end.toFixed(2)),
			narration: currentGroup.textParts.join(' ').replace(/\s+/g, ' ').trim()
		});
	}

	if (rawGroups.length === 0) return [];

	// Continuous Timeline Tiling:
	// Every scene starts when its speech begins (scene 0 starts at 0.0)
	// and extends until the next scene begins.
	// The last scene extends until totalAudioDuration!
	const scenes = [];
	const finalAudioDuration = Math.max(
		totalAudioDuration || 0,
		rawGroups[rawGroups.length - 1].end || 0
	);

	for (let i = 0; i < rawGroups.length; i++) {
		const g = rawGroups[i];
		const startTime = i === 0 ? 0.0 : g.start;
		let endTime = 0;

		if (i < rawGroups.length - 1) {
			endTime = rawGroups[i + 1].start;
		} else {
			endTime = finalAudioDuration;
		}

		let duration = Number((endTime - startTime).toFixed(2));
		if (duration <= 0.2) {
			duration = Number((g.end - g.start).toFixed(2)) || 3.0;
		}

		scenes.push({
			start: Number(startTime.toFixed(2)),
			end: Number((startTime + duration).toFixed(2)),
			duration,
			narration: g.narration
		});
	}

	// If there is still a significant trailing outro gap (> 7s) at the end:
	const lastEnd = scenes[scenes.length - 1].end;
	if (finalAudioDuration - lastEnd >= 7.0) {
		const outroDuration = Number((finalAudioDuration - lastEnd).toFixed(2));
		scenes.push({
			start: Number(lastEnd.toFixed(2)),
			end: Number(finalAudioDuration.toFixed(2)),
			duration: outroDuration,
			narration: 'Penutup video, musik outro, ajakan subscribe dan like channel.'
		});
	} else if (finalAudioDuration > lastEnd) {
		// Absorb any tiny trailing millisecond gap into the last scene
		const last = scenes[scenes.length - 1];
		last.end = Number(finalAudioDuration.toFixed(2));
		last.duration = Number((last.end - last.start).toFixed(2));
	}

	return scenes;
}

export async function POST({ request }) {
	const groqKey = (env.GROQ_API_KEY || process.env.GROQ_API_KEY || '').trim();
	const deepseekKey = (env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim();

	if (!groqKey && !deepseekKey) {
		return json(
			{
				success: false,
				error: 'API Key (GROQ_API_KEY atau DEEPSEEK_API_KEY) tidak ditemukan di konfigurasi server (.env).'
			},
			{ status: 400 }
		);
	}

	let tempAudioPath = '';
	let whisperAudioPath = '';
	let publicAudioPath = '';

	try {
		const formData = await request.formData();
		const audioFile = formData.get('audio');
		const styleTemplate =
			formData.get('styleTemplate') ||
			'A 2D cartoon digital illustration in the style of educational YouTube animation channels, featuring a nerdy young programmer character with a round white head, wide expressive eyes, messy brown hair, and wearing an oversized casual hoodie. Clean bold black outlines, smooth shading. --ar 16:9';
		const pacing = formData.get('pacing') || 'balanced'; // 'fast' | 'balanced' | 'relaxed'

		if (!audioFile || typeof audioFile === 'string') {
			return json({ success: false, error: 'File audio tidak ditemukan.' }, { status: 400 });
		}

		// Ensure cache dir exists
		const cacheDir = path.resolve('./static/renders/audio-cache');
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}

		const sessionId = crypto.randomBytes(6).toString('hex');
		const originalName = audioFile.name || 'audio.mp3';
		const originalExt = path.extname(originalName) || '.mp3';

		// Save original audio file to static dir so browser can stream/play it directly in timeline
		const publicFileName = `storyboard_${sessionId}${originalExt}`;
		publicAudioPath = path.join(cacheDir, publicFileName);
		const arrayBuf = await audioFile.arrayBuffer();
		fs.writeFileSync(publicAudioPath, Buffer.from(arrayBuf));

		// 1. Prepare 16kHz mono audio for Whisper
		whisperAudioPath = path.join(cacheDir, `whisper_prep_${sessionId}.mp3`);
		try {
			await prepareWhisperAudio(publicAudioPath, whisperAudioPath);
		} catch (prepErr) {
			console.warn('[Whisper Audio Prep Warning] Falling back to original audio:', prepErr.message);
		}

		const fileToUpload = fs.existsSync(whisperAudioPath) ? whisperAudioPath : publicAudioPath;
		const fileBuf = fs.readFileSync(fileToUpload);
		const fileBlob = new Blob([fileBuf], { type: 'audio/mpeg' });

		// 2. Transcribe using Groq Whisper
		let whisperData = null;
		const modelsToTry = ['whisper-large-v3-turbo', 'whisper-large-v3'];
		let lastWhisperError = null;

		for (const modelId of modelsToTry) {
			try {
				const whisperForm = new FormData();
				whisperForm.append('file', fileBlob, `audio_${sessionId}.mp3`);
				whisperForm.append('model', modelId);
				whisperForm.append('response_format', 'verbose_json');
				whisperForm.append('timestamp_granularities[]', 'segment');

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 60000);

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
					console.log(`[Groq Whisper Success] Transcribed with ${modelId}. Segments: ${whisperData.segments?.length || 0}`);
					break;
				} else {
					const errText = await whisperRes.text();
					lastWhisperError = new Error(`Groq Whisper ${modelId} failed: ${errText}`);
				}
			} catch (err) {
				lastWhisperError = err;
			}
		}

		// Clean up temporary whisper prep file
		if (fs.existsSync(whisperAudioPath)) {
			try { fs.unlinkSync(whisperAudioPath); } catch {}
		}

		if (!whisperData || !whisperData.segments || whisperData.segments.length === 0) {
			throw new Error(
				lastWhisperError?.message || 'Gagal melakukan transkripsi audio dengan Whisper. Pastikan audio berisi suara yang jelas.'
			);
		}

		// Measure exact audio duration from file via FFmpeg
		const exactFileDuration = await getAudioDurationFromFile(publicAudioPath);
		const totalDuration = Number((exactFileDuration || whisperData.duration || 0).toFixed(2));

		// 3. Group whisper segments into continuous video scene chunks matching total audio duration
		const rawScenes = groupSegmentsIntoScenes(whisperData.segments, pacing, totalDuration);
		if (rawScenes.length === 0) {
			throw new Error('Tidak ada segmen audio yang terdeteksi untuk dijadikan adegan.');
		}

		// 4. Send scenes to LLM in batches to generate rich, consistent visual action prompts in English
		const scenesForAI = rawScenes.map((sc, index) => ({
			sceneNumber: index + 1,
			start: sc.start,
			end: sc.end,
			duration: sc.duration,
			narration: sc.narration
		}));

		// Helper to translate narration into physical actions when AI is unavailable or fails
		function generateActionFallback(anchor, narrationText, sceneNum) {
			const cleanAnchor = anchor.replace(/\s*--ar\s*16:9/gi, '').trim();
			const lower = (narrationText || '').toLowerCase();

			let action = '';
			if (lower.includes('lowongan') || lower.includes('kerja') || lower.includes('kantor') || lower.includes('karir') || lower.includes('dicari') || lower.includes('rekrut')) {
				action = 'The character standing with a curious and questioning expression before an illuminated job vacancy bulletin board displaying abstract minimalist icons, one hand thoughtfully on chin, modern stylized room';
			} else if (lower.includes('uang') || lower.includes('gaji') || lower.includes('kaya') || lower.includes('juta') || lower.includes('rupiah') || lower.includes('cuan') || lower.includes('finansial')) {
				action = 'The character with wide joyful eyes, holding a glowing upward growth arrow, surrounded by stylized gold coins floating in ambient light, vibrant celebratory atmosphere';
			} else if (lower.includes('bingung') || lower.includes('kenapa') || lower.includes('mengapa') || lower.includes('apakah') || lower.includes('gimana') || lower.includes('tanya')) {
				action = 'The character scratching head with a puzzled and curious expression, eyebrow raised, questioning gesture, looking directly forward, soft ambient lighting';
			} else if (lower.includes('tipu') || lower.includes('bahaya') || lower.includes('hati-hati') || lower.includes('waspada') || lower.includes('bodong') || lower.includes('jebakan') || lower.includes('modus')) {
				action = 'The character stepping back with a suspicious squint, looking warily through a magnifying glass at a red glowing warning shield emblem, dramatic moody shadows';
			} else if (lower.includes('kaget') || lower.includes('syok') || lower.includes('heboh') || lower.includes('fantastis') || lower.includes('luar biasa') || lower.includes('gila')) {
				action = 'The character with wide open eyes and jaw dropped in total amazement, hands clasped to cheeks in shock, dynamic cinematic composition, dramatic lighting';
			} else if (lower.includes('komputer') || lower.includes('coding') || lower.includes('program') || lower.includes('teknologi') || lower.includes('ai') || lower.includes('laptop') || lower.includes('internet')) {
				action = 'The character focused intently in front of dual glowing computer monitors, hands swiftly typing on keyboard, colorful ambient screen reflection, cozy desk setup';
			} else if (lower.includes('buku') || lower.includes('belajar') || lower.includes('ilmu') || lower.includes('sekolah') || lower.includes('kuliah') || lower.includes('riset')) {
				action = 'The character sitting at a wooden desk with a stack of colorful books, turning a page enthusiastically, warm study lamp illumination';
			} else if (sceneNum === 1) {
				action = 'The character looking towards the viewer with a friendly welcoming expression, gesturing with an inviting open hand, clean well-lit studio background';
			} else {
				const actionsPool = [
					'The character standing in an explanatory posture, gesturing expressively with hands to illustrate a concept, medium cinematic shot, clean composition',
					'The character seated comfortably at a wooden desk, leaning forward with an engaging and enthusiastic expression, detailed background',
					'The character walking thoughtfully across the scene, looking contemplative, soft cinematic lighting and depth of field',
					'The character pointing dynamically towards an inspirational glowing concept icon, confident smile, clean aesthetic'
				];
				action = actionsPool[sceneNum % actionsPool.length];
			}

			return `${cleanAnchor}, ${action} --ar 16:9`;
		}

		// Helper to request a batch of scenes from AI models
		async function generateBatchPrompts(batchScenes) {
			const systemPrompt = `You are a professional visual storyboard director and prompt engineer for AI image generators (Midjourney, Flux, Stable Diffusion).
Your task is to take audio narration broken down into scenes, and create detailed, expressive visual action image generation prompts in English for EACH scene.

USER ART STYLE & CHARACTER ANCHOR:
"""${styleTemplate}"""

CRITICAL ANTI-TEXT DIRECTIVES (STRICT COMPLIANCE REQUIRED):
1. ABSOLUTELY NO TEXT, NO QUOTES, NO SPEECH BUBBLES, NO SPOKEN WORDS:
   - NEVER write phrases like: visualizing "...", showing text "...", speech bubble "...".
   - NEVER include the spoken Indonesian words or dialogue in the prompt.
   - Text prompts containing words or dialogue cause image models to render ugly, misspelled gibberish text on the image!
2. TRANSLATE NARRATION TO PHYSICAL ACTION & EMOTION:
   - Read the meaning of each scene's narration, then translate it into what the character is PHYSICALLY DOING.
   - Describe:
     * Character pose & gesture (e.g. scratching head in confusion, pointing at glowing blueprint, typing on laptop, inspecting with magnifying glass, jumping excitedly, crossing arms thoughtfully).
     * Facial expression (e.g. shocked jaw drop, curious squint, warm confident smile, furrowed brow of suspicion, wide eyes in awe).
     * Props & environment (e.g. wooden desk with coffee mug, futuristic digital monitor showing abstract charts with no readable text, cozy bedroom at night, neon urban alleyway).
     * Camera composition (e.g. close-up on expressive face, medium shot over shoulder, wide cinematic shot).
3. SEAMLESS COMPOSITION:
   - Combine the User's Art Style Anchor seamlessly with the character's scene action.
   - Every single prompt MUST end with "--ar 16:9".
4. SUITABLE MOTION: Suggest one motion from: ["zoom_in", "zoom_out", "pan_left", "pan_right", "diagonal_drift", "camera_shake", "pulse_pop", "none"].
5. SUITABLE TRANSITION: Suggest one transition into the next scene from: ["fade", "fadeblack", "fadewhite", "slideleft", "slideright", "circlecrop", "none"].

Return ONLY a JSON object in this exact schema:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "prompt": "...",
      "motion": "zoom_in",
      "transition": "fade"
    }
  ]
}`;

			// 1. Try DeepSeek first
			if (deepseekKey) {
				try {
					const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${deepseekKey}`
						},
						body: JSON.stringify({
							model: 'deepseek-chat',
							messages: [
								{ role: 'system', content: systemPrompt },
								{ role: 'user', content: `Here are the audio scenes for this batch:\n${JSON.stringify(batchScenes, null, 2)}` }
							],
							response_format: { type: 'json_object' },
							temperature: 0.5
						})
					});

					if (dsRes.ok) {
						const dsData = await dsRes.json();
						const content = dsData.choices?.[0]?.message?.content || '{}';
						const parsed = robustJsonParse(content);
						if (parsed?.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
							return parsed.scenes;
						}
					}
				} catch (dsErr) {
					console.warn('[DeepSeek Batch Warning]:', dsErr.message);
				}
			}

			// 2. Try Groq Qwen first (fast and reliable)
			if (groqKey) {
				try {
					const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${groqKey}`
						},
						body: JSON.stringify({
							model: 'qwen/qwen3.8-27b',
							messages: [
								{ role: 'system', content: systemPrompt },
								{ role: 'user', content: `Here are the audio scenes for this batch:\n${JSON.stringify(batchScenes, null, 2)}` }
							],
							response_format: { type: 'json_object' },
							temperature: 0.5
						})
					});

					if (groqRes.ok) {
						const groqData = await groqRes.json();
						const content = groqData.choices?.[0]?.message?.content || '{}';
						const parsed = robustJsonParse(content);
						if (parsed?.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
							return parsed.scenes;
						}
					}
				} catch (grErr) {
					console.warn('[Groq Qwen Batch Warning]:', grErr.message);
				}
			}

			// 3. Try Groq GPT-OSS as tertiary fallback
			if (groqKey) {
				try {
					const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${groqKey}`
						},
						body: JSON.stringify({
							model: 'openai/gpt-oss-120b',
							messages: [
								{ role: 'system', content: systemPrompt },
								{ role: 'user', content: `Here are the audio scenes for this batch:\n${JSON.stringify(batchScenes, null, 2)}` }
							],
							response_format: { type: 'json_object' },
							temperature: 0.5
						})
					});

					if (groqRes.ok) {
						const groqData = await groqRes.json();
						const content = groqData.choices?.[0]?.message?.content || '{}';
						const parsed = robustJsonParse(content);
						if (parsed?.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
							return parsed.scenes;
						}
					}
				} catch (grErr2) {
					console.warn('[Groq GPT-OSS Batch Warning]:', grErr2.message);
				}
			}

			return [];
		}

		// Split scenes into manageable batches of 15 to ensure fast responses and prevent truncation
		const BATCH_SIZE = 15;
		const batches = [];
		for (let i = 0; i < scenesForAI.length; i += BATCH_SIZE) {
			batches.push(scenesForAI.slice(i, i + BATCH_SIZE));
		}

		const batchResults = await Promise.all(batches.map((b) => generateBatchPrompts(b)));
		const allAiScenes = batchResults.flat();

		const aiScenesMap = new Map();
		for (const s of allAiScenes) {
			if (s && s.sceneNumber) {
				aiScenesMap.set(Number(s.sceneNumber), s);
			}
		}

		// Clean and assemble final scenes
		const finalScenes = rawScenes.map((sc, index) => {
			const sceneNum = index + 1;
			const aiData = aiScenesMap.get(sceneNum);

			let prompt = aiData?.prompt;
			if (typeof prompt === 'string') {
				// Strip any accidental 'visualizing "..."' or quoted narration text
				prompt = prompt
					.replace(/visualizing\s*["“][^"”]+["”]/gi, '')
					.replace(/,\s*visualizing\s*[^,\.]+/gi, '')
					.replace(/["“][^"”]{8,}["”]/g, '')
					.replace(/,\s*,/g, ',')
					.replace(/\s{2,}/g, ' ')
					.trim();
			}

			if (!prompt || typeof prompt !== 'string' || prompt.length < 25) {
				// Intelligent action fallback with zero quotes or spoken words
				prompt = generateActionFallback(styleTemplate, sc.narration, sceneNum);
			}

			// Ensure prompt ends with --ar 16:9
			if (!prompt.includes('--ar 16:9')) {
				prompt = `${prompt.replace(/\s*--ar\s*16:9/gi, '').trim()} --ar 16:9`;
			}

			return {
				id: `scene-${sceneNum}-${Date.now()}`,
				sceneNumber: sceneNum,
				start: sc.start,
				end: sc.end,
				duration: sc.duration,
				narration: sc.narration,
				prompt,
				motion: aiData?.motion || (sceneNum % 2 === 1 ? 'zoom_in' : 'pan_left'),
				transition: aiData?.transition || 'fade'
			};
		});

		// Convert whisper segments to max 5 words, 1 line, non-overlapping
		const MAX_WORDS = 5;
		const whisperSegments = [];
		const rawSegments = whisperData?.segments || [];

		for (const seg of rawSegments) {
			const clean = (seg.text || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
			if (!clean) continue;
			const words = clean.split(' ').filter(Boolean);
			const segStart = Math.max(0, Number(seg.start.toFixed(2)));
			const segEnd = Math.max(segStart + 0.3, Number(seg.end.toFixed(2)));
			const segDur = Math.max(0.3, segEnd - segStart);
			const totalWords = words.length;

			for (let i = 0; i < totalWords; i += MAX_WORDS) {
				const slice = words.slice(i, i + MAX_WORDS);
				const cStart = Number((segStart + (i / totalWords) * segDur).toFixed(2));
				const cEnd = Number((segStart + ((i + slice.length) / totalWords) * segDur).toFixed(2));
				const start = Math.max(0, cStart);
				const end = Math.max(start + 0.25, cEnd);
				whisperSegments.push({
					id: `sub-seg-${whisperSegments.length + 1}`,
					start,
					end,
					duration: Number((end - start).toFixed(2)),
					text: slice.join(' ')
				});
			}
		}

		whisperSegments.sort((a, b) => a.start - b.start);
		for (let i = 0; i < whisperSegments.length - 1; i++) {
			if (whisperSegments[i].end > whisperSegments[i + 1].start) {
				whisperSegments[i].end = whisperSegments[i + 1].start;
				whisperSegments[i].duration = Number(Math.max(0.1, whisperSegments[i].end - whisperSegments[i].start).toFixed(2));
			}
		}

		return json({
			success: true,
			audioUrl: `/renders/audio-cache/${publicFileName}`,
			audioName: originalName,
			totalDuration: Number(totalDuration.toFixed(2)),
			scenes: finalScenes,
			whisperSegments
		});
	} catch (error) {
		console.error('[AI Audio Storyboard Error]:', error);
		return json(
			{
				success: false,
				error: error.message || 'Terjadi kesalahan saat memproses audio dan membuat storyboard.'
			},
			{ status: 500 }
		);
	}
}
