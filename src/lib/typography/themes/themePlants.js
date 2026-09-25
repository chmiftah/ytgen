/**
 * THEME: PLANTS & TUMBUHAN (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themePlants = {
	categoryName: 'plants',
	categoryLabel: '🌱 Tumbuhan & Kehidupan Botani',
	items: [
		{
			id: 'seed_sprout',
			name: 'Seed Germination & First Green Shoot',
			title: 'SEED OF MOMENTUM',
			tag: '[ BENIH BERKECAMBAH // PERTUMBUHAN AWAL ]',
			regex: /(benih|biji tanaman|tunas muda|berkecambah|langkah kecil benih|tunas tumbuh|germinasi)/i,
			nodes: ['01. SUBTERRANEAN SLEEP', '02. MOISTURE CRACK', '03. EMBRYONIC SHOOT', '04. SUNLIGHT AWAKENING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sproutRise { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes rootGlow { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 1; } }
    .anim-sprout-shoot { animation: sproutRise 3s ease-in-out infinite; transform-origin: 350px 200px; }
    .anim-seed-roots { animation: rootGlow 2.5s infinite ease-in-out; }
  </style>

  <!-- Soil Demarcation Groundline -->
  <line x1="140" y1="200" x2="560" y2="200" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="540" y="190" font-family="'JetBrains Mono', monospace" font-size="9" fill="#52525B" text-anchor="end">SOIL HORIZON</text>

  <!-- Splitting Underground Seed Hull -->
  <ellipse cx="350" cy="225" rx="18" ry="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="350" y1="211" x2="350" y2="239" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" />

  <!-- Emerging Green Cotyledon Shoot (Breaking Above Ground) -->
  <g class="anim-sprout-shoot">
    <!-- Stem Column -->
    <path d="M 350,211 L 350,145" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />
    
    <!-- Left Leaflet -->
    <path d="M 350,155 C 320,150 310,130 330,120 C 345,115 350,135 350,155 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <!-- Right Leaflet -->
    <path d="M 350,145 C 380,140 390,120 370,110 C 355,105 350,125 350,145 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  </g>

  <!-- Subterranean Radicle Roots -->
  <g class="anim-seed-roots" stroke="#52525B" stroke-width="2" stroke-linecap="round">
    <path d="M 350,239 Q 340,260 335,280" />
    <path d="M 350,239 Q 360,260 365,280" />
    <line x1="350" y1="239" x2="350" y2="270" stroke="${acc}" stroke-width="2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'lotus_flower',
			name: 'Lotus Blooming in Murky Water',
			title: 'TRANSCENDENT LOTUS BLOOM',
			tag: '[ TERATAI MEKAR DI LUMPUR // KESUCIAN BATIN ]',
			regex: /(bunga teratai|lotus|mekar di lumpur|teratai mekar|kesucian teratai|bunga mekar murni)/i,
			nodes: ['01. MURKY DEPTHS', '02. UNTAINTED ASCENT', '03. PRISTINE PETALS', '04. SPOTLESS PURITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes petalOpen { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes pondRipple { 0% { rx: 30; opacity: 0.8; } 100% { rx: 85; opacity: 0; } }
    .anim-lotus-core { animation: petalOpen 3.5s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-lotus-ripple { animation: pondRipple 3s ease-out infinite; transform-origin: 350px 245px; }
  </style>

  <!-- Murky Pond Surface Baseline -->
  <line x1="140" y1="245" x2="560" y2="245" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <ellipse cx="350" cy="245" rx="55" ry="12" fill="none" stroke="${acc}" stroke-width="1.5" class="anim-lotus-ripple" />

  <!-- Lotus Pad Floating -->
  <ellipse cx="260" cy="245" rx="35" ry="8" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <ellipse cx="440" cy="245" rx="35" ry="8" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Lotus Flower Geometry -->
  <g class="anim-lotus-core">
    <!-- Center Lotus Bud Crown -->
    <path d="M 350,115 C 335,145 335,185 350,225 C 365,185 365,145 350,115 Z" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="180" r="4.5" fill="${acc}" />

    <!-- Left Inner Petal -->
    <path d="M 350,225 C 320,205 305,160 325,135 C 335,165 345,195 350,225 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    
    <!-- Right Inner Petal -->
    <path d="M 350,225 C 380,205 395,160 375,135 C 365,165 355,195 350,225 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Left Outer Flared Petal -->
    <path d="M 350,225 C 295,215 270,185 285,165 C 305,185 335,210 350,225 Z" fill="#18181b" stroke="#52525B" stroke-width="2" />
    
    <!-- Right Outer Flared Petal -->
    <path d="M 350,225 C 405,215 430,185 415,165 C 395,185 365,210 350,225 Z" fill="#18181b" stroke="#52525B" stroke-width="2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'bamboo_resilience',
			name: 'Bending Bamboo & Unbreakable Resilience',
			title: 'HOLLOW BAMBOO RESILIENCE',
			tag: '[ FLEKSIBILITAS BAMBU // MENUNDUK TAK PATAH ]',
			regex: /(bambu|bamboo|kelenturan bambu|batang bambu|bambu ditiup angin|fleksibilitas bambu|kelenturan tanpa patah)/i,
			nodes: ['01. HOLLOW CENTER', '02. FIBROUS INTERNODES', '03. FLEX UNDER GALE', '04. RESILIENT SNAPBACK'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes windGale { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(14deg); } }
    .anim-bamboo-stalk { animation: windGale 3s ease-in-out infinite; transform-origin: 350px 270px; }
  </style>

  <!-- Ground Line -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Gale Wind Vector Arrows Left To Right -->
  <path d="M 180,140 L 260,140 M 250,135 L 260,140 L 250,145" stroke="${acc}" stroke-width="2" fill="none" opacity="0.6" />
  <path d="M 150,180 L 230,180 M 220,175 L 230,180 L 220,185" stroke="${acc}" stroke-width="2" fill="none" opacity="0.6" />

  <!-- Resilient Bamboo Stalk In Wind -->
  <g class="anim-bamboo-stalk">
    <!-- Segment 1 (Base) -->
    <line x1="350" y1="270" x2="350" y2="225" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />
    <line x1="342" y1="225" x2="358" y2="225" stroke="${acc}" stroke-width="3" stroke-linecap="round" />

    <!-- Segment 2 (Mid-Lower) -->
    <line x1="350" y1="225" x2="350" y2="175" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <line x1="343" y1="175" x2="357" y2="175" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <!-- Branchlet Node -->
    <path d="M 350,175 Q 380,165 400,175" fill="none" stroke="#FFFFFF" stroke-width="2" />
    <ellipse cx="405" cy="175" rx="8" ry="3" fill="${acc}" transform="rotate(15 405 175)" />

    <!-- Segment 3 (Mid-Upper) -->
    <line x1="350" y1="175" x2="350" y2="125" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <line x1="344" y1="125" x2="356" y2="125" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <!-- Branchlet Node -->
    <path d="M 350,125 Q 320,115 300,125" fill="none" stroke="#FFFFFF" stroke-width="2" />
    <ellipse cx="295" cy="125" rx="8" ry="3" fill="#FFFFFF" transform="rotate(-15 295 125)" />

    <!-- Segment 4 (Crown) -->
    <line x1="350" y1="125" x2="350" y2="80" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <ellipse cx="345" cy="75" rx="10" ry="3" fill="${acc}" transform="rotate(-30 345 75)" />
    <ellipse cx="355" cy="75" rx="10" ry="3" fill="#FFFFFF" transform="rotate(30 355 75)" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'vine_creeper',
			name: 'Climbing Ivy & Upward Leverage',
			title: 'UPWARD LEVERAGED CLIMB',
			tag: '[ SULUR TANAMAN MERAMBAT // MENCARI CELAH ]',
			regex: /(tanaman merambat|sulur tanaman|ivy|merambat ke atas|sulur rambat|tanaman panjat)/i,
			nodes: ['01. TENDRIL EXPLORATION', '02. MICRO-ANCHORING', '03. LIGNIN ADHESION', '04. SUMMIT CANOPY REACH'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes vineGrowth { 0% { stroke-dashoffset: 80; } 100% { stroke-dashoffset: 0; } }
    .anim-vine-stalk { stroke-dasharray: 8,4; animation: vineGrowth 2.5s linear infinite; }
  </style>

  <!-- Central Supporting Pillar Pillar Frame -->
  <rect x="330" y="85" width="40" height="190" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
  <line x1="140" y1="275" x2="560" y2="275" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Twining Helix Ivy Vine Climbing Pillar -->
  <path d="M 330,270 Q 370,240 330,210 Q 370,180 330,150 Q 370,120 350,90" fill="none" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" class="anim-vine-stalk" />

  <!-- Alternating Heart-Shaped Ivy Leaves -->
  <!-- Leaf 1 -->
  <path d="M 360,230 C 375,225 390,235 385,250 C 375,245 365,240 360,230 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <!-- Leaf 2 -->
  <path d="M 335,195 C 315,190 305,205 315,220 C 325,210 330,205 335,195 Z" fill="#18181b" stroke="${acc}" stroke-width="2" />
  <!-- Leaf 3 -->
  <path d="M 365,160 C 385,155 395,170 385,180 C 375,175 370,170 365,160 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <!-- Leaf 4 (Apex Peak) -->
  <path d="M 335,125 C 315,120 310,135 320,145 C 325,140 330,135 335,125 Z" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Tendril Reach At Top -->
  <path d="M 350,90 Q 350,70 360,65" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="360" cy="65" r="3.5" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'leaf_photosynthesis',
			name: 'Photosynthesis & Solar Energy Conversion',
			title: 'SOLAR PHOTOSYNTHESIS',
			tag: '[ FOTOSINTESIS SELULER // ENERGI SURYA ]',
			regex: /(fotosintesis|klorofil|daun hijau|tulang daun|energi surya tanaman|proses fotosintesis)/i,
			nodes: ['01. PHOTON CAPTURE', '02. CHLOROPLAST EXCITEMENT', '03. H2O WATER SPLIT', '04. GLUCOSE BIOSYNTHESIS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sunBeam { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    @keyframes veinGlow { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 1; } }
    .anim-sun-beam { stroke-dasharray: 6,4; animation: sunBeam 1.5s linear infinite; }
    .anim-veins { animation: veinGlow 2.5s infinite ease-in-out; }
  </style>

  <!-- Incoming Sunlight Photons Top Left -->
  <g stroke="${acc}" stroke-width="2.5" class="anim-sun-beam">
    <line x1="200" y1="90" x2="270" y2="140" />
    <line x1="230" y1="75" x2="300" y2="125" />
  </g>
  <circle cx="180" cy="70" r="18" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Large Geometric Leaf Profile -->
  <g>
    <!-- Outer Leaf Perimeter Shell -->
    <path d="M 240,240 C 240,140 350,110 460,110 C 460,210 350,240 240,240 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Central Main Vein (Midrib) -->
    <line x1="240" y1="240" x2="460" y2="110" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />

    <!-- Lateral Secondary Veins -->
    <g class="anim-veins" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round">
      <line x1="300" y1="205" x2="295" y2="160" />
      <line x1="350" y1="175" x2="350" y2="135" />
      <line x1="400" y1="145" x2="410" y2="120" />
      <line x1="350" y1="175" x2="385" y2="200" />
      <line x1="300" y1="205" x2="330" y2="230" />
    </g>

    <!-- Petiole / Stem Base -->
    <path d="M 240,240 L 210,260" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
  </g>

  <!-- Chemical Conversion Formula Label -->
  <text x="350" y="280" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">6CO2 + 6H2O → C6H12O6 + 6O2</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'mycelium_network',
			name: 'Subterranean Mycelium & Forest Symbiosis',
			title: 'MYCELIAL NEURAL WEB',
			tag: '[ JARINGAN MISELIUM // SIMBIOSIS BAWAH TANAH ]',
			regex: /(miselium|jamur|jaringan akar jamur|spora jamur|mycelium network|simbiosis hutan|akar miselium)/i,
			nodes: ['01. SPORE INOCULATION', '02. HYPHAL EXPANSION', '03. INTER-TREE NUTRIENT PROTOCOL', '04. FOREST-WIDE EQUILIBRIUM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sporePulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
    .anim-hyphae { animation: sporePulse 2.5s infinite ease-in-out; }
  </style>

  <!-- Soil Layer Horizon -->
  <line x1="140" y1="165" x2="560" y2="165" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Fruiting Mushroom Bodies Above Ground -->
  <g>
    <!-- Mushroom 1 -->
    <path d="M 270,165 L 270,135 M 250,135 C 250,110 290,110 290,135 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="270" cy="125" r="3" fill="${acc}" />

    <!-- Mushroom 2 (Center Major) -->
    <path d="M 350,165 L 350,115 M 325,115 C 325,85 375,85 375,115 Z" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="102" r="3.5" fill="#FFFFFF" />

    <!-- Mushroom 3 -->
    <path d="M 430,165 L 430,140 M 415,140 C 415,120 445,120 445,140 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- Vast Subterranean Hyphae Mesh Network Below Ground -->
  <g class="anim-hyphae" stroke="${acc}" stroke-width="1.8">
    <line x1="270" y1="165" x2="310" y2="210" />
    <line x1="350" y1="165" x2="310" y2="210" />
    <line x1="350" y1="165" x2="390" y2="210" />
    <line x1="430" y1="165" x2="390" y2="210" />
    <line x1="310" y1="210" x2="350" y2="250" />
    <line x1="390" y1="210" x2="350" y2="250" />
    <line x1="310" y1="210" x2="240" y2="240" stroke="#FFFFFF" />
    <line x1="390" y1="210" x2="460" y2="240" stroke="#FFFFFF" />
  </g>

  <!-- Mycelial Synapse Dots -->
  <circle cx="310" cy="210" r="5" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="390" cy="210" r="5" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="350" cy="250" r="6" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cactus_succulent',
			name: 'Desert Cactus & Extreme Drought Endurance',
			title: 'DROUGHT-PROOF ENDURANCE',
			tag: '[ KAKTUS GURUN // BERTAHAN DI TANAH KERING ]',
			regex: /(kaktus|sukulen|duri kaktus|tanaman gurun|daya tahan kaktus|menyimpan air|ketahanan kaktus)/i,
			nodes: ['01. SHALLOW EXPANSIVE ROOTS', '02. ACCORDION FLESH PLEATS', '03. SPUR-DEFENSIVE THORNS', '04. CAM CRASSULACEAN NIGHT BREATH'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes spineSparkle { 0%, 100% { stroke: #FFFFFF; } 50% { stroke: ${acc}; } }
    .anim-spines { animation: spineSparkle 2s infinite; }
  </style>

  <!-- Arid Desert Ground Surface -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Blazing Desert Sun -->
  <circle cx="470" cy="110" r="24" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="470" cy="110" r="34" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="4,4" />

  <!-- Saguaro Cactus Body Structure -->
  <g>
    <!-- Main Center Stem -->
    <path d="M 330,265 L 330,120 C 330,105 370,105 370,120 L 370,265" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    <!-- Vertical Accordion Pleat Line -->
    <line x1="350" y1="110" x2="350" y2="265" stroke="${acc}" stroke-width="2.5" stroke-dasharray="4,3" />

    <!-- Left Arm -->
    <path d="M 330,205 L 290,205 C 275,205 275,170 275,150 C 275,135 295,135 295,150 L 295,185 L 330,185" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />

    <!-- Right Arm -->
    <path d="M 370,185 L 405,185 C 420,185 420,150 420,130 C 420,115 400,115 400,130 L 400,165 L 370,165" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
  </g>

  <!-- Protective Spines Cluster -->
  <g class="anim-spines" stroke-width="2">
    <line x1="320" y1="140" x2="328" y2="140" />
    <line x1="372" y1="140" x2="380" y2="140" />
    <line x1="320" y1="170" x2="328" y2="170" />
    <line x1="372" y1="170" x2="380" y2="170" />
    <line x1="267" y1="150" x2="274" y2="150" />
    <line x1="421" y1="130" x2="428" y2="130" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'sunflower_heliotropism',
			name: 'Sunflower Heliotropism & Relentless Light',
			title: 'HELIOTROPIC PERSISTENCE',
			tag: '[ BUNGA MATAHARI // MENGEJAR CAHAYA ]',
			regex: /(bunga matahari|heliotropisme|bunga menghadap matahari|mengikuti cahaya|mengejar cahaya)/i,
			nodes: ['01. CIRCADIAN CLOCK CALIBRATION', '02. EASTWARD MORNING TILT', '03. WESTWARD AFTERNOON TRACK', '04. NIGHTTIME RESET TO EAST'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes trackSun { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(12deg); } }
    @keyframes sunSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-sunflower-head { animation: trackSun 4s ease-in-out infinite; transform-origin: 350px 180px; }
    .anim-sun-source { animation: sunSpin 20s linear infinite; transform-origin: 460px 95px; }
  </style>

  <!-- Ground Plane Baseline -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Radiant Target Sun In Sky -->
  <g class="anim-sun-source">
    <circle cx="460" cy="95" r="22" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <line x1="460" y1="65" x2="460" y2="55" stroke="${acc}" stroke-width="2" />
    <line x1="460" y1="125" x2="460" y2="135" stroke="${acc}" stroke-width="2" />
    <line x1="430" y1="95" x2="420" y2="95" stroke="${acc}" stroke-width="2" />
    <line x1="490" y1="95" x2="500" y2="95" stroke="${acc}" stroke-width="2" />
  </g>

  <!-- Sunflower Plant -->
  <line x1="350" y1="270" x2="350" y2="180" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <!-- Leaves on Stem -->
  <ellipse cx="320" cy="225" rx="20" ry="7" fill="#18181b" stroke="#52525B" stroke-width="2" transform="rotate(-15 320 225)" />
  <ellipse cx="380" cy="210" rx="20" ry="7" fill="#18181b" stroke="#52525B" stroke-width="2" transform="rotate(15 380 210)" />

  <!-- Sunflower Head Tilted Toward Light -->
  <g class="anim-sunflower-head">
    <!-- Center Seed Disc Fibonacci Grid -->
    <circle cx="350" cy="140" r="28" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="140" r="16" fill="#18181b" stroke="${acc}" stroke-width="2" stroke-dasharray="3,3" />
    <circle cx="350" cy="140" r="5" fill="${acc}" />

    <!-- Radiant Petals Ring -->
    <g stroke="${acc}" stroke-width="2.5" stroke-linecap="round">
      <line x1="350" y1="110" x2="350" y2="98" />
      <line x1="350" y1="170" x2="350" y2="182" />
      <line x1="320" y1="140" x2="308" y2="140" />
      <line x1="380" y1="140" x2="392" y2="140" />
      <line x1="328" y1="118" x2="320" y2="110" />
      <line x1="372" y1="118" x2="380" y2="110" />
      <line x1="328" y1="162" x2="320" y2="170" />
      <line x1="372" y1="162" x2="380" y2="170" />
    </g>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'wheat_harvest',
			name: 'Golden Wheat Sheaf & Diligent Harvest',
			title: 'THE DILIGENT HARVEST',
			tag: '[ BULIR GANDUM // MENIKMATI HASIL JERIH PAYAH ]',
			regex: /(gandum|bulir gandum|ladang gandum|panen melimpah|menuai hasil tanam|jerih payah panen)/i,
			nodes: ['01. SEED IN HARD SOIL', '02. SEASONAL NURTURE', '03. HEAVY GOLDEN SPIKELETS', '04. BREAD OF FREEDOM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sheafSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(3deg); } }
    @keyframes grainGlow { 0%, 100% { stroke: #FFFFFF; } 50% { stroke: ${acc}; } }
    .anim-wheat-sheaf { animation: sheafSway 3.5s ease-in-out infinite; transform-origin: 350px 260px; }
    .anim-spikelet { animation: grainGlow 2.5s infinite ease-in-out; }
  </style>

  <!-- Harvest Field Horizon -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <g class="anim-wheat-sheaf">
    <!-- Main Center Wheat Stalk -->
    <line x1="350" y1="265" x2="350" y2="110" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    
    <!-- Left Stalk Bend -->
    <path d="M 350,265 Q 320,190 310,130" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    
    <!-- Right Stalk Bend -->
    <path d="M 350,265 Q 380,190 390,130" fill="none" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Center Spikelets Heads (Bulir Gandum) -->
    <g class="anim-spikelet">
      <ellipse cx="343" cy="115" rx="5" ry="9" fill="${acc}" transform="rotate(-20 343 115)" />
      <ellipse cx="357" cy="115" rx="5" ry="9" fill="${acc}" transform="rotate(20 357 115)" />
      <ellipse cx="343" cy="135" rx="5" ry="9" fill="#18181b" stroke="#FFFFFF" stroke-width="2" transform="rotate(-20 343 135)" />
      <ellipse cx="357" cy="135" rx="5" ry="9" fill="#18181b" stroke="#FFFFFF" stroke-width="2" transform="rotate(20 357 135)" />
      <ellipse cx="343" cy="155" rx="5" ry="9" fill="${acc}" transform="rotate(-20 343 155)" />
      <ellipse cx="357" cy="155" rx="5" ry="9" fill="${acc}" transform="rotate(20 357 155)" />
      <ellipse cx="350" cy="98" rx="4" ry="8" fill="#FFFFFF" />
    </g>

    <!-- Tied Sheaf Ribbon Knot Center -->
    <rect x="338" y="215" width="24" height="14" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <line x1="338" y1="222" x2="362" y2="222" stroke="#FFFFFF" stroke-width="1.8" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'bonsai_mastery',
			name: 'Cultivated Bonsai & Deliberate Pruning',
			title: 'THE ART OF PRUNING',
			tag: '[ SENI BONSAI // ELIMINASI UNTUK KEINDAHAN ]',
			regex: /(bonsai|seni bonsai|memangkas dahan|pohon kerdil|kesabaran memelihara tanaman|pot bonsai)/i,
			nodes: ['01. DELIBERATE CONTORTION', '02. RUTHLESS PRUNING', '03. SHALLOW POT MASTERY', '04. TIMELESS CHARACTER'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes bonsaiGleam { 0%, 100% { stroke-opacity: 0.7; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 6px ${acc}66); } }
    .anim-bonsai-cloud { animation: bonsaiGleam 3s infinite ease-in-out; }
  </style>

  <!-- Wooden Table Pedestal Horizon -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Ceramic Bonsai Pot (Shallow Dish) -->
  <polygon points="280,240 420,240 405,265 295,265" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
  <line x1="300" y1="265" x2="300" y2="272" stroke="#FFFFFF" stroke-width="3" />
  <line x1="400" y1="265" x2="400" y2="272" stroke="#FFFFFF" stroke-width="3" />

  <!-- Contorted Gnarled Ancient Trunk -->
  <path d="M 350,240 Q 320,200 370,175 Q 390,155 350,135" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />
  <path d="M 370,175 Q 410,165 430,175" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  <path d="M 335,190 Q 290,185 270,195" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

  <!-- Pruned Foliage Cloud Pads -->
  <!-- Top Center Cloud -->
  <g class="anim-bonsai-cloud">
    <ellipse cx="350" cy="120" rx="35" ry="12" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="350" cy="120" r="4" fill="${acc}" />
  </g>

  <!-- Left Cloud Pad -->
  <ellipse cx="265" cy="190" rx="28" ry="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

  <!-- Right Cloud Pad -->
  <ellipse cx="435" cy="170" rx="30" ry="11" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
