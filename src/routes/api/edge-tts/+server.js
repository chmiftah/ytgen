import { json } from '@sveltejs/kit';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { EDGE_TTS_VOICES, DEFAULT_EDGE_VOICE_ID } from '$lib/services/voiceService.js';
import { generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
import { getAudioEffectById } from '$lib/services/audioEffectService.js';

export async function GET() {
	return json({
		success: true,
		voices: EDGE_TTS_VOICES
	});
}

export async function POST({ request }) {
	let tts = null;
	try {
		const { 
			text, 
			voiceId = DEFAULT_EDGE_VOICE_ID, 
			rate, 
			pitch, 
			audioEffect = 'studio_podcast' 
		} = await request.json();

		if (!text || !text.trim()) {
			return json({ success: false, error: 'Teks voiceover wajib diisi' }, { status: 400 });
		}

		const cleanText = text.trim();
		const words = cleanText.split(/\s+/).filter(Boolean);

		const effectPreset = getAudioEffectById(audioEffect);
		const effectivePitch = pitch !== undefined && pitch !== null ? pitch : (effectPreset?.edgePitch || '0Hz');
		const effectiveRate = rate !== undefined && rate !== null ? rate : (effectPreset?.edgeRate || '0%');

		tts = new MsEdgeTTS();
		await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {
			wordBoundaryEnabled: true
		});

		const { audioStream, metadataStream } = tts.toStream(cleanText, {
			rate: effectiveRate,
			pitch: effectivePitch
		});

		const audioChunks = [];
		const rawBoundaries = [];

		audioStream.on('data', (chunk) => audioChunks.push(chunk));
		metadataStream.on('data', (data) => {
			try {
				const parsed = JSON.parse(data.toString());
				if (parsed.Metadata && Array.isArray(parsed.Metadata)) {
					for (const item of parsed.Metadata) {
						if (item.Type === 'WordBoundary' && item.Data && item.Data.text) {
							rawBoundaries.push(item.Data);
						}
					}
				}
			} catch (_) {}
		});

		await new Promise((resolve, reject) => {
			audioStream.on('end', resolve);
			audioStream.on('error', reject);
			metadataStream.on('error', reject);
		});

		// Close websocket connection
		try {
			tts.close();
			tts = null;
		} catch (_) {}

		const audioBuffer = Buffer.concat(audioChunks);
		if (audioBuffer.length === 0) {
			throw new Error('Edge TTS audio stream is empty');
		}

		// Convert tick offsets (100-nanosecond units) to seconds
		let wordTimings = rawBoundaries.map((b) => {
			const start = Number((b.Offset / 10000000).toFixed(3));
			const dur = Number((b.Duration / 10000000).toFixed(3));
			return {
				word: b.text?.Text || '',
				start,
				end: Number((start + dur).toFixed(3))
			};
		}).filter((w) => w.word.trim().length > 0);

		const estimatedDuration = Math.max(3.5, Number((words.length * 0.45).toFixed(2)));

		// Safety fallback if boundaries were not captured
		if (wordTimings.length === 0) {
			wordTimings = generateSyntheticWordTimings(words, estimatedDuration);
		}

		const duration = wordTimings.length > 0 
			? Number((wordTimings[wordTimings.length - 1].end + 0.25).toFixed(2)) 
			: estimatedDuration;

		const audioBase64 = audioBuffer.toString('base64');

		return json({
			success: true,
			audioUrl: `data:audio/mp3;base64,${audioBase64}`,
			wordTimings,
			duration,
			isRealVoice: true,
			provider: 'edge_tts',
			voiceId,
			audioEffect: effectPreset.id
		});
	} catch (error) {
		console.error('Edge TTS generation error:', error);
		if (tts) {
			try { tts.close(); } catch (_) {}
		}
		return json({
			success: false,
			error: `Edge TTS error: ${error.message || 'Gagal menghasilkan suara'}`
		}, { status: 500 });
	}
}
