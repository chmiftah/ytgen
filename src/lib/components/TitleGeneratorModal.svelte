<script>
	import { 
		X, 
		Flame, 
		Sparkles, 
		Copy, 
		Check, 
		RefreshCw, 
		Smartphone, 
		Layers, 
		BookOpen, 
		Wand2, 
		ArrowRight, 
		FileText,
		CheckCircle2,
		AlertCircle,
		Image as ImageIcon
	} from 'lucide-svelte';

	let {
		isOpen = false,
		deepseekApiKey = '',
		activeScript = '',
		onSelectTitleForScript,
		onClose
	} = $props();

	let inputMode = $state('topic'); // 'topic' | 'script'
	let topicInput = $state('');
	let selectedCategory = $state('all'); // 'all' | 'curiosity_gap' | 'short_punchy' | 'documentary' | 'contrast' | 'high_stakes'
	let isGenerating = $state(false);
	let titles = $state([]);
	let copiedTitleIndex = $state(null);
	let errorMessage = $state('');

	const QUICK_PROMPTS = [
		'Konspirasi & Arsip Rahasia',
		'Kejatuhan Raksasa Bisnis',
		'Misteri Luar Angkasa & Fisika',
		'Eksperimen Gelap AI Modern',
		'Psikologi Manipulasi Media Sosial'
	];

	$effect(() => {
		if (isOpen) {
			if (activeScript && activeScript.trim().length > 50 && !topicInput) {
				inputMode = 'script';
			}
			if (titles.length === 0) {
				handleGenerateTitles();
			}
		}
	});

	let filteredTitles = $derived.by(() => {
		if (selectedCategory === 'all') return titles;
		return titles.filter(t => t.category === selectedCategory);
	});

	async function handleGenerateTitles() {
		isGenerating = true;
		errorMessage = '';

		try {
			const res = await fetch('/api/generate-title', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: inputMode === 'topic' ? topicInput.trim() : '',
					script: inputMode === 'script' || !topicInput ? activeScript : '',
					apiKey: deepseekApiKey
				})
			});

			const data = await res.json();
			if (data.success && Array.isArray(data.titles) && data.titles.length > 0) {
				titles = data.titles;
			} else {
				throw new Error(data.error || 'Gagal menghasilkan judul viral');
			}
		} catch (err) {
			console.warn('Title generator error:', err);
			errorMessage = err.message || 'Terjadi kesalahan saat membuat judul viral';
		} finally {
			isGenerating = false;
		}
	}

	function copyToClipboard(text, index) {
		navigator.clipboard.writeText(text).then(() => {
			copiedTitleIndex = index;
			setTimeout(() => {
				copiedTitleIndex = null;
			}, 2000);
		});
	}

	function handleUseForScript(titleText) {
		if (onSelectTitleForScript) {
			onSelectTitleForScript(titleText);
			onClose();
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose} role="presentation">
		<div class="modal-card glass-panel" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-left">
					<div class="icon-badge">
						<Flame size={20} color="#f97316" />
					</div>
					<div>
						<h2 class="title">YouTube Viral Title Engineering</h2>
						<p class="subtitle">10 Formula Judul Ber-CTR Tinggi (High Click-Through Rate) Teruji Algoritma YouTube</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose} aria-label="Tutup modal">
					<X size={18} />
				</button>
			</div>

			<!-- Source Mode Toggle & Input -->
			<div class="input-section">
				<div class="toggle-pills">
					<button 
						type="button" 
						class="toggle-pill" 
						class:active={inputMode === 'topic'}
						onclick={() => inputMode = 'topic'}
					>
						<Sparkles size={13} />
						<span>Berdasarkan Topik / Kata Kunci</span>
					</button>
					<button 
						type="button" 
						class="toggle-pill" 
						class:active={inputMode === 'script'}
						onclick={() => inputMode = 'script'}
						disabled={!activeScript || activeScript.trim().length < 30}
						title={!activeScript ? 'Tulis atau generate naskah terlebih dahulu di editor' : ''}
					>
						<FileText size={13} />
						<span>Ekstrak Otomatis dari Naskah Aktif ({activeScript ? activeScript.trim().split(/\s+/).length : 0} kata)</span>
					</button>
				</div>

				{#if inputMode === 'topic'}
					<div class="topic-input-row">
						<input 
							type="text" 
							bind:value={topicInput} 
							placeholder="Contoh: Skandal FTX, Misteri Kapal Hantu, Bahaya Tersembunyi AI..."
							class="topic-text-input"
							onkeydown={(e) => { if (e.key === 'Enter') handleGenerateTitles(); }}
						/>
						<button 
							type="button" 
							class="btn-generate-main" 
							onclick={handleGenerateTitles} 
							disabled={isGenerating}
						>
							{#if isGenerating}
								<RefreshCw size={15} class="spin" />
								<span>Menganalisis...</span>
							{:else}
								<Flame size={15} color="#f97316" />
								<span>Riset Judul Viral</span>
							{/if}
						</button>
					</div>

					<div class="quick-tags">
						<span class="quick-label">Inspirasi Cepat:</span>
						{#each QUICK_PROMPTS as qp}
							<button 
								type="button" 
								class="tag-btn" 
								onclick={() => { topicInput = qp; handleGenerateTitles(); }}
							>
								{qp}
							</button>
						{/each}
					</div>
				{:else}
					<div class="script-info-box">
						<div class="script-snippet">
							<strong>Naskah yang Dianalisis:</strong>
							<p>"{activeScript.slice(0, 180)}..."</p>
						</div>
						<button 
							type="button" 
							class="btn-generate-main" 
							onclick={handleGenerateTitles} 
							disabled={isGenerating}
						>
							{#if isGenerating}
								<RefreshCw size={15} class="spin" />
								<span>Meracik Judul...</span>
							{:else}
								<Flame size={15} color="#f97316" />
								<span>Buat Judul dari Naskah Ini</span>
							{/if}
						</button>
					</div>
				{/if}
			</div>

			<!-- Category Filter Tabs -->
			<div class="categories-bar">
				<button 
					type="button" 
					class="cat-tab" 
					class:active={selectedCategory === 'all'}
					onclick={() => selectedCategory = 'all'}
				>
					Semua ({titles.length})
				</button>
				<button 
					type="button" 
					class="cat-tab" 
					class:active={selectedCategory === 'curiosity_gap'}
					onclick={() => selectedCategory = 'curiosity_gap'}
				>
					🎯 Curiosity Gap
				</button>
				<button 
					type="button" 
					class="cat-tab" 
					class:active={selectedCategory === 'short_punchy'}
					onclick={() => selectedCategory = 'short_punchy'}
				>
					⚡ Short & Punchy (&lt;50 Karakter)
				</button>
				<button 
					type="button" 
					class="cat-tab" 
					class:active={selectedCategory === 'documentary'}
					onclick={() => selectedCategory = 'documentary'}
				>
					🏛️ Dokumenter Otoritatif
				</button>
				<button 
					type="button" 
					class="cat-tab" 
					class:active={selectedCategory === 'contrast'}
					onclick={() => selectedCategory = 'contrast'}
				>
					🧠 Kontras & Paradoks
				</button>
				<button 
					type="button" 
					class="cat-tab" 
					class:active={selectedCategory === 'high_stakes'}
					onclick={() => selectedCategory = 'high_stakes'}
				>
					🔥 High Stakes
				</button>
			</div>

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
						<p class="loading-text">Sedang meriset 10 formula judul viral dengan algoritma CTR YouTube...</p>
						<span class="loading-sub">Memvalidasi panjang karakter mobile, curiosity gap, dan sinergi visual thumbnail</span>
					</div>
				{:else if filteredTitles.length === 0}
					<div class="empty-state">
						<Layers size={36} color="var(--text-muted)" />
						<p>Tidak ada judul untuk kategori ini.</p>
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
											<span>Salin Judul</span>
										{/if}
									</button>

									<button 
										type="button" 
										class="action-btn use-script-btn"
										onclick={() => handleUseForScript(item.title)}
										title="Buka AI Script Generator dengan topik judul ini"
									>
										<Sparkles size={14} color="#38bdf8" />
										<span>Buat Naskah dari Judul Ini</span>
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
					💡 <strong>Tips Pro:</strong> Judul di bawah 60 karakter memiliki retensi klik 28% lebih tinggi di aplikasi YouTube Mobile.
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
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal-card {
		width: 100%;
		max-width: 860px;
		max-height: 90vh;
		background: #0f172a;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--radius-lg, 16px);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(249, 115, 22, 0.1);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes modalPop {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 18px 24px;
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
		border: 1px solid rgba(249, 115, 22, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.title {
		font-size: 1.15rem;
		font-weight: 700;
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

	/* Input Section */
	.input-section {
		padding: 16px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(15, 23, 42, 0.6);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.toggle-pills {
		display: flex;
		gap: 8px;
	}

	.toggle-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		color: var(--text-secondary, #cbd5e1);
		font-size: 0.76rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-pill:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
	}

	.toggle-pill.active {
		background: rgba(249, 115, 22, 0.18);
		border-color: rgba(249, 115, 22, 0.4);
		color: #fdba74;
	}

	.toggle-pill:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.topic-input-row {
		display: flex;
		gap: 10px;
	}

	.topic-text-input {
		flex: 1;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		padding: 10px 14px;
		color: #fff;
		font-size: 0.88rem;
		transition: border-color 0.2s;
	}

	.topic-text-input:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
	}

	.btn-generate-main {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 18px;
		background: linear-gradient(135deg, #ea580c, #f97316);
		border: none;
		border-radius: 10px;
		color: #fff;
		font-size: 0.84rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
	}

	.btn-generate-main:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
	}

	.btn-generate-main:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.quick-tags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
	}

	.quick-label {
		font-size: 0.72rem;
		color: var(--text-muted, #94a3b8);
	}

	.tag-btn {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		color: var(--text-muted, #94a3b8);
		font-size: 0.72rem;
		padding: 3px 8px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.tag-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		border-color: rgba(255, 255, 255, 0.15);
	}

	.script-info-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 10px 14px;
	}

	.script-snippet strong {
		font-size: 0.76rem;
		color: #38bdf8;
		display: block;
	}

	.script-snippet p {
		font-size: 0.78rem;
		color: var(--text-secondary, #cbd5e1);
		margin: 2px 0 0 0;
		font-style: italic;
	}

	/* Categories Bar */
	.categories-bar {
		display: flex;
		gap: 6px;
		padding: 10px 24px;
		background: rgba(0, 0, 0, 0.2);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		overflow-x: auto;
	}

	.cat-tab {
		padding: 5px 12px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 8px;
		color: var(--text-muted, #94a3b8);
		font-size: 0.76rem;
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
		padding: 18px 24px;
		min-height: 280px;
	}

	.titles-grid {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.title-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		transition: all 0.2s ease;
	}

	.title-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(249, 115, 22, 0.3);
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
		font-size: 0.7rem;
		font-weight: 600;
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
		font-size: 0.68rem;
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
		font-weight: 700;
		color: #f97316;
		background: rgba(249, 115, 22, 0.1);
		border: 1px solid rgba(249, 115, 22, 0.3);
		padding: 3px 10px;
		border-radius: 20px;
	}

	.card-main-title {
		font-size: 1.05rem;
		font-weight: 700;
		color: #fff;
		line-height: 1.35;
		letter-spacing: -0.01em;
	}

	.formula-desc {
		font-size: 0.78rem;
		color: var(--text-muted, #94a3b8);
		margin: 0;
		line-height: 1.4;
	}

	/* Thumbnail Synergy Box */
	.thumbnail-synergy-box {
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(56, 189, 248, 0.15);
		border-radius: 8px;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.thumb-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.72rem;
		font-weight: 600;
		color: #38bdf8;
	}

	.thumb-content {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 12px;
		font-size: 0.76rem;
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
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		font-weight: 800;
	}

	/* Card Actions */
	.card-actions {
		display: flex;
		justify-content: flex-end;
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
		padding: 40px 20px;
		text-align: center;
		gap: 12px;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(249, 115, 22, 0.2);
		border-top-color: #f97316;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-text {
		font-size: 0.9rem;
		color: #fff;
		font-weight: 600;
		margin: 0;
	}

	.loading-sub {
		font-size: 0.76rem;
		color: var(--text-muted, #94a3b8);
	}

	.spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 10px 24px 0 24px;
		padding: 10px 14px;
		background: rgba(239, 68, 68, 0.12);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 0.8rem;
	}

	/* Modal Footer */
	.modal-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.footer-tip {
		font-size: 0.74rem;
		color: var(--text-muted, #94a3b8);
	}

	.footer-tip strong {
		color: #facc15;
	}

	.btn-secondary {
		padding: 7px 18px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		color: var(--text-secondary, #cbd5e1);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}
</style>
