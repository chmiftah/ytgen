/**
 * THEME: EARTH & KOSMOS (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeEarth = {
	categoryName: 'earth',
	categoryLabel: '🌍 Alam, Bumi & Kosmos',
	items: [
		{
			id: 'globe_earth',
			name: 'Wireframe Globe & Orbital Rings',
			title: 'PLANETARY HOMEOSTASIS',
			tag: '[ PALE BLUE DOT // BIOPERIMETER BUMI ]',
			regex: /(\bbumi\b|planet bumi|\bglobe\b|\bdunia\b|bumi pertiwi|biosfer|tata surya bumi)/i,
			nodes: ['01. CRUST EQUILIBRIUM', '02. HYDROSPHERE CYCLE', '03. ATMOSPHERIC SHIELD', '04. BIOSPHERIC UNITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes globeSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes orbitSpin { 0% { transform: rotate(25deg); } 100% { transform: rotate(385deg); } }
    .anim-orbit-ring { animation: orbitSpin 18s linear infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Planetary Sphere Shell -->
  <circle cx="350" cy="185" r="75" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Latitude Ellipses -->
  <ellipse cx="350" cy="185" rx="75" ry="30" fill="none" stroke="#52525B" stroke-width="1.8" />
  <ellipse cx="350" cy="185" rx="75" ry="60" fill="none" stroke="#52525B" stroke-width="1.8" />
  
  <!-- Longitude Prime Meridian Line -->
  <ellipse cx="350" cy="185" rx="35" ry="75" fill="none" stroke="#FFFFFF" stroke-width="2" />
  <line x1="350" y1="110" x2="350" y2="260" stroke="${acc}" stroke-width="2" />

  <!-- Orbital Rings Tilted -->
  <ellipse cx="350" cy="185" rx="105" ry="36" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="8,5" class="anim-orbit-ring" />
  <circle cx="455" cy="185" r="4.5" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'tree',
			name: 'Ancient Oak & Deep Roots Network',
			title: 'ROOTS & EXPANSION',
			tag: '[ AKAR MENGHUNJAM // PERTUMBUHAN ORGANIK ]',
			regex: /(\bpohon\b|\bhutan\b|akar pohon|kanopi pohon|pepohonan|batang pohon|akar tunggang)/i,
			nodes: ['01. DEEP SUBTERRANEAN ROOT', '02. CELLULAR CAMBIUM', '03. CANOPY EXPANSION', '04. PERENNIAL HARVEST'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes leafSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(2deg); } }
    @keyframes rootFeed { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-canopy { animation: leafSway 4s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-root-feed { stroke-dasharray: 4,4; animation: rootFeed 2s linear infinite; }
  </style>

  <!-- Ground Soil Horizon Demarcation -->
  <line x1="140" y1="185" x2="560" y2="185" stroke="#FFFFFF" stroke-width="3" />
  <text x="540" y="175" font-family="'JetBrains Mono', monospace" font-size="9" fill="#52525B" text-anchor="end">GROUND LEVEL</text>

  <!-- Canopy & Upper Branches -->
  <g class="anim-canopy">
    <!-- Main Trunk Upper -->
    <line x1="350" y1="185" x2="350" y2="140" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
    
    <!-- Primary Canopy Branches -->
    <path d="M 350,150 L 300,105 M 350,140 L 350,85 M 350,150 L 400,105" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 300,105 L 270,90 M 300,105 L 320,75" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <path d="M 400,105 L 430,90 M 400,105 L 380,75" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />

    <!-- Canopy Fruit / Foliage Nodes -->
    <circle cx="350" cy="85" r="8" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="270" cy="90" r="6" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <circle cx="430" cy="90" r="6" fill="#18181b" stroke="${acc}" stroke-width="2" />
  </g>

  <!-- Deep Subterranean Roots System -->
  <g>
    <!-- Taproot Center -->
    <path d="M 350,185 L 350,275" stroke="${acc}" stroke-width="4" stroke-linecap="round" class="anim-root-feed" />
    <!-- Lateral Spreading Roots -->
    <path d="M 350,200 Q 300,225 250,260" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 350,200 Q 400,225 450,260" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 350,230 Q 320,255 290,280" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 350,230 Q 380,255 410,280" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'mountain',
			name: 'Apex Peaks & Elevasi Puncak',
			title: 'APEX SUMMIT ELEVATION',
			tag: '[ ELEVASI PUNCAK // THE SUMMIT ]',
			regex: /(gunung|puncak tertinggi|mendaki gunung|lereng terjal|summit|lembah dan puncak|puncak ke puncak)/i,
			nodes: ['01. BASE CAMP COMMENCEMENT', '02. STEEP INCLINE', '03. DEATH ZONE CLARITY', '04. APEX MASTERY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes flagWhip { 0%, 100% { transform: skewX(0deg); } 50% { transform: skewX(-12deg); } }
    @keyframes beaconPulse { 0% { r: 4; opacity: 0.4; } 50% { r: 14; opacity: 1; } 100% { r: 4; opacity: 0.4; } }
    .anim-summit-flag { animation: flagWhip 2s ease-in-out infinite; transform-origin: 350px 95px; }
    .anim-beacon { animation: beaconPulse 2s infinite ease-in-out; }
  </style>

  <!-- Mountain Valley Baseline -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Background Secondary Mountain Ridge -->
  <polygon points="180,270 260,160 340,270" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <polygon points="380,270 460,180 540,270" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Foreground Primary Apex Mountain Peak -->
  <polygon points="210,270 350,95 490,270" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  
  <!-- Snow Cap Ridge Line -->
  <path d="M 350,95 L 350,270" stroke="${acc}" stroke-width="2.5" />
  <polyline points="320,135 350,150 380,135" fill="none" stroke="#FFFFFF" stroke-width="2" />

  <!-- Summit Beacon & Flag -->
  <circle cx="350" cy="95" r="14" fill="none" stroke="${acc}" stroke-width="2" class="anim-beacon" stroke-dasharray="3,3" />
  <circle cx="350" cy="95" r="4" fill="${acc}" />
  <g class="anim-summit-flag">
    <line x1="350" y1="95" x2="350" y2="70" stroke="#FFFFFF" stroke-width="2.5" />
    <polygon points="350,70 368,78 350,86" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'ocean_wave',
			name: 'Great Ocean Wave & Kedalaman Samudra',
			title: 'OCEANIC MOMENTUM',
			tag: '[ GELOMBANG SAMUDRA // KEKUATAN AIR ]',
			regex: /(ombak|gelombang laut|samudra|lautan luas|kedalaman samudra|tsunami|arus laut|ombak besar)/i,
			nodes: ['01. TIDAL SWELL', '02. HYDRAULIC ACCUMULATION', '03. CREST BREAKTHROUGH', '04. OCEANIC EQUILIBRIUM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes waveRoll { 0%, 100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(-8px) scaleY(1.05); } }
    @keyframes foamDrift { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-wave { animation: waveRoll 3.5s ease-in-out infinite; transform-origin: 350px 240px; }
    .anim-foam { stroke-dasharray: 6,4; animation: foamDrift 1.5s linear infinite; }
  </style>

  <!-- Ocean Floor Horizon Line -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Subsurface Pressure Current Arcs -->
  <path d="M 180,250 Q 300,230 420,250" fill="none" stroke="#52525B" stroke-width="1.8" />
  <path d="M 220,265 Q 350,245 480,265" fill="none" stroke="#52525B" stroke-width="1.8" />

  <!-- The Great Minimalist Wave -->
  <g class="anim-wave">
    <!-- Huge Barrel Wave Curve -->
    <path d="M 160,270 C 220,270 280,240 330,170 C 370,110 440,115 425,160 C 410,200 370,185 365,165" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    
    <!-- Wave Under-Swell Line -->
    <path d="M 190,270 C 250,270 300,230 340,180 C 365,145 400,140 390,165" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    
    <!-- Foam Splash Particles at Crest -->
    <circle cx="430" cy="120" r="4.5" fill="${acc}" />
    <circle cx="410" cy="105" r="3.5" fill="#FFFFFF" />
    <circle cx="385" cy="115" r="3.5" fill="${acc}" />
    <circle cx="360" cy="140" r="3" fill="#FFFFFF" />
  </g>

  <!-- Surface Foam Horizon Stream -->
  <line x1="160" y1="270" x2="540" y2="270" stroke="${acc}" stroke-width="2" class="anim-foam" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'black_hole',
			name: 'Singularity Black Hole & Event Horizon',
			title: 'SINGULARITY EVENT HORIZON',
			tag: '[ GRAVITASI MUTLAK // EVENT HORIZON ]',
			regex: /(black hole|lubang hitam|singularity|gravitasi mutlak|horizon peristiwa|ruang hampa|pusaran gravitasi)/i,
			nodes: ['01. MASS COLLAPSE', '02. PHOTON SPHERE', '03. ACCRETION DISK', '04. INFINITE SINGULARITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes spinAccretion { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes corePull { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    .anim-accretion { animation: spinAccretion 16s linear infinite; transform-origin: 350px 185px; }
    .anim-singularity { animation: corePull 3s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Spacetime Warping Grid Lines -->
  <g stroke="#3f3f46" stroke-width="1.2">
    <ellipse cx="350" cy="185" rx="140" ry="40" fill="none" stroke-dasharray="4,6" />
    <ellipse cx="350" cy="185" rx="100" ry="28" fill="none" stroke-dasharray="4,4" />
  </g>

  <!-- Swirling Accretion Disk Rays -->
  <g class="anim-accretion">
    <ellipse cx="350" cy="185" rx="85" ry="22" fill="none" stroke="${acc}" stroke-width="3" stroke-dasharray="8,6" />
    <line x1="265" y1="185" x2="435" y2="185" stroke="${acc}" stroke-width="1.5" stroke-dasharray="3,3" />
    <line x1="350" y1="140" x2="350" y2="230" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3,3" />
  </g>

  <!-- Relativistic Photon Ring -->
  <circle cx="350" cy="185" r="42" fill="none" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Pure Black Core Event Horizon (Singularity) -->
  <g class="anim-singularity">
    <circle cx="350" cy="185" r="32" fill="#09090b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="185" r="6" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'lightning',
			name: 'Kinetic Lightning Bolt & Shockwave',
			title: 'KINETIC LIGHTNING DISCHARGE',
			tag: '[ TEGANGAN TINGGI // PELEPASAN ENERGI ]',
			regex: /(petir|kilat|halilintar|sambaran petir|badai petir|tegangan kilat|sambaran kilat)/i,
			nodes: ['01. POTENTIAL ACCUMULATION', '02. DIELECTRIC BREAKDOWN', '03. STEPPED LEADER', '04. HIGH-VOLTAGE DISCHARGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes lightningZap { 0%, 100% { opacity: 0.9; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
    @keyframes flashAura { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.45; } }
    .anim-bolt { animation: lightningZap 1.5s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-flash { animation: flashAura 1.5s ease-in-out infinite; }
  </style>

  <!-- Atmospheric Ground Line -->
  <line x1="140" y1="275" x2="560" y2="275" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Ambient Electric Cloud Top -->
  <path d="M 280,105 Q 315,90 350,105 Q 385,90 420,105" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" />

  <!-- Background Electric Flash Aura -->
  <polygon points="350,90 320,175 360,175 330,265 400,165 355,165" fill="${acc}" class="anim-flash" />

  <!-- Foreground Sharp Minimalist Lightning Bolt -->
  <g class="anim-bolt">
    <polygon points="350,90 318,175 355,175 325,275 395,165 350,165" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    <!-- Center Core Glow Line -->
    <path d="M 345,100 L 325,170 L 360,170 L 335,260" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
  </g>

  <!-- Impact Point Crater Spark -->
  <ellipse cx="325" cy="275" rx="30" ry="8" fill="none" stroke="${acc}" stroke-width="1.8" stroke-dasharray="3,3" />
  <circle cx="325" cy="275" r="4.5" fill="#FFFFFF" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'volcano',
			name: 'Volcanic Caldera & Magma Fissures',
			title: 'GEOTHERMAL VOLCANIC FORCE',
			tag: '[ ERUPSI MAGMA // TEKANAN BUMI ]',
			regex: /(gunung berapi|magma|erupsi|lahar panas|vulkanik|letusan lahar|kaldera|tekanan magma)/i,
			nodes: ['01. MAGMATIC CHAMBER', '02. PRESSURE ACCRETION', '03. CONDUIT FRACTURE', '04. CATACLYSMIC SURGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes magmaRise { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    @keyframes plumeSway { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .anim-magma { stroke-dasharray: 6,4; animation: magmaRise 1.8s linear infinite; }
    .anim-plume { animation: plumeSway 3s ease-in-out infinite; }
  </style>

  <!-- Volcano Terrain Baseline -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Eruptive Ash Plume Cloud Above Crater -->
  <g class="anim-plume">
    <circle cx="350" cy="110" r="28" fill="#18181b" stroke="#52525B" stroke-width="2" stroke-dasharray="4,4" />
    <circle cx="330" cy="95" r="20" fill="#18181b" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />
    <circle cx="370" cy="95" r="20" fill="#18181b" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />
    <!-- Ejected Lava Sparks -->
    <circle cx="340" cy="80" r="3.5" fill="${acc}" />
    <circle cx="365" cy="75" r="4" fill="${acc}" />
  </g>

  <!-- Truncated Volcanic Cone Profile -->
  <path d="M 200,270 L 320,150 L 380,150 L 500,270" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  
  <!-- Caldera Crater Rim -->
  <ellipse cx="350" cy="150" rx="30" ry="8" fill="#18181b" stroke="${acc}" stroke-width="3" />

  <!-- Central Magma Conduit Vent -->
  <line x1="350" y1="150" x2="350" y2="270" stroke="${acc}" stroke-width="4" stroke-linecap="round" class="anim-magma" />

  <!-- Flank Magma Fissures -->
  <path d="M 330,165 L 290,210 L 270,250" fill="none" stroke="${acc}" stroke-width="2" />
  <path d="M 370,165 L 410,210 L 430,250" fill="none" stroke="${acc}" stroke-width="2" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'desert_oasis',
			name: 'Barren Desert Oasis & Mirage Pool',
			title: 'DESERT MIRAGE OASIS',
			tag: '[ KETAHANAN GURUN // SUMBER AIR HIDUP ]',
			regex: /(gurun pasir|padang pasir|oasis|hamparan gurun|tanah tandus subur|fatamorgana|pasir gurun)/i,
			nodes: ['01. ARID RESILIENCE', '02. SUBTERRANEAN AQUIFER', '03. MIRAGE SANCTUARY', '04. ABUNDANT SURVIVAL'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes poolRipple { 0%, 100% { transform: scaleX(1); opacity: 0.7; } 50% { transform: scaleX(1.08); opacity: 1; } }
    @keyframes palmSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(3deg); } }
    .anim-oasis-pool { animation: poolRipple 3s ease-in-out infinite; transform-origin: 350px 245px; }
    .anim-palm { animation: palmSway 4s ease-in-out infinite; transform-origin: 390px 240px; }
  </style>

  <!-- Desert Horizon Sun -->
  <circle cx="350" cy="115" r="30" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="115" r="42" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="4,6" />

  <!-- Rolling Sand Dunes Wireframe -->
  <path d="M 140,240 Q 230,195 320,235 Q 430,190 560,250" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 140,270 Q 280,240 420,270 Q 500,255 560,270" fill="none" stroke="#52525B" stroke-width="1.8" />

  <!-- Life-Giving Oasis Water Pool -->
  <ellipse cx="330" cy="245" rx="55" ry="14" fill="#18181b" stroke="${acc}" stroke-width="3" class="anim-oasis-pool" />
  <ellipse cx="330" cy="245" rx="35" ry="8" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3,3" />

  <!-- Lone Resilient Palm Tree at Oasis Shore -->
  <g class="anim-palm">
    <path d="M 390,245 Q 405,190 395,150" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <!-- Fronds -->
    <path d="M 395,150 Q 365,140 350,155" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 395,150 Q 425,135 440,150" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 395,150 Q 395,120 405,115" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <circle cx="395" cy="150" r="3" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'meteor_trail',
			name: 'Shooting Star & Hypersonic Meteor Trail',
			title: 'HYPERSONIC METEOR TRAIL',
			tag: '[ METEOR KOSMIK // BINTANG JATUH ]',
			regex: /(meteor|bintang jatuh|komet|jejak meteor|komet kosmik|asteroid|benturan kosmik)/i,
			nodes: ['01. INTERSTELLAR TRAJECTORY', '02. ATMOSPHERIC ENTRY', '03. ABLATION PLASMA', '04. GROUND IMPACT/AWAKENING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes meteorStreak { 0% { transform: translate(30px, -30px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-30px, 30px); opacity: 0; } }
    @keyframes starPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
    .anim-meteor { animation: meteorStreak 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    .anim-twinkle { animation: starPulse 2s infinite ease-in-out; }
  </style>

  <!-- Celestial Horizon Curve -->
  <path d="M 140,280 Q 350,230 560,280" fill="none" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Background Fixed Star Field -->
  <g class="anim-twinkle">
    <circle cx="210" cy="120" r="2" fill="#FFFFFF" />
    <circle cx="280" cy="90" r="3" fill="${acc}" />
    <circle cx="490" cy="110" r="2" fill="#FFFFFF" />
    <circle cx="450" cy="220" r="2.5" fill="${acc}" />
  </g>

  <!-- Hypersonic Diagonal Meteor Streak -->
  <g class="anim-meteor">
    <!-- Meteor Tail Plasma Wake -->
    <line x1="480" y1="80" x2="310" y2="210" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <line x1="470" y1="88" x2="330" y2="210" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <line x1="490" y1="72" x2="370" y2="180" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />

    <!-- Meteor Core Nucleus -->
    <circle cx="300" cy="218" r="14" fill="#18181b" stroke="${acc}" stroke-width="3.5" />
    <circle cx="300" cy="218" r="6" fill="#FFFFFF" />
    
    <!-- Shockwave Bow Ring -->
    <path d="M 285,210 C 280,225 295,235 310,230" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'constellation',
			name: 'Celestial Constellation & Cosmic Map',
			title: 'COSMIC CONSTELLATION MAP',
			tag: '[ RASI BINTANG // PETA KOSMIK ]',
			regex: /(konstelasi|rasi bintang|peta bintang|bintang kejora|astronomi bintang|formasi kosmik|bintang utara|zodiak kosmik)/i,
			nodes: ['01. CELESTIAL ANCHOR', '02. GEOMETRIC ALIGNMENT', '03. LIGHT PROPAGATION', '04. ETERNAL ORIENTATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes starGleam { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px ${acc}66); } 50% { transform: scale(1.25); filter: drop-shadow(0 0 10px ${acc}); } }
    @keyframes chartRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-north-star { animation: starGleam 2.5s infinite ease-in-out; transform-origin: 350px 105px; }
    .anim-astrolabe { animation: chartRotate 40s linear infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Astrolabe Celestial Coordinates Circle -->
  <g class="anim-astrolabe">
    <circle cx="350" cy="185" r="95" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="4,6" />
    <circle cx="350" cy="185" r="70" fill="none" stroke="#3f3f46" stroke-width="1" stroke-dasharray="2,4" />
  </g>

  <!-- Constellation Interconnecting Guide Lines (The Great Dipper / Orion Archetype) -->
  <g stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="4,4">
    <line x1="350" y1="105" x2="270" y2="145" />
    <line x1="270" y1="145" x2="230" y2="210" />
    <line x1="230" y1="210" x2="310" y2="245" />
    <line x1="310" y1="245" x2="410" y2="230" stroke="${acc}" stroke-width="2.5" />
    <line x1="410" y1="230" x2="450" y2="160" />
    <line x1="450" y1="160" x2="350" y2="105" stroke="${acc}" stroke-width="2.5" />
  </g>

  <!-- Star Nodes -->
  <!-- Polaris / Apex Anchor Star -->
  <g class="anim-north-star">
    <circle cx="350" cy="105" r="9" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="105" r="3.5" fill="#FFFFFF" />
  </g>

  <!-- Constellation Stars -->
  <circle cx="270" cy="145" r="6" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="230" cy="210" r="7" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="310" cy="245" r="6" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="410" cy="230" r="8" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="450" cy="160" r="6" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
