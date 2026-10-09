import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || '';
const isExpiredKey = (k) => !k || k === 'sk-0802f45e1d4e41c8ae8d46396c97b746';

// ------------------------------------------------------------------
// Theme Definitions
// ------------------------------------------------------------------
const THEME_DEFINITIONS = {
	'dark-psychology': {
		label: 'Dark Psychology & Manipulasi',
		labelEn: 'Dark Psychology & Manipulation',
		systemPersona:
			'Kamu adalah penulis konten psikologi gelap viral Indonesia. Spesialisasimu: dark psychology, manipulasi, gaslighting, silent treatment, social engineering, cara membaca orang. Gaya: tegas, sedikit sinis, pengetahuan dalam, bikin penonton merasa mendapatkan wawasan eksklusif yang tidak banyak orang tahu.',
		systemPersonaEn:
			'You are a top-tier viral dark psychology content writer. Your expertise: dark psychology, manipulation tactics, gaslighting, silent treatment, social engineering, reading people. Style: assertive, slightly cynical, deeply knowledgeable — making viewers feel they are gaining exclusive insider wisdom most people never learn.',
		hookStyle: 'pertanyaan provokatif atau pernyataan kontroversial',
		hookStyleEn: 'provocative question or controversial statement',
		exampleTopics: [
			'trik tatapan mata 3 detik membaca kebohongan', 'bahaya love bombing sebelum mereka menghancurkanmu', 'trik reverse psychology membuat orang patuh',
			'tanda silent treatment beracun dan cara membalasnya', 'hukum kekuasaan 48 Laws of Power jangan ungguli atasan', 'efek gaslighting pada psikologis korban',
			'teknik negosiasi sandera FBI Chris Voss', 'mengapa orang baik justru paling sering dimanfaatkan', 'trik mirroring bawah sadar memikat siapa saja',
			'psikologi orang narsistik memutarbalikkan fakta', 'cara menghentikan serangan verbal dalam 3 detik', 'trik Ben Franklin mengubah musuh jadi sekutu',
			'trik framing bawah sadar menanamkan ide', 'psikologi orang bermuka dua dan tanda kecemburuan halus', 'trik mengendalikan emosi saat diprovokasi'
		],
		exampleTopicsEn: [
			'3-second eye contact trick to detect lies', 'hidden dangers of love bombing before the trap', 'advanced reverse psychology to win arguments',
			'toxic silent treatment and how to shut it down', '48 Laws of Power: never outshine the master', 'how gaslighting silently breaks your reality',
			'FBI hostage negotiation framing tactics', 'why nice people get taken advantage of the most', 'subconscious mirroring technique to charm anyone',
			'psychology of narcissists twisting facts', 'how to disarm verbal attacks in 3 seconds', 'the Benjamin Franklin effect: turning enemies into allies'
		]
	},
	'fakta-unik': {
		label: 'Fakta Unik & Mind-Blowing',
		labelEn: 'Mind-Blowing Facts',
		systemPersona:
			'Kamu adalah penulis konten fakta ilmiah dan sains viral Indonesia. Spesialisasimu: fakta kontra-intuitif, paradoks ilmiah, penemuan yang mengubah paradigma. Gaya: antusias namun berbobot, pengetahuan luas, bikin penonton tercengang dan ingin share ke teman.',
		systemPersonaEn:
			'You are a top-tier viral science & facts content writer. Your expertise: counter-intuitive facts, scientific paradoxes, paradigm-shifting discoveries. Style: enthusiastic yet authoritative, broad knowledge, making viewers gasp and share immediately.',
		hookStyle: 'fakta mengejutkan yang berlawanan dengan asumsi umum',
		hookStyleEn: 'shocking fact that contradicts common assumptions',
		exampleTopics: [
			'rahasia dilatasi waktu di lubang hitam', 'mengapa laut dalam lebih misterius dari luar angkasa', 'hewan ubur-ubur abadi yang bisa hidup selamanya',
			'fenomena dejavu dan ilusi memori otak', 'mengapa 99.9% atom di tubuhmu ruang kosong', 'paradoks waktu kakek (grandfather paradox)',
			'suara The Bloop dari palung laut terdalam', 'fakta manusia tidak bisa membayangkan warna baru', 'jamur cordyceps pengubah serangga jadi zombie',
			'kecepatan cahaya dan ilusi melihat masa lalu', 'fakta pohon saling bicara lewat jaringan jamur', 'fenomena tidur ketindihan (sleep paralysis)'
		],
		exampleTopicsEn: [
			'time dilation mystery inside a black hole', 'why the deep ocean is more terrifying than outer space', 'the immortal jellyfish that defies death',
			'what science says about déjà vu and brain lag', 'why 99.999% of your body is empty space', 'the grandfather paradox explained simply',
			'the mysterious Bloop sound recorded in the Pacific', 'why the human brain cannot imagine a new color', 'the zombie fungus controlling insect brains'
		]
	},
	'psikologi': {
		label: 'Psikologi Populer & Hubungan',
		labelEn: 'Psychology & Relationships',
		systemPersona:
			'Kamu adalah penulis konten psikologi hubungan dan kesehatan mental viral Indonesia. Spesialisasimu: overthinking, anxiety, pola hubungan toxic, bahasa cinta, trauma healing. Gaya: empatik, relatable, terasa seperti teman yang paham dan memberikan insight berharga.',
		systemPersonaEn:
			'You are a top-tier viral psychology & relationships content writer. Your expertise: overthinking, anxiety, toxic relationship patterns, love languages, trauma healing. Style: empathetic, deeply relatable, like a wise friend who truly understands and delivers valuable insights.',
		hookStyle: 'pertanyaan yang langsung nyentuh pengalaman sehari-hari penonton',
		hookStyleEn: 'question that directly touches viewers\' everyday experience',
		exampleTopics: [
			'alasan otakmu overthinking jam 2 malam', 'tanda kamu punya anxious attachment style', 'kebiasaan kecil yang diam-diam merusak mental',
			'mengapa kamu sulit berkata tidak (people pleaser)', 'efek Dunning-Kruger kenapa orang bodoh paling percaya diri', 'sindrom impostor merasa tidak pantas sukses',
			'psikologi di balik trauma masa kecil dan inner child', 'trik 5 detik Mel Robbins hancurkan prokrastinasi', 'efek Zeigarnik kenapa tugas belum selesai bikin stres',
			'kenapa kita tertarik pada orang yang mengabaikan kita', 'bahaya emosional burnout yang tidak disadari', 'psikologi trauma bonding susah lepas dari hubungan toxic'
		],
		exampleTopicsEn: [
			'why your brain forces you to overthink at 2 AM', 'signs you have an anxious attachment style', 'tiny habits silently destroying your mental peace',
			'why you can never say no (people pleaser syndrome)', 'the Dunning-Kruger effect: why ignorance is confident', 'impostor syndrome: feeling like a fraud despite success',
			'the 5-second rule to destroy procrastination instantly', 'the Zeigarnik effect: why unfinished things torture your brain', 'why we chase people who ignore us'
		]
	},
	stoikisme: {
		label: 'Stoikisme & Mindset',
		labelEn: 'Stoicism & Mindset',
		systemPersona:
			'Kamu adalah penulis konten filosofi stoikisme dan pengembangan diri viral Indonesia. Spesialisasimu: ajaran Marcus Aurelius, Epictetus, Seneca, dan aplikasinya di kehidupan modern. Gaya: tenang, berbobot, kebijaksanaan kuno yang terasa relevan hari ini.',
		systemPersonaEn:
			'You are a top-tier viral Stoicism & self-improvement content writer. Your expertise: teachings of Marcus Aurelius, Epictetus, Seneca, and their application in modern life. Style: calm, deeply wise, ancient wisdom that feels shockingly relevant today.',
		hookStyle: 'kutipan atau prinsip filosofis yang terasa bertentangan dengan cara pikir modern',
		hookStyleEn: 'philosophical quote or principle that contradicts modern thinking',
		exampleTopics: [
			'prinsip Marcus Aurelius saat dihina orang', 'seni Seneca berhenti menderita sebelum masalah datang', 'dikotomi kendali Epictetus rumus bebas stres 90%',
			'memento mori hack psikologis membuang kemalasan', 'filosofi Amor Fati mencintai takdir terburukmu', 'cara stoik menghadapi orang toxic tanpa emosi',
			'mengapa hidup sederhana membuatmu mustahil dikalahkan', 'rahasia mental baja kaisar romawi Marcus Aurelius', 'berhenti membuang energi untuk hal di luar kendalimu',
			'kekuatan voluntary discomfort sengaja hidup susah agar kebal', 'cara tetap tenang saat semua rencanamu hancur total', 'kekuatan hening saat dunia penuh kebisingan'
		],
		exampleTopicsEn: [
			'Marcus Aurelius\' rule when someone insults you', 'Seneca: we suffer more in imagination than reality', 'Epictetus\' dichotomy of control: eliminating 90% of stress',
			'memento mori: the ultimate death hack against laziness', 'Amor Fati: why you should love your worst setbacks', 'dealing with toxic bosses the Stoic way',
			'why simple living makes you invincible', 'the emperor mindset of Marcus Aurelius', 'voluntary discomfort: why you should practice hardship'
		]
	},
	misteri: {
		label: 'Misteri Sains & Sejarah',
		labelEn: 'Mystery & Investigation',
		systemPersona:
			'Kamu adalah penulis konten misteri dan investigasi viral Indonesia. Spesialisasimu: cold case, anomali sains, teori konspirasi masuk akal, sejarah yang tersembunyi. Gaya: misterius, investigatif, membangun ketegangan secara bertahap seperti detektif.',
		systemPersonaEn:
			'You are a top-tier viral mystery & investigation content writer. Your expertise: cold cases, scientific anomalies, plausible conspiracy theories, hidden history. Style: mysterious, investigative, building suspense gradually like a detective.',
		hookStyle: 'pertanyaan misterius yang belum terjawab atau fakta yang disembunyikan',
		hookStyleEn: 'mysterious unanswered question or a hidden fact',
		exampleTopics: [
			'misteri 9 pendaki Dyatlov Pass yang tewas aneh', 'sinyal luar angkasa Wow Signal tahun 1977', 'manuskrip voynich 600 tahun tak bisa dipecahkan',
			'kota bawah tanah kuno Derinkuyu sedalam 85 meter', 'misteri seluruh awak kapal Mary Celeste lenyap', 'piramida tersembunyi dan misteri Antartika',
			'eksperimen tidur rusia legenda menyeramkan', 'anomali Segitiga Bermuda dan gas metana laut', 'rahasia perpustakaan alexandria yang lenyap',
			'suara frekuensi 19 Hz yang membuat orang lihat hantu', 'misteri manusia es Otzi berusia 5000 tahun', 'batu berjalan misterius di Death Valley'
		],
		exampleTopicsEn: [
			'the bizarre unsolved Dyatlov Pass incident', 'the 1977 Wow Signal from deep space that never repeated', 'the 600-year-old Voynich manuscript nobody can decipher',
			'the underground city of Derinkuyu built 85 meters deep', 'the ghost ship Mary Celeste: entire crew vanished', 'the hidden anomalies beneath Antarctica',
			'the 19 Hz infrasound frequency that makes people see ghosts', 'the lost secrets of the Library of Alexandria', 'the sailing stones of Death Valley moving on their own'
		]
	},
	custom: {
		label: 'Topik Kustom',
		labelEn: 'Custom Topic',
		systemPersona:
			'Kamu adalah penulis konten YouTube Shorts viral Indonesia yang berpengalaman. Spesialisasimu: membuat konten pendek yang memiliki pacing cepat, hook kuat, dan informasi padat namun mudah dicerna penonton.',
		systemPersonaEn:
			'You are a top-tier viral YouTube Shorts content writer. Your expertise: creating short-form content with fast pacing, powerful hooks, and densely packed yet easily digestible information for viewers.',
		hookStyle: 'hook paling kuat yang sesuai topik',
		hookStyleEn: 'the strongest hook that fits the topic',
		exampleTopics: [],
		exampleTopicsEn: []
	}
};

// ------------------------------------------------------------------
// Script generation prompt builder
// ------------------------------------------------------------------
function buildShortsPrompt(theme, topic, targetDurationSec = 35, lang = 'id') {
	const def = THEME_DEFINITIONS[theme] || THEME_DEFINITIONS['custom'];
	const isEn = lang === 'en';
	const wordTarget = Math.round((targetDurationSec / 60) * (isEn ? 155 : 140)); // English speakers are slightly faster

	const persona = isEn ? (def.systemPersonaEn || def.systemPersona) : def.systemPersona;
	const hookGaya = isEn ? (def.hookStyleEn || def.hookStyle) : def.hookStyle;
	const themeLabel = isEn ? (def.labelEn || def.label) : def.label;

	let systemPrompt;
	if (isEn) {
		systemPrompt = `You are the #1 viral YouTube Shorts scriptwriter in the world.

${persona}

OUTPUT FORMAT RULES (MUST be valid JSON, NO other text):
You MUST return a valid JSON object with this structure:
{
  "title": "...",
  "hook": "...",
  "scenes": [
    {
      "id": 1,
      "duration": 3.5,
      "spokenText": "...",
      "visualDescription": "...",
      "giphyQuery": "..."
    }
  ],
  "totalEstimatedDuration": 35
}

IMPORTANT RULES:
1. "title": An extremely curiosity-inducing Shorts/Reels title (max 60 characters).
2. "hook": Opening sentence (first 3-4 seconds). Style: ${hookGaya}. MUST make the viewer freeze and stop scrolling.
3. "scenes": Array of 6-10 scenes. Each scene has:
   - "id": Sequential number
   - "duration": Duration in seconds (2.5 - 5.0). Match to text length.
   - "spokenText": Narrator's spoken text. Conversational English. DENSE, no filler. One or two sentences per scene.
   - "visualDescription": Brief description of the visual concept (in English)
   - "giphyQuery": 1-2 English words to search for clips/GIFs (NEVER use sentences or >2 words). Examples: "mind blown", "smirk", "detective", "shocked", "secret", "money", "running". Each scene MUST use a DIFFERENT query.
4. First scene MUST contain a very strong "hook". Max 3 seconds.
5. Last scene MUST have a loop closer / CTA for comments.
6. Total duration of all scenes should be around ${targetDurationSec} seconds (±5 seconds).
7. Total spokenText across all scenes should be around ${wordTarget} words (${Math.round(wordTarget * 0.8)}-${Math.round(wordTarget * 1.2)} words).
8. DO NOT use formal language. Use casual, conversational English that sounds natural when spoken aloud.
9. Use "you" not "one" or overly formal constructions.
10. Output ONLY JSON. No markdown, no explanation, no code fences.`;
	} else {
		systemPrompt = `Kamu adalah scriptwriter konten YouTube Shorts viral terbaik Indonesia.

${persona}

ATURAN FORMAT OUTPUT (WAJIB JSON, TIDAK BOLEH ADA TEKS LAIN):
Kamu HARUS mengembalikan objek JSON yang valid dengan struktur berikut:
{
  "title": "...",
  "hook": "...",
  "scenes": [
    {
      "id": 1,
      "duration": 3.5,
      "spokenText": "...",
      "visualDescription": "...",
      "giphyQuery": "..."
    }
  ],
  "totalEstimatedDuration": 35
}

ATURAN PENTING:
1. "title": Judul video yang sangat menarik untuk Shorts/Reels (max 60 karakter), memicu rasa ingin tahu ekstrem.
2. "hook": Kalimat pertama pembuka (3-4 detik pertama). Gunakan gaya: ${hookGaya}. HARUS membuat penonton freeze dan tidak mau scroll.
3. "scenes": Array 6-10 adegan. Setiap adegan memiliki:
   - "id": Nomor urut
   - "duration": Durasi dalam detik (2.5 - 5.0). Sesuaikan dengan panjang teks.
   - "spokenText": Teks narasi yang diucapkan narator. Bahasa Indonesia conversational. PADAT, tidak bertele-tele. Satu atau dua kalimat per adegan.
   - "visualDescription": Deskripsi singkat apa yang ingin ditampilkan (Bahasa Indonesia)
   - "giphyQuery": 1-2 kata kunci bahasa INGGRIS yang populer dan singkat untuk mencari GIF di GIPHY (WAJIB 1-2 KATA SAJA, JANGAN kalimat atau frasa panjang! Contoh: "mind blown", "smirk", "detective", "shocked", "secret", "money", "running"). Setiap adegan HARUS menggunakan kata kunci yang BERBEDA agar visual bervariasi.
4. Adegan pertama HARUS berisi "hook" yang sangat kuat. Durasi max 3 detik.
5. Adegan terakhir HARUS memiliki kalimat penutup loop / CTA untuk komentar.
6. Total durasi semua adegan dijumlahkan harus sekitar ${targetDurationSec} detik (±5 detik).
7. Total spokenText seluruh adegan sekitar ${wordTarget} kata (${Math.round(wordTarget * 0.8)}-${Math.round(wordTarget * 1.2)} kata).
8. JANGAN gunakan bahasa formal. Gunakan bahasa percakapan sehari-hari yang enak didengar.
9. JANGAN gunakan kata "Anda". Gunakan "kamu", "kita", atau kalimat impersonal.
10. Output HANYA JSON. Tidak ada markdown, tidak ada penjelasan, tidak ada kode fence.`;
	}

	const userPrompt = isEn
		? `Theme: ${themeLabel}\nSpecific Topic: ${topic}\nTarget Duration: ${targetDurationSec} seconds\n\nCreate an extremely viral YouTube Shorts script with a hook that makes viewers unable to stop watching.\nRemember: giphyQuery MUST be in English and accurately represent the emotion/visual.`
		: `Tema: ${themeLabel}\nTopik Spesifik: ${topic}\nTarget Durasi: ${targetDurationSec} detik\n\nBuat naskah YouTube Shorts yang sangat viral dengan hook yang membuat penonton tidak bisa berhenti menonton.\nIngat: giphyQuery HARUS dalam bahasa Inggris dan menggambarkan emosi/visual yang pas.`;

	return { systemPrompt, userPrompt };
}

// ------------------------------------------------------------------
// Title generation prompt
// ------------------------------------------------------------------
function buildTitlePrompt(theme, topic, options = {}) {
	const def = THEME_DEFINITIONS[theme] || THEME_DEFINITIONS['custom'];
	const excludeTitles = Array.isArray(options.excludeTitles) ? options.excludeTitles.filter(Boolean) : [];
	const seed = options.seed || Math.random().toString(36).slice(2, 8);
	const isEn = options.lang === 'en';
	const isReroll = Boolean(options.isReroll);
	const rerollCount = Number(options.rerollCount) || 0;
	const customTopic = (options.customTopic || '').trim();

	const themeLabel = isEn ? (def.labelEn || def.label) : def.label;
	const hookGaya = isEn ? (def.hookStyleEn || def.hookStyle) : def.hookStyle;
	const topicPool = isEn ? (def.exampleTopicsEn || def.exampleTopics || []) : (def.exampleTopics || []);

	// Determine 3 completely distinct sub-topics or angles for this batch
	let assignedAngles = [];
	if (topicPool.length > 0 && (!customTopic || theme !== 'custom')) {
		// Filter out topics already part of previous titles
		const unused = topicPool.filter(
			(t) => !excludeTitles.some((ex) => ex.toLowerCase().includes(t.toLowerCase().slice(0, 15)))
		);
		const pool = unused.length >= 3 ? unused : topicPool;
		const offset = (rerollCount * 3) % pool.length;
		const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
		assignedAngles = rotated.slice(0, 3);
	} else {
		// Custom topic angles: vary the intellectual and emotional perspective
		const anglesId = [
			`Sisi gelap, bahaya tersembunyi, atau rahasia yang sengaja ditutup-tutupi`,
			`Mitos umum atau kesalahan fatal 99% orang yang berakibat fatal`,
			`Fakta psikologis bawah sadar atau studi kasus ekstrem yang mencengangkan`,
			`Trik cerdas atau strategi rahasia yang tidak diajarkan secara umum`,
			`Paradoks aneh atau hukum alam yang terbalik dari logika awam`,
			`Peristiwa sejarah nyata atau eksperimen gila di balik fenomena ini`
		];
		const anglesEn = [
			`Dark side, hidden danger, or covered-up secret`,
			`Common myth or fatal mistake 99% of people make`,
			`Subconscious psychological fact or shocking extreme case study`,
			`Genius trick or counter-intuitive strategy not taught in public`,
			`Bizarre paradox or reality that flips common logic upside down`,
			`True historical anomaly or wild experiment behind this phenomenon`
		];
		const list = isEn ? anglesEn : anglesId;
		const offset = (rerollCount * 3) % list.length;
		assignedAngles = [
			list[offset % list.length],
			list[(offset + 1) % list.length],
			list[(offset + 2) % list.length]
		];
	}

	let excludeInstruction = '';
	if (excludeTitles.length > 0) {
		excludeInstruction = isEn
			? `\nCRITICAL ANTI-DUPLICATION RULE:\nDO NOT create titles similar to these (already generated in previous rolls):\n${excludeTitles.map((t) => `- "${t}"`).join('\n')}\nYou MUST explore totally NEW phenomena, wording, and premises!\n`
			: `\nATURAN KETAT ANTI-DUPLIKASI:\nJANGAN buat judul yang mirip atau berputar-putar di topik yang sama dengan judul sebelumnya:\n${excludeTitles.map((t) => `- "${t}"`).join('\n')}\nKamu WAJIB mengangkat fenomena, kosakata, dan sudut pandang yang BENAR-BENAR BARU!\n`;
	}

	const rerollWarning = isReroll
		? (isEn
			? `\n[ATTENTION: USER CLICKED REROLL / SHUFFLE]\nThe user wants 3 TOTALLY FRESH, UNEXPECTED, and UNRELATED sub-topics under ${themeLabel}. DO NOT repeat or circle around previous concepts!`
			: `\n[PERHATIAN: PENGGUNA MENEKAN ACAK JUDUL LAIN]\nPengguna menginginkan 3 judul dengan topik dan sudut pandang yang BENAR-BENAR SEGAR, MENGEJUTKAN, dan BERBEDA TOTAL dalam payung ${themeLabel}. JANGAN berputar-putar di topik yang sama!`)
		: '';

	let systemPrompt;
	if (isEn) {
		systemPrompt = `You are the world's #1 viral YouTube Shorts title specialist.
Theme specialty: ${themeLabel}

TASK:
Create 3 YouTube Shorts title options that are EXTREMELY VIRAL, HIGH-CTR, and COMPLETELY DIFFERENT FROM EACH OTHER.
Each of the 3 options MUST explore a completely different topic/angle:
- Option 1 MUST explore: "${assignedAngles[0]}"
- Option 2 MUST explore: "${assignedAngles[1]}"
- Option 3 MUST explore: "${assignedAngles[2]}"
${rerollWarning}
${excludeInstruction}

OUTPUT RULES (MUST be valid JSON OBJECT):
{
  "titles": [
    {
      "title": "Extremely curiosity-inducing video title (max 60 chars)",
      "hook": "Sharp opening line for first 3-4 seconds (max 15 words)",
      "subTopic": "Short label of sub-topic (2-4 words)",
      "ctrscore": 96
    },
    {
      "title": "Second title about the second assigned topic",
      "hook": "Second opening line",
      "subTopic": "Second sub-topic label",
      "ctrscore": 93
    },
    {
      "title": "Third title about the third assigned topic",
      "hook": "Third opening line",
      "subTopic": "Third sub-topic label",
      "ctrscore": 90
    }
  ]
}

Quality Rules:
1. "title": Viral YouTube Shorts formula (contrasts, shocking numbers, curiosity gaps, piercing secrets).
2. "hook": Spoken opening line. Style: ${hookGaya}.
3. "subTopic": Concise label representing the angle.
4. "ctrscore": Estimated CTR potential 88-98.
5. ZERO REPETITION: All 3 titles must feel like 3 completely different YouTube videos!
Output ONLY JSON.`;
	} else {
		systemPrompt = `Kamu adalah spesialis judul konten YouTube Shorts viral Indonesia nomor 1.
Spesialisasi tema: ${themeLabel}

TUGAS:
Buat 3 pilihan judul YouTube Shorts yang SANGAT VIRAL, TINGGI CTR, dan BERBEDA TOTAL SATU SAMA LAIN.
Setiap opsi dari 3 judul WAJIB mengangkat topik / sudut pandang yang berbeda:
- Opsi 1 WAJIB membahas: "${assignedAngles[0]}"
- Opsi 2 WAJIB membahas: "${assignedAngles[1]}"
- Opsi 3 WAJIB membahas: "${assignedAngles[2]}"
${rerollWarning}
${excludeInstruction}

ATURAN OUTPUT (WAJIB JSON OBJECT VALID):
{
  "titles": [
    {
      "title": "Judul video yang sangat memicu rasa ingin tahu (max 60 karakter)",
      "hook": "Kalimat pembuka tajam 3-4 detik pertama (max 15 kata)",
      "subTopic": "Label singkat sub-topik (2-4 kata)",
      "ctrscore": 96
    },
    {
      "title": "Judul kedua tentang topik kedua yang ditugaskan",
      "hook": "Kalimat pembuka kedua",
      "subTopic": "Label sub-topik kedua",
      "ctrscore": 93
    },
    {
      "title": "Judul ketiga tentang topik ketiga yang ditugaskan",
      "hook": "Kalimat pembuka ketiga",
      "subTopic": "Label sub-topik ketiga",
      "ctrscore": 90
    }
  ]
}

Aturan Kualitas:
1. "title": Menggunakan formula viral YouTube Shorts (kontras mengejutkan, rahasia tersembunyi, pertanyaan provokatif, atau studi kasus ekstrem).
2. "hook": Kalimat pembuka narator yang bikin penonton freeze. Gaya: ${hookGaya}.
3. "subTopic": Label ringkas sudut pandang yang diangkat.
4. "ctrscore": Perkiraan potensi CTR 88-98.
5. TIDAK BOLEH MENGULANG TOPIK: Ketiga judul harus terasa seperti 3 video YouTube Shorts yang benar-benar berbeda topik pembahasannya!
Output HANYA JSON.`;
	}

	const userPrompt = isEn
		? `Theme: ${themeLabel}\nBase Context: ${customTopic || topic || themeLabel}\nRandom Seed: ${seed} (Roll #${rerollCount + 1})\n\nCreate 3 completely different, viral Shorts titles now following the assigned angles.`
		: `Tema: ${themeLabel}\nKonteks Dasar: ${customTopic || topic || themeLabel}\nRandom Seed: ${seed} (Acak ke-${rerollCount + 1})\n\nBuat 3 judul Shorts viral yang berbeda total sekarang sesuai sudut pandang yang ditugaskan.`;

	return { systemPrompt, userPrompt };
}

// ------------------------------------------------------------------
// DeepSeek API Call Helper
// ------------------------------------------------------------------
async function callDeepSeek(apiKey, systemPrompt, userPrompt, maxTokens = 2000, temperature = 0.85) {
	const response = await fetch('https://api.deepseek.com/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: 'deepseek-chat',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			temperature,
			max_tokens: maxTokens,
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`DeepSeek API error ${response.status}: ${errText.slice(0, 300)}`);
	}

	const data = await response.json();
	const content = data?.choices?.[0]?.message?.content || '';
	return content.trim();
}

// ------------------------------------------------------------------
// Main POST Handler
// ------------------------------------------------------------------
export async function POST({ request }) {
	try {
		const {
			action = 'generate-script', // 'generate-titles' | 'generate-script'
			theme = 'dark-psychology',
			topic,
			targetDuration = 35,
			apiKey,
			excludeTitles = [],
			seed,
			lang = 'id', // 'id' | 'en'
			isReroll = false,
			rerollCount = 0,
			customTopic = ''
		} = await request.json();

		if (!topic || !topic.trim()) {
			return json({ success: false, error: 'Topik wajib diisi.' }, { status: 400 });
		}

		const userKey = apiKey && !isExpiredKey(apiKey.trim()) ? apiKey.trim() : '';
		const defaultKey = !isExpiredKey(DEFAULT_DEEPSEEK_KEY) ? DEFAULT_DEEPSEEK_KEY : '';
		const effectiveApiKey = userKey || defaultKey;

		if (!effectiveApiKey) {
			return json(
				{ success: false, error: 'DeepSeek API Key belum diatur. Periksa file .env atau Settings.' },
				{ status: 400 }
			);
		}

		// --- Action: Generate 3 Title Options ---
		if (action === 'generate-titles') {
			const { systemPrompt, userPrompt } = buildTitlePrompt(theme, topic.trim(), {
				excludeTitles,
				seed,
				lang,
				isReroll,
				rerollCount,
				customTopic
			});
			const temp = isReroll ? 1.05 : 0.95;
			const rawContent = await callDeepSeek(effectiveApiKey, systemPrompt, userPrompt, 900, temp);

			let titles = [];
			try {
				const parsed = JSON.parse(rawContent);
				if (Array.isArray(parsed)) {
					titles = parsed;
				} else if (Array.isArray(parsed.titles)) {
					titles = parsed.titles;
				} else if (Array.isArray(parsed.options)) {
					titles = parsed.options;
				} else {
					const values = Object.values(parsed);
					if (values.some(v => v && typeof v === 'object' && v.title)) {
						titles = values.filter(v => v && typeof v === 'object' && v.title);
					} else {
						titles = [parsed];
					}
				}
			} catch {
				const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
				if (match) {
					try {
						const p = JSON.parse(match[1]);
						titles = Array.isArray(p) ? p : (p.titles || [p]);
					} catch {}
				}
			}

			if (!titles || titles.length === 0) {
				return json({ success: false, error: 'Gagal parse respons AI untuk judul. Coba lagi.' }, { status: 500 });
			}

			return json({ success: true, titles, theme, topic });
		}

		// --- Action: Generate Full Script ---
		if (action === 'generate-script') {
			const { systemPrompt, userPrompt } = buildShortsPrompt(theme, topic.trim(), Number(targetDuration), lang);
			const rawContent = await callDeepSeek(effectiveApiKey, systemPrompt, userPrompt, 2500);

			let scriptData = null;
			try {
				scriptData = JSON.parse(rawContent);
			} catch {
				// Try to extract JSON from markdown code block
				const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
				if (match) {
					try {
						scriptData = JSON.parse(match[1]);
					} catch {
						return json({ success: false, error: 'Gagal parse naskah dari AI. Coba lagi.' }, { status: 500 });
					}
				} else {
					return json({ success: false, error: 'Gagal parse naskah dari AI. Coba lagi.' }, { status: 500 });
				}
			}

			// Validate and normalize scenes
			if (!scriptData?.scenes || !Array.isArray(scriptData.scenes)) {
				return json({ success: false, error: 'Struktur naskah AI tidak valid (scenes tidak ditemukan).' }, { status: 500 });
			}

			const scenes = scriptData.scenes.map((s, i) => ({
				id: s.id || i + 1,
				duration: parseFloat(s.duration) || 4,
				spokenText: s.spokenText || s.spoken_text || '',
				visualDescription: s.visualDescription || s.visual_description || s.visual_concept || '',
				giphyQuery: s.giphyQuery || s.giphy_query || 'reaction',
				selectedClip: null,
				giphyResults: []
			}));

			const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

			return json({
				success: true,
				title: scriptData.title || topic,
				hook: scriptData.hook || scenes[0]?.spokenText || '',
				scenes,
				totalEstimatedDuration: Math.round(totalDuration),
				theme,
				topic
			});
		}

		return json({ success: false, error: `Action tidak dikenal: ${action}` }, { status: 400 });
	} catch (err) {
		console.error('[generate-shorts-script] Error:', err);
		return json({ success: false, error: err.message }, { status: 500 });
	}
}
