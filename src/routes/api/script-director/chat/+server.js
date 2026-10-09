import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || '';

export async function POST({ request }) {
	try {
		const {
			messages = [],
			topic = '',
			style2D = 'stickman_expressive',
			characterAnchor = '',
			apiKey
		} = await request.json();

		const effectiveKey = (apiKey && apiKey.trim()) || DEFAULT_DEEPSEEK_KEY;
		if (!effectiveKey) {
			return json({
				success: false,
				error: 'DeepSeek API Key belum diatur di server atau settings.'
			}, { status: 400 });
		}

		const systemPrompt = `Lo adalah Creative Director YouTube kelas dunia (gaya storytelling ala Ferry Irwandi, Satu Persen, Ali Abdaal, Dan Koe).

PRINSIP UTAMA:
1. TO THE POINT: Jawab dengan padat, santai, bersahabat, maksimal 2-3 kalimat ringkas. Jangan bertele-tele dan jangan membingungkan.
2. FOKUS KONTEN NYATA: Bahas ide konten YouTube edukasi, psikologi, keuangan, produktivitas, sains, atau studi kasus nyata yang menarik dan mudah dinikmati penonton.
3. JIKA USER MEMBERI TOPIK:
   - Langsung tentukan Judul yang menarik dan Hook pembuka yang kuat.
   - Buat 5 babak alur cerita yang logis dan runtut.
   - Set "isReadyForMasterScript": true agar naskah bisa langsung dieksekusi.
4. JIKA INPUT USER BELUM JELAS:
   - Tanyakan dengan ramah topik apa yang ingin diangkat, dan berikan opsi topik menarik.

OUTPUT WAJIB BERUPA JSON VALID:
{
  "reply": "Respon singkat, ramah, dan langsung to-the-point (maksimal 2 kalimat).",
  "extractedConfig": {
    "suggestedTitle": "Judul video yang jelas dan menarik untuk YouTube",
    "hookAngle": "Keresahan nyata penonton di 30 detik pertama",
    "style2D": "Stickman Minimalis Sinematik",
    "characterDescription": "A minimalist 2D black stickman with bold clean lines, expressive eyebrows and hands, high contrast flat vector style",
    "outline": [
      "Bab 1: Keresahan awal yang dialami penonton",
      "Bab 2: Kesalahan umum yang jarang disadari",
      "Bab 3: Fakta dan akar masalah sesungguhnya",
      "Bab 4: Solusi praktis langkah demi langkah",
      "Bab 5: Kesimpulan dan pesan penutup yang membekas"
    ],
    "isReadyForMasterScript": true
  },
  "quickSuggestions": [
    "Langsung eksekusi naskah sekarang",
    "Fokus ke sudut pandang psikologi",
    "Fokus ke tips praktis sehari-hari"
  ]
};`;

		// Build conversation history
		const apiMessages = [
			{ role: 'system', content: systemPrompt }
		];

		if (messages && messages.length > 0) {
			for (const m of messages) {
				apiMessages.push({
					role: m.role === 'user' ? 'user' : 'assistant',
					content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
				});
			}
		} else if (topic) {
			apiMessages.push({
				role: 'user',
				content: `Halo Creative Director! Hari ini gue pengen bikin naskah video YouTube 7-10 menit dengan topik: "${topic}". Gaya visual yang gue mau adalah 2D konsisten (stickman/karakter 2D). Ayo bedah angle dan alur ceritanya!`
			});
		}

		const response = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${effectiveKey}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: apiMessages,
				temperature: 0.9,
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			console.error('DeepSeek API error in script-director/chat:', errText);
			return json({
				success: false,
				error: `DeepSeek API error: ${response.status} - ${errText}`
			}, { status: response.status });
		}

		const data = await response.json();
		const rawContent = data.choices?.[0]?.message?.content;
		let parsed = null;

		try {
			parsed = JSON.parse(rawContent);
		} catch (err) {
			console.warn('Failed to parse JSON from AI chat:', rawContent);
			parsed = {
				reply: rawContent || 'Ada sedikit kendala parsing respons AI. Silakan kirim pesan lanjutan.',
				extractedConfig: {
					suggestedTitle: topic || 'Ide Cerita 2D Stickman',
					hookAngle: 'Curiosity gap',
					style2D: 'Stickman Minimalis',
					characterDescription: 'A minimalist 2D black stickman with bold lines and expressive gestures',
					outline: ['Bab 1: Hook', 'Bab 2: Konflik', 'Bab 3: Solusi'],
					isReadyForMasterScript: false
				},
				quickSuggestions: ['Lanjutkan konsep ini', 'Ubah sudut pandang', 'Mulai buat naskah utuh']
			};
		}

		return json({
			success: true,
			data: parsed
		});

	} catch (/** @type {any} */ error) {
		console.error('Unexpected error in script-director/chat:', error);
		return json({
			success: false,
			error: error?.message || 'Terjadi kesalahan pada server saat diskusi ide naskah.'
		}, { status: 500 });
	}
}
