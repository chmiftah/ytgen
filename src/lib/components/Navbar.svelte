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
		padding: 12px 28px;
		background: rgba(8, 12, 24, 0.92);
		backdrop-filter: blur(24px) saturate(1.4);
		-webkit-backdrop-filter: blur(24px) saturate(1.4);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		position: sticky;
		top: 0;
		z-index: 50;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(99, 102, 241, 0.2);
	}

	/* Bottom accent glow line */
	.navbar::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 10%;
		right: 10%;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.25), rgba(244, 63, 94, 0.2), transparent);
		pointer-events: none;
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
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
		border: 1px solid rgba(244, 63, 94, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 20px rgba(244, 63, 94, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08);
		animation: float 4s ease-in-out infinite;
	}

	.brand-title {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.brand-name {
		font-family: var(--font-heading);
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #a5b4fc 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.brand-tag {
		font-size: 0.62rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%);
		color: #a5b4fc;
		border: 1px solid rgba(99, 102, 241, 0.3);
		text-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
	}

	.aspect-badge {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 5px 14px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-full);
		font-size: 0.72rem;
		color: var(--text-secondary);
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.aspect-badge:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--highlight-green);
		box-shadow: 0 0 8px var(--highlight-green), 0 0 16px rgba(34, 197, 94, 0.2);
		animation: pulseGlow 2s ease-in-out infinite;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.export-btn {
		background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
		box-shadow: 0 4px 18px rgba(244, 63, 94, 0.35);
		position: relative;
		overflow: hidden;
	}

	.export-btn::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 60%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
		transition: left 0.6s ease;
	}

	.export-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
		box-shadow: 0 6px 24px rgba(244, 63, 94, 0.5);
		transform: translateY(-1px);
	}

	.export-btn:hover:not(:disabled)::after {
		left: 100%;
	}

	@media (max-width: 768px) {
		.navbar {
			padding: 10px 16px;
		}
		.aspect-badge {
			display: none;
		}
	}
</style>
