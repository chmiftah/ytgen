import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DEFAULT_DEEPSEEK_KEY = env.DEEPSEEK_API_KEY || 'sk-0802f45e1d4e41c8ae8d46396c97b746';

/**
 * Rich category definitions with real viral angles
 */
const CATEGORY_DEFINITIONS = {
	investigation: {
		id: 'investigation',
		label: '🕵️‍♂️ Skandal & Investigasi Gelap',
		desc: 'Kasus nyata, dokumen rahasia, kejahatan kerah putih, rahasia terbongkar',
		offlineTitles: [
			{
				title: 'Dokumen Rahasia yang Sengaja Dihancurkan Sebelum Sidang',
				category: 'investigation',
				categoryLabel: 'Arsip Gelap',
				ctrScore: 98,
				charCount: 57,
				isMobileFriendly: true,
				formulaExplanation: 'Menghadirkan intrik konspirasi nyata yang memicu rasa ingin tahu tak tertahankan.',
				thumbnailIdea: { visualHook: 'Kertas dokumen berstempel merah "TOP SECRET" terbakar di ujungnya', overlayText: 'SENGAJA DIBAKAR' }
			},
			{
				title: 'Misteri Hilangnya 40 Triliun dalam Satu Malam',
				category: 'high_stakes',
				categoryLabel: 'Kasus Nyata',
				ctrScore: 97,
				charCount: 46,
				isMobileFriendly: true,
				formulaExplanation: 'Angka fantastis dipadukan dengan durasi singkat (satu malam) menciptakan urgensi ekstrem.',
				thumbnailIdea: { visualHook: 'Gedung pencakar langit perbankan gelap gulita dengan garis polisi', overlayText: 'LENYAP TOTAL' }
			},
			{
				title: 'Kasus Kejahatan Paling Sempurna yang Pernah Tercatat',
				category: 'curiosity_gap',
				categoryLabel: 'Misteri Nyata',
				ctrScore: 96,
				charCount: 51,
				isMobileFriendly: true,
				formulaExplanation: 'Superlatif otoritatif yang menantang akal sehat penonton untuk membuktikannya.',
				thumbnailIdea: { visualHook: 'Siluet pria berjas tanpa wajah di ruang interogasi dengan lampu sorot tunggal', overlayText: 'TIDAK TERLACAK' }
			},
			{
				title: 'Mereka Berpikir Tidak Ada yang Akan Tahu.',
				category: 'short_punchy',
				categoryLabel: 'Short & Punchy',
				ctrScore: 95,
				charCount: 43,
				isMobileFriendly: true,
				formulaExplanation: 'Sangat sinematik, pendek, dingin, dan langsung memicu rasa ingin tahu siapa "mereka".',
				thumbnailIdea: { visualHook: 'Kamera CCTV merah menyala menatap lorong kantor yang sepi', overlayText: 'TEREKAM SEMUA' }
			},
			{
				title: 'Kebohongan Terbesar yang Dipercaya Dunia Selama 30 Tahun',
				category: 'contrast',
				categoryLabel: 'Kontras & Paradoks',
				ctrScore: 96,
				charCount: 56,
				isMobileFriendly: true,
				formulaExplanation: 'Menyerang persepsi umum penonton bahwa apa yang mereka ketahui selama ini salah.',
				thumbnailIdea: { visualHook: 'Foto arsip hitam putih dengan wajah yang dicoret spidol merah', overlayText: 'KITA DIBOHONGI' }
			}
		]
	},
	dark_psychology: {
		id: 'dark_psychology',
		label: '🧠 Psikologi Gelap & Pikiran Manusia',
		desc: 'Manipulasi halus, jebakan dopamin, kebiasaan otak, kenapa manusia gagal',
		offlineTitles: [
			{
				title: 'Kenapa Otak Kita Sengaja Membuat Kita Gagal?',
				category: 'curiosity_gap',
				categoryLabel: 'Curiosity Gap',
				ctrScore: 98,
				charCount: 45,
				isMobileFriendly: true,
				formulaExplanation: 'Menyerang rasa frustrasi pribadi penonton dengan menyalahkan mekanisme biologis otak.',
				thumbnailIdea: { visualHook: 'Stickman memegang kepala dengan kabel otak kusut menyala merah', overlayText: 'JEBAKAN OTAK' }
			},
			{
				title: 'Seni Berhenti Menjelaskan Diri Sendiri',
				category: 'short_punchy',
				categoryLabel: 'Filosofi Praktis',
				ctrScore: 95,
				charCount: 39,
				isMobileFriendly: true,
				formulaExplanation: 'Karakter tenang berwibawa yang membuat penonton merasa mendapatkan senjata mental baru.',
				thumbnailIdea: { visualHook: 'Stickman tenang berdiri di tengah kerumunan stickman yang sibuk berteriak', overlayText: 'CUKUP DIAM' }
			},
			{
				title: 'Trik Manipulasi Halus yang Dilakukan Orang Terdekatmu',
				category: 'high_stakes',
				categoryLabel: 'Peringatan Nyata',
				ctrScore: 97,
				charCount: 54,
				isMobileFriendly: true,
				formulaExplanation: 'Urgensi personal: membuat penonton langsung teringat pada interaksi sehari-hari mereka.',
				thumbnailIdea: { visualHook: 'Bayangan hitam di belakang orang tersenyum yang sedang berbisik', overlayText: 'WASPADALAH' }
			},
			{
				title: 'Makin Keras Mencoba, Makin Cepat Kamu Gagal',
				category: 'contrast',
				categoryLabel: 'Kontras & Paradoks',
				ctrScore: 96,
				charCount: 45,
				isMobileFriendly: true,
				formulaExplanation: 'The Backwards Law: paradoks psikologi yang berlawanan dengan nasihat motivasi klise.',
				thumbnailIdea: { visualHook: 'Orang berenang melawan arus deras vs orang mengapung santai', overlayText: 'SALAH CARA' }
			},
			{
				title: 'Eksperimen 7 Hari Tanpa Scroll HP: Apa yang Terjadi pada Otak?',
				category: 'documentary',
				categoryLabel: 'Eksperimen Nyata',
				ctrScore: 94,
				charCount: 63,
				isMobileFriendly: false,
				formulaExplanation: 'Format studi kasus eksperimen mandiri yang memicu rasa penasaran atas hasilnya.',
				thumbnailIdea: { visualHook: 'Layar HP retak terkunci dengan grafik hormon dopamin anjlok', overlayText: 'HARI KE-4' }
			}
		]
	},
	wealth_finance: {
		id: 'wealth_finance',
		label: '💸 Uang, Kekayaan & Jebakan Finansial',
		desc: 'Mengapa kelas menengah terjebak, psikologi orang kaya, rahasia sistem uang',
		offlineTitles: [
			{
				title: 'Orang Kaya Tidak Membeli Aset. Mereka Membeli Ini.',
				category: 'curiosity_gap',
				categoryLabel: 'Curiosity Gap',
				ctrScore: 98,
				charCount: 51,
				isMobileFriendly: true,
				formulaExplanation: 'Mematahkan nasihat keuangan umum ("beli aset") dan membuka celah penasaran rahasia 1%.',
				thumbnailIdea: { visualHook: 'Brankas besi terbuka bukan berisi emas melainkan kontrak hitam bertuliskan waktu', overlayText: 'BUKAN RUMAH' }
			},
			{
				title: 'Kenapa Gaji 25 Juta Tetap Terasa Miskin di Akhir Bulan?',
				category: 'contrast',
				categoryLabel: 'Keresahan Nyata',
				ctrScore: 97,
				charCount: 55,
				isMobileFriendly: true,
				formulaExplanation: 'Validasi rasa frustrasi finansial kelas pekerja: membongkar jebakan gaya hidup.',
				thumbnailIdea: { visualHook: 'Grafik slip gaji tinggi dengan panah merah menukik tajam ke bawah', overlayText: 'KEMANA UANGNYA?' }
			},
			{
				title: 'Jebakan 40 Tahun yang Memaksa Kita Tetap Bekerja',
				category: 'high_stakes',
				categoryLabel: 'Sistem Tersembunyi',
				ctrScore: 96,
				charCount: 49,
				isMobileFriendly: true,
				formulaExplanation: 'Menghadirkan sudut pandang "Matriks Finansial" yang membuat penonton merasa terjebak.',
				thumbnailIdea: { visualHook: 'Stickman berlari di roda hamster emas berdasi kantor', overlayText: 'LINGKARAN SETAN' }
			},
			{
				title: 'Kebohongan Terbesar Tentang "Beli Rumah Usia Muda"',
				category: 'contrast',
				categoryLabel: 'Kontras & Mitos',
				ctrScore: 95,
				charCount: 51,
				isMobileFriendly: true,
				formulaExplanation: 'Menyerang dogma finansial tradisional orang tua dan agen properti.',
				thumbnailIdea: { visualHook: 'Rumah mewah yang ternyata diikat rantai besi besar berlabel "CICILAN 30 THN"', overlayText: 'JEBAKAN BESAR' }
			},
			{
				title: 'Psikologi Uang yang Tidak Pernah Diajarkan di Sekolah',
				category: 'documentary',
				categoryLabel: 'Edukasi Otoritatif',
				ctrScore: 93,
				charCount: 53,
				isMobileFriendly: true,
				formulaExplanation: 'Menyentuh sentimen umum bahwa kurikulum sekolah sengaja mendidik buruh bukan pemilik modal.',
				thumbnailIdea: { visualHook: 'Buku pelajaran tebal disilang merah di samping tumpukan uang kertas rapi', overlayText: 'DIRAHASIAKAN' }
			}
		]
	},
	science_paradox: {
		id: 'science_paradox',
		label: '⏳ Paradoks, Sains Menyeramkan & AI',
		desc: 'Simulasi alam semesta, misteri waktu, masa depan robot, fisika gila',
		offlineTitles: [
			{
				title: 'Bukti Ilmiah Bahwa Waktu Sebenarnya Tidak Pernah Bergerak',
				category: 'contrast',
				categoryLabel: 'Paradoks Sains',
				ctrScore: 97,
				charCount: 57,
				isMobileFriendly: true,
				formulaExplanation: 'Menabrak pemahaman dasar manusia tentang realitas dengan fisika relativitas.',
				thumbnailIdea: { visualHook: 'Jam dinding meleleh di ruang hampa dengan bayangan tubuh membeku', overlayText: 'WAKTU ITU PALSU' }
			},
			{
				title: 'Sesuatu yang Salah dengan Kecerdasan Buatan Baru Ini',
				category: 'curiosity_gap',
				categoryLabel: 'Curiosity Gap',
				ctrScore: 98,
				charCount: 54,
				isMobileFriendly: true,
				formulaExplanation: 'Intrik horor teknologi modern yang memancing rasa takut akan masa depan robot.',
				thumbnailIdea: { visualHook: 'Mata robot logam menyala merah di layar terminal server gelap', overlayText: 'MEREKA SADAR' }
			},
			{
				title: 'Paradoks Menakutkan di Balik Mengapa Kita Belum Bertemu Alien',
				category: 'documentary',
				categoryLabel: 'Misteri Kosmos',
				ctrScore: 95,
				charCount: 61,
				isMobileFriendly: false,
				formulaExplanation: 'Fermi Paradox dan The Great Filter: teori sains yang dingin dan mencengangkan.',
				thumbnailIdea: { visualHook: 'Teleskop raksasa menatap langit malam berbintang yang sunyi senyap', overlayText: 'SEMUA DIAM' }
			},
			{
				title: 'Dunia Ini Mungkin Hanya Simulasi Komputer.',
				category: 'short_punchy',
				categoryLabel: 'Short & Punchy',
				ctrScore: 96,
				charCount: 42,
				isMobileFriendly: true,
				formulaExplanation: 'Pernyataan provokatif singkat yang memicu perdebatan eksistensial.',
				thumbnailIdea: { visualHook: 'Langit biru terbelah menampakkan kode biner hijau di baliknya', overlayText: 'GLITCH NYATA' }
			}
		]
	},
	stoic_philosophy: {
		id: 'stoic_philosophy',
		label: '🏛️ Stoikisme & Filosofi Hidup Keras',
		desc: 'Marcus Aurelius, ketenangan saat hidup berantakan, disiplin baja, seni tidak peduli',
		offlineTitles: [
			{
				title: 'Cara Tetap Tenang Saat Rencana Hidupmu Hancur Total',
				category: 'high_stakes',
				categoryLabel: 'Ketenangan Batin',
				ctrScore: 97,
				charCount: 51,
				isMobileFriendly: true,
				formulaExplanation: 'Menghadirkan solusi nyata bagi penonton yang sedang menghadapi krisis kehidupan.',
				thumbnailIdea: { visualHook: 'Patung marmer Marcus Aurelius tetap tenang di tengah badai api', overlayText: 'TETAP KOKOH' }
			},
			{
				title: 'Kekuatan Berhenti Menyenangkan Semua Orang',
				category: 'curiosity_gap',
				categoryLabel: 'Keberanian Mental',
				ctrScore: 96,
				charCount: 44,
				isMobileFriendly: true,
				formulaExplanation: 'People pleasing adalah racun mental jutaan orang; judul ini menawarkan pembebasan.',
				thumbnailIdea: { visualHook: 'Stickman memotong tali boneka marionette dari tangannya sendiri', overlayText: 'BEBAS' }
			},
			{
				title: 'Amor Fati: Cintai Apapun yang Menghancurkanmu',
				category: 'short_punchy',
				categoryLabel: 'Filosofi Radikal',
				ctrScore: 95,
				charCount: 45,
				isMobileFriendly: true,
				formulaExplanation: 'Konsep Friedrich Nietzsche yang brutal namun membangkitkan mental pejuang.',
				thumbnailIdea: { visualHook: 'Prajurit Yunani berdiri tegak memandang kehancuran tanpa rasa takut', overlayText: 'TERIMA TAKDIR' }
			},
			{
				title: 'Kenapa Orang yang Paling Sedikit Bicara Sering Paling Ditakuti?',
				category: 'contrast',
				categoryLabel: 'Kontras & Karisma',
				ctrScore: 98,
				charCount: 62,
				isMobileFriendly: false,
				formulaExplanation: 'Dinamika kekuatan sosial: membedah karisma orang introvert yang dominan.',
				thumbnailIdea: { visualHook: 'Satu stickman diam bersedekap sementara yang lain sibuk memandang segan', overlayText: 'SENI DIAM' }
			}
		]
	},
	business_downfall: {
		id: 'business_downfall',
		label: '🏢 Kejatuhan & Skandal Raksasa Bisnis',
		desc: 'Kehancuran dinasti bisnis, perang brand, trik monopoli licik, kesalahan fatal CEO',
		offlineTitles: [
			{
				title: 'Bagaimana Kesalahan 10 Menit Menghancurkan Perusahaan 80 Miliar Dollar',
				category: 'high_stakes',
				categoryLabel: 'Kejatuhan Epik',
				ctrScore: 98,
				charCount: 70,
				isMobileFriendly: false,
				formulaExplanation: 'Kontras dramatis antara kesalahan sepele 10 menit dengan kehancuran raksasa bernilai triliunan.',
				thumbnailIdea: { visualHook: 'Logo perusahaan raksasa retak dan jatuh dari atas gedung pencakar langit', overlayText: '10 MENIT SAJA' }
			},
			{
				title: 'Trik Licik Supermarket yang Menguras Uangmu Tanpa Sadar',
				category: 'curiosity_gap',
				categoryLabel: 'Trik Bisnis',
				ctrScore: 97,
				charCount: 56,
				isMobileFriendly: true,
				formulaExplanation: 'Membongkar taktik manipulasi ritel sehari-hari yang dialami semua orang.',
				thumbnailIdea: { visualHook: 'Troli belanja dengan kaca pembesar menyorot jebakan harga palsu', overlayText: 'TERHIPNOTIS' }
			},
			{
				title: 'Kejatuhan Kodak: Ketika Sang Pelopor Membunuh Dirinya Sendiri',
				category: 'documentary',
				categoryLabel: 'Studi Kasus',
				ctrScore: 94,
				charCount: 61,
				isMobileFriendly: false,
				formulaExplanation: 'Ironi tragis dalam dunia bisnis: penemu kamera digital yang bangkrut karena kamera digital.',
				thumbnailIdea: { visualHook: 'Roll film tua terbakar dengan siluet kamera digital modern', overlayText: 'IRONI TERBESAR' }
			},
			{
				title: 'Malam di Mana Sang CEO Memutuskan Mundur.',
				category: 'short_punchy',
				categoryLabel: 'Short & Punchy',
				ctrScore: 95,
				charCount: 42,
				isMobileFriendly: true,
				formulaExplanation: 'Sangat atmosferik, misterius, dan memancing klik untuk mengetahui apa yang terjadi di malam itu.',
				thumbnailIdea: { visualHook: 'Kaca jendela ruang rapat malam hari dengan cangkir kopi tergeletak', overlayText: 'TITIK AKHIR' }
			}
		]
	},
	digital_trap: {
		id: 'digital_trap',
		label: '📱 Eksploitasi Medsos & Bahaya Digital',
		desc: 'Algoritma candu TikTok, mesin slot di kantongmu, manipulasi opini publik',
		offlineTitles: [
			{
				title: 'Kasino di Saku Celanamu: Bagaimana Medsos Memprogram Ulang Otak Kita',
				category: 'contrast',
				categoryLabel: 'Analogi Tajam',
				ctrScore: 98,
				charCount: 69,
				isMobileFriendly: false,
				formulaExplanation: 'Menyamakan smartphone dengan mesin kasino judi slot menciptakan kengerian yang nyata.',
				thumbnailIdea: { visualHook: 'Layar smartphone yang berputar seperti mesin slot kasino Vegas', overlayText: 'KAMU KECANDUAN' }
			},
			{
				title: 'Kenapa Kita Tidak Bisa Fokus Lebih dari 30 Detik Lagi?',
				category: 'curiosity_gap',
				categoryLabel: 'Krisis Mental',
				ctrScore: 97,
				charCount: 54,
				isMobileFriendly: true,
				formulaExplanation: 'Keresahan universal generasi digital yang attention span-nya hancur oleh short video.',
				thumbnailIdea: { visualHook: 'Otak terbelah menjadi fragmen video pendek 5 detik yang beterbangan', overlayText: 'FOKUS RUSAK' }
			},
			{
				title: 'Kebenaran Gelap di Balik Tombol "Disukai" (Like)',
				category: 'short_punchy',
				categoryLabel: 'Bongkar Rahasia',
				ctrScore: 96,
				charCount: 49,
				isMobileFriendly: true,
				formulaExplanation: 'Menyingkap psikologi engineering di balik fitur paling sederhana dalam sejarah internet.',
				thumbnailIdea: { visualHook: 'Jari menyentuh tombol like merah yang berujung kait pancingan ikan', overlayText: 'KAIL MERAH' }
			}
		]
	},
	social_dynamics: {
		id: 'social_dynamics',
		label: '🗣️ Relasi, Bahasa Tubuh & Karisma',
		desc: 'Seni disegani tanpa bicara, deteksi orang manipulatif, trik komunikasi',
		offlineTitles: [
			{
				title: '7 Ciri Orang Manipulatif yang Sering Dikira "Sangat Baik"',
				category: 'high_stakes',
				categoryLabel: 'Peringatan Relasi',
				ctrScore: 98,
				charCount: 56,
				isMobileFriendly: true,
				formulaExplanation: 'Memicu paranoia sosial yang sehat: membuat penonton mengevaluasi orang-orang di lingkaran mereka.',
				thumbnailIdea: { visualHook: 'Orang memegang topeng senyum malaikat sementara wajah aslinya dingin', overlayText: 'SERIGALA BULU DOMBA' }
			},
			{
				title: 'Seni Berbicara Agar Kata-Katamu Didengar Semua Orang',
				category: 'curiosity_gap',
				categoryLabel: 'Seni Karisma',
				ctrScore: 96,
				charCount: 52,
				isMobileFriendly: true,
				formulaExplanation: 'Keterampilan komunikasi otoritatif yang diidamkan setiap profesional dan pelajar.',
				thumbnailIdea: { visualHook: 'Satu stickman berbicara tenang sementara seluruh ruangan hening menyimak', overlayText: 'KATA BERTUAH' }
			},
			{
				title: 'Jangan Pernah Ceritakan 3 Hal Ini Kepada Siapapun.',
				category: 'short_punchy',
				categoryLabel: 'Short & Punchy',
				ctrScore: 97,
				charCount: 52,
				isMobileFriendly: true,
				formulaExplanation: 'Format larangan keras ("Jangan pernah...") selalu menghasilkan CTR di atas 10%.',
				thumbnailIdea: { visualHook: 'Jari telunjuk di depan bibir dengan gembok emas di mulut', overlayText: 'KUNCI RAPAT' }
			}
		]
	}
};

/**
 * Get offline titles for a category or topic
 */
function getOfflineViralTitles(categoryKey = 'wealth_finance', topic = '') {
	const cat = CATEGORY_DEFINITIONS[categoryKey] || CATEGORY_DEFINITIONS.wealth_finance;
	let baseList = [...cat.offlineTitles];

	// If a custom topic is provided, generate smart variations without rigid template repetition
	if (topic && topic.trim()) {
		const t = topic.trim();
		baseList.unshift(
			{
				title: `Kebenaran Tersembunyi Tentang ${t} yang Tidak Boleh Dibocorkan`,
				category: 'curiosity_gap',
				categoryLabel: 'Curiosity Gap',
				ctrScore: 98,
				charCount: `Kebenaran Tersembunyi Tentang ${t} yang Tidak Boleh Dibocorkan`.length,
				isMobileFriendly: false,
				formulaExplanation: 'Menyiratkan informasi rahasia berkategori tinggi yang berisiko jika diungkap.',
				thumbnailIdea: { visualHook: `Dokumen stempel merah tentang ${t} di meja gelap`, overlayText: 'DISEMBUNYIKAN' }
			},
			{
				title: `Semua yang Kamu Ketahui Tentang ${t} Ternyata Salah.`,
				category: 'contrast',
				categoryLabel: 'Kontras & Paradoks',
				ctrScore: 96,
				charCount: `Semua yang Kamu Ketahui Tentang ${t} Ternyata Salah.`.length,
				isMobileFriendly: true,
				formulaExplanation: 'Pattern interrupt menantang keyakinan penonton seketika.',
				thumbnailIdea: { visualHook: `Tanda silang merah besar di atas ilustrasi ${t}`, overlayText: 'SALAH BESAR' }
			}
		);
	}

	return baseList.slice(0, 10);
}

export async function POST({ request }) {
	try {
		const {
			category = 'wealth_finance',
			angle = 'all',
			topic = '',
			apiKey
		} = await request.json();

		const selectedCatKey = CATEGORY_DEFINITIONS[category] ? category : 'wealth_finance';
		const catMeta = CATEGORY_DEFINITIONS[selectedCatKey];
		const effectiveTopic = (topic || '').trim();
		const effectiveApiKey = apiKey && apiKey.trim().length > 10 ? apiKey.trim() : DEFAULT_DEEPSEEK_KEY;

		// If no DeepSeek key, return rich offline category titles immediately
		if (!effectiveApiKey) {
			const fallbackTitles = getOfflineViralTitles(selectedCatKey, effectiveTopic);
			return json({
				success: true,
				source: 'offline_engine',
				category: selectedCatKey,
				categoryLabel: catMeta.label,
				titles: fallbackTitles
			});
		}

		const systemPrompt = `Lo adalah mesin pembuat judul YouTube paling ganas di Indonesia. Satu-satunya standar lo: apakah judul ini bikin orang berhenti scroll dan klik dalam 0.3 detik?

${effectiveTopic ? `TOPIK: "${effectiveTopic}" — semua 10 judul HARUS tentang ini. Nggak ada toleransi untuk judul generik yang bisa berlaku untuk topik lain.` : `KATEGORI: ${catMeta.label}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GUT-CHECK TEST (wajib lolos sebelum submit)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sebelum nulis judul, tanya diri sendiri:
→ "Kalau gue lagi scroll HP jam 11 malam, apakah gue berhenti dan klik ini?"
→ "Apakah judul ini bikin gue ngerasa ada sesuatu yang gue nggak tahu tapi harusnya tahu?"
→ "Apakah ada kata yang bisa diganti lebih tajam?"
Kalau jawabannya "mungkin" atau "lumayan" — BUANG dan tulis ulang.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9 TRIGGER PSIKOLOGI KLIK YANG WORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. EGO ATTACK — Menyerang keyakinan penonton bahwa mereka sudah tahu
   BURUK: "Tips Mengelola Keuangan yang Baik"
   BAGUS: "Cara Lo Mengelola Uang Itu Salah."

2. PARANOIA TERKONTROL — Bikin penonton curiga pada lingkungan terdekatnya
   BURUK: "Ciri-Ciri Orang Tidak Jujur"
   BAGUS: "7 Tanda Orang yang Paling Kamu Percaya Sedang Memanfaatkanmu"

3. PARADOKS LOGIKA — Nabrak akal sehat yang sudah dipegang selama ini
   BURUK: "Kerja Keras Tidak Selalu Berhasil"
   BAGUS: "Makin Rajin Menabung, Makin Susah Kaya"

4. ANGKA SPESIFIK + DRAMA — Angka menciptakan kredibilitas, drama menciptakan urgensi
   BURUK: "Perusahaan Besar yang Bangkrut"
   BAGUS: "Keputusan 8 Menit yang Menghapus 47 Miliar Dolar dalam Semalam"

5. SINEMATIK PENDEK — Atmosfer, bukan penjelasan. < 38 karakter.
   BURUK: "Kisah Sedih Tentang Kegagalan"
   BAGUS: "Sebelum Lampu Kantornya Padam."

6. CURIOSITY GAP PERSONAL — Bukan "kenapa dunia begini" tapi "kenapa KAMU begini"
   BURUK: "Kenapa Orang Malas?"
   BAGUS: "Kenapa Kamu Tahu Apa yang Harus Dilakukan, Tapi Tidak Melakukannya?"

7. KONTRA-INTUITIF YANG NYATA — Bukan clickbait, tapi insight yang beneran membalik cara pikir
   BURUK: "Rahasia Sukses yang Disembunyikan"
   BAGUS: "Orang yang Nggak Punya Tujuan Hidup Sering Lebih Bahagia"

8. ORANG KETIGA MISTERIUS — "Mereka", "Dia", "Seseorang" menciptakan intrik tanpa nama
   BURUK: "Penelitian Tentang Perilaku Manusia"
   BAGUS: "Mereka Sudah Tahu Kamu Akan Menyesal."

9. TITIK BALIK DRAMATIS — Momen spesifik yang mengubah segalanya
   BURUK: "Perjalanan Sukses yang Inspiratif"
   BAGUS: "Di Rapat Itu, Semua Direktur Diam. Tidak Ada yang Tahu Perusahaan Tinggal 3 Hari."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ATURAN KERAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ BANNED WORDS: "Ternyata", "Viral", "Geger", "Heboh", "Bikin Melongo", "Wajib Tahu", "Luar Biasa", "Mengejutkan", "Fakta Menarik"
❌ Jangan awali lebih dari 2 judul dengan kata yang sama
❌ Jangan pakai struktur "X [hal/cara/tips] tentang Y" lebih dari 1 kali
❌ Jangan buat judul yang bisa di-generate ChatGPT tanpa konteks spesifik
✅ Panjang ideal: 35–58 karakter (nggak kepotong di mobile)
✅ Setiap judul harus pakai salah satu dari 9 trigger di atas, tulis trigger mana yang dipakai

FORMAT RESPONS — JSON murni tanpa markdown:
{
  "titles": [
    {
      "title": "judul yang beneran bikin stop-scroll",
      "category": "ego_attack | paranoia | paradoks | angka_drama | sinematik | curiosity_personal | kontra_intuitif | orang_ketiga | titik_balik",
      "categoryLabel": "nama trigger yang dipakai",
      "ctrScore": 95,
      "charCount": 52,
      "isMobileFriendly": true,
      "formulaExplanation": "Trigger psikologi apa yang dipake dan kenapa works buat penonton Indonesia.",
      "thumbnailIdea": {
        "visualHook": "Visual spesifik yang kontras dan sinematik — bukan deskripsi generik",
        "overlayText": "2-4 KATA KAPITAL YANG BEDA DARI JUDUL"
      }
    }
  ]
}`;

		let userContext = '';
		if (effectiveTopic) {
			userContext += `TOPIK: "${effectiveTopic}"\n\n`;
			userContext += `Buat 10 judul yang masing-masing menyerang topik ini dari sudut yang BERBEDA.\n`;
			userContext += `Bayangkan 10 orang berbeda dengan keresahan berbeda yang semuanya relate ke topik "${effectiveTopic}".\n`;
			userContext += `Setiap judul harus terasa seperti ditulis khusus untuk satu segmen penonton yang spesifik.\n\n`;
		} else {
			userContext += `Kategori: ${catMeta.label} — ${catMeta.desc}\n\n`;
		}
		if (angle && angle !== 'all') {
			userContext += `Angle prioritas: ${angle}\n\n`;
		}
		userContext += `Cek setiap judul dengan gut-check test sebelum submit. Kalau nggak bikin lo sendiri pengen klik — tulis ulang.`;

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
					{ role: 'user', content: userContext }
				],
				temperature: 1.05,
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			console.warn('DeepSeek title generator API warning, using offline category titles:', errText);
			const fallbackTitles = getOfflineViralTitles(selectedCatKey, effectiveTopic);
			return json({
				success: true,
				source: 'offline_engine',
				category: selectedCatKey,
				categoryLabel: catMeta.label,
				titles: fallbackTitles
			});
		}

		const data = await response.json();
		const rawContent = data.choices?.[0]?.message?.content;

		if (rawContent) {
			try {
				const parsed = JSON.parse(rawContent);
				if (parsed.titles && Array.isArray(parsed.titles) && parsed.titles.length > 0) {
					const sanitizedTitles = parsed.titles.map((t) => {
						const cleanTitle = (t.title || '').replace(/^["']|["']$/g, '').trim();
						const count = cleanTitle.length;
						return {
							title: cleanTitle,
							category: t.category || 'curiosity_gap',
							categoryLabel: t.categoryLabel || 'High-CTR Viral',
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
						category: selectedCatKey,
						categoryLabel: catMeta.label,
						titles: sanitizedTitles
					});
				}
			} catch (parseErr) {
				console.warn('JSON parsing error from title generator AI, using category fallback:', parseErr);
			}
		}

		// Fallback
		const fallbackTitles = getOfflineViralTitles(selectedCatKey, effectiveTopic);
		return json({
			success: true,
			source: 'offline_engine',
			category: selectedCatKey,
			categoryLabel: catMeta.label,
			titles: fallbackTitles
		});

	} catch (error) {
		console.error('Error in /api/generate-title:', error);
		const fallbackTitles = getOfflineViralTitles('wealth_finance', '');
		return json({
			success: true,
			source: 'emergency_fallback',
			titles: fallbackTitles
		});
	}
}
