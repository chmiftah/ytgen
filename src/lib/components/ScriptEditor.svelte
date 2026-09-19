<script>
	import { SCRIPT_PRESETS } from '$lib/services/scriptAnalyzer.js';
	import { humanizeScript } from '$lib/services/scriptHumanizer.js';
	import { Wand2, Sparkles, Clock, FileText, RefreshCw, Lightbulb, Mic, Flame } from 'lucide-svelte';

	let {
		script = $bindable(''),
		onGenerate,
		isGenerating = false,
		onOpenScriptGenerator,
		onOpenTopicGenerator,
		onOpenTitleGenerator,
		showGenerateButton = false
	} = $props();

	let humanizeNotice = $state('');

	let wordCount = $derived(script.trim() ? script.trim().split(/\s+/).length : 0);
	let estimatedSeconds = $derived(Math.round(wordCount * 0.45));
	let estimatedMinutes = $derived(Math.floor(estimatedSeconds / 60));
	let remainingSeconds = $derived(estimatedSeconds % 60);

	function applyPreset(preset) {
		script = preset.text;
	}

	function handleHumanize() {
		if (!script.trim()) return;
		script = humanizeScript(script);
		humanizeNotice = 'Naskah dioptimalkan untuk voiceover.';
		setTimeout(() => { humanizeNotice = ''; }, 3000);
	}
</script>

<div class="script-editor glass-panel">
	<div class="panel-head">
		<div class="head-main">
			<h2>Script</h2>
			<p>Tempel naskah, generate otomatis, lalu generate video.</p>
		</div>
		<div class="head-stats">
			<span class="stat"><FileText size={13} /> {wordCount} kata</span>
			<span class="stat"><Clock size={13} /> {estimatedMinutes}m {remainingSeconds}s</span>
		</div>
	</div>

	<div class="tool-row">
		{#if onOpenTitleGenerator}
			<button type="button" class="tool-btn" onclick={onOpenTitleGenerator} title="Riset judul viral">
				<Flame size={13} /><span>Judul</span>
			</button>
		{/if}
		{#if onOpenTopicGenerator}
			<button type="button" class="tool-btn" onclick={onOpenTopicGenerator} title="Cari ide topik">
				<Lightbulb size={13} /><span>Topik</span>
			</button>
		{/if}
		{#if onOpenScriptGenerator}
			<button type="button" class="tool-btn" onclick={onOpenScriptGenerator} title="Tulis naskah dengan AI">
				<Sparkles size={13} /><span>Naskah AI</span>
			</button>
		{/if}
		<button type="button" class="tool-btn" onclick={handleHumanize} title="Rapikan gaya penceritaan">
			<Mic size={13} /><span>Humanize</span>
		</button>
	</div>

	{#if humanizeNotice}
		<div class="notice">{humanizeNotice}</div>
	{/if}

	<div class="preset-block">
		<span class="preset-label">Contoh</span>
		<div class="preset-chips">
			{#each SCRIPT_PRESETS as preset}
				<button type="button" class="preset-btn" onclick={() => applyPreset(preset)} title={preset.title}>
					<Sparkles size={12} />
					<span>{preset.title.length > 42 ? preset.title.slice(0, 42) + '…' : preset.title}</span>
				</button>
			{/each}
		</div>
	</div>

	<textarea
		bind:value={script}
		placeholder="Tulis naskah di sini…"
		rows={7}
		class="script-input"
	></textarea>

	{#if showGenerateButton}
		<div class="footer">
			<button class="btn btn-primary btn-lg generate-btn" onclick={onGenerate} disabled={isGenerating || !script.trim()}>
				{#if isGenerating}
					<RefreshCw size={16} class="spin" /><span>Generating…</span>
				{:else}
					<Wand2 size={16} /><span>Generate Video</span>
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	.script-editor {
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.panel-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
		flex-wrap: wrap;
	}

	.head-main h2 {
		font-size: 1rem;
		font-weight: 700;
	}

	.head-main p {
		font-size: 0.8rem;
		color: var(--text-2);
		margin-top: 4px;
	}

	.head-stats {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.stat {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		font-size: 0.75rem;
		color: var(--text-2);
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-full);
	}

	.tool-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.tool-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 11px;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-2);
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
	.tool-btn:hover {
		color: var(--text);
		border-color: var(--line-strong);
		background: var(--bg-card-hover);
	}

	.notice {
		padding: 8px 12px;
		font-size: 0.78rem;
		color: var(--text-2);
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}

	.preset-block {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.preset-label {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}

	.preset-chips {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.preset-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-width: 320px;
		padding: 6px 10px;
		font-size: 0.76rem;
		color: var(--text-2);
		background: transparent;
		border: 1px solid var(--line);
		border-radius: var(--r-full);
	}
	.preset-btn:hover {
		color: var(--text);
		border-color: var(--line-strong);
		background: var(--bg-card);
	}
	.preset-btn span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.script-input {
		width: 100%;
		min-height: 170px;
		resize: vertical;
		font-size: 0.92rem;
		line-height: 1.65;
	}

	.footer {
		display: flex;
		justify-content: flex-end;
	}

	.generate-btn { min-width: 200px; }
</style>
