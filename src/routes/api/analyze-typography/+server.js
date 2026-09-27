import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	analyzeNarrationToDiagram,
	generateDanKoeSVG,
	analyzeSentencePhases,
	splitTextIntoDanKoeBeats,
	splitSentenceIntoConsistentBeats
} from '$lib/typography/dynamicDiagram.js';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || '';

const isExpiredKey = (k) => !k || k === 'sk-0802f45e1d4e41c8ae8d46396c97b746';

export async function POST({ request }) {
	try {
		const {
			script = '',
			topic = '',
			accentColor = '#F59E0B',
			apiKey = ''
		} = await request.json();

		const userKey = (apiKey && !isExpiredKey(apiKey.trim())) ? apiKey.trim() : '';
		const defaultKey = (!isExpiredKey(DEFAULT_DEEPSEEK_KEY)) ? DEFAULT_DEEPSEEK_KEY : '';
		const effectiveKey = userKey || defaultKey;
		const rawInput = (script || topic || '').trim();

		if (!rawInput) {
			return json({ error: 'Silakan masukkan naskah atau kalimat terlebih dahulu di kolom naskah.' }, { status: 400 });
		}

		// Try AI Deep Analysis via DeepSeek if key is present
		if (effectiveKey) {
			try {
				const prompt = `Anda adalah Dan Koe — seorang creative philosopher, digital writer, dan master of mental models & kinetic typography.
Tugas Anda: Analisis naskah/topik berikut menjadi serangkaian adegan video YouTube Long & Shorts bergaya Motion Typography Dan Koe.

INPUT NASKAH/TOPIK:
"""${rawInput}"""

ATURAN STRUKTUR DAN KOE:
1. ATURAN 1 BARIS BERSIH & ARTIKULASI SUARA ALAMI:
   Setiap adegan narasi WAJIB berupa satu gagasan/klausa utuh yang terdengar NATURAL dan MENGALIR saat disuarakan oleh TTS (panjang ideal 22-44 karakter, atau 4-8 kata).
   JANGAN SEKALI-KALI MEMOTONG DI TENGAH FRASA (misalnya: JANGAN potong "Dunia tidak peduli" dan "dengan niat baikmu" menjadi 2 adegan terpisah, karena intonasi TTS akan terpotong kaku dan jeda terdengar aneh!).
   Buat sebagai 1 kalimat utuh: "Dunia tidak peduli dengan niat baikmu." (38 karakter, muat 1 baris bersih!).
   Hanya jika kalimat sangat panjang (> 46 karakter), pecah pada tanda koma atau klausa logis berikutnya.

2. Setiap adegan WAJIB memiliki diagram mental model yang MENYESUAIKAN PERSIS dengan makna dan kata-kata di kalimat. Pilih salah satu dari 200 tipe wireframe dalam 20 kategori berikut:
40:    - SPECIAL DUAL SYNTHESIS: "mind_body" (Sinergi tubuh fisik dan disiplin pikiran, barbel + otak + sinaps).
41:    - TEMA 1. FINANSIAL & INVESTASI (finance):
42:      "money" (Aset & leverage finansial), "compound_vault" (Brankas bunga majemuk), "cashflow_river" (Arus kas masuk vs keluar), "debt_chain" (Rantai utang konsumtif), "stock_candlestick" (Grafik candlestick saham), "gold_ingot" (Emas batangan lindung nilai), "asymmetric_bet" (Taruhan asimetris risiko rendah potensi tinggi), "portfolio_pie" (Alokasi portofolio diversifikasi), "inflation_erosion" (Erosi inflasi nilai uang), "wealth_ladder" (Tangga piramida kekayaan).
43:    - TEMA 2. EKONOMI MAKRO & PASAR (economy):
44:      "scales" (Timbangan ekuilibrium & trade-off), "blocks" (Blok fondasi bisnis & aset), "supply_demand" (Kurva penawaran & permintaan), "global_trade" (Jaringan perdagangan global), "monopoly_moat" (Parit keunggulan kompetitif), "fiat_printer" (Pencetakan uang fiat), "business_cycle" (Siklus ekspansi & resesi), "labor_capital" (Pengungkit modal vs tenaga kerja), "tax_funnel" (Funnel perpajakan & efisiensi), "speculative_bubble" (Gelembung spekulasi pasar).
45:    - TEMA 3. MINDSET & FILSAFAT PIKIRAN (mindset):
46:      "brain" (Arsitektur otak kognitif), "polyhedron" (Geometri pemikiran Dan Koe), "infinite" (Permainan tanpa akhir / longevity), "cube_unfolding" (Dimensi tesseract / sudut pandang luas), "prism" (Prisma spektrum kejelasan), "growth_mindset" (Pola pikir bertumbuh vs tetap), "stoic_control" (Dikotomi kendali stoik), "first_principles" (Dekonstruksi first principles), "mental_friction" (Hambatan gesekan mental), "paradigm_lens" (Lensa paradigma persepsi).
47:    - TEMA 4. PSIKOLOGI & KOGNISI (psychology):
48:      "iceberg" (Gunung es alam bawah sadar), "maze" (Keluar dari labirin overthinking), "mirror" (Cermin refleksi diri tanpa ego), "ego_dissolve" (Peleburan ilusi ego), "cognitive_dissonance" (Disonansi kognitif keyakinan), "dopamine_meter" (Meteran dopamin instan vs dalam), "confirmation_tunnel" (Terowongan bias konfirmasi), "comfort_growth_zone" (Zona nyaman vs zona ekspansi), "flow_channel" (Saluran flow state tantangan vs keahlian), "maslow_pyramid" (Piramida hierarki kebutuhan Maslow).
49:    - TEMA 5. DARK PSIKOLOGI & MANIPULASI (dark_psychology):
50:      "puppet_master" (Dalang manipulasi boneka), "gaslight_lantern" (Lentera gaslighting & ilusi kebenaran), "mask_deceit" (Topeng kepalsuan sosial), "spider_trap" (Jaring laba-laba perangkap mental), "trojan_gift" (Kuda troya motif tersembunyi), "bait_hook" (Kail umpan pancingan emosi), "triangulation_toxic" (Segitiga konflik manipulasi), "love_bomb" (Ledakan bom kasih sayang semu), "predator_gaze" (Tatapan predator dingin eksploitasi), "hypnotic_whirl" (Pusaran hipnosis cuci otak).
51:    - TEMA 6. KESEHATAN & VITALITAS (health):
52:      "barbell" (Ketahanan beban fisik & otot), "battery" (Reservoir energi & kapasitas daya), "heart" (Detak jantung & kardiovaskular), "moon" (Deep sleep & ritme sirkadian), "water_drop" (Hidrasi seluler & keseimbangan cairan), "lungs_breath" (Pernapasan pranayama & oksigenasi), "cell_mitochondria" (Mitokondria ATP & regenerasi sel), "spine_alignment" (Keselarasan tulang belakang & postur), "gut_brain" (Sumbu mikrobiom usus dan otak), "cold_ice" (Resiliensi terapi mandi es hormesis).
53:    - TEMA 7. TEKNOLOGI & AI (technology):
54:      "neural_net" (Jaringan saraf tiruan & bobot sinaptik), "cpu_chip" (Mikroprosesor silikon & GPU), "code_terminal" (Terminal kode & mesin algoritma), "cyborg_touch" (Sentuhan bionik konvergensi manusia & AI), "cloud_cluster" (Cluster server cloud terdistribusi), "database_stack" (Basis data relasional & data lake), "quantum_sphere" (Bloch sphere kubit kuantum superposisi), "cyber_firewall" (Perisai keamanan siber heksagonal), "ai_prompt_engine" (Mesin inferensi prompt LLM), "agent_swarm" (Kawanan agen AI otonom).
55:    - TEMA 8. RELASI & DINAMIKA SOSIAL (people):
56:      "crowd_divergence" (Keluar dari kawanan 99%), "crown" (Kedaulatan diri sovereign individual), "handshake_deal" (Aliansi simbiotik win-win), "network_hub" (Sentralitas jaringan Metcalfe), "empathy_bridge" (Jembatan resonansi empati), "torch_mentor" (Estafet obor kebijaksanaan mentor), "tribe_fire" (Api unggun lingkaran inti terpercaya), "charisma_aura" (Aura karisma magnetis & wibawa), "shield_boundaries" (Batasan tegas integritas diri "No"), "synergy_gears" (Roda gigi sinergi tim 1+1=3).
57:    - TEMA 9. AKTIVITAS HARIAN & RUTINITAS (daily_activity):
58:      "hourglass" (Pengungkit waktu & memento mori), "dawn_alarm" (Alarm jam 5 fajar momentum pagi), "journal_pen" (Jurnal refleksi harian & pena sintesis), "deep_work_sprint" (Stopwatch 90 menit deep work tanpa distraksi), "coffee_ritual" (Ritual kopi pagi uap mengepul), "checklist_done" (Checklist 3 tugas prioritas tuntas), "walking_steps" (10.000 langkah kaki meditasi jalan), "digital_detox" (Detoks layar ponsel mati tanpa distraksi), "night_reading" (Lampu belajar baca buku malam), "habit_flywheel" (Flywheel kebiasaan otomatis Atomic Habits).
59:    - TEMA 10. ALAM, BUMI & KOSMOS (earth):
60:      "globe_earth" (Globe bumi pale blue dot & cincin orbit), "tree" (Pohon oak kuno berakar dalam & kanopi rindang), "mountain" (Puncak gunung apex summit), "ocean_wave" (Gelombang ombak samudra dahsyat), "black_hole" (Singularitas lubang hitam & event horizon), "lightning" (Sambaran kilat halilintar bertegangan tinggi), "volcano" (Erupsi gunung berapi & rekahan magma), "desert_oasis" (Oasis mata air di tengah gurun tandus), "meteor_trail" (Jejak meteor kosmik meluncur di langit malam), "constellation" (Peta rasi bintang & kompas kosmik).
61:    - TEMA 11. BINATANG & INSTING ALAM (animals):
62:      "lion_pride" (Singa savana & keberanian raja), "eagle_soar" (Rajawali terbang tinggi visi makro), "wolf_pack" (Serigala melolong sinergi kawanan), "chameleon_adapt" (Bunglon kamuflase adaptasi lingkungan), "owl_wisdom" (Burung hantu kebijaksanaan malam hening), "ant_colony" (Semut disiplin beban 50x tubuh), "bull_charge" (Banteng menyeruduk momentum bullish), "shark_fin" (Hiu predator pantang berhenti berenang), "cheetah_sprint" (Cheetah akselerasi kilat burst 120km/h), "butterfly_metamorphosis" (Metamorfosis kepompong ke kupu-kupu).
63:    - TEMA 12. FENOMENA & LANSKAP ALAM (nature):
64:      "waterfall" (Air terjun curahan energi kinetik deras), "river_meander" (Kelokan sungai mengikis batu karang), "wind_tornado" (Angin tornado pusaran vorteks siklon), "canyon_strata" (Ngarai lembah strata lapisan geologi waktu), "glacier_ice" (Gletser es abadi momentum tak terbendung), "aurora_borealis" (Pendar aurora borealis magnetosfer langit), "rainbow_arc" (Busur pelangi prisma harapan pasca badai), "cave_stalactite" (Kedalaman gua stalaktit tetesan mineral), "geyser_eruption" (Geyser semburan air panas geotermal dahsyat), "dune_drift" (Riak pasir gurun bergeser tertiup angin).
65:    - TEMA 13. TUMBUHAN & BOTANI (plants):
66:      "seed_sprout" (Benih bertunas menembus tanah), "lotus_flower" (Bunga teratai mekar murni dari lumpur), "bamboo_resilience" (Batang bambu lentur ditiup angin tanpa patah), "vine_creeper" (Sulur tanaman merambat mencari celah tinggi), "leaf_photosynthesis" (Daun klorofil konversi energi surya fotosintesis), "mycelium_network" (Jaringan miselium spora jamur simbiosis hutan), "cactus_succulent" (Kaktus gurun berduri ketahanan tanpa air), "sunflower_heliotropism" (Bunga matahari mengejar arah cahaya), "wheat_harvest" (Bulir gandum panen jerih payah melimpah), "bonsai_mastery" (Seni bonsai ketekunan pemangkasan dahan).
67:    - TEMA 14. PEKERJAAN & CRAFTSMANSHIP (work):
68:      "anvil_hammer" (Landasan besi anvil & palu tempaan bertekanan), "blueprint_draft" (Cetak biru arsitek & sketsa sistematis), "briefcase_deal" (Koper eksekutif & negosiasi komersial), "workbench_tools" (Meja kerja pertukangan & perkakas pengrajin), "assembly_line" (Lini perakitan ban berjalan otomatisasi), "scientist_microscope" (Mikroskop laboratorium analisis empiris), "artist_easel" (Kanvas easel seniman & kanvas visi murni), "gavel_justice" (Palu hakim ketukan vonis putusan mutlak), "compass_caliper" (Jangka sorong kaliper toleransi mikron presisi), "conveyor_delivery" (Paket logistik rantai pasok pengiriman tepat waktu).
69:    - TEMA 15. SEJARAH & PERADABAN KUNO (history):
70:      "roman_pillar" (Pilar Romawi Corinthian & stoik), "spartan_helmet" (Helm perisai Spartan Molon Labe), "viking_longship" (Kapal Drakkar Viking arungi samudra), "sundial_shadow" (Jam bayangan matahari kuno gnomon), "ancient_scroll" (Gulungan papirus codex Alexandria), "sword_excalibur" (Pedang dalam batu Excalibur takdir raja), "castle_citadel" (Benteng kastil pertahanan kokoh), "siege_catapult" (Katapel Trebuchet lontaran batu tinggi), "stonehenge_trilithon" (Megalitikum Stonehenge penjajaran surya), "hieroglyph_slab" (Batu Rosetta pengurai hieroglif kuno).
71:    - TEMA 16. STRATEGI MILITER & PERANG (military):
72:      "chess_tactics" (Taktik catur pengorbanan & skakmat), "flank_maneuver" (Gerakan menjepit pincer flank envelopment), "trojan_decoy" (Kuda troya & tipu muslihat infiltrasi), "trench_fortress" (Parit pertahanan berlapis bunker), "recon_tower" (Menara intai pengawas perimeter 360), "truce_flag" (Bendera gencatan senjata parley diplomasi), "phalanx_spears" (Formasi phalanx dinding tombak sarissa), "minefield_tripwire" (Kawat pemicu jebakan ladang ranjau), "smoke_signal" (Sinyal asap komunikasi visual medan tempur), "radar_sweep" (Sapuan reticle radar pemindai ancaman 360).
73:    - TEMA 17. ZEN, TAOISME & KETENANGAN (zen):
74:      "enso_circle" (Lingkaran Enso kehampaan & wabi-sabi), "yin_yang_flow" (Keseimbangan dinamis Taiji Yin-Yang), "torii_gate" (Gerbang Torii batas duniawi & sakral), "singing_bowl" (Resonansi gelombang mangkuk Tibet singing bowl), "stone_stack" (Tumpukan batu cairn keseimbangan gravitasi), "koi_yin_yang" (Dua ikan koi perputaran harmoni kolam), "incense_smoke" (Dupa kontemplasi kepulan asap meliuk), "dharma_wheel" (Roda Dharma delapan jalur kebenaran mulia), "tea_ceremony" (Upacara minum teh matcha chawan kesadaran), "temple_bell" (Dentang lonceng kuil Bonsho dengung mendalam).
75:    - TEMA 18. RUANG ANGKASA & KOSMOS (space):
76:      "rocket_propulsion" (Peluncuran roket kecepatan lepas atmosfer), "satellite_orbit" (Satelit orbit transmisi telemetri bumi), "saturn_rings" (Cincin kosmik planet gas raksasa Saturnus), "space_station" (Stasiun luar angkasa modular ISS mikrogravitasi), "wormhole_fold" (Lubang cacing jembatan lipatan ruang waktu), "mars_colony_dome" (Kubah habitat geodesik koloni Mars), "radio_telescope" (Teleskop radio parabola mendengarkan sinyal kosmos), "white_hole" (Lubang putih pancaran energi spontan semesta), "lunar_lander" (Modul pendarat bulan Apollo tapak debu), "cosmic_nebula" (Nebula pembibitan bintang kelahiran protostar).
77:    - TEMA 19. EMOSI & KEDALAMAN JIWA (emotions):
78:      "rage_flame" (Kobaran api amarah katarsis meledak), "tears_catharsis" (Air mata kelegaan tetesan pemulihan duka), "iron_will" (Faset intan tekad baja tahan tekanan tinggi), "anxiety_cage" (Jeruji kawat kecemasan pelepasan inti jiwa), "serenity_lake" (Danau kaca ketenangan refleksi bintang hening), "envy_thorn" (Duri kedengkian mencekik jantung), "hope_beacon" (Mercusuar lentera harapan menembus badai), "empathy_hug" (Dua jiwa berpelukan saling menopang empati), "mask_shadow" (Pelepasan topeng persona integrasi shadow Jung), "regret_scales" (Timbangan retrospeksi penyesalan masa lalu vs hikmah).
79:    - TEMA 20. KONTEN KREATOR & SOLOPRENEUR (creator):
80:      "typewriter_key" (Ketukan mekanis mesin tik daya kata tertulis), "camera_aperture" (Diafragma 8 bilah lensa kedalaman fokus), "broadcast_mic" (Mikrofon kondenser studio siaran vokal autentik), "content_funnel" (Corong audiens konversi 1.000 true fans), "film_reel" (Rol film 35mm bingkai sinematografi cerita), "viral_coefficient" (Pohon percabangan eksponensial K-factor > 1), "core_community" (Konstelasi suku lingkaran api komunitas intim), "monetization_button" (Tombol monetisasi switch akses digital mandiri), "deep_flow_clock" (Jam blok kerja fokus monastik 4 jam deep work), "eureka_bulb" (Bohlam filamen pijar kilatan inspirasi Eureka).
81: 3. PENTING: Judul diagram ("title") dan isi "nodes" HARUS spesifik diambil dari kata-kata kalimat tersebut (JANGAN gunakan teks generik).
4. Tentukan 1 kata kunci penekanan (highlightWord) yang paling berdampak untuk disorot bercahaya.
5. Tentukan tag topik filosofis (topicTag), contoh: "[ MENTAL MODEL // 01 ]", "[ SIKLUS KONSUMSI ]", "[ HIGH LEVERAGE ]", "[ FOKUS ATENSI ]".
6. Tata letak default (layoutMode) adalah "diagram-stacked" (Diagram Atas + Teks Bawah).

OUTPUT WAJIB FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS:
[
  {
    "narration": "Kalimat narasi adegan yang stoik dan berbobot.",
    "topicTag": "[ MENTAL MODEL // 01 ]",
    "highlightWord": "kata_kunci",
    "layoutMode": "diagram-stacked",
    "diagram": {
      "type": "loop",
      "title": "THE CONSUMPTION TRAP",
      "nodes": ["01. KONSUMSI KONTEN", "02. DOPAMINE INSTAN", "03. TANPA EKSEKUSI", "04. RASA BERSALAH"]
    }
  }
]`;

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 7500);

				const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${effectiveKey}`
					},
					body: JSON.stringify({
						model: 'deepseek-chat',
						messages: [{ role: 'user', content: prompt }],
						temperature: 0.5,
						max_tokens: 3000
					}),
					signal: controller.signal
				});

				clearTimeout(timeoutId);

				if (aiRes.ok) {
					const data = await aiRes.json();
					let rawContent = data.choices?.[0]?.message?.content?.trim() || '';
					rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

					const parsed = JSON.parse(rawContent);
					if (Array.isArray(parsed) && parsed.length > 0) {
						// Flatten any scenes where narration exceeds 32 chars into consecutive next scenes
						const flattenedItems = [];
						for (const item of parsed) {
							const text = (item.narration || '').trim();
							if (text.length > 46) {
								const beats = splitSentenceIntoConsistentBeats(text, 44);
								if (beats.length > 1) {
									beats.forEach((subBeat, bIdx) => {
										flattenedItems.push({
											...item,
											narration: subBeat,
											highlightWord: bIdx === 0 ? item.highlightWord : (subBeat.split(/\s+/).filter(Boolean)[0] || item.highlightWord),
											topicTag: item.topicTag ? `${item.topicTag} ${bIdx > 0 ? `// 0${bIdx + 1}` : ''}` : item.topicTag
										});
									});
									continue;
								}
							}
							flattenedItems.push(item);
						}

						// Build SVGs and multi-word phases for each scene
						const formattedScenes = flattenedItems.map((item, idx) => {
							const diagData = {
								type: item.diagram?.type || 'loop',
								title: item.diagram?.title || 'THE MENTAL MODEL',
								tag: item.topicTag || `[ CONCEPT // ${String(idx + 1).padStart(2, '0')} ]`,
								nodes: item.diagram?.nodes || ['01. INPUT', '02. SISTEM', '03. AKSI', '04. HASIL'],
								highlightWord: item.highlightWord || '',
								accentColor
							};

							const customSvg = generateDanKoeSVG(diagData, accentColor);
							const phases = analyzeSentencePhases(item.narration, accentColor);
							const words = (item.narration || '').split(/\s+/).filter(Boolean);
							const estDur = Math.max(2.5, Number((words.length * 0.45).toFixed(1)));

							return {
								id: `scene-typo-${idx}-${Date.now()}`,
								narration: item.narration,
								topicTag: item.topicTag || diagData.tag,
								highlightWord: item.highlightWord || words[0] || 'Fokus',
								diagramData: diagData,
								customSvg: customSvg,
								diagramType: diagData.type,
								phases: phases,
								layoutMode: item.layoutMode || 'diagram-stacked',
								audioDuration: estDur,
								voiceAudioUrl: null
							};
						});

						return json({ success: true, source: 'deepseek-ai', scenes: formattedScenes });
					}
				}
			} catch (aiErr) {
				console.warn('AI analysis fallback to local NLP engine:', aiErr.message);
			}
		}

		// Local NLP Engine Fallback (Instant, 100% Reliable & Multi-Phase Vector Transitions)
		const rawLines = splitTextIntoDanKoeBeats(rawInput);

		const fallbackScenes = rawLines.map((line, idx) => {
			const words = line.split(/\s+/).filter(Boolean);
			const estDur = Math.max(3, Number((words.length * 0.44).toFixed(1)));
			const diagData = analyzeNarrationToDiagram(line, accentColor);
			const phases = analyzeSentencePhases(line, accentColor);
			const customSvg = generateDanKoeSVG(diagData, accentColor);

			return {
				id: `scene-typo-${idx}-${Date.now()}`,
				narration: line,
				topicTag: diagData.tag || `[ MENTAL MODEL // ${String(idx + 1).padStart(2, '0')} ]`,
				highlightWord: diagData.highlightWord || words[0] || 'Fokus',
				diagramData: diagData,
				customSvg: customSvg,
				diagramType: diagData.type,
				phases: phases,
				layoutMode: 'diagram-stacked',
				audioDuration: estDur,
				voiceAudioUrl: null
			};
		});

		return json({ success: true, source: 'local-nlp', scenes: fallbackScenes });
	} catch (err) {
		console.error('Error in analyze-typography:', err);
		return json({ error: err.message || 'Gagal menganalisis naskah' }, { status: 500 });
	}
}
