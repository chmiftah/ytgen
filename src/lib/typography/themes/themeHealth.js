/**
 * THEME: HEALTH & KESEHATAN (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeHealth = {
	categoryName: 'health',
	categoryLabel: '💪 Kesehatan & Vitalitas',
	items: [
		{
			id: 'barbell',
			name: 'Physical Strength & Ketahanan Beban',
			title: 'PHYSICAL RESISTANCE',
			tag: '[ KETAHANAN FISIK // HYPERTROPHY ]',
			regex: /(barbel|beban berat|gym|angkat beban|kekuatan fisik|workout|fitness|otot|latihan fisik|beban hidup|reps)/i,
			nodes: ['01. MECHANICAL TENSION', '02. MUSCLE BREAKDOWN', '03. METABOLIC ADAPTATION', '04. SUPERCOMPENSATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes barLift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
    @keyframes plateGlow { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 1; } }
    .anim-barbell { animation: barLift 3s ease-in-out infinite; }
    .anim-plate { animation: plateGlow 2s ease-in-out infinite alternate; }
  </style>

  <!-- Ground Horizon & Bench Line -->
  <line x1="140" y1="280" x2="560" y2="280" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <line x1="280" y1="280" x2="280" y2="240" stroke="#52525B" stroke-width="2" />
  <line x1="420" y1="280" x2="420" y2="240" stroke="#52525B" stroke-width="2" />

  <!-- Animated Barbell Assembly -->
  <g class="anim-barbell">
    <!-- Knurled Shaft -->
    <line x1="160" y1="190" x2="540" y2="190" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <line x1="290" y1="190" x2="410" y2="190" stroke="${acc}" stroke-width="2" stroke-dasharray="2,3" />

    <!-- Left Weight Plates Stack -->
    <rect x="180" y="145" width="12" height="90" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" class="anim-plate" />
    <rect x="196" y="130" width="16" height="120" rx="4" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <rect x="216" y="120" width="22" height="140" rx="5" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="205" cy="190" r="4" fill="${acc}" />

    <!-- Right Weight Plates Stack -->
    <rect x="462" y="120" width="22" height="140" rx="5" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <rect x="488" y="130" width="16" height="120" rx="4" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <rect x="508" y="145" width="12" height="90" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" class="anim-plate" />
    <circle cx="495" cy="190" r="4" fill="${acc}" />

    <!-- Center Resistance Arrow Indicator -->
    <path d="M 350,140 L 350,110 M 344,118 L 350,110 L 356,118" stroke="${acc}" stroke-width="2.5" fill="none" stroke-linecap="round" />
  </g>

  <!-- Force Vector Ring -->
  <circle cx="350" cy="190" r="45" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="3,5" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'battery',
			name: 'Energy Reservoir & Kapasitas Daya',
			title: 'BIO-ENERGY RESERVOIR',
			tag: '[ MANAJEMEN VITALITAS // STAMINA ]',
			regex: /(energi tubuh|stamina|vitalitas|daya tahan|baterai energi|fatigue|kelelahan fisik|kurang energi|recharge)/i,
			nodes: ['01. GLYCOGEN STORES', '02. SLEEP RECHARGE', '03. ENERGY EXPENDITURE', '04. ENDURANCE CAPACITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes pulseCharge { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
    @keyframes zapFlicker { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } }
    .anim-charge-1 { animation: pulseCharge 2s infinite 0.2s; }
    .anim-charge-2 { animation: pulseCharge 2s infinite 0.5s; }
    .anim-charge-3 { animation: pulseCharge 2s infinite 0.8s; }
    .anim-charge-4 { animation: pulseCharge 2s infinite 1.1s; }
    .anim-zap { animation: zapFlicker 1.8s ease-in-out infinite; transform-origin: 350px 190px; }
  </style>

  <!-- Battery Outer Casing -->
  <rect x="220" y="130" width="240" height="120" rx="16" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <!-- Battery Anode Tip -->
  <path d="M 460,165 Q 476,165 476,175 L 476,205 Q 476,215 460,215" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />

  <!-- Charge Levels Inside -->
  <rect x="240" y="146" width="40" height="88" rx="6" fill="#FFFFFF" fill-opacity="0.15" stroke="#FFFFFF" stroke-width="1.8" class="anim-charge-1" />
  <rect x="290" y="146" width="40" height="88" rx="6" fill="#FFFFFF" fill-opacity="0.3" stroke="#FFFFFF" stroke-width="1.8" class="anim-charge-2" />
  <rect x="340" y="146" width="40" height="88" rx="6" fill="${acc}" fill-opacity="0.4" stroke="${acc}" stroke-width="2" class="anim-charge-3" />
  <rect x="390" y="146" width="40" height="88" rx="6" fill="${acc}" stroke="${acc}" stroke-width="2" class="anim-charge-4" />

  <!-- Center Lightning Bolt Glyph -->
  <path d="M 356,150 L 334,194 L 352,194 L 340,230 L 368,182 L 350,182 Z" fill="${acc}" class="anim-zap" />

  <!-- Vital Signs Baseline -->
  <line x1="160" y1="280" x2="540" y2="280" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="4,4" />
  <path d="M 160,280 L 260,280 L 275,260 L 290,300 L 305,280 L 540,280" fill="none" stroke="${acc}" stroke-width="2" stroke-linecap="round" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'heart',
			name: 'Cardio Pulse & Resonansi Jantung',
			title: 'CARDIOVASCULAR FLOW',
			tag: '[ DETAK JANTUNG // VITALITAS RESISTEN ]',
			regex: /(detak jantung|kardio|kardiovaskular|denyut nadi|kesehatan jantung|aerobik|degup|heart rate|bpm)/i,
			nodes: ['01. CARDIAC CYCLE', '02. VASCULAR ELASTICITY', '03. VO2 MAX EXPANSION', '04. SYSTEMIC HOMEOSTASIS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.18); } 28% { transform: scale(1); } 42% { transform: scale(1.12); } 70% { transform: scale(1); } }
    @keyframes pulseRing { 0% { r: 50; opacity: 0.8; } 100% { r: 95; opacity: 0; } }
    .anim-heart { animation: heartbeat 1.8s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-pulse-ring { animation: pulseRing 1.8s ease-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Concentric Resonance Echo Rings -->
  <circle cx="350" cy="185" r="50" fill="none" stroke="${acc}" stroke-width="1.5" class="anim-pulse-ring" />
  <circle cx="350" cy="185" r="75" fill="none" stroke="#52525B" stroke-width="1" stroke-dasharray="4,6" />

  <!-- Geometric Minimalist Wireframe Heart -->
  <g class="anim-heart">
    <!-- Heart Shell -->
    <path d="M 350,225 C 290,180 270,130 310,105 C 335,90 350,115 350,115 C 350,115 365,90 390,105 C 430,130 410,180 350,225 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    <!-- Internal Aortic Valve Lines -->
    <path d="M 350,115 L 350,185 M 350,150 L 320,135 M 350,165 L 380,145" stroke="${acc}" stroke-width="2.2" stroke-linecap="round" />
    <circle cx="350" cy="185" r="5" fill="${acc}" />
  </g>

  <!-- Electrocardiogram Pulse Line Bottom -->
  <path d="M 140,285 L 250,285 L 270,285 L 285,250 L 305,320 L 325,275 L 340,290 L 355,285 L 560,285" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="305" cy="320" r="3.5" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'moon',
			name: 'Circadian Deep Sleep & Restorasi',
			title: 'CIRCADIAN DEEP REST',
			tag: '[ RESTORASI SEL // REM SLEEP ]',
			regex: /(tidur nyenyak|deep sleep|pola tidur|ritme sirkadian|istirahat total|pemulihan tubuh|rem sleep|insomnia|lelap)/i,
			nodes: ['01. MELATONIN SURGE', '02. SLOW-WAVE SLEEP', '03. GLYMPHATIC FLUSH', '04. NEURAL CONSOLIDATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes moonFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(4deg); } }
    @keyframes starTwinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
    .anim-moon { animation: moonFloat 4s ease-in-out infinite; transform-origin: 350px 180px; }
    .anim-star-1 { animation: starTwinkle 2.2s infinite ease-in-out; transform-origin: 240px 140px; }
    .anim-star-2 { animation: starTwinkle 2.8s infinite ease-in-out 0.8s; transform-origin: 460px 130px; }
    .anim-star-3 { animation: starTwinkle 2.5s infinite ease-in-out 1.4s; transform-origin: 430px 220px; }
  </style>

  <!-- Ambient Horizon Line -->
  <line x1="140" y1="285" x2="560" y2="285" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Circadian Cycle Wave Arc -->
  <path d="M 160,285 Q 350,110 540,285" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="6,4" />

  <!-- Crescent Moon Wireframe -->
  <g class="anim-moon">
    <path d="M 370,120 A 60,60 0 1,0 370,240 A 45,45 0 0,1 370,120 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    <circle cx="340" cy="180" r="14" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="3,3" />
    <circle cx="340" cy="180" r="4" fill="${acc}" />
  </g>

  <!-- Twinkling Celestial Star Glyphs -->
  <g class="anim-star-1">
    <path d="M 240,130 L 240,150 M 230,140 L 250,140" stroke="${acc}" stroke-width="2" stroke-linecap="round" />
  </g>
  <g class="anim-star-2">
    <path d="M 460,120 L 460,140 M 450,130 L 470,130" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
  </g>
  <g class="anim-star-3">
    <circle cx="430" cy="220" r="3" fill="${acc}" />
  </g>

  <!-- Delta Brain Wave Line -->
  <path d="M 200,285 Q 230,265 260,285 T 320,285 T 380,285 T 440,285 T 500,285" fill="none" stroke="${acc}" stroke-width="2" stroke-linecap="round" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'water_drop',
			name: 'Cellular Hydration & Keseimbangan Cairan',
			title: 'CELLULAR HYDRATION',
			tag: '[ KESEIMBANGAN ELEKTROLIT // DETOKSIFIKASI ]',
			regex: /(hidrasi|minum air|cairan tubuh|detoksifikasi|kebutuhan air|sel tubuh terhidrasi|air putih|osmosis)/i,
			nodes: ['01. WATER INTAKE', '02. CELLULAR ABSORPTION', '03. ELECTROLYTE BALANCE', '04. TOXIN CLEARANCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes dropBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes rippleExpand { 0% { r: 20; opacity: 0.9; } 100% { r: 90; opacity: 0; } }
    .anim-drop { animation: dropBounce 3s ease-in-out infinite; transform-origin: 350px 170px; }
    .anim-ripple { animation: rippleExpand 2.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
  </style>

  <!-- Hydration Ripple Circles -->
  <ellipse cx="350" cy="265" rx="50" ry="16" fill="none" stroke="${acc}" stroke-width="1.8" class="anim-ripple" />
  <ellipse cx="350" cy="265" rx="80" ry="24" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="4,4" />

  <!-- Pure Water Droplet Vessel -->
  <g class="anim-drop">
    <path d="M 350,110 C 350,110 300,180 300,215 C 300,245 322,265 350,265 C 378,265 400,245 400,215 C 400,180 350,110 350,110 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    <!-- Internal Refraction Curve -->
    <path d="M 330,200 C 330,230 342,245 365,245" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="338" cy="170" r="5" fill="#FFFFFF" opacity="0.8" />
  </g>

  <!-- Purity Measuring Scale Lines -->
  <line x1="240" y1="180" x2="270" y2="180" stroke="#52525B" stroke-width="1.5" />
  <line x1="250" y1="210" x2="270" y2="210" stroke="#52525B" stroke-width="1.5" />
  <line x1="430" y1="180" x2="460" y2="180" stroke="#52525B" stroke-width="1.5" />
  <line x1="430" y1="210" x2="450" y2="210" stroke="#52525B" stroke-width="1.5" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'lungs_breath',
			name: 'Diaphragmatic Breathwork & Oksigenasi',
			title: 'PRANIC BREATHWORK',
			tag: '[ OKSIGENASI SISTEMIK // PARU-PARU ]',
			regex: /(pernapasan|paru-paru|tarik napas|oksigen|kapasitas paru|latihan napas|breathwork|hembusan napas|pranayama)/i,
			nodes: ['01. INHALATION', '02. OXYGEN DIFFUSION', '03. VAGUS ACTIVATION', '04. CELLULAR PURITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes lungExpand { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    @keyframes flowAir { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
    .anim-lungs { animation: lungExpand 4s ease-in-out infinite; transform-origin: 350px 190px; }
    .anim-air { stroke-dasharray: 4,4; animation: flowAir 1.5s linear infinite; }
  </style>

  <g class="anim-lungs">
    <!-- Trachea / Windpipe -->
    <line x1="350" y1="100" x2="350" y2="160" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <path d="M 350,160 L 320,185 M 350,160 L 380,185" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Left Lung Lobe -->
    <path d="M 320,185 C 310,185 270,195 265,235 C 260,265 285,285 320,270 C 335,260 335,210 320,185 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <!-- Left Bronchial Tree -->
    <path d="M 315,195 Q 295,220 285,245 M 305,225 Q 315,245 310,260" fill="none" stroke="${acc}" stroke-width="1.8" />

    <!-- Right Lung Lobe -->
    <path d="M 380,185 C 390,185 430,195 435,235 C 440,265 415,285 380,270 C 365,260 365,210 380,185 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <!-- Right Bronchial Tree -->
    <path d="M 385,195 Q 405,220 415,245 M 395,225 Q 385,245 390,260" fill="none" stroke="${acc}" stroke-width="1.8" />
  </g>

  <!-- Inflow/Outflow Air Vectors -->
  <line x1="350" y1="70" x2="350" y2="95" stroke="${acc}" stroke-width="2.5" class="anim-air" />
  <circle cx="350" cy="160" r="4" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cell_mitochondria',
			name: 'Mitochondrial Energy & Rejuvenasi Sel',
			title: 'MITOCHONDRIAL ATP',
			tag: '[ REGENERASI SELULER // ENERGI MURNI ]',
			regex: /(mitokondria|energi seluler|panjang umur|regenerasi sel|longevity|anti-aging|metabolisme sel|atp)/i,
			nodes: ['01. GLUCOSE OXIDATION', '02. ELECTRON TRANSPORT', '03. ATP SYNTHESIS', '04. CELLULAR VITALITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes mitoGlow { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px ${acc}44); } 50% { transform: scale(1.04); filter: drop-shadow(0 0 12px ${acc}88); } }
    @keyframes atpSparks { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
    .anim-mito { animation: mitoGlow 3.5s ease-in-out infinite; transform-origin: 350px 190px; }
    .anim-atp { animation: atpSparks 2s infinite ease-in-out; }
  </style>

  <!-- Cell Cytoplasm Horizon -->
  <circle cx="350" cy="190" r="115" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="6,6" />

  <!-- Mitochondria Outer Double Membrane Capsule -->
  <g class="anim-mito">
    <rect x="250" y="140" width="200" height="100" rx="50" fill="#18181b" stroke="#FFFFFF" stroke-width="3" transform="rotate(-15 350 190)" />
    
    <!-- Cristae Inner Folding Membrane -->
    <path d="M 280,185 Q 310,165 330,195 T 370,175 T 410,195" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" transform="rotate(-15 350 190)" />
    <path d="M 300,205 Q 320,185 350,210 T 390,190" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" transform="rotate(-15 350 190)" />
  </g>

  <!-- ATP Molecule Nodes -->
  <g class="anim-atp">
    <circle cx="230" cy="140" r="6" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <circle cx="470" cy="150" r="6" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <circle cx="450" cy="240" r="5" fill="#18181b" stroke="#FFFFFF" stroke-width="1.5" />
    <circle cx="250" cy="250" r="5" fill="#18181b" stroke="#FFFFFF" stroke-width="1.5" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'spine_alignment',
			name: 'Spinal Alignment & Kinetic Chain',
			title: 'BIOMECHANICAL ALIGNMENT',
			tag: '[ KESELARASAN POSTUR // CORE STABILITY ]',
			regex: /(postur tubuh|tulang belakang|postur tegak|ergonomis|keselarasan tubuh|core muscle|tulang punggung|vertebra)/i,
			nodes: ['01. PELVIC TILT', '02. LUMBAR ARCH', '03. THORACIC EXTENSION', '04. CRANIAL EQUILIBRIUM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes plumbVibrate { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
    @keyframes discPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .anim-plumb { animation: plumbVibrate 2s infinite ease-in-out; }
    .anim-vertebra { animation: discPulse 3s infinite ease-in-out; transform-origin: 350px 190px; }
  </style>

  <!-- Plumb Line of Gravity -->
  <line x1="350" y1="90" x2="350" y2="290" stroke="${acc}" stroke-width="1.5" stroke-dasharray="3,3" class="anim-plumb" />

  <!-- Vertebra Stack Architecture -->
  <g class="anim-vertebra">
    <!-- Cranium / Head Base -->
    <ellipse cx="350" cy="100" rx="16" ry="12" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Cervical Vertebrae -->
    <rect x="338" y="120" width="24" height="12" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <rect x="336" y="138" width="28" height="13" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

    <!-- Thoracic Vertebrae & Rib Arc Indicator -->
    <rect x="334" y="157" width="32" height="14" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <path d="M 334,164 Q 280,170 260,200 M 366,164 Q 420,170 440,200" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="4,4" />

    <rect x="332" y="177" width="36" height="15" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <rect x="330" y="198" width="40" height="16" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

    <!-- Lumbar Spine Core -->
    <rect x="328" y="220" width="44" height="18" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <rect x="326" y="244" width="48" height="18" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Sacrum Base -->
    <polygon points="330,268 370,268 350,290" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'gut_brain',
			name: 'Gut-Brain Axis & Mikrobioma',
			title: 'GUT-BRAIN AXIS',
			tag: '[ MIKROBIOM // NEUROTRANSMITTER USUS ]',
			regex: /(mikrobiom|pencernaan|kesehatan usus|nutrisi makanan|usus sehat|gut health|diet bersih|serotonin usus)/i,
			nodes: ['01. NUTRIENT BREAKDOWN', '02. MICROBIAL FLORA', '03. VAGUS NERVE SIGNAL', '04. NEURAL WELLBEING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes nerveSignal { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    @keyframes brainPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .anim-signal { stroke-dasharray: 6,4; animation: nerveSignal 2s linear infinite; }
    .anim-top-brain { animation: brainPulse 3s ease-in-out infinite; transform-origin: 350px 130px; }
  </style>

  <!-- Top: Minimal Brain Lobes -->
  <g class="anim-top-brain">
    <ellipse cx="350" cy="130" rx="36" ry="24" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <path d="M 330,130 Q 350,118 370,130" fill="none" stroke="${acc}" stroke-width="2" />
  </g>

  <!-- Connecting Vagus Nerve Pathway -->
  <path d="M 350,154 L 350,210" stroke="${acc}" stroke-width="2.5" class="anim-signal" />
  <circle cx="350" cy="182" r="3.5" fill="#FFFFFF" />

  <!-- Bottom: Intestinal Helix / Microbiome Loop -->
  <g>
    <path d="M 320,215 Q 350,205 380,215 Q 395,230 380,245 Q 350,255 320,245 Q 305,260 320,275 Q 350,285 380,275" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    
    <!-- Microbiome Microbe Dots -->
    <circle cx="340" cy="230" r="4" fill="${acc}" />
    <circle cx="365" cy="235" r="3" fill="#FFFFFF" />
    <circle cx="335" cy="260" r="3" fill="#52525B" />
    <circle cx="360" cy="265" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cold_ice',
			name: 'Hormetic Cold Plunge & Resiliensi Es',
			title: 'HORMESIS & ICE SHOCK',
			tag: '[ RESILIENSI HORMESIS // COLD PLUNGE ]',
			regex: /(cold plunge|mandi es|terapi dingin|hormesis|adaptasi dingin|daya tahan dingin|ice bath|wim hof)/i,
			nodes: ['01. COLD SHOCK ENTRY', '02. VASOCONSTRICTION', '03. NOREPINEPHRINE SPIKE', '04. METABOLIC RESILIENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes crystalSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes waterShiver { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
    .anim-ice-crystal { animation: crystalSpin 18s linear infinite; transform-origin: 350px 170px; }
    .anim-water-level { animation: waterShiver 2s ease-in-out infinite; }
  </style>

  <!-- Ice Plunge Tub Frame -->
  <path d="M 230,190 L 250,270 L 450,270 L 470,190" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Water Fill Level -->
  <line x1="240" y1="210" x2="460" y2="210" stroke="${acc}" stroke-width="2" class="anim-water-level" />

  <!-- Minimalist Snowflake / Ice Crystal Wireframe -->
  <g class="anim-ice-crystal">
    <!-- 6-Axis Crystal Spines -->
    <line x1="350" y1="130" x2="350" y2="210" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="315" y1="150" x2="385" y2="190" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="315" y1="190" x2="385" y2="150" stroke="#FFFFFF" stroke-width="2.5" />
    <!-- Outer Chevron Tips -->
    <path d="M 342,142 L 350,135 L 358,142" stroke="${acc}" stroke-width="2" fill="none" />
    <path d="M 342,198 L 350,205 L 358,198" stroke="${acc}" stroke-width="2" fill="none" />
    <circle cx="350" cy="170" r="5" fill="${acc}" />
  </g>

  <!-- Ice Temperature Metric -->
  <text x="350" y="250" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">3°C</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
