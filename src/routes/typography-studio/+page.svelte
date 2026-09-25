<script>
	import { onMount } from 'svelte';
	import {
		ArrowLeft,
		Play,
		Pause,
		Download,
		Type,
		Music,
		Settings,
		CheckCircle2,
		Layers,
		FileText,
		Copy,
		Sparkles,
		Flame,
		Activity,
		Volume2,
		RefreshCw,
		RotateCcw,
		Maximize2,
		Edit3,
		ChevronDown,
		ChevronUp,
		Search,
		X,
		Palette,
		Check,
		Smartphone,
		Monitor
	} from 'lucide-svelte';
	import {
		analyzeNarrationToDiagram,
		generateDanKoeSVG,
		analyzeSentencePhases,
		splitTextIntoDanKoeBeats,
		splitSentenceIntoConsistentBeats,
		DIAGRAM_THEMES,
		SPECIAL_DIAGRAMS,
		DIAGRAM_REGISTRY,
		THEME_COLORS
	} from '$lib/typography/dynamicDiagram.js';

	// BGM Tracks
	const BGM_TRACKS = [
		{ id: 'ambient', title: 'Deep Ambient (Tenang & Reflektif)', url: '/bgm/bgm-ambient.mp3' },
		{ id: 'tension', title: 'Tension Pulse (Fokus & Berpikir)', url: '/bgm/bgm-tension.mp3' },
		{ id: 'soundhelix', title: 'Modern Flow (Dinamis)', url: '/bgm/bgm-soundhelix-1.mp3' },
		{ id: 'none', title: 'Tanpa Musik (Hanya Narasi)', url: null }
	];

	// Background Themes
	const TYPO_THEMES = [
		{ id: 'matte-black', name: 'Deep Matte Black (Dan Koe Classic)', bgUrl: '/typography/backgrounds/matte-black.png' },
		{ id: 'charcoal-amber', name: 'Charcoal Amber Glow (Warm Stoic)', bgUrl: '/typography/backgrounds/charcoal-amber.png' },
		{ id: 'cyber-emerald', name: 'Cyber Emerald (Growth & Finance)', bgUrl: '/typography/backgrounds/cyber-emerald.png' },
		{ id: 'dark-grid', name: 'Minimalist Tech Grid (Mental Model)', bgUrl: '/typography/backgrounds/dark-grid.png' }
	];

	// Highlight Color Accents Matrix (Ide 5: 20 Curated Theme Signature Accents + White)
	const ACCENT_COLORS = [
		{ id: '#F59E0B', name: 'Electric Amber (Mindset)', category: 'mindset' },
		{ id: '#10B981', name: 'Neon Emerald (Finance)', category: 'finance' },
		{ id: '#06B6D4', name: 'Vibrant Cyan (Economy)', category: 'economy' },
		{ id: '#818CF8', name: 'Deep Indigo (Psychology)', category: 'psychology' },
		{ id: '#EF4444', name: 'Crimson Red (Dark Psych)', category: 'dark_psychology' },
		{ id: '#DC2626', name: 'Blood Crimson (Military)', category: 'military' },
		{ id: '#F97316', name: 'Vital Orange (Health)', category: 'health' },
		{ id: '#3B82F6', name: 'Electric Blue (Tech)', category: 'technology' },
		{ id: '#EC4899', name: 'Neon Pink (People)', category: 'people' },
		{ id: '#EAB308', name: 'Solar Yellow (Daily)', category: 'daily_activity' },
		{ id: '#0EA5E9', name: 'Sky Azure (Earth)', category: 'earth' },
		{ id: '#D97706', name: 'Ochre Amber (Animals)', category: 'animals' },
		{ id: '#14B8A6', name: 'Ocean Teal (Nature)', category: 'nature' },
		{ id: '#84CC16', name: 'Fresh Lime (Plants)', category: 'plants' },
		{ id: '#A1A1AA', name: 'Slate Silver (Work)', category: 'work' },
		{ id: '#D4AF37', name: 'Antique Gold (History)', category: 'history' },
		{ id: '#34D399', name: 'Jade Mint (Zen)', category: 'zen' },
		{ id: '#A855F7', name: 'Cosmic Violet (Space)', category: 'space' },
		{ id: '#FB7185', name: 'Rose Coral (Emotions)', category: 'emotions' },
		{ id: '#C084FC', name: 'Creator Purple (Creator)', category: 'creator' },
		{ id: '#FFFFFF', name: 'Pure White (Monochrome)', category: 'mono' }
	];

	// Voices
	const VOICES = [
		{ id: 'id-ID-ArdiNeural', name: 'Ardi (Pria - Tegas & Stoik)', lang: 'id-ID' },
		{ id: 'id-ID-GadisNeural', name: 'Gadis (Wanita - Tenang & Jernih)', lang: 'id-ID' },
		{ id: 'en-US-ChristopherNeural', name: 'Christopher (Pria - Deep Thought)', lang: 'en-US' },
		{ id: 'en-US-JennyNeural', name: 'Jenny (Wanita - Clear Direct)', lang: 'en-US' }
	];

	// Minimalist Clean Font Styles (Dan Koe Aesthetic)
	const FONTS = [
		{ id: 'Inter', name: 'Inter (Dan Koe Classic - Ultra Clean Sans)' },
		{ id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Modern Geometric Sans)' },
		{ id: 'Space Grotesk', name: 'Space Grotesk (Tech Minimalist)' },
		{ id: 'Outfit', name: 'Outfit (Clean Rounded Minimalist)' },
		{ id: 'JetBrains Mono', name: 'JetBrains Mono (Mental Model Monospace)' },
		{ id: 'system-ui', name: 'System Clean (Apple SF Pro Native)' }
	];

	const FONT_WEIGHTS = [
		{ id: '300', name: 'Light (300 - Tipis Bersih)' },
		{ id: '400', name: 'Regular (400 - Normal Rapi)' },
		{ id: '500', name: 'Medium (500 - Dan Koe Clean)' },
		{ id: '600', name: 'Semi-Bold (600 - Penegasan)' },
		{ id: '700', name: 'Bold (700 - Berbobot)' }
	];

	// State
	let script = $state('');
	let videoTitle = $state('Seni Mengendalikan Fokus di Era Gangguan');
	let scenes = $state([]);
	let currentSceneIndex = $state(0);
	let isPlaying = $state(false);
	let isRendering = $state(false);
	let isAnalyzingScript = $state(false);
	let generationStatus = $state(null);
	let renderProgress = $state(0);
	let renderStep = $state('');
	let renderError = $state(null);
	let downloadUrl = $state(null);
	let downloadFilename = $state('');
	let showCopyAlert = $state(false);
	let showNodeInspector = $state(true);

	// Live Canvas Playback & Animation State
	let sceneCurrentTime = $state(0);
	let sceneDuration = $state(4);
	let activeWordIndex = $state(-1);
	let animFrame = null;
	let kineticMode = $state('karaoke'); // 'karaoke' (word by word) | 'highlight' (all visible)
	let viewportContainer = $state(null);

	// Vector Diagram Morph & Smooth Crossfade Transition State
	let currentDisplayedSvg = $state('');
	let previousDisplayedSvg = $state('');
	let isVectorMorphing = $state(false);
	let morphTimer = null;

	function triggerVectorMorph(newSvg) {
		if (!newSvg || newSvg === currentDisplayedSvg) return;
		if (!currentDisplayedSvg) {
			currentDisplayedSvg = newSvg;
			return;
		}
		previousDisplayedSvg = currentDisplayedSvg;
		currentDisplayedSvg = newSvg;
		isVectorMorphing = true;
		if (morphTimer) clearTimeout(morphTimer);
		morphTimer = setTimeout(() => {
			isVectorMorphing = false;
			previousDisplayedSvg = '';
		}, 440);
	}

	$effect(() => {
		const curScene = scenes[currentSceneIndex];
		if (!curScene) return;
		const isLive = isPlaying && activeWordIndex >= 0 && curScene.phases && curScene.phases.length > 1;
		const activePh = isLive ? curScene.phases.find(p => activeWordIndex >= p.startWord && activeWordIndex <= p.endWord) : null;
		const nextSvg = (activePh && activePh.svg) ? activePh.svg : curScene.customSvg;
		if (nextSvg) {
			triggerVectorMorph(nextSvg);
		}
	});

	let totalVideoTime = $derived.by(() => {
		return scenes.reduce((sum, s) => sum + Number(s.audioDuration || 4) + 0.2, 0);
	});

	let elapsedGlobalTime = $derived.by(() => {
		let t = 0;
		for (let i = 0; i < currentSceneIndex; i++) {
			t += Number(scenes[i]?.audioDuration || 4) + 0.2;
		}
		return t + sceneCurrentTime;
	});

	// Visual Customization
	const EMPHASIS_STYLES = [
		{ id: 'under', name: 'Underline Draw (Dan Koe Standard)', desc: 'Garis bawah tebal presisi menggambar dari kiri' },
		{ id: 'pill', name: 'Color Pill (Modern Tech)', desc: 'Kapsul warna mengembang mulus di belakang kata' },
		{ id: 'box', name: 'Border Box (Mental Model)', desc: 'Kotak garis tipis membingkai kata presisi' },
		{ id: 'marker', name: 'Highlighter (Warm Stoic)', desc: 'Coretan stabilo miring sedikit transparan' },
		{ id: 'color', name: 'Color Swap (Pure Minimal)', desc: 'Hanya warna teks kata yang berubah menyala' },
		{ id: 'tanpa', name: 'Dim to Lit (Quiet Focus)', desc: 'Kata redup ke terang saat dibacakan' }
	];
	let selectedEmphasis = $state('under');

	// Camera Rig & Breathing (technique.md §3b, §4b)
	let camScale = $state(1.0);
	let camX = $state(0);
	let camY = $state(0);
	let camRotY = $state(0);
	let camRotX = $state(0);

	// 3D Polyhedron & Sacred Geometry Dynamic Rotation (technique.md §7)
	let diagRotY = $state(0);
	let diagRotX = $state(0);
	let corePulse = $state(1.0);

	let selectedTheme = $state('matte-black');
	let selectedAccentColor = $state('#F59E0B');
	let selectedVoice = $state('id-ID-ArdiNeural');
	let selectedBgmId = $state('ambient');
	let bgmVolume = $state(0.10);
	let selectedFont = $state('Inter');
	let selectedFontSize = $state(25);
	let selectedFontWeight = $state('500');
	let selectedLetterSpacing = $state('-0.015em');
	let renderQuality = $state('1080p');
	let selectedAspectRatio = $state('16:9'); // '16:9' | '9:16'
	let showShortsSafeZone = $state(false);

	// Audio Players
	let playerA = null;
	let playerB = null;
	let activePlayer = 'A';
	let bgmPlayer = null;

	onMount(() => {
		playerA = new Audio();
		playerB = new Audio();
		bgmPlayer = new Audio();
		bgmPlayer.loop = true;
	});

	function getSingleLineFontSize(text, baseSize, isPortraitMode = false) {
		if (!text) return baseSize;
		const len = text.trim().length;
		if (!isPortraitMode) {
			// Landscape: 840px lebar aman
			if (len <= 44) return baseSize;
			return Math.max(18, Math.floor(840 / (len * 0.50)));
		}
		// Portrait (9:16 Shorts): lebar aman container ~336px
		// Jika teks pendek/sedang (<= 26 karakter), gunakan baseSize penuh.
		// Jika teks lebih panjang (27-44 karakter), sesuaikan secara halus antara 17px - baseSize agar 100% tidak terpotong:
		const availWidth = 336;
		const autoFitSize = Math.floor(availWidth / (len * 0.49));
		return Math.max(16, Math.min(baseSize, autoFitSize));
	}

	function fitSingleLineText(node, [text, isPortrait, baseSize]) {
		function adjust() {
			if (!node) return;
			node.style.transform = 'none';

			const vp = node.closest('.canvas-viewport') || node.parentElement;
			if (!vp) return;
			const maxW = Math.max(260, vp.clientWidth - (isPortrait ? 28 : 48));

			// Ukur lebar teks sesungguhnya dengan akurat menggunakan Range API
			const range = document.createRange();
			range.selectNodeContents(node);
			const rect = range.getBoundingClientRect();
			const textW = rect.width;

			if (textW > maxW && maxW > 0) {
				const scaleRatio = Number((maxW / textW).toFixed(3));
				node.style.transform = `scale(${scaleRatio})`;
				node.style.transformOrigin = 'center center';
			} else {
				node.style.transform = 'none';
			}
		}

		requestAnimationFrame(adjust);
		const resizeObserver = new ResizeObserver(() => adjust());
		if (node.parentElement) resizeObserver.observe(node.parentElement);
		const vp = node.closest('.canvas-viewport');
		if (vp) resizeObserver.observe(vp);

		return {
			update() {
				requestAnimationFrame(adjust);
			},
			destroy() {
				resizeObserver.disconnect();
			}
		};
	}

	function setAccentColor(color) {
		selectedAccentColor = color;
		for (const sc of scenes) {
			if (sc.diagramData) {
				sc.customSvg = generateDanKoeSVG(sc.diagramData, color);
			}
			if (sc.phases && sc.phases.length) {
				sc.phases = analyzeSentencePhases(sc.narration, color);
			}
		}
		scenes = [...scenes];
	}

	// VISUAL DIAGRAM GALLERY & MULTI-COLOR ACCENT MATRIX (Ide 1 & 5)
	let showDiagramGalleryModal = $state(false);
	let galleryTargetSceneIndex = $state(0);
	let gallerySearchQuery = $state('');
	let gallerySelectedCategory = $state('all');
	let galleryAutoApplyThemeColor = $state(true);

	// All 201 diagram items flattened for fast reactive filtering
	const ALL_GALLERY_ITEMS = [
		...SPECIAL_DIAGRAMS.map(s => ({
			...s,
			categoryLabel: '✨ Sinergi Spesial',
			categoryName: 'special',
			themeColor: s.themeColor || '#F97316'
		})),
		...DIAGRAM_THEMES.flatMap(theme =>
			theme.items.map(it => ({
				...it,
				categoryLabel: theme.categoryLabel,
				categoryName: theme.categoryName,
				themeColor: theme.themeColor
			}))
		)
	];

	let filteredGalleryItems = $derived.by(() => {
		const q = gallerySearchQuery.trim().toLowerCase();
		return ALL_GALLERY_ITEMS.filter(it => {
			const matchCategory = gallerySelectedCategory === 'all' || it.categoryName === gallerySelectedCategory;
			if (!matchCategory) return false;
			if (!q) return true;
			return (
				it.name.toLowerCase().includes(q) ||
				it.id.toLowerCase().includes(q) ||
				(it.title && it.title.toLowerCase().includes(q)) ||
				(it.tag && it.tag.toLowerCase().includes(q)) ||
				(it.categoryLabel && it.categoryLabel.toLowerCase().includes(q))
			);
		});
	});

	function openDiagramGallery(sceneIdx = currentSceneIndex) {
		galleryTargetSceneIndex = Math.max(0, Math.min(sceneIdx, Math.max(0, scenes.length - 1)));
		gallerySearchQuery = '';
		gallerySelectedCategory = 'all';
		showDiagramGalleryModal = true;
	}

	function closeDiagramGallery() {
		showDiagramGalleryModal = false;
	}

	function selectDiagramFromGallery(item) {
		if (scenes.length === 0) {
			showDiagramGalleryModal = false;
			return;
		}
		onDiagramTypeChange(galleryTargetSceneIndex, item.id);
		if (galleryAutoApplyThemeColor && item.themeColor) {
			setAccentColor(item.themeColor);
		}
		showDiagramGalleryModal = false;
	}

	function handleGalleryKeydown(e) {
		if (e.key === 'Escape' && showDiagramGalleryModal) {
			closeDiagramGallery();
		}
	}

	// WORKFLOW STEP 1 & 2: AI ANALISIS & GENERATE DIAGRAM
	async function runAiScriptAnalysis() {
		if (isAnalyzingScript) return;
		pausePreview();

		const cleanScript = (script || '').trim();
		if (!cleanScript) {
			generationStatus = {
				type: 'warning',
				message: '⚠️ Silakan tulis naskah atau kalimat di kolom input terlebih dahulu.'
			};
			return;
		}

		isAnalyzingScript = true;
		generationStatus = {
			type: 'info',
			message: '🧠 Menganalisis naskah, ritme Dan Koe, & diagram mental model...'
		};

		try {
			const res = await fetch('/api/analyze-typography', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					script: cleanScript,
					topic: videoTitle,
					accentColor: selectedAccentColor
				})
			});

			if (!res.ok) {
				const errJson = await res.json().catch(() => ({}));
				throw new Error(errJson.error || 'AI analysis failed');
			}

			const data = await res.json();
			if (data.scenes && data.scenes.length > 0) {
				// Flatten any scene in data.scenes that is > 46 chars into consecutive next scenes
				const flattenedScenes = [];
				for (const s of data.scenes) {
					const text = (s.narration || '').trim();
					if (text.length > 46) {
						const subBeats = splitSentenceIntoConsistentBeats(text, 44);
						if (subBeats.length > 1) {
							subBeats.forEach((beat, bIdx) => {
								const words = beat.split(/\s+/).filter(Boolean);
								const diag = bIdx === 0 && s.diagramData ? s.diagramData : analyzeNarrationToDiagram(beat, selectedAccentColor);
								flattenedScenes.push({
									...s,
									id: `scene-typo-${flattenedScenes.length}-${Date.now()}`,
									narration: beat,
									highlightWord: bIdx === 0 ? s.highlightWord : (words[0] || 'Fokus'),
									diagramData: diag,
									customSvg: generateDanKoeSVG(diag, selectedAccentColor),
									phases: analyzeSentencePhases(beat, selectedAccentColor),
									audioDuration: Math.max(2.5, Number((words.length * 0.45).toFixed(1)))
								});
							});
							continue;
						}
					}
					flattenedScenes.push(s);
				}

				scenes = flattenedScenes.map(s => {
					if (!s.phases || s.phases.length === 0) {
						s.phases = analyzeSentencePhases(s.narration, selectedAccentColor);
					}
					return s;
				});
				currentSceneIndex = 0;
				sceneCurrentTime = 0;
				activeWordIndex = -1;
				const srcLabel = data.source === 'deepseek-ai' ? 'DeepSeek AI' : 'Motion Engine';
				generationStatus = {
					type: 'success',
					message: `✨ Berhasil generate ${scenes.length} adegan (${srcLabel}) dengan diagram konsisten!`
				};
			} else {
				splitScriptByBeats();
				generationStatus = {
					type: 'success',
					message: `⚡ Berhasil generate ${scenes.length} adegan (Mode Cepat Lokal)`
				};
			}
		} catch (e) {
			console.warn('Fallback to local analyzer:', e);
			splitScriptByBeats();
			generationStatus = {
				type: 'success',
				message: `⚡ Berhasil generate ${scenes.length} adegan (Mode Cepat Lokal)`
			};
		} finally {
			isAnalyzingScript = false;
		}
	}

	function splitScriptToTypoScenes(silent = false) {
		const cleanScript = (script || '').trim();
		if (!cleanScript) {
			if (!silent) {
				generationStatus = {
					type: 'warning',
					message: '⚠️ Kolom naskah masih kosong.'
				};
			}
			return;
		}

		// Pecah baris standar. Jika ada baris > 46 huruf, otomatis dipecah ke next scene agar ukuran font konsisten!
		const rawLines = [];
		for (const line of cleanScript.split(/\n+/).map(l => l.trim()).filter(Boolean)) {
			if (line.length > 46) {
				rawLines.push(...splitSentenceIntoConsistentBeats(line, 44));
			} else {
				rawLines.push(line);
			}
		}

		const newScenes = rawLines.map((line, idx) => {
			const words = line.split(/\s+/).filter(Boolean);
			const estDur = Math.max(2.5, Number((words.length * 0.45).toFixed(1)));

			// DYNAMIC DIAGRAM & WORD PHASES: Auto-generate mental model & vector transitions per spoken word!
			const diagData = analyzeNarrationToDiagram(line, selectedAccentColor);
			const phases = analyzeSentencePhases(line, selectedAccentColor);
			const customSvg = generateDanKoeSVG(diagData, selectedAccentColor);

			return {
				id: `scene-typo-${idx}-${Date.now()}`,
				narration: line,
				topicTag: diagData.tag || `[ MENTAL MODEL // ${String(idx + 1).padStart(2, '0')} ]`,
				highlightWord: diagData.highlightWord || words[0] || 'Fokus',
				diagramData: diagData,
				customSvg: customSvg,
				diagramType: diagData.type,
				phases: phases,
				emphasisStyle: selectedEmphasis || 'under',
				layoutMode: 'diagram-stacked', // DEFAULT: Diagram Atas
				audioDuration: estDur,
				voiceAudioUrl: null
			};
		});

		scenes = newScenes;
		currentSceneIndex = 0;
		sceneCurrentTime = 0;
		activeWordIndex = -1;
		if (!silent) {
			generationStatus = {
				type: 'success',
				message: `✅ Berhasil memecah menjadi ${scenes.length} adegan (Konsisten 1 Baris)`
			};
		}
	}

	// Pecah satu adegan spesifik menjadi adegan berikutnya (Next Scene) jika teksnya terlalu panjang
	function splitSceneIntoNext(idx) {
		const targetScene = scenes[idx];
		if (!targetScene || !targetScene.narration) return;
		const beats = splitSentenceIntoConsistentBeats(targetScene.narration, 44);
		if (beats.length <= 1) {
			generationStatus = {
				type: 'info',
				message: 'ℹ️ Adegan ini sudah ringkas & pas untuk 1 baris konsisten.'
			};
			return;
		}

		const replacementScenes = beats.map((beat, bIdx) => {
			const words = beat.split(/\s+/).filter(Boolean);
			const estDur = Math.max(2.5, Number((words.length * 0.45).toFixed(1)));
			const diagData = (bIdx === 0 && targetScene.diagramData) ? targetScene.diagramData : analyzeNarrationToDiagram(beat, selectedAccentColor);
			const phases = analyzeSentencePhases(beat, selectedAccentColor);
			const customSvg = generateDanKoeSVG(diagData, selectedAccentColor);
			return {
				...targetScene,
				id: `scene-typo-split-${idx}-${bIdx}-${Date.now()}`,
				narration: beat,
				highlightWord: bIdx === 0 ? targetScene.highlightWord : (words[0] || 'Fokus'),
				diagramData: diagData,
				customSvg: customSvg,
				phases: phases,
				audioDuration: estDur,
				voiceAudioUrl: null
			};
		});

		scenes.splice(idx, 1, ...replacementScenes);
		scenes = [...scenes];
		if (currentSceneIndex >= scenes.length) currentSceneIndex = scenes.length - 1;
		generationStatus = {
			type: 'success',
			message: `⚡ Adegan #${idx + 1} berhasil dipecah menjadi ${replacementScenes.length} adegan berurutan (Next Scene)!`
		};
	}

	// Pecah naskah per frasa/beat berirama khas Dan Koe (1 Konsep/Frasa = 1 Adegan)
	function splitScriptByBeats() {
		const cleanScript = (script || '').trim();
		if (!cleanScript) {
			generationStatus = {
				type: 'warning',
				message: '⚠️ Kolom naskah masih kosong.'
			};
			return;
		}

		const beats = splitTextIntoDanKoeBeats(cleanScript);
		const newScenes = beats.map((line, idx) => {
			const words = line.split(/\s+/).filter(Boolean);
			const estDur = Math.max(2.5, Number((words.length * 0.45).toFixed(1)));

			const diagData = analyzeNarrationToDiagram(line, selectedAccentColor);
			const phases = analyzeSentencePhases(line, selectedAccentColor);
			const customSvg = generateDanKoeSVG(diagData, selectedAccentColor);

			return {
				id: `scene-typo-beat-${idx}-${Date.now()}`,
				narration: line,
				topicTag: diagData.tag || `[ BEAT // ${String(idx + 1).padStart(2, '0')} ]`,
				highlightWord: diagData.highlightWord || words[0] || 'Fokus',
				diagramData: diagData,
				customSvg: customSvg,
				diagramType: diagData.type,
				phases: phases,
				emphasisStyle: selectedEmphasis || 'under',
				layoutMode: 'diagram-stacked',
				audioDuration: estDur,
				voiceAudioUrl: null
			};
		});

		scenes = newScenes;
		currentSceneIndex = 0;
		sceneCurrentTime = 0;
		activeWordIndex = -1;
		generationStatus = {
			type: 'success',
			message: `⚡ Berhasil memecah menjadi ${scenes.length} adegan berirama!`
		};
	}

	// WORKFLOW STEP 4: REVISI (PER-SCENE INSPECTION)
	function regenerateDiagramForScene(idx, forcedType = null) {
		const sc = scenes[idx];
		if (!sc) return;
		const diagData = analyzeNarrationToDiagram(sc.narration, selectedAccentColor);
		if (forcedType) diagData.type = forcedType;
		sc.diagramData = diagData;
		sc.customSvg = generateDanKoeSVG(diagData, selectedAccentColor);
		sc.phases = analyzeSentencePhases(sc.narration, selectedAccentColor);
		if (forcedType && sc.phases.length === 1) {
			sc.phases[0].type = forcedType;
			sc.phases[0].svg = sc.customSvg;
		}
		sc.topicTag = diagData.tag;
		if (diagData.highlightWord) sc.highlightWord = diagData.highlightWord;
		sc.diagramType = diagData.type;
		scenes = [...scenes];
	}

	function onDiagramTypeChange(idx, newType) {
		const sc = scenes[idx];
		if (!sc) return;
		if (!sc.diagramData) {
			sc.diagramData = analyzeNarrationToDiagram(sc.narration, selectedAccentColor);
		}
		sc.diagramData.type = newType;
		const reg = DIAGRAM_REGISTRY[newType];
		if (reg) {
			sc.diagramData.title = reg.title;
			sc.diagramData.tag = reg.tag;
			sc.diagramData.nodes = reg.nodes ? [...reg.nodes] : ['01. FOUNDATION', '02. SYSTEM', '03. LEVERAGE', '04. MASTERY'];
		}
		sc.customSvg = generateDanKoeSVG(sc.diagramData, selectedAccentColor);
		sc.diagramType = newType;
		if (sc.layoutMode === 'pure-text') sc.layoutMode = 'diagram-stacked';
		scenes = [...scenes];
	}

	function updateDiagramNode(sceneIdx, nodeIdx, newLabel) {
		const sc = scenes[sceneIdx];
		if (!sc || !sc.diagramData || !sc.diagramData.nodes) return;
		sc.diagramData.nodes[nodeIdx] = newLabel;
		sc.customSvg = generateDanKoeSVG(sc.diagramData, selectedAccentColor);
		scenes = [...scenes];
	}

	function updateDiagramTitle(sceneIdx, newTitle) {
		const sc = scenes[sceneIdx];
		if (!sc || !sc.diagramData) return;
		sc.diagramData.title = newTitle;
		sc.customSvg = generateDanKoeSVG(sc.diagramData, selectedAccentColor);
		scenes = [...scenes];
	}

	function updateHighlightWord(sceneIdx, newWord) {
		const sc = scenes[sceneIdx];
		if (!sc) return;
		sc.highlightWord = newWord;
		scenes = [...scenes];
	}

	let isGeneratingVoice = $state(false);

	async function generateVoiceForScene(idx) {
		const sc = scenes[idx];
		if (!sc || !sc.narration) return;
		try {
			const res = await fetch('/api/edge-tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: sc.narration,
					voiceId: selectedVoice,
					rate: '-2%',
					pitch: '-2Hz',
					audioEffect: 'studio_podcast'
				})
			});
			if (!res.ok) throw new Error('Voiceover generation failed');
			const data = await res.json();
			if (data.staticAudioUrl || data.audioUrl) {
				sc.voiceAudioUrl = data.staticAudioUrl || data.audioUrl;
				if (data.duration) sc.audioDuration = Number(data.duration.toFixed(2));
				scenes = [...scenes];
			}
		} catch (e) {
			console.error(e);
		}
	}

	async function generateAllVoices() {
		if (isGeneratingVoice || !scenes.length) return;
		isGeneratingVoice = true;
		generationStatus = {
			type: 'info',
			message: `🎙️ Menghasilkan voiceover AI (${scenes.length} adegan)...`
		};
		let generatedCount = 0;
		for (let i = 0; i < scenes.length; i++) {
			if (!scenes[i].voiceAudioUrl) {
				await generateVoiceForScene(i);
			}
			if (scenes[i].voiceAudioUrl) generatedCount++;
		}
		isGeneratingVoice = false;
		generationStatus = {
			type: 'success',
			message: `✅ Voiceover siap (${generatedCount}/${scenes.length} adegan).`
		};
	}

	// WORKFLOW STEP 3: LIVE CANVAS PREVIEW ENGINE
	function togglePlay() {
		if (isPlaying) {
			pausePreview();
		} else {
			playPreview();
		}
	}

	function playFromStart() {
		pausePreview();
		currentSceneIndex = 0;
		sceneCurrentTime = 0;
		activeWordIndex = -1;
		playPreview();
	}

	function pausePreview() {
		isPlaying = false;
		if (animFrame) cancelAnimationFrame(animFrame);
		playerA?.pause();
		playerB?.pause();
		bgmPlayer?.pause();
		// Reset camera & rotation gently to home
		camScale = 1.0;
		camX = 0;
		camY = 0;
		camRotY = 0;
		camRotX = 0;
		diagRotY = 0;
		diagRotX = 0;
		corePulse = 1.0;
	}

	async function playPreview() {
		if (!scenes.length) return;
		isPlaying = true;

		// Start BGM
		const track = BGM_TRACKS.find(t => t.id === selectedBgmId);
		if (track && track.url && bgmPlayer) {
			bgmPlayer.src = track.url;
			bgmPlayer.volume = Math.min(0.3, Math.max(0.04, bgmVolume));
			bgmPlayer.play().catch(() => {});
		}

		await playScene(currentSceneIndex);
	}

	function startCanvasTicker(audioElem, expectedDuration) {
		if (animFrame) cancelAnimationFrame(animFrame);
		const startTime = performance.now();
		const dur = expectedDuration || 4;

		function update() {
			if (!isPlaying) return;
			let elapsed = 0;
			if (audioElem && audioElem.duration && !isNaN(audioElem.currentTime)) {
				elapsed = audioElem.currentTime;
				sceneDuration = audioElem.duration;
			} else {
				elapsed = (performance.now() - startTime) / 1000;
				sceneDuration = dur;
			}
			sceneCurrentTime = Math.min(elapsed, sceneDuration);

			// Technique.md §3b & 4b: Camera Breathing Rig (continuous organic sine.inOut drift)
			const t = elapsed;
			camScale = 1 + 0.015 * Math.sin(t * 0.85);
			camX = Math.sin(t * 0.55) * 5;
			camY = Math.cos(t * 0.65) * 3.5;
			camRotY = Math.sin(t * 0.45) * 1.5;
			camRotX = Math.cos(t * 0.35) * 1.0;

			// Technique.md §7: Living 3D Polyhedron smooth continuous oscillation & core pulse
			diagRotY = Math.sin(t * 0.6) * 14;
			diagRotX = Math.cos(t * 0.45) * 7;
			corePulse = 1 + 0.08 * Math.sin(t * 2.2);

			const sc = scenes[currentSceneIndex];
			if (sc && sc.narration) {
				const words = sc.narration.split(/\s+/).filter(Boolean);
				const progress = Math.min(1, sceneCurrentTime / Math.max(0.5, sceneDuration - 0.25));
				activeWordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
			}

			if (isPlaying) {
				animFrame = requestAnimationFrame(update);
			}
		}
		animFrame = requestAnimationFrame(update);
	}

	async function playScene(idx) {
		if (!isPlaying || idx >= scenes.length) {
			isPlaying = false;
			if (animFrame) cancelAnimationFrame(animFrame);
			bgmPlayer?.pause();
			return;
		}

		currentSceneIndex = idx;
		sceneCurrentTime = 0;
		activeWordIndex = -1;

		const sc = scenes[idx];
		const currPlayer = activePlayer === 'A' ? playerA : playerB;

		// Auto-generate voice if not ready
		if (!sc.voiceAudioUrl) {
			await generateVoiceForScene(idx);
		}

		// Preload next scene audio and voice ahead of time
		if (scenes[idx + 1]) {
			if (!scenes[idx + 1].voiceAudioUrl) {
				generateVoiceForScene(idx + 1).catch(() => {});
			} else {
				const nextPlayer = activePlayer === 'A' ? playerB : playerA;
				if (nextPlayer.src !== scenes[idx + 1].voiceAudioUrl) {
					nextPlayer.src = scenes[idx + 1].voiceAudioUrl;
					nextPlayer.load();
				}
			}
		}
		if (scenes[idx + 2] && !scenes[idx + 2].voiceAudioUrl) {
			generateVoiceForScene(idx + 2).catch(() => {});
		}

		if (sc.voiceAudioUrl) {
			currPlayer.src = sc.voiceAudioUrl;
			currPlayer.volume = 1.0;
			currPlayer.currentTime = 0;

			currPlayer.onplay = () => {
				startCanvasTicker(currPlayer, sc.audioDuration);
			};

			currPlayer.onended = () => {
				// Transisi instan mulus 35ms (ritme bicara alami tanpa jeda kosong)
				setTimeout(() => {
					if (isPlaying) {
						activePlayer = activePlayer === 'A' ? 'B' : 'A';
						playScene(idx + 1);
					}
				}, 35);
			};

			currPlayer.play().catch(() => {
				startCanvasTicker(null, sc.audioDuration || 4);
				setTimeout(() => {
					if (isPlaying) playScene(idx + 1);
				}, (sc.audioDuration || 4) * 1000);
			});
		} else {
			startCanvasTicker(null, sc.audioDuration || 4);
			setTimeout(() => {
				if (isPlaying) playScene(idx + 1);
			}, (sc.audioDuration || 4) * 1000);
		}
	}

	function seekScene(idx) {
		const wasPlaying = isPlaying;
		pausePreview();
		currentSceneIndex = idx;
		sceneCurrentTime = 0;
		activeWordIndex = -1;
		if (wasPlaying) playPreview();
	}

	function toggleFullscreen() {
		if (!viewportContainer) return;
		if (!document.fullscreenElement) {
			viewportContainer.requestFullscreen().catch(() => {});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	}

	function formatTime(sec) {
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	// WORKFLOW STEP 5: EXPORT VIDEO MP4
	async function startTypographyRender() {
		if (isRendering || !scenes.length) return;
		pausePreview();
		isRendering = true;
		renderProgress = 0;
		renderStep = 'Menghubungkan ke Motion Engine Dan Koe...';
		renderError = null;
		downloadUrl = null;

		try {
			const bgmTrack = BGM_TRACKS.find(t => t.id === selectedBgmId);
			const payload = {
				scenes,
				renderQuality,
				aspectRatio: selectedAspectRatio,
				videoTitle,
				bgTheme: selectedTheme,
				textColor: '#FFFFFF',
				highlightColor: selectedAccentColor,
				emphasisStyle: selectedEmphasis,
				fontFamily: selectedFont,
				fontSize: selectedFontSize,
				fontWeight: selectedFontWeight,
				showTopicTag: false, // Per user instruction: "hilangkan label. tidak usah pakai"
				bgmUrl: bgmTrack?.url || null,
				bgmVolume
			};

			const response = await fetch('/api/render-typography', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || 'Gagal memulai render video');
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
					if (line.startsWith('data: ')) {
						const eventData = JSON.parse(line.slice(6));
						if (eventData.progress !== undefined) renderProgress = eventData.progress;
						if (eventData.step) renderStep = eventData.step;
						if (eventData.error) throw new Error(eventData.error);
						if (eventData.done && eventData.downloadUrl) {
							downloadUrl = eventData.downloadUrl;
							downloadFilename = eventData.filename || 'dan-koe-typography.mp4';
							renderProgress = 100;
							renderStep = 'Video Kinetic Typography siap diunduh!';
						}
					}
				}
			}
		} catch (err) {
			renderError = err.message || 'Terjadi kesalahan saat rendering.';
		} finally {
			isRendering = false;
		}
	}

	function copyYouTubeDescription() {
		let totalSec = 0;
		const timestamps = scenes.map((s, idx) => {
			const m = Math.floor(totalSec / 60);
			const sec = Math.floor(totalSec % 60);
			const timeStr = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
			totalSec += Number(s.audioDuration || 4) + 0.2;
			return `${timeStr} - ${s.narration.slice(0, 45)}...`;
		}).join('\n');

		const fullDesc = `${videoTitle}

Framework berpikir dan mental model filosofis untuk mengendalikan fokus, produktivitas, dan waktu di era digital.

TIMESTAMPS:
${timestamps}

#DanKoe #Productivity #MentalModel #Focus #FilosofiHidup #Minimalism`;

		navigator.clipboard.writeText(fullDesc);
		showCopyAlert = true;
		setTimeout(() => { showCopyAlert = false; }, 3000);
	}
</script>

<svelte:window onkeydown={handleGalleryKeydown} />

<div class="typo-studio">
	<!-- Header -->
	<header class="studio-header">
		<div class="header-left">
			<a href="/" class="btn-back">
				<ArrowLeft size={16} />
				<span>Beranda</span>
			</a>
			<div class="header-title">
				<div class="badge-typo">
					<Activity size={13} />
					<span>DAN KOE MOTION TYPOGRAPHY STUDIO</span>
				</div>
				<h2>{videoTitle || 'Studio Typography Dan Koe'}</h2>
			</div>
		</div>

		<!-- 5-Step Workflow Breadcrumb -->
		<div class="workflow-steps-nav">
			<span class="wf-step">1. Input Script</span>
			<span class="wf-sep">➔</span>
			<span class="wf-step">2. AI Analisis</span>
			<span class="wf-sep">➔</span>
			<span class="wf-step">3. Diagram Dinamis</span>
			<span class="wf-sep">➔</span>
			<span class="wf-step">4. Preview/Revisi</span>
			<span class="wf-sep">➔</span>
			<span class="wf-step highlight">5. Export MP4</span>
		</div>

		<div class="header-right">
			<div class="studio-switchers">
				<a href="/studio" class="switcher-link">🎬 Cinematic</a>
				<a href="/stickman-studio" class="switcher-link">🎨 Stickman</a>
				<a href="/docu-studio" class="switcher-link">📰 Docu-Style</a>
			</div>
			<button class="btn btn-primary" onclick={startTypographyRender} disabled={isRendering}>
				<Download size={16} />
				<span>{isRendering ? `Rendering (${renderProgress}%)` : 'Ekspor Video MP4'}</span>
			</button>
		</div>
	</header>

	<!-- Main Workspace -->
	<main class="studio-workspace">
		<!-- Left: Controls & Script Editor (STEP 1 & 2) -->
		<aside class="panel-left">
			<div class="panel-card">
				<div class="card-header">
					<FileText size={16} />
					<h3>1. Input Naskah & AI Generator</h3>
				</div>
				<div class="card-body">
					<label class="form-label" for="typo-title">Judul Video / Topik Filosofis</label>
					<input id="typo-title" class="input-text" type="text" bind:value={videoTitle} placeholder="Contoh: Mengapa Otakmu Selalu Menunda" />

					<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
						<label class="form-label" for="typo-script" style="margin-bottom: 0;">Naskah Kalimat (1 Baris = 1 Gagasan / Beat)</label>
						<button
							type="button"
							class="btn-link-sample"
							onclick={() => {
								script = `Olahraga rutin setiap pagi membangun ketahanan tubuh dan disiplin pikiran.\nMove... builds your body.`;
							}}
							title="Muat contoh naskah olahraga & pikiran"
						>
							Muat Contoh
						</button>
					</div>
					<textarea id="typo-script" class="textarea-script" bind:value={script} rows="8" placeholder="Tulis atau tempel naskah kalimat di sini..."></textarea>

					<!-- PRIMARY WORKFLOW TRIGGER: AI ANALISIS & GENERATE DIAGRAM -->
					<button
						class="btn btn-primary full-width btn-ai-generate {isAnalyzingScript ? 'is-loading' : ''}"
						onclick={runAiScriptAnalysis}
						disabled={isAnalyzingScript}
					>
						{#if isAnalyzingScript}
							<div class="inline-spinner"></div>
							<span>Sedang Menganalisis & Merancang Scene...</span>
						{:else}
							<Sparkles size={16} />
							<span>⚡ Generate & AI Analisis Naskah</span>
						{/if}
					</button>

					{#if generationStatus}
						<div class="gen-feedback-alert {generationStatus.type}">
							<span class="gen-alert-text">{generationStatus.message}</span>
							<button type="button" class="gen-alert-dismiss" onclick={() => generationStatus = null} title="Tutup">✕</button>
						</div>
					{/if}

					<div class="btn-row" style="margin-bottom: 6px;">
						<button class="btn btn-secondary btn-sm" onclick={splitScriptToTypoScenes} title="Pecah baris standar">
							<RefreshCw size={13} />
							<span>Pecah Baris</span>
						</button>
						<button class="btn btn-secondary btn-sm" onclick={splitScriptByBeats} title="Pecah kalimat menjadi beat frasa Dan Koe (1 Konsep/Frasa = 1 Adegan)">
							<Flame size={13} />
							<span>Pecah per Beat Frasa</span>
						</button>
					</div>
					<button class="btn btn-accent btn-sm full-width" onclick={generateAllVoices} disabled={isGeneratingVoice}>
						<Volume2 size={13} />
						<span>{isGeneratingVoice ? 'Menghasilkan...' : 'TTS Semua Adegan'}</span>
					</button>
				</div>
			</div>

			<!-- Visual & Typography Props -->
			<div class="panel-card">
				<div class="card-header">
					<Settings size={16} />
					<h3>Pengaturan Visual & Audio</h3>
				</div>
				<div class="card-body">
					<!-- Kinetic Animation Mode -->
					<div class="form-group">
						<label class="form-label" for="typo-mode">Animasi Teks di Canvas</label>
						<select id="typo-mode" class="input-select" bind:value={kineticMode}>
							<option value="karaoke">⚡ Word-by-Word Pop (Kata Muncul Sesuai Suara)</option>
							<option value="highlight">✨ Full Text (Sorot Kata yang Sedang Bicara)</option>
						</select>
					</div>

					<!-- Font Selector -->
					<div class="form-group">
						<label class="form-label" for="typo-font">Gaya Tipografi (Font Minimalis Clean)</label>
						<select id="typo-font" class="input-select" bind:value={selectedFont}>
							{#each FONTS as f}
								<option value={f.id}>{f.name}</option>
							{/each}
						</select>
					</div>

					<!-- Pengaturan Ukuran Font (Slider & Preset) -->
					<div class="form-group">
						<div class="form-label-row">
							<label class="form-label" for="typo-font-size">Ukuran Font</label>
							<span class="font-size-val">{selectedFontSize}px</span>
						</div>
						<div class="font-size-slider-row">
							<input
								id="typo-font-size"
								type="range"
								min="16"
								max="44"
								step="1"
								bind:value={selectedFontSize}
								class="font-range-input"
							/>
							<div class="font-size-presets">
								<button
									type="button"
									class="btn-size-preset {selectedFontSize === 18 ? 'active' : ''}"
									onclick={() => selectedFontSize = 18}
								>S (18px)</button>
								<button
									type="button"
									class="btn-size-preset {selectedFontSize === 25 ? 'active' : ''}"
									onclick={() => selectedFontSize = 25}
								>M (25px)</button>
								<button
									type="button"
									class="btn-size-preset {selectedFontSize === 32 ? 'active' : ''}"
									onclick={() => selectedFontSize = 32}
								>L (32px)</button>
								<button
									type="button"
									class="btn-size-preset {selectedFontSize === 40 ? 'active' : ''}"
									onclick={() => selectedFontSize = 40}
								>XL (40px)</button>
							</div>
						</div>
					</div>

					<!-- Ketebalan Font (Font Weight) -->
					<div class="form-group">
						<label class="form-label" for="typo-font-weight">Ketebalan Font (Clean Minimalis)</label>
						<select id="typo-font-weight" class="input-select" bind:value={selectedFontWeight}>
							{#each FONT_WEIGHTS as fw}
								<option value={fw.id}>{fw.name}</option>
							{/each}
						</select>
					</div>

					<!-- Format & Orientasi Video (16:9 Landscape vs 9:16 Shorts) -->
					<div class="form-group">
						<label class="form-label" for="typo-aspect">Format Orientasi Video</label>
						<select id="typo-aspect" class="input-select" bind:value={selectedAspectRatio}>
							<option value="16:9">🖥️ 16:9 Landscape (YouTube Reguler)</option>
							<option value="9:16">📱 9:16 Portrait (Shorts / Reels / TikTok)</option>
						</select>
					</div>

					<!-- Resolusi Render -->
					<div class="form-group">
						<label class="form-label" for="typo-quality">Kualitas Video Ekspor</label>
						<select id="typo-quality" class="input-select" bind:value={renderQuality}>
							<option value="1080p">1080p (Full HD - {selectedAspectRatio === '9:16' ? '1080x1920' : '1920x1080'})</option>
							<option value="720p">720p (Cepat - {selectedAspectRatio === '9:16' ? '720x1280' : '1280x720'})</option>
						</select>
					</div>

					<!-- Background Theme -->
					<div class="form-group">
						<label class="form-label" for="typo-theme">Tekstur Latar Belakang</label>
						<select id="typo-theme" class="input-select" bind:value={selectedTheme}>
							{#each TYPO_THEMES as t}
								<option value={t.id}>{t.name}</option>
							{/each}
						</select>
					</div>

					<!-- Accent Color Selector -->
					<div class="form-group">
						<span class="form-label">Warna Kata Penekanan (Accent Glow)</span>
						<div class="color-picker-row">
							{#each ACCENT_COLORS as c}
								<button
									class="color-dot {selectedAccentColor === c.id ? 'active' : ''}"
									style="background-color: {c.id};"
									title={c.name}
									onclick={() => setAccentColor(c.id)}
								></button>
							{/each}
						</div>
					</div>

					<!-- Emphasis Style (technique.md §1) -->
					<div class="form-group">
						<label class="form-label" for="typo-emphasis">Gaya Penekanan Kata (Emphasis)</label>
						<select id="typo-emphasis" class="input-select" bind:value={selectedEmphasis}>
							{#each EMPHASIS_STYLES as emp}
								<option value={emp.id}>{emp.name}</option>
							{/each}
						</select>
					</div>

					<!-- Voice Selector -->
					<div class="form-group">
						<label class="form-label" for="typo-voice">Pengisi Suara Stoik</label>
						<select id="typo-voice" class="input-select" bind:value={selectedVoice}>
							{#each VOICES as v}
								<option value={v.id}>{v.name}</option>
							{/each}
						</select>
					</div>

					<!-- BGM & Volume -->
					<div class="form-group">
						<label class="form-label" for="typo-bgm">Musik Ambient</label>
						<select id="typo-bgm" class="input-select" bind:value={selectedBgmId}>
							{#each BGM_TRACKS as b}
								<option value={b.id}>{b.title}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label class="form-label" for="typo-volume">Volume Musik ({Math.round(bgmVolume * 100)}%)</label>
						<input id="typo-volume" type="range" min="0.01" max="0.25" step="0.01" bind:value={bgmVolume} class="slider" />
					</div>

					<!-- Quick Description Exporter -->
					<button class="btn btn-outline btn-sm full-width" onclick={copyYouTubeDescription}>
						<Copy size={14} />
						<span>{showCopyAlert ? '✓ Tersalin ke Clipboard!' : 'Salin Deskripsi & Timestamp'}</span>
					</button>
				</div>
			</div>
		</aside>

		<!-- Center: Live Canvas Preview (STEP 3: PREVIEW DI CANVAS) -->
		<section class="panel-center">
			<div class="canvas-wrapper">
				<!-- Aspect Ratio Mode Switcher (16:9 Landscape vs 9:16 Shorts) -->
				<div class="canvas-aspect-bar">
					<div class="aspect-toggle-group">
						<button
							type="button"
							class="btn-aspect-toggle {selectedAspectRatio === '16:9' ? 'active' : ''}"
							onclick={() => selectedAspectRatio = '16:9'}
							title="Format Landscape 16:9 untuk YouTube Panjang"
						>
							<Monitor size={14} />
							<span>16:9 Landscape</span>
						</button>
						<button
							type="button"
							class="btn-aspect-toggle {selectedAspectRatio === '9:16' ? 'active' : ''}"
							onclick={() => selectedAspectRatio = '9:16'}
							title="Mode Portrait 9:16 untuk YouTube Shorts, Instagram Reels, & TikTok"
						>
							<Smartphone size={14} />
							<span>9:16 Portrait (Shorts)</span>
						</button>
					</div>

					<div class="aspect-bar-meta">
						<span class="aspect-resolution-tag">
							{selectedAspectRatio === '9:16' ? (renderQuality === '720p' ? '720 × 1280 (Shorts)' : '1080 × 1920 (Full HD Shorts)') : (renderQuality === '720p' ? '1280 × 720 (16:9)' : '1920 × 1080 (16:9 HD)')}
						</span>

						{#if selectedAspectRatio === '9:16'}
							<label class="safe-zone-toggle-label" title="Tampilkan batas overlay antarmuka YouTube Shorts & TikTok">
								<input type="checkbox" bind:checked={showShortsSafeZone} />
								<span>Safe Zone</span>
							</label>
						{/if}
					</div>
				</div>

				<!-- Canvas Viewport with Technique.md Kinetic Motion Engine -->
				<div
					class="canvas-viewport {selectedAspectRatio === '9:16' ? 'portrait' : 'landscape'}"
					bind:this={viewportContainer}
					style="background-image: url('/typography/backgrounds/{selectedTheme}.png');"
				>
					<!-- Technique.md §2 & §7d: SVG Filters (Directional Motion Blur & Film Grain) -->
					<svg width="0" height="0" style="position: absolute; pointer-events: none;" aria-hidden="true">
						<defs>
							<!-- Directional Motion Blur (vertikal untuk inUp: y=-70% height=240% agar ekor tidak kepotong) -->
							<filter id="typo-dir-blur-vert" x="-70%" y="-70%" width="240%" height="240%">
								<feGaussianBlur stdDeviation="0 14" />
							</filter>
							<!-- Analog Texture / Deterministic Film Grain -->
							<filter id="typo-grain" x="0" y="0" width="100%" height="100%">
								<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
								<feColorMatrix type="saturate" values="0" />
							</filter>
						</defs>
					</svg>

					<!-- Grain & Horizon Ambient Glow Overlay -->
					<div class="typo-grain-overlay"></div>
					<div class="typo-horizon-glow" style="--accent: {selectedAccentColor};"></div>

					<!-- Minimalist Corner Crosshairs -->
					<div class="corner-bracket top-left">+</div>
					<div class="corner-bracket top-right">+</div>
					<div class="corner-bracket bottom-left">+</div>
					<div class="corner-bracket bottom-right">+</div>

					<!-- Shorts / Reels Safe Area Overlay (Optional toggle for creators) -->
					{#if selectedAspectRatio === '9:16' && showShortsSafeZone}
						<div class="shorts-safe-zone">
							<div class="safe-guide-top"><span>▲ HEADER / SEARCH BAR</span></div>
							<div class="safe-guide-right"><span>ACTIONS ▲</span></div>
							<div class="safe-guide-bottom"><span>▼ TITLE, CAPTION & AUDIO</span></div>
						</div>
					{/if}

					{#if isAnalyzingScript}
						<div class="canvas-analyzing-overlay">
							<div class="analyzing-spinner"></div>
							<p class="analyzing-title">🧠 AI Sedang Menganalisis Naskah & Merancang Visual...</p>
							<p class="analyzing-sub">Membedah ritme Dan Koe, sintesis mental model, dan transisi vektor</p>
						</div>
					{:else if scenes[currentSceneIndex]}
						{@const cur = scenes[currentSceneIndex]}
						{@const mode = cur.layoutMode || 'diagram-stacked'}
						{@const empStyle = cur.emphasisStyle || selectedEmphasis || 'under'}
						{@const isLivePhase = isPlaying && activeWordIndex >= 0 && cur.phases && cur.phases.length > 1}
						{@const activePhase = isLivePhase ? cur.phases.find(p => activeWordIndex >= p.startWord && activeWordIndex <= p.endWord) : null}
						{@const activeSvg = (activePhase && activePhase.svg) ? activePhase.svg : cur.customSvg}
						{@const activeTag = (activePhase && activePhase.diagData?.tag) ? activePhase.diagData.tag : (cur.topicTag || cur.diagramData?.tag || '[ MENTAL MODEL ]')}
						{@const activeType = activePhase?.type || cur.diagramType || 'polyhedron'}

						<!-- Technique.md §3b & §4b: #world Camera Rig (Continuous Organic Breathing & Drift) -->
						<div
							class="world-camera-rig"
							id="world"
							style="
								transform: translate({camX}px, {camY}px) scale({camScale}) rotateY({camRotY}deg) rotateX({camRotX}deg);
								transform-origin: 50% 50%;
							"
						>
							{#if mode === 'diagram-stacked' && (activeSvg || cur.customSvg)}
								<!-- Layout 1: Dan Koe Signature (Dynamic Diagram Generated From Text) -->
								<div class="layout-stacked">
									<div class="diagram-hero-box">
										<div
											class="dynamic-svg-wrapper"
											style="
												transform: rotateY({diagRotY}deg) rotateX({diagRotX}deg);
												transform-style: preserve-3d;
											"
										>
											<div class="vector-crossfade-stage">
												{#if isVectorMorphing && previousDisplayedSvg}
													<div class="vector-morph-layer layer-exit">
														{@html previousDisplayedSvg}
													</div>
												{/if}
												<div class="vector-morph-layer {isVectorMorphing ? 'layer-enter' : ''}">
													{@html currentDisplayedSvg || activeSvg}
												</div>
											</div>
										</div>
									</div>
									<div class="quote-caption-box">
										{#key currentSceneIndex + '-' + cur.narration}
										<h2
											class="stacked-quote"
											use:fitSingleLineText={[cur.narration, selectedAspectRatio, selectedFontSize]}
											style="
												font-family: '{selectedFont}', sans-serif;
												font-size: {getSingleLineFontSize(cur.narration, selectedFontSize, selectedAspectRatio === '9:16')}px;
												font-weight: {selectedFontWeight};
												letter-spacing: {selectedLetterSpacing};
											"
										>
											{#each cur.narration.split(/\s+/) as word, wordIdx}
												{@const clean = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}
												{@const isKeyword = cur.highlightWord && clean === cur.highlightWord.toLowerCase()}
												{@const isSpoken = !isPlaying || kineticMode === 'highlight' || wordIdx <= activeWordIndex}
												{@const isCurrent = isPlaying && wordIdx === activeWordIndex}

												{#if isKeyword}
													<!-- Technique.md §1: Menu Penekanan (.hl dengan varian under/pill/marker/box/color/tanpa) -->
													<span
														class="hl {empStyle} {isSpoken ? 'active' : ''} {isCurrent ? 'current' : ''}"
														style="--accent: {selectedAccentColor};"
													>
														{#if empStyle === 'pill'}
															<i style="background: linear-gradient(95deg, {selectedAccentColor}dd, {selectedAccentColor});"></i>
														{:else if empStyle === 'under'}
															<i style="background: {selectedAccentColor};"></i>
														{:else if empStyle === 'marker'}
															<i style="background: {selectedAccentColor};"></i>
														{:else if empStyle === 'box'}
															<i style="border-color: {selectedAccentColor};"></i>
														{/if}
														<span
															class="hl-t"
															style="
																color: {empStyle === 'pill' ? '#000000' : isSpoken ? selectedAccentColor : '#ffffff'};
																font-weight: {empStyle === 'pill' ? '700' : '600'};
																text-shadow: {empStyle !== 'pill' && isSpoken ? `0 0 16px ${selectedAccentColor}88` : 'none'};
															"
														>
															{word}
														</span>
													</span>{' '}
												{:else}
													<!-- Technique.md §1: Tipografi Hidup split per kata (.wd) & karakter (.ch inUp) -->
													<span class="wd">
														{#each word.split('') as ch, chIdx}
															<span
																class="ch {isCurrent ? 'entering' : isSpoken ? 'spoken' : 'unspoken'}"
																style="animation-delay: {chIdx * 0.02}s;"
															>{ch}</span>
														{/each}
													</span>{' '}
												{/if}
											{/each}
										</h2>
										{/key}
									</div>
								</div>

							{:else if mode === 'split-columns' && (activeSvg || cur.customSvg)}
								<!-- Layout 2: Split 2-Kolom -->
								<div class="layout-split">
									<div class="split-diagram-box">
										<div
											class="dynamic-svg-wrapper"
											style="
												transform: rotateY({diagRotY}deg) rotateX({diagRotX}deg);
												transform-style: preserve-3d;
											"
										>
											<div class="vector-crossfade-stage">
												{#if isVectorMorphing && previousDisplayedSvg}
													<div class="vector-morph-layer layer-exit">
														{@html previousDisplayedSvg}
													</div>
												{/if}
												<div class="vector-morph-layer {isVectorMorphing ? 'layer-enter' : ''}">
													{@html currentDisplayedSvg || activeSvg}
												</div>
											</div>
										</div>
									</div>
									<div class="split-quote-box">
										{#key currentSceneIndex + '-' + cur.narration}
										<h2
											class="split-quote"
											use:fitSingleLineText={[cur.narration, selectedAspectRatio, selectedFontSize]}
											style="
												font-family: '{selectedFont}', sans-serif;
												font-size: {getSingleLineFontSize(cur.narration, Math.round(selectedFontSize * 1.05), selectedAspectRatio === '9:16')}px;
												font-weight: {selectedFontWeight};
												letter-spacing: {selectedLetterSpacing};
											"
										>
											{#each cur.narration.split(/\s+/) as word, wordIdx}
												{@const clean = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}
												{@const isKeyword = cur.highlightWord && clean === cur.highlightWord.toLowerCase()}
												{@const isSpoken = !isPlaying || kineticMode === 'highlight' || wordIdx <= activeWordIndex}
												{@const isCurrent = isPlaying && wordIdx === activeWordIndex}

												{#if isKeyword}
													<span
														class="hl {empStyle} {isSpoken ? 'active' : ''} {isCurrent ? 'current' : ''}"
														style="--accent: {selectedAccentColor};"
													>
														{#if empStyle === 'pill'}
															<i style="background: linear-gradient(95deg, {selectedAccentColor}dd, {selectedAccentColor});"></i>
														{:else if empStyle === 'under'}
															<i style="background: {selectedAccentColor};"></i>
														{:else if empStyle === 'marker'}
															<i style="background: {selectedAccentColor};"></i>
														{:else if empStyle === 'box'}
															<i style="border-color: {selectedAccentColor};"></i>
														{/if}
														<span
															class="hl-t"
															style="
																color: {empStyle === 'pill' ? '#000000' : isSpoken ? selectedAccentColor : '#ffffff'};
																font-weight: {empStyle === 'pill' ? '700' : '600'};
																text-shadow: {empStyle !== 'pill' && isSpoken ? `0 0 16px ${selectedAccentColor}88` : 'none'};
															"
														>
															{word}
														</span>
													</span>{' '}
												{:else}
													<span class="wd">
														{#each word.split('') as ch, chIdx}
															<span
																class="ch {isCurrent ? 'entering' : isSpoken ? 'spoken' : 'unspoken'}"
																style="animation-delay: {chIdx * 0.02}s;"
															>{ch}</span>
														{/each}
													</span>{' '}
												{/if}
											{/each}
										</h2>
										{/key}
									</div>
								</div>

							{:else}
								<!-- Layout 3: Pure Focus Typography (Teks Besar, Berdampak, Stoik) -->
								<div class="layout-pure-typo">
									<div class="pure-quote-container">
										<h1
											class="pure-quote"
											use:fitSingleLineText={[cur.narration, selectedAspectRatio, selectedFontSize]}
											style="
												font-family: '{selectedFont}', sans-serif;
												font-size: {getSingleLineFontSize(cur.narration, Math.round(selectedFontSize * 1.55), selectedAspectRatio === '9:16')}px;
												font-weight: {selectedFontWeight};
												letter-spacing: {selectedLetterSpacing};
											"
										>
											{#each cur.narration.split(/\s+/) as word, wordIdx}
												{@const clean = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}
												{@const isKeyword = cur.highlightWord && clean === cur.highlightWord.toLowerCase()}
												{@const isSpoken = !isPlaying || kineticMode === 'highlight' || wordIdx <= activeWordIndex}
												{@const isCurrent = isPlaying && wordIdx === activeWordIndex}

												{#if isKeyword}
													<span
														class="hl {empStyle} {isSpoken ? 'active' : ''} {isCurrent ? 'current' : ''}"
														style="--accent: {selectedAccentColor};"
													>
														{#if empStyle === 'pill'}
															<i style="background: linear-gradient(95deg, {selectedAccentColor}dd, {selectedAccentColor});"></i>
														{:else if empStyle === 'under'}
															<i style="background: {selectedAccentColor};"></i>
														{:else if empStyle === 'marker'}
															<i style="background: {selectedAccentColor};"></i>
														{:else if empStyle === 'box'}
															<i style="border-color: {selectedAccentColor};"></i>
														{/if}
														<span
															class="hl-t"
															style="
																color: {empStyle === 'pill' ? '#000000' : isSpoken ? selectedAccentColor : '#ffffff'};
																font-weight: {empStyle === 'pill' ? '700' : '600'};
																text-shadow: {empStyle !== 'pill' && isSpoken ? `0 0 20px ${selectedAccentColor}99` : 'none'};
															"
														>
															{word}
														</span>
													</span>{' '}
												{:else}
													<span class="wd">
														{#each word.split('') as ch, chIdx}
															<span
																class="ch {isCurrent ? 'entering' : isSpoken ? 'spoken' : 'unspoken'}"
																style="animation-delay: {chIdx * 0.02}s;"
															>{ch}</span>
														{/each}
													</span>{' '}
												{/if}
											{/each}
										</h1>
										{#if empStyle === 'under'}
											<div class="pure-typo-underline" style="background: {selectedAccentColor};"></div>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- Bottom Animated Timeline Line inside Canvas -->
						<div class="canvas-bottom-timeline">
							<div
								class="timeline-progress-fill"
								style="width: {sceneDuration > 0 ? (sceneCurrentTime / sceneDuration) * 100 : 0}%; background: {selectedAccentColor};"
							></div>
						</div>
					{:else}
						<div class="empty-state">
							<Sparkles size={36} color={selectedAccentColor} />
							<p class="empty-title">Studio Kinetic Typography Siap</p>
							<p class="empty-desc">Tulis naskah kalimat di panel kiri, lalu klik <strong>"⚡ Generate & AI Analisis Naskah"</strong> untuk merancang visual otomatis.</p>
						</div>
					{/if}
				</div>

				<!-- Front-End Scrubber & Player Controls -->
				<div class="preview-controls">
					<div class="ctrl-left-group">
						<button class="btn-ctrl" onclick={togglePlay} title={isPlaying ? 'Jeda (Pause)' : 'Putar Video di Canvas'}>
							{#if isPlaying}
								<Pause size={18} />
							{:else}
								<Play size={18} />
							{/if}
						</button>

						<button class="btn-ctrl-secondary" onclick={playFromStart} title="Putar Dari Awal Scene 1">
							<RotateCcw size={15} />
						</button>

						<div class="time-display">
							<span class="time-current">{formatTime(elapsedGlobalTime)}</span>
							<span class="time-sep">/</span>
							<span class="time-total">{formatTime(totalVideoTime)}</span>
						</div>
					</div>

					<!-- Scene Scrubber Timeline -->
					<div class="scenes-timeline-bar">
						{#each scenes as sc, idx}
							<button
								class="scene-tick {idx === currentSceneIndex ? 'active' : ''} {idx < currentSceneIndex ? 'passed' : ''}"
								style="flex: {Number(sc.audioDuration || 4)};"
								onclick={() => seekScene(idx)}
								title="Quote #{idx + 1}: {sc.narration.slice(0, 30)}..."
							>
								{#if idx === currentSceneIndex}
									<div
										class="scene-tick-fill"
										style="width: {sceneDuration > 0 ? (sceneCurrentTime / sceneDuration) * 100 : 0}%; background: {selectedAccentColor};"
									></div>
								{/if}
							</button>
						{/each}
					</div>

					<div class="ctrl-right-group">
						<span class="scene-counter-badge">
							Scene {currentSceneIndex + 1}/{scenes.length || 1}
						</span>

						<button class="btn-fullscreen" onclick={toggleFullscreen} title="Fullscreen Canvas">
							<Maximize2 size={15} />
						</button>
					</div>
				</div>
			</div>

			<!-- Render Notification Box (STEP 5: EXPORT) -->
			{#if isRendering || downloadUrl || renderError}
				<div class="render-banner {renderError ? 'error' : downloadUrl ? 'done' : 'processing'}">
					{#if renderError}
						<p><strong>Gagal:</strong> {renderError}</p>
					{:else if downloadUrl}
						<div class="render-success-row">
							<CheckCircle2 size={20} class="success-icon" />
							<div>
								<h4>Video Kinetic Typography Selesai! ({selectedAspectRatio === '9:16' ? '9:16 Shorts' : '16:9 Landscape'})</h4>
								<p>Format MP4 {renderQuality} {selectedAspectRatio === '9:16' ? 'Portrait (Shorts/Reels/TikTok)' : 'Landscape (YouTube)'} bergaya minimalis Dan Koe siap di-download.</p>
							</div>
							<a href={downloadUrl} download={downloadFilename} class="btn btn-accent btn-sm">
								<Download size={14} />
								<span>Download Video ({downloadFilename})</span>
							</a>
						</div>
					{:else}
						<div class="render-progress-wrap">
							<div class="progress-bar-bg">
								<div class="progress-bar-fill" style="width: {renderProgress}%"></div>
							</div>
							<div class="progress-meta">
								<span>{renderStep}</span>
								<span>{renderProgress}%</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</section>

		<!-- Right: Scene Management List (STEP 4: REVISI) -->
		<aside class="panel-right">
			<div class="panel-card full-height">
				<div class="card-header card-header-split">
					<div class="header-title-wrap">
						<Layers size={16} />
						<h3>4. Daftar Adegan & Revisi ({scenes.length})</h3>
					</div>
					<button
						class="btn-open-gallery-head"
						title="Buka Visual Diagram Gallery (200 Model Wireframe)"
						onclick={() => openDiagramGallery(currentSceneIndex)}
					>
						<Palette size={13} />
						<span>Galeri (200)</span>
					</button>
				</div>
				<div class="scene-scroll-list">
					{#each scenes as sc, idx}
						<div class="scene-item {idx === currentSceneIndex ? 'active' : ''}" onclick={() => { currentSceneIndex = idx; sceneCurrentTime = 0; activeWordIndex = -1; }}>
							<div class="scene-item-header">
								<span class="scene-number">#{idx + 1}</span>
								<span class="scene-clean-badge">{sc.diagramType || 'diagram'}</span>
								<span class="scene-dur">{sc.audioDuration || 4}s</span>
							</div>

							<!-- Narration text editor (Revisi Naskah) -->
							<textarea
								class="scene-narration-input"
								bind:value={sc.narration}
								rows="2"
								onblur={() => regenerateDiagramForScene(idx)}
							></textarea>

							{#if sc.narration && sc.narration.trim().length > 46}
								<div class="scene-length-warning" onclick={(e) => e.stopPropagation()}>
									<span class="warning-text">⚠️ Teks panjang ({sc.narration.trim().length} huruf). Agar ukuran font konsisten, pecah kalimat ini:</span>
									<button
										class="btn-split-next"
										title="Pecah kalimat panjang ini menjadi beberapa adegan berikutnya"
										onclick={(e) => { e.stopPropagation(); splitSceneIntoNext(idx); }}
									>
										<Sparkles size={11} />
										<span>Pecah ke Next Scene</span>
									</button>
								</div>
							{/if}

							<div class="scene-item-tools">
								<!-- Layout mode selector -->
								<select class="mini-select" bind:value={sc.layoutMode} title="Tata Letak Adegan">
									<option value="diagram-stacked">📐 Diagram Atas</option>
									<option value="pure-text">⚡ Teks Saja</option>
									<option value="split-columns">↔ Split 2-Kolom</option>
								</select>

								<!-- Diagram Type selector -->
								<select
									class="mini-select"
									value={sc.diagramType || 'polyhedron'}
									onchange={(e) => onDiagramTypeChange(idx, e.target.value)}
									title="Model Diagram & Artefak Dan Koe (200 Tipe)"
								>
									<optgroup label="✨ Sinergi Spesial">
										<option value="mind_body">🧠🏋️ Mind-Body Dual Synthesis</option>
									</optgroup>
									{#each DIAGRAM_THEMES as theme}
										<optgroup label={theme.categoryLabel}>
											{#each theme.items as item}
												<option value={item.id}>{item.name}</option>
											{/each}
										</optgroup>
									{/each}
								</select>

								<!-- Split to Next Scene Button -->
								<button
									class="tool-btn-split"
									title="Pecah adegan ini ke Next Scene agar font tetap konsisten"
									onclick={(e) => { e.stopPropagation(); splitSceneIntoNext(idx); }}
								>
									<ChevronDown size={11} />
									<span>Next Scene</span>
								</button>

								<!-- Visual Gallery Picker Button (Ide 1) -->
								<button
									class="tool-btn-gallery"
									title="Buka Visual Diagram Gallery (200 Model)"
									onclick={(e) => { e.stopPropagation(); openDiagramGallery(idx); }}
								>
									<Palette size={11} />
									<span>Galeri</span>
								</button>

								<!-- Regenerate Diagram Button -->
								<button
									class="tool-btn-ai"
									title="Generate Ulang Diagram dari Teks"
									onclick={(e) => { e.stopPropagation(); regenerateDiagramForScene(idx); }}
								>
									<Sparkles size={11} />
									<span>Auto</span>
								</button>

								<!-- Voice Button -->
								<button class="voice-btn {sc.voiceAudioUrl ? 'voiced' : ''}" onclick={(e) => { e.stopPropagation(); generateVoiceForScene(idx); }}>
									<Volume2 size={12} />
									<span>{sc.voiceAudioUrl ? 'OK' : 'TTS'}</span>
								</button>
							</div>

							<!-- Active Scene Inspector: Direct Revisi of Diagram Title, Nodes, & Glow -->
							{#if idx === currentSceneIndex && sc.diagramData}
								<div class="scene-diagram-inspector" onclick={(e) => e.stopPropagation()}>
									<div class="inspector-header">
										<Edit3 size={11} />
										<span>Revisi Konten Diagram #{idx + 1}</span>
									</div>

									<div class="inspector-field">
										<label class="insp-label" for="insp-title-{idx}">Judul Diagram:</label>
										<input
											id="insp-title-{idx}"
											class="insp-input"
											type="text"
											value={sc.diagramData.title || ''}
											oninput={(e) => updateDiagramTitle(idx, e.target.value)}
											placeholder="Contoh: THE HABIT LOOP"
										/>
									</div>

									<div class="inspector-field">
										<label class="insp-label" for="insp-glow-{idx}">Kata Glow (Aksen Emas):</label>
										<input
											id="insp-glow-{idx}"
											class="insp-input"
											type="text"
											value={sc.highlightWord || ''}
											oninput={(e) => updateHighlightWord(idx, e.target.value)}
											placeholder="Kata yang menyala..."
										/>
									</div>

									<div class="inspector-field">
										<label class="insp-label" for="insp-emp-{idx}">Gaya Penekanan Kata:</label>
										<select
											id="insp-emp-{idx}"
											class="insp-input"
											value={sc.emphasisStyle || selectedEmphasis}
											onchange={(e) => { sc.emphasisStyle = e.target.value; scenes = [...scenes]; }}
										>
											{#each EMPHASIS_STYLES as emp}
												<option value={emp.id}>{emp.name}</option>
											{/each}
										</select>
									</div>

									{#if sc.diagramData.nodes && sc.diagramData.nodes.length > 0}
										<div class="inspector-nodes">
											<span class="insp-label">Label Node Diagram:</span>
											<div class="node-inputs-grid">
												{#each sc.diagramData.nodes as nodeLabel, nIdx}
													<input
														class="insp-node-input"
														type="text"
														value={nodeLabel}
														oninput={(e) => updateDiagramNode(idx, nIdx, e.target.value)}
														placeholder="Node {nIdx + 1}"
													/>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</aside>
	</main>

	<!-- VISUAL DIAGRAM GALLERY MODAL (Ide 1 & Ide 5) -->
	{#if showDiagramGalleryModal}
		<div
			class="diagram-gallery-backdrop"
			onclick={closeDiagramGallery}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="diagram-gallery-modal" onclick={(e) => e.stopPropagation()} role="document">
				<!-- Modal Header -->
				<div class="gallery-modal-header">
					<div class="gallery-title-group">
						<div class="gallery-title-badge">
							<Palette size={20} class="gallery-header-icon" />
							<h2>Visual Diagram & Mental Model Gallery</h2>
							<span class="gallery-count-chip">{ALL_GALLERY_ITEMS.length} Wireframes</span>
						</div>
						{#if scenes[galleryTargetSceneIndex]}
							<p class="gallery-subtitle">
								Memilih diagram untuk <strong>Adegan #{galleryTargetSceneIndex + 1}</strong>:
								<em>"{scenes[galleryTargetSceneIndex]?.narration?.slice(0, 65) || ''}..."</em>
							</p>
						{/if}
					</div>

					<div class="gallery-header-actions">
						<!-- Auto Apply Theme Accent Toggle (Ide 5) -->
						<label class="gallery-auto-color-toggle" title="Otomatis sesuaikan warna aksen adegan dengan warna tema diagram terpilih">
							<input type="checkbox" bind:checked={galleryAutoApplyThemeColor} />
							<span>Auto-Aksen Tema</span>
						</label>

						<button class="gallery-close-btn" onclick={closeDiagramGallery} title="Tutup Galeri (Esc)">
							<X size={18} />
						</button>
					</div>
				</div>

				<!-- Search & Filter Controls -->
				<div class="gallery-controls-bar">
					<div class="gallery-search-box">
						<Search size={16} class="search-icon" />
						<input
							type="text"
							placeholder="Cari 200+ diagram berdasarkan nama, tema, topik, atau kata kunci..."
							bind:value={gallerySearchQuery}
						/>
						{#if gallerySearchQuery}
							<button class="clear-search-btn" onclick={() => gallerySearchQuery = ''}>
								<X size={14} />
							</button>
						{/if}
					</div>
				</div>

				<!-- Category Filter Pills Bar -->
				<div class="gallery-pills-bar">
					<button
						class="gallery-pill {gallerySelectedCategory === 'all' ? 'active' : ''}"
						onclick={() => gallerySelectedCategory = 'all'}
					>
						Semua ({ALL_GALLERY_ITEMS.length})
					</button>
					<button
						class="gallery-pill {gallerySelectedCategory === 'special' ? 'active' : ''}"
						style="--pill-accent: #F97316;"
						onclick={() => gallerySelectedCategory = 'special'}
					>
						✨ Sinergi (1)
					</button>
					{#each DIAGRAM_THEMES as theme}
						{@const pColor = theme.themeColor || THEME_COLORS[theme.categoryName] || '#F59E0B'}
						<button
							class="gallery-pill {gallerySelectedCategory === theme.categoryName ? 'active' : ''}"
							style="--pill-accent: {pColor};"
							onclick={() => gallerySelectedCategory = theme.categoryName}
						>
							<span class="pill-dot" style="background-color: {pColor};"></span>
							<span>{theme.categoryLabel} ({theme.items.length})</span>
						</button>
					{/each}
				</div>

				<!-- Gallery Cards Grid -->
				<div class="gallery-grid-container">
					{#if filteredGalleryItems.length === 0}
						<div class="gallery-empty-state">
							<Sparkles size={36} color="#71717a" />
							<h3>Tidak Ada Diagram Ditemukan</h3>
							<p>Tidak ada wireframe yang cocok dengan pencarian "<em>{gallerySearchQuery}</em>".</p>
							<button class="btn btn-secondary btn-sm" onclick={() => { gallerySearchQuery = ''; gallerySelectedCategory = 'all'; }}>
								Reset Pencarian
							</button>
						</div>
					{:else}
						<div class="gallery-cards-grid">
							{#each filteredGalleryItems as it (it.id)}
								{@const isCurrentActive = scenes[galleryTargetSceneIndex]?.diagramType === it.id}
								<button
									type="button"
									class="gallery-card {isCurrentActive ? 'card-active' : ''}"
									style="--card-accent: {it.themeColor};"
									onclick={() => selectDiagramFromGallery(it)}
								>
									<!-- Card Top Badges -->
									<div class="gallery-card-top">
										<span class="card-category-badge" style="color: {it.themeColor}; border-color: {it.themeColor}44; background: {it.themeColor}15;">
											{it.categoryLabel.split(' ')[0]} {it.categoryName}
										</span>
										{#if isCurrentActive}
											<span class="card-active-pill">
												<Check size={11} />
												<span>Aktif</span>
											</span>
										{/if}
									</div>

									<!-- Live Kinetic SVG Preview Thumbnail -->
									<div class="gallery-card-svg-wrap">
										<svg viewBox="0 0 700 440" class="gallery-card-svg">
											{@html it.renderSVG(it.themeColor || selectedAccentColor, it.title || it.name, it.nodes)}
										</svg>
									</div>

									<!-- Card Info Bottom -->
									<div class="gallery-card-info">
										<h4 class="card-item-name">{it.name}</h4>
										<div class="card-item-tag" style="color: {it.themeColor};">{it.tag || it.title}</div>
										<div class="card-action-bar">
											<span class="card-select-label">
												{isCurrentActive ? '✓ Sedang Digunakan' : 'Gunakan Diagram Ini →'}
											</span>
										</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Modal Footer -->
				<div class="gallery-modal-footer">
					<span class="gallery-footer-info">
						Menampilkan {filteredGalleryItems.length} dari {ALL_GALLERY_ITEMS.length} diagram visual Dan Koe
					</span>
					<button class="btn btn-secondary btn-sm" onclick={closeDiagramGallery}>
						Tutup (Esc)
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.typo-studio {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: #09090b;
		color: #e4e4e7;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.studio-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 24px;
		background: #0f0f12;
		border-bottom: 1px solid #1e1e24;
		position: sticky;
		top: 0;
		z-index: 40;
		gap: 16px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.btn-back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #a1a1aa;
		font-size: 13px;
		text-decoration: none;
		padding: 6px 12px;
		border-radius: 6px;
		border: 1px solid #27272a;
		transition: all 0.2s;
	}
	.btn-back:hover {
		color: #ffffff;
		border-color: #52525b;
	}

	.badge-typo {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #f59e0b;
		color: #09090b;
		font-size: 10px;
		font-weight: 900;
		padding: 2px 8px;
		border-radius: 4px;
		letter-spacing: 1px;
	}

	.header-title h2 {
		margin: 4px 0 0 0;
		font-size: 16px;
		font-weight: 700;
		color: #fafafa;
	}

	/* Workflow Steps Breadcrumb in Header */
	.workflow-steps-nav {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #141419;
		border: 1px solid #22222b;
		border-radius: 20px;
		padding: 4px 12px;
		font-size: 11px;
		color: #71717a;
		font-family: monospace;
	}
	.wf-step.highlight {
		color: #f59e0b;
		font-weight: 700;
	}
	.wf-sep { color: #3f3f4e; }

	.header-right {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.studio-switchers {
		display: flex;
		gap: 8px;
	}

	.switcher-link {
		color: #a1a1aa;
		font-size: 12px;
		text-decoration: none;
		padding: 6px 10px;
		border-radius: 4px;
		border: 1px solid #27272a;
		transition: all 0.2s;
	}
	.switcher-link:hover {
		color: #ffffff;
		background: #18181b;
	}

	/* Studio Workspace */
	.studio-workspace {
		display: grid;
		grid-template-columns: 360px 1fr 380px;
		gap: 16px;
		padding: 16px;
		flex: 1;
		box-sizing: border-box;
	}

	.panel-card {
		background: #111115;
		border: 1px solid #1f1f26;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		margin-bottom: 16px;
	}

	.panel-card.full-height {
		height: calc(100vh - 110px);
		margin-bottom: 0;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-bottom: 1px solid #1f1f26;
		color: #fafafa;
	}
	.card-header h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
	}

	.card-body {
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.btn-ai-generate {
		font-size: 14px;
		padding: 10px;
		letter-spacing: 0.01em;
		box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25);
	}

	.gen-feedback-alert {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 9px 12px;
		border-radius: 6px;
		font-size: 12px;
		line-height: 1.4;
		border: 1px solid transparent;
		animation: fadeIn 0.2s ease-out;
	}
	.gen-feedback-alert.info {
		background: rgba(245, 158, 11, 0.12);
		border-color: rgba(245, 158, 11, 0.35);
		color: #fde68a;
	}
	.gen-feedback-alert.success {
		background: rgba(16, 185, 129, 0.12);
		border-color: rgba(16, 185, 129, 0.35);
		color: #a7f3d0;
	}
	.gen-feedback-alert.warning {
		background: rgba(245, 158, 11, 0.15);
		border-color: #f59e0b;
		color: #fbbf24;
	}
	.gen-feedback-alert.error {
		background: rgba(239, 68, 68, 0.15);
		border-color: #ef4444;
		color: #fca5a5;
	}
	.gen-alert-text {
		flex: 1;
	}
	.gen-alert-dismiss {
		background: transparent;
		border: none;
		color: inherit;
		opacity: 0.7;
		cursor: pointer;
		font-size: 13px;
		padding: 2px 4px;
		line-height: 1;
	}
	.gen-alert-dismiss:hover {
		opacity: 1;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-label {
		font-size: 12px;
		font-weight: 600;
		color: #a1a1aa;
	}

	.form-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.font-size-val {
		font-size: 11px;
		font-family: monospace;
		font-weight: 700;
		color: #f59e0b;
		background: rgba(245, 158, 11, 0.12);
		padding: 2px 7px;
		border-radius: 4px;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.font-size-slider-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.font-range-input {
		width: 100%;
		accent-color: #f59e0b;
		cursor: pointer;
		height: 5px;
		background: #272733;
		border-radius: 3px;
	}

	.font-size-presets {
		display: flex;
		gap: 5px;
	}

	.btn-size-preset {
		flex: 1;
		background: #18181e;
		border: 1px solid #272733;
		color: #a1a1aa;
		font-size: 10px;
		font-weight: 600;
		padding: 4px 6px;
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.btn-size-preset:hover {
		border-color: #52525b;
		color: #ffffff;
	}

	.btn-size-preset.active {
		border-color: #f59e0b;
		color: #ffffff;
		background: rgba(245, 158, 11, 0.15);
	}

	.scene-clean-badge {
		font-size: 10.5px;
		font-family: monospace;
		color: #8b8b94;
		background: #141419;
		padding: 2px 7px;
		border-radius: 4px;
		border: 1px solid #27272a;
	}

	.input-text, .input-select, .textarea-script {
		background: #18181e;
		border: 1px solid #272733;
		border-radius: 6px;
		color: #f4f4f5;
		padding: 8px 10px;
		font-size: 13px;
		box-sizing: border-box;
	}

	.textarea-script {
		resize: vertical;
		line-height: 1.5;
	}

	.color-picker-row {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: 6px;
		padding: 8px;
		background: #141419;
		border: 1px solid #27272a;
		border-radius: 10px;
	}

	.color-dot {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.color-dot:hover {
		transform: scale(1.2);
	}
	.color-dot.active {
		border-color: #ffffff;
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
		transform: scale(1.15);
	}

	.btn-row {
		display: flex;
		gap: 8px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		border-radius: 6px;
		padding: 8px 14px;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
	}

	.btn-sm {
		padding: 6px 10px;
		font-size: 12px;
	}

	.btn-primary {
		background: #f59e0b;
		color: #09090b;
	}
	.btn-primary:hover:not(:disabled) {
		background: #d97706;
	}

	.btn-accent {
		background: #27272a;
		color: #f4f4f5;
	}
	.btn-accent:hover {
		background: #3f3f46;
	}

	.btn-secondary {
		background: #18181b;
		color: #e4e4e7;
		border: 1px solid #27272a;
	}
	.btn-secondary:hover {
		background: #27272a;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid #3f3f46;
		color: #d4d4d8;
	}
	.btn-outline:hover {
		border-color: #71717a;
		color: #ffffff;
	}

	.full-width {
		width: 100%;
	}

	/* Canvas Center Area */
	.panel-center {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.canvas-wrapper {
		background: #121216;
		border: 1px solid #27272a;
		border-radius: 8px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	/* Aspect Ratio Switcher Bar */
	.canvas-aspect-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2px 4px 6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
		margin-bottom: 2px;
		gap: 12px;
		flex-wrap: wrap;
	}

	.aspect-toggle-group {
		display: inline-flex;
		align-items: center;
		background: #18181b;
		border: 1px solid #27272a;
		border-radius: 8px;
		padding: 3px;
		gap: 3px;
	}

	.btn-aspect-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		background: transparent;
		border: none;
		color: #a1a1aa;
		font-size: 12px;
		font-weight: 500;
		padding: 5px 12px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
	}

	.btn-aspect-toggle:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.05);
	}

	.btn-aspect-toggle.active {
		background: #27272a;
		color: #ffffff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
		font-weight: 600;
	}

	.aspect-bar-meta {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.aspect-resolution-tag {
		font-size: 11px;
		font-family: 'JetBrains Mono', monospace;
		color: #71717a;
		background: #18181b;
		padding: 3px 8px;
		border-radius: 4px;
		border: 1px solid #27272a;
	}

	.safe-zone-toggle-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: #a1a1aa;
		cursor: pointer;
		user-select: none;
		background: rgba(245, 158, 11, 0.08);
		border: 1px solid rgba(245, 158, 11, 0.25);
		padding: 3px 8px;
		border-radius: 4px;
		transition: all 0.15s ease;
	}

	.safe-zone-toggle-label input {
		accent-color: #f59e0b;
		cursor: pointer;
	}

	.safe-zone-toggle-label:hover {
		color: #fbbf24;
		border-color: rgba(245, 158, 11, 0.5);
	}

	.canvas-viewport {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background-size: cover;
		background-position: center;
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7);
		perspective: 1200px;
		transition: max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1), aspect-ratio 0.3s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.3s ease;
	}

	/* Portrait Mode (9:16 Shorts / Reels) */
	.canvas-viewport.portrait {
		aspect-ratio: 9 / 16;
		max-width: 380px;
		max-height: 72vh;
		margin: 0 auto;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 18px;
		box-shadow: 0 20px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	/* Shorts Safe Zone Guides */
	.shorts-safe-zone {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 18;
		border: 1px dashed rgba(245, 158, 11, 0.35);
		box-sizing: border-box;
	}

	.safe-guide-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 14%;
		background: rgba(239, 68, 68, 0.08);
		border-bottom: 1px dashed rgba(239, 68, 68, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: rgba(239, 68, 68, 0.75);
		font-family: monospace;
	}

	.safe-guide-right {
		position: absolute;
		top: 14%;
		bottom: 22%;
		right: 0;
		width: 16%;
		background: rgba(239, 68, 68, 0.08);
		border-left: 1px dashed rgba(239, 68, 68, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		writing-mode: vertical-rl;
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: rgba(239, 68, 68, 0.75);
		font-family: monospace;
	}

	.safe-guide-bottom {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 22%;
		background: rgba(239, 68, 68, 0.08);
		border-top: 1px dashed rgba(239, 68, 68, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: rgba(239, 68, 68, 0.75);
		font-family: monospace;
	}

	/* Portrait Layout Overrides */
	.canvas-viewport.portrait .layout-stacked {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px 12px 48px;
		box-sizing: border-box;
		height: 100%;
		position: relative;
	}

	.canvas-viewport.portrait .diagram-hero-box {
		width: 100%;
		flex: 1;
		max-height: 56%;
		margin: auto 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: none;
	}

	.canvas-viewport.portrait .quote-caption-box {
		width: 100%;
		max-width: 100%;
		padding: 4px 2px;
		margin-top: auto;
		margin-bottom: 24px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
		box-sizing: border-box;
	}

	.canvas-viewport.portrait .stacked-quote {
		line-height: 1.25;
		letter-spacing: -0.015em;
		white-space: nowrap;
		max-width: none;
		display: inline-block;
		text-align: center;
		will-change: transform;
	}

	/* Portrait for Split Layout: Adapts from 2-columns to vertical stack */
	.canvas-viewport.portrait .layout-split {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 24px 12px 48px;
		gap: 16px;
		height: 100%;
		position: relative;
	}

	.canvas-viewport.portrait .split-diagram-box {
		width: 100%;
		flex: 1;
		max-height: 56%;
		margin: auto 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: none;
	}

	.canvas-viewport.portrait .split-quote-box {
		width: 100%;
		text-align: center;
		justify-content: center;
		margin-top: auto;
		margin-bottom: 24px;
		display: flex;
		align-items: center;
		overflow: visible;
		box-sizing: border-box;
	}

	.canvas-viewport.portrait .split-quote {
		text-align: center;
		line-height: 1.25;
		white-space: nowrap;
		max-width: none;
		display: inline-block;
		will-change: transform;
	}

	/* Portrait for Pure Focus Typography */
	.canvas-viewport.portrait .layout-pure-typo {
		padding: 40px 10px 64px;
	}

	.canvas-viewport.portrait .pure-quote-container {
		max-width: 98%;
		overflow: visible;
	}

	.canvas-viewport.portrait .pure-quote {
		line-height: 1.25;
		white-space: nowrap;
		max-width: 100%;
		display: inline-block;
		will-change: transform;
	}

	/* Technique.md §7d: Analog Film Grain (feTurbulence fractal noise) */
	.typo-grain-overlay {
		position: absolute;
		inset: -40px;
		pointer-events: none;
		filter: url(#typo-grain);
		opacity: 0.16;
		mix-blend-mode: overlay;
		z-index: 15;
	}

	/* Technique.md §7d: Ambient Horizon Glow (radial gradient, avoids washed out text) */
	.typo-horizon-glow {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 48%;
		pointer-events: none;
		background: radial-gradient(70% 55% at 50% 112%, color-mix(in srgb, var(--accent, #f59e0b) 20%, transparent), transparent 72%);
		z-index: 2;
	}

	/* Technique.md §3b & §4b: #world Camera Rig */
	.world-camera-rig {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 10;
		will-change: transform;
		transform-style: preserve-3d;
	}

	/* Corner crosshairs */
	.corner-bracket {
		position: absolute;
		color: #3f3f46;
		font-family: monospace;
		font-size: 18px;
		user-select: none;
		z-index: 20;
	}
	.top-left { top: 16px; left: 18px; }
	.top-right { top: 16px; right: 18px; }
	.bottom-left { bottom: 16px; left: 18px; }
	.bottom-right { bottom: 16px; right: 18px; }



	/* Layout 1: Diagram Stacked (Dynamic SVG) */
	.layout-stacked {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 100%;
		padding: 38px 36px 22px;
		box-sizing: border-box;
		z-index: 5;
	}

	.diagram-hero-box {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		max-height: 64%;
	}

	@keyframes diagramEntrance {
		0% {
			opacity: 0;
			transform: scale(0.94) translateY(6px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.dynamic-svg-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.08s linear;
	}

	.vector-crossfade-stage {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.vector-morph-layer {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		will-change: opacity, transform, filter;
	}

	.vector-morph-layer.layer-exit {
		animation: vectorMorphOut 0.44s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		pointer-events: none;
		z-index: 1;
	}

	.vector-morph-layer.layer-enter {
		animation: vectorMorphIn 0.44s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		z-index: 2;
	}

	@keyframes vectorMorphOut {
		0% {
			opacity: 1;
			transform: scale(1) translateY(0);
			filter: blur(0px);
		}
		100% {
			opacity: 0;
			transform: scale(1.06) translateY(-4px);
			filter: blur(8px);
		}
	}

	@keyframes vectorMorphIn {
		0% {
			opacity: 0;
			transform: scale(0.93) translateY(6px);
			filter: blur(8px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
			filter: blur(0px);
		}
	}

	.vector-morph-layer :global(svg) {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.7));
	}

	.quote-caption-box {
		width: 96%;
		max-width: 900px;
		text-align: center;
		padding: 6px 12px;
		background: transparent;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
		box-sizing: border-box;
	}

	/* Technique.md §1: Living Typography Text Rules */
	/* Sentence case, weight 500-600, clean white with drop shadow - Strictly 1 Line Clean */
	.stacked-quote {
		margin: 0;
		line-height: 1.25;
		font-weight: 500;
		letter-spacing: -0.012em;
		color: #ffffff;
		text-shadow: 0 4px 28px rgba(0, 0, 0, 0.6);
		white-space: nowrap;
		max-width: none;
		display: inline-block;
		text-align: center;
		will-change: transform;
	}

	/* Layout 2: Split Columns */
	.layout-split {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		align-items: center;
		width: 100%;
		height: 100%;
		padding: 40px 40px 20px;
		box-sizing: border-box;
		gap: 20px;
		z-index: 5;
	}

	.split-diagram-box {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.split-quote-box {
		display: flex;
		align-items: center;
		text-align: left;
		overflow: visible;
		max-width: 100%;
		box-sizing: border-box;
	}

	.split-quote {
		margin: 0;
		line-height: 1.25;
		font-weight: 500;
		letter-spacing: -0.015em;
		color: #ffffff;
		text-shadow: 0 4px 28px rgba(0, 0, 0, 0.6);
		white-space: nowrap;
		max-width: 100%;
		display: inline-block;
		will-change: transform;
	}

	/* Layout 3: Pure Focus Typography */
	.layout-pure-typo {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 50px 40px;
		box-sizing: border-box;
		z-index: 5;
	}

	.pure-quote-container {
		max-width: 95%;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		overflow: visible;
		box-sizing: border-box;
	}

	.pure-quote {
		margin: 0;
		line-height: 1.25;
		font-weight: 500;
		letter-spacing: -0.015em;
		color: #ffffff;
		text-shadow: 0 4px 28px rgba(0, 0, 0, 0.6);
		white-space: nowrap;
		max-width: 100%;
		display: inline-block;
		will-change: transform;
	}

	.pure-typo-underline {
		width: 54px;
		height: 3px;
		border-radius: 2px;
		opacity: 0.9;
	}

	/* ========================================================= */
	/* Technique.md §1 & §2: Living Kinetic Typography Engine    */
	/* Split per kata (.wd) & karakter (.ch) + InUp + Blur SVG   */
	/* ========================================================= */
	.wd {
		display: inline-block;
		white-space: nowrap;
		margin: 0 0.02em;
		vertical-align: baseline;
	}

	.ch {
		display: inline-block;
		will-change: transform, opacity, filter;
		transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.ch.unspoken {
		opacity: 0.18;
		transform: translateY(0) scaleY(1);
	}

	.ch.spoken {
		opacity: 1;
		transform: translateY(0) scaleY(1);
	}

	@keyframes inUpMotion {
		0% {
			opacity: 0;
			transform: translateY(60%) scaleY(1.45);
			filter: url(#typo-dir-blur-vert);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scaleY(1);
			filter: none;
		}
	}

	.ch.entering {
		animation: inUpMotion 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	/* ========================================================= */
	/* Technique.md §1: Menu Penekanan (.hl + varian)            */
	/* under | pill | marker | box | color | tanpa               */
	/* ========================================================= */
	.hl {
		position: relative;
		display: inline-block;
		margin: 0 0.16em;
		vertical-align: baseline;
		white-space: nowrap;
	}

	.hl i {
		position: absolute;
		pointer-events: none;
		transform-origin: 0 50%;
		transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
	}

	.hl-t {
		position: relative;
		z-index: 2;
		transition: color 0.25s ease, text-shadow 0.25s ease;
	}

	/* 1. under: garis bawah tebal presisi menggambar dari kiri (Dan Koe Standard) */
	.hl.under i {
		left: 0;
		right: 0;
		bottom: -0.08em;
		height: 0.15em;
		border-radius: 0.08em;
		transform: scaleX(0);
	}
	.hl.under.active i {
		transform: scaleX(1);
	}

	/* 2. pill: blok warna kapsul mengembang dari kiri */
	.hl.pill {
		padding: 0.03em 0.3em 0.05em;
		border-radius: 0.26em;
	}
	.hl.pill i {
		inset: 0;
		border-radius: inherit;
		transform: scaleX(0);
	}
	.hl.pill.active i {
		transform: scaleX(1);
	}

	/* 3. marker: coretan stabilo miring sedikit transparan */
	.hl.marker i {
		left: -0.08em;
		right: -0.08em;
		top: 0.42em;
		bottom: -0.02em;
		border-radius: 0.08em;
		opacity: 0.65;
		transform: scaleX(0) rotate(-1.5deg);
	}
	.hl.marker.active i {
		transform: scaleX(1) rotate(-1.5deg);
	}

	/* 4. box: kotak garis tipis membingkai kata presisi */
	.hl.box i {
		inset: -0.06em -0.14em;
		border-width: 0.05em;
		border-style: solid;
		border-radius: 0.14em;
		background: none;
		transform: scaleX(0);
	}
	.hl.box.active i {
		transform: scaleX(1);
	}

	/* 5. color: warna kata berubah menyala tanpa bidang */
	.hl.color i {
		display: none;
	}

	/* 6. tanpa: kata redup -> terang tanpa bidang */
	.hl.tanpa i {
		display: none;
	}

	/* Bottom Timeline Line inside Canvas */
	.canvas-bottom-timeline {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 3px;
		background: rgba(255, 255, 255, 0.08);
		z-index: 25;
	}

	.timeline-progress-fill {
		height: 100%;
		transition: width 0.08s linear;
	}

	/* Scrubber & Player Controls */
	.preview-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 4px 6px;
	}

	.ctrl-left-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.btn-ctrl {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: #f59e0b;
		border: none;
		color: #09090b;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.15s, background 0.15s;
	}
	.btn-ctrl:hover {
		background: #d97706;
		transform: scale(1.05);
	}

	.btn-ctrl-secondary {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #18181b;
		border: 1px solid #27272a;
		color: #d4d4d8;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.btn-ctrl-secondary:hover {
		background: #27272a;
		color: #ffffff;
	}

	.time-display {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #a1a1aa;
		display: flex;
		gap: 4px;
	}
	.time-current { color: #f4f4f5; font-weight: 700; }
	.time-sep { color: #52525b; }

	/* Timeline Bar with Scrubber */
	.scenes-timeline-bar {
		flex: 1;
		display: flex;
		gap: 4px;
		height: 8px;
		background: #18181e;
		border-radius: 4px;
		padding: 2px;
		box-sizing: border-box;
	}

	.scene-tick {
		position: relative;
		height: 100%;
		background: #272733;
		border: none;
		border-radius: 2px;
		padding: 0;
		cursor: pointer;
		overflow: hidden;
		transition: background 0.2s;
	}
	.scene-tick:hover {
		background: #3f3f52;
	}
	.scene-tick.passed {
		background: rgba(245, 158, 11, 0.4);
	}
	.scene-tick.active {
		background: #3f3f52;
	}

	.scene-tick-fill {
		height: 100%;
		transition: width 0.08s linear;
	}

	.ctrl-right-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.scene-counter-badge {
		font-size: 11px;
		color: #a1a1aa;
		font-family: monospace;
		background: #18181e;
		border: 1px solid #272733;
		padding: 3px 8px;
		border-radius: 4px;
	}

	.btn-fullscreen {
		width: 32px;
		height: 32px;
		border-radius: 4px;
		background: #18181b;
		border: 1px solid #27272a;
		color: #a1a1aa;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.btn-fullscreen:hover {
		color: #ffffff;
		border-color: #52525b;
	}

	/* Render Notification Box */
	.render-banner {
		padding: 14px 18px;
		border-radius: 8px;
		border: 1px solid #27272a;
	}
	.render-banner.processing {
		background: #141419;
		border-color: #3b82f6;
	}
	.render-banner.done {
		background: rgba(16, 185, 129, 0.1);
		border-color: #10b981;
	}
	.render-banner.error {
		background: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
		color: #fca5a5;
	}

	.render-success-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.render-success-row h4 {
		margin: 0 0 4px 0;
		color: #10b981;
	}
	.render-success-row p {
		margin: 0;
		font-size: 12px;
		color: #a1a1aa;
	}

	.render-progress-wrap {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.progress-bar-bg {
		width: 100%;
		height: 6px;
		background: #27272a;
		border-radius: 3px;
		overflow: hidden;
	}
	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(to right, #f59e0b, #10b981);
		transition: width 0.3s;
	}
	.progress-meta {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #a1a1aa;
	}

	/* Scene Scroll List Right */
	.scene-scroll-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 12px 14px;
		overflow-y: auto;
		flex: 1;
	}

	.scene-item {
		background: #141419;
		border: 1px solid #22222b;
		border-radius: 6px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.scene-item:hover {
		border-color: #3f3f4e;
	}
	.scene-item.active {
		border-color: #f59e0b;
		background: #19181f;
	}

	.scene-item-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.scene-number {
		font-size: 11px;
		font-weight: 700;
		color: #f59e0b;
		font-family: monospace;
	}

	.scene-clean-badge {
		font-size: 10px;
		font-family: monospace;
		color: #a1a1aa;
		background: #18181e;
		border: 1px solid #272733;
		border-radius: 4px;
		padding: 2px 8px;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.scene-dur {
		font-size: 10px;
		color: #71717a;
	}

	.scene-narration-input {
		background: #0d0d10;
		border: 1px solid #272733;
		border-radius: 4px;
		color: #fafafa;
		padding: 6px 8px;
		font-size: 11px;
		line-height: 1.4;
		resize: vertical;
	}

	.scene-item-tools {
		display: grid;
		grid-template-columns: 1fr 1fr auto auto;
		gap: 6px;
		align-items: center;
	}

	.mini-select {
		background: #0d0d10;
		border: 1px solid #272733;
		border-radius: 4px;
		color: #d4d4d8;
		padding: 4px 6px;
		font-size: 10px;
	}

	.tool-btn-ai {
		background: #1f1f28;
		border: 1px solid #3f3f4e;
		color: #f59e0b;
		font-size: 10px;
		display: flex;
		align-items: center;
		gap: 3px;
		padding: 4px 6px;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 700;
	}
	.tool-btn-ai:hover {
		background: #2a2a38;
		border-color: #f59e0b;
	}

	.tool-btn-split {
		background: #181824;
		border: 1px solid #3b2d54;
		color: #c084fc;
		font-size: 10px;
		display: flex;
		align-items: center;
		gap: 3px;
		padding: 4px 6px;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.15s;
	}
	.tool-btn-split:hover {
		background: #271b40;
		border-color: #a855f7;
		color: #ffffff;
	}

	.scene-length-warning {
		margin: 4px 0 8px;
		padding: 6px 8px;
		background: rgba(245, 158, 11, 0.08);
		border: 1px dashed rgba(245, 158, 11, 0.35);
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.warning-text {
		font-size: 10px;
		color: #fbbf24;
		line-height: 1.35;
	}
	.btn-split-next {
		align-self: flex-start;
		background: #f59e0b;
		color: #000000;
		border: none;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 700;
		padding: 3px 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		transition: opacity 0.15s;
	}
	.btn-split-next:hover {
		opacity: 0.9;
	}

	.voice-btn {
		background: #27272a;
		border: 1px solid #3f3f46;
		color: #a1a1aa;
		font-size: 10px;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 6px;
		border-radius: 4px;
		cursor: pointer;
	}
	.voice-btn.voiced {
		background: rgba(16, 185, 129, 0.15);
		border-color: #10b981;
		color: #10b981;
	}

	/* Active Scene Diagram Inspector */
	.scene-diagram-inspector {
		margin-top: 6px;
		padding: 10px;
		background: #0f0f13;
		border: 1px solid #2a2a38;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.inspector-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 700;
		color: #f59e0b;
		letter-spacing: 0.5px;
	}

	.inspector-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.insp-label {
		font-size: 10px;
		font-weight: 600;
		color: #a1a1aa;
	}

	.insp-input {
		background: #181820;
		border: 1px solid #333344;
		border-radius: 4px;
		color: #ffffff;
		padding: 4px 8px;
		font-size: 11px;
	}

	.inspector-nodes {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.node-inputs-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}

	.insp-node-input {
		background: #181820;
		border: 1px solid #272733;
		border-radius: 4px;
		color: #e4e4e7;
		padding: 4px 6px;
		font-size: 10px;
	}
	.insp-node-input:focus, .insp-input:focus {
		border-color: #f59e0b;
		outline: none;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 40px;
		text-align: center;
		color: #71717a;
		gap: 12px;
	}
	.empty-title {
		font-size: 16px;
		font-weight: 700;
		color: #f4f4f5;
		margin: 0;
	}
	.empty-desc {
		font-size: 13px;
		color: #a1a1aa;
		max-width: 440px;
		line-height: 1.5;
		margin: 0;
	}

	.btn-link-sample {
		background: none;
		border: none;
		color: #f59e0b;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		padding: 2px 4px;
		text-decoration: underline;
		transition: opacity 0.15s;
	}
	.btn-link-sample:hover {
		opacity: 0.8;
	}

	.inline-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		display: inline-block;
		margin-right: 4px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.canvas-analyzing-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: rgba(10, 10, 15, 0.88);
		backdrop-filter: blur(8px);
		z-index: 25;
		gap: 14px;
		text-align: center;
		padding: 24px;
	}

	.canvas-analyzing-overlay .analyzing-spinner {
		width: 46px;
		height: 46px;
		border: 3px solid rgba(245, 158, 11, 0.2);
		border-top-color: #f59e0b;
		border-radius: 50%;
		animation: spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
		box-shadow: 0 0 24px rgba(245, 158, 11, 0.35);
	}

	.canvas-analyzing-overlay .analyzing-title {
		font-size: 16px;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 0.02em;
		margin: 0;
	}

	.canvas-analyzing-overlay .analyzing-sub {
		font-size: 12px;
		color: #a1a1aa;
		margin: 0;
		max-width: 420px;
		line-height: 1.5;
	}

	@media (max-width: 1180px) {
		.studio-workspace {
			grid-template-columns: 1fr;
		}
		.panel-card.full-height {
			height: auto;
		}
		.workflow-steps-nav {
			display: none;
		}
	}

	/* VISUAL DIAGRAM GALLERY MODAL (Ide 1 & Ide 5) */
	.card-header-split {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		width: 100%;
	}

	.header-title-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.btn-open-gallery-head {
		background: linear-gradient(135deg, #27272a, #18181b);
		border: 1px solid #3f3f46;
		color: #f4f4f5;
		border-radius: 6px;
		padding: 4px 10px;
		font-size: 11px;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-open-gallery-head:hover {
		border-color: #f59e0b;
		color: #f59e0b;
		box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
	}

	.tool-btn-gallery {
		background: #27272a;
		border: 1px solid #3f3f46;
		color: #f59e0b;
		border-radius: 5px;
		padding: 4px 8px;
		font-size: 11px;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tool-btn-gallery:hover {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.15);
	}

	.diagram-gallery-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.82);
		backdrop-filter: blur(10px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		animation: modalFadeIn 0.2s ease-out;
	}

	.diagram-gallery-modal {
		background: #111115;
		border: 1px solid #27272a;
		border-radius: 16px;
		width: 100%;
		max-width: 1200px;
		height: 88vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(245, 158, 11, 0.12);
		overflow: hidden;
		animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.gallery-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px;
		border-bottom: 1px solid #27272a;
		background: #141419;
		gap: 16px;
	}

	.gallery-title-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.gallery-title-badge {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	:global(.gallery-header-icon) {
		color: #f59e0b;
	}

	.gallery-title-badge h2 {
		font-size: 16px;
		font-weight: 700;
		color: #ffffff;
		margin: 0;
	}

	.gallery-count-chip {
		background: #27272a;
		color: #a1a1aa;
		font-family: monospace;
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.gallery-subtitle {
		font-size: 12px;
		color: #a1a1aa;
		margin: 0;
	}

	.gallery-subtitle strong {
		color: #f59e0b;
	}

	.gallery-header-actions {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.gallery-auto-color-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: #d4d4d8;
		cursor: pointer;
		background: #1f1f26;
		border: 1px solid #2e2e38;
		padding: 6px 10px;
		border-radius: 8px;
		user-select: none;
	}

	.gallery-close-btn {
		background: #1f1f26;
		border: 1px solid #2e2e38;
		color: #a1a1aa;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.gallery-close-btn:hover {
		color: #ffffff;
		border-color: #52525b;
		background: #27272a;
	}

	.gallery-controls-bar {
		padding: 12px 24px;
		background: #141419;
		border-bottom: 1px solid #202028;
	}

	.gallery-search-box {
		display: flex;
		align-items: center;
		gap: 10px;
		background: #09090b;
		border: 1px solid #27272a;
		border-radius: 8px;
		padding: 8px 12px;
		width: 100%;
	}

	:global(.gallery-search-box .search-icon) {
		color: #71717a;
	}

	.gallery-search-box input {
		background: transparent;
		border: none;
		color: #ffffff;
		font-size: 13px;
		width: 100%;
		outline: none;
	}

	.clear-search-btn {
		background: none;
		border: none;
		color: #71717a;
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 0;
	}

	.gallery-pills-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		overflow-x: auto;
		padding: 10px 24px;
		background: #111115;
		border-bottom: 1px solid #202028;
		scrollbar-width: thin;
	}

	.gallery-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #18181c;
		border: 1px solid #27272a;
		color: #a1a1aa;
		font-size: 11px;
		font-weight: 500;
		padding: 5px 12px;
		border-radius: 20px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.gallery-pill:hover {
		border-color: #52525b;
		color: #f4f4f5;
		background: #1e1e24;
	}

	.gallery-pill.active {
		border-color: var(--pill-accent, #f59e0b);
		color: #ffffff;
		background: rgba(255, 255, 255, 0.08);
		box-shadow: 0 0 10px var(--pill-accent, #f59e0b)33;
	}

	.pill-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		display: inline-block;
	}

	.gallery-grid-container {
		flex: 1;
		overflow-y: auto;
		padding: 20px 24px;
		background: #0c0c0e;
	}

	.gallery-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;
	}

	.gallery-card {
		background: #141419;
		border: 1px solid #222228;
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		cursor: pointer;
		transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
		text-align: left;
		position: relative;
	}

	.gallery-card:hover {
		transform: translateY(-4px);
		border-color: var(--card-accent, #f59e0b);
		box-shadow: 0 14px 30px rgba(0, 0, 0, 0.6), 0 0 16px var(--card-accent, #f59e0b)25;
	}

	.gallery-card.card-active {
		border-color: var(--card-accent, #f59e0b);
		box-shadow: 0 0 0 2px var(--card-accent, #f59e0b), 0 8px 25px var(--card-accent, #f59e0b)35;
	}

	.gallery-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 10px;
		background: #111115;
		border-bottom: 1px solid #1a1a20;
		gap: 6px;
	}

	.card-category-badge {
		font-size: 10px;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 4px;
		border: 1px solid;
		letter-spacing: 0.5px;
	}

	.card-active-pill {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 9px;
		font-weight: 800;
		background: #10b981;
		color: #000000;
		padding: 2px 6px;
		border-radius: 10px;
		letter-spacing: 0.5px;
	}

	.gallery-card-svg-wrap {
		background: #09090b;
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid #1a1a20;
		position: relative;
		overflow: hidden;
	}

	:global(.gallery-card-svg) {
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.gallery-card-info {
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.card-item-name {
		font-size: 12px;
		font-weight: 700;
		color: #ffffff;
		margin: 0 0 4px;
		line-height: 1.3;
	}

	.card-item-tag {
		font-size: 9.5px;
		font-family: monospace;
		letter-spacing: 0.8px;
		margin-bottom: 8px;
		opacity: 0.9;
	}

	.card-action-bar {
		margin-top: auto;
		padding-top: 6px;
		border-top: 1px solid #1c1c22;
	}

	.card-select-label {
		font-size: 10px;
		font-weight: 600;
		color: #a1a1aa;
		transition: color 0.2s;
	}

	.gallery-card:hover .card-select-label {
		color: var(--card-accent, #f59e0b);
	}

	.gallery-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		text-align: center;
		gap: 12px;
		color: #71717a;
	}

	.gallery-modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 24px;
		background: #141419;
		border-top: 1px solid #202028;
		font-size: 11px;
		color: #71717a;
	}

	@keyframes modalFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes modalSlideUp {
		from { transform: scale(0.96) translateY(16px); opacity: 0; }
		to { transform: scale(1) translateY(0); opacity: 1; }
	}
</style>
