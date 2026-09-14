<script>
	import { Film, Mic, Trash2, ChevronUp, ChevronDown, Plus, Replace, Volume2, CheckCircle2, Bookmark } from 'lucide-svelte';

	let {
		scenes = $bindable([]),
		activeSceneIndex = $bindable(0),
		onOpenFootagePicker,
		onRegenerateVoice,
		onAddScene
	} = $props();

	function selectScene(index) {
		activeSceneIndex = index;
	}

	function moveScene(index, direction) {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= scenes.length) return;
		const temp = scenes[index];
		scenes[index] = scenes[newIndex];
		scenes[newIndex] = temp;
		activeSceneIndex = newIndex;
	}

	function deleteScene(index) {
		if (scenes.length <= 1) return;
		scenes = scenes.filter((_, i) => i !== index);
		if (activeSceneIndex >= scenes.length) {
			activeSceneIndex = scenes.length - 1;
		}
	}

	function addChapter(index) {
		const existingChapters = scenes.slice(0, index).filter(s => s.chapter).length;
		const num = existingChapters + 1;
		scenes[index].chapter = {
			number: num,
			tag: `BAB ${String(num).padStart(2, '0')}`,
			title: `Bab ${num}`,
			subtitle: 'Pengantar topik pada segmen ini',
			style: 'center'
		};
	}

	function removeChapter(index) {
		scenes[index].chapter = null;
	}
</script>

<div class="storyboard-panel glass-panel">
	<div class="storyboard-header">
		<div class="title-group">
			<div class="icon-wrap">
				<Film size={18} color="var(--accent-cyan)" />
			</div>
			<div>
				<h3 class="panel-title">2. Storyboard Adegan ({scenes.length} Scene)</h3>
				<p class="panel-desc">Sesuaikan footage video, naskah per scene, atau re-generate voiceover jika diperlukan.</p>
			</div>
		</div>

		<button class="btn btn-secondary btn-sm" onclick={onAddScene}>
			<Plus size={15} />
			<span>Tambah Scene</span>
		</button>
	</div>

	<!-- Scene Cards List -->
	<div class="scenes-list">
		{#if scenes.length === 0}
			<div class="empty-state">
				<p>Belum ada adegan. Masukkan naskah di atas dan klik <strong>Generate Video</strong>.</p>
			</div>
		{:else}
			{#each scenes as scene, index (scene.id || index)}
				{#if scene.chapter}
					<div class="chapter-divider-banner">
						<div class="chapter-banner-left">
							<span class="chapter-banner-icon">🔖</span>
							<span class="chapter-banner-tag">{scene.chapter.tag || `BAB ${String(scene.chapter.number || 1).padStart(2, '0')}`}</span>
							<span class="chapter-banner-separator">—</span>
							<input 
								type="text" 
								class="chapter-title-input" 
								bind:value={scene.chapter.title} 
								placeholder="Judul Bab (contoh: AWAL MULA REVOLUSI)"
								title="Klik untuk edit Judul Bab"
							/>
						</div>
						<div class="chapter-banner-right">
							<input 
								type="text" 
								class="chapter-sub-input" 
								bind:value={scene.chapter.subtitle} 
								placeholder="Subtitle / Ringkasan bab..."
								title="Klik untuk edit Subtitle Bab"
							/>
							<button 
								type="button" 
								class="chapter-remove-btn" 
								onclick={() => removeChapter(index)}
								title="Hapus Penanda Bab ini"
							>
								&times;
							</button>
						</div>
					</div>
				{/if}

				<div 
					class="scene-card" 
					class:active={activeSceneIndex === index}
					class:has-chapter={!!scene.chapter}
					onclick={() => selectScene(index)}
				>
					<!-- Left: Footage Thumbnail -->
					<div class="card-thumbnail-wrap">
						{#if scene.footage?.thumbnail}
							<img src={scene.footage.thumbnail} alt={scene.visualQuery} class="thumbnail-img" />
						{:else}
							<div class="thumb-placeholder">
								<Film size={20} color="var(--text-muted)" />
							</div>
						{/if}

						<button 
							class="swap-btn" 
							onclick={(e) => { e.stopPropagation(); onOpenFootagePicker(index); }}
							title="Cari & Ganti Footage Pexels"
						>
							<Replace size={13} />
							<span>Ganti</span>
						</button>

						<div class="duration-badge">
							{(scene.audioDuration || scene.estimatedDuration || 5).toFixed(1)}s
						</div>
					</div>

					<!-- Middle: Content & Script Text -->
					<div class="card-content">
						<div class="card-top-meta">
							<span class="scene-num">SCENE {index + 1}</span>
							<span class="query-badge" title="Pexels Search Query">
								🔍 {scene.visualQuery || 'Cinematic'}
							</span>
							{#if scene.voiceAudioUrl}
								<span class="voice-ready-badge" title="Audio voiceover siap">
									<CheckCircle2 size={12} color="var(--highlight-green)" />
									<span>Voice Ready</span>
								</span>
							{/if}
							{#if !scene.chapter}
								<button 
									type="button" 
									class="btn-add-chapter" 
									onclick={(e) => { e.stopPropagation(); addChapter(index); }}
									title="Tandai adegan ini sebagai Awal Bab Baru"
								>
									<Bookmark size={11} />
									<span>+ Bab</span>
								</button>
							{/if}
						</div>

						<textarea
							class="narration-input"
							bind:value={scene.narration}
							rows={2}
							onclick={(e) => e.stopPropagation()}
							placeholder="Teks narasi untuk adegan ini..."
						></textarea>
					</div>

					<!-- Right: Actions -->
					<div class="card-actions" onclick={(e) => e.stopPropagation()}>
						<button 
							class="action-btn" 
							onclick={() => onRegenerateVoice(index)} 
							title="Regenerate Voiceover"
						>
							<Mic size={14} color="var(--primary)" />
						</button>

						<button 
							class="action-btn" 
							disabled={index === 0} 
							onclick={() => moveScene(index, -1)}
							title="Geser ke atas"
						>
							<ChevronUp size={14} />
						</button>

						<button 
							class="action-btn" 
							disabled={index === scenes.length - 1} 
							onclick={() => moveScene(index, 1)}
							title="Geser ke bawah"
						>
							<ChevronDown size={14} />
						</button>

						<button 
							class="action-btn danger" 
							disabled={scenes.length <= 1} 
							onclick={() => deleteScene(index)}
							title="Hapus adegan"
						>
							<Trash2 size={14} />
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.storyboard-panel {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.storyboard-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.icon-wrap {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background: rgba(6, 182, 212, 0.15);
		border: 1px solid rgba(6, 182, 212, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.panel-title {
		font-size: 1.15rem;
		font-weight: 700;
	}

	.panel-desc {
		font-size: 0.825rem;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.scenes-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-height: 480px;
		overflow-y: auto;
		padding-right: 6px;
	}

	.empty-state {
		padding: 36px;
		text-align: center;
		color: var(--text-muted);
		background: rgba(255, 255, 255, 0.02);
		border: 1px dashed var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	.scene-card {
		display: flex;
		align-items: stretch;
		gap: 14px;
		padding: 12px;
		background: #0f1626;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.scene-card:hover {
		background: #141c30;
		border-color: rgba(255, 255, 255, 0.15);
	}

	.scene-card.active {
		border-color: var(--primary);
		box-shadow: 0 0 0 1px var(--primary), 0 4px 16px var(--primary-glow);
		background: #151f36;
	}

	/* Thumbnail */
	.card-thumbnail-wrap {
		position: relative;
		width: 140px;
		height: 80px;
		border-radius: var(--radius-md);
		overflow: hidden;
		flex-shrink: 0;
		background: #090e18;
	}

	.thumbnail-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumb-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.swap-btn {
		position: absolute;
		bottom: 4px;
		left: 4px;
		padding: 3px 8px;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		border-radius: var(--radius-sm);
		font-size: 0.7rem;
		font-weight: 600;
		color: #e2e8f0;
		display: flex;
		align-items: center;
		gap: 4px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		transition: all 0.15s ease;
	}

	.swap-btn:hover {
		background: var(--primary);
		border-color: var(--primary);
	}

	.duration-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		padding: 2px 6px;
		background: rgba(0, 0, 0, 0.75);
		border-radius: var(--radius-sm);
		font-size: 0.675rem;
		font-family: var(--font-mono);
		color: #e2e8f0;
	}

	/* Content */
	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.card-top-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.scene-num {
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.query-badge {
		font-size: 0.725rem;
		padding: 2px 8px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-full);
		color: var(--text-secondary);
		max-width: 260px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.voice-ready-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.7rem;
		color: var(--highlight-green);
		font-weight: 600;
	}

	.narration-input {
		width: 100%;
		font-size: 0.875rem;
		line-height: 1.4;
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		resize: none;
	}

	.narration-input:focus {
		background: #090e18;
		border-color: var(--primary);
	}

	/* Actions */
	.card-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		padding-left: 6px;
		border-left: 1px solid var(--border-subtle);
	}

	.action-btn {
		width: 26px;
		height: 26px;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.action-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary);
	}

	.action-btn.danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.15);
		color: var(--danger);
	}

	/* Chapter Divider Banner */
	.chapter-divider-banner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 14px;
		margin-bottom: 6px;
		padding: 8px 14px;
		background: linear-gradient(90deg, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0.03) 100%);
		border: 1px solid rgba(16, 185, 129, 0.28);
		border-left: 4px solid #10b981;
		border-radius: var(--radius-md);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.chapter-banner-left {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.chapter-banner-icon {
		font-size: 0.95rem;
		flex-shrink: 0;
	}

	.chapter-banner-tag {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		color: #10b981;
		background: rgba(16, 185, 129, 0.18);
		padding: 2px 7px;
		border-radius: 4px;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.chapter-banner-separator {
		color: rgba(255, 255, 255, 0.2);
		flex-shrink: 0;
	}

	.chapter-title-input {
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 3px 8px;
		color: #ffffff;
		font-weight: 700;
		font-size: 0.85rem;
		text-transform: uppercase;
		flex: 1;
		min-width: 130px;
		transition: all 0.2s ease;
	}

	.chapter-title-input:hover,
	.chapter-title-input:focus {
		background: rgba(0, 0, 0, 0.4);
		border-color: rgba(16, 185, 129, 0.45);
		outline: none;
	}

	.chapter-banner-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1.2;
	}

	.chapter-sub-input {
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 3px 8px;
		color: rgba(226, 232, 240, 0.75);
		font-size: 0.78rem;
		width: 100%;
		transition: all 0.2s ease;
	}

	.chapter-sub-input:hover,
	.chapter-sub-input:focus {
		background: rgba(0, 0, 0, 0.4);
		border-color: rgba(16, 185, 129, 0.45);
		outline: none;
	}

	.chapter-remove-btn {
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: var(--text-muted);
		font-size: 1.1rem;
		background: transparent;
		flex-shrink: 0;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.chapter-remove-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.scene-card.has-chapter {
		border-color: rgba(16, 185, 129, 0.3);
	}

	.btn-add-chapter {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 7px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border-subtle);
		border-radius: 4px;
		font-size: 0.68rem;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-add-chapter:hover {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.4);
		color: #10b981;
	}

	@media (max-width: 640px) {
		.scene-card {
			flex-direction: column;
		}
		.card-thumbnail-wrap {
			width: 100%;
			height: 120px;
		}
	}
</style>
