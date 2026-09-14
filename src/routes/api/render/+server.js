import { exportToASS } from '$lib/services/subtitleService.js';
import { getSpokenVoiceoverText } from '$lib/services/scriptAnalyzer.js';
import fs from 'fs';
import path from 'path';
import { execFile, spawn } from 'child_process';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = util.promisify(execFile);

// Helper to download remote file with timeout + retry
async function downloadFile(url, destPath, timeoutMs = 30000, retries = 2) {
	for (let attempt = 0; attempt <= retries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const res = await fetch(url, { signal: controller.signal });
			if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
			const arrayBuffer = await res.arrayBuffer();
			await fs.promises.writeFile(destPath, Buffer.from(arrayBuffer));
			clearTimeout(timer);
			return; // success
		} catch (err) {
			clearTimeout(timer);
			if (attempt === retries) throw err;
			console.warn(`Download attempt ${attempt + 1} failed, retrying:`, err.message);
			await new Promise(r => setTimeout(r, 1000));
		}
	}
}

// Helper to run ffmpeg with a timeout
function runFFmpeg(args, timeoutMs = 120000) {
	return new Promise((resolve, reject) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		const timer = setTimeout(() => {
			proc.kill('SIGKILL');
			reject(new Error(`FFmpeg timed out after ${timeoutMs / 1000}s`));
		}, timeoutMs);
		proc.on('close', (code) => {
			clearTimeout(timer);
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg exit ${code}: ${stderr.slice(-800)}`));
		});
		proc.on('error', (err) => { clearTimeout(timer); reject(err); });
	});
}
// Generate a lavfi-based cinematic video (animated color gradient)
function makeLavfiVideo(lavfiFilter, destPath, durationSec) {
	// Parse filter string: 'color=c=0x0a0f1e:size=1920x1080:rate=30,hue=h=t*30:s=1'
	// Split into source and filter parts
	const parts = lavfiFilter.split(',');
	const source = parts[0]; // e.g. 'color=c=0x0a0f1e:size=1920x1080:rate=30'
	const vfFilters = parts.slice(1); // e.g. ['hue=h=t*30:s=1']

	const args = [
		'-f', 'lavfi',
		'-i', source,
	];

	if (vfFilters.length > 0) {
		args.push('-vf', vfFilters.join(','));
	}

	args.push(
		'-t', String(durationSec),
		'-pix_fmt', 'yuv420p',
		'-y', destPath
	);

	return runFFmpeg(args, 30000);
}

// Generate a silent audio file
function makeSilent(destPath, durationSec) {
	return runFFmpeg([
		'-f', 'lavfi',
		'-i', 'anullsrc=r=44100:cl=stereo',
		'-t', String(durationSec),
		'-y', destPath
	], 30000);
}

// Generate TTS audio using macOS `say` command as fallback
async function makeTTSAudio(text, destPath, durationSec) {
	// macOS say → AIFF → mp3 via ffmpeg
	const aiffPath = destPath.replace(/\.mp3$/, '.aiff');
	try {
		// Sanitize text for shell
		const cleanText = text.replace(/['"\\]/g, ' ').slice(0, 500);
		const isIndonesian = /\b(yang|dan|di|ini|itu|adalah|untuk|dari|dengan|pada|ke|halo|selamat|kita|bisa|saya)\b/i.test(cleanText);
		const voiceName = isIndonesian ? 'Damayanti' : 'Samantha';

		await execFileAsync('/usr/bin/say', [
			'-v', voiceName,
			'-r', '175',       // Words per minute
			'-o', aiffPath,
			cleanText
		], { timeout: 30000 });

		// Convert AIFF to MP3
		await runFFmpeg([
			'-i', aiffPath,
			'-codec:a', 'libmp3lame',
			'-q:a', '4',
			'-y', destPath
		], 20000);

		// Clean up aiff
		await fs.promises.unlink(aiffPath).catch(() => {});
		return true;
	} catch (err) {
		console.warn('macOS say TTS failed:', err.message);
		// Last resort: silent
		await makeSilent(destPath, durationSec);
		return false;
	}
}

// Generate a dynamic animated gradient background when no video
function makeGradientVideo(destPath, durationSec) {
	return runFFmpeg([
		'-f', 'lavfi',
		'-i', `color=c=0x0a0f1e:size=1920x1080:rate=30`,
		'-vf', 'hue=h=t*30:s=1',
		'-t', String(durationSec),
		'-pix_fmt', 'yuv420p',
		'-y', destPath
	], 30000);
}


export async function POST({ request }) {
	const renderId = `yt-long-${Date.now()}`;
	const tempDir = path.resolve(`./static/renders/temp-${renderId}`);
	const finalMp4Name = `youtube-long-${renderId}.mp4`;
	const finalMp4Path = path.resolve(`./static/renders/${finalMp4Name}`);

	// Use SSE to stream real progress back to client
	const encoder = new TextEncoder();
	let controllerRef = null;

	function sendEvent(data) {
		if (controllerRef) {
			controllerRef.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
		}
	}

	const stream = new ReadableStream({
		start(controller) {
			controllerRef = controller;
		}
	});

	// Run render in background, stream progress
	(async () => {
		try {
			const {
				scenes,
				subtitleStyle = 'hormozi',
				karaokeEnabled = true,
				fontSize = 34,
				bgmUrl,
				bgmVolume = 0.15
			} = await request.json();

			if (!scenes || scenes.length === 0) {
				sendEvent({ error: 'No scenes provided' });
				controllerRef?.close();
				return;
			}

			await fs.promises.mkdir(tempDir, { recursive: true });
			await fs.promises.mkdir(path.resolve('./static/renders'), { recursive: true });

			const processedClips = [];

			for (let i = 0; i < scenes.length; i++) {
				const scene = scenes[i];
				const pct = Math.round(10 + ((i / scenes.length) * 60));
				sendEvent({ progress: pct, step: `Memproses scene ${i + 1}/${scenes.length}...` });

				const sceneDuration = Number(scene.audioDuration || scene.estimatedDuration || 5);
				const videoDest = path.join(tempDir, `video-${i}.mp4`);
				const audioDest = path.join(tempDir, `audio-${i}.mp3`);
				const sceneOutput = path.join(tempDir, `scene-${i}-norm.mp4`);

				// --- Handle Audio ---
				let audioReady = false;

				if (scene.serverAudioPath) {
					// Best: audio saved to disk by frontend (ElevenLabs)
					try {
						await fs.promises.copyFile(scene.serverAudioPath, audioDest);
						audioReady = true;
					} catch (copyErr) {
						console.warn(`Scene ${i}: serverAudioPath copy failed:`, copyErr.message);
					}
				}

				if (!audioReady && scene.voiceAudioUrl && scene.voiceAudioUrl.startsWith('data:audio')) {
					// Fallback: base64 audio from frontend
					try {
						const base64Data = scene.voiceAudioUrl.replace(/^data:audio\/[^;]+;base64,/, '');
						await fs.promises.writeFile(audioDest, Buffer.from(base64Data, 'base64'));
						audioReady = true;
					} catch (b64Err) {
						console.warn(`Scene ${i}: base64 audio decode failed:`, b64Err.message);
					}
				}

				if (!audioReady) {
					// Last resort: generate TTS with macOS say, or silent
					sendEvent({ progress: pct, step: `Scene ${i + 1}: Generating TTS narration...` });
					const spokenText = getSpokenVoiceoverText(scene) || scene.narration || scene.words?.join(' ') || '';
					if (spokenText.trim()) {
						await makeTTSAudio(spokenText, audioDest, sceneDuration);
					} else {
						await makeSilent(audioDest, sceneDuration);
					}
					audioReady = true;
				}

				// --- Handle Video ---
				const rawVideoUrl = scene.footage?.videoUrl;
				let videoDownloaded = false;

				if (rawVideoUrl && rawVideoUrl.startsWith('lavfi:')) {
					// Generated lavfi video — no download needed
					const lavfiFilter = rawVideoUrl.slice('lavfi:'.length);
					await makeLavfiVideo(lavfiFilter, videoDest, sceneDuration + 2);
					videoDownloaded = true;
				} else if (rawVideoUrl && rawVideoUrl.startsWith('http')) {
					try {
						sendEvent({ progress: pct, step: `Scene ${i + 1}: Mengunduh footage...` });
						await downloadFile(rawVideoUrl, videoDest, 30000, 1);
						videoDownloaded = true;
					} catch (err) {
						console.warn(`Scene ${i}: video download failed (${err.message}), using gradient fallback`);
					}
				}

				if (!videoDownloaded) {
					// Animated gradient fallback — dark blue cinematic look
					sendEvent({ progress: pct, step: `Scene ${i + 1}: Membuat gradient background...` });
					await makeGradientVideo(videoDest, sceneDuration + 2);
				}

				// --- Normalize + merge audio into scene clip ---
				const filter = `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p[v]`;
				await runFFmpeg([
					'-stream_loop', '-1',
					'-i', videoDest,
					'-i', audioDest,
					'-filter_complex', filter,
					'-map', '[v]',
					'-map', '1:a',
					'-t', String(sceneDuration),
					'-c:v', 'libx264',
					'-preset', 'ultrafast',
					'-c:a', 'aac',
					'-b:a', '128k',
					'-y', sceneOutput
				], 90000);

				processedClips.push(sceneOutput);
			}

			// Concatenate scenes
			sendEvent({ progress: 72, step: 'Menggabungkan semua scene...' });
			const concatListPath = path.join(tempDir, 'concat.txt');
			await fs.promises.writeFile(
				concatListPath,
				processedClips.map((p) => `file '${p}'`).join('\n')
			);
			const concatenatedVideo = path.join(tempDir, 'combined.mp4');
			await runFFmpeg([
				'-f', 'concat',
				'-safe', '0',
				'-i', concatListPath,
				'-c', 'copy',
				'-y', concatenatedVideo
			], 120000);

			// Generate subtitles
			sendEvent({ progress: 80, step: 'Membuat file subtitle ASS...' });
			const assContent = exportToASS(scenes, subtitleStyle, { karaokeEnabled, fontSize });
			const assPath = path.join(tempDir, 'subtitles.ass');
			await fs.promises.writeFile(assPath, assContent);

			// Download BGM if needed
			let bgmAudioPath = null;
			if (bgmUrl && bgmUrl.startsWith('http')) {
				sendEvent({ progress: 84, step: 'Mengunduh musik latar...' });
				try {
					bgmAudioPath = path.join(tempDir, 'bgm.mp3');
					await downloadFile(bgmUrl, bgmAudioPath, 20000, 1);
				} catch (e) {
					console.warn('BGM download failed, skipping:', e.message);
					bgmAudioPath = null;
				}
			}

			// Final render with subtitle burn-in
			sendEvent({ progress: 88, step: 'Burning subtitle & final encode (1080p)...' });

			// Sanitize ASS path for FFmpeg filter
			const safeAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
			const ffmpegArgs = ['-i', concatenatedVideo];

			if (bgmAudioPath) {
				const duckVol = Number(bgmVolume) || 0.15;
				const swellVol = Math.min(0.48, Math.max(0.28, duckVol * 2.2));

				// Calculate chapter swell intervals for dynamic music volume
				let cumulativeSec = 0;
				const chapterSwells = [];
				for (const sc of scenes) {
					const dur = Number(sc.audioDuration || sc.estimatedDuration || 5);
					if (sc.chapter) {
						const start = cumulativeSec.toFixed(2);
						const end = (cumulativeSec + Math.min(3.5, dur)).toFixed(2);
						chapterSwells.push(`between(t,${start},${end})`);
					}
					cumulativeSec += dur;
				}

				let bgmFilterExpr = `volume=${duckVol}`;
				if (chapterSwells.length > 0) {
					const cond = chapterSwells.join('+');
					bgmFilterExpr = `volume='if(${cond},${swellVol},${duckVol})':eval=frame`;
				}

				ffmpegArgs.push('-stream_loop', '-1', '-i', bgmAudioPath);
				ffmpegArgs.push(
					'-filter_complex',
					`[0:v]subtitles='${safeAssPath}'[v];[1:a]${bgmFilterExpr}[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[a]`,
					'-map', '[v]',
					'-map', '[a]'
				);
			} else {
				ffmpegArgs.push(
					'-filter_complex',
					`[0:v]subtitles='${safeAssPath}'[v]`,
					'-map', '[v]',
					'-map', '0:a'
				);
			}

			ffmpegArgs.push(
				'-c:v', 'libx264',
				'-preset', 'fast',
				'-crf', '22',
				'-c:a', 'aac',
				'-b:a', '192k',
				'-movflags', '+faststart',
				'-y', finalMp4Path
			);

			await runFFmpeg(ffmpegArgs, 300000); // 5 min max for final encode

			// Clean up temp
			fs.rm(tempDir, { recursive: true, force: true }, () => {});

			sendEvent({
				progress: 100,
				step: 'Selesai!',
				done: true,
				downloadUrl: `/renders/${finalMp4Name}`,
				filename: finalMp4Name
			});
		} catch (error) {
			console.error('Render error:', error);
			fs.rm(tempDir, { recursive: true, force: true }, () => {});
			sendEvent({ error: error.message });
		} finally {
			controllerRef?.close();
		}
	})();

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
}
