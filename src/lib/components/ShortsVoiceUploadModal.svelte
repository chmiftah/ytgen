<script>
	import { X, Mic, Upload, Sparkles, RefreshCw, AlertCircle, Music, Play, Pause, CheckCircle2, Film, Video, Layers, Wand2 } from 'lucide-svelte';

	let {
		isOpen = false,
		initialTheme = 'dark-psychology',
		onSuccess = () => {},
		onClose = () => {}
	} = $props();

	let audioFile = $state(null);
	let audioFileName = $state('');
	let audioFileSize = $state('');
	let audioPreviewUrl = $state('');
	let pacing = $state('balanced'); // 'fast' | 'balanced' | 'relaxed'
	let footageSource = $state('auto'); // 'auto' | 'giphy' | 'pexels'
	let selectedTheme = $state('dark-psychology');

	let isProcessing = $state(false);
	let processStep = $state('');
	let errorMessage = $state('');
	let isDragOver = $state(false);

	let previewAudioEl = $state(null);
	let isPlayingPreview = $state(false);

	$effect(() => {
		if (initialTheme) {
			selectedTheme = initialTheme;
		}
	});

	function formatBytes(bytes, decimals = 1) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	function handleFileSelect(file) {
		if (!file) return;
		if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|webm|flac)$/i.test(file.name)) {
			errorMessage = 'Format file tidak didukung. Harap pilih file audio (.mp3, .wav, .m4a, .aac, .ogg, .webm).';
			return;
		}

		errorMessage = '';
		audioFile = file;
		audioFileName = file.name;
		audioFileSize = formatBytes(file.size);

		if (audioPreviewUrl) {
			URL.revokeObjectURL(audioPreviewUrl);
		}
		audioPreviewUrl = URL.createObjectURL(file);
		isPlayingPreview = false;
	}

	function handleFileInput(e) {
		const files = e.target.files;
		if (files && files.length > 0) {
			handleFileSelect(files[0]);
		}
	}

	function handleDrop(e) {
		e.preventDefault();
		isDragOver = false;
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFileSelect(e.dataTransfer.files[0]);
		}
	}

	function togglePlayPreview() {
		if (!previewAudioEl) return;
		if (isPlayingPreview) {
			previewAudioEl.pause();
			isPlayingPreview = false;
		} else {
			previewAudioEl.play();
			isPlayingPreview = true;
		}
	}

	async function handleSubmit() {
		if (!audioFile || isProcessing) return;

		isProcessing = true;
		errorMessage = '';
		processStep = 'Mengunggah & mentranskrip suara dengan Groq Whisper Large-v3...';

		const timer1 = setTimeout(() => {
			if (isProcessing) processStep = '✂️ FFmpeg memotong audio per adegan & menyinkronkan timestamp kata...';
		}, 2500);

		const timer2 = setTimeout(() => {
			if (isProcessing) processStep = '🧠 AI menganalisis konteks narasi & meracik kata kunci visual GIPHY...';
		}, 5000);

		const timer3 = setTimeout(() => {
			if (isProcessing) processStep = '🎬 Mengambil footage animasi & klip GIPHY terbaik untuk semua adegan...';
		}, 8000);

		try {
			const formData = new FormData();
			formData.append('audio', audioFile);
			formData.append('pacing', pacing);
			formData.append('footageSource', footageSource);
			formData.append('theme', selectedTheme);

			const res = await fetch('/api/shorts-audio-whisper', {
				method: 'POST',
				body: formData
			});

			clearTimeout(timer1);
			clearTimeout(timer2);
			clearTimeout(timer3);

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Gagal memproses audio.');
			}

			if (audioPreviewUrl) {
				URL.revokeObjectURL(audioPreviewUrl);
				audioPreviewUrl = '';
			}

			onSuccess(data);
			onClose();
		} catch (err) {
			console.error('Shorts Voice Upload Error:', err);
			errorMessage = err.message || 'Terjadi kesalahan saat memproses audio.';
		} finally {
			isProcessing = false;
		}
	}

	function handleCloseModal() {
		if (isProcessing) return;
		if (audioPreviewUrl) {
			URL.revokeObjectURL(audioPreviewUrl);
			audioPreviewUrl = '';
		}
		if (previewAudioEl) {
			previewAudioEl.pause();
		}
		audioFile = null;
		audioFileName = '';
		audioFileSize = '';
		isPlayingPreview = false;
		errorMessage = '';
		onClose();
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={handleCloseModal} role="presentation">
		<div class="modal-card" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-icon">
					<Mic size={22} />
				</div>
				<div class="header-text">
					<h3>Upload Voice Narator Shorts</h3>
					<p>Transkrip otomatis dengan Whisper, AI rancang adegan, & cari footage GIPHY sekaligus!</p>
				</div>
				<button class="btn-close" onclick={handleCloseModal} disabled={isProcessing} aria-label="Tutup">
					<X size={20} />
				</button>
			</div>

			<!-- Body -->
			<div class="modal-body">
				<!-- Upload Box -->
				{#if !audioFile}
					<div
						class="dropzone"
						class:dragover={isDragOver}
						ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
						ondragleave={() => { isDragOver = false; }}
						ondrop={handleDrop}
					>
						<div class="drop-icon">
							<Upload size={36} />
						</div>
						<div class="drop-title">Seret file suara ke sini, atau klik untuk memilih</div>
						<div class="drop-sub">Format didukung: MP3, WAV, M4A, AAC, OGG, WEBM (Maks 50MB)</div>
						<label class="btn-browse">
							<Music size={16} />
							<span>Pilih File Audio</span>
							<input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm" onchange={handleFileInput} style="display: none;" />
						</label>
					</div>
				{:else}
					<!-- Selected Audio File Preview -->
					<div class="audio-preview-card">
						<div class="preview-left">
							<button class="btn-play-preview" onclick={togglePlayPreview} aria-label="Play/Pause Audio">
								{#if isPlayingPreview}
									<Pause size={20} />
								{:else}
									<Play size={20} />
								{/if}
							</button>
							<div class="file-details">
								<div class="file-name" title={audioFileName}>{audioFileName}</div>
								<div class="file-size">{audioFileSize} • Audio siap diproses</div>
							</div>
						</div>
						<button class="btn-remove-file" onclick={() => { audioFile = null; audioFileName = ''; isPlayingPreview = false; }} disabled={isProcessing}>
							Ganti File
						</button>
						<audio
							bind:this={previewAudioEl}
							src={audioPreviewUrl}
							onended={() => { isPlayingPreview = false; }}
							style="display: none;"
						></audio>
					</div>
				{/if}

				<!-- Configuration Options -->
				<div class="options-grid">
					<!-- Pacing -->
					<div class="option-group">
						<label class="group-label">⏱️ Pacing & Ritme Potongan Adegan</label>
						<div class="pill-group">
							<button
								type="button"
								class="pill-btn"
								class:active={pacing === 'fast'}
								onclick={() => pacing = 'fast'}
								disabled={isProcessing}
							>
								<span class="p-title">⚡ Cepat (2.2 - 4.2s)</span>
								<span class="p-sub">Tempo dinamis viral TikTok</span>
							</button>
							<button
								type="button"
								class="pill-btn"
								class:active={pacing === 'balanced'}
								onclick={() => pacing = 'balanced'}
								disabled={isProcessing}
							>
								<span class="p-title">⚖️ Seimbang (2.8 - 5.5s)</span>
								<span class="p-sub">Rekomendasi standar Shorts</span>
							</button>
							<button
								type="button"
								class="pill-btn"
								class:active={pacing === 'relaxed'}
								onclick={() => pacing = 'relaxed'}
								disabled={isProcessing}
							>
								<span class="p-title">🧘 Santai (4.0 - 7.0s)</span>
								<span class="p-sub">Edukasi & renungan tenang</span>
							</button>
						</div>
					</div>

					<!-- Footage Source -->
					<div class="option-group">
						<label class="group-label">🎬 Preferensi Footage</label>
						<div class="pill-group">
							<button
								type="button"
								class="pill-btn"
								class:active={footageSource === 'auto'}
								onclick={() => footageSource = 'auto'}
								disabled={isProcessing}
							>
								<span class="p-title">✨ Auto (GIPHY + Pexels)</span>
								<span class="p-sub">GIPHY animasi + backup video</span>
							</button>
							<button
								type="button"
								class="pill-btn"
								class:active={footageSource === 'giphy'}
								onclick={() => footageSource = 'giphy'}
								disabled={isProcessing}
							>
								<span class="p-title">👾 GIPHY Only</span>
								<span class="p-sub">Animasi ekspresif & meme</span>
							</button>
							<button
								type="button"
								class="pill-btn"
								class:active={footageSource === 'pexels'}
								onclick={() => footageSource = 'pexels'}
								disabled={isProcessing}
							>
								<span class="p-title">📹 Pexels 9:16 Video</span>
								<span class="p-sub">Realistis stock video HD</span>
							</button>
						</div>
					</div>
				</div>

				<!-- Workflow Highlights -->
				<div class="pipeline-card">
					<div class="card-tag">Alur Otomatis</div>
					<div class="steps-row">
						<div class="step-item">
							<div class="step-dot">1</div>
							<div class="step-desc">Whisper Transkrip</div>
						</div>
						<div class="step-arrow">→</div>
						<div class="step-item">
							<div class="step-dot">2</div>
							<div class="step-desc">FFmpeg Audio Slice</div>
						</div>
						<div class="step-arrow">→</div>
						<div class="step-item">
							<div class="step-dot">3</div>
							<div class="step-desc">AI Analisis Visual</div>
						</div>
						<div class="step-arrow">→</div>
						<div class="step-item">
							<div class="step-dot">4</div>
							<div class="step-desc">Cari Footage GIPHY</div>
						</div>
					</div>
				</div>

				<!-- Error Banner -->
				{#if errorMessage}
					<div class="error-banner">
						<AlertCircle size={18} />
						<span>{errorMessage}</span>
					</div>
				{/if}

				<!-- Processing Progress Banner -->
				{#if isProcessing}
					<div class="processing-banner">
						<RefreshCw size={20} class="spin" />
						<div class="proc-text">
							<div class="proc-title">Sedang memproses audio Anda...</div>
							<div class="proc-desc">{processStep}</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				<button class="btn-cancel" onclick={handleCloseModal} disabled={isProcessing}>
					Batal
				</button>
				<button class="btn-submit" onclick={handleSubmit} disabled={!audioFile || isProcessing}>
					{#if isProcessing}
						<RefreshCw size={18} class="spin" />
						<span>Memproses AI & GIPHY...</span>
					{:else}
						<Sparkles size={18} />
						<span>Analisis Voice & Cari Footage →</span>
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
		background: rgba(4, 7, 18, 0.82);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		animation: fadeIn 0.2s ease-out;
	}

	.modal-card {
		background: #0d1124;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 20px;
		width: 100%;
		max-width: 640px;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 20px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.header-icon {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: linear-gradient(135deg, #6366f1, #a855f7);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
	}

	.header-text {
		flex: 1;
	}

	.header-text h3 {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 700;
		color: #fff;
		letter-spacing: -0.02em;
	}

	.header-text p {
		margin: 3px 0 0;
		font-size: 0.82rem;
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.35;
	}

	.btn-close {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-close:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
	}

	.modal-body {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-height: calc(85vh - 140px);
		overflow-y: auto;
	}

	/* Dropzone */
	.dropzone {
		border: 2px dashed rgba(99, 102, 241, 0.4);
		border-radius: 16px;
		padding: 30px 20px;
		background: rgba(99, 102, 241, 0.04);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.dropzone:hover, .dropzone.dragover {
		border-color: #818cf8;
		background: rgba(99, 102, 241, 0.09);
		transform: translateY(-1px);
	}

	.drop-icon {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: rgba(99, 102, 241, 0.15);
		color: #818cf8;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;
	}

	.drop-title {
		font-size: 0.96rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 4px;
	}

	.drop-sub {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 16px;
	}

	.btn-browse {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 9px 18px;
		border-radius: 10px;
		background: #6366f1;
		color: #fff;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
		box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
	}

	.btn-browse:hover {
		background: #4f46e5;
		transform: translateY(-1px);
	}

	/* Audio Preview Card */
	.audio-preview-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 18px;
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.preview-left {
		display: flex;
		align-items: center;
		gap: 14px;
		overflow: hidden;
	}

	.btn-play-preview {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: #10b981;
		color: #fff;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
		transition: transform 0.15s;
	}

	.btn-play-preview:hover {
		transform: scale(1.06);
	}

	.file-details {
		overflow: hidden;
	}

	.file-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 320px;
	}

	.file-size {
		font-size: 0.78rem;
		color: #10b981;
		margin-top: 2px;
	}

	.btn-remove-file {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.7);
		padding: 6px 12px;
		border-radius: 8px;
		font-size: 0.78rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-remove-file:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
	}

	/* Options Grid */
	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.group-label {
		display: block;
		font-size: 0.82rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 8px;
	}

	.pill-group {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}

	.pill-btn {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 10px 12px;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 3px;
		transition: all 0.15s;
	}

	.pill-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.pill-btn.active {
		background: rgba(99, 102, 241, 0.15);
		border-color: #6366f1;
		box-shadow: 0 0 14px rgba(99, 102, 241, 0.2);
	}

	.p-title {
		font-size: 0.82rem;
		font-weight: 600;
		color: #fff;
	}

	.p-sub {
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.5);
		line-height: 1.25;
	}

	/* Pipeline Card */
	.pipeline-card {
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		padding: 14px 16px;
		position: relative;
	}

	.card-tag {
		font-size: 0.7rem;
		font-weight: 700;
		color: #a855f7;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 10px;
	}

	.steps-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}

	.step-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.step-dot {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(168, 85, 247, 0.2);
		color: #c084fc;
		font-size: 0.7rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.step-desc {
		font-size: 0.74rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.step-arrow {
		color: rgba(255, 255, 255, 0.25);
		font-size: 0.75rem;
	}

	/* Error & Processing Banners */
	.error-banner {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-radius: 12px;
		background: rgba(239, 68, 68, 0.12);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		font-size: 0.83rem;
	}

	.processing-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 18px;
		border-radius: 12px;
		background: rgba(99, 102, 241, 0.14);
		border: 1px solid rgba(99, 102, 241, 0.35);
		color: #fff;
	}

	.proc-title {
		font-size: 0.86rem;
		font-weight: 600;
		color: #c7d2fe;
	}

	.proc-desc {
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.75);
		margin-top: 2px;
	}

	/* Footer */
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 12px;
		padding: 16px 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}

	.btn-cancel {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: rgba(255, 255, 255, 0.7);
		padding: 10px 18px;
		border-radius: 10px;
		font-size: 0.86rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-cancel:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
		color: #fff;
	}

	.btn-submit {
		display: flex;
		align-items: center;
		gap: 8px;
		background: linear-gradient(135deg, #6366f1, #a855f7);
		border: none;
		color: #fff;
		padding: 10px 22px;
		border-radius: 10px;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 18px rgba(99, 102, 241, 0.4);
	}

	.btn-submit:hover:not(:disabled) {
		opacity: 0.95;
		transform: translateY(-1px);
		box-shadow: 0 6px 22px rgba(99, 102, 241, 0.5);
	}

	.btn-submit:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	:global(.spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scaleUp {
		from { opacity: 0; transform: scale(0.96) translateY(6px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}

	@media (max-width: 600px) {
		.pill-group {
			grid-template-columns: 1fr;
		}
		.steps-row {
			flex-direction: column;
			align-items: flex-start;
		}
		.step-arrow {
			display: none;
		}
	}
</style>
