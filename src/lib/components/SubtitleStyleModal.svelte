<script>
	import { X, Type, Check, Sparkles, Sliders, Zap, AlignCenter, Quote } from 'lucide-svelte';
	import { SUBTITLE_STYLES, SUBTITLE_POSITIONS, SUBTITLE_DECORS } from '$lib/services/subtitleService.js';
	let {
		isOpen = false,
		activeStyleKey = $bindable('hormozi'),
		subtitlePosition = $bindable('bottom-center'),
		quoteDecoration = $bindable('none'),
		karaokeEnabled = $bindable(true),
		subtitleFontSize = $bindable(34),
		onClose
	} = $props();
	const HIGHLIGHT_COLORS = [
		{ name: 'Viral Yellow', value: '#FACC15' },
		{ name: 'Cyan Glow', value: '#06B6D4' },
		{ name: 'Emerald Green', value: '#22C55E' },
		{ name: 'Hot Pink', value: '#F43F5E' },
		{ name: 'Vibrant Purple', value: '#A855F7' }
	];
	const FONT_PRESETS = [
		{ label: 'Kecil', size: 22 },
		{ label: 'Sedang', size: 32 },
		{ label: 'Besar', size: 42 },
		{ label: 'Ekstra Besar', size: 50 }
	];
	let sampleWords = ['REVOLUSI', 'AI', 'MENGUBAH', 'DUNIA'];
	let activeWordIdx = $state(1);
	let interval;
	$effect(() => {
		if (isOpen) {
			interval = setInterval(() => { if (karaokeEnabled) activeWordIdx = (activeWordIdx + 1) % sampleWords.length; }, 600);
			return () => clearInterval(interval);
		}
	});
	function selectStyle(key) { activeStyleKey = key; }
	function setHighlightColor(color) {
		if (SUBTITLE_STYLES[activeStyleKey]) {
			SUBTITLE_STYLES[activeStyleKey].highlightColor = color;
			if (color === '#FACC15') SUBTITLE_STYLES[activeStyleKey].highlightGlow = '0 0 25px rgba(250, 204, 21, 0.8)';
			else if (color === '#06B6D4') SUBTITLE_STYLES[activeStyleKey].highlightGlow = '0 0 25px rgba(6, 182, 212, 0.8)';
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
					<div><h3>Kustomisasi Subtitle & Caption</h3><p>Style + posisi + decor quote terpisah — mix bebas (Opsi B).</p></div>
				</div>
				<button class="close-btn" onclick={onClose} title="Tutup"><X size={18} /></button>
			</div>
			<div class="modal-scrollable">
				<div class="preview-box">
					<div class="preview-header-row"><span class="preview-label">Live Preview</span><span class="size-indicator">{subtitleFontSize}px • {SUBTITLE_POSITIONS[subtitlePosition]?.name} • {SUBTITLE_DECORS[quoteDecoration]?.name}</span></div>
					<div class="preview-stage pos-{subtitlePosition}" style="font-family: {SUBTITLE_STYLES[activeStyleKey].fontFamily}; font-size: {subtitleFontSize}px; font-weight: {SUBTITLE_STYLES[activeStyleKey].fontWeight}; text-transform: {SUBTITLE_STYLES[activeStyleKey].textTransform};">
						<div class="subtitle-pill" style="background: {SUBTITLE_STYLES[activeStyleKey].backgroundColor}; border: none;">
							{#if quoteDecoration === 'quote'}<span class="q-mark">“</span>{/if}
							{#each sampleWords as word, idx}
								{@const isActive = karaokeEnabled && idx === activeWordIdx}
								<span class="preview-token" class:active={isActive} style="color: {isActive ? SUBTITLE_STYLES[activeStyleKey].highlightColor : SUBTITLE_STYLES[activeStyleKey].primaryColor}; text-shadow: {isActive ? SUBTITLE_STYLES[activeStyleKey].highlightGlow : SUBTITLE_STYLES[activeStyleKey].shadow}; -webkit-text-stroke: {SUBTITLE_STYLES[activeStyleKey].textStroke};">{word}</span>
							{/each}
							{#if quoteDecoration === 'quote'}<span class="q-mark">”</span>{/if}
						</div>
					</div>
				</div>
				<div class="setting-card col">
					<div class="font-size-header"><div class="font-size-title"><AlignCenter size={16} color="var(--accent-cyan)" /><h4>Posisi (5 titik)</h4></div><span class="font-size-badge">{SUBTITLE_POSITIONS[subtitlePosition]?.name}</span></div>
					<div class="position-grid">
						{#each Object.entries(SUBTITLE_POSITIONS) as [key, pos]}
							<button type="button" class="pos-btn" class:selected={subtitlePosition === key} onclick={() => subtitlePosition = key} title={pos.name}>
								<span class="pos-dot" class:on={subtitlePosition === key}></span>{pos.name}
							</button>
						{/each}
					</div>
					<p class="hint">Tengah = quote 2-baris estetik • Pinggir = minimal left/right aligned.</p>
				</div>
				<div class="setting-card col">
					<div class="font-size-header"><div class="font-size-title"><Quote size={16} color="var(--highlight-yellow)" /><h4>Decor Terpisah (bisa mix ke style apapun)</h4></div></div>
					<div class="preset-buttons-row">
						{#each Object.entries(SUBTITLE_DECORS) as [key, dec]}
							<button type="button" class="preset-chip" class:selected={quoteDecoration === key} onclick={() => quoteDecoration = key}>{dec.name}</button>
						{/each}
					</div>
					<p class="hint">Quote = “ ” besar di tengah • Side = garis accent kiri (cocok untuk bottom-left/right).</p>
				</div>
				<div class="setting-card">
					<div class="card-left"><div class="icon-bubble" class:active={karaokeEnabled}><Zap size={18} color={karaokeEnabled ? 'var(--highlight-yellow)' : 'var(--text-muted)'} /></div><div><h4>Karaoke Pop Kata</h4><p>{karaokeEnabled ? 'Aktif: kata menyala bergantian.' : 'Nonaktif: frase statis.'}</p></div></div>
					<button type="button" class="toggle-switch" class:checked={karaokeEnabled} onclick={() => karaokeEnabled = !karaokeEnabled}><span class="toggle-slider"></span></button>
				</div>
				<div class="setting-card font-size-card">
					<div class="font-size-header"><div class="font-size-title"><Sliders size={16} color="var(--accent-cyan)" /><h4>Ukuran Font</h4></div><span class="font-size-badge">{subtitleFontSize} px</span></div>
					<div class="slider-row"><span class="min-max-text">18px</span><input type="range" min="18" max="56" step="2" bind:value={subtitleFontSize} class="range-slider" /><span class="min-max-text">56px</span></div>
					<div class="preset-buttons-row">{#each FONT_PRESETS as p}<button type="button" class="preset-chip" class:selected={subtitleFontSize === p.size} onclick={() => subtitleFontSize = p.size}>{p.label} ({p.size}px)</button>{/each}</div>
				</div>
				<div class="presets-section">
					<span class="section-title">Gaya Tipografi</span>
					<div class="presets-grid">
						{#each Object.entries(SUBTITLE_STYLES) as [key, style]}
							<button type="button" class="style-card" class:active={activeStyleKey === key} onclick={() => selectStyle(key)}>
								<div class="card-header"><h4>{style.name}</h4>{#if activeStyleKey === key}<span class="active-badge"><Check size={14} /> Aktif</span>{/if}</div>
								<p class="style-desc">{#if key === 'hormozi'}Viral tebal uppercase.{:else if key === 'cinematic'}Netflix elegan pill blur.{:else if key === 'cyberpunk'}Neon cyan futuristik.{:else}Minimal bersih modern.{/if}</p>
							</button>
						{/each}
					</div>
				</div>
				{#if karaokeEnabled}
					<div class="color-section"><span class="section-label">Warna Highlight:</span><div class="color-palette">{#each HIGHLIGHT_COLORS as color}<button type="button" class="color-circle" style="background: {color.value};" onclick={() => setHighlightColor(color.value)} title={color.name}></button>{/each}</div></div>
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
	.preview-stage.pos-bottom-right { justify-content: flex-end; }
	.subtitle-pill { display: inline-flex; align-items: baseline; gap: 8px; padding: 8px 14px; border-radius: var(--radius-md); flex-wrap: wrap; }
	.subtitle-pill.decor-side { border-radius: 0; padding-left: 12px; }
	.preview-token { transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1); line-height: 1.2; }
	.preview-token.active { transform: scale(1.18); }
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
