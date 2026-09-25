/**
 * THEME: ANIMALS & BINATANG (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeAnimals = {
	categoryName: 'animals',
	categoryLabel: '🦁 Binatang & Insting Alam',
	items: [
		{
			id: 'lion_pride',
			name: 'Lion Crest & Apex Courage',
			title: 'APEX PREDATOR COURAGE',
			tag: '[ SINGA SAVANA // KEBERANIAN TANPA RAGU ]',
			regex: /(singa|\blion\b|raja hutan|keberanian singa|mengaum|alpha predator|singa jantan|keberanian raja)/i,
			nodes: ['01. TERRITORIAL DOMINANCE', '02. CALCULATED POUNCE', '03. PRIMAL ROAR', '04. UNCONTESTED REIGN'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes maneGlow { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 6px ${acc}88); } }
    @keyframes roarBreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    .anim-mane { animation: maneGlow 2.5s infinite ease-in-out; }
    .anim-lion { animation: roarBreath 3s ease-in-out infinite; transform-origin: 350px 180px; }
  </style>

  <!-- Savanna Horizon Base -->
  <line x1="140" y1="275" x2="560" y2="275" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Radiating Courage Aura -->
  <circle cx="350" cy="180" r="95" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="4,6" />

  <!-- Minimalist Geometric Lion Profile -->
  <g class="anim-lion">
    <!-- Geometric Radial Mane Spines -->
    <g class="anim-mane" stroke="${acc}" stroke-width="2.5" stroke-linecap="round">
      <line x1="350" y1="95" x2="350" y2="70" />
      <line x1="395" y1="110" x2="415" y2="90" />
      <line x1="425" y1="145" x2="450" y2="135" />
      <line x1="435" y1="190" x2="465" y2="190" />
      <line x1="425" y1="235" x2="450" y2="245" />
      <line x1="395" y1="270" x2="415" y2="290" />
      <line x1="350" y1="285" x2="350" y2="305" />
      <line x1="305" y1="270" x2="285" y2="290" />
      <line x1="275" y1="235" x2="250" y2="245" />
      <line x1="265" y1="190" x2="235" y2="190" />
      <line x1="275" y1="145" x2="250" y2="135" />
      <line x1="305" y1="110" x2="285" y2="90" />
    </g>

    <!-- Lion Head Polygonal Facets -->
    <polygon points="350,110 395,145 385,225 350,265 315,225 305,145" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Brow & Muzzle Ridge -->
    <path d="M 330,155 L 350,185 L 370,155" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="350" y1="185" x2="350" y2="230" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    
    <!-- Nose Triangle -->
    <polygon points="340,230 360,230 350,242" fill="${acc}" />
    
    <!-- Piercing Eyes -->
    <circle cx="332" cy="172" r="3.5" fill="${acc}" />
    <circle cx="368" cy="172" r="3.5" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'eagle_soar',
			name: 'Soaring Eagle & High Altitude Vision',
			title: 'HIGH-ALTITUDE VISION',
			tag: '[ RAJAWALI ANGKASA // PERSPEKTIF MAKRO ]',
			regex: /(rajawali|elang|\beagle\b|terbang tinggi|mata elang|sayap elang|pandangan tajam|tatapan elang)/i,
			nodes: ['01. THERMAL ASCENT', '02. 30,000 FT VISION', '03. TARGET LOCK', '04. VELOCITY DIVE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wingFlap { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.92) translateY(3px); } }
    @keyframes eyeGleam { 0% { r: 3; } 50% { r: 5; } 100% { r: 3; } }
    .anim-wings { animation: wingFlap 3s ease-in-out infinite; transform-origin: 350px 175px; }
    .anim-eagle-eye { animation: eyeGleam 2s infinite ease-in-out; }
  </style>

  <!-- Altitude Air Currents -->
  <path d="M 160,130 Q 350,110 540,130" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="6,6" />
  <path d="M 200,270 Q 350,250 500,270" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="6,6" />

  <!-- Eagle Silhouette Wireframe -->
  <g class="anim-wings">
    <!-- Left Wing Feathers Span -->
    <path d="M 350,175 L 300,165 L 230,130 L 160,110 L 190,145 L 240,175 L 290,195 L 350,205" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <path d="M 180,120 L 220,150 L 270,180" fill="none" stroke="${acc}" stroke-width="2" />

    <!-- Right Wing Feathers Span -->
    <path d="M 350,175 L 400,165 L 470,130 L 540,110 L 510,145 L 460,175 L 410,195 L 350,205" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <path d="M 520,120 L 480,150 L 430,180" fill="none" stroke="${acc}" stroke-width="2" />

    <!-- Eagle Head & Hooked Beak -->
    <polygon points="350,135 342,165 358,165" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <path d="M 345,150 L 350,130 L 355,150 L 350,160 Z" fill="${acc}" stroke="#FFFFFF" stroke-width="1.8" />
    <circle cx="350" cy="142" r="3.5" fill="#FFFFFF" class="anim-eagle-eye" />

    <!-- Tail Feathers Fan -->
    <polygon points="338,205 350,245 362,205" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  </g>

  <!-- Ground Target Reticle Far Below -->
  <circle cx="350" cy="285" r="16" fill="none" stroke="${acc}" stroke-width="1.8" stroke-dasharray="3,3" />
  <circle cx="350" cy="285" r="4" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'wolf_pack',
			name: 'Howling Wolf & Pack Synergy',
			title: 'WOLF PACK SYNERGY',
			tag: '[ LOYALITAS KAWANAN // LONE WOLF DISCIPLINE ]',
			regex: /(serigala|\bwolf\b|kawanan serigala|lone wolf|melolong|loyalitas kelompok|serigala penyendiri|naluri serigala)/i,
			nodes: ['01. SOLITARY HUNGER', '02. PACK HIERARCHY', '03. NOCTURNAL HOWL', '04. UNSTOPPABLE FLANK'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wolfHowl { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-5deg); } }
    @keyframes soundRays { 0% { opacity: 0; r: 10; } 50% { opacity: 1; r: 35; } 100% { opacity: 0; r: 60; } }
    .anim-wolf { animation: wolfHowl 4s ease-in-out infinite; transform-origin: 320px 240px; }
    .anim-howl-wave { animation: soundRays 2.5s ease-out infinite; transform-origin: 395px 125px; }
  </style>

  <!-- Craggy Rock Outcrop -->
  <polygon points="180,275 320,200 370,275" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
  <line x1="140" y1="275" x2="560" y2="275" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Crescent Moon in Distance -->
  <path d="M 470,110 A 35,35 0 1,0 470,170 A 26,26 0 0,1 470,110 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Howling Sound Shockwave Rings -->
  <circle cx="395" cy="125" r="25" fill="none" stroke="${acc}" stroke-width="1.8" class="anim-howl-wave" stroke-dasharray="4,4" />

  <!-- Howling Wolf Silhouette Geometry -->
  <g class="anim-wolf">
    <!-- Body & Haunches -->
    <path d="M 270,240 L 290,195 L 325,175 L 360,150 L 395,125" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 395,125 L 380,140 L 365,160 L 350,190 L 355,240" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    
    <!-- Wolf Ears Tilted Back in Howl -->
    <polygon points="360,150 365,130 375,145" fill="${acc}" stroke="#FFFFFF" stroke-width="2" />
    
    <!-- Open Howling Muzzle Tip -->
    <path d="M 395,125 L 410,115 L 400,128" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <circle cx="385" cy="140" r="3" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'chameleon_adapt',
			name: 'Adaptive Chameleon & Kamuflase',
			title: 'RADICAL ADAPTABILITY',
			tag: '[ KAMUFLASE BIOLOGIS // EVOLUSI FLEKSIBEL ]',
			regex: /(bunglon|chameleon|kamuflase|beradaptasi|adaptasi lingkungan|berubah warna|fleksibilitas situasi)/i,
			nodes: ['01. SENSORY PERCEPTION', '02. CHROMATOPHORE SHIFT', '03. PERFECT BLENDING', '04. PRECISE STRIKE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes colorShift { 0% { stroke: #FFFFFF; } 50% { stroke: ${acc}; } 100% { stroke: #10B981; } }
    @keyframes eyeScan { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(45deg); } }
    .anim-chameleon-body { animation: colorShift 4s infinite alternate ease-in-out; }
    .anim-turret-eye { animation: eyeScan 3s ease-in-out infinite; transform-origin: 410px 170px; }
  </style>

  <!-- Tree Branch Perch -->
  <path d="M 160,240 Q 320,210 540,240" fill="none" stroke="#52525B" stroke-width="4.5" stroke-linecap="round" />
  <line x1="480" y1="230" x2="520" y2="210" stroke="#52525B" stroke-width="3" stroke-linecap="round" />

  <!-- Chameleon Body Wireframe -->
  <g class="anim-chameleon-body">
    <!-- Arched Back Spine -->
    <path d="M 270,225 C 280,165 370,145 420,165 C 445,175 440,205 405,215 L 310,225" fill="#18181b" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Prehensile Spiral Tail -->
    <path d="M 270,225 Q 230,225 220,195 Q 210,165 240,165 Q 255,165 255,180 Q 255,190 245,190" fill="none" stroke-width="3" stroke-linecap="round" />

    <!-- Forelegs Clasping Branch -->
    <path d="M 380,215 L 390,230 M 340,220 L 335,230" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Independent Turret Eye -->
  <g class="anim-turret-eye">
    <circle cx="410" cy="170" r="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="414" cy="168" r="3.5" fill="#FFFFFF" />
  </g>

  <!-- Extended Tongue Trajectory Arc (Dotted) -->
  <path d="M 425,180 Q 480,160 520,170" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="3,3" />
  <circle cx="520" cy="170" r="4.5" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'owl_wisdom',
			name: 'Nocturnal Owl & Kebijaksanaan Hening',
			title: 'NOCTURNAL INTELLECT',
			tag: '[ BURUNG HANTU // PENGAMAT KEHENINGAN ]',
			regex: /(burung hantu|\bowl\b|kebijaksanaan malam|mata tajam burung hantu|pengamat sunyi|penglihatan malam|keheningan malam)/i,
			nodes: ['01. SILENT PERCH', '02. BINOCULAR DEPTH', '03. ZERO SOUND WING', '04. STOIC INSIGHT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes owlBlink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
    @keyframes haloBreathe { 0%, 100% { stroke-opacity: 0.4; } 50% { stroke-opacity: 0.9; } }
    .anim-owl-eyes { animation: owlBlink 4s infinite; transform-origin: 350px 165px; }
    .anim-halo { animation: haloBreathe 3s infinite ease-in-out; }
  </style>

  <!-- Moon Aura Backdrop -->
  <circle cx="350" cy="170" r="95" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="6,6" class="anim-halo" />

  <!-- Wooden Perch Bar -->
  <line x1="240" y1="260" x2="460" y2="260" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />

  <!-- Geometric Owl Mask Shell -->
  <path d="M 310,120 L 350,145 L 390,120 L 410,165 C 410,225 385,255 350,255 C 315,255 290,225 290,165 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  
  <!-- Ear Tufts Horns -->
  <polyline points="305,135 300,105 320,125" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <polyline points="395,135 400,105 380,125" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Binocular Concentric Eyes -->
  <g class="anim-owl-eyes">
    <circle cx="328" cy="165" r="18" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="328" cy="165" r="8" fill="${acc}" />
    
    <circle cx="372" cy="165" r="18" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="372" cy="165" r="8" fill="${acc}" />
  </g>

  <!-- Sharp Beak -->
  <polygon points="345,182 355,182 350,202" fill="${acc}" />

  <!-- Talons Gripping Perch -->
  <line x1="330" y1="255" x2="330" y2="265" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
  <line x1="370" y1="255" x2="370" y2="265" stroke="${acc}" stroke-width="3" stroke-linecap="round" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'ant_colony',
			name: 'Ant Colony & Compound Labor',
			title: 'DISPROPORTIONATE LEVERAGE',
			tag: '[ KEKUATAN SEMUT // DISIPLIN 50X BEBAN ]',
			regex: /(semut|\bant\b|koloni semut|kekuatan semut|gotong royong semut|beban berlipat semut|pekerja keras tanpa lelah)/i,
			nodes: ['01. 50X BODYWEIGHT', '02. ZERO COMPLAINT', '03. PHEROMONE ALIGNMENT', '04. MONUMENTAL MOUND'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes antLift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes loadGlow { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; } }
    .anim-ant-unit { animation: antLift 2.5s ease-in-out infinite; }
    .anim-load { animation: loadGlow 2s infinite ease-in-out; }
  </style>

  <!-- Soil Groundline -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <g class="anim-ant-unit">
    <!-- Giant Heavy Geometric Payload Carried Above (Leaf / Pebble) -->
    <g class="anim-load">
      <polygon points="350,75 440,115 410,165 290,165 260,115" fill="#18181b" stroke="${acc}" stroke-width="3" stroke-linejoin="round" />
      <line x1="350" y1="75" x2="350" y2="165" stroke="${acc}" stroke-width="1.8" stroke-dasharray="4,4" />
      <text x="350" y="125" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">50X LOAD</text>
    </g>

    <!-- Ant Mandibles Gripping Load -->
    <path d="M 335,178 L 335,165 M 365,178 L 365,165" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- 3-Segment Ant Body Anatomy -->
    <!-- Head -->
    <circle cx="350" cy="188" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <!-- Antennae -->
    <path d="M 342,175 L 330,160 M 358,175 L 370,160" stroke="${acc}" stroke-width="2" stroke-linecap="round" />
    
    <!-- Thorax -->
    <ellipse cx="350" cy="216" rx="11" ry="15" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    
    <!-- Abdomen -->
    <ellipse cx="350" cy="245" rx="16" ry="18" fill="#18181b" stroke="${acc}" stroke-width="3" />

    <!-- Jointed Legs Anchored to Soil -->
    <polyline points="340,210 310,230 295,265" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <polyline points="360,210 390,230 405,265" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <polyline points="340,225 320,245 315,265" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
    <polyline points="360,225 380,245 385,265" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'bull_charge',
			name: 'Charging Bull & Bullish Momentum',
			title: 'BULLISH MOMENTUM',
			tag: '[ BANTENG SERUBUK // RELENTLESS DRIVE ]',
			regex: /(banteng|\bbull\b|momentum banteng|menyeruduk|kekuatan banteng|tanduk banteng|bullish|dorongan banteng)/i,
			nodes: ['01. LOWERED HEAD', '02. POWERFUL HOOVES', '03. SHARP HORNS', '04. UNSTOPPABLE FORWARD CHARGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes bullPaw { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(12px); } }
    @keyframes hornGleam { 0%, 100% { stroke: #FFFFFF; } 50% { stroke: ${acc}; } }
    .anim-bull-charge { animation: bullPaw 2s ease-in-out infinite; }
    .anim-horn { animation: hornGleam 2s infinite; }
  </style>

  <!-- Dust Ground Horizon -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Speed Dash Vectors -->
  <g stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity="0.6">
    <line x1="180" y1="180" x2="230" y2="180" stroke-dasharray="6,4" />
    <line x1="150" y1="210" x2="210" y2="210" stroke-dasharray="6,4" />
    <line x1="170" y1="240" x2="240" y2="240" stroke-dasharray="6,4" />
  </g>

  <!-- Charging Bull Kinetic Geometry -->
  <g class="anim-bull-charge">
    <!-- Massive Muscular Shoulder Hump -->
    <path d="M 270,220 C 270,160 320,130 380,145 L 430,195 L 420,250 L 350,250 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Powerful Lowered Horns Thrusting Right -->
    <path d="M 400,165 C 440,145 470,115 480,95" fill="none" stroke="${acc}" stroke-width="4.5" stroke-linecap="round" class="anim-horn" />
    <path d="M 390,185 C 430,165 460,135 470,115" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Forelegs In Full Stride -->
    <polyline points="400,240 430,270" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    <polyline points="330,240 310,270" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    
    <!-- Red Hot Eye of Focus -->
    <circle cx="410" cy="180" r="4.5" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'shark_fin',
			name: 'Perpetual Shark & Ocean Dominance',
			title: 'PERPETUAL MOTION PREDATOR',
			tag: '[ NALURI HIU // JANGAN PERNAH BERHENTI BERENANG ]',
			regex: /(hiu|\bshark\b|pantang berhenti berenang|predator laut|sirip hiu|naluri hiu|berenang tanpa henti)/i,
			nodes: ['01. OBLIGATE VENTILATION', '02. ZERO STILLNESS', '03. HYDRODYNAMIC CUT', '04. TOTAL UNDERWATER MASTERY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sharkGlide { 0%, 100% { transform: translateX(-10px) rotate(-1deg); } 50% { transform: translateX(10px) rotate(1deg); } }
    @keyframes seaWave { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-shark-body { animation: sharkGlide 4s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-water { stroke-dasharray: 8,6; animation: seaWave 2s linear infinite; }
  </style>

  <!-- Water Surface Line -->
  <line x1="140" y1="185" x2="560" y2="185" stroke="#FFFFFF" stroke-width="2.5" class="anim-water" />

  <g class="anim-shark-body">
    <!-- Dorsal Fin Breaking Water Surface -->
    <path d="M 330,185 L 360,115 L 385,185" fill="#18181b" stroke="${acc}" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Submerged Torpedo Fuselage Hull -->
    <path d="M 230,225 C 270,185 360,185 460,205 C 410,245 320,245 250,235 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />

    <!-- Crescent Caudal Tail Fin -->
    <path d="M 235,228 L 195,190 M 235,228 L 205,255" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- 5 Gill Slits -->
    <line x1="390" y1="205" x2="390" y2="225" stroke="${acc}" stroke-width="2" />
    <line x1="396" y1="205" x2="396" y2="225" stroke="${acc}" stroke-width="2" />
    <line x1="402" y1="205" x2="402" y2="225" stroke="${acc}" stroke-width="2" />

    <!-- Predatory Eye -->
    <circle cx="435" cy="208" r="3.5" fill="#FFFFFF" />
  </g>

  <!-- Underwater Depth Echo Rings -->
  <path d="M 260,265 Q 350,285 440,265" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cheetah_sprint',
			name: 'Cheetah Sprint & Maximum Velocity',
			title: 'MAXIMUM ACCELERATION',
			tag: '[ SPRINT KILAT CHEETAH // BURST VELOCITY ]',
			regex: /(cheetah|kecepatan lari|akselerasi kilat cheetah|hewan tercepat|kecepatan cheetah|kecepatan maksimal lari)/i,
			nodes: ['01. 0 TO 60 IN 3 SEC', '02. FLEXIBLE SPINE SPRING', '03. NON-RETRACTILE TRACTION', '04. KINETIC SURGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes cheetahBound { 0%, 100% { transform: translateY(0) scaleX(1); } 50% { transform: translateY(-10px) scaleX(1.05); } }
    @keyframes speedLines { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
    .anim-cheetah { animation: cheetahBound 1.5s ease-in-out infinite; transform-origin: 350px 200px; }
    .anim-speed-tail { stroke-dasharray: 6,4; animation: speedLines 1s linear infinite; }
  </style>

  <!-- Motion Blur Wind Groundlines -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <line x1="160" y1="200" x2="240" y2="200" stroke="${acc}" stroke-width="1.8" class="anim-speed-tail" />
  <line x1="180" y1="170" x2="270" y2="170" stroke="${acc}" stroke-width="1.8" class="anim-speed-tail" />

  <!-- Cheetah Silhouette In Mid-Air Full Gallop -->
  <g class="anim-cheetah">
    <!-- Streamlined Aerodynamic Body Core -->
    <path d="M 280,210 Q 340,165 420,185 L 450,180" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    
    <!-- Small Aerodynamic Head & Focused Eye -->
    <ellipse cx="460" cy="180" rx="15" ry="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="466" cy="178" r="3" fill="${acc}" />

    <!-- Forelegs Reaching Forward -->
    <polyline points="420,195 450,225 485,255" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    
    <!-- Hind Legs Compressed Ready To Spring -->
    <polyline points="295,210 260,235 245,265" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />

    <!-- Rudder Balancing Tail -->
    <path d="M 280,210 Q 230,205 210,185" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  </g>

  <!-- Tachometer Velocity Meter -->
  <text x="350" y="130" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="${acc}" text-anchor="middle">120 KM/H BURST</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'butterfly_metamorphosis',
			name: 'Metamorphosis & Chrysalis Rebirth',
			title: 'METAMORPHOSIS & REBIRTH',
			tag: '[ KEPOMPONG KE KUPU-KUPU // TRANSFORMASI RADIKAL ]',
			regex: /(kupu-kupu|metamorfosis|kepompong|transformasi diri|sayap kupu-kupu|keluar dari kepompong|kelahiran kembali)/i,
			nodes: ['01. CRAWLING CATERPILLAR', '02. CHRYSALIS DISSOLUTION', '03. IMAGINAL DISCS', '04. WINGED EMERGENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wingGlow { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px ${acc}55); } 50% { transform: scale(1.06); filter: drop-shadow(0 0 14px ${acc}); } }
    @keyframes cocoonSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(4deg); } }
    .anim-wings-meta { animation: wingGlow 3s ease-in-out infinite; transform-origin: 350px 180px; }
    .anim-cocoon { animation: cocoonSway 3s ease-in-out infinite; transform-origin: 220px 110px; }
  </style>

  <!-- Left: Suspended Chrysalis Cocoon -->
  <g class="anim-cocoon">
    <line x1="180" y1="110" x2="240" y2="110" stroke="#52525B" stroke-width="3" stroke-linecap="round" />
    <line x1="220" y1="110" x2="220" y2="135" stroke="#52525B" stroke-width="2" />
    <path d="M 220,135 C 205,145 205,185 220,205 C 235,185 235,145 220,135 Z" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
    <line x1="210" y1="165" x2="230" y2="165" stroke="${acc}" stroke-width="1.8" stroke-dasharray="2,2" />
    <text x="220" y="225" font-family="'JetBrains Mono', monospace" font-size="9" fill="#71717A" text-anchor="middle">CHRYSALIS</text>
  </g>

  <!-- Transformation Bridge Vector -->
  <path d="M 250,175 L 290,175" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />
  <polygon points="288,171 296,175 288,179" fill="${acc}" />

  <!-- Center/Right: Magnificent Geometric Butterfly -->
  <g class="anim-wings-meta">
    <!-- Slender Butterfly Body -->
    <line x1="390" y1="135" x2="390" y2="225" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    <circle cx="390" cy="130" r="4.5" fill="${acc}" />
    <!-- Antennae -->
    <path d="M 390,130 Q 375,110 370,112 M 390,130 Q 405,110 410,112" fill="none" stroke="${acc}" stroke-width="2" stroke-linecap="round" />

    <!-- Left Geometric Wings -->
    <path d="M 390,150 L 320,115 L 300,165 L 390,185 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <path d="M 390,185 L 315,195 L 335,245 L 390,210 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" stroke-linejoin="round" />

    <!-- Right Geometric Wings -->
    <path d="M 390,150 L 460,115 L 480,165 L 390,185 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <path d="M 390,185 L 465,195 L 445,245 L 390,210 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" stroke-linejoin="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
