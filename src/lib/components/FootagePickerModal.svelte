<script>
	import { onMount } from 'svelte';
	import { X, Search, Check, Film, RefreshCw, Sparkles, Folder, Globe } from 'lucide-svelte';

	let {
		isOpen = false,
		sceneIndex = 0,
		initialQuery = '',
		pexelsApiKey = '',
		onSelectFootage,
		onClose
	} = $props();

	let searchQuery = $state('');
	let isSearching = $state(false);
	let videos = $state([]);
	let activeHoverVideo = $state(null);
	let filterTab = $state('all'); // 'all' | 'local' | 'pexels'

	let filteredVideos = $derived.by(() => {
		if (filterTab === 'local') return videos.filter((v) => v.source === 'local');
		if (filterTab === 'pexels') return videos.filter((v) => v.source === 'pexels');
		return videos;
	});

	let localCount = $derived(videos.filter((v) => v.source === 'local').length);
	let pexelsCount = $derived(videos.filter((v) => v.source === 'pexels').length);

	$effect(() => {
		if (isOpen) {
			searchQuery = initialQuery || 'cinematic technology';
			fetchVideos();
		}
	});

	async function fetchVideos() {
		isSearching = true;
		try {
			const res = await fetch('/api/pexels', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: searchQuery,
					apiKey: pexelsApiKey
				})
			});
			const data = await res.json();
			if (data.videos) {
				videos = data.videos;
			}
		} catch (err) {
			console.error('Error fetching footage:', err);
		} finally {
			isSearching = false;
		}
	}

	async function loadAllLocalVideos() {
		filterTab = 'local';
		isSearching = true;
		try {
			const res = await fetch('/api/local-footage');
			const data = await res.json();
			if (data.videos) {
				// Prepend local videos
				const other = videos.filter((v) => v.source !== 'local');
				videos = [...data.videos, ...other];
			}
		} catch (err) {
			console.error('Error loading local catalog:', err);
		} finally {
			isSearching = false;
		}
	}

	function select(video) {
		onSelectFootage(sceneIndex, video);
		onClose();
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose}>
		<div class="modal-container glass-panel" onclick={(e) => e.stopPropagation()}>
			<!-- Header -->
			<div class="modal-header">
				<div class="header-title">
					<Film size={20} color="var(--accent-cyan)" />
					<div>
						<h3>Ganti Footage Video (Scene {sceneIndex + 1})</h3>
						<p>Pilih footage 16:9 landscape dari koleksi lokal SSD atau Pexels online.</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose}>
					<X size={18} />
				</button>
			</div>

			<!-- Search Bar -->
			<form class="search-form" onsubmit={(e) => { e.preventDefault(); fetchVideos(); }}>
				<div class="search-input-wrap">
					<Search size={16} color="var(--text-muted)" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari video landscape... Contoh: cyber city night, mountains drone, stock market"
					/>
				</div>
				<button type="submit" class="btn btn-primary btn-sm" disabled={isSearching}>
					{#if isSearching}
						<RefreshCw size={14} class="spin" />
						<span>Mencari...</span>
					{:else}
						<span>Cari Footage</span>
					{/if}
				</button>
			</form>

			<!-- Filter Tabs Bar -->
			<div class="filter-tabs-bar">
				<button 
					type="button" 
					class="filter-tab-btn" 
					class:active={filterTab === 'all'} 
					onclick={() => filterTab = 'all'}
				>
					<span>Semua ({videos.length})</span>
				</button>

				<button 
					type="button" 
					class="filter-tab-btn" 
					class:active={filterTab === 'local'} 
					onclick={() => {
						if (localCount === 0) loadAllLocalVideos();
						else filterTab = 'local';
					}}
				>
					<Folder size={13} color="var(--highlight-green)" />
					<span>📁 Koleksi Lokal ({localCount})</span>
				</button>

				<button 
					type="button" 
					class="filter-tab-btn" 
					class:active={filterTab === 'pexels'} 
					onclick={() => filterTab = 'pexels'}
				>
					<Globe size={13} color="#38bdf8" />
					<span>🌐 Pexels Online ({pexelsCount})</span>
				</button>

				{#if filterTab === 'local' && localCount === 0}
					<button type="button" class="btn-browse-vault" onclick={loadAllLocalVideos}>
						Muat Semua Bank Footage Lokal
					</button>
				{/if}
			</div>

			<!-- Footage Grid -->
			<div class="videos-grid">
				{#if isSearching}
					<div class="loading-state">
						<RefreshCw size={24} class="spin" color="var(--primary)" />
						<p>Mengambil footage video landscape...</p>
					</div>
				{:else if filteredVideos.length === 0}
					<div class="empty-state">
						<p>Tidak ada footage yang ditemukan untuk kategori ini ({filterTab}).</p>
						{#if filterTab === 'local'}
							<p class="empty-sub">Video yang diunduh saat render otomatis tersimpan ke bank lokal Anda.</p>
							<button type="button" class="btn btn-secondary btn-sm" onclick={() => filterTab = 'all'}>
								Tampilkan Semua Video
							</button>
						{/if}
					</div>
				{:else}
					{#each filteredVideos as vid}
						<button 
							type="button" 
							class="video-card" 
							class:is-local={vid.source === 'local'}
							onclick={() => select(vid)}
							onmouseenter={() => activeHoverVideo = vid.id}
							onmouseleave={() => activeHoverVideo = null}
						>
							<div class="thumb-container">
								{#if activeHoverVideo === vid.id && vid.videoUrl}
									<video src={vid.videoUrl} autoplay loop muted playsinline class="card-media"></video>
								{:else if vid.thumbnail}
									<img src={vid.thumbnail} alt={vid.title} class="card-media" />
								{:else}
									<div class="thumb-fallback">
										<Film size={24} color="var(--text-muted)" />
									</div>
								{/if}

								<div class="dur-badge">{vid.duration}s</div>

								<!-- Source Badge -->
								{#if vid.source === 'local'}
									<div class="source-badge local">📁 Lokal SSD</div>
								{:else if vid.source === 'pexels'}
									<div class="source-badge pexels">🌐 Pexels</div>
								{/if}

								<div class="select-overlay">
									<Check size={20} color="white" />
									<span>Pilih Clip Ini</span>
								</div>
							</div>

							<div class="card-info">
								<h4 class="vid-title" title={vid.title}>{vid.title}</h4>
								<span class="vid-author">
									{vid.source === 'local' ? 'Tersimpan di Disk Lokal' : (vid.author || 'Pexels Creator')}
								</span>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}


<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(4, 7, 13, 0.82);
		backdrop-filter: blur(8px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.modal-container {
		width: 100%;
		max-width: 860px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background: #0d1322;
		border: 1px solid var(--border-bright);
		box-shadow: var(--shadow-lg);
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid var(--border-subtle);
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.header-title h3 {
		font-size: 1.15rem;
	}

	.header-title p {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
	}

	.search-form {
		display: flex;
		gap: 10px;
		padding: 16px 24px;
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid var(--border-subtle);
	}

	.search-input-wrap {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10px;
		background: #070a12;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		padding: 0 12px;
	}

	.search-input-wrap input {
		width: 100%;
		border: none;
		background: transparent;
		padding: 10px 0;
		font-size: 0.875rem;
	}

	.search-input-wrap input:focus {
		box-shadow: none;
	}

	/* Filter Tabs Bar */
	.filter-tabs-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 24px;
		background: rgba(0, 0, 0, 0.25);
		border-bottom: 1px solid var(--border-subtle);
		flex-wrap: wrap;
	}

	.filter-tab-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		border-radius: 6px;
		font-size: 0.76rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border-subtle);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.filter-tab-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary);
	}

	.filter-tab-btn.active {
		background: rgba(6, 182, 212, 0.15);
		border-color: var(--accent-cyan);
		color: #fff;
		box-shadow: 0 0 10px rgba(6, 182, 212, 0.25);
	}

	.btn-browse-vault {
		margin-left: auto;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.35);
		color: #34d399;
		padding: 4px 10px;
		border-radius: 6px;
		font-size: 0.72rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-browse-vault:hover {
		background: rgba(16, 185, 129, 0.22);
	}

	.videos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 16px;
		padding: 20px 24px;
		overflow-y: auto;
		max-height: 520px;
	}

	.video-card {
		background: #131b2e;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		text-align: left;
		padding: 0;
		transition: all 0.2s ease;
	}

	.video-card.is-local {
		border-color: rgba(16, 185, 129, 0.35);
	}

	.video-card.is-local:hover {
		border-color: #10b981;
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25);
	}

	.source-badge {
		position: absolute;
		bottom: 6px;
		left: 6px;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.source-badge.local {
		background: rgba(16, 185, 129, 0.9);
		color: #fff;
	}

	.source-badge.pexels {
		background: rgba(14, 165, 233, 0.85);
		color: #fff;
	}

	.thumb-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #090e1a;
	}

	.empty-sub {
		font-size: 0.78rem;
		color: var(--text-secondary);
		margin-top: -6px;
		margin-bottom: 8px;
	}


	.video-card:hover {
		transform: translateY(-2px);
		border-color: var(--primary);
		box-shadow: 0 6px 20px var(--primary-glow);
	}

	.thumb-container {
		position: relative;
		width: 100%;
		padding-top: 56.25%; /* 16:9 ratio */
		background: #000;
		overflow: hidden;
	}

	.card-media {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.dur-badge {
		position: absolute;
		top: 6px;
		right: 6px;
		padding: 2px 6px;
		background: rgba(0, 0, 0, 0.75);
		border-radius: var(--radius-sm);
		font-size: 0.675rem;
		font-family: var(--font-mono);
		color: #e2e8f0;
	}

	.select-overlay {
		position: absolute;
		inset: 0;
		background: rgba(99, 102, 241, 0.85);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		opacity: 0;
		transition: opacity 0.15s ease;
		font-size: 0.8rem;
		font-weight: 700;
		color: white;
	}

	.video-card:hover .select-overlay {
		opacity: 1;
	}

	.card-info {
		padding: 10px 12px;
	}

	.vid-title {
		font-size: 0.8rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.vid-author {
		font-size: 0.725rem;
		color: var(--text-muted);
	}

	.loading-state, .empty-state {
		grid-column: 1 / -1;
		padding: 48px;
		text-align: center;
		color: var(--text-muted);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
</style>
