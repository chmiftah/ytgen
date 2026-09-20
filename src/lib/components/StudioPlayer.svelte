<script>
	import { onMount, untrack } from 'svelte';
	import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize, Layers } from 'lucide-svelte';
	import { SUBTITLE_STYLES, SUBTITLE_POSITIONS, SUBTITLE_DECORS, getActiveSubtitleWindow } from '$lib/services/subtitleService.js';
	import { audioController, BGM_TRACKS, playChapterStinger } from '$lib/services/audioEngine.js';

	let {
		scenes = [],
		activeSceneIndex = $bindable(0),
		subtitleStyleKey = 'hormozi',
		subtitlePosition = 'bottom-center',
		quoteDecoration = 'none',
		subtitleFontSize = 34,
		karaokeEnabled = true,
		selectedBgmId = $bindable('local-documentary'),
		bgmVolume = $bindable(0.10)
	} = $props();

	let videoElement = $state(null);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let isMuted = $state(false);
	let playerContainer = $state(null);
	let voiceAudioElement = $state(null);
	let animFrameId = $state(null);

	let totalDuration = $derived.by(() => {
		if (!scenes || scenes.length === 0) return 0;
		return scenes.reduce((sum, s) => sum + (s.audioDuration || s.estimatedDuration || 5), 0);
	});
	let currentScene = $derived.by(() => {
		if (!scenes || scenes.length === 0) return null;
		return scenes[activeSceneIndex] || scenes[0];
	});
	let sceneCurrentTime = $derived.by(() => {
		if (!scenes || scenes.length === 0) return 0;
		let cumulative = 0;
		for (let i = 0; i < activeSceneIndex; i++) cumulative += scenes[i].audioDuration || scenes[i].estimatedDuration || 5;
		return Math.max(0, currentTime - cumulative);
	});
	let activeSubtitles = $derived.by(() => {
		if (!currentScene || !currentScene.wordTimings || currentScene.wordTimings.length === 0) return { words: [], activeIndex: -1 };
		const style = SUBTITLE_STYLES[subtitleStyleKey] || SUBTITLE_STYLES.hormozi;
		let timings = currentScene.wordTimings;
		if (currentScene.chapter) {
			const chDuration = getChapterCardDuration(currentScene);
			if (sceneCurrentTime < chDuration - 0.3) return { words: [], activeIndex: -1 };
			timings = timings.filter((t) => t.start >= chDuration - 0.4);
		}
		return getActiveSubtitleWindow(timings, sceneCurrentTime, style.chunkSize, karaokeEnabled);
	});
	function handleVoiceMetadata() {
		if (voiceAudioElement && voiceAudioElement.duration && !isNaN(voiceAudioElement.duration) && isFinite(voiceAudioElement.duration)) {
			const realDur = voiceAudioElement.duration;
			if (currentScene && (currentScene.audioDuration < realDur || Math.abs(currentScene.audioDuration - realDur) > 0.2)) {
				const paddedDur = Number((realDur + 0.4).toFixed(2));
				if (currentScene.audioDuration < paddedDur) { currentScene.audioDuration = paddedDur; scenes = [...scenes]; }
			}
		}
	}
	let firstRealChapterIndex = $derived.by(() => {
		if (!scenes || scenes.length === 0) return -1;
		return scenes.findIndex((s) => s.chapter && !s.chapter.isHook && s.chapter.tag !== 'HOOK');
	});
	let isHookLetterboxActive = $derived.by(() => {
		if (firstRealChapterIndex === -1) return !!(currentScene?.chapter?.isHook || currentScene?.chapter?.tag === 'HOOK');
		return activeSceneIndex < firstRealChapterIndex;
	});
	let currentSubtitleStyle = $derived(SUBTITLE_STYLES[subtitleStyleKey] || SUBTITLE_STYLES.hormozi);
	let isLavfiScene = $derived((currentScene?.footage?.videoUrl || '').startsWith('lavfi:'));
	let lavfiPreviewStyle = $derived.by(() => {
		if (!isLavfiScene) return '';
		const filter = currentScene.footage.videoUrl.slice('lavfi:'.length);
		const colorMatch = filter.match(/color=c=0x([0-9a-fA-F]{6})/);
		const hex = colorMatch ? `#${colorMatch[1]}` : '#0a0f1e';
		return `background: radial-gradient(ellipse at 30% 50%, ${hex}dd 0%, ${hex}22 60%, #000 100%);`;
	});
	function getChapterCardDuration(scene) {
		if (!scene?.chapter || scene.chapter.isHook || scene.chapter.tag === 'HOOK') return 0;
		return 2.8 + Number(scene.chapter.pauseDuration ?? 5);
	}
	let isBgmPreviewPlaying = $state(false);
	onMount(() => {
		initBGM();
		return () => { if (animFrameId) cancelAnimationFrame(animFrameId); audioController.pauseBGM(); };
	});
	function initBGM() {
		const track = BGM_TRACKS.find(t => t.id === selectedBgmId);
		if (track && track.url) { audioController.initBGM(track.url); audioController.setBGMVolume(isMuted ? 0 : bgmVolume); }
		else { audioController.initBGM(''); isBgmPreviewPlaying = false; }
	}
	function toggleBgmPreviewOnly() {
		if (isPlaying) pause();
		if (isBgmPreviewPlaying) { audioController.pauseBGM(); isBgmPreviewPlaying = false; }
		else { initBGM(); audioController.duckBGM(false); audioController.setBGMVolume(isMuted ? 0 : Math.max(0.04, bgmVolume)); audioController.playBGM(); isBgmPreviewPlaying = true; }
	}
	$effect(() => { if (selectedBgmId) { initBGM(); if (isBgmPreviewPlaying) audioController.playBGM(); } });
	$effect(() => { audioController.setBGMVolume(isMuted ? 0 : bgmVolume); });
	function isSameMediaSource(currentSrc, targetUrl) {
		if (!currentSrc || !targetUrl) return false;
		if (currentSrc === targetUrl) return true;
		try { const u1 = new URL(currentSrc, window.location.href).href; const u2 = new URL(targetUrl, window.location.href).href; return u1 === u2; } catch (_) { return currentSrc.endsWith(targetUrl) || targetUrl.endsWith(currentSrc); }
	}
	$effect(() => {
		if (currentScene && videoElement && !isLavfiScene) {
			const targetUrl = currentScene.footage?.videoUrl;
			if (targetUrl && videoElement.src !== targetUrl && !isSameMediaSource(videoElement.src, targetUrl)) {
				videoElement.src = targetUrl; videoElement.load(); videoElement.currentTime = 0;
				if (isPlaying) videoElement.play().catch(() => {});
			}
		}
	});
	$effect(() => {
		const targetUrl = currentScene?.voiceAudioUrl;
		if (voiceAudioElement) {
			if (targetUrl) {
				if (!isSameMediaSource(voiceAudioElement.src, targetUrl)) {
					voiceAudioElement.src = targetUrl;
					const timeToSeek = untrack(() => sceneCurrentTime);
					voiceAudioElement.currentTime = Math.max(0, timeToSeek);
					if (isPlaying) voiceAudioElement.play().catch((err) => console.warn('[StudioPlayer] voice play error:', err));
				}
			} else { voiceAudioElement.pause(); voiceAudioElement.removeAttribute('src'); voiceAudioElement.load(); }
		}
	});
	function togglePlay() { if (isPlaying) pause(); else play(); }
	function play() {
		if (!scenes || scenes.length === 0) return;
		isPlaying = true;
		if (videoElement) videoElement.play().catch(() => {});
		if (voiceAudioElement && currentScene?.voiceAudioUrl) {
			if (!isSameMediaSource(voiceAudioElement.src, currentScene.voiceAudioUrl)) voiceAudioElement.src = currentScene.voiceAudioUrl;
			voiceAudioElement.currentTime = sceneCurrentTime;
			voiceAudioElement.play().catch((err) => console.warn('[StudioPlayer] voice play error:', err));
		}
		audioController.playBGM();
		const isHook = Boolean(currentScene?.chapter?.isHook || currentScene?.chapter?.tag === 'HOOK');
		const chDuration = getChapterCardDuration(currentScene);
		if (currentScene?.chapter && !isHook && sceneCurrentTime < chDuration) {
			audioController.swellBGM(Math.max(0.5, chDuration - sceneCurrentTime));
			if (sceneCurrentTime < 0.6) playChapterStinger();
		} else audioController.duckBGM(Boolean(currentScene?.voiceAudioUrl));
		lastTick = performance.now(); tick();
	}
	function pause() { isPlaying = false; if (videoElement) videoElement.pause(); if (voiceAudioElement) voiceAudioElement.pause(); audioController.pauseBGM(); if (animFrameId) cancelAnimationFrame(animFrameId); }
	let lastTick = 0;
	function tick() {
		if (!isPlaying) return;
		const now = performance.now(); const delta = (now - lastTick) / 1000; lastTick = now;
		currentTime += delta;
		if (currentTime >= totalDuration) { currentTime = 0; activeSceneIndex = 0; pause(); return; }
		let cumulative = 0; let foundIndex = 0;
		for (let i = 0; i < scenes.length; i++) {
			const dur = scenes[i].audioDuration || scenes[i].estimatedDuration || 5;
			if (currentTime >= cumulative && currentTime < cumulative + dur) { foundIndex = i; break; }
			cumulative += dur;
		}
		if (foundIndex !== activeSceneIndex) {
			activeSceneIndex = foundIndex;
			const nextScene = scenes[foundIndex];
			if (voiceAudioElement && nextScene?.voiceAudioUrl) {
				if (!isSameMediaSource(voiceAudioElement.src, nextScene.voiceAudioUrl)) voiceAudioElement.src = nextScene.voiceAudioUrl;
				voiceAudioElement.currentTime = 0;
				if (isPlaying) voiceAudioElement.play().catch(() => {});
			}
			const nextIsHook = Boolean(nextScene?.chapter?.isHook || nextScene?.chapter?.tag === 'HOOK');
			if (nextScene?.chapter && !nextIsHook) { audioController.swellBGM(getChapterCardDuration(nextScene)); playChapterStinger(); }
			else audioController.duckBGM(Boolean(nextScene?.voiceAudioUrl));
		}
		animFrameId = requestAnimationFrame(tick);
	}
	function seekTo(targetTime) {
		currentTime = Math.max(0, Math.min(totalDuration, targetTime));
		let cumulative = 0;
		for (let i = 0; i < scenes.length; i++) {
			const dur = scenes[i].audioDuration || scenes[i].estimatedDuration || 5;
			if (currentTime >= cumulative && currentTime <= cumulative + dur) { activeSceneIndex = i; break; }
			cumulative += dur;
		}
		if (videoElement) videoElement.currentTime = sceneCurrentTime % (videoElement.duration || 10);
		if (voiceAudioElement && currentScene?.voiceAudioUrl) {
			if (!isSameMediaSource(voiceAudioElement.src, currentScene.voiceAudioUrl)) voiceAudioElement.src = currentScene.voiceAudioUrl;
			voiceAudioElement.currentTime = sceneCurrentTime;
			if (isPlaying) voiceAudioElement.play().catch(() => {});
		}
		audioController.seekBGM(currentTime);
		const chDuration = getChapterCardDuration(currentScene);
		if (currentScene?.chapter && sceneCurrentTime < chDuration) audioController.swellBGM(Math.max(0.5, chDuration - sceneCurrentTime));
		else audioController.duckBGM(Boolean(currentScene?.voiceAudioUrl));
	}
	function handleScrubberClick(e) { const rect = e.currentTarget.getBoundingClientRect(); const clickX = e.clientX - rect.left; const percent = clickX / rect.width; seekTo(percent * totalDuration); }
	function toggleFullscreen() {
		if (!playerContainer) return;
		if (!document.fullscreenElement) { playerContainer.requestFullscreen().catch(() => {}); isFullscreen = true; }
		else { document.exitFullscreen().catch(() => {}); isFullscreen = false; }
	}
	function formatTime(sec) { const m = Math.floor(sec / 60); const s = Math.floor(sec % 60); return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
</script>

<div class="studio-player-card glass-panel" bind:this={playerContainer}>
	<div class="viewport-wrapper">
		<div class="video-aspect-box">
			{#if isLavfiScene}
				<div class="lavfi-preview" style={lavfiPreviewStyle}><div class="lavfi-pulse"></div></div>
			{:else if currentScene?.footage?.videoUrl}
					<video bind:this={videoElement} src={currentScene.footage.videoUrl} class="main-video" loop muted={isMuted} playsinline crossorigin="anonymous" onerror={(e) => console.error('Video load error:', e.target.error.code, e.target.error.message, currentScene.footage.videoUrl)}></video>
			{:else}
				<div class="video-placeholder"><div class="placeholder-content"><Layers size={48} color="var(--primary)" /><p>Pilih atau generate script untuk memuat footage video 16:9</p></div></div>
			{/if}
			<audio bind:this={voiceAudioElement} preload="auto" onloadedmetadata={handleVoiceMetadata} onerror={(e) => console.warn('[StudioPlayer] Voice audio load error:', e)} style="display:none"></audio>
			{#if isHookLetterboxActive}
				<div class="hook-letterbox">
					<div class="letterbox-bar top"></div>
					<div class="letterbox-bar bottom"></div>
				</div>
			{/if}
			{#if currentScene?.chapter && !currentScene.chapter.isHook && currentScene.chapter.tag !== 'HOOK' && sceneCurrentTime < getChapterCardDuration(currentScene)}
				<div class="chapter-overlay" class:center-style={currentScene.chapter.style !== 'lower-third'} class:lower-third-style={currentScene.chapter.style === 'lower-third'} class:fade-out={sceneCurrentTime >= (getChapterCardDuration(currentScene) - 0.6)}>
					<div class="chapter-card">
						{#if currentScene.chapter.tag && currentScene.chapter.tag.trim()}<div class="chapter-tag-badge"><span class="chapter-dot"></span><span class="chapter-tag-text">{currentScene.chapter.tag}</span></div>{/if}
						<h2 class="chapter-main-title">{currentScene.chapter.title}</h2>
						{#if currentScene.chapter.subtitle}<p class="chapter-sub-title">{currentScene.chapter.subtitle}</p>{/if}
						<div class="chapter-accent-line"></div>
					</div>
				</div>
			{/if}
			{#if activeSubtitles.words.length > 0}
				<div class="subtitles-overlay pos-{subtitlePosition} decor-{quoteDecoration} {currentSubtitleStyle.id}" class:chapter-active={currentScene?.chapter && !currentScene.chapter.isHook && currentScene.chapter.tag !== 'HOOK' && sceneCurrentTime < getChapterCardDuration(currentScene)} style="font-family: {currentSubtitleStyle.fontFamily}; font-size: {subtitleFontSize || currentSubtitleStyle.fontSize}px; font-weight: {currentSubtitleStyle.fontWeight}; text-transform: {currentSubtitleStyle.textTransform};">
					<div class="subtitle-pill" style="background: {currentSubtitleStyle.backgroundColor};">
						{#if quoteDecoration === 'quote'}<span class="quote-mark">“</span>{/if}
						{#each activeSubtitles.words as item}
							<span class="word-token" class:active={karaokeEnabled && item.isHighlighted} style="color: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightColor : currentSubtitleStyle.primaryColor}; text-shadow: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightGlow : currentSubtitleStyle.shadow}; -webkit-text-stroke: {currentSubtitleStyle.textStroke};">{item.word}</span>
						{/each}
						{#if quoteDecoration === 'quote'}<span class="quote-mark">”</span>{/if}
					</div>
				</div>
			{/if}
			<div class="scene-badge">
				{#if currentScene?.chapter && !currentScene.chapter.isHook && currentScene.chapter.tag !== 'HOOK'}<span class="scene-badge-chapter">{currentScene.chapter.tag}:</span>{/if}
				Scene {activeSceneIndex + 1} / {scenes.length || 1}
			</div>
		</div>
	</div>
	<div class="timeline-scrubber" onclick={handleScrubberClick}>
		<div class="progress-fill" style="width: {totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%"></div>
		{#if scenes.length > 1}
			<div class="markers-container">
				{#each scenes as s, idx}
					{@const isHook = Boolean(s.chapter?.isHook || s.chapter?.tag === 'HOOK')}
					{@const markerPercent = (scenes.slice(0, idx).reduce((acc, cur) => acc + (cur.audioDuration || cur.estimatedDuration || 5), 0) / (totalDuration || 1)) * 100}
					<div class="scene-marker" class:chapter-marker={!!s.chapter && !isHook} class:hook-marker={isHook} style="left: {markerPercent}%" title={s.chapter ? (isHook ? `⚡ HOOK: ${s.chapter.title}` : `${s.chapter.tag}: ${s.chapter.title}`) : `Scene ${idx + 1}`}></div>
				{/each}
			</div>
		{/if}
	</div>
	<div class="controls-bar">
		<div class="controls-left">
			<button class="ctrl-btn main-play" onclick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>{#if isPlaying}<Pause size={18} />{:else}<Play size={18} style="margin-left: 2px;" />{/if}</button>
			<button class="ctrl-btn" onclick={() => seekTo(0)} title="Rewind to start"><RotateCcw size={16} /></button>
			<div class="timecode"><span class="curr-time">{formatTime(currentTime)}</span><span class="sep">/</span><span class="total-time">{formatTime(totalDuration)}</span></div>
		</div>
		<div class="controls-center">
			<div class="bgm-selector">
				<button type="button" class="btn-bgm-audition" class:playing={isBgmPreviewPlaying} onclick={toggleBgmPreviewOnly} title={isBgmPreviewPlaying ? "Stop preview backsound" : "Play & dengarkan backsound ini"}>{#if isBgmPreviewPlaying}<Pause size={12} color="#38bdf8" />{:else}<Play size={12} color="var(--accent-cyan)" />{/if}</button>
				<select bind:value={selectedBgmId}>{#each BGM_TRACKS as track}<option value={track.id}>{track.name} ({track.mood})</option>{/each}</select>
			</div>
			<div class="vol-control">
				<button class="vol-btn" onclick={() => isMuted = !isMuted} title={isMuted ? "Unmute" : "Mute"}>{#if isMuted || bgmVolume === 0}<VolumeX size={15} color="var(--danger)" />{:else}<Volume2 size={15} />{/if}</button>
				<input type="range" min="0" max="0.50" step="0.01" bind:value={bgmVolume} class="slider-mini" title="Volume Musik Latar: {Math.round((isMuted ? 0 : bgmVolume) * 100)}%" />
				<span class="vol-badge-mini">{Math.round((isMuted ? 0 : bgmVolume) * 100)}%</span>
			</div>
		</div>
		<div class="controls-right"><button class="ctrl-btn" onclick={toggleFullscreen} title="Full Screen"><Maximize size={16} /></button></div>
	</div>
</div>

<style>
	.studio-player-card { display: flex; flex-direction: column; overflow: hidden; border-radius: var(--r-lg); background: var(--bg-surface); border: 1px solid var(--line); }
	.viewport-wrapper { position: relative; width: 100%; background: #000; }
	.video-aspect-box { position: relative; width: 100%; padding-top: 56.25%; overflow: hidden; background: #05070f; }
	.main-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
	.lavfi-preview { position: absolute; inset: 0; opacity: 0.85; }
	.lavfi-pulse { display: none; }
	.video-placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); text-align: center; padding: 20px; }
	.placeholder-content { display: flex; flex-direction: column; gap: 10px; align-items: center; color: var(--text-2); max-width: 300px; font-size: 0.82rem; }
	.subtitles-overlay { position: absolute; display: flex; padding: 0 12px; pointer-events: none; z-index: 5; }
	.subtitles-overlay.pos-bottom-center { bottom: 10%; left: 0; right: 0; justify-content: center; }
	.subtitles-overlay.pos-center { inset: 0; justify-content: center; align-items: center; }
	.subtitles-overlay.pos-top-center { top: 8%; left: 0; right: 0; justify-content: center; }
	.subtitles-overlay.pos-bottom-left { bottom: 10%; left: 4%; right: auto; justify-content: flex-start; }
	.subtitles-overlay.pos-bottom-right { bottom: 10%; right: 4%; left: auto; justify-content: flex-end; }
	.subtitle-pill { display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: center; align-items: baseline; padding: 6px 12px; border-radius: var(--r-md); max-width: 84%; background: rgba(0,0,0,0.55); border: none; }
	.subtitles-overlay.decor-side .subtitle-pill { border-radius: 0; }
	.subtitles-overlay.pos-center .subtitle-pill { max-width: 78%; padding: 14px 20px; border-radius: var(--r-lg); }
	.quote-mark { font-family: Georgia, serif; font-size: 1.6em; line-height: 0.8; opacity: 0.9; margin: 0 2px; }
	.word-token { display: inline-block; line-height: 1.2; font-size: 0.92em; }
	.scene-badge { position: absolute; top: 10px; left: 10px; padding: 3px 8px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--r-full); font-size: 0.68rem; font-weight: 600; color: #fff; }
	.hook-letterbox { position: absolute; inset: 0; pointer-events: none; z-index: 4; display: flex; flex-direction: column; justify-content: space-between; }
	.letterbox-bar { width: 100%; height: 8%; background: #000; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
	.letterbox-bar.top { border-bottom: 1px solid rgba(255,255,255,0.05); }
	.letterbox-bar.bottom { border-top: 1px solid rgba(255,255,255,0.05); }
	.timeline-scrubber { position: relative; height: 6px; background: var(--bg-card); cursor: pointer; border-top: 1px solid var(--line); }
	.progress-fill { position: absolute; left: 0; top: 0; height: 100%; background: var(--primary); }
	.markers-container { position: absolute; inset: 0; pointer-events: none; }
	.scene-marker { position: absolute; top: 0; width: 1px; height: 100%; background: rgba(255,255,255,0.35); }
	.scene-marker.chapter-marker { width: 2px; background: var(--text-2); }
	.scene-marker.hook-marker { width: 2px; background: var(--text-3); }
	.controls-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; background: var(--bg-card); border-top: 1px solid var(--line); flex-wrap: wrap; }
	.controls-left, .controls-center, .controls-right { display: flex; align-items: center; gap: 8px; }
	.ctrl-btn { width: 30px; height: 30px; border-radius: var(--r-sm); background: var(--bg-surface); border: 1px solid var(--line); color: var(--text-2); display: flex; align-items: center; justify-content: center; }
	.ctrl-btn:hover { border-color: var(--line-strong); color: var(--text); }
	.main-play { background: var(--text); border-color: var(--text); color: var(--bg-base); }
	.main-play:hover { background: #fff; border-color: #fff; color: var(--bg-base); }
	.timecode { display: flex; gap: 4px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-2); }
	.curr-time { color: var(--text); font-weight: 600; }
	.bgm-selector { display: flex; gap: 6px; align-items: center; padding: 4px 8px; background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--r-md); }
	.btn-bgm-audition { width: 20px; height: 20px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; color: var(--text-2); }
	.btn-bgm-audition.playing { background: var(--text); color: var(--bg-base); border-color: var(--text); }
	.bgm-selector select { background: transparent; border: none; font-size: 0.74rem; color: var(--text-2); padding: 2px; }
	.vol-control { display: flex; align-items: center; gap: 6px; }
	.vol-btn { color: var(--text-3); padding: 2px; }
	.slider-mini { width: 64px; height: 4px; accent-color: var(--text); }
	.vol-badge-mini { font-size: 0.68rem; color: var(--text-3); min-width: 22px; font-variant-numeric: tabular-nums; }
	.chapter-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 6; }
	.chapter-overlay.lower-third-style { align-items: flex-end; justify-content: flex-start; padding: 16px; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 55%); }
	.chapter-card { padding: 14px 18px; background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--r-md); max-width: 78%; text-align: center; }
	.chapter-overlay.lower-third-style .chapter-card { text-align: left; max-width: 60%; border-left: 2px solid var(--line-strong); }
	.chapter-tag-badge { display: inline-flex; gap: 6px; align-items: center; padding: 2px 8px; background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-full); margin-bottom: 8px; font-size: 0.65rem; color: var(--text-3); }
	.chapter-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-2); }
	.chapter-tag-text { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; color: var(--text-2); }
	.chapter-main-title { font-size: clamp(1.1rem, 2.4vw, 1.6rem); font-weight: 800; color: var(--text); text-transform: uppercase; line-height: 1.1; }
	.chapter-sub-title { font-size: 0.82rem; color: var(--text-2); margin-top: 4px; line-height: 1.4; }
	.chapter-accent-line { display: none; }
	.scene-badge-chapter { color: var(--text-2); font-weight: 600; margin-right: 4px; }
	.subtitles-overlay.chapter-active { opacity: 0; }
</style>
