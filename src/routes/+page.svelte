<script>
	import { Wand2, Film, FileText, Zap, Smartphone, Video, ArrowUpRight, Layers, Sparkles } from 'lucide-svelte';

	const tools = [
		{
			id: 'script_director',
			href: '/script-director',
			label: 'Script Director',
			tag: '7–10m ✦ Baru',
			tagColor: 'violet',
			description: 'Diskusi ide topik bersama AI Director → naskah bersambung 80–100 scene + prompt visual 2D konsisten.',
			icon: Sparkles,
			accent: '#8b5cf6',
			bg: 'rgba(139,92,246,0.08)',
			border: 'rgba(139,92,246,0.22)',
			featured: true,
		},
		{
			id: 'cinematic',
			href: '/studio',
			label: 'Cinematic Studio',
			tag: '16:9',
			tagColor: 'indigo',
			description: 'Naskah → footage sinematik Pexels + voiceover neural. Subtitle bergaya viral pop.',
			icon: Wand2,
			accent: '#6366f1',
			bg: 'rgba(99,102,241,0.06)',
			border: 'rgba(99,102,241,0.15)',
		},
		{
			id: 'stickman',
			href: '/stickman-studio',
			label: 'Stickman Studio',
			tag: '16:9',
			tagColor: 'amber',
			description: 'Animasi stickman 2D yang bergerak mengikuti narasi. Efek ledakan & komedi.',
			icon: Film,
			accent: '#f59e0b',
			bg: 'rgba(245,158,11,0.06)',
			border: 'rgba(245,158,11,0.15)',
		},
		{
			id: 'docu',
			href: '/docu-studio',
			label: 'Docu-Style Studio',
			tag: '16:9',
			tagColor: 'red',
			description: 'Estetika dokumenter investigatif — polaroid, cap "CLASSIFIED", paper texture, kolase Vox.',
			icon: FileText,
			accent: '#ef4444',
			bg: 'rgba(239,68,68,0.06)',
			border: 'rgba(239,68,68,0.15)',
		},
		{
			id: 'typography',
			href: '/typography-studio',
			label: 'Dan Koe Typography',
			tag: '16:9',
			tagColor: 'yellow',
			description: 'Tipografi kinetik filosofis — charcoal bg, glowing keywords, diagram mental model.',
			icon: Zap,
			accent: '#eab308',
			bg: 'rgba(234,179,8,0.06)',
			border: 'rgba(234,179,8,0.15)',
		},
		{
			id: 'editor',
			href: '/video-editor',
			label: 'Image → Video',
			tag: 'Editor',
			tagColor: 'sky',
			description: 'Gabungkan foto/gambar jadi video. Timeline drag & drop, atur durasi, sinkron musik.',
			icon: Video,
			accent: '#38bdf8',
			bg: 'rgba(56,189,248,0.06)',
			border: 'rgba(56,189,248,0.15)',
		},
		{
			id: 'shorts',
			href: '/shorts-studio',
			label: 'Shorts Generator',
			tag: '9:16 ✦ Baru',
			tagColor: 'violet',
			description: 'AI buat naskah → klip Giphy → voiceover ElevenLabs → subtitle viral. 30–40 detik.',
			icon: Smartphone,
			accent: '#a78bfa',
			bg: 'rgba(167,139,250,0.07)',
			border: 'rgba(167,139,250,0.2)',
			featured: true,
		},
	];

	const tagStyles = {
		indigo: { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc' },
		amber:  { bg: 'rgba(245,158,11,0.15)',  color: '#fcd34d' },
		red:    { bg: 'rgba(239,68,68,0.15)',   color: '#fca5a5' },
		yellow: { bg: 'rgba(234,179,8,0.15)',   color: '#fde047' },
		sky:    { bg: 'rgba(56,189,248,0.15)',  color: '#7dd3fc' },
		violet: { bg: 'rgba(167,139,250,0.18)', color: '#c4b5fd' },
	};
</script>

<svelte:head>
	<title>AI Video Studio — 6 Mode Produksi Video YouTube</title>
	<meta name="description" content="Buat video YouTube Long (16:9) atau Shorts (9:16): Cinematic, Stickman, Documentary, Typography, Image-to-Video, dan Giphy Shorts." />
</svelte:head>

<div class="page">
	<!-- Nav -->
	<nav>
		<div class="logo">
			<div class="logo-icon">
				<Layers size={16} />
			</div>
			<span>AI Video Studio</span>
		</div>
		<div class="nav-right">
			<a href="/shorts-studio" class="nav-pill featured-pill">
				<Smartphone size={13} />
				Shorts Generator
			</a>
			<a href="/studio" class="nav-pill">
				Buka Studio
				<ArrowUpRight size={13} />
			</a>
		</div>
	</nav>

	<!-- Hero -->
	<header class="hero">
		<div class="hero-label">
			<span class="dot-pulse"></span>
			<span>6 studio mode &middot; AI-powered &middot; Runs local</span>
		</div>
		<h1>
			Produksi Video YouTube<br>
			<span class="hl">dari Naskah ke Render</span>
		</h1>
		<p class="hero-sub">
			Satu platform, enam mode produksi. Pilih style, masukkan topik,<br class="br-desk">
			dan AI handle semuanya — naskah, footage, voiceover, subtitle, render.
		</p>

		<div class="mode-pills">
			{#each tools as t}
				<a href={t.href} class="mode-pill" class:featured-mode={t.featured} style="--c: {t.accent}">
					{t.label}
				</a>
			{/each}
		</div>
	</header>

	<!-- Tool Grid -->
	<main class="tools-section">
		<div class="section-meta">
			<h2>Pilih Studio</h2>
			<span class="count">{tools.length} tools</span>
		</div>

		<div class="tools-grid">
			{#each tools as tool}
				{@const ts = tagStyles[tool.tagColor]}
				<a
					href={tool.href}
					class="tool-card"
					class:featured-card={tool.featured}
					style="--accent: {tool.accent}; --bg: {tool.bg}; --border: {tool.border};"
				>
					<div class="card-top">
						<div class="card-icon">
							<svelte:component this={tool.icon} size={18} />
						</div>
						<span class="card-tag" style="background: {ts.bg}; color: {ts.color};">{tool.tag}</span>
					</div>
					<div class="card-body">
						<h3>{tool.label}</h3>
						<p>{tool.description}</p>
					</div>
					<div class="card-footer">
						<span class="open-link">
							Buka <ArrowUpRight size={13} />
						</span>
					</div>
					{#if tool.featured}
						<div class="featured-glow"></div>
					{/if}
				</a>
			{/each}
		</div>
	</main>

	<!-- Footer -->
	<footer>
		<div class="footer-inner">
			<div class="footer-left">
				<div class="logo small">
					<div class="logo-icon small-icon">
						<Layers size={12} />
					</div>
					<span>AI Video Studio</span>
				</div>
				<span class="footer-sep">&middot;</span>
				<span class="footer-note">Made for creators. Runs local.</span>
			</div>
			<div class="footer-right">
				<a href="/studio">Cinematic</a>
				<a href="/shorts-studio">Shorts</a>
				<a href="/docu-studio">Docu</a>
				<a href="/typography-studio">Typography</a>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		background: #09090f;
	}

	.page {
		min-height: 100vh;
		background: #09090f;
		color: #e8e8f0;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		display: flex;
		flex-direction: column;
	}

	/* ─── Nav ─── */
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 40px;
		border-bottom: 1px solid rgba(255,255,255,0.05);
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(9,9,15,0.88);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 700;
		font-size: 0.95rem;
		letter-spacing: -0.02em;
		color: #e8e8f0;
		text-decoration: none;
	}

	.logo-icon {
		width: 28px;
		height: 28px;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		border-radius: 7px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.nav-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 7px 14px;
		border-radius: 99px;
		font-size: 0.8rem;
		font-weight: 600;
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.08);
		color: rgba(232,232,240,0.65);
		text-decoration: none;
		transition: all 0.18s;
	}

	.nav-pill:hover {
		background: rgba(255,255,255,0.09);
		color: #e8e8f0;
		border-color: rgba(255,255,255,0.13);
	}

	.featured-pill {
		background: rgba(167,139,250,0.11);
		border-color: rgba(167,139,250,0.22);
		color: #c4b5fd;
	}
	.featured-pill:hover {
		background: rgba(167,139,250,0.18);
		color: #e9d5ff;
	}

	/* ─── Hero ─── */
	.hero {
		padding: 88px 40px 72px;
		max-width: 880px;
		margin: 0 auto;
		text-align: center;
		width: 100%;
		box-sizing: border-box;
	}

	.hero-label {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.72rem;
		font-weight: 500;
		color: rgba(232,232,240,0.35);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-bottom: 28px;
	}

	.dot-pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #a78bfa;
		flex-shrink: 0;
		animation: pulse 2.2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50%       { opacity: 0.3; transform: scale(0.65); }
	}

	h1 {
		font-size: clamp(2.2rem, 5.5vw, 3.75rem);
		font-weight: 800;
		line-height: 1.07;
		letter-spacing: -0.045em;
		margin-bottom: 22px;
		color: #f0f0f8;
	}

	.hl {
		background: linear-gradient(95deg, #818cf8 0%, #a78bfa 45%, #c084fc 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-sub {
		font-size: 1rem;
		line-height: 1.7;
		color: rgba(232,232,240,0.42);
		max-width: 560px;
		margin: 0 auto 40px;
	}

	.br-desk { display: none; }
	@media (min-width: 700px) { .br-desk { display: inline; } }

	.mode-pills {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 7px;
	}

	.mode-pill {
		display: inline-flex;
		align-items: center;
		padding: 6px 13px;
		border-radius: 99px;
		font-size: 0.78rem;
		font-weight: 600;
		background: rgba(255,255,255,0.04);
		border: 1px solid rgba(255,255,255,0.07);
		color: rgba(232,232,240,0.5);
		text-decoration: none;
		transition: all 0.18s;
		letter-spacing: -0.01em;
	}

	.mode-pill:hover {
		border-color: color-mix(in srgb, var(--c) 30%, transparent);
		color: var(--c);
		background: color-mix(in srgb, var(--c) 8%, transparent);
	}

	.featured-mode {
		background: rgba(167,139,250,0.09);
		border-color: rgba(167,139,250,0.22);
		color: #c4b5fd;
	}
	.featured-mode:hover {
		background: rgba(167,139,250,0.16);
		color: #e9d5ff;
	}

	/* ─── Tools section ─── */
	.tools-section {
		flex: 1;
		padding: 0 40px 80px;
		max-width: 1100px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	.section-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.section-meta h2 {
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: rgba(232,232,240,0.55);
	}

	.count {
		font-size: 0.72rem;
		font-weight: 600;
		padding: 2px 8px;
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.07);
		border-radius: 99px;
		color: rgba(232,232,240,0.3);
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	/* ─── Tool card ─── */
	.tool-card {
		display: flex;
		flex-direction: column;
		padding: 22px;
		border-radius: 14px;
		background: var(--bg);
		border: 1px solid var(--border);
		text-decoration: none;
		color: inherit;
		position: relative;
		overflow: hidden;
		transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
		min-height: 195px;
	}

	.tool-card:hover {
		border-color: color-mix(in srgb, var(--accent) 40%, transparent);
		transform: translateY(-3px);
		box-shadow: 0 14px 44px rgba(0,0,0,0.3);
	}

	.featured-glow {
		position: absolute;
		top: -40px;
		right: -40px;
		width: 140px;
		height: 140px;
		background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%);
		pointer-events: none;
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16px;
	}

	.card-icon {
		width: 34px;
		height: 34px;
		background: color-mix(in srgb, var(--accent) 13%, transparent);
		color: var(--accent);
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-tag {
		font-size: 0.68rem;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: 99px;
		letter-spacing: 0.01em;
		white-space: nowrap;
	}

	.card-body { flex: 1; }

	.card-body h3 {
		font-size: 0.97rem;
		font-weight: 700;
		letter-spacing: -0.025em;
		margin-bottom: 7px;
		color: #f0f0f8;
	}

	.card-body p {
		font-size: 0.8rem;
		line-height: 1.55;
		color: rgba(232,232,240,0.4);
	}

	.card-footer {
		margin-top: 18px;
		padding-top: 14px;
		border-top: 1px solid rgba(255,255,255,0.05);
	}

	.open-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--accent);
		opacity: 0.55;
		transition: opacity 0.18s;
	}

	.tool-card:hover .open-link { opacity: 1; }

	/* ─── Footer ─── */
	footer {
		border-top: 1px solid rgba(255,255,255,0.05);
		padding: 18px 40px;
	}

	.footer-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.footer-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.logo.small { font-size: 0.82rem; }
	.small-icon { width: 22px; height: 22px; }

	.footer-sep { color: rgba(232,232,240,0.18); }

	.footer-note {
		font-size: 0.76rem;
		color: rgba(232,232,240,0.22);
	}

	.footer-right {
		display: flex;
		gap: 20px;
	}

	.footer-right a {
		font-size: 0.78rem;
		color: rgba(232,232,240,0.28);
		text-decoration: none;
		transition: color 0.18s;
	}

	.footer-right a:hover { color: rgba(232,232,240,0.65); }

	/* ─── Responsive ─── */
	@media (max-width: 900px) {
		nav { padding: 16px 20px; }
		.hero { padding: 64px 20px 52px; }
		.tools-section { padding: 0 20px 60px; }
		footer { padding: 16px 20px; }
		.tools-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (max-width: 560px) {
		nav { padding: 14px 16px; }
		.nav-pill span { display: none; }
		.hero { padding: 48px 16px 40px; }
		h1 { font-size: 2rem; letter-spacing: -0.035em; }
		.hero-sub { font-size: 0.9rem; }
		.tools-section { padding: 0 16px 48px; }
		.tools-grid { grid-template-columns: 1fr; gap: 8px; }
		footer { padding: 14px 16px; }
		.footer-inner { flex-direction: column; gap: 10px; text-align: center; }
		.footer-left { flex-direction: column; gap: 4px; }
	}
</style>
