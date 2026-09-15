<script>
	import { X, Sparkles, Wand2, Clock, BookOpen, Copy, Check, RefreshCw, AlertCircle, Film, Lightbulb, Compass } from 'lucide-svelte';

	let {
		isOpen = false,
		deepseekApiKey = '',
		initialTopic = '',
		initialHookStyle = '',
		onSelectScript,
		onOpenTopicGenerator,
		onClose
	} = $props();

	let topic = $state('');
	let durationTarget = $state('medium'); // 'short' | 'medium' | 'long'
	let tone = $state('storytelling'); // 'storytelling' | 'casual' | 'mystery' | 'business'
	let hookStyle = $state('curiosity_gap'); // 'curiosity_gap' | 'high_stakes' | 'mystery_investigative' | 'in_media_res' | 'provocative_question'
	let customInstructions = $state('');

	$effect(() => {
		if (isOpen && initialTopic) {
			topic = initialTopic;
			if (initialHookStyle) hookStyle = initialHookStyle;
		}
	});

	let generatedScript = $state('');
	let isGenerating = $state(false);
	let errorMessage = $state('');
	let copied = $state(false);
	let streamOutputEl = $state(null);

	const QUICK_TOPICS = [
		{ label: '🤖 Eksperimen Lab AI', prompt: 'Cerita di Balik Pintu Lab AI: Mengapa Para Peneliti Top Mendadak Resign dan Bikin Publik Penasaran' },
		{ label: '🧠 Jebakan Dopamin', prompt: 'Ilusi Produktivitas: Cara Halus Algoritma Medsos Bikin Otak Kita Kecanduan Tanpa Pernah Kita Sadari' },
		{ label: '💰 Jebakan Finansial', prompt: 'Psikologi Uang: Alasan Kenapa Kerja Keras Banting Tulang Saja Seringkali Bikin Orang Muter-Muter di Tempat yang Sama' },
		{ label: '🌌 Misteri Luar Angkasa', prompt: 'Sinyal Ganjil dari Luar Angkasa: Penemuan Aneh Teleskop James Webb yang Bikin Para Astronom Garuk-Garuk Kepala' },
		{ label: '⏳ Pola Sejarah Menarik', prompt: 'Pola Aneh Sejarah: 3 Tanda Tak Terduga Sebelum Peradaban Besar Berubah Total yang Mulai Kelihatan Sekarang' }
	];

	let wordCount = $derived(generatedScript.trim() ? generatedScript.trim().split(/\s+/).length : 0);
	let estimatedSeconds = $derived(Math.round(wordCount * 0.45));
	let estimatedMinutes = $derived(Math.floor(estimatedSeconds / 60));
	let remainingSeconds = $derived(estimatedSeconds % 60);

	function selectQuickTopic(item) {
		topic = item.prompt;
	}

	async function handleGenerate() {
		if (!topic.trim() || isGenerating) return;

		isGenerating = true;
		errorMessage = '';
		generatedScript = '';

		try {
			const res = await fetch('/api/generate-script', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: topic.trim(),
					durationTarget,
					tone,
					hookStyle,
					customInstructions: customInstructions.trim(),
					apiKey: deepseekApiKey
				})
			});

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData.error || `HTTP ${res.status}: Gagal memanggil DeepSeek API`);
			}

			// Read SSE Stream
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed || !trimmed.startsWith('data:')) continue;
					if (trimmed === 'data: [DONE]') {
						break;
					}

					try {
						const parsed = JSON.parse(trimmed.slice(5).trim());
						if (parsed.text) {
							generatedScript += parsed.text;
							// Auto scroll to bottom
							if (streamOutputEl) {
								streamOutputEl.scrollTop = streamOutputEl.scrollHeight;
							}
						}
					} catch (e) {
						// ignore chunk parse errors
					}
				}
			}
		} catch (err) {
			console.error('Error generating script:', err);
			errorMessage = err.message;
		} finally {
			isGenerating = false;
		}
	}

	function handleApplyScript() {
		if (!generatedScript.trim()) return;
		onSelectScript(generatedScript.trim());
		onClose();
	}

	function copyToClipboard() {
		if (!generatedScript) return;
		navigator.clipboard.writeText(generatedScript).then(() => {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose} role="dialog" aria-modal="true" tabindex="-1">
		<div class="modal-container glass-panel" onclick={(e) => e.stopPropagation()} role="document">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-title">
					<div class="header-icon-wrap">
						<Sparkles size={20} color="var(--accent-cyan)" />
					</div>
					<div>
						<h3>Tulis Naskah AI dengan DeepSeek</h3>
						<p>Buat naskah YouTube Long lengkap dengan struktur bab otomatis dan retensi tinggi.</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose} title="Tutup">
					<X size={18} />
				</button>
			</div>

			<!-- Body: Two-Column Layout on Desktop -->
			<div class="modal-body">
				<!-- Left Column: Settings & Topic Input -->
				<div class="settings-col">
					<!-- Topic Input -->
					<div class="form-group">
						<div class="topic-label-header">
							<label for="script-topic">
								<span>Topik / Judul Naskah</span>
								<span class="required">*</span>
							</label>
							{#if onOpenTopicGenerator}
								<button
									type="button"
									class="btn-open-topic-finder"
									onclick={onOpenTopicGenerator}
									title="Buka Generator Ide Topik Viral"
								>
									<Lightbulb size={13} color="#facc15" />
									<span>💡 Buntu ide? Cari Topik Viral</span>
								</button>
							{/if}
						</div>
						<textarea
							id="script-topic"
							class="topic-textarea"
							bind:value={topic}
							placeholder="Tuliskan topik atau pertanyaan sentral video Anda... Contoh: Mengapa manusia sulit konsisten membangun kebiasaan baik?"
							rows={3}
							disabled={isGenerating}
						></textarea>
					</div>

					<!-- Quick Topic Chips -->
					<div class="quick-topics-row">
						<span class="quick-label"><Lightbulb size={12} /> Ide Cepat:</span>
						<div class="quick-chips">
							{#each QUICK_TOPICS as item}
								<button
									type="button"
									class="quick-chip"
									onclick={() => selectQuickTopic(item)}
									disabled={isGenerating}
									title="Gunakan topik ini"
								>
									{item.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Viral Hook Framework Selector -->
					<div class="form-group">
						<div class="hook-header-row">
							<label>
								<Sparkles size={13} color="#f59e0b" />
								<span>Formula Hook Pembuka (0–15 Detik Pertama)</span>
							</label>
							<span class="hook-badge-viral">Anti-Skip</span>
						</div>
						<div class="hooks-grid">
							<button
								type="button"
								class="hook-pill-btn"
								class:active={hookStyle === 'curiosity_gap'}
								onclick={() => hookStyle = 'curiosity_gap'}
								disabled={isGenerating}
							>
								<span class="hook-emoji">🎯</span>
								<div class="hook-btn-text">
									<strong>Paradoks & Fakta Terbalik</strong>
									<small>Bongkar mitos yang bikin penonton berhenti scrolling</small>
								</div>
							</button>

							<button
								type="button"
								class="hook-pill-btn"
								class:active={hookStyle === 'high_stakes'}
								onclick={() => hookStyle = 'high_stakes'}
								disabled={isGenerating}
							>
								<span class="hook-emoji">⚡</span>
								<div class="hook-btn-text">
									<strong>High Stakes & Situasi Kritis</strong>
									<small>Risiko darurat & titik balik masa depan penonton</small>
								</div>
							</button>

							<button
								type="button"
								class="hook-pill-btn"
								class:active={hookStyle === 'mystery_investigative'}
								onclick={() => hookStyle = 'mystery_investigative'}
								disabled={isGenerating}
							>
								<span class="hook-emoji">🕵️</span>
								<div class="hook-btn-text">
									<strong>Misteri & Dokumen Rahasia</strong>
									<small>Arsip tersembunyi ala Vox, Lemmino & Johnny Harris</small>
								</div>
							</button>

							<button
								type="button"
								class="hook-pill-btn"
								class:active={hookStyle === 'in_media_res'}
								onclick={() => hookStyle = 'in_media_res'}
								disabled={isGenerating}
							>
								<span class="hook-emoji">🎬</span>
								<div class="hook-btn-text">
									<strong>In-Media-Res (Puncak Aksi)</strong>
									<small>Mulai tepat di detik paling genting tanpa intro bertele-tele</small>
								</div>
							</button>

							<button
								type="button"
								class="hook-pill-btn"
								class:active={hookStyle === 'provocative_question'}
								onclick={() => hookStyle = 'provocative_question'}
								disabled={isGenerating}
							>
								<span class="hook-emoji">💡</span>
								<div class="hook-btn-text">
									<strong>Pertanyaan Provokatif</strong>
									<small>Menampar asumsi logika & langsung mengikat emosi penonton</small>
								</div>
							</button>
						</div>
					</div>

					<!-- Duration Target Selector -->
					<div class="form-group">
						<label>
							<Clock size={13} />
							<span>Target Durasi Video</span>
						</label>
						<div class="pills-grid">
							<button
								type="button"
								class="selector-pill"
								class:active={durationTarget === 'short'}
								onclick={() => durationTarget = 'short'}
								disabled={isGenerating}
							>
								<strong>⚡ Singkat (2–3 Menit)</strong>
								<small>~350 kata • 2 Bab</small>
							</button>

							<button
								type="button"
								class="selector-pill"
								class:active={durationTarget === 'medium'}
								onclick={() => durationTarget = 'medium'}
								disabled={isGenerating}
							>
								<strong>🎬 Sedang (5–8 Menit)</strong>
								<small>~800 kata • 3 Bab • Rekomendasi</small>
							</button>

							<button
								type="button"
								class="selector-pill"
								class:active={durationTarget === 'long'}
								onclick={() => durationTarget = 'long'}
								disabled={isGenerating}
							>
								<strong>📚 Mendalam (10–15 Menit)</strong>
								<small>~1.600 kata • 4–5 Bab</small>
							</button>
						</div>
					</div>

					<!-- Tone of Voice Selector -->
					<div class="form-group">
						<label>
							<Compass size={13} />
							<span>Gaya Bahasa & Suasana (Tone)</span>
						</label>
						<div class="tones-grid">
							<button
								type="button"
								class="tone-card"
								class:active={tone === 'storytelling'}
								onclick={() => tone = 'storytelling'}
								disabled={isGenerating}
							>
								<span class="tone-icon">☕</span>
								<div class="tone-text">
									<strong>Storytelling Santai ⭐</strong>
									<small>Luwes, mengalir, kayak lagi cerita seru ke teman</small>
								</div>
							</button>

							<button
								type="button"
								class="tone-card"
								class:active={tone === 'casual'}
								onclick={() => tone = 'casual'}
								disabled={isGenerating}
							>
								<span class="tone-icon">💡</span>
								<div class="tone-text">
									<strong>Edukasi Santai</strong>
									<small>Ramah, mudah dicerna, analogi simpel sehari-hari</small>
								</div>
							</button>

							<button
								type="button"
								class="tone-card"
								class:active={tone === 'mystery'}
								onclick={() => tone = 'mystery'}
								disabled={isGenerating}
							>
								<span class="tone-icon">🕵️</span>
								<div class="tone-text">
									<strong>Misteri Bikin Penasaran</strong>
									<small>Santai tapi bikin merinding & teka-teki seru</small>
								</div>
							</button>

							<button
								type="button"
								class="tone-card"
								class:active={tone === 'business'}
								onclick={() => tone = 'business'}
								disabled={isGenerating}
							>
								<span class="tone-icon">💬</span>
								<div class="tone-text">
									<strong>Deep Talk & Mindset</strong>
									<small>Obrolan santai reflektif, menyentuh realitas hidup</small>
								</div>
							</button>
						</div>
					</div>

					<!-- Custom Instructions (Optional) -->
					<div class="form-group">
						<label for="custom-instructions">
							<span>Instruksi Tambahan (Opsional)</span>
						</label>
						<input
							id="custom-instructions"
							type="text"
							class="text-input"
							bind:value={customInstructions}
							placeholder="Contoh: Fokus pada sudut pandang ilmiah, hindari jargon berlebihan..."
							disabled={isGenerating}
						/>
					</div>

					<!-- Generate Action Button -->
					<button
						type="button"
						class="btn btn-primary btn-block generate-action-btn"
						onclick={handleGenerate}
						disabled={isGenerating || !topic.trim()}
					>
						{#if isGenerating}
							<RefreshCw size={16} class="spin" />
							<span>DeepSeek Menulis Naskah...</span>
						{:else}
							<Wand2 size={16} />
							<span>{generatedScript ? 'Generate Ulang Naskah' : 'Mulai Tulis Naskah'}</span>
						{/if}
					</button>

					{#if errorMessage}
						<div class="error-alert">
							<AlertCircle size={15} color="var(--danger)" />
							<span>{errorMessage}</span>
						</div>
					{/if}
				</div>

				<!-- Right Column: Live Streaming Preview & Output -->
				<div class="output-col">
					<div class="output-header">
						<div class="output-stats">
							<span class="stat-tag"><BookOpen size={12} /> {wordCount} Kata</span>
							<span class="stat-tag"><Clock size={12} /> ~{estimatedMinutes}m {remainingSeconds}s</span>
						</div>

						<div class="output-actions">
							{#if generatedScript}
								<button
									type="button"
									class="btn-icon-subtle"
									onclick={copyToClipboard}
									title="Salin Naskah ke Clipboard"
								>
									{#if copied}
										<Check size={14} color="var(--highlight-green)" />
										<span class="copied-text">Tersalin!</span>
									{:else}
										<Copy size={14} />
										<span>Salin</span>
									{/if}
								</button>
							{/if}
						</div>
					</div>

					<div class="output-editor-wrap" bind:this={streamOutputEl}>
						{#if !generatedScript && !isGenerating}
							<div class="empty-preview">
								<div class="empty-icon-wrap">
									<Sparkles size={28} color="var(--primary)" />
								</div>
								<h4>Naskah AI Akan Muncul di Sini</h4>
								<p>Pilih topik di sebelah kiri dan klik <strong>Mulai Tulis Naskah</strong> untuk melihat DeepSeek merangkai alur cerita secara langsung.</p>
							</div>
						{:else}
							<textarea
								class="script-streaming-view"
								bind:value={generatedScript}
								placeholder="DeepSeek sedang memproses ide Anda..."
								readonly={isGenerating}
							></textarea>
						{/if}
					</div>

					{#if generatedScript && !isGenerating}
						<div class="output-footer">
							<button
								type="button"
								class="btn btn-accent btn-lg btn-apply"
								onclick={handleApplyScript}
							>
								<Check size={18} />
								<span>Gunakan Naskah Ini di Video Generator</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.82);
		backdrop-filter: blur(10px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.modal-container {
		width: 100%;
		max-width: 1080px;
		max-height: 90vh;
		background: #0d1322;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--radius-xl);
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15);
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(15, 23, 42, 0.5);
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.header-icon-wrap {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		background: rgba(6, 182, 212, 0.12);
		border: 1px solid rgba(6, 182, 212, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-title h3 {
		font-size: 1.15rem;
		font-weight: 700;
		color: #ffffff;
	}

	.header-title p {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 6px;
		border-radius: var(--radius-sm);
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.08);
	}

	/* Body: 2 Columns */
	.modal-body {
		display: grid;
		grid-template-columns: 460px 1fr;
		gap: 0;
		flex: 1;
		min-height: 520px;
		overflow: hidden;
	}

	@media (max-width: 900px) {
		.modal-body {
			grid-template-columns: 1fr;
			overflow-y: auto;
		}
	}

	.settings-col {
		padding: 20px 24px;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
		max-height: calc(90vh - 80px);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.topic-label-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.btn-open-topic-finder {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		background: rgba(250, 204, 21, 0.12);
		border: 1px solid rgba(250, 204, 21, 0.35);
		border-radius: 9999px;
		padding: 2px 8px;
		color: #facc15;
		font-size: 0.72rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
	}

	.btn-open-topic-finder:hover {
		background: rgba(250, 204, 21, 0.25);
		border-color: #facc15;
		color: #ffffff;
		transform: translateY(-1px);
	}

	.form-group label {
		font-size: 0.775rem;
		font-weight: 600;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 6px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.required {
		color: var(--danger);
	}

	.topic-textarea {
		width: 100%;
		background: #111827;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--radius-md);
		padding: 10px 12px;
		font-size: 0.85rem;
		color: var(--text-main);
		font-family: inherit;
		resize: vertical;
		transition: border-color 0.2s;
	}

	.topic-textarea:focus {
		outline: none;
		border-color: var(--primary);
	}

	.quick-topics-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.quick-label {
		font-size: 0.72rem;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.quick-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.quick-chip {
		font-size: 0.7rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-full);
		padding: 3px 9px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.quick-chip:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.15);
		border-color: rgba(99, 102, 241, 0.4);
		color: #ffffff;
	}

	/* ── Hook Selector Grid ── */
	.hook-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
	}

	.hook-header-row label {
		margin-bottom: 0;
	}

	.hook-badge-viral {
		font-size: 0.64rem;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: var(--radius-sm);
		background: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.hooks-grid {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.hook-pill-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 11px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: left;
	}

	.hook-pill-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.07);
		border-color: rgba(255, 255, 255, 0.16);
		transform: translateX(2px);
	}

	.hook-pill-btn.active {
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(99, 102, 241, 0.12) 100%);
		border-color: #f59e0b;
		box-shadow: 0 0 14px rgba(245, 158, 11, 0.15);
	}

	.hook-emoji {
		font-size: 1.1rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.hook-btn-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.hook-btn-text strong {
		font-size: 0.78rem;
		color: var(--text-main);
	}

	.hook-pill-btn.active .hook-btn-text strong {
		color: #fbbf24;
	}

	.hook-btn-text small {
		font-size: 0.69rem;
		color: var(--text-muted);
		line-height: 1.25;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pills-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.selector-pill {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.selector-pill strong {
		font-size: 0.78rem;
		color: var(--text-main);
	}

	.selector-pill small {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.selector-pill:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
	}

	.selector-pill.active {
		background: rgba(99, 102, 241, 0.16);
		border-color: rgba(99, 102, 241, 0.5);
	}

	.selector-pill.active strong {
		color: #a5b4fc;
	}

	.tones-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}

	.tone-card {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 8px 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.tone-icon {
		font-size: 1.1rem;
		line-height: 1;
	}

	.tone-text strong {
		display: block;
		font-size: 0.75rem;
		color: var(--text-main);
	}

	.tone-text small {
		font-size: 0.65rem;
		color: var(--text-muted);
		line-height: 1.2;
		display: block;
		margin-top: 1px;
	}

	.tone-card:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
	}

	.tone-card.active {
		background: rgba(6, 182, 212, 0.14);
		border-color: rgba(6, 182, 212, 0.5);
	}

	.tone-card.active strong {
		color: #38bdf8;
	}

	.text-input {
		width: 100%;
		background: #111827;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--radius-md);
		padding: 8px 12px;
		font-size: 0.8rem;
		color: var(--text-main);
	}

	.text-input:focus {
		outline: none;
		border-color: var(--primary);
	}

	.btn-block {
		width: 100%;
	}

	.generate-action-btn {
		padding: 12px;
		font-weight: 600;
		font-size: 0.88rem;
		margin-top: 4px;
	}

	.error-alert {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-md);
		color: #fca5a5;
		font-size: 0.78rem;
	}

	/* Right Output Column */
	.output-col {
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		background: #090d16;
		gap: 12px;
		overflow: hidden;
	}

	.output-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.output-stats {
		display: flex;
		gap: 8px;
	}

	.stat-tag {
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
	}

	.btn-icon-subtle {
		display: flex;
		align-items: center;
		gap: 5px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--text-secondary);
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		cursor: pointer;
	}

	.btn-icon-subtle:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}

	.copied-text {
		color: var(--highlight-green);
		font-weight: 600;
	}

	.output-editor-wrap {
		flex: 1;
		min-height: 380px;
		background: #0c111e;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-lg);
		padding: 14px;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.empty-preview {
		margin: auto;
		text-align: center;
		max-width: 320px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.empty-icon-wrap {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-lg);
		background: rgba(99, 102, 241, 0.12);
		border: 1px solid rgba(99, 102, 241, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4px;
	}

	.empty-preview h4 {
		font-size: 0.95rem;
		color: var(--text-main);
	}

	.empty-preview p {
		font-size: 0.775rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.script-streaming-view {
		width: 100%;
		height: 100%;
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 0.88rem;
		line-height: 1.7;
		color: #e2e8f0;
		font-family: inherit;
		resize: none;
		white-space: pre-wrap;
	}

	.output-footer {
		padding-top: 8px;
	}

	.btn-apply {
		width: 100%;
		font-weight: 700;
		font-size: 0.9rem;
		padding: 12px;
		box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
	}
</style>
