<script>
	import { onDestroy } from 'svelte';
	import {
		Film,
		Mic,
		Trash2,
		ChevronUp,
		ChevronDown,
		Plus,
		Replace,
		Volume2,
		CheckCircle2,
		Bookmark,
		Upload,
		Square,
		Play,
		FolderUp
	} from 'lucide-svelte';
	import { VoiceRecorder } from '$lib/services/audioAnalysisService.js';

	let {
		scenes = $bindable([]),
		activeSceneIndex = $bindable(0),
		onOpenFootagePicker,
		onRegenerateVoice,
		onAddScene,
		onUploadAudio,
		onBatchUploadAudio,
		onRecordAudio,
		onAdjustTimingOffset
	} = $props();

	let batchFileInput = $state(null);

	// In-browser recording state
	let recorder = null;
	let recordingSceneIndex = $state(-1);
	let recordingSeconds = $state(0);
	let recordingInterval = null;

	// In-card mini audio preview state
	let previewAudio = null;
	let previewPlayingIndex = $state(-1);

	function selectScene(index) {
		activeSceneIndex = index;
	}

	function moveScene(index, direction) {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= scenes.length) return;
		const temp = scenes[index];
		scenes[index] = scenes[newIndex];
		scenes[newIndex] = temp;
		activeSceneIndex = newIndex;
	}

	function deleteScene(index) {
		if (scenes.length <= 1) return;
		scenes = scenes.filter((_, i) => i !== index);
		if (activeSceneIndex >= scenes.length) {
			activeSceneIndex = scenes.length - 1;
		}
	}

	function addChapter(index) {
		const existingChapters = scenes.slice(0, index).filter((s) => s.chapter).length;
		const num = existingChapters + 1;
		scenes[index].chapter = {
			number: num,
			tag: `BAB ${String(num).padStart(2, '0')}`,
			title: `Bab ${num}`,
			subtitle: 'Pengantar topik pada segmen ini',
			style: 'center'
		};
	}

	function removeChapter(index) {
		scenes[index].chapter = null;
	}

	function handleSingleFileChange(index, e) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (onUploadAudio) {
			onUploadAudio(index, file);
		}
		e.target.value = '';
	}

	function handleBatchFileChange(e) {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;
		if (onBatchUploadAudio) {
			onBatchUploadAudio(files);
		}
		e.target.value = '';
	}

	function adjustOffset(index, delta) {
		if (onAdjustTimingOffset) {
			onAdjustTimingOffset(index, delta);
		}
	}

	async function startRecordingVoice(index) {
		try {
			if (recorder) {
				await recorder.stop().catch(() => {});
			}
			recorder = new VoiceRecorder();
			await recorder.start();
			recordingSceneIndex = index;
			recordingSeconds = 0;
			if (recordingInterval) clearInterval(recordingInterval);
			recordingInterval = setInterval(() => {
				recordingSeconds += 1;
			}, 1000);
		} catch (err) {
			alert('Tidak dapat mengakses mikrofon: ' + err.message);
		}
	}

	async function stopRecordingVoice(index) {
		if (!recorder) return;
		if (recordingInterval) clearInterval(recordingInterval);
		try {
			const audioBlob = await recorder.stop();
			recordingSceneIndex = -1;
			if (onRecordAudio) {
				onRecordAudio(index, audioBlob);
			}
		} catch (err) {
			console.error('Stop recording error:', err);
			recordingSceneIndex = -1;
		}
	}

	function cancelRecordingVoice() {
		if (recorder) {
			recorder.stop().catch(() => {});
		}
		if (recordingInterval) clearInterval(recordingInterval);
		recordingSceneIndex = -1;
	}

	function togglePreviewAudio(index, url) {
		if (previewPlayingIndex === index) {
			if (previewAudio) {
				previewAudio.pause();
				previewAudio = null;
			}
			previewPlayingIndex = -1;
			return;
		}

		if (previewAudio) {
			previewAudio.pause();
		}

		previewPlayingIndex = index;
		previewAudio = new Audio(url);
		previewAudio.onended = () => {
			previewPlayingIndex = -1;
			previewAudio = null;
		};
		previewAudio.play().catch(() => {
			previewPlayingIndex = -1;
			previewAudio = null;
		});
	}

	function formatDuration(sec) {
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	onDestroy(() => {
		if (recordingInterval) clearInterval(recordingInterval);
		if (previewAudio) {
			previewAudio.pause();
			previewAudio = null;
		}
	});
</script>

<div class="storyboard-panel glass-panel">
	<div class="storyboard-header">
		<div class="title-group">
			<div class="icon-wrap">
				<Film size={18} color="var(--accent-cyan)" />
			</div>
			<div>
				<h3 class="panel-title">2. Storyboard Adegan ({scenes.length} Scene)</h3>
				<p class="panel-desc">Sesuaikan footage video, naskah per scene, atau upload audio rekaman sendiri.</p>
			</div>
		</div>

		<div class="header-actions">
			<button 
				type="button" 
				class="btn btn-secondary btn-sm btn-batch" 
				onclick={() => batchFileInput?.click()}
				title="Upload banyak file audio rekaman sekaligus untuk semua scene"
			>
				<FolderUp size={14} color="var(--accent-cyan)" />
				<span>Batch Upload Audio</span>
			</button>
			<input
				type="file"
				bind:this={batchFileInput}
				accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
				multiple
				class="hidden-input"
				onchange={handleBatchFileChange}
			/>

			<button class="btn btn-secondary btn-sm" onclick={onAddScene}>
				<Plus size={15} />
				<span>Tambah Scene</span>
			</button>
		</div>
	</div>

	<!-- Scene Cards List -->
	<div class="scenes-list">
		{#if scenes.length === 0}
			<div class="empty-state">
				<p>Belum ada adegan. Masukkan naskah di atas dan klik <strong>Generate Video</strong>.</p>
			</div>
		{:else}
			{#each scenes as scene, index (scene.id || index)}
				{#if scene.chapter}
					<div class="chapter-divider-banner">
						<div class="chapter-banner-left">
							<span class="chapter-banner-icon">🔖</span>
							<span class="chapter-banner-tag">{scene.chapter.tag || `BAB ${String(scene.chapter.number || 1).padStart(2, '0')}`}</span>
							<span class="chapter-banner-separator">—</span>
							<input 
								type="text" 
								class="chapter-title-input" 
								bind:value={scene.chapter.title} 
								placeholder="Judul Bab (contoh: AWAL MULA REVOLUSI)"
								title="Klik untuk edit Judul Bab"
							/>
						</div>
						<div class="chapter-banner-right">
							<input 
								type="text" 
								class="chapter-sub-input" 
								bind:value={scene.chapter.subtitle} 
								placeholder="Subtitle / Ringkasan bab..."
								title="Klik untuk edit Subtitle Bab"
							/>
							<button 
								type="button" 
								class="chapter-remove-btn" 
								onclick={() => removeChapter(index)}
								title="Hapus Penanda Bab ini"
							>
								&times;
							</button>
						</div>
					</div>
				{/if}

				<div 
					class="scene-card" 
					class:active={activeSceneIndex === index}
					class:has-chapter={!!scene.chapter}
					onclick={() => selectScene(index)}
				>
					<!-- Left: Footage Thumbnail -->
					<div class="card-thumbnail-wrap">
						{#if scene.footage?.thumbnail}
							<img src={scene.footage.thumbnail} alt={scene.visualQuery} class="thumbnail-img" />
						{:else}
							<div class="thumb-placeholder">
								<Film size={20} color="var(--text-muted)" />
							</div>
						{/if}

						<button 
							class="swap-btn" 
							onclick={(e) => { e.stopPropagation(); onOpenFootagePicker(index); }}
							title="Cari & Ganti Footage Pexels"
						>
							<Replace size={13} />
							<span>Ganti</span>
						</button>

						<div class="duration-badge">
							{(scene.audioDuration || scene.estimatedDuration || 5).toFixed(1)}s
						</div>
					</div>

					<!-- Middle: Content & Script Text -->
					<div class="card-content">
						<div class="card-top-meta">
							<span class="scene-num">SCENE {index + 1}</span>
							<span class="query-badge" title="Pexels Search Query">
								🔍 {scene.visualQuery || 'Cinematic'}
							</span>
							{#if scene.voiceAudioUrl}
								<span class="voice-ready-badge" title="Audio voiceover siap">
									<CheckCircle2 size={12} color="var(--highlight-green)" />
									<span>Voice Ready</span>
								</span>
							{/if}
							{#if !scene.chapter}
								<button 
									type="button" 
									class="btn-add-chapter" 
									onclick={(e) => { e.stopPropagation(); addChapter(index); }}
									title="Tandai adegan ini sebagai Awal Bab Baru"
								>
									<Bookmark size={11} />
									<span>+ Bab</span>
								</button>
							{/if}
						</div>

						<textarea
							class="narration-input"
							bind:value={scene.narration}
							rows={2}
							onclick={(e) => e.stopPropagation()}
							placeholder="Teks narasi untuk adegan ini..."
						></textarea>

						<!-- Audio & Subtitle Sync Strip -->
						<div class="scene-audio-strip" onclick={(e) => e.stopPropagation()}>
							<input
								type="file"
								id={`audio-file-${index}`}
								accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
								class="hidden-input"
								onchange={(e) => handleSingleFileChange(index, e)}
							/>

							{#if recordingSceneIndex === index}
								<!-- Live recording state -->
								<div class="recording-active-bar">
									<span class="pulse-rec-dot"></span>
									<span class="rec-text">Merekam Suara: {formatDuration(recordingSeconds)}</span>
									<button 
										type="button" 
										class="btn-rec-action save" 
										onclick={() => stopRecordingVoice(index)}
										title="Selesai merekam dan simpan"
									>
										<Square size={11} fill="#fff" />
										<span>Stop & Simpan</span>
									</button>
									<button 
										type="button" 
										class="btn-rec-action cancel" 
										onclick={cancelRecordingVoice}
										title="Batalkan rekaman ini"
									>
										Batal
									</button>
								</div>
							{:else if scene.isCustomAudio || (scene.voiceAudioUrl && !scene.isRealVoice)}
								<!-- Custom Audio Pill -->
								<div class="custom-audio-pill">
									<div class="pill-left">
										<span class="pill-badge">🎧 Rekaman</span>
										<span class="pill-name" title={scene.audioFileName || 'Audio Rekaman'}>
											{scene.audioFileName || 'audio-rekaman.mp3'}
										</span>
										<span class="pill-duration">
											{(scene.audioDuration || 5).toFixed(1)}s
										</span>
									</div>

									<div class="pill-right">
										<!-- Mini Player Preview -->
										<button
											type="button"
											class="btn-mini-play"
											class:playing={previewPlayingIndex === index}
											onclick={() => togglePreviewAudio(index, scene.voiceAudioUrl)}
											title={previewPlayingIndex === index ? 'Stop Preview' : 'Dengarkan Audio'}
										>
											{#if previewPlayingIndex === index}
												<Square size={10} fill="var(--accent-cyan)" />
											{:else}
												<Play size={10} fill="var(--text-primary)" />
											{/if}
										</button>

										<!-- Timing Offset Nudge -->
										<div class="offset-group" title="Geser kemunculan subtitle maju/mundur untuk sinkronisasi sempurna">
											<button
												type="button"
												class="btn-offset"
												onclick={() => adjustOffset(index, -0.1)}
												title="Subtitle muncul 0.1 detik lebih cepat"
											>
												-0.1s
											</button>
											<span class="offset-val">
												{(scene.timingOffset || 0) > 0 ? '+' : ''}{(scene.timingOffset || 0).toFixed(1)}s
											</span>
											<button
												type="button"
												class="btn-offset"
												onclick={() => adjustOffset(index, 0.1)}
												title="Subtitle muncul 0.1 detik lebih lambat"
											>
												+0.1s
											</button>
										</div>

										<!-- Replace File -->
										<label for={`audio-file-${index}`} class="btn-audio-tag" title="Ganti file audio rekaman ini">
											<Upload size={11} />
											<span>Ganti</span>
										</label>
									</div>
								</div>
							{:else}
								<!-- Default Upload Prompt -->
								<div class="audio-prompt-row">
									<label for={`audio-file-${index}`} class="btn-audio-prompt" title="Unggah file rekaman (.mp3, .wav, .m4a)">
										<Upload size={12} color="var(--accent-cyan)" />
										<span>Upload Audio</span>
									</label>

									<button
										type="button"
										class="btn-audio-prompt"
										onclick={() => startRecordingVoice(index)}
										title="Rekam suara langsung dengan mikrofon MacBook / PC Anda"
									>
										<Mic size={12} color="#f43f5e" />
										<span>Rekam Mic</span>
									</button>

									{#if scene.voiceAudioUrl}
										<span class="ai-voice-indicator" title="Audio disiapkan dari ElevenLabs AI">
											🤖 ElevenLabs Ready ({(scene.audioDuration || 5).toFixed(1)}s)
										</span>
									{/if}
								</div>
							{/if}
						</div>
					</div>

					<!-- Right: Actions -->
					<div class="card-actions" onclick={(e) => e.stopPropagation()}>
						<button 
							class="action-btn" 
							onclick={() => onRegenerateVoice(index)} 
							title="Regenerate Voiceover"
						>
							<Mic size={14} color="var(--primary)" />
						</button>

						<button 
							class="action-btn" 
							disabled={index === 0} 
							onclick={() => moveScene(index, -1)}
							title="Geser ke atas"
						>
							<ChevronUp size={14} />
						</button>

						<button 
							class="action-btn" 
							disabled={index === scenes.length - 1} 
							onclick={() => moveScene(index, 1)}
							title="Geser ke bawah"
						>
							<ChevronDown size={14} />
						</button>

						<button 
							class="action-btn danger" 
							disabled={scenes.length <= 1} 
							onclick={() => deleteScene(index)}
							title="Hapus adegan"
						>
							<Trash2 size={14} />
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.storyboard-panel {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.storyboard-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.icon-wrap {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background: rgba(6, 182, 212, 0.15);
		border: 1px solid rgba(6, 182, 212, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.panel-title {
		font-size: 1.15rem;
		font-weight: 700;
	}

	.panel-desc {
		font-size: 0.825rem;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.scenes-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-height: 480px;
		overflow-y: auto;
		padding-right: 6px;
	}

	.empty-state {
		padding: 36px;
		text-align: center;
		color: var(--text-muted);
		background: rgba(255, 255, 255, 0.02);
		border: 1px dashed var(--border-subtle);
		border-radius: var(--radius-lg);
	}

	.scene-card {
		display: flex;
		align-items: stretch;
		gap: 14px;
		padding: 12px;
		background: #0f1626;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.scene-card:hover {
		background: #141c30;
		border-color: rgba(255, 255, 255, 0.15);
	}

	.scene-card.active {
		border-color: var(--primary);
		box-shadow: 0 0 0 1px var(--primary), 0 4px 16px var(--primary-glow);
		background: #151f36;
	}

	/* Thumbnail */
	.card-thumbnail-wrap {
		position: relative;
		width: 140px;
		height: 80px;
		border-radius: var(--radius-md);
		overflow: hidden;
		flex-shrink: 0;
		background: #090e18;
	}

	.thumbnail-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumb-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.swap-btn {
		position: absolute;
		bottom: 4px;
		left: 4px;
		padding: 3px 8px;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		border-radius: var(--radius-sm);
		font-size: 0.7rem;
		font-weight: 600;
		color: #e2e8f0;
		display: flex;
		align-items: center;
		gap: 4px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		transition: all 0.15s ease;
	}

	.swap-btn:hover {
		background: var(--primary);
		border-color: var(--primary);
	}

	.duration-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		padding: 2px 6px;
		background: rgba(0, 0, 0, 0.75);
		border-radius: var(--radius-sm);
		font-size: 0.675rem;
		font-family: var(--font-mono);
		color: #e2e8f0;
	}

	/* Content */
	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.card-top-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.scene-num {
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.query-badge {
		font-size: 0.725rem;
		padding: 2px 8px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-full);
		color: var(--text-secondary);
		max-width: 260px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.voice-ready-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.7rem;
		color: var(--highlight-green);
		font-weight: 600;
	}

	.narration-input {
		width: 100%;
		font-size: 0.875rem;
		line-height: 1.4;
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		resize: none;
	}

	.narration-input:focus {
		background: #090e18;
		border-color: var(--primary);
	}

	/* Actions */
	.card-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		padding-left: 6px;
		border-left: 1px solid var(--border-subtle);
	}

	.action-btn {
		width: 26px;
		height: 26px;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.action-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary);
	}

	.action-btn.danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.15);
		color: var(--danger);
	}

	/* Chapter Divider Banner */
	.chapter-divider-banner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 14px;
		margin-bottom: 6px;
		padding: 8px 14px;
		background: linear-gradient(90deg, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0.03) 100%);
		border: 1px solid rgba(16, 185, 129, 0.28);
		border-left: 4px solid #10b981;
		border-radius: var(--radius-md);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.chapter-banner-left {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.chapter-banner-icon {
		font-size: 0.95rem;
		flex-shrink: 0;
	}

	.chapter-banner-tag {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		color: #10b981;
		background: rgba(16, 185, 129, 0.18);
		padding: 2px 7px;
		border-radius: 4px;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.chapter-banner-separator {
		color: rgba(255, 255, 255, 0.2);
		flex-shrink: 0;
	}

	.chapter-title-input {
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 3px 8px;
		color: #ffffff;
		font-weight: 700;
		font-size: 0.85rem;
		text-transform: uppercase;
		flex: 1;
		min-width: 130px;
		transition: all 0.2s ease;
	}

	.chapter-title-input:hover,
	.chapter-title-input:focus {
		background: rgba(0, 0, 0, 0.4);
		border-color: rgba(16, 185, 129, 0.45);
		outline: none;
	}

	.chapter-banner-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1.2;
	}

	.chapter-sub-input {
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 3px 8px;
		color: rgba(226, 232, 240, 0.75);
		font-size: 0.78rem;
		width: 100%;
		transition: all 0.2s ease;
	}

	.chapter-sub-input:hover,
	.chapter-sub-input:focus {
		background: rgba(0, 0, 0, 0.4);
		border-color: rgba(16, 185, 129, 0.45);
		outline: none;
	}

	.chapter-remove-btn {
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: var(--text-muted);
		font-size: 1.1rem;
		background: transparent;
		flex-shrink: 0;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.chapter-remove-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.scene-card.has-chapter {
		border-color: rgba(16, 185, 129, 0.3);
	}

	.btn-add-chapter {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 7px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border-subtle);
		border-radius: 4px;
		font-size: 0.68rem;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-add-chapter:hover {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.4);
		color: #10b981;
	}

	/* Audio Strip & Controls */
	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.btn-batch {
		background: rgba(6, 182, 212, 0.08);
		border: 1px solid rgba(6, 182, 212, 0.25);
		color: var(--text-primary);
	}

	.btn-batch:hover {
		background: rgba(6, 182, 212, 0.18);
		border-color: rgba(6, 182, 212, 0.5);
	}

	.hidden-input {
		display: none;
	}

	.scene-audio-strip {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.audio-prompt-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.btn-audio-prompt {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 10px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px dashed rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-audio-prompt:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--accent-cyan);
		color: var(--text-primary);
	}

	.ai-voice-indicator {
		font-size: 0.7rem;
		color: #38bdf8;
		background: rgba(56, 189, 248, 0.1);
		border: 1px solid rgba(56, 189, 248, 0.2);
		padding: 2px 7px;
		border-radius: 4px;
	}

	/* Custom Audio Pill */
	.custom-audio-pill {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 5px 10px;
		background: rgba(15, 23, 42, 0.75);
		border: 1px solid rgba(16, 185, 129, 0.35);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.pill-left {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		overflow: hidden;
	}

	.pill-badge {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background: rgba(16, 185, 129, 0.2);
		color: #34d399;
		padding: 2px 6px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.pill-name {
		font-size: 0.72rem;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 140px;
	}

	.pill-duration {
		font-size: 0.7rem;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.pill-right {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.btn-mini-play {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text-primary);
		transition: all 0.2s ease;
	}

	.btn-mini-play:hover {
		background: rgba(6, 182, 212, 0.2);
		border-color: var(--accent-cyan);
	}

	.btn-mini-play.playing {
		background: rgba(6, 182, 212, 0.25);
		border-color: var(--accent-cyan);
		box-shadow: 0 0 8px var(--accent-cyan);
	}

	.offset-group {
		display: flex;
		align-items: center;
		gap: 2px;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		padding: 1px 3px;
	}

	.btn-offset {
		background: transparent;
		border: none;
		color: var(--text-muted);
		font-size: 0.65rem;
		padding: 1px 4px;
		cursor: pointer;
		border-radius: 2px;
		transition: all 0.15s ease;
	}

	.btn-offset:hover {
		background: rgba(255, 255, 255, 0.12);
		color: var(--text-primary);
	}

	.offset-val {
		font-size: 0.65rem;
		font-family: monospace;
		color: #38bdf8;
		padding: 0 2px;
	}

	.btn-audio-tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 2px 6px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-subtle);
		border-radius: 4px;
		font-size: 0.68rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-audio-tag:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.25);
		color: var(--text-primary);
	}

	/* Recording Active Bar */
	.recording-active-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 10px;
		background: rgba(244, 63, 94, 0.12);
		border: 1px solid rgba(244, 63, 94, 0.4);
		border-radius: 6px;
	}

	.pulse-rec-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f43f5e;
		box-shadow: 0 0 10px #f43f5e;
		animation: pulseGlow 1.2s infinite ease-in-out;
	}

	.rec-text {
		font-size: 0.74rem;
		font-weight: 600;
		color: #fda4af;
		flex: 1;
	}

	.btn-rec-action {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 0.68rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: all 0.2s ease;
	}

	.btn-rec-action.save {
		background: #f43f5e;
		color: #fff;
	}

	.btn-rec-action.save:hover {
		background: #e11d48;
	}

	.btn-rec-action.cancel {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-secondary);
	}

	.btn-rec-action.cancel:hover {
		background: rgba(255, 255, 255, 0.2);
		color: var(--text-primary);
	}

	@media (max-width: 640px) {
		.scene-card {
			flex-direction: column;
		}
		.card-thumbnail-wrap {
			width: 100%;
			height: 120px;
		}
		.custom-audio-pill {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
