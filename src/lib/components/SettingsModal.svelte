<script>
	import { onMount } from 'svelte';
	import { X, Key, ShieldCheck, ExternalLink, Play, Square, EyeOff, Eye, Check, RefreshCw, Wifi } from 'lucide-svelte';
	import { POPULAR_VOICES } from '$lib/services/voiceService.js';

	let {
		isOpen = false,
		pexelsApiKey = $bindable(''),
		elevenLabsApiKey = $bindable(''),
		deepseekApiKey = $bindable('sk-0802f45e1d4e41c8ae8d46396c97b746'),
		selectedVoiceId = $bindable('pNInz6obpgDQGcFmaJgB'),
		onClose
	} = $props();

	let showDeepseekKey = $state(false);
	let showPexelsKey = $state(false);
	let showElevenKey = $state(false);
	let availableVoices = $state(POPULAR_VOICES);
	let isFetchingVoices = $state(false);
	let voiceFetchStatus = $state(''); // '', 'ok', 'error'
	let elevenSubscription = $state(null); // ElevenLabs subscription info & character limits
	let pexelsStatus = $state(''); // '', 'ok', 'error'
	let isSaving = $state(false);

	// Voice preview
	let playingVoiceId = $state(null);
	let audioEl = $state(null);

	onMount(() => {
		const savedDeepseek = localStorage.getItem('yt_deepseek_key');
		const savedPexels = localStorage.getItem('yt_pexels_key');
		const savedEleven = localStorage.getItem('yt_eleven_key');
		const savedVoice = localStorage.getItem('yt_voice_id');
		if (savedDeepseek) deepseekApiKey = savedDeepseek;
		if (savedPexels) pexelsApiKey = savedPexels;
		if (savedEleven) {
			elevenLabsApiKey = savedEleven;
			// Auto-fetch voices & quota if key already saved
			fetchElevenLabsVoices(savedEleven);
		}
		if (savedVoice) selectedVoiceId = savedVoice;
	});

	async function fetchElevenLabsVoices(key) {
		if (!key || key.trim().length < 10) return;
		isFetchingVoices = true;
		voiceFetchStatus = '';
		try {
			const res = await fetch(`/api/elevenlabs?apiKey=${encodeURIComponent(key.trim())}`);
			const data = await res.json();
			if (data.success && data.voices && data.voices.length > 0) {
				// Merge fetched voices with sampleUrl from POPULAR_VOICES where possible
				availableVoices = data.voices.map(v => {
					const local = POPULAR_VOICES.find(p => p.id === v.id);
					return {
						...v,
						emoji: local?.emoji || '🎙️',
						sampleUrl: local?.sampleUrl || null
					};
				});
				// Make sure current selection is valid
				if (!availableVoices.find(v => v.id === selectedVoiceId)) {
					selectedVoiceId = availableVoices[0]?.id || selectedVoiceId;
				}
				if (data.subscription) {
					elevenSubscription = data.subscription;
				} else {
					elevenSubscription = null;
				}
				voiceFetchStatus = 'ok';
			} else {
				voiceFetchStatus = 'error';
				elevenSubscription = null;
			}
		} catch (e) {
			voiceFetchStatus = 'error';
			elevenSubscription = null;
		} finally {
			isFetchingVoices = false;
		}
	}

	async function validatePexelsKey(key) {
		if (!key || key.trim().length < 10) { pexelsStatus = ''; return; }
		try {
			const res = await fetch('https://api.pexels.com/videos/search?query=nature&per_page=1', {
				headers: { Authorization: key.trim() }
			});
			pexelsStatus = res.ok ? 'ok' : 'error';
		} catch {
			pexelsStatus = 'error';
		}
	}

	function togglePreview(voice) {
		if (!audioEl) return;
		if (playingVoiceId === voice.id) {
			audioEl.pause();
			audioEl.currentTime = 0;
			playingVoiceId = null;
			return;
		}
		if (voice.sampleUrl) {
			audioEl.src = voice.sampleUrl;
			audioEl.play().catch(() => {});
			playingVoiceId = voice.id;
			audioEl.onended = () => { playingVoiceId = null; };
		}
	}

	function selectVoice(id) {
		selectedVoiceId = id;
		if (audioEl && !audioEl.paused) {
			audioEl.pause();
			audioEl.currentTime = 0;
			playingVoiceId = null;
		}
	}

	async function saveSettings() {
		isSaving = true;
		// Validate keys before save
		const hasEleven = elevenLabsApiKey && elevenLabsApiKey.trim().length > 10;
		const hasPexels = pexelsApiKey && pexelsApiKey.trim().length > 10;

		if (hasEleven && voiceFetchStatus !== 'ok') {
			await fetchElevenLabsVoices(elevenLabsApiKey);
		}
		if (hasPexels && pexelsStatus !== 'ok') {
			await validatePexelsKey(pexelsApiKey);
		}

		localStorage.setItem('yt_deepseek_key', deepseekApiKey || 'sk-0802f45e1d4e41c8ae8d46396c97b746');
		localStorage.setItem('yt_pexels_key', pexelsApiKey || '');
		localStorage.setItem('yt_eleven_key', elevenLabsApiKey || '');
		localStorage.setItem('yt_voice_id', selectedVoiceId || 'pNInz6obpgDQGcFmaJgB');
		if (audioEl) { audioEl.pause(); playingVoiceId = null; }
		isSaving = false;
		onClose();
	}
</script>


<!-- Hidden audio element for sample preview -->
<audio bind:this={audioEl} style="display:none"></audio>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose} role="dialog" aria-modal="true">
		<div class="modal-container glass-panel" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<div class="header-title">
					<Key size={20} color="var(--primary)" />
					<div>
						<h3>Konfigurasi API & Suara</h3>
						<p>Kunci API disimpan secara aman di browser lokal Anda.</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose}>
					<X size={18} />
				</button>
			</div>

			<div class="modal-body">
				<!-- Notice banner -->
				<div class="notice-box">
					<ShieldCheck size={18} color="var(--highlight-green)" />
					<div class="notice-text">
						<strong>Mode Fallback Siap Pakai:</strong> Tanpa API key, aplikasi tetap berfungsi menggunakan footage terkurasi dan suara sintetis otomatis.
					</div>
				</div>

				<!-- Voice Selector -->
				<div class="field-group">
					<label>Pilih Suara Narasi <span class="label-hint">— klik ▶ untuk preview sample</span></label>
					<div class="voice-grid">
						{#each availableVoices as voice}
							<div
								class="voice-card"
								class:selected={selectedVoiceId === voice.id}
								onclick={() => selectVoice(voice.id)}
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && selectVoice(voice.id)}
							>
								<div class="voice-card-top">
									<span class="voice-emoji">{voice.emoji}</span>
									<div class="voice-info">
										<span class="voice-name">{voice.name}</span>
										<span class="voice-cat">{voice.category}</span>
									</div>
									<div class="voice-actions">
										{#if voice.sampleUrl}
											<button
												type="button"
												class="preview-btn"
												class:playing={playingVoiceId === voice.id}
												onclick={(e) => { e.stopPropagation(); togglePreview(voice); }}
												title="Preview suara"
											>
												{#if playingVoiceId === voice.id}
													<Square size={12} />
												{:else}
													<Play size={12} />
												{/if}
											</button>
										{/if}
										{#if selectedVoiceId === voice.id}
											<span class="selected-badge">
												<Check size={11} />
											</span>
										{/if}
									</div>
								</div>
								<p class="voice-desc">{voice.description}</p>
								{#if playingVoiceId === voice.id}
									<div class="waveform-bar">
										<span></span><span></span><span></span><span></span><span></span>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- ElevenLabs Key -->
				<div class="field-group">
					<div class="field-header">
						<label for="eleven-key">ElevenLabs API Key
							{#if voiceFetchStatus === 'ok'}
								<span class="status-badge ok">✓ Terhubung — {availableVoices.length} suara dimuat</span>
							{:else if voiceFetchStatus === 'error'}
								<span class="status-badge err">✗ Key tidak valid</span>
							{/if}
						</label>
						<a href="https://elevenlabs.io" target="_blank" rel="noreferrer" class="api-link">
							<span>Dapatkan Key Gratis</span>
							<ExternalLink size={12} />
						</a>
					</div>
					<div class="key-input-wrapper">
						<input
							id="eleven-key"
							type={showElevenKey ? 'text' : 'password'}
							bind:value={elevenLabsApiKey}
							placeholder="sk_..."
						/>
						<button type="button" class="eye-btn" onclick={() => showElevenKey = !showElevenKey}>
							{#if showElevenKey}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
						</button>
					</div>
					<div class="key-actions">
						<button
							type="button"
							class="btn-test"
							disabled={isFetchingVoices || !elevenLabsApiKey}
							onclick={() => fetchElevenLabsVoices(elevenLabsApiKey)}
						>
							{#if isFetchingVoices}
								<RefreshCw size={13} class="spin" /> Memuat voices & kuota...
							{:else}
								<Wifi size={13} /> Test, Muat Voices & Cek Kuota
							{/if}
						</button>
						<span class="field-hint">Eleven Multilingual v2 · word-level timestamps</span>
					</div>

					{#if elevenSubscription}
						<div class="quota-card">
							<div class="quota-header">
								<div class="quota-tier-badge">
									<span class="tier-dot"></span>
									<span class="tier-name">{elevenSubscription.tier.toUpperCase()} PLAN</span>
								</div>
								<span class="reset-info">
									{#if elevenSubscription.resetUnix}
										Reset: {new Date(elevenSubscription.resetUnix * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
									{:else}
										Status: {elevenSubscription.status}
									{/if}
								</span>
							</div>

							<div class="quota-numbers">
								<div class="quota-stat">
									<span class="stat-label">Sisa Kuota Karakter</span>
									<span class="stat-val highlight">{elevenSubscription.remainingCharacters.toLocaleString('id-ID')}</span>
								</div>
								<div class="quota-stat right">
									<span class="stat-label">Terpakai / Limit</span>
									<span class="stat-val">{elevenSubscription.characterCount.toLocaleString('id-ID')} / {elevenSubscription.characterLimit.toLocaleString('id-ID')}</span>
								</div>
							</div>

							<div class="quota-bar-track">
								<div 
									class="quota-bar-fill" 
									class:warning={elevenSubscription.percentUsed >= 70 && elevenSubscription.percentUsed < 90}
									class:danger={elevenSubscription.percentUsed >= 90}
									style="width: {elevenSubscription.percentUsed}%"
								></div>
							</div>
							<div class="quota-footer">
								<span>{elevenSubscription.percentUsed}% kuota terpakai</span>
								<span>~{Math.floor(elevenSubscription.remainingCharacters / 750)} menit durasi narasi tersisa</span>
							</div>
						</div>
					{/if}
				</div>

				<!-- DeepSeek Key -->
				<div class="field-group">
					<div class="field-header">
						<label for="deepseek-key">DeepSeek API Key (AI Script Analyzer)</label>
						<a href="https://platform.deepseek.com" target="_blank" rel="noreferrer" class="api-link">
							<span>DeepSeek Platform</span>
							<ExternalLink size={12} />
						</a>
					</div>
					<div class="key-input-wrapper">
						<input
							id="deepseek-key"
							type={showDeepseekKey ? 'text' : 'password'}
							bind:value={deepseekApiKey}
							placeholder="sk-..."
						/>
						<button type="button" class="eye-btn" onclick={() => showDeepseekKey = !showDeepseekKey}>
							{#if showDeepseekKey}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
						</button>
					</div>
				</div>

				<!-- Pexels Key -->
				<div class="field-group">
					<div class="field-header">
						<label for="pexels-key">Pexels API Key (Footage Video 16:9)
							{#if pexelsStatus === 'ok'}
								<span class="status-badge ok">✓ Terhubung</span>
							{:else if pexelsStatus === 'error'}
								<span class="status-badge err">✗ Key tidak valid</span>
							{/if}
						</label>
						<a href="https://www.pexels.com/api/" target="_blank" rel="noreferrer" class="api-link">
							<span>Daftar Gratis</span>
							<ExternalLink size={12} />
						</a>
					</div>
					<div class="key-input-wrapper">
						<input
							id="pexels-key"
							type={showPexelsKey ? 'text' : 'password'}
							bind:value={pexelsApiKey}
							placeholder="563492ad6f91700001000001..."
						/>
						<button type="button" class="eye-btn" onclick={() => showPexelsKey = !showPexelsKey}>
							{#if showPexelsKey}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
						</button>
					</div>
					<div class="key-actions">
						<button
							type="button"
							class="btn-test"
							disabled={!pexelsApiKey}
							onclick={() => validatePexelsKey(pexelsApiKey)}
						>
							<Wifi size={13} /> Test Koneksi Pexels
						</button>
						<span class="field-hint">Video landscape HD gratis dari Pexels.com</span>
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={onClose}>Batal</button>
				<button class="btn btn-primary" onclick={saveSettings} disabled={isSaving}>
					{#if isSaving}
						<RefreshCw size={14} class="spin" /> Menyimpan...
					{:else}
						<Check size={14} /> Simpan Pengaturan
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(4, 7, 13, 0.85);
		backdrop-filter: blur(8px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.modal-container {
		width: 100%;
		max-width: 620px;
		max-height: 90vh;
		overflow-y: auto;
		background: #0d1322;
		border: 1px solid var(--border-bright);
		box-shadow: var(--shadow-lg);
		border-radius: var(--radius-xl);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.header-title h3 { font-size: 1.1rem; }
	.header-title p { font-size: 0.78rem; color: var(--text-secondary); }

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.modal-body {
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		overflow-y: auto;
	}

	.notice-box {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		background: rgba(34, 197, 94, 0.08);
		border: 1px solid rgba(34, 197, 94, 0.25);
		border-radius: var(--radius-md);
		padding: 10px 14px;
	}

	.notice-text {
		font-size: 0.78rem;
		color: #bbf7d0;
		line-height: 1.4;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field-group > label {
		font-size: 0.825rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.label-hint {
		font-size: 0.72rem;
		font-weight: 400;
		color: var(--text-muted);
	}

	/* ── Voice Cards Grid ── */
	.voice-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.voice-card {
		padding: 12px 14px;
		background: rgba(255,255,255,0.03);
		border: 1.5px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all 0.18s ease;
		user-select: none;
	}

	.voice-card:hover {
		background: rgba(99, 102, 241, 0.07);
		border-color: rgba(99, 102, 241, 0.3);
	}

	.voice-card.selected {
		background: rgba(99, 102, 241, 0.12);
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}

	.voice-card-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.voice-emoji {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.voice-info {
		flex: 1;
		min-width: 0;
	}

	.voice-name {
		display: block;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.voice-cat {
		display: block;
		font-size: 0.7rem;
		color: var(--accent-cyan);
		font-weight: 500;
	}

	.voice-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.preview-btn {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primary);
		transition: all 0.15s ease;
	}

	.preview-btn:hover {
		background: rgba(99, 102, 241, 0.3);
		transform: scale(1.1);
	}

	.preview-btn.playing {
		background: rgba(6, 182, 212, 0.2);
		border-color: var(--accent-cyan);
		color: var(--accent-cyan);
		animation: pulse-ring 1.2s ease-in-out infinite;
	}

	@keyframes pulse-ring {
		0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
		50% { box-shadow: 0 0 0 5px rgba(6, 182, 212, 0); }
	}

	.selected-badge {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--primary);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.voice-desc {
		font-size: 0.72rem;
		color: var(--text-muted);
		line-height: 1.35;
		margin: 0;
	}

	/* Waveform animation when playing */
	.waveform-bar {
		display: flex;
		align-items: center;
		gap: 3px;
		height: 16px;
		margin-top: 8px;
	}

	.waveform-bar span {
		display: block;
		width: 3px;
		background: var(--accent-cyan);
		border-radius: 2px;
		animation: wave 0.8s ease-in-out infinite;
	}
	.waveform-bar span:nth-child(1) { animation-delay: 0s; height: 40%; }
	.waveform-bar span:nth-child(2) { animation-delay: 0.1s; height: 70%; }
	.waveform-bar span:nth-child(3) { animation-delay: 0.2s; height: 100%; }
	.waveform-bar span:nth-child(4) { animation-delay: 0.1s; height: 70%; }
	.waveform-bar span:nth-child(5) { animation-delay: 0s; height: 40%; }

	@keyframes wave {
		0%, 100% { transform: scaleY(0.4); }
		50% { transform: scaleY(1); }
	}

	/* ── API Key Fields ── */
	.field-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.field-header label {
		font-size: 0.825rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.required-tag {
		font-size: 0.68rem;
		font-weight: 500;
		color: #fbbf24;
		background: rgba(251,191,36,0.1);
		border-radius: 4px;
		padding: 1px 5px;
		margin-left: 6px;
	}

	.status-badge {
		font-size: 0.68rem;
		font-weight: 600;
		border-radius: 4px;
		padding: 2px 7px;
		margin-left: 8px;
		vertical-align: middle;
	}

	.status-badge.ok {
		background: rgba(34, 197, 94, 0.15);
		color: #4ade80;
		border: 1px solid rgba(34,197,94,0.3);
	}

	.status-badge.err {
		background: rgba(239, 68, 68, 0.12);
		color: #f87171;
		border: 1px solid rgba(239,68,68,0.25);
	}

	.key-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 6px;
	}

	.btn-test {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		font-size: 0.775rem;
		font-weight: 500;
		background: rgba(99, 102, 241, 0.12);
		border: 1px solid rgba(99, 102, 241, 0.35);
		border-radius: var(--radius-md);
		color: var(--primary);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.btn-test:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.22);
		border-color: var(--primary);
	}

	.btn-test:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-test :global(.spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.api-link {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.75rem;
		color: var(--accent-cyan);
		text-decoration: none;
	}

	.api-link:hover { text-decoration: underline; }

	.key-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.key-input-wrapper input {
		width: 100%;
		padding-right: 40px;
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}

	.eye-btn {
		position: absolute;
		right: 10px;
		padding: 6px;
		color: var(--text-muted);
	}

	.eye-btn:hover { color: var(--text-primary); }

	.field-hint {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	/* Quota Card */
	.quota-card {
		margin-top: 12px;
		padding: 14px 16px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.quota-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.quota-tier-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 3px 10px;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.25);
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 700;
		color: #10b981;
		letter-spacing: 0.04em;
	}

	.tier-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 6px #10b981;
	}

	.reset-info {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.quota-numbers {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.quota-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.quota-stat.right {
		align-items: flex-end;
	}

	.stat-label {
		font-size: 0.68rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.stat-val {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		color: var(--text-secondary);
	}

	.stat-val.highlight {
		font-size: 1.15rem;
		font-weight: 700;
		color: #10b981;
	}

	.quota-bar-track {
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 999px;
		overflow: hidden;
	}

	.quota-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #10b981, #059669);
		border-radius: 999px;
		transition: width 0.4s ease;
	}

	.quota-bar-fill.warning {
		background: linear-gradient(90deg, #f59e0b, #d97706);
	}

	.quota-bar-fill.danger {
		background: linear-gradient(90deg, #ef4444, #dc2626);
	}

	.quota-footer {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.modal-footer {
		padding: 16px 24px;
		background: rgba(255, 255, 255, 0.02);
		border-top: 1px solid var(--border-subtle);
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		flex-shrink: 0;
	}
</style>
