export const AUDIO_EFFECT_PRESETS = [
	{
		id: 'studio_podcast',
		name: 'Studio Podcast (SM7B)',
		emoji: '🎙️',
		description: 'Bass hangat (+5dB), vokal tebal, dan kompresi punchy ala mikrofon radio broadcast',
		tag: 'Rekomendasi',
		edgePitch: '-4Hz',
		edgeRate: '0%',
		ffmpegFilter: 'bass=g=5:f=110:w=0.6,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-16dB:ratio=3.5:attack=5:release=50'
	},
	{
		id: 'deep_baritone',
		name: 'Deep Baritone (Suara Berat)',
		emoji: '🗿',
		description: 'Nada lebih rendah & berat, berwibawa dan maskulin untuk dokumenter & motivasi',
		tag: 'Dokumenter',
		edgePitch: '-16Hz',
		edgeRate: '-3%',
		ffmpegFilter: 'bass=g=7:f=100:w=0.5,equalizer=f=2800:t=q:w=1.2:g=1.5,acompressor=threshold=-18dB:ratio=4:attack=5:release=50'
	},
	{
		id: 'dark_mystery',
		name: 'Dark Mystery (Horor & Kasus)',
		emoji: '🕵️',
		description: 'Berat, dingin, dengan reverb tipis mencekam untuk kisah misteri & investigasi',
		tag: 'Misteri',
		edgePitch: '-24Hz',
		edgeRate: '-6%',
		ffmpegFilter: 'bass=g=8:f=90:w=0.5,aecho=0.8:0.7:50:0.25'
	},
	{
		id: 'crisp_viral',
		name: 'Crisp Viral (Renyah & Cepat)',
		emoji: '⚡',
		description: 'Treble renyah, kompresi rapat, tempo sedikit lebih energik untuk YouTube modern',
		tag: 'Viral',
		edgePitch: '+4Hz',
		edgeRate: '+4%',
		ffmpegFilter: 'equalizer=f=4000:t=q:w=1.5:g=3,acompressor=threshold=-14dB:ratio=4:attack=2:release=40'
	},
	{
		id: 'retro_radio',
		name: 'Vintage Radio / Walkie-Talkie',
		emoji: '📻',
		description: 'Efek suara transmisi radio jadul / walkie-talkie militer (bandpass filter)',
		tag: 'Kilas Balik',
		edgePitch: '0Hz',
		edgeRate: '0%',
		ffmpegFilter: 'highpass=f=450,lowpass=f=3200,volume=1.8'
	},
	{
		id: 'natural',
		name: 'Natural / Clean',
		emoji: '🌿',
		description: 'Suara asli jernih tanpa modifikasi frekuensi atau kompresi tambahan',
		tag: 'Bawaan',
		edgePitch: '0Hz',
		edgeRate: '0%',
		ffmpegFilter: ''
	}
];

export const DEFAULT_AUDIO_EFFECT_ID = 'studio_podcast';

export function getAudioEffectById(id) {
	return AUDIO_EFFECT_PRESETS.find((e) => e.id === id) || AUDIO_EFFECT_PRESETS[0];
}
