<script>
	import { onMount, onDestroy } from 'svelte';
	import { Wand2, RefreshCw } from 'lucide-svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import ScriptEditor from '$lib/components/ScriptEditor.svelte';
	import SceneTimeline from '$lib/components/SceneTimeline.svelte';
	import StudioPlayer from '$lib/components/StudioPlayer.svelte';
	import FootagePickerModal from '$lib/components/FootagePickerModal.svelte';
	import SubtitleStyleModal from '$lib/components/SubtitleStyleModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import ExportModal from '$lib/components/ExportModal.svelte';
	import ScriptGeneratorModal from '$lib/components/ScriptGeneratorModal.svelte';
	import TopicGeneratorModal from '$lib/components/TopicGeneratorModal.svelte';
	import TitleGeneratorModal from '$lib/components/TitleGeneratorModal.svelte';
	import GenerationProgressConsole from '$lib/components/GenerationProgressConsole.svelte';

	import { analyzeScript, SCRIPT_PRESETS, getSpokenVoiceoverText, getChapterSpokenIntro } from '$lib/services/scriptAnalyzer.js';
	import { findMatchingStockVideo } from '$lib/services/stockLibrary.js';
	import { analyzeAudioFile } from '$lib/services/audioAnalysisService.js';
	import { calculateAudioSyncedWordTimings, generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
	import { 
		EDGE_TTS_VOICES, 
		POPULAR_VOICES, 
		F5_LOCAL_VOICES,
		DEFAULT_F5_VOICE_ID,
		DEFAULT_EDGE_VOICE_ID, 
		DEFAULT_ELEVEN_VOICE_ID, 
		isF5Voice,
		isEdgeVoice 
	} from '$lib/services/voiceService.js';
	import {
		AUDIO_EFFECT_PRESETS,
		DEFAULT_AUDIO_EFFECT_ID,
		getAudioEffectById
	} from '$lib/services/audioEffectService.js';
	import { BGM_TRACKS, audioController } from '$lib/services/audioEngine.js';

	// Main App State
	let script = $state(SCRIPT_PRESETS[0].text);
	let scenes = $state([]);
	let activeSceneIndex = $state(0);
	let isGenerating = $state(false);
	let videoTitle = $state('');

	// Customization State
	let subtitleStyleKey = $state('hormozi');
	let subtitlePosition = $state('bottom-center');
	let quoteDecoration = $state('none');
	let karaokeEnabled = $state(true);
	let subtitleFontSize = $state(34);
	let selectedBgmId = $state('local-documentary');
	let bgmVolume = $state(0.10);

	// API Keys, Voices & Audio Effects
	let deepseekApiKey = $state('sk-0802f45e1d4e41c8ae8d46396c97b746');
	let pexelsApiKey = $state('');
	let elevenLabsApiKey = $state('');
	let selectedVoiceId = $state(DEFAULT_EDGE_VOICE_ID); // Default to id-ID-ArdiNeural (Edge TTS)
	let voiceMode = $state('edge_tts'); // Default to Edge TTS
	let selectedAudioEffect = $state(DEFAULT_AUDIO_EFFECT_ID); // Default: studio_podcast

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

	// Backsound Music (BGM) Preview & Volume Controls
	let previewBgmAudioEl = null;
	let isPlayingBgmPreview = $state(false);

	function playBgmTrack(trackId) {
		const track = BGM_TRACKS.find((t) => t.id === trackId);
		if (!track || !track.url) {
			if (previewBgmAudioEl) {
				previewBgmAudioEl.pause();
			}
			isPlayingBgmPreview = false;
			return;
		}

		if (!previewBgmAudioEl) {
			previewBgmAudioEl = new Audio();
			previewBgmAudioEl.loop = true;
		}

		// Ensure studio player audio is not playing at the same time
		audioController.pauseBGM();

		// Update src if changed or empty
		if (!previewBgmAudioEl.src.includes(track.url)) {
			previewBgmAudioEl.src = track.url;
		}
		previewBgmAudioEl.volume = Math.max(0.02, bgmVolume);

		const p = previewBgmAudioEl.play();
		if (p !== undefined && typeof p.then === 'function') {
			p.then(() => {
				isPlayingBgmPreview = true;
			}).catch((err) => {
				console.warn('Playback error or blocked by browser:', err);
				isPlayingBgmPreview = false;
			});
		} else {
			isPlayingBgmPreview = true;
		}
	}

	function toggleBgmTrackPreview(trackId) {
		const targetId = trackId || selectedBgmId;
		if (!targetId || targetId === 'none') {
			if (previewBgmAudioEl) {
				previewBgmAudioEl.pause();
			}
			isPlayingBgmPreview = false;
			return;
		}

		if (isPlayingBgmPreview && selectedBgmId === targetId) {
			if (previewBgmAudioEl) {
				previewBgmAudioEl.pause();
			}
			isPlayingBgmPreview = false;
		} else {
			selectedBgmId = targetId;
			playBgmTrack(targetId);
		}
	}

	function handleSelectBgmTrack(trackId) {
		if (trackId === 'none') {
			selectedBgmId = 'none';
			if (previewBgmAudioEl) {
				previewBgmAudioEl.pause();
			}
			isPlayingBgmPreview = false;
			return;
		}

		if (selectedBgmId === trackId && isPlayingBgmPreview) {
			toggleBgmTrackPreview(trackId);
		} else {
			selectedBgmId = trackId;
			playBgmTrack(trackId);
		}
	}

	function updateBgmVolume(newVol) {
		bgmVolume = Math.max(0, Math.min(0.50, Number(newVol)));
		if (previewBgmAudioEl) {
			previewBgmAudioEl.volume = bgmVolume;
		}
		audioController.setBGMVolume(bgmVolume);
	}

	onDestroy(() => {
		if (previewAudioEl) {
			previewAudioEl.pause();
			previewAudioEl = null;
		}
		if (previewBgmAudioEl) {
			previewBgmAudioEl.pause();
			previewBgmAudioEl = null;
		}
	});

	// Modals State
	let showSettingsModal = $state(false);
	let showSubtitleModal = $state(false);
	let showExportModal = $state(false);
	let showFootageModal = $state(false);
	let showScriptGeneratorModal = $state(false);
	let showTopicGeneratorModal = $state(false);
	let showTitleGeneratorModal = $state(false);
	let pendingTopic = $state(null);
	let footageSceneIndex = $state(0);
	let elevenLabsError = $state(''); // Show ElevenLabs errors to user

	function handleSelectTopicFromGenerator(topicItem) {
		showTopicGeneratorModal = false;
		pendingTopic = topicItem;
		showScriptGeneratorModal = true;
	}

	function handleSelectTitleForScript(selectedTitle) {
		showTitleGeneratorModal = false;
		if (selectedTitle) videoTitle = selectedTitle;
		pendingTopic = { title: selectedTitle, hookFormula: 'curiosity_gap' };
		showScriptGeneratorModal = true;
	}

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
		if (typeof window !== 'undefined') {
			const savedDeepseek = localStorage.getItem('yt_deepseek_key');
			if (savedDeepseek) deepseekApiKey = savedDeepseek;

			pexelsApiKey = localStorage.getItem('yt_pexels_key') || '';
			selectedVoiceId = localStorage.getItem('yt_voice_id') || DEFAULT_EDGE_VOICE_ID;
			const savedMode = localStorage.getItem('yt_voice_mode');
			if (savedMode) {
				voiceMode = savedMode;
			} else {
				voiceMode = 'edge_tts';
			}

			const savedEffect = localStorage.getItem('yt_audio_effect');
			if (savedEffect) selectedAudioEffect = savedEffect;

			const savedKaraoke = localStorage.getItem('yt_karaoke_enabled');
			if (savedKaraoke !== null) karaokeEnabled = savedKaraoke === 'true';

			const savedFontSize = localStorage.getItem('yt_subtitle_fontsize');
			if (savedFontSize) subtitleFontSize = Number(savedFontSize);

			const savedPosition = localStorage.getItem('yt_subtitle_position');
			if (savedPosition) subtitlePosition = savedPosition;

			const savedQuoteDec = localStorage.getItem('yt_quote_decoration');
			if (savedQuoteDec) quoteDecoration = savedQuoteDec;

			const savedTitle = localStorage.getItem('yt_video_title');
			if (savedTitle) videoTitle = savedTitle;
		}
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('yt_deepseek_key', deepseekApiKey || 'sk-0802f45e1d4e41c8ae8d46396c97b746');
			localStorage.setItem('yt_karaoke_enabled', String(karaokeEnabled));
			localStorage.setItem('yt_subtitle_fontsize', String(subtitleFontSize));
			localStorage.setItem('yt_subtitle_position', subtitlePosition);
			localStorage.setItem('yt_quote_decoration', quoteDecoration);
			localStorage.setItem('yt_voice_mode', voiceMode);
			localStorage.setItem('yt_audio_effect', selectedAudioEffect);
			localStorage.setItem('yt_video_title', videoTitle || '');
		}
	});

	function deriveTitleFromScript(txt) {
		if (!txt) return '';
		const hook = txt.match(/\[HOOK:\s*([^\]]+)\]/i);
		if (hook && hook[1].trim().length > 4) return hook[1].trim();
		const bab = txt.match(/\[BAB\s*\d+:\s*([^\]]+)\]/i);
		if (bab && bab[1].trim().length > 4) return bab[1].trim();
		const firstLine = txt.trim().split('\n').find(l => l.trim().length > 10);
		if (firstLine) return firstLine.replace(/^\[.*?\]\s*/, '').trim().slice(0, 80);
		return '';
	}

	let effectiveVideoTitle = $derived(videoTitle.trim() || deriveTitleFromScript(script) || 'youtube-long-video');

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

				// 2. Fetch Voiceover / Audio Timestamps (F5-TTS, Edge TTS, ElevenLabs, or fallback)
				let voiceData = null;
				elevenLabsError = '';

				if (voiceMode === 'f5_tts' || isF5Voice(selectedVoiceId)) {
					addGenLog('F5-TTS', `[Adegan ${sceneNum}] Men-generate Suara Alami F5-TTS (${selectedVoiceId})...`, 'info');
					try {
						const ttsRes = await fetch('/api/f5-tts', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								text: sc.narration || spokenText,
								voiceId: selectedVoiceId || DEFAULT_F5_VOICE_ID,
								speed: 1.0,
								chapterIntro: sc.chapter ? getChapterSpokenIntro(sc) : '',
								chapterPause: sc.chapter ? Number(sc.chapter.pauseDuration ?? 5) : 0,
								outroPause: sc.chapter ? Number(sc.chapter.outroPause ?? 0) : 0
							})
						});
						voiceData = await ttsRes.json();
						if (voiceData && !voiceData.success && voiceData.error) {
							console.warn('F5-TTS error:', voiceData.error);
							addGenLog('WARN', `[Adegan ${sceneNum}] ${voiceData.error}`, 'warn');
							voiceData = null;
						} else if (voiceData && voiceData.success) {
							genProgress.stats.ttsClips++;
							addGenLog('F5-TTS', `✓ [Adegan ${sceneNum}] Audio F5-TTS siap (${voiceData.duration}s, natural voice)`, 'success');
						}
					} catch (e) {
						console.warn('F5-TTS API error:', e);
						addGenLog('WARN', `[Adegan ${sceneNum}] Gagal terhubung ke F5-TTS Lokal. Beralih ke Edge TTS...`, 'warn');
					}

					// Automatic fallback to Edge TTS if F5-TTS failed or offline
					if (!voiceData || !voiceData.success) {
						addGenLog('FALLBACK', `[Adegan ${sceneNum}] Beralih ke Edge TTS (${DEFAULT_EDGE_VOICE_ID})...`, 'info');
						try {
							const edgeRes = await fetch('/api/edge-tts', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									text: sc.narration || spokenText,
									voiceId: isEdgeVoice(selectedVoiceId) ? selectedVoiceId : DEFAULT_EDGE_VOICE_ID,
									audioEffect: sc.audioEffect || selectedAudioEffect,
									chapterIntro: sc.chapter ? getChapterSpokenIntro(sc) : '',
									chapterPause: sc.chapter ? Number(sc.chapter.pauseDuration ?? 5) : 0,
									outroPause: sc.chapter ? Number(sc.chapter.outroPause ?? 0) : 0
								})
							});
							voiceData = await edgeRes.json();
							if (voiceData && voiceData.success) {
								genProgress.stats.ttsClips++;
								addGenLog('EDGE-TTS', `✓ [Adegan ${sceneNum}] Audio Edge TTS siap (${voiceData.duration}s)`, 'success');
							}
						} catch (fbErr) {
							console.warn('Fallback Edge TTS error:', fbErr);
						}
					}
				} else if (voiceMode === 'edge_tts') {
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
					sc.voiceId = selectedVoiceId || voiceData.voiceId || 'id-ID-ArdiNeural';
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

	function handleSelectFootage(targetIndexOrVideo, maybeVideo) {
		let targetIndex = footageSceneIndex;
		let chosenVideo = null;

		if (maybeVideo !== undefined) {
			targetIndex = typeof targetIndexOrVideo === 'number' ? targetIndexOrVideo : footageSceneIndex;
			chosenVideo = maybeVideo;
		} else {
			chosenVideo = targetIndexOrVideo;
		}

		if (scenes[targetIndex] && chosenVideo) {
			scenes = scenes.map((s, i) => {
				if (i === targetIndex) {
					return {
						...s,
						footage: chosenVideo,
						visualQuery: chosenVideo.queryHint || chosenVideo.title || s.visualQuery
					};
				}
				return s;
			});
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
			const isF5 = (voiceMode === 'f5_tts' || targetScene.voiceProvider === 'f5_tts' || isF5Voice(selectedVoiceId));
			const isEdge = !isF5 && (voiceMode === 'edge_tts' || targetScene.voiceProvider === 'edge_tts' || isEdgeVoice(selectedVoiceId));
			const endpoint = isF5 ? '/api/f5-tts' : (isEdge ? '/api/edge-tts' : '/api/elevenlabs');
			const payload = isF5
				? {
					text: targetScene.narration || getSpokenVoiceoverText(targetScene),
					voiceId: selectedVoiceId || DEFAULT_F5_VOICE_ID,
					chapterIntro: targetScene.chapter ? getChapterSpokenIntro(targetScene) : '',
					chapterPause: targetScene.chapter ? Number(targetScene.chapter.pauseDuration ?? 5) : 0,
					outroPause: targetScene.chapter ? Number(targetScene.chapter.outroPause ?? 0) : 0
				}
				: isEdge
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

			let data = null;
			try {
				const res = await fetch(endpoint, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
				data = await res.json();
			} catch (err) {
				console.warn('TTS request error:', err);
			}

			// Automatic fallback to Edge TTS if endpoint failed
			if ((!data || !data.success) && endpoint !== '/api/edge-tts') {
				try {
					const fallbackRes = await fetch('/api/edge-tts', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							text: targetScene.narration || getSpokenVoiceoverText(targetScene),
							voiceId: isEdgeVoice(selectedVoiceId) ? selectedVoiceId : DEFAULT_EDGE_VOICE_ID,
							audioEffect: effectToUse,
							chapterIntro: targetScene.chapter ? getChapterSpokenIntro(targetScene) : '',
							chapterPause: targetScene.chapter ? Number(targetScene.chapter.pauseDuration ?? 5) : 0,
							outroPause: targetScene.chapter ? Number(targetScene.chapter.outroPause ?? 0) : 0
						})
					});
					data = await fallbackRes.json();
				} catch (fbErr) {
					console.warn('Fallback Edge TTS error:', fbErr);
				}
			}

			if (data && data.success) {
				targetScene.voiceAudioUrl = data.audioUrl;
				targetScene.voiceId = selectedVoiceId || 'id-ID-ArdiNeural';
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
		onOpenTitleGenerator={() => showTitleGeneratorModal = true}
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
				onOpenTopicGenerator={() => showTopicGeneratorModal = true}
				onOpenTitleGenerator={() => showTitleGeneratorModal = true}
			/>

			<!-- Mode Voiceover Selector & Vocal Filter -->
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
						class:active={voiceMode === 'f5_tts'} 
						onclick={() => { voiceMode = 'f5_tts'; if (!isF5Voice(selectedVoiceId)) selectedVoiceId = DEFAULT_F5_VOICE_ID; }}
					>
						<span>⚡ F5-TTS Lokal</span>
						<span class="badge-f5">Natural AI</span>
					</button>

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
						onclick={() => { voiceMode = 'elevenlabs'; if (isEdgeVoice(selectedVoiceId) || isF5Voice(selectedVoiceId)) selectedVoiceId = DEFAULT_ELEVEN_VOICE_ID; }}
					>
						<span>🤖 ElevenLabs AI</span>
						<span class="badge-ai">Premium</span>
					</button>
				</div>

				{#if voiceMode === 'f5_tts'}
					<div class="quick-voice-bar">
						<span class="quick-voice-label">Pilihan Suara Alami (F5-TTS M1):</span>
						<div class="quick-voice-chips">
							{#each F5_LOCAL_VOICES as v}
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
								title="Buka status & pengaturan suara lengkap"
							>
								<span>Status Server & Suara ⚙️</span>
							</button>
						</div>
					</div>
				{:else if voiceMode === 'edge_tts'}
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

				<!-- Quick Background Music (Backsound) Bar with Play & Volume Setting -->
				<div class="quick-bgm-bar">
					<div class="quick-bgm-header">
						<div class="quick-bgm-title-wrap">
							<span class="quick-bgm-label">🎵 Musik Latar / Backsound Video:</span>
							<span class="quick-bgm-hint">Atur lagu & volume agar narasi voiceover tetap jernih dan berbobot (-25 s.d. -32 dB)</span>
						</div>
						<div class="quick-bgm-vol-display">
							<span class="vol-num-text">Volume: <strong>{Math.round(bgmVolume * 100)}%</strong></span>
							<span class="vol-rec-badge">{bgmVolume === 0 ? '🔇 Mute' : bgmVolume <= 0.08 ? '⭐ Ideal' : bgmVolume <= 0.15 ? 'Sedang' : 'Tinggi'}</span>
						</div>
					</div>

					<div class="quick-bgm-controls-row">
						<!-- Track Chips -->
						<div class="quick-bgm-chips">
							{#each BGM_TRACKS as track}
								<button
									type="button"
									class="quick-bgm-chip"
									class:active={selectedBgmId === track.id}
									onclick={() => handleSelectBgmTrack(track.id)}
									title="{track.name} – {track.mood}"
								>
									{#if track.id !== 'none'}
										<span 
											class="chip-bgm-play-icon"
											class:playing={isPlayingBgmPreview && selectedBgmId === track.id}
											onclick={(e) => { e.stopPropagation(); toggleBgmTrackPreview(track.id); }}
											role="button"
											tabindex="0"
											title={isPlayingBgmPreview && selectedBgmId === track.id ? "Stop Musik" : "Play & Dengarkan Musik Ini"}
										>
											{isPlayingBgmPreview && selectedBgmId === track.id ? '⏹' : '▶'}
										</span>
									{:else}
										<span class="chip-bgm-icon">🔇</span>
									{/if}
									<span class="chip-bgm-name">{track.name}</span>
									{#if track.badge}
										<span class="chip-bgm-badge">{track.badge}</span>
									{:else if track.mood && track.id !== 'none'}
										<span class="chip-bgm-mood">{track.mood}</span>
									{/if}
								</button>
							{/each}
						</div>

						<!-- Volume Slider & Quick Presets -->
						<div class="quick-bgm-vol-panel">
							<div class="vol-slider-wrap">
								<button 
									type="button" 
									class="btn-vol-mute" 
									onclick={() => updateBgmVolume(bgmVolume > 0 ? 0 : 0.06)}
									title={bgmVolume === 0 ? "Bunyikan Musik" : "Mute Musik"}
								>
									{bgmVolume === 0 ? '🔇' : '🔊'}
								</button>
								<input
									type="range"
									min="0"
									max="0.30"
									step="0.01"
									value={bgmVolume}
									oninput={(e) => updateBgmVolume(e.currentTarget.value)}
									class="bgm-range-slider"
									title="Geser untuk atur volume backsound"
								/>
								<span class="vol-pct-text">{Math.round(bgmVolume * 100)}%</span>
							</div>

							<div class="vol-preset-buttons">
								<button 
									type="button" 
									class="vol-preset-btn" 
									class:active={bgmVolume === 0} 
									onclick={() => updateBgmVolume(0)}
								>
									Mute
								</button>
								<button 
									type="button" 
									class="vol-preset-btn" 
									class:active={Math.round(bgmVolume * 100) === 5} 
									onclick={() => updateBgmVolume(0.05)}
									title="Rekomendasi narasi storytelling YouTube"
								>
									Halus 5%
								</button>
								<button 
									type="button" 
									class="vol-preset-btn" 
									class:active={Math.round(bgmVolume * 100) === 10} 
									onclick={() => updateBgmVolume(0.10)}
								>
									Sedang 10%
								</button>
								<button 
									type="button" 
									class="vol-preset-btn" 
									class:active={Math.round(bgmVolume * 100) === 18} 
									onclick={() => updateBgmVolume(0.18)}
								>
									Tegas 18%
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="video-title-row">
					<span class="title-row-label">Judul Video — jadi nama file</span>
					<input type="text" class="video-title-input" placeholder="Judul akan jadi nama file .mp4 — kosong = ambil dari naskah otomatis" bind:value={videoTitle} />
					{#if effectiveVideoTitle && effectiveVideoTitle !== videoTitle}
						<span class="title-auto-hint">Otomatis: {effectiveVideoTitle}</span>
					{/if}
				</div>

				<!-- Tombol Generate Tepat di Bawah Pilihan Suara, Filter Vokal & Backsound -->
				<div class="banner-generate-action">
					<div class="generate-config-summary">
						<span class="config-dot"></span>
						<div class="config-text">
							<span>Mode: <strong>{voiceMode === 'f5_tts' ? 'F5-TTS Lokal' : voiceMode === 'edge_tts' ? 'Edge TTS' : voiceMode === 'custom_upload' ? 'Rekaman Sendiri' : 'ElevenLabs AI'}</strong></span>
							{#if voiceMode === 'f5_tts'}
								<span class="config-sub">({F5_LOCAL_VOICES.find(v => v.id === selectedVoiceId)?.name?.split(' (')[0] || selectedVoiceId})</span>
							{:else if voiceMode === 'edge_tts'}
								<span class="config-sub">({EDGE_TTS_VOICES.find(v => v.id === selectedVoiceId)?.name?.split(' (')[0] || selectedVoiceId})</span>
							{/if}
							<span class="config-sep">•</span>
							<span>Filter Vokal: <strong class="config-effect">{AUDIO_EFFECT_PRESETS.find(e => e.id === selectedAudioEffect)?.emoji || '🎛️'} {AUDIO_EFFECT_PRESETS.find(e => e.id === selectedAudioEffect)?.name?.split(' (')[0] || 'Default'}</strong></span>
							<span class="config-sep">•</span>
							<span>Backsound: <strong class="config-bgm">🎵 {BGM_TRACKS.find(b => b.id === selectedBgmId)?.name || 'None'} ({Math.round(bgmVolume * 100)}%)</strong></span>
						</div>
					</div>

					<button 
						type="button"
						class="btn btn-primary btn-lg banner-generate-btn" 
						onclick={generateWorkflow}
						disabled={isGenerating || !script.trim()}
						title="Analisis naskah, potong adegan, unduh footage & generate voiceover"
					>
						{#if isGenerating}
							<RefreshCw size={19} class="spin" />
							<span>Menganalisis & Mengambil Footage...</span>
						{:else}
							<Wand2 size={19} />
							<span>Analisis Naskah & Generate Video</span>
						{/if}
					</button>
				</div>
			</div>

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
					subtitlePosition={subtitlePosition}
					quoteDecoration={quoteDecoration}
					karaokeEnabled={karaokeEnabled}
					subtitleFontSize={subtitleFontSize}
					bind:selectedBgmId={selectedBgmId}
					bind:bgmVolume={bgmVolume}
				/>
			</div>
			<div class="storyboard-under-preview">
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
			</div>
		</section>
	</main>

	<!-- Modals -->
	<TopicGeneratorModal
		isOpen={showTopicGeneratorModal}
		deepseekApiKey={deepseekApiKey}
		onSelectTopic={handleSelectTopicFromGenerator}
		onClose={() => showTopicGeneratorModal = false}
	/>

	<ScriptGeneratorModal
		isOpen={showScriptGeneratorModal}
		deepseekApiKey={deepseekApiKey}
		initialTopic={pendingTopic ? pendingTopic.title : ''}
		initialHookStyle={pendingTopic?.hookFormula || ''}
		onSelectScript={(newScript) => {
			script = newScript;
			if (pendingTopic?.title && !videoTitle.trim()) videoTitle = pendingTopic.title;
			else if (!videoTitle.trim()) {
				const derived = deriveTitleFromScript(newScript);
				if (derived) videoTitle = derived;
			}
		}}
		onOpenTopicGenerator={() => {
			showScriptGeneratorModal = false;
			showTopicGeneratorModal = true;
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
		bind:subtitlePosition={subtitlePosition}
		bind:quoteDecoration={quoteDecoration}
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
		subtitlePosition={subtitlePosition}
		quoteDecoration={quoteDecoration}
		karaokeEnabled={karaokeEnabled}
		subtitleFontSize={subtitleFontSize}
		selectedBgmId={selectedBgmId}
		bgmVolume={bgmVolume}
		selectedVoiceId={selectedVoiceId}
		videoTitle={effectiveVideoTitle}
		onOpenTitleGenerator={() => showTitleGeneratorModal = true}
		onClose={() => showExportModal = false}
	/>

	<TitleGeneratorModal
		isOpen={showTitleGeneratorModal}
		deepseekApiKey={deepseekApiKey}
		initialTopic={videoTitle}
		onSelectTitle={(t) => {
			if (t) videoTitle = t;
			showTitleGeneratorModal = false;
		}}
		onSelectTitleForScript={(t) => {
			if (t) videoTitle = t;
			handleSelectTitleForScript(t);
		}}
		onClose={() => showTitleGeneratorModal = false}
	/>
</div>

<style>
	.studio-app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-base);
	}

	.api-error-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		background: rgba(239, 68, 68, 0.08);
		border-bottom: 1px solid rgba(239, 68, 68, 0.22);
		padding: 10px 20px;
		font-size: 0.82rem;
		color: #fecdd3;
	}

	.api-error-banner strong { color: #fda4af; }
	.api-error-banner code {
		background: rgba(255,255,255,0.08);
		padding: 2px 6px;
		border-radius: 6px;
		color: #fde68a;
		border: 1px solid var(--line);
	}
	.error-hint { color: var(--text-2); }
	.link-btn {
		background: none;
		border: none;
		color: #93c5fd;
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
		font-size: inherit;
	}
	.dismiss-btn {
		margin-left: auto;
		background: none;
		border: none;
		color: #fda4af;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
	}

	.studio-workspace {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
		gap: 18px;
		padding: 16px 20px 0;
		max-width: 1480px;
		margin: 0 auto;
		width: 100%;
		align-items: start;
	}

	.left-workstation {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}

	.right-workstation {
		position: sticky;
		top: 64px;
		height: calc(100vh - 64px);
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 0;
		align-self: start;
		overflow: hidden;
	}

	.player-sticky-wrap {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
		background: var(--bg-base);
		z-index: 2;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--line);
	}

	.storyboard-under-preview {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding-right: 4px;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 2px;
	}

	.pulse-indicator {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--success);
	}

	.preview-title {
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text-2);
	}

	.tips-card {
		padding: 14px 16px;
		background: var(--bg-surface);
		border-radius: var(--r-lg);
		border: 1px solid var(--line);
	}

	.tips-card h4 {
		font-size: 0.82rem;
		margin-bottom: 8px;
		color: var(--text);
		font-weight: 700;
	}

	.tips-card ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.tips-card li {
		font-size: 0.76rem;
		color: var(--text-2);
		line-height: 1.5;
		padding-left: 12px;
		position: relative;
	}

	.tips-card li::before {
		content: '·';
		position: absolute;
		left: 4px;
		color: var(--text-3);
	}

	.tips-card strong {
		color: var(--text);
		font-weight: 600;
	}

		.voice-mode-banner {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
	}

	.mode-info {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	.mode-icon {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		font-size: 0.85rem;
		color: var(--text-2);
		flex-shrink: 0;
	}

	.mode-title {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text);
	}

	.mode-desc {
		font-size: 0.74rem;
		color: var(--text-2);
		margin-top: 3px;
		line-height: 1.45;
	}

	.mode-options {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.mode-pill-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 11px;
		background: transparent;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--text-2);
	}

	.mode-pill-btn:hover {
		border-color: var(--line-strong);
		color: var(--text);
		background: var(--bg-card);
	}

	.mode-pill-btn.active {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg-base);
	}

	.badge-f5, .badge-free, .badge-ai {
		font-size: 0.6rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		color: var(--text-3);
		letter-spacing: 0.02em;
	}

	.quick-voice-bar,
	.quick-effect-bar,
	.quick-bgm-bar {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
	}

	.quick-voice-label,
	.quick-effect-label,
	.quick-bgm-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-2);
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.quick-effect-hint, .quick-bgm-hint { font-size: 0.7rem; color: var(--text-3); }

	.quick-voice-chips, .quick-effect-chips, .quick-bgm-chips {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		align-items: center;
	}

	.quick-voice-chip, .quick-effect-chip, .quick-bgm-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-full);
		font-size: 0.72rem;
		color: var(--text-2);
	}

	.quick-voice-chip:hover, .quick-effect-chip:hover, .quick-bgm-chip:hover {
		border-color: var(--line-strong);
		color: var(--text);
	}

	.quick-voice-chip.active, .quick-effect-chip.active, .quick-bgm-chip.active {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg-base);
		font-weight: 600;
	}

	.quick-voice-chip.more-btn {
		background: transparent;
		border-style: dashed;
		color: var(--text-3);
	}

	.chip-gender { font-size: 0.68rem; opacity: 0.7; }
	.chip-eff-emoji { font-size: 0.8rem; }
	.chip-eff-name, .chip-bgm-name { font-size: 0.72rem; }

	.chip-preview-play-btn, .chip-bgm-play-icon {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		color: var(--text-2);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.55rem;
	}

	.chip-preview-play-btn.playing, .chip-bgm-play-icon.playing {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg-base);
	}

	.chip-eff-tag, .chip-bgm-badge {
		font-size: 0.6rem;
		padding: 1px 5px;
		border-radius: 4px;
		background: transparent;
		border: 1px solid var(--line);
		color: var(--text-3);
	}

	.quick-bgm-header {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
		align-items: center;
	}

	.quick-bgm-title-wrap { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
	.quick-bgm-vol-display { display: flex; gap: 8px; align-items: center; }
	.vol-num-text { font-size: 0.72rem; color: var(--text-2); }
	.vol-num-text strong { color: var(--text); }
	.vol-rec-badge {
		font-size: 0.62rem;
		padding: 2px 6px;
		border-radius: var(--r-sm);
		background: var(--bg-card);
		border: 1px solid var(--line);
		color: var(--text-3);
	}
	.quick-bgm-controls-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between; }
	.quick-bgm-vol-panel {
		display: flex;
		gap: 10px;
		align-items: center;
		padding: 6px 10px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
	.vol-slider-wrap { display: flex; gap: 8px; align-items: center; }
	.btn-vol-mute { padding: 2px; font-size: 0.85rem; color: var(--text-2); }
	.bgm-range-slider { width: 84px; height: 4px; accent-color: var(--text); }
	.vol-pct-text { font-size: 0.7rem; color: var(--text-2); min-width: 28px; font-weight: 600; }
	.vol-preset-buttons { display: flex; gap: 4px; }
	.vol-preset-btn {
		padding: 3px 8px;
		font-size: 0.65rem;
		font-weight: 500;
		background: transparent;
		border: 1px solid var(--line);
		color: var(--text-3);
		border-radius: var(--r-sm);
	}
	.vol-preset-btn:hover { border-color: var(--line-strong); color: var(--text-2); }
	.vol-preset-btn.active { background: var(--text); border-color: var(--text); color: var(--bg-base); }
	.config-bgm { color: var(--text-2); }

	.banner-generate-action {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
		flex-wrap: wrap;
	}

	.generate-config-summary {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		padding: 8px 12px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		font-size: 0.76rem;
		color: var(--text-2);
	}

	.config-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--success); flex-shrink: 0; }
	.config-text { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
	.config-text strong { color: var(--text); font-weight: 600; }
	.config-sub { color: var(--text-3); }
	.config-sep { color: var(--text-dim); }
	.config-effect { color: var(--text); }

	.banner-generate-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 11px 18px;
		font-size: 0.88rem;
		font-weight: 600;
		border-radius: var(--r-md);
		background: var(--primary);
		color: #fff;
		border: 1px solid var(--primary);
	}

	.banner-generate-btn:hover:not(:disabled) { background: var(--primary-hover); }
	.banner-generate-btn:disabled { opacity: 0.45; }
	.video-title-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
	.title-row-label {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text-2);
	}
	.video-title-input {
		width: 100%;
		font-size: 0.85rem;
	}
	.title-auto-hint {
		font-size: 0.72rem;
		color: var(--text-3);
	}

	@media (max-width: 1100px) {
		.studio-workspace { grid-template-columns: 1fr; padding: 14px; }
		.right-workstation { position: static; height: auto; overflow: visible; }
		.player-sticky-wrap { position: static; }
		.storyboard-under-preview { overflow: visible; }
		.banner-generate-action { flex-direction: column; align-items: stretch; }
		.banner-generate-btn { justify-content: center; width: 100%; }
	}

</style>

