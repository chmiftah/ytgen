import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { analyzeNarrationToDiagram, generateDanKoeSVG, analyzeSentencePhases } from '$lib/typography/dynamicDiagram.js';

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

function buildDanKoeASS(scenes, W = 1920, H = 1080, opts = {}) {
	const isPortrait = W < H;
	const scale = isPortrait ? (W / 1080) : (H / 1080);
	const fontName = opts.fontFamily || 'Inter';
	const primaryColor = hexToAssBgr(opts.textColor || '#FFFFFF');
	const highlightColor = hexToAssBgr(opts.highlightColor || '#F59E0B');

	// Responsive style definitions for Portrait (9:16 Shorts) vs Landscape (16:9)
	const topicTagSize = Math.round((isPortrait ? 24 : 22) * scale);
	const topicTagMarginV = Math.round((isPortrait ? 90 : 45) * scale);
	const topicTagMarginH = Math.round((isPortrait ? 60 : 80) * scale);

	const pureQuoteSize = Math.round((opts.fontSize ? opts.fontSize * (isPortrait ? 2.1 : 2.3) : (isPortrait ? 56 : 62)) * scale);
	const pureQuoteMarginH = Math.round((isPortrait ? 70 : 180) * scale);

	const stackedCaptionSize = Math.round((opts.fontSize ? opts.fontSize * 1.55 : 40) * scale);
	// In portrait: bottom UI controls take up ~240-280px on 1080x1920, so marginV 260 ensures text sits cleanly in safe zone
	const stackedMarginV = Math.round((isPortrait ? 260 : 75) * scale);
	const stackedMarginH = Math.round((isPortrait ? 60 : 160) * scale);

	const splitCaptionSize = Math.round((opts.fontSize ? opts.fontSize * (isPortrait ? 1.55 : 1.7) : (isPortrait ? 40 : 44)) * scale);
	const splitAlign = isPortrait ? 2 : 5; // Bottom center in portrait, middle-left in landscape
	const splitMarginL = Math.round((isPortrait ? 60 : 920) * scale);
	const splitMarginR = Math.round((isPortrait ? 60 : 100) * scale);
	const splitMarginV = Math.round((isPortrait ? 260 : 0) * scale);

	const lines = [
		'[Script Info]',
		`Title: Dan Koe Clean Kinetic Typography Subtitles (${isPortrait ? 'Portrait 9:16 Shorts' : 'Landscape 16:9'})`,
		'ScriptType: v4.00+',
		`PlayResX: ${W}`,
		`PlayResY: ${H}`,
		'WrapStyle: 2',
		'ScaledBorderAndShadow: yes',
		'',
		'[V4+ Styles]',
		'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
		// Style 1: Topic Tag Header
		`Style: TopicTag,JetBrains Mono,${topicTagSize},&H00${highlightColor},&H00000000,&H00000000,&H00000000,-1,0,0,0,100,100,4,0,1,0,0,8,${topicTagMarginH},${topicTagMarginH},${topicTagMarginV},1`,
		// Style 2: Pure Typography (Centered, large & impactful)
		`Style: PureQuote,${fontName},${pureQuoteSize},&H00${primaryColor},&H00000000,&H80000000,&H00000000,-1,0,0,0,100,100,1,0,1,2,0,5,${pureQuoteMarginH},${pureQuoteMarginH},0,1`,
		// Style 3: Stacked Caption (Bottom-aligned, clean separation below diagram)
		`Style: StackedCaption,${fontName},${stackedCaptionSize},&H00${primaryColor},&H00000000,&H80000000,&H00000000,-1,0,0,0,100,100,1,0,1,2,0,2,${stackedMarginH},${stackedMarginH},${stackedMarginV},1`,
		// Style 4: Split Caption
		`Style: SplitCaption,${fontName},${splitCaptionSize},&H00${primaryColor},&H00000000,&H80000000,&H00000000,-1,0,0,0,100,100,1,0,1,2,0,${splitAlign},${splitMarginL},${splitMarginR},${splitMarginV},1`,
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

		// Layout Mode detection (default: diagram-stacked)
		const mode = s.layoutMode || 'diagram-stacked';

		// Top Tag: Only render if opts.showTopicTag is explicitly true (disabled per user instruction: "hilangkan label")
		if (opts.showTopicTag) {
			const tag = s.topicTag || s.headerTag || `[ CONCEPT // ${String(i + 1).padStart(2, '0')} ]`;
			lines.push(`Dialogue: 1,${sStr},${eStr},TopicTag,,0,0,0,,{\\fad(150,150)}${tag.toUpperCase()}`);
		}

		// Narration text with highlighted keywords - STRICTLY 1 SINGLE LINE
		const rawNar = (s.narration || '').trim();
		const highlightWord = (s.highlightWord || '').trim();
		const empStyle = s.emphasisStyle || opts.emphasisStyle || 'under';

		const words = rawNar.split(/\s+/);
		const formatted = words.map(w => {
			const cleanW = w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
			if (highlightWord && cleanW === highlightWord.toLowerCase()) {
				if (empStyle === 'under') {
					return `{\\u1\\c&H00${highlightColor}&\\b1}${w}{\\u0\\c&H00${primaryColor}&\\b0}`;
				} else if (empStyle === 'tanpa') {
					return `{\\b1}${w}{\\b0}`;
				} else {
					return `{\\c&H00${highlightColor}&\\b1}${w}{\\c&H00${primaryColor}&\\b0}`;
				}
			}
			return w;
		}).join(' ');

		const targetStyle = mode === 'pure-text' ? 'PureQuote' : mode === 'split-columns' ? 'SplitCaption' : 'StackedCaption';
		const baseSize = targetStyle === 'PureQuote' ? pureQuoteSize : targetStyle === 'SplitCaption' ? splitCaptionSize : stackedCaptionSize;

		// Auto-fit single line font size so long sentences never clip the screen edges
		const availW = isPortrait ? Math.round(W * 0.88) : Math.round(W * 0.82);
		const estCharW = baseSize * 0.52;
		let lineFontSize = baseSize;
		if (rawNar.length * estCharW > availW) {
			lineFontSize = Math.max(Math.round(isPortrait ? 22 * scale : 24 * scale), Math.floor(availW / (rawNar.length * 0.54)));
		}

		lines.push(`Dialogue: 0,${sStr},${eStr},${targetStyle},,0,0,0,,{\\fs${lineFontSize}\\fad(120,120)}${formatted}`);

		currTime += (dur + SCENE_BREATH_PAUSE);
	}

	return lines.join('\n');
}

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function renderSvgToPng(svgStr, pngDest, width = 700, height = 440) {
	if (!fs.existsSync(chromePath)) return false;
	const tmpSvg = pngDest.replace(/\.png$/, '.svg');
	fs.writeFileSync(tmpSvg, svgStr.trim());
	await new Promise((resolve, reject) => {
		const proc = spawn(chromePath, [
			'--headless',
			'--disable-gpu',
			'--default-background-color=00000000',
			`--screenshot=${pngDest}`,
			`--window-size=${width},${height}`,
			tmpSvg
		]);
		proc.on('close', (code) => {
			if (code === 0 && fs.existsSync(pngDest)) resolve();
			else reject(new Error(`Chrome headless code ${code}`));
		});
		proc.on('error', reject);
	});
	try { fs.unlinkSync(tmpSvg); } catch (_) {}
	return true;
}

/**
 * Render single motion typography clip
 */
async function renderTypographySceneClip(s, i, vDest, dur, W, H, options = {}) {
	const clipCodec = ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p'];
	const bgTheme = s.bgTheme || options.bgTheme || 'matte-black';
	const bgPath = path.resolve(`./static/typography/backgrounds/${bgTheme}.png`);
	const safeBgPath = fs.existsSync(bgPath) ? bgPath : path.resolve('./static/typography/backgrounds/matte-black.png');

	const mode = s.layoutMode || 'diagram-stacked';
	let diagramFiles = [];
	let tSplit = 0;

	// 1. Check if this scene has multiple timed vector phases (e.g. barbell -> brain)
	const phases = (s.phases && s.phases.length > 1) 
		? s.phases 
		: (s.narration ? analyzeSentencePhases(s.narration, options.highlightColor || '#F59E0B') : null);

	if (phases && phases.length > 1 && mode !== 'pure-text' && options.tmpDir) {
		const words = (s.narration || '').split(/\s+/).filter(Boolean);
		const totalWords = Math.max(1, words.length);
		const splitWord = phases[1].startWord || Math.floor(totalWords / 2);
		tSplit = Math.max(0.8, Math.min(dur - 0.8, Number(((splitWord / totalWords) * dur).toFixed(2))));

		const png0 = path.join(options.tmpDir, `dyn-diag-${i}-p0.png`);
		const png1 = path.join(options.tmpDir, `dyn-diag-${i}-p1.png`);
		try {
			await renderSvgToPng(phases[0].svg, png0, 700, 440);
			await renderSvgToPng(phases[1].svg, png1, 700, 440);
			if (fs.existsSync(png0) && fs.existsSync(png1)) {
				diagramFiles = [png0, png1];
			}
		} catch (e) {
			console.warn(`Multi-phase SVG conversion scene ${i}:`, e.message);
		}
	}

	// 2. Fallback to single dynamic SVG
	if (diagramFiles.length === 0) {
		let effectiveSvg = s.customSvg;
		if (!effectiveSvg && mode !== 'pure-text' && s.narration) {
			const diagData = s.diagramData || analyzeNarrationToDiagram(s.narration, options.highlightColor || '#F59E0B');
			if (s.diagramType) diagData.type = s.diagramType;
			effectiveSvg = generateDanKoeSVG(diagData, options.highlightColor || '#F59E0B');
		}

		if (effectiveSvg && effectiveSvg.includes('<svg') && mode !== 'pure-text' && options.tmpDir) {
			const dynPng = path.join(options.tmpDir, `dyn-diag-${i}.png`);
			try {
				await renderSvgToPng(effectiveSvg, dynPng, 700, 440);
				if (fs.existsSync(dynPng)) diagramFiles = [dynPng];
			} catch (e) {
				console.warn(`Dynamic SVG conversion fallback scene ${i}:`, e.message);
			}
		}
	}

	// 3. Fallback to pre-rendered diagrams if needed
	if (diagramFiles.length === 0 && s.diagram && s.diagram !== 'none') {
		const p = path.resolve(`./static/typography/diagrams/${s.diagram}.png`);
		if (fs.existsSync(p)) diagramFiles = [p];
	}

	const isPortrait = W < H;
	const inputs = ['-loop', '1', '-i', safeBgPath];
	let filterComplex = '';

	// Ensure background fills the entire target dimension (W:H) regardless of original image aspect ratio
	const bgScaleFilter = `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p[bg];`;

	if (diagramFiles.length >= 2 && mode !== 'pure-text') {
		inputs.push('-loop', '1', '-i', diagramFiles[0]);
		inputs.push('-loop', '1', '-i', diagramFiles[1]);

		const diagH = isPortrait 
			? Math.round(H * 0.38) 
			: (mode === 'split-columns' ? Math.round(H * 0.52) : Math.round(H * 0.48));
		const diagX = isPortrait 
			? '(W-w)/2' 
			: (mode === 'split-columns' ? Math.round(W * 0.06) : '(W-w)/2');
		const diagY = isPortrait 
			? '(H-h)/2 - 40' 
			: (mode === 'split-columns' ? '(H-h)/2' : '(H-h)/2 - 30');

		filterComplex = bgScaleFilter +
			`[1:v]scale=-1:${diagH},fade=t=in:st=0:d=0.25:alpha=1,fade=t=out:st=${Math.max(0.1, tSplit - 0.2)}:d=0.2:alpha=1[d1];` +
			`[2:v]scale=-1:${diagH},fade=t=in:st=${tSplit}:d=0.25:alpha=1,fade=t=out:st=${Math.max(0.1, dur - 0.2)}:d=0.2:alpha=1[d2];` +
			`[bg][d1]overlay=x=${diagX}:y=${diagY}:enable='lte(t,${tSplit})'[vMid];` +
			`[vMid][d2]overlay=x=${diagX}:y=${diagY}:enable='gte(t,${tSplit})'[vFinal]`;
	} else if (diagramFiles.length === 1 && mode !== 'pure-text') {
		inputs.push('-loop', '1', '-i', diagramFiles[0]);

		if (isPortrait) {
			// Portrait (9:16 Shorts): Centered diagram in middle zone
			const diagH = Math.round(H * 0.38);
			const diagX = '(W-w)/2';
			const diagY = '(H-h)/2 - 40';
			filterComplex = bgScaleFilter +
				`[1:v]scale=-1:${diagH},fade=t=in:st=0:d=0.25:alpha=1,fade=t=out:st=${Math.max(0.1, dur - 0.2)}:d=0.2:alpha=1[diag];[bg][diag]overlay=x=${diagX}:y=${diagY}:shortest=1[vFinal]`;
		} else if (mode === 'split-columns') {
			// Left side diagram
			const diagH = Math.round(H * 0.52);
			const diagX = Math.round(W * 0.06);
			const diagY = '(H-h)/2';
			filterComplex = bgScaleFilter +
				`[1:v]scale=-1:${diagH},fade=t=in:st=0:d=0.25:alpha=1,fade=t=out:st=${Math.max(0.1, dur - 0.2)}:d=0.2:alpha=1[diag];[bg][diag]overlay=x=${diagX}:y=${diagY}:shortest=1[vFinal]`;
		} else {
			// Stacked: Centered diagram in middle zone
			const diagH = Math.round(H * 0.48);
			const diagX = '(W-w)/2';
			const diagY = '(H-h)/2 - 30';
			filterComplex = bgScaleFilter +
				`[1:v]scale=-1:${diagH},fade=t=in:st=0:d=0.25:alpha=1,fade=t=out:st=${Math.max(0.1, dur - 0.2)}:d=0.2:alpha=1[diag];[bg][diag]overlay=x=${diagX}:y=${diagY}:shortest=1[vFinal]`;
		}
	} else {
		// Pure Typography (clean background, no colliding graphics)
		filterComplex = bgScaleFilter.replace(/\[bg\];$/, '[vFinal]');
	}

	await runFFmpeg([
		...inputs,
		'-filter_complex', filterComplex,
		'-map', '[vFinal]',
		'-t', String(dur + 0.25),
		...clipCodec,
		'-y', vDest
	], 240000);
}

export async function POST({ request }) {
	const rid = `typo-${Date.now()}`;
	const tmp = path.resolve(`./static/renders/temp-${rid}`);
	let outName = `typo-${rid}.mp4`;
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
				aspectRatio = '16:9',
				videoTitle = '',
				bgTheme = 'matte-black',
				textColor = '#FFFFFF',
				highlightColor = '#F59E0B',
				emphasisStyle = 'under',
				fontSize = 68,
				fontFamily = 'Inter',
				bgmUrl = null,
				bgmVolume = 0.08
			} = await request.json();

			if (!scenes?.length) {
				send({ error: 'No scenes provided' });
				ctrl?.close();
				return;
			}

			const isPortrait = aspectRatio === '9:16';
			const slug = String(videoTitle || 'typography-video')
				.replace(/[^a-zA-Z0-9 _-]+/g, '')
				.replace(/\s+/g, '-')
				.slice(0, 60)
				.toLowerCase() || `typo-${rid}`;
			outName = `${slug}-${isPortrait ? 'shorts-' : ''}${Date.now()}.mp4`;
			outPath = path.resolve(`./static/renders/${outName}`);

			const is720 = renderQuality === '720p';
			const W = isPortrait ? (is720 ? 720 : 1080) : (is720 ? 1280 : 1920);
			const H = isPortrait ? (is720 ? 1280 : 1920) : (is720 ? 720 : 1080);

			if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

			// Check HW Acceleration
			let finalVideoCodec = ['-c:v', 'libx264', '-preset', 'faster'];
			try {
				const checkHw = spawn(ffmpegPath || 'ffmpeg', ['-encoders']);
				let out = '';
				checkHw.stdout.on('data', d => { out += d.toString(); });
				await new Promise(r => checkHw.on('close', r));
				if (out.includes('h264_videotoolbox')) {
					finalVideoCodec = ['-c:v', 'h264_videotoolbox', '-b:v', is720 ? '4500k' : '9000k'];
					send({ progress: 5, step: 'Init Motion Typography Engine (Hardware M1/M2/M3)' });
				} else {
					send({ progress: 5, step: 'Init Motion Typography Engine (CPU Ultrafast)' });
				}
			} catch (_) {
				send({ progress: 5, step: 'Init Motion Typography Engine' });
			}

			const SCENE_BREATH_PAUSE = 0.05; // 50ms natural speech flow without awkward dead air
			send({ progress: 8, step: 'Sinkronisasi durasi audio & video...' });

			// Pre-resolve exact audio durations from disk so video clips and audio clips match to the millisecond
			for (let i = 0; i < scenes.length; i++) {
				const s = scenes[i];
				let srcPath = null;
				if (s.voiceAudioUrl) {
					if (s.voiceAudioUrl.startsWith('/renders/') || s.voiceAudioUrl.startsWith('/audio/') || s.voiceAudioUrl.startsWith('/tts/')) {
						const localP = path.resolve(`./static${s.voiceAudioUrl}`);
						if (fs.existsSync(localP)) srcPath = localP;
					}
				}
				if (srcPath) {
					const exactDur = await getAudioDurationFromFile(srcPath);
					if (exactDur && exactDur > 0.2) {
						s.audioDuration = exactDur;
					}
				}
				s._resolvedAudioPath = srcPath;
			}

			// Step 1: Render scene clips
			await asyncPool(3, scenes.map((s, idx) => ({ s, idx })), async ({ s, idx }) => {
				const vDest = path.join(tmp, `clip-${idx}.mp4`);
				const dur = Number(s.audioDuration || 3) + SCENE_BREATH_PAUSE;
				await renderTypographySceneClip(s, idx, vDest, dur, W, H, { bgTheme, tmpDir: tmp });
				const pct = 10 + Math.round(((idx + 1) / scenes.length) * 38);
				send({ progress: pct, step: `Motion canvas adegan ${idx + 1}/${scenes.length}` });
			});

			send({ progress: 50, step: 'Sinkronisasi audio...' });

			// Step 2: Handle Audio
			const audioClips = [];
			for (let i = 0; i < scenes.length; i++) {
				const s = scenes[i];
				const aDest = path.join(tmp, `audio-${i}.mp3`);
				const dur = Number(s.audioDuration || 3);
				const srcPath = s._resolvedAudioPath;

				if (srcPath && fs.existsSync(srcPath)) {
					const silencePad = path.join(tmp, `silence-${i}.mp3`);
					await makeSilent(silencePad, SCENE_BREATH_PAUSE);
					const concatList = path.join(tmp, `a-concat-${i}.txt`);
					fs.writeFileSync(concatList, `file '${srcPath}'\nfile '${silencePad}'\n`);
					await runFFmpeg(['-f', 'concat', '-safe', '0', '-i', concatList, '-c:a', 'libmp3lame', '-q:a', '2', '-y', aDest], 120000);
				} else {
					await makeSilent(aDest, dur + SCENE_BREATH_PAUSE);
				}
				audioClips.push(aDest);
			}

			// Step 3: Concat Video & Audio
			send({ progress: 75, step: 'Menggabungkan timeline...' });
			const vConcatFile = path.join(tmp, 'v-list.txt');
			const aConcatFile = path.join(tmp, 'a-list.txt');
			fs.writeFileSync(vConcatFile, scenes.map((_, i) => `file '${path.join(tmp, `clip-${i}.mp4`)}'`).join('\n') + '\n');
			fs.writeFileSync(aConcatFile, audioClips.map(a => `file '${a}'`).join('\n') + '\n');

			const fullVisual = path.join(tmp, 'visual-concat.mp4');
			const fullVoice = path.join(tmp, 'voice-concat.mp3');

			await Promise.all([
				runFFmpeg(['-f', 'concat', '-safe', '0', '-i', vConcatFile, '-c', 'copy', '-y', fullVisual], 240000),
				runFFmpeg(['-f', 'concat', '-safe', '0', '-i', aConcatFile, '-c:a', 'libmp3lame', '-q:a', '2', '-y', fullVoice], 240000)
			]);

			// Step 4: Generate ASS Subtitle
			send({ progress: 80, step: 'Menyematkan kinetic typography...' });
			const assContent = buildDanKoeASS(scenes, W, H, {
				fontFamily,
				textColor,
				highlightColor,
				emphasisStyle,
				fontSize
			});
			const assPath = path.join(tmp, 'subtitles.ass');
			fs.writeFileSync(assPath, assContent);

			// Step 5: Final Composite with Subtitles & BGM
			send({ progress: 85, step: 'Final mastering video...' });

			const finalInputs = ['-i', fullVisual, '-i', fullVoice];
			let filterExpr = `subtitles='${assPath.replace(/'/g, "'\\''").replace(/:/g, '\\:')}'`;

			let hasBgm = false;
			let localBgmPath = null;
			if (bgmUrl) {
				if (bgmUrl.startsWith('/bgm/')) {
					localBgmPath = path.resolve(`./static${bgmUrl}`);
				} else {
					localBgmPath = path.resolve(bgmUrl);
				}
				if (fs.existsSync(localBgmPath)) hasBgm = true;
			}

			if (hasBgm && localBgmPath) {
				finalInputs.push('-stream_loop', '-1', '-i', localBgmPath);
				const vol = Math.min(0.2, Math.max(0.02, Number(bgmVolume) || 0.08));
				// Ducking BGM under voice
				const filterWithBgm = `[0:v]${filterExpr}[vOut];[2:a]volume=${vol}[bgm];[1:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[aOut]`;
				await runFFmpeg([
					...finalInputs,
					'-filter_complex', filterWithBgm,
					'-map', '[vOut]',
					'-map', '[aOut]',
					...finalVideoCodec,
					'-c:a', 'aac',
					'-b:a', '192k',
					'-shortest',
					'-y', outPath
				], 1200000);
			} else {
				await runFFmpeg([
					...finalInputs,
					'-vf', filterExpr,
					'-map', '0:v',
					'-map', '1:a',
					...finalVideoCodec,
					'-c:a', 'aac',
					'-b:a', '192k',
					'-shortest',
					'-y', outPath
				], 1200000);
			}

			try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}

			send({
				progress: 100,
				step: 'Selesai!',
				done: true,
				downloadUrl: `/renders/${outName}`,
				filename: outName
			});
			ctrl?.close();
		} catch (err) {
			console.error('Render Typography Error:', err);
			send({ error: err.message });
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
