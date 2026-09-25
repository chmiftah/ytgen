import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const TYPO_DIR = path.resolve('./static/typography');
const DIAGRAM_DIR = path.join(TYPO_DIR, 'diagrams');
const BG_DIR = path.join(TYPO_DIR, 'backgrounds');

[TYPO_DIR, DIAGRAM_DIR, BG_DIR].forEach(dir => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function runCmd(cmd, args) {
	return new Promise((resolve, reject) => {
		const proc = spawn(cmd, args);
		let stderr = '';
		proc.stderr.on('data', d => { stderr += d.toString(); });
		proc.on('close', code => {
			if (code === 0) resolve();
			else reject(new Error(`Command ${cmd} code ${code}: ${stderr.slice(-300)}`));
		});
		proc.on('error', reject);
	});
}

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

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Minimalist Dan Koe / Stoic Diagrams
const diagrams = [
	{
		name: 'diagram-loop',
		width: 600,
		height: 600,
		svg: `
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Minimalist Dan Koe Infinite Loop / Flywheel -->
  <defs>
    <linearGradient id="glow-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EF4444" />
    </linearGradient>
  </defs>
  <circle cx="300" cy="300" r="190" fill="none" stroke="#27272a" stroke-width="4" stroke-dasharray="8,8" />
  <circle cx="300" cy="300" r="190" fill="none" stroke="url(#glow-gold)" stroke-width="6" stroke-linecap="round" stroke-dasharray="320, 900" />
  <circle cx="300" cy="110" r="14" fill="#F59E0B" />
  <circle cx="490" cy="300" r="10" fill="#71717a" />
  <circle cx="300" cy="490" r="10" fill="#71717a" />
  <circle cx="110" cy="300" r="10" fill="#71717a" />
  <text x="300" y="306" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#a1a1aa" text-anchor="middle" letter-spacing="4">THE FEEDBACK LOOP</text>
</svg>`
	},
	{
		name: 'diagram-matrix',
		width: 600,
		height: 600,
		svg: `
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <!-- 4-Quadrant Mindset Matrix -->
  <line x1="80" y1="300" x2="520" y2="300" stroke="#3f3f46" stroke-width="3" stroke-linecap="round" />
  <line x1="300" y1="80" x2="300" y2="520" stroke="#3f3f46" stroke-width="3" stroke-linecap="round" />
  <!-- Target quadrant glowing highlight -->
  <rect x="315" y="95" width="190" height="190" rx="8" fill="#F59E0B" fill-opacity="0.08" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="12,6" />
  <circle cx="410" cy="190" r="12" fill="#F59E0B" />
  <text x="410" y="240" font-family="sans-serif" font-size="16" font-weight="900" fill="#F59E0B" text-anchor="middle" letter-spacing="2">SWEET SPOT</text>
  <text x="300" y="55" font-family="monospace" font-size="16" font-weight="bold" fill="#71717a" text-anchor="middle">LEVERAGE (+)</text>
  <text x="545" y="305" font-family="monospace" font-size="16" font-weight="bold" fill="#71717a">FOCUS (+)</text>
</svg>`
	},
	{
		name: 'diagram-focus',
		width: 600,
		height: 600,
		svg: `
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Concentric Focus Rings -->
  <circle cx="300" cy="300" r="220" fill="none" stroke="#27272a" stroke-width="2" />
  <circle cx="300" cy="300" r="160" fill="none" stroke="#3f3f46" stroke-width="3" stroke-dasharray="14,10" />
  <circle cx="300" cy="300" r="95" fill="none" stroke="#F59E0B" stroke-width="5" />
  <circle cx="300" cy="300" r="26" fill="#F59E0B" />
  <!-- Target crosshairs -->
  <line x1="300" y1="40" x2="300" y2="120" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
  <line x1="300" y1="480" x2="300" y2="560" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
  <line x1="40" y1="300" x2="120" y2="300" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
  <line x1="480" y1="300" x2="560" y2="300" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
</svg>`
	},
	{
		name: 'diagram-curve',
		width: 600,
		height: 600,
		svg: `
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Hockey Stick Exponential Growth Curve -->
  <line x1="70" y1="510" x2="530" y2="510" stroke="#3f3f46" stroke-width="3" stroke-linecap="round" />
  <line x1="70" y1="510" x2="70" y2="90" stroke="#3f3f46" stroke-width="3" stroke-linecap="round" />
  <!-- Curve -->
  <path d="M 80 500 Q 340 480 480 120" fill="none" stroke="#10B981" stroke-width="6" stroke-linecap="round" />
  <!-- Dot at inflection -->
  <circle cx="480" cy="120" r="14" fill="#10B981" />
  <text x="440" y="90" font-family="monospace" font-size="18" font-weight="900" fill="#10B981" text-anchor="end" letter-spacing="2">COMPOUND EFFECT</text>
  <text x="300" y="545" font-family="monospace" font-size="14" fill="#71717a" text-anchor="middle" letter-spacing="3">TIME (CONSISTENCY) &gt;&gt;</text>
</svg>`
	}
];

async function generateAssets() {
	console.log('Generating Motion Typography assets and backgrounds...');

	// 1. Render Diagram SVGs to PNG via Chrome
	for (const d of diagrams) {
		const svgFile = path.join(DIAGRAM_DIR, `${d.name}.svg`);
		const pngFile = path.join(DIAGRAM_DIR, `${d.name}.png`);
		fs.writeFileSync(svgFile, d.svg.trim());
		try {
			await runCmd(chromePath, [
				'--headless',
				'--disable-gpu',
				'--default-background-color=00000000',
				`--screenshot=${pngFile}`,
				`--window-size=${d.width},${d.height}`,
				svgFile
			]);
			console.log(`✓ Generated ${d.name}.png`);
		} catch (e) {
			console.warn(`Fallback for ${d.name}:`, e.message);
		}
	}

	// 2. Generate Matte Black & Ambient Gradient Textures via FFmpeg (1920x1080)
	const backgrounds = [
		{
			name: 'matte-black.png',
			desc: 'Dan Koe Deep Matte Black with subtle vignette',
			filter: "color=c=#09090b:size=1920x1080,noise=alls=6:allf=t+u,format=yuv420p,vignette=PI/3.5"
		},
		{
			name: 'charcoal-amber.png',
			desc: 'Dark charcoal with warm amber center glow',
			filter: "color=c=#100e0b:size=1920x1080,noise=alls=8:allf=t+u,format=yuv420p,vignette=PI/3.2"
		},
		{
			name: 'cyber-emerald.png',
			desc: 'Deep forest black with subtle emerald reflection',
			filter: "color=c=#07110c:size=1920x1080,noise=alls=7:allf=t+u,format=yuv420p,vignette=PI/3.4"
		},
		{
			name: 'dark-grid.png',
			desc: 'Minimalist tech grid background for mental models',
			filter: "color=c=#0a0a0f:size=1920x1080,drawgrid=w=80:h=80:t=1:c=#1f202e@0.35,vignette=PI/3.6"
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
			console.error(`Failed ${bg.name}:`, e.message);
		}
	}

	console.log('Motion Typography assets ready!');
}

generateAssets().catch(console.error);
