/**
 * THEME: DARK PSYCHOLOGY & MANIPULASI (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeDarkPsychology = {
	categoryName: 'dark_psychology',
	categoryLabel: '🎭 Dark Psikologi & Manipulasi',
	items: [
		{
			id: 'puppet_master',
			name: 'Tali Marionet Pengendali',
			title: 'MARIONETTE STRINGS',
			tag: '[ MANIPULASI TALI KENDALI ]',
			regex: /(marionet|puppet master|boneka tali|dikendalikan orang lain|manipulasi halus|tali boneka)/i,
			nodes: ['01. UNSEEN STRINGS', '02. FAUX AUTONOMY', '03. MECHANICAL PULL', '04. SEVER THE TIE'],
			renderSVG: (acc, title, nodes) => `
  <!-- The Master Hand Controller Crossbar (Above) -->
  <line x1="280" y1="120" x2="420" y2="120" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <line x1="350" y1="90" x2="350" y2="150" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <circle cx="350" cy="120" r="5" fill="${acc}" />

  <!-- Dotted Marionette Strings Dropping Down -->
  <line x1="290" y1="120" x2="320" y2="220" stroke="#71717A" stroke-width="1.8" stroke-dasharray="4,4" />
  <line x1="410" y1="120" x2="380" y2="220" stroke="#71717A" stroke-width="1.8" stroke-dasharray="4,4" />
  <line x1="350" y1="150" x2="350" y2="185" stroke="${acc}" stroke-width="2" stroke-dasharray="3,3" />

  <!-- Puppet Figure (Center) -->
  <circle cx="350" cy="195" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <line x1="350" y1="205" x2="350" y2="250" stroke="#FFFFFF" stroke-width="2.5" />
  <!-- Puppet Arms -->
  <line x1="350" y1="215" x2="320" y2="220" stroke="#FFFFFF" stroke-width="2" />
  <line x1="350" y1="215" x2="380" y2="220" stroke="#FFFFFF" stroke-width="2" />
  <!-- Puppet Legs -->
  <line x1="350" y1="250" x2="330" y2="295" stroke="#FFFFFF" stroke-width="2" />
  <line x1="350" y1="250" x2="370" y2="295" stroke="#FFFFFF" stroke-width="2" />

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="345" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#ef4444" text-anchor="middle" letter-spacing="2">CUT THE UNSEEN STRINGS // SOVEREIGNTY</text>
`
		},
		{
			id: 'gaslight_lantern',
			name: 'Lentera Ilusi Gaslighting',
			title: 'THE GASLIGHT ILLUSION',
			tag: '[ MANIPULASI GASLIGHTING ]',
			regex: /(gaslighting|gaslight|memutarbalikkan kenyataan|meragukan diri sendiri|distorsi realitas)/i,
			nodes: ['01. OBJECTIVE FACT', '02. PERSPECTIVE SKEW', '03. SELF-DOUBT SEED', '04. PSYCHOLOGICAL BLINDNESS'],
			renderSVG: (acc, title, nodes) => `
  <!-- Hanging Distorted Lantern -->
  <line x1="350" y1="80" x2="350" y2="130" stroke="#FFFFFF" stroke-width="2" />
  <polygon points="320,130 380,130 395,220 305,220" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  
  <!-- Flickering Distorted Flame inside Lantern -->
  <path d="M 350 200 Q 330 180, 350 155 Q 365 175, 350 200 Z" fill="${acc}" />
  <circle cx="350" cy="180" r="4" fill="#FFFFFF" />

  <!-- Skewed Shadow Projections (Distorting Reality) -->
  <path d="M 305 220 L 220 300 M 395 220 L 480 300" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4" />
  <text x="210" y="315" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#ef4444">"DID THAT HAPPEN?"</text>
  <text x="490" y="315" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#ef4444">"YOU REMEMBER WRONG"</text>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'mask_deceit',
			name: 'Topeng Ganda Terbelah',
			title: 'THE TWO-FACED MASK',
			tag: '[ KEPALSUAN PERSONA ]',
			regex: /(topeng|dua wajah|kepalsuan|persona palsu|two-faced|teman palsu|kemunafikan)/i,
			nodes: ['01. CHARMING SMILE', '02. HIDDEN CALCULATION', '03. CRACKED PERSONA', '04. PREDATORY SHADOW'],
			renderSVG: (acc, title, nodes) => `
  <!-- Left Side: Smiling Polite Mask -->
  <path d="M 345 110 C 290 110, 260 160, 260 210 C 260 260, 290 290, 345 290 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="310" cy="180" r="5" fill="#FFFFFF" />
  <path d="M 300 230 Q 320 250, 340 235" fill="none" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Center Fracture Crack -->
  <path d="M 345 95 L 355 150 L 340 210 L 355 250 L 345 305" stroke="#ef4444" stroke-width="3" fill="none" />

  <!-- Right Side: Dark Shadow Malevolence -->
  <path d="M 355 110 C 410 110, 440 160, 440 210 C 440 260, 410 290, 355 290 Z" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <polygon points="380,175 400,185 385,190" fill="${acc}" />
  <line x1="370" y1="240" x2="410" y2="230" stroke="${acc}" stroke-width="3" stroke-linecap="round" />

  <text x="350" y="65" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="355" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="${acc}" text-anchor="middle" letter-spacing="2">CHARM IN FRONT // DAGGER BEHIND</text>
`
		},
		{
			id: 'spider_trap',
			name: 'Jaring Laba-Laba Jebakan',
			title: 'THE WEB OF SOCIAL TRAP',
			tag: '[ JEBAKAN SOSIAL ]',
			regex: /(jaring laba-laba|jebakan manipulasi|terjerat jaring|social engineering|perangkap halus)/i,
			nodes: ['01. INVISIBLE THREADS', '02. ENTANGLEMENT', '03. PREDATOR WAITING', '04. COMPLETE IMMOBILITY'],
			renderSVG: (acc, title, nodes) => `
  <!-- Concentric Polygon Web Lines -->
  <polygon points="350,90 440,140 440,260 350,310 260,260 260,140" fill="none" stroke="#3f3f46" stroke-width="1.8" />
  <polygon points="350,130 405,160 405,240 350,270 295,240 295,160" fill="none" stroke="#52525B" stroke-width="1.8" />
  <polygon points="350,170 375,185 375,215 350,230 325,215 325,185" fill="none" stroke="${acc}" stroke-width="2" />

  <!-- Radial Spoke Lines -->
  <line x1="350" y1="200" x2="350" y2="70" stroke="#71717A" stroke-width="1.5" />
  <line x1="350" y1="200" x2="460" y2="130" stroke="#71717A" stroke-width="1.5" />
  <line x1="350" y1="200" x2="460" y2="270" stroke="#71717A" stroke-width="1.5" />
  <line x1="350" y1="200" x2="350" y2="330" stroke="#71717A" stroke-width="1.5" />
  <line x1="350" y1="200" x2="240" y2="270" stroke="#71717A" stroke-width="1.5" />
  <line x1="350" y1="200" x2="240" y2="130" stroke="#71717A" stroke-width="1.5" />

  <!-- Spider Center Nucleus -->
  <circle cx="350" cy="200" r="10" fill="#FFFFFF" />
  <circle cx="350" cy="200" r="4" fill="${acc}" />

  <text x="350" y="50" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'trojan_gift',
			name: 'Kuda Troya Penetrasi',
			title: 'THE TROJAN INFILTRATION',
			tag: '[ STRATEGI KUDA TROYA ]',
			regex: /(kuda troya|trojan horse|hadiah beracun|infiltrasi rahasia|penetrasi diam-diam|trojan gift)/i,
			nodes: ['01. INNOCENT GIFT', '02. BREACHING GATES', '03. SLEEPER THREAT', '04. INTERNAL COLLAPSE'],
			renderSVG: (acc, title, nodes) => `
  <!-- City Wall Gateway on Right -->
  <rect x="520" y="100" width="35" height="200" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <rect x="520" y="220" width="35" height="80" fill="#18181b" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />
  <text x="537" y="190" font-family="'Inter', sans-serif" font-size="9" font-weight="900" fill="#FFFFFF" transform="rotate(-90 537 190)">FORTRESS GATE</text>

  <!-- Geometric Wooden Trojan Horse Silhouette -->
  <!-- Horse Body -->
  <polygon points="260,200 370,200 390,260 240,260" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <!-- Horse Neck & Head -->
  <polygon points="370,200 410,130 435,140 395,200" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <!-- Wheels -->
  <circle cx="260" cy="270" r="14" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="370" cy="270" r="14" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Hidden Infiltration Glow inside Body -->
  <circle cx="315" cy="230" r="8" fill="${acc}" />
  <line x1="300" y1="230" x2="330" y2="230" stroke="#FFFFFF" stroke-width="2" />

  <text x="350" y="65" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'bait_hook',
			name: 'Kail Umpan Menggiurkan',
			title: 'THE BAIT & HOOK',
			tag: '[ UMPAN & KAIL ]',
			regex: /(umpan|kail pancing|tergiur umpan|bait hook|terjerat rayuan|godaan jebakan)/i,
			nodes: ['01. LURID BAIT', '02. HIDDEN BARB', '03. SWALLOWED TRAP', '04. PULLED HELPLESS'],
			renderSVG: (acc, title, nodes) => `
  <!-- Fishing Line Dropping Down -->
  <line x1="350" y1="80" x2="350" y2="180" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6,4" />

  <!-- Sharp Curved Fish Hook Wireframe -->
  <path d="M 350 180 L 350 240 A 40 40 0 0 1 270 240 L 270 215" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <!-- Sharp Barb Point -->
  <polygon points="270,215 260,230 270,225" fill="${acc}" />

  <!-- Seductive Golden Gem Bait attached to Barb -->
  <polygon points="270,205 285,190 270,175 255,190" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="270" cy="190" r="3" fill="#FFFFFF" />

  <!-- Bubbles of Illusion -->
  <circle cx="295" cy="165" r="4" fill="none" stroke="#71717A" stroke-width="1.5" />
  <circle cx="310" cy="140" r="6" fill="none" stroke="#71717A" stroke-width="1.5" />

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="340" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#ef4444" text-anchor="middle" letter-spacing="2">NEVER SWALLOW THE SHINY BAIT</text>
`
		},
		{
			id: 'triangulation_toxic',
			name: 'Triangulasi Adu Domba',
			title: 'TOXIC TRIANGULATION',
			tag: '[ TRIANGULASI ADU DOMBA ]',
			regex: /(triangulasi|adu domba|pihak ketiga beracun|pecah belah|triangulation|memecah belah)/i,
			nodes: ['01. PERSECUTOR (APEX)', '02. RESCUER ILLUSION', '03. VICTIM TRAP', '04. DIVIDE AND CONQUER'],
			renderSVG: (acc, title, nodes) => `
  <!-- Triangle of Manipulation -->
  <polygon points="350,110 220,290 480,290" fill="#18181b" stroke="#52525B" stroke-width="2.5" />

  <!-- Apex: The Puppet Manipulator -->
  <circle cx="350" cy="110" r="16" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="350" cy="110" r="5" fill="${acc}" />
  <text x="350" y="80" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">MANIPULATOR</text>

  <!-- Left Victim -->
  <circle cx="220" cy="290" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="220" y="325" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#A1A1AA" text-anchor="middle">TARGET A</text>

  <!-- Right Victim -->
  <circle cx="480" cy="290" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="480" y="325" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#A1A1AA" text-anchor="middle">TARGET B</text>

  <!-- Clashing Discord Line between A & B -->
  <line x1="245" y1="290" x2="455" y2="290" stroke="#ef4444" stroke-width="3" stroke-dasharray="6,4" />
  <text x="350" y="280" font-family="'Inter', sans-serif" font-size="10" font-weight="900" fill="#ef4444" text-anchor="middle">CONFLICT SEEDED</text>

  <text x="350" y="45" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'love_bomb',
			name: 'Ledakan Cinta Semu (Love Bombing)',
			title: 'LOVE BOMBING CRASH',
			tag: '[ LOVE BOMBING ]',
			regex: /(love bombing|cinta semu|pujian berlebihan di awal|siklus manipulasi cinta|devaluasi emosi)/i,
			nodes: ['01. EXTREME ADORATION', '02. PEAK DEPENDENCY', '03. ABRUPT DEVALUATION', '04. EMOTIONAL DISCARD'],
			renderSVG: (acc, title, nodes) => `
  <!-- Flight Curve: Vertical Rocket Ascent then Sudden Cliff Dive -->
  <path d="M 150 280 Q 250 100, 350 110 L 450 310" fill="none" stroke="#FFFFFF" stroke-width="3" />

  <!-- Ascending Phase: False Golden Love Glow -->
  <circle cx="350" cy="110" r="12" fill="${acc}" />
  <text x="350" y="85" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">PHASE 1: ADORATION PEAK</text>

  <!-- Crash Point at the Base -->
  <circle cx="450" cy="310" r="10" fill="#ef4444" />
  <text x="490" y="325" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#ef4444">DEVALUATION</text>

  <!-- Falling Heart Outline Broken -->
  <path d="M 435 240 C 420 220, 390 220, 390 240 C 390 260, 420 280, 435 290" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="3,3" />

  <text x="350" y="50" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'predator_gaze',
			name: 'Tatapan Dingin Predator',
			title: 'THE MACHINAVIELLIAN GAZE',
			tag: '[ TATAPAN PREDATOR ]',
			regex: /(predator|tatapan dingin|mata elang manipulasi|machiavellian|dark triad|psikopat manipulasi)/i,
			nodes: ['01. TARGET ISOLATION', '02. COLD GAZE', '03. EMOTIONAL EXPLOIT', '04. CALCULATED STRIKE'],
			renderSVG: (acc, title, nodes) => `
  <!-- Sharp Almond Geometric Eye Outline -->
  <path d="M 180 200 Q 350 90, 520 200 Q 350 310, 180 200 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
  <path d="M 210 200 Q 350 120, 490 200 Q 350 280, 210 200 Z" fill="none" stroke="#3f3f46" stroke-width="1.8" />

  <!-- Slit Predator Pupil (Reptilian / Machiavellian) -->
  <ellipse cx="350" cy="200" rx="14" ry="50" fill="${acc}" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="350" cy="200" r="4" fill="#18181b" />

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="355" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="${acc}" text-anchor="middle" letter-spacing="2">CALCULATED // ZERO EMPATHY</text>
`
		},
		{
			id: 'hypnotic_whirl',
			name: 'Spiral Sugesti Hipnotis',
			title: 'SUBLIMINAL HYPNOSIS',
			tag: '[ HIPNOSIS & SUGESTI ]',
			regex: /(hipnosis|sugesti bawah sadar|subliminal|cuci otak|brainwashing|terhipnotis)/i,
			nodes: ['01. TRANCE INDUCTION', '02. CRITICAL FACTOR BYPASS', '03. EMBEDDED COMMAND', '04. SUBCONSCIOUS ACCEPTANCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes whirlTurn { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-whirl { animation: whirlTurn 10s linear infinite; transform-origin: 350px 200px; }
  </style>

  <!-- Hypnotic Concentric Spiral Discs -->
  <g class="anim-whirl">
    <circle cx="350" cy="200" r="110" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="12,12" />
    <circle cx="350" cy="200" r="85" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="10,10" />
    <circle cx="350" cy="200" r="60" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="8,8" />
    <circle cx="350" cy="200" r="35" fill="none" stroke="${acc}" stroke-width="3.5" stroke-dasharray="6,6" />
    <circle cx="350" cy="200" r="12" fill="${acc}" />
  </g>

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="355" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#A1A1AA" text-anchor="middle" letter-spacing="2">BYPASSING THE LOGICAL MIND // SUBTLE INFLUENCE</text>
`
		}
	]
};
