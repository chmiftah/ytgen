/**
 * THEME: NATURE & FENOMENA ALAM (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeNature = {
	categoryName: 'nature',
	categoryLabel: '🌿 Fenomena & Lanskap Alam',
	items: [
		{
			id: 'waterfall',
			name: 'Cascading Waterfall & Torrents',
			title: 'KINETIC WATERFALL MOMENTUM',
			tag: '[ CURAHAN AIR TERJUN // ENERGI KINETIK DERAS ]',
			regex: /(air terjun|waterfall|curahan air|aliran deras|jeram air|air jatuh|aliran terjun)/i,
			nodes: ['01. HEADWATER GATHERING', '02. CRESTING PRECIPICE', '03. GRAVITATIONAL PLUMMET', '04. RESONANT BASIN IMPACT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes fallWater { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    @keyframes mistMist { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.1); opacity: 0.8; } }
    .anim-cataract { stroke-dasharray: 6,4; animation: fallWater 1.2s linear infinite; }
    .anim-mist-pool { animation: mistMist 2.5s infinite ease-in-out; transform-origin: 350px 245px; }
  </style>

  <!-- Upper Riverbed Clifftop Line -->
  <line x1="160" y1="120" x2="310" y2="120" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  
  <!-- Right Cliff Face Terrace -->
  <polyline points="390,120 410,120 410,165 480,165 480,250" fill="none" stroke="#52525B" stroke-width="2.5" />

  <!-- Left Sheer Precipice Drop -->
  <polyline points="310,120 310,240 240,240" fill="none" stroke="#52525B" stroke-width="2.5" />

  <!-- Cascading Water Sheet Plunging Down -->
  <g class="anim-cataract" stroke="${acc}" stroke-width="2.5">
    <line x1="320" y1="120" x2="320" y2="245" />
    <line x1="335" y1="120" x2="335" y2="245" stroke="#FFFFFF" stroke-width="3" />
    <line x1="350" y1="120" x2="350" y2="245" />
    <line x1="365" y1="120" x2="365" y2="245" stroke="#FFFFFF" stroke-width="3" />
    <line x1="380" y1="120" x2="380" y2="245" />
  </g>

  <!-- Impact Basin Pool & Rising Mist -->
  <g class="anim-mist-pool">
    <ellipse cx="350" cy="245" rx="60" ry="12" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="330" cy="235" r="4" fill="#FFFFFF" />
    <circle cx="370" cy="235" r="4" fill="#FFFFFF" />
    <circle cx="350" cy="230" r="5" fill="${acc}" />
  </g>

  <!-- Runoff River Below -->
  <line x1="220" y1="260" x2="480" y2="260" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'river_meander',
			name: 'River Meander & Path of Least Resistance',
			title: 'PATH OF LEAST RESISTANCE',
			tag: '[ KELOKAN SUNGAI // MENGUKIR BATU KARANG ]',
			regex: /(sungai|aliran sungai|kelokan sungai|aliran air mengikis batu|arus sungai|meander|sungai berliku)/i,
			nodes: ['01. CONTINUOUS INCLINE', '02. HYDRAULIC GEOMETRY', '03. CANYON CARVING', '04. OCEAN CONVERGENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes riverFlow { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
    @keyframes rockVibrate { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
    .anim-river { stroke-dasharray: 8,6; animation: riverFlow 2s linear infinite; }
  </style>

  <!-- Surrounding Rock Valley Contours -->
  <path d="M 160,110 Q 240,150 200,210 T 220,270" fill="none" stroke="#52525B" stroke-width="2" stroke-dasharray="4,4" />
  <path d="M 540,110 Q 460,150 500,210 T 480,270" fill="none" stroke="#52525B" stroke-width="2" stroke-dasharray="4,4" />

  <!-- S-Curve Winding Meandering River Bed -->
  <!-- Left Bank -->
  <path d="M 330,90 Q 230,150 370,195 Q 470,230 330,275" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
  <!-- Right Bank -->
  <path d="M 370,90 Q 270,150 410,195 Q 510,230 370,275" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />

  <!-- Center Active Current Streamline -->
  <path d="M 350,90 Q 250,150 390,195 Q 490,230 350,275" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" class="anim-river" />

  <!-- Solid Stone Obstacle Being Carved -->
  <circle cx="295" cy="180" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <text x="295" y="184" font-family="'JetBrains Mono', monospace" font-size="8" fill="#71717A" text-anchor="middle">ROCK</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'wind_tornado',
			name: 'Tornado Vortex & Atmospheric Cyclone',
			title: 'CYCLONIC VORTEX FORCE',
			tag: '[ PUSARAN ANGIN // TORNADO VORTEKS ]',
			regex: /(angin puting beliung|tornado|pusaran angin|badai angin|hembusan angin kencang|vorteks|siklon)/i,
			nodes: ['01. THERMAL PRESSURE DIFFERENTIAL', '02. MESOCYCLONE ROTATION', '03. FUNNEL TOUCHDOWN', '04. KINETIC CLEANSING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes spinVortex { 0%, 100% { transform: scaleX(1) rotate(0deg); } 50% { transform: scaleX(0.85) rotate(4deg); } }
    @keyframes touchGround { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
    .anim-tornado { animation: spinVortex 2s ease-in-out infinite; transform-origin: 350px 180px; }
    .anim-touchdown { animation: touchGround 1.5s infinite ease-in-out; }
  </style>

  <!-- Ground Plane Debris Horizon -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Inverted Conical Tornado Funnel Wireframe Rings -->
  <g class="anim-tornado">
    <!-- Ring 1 (Top Cloud Base - Widest) -->
    <ellipse cx="350" cy="95" rx="110" ry="18" fill="none" stroke="#FFFFFF" stroke-width="3" />
    <ellipse cx="350" cy="95" rx="75" ry="12" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="6,4" />

    <!-- Ring 2 -->
    <ellipse cx="350" cy="135" rx="85" ry="14" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    
    <!-- Ring 3 (Middle) -->
    <ellipse cx="350" cy="175" rx="60" ry="11" fill="none" stroke="${acc}" stroke-width="2.5" />
    
    <!-- Ring 4 -->
    <ellipse cx="350" cy="215" rx="35" ry="8" fill="none" stroke="#FFFFFF" stroke-width="2" />

    <!-- Ring 5 (Touchdown Apex Tip) -->
    <g class="anim-touchdown">
      <ellipse cx="350" cy="255" rx="14" ry="4" fill="${acc}" stroke="#FFFFFF" stroke-width="2" />
      <line x1="350" y1="255" x2="350" y2="270" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Spiral Funnel Boundary Lines -->
    <line x1="240" y1="95" x2="336" y2="255" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4,4" />
    <line x1="460" y1="95" x2="364" y2="255" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4,4" />
  </g>

  <!-- Swirling Wind Vector Chevrons -->
  <path d="M 210,130 L 230,120 L 215,140" stroke="${acc}" stroke-width="2" fill="none" />
  <path d="M 490,130 L 470,140 L 485,120" stroke="${acc}" stroke-width="2" fill="none" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'canyon_strata',
			name: 'Grand Canyon Strata & Deep Time',
			title: 'GEOLOGICAL STRATIFICATION',
			tag: '[ NGARAI LEMBAH // KETEGASAN LAPISAN WAKTU ]',
			regex: /(ngarai|lembah curam|jurang canyon|lapisan batu geologi|strata batuan|ngarai terjal|erosi tebing)/i,
			nodes: ['01. SEDIMENTARY LAYERING', '02. TECTONIC UPLIFT', '03. RELENTLESS EROSION', '04. TIME-TESTED MAJESTY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes strataGleam { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; } }
    .anim-strata { animation: strataGleam 3s infinite ease-in-out; }
  </style>

  <!-- Left Stepped Canyon Wall Terraces -->
  <polyline points="140,90 240,90 240,130 200,130 200,170 270,170 270,220 230,220 230,270" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
  
  <!-- Right Stepped Canyon Wall Terraces -->
  <polyline points="560,90 460,90 460,130 500,130 500,170 430,170 430,220 470,220 470,270" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />

  <!-- Horizontal Sedimentary Strata Lines (Left Wall) -->
  <g class="anim-strata" stroke="${acc}" stroke-width="2">
    <line x1="140" y1="110" x2="240" y2="110" stroke-dasharray="4,3" />
    <line x1="200" y1="150" x2="250" y2="150" />
    <line x1="200" y1="195" x2="270" y2="195" stroke-dasharray="6,4" />
    <line x1="230" y1="245" x2="260" y2="245" />
  </g>

  <!-- Horizontal Sedimentary Strata Lines (Right Wall) -->
  <g class="anim-strata" stroke="${acc}" stroke-width="2">
    <line x1="460" y1="110" x2="560" y2="110" stroke-dasharray="4,3" />
    <line x1="450" y1="150" x2="500" y2="150" />
    <line x1="430" y1="195" x2="500" y2="195" stroke-dasharray="6,4" />
    <line x1="440" y1="245" x2="470" y2="245" />
  </g>

  <!-- Deep Canyon Floor River Below -->
  <path d="M 330,270 Q 350,250 370,270" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
  <line x1="230" y1="270" x2="470" y2="270" stroke="#3f3f46" stroke-width="2" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'glacier_ice',
			name: 'Glacial Movement & Unstoppable Momentum',
			title: 'GLACIAL COMPOUND MOMENTUM',
			tag: '[ GLETSER ABADI // GERAK LAMBAT TAK TERBENDUNG ]',
			regex: /(gletser|lapisan es abadi|lelehan es|pergerakan gletser|es abadi|bongkahan es|kekuatan gletser)/i,
			nodes: ['01. SNOWFALL COMPACTION', '02. DENSE BLUE ICE', '03. MILLIMETER ACCUMULATION', '04. VALLEY-RESHAPING FORCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes glacierCreep { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
    @keyframes crevasseGlow { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 1; } }
    .anim-glacier-front { animation: glacierCreep 3s ease-in-out infinite; }
    .anim-crevasse { animation: crevasseGlow 2s infinite ease-in-out; }
  </style>

  <!-- Bedrock Valley Trough -->
  <polyline points="140,240 260,265 480,265 560,220" fill="none" stroke="#52525B" stroke-width="2.5" />

  <!-- Massive Glacier Ice Body -->
  <g class="anim-glacier-front">
    <polygon points="180,120 440,150 430,250 240,250" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Sharp Glacial Crevasses -->
    <path d="M 280,135 L 290,190 L 285,240" fill="none" stroke="${acc}" stroke-width="2.5" class="anim-crevasse" />
    <path d="M 350,140 L 360,185 L 345,235" fill="none" stroke="${acc}" stroke-width="2.5" class="anim-crevasse" />
    <path d="M 400,145 L 395,200" fill="none" stroke="#FFFFFF" stroke-width="1.8" />

    <!-- Terminal Moraine Debris Pushed Forward -->
    <polygon points="430,250 460,240 450,265" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="460" cy="255" r="3.5" fill="${acc}" />
  </g>

  <!-- Vector of Inexorable Momentum -->
  <line x1="300" y1="200" x2="490" y2="200" stroke="${acc}" stroke-width="2" stroke-dasharray="6,4" />
  <polygon points="490,195 502,200 490,205" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'aurora_borealis',
			name: 'Aurora Borealis & Magnetosphere Ribbon',
			title: 'MAGNETOSPHERIC AURORA',
			tag: '[ PENDAR AURORA BOREALIS // CAHAYA KUTUB ]',
			regex: /(aurora|aurora borealis|cahaya kutub|gelombang cahaya langit|pendar aurora|sinar kutub)/i,
			nodes: ['01. SOLAR WIND PARTICLES', '02. MAGNETIC DEFLECTION', '03. ATOMIC EXCITATION', '04. LUMINESCENT CURTAIN'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes auroraWave1 { 0%, 100% { d: path("M 140,150 Q 240,110 350,150 T 560,130"); } 50% { d: path("M 140,130 Q 240,170 350,130 T 560,160"); } }
    @keyframes auroraWave2 { 0%, 100% { d: path("M 160,180 Q 270,140 370,180 T 540,160"); } 50% { d: path("M 160,160 Q 270,200 370,160 T 540,190"); } }
    .anim-ribbon-1 { animation: auroraWave1 4s ease-in-out infinite; }
    .anim-ribbon-2 { animation: auroraWave2 4s ease-in-out infinite 0.8s; }
  </style>

  <!-- Silhouette Snowy Mountain Horizon Below -->
  <polygon points="140,270 220,230 280,270 370,220 440,270 510,235 560,270" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="2" />

  <!-- Ribbon 1 (Neon White Ribbon) -->
  <path d="M 140,150 Q 240,110 350,150 T 560,130" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" class="anim-ribbon-1" />
  
  <!-- Ribbon 2 (Accent Glow Ribbon) -->
  <path d="M 160,180 Q 270,140 370,180 T 540,160" fill="none" stroke="${acc}" stroke-width="4" stroke-linecap="round" class="anim-ribbon-2" />

  <!-- Vertical Light Spire Curtains Radiating Upward -->
  <g stroke="${acc}" stroke-width="1.5" stroke-dasharray="3,4" opacity="0.6">
    <line x1="220" y1="90" x2="220" y2="160" />
    <line x1="280" y1="80" x2="280" y2="150" />
    <line x1="350" y1="85" x2="350" y2="160" />
    <line x1="420" y1="75" x2="420" y2="155" />
    <line x1="480" y1="90" x2="480" y2="160" />
  </g>

  <!-- Polar Star in Sky -->
  <circle cx="350" cy="65" r="3.5" fill="#FFFFFF" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'rainbow_arc',
			name: 'Prismatic Rainbow & Post-Storm Hope',
			title: 'PRISMATIC POST-STORM ARC',
			tag: '[ BUSUR PELANGI // HARAPAN PASCA BADAI ]',
			regex: /(pelangi|rainbow|busur pelangi|setelah badai terbit pelangi|spektrum pelangi|cahaya pembiasan)/i,
			nodes: ['01. RAIN DROP REFRACTION', '02. CRITICAL ANGLE 42°', '03. SPECTRAL DISPERSION', '04. SERENE TRANSCENDENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes rainbowGlow { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 8px ${acc}); } }
    .anim-rainbow-arc { animation: rainbowGlow 3s infinite ease-in-out; }
  </style>

  <!-- Horizon Line -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Concentric Rainbow Arcs -->
  <g class="anim-rainbow-arc">
    <!-- Outer Arc -->
    <path d="M 200,270 A 150,150 0 0,1 500,270" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <!-- Middle Accent Arc -->
    <path d="M 215,270 A 135,135 0 0,1 485,270" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <!-- Inner Arc -->
    <path d="M 230,270 A 120,120 0 0,1 470,270" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,4" />
  </g>

  <!-- Left Rain Cloud Originating Arc -->
  <g>
    <path d="M 180,265 C 170,250 185,235 205,235 C 215,225 235,225 240,240 C 255,240 260,255 250,265 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <line x1="195" y1="270" x2="190" y2="280" stroke="${acc}" stroke-width="1.8" />
    <line x1="215" y1="270" x2="210" y2="280" stroke="${acc}" stroke-width="1.8" />
  </g>

  <!-- Right Sunshine Illuminating Arc -->
  <g>
    <circle cx="500" cy="245" r="16" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <line x1="500" y1="220" x2="500" y2="210" stroke="${acc}" stroke-width="2" />
    <line x1="525" y1="245" x2="535" y2="245" stroke="${acc}" stroke-width="2" />
    <line x1="518" y1="227" x2="526" y2="219" stroke="${acc}" stroke-width="2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cave_stalactite',
			name: 'Subterranean Cavern & Stalactites',
			title: 'MINERAL SILENT ACCUMULATION',
			tag: '[ KEDALAMAN GUA // TETESAN MINERAL ABADI ]',
			regex: /(\bgua\b|stalaktit|stalagmit|kedalaman gua|endapan mineral gua|batu tetes|ruang gua)/i,
			nodes: ['01. CALCIUM DRIP', '02. CENTURY DEPOSIT', '03. PILLAR CONVERGENCE', '04. TIMELESS SANCTUARY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes dropDrip { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(60px); opacity: 0; } }
    .anim-mineral-drop { animation: dropDrip 2s linear infinite; }
  </style>

  <!-- Cave Ceiling Rock Silhouette -->
  <polyline points="140,100 210,120 280,100 350,115 420,100 490,120 560,100" fill="none" stroke="#FFFFFF" stroke-width="3" />

  <!-- Cave Floor Rock Silhouette -->
  <polyline points="140,270 210,255 280,270 350,260 420,270 490,255 560,270" fill="none" stroke="#FFFFFF" stroke-width="3" />

  <!-- Hanging Stalactites (Ceiling) -->
  <polygon points="210,120 225,120 217,195" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <polygon points="340,115 360,115 350,210" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <polygon points="480,120 495,120 487,185" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Rising Stalagmites (Floor) -->
  <polygon points="210,255 225,255 217,215" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <polygon points="340,260 360,260 350,235" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <polygon points="480,255 495,255 487,220" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Active Mineral Drip Drop in Center Gap -->
  <circle cx="350" cy="214" r="3.5" fill="#FFFFFF" class="anim-mineral-drop" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'geyser_eruption',
			name: 'Geothermal Geyser & High Pressure Blast',
			title: 'GEOTHERMAL HYDRO-PRESSURE',
			tag: '[ GEYSER AIR PANAS // TEKANAN BAWAH TANAH ]',
			regex: /(geiser|geyser|semburan air panas|sumber air panas bumi|tekanan geiser|erupsi geiser)/i,
			nodes: ['01. SUPERHEATED CHAMBER', '02. STEAM CONFINEMENT', '03. HYDROSTATIC RELEASE', '04. COLOSSAL GEYSER PLUME'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes geyserBlast { 0% { stroke-dashoffset: 80; } 100% { stroke-dashoffset: 0; } }
    @keyframes sprayWobble { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.15); } }
    .anim-blast-column { stroke-dasharray: 8,6; animation: geyserBlast 1.2s linear infinite; }
    .anim-plume-spray { animation: sprayWobble 2s ease-in-out infinite; transform-origin: 350px 85px; }
  </style>

  <!-- Geothermal Terrain Vent Surface -->
  <line x1="140" y1="260" x2="310" y2="260" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  <line x1="390" y1="260" x2="560" y2="260" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

  <!-- Fissure Vent Orifice Cone -->
  <path d="M 310,260 L 330,245 L 370,245 L 390,260" fill="none" stroke="${acc}" stroke-width="3" />

  <!-- Superheated Column Blasting Skyward -->
  <g class="anim-blast-column" stroke="${acc}">
    <line x1="338" y1="245" x2="338" y2="105" stroke-width="2.5" />
    <line x1="350" y1="245" x2="350" y2="90" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <line x1="362" y1="245" x2="362" y2="105" stroke-width="2.5" />
  </g>

  <!-- Crown Spray Plume at Apex -->
  <g class="anim-plume-spray">
    <path d="M 350,90 Q 315,60 300,95 M 350,90 Q 385,60 400,95" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="350" cy="85" r="5" fill="${acc}" />
    <circle cx="315" cy="85" r="3.5" fill="#FFFFFF" />
    <circle cx="385" cy="85" r="3.5" fill="#FFFFFF" />
  </g>

  <!-- Subsurface Pressure Chamber Box -->
  <rect x="315" y="275" width="70" height="25" rx="4" fill="#18181b" stroke="#52525B" stroke-width="1.8" stroke-dasharray="3,3" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'dune_drift',
			name: 'Shifting Sand Dunes & Wind Ripples',
			title: 'AEOLIAN SAND RIPPLES',
			tag: '[ RUMPUT GURUN // PERGESERAN PASIR ALAM ]',
			regex: /(bukit pasir bergelombang|pasir tertiup angin|pola riak pasir|pergeseran pasir alam|ombak pasir gurun)/i,
			nodes: ['01. GRAIN SALTATION', '02. CREST EQUILIBRIUM', '03. SHIFTING RIDGE', '04. PERPETUAL TRANSFORMATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes windSweep { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
    .anim-wind-sweep { stroke-dasharray: 6,4; animation: windSweep 2s linear infinite; }
  </style>

  <!-- Aeolian Wind Streams in Sky -->
  <path d="M 160,110 Q 300,90 440,110" fill="none" stroke="${acc}" stroke-width="2" class="anim-wind-sweep" />
  <path d="M 220,135 Q 360,115 500,135" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="4,4" />

  <!-- Primary Sand Dune Crest Ridge -->
  <path d="M 140,230 Q 280,150 420,210 Q 480,240 560,210" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
  
  <!-- Secondary Sand Dune Ridge -->
  <path d="M 140,265 Q 260,205 380,255 Q 460,285 560,260" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />

  <!-- Intricate Micro-Ripples on Dune Flank -->
  <path d="M 240,205 Q 265,195 290,205" fill="none" stroke="#52525B" stroke-width="1.5" />
  <path d="M 255,220 Q 280,210 305,220" fill="none" stroke="#52525B" stroke-width="1.5" />
  <path d="M 330,225 Q 355,215 380,225" fill="none" stroke="#52525B" stroke-width="1.5" />

  <!-- Base Horizon Bed -->
  <line x1="140" y1="280" x2="560" y2="280" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
