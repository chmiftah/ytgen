<script>
	import { X, Mic, Upload, Sparkles, RefreshCw, AlertCircle, Music, Play, Pause, CheckCircle2, Zap } from 'lucide-svelte';

	let {
		isOpen = false,
		onSuccess = () => {},
		onClose = () => {}
	} = $props();

	let audioFile = $state(null);
	let audioFileName = $state('');
	let audioFileSize = $state('');
	let audioPreviewUrl = $state('');
	let pacing = $state('balanced'); // 'fast' | 'balanced' | 'relaxed'
	let isProcessing = $state(false);
	let processStep = $state('');
	let errorMessage = $state('');
	let isDragOver = $state(false);

	let previewAudioEl = $state(null);
	let isPlayingPreview = $state(false);

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

		try {
			const formData = new FormData();
			formData.append('audio', audioFile);
			formData.append('pacing', pacing);

			const stepTimer1 = setTimeout(() => {
				if (isProcessing) processStep = '🧠 DeepSeek AI menganalisis konteks narasi & mencocokkan pose stickman terbaik...';
			}, 2000);

			const stepTimer2 = setTimeout(() => {
				if (isProcessing) processStep = '✂️ FFmpeg memotong audio per adegan & menyusun karaoke subtitle...';
			}, 4000);

			const res = await fetch('/api/stickman-audio-whisper', {
				method: 'POST',
				body: formData
			});

			clearTimeout(stepTimer1);
			clearTimeout(stepTimer2);

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Gagal memproses audio dengan Whisper.');
			}

			// Clean up local preview URL
			if (audioPreviewUrl) {
				URL.revokeObjectURL(audioPreviewUrl);
				audioPreviewUrl = '';
			}

			// Notify parent
			onSuccess(data);
			onClose();
		} catch (err) {
			console.error('Whisper Audio Import Error:', err);
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
	<div class="whisper-backdrop" onclick={handleCloseModal} role="presentation">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="whisper-modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<!-- Header -->
			<div class="whisper-header">
				<div class="whisper-title-group">
					<div class="whisper-icon-badge">
						<Mic size={20} class="text-indigo-400" />
					</div>
					<div>
						<div class="whisper-badge-row">
							<span class="whisper-tag"><Zap size={11} /> GROQ WHISPER-LARGE-V3</span>
							<span class="whisper-tag tag-deepseek"><Sparkles size={11} /> DEEPSEEK AI MATCHING</span>
						</div>
						<h2 class="whisper-title">Impor 1 File Audio Utuh ke Video</h2>
						<p class="whisper-subtitle">Transkrip ucapan Whisper + DeepSeek AI memilihkan ilustrasi stickman yang paling cocok</p>
					</div>
				</div>
				<button class="whisper-close-btn" onclick={handleCloseModal} disabled={isProcessing} aria-label="Tutup">
					<X size={18} />
				</button>
			</div>

			<!-- Body -->
			<div class="whisper-body">
				{#if errorMessage}
					<div class="whisper-alert alert-error">
						<AlertCircle size={16} />
						<span>{errorMessage}</span>
					</div>
				{/if}

				<!-- Dropzone -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="whisper-dropzone"
					class:dragover={isDragOver}
					class:has-file={!!audioFile}
					ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
					ondragleave={() => { isDragOver = false; }}
					ondrop={handleDrop}
				>
					<input
						type="file"
						id="whisper-file-input"
						accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
						class="hidden-input"
						onchange={handleFileInput}
						disabled={isProcessing}
					/>

					{#if !audioFile}
						<label for="whisper-file-input" class="dropzone-label">
							<div class="dropzone-icon-wrap">
								<Upload size={32} />
							</div>
							<span class="dropzone-primary-text">Klik atau seret file audio rekaman Anda ke sini</span>
							<span class="dropzone-hint-text">Mendukung MP3, WAV, M4A, AAC, OGG, WebM (maksimal hingga 25 MB)</span>
							<div class="dropzone-button-wrap">
								<span class="dropzone-fake-btn">Pilih File dari Komputer</span>
							</div>
						</label>
					{:else}
						<div class="file-chosen-box">
							<div class="file-icon-title">
								<div class="file-music-icon">
									<Music size={24} />
								</div>
								<div class="file-meta">
									<div class="file-name">{audioFileName}</div>
									<div class="file-size">{audioFileSize} • Audio Siap Ditranskrip</div>
								</div>
							</div>

							<!-- Mini Audio Player -->
							<div class="audio-preview-row">
								<audio
									bind:this={previewAudioEl}
									src={audioPreviewUrl}
									onended={() => isPlayingPreview = false}
									preload="metadata"
								></audio>
								<button type="button" class="preview-play-btn" onclick={togglePlayPreview} disabled={isProcessing}>
									{#if isPlayingPreview}
										<Pause size={14} /><span>Jeda Preview</span>
									{:else}
										<Play size={14} /><span>Dengarkan Audio</span>
									{/if}
								</button>
								<label for="whisper-file-input" class="change-file-btn" class:disabled={isProcessing}>
									Ganti File
								</label>
							</div>
						</div>
					{/if}
				</div>

				<!-- Pacing Setting -->
				<div class="pacing-section">
					<div class="pacing-header">
						<span class="pacing-title">⏱️ Ritme & Pacing Adegan:</span>
						<span class="pacing-desc">Berapa detik satu gambar stickman akan bertahan sebelum berganti</span>
					</div>

					<div class="pacing-grid">
						<!-- Fast -->
						<button
							type="button"
							class="pacing-card"
							class:active={pacing === 'fast'}
							onclick={() => pacing = 'fast'}
							disabled={isProcessing}
						>
							<div class="pacing-badge">⚡ Cepat (Shorts/TikTok)</div>
							<div class="pacing-dur">~3.0 - 5.5s</div>
							<div class="pacing-detail">Visual sering berganti, retensi penonton tinggi untuk format vertikal.</div>
						</button>

						<!-- Balanced -->
						<button
							type="button"
							class="pacing-card"
							class:active={pacing === 'balanced'}
							onclick={() => pacing = 'balanced'}
							disabled={isProcessing}
						>
							<div class="pacing-badge badge-rec">⭐ Seimbang (Rekomendasi)</div>
							<div class="pacing-dur">~4.0 - 7.5s</div>
							<div class="pacing-detail">Berganti pas di setiap akhir kalimat, ideal untuk YouTube edukasi & narasi.</div>
						</button>

						<!-- Relaxed -->
						<button
							type="button"
							class="pacing-card"
							class:active={pacing === 'relaxed'}
							onclick={() => pacing = 'relaxed'}
							disabled={isProcessing}
						>
							<div class="pacing-badge">☕ Santai (Podcast)</div>
							<div class="pacing-dur">~5.5 - 10.0s</div>
							<div class="pacing-detail">Satu gambar mengiringi 2-3 kalimat penjelasan mendalam.</div>
						</button>
					</div>
				</div>

				<!-- Process Progress Banner (When running) -->
				{#if isProcessing}
					<div class="processing-banner">
						<div class="spin-wrap">
							<RefreshCw size={24} class="spin text-indigo-400" />
						</div>
						<div class="processing-text-col">
							<div class="processing-main-text">Sedang Memproses Audio dengan Whisper AI...</div>
							<div class="processing-step-text">{processStep}</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="whisper-footer">
				<button class="whisper-cancel-btn" onclick={handleCloseModal} disabled={isProcessing}>
					Batal
				</button>
				<button
					class="whisper-submit-btn"
					onclick={handleSubmit}
					disabled={!audioFile || isProcessing}
				>
					{#if isProcessing}
						<RefreshCw size={16} class="spin" />
						<span>Memproses...</span>
					{:else}
						<Sparkles size={16} />
						<span>Mulai Transkrip & Buat Adegan →</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.whisper-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(4, 7, 18, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: scale(0.98); }
		to { opacity: 1; transform: scale(1); }
	}

	.whisper-modal {
		background: #0f1424;
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.25);
		border-radius: 20px;
		width: 100%;
		max-width: 680px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.whisper-header {
		padding: 20px 24px;
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
	}

	.whisper-title-group {
		display: flex;
		gap: 14px;
		align-items: flex-start;
	}

	.whisper-icon-badge {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #818cf8;
		flex-shrink: 0;
	}

	.whisper-badge-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.whisper-tag {
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		padding: 2px 7px;
		border-radius: 6px;
		background: rgba(99, 102, 241, 0.2);
		color: #a5b4fc;
		border: 1px solid rgba(99, 102, 241, 0.3);
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.whisper-tag.tag-free {
		background: rgba(16, 185, 129, 0.2);
		color: #6ee7b7;
		border-color: rgba(16, 185, 129, 0.35);
	}

	.whisper-tag.tag-deepseek {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25));
		color: #d8b4fe;
		border-color: rgba(168, 85, 247, 0.45);
	}

	.whisper-title {
		font-size: 1.15rem;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0;
		line-height: 1.3;
	}

	.whisper-subtitle {
		font-size: 0.8rem;
		color: #94a3b8;
		margin: 2px 0 0 0;
	}

	.whisper-close-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #94a3b8;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.whisper-close-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
	}

	.whisper-body {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-height: 75vh;
		overflow-y: auto;
	}

	.whisper-alert {
		padding: 12px 16px;
		border-radius: 10px;
		font-size: 0.84rem;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.alert-error {
		background: rgba(239, 68, 68, 0.12);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
	}

	.whisper-dropzone {
		border: 2px dashed rgba(255, 255, 255, 0.15);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.02);
		padding: 28px 20px;
		text-align: center;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.whisper-dropzone:hover, .whisper-dropzone.dragover {
		border-color: #818cf8;
		background: rgba(99, 102, 241, 0.06);
	}

	.whisper-dropzone.has-file {
		border-style: solid;
		border-color: rgba(99, 102, 241, 0.4);
		background: rgba(99, 102, 241, 0.04);
		cursor: default;
		padding: 18px 20px;
	}

	.hidden-input {
		display: none;
	}

	.dropzone-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		gap: 8px;
	}

	.dropzone-icon-wrap {
		width: 56px;
		height: 56px;
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #818cf8;
		margin-bottom: 4px;
	}

	.dropzone-primary-text {
		font-size: 0.95rem;
		font-weight: 600;
		color: #e2e8f0;
	}

	.dropzone-hint-text {
		font-size: 0.78rem;
		color: #64748b;
	}

	.dropzone-button-wrap {
		margin-top: 10px;
	}

	.dropzone-fake-btn {
		font-size: 0.8rem;
		font-weight: 600;
		color: #a5b4fc;
		background: rgba(99, 102, 241, 0.12);
		border: 1px solid rgba(99, 102, 241, 0.25);
		padding: 6px 14px;
		border-radius: 8px;
		transition: all 0.15s ease;
	}

	.dropzone-label:hover .dropzone-fake-btn {
		background: rgba(99, 102, 241, 0.22);
		color: #fff;
	}

	.file-chosen-box {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.file-icon-title {
		display: flex;
		align-items: center;
		gap: 14px;
		text-align: left;
	}

	.file-music-icon {
		width: 44px;
		height: 44px;
		border-radius: 10px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: #34d399;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.file-meta {
		flex: 1;
		min-width: 0;
	}

	.file-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: #f1f5f9;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.file-size {
		font-size: 0.78rem;
		color: #34d399;
		font-weight: 500;
	}

	.audio-preview-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-top: 10px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.preview-play-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		padding: 6px 14px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #e2e8f0;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.preview-play-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
	}

	.change-file-btn {
		font-size: 0.8rem;
		color: #94a3b8;
		cursor: pointer;
		padding: 6px 10px;
		border-radius: 8px;
		transition: color 0.15s ease;
	}

	.change-file-btn:hover {
		color: #e2e8f0;
		text-decoration: underline;
	}

	.pacing-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.pacing-header {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.pacing-title {
		font-size: 0.88rem;
		font-weight: 700;
		color: #e2e8f0;
	}

	.pacing-desc {
		font-size: 0.76rem;
		color: #64748b;
	}

	.pacing-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}

	.pacing-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 12px;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.pacing-card:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.pacing-card.active {
		background: rgba(99, 102, 241, 0.12);
		border-color: #818cf8;
		box-shadow: 0 0 16px rgba(99, 102, 241, 0.2);
	}

	.pacing-badge {
		font-size: 0.72rem;
		font-weight: 700;
		color: #94a3b8;
	}

	.pacing-card.active .pacing-badge {
		color: #a5b4fc;
	}

	.pacing-badge.badge-rec {
		color: #38bdf8;
	}

	.pacing-dur {
		font-size: 1.05rem;
		font-weight: 800;
		color: #f1f5f9;
	}

	.pacing-detail {
		font-size: 0.7rem;
		color: #64748b;
		line-height: 1.35;
	}

	.pacing-card.active .pacing-detail {
		color: #cbd5e1;
	}

	.processing-banner {
		background: rgba(99, 102, 241, 0.1);
		border: 1px solid rgba(99, 102, 241, 0.25);
		border-radius: 12px;
		padding: 14px 18px;
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.spin-wrap {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.processing-main-text {
		font-size: 0.88rem;
		font-weight: 700;
		color: #f1f5f9;
	}

	.processing-step-text {
		font-size: 0.76rem;
		color: #a5b4fc;
		margin-top: 2px;
	}

	.whisper-footer {
		padding: 16px 24px;
		background: rgba(255, 255, 255, 0.02);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 12px;
	}

	.whisper-cancel-btn {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #94a3b8;
		padding: 8px 18px;
		border-radius: 10px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.whisper-cancel-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
		color: #fff;
	}

	.whisper-submit-btn {
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: #fff;
		border: none;
		padding: 9px 20px;
		border-radius: 10px;
		font-size: 0.88rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
		transition: all 0.15s ease;
	}

	.whisper-submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
	}

	.whisper-submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	@media (max-width: 640px) {
		.pacing-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
