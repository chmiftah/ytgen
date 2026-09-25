/**
 * THEME: MINDSET & PIKIRAN (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeMindset = {
	categoryName: 'mindset',
	categoryLabel: '🧠 Mindset & Pola Pikir',
	items: [
		{
			id: 'brain',
			name: 'Arsitektur Neural Otak',
			title: 'THE ARCHITECTURE OF MIND',
			tag: '[ NEURAL SYNAPSE & CLARITY ]',
			regex: /(otak|pikiran|mind|mental clarity|kognisi|arsitektur neural|sinaps saraf|kejernihan berpikir)/i,
			nodes: ['01. NEURAL PLASTICITY', '02. MENTAL CLARITY', '03. DEEP INTELLECT', '04. STOIC LOGIC'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes synapsePulse { 0%, 100% { r: 3px; opacity: 0.6; } 50% { r: 6px; opacity: 1; filter: drop-shadow(0 0 8px ${acc}); } }
    .anim-synapse { animation: synapsePulse 2.2s ease-in-out infinite; }
  </style>

  <!-- Brain Hemisphere Contours (Dual Lobes) -->
  <path d="M 340 120 C 310 110, 270 120, 250 145 C 230 170, 225 210, 240 240 C 255 270, 280 290, 310 295 C 330 300, 340 290, 340 270 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <path d="M 360 120 C 390 110, 430 120, 450 145 C 470 170, 475 210, 460 240 C 445 270, 420 290, 390 295 C 370 300, 360 290, 360 270 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Corpus Callosum Center Bridge -->
  <line x1="340" y1="190" x2="360" y2="190" stroke="${acc}" stroke-width="3" />
  <line x1="340" y1="230" x2="360" y2="230" stroke="${acc}" stroke-width="3" />

  <!-- Internal Neural Net Mesh -->
  <line x1="260" y1="170" x2="300" y2="190" stroke="#52525B" stroke-width="1.5" />
  <line x1="300" y1="190" x2="330" y2="150" stroke="#52525B" stroke-width="1.5" />
  <line x1="300" y1="190" x2="280" y2="250" stroke="#52525B" stroke-width="1.5" />
  <line x1="440" y1="170" x2="400" y2="190" stroke="#52525B" stroke-width="1.5" />
  <line x1="400" y1="190" x2="370" y2="150" stroke="#52525B" stroke-width="1.5" />
  <line x1="400" y1="190" x2="420" y2="250" stroke="#52525B" stroke-width="1.5" />

  <!-- Synapse Nodes (Pulsing) -->
  <circle cx="260" cy="170" r="4" class="anim-synapse" fill="${acc}" />
  <circle cx="300" cy="190" r="5" fill="#FFFFFF" />
  <circle cx="330" cy="150" r="4" class="anim-synapse" fill="${acc}" />
  <circle cx="280" cy="250" r="4" fill="#FFFFFF" />
  <circle cx="440" cy="170" r="4" class="anim-synapse" fill="${acc}" />
  <circle cx="400" cy="190" r="5" fill="#FFFFFF" />
  <circle cx="370" cy="150" r="4" class="anim-synapse" fill="${acc}" />
  <circle cx="420" cy="250" r="4" fill="#FFFFFF" />

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'polyhedron',
			name: 'Dan Koe Core Polyhedron',
			title: 'THE CORE ARCHITECTURE',
			tag: '[ DAN KOE CORE ]',
			regex: /(polyhedron|dan koe core|arsitektur prinsip|fondasi pemikiran|struktur realitas)/i,
			nodes: ['01. PHILOSOPHICAL BASE', '02. CREATIVE EXPRESSION', '03. PHYSICAL RIGOR', '04. PERPETUAL LEVERAGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes polyRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-poly { animation: polyRotate 30s linear infinite; transform-origin: 350px 200px; }
  </style>

  <!-- 3D Polyhedron Wireframe (Icosahedron Facets) -->
  <g class="anim-poly">
    <polygon points="350,110 435,160 405,255 295,255 265,160" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    <polygon points="350,140 400,180 380,240 320,240 300,180" fill="none" stroke="#52525B" stroke-width="1.8" />
    <line x1="350" y1="110" x2="350" y2="140" stroke="${acc}" stroke-width="2" />
    <line x1="435" y1="160" x2="400" y2="180" stroke="${acc}" stroke-width="2" />
    <line x1="405" y1="255" x2="380" y2="240" stroke="${acc}" stroke-width="2" />
    <line x1="295" y1="255" x2="320" y2="240" stroke="${acc}" stroke-width="2" />
    <line x1="265" y1="160" x2="300" y2="180" stroke="${acc}" stroke-width="2" />
  </g>

  <!-- Central Anchor Nucleus -->
  <circle cx="350" cy="200" r="7" fill="${acc}" />
  <circle cx="350" cy="200" r="14" fill="none" stroke="${acc}" stroke-width="1.5" stroke-dasharray="3,3" />

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="340" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="${acc}" text-anchor="middle" letter-spacing="2">SELF-EVOLVING MENTAL OPERATING SYSTEM</text>
`
		},
		{
			id: 'infinite',
			name: 'The Infinite Game',
			title: 'THE INFINITE GAME',
			tag: '[ PERMAINAN TANPA AKHIR ]',
			regex: /(infinite game|permainan tanpa akhir|keabadian|tiada garis finis|longevity hidup)/i,
			nodes: ['01. NO FINISH LINE', '02. ETERNAL LOOP', '03. RESILIENT ADAPTATION', '04. ENDURING LEGACY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes lemniscateGlow { 0%, 100% { filter: drop-shadow(0 0 6px ${acc}55); } 50% { filter: drop-shadow(0 0 22px ${acc}); } }
    .anim-infinity-path { animation: lemniscateGlow 3s ease-in-out infinite; }
  </style>

  <!-- Lemniscate Smooth Ribbon (Figure-8 ∞) -->
  <path d="M 350 200 C 270 120, 180 120, 180 200 C 180 280, 270 280, 350 200 C 430 120, 520 120, 520 200 C 520 280, 430 280, 350 200 Z" fill="none" stroke="${acc}" stroke-width="4" stroke-linecap="round" class="anim-infinity-path" />
  <path d="M 350 200 C 270 120, 180 120, 180 200 C 180 280, 270 280, 350 200 C 430 120, 520 120, 520 200 C 520 280, 430 280, 350 200 Z" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="8,8" />

  <!-- Intersection & Lobe Nuclei -->
  <circle cx="350" cy="200" r="5" fill="#FFFFFF" />
  <circle cx="230" cy="200" r="6" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <text x="230" y="204" font-family="'Inter', sans-serif" font-size="8" font-weight="900" fill="#71717A" text-anchor="middle">SURVIVE</text>
  <circle cx="470" cy="200" r="6" fill="#18181b" stroke="${acc}" stroke-width="2" />
  <text x="470" y="204" font-family="'Inter', sans-serif" font-size="8" font-weight="900" fill="${acc}" text-anchor="middle">THRIVE</text>

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="340" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">THERE IS NO FINISH LINE // PLAY TO KEEP PLAYING</text>
`
		},
		{
			id: 'cube_unfolding',
			name: 'Tesseract 4D & Higher Dimensions',
			title: 'HIGHER DIMENSION THINKING',
			tag: '[ MEMBUKA DIMENSI BERPIKIR ]',
			regex: /(tesseract|dimensi tinggi|kubus terbuka|unfolding|higher order thinking|berpikir 4d)/i,
			nodes: ['01. FLAT PERSPECTIVE', '02. 3D ISOMETRIC', '03. UNFOLDED FACETS', '04. TOTAL OVERVIEW'],
			renderSVG: (acc, title, nodes) => `
  <!-- Unfolded Net of a Cube (Cross Shape) -->
  <rect x="315" y="70" width="70" height="70" fill="#18181b" stroke="#52525B" stroke-width="1.8" />
  <rect x="240" y="145" width="70" height="70" fill="#18181b" stroke="#52525B" stroke-width="1.8" />
  <rect x="315" y="145" width="70" height="70" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="350" cy="180" r="6" fill="#FFFFFF" />
  <rect x="390" y="145" width="70" height="70" fill="#18181b" stroke="#52525B" stroke-width="1.8" />
  <rect x="315" y="220" width="70" height="70" fill="#18181b" stroke="#52525B" stroke-width="1.8" />
  <rect x="315" y="295" width="70" height="70" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="4,4" />

  <text x="140" y="185" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#71717A">2D FLAT</text>
  <text x="560" y="185" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="${acc}">4D TESSERACT →</text>
  <text x="350" y="45" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'prism',
			name: 'Prisma Refraksi Spektrum',
			title: 'SPECTRUM OF CLARITY',
			tag: '[ REFRAKSI & PENGURAIAN ]',
			regex: /(prisma|prism|refraksi ide|spektrum pemikiran|mengurai kompleksitas|uraikan masalah)/i,
			nodes: ['01. RAW INPUT', '02. REFRACTION', '03. CORE ESSENCE', '04. MULTI-PERSPECTIVE'],
			renderSVG: (acc, title, nodes) => `
  <!-- Incoming Pure White Beam -->
  <line x1="80" y1="210" x2="305" y2="210" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  <text x="180" y="195" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#A1A1AA" text-anchor="middle">WHITE LIGHT (INPUT)</text>

  <!-- Triangular Glass Prism -->
  <polygon points="350,110 270,280 430,280" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <polygon points="350,130 290,270 410,270" fill="none" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="3,3" />

  <!-- Refracted Dispersed Spectrum Beams -->
  <line x1="395" y1="210" x2="620" y2="130" stroke="#ef4444" stroke-width="2.5" />
  <line x1="395" y1="210" x2="620" y2="175" stroke="${acc}" stroke-width="3" />
  <line x1="395" y1="210" x2="620" y2="225" stroke="#10b981" stroke-width="2.5" />
  <line x1="395" y1="210" x2="620" y2="275" stroke="#3b82f6" stroke-width="2.5" />

  <text x="350" y="380" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'growth_mindset',
			name: 'Growth vs Fixed Mindset',
			title: 'THE EXPANSIVE MINDSET',
			tag: '[ GROWTH VS FIXED ]',
			regex: /(growth mindset|fixed mindset|pola pikir berkembang|membuka batasan diri|belajar dari kesalahan)/i,
			nodes: ['01. FIXED BOX', '02. CRACKING BARRIERS', '03. EMBRACE EFFORT', '04. BOUNDLESS EXPANSION'],
			renderSVG: (acc, title, nodes) => `
  <!-- Left: Fixed Mindset (Rigid Locked Cage) -->
  <rect x="150" y="140" width="120" height="120" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
  <circle cx="210" cy="200" r="16" fill="#18181b" stroke="#ef4444" stroke-width="2" />
  <text x="210" y="204" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#ef4444" text-anchor="middle">✕</text>
  <text x="210" y="290" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#71717A" text-anchor="middle">FIXED: "I CANNOT"</text>

  <!-- Dynamic Expansion Arrow -->
  <path d="M 290 200 L 390 200" stroke="${acc}" stroke-width="3" stroke-dasharray="6,4" />
  <polygon points="390,200 375,190 375,210" fill="${acc}" />

  <!-- Right: Growth Mindset (Expanding Unbounded Flower / Helix) -->
  <circle cx="490" cy="200" r="65" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="490" cy="200" r="45" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="4,4" />
  <circle cx="490" cy="200" r="25" fill="${acc}" />
  <text x="490" y="290" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">GROWTH: "NOT YET"</text>

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'stoic_control',
			name: 'Dikotomi Kendali Epictetus',
			title: 'CIRCLE OF CONTROL',
			tag: '[ DIKOTOMI KENDALI STOIK ]',
			regex: /(lingkaran kendali|circle of control|dikotomi kendali|epictetus|fokus pada kendali|hal yang tak bisa dikendalikan)/i,
			nodes: ['01. EXTERNAL CHAOS', '02. THE FILTER', '03. INTERNAL POWER', '04. UNSHAKABLE PEACE'],
			renderSVG: (acc, title, nodes) => `
  <!-- Outer Circle: Things You Cannot Control (Weather, Others' Opinions, Chaos) -->
  <circle cx="350" cy="200" r="125" fill="#18181b" stroke="#3f3f46" stroke-width="2" stroke-dasharray="6,6" />
  <text x="350" y="105" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#71717A" text-anchor="middle">CANNOT CONTROL // OTHERS, FATE, CHAOS</text>

  <!-- Inner Circle: Things You Can Control (Thoughts, Habits, Effort, Actions) -->
  <circle cx="350" cy="200" r="65" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="350" cy="200" r="8" fill="#FFFFFF" />
  <text x="350" y="195" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">CAN CONTROL</text>
  <text x="350" y="215" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#FFFFFF" text-anchor="middle">EFFORT & ATTITUDE</text>

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'first_principles',
			name: 'First Principles Thinking',
			title: 'FIRST PRINCIPLES DECONSTRUCTION',
			tag: '[ DEKONSTRUKSI ATOM ]',
			regex: /(first principles|dekonstruksi masalah|hukum fisika dasar|akar kebenaran|bongkar masalah)/i,
			nodes: ['01. COMPLEX ILLUSION', '02. DECONSTRUCTION', '03. FUNDAMENTAL TRUTH', '04. NOVEL SYNTHESIS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes orbitRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-orbit-1 { animation: orbitRotate 8s linear infinite; transform-origin: 350px 200px; }
    .anim-orbit-2 { animation: orbitRotate 12s linear infinite reverse; transform-origin: 350px 200px; }
  </style>

  <!-- Central Atomic Nucleus (Core Truth) -->
  <circle cx="350" cy="200" r="22" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="350" cy="200" r="8" fill="${acc}" />

  <!-- Quantum Tilted Orbital Ellipses -->
  <g class="anim-orbit-1">
    <ellipse cx="350" cy="200" rx="110" ry="38" fill="none" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="460" cy="200" r="5" fill="#FFFFFF" />
  </g>
  <g class="anim-orbit-2" style="transform: rotate(60deg); transform-origin: 350px 200px;">
    <ellipse cx="350" cy="200" rx="110" ry="38" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="6,4" />
    <circle cx="240" cy="200" r="5" fill="${acc}" />
  </g>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="355" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#A1A1AA" text-anchor="middle" letter-spacing="2">BREAK DOWN TO THE SMALLEST ATOM</text>
`
		},
		{
			id: 'mental_friction',
			name: 'Menghilangkan Friksi Mental',
			title: 'ZERO MENTAL FRICTION',
			tag: '[ ELIMINASI FRIKSI ]',
			regex: /(friksi mental|hambatan pikiran|mental friction|aliran mulus tanpa hambatan|keheningan batin)/i,
			nodes: ['01. FRICTION RESISTANCE', '02. MENTAL POLISHING', '03. FLUID MOMENTUM', '04. PURE FLOW'],
			renderSVG: (acc, title, nodes) => `
  <!-- Upper Jagged Rough Surface (Friction / Resistance) -->
  <path d="M 120 150 L 160 170 L 200 145 L 240 175 L 280 145 L 320 170 L 350 150" fill="none" stroke="#ef4444" stroke-width="2.5" />
  <text x="235" y="130" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#ef4444" text-anchor="middle">ROUGH FRICTION</text>

  <!-- Lower Smooth Hydrodynamic Mirror Surface (Zero Friction Flow) -->
  <line x1="350" y1="230" x2="580" y2="230" stroke="${acc}" stroke-width="4" stroke-linecap="round" />
  <circle cx="580" cy="230" r="5" fill="${acc}" />
  <text x="465" y="260" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">ZERO RESISTANCE // FLOW</text>

  <!-- Fluid Transition Wave in Center -->
  <path d="M 350 150 Q 380 190, 350 230" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="4,4" fill="none" />

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'paradigm_lens',
			name: 'Pergeseran Paradigma Kacamata',
			title: 'THE PARADIGM SHIFT',
			tag: '[ PERGESERAN PARADIGMA ]',
			regex: /(paradigma|paradigm shift|kacamata realitas|sudut pandang baru|mengubah cara pandang)/i,
			nodes: ['01. DEFAULT LENS', '02. BLIND SPOT DISCOVERY', '03. SHIFTING FOCUS', '04. NEW REALITY'],
			renderSVG: (acc, title, nodes) => `
  <!-- Left Spectacle Frame (Default Limited Lens) -->
  <circle cx="260" cy="200" r="55" fill="#18181b" stroke="#52525B" stroke-width="3" />
  <line x1="220" y1="200" x2="300" y2="200" stroke="#52525B" stroke-width="1.5" stroke-dasharray="3,3" />
  <text x="260" y="280" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#71717A" text-anchor="middle">OLD PARADIGM</text>

  <!-- Center Bridge Connector -->
  <path d="M 315 190 Q 350 170, 385 190" fill="none" stroke="#FFFFFF" stroke-width="3" />

  <!-- Right Spectacle Frame (Illuminated Luminous Lens) -->
  <circle cx="440" cy="200" r="55" fill="#18181b" stroke="${acc}" stroke-width="3.5" />
  <circle cx="440" cy="200" r="16" fill="${acc}" />
  <text x="440" y="280" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">NEW REALITY</text>

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
