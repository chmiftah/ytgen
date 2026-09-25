/**
 * THEME: SPACE & DEEP COSMOS (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeSpace = {
	categoryName: 'space',
	categoryLabel: '🚀 Ruang Angkasa & Kosmos',
	themeColor: '#A855F7', // Cosmic Purple / Violet
	items: [
		{
			id: 'rocket_propulsion',
			name: 'Multi-Stage Rocket & Atmospheric Escape',
			title: 'ESCAPE VELOCITY PROPULSION',
			tag: '[ ROKET ANTARIKSA // DAYA DORONG LEPAS LANDAS ]',
			regex: /(peluncuran roket|kecepatan lepas|saturn v|daya dorong roket|penerbangan luar angkasa|dorongan roket)/i,
			nodes: ['01. CRYOGENIC IGNITION', '02. SHOCK DIAMOND EXHAUST', '03. STAGE SEPARATION', '04. ORBITAL INSERTION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes rocketShudder { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes exhaustBlast { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-rocket { animation: rocketShudder 1.5s ease-in-out infinite; }
    .anim-exhaust { stroke-dasharray: 6,4; animation: exhaustBlast 0.8s linear infinite; }
  </style>

  <!-- Ground Launch Gantry & Tower Lines -->
  <line x1="220" y1="90" x2="220" y2="280" stroke="#52525B" stroke-width="2" />
  <line x1="220" y1="120" x2="295" y2="120" stroke="#52525B" stroke-width="1.8" stroke-dasharray="3,3" />
  <line x1="220" y1="180" x2="295" y2="180" stroke="#52525B" stroke-width="1.8" stroke-dasharray="3,3" />

  <g class="anim-rocket">
    <!-- Rocket Cylindrical Fuselage -->
    <rect x="320" y="85" width="60" height="135" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <!-- Conical Payload Nose Fairing -->
    <polygon points="320,85 350,30 380,85" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <circle cx="350" cy="65" r="4" fill="${acc}" />

    <!-- Stage Separation Ring -->
    <line x1="320" y1="150" x2="380" y2="150" stroke="${acc}" stroke-width="3" />

    <!-- Aerodynamic Tail Fins -->
    <polygon points="320,190 295,225 320,220" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <polygon points="380,190 405,225 380,220" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Rocket Engine Bells (Nozzles) -->
    <polygon points="330,220 325,235 345,235 340,220" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <polygon points="360,220 355,235 375,235 370,220" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- High-Energy Kinetic Exhaust Shock Diamonds -->
  <g class="anim-exhaust">
    <path d="M 335,235 L 350,250 L 335,265 L 350,280 L 335,295 M 365,235 L 350,250 L 365,265 L 350,280 L 365,295" stroke="${acc}" stroke-width="2.5" fill="none" />
    <line x1="350" y1="235" x2="350" y2="305" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4,4" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'satellite_orbit',
			name: 'Orbital Satellite & Earth Transceiver Relay',
			title: 'ORBITAL TELEMETRY RELAY',
			tag: '[ SATELIT ORBIT // TRANSMISI TELEMETRI BUMI ]',
			regex: /(satelit orbit|panel surya satelit|transmisi satelit|relay sinyal luar angkasa|telemetri antariksa)/i,
			nodes: ['01. GEOSYNCHRONOUS ORBIT', '02. PHOTOVOLTAIC TRACKING', '03. MICROWAVE UPLINK', '04. CONTINUOUS GROUND BEAM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes beamPulseSat { 0%, 100% { stroke-opacity: 0.3; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 6px ${acc}); } }
    .anim-telemetry { animation: beamPulseSat 2s infinite ease-in-out; }
  </style>

  <!-- Curvature of Earth Horizon Below -->
  <path d="M 140,290 C 240,260 460,260 560,290" fill="none" stroke="#52525B" stroke-width="2" stroke-dasharray="4,4" />
  <!-- Ground Receiving Station Dish -->
  <g transform="translate(430, 240)">
    <path d="M 0,20 C 15,5 35,5 50,20" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="25" y1="20" x2="25" y2="35" stroke="#FFFFFF" stroke-width="2" />
    <circle cx="25" cy="8" r="3" fill="${acc}" />
  </g>

  <!-- Satellite Bus Core Body -->
  <g transform="translate(260, 110)">
    <!-- Central Avionics Cube Body -->
    <rect x="70" y="40" width="40" height="40" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="90" cy="60" r="8" fill="#18181b" stroke="${acc}" stroke-width="2" />

    <!-- Left Solar Array Wing -->
    <rect x="0" y="45" width="60" height="30" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <line x1="20" y1="45" x2="20" y2="75" stroke="#FFFFFF" stroke-width="1.8" />
    <line x1="40" y1="45" x2="40" y2="75" stroke="#FFFFFF" stroke-width="1.8" />
    <line x1="60" y1="60" x2="70" y2="60" stroke="#FFFFFF" stroke-width="3" />

    <!-- Right Solar Array Wing -->
    <rect x="120" y="45" width="60" height="30" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <line x1="140" y1="45" x2="140" y2="75" stroke="#FFFFFF" stroke-width="1.8" />
    <line x1="160" y1="45" x2="160" y2="75" stroke="#FFFFFF" stroke-width="1.8" />
    <line x1="110" y1="60" x2="120" y2="60" stroke="#FFFFFF" stroke-width="3" />

    <!-- High-Gain Downlink Parabolic Dish -->
    <path d="M 80,85 C 80,105 100,105 100,85" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="90" y1="80" x2="90" y2="95" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Directed Downlink Radio Frequency Waves to Ground Dish -->
  <g class="anim-telemetry">
    <line x1="350" y1="205" x2="455" y2="248" stroke="${acc}" stroke-width="2.5" stroke-dasharray="5,3" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'saturn_rings',
			name: 'Saturnian Planet & Concentric Orbital Rings',
			title: 'CELESTIAL EQUATORIAL RINGS',
			tag: '[ CINCIN PLANET SATURNUS // GRAVITASI TATA SURYA ]',
			regex: /(planet saturnus|cincin saturnus|cincin planet|gravitasi planet|tata surya kosmik)/i,
			nodes: ['01. GAS GIANT CORE', '02. CASSINI DIVISION GAP', '03. ICE PARTICULATE ORBIT', '04. TIDAL EQUILIBRIUM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes ringGleam { 0%, 100% { stroke-opacity: 0.7; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 6px ${acc}); } }
    .anim-saturn-ring { animation: ringGleam 3s infinite ease-in-out; }
  </style>

  <!-- Background Ring Arc (Occluded Behind Planet) -->
  <g class="anim-saturn-ring">
    <ellipse cx="350" cy="185" rx="170" ry="40" fill="none" stroke="${acc}" stroke-width="3" stroke-dasharray="10,4" />
    <ellipse cx="350" cy="185" rx="145" ry="32" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6,4" />
  </g>

  <!-- Gas Giant Planet Sphere -->
  <circle cx="350" cy="185" r="75" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
  <!-- Atmosphere Cloud Bands Latitudinal Lines -->
  <path d="M 285,165 Q 350,185 415,165" fill="none" stroke="#52525B" stroke-width="2" />
  <path d="M 276,185 Q 350,205 424,185" fill="none" stroke="${acc}" stroke-width="2.5" />
  <path d="M 285,205 Q 350,225 415,205" fill="none" stroke="#52525B" stroke-width="2" />

  <!-- Foreground Ring Arc (Overlapping Front of Planet) -->
  <path d="M 180,185 C 180,225 520,225 520,185" fill="none" stroke="${acc}" stroke-width="3.5" />
  <path d="M 205,185 C 205,217 495,217 495,185" fill="none" stroke="#FFFFFF" stroke-width="2" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'space_station',
			name: 'Modular Space Station & Microgravity Lab',
			title: 'MODULAR HABITAT OUTPOST',
			tag: '[ STASIUN LUAR ANGKASA // LABORATORIUM MIKROGRAVITASI ]',
			regex: /(stasiun luar angkasa|iss|laboratorium antariksa|modul stasiun luar angkasa|microgravity outpost)/i,
			nodes: ['01. CENTRAL TRUSS SPINE', '02. PRESSURIZED NODES', '03. RADIATOR ARRAYS', '04. 28,000 KM/H FLIGHT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes stationFlyby { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(0.5deg); } }
    .anim-station { animation: stationFlyby 5s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <g class="anim-station">
    <!-- Long Transverse Truss Main Beam -->
    <line x1="200" y1="185" x2="500" y2="185" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <line x1="200" y1="180" x2="500" y2="180" stroke="${acc}" stroke-width="1.8" stroke-dasharray="6,4" />

    <!-- Pressurized Habitat Living Modules Stack (Center) -->
    <rect x="330" y="145" width="40" height="80" rx="6" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <circle cx="350" cy="165" r="5" fill="${acc}" />
    <circle cx="350" cy="205" r="5" fill="${acc}" />
    <rect x="315" y="170" width="70" height="28" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Left Gigantic Solar Panels Assembly -->
    <g transform="translate(190, 110)">
      <rect x="0" y="0" width="35" height="150" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
      <line x1="0" y1="30" x2="35" y2="30" stroke="#FFFFFF" stroke-width="1.5" />
      <line x1="0" y1="60" x2="35" y2="60" stroke="#FFFFFF" stroke-width="1.5" />
      <line x1="0" y1="90" x2="35" y2="90" stroke="#FFFFFF" stroke-width="1.5" />
      <line x1="0" y1="120" x2="35" y2="120" stroke="#FFFFFF" stroke-width="1.5" />
    </g>

    <!-- Right Gigantic Solar Panels Assembly -->
    <g transform="translate(475, 110)">
      <rect x="0" y="0" width="35" height="150" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
      <line x1="0" y1="30" x2="35" y2="30" stroke="#FFFFFF" stroke-width="1.5" />
      <line x1="0" y1="60" x2="35" y2="60" stroke="#FFFFFF" stroke-width="1.5" />
      <line x1="0" y1="90" x2="35" y2="90" stroke="#FFFFFF" stroke-width="1.5" />
      <line x1="0" y1="120" x2="35" y2="120" stroke="#FFFFFF" stroke-width="1.5" />
    </g>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'wormhole_fold',
			name: 'Einstein-Rosen Bridge & Spacetime Fold',
			title: 'EINSTEIN-ROSEN SHORTCUT',
			tag: '[ LUBANG CACING WORMHOLE // LIPATAN RUANG WAKTU ]',
			regex: /(lubang cacing|wormhole|einstein rosen|lipatan ruang waktu|shortcut antariksa|pintu dimensi)/i,
			nodes: ['01. TWO DISTANT POINTS', '02. MASS-ENERGY TENSION', '03. SPATIAL GEOMETRY FOLD', '04. INSTANTANEOUS TRANSIT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes bridgePulse { 0%, 100% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    .anim-throat { stroke-dasharray: 6,4; animation: bridgePulse 1.5s linear infinite; }
  </style>

  <!-- Top Spacetime Sheet (Plane A) -->
  <polygon points="180,90 480,90 520,130 220,130" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="110" r="22" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Bottom Spacetime Sheet (Plane B) -->
  <polygon points="180,230 480,230 520,270 220,270" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="350" cy="250" r="22" fill="#18181b" stroke="${acc}" stroke-width="2.5" />

  <!-- Hyperbolic Wormhole Throat Funnel Connecting Both Planes -->
  <path d="M 328,110 C 335,180 335,180 328,250" fill="none" stroke="#FFFFFF" stroke-width="3" />
  <path d="M 372,110 C 365,180 365,180 372,250" fill="none" stroke="#FFFFFF" stroke-width="3" />

  <!-- Kinetic Singularity Conduit Stream inside Throat -->
  <line x1="350" y1="110" x2="350" y2="250" stroke="${acc}" stroke-width="3" class="anim-throat" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'mars_colony_dome',
			name: 'Mars Habitat Dome & Planetary Frontier',
			title: 'MARTIAN GEODESIC BIOSPHERE',
			tag: '[ KUBAH HABITAT MARS // PENGHUNI KOLONI PLANET MERAH ]',
			regex: /(koloni mars|kubah mars|habitat mars|planet merah|biosfer antariksa|pionir luar angkasa)/i,
			nodes: ['01. REGOLITH BERM SHELTER', '02. GEODESIC PRESSURIZATION', '03. CLOSED HYDROLOGICAL CYCLE', '04. MULTI-PLANETARY CIVILIZATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes oxygenPulse { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 1; filter: drop-shadow(0 0 8px ${acc}); } }
    .anim-dome { animation: oxygenPulse 3s infinite ease-in-out; }
  </style>

  <!-- Craggy Martian Crater Surface Horizon -->
  <path d="M 140,265 C 220,250 280,265 350,260 C 420,255 480,270 560,265" fill="none" stroke="#52525B" stroke-width="2.5" />

  <!-- Geodesic Pressurized Dome Shell -->
  <g class="anim-dome">
    <path d="M 230,260 C 230,130 470,130 470,260 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    
    <!-- Geodesic Triangulation Framework Lattice -->
    <path d="M 350,130 L 290,195 L 410,195 Z" fill="none" stroke="${acc}" stroke-width="2" />
    <path d="M 290,195 L 245,260 L 350,260 L 455,260 L 410,195" fill="none" stroke="${acc}" stroke-width="2" />
    <line x1="350" y1="130" x2="350" y2="195" stroke="#FFFFFF" stroke-width="2" />
    <line x1="350" y1="195" x2="350" y2="260" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Airlock Pressure Chamber Vestibule Tunnel -->
  <rect x="470" y="235" width="40" height="25" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <line x1="490" y1="235" x2="490" y2="260" stroke="${acc}" stroke-width="2" />

  <!-- Distant Two Martian Moons (Phobos & Deimos) -->
  <circle cx="210" cy="90" r="6" fill="#18181b" stroke="${acc}" stroke-width="2" />
  <circle cx="240" cy="70" r="3" fill="#FFFFFF" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'radio_telescope',
			name: 'Parabolic Radio Telescope & Cosmic SETI Array',
			title: 'DEEP SPACE RADIOMETRIC ARRAY',
			tag: '[ TELESKOP RADIO // MENDENGARKAN GEMAS KOSMOS ]',
			regex: /(teleskop radio|parabola radio|sinyal kosmologis|mendengar luar angkasa|observatorium radio|seti)/i,
			nodes: ['01. PARABOLIC DISH REFLECTOR', '02. SUBREFLECTOR FOCUS', '03. CRYOGENIC RECEIVER', '04. PULSAR FAST-FOURIER TRANSFORM'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes dishTilt { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
    .anim-dish { animation: dishTilt 6s ease-in-out infinite; transform-origin: 350px 210px; }
  </style>

  <!-- Foundation Pylon & Azimuth Track Base -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <polygon points="310,270 350,210 390,270" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="350" cy="210" r="7" fill="${acc}" />

  <!-- Massive Tilting Parabolic Dish -->
  <g class="anim-dish">
    <!-- Deep Parabolic Curved Dish Reflector -->
    <path d="M 230,120 C 310,180 390,180 470,120" fill="#18181b" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <path d="M 250,135 C 315,185 385,185 450,135" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,3" />

    <!-- Tripod Feed Support Spars -->
    <line x1="270" y1="150" x2="350" y2="70" stroke="#52525B" stroke-width="2" />
    <line x1="430" y1="150" x2="350" y2="70" stroke="#52525B" stroke-width="2" />
    <!-- Focal Receiver Point (Glowing) -->
    <circle cx="350" cy="70" r="8" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="350" cy="70" r="3" fill="#FFFFFF" />
  </g>

  <!-- Incoming Cosmic Radio Signals -->
  <line x1="330" y1="30" x2="345" y2="60" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />
  <line x1="370" y1="30" x2="355" y2="60" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'white_hole',
			name: 'White Hole Fountain & Spontaneous Genesis',
			title: 'WHITE HOLE ENERGY FOUNTAIN',
			tag: '[ LUBANG PUTIH // PANCARAN ENERGI SPONTAN KOSMOS ]',
			regex: /(lubang putih|white hole|kebalikan black hole|pancaran energi kosmos|singularitas pancar)/i,
			nodes: ['01. TIME-REVERSED HORIZON', '02. ZERO EVENT CROSSING', '03. SPONTANEOUS PHOTON ERUPTION', '04. THERMODYNAMIC RESEEDING'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes radiateJets { 0% { stroke-dashoffset: 60; opacity: 0.6; } 100% { stroke-dashoffset: 0; opacity: 1; } }
    @keyframes coreStrobe { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px #FFFFFF); } 50% { transform: scale(1.15); filter: drop-shadow(0 0 16px ${acc}); } }
    .anim-jets { stroke-dasharray: 6,6; animation: radiateJets 1.2s linear infinite; }
    .anim-white-core { animation: coreStrobe 2s infinite ease-in-out; transform-origin: 350px 185px; }
  </style>

  <!-- Concentric Expulsive Pressure Waves -->
  <circle cx="350" cy="185" r="115" fill="none" stroke="#52525B" stroke-width="1.8" stroke-dasharray="6,4" />
  <circle cx="350" cy="185" r="75" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="4,4" />

  <!-- Expulsion Polar Energy Jets Radiating Outward -->
  <g class="anim-jets">
    <line x1="350" y1="185" x2="350" y2="45" stroke="#FFFFFF" stroke-width="3.5" />
    <line x1="350" y1="185" x2="350" y2="325" stroke="#FFFFFF" stroke-width="3.5" />
    <line x1="350" y1="185" x2="210" y2="185" stroke="${acc}" stroke-width="3" />
    <line x1="350" y1="185" x2="490" y2="185" stroke="${acc}" stroke-width="3" />
  </g>

  <!-- Pure White Glowing Core Singularity -->
  <g class="anim-white-core">
    <circle cx="350" cy="185" r="28" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    <circle cx="350" cy="185" r="16" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'lunar_lander',
			name: 'Apollo Lunar Module & Tranquility Touchdown',
			title: 'LUNAR SURFACE TOUCHDOWN',
			tag: '[ MODUL PENDARAT BULAN // JEJAK KAKI PERADABAN ]',
			regex: /(pendaratan bulan|lunar module|apollo|mendarat di bulan|jejak kaki bulan|modul pendarat)/i,
			nodes: ['01. POWERED DESCENT INITIATION', '02. REACTION CONTROL THRUST', '03. FOOTPAD CONTACT SENSOR', '04. THE EAGLE HAS LANDED'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes dustPuff { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
    .anim-dust { animation: dustPuff 2s infinite ease-out; transform-origin: 350px 260px; }
  </style>

  <!-- Regolith Lunar Horizon Surface with Craters -->
  <path d="M 140,265 C 200,260 250,275 350,265 C 450,255 500,270 560,265" fill="none" stroke="#FFFFFF" stroke-width="3" />
  <ellipse cx="230" cy="270" rx="30" ry="8" fill="none" stroke="#52525B" stroke-width="2" />
  <ellipse cx="480" cy="272" rx="20" ry="5" fill="none" stroke="#52525B" stroke-width="2" />

  <!-- Lunar Module Descent Stage (Octagonal Foil Base) -->
  <g transform="translate(275, 110)">
    <!-- Lower Octagonal Foil Chassis -->
    <polygon points="35,115 115,115 135,90 15,90" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <!-- Descent Engine Bell -->
    <polygon points="65,115 55,140 95,140 85,115" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- 4 Splayed Spider Landing Gear Legs -->
    <!-- Left Leg -->
    <line x1="20" y1="105" x2="-35" y2="155" stroke="#FFFFFF" stroke-width="3" />
    <line x1="-35" y1="155" x2="-45" y2="155" stroke="${acc}" stroke-width="4" stroke-linecap="round" />
    <line x1="20" y1="105" x2="-10" y2="140" stroke="#52525B" stroke-width="2" />
    
    <!-- Right Leg -->
    <line x1="130" y1="105" x2="185" y2="155" stroke="#FFFFFF" stroke-width="3" />
    <line x1="185" y1="155" x2="195" y2="155" stroke="${acc}" stroke-width="4" stroke-linecap="round" />
    <line x1="130" y1="105" x2="160" y2="140" stroke="#52525B" stroke-width="2" />

    <!-- Upper Ascent Stage Cabin -->
    <path d="M 40,90 L 40,40 L 60,20 L 90,20 L 110,40 L 110,90 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <!-- Triangular Triangular Cockpit Windows -->
    <polygon points="50,45 65,45 60,55" fill="${acc}" />
    <polygon points="100,45 85,45 90,55" fill="${acc}" />
    <!-- Center Ingress Hatch Door -->
    <rect x="68" y="55" width="14" height="25" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Footprint Plaque in Dust -->
  <rect x="420" y="270" width="12" height="6" rx="2" fill="${acc}" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'cosmic_nebula',
			name: 'Stellar Nursery Nebula & Protostar Genesis',
			title: 'PROTOSTAR STELLAR NURSERY',
			tag: '[ NEBULA PEMBENTUKAN BINTANG // KELAHIRAN CAHAYA BARU ]',
			regex: /(nebula|kelahiran bintang|protostar|awan nebula|nursery bintang|kosmos purba)/i,
			nodes: ['01. MOLECULAR HYDROGEN CLOUD', '02. JEANS INSTABILITY COLLAPSE', '03. ROTATING ACCRETION DISK', '04. THERMONUCLEAR IGNITION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes swirlNebula { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes protostarPulse { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px #FFFFFF); } 50% { transform: scale(1.2); filter: drop-shadow(0 0 18px ${acc}); } }
    .anim-nebula-arms { animation: swirlNebula 25s linear infinite; transform-origin: 350px 185px; }
    .anim-star-core { animation: protostarPulse 2s infinite ease-in-out; transform-origin: 350px 185px; }
  </style>

  <!-- Swirling Interstellar Gas Arms -->
  <g class="anim-nebula-arms">
    <!-- Logarithmic Spiral Cloud Arms -->
    <path d="M 350,185 C 380,120 450,110 500,160 C 530,190 510,250 440,270 C 370,290 280,260 250,190 C 220,120 280,60 370,50" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="6,4" />
    <path d="M 350,185 C 320,250 250,260 200,210 C 170,180 190,120 260,100 C 330,80 420,110 450,180 C 480,250 420,310 330,320" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8,6" />

    <!-- Dispersed Ionized Gas Droplets -->
    <circle cx="430" cy="140" r="3" fill="${acc}" />
    <circle cx="270" cy="230" r="3" fill="#FFFFFF" />
    <circle cx="480" cy="240" r="4" fill="${acc}" />
    <circle cx="220" cy="130" r="4" fill="#FFFFFF" />
  </g>

  <!-- Central Burning Protostar Seed -->
  <g class="anim-star-core">
    <!-- 4-Pointed Diffraction Spike Cross -->
    <line x1="300" y1="185" x2="400" y2="185" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <line x1="350" y1="135" x2="350" y2="235" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <circle cx="350" cy="185" r="14" fill="#18181b" stroke="${acc}" stroke-width="3" />
    <circle cx="350" cy="185" r="6" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
