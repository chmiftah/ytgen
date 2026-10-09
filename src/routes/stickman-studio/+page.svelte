<script>
	import { onMount } from 'svelte';
	import {
		Wand2,
		Play,
		Pause,
		ArrowLeft,
		Layers,
		Download,
		Film,
		RefreshCw,
		Music,
		Volume2,
		Mic,
		Sliders,
		Flame,
		Sparkles,
		Key,
		ExternalLink,
		Eye,
		EyeOff,
		Check
	} from 'lucide-svelte';
	import { SCRIPT_PRESETS } from '$lib/services/scriptAnalyzer.js';
	import GenerationProgressConsole from '$lib/components/GenerationProgressConsole.svelte';
	import StickmanScriptModal from '$lib/components/StickmanScriptModal.svelte';
	import TitleGeneratorModal from '$lib/components/TitleGeneratorModal.svelte';
	import {
		AUDIO_EFFECT_PRESETS,
		DEFAULT_AUDIO_EFFECT_ID,
		getAudioEffectById
	} from '$lib/services/audioEffectService.js';
	import { BGM_TRACKS } from '$lib/services/audioEngine.js';
	import {
		DEFAULT_EDGE_VOICE_ID,
		DEFAULT_GEMINI_VOICE_ID,
		GEMINI_TTS_VOICES,
		isGeminiVoice
	} from '$lib/services/voiceService.js';
	import { humanizeScript } from '$lib/services/scriptHumanizer.js';
	import WhisperAudioModal from '$lib/components/WhisperAudioModal.svelte';

	let script = $state(SCRIPT_PRESETS[0].text);
	let videoTitle = $state(SCRIPT_PRESETS[0].title);
	let presetLangFilter = $state('all');
	let filteredPresets = $derived(
		presetLangFilter === 'all'
			? SCRIPT_PRESETS
			: SCRIPT_PRESETS.filter((p) => (p.lang || 'id') === presetLangFilter)
	);
	let showScriptModal = $state(false);
	let showTitleModal = $state(false);
	let showWhisperModal = $state(false);
	let isGeneratingQuickTitle = $state(false);
	let activeAudioTab = $state('voice');
	let humanizeNotice = $state('');
	let isHumanizing = $state(false);

	let estimatedScenes = $derived(
		script.trim() ? script.split(/\n\s*\n/).filter((s) => s.trim().length > 0).length : 0
	);
	let wordCount = $derived(
		script.trim() ? script.trim().split(/\s+/).filter(Boolean).length : 0
	);

	function handleHumanize() {
		if (!script.trim() || isHumanizing) return;
		isHumanizing = true;
		try {
			const original = script;
			const optimized = humanizeScript(script);
			if (optimized && optimized !== original) {
				script = optimized;
				humanizeNotice = '✨ Naskah dioptimalkan: gaya santai, jeda dramatis, dan alur voiceover stickman!';
			} else {
				humanizeNotice = 'Naskah sudah rapi dan siap untuk voiceover.';
			}
			setTimeout(() => {
				humanizeNotice = '';
			}, 3500);
		} finally {
			isHumanizing = false;
		}
	}

	function handleApplyGeneratedScript(newScript, lang = 'id') {
		script = newScript;
		const isEn = lang === 'en' || /\[chapter\b/i.test(newScript) || /\b(the|this|that|with|from|your|what|when|because|brain|spiral)\b/i.test(newScript);
		if (isEn) {
			presetLangFilter = 'en';
			if (selectedVoiceId.startsWith('id-ID') || selectedVoiceId.startsWith('f5-')) {
				selectedVoiceId = 'en-US-ChristopherNeural';
			}
		}
	}

	async function handleWhisperImportSuccess(data) {
		if (data.scenes && data.scenes.length > 0) {
			if (data.fullTranscript) {
				script = data.fullTranscript;
			}
			if (!videoTitle || videoTitle.length < 5) {
				videoTitle = (data.fullTranscript || '').slice(0, 48).trim() + '...';
			}

			// Automatically analyze empty space for every single scene so text never collides with character!
			const aligned = [];
			for (const sc of data.scenes) {
				let side = 'right';
				if (sc.image) {
					try { side = await detectEmptySide(sc.image); } catch {}
				}
				const align = side === 'right' ? 'right' : 'left';
				aligned.push({
					...sc,
					textSide: side,
					layoutSide: side,
					textAlign: align,
					textOffsetX: 0,
					textOffsetY: 0
				});
			}

			scenes = aligned;
			stickmanTextAlign = 'auto';
			activeSceneIndex = 0;
			selectScene(0);
			// Navigate to Step 3 so the user can inspect & customize Pose & Karakter, then Step 4 (Papan), then Step 5 (Player)
			wizardStep = 3;
			addGenLog('WHISPER', `Berhasil! ${data.scenes.length} adegan telah dibuat. Posisi teks otomatis ditempatkan di ruang kosong setiap gambar!`, 'success');
		}
	}

	function applyStylesAndOpenPlayer() {
		// Apply selected global styles from Step 3 & 4 to all scenes
		scenes = scenes.map((s) => ({
			...s,
			imageAnim: s.imageAnim || stickmanImageAnim,
			idleMotion: s.idleMotion || stickmanIdleMotion,
			textAnim: stickmanAnim,
			textIdleMotion: stickmanTextIdleMotion,
			textColorTop: stickmanTextColorTop,
			textColorBottom: stickmanTextColorBottom,
			doodleType: stickmanDoodle,
			fontSize: stickmanFontSize
		}));
		wizardStep = 5;
		activeSceneIndex = 0;
		selectScene(0);
	}

	async function generateQuickAiTitle(chosenCategory = 'wealth_finance') {
		if (isGeneratingQuickTitle) return;
		isGeneratingQuickTitle = true;
		try {
			const res = await fetch('/api/generate-title', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: videoTitle.trim(),
					category: chosenCategory
				})
			});
			const data = await res.json();
			if (data.success && Array.isArray(data.titles) && data.titles.length > 0) {
				const topPicks = [...data.titles].sort((a, b) => (b.ctrScore || 0) - (a.ctrScore || 0)).slice(0, 4);
				const randomPick = topPicks[Math.floor(Math.random() * topPicks.length)];
				if (randomPick?.title) videoTitle = randomPick.title;
			}
		} catch (err) {
			console.error('Quick AI Title error:', err);
		} finally {
			isGeneratingQuickTitle = false;
		}
	}
	// ── Wizard Step State ─────────────────────────────────
	let wizardStep = $state(1); // 1-5

	function setSceneAlign(id) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, textAlign: id, textSide: id === 'left' ? 'left' : id === 'right' ? 'right' : id === 'middle' ? 'middle' : 'center' };
		scenes = [...scenes];
		stickmanTextAlign = id;
	}

	let scenes = $state([]);
	let activeSceneIndex = $state(0);
	let stickmanTextRotate = $state(-0.8);
	let stickmanTextScale = $state(1);
	let isGenerating = $state(false);
	let availableAssets = $state([]);
	let audioElA = $state(null);
	let audioElB = $state(null);
	let activePlayerId = $state('A');
	let isPlaying = $state(false);
	let isRendering = $state(false);
	let renderProgress = $state(0);
	let renderStep = $state('');
	let downloadUrl = $state(null);
	let downloadFilename = $state('');
	let renderError = $state(null);
	let renderQuality = $state('1080p');
	let isShorts = $state(false);

	function toggleShorts() {
		isShorts = !isShorts;
		if (scenes.length > 0) {
			// Pastikan seluruh adegan tetap menggunakan posisi samping kiri/kanan
			scenes = scenes.map((s) => {
				let side = s.textSide || s.layoutSide || 'right';
				if (side === 'bottom' || side === 'top') side = 'right';
				return {
					...s,
					textSide: side,
					layoutSide: side,
					textAlign: side === 'right' ? 'right' : 'left'
				};
			});
		}
	}
	let stickmanTextColor = $state('#111827');
	let stickmanTextColorTop = $state('#DC2626');
	let stickmanTextColorBottom = $state('#111827');
	let stickmanFontSize = $state(60);
	let stickmanFontFamily = $state("'Shadows Into Light',cursive");
	let stickmanAnim = $state('pop');
	let stickmanTextAlign = $state('auto');
	let stickmanTextIdleMotion = $state('shake');
	const POS_OPTIONS = [
		{ id: 'auto', label: '🎯 Auto (Ruang Kosong)' },
		{ id: 'left', label: 'Kiri' },
		{ id: 'center', label: 'Tengah Kolom' },
		{ id: 'right', label: 'Kanan' },
		{ id: 'middle', label: 'Tengah Layar' }
	];
	const FONT_OPTIONS = [
		{ id: 'cabin', label: 'Chalk Cabin Sketch', value: "'Cabin Sketch',cursive" },
		{ id: 'fredericka', label: 'Chalk Fredericka', value: "'Fredericka the Great',cursive" },
		{ id: 'shadows', label: 'Chalk Shadows', value: "'Shadows Into Light',cursive" },
		{ id: 'kalam', label: 'Chalk Kalam', value: "'Kalam',cursive" },
		{ id: 'indie', label: 'Chalk Indie Flower', value: "'Indie Flower',cursive" },
		{ id: 'patrick', label: 'Patrick Hand', value: "'Patrick Hand',cursive" }
	];
	const ANIM_OPTIONS = [
		{ id: 'none', label: 'Tanpa' },
		{ id: 'pop', label: 'Pop Zoom' },
		{ id: 'slide', label: 'Slide' },
		{ id: 'fade', label: 'Fade Blur' },
		{ id: 'typewriter', label: 'Menulis' }
	];
	let stickmanImageAnim = $state('dynamic');
	const IMAGE_ANIM_OPTIONS = [
		{ id: 'dynamic', label: '✨ Auto Dinamis' },
		{ id: 'slide-top', label: '⬇️ Turun Atas' },
		{ id: 'slide-side', label: '➡️ Masuk Samping' },
		{ id: 'zoom-in', label: '🔍 Slow Zoom' },
		{ id: 'pop', label: '💥 Pop Bounce' },
		{ id: 'fade', label: '🌫️ Fade In' },
		{ id: 'static', label: '⏹️ Diam' }
	];
	function applyImageAnimToAll() {
		scenes = scenes.map((s) => ({ ...s, imageAnim: stickmanImageAnim }));
	}
	function setSceneImageAnim(anim) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, imageAnim: anim };
		scenes = [...scenes];
		stickmanImageAnim = anim;
	}
	function getEffectiveImageAnimClass(scene, index) {
		const a = scene?.imageAnim || stickmanImageAnim || 'dynamic';
		if (a === 'dynamic') {
			const cycle = ['slide-top', 'slide-side', 'zoom-in', 'pop'];
			return cycle[index % cycle.length];
		}
		return a;
	}
	let stickmanIdleMotion = $state('shake');
	const IDLE_MOTION_OPTIONS = [
		{ id: 'shake', label: '📳 Sketch Shake (Getar)' },
		{ id: 'breathe', label: '🌊 Bernapas / Float' },
		{ id: 'drift', label: '🔍 Slow Drift' },
		{ id: 'none', label: '⏹️ Diam' }
	];
	function applyIdleMotionToAll() {
		scenes = scenes.map((s) => ({ ...s, idleMotion: stickmanIdleMotion }));
	}
	function setSceneIdleMotion(motion) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, idleMotion: motion };
		scenes = [...scenes];
		stickmanIdleMotion = motion;
	}
	const TOP_COLOR_PRESETS = ['#DC2626', '#EA580C', '#D97706', '#2563EB', '#16A34A', '#111827', '#FFFFFF'];
	const BOTTOM_COLOR_PRESETS = ['#111827', '#374151', '#FFFFFF', '#FACC15', '#38BDF8', '#EF4444', '#10B981'];
	const TEXT_IDLE_OPTIONS = [
		{ id: 'shake', label: '📳 Chalk Jitter' },
		{ id: 'breathe', label: '🌊 Denyut' },
		{ id: 'drift', label: '🔍 Slow Drift' },
		{ id: 'none', label: '⏹️ Diam' }
	];

	function applyTextIdleMotionToAll() {
		scenes = scenes.map((s) => ({ ...s, textIdleMotion: stickmanTextIdleMotion }));
	}
	function setSceneTextIdleMotion(motion) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, textIdleMotion: motion };
		scenes = [...scenes];
		stickmanTextIdleMotion = motion;
	}
	function applyTextColorTopToAll() {
		scenes = scenes.map((s) => ({ ...s, textColorTop: stickmanTextColorTop }));
	}
	function setSceneTextColorTop(c) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, textColorTop: c };
		scenes = [...scenes];
		stickmanTextColorTop = c;
	}
	function applyTextColorBottomToAll() {
		scenes = scenes.map((s) => ({ ...s, textColorBottom: stickmanTextColorBottom }));
	}
	function setSceneTextColorBottom(c) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, textColorBottom: c };
		scenes = [...scenes];
		stickmanTextColorBottom = c;
	}
	function setSceneFontSize(size) {
		const val = Math.max(20, Math.min(130, Number(size) || 60));
		if (!currentScene) {
			stickmanFontSize = val;
			return;
		}
		scenes[activeSceneIndex] = { ...currentScene, fontSize: val };
		scenes = [...scenes];
		stickmanFontSize = val;
	}

	function changeFontSize(delta) {
		const curSize = Number(currentScene?.fontSize || stickmanFontSize || 60);
		setSceneFontSize(curSize + delta);
	}

	function applyFontSizeToAll() {
		const curSize = Number(currentScene?.fontSize || stickmanFontSize || 60);
		scenes = scenes.map((s) => ({ ...s, fontSize: curSize }));
		stickmanFontSize = curSize;
		addGenLog('STICKMAN', `Ukuran font ${curSize}px diterapkan ke semua adegan`, 'success');
	}

	const FONT_SIZE_PRESETS = [
		{ label: 'S (42px)', val: 42 },
		{ label: 'M (56px)', val: 56 },
		{ label: 'L (70px)', val: 70 },
		{ label: 'XL (86px)', val: 86 },
		{ label: 'XXL (102px)', val: 102 }
	];

	let stickmanDoodle = $state('none');

	// Voices & Audio Effect (Filter Suara / Karakter Vokal)
	let selectedVoiceEngine = $state('edge_tts'); // 'edge_tts' | 'gemini_tts'
	let geminiApiKey = $state('');
	let showGeminiKey = $state(false);

	const QUICK_VOICES = [
		{ id: 'id-ID-ArdiNeural', name: 'Ardi', gender: 'Pria', lang: 'ID', emoji: '👨', sampleUrl: '/voice-samples/id-ID-ArdiNeural.mp3' },
		{ id: 'id-ID-GadisNeural', name: 'Gadis', gender: 'Wanita', lang: 'ID', emoji: '👩', sampleUrl: '/voice-samples/id-ID-GadisNeural.mp3' },
		{ id: 'en-US-ChristopherNeural', name: 'Christopher', gender: 'Pria (Deep/Docu)', lang: 'US', emoji: '🎙️', sampleUrl: '/voice-samples/en-US-ChristopherNeural.mp3' },
		{ id: 'en-US-GuyNeural', name: 'Guy', gender: 'Pria (Casual)', lang: 'US', emoji: '🌐', sampleUrl: '/voice-samples/en-US-GuyNeural.mp3' },
		{ id: 'en-US-JennyNeural', name: 'Jenny', gender: 'Wanita (Warm)', lang: 'US', emoji: '👩', sampleUrl: '/voice-samples/en-US-JennyNeural.mp3' },
		{ id: 'en-US-AriaNeural', name: 'Aria', gender: 'Wanita (Clear)', lang: 'US', emoji: '✨', sampleUrl: '/voice-samples/en-US-AriaNeural.mp3' }
	];
	let selectedVoiceId = $state(DEFAULT_EDGE_VOICE_ID);
	let selectedAudioEffect = $state(DEFAULT_AUDIO_EFFECT_ID);
	let isRegeneratingVoice = $state(false);

	// Custom Voice Tuner State
	let customPitchHz = $state(-14);
	let customRatePct = $state(-2);
	let customBassDb = $state(4);
	let isTestingCustomVoice = $state(false);
	let testVoiceAudio = null;

	function selectAudioEffectPreset(eff) {
		selectedAudioEffect = eff.id;
		if (eff.id === 'cinematic_deep') {
			customPitchHz = -14;
			customRatePct = -4;
			customBassDb = 5;
		} else if (eff.id === 'studio_podcast') {
			customPitchHz = -8;
			customRatePct = -2;
			customBassDb = 4;
		} else if (eff.id === 'energetic_creator') {
			customPitchHz = -3;
			customRatePct = 4;
			customBassDb = 2;
		} else if (eff.id === 'storyteller') {
			customPitchHz = -18;
			customRatePct = -6;
			customBassDb = 5;
		} else if (eff.id === 'movie_trailer') {
			customPitchHz = -28;
			customRatePct = -4;
			customBassDb = 6;
		} else if (eff.id === 'natural') {
			customPitchHz = 0;
			customRatePct = 0;
			customBassDb = 0;
		}
	}

	async function testCustomVoice() {
		if (isTestingCustomVoice) {
			if (testVoiceAudio) {
				testVoiceAudio.pause();
				testVoiceAudio = null;
			}
			isTestingCustomVoice = false;
			return;
		}

		isTestingCustomVoice = true;
		try {
			const res = await fetch('/api/edge-tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: selectedVoiceId.startsWith('en-')
						? "Hello! This is a live preview of your custom tuned Edge TTS voice."
						: "Halo! Ini adalah contoh tes karakter suara kustom Edge TTS untuk video kamu.",
					voiceId: selectedVoiceId || 'id-ID-ArdiNeural',
					pitch: `${customPitchHz}Hz`,
					rate: `${customRatePct >= 0 ? '+' : ''}${customRatePct}%`,
					customBass: customBassDb,
					audioEffect: selectedAudioEffect
				})
			});
			const data = await res.json();
			if (data.success && (data.staticAudioUrl || data.audioUrl)) {
				if (testVoiceAudio) testVoiceAudio.pause();
				testVoiceAudio = new Audio(data.staticAudioUrl || data.audioUrl);
				testVoiceAudio.onended = () => { isTestingCustomVoice = false; };
				testVoiceAudio.onerror = () => { isTestingCustomVoice = false; };
				await testVoiceAudio.play();
			} else {
				alert(data.error || 'Gagal mengetes suara kustom');
				isTestingCustomVoice = false;
			}
		} catch (err) {
			console.error('Test voice error:', err);
			isTestingCustomVoice = false;
		}
	}

	let previewAudioEl = null;
	let playingEffectPreviewId = $state(null);
	let playingVoicePreviewId = $state(null);

	function setVoiceEngine(engine) {
		selectedVoiceEngine = engine;
		if (typeof window !== 'undefined') {
			localStorage.setItem('stickman_voice_engine', engine);
		}
		if (engine === 'gemini_tts') {
			if (!isGeminiVoice(selectedVoiceId)) {
				selectedVoiceId = DEFAULT_GEMINI_VOICE_ID;
			}
		} else {
			if (isGeminiVoice(selectedVoiceId)) {
				selectedVoiceId = DEFAULT_EDGE_VOICE_ID;
			}
		}
	}

	function handleGeminiKeyChange(val) {
		geminiApiKey = (val || '').trim();
		if (typeof window !== 'undefined') {
			localStorage.setItem('stickman_gemini_api_key', geminiApiKey);
			localStorage.setItem('gemini_api_key', geminiApiKey);
		}
	}

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
		if (previewAudioEl) previewAudioEl.pause();
		previewAudioEl = new Audio(eff.sampleUrl);
		previewAudioEl.onended = () => { playingEffectPreviewId = null; };
		previewAudioEl.play().catch(() => {});
		playingEffectPreviewId = eff.id;
	}

	async function toggleVoicePreview(v, e) {
		if (e) e.stopPropagation();
		if (playingVoicePreviewId === v.id) {
			if (previewAudioEl) {
				previewAudioEl.pause();
				previewAudioEl.currentTime = 0;
			}
			playingVoicePreviewId = null;
			return;
		}

		if (v.sampleUrl) {
			if (previewAudioEl) previewAudioEl.pause();
			previewAudioEl = new Audio(v.sampleUrl);
			previewAudioEl.onended = () => { playingVoicePreviewId = null; };
			previewAudioEl.play().catch(() => {});
			playingVoicePreviewId = v.id;
			return;
		}

		// On-the-fly preview for Gemini Voices
		if (isGeminiVoice(v.id)) {
			if (!geminiApiKey || geminiApiKey.trim().length < 15) {
				alert('Masukkan Gemini API Key gratis terlebih dahulu di kotak input Gemini di atas untuk mencoba preview suara ini!');
				return;
			}
			if (previewAudioEl) {
				previewAudioEl.pause();
				previewAudioEl.currentTime = 0;
			}
			playingVoicePreviewId = v.id;
			try {
				const charName = v.name ? v.name.split(' (')[0] : (v.voiceName || 'Gemini');
				const res = await fetch('/api/gemini-tts', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: `Halo! Ini karakter suara ${charName}, siap menghidupkan animasi Stickman kamu!`,
						voiceId: v.id,
						apiKey: geminiApiKey,
						audioEffect: selectedAudioEffect || 'studio_podcast'
					})
				});
				const data = await res.json();
				if (data.success && (data.staticAudioUrl || data.audioUrl)) {
					v.sampleUrl = data.staticAudioUrl || data.audioUrl;
					previewAudioEl = new Audio(v.sampleUrl);
					previewAudioEl.onended = () => { playingVoicePreviewId = null; };
					previewAudioEl.play().catch(() => {});
				} else {
					alert(data.error || 'Gagal memutar preview suara Gemini');
					playingVoicePreviewId = null;
				}
			} catch (err) {
				console.error('Gemini preview error:', err);
				alert('Gagal menghubungi Gemini TTS: ' + err.message);
				playingVoicePreviewId = null;
			}
		}
	}

	// Backsound (BGM) State
	let selectedBgmId = $state('lofi-chill');
	let bgmVolume = $state(0.10);
	let previewBgmAudioEl = null;
	let isPlayingBgmPreview = $state(false);

	function toggleBgmTrackPreview(trackId) {
		const track = BGM_TRACKS.find((t) => t.id === trackId);
		if (!track || !track.url) {
			if (previewBgmAudioEl) previewBgmAudioEl.pause();
			isPlayingBgmPreview = false;
			return;
		}
		if (isPlayingBgmPreview && selectedBgmId === trackId) {
			if (previewBgmAudioEl) previewBgmAudioEl.pause();
			isPlayingBgmPreview = false;
			return;
		}
		if (previewBgmAudioEl) previewBgmAudioEl.pause();
		previewBgmAudioEl = new Audio(track.url);
		previewBgmAudioEl.volume = Math.max(0.05, bgmVolume * 1.5);
		previewBgmAudioEl.onended = () => { isPlayingBgmPreview = false; };
		previewBgmAudioEl.play().catch(() => {});
		isPlayingBgmPreview = true;
	}

	function handleBgmVolumeInput(e) {
		bgmVolume = Number(e.currentTarget.value);
		if (previewBgmAudioEl && isPlayingBgmPreview) {
			previewBgmAudioEl.volume = Math.max(0.02, bgmVolume * 1.5);
		}
	}

	// Audio SFX disabled by user preference
	let stickmanSfx = $state('none');

	// Auto Video Padding (Safe area margins: top, bottom, left, right)
	let stickmanVideoPadding = $state(4);
	const VIDEO_PADDING_OPTIONS = [
		{ id: 0, label: '0% (Penuh)', desc: 'Tanpa margin, gambar & teks mentok sisi luar' },
		{ id: 2, label: '2% (Tipis)', desc: 'Margin tipis 4 sisi' },
		{ id: 4, label: '⭐ 4% (Auto / Safe Area)', desc: 'Rekomendasi aman YouTube safe zone (atas, bawah, kiri, kanan)' },
		{ id: 6, label: '6% (Whiteboard)', desc: 'Jarak lega seperti kanvas papan tulis' }
	];

	// Canvas Background & Paper Style Themes
	let stickmanBgTheme = $state('white');
	const BG_THEME_OPTIONS = [
		{ id: 'white', label: '📄 Putih', desc: 'Putih bersih klasik whiteboard' },
		{ id: 'sketchbook', label: '📜 Sketsa', desc: 'Kertas krem Moleskine hangat (#F5EEDB)' },
		{ id: 'kraft', label: '📦 Kraft', desc: 'Kertas cokelat vintage daur ulang bertekstur' },
		{ id: 'grid', label: '📓 Grid', desc: 'Buku catatan berpetak / jurnal ide' },
		{ id: 'doodle', label: '🎨 Doodle', desc: 'Background coretan sketsa ide & rumus tangan (Dan Koe style)' },
		{ id: 'chalkboard', label: '⬛ Kapur', desc: 'Dark mode chalkboard papan tulis hitam (#121212)' }
	];

	function setStickmanTheme(themeId) {
		stickmanBgTheme = themeId;
		if (scenes.length) {
			scenes = scenes.map(s => ({ ...s, bgTheme: themeId }));
		}
	}

	function getCanvasContainerStyle(theme) {
		if (theme === 'sketchbook') return 'background-color: #F5EEDB;';
		if (theme === 'kraft') return "background: url('/stickman/themes/kraft-bg.jpg') center / cover no-repeat, #D4BA88;";
		if (theme === 'grid') return "background: url('/stickman/themes/grid-bg.png') center / cover no-repeat, #F5EEDB;";
		if (theme === 'doodle') return "background: url('/stickman/themes/doodle-bg.jpg') center / cover no-repeat, #F5EEDB;";
		if (theme === 'chalkboard') return 'background-color: #121212;';
		return 'background-color: #ffffff;';
	}

	function getStickmanBgLayerStyle(image, theme) {
		if (!image) return '';
		const imgUrl = `url('${image}')`;
		const bgSize = isShorts ? '88% auto' : 'cover';
		const bgPos = 'center center';
		const bgRepeat = 'no-repeat';

		if (theme === 'sketchbook') {
			return `background-color: #F5EEDB; background-image: ${imgUrl}; background-size: ${bgSize}; background-position: ${bgPos}; background-repeat: ${bgRepeat}; background-blend-mode: multiply;`;
		}
		if (theme === 'kraft') {
			return `background-color: #D4BA88; background-image: ${imgUrl}, url('/stickman/themes/kraft-bg.jpg'); background-size: ${bgSize}, cover; background-position: ${bgPos}, center; background-repeat: ${bgRepeat}, no-repeat; background-blend-mode: multiply;`;
		}
		if (theme === 'grid') {
			return `background-color: #F5EEDB; background-image: ${imgUrl}, url('/stickman/themes/grid-bg.png'); background-size: ${bgSize}, cover; background-position: ${bgPos}, center; background-repeat: ${bgRepeat}, no-repeat; background-blend-mode: multiply;`;
		}
		if (theme === 'doodle') {
			return `background-color: #F5EEDB; background-image: ${imgUrl}, url('/stickman/themes/doodle-bg.jpg'); background-size: ${bgSize}, cover; background-position: ${bgPos}, center; background-repeat: ${bgRepeat}, no-repeat; background-blend-mode: multiply;`;
		}
		if (theme === 'chalkboard') {
			return `background-color: #121212; background-image: ${imgUrl}; background-size: ${bgSize}; background-position: ${bgPos}; background-repeat: ${bgRepeat}; filter: invert(1);`;
		}
		return `background-color: #ffffff; background-image: ${imgUrl}; background-size: ${bgSize}; background-position: ${bgPos}; background-repeat: ${bgRepeat};`;
	}

	async function regenerateVoiceoverForScene(sceneIndex) {
		if (!scenes[sceneIndex]) return;
		const sc = scenes[sceneIndex];
		try {
			const isGemini = selectedVoiceEngine === 'gemini_tts' || isGeminiVoice(selectedVoiceId);
			const endpoint = isGemini ? '/api/gemini-tts' : '/api/edge-tts';
			const bodyPayload = isGemini
				? {
						text: sc.narration,
						voiceId: selectedVoiceId || DEFAULT_GEMINI_VOICE_ID,
						apiKey: geminiApiKey,
						audioEffect: selectedAudioEffect || 'cinematic_deep'
					}
				: {
						text: sc.narration,
						voiceId: selectedVoiceId || 'id-ID-ArdiNeural',
						pitch: `${customPitchHz}Hz`,
						rate: `${customRatePct >= 0 ? '+' : ''}${customRatePct}%`,
						customBass: customBassDb,
						audioEffect: selectedAudioEffect || 'cinematic_deep'
					};

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bodyPayload)
			});
			const data = await res.json();
			if (data.success && (data.staticAudioUrl || data.audioUrl)) {
				scenes[sceneIndex] = {
					...sc,
					voiceAudioUrl: data.staticAudioUrl || data.audioUrl,
					audioDuration: data.duration,
					wordTimings: data.wordTimings || []
				};
				scenes = [...scenes];
			} else if (data.error) {
				alert(data.error);
			}
		} catch (err) {
			console.error('Error regenerating voiceover:', err);
		}
	}

	async function regenerateAllVoiceovers() {
		if (!scenes.length || isRegeneratingVoice) return;
		isRegeneratingVoice = true;
		for (let i = 0; i < scenes.length; i++) {
			await regenerateVoiceoverForScene(i);
		}
		isRegeneratingVoice = false;
	}

	function isDark(hex){ try{ const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return (r*0.299+g*0.587+b*0.114)<150; }catch{return true;} }
	let stickmanShadowTop = $derived(isDark(stickmanTextColorTop) ? '0 0 1px rgba(255,255,255,0.95), 0 0 4px rgba(255,255,255,0.45), 1px 1px 0 rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)');
	let stickmanShadowBottom = $derived(isDark(stickmanTextColorBottom) ? '0 0 1px rgba(255,255,255,0.95), 0 0 4px rgba(255,255,255,0.45), 1px 1px 0 rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)');

	function formatDefaultTwoLines(rawText) {
		if (!rawText) return '';
		const clean = String(rawText).trim();
		if (!clean) return '';
		if (clean.includes('\n')) {
			const parts = clean.split('\n').map(s => s.trim()).filter(Boolean);
			if (parts.length >= 2) return `${parts[0]}\n${parts.slice(1).join(' ')}`;
			return parts[0] || '';
		}
		const words = clean.split(/\s+/).filter(Boolean);
		if (words.length <= 1) return clean;
		if (words.length === 2) return `${words[0]}\n${words[1]}`;
		if (words.length === 3) return `${words.slice(0, 2).join(' ')}\n${words[2]}`;
		const mid = Math.ceil(words.length / 2);
		return `${words.slice(0, mid).join(' ')}\n${words.slice(mid).join(' ')}`;
	}

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

	let currentScene = $derived(scenes[activeSceneIndex] || null);

	function fallbackExtractKeyPoint(text) {
		if (!text) return '';
		const stop = new Set([
			'yang','dan','di','ke','dari','ini','itu','adalah','untuk','dengan','pada','akan','juga','karena','sebagai','dalam','tidak','ada','saya','kita','mereka','kamu','bisa','harus','sudah','telah','agar','atau','tetapi','namun','jika','kalau','saat','ketika','oleh','tentang','sebuah','seorang','para','secara','lebih','paling','sangat','jadi','bahwa','hanya','saja','lagi','masih','belum','pernah','ingin','mau','perlu','dapat','boleh','oleh','kita','nya','lah','kah','pun','tersebut','seperti','yaitu','yakni','antara','hingga','sampai','setelah','sebelum','selama','tanpa','melalui','terhadap','menjadi','adalah','ialah','sering','banyak','besar','kecil','baru','lama','baik','buruk','salah','benar','penting','utama','sama','lain','setiap','semua','beberapa','tersebut',
			'the','and','to','of','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us','very','much','here'
		]);
		let words = text.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
		let filtered = words.filter(w => w.length >= 4 && !stop.has(w.toLowerCase()));
		if (filtered.length < 2) filtered = words.filter(w => w.length >= 3 && !stop.has(w.toLowerCase())).slice(0, 4);
		let pick = filtered.slice(0, 4);
		if (pick.length < 2) pick = words.slice(0, 2);
		const cap = pick.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
		return formatDefaultTwoLines(cap.join(' '));
	}
	function resolveKeyPoint(sc) {
		const ai = (sc.keyPoint || sc.key_point || '').toString().trim();
		if (ai) {
			return formatDefaultTwoLines(ai);
		}
		return fallbackExtractKeyPoint(sc.narration || '');
	}

	function getDisplayFontSize(text, scene = currentScene) {
		const base = Number(scene?.fontSize) || stickmanFontSize || 60;
		// Scale 1080p base font size to preview canvas height (~430px)
		const canvasRefH = 1080;
		const scaleFactor = (canvasHeight || 430) / canvasRefH;
		// Di mode shorts, perkecil font size (faktor 0.60) agar teks di samping pas & rapi
		const shortsFactor = isShorts ? 0.60 : 1.0;
		const previewPx = Math.round(base * scaleFactor * 1.12 * shortsFactor);
		return Math.max(10, Math.min(85, previewPx));
	}

	function getEditorLines(text) {
		const raw = (text || '').split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
		if (raw.length >= 2) return raw;
		if (raw.length === 1) {
			const formatted = formatDefaultTwoLines(raw[0]);
			return formatted.split('\n');
		}
		const t = (text || '').trim();
		return t ? formatDefaultTwoLines(t).split('\n') : [''];
	}

	// High-accuracy ink-centroid empty side detector:
	// Analyzes dark/colored character strokes to find the stickman's center of mass,
	// then places text on the opposite side to eliminate image-text collision.
	function detectEmptySide(url) {
		return new Promise((resolve) => {
			if (!url) return resolve('right');
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				try {
					const W = 160; const H = 90; // 16:9 sampling grid
					const c = document.createElement('canvas'); c.width = W; c.height = H;
					const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, W, H);
					const data = ctx.getImageData(0, 0, W, H).data;

					let leftInk = 0;
					let rightInk = 0;
					let totalInkWeight = 0;
					let weightedXSum = 0;

					for (let y = 0; y < H; y++) {
						for (let x = 0; x < W; x++) {
							const i = (y * W + x) * 4;
							const a = data[i + 3];
							if (a < 30) continue;

							const r = data[i];
							const g = data[i + 1];
							const b = data[i + 2];
							// Perceptual brightness
							const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

							// Darker than canvas paper threshold (~232)
							if (brightness < 232) {
								const weight = (255 - brightness) * (a / 255);
								totalInkWeight += weight;
								weightedXSum += x * weight;

								if (x < W * 0.45) {
									leftInk += weight;
								} else if (x > W * 0.55) {
									rightInk += weight;
								}
							}
						}
					}

					if (totalInkWeight > 80) {
						const centroidRatio = (weightedXSum / totalInkWeight) / W;
						// If the character's weight is predominantly on the left (< 48%), put text on the RIGHT
						if (centroidRatio < 0.48) {
							return resolve('right');
						}
						// If the character's weight is predominantly on the right (> 52%), put text on the LEFT
						if (centroidRatio > 0.52) {
							return resolve('left');
						}
						// If near center, compare ink in the outer margins: place text where there is less ink
						return resolve(leftInk <= rightInk ? 'left' : 'right');
					}

					resolve('right');
				} catch {
					resolve('right');
				}
			};
			img.onerror = () => resolve('right');
			img.src = url;
		});
	}

	let canvasEl = $state(null);
	let canvasHeight = $state(430);

	function flipCurrentTextSide() {
		if (!currentScene) return;
		const cur = currentScene.textSide || currentScene.layoutSide;
		const next = (cur === 'left') ? 'right' : 'left';
		const nextAlign = next === 'right' ? 'right' : 'left';
		scenes = scenes.map((s, i) => i === activeSceneIndex ? { ...s, textSide: next, layoutSide: next, textAlign: nextAlign, textOffsetX: 0, textOffsetY: 0 } : s);
	}

	async function autoAlignCurrentScene() {
		if (!currentScene?.image) return;
		const side = await detectEmptySide(currentScene.image);
		const align = side === 'right' ? 'right' : 'left';
		scenes = scenes.map((s, i) => i === activeSceneIndex ? { ...s, textSide: side, layoutSide: side, textAlign: align, textOffsetX: 0, textOffsetY: 0 } : s);
	}

	async function autoAlignAllScenes() {
		if (!scenes || scenes.length === 0) return;
		const updated = [];
		for (const s of scenes) {
			let side = s.textSide || 'right';
			if (s.image) {
				try { side = await detectEmptySide(s.image); } catch {}
			}
			const align = side === 'right' ? 'right' : 'left';
			updated.push({
				...s,
				textSide: side,
				layoutSide: side,
				textAlign: align,
				textOffsetX: 0,
				textOffsetY: 0
			});
		}
		scenes = updated;
		stickmanTextAlign = 'auto';
	}

	function applyAnimToAll() {
		scenes = scenes.map((s) => ({ ...s, textAnim: stickmanAnim }));
	}
	function setSceneAnim(anim) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, textAnim: anim };
		scenes = [...scenes];
		stickmanAnim = anim;
	}

	async function setTextAlign(align) {
		stickmanTextAlign = align;
		if (!currentScene) return;
		if (align === 'auto') {
			await autoAlignCurrentScene();
		} else {
			const side = align === 'left' ? 'left' : align === 'right' ? 'right' : currentScene.textSide || 'right';
			scenes[activeSceneIndex] = { ...currentScene, textAlign: align, textSide: side, layoutSide: side };
			scenes = [...scenes];
		}
	}
	async function applyAlignToAll() {
		if (stickmanTextAlign === 'auto') {
			await autoAlignAllScenes();
		} else {
			const side = stickmanTextAlign === 'left' ? 'left' : stickmanTextAlign === 'right' ? 'right' : null;
			scenes = scenes.map((s) => ({
				...s,
				textAlign: stickmanTextAlign,
				...(side ? { textSide: side, layoutSide: side } : {})
			}));
		}
	}
	function getOverlayStyle(scene) {
		const align = scene?.textAlign || stickmanTextAlign;
		const tx = Number(scene?.textOffsetX || 0);
		const ty = Number(scene?.textOffsetY || 0);
		const rot = Number(scene?.textRotate ?? 0);
		const sc = Number(scene?.textScale ?? 1);
		const rawSide = scene?.textSide || scene?.layoutSide;
		const side = (rawSide === 'bottom' || rawSide === 'top' || !rawSide) ? 'right' : rawSide;

		const mw = isShorts ? 'max-width: 44%; width: 44%;' : '';
		if (align === 'middle') {
			return `left: calc(50% + ${tx}%); top: calc(50% + ${ty}%); transform: translate(-50%, -50%) rotate(${rot}deg) scale(${sc}); text-align:center; transform-origin: center center; ${mw}`;
		}
		const ta = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left';
		if (side === 'left') {
			return `left: calc(4% + ${tx}%); top: calc(50% + ${ty}%); transform: translateY(-50%) rotate(${rot}deg) scale(${sc}); text-align:${ta}; transform-origin: left center; ${mw}`;
		} else {
			return `right: calc(4% - ${tx}%); top: calc(50% + ${ty}%); transform: translateY(-50%) rotate(${rot}deg) scale(${sc}); text-align:${ta}; transform-origin: right center; ${mw}`;
		}
	}

	function updateCurrentSceneProp(key, value) {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, [key]: value };
		scenes = [...scenes];
	}

	let drag = $state({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });
	function onTextPointerDown(e) {
		if (!currentScene) return;
		e.preventDefault();
		drag.active = true;
		drag.startX = e.clientX;
		drag.startY = e.clientY;
		drag.origX = currentScene.textOffsetX || 0;
		drag.origY = currentScene.textOffsetY || 0;
		try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
	}
	function onWindowPointerMove(e) {
		if (!drag.active || !currentScene) return;
		const rect = canvasEl?.getBoundingClientRect();
		const scaleX = rect && rect.width > 0 ? (100 / rect.width) : 0.15;
		const scaleY = rect && rect.height > 0 ? (100 / rect.height) : 0.25;
		const dx = e.clientX - drag.startX;
		const dy = e.clientY - drag.startY;
		const nx = Math.max(-35, Math.min(35, drag.origX + dx * scaleX));
		const ny = Math.max(-28, Math.min(28, drag.origY + dy * scaleY));
		updateCurrentSceneProp('textOffsetX', Math.round(nx * 10) / 10);
		updateCurrentSceneProp('textOffsetY', Math.round(ny * 10) / 10);
	}
	function onWindowPointerUp() { drag.active = false; }
	function onWindowKeydown(e) {
		const target = e.target;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
			return;
		}
		if (scenes.length <= 1) return;
		if (e.key === 'ArrowLeft') {
			if (activeSceneIndex > 0) {
				activeSceneIndex -= 1;
				e.preventDefault();
			}
		} else if (e.key === 'ArrowRight') {
			if (activeSceneIndex < scenes.length - 1) {
				activeSceneIndex += 1;
				e.preventDefault();
			}
		}
	}
	function resetTransform() {
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, textOffsetX: 0, textOffsetY: 0, textRotate: 0, textScale: 1 };
		scenes = [...scenes];
	}

	function addGenLog(tag, message, type = 'info') {
		const now = new Date();
		const time = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
		genProgress.logs = [...genProgress.logs, { id: `${Date.now()}-${Math.random()}`, time, tag, message, type }];
		genProgress.currentStep = message;
	}

	// Image Picker Modal state
	let showImagePicker = $state(false);
	let imagePickerFilter = $state('');
	let selectedImageCategory = $state('all');
	let imagePickerLimit = $state(60);
	let pickerGridSize = $state('large'); // 'large' | 'medium' | 'compact'
	let previewAsset = $state(null);
	let imageUploadInputEl = $state(null);
	let stickmanCategories = $state([]);

	let filteredAssets = $derived(
		availableAssets.filter(a => {
			if (selectedImageCategory !== 'all') {
				if (!a.categories?.includes(selectedImageCategory)) return false;
			}
			const q = imagePickerFilter.trim().toLowerCase();
			if (!q) return true;
			return (
				a.title?.toLowerCase().includes(q) ||
				a.slug?.toLowerCase().includes(q) ||
				(a.keywords || []).some(k => k.toLowerCase().includes(q)) ||
				(a.tagsId || []).some(t => t.toLowerCase().includes(q))
			);
		})
	);

	let displayedAssets = $derived(
		filteredAssets.slice(0, imagePickerLimit)
	);

	$effect(() => {
		// Reset limit when filter or category changes
		imagePickerFilter;
		selectedImageCategory;
		imagePickerLimit = 60;
	});

	function openImagePicker() {
		if (!currentScene) return;
		imagePickerFilter = '';
		selectedImageCategory = 'all';
		imagePickerLimit = 60;
		showImagePicker = true;
	}

	function loadMoreAssets() {
		imagePickerLimit = Math.min(filteredAssets.length, imagePickerLimit + 60);
	}

	async function applyAssetToScene(asset) {
		if (!currentScene) return;
		let detectedSide = currentScene.textSide || 'right';
		try {
			detectedSide = await detectEmptySide(asset.url);
		} catch {}
		const autoAlign = detectedSide === 'right' ? 'right' : 'left';
		scenes[activeSceneIndex] = {
			...currentScene,
			image: asset.url,
			imageTitle: asset.title || asset.slug,
			textSide: detectedSide,
			layoutSide: detectedSide,
			textAlign: autoAlign,
			textOffsetX: 0,
			textOffsetY: 0
		};
		scenes = [...scenes];
		showImagePicker = false;
	}

	function handleImageFileUpload(e) {
		const file = e.target?.files?.[0];
		if (!file || !currentScene) return;
		const reader = new FileReader();
		reader.onload = async (ev) => {
			const dataUrl = ev.target.result;
			let detectedSide = currentScene.textSide || 'right';
			try {
				detectedSide = await detectEmptySide(dataUrl);
			} catch {}
			const autoAlign = detectedSide === 'right' ? 'right' : 'left';
			scenes[activeSceneIndex] = {
				...currentScene,
				image: dataUrl,
				imageTitle: file.name.slice(0, 40),
				textSide: detectedSide,
				layoutSide: detectedSide,
				textAlign: autoAlign,
				textOffsetX: 0,
				textOffsetY: 0
			};
			scenes = [...scenes];
			showImagePicker = false;
		};
		reader.readAsDataURL(file);
		e.target.value = '';
	}

	onMount(async () => {
		if (typeof window !== 'undefined') {
			const savedGeminiKey = localStorage.getItem('stickman_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
			if (savedGeminiKey) geminiApiKey = savedGeminiKey;

			const savedEngine = localStorage.getItem('stickman_voice_engine');
			if (savedEngine && ['edge_tts', 'gemini_tts'].includes(savedEngine)) {
				selectedVoiceEngine = savedEngine;
				if (savedEngine === 'gemini_tts' && !isGeminiVoice(selectedVoiceId)) {
					selectedVoiceId = DEFAULT_GEMINI_VOICE_ID;
				}
			}
		}

		try {
			const res = await fetch('/api/stickman-assets');
			const data = await res.json();
			if (data.success) {
				availableAssets = data.assets || [];
				if (data.categories) stickmanCategories = data.categories;
			}
		} catch (err) { console.warn('stickman assets', err); }
	});

	async function generateStickmanVideo() {
		if (!script.trim() || isGenerating) return;
		isGenerating = true;
		genProgress.active = true;
		genProgress.percent = 5;
		genProgress.currentStep = 'Menganalisis naskah...';
		genProgress.currentScene = 0;
		genProgress.totalScenes = 0;
		genProgress.activeQuery = '';
		genProgress.activeNarration = '';
		genProgress.stats = { localFootage: 0, pexelsFootage: 0, ttsClips: 0 };
		genProgress.logs = [];
		addGenLog('SYSTEM', 'Mulai pipeline Stickman...', 'info');
		try {
			const storedKey = typeof window !== 'undefined' ? localStorage.getItem('yt_deepseek_key') : '';
			const cleanApiKey = (storedKey && storedKey !== 'sk-0802f45e1d4e41c8ae8d46396c97b746') ? storedKey.trim() : '';
			const res = await fetch('/api/analyze', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ script, apiKey: cleanApiKey })
			});
			const data = await res.json();
			let parsed = data.scenes || [];
			if (parsed.length === 0) {
				const { analyzeScript } = await import('$lib/services/scriptAnalyzer.js');
				parsed = analyzeScript(script);
				addGenLog('FALLBACK', `Parser lokal: ${parsed.length} adegan`, 'info');
			} else addGenLog('DEEPSEEK', `AI: ${parsed.length} adegan`, 'success');

			// Natural pacing: preserve parsed scenes intact based on complete sentences & thoughts
			genProgress.totalScenes = parsed.length;
			genProgress.percent = 15;
			const populated = [];
			scenes = [];
			// Track used image URLs so NO two scenes in the project share the same image
			const usedAssetUrls = new Set();
			let prevImageUrl = '';

			for (let i = 0; i < parsed.length; i++) {
				const sc = parsed[i];
				genProgress.currentScene = i + 1;
				genProgress.activeQuery = sc.stickmanQuery || sc.visualQuery || '';
				genProgress.activeNarration = sc.narration || '';
				genProgress.percent = Math.round(15 + (i / parsed.length) * 70);
				const sceneLogLabel = sc.stickmanQuery ? `[Aksi: "${sc.stickmanQuery}"]` : `"${sc.visualQuery}"`;
				addGenLog('SCENE', `Adegan ${i+1}/${parsed.length}: ${sceneLogLabel}`, 'highlight');

				// Dedicated Intelligent Stickman Asset Picker:
				// 1. Matches sc.stickmanQuery (English actions generated specifically for stickman)
				// 2. Matches Indonesian keywords from sc.narration and sc.keyPoint with asset.tagsId
				// 3. Scores all 586 assets, avoids duplicate scenes, picks the best contextual character!
				let matchedAsset = null;
				if (availableAssets.length > 0) {
					const stickQ = (sc.stickmanQuery || '').toLowerCase().trim();
					const qWords = stickQ.split(/\s+/).filter(w => w.length > 2);
					const narWords = (sc.narration || '').toLowerCase().split(/[\s,.;!?—–]+/).filter(w => w.length > 2);
					const keyWords = (sc.keyPoint || '').toLowerCase().split(/[\s,.;!?—–]+/).filter(w => w.length > 2);

					const scored = availableAssets.map(asset => {
						let score = 0;
						// English stickman_query match (High weight)
						for (const qw of qWords) {
							if (asset.title?.toLowerCase().includes(qw)) score += 8;
							else if (asset.keywords?.some(k => k.includes(qw) || qw.includes(k))) score += 5;
						}
						// KeyPoint match: checks asset.title & keywords (English) + asset.tagsId (Indonesian)
						for (const kw of keyWords) {
							if (asset.title?.toLowerCase().includes(kw)) score += 7;
							else if (asset.keywords?.some(k => k.includes(kw) || kw.includes(k))) score += 5;
							if (asset.tagsId?.some(t => t.includes(kw) || kw.includes(t))) score += 6;
						}
						// Narration words match: checks asset.title & keywords (English) + asset.tagsId (Indonesian)
						for (const nw of narWords) {
							if (asset.title?.toLowerCase().includes(nw)) score += 4;
							else if (asset.keywords?.some(k => k.includes(nw) || nw.includes(k))) score += 3;
							if (asset.tagsId?.some(t => t === nw)) score += 3;
							else if (asset.tagsId?.some(t => t.includes(nw) || nw.includes(t))) score += 2;
						}
						return { asset, score };
					});

					const unusedScored = scored.filter(s => !usedAssetUrls.has(s.asset.url) && s.asset.url !== prevImageUrl);
					unusedScored.sort((a, b) => b.score - a.score);

					// If we have high scoring unused matches (> 0): pick randomly among top 3 highest scores
					// This ensures both high semantic relevance AND natural variety across consecutive generations!
					if (unusedScored.length > 0 && unusedScored[0].score > 0) {
						const topScore = unusedScored[0].score;
						const topCandidates = unusedScored.filter(s => s.score >= Math.max(1, topScore - 3)).slice(0, 4);
						matchedAsset = topCandidates[Math.floor(Math.random() * topCandidates.length)].asset;
					}

					// Fallback: pick best scoring non-adjacent asset or random unused
					if (!matchedAsset) {
						if (unusedScored.length > 0) {
							matchedAsset = unusedScored[Math.floor(Math.random() * Math.min(10, unusedScored.length))].asset;
						} else {
							const nonAdjacent = scored.filter(s => s.asset.url !== prevImageUrl);
							nonAdjacent.sort((a, b) => b.score - a.score);
							matchedAsset = nonAdjacent[0]?.asset || availableAssets[0];
						}
					}
				}

				if (matchedAsset) {
					usedAssetUrls.add(matchedAsset.url);
					prevImageUrl = matchedAsset.url;
					genProgress.stats.localFootage++;
					const queryLabel = sc.stickmanQuery ? `[Aksi: "${sc.stickmanQuery}"]` : `"${sc.visualQuery}"`;
					addGenLog('STICKMAN', `${queryLabel} ➡️ ${matchedAsset.title.slice(0, 45)}`, 'success');
				}
				let voiceData = null;
				try {
					const isGemini = selectedVoiceEngine === 'gemini_tts' || isGeminiVoice(selectedVoiceId);
					const engineLabel = isGemini ? 'GEMINI-TTS' : 'EDGE-TTS';
					addGenLog(engineLabel, `Voiceover adegan ${i+1} (${selectedAudioEffect})...`, 'info');

					// Add pacing delay for Gemini to avoid burst rate limit
					if (isGemini && i > 0) {
						await new Promise((r) => setTimeout(r, 800));
					}

					const endpoint = isGemini ? '/api/gemini-tts' : '/api/edge-tts';
					const bodyPayload = isGemini
						? {
								text: sc.narration,
								voiceId: selectedVoiceId || DEFAULT_GEMINI_VOICE_ID,
								apiKey: geminiApiKey,
								audioEffect: selectedAudioEffect || 'cinematic_deep'
							}
						: {
								text: sc.narration,
								voiceId: selectedVoiceId || 'id-ID-ArdiNeural',
								pitch: `${customPitchHz}Hz`,
								rate: `${customRatePct >= 0 ? '+' : ''}${customRatePct}%`,
								customBass: customBassDb,
								audioEffect: selectedAudioEffect || 'cinematic_deep'
							};

					const ttsRes = await fetch(endpoint, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(bodyPayload)
					});
					voiceData = await ttsRes.json();

					// Graceful fallback to Edge TTS if Gemini hits 429 rate limit
					if (isGemini && (!voiceData?.success || voiceData?.error?.includes('429') || voiceData?.error?.toLowerCase().includes('kuota'))) {
						addGenLog('GEMINI-QUOTA', `Adegan ${i+1}: Kuota Gemini tercapai, dialihkan otomatis ke Edge TTS agar video tetap jadi!`, 'warn');
						try {
							const fallbackVoice = selectedVoiceId.startsWith('en-') ? 'en-US-ChristopherNeural' : 'id-ID-ArdiNeural';
							const edgeRes = await fetch('/api/edge-tts', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									text: sc.narration,
									voiceId: fallbackVoice,
									pitch: `${customPitchHz}Hz`,
									rate: `${customRatePct >= 0 ? '+' : ''}${customRatePct}%`,
									customBass: customBassDb,
									audioEffect: selectedAudioEffect || 'cinematic_deep'
								})
							});
							voiceData = await edgeRes.json();
							if (voiceData?.success) {
								genProgress.stats.ttsClips++;
								addGenLog('EDGE-TTS', `Audio cadangan adegan ${i+1} siap (${voiceData.duration}s)`, 'success');
							}
						} catch (edgeErr) {
							console.warn('Edge fallback error:', edgeErr);
						}
					} else if (voiceData?.success) {
						genProgress.stats.ttsClips++;
						addGenLog(engineLabel, `Audio siap ${voiceData.duration}s`, 'success');
					} else if (voiceData?.error) {
						addGenLog('WARN', `${engineLabel}: ${voiceData.error}`, 'warn');
					}
				} catch (e) {
					addGenLog('WARN', `TTS gagal adegan ${i+1}: ${e.message}`, 'warn');
				}
				const kp = resolveKeyPoint(sc);
				const imgUrl = matchedAsset ? matchedAsset.url : '';
				let textSide = 'right';
				if (imgUrl) {
					try { textSide = await detectEmptySide(imgUrl); } catch {}
				}
				if (kp) addGenLog('AI-POINT', `Poin: "${kp}"`, 'info');
				const initialAlign = textSide === 'right' ? 'right' : 'left';
				populated.push({
					...sc,
					image: imgUrl,
					imageTitle: matchedAsset ? matchedAsset.title : 'Illustration',
					keyPoint: kp,
					textSide,
					layoutSide: textSide,
					textAlign: initialAlign,
					textAnim: stickmanAnim,
					textIdleMotion: stickmanTextIdleMotion,
					textColorTop: stickmanTextColorTop,
					textColorBottom: stickmanTextColorBottom,
					fontSize: stickmanFontSize,
					imageAnim: stickmanImageAnim,
					idleMotion: stickmanIdleMotion,
					doodleType: stickmanDoodle,
					sfxType: 'none',
					textOffsetX: 0,
					textOffsetY: 0,
					textRotate: stickmanTextRotate,
					textScale: stickmanTextScale,
					voiceAudioUrl: voiceData?.staticAudioUrl || voiceData?.audioUrl || null,
					audioDuration: voiceData?.duration || 4,
					wordTimings: voiceData?.wordTimings || []
				});
			}
			scenes = populated;
			activeSceneIndex = 0;
			selectScene(0);
			genProgress.percent = 100;
			addGenLog('DONE', `Selesai! ${scenes.length} adegan siap (pacing visual 5-7 detik)`, 'success');
			setTimeout(() => { isGenerating = false; }, 800);
		} catch (err) {
			addGenLog('ERROR', `Gagal: ${err.message}`, 'error');
			isGenerating = false;
		}
	}

	let autoAdvancePlay = $state(true);

	function getActiveAudio() {
		return activePlayerId === 'A' ? audioElA : audioElB;
	}

	function getInactiveAudio() {
		return activePlayerId === 'A' ? audioElB : audioElA;
	}

	function preloadNextAudio() {
		const nextScene = scenes[activeSceneIndex + 1];
		const nextUrl = nextScene?.voiceAudioUrl;
		const inactive = getInactiveAudio();
		if (nextUrl && inactive) {
			if (inactive.src !== nextUrl) {
				inactive.src = nextUrl;
			}
			inactive.load();
		}
	}

	function playActiveSceneAudio() {
		if (!isPlaying || !currentScene?.voiceAudioUrl) return;
		const curUrl = currentScene.voiceAudioUrl;
		const active = getActiveAudio();
		if (!active) return;

		if (active.src !== curUrl) {
			active.src = curUrl;
			active.load();
		}

		const playPromise = active.play();
		if (playPromise !== undefined) {
			playPromise.catch(() => {
				active.addEventListener('canplay', () => {
					if (isPlaying) active.play().catch(() => {});
				}, { once: true });
			});
		}

		preloadNextAudio();
	}

	function onVoiceAudioEnded(fromPlayer) {
		if (fromPlayer !== activePlayerId) return;
		if (isPlaying && autoAdvancePlay && activeSceneIndex < scenes.length - 1) {
			// Natural 0.20s (200ms) breathing pause between scenes
			setTimeout(() => {
				if (!isPlaying) return;
				activeSceneIndex++;
				activePlayerId = activePlayerId === 'A' ? 'B' : 'A';

				const newActive = getActiveAudio();
				if (newActive && currentScene?.voiceAudioUrl) {
					if (newActive.src !== currentScene.voiceAudioUrl) {
						newActive.src = currentScene.voiceAudioUrl;
						newActive.load();
					}
					const p = newActive.play();
					if (p !== undefined) {
						p.catch(() => {
							newActive.addEventListener('canplay', () => {
								if (isPlaying) newActive.play().catch(() => {});
							}, { once: true });
						});
					}
				}

				// Preload subsequent scene into the now idle player
				preloadNextAudio();
			}, 200);
		} else {
			isPlaying = false;
		}
	}

	function selectScene(idx) {
		if (idx < 0 || idx >= scenes.length) return;
		activeSceneIndex = idx;
		if (isPlaying) {
			playActiveSceneAudio();
		} else {
			const active = getActiveAudio();
			if (active && scenes[idx]?.voiceAudioUrl) {
				active.src = scenes[idx].voiceAudioUrl;
				active.load();
			}
			preloadNextAudio();
		}
	}

	async function togglePlay() {
		if (isPlaying) {
			isPlaying = false;
			audioElA?.pause();
			audioElB?.pause();
		} else {
			if (!currentScene?.voiceAudioUrl) {
				await regenerateVoiceoverForScene(activeSceneIndex);
			}
			if (currentScene?.voiceAudioUrl) {
				isPlaying = true;
				playActiveSceneAudio();
			}
		}
	}

	async function splitCurrentScene() {
		if (!currentScene || isGenerating) return;
		const words = (currentScene.narration || '').split(/\s+/).filter(Boolean);
		if (words.length < 5) return;

		const { splitSentenceIntoPacedSegments } = await import('$lib/services/scriptAnalyzer.js');
		const midWords = Math.ceil(words.length / 2);
		const parts = splitSentenceIntoPacedSegments(currentScene.narration, Math.max(5, midWords));
		if (parts.length < 2) return;

		const firstPart = parts[0];
		const secondPart = parts.slice(1).join(' ');

		currentScene.narration = firstPart;
		currentScene.audioDuration = Math.max(3, Number((firstPart.split(/\s+/).length * 0.45).toFixed(1)));

		// Find a unique random asset not currently used in scenes to guarantee different visuals
		const usedImages = new Set(scenes.map(s => s.image).filter(Boolean));
		const candidateAssets = availableAssets.filter(a => !usedImages.has(a.url) && a.url !== currentScene.image);
		const nextAsset = candidateAssets.length > 0
			? candidateAssets[Math.floor(Math.random() * candidateAssets.length)]
			: availableAssets.filter(a => a.url !== currentScene.image)[Math.floor(Math.random() * (availableAssets.length - 1))] || availableAssets[0];

		let nextTextSide = 'right';
		if (nextAsset?.url) {
			try {
				nextTextSide = await detectEmptySide(nextAsset.url);
			} catch {
				nextTextSide = currentScene.textSide === 'right' ? 'left' : 'right';
			}
		}

		const newScene = {
			...currentScene,
			id: `scene-split-${Date.now()}`,
			index: activeSceneIndex + 2,
			narration: secondPart,
			keyPoint: secondPart.slice(0, 28),
			chapter: null,
			image: nextAsset ? nextAsset.url : currentScene.image,
			imageTitle: nextAsset ? nextAsset.title : currentScene.imageTitle,
			textSide: nextTextSide,
			layoutSide: nextTextSide,
			textAlign: nextTextSide === 'right' ? 'right' : 'left',
			textOffsetX: 0,
			textOffsetY: 0,
			voiceAudioUrl: null,
			audioDuration: Math.max(3, Number((secondPart.split(/\s+/).length * 0.45).toFixed(1)))
		};

		scenes.splice(activeSceneIndex + 1, 0, newScene);
		scenes = [...scenes];

		// Trigger voiceover generation for both split scenes
		regenerateVoiceoverForScene(activeSceneIndex);
		regenerateVoiceoverForScene(activeSceneIndex + 1);
	}

	let isRandomizingDuplicates = $state(false);

	async function randomizeDuplicateSceneImages() {
		if (!scenes.length || isRandomizingDuplicates) return;
		isRandomizingDuplicates = true;
		try {
			const seenImages = new Set();
			let changedCount = 0;

			for (let i = 0; i < scenes.length; i++) {
				const sc = scenes[i];
				const prevImg = i > 0 ? scenes[i - 1].image : '';
				// Check if duplicate across project or identical to previous scene
				if (!sc.image || seenImages.has(sc.image) || sc.image === prevImg) {
					const unused = availableAssets.filter(a => !seenImages.has(a.url) && a.url !== prevImg && a.url !== sc.image);
					const chosen = unused.length > 0
						? unused[Math.floor(Math.random() * unused.length)]
						: availableAssets.filter(a => a.url !== prevImg)[Math.floor(Math.random() * (availableAssets.length - 1))] || availableAssets[0];

					if (chosen) {
						sc.image = chosen.url;
						sc.imageTitle = chosen.title;
						try {
							sc.textSide = await detectEmptySide(chosen.url);
						} catch {
							sc.textSide = sc.textSide === 'right' ? 'left' : 'right';
						}
						sc.layoutSide = sc.textSide;
						sc.textAlign = sc.textSide === 'right' ? 'right' : 'left';
						sc.textOffsetX = 0;
						sc.textOffsetY = 0;
						changedCount++;
					}
				}
				if (sc.image) seenImages.add(sc.image);
			}

			scenes = [...scenes];
			if (changedCount > 0) {
				addGenLog('STICKMAN', `Berhasil mengganti ${changedCount} gambar adegan yang sama dengan gambar random unik!`, 'success');
			} else {
				addGenLog('INFO', 'Semua gambar adegan sudah unik (tidak ada gambar duplikat).', 'info');
			}
		} finally {
			isRandomizingDuplicates = false;
		}
	}

	let isAutoSplitting = $state(false);

	async function autoSplitLongScenes() {
		if (!scenes.length || isAutoSplitting || isGenerating) return;
		isAutoSplitting = true;
		try {
			const { splitSentenceIntoPacedSegments } = await import('$lib/services/scriptAnalyzer.js');
			const newScenes = [];
			const usedImages = new Set(scenes.map(s => s.image).filter(Boolean));
			let splitCount = 0;

			for (let i = 0; i < scenes.length; i++) {
				const sc = scenes[i];
				const words = (sc.narration || '').split(/\s+/).filter(Boolean);
				// Scene duration > 6.0s or > 13 words
				if ((sc.audioDuration > 6.0 || words.length > 13) && words.length >= 6) {
					const chunks = splitSentenceIntoPacedSegments(sc.narration, 12);
					if (chunks.length > 1) {
						splitCount++;
						for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
							const chunkText = chunks[cIdx];
							if (cIdx === 0) {
								sc.narration = chunkText;
								sc.audioDuration = Math.max(3, Number((chunkText.split(/\s+/).length * 0.45).toFixed(1)));
								newScenes.push(sc);
							} else {
								const candidate = availableAssets.filter(a => !usedImages.has(a.url) && a.url !== sc.image);
								const chosen = candidate.length > 0
									? candidate[Math.floor(Math.random() * candidate.length)]
									: availableAssets[Math.floor(Math.random() * availableAssets.length)];
								let side = 'right';
								if (chosen?.url) {
									usedImages.add(chosen.url);
									try {
										side = await detectEmptySide(chosen.url);
									} catch {
										side = sc.textSide === 'right' ? 'left' : 'right';
									}
								}
								newScenes.push({
									...sc,
									id: `scene-split-${Date.now()}-${cIdx}`,
									narration: chunkText,
									keyPoint: chunkText.slice(0, 28),
									chapter: null,
									image: chosen ? chosen.url : sc.image,
									imageTitle: chosen ? chosen.title : sc.imageTitle,
									textSide: side,
									layoutSide: side,
									textAlign: side === 'right' ? 'right' : 'left',
									textOffsetX: 0,
									textOffsetY: 0,
									voiceAudioUrl: null,
									audioDuration: Math.max(3, Number((chunkText.split(/\s+/).length * 0.45).toFixed(1)))
								});
							}
						}
						continue;
					}
				}
				newScenes.push(sc);
			}

			if (splitCount > 0) {
				scenes = newScenes;
				addGenLog('INFO', `Otomatis memotong ${splitCount} adegan berdurasi >6 detik dan mengganti dengan gambar random baru!`, 'success');
				for (let j = 0; j < scenes.length; j++) {
					if (!scenes[j].voiceAudioUrl) {
						regenerateVoiceoverForScene(j);
					}
				}
			} else {
				addGenLog('INFO', 'Tidak ada adegan yang melebihi 6 detik.', 'info');
			}
		} finally {
			isAutoSplitting = false;
		}
	}

	async function startStickmanRender() {
		if (!scenes.length || isRendering) return;
		isRendering = true; renderError = null; downloadUrl = null; renderProgress = 5; renderStep = 'Menyiapkan render Stickman...';
		try {
			const effBgmTrack = BGM_TRACKS.find(t => t.id === selectedBgmId);
			const effBgmUrl = effBgmTrack && effBgmTrack.url ? effBgmTrack.url : null;
			const res = await fetch('/api/render-stickman', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scenes,
					renderQuality,
					isShorts,
					videoTitle: videoTitle || script.slice(0, 80),
					stickmanTextColor: stickmanTextColorBottom,
					stickmanTextColorTop,
					stickmanTextColorBottom,
					stickmanFontSize,
					stickmanFontFamily,
					stickmanAnim,
					stickmanTextAlign,
					stickmanImageAnim,
					stickmanIdleMotion,
					stickmanTextIdleMotion,
					stickmanDoodle,
					stickmanSfx,
					previewCanvasHeight: canvasHeight || 430,
					videoPadding: stickmanVideoPadding,
					canvasTheme: stickmanBgTheme,
					bgmUrl: effBgmUrl,
					bgmVolume: Number(bgmVolume)
				})
			});
			if (!res.ok || !res.body) throw new Error(`Server ${res.statusText}`);
			const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = '';
			while (true) {
				const { done, value } = await reader.read(); if (done) break;
				buf += decoder.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop() ?? '';
				for (const line of lines) {
					if (!line.startsWith('data:')) continue;
					try {
						const p = JSON.parse(line.slice(5).trim());
						if (p.progress !== undefined) renderProgress = p.progress;
						if (p.step) renderStep = p.step;
						if (p.error) throw new Error(p.error);
						if (p.done) { downloadUrl = p.downloadUrl; downloadFilename = p.filename || 'stickman.mp4'; }
					} catch (e) { if (e.message && !String(e.message).startsWith('Unexpected')) throw e; }
				}
			}
			if (!downloadUrl) throw new Error('Render selesai tanpa file');
		} catch (e) { renderError = e.message; } finally { isRendering = false; }
	}
</script>

<svelte:window onpointermove={onWindowPointerMove} onpointerup={onWindowPointerUp} onkeydown={onWindowKeydown} />

<svelte:head>
	<title>Stickman Studio – Whiteboard & Sketch Animation | AI Video Studio</title>
	<meta name="description" content="Buat video animasi stickman whiteboard & sketchbook edukasi dengan AI: 5-langkah wizard, 6 tema kertas, suara narator neural, dan render 1080p." />
</svelte:head>

<div class="stickman-studio">
	<!-- ============================================================ -->
	<!-- WIZARD HEADER -->
	<!-- ============================================================ -->
	<header class="wiz-header">
		<div class="wiz-header-inner">
			<div class="wiz-brand">
				<a href="/" class="wiz-back-btn"><ArrowLeft size={16}/></a>
				<div class="wiz-title-block">
					<div class="wiz-badge"><Sparkles size={13}/> Stickman Studio</div>
					<h1 class="wiz-title">Whiteboard <span class="wiz-gradient">Animator</span></h1>
				</div>
			</div>

			<!-- Step bar -->
			<nav class="wiz-stepbar" aria-label="Wizard Navigation">
				{#each [
					{ n: 1, icon: '🎯', label: 'Format & Topik' },
					{ n: 2, icon: '📝', label: 'Naskah & Pacing' },
					{ n: 3, icon: '🧍', label: 'Pose & Karakter' },
					{ n: 4, icon: '🎨', label: 'Papan & Audio' },
					{ n: 5, icon: '🎬', label: 'Preview & Render' }
				] as s}
					<button
						class="wiz-step"
						class:active={wizardStep === s.n}
						class:done={wizardStep > s.n || (scenes.length > 0 && s.n < wizardStep)}
						onclick={() => { wizardStep = s.n; }}
						disabled={!scenes.length && wizardStep < s.n && (!script.trim() || s.n > 2)}
						title="Step {s.n}: {s.label}"
					>
						<span class="wiz-step-dot">
							{#if wizardStep > s.n || (scenes.length > 0 && wizardStep !== s.n)}✓{:else}{s.n}{/if}
						</span>
						<span class="wiz-step-label">{s.label}</span>
						{#if s.n < 5}<span class="wiz-step-line"></span>{/if}
					</button>
				{/each}
			</nav>

			<!-- Header Whisper Audio Import Button -->
			<div class="wiz-header-whisper">
				<button
					type="button"
					class="wiz-btn-groq-header"
					onclick={() => showWhisperModal = true}
					title="Buat video langsung dari 1 file audio rekaman utuh (Groq Whisper AI)"
				>
					<Mic size={13} class="text-emerald-400" />
					<span class="wiz-groq-label">Dari Audio Utuh</span>
					<span class="header-groq-badge">WHISPER</span>
				</button>
			</div>

			<!-- Aspect toggle (always visible) -->
			<div class="wiz-aspect-toggle">
				<button class="asp-pill" class:active={!isShorts} onclick={() => { if (isShorts) toggleShorts(); }} title="16:9 Landscape">
					<span>▬</span><span class="asp-txt">16:9</span>
				</button>
				<button class="asp-pill" class:active={isShorts} onclick={() => { if (!isShorts) toggleShorts(); }} title="9:16 Shorts">
					<span>▮</span><span class="asp-txt">9:16</span><span class="asp-badge">VIRAL</span>
				</button>
			</div>
		</div>
	</header>

	<!-- ============================================================ -->
	<!-- STEP CONTENT -->
	<!-- ============================================================ -->
	<main class="wiz-main">

		<!-- ==================== STEP 1: FORMAT & TOPIK ==================== -->
		{#if wizardStep === 1}
		<div class="wiz-step-content" id="step-1">
			<div class="wiz-step-hero">
				<div class="wiz-step-num">01</div>
				<div>
					<h2 class="wiz-step-title">Format & Topik Video</h2>
					<p class="wiz-step-desc">Pilih format video, kategori konten, dan buat judul viral berkualifikasi CTR tinggi.</p>
				</div>
			</div>

			<!-- Quick Full Audio Banner -->
			<div class="wiz-card wiz-audio-banner">
				<div class="wiz-audio-banner-left">
					<div class="wiz-audio-icon">
						<Mic size={22} />
					</div>
					<div>
						<div class="wiz-audio-banner-title">
							<span>Punya 1 File Audio Rekaman Utuh?</span>
							<span class="wiz-badge-groq">⚡ GROQ WHISPER-LARGE-V3</span>
						</div>
						<div class="wiz-audio-banner-desc">
							Upload suara rekaman Anda dari awal sampai akhir. AI akan mentranskrip otomatis, memotong per adegan, dan mencarikan gambar stickman yang cocok!
						</div>
					</div>
				</div>
				<button type="button" class="wiz-audio-banner-btn" onclick={() => showWhisperModal = true}>
					<Sparkles size={14} />
					<span>Import Audio Sekarang →</span>
				</button>
			</div>

			<div class="wiz-grid-2">
				<!-- Judul Video -->
				<div class="wiz-card">
					<div class="wiz-card-head">
						<span class="wiz-card-title">🎯 Judul Video (High-CTR AI)</span>
						<div class="wiz-card-actions">
							<button type="button" class="wiz-btn-sm wiz-btn-accent" onclick={() => generateQuickAiTitle()} disabled={isGeneratingQuickTitle} title="Ide Cepat 1 Judul AI">
								{#if isGeneratingQuickTitle}<RefreshCw size={12} class="spin"/>{:else}<Sparkles size={12}/>{/if}
								<span>🎲 Ide Cepat</span>
							</button>
							<button type="button" class="wiz-btn-sm wiz-btn-fire" onclick={() => showTitleModal = true}>
								<Flame size={12}/><span>🔥 Riset 10 Opsi</span>
							</button>
						</div>
					</div>
					<input type="text" bind:value={videoTitle} placeholder="Ketik topik atau klik tombol di atas..." class="wiz-input"/>
					{#if videoTitle}<span class="wiz-char-count">{videoTitle.length} karakter</span>{/if}

					<div class="wiz-niche-chips">
						<span class="wiz-chips-label">Kategori:</span>
						<button type="button" class="wiz-niche-chip" onclick={() => generateQuickAiTitle('wealth_finance')}>💸 Uang/Finansial</button>
						<button type="button" class="wiz-niche-chip" onclick={() => generateQuickAiTitle('dark_psychology')}>🧠 Psikologi Gelap</button>
						<button type="button" class="wiz-niche-chip" onclick={() => generateQuickAiTitle('investigation')}>🕵️ Investigasi</button>
						<button type="button" class="wiz-niche-chip" onclick={() => generateQuickAiTitle('science_paradox')}>⏳ Paradoks/AI</button>
						<button type="button" class="wiz-niche-chip" onclick={() => generateQuickAiTitle('stoic_philosophy')}>🏛️ Stoikisme</button>
						<button type="button" class="wiz-niche-chip" onclick={() => generateQuickAiTitle('business_downfall')}>🏢 Kasus Bisnis</button>
					</div>
				</div>

				<!-- Preset Naskah Cepat -->
				<div class="wiz-card">
					<div class="wiz-card-head">
						<span class="wiz-card-title">⚡ Preset Naskah Cepat</span>
						<div class="wiz-preset-lang">
							<button type="button" class="wiz-lang-btn" class:active={presetLangFilter==='all'} onclick={() => presetLangFilter='all'}>Semua</button>
							<button type="button" class="wiz-lang-btn" class:active={presetLangFilter==='id'} onclick={() => presetLangFilter='id'}>🇮🇩 ID</button>
							<button type="button" class="wiz-lang-btn" class:active={presetLangFilter==='en'} onclick={() => presetLangFilter='en'}>🇺🇸 EN</button>
						</div>
					</div>
					<div class="wiz-preset-pills">
						{#each filteredPresets as p}
							<button type="button" class="wiz-preset-pill" class:active={script === p.text} onclick={() => { script = p.text; videoTitle = p.title; if (p.lang === 'en' && selectedVoiceId.startsWith('id-ID')) selectedVoiceId = 'en-US-ChristopherNeural'; }}>
								{#if p.lang === 'en'}<span class="wiz-flag">EN</span>{/if}
								<span>{p.title.split(':')[0]}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="wiz-step-actions">
				<button class="wiz-btn-primary" onclick={() => wizardStep = 2} disabled={!videoTitle && !script.trim()}>
					<span>Lanjut ke Naskah</span><span>→</span>
				</button>
			</div>
		</div>
		{/if}

		<!-- ==================== STEP 2: NASKAH & PACING ==================== -->
		{#if wizardStep === 2}
		<div class="wiz-step-content" id="step-2">
			<div class="wiz-step-hero">
				<div class="wiz-step-num">02</div>
				<div>
					<h2 class="wiz-step-title">Naskah & Pacing Cerita</h2>
					<p class="wiz-step-desc">Tulis atau generate naskah naratif, lalu optimalkan gaya bicara stickman storytelling.</p>
				</div>
			</div>

			<div class="wiz-card">
				<div class="wiz-card-head">
					<span class="wiz-card-title">📝 Naskah Video</span>
					<div class="wiz-card-actions">
						<button type="button" class="wiz-btn-sm wiz-btn-groq" onclick={() => showWhisperModal = true} title="Import 1 file rekaman audio lengkap">
							<Mic size={12}/><span>🎙️ Import Audio Utuh</span>
						</button>
						<button type="button" class="wiz-btn-sm wiz-btn-accent" onclick={handleHumanize} disabled={isHumanizing || !script.trim()} title="Humanize: ubah gaya bahasa jadi santai & dramatis">
							<Sparkles size={12}/><span>{isHumanizing ? 'Memproses...' : '✨ Humanize Naskah'}</span>
						</button>
						<button type="button" class="wiz-btn-sm wiz-btn-fire" onclick={() => showScriptModal = true}>
							<Flame size={12}/><span>AI Script Generator</span>
						</button>
					</div>
				</div>
				{#if humanizeNotice}
					<div class="wiz-notice"><Sparkles size={13}/><span>{humanizeNotice}</span></div>
				{/if}
				<textarea class="wiz-textarea" bind:value={script} placeholder="Tulis naskah atau klik 'AI Script Generator' untuk meracik naskah berbobot..." rows="10"></textarea>
				<div class="wiz-script-stats">
					<span class="wiz-stat-pill">📊 ~{estimatedScenes} Adegan</span>
					<span class="wiz-stat-pill">📝 {wordCount} Kata</span>
					<span class="wiz-format-hint">Format: <code>[Bab X: Judul | Deskripsi]</code></span>
				</div>
			</div>

			<div class="wiz-step-actions">
				<button class="wiz-btn-secondary" onclick={() => wizardStep = 1}><span>←</span><span>Format & Judul</span></button>
				<button class="wiz-btn-primary" onclick={() => wizardStep = 3} disabled={!script.trim()}>
					<span>Lanjut ke Pose & Karakter</span><span>→</span>
				</button>
			</div>
		</div>
		{/if}

		<!-- ==================== STEP 3: POSE & KARAKTER ==================== -->
		{#if wizardStep === 3}
		<div class="wiz-step-content" id="step-3">
			<div class="wiz-step-hero">
				<div class="wiz-step-num">03</div>
				<div>
					<h2 class="wiz-step-title">Pose Karakter & Ilustrasi Sketsa</h2>
					<p class="wiz-step-desc">Kurasi pose stickman, animasi masuk, dan gerak idle — DeepSeek AI sudah memilihkan pose awal untuk setiap adegan.</p>
				</div>
			</div>

			{#if scenes.length > 0}
				<div class="wiz-imported-audio-notice">
					<Sparkles size={16} class="text-indigo-400" />
					<span>🎉 <strong>{scenes.length} Adegan</strong> dari audio rekaman telah tersusun! Atur animasi pose di bawah ini, lalu klik <strong>Lanjut ke Papan & Audio (Step 4)</strong>.</span>
				</div>
			{/if}

			<div class="wiz-grid-2">
				<!-- Animasi Masuk Gambar -->
				<div class="wiz-card">
					<div class="wiz-card-head"><span class="wiz-card-title">✨ Animasi Masuk Gambar</span></div>
					<div class="wiz-anim-grid">
						{#each IMAGE_ANIM_OPTIONS as opt}
							<button type="button" class="wiz-anim-pill" class:on={stickmanImageAnim === opt.id} onclick={() => stickmanImageAnim = opt.id}>{opt.label}</button>
						{/each}
					</div>
					{#if scenes.length > 0}
						<button type="button" class="wiz-apply-all" onclick={applyImageAnimToAll}>Terapkan ke Semua Adegan</button>
					{/if}
				</div>

				<!-- Gerak Idle -->
				<div class="wiz-card">
					<div class="wiz-card-head"><span class="wiz-card-title">📳 Gerak Gambar (Idle Motion)</span></div>
					<div class="wiz-anim-grid">
						{#each IDLE_MOTION_OPTIONS as opt}
							<button type="button" class="wiz-anim-pill" class:on={stickmanIdleMotion === opt.id} onclick={() => stickmanIdleMotion = opt.id}>{opt.label}</button>
						{/each}
					</div>
					{#if scenes.length > 0}
						<button type="button" class="wiz-apply-all" onclick={applyIdleMotionToAll}>Terapkan ke Semua Adegan</button>
					{/if}
				</div>

				<!-- Posisi Teks -->
				<div class="wiz-card">
					<div class="wiz-card-head">
						<span class="wiz-card-title">📐 Tata Letak Teks</span>
						{#if scenes.length > 0}
							<button type="button" class="wiz-btn-sm wiz-btn-accent" onclick={autoAlignAllScenes} title="Deteksi otomatis ruang kosong pada semua adegan">
								<span>🎯 Auto Ruang Kosong</span>
							</button>
						{/if}
					</div>
					<div class="wiz-anim-grid">
						{#each POS_OPTIONS as pos}
							<button type="button" class="wiz-anim-pill" class:on={stickmanTextAlign === pos.id} onclick={() => setTextAlign(pos.id)}>{pos.label}</button>
						{/each}
					</div>
					{#if scenes.length > 0}
						<div class="wiz-align-actions">
							<button type="button" class="wiz-apply-all" onclick={applyAlignToAll}>Terapkan Posisi Ini ke Semua</button>
							<button type="button" class="wiz-apply-all wiz-apply-auto" onclick={autoAlignAllScenes}>🎯 Deteksi Ruang Kosong (Semua Adegan)</button>
						</div>
					{/if}
				</div>

				<!-- Bank Gambar -->
				<div class="wiz-card">
					<div class="wiz-card-head"><span class="wiz-card-title">🖼️ Bank Pose Stickman</span>
						{#if scenes.length > 0}
							<button type="button" class="wiz-btn-sm wiz-btn-accent" onclick={openImagePicker}>Ganti Gambar Adegan Ini</button>
						{/if}
					</div>
					<div class="wiz-asset-search-row">
						<input type="text" bind:value={imagePickerFilter} placeholder="🔍 Cari pose (uang, sedih, laptop, ide...)" class="wiz-search-input"/>
						<div class="wiz-cat-pills">
							<button type="button" class="wiz-cat-pill" class:active={selectedImageCategory==='all'} onclick={() => selectedImageCategory='all'}>✨ Semua</button>
							{#each stickmanCategories as cat}
								<button type="button" class="wiz-cat-pill" class:active={selectedImageCategory===cat.id} onclick={() => selectedImageCategory=cat.id}>{cat.label}</button>
							{/each}
						</div>
					</div>
					<div class="wiz-mini-asset-grid">
						{#each filteredAssets.slice(0,24) as asset}
							<button type="button" class="wiz-asset-thumb" class:selected={currentScene?.image === asset.url} onclick={() => applyAssetToScene(asset)} title={asset.title}>
								<img src={asset.url} alt={asset.title} loading="lazy"/>
								{#if currentScene?.image === asset.url}<span class="wiz-thumb-check">✓</span>{/if}
							</button>
						{/each}
						{#if filteredAssets.length > 24}<p class="wiz-more-hint">+{filteredAssets.length - 24} lainnya — cari nama spesifik di atas</p>{/if}
					</div>
				</div>
			</div>

			<div class="wiz-step-actions">
				<button class="wiz-btn-secondary" onclick={() => wizardStep = 2}><span>←</span><span>Naskah</span></button>
				<button class="wiz-btn-primary" onclick={() => wizardStep = 4}>
					<span>Lanjut ke Papan & Audio</span><span>→</span>
				</button>
			</div>
		</div>
		{/if}

		<!-- ==================== STEP 4: PAPAN & AUDIO ==================== -->
		{#if wizardStep === 4}
		<div class="wiz-step-content" id="step-4">
			<div class="wiz-step-hero">
				<div class="wiz-step-num">04</div>
				<div>
					<h2 class="wiz-step-title">Tema Papan Tulis, Tipografi & Audio</h2>
					<p class="wiz-step-desc">Atur estetika kertas sketsa, font kapur, suara narator, dan musik latar.</p>
				</div>
			</div>

			<div class="wiz-grid-2">
				<!-- 6 Tema Papan -->
				<div class="wiz-card">
					<div class="wiz-card-head"><span class="wiz-card-title">🖼️ Tema Papan Tulis / Kertas</span></div>
					<div class="wiz-bg-grid">
						{#each BG_THEME_OPTIONS as tOpt}
							<button type="button" class="wiz-bg-card" class:on={stickmanBgTheme === tOpt.id} onclick={() => setStickmanTheme(tOpt.id)} title={tOpt.desc}>
								<span class="wiz-bg-icon">{tOpt.label.split(' ')[0]}</span>
								<span class="wiz-bg-name">{tOpt.label.split(' ').slice(1).join(' ')}</span>
								<span class="wiz-bg-desc">{tOpt.desc}</span>
							</button>
						{/each}
					</div>
					<!-- Safe Area Padding -->
					<div class="wiz-padding-row">
						<span class="wiz-label">⭕ Safe Area Margin:</span>
						<div class="wiz-anim-grid">
							{#each VIDEO_PADDING_OPTIONS as pOpt}
								<button type="button" class="wiz-anim-pill" class:on={stickmanVideoPadding === pOpt.id} onclick={() => stickmanVideoPadding = pOpt.id} title={pOpt.desc}>{pOpt.label}</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Tipografi -->
				<div class="wiz-card">
					<div class="wiz-card-head"><span class="wiz-card-title">✏️ Tipografi Kapur Tulis</span></div>
					<!-- Font Family -->
					<div class="wiz-font-row">
						<span class="wiz-label">Jenis Font:</span>
						<select bind:value={stickmanFontFamily} class="wiz-select">
							{#each FONT_OPTIONS as f}<option value={f.value}>{f.label}</option>{/each}
						</select>
					</div>
					<!-- Font Size Presets -->
					<div class="wiz-font-row">
						<span class="wiz-label">Ukuran: <strong>{currentScene?.fontSize || stickmanFontSize}px</strong></span>
						<div class="wiz-anim-grid">
							{#each FONT_SIZE_PRESETS as p}
								<button type="button" class="wiz-anim-pill" class:on={Math.abs((currentScene?.fontSize || stickmanFontSize) - p.val) <= 3} onclick={() => setSceneFontSize(p.val)}>{p.label}</button>
							{/each}
						</div>
					</div>
					<!-- Dual Color -->
					<div class="wiz-color-section">
						<div class="wiz-color-row">
							<span class="wiz-label">Warna Atas (Headline):</span>
							<div class="wiz-color-dots">
								{#each TOP_COLOR_PRESETS as c}
									<button type="button" class="wiz-color-dot" class:on={(currentScene?.textColorTop || stickmanTextColorTop) === c} style="background:{c}" onclick={() => currentScene ? setSceneTextColorTop(c) : (stickmanTextColorTop = c)}></button>
								{/each}
								<input type="color" value={currentScene?.textColorTop || stickmanTextColorTop} oninput={(e) => currentScene ? setSceneTextColorTop(e.currentTarget.value) : (stickmanTextColorTop = e.currentTarget.value)} class="wiz-color-picker"/>
							</div>
						</div>
						<div class="wiz-color-row">
							<span class="wiz-label">Warna Bawah (Bodi):</span>
							<div class="wiz-color-dots">
								{#each BOTTOM_COLOR_PRESETS as c}
									<button type="button" class="wiz-color-dot" class:on={(currentScene?.textColorBottom || stickmanTextColorBottom) === c} style="background:{c}" onclick={() => currentScene ? setSceneTextColorBottom(c) : (stickmanTextColorBottom = c)}></button>
								{/each}
								<input type="color" value={currentScene?.textColorBottom || stickmanTextColorBottom} oninput={(e) => currentScene ? setSceneTextColorBottom(e.currentTarget.value) : (stickmanTextColorBottom = e.currentTarget.value)} class="wiz-color-picker"/>
							</div>
						</div>
					</div>
					<!-- Text Animations -->
					<div class="wiz-font-row">
						<span class="wiz-label">Animasi Teks Masuk:</span>
						<div class="wiz-anim-grid">
							{#each ANIM_OPTIONS as a}
								<button type="button" class="wiz-anim-pill" class:on={(currentScene?.textAnim || stickmanAnim) === a.id} onclick={() => currentScene ? setSceneAnim(a.id) : (stickmanAnim = a.id)}>{a.label}</button>
							{/each}
						</div>
					</div>
					<div class="wiz-font-row">
						<span class="wiz-label">Efek Getar Teks:</span>
						<div class="wiz-anim-grid">
							{#each TEXT_IDLE_OPTIONS as t}
								<button type="button" class="wiz-anim-pill" class:on={(currentScene?.textIdleMotion || stickmanTextIdleMotion) === t.id} onclick={() => currentScene ? setSceneTextIdleMotion(t.id) : (stickmanTextIdleMotion = t.id)}>{t.label}</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Voiceover -->
				<div class="wiz-card">
					<div class="wiz-card-head">
						<span class="wiz-card-title">🎙️ Karakter Suara Narator</span>
						<div class="wiz-engine-tabs">
							<button
								type="button"
								class="wiz-engine-tab"
								class:active={selectedVoiceEngine === 'edge_tts'}
								onclick={() => setVoiceEngine('edge_tts')}
							>
								<Mic size={13} />
								<span>Edge TTS (Gratis)</span>
							</button>
							<button
								type="button"
								class="wiz-engine-tab gemini-tab"
								class:active={selectedVoiceEngine === 'gemini_tts'}
								onclick={() => setVoiceEngine('gemini_tts')}
							>
								<Sparkles size={13} />
								<span>Gemini AI Voice (Gratis API)</span>
								<span class="wiz-tab-badge">Baru</span>
							</button>
						</div>
					</div>

					{#if selectedVoiceEngine === 'gemini_tts'}
						<!-- Gemini API Key configuration box -->
						<div class="wiz-gemini-card">
							<div class="wiz-gemini-header">
								<div class="wiz-gemini-title">
									<Key size={15} class="gemini-key-icon" />
									<span>Google Gemini API Key</span>
									{#if geminiApiKey && geminiApiKey.trim().length > 15}
										<span class="wiz-key-badge saved"><Check size={11} /> Tersimpan</span>
									{:else}
										<span class="wiz-key-badge warning">Wajib Diisi</span>
									{/if}
								</div>
								<a
									href="https://aistudio.google.com/app/apikey"
									target="_blank"
									rel="noreferrer"
									class="wiz-gemini-link"
								>
									<ExternalLink size={12} />
									<span>Dapatkan API Key Gratis di Google AI Studio</span>
								</a>
							</div>

							<div class="wiz-key-input-row">
								<div class="wiz-key-input-wrap">
									<input
										type={showGeminiKey ? 'text' : 'password'}
										class="wiz-key-input"
										placeholder="Paste AI Studio API Key (AIzaSy...)"
										value={geminiApiKey}
										oninput={(e) => handleGeminiKeyChange(e.currentTarget.value)}
									/>
									<button
										type="button"
										class="wiz-key-toggle-btn"
										onclick={() => showGeminiKey = !showGeminiKey}
										title={showGeminiKey ? 'Sembunyikan' : 'Tampilkan'}
									>
										{#if showGeminiKey}<EyeOff size={14} />{:else}<Eye size={14} />{/if}
									</button>
								</div>
							</div>
							<div class="wiz-gemini-note">
								✨ <strong>Model Gemini Flash Audio (gemini-3.8-flash):</strong> Suara sangat ekspresif & hidup untuk Stickman Studio. Gratis hingga 1.500 request per hari di Google AI Studio.
							</div>
						</div>

						<!-- Gemini Voices List -->
						<div class="wiz-voice-grid">
							{#each GEMINI_TTS_VOICES as v}
								<div
									class="wiz-voice-card gemini-card"
									class:active={selectedVoiceId === v.id}
									onclick={() => selectedVoiceId = v.id}
									role="button"
									tabindex="0"
									onkeydown={(e) => e.key === 'Enter' && (selectedVoiceId = v.id)}
								>
									<span class="wiz-voice-avatar">{v.emoji}</span>
									<div class="wiz-voice-info">
										<div class="wiz-voice-title-row">
											<span class="wiz-voice-name">{v.name.split(' (')[0]}</span>
											<span class="wiz-gemini-pill">{v.category}</span>
										</div>
										<span class="wiz-voice-desc">{v.description}</span>
									</div>
									<button
										type="button"
										class="wiz-play-preview"
										class:playing={playingVoicePreviewId === v.id}
										onclick={(e) => toggleVoicePreview(v, e)}
										title="Tes Suara Karakter"
									>
										{playingVoicePreviewId === v.id ? '⏹' : '▶'}
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<div class="wiz-voice-grid">
							{#each QUICK_VOICES as v}
								<div class="wiz-voice-card" class:active={selectedVoiceId === v.id} onclick={() => selectedVoiceId = v.id} role="button" tabindex="0" onkeydown={(e) => e.key==='Enter' && (selectedVoiceId=v.id)}>
									<span class="wiz-voice-avatar">{v.emoji}</span>
									<div class="wiz-voice-info">
										<span class="wiz-voice-name">{v.name}</span>
										<span class="wiz-voice-sub">{v.lang === 'ID' ? 'Bahasa Indonesia' : 'English (US)'}</span>
									</div>
									{#if v.sampleUrl}
										<button type="button" class="wiz-play-preview" class:playing={playingVoicePreviewId === v.id} onclick={(e) => toggleVoicePreview(v, e)}>{playingVoicePreviewId === v.id ? '⏹' : '▶'}</button>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
					<!-- DSP Effects Preset -->
					<div class="wiz-card-head" style="margin-top:14px;"><span class="wiz-card-title">🎛️ Filter Vokal DSP & Preset</span></div>
					<div class="wiz-effect-grid">
						{#each AUDIO_EFFECT_PRESETS as eff}
							<div class="wiz-effect-chip" class:active={selectedAudioEffect === eff.id} onclick={() => selectAudioEffectPreset(eff)} role="button" tabindex="0" onkeydown={(e) => e.key==='Enter' && selectAudioEffectPreset(eff)} title="{eff.name}: {eff.description}">
								<span class="wiz-eff-emoji">{eff.emoji}</span>
								<span class="wiz-eff-name">{eff.name.split(' (')[0]}</span>
								{#if eff.sampleUrl}<button type="button" class="wiz-play-preview" class:playing={playingEffectPreviewId === eff.id} onclick={(e) => toggleEffectPreview(eff, e)}>{playingEffectPreviewId === eff.id ? '⏹' : '▶'}</button>{/if}
							</div>
						{/each}
					</div>

					<!-- Custom Voice Tuner (Option A) -->
					{#if selectedVoiceEngine === 'edge_tts'}
						<div class="custom-voice-tuner-card">
							<div class="tuner-header">
								<div class="tuner-title-group">
									<span class="tuner-icon">🎚️</span>
									<div>
										<strong class="tuner-title">Custom Voice Tuner (Kostum Suara Sendiri)</strong>
										<span class="tuner-sub">Setel nada ngebass, kecepatan, dan equalizer agar karakter suaramu unik & khas</span>
									</div>
								</div>
								<button
									type="button"
									class="btn-test-custom-voice"
									class:testing={isTestingCustomVoice}
									onclick={testCustomVoice}
									title="Tes suara dengan setelan nada & kecepatan saat ini"
								>
									{#if isTestingCustomVoice}
										<span>⏹ Berhenti</span>
									{:else}
										<span>▶ Tes Suara Kustom</span>
									{/if}
								</button>
							</div>

							<div class="tuner-sliders-grid">
								<!-- Pitch / Nada Slider -->
								<div class="tuner-slider-item">
									<div class="tuner-slider-label-row">
										<div class="tuner-label-with-tooltip">
											<span class="slider-name">🎵 Nada / Pitch (Ngebass)</span>
											<span class="slider-badge" class:bass-heavy={customPitchHz <= -12}>
												{customPitchHz} Hz
												{#if customPitchHz <= -24}
													· Sub-Bass Bioskop
												{:else if customPitchHz <= -12}
													· Bariton Berat
												{:else if customPitchHz <= -4}
													· Empuk / Warm
												{:else if customPitchHz === 0}
													· Asli (0Hz)
												{:else}
													· Ceria / Ringan
												{/if}
											</span>
										</div>
										<div class="quick-preset-chips">
											<button type="button" class="quick-chip" class:active={customPitchHz === 0} onclick={() => { customPitchHz = 0; selectedAudioEffect = 'custom'; }}>Normal (0Hz)</button>
											<button type="button" class="quick-chip" class:active={customPitchHz === -14} onclick={() => { customPitchHz = -14; selectedAudioEffect = 'custom'; }}>Deep (-14Hz)</button>
											<button type="button" class="quick-chip" class:active={customPitchHz === -26} onclick={() => { customPitchHz = -26; selectedAudioEffect = 'custom'; }}>Trailer (-26Hz)</button>
										</div>
									</div>
									<input
										type="range"
										min="-35"
										max="15"
										step="1"
										bind:value={customPitchHz}
										oninput={() => selectedAudioEffect = 'custom'}
										class="tuner-range-input"
									/>
									<div class="slider-ticks">
										<span>-35Hz (Super Ngebass)</span>
										<span>0Hz (Normal)</span>
										<span>+15Hz (Tinggi)</span>
									</div>
								</div>

								<!-- Speed / Tempo Slider -->
								<div class="tuner-slider-item">
									<div class="tuner-slider-label-row">
										<div class="tuner-label-with-tooltip">
											<span class="slider-name">⚡ Kecepatan Bicara (Speed Rate)</span>
											<span class="slider-badge">
												{customRatePct >= 0 ? `+${customRatePct}%` : `${customRatePct}%`}
												{#if customRatePct >= 10}
													· Pacing Cepat
												{:else if customRatePct <= -8}
													· Storytelling Santai
												{:else}
													· Natural
												{/if}
											</span>
										</div>
										<div class="quick-preset-chips">
											<button type="button" class="quick-chip" class:active={customRatePct === -6} onclick={() => { customRatePct = -6; selectedAudioEffect = 'custom'; }}>0.9x Santai</button>
											<button type="button" class="quick-chip" class:active={customRatePct === 0} onclick={() => { customRatePct = 0; selectedAudioEffect = 'custom'; }}>1.0x Normal</button>
											<button type="button" class="quick-chip" class:active={customRatePct === 6} onclick={() => { customRatePct = 6; selectedAudioEffect = 'custom'; }}>1.1x Padat</button>
										</div>
									</div>
									<input
										type="range"
										min="-20"
										max="25"
										step="1"
										bind:value={customRatePct}
										oninput={() => selectedAudioEffect = 'custom'}
										class="tuner-range-input"
									/>
									<div class="slider-ticks">
										<span>-20% (Dramatis)</span>
										<span>0% (Standar)</span>
										<span>+25% (Cepat)</span>
									</div>
								</div>

								<!-- Bass Boost Slider -->
								<div class="tuner-slider-item">
									<div class="tuner-slider-label-row">
										<div class="tuner-label-with-tooltip">
											<span class="slider-name">🔊 Ketebalan Bass Dada (Equalizer DSP)</span>
											<span class="slider-badge">
												+{customBassDb} dB
												{#if customBassDb >= 5}
													· Punchy Tebal
												{:else if customBassDb >= 2}
													· Warm Studio
												{:else}
													· Flat
												{/if}
											</span>
										</div>
										<div class="quick-preset-chips">
											<button type="button" class="quick-chip" class:active={customBassDb === 0} onclick={() => { customBassDb = 0; selectedAudioEffect = 'custom'; }}>Flat (0dB)</button>
											<button type="button" class="quick-chip" class:active={customBassDb === 4} onclick={() => { customBassDb = 4; selectedAudioEffect = 'custom'; }}>Studio (+4dB)</button>
											<button type="button" class="quick-chip" class:active={customBassDb === 7} onclick={() => { customBassDb = 7; selectedAudioEffect = 'custom'; }}>Heavy (+7dB)</button>
										</div>
									</div>
									<input
										type="range"
										min="0"
										max="8"
										step="1"
										bind:value={customBassDb}
										oninput={() => selectedAudioEffect = 'custom'}
										class="tuner-range-input"
									/>
									<div class="slider-ticks">
										<span>0 dB (Alami)</span>
										<span>+4 dB (Empuk Radio)</span>
										<span>+8 dB (Bass Mantap)</span>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- BGM -->
				<div class="wiz-card">
					<div class="wiz-card-head"><span class="wiz-card-title">🎵 Backsound (BGM)</span></div>
					<div class="wiz-bgm-tracks">
						{#each BGM_TRACKS as track}
							<div class="wiz-bgm-pill" class:active={selectedBgmId === track.id} onclick={() => selectedBgmId = track.id} role="button" tabindex="0" onkeydown={(e) => e.key==='Enter' && (selectedBgmId=track.id)}>
								{#if track.id !== 'none'}
									<button type="button" class="wiz-bgm-play" class:playing={isPlayingBgmPreview && selectedBgmId===track.id} onclick={(e) => { e.stopPropagation(); selectedBgmId=track.id; toggleBgmTrackPreview(track.id); }}>{isPlayingBgmPreview && selectedBgmId===track.id ? '⏹' : '▶'}</button>
								{:else}<span>🔇</span>{/if}
								<span class="wiz-bgm-name">{track.name}</span>
								{#if track.badge}<span class="wiz-bgm-badge">{track.badge}</span>{/if}
							</div>
						{/each}
					</div>
					<div class="wiz-bgm-vol-row">
						<button type="button" class="wiz-vol-toggle" onclick={() => bgmVolume = bgmVolume > 0 ? 0 : 0.10}>{bgmVolume === 0 ? '🔇' : '🔊'}</button>
						<input type="range" min="0" max="0.30" step="0.01" value={bgmVolume} oninput={handleBgmVolumeInput} class="wiz-vol-slider"/>
						<span class="wiz-vol-val">{Math.round(bgmVolume * 100)}%</span>
						<span class="wiz-vol-hint">{bgmVolume === 0 ? 'Muted' : bgmVolume <= 0.12 ? '⭐ Ideal' : 'Tinggi'}</span>
					</div>
				</div>
			</div>

			<div class="wiz-step-actions">
				<button class="wiz-btn-secondary" onclick={() => wizardStep = 3}><span>←</span><span>Pose & Karakter</span></button>
				{#if scenes.length > 0 && scenes[0]?.voiceAudioUrl}
					<button class="wiz-btn-primary" onclick={applyStylesAndOpenPlayer}>
						<Play size={16}/><span>Terapkan Gaya & Buka Studio Player →</span>
					</button>
				{:else}
					<button class="wiz-btn-primary" onclick={async () => { await generateStickmanVideo(); wizardStep = 5; }} disabled={!script.trim() || isGenerating}>
						{#if isGenerating}<RefreshCw size={16} class="spin"/><span>Memproses...</span>{:else}<Wand2 size={16}/><span>Generate Voiceover & Buka Studio Player →</span>{/if}
					</button>
				{/if}
			</div>
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
		</div>
		{/if}

		<!-- ==================== STEP 5: PREVIEW & RENDER ==================== -->
		{#if wizardStep === 5}
		<div class="wiz-step-content wiz-step5-layout" id="step-5">
			<div class="wiz-step-hero">
				<div class="wiz-step-num">05</div>
				<div>
					<h2 class="wiz-step-title">Live Canvas Player & Render</h2>
					<p class="wiz-step-desc">Tinjau animasi whiteboard secara real-time, sesuaikan, dan ekspor video 1080p.</p>
			</div>
			</div>

			<div class="wiz-preview-render">
				<!-- Left: Player -->
				<div class="wiz-player-col">
					<!-- Canvas Monitor -->
					<div class="canvas-wrapper" class:canvas-empty={!currentScene} class:is-shorts={isShorts}>
						<div class="monitor-top-bar">
							<div class="monitor-status">
								<span class="status-dot" class:live={!!currentScene}></span>
								<span class="status-label">{currentScene ? (isShorts ? 'LIVE PREVIEW • 9:16' : 'LIVE PREVIEW • 1080p') : 'MONITOR STANDBY'}</span>
							</div>
							<div class="monitor-meta">
								<button type="button" class="aspect-toggle-btn" class:shorts-active={isShorts} onclick={toggleShorts} title={isShorts ? 'Beralih ke 16:9' : 'Beralih ke 9:16 Shorts'}>
									{#if isShorts}<span>▮ 9:16</span><span class="shorts-badge">SHORTS</span>{:else}<span>▬ 16:9</span>{/if}
								</button>
								{#if currentScene}
									<span class="scene-counter-badge">Adegan {activeSceneIndex + 1} / {scenes.length}</span>
									<span class="pacing-badge">🌿 Natural Flow</span>
								{/if}
							</div>
						</div>

						{#if currentScene}
							{@const _curAlign = currentScene.textAlign || stickmanTextAlign}
							{@const _effImgAnim = getEffectiveImageAnimClass(currentScene, activeSceneIndex)}
							<div bind:this={canvasEl} bind:clientHeight={canvasHeight} class="stickman-canvas theme-{stickmanBgTheme}" style="{getCanvasContainerStyle(stickmanBgTheme)}">
								<div class="canvas-viewport" style="inset: {stickmanVideoPadding}%;">
									{#key `${currentScene.image}-${activeSceneIndex}-${currentScene.imageAnim || stickmanImageAnim}-${currentScene.idleMotion || stickmanIdleMotion}-${currentScene.textSide}-${stickmanBgTheme}`}
										<div class="stickman-entrance-wrapper anim-img-{_effImgAnim} side-{(currentScene.textSide || currentScene.layoutSide || 'right')}">
											<div class="stickman-bg-layer idle-motion-{(currentScene?.idleMotion || stickmanIdleMotion || 'shake')}" style="{getStickmanBgLayerStyle(currentScene.image, stickmanBgTheme)}"></div>
										</div>
									{/key}
									{#key `${activeSceneIndex}-${currentScene.keyPoint}-${currentScene.textAnim || stickmanAnim}`}
										<div class="text-overlay {(currentScene.textSide || currentScene.layoutSide)} anim-{(currentScene.textAnim || stickmanAnim)} align-{_curAlign}" style="{getOverlayStyle(currentScene)} cursor: {drag.active ? 'grabbing' : 'grab'};" onpointerdown={onTextPointerDown} role="presentation" title="Drag untuk geser">
											<div class="two-lines free-mode text-idle-{(currentScene?.textIdleMotion || stickmanTextIdleMotion || 'shake')}" style="font-family: {stickmanFontFamily}; align-items: {_curAlign === 'right' ? 'flex-end' : _curAlign === 'center' || _curAlign === 'middle' ? 'center' : 'flex-start'}; text-align: {_curAlign === 'right' ? 'right' : _curAlign === 'center' || _curAlign === 'middle' ? 'center' : 'left'};">
												{#each getEditorLines(currentScene.keyPoint) as line, idx}
													{@const isTop = idx === 0}
													{@const rawCol = isTop ? (currentScene.textColorTop || stickmanTextColorTop) : (currentScene.textColorBottom || stickmanTextColorBottom)}
													{@const col = (stickmanBgTheme === 'chalkboard' && (rawCol === '#111827' || rawCol === '#000000')) ? '#FFFFFF' : (stickmanBgTheme === 'chalkboard' && rawCol?.toLowerCase() === '#dc2626') ? '#F87171' : rawCol}
													<span class="line anim-target" style="color: {col}; font-size: {getDisplayFontSize(currentScene.keyPoint, currentScene)}px; text-shadow: none;">{line}</span>
												{/each}
											</div>
										</div>
									{/key}
									<button class="flip-btn" onclick={flipCurrentTextSide} title="Pindah teks ke sisi lain"><span>↔</span> Flip teks</button>
									<button class="auto-align-btn" onclick={autoAlignCurrentScene} title="Deteksi otomatis posisi kosong"><span>🎯</span> Auto Posisi</button>
									<div class="canvas-fs-pill">
										<button type="button" class="c-fs-btn" onclick={() => changeFontSize(-4)}>A-</button>
										<span class="c-fs-val">{currentScene?.fontSize || stickmanFontSize}px</span>
										<button type="button" class="c-fs-btn" onclick={() => changeFontSize(4)}>A+</button>
									</div>
									<button class="change-img-btn" onclick={openImagePicker}><span>🖼️</span> Ganti Gambar</button>
								</div>
							</div>
						{:else}
							<div class="studio-empty-monitor">
								<div class="empty-glow-circle"><Film size={34} class="text-indigo" /></div>
								<h4 class="empty-monitor-title">{isShorts ? '📱 Shorts 9:16 Monitor' : 'Studio Canvas Monitor'}</h4>
								<p class="empty-monitor-desc">Kembali ke Step 4 dan klik <strong>"Generate Voiceover"</strong> untuk melihat preview animasi di sini.</p>
							</div>
						{/if}
					</div>

					<!-- Player Controls -->
					{#if scenes.length > 0}
						{#if scenes.length > 1}
							<div class="slide-nav">
								<button class="slide-nav-btn" onclick={() => { if (activeSceneIndex > 0) selectScene(activeSceneIndex - 1); }} disabled={activeSceneIndex === 0}>&#8592;</button>
								<div class="slide-dots">
									{#each scenes as _, i}
										<button class="slide-dot" class:active={i === activeSceneIndex} onclick={() => selectScene(i)} title="Adegan {i + 1}"></button>
									{/each}
								</div>
								<span class="slide-counter">{activeSceneIndex + 1} / {scenes.length}</span>
								<button class="slide-nav-btn" onclick={() => { if (activeSceneIndex < scenes.length - 1) selectScene(activeSceneIndex + 1); }} disabled={activeSceneIndex === scenes.length - 1}>&#8594;</button>
							</div>
							<div class="scene-filmstrip-wrap">
								<div class="scene-filmstrip">
									{#each scenes as sc, i}
										<div class="filmstrip-item-group">
											{#if sc.chapter}<div class="chapter-label" class:hook-label={sc.chapter.isHook}>{#if sc.chapter.tag}<span class="chapter-tag">{sc.chapter.tag}</span>{/if}<span class="chapter-title">{sc.chapter.title || ''}</span></div>{/if}
											<button type="button" class="filmstrip-thumb" class:active={i === activeSceneIndex} class:has-chapter={!!sc.chapter} class:is-hook={sc.chapter?.isHook} onclick={() => selectScene(i)} title="Adegan {i + 1}">
												{#if sc.image}<img src={sc.image} alt="Scene {i+1}" class="thumb-img" />{:else}<div class="thumb-placeholder">🎨</div>{/if}
												<span class="thumb-num">{i + 1}</span>
												{#if sc.keyPoint}<span class="thumb-kp">{sc.keyPoint.split('\n')[0].slice(0, 18)}</span>{/if}
											</button>
										</div>
									{/each}
								</div>
							</div>
						{/if}
						<div class="player-controls">
							<button class="ctrl-btn ctrl-play-btn" onclick={togglePlay}>
								{#if isPlaying}<Pause size={16}/>{:else}<Play size={16}/>{/if}
								<span>{isPlaying ? 'Pause' : 'Play Narasi'}</span>
							</button>
							<button class="ctrl-btn" onclick={() => { if (scenes.length) selectScene((activeSceneIndex + 1) % scenes.length); }}><span>Next →</span></button>
							<button class="ctrl-btn" onclick={flipCurrentTextSide}><span>↔ Flip Sisi</span></button>
							<button class="ctrl-btn" onclick={autoAlignCurrentScene}><span>🎯 Auto Sisi</span></button>
							<button type="button" class="ctrl-btn btn-split-scene" onclick={splitCurrentScene} disabled={!currentScene || (currentScene.narration || '').split(/\s+/).filter(Boolean).length < 5}><span>✂️ Split Adegan</span></button>
							<button type="button" class="ctrl-btn btn-random-dup" onclick={randomizeDuplicateSceneImages} disabled={isRandomizingDuplicates || !scenes.length}><span>🎲 {isRandomizingDuplicates ? 'Mengacak...' : 'Ganti Gambar Duplikat'}</span></button>
							<button type="button" class="ctrl-btn" class:active-toggle={autoAdvancePlay} onclick={() => autoAdvancePlay = !autoAdvancePlay}><span>{autoAdvancePlay ? '🔁 Auto-Next ON' : '⏹️ Auto-Next OFF'}</span></button>
							<button type="button" class="ctrl-btn" onclick={() => regenerateVoiceoverForScene(activeSceneIndex)} disabled={isRegeneratingVoice}><Mic size={14}/><span>{isRegeneratingVoice ? 'Memproses...' : `🎙️ Suara (${selectedVoiceEngine === 'gemini_tts' ? selectedVoiceId.replace('gemini-', '') : 'Edge'})`}</span></button>
							<div class="quick-fs-control">
								<button type="button" class="ctrl-btn quick-fs-btn" onclick={() => changeFontSize(-4)}>A-</button>
								<span class="quick-fs-val">{currentScene?.fontSize || stickmanFontSize}px</span>
								<button type="button" class="ctrl-btn quick-fs-btn" onclick={() => changeFontSize(4)}>A+</button>
							</div>
						</div>
						<audio bind:this={audioElA} preload="auto" onended={() => onVoiceAudioEnded('A')}></audio>
						<audio bind:this={audioElB} preload="auto" onended={() => onVoiceAudioEnded('B')}></audio>

						{#if currentScene}
							<div class="free-editor">
								<span class="style-label">✏️ Edit Teks Adegan #{activeSceneIndex + 1}</span>
								<textarea class="free-textarea" rows="2" placeholder="Ketik teks 2 baris — Enter untuk baris baru" value={currentScene.keyPoint} oninput={(e) => updateCurrentSceneProp('keyPoint', e.currentTarget.value.slice(0, 140))}></textarea>
							</div>
							<!-- Transform sliders -->
							<div class="transform-actions">
								<div class="slider-row">
									<span class="style-label">Geser X: {(currentScene.textOffsetX || 0).toFixed(1)}%</span>
									<input class="range-input" type="range" min="-35" max="35" step="0.5" value={currentScene.textOffsetX || 0} oninput={(e) => updateCurrentSceneProp('textOffsetX', Number(e.currentTarget.value))}/>
									<span class="style-label">Y: {(currentScene.textOffsetY || 0).toFixed(1)}%</span>
									<input class="range-input" type="range" min="-28" max="28" step="0.5" value={currentScene.textOffsetY || 0} oninput={(e) => updateCurrentSceneProp('textOffsetY', Number(e.currentTarget.value))}/>
								</div>
								<div class="slider-row">
									<span class="style-label">Rotate {(currentScene.textRotate ?? 0)}°</span>
									<input class="range-input" type="range" min="-18" max="18" step="0.5" value={currentScene.textRotate ?? 0} oninput={(e) => updateCurrentSceneProp('textRotate', Number(e.currentTarget.value))}/>
									<span class="style-label">Scale {(currentScene.textScale ?? 1).toFixed(2)}x</span>
									<input class="range-input" type="range" min="0.7" max="1.6" step="0.02" value={currentScene.textScale ?? 1} oninput={(e) => updateCurrentSceneProp('textScale', Number(e.currentTarget.value))}/>
									<button class="transform-btn" onclick={resetTransform}>Reset</button>
								</div>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Right: Render + Scene Controls -->
				<div class="wiz-render-col">
					<!-- Generation Progress -->
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

					<!-- Render Card -->
					<div class="render-card">
						<div class="render-head">
							<div class="render-title"><Film size={15}/>{#if isShorts}<span>Render Shorts 9:16 (1080×1920)</span>{:else}<span>Render Video Stickman 16:9 Full HD</span>{/if}</div>
							<div class="quality-row">
								{#if isShorts}
									<button type="button" class="q-btn" class:on={renderQuality==='1080p'} onclick={() => renderQuality='1080p'} disabled={isRendering}>1080p Shorts</button>
									<button type="button" class="q-btn" class:on={renderQuality==='720p'} onclick={() => renderQuality='720p'} disabled={isRendering}>720p Shorts</button>
								{:else}
									<button type="button" class="q-btn" class:on={renderQuality==='1080p'} onclick={() => renderQuality='1080p'} disabled={isRendering}>1080p (FHD)</button>
									<button type="button" class="q-btn" class:on={renderQuality==='720p'} onclick={() => renderQuality='720p'} disabled={isRendering}>720p</button>
								{/if}
							</div>
						</div>
						{#if downloadUrl}
							<a href={downloadUrl} download={downloadFilename} class="btn btn-primary download-link" target="_blank"><Download size={14}/><span>Download Video MP4</span></a>
						{:else}
							<button class="btn btn-primary render-btn" onclick={startStickmanRender} disabled={isRendering || !scenes.length}>
								{#if isRendering}<RefreshCw size={14} class="spin"/><span>{renderStep || 'Rendering...'} {renderProgress}%</span>{:else}<Film size={14}/><span>🚀 {isShorts ? 'Export Shorts (9:16)' : 'Render & Download Video Stickman (MP4)'}</span>{/if}
							</button>
						{/if}
						{#if isRendering || renderProgress > 0}
							<div class="progress-track"><div class="progress-fill" style="width: {renderProgress}%"></div></div>
							<div class="progress-label">{renderProgress}% • {renderStep}</div>
						{/if}
						{#if renderError}<div class="error-box">{renderError}</div>{/if}
						{#if downloadUrl}<div class="success-box">Video siap — klik Download</div>{/if}
						<p class="render-hint">Video di-mix otomatis: gambar stickman, subtitle, voiceover, dan backsound.</p>
					</div>

					<!-- Regen Voiceover & Import Audio -->
					{#if scenes.length > 0}
						<div class="step5-audio-actions">
							<button type="button" class="btn btn-secondary regen-all-btn" onclick={regenerateAllVoiceovers} disabled={isRegeneratingVoice || isGenerating}>
								<RefreshCw size={15} class={isRegeneratingVoice ? 'spin' : ''}/>
								<span>{isRegeneratingVoice ? 'Menerapkan Suara...' : '🎙️ Regenerate Semua Voiceover'}</span>
							</button>
							<button type="button" class="btn btn-secondary regen-all-btn groq-import-btn" onclick={() => showWhisperModal = true}>
								<Mic size={15}/>
								<span>🎙️ Ganti dari 1 Audio Utuh (Whisper AI)</span>
							</button>
						</div>
					{/if}
				</div>
			</div>

			<div class="wiz-step-actions" style="margin-top:16px">
				<button class="wiz-btn-secondary" onclick={() => wizardStep = 4}><span>←</span><span>Kembali & Sesuaikan Gaya / Audio</span></button>
			</div>
		</div>
		{/if}

	</main>

	<!-- ============================================================ -->
	<!-- Image Picker Modal -->
	<!-- ============================================================ -->
	{#if showImagePicker}
		<div class="img-picker-backdrop" onclick={(e) => { if (e.target === e.currentTarget) showImagePicker = false; }} role="presentation">
			<div class="img-picker-modal">
				<!-- Header -->
				<div class="img-picker-header">
					<div class="img-picker-title">
						<span class="picker-icon-badge">🖼️</span>
						<div>
							<strong>Ganti Gambar Adegan {activeSceneIndex + 1}</strong>
							<small>Pilih dari koleksi stickman atau upload gambar kustom</small>
						</div>
					</div>
					<button class="img-picker-close" onclick={() => showImagePicker = false} title="Tutup modal (Esc)">✕</button>
				</div>

				<!-- Toolbar -->
				<div class="img-picker-toolbar">
					<div class="img-picker-search-wrap">
						<span class="search-icon">🔍</span>
						<input
							type="text"
							bind:value={imagePickerFilter}
							placeholder="Cari gambar stickman (uang, sedih, laptop, ide, sukses...)"
							class="img-picker-search"
						/>
						{#if imagePickerFilter}
							<button type="button" class="btn-clear-search" onclick={() => imagePickerFilter = ''} title="Hapus pencarian">✕</button>
						{/if}
					</div>
					<button type="button" class="btn-upload-img" onclick={() => imageUploadInputEl?.click()} title="Upload gambar dari komputer">
						📁 Upload Gambar
					</button>
					<input bind:this={imageUploadInputEl} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;" onchange={handleImageFileUpload}/>
				</div>

				<!-- Categories -->
				<div class="img-picker-cats">
					<button
						type="button"
						class="cat-pill"
						class:active={selectedImageCategory === 'all'}
						onclick={() => selectedImageCategory = 'all'}
					>
						✨ Semua ({availableAssets.length})
					</button>
					{#each stickmanCategories as cat}
						<button
							type="button"
							class="cat-pill"
							class:active={selectedImageCategory === cat.id}
							onclick={() => selectedImageCategory = cat.id}
						>
							{cat.label}
						</button>
					{/each}
				</div>

				<!-- Count, Scene Indicator & Size Switcher -->
				<div class="img-picker-count">
					<div class="img-picker-count-left">
						<span class="count-badge"><strong>{filteredAssets.length}</strong> pose stickman ditemukan</span>
						{#if currentScene?.image}
							<div class="current-scene-indicator" title="Gambar aktif pada adegan saat ini">
								<span class="current-label">Saat ini:</span>
								<img src={currentScene.image} alt="Saat ini" class="current-thumb"/>
								<span class="current-title">{currentScene.imageTitle || 'Gambar Aktif'}</span>
							</div>
						{/if}
					</div>

					<div class="img-picker-count-right">
						<div class="picker-size-toggle" title="Ubah ukuran tampilan gambar">
							<span class="size-label">Tampilan:</span>
							<button
								type="button"
								class="size-btn"
								class:active={pickerGridSize === 'large'}
								onclick={() => pickerGridSize = 'large'}
								title="Tampilan Penuh & Besar (Jelas Sekilas)"
							>
								🖼️ Besar
							</button>
							<button
								type="button"
								class="size-btn"
								class:active={pickerGridSize === 'medium'}
								onclick={() => pickerGridSize = 'medium'}
								title="Tampilan Sedang"
							>
								🔲 Sedang
							</button>
							<button
								type="button"
								class="size-btn"
								class:active={pickerGridSize === 'compact'}
								onclick={() => pickerGridSize = 'compact'}
								title="Tampilan Kompak"
							>
								▦ Kompak
							</button>
						</div>

						{#if imagePickerFilter || selectedImageCategory !== 'all'}
							<button type="button" class="btn-reset-filter" onclick={() => { imagePickerFilter = ''; selectedImageCategory = 'all'; }}>
								↺ Reset filter
							</button>
						{/if}
					</div>
				</div>

				<!-- Image Grid -->
				<div class="img-picker-grid size-{pickerGridSize}">
					{#if filteredAssets.length === 0}
						<div class="img-picker-empty">
							<span class="empty-icon">🔍</span>
							<p>Tidak ada gambar dengan kata kunci <strong>"{imagePickerFilter}"</strong></p>
							<small>Coba kata kunci lain atau upload gambar kustom dari komputer</small>
							<button type="button" class="btn-reset-empty" onclick={() => { imagePickerFilter = ''; selectedImageCategory = 'all'; }}>
								↺ Tampilkan Semua ({availableAssets.length}) Gambar
							</button>
						</div>
					{:else}
						{#each displayedAssets as asset (asset.id || asset.url)}
							<div
								class="img-pick-card"
								class:selected={currentScene?.image === asset.url}
								role="button"
								tabindex="0"
								onclick={() => applyAssetToScene(asset)}
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyAssetToScene(asset); } }}
								title="{asset.title || asset.slug} (Klik untuk pasang ke adegan)"
							>
								<div class="pick-card-img-wrap">
									<img src={asset.url} alt={asset.title || asset.slug} class="pick-card-img" loading="lazy"/>
									{#if currentScene?.image === asset.url}
										<div class="pick-card-check">✓ Terpilih</div>
									{/if}
									<button
										type="button"
										class="btn-quick-zoom"
										onclick={(e) => { e.stopPropagation(); previewAsset = asset; }}
										title="Perbesar gambar untuk melihat detail"
									>
										🔍
									</button>
									<div class="card-select-overlay">
										<span class="select-overlay-text">✓ Pilih Pose Ini</span>
									</div>
								</div>
								<div class="pick-card-info">
									<div class="pick-card-title-row">
										<span class="pick-card-label">{asset.title || asset.slug}</span>
										{#if asset.layoutSide}
											<span class="pick-card-side-badge" title="Posisi gambar {asset.layoutSide === 'left' ? 'kiri' : 'kanan'}">
												{asset.layoutSide === 'left' ? '👈 Kiri' : '👉 Kanan'}
											</span>
										{/if}
									</div>
									{#if asset.tagsId?.length || asset.keywords?.length}
										<div class="pick-card-tags">
											{#each (asset.tagsId || asset.keywords || []).slice(0, pickerGridSize === 'large' ? 4 : 2) as tag}
												<span class="tag-pill">#{tag}</span>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						{/each}

						{#if filteredAssets.length > imagePickerLimit}
							<div class="img-picker-load-more">
								<button type="button" class="btn-load-more-assets" onclick={loadMoreAssets}>
									<span>⬇️ Muat Lebih Banyak ({filteredAssets.length - imagePickerLimit} gambar tersisa)</span>
								</button>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Full High-Res Lightbox Modal -->
				{#if previewAsset}
					<div class="asset-lightbox-backdrop" onclick={() => previewAsset = null} role="presentation">
						<div class="asset-lightbox-modal" onclick={(e) => e.stopPropagation()} role="presentation">
							<div class="lightbox-header">
								<div class="lightbox-title-wrap">
									<strong class="lightbox-title">{previewAsset.title || previewAsset.slug}</strong>
									{#if previewAsset.layoutSide}
										<span class="lightbox-side-badge">
											{previewAsset.layoutSide === 'left' ? '👈 Karakter di Sisi Kiri (Teks Kanan)' : '👉 Karakter di Sisi Kanan (Teks Kiri)'}
										</span>
									{/if}
								</div>
								<button class="lightbox-close-btn" onclick={() => previewAsset = null} title="Tutup">✕</button>
							</div>
							<div class="lightbox-img-wrap">
								<img src={previewAsset.url} alt={previewAsset.title || previewAsset.slug} class="lightbox-img-full"/>
							</div>
							<div class="lightbox-footer">
								{#if previewAsset.tagsId?.length}
									<div class="lightbox-tags">
										{#each previewAsset.tagsId.slice(0, 10) as tag}
											<span class="lightbox-tag">#{tag}</span>
										{/each}
									</div>
								{/if}
								<div class="lightbox-actions">
									<button type="button" class="btn-lightbox-cancel" onclick={() => previewAsset = null}>Tutup Preview</button>
									<button type="button" class="btn-lightbox-select" onclick={() => { applyAssetToScene(previewAsset); previewAsset = null; }}>
										✓ Pasang Gambar Ini ke Adegan {activeSceneIndex + 1}
									</button>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<StickmanScriptModal
		isOpen={showScriptModal}
		initialTopic={videoTitle}
		onSelectScript={handleApplyGeneratedScript}
		onClose={() => showScriptModal = false}
	/>

	<TitleGeneratorModal
		isOpen={showTitleModal}
		initialTopic={videoTitle}
		onSelectTitle={(t) => { videoTitle = t; showTitleModal = false; }}
		onSelectTitleForScript={(t, openScript = true) => { videoTitle = t; showTitleModal = false; if (openScript) { showScriptModal = true; } }}
		onClose={() => showTitleModal = false}
	/>

	<WhisperAudioModal
		isOpen={showWhisperModal}
		onSuccess={handleWhisperImportSuccess}
		onClose={() => showWhisperModal = false}
	/>
</div>
<style>
	/* ═══════════════════════════════════════════════════════════
	   WIZARD REDESIGN — Stickman Studio 5-Step Stepper
	═══════════════════════════════════════════════════════════ */
	.stickman-studio { min-height: 100vh; background: var(--bg-base); color: var(--text); display: flex; flex-direction: column; }

	/* ── Wizard Header ──────────────────────────── */
	.wiz-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(10, 13, 26, 0.92);
		backdrop-filter: blur(20px) saturate(1.4);
		-webkit-backdrop-filter: blur(20px) saturate(1.4);
		border-bottom: 1px solid rgba(255,255,255,0.07);
		box-shadow: 0 4px 24px rgba(0,0,0,0.3);
	}
	.wiz-header-inner {
		max-width: 1440px;
		margin: 0 auto;
		padding: 12px 24px;
		display: flex;
		align-items: center;
		gap: 24px;
		width: 100%;
		box-sizing: border-box;
	}
	.wiz-brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
	.wiz-back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px; height: 36px;
		border-radius: 10px;
		background: rgba(255,255,255,0.06);
		border: 1px solid rgba(255,255,255,0.1);
		color: var(--text-2);
		transition: background 0.2s, color 0.2s;
	}
	.wiz-back-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
	.wiz-title-block { display: flex; flex-direction: column; gap: 2px; }
	.wiz-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 0.68rem;
		font-weight: 700;
		color: #a5b4fc;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.wiz-title {
		font-size: 1.1rem;
		font-weight: 800;
		margin: 0;
		line-height: 1.2;
		color: #f1f5f9;
	}
	.wiz-gradient {
		background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* ── Step Bar ──────────────────────────────── */
	.wiz-stepbar {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 0;
		min-width: 0;
	}
	.wiz-step {
		display: flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px 8px;
		border-radius: 10px;
		transition: background 0.18s;
		flex-shrink: 0;
		position: relative;
	}
	.wiz-step:not(:disabled):hover { background: rgba(255,255,255,0.05); }
	.wiz-step:disabled { cursor: not-allowed; opacity: 0.45; }
	.wiz-step-dot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px; height: 28px;
		border-radius: 50%;
		background: rgba(255,255,255,0.07);
		border: 1.5px solid rgba(255,255,255,0.15);
		font-size: 0.72rem;
		font-weight: 800;
		color: var(--text-2);
		transition: all 0.22s;
		flex-shrink: 0;
	}
	.wiz-step.active .wiz-step-dot {
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		border-color: #6366f1;
		color: #fff;
		box-shadow: 0 0 0 3px rgba(99,102,241,0.28), 0 4px 12px rgba(99,102,241,0.35);
	}
	.wiz-step.done .wiz-step-dot {
		background: linear-gradient(135deg, #10b981, #059669);
		border-color: #10b981;
		color: #fff;
		box-shadow: 0 0 0 2px rgba(16,185,129,0.25);
	}
	.wiz-step-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-2);
		white-space: nowrap;
	}
	.wiz-step.active .wiz-step-label { color: #e0e7ff; }
	.wiz-step.done .wiz-step-label { color: #6ee7b7; }
	.wiz-step-line {
		flex: 1;
		height: 1.5px;
		background: rgba(255,255,255,0.1);
		margin: 0 4px;
		min-width: 16px;
		max-width: 40px;
	}

	/* ── Aspect Toggle ─────────────────────────── */
	.wiz-aspect-toggle { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
	.asp-pill {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 5px 12px;
		border-radius: 20px;
		border: 1.5px solid rgba(255,255,255,0.12);
		background: rgba(255,255,255,0.04);
		color: var(--text-2);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.18s;
	}
	.asp-pill:hover { background: rgba(255,255,255,0.08); color: #fff; }
	.asp-pill.active {
		background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2));
		border-color: #6366f1;
		color: #c7d2fe;
		box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
	}
	.asp-txt { font-size: 0.72rem; }
	.asp-badge {
		background: linear-gradient(90deg, #f59e0b, #ef4444);
		color: #fff;
		font-size: 0.56rem;
		font-weight: 800;
		padding: 1px 5px;
		border-radius: 4px;
		letter-spacing: 0.06em;
	}

	/* ── Header Whisper Import ──────────────────── */
	.wiz-header-whisper { display: flex; align-items: center; }
	.wiz-btn-groq-header {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: 20px;
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15));
		border: 1.5px solid rgba(16, 185, 129, 0.35);
		color: #e2e8f0;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.wiz-btn-groq-header:hover {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(99, 102, 241, 0.28));
		border-color: #34d399;
		color: #fff;
		transform: translateY(-1px);
		box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
	}
	.header-groq-badge {
		font-size: 0.58rem;
		font-weight: 800;
		background: #10b981;
		color: #042f1a;
		padding: 1px 5px;
		border-radius: 4px;
		letter-spacing: 0.06em;
	}

	/* ── Quick Audio Banner (Step 1) ────────────── */
	.wiz-audio-banner {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.08));
		border: 1.5px solid rgba(16, 185, 129, 0.25);
		border-radius: 16px;
		padding: 18px 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}
	.wiz-audio-banner-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.wiz-audio-icon {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.35);
		color: #34d399;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.wiz-audio-banner-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: #f1f5f9;
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 3px;
	}
	.wiz-badge-groq {
		font-size: 0.65rem;
		font-weight: 800;
		padding: 2px 6px;
		border-radius: 5px;
		background: rgba(16, 185, 129, 0.2);
		color: #6ee7b7;
		border: 1px solid rgba(16, 185, 129, 0.4);
	}
	.wiz-audio-banner-desc {
		font-size: 0.78rem;
		color: #94a3b8;
		line-height: 1.4;
	}
	.wiz-audio-banner-btn {
		background: linear-gradient(135deg, #059669, #10b981);
		color: #fff;
		border: none;
		border-radius: 10px;
		padding: 10px 18px;
		font-size: 0.84rem;
		font-weight: 700;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
		box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
		transition: all 0.2s ease;
		flex-shrink: 0;
	}
	.wiz-audio-banner-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
		filter: brightness(1.08);
	}

	.wiz-btn-groq {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.12));
		border-color: rgba(16, 185, 129, 0.35);
		color: #6ee7b7;
	}
	.wiz-btn-groq:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.22));
		border-color: #10b981;
		color: #fff;
	}

	.wiz-imported-audio-notice {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1));
		border: 1px solid rgba(99, 102, 241, 0.35);
		border-radius: 12px;
		padding: 12px 18px;
		display: flex;
		align-items: center;
		gap: 12px;
		color: #e0e7ff;
		font-size: 0.88rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.step5-audio-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.groq-import-btn {
		border-color: rgba(16, 185, 129, 0.35) !important;
		color: #a7f3d0 !important;
	}
	.groq-import-btn:hover {
		border-color: #34d399 !important;
		background: rgba(16, 185, 129, 0.15) !important;
	}

	/* ── Main Content ──────────────────────────── */
	.wiz-main {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		padding: 32px 24px;
		box-sizing: border-box;
	}
	.wiz-step-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
		animation: wizFadeIn 0.32s ease;
	}
	@keyframes wizFadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Step Hero Header */
	.wiz-step-hero {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 22px 28px;
		background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06));
		border: 1px solid rgba(99,102,241,0.2);
		border-radius: 16px;
	}
	.wiz-step-num {
		font-size: 2.5rem;
		font-weight: 900;
		background: linear-gradient(135deg, #6366f1, #c084fc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1;
		flex-shrink: 0;
		letter-spacing: -0.04em;
	}
	.wiz-step-title { font-size: 1.35rem; font-weight: 800; margin: 0 0 4px; color: #f1f5f9; }
	.wiz-step-desc { font-size: 0.85rem; color: var(--text-2); margin: 0; }

	/* Grid Layout */
	.wiz-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; }

	/* Step 5 special layout */
	.wiz-preview-render {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
		gap: 20px;
		align-items: start;
	}
	.wiz-player-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
	.wiz-render-col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }

	/* Card */
	.wiz-card {
		background: rgba(255,255,255,0.03);
		border: 1px solid rgba(255,255,255,0.07);
		border-radius: 14px;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		backdrop-filter: blur(8px);
	}
	.wiz-card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		flexwrap: wrap;
	}
	.wiz-card-title {
		font-size: 0.85rem;
		font-weight: 700;
		color: #c7d2fe;
	}
	.wiz-card-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

	/* Inputs */
	.wiz-input, .wiz-textarea, .wiz-select, .wiz-search-input {
		width: 100%;
		background: rgba(255,255,255,0.05);
		border: 1.5px solid rgba(255,255,255,0.1);
		border-radius: 10px;
		color: var(--text);
		padding: 10px 14px;
		font-size: 0.88rem;
		box-sizing: border-box;
		transition: border-color 0.18s, background 0.18s;
	}
	.wiz-input:focus, .wiz-textarea:focus, .wiz-select:focus, .wiz-search-input:focus {
		border-color: #6366f1;
		background: rgba(99,102,241,0.07);
		outline: none;
	}
	.wiz-textarea { resize: vertical; font-family: inherit; line-height: 1.6; }
	.wiz-select { cursor: pointer; }

	/* Buttons */
	.wiz-btn-sm {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 12px;
		border-radius: 8px;
		font-size: 0.76rem;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.18s;
	}
	.wiz-btn-accent {
		background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15));
		border-color: rgba(99,102,241,0.4);
		color: #a5b4fc;
	}
	.wiz-btn-accent:hover:not(:disabled) { background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.28)); border-color: #6366f1; color: #c7d2fe; }
	.wiz-btn-fire {
		background: linear-gradient(135deg, rgba(239,68,68,0.18), rgba(249,115,22,0.12));
		border-color: rgba(239,68,68,0.35);
		color: #fca5a5;
	}
	.wiz-btn-fire:hover:not(:disabled) { background: linear-gradient(135deg, rgba(239,68,68,0.3), rgba(249,115,22,0.22)); border-color: #ef4444; }

	.wiz-btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 28px;
		border-radius: 12px;
		border: none;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 20px rgba(99,102,241,0.35);
	}
	.wiz-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99,102,241,0.5); filter: brightness(1.1); }
	.wiz-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

	.wiz-btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		border-radius: 12px;
		border: 1.5px solid rgba(255,255,255,0.12);
		background: rgba(255,255,255,0.05);
		color: var(--text-2);
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.18s;
	}
	.wiz-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2); }

	.wiz-step-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		padding-top: 8px;
	}

	/* Notice */
	.wiz-notice {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 9px 14px;
		background: rgba(16,185,129,0.12);
		border: 1px solid rgba(16,185,129,0.25);
		border-radius: 8px;
		font-size: 0.8rem;
		color: #6ee7b7;
	}
	.wiz-script-stats { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.wiz-stat-pill { padding: 3px 10px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); border-radius: 20px; font-size: 0.74rem; color: #a5b4fc; }
	.wiz-format-hint { font-size: 0.72rem; color: var(--text-3); }
	.wiz-char-count { font-size: 0.72rem; color: var(--text-3); }

	/* Niche Chips */
	.wiz-niche-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.wiz-chips-label { font-size: 0.72rem; color: var(--text-3); flex-shrink: 0; }
	.wiz-niche-chip {
		padding: 4px 10px;
		border-radius: 20px;
		border: 1px solid rgba(255,255,255,0.1);
		background: rgba(255,255,255,0.04);
		color: var(--text-2);
		font-size: 0.73rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	.wiz-niche-chip:hover { background: rgba(99,102,241,0.15); border-color: #6366f1; color: #c7d2fe; }

	/* Preset Pills */
	.wiz-preset-pills { display: flex; gap: 6px; flex-wrap: wrap; }
	.wiz-preset-lang { display: flex; gap: 4px; }
	.wiz-lang-btn { padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: var(--text-2); font-size: 0.72rem; cursor: pointer; transition: all 0.15s; }
	.wiz-lang-btn.active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #a5b4fc; }
	.wiz-preset-pill { padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: var(--text-2); font-size: 0.74rem; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s; }
	.wiz-preset-pill.active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #c7d2fe; }
	.wiz-preset-pill:hover { background: rgba(255,255,255,0.08); }
	.wiz-flag { font-size: 0.64rem; font-weight: 800; background: rgba(255,255,255,0.15); padding: 1px 5px; border-radius: 4px; }

	/* Animation Pills */
	.wiz-anim-grid { display: flex; gap: 6px; flex-wrap: wrap; }
	.wiz-anim-pill {
		padding: 5px 12px;
		border-radius: 8px;
		border: 1.5px solid rgba(255,255,255,0.1);
		background: rgba(255,255,255,0.04);
		color: var(--text-2);
		font-size: 0.76rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	.wiz-anim-pill:hover { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.4); color: #c7d2fe; }
	.wiz-anim-pill.on { background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.18)); border-color: #6366f1; color: #c7d2fe; }
	.wiz-apply-all { padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); color: #6ee7b7; font-size: 0.74rem; cursor: pointer; transition: all 0.15s; align-self: flex-start; }
	.wiz-apply-all:hover { background: rgba(16,185,129,0.18); }
	.wiz-align-actions { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
	.wiz-apply-auto {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(99, 102, 241, 0.18)) !important;
		border-color: rgba(16, 185, 129, 0.45) !important;
		color: #a7f3d0 !important;
		font-weight: 700 !important;
	}
	.wiz-apply-auto:hover {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(99, 102, 241, 0.3)) !important;
		border-color: #34d399 !important;
		color: #fff !important;
	}

	/* BG Themes Grid */
	.wiz-bg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
	.wiz-bg-card {
		padding: 10px;
		border-radius: 10px;
		border: 1.5px solid rgba(255,255,255,0.08);
		background: rgba(255,255,255,0.03);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 3px;
		transition: all 0.18s;
		text-align: left;
	}
	.wiz-bg-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }
	.wiz-bg-card.on { background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12)); border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
	.wiz-bg-icon { font-size: 1.2rem; }
	.wiz-bg-name { font-size: 0.78rem; font-weight: 700; color: var(--text); }
	.wiz-bg-desc { font-size: 0.66rem; color: var(--text-3); line-height: 1.3; }

	/* Padding row */
	.wiz-padding-row { display: flex; flex-direction: column; gap: 6px; }
	.wiz-label { font-size: 0.78rem; color: var(--text-2); font-weight: 600; }

	/* Font rows */
	.wiz-font-row { display: flex; flex-direction: column; gap: 6px; }

	/* Color section */
	.wiz-color-section { display: flex; flex-direction: column; gap: 8px; }
	.wiz-color-row { display: flex; flex-direction: column; gap: 5px; }
	.wiz-color-dots { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
	.wiz-color-dot {
		width: 22px; height: 22px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
	}
	.wiz-color-dot:hover { transform: scale(1.2); }
	.wiz-color-dot.on { transform: scale(1.25); box-shadow: 0 0 0 2px rgba(255,255,255,0.5), 0 0 0 4px rgba(99,102,241,0.4); }
	.wiz-color-picker { width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer; padding: 0; background: none; }

	/* Voice grid */
	.wiz-voice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
	.wiz-voice-card {
		padding: 10px 12px;
		border-radius: 10px;
		border: 1.5px solid rgba(255,255,255,0.08);
		background: rgba(255,255,255,0.03);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: all 0.18s;
	}
	.wiz-voice-card:hover { background: rgba(255,255,255,0.07); }
	.wiz-voice-card.active { background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12)); border-color: #6366f1; }
	.wiz-voice-avatar { font-size: 1.4rem; flex-shrink: 0; }
	.wiz-voice-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
	.wiz-voice-name { font-size: 0.8rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.wiz-voice-sub { font-size: 0.68rem; color: var(--text-3); }
	.wiz-play-preview {
		width: 26px; height: 26px;
		border-radius: 50%;
		border: 1px solid rgba(255,255,255,0.15);
		background: rgba(255,255,255,0.07);
		color: var(--text-2);
		font-size: 0.72rem;
		cursor: pointer;
		transition: all 0.15s;
		flex-shrink: 0;
	}
	.wiz-play-preview:hover { background: rgba(99,102,241,0.2); color: #c7d2fe; }
	.wiz-play-preview.playing { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #fca5a5; }
	/* Voice Engine Tabs */
	.wiz-engine-tabs {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: rgba(255, 255, 255, 0.05);
		padding: 3px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.wiz-engine-tab {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: 7px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-2);
		font-size: 0.74rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.18s ease;
	}
	.wiz-engine-tab:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
	}
	.wiz-engine-tab.active {
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
		border-color: rgba(255, 255, 255, 0.2);
	}
	.wiz-engine-tab.gemini-tab.active {
		background: linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(59, 130, 246, 0.3));
		border-color: rgba(168, 85, 247, 0.5);
		color: #e9d5ff;
		box-shadow: 0 0 12px rgba(168, 85, 247, 0.25);
	}
	.wiz-tab-badge {
		font-size: 0.62rem;
		padding: 1px 6px;
		border-radius: 12px;
		background: linear-gradient(135deg, #a855f7, #6366f1);
		color: #fff;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	/* Gemini API Key Box */
	.wiz-gemini-card {
		background: linear-gradient(135deg, rgba(88, 28, 135, 0.15), rgba(30, 58, 138, 0.12));
		border: 1px solid rgba(168, 85, 247, 0.28);
		border-radius: 12px;
		padding: 14px 16px;
		margin-bottom: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.wiz-gemini-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px;
	}
	.wiz-gemini-title {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 0.8rem;
		font-weight: 700;
		color: #f3e8ff;
	}
	.gemini-key-icon {
		color: #c084fc;
	}
	.wiz-key-badge {
		font-size: 0.65rem;
		padding: 2px 7px;
		border-radius: 6px;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.wiz-key-badge.saved {
		background: rgba(34, 197, 94, 0.2);
		color: #86efac;
		border: 1px solid rgba(34, 197, 94, 0.4);
	}
	.wiz-key-badge.warning {
		background: rgba(245, 158, 11, 0.2);
		color: #fde68a;
		border: 1px solid rgba(245, 158, 11, 0.4);
	}
	.wiz-gemini-link {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 0.72rem;
		color: #c084fc;
		text-decoration: none;
		transition: color 0.15s;
	}
	.wiz-gemini-link:hover {
		color: #e9d5ff;
		text-decoration: underline;
	}
	.wiz-key-input-row {
		display: flex;
		gap: 8px;
	}
	.wiz-key-input-wrap {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
	}
	.wiz-key-input {
		width: 100%;
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		padding: 8px 36px 8px 12px;
		color: #fff;
		font-size: 0.78rem;
		font-family: monospace;
		outline: none;
		transition: border-color 0.18s;
	}
	.wiz-key-input:focus {
		border-color: #a855f7;
		box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.25);
	}
	.wiz-key-toggle-btn {
		position: absolute;
		right: 8px;
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		border-radius: 4px;
		transition: color 0.15s;
	}
	.wiz-key-toggle-btn:hover {
		color: #fff;
	}
	.wiz-gemini-note {
		font-size: 0.7rem;
		color: rgba(233, 213, 255, 0.8);
		line-height: 1.4;
	}

	/* Gemini Card Variants */
	.wiz-voice-card.gemini-card {
		border-color: rgba(168, 85, 247, 0.18);
		background: rgba(168, 85, 247, 0.04);
	}
	.wiz-voice-card.gemini-card:hover {
		background: rgba(168, 85, 247, 0.09);
		border-color: rgba(168, 85, 247, 0.35);
	}
	.wiz-voice-card.gemini-card.active {
		background: linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(59, 130, 246, 0.18));
		border-color: #a855f7;
		box-shadow: 0 0 14px rgba(168, 85, 247, 0.25);
	}
	.wiz-voice-title-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.wiz-gemini-pill {
		font-size: 0.6rem;
		padding: 1px 6px;
		border-radius: 10px;
		background: rgba(168, 85, 247, 0.2);
		color: #d8b4fe;
		font-weight: 600;
	}
	.wiz-voice-desc {
		font-size: 0.66rem;
		color: var(--text-3);
		line-height: 1.3;
		margin-top: 2px;
	}

	/* Effect grid */
	.wiz-effect-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
	.wiz-effect-chip {
		padding: 8px 10px;
		border-radius: 10px;
		border: 1.5px solid rgba(255,255,255,0.08);
		background: rgba(255,255,255,0.03);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 7px;
		transition: all 0.18s;
	}
	.wiz-effect-chip:hover { background: rgba(255,255,255,0.07); }
	.wiz-effect-chip.active { background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12)); border-color: #6366f1; }
	.wiz-eff-emoji { font-size: 1.1rem; flex-shrink: 0; }
	.wiz-eff-name { font-size: 0.74rem; font-weight: 600; color: var(--text); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

	/* ── Custom Voice Tuner (Option A) ────────────────────────── */
	.custom-voice-tuner-card {
		margin-top: 14px;
		padding: 16px 18px;
		background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 17, 32, 0.9));
		border: 1px solid rgba(99, 102, 241, 0.25);
		border-radius: 14px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.tuner-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}
	.tuner-title-group {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.tuner-icon {
		font-size: 1.35rem;
		width: 34px;
		height: 34px;
		border-radius: 8px;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.tuner-title {
		font-size: 0.88rem;
		font-weight: 700;
		color: #f8fafc;
		display: block;
	}
	.tuner-sub {
		font-size: 0.72rem;
		color: #94a3b8;
		display: block;
	}
	.btn-test-custom-voice {
		padding: 7px 15px;
		background: linear-flex;
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		border: 1px solid #818cf8;
		border-radius: 8px;
		color: #ffffff;
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.18s ease;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
	}
	.btn-test-custom-voice:hover {
		background: linear-gradient(135deg, #4f46e5, #4338ca);
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
	}
	.btn-test-custom-voice.testing {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		border-color: #f87171;
		box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
		animation: pulseTesting 1s infinite alternate;
	}
	@keyframes pulseTesting {
		from { opacity: 0.85; transform: scale(0.98); }
		to { opacity: 1; transform: scale(1.02); }
	}
	.tuner-sliders-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 14px;
	}
	.tuner-slider-item {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 10px;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.tuner-slider-label-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.tuner-label-with-tooltip {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.slider-name {
		font-size: 0.74rem;
		font-weight: 600;
		color: #e2e8f0;
	}
	.slider-badge {
		font-size: 0.68rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 999px;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		color: #c7d2fe;
	}
	.slider-badge.bass-heavy {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.4);
		color: #6ee7b7;
	}
	.quick-preset-chips {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.quick-chip {
		padding: 2px 7px;
		font-size: 0.64rem;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.quick-chip:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #f1f5f9;
	}
	.quick-chip.active {
		background: rgba(99, 102, 241, 0.25);
		border-color: #6366f1;
		color: #c7d2fe;
		font-weight: 600;
	}
	.tuner-range-input {
		width: 100%;
		height: 6px;
		background: #1e293b;
		border-radius: 999px;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		margin: 4px 0 2px;
	}
	.tuner-range-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #818cf8;
		border: 2px solid #ffffff;
		box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
		cursor: pointer;
		transition: transform 0.12s ease;
	}
	.tuner-range-input::-webkit-slider-thumb:hover {
		transform: scale(1.2);
	}
	.slider-ticks {
		display: flex;
		justify-content: space-between;
		font-size: 0.62rem;
		color: #64748b;
	}

	/* BGM */
	.wiz-bgm-tracks { display: flex; gap: 6px; flex-wrap: wrap; }
	.wiz-bgm-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 20px;
		border: 1.5px solid rgba(255,255,255,0.08);
		background: rgba(255,255,255,0.03);
		cursor: pointer;
		transition: all 0.15s;
		font-size: 0.78rem;
	}
	.wiz-bgm-pill:hover { background: rgba(255,255,255,0.08); }
	.wiz-bgm-pill.active { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12)); border-color: #6366f1; color: #c7d2fe; }
	.wiz-bgm-play { width: 22px; height: 22px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.07); font-size: 0.66rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
	.wiz-bgm-play.playing { background: rgba(239,68,68,0.25); border-color: #ef4444; }
	.wiz-bgm-name { font-size: 0.78rem; font-weight: 600; }
	.wiz-bgm-badge { font-size: 0.6rem; font-weight: 700; padding: 1px 5px; border-radius: 4px; background: rgba(99,102,241,0.2); color: #a5b4fc; }
	.wiz-bgm-vol-row { display: flex; align-items: center; gap: 8px; }
	.wiz-vol-toggle { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
	.wiz-vol-toggle:hover { background: rgba(255,255,255,0.12); }
	.wiz-vol-slider { flex: 1; accent-color: #6366f1; }
	.wiz-vol-val { font-size: 0.76rem; font-weight: 600; color: var(--text); min-width: 32px; text-align: center; }
	.wiz-vol-hint { font-size: 0.68rem; color: var(--text-3); }

	/* Asset gallery */
	.wiz-asset-search-row { display: flex; flex-direction: column; gap: 8px; }
	.wiz-cat-pills { display: flex; gap: 5px; flex-wrap: wrap; }
	.wiz-cat-pill { padding: 4px 10px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: var(--text-2); font-size: 0.72rem; cursor: pointer; transition: all 0.15s; }
	.wiz-cat-pill.active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #c7d2fe; }
	.wiz-mini-asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 6px; max-height: 280px; overflow-y: auto; }
	.wiz-asset-thumb {
		aspect-ratio: 1;
		border-radius: 8px;
		overflow: hidden;
		border: 2px solid rgba(255,255,255,0.08);
		cursor: pointer;
		position: relative;
		transition: border-color 0.15s, transform 0.15s;
		padding: 0;
	}
	.wiz-asset-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
	.wiz-asset-thumb:hover { border-color: rgba(99,102,241,0.6); transform: scale(1.04); }
	.wiz-asset-thumb.selected { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.4); }
	.wiz-thumb-check { position: absolute; top: 2px; right: 2px; background: #6366f1; color: #fff; font-size: 0.62rem; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
	.wiz-more-hint { font-size: 0.72rem; color: var(--text-3); text-align: center; padding: 8px; }

	/* ── Legacy styles (studio-header for old reference, now replaced) ── */
	.studio-header { padding: 16px 24px; display: flex; align-items: center; gap: 18px; border-bottom: 1px solid var(--line); background: var(--bg-surface); }
	.title-wrap h2 { font-size: 1.15rem; font-weight: 800; margin: 0 0 2px; }
	.title-wrap p { font-size: 0.78rem; color: var(--text-2); margin: 0; }
	.studio-content {
		flex: 1;
		display: grid;
		grid-template-columns: clamp(380px, 31vw, 450px) minmax(0, 1fr);
		gap: 24px;
		padding: 22px 24px;
		max-width: 1560px;
		margin: 0 auto;
		width: 100%;
		align-items: start;
		box-sizing: border-box;
	}
	.script-panel {
		min-width: 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 18px;
		border-radius: var(--r-xl);
		background: var(--bg-surface);
		border: 1px solid var(--line);
		box-shadow: 0 8px 32px rgba(0,0,0,0.25);
	}
	.preview-panel {
		min-width: 0;
		max-width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 18px;
		border-radius: var(--r-xl);
		background: var(--bg-surface);
		border: 1px solid var(--line);
		box-shadow: 0 8px 32px rgba(0,0,0,0.25);
	}

	/* Slide Navigator */
	.slide-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 8px 12px;
		margin: 6px 0 2px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: 999px;
		width: fit-content;
		align-self: center;
	}
	.slide-nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--bg-surface);
		color: var(--text-1);
		font-size: 1.1rem;
		cursor: pointer;
		transition: background 0.18s, transform 0.12s, opacity 0.15s;
	}
	.slide-nav-btn:not(:disabled):hover {
		background: var(--primary);
		color: #fff;
		transform: scale(1.1);
		border-color: var(--primary);
	}
	.slide-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
	.slide-dots {
		display: flex;
		align-items: center;
		gap: 5px;
		max-width: 200px;
		flex-wrap: wrap;
		justify-content: center;
	}
	.slide-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: none;
		background: var(--line);
		cursor: pointer;
		transition: background 0.18s, transform 0.18s, width 0.18s;
		padding: 0;
		flex-shrink: 0;
	}
	.slide-dot.active {
		background: var(--primary);
		transform: scale(1.25);
		width: 18px;
		border-radius: 4px;
	}
	.slide-dot:hover:not(.active) { background: var(--text-2); transform: scale(1.15); }
	.slide-counter {
		font-size: 0.78rem;
		color: var(--text-2);
		min-width: 36px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	/* Scene Filmstrip */
	.scene-filmstrip-wrap {
		width: 100%;
		max-width: 100%;
		min-width: 0;
		box-sizing: border-box;
		overflow-x: auto;
		padding: 8px 0 4px;
		margin-top: 6px;
		scrollbar-width: thin;
		scrollbar-color: var(--line) transparent;
	}
	.scene-filmstrip-wrap::-webkit-scrollbar { height: 4px; }
	.scene-filmstrip-wrap::-webkit-scrollbar-track { background: transparent; }
	.scene-filmstrip-wrap::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
	.scene-filmstrip {
		display: flex;
		gap: 0;
		align-items: flex-end;
		min-width: max-content;
		padding: 0 4px;
	}
	.filmstrip-item-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		position: relative;
		margin-right: 4px;
	}
	.chapter-label {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		background: linear-gradient(90deg, rgba(99,102,241,0.25), rgba(99,102,241,0.10));
		border: 1px solid rgba(99,102,241,0.4);
		border-radius: 6px 6px 0 0;
		width: 100%;
		max-width: 84px;
		box-sizing: border-box;
		position: relative;
	}
	.chapter-label::before {
		content: '';
		position: absolute;
		left: 0; top: 0; bottom: 0;
		width: 3px;
		border-radius: 6px 0 0 0;
		background: #6366f1;
	}
	.chapter-label.hook-label {
		background: linear-gradient(90deg, rgba(239,68,68,0.25), rgba(239,68,68,0.10));
		border-color: rgba(239,68,68,0.45);
	}
	.chapter-label.hook-label::before { background: #ef4444; }
	.chapter-tag {
		font-size: 0.56rem;
		font-weight: 800;
		color: #a5b4fc;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.chapter-label.hook-label .chapter-tag { color: #fca5a5; }
	.chapter-title {
		font-size: 0.57rem;
		color: #cbd5e1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 58px;
		font-weight: 600;
	}
	.filmstrip-thumb {
		width: 84px;
		height: 54px;
		border-radius: 6px;
		border: 2px solid var(--line);
		background: var(--bg-card);
		overflow: hidden;
		position: relative;
		cursor: pointer;
		transition: border-color 0.18s, transform 0.15s, box-shadow 0.18s;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.filmstrip-thumb:hover {
		border-color: var(--text-2);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.35);
	}
	.filmstrip-thumb.active {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(99,102,241,0.35), 0 4px 14px rgba(99,102,241,0.25);
		transform: translateY(-2px) scale(1.04);
	}
	.filmstrip-thumb.has-chapter:not(.active) {
		border-color: rgba(99,102,241,0.55);
	}
	.filmstrip-thumb.is-hook:not(.active) {
		border-color: rgba(239,68,68,0.55);
	}
	.filmstrip-thumb.has-chapter.active {
		box-shadow: 0 0 0 2px rgba(99,102,241,0.5), 0 4px 14px rgba(99,102,241,0.3);
	}
	.thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.thumb-placeholder {
		font-size: 1.4rem;
		opacity: 0.4;
	}
	.thumb-num {
		position: absolute;
		top: 2px;
		left: 3px;
		font-size: 0.56rem;
		font-weight: 800;
		color: #fff;
		text-shadow: 0 1px 3px rgba(0,0,0,0.9);
		line-height: 1;
		z-index: 2;
	}
	.thumb-kp {
		position: absolute;
		bottom: 0;
		left: 0; right: 0;
		background: rgba(0,0,0,0.62);
		font-size: 0.5rem;
		color: #fff;
		padding: 2px 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: left;
		z-index: 2;
	}
	/* Change Image Button on canvas */
	.change-img-btn {
		position: absolute;
		bottom: 6px;
		right: 6px;
		z-index: 12;
		padding: 4px 10px;
		background: rgba(0,0,0,0.62);
		border: 1px solid rgba(255,255,255,0.22);
		border-radius: 8px;
		color: #fff;
		font-size: 0.72rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 5px;
		backdrop-filter: blur(6px);
		transition: background 0.18s, border-color 0.18s, transform 0.15s;
	}
	.change-img-btn:hover {
		background: rgba(99,102,241,0.75);
		border-color: #6366f1;
		transform: translateY(-1px);
	}

	/* ═══════════════════════════════════════════════════════════
	   Image Picker Modal (Spacious, Uncropped 16:9 Previews)
	═══════════════════════════════════════════════════════════ */
	.img-picker-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(3, 6, 16, 0.88);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.img-picker-modal {
		width: 100%;
		max-width: 1240px;
		height: 90vh;
		max-height: 920px;
		background: #090e1c;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 22px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 32px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.2);
		overflow: hidden;
		animation: pickerFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
		position: relative;
	}
	@keyframes pickerFadeIn {
		from { opacity: 0; transform: scale(0.96) translateY(14px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}

	/* Modal Header */
	.img-picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 18px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
		flex-shrink: 0;
	}
	.img-picker-title {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.picker-icon-badge {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15));
		border: 1px solid rgba(99, 102, 241, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.35rem;
		flex-shrink: 0;
	}
	.img-picker-title strong {
		font-size: 1.1rem;
		color: #f8fafc;
		display: block;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.img-picker-title small {
		font-size: 0.78rem;
		color: #94a3b8;
	}
	.img-picker-close {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #94a3b8;
		cursor: pointer;
		font-size: 0.95rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}
	.img-picker-close:hover {
		background: rgba(239, 68, 68, 0.18);
		border-color: rgba(239, 68, 68, 0.4);
		color: #fca5a5;
		transform: scale(1.05);
	}

	/* Toolbar: Search & Upload */
	.img-picker-toolbar {
		display: flex;
		gap: 12px;
		padding: 12px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		align-items: center;
		background: rgba(0, 0, 0, 0.18);
		flex-shrink: 0;
	}
	.img-picker-search-wrap {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}
	.img-picker-search-wrap .search-icon {
		position: absolute;
		left: 14px;
		font-size: 0.9rem;
		opacity: 0.7;
		pointer-events: none;
	}
	.img-picker-search {
		width: 100%;
		padding: 10px 38px 10px 38px;
		background: rgba(0, 0, 0, 0.45);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		color: #f8fafc;
		font-size: 0.85rem;
		outline: none;
		transition: all 0.18s ease;
	}
	.img-picker-search:focus {
		border-color: #6366f1;
		background: rgba(0, 0, 0, 0.6);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
	}
	.btn-clear-search {
		position: absolute;
		right: 12px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.12);
		border: none;
		color: #cbd5e1;
		font-size: 0.7rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s;
	}
	.btn-clear-search:hover {
		background: rgba(255, 255, 255, 0.25);
		color: #ffffff;
	}
	.btn-upload-img {
		padding: 10px 16px;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.2));
		border: 1px solid rgba(99, 102, 241, 0.5);
		border-radius: 10px;
		color: #c7d2fe;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.18s ease;
	}
	.btn-upload-img:hover {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(79, 70, 229, 0.35));
		border-color: #818cf8;
		color: #ffffff;
		transform: translateY(-1px);
		box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
	}

	/* Categories */
	.img-picker-cats {
		display: flex;
		gap: 8px;
		padding: 10px 24px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		background: rgba(0, 0, 0, 0.22);
		overflow-x: auto;
		scrollbar-width: thin;
		flex-shrink: 0;
	}
	.cat-pill {
		font-size: 0.74rem;
		font-weight: 600;
		padding: 6px 12px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.04);
		color: #94a3b8;
		border: 1px solid rgba(255, 255, 255, 0.08);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.cat-pill:hover {
		background: rgba(255, 255, 255, 0.09);
		border-color: rgba(99, 102, 241, 0.4);
		color: #f1f5f9;
	}
	.cat-pill.active {
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		color: #ffffff;
		border-color: #818cf8;
		box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
	}

	/* Count, Scene Preview & Size Switcher Bar */
	.img-picker-count {
		padding: 10px 24px;
		font-size: 0.76rem;
		color: #94a3b8;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		background: rgba(255, 255, 255, 0.015);
		flex-shrink: 0;
		gap: 16px;
		flex-wrap: wrap;
	}
	.img-picker-count-left {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.count-badge strong {
		color: #f8fafc;
	}
	.current-scene-indicator {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 3px 10px 3px 6px;
		background: rgba(99, 102, 241, 0.12);
		border: 1px solid rgba(99, 102, 241, 0.25);
		border-radius: 999px;
	}
	.current-label {
		font-size: 0.68rem;
		color: #a5b4fc;
		font-weight: 600;
	}
	.current-thumb {
		width: 24px;
		height: 16px;
		border-radius: 3px;
		object-fit: cover;
		background: #000;
	}
	.current-title {
		font-size: 0.68rem;
		color: #e2e8f0;
		max-width: 160px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.img-picker-count-right {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.picker-size-toggle {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: rgba(0, 0, 0, 0.35);
		padding: 3px 4px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.size-label {
		font-size: 0.68rem;
		color: #64748b;
		padding: 0 4px;
		font-weight: 600;
	}
	.size-btn {
		padding: 3px 8px;
		font-size: 0.7rem;
		font-weight: 600;
		border-radius: 6px;
		color: #94a3b8;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.size-btn:hover {
		color: #f1f5f9;
		background: rgba(255, 255, 255, 0.06);
	}
	.size-btn.active {
		background: #6366f1;
		color: #ffffff;
		box-shadow: 0 1px 6px rgba(99, 102, 241, 0.35);
	}
	.btn-reset-filter {
		background: transparent;
		border: none;
		color: #818cf8;
		font-size: 0.74rem;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		font-weight: 500;
	}
	.btn-reset-filter:hover { color: #c7d2fe; }

	/* Image Grid & Size Presets */
	.img-picker-grid {
		display: grid;
		padding: 20px 24px 28px;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
		align-content: start;
	}
	/* Default Large: 280px minimum width, generous 16:9 full view */
	.img-picker-grid.size-large {
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}
	.img-picker-grid.size-medium {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 14px;
	}
	.img-picker-grid.size-compact {
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
	}

	.img-picker-empty {
		grid-column: 1 / -1;
		text-align: center;
		padding: 60px 20px;
		color: #64748b;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	.empty-icon { font-size: 2.5rem; }
	.img-picker-empty p { margin: 0; font-size: 0.95rem; color: #cbd5e1; }
	.img-picker-empty small { font-size: 0.78rem; color: #64748b; }
	.btn-reset-empty {
		margin-top: 8px;
		padding: 8px 16px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 8px;
		color: #a5b4fc;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}
	.btn-reset-empty:hover {
		background: rgba(99, 102, 241, 0.35);
		color: #ffffff;
	}

	/* Card Elements (Full Image Preview & Responsive Layout) */
	.img-pick-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
		background: #0d1527;
		border: 1.5px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
		overflow: hidden;
		cursor: pointer;
		text-align: left;
		padding: 0;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		position: relative;
		user-select: none;
	}
	.img-pick-card:hover {
		border-color: #6366f1;
		transform: translateY(-3px);
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55), 0 0 18px rgba(99, 102, 241, 0.3);
		background: #111a31;
	}
	.img-pick-card.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.7), 0 8px 24px rgba(99, 102, 241, 0.35);
		background: rgba(99, 102, 241, 0.12);
	}

	/* Full Image Container: 16:9 Aspect Ratio */
	.pick-card-img-wrap {
		width: 100%;
		aspect-ratio: 16 / 9;
		position: relative;
		overflow: hidden;
		background: radial-gradient(circle at center, #10192e 0%, #050812 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	/* Responsive minimum heights per preset to guarantee zero collapse */
	.size-large .pick-card-img-wrap { min-height: 155px; }
	.size-medium .pick-card-img-wrap { min-height: 110px; }
	.size-compact .pick-card-img-wrap { min-height: 78px; }

	/* object-fit: contain shows 100% of the stickman illustration without ANY cropping */
	.pick-card-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
		transition: transform 0.22s ease;
	}
	.img-pick-card:hover .pick-card-img {
		transform: scale(1.04);
	}

	/* Selected Badge */
	.pick-card-check {
		position: absolute;
		top: 8px;
		left: 8px;
		padding: 3px 8px;
		background: #6366f1;
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 999px;
		color: #ffffff;
		font-size: 0.68rem;
		font-weight: 800;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
		z-index: 3;
	}

	/* Quick Zoom Button */
	.btn-quick-zoom {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #e2e8f0;
		font-size: 0.78rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all 0.15s ease;
		backdrop-filter: blur(4px);
		z-index: 4;
	}
	.img-pick-card:hover .btn-quick-zoom {
		opacity: 1;
	}
	.btn-quick-zoom:hover {
		background: #6366f1;
		border-color: #818cf8;
		transform: scale(1.1);
		color: #ffffff;
	}

	/* Card Select Overlay on Hover */
	.card-select-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 8px;
		background: linear-gradient(to top, rgba(9, 14, 28, 0.95), transparent);
		display: flex;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.18s ease;
		pointer-events: none;
		z-index: 2;
	}
	.img-pick-card:hover .card-select-overlay {
		opacity: 1;
	}
	.select-overlay-text {
		font-size: 0.72rem;
		font-weight: 700;
		color: #c7d2fe;
		background: rgba(99, 102, 241, 0.35);
		border: 1px solid rgba(99, 102, 241, 0.5);
		padding: 2px 10px;
		border-radius: 999px;
	}

	/* Info & Metadata Footer */
	.pick-card-info {
		padding: 10px 12px 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		background: rgba(10, 16, 30, 0.96);
		flex: 1;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}
	.size-compact .pick-card-info {
		padding: 6px 8px 8px;
		gap: 3px;
	}
	.pick-card-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 6px;
	}
	.pick-card-label {
		font-size: 0.78rem;
		font-weight: 600;
		color: #f1f5f9;
		line-height: 1.3;
		text-transform: capitalize;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}
	.size-large .pick-card-label {
		font-size: 0.84rem;
		font-weight: 700;
	}
	.size-compact .pick-card-label {
		font-size: 0.68rem;
	}
	.pick-card-side-badge {
		font-size: 0.6rem;
		font-weight: 600;
		color: #94a3b8;
		background: rgba(255, 255, 255, 0.06);
		padding: 2px 6px;
		border-radius: 4px;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.pick-card-tags {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.tag-pill {
		font-size: 0.62rem;
		color: #818cf8;
		background: rgba(99, 102, 241, 0.1);
		padding: 1px 6px;
		border-radius: 4px;
		white-space: nowrap;
	}

	/* Load More Button */
	.img-picker-load-more {
		grid-column: 1 / -1;
		display: flex;
		justify-content: center;
		padding: 18px 0 10px;
	}
	.btn-load-more-assets {
		padding: 11px 26px;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.15));
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 999px;
		color: #c7d2fe;
		font-size: 0.84rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.18s ease;
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.btn-load-more-assets:hover {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(79, 70, 229, 0.3));
		border-color: #818cf8;
		color: #ffffff;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
	}

	/* ═══════════════════════════════════════════════════════════
	   Full High-Res Lightbox Modal (For Crystal Clear Inspection)
	═══════════════════════════════════════════════════════════ */
	.asset-lightbox-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(2, 4, 10, 0.92);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		z-index: 10010;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		animation: pickerFadeIn 0.18s ease-out;
	}
	.asset-lightbox-modal {
		width: 100%;
		max-width: 900px;
		background: #0b1120;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 20px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 32px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(99, 102, 241, 0.3);
	}
	.lightbox-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 22px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}
	.lightbox-title-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.lightbox-title {
		font-size: 1.05rem;
		color: #f8fafc;
		font-weight: 700;
		text-transform: capitalize;
	}
	.lightbox-side-badge {
		font-size: 0.72rem;
		color: #c7d2fe;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.4);
		padding: 2px 8px;
		border-radius: 6px;
	}
	.lightbox-close-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #94a3b8;
		cursor: pointer;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}
	.lightbox-close-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		color: #fca5a5;
	}
	.lightbox-img-wrap {
		width: 100%;
		aspect-ratio: 16 / 9;
		max-height: 520px;
		background: radial-gradient(circle at center, #111a31 0%, #030610 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.lightbox-img-full {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}
	.lightbox-footer {
		padding: 16px 22px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.lightbox-tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.lightbox-tag {
		font-size: 0.72rem;
		color: #818cf8;
		background: rgba(99, 102, 241, 0.12);
		padding: 2px 8px;
		border-radius: 6px;
	}
	.lightbox-actions {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-left: auto;
	}
	.btn-lightbox-cancel {
		padding: 9px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #cbd5e1;
		font-size: 0.82rem;
		cursor: pointer;
		transition: background 0.15s;
	}
	.btn-lightbox-cancel:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}
	.btn-lightbox-select {
		padding: 9px 20px;
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		border: 1px solid #818cf8;
		border-radius: 8px;
		color: #ffffff;
		font-size: 0.82rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
		box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
	}
	.btn-lightbox-select:hover {
		background: linear-gradient(135deg, #4f46e5, #4338ca);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
	}

	/* Card 1: Video Title Card */
	.video-title-card {
		padding: 14px 16px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: 0 4px 16px rgba(0,0,0,0.18);
		transition: border-color 0.2s ease;
	}
	.video-title-card:focus-within {
		border-color: rgba(99,102,241,0.4);
	}
	.title-head-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}
	.title-label-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.title-label {
		font-size: 0.8rem;
		font-weight: 800;
		color: #e2e8f0;
		letter-spacing: 0.02em;
	}
	.title-char-count {
		font-size: 0.72rem;
		color: var(--text-3);
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.badge-mobile {
		font-size: 0.65rem;
		padding: 2px 7px;
		border-radius: 999px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.35);
		color: #6ee7b7;
		font-weight: 600;
	}
	.title-btn-group {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.btn-quick-title, .btn-open-title-modal {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 11px;
		border-radius: var(--r-full);
		font-size: 0.74rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
	}
	.btn-quick-title {
		background: rgba(245, 158, 11, 0.12);
		border: 1px solid rgba(245, 158, 11, 0.35);
		color: #fbbf24;
	}
	.btn-quick-title:hover:not(:disabled) {
		background: rgba(245, 158, 11, 0.22);
		border-color: #f59e0b;
		color: #ffffff;
		transform: translateY(-1px);
	}
	.btn-quick-title:disabled { opacity: 0.45; cursor: not-allowed; }
	.btn-open-title-modal {
		background: rgba(239, 68, 68, 0.14);
		border: 1px solid rgba(239, 68, 68, 0.38);
		color: #fca5a5;
	}
	.btn-open-title-modal:hover {
		background: rgba(239, 68, 68, 0.26);
		border-color: #ef4444;
		color: #ffffff;
		transform: translateY(-1px);
	}
	.title-input-wrap { width: 100%; }
	.title-input {
		width: 100%;
		padding: 10px 14px;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		color: var(--text);
		font-size: 0.9rem;
		font-weight: 600;
		box-sizing: border-box;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.title-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
	}
	.title-bottom-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		padding-top: 2px;
	}
	.title-niche-chips {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chips-label {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text-3);
		margin-right: 2px;
	}
	.mini-niche-btn {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: var(--r-full);
		color: var(--text-2);
		font-size: 0.72rem;
		font-weight: 600;
		padding: 3px 10px;
		cursor: pointer;
		transition: all 0.16s ease;
	}
	.mini-niche-btn:hover {
		background: rgba(249, 115, 22, 0.16);
		border-color: rgba(249, 115, 22, 0.4);
		color: #fdba74;
		transform: translateY(-1px);
	}
	.btn-title-to-script {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(56, 189, 248, 0.28));
		border: 1px solid rgba(56, 189, 248, 0.45);
		color: #38bdf8;
		font-size: 0.74rem;
		font-weight: 700;
		padding: 4px 12px;
		border-radius: var(--r-full);
		cursor: pointer;
		transition: all 0.18s ease;
		margin-left: auto;
	}
	.btn-title-to-script:hover {
		background: linear-gradient(135deg, rgba(14, 165, 233, 0.38), rgba(56, 189, 248, 0.5));
		border-color: #38bdf8;
		color: #ffffff;
		transform: translateY(-1px);
		box-shadow: 0 4px 14px rgba(56, 189, 248, 0.25);
	}
	.text-amber { color: #f59e0b; }

	/* Card 2: Script Editor Card */
	.script-editor-card {
		padding: 14px 16px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: 0 4px 16px rgba(0,0,0,0.18);
	}
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}
	.panel-title-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.panel-header h3 {
		font-size: 0.95rem;
		font-weight: 800;
		margin: 0;
	}
	.badge {
		font-size: 0.68rem;
		padding: 3px 8px;
		border-radius: 999px;
		background: rgba(255,255,255,0.06);
		border: 1px solid var(--line);
		color: var(--text-2);
		font-weight: 600;
	}
	.panel-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.btn-tool-humanize {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 13px;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(139, 92, 246, 0.14));
		border: 1px solid rgba(99, 102, 241, 0.42);
		border-radius: var(--r-full);
		color: #c7d2fe;
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.btn-tool-humanize:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(139, 92, 246, 0.28));
		border-color: #818cf8;
		color: #ffffff;
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.32);
	}
	.btn-tool-humanize:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}
	.humanize-icon {
		color: #a5b4fc;
		transition: transform 0.2s;
	}
	.btn-tool-humanize:hover:not(:disabled) .humanize-icon {
		transform: rotate(15deg) scale(1.1);
	}
	.humanize-notice {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 12px;
		background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.12));
		border: 1px solid rgba(99, 102, 241, 0.35);
		border-radius: var(--r-md);
		font-size: 0.74rem;
		color: #e0e7ff;
		font-weight: 600;
		animation: noticeSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.humanize-notice .notice-icon {
		color: #818cf8;
		flex-shrink: 0;
	}
	@keyframes noticeSlideDown {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.mini-humanize-btn {
		background: rgba(99, 102, 241, 0.12);
		border: 1px solid rgba(99, 102, 241, 0.3);
		color: #a5b4fc;
		font-size: 0.65rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: var(--r-full);
		cursor: pointer;
		transition: all 0.15s;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.mini-humanize-btn:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.28);
		border-color: #818cf8;
		color: #fff;
		transform: translateY(-0.5px);
	}
	.mini-humanize-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.btn-ai-gen {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(220, 38, 38, 0.16));
		border: 1px solid rgba(239, 68, 68, 0.45);
		border-radius: var(--r-full);
		color: #fca5a5;
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-ai-gen:hover {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(220, 38, 38, 0.28));
		border-color: #ef4444;
		color: #ffffff;
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
	}
	.flame-icon { color: #f87171; }

	.quick-preset-bar {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.preset-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.preset-label {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-3);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	.preset-lang-tabs {
		display: flex;
		gap: 3px;
		background: rgba(255, 255, 255, 0.04);
		padding: 2px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
	}
	.lang-tab-btn {
		padding: 2px 8px;
		background: transparent;
		border: none;
		border-radius: 4px;
		font-size: 0.68rem;
		font-weight: 600;
		color: var(--text-3);
		cursor: pointer;
		transition: all 0.15s;
	}
	.lang-tab-btn:hover {
		color: var(--text);
	}
	.lang-tab-btn.active {
		background: var(--primary);
		color: #ffffff;
	}
	.lang-flag-mini {
		display: inline-block;
		font-size: 0.6rem;
		font-weight: 700;
		padding: 1px 4px;
		background: rgba(99, 102, 241, 0.35);
		color: #c7d2fe;
		border-radius: 3px;
		margin-right: 4px;
		vertical-align: middle;
	}
	.preset-pills {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.preset-pill {
		padding: 3px 9px;
		background: rgba(255,255,255,0.04);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--text-2);
		cursor: pointer;
		transition: all 0.15s;
	}
	.preset-pill:hover {
		border-color: var(--line-strong);
		color: var(--text);
		transform: translateY(-1px);
	}
	.preset-pill.active {
		background: var(--primary);
		border-color: var(--primary);
		color: #fff;
		font-weight: 600;
	}

	.textarea-wrapper {
		display: flex;
		flex-direction: column;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		overflow: hidden;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.textarea-wrapper:focus-within {
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(99,102,241,0.16);
	}
	.textarea-wrapper textarea {
		width: 100%;
		min-height: 200px;
		background: transparent;
		border: none;
		padding: 12px 14px;
		color: var(--text);
		font-size: 0.88rem;
		line-height: 1.6;
		resize: vertical;
		outline: none;
		box-sizing: border-box;
	}
	.textarea-footer-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 12px;
		background: rgba(0,0,0,0.22);
		border-top: 1px solid rgba(255,255,255,0.05);
		font-size: 0.72rem;
		color: var(--text-3);
		flex-wrap: wrap;
		gap: 6px;
	}
	.stat-items {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.stat-pill {
		font-weight: 600;
		color: var(--text-2);
	}
	.format-hint code {
		background: rgba(255,255,255,0.08);
		padding: 1px 5px;
		border-radius: 4px;
		font-size: 0.68rem;
		color: #a5b4fc;
	}

	/* Card 3: Unified Audio & Voice Studio Card */
	.audio-studio-card {
		padding: 14px 16px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: 0 4px 16px rgba(0,0,0,0.18);
	}
	.audio-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}
	.audio-card-title {
		font-size: 0.82rem;
		font-weight: 800;
		color: #e2e8f0;
		letter-spacing: 0.02em;
	}
	.audio-tab-nav {
		display: flex;
		gap: 4px;
		background: var(--bg-surface);
		padding: 3px;
		border-radius: var(--r-md);
		border: 1px solid var(--line);
	}
	.audio-tab-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 6px;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-2);
		cursor: pointer;
		transition: all 0.16s ease;
	}
	.audio-tab-btn:hover {
		color: var(--text);
		background: rgba(255,255,255,0.04);
	}
	.audio-tab-btn.active {
		background: var(--primary);
		color: #fff;
		box-shadow: 0 2px 8px rgba(99,102,241,0.3);
	}
	.tab-indicator-badge {
		font-size: 0.62rem;
		padding: 1px 5px;
		border-radius: 4px;
		background: rgba(0,0,0,0.25);
		color: inherit;
		opacity: 0.9;
	}
	.audio-tab-content {
		width: 100%;
	}

	/* Voice Cards Grid */
	.voice-cards-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}
	.voice-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: var(--bg-surface);
		border: 1.5px solid var(--line);
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.18s ease;
		text-align: left;
	}
	.voice-card:hover {
		border-color: rgba(99,102,241,0.5);
		background: rgba(99,102,241,0.06);
		transform: translateY(-1px);
	}
	.voice-card.active {
		border-color: var(--primary);
		background: rgba(99,102,241,0.14);
		box-shadow: 0 0 0 1px var(--primary);
	}
	.voice-avatar {
		font-size: 1.3rem;
		flex-shrink: 0;
	}
	.voice-info {
		flex: 1;
		min-width: 0;
	}
	.voice-name-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.voice-name {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text);
	}
	.voice-gender-pill {
		font-size: 0.6rem;
		padding: 1px 5px;
		border-radius: 4px;
		background: rgba(255,255,255,0.06);
		color: var(--text-3);
		font-weight: 600;
	}
	.voice-lang {
		font-size: 0.66rem;
		color: var(--text-3);
		display: block;
	}

	/* Effect Chips Grid */
	.effect-chips-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 6px;
	}
	.effect-card-chip {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: var(--bg-surface);
		border: 1.5px solid var(--line);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.16s ease;
	}
	.effect-card-chip:hover {
		border-color: rgba(99,102,241,0.5);
		transform: translateY(-1px);
	}
	.effect-card-chip.active {
		border-color: var(--primary);
		background: rgba(99,102,241,0.14);
		box-shadow: 0 0 0 1px var(--primary);
	}
	.eff-emoji { font-size: 0.95rem; }
	.eff-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.eff-title {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.eff-tag-pill {
		font-size: 0.58rem;
		color: var(--text-3);
		font-weight: 600;
	}

	/* BGM Tab Panel */
	.bgm-tab-panel {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.bgm-tracks-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.bgm-track-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		background: var(--bg-surface);
		border: 1.5px solid var(--line);
		border-radius: var(--r-full);
		font-size: 0.72rem;
		color: var(--text-2);
		cursor: pointer;
		transition: all 0.16s ease;
	}
	.bgm-track-pill:hover {
		border-color: var(--line-strong);
		color: var(--text);
		transform: translateY(-1px);
	}
	.bgm-track-pill.active {
		border-color: var(--primary);
		background: rgba(99,102,241,0.14);
		color: #fff;
		font-weight: 700;
		box-shadow: 0 0 0 1px var(--primary);
	}
	.bgm-mini-play {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(255,255,255,0.08);
		border: 1px solid var(--line);
		color: var(--text-2);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.55rem;
		cursor: pointer;
	}
	.bgm-mini-play.playing {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
	}
	.bgm-track-title { font-size: 0.72rem; }
	.bgm-track-badge {
		font-size: 0.58rem;
		padding: 1px 5px;
		border-radius: 4px;
		background: rgba(255,255,255,0.06);
		color: var(--text-3);
	}
	.bgm-slider-container {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
	.btn-bgm-mute-toggle {
		font-size: 1rem;
		color: var(--text-2);
		cursor: pointer;
		padding: 2px;
	}
	.bgm-slider-track { flex: 1; display: flex; align-items: center; }
	.bgm-slider-track input { width: 100%; accent-color: var(--primary); cursor: pointer; }
	.bgm-vol-val { font-size: 0.75rem; font-weight: 700; color: var(--text); min-width: 36px; }
	.vol-ideal-pill {
		font-size: 0.65rem;
		padding: 2px 7px;
		border-radius: var(--r-sm);
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: #6ee7b7;
		font-weight: 600;
	}

	/* Primary Action CTA */
	.action-buttons-row {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 4px;
	}
	.action-buttons-row .generate-btn {
		flex: 1;
		min-width: 200px;
		padding: 13px 20px;
		font-size: 0.95rem;
		font-weight: 800;
		background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #9333ea 100%);
		border: none;
		border-radius: var(--r-lg);
		box-shadow: 0 6px 24px rgba(99,102,241,0.38);
		cursor: pointer;
		transition: all 0.22s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		color: #ffffff;
	}
	.action-buttons-row .generate-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(99,102,241,0.55);
		filter: brightness(1.08);
	}
	.action-buttons-row .generate-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
		transform: none;
	}

	/* Right Panel - Studio Monitor Frame */
	.header-aspect-switcher {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		padding: 3px;
		background: rgba(15, 23, 42, 0.85);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		gap: 3px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	.aspect-switch-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border-radius: 7px;
		border: 1px solid transparent;
		background: transparent;
		color: #94a3b8;
		font-size: 0.78rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
	}
	.aspect-switch-pill:hover {
		color: #f1f5f9;
		background: rgba(255, 255, 255, 0.06);
	}
	.aspect-switch-pill.active {
		background: linear-gradient(135deg, #4f46e5, #6366f1);
		border-color: rgba(99, 102, 241, 0.5);
		color: #ffffff;
		box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
	}
	.aspect-switch-pill .pill-badge {
		font-size: 0.58rem;
		font-weight: 800;
		padding: 1px 5px;
		border-radius: 4px;
		background: #ef4444;
		color: #ffffff;
		letter-spacing: 0.04em;
	}

	/* Right Panel - Studio Monitor Frame */
	.canvas-wrapper {
		width: 100%;
		max-width: 820px;
		margin: 0 auto;
		aspect-ratio: 16/9;
		position: relative;
		background: #090d18;
		border: 1.5px solid rgba(255,255,255,0.12);
		border-radius: var(--r-lg);
		overflow: hidden;
		box-shadow: 0 16px 44px rgba(0,0,0,0.55);
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		transition: aspect-ratio 0.35s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
	}
	/* Shorts / Portrait phone frame mode */
	.canvas-wrapper.is-shorts {
		aspect-ratio: 9 / 16;
		max-width: 290px;
		border: 3px solid rgba(99,102,241,0.65);
		border-radius: 20px;
		box-shadow: 0 0 0 4px rgba(99,102,241,0.12), 0 16px 44px rgba(0,0,0,0.55), 0 0 24px rgba(99,102,241,0.2);
	}
	/* phone-frame notch decoration */
	.canvas-wrapper.is-shorts::before {
		content: '';
		position: absolute;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		width: 48px;
		height: 5px;
		background: rgba(255,255,255,0.25);
		border-radius: 999px;
		z-index: 20;
		pointer-events: none;
	}
	/* Di mode shorts: perkecil gambar stickman agar proporsional, tidak terpotong, & posisikan di tengah layar */
	.canvas-wrapper.is-shorts .stickman-bg-layer {
		background-size: 80% auto !important;
		background-repeat: no-repeat !important;
		background-position: center center !important;
	}
	/* Buttons & components adjustments inside shorts phone frame */
	.canvas-wrapper.is-shorts .flip-btn {
		bottom: 8px;
		left: 8px;
		font-size: 0.64rem;
		padding: 3px 6px;
	}
	.canvas-wrapper.is-shorts .auto-align-btn {
		display: inline-flex;
		bottom: 8px;
		left: 72px;
		font-size: 0.64rem;
		padding: 3px 6px;
	}
	.canvas-wrapper.is-shorts .change-img-btn {
		bottom: 8px;
		right: 8px;
		font-size: 0.64rem;
		padding: 3px 6px;
	}
	.canvas-wrapper.is-shorts .canvas-fs-pill {
		bottom: auto;
		top: 32px;
		right: 6px;
		left: auto;
		padding: 2px 4px;
		z-index: 15;
		background: rgba(15, 23, 42, 0.92);
	}
	.canvas-wrapper.is-shorts .monitor-top-bar {
		padding: 4px 6px;
		gap: 4px;
	}
	.canvas-wrapper.is-shorts .status-label {
		font-size: 0.54rem;
		white-space: nowrap;
	}
	.canvas-wrapper.is-shorts .aspect-toggle-btn {
		padding: 2px 5px;
		font-size: 0.6rem;
		gap: 3px;
	}
	.canvas-wrapper.is-shorts .pacing-badge {
		display: none;
	}
	.canvas-wrapper.is-shorts .scene-counter-badge {
		font-size: 0.54rem;
		padding: 1px 4px;
		white-space: nowrap;
	}
	.canvas-wrapper.is-shorts .audio-dur-badge {
		font-size: 0.54rem;
		padding: 1px 4px;
	}
	.canvas-wrapper.is-shorts .scene-chapter-badge {
		display: none;
	}
	.canvas-wrapper.is-shorts .studio-empty-monitor {
		padding: 16px;
		gap: 8px;
	}
	.canvas-wrapper.is-shorts .empty-glow-circle {
		width: 48px;
		height: 48px;
	}
	.canvas-wrapper.is-shorts .empty-monitor-title {
		font-size: 0.95rem;
	}
	.canvas-wrapper.is-shorts .empty-monitor-desc {
		font-size: 0.72rem;
		max-width: 240px;
		line-height: 1.4;
	}
	.canvas-wrapper.is-shorts .feat-pill {
		padding: 2px 6px;
		font-size: 0.65rem;
	}
	/* Aspect toggle button */
	.aspect-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 8px;
		border-radius: 6px;
		border: 1px solid rgba(255,255,255,0.15);
		background: rgba(15,23,42,0.7);
		color: #94a3b8;
		font-size: 0.68rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
		letter-spacing: 0.03em;
		pointer-events: auto;
		z-index: 25;
	}
	.aspect-toggle-btn:hover {
		border-color: rgba(99,102,241,0.5);
		color: #c7d2fe;
		background: rgba(99,102,241,0.12);
	}
	.aspect-toggle-btn.shorts-active {
		background: rgba(99,102,241,0.22);
		border-color: rgba(99,102,241,0.7);
		color: #c7d2fe;
	}
	.shorts-badge {
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: #fff;
		font-size: 0.55rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		padding: 1px 5px;
		border-radius: 4px;
	}
	.monitor-top-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 12px;
		background: linear-gradient(180deg, rgba(5,8,16,0.85) 0%, rgba(5,8,16,0.0) 100%);
		pointer-events: none;
	}
	.monitor-top-bar > * {
		pointer-events: auto;
	}
	.monitor-status {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #f43f5e;
	}
	.status-dot.live {
		background: #10b981;
		box-shadow: 0 0 8px #10b981;
		animation: pulseGlow 1.5s infinite;
	}
	.status-label {
		font-size: 0.62rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		color: #cbd5e1;
		text-transform: uppercase;
	}
	.monitor-meta {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.scene-counter-badge, .aspect-badge {
		font-size: 0.62rem;
		padding: 2px 7px;
		border-radius: 4px;
		background: rgba(0,0,0,0.55);
		border: 1px solid rgba(255,255,255,0.12);
		color: #94a3b8;
		font-weight: 700;
		letter-spacing: 0.02em;
	}
	.pacing-badge {
		font-size: 0.62rem;
		padding: 2px 7px;
		border-radius: 4px;
		background: rgba(16, 185, 129, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.45);
		color: #6ee7b7;
		font-weight: 800;
		letter-spacing: 0.02em;
	}
	.scene-chapter-badge {
		font-size: 0.62rem;
		padding: 2px 7px;
		border-radius: 4px;
		background: rgba(99,102,241,0.25);
		border: 1px solid rgba(99,102,241,0.45);
		color: #c7d2fe;
		font-weight: 700;
	}
	.scene-chapter-badge.hook-badge {
		background: rgba(239,68,68,0.25);
		border-color: rgba(239,68,68,0.45);
		color: #fca5a5;
	}

	/* Studio Empty Monitor Screen */
	.studio-empty-monitor {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 30px;
		gap: 12px;
		background: radial-gradient(circle at center, #10172a 0%, #060912 100%);
	}
	.empty-glow-circle {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background: rgba(99,102,241,0.12);
		border: 1px solid rgba(99,102,241,0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 30px rgba(99,102,241,0.2);
	}
	.empty-monitor-title {
		font-size: 1.15rem;
		font-weight: 800;
		color: #f8fafc;
		margin: 0;
	}
	.empty-monitor-desc {
		font-size: 0.82rem;
		color: #94a3b8;
		max-width: 440px;
		line-height: 1.5;
		margin: 0;
	}
	.empty-monitor-desc strong {
		color: #c7d2fe;
	}
	.empty-monitor-features {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 4px;
	}
	.feat-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 10px;
		border-radius: var(--r-full);
		background: rgba(255,255,255,0.04);
		border: 1px solid rgba(255,255,255,0.08);
		font-size: 0.7rem;
		font-weight: 600;
		color: #cbd5e1;
	}
	.text-indigo { color: #818cf8; }

	/* Studio Guide Card */
	.studio-guide-card {
		padding: 16px 18px;
		background: var(--bg-card);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.guide-card-head {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.guide-card-title {
		font-size: 0.85rem;
		font-weight: 800;
		color: #f1f5f9;
	}
	.guide-steps-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}
	.guide-step-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 10px 12px;
		background: var(--bg-surface);
		border: 1px solid var(--line);
		border-radius: 10px;
	}
	.guide-step-item.highlight-step {
		background: rgba(99,102,241,0.08);
		border-color: rgba(99,102,241,0.3);
	}
	.step-num {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--primary);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.step-desc {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.step-desc strong {
		font-size: 0.78rem;
		color: #f8fafc;
	}
	.step-desc small {
		font-size: 0.68rem;
		color: #94a3b8;
		line-height: 1.35;
	}

	/* Structured Scene Styling Cards */
	.scene-style-cards {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.style-card {
		padding: 14px 16px;
		background: rgba(15, 23, 42, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(8px);
	}
	.style-card-title {
		font-size: 0.8rem;
		font-weight: 800;
		color: #f1f5f9;
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
		padding-bottom: 8px;
		letter-spacing: 0.02em;
	}
	.style-card-content {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.style-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 3px 0;
	}
	.style-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #94a3b8;
		min-width: 95px;
		padding-top: 5px;
		flex-shrink: 0;
		line-height: 1.25;
	}
	.style-label.font-label {
		min-width: auto;
		margin-left: 10px;
		padding-top: 6px;
	}
	.style-row-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.anim-pills {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		flex: 1;
		min-width: 0;
	}
	.anim-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		font-size: 0.72rem;
		font-weight: 600;
		padding: 5px 10px;
		border-radius: 8px;
		background: rgba(30, 41, 59, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #cbd5e1;
		cursor: pointer;
		transition: all 0.16s ease;
		white-space: nowrap;
		user-select: none;
		line-height: 1.25;
	}
	.anim-pill:hover {
		background: rgba(51, 65, 85, 0.9);
		border-color: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		transform: translateY(-1px);
	}
	.anim-pill.on {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.25) 100%);
		border-color: #6366f1;
		color: #c7d2fe;
		font-weight: 700;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
	}
	.upload-sfx-pill {
		background: rgba(15, 23, 42, 0.6);
		border: 1px dashed rgba(148, 163, 184, 0.35);
		color: #94a3b8;
	}
	.upload-sfx-pill:hover {
		border-color: #6366f1;
		color: #c7d2fe;
		background: rgba(99, 102, 241, 0.12);
	}
	.custom-sfx-pill {
		border-color: rgba(245, 158, 11, 0.4);
		color: #fbbf24;
	}
	.custom-sfx-pill.on {
		background: rgba(245, 158, 11, 0.25);
		border-color: #f59e0b;
		color: #fef3c7;
		box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
	}
	.color-dots {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		flex: 1;
	}
	.color-dot {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
		padding: 0;
	}
	.color-dot:hover {
		transform: scale(1.18);
	}
	.color-dot.on {
		border-color: #6366f1 !important;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.45), 0 0 10px rgba(99, 102, 241, 0.5);
		transform: scale(1.18);
	}
	.color-picker {
		width: 24px;
		height: 24px;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		background: transparent;
		cursor: pointer;
	}
	.size-range {
		width: 120px;
		accent-color: var(--primary);
		cursor: pointer;
		margin-top: 5px;
	}
	.font-select {
		padding: 4px 10px;
		border-radius: 7px;
		background: rgba(30, 41, 59, 0.85);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #e2e8f0;
		font-size: 0.76rem;
		outline: none;
		cursor: pointer;
	}
	.font-select:focus {
		border-color: #6366f1;
	}
	.ctrl-play-btn {
		background: var(--primary) !important;
		color: #fff !important;
		border-color: var(--primary) !important;
		font-weight: 700 !important;
	}
	.stickman-canvas { position: absolute; inset: 0; background: #ffffff; overflow: hidden; transition: background-color 0.25s ease; }
	.canvas-viewport { position: absolute; inset: 4%; overflow: hidden; box-sizing: border-box; transition: inset 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
	.stickman-entrance-wrapper { position: absolute; inset: 0; overflow: hidden; }
	.stickman-bg-layer { position: absolute; inset: -4%; background-size: cover; background-position: center; will-change: transform; }
	.anim-img-slide-top { animation: stickImgSlideTop 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
	.anim-img-slide-side.side-right { animation: stickImgSlideFromLeft 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
	.anim-img-slide-side.side-left { animation: stickImgSlideFromRight 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
	.anim-img-zoom-in { animation: stickImgZoomIn 6s ease-out both; }
	.anim-img-pop { animation: stickImgPop 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both; }
	.anim-img-fade { animation: stickImgFade 0.6s ease-out both; }
	.anim-img-static { transform: none; }
	.idle-motion-shake { animation: stickIdleShake 2.4s ease-in-out infinite alternate; }
	.idle-motion-breathe { animation: stickIdleBreathe 3.6s ease-in-out infinite alternate; }
	.idle-motion-drift { animation: stickIdleDrift 5s ease-out infinite alternate; }
	.idle-motion-none { transform: none; }
	@keyframes stickIdleShake {
		0% { transform: translate(0, 0) rotate(0deg); }
		15% { transform: translate(-3px, 2px) rotate(-0.15deg); }
		30% { transform: translate(2px, -3px) rotate(0.12deg); }
		45% { transform: translate(-2px, -1px) rotate(-0.08deg); }
		60% { transform: translate(3px, 2px) rotate(0.18deg); }
		75% { transform: translate(-1px, 3px) rotate(-0.12deg); }
		90% { transform: translate(2px, -1px) rotate(0.1deg); }
		100% { transform: translate(0, 0) rotate(0deg); }
	}
	@keyframes stickIdleBreathe {
		0% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(-4px, -3px) scale(1.02); }
		100% { transform: translate(3px, 2px) scale(1.01); }
	}
	@keyframes stickIdleDrift {
		0% { transform: scale(1) translate(0, 0); }
		100% { transform: scale(1.04) translate(-4px, -2px); }
	}
	@keyframes stickImgSlideTop { 0% { transform: translateY(-100%); } 100% { transform: translateY(0); } }
	@keyframes stickImgSlideFromLeft { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
	@keyframes stickImgSlideFromRight { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
	@keyframes stickImgZoomIn { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
	@keyframes stickImgPop { 0% { transform: scale(0.82); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
	@keyframes stickImgFade { 0% { opacity: 0; } 100% { opacity: 1; } }
		.text-overlay { position: absolute; width: 32%; max-width: 34%; display: inline-flex; flex-direction: column; touch-action: none; user-select: none; overflow: visible; }
		.text-overlay.align-middle { width: 56%; max-width: 60%; }
		.text-overlay.align-center { text-align: center; }
		.text-overlay.align-right { text-align: right; }
		.text-overlay.align-left { text-align: left; }
		/* Shorts bottom/top text position */
		.text-overlay.bottom,
		.text-overlay.top {
			width: 90%;
			max-width: 90%;
			text-align: center;
			align-items: center;
		}
	/* Canvas Font Size Stepper Pill */
	.canvas-fs-pill {
		position: absolute;
		bottom: 8px;
		left: 178px;
		z-index: 12;
		background: rgba(15, 23, 42, 0.88);
		border: 1px solid rgba(255, 255, 255, 0.22);
		border-radius: 8px;
		display: inline-flex;
		align-items: center;
		padding: 2px 4px;
		backdrop-filter: blur(6px);
		gap: 3px;
	}
	.c-fs-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #e2e8f0;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.c-fs-btn:hover {
		background: #6366f1;
		color: #ffffff;
		border-color: #818cf8;
	}
	.c-fs-val {
		font-size: 0.72rem;
		font-weight: 700;
		color: #fde68a;
		min-width: 38px;
		text-align: center;
	}

	/* Player Bar Quick Font Stepper */
	.quick-fs-control {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: rgba(15, 23, 42, 0.7);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		padding: 3px 6px;
	}
	.quick-fs-btn {
		padding: 3px 8px !important;
		font-size: 0.75rem !important;
		font-weight: 700 !important;
		background: rgba(255, 255, 255, 0.08) !important;
		border: 1px solid rgba(255, 255, 255, 0.15) !important;
	}
	.quick-fs-btn:hover {
		background: #6366f1 !important;
		color: #ffffff !important;
	}
	.quick-fs-val {
		font-size: 0.78rem;
		font-weight: 700;
		color: #fde68a;
		padding: 0 4px;
		min-width: 36px;
		text-align: center;
	}

	/* Typography Card Font Size Controller */
	.font-size-control-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: rgba(15, 23, 42, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: var(--r-md);
		padding: 10px 12px;
		width: 100%;
		box-sizing: border-box;
	}
	.fs-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	.fs-main-label {
		font-size: 0.85rem;
		color: #f1f5f9;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.fs-badge {
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.45);
		color: #a5b4fc;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: 0.82rem;
		font-weight: 800;
	}
	.fs-apply-all-btn {
		background: rgba(99, 102, 241, 0.15) !important;
		border-color: rgba(99, 102, 241, 0.4) !important;
		color: #c7d2fe !important;
		font-size: 0.72rem !important;
		padding: 4px 10px !important;
	}
	.fs-apply-all-btn:hover {
		background: #6366f1 !important;
		color: #ffffff !important;
	}
	.fs-slider-row {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
	}
	.fs-step-btn {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #f1f5f9;
		font-size: 0.76rem;
		font-weight: 700;
		width: 30px;
		height: 30px;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}
	.fs-step-btn:hover {
		background: #6366f1;
		border-color: #818cf8;
		transform: scale(1.08);
	}
	.fs-slider {
		flex: 1;
		accent-color: var(--primary);
		height: 6px;
		cursor: pointer;
	}
	.fs-presets-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.fs-preset-label {
		font-size: 0.72rem;
		color: var(--text-3);
		font-weight: 600;
	}
	.fs-presets-list {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.fs-preset-pill {
		font-size: 0.72rem;
		font-weight: 600;
		padding: 3px 9px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: var(--text-2);
		cursor: pointer;
		transition: all 0.14s ease;
	}
	.fs-preset-pill:hover {
		background: rgba(99, 102, 241, 0.25);
		border-color: rgba(99, 102, 241, 0.5);
		color: #ffffff;
		transform: translateY(-1px);
	}
	.fs-preset-pill.on {
		background: #6366f1;
		border-color: #818cf8;
		color: #ffffff;
		font-weight: 700;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
	}
	.transform-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
	.transform-btn {
		font-size: 0.68rem;
		font-weight: 700;
		padding: 4px 9px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
		white-space: nowrap;
		user-select: none;
	}
	.transform-btn:hover {
		background: rgba(99, 102, 241, 0.2);
		border-color: rgba(99, 102, 241, 0.5);
		color: #e0e7ff;
		transform: translateY(-1px);
	}
	.slider-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.range-input { width: 120px; accent-color: var(--primary); }
	.point-only-text { margin: 0; font-weight: 800; line-height: 1.18; letter-spacing: 0.01em; overflow-wrap: break-word; filter: blur(0.2px) contrast(1.04); }
	.two-lines { position: relative; z-index: 1; display: flex; flex-direction: column; line-height: 1.15; gap: 3px; padding: 6px 10px; width: 100%; max-width: 100%; box-sizing: border-box; overflow: visible; }
	.two-lines .line { display: block; font-weight: 700; -webkit-text-stroke: 0.6px currentColor; letter-spacing: 0.01em; white-space: normal; overflow-wrap: break-word; word-break: break-word; max-width: 100%; }

	.line1, .line2 { display: block; font-weight: 900; letter-spacing: 0.01em; white-space: normal; overflow-wrap: break-word; word-break: break-word; }
	.point-only-input { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); font-weight: 600; background: rgba(255,255,255,0.92); border: 1px solid var(--line); padding: 4px 8px; border-radius: 999px; min-width: 140px; max-width: 70%; text-align: center; font-size: 0.78rem; color: #111827; outline: none; z-index: 4; }
	.free-editor { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; padding: 10px 12px; background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-md); }
	.free-textarea { width: 100%; min-height: 76px; background: var(--bg-surface); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font-size: 0.85rem; line-height: 1.45; resize: vertical; outline: none; }
	.free-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.16); }
	.anim-none .anim-target { animation: stickFadeQuick 0.25s ease 0.45s both; }
	.anim-pop .anim-target { animation: stickPop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.45s both; }
	.anim-slide.left .anim-target { animation: stickSlideInLeft 0.45s ease 0.45s both; }
	.anim-slide.right .anim-target { animation: stickSlideInRight 0.45s ease 0.45s both; }
	.anim-fade .anim-target { animation: stickFade 0.6s ease 0.45s both; }
	.anim-typewriter .anim-target { overflow: hidden; white-space: nowrap; animation: stickType 1.1s steps(30) 0.45s both; max-width: 100%; }
	.text-idle-shake { animation: textChalkJitter 1.8s ease-in-out infinite alternate; will-change: transform; }
	.text-idle-breathe { animation: textBreathe 3.2s ease-in-out infinite alternate; will-change: transform; }
	.text-idle-drift { animation: textDrift 4.5s ease-out infinite alternate; will-change: transform; }
	.text-idle-none { transform: none; }
	@keyframes textChalkJitter {
		0% { transform: translate(0, 0) rotate(0deg) scale(1); }
		25% { transform: translate(-0.8px, 0.8px) rotate(-0.45deg) scale(1.008); }
		50% { transform: translate(1px, -0.6px) rotate(0.4deg) scale(0.995); }
		75% { transform: translate(-0.8px, -0.6px) rotate(-0.35deg) scale(1.006); }
		100% { transform: translate(0.6px, 1px) rotate(0.4deg) scale(1); }
	}
	@keyframes textBreathe {
		0% { transform: scale(1); }
		50% { transform: scale(1.035) translateY(-2px); }
		100% { transform: scale(0.99) translateY(1px); }
	}
	@keyframes textDrift {
		0% { transform: scale(1) translate(0, 0); }
		100% { transform: scale(1.035) translate(-2px, -3px) rotate(0.4deg); }
	}
	@keyframes stickPop { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
	@keyframes stickSlideInLeft { 0%{transform:translateX(-18px);opacity:0} 100%{transform:none;opacity:1} }
	@keyframes stickSlideInRight { 0%{transform:translateX(18px);opacity:0} 100%{transform:none;opacity:1} }
	@keyframes stickFade { 0%{opacity:0;filter:blur(6px)} 100%{opacity:1;filter:none} }
	@keyframes stickType { 0%{width:0} 100%{width:100%} }
	@keyframes stickFadeQuick { 0%{opacity:0} 100%{opacity:1} }
	.flip-btn {
		position: absolute;
		bottom: 8px;
		left: 8px;
		z-index: 12;
		font-size: 0.72rem;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.62);
		color: #e2e8f0;
		border: 1px solid rgba(255, 255, 255, 0.22);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		backdrop-filter: blur(6px);
		transition: all 0.16s ease;
	}
	.flip-btn:hover {
		background: rgba(99, 102, 241, 0.7);
		border-color: #6366f1;
		color: #fff;
		transform: translateY(-1px);
	}
	.auto-align-btn {
		position: absolute;
		bottom: 8px;
		left: 86px;
		z-index: 12;
		font-size: 0.72rem;
		font-weight: 700;
		padding: 4px 10px;
		border-radius: 8px;
		background: rgba(15, 23, 42, 0.85);
		color: #c7d2fe;
		border: 1px solid rgba(99, 102, 241, 0.45);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		backdrop-filter: blur(6px);
		transition: all 0.16s ease;
	}
	.auto-align-btn:hover {
		background: rgba(99, 102, 241, 0.35);
		border-color: #818cf8;
		color: #ffffff;
		transform: translateY(-1px);
	}
	.auto-all-btn {
		background: rgba(99, 102, 241, 0.15) !important;
		border-color: rgba(99, 102, 241, 0.45) !important;
		color: #c7d2fe !important;
	}
	.auto-all-btn:hover {
		background: rgba(99, 102, 241, 0.35) !important;
		color: #ffffff !important;
	}
	.player-controls { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
	.ctrl-btn { padding: 7px 12px; background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-md); color: var(--text); display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.16s ease; }
	.ctrl-btn:disabled { opacity: 0.45; cursor: not-allowed; }
	.btn-split-scene {
		background: rgba(245, 158, 11, 0.14) !important;
		border-color: rgba(245, 158, 11, 0.45) !important;
		color: #fde68a !important;
		font-weight: 600 !important;
	}
	.btn-split-scene:hover:not(:disabled) {
		background: rgba(245, 158, 11, 0.28) !important;
		border-color: #f59e0b !important;
		color: #ffffff !important;
		transform: translateY(-1px);
	}
	.btn-random-dup {
		background: rgba(168, 85, 247, 0.14) !important;
		border-color: rgba(168, 85, 247, 0.4) !important;
		color: #e9d5ff !important;
		font-weight: 600 !important;
	}
	.btn-random-dup:hover:not(:disabled) {
		background: rgba(168, 85, 247, 0.28) !important;
		border-color: #a855f7 !important;
		color: #ffffff !important;
		transform: translateY(-1px);
	}
	.btn-autosplit-all {
		background: rgba(236, 72, 153, 0.14) !important;
		border-color: rgba(236, 72, 153, 0.4) !important;
		color: #fbcfe8 !important;
		font-weight: 600 !important;
	}
	.btn-autosplit-all:hover:not(:disabled) {
		background: rgba(236, 72, 153, 0.28) !important;
		border-color: #ec4899 !important;
		color: #ffffff !important;
		transform: translateY(-1px);
	}
	.ctrl-btn.active-toggle {
		background: rgba(16, 185, 129, 0.18) !important;
		border-color: #10b981 !important;
		color: #6ee7b7 !important;
		font-weight: 600 !important;
	}
	.hint { font-size: 0.72rem; color: var(--text-3); margin-left: auto; }
	.render-card { margin-top: 6px; padding: 14px 16px; background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-lg); display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
	.render-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
	.render-title { display: inline-flex; align-items: center; gap: 6px; font-size: 0.88rem; font-weight: 800; color: #f1f5f9; }
	.quality-row { display: flex; gap: 6px; }
	.q-btn { font-size: 0.72rem; padding: 3px 8px; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid var(--line); color: var(--text-2); font-weight: 600; }
	.q-btn.on { background: var(--text); color: var(--bg-base); border-color: var(--text); }
	.render-btn, .download-link { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 16px; font-weight: 700; text-decoration: none; border-radius: var(--r-md); }
	.progress-track { height: 6px; background: #101626; border-radius: 999px; overflow: hidden; }
	.progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent-cyan)); transition: width 0.3s ease; }
	.progress-label { font-size: 0.72rem; color: var(--text-2); }
	.error-box { font-size: 0.78rem; color: #fca5a5; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 8px 10px; }
	.success-box { font-size: 0.78rem; color: #6ee7b7; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 8px 10px; }
	.render-hint { font-size: 0.72rem; color: var(--text-3); margin: 0; line-height: 1.4; }
	.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }

	.regen-all-btn {
		padding: 8px 14px;
		font-size: 0.82rem;
		font-weight: 600;
		border-radius: var(--r-md);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
	}

	.custom-sfx-pill {
		background: rgba(139, 92, 246, 0.15) !important;
		border-color: rgba(139, 92, 246, 0.4) !important;
		color: #c4b5fd !important;
	}

	.upload-sfx-pill {
		background: transparent !important;
		border-style: dashed !important;
		color: var(--text-3) !important;
		cursor: pointer;
	}

	.upload-sfx-pill:hover {
		border-color: var(--line-strong) !important;
		color: var(--text) !important;
	}

	@media (max-width: 1040px) { .studio-content { grid-template-columns: 1fr; } }
</style>
