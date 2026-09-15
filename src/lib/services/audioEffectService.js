/**
 * Audio Effect & Vocal DSP Mastering Service
 * Upgrades Edge TTS from raw/robotic into unique, crystal-clear, broadcast-quality voices.
 */

export const AUDIO_EFFECT_PRESETS = [
	{
		id: 'cinematic_deep',
		name: 'Dokumenter Sinematik (Deep Authority)',
		emoji: '🎬',
		description: 'Suara berat, berwibawa & berkarakter ala narator film dokumenter Netflix / Vox. Bass dada empuk, mid jernih & artikulasi tajam.',
		tag: 'Signature · Populer',
		edgePitch: '-14Hz',
		edgeRate: '-4%',
		sampleUrl: '/voice-samples/effect-cinematic_deep.mp3',
		ffmpegFilter: 'bass=g=5:f=110:w=0.6,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.0:g=1.5,acompressor=threshold=-17dB:ratio=3:attack=5:release=60:makeup=1.5dB'
	},
	{
		id: 'studio_podcast',
		name: 'Studio Shure SM7B (Super Jernih & Tebal)',
		emoji: '🎙️',
		description: 'Vokal empuk, jernih tanpa desah kasar, artikulasi konsonan kristal khas mikrofon siaran radio & podcast profesional.',
		tag: 'Podcast & Edukasi',
		edgePitch: '-8Hz',
		edgeRate: '-2%',
		sampleUrl: '/voice-samples/effect-studio_podcast.mp3',
		ffmpegFilter: 'bass=g=4:f=130:w=0.6,equalizer=f=400:t=q:w=1.2:g=-1.5,equalizer=f=3000:t=q:w=1.0:g=1.5,acompressor=threshold=-16dB:ratio=2.8:attack=5:release=50:makeup=1.5dB'
	},
	{
		id: 'energetic_creator',
		name: 'YouTube Modern (Punchy & Viral)',
		emoji: '⚡',
		description: 'Pacing cepat, energik, vokal renyah dan menembus instrumen musik dengan lantang. Sangat cocok untuk konten viral & tech explainer.',
		tag: 'Tech & Modern',
		edgePitch: '-3Hz',
		edgeRate: '+4%',
		sampleUrl: '/voice-samples/effect-energetic_creator.mp3',
		ffmpegFilter: 'equalizer=f=200:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.0:g=2.0,acompressor=threshold=-16dB:ratio=3:attack=4:release=40:makeup=1.5dB'
	},
	{
		id: 'storyteller',
		name: 'Storyteller Intim (Filosofi & Kisah)',
		emoji: '📜',
		description: 'Intonasi mendalam, tenang dan intim dengan nuansa ruang akustik hangat. Memberi kesan bercerita langsung di dekat pendengar.',
		tag: 'Storytelling & Kisah',
		edgePitch: '-18Hz',
		edgeRate: '-6%',
		sampleUrl: '/voice-samples/effect-storyteller.mp3',
		ffmpegFilter: 'bass=g=5:f=100:w=0.6,equalizer=f=450:t=q:w=1.0:g=-1.5,equalizer=f=2800:t=q:w=1.0:g=1.2,aecho=0.6:0.3:25:0.12,acompressor=threshold=-16dB:ratio=2.5:attack=8:release=70:makeup=1.5dB'
	},
	{
		id: 'movie_trailer',
		name: 'Trailer Bioskop (Epic Blockbuster)',
		emoji: '🏛️',
		description: 'Karakter narator film blockbuster: nada bariton berwibawa & megah (-28Hz, -4%), sub-bass hangat 95Hz, artikulasi bersih & bulat.',
		tag: 'Epic Sinematik',
		edgePitch: '-28Hz',
		edgeRate: '-4%',
		sampleUrl: '/voice-samples/effect-movie_trailer.mp3',
		ffmpegFilter: 'bass=g=5:f=95:w=0.6,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.0:g=1.5,acompressor=threshold=-16dB:ratio=3:attack=5:release=65:makeup=1.5dB'
	},
	{
		id: 'creepy_horror',
		name: 'Horor Creepypasta (Goa Dingin)',
		emoji: '💀',
		description: 'Sangat berat, dingin, dan mencekam dengan pantulan ruang misterius. Ideal untuk cerita konspirasi, misteri gelap, dan horor.',
		tag: 'Horor & Konspirasi',
		edgePitch: '-70Hz',
		edgeRate: '-12%',
		sampleUrl: '/voice-samples/effect-creepy_horror.mp3',
		ffmpegFilter: 'bass=g=8:f=75:w=0.5,aecho=0.7:0.5:60|120:0.25|0.18,acompressor=threshold=-16dB:ratio=3:makeup=1dB'
	},
	{
		id: 'natural',
		name: 'Natural Studio (Clean)',
		emoji: '🌿',
		description: 'Suara asli jernih dengan leveling kompresi lembut dan EQ presence agar tetap stabil di atas background music.',
		tag: 'Bawaan Jernih',
		edgePitch: '0Hz',
		edgeRate: '0%',
		sampleUrl: '/voice-samples/effect-natural.mp3',
		ffmpegFilter: 'equalizer=f=3000:t=q:w=1.0:g=1.0,acompressor=threshold=-15dB:ratio=2.2:attack=5:release=50:makeup=1dB'
	}
];

export const DEFAULT_AUDIO_EFFECT_ID = 'cinematic_deep';

export function getAudioEffectById(id) {
	return AUDIO_EFFECT_PRESETS.find((e) => e.id === id) || AUDIO_EFFECT_PRESETS[0];
}
