<script>
	import { onMount, untrack } from 'svelte';
	import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize, Layers } from 'lucide-svelte';
	import { SUBTITLE_STYLES, SUBTITLE_POSITIONS, SUBTITLE_DECORS, getActiveSubtitleWindow, isConnectorWord, chunkIntoCinematicLines, generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
	import { audioController, BGM_TRACKS, playChapterStinger } from '$lib/services/audioEngine.js';

	let {
		scenes = [],
		activeSceneIndex = $bindable(0),
		subtitleStyleKey = 'cinema_essay',
		subtitlePosition = 'bottom-center',
		quoteDecoration = 'none',
		subtitleFontSize = 34,
		karaokeEnabled = true,
		subtitleAnimation = 'word_by_word',
		wordsPerLine = 2,
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
		if (!currentScene) return { words: [], lines: [], activeIndex: -1, chunkIndex: 0, isLeft: true };
		const dur = currentScene.audioDuration || currentScene.estimatedDuration || 5;
		
		const sceneWords = Array.isArray(currentScene.words) && currentScene.words.length > 0
			? currentScene.words
			: (typeof currentScene.narration === 'string'
				? currentScene.narration.trim().split(/\s+/).filter(Boolean)
				: (Array.isArray(currentScene.wordTimings) ? currentScene.wordTimings.map((w) => w.word) : []));

		const isRealChapter = Boolean(currentScene.chapter && !currentScene.chapter.isHook && currentScene.chapter.tag !== 'HOOK');
		const pauseSec = Number(currentScene.chapter?.pauseDuration ?? 5);

		const rawTimings = currentScene.wordTimings && currentScene.wordTimings.length > 0
			? currentScene.wordTimings
			: generateSyntheticWordTimings(sceneWords, dur, isRealChapter, pauseSec);
		if (!rawTimings || rawTimings.length === 0) return { words: [], lines: [], activeIndex: -1, chunkIndex: 0, isLeft: true };

		const style = SUBTITLE_STYLES[subtitleStyleKey] || SUBTITLE_STYLES.cinema_essay || SUBTITLE_STYLES.hormozi;
		let timings = rawTimings;
		if (isRealChapter) {
			const chDuration = getChapterCardDuration(currentScene);
			// Only hide subtitle during chapter card if actively playing
			if (isPlaying && sceneCurrentTime < chDuration - 0.3) {
				return { words: [], lines: [], activeIndex: -1, chunkIndex: 0, isLeft: true };
			}
			const filtered = timings.filter((t) => t.start >= chDuration - 0.4);
			if (filtered.length > 0) timings = filtered;
		}
		if (isBlackoutScene) {
			// Blank Quote: tampil per baris mengalir natural layaknya subtitle film
			return getActiveSubtitleWindow(timings, sceneCurrentTime, 6, false, {
				animation: 'static',
				wordByWord: false,
				wordsPerLine: 2,
				connectorScale: style.connectorScale,
				isPlaying,
				previewAtStart: !isPlaying || sceneCurrentTime <= 0.05
			});
		}
		return getActiveSubtitleWindow(timings, sceneCurrentTime, style.chunkSize, karaokeEnabled, {
			animation: subtitleAnimation,
			wordByWord: style.wordByWord,
			wordsPerLine: wordsPerLine,
			connectorScale: style.connectorScale,
			isPlaying,
			previewAtStart: !isPlaying || sceneCurrentTime <= 0.05
		});
	});

	let blackoutLines = $derived.by(() => {
		if (!currentScene) return [];
		const dur = currentScene.audioDuration || currentScene.estimatedDuration || 5;
		const rawTimings = currentScene.wordTimings && currentScene.wordTimings.length > 0
			? currentScene.wordTimings
			: generateSyntheticWordTimings(currentScene.words, dur);
		if (!rawTimings || rawTimings.length === 0) return [];
		return chunkIntoCinematicLines(rawTimings, 6);
	});

	let activeBlackoutLine = $derived.by(() => {
		if (!blackoutLines || blackoutLines.length === 0) return null;
		for (let i = 0; i < blackoutLines.length; i++) {
			const line = blackoutLines[i];
			const next = blackoutLines[i + 1];
			const holdEnd = next ? next.start : line.end + 0.8;
			if (sceneCurrentTime < line.start && i === 0) {
				return line;
			}
			if (sceneCurrentTime >= line.start - 0.12 && sceneCurrentTime < holdEnd) {
				return line;
			}
		}
		return blackoutLines[blackoutLines.length - 1];
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
	let isBlackoutScene = $derived(
		Boolean(currentScene?.isBlackout || currentScene?.quoteMode || currentScene?.footage?.isBlackout || (currentScene?.footage?.videoUrl || '').includes('color=c=black'))
	);
	let isLavfiScene = $derived(isBlackoutScene || (currentScene?.footage?.videoUrl || '').startsWith('lavfi:'));
	let lavfiPreviewStyle = $derived.by(() => {
		if (isBlackoutScene) return 'background: #000000;';
		if (!isLavfiScene) return '';
		const filter = currentScene.footage.videoUrl.slice('lavfi:'.length);
		const colorMatch = filter.match(/color=c=0x([0-9a-fA-F]{6})/);
		const hex = colorMatch ? `#${colorMatch[1]}` : '#0a0f1e';
		return `background: radial-gradient(ellipse at 30% 50%, ${hex}dd 0%, ${hex}22 60%, #000 100%);`;
	});

	let shouldShowSubtitle = $derived.by(() => {
		if (!currentScene) return false;
		if (currentScene.showSubtitle === false) return false;
		if (isPlaying && subtitlePosition === 'smart-flow' && currentScene.showSubtitle === undefined && (activeSceneIndex % 5 === 2) && !isBlackoutScene && !currentScene.chapter) {
			return false; // Dynamic breathing scene during playback: visual break!
		}
		return true;
	});
	let effectiveSubtitlePosition = $derived.by(() => {
		if (isBlackoutScene || currentScene?.quoteMode) return 'center';
		if (currentScene?.subtitlePos) return currentScene.subtitlePos;
		if (subtitlePosition === 'smart-flow') {
			return (activeSceneIndex % 2 === 0) ? 'wolf-left' : 'wolf-right';
		}
		return subtitlePosition;
	});
	let effectiveQuoteDecoration = $derived.by(() => {
		if (isBlackoutScene || currentScene?.quoteMode) return 'quote';
		return quoteDecoration;
	});
	function getChapterCardDuration(scene) {
		if (!scene?.chapter || scene.chapter.isHook || scene.chapter.tag === 'HOOK') return 0;
		const dur = scene.audioDuration || scene.estimatedDuration || 5;
		const pause = Number(scene.chapter.pauseDuration ?? 3.5);
		return Math.min(Math.max(1.5, dur - 1.5), 1.8 + pause);
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
			{#if isBlackoutScene && shouldShowSubtitle}
				<!-- Tampilan Blank Quote: Tampil baris per baris elegan selaras audio, dengan tipografi cinematik Playfair Display -->
				<div class="blackout-quote-viewport">
					{#if activeBlackoutLine}
						{#key activeBlackoutLine.index}
							<div class="blackout-quote-card">
								<p class="blackout-quote-text">
									{#if activeBlackoutLine.isFirst}<span class="quote-glyph open">“</span>{/if}
									{activeBlackoutLine.text}
									{#if activeBlackoutLine.isLast}<span class="quote-glyph close">”</span>{/if}
								</p>
							</div>
						{/key}
					{/if}
				</div>
			{:else if shouldShowSubtitle && activeSubtitles.words.length > 0}
				<div
					class="subtitles-overlay pos-{effectiveSubtitlePosition} decor-{effectiveQuoteDecoration} {currentSubtitleStyle.id}"
					class:split-left={effectiveSubtitlePosition === 'center' ? false : (subtitlePosition === 'cinema-split' || subtitlePosition === 'wolf-split') && activeSubtitles.isLeft}
					class:split-right={effectiveSubtitlePosition === 'center' ? false : (subtitlePosition === 'cinema-split' || subtitlePosition === 'wolf-split') && !activeSubtitles.isLeft}
					class:chapter-active={isPlaying && currentScene?.chapter && !currentScene.chapter.isHook && currentScene.chapter.tag !== 'HOOK' && sceneCurrentTime < getChapterCardDuration(currentScene)}
					style="font-family: {currentSubtitleStyle.fontFamily}; font-size: {subtitleFontSize || currentSubtitleStyle.fontSize}px; font-weight: {currentSubtitleStyle.fontWeight}; text-transform: {currentSubtitleStyle.textTransform};"
				>
					<div 
						class="subtitle-pill"
						class:stacked={currentSubtitleStyle.stackWords}
						style="background: {currentSubtitleStyle.backgroundColor};"
					>
						{#if effectiveQuoteDecoration === 'quote'}<span class="quote-mark">“</span>{/if}
						{#if currentSubtitleStyle.stackWords && activeSubtitles.lines && activeSubtitles.lines.length > 0}
							{#each activeSubtitles.lines as line}
								<div class="subtitle-line-row">
									{#each line.words as item}
										{@const isConn = currentSubtitleStyle.connectorScale && item.isConnector}
										<span
											class="word-token"
											class:active={karaokeEnabled && item.isHighlighted}
											class:anim-reveal={item.isLatest}
											class:is-connector={isConn}
											style="color: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightColor : (isConn && currentSubtitleStyle.secondaryColor ? currentSubtitleStyle.secondaryColor : currentSubtitleStyle.primaryColor)}; text-shadow: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightGlow : (isConn ? '0 2px 14px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0,0,0,0.9)' : currentSubtitleStyle.shadow)}; -webkit-text-stroke: {currentSubtitleStyle.textStroke};"
										>{item.word}</span>
									{/each}
								</div>
							{/each}
						{:else}
							{#each activeSubtitles.words as item}
								{@const isConn = currentSubtitleStyle.connectorScale && item.isConnector}
								<span
									class="word-token"
									class:active={karaokeEnabled && item.isHighlighted}
									class:anim-reveal={item.isLatest}
									class:is-connector={isConn}
									style="color: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightColor : (isConn && currentSubtitleStyle.secondaryColor ? currentSubtitleStyle.secondaryColor : currentSubtitleStyle.primaryColor)}; text-shadow: {karaokeEnabled && item.isHighlighted ? currentSubtitleStyle.highlightGlow : (isConn ? '0 2px 14px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0,0,0,0.9)' : currentSubtitleStyle.shadow)}; -webkit-text-stroke: {currentSubtitleStyle.textStroke};"
								>{item.word}</span>
							{/each}
						{/if}
						{#if effectiveQuoteDecoration === 'quote'}<span class="quote-mark">”</span>{/if}
					</div>
				</div>
			{/if}
			{#if isBlackoutScene}
				<div class="blackout-mode-badge" title="Adegan ini adalah Blank Hitam (Dramatic Quote)">
					<span class="blackout-badge-dot"></span>
					<span>BLANK QUOTE</span>
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
	.subtitles-overlay.pos-cinema-split { bottom: 22%; width: auto; max-width: 44%; }
	.subtitles-overlay.pos-cinema-split.split-left,
	.subtitles-overlay.pos-cinema-left { bottom: 22%; left: 8%; right: auto; justify-content: flex-start; text-align: left; }
	.subtitles-overlay.pos-cinema-split.split-right,
	.subtitles-overlay.pos-cinema-right { bottom: 22%; right: 8%; left: auto; justify-content: flex-end; text-align: left; }
	.subtitles-overlay.pos-wolf-split { top: 30%; width: auto; max-width: 44%; }
	.subtitles-overlay.pos-wolf-split.split-left,
	.subtitles-overlay.pos-wolf-left { top: 30%; bottom: auto; left: 8%; right: auto; justify-content: flex-start; text-align: left; }
	.subtitles-overlay.pos-wolf-split.split-right,
	.subtitles-overlay.pos-wolf-right { top: 30%; bottom: auto; right: 8%; left: auto; justify-content: flex-end; text-align: right; }
	.subtitle-pill { display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: center; align-items: baseline; padding: 6px 12px; border-radius: var(--r-md); max-width: 84%; background: rgba(0,0,0,0.55); border: none; }
	.subtitles-overlay.decor-side .subtitle-pill { border-radius: 0; }
	.subtitles-overlay.pos-center .subtitle-pill { max-width: 78%; padding: 14px 20px; border-radius: var(--r-lg); }
	.subtitles-overlay.cinema_essay .subtitle-pill { background: transparent; padding: 0; border-radius: 0; max-width: 320px; gap: 4px 8px; line-height: 1.18; letter-spacing: -0.025em; }
	.subtitles-overlay.cinema_essay.pos-cinema-split.split-left .subtitle-pill,
	.subtitles-overlay.cinema_essay.pos-cinema-left .subtitle-pill { justify-content: flex-start; }
	.subtitles-overlay.cinema_essay.pos-cinema-split.split-right .subtitle-pill,
	.subtitles-overlay.cinema_essay.pos-cinema-right .subtitle-pill { justify-content: flex-start; }
	.subtitles-overlay.wolf_stack .subtitle-pill,
	.subtitle-pill.stacked {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
		padding: 0;
		gap: 4px;
		background: transparent !important;
		line-height: 0.88;
		border-radius: 0;
		max-width: 480px;
	}
	.subtitles-overlay.pos-wolf-right .subtitle-pill,
	.subtitles-overlay.pos-wolf-split.split-right .subtitle-pill {
		align-items: flex-end;
		text-align: right;
	}
	.subtitle-line-row {
		display: flex;
		align-items: baseline;
		gap: 0.28em;
		flex-wrap: nowrap;
		line-height: 0.88;
	}
	.subtitles-overlay.pos-wolf-right .subtitle-line-row,
	.subtitles-overlay.pos-wolf-split.split-right .subtitle-line-row {
		justify-content: flex-end;
	}
	.subtitles-overlay.wolf_stack .word-token,
	.subtitle-pill.stacked .word-token {
		display: inline-block;
		font-family: 'Outfit', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
		line-height: 0.86;
		letter-spacing: -0.05em;
		font-weight: 900;
		text-transform: lowercase;
		margin: 0;
		padding: 0;
		color: #ffffff;
	}
	.subtitles-overlay.wolf_stack .word-token.is-connector,
	.subtitle-pill.stacked .word-token.is-connector {
		font-family: 'Playfair Display', Georgia, serif !important;
		font-style: italic !important;
		font-size: 0.58em;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.05;
		margin-top: 3px;
		margin-bottom: 3px;
		text-transform: lowercase !important;
		color: #f59e0b !important;
		text-shadow: 0 2px 14px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0, 0, 0, 0.95) !important;
		opacity: 1;
	}
	.blackout-quote-viewport {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px 8%;
		pointer-events: none;
		z-index: 5;
	}
	.blackout-quote-card {
		max-width: 960px;
		width: 100%;
		text-align: center;
		padding: 0 20px;
	}
	.blackout-quote-text {
		font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
		font-size: clamp(1.15rem, 2.0vw, 1.55rem);
		font-weight: 500;
		font-style: italic;
		line-height: 1.55;
		color: #f8fafc;
		text-shadow: 0 3px 18px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.9);
		letter-spacing: 0.015em;
		word-break: normal;
		overflow-wrap: break-word;
		margin: 0;
		padding: 0;
		display: inline-block;
		animation: cinematicLineIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.blackout-quote-text .quote-glyph {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 1.15em;
		font-weight: 600;
		font-style: italic;
		color: #f59e0b;
		vertical-align: -0.05em;
		margin: 0 3px;
		display: inline-block;
		text-shadow: 0 2px 12px rgba(245, 158, 11, 0.4), 0 2px 6px rgba(0, 0, 0, 0.9);
	}
	@keyframes cinematicLineIn {
		0% {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
			filter: blur(4px);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}
	.blackout-mode-badge {
		position: absolute;
		top: 10px;
		right: 10px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 3px 10px;
		background: rgba(0, 0, 0, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--r-full);
		font-size: 0.68rem;
		font-weight: 700;
		color: #f8fafc;
		letter-spacing: 0.05em;
		z-index: 5;
	}
	.blackout-badge-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ef4444;
		box-shadow: 0 0 6px #ef4444;
	}
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
