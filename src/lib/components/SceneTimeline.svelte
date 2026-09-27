<script>
	import { onMount, onDestroy } from 'svelte';
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
		FolderUp,
		Sliders,
		RotateCw,
		Check
	} from 'lucide-svelte';
	import { VoiceRecorder } from '$lib/services/audioAnalysisService.js';
	import {
		AUDIO_EFFECT_PRESETS,
		DEFAULT_AUDIO_EFFECT_ID,
		getAudioEffectById
	} from '$lib/services/audioEffectService.js';
	import { getSpokenVoiceoverText, getChapterSpokenIntro, getGlobalChapterConfig } from '$lib/services/scriptAnalyzer.js';
	import { applyAutoRhythm } from '$lib/services/subtitleService.js';

	let {
		scenes = $bindable([]),
		activeSceneIndex = $bindable(0),
		selectedAudioEffect = DEFAULT_AUDIO_EFFECT_ID,
		onOpenFootagePicker,
		onRegenerateVoice,
		onChangeSceneEffect,
		onApplyEffectToAll,
		onAddScene,
		onUploadAudio,
		onBatchUploadAudio,
		onRecordAudio,
		onAdjustTimingOffset
	} = $props();

	let autoRhythmAppliedToast = $state(false);
	let batchFileInput = $state(null);
	let activeEffectDropdownIndex = $state(-1);
	let searchQuery = $state('');
	let filterMode = $state('all');
	let pageSize = $state('50');
	let compactMode = $state(false);
	let scenesListEl = $state(null);

	let filteredScenes = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		const list = scenes.map((s, origIndex) => ({ scene: s, origIndex }));
		return list.filter(({ scene }) => {
			if (q) {
				const hay = `${scene.narration || ''} ${scene.visualQuery || ''} ${scene.chapter?.title || ''} ${scene.chapter?.tag || ''}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			if (filterMode === 'need_voice') return !scene.voiceAudioUrl;
			if (filterMode === 'ready') return !!scene.voiceAudioUrl;
			if (filterMode === 'chapters') return !!scene.chapter;
			if (filterMode === 'blackout') return !!scene.isBlackout;
			return true;
		});
	});

	function toggleSceneSubtitle(idx) {
		const sc = scenes[idx];
		if (!sc) return;
		sc.showSubtitle = sc.showSubtitle === false ? true : false;
		scenes = [...scenes];
	}

	function cycleSceneSubtitlePos(idx) {
		const sc = scenes[idx];
		if (!sc) return;
		const order = ['wolf-left', 'wolf-right'];
		const current = sc.subtitlePos || 'wolf-left';
		const nextIdx = (order.indexOf(current) + 1) % order.length;
		sc.subtitlePos = order[nextIdx];
		scenes = [...scenes];
	}

	function handleApplyAutoRhythm() {
		scenes = applyAutoRhythm(scenes);
		autoRhythmAppliedToast = true;
		setTimeout(() => { autoRhythmAppliedToast = false; }, 4000);
	}

	function toggleSceneBlackout(idx) {
		const sc = scenes[idx];
		if (!sc) return;
		if (sc.isBlackout) {
			sc.isBlackout = false;
			sc.quoteMode = false;
			if (sc.prevFootage) {
				sc.footage = sc.prevFootage;
				delete sc.prevFootage;
			}
		} else {
			sc.isBlackout = true;
			sc.quoteMode = true;
			sc.prevFootage = sc.footage ? { ...sc.footage } : null;
			sc.footage = {
				videoUrl: 'lavfi:color=c=black:size=1920x1080:rate=30',
				title: 'Layar Hitam (Dramatic Quote)',
				thumbnail: '',
				isBlackout: true
			};
		}
		scenes = [...scenes];
	}

	function setAllSubtitles(enabled) {
		scenes = scenes.map(s => ({ ...s, showSubtitle: enabled }));
	}

	let displayedScenes = $derived.by(() => {
		if (pageSize === 'all') return filteredScenes;
		return filteredScenes.slice(0, Number(pageSize));
	});

	let canLoadMore = $derived(filteredScenes.length > displayedScenes.length);

	function scrollToActive() {
		if (!scenesListEl) return;
		const el = scenesListEl.querySelector(`[data-scene-index="${activeSceneIndex}"]`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		else scenesListEl.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function scrollToTop() {
		scenesListEl?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function loadMore() {
		if (pageSize === '50') pageSize = '100';
		else if (pageSize === '100') pageSize = 'all';
		else pageSize = 'all';
	}

	$effect(() => {
		void activeSceneIndex;
		if (scenesListEl && scenes.length > 0 && activeSceneIndex >= 0) {
			queueMicrotask(() => {
				const el = scenesListEl.querySelector(`[data-scene-index="${activeSceneIndex}"]`);
				if (el && filteredScenes.some(f => f.origIndex === activeSceneIndex)) {
					const rect = el.getBoundingClientRect();
					const listRect = scenesListEl.getBoundingClientRect();
					if (rect.top < listRect.top || rect.bottom > listRect.bottom) {
						el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					}
				}
			});
		}
	});

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

	let globalTagPreset = $state('bab');
	let globalPauseDuration = $state(5);
	let globalOutroPause = $state(0);
	let isApplyingGlobal = $state(false);

	const chapterScenesCount = $derived(scenes.filter((s) => s.chapter).length);

	function addChapter(index) {
		const existingChapters = scenes.slice(0, index).filter((s) => s.chapter).length;
		const num = existingChapters + 1;
		let tag = `BAB ${String(num).padStart(2, '0')}`;
		if (globalTagPreset === 'bagian') tag = `BAGIAN ${num}`;
		else if (globalTagPreset === 'part') tag = `PART ${num}`;
		else if (globalTagPreset === 'none') tag = '';

		scenes[index].chapter = {
			number: num,
			tag,
			title: `Bab ${num}`,
			subtitle: 'Pengantar topik pada segmen ini',
			style: 'center',
			pauseDuration: globalPauseDuration,
			outroPause: globalOutroPause
		};
		scenes = [...scenes];
	}

	function setGlobalTag(preset) {
		globalTagPreset = preset;
		if (typeof window !== 'undefined') {
			localStorage.setItem('yt_global_chapter_tag', preset);
		}
		for (const sc of scenes) {
			if (!sc.chapter) continue;
			const num = sc.chapter.number || 1;
			if (preset === 'bab') sc.chapter.tag = `BAB ${String(num).padStart(2, '0')}`;
			else if (preset === 'bagian') sc.chapter.tag = `BAGIAN ${num}`;
			else if (preset === 'part') sc.chapter.tag = `PART ${num}`;
			else if (preset === 'none') sc.chapter.tag = '';
		}
		scenes = [...scenes];
	}

	function setGlobalPause(sec) {
		globalPauseDuration = sec;
		if (typeof window !== 'undefined') {
			localStorage.setItem('yt_global_chapter_pause', String(sec));
		}
		for (const sc of scenes) {
			if (!sc.chapter) continue;
			sc.chapter.pauseDuration = sec;
		}
		scenes = [...scenes];
	}

	function setGlobalOutro(sec) {
		globalOutroPause = sec;
		if (typeof window !== 'undefined') {
			localStorage.setItem('yt_global_chapter_outro', String(sec));
		}
		for (const sc of scenes) {
			if (!sc.chapter) continue;
			sc.chapter.outroPause = sec;
		}
		scenes = [...scenes];
	}

	async function applyAllGlobalChapterSettings() {
		if (isApplyingGlobal) return;
		isApplyingGlobal = true;

		try {
			if (typeof window !== 'undefined') {
				localStorage.setItem('yt_global_chapter_tag', globalTagPreset);
				localStorage.setItem('yt_global_chapter_pause', String(globalPauseDuration));
				localStorage.setItem('yt_global_chapter_outro', String(globalOutroPause));
			}

			// Apply to all scenes with chapters
			for (let i = 0; i < scenes.length; i++) {
				const sc = scenes[i];
				if (!sc.chapter) continue;
				const num = sc.chapter.number || 1;
				if (globalTagPreset === 'bab') sc.chapter.tag = `BAB ${String(num).padStart(2, '0')}`;
				else if (globalTagPreset === 'bagian') sc.chapter.tag = `BAGIAN ${num}`;
				else if (globalTagPreset === 'part') sc.chapter.tag = `PART ${num}`;
				else if (globalTagPreset === 'none') sc.chapter.tag = '';

				sc.chapter.pauseDuration = globalPauseDuration;
				sc.chapter.outroPause = globalOutroPause;
			}
			scenes = [...scenes];

			// If voiceover is generated for these chapter scenes, re-synthesize so audio timing & spoken tag updates
			if (onRegenerateVoice) {
				for (let i = 0; i < scenes.length; i++) {
					const sc = scenes[i];
					if (sc.chapter && sc.voiceAudioUrl && !sc.isCustomAudio) {
						regeneratingSceneIndices.add(i);
						regeneratingSceneIndices = new Set(regeneratingSceneIndices);
						try {
							await onRegenerateVoice(i);
						} catch (err) {
							console.error('Failed to regenerate chapter scene voice', i, err);
						} finally {
							regeneratingSceneIndices.delete(i);
							regeneratingSceneIndices = new Set(regeneratingSceneIndices);
						}
					}
				}
			}
		} finally {
			isApplyingGlobal = false;
		}
	}

	let regeneratingSceneIndices = $state(new Set());
	let chapterDebounceTimers = {};

	async function removeChapter(index) {
		scenes[index].chapter = null;
		scenes = [...scenes];
		if (onRegenerateVoice && scenes[index].voiceAudioUrl && !scenes[index].isCustomAudio) {
			try {
				regeneratingSceneIndices.add(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
				await onRegenerateVoice(index);
			} finally {
				regeneratingSceneIndices.delete(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
			}
		}
	}

	async function setChapterPreset(scene, preset, index) {
		if (!scene.chapter) return;
		const num = scene.chapter.number || 1;
		if (preset === 'bab') {
			scene.chapter.tag = `BAB ${String(num).padStart(2, '0')}`;
		} else if (preset === 'bagian') {
			scene.chapter.tag = `BAGIAN ${num}`;
		} else if (preset === 'part') {
			scene.chapter.tag = `PART ${num}`;
		} else if (preset === 'none') {
			scene.chapter.tag = '';
		}
		scenes = [...scenes];

		// Automatically auto-regenerate voice for this scene if speech is already generated
		if (onRegenerateVoice && scene.voiceAudioUrl && !scene.isCustomAudio) {
			try {
				regeneratingSceneIndices.add(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
				await onRegenerateVoice(index);
			} finally {
				regeneratingSceneIndices.delete(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
			}
		}
	}

	async function setChapterPauseDuration(scene, seconds, index) {
		if (!scene.chapter) return;
		scene.chapter.pauseDuration = seconds;
		scenes = [...scenes];

		if (onRegenerateVoice && scene.voiceAudioUrl && !scene.isCustomAudio) {
			try {
				regeneratingSceneIndices.add(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
				await onRegenerateVoice(index);
			} finally {
				regeneratingSceneIndices.delete(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
			}
		}
	}

	async function setChapterOutroPause(scene, seconds, index) {
		if (!scene.chapter) return;
		scene.chapter.outroPause = seconds;
		scenes = [...scenes];

		if (onRegenerateVoice && scene.voiceAudioUrl && !scene.isCustomAudio) {
			try {
				regeneratingSceneIndices.add(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
				await onRegenerateVoice(index);
			} finally {
				regeneratingSceneIndices.delete(index);
				regeneratingSceneIndices = new Set(regeneratingSceneIndices);
			}
		}
	}

	function handleChapterTextEdit(index) {
		const sc = scenes[index];
		if (!sc) return;
		if (chapterDebounceTimers[index]) clearTimeout(chapterDebounceTimers[index]);

		chapterDebounceTimers[index] = setTimeout(async () => {
			if (onRegenerateVoice && sc.voiceAudioUrl && !sc.isCustomAudio) {
				const currentSpoken = getSpokenVoiceoverText(sc).trim();
				if (sc.lastSpokenText && sc.lastSpokenText.trim() === currentSpoken) return;
				try {
					regeneratingSceneIndices.add(index);
					regeneratingSceneIndices = new Set(regeneratingSceneIndices);
					await onRegenerateVoice(index);
				} finally {
					regeneratingSceneIndices.delete(index);
					regeneratingSceneIndices = new Set(regeneratingSceneIndices);
				}
			}
		}, 1000);
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

	let windowClickHandler = null;
	onMount(() => {
		const globalCfg = getGlobalChapterConfig();
		globalTagPreset = globalCfg.tagPreset;
		globalPauseDuration = globalCfg.pauseDuration;
		globalOutroPause = globalCfg.outroPause;

		windowClickHandler = () => {
			activeEffectDropdownIndex = -1;
		};
		window.addEventListener('click', windowClickHandler);
	});

	onDestroy(() => {
		if (windowClickHandler && typeof window !== 'undefined') {
			window.removeEventListener('click', windowClickHandler);
		}
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
			<div class="icon-wrap"><Film size={16} /></div>
			<div>
				<h3 class="panel-title">Storyboard · {scenes.length} scene</h3>
				<p class="panel-desc">
					{#if scenes.length > 0}
						Menampilkan {displayedScenes.length} dari {filteredScenes.length} · Aktif: Scene {activeSceneIndex + 1}
					{:else}
						Generate naskah dulu, lalu kelola 100+ scene tanpa scroll berat.
					{/if}
				</p>
			</div>
		</div>

		<div class="header-actions">
			<button type="button" class="btn btn-secondary btn-sm" onclick={scrollToActive} disabled={scenes.length === 0} title="Loncat ke scene yang sedang preview">Loncat ke aktif</button>
			<button type="button" class="btn btn-secondary btn-sm" onclick={scrollToTop} disabled={scenes.length === 0}>Ke atas</button>
			
			<button 
				type="button" 
				class="btn btn-sm btn-auto-rhythm" 
				onclick={handleApplyAutoRhythm} 
				disabled={scenes.length === 0} 
				title="Otomatis acak ritme subtitle: kiri, kanan, & jeda hening tanpa teks tanpa perlu atur manual!"
			>
				<span>🎲 Auto-Rhythm Sub</span>
			</button>

			<button 
				type="button" 
				class="btn btn-secondary btn-sm" 
				onclick={() => setAllSubtitles(true)} 
				disabled={scenes.length === 0} 
				title="Aktifkan subtitle di seluruh adegan"
			>
				<span>Semua Sub ON</span>
			</button>

			<button type="button" class="btn btn-secondary btn-sm" onclick={() => batchFileInput?.click()} title="Upload banyak file audio sekaligus">
				<FolderUp size={14} /><span>Batch Audio</span>
			</button>
			<input type="file" bind:this={batchFileInput} accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm" multiple class="hidden-input" onchange={handleBatchFileChange} />
			<button class="btn btn-secondary btn-sm" onclick={onAddScene}><Plus size={14} /><span>Tambah</span></button>
		</div>
	</div>

	{#if autoRhythmAppliedToast}
		<div class="auto-rhythm-toast">
			<span>✨ <strong>Ritme Dinamis Diterapkan!</strong> Subtitle dirotasi kiri, kanan, & jeda hening otomatis di {scenes.length} adegan.</span>
		</div>
	{/if}

	<div class="storyboard-toolbar">
		<div class="toolbar-left">
			<div class="search-box">
				<input type="text" placeholder="Cari narasi / visual / bab…" bind:value={searchQuery} />
			</div>
			<div class="toolbar-filters">
				<button type="button" class="filter-pill" class:active={filterMode === 'all'} onclick={() => filterMode = 'all'}>Semua</button>
				<button type="button" class="filter-pill" class:active={filterMode === 'chapters'} onclick={() => filterMode = 'chapters'}>Bab</button>
				<button type="button" class="filter-pill" class:active={filterMode === 'blackout'} onclick={() => filterMode = 'blackout'}>⬛ Blank Quote</button>
				<button type="button" class="filter-pill" class:active={filterMode === 'need_voice'} onclick={() => filterMode = 'need_voice'}>Butuh suara</button>
				<button type="button" class="filter-pill" class:active={filterMode === 'ready'} onclick={() => filterMode = 'ready'}>Siap</button>
			</div>
		</div>
		<div class="toolbar-right">
			<label class="compact-toggle"><input type="checkbox" bind:checked={compactMode} /> Ringkas</label>
			<select bind:value={pageSize} title="Jumlah scene yang ditampilkan" class="page-size-select">
				<option value="50">50 / halaman</option>
				<option value="100">100 / halaman</option>
				<option value="all">Semua</option>
			</select>
		</div>
	</div>

	<!-- Master Global Chapter Settings Panel -->
	{#if chapterScenesCount > 0}
		<div class="global-chapter-card">
			<div class="global-chapter-header">
				<div class="global-chapter-title-group">
					<div class="global-icon-badge">
						<Bookmark size={16} />
					</div>
					<div>
						<div class="global-title-row">
							<span class="global-title-text">Pengaturan Global Bab</span>
							<span class="global-badge-count">{chapterScenesCount} Bab Terdeteksi</span>
						</div>
						<p class="global-desc-text">
							Atur format label dan jeda musik sekaligus untuk seluruh bab naskah tanpa perlu ubah satu per satu.
						</p>
					</div>
				</div>

				<button
					type="button"
					class="btn-apply-all-chapters"
					onclick={applyAllGlobalChapterSettings}
					disabled={isApplyingGlobal}
					title="Terapkan pengaturan ke seluruh bab dan sesuaikan jeda audio voiceover"
				>
					{#if isApplyingGlobal}
						<RotateCw size={13} class="spin-icon" />
						<span>Menerapkan...</span>
					{:else}
						<Check size={14} />
						<span>Terapkan ke Semua Bab</span>
					{/if}
				</button>
			</div>

			<div class="global-chapter-controls-grid">
				<!-- Control 1: Tag Format -->
				<div class="global-control-col">
					<span class="global-control-label">Format Label Bab:</span>
					<div class="global-pills-row">
						<button
							type="button"
							class="global-pill-btn"
							class:active={globalTagPreset === 'bab'}
							onclick={() => setGlobalTag('bab')}
							title="Format: BAB 01, BAB 02, dst."
						>
							BAB 01
						</button>
						<button
							type="button"
							class="global-pill-btn"
							class:active={globalTagPreset === 'bagian'}
							onclick={() => setGlobalTag('bagian')}
							title="Format: BAGIAN 1, BAGIAN 2, dst."
						>
							BAGIAN 1
						</button>
						<button
							type="button"
							class="global-pill-btn"
							class:active={globalTagPreset === 'part'}
							onclick={() => setGlobalTag('part')}
							title="Format: PART 1, PART 2, dst."
						>
							PART 1
						</button>
						<button
							type="button"
							class="global-pill-btn"
							class:active={globalTagPreset === 'none'}
							onclick={() => setGlobalTag('none')}
							title="Hanya Judul Bab Saja (Tanpa awalan Bab/Part)"
						>
							Hanya Judul
						</button>
					</div>
				</div>

				<!-- Control 2: Title Pause (Music swell) -->
				<div class="global-control-col">
					<span class="global-control-label">⏱️ Jeda Judul (Musik Mengalun):</span>
					<div class="global-pills-row">
						{#each [0, 3, 5, 7, 10] as sec}
							<button
								type="button"
								class="global-pill-btn"
								class:active={globalPauseDuration === sec}
								onclick={() => setGlobalPause(sec)}
								title={sec === 5 ? 'Rekomendasi YouTube Cinematic (5 detik jeda)' : `${sec} detik jeda`}
							>
								{sec}s {sec === 5 ? '⭐' : ''}
							</button>
						{/each}
					</div>
				</div>

				<!-- Control 3: Chapter Outro Pause -->
				<div class="global-control-col">
					<span class="global-control-label">⏳ Jeda Akhir Bab:</span>
					<div class="global-pills-row">
						{#each [0, 2, 3, 5] as sec}
							<button
								type="button"
								class="global-pill-btn"
								class:active={globalOutroPause === sec}
								onclick={() => setGlobalOutro(sec)}
								title={`${sec} detik hening sebelum ganti bab berikutnya`}
							>
								{sec}s {sec === 0 ? '(Lancar)' : ''}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="scenes-list" bind:this={scenesListEl} class:compact={compactMode}>
		{#if scenes.length === 0}
			<div class="empty-state">
				<p>Belum ada adegan. Masukkan naskah di atas dan klik <strong>Generate Video</strong>.</p>
			</div>
		{:else if filteredScenes.length === 0}
			<div class="empty-state">
				<p>Tidak ada scene yang cocok dengan filter/pencarian.</p>
				<button type="button" class="btn btn-secondary btn-sm" onclick={() => { searchQuery=''; filterMode='all'; }}>Reset filter</button>
			</div>
		{:else}
			{#each displayedScenes as { scene, origIndex: index } (scene.id || index)}
				{#if scene.chapter}
					<div class="chapter-divider-banner">
						<div class="chapter-banner-main">
							<div class="chapter-banner-left">
								<span class="chapter-banner-icon">🔖</span>

								<!-- Editable Tag & Preset Pills -->
								<div class="chapter-tag-control">
									<input 
										type="text" 
										class="chapter-tag-input" 
										bind:value={scene.chapter.tag} 
										placeholder="Tanpa Tag"
										oninput={() => handleChapterTextEdit(index)}
										onchange={() => handleChapterTextEdit(index)}
										title="Tag/Label Bab (cth: BAB 01, BAGIAN 1, PART 1, atau kosongkan untuk langsung hanya judul)"
									/>
									<div class="chapter-tag-pills">
										<button 
											type="button" 
											class="tag-pill-btn" 
											class:active={scene.chapter.tag === `BAB ${String(scene.chapter.number || 1).padStart(2, '0')}`}
											onclick={() => setChapterPreset(scene, 'bab', index)}
											title="Set format BAB"
										>BAB</button>
										<button 
											type="button" 
											class="tag-pill-btn" 
											class:active={scene.chapter.tag === `BAGIAN ${scene.chapter.number || 1}`}
											onclick={() => setChapterPreset(scene, 'bagian', index)}
											title="Set format BAGIAN"
										>BAGIAN</button>
										<button 
											type="button" 
											class="tag-pill-btn" 
											class:active={scene.chapter.tag === `PART ${scene.chapter.number || 1}`}
											onclick={() => setChapterPreset(scene, 'part', index)}
											title="Set format PART"
										>PART</button>
										<button 
											type="button" 
											class="tag-pill-btn empty-tag" 
											class:active={!scene.chapter.tag}
											onclick={() => setChapterPreset(scene, 'none', index)}
											title="Hanya Judul Bab Saja (Tanpa awalan Bab/Part)"
										>Hanya Judul</button>
									</div>
								</div>

								<span class="chapter-banner-separator">—</span>

								<input 
									type="text" 
									class="chapter-title-input" 
									bind:value={scene.chapter.title} 
									placeholder="Judul Bab (contoh: AWAL MULA REVOLUSI)"
									oninput={() => handleChapterTextEdit(index)}
									onchange={() => handleChapterTextEdit(index)}
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

						<!-- Chapter Pause / Delay Controls -->
						<div class="chapter-timing-row">
							<div class="chapter-timing-item">
								<span class="timing-label">⏱️ Jeda Judul:</span>
								<div class="pause-pills">
									{#each [0, 3, 5, 7, 10] as sec}
										<button
											type="button"
											class="pause-pill-btn"
											class:active={(scene.chapter.pauseDuration ?? 5) === sec}
											onclick={() => setChapterPauseDuration(scene, sec, index)}
											title={`Beri jeda hening ${sec} detik setelah pembacaan judul bab agar musik/visual lebih dramatis`}
										>
											{sec === 5 ? '5s ⭐' : `${sec}s`}
										</button>
									{/each}
								</div>
								<span class="timing-desc">
									{#if (scene.chapter.pauseDuration ?? 5) === 0}
										Langsung narasi
									{:else}
										Jeda {(scene.chapter.pauseDuration ?? 5)}s (BGM naik)
									{/if}
								</span>
							</div>

							<div class="chapter-timing-item">
								<span class="timing-label">🌙 Jeda Akhir Bab:</span>
								<div class="pause-pills">
									{#each [0, 3, 5, 7, 10] as sec}
										<button
											type="button"
											class="pause-pill-btn"
											class:active={(scene.chapter.outroPause ?? 0) === sec}
											onclick={() => setChapterOutroPause(scene, sec, index)}
											title={`Beri jeda hening ${sec} detik di akhir adegan sebelum bab berikutnya`}
										>
											{sec === 0 ? '0s' : `${sec}s`}
										</button>
									{/each}
								</div>
								{#if (scene.chapter.outroPause ?? 0) > 0}
									<span class="timing-desc">Jeda {(scene.chapter.outroPause ?? 0)}s sebelum bab baru</span>
								{/if}
							</div>
						</div>

						<!-- Pronunciation Preview & Audio Sync Bar -->
						<div class="chapter-banner-footer">
							<div class="spoken-preview-bar">
								<span class="spoken-indicator">🎙️ Pengucapan Suara:</span>
								{#if !scene.chapter.tag && !/^(bab|bagian|part|segmen|episode|chapter|eps)\b/i.test(scene.chapter.title || '')}
									<span class="spoken-phrase highlight-title">
										"{scene.chapter.title || 'Judul Bab'}"
									</span>
									<span class="spoken-mode-tag">Hanya Judul (Tanpa Bab)</span>
								{:else}
									<span class="spoken-phrase">
										"{getSpokenVoiceoverText(scene).split('\n\n')[0].replace(/^\.\.\.\s*|\s*\.\.\.$/g, '')}"
									</span>
								{/if}
							</div>

							<div class="chapter-voice-sync-actions">
								{#if regeneratingSceneIndices.has(index)}
									<span class="sync-loading-badge">
										<span class="spinner-dot"></span>
										Membuat suara...
									</span>
								{:else if scene.lastSpokenText && scene.lastSpokenText.trim() !== getSpokenVoiceoverText(scene).trim()}
									<span class="sync-needed-badge">⚠️ Teks Bab Diubah</span>
									<button 
										type="button" 
										class="btn-chapter-sync pulse"
										onclick={() => onRegenerateVoice?.(index)}
										title="Sinkronkan audio suara adegan ini agar membacakan teks bab yang baru ini"
									>
										🔄 Sinkron Suara
									</button>
								{:else if scene.voiceAudioUrl}
									<span class="synced-ok-badge">✓ Suara Sesuai</span>
									<button 
										type="button" 
										class="btn-chapter-resync"
										onclick={() => onRegenerateVoice?.(index)}
										title="Generate ulang suara adegan ini"
									>
										🔄 Re-sync
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<div 
					class="scene-card" 
					class:active={activeSceneIndex === index}
					class:has-chapter={!!scene.chapter}
					class:is-blackout-scene={scene.isBlackout}
					data-scene-index={index}
					onclick={() => selectScene(index)}
				>
					<!-- Left: Footage Thumbnail -->
					<div class="card-thumbnail-wrap">
						{#if scene.isBlackout}
							<div class="thumb-blackout" title="Layar Hitam (Dramatic Quote)">
								<span class="thumb-blackout-icon">“ ”</span>
								<span class="thumb-blackout-text">BLANK QUOTE</span>
							</div>
						{:else if scene.footage?.thumbnail}
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

							<!-- Audio Vocal Effect Pill Dropdown -->
							<div class="effect-dropdown-wrap" onclick={(e) => e.stopPropagation()}>
								<button
									type="button"
									class="effect-pill-btn"
									class:active-filter={(scene.audioEffect || selectedAudioEffect) !== 'natural'}
									onclick={() => activeEffectDropdownIndex = activeEffectDropdownIndex === index ? -1 : index}
									title="Ubah filter vokal adegan ini (suara berat, studio podcast, reverb dingin, dll)"
								>
									<span class="eff-icon">{getAudioEffectById(scene.audioEffect || selectedAudioEffect).emoji}</span>
									<span class="eff-name">{getAudioEffectById(scene.audioEffect || selectedAudioEffect).name.split(' (')[0]}</span>
									<ChevronDown size={11} class="eff-arrow" />
								</button>

								{#if activeEffectDropdownIndex === index}
									<div class="effect-dropdown-menu">
										<div class="dropdown-head">
											<span class="dropdown-title">🎙️ Filter Suara Adegan {index + 1}</span>
											<button type="button" class="close-btn" onclick={() => activeEffectDropdownIndex = -1}>&times;</button>
										</div>
										<div class="dropdown-list">
											{#each AUDIO_EFFECT_PRESETS as eff}
												<button
													type="button"
													class="effect-option-row"
													class:active-opt={(scene.audioEffect || selectedAudioEffect) === eff.id}
													onclick={() => {
														activeEffectDropdownIndex = -1;
														if (onChangeSceneEffect) onChangeSceneEffect(index, eff.id);
													}}
												>
													<span class="opt-emoji">{eff.emoji}</span>
													<div class="opt-content">
														<div class="opt-title-line">
															<span class="opt-name">{eff.name}</span>
															{#if eff.tag}
																<span class="opt-tag">{eff.tag}</span>
															{/if}
														</div>
														<div class="opt-desc">{eff.description}</div>
													</div>
													{#if eff.sampleUrl}
														<button
															type="button"
															class="opt-preview-btn"
															class:playing={previewPlayingIndex === `eff-${eff.id}`}
															onclick={(e) => {
																e.stopPropagation();
																togglePreviewAudio(`eff-${eff.id}`, eff.sampleUrl);
															}}
															title={previewPlayingIndex === `eff-${eff.id}` ? 'Berhenti' : 'Dengarkan contoh karakter suara ini'}
														>
															{#if previewPlayingIndex === `eff-${eff.id}`}
																<Square size={10} fill="currentColor" />
															{:else}
																<Play size={10} fill="currentColor" />
															{/if}
														</button>
													{/if}
													{#if (scene.audioEffect || selectedAudioEffect) === eff.id}
														<CheckCircle2 size={13} color="var(--accent-cyan)" />
													{/if}
												</button>
											{/each}
										</div>
										<div class="dropdown-foot">
											<button
												type="button"
												class="apply-all-action-btn"
												onclick={() => {
													const chosen = scene.audioEffect || selectedAudioEffect;
													activeEffectDropdownIndex = -1;
													if (onApplyEffectToAll) onApplyEffectToAll(chosen);
												}}
												title="Terapkan filter suara ini ke seluruh adegan di video"
											>
												⚡ Terapkan "{getAudioEffectById(scene.audioEffect || selectedAudioEffect).name.split(' (')[0]}" ke SEMUA Adegan
											</button>
										</div>
									</div>
								{/if}
							</div>

							{#if scene.voiceAudioUrl}
								<span class="voice-ready-badge" title="Audio voiceover siap ({getAudioEffectById(scene.audioEffect || selectedAudioEffect).name})">
									<CheckCircle2 size={12} color="var(--highlight-green)" />
									<span>Voice Ready</span>
								</span>
							{/if}

							<!-- Subtitle Toggle Pill -->
							<button
								type="button"
								class="scene-sub-pill"
								class:sub-off={scene.showSubtitle === false}
								onclick={(e) => { e.stopPropagation(); toggleSceneSubtitle(index); }}
								title={scene.showSubtitle === false ? "Subtitle DIMATIKAN di adegan ini (Klik untuk aktifkan)" : "Subtitle AKTIF di adegan ini (Klik untuk matikan)"}
							>
								<span class="sub-pill-dot" class:off={scene.showSubtitle === false}></span>
								<span>{scene.showSubtitle === false ? 'Sub: OFF' : 'Sub: ON'}</span>
							</button>

							<!-- Scene Subtitle Position Pill (If subtitle is ON) -->
							{#if scene.showSubtitle !== false && !scene.isBlackout}
								<button
									type="button"
									class="scene-pos-pill"
									onclick={(e) => { e.stopPropagation(); cycleSceneSubtitlePos(index); }}
									title="Posisi Subtitle (Klik untuk ganti: Kiri / Kanan)"
								>
									<span>
										{#if scene.subtitlePos === 'wolf-right' || scene.subtitlePos === 'cinema-right'}
											👉 Kanan
										{:else}
											👈 Kiri
										{/if}
									</span>
								</button>
							{/if}

							<!-- Blank Hitam / Quote Mode Pill -->
							<button
								type="button"
								class="scene-blackout-pill"
								class:active={scene.isBlackout}
								onclick={(e) => { e.stopPropagation(); toggleSceneBlackout(index); }}
								title={scene.isBlackout ? "Matikan mode Blank Hitam (Kembalikan footage video)" : "Jadikan Blank Hitam (Layar hitam pekat + teks quote rata tengah tanpa footage)"}
							>
								<span class="blackout-pill-icon">{scene.isBlackout ? '⬛' : '🔲'}</span>
								<span>{scene.isBlackout ? 'Blank Quote' : 'Blank Hitam'}</span>
							</button>
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
							oninput={() => handleChapterTextEdit(index)}
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
										<span class="pill-badge">🎧 Rekaman • {getAudioEffectById(scene.audioEffect || selectedAudioEffect).name.split(' (')[0]}</span>
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
										{#if scene.voiceProvider === 'edge_tts'}
											<span class="ai-voice-indicator edge" title="Audio disiapkan dari Microsoft Edge TTS + Filter {getAudioEffectById(scene.audioEffect || selectedAudioEffect).name}">
												🌐 Edge TTS Ready ({(scene.audioDuration || 5).toFixed(1)}s) • {getAudioEffectById(scene.audioEffect || selectedAudioEffect).emoji} {getAudioEffectById(scene.audioEffect || selectedAudioEffect).name.split(' (')[0]}
											</span>
										{:else}
											<span class="ai-voice-indicator" title="Audio disiapkan dari ElevenLabs AI + Filter {getAudioEffectById(scene.audioEffect || selectedAudioEffect).name}">
												🤖 ElevenLabs Ready ({(scene.audioDuration || 5).toFixed(1)}s) • {getAudioEffectById(scene.audioEffect || selectedAudioEffect).emoji} {getAudioEffectById(scene.audioEffect || selectedAudioEffect).name.split(' (')[0]}
											</span>
										{/if}
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

	{#if filteredScenes.length > 0}
		<div class="storyboard-footer">
			<span class="footer-info">{displayedScenes.length} / {filteredScenes.length} scene · {scenes.length} total</span>
			<div class="footer-actions">
				{#if canLoadMore}
					<button type="button" class="btn btn-secondary btn-sm" onclick={loadMore}>Muat {filteredScenes.length - displayedScenes.length > 50 ? '50 lagi' : 'sisa'} · {filteredScenes.length - displayedScenes.length} lagi</button>
					<button type="button" class="btn btn-secondary btn-sm" onclick={() => pageSize = 'all'}>Tampilkan semua</button>
				{:else if filteredScenes.length > 50 && pageSize !== '50'}
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => pageSize = '50'}>Ringkas ke 50</button>
				{/if}
				<button type="button" class="btn btn-ghost btn-sm" onclick={scrollToTop}>↑ Ke atas</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.storyboard-panel {
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		min-height: 0;
	}
	.storyboard-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--line);
		flex-wrap: wrap;
	}
	.title-group { display: flex; align-items: flex-start; gap: 10px; }
	.icon-wrap {
		width: 32px; height: 32px;
		border-radius: var(--r-md);
		background: var(--bg-card);
		border: 1px solid var(--line);
		display: flex; align-items: center; justify-content: center;
		color: var(--text-2);
		flex-shrink: 0;
	}
	.panel-title { font-size: 0.95rem; font-weight: 700; color: var(--text); }
	.panel-desc { font-size: 0.76rem; color: var(--text-2); margin-top: 2px; line-height: 1.4; }
	.header-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
	.hidden-input { display: none; }
	.storyboard-toolbar {
		display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;
		padding: 10px 12px; background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-md);
	}
	.toolbar-left { display: flex; gap: 10px; align-items: center; flex: 1; min-width: 240px; flex-wrap: wrap; }
	.search-box { flex: 1; min-width: 180px; }
	.search-box input { width: 100%; padding: 7px 10px; font-size: 0.78rem; background: var(--bg-surface); }
	.toolbar-filters { display: flex; gap: 6px; flex-wrap: wrap; }
	.filter-pill { padding: 5px 10px; font-size: 0.7rem; font-weight: 600; border: 1px solid var(--line); border-radius: var(--r-full); background: transparent; color: var(--text-2); }
	.filter-pill:hover { border-color: var(--line-strong); color: var(--text); }
	.filter-pill.active { background: var(--text); border-color: var(--text); color: var(--bg-base); }
	.toolbar-right { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
	.compact-toggle { display: inline-flex; gap: 6px; align-items: center; font-size: 0.72rem; color: var(--text-2); }
	.page-size-select { padding: 6px 8px; font-size: 0.72rem; background: var(--bg-surface); }
	.scenes-list {
		display: flex; flex-direction: column; gap: 10px;
		max-height: none; overflow: visible; padding-right: 2px;
	}
	.scenes-list.compact { gap: 6px; }
	.scenes-list.compact .scene-card { padding: 8px; }
	.empty-state {
		padding: 28px; text-align: center; color: var(--text-2);
		background: var(--bg-card); border: 1px dashed var(--line); border-radius: var(--r-md);
		font-size: 0.82rem;
	}
	.global-chapter-card {
		display: flex; flex-direction: column; gap: 10px;
		padding: 12px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
	.global-chapter-header {
		display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
	}
	.global-chapter-title-group { display: flex; align-items: center; gap: 10px; }
	.global-icon-badge {
		width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
		background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--r-sm);
		color: var(--text-2);
	}
	.global-title-row { display: flex; align-items: center; gap: 8px; }
	.global-title-text { font-size: 0.84rem; font-weight: 700; color: var(--text); }
	.global-badge-count {
		font-size: 0.65rem; font-weight: 600; padding: 2px 7px;
		background: var(--bg-surface); color: var(--text-2);
		border: 1px solid var(--line); border-radius: var(--r-full);
	}
	.global-desc-text { font-size: 0.72rem; color: var(--text-2); margin-top: 2px; }
	.btn-apply-all-chapters {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 7px 12px; font-size: 0.75rem; font-weight: 600;
		background: var(--text); color: var(--bg-base);
		border-radius: var(--r-md); border: 1px solid var(--text);
	}
	.global-chapter-controls-grid {
		display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 10px; padding: 10px; background: var(--bg-surface);
		border: 1px solid var(--line); border-radius: var(--r-sm);
	}
	.global-control-col { display: flex; flex-direction: column; gap: 6px; }
	.global-control-label { font-size: 0.68rem; font-weight: 600; color: var(--text-2); letter-spacing: 0.02em; }
	.global-pills-row { display: flex; gap: 6px; flex-wrap: wrap; }
	.global-pill-btn {
		padding: 4px 9px; font-size: 0.7rem; font-weight: 600;
		background: transparent; border: 1px solid var(--line); color: var(--text-2);
		border-radius: var(--r-full);
	}
	.global-pill-btn:hover { border-color: var(--line-strong); color: var(--text); }
	.global-pill-btn.active { background: var(--text); border-color: var(--text); color: var(--bg-base); }
	.chapter-divider-banner {
		display: flex; flex-direction: column; gap: 8px;
		padding: 10px 12px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
	.chapter-banner-main { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; align-items: center; }
	.chapter-banner-left { display: flex; align-items: center; gap: 8px; flex: 1.2; min-width: 0; }
	.chapter-banner-icon { font-size: 0.85rem; color: var(--text-3); }
	.chapter-tag-control {
		display: inline-flex; align-items: center; gap: 6px;
		background: var(--bg-surface); border: 1px solid var(--line);
		border-radius: var(--r-sm); padding: 3px 6px;
	}
	.chapter-tag-input {
		width: 74px; background: transparent; border: none; padding: 2px 4px;
		font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
		color: var(--text); outline: none;
	}
	.chapter-tag-pills { display: flex; gap: 4px; border-left: 1px solid var(--line); padding-left: 6px; }
	.tag-pill-btn {
		padding: 2px 6px; font-size: 0.62rem; font-weight: 600;
		background: transparent; border: 1px solid var(--line); color: var(--text-2);
		border-radius: 4px;
	}
	.tag-pill-btn:hover { border-color: var(--line-strong); color: var(--text); }
	.tag-pill-btn.active { background: var(--text); color: var(--bg-base); border-color: var(--text); }
	.tag-pill-btn.empty-tag.active { background: var(--text-2); color: var(--bg-base); border-color: var(--text-2); }
	.chapter-banner-separator { color: var(--line-strong); }
	.chapter-title-input {
		flex: 1; min-width: 140px; background: transparent; border: 1px solid transparent;
		padding: 4px 8px; border-radius: 6px; color: var(--text); font-weight: 600; font-size: 0.82rem;
	}
	.chapter-title-input:hover, .chapter-title-input:focus { background: var(--bg-surface); border-color: var(--line); outline: none; }
	.chapter-banner-right { display: flex; align-items: center; gap: 8px; flex: 1; }
	.chapter-sub-input {
		flex: 1; background: transparent; border: 1px solid transparent;
		padding: 4px 8px; border-radius: 6px; color: var(--text-2); font-size: 0.76rem;
	}
	.chapter-sub-input:hover, .chapter-sub-input:focus { background: var(--bg-surface); border-color: var(--line); outline: none; }
	.chapter-remove-btn {
		width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
		border-radius: 50%; color: var(--text-3); font-size: 1rem;
	}
	.chapter-remove-btn:hover { background: rgba(239,68,68,0.12); color: var(--danger); }
	.chapter-timing-row {
		display: flex; flex-wrap: wrap; gap: 12px;
		padding: 8px 10px; background: var(--bg-surface);
		border: 1px solid var(--line); border-radius: var(--r-sm);
	}
	.chapter-timing-item { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.timing-label { font-size: 0.68rem; font-weight: 600; color: var(--text-2); }
	.pause-pills { display: flex; gap: 4px; }
	.pause-pill-btn {
		padding: 3px 7px; font-size: 0.66rem; font-weight: 600;
		background: transparent; border: 1px solid var(--line); color: var(--text-2); border-radius: 4px;
	}
	.pause-pill-btn:hover { border-color: var(--line-strong); color: var(--text); }
	.pause-pill-btn.active { background: var(--text); color: var(--bg-base); border-color: var(--text); }
	.timing-desc { font-size: 0.68rem; color: var(--text-3); }
	.chapter-banner-footer {
		display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
		padding-top: 4px; border-top: 1px solid var(--line);
	}
	.spoken-preview-bar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.72rem; color: var(--text-2); }
	.spoken-indicator { color: var(--text-3); font-weight: 600; }
	.spoken-phrase { color: var(--text); font-style: italic; }
	.spoken-mode-tag { padding: 1px 6px; border-radius: var(--r-full); background: var(--bg-surface); border: 1px solid var(--line); font-size: 0.65rem; color: var(--text-3); }
	.chapter-voice-sync-actions { display: flex; align-items: center; gap: 8px; }
	.sync-loading-badge, .sync-needed-badge, .synced-ok-badge {
		font-size: 0.68rem; padding: 3px 7px; border-radius: var(--r-full); border: 1px solid var(--line);
		background: var(--bg-surface); color: var(--text-2);
	}
	.btn-chapter-sync, .btn-chapter-resync {
		padding: 4px 9px; font-size: 0.7rem; font-weight: 600;
		background: var(--primary); color: #fff; border-radius: var(--r-sm); border: 1px solid var(--primary);
	}
	.btn-chapter-sync:hover, .btn-chapter-resync:hover { background: var(--primary-hover); }
	.scene-card {
		display: flex; gap: 10px; padding: 10px;
		background: var(--bg-card); border: 1px solid var(--line);
		border-radius: var(--r-md); cursor: pointer;
	}
	.scene-card:hover { border-color: var(--line-strong); }
	.scene-card.active { border-color: var(--primary); }
	.card-thumbnail-wrap {
		position: relative; width: 128px; height: 72px; flex-shrink: 0;
		border-radius: var(--r-sm); overflow: hidden; background: #070a14; border: 1px solid var(--line);
	}
	.thumbnail-img { width: 100%; height: 100%; object-fit: cover; }
	.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-3); }
	.swap-btn {
		position: absolute; bottom: 4px; left: 4px;
		padding: 3px 7px; font-size: 0.65rem; font-weight: 600;
		background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.14);
		border-radius: 6px; display: flex; gap: 4px; align-items: center;
	}
	.swap-btn:hover { background: var(--text); color: var(--bg-base); }
	.duration-badge {
		position: absolute; top: 4px; right: 4px;
		padding: 2px 5px; font-size: 0.62rem; font-family: var(--font-mono);
		background: rgba(0,0,0,0.7); color: #fff; border-radius: 4px;
	}
	.card-content { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
	.card-top-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
	.scene-num { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; color: var(--text-3); }
	.query-badge {
		font-size: 0.68rem; padding: 2px 7px; background: var(--bg-surface);
		border: 1px solid var(--line); border-radius: var(--r-full); color: var(--text-2);
		max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
	.effect-dropdown-wrap { position: relative; }
	.effect-pill-btn {
		display: inline-flex; align-items: center; gap: 4px;
		padding: 3px 8px; font-size: 0.68rem; color: var(--text-2);
		background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--r-full);
	}
	.effect-pill-btn:hover { border-color: var(--line-strong); color: var(--text); }
	.effect-pill-btn.active-filter { border-color: var(--primary); color: var(--text); }
	.eff-icon { font-size: 0.75rem; }
	.eff-name { font-size: 0.68rem; }
	.effect-dropdown-menu {
		position: absolute; top: calc(100% + 6px); left: 0; width: 300px;
		background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--r-md);
		z-index: 20; overflow: hidden;
	}
	.dropdown-head { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid var(--line); background: var(--bg-card); }
	.dropdown-title { font-size: 0.75rem; font-weight: 700; color: var(--text); }
	.close-btn { color: var(--text-3); }
	.dropdown-list { display: flex; flex-direction: column; padding: 6px; gap: 4px; max-height: 260px; overflow-y: auto; }
	.effect-option-row {
		display: flex; gap: 8px; padding: 7px 8px; border-radius: 6px;
		border: 1px solid transparent; text-align: left; color: var(--text-2);
	}
	.effect-option-row:hover { background: var(--bg-card); }
	.effect-option-row.active-opt { background: var(--bg-card); border-color: var(--line); color: var(--text); }
	.opt-emoji { font-size: 1rem; }
	.opt-content { flex: 1; min-width: 0; }
	.opt-title-line { display: flex; gap: 6px; align-items: center; }
	.opt-name { font-size: 0.74rem; font-weight: 600; color: var(--text); }
	.opt-tag { font-size: 0.58rem; font-weight: 700; padding: 1px 5px; border-radius: 4px; background: var(--bg-card); border: 1px solid var(--line); color: var(--text-3); text-transform: uppercase; }
	.opt-desc { font-size: 0.66rem; color: var(--text-3); margin-top: 2px; }
	.opt-preview-btn {
		width: 22px; height: 22px; border-radius: 50%;
		border: 1px solid var(--line); background: var(--bg-card); color: var(--text-2);
		display: inline-flex; align-items: center; justify-content: center;
	}
	.dropdown-foot { padding: 8px; border-top: 1px solid var(--line); background: var(--bg-card); }
	.apply-all-action-btn {
		width: 100%; padding: 7px; border-radius: 6px;
		background: var(--bg-surface); border: 1px solid var(--line); color: var(--text-2);
		font-size: 0.7rem; font-weight: 600; text-align: center;
	}
	.apply-all-action-btn:hover { border-color: var(--line-strong); color: var(--text); }
	.voice-ready-badge { display: flex; gap: 4px; align-items: center; font-size: 0.65rem; color: var(--success); font-weight: 600; }
	.scene-sub-pill,
	.scene-blackout-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 2px 8px;
		border-radius: var(--r-full);
		font-size: 0.68rem;
		font-weight: 600;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		color: var(--text-2);
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.scene-sub-pill:hover,
	.scene-blackout-pill:hover {
		border-color: var(--line-strong);
		color: var(--text);
	}
	.scene-sub-pill.sub-off {
		opacity: 0.6;
		background: rgba(255, 255, 255, 0.02);
		border-style: dashed;
		color: var(--text-3);
	}
	.sub-pill-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 6px #10b981;
	}
	.sub-pill-dot.off {
		background: var(--text-muted);
		box-shadow: none;
	}
	.btn-auto-rhythm {
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05));
		border: 1px solid rgba(245, 158, 11, 0.4);
		color: #fbbf24;
		font-weight: 700;
		transition: all 0.2s ease;
	}
	.btn-auto-rhythm:hover {
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(245, 158, 11, 0.15));
		border-color: #fbbf24;
		box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
		color: #ffffff;
	}
	.auto-rhythm-toast {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 8px 16px;
		background: rgba(245, 158, 11, 0.12);
		border: 1px solid rgba(245, 158, 11, 0.35);
		border-radius: var(--r-md);
		color: #fef3c7;
		font-size: 0.8rem;
		margin: 8px 12px;
		animation: fadeInToast 0.3s ease;
	}
	@keyframes fadeInToast {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.scene-pos-pill {
		display: inline-flex;
		align-items: center;
		padding: 2px 7px;
		border-radius: var(--r-full);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.14);
		color: var(--text-2);
		font-size: 0.65rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.scene-pos-pill:hover {
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
		border-color: rgba(255, 255, 255, 0.3);
	}
	.scene-blackout-pill.active {
		background: #000000;
		border-color: rgba(255, 255, 255, 0.4);
		color: #ffffff;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
	}
	.blackout-pill-icon {
		font-size: 0.65rem;
	}
	.thumb-blackout {
		position: absolute;
		inset: 0;
		background: #000000;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--r-sm);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		z-index: 2;
	}
	.thumb-blackout-icon {
		font-family: Georgia, serif;
		font-size: 1.35rem;
		font-weight: 700;
		color: #ffffff;
		line-height: 1;
		opacity: 0.9;
	}
	.thumb-blackout-text {
		font-size: 0.58rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		color: #94a3b8;
	}
	.scene-card.is-blackout-scene {
		background: #06080e !important;
		border-color: rgba(255, 255, 255, 0.16) !important;
	}
	.btn-add-chapter { display: inline-flex; gap: 4px; align-items: center; padding: 3px 7px; font-size: 0.65rem; color: var(--text-2); border: 1px solid var(--line); border-radius: var(--r-full); background: var(--bg-surface); }
	.btn-add-chapter:hover { color: var(--text); border-color: var(--line-strong); }
	.narration-input {
		width: 100%; font-size: 0.82rem; line-height: 1.5; padding: 7px 9px;
		background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--r-sm); color: var(--text);
		resize: none;
	}
	.narration-input:focus { border-color: rgba(99,102,241,0.5); outline: none; }
	.scene-audio-strip { display: flex; flex-wrap: wrap; gap: 6px; }
	.hidden-input { display: none; }
	.custom-audio-pill {
		display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;
		padding: 6px 8px; background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--r-sm);
	}
	.pill-left { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
	.pill-badge { font-size: 0.62rem; font-weight: 700; color: var(--text-2); }
	.pill-name { font-size: 0.72rem; color: var(--text-2); max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.pill-duration { font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-3); }
	.pill-right { display: flex; gap: 6px; align-items: center; }
	.btn-mini-play { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--line); background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: var(--text-2); }
	.offset-group { display: flex; align-items: center; gap: 4px; background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-full); padding: 2px; }
	.btn-offset { padding: 2px 6px; font-size: 0.65rem; color: var(--text-2); border-radius: var(--r-full); }
	.btn-offset:hover { background: var(--bg-surface); color: var(--text); }
	.offset-val { font-size: 0.68rem; color: var(--text-2); min-width: 32px; text-align: center; }
	.btn-audio-tag { display: inline-flex; gap: 4px; align-items: center; padding: 4px 8px; font-size: 0.68rem; color: var(--text-2); border: 1px solid var(--line); border-radius: var(--r-full); background: var(--bg-surface); }
	.audio-prompt-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
	.btn-audio-prompt { display: inline-flex; gap: 5px; align-items: center; padding: 5px 9px; font-size: 0.72rem; color: var(--text-2); border: 1px solid var(--line); border-radius: var(--r-full); background: var(--bg-surface); }
	.btn-audio-prompt:hover { border-color: var(--line-strong); color: var(--text); }
	.ai-voice-indicator { font-size: 0.68rem; color: var(--text-3); }
	.recording-active-bar {
		display: flex; align-items: center; gap: 8px; width: 100%;
		padding: 6px 8px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18); border-radius: var(--r-sm);
	}
	.pulse-rec-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--danger); }
	.rec-text { font-size: 0.7rem; color: var(--danger); font-weight: 600; flex: 1; }
	.btn-rec-action { padding: 4px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 600; }
	.btn-rec-action.save { background: var(--danger); color: #fff; }
	.btn-rec-action.cancel { background: var(--bg-card); border: 1px solid var(--line); color: var(--text-2); }
	.card-actions { display: flex; flex-direction: column; gap: 4px; padding-left: 6px; border-left: 1px solid var(--line); justify-content: center; }
	.action-btn { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--text-3); }
	.action-btn:hover:not(:disabled) { background: var(--bg-surface); color: var(--text); }
	.action-btn.danger:hover:not(:disabled) { background: rgba(239,68,68,0.12); color: var(--danger); }
	.storyboard-footer {
		display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap;
		padding: 10px 12px; background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-md);
	}
	.footer-info { font-size: 0.72rem; color: var(--text-2); }
	.footer-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
	@media (max-width: 640px) { .scene-card { flex-direction: column; } .card-thumbnail-wrap { width: 100%; height: 110px; } }
</style>
