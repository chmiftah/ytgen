import { json } from '@sveltejs/kit';
import { alignElevenLabsTimestamps, generateSyntheticWordTimings } from '$lib/services/subtitleService.js';
import { POPULAR_VOICES } from '$lib/services/voiceService.js';

export async function GET({ url }) {
	const apiKey = url.searchParams.get('apiKey');

	if (apiKey && apiKey.trim().length > 10) {
		try {
			const [voicesRes, subRes] = await Promise.all([
				fetch('https://api.elevenlabs.io/v1/voices', {
					headers: { 'xi-api-key': apiKey.trim() }
				}),
				fetch('https://api.elevenlabs.io/v1/user/subscription', {
					headers: { 'xi-api-key': apiKey.trim() }
				}).catch(() => null)
			]);

			if (voicesRes.ok) {
				const data = await voicesRes.json();
				const fetchedVoices = data.voices.map((v) => ({
					id: v.voice_id,
					name: v.name,
					category: v.category || 'Custom',
					description: v.description || v.labels?.accent || 'ElevenLabs Voice'
				}));

				let subscription = null;
				if (subRes && subRes.ok) {
					const subData = await subRes.json();
					const charCount = subData.character_count || 0;
					const charLimit = subData.character_limit || 0;
					subscription = {
						tier: subData.tier || 'Free',
						characterCount: charCount,
						characterLimit: charLimit,
						remainingCharacters: Math.max(0, charLimit - charCount),
						percentUsed: charLimit > 0 ? Math.min(100, Math.round((charCount / charLimit) * 100)) : 0,
						resetUnix: subData.next_character_count_reset_unix || null,
						status: subData.status || 'active'
					};
				}

				return json({ success: true, voices: fetchedVoices, subscription });
			}
		} catch (err) {
			console.warn('Failed to fetch custom ElevenLabs data:', err);
		}
	}

	return json({ success: true, voices: POPULAR_VOICES, subscription: null });
}

export async function POST({ request }) {
	try {
		const { text, voiceId = 'pNInz6obpgDQGcFmaJgB', apiKey, stability = 0.5, similarityBoost = 0.75 } = await request.json();

		if (!text || !text.trim()) {
			return json({ success: false, error: 'Text is required' }, { status: 400 });
		}

		const cleanText = text.trim();
		const words = cleanText.split(/\s+/).filter(Boolean);

		// If user has provided an ElevenLabs API key
		if (apiKey && apiKey.trim().length > 10) {
			try {
				const ttsRes = await fetch(
					`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
					{
						method: 'POST',
						headers: {
							'xi-api-key': apiKey.trim(),
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							text: cleanText,
							model_id: 'eleven_multilingual_v2',
							voice_settings: {
								stability: Number(stability),
								similarity_boost: Number(similarityBoost)
							}
						})
					}
				);

				if (ttsRes.ok) {
					const data = await ttsRes.json();
					const audioBase64 = data.audio_base64;
					const alignment = data.alignment;
					const wordTimings = alignElevenLabsTimestamps(cleanText, alignment);
					
					const duration = wordTimings.length > 0 
						? wordTimings[wordTimings.length - 1].end 
						: Math.max(3.5, words.length * 0.45);

					return json({
						success: true,
						audioUrl: `data:audio/mp3;base64,${audioBase64}`,
						wordTimings,
						duration: Number(duration.toFixed(2)),
						isRealVoice: true
					});
				} else {
					const errorData = await ttsRes.json().catch(() => ({}));
					const errorMsg = errorData?.detail?.message || errorData?.detail || `HTTP ${ttsRes.status}`;
					console.warn('ElevenLabs API error:', errorMsg);
					// Return specific error so frontend can show it to user
					return json({
						success: false,
						error: `ElevenLabs: ${errorMsg}`,
						isRealVoice: false
					}, { status: 200 }); // 200 so frontend can read the JSON
				}
			} catch (err) {
				console.error('ElevenLabs request error:', err);
				return json({
					success: false,
					error: `ElevenLabs request failed: ${err.message}`,
					isRealVoice: false
				}, { status: 200 });
			}
		}

		// Fallback mode when no API key is provided
		const estimatedDuration = Math.max(3.5, Number((words.length * 0.45).toFixed(2)));
		const syntheticTimings = generateSyntheticWordTimings(words, estimatedDuration);

		return json({
			success: true,
			audioUrl: null, // Signals browser speech synthesis fallback
			wordTimings: syntheticTimings,
			duration: estimatedDuration,
			isRealVoice: false,
			message: apiKey ? 'ElevenLabs error, using fallback' : 'Using Web Speech fallback'
		});
	} catch (error) {
		console.error('Error in /api/elevenlabs:', error);
		return json({ success: false, error: error.message }, { status: 500 });
	}
}
