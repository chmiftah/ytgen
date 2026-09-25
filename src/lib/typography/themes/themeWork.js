/**
 * THEME: WORK & PEKERJAAN (10 Items)
 * Dan Koe Minimalist Kinetic Wireframe Diagrams
 */

export const themeWork = {
	categoryName: 'work',
	categoryLabel: '🔨 Pekerjaan & Craftsmanship',
	items: [
		{
			id: 'anvil_hammer',
			name: 'Blacksmith Anvil & Forged Under Pressure',
			title: 'FORGED UNDER RESISTANCE',
			tag: '[ PROSES PENEMPAAN // TEMPAAN PALU BESI ]',
			regex: /(menempa|landasan besi|anvil|palu besi|ditempa beban|proses penempaan|blacksmith|tempaan karakter)/i,
			nodes: ['01. GLOWING RAW IRON', '02. HEAVY BLOWS', '03. QUENCH TEMPERING', '04. RAZOR-SHARP INTEGRITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes hammerStrike { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(-35deg); } 60% { transform: rotate(5deg); } }
    @keyframes sparkBurst { 0% { opacity: 0; r: 2; } 50% { opacity: 1; r: 18; } 100% { opacity: 0; r: 2; } }
    .anim-hammer { animation: hammerStrike 2.2s infinite ease-in-out; transform-origin: 430px 100px; }
    .anim-forge-spark { animation: sparkBurst 2.2s infinite ease-out; transform-origin: 350px 175px; }
  </style>

  <!-- Heavy Timber Base Stand Horizon -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />
  <rect x="290" y="225" width="120" height="45" rx="4" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Heavy Cast-Steel Anvil Profile -->
  <g>
    <!-- Horn Left, Waist Middle, Heel Right -->
    <path d="M 230,175 L 300,175 L 300,195 L 320,225 L 380,225 L 400,195 L 450,175 L 450,160 L 300,160 C 270,160 245,170 230,175 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
    <line x1="300" y1="160" x2="450" y2="160" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Impact Sparks Glowing Nexus -->
  <circle cx="350" cy="160" r="16" fill="none" stroke="${acc}" stroke-width="2" class="anim-forge-spark" stroke-dasharray="3,3" />
  <circle cx="350" cy="160" r="4.5" fill="${acc}" />

  <!-- Sledgehammer Striking Down -->
  <g class="anim-hammer">
    <!-- Shaft Handle -->
    <line x1="430" y1="90" x2="365" y2="150" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <!-- Steel Hammerhead -->
    <rect x="345" y="140" width="40" height="20" rx="3" fill="#18181b" stroke="${acc}" stroke-width="3" transform="rotate(40 365 150)" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'blueprint_draft',
			name: 'Architect Blueprint & Systematic Design',
			title: 'ARCHITECTURAL BLUEPRINT',
			tag: '[ DESAIN ARSITEKTUR // CETAK BIRU SISTEM ]',
			regex: /(cetak biru|blueprint|arsitek|rancangan gambar|penggaris gambar|desain arsitektur|sketsa teknis)/i,
			nodes: ['01. ABSTRACT SCHEMATIC', '02. STRUCTURAL TOLERANCES', '03. FOUNDATIONAL DRAFT', '04. MONUMENTAL REALITY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes gridGlow { 0%, 100% { stroke-opacity: 0.3; } 50% { stroke-opacity: 0.6; } }
    @keyframes compassDraft { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
    .anim-draft-grid { animation: gridGlow 3s infinite ease-in-out; }
    .anim-draft-compass { animation: compassDraft 3s ease-in-out infinite; transform-origin: 430px 135px; }
  </style>

  <!-- Blueprint Sheet Casing -->
  <rect x="200" y="100" width="300" height="190" rx="8" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Architectural Grid Lines Background -->
  <g class="anim-draft-grid" stroke="#52525B" stroke-width="1" stroke-dasharray="2,2">
    <line x1="200" y1="140" x2="500" y2="140" />
    <line x1="200" y1="180" x2="500" y2="180" />
    <line x1="200" y1="220" x2="500" y2="220" />
    <line x1="200" y1="260" x2="500" y2="260" />
    <line x1="250" y1="100" x2="250" y2="290" />
    <line x1="300" y1="100" x2="300" y2="290" />
    <line x1="350" y1="100" x2="350" y2="290" />
    <line x1="400" y1="100" x2="400" y2="290" />
    <line x1="450" y1="100" x2="450" y2="290" />
  </g>

  <!-- Technical Elevation Schematic Floorplan -->
  <rect x="235" y="145" width="130" height="105" fill="none" stroke="${acc}" stroke-width="2.5" />
  <line x1="235" y1="195" x2="365" y2="195" stroke="#FFFFFF" stroke-width="1.8" />
  <line x1="300" y1="145" x2="300" y2="250" stroke="#FFFFFF" stroke-width="1.8" />
  
  <!-- Dimensioning Dimension Lines With Arrowheads -->
  <line x1="235" y1="130" x2="365" y2="130" stroke="${acc}" stroke-width="1.5" />
  <line x1="235" y1="125" x2="235" y2="135" stroke="${acc}" stroke-width="1.5" />
  <line x1="365" y1="125" x2="365" y2="135" stroke="${acc}" stroke-width="1.5" />
  <text x="300" y="125" font-family="'JetBrains Mono', monospace" font-size="8" fill="${acc}" text-anchor="middle">W: 13.0m</text>

  <!-- Drafting Divider Compass Tool -->
  <g class="anim-draft-compass">
    <circle cx="430" cy="135" r="4" fill="${acc}" />
    <line x1="430" y1="135" x2="410" y2="185" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <line x1="430" y1="135" x2="450" y2="185" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="410" cy="185" r="2" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'briefcase_deal',
			name: 'Executive Briefcase & Commercial Mastery',
			title: 'COMMERCIAL MASTERY',
			tag: '[ PROFESIONALISME // KARIER & NEGOSIASI ]',
			regex: /(koper bisnis|briefcase|karier profesional|eksekutif|dunia kerja|negosiasi kerja|kemampuan bisnis)/i,
			nodes: ['01. HIGH-STAKES PREPARATION', '02. EXECUTIVE PRESENCE', '03. CONTRACT CLOSING', '04. LONG-TERM VALUE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes claspShine { 0%, 100% { fill: #FFFFFF; } 50% { fill: ${acc}; } }
    @keyframes caseSettle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .anim-case { animation: caseSettle 3s ease-in-out infinite; }
    .anim-clasp-shine { animation: claspShine 2s infinite; }
  </style>

  <!-- Executive Boardroom Desk Line -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <g class="anim-case">
    <!-- Curved Leather Handle -->
    <path d="M 320,130 C 320,105 380,105 380,130" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <rect x="315" y="125" width="10" height="8" rx="2" fill="${acc}" />
    <rect x="375" y="125" width="10" height="8" rx="2" fill="${acc}" />

    <!-- Briefcase Main Shell -->
    <rect x="230" y="130" width="240" height="140" rx="10" fill="#18181b" stroke="#FFFFFF" stroke-width="3.5" />
    
    <!-- Dividing Flap Seam -->
    <line x1="230" y1="185" x2="470" y2="185" stroke="#52525B" stroke-width="2" />

    <!-- Dual Brass Latches -->
    <rect x="280" y="175" width="18" height="20" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="289" cy="185" r="3" class="anim-clasp-shine" />

    <rect x="402" y="175" width="18" height="20" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <circle cx="411" cy="185" r="3" class="anim-clasp-shine" />

    <!-- Reinforced Corner Brackets -->
    <path d="M 245,130 L 230,130 L 230,145" fill="none" stroke="${acc}" stroke-width="2.5" />
    <path d="M 455,130 L 470,130 L 470,145" fill="none" stroke="${acc}" stroke-width="2.5" />
    <path d="M 245,270 L 230,270 L 230,255" fill="none" stroke="${acc}" stroke-width="2.5" />
    <path d="M 455,270 L 470,270 L 470,255" fill="none" stroke="${acc}" stroke-width="2.5" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'workbench_tools',
			name: 'Workbench & Artisan Tool Mastery',
			title: 'ARTISAN CRAFTSMANSHIP',
			tag: '[ MEJA KERJA TUKANG // KETELITIAN KARYA ]',
			regex: /(meja kerja perkakas|kunci inggris|perkakas tukang|alat pertukangan|craftsmanship|pengrajin|alat kerja manual)/i,
			nodes: ['01. CALIBRATED TOOLS', '02. HONEST RAW MATERIAL', '03. OBSESSIVE DETAIL', '04. HEIRLOOM ARTIFACT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes wrenchAngle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-8deg); } }
    .anim-wrench { animation: wrenchAngle 3s ease-in-out infinite; transform-origin: 300px 180px; }
  </style>

  <!-- Heavy Oak Workbench Surface -->
  <rect x="180" y="240" width="340" height="25" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <line x1="220" y1="265" x2="220" y2="285" stroke="#52525B" stroke-width="3" />
  <line x1="480" y1="265" x2="480" y2="285" stroke="#52525B" stroke-width="3" />

  <!-- Adjustable Machinist Wrench (Left) -->
  <g class="anim-wrench">
    <line x1="250" y1="225" x2="330" y2="135" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <!-- Wrench Head Jaws -->
    <path d="M 320,145 L 340,125 C 345,115 365,125 360,140 L 345,155" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <circle cx="340" cy="140" r="3.5" fill="${acc}" />
  </g>

  <!-- Handsaw Profile (Right) -->
  <g>
    <!-- Saw Blade With Serrated Teeth Down -->
    <polygon points="360,200 480,215 480,230 360,230" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <line x1="360" y1="230" x2="480" y2="230" stroke="${acc}" stroke-width="2.5" stroke-dasharray="3,2" />
    <!-- Wooden Grip Handle -->
    <path d="M 360,200 C 345,200 345,235 360,235 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="355" cy="217" r="2.5" fill="${acc}" />
  </g>

  <!-- Precision Vernier Caliper Laid Flat -->
  <line x1="270" y1="110" x2="430" y2="110" stroke="#52525B" stroke-width="2" stroke-dasharray="2,3" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'assembly_line',
			name: 'Assembly Line & Robotic Automation',
			title: 'AUTOMATED ASSEMBLY PIPELINE',
			tag: '[ LINI PERAKITAN // OTOMATISASI INDUSTRI ]',
			regex: /(lini perakitan|pabrik industri|ban berjalan|assembly line|manufaktur massal|robot pabrik)/i,
			nodes: ['01. PARTS FEEDER', '02. REPEATABLE CONVEYOR', '03. ROBOTIC PRECISION ARM', '04. HIGH-THROUGHPUT SCALE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes beltSlide { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    @keyframes armPivot { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-10deg); } }
    .anim-belt { stroke-dasharray: 6,6; animation: beltSlide 1.5s linear infinite; }
    .anim-robot-arm { animation: armPivot 3s ease-in-out infinite; transform-origin: 350px 105px; }
  </style>

  <!-- Industrial Floor Horizon -->
  <line x1="140" y1="275" x2="560" y2="275" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Conveyor Belt Table Assembly -->
  <rect x="180" y="215" width="340" height="25" rx="12" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  <line x1="190" y1="227" x2="510" y2="227" stroke="${acc}" stroke-width="2.5" class="anim-belt" />

  <!-- Rollers in Conveyor -->
  <circle cx="200" cy="227" r="7" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <circle cx="350" cy="227" r="7" fill="#18181b" stroke="#52525B" stroke-width="2" />
  <circle cx="500" cy="227" r="7" fill="#18181b" stroke="#52525B" stroke-width="2" />

  <!-- Manufactured Cubes on Belt -->
  <rect x="235" y="190" width="25" height="25" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <rect x="338" y="190" width="25" height="25" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <rect x="440" y="190" width="25" height="25" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />

  <!-- Articulated Overhead Robotic Welder Arm -->
  <g class="anim-robot-arm">
    <rect x="330" y="80" width="40" height="20" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="350" cy="100" r="5" fill="${acc}" />
    <line x1="350" y1="100" x2="350" y2="150" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    <circle cx="350" cy="150" r="5" fill="${acc}" />
    <line x1="350" y1="150" x2="350" y2="185" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <!-- Welding Spark Tip -->
    <circle cx="350" cy="188" r="3.5" fill="#FFFFFF" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'scientist_microscope',
			name: 'Laboratory Microscope & Empirical Inquiry',
			title: 'EMPIRICAL SCIENTIFIC INQUIRY',
			tag: '[ MIKROSKOP SAINS // ANALISIS EMPIRIS ]',
			regex: /(mikroskop|laboratorium|penelitian sains|ilmuwan|analisis empiris|peneliti|pengamatan mikroskopis)/i,
			nodes: ['01. RIGOROUS HYPOTHESIS', '02. 1000X OPTICAL MAGNIFICATION', '03. REPRODUCIBLE DATA', '04. SCIENTIFIC REVELATION'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes focusRack { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes lightCone { 0%, 100% { stroke-opacity: 0.4; } 50% { stroke-opacity: 0.9; } }
    .anim-optics { animation: focusRack 3s ease-in-out infinite; }
    .anim-substage-light { animation: lightCone 2s infinite ease-in-out; }
  </style>

  <!-- Lab Bench Counter Horizon -->
  <line x1="140" y1="270" x2="560" y2="270" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Microscope Base Horseshoe Foot -->
  <path d="M 280,270 L 420,270 C 420,250 390,245 350,245 C 310,245 280,250 280,270 Z" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />

  <!-- Specimen Stage Table -->
  <rect x="290" y="195" width="100" height="12" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <!-- Glass Slide on Stage -->
  <line x1="315" y1="195" x2="365" y2="195" stroke="${acc}" stroke-width="3" />

  <!-- Substage Light Mirror Illuminating Slide -->
  <line x1="340" y1="240" x2="340" y2="200" stroke="${acc}" stroke-width="2" stroke-dasharray="2,2" class="anim-substage-light" />
  <circle cx="340" cy="240" r="5" fill="${acc}" />

  <!-- Curved Structural Arm Frame Backbone -->
  <path d="M 390,250 C 440,240 440,140 375,130" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />

  <!-- Coarse / Fine Focus Knobs -->
  <circle cx="415" cy="180" r="9" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <circle cx="415" cy="180" r="3" fill="#FFFFFF" />

  <!-- Optical Tube Assembly (Eyepiece & Objectives) -->
  <g class="anim-optics">
    <!-- Eyepiece Inclined -->
    <line x1="320" y1="80" x2="350" y2="120" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <rect x="310" y="75" width="16" height="8" rx="2" fill="${acc}" transform="rotate(53 318 79)" />

    <!-- Revolving Nosepiece & Objective Lenses -->
    <rect x="330" y="125" width="35" height="40" rx="4" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="340" y1="165" x2="340" y2="190" stroke="${acc}" stroke-width="3" stroke-linecap="round" />
    <line x1="355" y1="165" x2="355" y2="185" stroke="#52525B" stroke-width="2.5" stroke-linecap="round" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'artist_easel',
			name: 'Artist Tripod Easel & Creative Vision',
			title: 'VISIONARY CANVAS',
			tag: '[ SENIMAN MELUKIS // KANVAS KREATIVITAS MURNI ]',
			regex: /(kanvas lukis|kuas dan kanvas|seniman melukis|easel lukisan|karya seni murni|kreativitas artistik)/i,
			nodes: ['01. BLANK VOID CANVAS', '02. VISUAL INTUITION', '03. PIGMENT LAYERING', '04. TRANSCENDENT MASTERPIECE'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes brushStroke { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
    .anim-brush { animation: brushStroke 2.5s ease-in-out infinite; transform-origin: 430px 180px; }
  </style>

  <!-- Studio Floor Line -->
  <line x1="140" y1="275" x2="560" y2="275" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Wooden Tripod Easel Legs -->
  <line x1="350" y1="85" x2="260" y2="275" stroke="#52525B" stroke-width="3" stroke-linecap="round" />
  <line x1="350" y1="85" x2="440" y2="275" stroke="#52525B" stroke-width="3" stroke-linecap="round" />
  <line x1="350" y1="85" x2="350" y2="275" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

  <!-- Canvas Shelf Rest -->
  <line x1="250" y1="235" x2="450" y2="235" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />

  <!-- Stretched Rectangular Canvas -->
  <rect x="270" y="115" width="160" height="120" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
  
  <!-- Artwork on Canvas (Minimalist Geometric Sun & Mountain) -->
  <polygon points="290,215 350,165 410,215" fill="none" stroke="${acc}" stroke-width="2.5" />
  <circle cx="350" cy="145" r="14" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="350" cy="145" r="4" fill="${acc}" />

  <!-- Artist Painter's Palette Beside Easel -->
  <ellipse cx="230" cy="230" rx="25" ry="18" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
  <circle cx="220" cy="225" r="3" fill="${acc}" />
  <circle cx="232" cy="220" r="3" fill="#FFFFFF" />
  <circle cx="242" cy="230" r="3" fill="${acc}" />

  <!-- Artist Fine Brush -->
  <g class="anim-brush">
    <line x1="450" y1="140" x2="410" y2="190" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <path d="M 410,190 L 400,200 L 405,190 Z" fill="${acc}" />
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'gavel_justice',
			name: 'Judge Gavel & Absolute Decision',
			title: 'DECISIVE JURISDICTION',
			tag: '[ PALU HAKIM // KETUKAN PUTUSAN MUTLAK ]',
			regex: /(palu hakim|gavel|putusan hukum|keadilan hukum|sidang pengadilan|keputusan mutlak|vonis)/i,
			nodes: ['01. IMPARTIAL DELIBERATION', '02. WEIGHING OF EVIDENCE', '03. THE GAVEL STRIKE', '04. IRREVOCABLE VERDICT'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes gavelStrike { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(-25deg); } 60% { transform: rotate(6deg); } }
    @keyframes shockRing { 0% { opacity: 0; r: 8; } 50% { opacity: 1; r: 24; } 100% { opacity: 0; r: 40; } }
    .anim-gavel-arm { animation: gavelStrike 2.5s infinite ease-in-out; transform-origin: 430px 130px; }
    .anim-verdict-shock { animation: shockRing 2.5s infinite ease-out; transform-origin: 320px 225px; }
  </style>

  <!-- Judge Bench Surface -->
  <line x1="140" y1="265" x2="560" y2="265" stroke="#3f3f46" stroke-width="1.8" stroke-dasharray="4,4" />

  <!-- Hardwood Sounding Block (Tatakan Palu) -->
  <polygon points="270,240 370,240 385,265 255,265" fill="#18181b" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
  <line x1="280" y1="240" x2="360" y2="240" stroke="${acc}" stroke-width="3" stroke-linecap="round" />

  <!-- Sounding Shockwaves From Impact -->
  <circle cx="320" cy="225" r="22" fill="none" stroke="${acc}" stroke-width="2" class="anim-verdict-shock" stroke-dasharray="4,4" />

  <!-- Heavy Wooden Gavel Striking Down -->
  <g class="anim-gavel-arm">
    <!-- Gavel Turned Handle -->
    <line x1="430" y1="130" x2="335" y2="210" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
    <!-- Gavel Double-Faced Head -->
    <rect x="305" y="200" width="30" height="22" rx="4" fill="#18181b" stroke="${acc}" stroke-width="3" transform="rotate(35 320 211)" />
  </g>

  <!-- Scales of Justice Silhouette in Background -->
  <path d="M 450,110 L 450,190 M 420,130 L 480,130" stroke="#52525B" stroke-width="2" stroke-linecap="round" />
  <path d="M 420,130 L 410,160 L 430,160 Z" fill="none" stroke="#52525B" stroke-width="1.8" />
  <path d="M 480,130 L 470,160 L 490,160 Z" fill="none" stroke="#52525B" stroke-width="1.8" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'compass_caliper',
			name: 'Precision Caliper & Micrometer Tolerance',
			title: 'MICROMETER PRECISION',
			tag: '[ JANGKA SORONG PRESISI // TOLERANSI TINGGI ]',
			regex: /(jangka ukur|caliper|pengukuran presisi|ketelitian kerja|toleransi mikron|penggaris presisi)/i,
			nodes: ['01. 0.01MM CALIBRATION', '02. JAW MEASUREMENT', '03. ZERO SLOP', '04. FLAWLESS COMPONENT MESH'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes jawMeasure { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(12px); } }
    .anim-caliper-slide { animation: jawMeasure 2.5s ease-in-out infinite; }
  </style>

  <!-- Caliper Main Beam Rule -->
  <rect x="180" y="150" width="340" height="22" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  
  <!-- Metric Tick Marks -->
  <g stroke="#52525B" stroke-width="1.5">
    <line x1="240" y1="150" x2="240" y2="160" />
    <line x1="260" y1="150" x2="260" y2="160" />
    <line x1="280" y1="150" x2="280" y2="165" stroke="#FFFFFF" />
    <line x1="300" y1="150" x2="300" y2="160" />
    <line x1="320" y1="150" x2="320" y2="160" />
    <line x1="340" y1="150" x2="340" y2="165" stroke="#FFFFFF" />
    <line x1="360" y1="150" x2="360" y2="160" />
    <line x1="380" y1="150" x2="380" y2="160" />
    <line x1="400" y1="150" x2="400" y2="165" stroke="#FFFFFF" />
  </g>

  <!-- Fixed Left Measurement Jaw -->
  <path d="M 200,150 L 200,230 L 212,230 L 212,172" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />

  <!-- Sliding Vernier Jaw Assembly (Right Jaw) -->
  <g class="anim-caliper-slide">
    <rect x="270" y="142" width="30" height="38" rx="3" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <path d="M 270,172 L 270,230 L 282,230 L 282,180" fill="#18181b" stroke="${acc}" stroke-width="2.5" stroke-linejoin="round" />
    <!-- Vernier Readout Screen -->
    <text x="285" y="162" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="#FFFFFF" text-anchor="middle">.02</text>
  </g>

  <!-- Measured Cylinder Being Calibrated -->
  <rect x="214" y="190" width="54" height="35" rx="3" fill="#18181b" stroke="#52525B" stroke-width="1.8" stroke-dasharray="2,2" />
  <line x1="241" y1="190" x2="241" y2="225" stroke="${acc}" stroke-width="1.5" />

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		},
		{
			id: 'conveyor_delivery',
			name: 'Supply Chain Fulfillment & Logistics Precision',
			title: 'SUPPLY CHAIN FULFILLMENT',
			tag: '[ EKSEKUSI PENGIRIMAN // RANTAI PASOK CEPAT ]',
			regex: /(pengiriman logistik|paket pesanan|kurir pengantaran|rantai pasok|fulfillment|distribusi barang|pengiriman barang)/i,
			nodes: ['01. ORDER CONFIRMATION', '02. AUTOMATED WAREHOUSING', '03. ROUTE OPTIMIZATION', '04. ON-TIME DELIVERY'],
			renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes trackMove { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
    @keyframes boxBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .anim-route-line { stroke-dasharray: 6,4; animation: trackMove 1.5s linear infinite; }
    .anim-parcel { animation: boxBob 2.5s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Route Track Arc -->
  <path d="M 160,240 C 240,160 460,160 540,240" fill="none" stroke="${acc}" stroke-width="2.5" class="anim-route-line" />

  <!-- Delivery Fulfillment Parcel Box in Center -->
  <g class="anim-parcel">
    <!-- Isometric Cube Box Shell -->
    <!-- Top Face -->
    <polygon points="350,120 400,145 350,170 300,145" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <line x1="350" y1="120" x2="350" y2="170" stroke="${acc}" stroke-width="2" />
    
    <!-- Left Face -->
    <polygon points="300,145 350,170 350,225 300,200" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    <line x1="300" y1="172" x2="350" y2="197" stroke="${acc}" stroke-width="2" />

    <!-- Right Face -->
    <polygon points="350,170 400,145 400,200 350,225" fill="#18181b" stroke="#FFFFFF" stroke-width="3" />
    
    <!-- Shipping Label / Barcode on Right Face -->
    <rect x="360" y="172" width="25" height="15" fill="#18181b" stroke="${acc}" stroke-width="1.8" />
    <line x1="365" y1="177" x2="380" y2="177" stroke="#FFFFFF" stroke-width="1.5" />
    <line x1="365" y1="182" x2="375" y2="182" stroke="#FFFFFF" stroke-width="1.5" />
  </g>

  <!-- Origin & Destination Nodes -->
  <circle cx="160" cy="240" r="10" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
  <circle cx="160" cy="240" r="4" fill="${acc}" />
  <text x="160" y="270" font-family="'JetBrains Mono', monospace" font-size="9" fill="#71717A" text-anchor="middle">ORIGIN</text>

  <circle cx="540" cy="240" r="10" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
  <polygon points="536,236 544,240 536,244" fill="${acc}" />
  <text x="540" y="270" font-family="'JetBrains Mono', monospace" font-size="9" fill="${acc}" text-anchor="middle">DELIVERED</text>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
		}
	]
};
