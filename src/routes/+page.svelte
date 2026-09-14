<script>
	import { onMount, onDestroy } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import ScriptEditor from '$lib/components/ScriptEditor.svelte';
	import SceneTimeline from '$lib/components/SceneTimeline.svelte';
	import StudioPlayer from '$lib/components/StudioPlayer.svelte';
	import FootagePickerModal from '$lib/components/FootagePickerModal.svelte';
	import SubtitleStyleModal from '$lib/components/SubtitleStyleModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import ExportModal from '$lib/components/ExportModal.svelte';
	import ScriptGeneratorModal from '$lib/components/ScriptGeneratorModal.svelte';
	import GenerationProgressConsole from '$lib/components/GenerationProgressConsole.svelte';

	import { analyzeScript, SCRIPT_PRESETS, getSpokenVoiceoverText, getChapterSpokenIntro } from '$lib/services/scriptAnalyzer.js';
	import { findMatchingStockVideo } from '$lib/services/stockLibrary.js';
	import { analyzeAudioFile } from '$lib/services/audioAnalysisService.js';
	import { calculateAudioSyncedWordTimings, generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
	import { 
		EDGE_TTS_VOICES, 
		POPULAR_VOICES, 
		DEFAULT_EDGE_VOICE_ID, 
		DEFAULT_ELEVEN_VOICE_ID, 
		isEdgeVoice 
	} from '$lib/services/voiceService.js';
	import {
		AUDIO_EFFECT_PRESETS,
		DEFAULT_AUDIO_EFFECT_ID,
		getAudioEffectById
	} from '$lib/services/audioEffectService.js';

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

	// API Keys, Voices & Audio Effects
	let deepseekApiKey = $state('sk-0802f45e1d4e41c8ae8d46396c97b746');
	let pexelsApiKey = $state('');
	let elevenLabsApiKey = $state('');
	let selectedVoiceId = $state(DEFAULT_EDGE_VOICE_ID); // Default to id-ID-GadisNeural
	let voiceMode = $state('edge_tts'); // 'edge_tts' | 'custom_upload' | 'elevenlabs'
	let selectedAudioEffect = $state(DEFAULT_AUDIO_EFFECT_ID); // Default: Epic Movie Trailer

	// Audio Effect Audition Preview
	let previewAudioEl = null;
	let playingEffectPreviewId = $state(null);

	function toggleEffectPreview(eff, e) {
		if (e) e.stopPropagation();
		if (!eff.sampleUrl) return;
		if (playingEffectPreviewId === eff.id) {
			if (previewAudioEl) {
				previewAudioEl.pause();
				previewAudioEl.currentTime = 0;
			}
			playingEffectPreviewId = null;
			return;
		}
		if (previewAudioEl) {
			previewAudioEl.pause();
		}
		previewAudioEl = new Audio(eff.sampleUrl);
		previewAudioEl.onended = () => { playingEffectPreviewId = null; };
		previewAudioEl.play().catch(() => {});
		playingEffectPreviewId = eff.id;
	}

	onDestroy(() => {
		if (previewAudioEl) {
			previewAudioEl.pause();
			previewAudioEl = null;
		}
	});

	// Modals State
	let showSettingsModal = $state(false);
	let showSubtitleModal = $state(false);
	let showExportModal = $state(false);
	let showFootageModal = $state(false);
	let showScriptGeneratorModal = $state(false);
	let footageSceneIndex = $state(0);
	let elevenLabsError = $state(''); // Show ElevenLabs errors to user

	// Live Pipeline Generation Progress State
	let genProgress = $state({
		active: false,
		percent: 0,
		currentStep: '',
		currentScene: 0,
		totalScenes: 0,
		activeQuery: '',
		activeNarration: '',
		stats: { localFootage: 0, pexelsFootage: 0, ttsClips: 0 },
		logs: []
	});

	function addGenLog(tag, message, type = 'info') {
		const now = new Date();
		const time = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
		genProgress.logs = [
			...genProgress.logs,
			{ id: `${Date.now()}-${Math.random()}`, time, tag, message, type }
		];
		genProgress.currentStep = message;
	}


	onMount(() => {
		// Load stored keys and preferences if present
		if (typeof window !== 'undefined') {
			const savedDeepseek = localStorage.getItem('yt_deepseek_key');
			if (savedDeepseek) deepseekApiKey = savedDeepseek;

			pexelsApiKey = localStorage.getItem('yt_pexels_key') || '';
			elevenLabsApiKey = localStorage.getItem('yt_eleven_key') || '';
			selectedVoiceId = localStorage.getItem('yt_voice_id') || DEFAULT_EDGE_VOICE_ID;
			const savedMode = localStorage.getItem('yt_voice_mode');
			if (savedMode) voiceMode = savedMode;

			const savedEffect = localStorage.getItem('yt_audio_effect');
			if (savedEffect) selectedAudioEffect = savedEffect;

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
			localStorage.setItem('yt_audio_effect', selectedAudioEffect);
		}
	});

	async function generateWorkflow() {
		if (!script.trim() || isGenerating) return;
		isGenerating = true;

		// Initialize Live Pipeline Monitor
		genProgress.active = true;
		genProgress.percent = 5;
		genProgress.currentStep = 'Menganalisis naskah dengan DeepSeek AI...';
		genProgress.currentScene = 0;
		genProgress.totalScenes = 0;
		genProgress.activeQuery = '';
		genProgress.activeNarration = '';
		genProgress.stats = { localFootage: 0, pexelsFootage: 0, ttsClips: 0 };
		genProgress.logs = [];

		const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
		addGenLog('SYSTEM', `Memulai pipeline video otomatis untuk naskah (${wordCount} kata)...`, 'info');
		addGenLog('DEEPSEEK', `Mengirim teks ke DeepSeek AI untuk segmentasi adegan dan pembuatan visual query...`, 'info');

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
					addGenLog('DEEPSEEK', `✓ DeepSeek AI sukses membagi naskah menjadi ${parsedScenes.length} adegan sinematik.`, 'success');
				}
			} catch (err) {
				console.warn('DeepSeek analyze failed, using local fallback:', err);
				addGenLog('WARN', `DeepSeek AI offline / timeout, beralih ke parser naskah lokal.`, 'warn');
			}

			if (parsedScenes.length === 0) {
				parsedScenes = analyzeScript(script);
				addGenLog('FALLBACK', `Naskah dibagi menjadi ${parsedScenes.length} adegan menggunakan pemecah naskah lokal.`, 'info');
			}

			genProgress.totalScenes = parsedScenes.length;
			genProgress.percent = 15;
			
			// Process each scene to attach footage and audio
			const populatedScenes = [];
			scenes = []; // reset for live streaming

			for (let i = 0; i < parsedScenes.length; i++) {
				const sc = parsedScenes[i];
				const sceneNum = i + 1;
				const total = parsedScenes.length;

				sc.audioEffect = selectedAudioEffect;

				genProgress.currentScene = sceneNum;
				genProgress.activeQuery = sc.visualQuery;
				const spokenText = getSpokenVoiceoverText(sc);
				genProgress.activeNarration = spokenText;
				genProgress.currentStep = `Adegan ${sceneNum}/${total}: Mencari footage & voiceover...`;
				genProgress.percent = Math.round(15 + (i / total) * 80);

				addGenLog('SCENE', `─── [Adegan ${sceneNum}/${total}] Visual: "${sc.visualQuery}" ───`, 'highlight');

				// 1. Fetch Footage (Pexels or internal curated)
				addGenLog('FOOTAGE', `[Adegan ${sceneNum}] Mencari video dengan kata kunci: "${sc.visualQuery}"...`, 'info');
				let chosenFootage = null;
				try {
					const pexelsRes = await fetch('/api/pexels', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ query: sc.visualQuery, apiKey: pexelsApiKey })
					});
					const pexelsData = await pexelsRes.json();
					if (pexelsData.videos && pexelsData.videos.length > 0) {
						chosenFootage = pexelsData.videos[i % pexelsData.videos.length];
					}
				} catch (e) {
					console.warn('Pexels API error, using fallback:', e);
				}

				if (!chosenFootage) {
					chosenFootage = findMatchingStockVideo(sc.visualQuery);
				}

				if (chosenFootage.source === 'local') {
					genProgress.stats.localFootage++;
					addGenLog('LOCAL-SSD', `✓ [Adegan ${sceneNum}] Ditemukan di Koleksi Lokal: "${chosenFootage.title}" (Tanpa download, offline ready)`, 'success');
				} else if (chosenFootage.source === 'pexels' || chosenFootage.videoUrl?.includes('pexels')) {
					genProgress.stats.pexelsFootage++;
					addGenLog('PEXELS', `✓ [Adegan ${sceneNum}] Diambil dari Pexels API: "${chosenFootage.title || sc.visualQuery}"`, 'info');
				} else {
					addGenLog('FOOTAGE', `✓ [Adegan ${sceneNum}] Video dipilih: "${chosenFootage.title || sc.visualQuery}"`, 'info');
				}

				// 2. Fetch Voiceover / Audio Timestamps (Edge TTS, ElevenLabs, or fallback)
				let voiceData = null;
				elevenLabsError = '';

				if (voiceMode === 'edge_tts') {
					const effectObj = getAudioEffectById(sc.audioEffect || selectedAudioEffect);
					addGenLog('EDGE-TTS', `[Adegan ${sceneNum}] Men-generate Edge TTS (${selectedVoiceId}) + Filter "${effectObj.name}"...`, 'info');
					try {
						const ttsRes = await fetch('/api/edge-tts', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								text: sc.narration || spokenText,
								voiceId: selectedVoiceId || DEFAULT_EDGE_VOICE_ID,
								audioEffect: sc.audioEffect || selectedAudioEffect,
								chapterIntro: sc.chapter ? getChapterSpokenIntro(sc) : '',
								chapterPause: sc.chapter ? Number(sc.chapter.pauseDuration ?? 5) : 0,
								outroPause: sc.chapter ? Number(sc.chapter.outroPause ?? 0) : 0
							})
						});
						voiceData = await ttsRes.json();
						if (voiceData && !voiceData.success && voiceData.error) {
							console.warn('Edge TTS error:', voiceData.error);
							addGenLog('WARN', `[Adegan ${sceneNum}] Edge TTS error: ${voiceData.error}`, 'warn');
							voiceData = null;
						} else if (voiceData && voiceData.success) {
							genProgress.stats.ttsClips++;
							addGenLog('EDGE-TTS', `✓ [Adegan ${sceneNum}] Audio siap (${voiceData.duration}s, ${voiceData.wordTimings?.length || 0} kata sinkron)`, 'success');
						}
					} catch (e) {
						console.warn('Edge TTS API error, using fallback:', e);
						addGenLog('WARN', `[Adegan ${sceneNum}] Gagal terhubung ke Edge TTS.`, 'warn');
					}
				} else if (voiceMode === 'elevenlabs') {
					addGenLog('ELEVENLABS', `[Adegan ${sceneNum}] Menghubungi ElevenLabs AI (${selectedVoiceId})...`, 'info');
					try {
						const ttsRes = await fetch('/api/elevenlabs', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								text: spokenText,
								voiceId: selectedVoiceId,
								apiKey: elevenLabsApiKey
							})
						});
						voiceData = await ttsRes.json();
						if (voiceData && !voiceData.success && voiceData.error) {
							elevenLabsError = voiceData.error;
							addGenLog('WARN', `[Adegan ${sceneNum}] ElevenLabs error: ${voiceData.error}`, 'warn');
							voiceData = null;
						} else if (voiceData && voiceData.success) {
							genProgress.stats.ttsClips++;
							addGenLog('ELEVENLABS', `✓ [Adegan ${sceneNum}] Voiceover siap (${voiceData.duration}s)`, 'success');
						}
					} catch (e) {
						console.warn('ElevenLabs API error, using fallback:', e);
					}
				} else {
					addGenLog('AUDIO', `[Adegan ${sceneNum}] Mode Rekaman/Upload: slot audio siap diisi`, 'info');
				}

				sc.footage = chosenFootage;
				if (voiceData && voiceData.success) {
					sc.voiceAudioUrl = voiceData.audioUrl;
					sc.wordTimings = voiceData.wordTimings || [];
					sc.audioDuration = voiceData.duration || sc.estimatedDuration;
					sc.isCustomAudio = false;
					sc.voiceProvider = voiceData.provider || (voiceMode === 'edge_tts' ? 'edge_tts' : 'elevenlabs');
					sc.lastSpokenText = spokenText;

					// If real audio, save to server disk with FFmpeg audio filter applied
					if (voiceData.isRealVoice && voiceData.audioUrl) {
						addGenLog('FFMPEG', `[Adegan ${sceneNum}] Normalisasi & Filter Vokal FFmpeg (${getAudioEffectById(sc.audioEffect || selectedAudioEffect).name})...`, 'info');
						try {
							const saveRes = await fetch('/api/audio-save', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									audioBase64: voiceData.audioUrl,
									sceneId: sc.id || `scene-${i}`,
									audioEffect: sc.audioEffect || selectedAudioEffect
								})
							});
							const saveData = await saveRes.json();
							if (saveData.success) {
								sc.serverAudioPath = saveData.serverAudioPath;
								if (saveData.audioUrl) {
									sc.voiceAudioUrl = saveData.audioUrl;
								}
								addGenLog('CACHE', `✓ [Adegan ${sceneNum}] Audio tersimpan: ${saveData.audioFileKey} (${saveData.audioEffectName || 'Filter Aktif'})`, 'success');
							}
						} catch (e) {
							console.warn('Could not save audio to server, will use base64 fallback:', e);
						}
					}
				} else {
					// Custom upload mode baseline or fallback
					sc.voiceAudioUrl = null;
					sc.isCustomAudio = (voiceMode === 'custom_upload');
					const words = (sc.narration || sc.words?.join(' ') || '').trim().split(/\s+/).filter(Boolean);
					sc.wordTimings = generateSyntheticWordTimings(words, sc.estimatedDuration, !!sc.chapter);
				}

				populatedScenes.push(sc);
				// Real-time timeline update so scenes stream into the UI!
				scenes = [...populatedScenes];
			}

			genProgress.percent = 100;
			genProgress.currentStep = 'Semua adegan selesai diproses!';
			addGenLog('FINISH', `🎉 Sukses! Semua ${parsedScenes.length} adegan siap diputar. Total Audio: ${genProgress.stats.ttsClips}, Footage Lokal SSD: ${genProgress.stats.localFootage}, Pexels: ${genProgress.stats.pexelsFootage}.`, 'success');
			activeSceneIndex = 0;
		} catch (error) {
			console.error('Workflow error:', error);
			addGenLog('ERROR', `Terjadi error: ${error.message}`, 'warn');
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

	async function handleRegenerateVoice(sceneIndex, overrideEffect) {
		const targetScene = scenes[sceneIndex];
		if (!targetScene) return;

		if (overrideEffect) {
			targetScene.audioEffect = overrideEffect;
		}
		const effectToUse = targetScene.audioEffect || selectedAudioEffect;

		try {
			const isEdge = (voiceMode === 'edge_tts' || targetScene.voiceProvider === 'edge_tts' || isEdgeVoice(selectedVoiceId));
			const endpoint = isEdge ? '/api/edge-tts' : '/api/elevenlabs';
			const payload = isEdge
				? {
					text: targetScene.narration || getSpokenVoiceoverText(targetScene),
					voiceId: selectedVoiceId || DEFAULT_EDGE_VOICE_ID,
					audioEffect: effectToUse,
					chapterIntro: targetScene.chapter ? getChapterSpokenIntro(targetScene) : '',
					chapterPause: targetScene.chapter ? Number(targetScene.chapter.pauseDuration ?? 5) : 0,
					outroPause: targetScene.chapter ? Number(targetScene.chapter.outroPause ?? 0) : 0
				}
				: {
					text: getSpokenVoiceoverText(targetScene),
					voiceId: selectedVoiceId,
					apiKey: elevenLabsApiKey
				};

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const data = await res.json();
			if (data.success) {
				targetScene.voiceAudioUrl = data.audioUrl;
				targetScene.wordTimings = data.wordTimings || [];
				targetScene.audioDuration = data.duration || targetScene.estimatedDuration;
				targetScene.voiceProvider = data.provider || (isEdge ? 'edge_tts' : 'elevenlabs');
				targetScene.isCustomAudio = false;
				targetScene.lastSpokenText = getSpokenVoiceoverText(targetScene);

				if (data.isRealVoice && data.audioUrl) {
					try {
						const saveRes = await fetch('/api/audio-save', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								audioBase64: data.audioUrl,
								sceneId: targetScene.id || `scene-${sceneIndex}`,
								audioEffect: effectToUse
							})
						});
						const saveData = await saveRes.json();
						if (saveData.success) {
							targetScene.serverAudioPath = saveData.serverAudioPath;
							if (saveData.audioUrl) {
								targetScene.voiceAudioUrl = saveData.audioUrl;
							}
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

	async function handleChangeSceneEffect(sceneIndex, effectId) {
		const targetScene = scenes[sceneIndex];
		if (!targetScene) return;
		targetScene.audioEffect = effectId;

		if (targetScene.voiceAudioUrl) {
			if (targetScene.isCustomAudio) {
				try {
					const saveRes = await fetch('/api/audio-save', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							audioBase64: targetScene.voiceAudioUrl,
							sceneId: targetScene.id || `scene-${sceneIndex}`,
							audioEffect: effectId
						})
					});
					const saveData = await saveRes.json();
					if (saveData.success) {
						targetScene.serverAudioPath = saveData.serverAudioPath;
						if (saveData.audioUrl) {
							targetScene.voiceAudioUrl = saveData.audioUrl;
						}
					}
				} catch (e) {
					console.warn('Gagal memproses ulang filter custom audio:', e);
				}
			} else {
				await handleRegenerateVoice(sceneIndex, effectId);
			}
		}
		scenes = [...scenes];
	}

	async function handleApplyEffectToAll(effectId) {
		selectedAudioEffect = effectId;
		if (typeof window !== 'undefined') {
			localStorage.setItem('yt_audio_effect', effectId);
		}
		for (let i = 0; i < scenes.length; i++) {
			scenes[i].audioEffect = effectId;
		}
		scenes = [...scenes];

		for (let i = 0; i < scenes.length; i++) {
			if (scenes[i].voiceAudioUrl) {
				await handleChangeSceneEffect(i, effectId);
			}
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
			audioEffect: selectedAudioEffect,
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

			// Save to server cache for FFmpeg rendering with audio filter applied
			try {
				const saveRes = await fetch('/api/audio-save', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						audioBase64: analysis.dataUrl,
						sceneId: targetScene.id || `scene-${sceneIndex}`,
						audioEffect: targetScene.audioEffect || selectedAudioEffect
					})
				});
				const saveData = await saveRes.json();
				if (saveData.success) {
					targetScene.serverAudioPath = saveData.serverAudioPath;
					if (saveData.audioUrl) {
						targetScene.voiceAudioUrl = saveData.audioUrl;
					}
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

	async function handleOpenExport() {
		// Auto-resync any scenes where chapter text or narration was edited or audio is out of sync
		let syncCount = 0;
		for (let i = 0; i < scenes.length; i++) {
			const sc = scenes[i];
			const currentSpoken = getSpokenVoiceoverText(sc).trim();
			const isOutOfSync = (!sc.lastSpokenText || sc.lastSpokenText.trim() !== currentSpoken);
			if (isOutOfSync && sc.voiceAudioUrl && !sc.isCustomAudio) {
				syncCount++;
				await handleRegenerateVoice(i);
			}
		}
		if (syncCount > 0) {
			console.log(`Auto-synchronized voice for ${syncCount} modified scene(s) before export`);
		}
		showExportModal = true;
	}
</script>

<div class="studio-app">
	<Navbar
		onOpenSettings={() => showSettingsModal = true}
		onOpenSubtitleStyle={() => showSubtitleModal = true}
		onOpenExport={handleOpenExport}
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

			<!-- Live Background Pipeline Monitor -->
			<GenerationProgressConsole
				isGenerating={isGenerating}
				progress={genProgress.percent}
				currentStep={genProgress.currentStep}
				currentScene={genProgress.currentScene}
				totalScenes={genProgress.totalScenes}
				activeQuery={genProgress.activeQuery}
				activeNarration={genProgress.activeNarration}
				stats={genProgress.stats}
				logs={genProgress.logs}
				onDismiss={() => { genProgress.logs = []; genProgress.active = false; }}
			/>

			<!-- Mode Voiceover Selector -->
			<div class="voice-mode-banner glass-panel">
				<div class="mode-info">
					<span class="mode-icon">
						{#if voiceMode === 'edge_tts'}
							🌐
						{:else if voiceMode === 'custom_upload'}
							🎙️
						{:else}
							🤖
						{/if}
					</span>
					<div>
						<div class="mode-title">Mode Voiceover & Narasi:</div>
						<div class="mode-desc">
							{#if voiceMode === 'edge_tts'}
								Microsoft Edge TTS (100% Gratis, Tanpa Kuota, Suara Neural Indonesia & Global, Subtitle Sinkron Presisi).
							{:else if voiceMode === 'custom_upload'}
								Upload file audio rekaman sendiri atau rekam langsung via mic per adegan (Tanpa kuota, 100% suara asli Anda).
							{:else}
								Generate suara otomatis menggunakan ElevenLabs AI (Membutuhkan API key & kuota karakter ElevenLabs).
							{/if}
						</div>
					</div>
				</div>

				<div class="mode-options">
					<button 
						type="button" 
						class="mode-pill-btn" 
						class:active={voiceMode === 'edge_tts'} 
						onclick={() => { voiceMode = 'edge_tts'; if (!isEdgeVoice(selectedVoiceId)) selectedVoiceId = DEFAULT_EDGE_VOICE_ID; }}
					>
						<span>🌐 Edge TTS</span>
						<span class="badge-free">Gratis 100%</span>
					</button>

					<button 
						type="button" 
						class="mode-pill-btn" 
						class:active={voiceMode === 'custom_upload'} 
						onclick={() => voiceMode = 'custom_upload'}
					>
						<span>🎧 Rekaman Sendiri</span>
						<span class="badge-free">Mic / Upload</span>
					</button>

					<button 
						type="button" 
						class="mode-pill-btn" 
						class:active={voiceMode === 'elevenlabs'} 
						onclick={() => { voiceMode = 'elevenlabs'; if (isEdgeVoice(selectedVoiceId)) selectedVoiceId = DEFAULT_ELEVEN_VOICE_ID; }}
					>
						<span>🤖 ElevenLabs AI</span>
						<span class="badge-ai">Premium</span>
					</button>
				</div>

				{#if voiceMode === 'edge_tts'}
					<div class="quick-voice-bar">
						<span class="quick-voice-label">Pilihan Suara Edge TTS:</span>
						<div class="quick-voice-chips">
							{#each EDGE_TTS_VOICES.slice(0, 6) as v}
								<button
									type="button"
									class="quick-voice-chip"
									class:active={selectedVoiceId === v.id}
									onclick={() => selectedVoiceId = v.id}
									title="{v.name} – {v.description}"
								>
									<span>{v.emoji} {v.name.split(' (')[0]}</span>
									<span class="chip-gender">{v.gender === 'Female' ? '♀' : '♂'}</span>
								</button>
							{/each}
							<button
								type="button"
								class="quick-voice-chip more-btn"
								onclick={() => showSettingsModal = true}
								title="Buka pengaturan suara lengkap"
							>
								<span>Semua ({EDGE_TTS_VOICES.length}) ⚙️</span>
							</button>
						</div>
					</div>
				{/if}

				<!-- Quick Vocal Effect Filter Bar (Full Video / Default) -->
				<div class="quick-effect-bar">
					<div class="quick-effect-header">
						<span class="quick-effect-label">🎛️ Filter Suara / Karakter Vokal (Default Video):</span>
						<span class="quick-effect-hint">Pilih preset untuk 1 video full atau atur per adegan di bawah</span>
					</div>
					<div class="quick-effect-chips">
						{#each AUDIO_EFFECT_PRESETS as eff}
							<div
								class="quick-effect-chip"
								class:active={selectedAudioEffect === eff.id}
								onclick={() => handleApplyEffectToAll(eff.id)}
								title="{eff.name}: {eff.description}"
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && handleApplyEffectToAll(eff.id)}
							>
								<span class="chip-eff-emoji">{eff.emoji}</span>
								<span class="chip-eff-name">{eff.name.split(' (')[0]}</span>
								{#if eff.sampleUrl}
									<button
										type="button"
										class="chip-preview-play-btn"
										class:playing={playingEffectPreviewId === eff.id}
										onclick={(e) => toggleEffectPreview(eff, e)}
										title={playingEffectPreviewId === eff.id ? 'Stop preview' : 'Dengarkan contoh karakter suara ini'}
									>
										{playingEffectPreviewId === eff.id ? '⏹' : '▶'}
									</button>
								{/if}
								{#if eff.tag}
									<span class="chip-eff-tag">{eff.tag}</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<SceneTimeline
				bind:scenes={scenes}
				bind:activeSceneIndex={activeSceneIndex}
				selectedAudioEffect={selectedAudioEffect}
				onOpenFootagePicker={openFootagePicker}
				onRegenerateVoice={handleRegenerateVoice}
				onChangeSceneEffect={handleChangeSceneEffect}
				onApplyEffectToAll={handleApplyEffectToAll}
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
						<li><strong>Filter Vokal:</strong> Aktifkan <em>Studio Podcast</em> atau <em>Suara Berat</em> agar vokal narasi terdengar empuk & berbobot seperti rekaman studio profesional!</li>
						<li><strong>Gaya Subtitle:</strong> Sesuaikan ukuran font & aktif/nonaktifkan animasi karaoke melalui tombol "Gaya Subtitle".</li>
						<li><strong>Footage Relevan:</strong> Ganti clip adegan dengan mengklik tombol "Ganti" pada tiap scene card.</li>
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
		bind:voiceMode={voiceMode}
		bind:selectedAudioEffect={selectedAudioEffect}
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

	/* Quick Voice Selector Chips */
	.quick-voice-bar {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding-top: 10px;
		margin-top: 6px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		flex-wrap: wrap;
	}

	.quick-voice-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.quick-voice-chips {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.quick-voice-chip {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 4px 10px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border-subtle);
		border-radius: 9999px;
		font-size: 0.74rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.18s ease;
	}

	.quick-voice-chip:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
		color: var(--text-primary);
	}

	.quick-voice-chip.active {
		background: rgba(16, 185, 129, 0.15);
		border-color: #10b981;
		color: #34d399;
		font-weight: 600;
		box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
	}

	.quick-voice-chip.more-btn {
		background: rgba(99, 102, 241, 0.1);
		border-color: rgba(99, 102, 241, 0.25);
		color: #a5b4fc;
	}

	.quick-voice-chip.more-btn:hover {
		background: rgba(99, 102, 241, 0.2);
		color: #ffffff;
	}

	.chip-gender {
		font-size: 0.75rem;
		opacity: 0.7;
	}

	/* Quick Vocal Effect Bar */
	.quick-effect-bar {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 10px;
		margin-top: 6px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.quick-effect-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
	}

	.quick-effect-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #e2e8f0;
		letter-spacing: 0.02em;
	}

	.quick-effect-hint {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.quick-effect-chips {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.quick-effect-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 11px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 9999px;
		font-size: 0.74rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.quick-effect-chip:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
		color: var(--text-primary);
		transform: translateY(-1px);
	}

	.quick-effect-chip.active {
		background: linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(59, 130, 246, 0.18) 100%);
		border-color: var(--accent-cyan);
		color: #ffffff;
		font-weight: 600;
		box-shadow: 0 0 14px rgba(6, 182, 212, 0.3);
	}

	.chip-eff-emoji {
		font-size: 0.85rem;
	}

	.chip-eff-name {
		font-size: 0.74rem;
	}

	.chip-preview-play-btn {
		width: 17px;
		height: 17px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.55rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		transition: all 0.15s ease;
	}

	.chip-preview-play-btn:hover {
		background: var(--accent-cyan);
		color: #000;
		transform: scale(1.18);
	}

	.chip-preview-play-btn.playing {
		background: #f43f5e;
		color: #fff;
		box-shadow: 0 0 8px #f43f5e;
	}

	.chip-eff-tag {
		font-size: 0.6rem;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 4px;
		background: rgba(6, 182, 212, 0.25);
		color: var(--accent-cyan);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.quick-effect-chip.active .chip-eff-tag {
		background: var(--accent-cyan);
		color: #041018;
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
