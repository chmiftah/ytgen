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
		systemPersona:
			'Kamu adalah penulis konten psikologi gelap viral Indonesia. Spesialisasimu: dark psychology, manipulasi, gaslighting, silent treatment, social engineering, cara membaca orang. Gaya: tegas, sedikit sinis, pengetahuan dalam, bikin penonton merasa mendapatkan wawasan eksklusif yang tidak banyak orang tahu.',
		hookStyle: 'pertanyaan provokatif atau pernyataan kontroversial',
		exampleTopics: ['gaslighting', 'love bombing', 'trik manipulasi', 'silent treatment', 'dark triad', 'cara membaca pikiran']
	},
	'fakta-unik': {
		label: 'Fakta Unik & Mind-Blowing',
		systemPersona:
			'Kamu adalah penulis konten fakta ilmiah dan sains viral Indonesia. Spesialisasimu: fakta kontra-intuitif, paradoks ilmiah, penemuan yang mengubah paradigma. Gaya: antusias namun berbobot, pengetahuan luas, bikin penonton tercengang dan ingin share ke teman.',
		hookStyle: 'fakta mengejutkan yang berlawanan dengan asumsi umum',
		exampleTopics: ['fenomena sains aneh', 'misteri otak', 'paradoks fisika', 'hewan ekstrem', 'fakta sejarah mengejutkan']
	},
	'psikologi': {
		label: 'Psikologi Populer & Hubungan',
		systemPersona:
			'Kamu adalah penulis konten psikologi hubungan dan kesehatan mental viral Indonesia. Spesialisasimu: overthinking, anxiety, pola hubungan toxic, bahasa cinta, trauma healing. Gaya: empatik, relatable, terasa seperti teman yang paham dan memberikan insight berharga.',
		hookStyle: 'pertanyaan yang langsung nyentuh pengalaman sehari-hari penonton',
		exampleTopics: ['overthinking', 'attachment style', 'self-esteem', 'trauma bonding', 'people pleasing', 'bahasa cinta']
	},
	stoikisme: {
		label: 'Stoikisme & Mindset',
		systemPersona:
			'Kamu adalah penulis konten filosofi stoikisme dan pengembangan diri viral Indonesia. Spesialisasimu: ajaran Marcus Aurelius, Epictetus, Seneca, dan aplikasinya di kehidupan modern. Gaya: tenang, berbobot, kebijaksanaan kuno yang terasa relevan hari ini.',
		hookStyle: 'kutipan atau prinsip filosofis yang terasa bertentangan dengan cara pikir modern',
		exampleTopics: ['Marcus Aurelius', 'kontrol diri', 'memento mori', 'amor fati', 'ketenangan batin', 'prinsip stoikisme']
	},
	misteri: {
		label: 'Misteri Sains & Sejarah',
		systemPersona:
			'Kamu adalah penulis konten misteri dan investigasi viral Indonesia. Spesialisasimu: cold case, anomali sains, teori konspirasi masuk akal, sejarah yang tersembunyi. Gaya: misterius, investigatif, membangun ketegangan secara bertahap seperti detektif.',
		hookStyle: 'pertanyaan misterius yang belum terjawab atau fakta yang disembunyikan',
		exampleTopics: ['misteri belum terpecahkan', 'anomali sejarah', 'eksperimen rahasia', 'fenomena paranormal ilmiah', 'teori sains kontroversial']
	},
	custom: {
		label: 'Topik Kustom',
		systemPersona:
			'Kamu adalah penulis konten YouTube Shorts viral Indonesia yang berpengalaman. Spesialisasimu: membuat konten pendek yang memiliki pacing cepat, hook kuat, dan informasi padat namun mudah dicerna penonton.',
		hookStyle: 'hook paling kuat yang sesuai topik',
		exampleTopics: []
	}
};

// ------------------------------------------------------------------
// Script generation prompt builder
// ------------------------------------------------------------------
function buildShortsPrompt(theme, topic, targetDurationSec = 35) {
	const def = THEME_DEFINITIONS[theme] || THEME_DEFINITIONS['custom'];
	const wordTarget = Math.round((targetDurationSec / 60) * 140); // ~140 kata/menit kecepatan Shorts

	const systemPrompt = `Kamu adalah scriptwriter konten YouTube Shorts viral terbaik Indonesia.

${def.systemPersona}

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
2. "hook": Kalimat pertama pembuka (3-4 detik pertama). Gunakan gaya: ${def.hookStyle}. HARUS membuat penonton freeze dan tidak mau scroll.
3. "scenes": Array 6-10 adegan. Setiap adegan memiliki:
   - "id": Nomor urut
   - "duration": Durasi dalam detik (2.5 - 5.0). Sesuaikan dengan panjang teks.
   - "spokenText": Teks narasi yang diucapkan narator. Bahasa Indonesia conversational. PADAT, tidak bertele-tele. Satu atau dua kalimat per adegan.
   - "visualDescription": Deskripsi singkat apa yang ingin ditampilkan (Bahasa Indonesia)
   - "giphyQuery": 2-4 kata bahasa INGGRIS yang tepat untuk mencari klip/GIF di GIPHY yang menggambarkan emosi/visual adegan ini. HARUS dalam bahasa Inggris. Contoh: "mind blown reaction", "evil smirk dark", "detective thinking mystery", "shocked surprised face".
4. Adegan pertama HARUS berisi "hook" yang sangat kuat. Durasi max 3 detik.
5. Adegan terakhir HARUS memiliki kalimat penutup loop / CTA untuk komentar.
6. Total durasi semua adegan dijumlahkan harus sekitar ${targetDurationSec} detik (±5 detik).
7. Total spokenText seluruh adegan sekitar ${wordTarget} kata (${Math.round(wordTarget * 0.8)}-${Math.round(wordTarget * 1.2)} kata).
8. JANGAN gunakan bahasa formal. Gunakan bahasa percakapan sehari-hari yang enak didengar.
9. JANGAN gunakan kata "Anda". Gunakan "kamu", "kita", atau kalimat impersonal.
10. Output HANYA JSON. Tidak ada markdown, tidak ada penjelasan, tidak ada kode fence.`;

	const userPrompt = `Tema: ${def.label}
Topik Spesifik: ${topic}
Target Durasi: ${targetDurationSec} detik

Buat naskah YouTube Shorts yang sangat viral dengan hook yang membuat penonton tidak bisa berhenti menonton.
Ingat: giphyQuery HARUS dalam bahasa Inggris dan menggambarkan emosi/visual yang pas.`;

	return { systemPrompt, userPrompt };
}

// ------------------------------------------------------------------
// Title generation prompt
// ------------------------------------------------------------------
function buildTitlePrompt(theme, topic) {
	const def = THEME_DEFINITIONS[theme] || THEME_DEFINITIONS['custom'];

	const systemPrompt = `Kamu adalah spesialis judul konten YouTube Shorts viral Indonesia.
Spesialisasi tema: ${def.label}

Buat 3 pilihan judul YouTube Shorts yang viral.
WAJIB output JSON array, contoh:
[
  {"title": "...", "hook": "...", "ctrscore": 95},
  {"title": "...", "hook": "...", "ctrscore": 92},
  {"title": "...", "hook": "...", "ctrscore": 88}
]

Dimana:
- "title": Judul video (max 60 karakter, memicu rasa ingin tahu)
- "hook": Preview kalimat pembuka pertama (max 15 kata) yang akan ditampilkan sebagai tagline
- "ctrscore": Estimasi CTR score 1-100

Gaya hook untuk tema ini: ${def.hookStyle}
Output HANYA JSON array. Tidak ada teks lain.`;

	return {
		systemPrompt,
		userPrompt: `Tema: ${def.label}\nTopik: ${topic}\n\nBuat 3 pilihan judul viral.`
	};
}

// ------------------------------------------------------------------
// DeepSeek API Call Helper
// ------------------------------------------------------------------
async function callDeepSeek(apiKey, systemPrompt, userPrompt, maxTokens = 2000) {
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
			temperature: 0.8,
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
			apiKey
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
			const { systemPrompt, userPrompt } = buildTitlePrompt(theme, topic.trim());
			const rawContent = await callDeepSeek(effectiveApiKey, systemPrompt, userPrompt, 800);

			let titles = [];
			try {
				const parsed = JSON.parse(rawContent);
				titles = Array.isArray(parsed) ? parsed : (parsed.titles || [parsed]);
			} catch {
				return json({ success: false, error: 'Gagal parse respons AI untuk judul.' }, { status: 500 });
			}

			return json({ success: true, titles, theme, topic });
		}

		// --- Action: Generate Full Script ---
		if (action === 'generate-script') {
			const { systemPrompt, userPrompt } = buildShortsPrompt(theme, topic.trim(), Number(targetDuration));
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
