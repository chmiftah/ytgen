<script>
	import { X, Sparkles, Wand2, Clock, BookOpen, Copy, Check, RefreshCw, AlertCircle, Compass, Zap, Flame } from 'lucide-svelte';

	let {
		isOpen = false,
		deepseekApiKey = '',
		initialTopic = '',
		onSelectScript,
		onClose
	} = $props();

	let topic = $state('');
	let niche = $state('psychology');

	$effect(() => {
		if (isOpen && initialTopic) {
			topic = initialTopic;
		}
	});
	let formula = $state('curiosity_gap');
	let durationTarget = $state('medium');
	let languageStyle = $state('casual_smart');
	let customNotes = $state('');

	let generatedScript = $state('');
	let isGenerating = $state(false);
	let errorMessage = $state('');
	let copied = $state(false);
	let streamOutputEl = $state(null);

	const NICHES = [
		{ id: 'psychology', label: '🧠 Psikologi & Mindset', desc: 'Overthinking, kebiasaan buruk, dopamin' },
		{ id: 'finance', label: '💰 Finansial & Bisnis', desc: 'Arus kas, investasi, psikologi uang' },
		{ id: 'science', label: '🔬 Sains & AI', desc: 'Paradoks, alam semesta, masa depan robot' },
		{ id: 'philosophy', label: '🏛️ Filosofi & Stoikisme', desc: 'Ketenangan batin, Marcus Aurelius' },
		{ id: 'social', label: '🗣️ Relasi & Komunikasi', desc: 'Bahasa tubuh, orang toxic, trik obrolan' }
	];

	const FORMULAS = [
		{ id: 'curiosity_gap', icon: '🪝', label: 'Curiosity Gap', desc: 'Bongkar paradoks atau fakta yang menentang logika umum' },
		{ id: 'relatable_pain', icon: '🧠', label: 'Relatable Pain', desc: 'Membahas keresahan nyata: prokrastinasi & lelah mental' },
		{ id: 'story_twist', icon: '📈', label: 'Story & Twist', desc: 'Studi kasus nyata dengan dinamika naik-turun dan kejutan' },
		{ id: 'mind_bending', icon: '🤯', label: 'Analogi Gila', desc: 'Konsep rumit dipecah jadi perumpamaan visual sehari-hari' }
	];

	const VIRAL_IDEAS = [
		{
			niche: 'psychology',
			title: 'Jebakan Dopamin',
			prompt: 'Kenapa makin kita coba berhenti scroll HP, otak kita makin gelisah dan susah tidur?'
		},
		{
			niche: 'finance',
			title: 'Jebakan Gaya Hidup',
			prompt: 'Kenapa orang dengan gaji puluhan juta tetap sering pusing di akhir bulan daripada petugas kebersihan?'
		},
		{
			niche: 'science',
			title: 'Paradoks Waktu',
			prompt: 'Kenapa waktu terasa berjalan sangat cepat saat kita dewasa tapi lambat waktu masih kecil?'
		},
		{
			niche: 'philosophy',
			title: 'Stoikisme Ketenangan',
			prompt: 'Cara tetap tenang dan tidak ambil pusing saat rencana hidup berantakan total'
		},
		{
			niche: 'business',
			title: 'Runtuhnya Blockbuster',
			prompt: 'Kisah fatal ketika raksasa rental film menertawakan ide Netflix dan bangkrut dalam semalam'
		}
	];

	let wordCount = $derived(generatedScript.trim() ? generatedScript.trim().split(/\s+/).length : 0);
	let estimatedSeconds = $derived(Math.round(wordCount * 0.43));
	let estimatedMinutes = $derived(Math.floor(estimatedSeconds / 60));
	let remainingSeconds = $derived(estimatedSeconds % 60);

	function applyViralIdea(idea) {
		topic = idea.prompt;
		if (idea.niche) niche = idea.niche;
	}

	async function handleGenerate() {
		if (!topic.trim() || isGenerating) return;

		isGenerating = true;
		errorMessage = '';
		generatedScript = '';

		try {
			const res = await fetch('/api/generate-stickman-script', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: topic.trim(),
					niche,
					formula,
					durationTarget,
					languageStyle,
					customNotes: customNotes.trim(),
					apiKey: deepseekApiKey
				})
			});

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData.error || `HTTP ${res.status}: Gagal memanggil AI Generator`);
			}

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
					if (trimmed === 'data: [DONE]') break;

					try {
						const parsed = JSON.parse(trimmed.slice(5).trim());
						if (parsed.text) {
							generatedScript += parsed.text;
							if (streamOutputEl) {
								streamOutputEl.scrollTop = streamOutputEl.scrollHeight;
							}
						}
					} catch {}
				}
			}
		} catch (err) {
			console.error('Error generating stickman script:', err);
			errorMessage = err.message || 'Terjadi kesalahan saat membuat naskah';
		} finally {
			isGenerating = false;
		}
	}

	function handleApplyScript() {
		if (!generatedScript.trim()) return;
		if (onSelectScript) {
			onSelectScript(generatedScript);
		}
		if (onClose) onClose();
	}

	function handleCopy() {
		if (!generatedScript) return;
		navigator.clipboard.writeText(generatedScript);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={(e) => { if (e.target === e.currentTarget) onClose?.(); }} role="presentation">
		<div class="modal-card">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-title-wrap">
					<div class="header-icon"><Flame size={20} class="text-flame" /></div>
					<div>
						<h2>AI Script Generator Stickman Viral</h2>
						<p>Diformulasikan khusus untuk retensi tinggi, hook anti-skip, dan visual stickman papan tulis.</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose} title="Tutup">
					<X size={18} />
				</button>
			</div>

			<!-- Body (Split 2 Columns) -->
			<div class="modal-body">
				<!-- Left Column: Settings & Prompts -->
				<div class="form-col">
					<!-- Topic Input -->
					<div class="field-group">
						<label for="stickman-topic">
							<span>Topik / Masalah yang Ingin Dibahas</span>
							<span class="required">*</span>
						</label>
						<textarea
							id="stickman-topic"
							bind:value={topic}
							rows="3"
							placeholder="Contoh: Kenapa orang pintar sering terjebak overthinking dan malas bertindak..."
						></textarea>
					</div>

					<!-- Viral Idea Pills -->
					<div class="field-group">
						<span class="sub-label">⚡ Contoh Ide Viral Sekali Klik:</span>
						<div class="idea-pills">
							{#each VIRAL_IDEAS as idea}
								<button
									type="button"
									class="idea-pill"
									onclick={() => applyViralIdea(idea)}
									title="{idea.prompt}"
								>
									<span>{idea.title}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Niche Selector -->
					<div class="field-group">
						<span class="sub-label">Kategori / Niche:</span>
						<div class="niche-chips">
							{#each NICHES as n}
								<button
									type="button"
									class="niche-chip"
									class:active={niche === n.id}
									onclick={() => niche = n.id}
									title="{n.desc}"
								>
									{n.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Formula Viral -->
					<div class="field-group">
						<span class="sub-label">Formula Retensi (Hook Style):</span>
						<div class="formula-grid">
							{#each FORMULAS as f}
								<div
									class="formula-card"
									class:active={formula === f.id}
									onclick={() => formula = f.id}
									role="button"
									tabindex="0"
									onkeydown={(e) => e.key === 'Enter' && (formula = f.id)}
								>
									<span class="formula-icon">{f.icon}</span>
									<div class="formula-info">
										<strong>{f.label}</strong>
										<small>{f.desc}</small>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Duration & Style Row -->
					<div class="grid-2-row">
						<div class="field-group">
							<span class="sub-label">Target Durasi:</span>
							<select bind:value={durationTarget} class="form-select">
								<option value="short">⚡ Ringkas (2–3 Menit • ~350 kata)</option>
								<option value="medium">⭐ Standar YouTube (4–6 Menit • ~750 kata)</option>
								<option value="long">🎬 Lengkap (7–9 Menit • ~1.150 kata)</option>
								<option value="long_12">🔥 Long Form (10–12 Menit • ~1.650 kata)</option>
								<option value="long_15">👑 Deep Dive Master (13–15 Menit • ~2.200 kata)</option>
							</select>
						</div>

						<div class="field-group">
							<span class="sub-label">Gaya Bahasa:</span>
							<select bind:value={languageStyle} class="form-select">
								<option value="casual_smart">☕ Santai Cerdas (Kamu/Kita)</option>
								<option value="creator_punchy">⚡ Kreator Lincah & Punchy</option>
								<option value="documentary">🎙️ Dokumenter Sinematik</option>
							</select>
						</div>
					</div>

					<!-- Generate Button -->
					<button
						type="button"
						class="btn-generate-main"
						disabled={!topic.trim() || isGenerating}
						onclick={handleGenerate}
					>
						{#if isGenerating}
							<RefreshCw size={17} class="spin" />
							<span>Menulis Naskah Viral (DeepSeek AI)...</span>
						{:else}
							<Wand2 size={17} />
							<span>Tulis Naskah Stickman Auto-Viral</span>
						{/if}
					</button>

					{#if errorMessage}
						<div class="error-banner">
							<AlertCircle size={15} />
							<span>{errorMessage}</span>
						</div>
					{/if}
				</div>

				<!-- Right Column: Live Output Display -->
				<div class="output-col">
					<div class="output-header">
						<div class="output-stats">
							<span>Panjang: <strong>{wordCount} kata</strong></span>
							{#if wordCount > 0}
								<span class="stats-sep">•</span>
								<span>Estimasi: <strong>~{estimatedMinutes > 0 ? `${estimatedMinutes}m ` : ''}{remainingSeconds}s</strong></span>
							{/if}
						</div>
						<div class="output-actions">
							{#if generatedScript}
								<button type="button" class="action-btn" onclick={handleCopy} title="Salin naskah ke clipboard">
									{#if copied}<Check size={14} class="text-green" />{:else}<Copy size={14} />{/if}
									<span>{copied ? 'Tersalin' : 'Salin'}</span>
								</button>
							{/if}
						</div>
					</div>

					<div class="output-scroll-wrap" bind:this={streamOutputEl}>
						{#if generatedScript}
							<pre class="script-pre">{generatedScript}</pre>
						{:else if isGenerating}
							<div class="loading-state">
								<Sparkles size={28} class="spin-slow text-flame" />
								<p>Sedang meracik hook pembuka dan alur visual stickman...</p>
							</div>
						{:else}
							<div class="empty-state">
								<Compass size={36} class="text-muted" />
								<h4>Naskah Siap Diracik</h4>
								<p>Pilih topik atau ketik ide di sebelah kiri, lalu klik <strong>Tulis Naskah Stickman</strong>.</p>
							</div>
						{/if}
					</div>

					<!-- Footer Action -->
					{#if generatedScript && !isGenerating}
						<div class="output-footer">
							<button type="button" class="btn-apply-studio" onclick={handleApplyScript}>
								<span>🚀 Masukkan ke Studio & Buat Video</span>
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
		background: rgba(4, 7, 18, 0.78);
		backdrop-filter: blur(8px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.modal-card {
		width: 100%;
		max-width: 1040px;
		max-height: 90vh;
		background: #0f1524;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.12);
		overflow: hidden;
		animation: modalFadeIn 0.22s ease-out;
	}

	@keyframes modalFadeIn {
		from { opacity: 0; transform: scale(0.97) translateY(10px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.header-title-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.header-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.text-flame { color: #f87171; }
	.text-green { color: #34d399; }
	.text-muted { color: #64748b; opacity: 0.6; }

	.header-title-wrap h2 {
		font-size: 1.05rem;
		font-weight: 700;
		color: #f8fafc;
		margin: 0;
	}

	.header-title-wrap p {
		font-size: 0.74rem;
		color: #94a3b8;
		margin: 2px 0 0;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #94a3b8;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #f8fafc;
	}

	.modal-body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		overflow: hidden;
		flex: 1;
		min-height: 480px;
	}

	.form-col {
		padding: 20px;
		overflow-y: auto;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-group label, .sub-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #cbd5e1;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.required { color: #ef4444; }

	textarea, .form-select {
		width: 100%;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.28);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		color: #f8fafc;
		font-size: 0.82rem;
		font-family: inherit;
		resize: vertical;
		box-sizing: border-box;
	}

	textarea:focus, .form-select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}

	.idea-pills {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.idea-pill {
		padding: 4px 9px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 999px;
		font-size: 0.7rem;
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.15s;
	}

	.idea-pill:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		color: #f8fafc;
	}

	.niche-chips {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.niche-chip {
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		font-size: 0.72rem;
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.15s;
	}

	.niche-chip:hover {
		border-color: rgba(255, 255, 255, 0.2);
		color: #f8fafc;
	}

	.niche-chip.active {
		background: rgba(99, 102, 241, 0.2);
		border-color: #6366f1;
		color: #e0e7ff;
		font-weight: 600;
	}

	.formula-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.formula-card {
		display: flex;
		gap: 8px;
		padding: 8px 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		cursor: pointer;
		align-items: flex-start;
		transition: all 0.15s;
	}

	.formula-card:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.18);
	}

	.formula-card.active {
		background: rgba(239, 68, 68, 0.12);
		border-color: #ef4444;
	}

	.formula-icon { font-size: 1.1rem; }
	.formula-info { display: flex; flex-direction: column; gap: 2px; }
	.formula-info strong { font-size: 0.74rem; color: #f8fafc; }
	.formula-info small { font-size: 0.65rem; color: #94a3b8; line-height: 1.3; }

	.grid-2-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.btn-generate-main {
		margin-top: 6px;
		padding: 12px 18px;
		background: linear-gradient(135deg, #ef4444, #dc2626);
		border: none;
		border-radius: 10px;
		color: #ffffff;
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
		transition: all 0.2s;
	}

	.btn-generate-main:hover:not(:disabled) {
		filter: brightness(1.1);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
	}

	.btn-generate-main:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error-banner {
		padding: 8px 12px;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.output-col {
		display: flex;
		flex-direction: column;
		background: rgba(0, 0, 0, 0.18);
		overflow: hidden;
	}

	.output-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.output-stats {
		font-size: 0.74rem;
		color: #94a3b8;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.output-stats strong { color: #f8fafc; }
	.stats-sep { opacity: 0.4; }

	.output-actions { display: flex; gap: 8px; }
	.action-btn {
		padding: 4px 10px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: #cbd5e1;
		font-size: 0.72rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.output-scroll-wrap {
		flex: 1;
		padding: 16px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.script-pre {
		margin: 0;
		font-family: inherit;
		font-size: 0.82rem;
		line-height: 1.6;
		color: #e2e8f0;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.loading-state, .empty-state {
		margin: auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 30px;
		color: #94a3b8;
	}

	.empty-state h4 { margin: 4px 0 0; color: #f8fafc; font-size: 0.92rem; }
	.empty-state p { margin: 0; font-size: 0.75rem; max-width: 260px; line-height: 1.4; }

	.output-footer {
		padding: 12px 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.btn-apply-studio {
		width: 100%;
		padding: 11px 16px;
		background: linear-gradient(135deg, #4f46e5, #4338ca);
		border: none;
		border-radius: 10px;
		color: #ffffff;
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);
		transition: all 0.2s;
	}

	.btn-apply-studio:hover {
		filter: brightness(1.12);
		transform: translateY(-1px);
	}

	.spin { animation: spin 1s linear infinite; }
	.spin-slow { animation: spin 2.5s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	@media (max-width: 840px) {
		.modal-body { grid-template-columns: 1fr; }
		.form-col { border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
	}
</style>
