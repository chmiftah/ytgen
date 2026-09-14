export const AUDIO_EFFECT_PRESETS = [
	{
		id: 'movie_trailer',
		name: 'Trailer Bioskop (Titan Narrator)',
		emoji: '🎬',
		description: 'Suara dewa bioskop IMAX: nada sangat berat (-55Hz), tempo tenang (-10%), sub-bass 75Hz menggelegar & surround stereo',
		tag: 'Epic Sinematik',
		edgePitch: '-55Hz',
		edgeRate: '-10%',
		sampleUrl: '/voice-samples/effect-movie_trailer.mp3',
		ffmpegFilter: 'bass=g=12:f=75:w=0.5,equalizer=f=3000:t=q:w=1.5:g=2,extrastereo=m=1.35,acompressor=threshold=-18dB:ratio=4:attack=5:release=80'
	},
	{
		id: 'cyber_jarvis',
		name: 'Cyberpunk AI (Jarvis Sci-Fi)',
		emoji: '🤖',
		description: 'Robot AI futuristik dengan metallic flanger resonance & artikulasi jernih ala Tony Stark / sci-fi movie',
		tag: 'Sci-Fi AI',
		edgePitch: '-8Hz',
		edgeRate: '-2%',
		sampleUrl: '/voice-samples/effect-cyber_jarvis.mp3',
		ffmpegFilter: 'flanger=delay=3:depth=2:regen=25:width=80:speed=0.6,equalizer=f=3200:t=q:w=1:g=3,acompressor=threshold=-14dB:ratio=3'
	},
	{
		id: 'creepy_horror',
		name: 'Horor Gaib (Creepypasta)',
		emoji: '💀',
		description: 'Sangat berat & lambat (-75Hz, -12%) dengan gema dingin goa misterius (cold cavernous reverb)',
		tag: 'Horor Ekstrem',
		edgePitch: '-75Hz',
		edgeRate: '-12%',
		sampleUrl: '/voice-samples/effect-creepy_horror.mp3',
		ffmpegFilter: 'bass=g=12:f=70:w=0.4,aecho=0.8:0.75:80|160:0.35|0.25,volume=1.2'
	},
	{
		id: 'storyteller',
		name: 'Storyteller Kuno (Kakek Bijak)',
		emoji: '📜',
		description: 'Intonasi mendongeng berwibawa, hangat & berkarakter untuk cerita legenda, sejarah & hikayat rakyat',
		tag: 'Storytelling',
		edgePitch: '-30Hz',
		edgeRate: '-8%',
		sampleUrl: '/voice-samples/effect-storyteller.mp3',
		ffmpegFilter: 'bass=g=8:f=100:w=0.5,equalizer=f=2400:t=q:w=1.2:g=-2,aecho=0.7:0.5:40:0.2,volume=1.3'
	},
	{
		id: 'studio_podcast',
		name: 'Studio Broadcast Pro (SM7B)',
		emoji: '🎙️',
		description: 'Vokal tebal, empuk, dan kompresi punchy Shure SM7B ala ruang rekaman podcast profesional',
		tag: 'Podcast & Edukasi',
		edgePitch: '-10Hz',
		edgeRate: '-2%',
		sampleUrl: '/voice-samples/effect-studio_podcast.mp3',
		ffmpegFilter: 'bass=g=8:f=100:w=0.6,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-16dB:ratio=4:attack=5:release=50'
	},
	{
		id: 'tactical_radio',
		name: 'Radio Taktis (Intercom Militer)',
		emoji: '📻',
		description: 'Transmisi walkie-talkie militer / pilot kokpit dengan bandpass filter dan saturasi analog',
		tag: 'Taktis Militer',
		edgePitch: '0Hz',
		edgeRate: '0%',
		sampleUrl: '/voice-samples/effect-tactical_radio.mp3',
		ffmpegFilter: 'highpass=f=450,lowpass=f=2600,acrusher=bits=10:mode=lin:aa=1,volume=2.2'
	},
	{
		id: 'natural',
		name: 'Natural / Clean',
		emoji: '🌿',
		description: 'Suara asli jernih tanpa modifikasi frekuensi atau kompresi tambahan',
		tag: 'Bawaan',
		edgePitch: '0Hz',
		edgeRate: '0%',
		sampleUrl: '',
		ffmpegFilter: ''
	}
];

export const DEFAULT_AUDIO_EFFECT_ID = 'movie_trailer';

export function getAudioEffectById(id) {
	return AUDIO_EFFECT_PRESETS.find((e) => e.id === id) || AUDIO_EFFECT_PRESETS[0];
}
