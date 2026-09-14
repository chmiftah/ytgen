/**
 * Audio Engine Service
 * Handles background music selection, volume ducking, and synthetic speech synthesis fallback.
 */

export const BGM_TRACKS = [
	{
		id: 'none',
		name: 'Tanpa Background Music',
		url: '',
		mood: 'None'
	},
	{
		id: 'ambient-focus',
		name: 'Deep Ambient Focus',
		mood: 'Calm & Intellectual',
		url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
	},
	{
		id: 'cinematic-pulse',
		name: 'Cinematic Documentary Pulse',
		mood: 'Dramatic & Serious',
		url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3'
	},
	{
		id: 'lofi-chill',
		name: 'Late Night Lo-Fi',
		mood: 'Relaxing & Casual',
		url: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3'
	},
	{
		id: 'cyber-future',
		name: 'Cyber Future Beats',
		mood: 'Tech & Energetic',
		url: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3'
	}
];

class AudioController {
	constructor() {
		this.bgmAudio = null;
		this.voiceAudio = null;
		this.bgmVolume = 0.15;
		this.voiceVolume = 1.0;
		this.isDucking = false;
	}

	initBGM(url) {
		if (this.bgmAudio) {
			this.bgmAudio.pause();
			this.bgmAudio = null;
		}

		if (!url) return;

		this.bgmAudio = new Audio(url);
		this.bgmAudio.loop = true;
		this.bgmAudio.volume = this.bgmVolume;
	}

	setBGMVolume(vol) {
		this.bgmVolume = Math.max(0, Math.min(1, vol));
		if (this.bgmAudio) {
			this.bgmAudio.volume = this.isDucking ? this.bgmVolume * 0.3 : this.bgmVolume;
		}
	}

	playBGM() {
		if (this.bgmAudio && this.bgmAudio.paused) {
			this.bgmAudio.play().catch(() => {});
		}
	}

	pauseBGM() {
		if (this.bgmAudio) {
			this.bgmAudio.pause();
		}
	}

	seekBGM(time) {
		if (this.bgmAudio) {
			this.bgmAudio.currentTime = time % (this.bgmAudio.duration || 60);
		}
	}

	duckBGM(shouldDuck) {
		this.isDucking = shouldDuck;
		if (this.swellTimer) {
			clearTimeout(this.swellTimer);
			this.swellTimer = null;
		}
		if (this.bgmAudio) {
			const targetVol = shouldDuck ? this.bgmVolume * 0.3 : this.bgmVolume;
			this.bgmAudio.volume = targetVol;
		}
	}

	swellBGM(durationSec = 3.5) {
		if (this.swellTimer) {
			clearTimeout(this.swellTimer);
			this.swellTimer = null;
		}

		if (this.bgmAudio) {
			// Swell up volume to full/audible level for chapter transition
			const swelledVol = Math.min(1.0, Math.max(0.28, this.bgmVolume * 1.8));
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
