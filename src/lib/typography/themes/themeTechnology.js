/**
 * THEME: TECHNOLOGY & AI (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeTechnology = {
	categoryName: 'technology',
	categoryLabel: '🤖 Teknologi & Artificial Intelligence',
	items: [
		{
			id: 'neural_net',
			name: 'Deep Neural Network & Synaptic Weights',
			title: 'DEEP NEURAL NETWORK',
			tag: '[ ARSITEKTUR TRANSFORMER // BOBOT SINAPTIK ]',
			regex: /(neural network|jaringan saraf tiruan|deep learning|bobot sinaptik|multilayer perceptron|model ai|machine learning|bobot neural)/i,
			nodes: ['01. INPUT TENSORS', '02. HIDDEN LATENT SPACE', '03. ACTIVATION MATRIX', '04. OUTPUT PREDICTION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes synapPulse { 0% { opacity: 0.2; } 50% { opacity: 0.9; } 100% { opacity: 0.2; } }
    @keyframes nodeFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .anim-synap-1 { animation: synapPulse 2s infinite ease-in-out; }
    .anim-synap-2 { animation: synapPulse 2.5s infinite ease-in-out 0.6s; }
    .anim-nodes { animation: nodeFloat 4s ease-in-out infinite; }
  </style>

  <!-- Network Interconnecting Synapses -->
  <g stroke="#52525B" stroke-width="1.2">
    <!-- Input to Hidden 1 -->
    <line x1="220" y1="130" x2="310" y2="110" />
    <line x1="220" y1="130" x2="310" y2="160" />
    <line x1="220" y1="130" x2="310" y2="210" />
    <line x1="220" y1="190" x2="310" y2="110" />
    <line x1="220" y1="190" x2="310" y2="160" stroke="${acc}" stroke-width="2" class="anim-synap-1" />
    <line x1="220" y1="190" x2="310" y2="210" />
    <line x1="220" y1="250" x2="310" y2="160" />
    <line x1="220" y1="250" x2="310" y2="260" stroke="${acc}" stroke-width="1.8" />

    <!-- Hidden 1 to Hidden 2 -->
    <line x1="310" y1="110" x2="390" y2="135" />
    <line x1="310" y1="160" x2="390" y2="135" stroke="${acc}" stroke-width="2" class="anim-synap-2" />
    <line x1="310" y1="210" x2="390" y2="235" />
    <line x1="310" y1="260" x2="390" y2="235" />

    <!-- Hidden 2 to Output -->
    <line x1="390" y1="135" x2="480" y2="185" stroke="${acc}" stroke-width="2.5" />
    <line x1="390" y1="235" x2="480" y2="185" />
  </g>

  <!-- Layer 1: Input Neurons -->
  <g class="anim-nodes">
    <circle cx="220" cy="130" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="220" cy="190" r="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="220" cy="250" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Layer 2: Latent Neurons -->
    <circle cx="310" cy="110" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="310" cy="160" r="12" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="310" cy="210" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="310" cy="260" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

    <!-- Layer 3: Attention Neurons -->
    <circle cx="390" cy="135" r="12" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="390" cy="235" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

    <!-- Layer 4: Output Token Node -->
    <circle cx="480" cy="185" r="16" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <circle cx="480" cy="185" r="6" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cpu_chip',
			name: 'Silicon Microprocessor & GPU Core',
			title: 'COMPUTE SILICON MATRIX',
			tag: '[ HARDWARE KOMPUTASI // 2NM ARCHITECTURE ]',
			regex: /(prosesor|chipset|microchip|silicon|gpu|cpu|hardware komputasi|nanometer|semikonduktor|transistor)/i,
			nodes: ['01. NANOMETER DIE', '02. LOGIC GATES', '03. BUS BANDWIDTH', '04. FLOATING POINT TFLOPS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes chipGlow { 0%, 100% { stroke-opacity: 0.6; } 50% { stroke-opacity: 1; } }
    @keyframes circuitRun { 0% { stroke-dashoffset: 16; } 100% { stroke-dashoffset: 0; } }
    .anim-chip-glow { animation: chipGlow 2.5s infinite ease-in-out; }
    .anim-bus { stroke-dasharray: 4,4; animation: circuitRun 1s linear infinite; }
  </style>

  <!-- Peripheral Pins -->
  <g stroke="#52525B" stroke-width="2">
    <!-- Top Pins -->
    <line x1="310" y1="95" x2="310" y2="120" />
    <line x1="330" y1="95" x2="330" y2="120" />
    <line x1="350" y1="95" x2="350" y2="120" stroke="${acc}" />
    <line x1="370" y1="95" x2="370" y2="120" />
    <line x1="390" y1="95" x2="390" y2="120" />
    <!-- Bottom Pins -->
    <line x1="310" y1="260" x2="310" y2="285" />
    <line x1="330" y1="260" x2="330" y2="285" />
    <line x1="350" y1="260" x2="350" y2="285" stroke="${acc}" />
    <line x1="370" y1="260" x2="370" y2="285" />
    <line x1="390" y1="260" x2="390" y2="285" />
    <!-- Left Pins -->
    <line x1="225" y1="150" x2="250" y2="150" />
    <line x1="225" y1="170" x2="250" y2="170" stroke="${acc}" />
    <line x1="225" y1="190" x2="250" y2="190" />
    <line x1="225" y1="210" x2="250" y2="210" />
    <line x1="225" y1="230" x2="250" y2="230" />
    <!-- Right Pins -->
    <line x1="450" y1="150" x2="475" y2="150" />
    <line x1="450" y1="170" x2="475" y2="170" />
    <line x1="450" y1="190" x2="475" y2="190" stroke="${acc}" />
    <line x1="450" y1="210" x2="475" y2="210" />
    <line x1="450" y1="230" x2="475" y2="230" />
  </g>

  <!-- CPU Ceramic Base Package -->
  <rect x="250" y="120" width="200" height="140" rx="10" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Silicon Integrated Die -->
  <rect x="290" y="145" width="120" height="90" rx="6" fill="#18181b" stroke="${acc}" stroke-width="2.5" class="anim-chip-glow" />

  <!-- Core Grids Inside Die -->
  <rect x="305" y="157" width="40" height="30" rx="2" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
  <rect x="355" y="157" width="40" height="30" rx="2" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
  <rect x="305" y="193" width="40" height="30" rx="2" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
  <rect x="355" y="193" width="40" height="30" rx="2" fill="${acc}" fill-opacity="0.25" stroke="${acc}" stroke-width="2" />

  <!-- Data Bus Circuit Traces -->
  <path d="M 170,170 L 225,170" stroke="${acc}" stroke-width="2" class="anim-bus" />
  <path d="M 475,190 L 530,190" stroke="${acc}" stroke-width="2" class="anim-bus" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'code_terminal',
			name: 'Code Terminal & Algoritma',
			title: 'ALGORITHMIC ENGINE',
			tag: '[ CODE ARCHITECTURE // SYSTEM LOGIC ]',
			regex: /(kode pemrograman|coding|algoritma|terminal|baris kode|developer|syntax|software architecture|source code)/i,
			nodes: ['01. PROBLEM ABSTRACTION', '02. DATA STRUCTURE', '03. RUNTIME EXECUTION', '04. DETERMINISTIC OUTPUT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes cursorBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @keyframes codeScroll { 0% { opacity: 0.4; } 50% { opacity: 0.9; } 100% { opacity: 0.4; } }
    .anim-cursor { animation: cursorBlink 1s infinite; }
    .anim-code-line { animation: codeScroll 3s infinite ease-in-out; }
  </style>

  <!-- Terminal Window Shell -->
  <rect x="180" y="100" width="340" height="190" rx="10" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Window Header Titlebar -->
  <line x1="180" y1="135" x2="520" y2="135" stroke="#3f3f46" stroke-width="1.8" />
  <!-- Traffic Light Window Buttons -->
  <circle cx="205" cy="118" r="4.5" fill="#EF4444" />
  <circle cx="222" cy="118" r="4.5" fill="#F59E0B" />
  <circle cx="239" cy="118" r="4.5" fill="#10B981" />
  <text x="350" y="122" font-family="'JetBrains Mono', monospace" font-size="9" fill="#71717A" text-anchor="middle">bash — 80x24</text>

  <!-- Prompt Command Symbol -->
  <text x="210" y="165" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="900" fill="${acc}">></text>
  
  <!-- Code Snippet Wireframe Lines -->
  <line x1="235" y1="160" x2="330" y2="160" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  
  <!-- Indented Code Logic Lines -->
  <line x1="235" y1="185" x2="275" y2="185" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" />
  <line x1="285" y1="185" x2="420" y2="185" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
  
  <line x1="260" y1="210" x2="380" y2="210" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" class="anim-code-line" />
  <line x1="260" y1="230" x2="340" y2="230" stroke="${acc}" stroke-width="2.2" stroke-linecap="round" />

  <!-- Blinking Terminal Cursor Block -->
  <rect x="350" y="222" width="10" height="15" fill="${acc}" class="anim-cursor" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cyborg_touch',
			name: 'Bionic Touch & Human-AI Convergence',
			title: 'HUMAN-AI SYMBIOSIS',
			tag: '[ SINTESIS BIOLOGIS-SINTETIK // METAVERSE ]',
			regex: /(cyborg|kecerdasan buatan dan manusia|bionik|robotik|sentuhan ai|human ai collaboration|singularity|simbiosis ai)/i,
			nodes: ['01. BIOLOGICAL INTUITION', '02. SYNTHETIC COMPUTE', '03. NEURAL INTERFACE', '04. EXPANDED CONSCIOUSNESS'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sparkArc { 0% { r: 3; opacity: 0.4; } 50% { r: 18; opacity: 1; } 100% { r: 3; opacity: 0.4; } }
    @keyframes fingerReach { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
    .anim-spark { animation: sparkArc 1.8s infinite ease-in-out; transform-origin: 350px 180px; }
    .anim-reach { animation: fingerReach 3s ease-in-out infinite; }
  </style>

  <!-- Left: Organic Human Hand Lines -->
  <g class="anim-reach">
    <path d="M 140,220 C 190,215 240,195 285,185 L 320,185" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 140,245 C 185,240 230,220 270,210" fill="none" stroke="#52525B" stroke-width="1.8" stroke-linecap="round" />
    <circle cx="320" cy="185" r="4.5" fill="#FFFFFF" />
  </g>

  <!-- Center: Energy Nexus Spark Point -->
  <circle cx="350" cy="180" r="18" fill="none" stroke="${acc}" stroke-width="2" class="anim-spark" stroke-dasharray="3,3" />
  <circle cx="350" cy="180" r="5" fill="${acc}" />

  <!-- Right: Bionic Synthetic Wireframe Robotic Hand -->
  <g>
    <!-- Geometric Segments & Servo Joints -->
    <path d="M 560,220 L 460,200 L 420,185 L 380,180" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <circle cx="460" cy="200" r="6" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="420" cy="185" r="5" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="380" cy="180" r="4.5" fill="${acc}" />
    <!-- Robotic Cable Line -->
    <path d="M 560,240 L 470,220 L 430,205" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="3,3" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cloud_cluster',
			name: 'Distributed Cloud & Data Center Clusters',
			title: 'DISTRIBUTED CLOUD',
			tag: '[ KOMPUTASI TERDISTRIBUSI // HIGH AVAILABILITY ]',
			regex: /(cloud computing|server cluster|komputasi awan|infrastruktur cloud|distributed system|data center|server farm)/i,
			nodes: ['01. EDGE GATEWAYS', '02. LOAD BALANCING', '03. SHARDED CLUSTERS', '04. GLOBAL AVAILABILITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes ledBlink { 0%, 100% { fill-opacity: 0.2; } 50% { fill-opacity: 1; } }
    @keyframes cloudFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .anim-led-1 { animation: ledBlink 1.2s infinite; }
    .anim-led-2 { animation: ledBlink 1.8s infinite 0.5s; }
    .anim-cloud { animation: cloudFloat 4s ease-in-out infinite; }
  </style>

  <!-- Geometric Cloud Silhouette Top -->
  <g class="anim-cloud">
    <path d="M 270,140 C 270,115 295,95 325,95 C 340,95 354,102 362,112 C 372,105 385,100 400,100 C 430,100 450,122 450,145 C 470,148 480,162 480,180 C 480,200 460,215 440,215 L 260,215 C 235,215 220,198 220,178 C 220,158 238,142 260,140 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <path d="M 320,150 L 380,150" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />
  </g>

  <!-- Server Racks Stack Center/Bottom -->
  <g>
    <!-- Rack 1 -->
    <rect x="260" y="230" width="180" height="24" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="280" cy="242" r="3" fill="${acc}" class="anim-led-1" />
    <circle cx="295" cy="242" r="3" fill="#10B981" class="anim-led-2" />
    <line x1="320" y1="242" x2="420" y2="242" stroke="#52525B" stroke-width="2" />

    <!-- Rack 2 -->
    <rect x="260" y="260" width="180" height="24" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="280" cy="272" r="3" fill="${acc}" class="anim-led-2" />
    <circle cx="295" cy="272" r="3" fill="#3B82F6" />
    <line x1="320" y1="272" x2="420" y2="272" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Uplink / Downlink Beams -->
  <line x1="350" y1="215" x2="350" y2="230" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'database_stack',
			name: 'Relational Database & Data Lake Stack',
			title: 'RELATIONAL DATA ARCHIVE',
			tag: '[ DATA LAKE // HIGH THROUGHPUT ]',
			regex: /(database|basis data|penyimpanan data|data warehouse|tabel data|data pipeline|query sql|data store)/i,
			nodes: ['01. RAW INGESTION', '02. INDEXING & SHARDING', '03. ACID TRANSACTIONS', '04. QUERY LATENCY ZERO'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes discShift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes queryScan { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(90px); opacity: 0; } }
    .anim-top-disc { animation: discShift 3s ease-in-out infinite; }
    .anim-scanner { animation: queryScan 2.5s linear infinite; }
  </style>

  <!-- Database Cylinder Stack -->
  <!-- Cylinder 3 (Bottom) -->
  <g>
    <path d="M 270,230 L 270,270 C 270,290 430,290 430,270 L 430,230" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <ellipse cx="350" cy="230" rx="80" ry="22" fill="#18181b" stroke="#52525B" stroke-width="1.8" />
  </g>

  <!-- Cylinder 2 (Middle) -->
  <g>
    <path d="M 270,180 L 270,220 C 270,240 430,240 430,220 L 430,180" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <ellipse cx="350" cy="180" rx="80" ry="22" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Cylinder 1 (Top) -->
  <g class="anim-top-disc">
    <path d="M 270,130 L 270,170 C 270,190 430,190 430,170 L 430,130" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <ellipse cx="350" cy="130" rx="80" ry="22" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <ellipse cx="350" cy="130" rx="50" ry="14" fill="none" stroke="${acc}" stroke-width="1.8" stroke-dasharray="4,4" />
  </g>

  <!-- Query Scan Laser Beam -->
  <line x1="250" y1="150" x2="450" y2="150" stroke="${acc}" stroke-width="2" class="anim-scanner" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'quantum_sphere',
			name: 'Bloch Sphere & Quantum Superposition',
			title: 'QUANTUM SUPERPOSITION',
			tag: '[ KUBIT SUPERPOSISI // BLOCH SPHERE ]',
			regex: /(komputer kuantum|quantum computing|qubit|superposisi|quantum supremacy|gerbang kuantum|bloch sphere)/i,
			nodes: ['01. BASIS STATE |0>', '02. SUPERPOSITION PHASE', '03. ENTANGLEMENT', '04. COLLAPSE |1>'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes spinQubit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes vectorWobble { 0%, 100% { transform: rotate(35deg); } 50% { transform: rotate(55deg); } }
    .anim-orbit { animation: spinQubit 12s linear infinite; transform-origin: 350px 185px; }
    .anim-vector { animation: vectorWobble 3s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Bloch Sphere Equator & Coordinates -->
  <!-- Vertical Z Axis -->
  <line x1="350" y1="95" x2="350" y2="275" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="350" y="85" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">|0⟩</text>
  <text x="350" y="295" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">|1⟩</text>

  <!-- Outer Great Circle -->
  <circle cx="350" cy="185" r="75" fill="none" stroke="#52525B" stroke-width="1.8" />
  <!-- Horizontal Equator Ellipse -->
  <ellipse cx="350" cy="185" rx="75" ry="24" fill="none" stroke="#FFFFFF" stroke-width="2" class="anim-orbit" stroke-dasharray="6,4" />

  <!-- Quantum State Vector |Ψ⟩ Arrow -->
  <g class="anim-vector">
    <line x1="350" y1="185" x2="350" y2="120" stroke="${acc}" stroke-width="3.5" stroke-linecap="round" />
    <circle cx="350" cy="120" r="5" fill="${acc}" />
  </g>

  <!-- Center Anchor Origin -->
  <circle cx="350" cy="185" r="4" fill="#FFFFFF" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cyber_firewall',
			name: 'Hexagonal Shield & Enkripsi Keamanan',
			title: 'CRYPTOGRAPHIC FORTRESS',
			tag: '[ CYBER SECURITY // ZERO TRUST ]',
			regex: /(cyber security|keamanan siber|firewall|enkripsi data|hacker pertahanan|proteksi data|kriptografi|zero trust)/i,
			nodes: ['01. PERIMETER AUTH', '02. 256-BIT ENCRYPTION', '03. ANOMALY DETECTION', '04. IMMUTABLE INTEGRITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes shieldPulse { 0%, 100% { stroke-opacity: 0.6; transform: scale(1); } 50% { stroke-opacity: 1; transform: scale(1.03); } }
    @keyframes keyRotate { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
    .anim-shield { animation: shieldPulse 3s infinite ease-in-out; transform-origin: 350px 185px; }
    .anim-lock { animation: keyRotate 2.5s infinite ease-in-out; transform-origin: 350px 190px; }
  </style>

  <!-- Hexagonal Firewall Barrier Perimeter -->
  <g class="anim-shield">
    <polygon points="350,95 430,140 430,230 350,275 270,230 270,140" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <polygon points="350,110 415,148 415,222 350,260 285,222 285,148" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="6,4" />
  </g>

  <!-- Lock Mechanism Glyph Center -->
  <g class="anim-lock">
    <!-- Shackle -->
    <path d="M 335,175 L 335,160 C 335,150 365,150 365,160 L 365,175" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    <!-- Lock Body -->
    <rect x="325" y="175" width="50" height="40" rx="6" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <!-- Keyhole -->
    <circle cx="350" cy="192" r="4" fill="#FFFFFF" />
    <line x1="350" y1="194" x2="350" y2="204" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'ai_prompt_engine',
			name: 'LLM Prompt Engine & Generative Synthesis',
			title: 'GENERATIVE PROMPT ENGINE',
			tag: '[ LLM INFERENCE // GENERATIVE TOKEN STREAM ]',
			regex: /(prompt engineering|large language model|llm|generative ai|chatgpt|generate teks ai|token model|deepseek|claude|gemini)/i,
			nodes: ['01. CONTEXT WINDOW', '02. ATTENTION WEIGHTS', '03. TEMPERATURE SAMPLING', '04. TOKEN STREAMING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes sparkleSpin { 0% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.2) rotate(45deg); } 100% { transform: scale(1) rotate(90deg); } }
    @keyframes tokenFlow { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-sparkle { animation: sparkleSpin 3s linear infinite; transform-origin: 350px 145px; }
    .anim-tokens { stroke-dasharray: 6,6; animation: tokenFlow 1.5s linear infinite; }
  </style>

  <!-- Prompt Input Bracket Box -->
  <rect x="180" y="195" width="340" height="60" rx="30" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="220" y1="225" x2="380" y2="225" stroke="#52525B" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="480" cy="225" r="14" fill="${acc}" />
  <path d="M 475,225 L 485,225 M 480,220 L 485,225 L 480,230" stroke="#18181b" stroke-width="2" fill="none" stroke-linecap="round" />

  <!-- Generative Sparkle Core Top -->
  <g class="anim-sparkle">
    <path d="M 350,115 Q 350,145 320,145 Q 350,145 350,175 Q 350,145 380,145 Q 350,145 350,115 Z" fill="${acc}" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Radiating Token Particles -->
  <line x1="280" y1="145" x2="300" y2="145" stroke="${acc}" stroke-width="2" />
  <line x1="400" y1="145" x2="420" y2="145" stroke="${acc}" stroke-width="2" />
  <line x1="350" y1="175" x2="350" y2="195" stroke="${acc}" stroke-width="2.5" class="anim-tokens" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'agent_swarm',
			name: 'Autonomous Agent Swarm & Collective Intelligence',
			title: 'AUTONOMOUS AGENT SWARM',
			tag: '[ MULTI-AGENT SYSTEM // SWARM INTELLIGENCE ]',
			regex: /(agen ai|autonomous agent|ai swarm|sistem otonom|multi-agent|auto gpt|agentic system|orkestrator agen)/i,
			nodes: ['01. TASK DECOMPOSITION', '02. SPECIALIZED ROLES', '03. CONSENSUS PROTOCOL', '04. SYNERGISTIC EXECUTION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes swarmOrbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes corePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .anim-swarm { animation: swarmOrbit 16s linear infinite; transform-origin: 350px 185px; }
    .anim-core-agent { animation: corePulse 2.5s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Orbital Agent Path Rings -->
  <circle cx="350" cy="185" r="85" fill="none" stroke="#52525B" stroke-width="1.5" stroke-dasharray="4,6" />

  <!-- Center Master Orchestrator Agent -->
  <g class="anim-core-agent">
    <circle cx="350" cy="185" r="24" fill="#18181b" stroke="${acc}" stroke-width="3.5" />
    <circle cx="350" cy="185" r="8" fill="#FFFFFF" />
  </g>

  <!-- Revolving Sub-Agents Swarm -->
  <g class="anim-swarm">
    <!-- Sub-Agent 1 -->
    <g transform="translate(350,100)">
      <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="0" cy="0" r="4" fill="${acc}" />
    </g>
    <!-- Sub-Agent 2 -->
    <g transform="translate(435,225)">
      <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="0" cy="0" r="4" fill="${acc}" />
    </g>
    <!-- Sub-Agent 3 -->
    <g transform="translate(265,225)">
      <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="0" cy="0" r="4" fill="${acc}" />
    </g>
    <!-- Cross Interlink Traces -->
    <line x1="350" y1="114" x2="425" y2="215" stroke="#52525B" stroke-width="1.2" />
    <line x1="425" y1="225" x2="275" y2="225" stroke="#52525B" stroke-width="1.2" />
    <line x1="275" y1="215" x2="350" y2="114" stroke="#52525B" stroke-width="1.2" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
