/**
 * THEME: PSYCHOLOGY & PSIKOLOGI (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themePsychology = {
	categoryName: 'psychology',
	categoryLabel: '👁 Psikologi & Perilaku',
	items: [
		{
			id: 'iceberg',
			name: 'Gunung Es Bawah Sadar',
			title: 'THE SUBCONSCIOUS ICEBERG',
			tag: '[ PIKIRAN BAWAH SADAR ]',
			regex: /(gunung es|iceberg|bawah sadar|subconscious|alam bawah sadar|freud iceberg|puncak kesadaran)/i,
			nodes: ['01. CONSCIOUS TIP (10%)', '02. WATERLINE HORIZON', '03. SUBCONSCIOUS MASS (90%)', '04. DEEP SHADOW DRIVE'],
			renderSVG: (acc, title, nodes) => `
  <!-- Waterline Surface Wave -->
  <line x1="100" y1="180" x2="600" y2="180" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8,6" />
  <text x="540" y="170" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#3b82f6">CONSCIOUS (10%)</text>
  <text x="540" y="200" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#71717A">SUBCONSCIOUS (90%)</text>

  <!-- Iceberg Tip (Above Waterline) -->
  <polygon points="350,110 325,180 375,180" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="140" r="3" fill="#FFFFFF" />

  <!-- Massive Submerged Iceberg Body (Below Waterline) -->
  <polygon points="325,180 200,310 500,310 375,180" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <line x1="280" y1="240" x2="420" y2="240" stroke="#52525B" stroke-width="1.5" stroke-dasharray="4,4" />
  <circle cx="350" cy="260" r="10" fill="${acc}" />

  <text x="350" y="65" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'maze',
			name: 'Labirin Overthinking',
			title: 'NAVIGATING COMPLEXITY',
			tag: '[ KELUAR DARI LABIRIN ]',
			regex: /(labirin|maze|overthinking|tersesat pikiran|terjebak pikiran|kebingungan mental)/i,
			nodes: ['01. OVERTHINKING', '02. DEAD ENDS', '03. AWARENESS SHIFT', '04. CLEAR EXIT'],
			renderSVG: (acc, title, nodes) => `
  <!-- Concentric Squared Maze Walls -->
  <rect x="220" y="80" width="260" height="260" fill="none" stroke="#FFFFFF" stroke-width="2.5" rx="4" />
  <rect x="255" y="115" width="190" height="190" fill="none" stroke="#52525B" stroke-width="2" />
  <rect x="290" y="150" width="120" height="120" fill="none" stroke="#FFFFFF" stroke-width="2" />
  <rect x="325" y="185" width="50" height="50" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Maze Openings -->
  <line x1="220" y1="150" x2="255" y2="150" stroke="#18181b" stroke-width="6" />
  <line x1="445" y1="210" x2="480" y2="210" stroke="#18181b" stroke-width="6" />

  <!-- Center Origin & Exit Arrow -->
  <circle cx="350" cy="210" r="5" fill="${acc}" />
  <path d="M 350 210 L 350 165 L 305 165 L 305 290 L 430 290 L 430 130 L 235 130 L 235 150 L 160 150" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />

  <text x="140" y="154" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="${acc}" text-anchor="end">EXIT →</text>
  <text x="350" y="380" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'mirror',
			name: 'Cermin Introspeksi Bayangan Diri',
			title: 'THE MIRROR OF SELF',
			tag: '[ INTROSPEKSI & REFLEKSI ]',
			regex: /(cermin|mirror|refleksi diri|introspeksi|berkaca|bayangan diri|shadow self|carl jung)/i,
			nodes: ['01. SURFACE EGO', '02. RAW REFLECTION', '03. INNER SHADOW', '04. AUTHENTIC TRUTH'],
			renderSVG: (acc, title, nodes) => `
  <!-- Stand Base -->
  <ellipse cx="350" cy="320" rx="90" ry="12" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <line x1="350" y1="280" x2="350" y2="320" stroke="#FFFFFF" stroke-width="3" />

  <!-- Mirror Frame Oval -->
  <ellipse cx="350" cy="190" rx="105" ry="125" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <ellipse cx="350" cy="190" rx="95" ry="115" fill="none" stroke="${acc}" stroke-width="1.2" stroke-dasharray="4,4" />

  <!-- Internal Authentic Diamond Core -->
  <polygon points="350,140 385,190 350,240 315,190" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="190" r="6" fill="#FFFFFF" />

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="365" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#A1A1AA" text-anchor="middle" letter-spacing="2">SEE THROUGH THE EGO // TRUTH</text>
`
		},
		{
			id: 'ego_dissolve',
			name: 'Peleburan Partikel Ego',
			title: 'EGO DISSOLUTION',
			tag: '[ PELEBURAN EGO ]',
			regex: /(peleburan ego|ego dissolve|melepas ego|ketiadaan diri|egoless|non-attachment)/i,
			nodes: ['01. RIGID PERSONA', '02. AWARENESS AWAKENING', '03. PARTICLE DISSOLUTION', '04. UNIVERSAL FLOW'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes particleDrift { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-20px); opacity: 1; } }
    .anim-drift { animation: particleDrift 3s ease-in-out infinite; }
  </style>

  <!-- Left Half: Solid Face Profile Silhouette -->
  <path d="M 330 110 C 270 110, 240 150, 240 200 C 240 250, 270 290, 330 290 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />

  <!-- Center Demarcation Axis -->
  <line x1="330" y1="90" x2="330" y2="310" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Right Half: Floating Dissolving Light Particles -->
  <g class="anim-drift">
    <circle cx="380" cy="130" r="5" fill="${acc}" />
    <circle cx="420" cy="150" r="4" fill="#FFFFFF" />
    <circle cx="450" cy="120" r="3" fill="${acc}" />
    <circle cx="390" cy="190" r="6" fill="#FFFFFF" />
    <circle cx="440" cy="205" r="4" fill="${acc}" />
    <circle cx="480" cy="190" r="3" fill="#FFFFFF" />
    <circle cx="380" cy="260" r="5" fill="${acc}" />
    <circle cx="430" cy="275" r="4" fill="#FFFFFF" />
    <circle cx="470" cy="250" r="3" fill="${acc}" />
  </g>

  <text x="350" y="65" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cognitive_dissonance',
			name: 'Disonansi Kognitif Pikiran',
			title: 'COGNITIVE DISSONANCE',
			tag: '[ DISONANSI KOGNITIF ]',
			regex: /(disonansi kognitif|cognitive dissonance|dua pikiran bertentangan|konflik batin|paradoks mental)/i,
			nodes: ['01. BELIEF A', '02. CLASHING REALITY', '03. MENTAL TENSION', '04. RATIONALIZATION'],
			renderSVG: (acc, title, nodes) => `
  <!-- Two Clashing Sine Wave Frequencies -->
  <path d="M 120 170 Q 230 110, 350 200" fill="none" stroke="#3b82f6" stroke-width="3.5" />
  <path d="M 120 230 Q 230 290, 350 200" fill="none" stroke="#ef4444" stroke-width="3.5" />

  <!-- Epicenter of Tension Collision (Burst Spikes) -->
  <circle cx="350" cy="200" r="18" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="350" cy="200" r="6" fill="#FFFFFF" />
  <line x1="350" y1="165" x2="350" y2="150" stroke="${acc}" stroke-width="2" />
  <line x1="350" y1="235" x2="350" y2="250" stroke="${acc}" stroke-width="2" />

  <!-- Outgoing Resolved Wave -->
  <path d="M 350 200 Q 450 140, 580 200" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="6,4" />

  <text x="200" y="120" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#3b82f6">BELIEF A</text>
  <text x="200" y="290" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#ef4444">CONTRADICTING ACTION</text>
  <text x="490" y="235" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#A1A1AA">RATIONALIZATION</text>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'dopamine_meter',
			name: 'Reseptor & Meteran Dopamin',
			title: 'THE DOPAMINE CIRCUIT',
			tag: '[ RESEPTOR DOPAMIN ]',
			regex: /(dopamin|dopamine loop|reseptor dopamin|kecanduan instan|dopamine detox|kesenangan semu)/i,
			nodes: ['01. CUE / TRIGGER', '02. SPIKE CRAVING', '03. TRANSIENT REWARD', '04. BASELINE CRASH'],
			renderSVG: (acc, title, nodes) => `
  <!-- Gauge Speedometer Arc -->
  <path d="M 230 250 A 130 130 0 1 1 470 250" fill="none" stroke="#3f3f46" stroke-width="18" stroke-linecap="round" />
  <path d="M 230 250 A 130 130 0 0 1 350 120" fill="none" stroke="#10b981" stroke-width="18" stroke-linecap="round" />
  <path d="M 350 120 A 130 130 0 0 1 470 250" fill="none" stroke="${acc}" stroke-width="18" stroke-linecap="round" />

  <!-- Needle Pointing to Overstimulated Peak -->
  <line x1="350" y1="250" x2="430" y2="155" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="350" cy="250" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="350" cy="250" r="5" fill="${acc}" />

  <text x="210" y="280" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#10b981">BASELINE</text>
  <text x="490" y="280" font-family="'Inter', sans-serif" font-size="10" font-weight="900" fill="${acc}">SPIKE</text>
  <text x="350" y="210" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">DOPAMINE</text>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'confirmation_tunnel',
			name: 'Terowongan Bias Konfirmasi',
			title: 'CONFIRMATION BIAS FILTER',
			tag: '[ BIAS KONFIRMASI ]',
			regex: /(bias konfirmasi|confirmation bias|gema opini|filter bubble|hanya percaya yang disukai)/i,
			nodes: ['01. OBJECTIVE REALITY', '02. SELECTIVE FILTER', '03. ECHOED BELIEF', '04. BLIND DELUSION'],
			renderSVG: (acc, title, nodes) => `
  <!-- Broad Incoming Multi-Color Facts (Left) -->
  <line x1="120" y1="130" x2="270" y2="180" stroke="#3b82f6" stroke-width="2" />
  <line x1="120" y1="170" x2="270" y2="190" stroke="#ef4444" stroke-width="2" />
  <line x1="120" y1="210" x2="270" y2="200" stroke="${acc}" stroke-width="3" />
  <line x1="120" y1="250" x2="270" y2="210" stroke="#10b981" stroke-width="2" />
  <text x="140" y="110" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#71717A">DIVERSE DATA</text>

  <!-- The Funnel / Tunnel Filter Box (Blocks 90% of Truth) -->
  <polygon points="270,160 410,180 410,220 270,240" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="340" y="204" font-family="'Inter', sans-serif" font-size="9" font-weight="900" fill="#FFFFFF" text-anchor="middle">FILTER</text>

  <!-- Only Pre-selected Biased Ray Emerges (Right) -->
  <line x1="410" y1="200" x2="580" y2="200" stroke="${acc}" stroke-width="4" stroke-linecap="round" />
  <circle cx="580" cy="200" r="6" fill="${acc}" />
  <text x="500" y="180" font-family="'Inter', sans-serif" font-size="10" font-weight="900" fill="${acc}">ECHO ONLY</text>

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'comfort_growth_zone',
			name: 'Zona Nyaman vs Zona Pertumbuhan',
			title: 'COMFORT VS GROWTH ZONE',
			tag: '[ ZONA NYAMAN ]',
			regex: /(zona nyaman|comfort zone|zona pertumbuhan|growth zone|keluar dari zona nyaman|zona panik)/i,
			nodes: ['01. COMFORT (STAGNATION)', '02. FEAR BARRIER', '03. LEARNING BOUNDARY', '04. GROWTH EXPANSION'],
			renderSVG: (acc, title, nodes) => `
  <!-- Outer Orbit: Growth Zone -->
  <circle cx="350" cy="200" r="125" fill="#18181b" stroke="${acc}" stroke-width="2.5" stroke-dasharray="6,4" />
  <text x="350" y="100" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">GROWTH ZONE</text>

  <!-- Middle Orbit: Fear / Learning Zone -->
  <circle cx="350" cy="200" r="80" fill="#18181b" stroke="#71717A" stroke-width="1.8" />
  <text x="350" y="140" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#A1A1AA" text-anchor="middle">LEARNING</text>

  <!-- Inner Safe Circle: Comfort Zone -->
  <circle cx="350" cy="200" r="40" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="350" y="204" font-family="'Inter', sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">COMFORT</text>

  <!-- Breakout Path Arrow -->
  <path d="M 350 200 Q 380 160, 465 110" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="4,4" />
  <polygon points="465,110 450,115 458,125" fill="${acc}" />

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'flow_channel',
			name: 'Kanal Keseimbangan Flow State',
			title: 'THE FLOW STATE CHANNEL',
			tag: '[ KANAL FLOW STATE ]',
			regex: /(flow state|csikszentmihalyi|antisedih|anxiety vs boredom|tantangan seimbang keahlian)/i,
			nodes: ['01. LOW SKILL (APATHY)', '02. HIGH CHALLENGE (ANXIETY)', '03. LOW CHALLENGE (BOREDOM)', '04. FLOW CHANNEL'],
			renderSVG: (acc, title, nodes) => `
  <!-- Axes: Challenge (Y) vs Skill (X) -->
  <line x1="160" y1="280" x2="540" y2="280" stroke="#FFFFFF" stroke-width="2" />
  <line x1="160" y1="280" x2="160" y2="100" stroke="#FFFFFF" stroke-width="2" />
  <text x="145" y="110" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="end">CHALLENGE</text>
  <text x="540" y="300" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">SKILL</text>

  <!-- Upper Anxiety Zone -->
  <text x="260" y="150" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#ef4444">ANXIETY</text>

  <!-- Lower Boredom Zone -->
  <text x="440" y="260" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#71717A">BOREDOM</text>

  <!-- The Golden Diagonal Flow Channel -->
  <polygon points="160,280 230,280 500,130 430,130" fill="${acc}" fill-opacity="0.15" stroke="${acc}" stroke-width="2" />
  <line x1="195" y1="280" x2="465" y2="130" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
  <text x="350" y="185" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="${acc}" text-anchor="middle">FLOW STATE</text>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'maslow_pyramid',
			name: 'Piramida Hierarki Maslow',
			title: 'HIERARCHY OF HUMAN NEEDS',
			tag: '[ PIRAMIDA MASLOW ]',
			regex: /(maslow|hierarki kebutuhan|kebutuhan manusia|aktualisasi diri|fisiologis dasar)/i,
			nodes: ['01. PHYSIOLOGICAL', '02. SAFETY & ORDER', '03. BELONGING', '04. SELF-ACTUALIZATION'],
			renderSVG: (acc, title, nodes) => `
  <!-- Base Tier 4 -->
  <polygon points="190,300 510,300 470,250 230,250" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
  <text x="350" y="280" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#71717A" text-anchor="middle">1. PHYSIOLOGICAL (FOOD/REST)</text>

  <!-- Tier 3 -->
  <polygon points="230,245 470,245 435,195 265,195" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <text x="350" y="225" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#A1A1AA" text-anchor="middle">2. SAFETY & STABILITY</text>

  <!-- Tier 2 -->
  <polygon points="265,190 435,190 400,140 300,140" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <text x="350" y="170" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">3. LOVE & BELONGING</text>

  <!-- Apex: Self-Actualization -->
  <polygon points="350,75 315,130 385,130" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="110" r="4" fill="${acc}" />
  <text x="350" y="100" font-family="'Inter', sans-serif" font-size="10" font-weight="900" fill="${acc}" text-anchor="middle">ACTUALIZATION</text>

  <text x="350" y="375" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
