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

function buildEditorASS(subtitles = [], style = 'viral-yellow', W = 1920, H = 1080, position = 'bottom', fontScale = 1.0) {
	const fontName = style === 'mrbeast-bold' ? 'Impact' : 'Arial Black';
	let fontSize = Math.round((H >= 1080 ? 56 : 40) * (Number(fontScale) || 1.0));

	let primaryColor = '&H0000E8FF'; // Yellow BGR (FF E8 00)
	let outlineColor = '&H00000000'; // Black
	let backColor = '&H80000000';
	let outlineSize = 5;
	let shadowSize = 2;
	let isBold = -1;

	if (style === 'mrbeast-bold') {
		primaryColor = '&H00FFFFFF';
		outlineColor = '&H00000000';
		outlineSize = 6;
		shadowSize = 3;
	} else if (style === 'minimal') {
		primaryColor = '&H00FFFFFF';
		outlineColor = '&H00000000';
		outlineSize = 3;
		shadowSize = 1;
	}

	// Alignment: 2 (Bottom-center), 5 (Middle-center), 8 (Top-center)
	let alignment = 2;
	let marginV = Math.round(H * 0.1);
	if (position === 'top') {
		alignment = 8;
		marginV = Math.round(H * 0.08);
	} else if (position === 'center') {
		alignment = 5;
		marginV = 0;
	}

	function fmt(sec) {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = Math.floor(sec % 60);
		const cs = Math.floor((sec % 1) * 100);
		return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
	}

	const header = [
		'[Script Info]',
		'Title: Video Editor Subtitle',
		'ScriptType: v4.00+',
		`PlayResX: ${W}`,
		`PlayResY: ${H}`,
		'WrapStyle: 2',
		'ScaledBorderAndShadow: yes',
		'',
		'[V4+ Styles]',
		'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
		`Style: Default,${fontName},${fontSize},${primaryColor},${primaryColor},${outlineColor},${backColor},${isBold},0,0,0,100,100,1.2,0,1,${outlineSize},${shadowSize},${alignment},60,60,${marginV},1`,
		'',
		'[Events]',
		'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
	].join('\n');

	const dialogues = [];
	for (const sub of subtitles) {
		const start = Number(sub.start) || 0;
		const end = Number(sub.end) || (start + Number(sub.duration || 3));
		if (end <= start) continue;
		let txt = (sub.text || '').replace(/[{}]/g, '').trim();
		if (!txt) continue;
		if (style === 'mrbeast-bold') txt = txt.toUpperCase();
		dialogues.push(`Dialogue: 0,${fmt(start)},${fmt(end)},Default,,0,0,0,,{\\fad(50,50)}${txt}`);
	}

	return header + '\n' + dialogues.join('\n') + '\n';
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
				videoTitle = 'video-editor-export',
				subtitles = [],
				subtitlesEnabled = true,
				subtitleStyle = 'viral-yellow',
				subtitlePosition = 'bottom',
				subtitleFontScale = 1.0,
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

			// -------------------------------------------------------------
			// Step 1: Pre-process Audio Tracks & Exact Duration Auto-Sync
			// -------------------------------------------------------------
			send({ progress: 8, step: 'Menganalisis audio dan menghitung sinkronisasi timeline...' });
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
				} else if (fs.existsSync(aUrl)) {
					await fs.promises.copyFile(aUrl, aFile);
					ok = true;
				} else if (aUrl.startsWith('/')) {
					const localA = path.resolve('./static' + aUrl);
					if (fs.existsSync(localA)) {
						await fs.promises.copyFile(localA, aFile);
						ok = true;
					}
				}

				if (ok) {
					const fileDuration = await getAudioDurationFromFile(aFile);
					activeAudioItems.push({
						filePath: aFile,
						volume: Math.min(2.0, Math.max(0.0, Number(track.volume ?? 1.0))),
						loop: Boolean(track.loop === true),
						duration: fileDuration,
						name: track.name || `Audio Track #${aIdx + 1}`
					});
				}
			}

			// Safeguard: Check if voice narration audio is longer than visual clips
			// If so, automatically extend the last visual clip so visual never cuts out early!
			let initialVisualSum = mainClips.reduce((acc, c) => acc + Math.max(0.5, Number(c.duration || 3.0)), 0);
			const maxSpeechAudioDur = activeAudioItems
				.filter((a) => !a.loop && a.duration > 0)
				.reduce((max, a) => Math.max(max, a.duration), 0);

			if (maxSpeechAudioDur > 0 && maxSpeechAudioDur > initialVisualSum + 0.1) {
				const gap = Number((maxSpeechAudioDur - initialVisualSum).toFixed(2));
				const lastClip = mainClips[mainClips.length - 1];
				lastClip.duration = Number((Number(lastClip.duration || 3.0) + gap).toFixed(2));
				send({
					progress: 10,
					step: `Klip terakhir disinkronkan (+${gap}s) agar visual tepat mengiringi audio hingga selesai (${maxSpeechAudioDur.toFixed(1)}s).`
				});
			}

			const totalVideoDuration = Number(
				mainClips.reduce((acc, c) => acc + Math.max(0.5, Number(c.duration || 3.0)), 0).toFixed(2)
			);

			// Check if any transitions are enabled between clips
			const hasTransitions = mainClips.length > 1 && mainClips.slice(0, -1).some(
				(c) => c.transitionType && c.transitionType !== 'none'
			);

			// Helper to render image clips for a track with transition padding
			async function renderTrackClips(trackClips, trackPrefix = 'v1', useTransitions = false) {
				let count = 0;
				const paths = new Array(trackClips.length);

				await asyncPool(3, trackClips.map((clip, index) => ({ clip, index })), async ({ clip, index }) => {
					const baseDur = Math.max(0.5, Number(clip.duration || 3.0));

					// MATHEMATICAL FIX FOR XFADE SHRINKAGE:
					// In FFmpeg xfade, overlapping two clips by tDur reduces the combined timeline length by tDur.
					// To maintain exact timeline duration and prevent audio desync, any clip receiving an incoming
					// transition must be rendered with extra duration equal to tDur.
					let incomingTransDur = 0;
					if (useTransitions && index > 0) {
						const prevClip = trackClips[index - 1];
						const tType = prevClip.transitionType || 'fade';
						const isNone = !tType || tType === 'none';
						const prevDur = Math.max(0.5, Number(prevClip.duration || 3.0));
						incomingTransDur = isNone
							? 0.04
							: Math.min(prevDur * 0.45, baseDur * 0.45, Number(prevClip.transitionDuration || 0.5));
					}

					const duration = Number((baseDur + incomingTransDur).toFixed(3));
					const imgPath = path.join(tmp, `img-${trackPrefix}-${index}.png`);
					const videoPath = path.join(tmp, `clip-${trackPrefix}-${index}.mp4`);

					const imgUrl = clip.imageUrl || clip.dataUrl || '';
					let imageLoaded = false;
					if (imgUrl.startsWith('data:image/')) {
						const base64Data = imgUrl.replace(/^data:image\/[^;]+;base64,/, '');
						await fs.promises.writeFile(imgPath, Buffer.from(base64Data, 'base64'));
						imageLoaded = true;
					} else if (fs.existsSync(imgUrl)) {
						await fs.promises.copyFile(imgUrl, imgPath);
						imageLoaded = true;
					} else if (imgUrl.startsWith('/')) {
						const localP = path.resolve('./static' + imgUrl);
						if (fs.existsSync(localP)) {
							await fs.promises.copyFile(localP, imgPath);
							imageLoaded = true;
						}
					}

					// Fallback: If image is missing or 0 bytes (e.g. placeholder clips), generate a clean slide
					if (!imageLoaded || !fs.existsSync(imgPath) || (await fs.promises.stat(imgPath)).size === 0) {
						await runFFmpeg([
							'-f', 'lavfi',
							'-i', `color=c=0x18181b:s=${W}x${H}:d=1`,
							'-vframes', '1',
							'-y', imgPath
						], 30000);
					}

					const motion = clip.motionEffect || 'none';
					const frames = Math.max(15, Math.round(duration * 30));

					let vFilter = '';
					if (motion === 'zoom_in') {
						vFilter = `scale=8000:-1,zoompan=z='min(zoom+0.0012,1.15)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30`;
					} else if (motion === 'zoom_out') {
						vFilter = `scale=8000:-1,zoompan=z='if(lte(zoom,1.0),1.15,max(1.001,zoom-0.0012))':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30`;
					} else if (motion === 'pan_left') {
						vFilter = `scale=8000:-1,zoompan=z='1.10':d=${frames}:x='if(lte(on,1),(iw-iw/zoom)/2,max(0,x-0.8))':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30`;
					} else if (motion === 'pan_right') {
						vFilter = `scale=8000:-1,zoompan=z='1.10':d=${frames}:x='if(lte(on,1),0,min((iw-iw/zoom),x+0.8))':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30`;
					} else if (motion === 'diagonal_drift') {
						vFilter = `scale=8000:-1,zoompan=z='min(zoom+0.0008,1.12)':d=${frames}:x='if(lte(on,1),0,min((iw-iw/zoom),x+0.6))':y='if(lte(on,1),0,min((ih-ih/zoom),y+0.6))':s=${W}x${H}:fps=30`;
					} else if (motion === 'camera_shake') {
						vFilter = `scale=8000:-1,zoompan=z='1.08':d=${frames}:x='(iw-iw/zoom)/2+sin(on*0.8)*6':y='(ih-ih/zoom)/2+cos(on*0.7)*5':s=${W}x${H}:fps=30`;
					} else if (motion === 'pulse_pop') {
						vFilter = `scale=8000:-1,zoompan=z='1.05+sin(on*0.15)*0.04':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30`;
					} else {
						vFilter = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=30`;
					}

					// Append overlay effect filter
					const ov = clip.overlayEffect || 'none';
					if (ov === 'tv_static') {
						vFilter += `,noise=alls=22:allf=t+u,drawgrid=w=iw:h=4:t=1:c=black@0.22,eq=saturation=1.2:contrast=1.15`;
					} else if (ov === 'no_signal') {
						vFilter += `,drawbox=x=0:y=0:w=iw:h=ih:color=black@0.7:t=fill,drawbox=x=(iw-360)/2:y=(ih-120)/2:w=360:h=120:color=red@0.85:t=fill,drawtext=text='NO SIGNAL':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2-10,drawtext=text='INPUT DISCONNECTED':fontcolor=yellow:fontsize=18:x=(w-text_w)/2:y=(h-text_h)/2+24,noise=alls=28:allf=t+u`;
					} else if (ov === 'fog') {
						vFilter += `,eq=brightness=0.06:contrast=0.82:saturation=0.75,curves=lighter,boxblur=1:0`;
					} else if (ov === 'film_grain') {
						vFilter += `,noise=alls=18:allf=t,vignette=PI/4,colorchannelmixer=rr=1.05:gg=0.98:bb=0.88`;
					} else if (ov === 'light_leak') {
						vFilter += `,eq=brightness=0.08:saturation=1.3,colorbalance=rs=0.25:gs=0.1:bs=-0.15`;
					} else if (ov === 'rain') {
						vFilter += `,noise=alls=24:allf=t,eq=contrast=1.25:brightness=-0.04`;
					}

					vFilter += ',format=yuv420p';

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
			send({ progress: 12, step: 'Memproses Track Visual V1 (Utama)...' });
			const v1ClipPaths = await renderTrackClips(mainClips, 'v1', hasTransitions);

			send({ progress: 55, step: 'Menggabungkan urutan video Track V1 dengan transisi presisi...' });
			let currentBaseVideo = path.join(tmp, 'base-v1.mp4');

			if (hasTransitions && mainClips.length > 1) {
				try {
					const xfadeInputs = [];
					for (let i = 0; i < v1ClipPaths.length; i++) {
						xfadeInputs.push('-i', v1ClipPaths[i]);
					}

					const filterParts = [];
					let lastOutput = '[0:v]';
					let accTimelineDuration = Math.max(0.5, Number(mainClips[0].duration || 3.0));

					for (let i = 0; i < mainClips.length - 1; i++) {
						const clipA = mainClips[i];
						const clipB = mainClips[i + 1];
						const durB = Math.max(0.5, Number(clipB.duration || 3.0));
						const tType = clipA.transitionType || 'fade';
						const isNone = !tType || tType === 'none';
						const xfadeName = isNone ? 'fade' : tType;
						const tDur = isNone
							? 0.04
							: Math.min(Math.min(accTimelineDuration, durB) * 0.45, Number(clipA.transitionDuration || 0.5));
						
						// Transition starts exactly tDur before clipA reaches its nominal timeline end
						const offset = Math.max(0, accTimelineDuration - tDur);
						const nextOutput = i === mainClips.length - 2 ? '[v]' : `[v${i}]`;

						filterParts.push(`${lastOutput}[${i + 1}:v]xfade=transition=${xfadeName}:duration=${tDur.toFixed(3)}:offset=${offset.toFixed(3)}${nextOutput}`);
						lastOutput = nextOutput;

						// Because clipB was rendered with extra length = tDur,
						// the output length after this transition increases by exactly durB!
						accTimelineDuration += durB;
					}

					await runFFmpeg([
						...xfadeInputs,
						'-filter_complex', filterParts.join(';'),
						'-map', '[v]',
						...normCodec,
						'-y', currentBaseVideo
					], 300000);
				} catch (xfadeErr) {
					console.warn('XFade processing failed, falling back to direct concat:', xfadeErr.message);
					const concatV1Txt = path.join(tmp, 'concat-v1.txt');
					await fs.promises.writeFile(concatV1Txt, v1ClipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));
					await runFFmpeg([
						'-f', 'concat',
						'-safe', '0',
						'-i', concatV1Txt,
						'-c', 'copy',
						'-y', currentBaseVideo
					], 300000);
				}
			} else {
				// Fast direct concat
				const concatV1Txt = path.join(tmp, 'concat-v1.txt');
				await fs.promises.writeFile(concatV1Txt, v1ClipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));
				await runFFmpeg([
					'-f', 'concat',
					'-safe', '0',
					'-i', concatV1Txt,
					'-c', 'copy',
					'-y', currentBaseVideo
				], 300000);
			}

			// Render Secondary Visual Track (V2 Layer/Overlay) if present
			const overlayTrack = resolvedVisualTracks[1];
			if (overlayTrack && overlayTrack.clips && overlayTrack.clips.length) {
				send({ progress: 62, step: 'Memproses Track Visual V2 (Layer Overlay / PIP)...' });
				const v2ClipPaths = await renderTrackClips(overlayTrack.clips, 'v2', false);
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

			// Subtitle Burn-in (if enabled and subtitles provided)
			if (subtitlesEnabled && subtitles && subtitles.length > 0) {
				send({ progress: 80, step: 'Membakar subtitle & teks ke dalam video...' });
				const assContent = buildEditorASS(subtitles, subtitleStyle, W, H, subtitlePosition, subtitleFontScale);
				const assFile = path.join(tmp, 'subtitles.ass');
				await fs.promises.writeFile(assFile, assContent, 'utf-8');

				const subVideo = path.join(tmp, 'video-with-subtitles.mp4');
				try {
					const escapedAss = assFile.replace(/\\/g, '/').replace(/:/g, '\\:');
					await runFFmpeg([
						'-i', currentBaseVideo,
						'-vf', `ass=${escapedAss}`,
						...normCodec,
						'-t', String(totalVideoDuration),
						'-y', subVideo
					], 300000);
					currentBaseVideo = subVideo;
				} catch (subErr) {
					console.warn('Subtitle burn-in warning, continuing with base video:', subErr.message);
				}
			}

			// Step 3: Final Assembly & Encoding with Audio Synchronization
			send({ progress: 85, step: `Merender MP4 final (${activeAudioItems.length} track audio, durasi ${totalVideoDuration}s)...` });
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
					const mixLine = `${amixInputs.join('')}amix=inputs=${activeAudioItems.length}:duration=longest:dropout_transition=0:normalize=0[aout]`;
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
				step: 'Video multi-layer berhasil dibuat dengan sinkronisasi presisi!',
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
