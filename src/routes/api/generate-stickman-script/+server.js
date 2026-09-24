import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || 'sk-0802f45e1d4e41c8ae8d46396c97b746';

export async function POST({ request }) {
	try {
		const {
			topic,
			niche = 'psychology',
			durationTarget = 'medium', // 'short' (1-2m), 'medium' (3-5m), 'long' (6-9m)
			formula = 'curiosity_gap', // 'curiosity_gap', 'relatable_pain', 'story_twist', 'mind_bending'
			languageStyle = 'casual_smart', // 'casual_smart' (kamu/kita), 'creator_punchy' (santai energik), 'documentary' (berbobot)
			customNotes = '',
			apiKey
		} = await request.json();

		if (!topic || !topic.trim()) {
			return json({ success: false, error: 'Topik atau ide naskah wajib diisi' }, { status: 400 });
		}

		const effectiveApiKey = apiKey && apiKey.trim().length > 10 ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;

		// Duration & Word count targets (Indonesian speech pacing ~140-150 words/min)
		let wordCountTarget = '600–850 kata (~4-6 menit)';
		let chapterCount = '4 hingga 5 bab mengalir';
		let maxTokens = 4000;

		if (durationTarget === 'short') {
			wordCountTarget = '280–420 kata (~2-3 menit)';
			chapterCount = '2 hingga 3 bab padat';
			maxTokens = 2500;
		} else if (durationTarget === 'medium') {
			wordCountTarget = '600–850 kata (~4-6 menit)';
			chapterCount = '4 hingga 5 bab mengalir';
			maxTokens = 4000;
		} else if (durationTarget === 'long' || durationTarget === 'long_8') {
			wordCountTarget = '1.050–1.350 kata (~7-9 menit)';
			chapterCount = '6 hingga 8 bab mendalam';
			maxTokens = 5500;
		} else if (durationTarget === 'long_12' || durationTarget === '10-12' || durationTarget === 'very_long') {
			wordCountTarget = '1.500–1.850 kata (~10-12 menit)';
			chapterCount = '8 hingga 11 bab terstruktur';
			maxTokens = 7500;
		} else if (durationTarget === 'long_15' || durationTarget === '13-15' || durationTarget === 'extended_15') {
			wordCountTarget = '1.950–2.400 kata (~13-15 menit)';
			chapterCount = '11 hingga 14 bab komprehensif & mendalam';
			maxTokens = 8192;
		}

		// Viral Formula Guidelines
		let formulaInstruction = '';
		if (formula === 'curiosity_gap') {
			formulaInstruction = `FORMULA: THE CURIOSITY GAP & PARADOX
- Mulai dengan fakta atau kontradiksi yang menentang keyakinan umum (misal: "Kenapa makin keras kamu mencoba santai, otakmu justru makin cemas?").
- Buka "Open Loop" di detik pertama: ada satu rahasia ganjil yang tidak disadari 90% orang, dan kita akan bongkar lapis demi lapis sampai akhir.
- Jangan berikan solusi di awal; bangun rasa penasaran bertahap.`;
		} else if (formula === 'relatable_pain') {
			formulaInstruction = `FORMULA: RELATABLE PAIN & PATTERN INTERRUPT
- Mulai langsung dengan visualisasi momen nyata yang sering dialami penonton (misal: "Pernah nggak kamu udah rebahan di kasur jam 11 malam, tapi tanganmu refleks terus scroll HP sampai jam 2 pagi?").
- Validasi perasaan penonton: "Ini bukan karena kamu malas, tapi karena ada mekanisme biologis yang dibajak."
- Sajikan 'Aha-Moment' psikologis yang melegakan sekaligus menampar pola pikir lama.`;
		} else if (formula === 'story_twist') {
			formulaInstruction = `FORMULA: DRAMATIC STORYTELLING & CASE STUDY
- Mulai di tengah kejadian paling genting atau momen krusial (In-Media-Res).
- Ceritakan studi kasus nyata (tokoh, brand, atau eksperimen misterius) dengan dinamika naik-turun.
- Selipkan plot twist di pertengahan cerita yang membuat penonton sadar bahwa mereka salah menduga.`;
		} else if (formula === 'mind_bending') {
			formulaInstruction = `FORMULA: MIND-BENDING ANALOGY (ANALOGI GILA)
- Pecah konsep rumit menjadi perumpamaan visual sehari-hari yang sangat gampang dibayangkan.
- Gunakan analogi unik (misal: "Bayangkan pikiranmu punya dua manajer yang saling berebut kendali...").
- Buat penonton merasa: "Gila, ternyata sesimpel dan sejelas ini penjelasannya!"`;
		}

		// Style of Language
		let styleInstruction = '';
		if (languageStyle === 'casual_smart') {
			styleInstruction = 'Gaya bahasa Indonesia santai cerdas (menggunakan kata "kamu" dan "kita"). Hangat, akrab, seperti ngobrol dengan teman pintar di kafe tanpa kata-kata kaku.';
		} else if (languageStyle === 'creator_punchy') {
			styleInstruction = 'Gaya bahasa kreator modern yang lincah, ekspresif, dan punchy. Kalimat-kalimat pendek, berenergi tinggi, ritme cepat, tanpa basa-basi.';
		} else if (languageStyle === 'documentary') {
			styleInstruction = 'Gaya bahasa narasi dokumenter mendalam, tenang, berbobot, dengan pilihan kata yang elegan dan memikat imajinasi.';
		}

		const systemPrompt = `Lo adalah scriptwriter YouTube storytelling & explainer kelas dunia (ala Dan Koe, Ferry Irwandi, Satu Persen, Ali Abdaal, Kurzgesagt, dan Menjadi Manusia).

Naskah lo selalu punya:
1. Average View Duration (AVD) / Retensi Penonton di atas 65%.
2. Hook detik pertama yang bikin orang berhenti bernapas dan langsung terpaku mendengarkan.
3. Kalimat yang ritmis, padat, alami, dan sangat enak diucapkan oleh voice-over.
4. TULIS UNTUK TELINGA, BUKAN UNTUK MATA. Ini adalah obrolan mendalam dari manusia asli ke manusia asli.

==================================================
⛔ PANTANGAN KERAS (DILARANG MUTLAK):
==================================================
1. DILARANG KERAS MENYEBUT KATA "STICKMAN", "KARAKTER", "GAMBAR", ATAU "ANIMASI" DI DALAM SELURUH ISI NASKAH!
2. DILARANG MENULIS INSTRUKSI AKSI PANGGUNG / DESKRIPSI VISUAL DI DALAM TEKS PARAGRAF!
   ❌ CONTOH SANGAT SALAH & DILARANG:
   - "Stickman memegang satu biji kecil, menanamnya, lalu pergi tidur."
   - "Stickman mencentang satu tugas penting, minum air..."
   - "Stickman berdiri di depan cermin lagi..."
   - "Karakter terlihat menatap layar dengan bingung..."
   Ingat: Seluruh teks naskah adalah VOICEOVER (kata demi kata yang AKAN DIBACAKAN OLEH SUARA NARATOR). Penonton mendengarkan cerita dan sudut pandang mendalam, BUKAN mendengarkan narator mendongengkan kartun!

3. TULIS VOICEOVER MURNI — BICARA LANGSUNG KE PENONTON:
   ✅ CONTOH BENAR (ALAMI, MENUSUK, MENGALIR):
   - "Coba bayangkan, kamu bangun jam enam pagi dengan kepala yang sudah penuh beban pikiran..."
   - "Rahasia terbesarnya sebenarnya sederhana: ubah satu hal kecil hari ini, lalu biarkan waktu membuktikannya."
   - "Berhentilah menunggu sampai kamu merasa siap. Karena rasa siap itu nggak akan pernah datang kalau kamu terus menundanya."

==================================================
STRUKTUR NASKAH (MENGALIR ALAMI TANPA BAB):
==================================================
1. LANGSUNG MENGALIR TANPA BAB:
   - DILARANG menggunakan header bab, label bab, atau penomoran bab (JANGAN pakai [Bab 1:...], [Bagian 1:...], Part 1, dsb.).
   - Naskah ditulis LANGSUNG MENGALIR mulus dari awal sampai akhir dalam rangkaian paragraf alami seperti monolog obrolan intim.
   - Pisahkan ide antar bagian cukup dengan baris baru (enter/paragraf baru).

2. ZERO INTRO & ZERO FLUFF:
   - DILARANG menyapa penonton ("Halo guys", "Selamat datang kembali", "Di video kali ini...").
   - Kalimat pertama HARUS LANGSUNG MENUSUK ke inti masalah atau keresahan penonton di detik pertama.

3. TARGET PANJANG KATA:
   - Target total naskah: ${wordCountTarget}.
   - Tulis naskah lengkap, utuh, siap dibacakan, jangan dipotong atau disingkat.

4. PACING & GAYA PENULISAN:
   - Pakai kalimat yang relatif pendek dan padat (10–18 kata per kalimat).
   - Setiap 2-3 kalimat sajikan satu sudut pandang baru yang mencerahkan ("Aha-Moment").
   - Hindari klise motivasi murahan; berikan wawasan psikologis atau filosofis yang berbobot.

${formulaInstruction}

GAYA BAHASA:
${styleInstruction}

${customNotes ? `CATATAN TAMBAHAN:\n${customNotes}` : ''}

Output HANYA teks naskah narasi lengkap yang mengalir alami tanpa ada judul bab atau tag bab sama sekali. ZERO kata 'stickman' dan ZERO tag bab!`;

		const response = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${effectiveApiKey}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: `Tuliskan naskah video YouTube viral berbobot tentang: "${topic}". Niche: ${niche}. Ingat aturan mutlak: Naskah LANGSUNG MENGALIR tanpa ada judul bab sama sekali, 100% narasi suara manusia murni, dan DILARANG menyebut kata "stickman" atau instruksi panggung visual!` }
				],
				temperature: 0.85,
				max_tokens: maxTokens,
				stream: true
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			console.error('DeepSeek API Error:', errText);
			return json({ success: false, error: `DeepSeek API error (${response.status}): ${errText.slice(0, 120)}` }, { status: 502 });
		}

		// Stream the text back to the client using SSE
		return new Response(
			new ReadableStream({
				async start(controller) {
					const reader = response.body.getReader();
					const decoder = new TextDecoder();
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
									controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
									controller.close();
									return;
								}

								try {
									const data = JSON.parse(trimmed.slice(5).trim());
									const content = data.choices?.[0]?.delta?.content;
									if (content) {
										controller.enqueue(
											new TextEncoder().encode(`data: ${JSON.stringify({ text: content })}\n\n`)
										);
									}
								} catch {
									// ignore malformed chunks
								}
							}
						}
						controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
						controller.close();
					} catch (streamErr) {
						controller.error(streamErr);
					}
				}
			}),
			{
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
				}
			}
		);
	} catch (error) {
		console.error('Error in /api/generate-stickman-script:', error);
		return json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
	}
}
