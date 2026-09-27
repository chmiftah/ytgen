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
		Radio
	} from 'lucide-svelte';

	// Multi-Layer Visual Tracks State
	let visualTracks = $state([
		{
			id: 'v1',
			name: 'Visual V1 (Utama)',
			isVisible: true,
			clips: []
		},
		{
			id: 'v2',
			name: 'Visual V2 (Overlay / PIP)',
			isVisible: true,
			clips: []
		}
	]);

	// Multi-Layer Audio Tracks State
	let audioTracks = $state([
		{
			id: 'a1',
			name: 'Audio A1 (Musik Latar / BGM)',
			audioUrl: /** @type {string|null} */ (null),
			audioName: /** @type {string|null} */ (null),
			audioDuration: 0,
			volume: 0.7,
			loop: true,
			isMuted: false
		},
		{
			id: 'a2',
			name: 'Audio A2 (Voice / SFX)',
			audioUrl: /** @type {string|null} */ (null),
			audioName: /** @type {string|null} */ (null),
			audioDuration: 0,
			volume: 1.0,
			loop: false,
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
	let playheadInterval = /** @type {any} */ (null);
	let isDraggingPlayhead = $state(false);
	let resizingClip = $state(/** @type {any} */ (null)); // { trackId, index, startX, startDuration }
	let fileInputImages = $state(/** @type {HTMLInputElement|undefined} */ (undefined));
	let fileInputAudio = $state(/** @type {HTMLInputElement|undefined} */ (undefined));
	let audioTrackElements = $state(/** @type {Record<string, HTMLAudioElement>} */ ({}));

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

	// Derived: Total video duration is determined by longest track (usually main track V1)
	let totalDuration = $derived.by(() => {
		let maxDur = 0;
		for (const vt of visualTracks) {
			const dur = vt.clips.reduce((sum, c) => sum + Number(c.duration || 3), 0);
			if (dur > maxDur) maxDur = dur;
		}
		return Number(maxDur.toFixed(2));
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

	function seekTo(time) {
		currentTime = Math.max(0, Math.min(totalDuration, Number(time)));
		// Seek all audio elements
		for (const track of audioTracks) {
			const el = audioTrackElements[track.id];
			if (el && track.audioUrl) {
				el.currentTime = currentTime;
			}
		}
	}

	// Timeline dragging & resizing
	function handleTimelineRulerClick(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left + (timelineScrollEl?.scrollLeft || 0);
		const newTime = clickX / pxPerSec;
		seekTo(newTime);
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
			return {
				id: `demo-v1-${idx + 1}`,
				name: `${idx + 1}-slide-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`,
				imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
				duration: 4.0,
				motionEffect: idx % 2 === 0 ? 'zoom_in' : 'none'
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

		activeVisualTrackId = 'v1';
		activeClipIndex = 0;
		seekTo(0);
		showToast('Contoh Multi-Layer (2 Track Visual + 2 Track Audio) dimuat!');
	}

	// Trigger Multi-Layer Render Request to backend
	async function startRender() {
		const mainClips = visualTracks[0]?.clips || [];
		if (!mainClips.length) {
			showToast('Tambahkan minimal 1 gambar di Track Visual Utama (V1)!');
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
						motionEffect: c.motionEffect || 'none'
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
				videoTitle
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
						<!-- Layer 1: Base Background Clip (Track V1) -->
						<div
							class="clip-display {currentBaseClip.clip.motionEffect !== 'none' ? `anim-${currentBaseClip.clip.motionEffect}` : ''}"
							style="background-image: url('{currentBaseClip.clip.imageUrl}');"
						>
							<div class="clip-watermark">
								<span class="clip-idx-badge">V1</span>
								<span class="clip-filename">{currentBaseClip.clip.name}</span>
							</div>
						</div>

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
				<h3>Pengaturan Layer & Klip</h3>
			</div>

			<div class="inspector-scroll">
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
							<span>Klip [{currentVisualTrack.name}] (#{activeClipIndex + 1})</span>
							<span class="file-tag">{activeClip.name}</span>
						</div>

						<div class="thumb-preview-box">
							<img src={activeClip.imageUrl} alt={activeClip.name} class="thumb-img" />
						</div>

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

						<!-- Motion Animation Effect -->
						<div class="setting-row">
							<span class="setting-label">Efek Gerak:</span>
							<select bind:value={activeClip.motionEffect} class="select-input">
								<option value="none">⏹️ Diam (Static)</option>
								<option value="zoom_in">🔍 Ken Burns Zoom In</option>
								<option value="zoom_out">🔎 Ken Burns Zoom Out</option>
								<option value="pan_left">⬅️ Geser Halus Kiri</option>
								<option value="pan_right">➡️ Geser Halus Kanan</option>
							</select>
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
			</div>
		</aside>
	</div>

	<!-- Bottom Interactive Multi-Track Timeline -->
	<footer class="timeline-container">
		<!-- Timeline Toolbar -->
		<div class="timeline-bar">
			<div class="timeline-left-actions">
				<button class="btn btn-sm btn-primary" onclick={() => fileInputImages?.click()}>
					<Plus size={14} />
					<span>Import Gambar ke [{currentVisualTrack.name.split(' ')[0]}]</span>
				</button>
				<button class="btn btn-sm btn-secondary" onclick={addVisualTrack}>
					<Layers size={14} />
					<span>+ Track Visual</span>
				</button>
				<button class="btn btn-sm btn-secondary" onclick={addAudioTrack}>
					<Music size={14} />
					<span>+ Track Audio</span>
				</button>

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
				<div class="zoom-controller">
					<ZoomOut size={14} opacity={0.6} />
					<input
						type="range"
						min="15"
						max="120"
						step="5"
						bind:value={pxPerSec}
						class="zoom-slider"
						title="Zoom skala timeline"
					/>
					<ZoomIn size={14} opacity={0.6} />
				</div>
			</div>
		</div>

		<!-- Scrollable Tracks Workspace -->
		<div class="timeline-scrollable" bind:this={timelineScrollEl}>
			<div class="tracks-inner" style="min-width: {Math.max(1000, totalDuration * pxPerSec + 250)}px;">
				<!-- Time Ruler Track -->
				<div class="ruler-track" onclick={handleTimelineRulerClick}>
					{#each Array(Math.ceil(totalDuration) + 6) as _, sec}
						<div class="ruler-mark" style="left: {sec * pxPerSec}px;">
							<div class="ruler-line"></div>
							<span class="ruler-text">{sec}s</span>
						</div>
					{/each}

					<!-- Playhead Needle -->
					<div class="playhead-needle" style="left: {currentTime * pxPerSec}px;">
						<div class="playhead-handle">
							<span>{formatTime(currentTime)}</span>
						</div>
						<div class="playhead-line"></div>
					</div>
				</div>

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
										class="clip-card {activeVisualTrackId === vt.id && activeClipIndex === i ? 'active-clip' : ''}"
										style="width: {Math.max(48, clip.duration * pxPerSec)}px;"
										onclick={(e) => {
											e.stopPropagation();
											activeVisualTrackId = vt.id;
											activeClipIndex = i;
										}}
									>
										<div class="clip-thumb-preview">
											<img src={clip.imageUrl} alt={clip.name} loading="lazy" />
										</div>

										<div class="clip-info-strip">
											<span class="clip-index">#{i + 1}</span>
											<span class="clip-name-text">{clip.name}</span>
											<span class="clip-dur-badge">{clip.duration}s</span>
										</div>

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
									style="width: {Math.max(80, (at.audioDuration || totalDuration) * pxPerSec)}px;"
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
		position: relative;
		transition: transform 0.2s ease-out;
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

	.zoom-controller {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.zoom-slider {
		width: 80px;
		accent-color: #6366f1;
		cursor: pointer;
	}

	/* Scrollable Tracks Area */
	.timeline-scrollable {
		flex: 1;
		overflow-x: auto;
		overflow-y: auto;
		position: relative;
		background: #090c14;
	}

	.tracks-inner {
		display: flex;
		flex-direction: column;
		position: relative;
		min-height: 100%;
	}

	/* Ruler Track */
	.ruler-track {
		height: 26px;
		background: #0e1422;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		position: sticky;
		top: 0;
		z-index: 25;
		cursor: pointer;
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

	.ruler-text {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: #64748b;
		padding-left: 3px;
		user-select: none;
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
		height: 500px;
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
		padding: 4px 6px;
		gap: 3px;
		position: relative;
	}

	/* Clip Card Block */
	.clip-card {
		height: 74px;
		background: #172138;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		position: relative;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		flex-shrink: 0;
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
		padding: 0 6px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.65rem;
		gap: 4px;
	}

	.clip-index {
		font-weight: 700;
		color: #06b6d4;
	}

	.clip-name-text {
		color: #cbd5e1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.clip-dur-badge {
		font-family: var(--font-mono);
		font-weight: 700;
		color: #e2e8f0;
	}

	/* Resizing Drag Handle */
	.resize-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 12px;
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
</style>
