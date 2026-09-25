/**
 * THEME: FINANCE & FINANSIAL (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeFinance = {
	categoryName: 'finance',
	categoryLabel: '💰 Finansial & Investasi',
	items: [
		{
			id: 'money',
			name: 'Financial Leverage & Aset',
			title: 'FINANCIAL LEVERAGE',
			tag: '[ ARSITEKTUR KEKAYAAN ]',
			regex: /(\buang\b|duit|kekayaan|finansial|modal|profit|omset|passive income|gaji|rupiah|dolar|wealth|investasi|cuan|finances|harta|\bkaya\b)/i,
			nodes: ['01. VALUE CREATION', '02. CASH FLOW', '03. CAPITAL ASSETS', '04. FREEDOM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes coinSpin { 0% { transform: scaleX(1); } 50% { transform: scaleX(0.7); } 100% { transform: scaleX(1); } }
    @keyframes barRise { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.15); } }
    .anim-coin { animation: coinSpin 4s ease-in-out infinite; transform-origin: 350px 200px; }
    .anim-bar-1 { animation: barRise 2.5s ease-in-out infinite; transform-origin: 160px 280px; }
    .anim-bar-2 { animation: barRise 2.5s ease-in-out infinite 0.4s; transform-origin: 200px 280px; }
    .anim-bar-3 { animation: barRise 2.5s ease-in-out infinite 0.8s; transform-origin: 240px 280px; }
  </style>

  <!-- Ground Horizon -->
  <line x1="120" y1="280" x2="580" y2="280" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Left Leverage Asset Bars -->
  <rect x="145" y="225" width="26" height="55" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" class="anim-bar-1" />
  <rect x="180" y="200" width="26" height="80" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" class="anim-bar-2" />
  <rect x="215" y="170" width="26" height="110" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" class="anim-bar-3" />

  <!-- Central Asset Coin Glyph -->
  <g class="anim-coin">
    <circle cx="350" cy="200" r="60" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <circle cx="350" cy="200" r="50" fill="#18181b" stroke="${acc}" stroke-width="1.8" stroke-dasharray="6,4" />
    <text x="350" y="215" font-family="'Inter', sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle">$</text>
  </g>

  <!-- Right Symmetric Bars -->
  <rect x="465" y="170" width="26" height="110" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <rect x="500" y="200" width="26" height="80" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <rect x="535" y="225" width="26" height="55" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

  <!-- Radiance Aura -->
  <circle cx="350" cy="200" r="80" fill="none" stroke="${acc}" stroke-width="1" stroke-dasharray="4,6" opacity="0.6" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'compound_vault',
			name: 'Brankas Bunga Majemuk',
			title: 'THE COMPOUND VAULT',
			tag: '[ BUNGA MAJEMUK // COMPOUNDING ]',
			regex: /(bunga majemuk|compound interest|brankas modal|akumulasi kekayaan|efek bola salju modal)/i,
			nodes: ['01. SEED CAPITAL', '02. REINVESTMENT', '03. TIME COMPOUND', '04. EXPONENTIAL VAULT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes dialTurn { 0% { transform: rotate(0deg); } 50% { transform: rotate(90deg); } 100% { transform: rotate(0deg); } }
    @keyframes vaultGlow { 0%, 100% { filter: drop-shadow(0 0 6px ${acc}55); } 50% { filter: drop-shadow(0 0 20px ${acc}); } }
    .anim-vault-dial { animation: dialTurn 4s ease-in-out infinite; transform-origin: 350px 200px; }
    .anim-vault-door { animation: vaultGlow 3s ease-in-out infinite; }
  </style>

  <!-- Heavy Vault Outer Square Frame -->
  <rect x="230" y="80" width="240" height="240" rx="12" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" class="anim-vault-door" />
  <rect x="245" y="95" width="210" height="210" rx="8" fill="none" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="8,6" />

  <!-- Circular Vault Door Locking Mechanism -->
  <circle cx="350" cy="200" r="75" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="350" cy="200" r="50" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />

  <!-- Combination Dial & Spoke Handles -->
  <g class="anim-vault-dial">
    <circle cx="350" cy="200" r="24" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="200" r="8" fill="${acc}" />
    <!-- 4 Spokes -->
    <line x1="350" y1="160" x2="350" y2="176" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <line x1="350" y1="224" x2="350" y2="240" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <line x1="310" y1="200" x2="326" y2="200" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <line x1="374" y1="200" x2="390" y2="200" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- Heavy Vault Hinges on Left -->
  <rect x="216" y="115" width="16" height="35" rx="3" fill="#3f3f46" stroke="#FFFFFF" stroke-width="2" />
  <rect x="216" y="250" width="16" height="35" rx="3" fill="#3f3f46" stroke="#FFFFFF" stroke-width="2" />

  <text x="350" y="375" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cashflow_river',
			name: 'Arus Kas Mengalir',
			title: 'CASHFLOW PIPELINE',
			tag: '[ ALIRAN ARUS KAS ]',
			regex: /(arus kas|cash flow|cashflow|aliran dana|arus uang|pendapatan pasif mengalir)/i,
			nodes: ['01. REVENUE STREAM', '02. OPERATIONAL FILTER', '03. NET CASHFLOW', '04. REINVESTMENT RESERVOIR'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes cashStream { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
    .anim-stream { stroke-dasharray: 10, 8; animation: cashStream 2s linear infinite; }
  </style>

  <!-- Source Reservoir (Left) -->
  <rect x="70" y="160" width="120" height="90" rx="8" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="130" y="200" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">INFLOW</text>
  <text x="130" y="220" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#10b981" text-anchor="middle">+ REVENUE</text>

  <!-- Dual Streaming Channels -->
  <path d="M 190 190 C 260 190, 290 160, 350 160 C 410 160, 440 190, 510 190" fill="none" stroke="${acc}" stroke-width="4" stroke-linecap="round" class="anim-stream" />
  <path d="M 190 220 C 260 220, 290 250, 350 250 C 410 250, 440 220, 510 220" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" class="anim-stream" />

  <!-- Central Valve / Filter -->
  <circle cx="350" cy="205" r="32" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="205" r="10" fill="${acc}" />
  <line x1="350" y1="160" x2="350" y2="250" stroke="#52525B" stroke-width="1.5" stroke-dasharray="3,3" />

  <!-- Destination Vault (Right) -->
  <rect x="510" y="160" width="120" height="90" rx="8" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <text x="570" y="200" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">NET CAPITAL</text>
  <text x="570" y="220" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">PRESERVED</text>

  <text x="350" y="100" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'debt_chain',
			name: 'Belenggu Rantai Utang',
			title: 'BREAKING THE DEBT CHAIN',
			tag: '[ BELENGGU FINANSIAL ]',
			regex: /(utang|beban hutang|cicilan|bunga pinjaman|terjerat utang|debt trap|terbelenggu pinjaman)/i,
			nodes: ['01. BORROWED ILLUSION', '02. COMPOUND INTEREST', '03. SHACKLED FREEDOM', '04. RUTHLESS PAYOFF'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes breakFlash { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 16px ${acc}); } }
    .anim-break { animation: breakFlash 2s ease-in-out infinite; }
  </style>

  <!-- Left Heavy Shackle Link -->
  <rect x="170" y="180" width="90" height="50" rx="25" fill="#18181b" stroke="#71717A" stroke-width="5" />
  <rect x="230" y="180" width="90" height="50" rx="25" fill="#18181b" stroke="#FFFFFF" stroke-width="5" />

  <!-- Broken Snapped Center Link -->
  <g class="anim-break">
    <path d="M 310 180 L 340 180 M 360 230 L 390 230" stroke="${acc}" stroke-width="6" stroke-linecap="round" />
    <circle cx="350" cy="205" r="8" fill="${acc}" />
    <!-- Fracture Sparks -->
    <line x1="350" y1="185" x2="350" y2="170" stroke="${acc}" stroke-width="2" />
    <line x1="335" y1="195" x2="320" y2="185" stroke="${acc}" stroke-width="2" />
    <line x1="365" y1="215" x2="380" y2="225" stroke="${acc}" stroke-width="2" />
  </g>

  <!-- Right Free Shackle Link -->
  <rect x="380" y="180" width="90" height="50" rx="25" fill="#18181b" stroke="#FFFFFF" stroke-width="5" />
  <rect x="440" y="180" width="90" height="50" rx="25" fill="#18181b" stroke="#71717A" stroke-width="5" />

  <text x="350" y="110" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="320" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="${acc}" text-anchor="middle" letter-spacing="2">SEVER THE CHAINS // FINANCIAL SOVEREIGNTY</text>
`
		},
		{
			id: 'stock_candlestick',
			name: 'Grafik Candlestick Pasar',
			title: 'MARKET DYNAMICS',
			tag: '[ VOLATILITAS PASAR ]',
			regex: /(candlestick|saham|pasar modal|bullish|bearish|trading|bursa|volatilitas harga|investor saham)/i,
			nodes: ['01. MARKET OPEN', '02. VOLATILITY SPIKE', '03. SUPPORT LEVEL', '04. LONG-TERM TREND'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes maLineDraw { 0% { stroke-dashoffset: 400; } 100% { stroke-dashoffset: 0; } }
    .anim-ma { stroke-dasharray: 400; animation: maLineDraw 3.5s linear infinite; }
  </style>

  <!-- Price Grid Lines -->
  <line x1="100" y1="120" x2="600" y2="120" stroke="#27272a" stroke-width="1.2" />
  <line x1="100" y1="190" x2="600" y2="190" stroke="#27272a" stroke-width="1.2" stroke-dasharray="4,4" />
  <line x1="100" y1="260" x2="600" y2="260" stroke="#27272a" stroke-width="1.2" />

  <!-- Candle 1 (Green/White Open) -->
  <line x1="180" y1="160" x2="180" y2="240" stroke="#FFFFFF" stroke-width="2" />
  <rect x="168" y="180" width="24" height="45" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

  <!-- Candle 2 (Bearish Dip) -->
  <line x1="260" y1="180" x2="260" y2="280" stroke="#ef4444" stroke-width="2" />
  <rect x="248" y="200" width="24" height="60" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="2" />

  <!-- Candle 3 (Consolidation Doji) -->
  <line x1="340" y1="170" x2="340" y2="270" stroke="#A1A1AA" stroke-width="2" />
  <rect x="328" y="215" width="24" height="12" fill="#18181b" stroke="#A1A1AA" stroke-width="2" />

  <!-- Candle 4 (Bullish Breakout) -->
  <line x1="420" y1="130" x2="420" y2="230" stroke="${acc}" stroke-width="2.5" />
  <rect x="408" y="145" width="24" height="65" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Candle 5 (Peak High) -->
  <line x1="500" y1="90" x2="500" y2="190" stroke="${acc}" stroke-width="3" />
  <rect x="488" y="105" width="24" height="70" fill="${acc}" stroke="${acc}" stroke-width="2" />

  <!-- Moving Average Trendline Arc -->
  <path d="M 150 220 Q 260 250, 340 210 T 540 100" fill="none" stroke="${acc}" stroke-width="2.5" class="anim-ma" />

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'gold_ingot',
			name: 'Emas Murni Safe Haven',
			title: 'THE HARD ASSET',
			tag: '[ EMAS & NILAI INSTRINSIK ]',
			regex: /(emas|gold ingot|safe haven|logam mulia|emas batangan|aset riil tahan inflasi)/i,
			nodes: ['01. HARD ASSET', '02. ZERO COUNTERPARTY', '03. STORE OF VALUE', '04. PERPETUAL WEALTH'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes goldShine { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
    .anim-gold-gleam { animation: goldShine 2.5s ease-in-out infinite; }
  </style>

  <!-- Base Ingot Bottom Left -->
  <polygon points="180,260 300,260 330,220 210,220" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <polygon points="300,260 330,220 330,240 300,280" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Base Ingot Bottom Right -->
  <polygon points="370,260 490,260 520,220 400,220" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <polygon points="490,260 520,220 520,240 490,280" fill="#18181b" stroke="${acc}" stroke-width="2" />

  <!-- Top Center Golden Ingot (Crown Asset) -->
  <polygon points="275,190 425,190 455,145 305,145" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <polygon points="425,190 455,145 455,170 425,215" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

  <!-- 999.9 Stamp on Top Bar -->
  <text x="375" y="172" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="900" fill="${acc}" text-anchor="middle">999.9 FINE GOLD</text>

  <!-- Radiance Sparkle Glints -->
  <g class="anim-gold-gleam">
    <circle cx="305" cy="145" r="4" fill="#FFFFFF" />
    <circle cx="455" cy="145" r="4" fill="${acc}" />
  </g>

  <text x="350" y="80" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="340" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#A1A1AA" text-anchor="middle" letter-spacing="2">ANTIFRAGILE RESERVE // TIMELESS VALUE</text>
`
		},
		{
			id: 'asymmetric_bet',
			name: 'Taruhan Asimetris (Taleb)',
			title: 'ASYMMETRIC RISK-REWARD',
			tag: '[ TARUHAN ASIMETRIS ]',
			regex: /(asimetris|asymmetric|risiko terbatas|upside tak terbatas|convexity|nassim taleb)/i,
			nodes: ['01. CAPPED DOWNSIDE', '02. ASYMMETRIC ENTRY', '03. CONVEX EXPOSURE', '04. UNLIMITED UPSIDE'],
			renderSVG: (acc, title, nodes) => `
  <!-- Risk-Reward Triangle Axes -->
  <line x1="160" y1="280" x2="540" y2="280" stroke="#52525B" stroke-width="2" />
  <line x1="350" y1="280" x2="350" y2="80" stroke="#52525B" stroke-width="2" />

  <!-- Limited Downside Floor (Red Zone, Flat & Capped) -->
  <rect x="230" y="280" width="240" height="30" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="1.8" />
  <text x="350" y="300" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#ef4444" text-anchor="middle">MAX RISK: CAPPED 1X</text>

  <!-- Exponential Convex Curve (Infinite Upside Skyward) -->
  <path d="M 230 280 Q 350 270, 480 90" fill="none" stroke="${acc}" stroke-width="4" stroke-linecap="round" />
  <circle cx="480" cy="90" r="7" fill="${acc}" />

  <!-- Asymmetric Ratio Tag -->
  <text x="495" y="80" font-family="'Inter', sans-serif" font-size="14" font-weight="900" fill="${acc}">100X+ UPSIDE</text>

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'portfolio_pie',
			name: 'Alokasi Portofolio Aset',
			title: 'PORTFOLIO ALLOCATION',
			tag: '[ DIVERSIFIKASI ASET ]',
			regex: /(alokasi aset|portofolio|diversifikasi modal|rebalancing portofolio|alokasi investasi)/i,
			nodes: ['01. CORE EQUITIES', '02. LIQUID CASH', '03. HARD COMMODITIES', '04. ASYMMETRIC BETS'],
			renderSVG: (acc, title, nodes) => `
  <!-- Donut Chart Ring with 4 Distinct Segments -->
  <circle cx="350" cy="200" r="85" fill="none" stroke="#27272a" stroke-width="36" />
  <circle cx="350" cy="200" r="85" fill="none" stroke="#FFFFFF" stroke-width="36" stroke-dasharray="140 400" stroke-dashoffset="0" />
  <circle cx="350" cy="200" r="85" fill="none" stroke="${acc}" stroke-width="36" stroke-dasharray="100 440" stroke-dashoffset="-150" />
  <circle cx="350" cy="200" r="85" fill="none" stroke="#52525B" stroke-width="36" stroke-dasharray="80 460" stroke-dashoffset="-260" />

  <!-- Center Hub Core -->
  <circle cx="350" cy="200" r="45" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
  <text x="350" y="204" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">ASSETS</text>

  <!-- Labels -->
  <text x="210" y="140" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF">40% CORE</text>
  <text x="490" y="160" font-family="'Inter', sans-serif" font-size="10" font-weight="900" fill="${acc}">30% GROWTH</text>
  <text x="450" y="290" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#71717A">20% CASH</text>
  <text x="210" y="270" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#52525B">10% ASYMMETRIC</text>

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'inflation_erosion',
			name: 'Erosi Inflasi Daya Beli',
			title: 'PURCHASING POWER DECAY',
			tag: '[ EROSI INFLASI ]',
			regex: /(inflasi|daya beli turun|nilai uang tergerus|terkikis inflasi|purchasing power)/i,
			nodes: ['01. CASH ILLUSION', '02. PRINTING DILUTION', '03. EROSION DECAY', '04. HARD ASSET HEDGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes dissolveParticles { 0%, 100% { opacity: 0.2; transform: translateX(0); } 50% { opacity: 1; transform: translateX(25px); } }
    .anim-dissolve { animation: dissolveParticles 2s ease-in-out infinite; }
  </style>

  <!-- Solid Coin Half (Left) -->
  <path d="M 330 130 A 70 70 0 0 0 330 270 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <text x="310" y="208" font-family="'Inter', sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">$</text>

  <!-- Eroded Right Half (Disintegrating into Particles) -->
  <path d="M 330 130 A 70 70 0 0 1 330 270 Z" fill="none" stroke="#52525B" stroke-width="2" stroke-dasharray="4,6" />

  <!-- Dissolving Currency Particle Dust -->
  <g class="anim-dissolve">
    <circle cx="370" cy="150" r="4" fill="${acc}" />
    <circle cx="395" cy="170" r="3" fill="#ef4444" />
    <circle cx="420" cy="160" r="2.5" fill="#71717A" />
    <circle cx="380" cy="210" r="4" fill="${acc}" />
    <circle cx="410" cy="225" r="3" fill="#ef4444" />
    <circle cx="440" cy="205" r="2" fill="#71717A" />
    <circle cx="370" cy="250" r="3" fill="${acc}" />
    <circle cx="400" cy="265" r="2" fill="#ef4444" />
  </g>

  <text x="350" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
  <text x="350" y="340" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#ef4444" text-anchor="middle" letter-spacing="2">CASH IS A MELTING ICE CUBE // HEDGE OR DROWN</text>
`
		},
		{
			id: 'wealth_ladder',
			name: 'Tangga Kekayaan 4 Level',
			title: 'THE WEALTH LADDER',
			tag: '[ TANGGA KEKAYAAN ]',
			regex: /(tangga kekayaan|level finansial|kebebasan finansial|financial freedom|wealth ladder|tingkatan kaya)/i,
			nodes: ['01. SURVIVAL (PAYCHECK)', '02. STABILITY (SAVINGS)', '03. LEVERAGE (ASSETS)', '04. TIME FREEDOM'],
			renderSVG: (acc, title, nodes) => `
  <!-- Step 1: Survival -->
  <rect x="120" y="270" width="105" height="50" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
  <text x="172" y="300" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#71717A" text-anchor="middle">1. SURVIVAL</text>

  <!-- Step 2: Stability -->
  <rect x="235" y="220" width="105" height="100" rx="4" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <text x="287" y="250" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#A1A1AA" text-anchor="middle">2. STABILITY</text>

  <!-- Step 3: Leverage -->
  <rect x="350" y="170" width="105" height="150" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="402" y="200" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">3. LEVERAGE</text>

  <!-- Step 4: True Freedom (Luminous Apex) -->
  <rect x="465" y="110" width="115" height="210" rx="6" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <text x="522" y="145" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="${acc}" text-anchor="middle">4. SOVEREIGN</text>
  <text x="522" y="165" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#FFFFFF" text-anchor="middle">TIME FREEDOM</text>

  <!-- Ascending Stair Arrow -->
  <path d="M 150 250 L 260 200 L 370 150 L 490 90" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="4,4" />
  <circle cx="490" cy="90" r="4" fill="${acc}" />

  <text x="350" y="55" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
