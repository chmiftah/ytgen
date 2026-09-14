<script>
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import ScriptEditor from '$lib/components/ScriptEditor.svelte';
	import SceneTimeline from '$lib/components/SceneTimeline.svelte';
	import StudioPlayer from '$lib/components/StudioPlayer.svelte';
	import FootagePickerModal from '$lib/components/FootagePickerModal.svelte';
	import SubtitleStyleModal from '$lib/components/SubtitleStyleModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import ExportModal from '$lib/components/ExportModal.svelte';
	import ScriptGeneratorModal from '$lib/components/ScriptGeneratorModal.svelte';

	import { analyzeScript, SCRIPT_PRESETS, getSpokenVoiceoverText } from '$lib/services/scriptAnalyzer.js';
	import { findMatchingStockVideo } from '$lib/services/stockLibrary.js';
	import { analyzeAudioFile } from '$lib/services/audioAnalysisService.js';
	import { calculateAudioSyncedWordTimings, generateSyntheticWordTimings } from '$lib/services/subtitleService.js';

	// Main App State
	let script = $state(SCRIPT_PRESETS[0].text);
	let scenes = $state([]);
	let activeSceneIndex = $state(0);
	let isGenerating = $state(false);

	// Customization State
	let subtitleStyleKey = $state('hormozi');
	let karaokeEnabled = $state(true);
	let subtitleFontSize = $state(34);
	let selectedBgmId = $state('ambient-focus');
	let bgmVolume = $state(0.15);

	// API Keys & Voices
	let deepseekApiKey = $state('sk-0802f45e1d4e41c8ae8d46396c97b746');
	let pexelsApiKey = $state('');
	let elevenLabsApiKey = $state('');
	let selectedVoiceId = $state('pNInz6obpgDQGcFmaJgB'); // Adam
	let voiceMode = $state('custom_upload'); // 'custom_upload' | 'elevenlabs'

	// Modals State
	let showSettingsModal = $state(false);
	let showSubtitleModal = $state(false);
	let showExportModal = $state(false);
	let showFootageModal = $state(false);
	let showScriptGeneratorModal = $state(false);
	let footageSceneIndex = $state(0);
	let elevenLabsError = $state(''); // Show ElevenLabs errors to user


	onMount(() => {
		// Load stored keys and preferences if present
		if (typeof window !== 'undefined') {
			const savedDeepseek = localStorage.getItem('yt_deepseek_key');
			if (savedDeepseek) deepseekApiKey = savedDeepseek;

			pexelsApiKey = localStorage.getItem('yt_pexels_key') || '';
			elevenLabsApiKey = localStorage.getItem('yt_eleven_key') || '';
			selectedVoiceId = localStorage.getItem('yt_voice_id') || 'pNInz6obpgDQGcFmaJgB';

			const savedKaraoke = localStorage.getItem('yt_karaoke_enabled');
			if (savedKaraoke !== null) karaokeEnabled = savedKaraoke === 'true';

			const savedFontSize = localStorage.getItem('yt_subtitle_fontsize');
			if (savedFontSize) subtitleFontSize = Number(savedFontSize);
		}
		// NOTE: No auto-generation — user triggers manually via the Analisis button.
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('yt_deepseek_key', deepseekApiKey || 'sk-0802f45e1d4e41c8ae8d46396c97b746');
			localStorage.setItem('yt_karaoke_enabled', String(karaokeEnabled));
			localStorage.setItem('yt_subtitle_fontsize', String(subtitleFontSize));
			localStorage.setItem('yt_voice_mode', voiceMode);
		}
	});

	async function generateWorkflow() {
		if (!script.trim() || isGenerating) return;
		isGenerating = true;

		try {
			// 1. Analyze script using DeepSeek AI
			let parsedScenes = [];
			try {
				const analyzeRes = await fetch('/api/analyze', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ script, apiKey: deepseekApiKey })
				});
				const analyzeData = await analyzeRes.json();
				if (analyzeData.success && analyzeData.scenes && analyzeData.scenes.length > 0) {
					parsedScenes = analyzeData.scenes;
				}
			} catch (err) {
				console.warn('DeepSeek analyze failed, using local fallback:', err);
			}

			if (parsedScenes.length === 0) {
				parsedScenes = analyzeScript(script);
			}
			
			// Process each scene to attach footage and audio
			const populatedScenes = [];

			for (let i = 0; i < parsedScenes.length; i++) {
				const sc = parsedScenes[i];

				// 1. Fetch Footage (Pexels or internal curated)
				let chosenFootage = null;
				try {
					const pexelsRes = await fetch('/api/pexels', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ query: sc.visualQuery, apiKey: pexelsApiKey })
					});
					const pexelsData = await pexelsRes.json();
					if (pexelsData.videos && pexelsData.videos.length > 0) {
						// Pick video matching scene index or first
						chosenFootage = pexelsData.videos[i % pexelsData.videos.length];
					}
				} catch (e) {
					console.warn('Pexels API error, using fallback:', e);
				}

				if (!chosenFootage) {
					chosenFootage = findMatchingStockVideo(sc.visualQuery);
				}

				// 2. Fetch Voiceover / Audio Timestamps (ElevenLabs or fallback)
				let voiceData = null;
				elevenLabsError = '';

				if (voiceMode === 'elevenlabs') {
					try {
						const ttsRes = await fetch('/api/elevenlabs', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								text: getSpokenVoiceoverText(sc),
								voiceId: selectedVoiceId,
								apiKey: elevenLabsApiKey
							})
						});
						voiceData = await ttsRes.json();
						if (voiceData && !voiceData.success && voiceData.error) {
							elevenLabsError = voiceData.error;
							voiceData = null; // treat as no audio
						}
					} catch (e) {
						console.warn('ElevenLabs API error, using fallback:', e);
					}
				}

				sc.footage = chosenFootage;
				if (voiceData && voiceData.success) {
					sc.voiceAudioUrl = voiceData.audioUrl;
					sc.wordTimings = voiceData.wordTimings || [];
					sc.audioDuration = voiceData.duration || sc.estimatedDuration;
					sc.isCustomAudio = false;

					// If real ElevenLabs audio, save to server disk to avoid huge JSON in render request
					if (voiceData.isRealVoice && voiceData.audioUrl) {
						try {
							const saveRes = await fetch('/api/audio-save', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									audioBase64: voiceData.audioUrl,
									sceneId: sc.id || `scene-${i}`
								})
							});
							const saveData = await saveRes.json();
							if (saveData.success) {
								sc.serverAudioPath = saveData.serverAudioPath;
							}
						} catch (e) {
							console.warn('Could not save audio to server, will use base64 fallback:', e);
						}
					}
				} else {
					// Custom upload mode baseline or fallback
					sc.voiceAudioUrl = null;
					sc.isCustomAudio = false;
					const words = (sc.narration || sc.words?.join(' ') || '').trim().split(/\s+/).filter(Boolean);
					sc.wordTimings = generateSyntheticWordTimings(words, sc.estimatedDuration, !!sc.chapter);
				}

				populatedScenes.push(sc);
			}

			scenes = populatedScenes;
			activeSceneIndex = 0;
		} catch (error) {
			console.error('Workflow error:', error);
		} finally {
			isGenerating = false;
		}
	}

	function openFootagePicker(index) {
		footageSceneIndex = index;
		showFootageModal = true;
	}

	function handleSelectFootage(video) {
		const sceneIndex = footageSceneIndex;
		if (scenes[sceneIndex]) {
			scenes[sceneIndex].footage = video;
		}
	}

	async function handleRegenerateVoice(sceneIndex) {
		const targetScene = scenes[sceneIndex];
		if (!targetScene) return;

		try {
			const res = await fetch('/api/elevenlabs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: getSpokenVoiceoverText(targetScene),
					voiceId: selectedVoiceId,
					apiKey: elevenLabsApiKey
				})
			});
			const data = await res.json();
			if (data.success) {
				targetScene.voiceAudioUrl = data.audioUrl;
				targetScene.wordTimings = data.wordTimings || [];
				targetScene.audioDuration = data.duration || targetScene.estimatedDuration;

				if (data.isRealVoice && data.audioUrl) {
					try {
						const saveRes = await fetch('/api/audio-save', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								audioBase64: data.audioUrl,
								sceneId: targetScene.id || `scene-${sceneIndex}`
							})
						});
						const saveData = await saveRes.json();
						if (saveData.success) {
							targetScene.serverAudioPath = saveData.serverAudioPath;
						}
					} catch (e) {
						console.warn('Could not save regenerated audio to server:', e);
					}
				}

				scenes = [...scenes];
			}
		} catch (err) {
			console.error('Error regenerating voice:', err);
		}
	}

	function handleAddScene() {
		const newIndex = scenes.length + 1;
		const newScene = {
			id: `scene-${newIndex}-${Date.now()}`,
			index: newIndex,
			narration: 'Tulis kalimat narasi baru di sini...',
			words: ['Tulis', 'kalimat', 'narasi', 'baru', 'di', 'sini...'],
			visualQuery: 'cinematic 4k technology',
			estimatedDuration: 4.0,
			audioDuration: 4.0,
			footage: findMatchingStockVideo('technology'),
			voiceAudioUrl: null,
			wordTimings: [
				{ word: 'Tulis', start: 0, end: 0.6 },
				{ word: 'kalimat', start: 0.6, end: 1.2 },
				{ word: 'narasi', start: 1.2, end: 1.8 },
				{ word: 'baru', start: 1.8, end: 2.4 },
				{ word: 'di', start: 2.4, end: 2.8 },
				{ word: 'sini...', start: 2.8, end: 3.8 }
			]
		};
		scenes = [...scenes, newScene];
		activeSceneIndex = scenes.length - 1;
	}

	async function handleUploadAudio(sceneIndex, file) {
		const targetScene = scenes[sceneIndex];
		if (!targetScene) return;

		try {
			const analysis = await analyzeAudioFile(file);
			const words = (targetScene.narration || targetScene.words?.join(' ') || '')
				.trim()
				.split(/\s+/)
				.filter(Boolean);

			const wordTimings = calculateAudioSyncedWordTimings(words, analysis.duration, {
				speechStart: analysis.speechStart,
				speechEnd: analysis.speechEnd,
				isChapterScene: !!targetScene.chapter,
				timingOffset: targetScene.timingOffset || 0
			});

			targetScene.audioDuration = analysis.duration;
			targetScene.estimatedDuration = analysis.duration;
			targetScene.voiceAudioUrl = analysis.blobUrl;
			targetScene.wordTimings = wordTimings;
			targetScene.isCustomAudio = true;
			targetScene.audioFileName = file.name || 'rekaman-suara.mp3';
			targetScene.speechBoundaries = {
				speechStart: analysis.speechStart,
				speechEnd: analysis.speechEnd
			};

			// Save to server cache for FFmpeg rendering
			try {
				const saveRes = await fetch('/api/audio-save', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						audioBase64: analysis.dataUrl,
						sceneId: targetScene.id || `scene-${sceneIndex}`
					})
				});
				const saveData = await saveRes.json();
				if (saveData.success) {
					targetScene.serverAudioPath = saveData.serverAudioPath;
				}
			} catch (err) {
				console.warn('Failed to cache uploaded audio on server:', err);
			}

			scenes = [...scenes];
		} catch (err) {
			console.error('Error handling audio upload:', err);
			alert('Gagal memproses audio: ' + err.message);
		}
	}

	async function handleBatchUploadAudio(files) {
		if (!files || files.length === 0) return;
		const sorted = [...files].sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { numeric: true })
		);

		let uploadedCount = 0;
		for (let i = 0; i < sorted.length && i < scenes.length; i++) {
			await handleUploadAudio(i, sorted[i]);
			uploadedCount++;
		}
		alert(`Berhasil sinkronisasi ${uploadedCount} file audio ke ${uploadedCount} adegan!`);
	}

	async function handleRecordAudio(sceneIndex, audioBlob) {
		const file = new File([audioBlob], `rekaman-scene-${sceneIndex + 1}.webm`, {
			type: audioBlob.type
		});
		await handleUploadAudio(sceneIndex, file);
	}

	function handleAdjustTimingOffset(sceneIndex, delta) {
		const targetScene = scenes[sceneIndex];
		if (!targetScene) return;

		targetScene.timingOffset = Number(((targetScene.timingOffset || 0) + delta).toFixed(2));
		const words = (targetScene.narration || targetScene.words?.join(' ') || '')
			.trim()
			.split(/\s+/)
			.filter(Boolean);

		const dur = targetScene.audioDuration || targetScene.estimatedDuration || 5;
		targetScene.wordTimings = calculateAudioSyncedWordTimings(words, dur, {
			speechStart: targetScene.speechBoundaries?.speechStart,
			speechEnd: targetScene.speechBoundaries?.speechEnd,
			isChapterScene: !!targetScene.chapter,
			timingOffset: targetScene.timingOffset
		});

		scenes = [...scenes];
	}
</script>

<div class="studio-app">
	<Navbar
		onOpenSettings={() => showSettingsModal = true}
		onOpenSubtitleStyle={() => showSubtitleModal = true}
		onOpenExport={() => showExportModal = true}
	/>

	{#if elevenLabsError}
		<div class="api-error-banner">
			<span>⚠️ <strong>ElevenLabs Error:</strong> {elevenLabsError}</span>
			<span class="error-hint">→ Pastikan API key dimulai dengan <code>sk_</code> dan masukkan di <button class="link-btn" onclick={() => { showSettingsModal = true; elevenLabsError = ''; }}>API Settings</button></span>
			<button class="dismiss-btn" onclick={() => elevenLabsError = ''}>✕</button>
		</div>
	{/if}


	<main class="studio-workspace">
		<!-- Left Workstation: Script & Storyboard -->
		<section class="left-workstation">
			<ScriptEditor
				bind:script={script}
				onGenerate={generateWorkflow}
				isGenerating={isGenerating}
				onOpenScriptGenerator={() => showScriptGeneratorModal = true}
			/>

			<!-- Mode Voiceover Selector -->
			<div class="voice-mode-banner glass-panel">
				<div class="mode-info">
					<span class="mode-icon">🎙️</span>
					<div>
						<div class="mode-title">Mode Voiceover & Narasi:</div>
						<div class="mode-desc">
							{voiceMode === 'custom_upload'
								? 'Upload file audio rekaman sendiri atau rekam langsung via mic per adegan (ElevenLabs dimatikan, hemat kuota 100%).'
								: 'Generate suara otomatis menggunakan ElevenLabs AI (membutuhkan kuota karakter ElevenLabs).'}
						</div>
					</div>
				</div>

				<div class="mode-options">
					<button 
						type="button" 
						class="mode-pill-btn" 
						class:active={voiceMode === 'custom_upload'} 
						onclick={() => voiceMode = 'custom_upload'}
					>
						<span>🎧 Rekaman Sendiri</span>
						<span class="badge-free">Hemat Kuota 100%</span>
					</button>

					<button 
						type="button" 
						class="mode-pill-btn" 
						class:active={voiceMode === 'elevenlabs'} 
						onclick={() => voiceMode = 'elevenlabs'}
					>
						<span>🤖 ElevenLabs AI</span>
						<span class="badge-ai">Otomatis</span>
					</button>
				</div>
			</div>

			<SceneTimeline
				bind:scenes={scenes}
				bind:activeSceneIndex={activeSceneIndex}
				onOpenFootagePicker={openFootagePicker}
				onRegenerateVoice={handleRegenerateVoice}
				onAddScene={handleAddScene}
				onUploadAudio={handleUploadAudio}
				onBatchUploadAudio={handleBatchUploadAudio}
				onRecordAudio={handleRecordAudio}
				onAdjustTimingOffset={handleAdjustTimingOffset}
			/>
		</section>

		<!-- Right Workstation: Fixed YouTube 16:9 Live Preview Player -->
		<section class="right-workstation">
			<div class="player-sticky-wrap">
				<div class="preview-header">
					<span class="pulse-indicator"></span>
					<h3 class="preview-title">Live Studio Preview (16:9)</h3>
				</div>

				<StudioPlayer
					scenes={scenes}
					bind:activeSceneIndex={activeSceneIndex}
					subtitleStyleKey={subtitleStyleKey}
					karaokeEnabled={karaokeEnabled}
					subtitleFontSize={subtitleFontSize}
					bind:selectedBgmId={selectedBgmId}
					bind:bgmVolume={bgmVolume}
				/>

				<div class="tips-card glass-panel">
					<h4>🚀 Tips Optimasi YouTube Long:</h4>
					<ul>
						<li><strong>Gaya Subtitle:</strong> Sesuaikan ukuran font & aktif/nonaktifkan animasi karaoke melalui tombol "Gaya Subtitle".</li>
						<li><strong>Footage Relevan:</strong> Ganti clip adegan dengan mengklik tombol "Ganti" pada tiap scene card.</li>
						<li><strong>ElevenLabs Voice:</strong> Masukkan API key di menu "API Settings" untuk voiceover AI ultra-realistis.</li>
					</ul>
				</div>
			</div>
		</section>
	</main>

	<!-- Modals -->
	<ScriptGeneratorModal
		isOpen={showScriptGeneratorModal}
		deepseekApiKey={deepseekApiKey}
		onSelectScript={(newScript) => {
			script = newScript;
		}}
		onClose={() => showScriptGeneratorModal = false}
	/>

	<FootagePickerModal
		isOpen={showFootageModal}
		sceneIndex={footageSceneIndex}
		initialQuery={scenes[footageSceneIndex]?.visualQuery || ''}
		pexelsApiKey={pexelsApiKey}
		onSelectFootage={handleSelectFootage}
		onClose={() => showFootageModal = false}
	/>

	<SubtitleStyleModal
		isOpen={showSubtitleModal}
		bind:activeStyleKey={subtitleStyleKey}
		bind:karaokeEnabled={karaokeEnabled}
		bind:subtitleFontSize={subtitleFontSize}
		onClose={() => showSubtitleModal = false}
	/>

	<SettingsModal
		isOpen={showSettingsModal}
		bind:deepseekApiKey={deepseekApiKey}
		bind:pexelsApiKey={pexelsApiKey}
		bind:elevenLabsApiKey={elevenLabsApiKey}
		bind:selectedVoiceId={selectedVoiceId}
		onClose={() => showSettingsModal = false}
	/>

	<ExportModal
		isOpen={showExportModal}
		scenes={scenes}
		subtitleStyleKey={subtitleStyleKey}
		karaokeEnabled={karaokeEnabled}
		subtitleFontSize={subtitleFontSize}
		selectedBgmId={selectedBgmId}
		bgmVolume={bgmVolume}
		onClose={() => showExportModal = false}
	/>
</div>

<style>
	.studio-app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: radial-gradient(circle at 50% 0%, #0e1526 0%, #060910 100%);
	}

	.api-error-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		background: rgba(239, 68, 68, 0.12);
		border-bottom: 1px solid rgba(239, 68, 68, 0.35);
		padding: 10px 28px;
		font-size: 0.82rem;
		color: #fca5a5;
	}

	.api-error-banner strong { color: #f87171; }
	.api-error-banner code {
		background: rgba(255,255,255,0.1);
		padding: 1px 5px;
		border-radius: 4px;
		color: #fbbf24;
	}
	.error-hint { color: #94a3b8; }
	.link-btn {
		background: none;
		border: none;
		color: #60a5fa;
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
		font-size: inherit;
	}
	.dismiss-btn {
		margin-left: auto;
		background: none;
		border: none;
		color: #f87171;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
	}


	.studio-workspace {
		flex: 1;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 24px;
		padding: 24px 28px;
		max-width: 1720px;
		margin: 0 auto;
		width: 100%;
	}

	.left-workstation {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.right-workstation {
		position: relative;
	}

	.player-sticky-wrap {
		position: sticky;
		top: 86px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.pulse-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f43f5e;
		box-shadow: 0 0 10px #f43f5e;
		animation: pulseGlow 1.5s infinite ease-in-out;
	}

	.preview-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	.tips-card {
		padding: 18px 20px;
		background: rgba(15, 23, 42, 0.4);
		border-radius: var(--radius-md);
	}

	.tips-card h4 {
		font-size: 0.85rem;
		margin-bottom: 8px;
		color: #e2e8f0;
	}

	.tips-card ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.tips-card li {
		font-size: 0.775rem;
		color: var(--text-secondary);
		line-height: 1.4;
	}

	.tips-card strong {
		color: var(--text-primary);
	}

	/* Voice Mode Selector Banner */
	.voice-mode-banner {
		padding: 14px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.mode-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.mode-icon {
		font-size: 1.4rem;
	}

	.mode-title {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.mode-desc {
		font-size: 0.76rem;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.mode-options {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mode-pill-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mode-pill-btn:hover {
		background: rgba(255, 255, 255, 0.07);
		color: var(--text-primary);
	}

	.mode-pill-btn.active {
		background: rgba(6, 182, 212, 0.15);
		border-color: var(--accent-cyan);
		color: #fff;
		box-shadow: 0 0 12px rgba(6, 182, 212, 0.25);
	}

	.badge-free {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(16, 185, 129, 0.2);
		color: #34d399;
	}

	.badge-ai {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(56, 189, 248, 0.2);
		color: #38bdf8;
	}

	@media (max-width: 1100px) {
		.studio-workspace {
			grid-template-columns: 1fr;
		}

		.player-sticky-wrap {
			position: static;
		}
	}
</style>
