/**
 * THEME: MILITARY STRATEGY & SUN TZU (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeMilitary = {
	categoryName: 'military',
	categoryLabel: '⚔️ Strategi Militer & Perang Pikiran',
	themeColor: '#DC2626', // Crimson Red
	items: [
		{
			id: 'chess_tactics',
			name: 'Grandmaster Chess & Tactical Sacrifices',
			title: 'TACTICAL FORK & SACRIFICE',
			tag: '[ TAKTIK CATUR // PENGORBANAN UNTUK KEMENANGAN ]',
			regex: /(\bcatur\b|taktik catur|skakmat|langkah catur|grandmaster|strategi catur|pengorbanan bidak)/i,
			nodes: ['01. BOARD POSITIONING', '02. CALCULATED GAMBIT', '03. KNIGHT FORK', '04. INEVITABLE CHECKMATE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes knightHop { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(40px, -30px); } }
    .anim-knight { animation: knightHop 3s ease-in-out infinite; }
  </style>

  <!-- Isometric Mini-Chessboard Grid -->
  <g transform="translate(180, 80)">
    <!-- 4x4 Grid in Perspective -->
    <polygon points="170,40 320,110 170,180 20,110" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
    
    <!-- Grid Squares -->
    <path d="M 95,75 L 245,145 M 57,92 L 207,162 M 132,57 L 282,127" stroke="#3F3F46" stroke-width="1.8" />
    <path d="M 132,57 L 57,92 M 170,40 L 95,75 M 207,57 L 132,92 M 245,75 L 170,110 M 282,92 L 207,127 M 320,110 L 245,145" stroke="#3F3F46" stroke-width="1.8" />

    <!-- Defeated Enemy King Pin (Out of Position) -->
    <g transform="translate(245, 110)">
      <polygon points="0,0 8,-25 -8,-25" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
      <line x1="-12" y1="-25" x2="12" y2="-25" stroke="#FFFFFF" stroke-width="2" />
      <line x1="0" y1="-32" x2="0" y2="-20" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="0" cy="-35" r="3" fill="#FFFFFF" />
    </g>

    <!-- Threat Vector Arrow (Crimson Glow) -->
    <path d="M 115,115 Q 160,80 235,110" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="4,4" />
    <polygon points="240,110 230,105 233,115" fill="${acc}" />

    <!-- Kinetic White Knight (Leaping) -->
    <g class="anim-knight" transform="translate(100, 120)">
      <path d="M -8,0 L 8,0 L 6,-18 L 12,-25 L 5,-32 L -8,-28 L -12,-15 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" stroke-linejoin="round" />
      <circle cx="0" cy="-24" r="2" fill="${acc}" />
    </g>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'flank_maneuver',
			name: 'Pincer Flank Maneuver & Double Envelopment',
			title: 'PINCER FLANK ENVELOPMENT',
			tag: '[ GERAKAN MENJEPIT // PENGEPUNGAN SAYAP GANDA ]',
			regex: /(menjepit|flanking|gerakan sayap|pengepungan musuh|taktik cannae|pincer maneuver)/i,
			nodes: ['01. FIXING THE CENTER', '02. RAPID WING EXTENSION', '03. CONVERGING FLANKS', '04. TOTAL ENCIRCLEMENT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes pincerClose { 0%, 100% { stroke-dashoffset: 80; } 50% { stroke-dashoffset: 0; } }
    .anim-pincer { stroke-dasharray: 8,6; animation: pincerClose 3s linear infinite; }
  </style>

  <!-- Ground Coordinate Grid -->
  <line x1="140" y1="260" x2="560" y2="260" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Enemy Trapped Vanguard Center (Defensive Square) -->
  <g transform="translate(350, 175)">
    <rect x="-30" y="-30" width="60" height="60" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <line x1="-30" y1="-30" x2="30" y2="30" stroke="#52525B" stroke-width="2" />
    <line x1="30" y1="-30" x2="-30" y2="30" stroke="#52525B" stroke-width="2" />
    <text x="0" y="5" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="#FFFFFF" text-anchor="middle">ENEMY</text>
  </g>

  <!-- Friendly Center Pinning Line -->
  <line x1="300" y1="250" x2="400" y2="250" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <text x="350" y="275" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="#71717A" text-anchor="middle">FIXING CENTER</text>

  <!-- Left Flank Sweeping Hook -->
  <path d="M 280,250 C 180,240 180,120 325,135" fill="none" stroke="${acc}" stroke-width="3.5" class="anim-pincer" />
  <polygon points="335,137 320,130 323,143" fill="${acc}" />

  <!-- Right Flank Sweeping Hook -->
  <path d="M 420,250 C 520,240 520,120 375,135" fill="none" stroke="${acc}" stroke-width="3.5" class="anim-pincer" />
  <polygon points="365,137 380,130 377,143" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'trojan_decoy',
			name: 'Trojan Decoy & Subterfuge Diversion',
			title: 'TROJAN DECOY INFILTRATION',
			tag: '[ KUDA TROYA // PENYUSUPAN KAMUFLASE DIPLOMASI ]',
			regex: /(kuda troya|trojan|tipu muslihat perang|kamuflase taktik|infiltrasi rahasia|pengalih perhatian)/i,
			nodes: ['01. OFFERING HARBOR', '02. INTERNAL SUBVERSION', '03. MIDNIGHT UNLATCH', '04. CITADEL FALL'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes pulseTrojan { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 8px ${acc}); } }
    .anim-trojan { animation: pulseTrojan 2.5s infinite ease-in-out; }
  </style>

  <!-- City Walls Perimeter -->
  <line x1="440" y1="90" x2="440" y2="270" stroke="#FFFFFF" stroke-width="4" />
  <line x1="440" y1="90" x2="540" y2="90" stroke="#52525B" stroke-width="2.5" />
  <!-- Gate Opening in Wall -->
  <line x1="440" y1="180" x2="440" y2="230" stroke="#18181b" stroke-width="6" />
  <line x1="440" y1="180" x2="475" y2="195" stroke="${acc}" stroke-width="3" stroke-dasharray="3,3" />

  <!-- Wooden Trojan Horse Silhouette Framework -->
  <g transform="translate(190, 80)">
    <!-- Wheels on Platform Plinth -->
    <rect x="30" y="175" width="160" height="15" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="55" cy="195" r="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="165" cy="195" r="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

    <!-- Horse Body Timber Truss -->
    <polygon points="50,175 70,110 160,110 170,175" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <!-- Concealed Trapdoor Core (Glowing) -->
    <rect x="90" y="125" width="45" height="35" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2" class="anim-trojan" />
    <circle cx="112" cy="142" r="4" fill="${acc}" />

    <!-- Horse Neck & Head Arcs -->
    <path d="M 160,110 L 175,65 L 205,75 L 185,100 L 170,110" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'trench_fortress',
			name: 'Entrenched Bunker & Layered Defense',
			title: 'LAYERED TRENCH ATTRITION',
			tag: '[ PARIT PERTAHANAN // BENTENG BAWAH TANAH ]',
			regex: /(parit pertahanan|trench|bunker perang|pertahanan berlapis|kawat berduri|pos pertahanan)/i,
			nodes: ['01. BARBED WIRE WIREFIELD', '02. REVETTED TRENCH', '03. CONCRETE BUNKER', '04. PERIMETER INTERLOCK'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wireTension { 0%, 100% { stroke: #FFFFFF; } 50% { stroke: ${acc}; } }
    .anim-wire { animation: wireTension 3s infinite ease-in-out; }
  </style>

  <!-- Ground Level Cutaway -->
  <line x1="140" y1="180" x2="260" y2="180" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Stepped Down Trench Cut -->
  <polyline points="260,180 280,260 380,260 400,180" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
  <!-- Sandbag Embankment -->
  <rect x="250" y="165" width="30" height="15" rx="4" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <rect x="380" y="165" width="30" height="15" rx="4" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Concrete Deep Bunker Underground Roof -->
  <rect x="410" y="180" width="130" height="85" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <line x1="410" y1="195" x2="540" y2="195" stroke="${acc}" stroke-width="3" />
  <line x1="430" y1="215" x2="470" y2="215" stroke="${acc}" stroke-width="2.5" />

  <!-- Barbed Wire Coils in No-Man's Land -->
  <g class="anim-wire">
    <ellipse cx="180" cy="165" rx="14" ry="14" fill="none" stroke="#FFFFFF" stroke-width="2" />
    <ellipse cx="205" cy="165" rx="14" ry="14" fill="none" stroke="${acc}" stroke-width="2" />
    <ellipse cx="230" cy="165" rx="14" ry="14" fill="none" stroke="#FFFFFF" stroke-width="2" />
    <line x1="160" y1="165" x2="250" y2="165" stroke="${acc}" stroke-width="1.8" stroke-dasharray="4,4" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'recon_tower',
			name: 'Reconnaissance Tower & Perimeter Watch',
			title: 'PERIMETER RECONNAISSANCE',
			tag: '[ MENARA PENGAWAS // PEMANTAUAN RADIAL 360 ]',
			regex: /(menara pengawas|reconnaissance|intai militer|pengawasan perimeter|pos pantau|menara intai)/i,
			nodes: ['01. ELEVATED OPTICS', '02. SWEEPING BEACON', '03. EARLY WARNING', '04. RAPID MOBILIZATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes beamSweepTower { 0%, 100% { transform: rotate(-30deg); } 50% { transform: rotate(30deg); } }
    .anim-tower-beam { animation: beamSweepTower 4s ease-in-out infinite; transform-origin: 350px 105px; }
  </style>

  <!-- Ground Foundation Line -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Lattice Steel Watchtower Legs -->
  <polygon points="315,270 335,130 365,130 385,270" fill="none" stroke="#FFFFFF" stroke-width="3" />
  <!-- Internal Cross-Bracing -->
  <line x1="322" y1="225" x2="378" y2="225" stroke="#52525B" stroke-width="2" />
  <line x1="322" y1="225" x2="371" y2="175" stroke="#52525B" stroke-width="1.8" />
  <line x1="378" y1="225" x2="329" y2="175" stroke="#52525B" stroke-width="1.8" />
  <line x1="329" y1="175" x2="371" y2="175" stroke="#52525B" stroke-width="2" />

  <!-- Observation Cabin Platform -->
  <rect x="320" y="105" width="60" height="25" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <rect x="310" y="95" width="80" height="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Sweeping Searchlight Beam -->
  <g class="anim-tower-beam">
    <polygon points="350,105 200,265 260,265" fill="${acc}" fill-opacity="0.15" stroke="${acc}" stroke-width="1.8" stroke-dasharray="4,4" />
    <circle cx="350" cy="105" r="5" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'truce_flag',
			name: 'Diplomatic Truce & White Flag Accord',
			title: 'TACTICAL CEASEFIRE ACCORD',
			tag: '[ BENDERA GENCATAN SENJATA // DIPLOMASI MEDIASI ]',
			regex: /(gencatan senjata|bendera putih|truce|perjanjian damai perang|ceasefire|diplomasi perang)/i,
			nodes: ['01. WEAPON STANDSTILL', '02. PARLEY ADVANCE', '03. DEMILITARIZED BUFFER', '04. STRATEGIC REGROUPING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes flagWaveTruce { 0%, 100% { transform: skewY(0deg); } 50% { transform: skewY(-6deg); } }
    .anim-truce { animation: flagWaveTruce 3s ease-in-out infinite; transform-origin: 350px 100px; }
  </style>

  <!-- Horizon Battlefield Divider -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Flagpole Center Pivot -->
  <line x1="330" y1="265" x2="330" y2="85" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
  <circle cx="330" cy="80" r="5" fill="${acc}" />

  <!-- Flowing White Parley Flag with Crimson Crest Border -->
  <g class="anim-truce">
    <path d="M 330,85 C 370,75 390,100 430,90 L 430,170 C 390,180 370,155 330,165 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <!-- Olive Branch Insignia Outline -->
    <path d="M 360,130 Q 380,120 400,125" fill="none" stroke="${acc}" stroke-width="2.5" />
    <circle cx="370" cy="123" r="3" fill="${acc}" />
    <circle cx="390" cy="120" r="3" fill="${acc}" />
  </g>

  <!-- Crossed Rifles Grounded (Stand Down) -->
  <line x1="260" y1="265" x2="290" y2="235" stroke="#52525B" stroke-width="2.5" />
  <line x1="290" y1="265" x2="260" y2="235" stroke="#52525B" stroke-width="2.5" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'phalanx_spears',
			name: 'Macedonian Phalanx & Sarissa Wall',
			title: 'PHALANX SARISSA SPEAR-WALL',
			tag: '[ FORMASI PHALANX // DINDING TOMBAK SARISSA ]',
			regex: /(formasi phalanx|sarissa|dinding tombak|formasi tempur rapat|perisai tombak|barisan macedonia)/i,
			nodes: ['01. LOCKED ASPIS SHIELDS', '02. LAYERED SARISSA BRISTLE', '03. UNBROKEN CADENCE', '04. FRONTAL IMPREGNABILITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes spearThrust { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(12px); } }
    .anim-spear { animation: spearThrust 2.5s ease-in-out infinite; }
  </style>

  <!-- Ground Battle Line -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Locked Round Shields Front Row (Aspis) -->
  <g transform="translate(190, 160)">
    <circle cx="50" cy="70" r="35" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="105" cy="70" r="35" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="160" cy="70" r="35" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="215" cy="70" r="35" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="270" cy="70" r="35" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  </g>

  <!-- Protruding Long Sarissa Spear Shafts Bristling Outward -->
  <g class="anim-spear">
    <line x1="220" y1="220" x2="480" y2="120" stroke="#FFFFFF" stroke-width="2.5" />
    <polygon points="485,118 475,116 478,124" fill="${acc}" />

    <line x1="275" y1="220" x2="535" y2="120" stroke="#FFFFFF" stroke-width="2.5" />
    <polygon points="540,118 530,116 533,124" fill="${acc}" />

    <line x1="330" y1="220" x2="590" y2="120" stroke="#FFFFFF" stroke-width="2.5" />
    <polygon points="595,118 585,116 588,124" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'minefield_tripwire',
			name: 'Minefield Tripwire & Perimeter Trap',
			title: 'CONCEALED TRIPWIRE TRIGGER',
			tag: '[ JEBAKAN KAWAT MILITER // SENSOR PERIMETER ]',
			regex: /(ranjau|tripwire|kawat pemicu|jebakan militer|ladang ranjau|perimeter trap)/i,
			nodes: ['01. CONCEALED TENSION CABLE', '02. HAIR-TRIGGER DETONATOR', '03. PERIMETER LOCKDOWN', '04. IMMEDIATE REPULSION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes pulseWarning { 0%, 100% { filter: drop-shadow(0 0 2px ${acc}55); } 50% { filter: drop-shadow(0 0 10px ${acc}); } }
    .anim-hazard { animation: pulseWarning 2s infinite ease-in-out; }
  </style>

  <!-- Ground Layer -->
  <line x1="140" y1="240" x2="560" y2="240" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Wooden Stakes Pegged into Ground -->
  <line x1="200" y1="210" x2="200" y2="260" stroke="#52525B" stroke-width="4" stroke-linecap="round" />
  <line x1="500" y1="210" x2="500" y2="260" stroke="#52525B" stroke-width="4" stroke-linecap="round" />

  <!-- Ultra-Thin Taut Tripwire Running Across -->
  <line x1="200" y1="225" x2="500" y2="225" stroke="${acc}" stroke-width="2" stroke-dasharray="5,2" />

  <!-- Buried Mine Casing Beneath Surface -->
  <rect x="325" y="245" width="50" height="20" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="350" y1="225" x2="350" y2="245" stroke="${acc}" stroke-width="2" />
  <circle cx="350" cy="225" r="4" fill="${acc}" />

  <!-- Yellow/Crimson Danger Warning Triangle -->
  <g class="anim-hazard" transform="translate(325, 95)">
    <polygon points="25,0 50,45 0,45" fill="#18181b" stroke="${acc}" stroke-width="3" stroke-linejoin="round" />
    <line x1="25" y1="15" x2="25" y2="30" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <circle cx="25" cy="38" r="2" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'smoke_signal',
			name: 'Battlefield Smoke Signals & Distant Beacon',
			title: 'TACTICAL SMOKE BEACON',
			tag: '[ SINYAL ASAP MEDAN TEMPUR // KOMUNIKASI VISUAL JARAK JAUH ]',
			regex: /(sinyal asap|smoke signal|komunikasi medan tempur|asap perang|isyarat api asap)/i,
			nodes: ['01. BRAZIER IGNITION', '02. PULSED BLANKET CUTOFF', '03. RISING TELEGRAPH PUFFS', '04. HORIZON RESPONSE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes risePuff { 0% { transform: translateY(0) scale(0.9); opacity: 0.8; } 50% { transform: translateY(-15px) scale(1.1); opacity: 1; } 100% { transform: translateY(-30px) scale(1.2); opacity: 0.6; } }
    .anim-puff1 { animation: risePuff 3s infinite ease-out; }
    .anim-puff2 { animation: risePuff 3s infinite ease-out; animation-delay: 1s; }
    .anim-puff3 { animation: risePuff 3s infinite ease-out; animation-delay: 2s; }
  </style>

  <!-- Distant Mountain Ridge Crests -->
  <path d="M 140,260 L 250,210 L 350,250 L 460,200 L 560,260" fill="none" stroke="#52525B" stroke-width="2" />

  <!-- Stone Signal Brazier Pot on Left Peak -->
  <g transform="translate(230, 195)">
    <polygon points="10,20 30,20 35,5 5,5" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="20" y1="20" x2="20" y2="28" stroke="#FFFFFF" stroke-width="3" />
  </g>

  <!-- Rising Pulsed Signal Puffs -->
  <g transform="translate(250, 180)">
    <circle cx="0" cy="-20" r="12" fill="#18181b" stroke="${acc}" stroke-width="2.5" class="anim-puff1" />
    <circle cx="15" cy="-55" r="16" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" class="anim-puff2" />
    <circle cx="30" cy="-95" r="20" fill="#18181b" stroke="${acc}" stroke-width="2.5" class="anim-puff3" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'radar_sweep',
			name: '360° Military Sonar & Radar Sweep',
			title: 'CIRCULAR RADAR SCANNER',
			tag: '[ RADAR 360 DERAJAT // DETEKSI ANCAMAN RUANG UDARA ]',
			regex: /(\bradar\b|sonar|sapuan radar|pemindai udara|radar militer|reticle target)/i,
			nodes: ['01. 360 DEGREE SWEEP', '02. TARGET BLIP PING', '03. AZIMUTH CALCULATION', '04. INTERCEPT READINESS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes radarSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes pingBlink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
    .anim-sweep-line { animation: radarSpin 4s linear infinite; transform-origin: 350px 185px; }
    .anim-blip { animation: pingBlink 1.5s infinite; }
  </style>

  <!-- Concentric Radar Range Rings -->
  <circle cx="350" cy="185" r="110" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="185" r="75" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />
  <circle cx="350" cy="185" r="40" fill="none" stroke="#52525B" stroke-width="1.8" />
  
  <!-- Crosshairs Coordinate Axes -->
  <line x1="220" y1="185" x2="480" y2="185" stroke="#52525B" stroke-width="1.8" />
  <line x1="350" y1="55" x2="350" y2="315" stroke="#52525B" stroke-width="1.8" />

  <!-- Sweeping Phosphor Line with Radial Beam -->
  <g class="anim-sweep-line">
    <line x1="350" y1="185" x2="460" y2="185" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <polygon points="350,185 460,185 450,150" fill="${acc}" fill-opacity="0.18" />
  </g>

  <!-- Target Contact Blip Ping -->
  <g class="anim-blip" transform="translate(415, 135)">
    <circle cx="0" cy="0" r="4" fill="${acc}" />
    <circle cx="0" cy="0" r="10" fill="none" stroke="${acc}" stroke-width="1.5" />
    <text x="12" y="4" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="${acc}">TRGT-01</text>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
