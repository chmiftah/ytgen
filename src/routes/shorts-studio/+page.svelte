<script>
	import { Zap, Play, Pause, Wand2, RefreshCw, Download, ChevronRight, ChevronLeft, Search, Film, Music, Type, Settings, Check, X, Sparkles, Clock, Mic, Volume2, RotateCcw, Eye, EyeOff, Key, Sliders, AlertCircle, Upload } from 'lucide-svelte';
	import { POPULAR_VOICES } from '$lib/services/voiceService.js';
	import ShortsVoiceUploadModal from '$lib/components/ShortsVoiceUploadModal.svelte';

	// ------------------------------------------------------------------
	// Constants
	// ------------------------------------------------------------------
	const THEMES = [
		{ id: 'dark-psychology', label: 'Dark Psychology', emoji: '🧠', desc: 'Manipulasi, gaslighting, dark triad' },
		{ id: 'fakta-unik', label: 'Fakta Unik', emoji: '🤯', desc: 'Mind-blowing facts, sains aneh' },
		{ id: 'psikologi', label: 'Psikologi', emoji: '💭', desc: 'Hubungan, overthinking, mental health' },
		{ id: 'stoikisme', label: 'Stoikisme', emoji: '⚖️', desc: 'Filosofi, mindset, ketangguhan' },
		{ id: 'misteri', label: 'Misteri', emoji: '🔍', desc: 'Cold case, anomali, konspirasi' },
		{ id: 'custom', label: 'Topik Kustom', emoji: '✨', desc: 'Bebas tentukan topikmu sendiri' }
	];

	const BGM_OPTIONS = [
		{ id: 'dark-suspense', label: 'Dark Suspense', emoji: '🌑' },
		{ id: 'ambient', label: 'Ambient', emoji: '🌌' },
		{ id: 'lofi-chill', label: 'Lofi Chill', emoji: '🎵' },
		{ id: 'inspiring', label: 'Inspiring', emoji: '🌟' },
		{ id: 'playful', label: 'Playful', emoji: '🎮' },
		{ id: 'none', label: 'Tanpa BGM', emoji: '🔇' }
	];

	const VOICE_OPTIONS = [
		{ id: 'id-ID-ArdiNeural', label: 'Ardi (Pria ID)', rate: '+10%', lang: 'id' },
		{ id: 'id-ID-GadisNeural', label: 'Gadis (Wanita ID)', rate: '+8%', lang: 'id' },
		{ id: 'en-US-ChristopherNeural', label: 'Christopher (Male EN)', rate: '+0%', lang: 'en' },
		{ id: 'en-US-JennyNeural', label: 'Jenny (Female EN)', rate: '+0%', lang: 'en' }
	];

	// Model ElevenLabs yang support Bahasa Indonesia
	const ELEVEN_MODELS = [
		{
			id: 'eleven_multilingual_v2',
			name: 'Eleven Multilingual v2',
			desc: 'Model flagship: Emosi paling hidup, artikulasi natural & terbaik untuk Bahasa Indonesia',
			badge: '⭐ Paling Alami (29 Bahasa)'
		},
		{
			id: 'eleven_turbo_v2_5',
			name: 'Eleven Turbo v2.5',
			desc: 'Generasi 3x lebih cepat, hemat kuota 50%, fasih Bahasa Indonesia',
			badge: '⚡ Cepat & Hemat (32 Bahasa)'
		},
		{
			id: 'eleven_flash_v2_5',
			name: 'Eleven Flash v2.5',
			desc: 'Ultra low-latency (~75ms) untuk pembuatan konten kilat',
			badge: '🚀 Ultra Fast'
		}
	];

	// Koleksi suara resmi ElevenLabs yang 100% GRATIS (Premade System Voices) & support Bahasa Indonesia
	const INDONESIAN_ELEVEN_VOICES = [
		{
			id: 'pNInz6obpgDQGcFmaJgB',
			name: 'Adam',
			category: 'Deep Narrator',
			tag: '⭐ Free Plan',
			emoji: '🎙️',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/d6905d7a-dd26-4187-bfff-1bd3a5ea7cac.mp3',
			description: 'Pria, suara berat & berwibawa. Sangat ideal untuk Dark Psychology, Fakta Menyeramkan & Misteri.'
		},
		{
			id: 'EXAVITQu4vr4xnSDxMaL',
			name: 'Sarah',
			category: 'Warm & Professional',
			tag: '⭐ Free Plan',
			emoji: '🎤',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3',
			description: 'Wanita, nada jernih, tenang & engaging. Cocok untuk storytelling, psikologi relasi & edukasi.'
		},
		{
			id: 'TX3LPaxmHKxFdv7VOQHJ',
			name: 'Liam',
			category: 'Energetic & Crisp',
			tag: '⭐ Free Plan',
			emoji: '⚡',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3',
			description: 'Pria muda, tempo cepat, antusias & dinamis. Gaya khas video YouTube Shorts / TikTok viral.'
		},
		{
			id: 'JBFqnCBsd6RMkjVDRZzb',
			name: 'George',
			category: 'Deep Storyteller',
			tag: '⭐ Free Plan',
			emoji: '🎧',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-aafb-06a6e705cac5.mp3',
			description: 'Pria, gaya pembawa cerita hangat, dalam & captivating. Sangat nyaman didengarkan.'
		},
		{
			id: 'Xb7hH8MSUJpSbSDYk0k2',
			name: 'Alice',
			category: 'Clear & Articulate',
			tag: '⭐ Free Plan',
			emoji: '✨',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f5223-455d-427b-bc47-04988710325d.mp3',
			description: 'Wanita, artikulasi tajam, percaya diri & bersahabat untuk konten fakta sains & trivia.'
		},
		{
			id: 'nPczCjzI2devNBz1zQrb',
			name: 'Brian',
			category: 'Resonant & Bold',
			tag: '⭐ Free Plan',
			emoji: '🗿',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd347ec-6601-4475-beae-b2954848d5d1.mp3',
			description: 'Pria, suara paling berat & bergaung, memberikan kesan dramatis ala narator film.'
		},
		{
			id: 'pFZP5JQG7iQjIQuC4Bku',
			name: 'Lily',
			category: 'Warm & Gentle',
			tag: '⭐ Free Plan',
			emoji: '🌸',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4302-8a84-c39700d0da8e.mp3',
			description: 'Wanita, lembut, teduh & menenangkan. Sempurna untuk tips mental health & renungan hidup.'
		},
		{
			id: 'IKne3meq5aSn9XLyUdCD',
			name: 'Charlie',
			category: 'Casual & Friendly',
			tag: '⭐ Free Plan',
			emoji: '💬',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-41a0-a507-92e83fa38433.mp3',
			description: 'Pria, gaya ngobrol santai & akrab seperti teman bercerita.'
		},
		{
			id: 'onwK4e9ZLuTAKqWW03F9',
			name: 'Daniel',
			category: 'Authoritative',
			tag: '⭐ Free Plan',
			emoji: '👔',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/79ecefa5-62c4-4f3e-9971-40ac302b71d4.mp3',
			description: 'Pria, pembawaan serius & formal untuk konten bisnis, uang, dan motivasi sukses.'
		},
		{
			id: 'pqHfZKP75CvOlQylNhV4',
			name: 'Bill',
			category: 'Documentary',
			tag: '⭐ Free Plan',
			emoji: '📖',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pqHfZKP75CvOlQylNhV4/d782b3ff-84ba-4029-848c-acf01285524d.mp3',
			description: 'Pria paruh baya, gaya narator dokumenter National Geographic / sejarah.'
		},
		{
			id: 'cgSgspJ2msm6clMCkdW9',
			name: 'Jessica',
			category: 'Bright & Cheerful',
			tag: '⭐ Free Plan',
			emoji: '🌟',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-8019-122f3ec0558b.mp3',
			description: 'Wanita, intonasi ceria & berenergi positif untuk tips kecantikan, life hacks & fakta unik.'
		},
		{
			id: 'cjVigY5qzO86Huf0OWal',
			name: 'Eric',
			category: 'Friendly Guy',
			tag: '⭐ Free Plan',
			emoji: '☕',
			sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098204c-1486-455b-b9f8-b3d68ef21132.mp3',
			description: 'Pria muda, nada ringan & bersahabat untuk daily vlog style shorts.'
		}
	];

	const SUBTITLE_STYLES = [
		{ id: 'viral-yellow', label: 'Viral Yellow', desc: 'Highlight kuning neon ala TikTok' },
		{ id: 'mrbeast-bold', label: 'MrBeast Bold', desc: 'Impact font merah besar' },
		{ id: 'minimal', label: 'Minimal Clean', desc: 'Outline putih elegan' }
	];

	// ------------------------------------------------------------------
	// State
	// ------------------------------------------------------------------
	let step = $state(1); // 1: Setup, 2: Review Script, 3: Footage, 4: Audio, 5: Render
	let contentLang = $state('id'); // 'id' | 'en'
	let selectedTheme = $state('dark-psychology');
	let customTopic = $state('');
	let targetDuration = $state(35);
	let aspectRatio = $state('9:16'); // '9:16' | '16:9' | '1:1'

	// Step 2 - Titles & Script
	let titleOptions = $state([]);
	let selectedTitle = $state(null);
	let generatedTitlesHistory = $state([]);
	let scenes = $state([]);
	let totalDuration = $state(0);
	let isGeneratingTitles = $state(false);
	let isGeneratingScript = $state(false);
	let rerollCount = $state(0);

	// Step 3 - Footage
	let giphyApiKey = $state('');
	let searchingSceneIdx = $state(null);
	let giphyResults = $state({});
	let footageSource = $state('auto'); // 'auto' | 'giphy' | 'pexels'

	// Step 4 - Audio & Settings
	let selectedVoiceEngine = $state('edge_tts'); // 'edge_tts' | 'elevenlabs'
	let selectedVoice = $state('id-ID-ArdiNeural');
	let voiceRate = $state('+10%');
	let elevenLabsApiKey = $state('');
	let showElevenKey = $state(false);
	let selectedElevenModel = $state('eleven_multilingual_v2');
	let availableElevenVoices = $state([...INDONESIAN_ELEVEN_VOICES]);
	let isFetchingElevenVoices = $state(false);
	let elevenSubscription = $state(null);
	let elevenStability = $state(0.5);
	let elevenSimilarity = $state(0.75);
	let playingVoiceId = $state(null);
	let sampleAudio = $state(null);
	let selectedBgm = $state('dark-suspense');
	let bgmVolume = $state(0.12);
	let selectedSubtitle = $state('viral-yellow');
	let subtitlesEnabled = $state(true);
	let subtitlePosition = $state('bottom'); // 'bottom' | 'center' | 'top'
	let subtitleYPercent = $state(78); // 15% - 88%
	let subtitleFontScale = $state(1.0); // 0.85 | 1.0 | 1.2
	let subtitleAlign = $state('center'); // 'left' | 'center' | 'right'
	let subtitleDisplayMode = $state('chunk'); // 'chunk' | 'word_by_word' | 'highlight'
	let wordByWord = $state(false);
	let previewWordTimer = $state(0);

	function setSubtitleMode(mode) {
		subtitleDisplayMode = mode;
		wordByWord = (mode === 'word_by_word');
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (subtitleDisplayMode === 'chunk') return;
		const interval = setInterval(() => {
			previewWordTimer++;
		}, 480);
		return () => clearInterval(interval);
	});

	function setSubtitlePositionPreset(pos) {
		subtitlePosition = pos;
		if (pos === 'top') subtitleYPercent = 20;
		else if (pos === 'center') subtitleYPercent = 50;
		else subtitleYPercent = 78;
	}

	function handleYPercentChange(val) {
		subtitleYPercent = val;
		if (val <= 35) subtitlePosition = 'top';
		else if (val >= 65) subtitlePosition = 'bottom';
		else subtitlePosition = 'center';
	}

	// Step 5 - Render
	let isRendering = $state(false);
	let renderProgress = $state('');
	let renderPercent = $state(0);
	let renderStep = $state(0);
	let renderResult = $state(null);
	let renderError = $state('');

	// Error & general
	let errorMsg = $state('');
	let previewingScene = $state(null);

	// Voice Upload Modal & Scene Audio Playback
	let showVoiceUploadModal = $state(false);
	let playingSceneAudioIdx = $state(null);
	let sceneAudioPlayer = $state(null);

	function toggleSceneAudio(idx, url) {
		if (!url) return;
		if (playingSceneAudioIdx === idx && sceneAudioPlayer) {
			sceneAudioPlayer.pause();
			playingSceneAudioIdx = null;
			return;
		}
		if (sceneAudioPlayer) {
			sceneAudioPlayer.pause();
		}
		sceneAudioPlayer = new Audio(url);
		playingSceneAudioIdx = idx;
		sceneAudioPlayer.play().catch(() => {
			playingSceneAudioIdx = null;
		});
		sceneAudioPlayer.onended = () => {
			playingSceneAudioIdx = null;
		};
	}

	function handleVoiceUploadSuccess(data) {
		if (data.scenes && data.scenes.length > 0) {
			selectedVoiceEngine = 'upload';
			selectedTitle = { title: data.title || 'Shorts Voiceover' };
			if (data.aspectRatio) aspectRatio = data.aspectRatio;
			scenes = data.scenes;
			totalDuration = data.totalDuration || Number(totalScenesDuration());

			// Pre-populate giphyResults for each scene
			for (let i = 0; i < scenes.length; i++) {
				if (scenes[i].clips && scenes[i].clips.length > 0) {
					giphyResults[i] = scenes[i].clips;
				}
			}

			// Go directly to Step 3 (Footage) so user can see and refine all matching Giphy clips!
			step = 3;
		}
	}

	// ------------------------------------------------------------------
	// Keyword Suggestions per Scene
	// ------------------------------------------------------------------
	function getSceneKeywordSuggestions(scene, idx) {
		const existing = Array.isArray(scene.keywords) ? scene.keywords.filter(Boolean) : [];
		const currentQuery = (scene.giphyQuery || '').trim();

		// Theme base fallbacks
		const themeFallbacks = [
			'shocked', 'mind blown', 'thinking', 'whisper', 'reveal',
			'mystery', 'money', 'success', 'warning', 'shadow', 'panic', 'matrix', 'focus'
		];

		// Candidate words from narration
		const rawWords = (scene.spokenText || '')
			.replace(/[^a-zA-Z0-9\s]/g, '')
			.split(/\s+/)
			.filter((w) => w.length > 3 && !['yang', 'kamu', 'bisa', 'akan', 'atau', 'pada', 'dari', 'kita', 'oleh', 'juga', 'saat', 'tapi', 'adalah', 'karena', 'dengan', 'untuk', 'this', 'that', 'with', 'from', 'have', 'were', 'been'].includes(w.toLowerCase()));

		const combined = [
			...existing,
			...rawWords.slice(0, 3),
			themeFallbacks[idx % themeFallbacks.length],
			themeFallbacks[(idx + 2) % themeFallbacks.length]
		].filter(Boolean);

		const seen = new Set();
		if (currentQuery) seen.add(currentQuery.toLowerCase());
		const result = [];

		for (const item of combined) {
			const norm = item.trim().toLowerCase();
			if (norm && !seen.has(norm) && norm.length <= 25) {
				seen.add(norm);
				result.push(item.trim());
			}
			if (result.length >= 6) break;
		}
		return result;
	}

	async function handleSelectKeywordSuggestion(sceneIdx, kw) {
		if (!scenes[sceneIdx]) return;
		scenes[sceneIdx].giphyQuery = kw;
		await searchGiphyForScene(sceneIdx, kw);
	}

	// ------------------------------------------------------------------
	// Helpers
	// ------------------------------------------------------------------
	function getTopicText() {
		if (selectedTheme === 'custom') return customTopic.trim();
		const t = THEMES.find((t) => t.id === selectedTheme);
		return customTopic.trim() || (t ? t.desc : '');
	}

	function totalScenesDuration() {
		return scenes.reduce((s, sc) => s + (sc.audioDuration || sc.duration || 4), 0).toFixed(1);
	}

	function getPreviewSubtitle(text, style) {
		if (!text) return '';
		const words = text.split(/\s+/).filter(Boolean);
		const phrase = words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
		return style === 'mrbeast-bold' ? phrase.toUpperCase() : phrase;
	}

	$effect(() => {
		if (typeof window !== 'undefined') {
			const savedKey = localStorage.getItem('yt_eleven_key') || '';
			if (savedKey && !elevenLabsApiKey) {
				elevenLabsApiKey = savedKey;
				fetchElevenVoices(savedKey);
			}
		}
	});

	async function fetchElevenVoices(key) {
		const cleanKey = (key || '').trim();
		if (!cleanKey || cleanKey.length < 10) return;
		isFetchingElevenVoices = true;
		try {
			const res = await fetch(`/api/elevenlabs?apiKey=${encodeURIComponent(cleanKey)}`);
			const data = await res.json();
			if (data.success) {
				if (data.voices && data.voices.length > 0) {
					availableElevenVoices = data.voices.map(v => {
						const pop = POPULAR_VOICES.find(p => p.id === v.id);
						return {
							...v,
							emoji: pop?.emoji || '🎙️',
							sampleUrl: pop?.sampleUrl || null
						};
					});
				}
				if (data.subscription) {
					elevenSubscription = data.subscription;
				}
				if (typeof window !== 'undefined') {
					localStorage.setItem('yt_eleven_key', cleanKey);
				}
			}
		} catch (e) {
			console.warn('Failed to fetch ElevenLabs voices:', e);
		} finally {
			isFetchingElevenVoices = false;
		}
	}

	function playVoiceSample(voice, e) {
		e?.stopPropagation?.();
		if (playingVoiceId === voice.id && sampleAudio) {
			sampleAudio.pause();
			sampleAudio = null;
			playingVoiceId = null;
			return;
		}
		if (sampleAudio) {
			sampleAudio.pause();
			sampleAudio = null;
		}
		if (voice.sampleUrl) {
			sampleAudio = new Audio(voice.sampleUrl);
			playingVoiceId = voice.id;
			sampleAudio.play().catch(() => {
				playingVoiceId = null;
			});
			sampleAudio.onended = () => {
				playingVoiceId = null;
				sampleAudio = null;
			};
		}
	}

	function getVoiceDisplayName(voiceId) {
		if (selectedVoiceEngine === 'upload') {
			return '🎙️ Audio Upload Sendiri (Whisper & Giphy Synced)';
		}
		if (selectedVoiceEngine === 'elevenlabs') {
			const v = availableElevenVoices.find(x => x.id === voiceId) || INDONESIAN_ELEVEN_VOICES.find(x => x.id === voiceId) || POPULAR_VOICES.find(x => x.id === voiceId);
			const m = ELEVEN_MODELS.find(x => x.id === selectedElevenModel);
			const modelLabel = m ? m.name.replace('Eleven ', '') : 'Multilingual v2';
			return v ? `ElevenLabs: ${v.name} (${modelLabel})` : `ElevenLabs (${modelLabel})`;
		}
		const v = VOICE_OPTIONS.find(x => x.id === voiceId);
		return v ? `Edge: ${v.label} (${voiceRate})` : `${voiceId} (${voiceRate})`;
	}

	// ------------------------------------------------------------------
	// Step 1 → Step 2: Generate Titles (with anti-duplicate history)
	// ------------------------------------------------------------------
	async function handleGenerateTitles(isReroll = false) {
		errorMsg = '';
		const topic = getTopicText();
		if (!topic) { errorMsg = 'Masukkan topik atau pilih tema terlebih dahulu.'; return; }

		isGeneratingTitles = true;
		if (isReroll) {
			rerollCount++;
		} else {
			rerollCount = 0;
			titleOptions = [];
			generatedTitlesHistory = [];
		}
		selectedTitle = null;
		scenes = [];

		try {
			const res = await fetch('/api/generate-shorts-script', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'generate-titles',
					theme: selectedTheme,
					topic,
					customTopic: customTopic.trim(),
					isReroll,
					rerollCount,
					excludeTitles: generatedTitlesHistory.slice(-20),
					seed: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
					lang: contentLang
				})
			});
			const data = await res.json();
			if (!data.success) throw new Error(data.error || 'Gagal generate judul.');
			titleOptions = data.titles || [];
			for (const t of titleOptions) {
				if (t.title && !generatedTitlesHistory.includes(t.title)) {
					generatedTitlesHistory.push(t.title);
				}
			}
			step = 2;
		} catch (e) {
			errorMsg = e.message;
		} finally {
			isGeneratingTitles = false;
		}
	}

	// ------------------------------------------------------------------
	// Step 2: Generate Script after title selected
	// ------------------------------------------------------------------
	async function handleGenerateScript() {
		errorMsg = '';
		const topic = selectedTitle?.title || getTopicText();
		isGeneratingScript = true;
		scenes = [];

		try {
			const res = await fetch('/api/generate-shorts-script', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'generate-script',
					theme: selectedTheme,
					topic,
					targetDuration,
					lang: contentLang
				})
			});
			const data = await res.json();
			if (!data.success) throw new Error(data.error || 'Gagal generate naskah.');
			scenes = data.scenes || [];
			totalDuration = data.totalEstimatedDuration || targetDuration;
			if (!selectedTitle) selectedTitle = { title: data.title };
		} catch (e) {
			errorMsg = e.message;
		} finally {
			isGeneratingScript = false;
		}
	}

	// ------------------------------------------------------------------
	// Step 3: Search Footage (Giphy / Pexels) for a scene with Orientation Support
	// ------------------------------------------------------------------
	async function searchGiphyForScene(idx, overrideQuery = null) {
		const scene = scenes[idx];
		if (!scene) return;
		searchingSceneIdx = idx;
		giphyResults[idx] = [];
		const activeQuery = overrideQuery || scene.giphyQuery;

		try {
			const res = await fetch('/api/giphy-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: activeQuery,
					theme: selectedTheme,
					limit: 8,
					apiKey: giphyApiKey || undefined,
					sceneIndex: idx,
					footageSource,
					aspectRatio,
					orientation: aspectRatio === '16:9' ? 'landscape' : (aspectRatio === '1:1' ? 'square' : 'portrait')
				})
			});
			const data = await res.json();
			if (data.success) {
				giphyResults[idx] = data.clips || [];
				// Auto-select first/diverse clip per scene
				if (data.clips.length > 0) {
					const pickIdx = idx % data.clips.length;
					scenes[idx] = { ...scenes[idx], giphyQuery: activeQuery, selectedClip: data.clips[pickIdx] };
				}
			} else {
				errorMsg = data.error || 'Gagal mengambil klip footage.';
			}
		} catch (e) {
			errorMsg = e.message;
		} finally {
			searchingSceneIdx = null;
		}
	}

	async function searchAllScenes() {
		for (let i = 0; i < scenes.length; i++) {
			await searchGiphyForScene(i);
			if (i < scenes.length - 1) {
				await new Promise((r) => setTimeout(r, 200));
			}
		}
	}

	function selectClip(sceneIdx, clip) {
		scenes[sceneIdx] = { ...scenes[sceneIdx], selectedClip: clip };
	}

	// ------------------------------------------------------------------
	// Step 5: Render
	// ------------------------------------------------------------------
	async function handleRender() {
		renderError = '';
		renderResult = null;
		renderPercent = 0;
		renderStep = 0;
		isRendering = true;
		renderProgress = '🚀 Menyiapkan render...';

		try {
			const res = await fetch('/api/render-shorts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: selectedTitle?.title || 'Shorts Video',
					scenes,
					aspectRatio,
					voiceEngine: selectedVoiceEngine,
					voiceId: selectedVoice,
					voiceRate: selectedVoiceEngine === 'edge_tts' ? voiceRate : '+0%',
					elevenLabsApiKey: elevenLabsApiKey.trim(),
					elevenModel: selectedElevenModel,
					elevenSettings: {
						stability: elevenStability,
						similarityBoost: elevenSimilarity
					},
					bgmId: selectedBgm,
					bgmVolume,
					subtitleStyle: selectedSubtitle,
					subtitlesEnabled,
					subtitlePosition,
					subtitleYPercent,
					subtitleFontScale,
					subtitleAlign,
					subtitleDisplayMode,
					wordByWord: subtitleDisplayMode === 'word_by_word' || wordByWord
				})
			});

			if (!res.ok) {
				const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
				throw new Error(errData.error || `HTTP ${res.status}`);
			}

			// Read SSE streaming response
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
					if (!line.startsWith('data: ')) continue;
					try {
						const evt = JSON.parse(line.slice(6));
						if (evt.type === 'progress') {
							renderProgress = evt.message;
							renderPercent = evt.percent ?? renderPercent;
							renderStep = evt.step ?? renderStep;
						} else if (evt.type === 'done') {
							renderResult = evt;
							renderProgress = '✅ Render selesai!';
							renderPercent = 100;
						} else if (evt.type === 'error') {
							throw new Error(evt.error || 'Render gagal.');
						}
					} catch (parseErr) {
						if (parseErr.message !== 'Render gagal.') console.warn('SSE parse error:', parseErr.message);
						else throw parseErr;
					}
				}
			}
		} catch (e) {
			renderError = e.message;
		} finally {
			isRendering = false;
		}
	}

	function resetAll() {
		step = 1;
		titleOptions = [];
		selectedTitle = null;
		scenes = [];
		renderResult = null;
		renderError = '';
		errorMsg = '';
		giphyResults = {};
		previewingScene = null;
	}
</script>

<svelte:head>
	<title>Shorts Studio – AI YouTube Shorts Generator | AI Video Studio</title>
	<meta name="description" content="Buat YouTube Shorts viral 30-40 detik dengan AI: pilih tema, generate naskah, cari klip Giphy, voiceover otomatis, dan render 9:16 langsung." />
</svelte:head>

<div class="shorts-studio">
	<!-- ============================================================ -->
	<!-- HEADER -->
	<!-- ============================================================ -->
	<header class="studio-header">
		<div class="header-inner">
			<div class="header-left">
				<a href="/" class="back-btn">
					<ChevronLeft size={18} />
					<span>Kembali</span>
				</a>
				<div class="header-title">
					<div class="title-badge"><Sparkles size={14} /> Shorts Generator</div>
					<h1>YouTube <span class="gradient-text">Shorts Studio</span></h1>
					<p>Buat Shorts 30–40 detik dari Giphy Clips × AI Naskah × Neural Voice</p>
				</div>
			</div>
			<div class="header-right">
				<button
					type="button"
					class="btn-header-voice"
					onclick={() => showVoiceUploadModal = true}
					title="Upload rekaman suara sendiri untuk dianalisis AI & dicocokkan footage GIPHY"
				>
					<Mic size={15} />
					<span>Upload Voice</span>
				</button>
				<div class="step-indicator">
					{#each [1,2,3,4,5] as s}
						<button
							class="step-dot"
							class:active={step === s}
							class:done={step > s}
							onclick={() => step > s ? (step = s) : null}
							disabled={step < s}
						>
							{#if step > s}<Check size={12} />{:else}{s}{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Step Labels -->
		<div class="step-labels container">
			{#each [
				{ n: 1, label: 'Tema & Topik' },
				{ n: 2, label: 'Judul & Naskah' },
				{ n: 3, label: 'Footage Giphy' },
				{ n: 4, label: 'Audio & Style' },
				{ n: 5, label: 'Render' }
			] as sl}
				<div class="step-label" class:active={step === sl.n} class:done={step > sl.n}>
					<span>{sl.label}</span>
				</div>
			{/each}
		</div>
	</header>

	<!-- Error Banner -->
	{#if errorMsg}
		<div class="error-banner">
			<X size={16} />
			<span>{errorMsg}</span>
			<button onclick={() => errorMsg = ''}><X size={14} /></button>
		</div>
	{/if}

	<div class="studio-layout">
		<!-- ============================================================ -->
		<!-- MAIN CONTENT PANEL -->
		<!-- ============================================================ -->
		<main class="main-panel">

			<!-- ============================== -->
			<!-- STEP 1: TEMA & TOPIK -->
			<!-- ============================== -->
			{#if step === 1}
				<div class="step-content">
					<div class="step-header">
						<div class="step-number">01</div>
						<div>
							<h2>Pilih Tema & Topik</h2>
							<p>AI akan otomatis menyesuaikan gaya naskah, hook, dan query Giphy berdasarkan tema.</p>
						</div>
					</div>

					<!-- Voice Upload Quick Action Banner -->
					<div class="voice-upload-hero-card">
						<div class="vuh-left">
							<div class="vuh-icon-badge">
								<Mic size={24} />
							</div>
							<div class="vuh-text">
								<div class="vuh-badge">🎙️ FITUR BARU: VOICE TO SHORTS</div>
								<div class="vuh-title">Punya Rekaman Suara Narasi Sendiri?</div>
								<div class="vuh-desc">
									Upload audio voiceover Anda (.mp3, .wav, .m4a). AI Whisper mentranskrip ucapan, memotong adegan presisi, dan otomatis mencari footage animasi GIPHY yang relevan untuk setiap kalimat!
								</div>
							</div>
						</div>
						<button type="button" class="btn-vuh-upload" onclick={() => showVoiceUploadModal = true}>
							<Upload size={17} />
							<span>Upload Voice & Cari Footage →</span>
						</button>
					</div>

					<div class="lang-section" style="margin-bottom: 24px;">
						<label>🌐 Bahasa Konten (Language)</label>
						<div class="duration-options">
							<button class="duration-btn" class:selected={contentLang === 'id'} onclick={() => { contentLang = 'id'; selectedVoice = 'id-ID-ArdiNeural'; }}>
								<span class="dur-label">🇮🇩 Indonesia</span>
								<span class="dur-sub">Naskah & Suara ID</span>
							</button>
							<button class="duration-btn" class:selected={contentLang === 'en'} onclick={() => { contentLang = 'en'; selectedVoice = 'en-US-ChristopherNeural'; }}>
								<span class="dur-label">🇺🇸 English</span>
								<span class="dur-sub">EN Script & Voice</span>
							</button>
						</div>
					</div>

					<div class="theme-grid">
						{#each THEMES as theme}
							<button
								class="theme-card"
								class:selected={selectedTheme === theme.id}
								onclick={() => selectedTheme = theme.id}
							>
								<div class="theme-emoji">{theme.emoji}</div>
								<div class="theme-info">
									<div class="theme-name">{theme.label}</div>
									<div class="theme-desc">{theme.desc}</div>
								</div>
								{#if selectedTheme === theme.id}
									<div class="theme-check"><Check size={16} /></div>
								{/if}
							</button>
						{/each}
					</div>

					<div class="topic-input-section">
						<label for="custom-topic">
							{selectedTheme === 'custom' ? '✨ Topik Spesifik (wajib):' : '🎯 Topik Spesifik (opsional, lebih fokus):'}
						</label>
						<input
							id="custom-topic"
							type="text"
							bind:value={customTopic}
							placeholder={selectedTheme === 'custom' ? 'Contoh: Trik psikologi saat negosiasi gaji...' : `Contoh: ${THEMES.find(t => t.id === selectedTheme)?.exampleTopics?.[0] || 'topik spesifik...'}`}
							class="topic-input"
						/>
					</div>

					<!-- Aspect Ratio Selection -->
					<div class="aspect-ratio-section">
						<label>📐 Orientasi & Rasio Video (Aspect Ratio)</label>
						<div class="aspect-ratio-options">
							<button
								type="button"
								class="aspect-btn"
								class:selected={aspectRatio === '9:16'}
								onclick={() => aspectRatio = '9:16'}
							>
								<div class="aspect-icon-box portrait">
									<div class="aspect-rect portrait"></div>
								</div>
								<div class="aspect-info">
									<span class="aspect-title">📱 9:16 Vertikal</span>
									<span class="aspect-sub">Shorts, Reels, TikTok (1080×1920)</span>
								</div>
							</button>

							<button
								type="button"
								class="aspect-btn"
								class:selected={aspectRatio === '16:9'}
								onclick={() => aspectRatio = '16:9'}
							>
								<div class="aspect-icon-box landscape">
									<div class="aspect-rect landscape"></div>
								</div>
								<div class="aspect-info">
									<span class="aspect-title">🖥️ 16:9 Horizontal</span>
									<span class="aspect-sub">YouTube Standard / TV (1920×1080)</span>
								</div>
							</button>

							<button
								type="button"
								class="aspect-btn"
								class:selected={aspectRatio === '1:1'}
								onclick={() => aspectRatio = '1:1'}
							>
								<div class="aspect-icon-box square">
									<div class="aspect-rect square"></div>
								</div>
								<div class="aspect-info">
									<span class="aspect-title">⏹️ 1:1 Persegi</span>
									<span class="aspect-sub">Instagram Feed / Post (1080×1080)</span>
								</div>
							</button>
						</div>
					</div>

					<div class="duration-section">
						<label>🎬 Target Durasi</label>
						<div class="duration-options">
							{#each [
								{ val: 30, label: '30 Detik', sub: '~70 kata' },
								{ val: 35, label: '35 Detik', sub: '~82 kata' },
								{ val: 40, label: '40 Detik', sub: '~93 kata' },
								{ val: 45, label: '45 Detik', sub: '~105 kata' },
								{ val: 55, label: '55 Detik', sub: '~128 kata' },
								{ val: 59, label: '59 Detik', sub: '~138 kata' }
							] as dur}
								<button
									class="duration-btn"
									class:selected={targetDuration === dur.val}
									onclick={() => targetDuration = dur.val}
								>
									<span class="dur-label">{dur.label}</span>
									<span class="dur-sub">{dur.sub}</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="step-actions">
						<button
							class="btn-primary"
							onclick={handleGenerateTitles}
							disabled={isGeneratingTitles || (selectedTheme === 'custom' && !customTopic.trim())}
						>
							{#if isGeneratingTitles}
								<RefreshCw size={18} class="spin" />
								<span>AI Memilih Judul Terbaik...</span>
							{:else}
								<Sparkles size={18} />
								<span>Generate Pilihan Judul →</span>
							{/if}
						</button>
					</div>
				</div>
			{/if}

			<!-- ============================== -->
			<!-- STEP 2: JUDUL & NASKAH -->
			<!-- ============================== -->
			{#if step === 2}
				<div class="step-content">
					<div class="step-header">
						<div class="step-number">02</div>
						<div style="flex: 1;">
							<div class="step-header-row">
								<h2>Pilih Judul & Generate Naskah</h2>
								<button
									class="btn-reroll-top"
									onclick={() => handleGenerateTitles(true)}
									disabled={isGeneratingTitles}
									title="Generate 3 pilihan judul baru yang berbeda"
								>
									<RefreshCw size={14} class={isGeneratingTitles ? 'spin' : ''} />
									<span>{isGeneratingTitles ? 'Meracik Judul Baru...' : '🎲 Acak Judul Baru'}</span>
								</button>
							</div>
							<p>AI membuat 3 opsi judul viral. Pilih satu, atau klik <strong>Acak Judul Baru</strong> untuk opsi sudut pandang lain.</p>
						</div>
					</div>

					{#if isGeneratingTitles && titleOptions.length === 0}
						<div class="titles-loading-state">
							<RefreshCw size={26} class="spin" />
							<span>AI sedang meracik 3 sudut pandang judul baru yang viral...</span>
						</div>
					{:else if titleOptions.length > 0}
						<div class="titles-list" class:loading-faded={isGeneratingTitles}>
							{#each titleOptions as t, i}
								<button
									class="title-card"
									class:selected={selectedTitle?.title === t.title}
									onclick={() => { selectedTitle = t; scenes = []; }}
									disabled={isGeneratingTitles}
								>
									<div class="title-rank">#{i + 1}</div>
									<div class="title-body">
										{#if t.subTopic}
											<div class="title-subtopic-tag">🎯 {t.subTopic}</div>
										{/if}
										<div class="title-text">{t.title}</div>
										{#if t.hook}
											<div class="title-hook">"{t.hook}"</div>
										{/if}
									</div>
									{#if t.ctrscore}
										<div class="title-ctr">
											<span>CTR</span>
											<strong>{t.ctrscore}</strong>
										</div>
									{/if}
									{#if selectedTitle?.title === t.title}
										<div class="title-check"><Check size={18} /></div>
									{/if}
								</button>
							{/each}
						</div>

						<div class="step-actions">
							<button
								class="btn-secondary"
								onclick={() => step = 1}
							>
								<ChevronLeft size={16} />
								Ganti Tema
							</button>
							<button
								class="btn-secondary"
								onclick={() => handleGenerateTitles(true)}
								disabled={isGeneratingTitles}
							>
								<RefreshCw size={15} class={isGeneratingTitles ? 'spin' : ''} />
								Acak Judul Lain
							</button>
							<button
								class="btn-primary"
								onclick={handleGenerateScript}
								disabled={!selectedTitle || isGeneratingScript || isGeneratingTitles}
							>
								{#if isGeneratingScript}
									<RefreshCw size={18} class="spin" />
									<span>AI Menulis Naskah...</span>
								{:else}
									<Wand2 size={18} />
									<span>Generate Naskah Adegan →</span>
								{/if}
							</button>
						</div>
					{/if}

					<!-- Script scenes preview -->
					{#if scenes.length > 0}
						<div class="scenes-preview">
							<div class="scenes-header">
								<h3>📋 Naskah – {scenes.length} Adegan ({totalScenesDuration()}s)</h3>
								<button class="btn-ghost" onclick={handleGenerateScript} disabled={isGeneratingScript}>
									<RefreshCw size={14} />
									Regenerate
								</button>
							</div>

							<div class="scenes-list">
								{#each scenes as scene, i}
									<div class="scene-card">
										<div class="scene-number">{i + 1}</div>
										<div class="scene-body">
											<div class="scene-text">
												<label>Narasi:</label>
												<textarea
													bind:value={scene.spokenText}
													rows="2"
													class="scene-textarea"
												></textarea>
											</div>
											<div class="scene-meta">
												<span class="scene-dur"><Clock size={12} />{scene.duration}s</span>
												<span class="scene-query"><Search size={12} />Giphy: <em>{scene.giphyQuery}</em></span>
											</div>
										</div>
									</div>
								{/each}
							</div>

							<div class="step-actions">
								<button class="btn-primary" onclick={() => step = 3}>
									<Film size={18} />
									Pilih Footage Giphy →
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- ============================== -->
			<!-- STEP 3: FOOTAGE GIPHY / PEXELS -->
			<!-- ============================== -->
			{#if step === 3}
				<div class="step-content">
					<div class="step-header">
						<div class="step-number">03</div>
						<div>
							<h2>Pilih Footage & Klip Video</h2>
							<p>AI otomatis mencari klip visual per adegan. Anda bisa mengedit kata kunci dan memilih klip secara fleksibel.</p>
						</div>
					</div>

					<div class="footage-toolbar">
						<div class="source-pills">
							<span class="source-pills-label">Sumber:</span>
							<button
								class="source-pill"
								class:active={footageSource === 'auto'}
								onclick={() => footageSource = 'auto'}
							>
								🤖 Otomatis (Giphy + Pexels)
							</button>
							<button
								class="source-pill"
								class:active={footageSource === 'giphy'}
								onclick={() => footageSource = 'giphy'}
							>
								👾 Giphy GIF
							</button>
							<button
								class="source-pill"
								class:active={footageSource === 'pexels'}
								onclick={() => footageSource = 'pexels'}
							>
								📹 Pexels Video
							</button>
						</div>

						<div class="ratio-pills">
							<span class="source-pills-label">Rasio:</span>
							<button class="source-pill" class:active={aspectRatio === '9:16'} onclick={() => { aspectRatio = '9:16'; searchAllScenes(); }} title="Pari video orientasi 9:16">
								📱 9:16
							</button>
							<button class="source-pill" class:active={aspectRatio === '16:9'} onclick={() => { aspectRatio = '16:9'; searchAllScenes(); }} title="Pari video orientasi 16:9">
								🖥️ 16:9
							</button>
							<button class="source-pill" class:active={aspectRatio === '1:1'} onclick={() => { aspectRatio = '1:1'; searchAllScenes(); }} title="Pari video orientasi 1:1">
								⏹️ 1:1
							</button>
						</div>

						<div class="giphy-key-mini">
							<span title="Opsional">🔑 Giphy Key:</span>
							<input
								type="text"
								bind:value={giphyApiKey}
								placeholder="Default server key (opsional)"
								class="api-key-input-sm"
							/>
						</div>
					</div>

					<div class="footage-actions">
						<button class="btn-primary" onclick={searchAllScenes} disabled={searchingSceneIdx !== null}>
							{#if searchingSceneIdx !== null}
								<RefreshCw size={16} class="spin" />
								Mencari Klip (Scene {searchingSceneIdx + 1})...
							{:else}
								<Search size={16} />
								Cari Semua Klip Otomatis
							{/if}
						</button>
					</div>

					<div class="footage-scenes">
						{#each scenes as scene, i}
							<div class="footage-scene">
								<div class="footage-scene-header">
									<div class="footage-scene-num">Scene {i + 1}</div>

									<!-- Interactive Editable Query Input -->
									<div class="footage-query-box">
										<Search size={13} class="query-icon" />
										<input
											type="text"
											bind:value={scene.giphyQuery}
											class="footage-query-input"
											placeholder="Kata kunci pencarian (misal: detective, mind blown, cat)"
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													searchGiphyForScene(i);
												}
											}}
										/>
									</div>

									<button
										class="btn-ghost-sm btn-search-clip"
										onclick={() => searchGiphyForScene(i)}
										disabled={searchingSceneIdx === i}
										title="Cari klip untuk kata kunci ini"
									>
										{#if searchingSceneIdx === i}
											<RefreshCw size={12} class="spin" />
										{:else}
											<Search size={12} />
										{/if}
										Cari
									</button>

									<div class="footage-scene-text" title={scene.spokenText}>{scene.spokenText.slice(0, 50)}...</div>
								</div>

								<!-- Keyword Suggestions / Opsi Keyword Lain -->
								{#if getSceneKeywordSuggestions(scene, i).length > 0}
									<div class="keyword-suggestions-row">
										<span class="kw-label">💡 Opsi Keyword Lain:</span>
										<div class="kw-chips">
											{#each getSceneKeywordSuggestions(scene, i) as kw}
												<button
													type="button"
													class="kw-chip"
													class:active={scene.giphyQuery?.toLowerCase() === kw.toLowerCase()}
													onclick={() => handleSelectKeywordSuggestion(i, kw)}
													title={`Klik untuk mencari footage: "${kw}"`}
												>
													<Sparkles size={11} />
													<span>{kw}</span>
												</button>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Current selected clip -->
								{#if scene.selectedClip}
									<div class="selected-clip">
										<div class="selected-clip-header">
											<span class="selected-clip-label">✅ Terpilih:</span>
											{#if scene.selectedClip.source === 'pexels'}
												<span class="clip-badge pexels">📹 Pexels 9:16</span>
											{:else}
												<span class="clip-badge giphy">👾 Giphy</span>
											{/if}
										</div>
										<div class="clip-preview-container">
											<video
												src={scene.selectedClip.mp4Url}
												autoplay
												loop
												muted
												playsinline
												class="clip-video-thumb"
											></video>
											<div class="clip-meta">
												<div class="clip-info">{scene.selectedClip.title?.slice(0, 50) || 'Klip Terpilih'}</div>
												<div class="clip-dimensions">{scene.selectedClip.width}×{scene.selectedClip.height} px • {scene.selectedClip.source?.toUpperCase()}</div>
											</div>
										</div>
									</div>
								{:else}
									<div class="no-clip-placeholder">
										<Film size={20} />
										<span>Belum ada klip. Ketik kata kunci lalu klik "Cari".</span>
									</div>
								{/if}

								<!-- Search results grid -->
								{#if giphyResults[i]?.length > 0}
									<div class="results-grid-header">
										<span>Pilihan Footage ({giphyResults[i].length} klip) - Klik klip untuk memilih:</span>
									</div>
									<div class="giphy-results-grid">
										{#each giphyResults[i] as clip}
											<button
												class="giphy-result-item"
												class:selected-result={scene.selectedClip?.id === clip.id}
												onclick={() => selectClip(i, clip)}
												title={clip.title}
											>
												<video
													src={clip.mp4Url}
													autoplay
													loop
													muted
													playsinline
													class="result-video"
												></video>
												<div class="result-badge-tag">
													{#if clip.source === 'pexels'}
														<span class="mini-badge pexels">📹 Pexels</span>
													{:else}
														<span class="mini-badge giphy">👾 Giphy</span>
													{/if}
												</div>
												{#if scene.selectedClip?.id === clip.id}
													<div class="result-check"><Check size={16} /></div>
												{/if}
											</button>
										{/each}
									</div>
								{:else if giphyResults[i] && giphyResults[i].length === 0 && searchingSceneIdx !== i}
									<div class="empty-clips-hint">
										<AlertCircle size={14} />
										<span>Klip tidak ditemukan untuk kata kunci ini. Coba gunakan kata kunci bahasa Inggris yang lebih sederhana (1-2 kata).</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<div class="step-actions">
						<button class="btn-secondary" onclick={() => step = 2}><ChevronLeft size={16} />Kembali</button>
						<button class="btn-primary" onclick={() => step = 4}>
							<Music size={18} />
							Atur Audio & Style →
						</button>
					</div>
				</div>
			{/if}

			<!-- ============================== -->
			<!-- STEP 4: AUDIO & STYLE -->
			<!-- ============================== -->
			{#if step === 4}
				<div class="step-content">
					<div class="step-header">
						<div class="step-number">04</div>
						<div>
							<h2>Audio & Subtitle Style</h2>
							<p>Atur voiceover, BGM, dan tampilan subtitle untuk video Shorts-mu.</p>
						</div>
					</div>

					<div class="settings-grid">
						<!-- Voice -->
						<div class="settings-section voice-section">
							<div class="section-header-row">
								<h3><Mic size={16} /> Voiceover Engine</h3>
								<div class="engine-tabs">
									<button
										type="button"
										class="engine-tab"
										class:active={selectedVoiceEngine === 'edge_tts'}
										onclick={() => {
											selectedVoiceEngine = 'edge_tts';
											if (!selectedVoice.startsWith('id-ID-') && !selectedVoice.startsWith('en-US-')) selectedVoice = contentLang === 'en' ? 'en-US-ChristopherNeural' : 'id-ID-ArdiNeural';
										}}
									>
										<Mic size={13} /> Edge TTS (Gratis)
									</button>
									<button
										type="button"
										class="engine-tab eleven-tab"
										class:active={selectedVoiceEngine === 'elevenlabs'}
										onclick={() => {
											selectedVoiceEngine = 'elevenlabs';
											if (selectedVoice.startsWith('id-ID-')) selectedVoice = 'pNInz6obpgDQGcFmaJgB';
										}}
									>
										<Sparkles size={13} /> ElevenLabs AI
									</button>
									<button
										type="button"
										class="engine-tab upload-tab"
										class:active={selectedVoiceEngine === 'upload'}
										onclick={() => {
											selectedVoiceEngine = 'upload';
											if (scenes.length === 0 || !scenes.some(s => s.voiceAudioUrl)) {
												showVoiceUploadModal = true;
											}
										}}
									>
										<Upload size={13} /> Voice Narasi Upload
									</button>
								</div>
							</div>

							{#if selectedVoiceEngine === 'upload'}
								<div class="upload-voice-panel">
									<div class="uvp-header">
										<div class="uvp-info">
											<div class="uvp-title">🎙️ Audio Narasi dari File Upload</div>
											<div class="uvp-sub">Audio dipotong presisi per adegan & disinkronkan otomatis dengan timing subtitle dan video.</div>
										</div>
										<button type="button" class="btn-reupload-voice" onclick={() => showVoiceUploadModal = true}>
											<Upload size={14} /> Ganti File Suara
										</button>
									</div>

									{#if scenes.length > 0}
										<div class="scenes-audio-list">
											{#each scenes as sc, idx}
												<div class="scene-audio-item">
													<button
														type="button"
														class="btn-scene-play"
														class:playing={playingSceneAudioIdx === idx}
														onclick={() => toggleSceneAudio(idx, sc.voiceAudioUrl)}
														title="Dengarkan audio adegan ini"
														disabled={!sc.voiceAudioUrl}
													>
														{#if playingSceneAudioIdx === idx}
															<Pause size={14} />
														{:else}
															<Play size={14} />
														{/if}
													</button>
													<div class="scene-audio-meta">
														<div class="scene-audio-title">Adegan {idx + 1} ({sc.audioDuration || sc.duration || 4}s)</div>
														<div class="scene-audio-text">"{sc.spokenText || ''}"</div>
													</div>
													{#if sc.giphyQuery}
														<div class="scene-clip-tag">
															<Film size={12} /> {sc.giphyQuery}
														</div>
													{/if}
												</div>
											{/each}
										</div>
									{:else}
										<div class="upload-empty-notice">
											<p>Belum ada audio narasi yang diupload.</p>
											<button type="button" class="btn-primary" onclick={() => showVoiceUploadModal = true}>
												<Upload size={16} /> Upload Audio Sekarang
											</button>
										</div>
									{/if}
								</div>
							{:else if selectedVoiceEngine === 'edge_tts'}
								<div class="option-row">
									{#each VOICE_OPTIONS.filter(v => v.lang === contentLang) as voice}
										<button
											class="option-card"
											class:selected={selectedVoice === voice.id}
											onclick={() => selectedVoice = voice.id}
										>
											{voice.label}
											{#if selectedVoice === voice.id}<Check size={14} />{/if}
										</button>
									{/each}
								</div>
								<label class="slider-label">
									<span>Kecepatan Bicara: {voiceRate}</span>
									<input
										type="range"
										min="-5"
										max="20"
										step="1"
										value={parseInt(voiceRate)}
										oninput={(e) => voiceRate = `${e.target.value >= 0 ? '+' : ''}${e.target.value}%`}
										class="slider"
									/>
								</label>
							{:else}
								<!-- ElevenLabs API Key & Subscription Bar -->
								<div class="eleven-key-card">
									<div class="key-input-row">
										<div class="key-field">
											<Key size={14} class="key-icon" />
											<input
												type={showElevenKey ? 'text' : 'password'}
												placeholder="ElevenLabs API Key..."
												bind:value={elevenLabsApiKey}
												onchange={() => fetchElevenVoices(elevenLabsApiKey)}
												class="key-input"
											/>
											<button
												type="button"
												class="icon-btn-ghost"
												onclick={() => showElevenKey = !showElevenKey}
												title={showElevenKey ? 'Sembunyikan' : 'Tampilkan'}
											>
												{#if showElevenKey}<EyeOff size={14} />{:else}<Eye size={14} />{/if}
											</button>
										</div>
										<button
											type="button"
											class="fetch-btn"
											disabled={isFetchingElevenVoices || !elevenLabsApiKey}
											onclick={() => fetchElevenVoices(elevenLabsApiKey)}
										>
											{#if isFetchingElevenVoices}
												<RefreshCw size={13} class="spin" /> Cek...
											{:else}
												<RefreshCw size={13} /> Cek Kuota
											{/if}
										</button>
									</div>

									{#if elevenSubscription}
										<div class="subscription-badge">
											<Sparkles size={12} />
											<span>Tersisa <strong>{elevenSubscription.remainingCharacters.toLocaleString()}</strong> / {elevenSubscription.characterLimit.toLocaleString()} karakter ({elevenSubscription.tier})</span>
										</div>
									{:else}
										<p class="key-hint">💡 API Key tersimpan otomatis di browser & dibaca dari file <code>.env</code>.</p>
									{/if}
								</div>

								<div class="eleven-model-box">
									<div class="model-box-header">
										<div class="model-title-with-badge">
											<span class="model-section-title">🤖 Model AI ElevenLabs</span>
											<span class="model-indonesia-pill">🌐 Support 30+ Languages</span>
										</div>
										<span class="model-section-hint">Semua model di bawah fasih membaca naskah berbagai bahasa</span>
									</div>
									<div class="model-cards-list">
										{#each ELEVEN_MODELS as m}
											<button
												type="button"
												class="model-chip"
												class:selected={selectedElevenModel === m.id}
												onclick={() => selectedElevenModel = m.id}
											>
												<div class="model-chip-top">
													<span class="model-chip-name">{m.name}</span>
													<span class="model-chip-badge">{m.badge}</span>
												</div>
												<span class="model-chip-desc">{m.desc}</span>
												{#if selectedElevenModel === m.id}
													<div class="model-chip-check"><Check size={13} /></div>
												{/if}
											</button>
										{/each}
									</div>
								</div>

								<!-- ElevenLabs Voice Grid -->
								<div class="eleven-voice-grid">
									{#each availableElevenVoices as voice}
										<div
											class="eleven-voice-card"
											class:selected={selectedVoice === voice.id}
											onclick={() => selectedVoice = voice.id}
											role="button"
											tabindex="0"
											onkeydown={(e) => e.key === 'Enter' && (selectedVoice = voice.id)}
										>
											<div class="voice-card-top">
												<span class="voice-emoji">{voice.emoji || '🎙️'}</span>
												<div class="voice-info">
													<div class="voice-name-row">
														<span class="voice-name">{voice.name}</span>
														{#if voice.tag}
															<span class="voice-tag" class:native={voice.tag.includes('Native')}>{voice.tag}</span>
														{:else}
															<span class="voice-badge">{voice.category || 'Multilingual'}</span>
														{/if}
													</div>
												</div>
												{#if voice.sampleUrl}
													<button
														type="button"
														class="sample-play-btn"
														class:playing={playingVoiceId === voice.id}
														onclick={(e) => playVoiceSample(voice, e)}
														title="Dengarkan Contoh Suara"
													>
														{#if playingVoiceId === voice.id}
															<Pause size={12} />
														{:else}
															<Play size={12} />
														{/if}
													</button>
												{/if}
												{#if selectedVoice === voice.id}
													<div class="check-badge"><Check size={12} /></div>
												{/if}
											</div>
											{#if voice.description}
												<p class="voice-desc">{voice.description}</p>
											{/if}
										</div>
									{/each}
								</div>

								<!-- Advanced Tuning Sliders -->
								<div class="eleven-tuning-row">
									<label class="slider-label small">
										<span>Stability: {Math.round(elevenStability * 100)}%</span>
										<input type="range" min="0.1" max="1" step="0.05" bind:value={elevenStability} class="slider" />
									</label>
									<label class="slider-label small">
										<span>Clarity / Similarity: {Math.round(elevenSimilarity * 100)}%</span>
										<input type="range" min="0.1" max="1" step="0.05" bind:value={elevenSimilarity} class="slider" />
									</label>
								</div>
							{/if}
						</div>

						<!-- BGM -->
						<div class="settings-section">
							<h3><Music size={16} /> Background Music</h3>
							<div class="option-grid">
								{#each BGM_OPTIONS as bgm}
									<button
										class="option-card"
										class:selected={selectedBgm === bgm.id}
										onclick={() => selectedBgm = bgm.id}
									>
										<span class="opt-emoji">{bgm.emoji}</span>
										{bgm.label}
										{#if selectedBgm === bgm.id}<Check size={14} />{/if}
									</button>
								{/each}
							</div>
							{#if selectedBgm !== 'none'}
								<label class="slider-label">
									<span>Volume BGM: {Math.round(bgmVolume * 100)}%</span>
									<input
										type="range"
										min="5"
										max="30"
										step="1"
										value={bgmVolume * 100}
										oninput={(e) => bgmVolume = e.target.value / 100}
										class="slider"
									/>
								</label>
							{/if}
						</div>

						<!-- Subtitle -->
						<div class="settings-section">
							<h3><Type size={16} /> Subtitle Style</h3>
							<div class="toggle-row">
								<span>Tampilkan Subtitle</span>
								<button class="toggle-btn" class:on={subtitlesEnabled} onclick={() => subtitlesEnabled = !subtitlesEnabled}>
									<div class="toggle-thumb"></div>
								</button>
							</div>
							{#if subtitlesEnabled}
								<div class="subtitle-styles">
									{#each SUBTITLE_STYLES as style}
										<button
											class="subtitle-style-card"
											class:selected={selectedSubtitle === style.id}
											onclick={() => selectedSubtitle = style.id}
										>
											<strong>{style.label}</strong>
											<span>{style.desc}</span>
											{#if selectedSubtitle === style.id}<Check size={14} />{/if}
										</button>
									{/each}
								</div>

								<!-- Tata Letak & Posisi Subtitle dengan Live Preview -->
								<div class="subtitle-layout-box">
									<div class="layout-box-header">
										<div class="layout-box-title-group">
											<Sliders size={16} />
											<span class="box-title">Tata Letak & Animasi Subtitle</span>
										</div>
										<span class="live-badge">
											<span class="pulse-dot"></span> Live Preview
										</span>
									</div>

									<!-- Mode Tampilan Kata (Word by Word) -->
									<div class="layout-field-group">
										<div class="mode-header-row">
											<label class="field-label">Mode Tampilan Kata</label>
											{#if subtitleDisplayMode === 'word_by_word'}
												<span class="active-mode-badge highlight-mode-pop">⚡ Word by Word (1 Kata)</span>
											{:else if subtitleDisplayMode === 'highlight'}
												<span class="active-mode-badge highlight-mode-karaoke">🌟 Karaoke Highlight</span>
											{:else}
												<span class="active-mode-badge">📑 Frasa Ringkas</span>
											{/if}
										</div>
										<div class="mode-pills-row">
											<button
												type="button"
												class="mode-pill"
												class:active={subtitleDisplayMode === 'chunk'}
												onclick={() => setSubtitleMode('chunk')}
											>
												<span class="mode-pill-icon">📑</span>
												<div class="mode-pill-text">
													<strong>Frasa Standar</strong>
													<small>2-3 kata per baris</small>
												</div>
											</button>
											<button
												type="button"
												class="mode-pill"
												class:active={subtitleDisplayMode === 'word_by_word'}
												onclick={() => setSubtitleMode('word_by_word')}
											>
												<span class="mode-pill-icon">⚡</span>
												<div class="mode-pill-text">
													<strong>Word by Word</strong>
													<small>1 kata cepat & punchy</small>
												</div>
											</button>
											<button
												type="button"
												class="mode-pill"
												class:active={subtitleDisplayMode === 'highlight'}
												onclick={() => setSubtitleMode('highlight')}
											>
												<span class="mode-pill-icon">🌟</span>
												<div class="mode-pill-text">
													<strong>Karaoke</strong>
													<small>Sorot kata aktif</small>
												</div>
											</button>
										</div>
									</div>

									<!-- Preset Posisi -->
									<div class="layout-field-group">
										<label class="field-label">Posisi Teks (Preset)</label>
										<div class="preset-pills">
											<button
												type="button"
												class="preset-pill"
												class:active={subtitlePosition === 'bottom'}
												onclick={() => setSubtitlePositionPreset('bottom')}
											>
												<span class="pill-icon">⬇️</span>
												<span>Bawah</span>
											</button>
											<button
												type="button"
												class="preset-pill"
												class:active={subtitlePosition === 'center'}
												onclick={() => setSubtitlePositionPreset('center')}
											>
												<span class="pill-icon">⏺️</span>
												<span>Tengah</span>
											</button>
											<button
												type="button"
												class="preset-pill"
												class:active={subtitlePosition === 'top'}
												onclick={() => setSubtitlePositionPreset('top')}
											>
												<span class="pill-icon">⬆️</span>
												<span>Atas</span>
											</button>
										</div>
									</div>

									<!-- Slider Vertikal Y -->
									<div class="layout-field-group">
										<div class="slider-header-row">
											<label class="field-label" for="subtitle-y-slider">Jarak Vertikal (Y)</label>
											<span class="slider-val-badge">{subtitleYPercent}%</span>
										</div>
										<div class="slider-container">
											<span class="slider-edge-label">Atas</span>
											<input
												id="subtitle-y-slider"
												type="range"
												min="15"
												max="88"
												step="1"
												bind:value={subtitleYPercent}
												oninput={(e) => handleYPercentChange(Number(e.currentTarget.value))}
												class="sub-range-input"
											/>
											<span class="slider-edge-label">Bawah</span>
										</div>
									</div>

									<!-- Grid: Ukuran Font & Perataan Teks -->
									<div class="layout-grid-row">
										<!-- Ukuran Font -->
										<div class="layout-field-group">
											<label class="field-label">Ukuran Font</label>
											<div class="option-pill-group">
												<button
													type="button"
													class="option-pill"
													class:active={subtitleFontScale === 0.85}
													onclick={() => subtitleFontScale = 0.85}
												>
													Kecil
												</button>
												<button
													type="button"
													class="option-pill"
													class:active={subtitleFontScale === 1.0}
													onclick={() => subtitleFontScale = 1.0}
												>
													Normal
												</button>
												<button
													type="button"
													class="option-pill"
													class:active={subtitleFontScale === 1.2}
													onclick={() => subtitleFontScale = 1.2}
												>
													Besar
												</button>
											</div>
										</div>

										<!-- Perataan Teks -->
										<div class="layout-field-group">
											<label class="field-label">Perataan Teks</label>
											<div class="option-pill-group">
												<button
													type="button"
													class="option-pill"
													class:active={subtitleAlign === 'left'}
													onclick={() => subtitleAlign = 'left'}
												>
													Kiri
												</button>
												<button
													type="button"
													class="option-pill"
													class:active={subtitleAlign === 'center'}
													onclick={() => subtitleAlign = 'center'}
												>
													Tengah
												</button>
												<button
													type="button"
													class="option-pill"
													class:active={subtitleAlign === 'right'}
													onclick={() => subtitleAlign = 'right'}
												>
													Kanan
												</button>
											</div>
										</div>
									</div>

									<div class="layout-footer-hint">
										💡 Perubahan posisi & tata letak langsung diperbarui di layar smartphone sebelah kanan.
									</div>
								</div>
							{/if}
						</div>
					</div>

					<div class="step-actions">
						<button class="btn-secondary" onclick={() => step = 3}><ChevronLeft size={16} />Kembali</button>
						<button class="btn-primary" onclick={() => step = 5}>
							<Zap size={18} />
							Lanjut ke Render →
						</button>
					</div>
				</div>
			{/if}

			<!-- ============================== -->
			<!-- STEP 5: RENDER -->
			<!-- ============================== -->
			{#if step === 5}
				<div class="step-content">
					<div class="step-header">
						<div class="step-number">05</div>
						<div>
							<h2>Render & Download</h2>
							<p>FFmpeg akan merender video 1080×1920 siap upload ke YouTube Shorts.</p>
						</div>
					</div>

					<!-- Summary -->
					<div class="render-summary">
						<div class="summary-item">
							<span class="summary-label">Judul</span>
							<span class="summary-value">{selectedTitle?.title || '-'}</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">Adegan</span>
							<span class="summary-value">{scenes.length} scene</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">Durasi</span>
							<span class="summary-value">~{totalScenesDuration()}s</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">Voice</span>
							<span class="summary-value">{getVoiceDisplayName(selectedVoice)}</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">BGM</span>
							<span class="summary-value">{BGM_OPTIONS.find(b => b.id === selectedBgm)?.label}</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">Subtitle</span>
							<span class="summary-value">
								{subtitlesEnabled 
									? `${SUBTITLE_STYLES.find(s => s.id === selectedSubtitle)?.label} · ${subtitlePosition.toUpperCase()} (${subtitleYPercent}%) · ${subtitleDisplayMode === 'word_by_word' ? '⚡ WORD BY WORD' : subtitleDisplayMode === 'highlight' ? '🌟 KARAOKE' : 'FRASA'}`
									: 'Tanpa Subtitle'}
							</span>
						</div>
						<div class="summary-item">
							<span class="summary-label">Output</span>
							<span class="summary-value highlight">
								{#if aspectRatio === '16:9'}
									1920 × 1080 px (16:9 Horizontal) · 30fps
								{:else if aspectRatio === '1:1'}
									1080 × 1080 px (1:1 Persegi) · 30fps
								{:else}
									1080 × 1920 px (9:16 Vertikal) · 30fps
								{/if}
							</span>
						</div>
					</div>

					{#if !renderResult && !isRendering}
						<div class="render-action-section">
							<button class="btn-render" onclick={handleRender}>
								<Zap size={22} />
								<span>Render Video Shorts</span>
							</button>
						</div>
					{/if}

					{#if isRendering}
						<div class="render-progress-panel">
							<div class="render-steps">
								{#each [
									{ n: 1, label: '\ud83c\udfa4 Voiceover' },
									{ n: 2, label: '\ud83c\udfac Scene Clips' },
									{ n: 3, label: '\ud83d\udcdd Subtitle' },
									{ n: 4, label: '\ud83d\udd17 Concat' },
									{ n: 5, label: '\u26a1 Mix & Render' }
								] as rs}
									<div class="render-step-item"
										class:step-active={renderStep === rs.n}
										class:step-done={renderStep > rs.n || renderPercent === 100}
									>
										<div class="render-step-dot"></div>
										<span>{rs.label}</span>
									</div>
								{/each}
							</div>
							<div class="render-bar-wrap">
								<div class="render-bar-bg">
									<div class="render-bar-fill" style="width: {renderPercent}%"></div>
								</div>
								<span class="render-bar-pct">{renderPercent}%</span>
							</div>
							<p class="render-status-msg">{renderProgress}</p>
						</div>
					{/if}

					{#if renderError}
						<div class="render-error">
							<X size={20} />
							<div>
								<strong>Render Gagal</strong>
								<p>{renderError}</p>
							</div>
							<button class="btn-ghost" onclick={handleRender}>Coba Lagi</button>
						</div>
					{/if}

					{#if renderResult}
						<div class="render-success">
							<div class="success-icon">🎉</div>
							<h3>Video Siap!</h3>
							<p>Durasi: {renderResult.duration}s · Format: MP4 1080×1920</p>

							<div class="render-preview">
								<video
									src={renderResult.outputUrl}
									controls
									class="output-video"
									style="max-height: 500px; width: auto;"
								></video>
							</div>

							<div class="result-actions">
								<a href={renderResult.outputUrl} download class="btn-download">
									<Download size={18} />
									Download Video
								</a>
								<button class="btn-secondary" onclick={resetAll}>
									<RotateCcw size={16} />
									Buat Video Baru
								</button>
							</div>
						</div>
					{/if}

					<div class="step-actions" style="margin-top: 1rem;">
						{#if !renderResult}
							<button class="btn-secondary" onclick={() => step = 4}><ChevronLeft size={16} />Kembali</button>
						{/if}
					</div>
				</div>
			{/if}
		</main>

		<!-- ============================================================ -->
		<!-- RIGHT PANEL: 9:16 Preview Phone -->
		<!-- ============================================================ -->
		<aside class="preview-panel">
			<div class="phone-container">
				<div class="phone-frame" class:ratio-landscape={aspectRatio === '16:9'} class:ratio-square={aspectRatio === '1:1'}>
					<div class="phone-notch"></div>
					<div class="phone-screen">
						<!-- Vertical canvas preview -->
						{#if scenes.length > 0 && previewingScene !== null && scenes[previewingScene]?.selectedClip}
							<video
								src={scenes[previewingScene].selectedClip.mp4Url}
								autoplay loop muted playsinline
								class="phone-video-bg"
							></video>
							<div class="phone-blur-bg" style="background-image: url({scenes[previewingScene].selectedClip.thumbnailUrl})"></div>
						{:else}
							<div class="phone-placeholder">
								<Sparkles size={32} />
								<span>Preview Scene</span>
							</div>
						{/if}

						<!-- Subtitle overlay preview (live preview with dynamic placement, font size, alignment & word-by-word) -->
						{#if subtitlesEnabled}
							{@const currentPreviewText = (previewingScene !== null && scenes[previewingScene]?.spokenText)
								? scenes[previewingScene].spokenText
								: (scenes[0]?.spokenText || 'CONTOH SUBTITLE VIRAL WORD BY WORD 🔥')}
							{@const previewWords = currentPreviewText.split(/\s+/).filter(Boolean)}
							<div
								class="phone-subtitle"
								class:viral-yellow={selectedSubtitle === 'viral-yellow'}
								class:mrbeast={selectedSubtitle === 'mrbeast-bold'}
								class:minimal={selectedSubtitle === 'minimal'}
								class:mode-word={subtitleDisplayMode === 'word_by_word'}
								style="top: {subtitleYPercent}%; bottom: auto; transform: translateY(-50%); left: {subtitleAlign === 'left' ? '12px' : subtitleAlign === 'right' ? 'auto' : '10px'}; right: {subtitleAlign === 'right' ? '12px' : subtitleAlign === 'left' ? 'auto' : '10px'}; text-align: {subtitleAlign}; font-size: calc({subtitleDisplayMode === 'word_by_word' ? '0.92rem' : '0.76rem'} * {subtitleFontScale});"
							>
								{#if subtitleDisplayMode === 'word_by_word'}
									{@const activeWord = previewWords.length > 0 ? previewWords[previewWordTimer % previewWords.length] : currentPreviewText}
									<span class="phone-word-burst">
										{selectedSubtitle === 'mrbeast-bold' ? activeWord.toUpperCase() : activeWord}
									</span>
								{:else if subtitleDisplayMode === 'highlight'}
									{@const chunkSize = 3}
									{@const safeWordsLen = Math.max(1, previewWords.length)}
									{@const chunkStart = Math.floor((previewWordTimer % safeWordsLen) / chunkSize) * chunkSize}
									{@const chunkWords = previewWords.slice(chunkStart, chunkStart + chunkSize)}
									{@const activeInChunk = (previewWordTimer % safeWordsLen) - chunkStart}
									<span class="phone-karaoke-chunk">
										{#each chunkWords as w, idx}
											<span class="karaoke-word" class:highlighted={idx === activeInChunk}>
												{selectedSubtitle === 'mrbeast-bold' ? w.toUpperCase() : w}{' '}
											</span>
										{/each}
									</span>
								{:else}
									{getPreviewSubtitle(currentPreviewText, selectedSubtitle)}
								{/if}
							</div>
						{/if}

						<!-- UI Overlay - YouTube Shorts style -->
						<div class="phone-ui-overlay">
							<div class="phone-likes">
								<div class="phone-like-btn">❤️</div>
								<span>12.4K</span>
								<div class="phone-like-btn">💬</div>
								<span>248</span>
								<div class="phone-like-btn">↗️</div>
								<span>Share</span>
							</div>
							<div class="phone-title-overlay">
								{selectedTitle?.title?.slice(0, 50) || 'Judul Video Shorts...'}
							</div>
						</div>
					</div>
					<div class="phone-bottom-bar">
						<div class="phone-progress"></div>
					</div>
				</div>
			</div>

			<!-- Scene navigator (if scenes exist) -->
			{#if scenes.length > 0}
				<div class="scene-nav">
					<p class="scene-nav-label">Preview Adegan:</p>
					<div class="scene-nav-btns">
						{#each scenes as scene, i}
							<button
								class="scene-nav-btn"
								class:active={previewingScene === i}
								onclick={() => previewingScene = previewingScene === i ? null : i}
								title={`Scene ${i + 1}: ${scene.spokenText.slice(0, 30)}...`}
							>
								{i + 1}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="preview-info">
				<div class="preview-spec">
					<span>📐</span>
					<span>{aspectRatio === '16:9' ? '1920 × 1080' : (aspectRatio === '1:1' ? '1080 × 1080' : '1080 × 1920')}</span>
				</div>
				<div class="preview-spec">
					<span>🎬</span>
					<span>{aspectRatio === '16:9' ? '16:9 Horizontal' : (aspectRatio === '1:1' ? '1:1 Persegi' : '9:16 Vertikal')}</span>
				</div>
				<div class="preview-spec">
					<span>⏱</span>
					<span>{scenes.length > 0 ? `~${totalScenesDuration()}s` : '0s'}</span>
				</div>
			</div>
		</aside>
	</div>

	<ShortsVoiceUploadModal
		isOpen={showVoiceUploadModal}
		initialTheme={selectedTheme}
		onSuccess={handleVoiceUploadSuccess}
		onClose={() => showVoiceUploadModal = false}
	/>
</div>

<style>
	:global(body) {
		background: #060612;
		color: #e8e8f0;
		font-family: 'Inter', 'Outfit', sans-serif;
		margin: 0;
	}

	.gradient-text {
		background: linear-gradient(135deg, #a78bfa, #ec4899);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* ================================================================ */
	/* HEADER */
	/* ================================================================ */
	.studio-header {
		background: linear-gradient(to bottom, #0d0d22 0%, rgba(6, 6, 18, 0.95) 100%);
		border-bottom: 1px solid rgba(167, 139, 250, 0.15);
		padding: 1.25rem 2rem 0;
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(16px);
	}

	.header-inner {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		max-width: 1400px;
		margin: 0 auto;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		color: rgba(167, 139, 250, 0.7);
		text-decoration: none;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		transition: color 0.2s;
	}
	.back-btn:hover { color: #a78bfa; }

	.title-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(167, 139, 250, 0.15);
		color: #a78bfa;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.header-title h1 {
		font-size: 1.6rem;
		font-weight: 800;
		margin: 0 0 0.25rem;
		line-height: 1.2;
	}
	.header-title p {
		font-size: 0.875rem;
		color: rgba(232, 232, 240, 0.55);
		margin: 0;
	}

	.step-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-top: 0.5rem;
	}

	.step-dot {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid rgba(167, 139, 250, 0.3);
		background: transparent;
		color: rgba(167, 139, 250, 0.5);
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.step-dot.active {
		border-color: #a78bfa;
		background: rgba(167, 139, 250, 0.2);
		color: #a78bfa;
		box-shadow: 0 0 12px rgba(167, 139, 250, 0.4);
	}
	.step-dot.done {
		border-color: #4ade80;
		background: rgba(74, 222, 128, 0.2);
		color: #4ade80;
		cursor: pointer;
	}
	.step-dot:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.step-labels {
		display: flex;
		gap: 0;
		max-width: 1400px;
		margin: 1rem auto 0;
	}

	.step-label {
		flex: 1;
		text-align: center;
		font-size: 0.75rem;
		color: rgba(232, 232, 240, 0.35);
		padding-bottom: 0.75rem;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}
	.step-label.active {
		color: #a78bfa;
		border-bottom-color: #a78bfa;
		font-weight: 600;
	}
	.step-label.done {
		color: #4ade80;
		border-bottom-color: rgba(74, 222, 128, 0.4);
	}

	/* Error Banner */
	.error-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		padding: 0.75rem 2rem;
		font-size: 0.875rem;
	}
	.error-banner button {
		margin-left: auto;
		background: none;
		border: none;
		color: #fca5a5;
		cursor: pointer;
	}

	/* ================================================================ */
	/* LAYOUT */
	/* ================================================================ */
	.studio-layout {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 0;
		max-width: 1400px;
		margin: 0 auto;
		min-height: calc(100vh - 140px);
	}

	.main-panel {
		padding: 2rem;
		border-right: 1px solid rgba(167, 139, 250, 0.08);
		overflow-y: auto;
	}

	.step-content {
		max-width: 780px;
		margin: 0 auto;
	}

	.step-header {
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		margin-bottom: 2rem;
	}

	.step-number {
		font-size: 3rem;
		font-weight: 900;
		color: rgba(167, 139, 250, 0.15);
		line-height: 1;
		flex-shrink: 0;
		letter-spacing: -2px;
	}

	.step-header h2 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0 0 0.4rem;
	}

	.step-header p {
		color: rgba(232, 232, 240, 0.55);
		margin: 0;
		font-size: 0.9rem;
	}

	/* ================================================================ */
	/* STEP 1 – THEME GRID */
	/* ================================================================ */
	.theme-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.theme-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(167, 139, 250, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.12);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		position: relative;
	}
	.theme-card:hover {
		border-color: rgba(167, 139, 250, 0.35);
		background: rgba(167, 139, 250, 0.1);
	}
	.theme-card.selected {
		border-color: #a78bfa;
		background: rgba(167, 139, 250, 0.15);
		box-shadow: 0 0 20px rgba(167, 139, 250, 0.15);
	}
	.theme-emoji { font-size: 1.75rem; flex-shrink: 0; }
	.theme-name { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem; }
	.theme-desc { font-size: 0.8rem; color: rgba(232, 232, 240, 0.5); }
	.theme-check {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		color: #a78bfa;
	}

	.topic-input-section {
		margin-bottom: 1.5rem;
	}
	.topic-input-section label {
		display: block;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: rgba(232, 232, 240, 0.7);
	}

	.topic-input, .api-key-input {
		width: 100%;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.2);
		border-radius: 10px;
		padding: 0.9rem 1.1rem;
		color: #e8e8f0;
		font-size: 0.95rem;
		outline: none;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}
	.topic-input:focus, .api-key-input:focus {
		border-color: rgba(167, 139, 250, 0.6);
	}

	.duration-section { margin-bottom: 2rem; }
	.duration-section label {
		display: block;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: rgba(232, 232, 240, 0.7);
	}
	.duration-options {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.duration-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.15);
		border-radius: 10px;
		padding: 0.6rem 1rem;
		cursor: pointer;
		transition: all 0.2s;
		color: #e8e8f0;
	}
	.duration-btn:hover { border-color: rgba(167, 139, 250, 0.4); }
	.duration-btn.selected {
		border-color: #a78bfa;
		background: rgba(167, 139, 250, 0.2);
	}
	.dur-label { font-weight: 700; font-size: 0.9rem; }
	.dur-sub { font-size: 0.72rem; color: rgba(232, 232, 240, 0.5); }

	/* ================================================================ */
	/* STEP 2 – TITLES */
	/* ================================================================ */
	.step-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.btn-reroll-top {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(167, 139, 250, 0.12);
		border: 1px solid rgba(167, 139, 250, 0.28);
		border-radius: 9999px;
		color: #c4b5fd;
		font-size: 0.82rem;
		font-weight: 700;
		padding: 0.35rem 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-reroll-top:hover:not(:disabled) {
		background: rgba(167, 139, 250, 0.22);
		border-color: #a78bfa;
		color: #ffffff;
		transform: translateY(-1px);
	}
	.btn-reroll-top:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.titles-loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 3rem 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px dashed rgba(167, 139, 250, 0.2);
		border-radius: 12px;
		color: #c4b5fd;
		font-size: 0.95rem;
		margin-bottom: 1.5rem;
	}
	.titles-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		transition: opacity 0.2s ease;
	}
	.titles-list.loading-faded {
		opacity: 0.45;
		pointer-events: none;
		filter: blur(0.5px);
	}

	.title-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(167, 139, 250, 0.12);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		position: relative;
	}
	.title-card:hover { border-color: rgba(167, 139, 250, 0.35); }
	.title-card.selected {
		border-color: #a78bfa;
		background: rgba(167, 139, 250, 0.12);
	}
	.title-rank {
		font-size: 1.5rem;
		font-weight: 900;
		color: rgba(167, 139, 250, 0.3);
		flex-shrink: 0;
		width: 2rem;
	}
	.title-body { flex: 1; }
	.title-subtopic-tag {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 700;
		color: #c4b5fd;
		background: rgba(167, 139, 250, 0.15);
		border: 1px solid rgba(167, 139, 250, 0.28);
		padding: 0.15rem 0.55rem;
		border-radius: 9999px;
		margin-bottom: 0.35rem;
		letter-spacing: 0.02em;
	}
	.title-text { font-weight: 700; font-size: 1rem; margin-bottom: 0.3rem; }
	.title-hook { font-size: 0.8rem; color: rgba(232, 232, 240, 0.5); font-style: italic; }
	.title-ctr {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: rgba(74, 222, 128, 0.1);
		border-radius: 8px;
		padding: 0.4rem 0.6rem;
		flex-shrink: 0;
	}
	.title-ctr span { font-size: 0.65rem; color: #4ade80; }
	.title-ctr strong { font-size: 1.1rem; color: #4ade80; }
	.title-check {
		position: absolute; right: 1rem;
		color: #a78bfa;
	}

	/* Scenes list */
	.scenes-preview { margin-top: 2rem; }
	.scenes-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	.scenes-header h3 { font-size: 1.05rem; font-weight: 700; margin: 0; }

	.scenes-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1.5rem;
		max-height: 420px;
		overflow-y: auto;
		padding-right: 0.25rem;
	}
	.scene-card {
		display: flex;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(167, 139, 250, 0.1);
		border-radius: 10px;
		padding: 0.85rem;
	}
	.scene-number {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: rgba(167, 139, 250, 0.15);
		color: #a78bfa;
		font-size: 0.8rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 4px;
	}
	.scene-body { flex: 1; }
	.scene-text label { font-size: 0.75rem; color: rgba(232, 232, 240, 0.45); margin-bottom: 0.3rem; display: block; }
	.scene-textarea {
		width: 100%;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		color: #e8e8f0;
		font-size: 0.875rem;
		resize: vertical;
		outline: none;
		box-sizing: border-box;
		line-height: 1.4;
	}
	.scene-meta {
		display: flex;
		gap: 1rem;
		margin-top: 0.4rem;
		flex-wrap: wrap;
	}
	.scene-dur, .scene-query {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: rgba(232, 232, 240, 0.45);
	}
	.scene-query em { color: rgba(167, 139, 250, 0.7); font-style: normal; }

	/* ================================================================ */
	/* STEP 3 – FOOTAGE */
	/* ================================================================ */
	/* ================================================================ */
	/* STEP 3 – FOOTAGE */
	/* ================================================================ */
	.footage-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(167, 139, 250, 0.12);
		border-radius: 12px;
		padding: 0.75rem 1rem;
		margin-bottom: 1.25rem;
	}
	.source-pills {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.source-pills-label {
		font-size: 0.8rem;
		color: rgba(232, 232, 240, 0.5);
		margin-right: 0.25rem;
	}
	.source-pill {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(232, 232, 240, 0.7);
		font-size: 0.78rem;
		padding: 0.35rem 0.75rem;
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.source-pill:hover {
		background: rgba(167, 139, 250, 0.15);
		color: #e8e8f0;
	}
	.source-pill.active {
		background: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(99, 102, 241, 0.3));
		border-color: #a78bfa;
		color: #fff;
		font-weight: 600;
	}
	.giphy-key-mini {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.78rem;
		color: rgba(232, 232, 240, 0.5);
	}
	.api-key-input-sm {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		font-size: 0.75rem;
		color: #e8e8f0;
		width: 170px;
	}
	.footage-actions { margin-bottom: 1.25rem; }

	.footage-scenes {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-height: 580px;
		overflow-y: auto;
		padding-right: 0.25rem;
	}

	.footage-scene {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(167, 139, 250, 0.12);
		border-radius: 12px;
		padding: 1rem;
		transition: border-color 0.2s;
	}
	.footage-scene:hover {
		border-color: rgba(167, 139, 250, 0.25);
	}

	.footage-scene-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.85rem;
		flex-wrap: wrap;
	}
	.footage-scene-num {
		background: rgba(167, 139, 250, 0.2);
		color: #a78bfa;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.25rem 0.6rem;
		border-radius: 20px;
		flex-shrink: 0;
	}
	.footage-query-box {
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(167, 139, 250, 0.25);
		border-radius: 8px;
		padding: 0.25rem 0.6rem;
		gap: 0.4rem;
		flex: 1;
		min-width: 220px;
		max-width: 380px;
	}
	.footage-query-box:focus-within {
		border-color: #a78bfa;
		box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
	}
	.footage-query-box :global(.query-icon) {
		color: rgba(167, 139, 250, 0.7);
		flex-shrink: 0;
	}
	.footage-query-input {
		background: transparent;
		border: none;
		outline: none;
		color: #f1f1f8;
		font-size: 0.82rem;
		width: 100%;
		font-weight: 500;
	}
	.footage-query-input::placeholder {
		color: rgba(232, 232, 240, 0.35);
	}
	.btn-search-clip {
		padding: 0.3rem 0.7rem;
		font-size: 0.78rem;
		border-radius: 6px;
	}
	.footage-scene-text {
		font-size: 0.78rem;
		color: rgba(232, 232, 240, 0.45);
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.selected-clip {
		margin-bottom: 0.75rem;
		background: rgba(74, 222, 128, 0.04);
		border: 1px solid rgba(74, 222, 128, 0.15);
		border-radius: 10px;
		padding: 0.6rem 0.75rem;
	}
	.selected-clip-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}
	.selected-clip-label {
		font-size: 0.75rem;
		color: #4ade80;
		font-weight: 600;
	}
	.clip-badge {
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.15rem 0.45rem;
		border-radius: 10px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.clip-badge.giphy {
		background: rgba(167, 139, 250, 0.2);
		color: #c4b5fd;
		border: 1px solid rgba(167, 139, 250, 0.3);
	}
	.clip-badge.pexels {
		background: rgba(20, 184, 166, 0.2);
		color: #5eead4;
		border: 1px solid rgba(20, 184, 166, 0.3);
	}
	.clip-preview-container { display: flex; align-items: center; gap: 0.75rem; }
	.clip-video-thumb {
		width: 110px;
		height: 70px;
		object-fit: cover;
		border-radius: 8px;
		border: 2px solid rgba(74, 222, 128, 0.4);
		background: #000;
	}
	.clip-meta { display: flex; flex-direction: column; gap: 0.2rem; }
	.clip-info { font-size: 0.8rem; color: rgba(232, 232, 240, 0.8); font-weight: 500; }
	.clip-dimensions { font-size: 0.7rem; color: rgba(232, 232, 240, 0.4); }

	.no-clip-placeholder {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: rgba(232, 232, 240, 0.35);
		font-size: 0.82rem;
		padding: 0.6rem 0;
	}

	.results-grid-header {
		font-size: 0.74rem;
		color: rgba(232, 232, 240, 0.5);
		margin-top: 0.5rem;
		margin-bottom: 0.35rem;
	}
	.giphy-results-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}
	.giphy-result-item {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		aspect-ratio: 16/9;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
		padding: 0;
		background: #000;
	}
	.giphy-result-item:hover {
		border-color: rgba(167, 139, 250, 0.7);
		transform: scale(1.02);
	}
	.giphy-result-item.selected-result { border-color: #4ade80; }
	.result-badge-tag {
		position: absolute;
		bottom: 4px;
		left: 4px;
		z-index: 2;
	}
	.mini-badge {
		font-size: 0.62rem;
		font-weight: 600;
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		backdrop-filter: blur(4px);
	}
	.mini-badge.giphy {
		background: rgba(109, 40, 217, 0.75);
		color: #fff;
	}
	.mini-badge.pexels {
		background: rgba(13, 148, 136, 0.85);
		color: #fff;
	}
	.empty-clips-hint {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.78rem;
		color: #f87171;
		background: rgba(248, 113, 113, 0.08);
		border: 1px solid rgba(248, 113, 113, 0.2);
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		margin-top: 0.5rem;
	}
	.result-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.result-check {
		position: absolute;
		top: 4px;
		right: 4px;
		background: #4ade80;
		color: #000;
		border-radius: 50%;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ================================================================ */
	/* STEP 4 – SETTINGS */
	/* ================================================================ */
	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.settings-section {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(167, 139, 250, 0.1);
		border-radius: 12px;
		padding: 1.25rem;
	}
	.settings-section h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #a78bfa;
	}

	.section-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}
	.section-header-row h3 {
		margin: 0;
	}

	.engine-tabs {
		display: flex;
		gap: 0.35rem;
		background: rgba(0, 0, 0, 0.3);
		padding: 0.25rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.engine-tab {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		border: none;
		color: rgba(232, 232, 240, 0.6);
		padding: 0.45rem 0.8rem;
		border-radius: 7px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	.engine-tab:hover {
		color: #fff;
	}
	.engine-tab.active {
		background: rgba(167, 139, 250, 0.2);
		color: #a78bfa;
		border: 1px solid rgba(167, 139, 250, 0.3);
	}
	.engine-tab.eleven-tab.active {
		background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(167, 139, 250, 0.2));
		color: #f472b6;
		border: 1px solid rgba(236, 72, 153, 0.4);
	}

	/* ElevenLabs Key Card */
	.eleven-key-card {
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(236, 72, 153, 0.2);
		border-radius: 10px;
		padding: 0.9rem;
		margin-bottom: 1.25rem;
	}
	.key-input-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.key-field {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.4rem 0.75rem;
		flex: 1;
	}
	.key-field:focus-within {
		border-color: #ec4899;
	}
	:global(.key-icon) {
		color: #ec4899;
		flex-shrink: 0;
	}
	.key-input {
		background: transparent;
		border: none;
		color: #fff;
		font-size: 0.85rem;
		width: 100%;
		outline: none;
	}
	.icon-btn-ghost {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		padding: 0.2rem;
		display: flex;
		align-items: center;
	}
	.icon-btn-ghost:hover {
		color: #fff;
	}
	.fetch-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(236, 72, 153, 0.15);
		border: 1px solid rgba(236, 72, 153, 0.35);
		color: #f472b6;
		padding: 0.45rem 0.85rem;
		border-radius: 8px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}
	.fetch-btn:hover:not(:disabled) {
		background: rgba(236, 72, 153, 0.25);
	}
	.fetch-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.subscription-badge {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.6rem;
		font-size: 0.75rem;
		color: #34d399;
	}
	.key-hint {
		margin: 0.5rem 0 0;
		font-size: 0.75rem;
		color: rgba(232, 232, 240, 0.5);
	}
	.key-hint code {
		background: rgba(255, 255, 255, 0.08);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		color: #a78bfa;
	}

	/* ElevenLabs Model Box */
	.eleven-model-box {
		background: rgba(0, 0, 0, 0.22);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 0.85rem;
		margin-bottom: 1.15rem;
	}
	.model-box-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.65rem;
	}
	.model-title-with-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.model-section-title {
		font-size: 0.82rem;
		font-weight: 700;
		color: #e8e8f0;
	}
	.model-indonesia-pill {
		font-size: 0.65rem;
		background: rgba(239, 68, 68, 0.2);
		color: #f87171;
		border: 1px solid rgba(239, 68, 68, 0.35);
		padding: 0.1rem 0.45rem;
		border-radius: 10px;
		font-weight: 600;
	}
	.model-section-hint {
		font-size: 0.72rem;
		color: #34d399;
	}
	.model-cards-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 0.5rem;
	}
	.model-chip {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 8px;
		padding: 0.6rem 0.75rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
	}
	.model-chip:hover {
		border-color: rgba(236, 72, 153, 0.35);
		background: rgba(255, 255, 255, 0.06);
	}
	.model-chip.selected {
		border-color: #ec4899;
		background: rgba(236, 72, 153, 0.12);
	}
	.model-chip-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.4rem;
	}
	.model-chip-name {
		font-size: 0.82rem;
		font-weight: 700;
		color: #fff;
	}
	.model-chip-badge {
		font-size: 0.62rem;
		padding: 0.1rem 0.35rem;
		border-radius: 6px;
		background: rgba(236, 72, 153, 0.2);
		color: #f472b6;
		font-weight: 600;
		white-space: nowrap;
	}
	.model-chip-desc {
		font-size: 0.72rem;
		color: rgba(232, 232, 240, 0.55);
		line-height: 1.3;
	}
	.model-chip-check {
		position: absolute;
		top: 6px;
		right: 6px;
		color: #ec4899;
	}

	.voice-tag {
		font-size: 0.65rem;
		background: rgba(255, 255, 255, 0.08);
		color: rgba(232, 232, 240, 0.7);
		padding: 0.1rem 0.4rem;
		border-radius: 10px;
	}
	.voice-tag.native {
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
		border: 1px solid rgba(239, 68, 68, 0.3);
		font-weight: 600;
	}

	/* ElevenLabs Voice Grid */
	.eleven-voice-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.65rem;
		margin-bottom: 1.25rem;
		max-height: 280px;
		overflow-y: auto;
		padding-right: 0.25rem;
	}
	.eleven-voice-card {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 0.75rem 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		outline: none;
	}
	.eleven-voice-card:hover {
		border-color: rgba(236, 72, 153, 0.4);
		background: rgba(255, 255, 255, 0.07);
	}
	.eleven-voice-card.selected {
		border-color: #ec4899;
		background: rgba(236, 72, 153, 0.12);
	}
	.voice-card-top {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.voice-emoji {
		font-size: 1.1rem;
		flex-shrink: 0;
	}
	.voice-info {
		flex: 1;
		min-width: 0;
	}
	.voice-name-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.voice-name {
		font-weight: 700;
		font-size: 0.85rem;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.voice-badge {
		font-size: 0.65rem;
		background: rgba(255, 255, 255, 0.08);
		color: rgba(232, 232, 240, 0.7);
		padding: 0.1rem 0.4rem;
		border-radius: 10px;
	}
	.sample-play-btn {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #e8e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	.sample-play-btn:hover {
		background: #ec4899;
		color: #fff;
		border-color: #ec4899;
	}
	.sample-play-btn.playing {
		background: #ec4899;
		color: #fff;
		border-color: #ec4899;
	}
	.check-badge {
		color: #ec4899;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}
	.voice-desc {
		font-size: 0.72rem;
		color: rgba(232, 232, 240, 0.5);
		margin: 0;
		line-height: 1.3;
	}
	.eleven-tuning-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		background: rgba(0, 0, 0, 0.2);
		padding: 0.75rem 1rem;
		border-radius: 8px;
	}
	.slider-label.small span {
		font-size: 0.75rem;
	}

	.option-row {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}
	.option-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	.option-card {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.15);
		border-radius: 8px;
		padding: 0.6rem 0.9rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: #e8e8f0;
		cursor: pointer;
		transition: all 0.2s;
	}
	.option-card:hover { border-color: rgba(167, 139, 250, 0.4); }
	.option-card.selected {
		border-color: #a78bfa;
		background: rgba(167, 139, 250, 0.2);
		color: #a78bfa;
	}
	.opt-emoji { font-size: 1rem; }

	.slider-label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.slider-label span { font-size: 0.8rem; color: rgba(232, 232, 240, 0.6); }
	.slider {
		width: 100%;
		accent-color: #a78bfa;
		cursor: pointer;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		font-weight: 600;
	}
	.toggle-btn {
		width: 48px;
		height: 26px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 13px;
		cursor: pointer;
		position: relative;
		transition: background 0.2s;
		padding: 0;
	}
	.toggle-btn.on { background: rgba(167, 139, 250, 0.5); border-color: #a78bfa; }
	.toggle-thumb {
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
		position: absolute;
		top: 2px;
		left: 3px;
		transition: left 0.2s;
	}
	.toggle-btn.on .toggle-thumb { left: 25px; }

	.subtitle-styles {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.subtitle-style-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(167, 139, 250, 0.12);
		border-radius: 8px;
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		color: #e8e8f0;
	}
	.subtitle-style-card:hover { border-color: rgba(167, 139, 250, 0.35); }
	.subtitle-style-card.selected { border-color: #a78bfa; background: rgba(167, 139, 250, 0.12); }
	.subtitle-style-card strong { font-size: 0.9rem; flex: 0 0 auto; min-width: 120px; }
	.subtitle-style-card span { font-size: 0.8rem; color: rgba(232, 232, 240, 0.5); flex: 1; }

	/* Tata Letak & Posisi Subtitle Box */
	.subtitle-layout-box {
		margin-top: 0.85rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(167, 139, 250, 0.18);
		border-radius: 12px;
		padding: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.95rem;
	}
	.layout-box-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}
	.layout-box-title-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #f1f1f8;
		font-size: 0.88rem;
		font-weight: 700;
	}
	.live-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.72rem;
		font-weight: 700;
		color: #34d399;
		background: rgba(52, 211, 153, 0.12);
		border: 1px solid rgba(52, 211, 153, 0.25);
		padding: 2px 8px;
		border-radius: 999px;
	}
	.pulse-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #34d399;
		box-shadow: 0 0 6px #34d399;
		animation: pulseDot 1.6s infinite ease-in-out;
	}
	@keyframes pulseDot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.4; transform: scale(0.75); }
	}
	.layout-field-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.field-label {
		font-size: 0.78rem;
		color: rgba(232, 232, 240, 0.7);
		font-weight: 600;
	}
	.mode-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.active-mode-badge {
		font-size: 0.7rem;
		font-weight: 700;
		color: rgba(232, 232, 240, 0.7);
		background: rgba(255, 255, 255, 0.06);
		padding: 2px 7px;
		border-radius: 6px;
	}
	.active-mode-badge.highlight-mode-pop {
		color: #facc15;
		background: rgba(250, 204, 21, 0.15);
		border: 1px solid rgba(250, 204, 21, 0.3);
	}
	.active-mode-badge.highlight-mode-karaoke {
		color: #38bdf8;
		background: rgba(56, 189, 248, 0.15);
		border: 1px solid rgba(56, 189, 248, 0.3);
	}
	.mode-pills-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}
	.mode-pill {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.3rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(167, 139, 250, 0.15);
		border-radius: 9px;
		padding: 0.6rem 0.4rem;
		color: #e2e8f0;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.mode-pill:hover {
		border-color: rgba(167, 139, 250, 0.35);
		background: rgba(167, 139, 250, 0.08);
	}
	.mode-pill.active {
		border-color: #a78bfa;
		background: rgba(167, 139, 250, 0.18);
		color: #ffffff;
		box-shadow: 0 0 14px rgba(167, 139, 250, 0.25);
	}
	.mode-pill-icon {
		font-size: 1.1rem;
	}
	.mode-pill-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.mode-pill-text strong {
		font-size: 0.78rem;
		font-weight: 700;
	}
	.mode-pill-text small {
		font-size: 0.67rem;
		color: rgba(232, 232, 240, 0.5);
		line-height: 1.15;
	}
	.preset-pills {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}
	.preset-pill {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(167, 139, 250, 0.15);
		border-radius: 8px;
		padding: 0.55rem 0.6rem;
		color: #e2e8f0;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.preset-pill:hover {
		border-color: rgba(167, 139, 250, 0.35);
		background: rgba(167, 139, 250, 0.08);
	}
	.preset-pill.active {
		border-color: #a78bfa;
		background: rgba(167, 139, 250, 0.2);
		color: #ffffff;
		box-shadow: 0 0 12px rgba(167, 139, 250, 0.25);
	}
	.pill-icon {
		font-size: 0.85rem;
	}
	.slider-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.slider-val-badge {
		font-size: 0.75rem;
		font-weight: 700;
		color: #a78bfa;
		background: rgba(167, 139, 250, 0.15);
		padding: 1px 7px;
		border-radius: 6px;
	}
	.slider-container {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.slider-edge-label {
		font-size: 0.7rem;
		color: rgba(232, 232, 240, 0.45);
		white-space: nowrap;
	}
	.sub-range-input {
		flex: 1;
		accent-color: #a78bfa;
		height: 6px;
		cursor: pointer;
	}
	.layout-grid-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.option-pill-group {
		display: flex;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(167, 139, 250, 0.15);
		border-radius: 8px;
		padding: 3px;
		gap: 2px;
	}
	.option-pill {
		flex: 1;
		background: transparent;
		border: none;
		border-radius: 6px;
		padding: 0.45rem 0.3rem;
		color: rgba(232, 232, 240, 0.7);
		font-size: 0.76rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: center;
	}
	.option-pill:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.05);
	}
	.option-pill.active {
		background: #a78bfa;
		color: #0f0d19;
		font-weight: 700;
		box-shadow: 0 2px 8px rgba(167, 139, 250, 0.35);
	}
	.layout-footer-hint {
		font-size: 0.72rem;
		color: rgba(232, 232, 240, 0.5);
		line-height: 1.4;
		margin-top: 0.1rem;
	}

	/* ================================================================ */
	/* STEP 5 – RENDER */
	/* ================================================================ */
	.render-summary {
		background: rgba(167, 139, 250, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.15);
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		border-bottom: 1px solid rgba(167, 139, 250, 0.07);
		padding-bottom: 0.5rem;
	}
	.summary-item:last-child { border-bottom: none; }
	.summary-label { color: rgba(232, 232, 240, 0.5); }
	.summary-value { font-weight: 600; }
	.summary-value.highlight { color: #a78bfa; }

	.render-action-section { display: flex; justify-content: center; margin-bottom: 2rem; }
	.btn-render {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, #a78bfa, #ec4899);
		border: none;
		border-radius: 14px;
		padding: 1.1rem 2.5rem;
		color: white;
		font-size: 1.1rem;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.25s;
		box-shadow: 0 0 30px rgba(167, 139, 250, 0.4);
	}
	.btn-render:hover { transform: scale(1.03); box-shadow: 0 0 50px rgba(167, 139, 250, 0.6); }

	.render-progress-panel {
		background: rgba(167, 139, 250, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.15);
		border-radius: 16px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	/* Step indicators */
	.render-steps {
		display: flex;
		align-items: flex-start;
		gap: 0;
		margin-bottom: 1.25rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}
	.render-step-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		flex: 1;
		min-width: 70px;
		font-size: 0.7rem;
		color: rgba(232, 232, 240, 0.35);
		text-align: center;
		position: relative;
	}
	.render-step-item:not(:last-child)::after {
		content: '';
		position: absolute;
		top: 9px;
		left: calc(50% + 10px);
		width: calc(100% - 20px);
		height: 2px;
		background: rgba(167, 139, 250, 0.15);
	}
	.render-step-dot {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(167, 139, 250, 0.15);
		border: 2px solid rgba(167, 139, 250, 0.2);
		transition: all 0.3s;
		flex-shrink: 0;
	}
	.render-step-item.step-active {
		color: #a78bfa;
	}
	.render-step-item.step-active .render-step-dot {
		background: rgba(167, 139, 250, 0.3);
		border-color: #a78bfa;
		box-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
		animation: pulse-dot 1s ease-in-out infinite;
	}
	@keyframes pulse-dot {
		0%, 100% { box-shadow: 0 0 6px rgba(167, 139, 250, 0.4); }
		50% { box-shadow: 0 0 16px rgba(167, 139, 250, 0.8); }
	}
	.render-step-item.step-done {
		color: #4ade80;
	}
	.render-step-item.step-done .render-step-dot {
		background: rgba(74, 222, 128, 0.25);
		border-color: #4ade80;
	}
	.render-step-item.step-done:not(:last-child)::after {
		background: rgba(74, 222, 128, 0.4);
	}

	/* Progress bar */
	.render-bar-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	.render-bar-bg {
		flex: 1;
		height: 10px;
		background: rgba(167, 139, 250, 0.1);
		border-radius: 5px;
		overflow: hidden;
	}
	.render-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #a78bfa, #ec4899);
		border-radius: 5px;
		transition: width 0.4s ease-out;
		position: relative;
		overflow: hidden;
	}
	.render-bar-fill::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
		animation: shimmer 1.5s linear infinite;
	}
	@keyframes shimmer {
		from { transform: translateX(-100%); }
		to { transform: translateX(200%); }
	}
	.render-bar-pct {
		font-size: 0.85rem;
		font-weight: 700;
		color: #a78bfa;
		min-width: 36px;
		text-align: right;
	}
	.render-status-msg {
		font-size: 0.85rem;
		color: rgba(232, 232, 240, 0.7);
		margin: 0;
		text-align: center;
	}
	@keyframes spin { to { transform: rotate(360deg); } }


	.render-error {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		margin-bottom: 1.5rem;
		color: #fca5a5;
	}
	.render-error strong { display: block; margin-bottom: 0.25rem; }
	.render-error p { font-size: 0.875rem; margin: 0; }

	.render-success {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		text-align: center;
	}
	.success-icon { font-size: 3rem; }
	.render-success h3 { font-size: 1.5rem; font-weight: 800; margin: 0; }
	.render-success p { color: rgba(232, 232, 240, 0.6); margin: 0; }
	.render-preview { width: 100%; display: flex; justify-content: center; }
	.output-video {
		border-radius: 12px;
		box-shadow: 0 0 40px rgba(167, 139, 250, 0.2);
	}
	.result-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}
	.btn-download {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: linear-gradient(135deg, #a78bfa, #ec4899);
		border-radius: 10px;
		padding: 0.75rem 1.5rem;
		color: white;
		font-weight: 700;
		text-decoration: none;
		font-size: 0.95rem;
	}

	/* ================================================================ */
	/* ACTION BUTTONS */
	/* ================================================================ */
	.step-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: linear-gradient(135deg, rgba(167, 139, 250, 0.8), rgba(236, 72, 153, 0.7));
		border: 1px solid rgba(167, 139, 250, 0.5);
		border-radius: 10px;
		padding: 0.75rem 1.5rem;
		color: white;
		font-weight: 700;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(167, 139, 250, 1), rgba(236, 72, 153, 0.9));
		box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
	}
	.btn-primary:disabled { opacity: 0.5; cursor: default; }

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		padding: 0.75rem 1.2rem;
		color: rgba(232, 232, 240, 0.8);
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }

	.btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: none;
		border: none;
		color: rgba(167, 139, 250, 0.7);
		font-size: 0.85rem;
		cursor: pointer;
		transition: color 0.2s;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
	}
	.btn-ghost:hover { color: #a78bfa; }
	.btn-ghost:disabled { opacity: 0.4; cursor: default; }

	.btn-ghost-sm {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: rgba(167, 139, 250, 0.1);
		border: 1px solid rgba(167, 139, 250, 0.2);
		border-radius: 6px;
		color: #a78bfa;
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0.3rem 0.6rem;
		transition: all 0.2s;
	}
	.btn-ghost-sm:hover { background: rgba(167, 139, 250, 0.2); }
	.btn-ghost-sm:disabled { opacity: 0.4; }

	/* ================================================================ */
	/* RIGHT PANEL – PHONE PREVIEW */
	/* ================================================================ */
	.preview-panel {
		position: sticky;
		top: 140px;
		height: calc(100vh - 140px);
		overflow-y: auto;
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}

	.phone-container {
		display: flex;
		justify-content: center;
	}

	.phone-frame {
		width: 200px;
		height: 380px;
		background: #111;
		border-radius: 28px;
		border: 2px solid rgba(167, 139, 250, 0.3);
		position: relative;
		overflow: hidden;
		box-shadow: 0 0 40px rgba(167, 139, 250, 0.15), 0 20px 60px rgba(0,0,0,0.5);
	}

	.phone-notch {
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 70px;
		height: 12px;
		background: #222;
		border-radius: 6px;
		z-index: 10;
	}

	.phone-screen {
		position: absolute;
		inset: 0;
		border-radius: 26px;
		overflow: hidden;
		background: #0a0a1a;
	}

	.phone-video-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.9;
	}

	.phone-blur-bg {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		filter: blur(15px);
		transform: scale(1.2);
		opacity: 0.3;
	}

	.phone-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.75rem;
		color: rgba(167, 139, 250, 0.3);
		font-size: 0.75rem;
	}

	.phone-subtitle {
		position: absolute;
		font-weight: 900;
		line-height: 1.25;
		padding: 4px 6px;
		z-index: 5;
		white-space: normal;
		word-break: break-word;
		max-width: 92%;
		transition: top 0.12s ease-out, font-size 0.12s ease-out;
		pointer-events: none;
	}
	.phone-subtitle.viral-yellow {
		color: #FFE800;
		font-family: 'Arial Black', -apple-system, sans-serif;
		text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 4px rgba(0, 0, 0, 0.9);
	}
	.phone-subtitle.mrbeast {
		color: #FFFFFF;
		font-family: Impact, -apple-system, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.6px;
		text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 2px 6px rgba(180, 0, 0, 0.85);
	}
	.phone-subtitle.minimal {
		color: #FFFFFF;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		letter-spacing: 0.3px;
		text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 5px rgba(0, 0, 0, 0.85);
	}

	.phone-word-burst {
		display: inline-block;
		animation: wordBurstPop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
		letter-spacing: 0.5px;
	}
	@keyframes wordBurstPop {
		0% { transform: scale(0.9); opacity: 0.8; }
		50% { transform: scale(1.15); opacity: 1; }
		100% { transform: scale(1); opacity: 1; }
	}
	.phone-karaoke-chunk {
		display: inline-block;
	}
	.karaoke-word {
		display: inline-block;
		transition: all 0.12s ease;
		margin: 0 1px;
	}
	.karaoke-word.highlighted {
		transform: scale(1.14);
		filter: drop-shadow(0 0 6px rgba(255, 232, 0, 0.8));
	}
	.phone-subtitle.viral-yellow .karaoke-word.highlighted {
		color: #FFFFFF !important;
		text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 0 10px #FFE800 !important;
	}
	.phone-subtitle.mrbeast .karaoke-word.highlighted {
		color: #FFE800 !important;
		text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 10px rgba(255, 232, 0, 0.9) !important;
	}
	.phone-subtitle.minimal .karaoke-word.highlighted {
		color: #38BDF8 !important;
		text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 0 8px #38BDF8 !important;
	}

	.phone-ui-overlay {
		position: absolute;
		inset: 0;
		z-index: 6;
		pointer-events: none;
	}

	.phone-likes {
		position: absolute;
		right: 6px;
		bottom: 80px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		font-size: 0.6rem;
		color: white;
		text-shadow: 0 1px 3px rgba(0,0,0,0.8);
	}
	.phone-like-btn { font-size: 1rem; }

	.phone-title-overlay {
		position: absolute;
		bottom: 10px;
		left: 8px;
		right: 36px;
		font-size: 0.58rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 1px 4px rgba(0,0,0,0.9);
		line-height: 1.3;
		z-index: 7;
	}

	.phone-bottom-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: rgba(255, 255, 255, 0.1);
	}
	.phone-progress {
		height: 100%;
		width: 35%;
		background: #ff0050;
	}

	/* Scene Navigator */
	.scene-nav { width: 100%; }
	.scene-nav-label {
		font-size: 0.75rem;
		color: rgba(232, 232, 240, 0.45);
		margin-bottom: 0.5rem;
		text-align: center;
	}
	.scene-nav-btns {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
		justify-content: center;
	}
	.scene-nav-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(167, 139, 250, 0.2);
		color: rgba(232, 232, 240, 0.6);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.scene-nav-btn:hover { border-color: rgba(167, 139, 250, 0.5); }
	.scene-nav-btn.active {
		background: rgba(167, 139, 250, 0.25);
		border-color: #a78bfa;
		color: #a78bfa;
	}

	/* Preview Info */
	.preview-info {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		width: 100%;
	}
	.preview-spec {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.75rem;
		color: rgba(232, 232, 240, 0.4);
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		padding: 0.35rem 0.75rem;
	}

	/* Spin animation */
	:global(.spin) { animation: spin 0.8s linear infinite; }

	/* Voice Upload Hero Card & Header Button */
	.btn-header-voice {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
		border: 1px solid rgba(168, 85, 247, 0.45);
		color: #e0e7ff;
		padding: 6px 14px;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
	}
	.btn-header-voice:hover {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(168, 85, 247, 0.35));
		border-color: #c084fc;
		transform: translateY(-1px);
		box-shadow: 0 0 18px rgba(168, 85, 247, 0.35);
	}

	.voice-upload-hero-card {
		margin-bottom: 24px;
		border-radius: 16px;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%);
		border: 1px solid rgba(168, 85, 247, 0.3);
		padding: 18px 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
		transition: all 0.2s;
	}
	.voice-upload-hero-card:hover {
		border-color: rgba(168, 85, 247, 0.5);
		box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
	}
	.vuh-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.vuh-icon-badge {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		background: linear-gradient(135deg, #6366f1, #a855f7);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 4px 18px rgba(99, 102, 241, 0.45);
	}
	.vuh-badge {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #c084fc;
		text-transform: uppercase;
		margin-bottom: 2px;
	}
	.vuh-title {
		font-size: 1.05rem;
		font-weight: 700;
		color: #fff;
		letter-spacing: -0.01em;
	}
	.vuh-desc {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.65);
		line-height: 1.4;
		margin-top: 3px;
		max-width: 580px;
	}
	.btn-vuh-upload {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: linear-gradient(135deg, #6366f1, #a855f7);
		border: none;
		color: #fff;
		padding: 11px 20px;
		border-radius: 12px;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 0.2s;
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
	}
	.btn-vuh-upload:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 22px rgba(168, 85, 247, 0.5);
	}

	/* Upload Voice Engine Panel in Step 4 */
	.upload-tab {
		border-color: rgba(168, 85, 247, 0.3) !important;
	}
	.upload-tab.active {
		background: rgba(168, 85, 247, 0.2) !important;
		border-color: #c084fc !important;
		color: #c084fc !important;
	}
	.upload-voice-panel {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.uvp-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		padding-bottom: 12px;
	}
	.uvp-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: #fff;
	}
	.uvp-sub {
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.6);
		margin-top: 2px;
	}
	.btn-reupload-voice {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #e0e7ff;
		padding: 7px 14px;
		border-radius: 8px;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}
	.btn-reupload-voice:hover {
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
	}
	.scenes-audio-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 280px;
		overflow-y: auto;
	}
	.scene-audio-item {
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 10px;
		padding: 10px 14px;
		transition: all 0.15s;
	}
	.scene-audio-item:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.1);
	}
	.btn-scene-play {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #6366f1;
		color: #fff;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		transition: all 0.15s;
	}
	.btn-scene-play:hover {
		background: #4f46e5;
		transform: scale(1.06);
	}
	.btn-scene-play.playing {
		background: #10b981;
	}
	.scene-audio-meta {
		flex: 1;
		overflow: hidden;
	}
	.scene-audio-title {
		font-size: 0.78rem;
		font-weight: 700;
		color: #c084fc;
	}
	.scene-audio-text {
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.8);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 2px;
	}
	.scene-clip-tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.72rem;
		color: #818cf8;
		background: rgba(99, 102, 241, 0.12);
		border: 1px solid rgba(99, 102, 241, 0.25);
		border-radius: 6px;
		padding: 3px 8px;
		white-space: nowrap;
	}
	.upload-empty-notice {
		text-align: center;
		padding: 24px;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Aspect Ratio Selection (Step 1) */
	.aspect-ratio-section {
		margin-bottom: 24px;
	}
	.aspect-ratio-section label {
		display: block;
		font-size: 0.86rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
		margin-bottom: 10px;
	}
	.aspect-ratio-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}
	.aspect-btn {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
		padding: 14px;
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}
	.aspect-btn:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}
	.aspect-btn.selected {
		background: rgba(99, 102, 241, 0.15);
		border-color: #6366f1;
		box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
	}
	.aspect-icon-box {
		width: 38px;
		height: 38px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.06);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.aspect-rect {
		border: 2px solid #a855f7;
		border-radius: 3px;
		background: rgba(168, 85, 247, 0.2);
	}
	.aspect-rect.portrait { width: 14px; height: 24px; }
	.aspect-rect.landscape { width: 24px; height: 14px; }
	.aspect-rect.square { width: 18px; height: 18px; }

	.aspect-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.aspect-title {
		font-size: 0.88rem;
		font-weight: 700;
		color: #fff;
	}
	.aspect-sub {
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.55);
		line-height: 1.25;
	}

	/* Ratio Pills in Footage Toolbar */
	.ratio-pills {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* Keyword Suggestions Row per Scene */
	.keyword-suggestions-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 10px;
		padding: 8px 12px;
		border-radius: 10px;
		background: rgba(99, 102, 241, 0.06);
		border: 1px dashed rgba(99, 102, 241, 0.25);
	}
	.kw-label {
		font-size: 0.74rem;
		font-weight: 700;
		color: #c084fc;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.kw-chips {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
	}
	.kw-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #e0e7ff;
		padding: 4px 10px;
		border-radius: 14px;
		font-size: 0.74rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}
	.kw-chip:hover {
		background: rgba(99, 102, 241, 0.2);
		border-color: #818cf8;
		color: #fff;
		transform: translateY(-1px);
	}
	.kw-chip.active {
		background: #6366f1;
		border-color: #818cf8;
		color: #fff;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
	}

	/* Phone Frame Ratio Modifiers */
	.phone-frame.ratio-landscape {
		width: 300px;
		height: 172px;
		border-radius: 16px;
	}
	.phone-frame.ratio-landscape .phone-notch {
		display: none;
	}
	.phone-frame.ratio-landscape .phone-screen {
		border-radius: 14px;
	}

	.phone-frame.ratio-square {
		width: 230px;
		height: 230px;
		border-radius: 16px;
	}
	.phone-frame.ratio-square .phone-notch {
		display: none;
	}
	.phone-frame.ratio-square .phone-screen {
		border-radius: 14px;
	}

	/* Scrollbar */
	::-webkit-scrollbar { width: 5px; height: 5px; }
	::-webkit-scrollbar-track { background: transparent; }
	::-webkit-scrollbar-thumb { background: rgba(167, 139, 250, 0.2); border-radius: 3px; }
</style>
