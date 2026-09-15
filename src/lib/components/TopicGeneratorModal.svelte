<script>
	import {
		X,
		Lightbulb,
		Sparkles,
		Compass,
		Shuffle,
		Copy,
		Check,
		ArrowRight,
		BookOpen,
		Flame,
		Eye,
		Clock,
		Search,
		Layers
	} from 'lucide-svelte';

	let {
		isOpen = false,
		deepseekApiKey = '',
		onSelectTopic,
		onClose
	} = $props();

	const CATEGORIES = [
		{ id: 'all', label: '🎲 Semua / Acak', emoji: '🎲', desc: 'Campuran topik tren viral tertinggi' },
		{ id: 'cosmos_science', label: 'Misteri Kosmos', emoji: '🌌', desc: 'Fisika kuantum, black hole, & anomali luar angkasa' },
		{ id: 'history_classified', label: 'Arsip Rahasia', emoji: '🕵️', desc: 'Dokumen CIA declassified & misteri sejarah hilang' },
		{ id: 'dark_psychology', label: 'Psikologi Gelap', emoji: '🧠', desc: 'Biokimia dopamin, jebakan pikiran, & eksistensi' },
		{ id: 'geopolitics_business', label: 'Geopolitik & Uang', emoji: '🌐', desc: 'Skandal megakorporasi, perang chip, & moneter' },
		{ id: 'extreme_ai', label: 'Masa Depan AI', emoji: '🤖', desc: 'Titik singularitas, autonomous weapons, & AGI' },
		{ id: 'critical_moments', label: 'Detik Krusial', emoji: '⚔️', desc: '24 jam sebelum bencana & keputusan pengubah takdir' }
	];

	let selectedCategory = $state('all');
	let keywordInput = $state('');
	let topics = $state([]);
	let isLoading = $state(false);
	let errorMessage = $state('');
	let copiedId = $state(null);

	async function fetchTopics(categoryOverride, keywordOverride) {
		isLoading = true;
		errorMessage = '';

		const cat = categoryOverride !== undefined ? categoryOverride : selectedCategory;
		const kw = keywordOverride !== undefined ? keywordOverride : keywordInput;

		try {
			const res = await fetch('/api/generate-topic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: cat,
					keyword: kw.trim(),
					apiKey: deepseekApiKey
				})
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || `HTTP ${res.status}`);
			}

			const data = await res.json();
			topics = data.topics || [];
		} catch (err) {
			console.error('Error fetching topics:', err);
			errorMessage = 'Gagal memuat ide topik. Silakan coba lagi.';
		} finally {
			isLoading = false;
		}
	}

	function handleCategoryClick(catId) {
		selectedCategory = catId;
		fetchTopics(catId, keywordInput);
	}

	function handleShuffle() {
		fetchTopics('all', '');
	}

	function copyTopicTitle(item) {
		navigator.clipboard.writeText(`${item.title}\n\nHook 10 Detik:\n${item.hook10s}`);
		copiedId = item.id || item.title;
		setTimeout(() => {
			if (copiedId === (item.id || item.title)) copiedId = null;
		}, 2000);
	}

	function useTopic(item) {
		if (onSelectTopic) {
			onSelectTopic(item);
		}
	}

	// Trigger initial load when modal opens
	$effect(() => {
		if (isOpen && topics.length === 0 && !isLoading) {
			fetchTopics('all', '');
		}
	});

	function getHookFormulaBadge(formula) {
		switch (formula) {
			case 'curiosity_gap':
				return { label: '🎯 Curiosity Gap', color: '#38bdf8' };
			case 'high_stakes':
				return { label: '⚡ High Stakes', color: '#f43f5e' };
			case 'mystery_investigative':
				return { label: '🕵️ Investigatif', color: '#a855f7' };
			case 'in_media_res':
				return { label: '🎬 In-Media-Res', color: '#f59e0b' };
			case 'provocative_question':
				return { label: '💡 Pertanyaan Provokatif', color: '#10b981' };
			default:
				return { label: '🔥 Hook Viral', color: '#f59e0b' };
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose} role="presentation">
		<div class="modal-card" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<!-- Header -->
			<div class="modal-header">
				<div class="title-wrap">
					<div class="icon-badge">
						<Lightbulb size={22} color="#facc15" />
					</div>
					<div>
						<div class="badge-row">
							<h2 class="modal-title">Generator Ide & Topik Viral YouTube</h2>
							<span class="pill-high-retention">
								<Flame size={12} /> High Retention & CTR
							</span>
						</div>
						<p class="modal-desc">
							Rekomendasi topik teruji yang 100% klop dengan stock footage sinematik, vokal trailer bioskop, dan formula hook 10 detik.
						</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose} title="Tutup Modal">&times;</button>
			</div>

			<!-- Category Selector Pills -->
			<div class="filter-section">
				<div class="category-pills">
					{#each CATEGORIES as cat}
						<button
							type="button"
							class="cat-pill-btn"
							class:active={selectedCategory === cat.id}
							onclick={() => handleCategoryClick(cat.id)}
							title={cat.desc}
						>
							<span class="cat-emoji">{cat.emoji}</span>
							<span class="cat-label">{cat.label}</span>
						</button>
					{/each}
				</div>

				<!-- Search & Shuffle Toolbar -->
				<div class="search-toolbar">
					<div class="search-input-wrap">
						<Search size={15} color="var(--text-muted)" />
						<input
							type="text"
							class="search-input"
							placeholder="Fokus kata kunci opsional (cth: Black hole, CIA, Keuangan, AI, Indonesia)..."
							bind:value={keywordInput}
							onkeydown={(e) => e.key === 'Enter' && fetchTopics()}
						/>
						{#if keywordInput}
							<button class="clear-input-btn" onclick={() => { keywordInput = ''; fetchTopics(); }}>&times;</button>
						{/if}
					</div>

					<div class="toolbar-actions">
						<button
							type="button"
							class="btn btn-secondary btn-sm"
							onclick={() => fetchTopics()}
							disabled={isLoading}
						>
							<Sparkles size={14} color="#38bdf8" />
							<span>Cari Ide</span>
						</button>
						<button
							type="button"
							class="btn btn-shuffle btn-sm"
							onclick={handleShuffle}
							disabled={isLoading}
							title="Acak topik lain secara instan"
						>
							<Shuffle size={14} />
							<span>Acak Topik</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Topics List -->
			<div class="modal-body">
				{#if isLoading}
					<div class="loading-state">
						<div class="spinner"></div>
						<p class="loading-text">Sedang meracik ide topik ber-CTR tinggi & formula hook 10 detik...</p>
					</div>
				{:else if errorMessage}
					<div class="error-banner">
						<p>{errorMessage}</p>
						<button class="btn btn-secondary btn-sm" onclick={() => fetchTopics()}>Coba Lagi</button>
					</div>
				{:else if topics.length === 0}
					<div class="empty-state">
						<p>Tidak ada topik yang cocok dengan kata kunci tersebut.</p>
						<button class="btn btn-secondary btn-sm" onclick={() => { keywordInput = ''; selectedCategory = 'all'; fetchTopics(); }}>
							Reset Pencarian
						</button>
					</div>
				{:else}
					<div class="topics-grid">
						{#each topics as item (item.id || item.title)}
							{@const badge = getHookFormulaBadge(item.hookFormula)}
							<div class="topic-card">
								<div class="topic-card-header">
									<div class="topic-category-meta">
										<span class="topic-emoji">{item.emoji || '🎬'}</span>
										<span class="topic-category-name">{item.categoryLabel || 'Topik Pilihan'}</span>
										<span class="topic-angle-badge">{item.angle || 'Curiosity Gap'}</span>
									</div>
									<span class="hook-badge" style="color: {badge.color}; border-color: {badge.color}40; background: {badge.color}15;">
										{badge.label}
									</span>
								</div>

								<h3 class="topic-title">{item.title}</h3>

								<!-- Hook 10 Detik Preview -->
								<div class="hook-box">
									<div class="hook-box-label">
										<Eye size={12} />
										<span>Formula Hook 10 Detik Pertama:</span>
									</div>
									<p class="hook-quote">"{item.hook10s}"</p>
								</div>

								<!-- Chapter Outline Preview -->
								{#if item.chapters && item.chapters.length > 0}
									<div class="chapters-preview">
										<div class="chapters-label">
											<Layers size={12} />
											<span>Struktur Bab Naskah:</span>
										</div>
										<div class="chapters-chips">
											{#each item.chapters as ch}
												<div class="chapter-chip" title={ch.description || ch.title}>
													<span class="chapter-chip-num">BAB {ch.number}:</span>
													<span class="chapter-chip-title">{ch.title}</span>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Card Actions -->
								<div class="topic-card-footer">
									<button
										type="button"
										class="btn-copy-topic"
										onclick={() => copyTopicTitle(item)}
										title="Salin Judul dan Hook"
									>
										{#if copiedId === (item.id || item.title)}
											<Check size={14} color="#10b981" />
											<span style="color: #10b981;">Tersalin</span>
										{:else}
											<Copy size={14} />
											<span>Salin</span>
										{/if}
									</button>

									<button
										type="button"
										class="btn-use-topic"
										onclick={() => useTopic(item)}
										title="Buat naskah lengkap dari topik ini sekarang"
									>
										<span>🚀 Pakai Topik Ini & Buat Naskah</span>
										<ArrowRight size={14} />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer Note -->
			<div class="modal-footer">
				<div class="footer-hint">
					💡 <strong>Tips Pro:</strong> Klik <em>"Pakai Topik Ini & Buat Naskah"</em> untuk langsung membuka generator naskah AI DeepSeek dengan instruksi hook yang telah diselaraskan.
				</div>
				<button type="button" class="btn btn-secondary btn-sm" onclick={onClose}>
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
		background: rgba(4, 7, 15, 0.85);
		backdrop-filter: blur(8px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		animation: fadeIn 0.2s ease-out;
	}

	.modal-card {
		background: linear-gradient(180deg, #0c1222 0%, #080d19 100%);
		border: 1px solid rgba(250, 204, 21, 0.3);
		border-radius: var(--radius-xl);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.1);
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from { transform: translateY(20px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	/* Header */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.title-wrap {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.icon-badge {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(250, 204, 21, 0.12);
		border: 1px solid rgba(250, 204, 21, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.badge-row {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 800;
		color: #ffffff;
		margin: 0;
	}

	.pill-high-retention {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		background: rgba(244, 63, 94, 0.2);
		color: #fb7185;
		border: 1px solid rgba(244, 63, 94, 0.4);
		border-radius: 9999px;
		font-size: 0.72rem;
		font-weight: 700;
	}

	.modal-desc {
		font-size: 0.82rem;
		color: #94a3b8;
		margin: 3px 0 0;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text-muted);
		font-size: 1.8rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 4px;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #ffffff;
	}

	/* Filter Section */
	.filter-section {
		padding: 16px 24px;
		background: rgba(0, 0, 0, 0.25);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.category-pills {
		display: flex;
		align-items: center;
		gap: 6px;
		overflow-x: auto;
		padding-bottom: 4px;
	}

	.cat-pill-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 9999px;
		color: #cbd5e1;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.18s ease;
	}

	.cat-pill-btn:hover {
		background: rgba(250, 204, 21, 0.15);
		border-color: rgba(250, 204, 21, 0.35);
		color: #ffffff;
	}

	.cat-pill-btn.active {
		background: #facc15;
		color: #0b1120;
		font-weight: 700;
		border-color: #facc15;
		box-shadow: 0 2px 10px rgba(250, 204, 21, 0.35);
	}

	/* Search Toolbar */
	.search-toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.search-input-wrap {
		flex: 1;
		min-width: 260px;
		position: relative;
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-md);
		padding: 0 12px;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		padding: 8px 8px;
		font-size: 0.82rem;
		color: #ffffff;
		outline: none;
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.35);
	}

	.clear-input-btn {
		background: transparent;
		border: none;
		color: var(--text-muted);
		font-size: 1.1rem;
		cursor: pointer;
		padding: 0 4px;
	}

	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.btn-shuffle {
		background: rgba(168, 85, 247, 0.15);
		border: 1px solid rgba(168, 85, 247, 0.4);
		color: #c084fc;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		border-radius: var(--radius-md);
		padding: 6px 12px;
		font-size: 0.78rem;
		transition: all 0.2s ease;
	}

	.btn-shuffle:hover:not(:disabled) {
		background: rgba(168, 85, 247, 0.3);
		color: #ffffff;
		transform: translateY(-1px);
	}

	/* Modal Body & Topic Cards */
	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 20px 24px;
	}

	.topics-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.topic-card {
		background: rgba(15, 23, 42, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-lg);
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		transition: all 0.2s ease;
	}

	.topic-card:hover {
		background: rgba(15, 23, 42, 0.9);
		border-color: rgba(250, 204, 21, 0.4);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(250, 204, 21, 0.08);
	}

	.topic-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
	}

	.topic-category-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.topic-emoji {
		font-size: 1.1rem;
	}

	.topic-category-name {
		font-size: 0.74rem;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.topic-angle-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 2px 7px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		color: #cbd5e1;
	}

	.hook-badge {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 9999px;
		border: 1px solid transparent;
	}

	.topic-title {
		font-size: 1.12rem;
		font-weight: 800;
		color: #ffffff;
		line-height: 1.35;
		margin: 0;
	}

	/* Hook Box */
	.hook-box {
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(250, 204, 21, 0.2);
		border-left: 3px solid #facc15;
		border-radius: var(--radius-md);
		padding: 10px 14px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.hook-box-label {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.72rem;
		font-weight: 700;
		color: #facc15;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.hook-quote {
		font-size: 0.85rem;
		line-height: 1.45;
		color: #e2e8f0;
		font-style: italic;
		margin: 0;
	}

	/* Chapter Outline Preview */
	.chapters-preview {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.chapters-label {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.72rem;
		font-weight: 600;
		color: #94a3b8;
	}

	.chapters-chips {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.chapter-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		font-size: 0.74rem;
	}

	.chapter-chip-num {
		font-weight: 700;
		color: #38bdf8;
		font-family: var(--font-mono);
	}

	.chapter-chip-title {
		color: #cbd5e1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200px;
	}

	/* Topic Card Footer */
	.topic-card-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 4px;
		padding-top: 10px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.btn-copy-topic {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #cbd5e1;
		font-size: 0.76rem;
		font-weight: 600;
		padding: 6px 12px;
		border-radius: var(--radius-md);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-copy-topic:hover {
		background: rgba(255, 255, 255, 0.12);
		color: #ffffff;
	}

	.btn-use-topic {
		background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
		color: #0b1120;
		font-size: 0.8rem;
		font-weight: 800;
		padding: 7px 16px;
		border: none;
		border-radius: var(--radius-md);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		box-shadow: 0 2px 10px rgba(250, 204, 21, 0.3);
		transition: all 0.2s ease;
	}

	.btn-use-topic:hover {
		background: linear-gradient(135deg, #fde047 0%, #facc15 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(250, 204, 21, 0.45);
	}

	/* Loading & Empty states */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		gap: 14px;
	}

	.spinner {
		width: 36px;
		height: 36px;
		border: 3px solid rgba(250, 204, 21, 0.2);
		border-top-color: #facc15;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-text {
		color: #94a3b8;
		font-size: 0.86rem;
	}

	.error-banner,
	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: #94a3b8;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	/* Footer */
	.modal-footer {
		padding: 12px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.footer-hint {
		font-size: 0.76rem;
		color: #94a3b8;
		line-height: 1.3;
	}
</style>
