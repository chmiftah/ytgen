/**
 * THEME: PEOPLE & RELASI SOSIAL (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themePeople = {
	categoryName: 'people',
	categoryLabel: '👥 Relasi & Dinamika Sosial',
	items: [
		{
			id: 'crowd_divergence',
			name: 'Divergence from the 99% Crowd',
			title: 'NON-CONFORMIST DIVERGENCE',
			tag: '[ KELUAR DARI KAWANAN // THE OUTLIER ]',
			regex: /(orang banyak|kerumunan|mayoritas|non-konformis|berbeda dari orang lain|arus utama|outlier|menolak biasa|kawanan domba)/i,
			nodes: ['01. HERD BEHAVIOR', '02. CRITICAL DETACHMENT', '03. LONE DIRECTION', '04. ASYMMETRIC OUTCOME'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes divergerRise { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    @keyframes herdSway { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
    .anim-diverger { animation: divergerRise 3s ease-in-out infinite; }
    .anim-herd { animation: herdSway 4s ease-in-out infinite; }
  </style>

  <!-- Conformist Flowing Crowd (Dotted Nodes Moving Right) -->
  <g class="anim-herd">
    <!-- Ground Line for Crowd -->
    <line x1="140" y1="260" x2="560" y2="260" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

    <!-- Herd Figure 1 -->
    <circle cx="180" cy="220" r="10" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <path d="M 170,250 C 170,235 190,235 190,250" fill="none" stroke="#52525B" stroke-width="2" />

    <!-- Herd Figure 2 -->
    <circle cx="230" cy="220" r="10" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <path d="M 220,250 C 220,235 240,235 240,250" fill="none" stroke="#52525B" stroke-width="2" />

    <!-- Herd Figure 3 -->
    <circle cx="280" cy="220" r="10" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <path d="M 270,250 C 270,235 290,235 290,250" fill="none" stroke="#52525B" stroke-width="2" />

    <!-- Herd Figure 4 -->
    <circle cx="420" cy="220" r="10" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <path d="M 410,250 C 410,235 430,235 430,250" fill="none" stroke="#52525B" stroke-width="2" />

    <!-- Herd Figure 5 -->
    <circle cx="470" cy="220" r="10" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <path d="M 460,250 C 460,235 480,235 480,250" fill="none" stroke="#52525B" stroke-width="2" />

    <!-- Herd Figure 6 -->
    <circle cx="520" cy="220" r="10" fill="#18181b" stroke="#52525B" stroke-width="2" />
    <path d="M 510,250 C 510,235 530,235 530,250" fill="none" stroke="#52525B" stroke-width="2" />
  </g>

  <!-- The Outlier Divergent Individual (Ascending Golden Glow) -->
  <g class="anim-diverger">
    <!-- Upward Trajectory Vector -->
    <line x1="350" y1="230" x2="350" y2="135" stroke="${acc}" stroke-width="2.5" stroke-dasharray="4,4" />
    <polygon points="345,140 350,125 355,140" fill="${acc}" />

    <!-- Outlier Figure -->
    <circle cx="350" cy="165" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="165" r="5" fill="${acc}" />
    <path d="M 335,205 C 335,188 365,188 365,205" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'crown',
			name: 'Sovereign Individual & Kedaulatan Diri',
			title: 'SOVEREIGN INDIVIDUAL',
			tag: '[ KEDAULATAN PERSONAL // AUTONOMOUS LIFE ]',
			regex: /(pemimpin|kedaulatan diri|otonom|mahkota|kepemimpinan|sovereign individual|raja atas diri|swasembada hidup)/i,
			nodes: ['01. RADICAL RESPONSIBILITY', '02. RESOURCE AUTONOMY', '03. DECISION FREEDOM', '04. UNASSAILABLE SOVEREIGNTY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes crownGleam { 0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 4px ${acc}55); } 50% { transform: translateY(-8px); filter: drop-shadow(0 0 14px ${acc}aa); } }
    @keyframes jewelPulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    .anim-crown { animation: crownGleam 3.5s ease-in-out infinite; }
    .anim-jewel { animation: jewelPulse 2s infinite ease-in-out; }
  </style>

  <!-- Autonomous Circle of Influence -->
  <circle cx="350" cy="200" r="90" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="4,6" />

  <g class="anim-crown">
    <!-- Minimalist Geometric 3-Point Crown -->
    <path d="M 270,190 L 290,130 L 325,160 L 350,110 L 375,160 L 410,130 L 430,190 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
    
    <!-- Crown Base Band -->
    <line x1="270" y1="190" x2="430" y2="190" stroke="${acc}" stroke-width="4" stroke-linecap="round" />
    
    <!-- Crown Peak Jewels -->
    <circle cx="290" cy="130" r="4.5" fill="${acc}" class="anim-jewel" />
    <circle cx="350" cy="110" r="6" fill="${acc}" />
    <circle cx="410" cy="130" r="4.5" fill="${acc}" class="anim-jewel" />

    <!-- Center Sovereign Eye / Jewel -->
    <polygon points="350,150 362,168 350,186 338,168" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="350" cy="168" r="3" fill="${acc}" />
  </g>

  <!-- Base Pedestal Line -->
  <line x1="240" y1="240" x2="460" y2="240" stroke="#3f3f46" stroke-width="2" />
  <line x1="280" y1="250" x2="420" y2="250" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="4,4" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'handshake_deal',
			name: 'Win-Win Alliance & Handshake',
			title: 'SYMBIOTIC ALLIANCE',
			tag: '[ ALIANSI STRATEGIS // WIN-WIN COVENANT ]',
			regex: /(kerja sama|kolaborasi|kesepakatan|kemitraan|aliansi|perjanjian|win-win|partner bisnis|mutualisme)/i,
			nodes: ['01. MUTUAL VALUE ALIGNMENT', '02. TRANSPARENT CONTRACT', '03. JOINT EXECUTION', '04. MULTIPLIED HARVEST'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes claspGrip { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    @keyframes dealSpark { 0% { opacity: 0; r: 2; } 50% { opacity: 1; r: 16; } 100% { opacity: 0; r: 2; } }
    .anim-clasp { animation: claspGrip 3s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-spark-deal { animation: dealSpark 2.5s ease-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Horizon Line -->
  <line x1="140" y1="280" x2="560" y2="280" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Partnership Energy Field -->
  <circle cx="350" cy="185" r="16" fill="none" stroke="${acc}" stroke-width="2" class="anim-spark-deal" stroke-dasharray="3,3" />

  <!-- Geometric Minimalist Handshake Wireframe -->
  <g class="anim-clasp">
    <!-- Left Arm & Sleeve -->
    <path d="M 180,210 L 260,210 L 310,185 L 340,185" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 180,235 L 250,235 L 300,210 L 330,210" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
    
    <!-- Right Arm & Sleeve -->
    <path d="M 520,210 L 440,210 L 390,185 L 360,185" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 520,235 L 450,235 L 400,210 L 370,210" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" />

    <!-- Interlocking Hand Clasp Climax -->
    <rect x="330" y="172" width="40" height="30" rx="6" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <line x1="350" y1="172" x2="350" y2="202" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="350" cy="187" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'network_hub',
			name: 'Social Capital & Network Centrality',
			title: 'METCALFE NETWORK CAPITAL',
			tag: '[ METCALFE S LAW // KAPITAL SOSIAL ]',
			regex: /(jaringan relasi|social capital|koneksi sosial|networking|pusat relasi|relasi luas|jejaring|sentralitas jaringan)/i,
			nodes: ['01. NODAL ATTRACTION', '02. TIE STRENGTH', '03. METCALFE MULTIPLIER', '04. EXPONENTIAL INFLUENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes netPulse { 0% { stroke-opacity: 0.3; } 50% { stroke-opacity: 1; } 100% { stroke-opacity: 0.3; } }
    @keyframes hubBreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    .anim-net-link { animation: netPulse 2.5s infinite ease-in-out; }
    .anim-hub { animation: hubBreath 3s infinite ease-in-out; transform-origin: 350px 185px; }
  </style>

  <!-- Network Interconnection Spoke Rays -->
  <g stroke="#52525B" stroke-width="1.5">
    <line x1="350" y1="185" x2="240" y2="130" stroke="${acc}" stroke-width="2" class="anim-net-link" />
    <line x1="350" y1="185" x2="460" y2="130" />
    <line x1="350" y1="185" x2="480" y2="220" stroke="${acc}" stroke-width="2" />
    <line x1="350" y1="185" x2="350" y2="270" />
    <line x1="350" y1="185" x2="220" y2="220" />
    <!-- Peripheral Peer Ties -->
    <line x1="240" y1="130" x2="460" y2="130" stroke-dasharray="4,4" />
    <line x1="460" y1="130" x2="480" y2="220" stroke-dasharray="4,4" />
    <line x1="480" y1="220" x2="350" y2="270" stroke-dasharray="4,4" />
    <line x1="350" y1="270" x2="220" y2="220" stroke-dasharray="4,4" />
    <line x1="220" y1="220" x2="240" y2="130" stroke-dasharray="4,4" />
  </g>

  <!-- Outer Peripheral Nodes -->
  <circle cx="240" cy="130" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="460" cy="130" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="480" cy="220" r="12" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="270" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="220" cy="220" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

  <!-- Center Sovereign Hub Node -->
  <g class="anim-hub">
    <circle cx="350" cy="185" r="28" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <circle cx="350" cy="185" r="18" fill="#18181b" stroke="${acc}" stroke-width="2" stroke-dasharray="4,3" />
    <circle cx="350" cy="185" r="6" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'empathy_bridge',
			name: 'Resonant Empathy & Deep Listening',
			title: 'EMPATHIC RESONANCE',
			tag: '[ RESONANSI MENDENGARKAN // KONEKSI BATIN ]',
			regex: /(empati|mendengarkan secara mendalam|koneksi batin|saling mengerti|hubungan manusia|komunikasi empatik|frekuensi sama)/i,
			nodes: ['01. EGO DECENTERING', '02. ACTIVE ATTUNEMENT', '03. EMOTIONAL RESONANCE', '04. COMMUNION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes waveOverlap { 0%, 100% { stroke-opacity: 0.4; } 50% { stroke-opacity: 1; } }
    @keyframes bridgeGlow { 0% { stroke-dashoffset: 30; } 100% { stroke-dashoffset: 0; } }
    .anim-wave-resonance { animation: waveOverlap 2.5s infinite ease-in-out; }
    .anim-bridge-cable { stroke-dasharray: 5,5; animation: bridgeGlow 1.5s linear infinite; }
  </style>

  <!-- Left Entity Silhouette -->
  <g>
    <circle cx="230" cy="150" r="18" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <path d="M 205,210 C 205,185 255,185 255,210" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- Right Entity Silhouette -->
  <g>
    <circle cx="470" cy="150" r="18" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <path d="M 445,210 C 445,185 495,185 495,210" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- Harmonic Resonance Bridge Waves in Between -->
  <g class="anim-wave-resonance">
    <path d="M 260,180 C 300,140 320,220 350,180 C 380,140 400,220 440,180" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <path d="M 260,180 C 300,220 320,140 350,180 C 380,220 400,140 440,180" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
  </g>

  <!-- Direct Connection Beam Cable -->
  <line x1="260" y1="180" x2="440" y2="180" stroke="${acc}" stroke-width="1.5" class="anim-bridge-cable" />

  <!-- Center Resonant Core Spark -->
  <circle cx="350" cy="180" r="6" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'torch_mentor',
			name: 'Passing the Wisdom Torch & Legacy',
			title: 'WISDOM TRANSMISSION',
			tag: '[ TRANSFER KEBIJAKSANAAN // MENTOR TO APPRENTICE ]',
			regex: /(mentor|murid|guru|mewariskan ilmu|bimbingan|transfer pengetahuan|legacy hidup|estafet kebijaksanaan|bimbing)/i,
			nodes: ['01. LIVED MASTERY', '02. CODIFIED PRINCIPLES', '03. PROTÉGÉ TRANSMISSION', '04. PERPETUAL LEGACY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes flameFlicker { 0%, 100% { transform: scale(1) translateY(0); } 50% { transform: scale(1.15) translateY(-5px); } }
    @keyframes torchArch { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-flame { animation: flameFlicker 1.8s ease-in-out infinite; transform-origin: 350px 140px; }
    .anim-arc-torch { stroke-dasharray: 6,4; animation: torchArch 2s linear infinite; }
  </style>

  <!-- Left: Senior Mentor Figure -->
  <g>
    <circle cx="220" cy="160" r="16" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <path d="M 195,230 C 195,195 245,195 245,230" fill="none" stroke="#FFFFFF" stroke-width="3" />
    <!-- Mentor's Torch Handle -->
    <line x1="250" y1="190" x2="310" y2="155" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Right: Young Apprentice Figure -->
  <g>
    <circle cx="480" cy="175" r="13" fill="#18181b" stroke="#52525B" stroke-width="2.5" />
    <path d="M 460,230 C 460,205 500,205 500,230" fill="none" stroke="#52525B" stroke-width="2.5" />
    <!-- Receiving Torch Handle -->
    <line x1="450" y1="200" x2="390" y2="165" stroke="#52525B" stroke-width="2.5" stroke-linecap="round" />
  </g>

  <!-- Transmitted Fire Torch Apex -->
  <g class="anim-flame">
    <path d="M 350,110 C 330,135 335,160 350,170 C 365,160 370,135 350,110 Z" fill="${acc}" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="350" cy="150" r="5" fill="#FFFFFF" />
  </g>

  <!-- Wisdom Arc Line -->
  <path d="M 230,140 Q 350,70 470,155" fill="none" stroke="${acc}" stroke-width="2" class="anim-arc-torch" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'tribe_fire',
			name: 'Inner Circle Campfire & Aliansi Inti',
			title: 'INNER CIRCLE SANCTUARY',
			tag: '[ LINGKARAN TERPERCAYA // TRIBE SEJATI ]',
			regex: /(lingkaran dekat|inner circle|sahabat sejati|komunitas inti|circle pertemanan|tribe sejati|teman sejati|orang terdekat)/i,
			nodes: ['01. VALUE RESONANCE', '02. VULNERABILITY PACT', '03. ZERO JUDGMENT', '04. COLLECTIVE MULTIPLICATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes fireDance { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2) translateY(-4px); } }
    @keyframes circleOrbitSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(5deg); } }
    .anim-fire-core { animation: fireDance 1.6s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-tribe { animation: circleOrbitSway 6s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Sacred Circle Perimeter Barrier -->
  <circle cx="350" cy="185" r="95" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="4,6" />

  <!-- Center Communal Fire -->
  <g class="anim-fire-core">
    <!-- Fire Wood Logs -->
    <line x1="330" y1="205" x2="370" y2="195" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <line x1="330" y1="195" x2="370" y2="205" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <!-- Flame Tongue -->
    <path d="M 350,150 Q 365,170 350,195 Q 335,170 350,150 Z" fill="${acc}" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="350" cy="180" r="4" fill="#FFFFFF" />
  </g>

  <!-- 4 Sovereign Members Sitting Around Fire -->
  <g class="anim-tribe">
    <!-- Top Member -->
    <circle cx="350" cy="105" r="11" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="350" y1="116" x2="350" y2="135" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" />

    <!-- Right Member -->
    <circle cx="430" cy="185" r="11" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="419" y1="185" x2="400" y2="185" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" />

    <!-- Bottom Member -->
    <circle cx="350" cy="265" r="11" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="350" y1="254" x2="350" y2="235" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" />

    <!-- Left Member -->
    <circle cx="270" cy="185" r="11" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="281" y1="185" x2="300" y2="185" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'charisma_aura',
			name: 'Charismatic Aura & Gravitational Influence',
			title: 'CHARISMATIC PRESENCE',
			tag: '[ AURA MAGNETIS // WIBAWA & PENGARUH ]',
			regex: /(karisma|daya tarik sosial|aura percaya diri|magnetisme|wibawa|pengaruh sosial|pesona|gravitasi sosial)/i,
			nodes: ['01. INNER GROUNDEDNESS', '02. UNREACTIVE POISE', '03. MAGNETIC ATTENTION', '04. NATURAL ASCENDANCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes auraRadiate { 0% { r: 35; opacity: 0.9; } 100% { r: 105; opacity: 0; } }
    @keyframes presenceBreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .anim-aura-ring { animation: auraRadiate 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
    .anim-presence { animation: presenceBreath 3.5s ease-in-out infinite; transform-origin: 350px 180px; }
  </style>

  <!-- Radiating Magnetic Aura Rings -->
  <circle cx="350" cy="180" r="45" fill="none" stroke="${acc}" stroke-width="2" class="anim-aura-ring" />
  <circle cx="350" cy="180" r="75" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-dasharray="4,6" opacity="0.4" />
  <circle cx="350" cy="180" r="105" fill="none" stroke="#52525B" stroke-width="1" stroke-dasharray="2,4" opacity="0.3" />

  <!-- Central Charismatic Figure -->
  <g class="anim-presence">
    <!-- Radiant Halo Arc -->
    <path d="M 315,115 A 40,40 0 0,1 385,115" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
    
    <!-- Head -->
    <circle cx="350" cy="145" r="20" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="145" r="6" fill="${acc}" />

    <!-- Shoulders & Posture -->
    <path d="M 290,230 C 290,190 410,190 410,230" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <line x1="350" y1="195" x2="350" y2="230" stroke="${acc}" stroke-width="2.5" />
  </g>

  <!-- Gravitational Pull Rays Inward -->
  <line x1="180" y1="180" x2="230" y2="180" stroke="${acc}" stroke-width="1.8" stroke-dasharray="3,3" />
  <line x1="520" y1="180" x2="470" y2="180" stroke="${acc}" stroke-width="1.8" stroke-dasharray="3,3" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'shield_boundaries',
			name: 'The Sovereign "No" & Batasan Diri',
			title: 'SOVEREIGN BOUNDARIES',
			tag: '[ BATASAN INTEGRITAS // POWER OF NO ]',
			regex: /(batasan diri|menolak|berani berkata tidak|boundaries|pagar pribadi|menjaga batas|proteksi diri dari orang lain|garis tegas)/i,
			nodes: ['01. VALUE CLARITY', '02. FIRM DEMARCATION', '03. GUILTLESS NO', '04. PROTECTED SOVEREIGNTY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wallDefend { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; } }
    @keyframes bounceArrow { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(8px); } }
    .anim-defend { animation: wallDefend 2s infinite ease-in-out; }
    .anim-bounce { animation: bounceArrow 1.8s infinite ease-in-out; }
  </style>

  <!-- Left: Protected Core Self -->
  <g>
    <circle cx="240" cy="185" r="22" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="240" cy="185" r="8" fill="${acc}" />
    <path d="M 205,250 C 205,220 275,220 275,250" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- Center: Impenetrable Boundary Wall (The Sovereign No) -->
  <g class="anim-defend">
    <line x1="350" y1="90" x2="350" y2="280" stroke="${acc}" stroke-width="4.5" stroke-linecap="round" />
    <line x1="338" y1="100" x2="338" y2="270" stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="4,4" />
    <rect x="335" y="165" width="30" height="40" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <text x="350" y="190" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="${acc}" text-anchor="middle">NO</text>
  </g>

  <!-- Right: Inward Noise / Demands Bouncing Off -->
  <g class="anim-bounce">
    <path d="M 480,140 L 390,140 L 410,125" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
    <path d="M 480,230 L 390,230 L 410,245" fill="none" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
    <line x1="490" y1="185" x2="400" y2="185" stroke="#52525B" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4,4" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'synergy_gears',
			name: 'Collaborative Synergy & 1+1=3',
			title: 'EXPONENTIAL SYNERGY',
			tag: '[ SINERGI KOLEKTIF // EFEK MULTIPLIKASI ]',
			regex: /(sinergi tim|kekuatan tim|multiplikasi tenaga|kohesi kelompok|kekuatan kolektif|kerjasama tim|sinergi 1\+1=3)/i,
			nodes: ['01. DIVERGENT ROLES', '02. PRECISION MESH', '03. ZERO SLIPPAGE', '04. 1+1=3 MULTIPLICATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes gearCW { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes gearCCW { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
    .anim-gear-1 { animation: gearCW 12s linear infinite; transform-origin: 300px 185px; }
    .anim-gear-2 { animation: gearCCW 12s linear infinite; transform-origin: 400px 185px; }
  </style>

  <!-- Left Cog Gear (Entity A) -->
  <g class="anim-gear-1">
    <circle cx="300" cy="185" r="50" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="300" cy="185" r="20" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <!-- Gear Cogs -->
    <line x1="300" y1="125" x2="300" y2="140" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
    <line x1="300" y1="230" x2="300" y2="245" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
    <line x1="240" y1="185" x2="255" y2="185" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
    <line x1="345" y1="185" x2="360" y2="185" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
  </g>

  <!-- Right Cog Gear (Entity B) -->
  <g class="anim-gear-2">
    <circle cx="400" cy="185" r="50" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="400" cy="185" r="20" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <!-- Gear Cogs -->
    <line x1="400" y1="125" x2="400" y2="140" stroke="${acc}" stroke-width="6" stroke-linecap="round" />
    <line x1="400" y1="230" x2="400" y2="245" stroke="${acc}" stroke-width="6" stroke-linecap="round" />
    <line x1="340" y1="185" x2="355" y2="185" stroke="${acc}" stroke-width="6" stroke-linecap="round" />
    <line x1="445" y1="185" x2="460" y2="185" stroke="${acc}" stroke-width="6" stroke-linecap="round" />
  </g>

  <!-- Intermeshing Nexus Spark -->
  <circle cx="350" cy="185" r="6" fill="#FFFFFF" />

  <!-- Multiplier Formula Floating Above -->
  <text x="350" y="105" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="${acc}" text-anchor="middle">1 + 1 = 3</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
