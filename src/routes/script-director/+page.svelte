<script>
	import { onMount, tick } from 'svelte';
	import {
		Wand2,
		Sparkles,
		Copy,
		Check,
		ArrowRight,
		MessageSquare,
		Layers,
		Send,
		RefreshCw,
		Film,
		Flame,
		Eye,
		Download,
		BookOpen,
		ChevronDown,
		ChevronRight,
		Sliders,
		Palette,
		ArrowLeft,
		CheckCircle2
	} from 'lucide-svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	// Stage: 'chat' | 'storyboard'
	let currentStage = $state('chat');

	// Chat state
	let initialPrompt = $state('');
	let chatInput = $state('');
	let isChatLoading = $state(false);
	/** @type {Array<{role: string, content: string}>} */
	let messages = $state([]);
	let quickSuggestions = $state([
		'Fokus pada angle psikologi & jebakan kebiasaan',
		'Buat hook pembuka lebih mengejutkan & misterius',
		'Konsep sudah mantap, ayo langsung buat naskah utuh!'
	]);

	// Config from Director discussion
	let projectConfig = $state({
		suggestedTitle: '',
		hookAngle: 'Curiosity gap & kontras paradoks',
		style2D: 'Stickman Minimalis Sinematik',
		characterDescription: 'A minimalist 2D black stickman with bold clean lines, expressive eyebrows and hands, wearing a subtle red tie, high contrast flat vector style',
		/** @type {string[]} */
		outline: [],
		isReadyForMasterScript: false
	});

	// Master Script & Scene state
	let isMasterGenerating = $state(false);
	let masterProgressText = $state('');
	/** @type {any} */
	let masterScriptData = $state(null);
	/** @type {any[]} */
	let allScenes = $state([]);
	let visibleSceneCount = $state(10);
	let isGeneratingPromptBatch = $state(false);
	/** @type {number|null} */
	let generatingPromptSceneId = $state(null);
	let isLoadingNextBatch = $state(false);
	let isStoryFinished = $state(false);
	let totalTargetScenes = $state(88);

	// Toast state
	let toastMessage = $state('');
	/** @type {any} */
	let toastTimeout = null;

	function showToast(/** @type {string} */ msg) {
		toastMessage = msg;
		if (toastTimeout) clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => {
			toastMessage = '';
		}, 3000);
	}

	// Format AI markdown responses nicely
	function formatMarkdown(/** @type {string} */ raw) {
		if (!raw) return '';
		let text = raw
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');

		// Normalize weird LLM markdown like *+ or +*
		text = text.replace(/\*\+/g, '**').replace(/\+\*/g, '**');

		// Triple asterisks: ***text*** -> bold italic
		text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="md-bold"><em>$1</em></strong>');

		// Double asterisks: **text** -> strong
		text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>');

		// Single asterisk: *text* -> em
		text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

		// Backtick code: `code`
		text = text.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');

		// Process lines
		const lines = text.split('\n');
		const formatted = [];

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) {
				formatted.push('<div class="md-spacer"></div>');
				continue;
			}

			// Headings
			if (trimmed.startsWith('### ')) {
				formatted.push(`<h4 class="md-heading">${trimmed.slice(4)}</h4>`);
				continue;
			}
			if (trimmed.startsWith('## ')) {
				formatted.push(`<h3 class="md-heading">${trimmed.slice(3)}</h3>`);
				continue;
			}

			// Numbered lists: 1. Text
			const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
			if (numMatch) {
				formatted.push(`<div class="md-list-item"><span class="md-list-num">${numMatch[1]}</span><div class="md-list-body">${numMatch[2]}</div></div>`);
				continue;
			}

			// Bullet lists: - Text or * Text
			const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
			if (bulletMatch) {
				formatted.push(`<div class="md-bullet-item"><span class="md-bullet-dot">✦</span><div class="md-bullet-body">${bulletMatch[1]}</div></div>`);
				continue;
			}

			formatted.push(`<p class="md-p">${trimmed}</p>`);
		}

		return formatted.join('\n');
	}

	// Preset starter topics
	const STARTER_TOPICS = [
		'Kenapa Makin Keras Mencoba, Kita Makin Sering Gagal?',
		'Jebakan Dopamin: Bagaimana Algoritma HP Memprogram Otak',
		'Orang Kaya Tidak Beli Aset, Mereka Membeli Waktu',
		'Seni Berhenti Menjelaskan Diri Sendiri Kepada Orang Lain',
		'Mengapa Kelas Menengah Terjebak Bekerja 40 Tahun'
	];

	const STYLE_OPTIONS = [
		{ id: 'stickman_expressive', label: '🎨 Stickman Minimalis (Dasi Merah)', desc: 'Ekspresif, kontras tinggi, background gelap solid' },
		{ id: 'flat_vector_doodle', label: '✏️ 2D Hand-Drawn Doodle', desc: 'Gaya visual catatan visual sketchnote cerdas' },
		{ id: 'dark_monochrome', label: '🖤 2D Monokrom Noir & Aksen Kuning', desc: 'Nuansa investigatif, moody, sinematik 16:9' },
		{ id: 'infographic_vector', label: '📊 2D Infografis Modern (Kurzgesagt-lite)', desc: 'Clean vector, bentuk geometri presisi, warna berbobot' }
	];

	// Handle initial prompt submit
	async function startDiscussion(/** @type {string} */ [topicText] = ['']) {
		const targetTopic = (topicText || initialPrompt || '').trim();
		if (!targetTopic || isChatLoading) return;

		messages = [
			{ role: 'user', content: `Halo Creative Director! Saya ingin membuat naskah video YouTube 7–10 menit dengan topik: "${targetTopic}". Alurnya bersambung dari scene 1 sampai selesai dengan gaya visual 2D yang konsisten.` }
		];
		initialPrompt = '';
		chatInput = '';
		isChatLoading = true;

		try {
			const res = await fetch('/api/script-director/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages,
					topic: targetTopic,
					style2D: projectConfig.style2D,
					characterAnchor: projectConfig.characterDescription
				})
			});

			const data = await res.json();
			if (data.success && data.data) {
				const aiData = data.data;
				messages = [
					...messages,
					{ role: 'assistant', content: aiData.reply }
				];
				if (aiData.extractedConfig) {
					projectConfig = {
						...projectConfig,
						...aiData.extractedConfig,
						suggestedTitle: aiData.extractedConfig.suggestedTitle || targetTopic
					};
				}
				if (aiData.quickSuggestions && aiData.quickSuggestions.length > 0) {
					quickSuggestions = aiData.quickSuggestions;
				}
			} else {
				showToast(data.error || 'Gagal menghubungi Creative Director AI.');
			}
		} catch (err) {
			console.error(err);
			showToast('Terjadi kesalahan jaringan.');
		} finally {
			isChatLoading = false;
			await tick();
			scrollToBottom();
		}
	}

	// Send message in ongoing chat
	async function sendChatMessage(/** @type {string} */ [customMsg] = ['']) {
		const text = (customMsg || chatInput || '').trim();
		if (!text || isChatLoading) return;

		messages = [...messages, { role: 'user', content: text }];
		chatInput = '';
		isChatLoading = true;

		try {
			const res = await fetch('/api/script-director/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages,
					topic: projectConfig.suggestedTitle,
					style2D: projectConfig.style2D,
					characterAnchor: projectConfig.characterDescription
				})
			});

			const data = await res.json();
			if (data.success && data.data) {
				const aiData = data.data;
				messages = [
					...messages,
					{ role: 'assistant', content: aiData.reply }
				];
				if (aiData.extractedConfig) {
					projectConfig = {
						...projectConfig,
						...aiData.extractedConfig
					};
				}
				if (aiData.quickSuggestions && aiData.quickSuggestions.length > 0) {
					quickSuggestions = aiData.quickSuggestions;
				}
			} else {
				showToast(data.error || 'Gagal membalas obrolan.');
			}
		} catch (err) {
			console.error(err);
			showToast('Terjadi kesalahan jaringan.');
		} finally {
			isChatLoading = false;
			await tick();
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		const el = document.getElementById('chat-scroll-container');
		if (el) el.scrollTop = el.scrollHeight;
	}

	// Generate Direct Script without back-and-forth discussion
	async function generateDirectScript(customTopic = '') {
		const chosenTopic = (customTopic || initialPrompt || '').trim();
		if (!chosenTopic) {
			showToast('Tuliskan topik naskah terlebih dahulu.');
			return;
		}
		projectConfig.suggestedTitle = chosenTopic;
		projectConfig.hookAngle = 'Keresahan nyata penonton & intrik di 30 detik pertama';
		projectConfig.outline = [
			'Bab 1: Keresahan awal dan hook pembuka',
			'Bab 2: Kesalahan umum yang jarang disadari',
			'Bab 3: Akar masalah dan fakta penting',
			'Bab 4: Solusi bertahap langkah demi langkah',
			'Bab 5: Kesimpulan dan pesan penutup yang membekas'
		];
		projectConfig.isReadyForMasterScript = true;
		await generateMasterScript();
	}

	// Generate Master Script & Initial Scenes
	async function generateMasterScript() {
		if (isMasterGenerating) return;
		isMasterGenerating = true;
		masterProgressText = '🎬 Menganalisis topik & menyusun alur naskah bersambung...';

		try {
			setTimeout(() => {
				if (isMasterGenerating) masterProgressText = '✍️ Menulis narasi 7–10 menit (~1.200–1.500 kata) gaya YouTube biasa...';
			}, 3500);

			setTimeout(() => {
				if (isMasterGenerating) masterProgressText = '📐 Memecah naskah ke dalam 80–100 ketukan scene visual 2D...';
			}, 9000);

			const res = await fetch('/api/script-director/master-script', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: projectConfig.suggestedTitle || initialPrompt || 'Naskah Video YouTube',
					topic: projectConfig.suggestedTitle || initialPrompt || 'Topik Naskah',
					outline: (projectConfig.outline && projectConfig.outline.length > 0) ? projectConfig.outline : [
						'Bab 1: Keresahan awal dan hook pembuka',
						'Bab 2: Kesalahan umum yang jarang disadari',
						'Bab 3: Akar masalah dan fakta penting',
						'Bab 4: Solusi bertahap langkah demi langkah',
						'Bab 5: Kesimpulan dan pesan penutup yang membekas'
					],
					hookAngle: projectConfig.hookAngle || 'Keresahan nyata penonton',
					characterDescription: projectConfig.characterDescription,
					style2D: projectConfig.style2D
				})
			});

			const result = await res.json();
			if (result.success && result.data) {
				masterScriptData = result.data;
				totalTargetScenes = result.data.totalTargetScenes || 88;
				allScenes = (result.data.scenes || []).map((/** @type {any} */ s, /** @type {number} */ idx) => ({
					...s,
					sceneNumber: s.sceneNumber || (idx + 1),
					prompt: '' // intentionally empty until user clicks generate
				}));
				visibleSceneCount = allScenes.length;
				isStoryFinished = false;
				currentStage = 'storyboard';
				showToast(`🎉 Naskah bersambung dibuat! Scene 1–${allScenes.length} siap.`);
			} else {
				showToast(result.error || 'Gagal membuat naskah utuh.');
			}
		} catch (err) {
			console.error(err);
			showToast('Terjadi kendala teknis saat pembuatan naskah.');
		} finally {
			isMasterGenerating = false;
			masterProgressText = '';
		}
	}

	// Show/Generate next batch of scenes (e.g. 11-20, 21-30)
	async function showNextSceneBatch() {
		if (isLoadingNextBatch) return;

		// If there are already hidden scenes in memory
		if (visibleSceneCount < allScenes.length) {
			visibleSceneCount = Math.min(visibleSceneCount + 10, allScenes.length);
			showToast(`Menampilkan hingga Scene ${visibleSceneCount}`);
			return;
		}

		// Generate the next 10 scenes dynamically from the Master Script
		isLoadingNextBatch = true;
		const lastScene = allScenes[allScenes.length - 1];
		const lastNum = lastScene ? Number(lastScene.sceneNumber) : allScenes.length;

		try {
			const res = await fetch('/api/script-director/next-scenes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullScriptText: masterScriptData?.fullScriptText || '',
					lastSceneNumber: lastNum,
					lastNarration: lastScene?.narration || '',
					batchSize: 10,
					targetTotalScenes: totalTargetScenes || 88,
					characterDescription: projectConfig.characterDescription,
					style2D: projectConfig.style2D
				})
			});

			const result = await res.json();
			if (result.success && result.scenes && result.scenes.length > 0) {
				const newScenes = result.scenes.map((/** @type {any} */ s) => ({ ...s, prompt: '' }));
				allScenes = [...allScenes, ...newScenes];
				visibleSceneCount = allScenes.length;
				if (result.isStoryFinished && allScenes.length >= totalTargetScenes) {
					isStoryFinished = true;
				} else {
					isStoryFinished = false;
				}
				showToast(`✨ Scene ${lastNum + 1}–${allScenes.length} berhasil ditambahkan!`);
			} else {
				showToast(result.error || 'Gagal memuat scene lanjutan.');
			}
		} catch (err) {
			console.error(err);
			showToast('Gagal mengambil scene lanjutan.');
		} finally {
			isLoadingNextBatch = false;
		}
	}

	// Generate Prompt for a single scene
	async function generateSinglePrompt(/** @type {any} */ scene) {
		if (generatingPromptSceneId === scene.sceneNumber) return;
		generatingPromptSceneId = scene.sceneNumber;

		try {
			const res = await fetch('/api/script-director/generate-prompts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scenes: [scene],
					characterDescription: projectConfig.characterDescription,
					style2D: projectConfig.style2D
				})
			});

			const result = await res.json();
			if (result.success && result.prompts && result.prompts.length > 0) {
				const generated = result.prompts[0];
				allScenes = allScenes.map((/** @type {any} */ s) => s.sceneNumber === scene.sceneNumber ? { ...s, prompt: generated.prompt } : s);
				showToast(`✨ Prompt Scene ${scene.sceneNumber} siap!`);
			} else {
				showToast(result.error || 'Gagal membuat prompt gambar.');
			}
		} catch (err) {
			console.error(err);
			showToast('Gagal generate prompt scene.');
		} finally {
			generatingPromptSceneId = null;
		}
	}

	// Generate Prompts for all visible scenes currently lacking a prompt
	async function generateBatchPrompts() {
		const visibleScenes = allScenes.slice(0, visibleSceneCount);
		const targetScenes = visibleScenes.filter((/** @type {any} */ s) => !s.prompt);

		if (targetScenes.length === 0) {
			showToast('Semua scene yang tampil saat ini sudah memiliki prompt!');
			return;
		}

		isGeneratingPromptBatch = true;
		try {
			const res = await fetch('/api/script-director/generate-prompts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scenes: targetScenes,
					characterDescription: projectConfig.characterDescription,
					style2D: projectConfig.style2D
				})
			});

			const result = await res.json();
			if (result.success && result.prompts) {
				const promptMap = new Map();
				result.prompts.forEach((/** @type {any} */ p) => promptMap.set(p.sceneNumber, p.prompt));

				allScenes = allScenes.map((/** @type {any} */ s) => {
					if (promptMap.has(s.sceneNumber)) {
						return { ...s, prompt: promptMap.get(s.sceneNumber) };
					}
					return s;
				});
				showToast(`✨ ${result.prompts.length} prompt 2D berhasil digenerate!`);
			} else {
				showToast(result.error || 'Gagal membuat prompt batch.');
			}
		} catch (err) {
			console.error(err);
			showToast('Gagal memproses prompt batch.');
		} finally {
			isGeneratingPromptBatch = false;
		}
	}

	// Copy to clipboard helpers
	async function copyText(/** @type {string} */ text, label = 'Teks') {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			showToast(`📋 ${label} berhasil disalin ke clipboard!`);
		} catch (e) {
			showToast('Gagal menyalin teks.');
		}
	}

	function copyAllScenesScript() {
		if (!allScenes || allScenes.length === 0) return;
		// Combine all narrations into continuous script
		const fullText = allScenes.map(s => s.narration).filter(Boolean).join('\n\n');
		copyText(fullText, `Seluruh Naskah (${allScenes.length} Scene)`);
	}

	function copyAllGeneratedPrompts() {
		const prompts = allScenes
			.filter(s => s.prompt && s.prompt.trim())
			.map(s => `[Scene ${s.sceneNumber}]\n${s.prompt}`);

		if (prompts.length === 0) {
			showToast('Belum ada prompt yang digenerate. Klik "Generate Prompt" pada scene terlebih dahulu!');
			return;
		}

		const fullPrompts = prompts.join('\n\n---\n\n');
		copyText(fullPrompts, `Semua Prompt Gambar (${prompts.length} Scene)`);
	}

	function resetToNewTopic() {
		messages = [];
		chatInput = '';
		initialPrompt = '';
		allScenes = [];
		visibleSceneCount = 10;
		masterScriptData = null;
		isStoryFinished = false;
		projectConfig = {
			suggestedTitle: '',
			hookAngle: 'Curiosity gap & masalah nyata',
			style2D: 'Stickman Minimalis Sinematik',
			characterDescription: 'A minimalist 2D black stickman with bold clean lines, expressive eyebrows and hands, wearing a subtle red tie, high contrast flat vector style',
			outline: [],
			isReadyForMasterScript: false
		};
		currentStage = 'chat';
		showToast('Siap untuk topik baru! Ketik ide topiknya secara langsung.');
	}

	// Derived stats
	let generatedPromptCount = $derived(
		allScenes.filter(s => s.prompt && s.prompt.trim()).length
	);
	let totalWords = $derived(
		allScenes.reduce((acc, s) => acc + (s.narration ? s.narration.trim().split(/\s+/).length : 0), 0)
	);
</script>

<svelte:head>
	<title>Script Director — AI YouTube Script & 2D Storyboard Studio</title>
</svelte:head>

<!-- Global Toast Notification -->
{#if toastMessage}
	<div class="toast-box">
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="director-page {currentStage === 'storyboard' ? 'stage-storyboard' : 'stage-chat'}">
	<!-- Navbar Sub-Header -->
	<header class="director-header">
		<div class="header-left">
			<a href="/" class="back-link">
				<ArrowLeft size={16} />
				<span>Dashboard</span>
			</a>
			<div class="divider"></div>
			<div class="title-wrap">
				<div class="badge-icon">🎬</div>
				<div>
					<h1 class="director-title">Script Director</h1>
					<p class="director-subtitle">Storyboard Architect & 2D Character Script Generator (7–10 Menit)</p>
				</div>
			</div>
		</div>

		<div class="header-right">
			{#if messages.length > 0 || allScenes.length > 0}
				<button class="stage-toggle-btn reset-btn" onclick={resetToNewTopic} title="Mulai topik baru dari awal">
					<Sparkles size={14} />
					<span>Topik Baru</span>
				</button>
			{/if}
			{#if currentStage === 'storyboard'}
				<button class="stage-toggle-btn" onclick={() => currentStage = 'chat'}>
					<MessageSquare size={14} />
					<span>Buka Diskusi Ide</span>
				</button>
				<button class="stage-toggle-btn active" onclick={() => currentStage = 'storyboard'}>
					<Film size={14} />
					<span>Storyboard ({allScenes.length} Scene)</span>
				</button>
			{/if}
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="director-body">
		{#if currentStage === 'chat'}
			<!-- STAGE 1: DISCUSSION & CREATIVE CHAT -->
			<div class="chat-layout">
				<!-- Left: Conversation Column -->
				<section class="conversation-pane">
					{#if messages.length === 0}
						<!-- Hero Prompt Box -->
						<div class="hero-prompt-card">
							<div class="hero-badge">
								<Sparkles size={14} />
								<span>Creative Director Standby</span>
							</div>
							<h2 class="hero-title">Mau bikin script apa hari ini?</h2>
							<p class="hero-desc">
								Ketik topik apa saja. Kita akan bedah sudut pandang (*angle*), intrik pembuka (*hook*), struktur babak, dan karakter 2D konsisten sebelum naskah bersambung 7–10 menit dieksekusi.
							</p>

							<div class="starter-chips">
								<span class="chips-label">Inspirasi topik:</span>
								{#each STARTER_TOPICS as starter}
									<button class="topic-chip" onclick={() => { initialPrompt = starter; }}>
										<Flame size={12} class="chip-icon" />
										<span>{starter}</span>
									</button>
								{/each}
							</div>

							<div class="hero-input-wrap">
								<textarea
									placeholder="Contoh: Kenapa orang pintar sering terjebak kemiskinan dan cara mengatasinya..."
									bind:value={initialPrompt}
									onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateDirectScript(); } }}
									rows="3"
								></textarea>
								<div class="hero-action-bar">
									{#if isMasterGenerating}
										<div class="hero-generating-indicator">
											<RefreshCw size={15} class="spin text-primary" />
											<span class="gen-progress-sub">{masterProgressText}</span>
										</div>
									{:else}
										<span class="hint-text">Langsung buat naskah YouTube biasa atau diskusikan dulu</span>
										<div class="hero-btns-group">
											<button
												class="btn btn-secondary btn-sm"
												onclick={() => startDiscussion()}
												disabled={!initialPrompt.trim() || isChatLoading}
												title="Diskusi sudut pandang naskah dengan AI Director"
											>
												<MessageSquare size={14} />
												<span>Diskusi Dulu</span>
											</button>
											<button
												class="btn btn-primary btn-start"
												onclick={() => generateDirectScript()}
												disabled={!initialPrompt.trim() || isChatLoading}
												title="Langsung susun naskah bersambung YouTube dan pecah 10 scene pertama"
											>
												<Sparkles size={14} />
												<span>⚡ Langsung Buat Script</span>
											</button>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{:else}
						<!-- Ongoing Chat Feed -->
						<div class="chat-feed-container">
							<div class="chat-scroll" id="chat-scroll-container">
								{#each messages as msg}
									<div class="chat-bubble-row {msg.role}">
										<div class="avatar-box">
											{#if msg.role === 'user'}
												<span>👤</span>
											{:else}
												<span>🎬</span>
											{/if}
										</div>
										<div class="bubble-content">
											<div class="bubble-author">
												{msg.role === 'user' ? 'Kamu' : 'Script Director AI'}
											</div>
											<div class="bubble-text">
												{#if msg.role === 'user'}
													<p class="user-text">{msg.content}</p>
												{:else}
													<div class="ai-text-flow">
														{@html formatMarkdown(msg.content)}
													</div>
												{/if}
											</div>
										</div>
									</div>
								{/each}

								{#if isChatLoading}
									<div class="chat-bubble-row assistant loading-bubble">
										<div class="avatar-box"><span>🎬</span></div>
										<div class="bubble-content">
											<div class="typing-indicator">
												<span></span><span></span><span></span>
											</div>
										</div>
									</div>
								{/if}
							</div>

							<!-- Quick suggestions -->
							{#if quickSuggestions.length > 0 && !isChatLoading}
								<div class="quick-suggestions-bar">
									{#each quickSuggestions as suggestion}
										<button class="suggestion-chip" onclick={() => sendChatMessage(suggestion)}>
											<span>{suggestion}</span>
										</button>
									{/each}
								</div>
							{/if}

							<!-- Chat input bar -->
							<div class="chat-input-bar">
								<textarea
									placeholder="Tulis masukan, ide tambahan, atau revisi alur..."
									bind:value={chatInput}
									onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
									rows="2"
								></textarea>
								<button
									class="btn btn-primary send-btn"
									onclick={() => sendChatMessage()}
									disabled={!chatInput.trim() || isChatLoading}
								>
									<Send size={15} />
								</button>
							</div>
						</div>
					{/if}
				</section>

				<!-- Right: Real-time Script Blueprint & Action Card -->
				<aside class="blueprint-pane">
					<div class="blueprint-card">
						<div class="blueprint-header">
							<div class="blueprint-title-row">
								<BookOpen size={16} class="text-primary" />
								<h3>Script Blueprint</h3>
							</div>
							<span class="badge badge-duration">7–10 Menit</span>
						</div>

						<!-- Topic & Title -->
						<div class="bp-field">
							<span class="bp-label">Judul / Premis Terpilih</span>
							<div class="bp-val-box">
								{projectConfig.suggestedTitle || 'Belum ditentukan (mulai dari obrolan)'}
							</div>
						</div>

						<!-- 2D Visual Style Selector -->
						<div class="bp-field">
							<label for="bp-style-select" class="bp-label">Gaya Karakter 2D Konsisten</label>
							<select id="bp-style-select" bind:value={projectConfig.style2D} class="bp-select">
								{#each STYLE_OPTIONS as style}
									<option value={style.label}>{style.label}</option>
								{/each}
							</select>
						</div>

						<!-- Character Anchor for Consistent Image Prompts -->
						<div class="bp-field">
							<label for="bp-char-desc" class="bp-label">Deskripsi Karakter 2D (Prompt Anchor)</label>
							<textarea
								id="bp-char-desc"
								class="bp-textarea"
								bind:value={projectConfig.characterDescription}
								rows="3"
								placeholder="Deskripsi karakter yang konsisten muncul di prompt..."
							></textarea>
							<span class="bp-hint">Deskripsi ini akan selalu disematkan ke setiap prompt image agar karakter konsisten.</span>
						</div>

						<!-- Outline Preview -->
						{#if projectConfig.outline && projectConfig.outline.length > 0}
							<div class="bp-field">
								<span class="bp-label">Rancangan Babak Naskah</span>
								<div class="outline-list">
									{#each projectConfig.outline as item, i}
										<div class="outline-item">
											<span class="num-bullet">{i + 1}</span>
											<span>{item}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Master Generation Action -->
						<div class="blueprint-cta-wrap">
							{#if isMasterGenerating}
								<div class="generating-box">
									<RefreshCw size={22} class="spin text-primary" />
									<p class="gen-progress-title">Memproduksi Naskah Bersambung...</p>
									<p class="gen-progress-sub">{masterProgressText}</p>
								</div>
							{:else}
								<button
									class="btn btn-primary btn-generate-all"
									onclick={generateMasterScript}
									disabled={!projectConfig.suggestedTitle || isMasterGenerating}
								>
									<Wand2 size={16} />
									<span>🎬 Kunci Cerita & Buat Naskah Lengkap</span>
								</button>
								<p class="btn-subtext">Menghasilkan naskah utuh 7–10 menit yang langsung dipecah menjadi 80–100 scene visual.</p>
							{/if}
						</div>
					</div>
				</aside>
			</div>

		{:else}
			<!-- STAGE 2: STORYBOARD & SCENE BOARD -->
			<div class="storyboard-layout">
				<!-- Global Action Toolbar -->
				<div class="storyboard-toolbar">
					<div class="tb-left">
						<div class="tb-title-group">
							<h2 class="tb-title">{projectConfig.suggestedTitle || 'Naskah YouTube Long'}</h2>
							<div class="tb-tags">
								<span class="badge tag-purple">
									<Layers size={12} />
									<span>{allScenes.length} Scene Total</span>
								</span>
								<span class="badge tag-cyan">
									<span>~{Math.round(totalWords / 140)} Menit ({totalWords} Kata)</span>
								</span>
								<span class="badge tag-green">
									<CheckCircle2 size={12} />
									<span>{generatedPromptCount}/{allScenes.length} Prompt Siap</span>
								</span>
							</div>
						</div>
					</div>

					<div class="tb-actions">
						<button class="btn btn-secondary btn-sm" onclick={copyAllScenesScript}>
							<Copy size={14} />
							<span>Copy Semua Naskah</span>
						</button>
						<button class="btn btn-secondary btn-sm" onclick={copyAllGeneratedPrompts}>
							<Palette size={14} />
							<span>Copy Semua Prompt ({generatedPromptCount})</span>
						</button>
						<button
							class="btn btn-primary btn-sm"
							onclick={generateBatchPrompts}
							disabled={isGeneratingPromptBatch}
						>
							{#if isGeneratingPromptBatch}
								<RefreshCw size={14} class="spin" />
								<span>Membuat Prompt...</span>
							{:else}
								<Sparkles size={14} />
								<span>Generate Prompt di Batch Ini</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Scene Cards Stream -->
				<div class="scenes-stream">
					{#each allScenes.slice(0, visibleSceneCount) as scene, index (scene.sceneNumber)}
						<article class="scene-card">
							<div class="scene-card-header">
								<div class="scene-meta">
									<span class="scene-pill">Scene {String(scene.sceneNumber).padStart(2, '0')}</span>
									<span class="scene-dur">~{scene.estimatedDurationSec || 6}s</span>
									{#if scene.chapter}
										<span class="scene-chapter">{scene.chapter}</span>
									{/if}
								</div>
								<div class="scene-header-actions">
									<button
										class="icon-btn"
										title="Salin Teks Narasi Scene Ini"
										onclick={() => copyText(scene.narration, `Naskah Scene ${scene.sceneNumber}`)}
									>
										<Copy size={13} />
										<span>Copy Teks</span>
									</button>
								</div>
							</div>

							<div class="scene-card-body">
								<!-- Narration text box -->
								<div class="narration-area">
									<span class="section-label">🎙️ Naskah Narasi / Voiceover:</span>
									<textarea
										class="narration-input"
										bind:value={scene.narration}
										rows="2"
									></textarea>
								</div>

								<!-- Visual situation hint -->
								{#if scene.visualAction}
									<div class="visual-context-hint">
										<span class="hint-label">Aksi Visual 2D:</span>
										<span class="hint-val">{scene.visualAction}</span>
									</div>
								{/if}

								<!-- Image Prompt Section -->
								<div class="prompt-section">
									<div class="prompt-header">
										<span class="section-label">🎨 Prompt Text-to-Image (2D Consistent):</span>
										{#if scene.prompt}
											<div class="prompt-card-actions">
												<button
													class="btn-mini"
													onclick={() => copyText(scene.prompt, `Prompt Scene ${scene.sceneNumber}`)}
												>
													<Copy size={12} />
													<span>Copy Prompt</span>
												</button>
												<button
													class="btn-mini"
													onclick={() => generateSinglePrompt(scene)}
													disabled={generatingPromptSceneId === scene.sceneNumber}
												>
													<RefreshCw size={12} class={generatingPromptSceneId === scene.sceneNumber ? 'spin' : ''} />
													<span>Regenerate</span>
												</button>
											</div>
										{/if}
									</div>

									{#if scene.prompt}
										<div class="prompt-display-box">
											<code>{scene.prompt}</code>
										</div>
									{:else}
										<div class="prompt-empty-state">
											<span class="empty-hint">Prompt gambar belum dibuat untuk scene ini.</span>
											<button
												class="btn btn-secondary btn-sm"
												onclick={() => generateSinglePrompt(scene)}
												disabled={generatingPromptSceneId === scene.sceneNumber}
											>
												{#if generatingPromptSceneId === scene.sceneNumber}
													<RefreshCw size={13} class="spin" />
													<span>Meracik Prompt 2D...</span>
												{:else}
													<Sparkles size={13} />
													<span>Generate Prompt 2D</span>
												{/if}
											</button>
										</div>
									{/if}
								</div>
							</div>
						</article>
					{/each}

					<!-- Pagination / Next Batch Footer -->
					<div class="batch-footer-panel">
						<div class="progress-info">
							<span>Menampilkan <strong>{allScenes.length}</strong> Scene (Target Est. ~{totalTargetScenes} Scene • ~{Math.round((allScenes.length * 6) / 60)} dari 7–10 Menit)</span>
							<div class="progress-bar-bg">
								<div class="progress-bar-fill" style="width: {Math.min(100, Math.round((allScenes.length / totalTargetScenes) * 100))}%"></div>
							</div>
						</div>

						{#if allScenes.length < totalTargetScenes}
							<button
								class="btn btn-primary btn-lg btn-next-batch"
								onclick={showNextSceneBatch}
								disabled={isLoadingNextBatch}
							>
								{#if isLoadingNextBatch}
									<RefreshCw size={16} class="spin" />
									<span>Merangkai Scene {allScenes.length + 1}–{Math.min(totalTargetScenes, allScenes.length + 10)}...</span>
								{:else}
									<span>➕ Generate Scene {allScenes.length + 1}–{Math.min(totalTargetScenes, allScenes.length + 10)} (Lanjutkan Cerita Menuju ~{totalTargetScenes} Scene)</span>
									<ArrowRight size={16} />
								{/if}
							</button>
						{:else}
							<div class="all-scenes-done">
								<CheckCircle2 size={20} class="text-success" />
								<span>🎉 Target {allScenes.length} Scene naskah berhasil tercapai (~{Math.round((allScenes.length * 6) / 60)} Menit Naskah Utuh)!</span>
							</div>
							<button
								class="btn btn-secondary btn-sm"
								onclick={showNextSceneBatch}
								disabled={isLoadingNextBatch}
								style="margin-top: 6px;"
							>
								{#if isLoadingNextBatch}
									<RefreshCw size={14} class="spin" />
									<span>Menambah scene lanjutan...</span>
								{:else}
									<span>➕ Tambah 10 Scene Lanjutan Lagi (Perpanjang Durasi)</span>
								{/if}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.director-page {
		height: 100vh;
		max-height: 100vh;
		overflow: hidden;
		background: var(--bg-base, #080a11);
		color: var(--text, #eef2ff);
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.director-page.stage-storyboard {
		height: auto;
		min-height: 100vh;
		max-height: none;
		overflow-y: auto;
	}

	/* Header */
	.director-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 24px;
		background: var(--bg-surface, #0e1320);
		border-bottom: 1px solid var(--line, rgba(255,255,255,0.08));
		position: sticky;
		top: 0;
		z-index: 40;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-2, #94a3b8);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 500;
		padding: 6px 10px;
		border-radius: var(--r-md, 10px);
		transition: all 0.2s;
	}
	.back-link:hover {
		color: #ffffff;
		background: rgba(255,255,255,0.05);
	}

	.divider {
		width: 1px;
		height: 24px;
		background: var(--line, rgba(255,255,255,0.08));
	}

	.title-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.badge-icon {
		font-size: 1.3rem;
	}

	.director-title {
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.director-subtitle {
		font-size: 0.72rem;
		color: var(--text-3, #64748b);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.stage-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: var(--r-full, 999px);
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-2, #94a3b8);
		background: var(--bg-card, #131a2e);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		transition: all 0.2s;
	}
	.stage-toggle-btn:hover {
		color: #fff;
		border-color: var(--line-strong, rgba(255,255,255,0.15));
	}
	.stage-toggle-btn.active {
		color: #fff;
		background: var(--primary, #6366f1);
		border-color: transparent;
	}

	/* Main Body */
	.director-body {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		max-width: 1440px;
		width: 100%;
		margin: 0 auto;
		padding: 16px 24px;
		box-sizing: border-box;
		overflow: hidden;
	}

	.stage-storyboard .director-body {
		overflow: visible;
		padding: 24px;
	}

	/* Stage 1: Chat Layout */
	.chat-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 350px;
		gap: 20px;
		flex: 1;
		min-height: 0;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	@media (max-width: 1024px) {
		.chat-layout {
			grid-template-columns: minmax(0, 1fr);
			overflow-y: auto;
		}
	}

	.conversation-pane {
		height: 100%;
		min-height: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Hero Prompt Box */
	.hero-prompt-card {
		background: linear-gradient(180deg, rgba(26, 35, 60, 0.4) 0%, rgba(14, 19, 32, 0.7) 100%);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		border-radius: var(--r-xl, 18px);
		padding: 36px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		border-radius: var(--r-full, 999px);
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		color: #a5b4fc;
		font-size: 0.75rem;
		font-weight: 600;
		width: fit-content;
		margin-bottom: 16px;
	}

	.hero-title {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin-bottom: 12px;
		background: linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-desc {
		font-size: 0.95rem;
		color: var(--text-2, #94a3b8);
		line-height: 1.6;
		max-width: 680px;
		margin-bottom: 24px;
	}

	.starter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		margin-bottom: 28px;
	}

	.chips-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-3, #64748b);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-right: 4px;
	}

	.topic-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: var(--r-full, 999px);
		background: var(--bg-card, #131a2e);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		color: var(--text-2, #94a3b8);
		font-size: 0.8rem;
		transition: all 0.2s;
	}
	.topic-chip:hover {
		background: var(--bg-card-hover, #172040);
		border-color: rgba(99, 102, 241, 0.4);
		color: #ffffff;
		transform: translateY(-1px);
	}
	:global(.chip-icon) {
		color: #f59e0b;
	}

	.hero-input-wrap {
		background: var(--bg-input, #0a0f1c);
		border: 1px solid var(--line-strong, rgba(255,255,255,0.13));
		border-radius: var(--r-lg, 14px);
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		transition: border-color 0.2s;
	}
	.hero-input-wrap:focus-within {
		border-color: var(--primary, #6366f1);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
	}

	.hero-input-wrap textarea {
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		resize: none;
		color: #fff;
		font-size: 0.95rem;
		line-height: 1.5;
		padding: 0;
	}

	.hero-action-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-top: 1px solid var(--line, rgba(255,255,255,0.06));
		padding-top: 10px;
	}

	.hint-text {
		font-size: 0.75rem;
		color: var(--text-3, #64748b);
	}

	.hero-btns-group {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.hero-generating-indicator {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--primary, #6366f1);
		font-size: 0.85rem;
		font-weight: 500;
	}

	/* Chat Feed Container */
	.chat-feed-container {
		background: var(--bg-surface, #0e1320);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		border-radius: var(--r-xl, 18px);
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		box-sizing: border-box;
	}

	.chat-scroll {
		flex: 1;
		min-height: 0;
		padding: 20px 24px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.chat-bubble-row {
		display: flex;
		gap: 12px;
		max-width: 90%;
		min-width: 0;
	}
	.chat-bubble-row.user {
		margin-left: auto;
		flex-direction: row-reverse;
		max-width: 82%;
	}

	.avatar-box {
		width: 34px;
		height: 34px;
		border-radius: var(--r-md, 10px);
		background: var(--bg-card, #131a2e);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		flex-shrink: 0;
	}

	.bubble-content {
		display: flex;
		flex-direction: column;
		gap: 5px;
		min-width: 0;
		flex: 1;
	}

	.bubble-author {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-3, #64748b);
	}
	.user .bubble-author {
		text-align: right;
	}

	.bubble-text {
		background: #111728;
		border: 1px solid rgba(255,255,255,0.08);
		padding: 16px 20px;
		border-radius: 14px;
		font-size: 0.88rem;
		line-height: 1.6;
		color: #e2e8f0;
		word-break: break-word;
		box-shadow: 0 4px 14px rgba(0,0,0,0.15);
	}
	.user .bubble-text {
		background: rgba(99, 102, 241, 0.2);
		border-color: rgba(99, 102, 241, 0.35);
		color: #ffffff;
		border-radius: 14px 4px 14px 14px;
	}
	.assistant .bubble-text {
		border-radius: 4px 14px 14px 14px;
	}

	.user-text {
		margin: 0;
		line-height: 1.5;
	}

	/* Rich Markdown Render Styling */
	.ai-text-flow {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	:global(.md-p) {
		margin: 0 0 10px 0;
		line-height: 1.65;
		color: #e2e8f0;
	}
	:global(.md-p:last-child) {
		margin-bottom: 0;
	}

	:global(.md-spacer) {
		height: 8px;
	}

	:global(.md-bold) {
		color: #ffffff;
		font-weight: 700;
	}

	:global(.md-heading) {
		font-size: 0.95rem;
		font-weight: 700;
		color: #f1f5f9;
		margin: 12px 0 6px 0;
		letter-spacing: -0.01em;
	}

	:global(.md-list-item) {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		padding: 10px 14px;
		margin-bottom: 6px;
		line-height: 1.55;
	}

	:global(.md-list-num) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		background: rgba(99, 102, 241, 0.2);
		color: #a5b4fc;
		font-size: 0.75rem;
		font-weight: 700;
		flex-shrink: 0;
		margin-top: 1px;
	}

	:global(.md-list-body) {
		flex: 1;
		font-size: 0.88rem;
		color: #e2e8f0;
	}

	:global(.md-bullet-item) {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin-bottom: 5px;
		line-height: 1.55;
		font-size: 0.88rem;
	}

	:global(.md-bullet-dot) {
		color: #818cf8;
		font-size: 0.8rem;
		margin-top: 3px;
		flex-shrink: 0;
	}

	:global(.md-bullet-body) {
		flex: 1;
		color: #e2e8f0;
	}

	:global(.md-code) {
		font-family: var(--font-mono, monospace);
		background: rgba(0, 0, 0, 0.35);
		color: #38bdf8;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.82rem;
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 12px 16px;
		background: var(--bg-card, #131a2e);
		border-radius: var(--r-md, 10px);
		width: fit-content;
	}
	.typing-indicator span {
		width: 6px;
		height: 6px;
		background: #6366f1;
		border-radius: 50%;
		animation: pulseGlow 1s infinite alternate;
	}
	.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
	.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

	.quick-suggestions-bar {
		flex-shrink: 0;
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding: 10px 18px;
		background: rgba(8, 10, 17, 0.7);
		border-top: 1px solid var(--line, rgba(255,255,255,0.06));
		scrollbar-width: thin;
	}

	.suggestion-chip {
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
		padding: 6px 12px;
		border-radius: var(--r-full, 999px);
		background: var(--bg-card, #131a2e);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		font-size: 0.75rem;
		color: var(--text-2, #94a3b8);
		transition: all 0.2s;
	}
	.suggestion-chip:hover {
		background: rgba(99, 102, 241, 0.15);
		border-color: rgba(99, 102, 241, 0.3);
		color: #fff;
	}

	.chat-input-bar {
		flex-shrink: 0;
		padding: 12px 18px;
		background: var(--bg-surface, #0e1320);
		border-top: 1px solid var(--line, rgba(255,255,255,0.08));
		display: flex;
		gap: 12px;
		align-items: flex-end;
	}

	.chat-input-bar textarea {
		flex: 1;
		background: var(--bg-input, #0a0f1c);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		border-radius: var(--r-md, 10px);
		padding: 10px 14px;
		color: #fff;
		font-size: 0.88rem;
		resize: none;
		outline: none;
	}
	.chat-input-bar textarea:focus {
		border-color: var(--primary, #6366f1);
	}

	.send-btn {
		height: 42px;
		width: 44px;
		padding: 0;
		flex-shrink: 0;
	}

	/* Right Blueprint Pane */
	.blueprint-pane {
		height: 100%;
		min-height: 0;
		min-width: 0;
		width: 100%;
		overflow-y: auto;
		box-sizing: border-box;
		scrollbar-width: thin;
	}

	.blueprint-card {
		background: var(--bg-surface, #0e1320);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: var(--r-xl, 18px);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		box-sizing: border-box;
		box-shadow: 0 10px 30px rgba(0,0,0,0.25);
	}

	.blueprint-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--line, rgba(255,255,255,0.08));
	}

	.blueprint-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.blueprint-title-row h3 {
		font-size: 0.95rem;
		font-weight: 700;
	}

	.badge-duration {
		background: rgba(99, 102, 241, 0.15);
		color: #a5b4fc;
		border: 1px solid rgba(99, 102, 241, 0.3);
	}

	.bp-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.bp-label, .bp-field label {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-3, #64748b);
	}

	.bp-val-box {
		padding: 10px 14px;
		border-radius: 10px;
		background: rgba(99, 102, 241, 0.08);
		border: 1px solid rgba(99, 102, 241, 0.25);
		font-size: 0.88rem;
		font-weight: 600;
		color: #ffffff;
		line-height: 1.4;
		word-break: break-word;
	}

	.bp-select {
		width: 100%;
		box-sizing: border-box;
		padding: 10px 12px;
		border-radius: 10px;
		background: #0a0f1c;
		border: 1px solid rgba(255,255,255,0.14);
		color: #f1f5f9;
		font-size: 0.82rem;
		font-weight: 500;
		outline: none;
		transition: border-color 0.2s;
	}
	.bp-select:focus {
		border-color: var(--primary, #6366f1);
	}

	.bp-textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 10px 12px;
		border-radius: 10px;
		background: #0a0f1c;
		border: 1px solid rgba(255,255,255,0.14);
		color: #f1f5f9;
		font-size: 0.82rem;
		line-height: 1.5;
		outline: none;
		resize: vertical;
		min-height: 75px;
		transition: border-color 0.2s;
	}
	.bp-textarea:focus {
		border-color: var(--primary, #6366f1);
	}

	.bp-hint {
		font-size: 0.7rem;
		color: var(--text-3, #64748b);
		line-height: 1.4;
	}

	.outline-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-height: 140px;
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.outline-item {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 0.78rem;
		color: var(--text-2, #94a3b8);
		background: var(--bg-card, #131a2e);
		padding: 6px 10px;
		border-radius: var(--r-sm, 8px);
	}

	.num-bullet {
		font-weight: 700;
		color: var(--primary, #6366f1);
		font-size: 0.72rem;
	}

	.blueprint-cta-wrap {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.btn-generate-all {
		width: 100%;
		padding: 14px 16px;
		font-size: 0.88rem;
		font-weight: 700;
		border-radius: 12px;
		background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
		box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
		transition: all 0.2s;
	}
	.btn-generate-all:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
	}

	.btn-subtext {
		font-size: 0.72rem;
		color: var(--text-3, #64748b);
		text-align: center;
		line-height: 1.4;
	}

	.generating-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 20px;
		background: rgba(99, 102, 241, 0.08);
		border: 1px dashed rgba(99, 102, 241, 0.3);
		border-radius: var(--r-lg, 14px);
		text-align: center;
	}

	.gen-progress-title {
		font-size: 0.88rem;
		font-weight: 700;
		color: #fff;
	}

	.gen-progress-sub {
		font-size: 0.75rem;
		color: #a5b4fc;
	}

	/* Stage 2: Storyboard Layout */
	.storyboard-layout {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.storyboard-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		background: var(--bg-surface, #0e1320);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		border-radius: var(--r-lg, 14px);
		flex-wrap: wrap;
		gap: 16px;
		position: sticky;
		top: 65px;
		z-index: 30;
		backdrop-filter: blur(12px);
	}

	.tb-title {
		font-size: 1.15rem;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.tb-tags {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.tag-purple {
		background: rgba(99, 102, 241, 0.15);
		color: #a5b4fc;
		border-color: rgba(99, 102, 241, 0.3);
	}

	.tag-cyan {
		background: rgba(6, 182, 212, 0.15);
		color: #67e8f9;
		border-color: rgba(6, 182, 212, 0.3);
	}

	.tag-green {
		background: rgba(16, 185, 129, 0.15);
		color: #6ee7b7;
		border-color: rgba(16, 185, 129, 0.3);
	}

	.tb-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	/* Scenes Stream */
	.scenes-stream {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.scene-card {
		background: var(--bg-surface, #0e1320);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		border-radius: var(--r-lg, 14px);
		overflow: hidden;
		transition: border-color 0.2s;
	}
	.scene-card:hover {
		border-color: rgba(99, 102, 241, 0.3);
	}

	.scene-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 18px;
		background: rgba(255,255,255,0.02);
		border-bottom: 1px solid var(--line, rgba(255,255,255,0.06));
	}

	.scene-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.scene-pill {
		font-size: 0.75rem;
		font-weight: 700;
		color: #fff;
		background: var(--primary, #6366f1);
		padding: 3px 8px;
		border-radius: var(--r-sm, 8px);
	}

	.scene-dur {
		font-size: 0.72rem;
		color: var(--text-3, #64748b);
		font-weight: 600;
	}

	.scene-chapter {
		font-size: 0.72rem;
		color: var(--text-2, #94a3b8);
		background: var(--bg-card, #131a2e);
		padding: 2px 8px;
		border-radius: var(--r-full, 999px);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-2, #94a3b8);
		padding: 4px 8px;
		border-radius: var(--r-sm, 8px);
		background: var(--bg-card, #131a2e);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		transition: all 0.2s;
	}
	.icon-btn:hover {
		color: #fff;
		background: var(--bg-card-hover, #172040);
	}

	.scene-card-body {
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.section-label {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text-3, #64748b);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 6px;
		display: block;
	}

	.narration-area textarea {
		width: 100%;
		font-size: 0.92rem;
		line-height: 1.5;
		color: #ffffff;
		background: var(--bg-input, #0a0f1c);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
	}

	.visual-context-hint {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 0.78rem;
		background: rgba(255,255,255,0.02);
		padding: 6px 12px;
		border-radius: var(--r-sm, 8px);
		border-left: 3px solid #f59e0b;
	}
	.hint-label {
		color: #f59e0b;
		font-weight: 600;
	}
	.hint-val {
		color: var(--text-2, #94a3b8);
	}

	.prompt-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
		border-top: 1px solid var(--line, rgba(255,255,255,0.06));
		padding-top: 12px;
	}

	.prompt-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.prompt-card-actions {
		display: flex;
		gap: 6px;
	}

	.btn-mini {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-2, #94a3b8);
		background: var(--bg-card, #131a2e);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		padding: 3px 8px;
		border-radius: var(--r-sm, 8px);
		transition: all 0.2s;
	}
	.btn-mini:hover {
		color: #fff;
		border-color: rgba(99, 102, 241, 0.3);
	}

	.prompt-display-box {
		background: #06080e;
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		border-radius: var(--r-md, 10px);
		padding: 10px 14px;
	}
	.prompt-display-box code {
		font-family: var(--font-mono, monospace);
		font-size: 0.78rem;
		color: #38bdf8;
		line-height: 1.5;
		word-break: break-word;
	}

	.prompt-empty-state {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 14px;
		background: rgba(255,255,255,0.02);
		border: 1px dashed var(--line, rgba(255,255,255,0.1));
		border-radius: var(--r-md, 10px);
	}

	.empty-hint {
		font-size: 0.78rem;
		color: var(--text-3, #64748b);
	}

	/* Batch Footer Panel */
	.batch-footer-panel {
		padding: 24px;
		background: var(--bg-surface, #0e1320);
		border: 1px solid var(--line, rgba(255,255,255,0.08));
		border-radius: var(--r-lg, 14px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		margin-top: 10px;
	}

	.progress-info {
		width: 100%;
		max-width: 450px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		color: var(--text-2, #94a3b8);
	}

	.progress-bar-bg {
		width: 100%;
		height: 6px;
		background: var(--bg-card, #131a2e);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #6366f1, #06b6d4);
		transition: width 0.3s ease;
	}

	.btn-next-batch {
		padding: 14px 28px;
	}

	.all-scenes-done {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #10b981;
		padding: 12px 20px;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: var(--r-md, 10px);
	}

	/* Toast Notification */
	.toast-box {
		position: fixed;
		bottom: 24px;
		right: 24px;
		background: #1e1b4b;
		border: 1px solid #4338ca;
		color: #e0e7ff;
		padding: 12px 20px;
		border-radius: var(--r-md, 10px);
		box-shadow: 0 10px 30px rgba(0,0,0,0.5);
		font-size: 0.85rem;
		font-weight: 600;
		z-index: 100;
		animation: pulseGlow 0.3s ease;
	}
</style>
