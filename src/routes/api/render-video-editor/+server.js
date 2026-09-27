import fs from 'fs';
import path from 'path';
import { spawn, execFile } from 'child_process';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = util.promisify(execFile);

// Check VideoToolbox hardware acceleration on macOS
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

// Concurrency pool limiter
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

function runFFmpeg(args, timeoutMs = 600000) {
	return new Promise((resolve, reject) => {
		const bin = ffmpegPath || 'ffmpeg';
		const proc = spawn(bin, args);
		let stderr = '';
		const timer = setTimeout(() => {
			proc.kill('SIGKILL');
			reject(new Error(`FFmpeg timed out after ${timeoutMs / 1000}s`));
		}, timeoutMs);

		proc.stderr.on('data', (d) => {
			stderr += d.toString();
		});

		proc.on('close', (code) => {
			clearTimeout(timer);
			if (code === 0) resolve({ success: true, stderr });
			else reject(new Error(`FFmpeg error (code ${code}): ${stderr.slice(-600)}`));
		});

		proc.on('error', (err) => {
			clearTimeout(timer);
			reject(err);
		});
	});
}

export async function POST({ request }) {
	const rid = `editor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
	const tmp = path.resolve(`./static/renders/temp-${rid}`);
	let outName = `video-editor-${rid}.mp4`;
	let outPath = path.resolve(`./static/renders/${outName}`);

	const enc = new TextEncoder();
	let ctrl = null;
	const send = (data) => {
		if (ctrl) {
			ctrl.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
		}
	};

	const stream = new ReadableStream({
		start(c) {
			ctrl = c;
		}
	});

	(async () => {
		try {
			const body = await request.json();
			const {
				clips = [],
				visualTracks = null,
				audio = null,
				audioTracks = null,
				aspectRatio = '16:9',
				renderQuality = '1080p',
				videoTitle = 'video-editor-export'
			} = body;

			// Support both visualTracks array and flat clips array
			const resolvedVisualTracks = (visualTracks && visualTracks.length)
				? visualTracks
				: [{ id: 'v1', name: 'Visual V1', clips }];

			const mainClips = resolvedVisualTracks[0]?.clips || [];
			if (!mainClips.length) {
				send({ error: 'Tidak ada klip gambar di Track Utama (V1) untuk dirender.' });
				ctrl?.close();
				return;
			}

			// Dimensions calculation
			let W = 1920;
			let H = 1080;
			if (aspectRatio === '9:16') {
				W = renderQuality === '720p' ? 720 : 1080;
				H = renderQuality === '720p' ? 1280 : 1920;
			} else if (aspectRatio === '1:1') {
				W = renderQuality === '720p' ? 720 : 1080;
				H = renderQuality === '720p' ? 720 : 1080;
			} else {
				// 16:9
				W = renderQuality === '720p' ? 1280 : 1920;
				H = renderQuality === '720p' ? 720 : 1080;
			}

			const slug = String(videoTitle || 'slideshow')
				.replace(/[^a-zA-Z0-9 _-]+/g, '')
				.replace(/\s+/g, '-')
				.slice(0, 50)
				.toLowerCase() || `video-${rid}`;
			outName = `${slug}--${Date.now()}.mp4`;
			outPath = path.resolve(`./static/renders/${outName}`);

			const hasVT = await checkVideoToolboxSupport();
			send({
				progress: 5,
				step: `Menginisialisasi renderer multi-layer (${hasVT ? 'VideoToolbox' : 'CPU H.264'}, ${W}x${H}, ${mainClips.length} klip)...`
			});

			await fs.promises.mkdir(tmp, { recursive: true });
			await fs.promises.mkdir(path.resolve('./static/renders'), { recursive: true });

			const normCodec = hasVT
				? ['-c:v', 'h264_videotoolbox', '-b:v', renderQuality === '720p' ? '4000k' : '7500k', '-realtime', '1']
				: ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '22'];

			const finalCodec = hasVT
				? ['-c:v', 'h264_videotoolbox', '-b:v', renderQuality === '720p' ? '5000k' : '9000k', '-realtime', '0']
				: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '20'];

			// Helper to render image clips for a track
			async function renderTrackClips(trackClips, trackPrefix = 'v1') {
				let count = 0;
				const paths = new Array(trackClips.length);

				await asyncPool(3, trackClips.map((clip, index) => ({ clip, index })), async ({ clip, index }) => {
					const duration = Math.max(0.5, Number(clip.duration || 3.0));
					const imgPath = path.join(tmp, `img-${trackPrefix}-${index}.png`);
					const videoPath = path.join(tmp, `clip-${trackPrefix}-${index}.mp4`);

					const imgUrl = clip.imageUrl || clip.dataUrl || '';
					if (imgUrl.startsWith('data:image/')) {
						const base64Data = imgUrl.replace(/^data:image\/[^;]+;base64,/, '');
						await fs.promises.writeFile(imgPath, Buffer.from(base64Data, 'base64'));
					} else if (imgUrl.startsWith('/')) {
						const localP = path.resolve('./static' + imgUrl);
						if (fs.existsSync(localP)) {
							await fs.promises.copyFile(localP, imgPath);
						} else {
							await fs.promises.writeFile(imgPath, Buffer.from(''));
						}
					} else if (fs.existsSync(imgUrl)) {
						await fs.promises.copyFile(imgUrl, imgPath);
					}

					const motion = clip.motionEffect || 'none';
					const frames = Math.max(15, Math.round(duration * 30));

					let vFilter = '';
					if (motion === 'zoom_in') {
						vFilter = `scale=8000:-1,zoompan=z='min(zoom+0.0012,1.15)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,format=yuv420p`;
					} else if (motion === 'zoom_out') {
						vFilter = `scale=8000:-1,zoompan=z='if(lte(zoom,1.0),1.15,max(1.001,zoom-0.0012))':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,format=yuv420p`;
					} else if (motion === 'pan_left') {
						vFilter = `scale=8000:-1,zoompan=z='1.10':d=${frames}:x='if(lte(on,1),(iw-iw/zoom)/2,max(0,x-0.8))':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,format=yuv420p`;
					} else if (motion === 'pan_right') {
						vFilter = `scale=8000:-1,zoompan=z='1.10':d=${frames}:x='if(lte(on,1),0,min((iw-iw/zoom),x+0.8))':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,format=yuv420p`;
					} else {
						vFilter = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=30,format=yuv420p`;
					}

					try {
						await runFFmpeg([
							'-loop', '1',
							'-i', imgPath,
							'-t', String(duration),
							'-vf', vFilter,
							...normCodec,
							'-pix_fmt', 'yuv420p',
							'-y', videoPath
						], 120000);
					} catch (filterErr) {
						console.warn(`Fallback to safe scale for ${trackPrefix}-${index}:`, filterErr.message);
						await runFFmpeg([
							'-loop', '1',
							'-i', imgPath,
							'-t', String(duration),
							'-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=30,format=yuv420p`,
							...normCodec,
							'-pix_fmt', 'yuv420p',
							'-y', videoPath
						], 120000);
					}

					paths[index] = videoPath;
					count++;
					const pct = Math.round(10 + (count / trackClips.length) * 45);
					send({
						progress: pct,
						step: `Merender klip ${trackPrefix.toUpperCase()} (${count}/${trackClips.length}): ${clip.name || `Klip #${index + 1}`}`
					});
				});

				return paths;
			}

			// Render Main Visual Track (V1)
			send({ progress: 10, step: 'Memproses Track Visual V1 (Utama)...' });
			const v1ClipPaths = await renderTrackClips(mainClips, 'v1');

			send({ progress: 55, step: 'Menggabungkan urutan video Track V1...' });
			const concatV1Txt = path.join(tmp, 'concat-v1.txt');
			await fs.promises.writeFile(concatV1Txt, v1ClipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));

			let currentBaseVideo = path.join(tmp, 'base-v1.mp4');
			await runFFmpeg([
				'-f', 'concat',
				'-safe', '0',
				'-i', concatV1Txt,
				'-c', 'copy',
				'-y', currentBaseVideo
			], 300000);

			const totalVideoDuration = mainClips.reduce((acc, c) => acc + Math.max(0.5, Number(c.duration || 3.0)), 0);

			// Render Secondary Visual Track (V2 Layer/Overlay) if present
			const overlayTrack = resolvedVisualTracks[1];
			if (overlayTrack && overlayTrack.clips && overlayTrack.clips.length) {
				send({ progress: 62, step: 'Memproses Track Visual V2 (Layer Overlay / PIP)...' });
				const v2ClipPaths = await renderTrackClips(overlayTrack.clips, 'v2');
				const concatV2Txt = path.join(tmp, 'concat-v2.txt');
				await fs.promises.writeFile(concatV2Txt, v2ClipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));

				const v2Merged = path.join(tmp, 'overlay-v2.mp4');
				await runFFmpeg([
					'-f', 'concat',
					'-safe', '0',
					'-i', concatV2Txt,
					'-c', 'copy',
					'-y', v2Merged
				], 300000);

				// Overlay V2 onto V1 (Picture-in-picture in top-right or centered)
				send({ progress: 72, step: 'Menyusun layer visual V1 & V2 (Overlay)...' });
				const compositedVideo = path.join(tmp, 'video-composited.mp4');
				const pipW = Math.round(W * 0.35);
				const pipH = Math.round(H * 0.35);
				const margin = 24;

				// Overlay in top-right corner with subtle border
				const overlayFilter = `[1:v]scale=${pipW}:${pipH}:force_original_aspect_ratio=decrease,pad=${pipW}:${pipH}:(ow-iw)/2:(oh-ih)/2:color=black[pip];[0:v][pip]overlay=W-w-${margin}:${margin}:eof_action=pass[v]`;

				try {
					await runFFmpeg([
						'-i', currentBaseVideo,
						'-i', v2Merged,
						'-filter_complex', overlayFilter,
						'-map', '[v]',
						...normCodec,
						'-t', String(totalVideoDuration),
						'-y', compositedVideo
					], 300000);
					currentBaseVideo = compositedVideo;
				} catch (ovErr) {
					console.warn('Overlay filter warning, using base video:', ovErr.message);
				}
			}

			// Step 3: Handle Multiple Audio Tracks (A1, A2, etc.)
			send({ progress: 78, step: 'Sinkronisasi dan mixing multi-track audio...' });
			const rawAudioList = audioTracks && audioTracks.length
				? audioTracks
				: (audio?.audioUrl ? [audio] : []);

			const activeAudioItems = [];
			for (let aIdx = 0; aIdx < rawAudioList.length; aIdx++) {
				const track = rawAudioList[aIdx];
				const aUrl = track.audioUrl || track.url;
				if (!aUrl || track.isMuted) continue;

				const aFile = path.join(tmp, `audio-track-${aIdx}.mp3`);
				let ok = false;

				if (aUrl.startsWith('data:audio/')) {
					const base64Data = aUrl.replace(/^data:audio\/[^;]+;base64,/, '');
					await fs.promises.writeFile(aFile, Buffer.from(base64Data, 'base64'));
					ok = true;
				} else if (aUrl.startsWith('/')) {
					const localA = path.resolve('./static' + aUrl);
					if (fs.existsSync(localA)) {
						await fs.promises.copyFile(localA, aFile);
						ok = true;
					}
				} else if (fs.existsSync(aUrl)) {
					await fs.promises.copyFile(aUrl, aFile);
					ok = true;
				}

				if (ok) {
					activeAudioItems.push({
						filePath: aFile,
						volume: Math.min(2.0, Math.max(0.0, Number(track.volume ?? 1.0))),
						loop: Boolean(track.loop ?? true),
						name: track.name || `Audio Track #${aIdx + 1}`
					});
				}
			}

			// Step 4: Final Assembly & Encoding
			send({ progress: 85, step: `Merender MP4 final (${activeAudioItems.length} track audio, ${resolvedVisualTracks.length} layer visual)...` });
			const finalArgs = ['-i', currentBaseVideo];

			if (activeAudioItems.length > 0) {
				const filterParts = [];
				const amixInputs = [];

				for (let i = 0; i < activeAudioItems.length; i++) {
					const item = activeAudioItems[i];
					if (item.loop) {
						finalArgs.push('-stream_loop', '-1');
					}
					finalArgs.push('-i', item.filePath);
					const inputIndex = i + 1; // 0 is video
					filterParts.push(`[${inputIndex}:a]volume=${item.volume},aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`);
					amixInputs.push(`[a${i}]`);
				}

				if (activeAudioItems.length === 1) {
					finalArgs.push(
						'-filter_complex',
						`${filterParts[0]}`,
						'-map', '0:v',
						'-map', '[a0]',
						'-t', String(totalVideoDuration)
					);
				} else {
					const mixLine = `${amixInputs.join('')}amix=inputs=${activeAudioItems.length}:duration=first:dropout_transition=0:normalize=0[aout]`;
					finalArgs.push(
						'-filter_complex',
						`${filterParts.join(';')};${mixLine}`,
						'-map', '0:v',
						'-map', '[aout]',
						'-t', String(totalVideoDuration)
					);
				}
			} else {
				// No audio: generate clean silent stereo track
				finalArgs.push(
					'-f', 'lavfi',
					'-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
					'-map', '0:v',
					'-map', '1:a',
					'-t', String(totalVideoDuration)
				);
			}

			finalArgs.push(
				...finalCodec,
				'-c:a', 'aac',
				'-b:a', '192k',
				'-ar', '44100',
				'-ac', '2',
				'-movflags', '+faststart',
				'-y', outPath
			);

			await runFFmpeg(finalArgs, 600000);

			// Clean up temp folder
			fs.rm(tmp, { recursive: true, force: true }, () => {});

			send({
				progress: 100,
				step: 'Video multi-layer berhasil dibuat!',
				done: true,
				downloadUrl: `/renders/${outName}`,
				filename: outName,
				totalDuration: Number(totalVideoDuration.toFixed(2)),
				visualTracksCount: resolvedVisualTracks.length,
				audioTracksCount: activeAudioItems.length
			});
		} catch (err) {
			console.error('Error in /api/render-video-editor:', err);
			send({ error: err.message || 'Gagal merender video multi-layer' });
		} finally {
			ctrl?.close();
		}
	})();

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		}
	});
}
