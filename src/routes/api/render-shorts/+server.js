import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { spawn, execFile } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import ffmpegPath from 'ffmpeg-static';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const execFileAsync = util.promisify(execFile);

// ------------------------------------------------------------------
// Shorts Config
// ------------------------------------------------------------------
const W = 1080;
const H = 1920;
const FPS = 30;
const RENDERS_DIR = path.resolve('./static/renders/shorts');
const TEMP_DIR = path.resolve('./static/renders/shorts-temp');
const TTS_CACHE_DIR = path.resolve('./static/renders/tts-cache');

// ------------------------------------------------------------------
// BGM Mapping
// ------------------------------------------------------------------
const BGM_MAP = {
	'dark-suspense': './static/bgm/bgm-tension.mp3',
	'lofi-chill':    './static/bgm/bgm-lofi-chill.mp3',
	ambient:         './static/bgm/bgm-ambient.mp3',
	inspiring:       './static/bgm/bgm-inspiring.mp3',
	playful:         './static/bgm/bgm-stickman-playful.mp3',
	none:            null
};

// ------------------------------------------------------------------
// Subtitle Style Definitions for 9:16
// ------------------------------------------------------------------
const SUBTITLE_STYLES = {
	'viral-yellow': { fontName: 'Arial Black', fontSize: 72, primaryColor: 'FFE800', outlineColor: '000000', shadowColor: '000000', outlineSize: 7, shadow: 3, bold: true, alignment: 2, marginV: 280 },
	'mrbeast-bold': { fontName: 'Impact',     fontSize: 80, primaryColor: 'FFFFFF', outlineColor: '000000', shadowColor: '000000', outlineSize: 8, shadow: 4, bold: true, alignment: 2, marginV: 280 },
	minimal:        { fontName: 'Arial Black', fontSize: 66, primaryColor: 'FFFFFF', outlineColor: '000000', shadowColor: '000000', outlineSize: 5, shadow: 2, bold: true, alignment: 2, marginV: 280 }
};

// ------------------------------------------------------------------
// Utility: runFFmpeg
// ------------------------------------------------------------------
function runFFmpeg(args, timeoutMs = 300000) {
	return new Promise((resolve, reject) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		const timer = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error(`FFmpeg timeout ${Math.round(timeoutMs / 1000)}s`)); }, timeoutMs);
		proc.on('close', (code) => { clearTimeout(timer); if (code === 0) resolve(stderr); else reject(new Error(`FFmpeg exit ${code}: ${stderr.slice(-2000)}`)); });
		proc.on('error', (e) => { clearTimeout(timer); reject(e); });
	});
}

// ------------------------------------------------------------------
// Utility: get audio duration
// ------------------------------------------------------------------
function getAudioDuration(filePath) {
	return new Promise((resolve) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', ['-i', filePath]);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', () => {
			const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
			resolve(m ? parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]) : null);
		});
		proc.on('error', () => resolve(null));
	});
}

// ------------------------------------------------------------------
// Utility: download file from URL (with redirect follow)
// ------------------------------------------------------------------
function downloadFile(url, dest) {
	return new Promise((resolve, reject) => {
		const proto = url.startsWith('https') ? https : http;
		const file = fs.createWriteStream(dest);
		const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
			if (res.statusCode === 301 || res.statusCode === 302) {
				file.close(); fs.unlink(dest, () => {});
				return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
			}
			if (res.statusCode !== 200) {
				file.close(); fs.unlink(dest, () => {});
				return reject(new Error(`HTTP ${res.statusCode}`));
			}
			res.pipe(file);
			file.on('finish', () => { file.close(); resolve(dest); });
		});
		req.on('error', (e) => { file.close(); fs.unlink(dest, () => {}); reject(e); });
		req.setTimeout(30000, () => { req.destroy(); reject(new Error('Download timeout')); });
	});
}

// ------------------------------------------------------------------
// Check VideoToolbox (Apple Silicon hardware encoder)
// ------------------------------------------------------------------
let _vtbAvail = null;
async function checkVTB() {
	if (_vtbAvail !== null) return _vtbAvail;
	try { const { stdout } = await execFileAsync(ffmpegPath || 'ffmpeg', ['-encoders']); _vtbAvail = stdout.includes('h264_videotoolbox'); }
	catch { _vtbAvail = false; }
	return _vtbAvail;
}
function getEncoder(vtb) {
	return vtb ? ['-c:v', 'h264_videotoolbox', '-b:v', '4000k'] : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20'];
}

// ------------------------------------------------------------------
// TTS: Generate voiceover for one scene
// Uses plain text (more robust than SSML) with Edge TTS prosody via rate param
// ------------------------------------------------------------------
async function generateSceneTTS(spokenText, voiceId, rate, sceneIdx, sessionDir) {
	const text = (spokenText || '').trim();
	if (!text) return null;

	await fs.promises.mkdir(TTS_CACHE_DIR, { recursive: true });

	// Clean text: strip tags and normalize characters
	const cleanText = text
		.replace(/<[^>]*>/g, '')
		.replace(/&amp;/g, 'dan')
		.replace(/&/g, 'dan')
		.replace(/[\r\n]+/g, ' ')
		.trim();

	const effectiveVoice = voiceId || 'id-ID-ArdiNeural';
	const effectiveRate = rate || '+10%';

	const hash = crypto.createHash('md5').update(`${cleanText}_${effectiveVoice}_${effectiveRate}`).digest('hex').slice(0, 16);
	const cachedMp3 = path.join(TTS_CACHE_DIR, `shorts-${hash}.mp3`);
	const destMp3   = path.join(sessionDir, `tts-scene-${sceneIdx}.mp3`);

	// Cache hit
	if (fs.existsSync(cachedMp3)) {
		try {
			const stat = fs.statSync(cachedMp3);
			if (stat.size > 1000) {
				fs.copyFileSync(cachedMp3, destMp3);
				console.log(`[TTS] Scene ${sceneIdx}: cache hit (${stat.size} bytes)`);
				return destMp3;
			}
			fs.unlinkSync(cachedMp3);
		} catch (_) {}
	}

	// Retry up to 3 times
	for (let attempt = 1; attempt <= 3; attempt++) {
		let tts = null;
		try {
			tts = new MsEdgeTTS();
			await tts.setMetadata(effectiveVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
				wordBoundaryEnabled: false
			});

			const { audioStream } = tts.toStream(cleanText, {
				rate: effectiveRate,
				pitch: '+0Hz'
			});

			const chunks = [];
			audioStream.on('data', (c) => chunks.push(c));

			await new Promise((resolve, reject) => {
				const t = setTimeout(() => reject(new Error('TTS stream timeout')), 25000);
				audioStream.on('end', () => {
					clearTimeout(t);
					resolve();
				});
				audioStream.on('error', (err) => {
					clearTimeout(t);
					reject(err);
				});
			});

			try { tts.close(); } catch (_) {}

			const buffer = Buffer.concat(chunks);
			if (buffer.length < 500) {
				throw new Error(`TTS buffer output too small: ${buffer.length} bytes`);
			}

			await fs.promises.writeFile(cachedMp3, buffer);
			fs.copyFileSync(cachedMp3, destMp3);
			console.log(`[TTS] Scene ${sceneIdx}: generated OK (${buffer.length} bytes, attempt ${attempt})`);
			return destMp3;
		} catch (e) {
			console.warn(`[TTS] Scene ${sceneIdx} attempt ${attempt} failed: ${e.message}`);
			if (tts) {
				try { tts.close(); } catch (_) {}
			}
			if (fs.existsSync(cachedMp3)) {
				try { fs.unlinkSync(cachedMp3); } catch (_) {}
			}
			if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
		}
	}

	console.error(`[TTS] Scene ${sceneIdx}: all attempts failed – will use silence`);
	return null;
}

// ------------------------------------------------------------------
// ElevenLabs TTS Generator (with caching and error resilience)
// ------------------------------------------------------------------
async function generateElevenLabsTTS(spokenText, voiceId, apiKey, sessionDir, sceneIdx, options = {}) {
	const text = (spokenText || '').trim();
	if (!text) return null;

	await fs.promises.mkdir(TTS_CACHE_DIR, { recursive: true });

	const cleanText = text
		.replace(/<[^>]*>/g, '')
		.replace(/&amp;/g, 'dan')
		.replace(/&/g, 'dan')
		.replace(/[\r\n]+/g, ' ')
		.trim();

	const modelId = options.modelId || 'eleven_multilingual_v2';
	const effectiveVoice = voiceId || 'pNInz6obpgDQGcFmaJgB'; // Adam default
	const hash = crypto.createHash('md5').update(`eleven_${cleanText}_${effectiveVoice}_${modelId}`).digest('hex').slice(0, 16);
	const cachedMp3 = path.join(TTS_CACHE_DIR, `eleven-${hash}.mp3`);
	const destMp3 = path.join(sessionDir, `tts-scene-${sceneIdx}.mp3`);

	// Cache hit
	if (fs.existsSync(cachedMp3)) {
		try {
			const stat = fs.statSync(cachedMp3);
			if (stat.size > 1000) {
				fs.copyFileSync(cachedMp3, destMp3);
				console.log(`[ElevenLabs] Scene ${sceneIdx}: cache hit (${stat.size} bytes)`);
				return { path: destMp3, provider: 'elevenlabs' };
			}
			fs.unlinkSync(cachedMp3);
		} catch (_) {}
	}

	const stability = typeof options.stability === 'number' ? options.stability : 0.5;
	const similarityBoost = typeof options.similarityBoost === 'number' ? options.similarityBoost : 0.75;

	for (let attempt = 1; attempt <= 2; attempt++) {
		try {
			const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoice}`, {
				method: 'POST',
				headers: {
					'xi-api-key': apiKey.trim(),
					'Content-Type': 'application/json',
					'Accept': 'audio/mpeg'
				},
				body: JSON.stringify({
					text: cleanText,
					model_id: modelId,
					voice_settings: {
						stability,
						similarity_boost: similarityBoost
					}
				})
			});

			if (!res.ok) {
				const errJson = await res.json().catch(() => ({}));
				const errMsg = errJson?.detail?.message || errJson?.detail || `HTTP ${res.status}`;
				throw new Error(`ElevenLabs API error: ${errMsg}`);
			}

			const arrayBuffer = await res.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			if (buffer.length < 500) {
				throw new Error(`ElevenLabs audio output too small: ${buffer.length} bytes`);
			}

			await fs.promises.writeFile(cachedMp3, buffer);
			fs.copyFileSync(cachedMp3, destMp3);
			console.log(`[ElevenLabs] Scene ${sceneIdx} (${modelId}): generated OK (${buffer.length} bytes, attempt ${attempt})`);
			return { path: destMp3, provider: 'elevenlabs' };
		} catch (err) {
			console.warn(`[ElevenLabs] Scene ${sceneIdx} attempt ${attempt} failed: ${err.message}`);
			if (fs.existsSync(cachedMp3)) {
				try { fs.unlinkSync(cachedMp3); } catch (_) {}
			}
			if (attempt < 2) await new Promise((r) => setTimeout(r, 1000));
			else throw err;
		}
	}
	return null;
}

// ------------------------------------------------------------------
// Unified Voiceover Generator: Supports ElevenLabs & Edge TTS with Automatic Fallback
// ------------------------------------------------------------------
async function generateSceneVoiceover(spokenText, voiceId, voiceRate, sceneIdx, sessionDir, options = {}) {
	const {
		voiceEngine = 'edge_tts',
		elevenLabsApiKey = '',
		elevenModel = 'eleven_multilingual_v2',
		stability = 0.5,
		similarityBoost = 0.75,
		onProgress
	} = options;

	const isEleven = voiceEngine === 'elevenlabs' || (!voiceId?.includes('Neural') && !voiceId?.startsWith('id-ID-'));
	const effectiveElevenKey = (elevenLabsApiKey || env.ELEVENLABS_API_KEY || '').trim();

	if (isEleven) {
		if (effectiveElevenKey && effectiveElevenKey.length > 10) {
			try {
				const res = await generateElevenLabsTTS(spokenText, voiceId, effectiveElevenKey, sessionDir, sceneIdx, {
					modelId: elevenModel,
					stability,
					similarityBoost
				});
				if (res && res.path) return res;
			} catch (e) {
				console.warn(`[Voiceover] ElevenLabs failed for scene ${sceneIdx}: ${e.message}. Falling back to Edge TTS...`);
				if (onProgress) onProgress(`⚠️ ElevenLabs (${e.message}), fallback ke Edge TTS`);
			}
		} else {
			console.warn(`[Voiceover] ElevenLabs key missing for scene ${sceneIdx}. Falling back to Edge TTS...`);
			if (onProgress) onProgress(`⚠️ ElevenLabs API Key tidak ditemukan, fallback ke Edge TTS`);
		}
	}

	// Edge TTS (as selected or as fallback)
	const fallbackVoice = isEleven ? 'id-ID-ArdiNeural' : voiceId;
	const edgePath = await generateSceneTTS(spokenText, fallbackVoice, voiceRate, sceneIdx, sessionDir);
	return edgePath ? { path: edgePath, provider: 'edge_tts' } : null;
}

// ------------------------------------------------------------------
// Generate a silent audio file (used when TTS fails)
// ------------------------------------------------------------------
async function generateSilence(durationSec, destPath) {
	await runFFmpeg([
		'-f', 'lavfi',
		'-i', `anullsrc=r=44100:cl=stereo`,
		'-t', String(Math.ceil(durationSec) + 0.5),
		'-c:a', 'aac', '-ar', '44100', '-ac', '2',
		'-y', destPath
	], 20000);
}

// ------------------------------------------------------------------
// Build 9:16 scene clip: Giphy MP4 → Blurred Backdrop + Audio
// ------------------------------------------------------------------
async function renderSceneClip(scene, idx, sessionDir, vtbAvail) {
	const duration = scene.audioDuration || scene.duration || 4;
	const outputPath = path.join(sessionDir, `scene-${idx}.mp4`);

	// 1. Download Giphy clip (if any)
	let mediaFile = null;
	const clipUrl = scene.selectedClip?.mp4Url || scene.mp4Url || null;
	if (clipUrl) {
		try {
			const dlPath = path.join(sessionDir, `media-${idx}.mp4`);
			await downloadFile(clipUrl, dlPath);
			// Verify the file has actual content
			const stat = fs.statSync(dlPath);
			if (stat.size > 5000) mediaFile = dlPath;
			else { fs.unlinkSync(dlPath); console.warn(`[Clip] Scene ${idx}: downloaded file too small, ignoring`); }
		} catch (e) {
			console.warn(`[Clip] Scene ${idx}: download failed – ${e.message}`);
		}
	}

	// 2. Determine audio source (TTS, uploaded audio, or silence)
	const ttsPath = path.join(sessionDir, `tts-scene-${idx}.mp3`);
	let audioFile = ttsPath;
	if (!fs.existsSync(ttsPath) || fs.statSync(ttsPath).size < 500) {
		let directAudio = scene.audioPath;
		if (!directAudio && scene.voiceAudioUrl) {
			const rel = scene.voiceAudioUrl.startsWith('/static') ? scene.voiceAudioUrl.slice(7) : scene.voiceAudioUrl;
			directAudio = path.resolve('./static', rel.replace(/^\//, ''));
		}
		if (directAudio && fs.existsSync(directAudio) && fs.statSync(directAudio).size > 500) {
			audioFile = directAudio;
		} else {
			const silentPath = path.join(sessionDir, `silent-${idx}.aac`);
			await generateSilence(duration, silentPath);
			audioFile = silentPath;
			console.warn(`[Clip] Scene ${idx}: using silence (no valid TTS or uploaded audio)`);
		}
	}

	const encoder = getEncoder(vtbAvail);

	if (mediaFile) {
		// 9:16 Blurred Backdrop: split → bg (blurred fill) + fg (centered clear)
		const filterComplex = [
			`[0:v]loop=loop=-1:size=999:start=0,trim=duration=${duration},setpts=PTS-STARTPTS,fps=${FPS},split=2[rawbg][rawfg]`,
			`[rawbg]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=25,colorchannelmixer=rr=0.6:gg=0.6:bb=0.6[bg]`,
			`[rawfg]scale=${W}:-2:force_original_aspect_ratio=decrease[fg]`,
			`[bg][fg]overlay=(W-w)/2:(H-h)/2:shortest=0[outv]`,
			`[1:a]apad=whole_dur=${duration},aformat=sample_rates=44100:channel_layouts=stereo[outa]`
		].join(';');

		await runFFmpeg([
			'-stream_loop', '-1', '-i', mediaFile,  // [0] looped video
			'-i', audioFile,                          // [1] TTS / silence
			'-filter_complex', filterComplex,
			'-map', '[outv]',
			'-map', '[outa]',
			'-t', String(duration),
			...encoder,
			'-pix_fmt', 'yuv420p',
			'-c:a', 'aac', '-ar', '44100', '-ac', '2',
			'-y', outputPath
		], 120000);
	} else {
		// No clip: dark background
		await runFFmpeg([
			'-f', 'lavfi', '-i', `color=c=#0a0a1a:size=${W}x${H}:rate=${FPS}`,  // [0] dark bg
			'-i', audioFile,                                                        // [1] audio
			'-filter_complex', `[1:a]apad=whole_dur=${duration},aformat=sample_rates=44100:channel_layouts=stereo[outa]`,
			'-t', String(duration),
			'-map', '0:v',
			'-map', '[outa]',
			...encoder,
			'-pix_fmt', 'yuv420p',
			'-c:a', 'aac', '-ar', '44100', '-ac', '2',
			'-y', outputPath
		], 60000);
	}

	return outputPath;
}

// ------------------------------------------------------------------
// ------------------------------------------------------------------
// Build ASS Subtitle File: Punchy Single-Line Sync for Shorts (9:16)
// Displays 2-3 words per burst with audio-synced timing. No text overflow.
// ------------------------------------------------------------------
function calculateAudioSyncedWordTimings(words, totalDuration) {
	if (!words || words.length === 0) return [];
	const startBound = 0.08;
	const endBound = Math.max(startBound + 0.4, totalDuration - 0.12);
	const speechSpan = Math.max(0.3, endBound - startBound);
	const weights = words.map((w) => {
		const clean = w.replace(/[^a-zA-Z0-9]/g, '');
		let wt = Math.max(2, clean.length);
		if (/[.,!?;:]$/.test(w)) wt += 2.5; // Natural pause weight on punctuation
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

function chunkWordsForShorts(wordTimings, maxWords = 3, maxChars = 24) {
	if (!wordTimings || wordTimings.length === 0) return [];
	const chunks = [];
	let current = [];
	let currentLen = 0;

	for (let i = 0; i < wordTimings.length; i++) {
		const item = wordTimings[i];
		const word = item.word.trim();
		const wordLen = word.length;
		const projectedLen = currentLen === 0 ? wordLen : currentLen + 1 + wordLen;
		const hasPunctuation = /[.,!?;:—"]$/.test(word);
		const remaining = wordTimings.length - (i + 1);

		// Avoid leaving a lone orphan word at the end if it fits
		const wouldOrphan = remaining === 1 && (projectedLen + 1 + wordTimings[i + 1].word.length <= maxChars + 4);

		if (current.length > 0 && !wouldOrphan && (projectedLen > maxChars || current.length >= maxWords)) {
			chunks.push({
				words: current,
				text: current.map(w => w.word).join(' '),
				start: current[0].start,
				end: current[current.length - 1].end
			});
			current = [];
			currentLen = 0;
		}

		current.push(item);
		currentLen += (currentLen === 0 ? wordLen : 1 + wordLen);

		if (hasPunctuation && !wouldOrphan && (current.length >= 2 || remaining <= 2)) {
			chunks.push({
				words: current,
				text: current.map(w => w.word).join(' '),
				start: current[0].start,
				end: current[current.length - 1].end
			});
			current = [];
			currentLen = 0;
		}
	}

	if (current.length > 0) {
		if (current.length === 1 && chunks.length > 0) {
			const prev = chunks[chunks.length - 1];
			const combinedText = prev.text + ' ' + current[0].word;
			if (combinedText.length <= maxChars + 6 && prev.words.length < 4) {
				prev.words.push(...current);
				prev.text = combinedText;
				prev.end = current[0].end;
				current = [];
			}
		}
		if (current.length > 0) {
			chunks.push({
				words: current,
				text: current.map(w => w.word).join(' '),
				start: current[0].start,
				end: current[current.length - 1].end
			});
		}
	}

	return chunks;
}

function buildShortsASS(scenes, style = 'viral-yellow') {
	const st = SUBTITLE_STYLES[style] || SUBTITLE_STYLES['viral-yellow'];

	function hexBgr(hex) {
		const c = hex.replace('#', '');
		return c.length === 6 ? c.slice(4, 6) + c.slice(2, 4) + c.slice(0, 2) : '000000';
	}

	function fmt(sec) {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = Math.floor(sec % 60);
		const cs = Math.floor((sec % 1) * 100);
		return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
	}

	const primary  = `&H00${hexBgr(st.primaryColor)}`;
	const outline  = `&H00${hexBgr(st.outlineColor)}`;
	const shadow   = `&H80${hexBgr(st.shadowColor)}`;
	const boxBg    = '&H00000000';

	const header = [
		'[Script Info]',
		'Title: Shorts Subtitle',
		'ScriptType: v4.00+',
		`PlayResX: ${W}`,
		`PlayResY: ${H}`,
		'WrapStyle: 2',
		'ScaledBorderAndShadow: yes',
		'',
		'[V4+ Styles]',
		'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
		`Style: Default,${st.fontName},${st.fontSize},${primary},${primary},${outline},${boxBg},${st.bold ? -1 : 0},0,0,0,100,100,1.2,0,1,${st.outlineSize},${st.shadow},${st.alignment},80,80,${st.marginV},1`,
		'',
		'[Events]',
		'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
	].join('\n');

	let cursor = 0;
	const dialogues = [];

	for (const scene of scenes) {
		const dur = parseFloat(scene.audioDuration || scene.duration || 4);
		const text = (scene.spokenText || '').trim();
		if (!text) { cursor += dur; continue; }

		const words = text.split(/\s+/).filter(Boolean);
		if (words.length === 0) { cursor += dur; continue; }

		let timings = [];
		if (Array.isArray(scene.wordTimings) && scene.wordTimings.length > 0) {
			timings = scene.wordTimings.map((w) => ({
				word: (w.word || '').trim(),
				start: typeof w.start === 'number' ? Math.max(0, w.start) : 0,
				end: typeof w.end === 'number' ? Math.max(0.05, w.end) : 0.3
			}));
		} else {
			timings = calculateAudioSyncedWordTimings(words, dur);
		}
		const chunks  = chunkWordsForShorts(timings, 3, 24);

		for (let j = 0; j < chunks.length; j++) {
			const c = chunks[j];
			const start = cursor + c.start;
			// Seamless transition: display until next chunk starts, or until near end of scene
			let end = (j < chunks.length - 1)
				? (cursor + chunks[j + 1].start)
				: Math.min(cursor + dur - 0.05, cursor + c.end + 0.15);

			if (end <= start) end = start + 0.3;

			// Clean text (remove ASS syntax chars) and uppercase if mrbeast
			let lineText = c.text.replace(/[{}]/g, '');
			if (style === 'mrbeast-bold') {
				lineText = lineText.toUpperCase();
			}

			dialogues.push(`Dialogue: 0,${fmt(start)},${fmt(end)},Default,,0,0,0,,{\\fad(40,0)}${lineText}`);
		}

		cursor += dur;
	}

	return header + '\n' + dialogues.join('\n') + '\n';
}

// ------------------------------------------------------------------
// Concurrent pool
// ------------------------------------------------------------------
async function asyncPool(limit, items, fn) {
	const res = [], exec = new Set();
	for (const it of items) {
		const p = Promise.resolve().then(() => fn(it));
		res.push(p); exec.add(p);
		const c = () => exec.delete(p); p.then(c, c);
		if (exec.size >= limit) await Promise.race(exec);
	}
	return Promise.all(res);
}

// ------------------------------------------------------------------
// SSE helper: encode a server-sent event
// ------------------------------------------------------------------
function sseEvent(data) {
	return `data: ${JSON.stringify(data)}\n\n`;
}

// ------------------------------------------------------------------
// Main POST Handler – SSE streaming for realtime progress
// ------------------------------------------------------------------
export async function POST({ request }) {
	const sessionId = `shorts-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
	const sessionDir = path.join(TEMP_DIR, sessionId);

	const body = await request.json();
	const {
		title,
		scenes,
		voiceEngine    = 'edge_tts', // 'edge_tts' | 'elevenlabs'
		voiceId        = 'id-ID-ArdiNeural',
		voiceRate      = '+10%',
		elevenLabsApiKey = '',
		elevenModel    = 'eleven_multilingual_v2',
		elevenSettings = {},
		bgmId          = 'dark-suspense',
		bgmVolume      = 0.12,
		subtitleStyle  = 'viral-yellow',
		subtitlesEnabled = true,
	} = body;

	if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
		return json({ success: false, error: 'Scenes tidak boleh kosong.' }, { status: 400 });
	}

	// SSE streaming response
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			function send(data) {
				try { controller.enqueue(encoder.encode(sseEvent(data))); } catch {}
			}

			function sendProgress(step, message, percent) {
				send({ type: 'progress', step, message, percent });
				console.log(`[render-shorts] [${percent}%] ${message}`);
			}

			try {
				await fs.promises.mkdir(RENDERS_DIR, { recursive: true });
				await fs.promises.mkdir(sessionDir, { recursive: true });

				const vtbAvail = await checkVTB();
				sendProgress(1, `🚀 Mulai render... ${scenes.length} adegan | VideoToolbox: ${vtbAvail}`, 2);

				// -----------------------------------------------------------
				// STEP 1: Voiceover (Upload, ElevenLabs, or Edge TTS)
				// -----------------------------------------------------------
				const isUploadedVoice = voiceEngine === 'upload' || Boolean(scenesWork.some(s => s.voiceAudioUrl || s.audioPath));
				const isEleven = !isUploadedVoice && (voiceEngine === 'elevenlabs' || (!voiceId?.includes('Neural') && !voiceId?.startsWith('id-ID-')));
				const engineLabel = isUploadedVoice
					? 'Audio Narasi Upload'
					: (isEleven ? `ElevenLabs (${elevenModel === 'eleven_turbo_v2_5' ? 'Turbo v2.5' : 'Multilingual v2'})` : 'Edge TTS');

				sendProgress(1, `🎤 Menyiapkan voiceover (${engineLabel})...`, 5);
				const scenesWork = scenes.map(s => ({ ...s }));

				for (let i = 0; i < scenesWork.length; i++) {
					const scene = scenesWork[i];
					const pct = Math.round(5 + (i / scenesWork.length) * 25);

					if (isUploadedVoice || scene.voiceAudioUrl || scene.audioPath) {
						sendProgress(1, `🎤 Memproses audio upload scene ${i + 1}/${scenesWork.length}...`, pct);
						try {
							let srcAudio = scene.audioPath;
							if (!srcAudio && scene.voiceAudioUrl) {
								const rel = scene.voiceAudioUrl.startsWith('/static') ? scene.voiceAudioUrl.slice(7) : scene.voiceAudioUrl;
								srcAudio = path.resolve('./static', rel.replace(/^\//, ''));
							}

							const destMp3 = path.join(sessionDir, `tts-scene-${i}.mp3`);
							if (srcAudio && fs.existsSync(srcAudio)) {
								fs.copyFileSync(srcAudio, destMp3);
								const dur = await getAudioDuration(destMp3);
								scene.ttsMp3        = destMp3;
								scene.audioDuration = dur ? Math.round((dur + 0.1) * 100) / 100 : (scene.audioDuration || scene.duration || 4);
								scene.voiceProvider = 'upload';
							} else {
								console.warn(`[Voiceover] Scene ${i}: audio upload not found at ${srcAudio}`);
								scene.audioDuration = scene.duration || 4;
							}
						} catch (e) {
							console.warn(`[Voiceover] Scene ${i} upload copy error: ${e.message}`);
							scene.audioDuration = scene.duration || 4;
						}
					} else {
						sendProgress(1, `🎤 Voiceover scene ${i + 1}/${scenesWork.length} (${engineLabel}): "${(scene.spokenText || '').slice(0, 32)}..."`, pct);
						try {
							const voiceRes = await generateSceneVoiceover(scene.spokenText, voiceId, voiceRate, i, sessionDir, {
								voiceEngine: isEleven ? 'elevenlabs' : 'edge_tts',
								elevenLabsApiKey,
								elevenModel,
								stability: elevenSettings?.stability,
								similarityBoost: elevenSettings?.similarityBoost,
								onProgress: (warn) => sendProgress(1, warn, pct)
							});

							if (voiceRes && voiceRes.path) {
								const dur = await getAudioDuration(voiceRes.path);
								scene.ttsMp3        = voiceRes.path;
								scene.audioDuration = dur ? Math.round((dur + 0.3) * 100) / 100 : scene.duration;
								scene.voiceProvider = voiceRes.provider;
							} else {
								scene.audioDuration = scene.duration;
							}
						} catch (e) {
							console.warn(`[Voiceover] Scene ${i} error: ${e.message}`);
							scene.audioDuration = scene.duration;
						}
					}
				}
				sendProgress(1, '✅ Audio narasi siap!', 32);

				// -----------------------------------------------------------
				// STEP 2: Render scene clips (download Giphy + backdrop filter)
				// -----------------------------------------------------------
				sendProgress(2, '🎬 Render adegan...', 34);
				const sceneClipPaths = [];
				for (let i = 0; i < scenesWork.length; i++) {
					const pct = Math.round(34 + (i / scenesWork.length) * 30);
					sendProgress(2, `🎬 Render scene ${i + 1}/${scenesWork.length} (Giphy + backdrop)`, pct);
					const clipPath = await renderSceneClip(scenesWork[i], i, sessionDir, vtbAvail);
					sceneClipPaths.push(clipPath);
				}
				sendProgress(2, '✅ Scene clips selesai!', 66);

				// -----------------------------------------------------------
				// STEP 3: Build subtitle ASS
				// -----------------------------------------------------------
				let assPath = null;
				if (subtitlesEnabled) {
					sendProgress(3, '📝 Membuat file subtitle...', 68);
					const assContent = buildShortsASS(scenesWork, subtitleStyle);
					assPath = path.join(sessionDir, 'subtitles.ass');
					await fs.promises.writeFile(assPath, assContent, 'utf8');
				}

				// -----------------------------------------------------------
				// STEP 4: Concatenate scene clips
				// -----------------------------------------------------------
				sendProgress(4, '🔗 Menggabungkan semua adegan...', 70);
				const concatListPath = path.join(sessionDir, 'concat.txt');
				await fs.promises.writeFile(concatListPath, sceneClipPaths.map(p => `file '${p}'`).join('\n'), 'utf8');

				const concatVideoPath = path.join(sessionDir, 'concat-raw.mp4');
				await runFFmpeg(['-f', 'concat', '-safe', '0', '-i', concatListPath, '-c', 'copy', '-y', concatVideoPath], 120000);

				const totalDuration = scenesWork.reduce((s, sc) => s + (sc.audioDuration || sc.duration || 4), 0);
				sendProgress(4, '✅ Adegan tergabung!', 75);

				// -----------------------------------------------------------
				// STEP 5: Final mix – BGM + Subtitle burn-in
				// -----------------------------------------------------------
				sendProgress(5, '🎵 Mixing audio + subtitle...', 78);

				const outputFilename = `shorts-${sessionId.slice(-10)}.mp4`;
				const outputPath = path.join(RENDERS_DIR, outputFilename);

				const bgmFile = BGM_MAP[bgmId] || null;
				const hasBgm  = bgmFile && fs.existsSync(bgmFile);
				const hasSubs = subtitlesEnabled && assPath && fs.existsSync(assPath);

				const finalInputs = ['-i', concatVideoPath];
				if (hasBgm) finalInputs.push('-stream_loop', '-1', '-i', bgmFile);

				const filterParts = [];
				let mapVideo, mapAudio;

				if (hasSubs && hasBgm) {
					const sp = assPath.replace(/\\/g, '/').replace(/'/g, "\\'");
					filterParts.push(`[0:v]ass='${sp}'[subv]`);
					filterParts.push(`[0:a]volume=1.0,aformat=sample_rates=44100:channel_layouts=stereo[voice]`);
					filterParts.push(`[1:a]volume=${bgmVolume},equalizer=f=1800:t=q:w=1.2:g=-3.5,aformat=sample_rates=44100:channel_layouts=stereo[bgm]`);
					filterParts.push(`[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[finala]`);
					mapVideo = '[subv]'; mapAudio = '[finala]';
				} else if (hasSubs) {
					const sp = assPath.replace(/\\/g, '/').replace(/'/g, "\\'");
					filterParts.push(`[0:v]ass='${sp}'[subv]`);
					filterParts.push(`[0:a]volume=1.0,aformat=sample_rates=44100:channel_layouts=stereo[finala]`);
					mapVideo = '[subv]'; mapAudio = '[finala]';
				} else if (hasBgm) {
					filterParts.push(`[0:a]volume=1.0,aformat=sample_rates=44100:channel_layouts=stereo[voice]`);
					filterParts.push(`[1:a]volume=${bgmVolume},equalizer=f=1800:t=q:w=1.2:g=-3.5,aformat=sample_rates=44100:channel_layouts=stereo[bgm]`);
					filterParts.push(`[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[finala]`);
					mapVideo = '0:v'; mapAudio = '[finala]';
				} else {
					mapVideo = '0:v'; mapAudio = '0:a';
				}

				sendProgress(5, '⚡ FFmpeg final render...', 82);

				await runFFmpeg([
					...finalInputs,
					...(filterParts.length > 0 ? ['-filter_complex', filterParts.join(';')] : []),
					'-map', mapVideo,
					'-map', mapAudio,
					'-t', String(totalDuration + 0.5),
					...getEncoder(vtbAvail),
					'-pix_fmt', 'yuv420p',
					'-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
					'-movflags', '+faststart',
					'-y', outputPath
				], 180000);

				sendProgress(5, '✅ Render selesai!', 100);

				// Cleanup
				fs.rm(sessionDir, { recursive: true, force: true }, () => {});

				// Final result event
				send({
					type: 'done',
					success: true,
					outputUrl: `/renders/shorts/${outputFilename}`,
					duration: Math.round(totalDuration),
					filename: outputFilename
				});
			} catch (err) {
				console.error('[render-shorts] ERROR:', err.message);
				fs.rm(sessionDir, { recursive: true, force: true }, () => {});
				send({ type: 'error', error: err.message });
			} finally {
				try { controller.close(); } catch {}
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
}
