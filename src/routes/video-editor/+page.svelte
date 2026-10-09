<script>
	import { onMount } from 'svelte';
	import {
		Play,
		Pause,
		RotateCcw,
		Volume2,
		VolumeX,
		Upload,
		Music,
		Download,
		Image as ImageIcon,
		Trash2,
		Plus,
		ChevronLeft,
		ChevronRight,
		Clock,
		Sliders,
		Sparkles,
		Layers,
		ArrowUpDown,
		Check,
		ZoomIn,
		ZoomOut,
		Maximize2,
		Copy,
		Video,
		CheckCircle2,
		Film,
		ExternalLink,
		X,
		Eye,
		EyeOff,
		Radio,
		Wand2,
		FileAudio,
		FileText,
		CheckCheck,
		ListOrdered
	} from 'lucide-svelte';

	// Multi-Layer Visual Tracks State
	let visualTracks = $state([
		{
			id: 'v1',
			name: 'Visual V1 (Utama)',
			isVisible: true,
			clips: /** @type {any[]} */ ([])
		},
		{
			id: 'v2',
			name: 'Visual V2 (Overlay / PIP)',
			isVisible: true,
			clips: /** @type {any[]} */ ([])
		}
	]);

	// Multi-Layer Audio Tracks State
	let audioTracks = $state([
		{
			id: 'a1',
			name: 'Audio A1 (Voiceover / Audio Utama)',
			audioUrl: /** @type {string|null} */ (null),
			audioName: /** @type {string|null} */ (null),
			audioDuration: 0,
			volume: 1.0,
			loop: false,
			isMuted: false
		},
		{
			id: 'a2',
			name: 'Audio A2 (BGM / Musik Latar)',
			audioUrl: /** @type {string|null} */ (null),
			audioName: /** @type {string|null} */ (null),
			audioDuration: 0,
			volume: 0.35,
			loop: true,
			isMuted: false
		}
	]);

	// Active Selections
	let activeVisualTrackId = $state('v1');
	let activeClipIndex = $state(0);
	let targetAudioTrackId = $state('a1');

	// Timeline & Player State
	let defaultDuration = $state(4.0);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let playbackSpeed = $state(1);
	let pxPerSec = $state(45); // Timeline zoom scale (pixels per second)
	let aspectRatio = $state('16:9'); // '16:9' | '9:16' | '1:1'
	let renderQuality = $state('1080p');
	let videoTitle = $state('Video-Multi-Layer');
	let sortMethod = $state('name'); // 'name' | 'date_asc' | 'date_desc'

	// DOM Elements & Refs
	let timelineScrollEl = $state(/** @type {HTMLDivElement|undefined} */ (undefined));
	let timelineRulerContentEl = $state(/** @type {HTMLDivElement|undefined} */ (undefined));
	let scrollLeft = $state(0);
	let playheadInterval = /** @type {any} */ (null);
	let isDraggingPlayhead = $state(false);
	let resizingClip = $state(/** @type {any} */ (null)); // { trackId, index, startX, startDuration }
	let fileInputImages = $state(/** @type {HTMLInputElement|undefined} */ (undefined));
	let fileInputAudio = $state(/** @type {HTMLInputElement|undefined} */ (undefined));
	let audioTrackElements = $state(/** @type {Record<string, HTMLAudioElement>} */ ({}));

	// AI Audio Storyboard & Bulk Import State
	let showAiStoryboardModal = $state(false);
	let isGeneratingStoryboard = $state(false);
	let storyboardLoadingStep = $state('');
	let storyboardAudioFile = $state(/** @type {File|null} */ (null));
	let storyboardAudioPreviewUrl = $state(/** @type {string|null} */ (null));
	let storyboardStylePreset = $state('cartoon_2d');
	let storyboardStyleTemplate = $state(
		'A 2D cartoon digital illustration in the style of educational YouTube animation channels, featuring a nerdy young programmer character with a round white head, wide expressive eyes, messy brown hair, and wearing an oversized casual hoodie. Clean bold black outlines, smooth shading. --ar 16:9'
	);
	let storyboardPacing = $state('balanced'); // 'fast' | 'balanced' | 'relaxed'
	let generatedStoryboard = $state(/** @type {any[]|null} */ (null));
	let storyboardAudioResult = $state(/** @type {any|null} */ (null));
	let copiedSceneIdx = $state(/** @type {number|null} */ (null));
	let copiedAllPromptsStatus = $state(false);

	// Hidden inputs for bulk & single image replacements
	let bulkFileInput = $state(/** @type {HTMLInputElement|undefined} */ (undefined));
	let singleClipReplaceInput = $state(/** @type {HTMLInputElement|undefined} */ (undefined));
	let targetReplaceClipIndex = $state(-1);

	// Subtitles / Captions State
	let subtitleItems = $state(/** @type {Array<{ id: string, start: number, end: number, duration: number, text: string }>} */ ([]));
	let subtitlesEnabled = $state(true);
	let subtitleStyle = $state('viral-yellow'); // 'viral-yellow' | 'mrbeast-bold' | 'minimal'
	let subtitlePosition = $state('bottom'); // 'bottom' | 'center' | 'top'
	let subtitleFontScale = $state(1.0); // 0.8 - 2.0
	let subtitleTrackVisible = $state(true);
	let activeSubtitleIndex = $state(-1);
	let isGeneratingSubtitles = $state(false);
	let activeInspectorTab = $state('clip'); // 'clip' | 'subtitle'
	let resizingSubtitle = $state(/** @type {any} */ (null)); // { index, handle, startX, origStart, origEnd }

	const STYLE_PRESETS = [
		{
			id: 'cartoon_2d',
			label: '🎨 2D Cartoon YouTube (Default)',
			template:
				'A 2D cartoon digital illustration in the style of educational YouTube animation channels, featuring a nerdy young programmer character with a round white head, wide expressive eyes, messy brown hair, and wearing an oversized casual hoodie. Clean bold black outlines, smooth shading. --ar 16:9'
		},
		{
			id: 'anime_manga',
			label: '⛩️ Anime / Webtoon Style',
			template:
				'Vibrant modern anime digital illustration, high quality Studio MAPPA aesthetic, featuring a young energetic student protagonist with sharp features, stylish jacket, in a lively Tokyo setting with soft ambient sunlight and particle dust. Crisp cel-shading, dynamic camera perspective. --ar 16:9'
		},
		{
			id: 'pixar_3d',
			label: '⚡ 3D Pixar Animation',
			template:
				'Charming 3D animated character render in Disney Pixar style, featuring an expressive cute character with big curious eyes, detailed tactile clothing textures, soft volumetric warm lighting, raytraced subsurface scattering. --ar 16:9'
		},
		{
			id: 'cinematic_photoreal',
			label: '📸 Cinematic 8K Photoreal',
			template:
				'Hyper-realistic cinematic film still, 35mm photography, dramatic moody lighting, shallow depth of field, subtle motion blur, photorealistic textures, color graded by Roger Deakins, 8k resolution. --ar 16:9'
		}
	];

	// Render modal state
	let isRendering = $state(false);
	let renderProgress = $state(0);
	let renderStep = $state('');
	let renderResult = $state(/** @type {any} */ (null));
	let renderError = $state(/** @type {string|null} */ (null));
	let showRenderModal = $state(false);

	// Notification toast
	let toastMessage = $state('');
	let toastTimer = null;
	function showToast(msg) {
		toastMessage = msg;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastMessage = '';
		}, 3000);
	}

	// Derived: Total video duration is determined by longest track (visual or audio)
	let totalDuration = $derived.by(() => {
		let maxDur = 0;
		for (const vt of visualTracks) {
			const dur = vt.clips.reduce((sum, c) => sum + Number(c.duration || 3), 0);
			if (dur > maxDur) maxDur = dur;
		}
		for (const at of audioTracks) {
			if (at.audioUrl && Number(at.audioDuration || 0) > maxDur) {
				maxDur = Number(at.audioDuration);
			}
		}
		return Number(maxDur.toFixed(2));
	});

	// Derived: Total duration of Visual Track V1 (Main)
	let mainVisualDuration = $derived.by(() => {
		return Number(
			(visualTracks[0]?.clips || []).reduce((sum, c) => sum + Number(c.duration || 3), 0).toFixed(2)
		);
	});

	// Derived: Duration of Main Audio Track A1
	let mainAudioDuration = $derived.by(() => {
		return Number(audioTracks[0]?.audioDuration || 0);
	});

	// Derived: Detect when visual and audio durations differ
	let durationMismatch = $derived.by(() => {
		if (!audioTracks[0]?.audioUrl || (visualTracks[0]?.clips || []).length === 0) return null;
		const diff = Number((mainAudioDuration - mainVisualDuration).toFixed(2));
		if (Math.abs(diff) > 0.5) {
			return {
				diff,
				visualDur: mainVisualDuration,
				audioDur: mainAudioDuration,
				isVisualShorter: diff > 0
			};
		}
		return null;
	});

	// Derived: Dynamic ruler interval to avoid text overlap (e.g. 0s 1s 2s 3s overlapping)
	let rulerInterval = $derived.by(() => {
		if (pxPerSec <= 2) return 120; // 2 min step
		if (pxPerSec <= 5) return 60;  // 1 min step
		if (pxPerSec <= 15) return 30; // 30s step
		if (pxPerSec <= 30) return 15; // 15s step
		if (pxPerSec <= 50) return 10; // 10s step
		if (pxPerSec <= 80) return 5;  // 5s step
		return 2;                      // 2s step
	});

	// Derived: Minimap minute ticks for overview bar
	let minimapMinuteTicks = $derived.by(() => {
		if (totalDuration <= 0) return [];
		const ticks = [];
		let stepSec = 60;
		if (totalDuration > 1200) stepSec = 300; // 5 min
		else if (totalDuration > 600) stepSec = 120; // 2 min
		else if (totalDuration > 180) stepSec = 60;  // 1 min
		else stepSec = 30; // 30 sec

		for (let s = 0; s <= totalDuration; s += stepSec) {
			ticks.push({
				sec: s,
				pct: (s / totalDuration) * 100,
				label: `${Math.floor(s / 60)}m`
			});
		}
		return ticks;
	});

	// Derived: Minimap viewport window width and position
	let minimapViewportWidth = $derived.by(() => {
		if (!timelineScrollEl || totalDuration <= 0) return 100;
		const contentW = totalDuration * pxPerSec;
		const viewW = timelineScrollEl.clientWidth - 120;
		if (contentW <= 0) return 100;
		const ratio = viewW / contentW;
		return Math.min(100, Math.max(4, ratio * 100));
	});

	let minimapViewportLeft = $derived.by(() => {
		if (!timelineScrollEl || totalDuration <= 0) return 0;
		const contentW = totalDuration * pxPerSec;
		if (contentW <= 0) return 0;
		const leftPct = (scrollLeft / contentW) * 100;
		return Math.max(0, Math.min(100 - minimapViewportWidth, leftPct));
	});

	// Derived: Quick jump minute buttons for long timelines
	let quickJumpMinutes = $derived.by(() => {
		if (totalDuration < 90) return [];
		const list = [0];
		if (totalDuration >= 120) list.push(60);   // 1m
		if (totalDuration >= 240) list.push(180);  // 3m
		if (totalDuration >= 360) list.push(300);  // 5m
		if (totalDuration >= 600) list.push(480);  // 8m
		if (totalDuration >= 660) list.push(600);  // 10m
		if (totalDuration >= 900) list.push(720);  // 12m
		if (totalDuration >= 1000) list.push(900); // 15m
		return list.filter((s) => s <= totalDuration);
	});

	// Derived: Placeholder Stats on active / main visual track
	let placeholderStats = $derived.by(() => {
		const mainClips = visualTracks[0]?.clips || [];
		const placeholders = mainClips.filter((c) => !c.imageUrl || c.isPlaceholder);
		return {
			total: mainClips.length,
			unassigned: placeholders.length,
			hasPlaceholders: placeholders.length > 0
		};
	});

	// Derived: Active Visual Track object
	let currentVisualTrack = $derived.by(() => {
		return visualTracks.find((t) => t.id === activeVisualTrackId) || visualTracks[0];
	});

	// Derived: Active Clip object
	let activeClip = $derived.by(() => {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return null;
		const idx = Math.min(Math.max(0, activeClipIndex), track.clips.length - 1);
		return track.clips[idx] || null;
	});

	// Derived: Clips active across layers at the current playhead time
	let currentActiveLayers = $derived.by(() => {
		const active = [];
		for (const track of visualTracks) {
			if (!track.isVisible || !track.clips.length) continue;
			let accumulated = 0;
			for (let i = 0; i < track.clips.length; i++) {
				const clip = track.clips[i];
				const dur = Number(clip.duration || 3);
				if (currentTime >= accumulated && currentTime < accumulated + dur) {
					active.push({
						trackId: track.id,
						trackName: track.name,
						clip,
						index: i,
						offset: currentTime - accumulated,
						duration: dur
					});
					break;
				}
				accumulated += dur;
			}
		}
		return active;
	});

	// Base clip (V1) at playhead
	let currentBaseClip = $derived.by(() => {
		return currentActiveLayers.find((l) => l.trackId === 'v1') || null;
	});

	// Overlay clips (V2, V3...) at playhead
	let currentOverlayClips = $derived.by(() => {
		return currentActiveLayers.filter((l) => l.trackId !== 'v1');
	});

	// Derived: Subtitle active at the current playhead time
	let currentActiveSubtitle = $derived.by(() => {
		if (!subtitlesEnabled || !subtitleItems.length) return null;
		return subtitleItems.find((s) => currentTime >= s.start && currentTime <= s.end) || null;
	});

	// Derived: Active Subtitle object in Inspector
	let activeSubtitle = $derived.by(() => {
		if (activeSubtitleIndex >= 0 && activeSubtitleIndex < subtitleItems.length) {
			return subtitleItems[activeSubtitleIndex];
		}
		return null;
	});

	// Derived: Active transition between current base clip and next clip
	let currentTransitionInfo = $derived.by(() => {
		if (!currentBaseClip?.clip) return null;
		const transType = currentBaseClip.clip.transitionType || 'none';
		const transDur = Number(currentBaseClip.clip.transitionDuration ?? 0.5);
		if (transType === 'none' || transDur <= 0) return null;

		const remaining = currentBaseClip.duration - currentBaseClip.offset;
		if (remaining > transDur) return null;

		const nextClip = visualTracks[0]?.clips[currentBaseClip.index + 1] || null;
		if (!nextClip) return null;

		const progress = Math.max(0, Math.min(1, 1 - (remaining / transDur)));

		return {
			type: transType,
			duration: transDur,
			progress,
			nextClip
		};
	});

	/**
	 * @param {string|null|undefined} motionEffect
	 * @param {number} progress
	 * @param {number} [offset]
	 */
	function getClipMotionTransform(motionEffect, progress, offset = 0) {
		if (!motionEffect || motionEffect === 'none') return 'scale(1.0)';
		const p = Math.max(0, Math.min(1, Number(progress) || 0));
		if (motionEffect === 'zoom_in') {
			const s = 1.0 + p * 0.12;
			return `scale(${s.toFixed(4)})`;
		}
		if (motionEffect === 'zoom_out') {
			const s = 1.12 - p * 0.12;
			return `scale(${s.toFixed(4)})`;
		}
		if (motionEffect === 'pan_left') {
			const tx = 2.0 - p * 4.0;
			return `scale(1.06) translateX(${tx.toFixed(2)}%)`;
		}
		if (motionEffect === 'pan_right') {
			const tx = -2.0 + p * 4.0;
			return `scale(1.06) translateX(${tx.toFixed(2)}%)`;
		}
		if (motionEffect === 'diagonal_drift') {
			const s = 1.03 + p * 0.07;
			const tx = -1.5 + p * 3.0;
			const ty = -1.5 + p * 3.0;
			return `scale(${s.toFixed(4)}) translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%)`;
		}
		if (motionEffect === 'camera_shake') {
			const ox = Math.sin(offset * 20) * 1.8;
			const oy = Math.cos(offset * 25) * 1.4;
			return `scale(1.05) translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`;
		}
		if (motionEffect === 'pulse_pop') {
			const s = 1.0 + Math.sin(p * Math.PI * 2) * 0.04;
			return `scale(${s.toFixed(4)})`;
		}
		return 'scale(1.0)';
	}

	// Format seconds into MM:SS.S
	function formatTime(sec) {
		const safeSec = Math.max(0, Number(sec) || 0);
		const mins = Math.floor(safeSec / 60);
		const secs = Math.floor(safeSec % 60);
		const tenths = Math.floor((safeSec % 1) * 10);
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
	}

	// Add new Visual Layer / Track
	function addVisualTrack() {
		const nextNum = visualTracks.length + 1;
		const newTrack = {
			id: `v${nextNum}-${Date.now().toString(36).substring(4)}`,
			name: `Visual V${nextNum} (Layer ${nextNum})`,
			isVisible: true,
			clips: []
		};
		visualTracks = [...visualTracks, newTrack];
		activeVisualTrackId = newTrack.id;
		showToast(`Track visual baru ditambahkan: V${nextNum}`);
	}

	function removeVisualTrack(trackId) {
		if (visualTracks.length <= 1) {
			showToast('Minimal harus ada 1 Track Visual Utama (V1)');
			return;
		}
		visualTracks = visualTracks.filter((t) => t.id !== trackId);
		if (activeVisualTrackId === trackId) {
			activeVisualTrackId = visualTracks[0].id;
		}
		showToast('Track visual dihapus');
	}

	// Add new Audio Track
	function addAudioTrack() {
		const nextNum = audioTracks.length + 1;
		const newTrack = {
			id: `a${nextNum}-${Date.now().toString(36).substring(4)}`,
			name: `Audio A${nextNum} (Track ${nextNum})`,
			audioUrl: null,
			audioName: null,
			audioDuration: 0,
			volume: 0.9,
			loop: true,
			isMuted: false
		};
		audioTracks = [...audioTracks, newTrack];
		targetAudioTrackId = newTrack.id;
		showToast(`Track audio baru ditambahkan: A${nextNum}`);
	}

	function removeAudioTrack(trackId) {
		if (audioTracks.length <= 1) {
			showToast('Minimal harus ada 1 Track Audio');
			return;
		}
		audioTracks = audioTracks.filter((t) => t.id !== trackId);
		showToast('Track audio dihapus');
	}

	// Auto import images with natural numeric sorting or timestamp sorting
	async function handleImageFiles(event) {
		const files = Array.from(event.target.files || []);
		if (!files.length) return;

		// Sort files according to selected sortMethod
		if (sortMethod === 'date_asc') {
			files.sort((a, b) => (a.lastModified || 0) - (b.lastModified || 0));
		} else if (sortMethod === 'date_desc') {
			files.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
		} else {
			// Natural numeric sorting: 1, 2, 3... 10...
			files.sort((a, b) =>
				a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
			);
		}

		const newClips = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const dataUrl = await readFileAsDataURL(file);
			newClips.push({
				id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
				name: file.name,
				lastModified: file.lastModified || Date.now(),
				imageUrl: dataUrl,
				duration: defaultDuration,
				motionEffect: 'none',
				transitionType: 'fade',
				transitionDuration: 0.5,
				overlayEffect: 'none',
				overlayPosition: 'top-right', // for overlay tracks
				overlayScale: 0.35
			});
		}

		// Insert into the currently active visual track
		const targetTrack = visualTracks.find((t) => t.id === activeVisualTrackId) || visualTracks[0];
		targetTrack.clips = [...targetTrack.clips, ...newClips];
		visualTracks = [...visualTracks];

		const methodLabel =
			sortMethod === 'date_asc'
				? 'waktu terlama ⏩ terbaru'
				: sortMethod === 'date_desc'
				? 'waktu terbaru ⏪ terlama'
				: 'nama file (1..N)';

		showToast(`Ditambahkan ${files.length} gambar ke [${targetTrack.name}] (${methodLabel})`);
		if (fileInputImages) fileInputImages.value = '';
	}

	function readFileAsDataURL(file) {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.readAsDataURL(file);
		});
	}

	// Sort clips in the active visual track
	function sortClips(method) {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return;
		sortMethod = method;

		if (method === 'date_asc') {
			track.clips = [...track.clips].sort((a, b) => (a.lastModified || 0) - (b.lastModified || 0));
			showToast(`[${track.name}] Diurutkan: Waktu terlama ⏩ terbaru`);
		} else if (method === 'date_desc') {
			track.clips = [...track.clips].sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
			showToast(`[${track.name}] Diurutkan: Waktu terbaru ⏪ terlama`);
		} else {
			track.clips = [...track.clips].sort((a, b) =>
				(a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
			);
			showToast(`[${track.name}] Diurutkan menurut nama file (1, 2, 3...)`);
		}
		visualTracks = [...visualTracks];
		seekTo(0);
	}

	// Apply default duration to all clips in active track
	function applyDefaultDurationToAll() {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return;
		track.clips = track.clips.map((c) => ({ ...c, duration: defaultDuration }));
		visualTracks = [...visualTracks];
		showToast(`Durasi ${defaultDuration}s diterapkan ke semua klip di ${track.name}`);
	}

	function updateClipDuration(index, newDur) {
		const track = currentVisualTrack;
		if (!track || !track.clips[index]) return;
		const clamped = Math.max(0.5, Math.min(60, Number(Number(newDur).toFixed(1))));
		track.clips[index].duration = clamped;
		visualTracks = [...visualTracks];
	}

	function moveClip(index, direction) {
		const track = currentVisualTrack;
		if (!track) return;
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= track.clips.length) return;
		const temp = track.clips[index];
		track.clips[index] = track.clips[targetIndex];
		track.clips[targetIndex] = temp;
		visualTracks = [...visualTracks];
		activeClipIndex = targetIndex;
	}

	function duplicateClip(index) {
		const track = currentVisualTrack;
		if (!track || !track.clips[index]) return;
		const orig = track.clips[index];
		const clone = {
			...orig,
			id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
			name: `${orig.name} (Salinan)`
		};
		track.clips.splice(index + 1, 0, clone);
		visualTracks = [...visualTracks];
		activeClipIndex = index + 1;
		showToast('Klip gambar diduplikasi');
	}

	function deleteClip(index) {
		const track = currentVisualTrack;
		if (!track || !track.clips[index]) return;
		track.clips.splice(index, 1);
		visualTracks = [...visualTracks];
		if (activeClipIndex >= track.clips.length) {
			activeClipIndex = Math.max(0, track.clips.length - 1);
		}
		showToast('Klip dihapus');
	}

	// Motion, Transition & Overlay Bulk Actions
	function applyMotionToAll(motionEffect) {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return;
		for (const clip of track.clips) {
			clip.motionEffect = motionEffect;
		}
		visualTracks = [...visualTracks];
		showToast(`Animasi [${motionEffect}] diterapkan ke semua klip`);
	}

	function smartAlternateMotion() {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return;
		const sequence = ['zoom_in', 'pan_left', 'zoom_out', 'pan_right', 'diagonal_drift', 'pulse_pop'];
		track.clips.forEach((clip, idx) => {
			clip.motionEffect = sequence[idx % sequence.length];
		});
		visualTracks = [...visualTracks];
		showToast('Variasi animasi dinamis diterapkan ke semua klip!');
	}

	function applyTransitionToAll(transitionType, transitionDuration = 0.5) {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return;
		for (const clip of track.clips) {
			clip.transitionType = transitionType;
			clip.transitionDuration = Number(transitionDuration) || 0.5;
		}
		visualTracks = [...visualTracks];
		showToast(`Transisi [${transitionType}] (${transitionDuration}s) diterapkan ke semua sambungan`);
	}

	function applyOverlayToAll(overlayEffect) {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return;
		for (const clip of track.clips) {
			clip.overlayEffect = overlayEffect;
		}
		visualTracks = [...visualTracks];
		showToast(`Overlay [${overlayEffect}] diterapkan ke semua klip`);
	}

	function clearAllOverlays() {
		const track = currentVisualTrack;
		if (!track || !track.clips.length) return;
		for (const clip of track.clips) {
			clip.overlayEffect = 'none';
		}
		visualTracks = [...visualTracks];
		showToast('Semua overlay dinonaktifkan');
	}

	// Audio Import for a specific track
	function openAudioPicker(trackId) {
		targetAudioTrackId = trackId;
		fileInputAudio?.click();
	}

	async function handleAudioFile(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		const dataUrl = await readFileAsDataURL(file);
		const targetTrack = audioTracks.find((t) => t.id === targetAudioTrackId) || audioTracks[0];

		targetTrack.audioName = file.name;
		targetTrack.audioUrl = dataUrl;

		const tempAudio = new Audio(dataUrl);
		tempAudio.addEventListener('loadedmetadata', () => {
			targetTrack.audioDuration = Number(tempAudio.duration.toFixed(2));
			if (targetTrack.id === 'a1' || tempAudio.duration > 20) {
				targetTrack.loop = false;
			}
			audioTracks = [...audioTracks];
			showToast(`Audio "${file.name}" dimuat ke [${targetTrack.name}]`);
		});

		audioTracks = [...audioTracks];
		if (fileInputAudio) fileInputAudio.value = '';
	}

	function clearTrackAudio(trackId) {
		const track = audioTracks.find((t) => t.id === trackId);
		if (track) {
			track.audioUrl = null;
			track.audioName = null;
			track.audioDuration = 0;
			const el = audioTrackElements[trackId];
			if (el) {
				el.pause();
				el.src = '';
			}
			audioTracks = [...audioTracks];
			showToast(`Audio di [${track.name}] dihapus`);
		}
	}

	// -------------------------------------------------------------
	// AI Audio Storyboard & Bulk Image Matching
	// -------------------------------------------------------------
	function selectStylePreset(presetId) {
		storyboardStylePreset = presetId;
		const found = STYLE_PRESETS.find((p) => p.id === presetId);
		if (found) {
			storyboardStyleTemplate = found.template;
		}
	}

	function handleStoryboardAudioSelect(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		storyboardAudioFile = file;
		if (storyboardAudioPreviewUrl) URL.revokeObjectURL(storyboardAudioPreviewUrl);
		storyboardAudioPreviewUrl = URL.createObjectURL(file);
	}

	async function generateAiStoryboard() {
		if (!storyboardAudioFile) {
			showToast('Pilih file audio terlebih dahulu!');
			return;
		}

		isGeneratingStoryboard = true;
		storyboardLoadingStep = 'Mengunggah file audio ke server...';
		generatedStoryboard = null;
		storyboardAudioResult = null;

		try {
			const formData = new FormData();
			formData.append('audio', storyboardAudioFile);
			formData.append('styleTemplate', storyboardStyleTemplate);
			formData.append('pacing', storyboardPacing);

			storyboardLoadingStep = 'Whisper sedang mentranskripsi audio & mengenali jeda ucapan...';

			const res = await fetch('/api/ai-audio-storyboard', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();
			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Gagal menghasilkan storyboard dari audio.');
			}

			generatedStoryboard = data.scenes;
			storyboardAudioResult = data;
			showToast(`✨ Sukses! ${data.scenes.length} scene & prompt visual berhasil dibuat.`);
		} catch (err) {
			console.error('[Generate AI Storyboard Error]:', err);
			showToast(`⚠️ Error: ${err.message}`);
		} finally {
			isGeneratingStoryboard = false;
			storyboardLoadingStep = '';
		}
	}

	function copyAllPrompts() {
		const scenes = generatedStoryboard || visualTracks[0]?.clips.filter((c) => c.prompt) || [];
		if (!scenes.length) {
			showToast('Tidak ada prompt yang tersedia untuk disalin.');
			return;
		}

		const promptList = scenes
			.map((s, idx) => {
				const num = s.sceneNumber || idx + 1;
				const p = s.prompt || '';
				return `${num}. ${p}`;
			})
			.join('\n\n');

		navigator.clipboard.writeText(promptList).then(() => {
			copiedAllPromptsStatus = true;
			setTimeout(() => {
				copiedAllPromptsStatus = false;
			}, 3000);
			showToast(`📋 Berhasil menyalin ${scenes.length} prompt gambar ke clipboard!`);
		});
	}

	function copySinglePrompt(promptText, idx = 0) {
		if (!promptText) return;
		navigator.clipboard.writeText(promptText).then(() => {
			copiedSceneIdx = idx;
			setTimeout(() => {
				if (copiedSceneIdx === idx) copiedSceneIdx = null;
			}, 2000);
			showToast(`📋 Prompt Scene #${idx + 1} berhasil disalin!`);
		});
	}

	function applyStoryboardToTimeline() {
		if (!generatedStoryboard || !generatedStoryboard.length) {
			showToast('Belum ada storyboard yang di-generate!');
			return;
		}

		// 1. Assign audio to Track A1
		const audioDur = Number(storyboardAudioResult?.totalDuration || 0);
		if (storyboardAudioResult?.audioUrl) {
			const trackA1 = audioTracks.find((t) => t.id === 'a1') || audioTracks[0];
			trackA1.audioUrl = storyboardAudioResult.audioUrl;
			trackA1.audioName = storyboardAudioResult.audioName || storyboardAudioFile?.name || 'Voiceover AI';
			trackA1.audioDuration = audioDur;
			trackA1.name = 'Audio A1 (Voiceover Utama)';
			trackA1.loop = false;
			trackA1.volume = 1.0;
		}

		// 2. Populate Visual Track V1 with placeholder clips
		const newClips = generatedStoryboard.map((sc) => ({
			id: sc.id || `clip-sc-${sc.sceneNumber}-${Date.now()}`,
			name: `Scene #${sc.sceneNumber}`,
			sceneNumber: sc.sceneNumber,
			isPlaceholder: true,
			imageUrl: '',
			duration: Number(sc.duration || 4.0),
			narration: sc.narration || '',
			prompt: sc.prompt || '',
			motionEffect: sc.motion || (sc.sceneNumber % 2 === 1 ? 'zoom_in' : 'pan_left'),
			transitionType: sc.transition || 'fade',
			transitionDuration: 0.5,
			overlayEffect: 'none',
			overlayPosition: 'top-right',
			overlayScale: 0.35
		}));

		// 3. Ensure the sum of visual clips exactly matches audio duration
		if (audioDur > 0 && newClips.length > 0) {
			const visualSum = newClips.reduce((sum, c) => sum + Number(c.duration || 0), 0);
			const diff = Number((audioDur - visualSum).toFixed(2));
			if (Math.abs(diff) > 0.05) {
				const lastClip = newClips[newClips.length - 1];
				lastClip.duration = Math.max(0.5, Number((lastClip.duration + diff).toFixed(2)));
			}
		}

		// 4. Auto-populate Subtitles from AI Whisper segments or scene narrations
		if (storyboardAudioResult?.whisperSegments?.length) {
			subtitleItems = storyboardAudioResult.whisperSegments.map((s, idx) => ({
				id: `sub-${idx + 1}`,
				start: Number(s.start || 0),
				end: Number(s.end || 0),
				duration: Number((Number(s.end || 0) - Number(s.start || 0)).toFixed(2)),
				text: s.text || ''
			}));
			subtitlesEnabled = true;
		} else if (newClips.some((c) => c.narration)) {
			let acc = 0;
			const generatedSubs = [];
			newClips.forEach((c, idx) => {
				const start = Number(acc.toFixed(2));
				const end = Number((acc + c.duration).toFixed(2));
				if (c.narration && c.narration.trim()) {
					generatedSubs.push({
						id: `sub-${idx + 1}`,
						start,
						end,
						duration: Number(c.duration.toFixed(2)),
						text: c.narration.trim()
					});
				}
				acc += c.duration;
			});
			subtitleItems = generatedSubs;
			subtitlesEnabled = true;
		}

		visualTracks[0].clips = newClips;
		visualTracks = [...visualTracks];
		audioTracks = [...audioTracks];

		showAiStoryboardModal = false;
		seekTo(0);
		showToast(`🎬 ${newClips.length} scene placeholder masuk ke timeline! Total: ${formatTime(audioDur || totalDuration)}`);
	}

	// Scale all visual clips proportionally so their total duration matches audio 1:1
	function fitVisualToAudio() {
		const track = visualTracks[0];
		if (!track || !track.clips.length || !mainAudioDuration) return;
		const currentDur = track.clips.reduce((sum, c) => sum + Number(c.duration || 0), 0);
		if (currentDur <= 0) return;
		const ratio = mainAudioDuration / currentDur;
		let accumulated = 0;
		for (let i = 0; i < track.clips.length; i++) {
			if (i === track.clips.length - 1) {
				track.clips[i].duration = Math.max(0.5, Number((mainAudioDuration - accumulated).toFixed(2)));
			} else {
				const newDur = Number((track.clips[i].duration * ratio).toFixed(2));
				track.clips[i].duration = Math.max(0.5, newDur);
				accumulated += track.clips[i].duration;
			}
		}
		visualTracks = [...visualTracks];
		showToast(`✨ Semua ${track.clips.length} scene visual disesuaikan ke durasi audio (${formatTime(mainAudioDuration)})!`);
	}

	// Extend the last clip so it fills any trailing gap up to audio end
	function extendLastClipToAudio() {
		const track = visualTracks[0];
		if (!track || !track.clips.length || !mainAudioDuration) return;
		const currentDur = track.clips.reduce((sum, c) => sum + Number(c.duration || 0), 0);
		const diff = mainAudioDuration - currentDur;
		if (diff > 0) {
			const lastClip = track.clips[track.clips.length - 1];
			lastClip.duration = Number((lastClip.duration + diff).toFixed(2));
			visualTracks = [...visualTracks];
			showToast(`✨ Scene terakhir #${track.clips.length} diperpanjang hingga akhir audio!`);
		}
	}

	function openBulkImagePicker() {
		bulkFileInput?.click();
	}

	async function handleBulkImageFiles(event) {
		const files = Array.from(event.target.files || []);
		if (!files.length) return;
		await processBulkImages(files);
		if (bulkFileInput) bulkFileInput.value = '';
	}

	async function processBulkImages(files) {
		const track = visualTracks.find((t) => t.id === activeVisualTrackId) || visualTracks[0];
		if (!track.clips.length) {
			showToast('Belum ada scene di timeline. Buat AI Storyboard atau tambahkan klip terlebih dahulu!');
			return;
		}

		// Natural numeric sorting (e.g. 1.png, 2.png, 10.png)
		files.sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
		);

		let matchedCount = 0;

		// Extract numbers from filenames: e.g. "1.png", "scene_2.jpg", "03.webp", "adegan-4.png"
		const fileNumMap = new Map();
		const unnumberedFiles = [];

		for (const f of files) {
			const match = f.name.match(/(?:scene[_\-\s]*|adegan[_\-\s]*)?(\d+)/i);
			if (match && match[1]) {
				const num = parseInt(match[1], 10);
				if (!fileNumMap.has(num)) {
					fileNumMap.set(num, f);
					continue;
				}
			}
			unnumberedFiles.push(f);
		}

		// First pass: match exact scene numbers
		const remainingClips = [];
		for (let i = 0; i < track.clips.length; i++) {
			const clip = track.clips[i];
			const scNum = clip.sceneNumber || i + 1;
			if (fileNumMap.has(scNum)) {
				const file = fileNumMap.get(scNum);
				const dataUrl = await readFileAsDataURL(file);
				clip.imageUrl = dataUrl;
				clip.name = file.name;
				clip.isPlaceholder = false;
				matchedCount++;
			} else {
				remainingClips.push(clip);
			}
		}

		// Second pass: sequential assignment for any unnumbered files or remaining placeholder clips
		let unIdx = 0;
		for (const clip of remainingClips) {
			if (unIdx < unnumberedFiles.length) {
				const file = unnumberedFiles[unIdx++];
				const dataUrl = await readFileAsDataURL(file);
				clip.imageUrl = dataUrl;
				clip.name = file.name;
				clip.isPlaceholder = false;
				matchedCount++;
			}
		}

		visualTracks = [...visualTracks];
		showToast(`✨ Berhasil memasang ${matchedCount} gambar ke scene di [${track.name}]!`);
	}

	function triggerSingleClipReplace(index) {
		targetReplaceClipIndex = index;
		singleClipReplaceInput?.click();
	}

	async function handleSingleClipReplace(event) {
		const file = event.target.files?.[0];
		if (!file || targetReplaceClipIndex < 0) return;
		const dataUrl = await readFileAsDataURL(file);
		const track = visualTracks.find((t) => t.id === activeVisualTrackId) || visualTracks[0];
		if (track.clips[targetReplaceClipIndex]) {
			track.clips[targetReplaceClipIndex].imageUrl = dataUrl;
			track.clips[targetReplaceClipIndex].name = file.name;
			track.clips[targetReplaceClipIndex].isPlaceholder = false;
			visualTracks = [...visualTracks];
			showToast(`Gambar Scene #${targetReplaceClipIndex + 1} berhasil dipasang.`);
		}
		if (singleClipReplaceInput) singleClipReplaceInput.value = '';
	}

	// Playback Synchronization for all audio tracks
	function togglePlay() {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	}

	function play() {
		if (totalDuration <= 0) return;
		if (currentTime >= totalDuration) {
			currentTime = 0;
		}
		isPlaying = true;

		// Sync and play all active audio tracks
		for (const track of audioTracks) {
			if (track.audioUrl && !track.isMuted) {
				const el = audioTrackElements[track.id];
				if (el) {
					el.currentTime = currentTime;
					el.playbackRate = playbackSpeed;
					el.volume = track.volume;
					el.play().catch(() => {});
				}
			}
		}

		const startTime = performance.now() - (currentTime / playbackSpeed) * 1000;
		clearInterval(playheadInterval);
		playheadInterval = setInterval(() => {
			const elapsed = ((performance.now() - startTime) / 1000) * playbackSpeed;
			if (elapsed >= totalDuration) {
				currentTime = totalDuration;
				pause();
			} else {
				currentTime = Number(elapsed.toFixed(2));
			}
		}, 33);
	}

	function pause() {
		isPlaying = false;
		if (playheadInterval) {
			clearInterval(playheadInterval);
			playheadInterval = null;
		}
		// Pause all audio elements
		for (const track of audioTracks) {
			const el = audioTrackElements[track.id];
			if (el) el.pause();
		}
	}

	function seekTo(time, autoScroll = false) {
		currentTime = Math.max(0, Math.min(totalDuration, Number(time)));
		// Seek all audio elements
		for (const track of audioTracks) {
			const el = audioTrackElements[track.id];
			if (el && track.audioUrl) {
				el.currentTime = currentTime;
			}
		}
		if (autoScroll) {
			scrollToTime(currentTime, true);
		}
	}

	function scrollToTime(time, center = true) {
		if (!timelineScrollEl) return;
		const targetPx = Number(time) * pxPerSec;
		const viewWidth = Math.max(200, timelineScrollEl.clientWidth - 120);
		if (center) {
			timelineScrollEl.scrollLeft = Math.max(0, targetPx - viewWidth / 2);
		} else {
			if (targetPx < timelineScrollEl.scrollLeft) {
				timelineScrollEl.scrollLeft = Math.max(0, targetPx - 40);
			} else if (targetPx > timelineScrollEl.scrollLeft + viewWidth) {
				timelineScrollEl.scrollLeft = targetPx - viewWidth + 40;
			}
		}
	}

	function zoomToFit() {
		if (!timelineScrollEl || totalDuration <= 0) return;
		const availableWidth = Math.max(300, timelineScrollEl.clientWidth - 160);
		const fitScale = Math.max(1, Math.min(120, Math.floor(availableWidth / Math.max(5, totalDuration))));
		pxPerSec = fitScale;
		timelineScrollEl.scrollLeft = 0;
	}

	function getClipStartTime(trackIdx, clipIdx) {
		const track = visualTracks[trackIdx];
		if (!track || !track.clips) return 0;
		let t = 0;
		for (let i = 0; i < clipIdx && i < track.clips.length; i++) {
			t += Number(track.clips[i].duration || defaultDuration);
		}
		return t;
	}

	// Minimap Navigator Drag & Click Scrubbing
	let minimapTrackEl = $state(/** @type {HTMLDivElement|undefined} */ (undefined));
	let isDraggingMinimap = $state(false);

	function handleMinimapMouseDown(/** @type {MouseEvent} */ e) {
		if (e.button !== 0 || !minimapTrackEl || !timelineScrollEl || totalDuration <= 0) return;
		const rect = minimapTrackEl.getBoundingClientRect();
		const clickPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		const targetTime = clickPct * totalDuration;

		seekTo(targetTime);
		scrollToTime(targetTime, true);

		isDraggingMinimap = true;

		const onMouseMove = (/** @type {MouseEvent} */ moveEvent) => {
			if (!isDraggingMinimap || !minimapTrackEl || !timelineScrollEl) return;
			const r = minimapTrackEl.getBoundingClientRect();
			const movePct = Math.max(0, Math.min(1, (moveEvent.clientX - r.left) / r.width));
			const time = movePct * totalDuration;
			seekTo(time);
			scrollToTime(time, true);
		};

		const onMouseUp = () => {
			isDraggingMinimap = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	// Timeline scrubbing, dragging & seeking
	function handleRulerMouseDown(/** @type {MouseEvent} */ e) {
		if (e.button !== 0 || !timelineRulerContentEl) return;
		isDraggingPlayhead = true;

		const updateTimeFromMouse = (/** @type {number} */ clientX) => {
			if (!timelineRulerContentEl) return;
			const rect = timelineRulerContentEl.getBoundingClientRect();
			const clickX = clientX - rect.left;
			const newTime = Math.max(0, Math.min(totalDuration, clickX / pxPerSec));
			seekTo(newTime);
		};

		updateTimeFromMouse(e.clientX);

		const onMouseMove = (/** @type {MouseEvent} */ moveEvent) => {
			if (!isDraggingPlayhead) return;
			updateTimeFromMouse(moveEvent.clientX);
		};

		const onMouseUp = () => {
			isDraggingPlayhead = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function startResizeClip(/** @type {any} */ event, trackId, /** @type {number} */ index) {
		event.stopPropagation();
		event.preventDefault();
		const track = visualTracks.find((t) => t.id === trackId);
		const clip = track?.clips[index];
		if (!clip) return;

		resizingClip = {
			trackId,
			index,
			startX: event.clientX,
			startDuration: Number(clip.duration || 3)
		};

		window.addEventListener('mousemove', onResizeMouseMove);
		window.addEventListener('mouseup', onResizeMouseUp);
	}

	function onResizeMouseMove(/** @type {any} */ event) {
		if (!resizingClip) return;
		const track = visualTracks.find((t) => t.id === resizingClip.trackId);
		if (!track) return;
		const deltaX = event.clientX - resizingClip.startX;
		const deltaSec = deltaX / pxPerSec;
		const newDur = Math.max(0.5, Number((resizingClip.startDuration + deltaSec).toFixed(1)));
		track.clips[resizingClip.index].duration = newDur;
		visualTracks = [...visualTracks];
	}

	function onResizeMouseUp() {
		if (resizingClip) {
			const track = visualTracks.find((t) => t.id === resizingClip.trackId);
			if (track) {
				showToast(`Durasi klip diperbarui: ${track.clips[resizingClip.index].duration}s`);
			}
			resizingClip = null;
		}
		window.removeEventListener('mousemove', onResizeMouseMove);
		window.removeEventListener('mouseup', onResizeMouseUp);
	}

	// Subtitle Drag Resize Handlers
	function startResizeSubtitle(/** @type {any} */ event, /** @type {number} */ index, /** @type {'left'|'right'} */ handle) {
		event.stopPropagation();
		event.preventDefault();
		const sub = subtitleItems[index];
		if (!sub) return;

		resizingSubtitle = {
			index,
			handle,
			startX: event.clientX,
			origStart: sub.start,
			origEnd: sub.end
		};

		window.addEventListener('mousemove', onSubtitleResizeMouseMove);
		window.addEventListener('mouseup', onSubtitleResizeMouseUp);
	}

	function onSubtitleResizeMouseMove(/** @type {any} */ event) {
		if (!resizingSubtitle) return;
		const sub = subtitleItems[resizingSubtitle.index];
		if (!sub) return;

		const deltaX = event.clientX - resizingSubtitle.startX;
		const deltaSec = deltaX / pxPerSec;

		if (resizingSubtitle.handle === 'right') {
			const newEnd = Math.max(sub.start + 0.3, Number((resizingSubtitle.origEnd + deltaSec).toFixed(2)));
			sub.end = newEnd;
			sub.duration = Number((newEnd - sub.start).toFixed(2));
		} else {
			const newStart = Math.max(0, Math.min(sub.end - 0.3, Number((resizingSubtitle.origStart + deltaSec).toFixed(2))));
			sub.start = newStart;
			sub.duration = Number((sub.end - newStart).toFixed(2));
		}
		subtitleItems = [...subtitleItems];
	}

	function onSubtitleResizeMouseUp() {
		if (resizingSubtitle) {
			const sub = subtitleItems[resizingSubtitle.index];
			if (sub) {
				showToast(`Subtitle #${resizingSubtitle.index + 1}: ${sub.start.toFixed(1)}s - ${sub.end.toFixed(1)}s`);
			}
			resizingSubtitle = null;
		}
		window.removeEventListener('mousemove', onSubtitleResizeMouseMove);
		window.removeEventListener('mouseup', onSubtitleResizeMouseUp);
	}

	// Subtitle Helper Methods
	function addEmptySubtitle() {
		const start = Number(currentTime.toFixed(2));
		const end = Number((start + 2.5).toFixed(2));
		const newSub = {
			id: `sub-${Date.now()}`,
			start,
			end,
			duration: 2.5,
			text: 'Teks Subtitle Baru'
		};
		subtitleItems = [...subtitleItems, newSub].sort((a, b) => a.start - b.start);
		activeSubtitleIndex = subtitleItems.findIndex((s) => s.id === newSub.id);
		activeInspectorTab = 'subtitle';
		showToast(`➕ Subtitle ditambahkan pada ${formatTime(start)}`);
	}

	function deleteSubtitle(/** @type {number} */ index) {
		if (index < 0 || index >= subtitleItems.length) return;
		subtitleItems.splice(index, 1);
		subtitleItems = [...subtitleItems];
		if (activeSubtitleIndex >= subtitleItems.length) {
			activeSubtitleIndex = Math.max(-1, subtitleItems.length - 1);
		}
		showToast('🗑️ Subtitle dihapus');
	}

	function clearAllSubtitles() {
		if (!subtitleItems.length) return;
		if (confirm('Yakin ingin menghapus seluruh subtitle pada timeline ini?')) {
			subtitleItems = [];
			activeSubtitleIndex = -1;
			showToast('Semua subtitle telah dihapus');
		}
	}

	async function handleGenerateSubtitles() {
		if (isGeneratingSubtitles) return;
		isGeneratingSubtitles = true;

		try {
			// 1. Audio track Whisper transcription
			const mainAudio = audioTracks.find((t) => t.audioUrl && !t.isMuted) || audioTracks[0];

			if (mainAudio?.audioUrl) {
				showToast('🎙️ AI Whisper mentranskripsikan audio...');
				const res = await fetch('/api/transcribe-audio', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ audioUrl: mainAudio.audioUrl })
				});
				const data = await res.json();
				if (!res.ok || data.error) {
					throw new Error(data.error || 'Gagal mentranskripsikan audio');
				}

				if (data.segments && data.segments.length > 0) {
					subtitleItems = data.segments.map((seg, idx) => ({
						id: `sub-${idx + 1}`,
						start: Number(seg.start || 0),
						end: Number(seg.end || 0),
						duration: Number((Number(seg.end || 0) - Number(seg.start || 0)).toFixed(2)),
						text: seg.text || ''
					}));
					subtitlesEnabled = true;
					activeInspectorTab = 'subtitle';
					activeSubtitleIndex = 0;
					showToast(`✨ Berhasil membuat ${subtitleItems.length} baris subtitle dari Whisper!`);
					return;
				}
			}

			// 2. Fallback: Generate subtitles from visual narration
			const clipsWithNarration = visualTracks[0]?.clips.filter((c) => c.narration && c.narration.trim());
			if (clipsWithNarration && clipsWithNarration.length > 0) {
				showToast('📝 Menyusun subtitle dari narasi scene...');
				let acc = 0;
				const genSubs = [];
				for (let i = 0; i < visualTracks[0].clips.length; i++) {
					const c = visualTracks[0].clips[i];
					const dur = Number(c.duration || 3);
					if (c.narration && c.narration.trim()) {
						genSubs.push({
							id: `sub-${genSubs.length + 1}`,
							start: Number(acc.toFixed(2)),
							end: Number((acc + dur).toFixed(2)),
							duration: dur,
							text: c.narration.trim()
						});
					}
					acc += dur;
				}
				subtitleItems = genSubs;
				subtitlesEnabled = true;
				activeInspectorTab = 'subtitle';
				activeSubtitleIndex = 0;
				showToast(`✨ Berhasil membuat ${subtitleItems.length} subtitle dari narasi visual!`);
				return;
			}

			showToast('⚠️ Unggah audio di Track A1 atau masukkan narasi pada storyboard scene!');
		} catch (err) {
			console.error('Error generating subtitles:', err);
			showToast(`❌ Gagal generate subtitle: ${err.message}`);
		} finally {
			isGeneratingSubtitles = false;
		}
	}

	// Load Demo Multi-layer Project
	function loadDemoProject() {
		const demoSlides = [
			{ bg: '#312e81', title: '1. Hook & Pembuka', sub: 'Membangun atensi penonton' },
			{ bg: '#065f46', title: '2. Analisis Kasus', sub: 'Membongkar paradoks utama' },
			{ bg: '#831843', title: '3. Wawasan Kunci', sub: 'Momen eureka yang mencerahkan' },
			{ bg: '#78350f', title: '4. Eksekusi Strategi', sub: 'Rencana kerja tahap demi tahap' },
			{ bg: '#1e293b', title: '5. Refleksi & Call To Action', sub: 'Kesimpulan dan langkah berikutnya' }
		];

		const v1Clips = demoSlides.map((item, idx) => {
			const svg = `
				<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
					<defs>
						<linearGradient id="grad${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stop-color="${item.bg}"/>
							<stop offset="100%" stop-color="#090d16"/>
						</linearGradient>
					</defs>
					<rect width="1280" height="720" fill="url(#grad${idx})"/>
					<circle cx="640" cy="360" r="280" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
					<text x="640" y="320" font-family="sans-serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">${item.title}</text>
					<text x="640" y="380" font-family="sans-serif" font-size="26" fill="#94a3b8" text-anchor="middle">${item.sub}</text>
					<text x="640" y="660" font-family="monospace" font-size="20" fill="rgba(255,255,255,0.4)" text-anchor="middle">Track V1 (Base) · Slide #${idx + 1}</text>
				</svg>
			`;
			const motions = ['zoom_in', 'pan_left', 'zoom_out', 'diagonal_drift', 'pulse_pop'];
			const transitions = ['fade', 'fadeblack', 'slideleft', 'fadewhite', 'none'];
			const overlays = ['film_grain', 'fog', 'tv_static', 'light_leak', 'none'];

			return {
				id: `demo-v1-${idx + 1}`,
				name: `${idx + 1}-slide-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`,
				imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
				duration: 4.0,
				motionEffect: motions[idx % motions.length],
				transitionType: transitions[idx % transitions.length],
				transitionDuration: 0.5,
				overlayEffect: overlays[idx % overlays.length]
			};
		});

		// Secondary PIP Overlay clips for V2
		const v2Clips = [
			{
				id: 'demo-v2-1',
				name: 'PIP-Badge-Live-Recording.svg',
				imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
					<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
						<rect width="400" height="400" rx="40" fill="#0f172a" stroke="#06b6d4" stroke-width="8"/>
						<circle cx="200" cy="180" r="60" fill="#ef4444"/>
						<text x="200" y="290" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">LIVE PIP</text>
						<text x="200" y="330" font-family="sans-serif" font-size="20" fill="#38bdf8" text-anchor="middle">Layer V2 Overlay</text>
					</svg>
				`)}`,
				duration: 8.0,
				motionEffect: 'none',
				overlayPosition: 'top-right',
				overlayScale: 0.35
			}
		];

		visualTracks[0].clips = v1Clips;
		visualTracks[1].clips = v2Clips;
		visualTracks = [...visualTracks];

		// Audio tracks
		audioTracks[0].audioUrl = '/bgm/bgm-lofi-chill.mp3';
		audioTracks[0].audioName = 'bgm-lofi-chill.mp3 (BGM)';
		audioTracks[0].audioDuration = 120.0;
		audioTracks[0].volume = 0.6;

		audioTracks[1].audioUrl = '/bgm/bgm-tension.mp3';
		audioTracks[1].audioName = 'bgm-tension.mp3 (SFX / Voice)';
		audioTracks[1].audioDuration = 90.0;
		audioTracks[1].volume = 0.8;
		audioTracks = [...audioTracks];

		// Subtitles demo
		subtitleItems = [
			{ id: 'sub-1', start: 0.5, end: 3.8, duration: 3.3, text: 'Selamat datang di video editor interaktif multi-track.' },
			{ id: 'sub-2', start: 4.2, end: 7.8, duration: 3.6, text: 'Setiap layer visual dan audio tersinkronisasi presisi.' },
			{ id: 'sub-3', start: 8.2, end: 11.5, duration: 3.3, text: 'Auto-caption AI meningkatkan engagement penonton!' },
			{ id: 'sub-4', start: 12.2, end: 15.6, duration: 3.4, text: 'Ubah teks, tata letak, dan gaya subtitle secara real-time.' },
			{ id: 'sub-5', start: 16.2, end: 19.8, duration: 3.6, text: 'Siap render ke MP4 berkualitas tinggi dalam sekejap.' }
		];
		subtitlesEnabled = true;

		activeVisualTrackId = 'v1';
		activeClipIndex = 0;
		seekTo(0);
		showToast('Contoh Multi-Layer (Visual, Audio & Subtitle) dimuat!');
	}

	// Trigger Multi-Layer Render Request to backend
	async function startRender() {
		const mainClips = visualTracks[0]?.clips || [];
		if (!mainClips.length) {
			showToast('Tambahkan minimal 1 gambar di Track Visual Utama (V1)!');
			return;
		}

		const unassigned = mainClips.filter((c) => !c.imageUrl || c.isPlaceholder);
		if (unassigned.length > 0) {
			showToast(`⚠️ Masih ada ${unassigned.length} scene yang belum diisi gambar! Harap isi gambar terlebih dahulu.`);
			return;
		}

		isRendering = true;
		renderProgress = 2;
		renderStep = 'Menghubungkan ke renderer FFmpeg multi-layer...';
		renderResult = null;
		renderError = null;
		showRenderModal = true;
		pause();

		try {
			const payload = {
				visualTracks: visualTracks.map((vt) => ({
					id: vt.id,
					name: vt.name,
					isVisible: vt.isVisible,
					clips: vt.clips.map((c) => ({
						id: c.id,
						name: c.name,
						duration: Number(c.duration),
						imageUrl: c.imageUrl,
						motionEffect: c.motionEffect || 'none',
						transitionType: c.transitionType || 'fade',
						transitionDuration: Number(c.transitionDuration ?? 0.5),
						overlayEffect: c.overlayEffect || 'none'
					}))
				})),
				audioTracks: audioTracks
					.filter((at) => at.audioUrl && !at.isMuted)
					.map((at) => ({
						id: at.id,
						name: at.name,
						audioUrl: at.audioUrl,
						volume: at.volume,
						loop: at.loop
					})),
				aspectRatio,
				renderQuality,
				videoTitle,
				subtitles: subtitleItems,
				subtitlesEnabled,
				subtitleStyle,
				subtitlePosition,
				subtitleFontScale
			};

			const response = await fetch('/api/render-video-editor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.status}`);
			}

			if (!response.body) {
				throw new Error('Streaming response body tidak tersedia');
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;
					try {
						const data = JSON.parse(line.substring(6));
						if (data.error) {
							renderError = data.error;
							isRendering = false;
							return;
						}
						if (data.progress !== undefined) {
							renderProgress = data.progress;
						}
						if (data.step) {
							renderStep = data.step;
						}
						if (data.done) {
							renderProgress = 100;
							renderResult = data;
							isRendering = false;
							showToast('Video multi-layer berhasil dirender!');
						}
					} catch (parseErr) {
						console.error('Failed to parse SSE line:', parseErr);
					}
				}
			}
		} catch (/** @type {any} */ err) {
			renderError = err.message || 'Gagal memproses render video';
			isRendering = false;
		}
	}

	onMount(() => {
		const onKeyDown = (/** @type {KeyboardEvent} */ e) => {
			const target = /** @type {HTMLElement|null} */ (e.target);
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
			if (e.code === 'Space') {
				e.preventDefault();
				togglePlay();
			} else if (e.code === 'ArrowLeft') {
				e.preventDefault();
				seekTo(currentTime - 1);
			} else if (e.code === 'ArrowRight') {
				e.preventDefault();
				seekTo(currentTime + 1);
			}
		};
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			if (playheadInterval) clearInterval(playheadInterval);
		};
	});
</script>

<svelte:head>
	<title>Multi-Layer Video Editor (Visual & Audio Timeline) - AI Studio</title>
</svelte:head>

<div class="video-editor-app">
	<!-- Hidden file inputs -->
	<input
		type="file"
		accept="image/*"
		multiple
		bind:this={fileInputImages}
		onchange={handleImageFiles}
		style="display: none;"
	/>
	<input
		type="file"
		accept="audio/*"
		bind:this={fileInputAudio}
		onchange={handleAudioFile}
		style="display: none;"
	/>
	<input
		type="file"
		accept="image/*"
		multiple
		bind:this={bulkFileInput}
		onchange={handleBulkImageFiles}
		style="display: none;"
	/>
	<input
		type="file"
		accept="image/*"
		bind:this={singleClipReplaceInput}
		onchange={handleSingleClipReplace}
		style="display: none;"
	/>

	<!-- Dynamic Audio Elements for all audio tracks -->
	{#each audioTracks as track (track.id)}
		{#if track.audioUrl}
			<audio
				bind:this={audioTrackElements[track.id]}
				src={track.audioUrl}
				loop={track.loop}
				preload="auto"
			></audio>
		{/if}
	{/each}

	<!-- Top Header & Navigation -->
	<header class="editor-header">
		<div class="header-left">
			<a href="/" class="brand-link">
				<div class="brand-icon">
					<Film size={18} />
				</div>
				<div class="brand-info">
					<span class="brand-title">Video Editor</span>
					<span class="brand-tag">Multi-Layer Timeline</span>
				</div>
			</a>

			<nav class="studio-nav">
				<a href="/studio" class="studio-pill">🎬 Cinematic</a>
				<a href="/stickman-studio" class="studio-pill">🎨 Stickman</a>
				<a href="/docu-studio" class="studio-pill">📰 Docu-Style</a>
				<a href="/typography-studio" class="studio-pill">⚡ Dan Koe</a>
				<a href="/video-editor" class="studio-pill active">🎞️ Video Editor</a>
			</nav>
		</div>

		<div class="header-center">
			<input
				type="text"
				bind:value={videoTitle}
				class="title-input"
				placeholder="Judul Video..."
				title="Klik untuk mengubah nama video"
			/>
		</div>

		<div class="header-right">
			<button
				class="btn btn-secondary ai-storyboard-btn"
				onclick={() => (showAiStoryboardModal = true)}
				title="Buat scene otomatis dari audio dengan AI prompt visual"
			>
				<Sparkles size={14} class="text-accent" />
				<span>AI Storyboard</span>
			</button>

			<div class="stat-badge">
				<Layers size={13} />
				<span class="stat-label">Layers:</span>
				<span class="stat-value">{visualTracks.length}V / {audioTracks.length}A</span>
			</div>
			<div class="stat-badge">
				<Clock size={13} />
				<span class="stat-value">{formatTime(totalDuration)}</span>
			</div>

			<button
				class="btn btn-primary render-btn"
				onclick={startRender}
				disabled={totalDuration <= 0 || isRendering}
			>
				<Download size={15} />
				<span>{isRendering ? 'Merender...' : 'Render Video Utuh'}</span>
			</button>
		</div>
	</header>

	<!-- Main Workspace -->
	<div class="workspace-layout">
		<!-- Left / Center: Preview Player & Multi-Layer Canvas -->
		<section class="preview-panel">
			<div class="player-wrapper">
				<div
					class="canvas-frame {aspectRatio === '9:16' ? 'ratio-portrait' : aspectRatio === '1:1' ? 'ratio-square' : 'ratio-landscape'}"
				>
					{#if currentBaseClip?.clip}
						{@const baseProg = currentBaseClip.duration > 0 ? currentBaseClip.offset / currentBaseClip.duration : 0}
						{@const baseMotion = getClipMotionTransform(currentBaseClip.clip.motionEffect, baseProg, currentBaseClip.offset)}
						{@const slideOffset = currentTransitionInfo?.type === 'slideleft'
							? ` translateX(-${currentTransitionInfo.progress * 100}%)`
							: currentTransitionInfo?.type === 'slideright'
							? ` translateX(${currentTransitionInfo.progress * 100}%)`
							: ''}

						<!-- Layer 1: Base Background Clip (Track V1) -->
						{#if currentBaseClip.clip.imageUrl}
							<div
								class="clip-display"
								style="background-image: url('{currentBaseClip.clip.imageUrl}'); transform: {baseMotion}{slideOffset}; opacity: {currentTransitionInfo?.type === 'fadeblack' || currentTransitionInfo?.type === 'fadewhite' ? (currentTransitionInfo.progress >= 0.5 ? 0 : 1) : 1};"
							>
								<div class="clip-watermark">
									<span class="clip-idx-badge">V1</span>
									<span class="clip-filename">{currentBaseClip.clip.name}</span>
								</div>
							</div>
						{:else}
							<div class="clip-display placeholder-canvas-card">
								<div class="ph-canvas-inner">
									<div class="ph-top-badge">
										<span class="badge-scene-num">🎬 SCENE #{currentBaseClip.clip.sceneNumber || currentBaseClip.index + 1}</span>
										<span class="badge-scene-dur">⏱️ {currentBaseClip.clip.duration}s</span>
									</div>

									{#if currentBaseClip.clip.narration}
										<blockquote class="ph-narration-quote">
											"{currentBaseClip.clip.narration}"
										</blockquote>
									{/if}

									{#if currentBaseClip.clip.prompt}
										<div class="ph-prompt-display-box">
											<div class="ph-prompt-header">
												<span class="ph-prompt-label">🤖 AI IMAGE PROMPT (Midjourney / Leonardo / Flux):</span>
												<button
													class="btn btn-xs btn-primary ph-copy-btn"
													onclick={() => copySinglePrompt(currentBaseClip.clip.prompt, currentBaseClip.index)}
												>
													<Copy size={12} />
													<span>{copiedSceneIdx === currentBaseClip.index ? 'Tersalin! ✓' : 'Copy Prompt'}</span>
												</button>
											</div>
											<p class="ph-prompt-body">{currentBaseClip.clip.prompt}</p>
										</div>
									{/if}

									<div class="ph-canvas-footer">
										<button class="btn btn-xs btn-primary-glow" onclick={() => triggerSingleClipReplace(currentBaseClip.index)}>
											<Upload size={13} />
											<span>Unggah Gambar Scene Ini</span>
										</button>
										<button class="btn btn-xs btn-secondary" onclick={openBulkImagePicker}>
											<Upload size={13} />
											<span>Bulk Import Semua Gambar</span>
										</button>
									</div>
								</div>
							</div>
						{/if}

						<!-- Live Scene Transition Layer -->
						{#if currentTransitionInfo?.nextClip}
							{@const nextDur = Math.max(0.5, Number(currentTransitionInfo.nextClip.duration || 3))}
							{@const nextProg = (currentTransitionInfo.progress * currentTransitionInfo.duration) / nextDur}
							{@const nextMotion = getClipMotionTransform(currentTransitionInfo.nextClip.motionEffect, nextProg, currentTransitionInfo.progress * currentTransitionInfo.duration)}

							{#if currentTransitionInfo.type === 'fade'}
								<div
									class="clip-display transition-next-clip"
									style="background-image: url('{currentTransitionInfo.nextClip.imageUrl}'); opacity: {currentTransitionInfo.progress}; transform: {nextMotion};"
								></div>
							{:else if currentTransitionInfo.type === 'fadeblack'}
								{#if currentTransitionInfo.progress >= 0.5}
									<div
										class="clip-display transition-next-clip"
										style="background-image: url('{currentTransitionInfo.nextClip.imageUrl}'); transform: {nextMotion};"
									></div>
								{/if}
								<div
									class="transition-color-dip"
									style="background: #000000; opacity: {currentTransitionInfo.progress < 0.5 ? currentTransitionInfo.progress * 2 : (1 - currentTransitionInfo.progress) * 2};"
								></div>
							{:else if currentTransitionInfo.type === 'fadewhite'}
								{#if currentTransitionInfo.progress >= 0.5}
									<div
										class="clip-display transition-next-clip"
										style="background-image: url('{currentTransitionInfo.nextClip.imageUrl}'); transform: {nextMotion};"
									></div>
								{/if}
								<div
									class="transition-color-dip"
									style="background: #ffffff; opacity: {currentTransitionInfo.progress < 0.5 ? currentTransitionInfo.progress * 2 : (1 - currentTransitionInfo.progress) * 2};"
								></div>
							{:else if currentTransitionInfo.type === 'slideleft'}
								<div
									class="clip-display transition-next-clip"
									style="background-image: url('{currentTransitionInfo.nextClip.imageUrl}'); transform: translateX({(1 - currentTransitionInfo.progress) * 100}%) {nextMotion};"
								></div>
							{:else if currentTransitionInfo.type === 'slideright'}
								<div
									class="clip-display transition-next-clip"
									style="background-image: url('{currentTransitionInfo.nextClip.imageUrl}'); transform: translateX({-(1 - currentTransitionInfo.progress) * 100}%) {nextMotion};"
								></div>
							{:else if currentTransitionInfo.type === 'wipeleft'}
								<div
									class="clip-display transition-next-clip"
									style="background-image: url('{currentTransitionInfo.nextClip.imageUrl}'); clip-path: inset(0 0 0 {(1 - currentTransitionInfo.progress) * 100}%); transform: {nextMotion};"
								></div>
							{:else if currentTransitionInfo.type === 'circlecrop'}
								<div
									class="clip-display transition-next-clip"
									style="background-image: url('{currentTransitionInfo.nextClip.imageUrl}'); clip-path: circle({currentTransitionInfo.progress * 75}% at 50% 50%); transform: {nextMotion};"
								></div>
							{/if}
						{/if}

						<!-- Layer 2+: Overlay Clips (Track V2, V3...) displayed in Picture-In-Picture or Overlay -->
						{#each currentOverlayClips as ovLayer (ovLayer.trackId + ovLayer.index)}
							<div
								class="overlay-pip-box"
								style="background-image: url('{ovLayer.clip.imageUrl}');"
								title="Layer {ovLayer.trackName}: {ovLayer.clip.name}"
								onclick={() => {
									activeVisualTrackId = ovLayer.trackId;
									activeClipIndex = ovLayer.index;
								}}
							>
								<div class="pip-tag">
									<span>{ovLayer.trackName.split(' ')[1] || 'Overlay'}</span>
								</div>
							</div>
						{/each}

						<!-- Live Visual Overlay Effects Layer -->
						{#if currentBaseClip.clip.overlayEffect && currentBaseClip.clip.overlayEffect !== 'none'}
							<div class="fx-overlay-canvas fx-{currentBaseClip.clip.overlayEffect}">
								{#if currentBaseClip.clip.overlayEffect === 'tv_static'}
									<div class="fx-tv-scanlines"></div>
									<div class="fx-tv-noise-anim"></div>
									<div class="fx-vhs-osd">
										<span class="vhs-rec-dot">● REC</span>
										<span class="vhs-sp">PLAY ► SP</span>
									</div>
								{:else if currentBaseClip.clip.overlayEffect === 'no_signal'}
									<div class="fx-smpte-bars"></div>
									<div class="fx-no-signal-modal">
										<div class="no-signal-banner">⚠️ NO SIGNAL</div>
										<div class="no-signal-desc">INPUT DISCONNECTED</div>
									</div>
								{:else if currentBaseClip.clip.overlayEffect === 'fog'}
									<div class="fx-fog-stream fx-fog-a"></div>
									<div class="fx-fog-stream fx-fog-b"></div>
								{:else if currentBaseClip.clip.overlayEffect === 'film_grain'}
									<div class="fx-film-vignette-ring"></div>
									<div class="fx-film-grain-particles"></div>
									<div class="fx-film-hair-scratch"></div>
								{:else if currentBaseClip.clip.overlayEffect === 'light_leak'}
									<div class="fx-light-leak-burst"></div>
								{:else if currentBaseClip.clip.overlayEffect === 'rain'}
									<div class="fx-rain-drop-curtain"></div>
								{/if}
							</div>
						{/if}
					{:else}
						<div class="empty-player">
							<ImageIcon size={48} opacity={0.3} />
							<p>Belum ada klip aktif pada posisi playhead ini</p>
							<div class="empty-actions">
								<button class="btn btn-sm btn-primary" onclick={() => fileInputImages?.click()}>
									<Upload size={14} />
									<span>Import Gambar ke [{currentVisualTrack.name}]</span>
								</button>
								<button class="btn btn-sm btn-secondary" onclick={loadDemoProject}>
									<Sparkles size={14} />
									<span>Muat Contoh Multi-Layer</span>
								</button>
							</div>
						</div>
					{/if}

					<!-- Live Subtitle Overlay Preview -->
					{#if subtitlesEnabled && currentActiveSubtitle}
						<div class="player-subtitle-overlay pos-{subtitlePosition}">
							<div
								class="subtitle-badge-display style-{subtitleStyle}"
								style="transform: scale({subtitleFontScale});"
							>
								<span>{subtitleStyle === 'mrbeast-bold' ? currentActiveSubtitle.text.toUpperCase() : currentActiveSubtitle.text}</span>
							</div>
						</div>
					{/if}

					<!-- Playhead Overlay Indicator -->
					<div class="overlay-timecode">
						<span>{formatTime(currentTime)}</span>
						<span class="time-sep">/</span>
						<span>{formatTime(totalDuration)}</span>
					</div>
				</div>
			</div>

			<!-- Player Control Bar -->
			<div class="player-toolbar">
				<div class="toolbar-left">
					<button class="ctrl-btn" onclick={() => seekTo(0)} title="Kembali ke awal">
						<RotateCcw size={16} />
					</button>
					<button
						class="ctrl-btn play-circle-btn {isPlaying ? 'playing' : ''}"
						onclick={togglePlay}
						title="Play/Pause (Spasi)"
					>
						{#if isPlaying}
							<Pause size={18} fill="currentColor" />
						{:else}
							<Play size={18} fill="currentColor" style="margin-left: 2px;" />
						{/if}
					</button>
					<span class="timer-display">{formatTime(currentTime)}</span>
				</div>

				<div class="toolbar-center">
					<div
						class="mini-scrubber"
						onclick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							const pct = (e.clientX - rect.left) / rect.width;
							seekTo(pct * totalDuration);
						}}
					>
						<div
							class="mini-scrubber-fill"
							style="width: {totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%;"
						></div>
					</div>
				</div>

				<div class="toolbar-right">
					<div class="speed-selector">
						<button
							class="speed-pill {playbackSpeed === 1 ? 'active' : ''}"
							onclick={() => (playbackSpeed = 1)}
						>1x</button>
						<button
							class="speed-pill {playbackSpeed === 1.5 ? 'active' : ''}"
							onclick={() => (playbackSpeed = 1.5)}
						>1.5x</button>
						<button
							class="speed-pill {playbackSpeed === 2 ? 'active' : ''}"
							onclick={() => (playbackSpeed = 2)}
						>2x</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Right: Inspector Sidebar -->
		<aside class="inspector-panel">
			<div class="inspector-header">
				<Sliders size={16} />
				<h3>Inspector</h3>
			</div>

			<div class="inspector-tabs">
				<button
					type="button"
					class="insp-tab-btn {activeInspectorTab === 'clip' ? 'active' : ''}"
					onclick={() => (activeInspectorTab = 'clip')}
				>
					<Layers size={13} />
					<span>Klip Visual</span>
				</button>
				<button
					type="button"
					class="insp-tab-btn {activeInspectorTab === 'subtitle' ? 'active' : ''}"
					onclick={() => {
						activeInspectorTab = 'subtitle';
						if (activeSubtitleIndex === -1 && subtitleItems.length > 0) activeSubtitleIndex = 0;
					}}
				>
					<FileText size={13} />
					<span>Subtitle ({subtitleItems.length})</span>
				</button>
			</div>

			<div class="inspector-scroll">
				{#if activeInspectorTab === 'subtitle'}
					<!-- Subtitle Global Preset & Style -->
					<div class="card-section">
						<div class="section-title">
							<Sparkles size={14} class="text-accent" />
							<span>Gaya & Tampilan Subtitle</span>
						</div>

						<div class="field-group">
							<span class="field-label">Status Subtitle:</span>
							<div class="setting-toggle-row">
								<span class="toggle-text">{subtitlesEnabled ? 'Subtitle Ditampilkan' : 'Subtitle Disembunyikan'}</span>
								<button
									type="button"
									class="btn btn-xs {subtitlesEnabled ? 'btn-primary' : 'btn-secondary'}"
									onclick={() => (subtitlesEnabled = !subtitlesEnabled)}
								>
									{subtitlesEnabled ? 'ON' : 'OFF'}
								</button>
							</div>
						</div>

						<div class="field-group">
							<span class="field-label">Preset Gaya:</span>
							<div class="style-preset-grid">
								<button
									type="button"
									class="style-preset-card {subtitleStyle === 'viral-yellow' ? 'active' : ''}"
									onclick={() => (subtitleStyle = 'viral-yellow')}
								>
									<span class="preset-name">🔥 Viral Yellow</span>
									<span class="preset-desc">Kuning tebal & outline hitam tajam</span>
								</button>
								<button
									type="button"
									class="style-preset-card {subtitleStyle === 'mrbeast-bold' ? 'active' : ''}"
									onclick={() => (subtitleStyle = 'mrbeast-bold')}
								>
									<span class="preset-name">⚡ MrBeast Bold</span>
									<span class="preset-desc">Huruf besar putih tebal & stroke dinamis</span>
								</button>
								<button
									type="button"
									class="style-preset-card {subtitleStyle === 'minimal' ? 'active' : ''}"
									onclick={() => (subtitleStyle = 'minimal')}
								>
									<span class="preset-name">✨ Minimal Clean</span>
									<span class="preset-desc">Putih elegan berlatar kapsul transparan</span>
								</button>
							</div>
						</div>

						<div class="field-group">
							<span class="field-label">Tata Letak (Posisi):</span>
							<div class="ratio-pills">
								<button
									type="button"
									class="ratio-pill {subtitlePosition === 'bottom' ? 'active' : ''}"
									onclick={() => (subtitlePosition = 'bottom')}
								>
									Bawah
								</button>
								<button
									type="button"
									class="ratio-pill {subtitlePosition === 'center' ? 'active' : ''}"
									onclick={() => (subtitlePosition = 'center')}
								>
									Tengah
								</button>
								<button
									type="button"
									class="ratio-pill {subtitlePosition === 'top' ? 'active' : ''}"
									onclick={() => (subtitlePosition = 'top')}
								>
									Atas
								</button>
							</div>
						</div>

						<div class="field-group">
							<div class="field-header-row">
								<span class="field-label">Ukuran Font:</span>
								<span class="badge-scale">{subtitleFontScale.toFixed(1)}x</span>
							</div>
							<input
								type="range"
								min="0.7"
								max="2.0"
								step="0.1"
								bind:value={subtitleFontScale}
								class="range-slider"
							/>
						</div>
					</div>

					<!-- Selected Subtitle Editor -->
					<div class="card-section">
						<div class="section-title">
							<FileText size={14} class="text-primary" />
							<span>{activeSubtitle ? `Edit Subtitle #${activeSubtitleIndex + 1}` : 'Detail Subtitle'}</span>
						</div>

						{#if activeSubtitle}
							<div class="sub-edit-form">
								<div class="field-group">
									<label class="field-label" for="sub-text-input">Teks Subtitle:</label>
									<textarea
										id="sub-text-input"
										class="prompt-textarea"
										bind:value={activeSubtitle.text}
										rows={3}
										placeholder="Ketik teks kalimat subtitle di sini..."
									></textarea>
								</div>

								<div class="field-row-split">
									<div class="field-group">
										<label class="field-label" for="sub-start-input">Mulai (s):</label>
										<div class="timing-input-wrap">
											<input
												id="sub-start-input"
												type="number"
												step="0.1"
												min="0"
												bind:value={activeSubtitle.start}
												onchange={() => {
													activeSubtitle.duration = Number((activeSubtitle.end - activeSubtitle.start).toFixed(2));
													subtitleItems = [...subtitleItems];
												}}
												class="dur-input"
											/>
										</div>
									</div>

									<div class="field-group">
										<label class="field-label" for="sub-end-input">Selesai (s):</label>
										<div class="timing-input-wrap">
											<input
												id="sub-end-input"
												type="number"
												step="0.1"
												min="0.1"
												bind:value={activeSubtitle.end}
												onchange={() => {
													activeSubtitle.duration = Number((activeSubtitle.end - activeSubtitle.start).toFixed(2));
													subtitleItems = [...subtitleItems];
												}}
												class="dur-input"
											/>
										</div>
									</div>
								</div>

								<div class="sub-actions-row">
									<button
										type="button"
										class="btn btn-xs btn-secondary"
										onclick={() => seekTo(activeSubtitle.start, true)}
										title="Pindahkan playhead ke awal subtitle ini"
									>
										<Play size={11} />
										<span>Jump to Playhead</span>
									</button>
									<div class="sub-nav-btns">
										<button
											type="button"
											class="btn btn-xs btn-secondary"
											disabled={activeSubtitleIndex <= 0}
											onclick={() => {
												activeSubtitleIndex--;
												seekTo(subtitleItems[activeSubtitleIndex].start, true);
											}}
											title="Subtitle sebelumnya"
										>
											<ChevronLeft size={12} />
										</button>
										<button
											type="button"
											class="btn btn-xs btn-secondary"
											disabled={activeSubtitleIndex >= subtitleItems.length - 1}
											onclick={() => {
												activeSubtitleIndex++;
												seekTo(subtitleItems[activeSubtitleIndex].start, true);
											}}
											title="Subtitle berikutnya"
										>
											<ChevronRight size={12} />
										</button>
									</div>
								</div>

								<button
									type="button"
									class="btn btn-xs btn-danger-glow w-100 mt-2"
									onclick={() => deleteSubtitle(activeSubtitleIndex)}
								>
									<Trash2 size={12} />
									<span>Hapus Subtitle Ini</span>
								</button>
							</div>
						{:else}
							<div class="empty-sub-select">
								<p>Pilih salah satu blok subtitle di timeline untuk mengedit teks atau durasi.</p>
							</div>
						{/if}
					</div>

					<!-- Subtitle Tools & Auto-generator -->
					<div class="card-section">
						<div class="section-title">
							<Sparkles size={14} />
							<span>Alat Cepat Subtitle</span>
						</div>

						<div class="sub-tools-actions">
							<button type="button" class="btn btn-sm btn-primary w-100" onclick={addEmptySubtitle}>
								<Plus size={14} />
								<span>Tambah Subtitle di Posisi Playhead</span>
							</button>

							<button
								type="button"
								class="btn btn-sm btn-gradient-ai w-100"
								onclick={handleGenerateSubtitles}
								disabled={isGeneratingSubtitles}
							>
								<Sparkles size={14} class={isGeneratingSubtitles ? 'spin-icon' : ''} />
								<span>{isGeneratingSubtitles ? 'Mentranskripsi Audio...' : 'Generate AI Whisper (Track A1)'}</span>
							</button>

							{#if subtitleItems.length > 0}
								<button type="button" class="btn btn-xs btn-outline-danger w-100" onclick={clearAllSubtitles}>
									<Trash2 size={12} />
									<span>Hapus Semua Subtitle ({subtitleItems.length})</span>
								</button>
							{/if}
						</div>
					</div>

					<!-- All Subtitles Mini List -->
					{#if subtitleItems.length > 0}
						<div class="card-section">
							<div class="section-title">
								<ListOrdered size={14} />
								<span>Daftar Subtitle ({subtitleItems.length})</span>
							</div>

							<div class="sub-list-container">
								{#each subtitleItems as sub, idx}
									<div
										class="sub-list-item {activeSubtitleIndex === idx ? 'active' : ''}"
										onclick={() => {
											activeSubtitleIndex = idx;
											seekTo(sub.start, true);
										}}
										role="button"
										tabindex="0"
										onkeydown={(e) => { if (e.key === 'Enter') { activeSubtitleIndex = idx; seekTo(sub.start, true); } }}
									>
										<span class="sub-list-num">#{idx + 1}</span>
										<span class="sub-list-time">{formatTime(sub.start)} - {formatTime(sub.end)}</span>
										<span class="sub-list-snippet">{sub.text || '(Kosong)'}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
				<!-- Layer Tracker Switcher -->
				<div class="card-section">
					<div class="section-title">
						<Layers size={14} />
						<span>Pilih Track Visual Aktif</span>
					</div>
					<div class="track-selector-pills">
						{#each visualTracks as vt}
							<button
								class="track-pill {activeVisualTrackId === vt.id ? 'active' : ''}"
								onclick={() => {
									activeVisualTrackId = vt.id;
									activeClipIndex = 0;
								}}
							>
								<span>{vt.name}</span>
								<span class="pill-count">({vt.clips.length})</span>
							</button>
						{/each}
					</div>
				</div>

				{#if activeClip}
					<div class="card-section">
						<div class="section-title">
							<span>Klip [{currentVisualTrack.name}] (#{activeClip.sceneNumber || activeClipIndex + 1})</span>
							<span class="file-tag">{activeClip.name}</span>
						</div>

						<div class="thumb-preview-box">
							{#if activeClip.imageUrl}
								<img src={activeClip.imageUrl} alt={activeClip.name} class="thumb-img" />
								<button class="btn btn-xs btn-secondary btn-replace-thumb" onclick={() => triggerSingleClipReplace(activeClipIndex)}>
									<Upload size={12} />
									<span>Ganti Gambar</span>
								</button>
							{:else}
								<div class="thumb-placeholder-box" onclick={() => triggerSingleClipReplace(activeClipIndex)}>
									<ImageIcon size={28} opacity={0.4} />
									<span class="ph-box-title">Scene #{activeClip.sceneNumber || activeClipIndex + 1} (Kosong)</span>
									<span class="ph-box-sub">Klik untuk unggah gambar</span>
									<button class="btn btn-xs btn-primary mt-1">Unggah Gambar</button>
								</div>
							{/if}
						</div>

						{#if activeClip.narration || activeClip.prompt}
							<div class="storyboard-clip-panel">
								{#if activeClip.narration}
									<div class="clip-narration-box">
										<span class="clip-panel-label">🎙️ Narasi Audio:</span>
										<p class="clip-narration-text">"{activeClip.narration}"</p>
									</div>
								{/if}
								{#if activeClip.prompt}
									<div class="clip-prompt-box">
										<div class="clip-panel-header">
											<span class="clip-panel-label">✨ Visual Prompt:</span>
											<button class="btn btn-xs btn-secondary" onclick={() => copySinglePrompt(activeClip.prompt, activeClipIndex)}>
												<Copy size={11} />
												<span>{copiedSceneIdx === activeClipIndex ? 'Disalin ✓' : 'Copy'}</span>
											</button>
										</div>
										<textarea class="prompt-textarea" bind:value={activeClip.prompt} rows={3}></textarea>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Durasi Pengaturan -->
						<div class="setting-row">
							<div class="label-group">
								<span class="setting-label">Durasi Klip Ini:</span>
								<span class="setting-val-highlight">{activeClip.duration}s</span>
							</div>
							<div class="duration-control-inputs">
								<input
									type="range"
									min="0.5"
									max="30"
									step="0.1"
									bind:value={activeClip.duration}
									class="slider-range"
								/>
								<div class="numeric-stepper">
									<button
										class="step-btn"
										onclick={() => updateClipDuration(activeClipIndex, activeClip.duration - 0.5)}
									>-0.5s</button>
									<input
										type="number"
										min="0.5"
										max="60"
										step="0.1"
										bind:value={activeClip.duration}
										class="number-input"
									/>
									<button
										class="step-btn"
										onclick={() => updateClipDuration(activeClipIndex, activeClip.duration + 0.5)}
									>+0.5s</button>
								</div>
							</div>

							<!-- Quick Preset Buttons -->
							<div class="preset-dur-pills">
								{#each [1, 2, 3, 5, 8, 10] as durSec}
									<button
										class="dur-pill {activeClip.duration === durSec ? 'active' : ''}"
										onclick={() => updateClipDuration(activeClipIndex, durSec)}
									>
										{durSec}s
									</button>
								{/each}
							</div>
						</div>

						<!-- 1. Motion Animation Effect -->
						<div class="setting-group-box">
							<div class="setting-row">
								<span class="setting-label">
									<Sliders size={13} class="text-primary" />
									<span>Animasi Gerak:</span>
								</span>
								<select bind:value={activeClip.motionEffect} class="select-input">
									<option value="none">⏹️ Diam (Static)</option>
									<option value="zoom_in">🔍 Ken Burns Zoom In</option>
									<option value="zoom_out">🔎 Ken Burns Zoom Out</option>
									<option value="pan_left">⬅️ Geser Halus Kiri</option>
									<option value="pan_right">➡️ Geser Halus Kanan</option>
									<option value="diagonal_drift">↗️ Diagonal Drift (Miring Dinamis)</option>
									<option value="camera_shake">📳 Guncangan Kamera (Shake)</option>
									<option value="pulse_pop">💓 Detak Halus (Pulse / Pop)</option>
								</select>
							</div>
							<div class="setting-btn-row">
								<button
									class="btn btn-xs btn-secondary"
									onclick={() => applyMotionToAll(activeClip.motionEffect || 'none')}
									title="Terapkan animasi ini ke semua klip di track visual"
								>
									Terapkan ke Semua Klip
								</button>
								<button
									class="btn btn-xs btn-secondary text-accent"
									onclick={smartAlternateMotion}
									title="Variasikan gerakan otomatis (Zoom In, Pan, Zoom Out...) di seluruh klip"
								>
									🎲 Variasi Otomatis
								</button>
							</div>
						</div>

						<!-- 2. Transition to Next Scene -->
						<div class="setting-group-box">
							<div class="setting-row">
								<span class="setting-label">
									<Sparkles size={13} class="text-accent" />
									<span>Transisi Scene:</span>
								</span>
								<select bind:value={activeClip.transitionType} class="select-input">
									<option value="none">⏹️ Cut Langsung (Tanpa Transisi)</option>
									<option value="fade">🌫️ Crossfade / Dissolve Halus</option>
									<option value="fadeblack">⬛ Dip to Black (Layar Hitam)</option>
									<option value="fadewhite">⬜ Dip to White (Flash Terang)</option>
									<option value="slideleft">⬅️ Geser Kiri (Slide Left)</option>
									<option value="slideright">➡️ Geser Kanan (Slide Right)</option>
									<option value="wipeleft">🧹 Sapu Kiri (Wipe Left)</option>
									<option value="circlecrop">⭕ Iris Lingkaran (Circle Crop)</option>
								</select>
							</div>

							{#if activeClip.transitionType && activeClip.transitionType !== 'none'}
								<div class="setting-row sub-row">
									<span class="setting-label-sm">Durasi Transisi:</span>
									<div class="slider-with-val">
										<input
											type="range"
											min="0.2"
											max="1.5"
											step="0.1"
											bind:value={activeClip.transitionDuration}
											class="slider-range-sm"
										/>
										<span class="sub-val-badge">{activeClip.transitionDuration || 0.5}s</span>
									</div>
								</div>
							{/if}

							<div class="setting-btn-row">
								<button
									class="btn btn-xs btn-secondary"
									onclick={() => applyTransitionToAll(activeClip.transitionType || 'fade', activeClip.transitionDuration || 0.5)}
									title="Terapkan transisi ini ke semua sambungan antar scene"
								>
									🔗 Terapkan Transisi ke Semua Sambungan
								</button>
							</div>
						</div>

						<!-- 3. Overlay Effect (Opsi A) -->
						<div class="setting-group-box">
							<div class="setting-row">
								<span class="setting-label">
									<Film size={13} class="text-warning" />
									<span>Overlay Effect:</span>
								</span>
								<select bind:value={activeClip.overlayEffect} class="select-input">
									<option value="none">⏹️ Tanpa Overlay (Normal)</option>
									<option value="tv_static">📺 TV Rusak / VHS Glitch (Scanlines & Noise)</option>
									<option value="no_signal">📡 Sinyal Hilang (SMPTE Bars & Alert)</option>
									<option value="fog">🌫️ Berkabut / Misty Haze (Kabut Sinematik)</option>
									<option value="film_grain">🎬 Film Lawas 8mm & Grain Vintage</option>
									<option value="light_leak">⚡ Light Leaks (Kilatan Cahaya Lensa)</option>
									<option value="rain">🌧️ Hujan / Rain Streaks</option>
								</select>
							</div>
							<div class="setting-btn-row">
								<button
									class="btn btn-xs btn-secondary"
									onclick={() => applyOverlayToAll(activeClip.overlayEffect || 'none')}
									title="Terapkan efek overlay ini ke semua klip di track visual"
								>
									🎨 Terapkan ke Semua Klip
								</button>
								{#if activeClip.overlayEffect && activeClip.overlayEffect !== 'none'}
									<button
										class="btn btn-xs btn-secondary text-danger"
										onclick={clearAllOverlays}
										title="Hapus overlay dari semua klip"
									>
										🧹 Bersihkan Semua
									</button>
								{/if}
							</div>
						</div>

						<!-- Clip Actions -->
						<div class="clip-actions-grid">
							<button
								class="btn btn-sm btn-secondary"
								onclick={() => moveClip(activeClipIndex, -1)}
								disabled={activeClipIndex === 0}
							>
								<ChevronLeft size={14} />
								<span>Kiri</span>
							</button>
							<button
								class="btn btn-sm btn-secondary"
								onclick={() => moveClip(activeClipIndex, 1)}
								disabled={activeClipIndex === currentVisualTrack.clips.length - 1}
							>
								<span>Kanan</span>
								<ChevronRight size={14} />
							</button>
							<button
								class="btn btn-sm btn-secondary"
								onclick={() => duplicateClip(activeClipIndex)}
							>
								<Copy size={14} />
								<span>Duplikat</span>
							</button>
							<button
								class="btn btn-sm btn-danger"
								onclick={() => deleteClip(activeClipIndex)}
							>
								<Trash2 size={14} />
								<span>Hapus</span>
							</button>
						</div>
					</div>
				{:else}
					<div class="empty-inspector">
						<ImageIcon size={32} opacity={0.3} />
						<p>Pilih klip pada timeline untuk mengedit durasi & efek.</p>
					</div>
				{/if}

				<!-- Multi Audio Tracks Overview -->
				<div class="card-section">
					<div class="section-title">
						<Music size={15} />
						<span>Multi-Track Audio ({audioTracks.length} Layer)</span>
					</div>

					<div class="audio-tracks-vertical">
						{#each audioTracks as at, aIdx}
							<div class="audio-track-item-card">
								<div class="at-header">
									<div class="at-name-box">
										<button
											class="mute-btn-mini {at.isMuted ? 'muted' : ''}"
											onclick={() => (at.isMuted = !at.isMuted)}
											title={at.isMuted ? 'Unmute' : 'Mute'}
										>
											{#if at.isMuted}
												<VolumeX size={13} />
											{:else}
												<Volume2 size={13} />
											{/if}
										</button>
										<span class="at-title">{at.name}</span>
									</div>
									{#if aIdx > 0}
										<button
											class="delete-track-btn"
											onclick={() => removeAudioTrack(at.id)}
											title="Hapus track audio ini"
										>
											<Trash2 size={12} />
										</button>
									{/if}
								</div>

								{#if at.audioUrl}
									<div class="at-body">
										<span class="at-filename" title={at.audioName}>{at.audioName}</span>
										<div class="at-controls-row">
											<input
												type="range"
												min="0"
												max="1"
												step="0.05"
												bind:value={at.volume}
												class="slider-range mini-slider"
											/>
											<span class="at-vol-pct">{Math.round(at.volume * 100)}%</span>
											<button
												class="btn btn-xs btn-ghost text-danger"
												onclick={() => clearTrackAudio(at.id)}
											>
												Hapus
											</button>
										</div>
									</div>
								{:else}
									<button
										class="btn btn-xs btn-secondary add-audio-btn"
										onclick={() => openAudioPicker(at.id)}
									>
										<Upload size={12} />
										<span>Pilih Audio untuk Track Ini</span>
									</button>
								{/if}
							</div>
						{/each}

						<button class="btn btn-xs btn-secondary w-full" onclick={addAudioTrack}>
							<Plus size={13} />
							<span>Tambah Track Audio Baru</span>
						</button>
					</div>
				</div>

				<!-- Render Format -->
				<div class="card-section">
					<div class="section-title">
						<Video size={15} />
						<span>Format Video</span>
					</div>

					<div class="ratio-pills">
						<button
							class="ratio-pill {aspectRatio === '16:9' ? 'active' : ''}"
							onclick={() => (aspectRatio = '16:9')}
						>
							16:9 Landscape
						</button>
						<button
							class="ratio-pill {aspectRatio === '9:16' ? 'active' : ''}"
							onclick={() => (aspectRatio = '9:16')}
						>
							9:16 Shorts
						</button>
						<button
							class="ratio-pill {aspectRatio === '1:1' ? 'active' : ''}"
							onclick={() => (aspectRatio = '1:1')}
						>
							1:1 Square
						</button>
					</div>
				</div>
				{/if}
			</div>
		</aside>
	</div>

	<!-- Bottom Interactive Multi-Track Timeline -->
	<footer class="timeline-container">
		<!-- Timeline Toolbar -->
		<div class="timeline-bar">
			<div class="timeline-left-actions">
				<button
					class="btn btn-sm btn-primary-ai"
					onclick={() => (showAiStoryboardModal = true)}
					title="Upload audio narasi & generate prompt visual tiap scene"
				>
					<Sparkles size={14} />
					<span>AI Storyboard (Audio)</span>
				</button>
				<button
					class="btn btn-sm btn-accent-bulk"
					onclick={openBulkImagePicker}
					title="Impor banyak gambar sekaligus (otomatis mencocokkan nomor file 1..N ke scene)"
				>
					<Upload size={14} />
					<span>Bulk Import Gambar</span>
				</button>
				<button class="btn btn-sm btn-secondary" onclick={() => fileInputImages?.click()}>
					<Plus size={14} />
					<span>+ Gambar Biasa</span>
				</button>
				<button class="btn btn-sm btn-secondary" onclick={addVisualTrack}>
					<Layers size={14} />
					<span>+ Track V</span>
				</button>
				<button class="btn btn-sm btn-secondary" onclick={addAudioTrack}>
					<Music size={14} />
					<span>+ Track A</span>
				</button>
				<button
					type="button"
					class="btn btn-sm {subtitleItems.length > 0 ? 'btn-accent-subtitle-pill' : 'btn-secondary'}"
					onclick={() => {
						subtitleTrackVisible = true;
						activeInspectorTab = 'subtitle';
						if (activeSubtitleIndex === -1 && subtitleItems.length > 0) activeSubtitleIndex = 0;
					}}
					title="Buka Track Subtitle & Auto-Caption"
				>
					<FileText size={14} />
					<span>Subtitle ({subtitleItems.length})</span>
				</button>
				<button
					type="button"
					class="btn btn-sm btn-gradient-ai"
					onclick={handleGenerateSubtitles}
					disabled={isGeneratingSubtitles}
					title="Auto-Generate Subtitle dengan AI Whisper dari Audio Track A1"
				>
					<Sparkles size={14} class={isGeneratingSubtitles ? 'spin-icon' : ''} />
					<span>{isGeneratingSubtitles ? 'Transcribing...' : '+ Subtitle AI'}</span>
				</button>

				{#if placeholderStats.hasPlaceholders}
					<div class="placeholder-quick-actions">
						<button
							class="btn btn-xs btn-outline-warning"
							onclick={copyAllPrompts}
							title="Salin seluruh prompt untuk di-paste ke Midjourney/Leonardo"
						>
							<Copy size={12} />
							<span>{copiedAllPromptsStatus ? 'Tersalin! ✅' : `Copy Semua Prompt (${placeholderStats.unassigned})`}</span>
						</button>
					</div>
				{/if}

				{#if durationMismatch}
					<div class="mismatch-sync-pill">
						<span class="mismatch-text">
							⚠️ Visual ({formatTime(durationMismatch.visualDur)}) ≠ Audio ({formatTime(durationMismatch.audioDur)})
						</span>
						<button
							class="btn btn-xs btn-warning-glow"
							onclick={fitVisualToAudio}
							title="Otomatis skalakan durasi semua scene visual agar sama persis dengan audio (1:1)"
						>
							🔗 Samakan Durasi Visual ke Audio
						</button>
						{#if durationMismatch.isVisualShorter}
							<button
								class="btn btn-xs btn-secondary"
								onclick={extendLastClipToAudio}
								title="Perpanjang scene terakhir sampai akhir audio"
							>
								➕ Perpanjang Scene Terakhir
							</button>
						{/if}
					</div>
				{/if}

				<!-- Sorting Options: Nama vs Timestamp Download -->
				<div class="sort-selector-group">
					<span class="sort-label">Urutkan:</span>
					<button
						class="btn btn-xs sort-pill {sortMethod === 'name' ? 'active' : ''}"
						onclick={() => sortClips('name')}
						title="Urutkan menurut nama file angka alami (1, 2, 3.. 10...)"
					>
						Nama (1..N)
					</button>
					<button
						class="btn btn-xs sort-pill {sortMethod === 'date_asc' ? 'active' : ''}"
						onclick={() => sortClips('date_asc')}
						title="Urutkan menurut waktu download/created terlama ke terbaru (Oldest first)"
					>
						🕒 Waktu (Terlama ⏩)
					</button>
					<button
						class="btn btn-xs sort-pill {sortMethod === 'date_desc' ? 'active' : ''}"
						onclick={() => sortClips('date_desc')}
						title="Urutkan menurut waktu download/created terbaru ke terlama (Newest first)"
					>
						🕒 Waktu (Terbaru ⏪)
					</button>
				</div>
			</div>

			<!-- Default Duration Global Settings -->
			<div class="default-duration-box">
				<span class="box-label">Default Durasi:</span>
				<input
					type="number"
					min="0.5"
					max="30"
					step="0.5"
					bind:value={defaultDuration}
					class="dur-input"
				/>
				<span class="dur-unit">detik</span>
				<button
					class="btn btn-xs btn-secondary"
					onclick={applyDefaultDurationToAll}
					title="Ubah durasi semua gambar di track aktif menjadi nilai ini"
				>
					Terapkan ke Track Aktif
				</button>
			</div>

			<div class="timeline-right-actions">
				<!-- Quick Jump Minute Navigator -->
				<div class="quick-jump-group">
					<span class="qj-label">Lompat:</span>
					<button
						type="button"
						class="btn btn-xs btn-jump-pill"
						onclick={() => seekTo(Math.max(0, currentTime - 60), true)}
						title="Lompat mundur 1 menit (-60s)"
					>
						⏪ -1m
					</button>
					<button
						type="button"
						class="btn btn-xs btn-jump-pill"
						onclick={() => seekTo(Math.min(totalDuration, currentTime + 60), true)}
						title="Lompat maju 1 menit (+60s)"
					>
						⏩ +1m
					</button>
					{#if quickJumpMinutes.length > 2}
						<div class="minute-chips-wrap">
							{#each quickJumpMinutes as sec}
								<button
									type="button"
									class="btn btn-xs chip-jump {Math.abs(currentTime - sec) < 25 ? 'active' : ''}"
									onclick={() => seekTo(sec, true)}
									title="Lompat langsung ke menit {Math.floor(sec / 60)} ({formatTime(sec)})"
								>
									{Math.floor(sec / 60)}m
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Zoom to Fit Button -->
				<button
					type="button"
					class="btn btn-xs btn-fit-screen"
					onclick={zoomToFit}
					title="Fit Timeline: Skalakan durasi agar seluruh timeline (0m..{Math.ceil(totalDuration/60)}m) pas 100% di layar"
				>
					<Maximize2 size={13} />
					<span>Fit Layar</span>
				</button>

				<div class="zoom-controller">
					<ZoomOut size={14} opacity={0.6} />
					<input
						type="range"
						min="1"
						max="120"
						step="1"
						bind:value={pxPerSec}
						class="zoom-slider"
						title="Zoom skala timeline (1px - 120px per detik)"
					/>
					<ZoomIn size={14} opacity={0.6} />
					<span class="zoom-px-label">{pxPerSec}px/s</span>
				</div>
			</div>
		</div>

		<!-- TIMELINE OVERVIEW MINIMAP / PAN NAVIGATOR BAR -->
		<div class="timeline-minimap-bar">
			<div class="minimap-header-col">
				<span class="minimap-tag">NAVIGATOR</span>
				<span class="minimap-total-time">{formatTime(totalDuration)}</span>
			</div>
			<div
				class="minimap-track-area"
				bind:this={minimapTrackEl}
				onmousedown={handleMinimapMouseDown}
				role="slider"
				tabindex="0"
				aria-label="Timeline Minimap Navigator"
				aria-valuenow={currentTime}
				aria-valuemin={0}
				aria-valuemax={totalDuration}
			>
				<!-- Minute Ticks & Timecode Grid -->
				<div class="minimap-marks">
					{#each minimapMinuteTicks as tick}
						<div class="minimap-tick" style="left: {tick.pct}%;">
							<div class="minimap-tick-line"></div>
							<span class="minimap-tick-label">{tick.label}</span>
						</div>
					{/each}
				</div>

				<!-- Layers Mini Overview Preview -->
				<div class="minimap-layers-preview">
					<!-- Visual Track 0 Blocks -->
					<div class="minimap-visual-strip">
						{#each visualTracks[0]?.clips || [] as clip, cIdx}
							{@const clipStart = getClipStartTime(0, cIdx)}
							{@const leftPct = totalDuration > 0 ? (clipStart / totalDuration) * 100 : 0}
							{@const widthPct = totalDuration > 0 ? (clip.duration / totalDuration) * 100 : 0}
							<div
								class="minimap-clip-block"
								style="left: {leftPct}%; width: {widthPct}%;"
								title="Scene #{clip.sceneNumber || cIdx + 1}: {clip.name} ({clip.duration}s)"
							></div>
						{/each}
					</div>

					<!-- Audio Track 0 Waveform Strip -->
					{#if audioTracks[0]?.audioUrl}
						{@const audioDur = Number(audioTracks[0].audioDuration || totalDuration)}
						<div
							class="minimap-audio-strip"
							style="width: {totalDuration > 0 ? (audioDur / totalDuration) * 100 : 100}%;"
							title="Audio Narasi ({formatTime(audioDur)})"
						></div>
					{/if}
				</div>

				<!-- Viewport Window (Draggable Zoom & Pan Window) -->
				<div
					class="minimap-viewport-window"
					style="left: {minimapViewportLeft}%; width: {minimapViewportWidth}%;"
				>
					<div class="viewport-handle left-handle"></div>
					<span class="viewport-label">
						{formatTime(scrollLeft / pxPerSec)} - {formatTime((scrollLeft + (timelineScrollEl?.clientWidth || 800) - 120) / pxPerSec)}
					</span>
					<div class="viewport-handle right-handle"></div>
				</div>

				<!-- Playhead indicator line in Minimap -->
				<div
					class="minimap-playhead"
					style="left: {totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%;"
				>
					<div class="minimap-playhead-head"></div>
				</div>
			</div>
		</div>

		<!-- Scrollable Tracks Workspace -->
		<div
			class="timeline-scrollable"
			bind:this={timelineScrollEl}
			onscroll={(e) => (scrollLeft = e.currentTarget.scrollLeft)}
		>
			<div class="tracks-inner" style="min-width: {Math.max(1000, totalDuration * pxPerSec + 250)}px;">
				<!-- Time Ruler Track -->
				<div class="ruler-track">
					<!-- Sticky Header matching track header column -->
					<div class="track-header-fixed ruler-header-fixed">
						<div class="th-main-title">
							<Clock size={12} class="text-primary" />
							<span class="ruler-header-title">TIMELINE</span>
						</div>
					</div>

					<!-- Scrollable Ruler Content & Marks -->
					<div
						class="ruler-content"
						bind:this={timelineRulerContentEl}
						onmousedown={handleRulerMouseDown}
						role="slider"
						tabindex="0"
						aria-label="Timeline scrubber"
						aria-valuenow={currentTime}
						aria-valuemin={0}
						aria-valuemax={totalDuration}
					>
						{#each Array(Math.ceil((totalDuration + 20) / rulerInterval) + 1) as _, idx}
							{@const sec = idx * rulerInterval}
							<div class="ruler-mark major-mark" style="left: {sec * pxPerSec}px;">
								<div class="ruler-line major-line"></div>
								<span class="ruler-text">{formatTime(sec)}</span>
							</div>
							{#if rulerInterval >= 5}
								{#each [1, 2, 3, 4] as sub}
									{@const subSec = sec + (sub * rulerInterval) / 5}
									{#if subSec <= totalDuration + 15}
										<div class="ruler-mark minor-mark" style="left: {subSec * pxPerSec}px;">
											<div class="ruler-line minor-line"></div>
										</div>
									{/if}
								{/each}
							{/if}
						{/each}

						<!-- Playhead Needle -->
						<div
							class="playhead-needle"
							style="left: {currentTime * pxPerSec}px; opacity: {currentTime * pxPerSec < (scrollLeft - 10) ? 0 : 1};"
						>
							<div class="playhead-handle">
								<span>{formatTime(currentTime)}</span>
							</div>
							<div class="playhead-line"></div>
						</div>
					</div>
				</div>

				<!-- Subtitle Track (Track T1) -->
				{#if subtitleTrackVisible}
					<div class="track-row subtitle-track">
						<div class="track-header-fixed">
							<div class="th-main-title">
								<FileText size={13} class="text-accent-subtitle" />
								<span class="th-title-text">T1 Subtitle</span>
								<span class="sub-count-badge">{subtitleItems.length}</span>
							</div>

							<div class="th-controls">
								<button
									type="button"
									class="th-icon-btn {subtitlesEnabled ? 'active' : ''}"
									onclick={() => (subtitlesEnabled = !subtitlesEnabled)}
									title={subtitlesEnabled ? 'Sembunyikan subtitle overlay' : 'Tampilkan subtitle overlay'}
								>
									{#if subtitlesEnabled}
										<Eye size={12} />
									{:else}
										<EyeOff size={12} />
									{/if}
								</button>
								<button
									type="button"
									class="th-icon-btn text-accent-btn"
									onclick={addEmptySubtitle}
									title="Tambah subtitle di posisi playhead"
								>
									<Plus size={12} />
								</button>
							</div>
						</div>

						<div class="track-content-flow subtitle-content-flow">
							{#if subtitleItems.length === 0}
								<div class="subtitle-track-empty" onclick={addEmptySubtitle} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter') addEmptySubtitle(); }}>
									<Sparkles size={13} class="text-accent" />
									<span>Belum ada subtitle. Klik di sini atau tombol "+ Subtitle AI" untuk generate otomatis dari suara</span>
								</div>
							{:else}
								{#each subtitleItems as sub, sIdx}
									<div
										class="subtitle-block {activeSubtitleIndex === sIdx ? 'active-sub-block' : ''} {currentTime >= sub.start && currentTime <= sub.end ? 'current-playback-sub' : ''}"
										style="left: {sub.start * pxPerSec}px; width: {Math.max(28, (sub.end - sub.start) * pxPerSec)}px;"
										onclick={(e) => {
											e.stopPropagation();
											activeSubtitleIndex = sIdx;
											activeInspectorTab = 'subtitle';
										}}
										role="button"
										tabindex="0"
										onkeydown={(e) => { if (e.key === 'Enter') { activeSubtitleIndex = sIdx; activeInspectorTab = 'subtitle'; } }}
									>
										<!-- Left Drag Resize Handle -->
										<div
											class="sub-resize-handle handle-left"
											onmousedown={(e) => startResizeSubtitle(e, sIdx, 'left')}
											title="Geser waktu mulai subtitle"
											role="separator"
											tabindex="0"
										></div>

										<div class="subtitle-block-text" title="{sub.text} ({sub.start.toFixed(1)}s - {sub.end.toFixed(1)}s)">
											<span class="sub-index">#{sIdx + 1}</span>
											<span class="sub-label">{sub.text || '(Kosong)'}</span>
										</div>

										<!-- Right Drag Resize Handle -->
										<div
											class="sub-resize-handle handle-right"
											onmousedown={(e) => startResizeSubtitle(e, sIdx, 'right')}
											title="Geser waktu selesai subtitle"
											role="separator"
											tabindex="0"
										></div>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/if}

				<!-- Multi-layer Visual Tracks (Stacked top to bottom) -->
				{#each visualTracks as vt, vIdx}
					<div
						class="track-row visual-track {activeVisualTrackId === vt.id ? 'active-track-row' : ''}"
						onclick={() => (activeVisualTrackId = vt.id)}
					>
						<div class="track-header-fixed">
							<div class="th-main-title">
								<ImageIcon size={13} />
								<span class="th-title-text">{vt.name.split(' ')[0]}</span>
							</div>

							<div class="th-controls">
								<button
									class="th-icon-btn {vt.isVisible ? 'active' : ''}"
									onclick={(e) => {
										e.stopPropagation();
										vt.isVisible = !vt.isVisible;
										visualTracks = [...visualTracks];
									}}
									title={vt.isVisible ? 'Sembunyikan layer visual' : 'Tampilkan layer visual'}
								>
									{#if vt.isVisible}
										<Eye size={12} />
									{:else}
										<EyeOff size={12} />
									{/if}
								</button>

								{#if vIdx > 0}
									<button
										class="th-icon-btn text-danger"
										onclick={(e) => {
											e.stopPropagation();
											removeVisualTrack(vt.id);
										}}
										title="Hapus layer visual ini"
									>
										<Trash2 size={12} />
									</button>
								{/if}
							</div>
						</div>

						<div class="track-content-flow">
							{#if vt.clips.length}
								{#each vt.clips as clip, i}
									<div
										class="clip-card {activeVisualTrackId === vt.id && activeClipIndex === i ? 'active-clip' : ''} {!clip.imageUrl || clip.isPlaceholder ? 'is-placeholder-clip' : ''}"
										style="width: {clip.duration * pxPerSec}px;"
										onclick={(e) => {
											e.stopPropagation();
											activeVisualTrackId = vt.id;
											activeClipIndex = i;
										}}
									>
										<div class="clip-thumb-preview">
											{#if clip.imageUrl}
												<img src={clip.imageUrl} alt={clip.name} loading="lazy" />
											{:else}
												<div
													class="placeholder-thumb-card"
													onclick={(e) => {
														e.stopPropagation();
														triggerSingleClipReplace(i);
													}}
													title="Scene #{clip.sceneNumber || i + 1} - Klik untuk pasang gambar"
												>
													<span class="ph-mini-icon">🖼️</span>
													<span class="ph-mini-tag">Scene #{clip.sceneNumber || i + 1}</span>
												</div>
											{/if}

											<!-- Badges for Motion & Overlay FX -->
											<div class="clip-badges-float">
												{#if clip.prompt}
													<button
														class="badge-mini badge-copy-prompt"
														title="Salin Prompt Scene #{clip.sceneNumber || i + 1}"
														onclick={(e) => {
															e.stopPropagation();
															copySinglePrompt(clip.prompt, i);
														}}
													>
														{copiedSceneIdx === i ? '✓' : '📋'}
													</button>
												{/if}
												{#if clip.motionEffect && clip.motionEffect !== 'none'}
													<span class="badge-mini badge-motion" title="Gerak: {clip.motionEffect}">
														{#if clip.motionEffect.includes('zoom')}🔍{:else if clip.motionEffect.includes('pan')}⬅️{:else if clip.motionEffect.includes('shake')}📳{:else}↗️{/if}
													</span>
												{/if}
												{#if clip.overlayEffect && clip.overlayEffect !== 'none'}
													<span class="badge-mini badge-overlay" title="Overlay: {clip.overlayEffect}">
														{#if clip.overlayEffect === 'tv_static'}📺{:else if clip.overlayEffect === 'no_signal'}📡{:else if clip.overlayEffect === 'fog'}🌫️{:else if clip.overlayEffect === 'film_grain'}🎬{:else if clip.overlayEffect === 'light_leak'}⚡{:else}🌧️{/if}
													</span>
												{/if}
											</div>
										</div>

										<div class="clip-info-strip">
											<span class="clip-index">#{clip.sceneNumber || i + 1}</span>
											<span class="clip-name-text">{clip.name}</span>
											<span class="clip-dur-badge">{clip.duration}s</span>
										</div>

										<!-- Right edge transition badge if not last clip -->
										{#if i < vt.clips.length - 1 && clip.transitionType && clip.transitionType !== 'none'}
											<div
												class="transition-edge-badge"
												title="Transisi ke #{i + 2}: {clip.transitionType} ({clip.transitionDuration || 0.5}s)"
											>
												<span>⧖</span>
											</div>
										{/if}

										<!-- Right edge resize handle -->
										<div
											class="resize-handle right-handle"
											onmousedown={(e) => startResizeClip(e, vt.id, i)}
											title="Tarik ke kanan/kiri untuk melebarkan atau memendekkan durasi"
										>
											<div class="handle-grip"></div>
										</div>
									</div>
								{/each}
							{:else}
								<div
									class="track-empty-hint"
									onclick={(e) => {
										e.stopPropagation();
										activeVisualTrackId = vt.id;
										fileInputImages?.click();
									}}
								>
									<span>+ Klik untuk import gambar ke [{vt.name}]</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}

				<!-- Multi-layer Audio Tracks (Stacked below visual tracks) -->
				{#each audioTracks as at, aIdx}
					<div class="track-row audio-track">
						<div class="track-header-fixed">
							<div class="th-main-title">
								<Music size={13} />
								<span class="th-title-text">{at.name.split(' ')[0]}</span>
							</div>

							<div class="th-controls">
								<button
									class="th-icon-btn {at.isMuted ? 'text-danger' : 'active'}"
									onclick={() => {
										at.isMuted = !at.isMuted;
										audioTracks = [...audioTracks];
									}}
									title={at.isMuted ? 'Unmute track' : 'Mute track'}
								>
									{#if at.isMuted}
										<VolumeX size={12} />
									{:else}
										<Volume2 size={12} />
									{/if}
								</button>

								{#if aIdx > 0}
									<button
										class="th-icon-btn text-danger"
										onclick={() => removeAudioTrack(at.id)}
										title="Hapus track audio ini"
									>
										<Trash2 size={12} />
									</button>
								{/if}
							</div>
						</div>

						<div class="track-content-flow">
							{#if at.audioUrl}
								<div
									class="audio-waveform-block"
									style="width: {(at.audioDuration || totalDuration) * pxPerSec}px;"
								>
									<div class="audio-strip-header">
										<Music size={12} />
										<span class="audio-strip-title">{at.audioName || 'Track Audio'}</span>
										<span class="audio-strip-dur">{formatTime(at.audioDuration)}</span>
									</div>
									<div class="simulated-waveform">
										{#each Array(50) as _, b}
											<div
												class="wave-bar"
												style="height: {15 + Math.sin(b * 0.8 + aIdx) * 18 + (b % 5) * 8}%;"
											></div>
										{/each}
									</div>
								</div>
							{:else}
								<div class="track-empty-hint" onclick={() => openAudioPicker(at.id)}>
									<span>+ Klik untuk import audio ke [{at.name}]</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</footer>

	<!-- Render Progress & Result Modal -->
	{#if showRenderModal}
		<div class="modal-backdrop">
			<div class="modal-card">
				<div class="modal-header">
					<div class="modal-title-group">
						<Film size={20} class="text-primary" />
						<h3>{isRendering ? 'Sedang Merender Video Multi-Layer...' : renderResult ? 'Video Siap!' : 'Proses Render'}</h3>
					</div>
					{#if !isRendering}
						<button class="close-btn" onclick={() => (showRenderModal = false)}>
							<X size={18} />
						</button>
					{/if}
				</div>

				<div class="modal-body">
					{#if isRendering}
						<div class="rendering-state">
							<div class="progress-ring-box">
								<div class="progress-percent">{renderProgress}%</div>
							</div>

							<div class="progress-bar-wrapper">
								<div class="progress-fill" style="width: {renderProgress}%;"></div>
							</div>

							<p class="step-text">{renderStep}</p>
							<p class="sub-hint">Menggabungkan multi-layer visual & multi-track audio menjadi satu MP4 utuh...</p>
						</div>
					{:else if renderError}
						<div class="error-state">
							<p class="error-msg">⚠️ {renderError}</p>
							<button class="btn btn-secondary" onclick={() => (showRenderModal = false)}>
								Tutup
							</button>
						</div>
					{:else if renderResult}
						<div class="success-state">
							<div class="video-preview-final">
								<video src={renderResult.downloadUrl} controls autoplay class="final-video-el"></video>
							</div>

							<div class="render-details-row">
								<div class="detail-item">
									<span class="detail-label">File Name:</span>
									<span class="detail-val">{renderResult.filename}</span>
								</div>
								<div class="detail-item">
									<span class="detail-label">Total Durasi:</span>
									<span class="detail-val">{renderResult.totalDuration}s</span>
								</div>
							</div>

							<div class="modal-actions-final">
								<a
									href={renderResult.downloadUrl}
									download={renderResult.filename}
									class="btn btn-primary btn-lg"
								>
									<Download size={18} />
									<span>Download Video MP4</span>
								</a>
								<a
									href={renderResult.downloadUrl}
									target="_blank"
									rel="noreferrer"
									class="btn btn-secondary btn-lg"
								>
									<ExternalLink size={18} />
									<span>Buka di Tab Baru</span>
								</a>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- AI Audio Storyboard Modal -->
	{#if showAiStoryboardModal}
		<div class="modal-backdrop">
			<div class="modal-card modal-card-storyboard">
				<div class="modal-header">
					<div class="modal-title-group">
						<Wand2 size={22} class="text-accent" />
						<div>
							<h3>AI Audio to Storyboard & Scene Prompts</h3>
							<p class="modal-subtitle">Upload audio narasi ➔ AI bagi scene & buat prompt visual konsisten ➔ Impor gambar bulk</p>
						</div>
					</div>
					{#if !isGeneratingStoryboard}
						<button class="close-btn" onclick={() => (showAiStoryboardModal = false)}>
							<X size={18} />
						</button>
					{/if}
				</div>

				<div class="modal-body">
					{#if isGeneratingStoryboard}
						<div class="rendering-state sb-loading-state">
							<div class="ai-spin-wrapper">
								<Sparkles size={40} class="ai-spin-icon" />
							</div>
							<p class="step-text font-bold text-accent">{storyboardLoadingStep}</p>
							<p class="sub-hint">Whisper sedang mentranskripsi narasi & AI LLM menyusun visual prompt 2D YouTube cartoon tiap adegan...</p>
						</div>
					{:else if !generatedStoryboard}
						<!-- Step 1: Input Audio & Style Settings -->
						<div class="storyboard-setup-form">
							<!-- 1. Audio Upload Dropzone -->
							<div class="sb-form-group">
								<label class="sb-label" for="sb-audio-input">
									<FileAudio size={15} class="text-primary" />
									<span>1. Upload File Audio Voiceover / Narasi:</span>
								</label>
								<div class="audio-drop-area">
									<input
										type="file"
										accept="audio/*"
										id="sb-audio-input"
										onchange={handleStoryboardAudioSelect}
										class="hidden-file-input"
									/>
									<label for="sb-audio-input" class="audio-drop-label">
										{#if storyboardAudioFile}
											<div class="audio-selected-box">
												<FileAudio size={26} class="text-accent" />
												<div class="audio-sel-meta">
													<span class="audio-sel-name">{storyboardAudioFile.name}</span>
													<span class="audio-sel-size">{(storyboardAudioFile.size / 1024 / 1024).toFixed(2)} MB</span>
												</div>
												<span class="btn btn-xs btn-secondary">Ganti Audio</span>
											</div>
										{:else}
											<div class="audio-empty-box">
												<Upload size={28} opacity={0.6} />
												<span class="audio-upload-text">Klik untuk pilih file audio narasi (MP3, WAV, M4A)</span>
												<span class="audio-upload-hint">Audio akan dipotong jadi adegan otomatis dan dipasang ke track A1</span>
											</div>
										{/if}
									</label>
								</div>

								{#if storyboardAudioPreviewUrl}
									<div class="audio-player-preview-mini">
										<audio src={storyboardAudioPreviewUrl} controls class="w-full"></audio>
									</div>
								{/if}
							</div>

							<!-- 2. Art Style Anchor & Presets -->
							<div class="sb-form-group">
								<div class="sb-label-row">
									<label class="sb-label" for="sb-style-textarea">
										<Sparkles size={15} class="text-accent" />
										<span>2. Master Art Style & Karakter:</span>
									</label>
									<span class="sb-hint">Menjaga gambar konsisten dari Scene 1 sampai akhir</span>
								</div>

								<div class="style-presets-bar">
									{#each STYLE_PRESETS as preset}
										<button
											type="button"
											class="preset-chip {storyboardStylePreset === preset.id ? 'active' : ''}"
											onclick={() => selectStylePreset(preset.id)}
										>
											{preset.label}
										</button>
									{/each}
								</div>

								<textarea
									id="sb-style-textarea"
									bind:value={storyboardStyleTemplate}
									rows={3}
									class="sb-textarea"
									placeholder="Deskripsikan gaya seni, karakter, dan aspek rasio..."
								></textarea>
							</div>

							<!-- 3. Pacing / Durasi Scene -->
							<div class="sb-form-group">
								<label class="sb-label">
									<Clock size={15} class="text-warning" />
									<span>3. Pacing Pemotongan Adegan (Durasi Tiap Scene):</span>
								</label>
								<div class="pacing-selector-grid">
									<label class="pacing-card {storyboardPacing === 'fast' ? 'selected' : ''}">
										<input type="radio" bind:group={storyboardPacing} value="fast" />
										<span class="pacing-title">⚡ Cepat (2.8s - 4.5s)</span>
										<span class="pacing-desc">Banyak adegan berganti cepat, pas untuk Shorts / Reels</span>
									</label>
									<label class="pacing-card {storyboardPacing === 'balanced' ? 'selected' : ''}">
										<input type="radio" bind:group={storyboardPacing} value="balanced" />
										<span class="pacing-title">⚖️ Seimbang (4.0s - 6.5s)</span>
										<span class="pacing-desc">Standar video edukasi YouTube & dokumenter</span>
									</label>
									<label class="pacing-card {storyboardPacing === 'relaxed' ? 'selected' : ''}">
										<input type="radio" bind:group={storyboardPacing} value="relaxed" />
										<span class="pacing-title">🧘 Santai (5.5s - 8.5s)</span>
										<span class="pacing-desc">Untuk narasi santai, cerita mendalam & dramatis</span>
									</label>
								</div>
							</div>

							<div class="sb-submit-row">
								<button
									type="button"
									class="btn btn-primary-glow btn-lg w-full"
									disabled={!storyboardAudioFile}
									onclick={generateAiStoryboard}
								>
									<Wand2 size={18} />
									<span>Analisis Audio & Buat Prompt Scene</span>
								</button>
							</div>
						</div>
					{:else}
						<!-- Step 2: Storyboard Review, Copy Prompts, & Apply -->
						<div class="storyboard-results-view">
							<div class="sb-summary-bar">
								<div class="sb-stat-group">
									<div class="sb-stat-item">
										<span class="sb-stat-label">Total Scenes:</span>
										<span class="sb-stat-val text-accent">{generatedStoryboard.length} Adegan</span>
									</div>
									<div class="sb-stat-item">
										<span class="sb-stat-label">Durasi Audio:</span>
										<span class="sb-stat-val text-primary">{formatTime(storyboardAudioResult?.totalDuration || 0)}</span>
									</div>
								</div>
								<div class="sb-top-actions">
									<button type="button" class="btn btn-sm btn-secondary" onclick={copyAllPrompts}>
										{#if copiedAllPromptsStatus}
											<CheckCheck size={14} class="text-success" />
											<span>Tersalin Semua!</span>
										{:else}
											<Copy size={14} />
											<span>Copy Semua Prompts (1..N)</span>
										{/if}
									</button>
									<button type="button" class="btn btn-sm btn-outline-danger" onclick={() => (generatedStoryboard = null)}>
										<span>Ulangi / Ganti Audio</span>
									</button>
								</div>
							</div>

							<div class="sb-scenes-scroll">
								{#each generatedStoryboard as sc, sIdx}
									<div class="sb-scene-card">
										<div class="sb-card-top">
											<span class="sb-card-num">Scene #{sc.sceneNumber}</span>
											<span class="sb-card-time">{formatTime(sc.start)} - {formatTime(sc.end)} ({sc.duration}s)</span>
											<div class="sb-card-badges">
												<span class="badge-mini badge-motion">{sc.motion}</span>
												<span class="badge-mini badge-trans">{sc.transition}</span>
											</div>
											<button
												type="button"
												class="btn btn-xs btn-secondary btn-copy-single"
												onclick={() => copySinglePrompt(sc.prompt, sIdx)}
											>
												<Copy size={12} />
												<span>{copiedSceneIdx === sIdx ? 'Disalin ✓' : 'Copy'}</span>
											</button>
										</div>

										<div class="sb-narration-box">
											<span class="sb-label-sub">🎙️ Narasi:</span>
											<p class="sb-narration-text">"{sc.narration}"</p>
										</div>

										<div class="sb-prompt-box">
											<span class="sb-label-sub">✨ Prompt Visual (English):</span>
											<p class="sb-prompt-text">{sc.prompt}</p>
										</div>
									</div>
								{/each}
							</div>

							<div class="sb-apply-footer">
								<div class="sb-footer-info">
									<span>💡 <strong>Langkah Selanjutnya:</strong> Klik tombol di samping untuk menaruh audio ke A1 dan placeholder scene ke V1. Setelah gambar selesai di-generate, klik <strong>Bulk Import Gambar</strong> untuk memasang visual otomatis!</span>
								</div>
								<button type="button" class="btn btn-primary btn-lg" onclick={applyStoryboardToTimeline}>
									<Sparkles size={18} />
									<span>Terapkan Storyboard ke Timeline & Audio Track A1</span>
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Toast Message -->
	{#if toastMessage}
		<div class="toast-bubble">
			<CheckCircle2 size={16} />
			<span>{toastMessage}</span>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background: #080a11;
		color: #eef2ff;
		overflow: hidden;
	}

	.video-editor-app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
		background: #080a11;
		color: #eef2ff;
		font-family: var(--font-sans);
		user-select: none;
	}

	/* Header */
	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 18px;
		background: #0e1320;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		gap: 16px;
		z-index: 20;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.brand-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: inherit;
	}

	.brand-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: linear-gradient(135deg, #6366f1, #06b6d4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
	}

	.brand-info {
		display: flex;
		flex-direction: column;
	}

	.brand-title {
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.brand-tag {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #94a3b8;
		letter-spacing: 0.06em;
	}

	.studio-nav {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #131a2e;
		padding: 3px 6px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.studio-pill {
		font-size: 0.72rem;
		font-weight: 600;
		color: #94a3b8;
		text-decoration: none;
		padding: 4px 10px;
		border-radius: 999px;
		transition: all 0.2s;
	}

	.studio-pill:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.06);
	}

	.studio-pill.active {
		color: #ffffff;
		background: #6366f1;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
	}

	.header-center {
		flex: 1;
		max-width: 380px;
	}

	.title-input {
		width: 100%;
		background: #131a2e;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #ffffff;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 6px 12px;
		border-radius: 8px;
		text-align: center;
		transition: border-color 0.2s;
	}

	.title-input:focus {
		border-color: #6366f1;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.stat-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #131a2e;
		padding: 5px 10px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.stat-value {
		font-weight: 700;
		color: #eef2ff;
	}

	.render-btn {
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		box-shadow: 0 0 14px rgba(99, 102, 241, 0.4);
	}

	/* Main Workspace */
	.workspace-layout {
		display: grid;
		grid-template-columns: 1fr 340px;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	/* Preview Panel */
	.preview-panel {
		display: flex;
		flex-direction: column;
		background: #0a0e17;
		padding: 16px;
		gap: 12px;
		min-height: 0;
	}

	.player-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #06080e;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		overflow: hidden;
		position: relative;
	}

	.canvas-frame {
		position: relative;
		background: #000000;
		box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ratio-landscape {
		width: 100%;
		max-width: 820px;
		aspect-ratio: 16 / 9;
	}

	.ratio-portrait {
		height: 100%;
		max-height: 480px;
		aspect-ratio: 9 / 16;
	}

	.ratio-square {
		height: 100%;
		max-height: 460px;
		aspect-ratio: 1 / 1;
	}

	.clip-display {
		width: 100%;
		height: 100%;
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		position: absolute;
		inset: 0;
		will-change: transform, opacity;
	}

	/* Overlay Picture-in-Picture Box */
	.overlay-pip-box {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 30%;
		aspect-ratio: 16 / 9;
		background-size: cover;
		background-position: center;
		border-radius: 8px;
		border: 2px solid #06b6d4;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
		cursor: pointer;
		overflow: hidden;
		transition: transform 0.2s, box-shadow 0.2s;
		z-index: 10;
	}

	.overlay-pip-box:hover {
		transform: scale(1.04);
		box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4);
	}

	.pip-tag {
		position: absolute;
		bottom: 4px;
		left: 4px;
		background: rgba(0, 0, 0, 0.7);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.6rem;
		font-weight: 700;
		color: #38bdf8;
	}

	/* Subtle Motion Preview Animations */
	.anim-zoom_in {
		animation: animZoomIn 4s ease-out infinite alternate;
	}
	.anim-zoom_out {
		animation: animZoomOut 4s ease-out infinite alternate;
	}
	.anim-pan_left {
		animation: animPanLeft 4s ease-in-out infinite alternate;
	}
	.anim-pan_right {
		animation: animPanRight 4s ease-in-out infinite alternate;
	}
	.anim-diagonal_drift {
		animation: animDiagonalDrift 4.5s ease-in-out infinite alternate;
	}
	.anim-camera_shake {
		animation: animCameraShake 0.4s ease-in-out infinite;
	}
	.anim-pulse_pop {
		animation: animPulsePop 1.6s ease-in-out infinite alternate;
	}

	@keyframes animZoomIn {
		0% { transform: scale(1.0); }
		100% { transform: scale(1.12); }
	}
	@keyframes animZoomOut {
		0% { transform: scale(1.12); }
		100% { transform: scale(1.0); }
	}
	@keyframes animPanLeft {
		0% { transform: scale(1.06) translateX(2%); }
		100% { transform: scale(1.06) translateX(-2%); }
	}
	@keyframes animPanRight {
		0% { transform: scale(1.06) translateX(-2%); }
		100% { transform: scale(1.06) translateX(2%); }
	}
	@keyframes animDiagonalDrift {
		0% { transform: scale(1.04) translate(-1.5%, -1.5%); }
		100% { transform: scale(1.10) translate(1.5%, 1.5%); }
	}
	@keyframes animCameraShake {
		0% { transform: scale(1.06) translate(0, 0); }
		20% { transform: scale(1.06) translate(-1.5px, 1.5px); }
		40% { transform: scale(1.06) translate(1.5px, -1px); }
		60% { transform: scale(1.06) translate(-1px, -1.5px); }
		80% { transform: scale(1.06) translate(1px, 1.5px); }
		100% { transform: scale(1.06) translate(0, 0); }
	}
	@keyframes animPulsePop {
		0% { transform: scale(1.0); }
		50% { transform: scale(1.05); }
		100% { transform: scale(1.0); }
	}

	/* Live Transition Layers */
	.transition-next-clip {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		z-index: 5;
		pointer-events: none;
		will-change: transform, opacity;
	}

	.transition-color-dip {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 6;
		pointer-events: none;
	}

	/* Live Visual Overlay Effects */
	.fx-overlay-canvas {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 7;
		pointer-events: none;
		overflow: hidden;
	}

	/* 1. TV Static / VHS Glitch */
	.fx-tv-scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.35) 0px, rgba(0, 0, 0, 0.35) 2px, transparent 2px, transparent 4px);
		opacity: 0.85;
	}

	.fx-tv-noise-anim {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.35'/%3E%3C/svg%3E");
		animation: tvNoiseShake 0.15s steps(2) infinite;
		mix-blend-mode: overlay;
	}

	@keyframes tvNoiseShake {
		0% { transform: translate(0, 0); }
		50% { transform: translate(-3%, 2%); }
		100% { transform: translate(2%, -3%); }
	}

	.fx-vhs-osd {
		position: absolute;
		bottom: 12px;
		left: 14px;
		display: flex;
		gap: 12px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		color: #22c55e;
		text-shadow: 0 0 6px #22c55e;
		letter-spacing: 0.08em;
	}

	.vhs-rec-dot {
		color: #ef4444;
		text-shadow: 0 0 6px #ef4444;
		animation: blinkSlow 1s steps(2) infinite;
	}

	@keyframes blinkSlow {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	/* 2. No Signal SMPTE */
	.fx-smpte-bars {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, #ffffff 0%, #ffffff 14.28%, #eab308 14.28%, #eab308 28.57%, #06b6d4 28.57%, #06b6d4 42.85%, #22c55e 42.85%, #22c55e 57.14%, #d946ef 57.14%, #d946ef 71.42%, #ef4444 71.42%, #ef4444 85.71%, #2563eb 85.71%, #2563eb 100%);
		opacity: 0.9;
	}

	.fx-no-signal-modal {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.85);
		border: 3px solid #ef4444;
		border-radius: 8px;
		padding: 14px 24px;
		text-align: center;
		box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
	}

	.no-signal-banner {
		font-family: var(--font-mono);
		font-size: 1.15rem;
		font-weight: 800;
		color: #ef4444;
		letter-spacing: 0.1em;
		animation: blinkSlow 0.8s steps(2) infinite;
	}

	.no-signal-desc {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: #fbbf24;
		margin-top: 4px;
		letter-spacing: 0.05em;
	}

	/* 3. Fog / Misty Smoke */
	.fx-fog-stream {
		position: absolute;
		inset: -50%;
		background: radial-gradient(ellipse at 35% 45%, rgba(255, 255, 255, 0.3) 0%, rgba(220, 230, 242, 0.18) 35%, transparent 65%),
		            radial-gradient(ellipse at 75% 65%, rgba(255, 255, 255, 0.25) 0%, rgba(200, 215, 235, 0.14) 40%, transparent 70%);
		filter: blur(8px);
		mix-blend-mode: screen;
	}

	.fx-fog-a {
		animation: fogDriftA 12s ease-in-out infinite alternate;
	}
	.fx-fog-b {
		animation: fogDriftB 16s ease-in-out infinite alternate;
		opacity: 0.7;
	}

	@keyframes fogDriftA {
		0% { transform: translate(-10%, -5%); }
		100% { transform: translate(10%, 5%); }
	}
	@keyframes fogDriftB {
		0% { transform: translate(8%, 10%) scale(1.1); }
		100% { transform: translate(-8%, -8%) scale(0.95); }
	}

	/* 4. Film Grain 8mm */
	.fx-film-vignette-ring {
		position: absolute;
		inset: 0;
		box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.7), inset 0 0 140px rgba(0, 0, 0, 0.55);
		background-color: rgba(180, 83, 9, 0.06);
		mix-blend-mode: multiply;
	}

	.fx-film-grain-particles {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.28'/%3E%3C/svg%3E");
		animation: filmGrainJitter 0.12s steps(2) infinite;
		mix-blend-mode: overlay;
	}

	@keyframes filmGrainJitter {
		0% { transform: translate(0, 0); }
		50% { transform: translate(2%, -2%); }
		100% { transform: translate(-2%, 2%); }
	}

	.fx-film-hair-scratch {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 42%;
		width: 1px;
		background: rgba(255, 255, 255, 0.25);
		box-shadow: 0 0 2px rgba(255, 255, 255, 0.4);
		animation: hairFlicker 2s steps(4) infinite;
	}

	@keyframes hairFlicker {
		0%, 100% { opacity: 0; transform: translateX(0); }
		25% { opacity: 0.6; transform: translateX(25px); }
		50% { opacity: 0; transform: translateX(-15px); }
		75% { opacity: 0.8; transform: translateX(10px); }
	}

	/* 5. Light Leak */
	.fx-light-leak-burst {
		position: absolute;
		inset: -20%;
		background: radial-gradient(circle at 85% 15%, rgba(251, 146, 60, 0.5) 0%, rgba(245, 158, 11, 0.28) 30%, transparent 65%),
		            radial-gradient(circle at 15% 85%, rgba(239, 68, 68, 0.35) 0%, transparent 55%);
		mix-blend-mode: screen;
		animation: lightLeakPulse 5s ease-in-out infinite alternate;
	}

	@keyframes lightLeakPulse {
		0% { opacity: 0.6; transform: scale(1.0) rotate(0deg); }
		50% { opacity: 0.95; transform: scale(1.08) rotate(3deg); }
		100% { opacity: 0.5; transform: scale(0.96) rotate(-2deg); }
	}

	/* 6. Rain */
	.fx-rain-drop-curtain {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(105deg, transparent, transparent 18px, rgba(255, 255, 255, 0.22) 19px, transparent 20px);
		animation: rainFall 0.35s linear infinite;
	}

	@keyframes rainFall {
		0% { background-position: 0 0; }
		100% { background-position: 15px 100px; }
	}

	/* Setting Group Boxes (Inspector) */
	.setting-group-box {
		background: rgba(14, 20, 34, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 8px 10px;
		margin-bottom: 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.setting-btn-row {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		padding-top: 2px;
	}

	.sub-row {
		margin-top: 2px;
	}

	.setting-label-sm {
		font-size: 0.68rem;
		color: #94a3b8;
		white-space: nowrap;
	}

	.slider-with-val {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.slider-range-sm {
		flex: 1;
		height: 4px;
		accent-color: #06b6d4;
		cursor: pointer;
	}

	.sub-val-badge {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 700;
		color: #06b6d4;
		min-width: 32px;
	}

	/* Timeline Badges */
	.clip-badges-float {
		position: absolute;
		top: 3px;
		left: 3px;
		display: flex;
		gap: 2px;
		z-index: 5;
	}

	.badge-mini {
		font-size: 0.58rem;
		padding: 1px 3px;
		border-radius: 3px;
		background: rgba(0, 0, 0, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.15);
		line-height: 1;
	}

	.transition-edge-badge {
		position: absolute;
		right: 6px;
		top: 3px;
		background: rgba(99, 102, 241, 0.85);
		color: #ffffff;
		font-size: 0.6rem;
		padding: 1px 3px;
		border-radius: 3px;
		z-index: 6;
		pointer-events: none;
		line-height: 1;
	}

	.clip-watermark {
		position: absolute;
		top: 12px;
		left: 12px;
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(4px);
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.clip-idx-badge {
		font-size: 0.75rem;
		font-weight: 700;
		color: #06b6d4;
	}

	.clip-filename {
		font-size: 0.7rem;
		color: #e2e8f0;
		max-width: 180px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.overlay-timecode {
		position: absolute;
		bottom: 12px;
		right: 12px;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		padding: 4px 8px;
		border-radius: 6px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: #ffffff;
		display: flex;
		gap: 4px;
	}

	.time-sep {
		color: #64748b;
	}

	.empty-player {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		color: #64748b;
		padding: 30px;
		text-align: center;
	}

	.empty-actions {
		display: flex;
		gap: 8px;
		margin-top: 6px;
	}

	/* Player Toolbar */
	.player-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		background: #0e1320;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		gap: 16px;
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.ctrl-btn {
		width: 34px;
		height: 34px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #94a3b8;
		background: #131a2e;
		border: 1px solid rgba(255, 255, 255, 0.08);
		transition: all 0.2s;
	}

	.ctrl-btn:hover {
		color: #ffffff;
		background: #1e293b;
	}

	.play-circle-btn {
		background: #6366f1;
		color: #ffffff;
		border-color: transparent;
	}

	.play-circle-btn:hover {
		background: #4f46e5;
	}

	.play-circle-btn.playing {
		background: #06b6d4;
	}

	.timer-display {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		font-weight: 600;
		color: #e2e8f0;
		min-width: 60px;
	}

	.toolbar-center {
		flex: 1;
		max-width: 450px;
	}

	.mini-scrubber {
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 999px;
		cursor: pointer;
		overflow: hidden;
		position: relative;
	}

	.mini-scrubber-fill {
		height: 100%;
		background: linear-gradient(90deg, #6366f1, #06b6d4);
		transition: width 0.05s linear;
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.speed-selector {
		display: flex;
		background: #131a2e;
		padding: 2px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.speed-pill {
		padding: 3px 8px;
		font-size: 0.7rem;
		font-weight: 600;
		color: #94a3b8;
		border-radius: 4px;
	}

	.speed-pill.active {
		background: #6366f1;
		color: #ffffff;
	}

	/* Inspector Sidebar */
	.inspector-panel {
		background: #0e1320;
		border-left: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.inspector-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.inspector-scroll {
		flex: 1;
		overflow-y: auto;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.card-section {
		background: #131a2e;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.section-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.8rem;
		font-weight: 700;
		color: #cbd5e1;
		gap: 6px;
	}

	.track-selector-pills {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.track-pill {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: #0a0f1c;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		color: #94a3b8;
		font-size: 0.75rem;
		font-weight: 600;
		transition: all 0.15s;
		cursor: pointer;
	}

	.track-pill:hover {
		background: #1e293b;
		color: #ffffff;
	}

	.track-pill.active {
		background: #6366f1;
		color: #ffffff;
		border-color: #6366f1;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
	}

	.pill-count {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		opacity: 0.8;
	}

	.file-tag {
		font-size: 0.7rem;
		font-weight: 500;
		color: #06b6d4;
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.thumb-preview-box {
		width: 100%;
		height: 120px;
		border-radius: 8px;
		overflow: hidden;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	.thumb-img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.setting-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.label-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.setting-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #94a3b8;
	}

	.setting-val-highlight {
		font-size: 0.8rem;
		font-weight: 700;
		color: #06b6d4;
	}

	.duration-control-inputs {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.slider-range {
		width: 100%;
		accent-color: #6366f1;
		cursor: pointer;
	}

	.numeric-stepper {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.step-btn {
		background: #1e293b;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #cbd5e1;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.step-btn:hover {
		background: #334155;
		color: #fff;
	}

	.number-input {
		flex: 1;
		text-align: center;
		background: #0a0f1c;
		border: 1px solid rgba(255, 255, 255, 0.12);
		padding: 5px;
		font-size: 0.85rem;
		font-weight: 700;
		border-radius: 6px;
	}

	.preset-dur-pills {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 4px;
	}

	.dur-pill {
		padding: 4px 0;
		font-size: 0.7rem;
		font-weight: 600;
		text-align: center;
		background: #0a0f1c;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		color: #94a3b8;
		transition: all 0.15s;
	}

	.dur-pill:hover {
		background: #1e293b;
		color: #fff;
	}

	.dur-pill.active {
		background: #6366f1;
		color: #ffffff;
		border-color: transparent;
	}

	.select-input {
		background: #0a0f1c;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		color: #e2e8f0;
		font-size: 0.78rem;
		padding: 7px 10px;
	}

	.clip-actions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
		margin-top: 4px;
	}

	.btn-danger {
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.btn-danger:hover {
		background: #ef4444;
		color: #ffffff;
	}

	/* Audio Multi-Track Settings inside Inspector */
	.audio-tracks-vertical {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.audio-track-item-card {
		background: #0a0f1c;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 8px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.at-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.at-name-box {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mute-btn-mini {
		padding: 2px;
		color: #10b981;
	}

	.mute-btn-mini.muted {
		color: #ef4444;
	}

	.at-title {
		font-size: 0.72rem;
		font-weight: 700;
		color: #cbd5e1;
	}

	.delete-track-btn {
		color: #64748b;
		padding: 2px;
	}

	.delete-track-btn:hover {
		color: #ef4444;
	}

	.at-body {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.at-filename {
		font-size: 0.68rem;
		color: #94a3b8;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.at-controls-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mini-slider {
		flex: 1;
		height: 4px;
	}

	.at-vol-pct {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: #06b6d4;
		min-width: 28px;
	}

	.add-audio-btn {
		width: 100%;
		padding: 6px;
		font-size: 0.7rem;
	}

	.w-full {
		width: 100%;
	}

	.ratio-pills {
		display: flex;
		gap: 6px;
	}

	.ratio-pill {
		flex: 1;
		font-size: 0.7rem;
		font-weight: 600;
		padding: 6px 4px;
		background: #0a0f1c;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		color: #94a3b8;
		text-align: center;
		transition: all 0.15s;
	}

	.ratio-pill.active {
		background: #6366f1;
		color: #ffffff;
		border-color: transparent;
	}

	.empty-inspector {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		color: #64748b;
		padding: 40px 20px;
		text-align: center;
		font-size: 0.8rem;
	}

	/* Timeline Bottom Container */
	.timeline-container {
		height: 290px;
		background: #0c101a;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		z-index: 10;
	}

	.timeline-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 14px;
		background: #111726;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		gap: 14px;
		flex-wrap: wrap;
	}

	.timeline-left-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sort-selector-group {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #090e1a;
		padding: 3px 6px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.sort-label {
		font-size: 0.68rem;
		font-weight: 600;
		color: #94a3b8;
		padding: 0 4px;
	}

	.sort-pill {
		font-size: 0.68rem;
		font-weight: 600;
		padding: 2px 7px;
		border-radius: 4px;
		color: #94a3b8;
		background: transparent;
		border: 1px solid transparent;
		transition: all 0.15s;
	}

	.sort-pill:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.06);
	}

	.sort-pill.active {
		color: #ffffff;
		background: #6366f1;
		border-color: #6366f1;
		box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
	}

	.default-duration-box {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #172036;
		padding: 4px 8px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.box-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: #cbd5e1;
	}

	.dur-input {
		width: 48px;
		padding: 2px 4px;
		font-size: 0.75rem;
		font-weight: 700;
		text-align: center;
		background: #0a0f1c;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 4px;
	}

	.dur-unit {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	.btn-xs {
		padding: 3px 6px;
		font-size: 0.68rem;
		border-radius: 4px;
	}

	.timeline-right-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.quick-jump-group {
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(14, 20, 34, 0.7);
		padding: 2px 6px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.qj-label {
		font-size: 0.68rem;
		font-weight: 600;
		color: #94a3b8;
		margin-right: 2px;
	}
	.btn-jump-pill {
		padding: 2px 6px;
		font-size: 0.68rem;
		font-weight: 700;
		color: #cbd5e1;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.btn-jump-pill:hover {
		color: #ffffff;
		background: rgba(99, 102, 241, 0.25);
		border-color: #6366f1;
	}
	.minute-chips-wrap {
		display: flex;
		align-items: center;
		gap: 3px;
		margin-left: 4px;
		padding-left: 4px;
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}
	.chip-jump {
		padding: 2px 5px;
		font-size: 0.66rem;
		font-weight: 700;
		color: #94a3b8;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.chip-jump:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.08);
	}
	.chip-jump.active {
		color: #ffffff;
		background: #4f46e5;
		border-color: #6366f1;
		box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
	}

	.btn-fit-screen {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		font-size: 0.7rem;
		font-weight: 600;
		color: #e0e7ff;
		background: rgba(99, 102, 241, 0.16);
		border: 1px solid rgba(99, 102, 241, 0.35);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.btn-fit-screen:hover {
		background: rgba(99, 102, 241, 0.3);
		border-color: #818cf8;
		box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
	}

	.zoom-controller {
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(14, 20, 34, 0.7);
		padding: 2px 8px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.zoom-slider {
		width: 75px;
		accent-color: #6366f1;
		cursor: pointer;
	}

	.zoom-px-label {
		font-size: 0.66rem;
		font-weight: 700;
		color: #818cf8;
		min-width: 44px;
		text-align: right;
		font-family: var(--font-mono, monospace);
	}

	/* TIMELINE MINIMAP OVERVIEW NAVIGATOR BAR */
	.timeline-minimap-bar {
		height: 32px;
		background: #090d18;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		position: relative;
		z-index: 26;
		user-select: none;
	}
	.minimap-header-col {
		width: 120px;
		background: #0d1222;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px;
		z-index: 28;
	}
	.minimap-tag {
		font-size: 0.62rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		color: #818cf8;
	}
	.minimap-total-time {
		font-size: 0.65rem;
		font-family: var(--font-mono, monospace);
		color: #94a3b8;
		font-weight: 600;
	}
	.minimap-track-area {
		flex: 1;
		height: 100%;
		position: relative;
		cursor: pointer;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.35);
	}
	.minimap-marks {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.minimap-tick {
		position: absolute;
		top: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transform: translateX(-50%);
	}
	.minimap-tick-line {
		width: 1px;
		height: 100%;
		background: rgba(255, 255, 255, 0.06);
	}
	.minimap-tick-label {
		position: absolute;
		top: 2px;
		left: 3px;
		font-size: 0.58rem;
		color: rgba(232, 232, 240, 0.4);
		font-weight: 600;
		pointer-events: none;
		white-space: nowrap;
	}
	.minimap-layers-preview {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.minimap-visual-strip {
		position: absolute;
		top: 4px;
		left: 0;
		right: 0;
		height: 11px;
	}
	.minimap-clip-block {
		position: absolute;
		top: 0;
		height: 100%;
		background: rgba(99, 102, 241, 0.4);
		border-right: 1px solid rgba(0, 0, 0, 0.4);
		border-radius: 2px;
	}
	.minimap-audio-strip {
		position: absolute;
		bottom: 3px;
		left: 0;
		height: 7px;
		background: rgba(16, 185, 129, 0.45);
		border-radius: 2px;
	}
	.minimap-viewport-window {
		position: absolute;
		top: 0;
		height: 100%;
		background: rgba(99, 102, 241, 0.22);
		border: 1px solid #818cf8;
		border-radius: 4px;
		z-index: 10;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
		min-width: 18px;
	}
	.viewport-handle {
		width: 4px;
		height: 16px;
		background: #818cf8;
		border-radius: 2px;
		position: absolute;
	}
	.viewport-handle.left-handle { left: 2px; }
	.viewport-handle.right-handle { right: 2px; }
	.viewport-label {
		font-size: 0.58rem;
		font-weight: 700;
		color: #e0e7ff;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 8px;
		opacity: 0.85;
	}
	.minimap-playhead {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: #ef4444;
		z-index: 15;
		pointer-events: none;
		transform: translateX(-50%);
	}
	.minimap-playhead-head {
		position: absolute;
		top: 0;
		left: -3px;
		width: 8px;
		height: 8px;
		background: #ef4444;
		border-radius: 50%;
		box-shadow: 0 0 4px #ef4444;
	}

	/* Scrollable Tracks Area & Tebal Scrollbar Bawah */
	.timeline-scrollable {
		flex: 1;
		overflow-x: auto;
		overflow-y: auto;
		position: relative;
		background: #090c14;
	}
	.timeline-scrollable::-webkit-scrollbar {
		height: 14px;
		width: 10px;
	}
	.timeline-scrollable::-webkit-scrollbar-track {
		background: #0a0e1a;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	.timeline-scrollable::-webkit-scrollbar-thumb {
		background: linear-gradient(90deg, #4338ca, #6366f1, #4338ca);
		border-radius: 7px;
		border: 2px solid #0a0e1a;
		cursor: grab;
		box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.2);
	}
	.timeline-scrollable::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(90deg, #6366f1, #818cf8, #6366f1);
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
	}
	.timeline-scrollable::-webkit-scrollbar-thumb:active {
		cursor: grabbing;
		background: #818cf8;
	}

	.tracks-inner {
		display: flex;
		flex-direction: column;
		position: relative;
		min-height: 100%;
	}

	/* Ruler Track */
	.ruler-track {
		height: 28px;
		background: #0e1422;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		position: sticky;
		top: 0;
		z-index: 25;
		display: flex;
	}

	.ruler-header-fixed {
		height: 100%;
		background: #0e1422;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		z-index: 30;
	}

	.ruler-header-title {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: #94a3b8;
	}

	.ruler-content {
		position: relative;
		flex: 1;
		height: 100%;
		cursor: pointer;
		user-select: none;
	}

	.ruler-mark {
		position: absolute;
		top: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		pointer-events: none;
	}

	.ruler-line {
		width: 1px;
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
	}

	.ruler-mark.minor-mark .minor-line {
		height: 4px;
		background: rgba(255, 255, 255, 0.12);
	}

	.ruler-mark.major-mark .major-line {
		height: 10px;
		background: rgba(255, 255, 255, 0.45);
	}

	.ruler-text {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: #94a3b8;
		padding-left: 3px;
		user-select: none;
		white-space: nowrap;
	}

	.mismatch-sync-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(234, 179, 8, 0.15);
		border: 1px solid rgba(234, 179, 8, 0.45);
		border-radius: 999px;
		padding: 3px 10px;
		margin-left: 8px;
		animation: pulseWarning 2s infinite ease-in-out;
	}
	@keyframes pulseWarning {
		0%, 100% { border-color: rgba(234, 179, 8, 0.45); }
		50% { border-color: rgba(234, 179, 8, 0.85); box-shadow: 0 0 12px rgba(234, 179, 8, 0.3); }
	}
	.mismatch-text {
		font-size: 0.72rem;
		color: #fef08a;
		font-weight: 600;
	}
	.btn-warning-glow {
		background: linear-gradient(135deg, #eab308, #f59e0b);
		color: #000000;
		font-weight: 700;
		border: none;
		box-shadow: 0 2px 8px rgba(234, 179, 8, 0.35);
	}
	.btn-warning-glow:hover {
		background: linear-gradient(135deg, #facc15, #fbbf24);
		box-shadow: 0 4px 14px rgba(234, 179, 8, 0.55);
	}

	/* Playhead Needle */
	.playhead-needle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		z-index: 35;
		pointer-events: none;
		transform: translateX(-50%);
		transition: opacity 0.1s ease;
	}

	.playhead-handle {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		background: #ef4444;
		color: #ffffff;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 700;
		padding: 2px 4px;
		border-radius: 3px;
		box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5);
		white-space: nowrap;
	}

	.playhead-line {
		position: absolute;
		top: 18px;
		left: 50%;
		width: 2px;
		height: 1200px;
		background: #ef4444;
		box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
	}

	/* Track Rows */
	.track-row {
		display: flex;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		position: relative;
		transition: background-color 0.15s;
	}

	.visual-track {
		height: 85px;
	}

	.active-track-row {
		background: rgba(99, 102, 241, 0.04);
	}

	.audio-track {
		height: 55px;
	}

	.track-header-fixed {
		width: 120px;
		background: #0e1422;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 10px;
		flex-shrink: 0;
		z-index: 15;
		position: sticky;
		left: 0;
		gap: 4px;
	}

	.th-main-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.72rem;
		font-weight: 700;
		color: #cbd5e1;
	}

	.th-title-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.th-controls {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.th-icon-btn {
		padding: 2px;
		color: #64748b;
		cursor: pointer;
	}

	.th-icon-btn:hover {
		color: #ffffff;
	}

	.th-icon-btn.active {
		color: #38bdf8;
	}

	.track-content-flow {
		display: flex;
		align-items: center;
		flex: 1;
		padding: 4px 0;
		gap: 0;
		position: relative;
	}

	/* Clip Card Block */
	.clip-card {
		height: 74px;
		background: #172138;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		position: relative;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		flex-shrink: 0;
		box-sizing: border-box;
	}

	.clip-card:hover {
		border-color: rgba(99, 102, 241, 0.5);
	}

	.clip-card.active-clip {
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4), inset 0 0 0 1px #6366f1;
	}

	.clip-thumb-preview {
		flex: 1;
		background: #060911;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clip-thumb-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.clip-info-strip {
		height: 20px;
		background: rgba(14, 20, 34, 0.9);
		padding: 0 4px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.65rem;
		gap: 3px;
		overflow: hidden;
		white-space: nowrap;
	}

	.clip-index {
		font-weight: 700;
		color: #06b6d4;
		flex-shrink: 0;
	}

	.clip-name-text {
		color: #cbd5e1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.clip-dur-badge {
		font-family: var(--font-mono);
		font-weight: 700;
		color: #e2e8f0;
		flex-shrink: 0;
	}

	/* Resizing Drag Handle */
	.resize-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 8px;
		cursor: ew-resize;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.right-handle {
		right: 0;
		background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3));
	}

	.right-handle:hover {
		background: rgba(99, 102, 241, 0.7);
	}

	.handle-grip {
		width: 3px;
		height: 22px;
		background: #ffffff;
		border-radius: 999px;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
	}

	/* Audio Block */
	.audio-waveform-block {
		height: 44px;
		background: #0e302c;
		border: 1px solid #10b981;
		border-radius: 6px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 4px 8px;
		flex-shrink: 0;
	}

	.audio-strip-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.65rem;
		color: #a7f3d0;
	}

	.audio-strip-title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 600;
	}

	.audio-strip-dur {
		font-family: var(--font-mono);
		font-weight: 700;
	}

	.simulated-waveform {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 2px;
		overflow: hidden;
		margin-top: 2px;
	}

	.wave-bar {
		flex: 1;
		min-width: 2px;
		background: #10b981;
		border-radius: 1px;
	}

	.track-empty-hint {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #64748b;
		font-size: 0.72rem;
		cursor: pointer;
		padding: 8px;
		border: 1px dashed rgba(255, 255, 255, 0.08);
		border-radius: 6px;
	}

	.track-empty-hint:hover {
		color: #94a3b8;
		border-color: rgba(255, 255, 255, 0.16);
	}

	/* Modal Backdrop & Dialog */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(6px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.modal-card {
		background: #0e1320;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		width: 100%;
		max-width: 580px;
		overflow: hidden;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.modal-title-group {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.modal-title-group h3 {
		font-size: 1.05rem;
		font-weight: 700;
	}

	.text-primary {
		color: #6366f1;
	}

	.close-btn {
		color: #94a3b8;
		padding: 4px;
	}

	.close-btn:hover {
		color: #ffffff;
	}

	.modal-body {
		padding: 24px;
	}

	.rendering-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
	}

	.progress-percent {
		font-size: 2.2rem;
		font-weight: 800;
		color: #6366f1;
		font-family: var(--font-mono);
	}

	.progress-bar-wrapper {
		width: 100%;
		height: 10px;
		background: #172036;
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #6366f1, #06b6d4);
		transition: width 0.3s ease;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
	}

	.step-text {
		font-size: 0.9rem;
		font-weight: 600;
		color: #cbd5e1;
	}

	.sub-hint {
		font-size: 0.75rem;
		color: #64748b;
	}

	.success-state {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.video-preview-final {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		background: #000;
		max-height: 280px;
	}

	.final-video-el {
		width: 100%;
		max-height: 280px;
		object-fit: contain;
	}

	.render-details-row {
		display: flex;
		justify-content: space-between;
		background: #131a2e;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 0.8rem;
	}

	.detail-item {
		display: flex;
		gap: 6px;
	}

	.detail-label {
		color: #94a3b8;
	}

	.detail-val {
		font-weight: 700;
		color: #ffffff;
	}

	.modal-actions-final {
		display: flex;
		gap: 10px;
	}

	.modal-actions-final .btn {
		flex: 1;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		gap: 14px;
		text-align: center;
		padding: 20px;
	}

	.error-msg {
		color: #ef4444;
		font-size: 0.9rem;
	}

	/* Toast Notification */
	.toast-bubble {
		position: fixed;
		bottom: 300px;
		left: 50%;
		transform: translateX(-50%);
		background: #1e293b;
		color: #ffffff;
		padding: 10px 18px;
		border-radius: 999px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.82rem;
		font-weight: 600;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.12);
		z-index: 100;
		animation: toastPop 0.25s ease-out;
	}

	@keyframes toastPop {
		from { opacity: 0; transform: translate(-50%, 10px); }
		to { opacity: 1; transform: translate(-50%, 0); }
	}

	/* AI Storyboard & Bulk Import Styles */
	.ai-storyboard-btn {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
		border: 1px solid rgba(168, 85, 247, 0.4);
		color: #e0e7ff;
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
		transition: all 0.2s ease;
	}
	.ai-storyboard-btn:hover {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(168, 85, 247, 0.35));
		border-color: rgba(168, 85, 247, 0.7);
		box-shadow: 0 0 16px rgba(168, 85, 247, 0.35);
	}

	.btn-primary-ai {
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: #ffffff;
		border: none;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
	}
	.btn-primary-ai:hover {
		background: linear-gradient(135deg, #4f46e5, #7c3aed);
		box-shadow: 0 4px 18px rgba(99, 102, 241, 0.55);
	}

	.btn-accent-bulk {
		background: linear-gradient(135deg, #06b6d4, #0ea5e9);
		color: #ffffff;
		border: none;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
	}
	.btn-accent-bulk:hover {
		background: linear-gradient(135deg, #0891b2, #0284c7);
		box-shadow: 0 4px 18px rgba(14, 165, 233, 0.5);
	}

	.btn-primary-glow {
		background: linear-gradient(135deg, #6366f1, #ec4899);
		color: #ffffff;
		border: none;
		font-weight: 600;
		box-shadow: 0 4px 16px rgba(236, 72, 153, 0.35);
	}
	.btn-primary-glow:hover {
		background: linear-gradient(135deg, #4f46e5, #db2777);
		box-shadow: 0 4px 22px rgba(236, 72, 153, 0.55);
	}

	.placeholder-quick-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-left: 6px;
		padding-left: 8px;
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}
	.btn-outline-warning {
		background: rgba(234, 179, 8, 0.12);
		border: 1px solid rgba(234, 179, 8, 0.4);
		color: #fde047;
	}
	.btn-outline-warning:hover {
		background: rgba(234, 179, 8, 0.22);
		border-color: rgba(234, 179, 8, 0.7);
	}

	/* Canvas Placeholder Card */
	.placeholder-canvas-card {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at 50% 40%, #1e1b4b 0%, #090a16 80%);
		padding: 30px;
		text-align: center;
		box-sizing: border-box;
	}
	.ph-canvas-inner {
		max-width: 650px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}
	.ph-top-badge {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.badge-scene-num {
		background: #6366f1;
		color: #ffffff;
		padding: 4px 12px;
		border-radius: 999px;
		font-weight: 700;
		font-size: 0.85rem;
		box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
	}
	.badge-scene-dur {
		background: rgba(255, 255, 255, 0.1);
		color: #cbd5e1;
		padding: 4px 10px;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.ph-narration-quote {
		margin: 0;
		font-size: 1.15rem;
		font-style: italic;
		color: #f8fafc;
		line-height: 1.5;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
	}
	.ph-prompt-display-box {
		width: 100%;
		background: rgba(15, 23, 42, 0.75);
		border: 1px solid rgba(168, 85, 247, 0.35);
		border-radius: 10px;
		padding: 12px 16px;
		text-align: left;
		backdrop-filter: blur(8px);
	}
	.ph-prompt-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}
	.ph-prompt-label {
		font-size: 0.72rem;
		font-weight: 700;
		color: #c084fc;
		letter-spacing: 0.05em;
	}
	.ph-prompt-body {
		margin: 0;
		font-size: 0.85rem;
		color: #e2e8f0;
		line-height: 1.45;
		user-select: all;
	}
	.ph-canvas-footer {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 4px;
	}

	/* Timeline Placeholder Clip Card */
	.is-placeholder-clip {
		background: linear-gradient(135deg, #1e1b4b, #111827) !important;
		border: 1px dashed rgba(168, 85, 247, 0.5) !important;
	}
	.placeholder-thumb-card {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		cursor: pointer;
		background: rgba(99, 102, 241, 0.08);
		transition: background 0.2s ease;
	}
	.placeholder-thumb-card:hover {
		background: rgba(99, 102, 241, 0.2);
	}
	.ph-mini-icon {
		font-size: 1.1rem;
		opacity: 0.7;
	}
	.ph-mini-tag {
		font-size: 0.65rem;
		color: #c084fc;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 4px;
	}
	.badge-copy-prompt {
		background: #6366f1 !important;
		color: #ffffff !important;
		cursor: pointer;
		border: none;
		transition: transform 0.15s ease;
	}
	.badge-copy-prompt:hover {
		transform: scale(1.15);
	}

	/* Sidebar Clip Inspector for Storyboard Clip */
	.btn-replace-thumb {
		margin-top: 8px;
		width: 100%;
	}
	.thumb-placeholder-box {
		height: 110px;
		background: rgba(15, 23, 42, 0.6);
		border: 2px dashed rgba(168, 85, 247, 0.35);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		cursor: pointer;
		padding: 10px;
		transition: border-color 0.2s ease;
	}
	.thumb-placeholder-box:hover {
		border-color: rgba(168, 85, 247, 0.8);
		background: rgba(99, 102, 241, 0.1);
	}
	.ph-box-title {
		font-size: 0.8rem;
		font-weight: 700;
		color: #c084fc;
	}
	.ph-box-sub {
		font-size: 0.7rem;
		color: #94a3b8;
	}
	.storyboard-clip-panel {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}
	.clip-panel-label {
		font-size: 0.72rem;
		font-weight: 700;
		color: #94a3b8;
	}
	.clip-narration-text {
		margin: 4px 0 0;
		font-size: 0.8rem;
		color: #f1f5f9;
		font-style: italic;
		background: rgba(0, 0, 0, 0.25);
		padding: 6px 10px;
		border-radius: 6px;
	}
	.clip-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 4px;
	}
	.prompt-textarea {
		width: 100%;
		background: #0f172a;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		padding: 8px;
		font-size: 0.75rem;
		color: #e2e8f0;
		resize: vertical;
		font-family: inherit;
		box-sizing: border-box;
	}

	/* AI Storyboard Modal Specifics */
	.modal-card-storyboard {
		max-width: 820px;
		width: 90vw;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
	}
	.modal-subtitle {
		margin: 2px 0 0;
		font-size: 0.78rem;
		color: #94a3b8;
		font-weight: 400;
	}
	.storyboard-setup-form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.sb-form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.sb-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		color: #e2e8f0;
	}
	.sb-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.sb-hint {
		font-size: 0.72rem;
		color: #94a3b8;
	}
	.audio-drop-area {
		width: 100%;
	}
	.hidden-file-input {
		display: none;
	}
	.audio-drop-label {
		display: block;
		cursor: pointer;
	}
	.audio-empty-box {
		border: 2px dashed rgba(99, 102, 241, 0.4);
		background: rgba(99, 102, 241, 0.05);
		border-radius: 10px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		transition: all 0.2s ease;
	}
	.audio-empty-box:hover {
		border-color: rgba(99, 102, 241, 0.8);
		background: rgba(99, 102, 241, 0.12);
	}
	.audio-upload-text {
		font-weight: 600;
		font-size: 0.88rem;
		color: #e2e8f0;
	}
	.audio-upload-hint {
		font-size: 0.75rem;
		color: #94a3b8;
	}
	.audio-selected-box {
		border: 1px solid rgba(168, 85, 247, 0.5);
		background: rgba(168, 85, 247, 0.08);
		border-radius: 10px;
		padding: 14px 18px;
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.audio-sel-meta {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.audio-sel-name {
		font-weight: 600;
		font-size: 0.85rem;
		color: #f8fafc;
	}
	.audio-sel-size {
		font-size: 0.72rem;
		color: #94a3b8;
	}
	.audio-player-preview-mini {
		margin-top: 6px;
	}
	.style-presets-bar {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.preset-chip {
		background: #1e293b;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #cbd5e1;
		border-radius: 999px;
		padding: 5px 12px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.preset-chip:hover {
		background: #334155;
		color: #ffffff;
	}
	.preset-chip.active {
		background: #6366f1;
		border-color: #818cf8;
		color: #ffffff;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
	}
	.sb-textarea {
		width: 100%;
		background: #0f172a;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		padding: 10px;
		color: #e2e8f0;
		font-size: 0.82rem;
		line-height: 1.45;
		resize: vertical;
		font-family: inherit;
		box-sizing: border-box;
	}
	.sb-textarea:focus {
		outline: none;
		border-color: #818cf8;
	}
	.pacing-selector-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.pacing-card {
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: #0f172a;
		border-radius: 8px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.pacing-card input {
		display: none;
	}
	.pacing-card.selected {
		border-color: #6366f1;
		background: rgba(99, 102, 241, 0.12);
	}
	.pacing-title {
		font-weight: 700;
		font-size: 0.8rem;
		color: #f1f5f9;
	}
	.pacing-desc {
		font-size: 0.7rem;
		color: #94a3b8;
		line-height: 1.35;
	}
	.sb-loading-state {
		padding: 50px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
	}
	.ai-spin-wrapper {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
		animation: spinPulse 2s infinite ease-in-out;
	}
	@keyframes spinPulse {
		0%, 100% { transform: scale(1) rotate(0deg); }
		50% { transform: scale(1.1) rotate(180deg); }
	}

	/* Storyboard Results Review View */
	.storyboard-results-view {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.sb-summary-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(15, 23, 42, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 10px 14px;
	}
	.sb-stat-group {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.sb-stat-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.sb-stat-label {
		font-size: 0.78rem;
		color: #94a3b8;
	}
	.sb-stat-val {
		font-size: 0.85rem;
		font-weight: 700;
	}
	.sb-top-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.sb-scenes-scroll {
		max-height: 48vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-right: 4px;
	}
	.sb-scene-card {
		background: #0f172a;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.sb-card-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.sb-card-num {
		font-weight: 700;
		font-size: 0.82rem;
		color: #818cf8;
	}
	.sb-card-time {
		font-size: 0.75rem;
		color: #94a3b8;
	}
	.sb-card-badges {
		display: flex;
		gap: 4px;
		margin-left: auto;
	}
	.badge-trans {
		background: rgba(14, 165, 233, 0.2);
		color: #38bdf8;
	}
	.btn-copy-single {
		margin-left: 6px;
	}
	.sb-narration-box {
		background: rgba(0, 0, 0, 0.25);
		padding: 6px 10px;
		border-radius: 6px;
	}
	.sb-label-sub {
		font-size: 0.68rem;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.sb-narration-text {
		margin: 2px 0 0;
		font-size: 0.8rem;
		color: #f1f5f9;
		font-style: italic;
	}
	.sb-prompt-box {
		background: rgba(168, 85, 247, 0.08);
		border: 1px solid rgba(168, 85, 247, 0.25);
		padding: 8px 10px;
		border-radius: 6px;
	}
	.sb-prompt-text {
		margin: 2px 0 0;
		font-size: 0.8rem;
		color: #e2e8f0;
		line-height: 1.4;
		user-select: all;
	}
	.sb-apply-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		background: rgba(99, 102, 241, 0.08);
		border: 1px solid rgba(99, 102, 241, 0.25);
		border-radius: 8px;
		padding: 12px 16px;
	}
	.sb-footer-info {
		font-size: 0.78rem;
		color: #cbd5e1;
		line-height: 1.4;
		flex: 1;
	}

	/* =========================================================================
	   SUBTITLE STUDIO & AUTO-CAPTIONS SYSTEM (PLAYER OVERLAY, INSPECTOR & TRACK)
	   ========================================================================= */

	/* 1. Video Player Live Overlay */
	.player-subtitle-overlay {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		pointer-events: none;
		z-index: 15;
		padding: 0 24px;
	}

	.player-subtitle-overlay.pos-bottom {
		bottom: 12%;
	}

	.player-subtitle-overlay.pos-center {
		top: 50%;
		transform: translateY(-50%);
	}

	.player-subtitle-overlay.pos-top {
		top: 10%;
	}

	.subtitle-badge-display {
		display: inline-block;
		max-width: 90%;
		text-align: center;
		line-height: 1.25;
		transition: transform 0.1s ease;
		user-select: none;
	}

	.subtitle-badge-display.style-viral-yellow {
		color: #facc15;
		font-weight: 900;
		font-size: 1.55rem;
		text-shadow:
			-2px -2px 0 #000,
			2px -2px 0 #000,
			-2px 2px 0 #000,
			2px 2px 0 #000,
			0 4px 8px rgba(0, 0, 0, 0.85);
		letter-spacing: 0.5px;
	}

	.subtitle-badge-display.style-mrbeast-bold {
		color: #ffffff;
		font-weight: 900;
		font-size: 1.65rem;
		text-transform: uppercase;
		text-shadow:
			-3px -3px 0 #000,
			3px -3px 0 #000,
			-3px 3px 0 #000,
			3px 3px 0 #000,
			0 5px 12px rgba(0, 0, 0, 0.95);
		letter-spacing: 1.2px;
	}

	.subtitle-badge-display.style-minimal {
		color: #ffffff;
		font-weight: 600;
		font-size: 1.35rem;
		background: rgba(15, 23, 42, 0.75);
		backdrop-filter: blur(6px);
		padding: 6px 18px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
	}

	/* 2. Inspector Tabs Switcher */
	.inspector-tabs {
		display: flex;
		gap: 6px;
		padding: 8px 12px;
		background: #090d16;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.insp-tab-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 6px 10px;
		border-radius: 6px;
		border: 1px solid transparent;
		background: transparent;
		color: #94a3b8;
		font-size: 0.76rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.insp-tab-btn:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #e2e8f0;
	}

	.insp-tab-btn.active {
		background: rgba(168, 85, 247, 0.18);
		border-color: rgba(168, 85, 247, 0.4);
		color: #e9d5ff;
	}

	/* 3. Subtitle Inspector Settings */
	.style-preset-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 4px;
	}

	.style-preset-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
		transition: all 0.15s;
	}

	.style-preset-card:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.style-preset-card.active {
		background: rgba(168, 85, 247, 0.14);
		border-color: #a855f7;
		box-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
	}

	.style-preset-card .preset-name {
		font-size: 0.8rem;
		font-weight: 700;
		color: #f1f5f9;
	}

	.style-preset-card .preset-desc {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	.badge-scale {
		font-size: 0.72rem;
		font-weight: 700;
		color: #a855f7;
		background: rgba(168, 85, 247, 0.15);
		padding: 1px 6px;
		border-radius: 4px;
	}

	.sub-edit-form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.sub-actions-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-top: 2px;
	}

	.sub-nav-btns {
		display: flex;
		gap: 4px;
	}

	.sub-tools-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.empty-sub-select {
		padding: 18px 12px;
		text-align: center;
		color: #64748b;
		font-size: 0.78rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px dashed rgba(255, 255, 255, 0.08);
		border-radius: 6px;
	}

	.sub-list-container {
		display: flex;
		flex-direction: column;
		gap: 5px;
		max-height: 220px;
		overflow-y: auto;
		padding-right: 4px;
	}

	.sub-list-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 5px;
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.15s ease;
	}

	.sub-list-item:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.sub-list-item.active {
		background: rgba(168, 85, 247, 0.16);
		border-color: #a855f7;
	}

	.sub-list-num {
		font-size: 0.7rem;
		font-weight: 700;
		color: #facc15;
		flex-shrink: 0;
	}

	.sub-list-time {
		font-size: 0.68rem;
		color: #a855f7;
		font-family: monospace;
		flex-shrink: 0;
	}

	.sub-list-snippet {
		color: #cbd5e1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}

	/* 4. Timeline Subtitle Track (Track T1) */
	.subtitle-track {
		background: rgba(168, 85, 247, 0.03);
		border-bottom: 1px solid rgba(168, 85, 247, 0.18);
		min-height: 48px;
		height: 48px;
	}

	.text-accent-subtitle {
		color: #c084fc;
	}

	.sub-count-badge {
		font-size: 0.65rem;
		font-weight: 700;
		background: rgba(168, 85, 247, 0.22);
		color: #f3e8ff;
		padding: 1px 6px;
		border-radius: 999px;
	}

	.subtitle-content-flow {
		position: relative;
		height: 48px;
		display: flex;
		align-items: center;
	}

	.subtitle-track-empty {
		position: absolute;
		left: 12px;
		top: 6px;
		bottom: 6px;
		right: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 14px;
		background: rgba(168, 85, 247, 0.06);
		border: 1px dashed rgba(168, 85, 247, 0.3);
		border-radius: 6px;
		color: #cbd5e1;
		font-size: 0.72rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.subtitle-track-empty:hover {
		background: rgba(168, 85, 247, 0.12);
		border-color: #c084fc;
		color: #ffffff;
	}

	.subtitle-block {
		position: absolute;
		top: 6px;
		bottom: 6px;
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(126, 34, 206, 0.4));
		border: 1px solid rgba(192, 132, 252, 0.55);
		border-radius: 5px;
		cursor: pointer;
		display: flex;
		align-items: center;
		overflow: hidden;
		user-select: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.subtitle-block:hover {
		border-color: #e879f9;
		box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
	}

	.subtitle-block.active-sub-block {
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.55), rgba(147, 51, 234, 0.65));
		border-color: #f0abfc;
		box-shadow: 0 0 14px rgba(240, 171, 252, 0.6);
		z-index: 6;
	}

	.subtitle-block.current-playback-sub {
		outline: 1.5px dashed #facc15;
		outline-offset: -1px;
	}

	.subtitle-block-text {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 8px;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.subtitle-block-text .sub-index {
		font-size: 0.68rem;
		font-weight: 800;
		color: #facc15;
		flex-shrink: 0;
	}

	.subtitle-block-text .sub-label {
		font-size: 0.72rem;
		font-weight: 500;
		color: #f8fafc;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sub-resize-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 6px;
		cursor: ew-resize;
		background: rgba(255, 255, 255, 0.2);
		opacity: 0;
		transition: opacity 0.15s;
		z-index: 3;
	}

	.subtitle-block:hover .sub-resize-handle {
		opacity: 0.7;
	}

	.sub-resize-handle:hover {
		opacity: 1 !important;
		background: #facc15 !important;
	}

	.sub-resize-handle.handle-left {
		left: 0;
	}

	.sub-resize-handle.handle-right {
		right: 0;
	}

	/* 5. Toolbar button pill */
	.btn-accent-subtitle-pill {
		background: rgba(168, 85, 247, 0.22);
		border-color: rgba(168, 85, 247, 0.5);
		color: #f3e8ff;
	}

	.btn-accent-subtitle-pill:hover {
		background: rgba(168, 85, 247, 0.35);
		border-color: #c084fc;
		color: #ffffff;
	}
</style>
