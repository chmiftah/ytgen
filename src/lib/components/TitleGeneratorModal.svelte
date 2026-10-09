<script>
	import { untrack } from 'svelte';
	import { 
		X, 
		Flame, 
		Sparkles, 
		Copy, 
		Check, 
		RefreshCw, 
		Smartphone, 
		Layers, 
		ArrowRight, 
		AlertCircle,
		CheckCircle2,
		Image as ImageIcon,
		Compass,
		Filter,
		SlidersHorizontal,
		Lightbulb
	} from 'lucide-svelte';

	let {
		isOpen = false,
		deepseekApiKey = '',
		initialNiche = 'wealth_finance',
		initialTopic = '',
		activeScript = '',
		onSelectTitle,
		onSelectTitleForScript,
		onClose
	} = $props();

	let selectedCategoryKey = $state('wealth_finance');
	let selectedAngle = $state('all');
	let topicInput = $state('');
	let selectedFilterCategory = $state('all'); // for filtering output list
	let isGenerating = $state(false);
	let titles = $state([]);
	let copiedTitleIndex = $state(null);
	let errorMessage = $state('');

	const CONTENT_CATEGORIES = [
		{
			id: 'wealth_finance',
			icon: '💸',
			title: 'Uang & Finansial',
			subtitle: 'Psikologi Uang & Kelas Menengah',
			tag: 'High CTR',
			desc: 'Kenapa kelas menengah terjebak, psikologi orang kaya, rahasia sistem uang, jebakan cicilan gaya hidup',
			trendingTopics: [
				'Kesalahan Finansial yang Merusak Tabungan',
				'Kenapa Gaji 25 Juta Masih Merasa Kurang',
				'Orang Kaya Tidak Membeli Aset Ini',
				'Jebakan Gaya Hidup Kelas Menengah'
			]
		},
		{
			id: 'dark_psychology',
			icon: '🧠',
			title: 'Psikologi Gelap & Otak',
			subtitle: 'Manipulasi & Perilaku Manusia',
			tag: 'Sangat Adiktif',
			desc: 'Trik manipulasi halus, jebakan dopamin medsos, kenapa otak menunda pekerjaan, bias kognitif',
			trendingTopics: [
				'Kenapa Otak Kita Sengaja Bikin Kita Gagal',
				'Trik Manipulasi Halus Orang Terdekat',
				'Seni Berhenti Menjelaskan Diri Sendiri',
				'Eksperimen 7 Hari Tanpa Scroll HP'
			]
		},
		{
			id: 'investigation',
			icon: '🕵️‍♂️',
			title: 'Skandal & Investigasi',
			subtitle: 'Dokumen Rahasia & Kasus Nyata',
			tag: 'Curiosity Ekstrem',
			desc: 'Konspirasi korporat, misteri hilangnya uang triliunan, kejahatan kerah putih, rahasia terbongkar',
			trendingTopics: [
				'Dokumen Rahasia yang Sengaja Dihancurkan',
				'Misteri Hilangnya 40 Triliun Semalam',
				'Kasus Kejahatan Paling Sempurna',
				'Kebohongan Terbesar Selama 30 Tahun'
			]
		},
		{
			id: 'science_paradox',
			icon: '⏳',
			title: 'Paradoks & Sains AI',
			subtitle: 'Misteri Kosmos & Bahaya Masa Depan',
			tag: 'Mind-Blowing',
			desc: 'Simulasi alam semesta, paradoks waktu, ancaman kecerdasan buatan, eksperimen fisika gila',
			trendingTopics: [
				'Bukti Waktu Sebenarnya Tidak Bergerak',
				'Sesuatu yang Salah dengan AI Baru Ini',
				'Paradoks Menakutkan Mengapa Alien Diam',
				'Dunia Ini Mungkin Hanya Simulasi Komputer'
			]
		},
		{
			id: 'stoic_philosophy',
			icon: '🏛️',
			title: 'Stoikisme & Mental',
			subtitle: 'Marcus Aurelius & Mental Baja',
			tag: 'Retensi Tinggi',
			desc: 'Ketenangan saat hidup berantakan, seni tidak peduli omongan orang, disiplin baja, stoikisme',
			trendingTopics: [
				'Cara Tenang Saat Hidup Hancur Total',
				'Kekuatan Berhenti Menyenangkan Semua Orang',
				'Amor Fati: Cintai Takdirmu Apapun Itu',
				'Kenapa Orang Pendiam Sering Paling Disegani'
			]
		},
		{
			id: 'business_downfall',
			icon: '🏢',
			title: 'Kejatuhan Bisnis',
			subtitle: 'Kebangkrutan & Skandal Korporat',
			tag: 'Storytelling Epik',
			desc: 'Runtuhnya dinasti bisnis, perang brand, kesalahan fatal 10 menit CEO, monopoli licik',
			trendingTopics: [
				'Kesalahan 10 Menit yang Menghancurkan 80 Miliar',
				'Trik Licik Supermarket Menguras Dompet',
				'Kejatuhan Kodak: Pelopor yang Bunuh Diri',
				'Malam di Mana Sang CEO Memutuskan Mundur'
			]
		},
		{
			id: 'digital_trap',
			icon: '📱',
			title: 'Bahaya Medsos & Digital',
			subtitle: 'Mesin Adiksi & Algoritma Candu',
			tag: 'Sangat Relevan',
			desc: 'Algoritma candu TikTok, kasino di saku celana, manipulasi internet, attention span hancur',
			trendingTopics: [
				'Kasino di Saku Celanamu: Medsos vs Otak',
				'Kenapa Kita Tidak Bisa Fokus 30 Detik Lagi',
				'Kebenaran Gelap di Balik Tombol Like',
				'Bagaimana Algoritma Tahu Rahasia Terdalammu'
			]
		},
		{
			id: 'social_dynamics',
			icon: '🗣️',
			title: 'Relasi & Karisma',
			subtitle: 'Dinamika Sosial & Deteksi Toxic',
			tag: 'Praktis & Viral',
			desc: 'Seni disegani tanpa banyak bicara, deteksi orang manipulatif, bahasa tubuh rahasia',
			trendingTopics: [
				'7 Ciri Orang Manipulatif Berkedok Baik',
				'Seni Berbicara Agar Didengar Semua Orang',
				'Jangan Pernah Ceritakan 3 Hal Ini ke Siapapun',
				'Bahasa Tubuh yang Bikin Orang Segan Seketika'
			]
		}
	];

	const STORY_ANGLES = [
		{ id: 'all', label: '🎲 Campuran Terbaik (10 Gaya Berbeda)' },
		{ id: 'curiosity', label: '🪝 Curiosity Gap (Misteri Terpendam)' },
		{ id: 'contrast', label: '💥 Kontras Ekstrem / Paradoks Logika' },
		{ id: 'short', label: '⚡ Super Pendek (< 40 Karakter)' },
		{ id: 'high_stakes', label: '⚠️ Peringatan Keras / Titik Kritis' }
	];

	let activeCategory = $derived.by(() => {
		return CONTENT_CATEGORIES.find(c => c.id === selectedCategoryKey) || CONTENT_CATEGORIES[0];
	});

	let wasOpen = false;

	$effect(() => {
		const currentlyOpen = isOpen;
		if (currentlyOpen && !wasOpen) {
			wasOpen = true;
			untrack(() => {
				if (initialNiche && CONTENT_CATEGORIES.some((c) => c.id === initialNiche)) {
					selectedCategoryKey = initialNiche;
				}
				topicInput = initialTopic || '';
				if (titles.length === 0) {
					handleGenerateTitles();
				}
			});
		} else if (!currentlyOpen && wasOpen) {
			wasOpen = false;
		}
	});

	let filteredTitles = $derived.by(() => {
		if (selectedFilterCategory === 'all') return titles;
		return titles.filter(t => t.category === selectedFilterCategory);
	});

	async function handleGenerateTitles(overrideTopic = null) {
		isGenerating = true;
		errorMessage = '';
		if (overrideTopic !== null) {
			topicInput = overrideTopic;
		}
		const effectiveTopic = overrideTopic !== null ? overrideTopic : topicInput;

		try {
			const resolvedKey = (deepseekApiKey && deepseekApiKey !== 'sk-0802f45e1d4e41c8ae8d46396c97b746')
				? deepseekApiKey.trim()
				: (typeof window !== 'undefined' ? (localStorage.getItem('yt_deepseek_key') || '') : '');
			const cleanKey = resolvedKey !== 'sk-0802f45e1d4e41c8ae8d46396c97b746' ? resolvedKey : '';

			const res = await fetch('/api/generate-title', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: selectedCategoryKey,
					angle: selectedAngle,
					topic: effectiveTopic.trim(),
					apiKey: cleanKey
				})
			});

			const data = await res.json();
			if (data.success && Array.isArray(data.titles) && data.titles.length > 0) {
				titles = data.titles;
			} else {
				throw new Error(data.error || 'Gagal meriset judul viral');
			}
		} catch (err) {
			console.warn('Title generator error:', err);
			errorMessage = err.message || 'Terjadi kesalahan saat meriset judul viral AI';
		} finally {
			isGenerating = false;
		}
	}

	function handleSelectCategory(catKey) {
		selectedCategoryKey = catKey;
		topicInput = ''; // reset topic input when switching category
		handleGenerateTitles('');
	}

	function copyToClipboard(text, index) {
		navigator.clipboard.writeText(text).then(() => {
			copiedTitleIndex = index;
			setTimeout(() => {
				copiedTitleIndex = null;
			}, 2000);
		});
	}

	function handleUseTitleOnly(titleText) {
		if (onSelectTitle) {
			onSelectTitle(titleText);
		} else if (onSelectTitleForScript) {
			onSelectTitleForScript(titleText, false);
		}
		onClose();
	}

	function handleUseForScript(titleText) {
		if (onSelectTitleForScript) {
			onSelectTitleForScript(titleText, true);
		} else if (onSelectTitle) {
			onSelectTitle(titleText);
		}
		onClose();
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose} role="presentation">
		<div class="modal-card glass-panel" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-left">
					<div class="icon-badge">
						<Flame size={22} color="#f97316" />
					</div>
					<div>
						<h2 class="title">Riset Judul Viral YouTube (DeepSeek AI)</h2>
						<p class="subtitle">Langkah 1: Pilih Kategori Tema Konten → Langkah 2: Dapatkan 10 Judul Unik Ber-CTR Tinggi</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose} aria-label="Tutup modal">
					<X size={18} />
				</button>
			</div>

			<!-- STEP 1: CATEGORY SELECTION CARDS -->
			<div class="category-selection-section">
				<div class="section-title-row">
					<span class="step-badge">Langkah 1</span>
					<span class="section-label">Pilih Kategori Tema Konten Video Anda:</span>
				</div>

				<div class="category-grid">
					{#each CONTENT_CATEGORIES as cat}
						<button 
							type="button" 
							class="cat-card" 
							class:active={selectedCategoryKey === cat.id}
							onclick={() => handleSelectCategory(cat.id)}
						>
							<div class="cat-card-top">
								<span class="cat-icon">{cat.icon}</span>
								<span class="cat-tag">{cat.tag}</span>
							</div>
							<div class="cat-card-name">{cat.title}</div>
							<div class="cat-card-sub">{cat.subtitle}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- STEP 2: TOPIC & ANGLE CONTROLS -->
			<div class="controls-section">
				<div class="cat-context-banner">
					<div class="cat-info">
						<span class="cur-icon">{activeCategory.icon}</span>
						<div>
							<strong>{activeCategory.title}</strong>
							<p>{activeCategory.desc}</p>
						</div>
					</div>

					<div class="angle-select-wrap">
						<span class="angle-label"><SlidersHorizontal size={12} /> Angle Cerita:</span>
						<select 
							bind:value={selectedAngle} 
							onchange={() => handleGenerateTitles()}
							class="angle-select"
						>
							{#each STORY_ANGLES as ang}
								<option value={ang.id}>{ang.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Trending Quick Topic Pills -->
				<div class="trending-topics-bar">
					<span class="trend-label"><Lightbulb size={12} color="#fbbf24" /> Topik Trending {activeCategory.title}:</span>
					<div class="trend-chips">
						{#each activeCategory.trendingTopics as topicItem}
							<button 
								type="button" 
								class="trend-chip" 
								class:active={topicInput === topicItem}
								onclick={() => handleGenerateTitles(topicItem)}
							>
								{topicItem}
							</button>
						{/each}
					</div>
				</div>

				<!-- Custom Keyword Input Row -->
				<div class="topic-input-row">
					<div class="input-wrapper">
						<input 
							type="text" 
							bind:value={topicInput} 
							placeholder="Atau ketik topik spesifik Anda sendiri (misal: 'Nokia vs Apple', 'Gaji UMR', atau kosongkan)..."
							class="topic-text-input"
							onkeydown={(e) => { if (e.key === 'Enter') handleGenerateTitles(); }}
						/>
						{#if topicInput}
							<button type="button" class="clear-topic-btn" onclick={() => { topicInput = ''; handleGenerateTitles(''); }}>
								<X size={13} />
							</button>
						{/if}
					</div>
					<button 
						type="button" 
						class="btn-generate-main" 
						onclick={() => handleGenerateTitles()} 
						disabled={isGenerating}
					>
						{#if isGenerating}
							<RefreshCw size={15} class="spin" />
							<span>Meracik 10 Judul...</span>
						{:else}
							<Flame size={15} color="#f97316" />
							<span>🔥 Riset 10 Judul {activeCategory.title}</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- Category Filter Tabs for Results -->
			{#if titles.length > 0}
				<div class="filter-bar">
					<span class="filter-label"><Filter size={11} /> Filter Gaya:</span>
					<button 
						type="button" 
						class="cat-tab" 
						class:active={selectedFilterCategory === 'all'}
						onclick={() => selectedFilterCategory = 'all'}
					>
						Semua ({titles.length})
					</button>
					<button 
						type="button" 
						class="cat-tab" 
						class:active={selectedFilterCategory === 'curiosity_gap'}
						onclick={() => selectedFilterCategory = 'curiosity_gap'}
					>
						🎯 Curiosity Gap
					</button>
					<button 
						type="button" 
						class="cat-tab" 
						class:active={selectedFilterCategory === 'short_punchy'}
						onclick={() => selectedFilterCategory = 'short_punchy'}
					>
						⚡ Short & Punchy (&lt;45 Karakter)
					</button>
					<button 
						type="button" 
						class="cat-tab" 
						class:active={selectedFilterCategory === 'contrast'}
						onclick={() => selectedFilterCategory = 'contrast'}
					>
						🧠 Kontras & Paradoks
					</button>
					<button 
						type="button" 
						class="cat-tab" 
						class:active={selectedFilterCategory === 'documentary'}
						onclick={() => selectedFilterCategory = 'documentary'}
					>
						🏛️ Studi Kasus / Dokumenter
					</button>
					<button 
						type="button" 
						class="cat-tab" 
						class:active={selectedFilterCategory === 'high_stakes'}
						onclick={() => selectedFilterCategory = 'high_stakes'}
					>
						⚠️ High Stakes & Peringatan
					</button>
				</div>
			{/if}

			<!-- Error Notification -->
			{#if errorMessage}
				<div class="error-banner">
					<AlertCircle size={15} />
					<span>{errorMessage}</span>
				</div>
			{/if}

			<!-- Titles List -->
			<div class="titles-scroll-container">
				{#if isGenerating && titles.length === 0}
					<div class="loading-state">
						<div class="loading-spinner"></div>
						<p class="loading-text">DeepSeek AI sedang meracik 10 formula judul unik untuk {activeCategory.title}...</p>
						<span class="loading-sub">Menghitung probabilitas CTR, panjang karakter mobile, dan sinergi visual thumbnail</span>
					</div>
				{:else if filteredTitles.length === 0}
					<div class="empty-state">
						<Layers size={36} color="var(--text-muted)" />
						<p>Tidak ada judul untuk filter gaya ini.</p>
					</div>
				{:else}
					<div class="titles-grid">
						{#each filteredTitles as item, idx}
							<div class="title-card">
								<div class="card-top">
									<div class="tag-group">
										<span class="category-badge">{item.categoryLabel || item.category}</span>
										<span class="mobile-badge" class:warning={!item.isMobileFriendly}>
											<Smartphone size={11} />
											<span>{item.charCount} Karakter</span>
											{#if item.isMobileFriendly}
												<span class="mob-ok">• Aman di HP</span>
											{:else}
												<span class="mob-warn">• Rentan Terpotong</span>
											{/if}
										</span>
									</div>
									<div class="ctr-badge">
										<Flame size={12} color="#f97316" />
										<span>{item.ctrScore}% Est. CTR</span>
									</div>
								</div>

								<div class="card-main-title">
									{item.title}
								</div>

								<p class="formula-desc">
									💡 {item.formulaExplanation}
								</p>

								<!-- Thumbnail Synergy Box -->
								{#if item.thumbnailIdea}
									<div class="thumbnail-synergy-box">
										<div class="thumb-header">
											<ImageIcon size={12} color="#38bdf8" />
											<span>Sinergi Visual Thumbnail:</span>
										</div>
										<div class="thumb-content">
											<div class="thumb-visual">
												<span>Visual:</span> {item.thumbnailIdea.visualHook}
											</div>
											<div class="thumb-overlay">
												<span>Teks Thumbnail:</span>
												<strong class="thumb-badge-text">{item.thumbnailIdea.overlayText}</strong>
											</div>
										</div>
									</div>
								{/if}

								<!-- Card Actions -->
								<div class="card-actions">
									<button 
										type="button" 
										class="action-btn copy-btn"
										onclick={() => copyToClipboard(item.title, idx)}
									>
										{#if copiedTitleIndex === idx}
											<Check size={14} color="#10b981" />
											<span class="text-green">Tersalin!</span>
										{:else}
											<Copy size={14} />
											<span>Salin</span>
										{/if}
									</button>

									<button 
										type="button" 
										class="action-btn use-title-btn"
										onclick={() => handleUseTitleOnly(item.title)}
										title="Pilih judul ini sebagai judul video di Studio"
									>
										<CheckCircle2 size={14} color="#10b981" />
										<span>Gunakan Judul Ini</span>
									</button>

									<button 
										type="button" 
										class="action-btn use-script-btn"
										onclick={() => handleUseForScript(item.title)}
										title="Pilih judul ini dan langsung buka AI Script Generator untuk membuat naskahnya"
									>
										<Sparkles size={14} color="#38bdf8" />
										<span>📝 Buat Naskah dari Judul Ini</span>
										<ArrowRight size={13} />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="modal-footer">
				<div class="footer-tip">
					💡 <strong>Tips Pro:</strong> Pilih judul dengan klik tertinggi, lalu klik <em>"Buat Naskah dari Judul Ini"</em> agar AI langsung menyusun naskah stickman yang menahan penonton sampai detik akhir!
				</div>
				<button type="button" class="btn-secondary" onclick={onClose}>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(10px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 16px;
	}

	.modal-card {
		width: 100%;
		max-width: 960px;
		max-height: 92vh;
		background: #0b1120;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: var(--radius-lg, 16px);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(249, 115, 22, 0.12);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes modalPop {
		from { opacity: 0; transform: scale(0.96) translateY(10px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.icon-badge {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		background: rgba(249, 115, 22, 0.15);
		border: 1px solid rgba(249, 115, 22, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.title {
		font-size: 1.15rem;
		font-weight: 800;
		color: #fff;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.subtitle {
		font-size: 0.78rem;
		color: var(--text-muted, #94a3b8);
		margin: 2px 0 0 0;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text-muted, #94a3b8);
		cursor: pointer;
		padding: 6px;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	/* STEP 1: CATEGORY CARDS GRID */
	.category-selection-section {
		padding: 14px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(15, 23, 42, 0.5);
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.section-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.step-badge {
		font-size: 0.68rem;
		font-weight: 800;
		background: #f97316;
		color: #fff;
		padding: 2px 8px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.section-label {
		font-size: 0.78rem;
		font-weight: 700;
		color: #e2e8f0;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	@media (max-width: 768px) {
		.category-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.cat-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 10px;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.cat-card:hover {
		background: rgba(255, 255, 255, 0.07);
		border-color: rgba(249, 115, 22, 0.3);
		transform: translateY(-1px);
	}

	.cat-card.active {
		background: rgba(249, 115, 22, 0.12);
		border-color: #f97316;
		box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
	}

	.cat-card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2px;
	}

	.cat-icon {
		font-size: 1.2rem;
	}

	.cat-tag {
		font-size: 0.62rem;
		font-weight: 700;
		background: rgba(255, 255, 255, 0.06);
		color: #94a3b8;
		padding: 1px 6px;
		border-radius: 4px;
	}

	.cat-card.active .cat-tag {
		background: rgba(249, 115, 22, 0.2);
		color: #fdba74;
	}

	.cat-card-name {
		font-size: 0.8rem;
		font-weight: 700;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.cat-card-sub {
		font-size: 0.68rem;
		color: #94a3b8;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* STEP 2: CONTROLS & TOPIC SECTION */
	.controls-section {
		padding: 14px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(10, 15, 29, 0.7);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.cat-context-banner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 8px 12px;
	}

	.cat-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.cur-icon {
		font-size: 1.4rem;
	}

	.cat-info strong {
		font-size: 0.84rem;
		color: #fdba74;
		display: block;
	}

	.cat-info p {
		font-size: 0.72rem;
		color: var(--text-muted, #94a3b8);
		margin: 1px 0 0 0;
	}

	.angle-select-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.angle-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-muted, #94a3b8);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.angle-select {
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 6px;
		color: #fff;
		font-size: 0.75rem;
		padding: 5px 8px;
		outline: none;
		cursor: pointer;
	}

	.trending-topics-bar {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.trend-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: #e2e8f0;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.trend-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.trend-chip {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: #cbd5e1;
		font-size: 0.72rem;
		padding: 4px 10px;
		cursor: pointer;
		transition: all 0.18s;
	}

	.trend-chip:hover {
		background: rgba(249, 115, 22, 0.15);
		border-color: rgba(249, 115, 22, 0.4);
		color: #fdba74;
	}

	.trend-chip.active {
		background: rgba(249, 115, 22, 0.25);
		border-color: #f97316;
		color: #fff;
		font-weight: 600;
	}

	.topic-input-row {
		display: flex;
		gap: 10px;
	}

	.input-wrapper {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
	}

	.topic-text-input {
		width: 100%;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 10px;
		padding: 10px 36px 10px 14px;
		color: #fff;
		font-size: 0.86rem;
		transition: border-color 0.2s;
	}

	.topic-text-input:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25);
	}

	.clear-topic-btn {
		position: absolute;
		right: 10px;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: var(--text-muted, #94a3b8);
		cursor: pointer;
		padding: 4px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clear-topic-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
	}

	.btn-generate-main {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 20px;
		background: linear-gradient(135deg, #ea580c, #f97316);
		border: none;
		border-radius: 10px;
		color: #fff;
		font-size: 0.84rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
	}

	.btn-generate-main:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45);
	}

	.btn-generate-main:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Filter Bar */
	.filter-bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 24px;
		background: rgba(0, 0, 0, 0.25);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		overflow-x: auto;
	}

	.filter-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-muted, #94a3b8);
		display: flex;
		align-items: center;
		gap: 4px;
		margin-right: 4px;
		white-space: nowrap;
	}

	.cat-tab {
		padding: 4px 10px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 6px;
		color: var(--text-muted, #94a3b8);
		font-size: 0.72rem;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.cat-tab:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.04);
	}

	.cat-tab.active {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
		color: #fff;
		font-weight: 600;
	}

	/* Titles Scroll Container */
	.titles-scroll-container {
		flex: 1;
		overflow-y: auto;
		padding: 16px 24px;
		min-height: 260px;
	}

	.titles-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.title-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: all 0.2s ease;
	}

	.title-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(249, 115, 22, 0.35);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.tag-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.category-badge {
		font-size: 0.68rem;
		font-weight: 700;
		color: #fdba74;
		background: rgba(249, 115, 22, 0.12);
		border: 1px solid rgba(249, 115, 22, 0.25);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.mobile-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.66rem;
		color: #10b981;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.mobile-badge.warning {
		color: #f59e0b;
		background: rgba(245, 158, 11, 0.1);
		border-color: rgba(245, 158, 11, 0.25);
	}

	.ctr-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.74rem;
		font-weight: 800;
		color: #f97316;
		background: rgba(249, 115, 22, 0.1);
		border: 1px solid rgba(249, 115, 22, 0.3);
		padding: 3px 10px;
		border-radius: 20px;
	}

	.card-main-title {
		font-size: 1.05rem;
		font-weight: 800;
		color: #fff;
		line-height: 1.35;
		letter-spacing: -0.01em;
	}

	.formula-desc {
		font-size: 0.76rem;
		color: var(--text-muted, #94a3b8);
		margin: 0;
		line-height: 1.4;
	}

	/* Thumbnail Synergy Box */
	.thumbnail-synergy-box {
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(56, 189, 248, 0.15);
		border-radius: 8px;
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.thumb-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.7rem;
		font-weight: 600;
		color: #38bdf8;
	}

	.thumb-content {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 12px;
		font-size: 0.74rem;
	}

	.thumb-visual {
		color: var(--text-secondary, #cbd5e1);
	}

	.thumb-visual span {
		color: var(--text-muted, #94a3b8);
	}

	.thumb-overlay {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.thumb-overlay span {
		color: var(--text-muted, #94a3b8);
	}

	.thumb-badge-text {
		background: #ef4444;
		color: #fff;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		font-weight: 800;
	}

	/* Card Actions */
	.card-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 4px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 8px;
		font-size: 0.76rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.copy-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--text-secondary, #cbd5e1);
	}

	.copy-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	.use-title-btn {
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: #34d399;
	}

	.use-title-btn:hover {
		background: rgba(16, 185, 129, 0.22);
		border-color: #10b981;
		color: #fff;
	}

	.text-green {
		color: #10b981;
	}

	.use-script-btn {
		background: rgba(56, 189, 248, 0.12);
		border: 1px solid rgba(56, 189, 248, 0.3);
		color: #38bdf8;
	}

	.use-script-btn:hover {
		background: rgba(56, 189, 248, 0.22);
		border-color: #38bdf8;
		color: #fff;
	}

	/* Loading & Empty States */
	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 24px;
		text-align: center;
		gap: 10px;
	}

	.loading-spinner {
		width: 36px;
		height: 36px;
		border: 3px solid rgba(249, 115, 22, 0.2);
		border-top-color: #f97316;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 0.9rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.loading-sub {
		font-size: 0.74rem;
		color: var(--text-muted, #94a3b8);
	}

	.empty-state p {
		font-size: 0.84rem;
		color: var(--text-muted, #94a3b8);
		margin: 0;
	}

	.error-banner {
		margin: 12px 24px 0;
		padding: 10px 14px;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 0.78rem;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* Modal Footer */
	.modal-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 24px;
		background: rgba(255, 255, 255, 0.02);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.footer-tip {
		font-size: 0.74rem;
		color: var(--text-muted, #94a3b8);
		max-width: 680px;
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		color: var(--text-secondary, #cbd5e1);
		font-size: 0.8rem;
		padding: 6px 16px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
	}

	:global(.spin) {
		animation: spin 1s linear infinite;
	}
</style>
