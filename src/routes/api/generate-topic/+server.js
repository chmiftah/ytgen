import { json } from '@sveltejs/kit';

/**
 * Curated offline topic database across the 6 high-retention faceless YouTube niches
 */
const CURATED_TOPICS = [
	// 1. Misteri Kosmos & Sains
	{
		id: 'cosmos-1',
		category: 'cosmos_science',
		categoryLabel: 'Misteri Kosmos & Fisika',
		emoji: '🌌',
		title: 'Apa yang Terjadi Jika Waktu Berjalan Mundur di Ujung Black Hole?',
		angle: 'Curiosity Gap Teori Gravitasi Kuantum',
		hook10s: 'Di batas cakrawala peristiwa sebuah black hole, hukum fisika yang kita kenal berhenti berlaku. Namun ada satu kalkulasi matematis yang membuat para fisikawan merinding: waktu tidak berhenti... melainkan berputar balik.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'mystery',
		chapters: [
			{ number: 1, title: 'Cakrawala Peristiwa: Titik Tanpa Jalan Kembali', description: 'Membedah apa yang terjadi pada partikel cahaya saat tersedot gravitasi tak hingga' },
			{ number: 2, title: 'Paradoks Informasi Hawking', description: 'Mengapa materi yang hancur di dalam lubang hitam mengancam fondasi sains modern' },
			{ number: 3, title: 'Simulasi Waktu Terbalik', description: 'Mungkinkah ada semesta kembaran di sisi lain singularity di mana akhir adalah awal?' }
		],
		visualKeywords: 'black hole deep space event horizon galaxy singularity astrophysics 4k'
	},
	{
		id: 'cosmos-2',
		category: 'cosmos_science',
		categoryLabel: 'Misteri Kosmos & Fisika',
		emoji: '📡',
		title: 'Sinyal "Wow!" 1977: Pesan Terakhir dari Peradaban yang Sudah Punah?',
		angle: 'Investigasi Arsip Astronomi Observatorium Ohio',
		hook10s: 'Tepat 72 detik di tanggal 15 Agustus 1977, sebuah teleskop radio menangkap lonjakan gelombang elektromagnetik 30 kali lebih kuat dari radiasi kosmis mana pun. Dan hingga hari ini, tidak ada satu ilmuwan pun yang bisa menjelaskannya secara alami.',
		hookFormula: 'mystery_investigative',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Frekuensi 1420 Megahertz', description: 'Mengapa frekuensi hidrogen netral adalah kode universal komunikasi antarbintang' },
			{ number: 2, title: 'Pencarian Tanpa Jawaban Selama 45 Tahun', description: 'Upaya observatorium dunia melacak kembali konstelasi Sagitarius tanpa hasil' },
			{ number: 3, title: 'Hipotesis Hutan Gelap', description: 'Mungkinkah sinyal itu bukan undangan perkenalan, melainkan jeritan marabahaya?' }
		],
		visualKeywords: 'radio telescope observatory night sky stars galaxy space monitoring data'
	},
	{
		id: 'cosmos-3',
		category: 'cosmos_science',
		categoryLabel: 'Misteri Kosmos & Fisika',
		emoji: '🪐',
		title: 'Misteri Planet Sembilan: Raksasa Gelap yang Mengacaukan Sabuk Kuiper',
		angle: 'Anomali Orbit Tata Surya Terluar',
		hook10s: 'Miliaran kilometer di balik orbit Neptunus, ada sekelompok komet purba yang bergerak dengan sudut miring ganjil yang sama. Menurut kalkulasi Caltech, hanya ada satu penjelasan logis: sebuah planet monster seukuran 10 kali Bumi sedang bersembunyi di kegelapan abadi.',
		hookFormula: 'high_stakes',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Jejak Gravitasi Tak Kasat Mata', description: 'Bagaimana matematika mengungkap keberadaan objek sebelum teleskop dapat melihatnya' },
			{ number: 2, title: 'Primordial Black Hole?', description: 'Teori liar ilmuwan bahwa objek kesembilan bukan planet, melainkan lubang hitam purba seukuran apel' },
			{ number: 3, title: 'Perburuan di Vera Rubin Observatory', description: 'Teleskop generasi baru yang akan membuktikan misteri ini dalam waktu dekat' }
		],
		visualKeywords: 'solar system icy planet outer space kuiper belt dark celestial body telescope'
	},

	// 2. Arsip Rahasia & Sejarah
	{
		id: 'history-1',
		category: 'history_classified',
		categoryLabel: 'Arsip Rahasia & Sejarah',
		emoji: '🚢',
		title: 'Insiden Kapal SS Ourang Medan: Tragedi Maritim Indonesia yang Dihapus',
		angle: 'Misteri Arsip Laut Selat Malaka 1947',
		hook10s: 'Ketika tim penyelamat menaiki dek kapal kargo Belanda ini di perairan Selat Malaka, mereka menemukan seluruh kru tewas membeku dengan mata terbelalak menatap matahari... tanpa luka fisik sedikit pun.',
		hookFormula: 'mystery_investigative',
		suggestedTone: 'mystery',
		chapters: [
			{ number: 1, title: 'Kode Morf Terakhir: "Semua Petugas Telah Tewas"', description: 'Transkripsi transmisi radio darurat yang diterima kapal-kapal di Selat Malaka' },
			{ number: 2, title: 'Kargo Berbahaya yang Dirahasiakan', description: 'Dugaan muatan senjata kimia sisa Perang Dunia II yang bocor di lambung kapal' },
			{ number: 3, title: 'Ledakan Misterius & Pengaburan Arsip', description: 'Detik-detik kapal tenggelam sebelum otopsi resmi sempat dilakukan' }
		],
		visualKeywords: 'ghost ship foggy ocean old sea cargo shipwreck mysterious maritime storm'
	},
	{
		id: 'history-2',
		category: 'history_classified',
		categoryLabel: 'Arsip Rahasia & Sejarah',
		emoji: '📁',
		title: 'Proyek Stargate: Ketika CIA Menggunakan Cenayang untuk Perang Dingin',
		angle: 'Declassified CIA Remote Viewing Experiments',
		hook10s: 'Selama lebih dari dua puluh tahun, Pentagon diam-diam menggelontorkan dana jutaan dolar untuk melatih satu unit khusus: tentara yang diperintahkan melihat fasilitas nuklir Soviet hanya menggunakan kekuatan konsentrasi pikiran mereka.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Protokol Koordinat Buta', description: 'Metodologi ketat laboratorium Stanford untuk menguji fenomena remote viewing' },
			{ number: 2, title: 'Keberhasilan Tak Terduga: Menemukan Kapal Selam Soviet', description: 'Insiden ketika agen cenayang berhasil menggambar prototipe Typhoon sebelum satelit melihatnya' },
			{ number: 3, title: 'Penutupan Resmi atau Dialihkan ke Black Ops?', description: 'Mengapa proyek ini resmi ditutup tahun 1995 dan spekulasi program lanjutannya' }
		],
		visualKeywords: 'classified files retro cia laboratory typewriter analog radar military map secret'
	},
	{
		id: 'history-3',
		category: 'history_classified',
		categoryLabel: 'Arsip Rahasia & Sejarah',
		emoji: '🏛️',
		title: 'Kota Bawah Tanah Derinkuyu: Siapa yang Mereka Takuti Ribuan Tahun Lalu?',
		angle: 'Arkeologi Ekstrem Cappadocia',
		hook10s: 'Terkubur 85 meter di bawah tanah Turki, ada kota berlantai 18 lengkap dengan ventilasi udara, sumur air, dan pintu batu seberat 500 kilogram yang hanya bisa dikunci dari dalam. Pertanyaannya: ancaman semengerikan apa yang memaksa 20.000 manusia bersembunyi di bawah bumi?',
		hookFormula: 'provocative_question',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Arsitektur Ketahanan Bawah Tanah', description: 'Keajaiban teknik ventilasi dan keamanan kota bawah tanah Cappadocia' },
			{ number: 2, title: 'Teori Invasi Perang vs Bencana Katastropik', description: 'Apakah mereka lari dari pasukan musuh atau zaman es mendadak?' },
			{ number: 3, title: 'Terowongan Panjang Menuju Kota Lain', description: 'Penemuan lorong puluhan kilometer yang menghubungkan ratusan kompleks bawah tanah' }
		],
		visualKeywords: 'ancient underground city stone cave dark tunnel ancient civilization archeology torch'
	},

	// 3. Psikologi Gelap & Eksistensialisme
	{
		id: 'psych-1',
		category: 'dark_psychology',
		categoryLabel: 'Psikologi & Eksistensialisme',
		emoji: '🧠',
		title: 'The Hedonic Treadmill: Mengapa Otak Manusia Dirancang Agar Tidak Pernah Puas',
		angle: 'Biokimia Dopamin & Jebakan Kebahagiaan Modern',
		hook10s: 'Bahkan kalau rekening bank kamu besok pagi mendadak nambah 100 miliar rupiah, riset psikologi ngebuktiin kalau dalam 6 bulan, level bahagiamu bakal balik persis ke titik awal saat kamu belum punya apa-apa.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Ilusi Garis Finis Finansial', description: 'Studi komparasi pemenang lotre vs korban kecelakaan menurut Profesor Philip Brickman' },
			{ number: 2, title: 'Reset Kimiawi Dopamin', description: 'Mengapa otak mamalia berevolusi untuk mengejar hal baru ketimbang mensyukuri pencapaian' },
			{ number: 3, title: 'Cara Meretas Treadmill', description: 'Filosofi Stoikisme dan mindfulness untuk menghentikan perlombaan tanpa akhir' }
		],
		visualKeywords: 'running on treadmill city crowds brain dopamine luxury car lonely skyscraper'
	},
	{
		id: 'psych-2',
		category: 'dark_psychology',
		categoryLabel: 'Psikologi & Eksistensialisme',
		emoji: '🪞',
		title: 'Dunning-Kruger Effect: Mengapa Orang Kurang Kompeten Selalu Paling Percaya Diri',
		angle: 'Kebutaan Metakognitif Manusia',
		hook10s: 'Tragedi terbesar pikiran manusia bukanlah karena kita tidak tahu banyak hal. Tragedi terbesarnya adalah: ketidaktahuan kita justru menciptakan ilusi kepintaran mutlak yang membuat orang bodoh merasa seperti seorang jenius.',
		hookFormula: 'provocative_question',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Puncak Kebodohan (Mount Stupid)', description: 'Grafik psikologis mengapa sedikit pengetahuan menciptakan ledakan rasa percaya diri palsu' },
			{ number: 2, title: 'Lembah Keputusasaan (Valley of Despair)', description: 'Fase ketika orang pintar mulai menyadari betapa rumitnya realitas sebenarnya' },
			{ number: 3, title: 'Imposter Syndrome vs Dunning-Kruger', description: 'Mengapa para pakar sejati selalu merasa diri mereka masih kurang' }
		],
		visualKeywords: 'man looking in mirror thinking deep contemplation brain neural networks office'
	},
	{
		id: 'psych-3',
		category: 'dark_psychology',
		categoryLabel: 'Psikologi & Eksistensialisme',
		emoji: '⏳',
		title: 'Paradoks Pilihan: Mengapa Terlalu Banyak Opsi Menghancurkan Ketenangan Mental',
		angle: 'Beban Kognitif di Era Hiper-Pilihan',
		hook10s: 'Manusia modern memiliki ribuan pilihan karir, makanan, hiburan, dan pasangan di ujung jari mereka. Namun statistik medis menunjukkan tingkat depresi dan kecemasan generasi ini adalah yang tertinggi dalam sejarah peradaban.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Eksperimen Selai Jam Harvard', description: 'Bagaimana opsi berlebih melumpuhkan kemampuan manusia untuk mengambil keputusan' },
			{ number: 2, title: 'FOMO dan Penyesalan Antisipatif', description: 'Mengapa setiap keputusan yang kita ambil selalu dihantui oleh peluang yang kita abaikan' },
			{ number: 3, title: 'Prinsip Satisficer vs Maximizer', description: 'Satu aturan sederhana untuk memilih cukup daripada mengejar kesempurnaan palsu' }
		],
		visualKeywords: 'supermarket endless shelves smartphone scrolling anxiety city traffic blur abstract'
	},

	// 4. Geopolitik & Skandal Megakorporasi
	{
		id: 'geo-1',
		category: 'geopolitics_business',
		categoryLabel: 'Geopolitik & Megakorporasi',
		emoji: '🏭',
		title: 'Perang Silikon: Bagaimana Satu Pabrik di Taiwan Menyandera Seluruh Ekonomi Bumi',
		angle: 'Monopoli Semikonduktor TSMC & ASML',
		hook10s: 'Jika ada satu pabrik seluas beberapa hektar di Hsinchu, Taiwan yang mendadak berhenti beroperasi hari ini, maka industri otomotif, smartphone, bank, dan militer di seluruh penjuru dunia akan runtuh dalam hitungan minggu.',
		hookFormula: 'high_stakes',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Monopoli 3 Nanometer', description: 'Mengapa tidak ada satu pun negara adidaya yang mampu meniru fasilitas TSMC' },
			{ number: 2, title: 'Mesin Lithografi ASML Seharga 3 Triliun', description: 'Teknologi sinar laser ekstrem Belanda yang menjadi kunci produksi mikrochip tercanggih' },
			{ number: 3, title: 'Perisai Silikon: Geopolitik Selat Taiwan', description: 'Mengapa mikrochip menjadi penentu perang dan perdamaian dua kekuatan dunia' }
		],
		visualKeywords: 'microchip fabrication cleanroom semiconductor high tech factory computer motherboard'
	},
	{
		id: 'geo-2',
		category: 'geopolitics_business',
		categoryLabel: 'Geopolitik & Megakorporasi',
		emoji: '🏦',
		title: 'BlackRock & Vanguard: Siapa Pemilik Sebenarnya dari Hampir Semua Perusahaan di Dunia?',
		angle: 'Konglomerasi Keuangan Pasif 20 Triliun Dolar',
		hook10s: 'Dari Apple, Microsoft, sampai camilan yang ada di mejamu sekarang... ada dua raksasa keuangan Wall Street yang diam-diam memegang saham terbesar di hampir semua perusahaan itu. Dan anehnya, jarang banget orang yang tahu nama mereka.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Kekuatan Algoritma Aladdin', description: 'Sistem superkomputer BlackRock yang mengelola aset lebih besar dari PDB sebagian besar negara' },
			{ number: 2, title: 'Revolusi Index Fund & Kepemilikan Pasif', description: 'Bagaimana uang pensiun ratusan juta warga dunia terpusat pada segelintir pengelola aset' },
			{ number: 3, title: 'Hak Suara di Rapat Direksi Global', description: 'Apakah konsentrasi kepemilikan modal ini membatasi kompetisi pasar bebas?' }
		],
		visualKeywords: 'wall street skyscraper financial district stock market stock exchange trading screens'
	},
	{
		id: 'geo-3',
		category: 'geopolitics_business',
		categoryLabel: 'Geopolitik & Megakorporasi',
		emoji: '🛢️',
		title: 'Kutukan Minyak Nauru: Kisah Negara Terkaya di Bumi yang Berubah Jadi Gurun Tandus',
		angle: 'Tragedi Eksploitasi Fosfat Pulau Pasifik',
		hook10s: 'Pada tahun 1970-an, setiap warga di pulau kecil ini memiliki mobil mewah dan tidak perlu membayar pajak sepeser pun karena cadangan fosfat terkaya di dunia. Namun hari ini, pulau itu berubah menjadi dataran kapur mati dan bangkrut total.',
		hookFormula: 'in_media_res',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Harta Karun Kotoran Burung Purba', description: 'Bagaimana guano jutaan tahun mengubah pulau kecil Pasifik menjadi surga uang kilat' },
			{ number: 2, title: 'Kemewahan Gila & Pemborosan Negara', description: 'Ketika pemerintah menyewa pesawat Boeing hanya untuk belanja makan malam di luar negeri' },
			{ number: 3, title: 'Ketika Tambang Mengering', description: 'Pelajaran pahit ketika 80 persen daratan rusak total dan uang tabungan lenyap diinvestasi bodong' }
		],
		visualKeywords: 'island aerial mining excavator desert wasteland luxury abandon car ruins'
	},

	// 5. Masa Depan AI & Bahaya Teknologi
	{
		id: 'ai-1',
		category: 'extreme_ai',
		categoryLabel: 'Masa Depan AI & Teknologi',
		emoji: '🤖',
		title: 'Dead Internet Theory: Apakah 70% Aktivitas Media Sosial Digerakkan oleh Bot?',
		angle: 'Sintesis Konten Otomatis & Keruntuhan Ruang Publik Digital',
		hook10s: 'Coba perhatiin kolom komentar di medsos kamu: pola kalimatnya mirip-mirip, akunnya tanpa foto asli, dan perdebatan sengit yang tampak ganjil. Pernah mikir nggak, mungkinkah sebagian besar isi internet yang kita tonton hari ini sebenernya udah bukan manusia lagi?',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'mystery',
		chapters: [
			{ number: 1, title: 'Lahirnya Pabrik Akun Palsu', description: 'Evolusi bot dari sekadar spam link murahan menjadi agen percakapan berbasis LLM yang meyakinkan' },
			{ number: 2, title: 'Algoritma Umpan Kemarahan (Ragebait)', description: 'Mengapa platform sosial membiarkan bot menyulut emosi agar durasi retensi layar meningkat' },
			{ number: 3, title: 'Model Collapse: Saat AI Memakan AI', description: 'Apa yang terjadi ketika internet kehabisan teks buatan manusia dan mulai membusuk dari dalam' }
		],
		visualKeywords: 'server room matrix code blue light cyber cyberspace typing dark internet'
	},
	{
		id: 'ai-2',
		category: 'extreme_ai',
		categoryLabel: 'Masa Depan AI & Teknologi',
		emoji: '👁️',
		title: 'Titik Singularitas: Momen Ketika AI Mulai Memperbaiki Dirinya Sendiri',
		angle: 'Recursive Self-Improvement & Ledakan Kecerdasan',
		hook10s: 'Begitu sebuah algoritma mampu menulis kode versi dirinya yang 1% lebih pintar, algoritma versi baru itu akan membuat versi yang 2% lebih pintar lagi. Dan proses ini tidak akan memakan waktu dekade... melainkan dalam hitungan menit.',
		hookFormula: 'high_stakes',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Batas Akhir Pemrograman Manusia', description: 'Mengapa manusia adalah mata rantai paling lambat dalam siklus evolusi software' },
			{ number: 2, title: 'Ledakan Eksponensial (Intelligence Explosion)', description: 'Konsep I.J. Good tentang mesin cerdas pertama sebagai penemuan terakhir yang perlu diciptakan manusia' },
			{ number: 3, title: 'Masalah Penyelarasan Nilai (Alignment Problem)', description: 'Bagaimana memastikan kecerdasan super tetap menghargai kelangsungan hidup spesies kita' }
		],
		visualKeywords: 'futuristic artificial intelligence neural network glowing cyber brain quantum computer'
	},
	{
		id: 'ai-3',
		category: 'extreme_ai',
		categoryLabel: 'Masa Depan AI & Teknologi',
		emoji: '🎯',
		title: 'Autonomous Weapons: Ketika Drone Diberi Kuasa Menarik Pelatuk Sendiri',
		angle: 'Etika Militer AI di Medan Tempur Modern',
		hook10s: 'Di langit zona konflik modern, drone-drone mikro berbiaya murah kini tidak lagi menunggu instruksi pilot manusia. Kamera sensor mereka memindai wajah, mengunci target dengan algoritma pengenalan citra, dan mengeksekusi serangan dalam sekejap mata.',
		hookFormula: 'in_media_res',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Hapus Manusia dari Loop Keputusan', description: 'Mengapa kecepatan komputasi militer memaksa komandan menyerahkan keputusan pada AI' },
			{ number: 2, title: 'Swarm Intelligence: Ribuan Drone Berkoordinasi', description: 'Bagaimana taktik kawanan serangga diadopsi untuk menghancurkan pertahanan udara' },
			{ number: 3, title: 'Siapa yang Bertanggung Jawab Atas Kejahatan Perang Algoritma?', description: 'Kekosongan hukum internasional mengenai akuntabilitas mesin pembunuh otonom' }
		],
		visualKeywords: 'military drone flying night sky radar military base targeting thermal camera'
	},

	// 6. Detik-Detik Krusial Penentu Takdir
	{
		id: 'critical-1',
		category: 'critical_moments',
		categoryLabel: 'Detik-Detik Krusial Penentu Takdir',
		emoji: '☢️',
		title: '24 Jam Sebelum Chernobyl Meledak: Rantai Keputusan Fatal di Ruang Kontrol 4',
		angle: 'Kronologi Menit Demi Menit Menuju Bencana Nuklir 1986',
		hook10s: 'Pukul 01:23 dini hari tanggal 26 April 1986, operator reaktor menekan tombol darurat AZ-5 untuk mematikan reaktor. Mereka tidak pernah tahu bahwa tombol penyelamat itulah yang justru memicu ledakan terbesar dalam sejarah energi nuklir.',
		hookFormula: 'in_media_res',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Uji Coba Keselamatan yang Tertunda', description: 'Tekanan birokrasi dan pergantian shift operator yang tidak berpengalaman' },
			{ number: 2, title: 'Efek Keracunan Xenon pada Reaktor', description: 'Kondisi instabil kimiawi inti reaktor yang diabaikan demi menyelesaikan pengujian' },
			{ number: 3, title: 'Cacat Fatal Batang Kendali Grafit', description: 'Bagaimana ujung batang grafit memicu lonjakan uap dahsyat saat tombol darurat ditekan' }
		],
		visualKeywords: 'nuclear control room analog gauges pipes radiation reactor cooling tower'
	},
	{
		id: 'critical-2',
		category: 'critical_moments',
		categoryLabel: 'Detik-Detik Krusial Penentu Takdir',
		emoji: '🌊',
		title: 'Tenggelamnya Titanic: 5 Kelalaian Kecil yang Berujung Bencana Terbesar di Lautan',
		angle: 'Anatomi Rantai Kesalahan di Malam Tenang 14 April 1912',
		hook10s: 'Bukan gunung es yang menenggelamkan Titanic. Gunung es hanyalah pukulan terakhir dari serangkaian kelalaian sepele: kunci teropong yang hilang, telegram peringatan es yang diabaikan, dan perintah kemudi mundur yang salah kaprah.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'documentary',
		chapters: [
			{ number: 1, title: 'Malam Tanpa Riak Ombak', description: 'Mengapa laut yang terlalu tenang di Atlantik Utara membuat pengawas tidak melihat buih es di kejauhan' },
			{ number: 2, title: 'Enam Kompartemen yang Robek', description: 'Desain sekat kedap air yang tidak cukup tinggi untuk menahan aliran air laut yang membeku' },
			{ number: 3, title: 'Kapal SS Californian yang Tertidur', description: 'Misteri kapal terdekat yang melihat suar darurat Titanic tapi tidak menyalakan radio komunikasi' }
		],
		visualKeywords: 'iceberg in foggy ocean dark freezing water vintage ocean liner ship deck night'
	},
	{
		id: 'finance-1',
		category: 'finance_geopolitics',
		categoryLabel: 'Finansial & Realitas Dunia',
		emoji: '🏦',
		title: 'Siapa Sebenarnya yang Menguasai Perusahaan Terbesar di Muka Bumi?',
		angle: 'Membongkar Raksasa Pengelola Dana Wall Street',
		hook10s: 'Dari Apple, Microsoft, sampai minuman yang ada di mejamu sekarang... ada dua raksasa keuangan di Wall Street yang diam-diam memegang saham terbesar di hampir semua perusahaan itu. Dan anehnya, jarang banget orang yang tahu nama mereka.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Dua Nama di Balik Tirai', description: 'Kekuatan dana triliunan dolar BlackRock dan Vanguard di bursa global' },
			{ number: 2, title: 'Ilusi Kompetisi Merek', description: 'Merek-merek yang tampak bersaing sengit tapi dimiliki oleh pemodal yang sama' },
			{ number: 3, title: 'Sistem Aladdin dan Kendali Algoritma', description: 'Bagaimana superkomputer pengelola risiko mengatur aliran dana dunia' }
		],
		visualKeywords: 'wall street skyscraper financial stock market trading screens money boardroom'
	},
	{
		id: 'finance-2',
		category: 'finance_geopolitics',
		categoryLabel: 'Finansial & Realitas Dunia',
		emoji: '🌐',
		title: 'Dead Internet Theory: Apakah Mayoritas Internet Sudah Bukan Manusia Lagi?',
		angle: 'Investigasi Bot Traffic & AI Generatif',
		hook10s: 'Coba perhatiin kolom komentar di medsos kamu: pola kalimatnya mirip-mirip, akunnya tanpa foto asli, dan perdebatannya janggal banget. Pernah mikir nggak, mungkinkah sebagian besar isi internet yang kita tonton hari ini sebenernya udah bukan manusia lagi?',
		hookFormula: 'mystery_investigative',
		suggestedTone: 'mystery',
		chapters: [
			{ number: 1, title: 'Awal Mula Teori Internet Mati', description: 'Asal usul hipotesis bahwa konten organik manusia mulai tergeser oleh bot' },
			{ number: 2, title: 'Lalu Lintas Bot yang Mendominasi', description: 'Data riset keamanan siber tentang persentase traffic non-manusia di web' },
			{ number: 3, title: 'Masa Depan Interaksi Digital', description: 'Ketika AI melatih dirinya sendiri dari data buatan AI lain tanpa campur tangan manusia' }
		],
		visualKeywords: 'matrix code digital cyber server room glitch robotic typing social media bots'
	},
	{
		id: 'finance-3',
		category: 'finance_geopolitics',
		categoryLabel: 'Finansial & Realitas Dunia',
		emoji: '💎',
		title: 'Ilusi Nilai Berlian: Kampanye Paling Sukses yang Mengelabui Seluruh Dunia',
		angle: 'Monopoli Kartel dan Rekayasa Persepsi',
		hook10s: 'Berlian sebenernya nggak selangka itu di perut bumi. Fakta uniknya: alasan kenapa batu kecil ini bisa dihargai ratusan juta rupiah cuma karena ada satu perusahaan yang berhasil ngibulin seluruh dunia lewat iklan di tahun 1947.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Tambang Afrika Selatan & Kartel De Beers', description: 'Cara raksasa tambang mengunci stok berlian di gudang agar harga tetap meroket' },
			{ number: 2, title: 'Slogan "A Diamond is Forever"', description: 'Bagaimana biro iklan Madison Avenue menciptakan mitos cincin lamaran' },
			{ number: 3, title: 'Kemunculan Berlian Sintetis Lab', description: 'Teknologi modern yang akhirnya membongkar monopoli puluhan tahun' }
		],
		visualKeywords: 'diamond luxury jewelry ring sparkling dark background gold vault'
	},

	// 5. Biohacking & Kebiasaan
	{
		id: 'biohack-1',
		category: 'biohacking_habits',
		categoryLabel: 'Kesehatan & Obrolan Keseharian',
		emoji: '☀️',
		title: 'Protokol Pagi: Efek Nggak Terduga Menatap Layar HP Pas Baru Bangun',
		angle: 'Neurologi Jam Sirkadian & Dopamin Pagi',
		hook10s: 'Pernah nggak kamu ngerasa, baru bangun tidur dan tanganmu langsung refleks ngambil ponsel? Coba bayangin, lima menit pertama setelah melek itu yang bakal nentuin apakah seharian ini kamu bakal produktif atau malah gampang stres dan mager.',
		hookFormula: 'provocative_question',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Gelombang Otak Pasca Tidur', description: 'Mengapa otak saat bangun sangat mudah terpicu kecemasan akibat notifikasi' },
			{ number: 2, title: 'Cahaya Matahari vs Sinar Biru Layar', description: 'Sains di balik aktivasi hormon kortisol alami melalui sel ganglion retina' },
			{ number: 3, title: 'Tiga Puluh Menit Pertama Tanpa Gadget', description: 'Langkah sederhana yang membuat pikiran jauh lebih tenang dan fokus seharian' }
		],
		visualKeywords: 'morning sunlight window wake up stretching fresh air nature peaceful coffee'
	},
	{
		id: 'biohack-2',
		category: 'biohacking_habits',
		categoryLabel: 'Kesehatan & Obrolan Keseharian',
		emoji: '⚡',
		title: 'The Two-Minute Rule: Cara Paling Mudah Membunuh Rasa Malas dan Nunda Kerja',
		angle: 'Psikologi Momentum & Friksi Kebiasaan',
		hook10s: 'Masalah terbesar kita waktu nunda pekerjaan sebenernya bukan karena tugasnya susah, tapi karena otak kita ngerasa mulai itu berat banget. Nah, ada trik dua menit yang bikin otakmu tertipu buat langsung mulai tanpa rasa malas.',
		hookFormula: 'curiosity_gap',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Hukum Pertama Newton untuk Produktivitas', description: 'Mengapa benda diam cenderung tetap diam dan butuh dorongan kecil awal' },
			{ number: 2, title: 'Menurunkan Ambang Rintangan', description: 'Cara mengecilkan skala tugas agar otak tidak mendeteksinya sebagai beban' },
			{ number: 3, title: 'Efek Bola Salju Konsistensi', description: 'Bagaimana dua menit membaca bisa berlanjut menjadi satu bab utuh tanpa paksaan' }
		],
		visualKeywords: 'person writing desk focus clock timer coffee reading book productivity'
	},
	{
		id: 'biohack-3',
		category: 'biohacking_habits',
		categoryLabel: 'Kesehatan & Obrolan Keseharian',
		emoji: '🌙',
		title: 'Rahasia Tidur Berkualitas: Mengapa Kamu Sering Capek Meski Sudah Tidur 8 Jam',
		angle: 'Siklus REM, Suhu Tubuh & Kualitas Deep Sleep',
		hook10s: 'Pernah nggak kamu udah tidur cukup delapan jam, tapi pas bangun paginya badan malah tambah lemas dan pegal-pegal? Nah, ternyata lama tidur itu nggak ada artinya kalau siklus deep sleep kamu terus-terusan keganggu hal sepele ini.',
		hookFormula: 'provocative_question',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Kuantitas vs Kualitas Tidur', description: 'Memahami siklus 90 menit dan pentingnya gelombang delta otak' },
			{ number: 2, title: 'Suhu Kamar dan Melatonin', description: 'Mengapa tubuh manusia butuh penurunan suhu untuk masuk ke fase lelap' },
			{ number: 3, title: 'Protokol Tiga Jam Sebelum Tidur', description: 'Panduan makan malam, pencahayaan redup, dan relaksasi pikiran' }
		],
		visualKeywords: 'peaceful bedroom night sleep dark ambient blue light relaxation moon'
	},

	// 6. Investigasi Sains & Bencana Teknologi
	{
		id: 'disaster-1',
		category: 'disaster_tech',
		categoryLabel: 'Cerita Bencana & Investigasi',
		emoji: '🚀',
		title: 'Tragedi Pesawat Ulang-Alik Challenger: Kesalahan Konyol yang Diabaikan',
		angle: 'Birokrasi dan Arogansi Manajemen',
		hook10s: 'Malam sebelum peluncuran, para insinyur roket udah memohon ke pimpinan manajemen buat ngebatalin misi karena suhu beku bakal bikin segel karet getas. Tapi karena gengsi dan jadwal ketat, peringatan itu diabaikan sampai akhirnya tragedi fatal terjadi di depan jutaan mata.',
		hookFormula: 'high_stakes',
		suggestedTone: 'storytelling',
		chapters: [
			{ number: 1, title: 'Peringatan Dingin di Malam Terakhir', description: 'Transkrip perdebatan sengit antara insinyur Morton Thiokol dan manajer proyek' },
			{ number: 2, title: 'Detik Ketujuh Puluh Tiga di Langit Florida', description: 'Kronologi kegagalan teknis O-ring dan terbakarnya tangki hidrogen eksternal' },
			{ number: 3, title: 'Investigasi Richard Feynman dan Gelas Es', description: 'Demonstrasi legendaris fisikawan Feynman yang membongkar arogansi sistem di depan pers' }
		],
		visualKeywords: 'space shuttle launch pad smoke cloud rocket launch astronaut control room'
	}
];

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { category = 'all', keyword = '', apiKey = '' } = body;

		// If DeepSeek API key is present and keyword is specific, try calling DeepSeek for custom fresh ideas
		if (apiKey && apiKey.trim().length > 5) {
			try {
				const promptCategory = category === 'all' ? 'Topik viral YouTube bernilai tinggi' : category;
				const systemPrompt = `Lo adalah Produser Konten YouTube kelas dunia dan Storyteller jago untuk kanal video YouTube bercerita santai (kayak gaya Ferry Irwandi, Hujan Tanda Tanya, Kok Bisa, atau Raditya Dika bercerita).
Tugas lo: Kasih 3 ide video YouTube berdurasi panjang (16:9) dengan gaya bercerita santai, seru, CTR tinggi, dan retensi penonton maksimal.

PANDUAN GAYA BAHASA & PENULISAN:
- Gaya Bahasa: Santai, seru, dan asyik seperti orang yang sedang bercerita langsung ke teman (hindari bahasa formal/kaku seperti skripsi atau makalah).
- Gunakan kata ganti "kamu" atau "kita". DILARANG menggunakan kata "Anda".
- Hook 10 detik pertama harus santai tapi memicu rasa penasaran besar (misal: "Pernah nggak kamu kepikiran...", "Coba bayangin...", "Dan yang bikin kaget...").
- Pembagian bab (BAB 01, BAB 02, BAB 03) bertema seru dan mengalir santai.

Balas HANYA dengan JSON array valid (tanpa markdown formatting backticks, langsung parseable JSON):
[
  {
    "id": "deepseek-1",
    "category": "${category}",
    "categoryLabel": "Nama Kategori",
    "emoji": "ikon",
    "title": "Judul Menarik & Bikin Penasaran (Maksimal 12-14 kata, santai & mengundang klik)",
    "angle": "Sudut Pandang Unik / Curiosity Gap Santai",
    "hook10s": "Kalimat pembuka 10 detik pertama santai yang langsung bikin penonton penasaran dan enggan skip",
    "hookFormula": "curiosity_gap | high_stakes | mystery_investigative | in_media_res | provocative_question",
    "suggestedTone": "storytelling | mystery | casual",
    "chapters": [
      { "number": 1, "title": "Judul Bab 1", "description": "Ringkasan premis bab 1 yang seru" },
      { "number": 2, "title": "Judul Bab 2", "description": "Ringkasan konflik atau rahasia di bab 2" },
      { "number": 3, "title": "Judul Bab 3", "description": "Klimaks / pesan menarik di bab 3" }
    ],
    "visualKeywords": "5-8 kata kunci pencarian stock footage di Pexels bahasa Inggris"
  }
]`;

				const userPrompt = `Buatkan 3 ide topik video terbaik untuk kategori: "${promptCategory}"${keyword ? `, dengan fokus kata kunci: "${keyword}"` : ''}. Pastikan judul dan hook ditulis santai seperti orang bercerita seru, relatable, dan membuat penonton tidak mau skip!`;

				const res = await fetch('https://api.deepseek.com/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${apiKey.trim()}`
					},
					body: JSON.stringify({
						model: 'deepseek-chat',
						messages: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: userPrompt }
						],
						temperature: 0.85
					})
				});

				if (res.ok) {
					const data = await res.json();
					let rawContent = data.choices?.[0]?.message?.content || '';
					rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

					const parsed = JSON.parse(rawContent);
					if (Array.isArray(parsed) && parsed.length > 0) {
						return json({ success: true, topics: parsed, source: 'deepseek' });
					}
				}
			} catch (apiErr) {
				console.warn('DeepSeek topic generation failed, falling back to curated library:', apiErr.message);
			}
		}

		// Curated fallback logic
		let candidates = [...CURATED_TOPICS];

		// Filter by category if specified
		if (category && category !== 'all') {
			candidates = candidates.filter((item) => item.category === category);
			if (candidates.length === 0) {
				candidates = [...CURATED_TOPICS];
			}
		}

		// Filter or boost by keyword if provided
		if (keyword && keyword.trim()) {
			const kw = keyword.toLowerCase().trim();
			const keywordMatched = candidates.filter(item => 
				item.title.toLowerCase().includes(kw) ||
				item.angle.toLowerCase().includes(kw) ||
				item.hook10s.toLowerCase().includes(kw) ||
				item.categoryLabel.toLowerCase().includes(kw)
			);
			if (keywordMatched.length >= 2) {
				candidates = keywordMatched;
			}
		}

		// Shuffle candidates and pick 3-4 topics
		const shuffled = [...candidates].sort(() => 0.5 - Math.random());
		const selected = shuffled.slice(0, 3);

		return json({
			success: true,
			topics: selected,
			source: 'curated'
		});

	} catch (err) {
		console.error('Error in /api/generate-topic:', err);
		return json({ error: err.message || 'Internal error' }, { status: 500 });
	}
}
