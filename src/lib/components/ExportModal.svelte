<script>
	import { X, Download, FileText, Film, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Copy, Check } from 'lucide-svelte';
	import { exportToSRT, exportToVTT, generateYouTubeTimestamps } from '$lib/services/subtitleService.js';
	import { triggerDownload } from '$lib/services/clientExporter.js';

	let {
		isOpen = false,
		scenes = [],
		subtitleStyleKey = 'hormozi',
		karaokeEnabled = true,
		subtitleFontSize = 34,
		selectedBgmId = 'ambient-focus',
		bgmVolume = 0.15,
		onClose
	} = $props();

	let isRendering = $state(false);
	let renderProgress = $state(0);
	let renderError = $state(null);
	let downloadUrl = $state(null);
	let downloadFilename = $state('');
	let renderStep = $state('');
	let copiedTimestamps = $state(false);
	let renderQuality = $state('1080p'); // '1080p' | '720p'

	let youtubeTimestamps = $derived(generateYouTubeTimestamps(scenes));

	function copyTimestamps() {
		if (!youtubeTimestamps) return;
		navigator.clipboard.writeText(youtubeTimestamps).then(() => {
			copiedTimestamps = true;
			setTimeout(() => {
				copiedTimestamps = false;
			}, 2000);
		});
	}


	async function startServerRender() {
		isRendering = true;
		renderError = null;
		downloadUrl = null;
		renderProgress = 5;
		renderStep = 'Menyiapkan pipeline render...';

		try {
			const bgmUrl =
				selectedBgmId === 'none'
					? null
					: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

			const res = await fetch('/api/render', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scenes,
					subtitleStyle: subtitleStyleKey,
					karaokeEnabled,
					fontSize: subtitleFontSize,
					bgmUrl,
					bgmVolume,
					renderQuality
				})
			});

			if (!res.ok || !res.body) {
				throw new Error(`Server error: ${res.statusText}`);
			}

			// Read SSE stream
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
					if (!line.startsWith('data:')) continue;
					try {
						const payload = JSON.parse(line.slice(5).trim());
						if (payload.progress !== undefined) renderProgress = payload.progress;
						if (payload.step) renderStep = payload.step;
						if (payload.error) throw new Error(payload.error);
						if (payload.done) {
							downloadUrl = payload.downloadUrl;
							downloadFilename = payload.filename || 'youtube-long-video.mp4';
						}
					} catch (parseErr) {
						if (parseErr.message && !parseErr.message.startsWith('Unexpected')) {
							throw parseErr; // real error from server
						}
					}
				}
			}

			if (!downloadUrl) throw new Error('Render selesai tapi tidak ada file output.');
		} catch (err) {
			console.error('Render error:', err);
			renderError = err.message;
		} finally {
			isRendering = false;
		}
	}


	function downloadSRT() {
		const content = exportToSRT(scenes);
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		triggerDownload(url, 'subtitles-youtube.srt');
	}

	function downloadVTT() {
		const content = exportToVTT(scenes);
		const blob = new Blob([content], { type: 'text/vtt;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		triggerDownload(url, 'subtitles-youtube.vtt');
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={onClose}>
		<div class="modal-container glass-panel" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<div class="header-title">
					<Film size={20} color="var(--primary)" />
					<div>
						<h3>Export Video YouTube Long</h3>
						<p>Render video 16:9 1080p lengkap dengan footage, subtitle, dan voiceover.</p>
					</div>
				</div>
				<button class="close-btn" onclick={onClose}>
					<X size={18} />
				</button>
			</div>

			<div class="modal-body">
				<!-- MP4 Video Export Section -->
				<div class="export-card">
					<div class="card-left">
						<div class="icon-circle video">
							<Film size={24} color="var(--primary)" />
						</div>
						<div>
							<h4>Video MP4 ({renderQuality === '720p' ? '720p Fast Draft' : '1080p Full HD'})</h4>
							<p>Kombinasi video footage 16:9, burned-in subtitle, narasi voiceover, & musik latar.</p>
							
							<!-- M1 Hardware Quality Selector -->
							<div class="quality-picker">
								<button 
									type="button" 
									class="quality-btn" 
									class:active={renderQuality === '1080p'}
									onclick={() => renderQuality = '1080p'}
									disabled={isRendering}
									title="Standar YouTube Full HD kualitas tinggi"
								>
									<span>🚀 1080p Produksi (M1 Hardware)</span>
								</button>
								<button 
									type="button" 
									class="quality-btn" 
									class:active={renderQuality === '720p'}
									onclick={() => renderQuality = '720p'}
									disabled={isRendering}
									title="Fast Draft: 2x lebih cepat untuk review naskah panjang 30-60 menit"
								>
									<span>⚡ 720p Fast Draft</span>
								</button>
							</div>

							<div class="meta-row">
								<span class="meta-badge">{renderQuality === '720p' ? '1280x720 (Draft)' : '1920x1080 (Full HD)'}</span>
								<span class="meta-badge hardware">⚡ M1 VideoToolbox</span>
								<span class="meta-badge">{scenes.length} Scenes</span>
							</div>
						</div>
					</div>

					<div class="card-action">
						{#if downloadUrl}
							<a 
								href={downloadUrl} 
								download={downloadFilename} 
								class="btn btn-accent btn-sm"
								target="_blank"
							>
								<Download size={15} />
								<span>Download MP4</span>
							</a>
						{:else}
							<button 
								class="btn btn-primary btn-sm" 
								onclick={startServerRender}
								disabled={isRendering || scenes.length === 0}
							>
								{#if isRendering}
									<RefreshCw size={14} class="spin" />
									<span>Memproses FFmpeg...</span>
								{:else}
									<Sparkles size={14} />
									<span>Mulai Render Video</span>
								{/if}
							</button>
						{/if}
					</div>
				</div>

				<!-- Render Progress Bar -->
				{#if isRendering || renderProgress > 0}
					<div class="progress-box">
						<div class="progress-header">
							<span>Status Render: {renderProgress}%</span>
							<span>{renderProgress === 100 ? '✅ Selesai!' : renderStep || 'Memproses...'}</span>
						</div>
						<div class="progress-track">
							<div class="progress-fill" style="width: {renderProgress}%"></div>
						</div>
					</div>
				{/if}

				{#if renderError}
					<div class="error-box">
						<AlertCircle size={16} color="var(--danger)" />
						<span>Gagal: {renderError}</span>
					</div>
				{/if}

				{#if downloadUrl}
					<div class="success-box">
						<CheckCircle2 size={18} color="var(--highlight-green)" />
						<div class="success-info">
							<strong>Video Berhasil Dirender!</strong>
							<span>Klik tombol Download MP4 di atas untuk menyimpan video ke komputer Anda.</span>
						</div>
					</div>
				{/if}

				<div class="divider">
					<span>EXPORT SUBTITLE SAJA</span>
				</div>

				<!-- Subtitles Export Section -->
				<div class="sub-export-row">
					<div class="sub-item">
						<div class="sub-info">
							<FileText size={18} color="var(--accent-cyan)" />
							<div>
								<h5>Format .SRT (SubRip)</h5>
								<p>Format standar untuk upload langsung ke YouTube Studio.</p>
							</div>
						</div>
						<button class="btn btn-secondary btn-sm" onclick={downloadSRT} disabled={scenes.length === 0}>
							<Download size={14} />
							<span>Download .SRT</span>
						</button>
					</div>

					<div class="sub-item">
						<div class="sub-info">
							<FileText size={18} color="var(--accent-purple)" />
							<div>
								<h5>Format .VTT (WebVTT)</h5>
								<p>Format modern untuk pemutar video HTML5 web.</p>
							</div>
						</div>
						<button class="btn btn-secondary btn-sm" onclick={downloadVTT} disabled={scenes.length === 0}>
							<Download size={14} />
							<span>Download .VTT</span>
						</button>
					</div>
				</div>

				<!-- YouTube Chapters Timestamps Section -->
				{#if youtubeTimestamps}
					<div class="divider">
						<span>YOUTUBE CHAPTER TIMESTAMPS</span>
					</div>

					<div class="timestamps-box">
						<div class="timestamps-header">
							<div class="timestamps-title">
								<Sparkles size={14} color="#10b981" />
								<span>Deskripsi Bab YouTube (Siap Paste):</span>
							</div>
							<button 
								type="button" 
								class="btn-copy-timestamps" 
								onclick={copyTimestamps}
							>
								{#if copiedTimestamps}
									<Check size={13} color="#10b981" />
									<span style="color:#10b981;font-weight:700">Tersalin!</span>
								{:else}
									<Copy size={13} />
									<span>Salin Semua Timestamps</span>
								{/if}
							</button>
						</div>
						<pre class="timestamps-pre">{youtubeTimestamps}</pre>
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={onClose}>Tutup</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(4, 7, 13, 0.82);
		backdrop-filter: blur(8px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.modal-container {
		width: 100%;
		max-width: 640px;
		background: #0d1322;
		border: 1px solid var(--border-bright);
		box-shadow: var(--shadow-lg);
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid var(--border-subtle);
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.header-title h3 {
		font-size: 1.15rem;
	}

	.header-title p {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.modal-body {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.export-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		background: #111828;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		gap: 16px;
	}

	.card-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.icon-circle {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		flex-shrink: 0;
	}

	.card-left h4 {
		font-size: 0.95rem;
		margin-bottom: 2px;
	}

	.card-left p {
		font-size: 0.775rem;
		color: var(--text-secondary);
		margin-bottom: 6px;
	}

	.quality-picker {
		display: flex;
		gap: 6px;
		margin-bottom: 8px;
		flex-wrap: wrap;
	}

	.quality-btn {
		font-size: 0.72rem;
		font-weight: 500;
		padding: 4px 9px;
		border-radius: var(--radius-sm);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.quality-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-main);
	}

	.quality-btn.active {
		background: rgba(99, 102, 241, 0.18);
		border-color: rgba(99, 102, 241, 0.45);
		color: #a5b4fc;
		font-weight: 600;
	}

	.meta-badge {
		font-size: 0.675rem;
		padding: 2px 6px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
	}

	.meta-badge.hardware {
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.25);
		color: #34d399;
		font-weight: 600;
	}

	.progress-box {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.775rem;
		color: var(--text-secondary);
	}

	.progress-track {
		width: 100%;
		height: 8px;
		background: #1a233a;
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%);
		transition: width 0.3s ease;
	}

	.success-box {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.25);
		border-radius: var(--radius-md);
	}

	.success-info {
		display: flex;
		flex-direction: column;
		font-size: 0.8rem;
		color: #bbf7d0;
	}

	.error-box {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-md);
		font-size: 0.8rem;
		color: #fca5a5;
	}

	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		color: var(--text-dim);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		margin: 6px 0;
	}

	.divider::before, .divider::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid var(--border-subtle);
	}

	.divider span {
		padding: 0 10px;
	}

	.sub-export-row {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.sub-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 14px;
		background: #101626;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
	}

	.sub-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.sub-info h5 {
		font-size: 0.85rem;
	}

	.sub-info p {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	/* YouTube Timestamps Box */
	.timestamps-box {
		background: #090e1a;
		border: 1px solid rgba(16, 185, 129, 0.25);
		border-radius: var(--radius-md);
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.timestamps-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.timestamps-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.78rem;
		font-weight: 600;
		color: #10b981;
	}

	.btn-copy-timestamps {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 6px;
		color: #10b981;
		font-size: 0.72rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-copy-timestamps:hover {
		background: rgba(16, 185, 129, 0.2);
		border-color: rgba(16, 185, 129, 0.5);
	}

	.timestamps-pre {
		margin: 0;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.6;
		color: #e2e8f0;
		white-space: pre-wrap;
		user-select: all;
	}

	.modal-footer {
		padding: 16px 24px;
		background: rgba(255, 255, 255, 0.02);
		border-top: 1px solid var(--border-subtle);
		display: flex;
		justify-content: flex-end;
	}
</style>
