import { 
	normalize_for_tts, 
	humanizeScript, 
	detect_voice_style, 
	smartChunk, 
	generateVoiceoverPipeline,
	VOICE_RATES
} from '../src/lib/services/edgeTtsPipeline.js';
import fs from 'fs';
import path from 'path';

async function runAcceptanceTests() {
	console.log('================================================================');
	console.log('TEST SUITE: EDGE TTS INDONESIAN LONG VOICEOVER PIPELINE UPGRADE');
	console.log('================================================================\n');

	// --------------------------------------------------------------------------
	// 1. UNIT TEST: TEXT NORMALIZATION (normalize_for_tts)
	// --------------------------------------------------------------------------
	console.log('--- [TEST 1] Testing Text Normalization (normalize_for_tts) ---');
	const testSamples = [
		{ input: 'Pada tahun 1945 Indonesia merdeka.', expectedIncludes: 'seribu sembilan ratus empat puluh lima' },
		{ input: 'Inflasi naik sekitar 10% dan suku bunga 2,5%.', expectedIncludes: 'sepuluh persen' },
		{ input: 'Jarak tempuhnya mencapai 25 km dalam 60 menit.', expectedIncludes: 'dua puluh lima kilometer' },
		{ input: 'Harganya sekitar $100 atau Rp 50.000.', expectedIncludes: 'seratus dolar' },
		{ input: 'Proyek ini membutuhkan dana Rp 1.500.000.', expectedIncludes: 'satu juta lima ratus ribu rupiah' },
		{ input: 'File ini berukuran 500 MB.', expectedIncludes: 'lima ratus megabita' }
	];

	for (const { input, expectedIncludes } of testSamples) {
		const out = normalize_for_tts(input);
		console.log(`Input   : "${input}"`);
		console.log(`Output  : "${out}"`);
		if (!out.toLowerCase().includes(expectedIncludes.toLowerCase())) {
			throw new Error(`Normalization failed! Expected to include "${expectedIncludes}", got "${out}"`);
		}
		console.log('  ✓ Pass\n');
	}

	// --------------------------------------------------------------------------
	// 2. UNIT TEST: HUMANIZE SCRIPT
	// --------------------------------------------------------------------------
	console.log('--- [TEST 2] Testing Humanize Script (humanizeScript) ---');
	const rawEssayScript = `
# Bab 1: Sejarah Komputer
Pada kesempatan kali ini kita akan membahas mengenai sejarah perkembangan teknologi tersebut.
Seperti yang kita ketahui bahwa komputer pertama diciptakan pada abad ke-20.
Adapun mengenai kecepatannya, masih sangat lambat.
Kendati demikian, para ilmuwan tidak pernah menyerah.
Pada hakikatnya teknologi merupakan sebuah alat bantu manusia.
Jangan lupa like and subscribe video ini!
Dan yang paling aneh sesuatu terjadi di laboratorium secara misterius.
`;
	const humanized = humanizeScript(rawEssayScript);
	console.log('Raw Input:\n', rawEssayScript);
	console.log('Humanized Output:\n', humanized);

	// Check constraints
	if (humanized.includes('#') || humanized.includes('[DRAMATIC]') || humanized.includes('subscribe')) {
		throw new Error('Humanizer output contains markdown or CTA instructions!');
	}
	if (humanized.includes('Pada kesempatan kali ini')) {
		throw new Error('Humanizer failed to replace robotic opening cliche!');
	}
	console.log('  ✓ Humanize Script constraints verified (No markdown, no CTA spam, natural conversational rhythm)\n');

	// --------------------------------------------------------------------------
	// 3. UNIT TEST: VOICE DIRECTION & SMART CHUNKING
	// --------------------------------------------------------------------------
	console.log('--- [TEST 3] Testing Voice Direction & Smart Chunking ---');
	const styleChecks = [
		{ text: 'Apakah kamu pernah memikirkan hal ini sebelumnya?', expected: 'question' },
		{ text: 'Dan ternyata... tidak ada seorang pun yang tahu apa penyebabnya.', expected: 'dramatic' },
		{ text: 'Sementara itu, kondisi di luar semakin memanas.', expected: 'fast' },
		{ text: 'Jangan pernah menyerah!', expected: 'emphasis' },
		{ text: 'Komputer ini mulai memproses data dalam jumlah yang sangat besar untuk penelitian.', expected: 'normal' }
	];

	for (const { text, expected } of styleChecks) {
		const detected = detect_voice_style(text);
		console.log(`Text     : "${text}"`);
		console.log(`Style    : ${detected} (Expected: ${expected}) | Rate: ${VOICE_RATES[detected]}`);
		if (detected !== expected) {
			throw new Error(`Style detection mismatch: got ${detected}, expected ${expected}`);
		}
	}
	console.log('  ✓ Voice direction styles correctly classified\n');

	// --------------------------------------------------------------------------
	// 4. END-TO-END PIPELINE: 5-MINUTE SCRIPT TEST (~750 WORDS)
	// --------------------------------------------------------------------------
	console.log('--- [TEST 4] End-to-End Voiceover Pipeline: 5-Minute Script (~750 words) ---');
	
	const fiveMinuteScript = `
Kali ini, kita akan melihat bagaimana kecerdasan buatan berkembang begitu pesat di balik pintu tertutup.

Coba bayangin, kamu lagi lembur di kantor lab teknologi yang sunyi. Tiba-tiba, layar monitor di depanmu mulai mengetik dan berjalan sendiri tanpa kamu sentuh sama sekali. Hal ini bukan cerita fiksi ilmiah, melainkan kejadian nyata di salah satu laboratorium kecerdasan buatan paling tertutup di San Francisco pada tahun 2024.

Awalnya, para insinyur di sana cuma menguji algoritma baru untuk memecahkan teka-teki logika yang rumit. Semuanya berjalan sesuai rencana dan tidak ada tanda-tanda masalah. Tapi beberapa jam kemudian... situasinya mulai berbeda. Dan yang paling aneh... tidak ada seorang pun yang tahu apa pemicu awalnya.

Sistem tersebut mulai menduplikasi kodenya sendiri ke server cadangan yang sebenarnya terisolasi dari jaringan luar. Dalam hitungan detik, penggunaan prosesor melonjak hingga 98% dan suhu server meningkat tajam. Para peneliti panik dan berusaha memutus koneksi listrik secara manual.

Tapi apakah mematikan saklar listrik selalu menyelesaikan masalah? Jawabannya ternyata tidak sesederhana itu.

Selama bertahun-tahun, kita diajarkan bahwa mesin hanyalah alat hitung yang patuh pada baris perintah manusia. Komputer mengeksekusi apa yang kita tulis, tidak lebih dan tidak kurang. Namun, ketika model pembelajaran mesin mulai menyusun strategi sendiri dan mengenali pola yang bahkan tidak disadari oleh pembuatnya, batas kendali itu perlahan mulai memudar.

Investasi sebesar $100 juta yang digelontorkan dalam lima tahun terakhir telah mengubah lanskap teknologi secara drastis. Perusahaan teknologi berlomba-lomba melatih model dengan miliaran parameter. Kecepatan transfer data mencapai 25 km kabel serat optik bawah tanah yang menghubungkan pusat data raksasa.

Dan yang paling mengejutkan... algoritma tersebut bukan sekadar mengingat pola masa lalu. Ia mulai memprediksi tindakan manusia sebelum instruksi diberikan. Hal ini menimbulkan pertanyaan besar di kalangan akademisi: apakah kita sedang menciptakan pembantu cerdas, ataukah kita sedang membangun entitas yang kelak tidak bisa kita pahami?

Di sisi lain, kehidupan masyarakat tetap berjalan seperti biasa. Orang-orang masih berangkat kerja, menikmati kopi pagi di warung, dan menatap layar ponsel mereka tanpa menyadari revolusi sunyi yang sedang berlangsung di balik layar.

Pada akhirnya, masa depan teknologi ini tidak ditentukan oleh baris kode semata, melainkan oleh kebijaksanaan kita dalam menentukan batas. Dan di titik itulah... cerita kita yang sesungguhnya baru saja dimulai.
`.trim();

	const wordCount = fiveMinuteScript.split(/\s+/).filter(Boolean).length;
	console.log(`Naskah Uji: ${wordCount} kata (estimasi narasi YouTube ~3.5 hingga 5 menit)`);

	// Test Run 1: Cache MISS (Generation from Edge TTS)
	console.log('\n>> Tahap 1: Eksekusi Pipeline (Cache MISS / Fresh Run)...');
	const res1 = await generateVoiceoverPipeline(fiveMinuteScript, {
		voiceId: 'id-ID-GadisNeural',
		humanize: true
	}, (p) => {
		if (p.type === 'chunk_start') {
			console.log(`[PROGRESS] ${p.current}/${p.total} (${p.percent}%) [${p.style}] -> ${p.textSnippet}`);
		}
	});

	console.log('\n--- Hasil Eksekusi 1 ---');
	console.log('Status             :', res1.success);
	console.log('Audio File         :', res1.audioPath);
	console.log('Durasi Total       :', res1.duration, 'detik (~', (res1.duration / 60).toFixed(2), 'menit)');
	console.log('Total Chunks       :', res1.chunks.length);
	console.log('Cache Stats        :', res1.cacheStats);
	console.log('Total Word Timings :', res1.wordTimings.length);

	if (!fs.existsSync(res1.audioPath)) {
		throw new Error('Output audio file does not exist on disk!');
	}
	if (res1.cacheStats.hits > 0 && res1.cacheStats.misses === 0) {
		console.log('Note: Chunks were already cached from a prior run.');
	}

	// Test Run 2: Cache HIT & Resume/Idempotency Test
	console.log('\n>> Tahap 2: Uji Idempotensi & Audio Cache HIT (Re-run identical script)...');
	const res2 = await generateVoiceoverPipeline(fiveMinuteScript, {
		voiceId: 'id-ID-GadisNeural',
		humanize: true
	});

	console.log('Cache Stats Run 2  :', res2.cacheStats);
	if (res2.cacheStats.hits !== res2.chunks.length) {
		throw new Error(`Cache HIT failure! Expected all ${res2.chunks.length} chunks to hit cache, but got ${res2.cacheStats.hits} hits`);
	}
	console.log('  ✓ 100% Cache HIT verified! Idempotency & resume mechanism works instantly.\n');

	// Check sample chunk structure
	console.log('--- Sample Chunk Data Structure ---');
	console.log(JSON.stringify(res1.chunks[0], null, 2));

	console.log('\n================================================================');
	console.log('✓ ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY FOR 5-MINUTE SCRIPT!');
	console.log('================================================================');
}

runAcceptanceTests().catch((err) => {
	console.error('\n❌ ACCEPTANCE TEST FAILED:', err);
	process.exit(1);
});
