/**
 * Voice Service
 * Manages voices for Local F5-TTS, Microsoft Edge TTS, and ElevenLabs.
 */

export const F5_LOCAL_VOICES = [
	{
		id: 'f5-reporter',
		voiceKey: 'reporter',
		name: 'Reporter TV (Wanita Natural)',
		gender: 'Female',
		lang: 'id-ID',
		category: 'Berita & Jernih',
		description: 'Artikulasi jernih, formal, dan berwawasan – gaya presenter berita TV Indonesia yang natural',
		emoji: '🎙️',
		sampleUrl: '/voice-samples/f5-reporter.mp3',
		provider: 'f5_tts',
		badge: 'Lokal M1 (Alami)'
	},
	{
		id: 'f5-prabowo',
		voiceKey: 'prabowo',
		name: 'Prabowo (Pria Kharismatik)',
		gender: 'Male',
		lang: 'id-ID',
		category: 'Berat & Berwibawa',
		description: 'Suara pria berat, tegas, dan berwibawa – sangat cocok untuk dokumenter sejarah & narasi opini',
		emoji: '🏛️',
		sampleUrl: '/voice-samples/f5-prabowo.mp3',
		provider: 'f5_tts',
		badge: 'Lokal M1 (Alami)'
	},
	{
		id: 'f5-windah',
		voiceKey: 'windah',
		name: 'Windah (Pria Santai & Dinamis)',
		gender: 'Male',
		lang: 'id-ID',
		category: 'Kasual & Seru',
		description: 'Gaya bicara luwes, santai, dan ekspresif – cocok untuk konten hiburan, gaming & storytelling viral',
		emoji: '🎮',
		sampleUrl: '/voice-samples/f5-windah.mp3',
		provider: 'f5_tts',
		badge: 'Lokal M1 (Alami)'
	}
];

export const EDGE_TTS_VOICES = [
	{
		id: 'id-ID-GadisNeural',
		name: 'Gadis (Indonesia - Wanita)',
		gender: 'Female',
		lang: 'id-ID',
		category: 'Ramah & Jernih',
		description: 'Sangat natural, artikulasi jelas – ideal untuk video edukasi, cerita & penjelasan',
		emoji: '🇮🇩',
		sampleUrl: '/voice-samples/id-ID-GadisNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'id-ID-ArdiNeural',
		name: 'Ardi (Indonesia - Pria)',
		gender: 'Male',
		lang: 'id-ID',
		category: 'Tegas & Otoritatif',
		description: 'Mantap & profesional – cocok untuk dokumenter, berita, bisnis & fakta unik',
		emoji: '🇮🇩',
		sampleUrl: '/voice-samples/id-ID-ArdiNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'jv-ID-DimasNeural',
		name: 'Dimas (Jawa - Pria)',
		gender: 'Male',
		lang: 'jv-ID',
		category: 'Logat Jawa Halus',
		description: 'Suara pria dengan artikulasi dan aksen bahasa Jawa alami',
		emoji: '🇮🇩',
		sampleUrl: '/voice-samples/jv-ID-DimasNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'jv-ID-SitiNeural',
		name: 'Siti (Jawa - Wanita)',
		gender: 'Female',
		lang: 'jv-ID',
		category: 'Logat Jawa Lembut',
		description: 'Suara wanita dengan artikulasi dan aksen bahasa Jawa merdu',
		emoji: '🇮🇩',
		sampleUrl: '/voice-samples/jv-ID-SitiNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'su-ID-JajangNeural',
		name: 'Jajang (Sunda - Pria)',
		gender: 'Male',
		lang: 'su-ID',
		category: 'Logat Sunda Hangat',
		description: 'Suara pria berkarakter dengan intonasi Sunda yang luwes',
		emoji: '🇮🇩',
		sampleUrl: '/voice-samples/su-ID-JajangNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'su-ID-TutiNeural',
		name: 'Tuti (Sunda - Wanita)',
		gender: 'Female',
		lang: 'su-ID',
		category: 'Logat Sunda Luwes',
		description: 'Suara wanita ramah dengan logat Sunda natural',
		emoji: '🇮🇩',
		sampleUrl: '/voice-samples/su-ID-TutiNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'en-US-ChristopherNeural',
		name: 'Christopher (US - Pria)',
		gender: 'Male',
		lang: 'en-US',
		category: 'Deep Narrator',
		description: 'Gaya narator dokumenter berwibawa untuk audiens internasional',
		emoji: '🇺🇸',
		sampleUrl: '/voice-samples/en-US-ChristopherNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'en-US-JennyNeural',
		name: 'Jenny (US - Wanita)',
		gender: 'Female',
		lang: 'en-US',
		category: 'Warm & Engaging',
		description: 'Hangat, jernih, ekspresif – sangat nyaman didengar',
		emoji: '🇺🇸',
		sampleUrl: '/voice-samples/en-US-JennyNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'en-US-GuyNeural',
		name: 'Guy (US - Pria)',
		gender: 'Male',
		lang: 'en-US',
		category: 'Casual & Dynamic',
		description: 'Santai, dinamis & modern untuk konten YouTube viral',
		emoji: '🇺🇸',
		sampleUrl: '/voice-samples/en-US-GuyNeural.mp3',
		provider: 'edge_tts'
	},
	{
		id: 'en-US-AriaNeural',
		name: 'Aria (US - Wanita)',
		gender: 'Female',
		lang: 'en-US',
		category: 'Expressive & Clear',
		description: 'Artikulasi tinggi & ekspresi narasi hidup',
		emoji: '🇺🇸',
		sampleUrl: '/voice-samples/en-US-AriaNeural.mp3',
		provider: 'edge_tts'
	}
];

export const POPULAR_VOICES = [
	{
		id: 'pNInz6obpgDQGcFmaJgB',
		name: 'Adam',
		category: 'Narrator',
		description: 'Deep & Authoritative – ideal untuk dokumenter & tech explainer',
		emoji: '🎙️',
		sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/d6905d7a-dd26-4187-bfff-1bd3a5ea7cac.mp3',
		provider: 'elevenlabs'
	},
	{
		id: 'EXAVITQu4vr4xnSDxMaL',
		name: 'Sarah',
		category: 'Warm & Professional',
		description: 'Tenang, jernih & engaging – cocok untuk storytelling & edukasi',
		emoji: '🎤',
		sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3',
		provider: 'elevenlabs'
	},
	{
		id: 'TX3LPaxmHKxFdv7VOQHJ',
		name: 'Liam',
		category: 'Energetic & Crisp',
		description: 'Muda, dinamis & cepat – untuk konten viral YouTube modern',
		emoji: '⚡',
		sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3',
		provider: 'elevenlabs'
	},
	{
		id: 'JBFqnCBsd6RMkjVDRZzb',
		name: 'George',
		category: 'Deep & Conversational',
		description: 'Hangat & captivating – gaya storyteller untuk narasi panjang',
		emoji: '🎧',
		sampleUrl: 'https://api.us.elevenlabs.io/v1/voices/JBFqnCBsd6RMkjVDRZzb/previews/audio?payload=eyJ2b2ljZV9zb3VyY2UiOiJwcmVtYWRlIiwiZmlsZW5hbWUiOiJlNjIwNmQxYS0wNzIxLTQ3ODctYWFmYi0wNmE2ZTcwNWNhYzUubXAzIiwidGltZXN0YW1wIjoxNzg5MzY1NjAwMDAwMDAwfQ%3D%3D',
		provider: 'elevenlabs'
	},
	{
		id: 'SOYHLrjzK2X1ezoPC6cr',
		name: 'Harry',
		category: 'Intense & Expressive',
		description: 'Dramatis & emosional – tepat untuk konten storytelling impactful',
		emoji: '🎭',
		sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/SOYHLrjzK2X1ezoPC6cr/86d178f6-f4b6-4e0e-85be-3de19f490794.mp3',
		provider: 'elevenlabs'
	},
	{
		id: 'CwhRBWXzGAHq8TQ4Fs17',
		name: 'Roger',
		category: 'Commanding',
		description: 'Laid-back & resonant – cocok untuk konten motivasi & bisnis',
		emoji: '💼',
		sampleUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/58ee3ff5-f6f2-4628-93b8-e38eb31806b0.mp3',
		provider: 'elevenlabs'
	}
];

export const DEFAULT_F5_VOICE_ID = 'f5-reporter';
export const DEFAULT_EDGE_VOICE_ID = 'id-ID-ArdiNeural';
export const DEFAULT_ELEVEN_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';

export function isF5Voice(voiceId) {
	if (!voiceId) return false;
	return voiceId.startsWith('f5-') || F5_LOCAL_VOICES.some((v) => v.id === voiceId);
}

export function isEdgeVoice(voiceId) {
	if (!voiceId) return false;
	return EDGE_TTS_VOICES.some((v) => v.id === voiceId) || voiceId.includes('Neural');
}

export function getVoiceById(voiceId) {
	return (
		F5_LOCAL_VOICES.find((v) => v.id === voiceId) ||
		EDGE_TTS_VOICES.find((v) => v.id === voiceId) ||
		POPULAR_VOICES.find((v) => v.id === voiceId) ||
		null
	);
}

export function getVoiceEngine(voiceId, explicitMode = null) {
	if (explicitMode && ['f5_tts', 'edge_tts', 'elevenlabs'].includes(explicitMode)) {
		return explicitMode;
	}
	if (isF5Voice(voiceId)) return 'f5_tts';
	if (isEdgeVoice(voiceId)) return 'edge_tts';
	return 'elevenlabs';
}
