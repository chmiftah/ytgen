/**
 * THEME: DIGITAL CREATOR & SOLOPRENEUR (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeCreator = {
	categoryName: 'creator',
	categoryLabel: '✍️ Konten Kreator & Solopreneur',
	themeColor: '#C084FC', // Creative Violet
	items: [
		{
			id: 'typewriter_key',
			name: 'Mechanical Typewriter & Tactile Words',
			title: 'TYPEWRITER MECHANICAL CADENCE',
			tag: '[ MESIN TIK MEKANIS // KEKUATAN KATA TERTULIS ]',
			regex: /(mesin tik|menulis artikel|ketikan kata|typewriter|penulis naskah|karya tulis orisinil)/i,
			nodes: ['01. RAW THOUGHT IMPULSE', '02. STEEL KEYSTRIKE LEVER', '03. INK-RIBBON IMPRINT', '04. PERMANENT MANUSCRIPT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes keyStrike { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(12px); } }
    .anim-typekey { animation: keyStrike 2s infinite ease-in-out; }
  </style>

  <!-- Carriage Paper Roll (Platen) Top -->
  <rect x="220" y="80" width="260" height="30" rx="15" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
  <!-- Crisp Paper Sheet Fed Upward -->
  <polygon points="260,80 440,80 440,35 260,35" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="280" y1="50" x2="360" y2="50" stroke="${acc}" stroke-width="2" />
  <line x1="280" y1="62" x2="420" y2="62" stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="4,2" />

  <!-- Typebar Steel Striker Arm Aimed at Paper Ribbon -->
  <line x1="350" y1="95" x2="350" y2="155" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
  <polygon points="345,95 355,95 350,88" fill="${acc}" />

  <!-- Circular Typewriter Keys Array (Kinetic Front Row) -->
  <g transform="translate(190, 180)">
    <!-- Base Row -->
    <circle cx="50" cy="50" r="16" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <circle cx="110" cy="50" r="16" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <circle cx="210" cy="50" r="16" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <circle cx="270" cy="50" r="16" fill="#18181b" stroke="#52525B" stroke-width="2" />

    <!-- Active Striking Key (Center) -->
    <g class="anim-typekey">
      <circle cx="160" cy="50" r="18" fill="#18181b" stroke="${acc}" stroke-width="3" />
      <circle cx="160" cy="50" r="13" fill="#18181b" stroke="#FFFFFF" stroke-width="1.5" />
      <text x="160" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="${acc}" text-anchor="middle">A</text>
    </g>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'camera_aperture',
			name: '8-Blade Camera Aperture & Depth of Focus',
			title: 'OPTICAL APERTURE IRIS',
			tag: '[ DIAFRAGMA KAMERA // KETAJAMAN FOKUS KONTEN ]',
			regex: /(diafragma kamera|aperture|lensa kamera|fokus kamera|kedalaman fokus|kreator video)/i,
			nodes: ['01. AMBIENT LIGHT SENSING', '02. 8-BLADE IRIS ROTATION', '03. OPTICAL FIELD OF DEPTH', '04. CRYSTALLINE SHARPNESS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes irisBreathe { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(45deg); } }
    .anim-iris { animation: irisBreathe 6s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Camera Outer Lens Barrel Rim -->
  <circle cx="350" cy="185" r="120" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
  <circle cx="350" cy="185" r="105" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- 8 Overlapping Blades Aperture (Rotational Movement) -->
  <g class="anim-iris">
    <line x1="300" y1="120" x2="400" y2="140" stroke="${acc}" stroke-width="2.5" />
    <line x1="400" y1="140" x2="420" y2="230" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="420" y1="230" x2="350" y2="270" stroke="${acc}" stroke-width="2.5" />
    <line x1="350" y1="270" x2="270" y2="240" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="270" y1="240" x2="260" y2="160" stroke="${acc}" stroke-width="2.5" />
    <line x1="260" y1="160" x2="330" y2="110" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- Central Light Aperture Hexagon Core -->
  <polygon points="330,165 370,165 390,185 370,205 330,205 310,185" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="350" cy="185" r="6" fill="#FFFFFF" />

  <!-- F-Stop Indicator Markings -->
  <text x="350" y="80" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="#71717A" text-anchor="middle">f/1.8 50mm</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'broadcast_mic',
			name: 'Vintage Studio Mic & Authentic Voice',
			title: 'BROADCAST CONDENSER MICROPHONE',
			tag: '[ MIKROFON STUDIO PODCAST // KEKUATAN SUARA ORISINIL ]',
			regex: /(mikrofon studio|podcast|rekaman audio|suara kreator|siaran langsung|broadcast mic)/i,
			nodes: ['01. GOLD DIAPHRAGM', '02. CARDIOID POLAR PICKUP', '03. SHOCKMOUNT DAMPING', '04. RESONANT VOCAL DELIVERY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes micVibe { 0%, 100% { filter: drop-shadow(0 0 2px ${acc}55); } 50% { filter: drop-shadow(0 0 10px ${acc}); } }
    .anim-mic { animation: micVibe 2s infinite ease-in-out; }
  </style>

  <!-- Desk Stand Base -->
  <line x1="250" y1="275" x2="450" y2="275" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <line x1="350" y1="275" x2="350" y2="200" stroke="#FFFFFF" stroke-width="4" />

  <!-- Elastic Circular Shockmount Spider Ring -->
  <circle cx="350" cy="140" r="55" fill="none" stroke="#52525B" stroke-width="2.5" />
  <!-- Diagonal Suspension Rubber Bands -->
  <line x1="310" y1="100" x2="330" y2="120" stroke="${acc}" stroke-width="1.8" />
  <line x1="390" y1="100" x2="370" y2="120" stroke="${acc}" stroke-width="1.8" />
  <line x1="310" y1="180" x2="330" y2="160" stroke="${acc}" stroke-width="1.8" />
  <line x1="390" y1="180" x2="370" y2="160" stroke="${acc}" stroke-width="1.8" />

  <!-- Studio Condenser Mic Body -->
  <g class="anim-mic">
    <!-- Rounded Capsule Mesh Head -->
    <rect x="330" y="80" width="40" height="55" rx="20" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <!-- Mesh Crosshatch Pattern -->
    <line x1="330" y1="105" x2="370" y2="105" stroke="${acc}" stroke-width="2" />
    <line x1="350" y1="80" x2="350" y2="135" stroke="${acc}" stroke-width="1.8" />

    <!-- Lower Cylindrical Metal Handle -->
    <rect x="335" y="135" width="30" height="45" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="350" cy="155" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'content_funnel',
			name: 'Audience Funnel & 1,000 True Fans',
			title: 'CONVERTING AUDIENCE FUNNEL',
			tag: '[ CORONG KONTEN // DARI AUDIENS KE PENGGEMAR SETIA ]',
			regex: /(corong konten|funnel audiens|true fans|konversi penggemar|lead magnet funnel|retensi audiens)/i,
			nodes: ['01. IMPRESSION REACH (100K)', '02. ENGAGED AUDIENCE (10K)', '03. CORE SUBSCRIBERS (1K)', '04. TRUE ADVOCATES (100)'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes funnelFlow { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
    .anim-funnel-stream { stroke-dasharray: 6,4; animation: funnelFlow 2s linear infinite; }
  </style>

  <!-- Funnel Geometric Tiers Cutaway -->
  <g transform="translate(190, 80)">
    <!-- 1. Top Wide Tier (Impressions) -->
    <polygon points="20,0 300,0 260,40 60,40" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <text x="160" y="25" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="#71717A" text-anchor="middle">TOP: WIDE IMPRESSION</text>

    <!-- 2. Mid Upper Tier (Subscribers) -->
    <polygon points="60,45 260,45 225,90 95,90" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <text x="160" y="72" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="#FFFFFF" text-anchor="middle">MID: ENGAGED MEMBERS</text>

    <!-- 3. Lower Tier (High-Trust Buyer) -->
    <polygon points="95,95 225,95 195,145 125,145" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <text x="160" y="125" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="${acc}" text-anchor="middle">BOTTOM: CORE BUYERS</text>

    <!-- 4. Concentrated Spout Stream -->
    <rect x="145" y="150" width="30" height="35" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- Concentrated Kinetic Value Drop Below Spout -->
  <line x1="350" y1="265" x2="350" y2="295" stroke="${acc}" stroke-width="3" class="anim-funnel-stream" />
  <circle cx="350" cy="305" r="7" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'film_reel',
			name: 'Kinetic Film Reel & Visual Storytelling',
			title: '35MM CINEMATIC REEL',
			tag: '[ ROL FILM SINEMATIK // BINGKAI NARRATIF CERITA ]',
			regex: /(rol film|film reel|sinematografi|35mm film|frame video|editing video cerita)/i,
			nodes: ['01. SCENE COMPOSITION', '02. 24 FPS CONTINUITY', '03. SPROCKET SYNCHRONIZATION', '04. NARRATIVE RESONANCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes reelSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-film-spool { animation: reelSpin 12s linear infinite; transform-origin: 350px 175px; }
  </style>

  <!-- Kinetic Film Spool Wheel -->
  <g class="anim-film-spool">
    <!-- Outer Flange Rim -->
    <circle cx="350" cy="175" r="95" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <circle cx="350" cy="175" r="80" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />

    <!-- 3 Triangular Cutout Windows -->
    <polygon points="350,115 320,165 380,165" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <polygon points="350,235 320,185 380,185" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <polygon points="290,175 340,145 340,205" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <polygon points="410,175 360,145 360,205" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

    <!-- Center Spindle Axle -->
    <circle cx="350" cy="175" r="22" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="175" r="8" fill="${acc}" />
  </g>

  <!-- Unspooling Film Ribbon Strip Across Bottom -->
  <g transform="translate(180, 275)">
    <rect x="0" y="0" width="340" height="24" rx="2" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <!-- Sprocket Holes Along Edges -->
    <rect x="20" y="4" width="8" height="6" fill="${acc}" />
    <rect x="60" y="4" width="8" height="6" fill="${acc}" />
    <rect x="100" y="4" width="8" height="6" fill="${acc}" />
    <rect x="140" y="4" width="8" height="6" fill="${acc}" />
    <rect x="180" y="4" width="8" height="6" fill="${acc}" />
    <rect x="220" y="4" width="8" height="6" fill="${acc}" />
    <rect x="260" y="4" width="8" height="6" fill="${acc}" />
    <rect x="300" y="4" width="8" height="6" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'viral_coefficient',
			name: 'Branching Exponential Node Tree & Virality',
			title: 'EXPONENTIAL VIRAL COEFFICIENT (K>1)',
			tag: '[ KOEFISIEN VIRAL K>1 // PERTUMBUHAN EKSPONENSIAL ]',
			regex: /(viral|koefisien viral|pertumbuhan eksponensial|viral loop|jaringan menyebar|efek viral)/i,
			nodes: ['01. SEED CREATOR NODE', '02. PEER SHARE MULTIPLIER', '03. K-FACTOR > 1 THRESHOLD', '04. CASCADE SATURATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes nodeBlinkTree { 0%, 100% { fill: ${acc}; } 50% { fill: #FFFFFF; filter: drop-shadow(0 0 6px ${acc}); } }
    .anim-viralseed { animation: nodeBlinkTree 2s infinite ease-in-out; }
  </style>

  <!-- Level 1: Root Node (Top) -->
  <g transform="translate(350, 75)">
    <circle cx="0" cy="0" r="14" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="0" cy="0" r="6" class="anim-viralseed" />
  </g>

  <!-- Branching Lines to Level 2 -->
  <line x1="350" y1="89" x2="250" y2="155" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="350" y1="89" x2="450" y2="155" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- Level 2: Two Child Nodes -->
  <g transform="translate(250, 155)">
    <circle cx="0" cy="0" r="11" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="0" cy="0" r="4" fill="${acc}" />
  </g>
  <g transform="translate(450, 155)">
    <circle cx="0" cy="0" r="11" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="0" cy="0" r="4" fill="${acc}" />
  </g>

  <!-- Branching Lines to Level 3 -->
  <line x1="250" y1="166" x2="200" y2="235" stroke="${acc}" stroke-width="2" stroke-dasharray="4,2" />
  <line x1="250" y1="166" x2="280" y2="235" stroke="${acc}" stroke-width="2" stroke-dasharray="4,2" />
  <line x1="450" y1="166" x2="420" y2="235" stroke="${acc}" stroke-width="2" stroke-dasharray="4,2" />
  <line x1="450" y1="166" x2="500" y2="235" stroke="${acc}" stroke-width="2" stroke-dasharray="4,2" />

  <!-- Level 3: Four Child Nodes -->
  <circle cx="200" cy="235" r="8" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="280" cy="235" r="8" fill="#18181b" stroke="${acc}" stroke-width="2" />
  <circle cx="420" cy="235" r="8" fill="#18181b" stroke="${acc}" stroke-width="2" />
  <circle cx="500" cy="235" r="8" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

  <!-- Formula Metric Tag -->
  <text x="350" y="275" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle" letter-spacing="3">K-FACTOR = 2.4 (VIRAL COMPOUNDING)</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'core_community',
			name: 'Core Tribe Constellation & Central Hearth',
			title: 'HIGH-TRUST COMMUNITY CONSTELLATION',
			tag: '[ KOMUNITAS INTI TRIBE // KONEKSI KELOMPOK BERKUALITAS ]',
			regex: /(komunitas inti|tribe|membangun komunitas|jaringan anggota|loyalitas tribe|anggota komunitas)/i,
			nodes: ['01. SHARED ETHOS PROTOCOL', '02. PEER-TO-PEER BRIDGES', '03. CENTRAL HEARTH ENERGY', '04. RESILIENT COLLECTIVE INTELLIGENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes hearthFlame { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px ${acc}55); } 50% { transform: scale(1.15); filter: drop-shadow(0 0 14px ${acc}); } }
    .anim-hearth { animation: hearthFlame 2.5s infinite ease-in-out; transform-origin: 350px 185px; }
  </style>

  <!-- Orbital Constellation Web Ring -->
  <circle cx="350" cy="185" r="105" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Interconnecting Tribe Peer Spokes -->
  <g stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="4,3">
    <line x1="350" y1="80" x2="440" y2="135" />
    <line x1="440" y1="135" x2="440" y2="235" />
    <line x1="440" y1="235" x2="350" y2="290" />
    <line x1="350" y1="290" x2="260" y2="235" />
    <line x1="260" y1="235" x2="260" y2="135" />
    <line x1="260" y1="135" x2="350" y2="80" />
  </g>

  <!-- Radiating Spoke Lines to Central Hearth -->
  <line x1="350" y1="80" x2="350" y2="155" stroke="${acc}" stroke-width="2" />
  <line x1="440" y1="135" x2="380" y2="170" stroke="${acc}" stroke-width="2" />
  <line x1="440" y1="235" x2="380" y2="200" stroke="${acc}" stroke-width="2" />
  <line x1="350" y1="290" x2="350" y2="215" stroke="${acc}" stroke-width="2" />
  <line x1="260" y1="235" x2="320" y2="200" stroke="${acc}" stroke-width="2" />
  <line x1="260" y1="135" x2="320" y2="170" stroke="${acc}" stroke-width="2" />

  <!-- 6 Peer Tribe Nodes -->
  <circle cx="350" cy="80" r="8" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="440" cy="135" r="8" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="440" cy="235" r="8" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="290" r="8" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="260" cy="235" r="8" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="260" cy="135" r="8" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Central Shared Fire Hearth (Kinetic Energy) -->
  <g class="anim-hearth">
    <circle cx="350" cy="185" r="22" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="185" r="8" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'monetization_button',
			name: 'One-Click Buy Toggle & Sovereign Cashflow',
			title: 'ASYMMETRIC MONETIZATION GATEWAY',
			tag: '[ GERBANG MONETISASI // AKSES DIGITAL SEKALI KLIK ]',
			regex: /(monetisasi|penjualan digital|tombol beli|kursus online|produk digital|cashflow kreator)/i,
			nodes: ['01. FRICTIONLESS CHECKOUT', '02. INSTANT VALUE UNLOCK', '03. ZERO INTERMEDIARY CUT', '04. INDEPENDENT SOVEREIGNTY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes toggleSlide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(45px); } }
    .anim-toggle-knob { animation: toggleSlide 3s infinite ease-in-out; }
  </style>

  <!-- Large Pill Button Container -->
  <g transform="translate(230, 130)">
    <rect x="0" y="0" width="240" height="70" rx="35" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    
    <!-- Left Icon (Lock Shackle) -->
    <g transform="translate(30, 22)">
      <rect x="2" y="12" width="20" height="15" rx="3" fill="#18181b" stroke="#52525B" stroke-width="2" />
      <path d="M 6,12 L 6,6 C 6,2 18,2 18,6 L 18,12" fill="none" stroke="#52525B" stroke-width="2" />
    </g>

    <!-- Kinetic Sliding Toggle Knob with Unlock Status -->
    <g class="anim-toggle-knob" transform="translate(130, 10)">
      <circle cx="25" cy="25" r="25" fill="#18181b" stroke="${acc}" stroke-width="3.5" />
      <!-- Unlocked Shackle Inside -->
      <rect x="15" y="24" width="20" height="15" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2" />
      <path d="M 19,24 L 19,17 C 19,13 31,13 31,17" fill="none" stroke="#FFFFFF" stroke-width="2" />
    </g>
  </g>

  <!-- Dollar Cashflow Indicator Below -->
  <text x="350" y="245" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="${acc}" text-anchor="middle" letter-spacing="4">$ ACCESS UNLOCKED</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'deep_flow_clock',
			name: '4-Hour Monastic Focus Timer & Zero Distraction',
			title: 'MONASTIC DEEP WORK CHRONO',
			tag: '[ JAM KERJA MENDALAM // BLOK WAKTU TANPA GANGGUAN ]',
			regex: /(jam kerja mendalam|deep work|fokus 4 jam|blok waktu fokus|monastic focus|produktivitas tanpa henti)/i,
			nodes: ['01. AIRPLANE MODE DISCONNECT', '02. 90-MINUTE COGNITIVE BLOCK', '03. ZERO CONTEXT SWITCHING', '04. FLOW-STATE COMPOUNDING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes minuteSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-focus-hand { animation: minuteSweep 8s linear infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Circular Stop-Clock Rim -->
  <circle cx="350" cy="185" r="100" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
  
  <!-- 4-Hour Sliced Flow Wedge Highlight (90 to 180 degrees) -->
  <path d="M 350,185 L 350,90 A 95,95 0 0,1 445,185 Z" fill="${acc}" fill-opacity="0.25" stroke="${acc}" stroke-width="2.5" />

  <!-- Chronometer Hour Markers -->
  <line x1="350" y1="90" x2="350" y2="105" stroke="#FFFFFF" stroke-width="3" />
  <line x1="445" y1="185" x2="430" y2="185" stroke="#FFFFFF" stroke-width="3" />
  <line x1="350" y1="280" x2="350" y2="265" stroke="#52525B" stroke-width="2" />
  <line x1="255" y1="185" x2="270" y2="185" stroke="#52525B" stroke-width="2" />

  <!-- Sweeping Kinetic Chrono Needle -->
  <g class="anim-focus-hand">
    <line x1="350" y1="185" x2="350" y2="105" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <circle cx="350" cy="105" r="4" fill="${acc}" />
  </g>

  <!-- Center Hub -->
  <circle cx="350" cy="185" r="8" fill="#18181b" stroke="${acc}" stroke-width="3" />

  <!-- Top Stopwatch Plunger Button -->
  <rect x="342" y="65" width="16" height="20" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'eureka_bulb',
			name: 'Incandescent Filament Bulb & Eureka Breakthrough',
			title: 'EUREKA BREAKTHROUGH FILAMENT',
			tag: '[ BOHLAM EUREKA // KILATAN INSPIRASI IDE BRILIAN ]',
			regex: /(bohlam eureka|ide brilian|eureka|kilatan inspirasi|ide cemerlang|lampu ide)/i,
			nodes: ['01. UNCONSCIOUS INCUBATION', '02. SUDDEN SYNAPSE ARCH', '03. TUNGSTEN FILAMENT FLASH', '04. LUCID ARCHITECTURE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes bulbGleam { 0%, 100% { filter: drop-shadow(0 0 4px ${acc}55); } 50% { filter: drop-shadow(0 0 16px ${acc}); } }
    .anim-bulb { animation: bulbGleam 2s infinite ease-in-out; }
  </style>

  <!-- Screw Base Threading Below -->
  <g transform="translate(325, 230)">
    <rect x="5" y="0" width="40" height="8" rx="2" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <rect x="7" y="8" width="36" height="8" rx="2" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <path d="M 12,16 L 38,16 L 30,24 L 20,24 Z" fill="#18181b" stroke="#52525B" stroke-width="2" />
  </g>

  <!-- Glass Bulb Contour Shell -->
  <g class="anim-bulb">
    <path d="M 330,230 C 310,210 270,170 270,130 C 270,85 305,50 350,50 C 395,50 430,85 430,130 C 430,170 390,210 370,230 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Glowing Coiled Tungsten Filament Inside -->
    <path d="M 335,230 L 335,160 L 345,130 L 355,160 L 350,110 L 365,230" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linejoin="round" />
    <circle cx="350" cy="110" r="5" fill="#FFFFFF" />
  </g>

  <!-- Radiating Idea Spark Rays Around Bulb -->
  <g stroke="${acc}" stroke-width="2" stroke-linecap="round">
    <line x1="350" y1="35" x2="350" y2="15" />
    <line x1="420" y1="65" x2="435" y2="50" />
    <line x1="450" y1="130" x2="470" y2="130" />
    <line x1="280" y1="65" x2="265" y2="50" />
    <line x1="250" y1="130" x2="230" y2="130" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
