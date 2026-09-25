import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const DOCU_DIR = path.resolve('./static/docu');
const BG_DIR = path.join(DOCU_DIR, 'backgrounds');
const EL_DIR = path.join(DOCU_DIR, 'elements');

[DOCU_DIR, BG_DIR, EL_DIR].forEach(dir => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function runFFmpeg(args) {
	return new Promise((resolve, reject) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', d => { stderr += d.toString(); });
		proc.on('close', code => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg code ${code}: ${stderr.slice(-300)}`));
		});
		proc.on('error', reject);
	});
}

// 1. Generate SVGs for Elements
const elements = [
	{
		filename: 'stamp-classified.svg',
		pngName: 'stamp-classified.png',
		width: 500,
		height: 180,
		content: `
<svg width="500" height="180" viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="distress">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <g transform="rotate(-6 250 90)" filter="url(#distress)">
    <rect x="20" y="20" width="460" height="140" rx="12" fill="none" stroke="#DC2626" stroke-width="8" stroke-dasharray="16,4,8,4" />
    <rect x="30" y="30" width="440" height="120" rx="6" fill="#DC2626" fill-opacity="0.12" stroke="#DC2626" stroke-width="3" />
    <text x="250" y="108" font-family="'Impact', 'Arial Black', sans-serif" font-size="64" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="8">CLASSIFIED</text>
    <text x="250" y="138" font-family="monospace" font-size="16" font-weight="bold" fill="#B91C1C" text-anchor="middle" letter-spacing="4">RESTRICTED ACCESS ONLY</text>
  </g>
</svg>`
	},
	{
		filename: 'stamp-confidential.svg',
		pngName: 'stamp-confidential.png',
		width: 540,
		height: 180,
		content: `
<svg width="540" height="180" viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="distress-crimson">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
    </filter>
  </defs>
  <g transform="rotate(4 270 90)" filter="url(#distress-crimson)">
    <rect x="15" y="25" width="510" height="130" rx="10" fill="none" stroke="#991B1B" stroke-width="7" />
    <rect x="25" y="35" width="490" height="110" fill="#991B1B" fill-opacity="0.1" />
    <text x="270" y="105" font-family="'Impact', 'Arial Black', sans-serif" font-size="54" font-weight="bold" fill="#991B1B" text-anchor="middle" letter-spacing="6">CONFIDENTIAL</text>
    <text x="270" y="132" font-family="monospace" font-size="14" font-weight="bold" fill="#7F1D1D" text-anchor="middle" letter-spacing="3">DEPT OF ARCHIVES - LEVEL 4</text>
  </g>
</svg>`
	},
	{
		filename: 'stamp-top-secret.svg',
		pngName: 'stamp-top-secret.png',
		width: 520,
		height: 190,
		content: `
<svg width="520" height="190" viewBox="0 0 520 190" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="distress-secret">
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
    </filter>
  </defs>
  <g transform="rotate(-8 260 95)" filter="url(#distress-secret)">
    <rect x="20" y="20" width="480" height="150" rx="14" fill="none" stroke="#EF4444" stroke-width="8" stroke-dasharray="24,6,12,6" />
    <rect x="32" y="32" width="456" height="126" rx="8" fill="#EF4444" fill-opacity="0.14" stroke="#EF4444" stroke-width="2" />
    <text x="260" y="98" font-family="'Arial Black', sans-serif" font-size="52" font-weight="900" fill="#EF4444" text-anchor="middle" letter-spacing="6">TOP SECRET</text>
    <text x="260" y="138" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="#DC2626" text-anchor="middle" letter-spacing="4">EYES ONLY // DO NOT COPY</text>
  </g>
</svg>`
	},
	{
		filename: 'stamp-evidence.svg',
		pngName: 'stamp-evidence.png',
		width: 480,
		height: 180,
		content: `
<svg width="480" height="180" viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="distress-orange">
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
    </filter>
  </defs>
  <g transform="rotate(7 240 90)" filter="url(#distress-orange)">
    <rect x="20" y="20" width="440" height="140" fill="none" stroke="#EA580C" stroke-width="7" />
    <rect x="30" y="30" width="420" height="120" fill="#EA580C" fill-opacity="0.1" />
    <text x="240" y="95" font-family="'Impact', sans-serif" font-size="58" font-weight="900" fill="#EA580C" text-anchor="middle" letter-spacing="4">EVIDENCE</text>
    <text x="240" y="132" font-family="monospace" font-size="16" font-weight="bold" fill="#C2410C" text-anchor="middle" letter-spacing="3">CASE FILE EXHIBIT A</text>
  </g>
</svg>`
	},
	{
		filename: 'stamp-verified.svg',
		pngName: 'stamp-verified.png',
		width: 300,
		height: 300,
		content: `
<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="distress-circle">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" />
    </filter>
  </defs>
  <g transform="rotate(-12 150 150)" filter="url(#distress-circle)">
    <circle cx="150" cy="150" r="130" fill="none" stroke="#0D9488" stroke-width="7" stroke-dasharray="14,6" />
    <circle cx="150" cy="150" r="115" fill="#0D9488" fill-opacity="0.12" stroke="#0D9488" stroke-width="3" />
    <path id="curve-top" d="M 50 150 A 100 100 0 0 1 250 150" fill="none" />
    <text font-family="'Arial Black', sans-serif" font-size="20" font-weight="bold" fill="#0D9488" letter-spacing="3">
      <textPath href="#curve-top" startOffset="50%" text-anchor="middle">OFFICIAL RECORD</textPath>
    </text>
    <text x="150" y="162" font-family="'Impact', sans-serif" font-size="38" font-weight="900" fill="#0F766E" text-anchor="middle" letter-spacing="3">VERIFIED</text>
    <text x="150" y="195" font-family="monospace" font-size="14" font-weight="bold" fill="#115E59" text-anchor="middle" letter-spacing="2">ARCHIVE D-24</text>
  </g>
</svg>`
	},
	{
		filename: 'tape-strip.svg',
		pngName: 'tape-strip.png',
		width: 320,
		height: 90,
		content: `
<svg width="320" height="90" viewBox="0 0 320 90" xmlns="http://www.w3.org/2000/svg">
  <!-- Translucent aged scotch tape with serrated ripped edges -->
  <path d="M 8 18 
           L 18 12 L 28 16 L 38 10 L 48 14 L 305 12
           L 314 26 L 308 42 L 316 62 L 306 78
           L 295 76 L 280 80 L 265 74 L 18 78
           L 10 65 L 16 50 L 8 36 Z" 
        fill="#fef08a" 
        fill-opacity="0.65" 
        stroke="#eab308" 
        stroke-opacity="0.3" 
        stroke-width="1.5" />
  <rect x="25" y="24" width="270" height="42" fill="#ffffff" fill-opacity="0.15" />
</svg>`
	},
	{
		filename: 'paperclip.svg',
		pngName: 'paperclip.png',
		width: 140,
		height: 320,
		content: `
<svg width="140" height="320" viewBox="0 0 140 320" xmlns="http://www.w3.org/2000/svg">
  <!-- Metallic paperclip with realistic 3D shine and drop shadow -->
  <defs>
    <filter id="clip-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="4" dy="6" stdDeviation="4" flood-color="#000000" flood-opacity="0.45" />
    </filter>
    <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="35%" stop-color="#f8fafc" />
      <stop offset="65%" stop-color="#64748b" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
  </defs>
  <path d="M 50 280 
           L 50 65 
           A 35 35 0 0 1 120 65 
           L 120 230 
           A 25 25 0 0 1 70 230 
           L 70 95 
           A 15 15 0 0 1 100 95 
           L 100 215" 
        fill="none" 
        stroke="url(#metal-grad)" 
        stroke-width="12" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        filter="url(#clip-shadow)" />
</svg>`
	},
	{
		filename: 'pushpin.svg',
		pngName: 'pushpin.png',
		width: 160,
		height: 200,
		content: `
<svg width="160" height="200" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pin-head" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="45%" stop-color="#dc2626" />
      <stop offset="90%" stop-color="#7f1d1d" />
      <stop offset="100%" stop-color="#450a0a" />
    </radialGradient>
    <filter id="pin-shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="6" dy="10" stdDeviation="5" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>
  <!-- Needle tip shadow -->
  <path d="M 80 110 L 80 185" stroke="#1e293b" stroke-width="6" stroke-linecap="round" filter="url(#pin-shadow)" />
  <circle cx="80" cy="70" r="44" fill="url(#pin-head)" filter="url(#pin-shadow)" />
  <ellipse cx="68" cy="56" rx="14" ry="10" fill="#ffffff" fill-opacity="0.45" />
</svg>`
	},
	{
		filename: 'red-circle.svg',
		pngName: 'red-circle.png',
		width: 440,
		height: 320,
		content: `
<svg width="440" height="320" viewBox="0 0 440 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wax-pencil">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
    </filter>
  </defs>
  <!-- Hand-drawn investigation clue circle (double loop) -->
  <path d="M 90 150 
           C 85 80, 200 45, 330 65 
           C 410 80, 420 220, 310 270 
           C 180 310, 60 270, 75 160 
           C 90 60, 230 40, 360 70 
           C 425 100, 420 230, 280 265" 
        fill="none" 
        stroke="#DC2626" 
        stroke-width="6" 
        stroke-linecap="round" 
        stroke-dasharray="1400" 
        filter="url(#wax-pencil)" />
</svg>`
	},
	{
		filename: 'redacted-bar.svg',
		pngName: 'redacted-bar.png',
		width: 500,
		height: 70,
		content: `
<svg width="500" height="70" viewBox="0 0 500 70" xmlns="http://www.w3.org/2000/svg">
  <!-- Authentic FBI/CIA classified redaction marker bar -->
  <defs>
    <filter id="marker-rough">
      <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
    </filter>
  </defs>
  <rect x="8" y="10" width="484" height="50" rx="3" fill="#0f172a" filter="url(#marker-rough)" />
</svg>`
	}
];

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function runCmd(cmd, args) {
	return new Promise((resolve, reject) => {
		const proc = spawn(cmd, args);
		let stderr = '';
		proc.stderr.on('data', d => { stderr += d.toString(); });
		proc.on('close', code => {
			if (code === 0) resolve();
			else reject(new Error(`Command ${cmd} exited ${code}: ${stderr.slice(-300)}`));
		});
		proc.on('error', reject);
	});
}

// Write and render SVGs to PNG
async function buildAssets() {
	console.log('Generating Docu-Style elements and backgrounds...');
	for (const el of elements) {
		const svgPath = path.join(EL_DIR, el.filename);
		const pngPath = path.join(EL_DIR, el.pngName);
		fs.writeFileSync(svgPath, el.content.trim());
		try {
			await runCmd(chromePath, [
				'--headless',
				'--disable-gpu',
				'--default-background-color=00000000',
				`--screenshot=${pngPath}`,
				`--window-size=${el.width},${el.height}`,
				svgPath
			]);
			console.log(`✓ Generated ${el.pngName}`);
		} catch (e) {
			console.warn(`Could not render PNG for ${el.pngName}, keeping SVG:`, e.message);
		}
	}

	// 2. Generate Canvas/FFmpeg Background Textures (1920x1080)
	const backgrounds = [
		{
			name: 'vintage-desk.png',
			desc: 'Dark mahogany archive desk with moody vignette',
			filter: "color=c=#1c1613:size=1920x1080,noise=alls=12:allf=t+u,format=yuv420p,vignette=PI/3.6"
		},
		{
			name: 'kraft-paper.png',
			desc: 'Warm authentic aged kraft paper document texture',
			filter: "color=c=#d9c5ab:size=1920x1080,noise=alls=14:allf=t+u,format=yuv420p,vignette=PI/4.2"
		},
		{
			name: 'dark-slate.png',
			desc: 'Ultra sleek Vox/Johnny Harris dark archival slate',
			filter: "color=c=#0f1318:size=1920x1080,noise=alls=8:allf=t+u,format=yuv420p,vignette=PI/3.2"
		},
		{
			name: 'blueprint-grid.png',
			desc: 'Navy blueprint investigation grid background',
			filter: "color=c=#0a192f:size=1920x1080,drawgrid=w=60:h=60:t=1:c=#172a45@0.45,vignette=PI/3.8"
		}
	];

	for (const bg of backgrounds) {
		const outPath = path.join(BG_DIR, bg.name);
		try {
			await runFFmpeg([
				'-f', 'lavfi', '-i', bg.filter,
				'-vframes', '1',
				'-y', outPath
			]);
			console.log(`✓ Generated background: ${bg.name}`);
		} catch (e) {
			console.error(`Failed to generate ${bg.name}:`, e.message);
		}
	}

	console.log('All Docu-Style assets generated successfully!');
}

buildAssets().catch(console.error);
