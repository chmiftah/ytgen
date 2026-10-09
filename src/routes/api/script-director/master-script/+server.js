import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { robustJsonParse } from '$lib/utils/jsonParser.js';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || '';

export async function POST({ request }) {
	try {
		const {
			title = '',
			topic = '',
			outline = [],
			hookAngle = '',
			characterDescription = '',
			style2D = '2D Stickman',
			apiKey
		} = await request.json();

		const effectiveKey = (apiKey && apiKey.trim()) || DEFAULT_DEEPSEEK_KEY;
		if (!effectiveKey) {
			return json({
				success: false,
				error: 'DeepSeek API Key belum diatur di server atau settings.'
			}, { status: 400 });
		}

		const systemPrompt = `Lo adalah Master YouTube Narrative Scriptwriter kelas dunia (ala Ferry Irwandi, Dan Koe, Satu Persen).
Tugas lo: Menulis NASKAH VIDEO BIASA BERSAMBUNG berdurasi 7-10 MENIT (~1.200 - 1.500 KATA) untuk video YouTube 2D/Stickman, DAN memecahkan BATCH PERTAMA (Scene 1 s/d Scene 10).

PRINSIP PENULISAN:
1. GAYA BAHASA NASKAH YOUTUBE BIASA: Tulisan voiceover murni yang langsung berbicara akrab ke penonton ("kamu" dan "kita"). Mengalir alami, menusuk, seru didengar, tanpa kata-kata kaku, tanpa meta-text, tanpa tebak-tebakan huruf atau teori membingungkan.
2. CONTOH NARASI YANG BAGUS:
   - "Pernah nggak kamu ngerasa, makin keras kamu mencoba, hasilnya malah jalan di tempat?"
   - "Banyak dari kita mengira kuncinya ada di motivasi, padahal sebenarnya sistemnya yang keliru."
3. CERITA BERSAMBUNG: fullScriptText harus runtut dari hook detik pertama, pembahasan akar masalah, studi kasus/fakta menarik, solusi praktis, hingga konklusi yang berkesan.
4. SCENES (BATCH PERTAMA): Pecahkan bagian pembuka cerita ke dalam Scene 1 sampai Scene 10 (~12-18 kata per scene, durasi 5-7 detik).
5. Field "prompt" SENGAJA DIKOSONGKAN ("") karena prompt visual baru dibuat saat user mengklik generate.

FORMAT KELUARAN HARUS JSON MURNI:
{
  "title": "${title || 'Judul Naskah'}",
  "totalEstimatedWords": 1350,
  "estimatedDurationMinutes": "8.5 Menit",
  "totalTargetScenes": 88,
  "characterDescription": "${characterDescription || 'A minimalist 2D black stickman with clean vector line art and expressive pose'}",
  "style2D": "${style2D || '2D Minimalist Vector'}",
  "fullScriptText": "Seluruh teks naskah lengkap dari awal sampai akhir yang mengalir dan bersambung layaknya naskah YouTube profesional.",
  "scenes": [
    {
      "sceneNumber": 1,
      "chapter": "Hook Pembuka",
      "narration": "Teks narasi suara yang dibacakan langsung ke penonton (12-18 kata).",
      "visualAction": "Aksi visual karakter stickman 2D di layar.",
      "estimatedDurationSec": 6,
      "prompt": ""
    }
  ]
}`;

		const userPrompt = `TOPIK: ${topic || title}
JUDUL: ${title}
ANGLE / HOOK: ${hookAngle}
OUTLINE BABAK: ${JSON.stringify(outline)}
DESKRIPSI KARAKTER 2D: ${characterDescription}
GAYA VISUAL: ${style2D}

Tuliskan naskah master bersambung (fullScriptText) dan pecahkan Scene 1 sampai Scene 10 di array scenes.`;

		const response = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${effectiveKey}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				temperature: 0.85,
				max_tokens: 4500,
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			console.error('DeepSeek API error in master-script:', errText);
			return json({
				success: false,
				error: `DeepSeek API error: ${response.status} - ${errText}`
			}, { status: response.status });
		}

		const data = await response.json();
		const rawContent = data.choices?.[0]?.message?.content;
		const parsed = robustJsonParse(rawContent);

		if (!parsed || !parsed.scenes || !Array.isArray(parsed.scenes)) {
			console.error('JSON recovery failed in master-script:', rawContent);
			return json({
				success: false,
				error: 'Gagal memproses format naskah dari AI. Silakan coba kembali.'
			}, { status: 500 });
		}

		// Ensure all scenes have prompt = '' initially, and valid sceneNumbers
		parsed.scenes = parsed.scenes.map((s, idx) => ({
			sceneNumber: s.sceneNumber || (idx + 1),
			chapter: s.chapter || `Bagian ${Math.floor(idx / 5) + 1}`,
			narration: s.narration || '',
			visualAction: s.visualAction || 'Karakter stickman bereaksi terhadap narasi',
			estimatedDurationSec: s.estimatedDurationSec || 6,
			prompt: '' // empty until user clicks generate prompt
		}));

		// Default total target scenes if omitted
		if (!parsed.totalTargetScenes) {
			parsed.totalTargetScenes = Math.max(80, parsed.scenes.length * 8);
		}

		return json({
			success: true,
			data: parsed
		});

	} catch (/** @type {any} */ error) {
		console.error('Unexpected error in master-script:', error);
		return json({
			success: false,
			error: error?.message || 'Terjadi kesalahan sistem saat membuat naskah utuh.'
		}, { status: 500 });
	}
}
