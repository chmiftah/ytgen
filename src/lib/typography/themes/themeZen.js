/**
 * THEME: ZEN, TAOISM & EASTERN WISDOM (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeZen = {
	categoryName: 'zen',
	categoryLabel: '🧘 Zen, Taoisme & Ketenangan Batin',
	themeColor: '#34D399', // Emerald/Mint Jade
	items: [
		{
			id: 'enso_circle',
			name: 'Ensō Circle & The Art of Imperfection',
			title: 'ENSO CIRCLE OF VOID',
			tag: '[ LINGKARAN ENSO // KEKOSONGAN & KESEMPURNAAN ]',
			regex: /(lingkaran enso|enso|zen|wabi sabi|ketenangan zen|lingkaran tak sempurna|hampa)/i,
			nodes: ['01. EMPTY MIND MU', '02. SINGLE EXHALED STROKE', '03. UNCLOSED VOID', '04. WHOLENESS IN IMPERFECTION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes ensoBreathe { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px ${acc}44); } 50% { transform: scale(1.04); filter: drop-shadow(0 0 10px ${acc}); } }
    .anim-enso { animation: ensoBreathe 4s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Open Ensō Brush Arc Stroke -->
  <g class="anim-enso">
    <!-- Outer Incomplete Circle with Tapered Gap at 2 o'clock -->
    <path d="M 400,105 C 470,140 480,240 420,290 C 350,340 240,320 205,250 C 175,180 215,95 310,85 C 345,80 375,90 395,100" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
    <path d="M 400,105 C 455,135 465,225 415,275 C 355,320 250,305 215,245 C 185,185 220,105 310,95 C 340,90 370,100 385,110" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="8,4" />
    <!-- Thick Splash Mark at Onset -->
    <circle cx="395" cy="100" r="6" fill="${acc}" />
  </g>

  <!-- Center Character Kanji/Concept Dot -->
  <circle cx="350" cy="185" r="5" fill="${acc}" />
  <text x="350" y="215" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="#71717A" text-anchor="middle" letter-spacing="4">SUNYATA</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'yin_yang_flow',
			name: 'Yin Yang Dualism & Dynamic Equilibrium',
			title: 'TAOIST DYNAMIC EQUILIBRIUM',
			tag: '[ YIN YANG // KESEIMBANGAN DUA KEKUATAN ALAM ]',
			regex: /(yin yang|dualitas hidup|keseimbangan tao|taoisme|harmoni kontradiksi|polaritas hidup)/i,
			nodes: ['01. YIN RECEPTIVITY', '02. YANG ASSERTION', '03. CONVERGING FLUIDITY', '04. PERPETUAL CYCLIC HARMONY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes taoSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-taichi { animation: taoSpin 16s linear infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Surrounding Celestial Aura Ring -->
  <circle cx="350" cy="185" r="120" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="6,6" />

  <!-- Kinetic Rotating Taiji Core -->
  <g class="anim-taichi">
    <!-- Outer Boundary -->
    <circle cx="350" cy="185" r="95" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    
    <!-- Yin Half Filled Black with White Outline S-Curve -->
    <path d="M 350,90 A 47.5,47.5 0 0,1 350,185 A 47.5,47.5 0 0,0 350,280 A 95,95 0 0,1 350,90 Z" fill="${acc}" fill-opacity="0.3" stroke="${acc}" stroke-width="2.5" />
    <path d="M 350,90 A 47.5,47.5 0 0,1 350,185 A 47.5,47.5 0 0,0 350,280" fill="none" stroke="#FFFFFF" stroke-width="3" />

    <!-- Opposite Polarity Seeds -->
    <circle cx="350" cy="137.5" r="12" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="137.5" r="4" fill="${acc}" />

    <circle cx="350" cy="232.5" r="12" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="232.5" r="4" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'torii_gate',
			name: 'Shinto Torii Gate & Threshold of Sacred Mind',
			title: 'TORII SACRED THRESHOLD',
			tag: '[ GERBANG TORII // BATAS ANTARA DUNIAWI & SAKRAL ]',
			regex: /(gerbang torii|torii|kuil jepang|shinto|gerbang suci|ambang pintu sakral)/i,
			nodes: ['01. MUNDANE SANCTUARY BORDER', '02. TWIN CEDAR POSTS', '03. UPWARD KASAGI LINTEL', '04. MINDFUL PASSAGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes toriiGlow { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 6px ${acc}); } }
    .anim-torii { animation: toriiGlow 3s infinite ease-in-out; }
  </style>

  <!-- Paved Sanctuary Approach Stones -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <line x1="310" y1="270" x2="330" y2="210" stroke="#52525B" stroke-width="2" />
  <line x1="390" y1="270" x2="370" y2="210" stroke="#52525B" stroke-width="2" />

  <!-- Twin Upright Pillars (Hashira) -->
  <g stroke="#FFFFFF" stroke-width="4">
    <line x1="280" y1="270" x2="295" y2="90" stroke-linecap="round" />
    <line x1="420" y1="270" x2="405" y2="90" stroke-linecap="round" />
  </g>

  <!-- Stone Foundation Plinths (Kamebara) -->
  <rect x="268" y="255" width="24" height="15" rx="3" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <rect x="408" y="255" width="24" height="15" rx="3" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Secondary Straight Tie-Beam (Nuki) -->
  <line x1="260" y1="130" x2="440" y2="130" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />

  <!-- Upper Curved Main Lintel (Kasagi) with Green/Mint Glow -->
  <g class="anim-torii">
    <path d="M 230,95 Q 350,110 470,95 L 475,80 Q 350,95 225,80 Z" fill="#18181b" stroke="${acc}" stroke-width="3" stroke-linejoin="round" />
    <!-- Center Plaque (Gakuzuka) -->
    <rect x="342" y="98" width="16" height="32" fill="#18181b" stroke="${acc}" stroke-width="2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'singing_bowl',
			name: 'Tibetan Singing Bowl & Harmonic Resonance',
			title: 'TIBETAN ACOUSTIC RESONANCE',
			tag: '[ SINGING BOWL // RESONANSI GELOMBANG MEDITASI ]',
			regex: /(singing bowl|mangkuk tibet|resonansi suara|gelombang mangkuk tibet|nada meditasi|akustik meditatif)/i,
			nodes: ['01. BRASS ALLOY CAST', '02. WOODEN MALLET STRIKE', '03. CONTINUOUS HARMONIC RING', '04. NEURAL ENTRAINMENT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes soundRipples { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 0; } }
    .anim-wave1 { animation: soundRipples 2.4s infinite ease-out; transform-origin: 350px 170px; }
    .anim-wave2 { animation: soundRipples 2.4s infinite ease-out; animation-delay: 0.8s; transform-origin: 350px 170px; }
    .anim-wave3 { animation: soundRipples 2.4s infinite ease-out; animation-delay: 1.6s; transform-origin: 350px 170px; }
  </style>

  <!-- Pillow Cushion Pedestal -->
  <path d="M 270,250 C 270,270 430,270 430,250 C 430,240 270,240 270,250 Z" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Outward Radiating Soundwaves -->
  <ellipse cx="350" cy="170" rx="130" ry="40" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" class="anim-wave1" />
  <ellipse cx="350" cy="170" rx="160" ry="50" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="4,4" class="anim-wave2" />
  <ellipse cx="350" cy="170" rx="190" ry="60" fill="none" stroke="${acc}" stroke-width="1.5" stroke-dasharray="4,4" class="anim-wave3" />

  <!-- Heavy Brass Singing Bowl Silhouette -->
  <g>
    <!-- Deep Parabolic Bowl Body -->
    <path d="M 250,170 C 250,255 450,255 450,170 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <!-- Rim Lip Oval -->
    <ellipse cx="350" cy="170" rx="100" ry="25" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <ellipse cx="350" cy="170" rx="85" ry="18" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
  </g>

  <!-- Wooden Striker/Mallet Resting at Angle -->
  <g transform="translate(430, 130) rotate(25)">
    <rect x="0" y="0" width="14" height="90" rx="5" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="-2" y="60" width="18" height="25" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'stone_stack',
			name: 'Cairn Stone Stack & Fragile Balance',
			title: 'CAIRN STACKED EQUIPOISE',
			tag: '[ TUMPUKAN BATU CAIRN // KESEIMBANGAN GRAVITASI MURNI ]',
			regex: /(tumpukan batu|susunan batu zen|cairn|keseimbangan batu|menumpuk batu|batu seimbang)/i,
			nodes: ['01. BROADBAND FOUNDATION ROCK', '02. SHIFTING CENTER OF MASS', '03. SINGLE CONTACT POINTS', '04. GRAVITATIONAL STILLNESS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes rockSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1deg); } }
    .anim-cairn-top { animation: rockSway 3s ease-in-out infinite; transform-origin: 350px 105px; }
  </style>

  <!-- Riverbed Horizon Ground -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Vertical Plumb Line Coordinate -->
  <line x1="350" y1="65" x2="350" y2="270" stroke="#52525B" stroke-width="1.5" stroke-dasharray="3,3" />

  <!-- 1. Bottom Massive Base Boulder -->
  <ellipse cx="350" cy="255" rx="100" ry="20" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- 2. Second Broad River Pebble -->
  <ellipse cx="350" cy="220" rx="75" ry="18" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="237" r="3" fill="${acc}" />

  <!-- 3. Third Mid Pebble Slightly Offset Left -->
  <ellipse cx="345" cy="185" rx="55" ry="16" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="348" cy="202" r="3" fill="#FFFFFF" />

  <!-- 4. Fourth Upper Oval Rock -->
  <ellipse cx="353" cy="150" rx="38" ry="14" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="166" r="3" fill="${acc}" />

  <!-- 5. Top Pinnacle Keystone Rock (Kinetic Poise) -->
  <g class="anim-cairn-top">
    <ellipse cx="350" cy="115" rx="22" ry="12" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="128" r="3" fill="${acc}" />
    <circle cx="350" cy="95" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'koi_yin_yang',
			name: 'Twin Koi Fish & Circular Pond Orbit',
			title: 'TWIN KOI CIRCULAR VORTEX',
			tag: '[ DUA IKAN KOI // PUTARAN SIKLUS HARMONI KOLAM ]',
			regex: /(ikan koi|koi pond|dua koi|kolam koi|putaran koi|harmoni koi)/i,
			nodes: ['01. HEAD-TO-TAIL ORBIT', '02. FLUID FIN RHYTHM', '03. OPPOSITE COLORATION', '04. EFFORTLESS SWIMMING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes koiSwim { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-koi-vortex { animation: koiSwim 12s linear infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Water Ripple Concentric Circles -->
  <circle cx="350" cy="185" r="115" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />
  <circle cx="350" cy="185" r="50" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="3,3" />

  <g class="anim-koi-vortex">
    <!-- Koi 1 (Top/Right, White Wireframe with Green Accents) -->
    <g transform="translate(350, 185) rotate(0)">
      <!-- Curved Fish Spine -->
      <path d="M 0,-70 C 40,-70 70,-40 70,0" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
      <!-- Fish Head Oval -->
      <ellipse cx="0" cy="-70" rx="14" ry="9" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="-3" cy="-72" r="2" fill="${acc}" />
      <!-- Pectoral Fin -->
      <path d="M 25,-65 C 40,-80 45,-60 30,-50" fill="none" stroke="${acc}" stroke-width="2" />
      <!-- Fluked Tail -->
      <path d="M 70,0 C 90,-10 95,10 70,0" fill="${acc}" stroke="#FFFFFF" stroke-width="1.8" />
    </g>

    <!-- Koi 2 (Bottom/Left, Inverted Orbit) -->
    <g transform="translate(350, 185) rotate(180)">
      <!-- Curved Fish Spine -->
      <path d="M 0,-70 C 40,-70 70,-40 70,0" fill="none" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />
      <!-- Fish Head Oval -->
      <ellipse cx="0" cy="-70" rx="14" ry="9" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
      <circle cx="-3" cy="-72" r="2" fill="#FFFFFF" />
      <!-- Pectoral Fin -->
      <path d="M 25,-65 C 40,-80 45,-60 30,-50" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <!-- Fluked Tail -->
      <path d="M 70,0 C 90,-10 95,10 70,0" fill="#FFFFFF" stroke="${acc}" stroke-width="1.8" />
    </g>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'incense_smoke',
			name: 'Incense Burner & Spiraling Contemplation',
			title: 'ASCENDING CONTEMPLATIVE INCENSE',
			tag: '[ DUPA MEDITASI // ASAP KONTEMPLASI YANG MENINGGI ]',
			regex: /(dupa|incense|asap dupa|aroma meditasi|asap kontemplatif|wewangian hening)/i,
			nodes: ['01. CHESSED ASH BASE', '02. GLOWING AMBER EMBER', '03. SINUOUS SPIRAL WISP', '04. DISSIPATION INTO NOTHINGNESS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes curlSmoke { 0% { stroke-dashoffset: 80; transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { stroke-dashoffset: 0; transform: translateY(-16px); } }
    @keyframes emberGlow { 0%, 100% { fill: ${acc}; } 50% { fill: #FFFFFF; filter: drop-shadow(0 0 6px ${acc}); } }
    .anim-smoke-wisp { stroke-dasharray: 6,4; animation: curlSmoke 4s linear infinite; }
    .anim-ember { animation: emberGlow 2s infinite ease-in-out; }
  </style>

  <!-- Ceramic Censer Burner Bowl -->
  <g transform="translate(300, 220)">
    <!-- Tripod Legs -->
    <line x1="20" y1="40" x2="10" y2="55" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <line x1="80" y1="40" x2="90" y2="55" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <line x1="50" y1="40" x2="50" y2="55" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Round Censer Pot -->
    <path d="M 10,20 C 10,45 90,45 90,20 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <ellipse cx="50" cy="20" rx="42" ry="8" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <ellipse cx="50" cy="20" rx="30" ry="5" fill="none" stroke="#52525B" stroke-width="1.5" />
  </g>

  <!-- Thin Sandalwood Incense Stick -->
  <line x1="350" y1="230" x2="350" y2="175" stroke="#FFFFFF" stroke-width="2.5" />
  <!-- Glowing Burning Ember Tip -->
  <circle cx="350" cy="175" r="4" class="anim-ember" />

  <!-- Sinuous S-Curved Smoke Ribbons Rising -->
  <g class="anim-smoke-wisp">
    <path d="M 350,175 C 330,150 370,120 350,95 C 330,70 365,55 350,40" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 350,175 C 360,155 340,130 355,105 C 365,85 345,65 355,45" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'dharma_wheel',
			name: 'Dharmachakra 8-Spoke Wheel of Noble Truths',
			title: 'EIGHTFOLD DHARMA WHEEL',
			tag: '[ RODA DHARMA // DELAPAN JALUR KEBENARAN MULIA ]',
			regex: /(roda dharma|dharmachakra|delapan jalur mulia|ajaran buddha|hukum sebab akibat|spiritual timur)/i,
			nodes: ['01. RIGHT VIEW & RESOLVE', '02. RIGHT SPEECH & ACTION', '03. RIGHT LIVELIHOOD & EFFORT', '04. RIGHT MINDFULNESS & CONCENTRATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wheelSlowTurn { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-dharma-turn { animation: wheelSlowTurn 20s linear infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Central Hub & Spoke Assembly -->
  <g class="anim-dharma-turn">
    <!-- Outer Rim Tyre -->
    <circle cx="350" cy="185" r="105" fill="#18181b" stroke="#FFFFFF" stroke-width="4" />
    <circle cx="350" cy="185" r="90" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />

    <!-- 8 Spokes Radiating at 45-degree increments -->
    <line x1="350" y1="95" x2="350" y2="275" stroke="#FFFFFF" stroke-width="3" />
    <line x1="260" y1="185" x2="440" y2="185" stroke="#FFFFFF" stroke-width="3" />
    <line x1="286.4" y1="121.4" x2="413.6" y2="248.6" stroke="${acc}" stroke-width="2.5" />
    <line x1="286.4" y1="248.6" x2="413.6" y2="121.4" stroke="${acc}" stroke-width="2.5" />

    <!-- 8 Rim Knobs (Spoke Hub Terminations) -->
    <circle cx="350" cy="80" r="5" fill="${acc}" />
    <circle cx="350" cy="290" r="5" fill="${acc}" />
    <circle cx="245" cy="185" r="5" fill="${acc}" />
    <circle cx="455" cy="185" r="5" fill="${acc}" />
    <circle cx="275" cy="110" r="5" fill="#FFFFFF" />
    <circle cx="425" cy="260" r="5" fill="#FFFFFF" />
    <circle cx="275" cy="260" r="5" fill="#FFFFFF" />
    <circle cx="425" cy="110" r="5" fill="#FFFFFF" />

    <!-- Center Axle Hub -->
    <circle cx="350" cy="185" r="24" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="185" r="10" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'tea_ceremony',
			name: 'Matcha Chawan & Mindful Tea Ceremony',
			title: 'CHADO CEREMONIAL MINDFULNESS',
			tag: '[ SENI TEH JEPANG // KESADARAN SETEGUK DEMI SETEGUK ]',
			regex: /(upacara teh|chado|matcha chawan|seduh teh|seni teh zen|kebijaksanaan secangkir teh)/i,
			nodes: ['01. WATER BOILING VIGOR', '02. BAMBOO CHATAKU WHISK', '03. EMERALD FROTH SURFACING', '04. SACRED SINGLE SIP'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes teaSteam { 0% { transform: translateY(0); opacity: 0.6; } 100% { transform: translateY(-12px); opacity: 0; } }
    .anim-steam { animation: teaSteam 2.5s infinite ease-out; }
  </style>

  <!-- Tatami Mat Floor Grid -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Ceramic Matcha Bowl (Chawan) -->
  <g transform="translate(240, 140)">
    <path d="M 40,70 C 40,120 140,120 140,70 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <ellipse cx="90" cy="70" rx="50" ry="12" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <!-- Foamy Green Liquid Level -->
    <ellipse cx="90" cy="73" rx="42" ry="9" fill="${acc}" fill-opacity="0.25" stroke="${acc}" stroke-width="1.5" />
    <!-- Base Foot (Kōdai) -->
    <rect x="75" y="118" width="30" height="8" rx="2" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Rising Delicate Steam Wisps -->
  <g class="anim-steam">
    <path d="M 320,195 Q 325,175 320,155" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <path d="M 340,195 Q 345,170 340,145" fill="none" stroke="${acc}" stroke-width="2" stroke-linecap="round" />
  </g>

  <!-- Bamboo Whisk (Chasen) Standing to the Right -->
  <g transform="translate(420, 180)">
    <!-- Bamboo Handle -->
    <rect x="10" y="0" width="14" height="35" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="10" y1="20" x2="24" y2="20" stroke="${acc}" stroke-width="2" />
    <!-- Splayed Whisk Tines -->
    <path d="M 10,35 L 2,80 M 14,35 L 10,80 M 17,35 L 17,80 M 20,35 L 24,80 M 24,35 L 32,80" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
    <!-- Tine Spreader Knot -->
    <line x1="5" y1="55" x2="29" y2="55" stroke="${acc}" stroke-width="2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'temple_bell',
			name: 'Bronze Bonshō Bell & Lingering Echo',
			title: 'BONSHŌ TEMPLE RESONANCE',
			tag: '[ LONCENG TEMPEL BONSHŌ // DENGUNG KESADARAN SEJATI ]',
			regex: /(lonceng kuil|bonsho|temple bell|gong kuil|dengung lonceng|dentang lonceng zen)/i,
			nodes: ['01. HEAVY BRONZE DOME', '02. HORIZONTAL WOODEN BEAM', '03. DEEP RESONANT TOLL', '04. LONG ATTENUATED DECAY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes strikerSwing { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(-15deg); } 60% { transform: rotate(8deg); } }
    @keyframes bellDecayRings { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
    .anim-striker { animation: strikerSwing 4s infinite ease-in-out; transform-origin: 470px 70px; }
    .anim-decay { animation: bellDecayRings 2.5s infinite ease-out; transform-origin: 320px 170px; }
  </style>

  <!-- Temple Bell Belfry Roof Beam -->
  <line x1="180" y1="70" x2="480" y2="70" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <rect x="290" y="55" width="60" height="15" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Massive Bonshō Bell Suspended -->
  <g transform="translate(190, 30)">
    <!-- Hanging Ring Bracket -->
    <path d="M 120,40 L 120,60 M 140,40 L 140,60" stroke="#FFFFFF" stroke-width="3" />
    <!-- Bell Barrel Body -->
    <path d="M 90,90 C 90,70 170,70 170,90 L 175,200 C 175,215 85,215 85,200 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    
    <!-- Relief Ribs & Striking Boss Target (Tsuki-za) -->
    <line x1="86" y1="130" x2="174" y2="130" stroke="#52525B" stroke-width="2" />
    <line x1="86" y1="165" x2="174" y2="165" stroke="#52525B" stroke-width="2" />
    <circle cx="155" cy="180" r="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="155" cy="180" r="4" fill="${acc}" />
  </g>

  <!-- Lingering Decay Vibration Rings -->
  <ellipse cx="320" cy="170" rx="90" ry="70" fill="none" stroke="${acc}" stroke-width="1.8" stroke-dasharray="4,4" class="anim-decay" />

  <!-- Suspended Wooden Striking Beam (Shumoku) -->
  <g class="anim-striker">
    <line x1="470" y1="70" x2="470" y2="190" stroke="#52525B" stroke-width="2" stroke-dasharray="3,3" />
    <line x1="410" y1="70" x2="410" y2="190" stroke="#52525B" stroke-width="2" stroke-dasharray="3,3" />
    <!-- Heavy Timber Log -->
    <rect x="380" y="185" width="110" height="24" rx="6" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="390" cy="197" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
