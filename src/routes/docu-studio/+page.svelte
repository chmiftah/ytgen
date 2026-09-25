<script>
	import { onMount, tick } from 'svelte';
	import {
		ArrowLeft,
		Play,
		Pause,
		RotateCcw,
		Volume2,
		VolumeX,
		Sparkles,
		Download,
		Image as ImageIcon,
		Type,
		Music,
		Settings,
		CheckCircle2,
		Layers,
		FileText,
		Stamp,
		Copy,
		Clock,
		ExternalLink
	} from 'lucide-svelte';

	// BGM Tracks
	const BGM_TRACKS = [
		{ id: 'tension', title: 'Tension & Investigation (Misteri/Fakta)', url: '/bgm/bgm-tension.mp3' },
		{ id: 'ambient', title: 'Deep Ambient (Tenang & Fokus)', url: '/bgm/bgm-ambient.mp3' },
		{ id: 'soundhelix', title: 'Documentary Flow (Modern)', url: '/bgm/bgm-soundhelix-1.mp3' },
		{ id: 'none', title: 'Tanpa Musik Latar (Hanya Narasi)', url: null }
	];

	// Background Themes
	const DOCU_THEMES = [
		{ id: 'vintage-desk', name: 'Meja Arsip Mahoni', bgUrl: '/docu/backgrounds/vintage-desk.png', dark: true },
		{ id: 'kraft-paper', name: 'Kertas Kraft Klasik', bgUrl: '/docu/backgrounds/kraft-paper.png', dark: false },
		{ id: 'dark-slate', name: 'Dark Slate Vox', bgUrl: '/docu/backgrounds/dark-slate.png', dark: true },
		{ id: 'blueprint-grid', name: 'Blueprint Investigasi', bgUrl: '/docu/backgrounds/blueprint-grid.png', dark: true }
	];

	// Stamp Options
	const STAMP_OPTIONS = [
		{ id: 'classified', name: 'CLASSIFIED', icon: '🔴', file: '/docu/elements/stamp-classified.png' },
		{ id: 'top-secret', name: 'TOP SECRET', icon: '🛑', file: '/docu/elements/stamp-top-secret.png' },
		{ id: 'evidence', name: 'EVIDENCE', icon: '📦', file: '/docu/elements/stamp-evidence.png' },
		{ id: 'confidential', name: 'CONFIDENTIAL', icon: '🔒', file: '/docu/elements/stamp-confidential.png' },
		{ id: 'verified', name: 'VERIFIED', icon: '🟢', file: '/docu/elements/stamp-verified.png' },
		{ id: 'none', name: 'Tanpa Stempel', icon: '⚪', file: null }
	];

	// Pin / Fastener Options
	const PIN_OPTIONS = [
		{ id: 'tape', name: 'Selotip Bening', file: '/docu/elements/tape-strip.png' },
		{ id: 'pushpin', name: 'Jarum Pin Merah', file: '/docu/elements/pushpin.png' },
		{ id: 'paperclip', name: 'Klip Kertas Logam', file: '/docu/elements/paperclip.png' },
		{ id: 'none', name: 'Tanpa Peniti', file: null }
	];

	// Voices (Edge TTS)
	const VOICES = [
		{ id: 'id-ID-ArdiNeural', name: 'Ardi (Pria - Indonesia Mantap)', lang: 'id-ID' },
		{ id: 'id-ID-GadisNeural', name: 'Gadis (Wanita - Indonesia Hangat)', lang: 'id-ID' },
		{ id: 'en-US-ChristopherNeural', name: 'Christopher (Pria - English Docu)', lang: 'en-US' },
		{ id: 'en-US-JennyNeural', name: 'Jenny (Wanita - English Clear)', lang: 'en-US' }
	];

	// Fonts
	const FONTS = [
		{ id: 'Outfit', name: 'Outfit (Modern Vox Style)' },
		{ id: 'Inter', name: 'Inter (Clean Editorial)' },
		{ id: 'Montserrat', name: 'Montserrat (Bold Headline)' },
		{ id: 'Cabin Sketch', name: 'Cabin Sketch (Raw Notes)' }
	];

	// State
	let script = $state(`Pernahkah kamu bertanya-tanya, bagaimana sebuah perusahaan bernilai miliaran dolar bisa runtuh dalam semalam?
Di balik laporan keuangan yang berkilau, sering kali tersimpan kebohongan sistematis yang ditutupi begitu rapat.
Hari ini, kita membongkar dokumen arsip rahasia yang tidak pernah dipublikasikan ke publik.
Fakta-fakta ini membuktikan bahwa apa yang kita lihat di berita hanyalah puncak gunung es.`);

	let videoTitle = $state('Dokumen Rahasia: Rahasia di Balik Kehancuran');
	let scenes = $state([]);
	let currentSceneIndex = $state(0);
	let isPlaying = $state(false);
	let isGeneratingScript = $state(false);
	let isRendering = $state(false);
	let renderProgress = $state(0);
	let renderStep = $state('');
	let renderError = $state(null);
	let downloadUrl = $state(null);
	let downloadFilename = $state('');
	let showCopyAlert = $state(false);

	// Visual & Audio Controls
	let selectedTheme = $state('vintage-desk');
	let selectedDefaultStamp = $state('classified');
	let selectedVoice = $state('id-ID-ArdiNeural');
	let selectedBgmId = $state('tension');
	let bgmVolume = $state(0.12);
	let selectedFont = $state('Outfit');
	let fontSize = $state(52);
	let textColor = $state('#FFFFFF');
	let highlightColor = $state('#FACC15');
	let renderQuality = $state('1080p');

	// Local Footage Catalog Cache
	let catalogItems = $state([]);

	// Audio Players
	let playerA = null;
	let playerB = null;
	let activePlayer = 'A';
	let bgmPlayer = null;

	onMount(async () => {
		playerA = new Audio();
		playerB = new Audio();
		bgmPlayer = new Audio();
		bgmPlayer.loop = true;

		// Load catalog for quick media pickers
		try {
			const res = await fetch('/footage/catalog.json');
			if (res.ok) {
				catalogItems = await res.json();
			}
		} catch {}

		// Initialize default scenes from script
		splitScriptToDocuScenes();
	});

	function splitScriptToDocuScenes() {
		const rawLines = script
			.split(/\n+/)
			.map(l => l.trim())
			.filter(Boolean);

		const newScenes = rawLines.map((line, idx) => {
			const wordCount = line.split(/\s+/).length;
			const estDur = Math.max(3, Number((wordCount * 0.44).toFixed(1)));
			const tags = ['BUKTI ARSIP', 'TEMUAN KUNCI', 'KRONOLOGI', 'FAKTA TERTUTUP', 'DOKUMEN RAHASIA'];
			const stampTypes = ['classified', 'evidence', 'top-secret', 'confidential', 'verified'];

			// Pick image from catalog if available
			let sampleImg = '';
			if (catalogItems.length > 0) {
				const cat = catalogItems[idx % catalogItems.length];
				sampleImg = cat.thumbnail || cat.videoUrl || '';
			}

			return {
				id: `scene-${idx}-${Date.now()}`,
				narration: line,
				headerTag: `${tags[idx % tags.length]} #${String(idx + 1).padStart(2, '0')}`,
				image: sampleImg,
				layoutSide: idx % 2 === 0 ? 'right' : 'left',
				stamp: stampTypes[idx % stampTypes.length],
				pin: idx % 2 === 0 ? 'tape' : 'pushpin',
				audioDuration: estDur,
				voiceAudioUrl: null
			};
		});

		scenes = newScenes;
		currentSceneIndex = 0;
		// Automatically generate voiceovers in background
		generateAllVoices().catch(() => {});
	}

	let isGeneratingVoice = $state(false);

	async function generateVoiceForScene(idx) {
		const sc = scenes[idx];
		if (!sc || !sc.narration) return;
		try {
			const res = await fetch('/api/edge-tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: sc.narration,
					voiceId: selectedVoice,
					rate: '+0%',
					pitch: '+0Hz',
					audioEffect: 'studio_podcast'
				})
			});
			if (!res.ok) throw new Error('Voiceover generation failed');
			const data = await res.json();
			if (data.staticAudioUrl || data.audioUrl) {
				sc.voiceAudioUrl = data.staticAudioUrl || data.audioUrl;
				if (data.duration) sc.audioDuration = Number(data.duration.toFixed(2));
				scenes = [...scenes];
			}
		} catch (e) {
			console.error(e);
		}
	}

	async function generateAllVoices() {
		if (isGeneratingVoice) return;
		isGeneratingVoice = true;
		for (let i = 0; i < scenes.length; i++) {
			if (!scenes[i].voiceAudioUrl) {
				await generateVoiceForScene(i);
			}
		}
		isGeneratingVoice = false;
	}

	// Playback Engine
	function togglePlay() {
		if (isPlaying) {
			pausePreview();
		} else {
			playPreview();
		}
	}

	function pausePreview() {
		isPlaying = false;
		playerA?.pause();
		playerB?.pause();
		bgmPlayer?.pause();
	}

	async function playPreview() {
		if (!scenes.length) return;
		isPlaying = true;

		// Start BGM
		const track = BGM_TRACKS.find(t => t.id === selectedBgmId);
		if (track && track.url && bgmPlayer) {
			bgmPlayer.src = track.url;
			bgmPlayer.volume = Math.min(0.4, Math.max(0.08, bgmVolume));
			bgmPlayer.play().catch(() => {});
		}

		await playScene(currentSceneIndex);
	}

	async function playScene(idx) {
		if (!isPlaying || idx >= scenes.length) {
			isPlaying = false;
			bgmPlayer?.pause();
			return;
		}

		currentSceneIndex = idx;
		const sc = scenes[idx];
		const currPlayer = activePlayer === 'A' ? playerA : playerB;

		// Auto-generate voice if not ready yet
		if (!sc.voiceAudioUrl) {
			await generateVoiceForScene(idx);
		}

		// Preload next scene in background
		if (scenes[idx + 1] && !scenes[idx + 1].voiceAudioUrl) {
			generateVoiceForScene(idx + 1).catch(() => {});
		}

		if (sc.voiceAudioUrl) {
			currPlayer.src = sc.voiceAudioUrl;
			currPlayer.volume = 1.0;
			currPlayer.onended = () => {
				setTimeout(() => {
					if (isPlaying) {
						activePlayer = activePlayer === 'A' ? 'B' : 'A';
						playScene(idx + 1);
					}
				}, 200); // 0.20s natural pause
			};
			currPlayer.play().catch((err) => {
				console.warn('Audio play error, moving to next:', err);
				setTimeout(() => { if (isPlaying) playScene(idx + 1); }, (sc.audioDuration || 4) * 1000);
			});
		} else {
			// Mock timer if no voice generated yet
			const durMs = (sc.audioDuration || 4) * 1000;
			setTimeout(() => {
				if (isPlaying) playScene(idx + 1);
			}, durMs + 200);
		}
	}

	async function startDocuRender() {
		if (!scenes.length || isRendering) return;
		isRendering = true;
		renderError = null;
		downloadUrl = null;
		renderProgress = 5;
		renderStep = 'Memulai Docu-Engine...';

		try {
			const track = BGM_TRACKS.find(t => t.id === selectedBgmId);
			const res = await fetch('/api/render-docu', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scenes,
					renderQuality,
					videoTitle,
					docuTheme: selectedTheme,
					textColor,
					highlightColor,
					fontSize,
					fontFamily: selectedFont,
					defaultStamp: selectedDefaultStamp,
					bgmUrl: track ? track.url : null,
					bgmVolume
				})
			});

			if (!res.ok || !res.body) throw new Error(`Server ${res.statusText}`);

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buf = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buf += decoder.decode(value, { stream: true });
				const lines = buf.split('\n');
				buf = lines.pop() ?? '';

				for (const line of lines) {
					if (!line.startsWith('data:')) continue;
					try {
						const p = JSON.parse(line.slice(5).trim());
						if (p.progress !== undefined) renderProgress = p.progress;
						if (p.step) renderStep = p.step;
						if (p.error) throw new Error(p.error);
						if (p.done) {
							downloadUrl = p.downloadUrl;
							downloadFilename = p.filename || 'documentary.mp4';
						}
					} catch (e) {
						if (e.message && !String(e.message).startsWith('Unexpected')) throw e;
					}
				}
			}

			if (!downloadUrl) throw new Error('Render selesai tanpa file');
		} catch (e) {
			renderError = e.message;
		} finally {
			isRendering = false;
		}
	}

	function copyYouTubeDescription() {
		let totalSec = 0;
		let chapterLines = [];
		for (let i = 0; i < scenes.length; i++) {
			const m = Math.floor(totalSec / 60);
			const s = Math.floor(totalSec % 60);
			const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
			const titleTag = scenes[i].headerTag || `Bagian ${i + 1}`;
			chapterLines.push(`${timeStr} - ${titleTag}`);
			totalSec += (scenes[i].audioDuration || 5) + 0.20;
		}

		const fullDesc = `${videoTitle}

Dokumen dan rekaman arsip investigasi yang membongkar kronologi serta fakta-fakta yang jarang diungkapkan secara terbuka.

TIMESTAMPS / KRONOLOGI ARSIP:
${chapterLines.join('\n')}

#Dokumenter #Investigasi #VoxStyle #FaktaDunia #Sejarah`;

		navigator.clipboard.writeText(fullDesc);
		showCopyAlert = true;
		setTimeout(() => { showCopyAlert = false; }, 3000);
	}
</script>

<div class="docu-studio">
	<!-- Header -->
	<header class="studio-header">
		<div class="header-left">
			<a href="/" class="btn-back">
				<ArrowLeft size={16} />
				<span>Beranda</span>
			</a>
			<div class="header-title">
				<div class="badge-docu">
					<Stamp size={13} />
					<span>DOCU-STYLE INVESTIGATION STUDIO</span>
				</div>
				<h2>{videoTitle || 'Studio Dokumenter & Arsip'}</h2>
			</div>
		</div>

		<div class="header-right">
			<div class="studio-switchers">
				<a href="/studio" class="switcher-link">🎬 Cinematic Studio</a>
				<a href="/stickman-studio" class="switcher-link">🎨 Stickman Studio</a>
			</div>
			<button class="btn btn-primary" onclick={startDocuRender} disabled={isRendering}>
				<Download size={16} />
				<span>{isRendering ? `Rendering (${renderProgress}%)` : 'Ekspor Video Dokumenter'}</span>
			</button>
		</div>
	</header>

	<!-- Main Workspace -->
	<main class="studio-workspace">
		<!-- Left: Controls & Script Editor -->
		<aside class="panel-left">
			<div class="panel-card">
				<div class="card-header">
					<FileText size={16} />
					<h3>Naskah & Narasi Cerita</h3>
				</div>
				<div class="card-body">
					<label class="form-label" for="video-title-input">Judul Video Investigasi</label>
					<input id="video-title-input" class="input-text" type="text" bind:value={videoTitle} placeholder="Contoh: Dokumen Rahasia 1998" />

					<label class="form-label" for="docu-script-input">Isi Naskah Cerita</label>
					<textarea id="docu-script-input" class="textarea-script" bind:value={script} rows="8" placeholder="Tulis atau tempel naskah di sini..."></textarea>

					<div class="btn-row">
						<button class="btn btn-secondary btn-sm" onclick={splitScriptToDocuScenes}>
							<Layers size={14} />
							<span>Pecah Jadi Adegan</span>
						</button>
						<button class="btn btn-accent btn-sm" onclick={generateAllVoices}>
							<Volume2 size={14} />
							<span>Voiceover Semua Adegan</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Styling & Visual Props -->
			<div class="panel-card">
				<div class="card-header">
					<Settings size={16} />
					<h3>Atribut Estetika Dokumen</h3>
				</div>
				<div class="card-body">
					<!-- Background Theme -->
					<div class="form-group">
						<label class="form-label" for="theme-select">Tekstur Latar Belakang</label>
						<select id="theme-select" class="input-select" bind:value={selectedTheme}>
							{#each DOCU_THEMES as t}
								<option value={t.id}>{t.name}</option>
							{/each}
						</select>
					</div>

					<!-- Stamp Selector -->
					<div class="form-group">
						<label class="form-label" for="stamp-select">Stempel Rahasia Bawaan</label>
						<select id="stamp-select" class="input-select" bind:value={selectedDefaultStamp}>
							{#each STAMP_OPTIONS as st}
								<option value={st.id}>{st.icon} {st.name}</option>
							{/each}
						</select>
					</div>

					<!-- Voice Selector -->
					<div class="form-group">
						<label class="form-label" for="voice-select">Pengisi Suara (Voiceover)</label>
						<select id="voice-select" class="input-select" bind:value={selectedVoice}>
							{#each VOICES as v}
								<option value={v.id}>{v.name}</option>
							{/each}
						</select>
					</div>

					<!-- BGM & Volume -->
					<div class="form-group">
						<label class="form-label" for="bgm-select">Musik Latar (BGM)</label>
						<select id="bgm-select" class="input-select" bind:value={selectedBgmId}>
							{#each BGM_TRACKS as b}
								<option value={b.id}>{b.title}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label class="form-label" for="bgm-volume-slider">Volume Musik ({Math.round(bgmVolume * 100)}%)</label>
						<input id="bgm-volume-slider" type="range" min="0.01" max="0.25" step="0.01" bind:value={bgmVolume} class="slider" />
					</div>

					<!-- Quick Description Exporter -->
					<button class="btn btn-outline btn-sm full-width" onclick={copyYouTubeDescription}>
						<Copy size={14} />
						<span>{showCopyAlert ? '✓ Tersalin ke Clipboard!' : 'Salin Deskripsi & Timestamp YouTube'}</span>
					</button>
				</div>
			</div>
		</aside>

		<!-- Center: Live Canvas Preview -->
		<section class="panel-center">
			<div class="canvas-wrapper">
				<div class="canvas-viewport" style="background-image: url('/docu/backgrounds/{selectedTheme}.png');">
					<!-- Active Scene Visual Collage -->
					{#if scenes[currentSceneIndex]}
						{@const cur = scenes[currentSceneIndex]}
						
						<!-- Badge / Tag Header -->
						<div class="docu-tag-badge">
							<span class="tag-pulse"></span>
							<span>{cur.headerTag || 'BUKTI ARSIP'}</span>
						</div>

						<!-- Evidence / Polaroid Card -->
						<div class="evidence-card {cur.layoutSide === 'left' ? 'card-left' : 'card-right'}">
							<!-- Pin / Tape -->
							{#if cur.pin === 'tape'}
								<img src="/docu/elements/tape-strip.png" alt="tape" class="pin-tape" />
							{:else if cur.pin === 'pushpin'}
								<img src="/docu/elements/pushpin.png" alt="pushpin" class="pin-pushpin" />
							{:else if cur.pin === 'paperclip'}
								<img src="/docu/elements/paperclip.png" alt="paperclip" class="pin-paperclip" />
							{/if}

							<!-- Photo Inner -->
							<div class="card-inner-photo">
								{#if cur.image}
									<img src={cur.image} alt="Evidence" class="photo-img" />
								{:else}
									<div class="photo-placeholder">
										<ImageIcon size={32} opacity={0.4} />
										<span>Arsip Foto #{currentSceneIndex + 1}</span>
									</div>
								{/if}
							</div>

							<!-- Stamp -->
							{#if cur.stamp && cur.stamp !== 'none'}
								<img src="/docu/elements/stamp-{cur.stamp}.png" alt="Stamp" class="card-stamp" />
							{/if}
						</div>

						<!-- Subtitle Lower Third Box -->
						<div class="docu-subtitle-box">
							<p class="subtitle-text" style="font-family: '{selectedFont}', sans-serif;">
								{cur.narration}
							</p>
						</div>
					{:else}
						<div class="empty-state">
							<p>Belum ada adegan. Klik "Pecah Jadi Adegan" untuk memulai.</p>
						</div>
					{/if}
				</div>

				<!-- Playback Scrubber & Controls -->
				<div class="preview-controls">
					<button class="btn-ctrl" onclick={togglePlay}>
						{#if isPlaying}
							<Pause size={18} />
						{:else}
							<Play size={18} />
						{/if}
					</button>

					<div class="scene-stepper">
						<button class="step-btn" disabled={currentSceneIndex <= 0} onclick={() => playScene(currentSceneIndex - 1)}>Prev</button>
						<span class="scene-indicator">Adegan {currentSceneIndex + 1} dari {scenes.length || 1}</span>
						<button class="step-btn" disabled={currentSceneIndex >= scenes.length - 1} onclick={() => playScene(currentSceneIndex + 1)}>Next</button>
					</div>

					{#if scenes[currentSceneIndex]}
						<span class="dur-badge">⏱ {scenes[currentSceneIndex].audioDuration || 4}s</span>
					{/if}
				</div>
			</div>

			<!-- Render Notification Box -->
			{#if isRendering || downloadUrl || renderError}
				<div class="render-banner {renderError ? 'error' : downloadUrl ? 'done' : 'processing'}">
					{#if renderError}
						<p><strong>Gagal:</strong> {renderError}</p>
					{:else if downloadUrl}
						<div class="render-success-row">
							<CheckCircle2 size={20} class="success-icon" />
							<div>
								<h4>Video Dokumenter Siap!</h4>
								<p>File berhasil di-render dalam format MP4 1080p.</p>
							</div>
							<a href={downloadUrl} download={downloadFilename} class="btn btn-accent btn-sm">
								<Download size={14} />
								<span>Download Video ({downloadFilename})</span>
							</a>
						</div>
					{:else}
						<div class="render-progress-wrap">
							<div class="progress-bar-bg">
								<div class="progress-bar-fill" style="width: {renderProgress}%"></div>
							</div>
							<div class="progress-meta">
								<span>{renderStep}</span>
								<span>{renderProgress}%</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</section>

		<!-- Right: Scene Management List -->
		<aside class="panel-right">
			<div class="panel-card full-height">
				<div class="card-header">
					<Layers size={16} />
					<h3>Daftar Bukti & Adegan ({scenes.length})</h3>
				</div>
				<div class="scene-scroll-list">
					{#each scenes as sc, idx}
						<div class="scene-item {idx === currentSceneIndex ? 'active' : ''}" onclick={() => { currentSceneIndex = idx; }}>
							<div class="scene-item-header">
								<span class="scene-number">#{idx + 1}</span>
								<input type="text" class="scene-tag-input" bind:value={sc.headerTag} placeholder="Label Bukti..." />
								<span class="scene-dur">{sc.audioDuration || 4}s</span>
							</div>

							<textarea class="scene-narration-input" bind:value={sc.narration} rows="2"></textarea>

							<div class="scene-item-tools">
								<!-- Media selector dropdown from catalog -->
								<select class="mini-select" bind:value={sc.image}>
									<option value="">(Pilih Foto Arsip)</option>
									{#each catalogItems as cat}
										<option value={cat.thumbnail || cat.videoUrl}>{cat.title.slice(0, 30)}...</option>
									{/each}
								</select>

								<!-- Stamp selector -->
								<select class="mini-select" bind:value={sc.stamp}>
									{#each STAMP_OPTIONS as st}
										<option value={st.id}>{st.icon} {st.name}</option>
									{/each}
								</select>

								<!-- Voice Button -->
								<button class="voice-btn {sc.voiceAudioUrl ? 'voiced' : ''}" onclick={(e) => { e.stopPropagation(); generateVoiceForScene(idx); }}>
									<Volume2 size={12} />
									<span>{sc.voiceAudioUrl ? 'TTS OK' : 'TTS'}</span>
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</aside>
	</main>
</div>

<style>
	.docu-studio {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: #090d16;
		color: #e2e8f0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.studio-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 24px;
		background: #0f172a;
		border-bottom: 1px solid #1e293b;
		position: sticky;
		top: 0;
		z-index: 40;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.btn-back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #94a3b8;
		font-size: 13px;
		text-decoration: none;
		padding: 6px 12px;
		border-radius: 6px;
		border: 1px solid #334155;
		transition: all 0.2s;
	}
	.btn-back:hover {
		color: #ffffff;
		border-color: #64748b;
	}

	.badge-docu {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #b91c1c;
		color: #ffffff;
		font-size: 10px;
		font-weight: 800;
		padding: 2px 8px;
		border-radius: 4px;
		letter-spacing: 1px;
	}

	.header-title h2 {
		margin: 4px 0 0 0;
		font-size: 16px;
		font-weight: 700;
		color: #f8fafc;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.studio-switchers {
		display: flex;
		gap: 8px;
	}

	.switcher-link {
		color: #94a3b8;
		font-size: 12px;
		text-decoration: none;
		padding: 6px 10px;
		border-radius: 6px;
		background: #1e293b;
		transition: all 0.2s;
	}
	.switcher-link:hover {
		color: #f8fafc;
		background: #334155;
	}

	/* Main Workspace 3-column layout */
	.studio-workspace {
		display: grid;
		grid-template-columns: 360px 1fr 380px;
		gap: 16px;
		padding: 16px;
		flex: 1;
		align-items: stretch;
	}

	.panel-left, .panel-right {
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
		max-height: calc(100vh - 80px);
	}

	.panel-card {
		background: #111827;
		border: 1px solid #1f2937;
		border-radius: 8px;
		overflow: hidden;
	}

	.panel-card.full-height {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: #1f2937;
		border-bottom: 1px solid #374151;
	}

	.card-header h3 {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: #f3f4f6;
	}

	.card-body {
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.form-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #9ca3af;
		margin-bottom: 4px;
	}

	.input-text, .input-select, .textarea-script {
		width: 100%;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 6px;
		color: #f8fafc;
		padding: 8px 10px;
		font-size: 13px;
		box-sizing: border-box;
	}

	.textarea-script {
		resize: vertical;
		line-height: 1.5;
	}

	.btn-row {
		display: flex;
		gap: 8px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		border-radius: 6px;
		padding: 8px 14px;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
	}

	.btn-sm {
		padding: 6px 10px;
		font-size: 12px;
	}

	.btn-primary {
		background: #ef4444;
		color: #ffffff;
	}
	.btn-primary:hover:not(:disabled) {
		background: #dc2626;
	}

	.btn-accent {
		background: #eab308;
		color: #0f172a;
	}
	.btn-accent:hover {
		background: #ca8a04;
	}

	.btn-secondary {
		background: #374151;
		color: #f3f4f6;
	}
	.btn-secondary:hover {
		background: #4b5563;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid #475569;
		color: #cbd5e1;
	}
	.btn-outline:hover {
		border-color: #94a3b8;
		color: #ffffff;
	}

	.full-width {
		width: 100%;
	}

	/* Canvas Center Area */
	.panel-center {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.canvas-wrapper {
		background: #111827;
		border: 1px solid #1f2937;
		border-radius: 8px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.canvas-viewport {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background-size: cover;
		background-position: center;
		border-radius: 6px;
		overflow: hidden;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
	}

	.docu-tag-badge {
		position: absolute;
		top: 18px;
		left: 22px;
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(15, 23, 42, 0.88);
		border-left: 3px solid #facc15;
		padding: 6px 12px;
		border-radius: 4px;
		color: #facc15;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 1px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	}

	.tag-pulse {
		width: 7px;
		height: 7px;
		background: #ef4444;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.3); opacity: 0.6; }
	}

	/* Evidence / Polaroid Card */
	.evidence-card {
		position: absolute;
		top: 14%;
		width: 44%;
		height: 58%;
		background: #f8fafc;
		border-radius: 2px;
		padding: 12px 12px 28px 12px;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.65), 0 4px 8px rgba(0, 0, 0, 0.35);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		transition: all 0.4s ease;
	}

	.card-left {
		left: 8%;
		transform: rotate(-2.5deg);
	}

	.card-right {
		right: 8%;
		transform: rotate(2deg);
	}

	.pin-tape {
		position: absolute;
		top: -14px;
		left: 32%;
		width: 36%;
		z-index: 10;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.pin-pushpin {
		position: absolute;
		top: -12px;
		left: 42%;
		width: 16%;
		z-index: 10;
		filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
	}

	.pin-paperclip {
		position: absolute;
		top: -18px;
		left: 18%;
		width: 14%;
		z-index: 10;
	}

	.card-inner-photo {
		width: 100%;
		height: 100%;
		background: #1e293b;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.photo-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.photo-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		color: #94a3b8;
		font-size: 11px;
	}

	.card-stamp {
		position: absolute;
		bottom: -15px;
		right: -15px;
		width: 58%;
		z-index: 12;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
	}

	/* Subtitle Lower-Third */
	.docu-subtitle-box {
		position: absolute;
		bottom: 22px;
		left: 5%;
		right: 5%;
		background: rgba(10, 15, 26, 0.88);
		border-left: 4px solid #ef4444;
		border-radius: 4px;
		padding: 10px 18px;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
	}

	.subtitle-text {
		margin: 0;
		font-size: 16px;
		line-height: 1.45;
		color: #ffffff;
		text-align: center;
		font-weight: 500;
	}

	/* Preview Scrubber Controls */
	.preview-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 6px;
	}

	.btn-ctrl {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #ef4444;
		border: none;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.btn-ctrl:hover {
		background: #dc2626;
	}

	.scene-stepper {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.step-btn {
		background: #1f2937;
		border: 1px solid #374151;
		color: #f3f4f6;
		font-size: 11px;
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;
	}
	.step-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.scene-indicator {
		font-size: 12px;
		color: #94a3b8;
	}

	.dur-badge {
		font-size: 11px;
		background: #1e293b;
		padding: 4px 8px;
		border-radius: 4px;
		color: #cbd5e1;
	}

	/* Render Notification Banner */
	.render-banner {
		padding: 14px;
		border-radius: 8px;
		background: #111827;
		border: 1px solid #1f2937;
	}

	.render-banner.processing {
		border-color: #3b82f6;
	}

	.render-banner.done {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.08);
	}

	.render-banner.error {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.08);
	}

	.render-success-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.render-success-row h4 {
		margin: 0;
		color: #10b981;
	}
	.render-success-row p {
		margin: 2px 0 0 0;
		font-size: 12px;
		color: #94a3b8;
	}

	.progress-bar-bg {
		width: 100%;
		height: 8px;
		background: #1f2937;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #ef4444, #eab308);
		transition: width 0.3s ease;
	}

	.progress-meta {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #94a3b8;
	}

	/* Right Scene List */
	.scene-scroll-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 12px;
		overflow-y: auto;
		flex: 1;
	}

	.scene-item {
		background: #0f172a;
		border: 1px solid #1e293b;
		border-radius: 6px;
		padding: 10px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: all 0.2s;
	}

	.scene-item.active {
		border-color: #facc15;
		background: #172033;
	}

	.scene-item-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.scene-number {
		font-size: 11px;
		font-weight: 700;
		color: #64748b;
	}

	.scene-tag-input {
		flex: 1;
		background: transparent;
		border: none;
		border-bottom: 1px dashed #334155;
		color: #facc15;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.scene-dur {
		font-size: 10px;
		color: #64748b;
	}

	.scene-narration-input {
		width: 100%;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid #334155;
		border-radius: 4px;
		color: #cbd5e1;
		font-size: 12px;
		padding: 6px;
		resize: none;
		box-sizing: border-box;
	}

	.scene-item-tools {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mini-select {
		flex: 1;
		background: #1e293b;
		border: 1px solid #334155;
		color: #94a3b8;
		font-size: 10px;
		padding: 3px 4px;
		border-radius: 4px;
	}

	.voice-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 10px;
		padding: 4px 6px;
		background: #334155;
		color: #cbd5e1;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.voice-btn.voiced {
		background: #065f46;
		color: #34d399;
	}
</style>
