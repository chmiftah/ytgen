<script>
	import { Settings, Type, Download, Video, Flame } from 'lucide-svelte';

	let { onOpenSettings, onOpenSubtitleStyle, onOpenExport, onOpenTitleGenerator, isRendering = false } = $props();
</script>

<header class="navbar">
	<div class="nav-left">
		<div class="brand">
			<div class="brand-icon">
				<Video size={16} />
			</div>
			<div class="brand-title">
				<span class="brand-name">YouTube Long</span>
				<span class="brand-sub">Studio</span>
			</div>
		</div>
		<div class="nav-meta">
			<span class="meta-dot"></span>
			<span>16:9 · 1080p</span>
		</div>
	</div>

	<div class="nav-right">
		{#if onOpenTitleGenerator}
			<button class="btn btn-sm nav-btn" onclick={onOpenTitleGenerator}>
				<Flame size={14} />
				<span>Judul Viral</span>
			</button>
		{/if}
		<button class="btn btn-sm nav-btn" onclick={onOpenSubtitleStyle}>
			<Type size={14} />
			<span>Subtitle</span>
		</button>
		<button class="btn btn-sm nav-btn" onclick={onOpenSettings}>
			<Settings size={14} />
			<span>Settings</span>
		</button>
		<button class="btn btn-sm btn-primary" onclick={onOpenExport} disabled={isRendering}>
			<Download size={14} />
			<span>{isRendering ? 'Rendering...' : 'Export'}</span>
		</button>
	</div>
</header>

<style>
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 10px 20px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--line);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.brand-icon {
		width: 32px;
		height: 32px;
		border-radius: var(--r-md);
		background: var(--bg-card);
		border: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-2);
	}

	.brand-title {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.brand-name {
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.brand-sub {
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: var(--text-3);
		text-transform: uppercase;
	}

	.nav-meta {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: var(--r-full);
		background: var(--bg-card);
		border: 1px solid var(--line);
		font-size: 0.7rem;
		color: var(--text-3);
	}

	.meta-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--success);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.nav-btn {
		background: var(--bg-card);
		border: 1px solid var(--line);
		color: var(--text-2);
	}
	.nav-btn:hover {
		background: var(--bg-card-hover);
		border-color: var(--line-strong);
		color: var(--text);
	}

	@media (max-width: 860px) {
		.nav-meta { display: none; }
		.brand-sub { display: none; }
	}
</style>
