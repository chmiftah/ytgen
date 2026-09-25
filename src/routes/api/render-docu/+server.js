import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

function runFFmpeg(args, timeoutMs = 300000) {
	return new Promise((resolve, reject) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		const timer = setTimeout(() => {
			proc.kill('SIGKILL');
			reject(new Error(`FFmpeg timeout after ${Math.round(timeoutMs / 1000)}s`));
		}, timeoutMs);
		proc.on('close', (code) => {
			clearTimeout(timer);
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg ${code}: ${stderr.slice(-1200)}`));
		});
		proc.on('error', (e) => {
			clearTimeout(timer);
			reject(e);
		});
	});
}

function makeSilent(dest, dur) {
	return runFFmpeg(['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', String(dur), '-y', dest], 120000);
}

function formatASSTime(sec) {
	const pad = (n, z = 2) => String(Math.floor(n)).padStart(z, '0');
	const cs = String(Math.floor((sec % 1) * 100)).padStart(2, '0');
	const s = sec % 60;
	const m = (sec / 60) % 60;
	const h = sec / 3600;
	return `${pad(h)}:${pad(m)}:${pad(s)}.${cs}`;
}

async function asyncPool(limit, items, fn) {
	const res = [];
	const exec = new Set();
	for (const it of items) {
		const p = Promise.resolve().then(() => fn(it));
		res.push(p);
		exec.add(p);
		const c = () => exec.delete(p);
		p.then(c, c);
		if (exec.size >= limit) await Promise.race(exec);
	}
	return Promise.all(res);
}

function hexToAssBgr(hex) {
	if (!hex) return '000000';
	const clean = hex.replace('#', '').trim();
	if (clean.length === 6) {
		return clean.slice(4, 6) + clean.slice(2, 4) + clean.slice(0, 2);
	}
	return '000000';
}

function buildDocuASS(scenes, W = 1920, H = 1080, opts = {}) {
	const scale = H / 1080;
	const baseFontSize = Math.round(Number(opts.fontSize || 54) * scale);
	const fontName = opts.fontFamily || 'Outfit';
	const primaryColor = hexToAssBgr(opts.textColor || '#FFFFFF');
	const highlightColor = hexToAssBgr(opts.highlightColor || '#FACC15');
	const boxBg = '&H80000000'; // Semi-transparent black backdrop box

	const lines = [
		'[Script Info]',
		'Title: Documentary Collage Subtitles',
		'ScriptType: v4.00+',
		`PlayResX: ${W}`,
		`PlayResY: ${H}`,
		'WrapStyle: 0',
		'ScaledBorderAndShadow: yes',
		'',
		'[V4+ Styles]',
		'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
		// Style 1: Documentary Headline Badge (Top-left / Top-center)
		`Style: DocuHeadline,${fontName},${Math.round(baseFontSize * 0.72)},&H00${highlightColor},&H00000000,&H00000000,${boxBg},-1,0,0,0,100,100,2,0,3,6,0,7,${Math.round(80 * scale)},${Math.round(80 * scale)},${Math.round(60 * scale)},1`,
		// Style 2: Narrative Subtitle (Bottom center, boxed for high contrast)
		`Style: DocuSub,${fontName},${baseFontSize},&H00${primaryColor},&H00000000,&H00000000,${boxBg},-1,0,0,0,100,100,1,0,3,8,0,2,${Math.round(120 * scale)},${Math.round(120 * scale)},${Math.round(75 * scale)},1`,
		'',
		'[Events]',
		'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
	];

	let currTime = 0;
	const SCENE_BREATH_PAUSE = 0.20;

	for (let i = 0; i < scenes.length; i++) {
		const s = scenes[i];
		const dur = Number(s.audioDuration || s.estimatedDuration || 5);
		const startSec = currTime;
		const endSec = currTime + dur;
		const sStr = formatASSTime(startSec);
		const eStr = formatASSTime(endSec);

		// 1. Evidence/Docu Header Badge (e.g. "EXHIBIT 01: ARTIFAK UTAMA")
		const headerTag = s.headerTag || s.keyPoint || `BUKTI ARSIP #${String(i + 1).padStart(2, '0')}`;
		if (headerTag) {
			const cleanTag = String(headerTag).replace(/[\r\n]+/g, ' ').slice(0, 50).toUpperCase();
			lines.push(`Dialogue: 1,${sStr},${eStr},DocuHeadline,,0,0,0,,{\\fad(200,200)}${cleanTag}`);
		}

		// 2. Main Narrative Subtitle
		const nar = (s.narration || '').replace(/[\r\n]+/g, ' ').trim();
		if (nar) {
			// Wrap text nicely (max ~38 chars per line)
			const words = nar.split(/\s+/);
			let formattedNar = '';
			let lineBuf = '';
			for (const w of words) {
				if ((lineBuf + ' ' + w).length > 38) {
					formattedNar += (formattedNar ? '\\N' : '') + lineBuf.trim();
					lineBuf = w;
				} else {
					lineBuf += (lineBuf ? ' ' : '') + w;
				}
			}
			if (lineBuf) formattedNar += (formattedNar ? '\\N' : '') + lineBuf.trim();

			lines.push(`Dialogue: 0,${sStr},${eStr},DocuSub,,0,0,0,,{\\fad(150,150)}${formattedNar}`);
		}

		currTime += (dur + SCENE_BREATH_PAUSE);
	}

	return lines.join('\n');
}

/**
 * Render an individual documentary collage scene video
 */
async function renderDocuSceneClip(s, i, vDest, dur, W, H, options = {}) {
	const clipCodec = ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p'];
	const bgTheme = s.bgTheme || options.docuTheme || 'vintage-desk';
	const bgPath = path.resolve(`./static/docu/backgrounds/${bgTheme}.png`);
	const safeBgPath = fs.existsSync(bgPath) ? bgPath : path.resolve('./static/docu/backgrounds/vintage-desk.png');

	// Determine evidence photo
	let mediaFile = '';
	const rawMedia = s.image || s.imageUrl || s.footageUrl || '';
	if (rawMedia.startsWith('/footage/') || rawMedia.startsWith('/docu/') || rawMedia.startsWith('/stickman/')) {
		const p = path.resolve('./static' + rawMedia);
		if (fs.existsSync(p)) mediaFile = p;
	} else if (rawMedia && fs.existsSync(rawMedia)) {
		mediaFile = rawMedia;
	}

	// Stamp asset
	const stampType = s.stamp || options.defaultStamp || (i % 3 === 0 ? 'classified' : i % 3 === 1 ? 'evidence' : 'none');
	let stampFile = null;
	if (stampType && stampType !== 'none') {
		const p = path.resolve(`./static/docu/elements/stamp-${stampType}.png`);
		if (fs.existsSync(p)) stampFile = p;
	}

	// Pin/Tape asset
	const pinType = s.pin || (i % 2 === 0 ? 'tape' : 'pushpin');
	let pinFile = null;
	if (pinType === 'tape') {
		pinFile = path.resolve('./static/docu/elements/tape-strip.png');
	} else if (pinType === 'pushpin') {
		pinFile = path.resolve('./static/docu/elements/pushpin.png');
	} else if (pinType === 'paperclip') {
		pinFile = path.resolve('./static/docu/elements/paperclip.png');
	}

	// Layout side (Evidence card on Left or Right)
	const side = (s.layoutSide || (i % 2 === 0 ? 'right' : 'left')).toLowerCase();
	const cardW = Math.round(W * 0.44);
	const cardH = Math.round(H * 0.54);
	const cardX = side === 'left' ? Math.round(W * 0.08) : Math.round(W * 0.48);
	const cardY = Math.round(H * 0.16);

	// Subtle Ken Burns motion expressions for photo card
	const motionType = i % 3 === 0 ? 'zoom' : i % 3 === 1 ? 'drift' : 'tilt';
	let photoZoom = 'min(1.0+t*0.008,1.06)';
	if (motionType === 'drift') photoZoom = 'min(1.05-t*0.006,1.05)';

	// Build FFmpeg complex filter
	const inputs = ['-loop', '1', '-i', safeBgPath];
	let filterComplex = '';

	if (mediaFile && fs.existsSync(mediaFile)) {
		const isVideo = ['.mp4', '.webm', '.mov', '.mkv'].some(ext => mediaFile.toLowerCase().endsWith(ext));
		if (isVideo) {
			inputs.push('-stream_loop', '-1', '-i', mediaFile);
		} else {
			inputs.push('-loop', '1', '-i', mediaFile);
		}
		let inputIdx = 1;

		// 1. Photo/Video with polaroid white border + subtle drop shadow
		// Frame: border 14px white, drop shadow
		const borderPad = 14;
		const innerW = cardW - borderPad * 2;
		const innerH = cardH - borderPad * 2 - 28; // extra room at bottom like polaroid

		if (isVideo) {
			filterComplex += `[${inputIdx}:v]scale=${innerW}:${innerH}:force_original_aspect_ratio=increase,crop=${innerW}:${innerH},fps=30,format=yuv420p[innerPic];`;
		} else {
			filterComplex += `[${inputIdx}:v]scale=${innerW}:${innerH}:force_original_aspect_ratio=increase,crop=${innerW}:${innerH},zoompan=z='${photoZoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${innerW}x${innerH}:fps=30,format=yuv420p[innerPic];`;
		}
		filterComplex += `[innerPic]pad=width=${cardW}:height=${cardH}:x=${borderPad}:y=${borderPad}:color=#f8fafc[polaroidCard];`;
		filterComplex += `[0:v][polaroidCard]overlay=x=${cardX}:y=${cardY}:shortest=1[baseWithCard];`;
		let lastV = 'baseWithCard';

		// 2. Add Pin or Tape overlay on top of card corner
		if (pinFile && fs.existsSync(pinFile)) {
			inputs.push('-loop', '1', '-i', pinFile);
			inputIdx++;
			const pinW = pinType === 'tape' ? Math.round(cardW * 0.42) : Math.round(cardW * 0.18);
			const pinX = side === 'left' ? cardX + Math.round(cardW * 0.30) : cardX + Math.round(cardW * 0.35);
			const pinY = Math.max(10, cardY - Math.round(cardH * 0.06));
			filterComplex += `[${inputIdx}:v]scale=${pinW}:-1[pinScaled];[${lastV}][pinScaled]overlay=x=${pinX}:y=${pinY}[withPin];`;
			lastV = 'withPin';
		}

		// 3. Add Stamp overlay slammed onto the document
		if (stampFile && fs.existsSync(stampFile)) {
			inputs.push('-loop', '1', '-i', stampFile);
			inputIdx++;
			const stampW = Math.round(cardW * 0.62);
			const stampX = side === 'left' ? cardX + Math.round(cardW * 0.35) : cardX - Math.round(cardW * 0.12);
			const stampY = cardY + Math.round(cardH * 0.58);
			// Stamp pops in with fade at 0.35s
			filterComplex += `[${inputIdx}:v]scale=${stampW}:-1,fade=t=in:st=0.35:d=0.20:alpha=1[stampScaled];[${lastV}][stampScaled]overlay=x=${stampX}:y=${stampY}[vFinal]`;
		} else {
			filterComplex += `[${lastV}]copy[vFinal]`;
		}
	} else {
		// No media image: display textured background with stamp and vignette
		if (stampFile && fs.existsSync(stampFile)) {
			inputs.push('-loop', '1', '-i', stampFile);
			const stampW = Math.round(W * 0.32);
			const stampX = Math.round((W - stampW) / 2);
			const stampY = Math.round(H * 0.28);
			filterComplex = `[1:v]scale=${stampW}:-1,fade=t=in:st=0.30:d=0.25:alpha=1[stampS];[0:v][stampS]overlay=x=${stampX}:y=${stampY}[vFinal]`;
		} else {
			filterComplex = `[0:v]scale=${W}:${H},format=yuv420p[vFinal]`;
		}
	}

	await runFFmpeg([
		...inputs,
		'-filter_complex', filterComplex,
		'-map', '[vFinal]',
		'-t', String(dur + 0.3),
		...clipCodec,
		'-y', vDest
	], 240000);
}

export async function POST({ request }) {
	const rid = `docu-${Date.now()}`;
	const tmp = path.resolve(`./static/renders/temp-${rid}`);
	let outName = `docu-${rid}.mp4`;
	let outPath = path.resolve(`./static/renders/${outName}`);
	const enc = new TextEncoder();
	let ctrl = null;
	const send = (d) => { if (ctrl) ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`)); };
	const stream = new ReadableStream({ start(c) { ctrl = c; } });

	(async () => {
		try {
			const {
				scenes,
				renderQuality = '1080p',
				videoTitle = '',
				docuTheme = 'vintage-desk', // 'vintage-desk' | 'kraft-paper' | 'dark-slate' | 'blueprint-grid'
				textColor = '#FFFFFF',
				highlightColor = '#FACC15',
				fontSize = 54,
				fontFamily = 'Outfit',
				defaultStamp = 'classified',
				bgmUrl = null,
				bgmVolume = 0.07
			} = await request.json();

			if (!scenes?.length) {
				send({ error: 'No scenes provided' });
				ctrl?.close();
				return;
			}

			const slug = String(videoTitle || 'documentary-video')
				.replace(/[^a-zA-Z0-9 _-]+/g, '')
				.replace(/\s+/g, '-')
				.slice(0, 60)
				.toLowerCase() || `docu-${rid}`;
			outName = `${slug}--${Date.now()}.mp4`;
			outPath = path.resolve(`./static/renders/${outName}`);

			const is720 = renderQuality === '720p';
			const W = is720 ? 1280 : 1920;
			const H = is720 ? 720 : 1080;

			let hasVT = false;
			try {
				const { execFile } = await import('child_process');
				const { promisify } = await import('util');
				const ef = promisify(execFile);
				const { stdout } = await ef(ffmpegPath || 'ffmpeg', ['-encoders']);
				hasVT = stdout.includes('h264_videotoolbox');
			} catch {}

			send({ progress: 5, step: `Inisialisasi Docu-Engine (${hasVT ? 'Hardware M1/M2/M3' : 'CPU Fast'})` });
			await fs.promises.mkdir(tmp, { recursive: true });
			await fs.promises.mkdir(path.resolve('./static/renders'), { recursive: true });

			const normCodec = hasVT
				? ['-c:v', 'h264_videotoolbox', '-b:v', is720 ? '3500k' : '6500k', '-realtime', '1']
				: ['-c:v', 'libx264', '-preset', 'ultrafast'];
			const finalCodec = hasVT
				? ['-c:v', 'h264_videotoolbox', '-b:v', is720 ? '4500k' : '8500k', '-realtime', '0']
				: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '22'];

			// 1. Process scene videos & audio clips
			let prepped = 0;
			await asyncPool(2, scenes.map((s, i) => ({ s, i })), async ({ s, i }) => {
				const vDest = path.join(tmp, `video-${i}.mp4`);
				const aDest = path.join(tmp, `audio-${i}.mp3`);
				const SCENE_BREATH_PAUSE = 0.20;
				const dur = Number((Number(s.audioDuration || s.estimatedDuration || 5) + SCENE_BREATH_PAUSE).toFixed(2));

				let aOk = false;
				if (s.voiceAudioUrl?.startsWith('data:audio')) {
					try {
						const b64 = s.voiceAudioUrl.replace(/^data:audio\/[^;]+;base64,/, '');
						await fs.promises.writeFile(aDest, Buffer.from(b64, 'base64'));
						aOk = true;
					} catch {}
				} else if (s.voiceAudioUrl?.startsWith('/renders/') || s.voiceAudioUrl?.startsWith('/')) {
					const localPath = path.resolve('./static' + s.voiceAudioUrl);
					if (fs.existsSync(localPath)) {
						try { await fs.promises.copyFile(localPath, aDest); aOk = true; } catch {}
					}
				} else if (s.voiceAudioUrl && fs.existsSync(s.voiceAudioUrl)) {
					try { await fs.promises.copyFile(s.voiceAudioUrl, aDest); aOk = true; } catch {}
				}

				if (!aOk) await makeSilent(aDest, dur);

				// Render documentary collage visual
				await renderDocuSceneClip(s, i, vDest, dur, W, H, { docuTheme, defaultStamp });

				prepped++;
				send({
					progress: Math.round(10 + (prepped / scenes.length) * 38),
					step: `Kolase arsip adegan ${prepped}/${scenes.length}`
				});
			});

			// 2. Normalization & Muxing
			send({ progress: 50, step: 'Sinkronisasi audio & klip...' });
			const clips = new Array(scenes.length);
			await asyncPool(2, scenes.map((s, i) => ({ s, i })), async ({ s, i }) => {
				const vDest = path.join(tmp, `video-${i}.mp4`);
				const aDest = path.join(tmp, `audio-${i}.mp3`);
				const out = path.join(tmp, `scene-${i}-norm.mp4`);
				const SCENE_BREATH_PAUSE = 0.20;
				const dur = Number((Number(s.audioDuration || s.estimatedDuration || 5) + SCENE_BREATH_PAUSE).toFixed(2));

				await runFFmpeg([
					'-stream_loop', '-1', '-i', vDest,
					'-i', aDest,
					'-filter_complex', `[0:v]scale=${W}:${H},fps=30,format=yuv420p[v];[1:a]apad=pad_dur=${SCENE_BREATH_PAUSE},aformat=sample_rates=44100:channel_layouts=stereo[a]`,
					'-map', '[v]', '-map', '[a]',
					'-t', String(dur),
					...normCodec,
					'-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '2',
					'-y', out
				], 300000);
				clips[i] = out;
			});

			// 3. Concat all scenes
			send({ progress: 75, step: 'Menggabungkan adegan dokumenter...' });
			const list = path.join(tmp, 'concat.txt');
			await fs.promises.writeFile(list, clips.map(p => `file '${p}'`).join('\n'));
			const combined = path.join(tmp, 'combined.mp4');
			await runFFmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-y', combined], 300000);

			// 4. Generate & apply Subtitles
			send({ progress: 80, step: 'Menyematkan tipografi arsip...' });
			const ass = buildDocuASS(scenes, W, H, { textColor, highlightColor, fontSize, fontFamily });
			const assPath = path.join(tmp, 'docu.ass');
			await fs.promises.writeFile(assPath, ass);
			const safeAss = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
			const fontsDir = path.resolve('./static/fonts');
			const safeFontsDir = fontsDir.replace(/\\/g, '/').replace(/:/g, '\\:');
			const subFilter = `subtitles='${safeAss}':fontsdir='${safeFontsDir}'`;

			// 5. Final encode with BGM & Ducking
			send({ progress: 85, step: 'Final mastering dokumenter...' });
			const fArgs = ['-i', combined];

			let bgmPath = null;
			if (bgmUrl?.startsWith('/')) {
				const p = path.resolve('./static' + bgmUrl);
				if (fs.existsSync(p)) bgmPath = p;
			}
			if (!bgmPath) bgmPath = path.resolve('./static/bgm/bgm-tension.mp3');
			if (!fs.existsSync(bgmPath)) bgmPath = path.resolve('./static/bgm/bgm-soundhelix-1.mp3');

			if (bgmPath && fs.existsSync(bgmPath)) {
				const vol = Math.min(0.25, Math.max(0.01, Number(bgmVolume || 0.07)));
				fArgs.push('-stream_loop', '-1', '-i', bgmPath);
				fArgs.push(
					'-filter_complex',
					`[0:v]${subFilter}[v];[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];[1:a]volume=${vol},aformat=sample_rates=44100:channel_layouts=stereo[bgm];[a0][bgm]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[a]`,
					'-map', '[v]', '-map', '[a]'
				);
			} else {
				fArgs.push(
					'-filter_complex',
					`[0:v]${subFilter}[v];[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a]`,
					'-map', '[v]', '-map', '[a]'
				);
			}

			fArgs.push(...finalCodec, '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2', '-movflags', '+faststart', '-y', outPath);
			await runFFmpeg(fArgs, 1200000);

			fs.rm(tmp, { recursive: true, force: true }, () => {});
			send({
				progress: 100,
				step: 'Selesai!',
				done: true,
				downloadUrl: `/renders/${outName}`,
				filename: outName
			});
		} catch (e) {
			console.error(e);
			send({ error: e.message });
		} finally {
			ctrl?.close();
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
