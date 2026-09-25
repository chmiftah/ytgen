import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Authentic Dan Koe Mental Model Diagrams: High contrast, crisp white (#FFFFFF), stoic amber (#F59E0B), bold labels
const diagrams = [
	{
		name: 'diagram-loop',
		width: 700,
		height: 440,
		svg: `
<svg width="700" height="440" viewBox="0 0 700 440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Flywheel Ring -->
  <circle cx="350" cy="220" r="140" fill="none" stroke="#27272a" stroke-width="2" />
  <circle cx="350" cy="220" r="140" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-dasharray="220, 660" stroke-linecap="round" />
  
  <!-- Arrow heads on loop -->
  <polygon points="350,75 358,85 342,85" fill="#F59E0B" />
  
  <!-- 4 Nodes with Clean Labels -->
  <!-- Top Node: ACTION -->
  <circle cx="350" cy="80" r="8" fill="#F59E0B" filter="url(#glow-gold)" />
  <text x="350" y="52" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#F59E0B" text-anchor="middle" letter-spacing="3">01. ACTION</text>
  
  <!-- Right Node: FEEDBACK -->
  <circle cx="490" cy="220" r="7" fill="#FFFFFF" />
  <text x="508" y="225" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#E4E4E7" text-anchor="start" letter-spacing="2">02. FEEDBACK</text>

  <!-- Bottom Node: CORRECTION -->
  <circle cx="350" cy="360" r="7" fill="#FFFFFF" />
  <text x="350" y="392" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#E4E4E7" text-anchor="middle" letter-spacing="2">03. CORRECTION</text>

  <!-- Left Node: LEVERAGE -->
  <circle cx="210" cy="220" r="7" fill="#FFFFFF" />
  <text x="192" y="225" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#E4E4E7" text-anchor="end" letter-spacing="2">04. LEVERAGE</text>

  <!-- Center Core Title -->
  <text x="350" y="215" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="13" font-weight="700" fill="#71717A" text-anchor="middle" letter-spacing="4">THE MASTERY</text>
  <text x="350" y="235" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">FLYWHEEL</text>
</svg>`
	},
	{
		name: 'diagram-focus',
		width: 700,
		height: 440,
		svg: `
<svg width="700" height="440" viewBox="0 0 700 440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Concentric Focus Target -->
  <circle cx="350" cy="220" r="180" fill="none" stroke="#27272a" stroke-width="1.5" stroke-dasharray="6,6" />
  <circle cx="350" cy="220" r="120" fill="none" stroke="#3f3f46" stroke-width="2" />
  <circle cx="350" cy="220" r="65" fill="#F59E0B" fill-opacity="0.08" stroke="#F59E0B" stroke-width="3" />
  <circle cx="350" cy="220" r="14" fill="#F59E0B" filter="url(#amber-glow)" />

  <!-- Crosshair Guides -->
  <line x1="350" y1="20" x2="350" y2="420" stroke="#27272a" stroke-width="1.5" />
  <line x1="150" y1="220" x2="550" y2="220" stroke="#27272a" stroke-width="1.5" />

  <!-- Labels -->
  <text x="350" y="270" font-family="'Inter', sans-serif" font-size="14" font-weight="900" fill="#F59E0B" text-anchor="middle" letter-spacing="3">DEEP WORK (4 HOURS)</text>
  <text x="350" y="325" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#71717A" text-anchor="middle" letter-spacing="2">SHALLOW TASKS &amp; NOISE</text>
  <text x="350" y="385" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#52525B" text-anchor="middle" letter-spacing="2">ENDLESS DISTRACTIONS</text>
</svg>`
	},
	{
		name: 'diagram-matrix',
		width: 700,
		height: 440,
		svg: `
<svg width="700" height="440" viewBox="0 0 700 440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="gold-box" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Quadrant Axes -->
  <line x1="160" y1="220" x2="540" y2="220" stroke="#3f3f46" stroke-width="2.5" />
  <line x1="350" y1="40" x2="350" y2="400" stroke="#3f3f46" stroke-width="2.5" />

  <!-- Arrow tips -->
  <polygon points="545,220 535,214 535,226" fill="#3f3f46" />
  <polygon points="350,35 344,45 356,45" fill="#3f3f46" />

  <!-- Top-Right Winning Quadrant -->
  <rect x="365" y="55" width="160" height="150" rx="10" fill="#F59E0B" fill-opacity="0.08" stroke="#F59E0B" stroke-width="2.5" />
  <circle cx="445" cy="115" r="10" fill="#F59E0B" filter="url(#gold-box)" />
  <text x="445" y="145" font-family="'Inter', sans-serif" font-size="13" font-weight="900" fill="#F59E0B" text-anchor="middle" letter-spacing="2">HIGH LEVERAGE</text>
  <text x="445" y="165" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#E4E4E7" text-anchor="middle" letter-spacing="1">FREEDOM &amp; SCALE</text>

  <!-- Bottom-Left Trap Quadrant -->
  <rect x="175" y="235" width="160" height="150" rx="10" fill="#EF4444" fill-opacity="0.04" stroke="#27272a" stroke-width="1.5" stroke-dasharray="6,4" />
  <text x="255" y="310" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#71717A" text-anchor="middle" letter-spacing="1">THE RAT RACE</text>
  <text x="255" y="330" font-family="'Inter', sans-serif" font-size="10" font-weight="500" fill="#52525B" text-anchor="middle">LOW LEVERAGE · HIGH EFFORT</text>

  <!-- Axis Labels -->
  <text x="350" y="25" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#A1A1AA" text-anchor="middle" letter-spacing="2">LEVERAGE (+)</text>
  <text x="555" y="225" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#A1A1AA" text-anchor="start" letter-spacing="2">VALUE (+)</text>
</svg>`
	},
	{
		name: 'diagram-curve',
		width: 700,
		height: 440,
		svg: `
<svg width="700" height="440" viewBox="0 0 700 440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Axes -->
  <line x1="140" y1="360" x2="580" y2="360" stroke="#3f3f46" stroke-width="2.5" />
  <line x1="140" y1="360" x2="140" y2="70" stroke="#3f3f46" stroke-width="2.5" />

  <!-- Linear Disappointment Line -->
  <line x1="140" y1="360" x2="520" y2="240" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6,6" />
  <text x="530" y="245" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#71717A" text-anchor="start">Expected (Linear)</text>

  <!-- Exponential Curve -->
  <path d="M 140 360 C 320 355, 420 330, 520 90" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
  <circle cx="520" cy="90" r="10" fill="#F59E0B" filter="url(#emerald-glow)" />

  <text x="500" y="65" font-family="'Inter', sans-serif" font-size="13" font-weight="900" fill="#F59E0B" text-anchor="end" letter-spacing="2">COMPOUND INFLECTION</text>
  <text x="360" y="395" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#71717A" text-anchor="middle" letter-spacing="2">YEARS OF SILENT REPETITION &gt;&gt;</text>
</svg>`
	}
];

async function generateCleanAssets() {
	console.log('Generating authentic Dan Koe diagrams...');
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
			console.log(`✓ Generated ${d.name}.png (${d.width}x${d.height})`);
		} catch (e) {
			console.warn(`Chrome error for ${d.name}:`, e.message);
		}
	}
}

generateCleanAssets();
