import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { robustJsonParse } from '$lib/utils/jsonParser.js';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || '';

export async function POST({ request }) {
	try {
		const {
			fullScriptText = '',
			lastSceneNumber = 10,
			lastNarration = '',
			batchSize = 10,
			targetTotalScenes = 85,
			characterDescription = '',
			style2D = 'Stickman 2D',
			apiKey
		} = await request.json();

		const effectiveKey = (apiKey && apiKey.trim()) || DEFAULT_DEEPSEEK_KEY;
		if (!effectiveKey) {
			return json({
				success: false,
				error: 'DeepSeek API Key belum diatur di server atau settings.'
			}, { status: 400 });
		}

		const nextStart = Number(lastSceneNumber) + 1;
		const nextEnd = nextStart + Number(batchSize) - 1;

		const systemPrompt = `Lo adalah Narrative Storyboard Editor kelas dunia untuk YouTube Long-Form (ala Ferry Irwandi, Dan Koe, Satu Persen).
Tugas lo: Mengambil bagian cerita lanjutan dari Master Script dan memecahnya ke dalam ${batchSize} scene berikutnya (Scene ${nextStart} sampai Scene ${nextEnd}).

GAYA BAHASA NASKAH YOUTUBE BIASA:
- Narasi adalah kalimat voiceover langsung ke penonton ("kamu" dan "kita").
- Padat, mengalir, tanpa kata kaku, tanpa meta-text, tanpa teori huruf atau konsep aneh.
- Narasi menyambung mulus dari narasi scene sebelumnya.

TARGET PANJANG VIDEO:
- Video ini berdurasi 7-10 MENIT dengan target MINIMAL 80-100 SCENE (~5-7 detik per scene).
- Saat ini lo baru berada di Scene ${nextStart}–${nextEnd} dari target total ~${targetTotalScenes} scene.
- JANGAN PERNAH menamatkan cerita jika nomor scene belum mencapai minimal 80 scene!
- Jika naskah tampak ringkas, PERLUAS DAN ELABORASI: tambahkan analogi visual 2D, studi kasus nyata, dinamika emosi karakter stickman, konflik pemikiran, dan pertanyaan retoris yang menggugah agar cerita tetap kaya dan panjang.
- Field "prompt" SENGAJA DIKOSONGKAN ("") karena prompt baru dibuat saat user mengklik tombol.

FORMAT KELUARAN HARUS JSON MURNI:
{
  "scenes": [
    {
      "sceneNumber": ${nextStart},
      "chapter": "Nama Babak / Sub-topik",
      "narration": "Teks narasi potongan scene ini yang menyambung alur cerita sebelumnya (12-18 kata).",
      "visualAction": "Deskripsi singkat aksi karakter 2D/stickman dalam scene ini.",
      "estimatedDurationSec": 6,
      "prompt": ""
    }
  ],
  "isStoryFinished": false
}
*Catatan: "isStoryFinished" HANYA boleh bernilai true jika nomor scene SUDAH >= 80 DAN cerita sudah mencapai babak kesimpulan akhir.`;

		const userPrompt = `MASTER SCRIPT KESELURUHAN:
"""
${fullScriptText}
"""

KONTEKS SCENE SEBELUMNYA (Scene ${lastSceneNumber}):
"${lastNarration || 'Awal cerita'}"

TARGET SAAT INI: Hasilkan Scene ${nextStart} hingga Scene ${nextEnd} (dari total ~${targetTotalScenes} scene).
KARAKTER 2D: ${characterDescription}
GAYA VISUAL: ${style2D}

Tuliskan Scene ${nextStart} sampai ${nextEnd} secara mengalir dan bersambung kuat.`;

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
				temperature: 0.8,
				max_tokens: 3500,
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			console.error('DeepSeek API error in next-scenes:', errText);
			return json({
				success: false,
				error: `DeepSeek API error: ${response.status} - ${errText}`
			}, { status: response.status });
		}

		const data = await response.json();
		const rawContent = data.choices?.[0]?.message?.content;
		const parsed = robustJsonParse(rawContent);

		if (!parsed || !parsed.scenes || !Array.isArray(parsed.scenes)) {
			console.error('JSON recovery failed in next-scenes:', rawContent);
			return json({
				success: false,
				error: 'Gagal memproses scene lanjutan dari AI. Silakan coba klik tombol generate kembali.'
			}, { status: 500 });
		}

		const sanitizedScenes = parsed.scenes.map((s, idx) => ({
			sceneNumber: s.sceneNumber || (nextStart + idx),
			chapter: s.chapter || `Bagian ${Math.floor((nextStart + idx) / 10) + 1}`,
			narration: s.narration || '',
			visualAction: s.visualAction || 'Karakter stickman bereaksi terhadap narasi',
			estimatedDurationSec: s.estimatedDurationSec || 6,
			prompt: ''
		}));

		// Only allow story to be marked as finished if scenes have reached at least 80 or targetTotalScenes
		const isStoryFinished = !!parsed.isStoryFinished && nextEnd >= Math.min(80, Number(targetTotalScenes || 80));

		return json({
			success: true,
			scenes: sanitizedScenes,
			isStoryFinished
		});

	} catch (/** @type {any} */ error) {
		console.error('Unexpected error in next-scenes:', error);
		return json({
			success: false,
			error: error?.message || 'Terjadi kesalahan sistem saat mengambil scene lanjutan.'
		}, { status: 500 });
	}
}
