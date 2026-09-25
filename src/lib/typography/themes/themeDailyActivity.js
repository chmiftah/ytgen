/**
 * THEME: DAILY ACTIVITY & RUTINITAS (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeDailyActivity = {
	categoryName: 'daily_activity',
	categoryLabel: '⏰ Aktivitas Harian & Kebiasaan',
	items: [
		{
			id: 'hourglass',
			name: 'Temporal Leverage & Jam Pasir',
			title: 'TEMPORAL LEVERAGE',
			tag: '[ MEMENTO MORI // DETIK BERHARGA ]',
			regex: /(waktu berjalan|jam pasir|setiap detik|waktu terbatas|memento mori|kecepatan waktu|waktu berharga|detik demi detik)/i,
			nodes: ['01. SCARCE SECONDS', '02. VALUE PERPETUATION', '03. RUTHLESS ALLOCATION', '04. TIME ARBITRAGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sandDrop { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(50px); opacity: 0; } }
    @keyframes glassGleam { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; } }
    .anim-sand-stream { stroke-dasharray: 4,4; animation: sandDrop 1.2s linear infinite; }
    .anim-glass { animation: glassGleam 3s infinite ease-in-out; }
  </style>

  <!-- Hourglass Base & Top Pedestals -->
  <line x1="280" y1="100" x2="420" y2="100" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
  <line x1="280" y1="270" x2="420" y2="270" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />

  <!-- Hourglass Glass Profile -->
  <g class="anim-glass">
    <path d="M 290,105 C 290,150 340,175 345,185 C 340,195 290,220 290,265" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 410,105 C 410,150 360,175 355,185 C 360,195 410,220 410,265" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Top Bulb Falling Sand -->
  <path d="M 315,145 Q 350,165 385,145" fill="none" stroke="${acc}" stroke-width="2.5" />
  <line x1="350" y1="185" x2="350" y2="245" stroke="${acc}" stroke-width="2.5" class="anim-sand-stream" />

  <!-- Bottom Bulb Sand Pile -->
  <path d="M 320,265 Q 350,240 380,265" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <circle cx="350" cy="245" r="3" fill="#FFFFFF" />

  <!-- Time Flow Arc Rays -->
  <circle cx="350" cy="185" r="75" fill="none" stroke="#52525B" stroke-width="1.2" stroke-dasharray="4,6" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'dawn_alarm',
			name: '5 AM Dawn & Jam Alarm Subuh',
			title: 'CIRCADIAN DAWN SPRINT',
			tag: '[ RUTINITAS FAJAR // KONTROL PAGI ]',
			regex: /(bangun pagi|subuh|jam 5 pagi|alarm pagi|fajar menyingsing|matahari terbit pagi|rutinitas pagi|bangkit lebih awal)/i,
			nodes: ['01. PRE-DAWN SILENCE', '02. ZERO DISTRACTION', '03. CORTISOL PEAK', '04. UNCONTESTED ADVANTAGE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes bellRing { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(8deg); } 75% { transform: rotate(-8deg); } }
    @keyframes sunRayGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .anim-clock-body { animation: bellRing 3s ease-in-out infinite; transform-origin: 350px 185px; }
    .anim-sun-rays { animation: sunRayGlow 2.5s infinite ease-in-out; }
  </style>

  <!-- Horizon Line of Dawn -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Rising Sun Behind Clock -->
  <g class="anim-sun-rays">
    <path d="M 280,270 A 70,70 0 0,1 420,270" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="6,4" />
    <line x1="350" y1="180" x2="350" y2="155" stroke="${acc}" stroke-width="2" />
    <line x1="300" y1="200" x2="280" y2="185" stroke="${acc}" stroke-width="2" />
    <line x1="400" y1="200" x2="420" y2="185" stroke="${acc}" stroke-width="2" />
  </g>

  <!-- Minimalist Twin-Bell Alarm Clock Wireframe -->
  <g class="anim-clock-body">
    <!-- Left & Right Bells -->
    <path d="M 285,120 C 275,135 295,145 305,135" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 415,120 C 425,135 405,145 395,135" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    
    <!-- Clock Legs -->
    <line x1="295" y1="250" x2="280" y2="270" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <line x1="405" y1="250" x2="420" y2="270" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Clock Face -->
    <circle cx="350" cy="195" r="55" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <circle cx="350" cy="195" r="45" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="2,6" />
    
    <!-- Hands Set to 5:00 -->
    <line x1="350" y1="195" x2="350" y2="160" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    <line x1="350" y1="195" x2="375" y2="225" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />
    <circle cx="350" cy="195" r="4" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'journal_pen',
			name: 'Daily Synthesis Journal & Fountain Pen',
			title: 'COGNITIVE JOURNALING',
			tag: '[ REFLEKSI HARIAN // PENA SINTESIS ]',
			regex: /(jurnal harian|menulis catatan|refleksi harian|catatan pagi|buku harian|jurnaling|sintesis malam|menulis jurnal)/i,
			nodes: ['01. UNFILTERED THOUGHT DUMP', '02. PATTERN EXTRACTION', '03. ACTIONABLE CODIFICATION', '04. PEACEFUL CLOSURE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes penWrite { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(15px, -5px) rotate(4deg); } }
    @keyframes lineGleam { 0% { stroke-opacity: 0.3; } 50% { stroke-opacity: 1; } 100% { stroke-opacity: 0.3; } }
    .anim-pen { animation: penWrite 2.5s ease-in-out infinite; transform-origin: 410px 170px; }
    .anim-write-line { animation: lineGleam 2s infinite ease-in-out; }
  </style>

  <!-- Open Journal Notebook Pages -->
  <!-- Left Page -->
  <path d="M 210,130 L 340,120 L 340,260 L 210,250 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
  <!-- Left Page Ruled Lines -->
  <line x1="230" y1="155" x2="320" y2="150" stroke="#52525B" stroke-width="1.8" />
  <line x1="230" y1="180" x2="320" y2="175" stroke="#52525B" stroke-width="1.8" />
  <line x1="230" y1="205" x2="320" y2="200" stroke="#52525B" stroke-width="1.8" />
  <line x1="230" y1="230" x2="290" y2="225" stroke="#52525B" stroke-width="1.8" />

  <!-- Center Binding Spine -->
  <line x1="340" y1="115" x2="340" y2="265" stroke="${acc}" stroke-width="3" stroke-linecap="round" />

  <!-- Right Page -->
  <path d="M 340,120 L 470,130 L 470,250 L 340,260 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
  <!-- Right Page Ruled Lines -->
  <line x1="360" y1="150" x2="450" y2="155" stroke="${acc}" stroke-width="2" class="anim-write-line" />
  <line x1="360" y1="175" x2="450" y2="180" stroke="#52525B" stroke-width="1.8" />
  <line x1="360" y1="200" x2="420" y2="205" stroke="#52525B" stroke-width="1.8" />

  <!-- Minimalist Diagonal Fountain Pen Writing -->
  <g class="anim-pen">
    <line x1="430" y1="90" x2="385" y2="160" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <polygon points="385,160 375,175 395,170" fill="${acc}" />
    <circle cx="380" cy="170" r="2" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'deep_work_sprint',
			name: '90-Minute Deep Work Sprint & Stopwatch',
			title: '90-MIN DEEP WORK SPRINT',
			tag: '[ ULTRA-FOKUS // ZERO DISTRAKSI ]',
			regex: /(deep work|fokus 90 menit|blok waktu fokus|stopwatch fokus|sprint kerja|tanpa distraksi|zona konsentrasi|flow block)/i,
			nodes: ['01. COGNITIVE CALIBRATION', '02. DISTRACTION SHIELD', '03. SPRINT MOMENTUM', '04. COMPOUND OUTPUT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sweepArc { 0% { stroke-dashoffset: 280; } 100% { stroke-dashoffset: 0; } }
    @keyframes pulseTarget { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    .anim-sweep { stroke-dasharray: 280; animation: sweepArc 4s linear infinite; }
    .anim-bullseye { animation: pulseTarget 2s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Stopwatch Outer Ring Frame -->
  <circle cx="350" cy="185" r="75" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Top Push Buttons -->
  <rect x="342" y="90" width="16" height="15" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <rect x="390" y="105" width="12" height="12" rx="2" fill="#18181b" stroke="${acc}" stroke-width="2" transform="rotate(30 396 111)" />

  <!-- 90-Minute Focus Sweep Progress Arc -->
  <circle cx="350" cy="185" r="62" fill="none" stroke="${acc}" stroke-width="4.5" class="anim-sweep" stroke-linecap="round" />

  <!-- Center Target / Bullseye Glyph -->
  <g class="anim-bullseye">
    <circle cx="350" cy="185" r="28" fill="#18181b" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3,3" />
    <circle cx="350" cy="185" r="10" fill="${acc}" />
    <!-- Reticle Crosshairs -->
    <line x1="350" y1="150" x2="350" y2="165" stroke="#52525B" stroke-width="2" />
    <line x1="350" y1="205" x2="350" y2="220" stroke="#52525B" stroke-width="2" />
    <line x1="315" y1="185" x2="330" y2="185" stroke="#52525B" stroke-width="2" />
    <line x1="370" y1="185" x2="385" y2="185" stroke="#52525B" stroke-width="2" />
  </g>

  <!-- Digital Time Display -->
  <text x="350" y="285" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">90:00 FOCUS</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'coffee_ritual',
			name: 'Morning Coffee Ritual & Swirling Steam',
			title: 'CAFFEINE RITUAL CATALYST',
			tag: '[ RITUAL KOPI // CATALYST ENERGI ]',
			regex: /(secangkir kopi|ritual kopi|kopi pagi|kafein|menikmati kopi|seduhan kopi|cangkir espresso|coffee break)/i,
			nodes: ['01. BREWING MASTERY', '02. SENSORY AROMA', '03. ADENOSINE INHIBITION', '04. SHARP EXECUTIVE FOCUS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes steamRise { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: translateY(-24px); opacity: 0; } }
    @keyframes cupSway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(2deg); } }
    .anim-steam-1 { animation: steamRise 3s ease-out infinite; }
    .anim-steam-2 { animation: steamRise 3s ease-out infinite 1.2s; }
  </style>

  <!-- Saucer Base Line -->
  <ellipse cx="350" cy="255" rx="80" ry="14" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <ellipse cx="350" cy="255" rx="55" ry="9" fill="none" stroke="#52525B" stroke-width="1.5" />

  <!-- Ceramic Coffee Cup Shell -->
  <path d="M 290,165 L 305,245 C 310,252 390,252 395,245 L 410,165 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" />
  
  <!-- Cup Handle -->
  <path d="M 405,175 C 440,175 440,225 398,225" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />

  <!-- Warm Coffee Surface Rim -->
  <ellipse cx="350" cy="165" rx="60" ry="15" fill="#18181b" stroke="${acc}" stroke-width="3" />
  <ellipse cx="350" cy="165" rx="40" ry="10" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3,3" />

  <!-- Swirling Kinetic Steam Streams Rising -->
  <g class="anim-steam-1">
    <path d="M 335,145 Q 320,120 335,95 Q 350,70 335,55" fill="none" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
  </g>
  <g class="anim-steam-2">
    <path d="M 365,145 Q 380,120 365,95 Q 350,70 365,55" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'checklist_done',
			name: 'Ruthless 3-Item Prioritization & Done List',
			title: 'HIGH-LEVERAGE CHECKLIST',
			tag: '[ EKSEKUSI TUNTAS // RUTHLESS 3 TASKS ]',
			regex: /(daftar tugas|checklist harian|to do list|menyelesaikan tugas|centang selesai|prioritas harian|eksekusi tuntas|selesaikan pekerjaan)/i,
			nodes: ['01. CUT THE NOISE', '02. TOP 3 IMPACT TASKS', '03. MONOTASKING SPRINT', '04. COMPLETE RESOLUTION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes checkGlow { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; } }
    @keyframes strikeRun { 0% { stroke-dashoffset: 140; } 100% { stroke-dashoffset: 0; } }
    .anim-check { animation: checkGlow 2s infinite ease-in-out; }
    .anim-strike { stroke-dasharray: 140; animation: strikeRun 2s ease-in-out infinite alternate; }
  </style>

  <!-- Clipboard Frame Shell -->
  <rect x="220" y="95" width="260" height="195" rx="12" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Clipboard Metal Top Clamp -->
  <path d="M 320,95 L 320,85 Q 320,80 325,80 L 375,80 Q 380,80 380,85 L 380,95 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="88" r="3.5" fill="${acc}" />

  <!-- Item 1: Complete Checkmark -->
  <g class="anim-check">
    <rect x="250" y="125" width="24" height="24" rx="5" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <path d="M 255,137 L 261,143 L 271,131" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="290" y1="137" x2="440" y2="137" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" class="anim-strike" />
  </g>

  <!-- Item 2: Complete Checkmark -->
  <g>
    <rect x="250" y="170" width="24" height="24" rx="5" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <path d="M 255,182 L 261,188 L 271,176" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="290" y1="182" x2="420" y2="182" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Item 3: In-Progress Highlight -->
  <g>
    <rect x="250" y="215" width="24" height="24" rx="5" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="262" cy="227" r="4" fill="${acc}" />
    <line x1="290" y1="227" x2="390" y2="227" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'walking_steps',
			name: '10,000 Steps & Kinetic Walking Meditation',
			title: 'KINETIC WALKING PATH',
			tag: '[ 10.000 LANGKAH // BERJALAN KAKI ]',
			regex: /(jalan kaki|10000 langkah|berjalan kaki santai|langkah kaki harian|jalan pagi|footsteps|berjalan di alam|walking meditation)/i,
			nodes: ['01. RHYTHMIC STRIDE', '02. DEFAULT MODE NETWORK', '03. LATERAL EYE MOVEMENTS', '04. CREATIVE BREAKTHROUGH'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes stepWalk { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    @keyframes horizonGleam { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 1; } }
    .anim-steps-trace { stroke-dasharray: 6,8; animation: stepWalk 2s linear infinite; }
    .anim-horizon { animation: horizonGleam 3s infinite ease-in-out; }
  </style>

  <!-- Vanishing Point Perspective Lines -->
  <line x1="350" y1="110" x2="160" y2="270" stroke="#52525B" stroke-width="1.8" />
  <line x1="350" y1="110" x2="540" y2="270" stroke="#52525B" stroke-width="1.8" />

  <!-- Vanishing Horizon Point Beacon -->
  <circle cx="350" cy="110" r="16" fill="#18181b" stroke="${acc}" stroke-width="2.5" class="anim-horizon" />
  <circle cx="350" cy="110" r="4" fill="#FFFFFF" />

  <!-- Serpentine Stepping Path -->
  <path d="M 350,110 Q 320,160 370,195 Q 310,230 350,270" fill="none" stroke="${acc}" stroke-width="3" class="anim-steps-trace" stroke-linecap="round" />

  <!-- Footstep Imprints Along Path -->
  <!-- Step 1 -->
  <ellipse cx="335" cy="245" rx="5" ry="9" fill="#FFFFFF" transform="rotate(-10 335 245)" />
  <!-- Step 2 -->
  <ellipse cx="365" cy="215" rx="5" ry="9" fill="${acc}" transform="rotate(10 365 215)" />
  <!-- Step 3 -->
  <ellipse cx="340" cy="180" rx="4" ry="7" fill="#FFFFFF" transform="rotate(-15 340 180)" />
  <!-- Step 4 -->
  <ellipse cx="360" cy="150" rx="4" ry="7" fill="${acc}" transform="rotate(15 360 150)" />

  <!-- Metric Indicator -->
  <text x="350" y="295" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">10,000 STEPS</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'digital_detox',
			name: 'Digital Detox & Unplugged Smartphone',
			title: 'DIGITAL FASTING & DETOX',
			tag: '[ PUASA GADGET // RECLAIM ATTENTION ]',
			regex: /(detoks digital|matikan hp|notifikasi mati|puasa gadget|lepas smartphone|disconnect digital|unplug|matikan layar)/i,
			nodes: ['01. SCREEN SHUTDOWN', '02. SILENT ENVIRONMENT', '03. ATTENTION RECLAMATION', '04. RESTORED PRESENCE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes offFlicker { 0%, 100% { stroke-opacity: 0.4; } 50% { stroke-opacity: 1; } }
    @keyframes lockGlow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .anim-power-glow { animation: offFlicker 2.5s infinite ease-in-out; }
    .anim-lock-center { animation: lockGlow 2.5s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Smartphone Outer Body Chassis -->
  <rect x="270" y="90" width="160" height="200" rx="20" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Speaker Grill & Front Camera -->
  <line x1="335" y1="105" x2="365" y2="105" stroke="#52525B" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="320" cy="105" r="2.5" fill="#52525B" />

  <!-- Power Off Glyph Symbol Center Screen -->
  <g class="anim-power-glow">
    <path d="M 328,170 A 30,30 0 1,0 372,170" fill="none" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />
    <line x1="350" y1="145" x2="350" y2="175" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />
  </g>

  <!-- Home Indicator Bar Bottom -->
  <line x1="330" y1="275" x2="370" y2="275" stroke="#52525B" stroke-width="2.5" stroke-linecap="round" />

  <!-- Crossed Out Signal Waves Left/Right -->
  <path d="M 220,185 Q 240,165 240,185 Q 240,205 220,185" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="2,3" />
  <line x1="210" y1="175" x2="250" y2="195" stroke="#EF4444" stroke-width="2" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'night_reading',
			name: 'Bedside Reading Lamp & Deep Book Study',
			title: 'NOCTURNAL KNOWLEDGE STUDY',
			tag: '[ BACAAN MALAM // TRANQUIL STUDY ]',
			regex: /(membaca buku malam|lampu meja belajar|baca buku sebelum tidur|bacaan malam|halaman buku|baca buku di ranjang)/i,
			nodes: ['01. LOW AMBIENT LIGHT', '02. SYNTHOPICAL READING', '03. SUBCONSCIOUS SEEDING', '04. DEEP SLEEP ASSIMILATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes lampCone { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.35; } }
    @keyframes pageTurn { 0%, 100% { transform: skewY(0deg); } 50% { transform: skewY(-4deg); } }
    .anim-cone { animation: lampCone 3s infinite ease-in-out; }
    .anim-book-page { animation: pageTurn 4s ease-in-out infinite; transform-origin: 350px 240px; }
  </style>

  <!-- Desk Surface Horizon -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Minimalist Desk Lamp Left -->
  <path d="M 230,265 L 260,265 M 245,265 L 245,150 L 290,130" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Lamp Shade -->
  <polygon points="280,120 310,135 295,150" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="300" cy="140" r="4" fill="${acc}" />

  <!-- Ambient Light Cone Illuminating Book -->
  <polygon points="305,145 270,265 430,265" fill="${acc}" class="anim-cone" />

  <!-- Open Book on Desk Center -->
  <g class="anim-book-page">
    <!-- Left Open Page -->
    <path d="M 350,240 Q 310,230 270,240 L 270,220 Q 310,210 350,220 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <!-- Right Open Page -->
    <path d="M 350,240 Q 390,230 430,240 L 430,220 Q 390,210 350,220 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <!-- Book Binding Spine -->
    <line x1="350" y1="220" x2="350" y2="245" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'habit_flywheel',
			name: 'Atomic Habits & The Cue-Routine Flywheel',
			title: 'HABIT LOOP FLYWHEEL',
			tag: '[ ATOMIC HABITS // FLYWHEEL OTOMATIS ]',
			regex: /(kebiasaan harian|flywheel kebiasaan|siklus kebiasaan|atomic habits|rutinitas otomatis|loop kebiasaan|kebiasaan kecil)/i,
			nodes: ['01. CUE TRIGGER', '02. CRAVING INTENT', '03. ROUTINE ACTION', '04. DOPAMINERGIC REWARD'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wheelTurn { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes coreRhythm { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .anim-flywheel { animation: wheelTurn 14s linear infinite; transform-origin: 350px 185px; }
    .anim-flywheel-core { animation: coreRhythm 2.5s infinite ease-in-out; transform-origin: 350px 185px; }
  </style>

  <!-- Flywheel Circular Track -->
  <circle cx="350" cy="185" r="75" fill="none" stroke="#52525B" stroke-width="2" />
  <circle cx="350" cy="185" r="85" fill="none" stroke="${acc}" stroke-width="1.8" stroke-dasharray="6,6" />

  <!-- 4 Quadrant Habit Loop Arrows -->
  <g class="anim-flywheel">
    <!-- Cue (Top) -->
    <circle cx="350" cy="110" r="12" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <path d="M 370,118 Q 410,135 425,185" fill="none" stroke="${acc}" stroke-width="2.5" />
    
    <!-- Craving (Right) -->
    <circle cx="425" cy="185" r="12" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <path d="M 420,205 Q 405,245 350,260" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    
    <!-- Response (Bottom) -->
    <circle cx="350" cy="260" r="12" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <path d="M 330,255 Q 290,235 275,185" fill="none" stroke="${acc}" stroke-width="2.5" />
    
    <!-- Reward (Left) -->
    <circle cx="275" cy="185" r="12" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <path d="M 280,165 Q 295,125 350,110" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
  </g>

  <!-- Center Compounding Core Hub -->
  <g class="anim-flywheel-core">
    <circle cx="350" cy="185" r="26" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <polygon points="350,170 363,192 337,192" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
