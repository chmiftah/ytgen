<script>
	import { Play, Settings, Type, Sparkles, Download, Video } from 'lucide-svelte';

	let { onOpenSettings, onOpenSubtitleStyle, onOpenExport, isRendering = false } = $props();
</script>

<header class="navbar">
	<div class="nav-left">
		<div class="brand">
			<div class="brand-icon">
				<Video size={20} color="#f43f5e" />
			</div>
			<div class="brand-title">
				<span class="brand-name">YouTube Long</span>
				<span class="brand-tag">STUDIO</span>
			</div>
		</div>

		<div class="aspect-badge">
			<span class="dot"></span>
			<span>16:9 Widescreen (1080p)</span>
		</div>
	</div>

	<div class="nav-right">
		<button class="btn btn-secondary btn-sm" onclick={onOpenSubtitleStyle}>
			<Type size={16} />
			<span>Gaya Subtitle</span>
		</button>

		<button class="btn btn-secondary btn-sm" onclick={onOpenSettings}>
			<Settings size={16} />
			<span>API Settings</span>
		</button>

		<button 
			class="btn btn-primary btn-sm export-btn" 
			onclick={onOpenExport}
			disabled={isRendering}
		>
			<Download size={16} />
			<span>{isRendering ? 'Rendering...' : 'Export Video'}</span>
		</button>
	</div>
</header>

<style>
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 28px;
		background: rgba(15, 21, 35, 0.85);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--border-subtle);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.brand-icon {
		width: 38px;
		height: 38px;
		border-radius: var(--radius-md);
		background: rgba(244, 63, 94, 0.15);
		border: 1px solid rgba(244, 63, 94, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 15px rgba(244, 63, 94, 0.2);
	}

	.brand-title {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.brand-name {
		font-family: var(--font-heading);
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.brand-tag {
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		background: rgba(99, 102, 241, 0.2);
		color: #a5b4fc;
		border: 1px solid rgba(99, 102, 241, 0.3);
	}

	.aspect-badge {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 5px 12px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--highlight-green);
		box-shadow: 0 0 8px var(--highlight-green);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.export-btn {
		background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
		box-shadow: 0 4px 14px rgba(244, 63, 94, 0.35);
	}

	.export-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
		box-shadow: 0 6px 20px rgba(244, 63, 94, 0.45);
	}

	@media (max-width: 768px) {
		.navbar {
			padding: 12px 16px;
		}
		.aspect-badge {
			display: none;
		}
	}
</style>
