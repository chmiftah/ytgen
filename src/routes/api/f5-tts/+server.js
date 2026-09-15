import { json } from '@sveltejs/kit';
import { F5_LOCAL_VOICES, DEFAULT_F5_VOICE_ID } from '$lib/services/voiceService.js';
import { generateSyntheticWordTimings } from '$lib/services/subtitleService.js';

const F5_SERVER_URL = 'http://localhost:8888';

function getWavDuration(buffer) {
	try {
		if (!buffer || buffer.length < 44) return 0;
		if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
			return 0;
		}
		const byteRate = buffer.readUInt32LE(28);
		let offset = 12;
		while (offset < buffer.length - 8) {
			const chunkId = buffer.toString('ascii', offset, offset + 4);
			const chunkSize = buffer.readUInt32LE(offset + 4);
			if (chunkId === 'data') {
				const dataSize = Math.min(chunkSize, buffer.length - (offset + 8));
				return byteRate > 0 ? Number((dataSize / byteRate).toFixed(2)) : 0;
			}
			offset += 8 + chunkSize;
		}
		if (byteRate > 0) {
			return Number(((buffer.length - 44) / byteRate).toFixed(2));
		}
	} catch (e) {
		console.warn('Failed calculating WAV duration:', e);
	}
	return 0;
}

/**
 * GET /api/f5-tts
 * Checks if local F5-TTS FastAPI server is currently running and healthy
 */
export async function GET() {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 1800);

		const res = await fetch(`${F5_SERVER_URL}/api/health`, {
			signal: controller.signal
		});
		clearTimeout(timeoutId);

		if (res.ok) {
			const data = await res.json();
			return json({
				success: true,
				online: true,
				device: data.device || 'mps',
				voices: F5_LOCAL_VOICES
			});
		}

		return json({
			success: true,
			online: false,
			message: `Server merespons status ${res.status}`,
			voices: F5_LOCAL_VOICES
		});
	} catch (err) {
		return json({
			success: true,
			online: false,
			message: 'Server F5-TTS Lokal belum aktif di port 8888',
			voices: F5_LOCAL_VOICES
		});
	}
}

/**
 * POST /api/f5-tts
 * Generates natural Indonesian speech using local F5-TTS server
 */
export async function POST({ request }) {
	try {
		const {
			text,
			voiceId = DEFAULT_F5_VOICE_ID,
			speed = 1.0,
			chapterIntro = '',
			chapterPause = 0,
			outroPause = 0
		} = await request.json();

		const cleanNarration = (text || '').trim();
		const cleanIntro = (chapterIntro || '').trim();

		if (!cleanNarration && !cleanIntro) {
			return json({ success: false, error: 'Teks voiceover wajib diisi' }, { status: 400 });
		}

		// Map voiceId to local server voice key: 'f5-reporter' -> 'reporter'
		const matchedVoice = F5_LOCAL_VOICES.find((v) => v.id === voiceId);
		const voiceKey = matchedVoice?.voiceKey || (voiceId.startsWith('f5-') ? voiceId.replace('f5-', '') : 'reporter');

		// Combine intro and narration naturally with pause punctuation
		let fullText = cleanNarration;
		if (cleanIntro && cleanNarration) {
			fullText = `${cleanIntro}. ... ${cleanNarration}`;
		} else if (cleanIntro) {
			fullText = cleanIntro;
		}

		// Call local FastAPI endpoint
		let response;
		try {
			response = await fetch(`${F5_SERVER_URL}/api/tts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: fullText,
					voice: voiceKey,
					speed: Number(speed) || 1.0
				})
			});
		} catch (fetchErr) {
			return json({
				success: false,
				error: 'Server F5-TTS Lokal belum berjalan di port 8888. Silakan jalankan `./run_server.sh` di folder `/Users/user/development/local-tts`'
			}, { status: 503 });
		}

		if (!response.ok) {
			const errText = await response.text().catch(() => '');
			return json({
				success: false,
				error: `F5-TTS local server error (${response.status}): ${errText || 'Gagal menghasilkan audio'}`
			}, { status: response.status });
		}

		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = Buffer.from(arrayBuffer);

		// Calculate exact audio duration from WAV header
		let duration = getWavDuration(audioBuffer);
		if (!duration || duration <= 0) {
			// Fallback duration estimation: ~140 words per minute for Indonesian
			const wordsCount = fullText.split(/\s+/).filter(Boolean).length;
			duration = Number(Math.max(2.0, (wordsCount / 2.3)).toFixed(2));
		}

		// Append scene outro breathing space (default ~0.6s)
		const effectiveDuration = Number((duration + Math.max(0.4, Number(outroPause || 0))).toFixed(2));

		// Generate synthetic word timings for karaoke player sync
		const wordsList = fullText.split(/\s+/).filter(Boolean);
		const wordTimings = generateSyntheticWordTimings(wordsList, effectiveDuration, !!cleanIntro, Number(chapterPause || 0));

		const audioBase64 = audioBuffer.toString('base64');

		return json({
			success: true,
			audioUrl: `data:audio/wav;base64,${audioBase64}`,
			wordTimings,
			duration: effectiveDuration,
			isRealVoice: true,
			provider: 'f5_tts',
			voiceId
		});
	} catch (error) {
		console.error('F5-TTS generation error:', error);
		return json({
			success: false,
			error: `F5-TTS Error: ${error.message || 'Gagal menghasilkan audio'}`
		}, { status: 500 });
	}
}
