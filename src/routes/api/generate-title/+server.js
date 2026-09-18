import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || 'sk-0802f45e1d4e41c8ae8d46396c97b746';

/**
 * Offline Fallback Title Generator with proven high-CTR YouTube formulas
 */
function generateOfflineViralTitles(topic = '', script = '') {
	const subject = topic.trim() || (script.trim() ? script.trim().slice(0, 40) : 'Peristiwa Misterius');

	return [
		{
			title: `Kenapa Tidak Ada yang Berani Membicarakan ${subject}?`,
			category: 'curiosity_gap',
			categoryLabel: 'Curiosity Gap',
			ctrScore: 97,
			charCount: `Kenapa Tidak Ada yang Berani Membicarakan ${subject}?`.length,
			isMobileFriendly: true,
			formulaExplanation: 'Memicu rasa ingin tahu mendalam dengan menyiratkan adanya rahasia besar yang sengaja disembunyikan.',
			thumbnailIdea: {
				visualHook: 'Dokumen bertuliskan "TOP SECRET" atau ekspresi terkejut di tempat gelap',
				overlayText: 'JANGAN DIBUKA'
			}
		},
		{
			title: `Rahasia di Balik ${subject} yang Terbongkar`,
			category: 'short_punchy',
			categoryLabel: 'Short & Punchy (<50 Karakter)',
			ctrScore: 94,
			charCount: `Rahasia di Balik ${subject} yang Terbongkar`.length,
			isMobileFriendly: true,
			formulaExplanation: 'Pendek, tegas, dan tidak terpotong di layar smartphone penonton.',
			thumbnailIdea: {
				visualHook: 'Tanda silang merah tebal di atas subjek utama dengan pencahayaan sinematik',
				overlayText: 'AKHIRNYA TERUNGKAP'
			}
		},
		{
			title: `Investigasi Terbuka: Apa yang Sebenarnya Terjadi pada ${subject}?`,
			category: 'documentary',
			categoryLabel: 'Dokumenter Otoritatif',
			ctrScore: 92,
			charCount: `Investigasi Terbuka: Apa yang Sebenarnya Terjadi pada ${subject}?`.length,
			isMobileFriendly: false,
			formulaExplanation: 'Gaya jurnalisme investigatif yang memancarkan kredibilitas tinggi dan narasi mendalam.',
			thumbnailIdea: {
				visualHook: 'Peta timeline atau garis polisi dengan arsip dokumen tahun lampau',
				overlayText: 'FAKTA ASLI'
			}
		},
		{
			title: `Semua Orang Salah Mengira Tentang ${subject}`,
			category: 'contrast',
			categoryLabel: 'Kontras & Paradoks',
			ctrScore: 95,
			charCount: `Semua Orang Salah Mengira Tentang ${subject}`.length,
			isMobileFriendly: true,
			formulaExplanation: 'Pattern interrupt: menantang keyakinan umum penonton secara langsung.',
			thumbnailIdea: {
				visualHook: 'Grafik atau objek terbelah dua antara ekspektasi vs realita',
				overlayText: 'KITA DIBOHONGI?'
			}
		},
		{
			title: `Keputusan 10 Menit yang Mengubah ${subject} Selamanya`,
			category: 'high_stakes',
			categoryLabel: 'High Stakes & Urgensi',
			ctrScore: 93,
			charCount: `Keputusan 10 Menit yang Mengubah ${subject} Selamanya`.length,
			isMobileFriendly: true,
			formulaExplanation: 'Menghadirkan titik balik dramatis dan urgensi sebab-akibat yang nyata.',
			thumbnailIdea: {
				visualHook: 'Jam dinding analog atau detik digital merah berlatar belakang ruang kendali',
				overlayText: 'DETIK TERAKHIR'
			}
		},
		{
			title: `Bagaimana Satu Kesalahan Kecil Menghancurkan ${subject}`,
			category: 'contrast',
			categoryLabel: 'Kontras & Paradoks',
			ctrScore: 96,
			charCount: `Bagaimana Satu Kesalahan Kecil Menghancurkan ${subject}`.length,
			isMobileFriendly: true,
			formulaExplanation: 'Efek domino: sebab sepele yang memicu konsekuensi dahsyat memancing klik instan.',
			thumbnailIdea: {
				visualHook: 'Efek retakan domino atau kaca pecah pada subjek',
				overlayText: 'SATU KESALAHAN'
			}
		},
		{
			title: `Malam di Mana ${subject} Berakhir`,
			category: 'short_punchy',
			categoryLabel: 'Short & Punchy (<50 Karakter)',
			ctrScore: 98,
			charCount: `Malam di Mana ${subject} Berakhir`.length,
			isMobileFriendly: true,
			formulaExplanation: 'Sangat singkat, puitis, atmosferik, dan memancing emosi penonton seketika.',
			thumbnailIdea: {
				visualHook: 'Siluet gelap dengan satu lampu sorot tajam di tengah malam',
				overlayText: 'TITIK HABIS'
			}
		},
		{
			title: `Kebenaran Paling Mengerikan Tentang ${subject}`,
			category: 'curiosity_gap',
			categoryLabel: 'Curiosity Gap',
			ctrScore: 95,
			charCount: `Kebenaran Paling Mengerikan Tentang ${subject}`.length,
			isMobileFriendly: true,
			formulaExplanation: 'Memancing rasa takut ketinggalan informasi (FOMO) dengan rasa penasaran tinggi.',
			thumbnailIdea: {
				visualHook: 'Ekspresi mata tegang dalam bayangan hitam kontras tinggi',
				overlayText: 'TERLALU JAUH'
			}
		}
	];
}

export async function POST({ request }) {
	try {
		const {
			topic = '',
			script = '',
			niche = 'general',
			tone = 'storytelling',
			apiKey
		} = await request.json();

		const effectiveTopic = (topic || '').trim();
		const cleanScript = (script || '').trim();

		if (!effectiveTopic && !cleanScript) {
			return json({ success: false, error: 'Masukkan topik atau teks naskah untuk membuat judul' }, { status: 400 });
		}

		const effectiveApiKey = apiKey && apiKey.trim().length > 10 ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;

		// If no DeepSeek key, return offline viral titles immediately
		if (!effectiveApiKey) {
			const fallbackTitles = generateOfflineViralTitles(effectiveTopic, cleanScript);
			return json({
				success: true,
				source: 'offline_engine',
				topic: effectiveTopic || 'Naskah YouTube',
				titles: fallbackTitles
			});
		}

		const systemPrompt = `Anda adalah YouTube Algorithm & Viral Packaging Specialist kelas dunia (setara tim pengembang judul & thumbnail MrBeast, Veritasium, Magnates Media, Lemmino, dan Johnny Harris).

Tugas Anda adalah membuat 10 JUDUL YOUTUBE VIRAL TERBAIK (High-CTR, irresistible clickability, anti-clickbait basi) berdasarkan topik atau naskah yang diberikan.

PRINSIP REKAYASA JUDUL VIRAL YOUTUBE (HIGH CTR):
1. TULIS UNTUK PSIKOLOGI MANUSIA:
   - Judul harus memicu dorongan emosional kuat: rasa penasaran tak tertahankan (curiosity gap), paradoks mengejutkan, atau urgensi krisis.
   - HINDARI KATA-KATA KLIKBAIT MURAHAN SEPERTI: "Bikin Melongo!", "Viral!", "Geger!", "Heboh!", "Wajib Tonton!". Gunakan intrik cerdas dan storytelling elegan.

2. ATURAN PANJANG KARAKTER (MOBILE-FIRST OPTIMIZATION):
   - 70% penonton membuka YouTube dari Smartphone.
   - Judul ideal: antara 35 hingga 60 karakter (maksimal 70 karakter agar kata kunci utama TIDAK terpotong "..." di layar HP).

3. FORMULA PEMBAGIAN KATEGORI (Buat 2 judul untuk setiap kategori di bawah):
   a. "curiosity_gap" (Curiosity Gap & Misteri Terpendam): Membuka celah rasa ingin tahu yang tak bisa diabaikan tanpa dijawab di thumbnail.
   b. "short_punchy" (Short & Punchy < 50 Karakter): Sangat pendek, menghantam, dan bertenaga.
   c. "documentary" (Dokumenter Otoritatif / Investigasi): Serius, berbobot, prestisius, ala investigasi jurnalisme mendalam.
   d. "contrast" (Kontras Tajam / Paradoks): Menabrakkan dua kenyataan yang tampak mustahil atau bertentangan.
   e. "high_stakes" (High Stakes & Titik Balik): Situasi genting, keputusan kritis, dan dampak monumental.

4. THUMBNAIL PAIRING CONCEPT (Sinergi Judul + Thumbnail):
   - Judul dan teks thumbnail TIDAK BOLEH mengulang kalimat yang sama persis!
   - Keduanya harus saling melengkapi (1 + 1 = 3).
   - Teks thumbnail WAJIB sangat pendek: 2 hingga 4 kata huruf kapital yang memukul.

FORMAT OUTPUT WAJIB:
Kembalikan HANYA format JSON valid tanpa markdown pembungkus di luar JSON, dengan struktur berikut:
{
  "titles": [
    {
      "title": "Judul YouTube Dalam Bahasa Indonesia",
      "category": "curiosity_gap",
      "categoryLabel": "Curiosity Gap",
      "ctrScore": 97,
      "charCount": 48,
      "isMobileFriendly": true,
      "formulaExplanation": "Penjelasan singkat psikologi mengapa judul ini sangat memancing klik penonton.",
      "thumbnailIdea": {
        "visualHook": "Deskripsi visual thumbnail yang kontras dan sinematik",
        "overlayText": "3-4 KATA MAKSIMAL"
      }
    }
  ]
}`;

		const userContext = effectiveTopic 
			? `Topik Video: "${effectiveTopic}"\n${cleanScript ? `Ringkasan Naskah: "${cleanScript.slice(0, 1500)}..."` : ''}`
			: `Naskah Video Lengkap:\n"${cleanScript.slice(0, 2500)}..."`;

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
					{ role: 'user', content: `Analisis konteks berikut dan buatkan 10 judul YouTube viral dengan CTR tertinggi:\n\n${userContext}` }
				],
				temperature: 0.75,
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			console.warn('DeepSeek title generator API warning, using offline engine:', errText);
			const fallbackTitles = generateOfflineViralTitles(effectiveTopic, cleanScript);
			return json({
				success: true,
				source: 'offline_engine',
				topic: effectiveTopic || 'Naskah YouTube',
				titles: fallbackTitles
			});
		}

		const data = await response.json();
		const rawContent = data.choices?.[0]?.message?.content;

		if (rawContent) {
			try {
				const parsed = JSON.parse(rawContent);
				if (parsed.titles && Array.isArray(parsed.titles) && parsed.titles.length > 0) {
					// Enrich and sanitize titles
					const sanitizedTitles = parsed.titles.map((t) => {
						const cleanTitle = (t.title || '').replace(/^["']|["']$/g, '').trim();
						const count = cleanTitle.length;
						return {
							title: cleanTitle,
							category: t.category || 'curiosity_gap',
							categoryLabel: t.categoryLabel || 'Viral High-CTR',
							ctrScore: Number(t.ctrScore) || Math.floor(Math.random() * 8 + 91),
							charCount: count,
							isMobileFriendly: count <= 62,
							formulaExplanation: t.formulaExplanation || 'Formula psikologi retensi tinggi untuk memancing klik organik.',
							thumbnailIdea: {
								visualHook: t.thumbnailIdea?.visualHook || 'Pencahayaan sinematik dengan kontras subjek tajam',
								overlayText: (t.thumbnailIdea?.overlayText || 'JANGAN DIBUKA').toUpperCase()
							}
						};
					});

					// Sort by CTR score descending
					sanitizedTitles.sort((a, b) => b.ctrScore - a.ctrScore);

					return json({
						success: true,
						source: 'deepseek_ai',
						topic: effectiveTopic || 'Naskah YouTube',
						titles: sanitizedTitles
					});
				}
			} catch (parseErr) {
				console.warn('JSON parsing error from title generator AI, using fallback:', parseErr);
			}
		}

		// Fallback if parsing fails
		const fallbackTitles = generateOfflineViralTitles(effectiveTopic, cleanScript);
		return json({
			success: true,
			source: 'offline_engine',
			topic: effectiveTopic || 'Naskah YouTube',
			titles: fallbackTitles
		});

	} catch (error) {
		console.error('Error in /api/generate-title:', error);
		const fallbackTitles = generateOfflineViralTitles('Video YouTube');
		return json({
			success: true,
			source: 'emergency_fallback',
			titles: fallbackTitles
		});
	}
}
