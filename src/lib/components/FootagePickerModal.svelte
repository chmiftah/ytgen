<script>
	import { onMount } from 'svelte';
	import { X, Search, Check, Film, RefreshCw, Sparkles } from 'lucide-svelte';

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
						<p>Pilih footage 16:9 landscape dari Pexels atau pustaka stok terkurasi.</p>
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

			<!-- Footage Grid -->
			<div class="videos-grid">
				{#if isSearching}
					<div class="loading-state">
						<RefreshCw size={24} class="spin" color="var(--primary)" />
						<p>Mengambil footage video landscape...</p>
					</div>
				{:else if videos.length === 0}
					<div class="empty-state">
						<p>Tidak ada footage yang ditemukan untuk "{searchQuery}". Coba kata kunci lain.</p>
					</div>
				{:else}
					{#each videos as vid}
						<button 
							type="button"
							class="video-card" 
							onclick={() => select(vid)}
							onmouseenter={() => activeHoverVideo = vid.id}
							onmouseleave={() => activeHoverVideo = null}
						>
							<div class="thumb-container">
								{#if activeHoverVideo === vid.id && vid.videoUrl}
									<video src={vid.videoUrl} autoplay loop muted playsinline class="card-media"></video>
								{:else}
									<img src={vid.thumbnail} alt={vid.title} class="card-media" />
								{/if}

								<div class="dur-badge">{vid.duration}s</div>
								<div class="select-overlay">
									<Check size={20} color="white" />
									<span>Pilih Clip Ini</span>
								</div>
							</div>

							<div class="card-info">
								<h4 class="vid-title" title={vid.title}>{vid.title}</h4>
								<span class="vid-author">{vid.author || 'Stock Footage'}</span>
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
