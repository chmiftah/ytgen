import { exportToASS } from '$lib/services/subtitleService.js';
import { getSpokenVoiceoverText } from '$lib/services/scriptAnalyzer.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFile, spawn } from 'child_process';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = util.promisify(execFile);

// Check if Apple Silicon Hardware Encoder (VideoToolbox) is available
let isVideoToolboxAvailable = null;
async function checkVideoToolboxSupport() {
	if (isVideoToolboxAvailable !== null) return isVideoToolboxAvailable;
	try {
		const { stdout } = await execFileAsync(ffmpegPath || 'ffmpeg', ['-encoders']);
		isVideoToolboxAvailable = stdout.includes('h264_videotoolbox');
	} catch (e) {
		isVideoToolboxAvailable = false;
	}
	return isVideoToolboxAvailable;
}

// Concurrency pool limiter to process items in parallel without overloading system
async function asyncPool(limit, items, iteratorFn) {
	const results = [];
	const executing = new Set();
	for (const item of items) {
		const p = Promise.resolve().then(() => iteratorFn(item));
		results.push(p);
		executing.add(p);
		const clean = () => executing.delete(p);
		p.then(clean, clean);
		if (executing.size >= limit) {
			await Promise.race(executing);
		}
	}
	return Promise.all(results);
}

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
			await new Promise((r) => setTimeout(r, 1000));
		}
	}
}

// Persistent Local Footage Cache: Never re-download footage that was already fetched
const footageCacheDir = path.resolve('./static/renders/footage-cache');
async function getCachedOrDownloadFootage(url, destPath) {
	if (!url || !url.startsWith('http')) return false;
	try {
		await fs.promises.mkdir(footageCacheDir, { recursive: true });
		const urlHash = crypto.createHash('md5').update(url).digest('hex');
		const cachedFilePath = path.join(footageCacheDir, `${urlHash}.mp4`);

		if (fs.existsSync(cachedFilePath)) {
			// Instant read from fast local SSD
			await fs.promises.copyFile(cachedFilePath, destPath);
			return true;
		}

		// Download to persistent cache first, then copy
		await downloadFile(url, cachedFilePath, 35000, 2);
		await fs.promises.copyFile(cachedFilePath, destPath);
		return true;
	} catch (err) {
		console.warn(`Footage download/cache failed for ${url}:`, err.message);
		return false;
	}
}

// Helper to run ffmpeg with a timeout
function runFFmpeg(args, timeoutMs = 180000) {
	return new Promise((resolve, reject) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => {
			stderr += d.toString();
		});
		const timer = setTimeout(() => {
			proc.kill('SIGKILL');
			reject(new Error(`FFmpeg timed out after ${timeoutMs / 1000}s`));
		}, timeoutMs);
		proc.on('close', (code) => {
			clearTimeout(timer);
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg exit ${code}: ${stderr.slice(-800)}`));
		});
		proc.on('error', (err) => {
			clearTimeout(timer);
			reject(err);
		});
	});
}

// Generate a lavfi-based cinematic video (animated color gradient)
function makeLavfiVideo(lavfiFilter, destPath, durationSec) {
	const parts = lavfiFilter.split(',');
	const source = parts[0];
	const vfFilters = parts.slice(1);

	const args = ['-f', 'lavfi', '-i', source];
	if (vfFilters.length > 0) {
		args.push('-vf', vfFilters.join(','));
	}
	args.push('-t', String(durationSec), '-pix_fmt', 'yuv420p', '-y', destPath);

	return runFFmpeg(args, 30000);
}

// Generate a silent audio file
function makeSilent(destPath, durationSec) {
	return runFFmpeg(
		['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', String(durationSec), '-y', destPath],
		30000
	);
}

// Generate TTS audio using macOS `say` command as fallback
async function makeTTSAudio(text, destPath, durationSec) {
	const aiffPath = destPath.replace(/\.mp3$/, '.aiff');
	try {
		const cleanText = text.replace(/['"\\]/g, ' ').slice(0, 500);
		const isIndonesian = /\b(yang|dan|di|ini|itu|adalah|untuk|dari|dengan|pada|ke|halo|selamat|kita|bisa|saya)\b/i.test(
			cleanText
		);
		const voiceName = isIndonesian ? 'Damayanti' : 'Samantha';

		await execFileAsync(
			'/usr/bin/say',
			['-v', voiceName, '-r', '175', '-o', aiffPath, cleanText],
			{ timeout: 30000 }
		);

		await runFFmpeg(
			['-i', aiffPath, '-codec:a', 'libmp3lame', '-ar', '44100', '-ac', '2', '-q:a', '4', '-y', destPath],
			20000
		);

		await fs.promises.unlink(aiffPath).catch(() => {});
		return true;
	} catch (err) {
		console.warn('macOS say TTS failed:', err.message);
		await makeSilent(destPath, durationSec);
		return false;
	}
}

// Generate a dynamic animated gradient background when no video
function makeGradientVideo(destPath, durationSec) {
	return runFFmpeg(
		[
			'-f',
			'lavfi',
			'-i',
			`color=c=0x0a0f1e:size=1920x1080:rate=30`,
			'-vf',
			'hue=h=t*30:s=1',
			'-t',
			String(durationSec),
			'-pix_fmt',
			'yuv420p',
			'-y',
			destPath
		],
		30000
	);
}

export async function POST({ request }) {
	const renderId = `yt-long-${Date.now()}`;
	const tempDir = path.resolve(`./static/renders/temp-${renderId}`);
	const finalMp4Name = `youtube-long-${renderId}.mp4`;
	const finalMp4Path = path.resolve(`./static/renders/${finalMp4Name}`);

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

	(async () => {
		try {
			const {
				scenes,
				subtitleStyle = 'hormozi',
				karaokeEnabled = true,
				fontSize = 34,
				bgmUrl,
				bgmVolume = 0.15,
				renderQuality = '1080p'
			} = await request.json();

			if (!scenes || scenes.length === 0) {
				sendEvent({ error: 'No scenes provided' });
				controllerRef?.close();
				return;
			}

			// Check M1 hardware encoder
			const hasVT = await checkVideoToolboxSupport();
			const is720p = renderQuality === '720p';
			const targetWidth = is720p ? 1280 : 1920;
			const targetHeight = is720p ? 720 : 1080;
			const targetFps = 30;

			sendEvent({
				progress: 5,
				step: `Menginisialisasi pipeline render (${hasVT ? '⚡ Apple Silicon M1 VideoToolbox' : 'CPU libx264'} - ${is720p ? '720p Fast' : '1080p HD'})...`
			});

			await fs.promises.mkdir(tempDir, { recursive: true });
			await fs.promises.mkdir(path.resolve('./static/renders'), { recursive: true });
			await fs.promises.mkdir(footageCacheDir, { recursive: true });

			// =========================================================================
			// PHASE 1: Parallel Footage Ingestion & Audio Prep (Concurrency = 4)
			// =========================================================================
			sendEvent({ progress: 10, step: `Menyiapkan footage & audio (${scenes.length} adegan paralel)...` });
			let completedPrep = 0;

			await asyncPool(
				4,
				scenes.map((s, idx) => ({ scene: s, index: idx })),
				async ({ scene, index }) => {
					const videoDest = path.join(tempDir, `video-${index}.mp4`);
					const audioDest = path.join(tempDir, `audio-${index}.mp3`);
					const sceneDuration = Number(scene.audioDuration || scene.estimatedDuration || 5);

					// 1. Audio preparation
					let audioReady = false;
					if (scene.serverAudioPath) {
						try {
							await fs.promises.copyFile(scene.serverAudioPath, audioDest);
							audioReady = true;
						} catch (copyErr) {
							console.warn(`Scene ${index}: serverAudioPath copy failed:`, copyErr.message);
						}
					}

					if (!audioReady && scene.voiceAudioUrl && scene.voiceAudioUrl.startsWith('data:audio')) {
						try {
							const base64Data = scene.voiceAudioUrl.replace(/^data:audio\/[^;]+;base64,/, '');
							await fs.promises.writeFile(audioDest, Buffer.from(base64Data, 'base64'));
							audioReady = true;
						} catch (b64Err) {
							console.warn(`Scene ${index}: base64 audio decode failed:`, b64Err.message);
						}
					}

					if (!audioReady) {
						const spokenText =
							getSpokenVoiceoverText(scene) || scene.narration || scene.words?.join(' ') || '';
						if (spokenText.trim()) {
							await makeTTSAudio(spokenText, audioDest, sceneDuration);
						} else {
							await makeSilent(audioDest, sceneDuration);
						}
						audioReady = true;
					}

					// 2. Video preparation (Local SSD cache or download)
					const rawVideoUrl = scene.footage?.videoUrl;
					let videoDownloaded = false;

					if (rawVideoUrl && rawVideoUrl.startsWith('lavfi:')) {
						const lavfiFilter = rawVideoUrl.slice('lavfi:'.length);
						await makeLavfiVideo(lavfiFilter, videoDest, sceneDuration + 2);
						videoDownloaded = true;
					} else if (rawVideoUrl && rawVideoUrl.startsWith('http')) {
						videoDownloaded = await getCachedOrDownloadFootage(rawVideoUrl, videoDest);
					}

					if (!videoDownloaded) {
						await makeGradientVideo(videoDest, sceneDuration + 2);
					}

					completedPrep++;
					const pct = Math.round(10 + (completedPrep / scenes.length) * 35);
					sendEvent({
						progress: pct,
						step: `Mengunduh & menyiapkan klip (${completedPrep}/${scenes.length})...`
					});
				}
			);

			// =========================================================================
			// PHASE 2: Parallel Scene Normalization (Concurrency = 2)
			// =========================================================================
			sendEvent({ progress: 48, step: `Normalisasi resolusi & sinkronisasi adegan...` });
			let completedNorm = 0;
			const processedClips = new Array(scenes.length);

			const filter = `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},fps=${targetFps},format=yuv420p[v]`;

			// Use hardware encoder or ultrafast software for intermediate clips
			const normCodecArgs = hasVT
				? ['-c:v', 'h264_videotoolbox', '-b:v', is720p ? '3500k' : '6000k', '-realtime', '1']
				: ['-c:v', 'libx264', '-preset', 'ultrafast'];

			await asyncPool(
				2,
				scenes.map((s, idx) => ({ scene: s, index: idx })),
				async ({ scene, index }) => {
					const videoDest = path.join(tempDir, `video-${index}.mp4`);
					const audioDest = path.join(tempDir, `audio-${index}.mp3`);
					const sceneOutput = path.join(tempDir, `scene-${index}-norm.mp4`);
					const sceneDuration = Number(scene.audioDuration || scene.estimatedDuration || 5);

					await runFFmpeg(
						[
							'-stream_loop',
							'-1',
							'-i',
							videoDest,
							'-i',
							audioDest,
							'-filter_complex',
							filter,
							'-map',
							'[v]',
							'-map',
							'1:a',
							'-t',
							String(sceneDuration),
							...normCodecArgs,
							'-c:a',
							'aac',
							'-b:a',
							'128k',
							'-ar',
							'44100',
							'-ac',
							'2',
							'-y',
							sceneOutput
						],
						90000
					);

					processedClips[index] = sceneOutput;
					completedNorm++;
					const pct = Math.round(48 + (completedNorm / scenes.length) * 26);
					sendEvent({
						progress: pct,
						step: `Normalisasi adegan (${completedNorm}/${scenes.length})...`
					});
				}
			);

			// =========================================================================
			// PHASE 3: Concatenate Scenes
			// =========================================================================
			sendEvent({ progress: 75, step: 'Menggabungkan semua scene...' });
			const concatListPath = path.join(tempDir, 'concat.txt');
			await fs.promises.writeFile(
				concatListPath,
				processedClips.map((p) => `file '${p}'`).join('\n')
			);
			const concatenatedVideo = path.join(tempDir, 'combined.mp4');
			await runFFmpeg(
				['-f', 'concat', '-safe', '0', '-i', concatListPath, '-c', 'copy', '-y', concatenatedVideo],
				120000
			);

			// =========================================================================
			// PHASE 4: Subtitle Generation
			// =========================================================================
			sendEvent({ progress: 80, step: 'Membuat subtitle ASS...' });
			const assContent = exportToASS(scenes, subtitleStyle, { karaokeEnabled, fontSize });
			const assPath = path.join(tempDir, 'subtitles.ass');
			await fs.promises.writeFile(assPath, assContent);

			// =========================================================================
			// PHASE 5: BGM Preparation (Local Cache)
			// =========================================================================
			let bgmAudioPath = null;
			if (bgmUrl && bgmUrl.startsWith('http')) {
				sendEvent({ progress: 83, step: 'Memuat musik latar...' });
				bgmAudioPath = path.join(tempDir, 'bgm.mp3');
				const downloaded = await getCachedOrDownloadFootage(bgmUrl, bgmAudioPath);
				if (!downloaded) bgmAudioPath = null;
			}

			// =========================================================================
			// PHASE 6: Hardware-Accelerated Final Encode & Subtitle Burn-in
			// =========================================================================
			sendEvent({
				progress: 86,
				step: `Burning subtitle & final encode (${hasVT ? '⚡ M1 VideoToolbox' : 'libx264'})...`
			});

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
					`[0:v]subtitles='${safeAssPath}'[v];[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];[1:a]${bgmFilterExpr},aformat=sample_rates=44100:channel_layouts=stereo[bgm];[a0][bgm]amix=inputs=2:duration=first:dropout_transition=2[a]`,
					'-map',
					'[v]',
					'-map',
					'[a]'
				);
			} else {
				ffmpegArgs.push(
					'-filter_complex',
					`[0:v]subtitles='${safeAssPath}'[v];[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a]`,
					'-map',
					'[v]',
					'-map',
					'[a]'
				);
			}

			// Choose hardware encoder for M1 or software fallback
			const finalCodecArgs = hasVT
				? [
						'-c:v',
						'h264_videotoolbox',
						'-b:v',
						is720p ? '4500k' : '8000k',
						'-realtime',
						'0'
					]
				: [
						'-c:v',
						'libx264',
						'-preset',
						'fast',
						'-crf',
						'22'
					];

			ffmpegArgs.push(
				...finalCodecArgs,
				'-c:a',
				'aac',
				'-b:a',
				'192k',
				'-ar',
				'44100',
				'-ac',
				'2',
				'-movflags',
				'+faststart',
				'-y',
				finalMp4Path
			);

			// Run final encode with ample timeout for long videos
			await runFFmpeg(ffmpegArgs, 600000); // 10 min max

			// Clean up temp dir (cache dir stays intact)
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
