import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || 'sk-0802f45e1d4e41c8ae8d46396c97b746';

export async function POST({ request }) {
	try {
		const {
			topic,
			durationTarget = 'medium', // 'short' (2-3m) | 'medium' (5-8m) | 'long' (10-15m)
			tone = 'documentary', // 'documentary' | 'casual' | 'business' | 'mystery'
			hookStyle = 'curiosity_gap', // 'curiosity_gap' | 'high_stakes' | 'paradox' | 'mystery_investigative' | 'in_media_res' | 'provocative_question'
			customInstructions = '',
			apiKey
		} = await request.json();

		if (!topic || !topic.trim()) {
			return json({ success: false, error: 'Topik naskah wajib diisi' }, { status: 400 });
		}

		const effectiveApiKey = apiKey && apiKey.trim().length > 10 ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;

		// Word count and chapter configuration based on duration
		let wordCountGuide = 'antara 700 hingga 1.000 kata (durasi ~5-8 menit)';
		let chapterCountGuide = '3 bab terstruktur dengan eskalasi ketegangan dramatis';
		let maxTokens = 2500;

		if (durationTarget === 'short') {
			wordCountGuide = 'antara 300 hingga 450 kata (durasi ~2-3 menit)';
			chapterCountGuide = '2 bab padat dan bertensi tinggi';
			maxTokens = 1200;
		} else if (durationTarget === 'long') {
			wordCountGuide = 'antara 1.400 hingga 2.000 kata (durasi ~10-15 menit)';
			chapterCountGuide = '4 hingga 5 bab mendalam dengan subplot dan klimaks sinematik';
			maxTokens = 4000;
		}

		// Tone guidelines (default to relaxed conversational storytelling)
		let toneGuide =
			'Gaya storytelling santai & mengalir seperti lagi ngobrol langsung dengan teman dekat (luwes, seru, bersahabat tapi tetap bikin penasaran ala Ferry Irwandi, Hujan Tanda Tanya, atau Raditya Dika bercerita).';
		if (tone === 'casual' || tone === 'casual_edu') {
			toneGuide =
				'Gaya edukasi santai, cerdas, bersahabat, penuh analogi kehidupan sehari-hari yang mudah dicerna seperti channel Kok Bisa atau obrolan santai di tongkrongan.';
		} else if (tone === 'business' || tone === 'deep_thought') {
			toneGuide =
				'Gaya obrolan santai reflektif (deep talk), membongkar pola pikir keuangan dan realitas hidup tanpa menggurui, seperti ngobrol santai bareng mentor.';
		} else if (tone === 'mystery') {
			toneGuide =
				'Gaya cerita misteri & investigasi santai yang seru, bikin merinding dan penasaran ala obrolan konspirasi malam hari yang bikin melek.';
		} else if (tone === 'documentary') {
			toneGuide =
				'Gaya storytelling dokumenter santai dan mengalir, berbobot tapi tidak kaku, bahasa luwes dan bersahabat.';
		}

		// Viral Hook Engineering Guides (Conversational Storytelling Style)
		const HOOK_GUIDELINES = {
			curiosity_gap: `Buka kalimat pertama dengan "CURIOSITY GAP & PARADOKS SANTAI":
Bongkar satu hal yang selama ini dianggap wajar oleh banyak orang, lalu tunjukkan fakta sebaliknya yang bikin mikir dua kali. Buat penonton kaget dan mikir: "Hah, masa sih kayak gitu?".
Contoh gaya bahasa: "Pernah nggak kamu ngerasa, hampir semua hal yang diajarin ke kita soal uang itu sebenernya cuma jebakan rapi yang bikin kita muter-muter di tempat yang sama?"`,
			high_stakes: `Buka detik pertama dengan "HIGH STAKES & SITUASI KRITIS YANG DEKAT DENGAN KITA":
Gambarkan situasi darurat atau perubahan besar yang bakal langsung berdampak ke kehidupan penonton sehari-hari.
Contoh gaya bahasa: "Coba bayangin, dalam hitungan beberapa jam ke depan, ada satu keputusan di balik pintu tertutup yang bisa ngubah total nasib jutaan pekerjaan di dunia, termasuk kerjaan yang lagi kamu lakuin hari ini."`,
			mystery_investigative: `Buka detik pertama dengan "MISTERI & ARSIP BIKIN PENASARAN":
Mulai dari satu bukti janggal, kejadian aneh, atau file rahasia yang baru kebuka.
Contoh gaya bahasa: "Selama puluhan tahun, dokumen rahasia di bawah fasilitas Antarktika ini ditutup rapat-rapat. Sampai akhirnya, ada satu berkas setebal tiga ratus halaman yang bocor ke internet dan bikin geger banyak orang."`,
			in_media_res: `Buka detik pertama dengan "IN-MEDIA-RES (LANGSUNG KE DETIK PALING TEGANG)":
Jangan mulai dari intro lambat. Lempar penonton langsung ke momen paling genting seolah mereka lagi ada di tempat kejadian.
Contoh gaya bahasa: "Layar monitor di ruang kendali mendadak nyala merah kedap-kedip waktu anomali itu nembus atmosfer. Dan di detik itu juga, mereka sadar kalau mereka udah terlambat."`,
			provocative_question: `Buka detik pertama dengan "PERTANYAAN MENUSUK YANG RELATABLE":
Ajukan pertanyaan yang ngena banget ke keseharian atau kegelisahan yang dirasain penonton.
Contoh gaya bahasa: "Pernah nggak kepikiran, kamu banting tulang delapan jam sehari buat bikin orang lain makin kaya, tapi kamu sendiri nggak pernah punya waktu buat nikmatin hidupmu?"`
		};

		const chosenHookGuide = HOOK_GUIDELINES[hookStyle] || HOOK_GUIDELINES.curiosity_gap;

		const systemPrompt = `Anda adalah Top-Tier YouTube Storyteller & Scriptwriter kelas dunia (spesialis konten YouTube bertema menarik dengan gaya bercerita santai dan retensi penonton tinggi).
Tugas Anda adalah menulis naskah video YouTube LENGKAP dalam BAHASA INDONESIA SANTAI & MENGALIR yang langsung siap dibacakan oleh narator seperti orang yang sedang bercerita langsung.

PANDUAN UTAMA GAYA BAHASA (SANTAI SEPERTI LAGI BERCERITA / NGOBROL):
- NADA BICARA (TONE): Santai, akrab, luwes, dan mengalir enak didengar—seperti seorang teman pencerita ulung yang lagi cerita seru di warung kopi atau ruang santai.
- KATA GANTI WAJIB: Selalu gunakan kata ganti "kamu" atau "kita" saat menyapa penonton.
- DILARANG MENGGUNAKAN KATA "Anda" (karena terkesan sangat kaku, formal, dan berjarak).
- HINDARI TOTAL BAHASA MAKALAH / SKRIPSI / BIROKRASI:
  Dilarang keras memakai diksi formal kaku seperti: "pada hakikatnya", "merupakan sebuah", "kendati demikian", "adapun", "sebagaimana mestinya", "berdasarkan kajian", "entitas", "terdapat berbagai macam faktor".
- GUNAKAN KATA PENGHUBUNG ALAMI PERCAKAPAN:
  Gunakan transisi khas orang bercerita lisan: "Coba bayangin...", "Pernah nggak sih kamu mikir...", "Nah, masalahnya gini...", "Gini ceritanya...", "Dan yang bikin kaget...", "Jujur aja...", "Tapi tunggu dulu...", "Kebayang nggak?", "Nah, mulai dari sini...".
- KALIMAT ENAK DIUCAPKAN: Buat kalimat mengalir alami, ritme bicara luwes, tidak berbelit-belit, dan mudah dicerna telinga.

STRUKTUR & RAHASIA RETENSI VIRAL YOUTUBE:
1. ATURAN EMAS 10 DETIK PERTAMA (THE SACRED HOOK - ANTI-SKIP):
   ${chosenHookGuide}
   - DILARANG KERAS MEMULAI DENGAN BASA-BASI KLISE!
     JANGAN PERNAH gunakan kata-kata: "Halo teman-teman", "Selamat datang kembali di channel kami", "Pada video kali ini kita akan membahas", "Semoga kabar kalian baik", atau definisi ensiklopedia yang membosankan!
   - Kalimat pertama HARUS menjadi "PATTERN INTERRUPT" yang menghentikan jari penonton seketika dari tombol swipe/skip.

2. CURIOSITY ANCHOR & OPEN LOOP:
   - Di bagian akhir Bab 1, sisipkan pertanyaan penasaran atau hal menggantung yang jawabannya baru dibongkar di bab akhir.
   - Buat penonton merasa: "Wah, kalau gua berhenti nonton sekarang, gua bakal kepikiran terus."

3. ESKALASI KETEGANGAN ANTAR BAB:
   - Bagilah naskah ke dalam ${chapterCountGuide}.
   - Setiap bab WAJIB diawali dengan format tag header:
     [Bab N: Judul Bab Yang Asyik | Subtitle santai tentang isi bab ini]
   - Bab 1: Titik Awal & Keanehan (Pukulan pembuka & paradoks yang bikin penasaran).
   - Bab 2: Fakta di Balik Layar (Membongkar apa yang sebenernya terjadi).
   - Bab 3 / Berikutnya: Eskalasi & Titik Balik (Cerita makin seru, plot twist atau perbandingan nyata yang membuka mata).
   - Bab Terakhir: Pembelajaran / Kesimpulan yang Ngena (Jawaban pamungkas yang bikin penonton manggut-manggut dan tergerak berkomentar).

4. GAYA BAHASA SPESIFIK PILIHAN:
   - ${toneGuide}
   - Target panjang naskah: ${wordCountGuide}.
${customInstructions ? `5. Instruksi Khusus Tambahan dari Kreator: ${customInstructions}` : ''}

ATURAN TEKNIS VOICEOVER:
- Tulis HANYA narasi yang akan diucapkan narator.
- JANGAN sertakan instruksi visual seperti "[Visual: drone]", "(Tampilkan tabel)", atau "*Musik melambat*".
- JANGAN gunakan format markdown tebal (**kata**) atau poin-poin/bullet list di dalam kalimat narasi. Tulis dalam paragraf naratif utuh yang mengalir santai.`;

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
