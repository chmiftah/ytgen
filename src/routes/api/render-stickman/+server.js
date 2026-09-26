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
		proc.on('close', (code) => { clearTimeout(timer); if (code === 0) resolve(); else reject(new Error(`FFmpeg ${code}: ${stderr.slice(-1200)}`)); });
		proc.on('error', (e) => { clearTimeout(timer); reject(e); });
	});
}

function makeSilent(dest, dur) {
	return runFFmpeg(['-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-t', String(dur), '-y', dest], 120000);
}

function formatASSTime(sec) {
	const pad = (n, z=2) => String(Math.floor(n)).padStart(z,'0');
	const cs = String(Math.floor((sec%1)*100)).padStart(2,'0');
	const s = sec % 60; const m = (sec/60)%60; const h = sec/3600;
	return `${pad(h)}:${pad(m)}:${pad(s)}.${cs}`;
}

const FONT_FAMILY_MAP = {
	"'Cabin Sketch',cursive": 'Cabin Sketch',
	"'Fredericka the Great',cursive": 'Fredericka the Great',
	"'Shadows Into Light',cursive": 'Shadows Into Light',
	"'Kalam',cursive": 'Kalam',
	"'Indie Flower',cursive": 'Indie Flower',
	"'Patrick Hand',cursive": 'Patrick Hand',
	"'Caveat','Patrick Hand',cursive": 'Caveat',
	"'Outfit',sans-serif": 'Outfit',
	"'Inter',sans-serif": 'Inter',
	"'Montserrat',sans-serif": 'Montserrat'
};

function resolveFontFamily(fontFamilyStr) {
	if (!fontFamilyStr) return 'Cabin Sketch';
	if (FONT_FAMILY_MAP[fontFamilyStr]) return FONT_FAMILY_MAP[fontFamilyStr];
	const clean = fontFamilyStr.split(',')[0].replace(/['"]/g, '').trim();
	const low = clean.toLowerCase();
	if (low.includes('cabin')) return 'Cabin Sketch';
	if (low.includes('fredericka')) return 'Fredericka the Great';
	if (low.includes('shadows')) return 'Shadows Into Light';
	if (low.includes('kalam')) return 'Kalam';
	if (low.includes('indie')) return 'Indie Flower';
	if (low.includes('patrick')) return 'Patrick Hand';
	if (low.includes('caveat')) return 'Caveat';
	if (low.includes('outfit')) return 'Outfit';
	if (low.includes('inter')) return 'Inter';
	if (low.includes('montserrat')) return 'Montserrat';
	return clean || 'Cabin Sketch';
}

function hexToAssBgr(hex) {
	if (!hex) return '000000';
	const clean = hex.replace('#', '').trim();
	if (clean.length === 6) {
		return clean.slice(4, 6) + clean.slice(2, 4) + clean.slice(0, 2);
	}
	if (clean.length === 3) {
		const r = clean[0] + clean[0];
		const g = clean[1] + clean[1];
		const b = clean[2] + clean[2];
		return b + g + r;
	}
	return '000000';
}

function isDarkColor(hex) {
	try {
		const clean = (hex || '').replace('#', '').trim();
		if (clean.length === 6) {
			const r = parseInt(clean.slice(0, 2), 16);
			const g = parseInt(clean.slice(2, 4), 16);
			const b = parseInt(clean.slice(4, 6), 16);
			return (r * 0.299 + g * 0.587 + b * 0.114) < 150;
		}
		return true;
	} catch { return true; }
}

function getDisplayFontSize(text, baseSize = 60) {
	const lines = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
	const maxLineLen = lines.length ? Math.max(...lines.map(l => l.length)) : String(text || '').length;
	let size = baseSize;
	if (lines.length >= 3 && baseSize > 46) {
		size = Math.round(baseSize * 0.86);
	}
	if (maxLineLen <= 14) return size;
	if (maxLineLen <= 20) return Math.max(22, Math.round(size * 0.9));
	if (maxLineLen <= 28) return Math.max(20, Math.round(size * 0.78));
	return Math.max(18, Math.round(size * 0.68));
}

function buildSplitASS(scenes, W = 1920, H = 1080, opts = {}) {
	const baseFontSize = Number(opts.fontSize) || 60;
	const canvasRefH = Number(opts.previewCanvasHeight) || 430;
	const fam = resolveFontFamily(opts.fontFamily || "'Shadows Into Light',cursive");

	const isChalkboard = (opts.canvasTheme || '').toLowerCase() === 'chalkboard';
	const rawTopOpt = opts.textColorTop || '#DC2626';
	const effTopOpt = (isChalkboard && rawTopOpt.toLowerCase() === '#dc2626') ? '#F87171' : rawTopOpt;
	const colorTopBgr = hexToAssBgr(effTopOpt);

	const rawBottomOpt = opts.textColorBottom || opts.textColor || '#111827';
	const effBottomOpt = (isChalkboard && (rawBottomOpt.toLowerCase() === '#111827' || rawBottomOpt.toLowerCase() === '#000000')) ? '#FFFFFF' : rawBottomOpt;
	const colorBottomBgr = hexToAssBgr(effBottomOpt);

	function getLines(text) {
		const raw = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
		if (raw.length) return raw.slice(0, 5);
		const t = String(text || '').trim();
		return t ? [t] : [];
	}

	let ass = `[Script Info]
Title: Stickman Text
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${H}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fam},${Math.round(baseFontSize * (H / canvasRefH))},&H00${colorBottomBgr}&,&H000000FF,&H00${colorBottomBgr}&,&H00000000&,0,0,0,0,100,100,0,0,1,1.5,0,5,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

	let t = 0;
	for (let i = 0; i < scenes.length; i++) {
		const sc = scenes[i];
		const dur = Number((Number(sc.audioDuration || sc.estimatedDuration || 5) + 0.20).toFixed(2));
		const kpRaw = (sc.keyPoint || sc.narration || '').replace(/\{/g, '(').replace(/\}/g, ')').slice(0, 140);
		const lines = getLines(kpRaw);
		if (!lines.length) { t += dur; continue; }
		const maxLineLen = Math.max(4, ...lines.map(l => l.length));
		const lineCount = lines.length;

		// Padding calculations (done before font size — needed for auto-fit)
		const padPct = Math.min(15, Math.max(0, Number(opts.videoPadding ?? 4))) / 100;
		const padX = Math.round(W * padPct);
		const padY = Math.round(H * padPct);
		const innerW = W - 2 * padX;
		const innerH = H - 2 * padY;

		// Position & alignment logic
		const alignMode = (sc.textAlign || opts.defaultAlign || '').toLowerCase();
		const side = (sc.textSide || sc.layoutSide || (i % 2 === 0 ? 'left' : 'right')).toLowerCase();

		// Exact 1:1 proportional font size directly matching canvas preview
		const scFontSize = Number(sc.fontSize) || baseFontSize || 60;
		const displayFontSize = getDisplayFontSize(kpRaw, scFontSize);
		// Scale from preview canvas height (canvasRefH) to video resolution height H (PlayResY)
		const assFontSize = Math.round(displayFontSize * (H / canvasRefH));
		const offX = Number(sc.textOffsetX || 0);
		const offY = Number(sc.textOffsetY || 0);
		const rot = Number(sc.textRotate ?? 0);
		const scalePct = Math.round((Number(sc.textScale ?? 1)) * 100);
		const rotTag = rot ? `\\frz${rot}` : '';
		const scaleTag = scalePct !== 100 ? `\\fscx${scalePct}\\fscy${scalePct}` : '';
		const anim = sc.textAnim || opts.defaultAnim || 'pop';
		const textIdle = sc.textIdleMotion || opts.defaultTextIdle || 'shake';

		let align = 5;
		let posX = Math.round(padX + innerW * 0.5);
		let posY = Math.round(padY + innerH * (0.50 + offY / 100));

		if (alignMode === 'middle') {
			align = 5; // Middle Center
			posX = Math.round(padX + innerW * (0.50 + offX / 100));
		} else if (side === 'left') {
			if (alignMode === 'center') {
				align = 5; // Middle Center of left column
				posX = Math.round(padX + innerW * (0.24 + offX / 100));
			} else if (alignMode === 'right') {
				align = 6; // Middle Right of left column
				posX = Math.round(padX + innerW * (0.42 + offX / 100));
			} else {
				align = 4; // Middle Left (default)
				posX = Math.round(padX + innerW * (0.06 + offX / 100));
			}
		} else {
			// side === 'right'
			if (alignMode === 'center') {
				align = 5; // Middle Center of right column
				posX = Math.round(padX + innerW * (0.76 + offX / 100));
			} else if (alignMode === 'left') {
				align = 4; // Middle Left of right column
				posX = Math.round(padX + innerW * (0.58 + offX / 100));
			} else {
				align = 6; // Middle Right (default)
				posX = Math.round(padX + innerW * (0.94 + offX / 100));
			}
		}

		// Entrance animation tags & timings:
		// Requirement: Gambar muncul dulu (t=0), baru teks muncul menyusul (t=textDelay ~0.48s).
		// Ketika ganti scene, gambar dan teks menghilang bersamaan (fade-out 250ms).
		const textDelay = Math.min(0.50, Math.max(0.25, Number((dur * 0.16).toFixed(2))));
		const exitDurMs = 250;
		const durMs = Math.round((dur - textDelay) * 1000);

		let animTag = '';
		let isMove = false;
		let moveStartX = posX;
		let entranceDur = 450;

		if (anim === 'pop') {
			animTag = `\\fscx${Math.round(scalePct * 0.7)}\\fscy${Math.round(scalePct * 0.7)}\\fad(120,${exitDurMs})\\t(0,250,\\fscx${Math.round(scalePct * 1.08)}\\fscy${Math.round(scalePct * 1.08)})\\t(250,450,\\fscx${scalePct}\\fscy${scalePct})`;
			entranceDur = 450;
		} else if (anim === 'slide') {
			isMove = true;
			moveStartX = side === 'left' ? posX - 120 : posX + 120;
			entranceDur = 400;
		} else if (anim === 'fade') {
			animTag = `\\fad(350,${exitDurMs})`;
			entranceDur = 350;
		} else if (anim === 'typewriter') {
			animTag = `\\fad(120,${exitDurMs})\\t(0,${Math.min(900, Math.round((dur - textDelay - 0.3) * 1000))},${scaleTag})`;
			entranceDur = 600;
		} else {
			animTag = `\\fad(80,${exitDurMs})`;
			entranceDur = 100;
		}

		// Continuous idle motion tags throughout duration
		let idleTags = '';
		if (textIdle === 'shake') {
			let currT = entranceDur;
			let step = 480;
			let toggle = true;
			while (currT < durMs - exitDurMs) {
				const nextT = Math.min(durMs - exitDurMs, currT + step);
				const targetRot = (rot + (toggle ? 0.7 : -0.7)).toFixed(1);
				const targetScale = Math.round(scalePct * (toggle ? 1.02 : 0.99));
				idleTags += `\\t(${currT},${nextT},\\frz${targetRot}\\fscx${targetScale}\\fscy${targetScale})`;
				currT = nextT;
				toggle = !toggle;
			}
		} else if (textIdle === 'breathe') {
			let currT = entranceDur;
			let step = 850;
			let toggle = true;
			while (currT < durMs - exitDurMs) {
				const nextT = Math.min(durMs - exitDurMs, currT + step);
				const targetScale = Math.round(scalePct * (toggle ? 1.03 : 0.99));
				idleTags += `\\t(${currT},${nextT},\\fscx${targetScale}\\fscy${targetScale})`;
				currT = nextT;
				toggle = !toggle;
			}
		} else if (textIdle === 'drift') {
			const targetScale = Math.round(scalePct * 1.04);
			const targetRot = (rot + 0.5).toFixed(1);
			idleTags = `\\t(${entranceDur},${durMs - exitDurMs},\\frz${targetRot}\\fscx${targetScale}\\fscy${targetScale})`;
		}

		// Different colors between top line (idx 0) and bottom lines (idx >= 1) with matching stroke for thickness
		const rawScTop = sc.textColorTop || effTopOpt;
		const effScTop = (isChalkboard && rawScTop.toLowerCase() === '#dc2626') ? '#F87171' : rawScTop;
		const scColorTop = hexToAssBgr(effScTop);

		const rawScBottom = sc.textColorBottom || effBottomOpt;
		const effScBottom = (isChalkboard && (rawScBottom.toLowerCase() === '#111827' || rawScBottom.toLowerCase() === '#000000')) ? '#FFFFFF' : rawScBottom;
		const scColorBottom = hexToAssBgr(effScBottom);

		// Line spacing: each line is a separate Dialogue event with \pos(x,Y), where Y is the
		// vertical center of the glyph. Because Shadows Into Light has large font metrics
		// (ascender 1203/1024 em), using 1.04x em as spacing results in doubled visual gap.
		// 0.78x matches the canvas CSS line-height: 1.15 + gap: 3px
		const lineSpacing = Math.round(assFontSize * 0.78);
		const totalBlockH = (lineCount - 1) * lineSpacing;

		for (let idx = 0; idx < lineCount; idx++) {
			const lineText = lines[idx];
			const isTop = idx === 0;
			const col = isTop ? scColorTop : scColorBottom;
			const lineY = Math.round(posY - totalBlockH / 2 + (idx * lineSpacing));
			const linePosOrMove = isMove ? `\\move(${moveStartX},${lineY},${posX},${lineY},0,380)\\fad(120,${exitDurMs})` : `\\pos(${posX},${lineY})`;
			const lineTags = `\\an${align}${linePosOrMove}\\fs${assFontSize}\\fn${fam}\\b0\\bord1.5\\shad0${rotTag}${isMove ? '' : scaleTag}${animTag}${idleTags}\\1c&H${col}&\\3c&H${col}&\\bord1.5`;

			// Teks mulai muncul di t + textDelay (setelah gambar muncul) dan fade out bersamaan di akhir adegan
			ass += `Dialogue: 0,${formatASSTime(t + textDelay)},${formatASSTime(t + dur)},Default,,0,0,0,,{${lineTags}}${lineText}\n`;
		}
		t += dur;
	}
	return ass;
}

async function asyncPool(limit, items, fn) {
	const res=[]; const exec=new Set();
	for (const it of items) {
		const p = Promise.resolve().then(()=>fn(it));
		res.push(p); exec.add(p);
		const c=()=>exec.delete(p); p.then(c,c);
		if (exec.size>=limit) await Promise.race(exec);
	}
	return Promise.all(res);
}

async function renderImageClip(imgPath, vDest, dur, W, H, animType, sceneIndex, textSide, idleMotion = 'shake', videoPadding = 4, canvasTheme = 'white') {
	let effectiveAnim = animType || 'dynamic';
	if (effectiveAnim === 'dynamic') {
		const cycle = ['slide-top', 'slide-side', 'zoom-in', 'pop'];
		effectiveAnim = cycle[sceneIndex % cycle.length];
	}

	const clipCodec = ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p'];

	const isChalkboard = canvasTheme === 'chalkboard';
	const isPaper = ['sketchbook', 'kraft', 'grid', 'doodle'].includes(canvasTheme);

	let themeBgFile = null;
	let themeBgInput = null;
	let fadeColor = 'white';

	if (canvasTheme === 'sketchbook') {
		themeBgInput = `color=c=0xF5EEDB:size=${W}x${H}:rate=30`;
		fadeColor = '0xF5EEDB';
	} else if (canvasTheme === 'kraft') {
		const kraftPath = path.resolve('./static/stickman/themes/kraft-bg.jpg');
		if (fs.existsSync(kraftPath)) {
			themeBgFile = kraftPath;
		} else {
			themeBgInput = `color=c=0xD4BA88:size=${W}x${H}:rate=30`;
		}
		fadeColor = '0xD4BA88';
	} else if (canvasTheme === 'grid') {
		const gridPath = path.resolve('./static/stickman/themes/grid-bg.png');
		if (fs.existsSync(gridPath)) {
			themeBgFile = gridPath;
		} else {
			themeBgInput = `color=c=0xF5EEDB:size=${W}x${H}:rate=30,format=gbrp,drawgrid=w=40:h=40:t=1:c=0x405575@0.22,drawgrid=w=200:h=200:t=2:c=0x354560@0.35`;
		}
		fadeColor = '0xF5EEDB';
	} else if (canvasTheme === 'doodle') {
		const doodlePath = path.resolve('./static/stickman/themes/doodle-bg.jpg');
		if (fs.existsSync(doodlePath)) {
			themeBgFile = doodlePath;
		} else {
			themeBgInput = `color=c=0xF5EEDB:size=${W}x${H}:rate=30`;
		}
		fadeColor = '0xF5EEDB';
	} else if (canvasTheme === 'chalkboard') {
		themeBgInput = `color=c=0x121212:size=${W}x${H}:rate=30`;
		fadeColor = '0x121212';
	}

	if (!imgPath || !fs.existsSync(imgPath)) {
		if (themeBgFile) {
			await runFFmpeg(['-loop', '1', '-i', themeBgFile, '-vf', `scale=${W}:${H},fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25:color=${fadeColor},format=yuv420p`, '-t', String(dur), ...clipCodec, '-y', vDest], 180000);
		} else if (themeBgInput) {
			await runFFmpeg(['-f', 'lavfi', '-i', themeBgInput, '-vf', `fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25:color=${fadeColor},format=yuv420p`, '-t', String(dur), ...clipCodec, '-y', vDest], 180000);
		} else {
			await runFFmpeg(['-f', 'lavfi', '-i', `color=c=white:size=${W}x${H}:rate=30`, '-t', String(dur), ...clipCodec, '-y', vDest], 180000);
		}
		return;
	}

	const padPct = Math.min(15, Math.max(0, Number(videoPadding ?? 4))) / 100;
	const padX = Math.round(W * padPct);
	const padY = Math.round(H * padPct);
	const innerW = W - 2 * padX;
	const innerH = H - 2 * padY;

	// Idle motion displacement expressions
	let xIdle = '0';
	let yIdle = '0';
	if (idleMotion === 'shake') {
		xIdle = '5*sin(t*4.2)+2.5*sin(t*8.6)';
		yIdle = '4*cos(t*3.4)+2.5*cos(t*6.8)';
	} else if (idleMotion === 'breathe') {
		xIdle = '6*sin(t*1.6)';
		yIdle = '5*cos(t*1.2)';
	} else if (idleMotion === 'drift') {
		xIdle = '(-4*t/dur)';
		yIdle = '(-3*t/dur)';
	}

	const padW = Math.round(innerW * 1.05);
	const padH = Math.round(innerH * 1.05);

	let animFilter = '';
	if (effectiveAnim === 'static') {
		animFilter = `[0:v]scale=${padW}:${padH}:force_original_aspect_ratio=increase,crop=${innerW}:${innerH},format=yuv420p[fg];[1:v][fg]overlay=x='${padX}+(${xIdle})':y='${padY}+(${yIdle})'[animFrame]`;
	} else if (effectiveAnim === 'slide-top') {
		const yEntrance = `-${innerH}*(1-sin(t/0.55*1.5708))`;
		const yExpr = `if(lt(t,0.55), ${yEntrance}, ${yIdle})`;
		const xExpr = `if(lt(t,0.55), 0, ${xIdle})`;
		animFilter = `[0:v]scale=${padW}:${padH}:force_original_aspect_ratio=increase,crop=${innerW}:${innerH},format=yuv420p[fg];[1:v][fg]overlay=x='${padX}+(${xExpr})':y='${padY}+(${yExpr})'[animFrame]`;
	} else if (effectiveAnim === 'slide-side') {
		const isFromLeft = textSide === 'right'; // If text is right, character is left
		const xEntrance = isFromLeft ? `-${innerW}*(1-sin(t/0.55*1.5708))` : `${innerW}*(1-sin(t/0.55*1.5708))`;
		const xExpr = `if(lt(t,0.55), ${xEntrance}, ${xIdle})`;
		const yExpr = `if(lt(t,0.55), 0, ${yIdle})`;
		animFilter = `[0:v]scale=${padW}:${padH}:force_original_aspect_ratio=increase,crop=${innerW}:${innerH},format=yuv420p[fg];[1:v][fg]overlay=x='${padX}+(${xExpr})':y='${padY}+(${yExpr})'[animFrame]`;
	} else if (effectiveAnim === 'zoom-in') {
		const xShakeZ = idleMotion === 'shake' ? '+4*sin(it*4.2)' : idleMotion === 'breathe' ? '+5*sin(it*1.6)' : '';
		const yShakeZ = idleMotion === 'shake' ? '+4*cos(it*3.5)' : idleMotion === 'breathe' ? '+4*cos(it*1.2)' : '';
		animFilter = `[0:v]scale=${Math.round(innerW * 1.15)}:${Math.round(innerH * 1.15)},zoompan=z='min(zoom+0.0006,1.08)':x='iw/2-(iw/zoom/2)${xShakeZ}':y='ih/2-(ih/zoom/2)${yShakeZ}':d=1:s=${innerW}x${innerH}:fps=30,format=yuv420p[fg];[1:v][fg]overlay=x='${padX}':y='${padY}'[animFrame]`;
	} else if (effectiveAnim === 'pop') {
		const xShakeP = idleMotion === 'shake' ? '+4*sin(it*4.2)' : '';
		const yShakeP = idleMotion === 'shake' ? '+4*cos(it*3.5)' : '';
		animFilter = `[0:v]scale=${Math.round(innerW * 1.16)}:${Math.round(innerH * 1.16)},zoompan=z='if(lt(it,0.45), 0.84+0.16*sin(it/0.45*1.5708), min(1.0+(it-0.45)*0.002, 1.03))':x='iw/2-(iw/zoom/2)${xShakeP}':y='ih/2-(ih/zoom/2)${yShakeP}':d=1:s=${innerW}x${innerH}:fps=30,format=yuv420p[fg];[1:v][fg]overlay=x='${padX}':y='${padY}'[animFrame]`;
	} else if (effectiveAnim === 'fade') {
		animFilter = `[0:v]scale=${padW}:${padH}:force_original_aspect_ratio=increase,crop=${innerW}:${innerH},fade=t=in:st=0:d=0.5,format=yuv420p[fg];[1:v][fg]overlay=x='${padX}+(${xIdle})':y='${padY}+(${yIdle})'[animFrame]`;
	} else {
		animFilter = `[0:v]scale=${innerW}:${innerH}:force_original_aspect_ratio=increase,crop=${innerW}:${innerH},format=yuv420p[fg];[1:v][fg]overlay=x='${padX}':y='${padY}'[animFrame]`;
	}

	let fullFilter = '';
	const ffmpegInputs = [
		'-loop', '1', '-i', imgPath,
		'-f', 'lavfi', '-i', `color=c=white:size=${W}x${H}:rate=30`
	];

	if (isPaper) {
		if (themeBgFile) {
			ffmpegInputs.push('-loop', '1', '-i', themeBgFile);
			fullFilter = `${animFilter};[animFrame]format=gbrp[animGbrp];[2:v]scale=${W}:${H},format=gbrp[bgGbrp];[bgGbrp][animGbrp]blend=all_mode=multiply,fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25:color=${fadeColor},format=yuv420p[v]`;
		} else if (themeBgInput) {
			ffmpegInputs.push('-f', 'lavfi', '-i', themeBgInput);
			fullFilter = `${animFilter};[animFrame]format=gbrp[animGbrp];[2:v]format=gbrp[bgGbrp];[bgGbrp][animGbrp]blend=all_mode=multiply,fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25:color=${fadeColor},format=yuv420p[v]`;
		}
	} else if (isChalkboard && themeBgInput) {
		ffmpegInputs.push('-f', 'lavfi', '-i', themeBgInput);
		fullFilter = `${animFilter};[animFrame]negate,format=gbrp[animGbrp];[2:v]format=gbrp[bgGbrp];[bgGbrp][animGbrp]blend=all_mode=screen,fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25:color=0x121212,format=yuv420p[v]`;
	} else {
		fullFilter = `${animFilter},fade=t=out:st=${Math.max(0.1, dur - 0.25)}:d=0.25:color=white,format=yuv420p[v]`;
	}

	await runFFmpeg([
		...ffmpegInputs,
		'-filter_complex', fullFilter,
		'-map', '[v]', '-t', String(dur + 0.3), ...clipCodec, '-y', vDest
	], 240000);
}

async function applyDoodleOverlay(vClipPath, dur, W, H, doodleType, textSide, sc = {}, tmpDir, videoPadding = 4) {
	if (!doodleType || doodleType === 'none') return;
	let doodleName = doodleType;
	if (doodleType === 'speech-bubble' || doodleType === 'thought-bubble' || doodleType === 'arrow-curved') {
		doodleName = `${doodleType}-${textSide}`;
	}
	const doodleFile = path.resolve(`./static/stickman/doodles/${doodleName}.png`);
	if (!fs.existsSync(doodleFile)) return;

	const padPct = Math.min(15, Math.max(0, Number(videoPadding ?? 4))) / 100;
	const padX = Math.round(W * padPct);
	const padY = Math.round(H * padPct);
	const innerW = W - 2 * padX;
	const innerH = H - 2 * padY;

	const scaleF = innerW / 1920;
	const scScale = Number(sc.textScale ?? 1);
	const offX = Number(sc.textOffsetX || 0);
	const offY = Number(sc.textOffsetY || 0);
	const alignMode = (sc.textAlign || '').toLowerCase();

	const kpRaw = (sc.keyPoint || sc.narration || '').replace(/\{/g, '(').replace(/\}/g, ')').slice(0, 140);
	const lines = kpRaw.split('\n').map(l => l.trim()).filter(Boolean);
	const lineCount = Math.max(1, lines.length);
	const maxLineLen = Math.max(4, ...lines.map(l => l.length));
	const baseFontSize = Number(sc.fontSize || 60);
	const dispSize = getDisplayFontSize(kpRaw, baseFontSize);
	const assFontSize = Math.round(dispSize * (H / 430) * 1.25 * scScale);

	const textEstW = maxLineLen * (assFontSize * 0.34);
	const textEstH = lineCount * (assFontSize * 1.15);

	let dW = Math.round(760 * scScale * scaleF);
	let dH = Math.round(420 * scScale * scaleF);
	let dX = 0;
	let dY = 0;

	if (doodleType === 'speech-bubble') {
		dW = Math.round(Math.max(400 * scaleF, textEstW + 140 * scaleF));
		dH = Math.round(Math.max(300 * scaleF, textEstH + 120 * scaleF));
		if (alignMode === 'middle') {
			dX = Math.round((padX + innerW * 0.50 + (offX / 100) * innerW) - dW / 2);
			dY = Math.round((padY + innerH * (0.50 + offY / 100)) - dH * 0.40);
		} else if (textSide === 'left') {
			dX = Math.round(padX + innerW * (0.04 + offX / 100));
			dY = Math.round((padY + innerH * (0.50 + offY / 100)) - dH * 0.40);
		} else {
			dX = Math.round(padX + innerW * (0.96 + offX / 100) - dW);
			dY = Math.round((padY + innerH * (0.50 + offY / 100)) - dH * 0.40);
		}
	} else if (doodleType === 'thought-bubble') {
		dW = Math.round(Math.max(420 * scaleF, textEstW + 150 * scaleF));
		dH = Math.round(Math.max(320 * scaleF, textEstH + 130 * scaleF));
		if (alignMode === 'middle') {
			dX = Math.round((padX + innerW * 0.50 + (offX / 100) * innerW) - dW / 2);
			dY = Math.round((padY + innerH * (0.50 + offY / 100)) - dH * 0.42);
		} else if (textSide === 'left') {
			dX = Math.round(padX + innerW * (0.04 + offX / 100));
			dY = Math.round((padY + innerH * (0.50 + offY / 100)) - dH * 0.42);
		} else {
			dX = Math.round(padX + innerW * (0.96 + offX / 100) - dW);
			dY = Math.round((padY + innerH * (0.50 + offY / 100)) - dH * 0.42);
		}
	} else if (doodleType === 'circle-highlight') {
		dW = Math.round(Math.max(460 * scaleF, textEstW + 140 * scaleF));
		dH = Math.round(Math.max(260 * scaleF, textEstH + 90 * scaleF));
		if (alignMode === 'middle') {
			dX = Math.round((padX + innerW * 0.50 + (offX / 100) * innerW) - dW / 2);
			dY = Math.round(padY + innerH * (0.50 + offY / 100) - dH * 0.50);
		} else if (textSide === 'left') {
			dX = Math.round(padX + innerW * (0.04 + offX / 100));
			dY = Math.round(padY + innerH * (0.50 + offY / 100) - dH * 0.50);
		} else {
			dX = Math.round(padX + innerW * (0.96 + offX / 100) - dW);
			dY = Math.round(padY + innerH * (0.50 + offY / 100) - dH * 0.50);
		}
	} else if (doodleType === 'arrow-curved') {
		dW = Math.round(440 * scScale * scaleF);
		dH = Math.round(180 * scScale * scaleF);
		if (textSide === 'left') {
			dX = Math.round(padX + innerW * (0.34 + offX / 100));
			dY = Math.round(padY + innerH * (0.50 + offY / 100) - dH * 0.40);
		} else {
			dX = Math.round(padX + innerW * (0.38 + offX / 100));
			dY = Math.round(padY + innerH * (0.50 + offY / 100) - dH * 0.40);
		}
	} else if (doodleType === 'idea-bulb') {
		dW = Math.round(200 * scScale * scaleF);
		dH = Math.round(220 * scScale * scaleF);
		if (textSide === 'left') {
			dX = Math.round(padX + innerW * 0.70);
			dY = Math.round(padY + innerH * 0.12);
		} else {
			dX = Math.round(padX + innerW * 0.18);
			dY = Math.round(padY + innerH * 0.12);
		}
	} else if (doodleType === 'question-mark') {
		dW = Math.round(200 * scScale * scaleF);
		dH = Math.round(180 * scScale * scaleF);
		if (textSide === 'left') {
			dX = Math.round(padX + innerW * 0.72);
			dY = Math.round(padY + innerH * 0.14);
		} else {
			dX = Math.round(padX + innerW * 0.16);
			dY = Math.round(padY + innerH * 0.14);
		}
	}

	const vOverlaid = path.join(tmpDir, `doodle-overlay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.mp4`);
	const overlayFilter = `[1:v]scale=${dW}:${dH},fade=t=in:st=0.50:d=0.20:alpha=1,fade=t=out:st=${Math.max(0.6, dur - 0.25)}:d=0.25:alpha=1[doodle];[0:v][doodle]overlay=x=${dX}:y=${dY}[v]`;
	try {
		await runFFmpeg([
			'-i', vClipPath,
			'-loop', '1', '-i', doodleFile,
			'-filter_complex', overlayFilter,
			'-map', '[v]',
			'-t', String(dur + 0.3),
			'-c:v', 'libx264', '-preset', 'ultrafast',
			'-pix_fmt', 'yuv420p',
			'-y', vOverlaid
		], 240000);
		if (fs.existsSync(vOverlaid)) {
			await fs.promises.rename(vOverlaid, vClipPath);
		}
	} catch (e) {
		console.warn(`Doodle overlay warning for scene:`, e.message);
	}
}

export async function POST({ request }) {
	const rid = `stickman-${Date.now()}`;
	const tmp = path.resolve(`./static/renders/temp-${rid}`);
	let outName = `stickman-${rid}.mp4`;
	let outPath = path.resolve(`./static/renders/${outName}`);
	const enc = new TextEncoder(); let ctrl=null;
	const send = (d)=>{ if(ctrl) ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`)); };
	const stream = new ReadableStream({ start(c){ ctrl=c; } });
	(async()=>{
		try{
			const { scenes, renderQuality='1080p', bgmUrl=null, bgmVolume=0.06, videoTitle='', stickmanTextColor='#111827', stickmanTextColorTop='#DC2626', stickmanTextColorBottom='#111827', stickmanFontSize=60, stickmanFontFamily="'Shadows Into Light',cursive", stickmanAnim='pop', stickmanTextAlign='left', stickmanImageAnim='dynamic', stickmanIdleMotion='shake', stickmanTextIdleMotion='shake', stickmanDoodle='speech-bubble', stickmanSfx='pop', previewCanvasHeight=430, videoPadding=4, canvasTheme='white' } = await request.json();
			if(!scenes?.length){ send({error:'No scenes'}); ctrl?.close(); return; }
			const slug = String(videoTitle||'stickman-video').replace(/[^a-zA-Z0-9 _-]+/g,'').replace(/\s+/g,'-').slice(0,60).toLowerCase() || `stickman-${rid}`;
			outName = `${slug}--${Date.now()}.mp4`; outPath = path.resolve(`./static/renders/${outName}`);
			const is720 = renderQuality==='720p'; const W=is720?1280:1920; const H=is720?720:1080;
			let hasVT=false; try{ const {execFile}=await import('child_process'); const {promisify}=await import('util'); const ef=promisify(execFile); const {stdout}=await ef(ffmpegPath||'ffmpeg',['-encoders']); hasVT=stdout.includes('h264_videotoolbox'); }catch{}
			send({progress:5, step:`Init ${hasVT?'M1':'CPU'} ${is720?'720p':'1080p'} — stickman chalk`});
			await fs.promises.mkdir(tmp,{recursive:true}); await fs.promises.mkdir(path.resolve('./static/renders'),{recursive:true});
			const normCodec = hasVT ? ['-c:v','h264_videotoolbox','-b:v',is720?'3500k':'6000k','-realtime','1'] : ['-c:v','libx264','-preset','ultrafast'];
			const finalCodec = hasVT ? ['-c:v','h264_videotoolbox','-b:v',is720?'4500k':'8000k','-realtime','0'] : ['-c:v','libx264','-preset','fast','-crf','22'];
			let prepped=0;
			await asyncPool(2, scenes.map((s,i)=>({s,i})), async({s,i})=>{
				const vDest=path.join(tmp,`video-${i}.mp4`);
				const aDest=path.join(tmp,`audio-${i}.mp3`);
				const SCENE_BREATH_PAUSE = 0.20;
				const dur = Number((Number(s.audioDuration || s.estimatedDuration || 5) + SCENE_BREATH_PAUSE).toFixed(2));
				let aOk=false;
				if(s.voiceAudioUrl?.startsWith('data:audio')){
					try{ const b64=s.voiceAudioUrl.replace(/^data:audio\/[^;]+;base64,/,''); await fs.promises.writeFile(aDest, Buffer.from(b64,'base64')); aOk=true; }catch{}
				} else if (s.voiceAudioUrl?.startsWith('/renders/') || s.voiceAudioUrl?.startsWith('/')) {
					const localPath = path.resolve('./static' + s.voiceAudioUrl);
					if (fs.existsSync(localPath)) {
						try { await fs.promises.copyFile(localPath, aDest); aOk = true; } catch {}
					}
				} else if (s.voiceAudioUrl && fs.existsSync(s.voiceAudioUrl)) {
					try { await fs.promises.copyFile(s.voiceAudioUrl, aDest); aOk = true; } catch {}
				}
				if(!aOk) await makeSilent(aDest, dur);

				const rawImg = s.image || s.imageUrl || '';
				let imgPath='';
				if(rawImg.startsWith('/stickman/')) imgPath=path.resolve('./static'+rawImg);
				else if(rawImg.startsWith('/')) imgPath=path.resolve('./static'+rawImg);
				const effectiveImageAnim = s.imageAnim || stickmanImageAnim || 'dynamic';
				const effectiveIdleMotion = s.idleMotion || stickmanIdleMotion || 'shake';
				const side = (s.textSide || s.layoutSide || (i % 2 === 0 ? 'left' : 'right')).toLowerCase();
				await renderImageClip(imgPath, vDest, dur, W, H, effectiveImageAnim, i, side, effectiveIdleMotion, videoPadding, canvasTheme);

				prepped++; send({progress: Math.round(10+prepped/scenes.length*35), step:`Gambar adegan ${prepped}/${scenes.length}`});
			});
			send({progress:48, step:'Normalisasi...'});
			const clips=new Array(scenes.length);
			await asyncPool(2, scenes.map((s,i)=>({s,i})), async({s,i})=>{
				const vDest=path.join(tmp,`video-${i}.mp4`);
				const aDest=path.join(tmp,`audio-${i}.mp3`);
				const out=path.join(tmp,`scene-${i}-norm.mp4`);
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
				clips[i]=out;
			});
			send({progress:75, step:'Join...'});
			const list=path.join(tmp,'concat.txt');
			await fs.promises.writeFile(list, clips.map(p=>`file '${p}'`).join('\n'));
			const combined=path.join(tmp,'combined.mp4');
			await runFFmpeg(['-f','concat','-safe','0','-i',list,'-c','copy','-y',combined], 300000);
			send({progress:80, step:'Text ASS...'});
			const ass=buildSplitASS(scenes, W, H, { textColor: stickmanTextColor, textColorTop: stickmanTextColorTop, textColorBottom: stickmanTextColorBottom, fontSize: stickmanFontSize, fontFamily: stickmanFontFamily, defaultAnim: stickmanAnim, defaultAlign: stickmanTextAlign, defaultTextIdle: stickmanTextIdleMotion, previewCanvasHeight, videoPadding, canvasTheme });
			const assPath=path.join(tmp,'split.ass');
			await fs.promises.writeFile(assPath, ass);
			const safeAss = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
			const fontsDir = path.resolve('./static/fonts');
			const safeFontsDir = fontsDir.replace(/\\/g, '/').replace(/:/g, '\\:');
			const subFilter = `subtitles='${safeAss}':fontsdir='${safeFontsDir}'`;
			send({progress:86, step:'Final encode...'});
			const fArgs=['-i',combined];
			if(bgmUrl){
				let bgmPath=null; if(bgmUrl.startsWith('/')){ const p=path.resolve('./static'+bgmUrl); if(fs.existsSync(p)) bgmPath=p; }
				if(!bgmPath) bgmPath=path.resolve('./static/bgm/bgm-soundhelix-1.mp3');
				if(bgmPath && fs.existsSync(bgmPath)){
					const vol = Math.min(0.25, Math.max(0.01, Number(bgmVolume || 0.08)));
					fArgs.push('-stream_loop','-1','-i',bgmPath);
					fArgs.push('-filter_complex',`[0:v]${subFilter}[v];[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];[1:a]volume=${vol},aformat=sample_rates=44100:channel_layouts=stereo[bgm];[a0][bgm]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[a]`,'-map','[v]','-map','[a]');
				} else fArgs.push('-filter_complex',`[0:v]${subFilter}[v];[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a]`,'-map','[v]','-map','[a]');
			} else fArgs.push('-filter_complex',`[0:v]${subFilter}[v];[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a]`,'-map','[v]','-map','[a]');
			fArgs.push(...finalCodec,'-c:a','aac','-b:a','192k','-ar','44100','-ac','2','-movflags','+faststart','-y',outPath);
			await runFFmpeg(fArgs, 1200000);
			fs.rm(tmp,{recursive:true,force:true},()=>{});
			send({progress:100, step:'Selesai', done:true, downloadUrl:`/renders/${outName}`, filename:outName});
		}catch(e){ console.error(e); send({error:e.message}); } finally{ ctrl?.close(); }
	})();
	return new Response(stream,{ headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'}});
}
