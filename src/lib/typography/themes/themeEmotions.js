/**
 * THEME: HUMAN EMOTIONS & CHARACTER (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeEmotions = {
	categoryName: 'emotions',
	categoryLabel: '🎭 Emosi Manusia & Kedalaman Jiwa',
	themeColor: '#FB7185', // Rose Crimson
	items: [
		{
			id: 'rage_flame',
			name: 'Infernal Rage & Uncontrolled Wrath',
			title: 'VOLATILE CATHARTIC RAGE',
			tag: '[ KEMARAHAN MEMBARA // LEDAKAN API AMARAH ]',
			regex: /(kemarahan|amarah|murka|rage|api amarah|ledakan emosi|amarah meledak)/i,
			nodes: ['01. SIMMERING RESENTMENT', '02. VOLATILE SPARK', '03. UNRESTRAINED FURY', '04. CATHARTIC ASH'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes flameFlickerRage { 0%, 100% { transform: scaleY(1) skewX(0deg); } 50% { transform: scaleY(1.15) skewX(4deg); } }
    .anim-rage { animation: flameFlickerRage 1.5s infinite ease-in-out; transform-origin: 350px 240px; }
  </style>

  <!-- Hearth/Ground Line -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Kinetic Explosive Flame Core -->
  <g class="anim-rage">
    <!-- Jagged Outer Fire Tongues -->
    <path d="M 350,70 L 375,130 L 420,110 L 400,180 L 440,210 L 410,255 L 290,255 L 260,210 L 300,180 L 280,110 L 325,130 Z" fill="#18181b" stroke="${acc}" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Inner Blazing White Core -->
    <path d="M 350,115 L 365,160 L 390,175 L 375,215 L 325,215 L 310,175 L 335,160 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
    <circle cx="350" cy="180" r="8" fill="${acc}" />
  </g>

  <!-- Sparks Flying Upward -->
  <circle cx="310" cy="65" r="3" fill="${acc}" />
  <circle cx="390" cy="55" r="2.5" fill="#FFFFFF" />
  <circle cx="350" cy="40" r="4" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'tears_catharsis',
			name: 'Falling Tear & Cathartic Release',
			title: 'TEAR OF CATHARSIS & HEALING',
			tag: '[ AIR MATA KELEGAAN // PELEPASAN EMOSI MENDALAM ]',
			regex: /(air mata|menangis|katarsis|kesedihan mendalam|tangisan pemulihan|duka lara)/i,
			nodes: ['01. ACCUMULATED GRIEF', '02. BREAKING THE LEVEE', '03. FALLING DROPLET', '04. TRANQUIL SURFACE POOL'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes dropFall { 0% { transform: translateY(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(85px); opacity: 0; } }
    @keyframes poolRipple { 0% { rx: 10; ry: 4; opacity: 1; } 100% { rx: 70; ry: 20; opacity: 0; } }
    .anim-tear-drop { animation: dropFall 2.5s infinite cubic-bezier(0.4, 0, 1, 1); }
    .anim-tear-pool { animation: poolRipple 2.5s infinite ease-out; animation-delay: 1.8s; }
  </style>

  <!-- Weeping Minimalist Eye Silhouette (Top) -->
  <g transform="translate(250, 70)">
    <path d="M 0,50 C 50,0 150,0 200,50 C 150,100 50,100 0,50 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="100" cy="50" r="25" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="100" cy="50" r="10" fill="#FFFFFF" />
  </g>

  <!-- Falling Tear Droplet -->
  <g class="anim-tear-drop" transform="translate(350, 145)">
    <path d="M 0,-15 C 8,-5 12,5 12,12 C 12,19 7,24 0,24 C -7,24 -12,19 -12,12 C -12,5 -8,-5 0,-15 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="0" cy="12" r="3" fill="#FFFFFF" />
  </g>

  <!-- Tranquil Healing Pool Below -->
  <ellipse cx="350" cy="260" rx="90" ry="25" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <ellipse cx="350" cy="260" rx="30" ry="10" fill="none" stroke="${acc}" stroke-width="2" class="anim-tear-pool" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'iron_will',
			name: 'Diamond Facet & Unbreakable Will',
			title: 'INDOMITABLE IRON WILL',
			tag: '[ TEKAD BAJA INTAN // KETAHANAN MENTAL TAK TERGANGGU ]',
			regex: /(tekad baja|kemauan keras|ketahanan mental|hati intan|unbreakable will|keberanian kokoh)/i,
			nodes: ['01. HIGH-PRESSURE CRUSH', '02. MOLECULAR CRYSTALLIZATION', '03. INDESTRUCTIBLE FACETS', '04. BRILLIANT LIGHT REFRACTION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes diamondShine { 0%, 100% { filter: drop-shadow(0 0 4px ${acc}55); } 50% { filter: drop-shadow(0 0 16px ${acc}); } }
    .anim-diamond { animation: diamondShine 3s infinite ease-in-out; }
  </style>

  <!-- External Crushing Pressure Vectors (Resisted) -->
  <g stroke="#52525B" stroke-width="2" stroke-dasharray="4,3">
    <line x1="200" y1="185" x2="260" y2="185" />
    <line x1="500" y1="185" x2="440" y2="185" />
    <line x1="350" y1="55" x2="350" y2="105" />
    <line x1="350" y1="315" x2="350" y2="265" />
  </g>

  <!-- Impervious Diamond Core -->
  <g class="anim-diamond" transform="translate(265, 105)">
    <!-- Top Table & Crown -->
    <polygon points="50,20 120,20 170,60 0,60" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <!-- Bottom Pavilion Cut to Culet -->
    <polygon points="0,60 170,60 85,150" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />

    <!-- Internal Facet Triangles -->
    <line x1="50" y1="20" x2="85" y2="150" stroke="${acc}" stroke-width="2" />
    <line x1="120" y1="20" x2="85" y2="150" stroke="${acc}" stroke-width="2" />
    <line x1="85" y1="60" x2="85" y2="150" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="85" cy="60" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'anxiety_cage',
			name: 'Anxiety Wireframe Cage & Escaping Core',
			title: 'CONFINING ANXIETY MATRIX',
			tag: '[ JERUJI KECEMASAN // KELUAR DARI KEBISINGAN MENTAL ]',
			regex: /(kecemasan|anxiety|gelisah|panik|terkekang pikiran|beban cemas|kandang ketakutan)/i,
			nodes: ['01. LOOPING RUMINATION', '02. INTERLOCKED CAGE BARS', '03. CONSCIOUS WITNESS POINT', '04. RADIAL EXPANSION BREAKOUT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes cageJitter { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(-2px, 1px); } 75% { transform: translate(2px, -1px); } }
    @keyframes escapePulse { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px #FFFFFF); } 50% { transform: scale(1.3); filter: drop-shadow(0 0 16px ${acc}); } }
    .anim-cage { animation: cageJitter 0.3s infinite ease-in-out; }
    .anim-escape { animation: escapePulse 2s infinite ease-in-out; transform-origin: 350px 185px; }
  </style>

  <!-- Chaotic Entangled Cage Enclosure -->
  <g class="anim-cage">
    <!-- Twisted Wire Cube Framework -->
    <rect x="250" y="85" width="200" height="200" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
    
    <!-- Dense Grid Mesh Bars -->
    <line x1="290" y1="85" x2="290" y2="285" stroke="#52525B" stroke-width="1.8" />
    <line x1="330" y1="85" x2="330" y2="285" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8,4" />
    <line x1="370" y1="85" x2="370" y2="285" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8,4" />
    <line x1="410" y1="85" x2="410" y2="285" stroke="#52525B" stroke-width="1.8" />

    <line x1="250" y1="125" x2="450" y2="125" stroke="#52525B" stroke-width="1.8" />
    <line x1="250" y1="165" x2="450" y2="165" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8,4" />
    <line x1="250" y1="205" x2="450" y2="205" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8,4" />
    <line x1="250" y1="245" x2="450" y2="245" stroke="#52525B" stroke-width="1.8" />
  </g>

  <!-- Glowing Luminous Awakening Core (Breaching the Cage) -->
  <g class="anim-escape">
    <circle cx="350" cy="185" r="22" fill="#18181b" stroke="${acc}" stroke-width="3.5" />
    <circle cx="350" cy="185" r="8" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'serenity_lake',
			name: 'Mirror Lake & Solitary Star Stillness',
			title: 'MIRROR LAKE SERENITY',
			tag: '[ DANAU KETENANGAN // KEDAMAIAN CERMIN JIWAI ]',
			regex: /(ketenangan jiwa|danau hening|kedamaian batin|serenity|pikiran jernih|ketentraman batin)/i,
			nodes: ['01. SURFACE RIPPLE SUBSIDENCE', '02. PERFECT SPECULAR REFLECTION', '03. CELESTIAL ALIGNMENT', '04. ABSOLUTE INNER SILENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes starPulseSerene { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; filter: drop-shadow(0 0 8px ${acc}); } }
    .anim-star-serene { animation: starPulseSerene 3s infinite ease-in-out; }
  </style>

  <!-- Pure Flat Specular Horizon Line -->
  <line x1="140" y1="185" x2="560" y2="185" stroke="#FFFFFF" stroke-width="3" />

  <!-- Lone North Star in the Sky -->
  <g class="anim-star-serene" transform="translate(350, 100)">
    <line x1="0" y1="-25" x2="0" y2="25" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <line x1="-25" y1="0" x2="25" y2="0" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
  </g>

  <!-- Distant Mountain Ridge in Sky -->
  <polyline points="180,185 240,150 300,185 410,135 480,185" fill="none" stroke="#52525B" stroke-width="2" />

  <!-- Inverted Mirror Reflection Below Horizon (Glassy Lake) -->
  <g opacity="0.5">
    <polyline points="180,185 240,220 300,185 410,235 480,185" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,2" />
    <line x1="350" y1="245" x2="350" y2="295" stroke="${acc}" stroke-width="2" stroke-dasharray="3,3" />
    <circle cx="350" cy="270" r="4" fill="#FFFFFF" />
  </g>

  <!-- Gentle Water Surface Glints -->
  <line x1="280" y1="210" x2="320" y2="210" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
  <line x1="380" y1="225" x2="430" y2="225" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'envy_thorn',
			name: 'Envy Thorns & Constricting Heart',
			title: 'ENVIOUS BRAMBLE CONSTRICTION',
			tag: '[ DURI KEDENGKIAN // KEKANGAN IRI HATI PADA DIRI ]',
			regex: /(iri hati|kedengkian|dengki|envy|duri iri hati|merasa tersaingi|cemburu buta)/i,
			nodes: ['01. EXTERNAL COMPARISON SEED', '02. THORNY VINE EXPANSION', '03. CONSTRICTING STRANGLEHOLD', '04. CONFINED VITALITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes heartThrobEnvy { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .anim-envy-heart { animation: heartThrobEnvy 2s infinite ease-in-out; transform-origin: 350px 175px; }
  </style>

  <!-- Central Anatomical/Symbolic Heart -->
  <g class="anim-envy-heart">
    <!-- Heart Contour -->
    <path d="M 350,225 C 290,175 290,125 325,105 C 345,95 350,115 350,115 C 350,115 355,95 375,105 C 410,125 410,175 350,225 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="155" r="8" fill="${acc}" />
  </g>

  <!-- Constricting Thorny Bramble Twisting Around Heart -->
  <g stroke="${acc}" stroke-width="3" stroke-linecap="round">
    <!-- Main Vine Loop -->
    <path d="M 280,185 C 310,150 390,200 420,165" fill="none" />
    <path d="M 300,135 C 340,170 360,130 400,160" fill="none" stroke="#FFFFFF" stroke-width="2" />

    <!-- Sharp Rose Thorns Sprouting Out -->
    <polygon points="295,170 305,175 300,160" fill="${acc}" stroke="none" />
    <polygon points="345,160 355,165 350,150" fill="${acc}" stroke="none" />
    <polygon points="385,185 395,190 390,175" fill="${acc}" stroke="none" />
    <polygon points="325,145 330,135 320,138" fill="#FFFFFF" stroke="none" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'hope_beacon',
			name: 'Lighthouse Beacon & Storm Navigation',
			title: 'BEACON OF UNWAVERING HOPE',
			tag: '[ MERCUSUAR HARAPAN // PENUNTUN DI TENGAH BADAI EMOSI ]',
			regex: /(harapan|mercusuar|titik terang|cahaya harapan|penuntun badai|optimisme teguh)/i,
			nodes: ['01. ROCK-STEADY GRANITE BASE', '02. FOCUSED FRESNEL LENS', '03. PIERCING ROTARY BEAM', '04. HAVEN ASSURANCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes lightBeamSweep { 0%, 100% { transform: rotate(-25deg); } 50% { transform: rotate(25deg); } }
    .anim-hope-beam { animation: lightBeamSweep 5s ease-in-out infinite; transform-origin: 350px 105px; }
  </style>

  <!-- Stormy Sea Waves Below -->
  <path d="M 140,265 Q 190,250 240,265 T 340,265 T 440,265 T 560,265" fill="none" stroke="#52525B" stroke-width="2.5" />
  <!-- Rocky Outcrop Crag -->
  <polygon points="280,265 310,230 390,230 420,265" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Tapered Lighthouse Tower Body -->
  <polygon points="325,230 335,115 365,115 375,230" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <!-- Spiral Tower Band Stripes -->
  <line x1="330" y1="180" x2="370" y2="180" stroke="${acc}" stroke-width="3" />
  <line x1="333" y1="145" x2="367" y2="145" stroke="#FFFFFF" stroke-width="2" />

  <!-- Lantern Room Gallery & Cupola Dome -->
  <rect x="330" y="95" width="40" height="20" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <path d="M 330,95 Q 350,80 370,95 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Rotating Luminous Beam of Hope -->
  <g class="anim-hope-beam">
    <polygon points="350,105 140,40 140,100" fill="${acc}" fill-opacity="0.2" stroke="${acc}" stroke-width="1.8" stroke-dasharray="4,4" />
    <circle cx="350" cy="105" r="6" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'empathy_hug',
			name: 'Dual Curvature & Interlocking Empathy',
			title: 'CONGRUENT EMPATHY UNION',
			tag: '[ EMPATI MENDALAM // DUA JIWA SALING MENOPANG ]',
			regex: /(empati|kehangatan jiwa|saling menguatkan|kasih sayang tulus|merangkul duka|koneksi emosional)/i,
			nodes: ['01. VULNERABLE DISCLOSURE', '02. ACTIVE ATTUNEMENT', '03. INTERLOCKING EMBRACE', '04. SHARED RESILIENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes empathyGlow { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 10px ${acc}); } }
    .anim-empathy { animation: empathyGlow 3s infinite ease-in-out; }
  </style>

  <!-- Baseline Ground Support -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Two Curved Interlocking Human Entities -->
  <g class="anim-empathy">
    <!-- Left Entity (White, Leaning Right) -->
    <g transform="translate(290, 110)">
      <circle cx="0" cy="0" r="16" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
      <path d="M 0,20 C 0,70 50,80 50,155" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 10,45 C 35,50 60,65 60,95" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- Right Entity (Accent Color, Leaning Left In Embrace) -->
    <g transform="translate(410, 110)">
      <circle cx="0" cy="0" r="16" fill="#18181b" stroke="${acc}" stroke-width="3" />
      <path d="M 0,20 C 0,70 -50,80 -50,155" fill="none" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />
      <path d="M -10,45 C -35,50 -60,65 -60,95" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- Central Point of Mutual Resonance -->
    <circle cx="350" cy="185" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="350" cy="185" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'mask_shadow',
			name: 'Jungian Persona & Shadow Integration',
			title: 'JUNGIAN PERSONA PEEL',
			tag: '[ TOPENG PERSONA & SHADOW // INTEGRASI SISI GELAP DIRI ]',
			regex: /(persona|shadow jung|topeng diri|sisi gelap diri|integrasi kepribadian|topeng kepalsuan)/i,
			nodes: ['01. SOCIAL FACADE MASK', '02. CONCEALED INSTINCTIVE SHADOW', '03. CONSCIOUS UNMASKING', '04. INTEGRATED AUTHENTICITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes maskPeel { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(35px) rotate(5deg); } }
    .anim-mask { animation: maskPeel 4s ease-in-out infinite; transform-origin: 350px 175px; }
  </style>

  <!-- Left: Authentic Shadow Soul Behind Mask -->
  <g transform="translate(300, 100)">
    <!-- Dark/Inner Face Oval Contour -->
    <path d="M 50,0 C 15,0 0,40 0,80 C 0,120 25,150 50,150" fill="none" stroke="#52525B" stroke-width="3" stroke-dasharray="6,4" />
    <circle cx="30" cy="65" r="5" fill="${acc}" />
    <text x="40" y="180" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="${acc}" text-anchor="middle">SHADOW</text>
  </g>

  <!-- Right: Peeling Social Persona Mask (Kinetic Drift) -->
  <g class="anim-mask" transform="translate(350, 100)">
    <!-- Right Mask Shell -->
    <path d="M 0,0 C 35,0 50,40 50,80 C 50,120 25,150 0,150 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    <!-- Slit Eye Hole & Neutral Lip -->
    <ellipse cx="25" cy="65" rx="8" ry="4" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <line x1="10" y1="110" x2="30" y2="110" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <text x="25" y="180" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">PERSONA</text>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'regret_scales',
			name: 'Retrospective Balance & Scales of Regret',
			title: 'RETROSPECTIVE EVALUATION SCALES',
			tag: '[ TIMBANGAN PENYESALAN // MENIMBANG PILIHAN MASA LALU ]',
			regex: /(penyesalan|timbangan masa lalu|menimbang pilihan|retrospeksi|evaluasi diri masa lalu|beban penyesalan)/i,
			nodes: ['01. SOBER RETROSPECTION', '02. WEIGHING SINS VS LESSONS', '03. SHIFTING TILT FULCRUM', '04. FORGIVENESS EQUILIBRIUM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes scaleTiltRegret { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
    .anim-scales-regret { animation: scaleTiltRegret 5s ease-in-out infinite; transform-origin: 350px 115px; }
  </style>

  <!-- Pillar & Heavy Base Plinth -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <rect x="310" y="255" width="80" height="15" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="350" y1="255" x2="350" y2="115" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <circle cx="350" cy="115" r="7" fill="${acc}" />

  <!-- Tilting Balance Beam and Suspended Pans -->
  <g class="anim-scales-regret">
    <!-- Beam -->
    <line x1="220" y1="115" x2="480" y2="115" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />

    <!-- Left Pan (Heavy Regret / Stone) -->
    <g transform="translate(220, 115)">
      <line x1="0" y1="0" x2="-25" y2="55" stroke="#52525B" stroke-width="1.8" />
      <line x1="0" y1="0" x2="25" y2="55" stroke="#52525B" stroke-width="1.8" />
      <path d="M -35,55 Q 0,75 35,55 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="0" cy="50" r="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    </g>

    <!-- Right Pan (Wisdom Lesson / Light Feather) -->
    <g transform="translate(480, 115)">
      <line x1="0" y1="0" x2="-25" y2="55" stroke="#52525B" stroke-width="1.8" />
      <line x1="0" y1="0" x2="25" y2="55" stroke="#52525B" stroke-width="1.8" />
      <path d="M -35,55 Q 0,75 35,55 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
      <line x1="0" y1="42" x2="0" y2="54" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="0" cy="40" r="3" fill="${acc}" />
    </g>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
