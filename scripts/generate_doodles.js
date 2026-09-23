import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const DOODLES_DIR = path.resolve('./static/stickman/doodles');
if (!fs.existsSync(DOODLES_DIR)) {
	fs.mkdirSync(DOODLES_DIR, { recursive: true });
}

function runFFmpeg(args) {
	return new Promise((resolve, reject) => {
		const proc = spawn(ffmpegPath || 'ffmpeg', args);
		let stderr = '';
		proc.stderr.on('data', (d) => { stderr += d.toString(); });
		proc.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`FFmpeg code ${code}: ${stderr.slice(-400)}`));
		});
		proc.on('error', reject);
	});
}

// 1. Speech Bubble (Left text side -> tail pointing to Right where stickman is)
// Dimensions: 800x480
const svgSpeechBubbleToRight = `
<svg width="800" height="480" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Background fill with slight chalk texture -->
  <path d="M 60 70 
           Q 50 40 100 40 
           L 620 42 
           Q 670 45 670 90 
           L 668 280 
           Q 665 325 615 330 
           L 540 330 
           L 670 430 
           L 470 332 
           L 100 330 
           Q 50 325 50 270 
           Z" 
        fill="#ffffff" 
        stroke="#1e293b" 
        stroke-width="7" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        filter="url(#chalk-rough)" />

  <!-- Secondary sketchy overlapping pencil line for hand-drawn chalk look -->
  <path d="M 63 68 
           Q 53 43 102 42 
           L 618 40 
           Q 668 47 668 88 
           L 666 282 
           Q 663 323 613 328 
           L 538 328 
           L 666 426 
           L 472 330 
           L 98 328 
           Q 52 323 52 268 
           Z" 
        fill="none" 
        stroke="#334155" 
        stroke-width="3" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-dasharray="140, 6, 90, 4" 
        filter="url(#chalk-rough)" />
</svg>
`;

// 2. Speech Bubble (Right text side -> tail pointing to Left where stickman is)
const svgSpeechBubbleToLeft = `
<svg width="800" height="480" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-rough2" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Background fill with tail pointing left -->
  <path d="M 190 42 
           L 710 40 
           Q 760 40 760 90 
           L 758 275 
           Q 755 330 705 330 
           L 330 332 
           L 130 430 
           L 260 330 
           L 180 330 
           Q 130 325 130 270 
           L 132 90 
           Q 135 45 190 42 
           Z" 
        fill="#ffffff" 
        stroke="#1e293b" 
        stroke-width="7" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        filter="url(#chalk-rough2)" />

  <path d="M 188 44 
           L 708 42 
           Q 758 42 758 88 
           L 756 273 
           Q 753 328 703 328 
           L 328 330 
           L 134 426 
           L 258 328 
           L 182 328 
           Q 132 323 132 268 
           L 134 88 
           Q 137 47 188 44 
           Z" 
        fill="none" 
        stroke="#334155" 
        stroke-width="3" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-dasharray="130, 8, 80, 5" 
        filter="url(#chalk-rough2)" />
</svg>
`;

// 3. Thought Bubble (Left text side -> bubbles lead to Right)
const svgThoughtBubbleToRight = `
<svg width="800" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-rough3" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Main Cloud -->
  <path d="M 120 180 
           A 65 65 0 0 1 200 80 
           A 85 85 0 0 1 370 65 
           A 80 80 0 0 1 520 75 
           A 70 70 0 0 1 630 140 
           A 65 65 0 0 1 650 240 
           A 65 65 0 0 1 580 320 
           A 80 80 0 0 1 430 340 
           A 75 75 0 0 1 270 335 
           A 70 70 0 0 1 150 290 
           A 65 65 0 0 1 120 180 Z" 
        fill="#ffffff" 
        stroke="#1e293b" 
        stroke-width="6.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        filter="url(#chalk-rough3)" />
  <!-- Small trail circles -->
  <circle cx="610" cy="380" r="26" fill="#ffffff" stroke="#1e293b" stroke-width="5.5" filter="url(#chalk-rough3)" />
  <circle cx="665" cy="435" r="16" fill="#ffffff" stroke="#1e293b" stroke-width="5" filter="url(#chalk-rough3)" />
  <circle cx="705" cy="470" r="9" fill="#ffffff" stroke="#1e293b" stroke-width="4" filter="url(#chalk-rough3)" />
</svg>
`;

// 4. Thought Bubble (Right text side -> bubbles lead to Left)
const svgThoughtBubbleToLeft = `
<svg width="800" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-rough4" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Main Cloud -->
  <path d="M 230 180 
           A 65 65 0 0 1 310 80 
           A 85 85 0 0 1 480 65 
           A 80 80 0 0 1 630 75 
           A 70 70 0 0 1 740 140 
           A 65 65 0 0 1 760 240 
           A 65 65 0 0 1 690 320 
           A 80 80 0 0 1 540 340 
           A 75 75 0 0 1 380 335 
           A 70 70 0 0 1 260 290 
           A 65 65 0 0 1 230 180 Z" 
        fill="#ffffff" 
        stroke="#1e293b" 
        stroke-width="6.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        filter="url(#chalk-rough4)" />
  <!-- Small trail circles pointing down-left -->
  <circle cx="210" cy="380" r="26" fill="#ffffff" stroke="#1e293b" stroke-width="5.5" filter="url(#chalk-rough4)" />
  <circle cx="155" cy="435" r="16" fill="#ffffff" stroke="#1e293b" stroke-width="5" filter="url(#chalk-rough4)" />
  <circle cx="115" cy="470" r="9" fill="#ffffff" stroke="#1e293b" stroke-width="4" filter="url(#chalk-rough4)" />
</svg>
`;

// 5. Curved Chalk Arrow (Pointing Right towards text)
const svgArrowToRight = `
<svg width="500" height="300" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-arrow" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Curved shaft -->
  <path d="M 40 240 Q 180 80 430 140" fill="none" stroke="#dc2626" stroke-width="8" stroke-linecap="round" filter="url(#chalk-arrow)" />
  <path d="M 45 238 Q 183 82 425 138" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" filter="url(#chalk-arrow)" />
  <!-- Arrowhead -->
  <path d="M 370 95 L 445 142 L 385 195" fill="none" stroke="#dc2626" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" filter="url(#chalk-arrow)" />
  <path d="M 374 98 L 440 142 L 388 190" fill="none" stroke="#f87171" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#chalk-arrow)" />
</svg>
`;

// 6. Curved Chalk Arrow (Pointing Left towards text)
const svgArrowToLeft = `
<svg width="500" height="300" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-arrow2" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Curved shaft -->
  <path d="M 460 240 Q 320 80 70 140" fill="none" stroke="#dc2626" stroke-width="8" stroke-linecap="round" filter="url(#chalk-arrow2)" />
  <path d="M 455 238 Q 317 82 75 138" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" filter="url(#chalk-arrow2)" />
  <!-- Arrowhead -->
  <path d="M 130 95 L 55 142 L 115 195" fill="none" stroke="#dc2626" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" filter="url(#chalk-arrow2)" />
  <path d="M 126 98 L 60 142 L 112 190" fill="none" stroke="#f87171" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#chalk-arrow2)" />
</svg>
`;

// 7. Circle Highlight Doodle (Red chalk oval enclosing text)
const svgCircleHighlight = `
<svg width="800" height="420" viewBox="0 0 800 420" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-circle" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Chalk double-loop oval -->
  <path d="M 140 210 
           C 140 100, 300 45, 430 45 
           C 600 45, 740 90, 740 200 
           C 740 310, 580 375, 410 375 
           C 240 375, 90 320, 90 220 
           C 90 120, 260 65, 450 60
           C 620 55, 730 110, 730 190" 
        fill="none" 
        stroke="#dc2626" 
        stroke-width="7" 
        stroke-linecap="round" 
        filter="url(#chalk-circle)" />
  <path d="M 145 208 
           C 145 105, 303 48, 432 48 
           C 598 48, 736 92, 736 198 
           C 736 306, 578 371, 408 371 
           C 242 371, 95 318, 95 222 
           C 95 125, 263 68, 448 63" 
        fill="none" 
        stroke="#f87171" 
        stroke-width="3" 
        stroke-linecap="round" 
        stroke-dasharray="160, 10, 100, 8" 
        filter="url(#chalk-circle)" />
</svg>
`;

// 8. Idea Lightbulb (Glowing chalk yellow eureka moment)
const svgIdeaBulb = `
<svg width="400" height="450" viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-bulb" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Rays of light -->
  <line x1="200" y1="20" x2="200" y2="70" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" filter="url(#chalk-bulb)" />
  <line x1="100" y1="60" x2="135" y2="100" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" filter="url(#chalk-bulb)" />
  <line x1="300" y1="60" x2="265" y2="100" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" filter="url(#chalk-bulb)" />
  <line x1="50" y1="170" x2="105" y2="175" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" filter="url(#chalk-bulb)" />
  <line x1="350" y1="170" x2="295" y2="175" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" filter="url(#chalk-bulb)" />

  <!-- Bulb Body -->
  <path d="M 140 270 
           C 110 240, 95 195, 100 150 
           C 105 95, 150 55, 205 55 
           C 260 55, 305 95, 310 150 
           C 315 195, 300 240, 270 270 
           L 265 310 
           L 145 310 Z" 
        fill="#fef08a" 
        stroke="#1e293b" 
        stroke-width="7" 
        stroke-linejoin="round" 
        stroke-linecap="round" 
        filter="url(#chalk-bulb)" />

  <!-- Filament inside -->
  <path d="M 175 240 L 175 160 L 195 185 L 215 160 L 215 240" fill="none" stroke="#ea580c" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#chalk-bulb)" />

  <!-- Base screw cap -->
  <line x1="148" y1="330" x2="262" y2="330" stroke="#1e293b" stroke-width="6.5" stroke-linecap="round" filter="url(#chalk-bulb)" />
  <line x1="156" y1="355" x2="254" y2="355" stroke="#1e293b" stroke-width="6.5" stroke-linecap="round" filter="url(#chalk-bulb)" />
  <path d="M 175 375 Q 205 390 235 375" fill="none" stroke="#1e293b" stroke-width="6.5" stroke-linecap="round" filter="url(#chalk-bulb)" />
</svg>
`;

// 9. Question Marks & Exclamation (?!)
const svgQuestionMark = `
<svg width="450" height="450" viewBox="0 0 450 450" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chalk-q" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <!-- Question mark (Chalk Red) -->
  <path d="M 120 120 
           C 120 60, 230 50, 230 115 
           C 230 160, 185 180, 180 230 
           L 180 250" 
        fill="none" 
        stroke="#dc2626" 
        stroke-width="11" 
        stroke-linecap="round" 
        filter="url(#chalk-q)" />
  <circle cx="180" cy="305" r="7" fill="#dc2626" stroke="#dc2626" stroke-width="5" filter="url(#chalk-q)" />

  <!-- Exclamation mark (Charcoal black) -->
  <line x1="285" y1="75" x2="275" y2="245" stroke="#1e293b" stroke-width="11" stroke-linecap="round" filter="url(#chalk-q)" />
  <circle cx="272" cy="305" r="7" fill="#1e293b" stroke="#1e293b" stroke-width="5" filter="url(#chalk-q)" />

  <!-- Accent stress marks -->
  <line x1="85" y1="75" x2="60" y2="55" stroke="#dc2626" stroke-width="6" stroke-linecap="round" filter="url(#chalk-q)" />
  <line x1="330" y1="75" x2="355" y2="55" stroke="#1e293b" stroke-width="6" stroke-linecap="round" filter="url(#chalk-q)" />
</svg>
`;

const items = [
	{ name: 'speech-bubble-left', svg: svgSpeechBubbleToRight }, // Text is on left, tail points right
	{ name: 'speech-bubble-right', svg: svgSpeechBubbleToLeft }, // Text is on right, tail points left
	{ name: 'thought-bubble-left', svg: svgThoughtBubbleToRight },
	{ name: 'thought-bubble-right', svg: svgThoughtBubbleToLeft },
	{ name: 'arrow-curved-left', svg: svgArrowToLeft }, // Arrow points to left text
	{ name: 'arrow-curved-right', svg: svgArrowToRight }, // Arrow points to right text
	{ name: 'circle-highlight', svg: svgCircleHighlight },
	{ name: 'idea-bulb', svg: svgIdeaBulb },
	{ name: 'question-mark', svg: svgQuestionMark }
];

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function getBounds(pngPath) {
	return new Promise((resolve, reject) => {
		const p = spawn(ffmpegPath || 'ffmpeg', ['-i', pngPath, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);
		const chunks = [];
		p.stdout.on('data', d => chunks.push(d));
		p.on('close', code => {
			if (code !== 0) return reject(new Error('ffmpeg failed to read raw rgba'));
			const buf = Buffer.concat(chunks);
			// Read width and height from sips or ffprobe
			p.kill?.();
			resolve(buf);
		});
		p.on('error', reject);
	});
}

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

async function generateAll() {
	console.log('Generating Chalk Doodles via Headless Chrome...');
	for (const it of items) {
		const svgFile = path.join(DOODLES_DIR, `${it.name}.svg`);
		const pngFile = path.join(DOODLES_DIR, `${it.name}.png`);
		const rawPng = path.join(DOODLES_DIR, `raw-${it.name}.png`);
		fs.writeFileSync(svgFile, it.svg.trim());
		console.log(`Saved SVG: ${it.name}.svg`);

		// Render with transparent background
		await runCmd(chromePath, [
			'--headless',
			'--disable-gpu',
			'--default-background-color=00000000',
			`--screenshot=${rawPng}`,
			'--window-size=1000,700',
			svgFile
		]);

		// Read raw rgba to find bounding box
		const buf = await getBounds(rawPng);
		const W = 1000, H = 700;
		let minX = W, maxX = 0, minY = H, maxY = 0;
		for (let y = 0; y < H; y++) {
			for (let x = 0; x < W; x++) {
				const a = buf[(y * W + x) * 4 + 3];
				if (a > 12) {
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
				}
			}
		}

		if (maxX > minX && maxY > minY) {
			const pad = 12;
			const cropX = Math.max(0, minX - pad);
			const cropY = Math.max(0, minY - pad);
			const cropW = Math.min(W - cropX, (maxX - minX) + pad * 2);
			const cropH = Math.min(H - cropY, (maxY - minY) + pad * 2);
			console.log(`Cropping ${it.name}: ${cropW}x${cropH} at (${cropX}, ${cropY})`);
			await runFFmpeg([
				'-i', rawPng,
				'-vf', `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
				'-y', pngFile
			]);
		} else {
			fs.copyFileSync(rawPng, pngFile);
		}
		if (fs.existsSync(rawPng)) fs.unlinkSync(rawPng);
		console.log(`Ready PNG: ${it.name}.png (${fs.statSync(pngFile).size} bytes)`);
	}
	console.log('Successfully generated all doodle assets!');
}

generateAll();

