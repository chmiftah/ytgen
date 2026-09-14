import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || 'sk-0802f45e1d4e41c8ae8d46396c97b746';

export async function POST({ request }) {
	try {
		const {
			topic,
			durationTarget = 'medium', // 'short' (2-3m) | 'medium' (5-8m) | 'long' (10-15m)
			tone = 'documentary', // 'documentary' | 'casual' | 'business' | 'mystery'
			customInstructions = '',
			apiKey
		} = await request.json();

		if (!topic || !topic.trim()) {
			return json({ success: false, error: 'Topik naskah wajib diisi' }, { status: 400 });
		}

		const effectiveApiKey = apiKey && apiKey.trim().length > 10 ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;

		// Word count and chapter configuration based on duration
		let wordCountGuide = 'antara 700 hingga 1.000 kata (durasi ~5-8 menit)';
		let chapterCountGuide = '3 bab terstruktur';
		let maxTokens = 2500;

		if (durationTarget === 'short') {
			wordCountGuide = 'antara 300 hingga 450 kata (durasi ~2-3 menit)';
			chapterCountGuide = '2 bab ringkas';
			maxTokens = 1200;
		} else if (durationTarget === 'long') {
			wordCountGuide = 'antara 1.400 hingga 2.000 kata (durasi ~10-15 menit)';
			chapterCountGuide = '4 hingga 5 bab mendalam';
			maxTokens = 4000;
		}

		// Tone guidelines
		let toneGuide =
			'Gaya dokumenter sinematik yang mendalam, berwibawa, penuh penceritaan memikat seperti channel Vox, Lemmino, atau DW Documentary.';
		if (tone === 'casual') {
			toneGuide =
				'Gaya edukasi santai, cerdas, bersahabat, penuh analogi kehidupan sehari-hari seperti channel Kok Bisa atau Kurzgesagt versi Indonesia.';
		} else if (tone === 'business') {
			toneGuide =
				'Gaya motivasi, bisnis, dan pola pikir strategis yang tegas, lugas, berbasis data dan studi kasus nyata.';
		} else if (tone === 'mystery') {
			toneGuide =
				'Gaya investigasi misteri yang memancing rasa penasaran tinggi, atmosferik, penuh pertanyaan menggantung dan kejutan naratif.';
		}

		const systemPrompt = `Anda adalah Scriptwriter Profesional kelas dunia khusus konten YouTube Long-Form & Dokumenter.
Tugas Anda adalah menulis naskah video YouTube lengkap dalam BAHASA INDONESIA yang memukau, memiliki retensi penonton sangat tinggi (high-retention), dan langsung siap dibacakan oleh narator/voiceover.

PANDUAN STRUKTUR WAJIB:
1. Bagilah seluruh naskah ke dalam ${chapterCountGuide}.
2. Setiap awal bab HARUS diawali dengan tag header khusus berformat:
   [Bab N: Judul Bab Yang Kuat & Menarik | Subtitle penjelasan intisari bab]
   Contoh:
   [Bab 1: Fajar Kecerdasan Baru | Ledakan teknologi yang tak pernah kita duga sebelumnya]
   [Bab 2: Dilema Terbesar Manusia | Antara lonjakan peradaban atau ancaman eksistensial]
3. Hook 3 Detik Pertama: Pada kalimat pertama Bab 1, langsung buka dengan pernyataan mengejutkan, paradoks, atau fakta kontras yang memancing rasa penasaran penonton seketika tanpa basa-basi klise.
4. Target Panjang: Tulis naskah lengkap dengan panjang ${wordCountGuide}.
5. Tone: ${toneGuide}
${customInstructions ? `6. Instruksi Tambahan Khusus dari Pengguna: ${customInstructions}` : ''}

ATURAN KRUSIAL UNTUK VOICEOVER:
- Tulis HANYA kata-kata yang akan dibacakan narator.
- JANGAN menyertakan anotasi visual seperti "(Tampilkan grafik...)", "[Visual: drone...]", atau "*Musik dramatis*".
- JANGAN gunakan format markdown tebal (**kata**), poin-poin (bullet points), atau nomor daftar di dalam kalimat narasi.
- Tulis dalam paragraf naratif yang mengalir alami dan enak didengar ketika disuarakan.`;

		// Request streaming completion from DeepSeek
		const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${effectiveApiKey}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: [
					{ role: 'system', content: systemPrompt },
					{
						role: 'user',
						content: `Tolong tuliskan naskah YouTube lengkap tentang topik berikut:\n"${topic.trim()}".`
					}
				],
				temperature: 0.7,
				max_tokens: maxTokens,
				stream: true
			})
		});

		if (!deepseekResponse.ok) {
			const errText = await deepseekResponse.text();
			console.warn('DeepSeek script generator error:', errText);
			return json(
				{ success: false, error: `DeepSeek API (${deepseekResponse.status}): ${errText}` },
				{ status: 500 }
			);
		}

		// Stream tokens back to client via SSE
		const encoder = new TextEncoder();
		const decoder = new TextDecoder();
		let reader = deepseekResponse.body.getReader();

		const stream = new ReadableStream({
			async start(controller) {
				let buffer = '';
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split('\n');
						buffer = lines.pop() ?? '';

						for (const line of lines) {
							const trimmed = line.trim();
							if (!trimmed || !trimmed.startsWith('data:')) continue;
							if (trimmed === 'data: [DONE]') {
								controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
								controller.close();
								return;
							}

							try {
								const parsed = JSON.parse(trimmed.slice(5).trim());
								const delta = parsed.choices?.[0]?.delta?.content;
								if (delta) {
									controller.enqueue(
										encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
									);
								}
							} catch (e) {
								// skip invalid JSON chunks
							}
						}
					}
					controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
					controller.close();
				} catch (err) {
					console.error('Stream processing error:', err);
					controller.error(err);
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (error) {
		console.error('Error in /api/generate-script:', error);
		return json({ success: false, error: error.message }, { status: 500 });
	}
}
