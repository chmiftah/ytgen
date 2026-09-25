<script>
	import { onMount } from 'svelte';
	import { Wand2, Play, Pause, ArrowLeft, Layers, Download, Film, RefreshCw, Music, Volume2, Mic, Sliders, Flame, Sparkles } from 'lucide-svelte';
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
	import { DEFAULT_EDGE_VOICE_ID } from '$lib/services/voiceService.js';
	import { humanizeScript } from '$lib/services/scriptHumanizer.js';

	let script = $state(SCRIPT_PRESETS[0].text);
	let videoTitle = $state(SCRIPT_PRESETS[0].title);
	let showScriptModal = $state(false);
	let showTitleModal = $state(false);
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

	function handleApplyGeneratedScript(newScript) {
		script = newScript;
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
	let stickmanTextColor = $state('#111827');
	let stickmanTextColorTop = $state('#DC2626');
	let stickmanTextColorBottom = $state('#111827');
	let stickmanFontSize = $state(60);
	let stickmanFontFamily = $state("'Shadows Into Light',cursive");
	let stickmanAnim = $state('pop');
	let stickmanTextAlign = $state('left');
	let stickmanTextIdleMotion = $state('shake');
	const POS_OPTIONS = [
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
	const QUICK_VOICES = [
		{ id: 'id-ID-ArdiNeural', name: 'Ardi', gender: 'Pria', lang: 'ID', emoji: '👨', sampleUrl: '/voice-samples/id-ID-ArdiNeural.mp3' },
		{ id: 'id-ID-GadisNeural', name: 'Gadis', gender: 'Wanita', lang: 'ID', emoji: '👩', sampleUrl: '/voice-samples/id-ID-GadisNeural.mp3' },
		{ id: 'en-US-GuyNeural', name: 'Guy', gender: 'Pria', lang: 'US', emoji: '🌐', sampleUrl: '/voice-samples/en-US-GuyNeural.mp3' },
		{ id: 'en-US-JennyNeural', name: 'Jenny', gender: 'Wanita', lang: 'US', emoji: '🌐', sampleUrl: '/voice-samples/en-US-JennyNeural.mp3' }
	];
	let selectedVoiceId = $state(DEFAULT_EDGE_VOICE_ID);
	let selectedAudioEffect = $state(DEFAULT_AUDIO_EFFECT_ID);
	let isRegeneratingVoice = $state(false);

	let previewAudioEl = null;
	let playingEffectPreviewId = $state(null);
	let playingVoicePreviewId = $state(null);

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

	function toggleVoicePreview(v, e) {
		if (e) e.stopPropagation();
		if (!v.sampleUrl) return;
		if (playingVoicePreviewId === v.id) {
			if (previewAudioEl) {
				previewAudioEl.pause();
				previewAudioEl.currentTime = 0;
			}
			playingVoicePreviewId = null;
			return;
		}
		if (previewAudioEl) previewAudioEl.pause();
		previewAudioEl = new Audio(v.sampleUrl);
		previewAudioEl.onended = () => { playingVoicePreviewId = null; };
		previewAudioEl.play().catch(() => {});
		playingVoicePreviewId = v.id;
	}

	// Backsound (BGM) State
	let selectedBgmId = $state('local-documentary');
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

	async function regenerateVoiceoverForScene(sceneIndex) {
		if (!scenes[sceneIndex]) return;
		const sc = scenes[sceneIndex];
		try {
			const res = await fetch('/api/edge-tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: sc.narration,
					voiceId: selectedVoiceId || 'id-ID-ArdiNeural',
					audioEffect: selectedAudioEffect || 'cinematic_deep'
				})
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
		const stop = new Set(['yang','dan','di','ke','dari','ini','itu','adalah','untuk','dengan','pada','akan','juga','karena','sebagai','dalam','tidak','ada','saya','kita','mereka','kamu','bisa','harus','sudah','telah','agar','atau','tetapi','namun','jika','kalau','saat','ketika','oleh','tentang','sebuah','seorang','para','secara','lebih','paling','sangat','jadi','bahwa','hanya','saja','lagi','masih','belum','pernah','ingin','mau','perlu','dapat','boleh','oleh','kita','nya','lah','kah','pun','tersebut','seperti','yaitu','yakni','antara','hingga','sampai','setelah','sebelum','selama','tanpa','melalui','terhadap','menjadi','adalah','ialah','sering','banyak','besar','kecil','baru','lama','baik','buruk','salah','benar','penting','utama','sama','lain','setiap','semua','beberapa','tersebut']);
		let words = text.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
		let filtered = words.filter(w => w.length >= 4 && !stop.has(w.toLowerCase()));
		if (filtered.length < 2) filtered = words.filter(w => w.length >= 3).slice(0, 4);
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
		// Directly reflects the user's chosen font size in real time
		const previewPx = Math.round(base * scaleFactor * 1.12);
		return Math.max(12, Math.min(85, previewPx));
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
		const next = (currentScene.textSide || currentScene.layoutSide) === 'left' ? 'right' : 'left';
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

	function setTextAlign(align) {
		stickmanTextAlign = align;
		if (!currentScene) return;
		scenes[activeSceneIndex] = { ...currentScene, textAlign: align };
		scenes = [...scenes];
	}
	function applyAlignToAll() {
		scenes = scenes.map((s) => ({ ...s, textAlign: stickmanTextAlign }));
	}
	function getOverlayStyle(scene) {
		const align = scene?.textAlign || stickmanTextAlign;
		const tx = Number(scene?.textOffsetX || 0);
		const ty = Number(scene?.textOffsetY || 0);
		const rot = Number(scene?.textRotate ?? 0);
		const sc = Number(scene?.textScale ?? 1);
		if (align === 'middle') {
			return `left: calc(50% + ${tx}%); top: calc(50% + ${ty}%); transform: translate(-50%, -50%) rotate(${rot}deg) scale(${sc}); text-align:center; transform-origin: center center;`;
		}
		const side = scene?.textSide || scene?.layoutSide || 'right';
		const ta = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left';
		if (side === 'left') {
			return `left: calc(4% + ${tx}%); top: calc(50% + ${ty}%); transform: translateY(-50%) rotate(${rot}deg) scale(${sc}); text-align:${ta}; transform-origin: left center;`;
		} else {
			return `right: calc(4% - ${tx}%); top: calc(50% + ${ty}%); transform: translateY(-50%) rotate(${rot}deg) scale(${sc}); text-align:${ta}; transform-origin: right center;`;
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
	let imageUploadInputEl = $state(null);

	let filteredAssets = $derived(
		imagePickerFilter.trim()
			? availableAssets.filter(a =>
					a.title?.toLowerCase().includes(imagePickerFilter.toLowerCase()) ||
					a.slug?.toLowerCase().includes(imagePickerFilter.toLowerCase()) ||
					(a.keywords || []).some(k => k.toLowerCase().includes(imagePickerFilter.toLowerCase()))
				)
			: availableAssets
	);

	function openImagePicker() {
		if (!currentScene) return;
		imagePickerFilter = '';
		showImagePicker = true;
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
		try {
			const res = await fetch('/api/stickman-assets');
			const data = await res.json();
			if (data.success) availableAssets = data.assets;
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
			const res = await fetch('/api/analyze', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ script, apiKey: 'sk-0802f45e1d4e41c8ae8d46396c97b746' })
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
				genProgress.activeQuery = sc.visualQuery || '';
				genProgress.activeNarration = sc.narration || '';
				genProgress.percent = Math.round(15 + (i / parsed.length) * 70);
				addGenLog('SCENE', `Adegan ${i+1}/${parsed.length}: "${sc.visualQuery}"`, 'highlight');

				// Intelligent Non-Duplicating Asset Picker:
				// 1. If it's a continuation chunk (duration > 6s split), user wants a random DIFFERENT image!
				// 2. If it's a new scene, find matching keyword assets that haven't been used yet.
				// 3. Fallback: pick a RANDOM unused asset from all 586 stickman illustrations.
				// 4. Strict guarantee: never use an image that equals prevImageUrl or is already used.
				let matchedAsset = null;
				if (availableAssets.length > 0) {
					const isChunk = Boolean(sc.isContinuation);
					const qWords = (sc.visualQuery || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);

					if (!isChunk && qWords.length > 0) {
						const matchingUnused = availableAssets.filter(a =>
							!usedAssetUrls.has(a.url) &&
							a.url !== prevImageUrl &&
							a.keywords?.some(k => qWords.some(qw => qw.includes(k) || k.includes(qw)))
						);
						if (matchingUnused.length > 0) {
							// Randomize among matches so consecutive scenes with similar queries don't pick the same
							matchedAsset = matchingUnused[Math.floor(Math.random() * matchingUnused.length)];
						}
					}

					// Fallback: Random unused asset from the library (guarantees unique visuals and no duplicate scenes)
					if (!matchedAsset) {
						const unusedList = availableAssets.filter(a => !usedAssetUrls.has(a.url) && a.url !== prevImageUrl);
						if (unusedList.length > 0) {
							matchedAsset = unusedList[Math.floor(Math.random() * unusedList.length)];
						} else {
							// In case scenes count > total available assets, avoid adjacent repeats
							const nonAdjacent = availableAssets.filter(a => a.url !== prevImageUrl);
							matchedAsset = nonAdjacent[Math.floor(Math.random() * nonAdjacent.length)] || availableAssets[0];
						}
					}
				}

				if (matchedAsset) {
					usedAssetUrls.add(matchedAsset.url);
					prevImageUrl = matchedAsset.url;
					genProgress.stats.localFootage++;
					addGenLog('STICKMAN', `Gambar unik: ${matchedAsset.slug} (${matchedAsset.title.slice(0, 45)})`, 'success');
				}
				let voiceData = null;
				try {
					addGenLog('EDGE-TTS', `Voiceover adegan ${i+1} (${selectedAudioEffect})...`, 'info');
					const ttsRes = await fetch('/api/edge-tts', {
						method: 'POST', headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							text: sc.narration,
							voiceId: selectedVoiceId || 'id-ID-ArdiNeural',
							audioEffect: selectedAudioEffect || 'cinematic_deep'
						})
					});
					voiceData = await ttsRes.json();
					if (voiceData?.success) {
						genProgress.stats.ttsClips++;
						addGenLog('EDGE-TTS', `Audio siap ${voiceData.duration}s`, 'success');
					}
				} catch (e) { addGenLog('WARN', `TTS gagal adegan ${i+1}`, 'warn'); }
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
<div class="stickman-studio">
	<header class="studio-header">
		<a href="/" class="btn btn-secondary btn-sm back-btn"><ArrowLeft size={16} /><span>Kembali</span></a>
		<div class="title-wrap">
			<h2>🎨 Stickman Explainer Studio</h2>
			<p>Background gambar stickman full — teks hanya poin penting di area kosong.</p>
		</div>
	</header>

	<main class="studio-content">
		<section class="script-panel glass-panel">
			<!-- Judul Video dengan Generator Judul AI (Mandiri Berbasis Niche / Topik) -->
			<div class="video-title-card">
				<div class="title-head-row">
					<div class="title-label-wrap">
						<span class="title-label">🎯 Judul Video (High-CTR AI)</span>
						{#if videoTitle}
							<span class="title-char-count">{videoTitle.length} char {#if videoTitle.length <= 60}<span class="badge-mobile">📱 Mobile Ready</span>{/if}</span>
						{/if}
					</div>
					<div class="title-btn-group">
						<button
							type="button"
							class="btn-quick-title"
							onclick={() => generateQuickAiTitle()}
							disabled={isGeneratingQuickTitle}
							title="Dapatkan 1 ide judul viral otomatis dari DeepSeek AI"
						>
							{#if isGeneratingQuickTitle}
								<RefreshCw size={12} class="spin" />
								<span>AI Meriset...</span>
							{:else}
								<Sparkles size={12} class="text-amber" />
								<span>🎲 Ide Cepat</span>
							{/if}
						</button>
						<button
							type="button"
							class="btn-open-title-modal"
							onclick={() => showTitleModal = true}
							title="Buka Generator 10 Opsi Judul Viral + Skor CTR + Konsep Thumbnail"
						>
							<Flame size={12} class="text-flame" />
							<span>🔥 Riset 10 Opsi</span>
						</button>
					</div>
				</div>

				<div class="title-input-wrap">
					<input
						type="text"
						bind:value={videoTitle}
						placeholder="Ketik topik atau klik '🎲 Ide Cepat' / '🔥 Riset 10 Opsi'..."
						class="title-input"
					/>
				</div>

				<!-- Quick Category Ideation Chips & Direct Script Trigger -->
				<div class="title-bottom-row">
					<div class="title-niche-chips">
						<span class="chips-label">Kategori:</span>
						<button type="button" class="mini-niche-btn" onclick={() => generateQuickAiTitle('wealth_finance')} title="Ide judul uang & finansial">💸 Uang</button>
						<button type="button" class="mini-niche-btn" onclick={() => generateQuickAiTitle('dark_psychology')} title="Ide judul psikologi gelap & otak">🧠 Psikologi</button>
						<button type="button" class="mini-niche-btn" onclick={() => generateQuickAiTitle('investigation')} title="Ide judul investigasi & skandal">🕵️ Investigasi</button>
						<button type="button" class="mini-niche-btn" onclick={() => generateQuickAiTitle('science_paradox')} title="Ide judul sains & paradoks AI">⏳ Paradoks/AI</button>
						<button type="button" class="mini-niche-btn" onclick={() => generateQuickAiTitle('stoic_philosophy')} title="Ide judul filosofi & stoikisme">🏛️ Filosofi</button>
						<button type="button" class="mini-niche-btn" onclick={() => generateQuickAiTitle('business_downfall')} title="Ide judul kasus kejatuhan bisnis">🏢 Bisnis</button>
					</div>

					{#if videoTitle}
						<button
							type="button"
							class="btn-title-to-script"
							onclick={() => showScriptModal = true}
							title="Minta AI menuliskan naskah stickman lengkap untuk judul ini"
						>
							<Sparkles size={11} />
							<span>📝 Buat Naskah dari Judul Ini →</span>
						</button>
					{/if}
				</div>
			</div>

			<!-- Naskah Video Editor Card -->
			<div class="script-editor-card">
				<div class="panel-header">
					<div class="panel-title-group">
						<h3>📝 Naskah Video</h3>
						<span class="badge">Stickman • Retensi Tinggi</span>
					</div>
					<div class="panel-actions">
						<button
							type="button"
							class="btn-tool-humanize"
							onclick={handleHumanize}
							disabled={isHumanizing || !script.trim()}
							title="Humanize Naskah: Hilangkan kata kaku ('Anda', klise formal), tambahkan jeda dramatis, dan rapikan alur untuk voiceover"
						>
							<Sparkles size={13} class="humanize-icon" />
							<span>{isHumanizing ? 'Memproses...' : 'Humanize'}</span>
						</button>
						<button type="button" class="btn-ai-gen" onclick={() => showScriptModal = true} title="Buka AI Script Generator Stickman Viral">
							<Flame size={14} class="flame-icon" />
							<span>✨ AI Script Generator</span>
						</button>
					</div>
				</div>

				{#if humanizeNotice}
					<div class="humanize-notice">
						<Sparkles size={13} class="notice-icon" />
						<span>{humanizeNotice}</span>
					</div>
				{/if}

				<!-- Quick Viral Preset Templates -->
				<div class="quick-preset-bar">
					<span class="preset-label">⚡ Topik Viral Cepat:</span>
					<div class="preset-pills">
						{#each SCRIPT_PRESETS as p}
							<button
								type="button"
								class="preset-pill"
								class:active={script === p.text}
								onclick={() => { script = p.text; videoTitle = p.title; }}
								title="{p.title}"
							>
								<span>{p.title.split(':')[0]}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="textarea-wrapper">
					<textarea
						bind:value={script}
						placeholder="Tulis naskah atau klik '✨ AI Script Generator' di atas untuk meracik naskah berbobot dengan retensi tinggi..."
						rows="8"
					></textarea>
					<div class="textarea-footer-info">
						<div class="stat-items">
							<span class="stat-pill">📊 ~{estimatedScenes} Adegan</span>
							<span class="stat-pill">📝 {wordCount} Kata</span>
							<button
								type="button"
								class="mini-humanize-btn"
								onclick={handleHumanize}
								disabled={isHumanizing || !script.trim()}
								title="Humanize naskah: ubah gaya kaku jadi santai & sesuaikan pacing audio"
							>
								✨ Humanize Naskah
							</button>
						</div>
						<span class="format-hint">Format: <code>[Bab X: Judul | Deskripsi]</code></span>
					</div>
				</div>
			</div>

			<!-- Unified Audio & Voice Studio Card -->
			<div class="audio-studio-card">
				<div class="audio-card-header">
					<div class="audio-title-wrap">
						<span class="audio-card-title">🎙️ Audio & Voiceover Studio</span>
					</div>
					<!-- Compact Tab Navigation -->
					<div class="audio-tab-nav">
						<button
							type="button"
							class="audio-tab-btn"
							class:active={activeAudioTab === 'voice'}
							onclick={() => activeAudioTab = 'voice'}
						>
							<span>🎙️ Suara</span>
							<span class="tab-indicator-badge">
								{QUICK_VOICES.find(v => v.id === selectedVoiceId)?.name || 'Ardi'}
							</span>
						</button>
						<button
							type="button"
							class="audio-tab-btn"
							class:active={activeAudioTab === 'effect'}
							onclick={() => activeAudioTab = 'effect'}
						>
							<span>🎛️ DSP Filter</span>
							<span class="tab-indicator-badge">
								{AUDIO_EFFECT_PRESETS.find(e => e.id === selectedAudioEffect)?.name.split(' (')[0] || 'Studio'}
							</span>
						</button>
						<button
							type="button"
							class="audio-tab-btn"
							class:active={activeAudioTab === 'bgm'}
							onclick={() => activeAudioTab = 'bgm'}
						>
							<span>🎵 Backsound</span>
							<span class="tab-indicator-badge">
								{bgmVolume === 0 ? 'Mute' : `${Math.round(bgmVolume * 100)}%`}
							</span>
						</button>
					</div>
				</div>

				<div class="audio-tab-content">
					{#if activeAudioTab === 'voice'}
						<div class="voice-cards-grid">
							{#each QUICK_VOICES as v}
								<div
									class="voice-card"
									class:active={selectedVoiceId === v.id}
									onclick={() => selectedVoiceId = v.id}
									role="button"
									tabindex="0"
									onkeydown={(e) => e.key === 'Enter' && (selectedVoiceId = v.id)}
									title="{v.name} ({v.gender}, {v.lang}) — Klik untuk pilih"
								>
									<span class="voice-avatar">{v.emoji}</span>
									<div class="voice-info">
										<div class="voice-name-row">
											<span class="voice-name">{v.name}</span>
											<span class="voice-gender-pill">{v.gender === 'Wanita' ? '♀ Wanita' : '♂ Pria'}</span>
										</div>
										<span class="voice-lang">{v.lang === 'ID' ? 'Bahasa Indonesia' : 'English (US)'}</span>
									</div>
									{#if v.sampleUrl}
										<button
											type="button"
											class="chip-preview-play-btn"
											class:playing={playingVoicePreviewId === v.id}
											onclick={(e) => toggleVoicePreview(v, e)}
											title={playingVoicePreviewId === v.id ? 'Stop sample' : 'Dengar contoh suara'}
										>
											{playingVoicePreviewId === v.id ? '⏹' : '▶'}
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{:else if activeAudioTab === 'effect'}
						<div class="effect-tab-panel">
							<div class="effect-chips-grid">
								{#each AUDIO_EFFECT_PRESETS as eff}
									<div
										class="effect-card-chip"
										class:active={selectedAudioEffect === eff.id}
										onclick={() => selectedAudioEffect = eff.id}
										title="{eff.name}: {eff.description}"
										role="button"
										tabindex="0"
										onkeydown={(e) => e.key === 'Enter' && (selectedAudioEffect = eff.id)}
									>
										<span class="eff-emoji">{eff.emoji}</span>
										<div class="eff-text">
											<span class="eff-title">{eff.name.split(' (')[0]}</span>
											{#if eff.tag}<span class="eff-tag-pill">{eff.tag}</span>{/if}
										</div>
										{#if eff.sampleUrl}
											<button
												type="button"
												class="chip-preview-play-btn"
												class:playing={playingEffectPreviewId === eff.id}
												onclick={(e) => toggleEffectPreview(eff, e)}
												title={playingEffectPreviewId === eff.id ? 'Stop preview' : 'Dengarkan contoh efek'}
											>
												{playingEffectPreviewId === eff.id ? '⏹' : '▶'}
											</button>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{:else if activeAudioTab === 'bgm'}
						<div class="bgm-tab-panel">
							<div class="bgm-tracks-row">
								{#each BGM_TRACKS as track}
									<div
										class="bgm-track-pill"
										class:active={selectedBgmId === track.id}
										onclick={() => selectedBgmId = track.id}
										role="button"
										tabindex="0"
										onkeydown={(e) => e.key === 'Enter' && (selectedBgmId = track.id)}
										title="{track.name} – {track.mood}"
									>
										{#if track.id !== 'none'}
											<button
												type="button"
												class="bgm-mini-play"
												class:playing={isPlayingBgmPreview && selectedBgmId === track.id}
												onclick={(e) => { e.stopPropagation(); selectedBgmId = track.id; toggleBgmTrackPreview(track.id); }}
												title={isPlayingBgmPreview && selectedBgmId === track.id ? "Stop Musik" : "Play & Dengarkan Musik Ini"}
											>
												{isPlayingBgmPreview && selectedBgmId === track.id ? '⏹' : '▶'}
											</button>
										{:else}
											<span class="bgm-mute-icon">🔇</span>
										{/if}
										<span class="bgm-track-title">{track.name}</span>
										{#if track.badge}
											<span class="bgm-track-badge">{track.badge}</span>
										{/if}
									</div>
								{/each}
							</div>

							<div class="bgm-slider-container">
								<button
									type="button"
									class="btn-bgm-mute-toggle"
									onclick={() => bgmVolume = bgmVolume > 0 ? 0 : 0.10}
									title={bgmVolume === 0 ? "Bunyikan Musik" : "Mute Musik"}
								>
									{bgmVolume === 0 ? '🔇' : '🔊'}
								</button>
								<div class="bgm-slider-track">
									<input
										type="range"
										min="0"
										max="0.30"
										step="0.01"
										value={bgmVolume}
										oninput={handleBgmVolumeInput}
										class="bgm-range-slider"
										title="Geser untuk atur volume backsound"
									/>
								</div>
								<span class="bgm-vol-val">{Math.round(bgmVolume * 100)}%</span>
								<span class="vol-ideal-pill">{bgmVolume === 0 ? 'Muted' : bgmVolume <= 0.12 ? '⭐ Ideal' : 'Tinggi'}</span>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="action-buttons-row">
				<button class="btn btn-primary generate-btn" onclick={generateStickmanVideo} disabled={isGenerating}>
					<Wand2 size={18} /><span>{isGenerating ? 'Memproses Naskah & Animasi...' : '✨ Generate Stickman Video'}</span>
				</button>
				{#if scenes.length > 0}
					<button
						type="button"
						class="btn btn-secondary regen-all-btn"
						onclick={regenerateAllVoiceovers}
						disabled={isRegeneratingVoice || isGenerating}
						title="Terapkan suara vokal dan filter terpilih ke semua adegan naskah"
					>
						<RefreshCw size={15} class={isRegeneratingVoice ? 'spin' : ''} />
						<span>{isRegeneratingVoice ? 'Menerapkan Suara...' : '🎙️ Terapkan ke Semua Suara'}</span>
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
		</section>

		<section class="preview-panel glass-panel">
			<!-- Studio Monitor Frame -->
			<div class="canvas-wrapper" class:canvas-empty={!currentScene}>
				<!-- Monitor Top Status Header -->
				<div class="monitor-top-bar">
					<div class="monitor-status">
						<span class="status-dot" class:live={!!currentScene}></span>
						<span class="status-label">{currentScene ? 'LIVE PREVIEW • 1080p' : 'MONITOR STANDBY'}</span>
					</div>
					<div class="monitor-meta">
						{#if currentScene}
							<span class="scene-counter-badge">Adegan {activeSceneIndex + 1} / {scenes.length}</span>
							<span class="pacing-badge" title="Transisi visual alami berdasarkan alur kalimat utuh">🌿 Natural Flow</span>
							{#if currentScene.chapter}
								<span class="scene-chapter-badge" class:hook-badge={currentScene.chapter.isHook}>
									{currentScene.chapter.tag || 'BAB'}: {currentScene.chapter.title || ''}
								</span>
							{/if}
						{:else}
							<span class="aspect-badge">16:9 Full HD • 30 FPS</span>
							<span class="pacing-badge">🌿 Natural Flow</span>
						{/if}
					</div>
				</div>

				{#if currentScene}
					{@const _curAlign = currentScene.textAlign || stickmanTextAlign}
					{@const _isMiddle = _curAlign === 'middle'}
					{@const _effImgAnim = getEffectiveImageAnimClass(currentScene, activeSceneIndex)}
					<div bind:this={canvasEl} bind:clientHeight={canvasHeight} class="stickman-canvas">
						<div class="canvas-viewport" style="inset: {stickmanVideoPadding}%;">
							{#key `${currentScene.image}-${activeSceneIndex}-${currentScene.imageAnim || stickmanImageAnim}-${currentScene.idleMotion || stickmanIdleMotion}-${currentScene.textSide}`}
								<div class="stickman-entrance-wrapper anim-img-{_effImgAnim} side-{(currentScene.textSide || currentScene.layoutSide || 'right')}">
									<div
										class="stickman-bg-layer idle-motion-{(currentScene?.idleMotion || stickmanIdleMotion || 'shake')}"
										style="background-image: url({currentScene.image});"
									></div>
								</div>
							{/key}
							<div
								class="text-overlay {(currentScene.textSide || currentScene.layoutSide)} anim-{(currentScene.textAnim || stickmanAnim)} align-{_curAlign}"
								style="{getOverlayStyle(currentScene)} cursor: {drag.active ? 'grabbing' : 'grab'};"
								onpointerdown={onTextPointerDown}
								role="presentation"
								title="Drag untuk geser — klik textarea di bawah untuk edit bebas (Enter = baris baru)"
							>
								<div class="two-lines free-mode text-idle-{(currentScene?.textIdleMotion || stickmanTextIdleMotion || 'shake')}" style="font-family: {stickmanFontFamily}; align-items: {_curAlign === 'right' ? 'flex-end' : _curAlign === 'center' || _curAlign === 'middle' ? 'center' : 'flex-start'}; text-align: {_curAlign === 'right' ? 'right' : _curAlign === 'center' || _curAlign === 'middle' ? 'center' : 'left'};">
									{#each getEditorLines(currentScene.keyPoint) as line, idx}
										{@const isTop = idx === 0}
										{@const col = isTop ? (currentScene.textColorTop || stickmanTextColorTop) : (currentScene.textColorBottom || stickmanTextColorBottom)}
										<span class="line anim-target" style="color: {col}; font-size: {getDisplayFontSize(currentScene.keyPoint, currentScene)}px; text-shadow: none;">{line}</span>
									{/each}
								</div>
							</div>
							<button class="flip-btn" onclick={flipCurrentTextSide} title="Pindah teks ke sisi lain">
								<span>↔</span> Flip teks
							</button>
							<button class="auto-align-btn" onclick={autoAlignCurrentScene} title="Deteksi otomatis posisi gambar agar teks tidak menumpuk">
								<span>🎯</span> Auto Posisi
							</button>
							<div class="canvas-fs-pill" title="Ubah Ukuran Huruf Langsung di Layar">
								<button type="button" class="c-fs-btn" onclick={() => changeFontSize(-4)} title="Perkecil Ukuran Huruf (A-)">A-</button>
								<span class="c-fs-val">{currentScene?.fontSize || stickmanFontSize}px</span>
								<button type="button" class="c-fs-btn" onclick={() => changeFontSize(4)} title="Perbesar Ukuran Huruf (A+)">A+</button>
							</div>
							<button class="change-img-btn" onclick={openImagePicker} title="Ganti gambar adegan ini">
								<span>🖼️</span> Ganti Gambar
							</button>
						</div>
					</div>
				{:else}
					<div class="studio-empty-monitor">
						<div class="empty-glow-circle">
							<Film size={34} class="text-indigo" />
						</div>
						<h4 class="empty-monitor-title">Studio Canvas Monitor</h4>
						<p class="empty-monitor-desc">
							Pilih topik di panel kiri atau buat naskah dengan AI, lalu klik <strong>"Generate Stickman Video"</strong> untuk melihat preview animasi adegan di sini.
						</p>
						<div class="empty-monitor-features">
							<div class="feat-pill"><Sparkles size={12} /><span>Bab & Hook Retensi</span></div>
							<div class="feat-pill"><Mic size={12} /><span>Voiceover DSP + BGM</span></div>
							<div class="feat-pill"><Layers size={12} /><span>Full Custom Visual</span></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Controls Available When Scenes Exist -->
			{#if scenes.length > 0}
				{#if scenes.length > 1}
					<div class="slide-nav">
						<button
							class="slide-nav-btn"
							onclick={() => { if (activeSceneIndex > 0) selectScene(activeSceneIndex - 1); }}
							disabled={activeSceneIndex === 0}
							title="Adegan sebelumnya"
						>&#8592;</button>

						<div class="slide-dots">
							{#each scenes as _, i}
								<button
									class="slide-dot"
									class:active={i === activeSceneIndex}
									onclick={() => selectScene(i)}
									title="Adegan {i + 1}"
								></button>
							{/each}
						</div>

						<span class="slide-counter">{activeSceneIndex + 1} / {scenes.length}</span>

						<button
							class="slide-nav-btn"
							onclick={() => { if (activeSceneIndex < scenes.length - 1) selectScene(activeSceneIndex + 1); }}
							disabled={activeSceneIndex === scenes.length - 1}
							title="Adegan berikutnya"
						>&#8594;</button>
					</div>

					<!-- Scene Filmstrip with Chapter Labels -->
					<div class="scene-filmstrip-wrap">
						<div class="scene-filmstrip">
							{#each scenes as sc, i}
								<div class="filmstrip-item-group">
									{#if sc.chapter}
										<div class="chapter-label" class:hook-label={sc.chapter.isHook}>
											{#if sc.chapter.tag}<span class="chapter-tag">{sc.chapter.tag}</span>{/if}
											<span class="chapter-title">{sc.chapter.title || ''}</span>
										</div>
									{/if}
									<button
										type="button"
										class="filmstrip-thumb"
										class:active={i === activeSceneIndex}
										class:has-chapter={!!sc.chapter}
										class:is-hook={sc.chapter?.isHook}
										onclick={() => selectScene(i)}
										title="Adegan {i + 1}{sc.chapter ? ': ' + (sc.chapter.title || '') : ''}"
									>
										{#if sc.image}
											<img src={sc.image} alt="Scene {i+1}" class="thumb-img" />
										{:else}
											<div class="thumb-placeholder">🎨</div>
										{/if}
										<span class="thumb-num">{i + 1}</span>
										{#if sc.keyPoint}
											<span class="thumb-kp">{sc.keyPoint.split('\n')[0].slice(0, 18)}</span>
										{/if}
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Player Controls -->
				<div class="player-controls">
					<button class="ctrl-btn ctrl-play-btn" onclick={togglePlay}>
						{#if isPlaying}<Pause size={16} />{:else}<Play size={16} />{/if}
						<span>{isPlaying ? 'Pause' : 'Play Narasi'}</span>
					</button>
					<button class="ctrl-btn" onclick={() => { if (scenes.length) selectScene((activeSceneIndex + 1) % scenes.length); }}>
						<span>Next →</span>
					</button>
					<button class="ctrl-btn" onclick={flipCurrentTextSide} title="Pindah teks ke sisi kosong lain">
						<span>↔ Flip Sisi</span>
					</button>
					<button class="ctrl-btn" onclick={autoAlignCurrentScene} title="Deteksi otomatis posisi kosong gambar adegan ini">
						<span>🎯 Auto Sisi</span>
					</button>
					<button
						type="button"
						class="ctrl-btn btn-split-scene"
						onclick={splitCurrentScene}
						disabled={!currentScene || (currentScene.narration || '').split(/\s+/).filter(Boolean).length < 5}
						title="Bagi adegan ini jadi 2 adegan (durasi 5-7 detik) agar gambar berganti lebih cepat"
					>
						<span>✂️ Split Adegan</span>
					</button>
					<button
						type="button"
						class="ctrl-btn btn-random-dup"
						onclick={randomizeDuplicateSceneImages}
						disabled={isRandomizingDuplicates || !scenes.length}
						title="Ganti semua adegan yang menggunakan gambar sama dengan gambar random unik"
					>
						<span>🎲 {isRandomizingDuplicates ? 'Mengacak...' : 'Ganti Gambar Duplikat'}</span>
					</button>
					<button
						type="button"
						class="ctrl-btn"
						class:active-toggle={autoAdvancePlay}
						onclick={() => autoAdvancePlay = !autoAdvancePlay}
						title={autoAdvancePlay ? 'Auto-Next Aktif: Otomatis lanjut & ganti gambar saat adegan selesai' : 'Auto-Next Nonaktif: Hanya putar adegan ini'}
					>
						<span>{autoAdvancePlay ? '🔁 Auto-Next ON' : '⏹️ Auto-Next OFF'}</span>
					</button>
					<button
						type="button"
						class="ctrl-btn"
						onclick={() => regenerateVoiceoverForScene(activeSceneIndex)}
						disabled={isRegeneratingVoice}
						title="Regenerate voiceover adegan ini dengan karakter vokal & filter aktif"
					>
						<Mic size={14} />
						<span>{isRegeneratingVoice ? 'Memproses...' : '🎙️ Suara'}</span>
					</button>
					<div class="quick-fs-control" title="Ubah ukuran huruf adegan ini">
						<button type="button" class="ctrl-btn quick-fs-btn" onclick={() => changeFontSize(-4)} title="Perkecil huruf (A-)">A-</button>
						<span class="quick-fs-val">{currentScene?.fontSize || stickmanFontSize}px</span>
						<button type="button" class="ctrl-btn quick-fs-btn" onclick={() => changeFontSize(4)} title="Perbesar huruf (A+)">A+</button>
					</div>
					<span class="hint">Auto: {(currentScene?.textSide || currentScene?.layoutSide) === 'left' ? 'kiri' : 'kanan'}</span>
				</div>
				<audio bind:this={audioElA} preload="auto" onended={() => onVoiceAudioEnded('A')}></audio>
				<audio bind:this={audioElB} preload="auto" onended={() => onVoiceAudioEnded('B')}></audio>

				{#if currentScene}
					<div class="free-editor">
						<span class="style-label">✏️ Edit Teks Adegan #{activeSceneIndex + 1} (Baris 1 warna atas, Baris 2 warna bawah)</span>
						<textarea class="free-textarea" rows="2" placeholder="Ketik teks 2 baris — Enter untuk baris baru" value={currentScene.keyPoint} oninput={(e) => updateCurrentSceneProp('keyPoint', e.currentTarget.value.slice(0, 140))}></textarea>
					</div>
				{/if}

				<!-- Structured Scene Styling Controls -->
				<div class="scene-style-cards">
					<!-- Typography Card -->
					<div class="style-card">
						<div class="style-card-title">
							<span>✏️ Tipografi & Warna Teks</span>
							<button type="button" class="transform-btn auto-all-btn" onclick={autoAlignAllScenes} title="Deteksi otomatis posisi kosong semua gambar agar teks tidak menumpuk">🎯 Auto Posisi Semua Scene</button>
						</div>
						<div class="style-card-content">
							<div class="style-row">
								<span class="style-label">Rata:</span>
								<div class="anim-pills">
									{#each POS_OPTIONS as pos}
										<button type="button" class="anim-pill" class:on={(currentScene?.textAlign || stickmanTextAlign) === pos.id} onclick={() => currentScene ? setSceneAlign(pos.id) : (stickmanTextAlign = pos.id)}>{pos.label}</button>
									{/each}
								</div>
								<button class="transform-btn" onclick={applyAlignToAll} title="Terapkan perataan teks ke semua scene">Semua</button>
							</div>

							<div class="style-row-split">
								<div class="style-row">
									<span class="style-label">Warna Atas:</span>
									<div class="color-dots">
										{#each TOP_COLOR_PRESETS as c}
											<button type="button" class="color-dot" class:on={(currentScene?.textColorTop || stickmanTextColorTop) === c} style="background: {c}; border-color: {c === '#FFFFFF' ? '#cbd5e1' : c};" onclick={() => currentScene ? setSceneTextColorTop(c) : (stickmanTextColorTop = c)} aria-label="Warna {c}"></button>
										{/each}
										<input type="color" value={currentScene?.textColorTop || stickmanTextColorTop} oninput={(e) => currentScene ? setSceneTextColorTop(e.currentTarget.value) : (stickmanTextColorTop = e.currentTarget.value)} class="color-picker" title="Custom warna baris 1" />
									</div>
									<button class="transform-btn" onclick={applyTextColorTopToAll} title="Terapkan ke semua scene">Semua</button>
								</div>
								<div class="style-row">
									<span class="style-label">Warna Bawah:</span>
									<div class="color-dots">
										{#each BOTTOM_COLOR_PRESETS as c}
											<button type="button" class="color-dot" class:on={(currentScene?.textColorBottom || stickmanTextColorBottom) === c} style="background: {c}; border-color: {c === '#FFFFFF' ? '#cbd5e1' : c};" onclick={() => currentScene ? setSceneTextColorBottom(c) : (stickmanTextColorBottom = c)} aria-label="Warna {c}"></button>
										{/each}
										<input type="color" value={currentScene?.textColorBottom || stickmanTextColorBottom} oninput={(e) => currentScene ? setSceneTextColorBottom(e.currentTarget.value) : (stickmanTextColorBottom = e.currentTarget.value)} class="color-picker" title="Custom warna baris 2" />
									</div>
									<button class="transform-btn" onclick={applyTextColorBottomToAll} title="Terapkan ke semua scene">Semua</button>
								</div>
							</div>

							<div class="style-row font-size-control-group">
								<div class="fs-header-row">
									<span class="style-label fs-main-label">🔤 Ukuran Huruf: <strong class="fs-badge">{currentScene?.fontSize || stickmanFontSize}px</strong></span>
									<button type="button" class="transform-btn fs-apply-all-btn" onclick={applyFontSizeToAll} title="Terapkan ukuran font ke semua scene">Terapkan ke Semua Scene</button>
								</div>

								<div class="fs-slider-row">
									<button type="button" class="fs-step-btn" onclick={() => changeFontSize(-4)} title="Perkecil (-4px)">➖</button>
									<input
										type="range"
										min="24"
										max="120"
										step="2"
										value={currentScene?.fontSize || stickmanFontSize}
										oninput={(e) => setSceneFontSize(Number(e.currentTarget.value))}
										class="size-range fs-slider"
									/>
									<button type="button" class="fs-step-btn" onclick={() => changeFontSize(4)} title="Perbesar (+4px)">➕</button>
								</div>

								<div class="fs-presets-row">
									<span class="fs-preset-label">Pilihan Cepat:</span>
									<div class="fs-presets-list">
										{#each FONT_SIZE_PRESETS as p}
											<button
												type="button"
												class="fs-preset-pill"
												class:on={Math.abs((currentScene?.fontSize || stickmanFontSize) - p.val) <= 3}
												onclick={() => setSceneFontSize(p.val)}
											>
												{p.label}
											</button>
										{/each}
									</div>
								</div>
							</div>

							<div class="style-row">
								<span class="style-label font-label">Jenis Font:</span>
								<select bind:value={stickmanFontFamily} class="font-select">
									{#each FONT_OPTIONS as f}<option value={f.value}>{f.label}</option>{/each}
								</select>
							</div>
						</div>
					</div>

					<!-- Animation & Effects Card -->
					<div class="style-card">
						<div class="style-card-title">🎬 Animasi & Safe Area</div>
						<div class="style-card-content">
							<div class="style-row">
								<span class="style-label">Masuk Teks:</span>
								<div class="anim-pills">
									{#each ANIM_OPTIONS as a}
										<button type="button" class="anim-pill" class:on={(currentScene?.textAnim || stickmanAnim) === a.id} onclick={() => currentScene ? setSceneAnim(a.id) : (stickmanAnim = a.id)}>{a.label}</button>
									{/each}
								</div>
								<button class="transform-btn" onclick={applyAnimToAll} title="Terapkan ke semua scene">Semua</button>
							</div>

							<div class="style-row">
								<span class="style-label">Gerak Gambar:</span>
								<div class="anim-pills">
									{#each IDLE_MOTION_OPTIONS as idleOpt}
										<button type="button" class="anim-pill" class:on={(currentScene?.idleMotion || stickmanIdleMotion) === idleOpt.id} onclick={() => currentScene ? setSceneIdleMotion(idleOpt.id) : (stickmanIdleMotion = idleOpt.id)}>{idleOpt.label}</button>
									{/each}
								</div>
								<button class="transform-btn" onclick={applyIdleMotionToAll} title="Terapkan ke semua scene">Semua</button>
							</div>

							<div class="style-row">
								<span class="style-label">Safe Margin:</span>
								<div class="anim-pills">
									{#each VIDEO_PADDING_OPTIONS as pOpt}
										<button
											type="button"
											class="anim-pill"
											class:on={stickmanVideoPadding === pOpt.id}
											onclick={() => stickmanVideoPadding = pOpt.id}
											title={pOpt.desc}
										>
											{pOpt.label}
										</button>
									{/each}
								</div>
								<span class="hint-text" style="font-size: 0.72rem; color: var(--text-3); margin-left: 6px;">Margin aman YouTube</span>
							</div>
						</div>
					</div>
				</div>

				{#if currentScene}
					<div class="transform-actions">
						<div class="slider-row">
							<span class="style-label">Geser X: {(currentScene.textOffsetX || 0).toFixed(1)}%</span>
							<input class="range-input" type="range" min="-35" max="35" step="0.5" value={currentScene.textOffsetX || 0} oninput={(e)=>updateCurrentSceneProp('textOffsetX', Number(e.currentTarget.value))} />
							<span class="style-label">Y: {(currentScene.textOffsetY || 0).toFixed(1)}%</span>
							<input class="range-input" type="range" min="-28" max="28" step="0.5" value={currentScene.textOffsetY || 0} oninput={(e)=>updateCurrentSceneProp('textOffsetY', Number(e.currentTarget.value))} />
						</div>
						<div class="slider-row">
							<span class="style-label">Rotate {(currentScene.textRotate ?? 0)}°</span>
							<input class="range-input" type="range" min="-18" max="18" step="0.5" value={currentScene.textRotate ?? 0} oninput={(e)=>updateCurrentSceneProp('textRotate', Number(e.currentTarget.value))} />
							<span class="style-label">Scale {(currentScene.textScale ?? 1).toFixed(2)}x</span>
							<input class="range-input" type="range" min="0.7" max="1.6" step="0.02" value={currentScene.textScale ?? 1} oninput={(e)=>updateCurrentSceneProp('textScale', Number(e.currentTarget.value))} />
							<button class="transform-btn" onclick={resetTransform}>Reset</button>
						</div>
					</div>
				{/if}

				<!-- Render MP4 Card -->
				<div class="render-card">
					<div class="render-head">
						<div class="render-title"><Film size={15} /><span>Render Video Stickman 16:9 Full HD</span></div>
						<div class="quality-row">
							<button type="button" class="q-btn" class:on={renderQuality==='1080p'} onclick={() => renderQuality='1080p'} disabled={isRendering}>1080p (FHD)</button>
							<button type="button" class="q-btn" class:on={renderQuality==='720p'} onclick={() => renderQuality='720p'} disabled={isRendering}>720p</button>
						</div>
					</div>
					{#if downloadUrl}
						<a href={downloadUrl} download={downloadFilename} class="btn btn-primary download-link" target="_blank"><Download size={14} /><span>Download Video MP4</span></a>
					{:else}
						<button class="btn btn-primary render-btn" onclick={startStickmanRender} disabled={isRendering}>
							{#if isRendering}<RefreshCw size={14} class="spin" /><span>{renderStep || 'Rendering...'} {renderProgress}%</span>{:else}<Film size={14} /><span>Render Video Stickman</span>{/if}
						</button>
					{/if}
					{#if isRendering || renderProgress>0}
						<div class="progress-track"><div class="progress-fill" style="width: {renderProgress}%"></div></div>
						<div class="progress-label">{renderProgress}% • {renderStep}</div>
					{/if}
					{#if renderError}<div class="error-box">{renderError}</div>{/if}
					{#if downloadUrl}<div class="success-box">Video siap — klik Download</div>{/if}
					<p class="render-hint">Video akan di-mix otomatis dengan gambar stickman full, subtitle poin penting, voiceover, dan backsound.</p>
				</div>
			{:else}
				<!-- Workflow Guide When No Scenes Yet -->
				<div class="studio-guide-card">
					<div class="guide-card-head">
						<Sparkles size={16} class="text-amber" />
						<span class="guide-card-title">Alur Kerja Cepat Stickman Studio</span>
					</div>
					<div class="guide-steps-list">
						<div class="guide-step-item">
							<span class="step-num">1</span>
							<div class="step-desc">
								<strong>Tentukan Judul / Topik</strong>
								<small>Ketik topik atau klik <em>"🎲 Ide Cepat"</em> / <em>"🔥 Riset 10 Opsi"</em> untuk ide berbobot.</small>
							</div>
						</div>
						<div class="guide-step-item">
							<span class="step-num">2</span>
							<div class="step-desc">
								<strong>Racik Naskah Viral</strong>
								<small>Klik <em>"✨ AI Script Generator Viral"</em> untuk memecah naskah per adegan & per bab.</small>
							</div>
						</div>
						<div class="guide-step-item">
							<span class="step-num">3</span>
							<div class="step-desc">
								<strong>Pilih Suara & Musik</strong>
								<small>Pilih karakter vokal (Ardi, Gadis, dll.), efek mastering DSP, dan musik latar.</small>
							</div>
						</div>
						<div class="guide-step-item highlight-step">
							<span class="step-num">4</span>
							<div class="step-desc">
								<strong>Generate & Review</strong>
								<small>Klik <em>"✨ Generate Stickman Video"</em> — preview animasi & kontrol adegan akan muncul di sini!</small>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</section>
	</main>

	<!-- Image Picker Modal -->
	{#if showImagePicker}
		<div class="img-picker-backdrop" onclick={(e) => { if (e.target === e.currentTarget) showImagePicker = false; }} role="presentation">
			<div class="img-picker-modal">
				<div class="img-picker-header">
					<div class="img-picker-title">
						<span>🖼️</span>
						<div>
							<strong>Ganti Gambar Adegan {activeSceneIndex + 1}</strong>
							<small>Pilih dari koleksi stickman atau upload gambar kamu sendiri</small>
						</div>
					</div>
					<button class="img-picker-close" onclick={() => showImagePicker = false} title="Tutup">✕</button>
				</div>

				<div class="img-picker-toolbar">
					<input
						type="text"
						bind:value={imagePickerFilter}
						placeholder="🔍 Cari gambar (nama, keyword)..."
						class="img-picker-search"
					/>
					<button
						type="button"
						class="btn-upload-img"
						onclick={() => imageUploadInputEl?.click()}
						title="Upload gambar dari komputer kamu (.png, .jpg, .webp)"
					>
						📁 Upload Gambar
					</button>
					<input
						bind:this={imageUploadInputEl}
						type="file"
						accept="image/png,image/jpeg,image/webp,image/gif"
						style="display:none;"
						onchange={handleImageFileUpload}
					/>
				</div>

				<div class="img-picker-count">
					{filteredAssets.length} gambar{imagePickerFilter ? ` (filter: "${imagePickerFilter}")` : ''}
				</div>

				<div class="img-picker-grid">
					{#if filteredAssets.length === 0}
						<div class="img-picker-empty">
							<span>🔍</span>
							<p>Tidak ada gambar dengan kata kunci <strong>"{imagePickerFilter}"</strong></p>
							<small>Coba kata lain atau upload gambar kamu sendiri</small>
						</div>
					{:else}
						{#each filteredAssets as asset}
							<button
								type="button"
								class="img-pick-card"
								class:selected={currentScene?.image === asset.url}
								onclick={() => applyAssetToScene(asset)}
								title="{asset.title || asset.slug}"
							>
								<div class="pick-card-img-wrap">
									<img src={asset.url} alt={asset.title || asset.slug} class="pick-card-img" loading="lazy" />
									{#if currentScene?.image === asset.url}
										<div class="pick-card-check">✓</div>
									{/if}
								</div>
								<span class="pick-card-label">{(asset.title || asset.slug || '').slice(0, 28)}</span>
								{#if asset.keywords?.length}
									<span class="pick-card-keywords">{asset.keywords.slice(0, 3).join(', ')}</span>
								{/if}
							</button>
						{/each}
					{/if}
				</div>
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
		onSelectTitleForScript={(t, openScript = true) => {
			videoTitle = t;
			showTitleModal = false;
			if (openScript) {
				showScriptModal = true;
			}
		}}
		onClose={() => showTitleModal = false}
	/>
</div>

<style>
	.stickman-studio { min-height: 100vh; background: var(--bg-base); color: var(--text); display: flex; flex-direction: column; }
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

	/* Image Picker Modal */
	.img-picker-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(4,7,18,0.80);
		backdrop-filter: blur(8px);
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.img-picker-modal {
		width: 100%;
		max-width: 900px;
		max-height: 88vh;
		background: #0d1424;
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 40px rgba(99,102,241,0.1);
		overflow: hidden;
		animation: pickerFadeIn 0.2s ease-out;
	}
	@keyframes pickerFadeIn {
		from { opacity: 0; transform: scale(0.97) translateY(10px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}
	.img-picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid rgba(255,255,255,0.08);
		background: rgba(255,255,255,0.02);
	}
	.img-picker-title {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 1.1rem;
	}
	.img-picker-title > span { font-size: 1.4rem; }
	.img-picker-title strong { font-size: 0.95rem; color: #f8fafc; display: block; }
	.img-picker-title small { font-size: 0.72rem; color: #94a3b8; }
	.img-picker-close {
		width: 32px; height: 32px;
		border-radius: 8px;
		background: transparent;
		border: 1px solid rgba(255,255,255,0.1);
		color: #94a3b8;
		cursor: pointer;
		font-size: 0.9rem;
		display: flex; align-items: center; justify-content: center;
		transition: background 0.15s;
	}
	.img-picker-close:hover { background: rgba(255,255,255,0.08); color: #f8fafc; }
	.img-picker-toolbar {
		display: flex;
		gap: 10px;
		padding: 14px 20px;
		border-bottom: 1px solid rgba(255,255,255,0.06);
		align-items: center;
	}
	.img-picker-search {
		flex: 1;
		padding: 8px 12px;
		background: rgba(0,0,0,0.3);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 8px;
		color: #f8fafc;
		font-size: 0.83rem;
		outline: none;
	}
	.img-picker-search:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
	.btn-upload-img {
		padding: 8px 14px;
		background: rgba(99,102,241,0.18);
		border: 1px solid rgba(99,102,241,0.4);
		border-radius: 8px;
		color: #a5b4fc;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.18s;
	}
	.btn-upload-img:hover { background: rgba(99,102,241,0.32); color: #e0e7ff; }
	.img-picker-count {
		padding: 6px 20px;
		font-size: 0.72rem;
		color: #64748b;
	}
	.img-picker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 10px;
		padding: 14px 20px 20px;
		overflow-y: auto;
		flex: 1;
	}
	.img-picker-empty {
		grid-column: 1 / -1;
		text-align: center;
		padding: 40px;
		color: #64748b;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.img-picker-empty span { font-size: 2rem; }
	.img-picker-empty p { margin: 0; font-size: 0.85rem; color: #94a3b8; }
	.img-picker-empty small { font-size: 0.72rem; }
	.img-pick-card {
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: 0;
		background: rgba(255,255,255,0.03);
		border: 2px solid rgba(255,255,255,0.08);
		border-radius: 10px;
		overflow: hidden;
		cursor: pointer;
		transition: border-color 0.18s, transform 0.15s, box-shadow 0.18s;
		text-align: left;
	}
	.img-pick-card:hover {
		border-color: rgba(99,102,241,0.55);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0,0,0,0.4);
	}
	.img-pick-card.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99,102,241,0.35);
	}
	.pick-card-img-wrap {
		width: 100%;
		aspect-ratio: 16/9;
		position: relative;
		overflow: hidden;
		background: #0a0e1a;
	}
	.pick-card-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.22s;
	}
	.img-pick-card:hover .pick-card-img { transform: scale(1.05); }
	.pick-card-check {
		position: absolute;
		top: 5px; right: 5px;
		width: 22px; height: 22px;
		background: #6366f1;
		border-radius: 50%;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.5);
	}
	.pick-card-label {
		padding: 4px 6px 0;
		font-size: 0.65rem;
		color: #cbd5e1;
		font-weight: 600;
		line-height: 1.2;
		word-break: break-word;
	}
	.pick-card-keywords {
		padding: 0 6px 6px;
		font-size: 0.58rem;
		color: #64748b;
		line-height: 1.3;
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
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.preset-label {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-3);
		text-transform: uppercase;
		letter-spacing: 0.02em;
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
	.stickman-canvas { position: absolute; inset: 0; background: #ffffff; overflow: hidden; }
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
	.anim-pop .anim-target { animation: stickPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
	.anim-slide.left .anim-target { animation: stickSlideInLeft 0.45s ease both; }
	.anim-slide.right .anim-target { animation: stickSlideInRight 0.45s ease both; }
	.anim-fade .anim-target { animation: stickFade 0.6s ease both; }
	.anim-typewriter .anim-target { overflow: hidden; white-space: nowrap; animation: stickType 1.1s steps(30) both; max-width: 100%; }
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
