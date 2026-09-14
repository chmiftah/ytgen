<script>
	import { onMount, onDestroy } from 'svelte';
	import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize, Music, Layers } from 'lucide-svelte';
	import { SUBTITLE_STYLES, getActiveSubtitleWindow } from '$lib/services/subtitleService.js';
	import { audioController, BGM_TRACKS, playChapterStinger } from '$lib/services/audioEngine.js';

	let {
		scenes = [],
		activeSceneIndex = $bindable(0),
		subtitleStyleKey = 'hormozi',
		subtitleFontSize = 34,
		karaokeEnabled = true,
		selectedBgmId = $bindable('ambient-focus'),
		bgmVolume = $bindable(0.15)
	} = $props();

	let videoElement = $state(null);
	let isPlaying = $state(false);
	let currentTime = $state(0); // Global timeline time (seconds)
	let isMuted = $state(false);
	let isFullscreen = $state(false);
	let playerContainer = $state(null);
	let voiceAudioElement = $state(null);
	let animFrameId = $state(null);

	// Total duration of all scenes combined
	let totalDuration = $derived.by(() => {
		if (!scenes || scenes.length === 0) return 0;
		return scenes.reduce((sum, s) => sum + (s.audioDuration || s.estimatedDuration || 5), 0);
	});

	// Active scene
	let currentScene = $derived.by(() => {
		if (!scenes || scenes.length === 0) return null;
		return scenes[activeSceneIndex] || scenes[0];
	});

	// Time within active scene
	let sceneCurrentTime = $derived.by(() => {
		if (!scenes || scenes.length === 0) return 0;
		let cumulative = 0;
		for (let i = 0; i < activeSceneIndex; i++) {
			cumulative += (scenes[i].audioDuration || scenes[i].estimatedDuration || 5);
		}
		return Math.max(0, currentTime - cumulative);
	});

	// Subtitle active words
	let activeSubtitles = $derived.by(() => {
		if (!currentScene) return { words: [], activeIndex: -1 };
		const style = SUBTITLE_STYLES[subtitleStyleKey] || SUBTITLE_STYLES.hormozi;
		return getActiveSubtitleWindow(currentScene.wordTimings, sceneCurrentTime, style.chunkSize, karaokeEnabled);
	});

	let currentSubtitleStyle = $derived(SUBTITLE_STYLES[subtitleStyleKey] || SUBTITLE_STYLES.hormozi);

	// Check if current scene uses a lavfi (FFmpeg-only) URL that can't play in browser
	let isLavfiScene = $derived(
		(currentScene?.footage?.videoUrl || '').startsWith('lavfi:')
	);

	// Extract CSS gradient color from lavfi filter string for preview
	let lavfiPreviewStyle = $derived.by(() => {
		if (!isLavfiScene) return '';
		const filter = currentScene.footage.videoUrl.slice('lavfi:'.length);
		// Extract base color from 'color=c=0xRRGGBB:...'
		const colorMatch = filter.match(/color=c=0x([0-9a-fA-F]{6})/);
		const hex = colorMatch ? `#${colorMatch[1]}` : '#0a0f1e';
		// Generate animated gradient
		return `background: radial-gradient(ellipse at 30% 50%, ${hex}dd 0%, ${hex}22 60%, #000 100%);`;
	});


	onMount(() => {
		initBGM();
		return () => {
			if (animFrameId) cancelAnimationFrame(animFrameId);
			audioController.pauseBGM();
		};
	});

	function initBGM() {
		const track = BGM_TRACKS.find(t => t.id === selectedBgmId);
		if (track && track.url) {
			audioController.initBGM(track.url);
			audioController.setBGMVolume(bgmVolume);
		}
	}

	$effect(() => {
		if (selectedBgmId) {
			initBGM();
		}
	});

	$effect(() => {
		audioController.setBGMVolume(bgmVolume);
	});

	// Watch scene change to update video source
	$effect(() => {
		if (currentScene && videoElement && !isLavfiScene) {
			const targetUrl = currentScene.footage?.videoUrl;
			if (targetUrl && videoElement.src !== targetUrl) {
				videoElement.src = targetUrl;
				videoElement.currentTime = 0;
				if (isPlaying) {
					videoElement.play().catch(() => {});
				}
			}
		}
	});

	// Handle Voice audio playback for active scene
	$effect(() => {
		if (currentScene && currentScene.voiceAudioUrl && voiceAudioElement) {
			if (voiceAudioElement.src !== currentScene.voiceAudioUrl) {
				voiceAudioElement.src = currentScene.voiceAudioUrl;
				voiceAudioElement.currentTime = sceneCurrentTime;
				if (isPlaying) {
					voiceAudioElement.play().catch(() => {});
				}
			}
		}
	});

	function togglePlay() {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	}

	function play() {
		if (!scenes || scenes.length === 0) return;
		isPlaying = true;
		if (videoElement) videoElement.play().catch(() => {});
		if (voiceAudioElement && currentScene?.voiceAudioUrl) {
			voiceAudioElement.currentTime = sceneCurrentTime;
			voiceAudioElement.play().catch(() => {});
		}
		audioController.playBGM();

		// Chapter transition handling: swell BGM and play transition stinger
		if (currentScene?.chapter && sceneCurrentTime < 3.5) {
			audioController.swellBGM(Math.max(0.5, 3.5 - sceneCurrentTime));
			if (sceneCurrentTime < 0.6) {
				playChapterStinger();
			}
		} else {
			audioController.duckBGM(Boolean(currentScene?.voiceAudioUrl));
		}

		lastTick = performance.now();
		tick();
	}

	function pause() {
		isPlaying = false;
		if (videoElement) videoElement.pause();
		if (voiceAudioElement) voiceAudioElement.pause();
		audioController.pauseBGM();
		if (animFrameId) cancelAnimationFrame(animFrameId);
	}

	let lastTick = 0;
	function tick() {
		if (!isPlaying) return;
		const now = performance.now();
		const delta = (now - lastTick) / 1000;
		lastTick = now;

		currentTime += delta;

		if (currentTime >= totalDuration) {
			currentTime = 0;
			activeSceneIndex = 0;
			pause();
			return;
		}

		// Check if time moved into next scene
		let cumulative = 0;
		let foundIndex = 0;
		for (let i = 0; i < scenes.length; i++) {
			const dur = scenes[i].audioDuration || scenes[i].estimatedDuration || 5;
			if (currentTime >= cumulative && currentTime < cumulative + dur) {
				foundIndex = i;
				break;
			}
			cumulative += dur;
		}

		if (foundIndex !== activeSceneIndex) {
			activeSceneIndex = foundIndex;
			const nextScene = scenes[foundIndex];
			if (nextScene?.chapter) {
				// Musik masuk (swell) & stinger on chapter change
				audioController.swellBGM(3.5);
				playChapterStinger();
			} else {
				audioController.duckBGM(Boolean(nextScene?.voiceAudioUrl));
			}
		}

		animFrameId = requestAnimationFrame(tick);
	}

	function seekTo(targetTime) {
		currentTime = Math.max(0, Math.min(totalDuration, targetTime));
		let cumulative = 0;
		for (let i = 0; i < scenes.length; i++) {
			const dur = scenes[i].audioDuration || scenes[i].estimatedDuration || 5;
			if (currentTime >= cumulative && currentTime <= cumulative + dur) {
				activeSceneIndex = i;
				break;
			}
			cumulative += dur;
		}

		if (videoElement) {
			videoElement.currentTime = sceneCurrentTime % (videoElement.duration || 10);
		}
		if (voiceAudioElement && currentScene?.voiceAudioUrl) {
			voiceAudioElement.currentTime = sceneCurrentTime;
		}
		audioController.seekBGM(currentTime);

		if (currentScene?.chapter && sceneCurrentTime < 3.5) {
			audioController.swellBGM(Math.max(0.5, 3.5 - sceneCurrentTime));
		} else {
			audioController.duckBGM(Boolean(currentScene?.voiceAudioUrl));
		}
	}

	function handleScrubberClick(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const percent = clickX / rect.width;
		seekTo(percent * totalDuration);
	}

	function toggleFullscreen() {
		if (!playerContainer) return;
		if (!document.fullscreenElement) {
			playerContainer.requestFullscreen().catch(() => {});
			isFullscreen = true;
		} else {
			document.exitFullscreen().catch(() => {});
			isFullscreen = false;
		}
	}

	function formatTime(sec) {
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
</script>

<div class="studio-player-card glass-panel" bind:this={playerContainer}>
	<!-- 16:9 Video Canvas Viewport -->
	<div class="viewport-wrapper">
		<div class="video-aspect-box">
			{#if isLavfiScene}
				<!-- Animated gradient for lavfi scenes (FFmpeg-generated, not playable in browser) -->
				<div class="lavfi-preview" style={lavfiPreviewStyle}>
					<div class="lavfi-pulse"></div>
				</div>
			{:else if currentScene?.footage?.videoUrl}
				<video
					bind:this={videoElement}
					src={currentScene.footage.videoUrl}
					class="main-video"
					loop
					muted={isMuted}
					playsinline
				></video>
			{:else}
				<div class="video-placeholder">
					<div class="placeholder-content">
						<Layers size={48} color="var(--primary)" />
						<p>Pilih atau generate script untuk memuat footage video 16:9</p>
					</div>
				</div>
			{/if}

			<!-- Hidden Voiceover Audio Element -->
			<audio bind:this={voiceAudioElement} style="display:none"></audio>

			<!-- Cinematic Chapter Title Card Overlay (Active on chapter scene start for ~3.8s) -->
			{#if currentScene?.chapter && sceneCurrentTime < 3.8}
				<div 
					class="chapter-overlay"
					class:center-style={currentScene.chapter.style !== 'lower-third'}
					class:lower-third-style={currentScene.chapter.style === 'lower-third'}
					class:fade-out={sceneCurrentTime >= 3.2}
				>
					<div class="chapter-card">
						<div class="chapter-tag-badge">
							<span class="chapter-dot"></span>
							<span class="chapter-tag-text">{currentScene.chapter.tag || `BAB ${String(currentScene.chapter.number || 1).padStart(2, '0')}`}</span>
						</div>
						<h2 class="chapter-main-title">{currentScene.chapter.title}</h2>
						{#if currentScene.chapter.subtitle}
							<p class="chapter-sub-title">{currentScene.chapter.subtitle}</p>
						{/if}
						<div class="chapter-accent-line"></div>
					</div>
				</div>
			{/if}

			<!-- Dynamic Subtitle Overlay -->
			{#if activeSubtitles.words.length > 0}
				<div 
					class="subtitles-overlay {currentSubtitleStyle.id}"
					class:chapter-active={currentScene?.chapter && sceneCurrentTime < 3.5}
					style="
						font-family: {currentSubtitleStyle.fontFamily};
						font-size: {subtitleFontSize || currentSubtitleStyle.fontSize}px;
						font-weight: {currentSubtitleStyle.fontWeight};
						text-transform: {currentSubtitleStyle.textTransform};
					"
				>
					<div class="subtitle-pill" style="background: {currentSubtitleStyle.backgroundColor};">
						{#each activeSubtitles.words as item, idx}
							<span
								class="word-token"
								class:active={karaokeEnabled && item.isHighlighted}
								style="
									color: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightColor : currentSubtitleStyle.primaryColor};
									text-shadow: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightGlow : currentSubtitleStyle.shadow};
									-webkit-text-stroke: {currentSubtitleStyle.textStroke};
								"
							>
								{item.word}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Scene Indicator Badge -->
			<div class="scene-badge">
				{#if currentScene?.chapter}
					<span class="scene-badge-chapter">{currentScene.chapter.tag}:</span>
				{/if}
				Scene {activeSceneIndex + 1} / {scenes.length || 1}
			</div>
		</div>
	</div>

	<!-- Timeline Scrubber with Scene & Chapter Markers -->
	<div class="timeline-scrubber" onclick={handleScrubberClick}>
		<div 
			class="progress-fill" 
			style="width: {totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%"
		></div>

		<!-- Scene & Chapter jump markers -->
		{#if scenes.length > 1}
			<div class="markers-container">
				{#each scenes as s, idx}
					{@const markerPercent = (scenes.slice(0, idx).reduce((acc, cur) => acc + (cur.audioDuration || cur.estimatedDuration || 5), 0) / (totalDuration || 1)) * 100}
					<div 
						class="scene-marker" 
						class:chapter-marker={!!s.chapter}
						style="left: {markerPercent}%"
						title={s.chapter ? `${s.chapter.tag}: ${s.chapter.title}` : `Scene ${idx + 1}`}
					></div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Player Controls Bar -->
	<div class="controls-bar">
		<div class="controls-left">
			<button class="ctrl-btn main-play" onclick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
				{#if isPlaying}
					<Pause size={18} />
				{:else}
					<Play size={18} style="margin-left: 2px;" />
				{/if}
			</button>

			<button class="ctrl-btn" onclick={() => seekTo(0)} title="Rewind to start">
				<RotateCcw size={16} />
			</button>

			<div class="timecode">
				<span class="curr-time">{formatTime(currentTime)}</span>
				<span class="sep">/</span>
				<span class="total-time">{formatTime(totalDuration)}</span>
			</div>
		</div>

		<!-- Middle: BGM selection & audio ducking control -->
		<div class="controls-center">
			<div class="bgm-selector">
				<Music size={15} color="var(--accent-cyan)" />
				<select bind:value={selectedBgmId}>
					{#each BGM_TRACKS as track}
						<option value={track.id}>{track.name} ({track.mood})</option>
					{/each}
				</select>
			</div>

			<div class="vol-control">
				<button class="vol-btn" onclick={() => isMuted = !isMuted}>
					{#if isMuted}
						<VolumeX size={15} color="var(--danger)" />
					{:else}
						<Volume2 size={15} />
					{/if}
				</button>
				<input
					type="range"
					min="0"
					max="0.5"
					step="0.01"
					bind:value={bgmVolume}
					class="slider-mini"
					title="Volume Musik Latar"
				/>
			</div>
		</div>

		<div class="controls-right">
			<button class="ctrl-btn" onclick={toggleFullscreen} title="Full Screen">
				<Maximize size={16} />
			</button>
		</div>
	</div>
</div>

<style>
	.studio-player-card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: var(--radius-lg);
		background: #090d16;
		border: 1px solid var(--border-subtle);
		box-shadow: var(--shadow-lg);
	}

	.viewport-wrapper {
		position: relative;
		width: 100%;
		background: #000;
	}

	/* Exact 16:9 Aspect Ratio */
	.video-aspect-box {
		position: relative;
		width: 100%;
		padding-top: 56.25%; /* 16:9 ratio */
		overflow: hidden;
		background: #05080f;
	}

	.main-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Lavfi scene: animated gradient background (no real video) */
	.lavfi-preview {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		animation: lavfi-shift 8s ease-in-out infinite alternate;
	}

	@keyframes lavfi-shift {
		0%   { filter: hue-rotate(0deg) brightness(0.9); }
		50%  { filter: hue-rotate(40deg) brightness(1.1); }
		100% { filter: hue-rotate(-20deg) brightness(0.95); }
	}

	.lavfi-pulse {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.04) 0%, transparent 70%);
		animation: lavfi-pulse-anim 3s ease-in-out infinite;
	}

	@keyframes lavfi-pulse-anim {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50%       { opacity: 0.8; transform: scale(1.05); }
	}

	.video-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at center, #111827 0%, #080b12 100%);
		text-align: center;
		padding: 24px;
	}

	.placeholder-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		color: var(--text-muted);
		max-width: 320px;
	}

	/* Dynamic Subtitles Overlay */
	.subtitles-overlay {
		position: absolute;
		bottom: 12%;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 24px;
		pointer-events: none;
		z-index: 10;
		user-select: none;
	}

	.subtitle-pill {
		display: inline-flex;
		align-items: baseline;
		justify-content: center;
		gap: 10px;
		padding: 8px 20px;
		border-radius: var(--radius-md);
		flex-wrap: wrap;
		text-align: center;
		max-width: 85%;
	}

	.word-token {
		display: inline-block;
		transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
		line-height: 1.2;
	}

	.word-token.active {
		transform: scale(1.18);
		z-index: 2;
	}

	.scene-badge {
		position: absolute;
		top: 14px;
		left: 14px;
		padding: 4px 10px;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(8px);
		border-radius: var(--radius-full);
		font-size: 0.725rem;
		font-weight: 600;
		color: #e2e8f0;
		border: 1px solid rgba(255, 255, 255, 0.1);
		z-index: 5;
	}

	/* Scrubber */
	.timeline-scrubber {
		position: relative;
		width: 100%;
		height: 8px;
		background: #151d2f;
		cursor: pointer;
		transition: height 0.15s ease;
	}

	.timeline-scrubber:hover {
		height: 12px;
	}

	.progress-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%);
		border-radius: 0 2px 2px 0;
		pointer-events: none;
	}

	.markers-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.scene-marker {
		position: absolute;
		top: 0;
		width: 2px;
		height: 100%;
		background: rgba(255, 255, 255, 0.4);
	}

	/* Controls */
	.controls-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 18px;
		background: #0d121f;
		border-top: 1px solid var(--border-subtle);
		gap: 16px;
		flex-wrap: wrap;
	}

	.controls-left, .controls-center, .controls-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.ctrl-btn {
		width: 34px;
		height: 34px;
		border-radius: var(--radius-md);
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.ctrl-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--border-bright);
	}

	.main-play {
		background: var(--primary);
		border-color: var(--primary);
		color: white;
	}

	.main-play:hover {
		background: var(--primary-hover);
	}

	.timecode {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin-left: 6px;
	}

	.curr-time {
		color: var(--text-primary);
		font-weight: 600;
	}

	.bgm-selector {
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(255, 255, 255, 0.04);
		padding: 4px 10px;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-subtle);
	}

	.bgm-selector select {
		background: transparent;
		border: none;
		padding: 2px 4px;
		font-size: 0.775rem;
		color: var(--text-secondary);
	}

	.vol-control {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.vol-btn {
		padding: 4px;
		color: var(--text-muted);
	}

	.slider-mini {
		width: 70px;
		accent-color: var(--accent-cyan);
		height: 4px;
	}

	/* Chapter Title Card Overlay */
	.chapter-overlay {
		position: absolute;
		inset: 0;
		z-index: 25;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at center, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.72) 100%);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		animation: chapter-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		transition: opacity 0.5s ease;
	}

	.chapter-overlay.lower-third-style {
		align-items: flex-end;
		justify-content: flex-start;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 45%);
		padding: 32px 40px;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}

	.chapter-overlay.fade-out {
		opacity: 0;
	}

	@keyframes chapter-fade-in {
		0% {
			opacity: 0;
			transform: scale(0.95) translateY(16px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.chapter-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 24px 36px;
		background: rgba(10, 15, 29, 0.82);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 18px;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 32px rgba(16, 185, 129, 0.15);
		max-width: 82%;
	}

	.chapter-overlay.lower-third-style .chapter-card {
		align-items: flex-start;
		text-align: left;
		padding: 16px 24px;
		border-left: 4px solid var(--accent-cyan);
		max-width: 60%;
	}

	.chapter-tag-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 4px 14px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.35);
		border-radius: 999px;
		margin-bottom: 12px;
	}

	.chapter-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
		animation: pulse-dot 1.5s infinite alternate;
	}

	@keyframes pulse-dot {
		0% { transform: scale(0.8); opacity: 0.6; }
		100% { transform: scale(1.2); opacity: 1; }
	}

	.chapter-tag-text {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: #10b981;
	}

	.chapter-main-title {
		font-family: var(--font-sans);
		font-size: clamp(1.4rem, 3.2vw, 2.4rem);
		font-weight: 900;
		letter-spacing: 0.02em;
		color: #ffffff;
		text-transform: uppercase;
		margin: 0 0 6px 0;
		text-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
		background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.chapter-sub-title {
		font-family: var(--font-sans);
		font-size: clamp(0.85rem, 1.4vw, 1.1rem);
		font-weight: 400;
		color: rgba(226, 232, 240, 0.85);
		margin: 0;
		max-width: 550px;
		line-height: 1.4;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.chapter-accent-line {
		width: 48px;
		height: 3px;
		background: linear-gradient(90deg, #10b981, var(--accent-cyan));
		border-radius: 999px;
		margin-top: 14px;
	}

	.scene-badge-chapter {
		color: #10b981;
		font-weight: 700;
		margin-right: 4px;
	}

	.subtitles-overlay.chapter-active {
		opacity: 0;
		transform: translateY(16px);
		transition: opacity 0.4s ease, transform 0.4s ease;
	}

	.scene-marker.chapter-marker {
		width: 5px;
		height: 14px;
		background: #10b981;
		box-shadow: 0 0 8px #10b981;
		border-radius: 2px;
		z-index: 6;
	}
</style>
