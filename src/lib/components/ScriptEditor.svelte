<script>
	import { SCRIPT_PRESETS } from '$lib/services/scriptAnalyzer.js';
	import { Wand2, Sparkles, Clock, FileText, RefreshCw } from 'lucide-svelte';

	let { script = $bindable(''), onGenerate, isGenerating = false } = $props();

	let wordCount = $derived(script.trim() ? script.trim().split(/\s+/).length : 0);
	let estimatedSeconds = $derived(Math.round(wordCount * 0.45));
	let estimatedMinutes = $derived(Math.floor(estimatedSeconds / 60));
	let remainingSeconds = $derived(estimatedSeconds % 60);

	function applyPreset(preset) {
		script = preset.text;
	}
</script>

<div class="script-editor glass-panel">
	<div class="panel-header">
		<div class="header-left">
			<div class="icon-wrap">
				<FileText size={18} color="var(--primary)" />
			</div>
			<div>
				<h2 class="panel-title">1. Masukkan Naskah YouTube</h2>
				<p class="panel-desc">Ketik atau tempel naskah video Anda. Sistem akan memotong per adegan, mencari video Pexels, dan menghasilkan voiceover.</p>
			</div>
		</div>

		<div class="stats-bar">
			<div class="stat-item ai-badge">
				<Sparkles size={13} color="var(--accent-cyan)" />
				<span>DeepSeek AI Active</span>
			</div>
			<div class="stat-item">
				<FileText size={14} />
				<span>{wordCount} Kata</span>
			</div>
			<div class="stat-item">
				<Clock size={14} />
				<span>Estimasi: {estimatedMinutes}m {remainingSeconds}s</span>
			</div>
		</div>
	</div>

	<!-- Presets -->
	<div class="preset-section">
		<span class="preset-label">Contoh Naskah Siap Pakai:</span>
		<div class="preset-chips">
			{#each SCRIPT_PRESETS as preset}
				<button 
					type="button" 
					class="preset-btn" 
					onclick={() => applyPreset(preset)}
					title="Klik untuk memuat naskah ini"
				>
					<Sparkles size={13} color="var(--accent-cyan)" />
					<span>{preset.title}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Textarea -->
	<div class="textarea-container">
		<textarea
			bind:value={script}
			placeholder="Tulis naskah video YouTube Anda di sini... Contoh: 'Kecerdasan Buatan berkembang sangat cepat...'"
			rows={6}
		></textarea>
	</div>

	<!-- Action Footer -->
	<div class="panel-footer">
		<div class="hint">
			💡 <em>Tip: Pacing terbaik untuk YouTube retention adalah 1 adegan berganti setiap 5–8 detik.</em>
		</div>

		<button 
			class="btn btn-primary btn-lg generate-btn" 
			onclick={onGenerate}
			disabled={isGenerating || !script.trim()}
		>
			{#if isGenerating}
				<RefreshCw size={18} class="spin" />
				<span>Menganalisis & Mengambil Footage...</span>
			{:else}
				<Wand2 size={18} />
				<span>Analisis Naskah & Generate Video</span>
			{/if}
		</button>
	</div>
</div>

<style>
	.script-editor {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.header-left {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.icon-wrap {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
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

	.stats-bar {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		font-size: 0.8rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.ai-badge {
		border-color: rgba(6, 182, 212, 0.35);
		background: rgba(6, 182, 212, 0.08);
		color: var(--accent-cyan);
		font-weight: 600;
		animation: pulse-badge 2.5s ease-in-out infinite;
	}

	@keyframes pulse-badge {
		0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
		50% { box-shadow: 0 0 8px 2px rgba(6, 182, 212, 0.2); }
	}

	.preset-section {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.preset-label {
		font-size: 0.775rem;
		color: var(--text-muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.preset-chips {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.preset-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-full);
		font-size: 0.775rem;
		color: var(--text-secondary);
		transition: all 0.2s ease;
	}

	.preset-btn:hover {
		background: rgba(6, 182, 212, 0.1);
		border-color: rgba(6, 182, 212, 0.4);
		color: #e2e8f0;
		transform: translateY(-1px);
	}

	.textarea-container textarea {
		width: 100%;
		min-height: 120px;
		resize: vertical;
		font-size: 0.95rem;
		line-height: 1.6;
		padding: 16px;
		background: #090e18;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		color: var(--text-primary);
	}

	.textarea-container textarea:focus {
		border-color: var(--primary);
		box-shadow: 0 0 0 3px var(--primary-glow);
	}

	.panel-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.hint {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.generate-btn {
		padding: 12px 24px;
	}

	:global(.spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
