<script>
	import { 
		Terminal, 
		CheckCircle2, 
		AlertTriangle, 
		Clock, 
		Film, 
		Mic, 
		Sparkles, 
		ChevronDown, 
		ChevronUp, 
		X, 
		Activity,
		Layers,
		HardDrive,
		CloudDownload,
		Cpu
	} from 'lucide-svelte';

	let {
		isGenerating = false,
		progress = 0,
		currentStep = '',
		currentScene = 0,
		totalScenes = 0,
		activeQuery = '',
		activeNarration = '',
		stats = { localFootage: 0, pexelsFootage: 0, ttsClips: 0 },
		logs = [],
		onDismiss = null
	} = $props();

	let isCollapsed = $state(false);
	let terminalContainer = $state(null);
	let autoScroll = $state(true);

	// Auto-scroll terminal to bottom when new logs arrive
	$effect(() => {
		if (logs.length && terminalContainer && autoScroll && !isCollapsed) {
			requestAnimationFrame(() => {
				if (terminalContainer) {
					terminalContainer.scrollTop = terminalContainer.scrollHeight;
				}
			});
		}
	});

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function getTagClass(tag) {
		switch (tag) {
			case 'DEEPSEEK': return 'tag-ai';
			case 'FOOTAGE': return 'tag-footage';
			case 'LOCAL-SSD': return 'tag-local';
			case 'PEXELS': return 'tag-pexels';
			case 'EDGE-TTS': return 'tag-edge';
			case 'ELEVENLABS': return 'tag-eleven';
			case 'FFMPEG': return 'tag-ffmpeg';
			case 'CACHE': return 'tag-cache';
			case 'FINISH': return 'tag-finish';
			case 'SCENE': return 'tag-scene';
			case 'WARN': return 'tag-warn';
			default: return 'tag-default';
		}
	}
</script>

{#if isGenerating || logs.length > 0}
	<div class="pipeline-monitor glass-panel" class:collapsed={isCollapsed}>
		<!-- Monitor Top Bar -->
		<div class="monitor-header">
			<div class="header-left">
				<div class="radar-dot" class:active={isGenerating}></div>
				<div class="header-titles">
					<div class="title-row">
						<span class="monitor-title">Studio AI Pipeline Monitor</span>
						<span class="badge-live">{isGenerating ? 'AKTIF BEKERJA' : 'SELESAI'}</span>
					</div>
					<span class="monitor-sub">
						{currentStep || (isGenerating ? 'Memproses naskah, footage dan audio...' : 'Semua proses selesai')}
					</span>
				</div>
			</div>

			<div class="header-right">
				<!-- Stat counters -->
				{#if totalScenes > 0}
					<div class="stat-pill" title="Progress Adegan">
						<Layers size={13} color="var(--accent-cyan)" />
						<span>{currentScene} / {totalScenes} Adegan</span>
					</div>
					{#if stats.localFootage > 0}
						<div class="stat-pill local" title="Footage dari SSD lokal">
							<HardDrive size={13} color="#34d399" />
							<span>{stats.localFootage} Lokal SSD</span>
						</div>
					{/if}
					{#if stats.pexelsFootage > 0}
						<div class="stat-pill pexels" title="Footage dari Pexels online">
							<CloudDownload size={13} color="#60a5fa" />
							<span>{stats.pexelsFootage} Pexels</span>
						</div>
					{/if}
					{#if stats.ttsClips > 0}
						<div class="stat-pill tts" title="Audio Voiceover tersintesis">
							<Mic size={13} color="#c084fc" />
							<span>{stats.ttsClips} Audio TTS</span>
						</div>
					{/if}
				{/if}

				<button 
					type="button" 
					class="btn-toggle-view" 
					onclick={toggleCollapse} 
					title={isCollapsed ? 'Buka log detail' : 'Kecilkan monitor'}
				>
					{#if isCollapsed}
						<ChevronDown size={16} />
						<span>Lihat Log ({logs.length})</span>
					{:else}
						<ChevronUp size={16} />
						<span>Sembunyikan</span>
					{/if}
				</button>

				{#if !isGenerating && onDismiss}
					<button 
						type="button" 
						class="btn-close-monitor" 
						onclick={onDismiss} 
						title="Tutup monitor"
					>
						<X size={14} />
					</button>
				{/if}
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="progress-track">
			<div 
				class="progress-fill" 
				class:finished={!isGenerating && progress >= 100}
				style="width: {Math.max(4, Math.min(100, progress))}%"
			>
				<span class="progress-glow"></span>
			</div>
			<div class="progress-label-overlay">
				<span>{progress}%</span>
			</div>
		</div>

		{#if !isCollapsed}
			<!-- Active Processing Spotlight -->
			{#if isGenerating && (activeQuery || activeNarration)}
				<div class="spotlight-card">
					<div class="spotlight-tag">
						<Activity size={12} class="spin" />
						<span>Fokus Saat Ini: Adegan {currentScene} dari {totalScenes}</span>
					</div>
					<div class="spotlight-body">
						{#if activeQuery}
							<div class="spotlight-item">
								<span class="item-label">Visual Query:</span>
								<span class="item-val query">"{activeQuery}"</span>
							</div>
						{/if}
						{#if activeNarration}
							<div class="spotlight-item">
								<span class="item-label">Naskah Suara:</span>
								<span class="item-val narration">"{activeNarration.slice(0, 110)}{activeNarration.length > 110 ? '...' : ''}"</span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Terminal Activity Log Console -->
			<div class="terminal-wrapper">
				<div class="terminal-bar">
					<div class="terminal-dots">
						<span class="dot red"></span>
						<span class="dot yellow"></span>
						<span class="dot green"></span>
						<span class="term-name">activity_stream.log</span>
					</div>
					<label class="auto-scroll-toggle">
						<input type="checkbox" bind:checked={autoScroll} />
						<span>Auto-scroll</span>
					</label>
				</div>

				<div class="terminal-console" bind:this={terminalContainer}>
					{#if logs.length === 0}
						<div class="empty-log">Menunggu inisialisasi pipeline generator...</div>
					{:else}
						{#each logs as log (log.id)}
							<div class="log-row" class:highlight={log.type === 'highlight'} class:success={log.type === 'success'}>
								<span class="log-time">{log.time}</span>
								<span class="log-tag {getTagClass(log.tag)}">[{log.tag}]</span>
								<span class="log-msg">{log.message}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.pipeline-monitor {
		margin-top: 14px;
		margin-bottom: 6px;
		background: rgba(8, 13, 26, 0.88);
		border: 1px solid rgba(99, 102, 241, 0.35);
		border-radius: var(--radius-lg);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.12);
		overflow: hidden;
		transition: all 0.25s ease;
	}

	.pipeline-monitor.collapsed {
		padding-bottom: 0;
	}

	.monitor-header {
		padding: 12px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		background: rgba(15, 23, 42, 0.5);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	/* Pulsing radar dot */
	.radar-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #64748b;
		position: relative;
	}

	.radar-dot.active {
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
		animation: pulseRadar 1.5s infinite;
	}

	@keyframes pulseRadar {
		0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
		70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
		100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
	}

	.header-titles {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.monitor-title {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	.badge-live {
		font-size: 0.65rem;
		font-weight: 800;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(16, 185, 129, 0.2);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.35);
		letter-spacing: 0.04em;
	}

	.monitor-sub {
		font-size: 0.76rem;
		color: var(--text-secondary);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.stat-pill {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.72rem;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-subtle);
		color: var(--text-secondary);
	}

	.stat-pill.local {
		background: rgba(16, 185, 129, 0.12);
		border-color: rgba(16, 185, 129, 0.25);
		color: #34d399;
	}

	.stat-pill.pexels {
		background: rgba(96, 165, 250, 0.12);
		border-color: rgba(96, 165, 250, 0.25);
		color: #93c5fd;
	}

	.stat-pill.tts {
		background: rgba(192, 132, 252, 0.12);
		border-color: rgba(192, 132, 252, 0.25);
		color: #d8b4fe;
	}

	.btn-toggle-view, .btn-close-monitor {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.74rem;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid var(--border-subtle);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.18s ease;
	}

	.btn-toggle-view:hover, .btn-close-monitor:hover {
		background: rgba(255, 255, 255, 0.12);
		color: var(--text-primary);
	}

	/* Progress Bar */
	.progress-track {
		height: 6px;
		background: rgba(15, 23, 42, 0.8);
		position: relative;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #6366f1 0%, #06b6d4 50%, #10b981 100%);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.progress-fill.finished {
		background: #10b981;
	}

	.progress-glow {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 20px;
		background: #ffffff;
		opacity: 0.6;
		filter: blur(3px);
	}

	.progress-label-overlay {
		position: absolute;
		right: 8px;
		top: -16px;
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--text-muted);
	}

	/* Spotlight Card */
	.spotlight-card {
		margin: 12px 16px 8px;
		padding: 10px 14px;
		background: rgba(99, 102, 241, 0.08);
		border: 1px solid rgba(99, 102, 241, 0.25);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.spotlight-tag {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.72rem;
		font-weight: 700;
		color: #a5b4fc;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.spotlight-body {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.spotlight-item {
		display: flex;
		align-items: baseline;
		gap: 8px;
		font-size: 0.76rem;
	}

	.item-label {
		color: var(--text-muted);
		font-weight: 500;
		flex-shrink: 0;
	}

	.item-val.query {
		color: var(--accent-cyan);
		font-weight: 600;
	}

	.item-val.narration {
		color: #e2e8f0;
		font-style: italic;
	}

	/* Terminal Activity Log Console */
	.terminal-wrapper {
		margin: 10px 16px 14px;
		background: #050810;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.terminal-bar {
		padding: 6px 12px;
		background: rgba(15, 23, 42, 0.7);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.terminal-dots {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.dot.red { background: #ef4444; }
	.dot.yellow { background: #f59e0b; }
	.dot.green { background: #10b981; }

	.term-name {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.68rem;
		color: var(--text-muted);
		margin-left: 6px;
	}

	.auto-scroll-toggle {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.68rem;
		color: var(--text-muted);
		cursor: pointer;
		user-select: none;
	}

	.auto-scroll-toggle input {
		accent-color: var(--primary);
	}

	.terminal-console {
		height: 150px;
		overflow-y: auto;
		padding: 10px 12px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.74rem;
		line-height: 1.55;
		color: #cbd5e1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.empty-log {
		color: var(--text-muted);
		font-style: italic;
		padding: 10px 0;
	}

	.log-row {
		display: flex;
		align-items: baseline;
		gap: 8px;
		word-break: break-word;
	}

	.log-row.highlight {
		background: rgba(99, 102, 241, 0.08);
		border-left: 2px solid var(--primary);
		padding-left: 4px;
	}

	.log-row.success {
		color: #a7f3d0;
	}

	.log-time {
		color: #64748b;
		font-size: 0.68rem;
		flex-shrink: 0;
	}

	.log-tag {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 3px;
		flex-shrink: 0;
		letter-spacing: 0.02em;
	}

	.tag-ai { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
	.tag-footage { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
	.tag-local { background: rgba(16, 185, 129, 0.2); color: #34d399; font-weight: 800; }
	.tag-pexels { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
	.tag-edge { background: rgba(20, 184, 166, 0.2); color: #2dd4bf; font-weight: 800; }
	.tag-eleven { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
	.tag-ffmpeg { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
	.tag-cache { background: rgba(100, 116, 139, 0.2); color: #94a3b8; }
	.tag-finish { background: rgba(16, 185, 129, 0.3); color: #6ee7b7; font-weight: 800; }
	.tag-scene { background: rgba(99, 102, 241, 0.25); color: #a5b4fc; }
	.tag-warn { background: rgba(239, 68, 68, 0.2); color: #f87171; }
	.tag-default { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; }

	.log-msg {
		flex: 1;
	}

	.spin {
		animation: spin 1.2s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
