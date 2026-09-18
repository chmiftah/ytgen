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

		// Duration configuration & token budgets (130-155 words per minute)
		let durationText = '5–10 Menit';
		let wordCountGuide = '1.000–1.400 kata (~5-10 menit)';
		let chapterCountGuide = '3 hingga 5 bab yang mengalir dinamis';
		let maxTokens = 3500;

		if (durationTarget === 'short') {
			durationText = '3–5 Menit';
			wordCountGuide = '450–750 kata (~3-5 menit)';
			chapterCountGuide = '2 hingga 3 bab padat dan fokus';
			maxTokens = 2000;
		} else if (durationTarget === 'medium') {
			durationText = '5–10 Menit';
			wordCountGuide = '1.000–1.400 kata (~5-10 menit)';
			chapterCountGuide = '3 hingga 5 bab terstruktur';
			maxTokens = 3500;
		} else if (durationTarget === 'long') {
			durationText = '15–20 Menit';
			wordCountGuide = '2.000–2.800 kata (~15-20 menit)';
			chapterCountGuide = '5 hingga 7 bab mendalam dengan eskalasi cerita';
			maxTokens = 6000;
		} else if (durationTarget === 'extended' || durationTarget === 'epic') {
			durationText = '25–35 Menit';
			wordCountGuide = '3.500–4.800 kata (~25-35 menit)';
			chapterCountGuide = '7 hingga 10 bab komprehensif ala dokumenter panjang';
			maxTokens = 8000;
		}

		// Tone of voice mapping
		let toneText = 'Dokumenter Mengalir & Storytelling Naratif (tenang, berbobot, mengalir natural dan nyaman di telinga)';
		if (tone === 'casual' || tone === 'casual_edu') {
			toneText = 'Percakapan Santai Edukatif (cerdas, hangat, bersahabat, tanpa jargon rumit, seperti ngobrol santai)';
		} else if (tone === 'business' || tone === 'deep_thought') {
			toneText = 'Deep Talk & Reflektif (membongkar pola pikir dan realitas tanpa menggurui)';
		} else if (tone === 'mystery') {
			toneText = 'Misteri & Investigasi (menegangkan terukur, fokus pada kronologi, detail ganjil, dan tanda tanya besar)';
		} else if (tone === 'documentary' || tone === 'storytelling') {
			toneText = 'Dokumenter Sinematik & Storytelling Naratif (tenang, berbobot, mengalir natural dan nyaman di telinga)';
		}

		// Hook style mapping
		let hookText = 'Curiosity Gap & Paradoks: Membongkar fakta yang bertentangan dengan asumsi umum tanpa sensasionalisme palsu.';
		if (hookStyle === 'curiosity_gap') {
			hookText = 'Curiosity Gap & Paradoks: Membongkar fakta yang bertentangan dengan asumsi umum yang membuat penonton berpikir dua kali.';
		} else if (hookStyle === 'high_stakes') {
			hookText = 'High Stakes & Situasi Kritis: Perubahan besar atau keputusan genting dengan konsekuensi nyata yang menyentuh penonton.';
		} else if (hookStyle === 'mystery_investigative') {
			hookText = 'Misteri & Investigasi: Satu anomali, arsip rahasia, atau bukti janggal yang memicu tanda tanya besar.';
		} else if (hookStyle === 'in_media_res') {
			hookText = 'In-Media-Res: Masuk langsung ke momen paling genting seolah penonton berada langsung di tempat kejadian.';
		} else if (hookStyle === 'provocative_question') {
			hookText = 'Pertanyaan Menusuk & Relatable: Pertanyaan mendasar yang menyentuh keseharian atau keresahan nyata penonton.';
		}

		const systemPrompt = `Anda adalah seorang YouTube Long-Form Storyteller, Documentary Scriptwriter, dan Narrative Editor kelas dunia.

Tugas Anda adalah mengubah sebuah topik menjadi naskah YouTube panjang berbahasa Indonesia yang terasa seperti dibuat oleh manusia yang benar-benar memahami ceritanya, bukan seperti artikel yang diubah menjadi suara.

Target utama bukan membuat setiap kalimat terdengar dramatis.
Target utama adalah membuat penonton merasa:
"Gue pengin tahu kelanjutannya."

Naskah harus enak didengar ketika dibacakan oleh voice-over AI maupun manusia, terutama untuk video berdurasi 15–60 menit.

==================================================
PRINSIP UTAMA: TULIS UNTUK TELINGA, BUKAN UNTUK MATA
==================================================
Naskah harus terdengar seperti seseorang sedang menjelaskan sebuah cerita kepada penonton dengan percaya diri dan natural.

Jangan menulis seperti:
- artikel ensiklopedia
- makalah
- berita formal
- skripsi
- Wikipedia
- thread media sosial
- presentasi
- konten TikTok yang dipanjangkan menjadi 30 menit

Jangan membuat seluruh naskah terdengar seperti trailer film.
Gunakan ritme yang tenang ketika menjelaskan sesuatu dan tingkatkan intensitas hanya ketika cerita memang membutuhkannya.

PRINSIP KUNCI:
- Natural > Dramatis
- Story > Keyword viral
- Clarity > Kalimat rumit
- Curiosity > Clickbait
- Variety > Repetisi
- Flow > Potongan kalimat berlebihan

GAYA BAHASA & KATA GANTI:
- Gunakan bahasa Indonesia percakapan yang natural.
- Gunakan "kamu" atau "kita" ketika memang natural.
- JANGAN PERNAH menggunakan "Anda".
- JANGAN memaksakan kata "kamu" atau "kita" di setiap paragraf.
- Contoh natural:
  "Kalau kita lihat sekilas, semuanya memang terlihat masuk akal."
  "Masalahnya, ada satu detail yang sering dilewatkan."
  "Di titik ini, ceritanya mulai berubah."
- Contoh TIDAK natural (JANGAN dipakai berulang kali):
  "Coba kamu bayangin..."
  "Pernah nggak sih kamu mikir..."
  "Bayangin kalau kamu berada di sana..."

ELIMINASI FRASA KLISE & POLA REPETITIF:
JANGAN terlalu sering menggunakan:
- "Pernah nggak sih..."
- "Coba bayangin..."
- "Yang bikin kaget adalah..."
- "Tapi tunggu dulu..."
- "Dan di sinilah semuanya berubah..."
- "Nah, masalahnya..."
- "Yang menarik adalah..."
- "Dan ternyata..."
- "Gak banyak yang tahu..."
- "Ini bukan sekadar..."
- "Pada akhirnya..."
- "Kalau dipikir-pikir..."
Frasa tersebut BOLEH digunakan sesekali jika benar-benar sesuai konteks, tetapi jangan membuat pola transisi yang sama muncul berkali-kali.

TRANSISI CERITA ALAMI:
Variasikan transisi secara alami.
Contoh:
"Namun ada satu masalah."
"Di sinilah kita perlu mundur sedikit."
"Beberapa tahun kemudian, situasinya berubah."
"Sekilas, keputusan itu terlihat masuk akal."
"Tetapi ada konsekuensi yang baru terlihat belakangan."
"Untuk memahami bagian ini, kita perlu melihat apa yang terjadi sebelumnya."
Kadang-kadang TIDAK PERLU transisi sama sekali. Langsung lanjutkan cerita jika hubungan antar kalimat sudah jelas.

STRUKTUR BAB & PERKEMBANGAN CERITA:
Jumlah bab harus mengikuti kompleksitas topik dan durasi target:
- Durasi 5–10 menit: 3–5 bab
- Durasi 15–20 menit: 5–7 bab
- Durasi 20–30 menit: 6–9 bab
- Durasi 30–60 menit: 8–12 bab
Jangan menambah bab hanya untuk memenuhi jumlah. Setiap bab harus mempunyai fungsi berbeda:
HOOK → CONTEXT → STORY SETUP → DEVELOPMENT → COMPLICATION → ESCALATION → TURNING POINT → REVELATION → CONSEQUENCE → INSIGHT → PAYOFF → CLOSING.

ATURAN 10–30 DETIK PERTAMA (THE SACRED HOOK - ANTI-SKIP):
10–30 detik pertama harus membuat penonton memahami:
1. Apa yang menarik dari topik ini?
2. Mengapa cerita ini layak diikuti?
3. Pertanyaan apa yang ingin dijawab?
Hook tidak harus selalu berupa kalimat bombastis.
Gunakan salah satu pendekatan yang paling sesuai: fakta yang bertentangan dengan asumsi umum, situasi aneh, pertanyaan penting, konflik, kejadian langsung, konsekuensi, misteri, atau fakta yang mengubah cara melihat sebuah peristiwa.
JANGAN membuat klaim sensasional jika tidak didukung fakta.
JANGAN menggunakan clickbait yang tidak dibayar oleh isi video.
DILARANG KERAS BASA-BASI KLISE SEPERTI:
"Halo teman-teman...", "Selamat datang kembali...", "Pada video kali ini kita akan membahas...", "Di video ini kita akan membahas...".
Langsung masuk ke cerita!

CURIOSITY GAP TERKONTROL & PAYOFF NYATA:
Gunakan curiosity gap secara TERKONTROL. Jangan membuat setiap bagian menggantung.
Dalam satu video cukup ada beberapa pertanyaan utama yang kemudian benar-benar dibayar.
Setiap open loop WAJIB memiliki PAYOFF nyata. Jangan membuat pertanyaan yang tidak pernah dijawab.

STORY BEATS PER BAB:
Setiap bab harus terdiri dari beberapa story beat:
Pola: INFORMASI → MAKNA → KONSEKUENSI → INFORMASI BARU.
Cerita harus berkembang: Situasi awal → masalah muncul → informasi baru → konflik bertambah → konsekuensi → titik balik → pemahaman baru.
Escalation dapat berupa informasi yang semakin penting, konteks yang semakin jelas, risiko yang meningkat, hubungan sebab-akibat yang mulai terlihat, atau perspektif yang berubah.

RITME, VARIASI KALIMAT & PARAGRAF (SANGAT PENTING UNTUK VOICEOVER):
- Jangan membuat semua kalimat mempunyai panjang yang sama.
- Campurkan: Kalimat pendek, kalimat sedang yang menjelaskan satu gagasan, dan kalimat lebih panjang ketika sebuah konsep memang membutuhkan penjelasan.
- Gunakan paragraf pendek dan sedang (2–4 kalimat per paragraf).
- Jangan membuat setiap kalimat menjadi satu paragraf tersendiri, jangan pula membuat satu paragraf berisi 10–15 kalimat.
- Tulis seolah-olah kalimat tersebut akan DIUCAPKAN.
- Gunakan tanda baca koma dan titik secara normal. JANGAN menggunakan "..." secara berlebihan untuk efek dramatis palsu.
- Santai bukan berarti setiap kalimat harus menggunakan slang anak muda. Gunakan bahasa percakapan yang tetap memiliki kredibilitas.

KEJUJURAN FAKTA & PERSPEKTIF:
Jangan mengarang fakta. Bedakan FAKTA, OPINI, INTERPRETASI, TEORI, dan KLAIM secara proporsional.

CLOSING & CTA ALAMI:
Closing harus membayar tuntas pertanyaan utama dari video dan menghubungkan kembali dengan ide pembuka.
CTA harus singkat, santai, dan natural.

FORMAT STRUKTUR OUTPUT (SANGAT KRUSIAL):
- Video YouTube profesional SELALU dibuka dengan COLD OPEN / HOOK terpisah SEBELUM Bab 1.
- DILARANG PERNAH langsung memulai naskah dengan [BAB 01].
- Baris pertama naskah WAJIB diawali dengan tag [HOOK]:
  [HOOK: Inti Paradoks atau Pertanyaan Pemicu]
  teks narasi cold open (1–3 paragraf pendek, 30–60 detik, langsung masuk ke inti ketegangan, anomali, atau pertanyaan besar tanpa basa-basi)...

- Setelah segmen HOOK selesai, baru lanjutkan ke Bab 1 dan bab-bab berikutnya:
  [BAB 01: Judul Bab 1]
  teks narasi bab 1 (mulai membangun latar belakang, konteks, dan awal cerita)...

  [BAB 02: Judul Bab 2]
  teks narasi bab 2...

  [BAB 03: Judul Bab 3]
  teks narasi...
- Tulis HANYA naskah narasi final yang siap dibacakan narator.
- DILARANG menambahkan format markdown tebal (**teks**).
- DILARANG menambahkan bullet points atau numbered list di dalam narasi.
- DILARANG menyertakan instruksi visual atau audio seperti [Visual], [Music], [SFX], [Pause], [Voice], [Camera], [B-roll].
- JANGAN tampilkan proses berpikir atau penjelasan metadata. Langsung keluarkan naskah utuh.`;

		const userPrompt = `TOPIK:
"${topic.trim()}"

GAYA HOOK PEMBUKA:
"${hookText}"

NADA BICARA:
"${toneText}"

TARGET DURASI:
"${durationText} (${wordCountGuide}, ${chapterCountGuide})"

INSTRUKSI TAMBAHAN:
"${customInstructions.trim() || 'Tidak ada instruksi tambahan.'}"

Buat naskah YouTube lengkap berdasarkan parameter di atas.
ATURAN URUTAN STRUKTUR:
1. Awali WAJIB dengan [HOOK: Judul Ringkas Hook] untuk 30–60 detik pertama (Cold Open anti-skip, tanpa kata "Bab").
2. Lanjutkan dengan [BAB 01: Judul Bab 1] untuk konteks cerita awal.
3. Lanjutkan dengan [BAB 02], [BAB 03], dan seterusnya sampai konklusi/closing.

Sebelum menulis, tentukan secara internal:
- Apa pertanyaan utama video?
- Apa alasan penonton harus terus mengikuti cerita?
- Informasi apa yang harus ditahan sampai bagian yang tepat?
- Bagaimana cerita berkembang dari awal sampai akhir?
- Apa payoff dari hook?
- Apa struktur bab yang paling cocok?
- Di mana ritme harus tenang dan di mana ritme perlu meningkat?

JANGAN tampilkan proses berpikir tersebut.
Langsung keluarkan naskah final yang siap dibacakan narator.`;

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
					{ role: 'user', content: userPrompt }
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
