<script>
	import { X, Type, Check, Sparkles, Sliders, Zap, AlignCenter, Quote, Eye } from 'lucide-svelte';
	import { SUBTITLE_STYLES, SUBTITLE_POSITIONS, SUBTITLE_DECORS, isConnectorWord, getSecondaryWordIndex, groupWordsIntoLines } from '$lib/services/subtitleService.js';
	let {
		isOpen = false,
		activeStyleKey = $bindable('cinema_essay'),
		subtitlePosition = $bindable('bottom-center'),
		quoteDecoration = $bindable('none'),
		karaokeEnabled = $bindable(true),
		subtitleAnimation = $bindable('word_by_word'),
		subtitleFontSize = $bindable(34),
		wordsPerLine = $bindable(2),
		onClose
	} = $props();
	const HIGHLIGHT_COLORS = [
		{ name: 'Viral Yellow', value: '#FACC15' },
		{ name: 'Cyan Glow', value: '#06B6D4' },
		{ name: 'Emerald Green', value: '#22C55E' },
		{ name: 'Hot Pink', value: '#F43F5E' },
		{ name: 'Vibrant Purple', value: '#A855F7' },
		{ name: 'Pure White', value: '#FFFFFF' }
	];
	const FONT_PRESETS = [
		{ label: 'Kecil', size: 24 },
		{ label: 'Sedang', size: 34 },
		{ label: 'Besar', size: 44 },
		{ label: 'Giant (Wolf)', size: 52 }
	];
	const WOLF_SAMPLE_VARIATIONS = [
		['dan', 'rahasia', 'industri', 'terbaik'],       // Baris 1 ("dan")
		['rahasia', 'dari', 'industri', 'terbaik'],       // Baris 2 ("dari")
		['rahasia', 'industri', 'yang', 'terbaik'],       // Baris 3 ("yang")
		['formula', 'konten', 'bisnis', 'viral']         // Rotasi dinamis baris 1-3
	];
	let sampleCycle = $state(0);
	let sampleWords = $derived.by(() => {
		if (activeStyleKey === 'wolf_stack') {
			return WOLF_SAMPLE_VARIATIONS[sampleCycle % WOLF_SAMPLE_VARIATIONS.length];
		}
		if (activeStyleKey === 'cinema_essay') {
			return ['padahal', 'ada', 'sesuatu', 'yang', 'kita', 'perhitungkan'];
		}
		return ['REVOLUSI', 'AI', 'MENGUBAH', 'DUNIA', 'SECARA', 'CEPAT'];
	});
	let activeWordIdx = $state(0);
	let interval;
	$effect(() => {
		if (isOpen) {
			activeWordIdx = 0;
			interval = setInterval(() => {
				activeWordIdx++;
				if (activeWordIdx > sampleWords.length) {
					activeWordIdx = 0;
					sampleCycle++;
				}
			}, 520);
			return () => clearInterval(interval);
		}
	});

	let previewVisibleWords = $derived.by(() => {
		if (subtitleAnimation === 'word_by_word') {
			const count = Math.min(sampleWords.length, activeWordIdx + 1);
			return sampleWords.slice(0, count);
		}
		return sampleWords.slice(0, 4);
	});

	let previewLines = $derived.by(() => {
		const isStacked = Boolean(SUBTITLE_STYLES[activeStyleKey]?.stackWords);
		if (!isStacked) return [];
		return groupWordsIntoLines(previewVisibleWords, wordsPerLine, SUBTITLE_STYLES[activeStyleKey]?.connectorScale);
	});

	function selectStyle(key) {
		activeStyleKey = key;
		if (SUBTITLE_STYLES[key]?.wordByWord) {
			subtitleAnimation = 'word_by_word';
		}
		if (key === 'wolf_stack') {
			if (subtitlePosition === 'bottom-center' || subtitlePosition === 'center') {
				subtitlePosition = 'wolf-left';
			}
			subtitleFontSize = 52;
		}
	}
	function setHighlightColor(color) {
		if (SUBTITLE_STYLES[activeStyleKey]) {
			SUBTITLE_STYLES[activeStyleKey].highlightColor = color;
			if (color === '#FACC15') SUBTITLE_STYLES[activeStyleKey].highlightGlow = '0 0 25px rgba(250, 204, 21, 0.8)';
			else if (color === '#06B6D4') SUBTITLE_STYLES[activeStyleKey].highlightGlow = '0 0 25px rgba(6, 182, 212, 0.8)';
			else if (color === '#FFFFFF') SUBTITLE_STYLES[activeStyleKey].highlightGlow = '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 25px rgba(0, 0, 0, 0.75)';
			else SUBTITLE_STYLES[activeStyleKey].highlightGlow = `0 0 25px ${color}aa`;
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose} role="presentation">
		<div class="modal-container glass-panel" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<div class="header-title">
					<Type size={20} color="var(--primary)" />
					<div><h3>Kustomisasi Subtitle & Caption</h3><p>Gaya font + mode animasi word by word + posisi cinema layar.</p></div>
				</div>
				<button class="close-btn" onclick={onClose} title="Tutup"><X size={18} /></button>
			</div>
			<div class="modal-scrollable">
				<!-- Live Preview Box -->
				<div class="preview-box">
					<div class="preview-header-row">
						<span class="preview-label">Live Preview Subtitle</span>
						<span class="size-indicator">
							{subtitleFontSize}px • {SUBTITLE_POSITIONS[subtitlePosition]?.name} • {subtitleAnimation === 'word_by_word' ? 'Word by Word' : (subtitleAnimation === 'karaoke' ? 'Karaoke' : 'Statis')}
						</span>
					</div>
					<div 
						class="preview-stage pos-{subtitlePosition} {activeStyleKey}"
						class:split-left={(subtitlePosition === 'cinema-split' || subtitlePosition === 'wolf-split') && (Math.floor(activeWordIdx / 3) % 2 === 0)}
						class:split-right={(subtitlePosition === 'cinema-split' || subtitlePosition === 'wolf-split') && (Math.floor(activeWordIdx / 3) % 2 === 1)}
						style="font-family: {SUBTITLE_STYLES[activeStyleKey].fontFamily}; font-size: {subtitleFontSize}px; font-weight: {SUBTITLE_STYLES[activeStyleKey].fontWeight}; text-transform: {SUBTITLE_STYLES[activeStyleKey].textTransform};"
					>
						<div 
							class="subtitle-pill"
							class:stacked={SUBTITLE_STYLES[activeStyleKey]?.stackWords}
							style="background: {SUBTITLE_STYLES[activeStyleKey].backgroundColor}; border: none;"
						>
							{#if quoteDecoration === 'quote'}<span class="q-mark">“</span>{/if}
							{#if SUBTITLE_STYLES[activeStyleKey]?.stackWords && previewLines.length > 0}
								{#each previewLines as line}
									<div class="preview-line-row">
										{#each line.words as word, wIdx}
											{@const absIdx = line.startIdx + wIdx}
											{@const isHighlight = subtitleAnimation === 'karaoke' ? absIdx === (activeWordIdx % sampleWords.length) : (subtitleAnimation === 'word_by_word' ? absIdx === activeWordIdx : false)}
											{@const secondaryIdx = getSecondaryWordIndex(sampleWords, sampleCycle)}
											{@const isConn = SUBTITLE_STYLES[activeStyleKey]?.connectorScale && absIdx === secondaryIdx}
											<span 
												class="preview-token" 
												class:active={isHighlight}
												class:anim-reveal={subtitleAnimation === 'word_by_word'}
												class:is-connector={isConn}
												style="color: {isHighlight ? SUBTITLE_STYLES[activeStyleKey].highlightColor : (isConn && SUBTITLE_STYLES[activeStyleKey].secondaryColor ? SUBTITLE_STYLES[activeStyleKey].secondaryColor : SUBTITLE_STYLES[activeStyleKey].primaryColor)}; text-shadow: {isHighlight ? SUBTITLE_STYLES[activeStyleKey].highlightGlow : (isConn ? '0 2px 14px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0,0,0,0.9)' : SUBTITLE_STYLES[activeStyleKey].shadow)}; -webkit-text-stroke: {SUBTITLE_STYLES[activeStyleKey].textStroke};"
											>{word}</span>
										{/each}
									</div>
								{/each}
							{:else}
								{#each previewVisibleWords as word, idx}
									{@const isHighlight = subtitleAnimation === 'karaoke' ? idx === (activeWordIdx % sampleWords.length) : (subtitleAnimation === 'word_by_word' ? idx === activeWordIdx : false)}
									{@const secondaryIdx = getSecondaryWordIndex(sampleWords, sampleCycle)}
									{@const isConn = SUBTITLE_STYLES[activeStyleKey]?.connectorScale && idx === secondaryIdx}
									<span 
										class="preview-token" 
										class:active={isHighlight}
										class:anim-reveal={subtitleAnimation === 'word_by_word'}
										class:is-connector={isConn}
										style="color: {isHighlight ? SUBTITLE_STYLES[activeStyleKey].highlightColor : (isConn && SUBTITLE_STYLES[activeStyleKey].secondaryColor ? SUBTITLE_STYLES[activeStyleKey].secondaryColor : SUBTITLE_STYLES[activeStyleKey].primaryColor)}; text-shadow: {isHighlight ? SUBTITLE_STYLES[activeStyleKey].highlightGlow : (isConn ? '0 2px 14px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0,0,0,0.9)' : SUBTITLE_STYLES[activeStyleKey].shadow)}; -webkit-text-stroke: {SUBTITLE_STYLES[activeStyleKey].textStroke};"
									>{word}</span>
								{/each}
							{/if}
							{#if quoteDecoration === 'quote'}<span class="q-mark">”</span>{/if}
						</div>
					</div>
				</div>

				<!-- Mode Kemunculan Kata (Word by Word vs Karaoke vs Statis) -->
				<div class="setting-card col">
					<div class="font-size-header">
						<div class="font-size-title">
							<Sparkles size={16} color="var(--primary)" />
							<h4>Mode Animasi Kata</h4>
						</div>
						<span class="font-size-badge">
							{subtitleAnimation === 'word_by_word' ? '✨ Word by Word' : (subtitleAnimation === 'karaoke' ? '⚡ Karaoke' : '📄 Statis')}
						</span>
					</div>
					<div class="anim-mode-grid">
						<button 
							type="button" 
							class="anim-mode-card" 
							class:selected={subtitleAnimation === 'word_by_word'} 
							onclick={() => { subtitleAnimation = 'word_by_word'; karaokeEnabled = true; }}
						>
							<div class="anim-mode-title">
								<span class="anim-dot" class:on={subtitleAnimation === 'word_by_word'}></span>
								<strong>✨ Word by Word Muncul</strong>
							</div>
							<p>Kata muncul satu per satu mengikuti tempo suara (gaya Good Will Hunting & Cinema Essay).</p>
						</button>

						<button 
							type="button" 
							class="anim-mode-card" 
							class:selected={subtitleAnimation === 'karaoke'} 
							onclick={() => { subtitleAnimation = 'karaoke'; karaokeEnabled = true; }}
						>
							<div class="anim-mode-title">
								<span class="anim-dot" class:on={subtitleAnimation === 'karaoke'}></span>
								<strong>⚡ Karaoke Pop Highlight</strong>
							</div>
							<p>Frase tampil lengkap di layar, kata yang sedang dibicarakan menyala warna kontras (Hormozi).</p>
						</button>

						<button 
							type="button" 
							class="anim-mode-card" 
							class:selected={subtitleAnimation === 'static'} 
							onclick={() => { subtitleAnimation = 'static'; karaokeEnabled = false; }}
						>
							<div class="anim-mode-title">
								<span class="anim-dot" class:on={subtitleAnimation === 'static'}></span>
								<strong>📄 Frase Penuh (Statis)</strong>
							</div>
							<p>Kalimat tampil utuh sekaligus per adegan (subtitle film dokumenter klasik tanpa animasi).</p>
						</button>
					</div>
				</div>

				<!-- Pengaturan Kata per Baris (Stack Multi-Kata) -->
				<div class="setting-card col">
					<div class="font-size-header">
						<div class="font-size-title">
							<AlignCenter size={16} color="var(--primary)" />
							<h4>Kata per Baris</h4>
						</div>
						<span class="font-size-badge">
							{wordsPerLine === 1 ? '1 Kata / Baris' : (wordsPerLine === 2 ? '2 Kata / Baris' : (wordsPerLine === 3 ? '3 Kata / Baris' : '⚡ Dinamis (1-3 Kata)'))}
						</span>
					</div>
					<div class="words-per-line-grid">
						<button type="button" class="wpl-btn" class:selected={wordsPerLine === 1} onclick={() => wordsPerLine = 1}>
							<span class="wpl-title">1 Kata</span>
							<span class="wpl-desc">Tiap kata baris baru</span>
						</button>
						<button type="button" class="wpl-btn" class:selected={wordsPerLine === 2} onclick={() => wordsPerLine = 2}>
							<span class="wpl-title">2 Kata</span>
							<span class="wpl-desc">Maks. 2 kata per baris</span>
						</button>
						<button type="button" class="wpl-btn" class:selected={wordsPerLine === 3} onclick={() => wordsPerLine = 3}>
							<span class="wpl-title">3 Kata</span>
							<span class="wpl-desc">Maks. 3 kata per baris</span>
						</button>
						<button type="button" class="wpl-btn" class:selected={wordsPerLine === 'dynamic'} onclick={() => wordsPerLine = 'dynamic'}>
							<span class="wpl-title">⚡ Dinamis</span>
							<span class="wpl-desc">1 - 3 kata ritmis</span>
						</button>
					</div>
				</div>

				<!-- Gaya Tipografi -->
				<div class="presets-section">
					<span class="section-title">Gaya Tipografi Subtitle</span>
					<div class="presets-grid">
						{#each Object.entries(SUBTITLE_STYLES) as [key, style]}
							<button type="button" class="style-card" class:active={activeStyleKey === key} onclick={() => selectStyle(key)}>
								<div class="card-header">
									<h4>{style.name}</h4>
									{#if activeStyleKey === key}<span class="active-badge"><Check size={14} /> Aktif</span>{/if}
								</div>
								<p class="style-desc">
									{#if key === 'wolf_stack'}
										Tumpukan 1 kata vertikal Dual-Font: Kata sambung italic serif warna gold amber, kata kunci ultra-bold putih (Jordan Belfort & MagnatesMedia).
									{:else if key === 'cinema_essay'}
										Clean lowercase, bold white, word-by-word film aesthetic (Good Will Hunting).
									{:else if key === 'hormozi'}
										Viral tebal uppercase, highlight kuning menyala.
									{:else if key === 'cinematic'}
										Netflix elegan pill semi-transparan.
									{:else if key === 'cyberpunk'}
										Neon cyan futuristik glow.
									{:else}
										Minimal bersih modern serbaguna.
									{/if}
								</p>
							</button>
						{/each}
					</div>
				</div>

				<!-- Posisi Subtitle -->
				<div class="setting-card col">
					<div class="font-size-header">
						<div class="font-size-title"><AlignCenter size={16} color="var(--accent-cyan)" /><h4>Posisi di Layar</h4></div>
						<span class="font-size-badge">{SUBTITLE_POSITIONS[subtitlePosition]?.name}</span>
					</div>
					<div class="position-grid">
						{#each Object.entries(SUBTITLE_POSITIONS) as [key, pos]}
							<button type="button" class="pos-btn" class:selected={subtitlePosition === key} onclick={() => subtitlePosition = key} title={pos.name}>
								<span class="pos-dot" class:on={subtitlePosition === key}></span>{pos.name}
							</button>
						{/each}
					</div>
					<p class="hint">🎲 <strong>Smart Flow</strong>: Posisi otomatis rotasi kiri, kanan, & jeda hening tanpa teks (tanpa perlu setting manual). | 🐺 <strong>Wolf Mid-Left / 2 Sisi</strong>: Teks tumpuk di samping subjek karakter.</p>
				</div>

				<!-- Ukuran Font -->
				<div class="setting-card font-size-card">
					<div class="font-size-header">
						<div class="font-size-title"><Sliders size={16} color="var(--accent-cyan)" /><h4>Ukuran Font</h4></div>
						<span class="font-size-badge">{subtitleFontSize} px</span>
					</div>
					<div class="slider-row">
						<span class="min-max-text">18px</span>
						<input type="range" min="18" max="64" step="2" bind:value={subtitleFontSize} class="range-slider" />
						<span class="min-max-text">64px</span>
					</div>
					<div class="preset-buttons-row">
						{#each FONT_PRESETS as p}
							<button type="button" class="preset-chip" class:selected={subtitleFontSize === p.size} onclick={() => subtitleFontSize = p.size}>
								{p.label} ({p.size}px)
							</button>
						{/each}
					</div>
				</div>

				<!-- Decor Terpisah (Quote / Side) -->
				<div class="setting-card col">
					<div class="font-size-header"><div class="font-size-title"><Quote size={16} color="var(--highlight-yellow)" /><h4>Aksen & Dekorasi Tambahan</h4></div></div>
					<div class="preset-buttons-row">
						{#each Object.entries(SUBTITLE_DECORS) as [key, dec]}
							<button type="button" class="preset-chip" class:selected={quoteDecoration === key} onclick={() => quoteDecoration = key}>{dec.name}</button>
						{/each}
					</div>
				</div>

				<!-- Warna Highlight (jika karaoke aktif) -->
				{#if subtitleAnimation === 'karaoke'}
					<div class="color-section">
						<span class="section-label">Warna Highlight:</span>
						<div class="color-palette">
							{#each HIGHLIGHT_COLORS as color}
								<button type="button" class="color-circle" style="background: {color.value};" onclick={() => setHighlightColor(color.value)} title={color.name}></button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div class="modal-footer"><button class="btn btn-primary" onclick={onClose}>Simpan & Terapkan</button></div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop { position: fixed; inset: 0; background: rgba(4, 7, 13, 0.82); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
	.modal-container { width: 100%; max-width: 700px; max-height: 88vh; background: #0d1322; border: 1px solid var(--border-bright); box-shadow: var(--shadow-lg); border-radius: var(--radius-xl); overflow: hidden; display: flex; flex-direction: column; }
	.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; }
	.header-title { display: flex; align-items: center; gap: 12px; }
	.header-title h3 { font-size: 1.15rem; }
	.header-title p { font-size: 0.8rem; color: var(--text-secondary); }
	.close-btn { width: 32px; height: 32px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
	.modal-scrollable { padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
	.preview-box { background: radial-gradient(circle at center, #131b2e 0%, #080b12 100%); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 28px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; min-height: 140px; }
	.preview-header-row { position: absolute; top: 10px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between; }
	.preview-label { font-size: 0.725rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
	.size-indicator { font-size: 0.68rem; color: var(--accent-cyan); font-family: var(--font-mono); }
	.preview-stage { display: flex; align-items: center; justify-content: center; user-select: none; margin-top: 12px; width: 100%; }
	.preview-stage.pos-center { min-height: 70px; }
	.preview-stage.pos-top-center { align-items: flex-start; }
	.preview-stage.pos-bottom-left { justify-content: flex-start; }
	.preview-stage.pos-cinema-split.split-left,
	.preview-stage.pos-cinema-left { justify-content: flex-start; padding-left: 20px; }
	.preview-stage.pos-cinema-split.split-right,
	.preview-stage.pos-cinema-right { justify-content: flex-end; padding-right: 20px; }
	.preview-stage.pos-wolf-split.split-left,
	.preview-stage.pos-wolf-left { justify-content: flex-start; align-items: flex-start; padding-left: 24px; text-align: left; }
	.preview-stage.pos-wolf-split.split-right,
	.preview-stage.pos-wolf-right { justify-content: flex-end; align-items: flex-end; padding-right: 24px; text-align: right; }
	.subtitle-pill { display: inline-flex; align-items: baseline; gap: 8px; padding: 8px 14px; border-radius: var(--radius-md); flex-wrap: wrap; }
	.subtitle-pill.decor-side { border-radius: 0; padding-left: 12px; }
	.preview-stage.wolf_stack .subtitle-pill,
	.subtitle-pill.stacked {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
		padding: 0;
		gap: 4px;
		line-height: 0.88;
	}
	.preview-line-row {
		display: flex;
		align-items: baseline;
		gap: 0.28em;
		flex-wrap: nowrap;
		line-height: 0.88;
	}
	.preview-stage.pos-wolf-right .preview-line-row,
	.preview-stage.pos-wolf-split.split-right .preview-line-row {
		justify-content: flex-end;
	}
	.preview-stage.pos-wolf-right .subtitle-pill,
	.preview-stage.pos-wolf-split.split-right .subtitle-pill {
		align-items: flex-end;
		text-align: right;
	}
	.preview-token { transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1); line-height: 1.2; display: inline-block; }
	.preview-stage.wolf_stack .preview-token,
	.subtitle-pill.stacked .preview-token {
		display: inline-block;
		line-height: 0.88;
		letter-spacing: -0.05em;
		font-weight: 900;
	}
	.preview-token.active { transform: scale(1.18); }
	.preview-stage.wolf_stack .preview-token.active,
	.subtitle-pill.stacked .preview-token.active { transform: scale(1.06); }
	.preview-token.is-connector {
		font-family: 'Playfair Display', Georgia, serif !important;
		font-style: italic !important;
		font-size: 0.58em !important;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.05;
		margin-top: 2px;
		margin-bottom: 3px;
		color: #f59e0b !important;
		text-shadow: 0 2px 14px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0, 0, 0, 0.95) !important;
		opacity: 1;
	}
	.preview-token.anim-reveal { animation: previewWordPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
	@keyframes previewWordPop {
		0% { opacity: 0; transform: translateY(4px) scale(0.92); filter: blur(2px); }
		100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
	}
	.anim-mode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
	.anim-mode-card { display: flex; flex-direction: column; gap: 6px; padding: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); text-align: left; transition: all 0.15s ease; cursor: pointer; }
	.anim-mode-card:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.2); }
	.anim-mode-card.selected { background: rgba(99, 102, 241, 0.15); border-color: var(--primary); box-shadow: 0 0 12px rgba(99, 102, 241, 0.2); }
	.anim-mode-title { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-primary); }
	.anim-mode-card p { font-size: 0.72rem; color: var(--text-secondary); line-height: 1.35; margin: 0; }
	.anim-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; transition: all 0.2s ease; }
	.anim-dot.on { background: #38bdf8; box-shadow: 0 0 8px #38bdf8; }
	.words-per-line-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 4px; }
	.wpl-btn { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); text-align: left; transition: all 0.15s ease; cursor: pointer; }
	.wpl-btn:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.2); }
	.wpl-btn.selected { background: rgba(99, 102, 241, 0.15); border-color: var(--primary); box-shadow: 0 0 12px rgba(99, 102, 241, 0.2); }
	.wpl-title { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
	.wpl-btn.selected .wpl-title { color: #a5b4fc; }
	.wpl-desc { font-size: 0.7rem; color: var(--text-secondary); line-height: 1.3; }
	.q-mark { opacity: 0.6; font-family: Georgia, serif; font-size: 1.6em; line-height: 0.8; }
	.setting-card { background: #111828; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
	.setting-card.col { flex-direction: column; align-items: stretch; }
	.card-left { display: flex; align-items: center; gap: 12px; }
	.icon-bubble { width: 36px; height: 36px; border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
	.icon-bubble.active { background: rgba(250, 204, 21, 0.15); border: 1px solid rgba(250, 204, 21, 0.3); }
	.card-left h4 { font-size: 0.9rem; margin-bottom: 2px; }
	.card-left p { font-size: 0.775rem; color: var(--text-secondary); }
	.toggle-switch { position: relative; width: 48px; height: 26px; background: #1e293b; border-radius: var(--radius-full); padding: 3px; cursor: pointer; border: 1px solid var(--border-subtle); flex-shrink: 0; }
	.toggle-switch.checked { background: var(--primary); border-color: var(--primary); }
	.toggle-slider { display: block; width: 18px; height: 18px; background: white; border-radius: 50%; transition: transform 0.2s ease; }
	.toggle-switch.checked .toggle-slider { transform: translateX(22px); }
	.font-size-card { flex-direction: column; align-items: stretch; gap: 12px; }
	.font-size-header { display: flex; align-items: center; justify-content: space-between; }
	.font-size-title { display: flex; align-items: center; gap: 8px; }
	.font-size-title h4 { font-size: 0.9rem; }
	.font-size-badge { padding: 3px 10px; background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: var(--radius-full); font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; }
	.slider-row { display: flex; align-items: center; gap: 12px; }
	.min-max-text { font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); min-width: 32px; }
	.range-slider { flex: 1; accent-color: var(--accent-cyan); cursor: pointer; height: 6px; }
	.preset-buttons-row { display: flex; gap: 8px; flex-wrap: wrap; }
	.preset-chip { padding: 5px 12px; border-radius: var(--radius-full); background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-subtle); color: var(--text-secondary); font-size: 0.75rem; font-weight: 500; }
	.preset-chip.selected { background: rgba(99, 102, 241, 0.2); border-color: var(--primary); color: #a5b4fc; font-weight: 700; }
	.position-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
	.pos-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); color: var(--text-secondary); font-size: 0.78rem; font-weight: 500; }
	.pos-btn.selected { background: rgba(99,102,241,0.18); border-color: var(--primary); color: #c7d2fe; }
	.pos-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; }
	.pos-dot.on { background: var(--primary); box-shadow: 0 0 8px var(--primary); }
	.hint { font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; }
	.presets-section { display: flex; flex-direction: column; gap: 8px; }
	.section-title { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
	.presets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.style-card { background: #111828; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; text-align: left; }
	.style-card.active { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); background: #162238; }
	.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
	.card-header h4 { font-size: 0.925rem; }
	.active-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 700; color: var(--accent-cyan); }
	.style-desc { font-size: 0.775rem; color: var(--text-secondary); line-height: 1.4; }
	.color-section { display: flex; align-items: center; gap: 14px; }
	.section-label { font-size: 0.825rem; color: var(--text-secondary); font-weight: 600; }
	.color-palette { display: flex; gap: 10px; }
	.color-circle { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #0d1322; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2); }
	.modal-footer { padding: 16px 24px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; flex-shrink: 0; }
</style>
