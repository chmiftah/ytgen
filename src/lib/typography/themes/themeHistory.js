/**
 * THEME: HISTORY & PERADABAN KUNO (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeHistory = {
	categoryName: 'history',
	categoryLabel: '🏛️ Sejarah & Peradaban Kuno',
	themeColor: '#D4AF37', // Antique Gold
	items: [
		{
			id: 'roman_pillar',
			name: 'Corinthian Roman Pillar & Stoic Bastion',
			title: 'ROMAN FOUNDATIONAL PILLAR',
			tag: '[ PILAR PERADABAN // KEKOKOHAN STOIK ]',
			regex: /(pilar romawi|tiang kokoh|arsitektur romawi|fondasi peradaban|pilar stoik|tiang penyangga)/i,
			nodes: ['01. QUARRIED MARBLE BASE', '02. FLUTED COLUMN SHAFT', '03. CORINTHIAN CAPITAL', '04. TIMELESS ENDURANCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes pillarShine { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; } }
    .anim-pillar { animation: pillarShine 3s infinite ease-in-out; }
  </style>

  <!-- Ground Pedestal Plinth -->
  <line x1="140" y1="275" x2="560" y2="275" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <rect x="290" y="245" width="120" height="25" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <rect x="305" y="230" width="90" height="15" rx="2" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Fluted Column Shaft -->
  <g class="anim-pillar">
    <rect x="315" y="115" width="70" height="115" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <!-- Fluting Grooves -->
    <line x1="330" y1="115" x2="330" y2="230" stroke="${acc}" stroke-width="2" stroke-dasharray="4,2" />
    <line x1="350" y1="115" x2="350" y2="230" stroke="#FFFFFF" stroke-width="2" />
    <line x1="370" y1="115" x2="370" y2="230" stroke="${acc}" stroke-width="2" stroke-dasharray="4,2" />
  </g>

  <!-- Corinthian Capital & Entablature Crown -->
  <polygon points="300,115 400,115 420,85 280,85" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
  <rect x="270" y="70" width="160" height="15" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <!-- Acanthus Leaf Scroll Motifs -->
  <circle cx="310" cy="100" r="5" fill="${acc}" />
  <circle cx="390" cy="100" r="5" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'spartan_helmet',
			name: 'Spartan Helmet & Warrior Discipline',
			title: 'SPARTAN DISCIPLINE',
			tag: '[ HELM SPARTAN // KETAHANAN TANPA SYARAT ]',
			regex: /(spartan|helm spartan|prajurit sparta|disiplin spartan|molon labe|pejuang kuno)/i,
			nodes: ['01. AGOGE TRIAL', '02. IRON INTEGRITY', '03. SHIELD PHALANX', '04. WITH IT OR ON IT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes crestGlow { 0%, 100% { stroke: #FFFFFF; } 50% { stroke: ${acc}; } }
    .anim-crest { animation: crestGlow 2.5s infinite ease-in-out; }
  </style>

  <!-- Spartan Plumed Crest Arc -->
  <path d="M 350,75 C 290,75 270,120 270,140 M 350,75 C 410,75 430,120 430,140" fill="none" stroke="${acc}" stroke-width="4.5" stroke-linecap="round" class="anim-crest" />
  <path d="M 350,90 C 310,90 290,125 290,140 M 350,90 C 390,90 410,125 410,140" fill="none" stroke="#FFFFFF" stroke-width="2" />

  <!-- Bronze Corinthian Helmet Mask Body -->
  <g>
    <!-- Dome Skull -->
    <path d="M 290,140 C 290,110 410,110 410,140 L 410,210 L 380,250 L 360,250 L 360,190 L 340,190 L 340,250 L 320,250 L 290,210 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- T-Shaped Eye-Slit Aperture -->
    <polygon points="310,165 340,165 340,190 310,190" fill="${acc}" />
    <polygon points="360,165 390,165 390,190 360,190" fill="${acc}" />
    <!-- Center Nose Guard -->
    <rect x="345" y="155" width="10" height="45" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Molon Labe Inscription -->
  <text x="350" y="280" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle" letter-spacing="4">MOLON LABE</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'viking_longship',
			name: 'Viking Longship & Untamed Voyage',
			title: 'DRAKKAR SEA VOYAGE',
			tag: '[ KAPAL NORDIC VIKING // MENERJANG SAMUDRA DINGIN ]',
			regex: /(kapal viking|viking|drakkar|pelayaran laut dingin|eksplorasi viking|bangsa nordik)/i,
			nodes: ['01. OAK HULL CRAFT', '02. FJORD DEPARTURE', '03. RELENTLESS OARS', '04. UNMAPPED TERRA'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes shipBob { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(2deg); } }
    @keyframes waterChop { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-longship { animation: shipBob 3.5s ease-in-out infinite; transform-origin: 350px 220px; }
    .anim-chop { stroke-dasharray: 6,6; animation: waterChop 1.8s linear infinite; }
  </style>

  <!-- Cold Sea Horizon Waves -->
  <line x1="140" y1="245" x2="560" y2="245" stroke="#FFFFFF" stroke-width="2.5" class="anim-chop" />

  <g class="anim-longship">
    <!-- Drakkar Curved Keel & Hull -->
    <path d="M 200,165 C 220,240 280,245 350,245 C 420,245 480,240 500,165 L 470,225 L 230,225 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Dragon Head Prow (Stern/Bow Carving) -->
    <path d="M 200,165 C 190,140 205,125 195,115 C 215,120 215,145 210,165" fill="${acc}" stroke="#FFFFFF" stroke-width="2" />
    
    <!-- Central Mast & Rigging -->
    <line x1="350" y1="225" x2="350" y2="90" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <line x1="300" y1="120" x2="400" y2="120" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Striped Square Sail -->
    <rect x="305" y="120" width="90" height="65" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <line x1="335" y1="120" x2="335" y2="185" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4,4" />
    <line x1="365" y1="120" x2="365" y2="185" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4,4" />

    <!-- Row of Round Wooden Shields on Gunwale -->
    <circle cx="260" cy="225" r="7" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <circle cx="290" cy="225" r="7" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="320" cy="225" r="7" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <circle cx="350" cy="225" r="7" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="380" cy="225" r="7" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <circle cx="410" cy="225" r="7" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="440" cy="225" r="7" fill="#18181b" stroke="${acc}" stroke-width="2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'sundial_shadow',
			name: 'Ancient Sundial & Solar Shadow',
			title: 'GNOMON SOLAR CHRONOLOGY',
			tag: '[ JAM MATAHARI KUNO // BAYANGAN SURYA ]',
			regex: /(jam matahari|sundial|gnomon|bayangan matahari kuno|pengukur waktu kuno)/i,
			nodes: ['01. CELESTIAL MERIDIAN', '02. ANGLED GNOMON', '03. CASTING SHADOW', '04. MEASURED FLEETING HOUR'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes shadowSweep { 0%, 100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
    .anim-gnomon-shadow { animation: shadowSweep 6s ease-in-out infinite; transform-origin: 350px 220px; }
  </style>

  <!-- Circular Dial Face In Perspective -->
  <ellipse cx="350" cy="220" rx="130" ry="45" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <ellipse cx="350" cy="220" rx="100" ry="32" fill="none" stroke="${acc}" stroke-width="1.8" stroke-dasharray="6,4" />

  <!-- Hour Mark Radial Ticks -->
  <g stroke="#52525B" stroke-width="2">
    <line x1="230" y1="220" x2="250" y2="220" />
    <line x1="470" y1="220" x2="450" y2="220" />
    <line x1="350" y1="175" x2="350" y2="190" />
    <line x1="350" y1="265" x2="350" y2="250" />
    <line x1="265" y1="195" x2="280" y2="202" />
    <line x1="435" y1="195" x2="420" y2="202" />
  </g>

  <!-- Triangular Gnomon Fin (Casting Shadow) -->
  <polygon points="350,220 350,110 320,220" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
  
  <!-- Sweeping Shadow Line -->
  <g class="anim-gnomon-shadow">
    <line x1="350" y1="220" x2="420" y2="245" stroke="${acc}" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- Center Anchor Nut -->
  <circle cx="350" cy="220" r="5" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'ancient_scroll',
			name: 'Papyrus Scroll & Ancient Wisdom Codex',
			title: 'ALEXANDRIAN CODEX SCROLL',
			tag: '[ GULUNGAN PAPIRUS // KHAZANAH PENGETAHUAN KUNO ]',
			regex: /(gulungan papirus|naskah kuno|scroll kuno|manuskrip kuno|perpustakaan alexandria|kitab kuno)/i,
			nodes: ['01. HAND-PRESSED PAPYRUS', '02. IRON-GALL SCRIPT', '03. CONCEALED HERMETIC TRUTH', '04. MILLENNIAL SURVIVAL'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes unrollSlight { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.03); } }
    .anim-scroll { animation: unrollSlight 3s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <g class="anim-scroll">
    <!-- Unrolled Papyrus Body -->
    <rect x="230" y="115" width="240" height="140" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    
    <!-- Written Manuscript Text Lines Inside -->
    <g stroke="${acc}" stroke-width="2" stroke-linecap="round">
      <line x1="255" y1="140" x2="400" y2="140" />
      <line x1="255" y1="165" x2="430" y2="165" stroke="#FFFFFF" />
      <line x1="255" y1="190" x2="380" y2="190" />
      <line x1="255" y1="215" x2="420" y2="215" stroke="#FFFFFF" />
      <line x1="255" y1="235" x2="330" y2="235" />
    </g>

    <!-- Left Rolled Spindle Cylinder -->
    <rect x="210" y="100" width="22" height="170" rx="11" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="221" cy="112" r="4" fill="${acc}" />
    <circle cx="221" cy="258" r="4" fill="${acc}" />

    <!-- Right Rolled Spindle Cylinder -->
    <rect x="468" y="100" width="22" height="170" rx="11" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="479" cy="112" r="4" fill="${acc}" />
    <circle cx="479" cy="258" r="4" fill="${acc}" />
  </g>

  <!-- Wax Seal Emblem Attached -->
  <circle cx="450" cy="240" r="14" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="450" cy="240" r="4" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'sword_excalibur',
			name: 'Sword in the Stone & Sovereign Destiny',
			title: 'EXCALIBUR SOVEREIGN DESTINY',
			tag: '[ PEDANG DALAM BATU // PEMIMPIN SEJATI ]',
			regex: /(pedang excalibur|pedang dalam batu|king arthur|pedang raja|takdir penguasa|cabut pedang)/i,
			nodes: ['01. EMBEDDED IN GRANITE', '02. WORTHINESS TRIAL', '03. EFFORTLESS EXTRACTION', '04. ANNOINTED SOVEREIGN'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes bladeGleam { 0%, 100% { filter: drop-shadow(0 0 3px ${acc}55); } 50% { filter: drop-shadow(0 0 12px ${acc}); } }
    .anim-excalibur { animation: bladeGleam 2.5s infinite ease-in-out; }
  </style>

  <!-- Massive Granite Anvil/Stone Base -->
  <polygon points="220,270 260,200 440,200 480,270" fill="#18181b" stroke="#52525B" stroke-width="3" stroke-linejoin="round" />
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Crack Fractures in Granite -->
  <path d="M 350,200 L 330,235 M 350,200 L 375,230" stroke="${acc}" stroke-width="2" />

  <!-- Excalibur Steel Sword Embedded Vertically -->
  <g class="anim-excalibur">
    <!-- Blade Embedded Downward -->
    <polygon points="345,145 355,145 352,225 348,225" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <line x1="350" y1="145" x2="350" y2="225" stroke="${acc}" stroke-width="2" />

    <!-- Crossguard -->
    <rect x="315" y="140" width="70" height="8" rx="2" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="315" cy="144" r="3" fill="${acc}" />
    <circle cx="385" cy="144" r="3" fill="${acc}" />

    <!-- Leather Wrapped Grip -->
    <line x1="350" y1="140" x2="350" y2="95" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />
    <line x1="350" y1="105" x2="350" y2="130" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" />

    <!-- Crown Pommel -->
    <circle cx="350" cy="90" r="8" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="90" r="3" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'castle_citadel',
			name: 'Medieval Citadel & Impenetrable Bastion',
			title: 'MEDIEVAL CITADEL BASTION',
			tag: '[ BENTENG KASTIL // KETAHANAN PERTAHANAN KOKOH ]',
			regex: /(benteng kastil|citadel|kastil kuno|dinding benteng|benteng pertahanan kokoh|tembok istana)/i,
			nodes: ['01. MOAT DIGGING', '02. CURTAIN WALL MASONRY', '03. CRENELATED WATCHTOWERS', '04. IMPENETRABLE KEEP'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes flagWhipCitadel { 0%, 100% { transform: skewX(0deg); } 50% { transform: skewX(-10deg); } }
    .anim-citadel-flag { animation: flagWhipCitadel 2s ease-in-out infinite; transform-origin: 350px 75px; }
  </style>

  <!-- Ground Horizon & Moat Line -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Curtain Wall Middle -->
  <rect x="250" y="165" width="200" height="105" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
  <!-- Arched Portcullis Gate Door -->
  <path d="M 330,270 L 330,225 C 330,210 370,210 370,225 L 370,270 Z" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <line x1="330" y1="235" x2="370" y2="235" stroke="${acc}" stroke-width="1.8" />
  <line x1="350" y1="210" x2="350" y2="270" stroke="${acc}" stroke-width="1.8" />

  <!-- Left Flanking Watchtower -->
  <rect x="220" y="125" width="50" height="145" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <!-- Left Battlements Crenels -->
  <polyline points="215,125 215,110 230,110 230,120 245,120 245,110 260,110 260,120 275,120 275,125" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Right Flanking Watchtower -->
  <rect x="430" y="125" width="50" height="145" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <!-- Right Battlements Crenels -->
  <polyline points="425,125 425,110 440,110 440,120 455,120 455,110 470,110 470,120 485,120 485,125" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Central Great Keep Tower -->
  <rect x="315" y="90" width="70" height="75" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <g class="anim-citadel-flag">
    <line x1="350" y1="90" x2="350" y2="65" stroke="#FFFFFF" stroke-width="2" />
    <polygon points="350,65 372,73 350,81" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'siege_catapult',
			name: 'Siege Trebuchet & High-Trajectory Launch',
			title: 'TREBUCHET HIGH LEVERAGE',
			tag: '[ KATAPEL PENGEPUNGAN // PELEPAS KETEGANGAN TINGGI ]',
			regex: /(katapel pengepungan|trebuchet|catapult|lemparan batu pengepungan|daya lontar katapel)/i,
			nodes: ['01. HEAVY COUNTERWEIGHT', '02. TENSION ARM LOCK', '03. FULCRUM RELEASE', '04. WALL-BREACHING TRAJECTORY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes slingLaunch { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(-30deg); } 60% { transform: rotate(15deg); } }
    .anim-trebuchet-beam { animation: slingLaunch 3s infinite ease-in-out; transform-origin: 320px 170px; }
  </style>

  <!-- Siege Field Groundline -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Heavy A-Frame Timber Chassis -->
  <polygon points="250,270 320,170 390,270" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  <line x1="280" y1="225" x2="360" y2="225" stroke="#52525B" stroke-width="2.5" />
  <circle cx="320" cy="170" r="6" fill="${acc}" />

  <!-- Pivoting Counterweight Launch Beam -->
  <g class="anim-trebuchet-beam">
    <!-- Main Beam Spar -->
    <line x1="250" y1="210" x2="450" y2="100" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    
    <!-- Short Arm Counterweight Box (Left) -->
    <rect x="235" y="210" width="30" height="25" rx="3" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <line x1="250" y1="205" x2="250" y2="210" stroke="#FFFFFF" stroke-width="2" />
    
    <!-- Long Arm Sling & Projectile (Right) -->
    <line x1="450" y1="100" x2="480" y2="120" stroke="${acc}" stroke-width="2" stroke-dasharray="3,2" />
    <circle cx="485" cy="125" r="7" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- High Parabolic Trajectory Arc -->
  <path d="M 485,125 Q 520,70 560,110" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'stonehenge_trilithon',
			name: 'Stonehenge Megalith & Ancient Alignment',
			title: 'MEGALITHIC EQUINOX ALIGNMENT',
			tag: '[ STONEHENGE KUNO // PENJAJARAN MATAHARI ]',
			regex: /(stonehenge|megalitikum|batu megalit|trilithon|monolit kuno|penjajaran solstis)/i,
			nodes: ['01. GLACIAL SARSEN QUARRY', '02. ROLLERS & LEVERS', '03. MORTISE & TENON LINTEL', '04. SOLSTICE LIGHT BEAM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes solsticeBeam { 0%, 100% { stroke-opacity: 0.4; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 8px ${acc}); } }
    .anim-solstice { animation: solsticeBeam 3s infinite ease-in-out; }
  </style>

  <!-- Salisbury Plain Grass Horizon -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Solstice Sunrise Light Beam Through Center Gap -->
  <line x1="350" y1="90" x2="350" y2="265" stroke="${acc}" stroke-width="3" stroke-linecap="round" class="anim-solstice" />
  <circle cx="350" cy="90" r="16" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Great Trilithon Stone Monolith Arch -->
  <!-- Left Upright Sarsen Stone -->
  <polygon points="265,265 275,130 315,130 325,265" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  
  <!-- Right Upright Sarsen Stone -->
  <polygon points="375,265 385,130 425,130 435,265" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />

  <!-- Top Horizontal Lintel Sarsen Beam -->
  <polygon points="245,130 455,130 450,105 250,105" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  <line x1="250" y1="105" x2="450" y2="105" stroke="${acc}" stroke-width="2" />

  <!-- Flanking Outlying Stones in Distance -->
  <polygon points="180,265 190,200 215,200 220,265" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <polygon points="480,265 485,200 510,200 520,265" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'hieroglyph_slab',
			name: 'Rosetta Stone & Decoded Hieroglyphs',
			title: 'ROSETTA DECODING SLAB',
			tag: '[ BATU ROSETTA // MENERJEMAHKAN HIEROGLIF ]',
			regex: /(hieroglif|batu rosetta|prasasti batu|simbol mesir kuno|kode kuno terpecahkan|inskripsi kuno)/i,
			nodes: ['01. GRANODIORITE STELE', '02. TRI-LINGUAL EDICTS', '03. CARTUCHE CIPHER DECODE', '04. ANCIENT LANGUAGE REBORN'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes glyphGleam { 0%, 100% { stroke: #FFFFFF; } 50% { stroke: ${acc}; } }
    .anim-cartouche { animation: glyphGleam 2.5s infinite ease-in-out; }
  </style>

  <!-- Stone Stele Slab Shell (Arched Top Broken Edge) -->
  <path d="M 240,260 L 240,140 C 240,100 460,100 460,140 L 460,260 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />

  <!-- Tri-Lingual Demarcation Divides -->
  <line x1="240" y1="165" x2="460" y2="165" stroke="#52525B" stroke-width="2" stroke-dasharray="4,4" />
  <line x1="240" y1="215" x2="460" y2="215" stroke="#52525B" stroke-width="2" stroke-dasharray="4,4" />

  <!-- Top Register: Royal Cartouche & Sacred Hieroglyphs -->
  <g class="anim-cartouche">
    <!-- Oval Royal Cartouche Loop -->
    <rect x="290" y="125" width="120" height="28" rx="14" fill="none" stroke-width="2.5" />
    <line x1="410" y1="125" x2="410" y2="153" stroke-width="3" stroke-linecap="round" />
    <!-- Glyphs inside Cartouche: Eye of Horus, Ankh, Sun -->
    <circle cx="320" cy="139" r="4" fill="${acc}" />
    <path d="M 345,133 L 355,133 M 350,133 L 350,145" stroke="#FFFFFF" stroke-width="2" />
    <polygon points="380,132 385,145 375,145" fill="${acc}" />
  </g>

  <!-- Middle Register: Demotic Script Scribbles -->
  <g stroke="${acc}" stroke-width="1.8" stroke-dasharray="4,3">
    <line x1="260" y1="180" x2="440" y2="180" />
    <line x1="260" y1="200" x2="410" y2="200" />
  </g>

  <!-- Bottom Register: Ancient Greek Inscription -->
  <g stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="5,2">
    <line x1="260" y1="230" x2="440" y2="230" />
    <line x1="260" y1="245" x2="380" y2="245" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
