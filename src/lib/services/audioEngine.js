/**
 * Audio Engine Service
 * Handles background music selection, volume ducking, and synthetic speech synthesis fallback.
 */

export const BGM_TRACKS = [
	{
		id: 'lofi-chill',
		name: 'Midnight Chill Lofi',
		mood: 'Santai, Hangat & Malam Hari',
		url: '/bgm/bgm-lofi-chill.mp3',
		badge: '🌙 Rekomendasi Overthinking'
	},
	{
		id: 'stickman-playful',
		name: 'Playful Cartoon Stickman',
		mood: 'Ceria, Lincah & Menghibur',
		url: '/bgm/bgm-stickman-playful.mp3',
		badge: '🎨 Khas Kartun'
	},
	{
		id: 'ambient-focus',
		name: 'Deep Ambient Focus',
		mood: 'Tenang & Reflektif',
		url: '/bgm/bgm-ambient.mp3',
		badge: 'Fokus'
	},
	{
		id: 'local-documentary',
		name: 'Dokumenter Sinematik',
		mood: 'Serius & Mengalir',
		url: '/bgm/bgm-soundhelix-1.mp3',
		badge: 'Dokumenter'
	},
	{
		id: 'inspiring-story',
		name: 'Uplifting Inspiring',
		mood: 'Inspiratif & Motivasi',
		url: '/bgm/bgm-inspiring.mp3',
		badge: 'Inspirasi'
	},
	{
		id: 'dramatic-tension',
		name: 'Dramatic Tension Pulse',
		mood: 'Tegang & Menantang',
		url: '/bgm/bgm-tension.mp3',
		badge: 'Tegang'
	},
	{
		id: 'none',
		name: 'Tanpa Musik Latar',
		url: '',
		mood: 'Hening'
	}
];

class AudioController {
	constructor() {
		this.bgmAudio = null;
		this.voiceAudio = null;
		this.bgmVolume = 0.10;
		this.voiceVolume = 1.0;
		this.isDucking = false;
		this.currentUrl = null;
		this.swellTimer = null;
	}

	initBGM(url) {
		if (!url) {
			if (this.bgmAudio) {
				this.bgmAudio.pause();
				this.bgmAudio = null;
			}
			this.currentUrl = null;
			return;
		}

		// If audio element is already created for this exact URL, do not recreate or pause!
		if (this.bgmAudio && this.currentUrl === url) {
			const targetVol = this.isDucking ? Math.max(0.02, this.bgmVolume * 0.35) : this.bgmVolume;
			this.bgmAudio.volume = Math.max(0, Math.min(1, targetVol));
			return;
		}

		const wasPlaying = this.bgmAudio && !this.bgmAudio.paused;
		if (this.bgmAudio) {
			this.bgmAudio.pause();
			this.bgmAudio = null;
		}

		this.currentUrl = url;
		this.bgmAudio = new Audio(url);
		this.bgmAudio.loop = true;
		const initialVol = this.isDucking ? Math.max(0.02, this.bgmVolume * 0.35) : this.bgmVolume;
		this.bgmAudio.volume = Math.max(0, Math.min(1, initialVol));

		if (wasPlaying) {
			this.playBGM();
		}
	}

	setBGMVolume(vol) {
		this.bgmVolume = Math.max(0, Math.min(1, vol));
		if (this.bgmAudio) {
			const targetVol = this.isDucking ? Math.max(0.02, this.bgmVolume * 0.35) : this.bgmVolume;
			this.bgmAudio.volume = Math.max(0, Math.min(1, targetVol));
		}
	}

	playBGM() {
		if (this.bgmAudio) {
			const p = this.bgmAudio.play();
			if (p && typeof p.catch === 'function') {
				p.catch((err) => {
					console.warn('[AudioEngine] BGM play error/blocked:', err);
				});
			}
		}
	}

	pauseBGM() {
		if (this.bgmAudio) {
			this.bgmAudio.pause();
		}
	}

	seekBGM(time) {
		if (this.bgmAudio && this.bgmAudio.duration) {
			this.bgmAudio.currentTime = time % this.bgmAudio.duration;
		}
	}

	duckBGM(shouldDuck) {
		this.isDucking = shouldDuck;
		if (this.swellTimer) {
			clearTimeout(this.swellTimer);
			this.swellTimer = null;
		}
		if (this.bgmAudio) {
			// Deep ducking: drops background music volume while voice is speaking, with an audible minimum floor
			const targetVol = shouldDuck ? Math.max(0.02, this.bgmVolume * 0.35) : this.bgmVolume;
			this.bgmAudio.volume = Math.max(0, Math.min(1, targetVol));
		}
	}

	swellBGM(durationSec = 3.5) {
		if (this.swellTimer) {
			clearTimeout(this.swellTimer);
			this.swellTimer = null;
		}

		if (this.bgmAudio) {
			// Swell up volume to audible level for chapter transition (max 0.20)
			const swelledVol = Math.min(0.20, Math.max(0.06, this.bgmVolume * 2.2));
			this.bgmAudio.volume = swelledVol;
			this.isDucking = false;

			// Automatically duck down when chapter intro finishes and narration begins
			this.swellTimer = setTimeout(() => {
				this.duckBGM(true);
				this.swellTimer = null;
			}, durationSec * 1000);
		}
	}
}

export const audioController = new AudioController();

/**
 * Synthesizes a cinematic chapter transition stinger / riser using Web Audio API
 * (sub-bass boom + warm chime swell) with zero external assets or latency.
 */
export function playChapterStinger() {
	if (typeof window === 'undefined') return;
	try {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();
		const now = ctx.currentTime;

		// 1. Deep Sub-Bass Impact
		const subOsc = ctx.createOscillator();
		const subGain = ctx.createGain();
		subOsc.type = 'sine';
		subOsc.frequency.setValueAtTime(110, now);
		subOsc.frequency.exponentialRampToValueAtTime(45, now + 1.8);
		subGain.gain.setValueAtTime(0.35, now);
		subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
		subOsc.connect(subGain);
		subGain.connect(ctx.destination);
		subOsc.start(now);
		subOsc.stop(now + 1.8);

		// 2. Shimmering Chime Riser
		const chimeOsc = ctx.createOscillator();
		const chimeGain = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.setValueAtTime(880, now);
		filter.Q.setValueAtTime(3, now);

		chimeOsc.type = 'triangle';
		chimeOsc.frequency.setValueAtTime(440, now);
		chimeOsc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

		chimeGain.gain.setValueAtTime(0.001, now);
		chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.3);
		chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

		chimeOsc.connect(filter);
		filter.connect(chimeGain);
		chimeGain.connect(ctx.destination);
		chimeOsc.start(now);
		chimeOsc.stop(now + 2.0);
	} catch (err) {
		console.warn('Stinger audio synthesis failed:', err);
	}
}

/**
 * Generate speech in browser using Web Speech API as instant zero-cost fallback
 */
export function synthesizeSpeechFallback(text, lang = 'id-ID') {
	return new Promise((resolve) => {
		if (typeof window === 'undefined' || !window.speechSynthesis) {
			resolve(null);
			return;
		}

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = lang;
		utterance.rate = 1.05;
		utterance.pitch = 1.0;

		const voices = window.speechSynthesis.getVoices();
		const matchedVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.startsWith('en'));
		if (matchedVoice) utterance.voice = matchedVoice;

		resolve(utterance);
	});
}
