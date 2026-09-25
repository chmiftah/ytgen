/**
 * THEME: ECONOMY & MAKROEKONOMI (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeEconomy = {
	categoryName: 'economy',
	categoryLabel: '🌐 Ekonomi Makro & Pasar',
	items: [
		{
			id: 'scales',
			name: 'Hukum Keseimbangan Pasar',
			title: 'LAW OF EQUILIBRIUM',
			tag: '[ KESEIMBANGAN & TRADE-OFF ]',
			regex: /(timbangan|scales|keseimbangan pasar|trade-off ekonomi|hukum keseimbangan|ekuilibrium|sebanding)/i,
			nodes: ['01. COST / SACRIFICE', '02. THE FULCRUM', '03. REWARD / LEVERAGE', '04. BALANCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes tiltBeam { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-4deg); } }
    .anim-beam { animation: tiltBeam 4s ease-in-out infinite; transform-origin: 350px 145px; }
  </style>

  <!-- Fulcrum Base Pillar -->
  <polygon points="350,145 320,320 380,320" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="145" r="7" fill="${acc}" />
  <line x1="280" y1="320" x2="420" y2="320" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />

  <!-- Animated Tilting Crossbeam -->
  <g class="anim-beam">
    <line x1="160" y1="145" x2="540" y2="145" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <circle cx="160" cy="145" r="5" fill="${acc}" />
    <circle cx="540" cy="145" r="5" fill="${acc}" />

    <!-- Left Hanging Pan (Effort / Cost) -->
    <line x1="160" y1="145" x2="120" y2="230" stroke="#71717A" stroke-width="1.8" />
    <line x1="160" y1="145" x2="200" y2="230" stroke="#71717A" stroke-width="1.8" />
    <path d="M 110 230 Q 160 255, 210 230 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <rect x="145" y="200" width="30" height="30" fill="#18181b" stroke="#71717A" stroke-width="1.8" />
    <text x="160" y="219" font-family="'Inter', sans-serif" font-size="9" font-weight="800" fill="#A1A1AA" text-anchor="middle">EFFORT</text>

    <!-- Right Hanging Pan (Leverage / Return) -->
    <line x1="540" y1="145" x2="500" y2="230" stroke="#71717A" stroke-width="1.8" />
    <line x1="540" y1="145" x2="580" y2="230" stroke="#71717A" stroke-width="1.8" />
    <path d="M 490 230 Q 540 255, 590 230 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <polygon points="540,185 520,225 560,225" fill="#18181b" stroke="${acc}" stroke-width="2" />
    <text x="540" y="217" font-family="'Inter', sans-serif" font-size="9" font-weight="900" fill="${acc}" text-anchor="middle">LEVERAGE</text>
  </g>

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'blocks',
			name: 'Aset Bisnis Terungkit',
			title: 'BUILDS YOUR BUSINESS',
			tag: '[ HIGH LEVERAGE ASSETS ]',
			regex: /(bangun bisnis|bangun aset|aset leverage|arsitektur bisnis|create business|media dan kode)/i,
			nodes: ['01. CREATION', '02. DISTRIBUTION', '03. AUTOMATION', '04. FREEDOM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes blockLevitate { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .anim-iso-block { animation: blockLevitate 3s ease-in-out infinite; }
  </style>

  <!-- Bottom Left Isometric Block -->
  <polygon points="260,250 310,220 310,265 260,295" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <polygon points="310,220 360,250 360,295 310,265" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
  <polygon points="260,250 310,220 360,250 310,280" fill="#18181b" stroke="#71717A" stroke-width="2" />

  <!-- Bottom Right Isometric Block -->
  <polygon points="360,250 410,220 410,265 360,295" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <polygon points="410,220 460,250 460,295 410,265" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
  <polygon points="360,250 410,220 460,250 410,280" fill="#18181b" stroke="#71717A" stroke-width="2" />

  <!-- Top Floating Golden Sovereign Asset Block -->
  <g class="anim-iso-block">
    <polygon points="310,160 360,130 360,185 310,215" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <polygon points="360,130 410,160 410,215 360,185" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <polygon points="310,160 360,130 410,160 360,190" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="360" cy="160" r="5" fill="${acc}" />
  </g>

  <text x="350" y="80" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="345" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="${acc}" text-anchor="middle" letter-spacing="2">CODE & MEDIA // PERMISSIONLESS LEVERAGE</text>
`
		},
		{
			id: 'supply_demand',
			name: 'Kurva Supply & Demand',
			title: 'SUPPLY & DEMAND EQUILIBRIUM',
			tag: '[ PENAWARAN & PERMINTAAN ]',
			regex: /(supply demand|penawaran dan permintaan|hukum pasar|titik ekuilibrium harga|kurva permintaan)/i,
			nodes: ['01. DEMAND SLIGHT', '02. SUPPLY SCARCITY', '03. EQUILIBRIUM POINT', '04. PRICE CLEARING'],
			renderSVG: (acc, title, nodes) => `
  <!-- Axes -->
  <line x1="160" y1="290" x2="540" y2="290" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
  <line x1="160" y1="290" x2="160" y2="90" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
  <text x="145" y="100" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="end">PRICE (P)</text>
  <text x="540" y="310" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">QUANTITY (Q)</text>

  <!-- Demand Line (Downward Slope) -->
  <line x1="190" y1="120" x2="510" y2="260" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
  <text x="525" y="265" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#ef4444">D</text>

  <!-- Supply Line (Upward Slope) -->
  <line x1="190" y1="260" x2="510" y2="120" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
  <text x="525" y="125" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#3b82f6">S</text>

  <!-- Equilibrium Intersection (Gold Pulse Node) -->
  <circle cx="350" cy="190" r="8" fill="${acc}" />
  <circle cx="350" cy="190" r="16" fill="none" stroke="${acc}" stroke-width="1.5" stroke-dasharray="3,3" />

  <!-- Dotted Drop Lines to Axes -->
  <line x1="350" y1="190" x2="160" y2="190" stroke="${acc}" stroke-width="1.5" stroke-dasharray="4,4" />
  <line x1="350" y1="190" x2="350" y2="290" stroke="${acc}" stroke-width="1.5" stroke-dasharray="4,4" />
  <text x="350" y="170" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">EQUILIBRIUM (P*, Q*)</text>

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'global_trade',
			name: 'Rute Perdagangan Global',
			title: 'GLOBAL TRADE ARTERY',
			tag: '[ PERDAGANGAN INTERNASIONAL ]',
			regex: /(perdagangan global|ekspor impor|rantai pasok global|global trade|logistik dunia|pasar internasional)/i,
			nodes: ['01. LOCAL PRODUCTION', '02. SHIPPING ARTERY', '03. TARIFF NAVIGATION', '04. GLOBAL CONSUMPTION'],
			renderSVG: (acc, title, nodes) => `
  <!-- Wireframe Earth Globe Coordinates -->
  <circle cx="350" cy="200" r="95" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
  <ellipse cx="350" cy="200" rx="95" ry="40" fill="none" stroke="#27272a" stroke-width="1.5" stroke-dasharray="4,4" />
  <line x1="350" y1="105" x2="350" y2="295" stroke="#27272a" stroke-width="1.5" />

  <!-- Geometric Cargo Vessel in Center -->
  <polygon points="300,215 400,215 385,240 315,240" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <!-- Containers on Deck -->
  <rect x="320" y="195" width="22" height="20" fill="#18181b" stroke="${acc}" stroke-width="2" />
  <rect x="345" y="195" width="22" height="20" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <rect x="370" y="195" width="20" height="20" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Navigational Trade Routes Orbiting -->
  <path d="M 190 200 C 230 110, 470 110, 510 200 C 470 290, 230 290, 190 200" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="6,6" />

  <!-- Trade Ports -->
  <circle cx="210" cy="180" r="5" fill="${acc}" />
  <circle cx="490" cy="220" r="5" fill="#FFFFFF" />

  <text x="350" y="65" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'monopoly_moat',
			name: 'Parit Pertahanan Bisnis (Moat)',
			title: 'THE ECONOMIC MOAT',
			tag: '[ KEUNGGULAN KOMPETITIF ]',
			regex: /(economic moat|parit pertahanan|monopoli bisnis|keunggulan kompetitif|unassailable|warren buffett moat)/i,
			nodes: ['01. PROPRIETARY TECH', '02. NETWORK EFFECT', '03. HIGH SWITCHING COST', '04. THE MONOPOLY MOAT'],
			renderSVG: (acc, title, nodes) => `
  <!-- Castle Fortress Silhouette (Center) -->
  <rect x="290" y="150" width="120" height="90" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <!-- Castle Battlements -->
  <polygon points="280,150 280,120 300,120 300,135 315,135 315,120 335,120 335,135 365,135 365,120 385,120 385,135 400,135 400,120 420,120 420,150" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  
  <!-- Castle Gate Archway -->
  <path d="M 335 240 L 335 200 A 15 15 0 0 1 365 200 L 365 240 Z" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Concentric Outer Water Moat Barrier -->
  <ellipse cx="350" cy="265" rx="190" ry="40" fill="none" stroke="${acc}" stroke-width="3" stroke-dasharray="8,6" />
  <ellipse cx="350" cy="265" rx="220" ry="50" fill="none" stroke="#52525B" stroke-width="1.8" />

  <text x="350" y="80" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="355" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="${acc}" text-anchor="middle" letter-spacing="2">UNASSAILABLE PRICING POWER // DEFENSIVE MOAT</text>
`
		},
		{
			id: 'fiat_printer',
			name: 'Mesin Cetak Uang Sentral',
			title: 'CURRENCY DEBASEMENT',
			tag: '[ CETAK UANG FIAT ]',
			regex: /(cetak uang|fiat money|bank sentral|devaluasi mata uang|money printer|inflasi buatan)/i,
			nodes: ['01. UNLIMITED LIQUIDITY', '02. CENTRAL ROLLERS', '03. DILUTION CASCADE', '04. INTRINSIC RESET'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes rollCycle { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .anim-roller { animation: rollCycle 4s linear infinite; }
  </style>

  <!-- Dual Counter-Rotating Cylinder Rollers -->
  <g class="anim-roller" style="transform-origin: 350px 140px;">
    <circle cx="350" cy="140" r="38" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <line x1="312" y1="140" x2="388" y2="140" stroke="${acc}" stroke-width="2.5" />
    <line x1="350" y1="102" x2="350" y2="178" stroke="${acc}" stroke-width="2.5" />
  </g>

  <g class="anim-roller" style="transform-origin: 350px 220px;">
    <circle cx="350" cy="220" r="38" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <line x1="312" y1="220" x2="388" y2="220" stroke="${acc}" stroke-width="2.5" />
    <line x1="350" y1="182" x2="350" y2="258" stroke="${acc}" stroke-width="2.5" />
  </g>

  <!-- Endless Paper Sheets Spewing Downward -->
  <path d="M 350 180 L 350 310" stroke="#FFFFFF" stroke-width="18" stroke-dasharray="20,12" opacity="0.8" />
  <rect x="330" y="270" width="40" height="25" fill="#18181b" stroke="${acc}" stroke-width="2" />
  <text x="350" y="287" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="${acc}" text-anchor="middle">$</text>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="360" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#ef4444" text-anchor="middle" letter-spacing="2">PRINTED OUT OF THIN AIR // DEBASEMENT</text>
`
		},
		{
			id: 'business_cycle',
			name: 'Gelombang Siklus Resesi & Boom',
			title: 'THE BUSINESS CYCLE',
			tag: '[ SIKLUS RESESI & BOOM ]',
			regex: /(siklus bisnis|resesi|boom bust|kontraksi ekonomi|ekspansi ekonomi|krisis ekonomi|business cycle)/i,
			nodes: ['01. EXPANSION (BOOM)', '02. PEAK EUPHORIA', '03. CONTRACTION (RECESSION)', '04. TROUGH RECOVERY'],
			renderSVG: (acc, title, nodes) => `
  <!-- Equilibrium Horizon Baseline -->
  <line x1="120" y1="210" x2="580" y2="210" stroke="#52525B" stroke-width="1.8" stroke-dasharray="6,6" />
  <text x="590" y="214" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#71717A">BASELINE</text>

  <!-- Sine Wave Economic Cycle Path -->
  <path d="M 140 210 Q 230 70, 310 210 T 480 210 T 570 120" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

  <!-- Peak Euphoria Node -->
  <circle cx="230" cy="140" r="7" fill="${acc}" />
  <text x="230" y="115" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">BOOM / PEAK</text>

  <!-- Trough Recession Node -->
  <circle cx="395" cy="280" r="7" fill="#ef4444" />
  <text x="395" y="310" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="#ef4444" text-anchor="middle">RECESSION / TROUGH</text>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'labor_capital',
			name: 'Tenaga Kerja vs Mesin Kapital',
			title: 'LABOR VS CAPITAL',
			tag: '[ TENAGA VS LEVERAGE ]',
			regex: /(tenaga kerja|modal vs tenaga|buruh vs modal|labor capital|leverage kapital|keringat vs sistem)/i,
			nodes: ['01. LINEAR TIME', '02. PHYSICAL EXERTION', '03. CAPITAL MACHINERY', '04. UNLINKING OUTPUT'],
			renderSVG: (acc, title, nodes) => `
  <!-- Divider Axis -->
  <line x1="350" y1="90" x2="350" y2="320" stroke="#3f3f46" stroke-width="2" stroke-dasharray="4,4" />

  <!-- Left: Linear Labor (Human Stickman pushing heavy boulder) -->
  <circle cx="180" cy="180" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <line x1="180" y1="190" x2="195" y2="230" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="195" y1="230" x2="175" y2="270" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="195" y1="230" x2="215" y2="270" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="240" cy="210" r="28" fill="#18181b" stroke="#71717A" stroke-width="2" />
  <text x="200" y="305" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#A1A1AA" text-anchor="middle">LABOR: 1 HOUR = 1X</text>

  <!-- Right: Capital Machinery (Massive Turbine Generator) -->
  <circle cx="500" cy="205" r="45" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="500" cy="205" r="14" fill="${acc}" />
  <line x1="500" y1="140" x2="500" y2="270" stroke="${acc}" stroke-width="2" />
  <line x1="435" y1="205" x2="565" y2="205" stroke="${acc}" stroke-width="2" />
  <text x="500" y="305" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">CAPITAL: UNBOUNDED</text>

  <text x="350" y="60" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'tax_funnel',
			name: 'Corong Efisiensi Pajak',
			title: 'CAPITAL PRESERVATION FUNNEL',
			tag: '[ EFISIENSI FISKAL ]',
			regex: /(pajak|efisiensi pajak|tax deduction|penyusutan pajak|fiskal modal|retensi laba bersih)/i,
			nodes: ['01. GROSS INCOME', '02. STRATEGIC DEDUCTIONS', '03. LEGAL SHELTER', '04. NET RETENTION'],
			renderSVG: (acc, title, nodes) => `
  <!-- Top Wide Gross Inflow -->
  <polygon points="210,120 490,120 380,240 320,240" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="350" y="150" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">GROSS REVENUE</text>

  <!-- Side Tax Deduction Vents -->
  <line x1="380" y1="200" x2="440" y2="180" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3" />
  <text x="450" y="185" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#ef4444">TAX DRAIN</text>

  <!-- Bottom Filtered Net Capital Spout -->
  <rect x="325" y="240" width="50" height="50" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="265" r="8" fill="${acc}" />

  <!-- Preserved Foundation Box -->
  <rect x="290" y="300" width="120" height="35" rx="4" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <text x="350" y="322" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">NET RETAINED</text>

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'speculative_bubble',
			name: 'Gelembung Spekulasi Pecah',
			title: 'THE SPECULATIVE BUBBLE',
			tag: '[ GELEMBUNG EKONOMI ]',
			regex: /(gelembung ekonomi|bubble burst|spekulasi pasar|histeria pasar|overvalued|fomo pasar)/i,
			nodes: ['01. DISPLACEMENT', '02. BOOM SPREAD', '03. EUPHORIC BUBBLE', '04. FRACTURE BURST'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes bubbleVibrate { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    .anim-bubble { animation: bubbleVibrate 1.2s ease-in-out infinite; transform-origin: 350px 200px; }
  </style>

  <!-- Fragile Thin Bubble Outline (Vibrating) -->
  <g class="anim-bubble">
    <circle cx="350" cy="200" r="105" fill="#18181b" stroke="${acc}" stroke-width="2" stroke-dasharray="6,4" />
    <circle cx="350" cy="200" r="95" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.6" />
    
    <!-- Fracture Crack Lines through Bubble -->
    <path d="M 350 95 L 360 135 L 335 170 L 370 215 L 340 260 L 350 305" fill="none" stroke="#ef4444" stroke-width="2.5" />
    <!-- Pressure Needle Ready to Pop -->
    <line x1="475" y1="130" x2="435" y2="155" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  </g>

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="355" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#ef4444" text-anchor="middle" letter-spacing="2">EUPHORIA MEETS REALITY // SPECULATION BURST</text>
`
		}
	]
};
