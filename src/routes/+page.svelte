<script>
	import { Play, Sparkles, Wand2, Zap, Film, ArrowRight, Share2, FileText, Stamp, Smartphone } from 'lucide-svelte';
</script>

<div class="landing-page">
	<!-- Hero Section -->
	<header class="hero">
		<nav class="container">
			<div class="logo">
				<Zap size={24} color="var(--primary)" fill="var(--primary)" />
				<span>AI Video Studio</span>
			</div>
			<div class="nav-links">
				<a href="/studio" class="github-link">
					<Share2 size={18} />
					<span>Open Studio</span>
				</a>
			</div>
		</nav>

		<div class="hero-content container">
			<div class="hero-text">
				<div class="badge">
					<Sparkles size={14} />
					<span>5 In 1 Video Engine</span>
				</div>
				<h1>Produksi Video YouTube <span class="gradient-text">Dalam Hitungan Menit</span></h1>
				<p>Ubah naskah menjadi video YouTube Long (16:9) atau Shorts (9:16) viral: footage sinematik, animasi stickman, kolase dokumenter Vox, motion typography ala Dan Koe, atau <strong>Shorts dari Giphy Clips</strong>.</p>
				
				<div class="hero-actions">
					<a href="/studio" class="btn btn-primary btn-lg">
						<Wand2 size={20} />
						<span>Cinematic Studio</span>
					</a>
					<a href="/stickman-studio" class="btn btn-accent btn-lg">
						<Film size={20} />
						<span>Stickman Studio</span>
					</a>
					<a href="/docu-studio" class="btn btn-docu btn-lg">
						<FileText size={20} />
						<span>Docu-Style Studio</span>
					</a>
					<a href="/typography-studio" class="btn btn-typo btn-lg">
						<Zap size={20} />
						<span>Dan Koe Typography</span>
					</a>
					<a href="/video-editor" class="btn btn-editor btn-lg">
						<Film size={20} />
						<span>Video Editor (Image to Video)</span>
					</a>
					<a href="/shorts-studio" class="btn btn-shorts btn-lg">
						<Smartphone size={20} />
						<span>✨ Shorts Generator (Giphy)</span>
					</a>
				</div>
			</div>
			<div class="hero-visual">
				<div class="preview-card glass-panel">
					<div class="preview-header">
						<div class="dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
						<div class="url-bar">ai-studio.sh/editor</div>
					</div>
					<div class="preview-img">
						<div class="play-overlay">
							<div class="play-btn"><Play size={32} fill="white" /></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Features Section -->
	<section id="features" class="features container">
		<div class="section-header">
			<h2>Semua yang Anda Butuhkan <span class="gradient-text">Jadi Satu</span></h2>
			<p>Gak perlu lagi pindah-pindah tab. AI Studio menghandle seluruh alur produksi video Anda.</p>
		</div>

		<div class="features-grid">
			<div class="feature-card glass-panel">
				<div class="feature-icon"><Wand2 size={24} /></div>
				<h3>Script Analyzer</h3>
				<p>AI menganalisis naskah Anda, membaginya menjadi adegan sinematik, dan menyarankan visual yang tepat.</p>
			</div>
			<div class="feature-card glass-panel">
				<div class="feature-icon"><Film size={24} /></div>
				<h3>Cinematic Video AI</h3>
				<p>Integrasi Pexels & bank footage lokal untuk menyajikan visual 4K yang sinkron dengan narasi Anda.</p>
			</div>
			<div class="feature-card glass-panel">
				<div class="feature-icon"><Zap size={24} /></div>
				<h3>Neural Voiceover</h3>
				<p>Suara AI alami dari Microsoft Edge TTS & ElevenLabs yang memberikan emosi pada setiap kata.</p>
			</div>
			<div class="feature-card glass-panel">
				<div class="feature-icon"><Sparkles size={24} /></div>
				<h3>Animated Subtitles</h3>
				<p>Subtitle bergaya "Viral Pop" atau "Cinematic" yang otomatis sinkron dengan jeda nafas narator.</p>
			</div>
			<div class="feature-card glass-panel">
				<div class="feature-icon"><FileText size={24} /></div>
				<h3>Docu-Style & Vox Collage</h3>
				<p>Estetika dokumenter investigatif dengan tekstur kertas, polaroid, selotip, stempel classified, dan tipografi arsip.</p>
			</div>
			<div class="feature-card glass-panel">
				<div class="feature-icon"><Zap size={24} /></div>
				<h3>Motion Typography (Dan Koe)</h3>
				<p>Tipografi kinetik filosofis dengan latar charcoal/matte black, accent glowing keywords, dan diagram mental model.</p>
			</div>
			<div class="feature-card glass-panel">
				<div class="feature-icon"><Film size={24} /></div>
				<h3>Image to Video Timeline Editor</h3>
				<p>Gabungkan kumpulan foto/gambar menjadi video utuh. Auto-import berurutan nomor, atur durasi per gambar dengan drag timeline, dan sinkronkan audio musik latar.</p>
			</div>
			<div class="feature-card glass-panel feature-card-shorts">
				<div class="feature-icon feature-icon-shorts"><Smartphone size={24} /></div>
				<h3>✨ Shorts Generator (Giphy Clips)</h3>
				<p>Buat YouTube Shorts/Reels viral 30–40 detik: pilih tema (Dark Psychology, Fakta Unik, Stoikisme), AI generate naskah per adegan + query Giphy otomatis, blurred backdrop 9:16, neural voiceover, subtitle bergaya TikTok viral pop.</p>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer container">
		<div class="footer-top">
			<div class="logo">
				<Zap size={20} color="var(--primary)" fill="var(--primary)" />
				<span>AI Video Studio</span>
			</div>
			<div class="footer-links">
				<a href="/studio">Mulai Buat</a>
				<a href="https://github.com/anomalyco/opencode">Feedback</a>
				<a href="/studio">API Settings</a>
			</div>
		</div>
		<div class="footer-bottom">
			<p>&copy; 2026 AI Video Generator Studio. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	.landing-page {
		color: var(--text);
		overflow-x: hidden;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	/* Hero */
	.hero {
		padding: 40px 0 100px;
		background: radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
		            radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 40%);
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 80px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 12px;
		font-weight: 800;
		font-size: 1.25rem;
		letter-spacing: -0.02em;
	}

	.github-link {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-2);
		font-size: 0.9rem;
		font-weight: 500;
		transition: color 0.2s;
	}

	.github-link:hover { color: var(--text); }

	.hero-content {
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 60px;
		align-items: center;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: rgba(99, 102, 241, 0.1);
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: var(--r-full);
		font-size: 0.8rem;
		font-weight: 600;
		color: #a5b4fc;
		margin-bottom: 24px;
	}

	h1 {
		font-size: clamp(2.5rem, 5vw, 3.75rem);
		line-height: 1.1;
		font-weight: 800;
		margin-bottom: 24px;
		letter-spacing: -0.04em;
	}

	.gradient-text {
		background: linear-gradient(to right, var(--primary), var(--accent-cyan));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-text p {
		font-size: 1.15rem;
		color: var(--text-2);
		line-height: 1.6;
		margin-bottom: 40px;
		max-width: 540px;
	}

	.hero-actions {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}

	.btn-docu {
		background: #991b1b;
		color: #ffffff;
		border: 1px solid #ef4444;
	}
	.btn-docu:hover {
		background: #dc2626;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
	}

	.btn-typo {
		background: #111116;
		color: #f59e0b;
		border: 1px solid rgba(245, 158, 11, 0.4);
	}
	.btn-typo:hover {
		background: #1b1b22;
		border-color: #f59e0b;
		color: #fbbf24;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
	}

	.btn-editor {
		background: #0f172a;
		color: #38bdf8;
		border: 1px solid rgba(56, 189, 248, 0.4);
	}
	.btn-editor:hover {
		background: #1e293b;
		border-color: #38bdf8;
		color: #7dd3fc;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(56, 189, 248, 0.25);
	}

	.btn-shorts {
		background: linear-gradient(135deg, #2d1b69, #4c1d95);
		color: #c4b5fd;
		border: 1px solid rgba(167, 139, 250, 0.5);
		position: relative;
		overflow: hidden;
	}
	.btn-shorts::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.15), transparent);
		transform: translateX(-100%);
		transition: transform 0.5s;
	}
	.btn-shorts:hover::before { transform: translateX(100%); }
	.btn-shorts:hover {
		background: linear-gradient(135deg, #3d2b79, #5b21b6);
		border-color: #a78bfa;
		color: #e9d5ff;
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(167, 139, 250, 0.4);
	}

	.feature-card-shorts {
		background: linear-gradient(135deg, rgba(167, 139, 250, 0.06), rgba(236, 72, 153, 0.04));
		border-color: rgba(167, 139, 250, 0.2) !important;
	}
	.feature-icon-shorts {
		color: #a78bfa !important;
		background: rgba(167, 139, 250, 0.1) !important;
	}

	.hero-visual {
		position: relative;
	}

	.preview-card {
		border-radius: var(--r-lg);
		overflow: hidden;
		transform: perspective(1000px) rotateY(-10deg) rotateX(5deg);
		box-shadow: 0 40px 80px rgba(0,0,0,0.4);
	}

	.preview-header {
		padding: 12px;
		background: #1e293b;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.dots { display: flex; gap: 6px; }
	.dot { width: 8px; height: 8px; border-radius: 50%; }
	.dot.red { background: #ef4444; }
	.dot.yellow { background: #f59e0b; }
	.dot.green { background: #10b981; }

	.url-bar {
		background: #0f172a;
		padding: 4px 12px;
		border-radius: 4px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-3);
		flex: 1;
	}

	.preview-img {
		aspect-ratio: 16/9;
		background: linear-gradient(45deg, #1e293b, #0f172a);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.play-overlay {
		width: 80px;
		height: 80px;
		background: var(--primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 30px var(--primary);
	}

	/* Features */
	.features {
		padding: 100px 0;
	}

	.section-header {
		text-align: center;
		margin-bottom: 60px;
	}

	.section-header h2 {
		font-size: 2.25rem;
		font-weight: 800;
		margin-bottom: 16px;
	}

	.section-header p {
		color: var(--text-2);
		max-width: 600px;
		margin: 0 auto;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 24px;
	}

	.feature-card {
		padding: 32px;
		border-radius: var(--r-xl);
		transition: transform 0.3s;
	}

	.feature-card:hover {
		transform: translateY(-10px);
	}

	.feature-icon {
		width: 48px;
		height: 48px;
		background: rgba(99, 102, 241, 0.1);
		color: var(--primary);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24px;
	}

	.feature-card h3 {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 12px;
	}

	.feature-card p {
		color: var(--text-2);
		font-size: 0.95rem;
		line-height: 1.6;
	}

	/* Footer */
	.footer {
		padding: 80px 0 40px;
		border-top: 1px solid var(--line);
	}

	.footer-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40px;
	}

	.footer-links {
		display: flex;
		gap: 32px;
	}

	.footer-links a {
		color: var(--text-2);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.footer-links a:hover { color: var(--text); }

	.footer-bottom {
		text-align: center;
		color: var(--text-3);
		font-size: 0.85rem;
	}

	@media (max-width: 900px) {
		.hero-content { grid-template-columns: 1fr; text-align: center; gap: 40px; }
		.hero-text p { margin: 0 auto 40px; }
		.hero-actions { justify-content: center; }
		.hero-visual { transform: none; max-width: 600px; margin: 0 auto; }
		.preview-card { transform: none; }
		.footer-top { flex-direction: column; gap: 30px; }
	}
</style>
